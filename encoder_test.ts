import { asserts } from "./deps.ts";
import { Bencode } from "./types.ts";
import { bencodeToReadableStream } from "./stream.ts";
import * as sut from "./encoder.ts";

Deno.test("encode string", () => {
  asserts.assertEquals(sut.encode("foo"), "3:foo");
  asserts.assertEquals(sut.encode("ふぉお"), "9:ふぉお");
  asserts.assertEquals(sut.encode(""), "0:");
});

Deno.test("encode number", () => {
  asserts.assertEquals(sut.encode(123), "i123e");
  asserts.assertEquals(sut.encode(-123), "i-123e");
  asserts.assertEquals(sut.encode(12.3), "i12e");
  asserts.assertEquals(sut.encode(-12.3), "i-12e");
});

Deno.test("encode list", () => {
  asserts.assertEquals(sut.encode([]), "le");
  // c.f. https://github.com/nrepl/bencode/blob/v1.1.0/test/bencode/core_test.clj#L154
  asserts.assertEquals(sut.encode(null), "le");
  asserts.assertEquals(sut.encode(["foo", 123]), "l3:fooi123ee");
});

Deno.test("encode dictionary", () => {
  asserts.assertEquals(sut.encode({}), "de");
  asserts.assertEquals(sut.encode({ foo: 123 }), "d3:fooi123ee");

  asserts.assertEquals(
    sut.encode({ foo: [123, { bar: "baz" }] }),
    "d3:fooli123ed3:bar3:bazeee",
  );
});

async function streamTest(b: Bencode): Promise<string[]> {
  const result: string[] = [];
  const stream = bencodeToReadableStream(b).pipeThrough(
    new sut.BencodeToStringStream(),
  );
  for await (const v of stream) {
    result.push(v);
  }
  return result;
}

Deno.test("encode string via stream", async () => {
  asserts.assertEquals(await streamTest("foo"), ["3:foo"]);
  asserts.assertEquals(await streamTest("ふぉお"), ["9:ふぉお"]);
  asserts.assertEquals(await streamTest(""), ["0:"]);
});

Deno.test("encode number via stream", async () => {
  asserts.assertEquals(await streamTest(123), ["i123e"]);
  asserts.assertEquals(await streamTest(-123), ["i-123e"]);
  asserts.assertEquals(await streamTest(12.3), ["i12e"]);
  asserts.assertEquals(await streamTest(-12.3), ["i-12e"]);
});

Deno.test("encode list via stream", async () => {
  asserts.assertEquals(await streamTest([]), ["le"]);
  // c.f. https://github.com/nrepl/bencode/blob/v1.1.0/test/bencode/core_test.clj#L154
  asserts.assertEquals(await streamTest(null), ["le"]);
  asserts.assertEquals(await streamTest(["foo", 123]), ["l3:fooi123ee"]);
});

Deno.test("encode dictionary via stream", async () => {
  asserts.assertEquals(await streamTest({}), ["de"]);
  asserts.assertEquals(await streamTest({ foo: 123 }), ["d3:fooi123ee"]);

  asserts.assertEquals(
    await streamTest({ foo: [123, { bar: "baz" }] }),
    ["d3:fooli123ed3:bar3:bazeee"],
  );
});
