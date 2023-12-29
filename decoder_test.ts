import { asserts } from "./deps.ts";
import { Bencode } from "./types.ts";
import { stringToReadableStream } from "./stream.ts";
import * as sut from "./decoder.ts";

Deno.test("decode string", async () => {
  asserts.assertEquals(await sut.decode("0:"), "");
  asserts.assertEquals(await sut.decode("3:foo"), "foo");
  asserts.assertEquals(await sut.decode("9:ふぉお"), "ふぉお");
});

Deno.test("decode number", async () => {
  asserts.assertEquals(await sut.decode("i123e"), 123);
  asserts.assertEquals(await sut.decode("i-123e"), -123);
  asserts.assertEquals(await sut.decode("i12.3e"), 12);
  asserts.assertEquals(await sut.decode("i-12.3e"), -12);
});

Deno.test("decode array", async () => {
  asserts.assertEquals(await sut.decode("le"), []);
  asserts.assertEquals(await sut.decode("llee"), [[]]);
  asserts.assertEquals(await sut.decode("l3:fooe"), ["foo"]);
  asserts.assertEquals(await sut.decode("l3:fooi123ee"), ["foo", 123]);
});

Deno.test("decode object", async () => {
  asserts.assertEquals(await sut.decode("de"), {});
  asserts.assertEquals(await sut.decode("d3:fooi123ee"), { foo: 123 });
  asserts.assertEquals(await sut.decode("d3:fooli123ed3:bar3:bazeee"), {
    foo: [123, { bar: "baz" }],
  });
});

async function streamTest(s: string): Promise<Bencode[]> {
  const result: Bencode[] = [];
  const stream = stringToReadableStream(s).pipeThrough(
    new sut.Uint8ArrayToBencodeStream(),
  );
  for await (const v of stream) {
    result.push(v);
  }
  return result;
}

Deno.test("decode string via stream", async () => {
  asserts.assertEquals(await streamTest("0:"), [""]);
  asserts.assertEquals(await streamTest("3:foo"), ["foo"]);
  asserts.assertEquals(await streamTest("9:ふぉお"), ["ふぉお"]);
});

Deno.test("decode number via stream", async () => {
  asserts.assertEquals(await streamTest("i123e"), [123]);
  asserts.assertEquals(await streamTest("i-123e"), [-123]);
  asserts.assertEquals(await streamTest("i12.3e"), [12]);
  asserts.assertEquals(await streamTest("i-12.3e"), [-12]);
});

Deno.test("decode array via stream", async () => {
  asserts.assertEquals(await streamTest("le"), [[]]);
  asserts.assertEquals(await streamTest("llee"), [[[]]]);
  asserts.assertEquals(await streamTest("l3:fooe"), [["foo"]]);
  asserts.assertEquals(await streamTest("l3:fooi123ee"), [["foo", 123]]);
});

Deno.test("decode object via stream", async () => {
  asserts.assertEquals(await streamTest("de"), [{}]);
  asserts.assertEquals(await streamTest("d3:fooi123ee"), [{ foo: 123 }]);
  asserts.assertEquals(await streamTest("d3:fooli123ed3:bar3:bazeee"), [
    {
      foo: [123, { bar: "baz" }],
    },
  ]);
});

Deno.test("multiple read via stream", async () => {
  asserts.assertEquals(await streamTest("3:fooi123e"), ["foo", 123]);

  const src = await Deno.open("./test_input.txt");
  const result: Bencode[] = [];
  const stream = src.readable.pipeThrough(new sut.Uint8ArrayToBencodeStream());
  for await (const v of stream) {
    result.push(v);
  }
  asserts.assertEquals(result, [
    "",
    "foo",
    1,
    -1,
    1,
    -1,
    [],
    [[]],
    ["foo"],
    {},
    { foo: 1 },
    { foo: { bar: {} } },
  ]);
});
