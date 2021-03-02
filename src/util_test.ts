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
