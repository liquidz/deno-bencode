import { asserts, BufWriter, StringWriter } from "../deps.ts";
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

Deno.test("write", async () => {
  const strWriter = new StringWriter();
  const writer = new BufWriter(strWriter);

  await sut.write(writer, "foo");
  asserts.assertEquals(strWriter.toString(), "3:foo");
  await sut.write(writer, 123);
  asserts.assertEquals(strWriter.toString(), "3:fooi123e");
});
