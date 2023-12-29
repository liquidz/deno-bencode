import { Bencode } from "./types.ts";

export function stringToReadableStream(s: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(s);
  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoded);
      controller.close();
    },
  });
}

export function bencodeToReadableStream(b: Bencode): ReadableStream<Bencode> {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(b);
      controller.close();
    },
  });
}
