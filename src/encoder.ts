export type Bencode =
  | string
  | number
  | null
  | BencodeDictionary
  | Bencode[];
export type BencodeDictionary = { [property: string]: Bencode };

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

function encodeDict(dict: BencodeDictionary): string {
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
