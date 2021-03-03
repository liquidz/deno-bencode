import { asserts } from "../deps.ts";
import * as decoder from "./decoder.ts";
import * as encoder from "./encoder.ts";
import * as sut from "./util.ts";

Deno.test("isArray", async () => {
  asserts.assert(!sut.isArray(await decoder.decode(encoder.encode("foo"))));
  asserts.assert(!sut.isArray(await decoder.decode(encoder.encode(123))));
  asserts.assert(
    !sut.isArray(await decoder.decode(encoder.encode({ foo: "bar" }))),
  );

  const result = await decoder.decode(encoder.encode([123, "foo"]));
  asserts.assert(sut.isArray(result));

  if (sut.isArray(result)) {
    asserts.assertEquals(result[0], 123);
    asserts.assertEquals(result[1], "foo");
  }
});

Deno.test("isDictionary", async () => {
  asserts.assert(
    !sut.isDictionary(await decoder.decode(encoder.encode("foo"))),
  );
  asserts.assert(!sut.isDictionary(await decoder.decode(encoder.encode(123))));
  asserts.assert(
    !sut.isDictionary(await decoder.decode(encoder.encode([123, "foo"]))),
  );

  const result = await decoder.decode(encoder.encode({ foo: 123, bar: "baz" }));
  asserts.assert(sut.isDictionary(result));

  if (sut.isDictionary(result)) {
    asserts.assertEquals(result["foo"], 123);
    asserts.assertEquals(result["bar"], "baz");
  }
});
