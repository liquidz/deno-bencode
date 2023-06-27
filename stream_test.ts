import { asserts } from "./deps.ts";
import { Bencode } from "./types.ts";
import * as sut from "./stream.ts";

const textEncoder = new TextEncoder();

function stringToReadableStream(
  str: string,
  chunkSize = -1,
): ReadableStream<Uint8Array> {
  let position = 0;
  const bytes = textEncoder.encode(str);

  return new ReadableStream({
    pull(controller) {
      if (position === bytes.length) {
        controller.close();
        return;
      }

      const len = chunkSize > 0 ? chunkSize : Math.min(
        Math.floor(Math.random() * 2) + 1,
        bytes.length - position,
      );
      controller.enqueue(new Uint8Array(bytes.slice(position, position + len)));
      position += len;
    },
  });
}

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

Deno.test("decode string", async () => {
  asserts.assertEquals(await streamTest("0:"), [""]);
  asserts.assertEquals(await streamTest("3:foo"), ["foo"]);
  asserts.assertEquals(await streamTest("9:ふぉお"), ["ふぉお"]);
});

Deno.test("decode number", async () => {
  asserts.assertEquals(await streamTest("i123e"), [123]);
  asserts.assertEquals(await streamTest("i-123e"), [-123]);
  asserts.assertEquals(await streamTest("i12.3e"), [12]);
  asserts.assertEquals(await streamTest("i-12.3e"), [-12]);
});

Deno.test("decode array", async () => {
  asserts.assertEquals(await streamTest("le"), [[]]);
  asserts.assertEquals(await streamTest("llee"), [[[]]]);
  asserts.assertEquals(await streamTest("l3:fooe"), [["foo"]]);
  asserts.assertEquals(await streamTest("l3:fooi123ee"), [["foo", 123]]);
});

Deno.test("decode object", async () => {
  asserts.assertEquals(await streamTest("de"), [{}]);
  asserts.assertEquals(await streamTest("d3:fooi123ee"), [{ foo: 123 }]);
  asserts.assertEquals(await streamTest("d3:fooli123ed3:bar3:bazeee"), [
    {
      foo: [123, { bar: "baz" }],
    },
  ]);
});

Deno.test("multiple read", async () => {
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
