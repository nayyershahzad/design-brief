import { describe, it, expect } from "vitest";
import { hexToHsl, pxToRem, parseHex } from "../src/util/color.js";

describe("hexToHsl", () => {
  it("converts the primaries and grays", () => {
    expect(hexToHsl("#000000")).toBe("0 0% 0%");
    expect(hexToHsl("#FFFFFF")).toBe("0 0% 100%");
    expect(hexToHsl("#FF0000")).toBe("0 100% 50%");
    expect(hexToHsl("#00FF00")).toBe("120 100% 50%");
    expect(hexToHsl("#0000FF")).toBe("240 100% 50%");
  });

  it("converts the terminal background", () => {
    expect(hexToHsl("#0E0E1A")).toBe("240 30% 8%");
  });

  it("supports shorthand hex", () => {
    expect(hexToHsl("#fff")).toBe("0 0% 100%");
  });

  it("rejects invalid hex", () => {
    expect(() => parseHex("nope")).toThrow();
    expect(() => parseHex("#12")).toThrow();
  });
});

describe("pxToRem", () => {
  it("converts px to rem at a 16px base", () => {
    expect(pxToRem("6px")).toBe("0.375rem");
    expect(pxToRem("16px")).toBe("1rem");
    expect(pxToRem("0px")).toBe("0rem");
    expect(pxToRem("0.5px")).toBe("0.03125rem");
  });

  it("rejects non-numeric values", () => {
    expect(() => pxToRem("auto")).toThrow();
  });
});
