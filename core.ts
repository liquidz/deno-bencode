import { BufReader } from "https://deno.land/std@0.88.0/io/bufio.ts";
import { StringReader } from "https://deno.land/std@0.88.0/io/readers.ts";
//import { Denops } from "https://deno.land/x/denops@v0.5/denops.ts";
//
//
//(def #^{:const true} i     105)
// (def #^{:const true} l     108)
// (def #^{:const true} d     100)
// (def #^{:const true} comma 44)
// (def #^{:const true} minus 45)

const COMMA = 44;
const E = 101;
const COLON = 58;

const enum TokenType {
  NUMBER = 105, // 'i'
  LIST = 108, // 'l'
  DICTIONARY = 100, // 'd'
  STRING,
}

type Bencode =
  | string
  | number
  | null
  | { [property: string]: Bencode }
  | Bencode[];

function encodeString(s: string): string {
  return `${s.length}:${s}`;
}

function encodeNumber(n: number): string {
  return `i${n}e`;
}

function encodeList(list: Bencode[]): string {
  const encoded = list.map((x: Bencode) => {
    return encode(x);
  });
  return `l${encoded.join("")}e`;
}

function encodeDict(dict: { [property: string]: Bencode }): string {
  const encoded = Object.entries(dict).map(([k, v]) => {
    return encode(k) + encode(v);
  });
  return `d${encoded.join("")}e`;
}

export function encode(x: Bencode): string {
  if (typeof x === "string") {
    return encodeString(x);
  } else if (typeof x === "number") {
    return encodeNumber(x);
  } else if (typeof x === "object") {
    if (x === null) {
      return "";
    } else if (x instanceof Array) {
      return encodeList(x);
    } else {
      return encodeDict(x);
    }
  }
  return "";
}

function stringDropLast(s: string, n: number) {
  return s.substring(0, s.length - n);
}

async function readNumber(input: BufReader): Promise<number> {
  const s = await input.readString("e");
  if (s === null) {
    throw Error("bencode: FIXME");
  }

  return parseInt(stringDropLast(s, 1));
}

async function readString(
  input: BufReader,
  firstByte: number,
): Promise<string> {
  const s = await input.readString(":");
  if (s === null) {
    throw Error("bencode: FIXME");
  }

  const strLen = parseInt(
    String.fromCharCode(firstByte) + stringDropLast(s, 1),
  );
  const buf = new Uint8Array(strLen);
  const res = await input.readFull(buf);
  if (res === null) {
    throw Error("bencode: FIXME");
  }

  const dec = new TextDecoder();
  return dec.decode(res);
}

// async function readToken(input: BufReader): Promise<[number | null, TokenType]> {
//   const b = await input.readByte();
//
//   if (b === TokenType.NUMBER) {
//   } else if (b === TokenType.LIST) {
//   } else if (b === TokenType.DICTIONARY) {
//   } else if (b === TokenType.STRING) {
//   }
// }

async function decode(input: BufReader): Promise<Bencode> {
  const b = await input.readByte();

  if (b === null) {
    return null;
  } else if (b === TokenType.NUMBER) {
    return await readNumber(input);
    // } else if (b === TokenType.LIST) {
    // } else if (b === TokenType.DICTIONARY) {
  } else {
    return await readString(input, b);
    // STRING
  }
}

console.log("hello");

const input = new BufReader(new StringReader("i32e3:foo"));
console.log(await decode(input));
console.log(await decode(input));
console.log(await decode(input));
//console.log(await readNumber(buf));
// const result = await buf.readByte();
// console.log(`readByte: ${result}`);
//
// console.log(String.fromCharCode(51));
