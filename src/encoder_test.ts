import { asserts } from "../deps.ts";
import * as sut from "./encoder.ts";

Deno.test("encode", () => {
  asserts.assertEquals(sut.encode("foo"), "3:foo");
  asserts.assertEquals(sut.encode(123), "i123e");
  asserts.assertEquals(sut.encode(["foo", 123]), "l3:fooi123ee");
  asserts.assertEquals(
    sut.encode({ foo: "bar", bar: 123 }),
    "d3:foo3:bar3:bari123ee",
  );

  asserts.assertEquals(
    sut.encode(["foo", [123, { bar: "baz" }]]),
    "l3:fooli123ed3:bar3:bazeee",
  );
});
