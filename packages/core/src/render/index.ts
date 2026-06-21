import type { Direction } from "../schema.js";

/**
 * Pure functions: a Direction in, plain serializable prop/style objects out.
 * These are how previews draw sample screens WITHOUT any AI and WITHOUT a
 * network call — the playground feeds these straight into React elements.
 */

export type RenderStyle = Record<string, string>;

function bodySize(d: Direction): string {
  return `${d.typography.scale[1] ?? 13}px`;
}

function smallSize(d: Direction): string {
  return `${d.typography.scale[0] ?? 11}px`;
}

function largeSize(d: Direction): string {
  return `${d.typography.scale[d.typography.scale.length - 1] ?? 28}px`;
}

function heaviestWeight(d: Direction): string {
  return String(d.typography.weights[d.typography.weights.length - 1] ?? 500);
}

// --- Button ---------------------------------------------------------------

export type ButtonVariant = "primary" | "ghost";

export interface ButtonProps {
  variant: ButtonVariant;
  label: string;
  style: RenderStyle;
}

export function renderButton(
  d: Direction,
  opts: { variant?: ButtonVariant; label?: string } = {},
): ButtonProps {
  const variant = opts.variant ?? "primary";
  const label = opts.label ?? (variant === "primary" ? "Save" : "Cancel");
  const base: RenderStyle = {
    height: d.density.rowHeight,
    paddingLeft: d.density.cellPaddingX,
    paddingRight: d.density.cellPaddingX,
    borderRadius: d.shape.radius,
    fontFamily: d.typography.fontSans,
    fontSize: bodySize(d),
    fontWeight: heaviestWeight(d),
  };
  if (variant === "primary") {
    return {
      variant,
      label,
      style: {
        ...base,
        background: d.color.accent.primary,
        color: d.color.accent.primaryForeground,
        border: `${d.shape.borderWidth} solid ${d.color.accent.primary}`,
      },
    };
  }
  return {
    variant,
    label,
    style: {
      ...base,
      background: "transparent",
      color: d.color.text.primary,
      border: `${d.shape.borderWidth} solid ${d.color.surface.border}`,
    },
  };
}

// --- Input ----------------------------------------------------------------

export interface InputProps {
  placeholder: string;
  style: RenderStyle;
}

export function renderInput(d: Direction, opts: { placeholder?: string } = {}): InputProps {
  return {
    placeholder: opts.placeholder ?? "Search…",
    style: {
      height: d.density.rowHeight,
      paddingLeft: d.density.cellPaddingX,
      paddingRight: d.density.cellPaddingX,
      borderRadius: d.shape.radius,
      border: `${d.shape.borderWidth} solid ${d.color.surface.border}`,
      background: d.color.surface.raised,
      color: d.color.text.primary,
      fontFamily: d.typography.fontSans,
      fontSize: bodySize(d),
    },
  };
}

// --- Table row ------------------------------------------------------------

export interface TableCell {
  value: string;
  numeric?: boolean;
}

export interface TableRowProps {
  style: RenderStyle;
  cells: Array<{ value: string; style: RenderStyle }>;
}

export function renderTableRow(d: Direction, cells: TableCell[]): TableRowProps {
  return {
    style: {
      height: d.density.rowHeight,
      borderBottom: `${d.shape.borderWidth} solid ${d.color.surface.border}`,
      background: d.color.surface.base,
    },
    cells: cells.map((c) => ({
      value: c.value,
      style: {
        paddingLeft: d.density.cellPaddingX,
        paddingRight: d.density.cellPaddingX,
        paddingTop: d.density.cellPaddingY,
        paddingBottom: d.density.cellPaddingY,
        fontFamily: c.numeric ? d.typography.fontMono : d.typography.fontSans,
        fontVariantNumeric: c.numeric ? "tabular-nums" : "normal",
        textAlign: c.numeric ? "right" : "left",
        color: d.color.text.primary,
        fontSize: bodySize(d),
      },
    })),
  };
}

// --- Metric card ----------------------------------------------------------

export type Trend = "up" | "down" | "flat";

export interface MetricCardProps {
  data: { label: string; value: string; delta: string; trend: Trend };
  container: RenderStyle;
  label: RenderStyle;
  value: RenderStyle;
  delta: RenderStyle;
}

export function renderMetricCard(
  d: Direction,
  data: { label: string; value: string; delta: string; trend?: Trend },
): MetricCardProps {
  const trend = data.trend ?? "flat";
  const deltaColor =
    trend === "up"
      ? d.color.semantic.success
      : trend === "down"
        ? d.color.semantic.danger
        : d.color.text.secondary;
  return {
    data: { label: data.label, value: data.value, delta: data.delta, trend },
    container: {
      background: d.color.surface.raised,
      border: `${d.shape.borderWidth} solid ${d.color.surface.border}`,
      borderRadius: d.shape.radiusLarge,
      padding: d.density.cellPaddingX,
    },
    label: {
      color: d.color.text.secondary,
      textTransform: "uppercase",
      fontFamily: d.typography.fontSans,
      fontSize: smallSize(d),
    },
    value: {
      color: d.color.text.primary,
      fontFamily: d.typography.fontMono,
      fontVariantNumeric: "tabular-nums",
      fontSize: largeSize(d),
    },
    delta: {
      color: deltaColor,
      fontFamily: d.typography.fontMono,
      fontSize: bodySize(d),
    },
  };
}
