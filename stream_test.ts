import { asserts } from "./deps.ts";
//import { Bencode } from "./types.ts";
import * as sut from "./stream.ts";

Deno.test("stringToReadableStream", async () => {
  const stream = sut.stringToReadableStream("hello");
  const reader = stream.getReader();

  const { value } = await reader.read();
  asserts.assertEquals(value, new Uint8Array([104, 101, 108, 108, 111]));
});

Deno.test("bencodeToReadableStream", async () => {
  const stream = sut.bencodeToReadableStream({ foo: "bar" });
  const reader = stream.getReader();

  const { value } = await reader.read();
  asserts.assertEquals(value, { foo: "bar" });
});
