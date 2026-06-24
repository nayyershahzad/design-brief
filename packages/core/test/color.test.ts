import { describe, it, expect } from "vitest";
import { contrastRatio, hexToHsl, hueName, pxToRem, parseHex } from "../src/util/color.js";

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

describe("contrastRatio", () => {
  it("black on white is 21:1", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 1);
  });

  it("identical colors are 1:1", () => {
    expect(contrastRatio("#123456", "#123456")).toBeCloseTo(1, 5);
  });

  it("is symmetric", () => {
    expect(contrastRatio("#0A0A0B", "#F4F4F5")).toBeCloseTo(contrastRatio("#F4F4F5", "#0A0A0B"), 6);
  });

  it("matches the known grain-dark text/base pair (~18:1)", () => {
    expect(contrastRatio("#F4F4F5", "#0A0A0B")).toBeGreaterThan(17);
  });
});

describe("hueName", () => {
  it("names the accent hue families", () => {
    expect(hueName("#00fdff")).toBe("cyan");
    expect(hueName("#B6F23D")).toBe("lime");
    expect(hueName("#2563EB")).toBe("blue");
    expect(hueName("#E8590C")).toBe("orange");
  });

  it("names neutrals", () => {
    expect(hueName("#FFFFFF")).toBe("near-white");
    expect(hueName("#000000")).toBe("near-black");
    expect(hueName("#808080")).toBe("gray");
  });
});
