import type { CSSProperties } from "react";

const paletteFamilies = [
  "slate",
  "gray",
  "zinc",
  "neutral",
  "stone",
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
] as const;

const paletteSteps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

export function TailwindColorCatalog() {
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-dashed border-oe-border-secondary bg-oe-background-secondary px-4 py-3 text-xs leading-5 text-oe-foreground-secondary">
        Tailwind CSS v4가 제공하는 기본 color primitive 전체입니다. 이 값은 색상 재료이며, oe 컴포넌트에서는 아래 OE Semantic 탭의 의미 토큰을 우선 사용합니다.
      </div>

      <section className="overflow-hidden rounded-2xl border border-oe-border-secondary bg-oe-background-primary">
        <div className="border-b border-oe-border-secondary px-4 py-3 sm:px-5">
          <h2 className="text-sm font-semibold text-oe-foreground-primary">Base colors</h2>
          <p className="mt-1 text-xs text-oe-foreground-tertiary">단계가 없는 공통 primitive</p>
        </div>
        <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
          <BaseColor name="white" />
          <BaseColor name="black" />
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-oe-border-secondary bg-oe-background-primary">
        <div className="border-b border-oe-border-secondary px-4 py-3 sm:px-5">
          <h2 className="text-sm font-semibold text-oe-foreground-primary">Color scales</h2>
          <p className="mt-1 text-xs text-oe-foreground-tertiary">22개 palette · 각 50–950 단계</p>
        </div>
        <div className="divide-y divide-oe-border-secondary">
          {paletteFamilies.map((family) => (
            <div key={family} className="grid gap-3 px-4 py-4 sm:px-5 lg:grid-cols-[6rem_minmax(0,1fr)] lg:items-start">
              <h3 className="pt-1 font-mono text-xs font-medium text-oe-foreground-primary">{family}</h3>
              <div className="overflow-x-auto">
                <div className="grid min-w-[42rem] grid-cols-11 overflow-hidden rounded-lg border border-oe-border-secondary">
                  {paletteSteps.map((step) => {
                    const token = `${family}-${step}`;
                    return (
                      <div key={token} className="min-w-0 border-r border-oe-border-secondary last:border-r-0">
                        <div className="h-12" style={{ backgroundColor: `var(--color-${token})` }} />
                        <div className="bg-oe-background-primary px-1 py-1.5 text-center">
                          <span className="block font-mono text-[9px] text-oe-foreground-secondary">{step}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function BaseColor({ name }: { name: "white" | "black" }) {
  const style = { backgroundColor: `var(--color-${name})` } as CSSProperties;
  return (
    <article className="overflow-hidden rounded-xl border border-oe-border-secondary">
      <div className="h-16" style={style} />
      <div className="flex items-center justify-between bg-oe-background-primary px-3 py-2">
        <span className="font-mono text-[11px] text-oe-foreground-primary">{name}</span>
        <span className="font-mono text-[10px] text-oe-foreground-tertiary">--color-{name}</span>
      </div>
    </article>
  );
}
