import { asserts, BufReader, StringReader } from "../deps.ts";
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

Deno.test("decode list", async () => {
  asserts.assertEquals(await sut.decode("le"), []);
  asserts.assertEquals(await sut.decode("llee"), [[]]);
  asserts.assertEquals(await sut.decode("l3:fooe"), ["foo"]);
  asserts.assertEquals(await sut.decode("l3:fooi123ee"), ["foo", 123]);
});

Deno.test("decode dictionary", async () => {
  asserts.assertEquals(await sut.decode("de"), {});
  asserts.assertEquals(await sut.decode("d3:fooi123ee"), { foo: 123 });
  asserts.assertEquals(await sut.decode("d3:fooli123ed3:bar3:bazeee"), {
    foo: [123, { bar: "baz" }],
  });
});

Deno.test("read", async () => {
  const reader = new BufReader(new StringReader("3:fooi123e"));
  asserts.assertEquals(await sut.read(reader), "foo");
  asserts.assertEquals(await sut.read(reader), 123);
});
