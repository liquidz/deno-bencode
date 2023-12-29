import { Bencode, BencodeObject } from "./types.ts";
import { stringToReadableStream } from "./stream.ts";
import { COLON_CODE, D_CODE, E_CODE, I_CODE, L_CODE } from "./constant.ts";

const textDecoder = new TextDecoder();

function readNumber(buf: Uint8Array): {
  result: number | undefined;
  rest: Uint8Array;
} {
  const index = buf.findIndex((v) => v === E_CODE);
  if (index === -1) {
    return { result: undefined, rest: buf };
  }
  try {
    const result = parseInt(textDecoder.decode(buf.slice(1, index)));
    return { result, rest: buf.slice(index + 1) };
  } catch (_) {
    throw Error("bencode: Failed to read number");
  }
}

function readArray(buf: Uint8Array): {
  result: Bencode[] | undefined;
  rest: Uint8Array;
} {
  const result: Bencode[] = [];
  let tmp = buf.slice(1);
  if (tmp.length === 0) {
    return { result: undefined, rest: buf };
  }

  while (tmp[0] !== E_CODE) {
    const item = read(tmp);
    if (item.result == null) {
      return { result: undefined, rest: buf };
    }
    result.push(item.result);
    tmp = item.rest;
  }
  return { result, rest: tmp.slice(1) };
}

function readObject(buf: Uint8Array): {
  result: BencodeObject | undefined;
  rest: Uint8Array;
} {
  const result: BencodeObject = {};
  let tmp = buf.slice(1);
  if (tmp.length === 0) {
    return { result: undefined, rest: buf };
  }

  while (tmp[0] !== E_CODE) {
    const keyItem = read(tmp);
    if (keyItem.result == null) {
      return { result: undefined, rest: buf };
    }
    if (typeof keyItem.result !== "string") {
      throw Error("bencode: Failed to read object");
    }

    const valItem = read(keyItem.rest);
    if (valItem.result == null) {
      return { result: undefined, rest: buf };
    }

    result[keyItem.result] = valItem.result;

    tmp = valItem.rest;
  }

  return { result, rest: tmp.slice(1) };
}

function read(buf: Uint8Array): {
  result: Bencode | undefined;
  rest: Uint8Array;
} {
  const firstByte = buf[0];
  if (firstByte === I_CODE) {
    return readNumber(buf);
  } else if (firstByte === L_CODE) {
    return readArray(buf);
  } else if (firstByte === D_CODE) {
    return readObject(buf);
  } else {
    return readString(buf);
  }
}

function readString(buf: Uint8Array): {
  result: string | undefined;
  rest: Uint8Array;
} {
  const colonIndex = buf.findIndex((v) => v === COLON_CODE);
  if (colonIndex === -1) {
    return { result: undefined, rest: buf };
  }

  try {
    const len = parseInt(textDecoder.decode(buf.slice(0, colonIndex)));

    if (buf.length < colonIndex + len + 1) {
      return { result: undefined, rest: buf };
    }

    const result = textDecoder.decode(
      buf.slice(colonIndex + 1, colonIndex + len + 1),
    );
    return { result, rest: buf.slice(colonIndex + len + 1) };
  } catch (_) {
    throw Error("bencode: Failed to read string");
  }
}

export class Uint8ArrayToBencodeStream extends TransformStream<
  Uint8Array,
  Bencode
> {
  #buf = new Uint8Array();

  constructor() {
    super({
      transform: (chunk, controller) => {
        this.#handle(chunk, controller);
      },
      flush: (controller) => {
        while (this.#buf.length > 0) {
          const { result, rest } = read(this.#buf);
          if (result == null) {
            break;
          }
          controller.enqueue(result);
          this.#buf = rest;
        }
      },
    });
  }

  #handle(
    chunk: Uint8Array,
    controller: TransformStreamDefaultController<Bencode>,
  ) {
    this.#buf = Uint8Array.of(...this.#buf, ...chunk);
    while (this.#buf.length > 0) {
      const { result, rest } = read(this.#buf);
      if (result == null) {
        break;
      }
      controller.enqueue(result);
      this.#buf = rest;
    }
  }
}

export async function decode(s: string): Promise<Bencode> {
  const reader = stringToReadableStream(s).pipeThrough(
    new Uint8ArrayToBencodeStream(),
  ).getReader();

  const { value } = await reader.read();
  return value ?? null;
}
