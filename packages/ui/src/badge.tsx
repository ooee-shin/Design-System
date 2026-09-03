import type { ReactNode } from "react";

import { cn } from "./utils";

export type BadgeTone = "neutral" | "accent" | "warning" | "danger" | "success" | "info";
export type BadgeAppearance = "tonal" | "solid" | "fill";
export type BadgeColor = "slate" | "gray" | "zinc" | "neutral" | "stone" | "red" | "orange" | "amber" | "yellow" | "lime" | "green" | "emerald" | "teal" | "cyan" | "sky" | "blue" | "indigo" | "violet" | "purple" | "fuchsia" | "pink" | "rose";
export type BadgeSize = "xsmall" | "small" | "medium";
export type BadgeShape = "pill" | "rounded";

type CommonProps = {
  className?: string;
};

type ChipProps = CommonProps & {
  type?: "chip";
  children: string;
  color?: BadgeColor;
  appearance?: "tonal" | "solid";
  size?: BadgeSize;
  shape?: BadgeShape;
  leadingElement?: ReactNode;
  trailingElement?: ReactNode;
};

type NumberProps = CommonProps & {
  type: "number";
  tone?: BadgeTone;
  appearance?: "tonal" | "fill";
  value: number;
  max?: number;
  label: string;
};

type DotProps = CommonProps & {
  type: "dot";
  tone?: BadgeTone;
  appearance?: "tonal" | "fill";
  outline?: boolean;
  label: string;
};

export type BadgeProps = ChipProps | NumberProps | DotProps;

const tonalClasses: Record<BadgeTone, string> = {
  neutral: "bg-oe-background-secondary text-oe-foreground-secondary",
  accent: "bg-oe-background-secondary text-oe-foreground-primary",
  warning: "bg-oe-warning-background-primary text-oe-warning-foreground-primary",
  danger: "bg-oe-danger-background-primary text-oe-danger-foreground-primary",
  success: "bg-oe-success-background-primary text-oe-success-foreground-primary",
  info: "bg-oe-info-background-primary text-oe-info-foreground-primary",
};

const fillClasses: Record<BadgeTone, string> = {
  neutral: "bg-oe-background-bold-primary text-oe-foreground-inverse",
  accent: "bg-oe-accent-background-bold-primary text-oe-foreground-inverse",
  warning: "bg-oe-warning-background-bold-primary text-oe-foreground-inverse",
  danger: "bg-oe-danger-background-bold-primary text-oe-foreground-inverse",
  success: "bg-oe-success-background-bold-primary text-oe-foreground-inverse",
  info: "bg-oe-info-background-bold-primary text-oe-foreground-inverse",
};

const chipColorClasses: Record<BadgeColor, { tonal: string; solid: string }> = {
  slate: { tonal: "bg-slate-100 text-slate-800 dark:bg-slate-950 dark:text-slate-200", solid: "bg-slate-600 text-white" },
  gray: { tonal: "bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-200", solid: "bg-gray-600 text-white" },
  zinc: { tonal: "bg-zinc-100 text-zinc-800 dark:bg-zinc-950 dark:text-zinc-200", solid: "bg-zinc-600 text-white" },
  neutral: {
    tonal: "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-100",
    solid: "bg-neutral-600 text-white",
  },
  stone: { tonal: "bg-stone-100 text-stone-800 dark:bg-stone-950 dark:text-stone-200", solid: "bg-stone-600 text-white" },
  red: {
    tonal: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
    solid: "bg-red-600 text-white",
  },
  orange: { tonal: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200", solid: "bg-orange-600 text-white" },
  amber: {
    tonal: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
    solid: "bg-amber-600 text-white",
  },
  yellow: {
    tonal: "bg-yellow-100 text-yellow-900 dark:bg-yellow-950 dark:text-yellow-200",
    solid: "bg-yellow-600 text-white",
  },
  lime: { tonal: "bg-lime-100 text-lime-900 dark:bg-lime-950 dark:text-lime-200", solid: "bg-lime-600 text-white" },
  green: { tonal: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200", solid: "bg-green-600 text-white" },
  emerald: { tonal: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200", solid: "bg-emerald-600 text-white" },
  teal: { tonal: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-200", solid: "bg-teal-600 text-white" },
  cyan: { tonal: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-200", solid: "bg-cyan-600 text-white" },
  sky: { tonal: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200", solid: "bg-sky-600 text-white" },
  blue: { tonal: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200", solid: "bg-blue-600 text-white" },
  indigo: { tonal: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200", solid: "bg-indigo-600 text-white" },
  violet: { tonal: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200", solid: "bg-violet-600 text-white" },
  purple: { tonal: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200", solid: "bg-purple-600 text-white" },
  fuchsia: { tonal: "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-950 dark:text-fuchsia-200", solid: "bg-fuchsia-600 text-white" },
  pink: { tonal: "bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-200", solid: "bg-pink-600 text-white" },
  rose: { tonal: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200", solid: "bg-rose-600 text-white" },
};

export function Badge(props: BadgeProps) {
  const { appearance = "tonal", className } = props;
  const tone = props.type === "dot" || props.type === "number" ? props.tone ?? "neutral" : "neutral";
  const filled = appearance === "solid" || appearance === "fill";
  const colorClass = filled ? fillClasses[tone] : tonalClasses[tone];

  if (props.type === "dot") {
    return <span role="img" aria-label={props.label} className={cn("inline-block size-2.5 shrink-0 rounded-full", colorClass, props.outline && "ring-2 ring-oe-background-primary", className)} />;
  }

  if (props.type === "number") {
    const displayValue = props.max !== undefined && props.value > props.max ? `${props.max}+` : props.value;
    return <span aria-label={props.label} className={cn("inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-medium leading-none tabular-nums", colorClass, className)}>{displayValue}</span>;
  }

  const { color = "neutral", size = "medium", shape = "pill", appearance: chipAppearance = "tonal" } = props;
  const leadingElement = props.leadingElement;
  const trailingElement = props.trailingElement;
  return (
    <span className={cn(
      "inline-flex items-center font-medium",
      size === "xsmall" ? "h-4 gap-0.5 px-1.5 text-[10px] leading-none" : size === "small" ? "h-5 gap-0.5 px-1.5 text-[11px]" : "h-6 gap-1 px-2 text-xs",
      shape === "pill" ? "rounded-full" : "rounded-[8px]",
      chipColorClasses[color][chipAppearance],
      className,
    )}>
      {leadingElement && <span className={cn("shrink-0", size === "xsmall" ? "[&_svg]:size-2.5" : size === "small" ? "[&_svg]:size-3" : "[&_svg]:size-3.5")} aria-hidden="true">{leadingElement}</span>}
      <span>{props.children}</span>
      {trailingElement && <span className={cn("shrink-0", size === "xsmall" ? "[&_svg]:size-2.5" : size === "small" ? "[&_svg]:size-3" : "[&_svg]:size-3.5")} aria-hidden="true">{trailingElement}</span>}
    </span>
  );
}
