import { describe, it, expect } from "vitest"
import { cn } from "./cn"

describe("cn — class name utility", () => {
  it("returns a single class unchanged", () => { expect(cn("foo")).toBe("foo") })
  it("joins multiple classes with a space", () => { expect(cn("foo", "bar")).toBe("foo bar") })
  it("ignores falsy values", () => { expect(cn("foo", false, undefined, null, "", "bar")).toBe("foo bar") })
  it("deduplicates conflicting Tailwind classes (last wins)", () => { expect(cn("p-2", "p-4")).toBe("p-4") })
  it("handles conditional object syntax from clsx", () => { expect(cn({ foo: true, bar: false, baz: true })).toBe("foo baz") })
  it("handles array syntax", () => { expect(cn(["foo", "bar"], "baz")).toBe("foo bar baz") })
  it("merges conflicting text-color utilities", () => { expect(cn("text-red-500", "text-blue-600")).toBe("text-blue-600") })
})