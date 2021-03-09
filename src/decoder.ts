import { BufReader, StringReader } from "../deps.ts";
import { Bencode, BencodeObject } from "./encoder.ts";

const E = "e";
const COLON = ":";

const D_CODE = 100;
const E_CODE = E.charCodeAt(0);
const I_CODE = 105;
const L_CODE = 108;

const textDecoder = new TextDecoder();

function stringDropLast(s: string, n: number) {
  return s.substring(0, s.length - n);
}

async function readNumber(input: BufReader): Promise<number> {
  const s = await input.readString(E);
  if (s === null) {
    throw Error("bencode: Failed to read number");
  }

  return parseInt(stringDropLast(s, 1));
}

async function readString(
  input: BufReader,
  firstByte: number,
): Promise<string> {
  const s = await input.readString(COLON);
  if (s === null) {
    throw Error("bencode: Failed to read string length");
  }

  const strLen = parseInt(
    String.fromCharCode(firstByte) + stringDropLast(s, 1),
  );
  const buf = new Uint8Array(strLen);
  const res = await input.readFull(buf);
  if (res === null) {
    throw Error("bencode: Failed to read string");
  }

  return textDecoder.decode(res);
}

async function readArray(input: BufReader): Promise<Bencode[]> {
  const res: Bencode[] = [];

  while (true) {
    const b = await input.readByte();

    if (b === null) {
      throw Error("bencode: Failed to read array");
    } else if (b === E_CODE) {
      break;
    } else {
      res.push(await readBody(input, b));
    }
  }
  return res;
}

async function readObject(input: BufReader): Promise<BencodeObject> {
  const res: BencodeObject = {};
  while (true) {
    const kb = await input.readByte();
    if (kb === null) {
      throw Error("bencode: Failed to read object key");
    } else if (kb === E_CODE) {
      break;
    }
    const key = await readString(input, kb);

    const vb = await input.readByte();
    if (vb === null) {
      throw Error("bencode: Failed to read object value");
    }
    const value = await readBody(input, vb);

    res[key] = value;
  }
  return res;
}

async function readBody(
  input: BufReader,
  readByte: number,
): Promise<Bencode> {
  if (readByte === I_CODE) {
    return await readNumber(input);
  } else if (readByte === L_CODE) {
    return await readArray(input);
  } else if (readByte === D_CODE) {
    return await readObject(input);
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
  return await readBody(input, b);
}
