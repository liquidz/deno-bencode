export type Bencode =
  | string
  | number
  | null
  | BencodeObject
  | Bencode[];

export type BencodeObject = { [property: string]: Bencode };
