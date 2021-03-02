import { Bencode, BencodeDictionary } from "./encoder.ts";

export function isArray(x: Bencode): x is Bencode[] {
  return (typeof x === "object") && (x instanceof Array);
}

export function isDictionary(x: Bencode): x is BencodeDictionary {
  return (typeof x === "object") && !(x instanceof Array);
}
