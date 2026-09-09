"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type CSSProperties } from "react";
import { RiCheckLine as Check, RiFileCopyLine as Copy } from "@remixicon/react";
import {
  BRAND_ALPHA_STEPS,
  BRAND_STEPS,
  DEFAULT_BRAND_SEED,
  createBrandPalette,
  createBrandSemanticMapping,
} from "@ooee/tokens";

import { Button, Input } from "@ooee/ui";
import { SemanticTokenCatalog } from "@/components/foundations/semantic-token-catalog";
import { TailwindColorCatalog } from "@/components/foundations/tailwind-color-catalog";
import { useBrandTheme } from "@/components/brand-theme-provider";

const COLOR_LAB_VIEWS = ["primitive", "semantic", "brand"] as const;
type ColorLabView = (typeof COLOR_LAB_VIEWS)[number];

function isColorLabView(value: string): value is ColorLabView {
  return (COLOR_LAB_VIEWS as readonly string[]).includes(value);
}

export function ColorLab() {
  const { seed: appliedSeed, applySeed } = useBrandTheme();
  const [view, setView] = useState<ColorLabView>("primitive");

  // 다른 화면에서 특정 탭을 바로 가리킬 수 있도록 주소의 해시와 맞춘다.
  useEffect(() => {
    const applyHash = () => {
      const next = window.location.hash.replace("#", "");
      if (isColorLabView(next)) setView(next);
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  function selectView(next: ColorLabView) {
    setView(next);
    // 해시만 바꾸면 화면이 튀므로 이동 없이 주소만 갱신한다.
    window.history.replaceState(null, "", `#${next}`);
  }
  const [editor, setEditor] = useState({ draft: appliedSeed || DEFAULT_BRAND_SEED, appliedSeed });
  const draft = editor.appliedSeed === appliedSeed ? editor.draft : appliedSeed;
  const validDraft = /^#[0-9a-fA-F]{6}$/.test(draft);
  const seed = validDraft ? draft.toUpperCase() : appliedSeed;
  const [copied, setCopied] = useState<string | null>(null);
  const palette = useMemo(() => createBrandPalette(seed), [seed]);
  const light = createBrandSemanticMapping(palette, "light");
  const dark = createBrandSemanticMapping(palette, "dark");
  function updateDraft(value: string) {
    const next = value.startsWith("#") ? value : `#${value}`;
    setEditor({ draft: next, appliedSeed });
  }

  async function copyValue(label: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(null), 1200);
  }

  return (
    <div className="space-y-6">
      <div className="flex w-fit max-w-full overflow-x-auto rounded-lg border bg-background p-0.5 shadow-xs">
        <button
          type="button"
          onClick={() => selectView("primitive")}
          aria-pressed={view === "primitive"}
          className={view === "primitive" ? "rounded-md bg-muted px-3 py-1.5 text-xs font-medium" : "rounded-md px-3 py-1.5 text-xs text-muted-foreground"}
        >
          Tailwind Primitive
        </button>
        <button
          type="button"
          onClick={() => selectView("semantic")}
          aria-pressed={view === "semantic"}
          className={view === "semantic" ? "rounded-md bg-muted px-3 py-1.5 text-xs font-medium" : "rounded-md px-3 py-1.5 text-xs text-muted-foreground"}
        >
          OE Semantic
        </button>
        <button
          type="button"
          onClick={() => selectView("brand")}
          aria-pressed={view === "brand"}
          className={view === "brand" ? "rounded-md bg-muted px-3 py-1.5 text-xs font-medium" : "rounded-md px-3 py-1.5 text-xs text-muted-foreground"}
        >
          Brand Color
        </button>
      </div>

      {view === "primitive" ? (
        <TailwindColorCatalog />
      ) : view === "semantic" ? (
        <SemanticTokenCatalog brandLight={light} brandDark={dark} />
      ) : (
        <>
      <section className="rounded-2xl border bg-background p-4 shadow-sm sm:p-6">
        <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold">1. Brand seed</h2>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                원본은 brand-source로 보존하고 HCT는 UI용 tonal palette 후보를 생성합니다.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label className="relative size-10 shrink-0 overflow-hidden rounded-lg border" style={{ background: seed }}>
                <span className="sr-only">Seed color</span>
                <input
                  type="color"
                  value={seed}
                  onChange={(event) => updateDraft(event.target.value)}
                  className="absolute inset-0 size-full cursor-pointer opacity-0"
                />
              </label>
              <Input
                value={draft}
                onChange={(event: ChangeEvent<HTMLInputElement>) => updateDraft(event.target.value)}
                aria-label="Brand seed hex"
                className="font-mono uppercase"
                aria-invalid={!validDraft}
              />
              <Button type="button" variant="outline" tone="neutral" onClick={() => updateDraft("#0073FF")}>
                초기화
              </Button>
              <Button type="button" onClick={() => applySeed(seed)} disabled={!validDraft || seed === appliedSeed}>
                반영
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground" role="status">
              {seed === appliedSeed ? `현재 적용값 ${appliedSeed}` : `미리보기 ${seed} · 반영 전`}
            </p>
            <dl className="grid grid-cols-2 gap-2 text-xs">
              <Metric label="HCT hue" value={palette.hue.toFixed(1)} />
              <Metric label="HCT chroma" value={palette.chroma.toFixed(1)} />
            </dl>
          </div>

          <div className="grid min-h-36 overflow-hidden rounded-xl border sm:grid-cols-2">
            <div className="flex flex-col justify-between p-5" style={{ background: palette.source }}>
              <span className="text-xs font-medium text-white/70">brand-source</span>
              <span className="font-mono text-sm text-white">{palette.source}</span>
            </div>
            <div className="flex flex-col justify-between bg-muted p-5">
              <span className="text-xs font-medium text-muted-foreground">Generation status</span>
              <span className="flex items-center gap-1.5 text-sm font-medium"><Check className="size-4" /> HCT palette ready</span>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeading number="2" title="Solid primitive" description="HCT tone을 Tailwind식 50~950 명칭에 연결합니다." />
        <div className="flex overflow-x-auto rounded-xl border bg-background shadow-sm">
          {BRAND_STEPS.map((step) => (
            <Swatch
              key={step}
              label={`brand-${step}`}
              value={palette.solid[step]}
              color={palette.solid[step]}
              copied={copied === `brand-${step}`}
              onCopy={() => copyValue(`brand-${step}`, palette.solid[step])}
            />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeading number="3" title="Alpha primitive" description="Seed RGB를 기준으로 허용된 opacity 단계만 생성합니다." />
        <div className="flex overflow-x-auto rounded-xl border bg-background shadow-sm">
          {BRAND_ALPHA_STEPS.map((step) => (
            <Swatch
              key={step}
              label={`brand-alpha-${String(step).padStart(2, "0")}`}
              value={`${step}%`}
              color={palette.alpha[step]}
              checker
              copied={copied === `alpha-${step}`}
              onCopy={() => copyValue(`alpha-${step}`, palette.alpha[step])}
            />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeading number="4" title="Semantic mapping candidate" description="같은 primitive를 Light/Dark에서 다른 의미 값으로 검수합니다." />
        <div className="grid overflow-hidden rounded-2xl border shadow-sm lg:grid-cols-2">
          <SemanticPreview mode="light" mapping={light} />
          <SemanticPreview mode="dark" mapping={dark} />
        </div>
      </section>
        </>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg bg-muted px-3 py-2"><dt className="text-muted-foreground">{label}</dt><dd className="mt-1 font-mono">{value}</dd></div>;
}

function SectionHeading({ number, title, description }: { number: string; title: string; description: string }) {
  return <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-end"><h2 className="text-sm font-semibold">{number}. {title}</h2><p className="text-xs text-muted-foreground">{description}</p></div>;
}

function Swatch({ label, value, color, checker = false, copied, onCopy }: { label: string; value: string; color: string; checker?: boolean; copied: boolean; onCopy: () => void }) {
  return (
    <button type="button" onClick={onCopy} className="group w-28 shrink-0 border-r p-2 text-left last:border-r-0 hover:bg-muted/40" aria-label={`Copy ${label}`}>
      <span className="relative block h-12 overflow-hidden rounded-md border" style={checker ? checkerStyle : undefined}>
        <span className="absolute inset-0" style={{ background: color }} />
      </span>
      <span className="mt-1.5 flex items-start justify-between gap-1">
        <span className="min-w-0"><span className="block truncate text-[11px] font-medium">{label}</span><span className="block truncate font-mono text-[10px] text-muted-foreground">{value}</span></span>
        {copied ? <Check className="mt-0.5 size-3 shrink-0" /> : <Copy className="mt-0.5 size-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />}
      </span>
    </button>
  );
}

const checkerStyle: CSSProperties = {
  backgroundColor: "white",
  backgroundImage: "linear-gradient(45deg,#e5e5e5 25%,transparent 25%),linear-gradient(-45deg,#e5e5e5 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e5e5e5 75%),linear-gradient(-45deg,transparent 75%,#e5e5e5 75%)",
  backgroundPosition: "0 0,0 6px,6px -6px,-6px 0",
  backgroundSize: "12px 12px",
};

type SemanticMapping = ReturnType<typeof createBrandSemanticMapping>;

function SemanticPreview({ mode, mapping }: { mode: "light" | "dark"; mapping: SemanticMapping }) {
  const variables = {
    "--lab-fg-primary": mapping.foregroundPrimary.value,
    "--lab-fg-secondary": mapping.foregroundSecondary.value,
    "--lab-bg-primary": mapping.backgroundPrimary.value,
    "--lab-bg-secondary": mapping.backgroundSecondary.value,
    "--lab-bg-bold": mapping.backgroundBoldPrimary.value,
    "--lab-border-primary": mapping.borderPrimary.value,
    "--lab-border-secondary": mapping.borderSecondary.value,
    "--lab-focus": mapping.focusRing.value,
  } as CSSProperties;
  const dark = mode === "dark";

  return (
    <article className="space-y-5 p-5 sm:p-6" style={{ ...variables, background: dark ? "#111111" : "#ffffff", color: dark ? "#fafafa" : "#171717" }}>
      <div className="flex items-center justify-between"><h3 className="text-sm font-semibold">{dark ? "Dark" : "Light"}</h3><span className="text-[11px] opacity-50">Provisional</span></div>
      <div className="rounded-xl border p-4" style={{ background: "var(--lab-bg-primary)", borderColor: "var(--lab-border-secondary)" }}>
        <p className="text-sm font-semibold" style={{ color: "var(--lab-fg-primary)" }}>Brand foreground primary</p>
        <p className="mt-1 text-xs" style={{ color: "var(--lab-fg-secondary)" }}>Secondary content over a brand surface</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="rounded-lg border px-3 py-1.5 text-xs font-medium outline-3 outline-offset-2" style={{ color: "var(--lab-fg-primary)", borderColor: "var(--lab-border-primary)", outlineColor: "var(--lab-focus)" }}>Focus sample</button>
          <span className="rounded-lg px-3 py-1.5 text-xs" style={{ background: "var(--lab-bg-bold)", color: dark ? "#0a0a0a" : "#ffffff" }}>Bold primary</span>
        </div>
      </div>
      <dl className="grid gap-2 text-[11px] sm:grid-cols-2">
        {Object.entries(mapping).map(([name, reference]) => (
          <div key={name} className="flex items-center justify-between gap-2 border-b py-1.5 opacity-70">
            <dt>{name}</dt>
            <dd className="text-right">
              <span className="block font-mono">{reference.primitive}</span>
              <span className="block font-mono text-[10px] opacity-60">{reference.value}</span>
            </dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
