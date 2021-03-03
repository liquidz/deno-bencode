import { Bencode, BencodeObject } from "./encoder.ts";

export function isArray(x: Bencode): x is Bencode[] {
  return (typeof x === "object") && (x instanceof Array);
}

export function isObject(x: Bencode): x is BencodeObject {
  return (typeof x === "object") && !(x instanceof Array);
}
