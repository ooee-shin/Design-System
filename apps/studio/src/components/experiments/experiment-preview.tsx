"use client";

import { useState } from "react";
import { Languages, Moon, Sun } from "lucide-react";

import { InboxSplitView } from "@/components/experiments/inbox-split-view";
import { cn } from "@/lib/utils";

type ThemeMode = "light" | "dark";
type TypographyMode = "ko" | "en" | "ja";

const themeOptions: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "라이트", icon: Sun },
  { value: "dark", label: "다크", icon: Moon },
];

const typographyOptions: { value: TypographyMode; label: string }[] = [
  { value: "ko", label: "국문 (기본)" },
  { value: "en", label: "영문" },
  { value: "ja", label: "일어" },
];

export function ExperimentPreview() {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [typography, setTypography] = useState<TypographyMode>("ko");

  return (
    <section className="overflow-hidden rounded-2xl border bg-background shadow-sm">
      <div className="flex flex-col gap-3 border-b bg-background px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
        <ControlGroup label="모드">
          {themeOptions.map(({ value, label, icon: Icon }) => (
            <ControlButton key={value} selected={theme === value} onClick={() => setTheme(value)}>
              <Icon className="size-3.5" aria-hidden="true" />
              {label}
            </ControlButton>
          ))}
        </ControlGroup>

        <ControlGroup label="타이포" icon={Languages}>
          {typographyOptions.map(({ value, label }) => (
            <ControlButton
              key={value}
              selected={typography === value}
              onClick={() => setTypography(value)}
            >
              {label}
            </ControlButton>
          ))}
        </ControlGroup>
      </div>

      <div
        className={cn(
          "preview-canvas bg-muted/40 p-3 text-foreground sm:p-4",
          theme === "dark" && "dark",
        )}
        lang={typography}
      >
        <InboxSplitView key={typography} locale={typography} />
      </div>
    </section>
  );
}

function ControlGroup({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: typeof Languages;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {Icon && <Icon className="size-3.5" aria-hidden="true" />}
        {label}
      </span>
      <div className="flex min-w-0 items-center rounded-lg bg-muted p-0.5">{children}</div>
    </div>
  );
}

function ControlButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "inline-flex h-7 shrink-0 items-center justify-center gap-1.5 rounded-md px-2.5 text-xs text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
        selected && "bg-background text-foreground shadow-xs",
      )}
    >
      {children}
    </button>
  );
}
