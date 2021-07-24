import { BufWriter } from "./deps.ts";
import { Bencode, BencodeObject } from "./types.ts";

const textEncoder = new TextEncoder();

function encodeString(s: string): string {
  return `${textEncoder.encode(s).length}:${s}`;
}

function encodeNumber(n: number): string {
  const i = (n > 0) ? Math.floor(n) : Math.ceil(n);
  return `i${i}e`;
}

function encodeArray(arr: Bencode[]): string {
  const encoded = arr.map((x: Bencode) => {
    return encode(x);
  });
  return `l${encoded.join("")}e`;
}

function encodeObject(dict: BencodeObject): string {
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
      // c.f. https://github.com/nrepl/bencode/blob/v1.1.0/test/bencode/core_test.clj#L154
      return encodeArray([]);
    } else if (x instanceof Array) {
      return encodeArray(x);
    } else {
      return encodeObject(x);
    }
  }
  return "";
}

export async function write(output: BufWriter, x: Bencode): Promise<number> {
  const n = await output.write(textEncoder.encode(encode(x)));
  await output.flush();
  return n;
}
