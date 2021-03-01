import * as t from "https://deno.land/std@0.87.0/testing/asserts.ts";
import * as sut from "./core.ts";

Deno.test("encode", () => {
  t.assertEquals(sut.encode("foo"), "3:foo");
  t.assertEquals(sut.encode(123), "i123e");
  t.assertEquals(sut.encode(["foo", 123]), "l3:fooi123ee");
  t.assertEquals(
    sut.encode({ foo: "bar", bar: 123 }),
    "d3:foo3:bar3:bari123ee",
  );

  t.assertEquals(
    sut.encode(["foo", [123, { bar: "baz" }]]),
    "l3:fooli123ed3:bar3:bazeee",
  );
});
