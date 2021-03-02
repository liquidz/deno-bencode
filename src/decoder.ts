import { BufReader, StringReader } from "../deps.ts";
import { Bencode, BencodeDictionary } from "./encoder.ts";

const D = 100;
const E = 101;
const I = 105;
const L = 108;

const textDecoder = new TextDecoder();

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

  return textDecoder.decode(res);
}

async function readList(input: BufReader): Promise<Bencode[]> {
  let res: Bencode[] = [];

  while (true) {
    const b = await input.readByte();

    if (b === null) {
      throw Error("bencode: FIXME");
    } else if (b === E) {
      break;
    } else {
      res.push(await decodeBody(input, b));
    }
  }
  return res;
}

async function readDictionary(input: BufReader): Promise<BencodeDictionary> {
  let res: BencodeDictionary = {};
  while (true) {
    const kb = await input.readByte();
    if (kb === null) {
      throw Error("bencode: FIXME");
    } else if (kb === E) {
      break;
    }
    const key = await readString(input, kb);
    const value = await read(input);

    res[key] = value;
  }
  return res;
}

async function decodeBody(
  input: BufReader,
  readByte: number,
): Promise<Bencode> {
  if (readByte === I) {
    return await readNumber(input);
  } else if (readByte === L) {
    return await readList(input);
  } else if (readByte === D) {
    return await readDictionary(input);
  } else {
    return await readString(input, readByte);
  }
}

export function decode(s: string): Promise<Bencode> {
  return read(new BufReader(new StringReader(s)));
}

export async function read(input: BufReader): Promise<Bencode> {
  const b = await input.readByte();
  if (b === null) {
    return null;
  }
  return await decodeBody(input, b);
}
