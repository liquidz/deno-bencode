import { asserts, BufReader, StringReader } from "../deps.ts";
import * as enc from "./encoder.ts";
import * as sut from "./decoder.ts";

Deno.test("decode", async () => {
  asserts.assertEquals(
    await sut.decode(new BufReader(new StringReader(enc.encode("foo")))),
    "foo",
  );

  asserts.assertEquals(
    await sut.decode(new BufReader(new StringReader(enc.encode(123)))),
    123,
  );

  asserts.assertEquals(
    await sut.decode(new BufReader(new StringReader(enc.encode(["foo", 123])))),
    ["foo", 123],
  );

  asserts.assertEquals(
    await sut.decode(
      new BufReader(new StringReader(enc.encode({ foo: "bar", bar: 123 }))),
    ),
    { foo: "bar", bar: 123 },
  );
});
