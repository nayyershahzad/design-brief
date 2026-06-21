import { describe, it, expect } from "vitest";
import {
  renderButton,
  renderInput,
  renderTableRow,
  renderMetricCard,
} from "../src/render/index.js";
import { terminal } from "../src/presets/index.js";

describe("render functions", () => {
  it("renderButton primary uses accent fill + foreground", () => {
    const b = renderButton(terminal, { variant: "primary" });
    expect(b.style.background).toBe(terminal.color.accent.primary);
    expect(b.style.color).toBe(terminal.color.accent.primaryForeground);
  });

  it("renderButton ghost is transparent with a border", () => {
    const b = renderButton(terminal, { variant: "ghost" });
    expect(b.style.background).toBe("transparent");
    expect(b.style.border).toContain(terminal.color.surface.border);
  });

  it("renderTableRow marks numeric cells mono + right-aligned", () => {
    const row = renderTableRow(terminal, [{ value: "Name" }, { value: "42", numeric: true }]);
    expect(row.cells[1]?.style.fontFamily).toBe(terminal.typography.fontMono);
    expect(row.cells[1]?.style.textAlign).toBe("right");
    expect(row.cells[0]?.style.fontFamily).toBe(terminal.typography.fontSans);
  });

  it("renderMetricCard renders the value in mono and colors the delta by trend", () => {
    const up = renderMetricCard(terminal, { label: "Revenue", value: "1,204", delta: "+3%", trend: "up" });
    expect(up.value.fontFamily).toBe(terminal.typography.fontMono);
    expect(up.delta.color).toBe(terminal.color.semantic.success);

    const down = renderMetricCard(terminal, { label: "Errors", value: "12", delta: "-1%", trend: "down" });
    expect(down.delta.color).toBe(terminal.color.semantic.danger);
  });

  it("is pure / deterministic", () => {
    expect(renderInput(terminal)).toEqual(renderInput(terminal));
    expect(renderButton(terminal)).toEqual(renderButton(terminal));
  });
});
