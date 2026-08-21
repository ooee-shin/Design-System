import type { CSSProperties } from "react";
import { createBrandSemanticMapping } from "@ooee/tokens";

type SemanticMapping = ReturnType<typeof createBrandSemanticMapping>;

type TokenRow = {
  token: string;
  light: { primitive: string; value?: string };
  dark: { primitive: string; value?: string };
};

const neutralTokens: TokenRow[] = [
  token("oe-foreground-primary", "neutral-950", "neutral-50"),
  token("oe-foreground-secondary", "neutral-700", "neutral-300"),
  token("oe-foreground-tertiary", "neutral-500", "neutral-500"),
  token("oe-foreground-disabled", "neutral-400", "neutral-600"),
  token("oe-foreground-inverse", "white", "neutral-950"),
  token("oe-foreground-inverse-secondary", "white / 60%", "neutral-950 / 60%"),
  token("oe-background-canvas-primary", "white", "neutral-950"),
  token("oe-background-canvas-secondary", "neutral-50", "neutral-900"),
  token("oe-background-primary", "white", "neutral-900"),
  token("oe-background-secondary", "neutral-100", "neutral-800"),
  token("oe-background-bold-primary", "neutral-950", "neutral-50"),
  token("oe-background-disabled", "neutral-100", "neutral-800"),
  token("oe-border-primary", "neutral-300", "neutral-700"),
  token("oe-border-secondary", "neutral-200", "neutral-800"),
  token("oe-border-disabled", "neutral-100", "neutral-900"),
  token("oe-interaction-hover", "black / 5%", "white / 8%"),
];

const statusFamilies = [
  statusFamily("Warning", "warning", "amber"),
  statusFamily("Danger", "danger", "red"),
  statusFamily("Success", "success", "green"),
  statusFamily("Info", "info", "blue"),
];

const accentTokens: TokenRow[] = [
  token("oe-accent-background-bold-primary", "red-600", "red-400"),
];

export function SemanticTokenCatalog({
  brandLight,
  brandDark,
}: {
  brandLight: SemanticMapping;
  brandDark: SemanticMapping;
}) {
  const brandTokens = brandRows(brandLight, brandDark);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-dashed bg-muted/30 px-4 py-3 text-xs leading-5 text-muted-foreground">
        현재 모든 매핑은 Provisional입니다. Sidebar와 Chart는 shadcn 특수 토큰으로 유지하므로 이 oe 공용 목록에서 제외했습니다.
      </div>

      <TokenFamily title="Neutral" description="일반 foreground, background, border" rows={neutralTokens} />
      <TokenFamily title="Brand" description="현재 Brand Primitive 탭의 seed에서 생성된 동적 매핑" rows={brandTokens} />
      <TokenFamily title="Accent" description="상태 의미 없이 시선을 끄는 강조색" rows={accentTokens} />

      <div className="grid gap-6 xl:grid-cols-2">
        {statusFamilies.map((family) => (
          <TokenFamily key={family.title} {...family} />
        ))}
      </div>
    </div>
  );
}

function TokenFamily({ title, description, rows }: { title: string; description: string; rows: TokenRow[] }) {
  const groups = groupRowsByProperty(rows);

  return (
    <section className="overflow-hidden rounded-2xl border bg-background shadow-sm">
      <div className="flex items-end justify-between gap-4 border-b px-4 py-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        <p className="text-right text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-2xl text-left text-xs">
          <thead className="text-[11px] text-muted-foreground">
            <tr className="border-b">
              <th className="px-4 py-2 font-medium">OE semantic token</th>
              <th className="px-4 py-2 font-medium">Light primitive</th>
              <th className="px-4 py-2 font-medium">Dark primitive</th>
            </tr>
          </thead>
          {groups.map((group) => (
            <tbody key={group.label}>
              <tr className="border-y bg-muted/50 first:border-t-0">
                <th colSpan={3} scope="rowgroup" className="px-4 py-2 text-[10px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                  {group.label}
                  <span className="ml-2 font-normal tracking-normal normal-case opacity-70">{group.description}</span>
                </th>
              </tr>
              {group.rows.map((row) => (
                <tr key={row.token} className="border-b last:border-b-0">
                  <td className="px-4 py-2.5 pl-6 font-mono text-[11px]">{row.token}</td>
                  <td className="px-4 py-2.5"><PrimitiveReference reference={row.light} /></td>
                  <td className="px-4 py-2.5"><PrimitiveReference reference={row.dark} /></td>
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>
    </section>
  );
}

function groupRowsByProperty(rows: TokenRow[]) {
  const definitions = [
    { key: "foreground", label: "Foreground", description: "텍스트와 아이콘" },
    { key: "background", label: "Background", description: "Surface와 채움" },
    { key: "border", label: "Border", description: "경계와 구분선" },
    { key: "focus", label: "Focus", description: "키보드 포커스 표시" },
    { key: "interaction", label: "Interaction", description: "상태 변화에 합성하는 layer" },
  ];

  return definitions
    .map((definition) => ({
      ...definition,
      rows: rows.filter((row) => row.token.includes(`-${definition.key}`)),
    }))
    .filter((group) => group.rows.length > 0);
}

function PrimitiveReference({ reference }: { reference: TokenRow["light"] }) {
  const primitiveClass = reference.value ? "" : primitiveClasses[reference.primitive];
  return (
    <span className="flex items-center gap-2">
      <span
        className={`size-5 shrink-0 rounded-md border ${primitiveClass ?? "bg-transparent"}`}
        style={reference.value ? ({ background: reference.value } as CSSProperties) : undefined}
      />
      <span>
        <span className="block font-mono text-[11px]">{reference.primitive}</span>
        {reference.value && <span className="block font-mono text-[10px] text-muted-foreground">{reference.value}</span>}
      </span>
    </span>
  );
}

function token(name: string, light: string, dark: string): TokenRow {
  return { token: name, light: { primitive: light }, dark: { primitive: dark } };
}

function statusFamily(title: string, role: string, palette: string) {
  return {
    title,
    description: `${palette} primitive 기반 상태 역할`,
    rows: [
      token(`oe-${role}-foreground-primary`, `${palette}-800`, `${palette}-200`),
      token(`oe-${role}-foreground-secondary`, `${palette}-600`, `${palette}-400`),
      token(`oe-${role}-background-primary`, `${palette}-50`, `${palette}-950`),
      token(`oe-${role}-background-secondary`, `${palette}-100`, `${palette}-900`),
      token(`oe-${role}-background-bold-primary`, `${palette}-700`, `${palette}-400`),
      token(`oe-${role}-border-primary`, `${palette}-500`, `${palette}-500`),
      token(`oe-${role}-border-secondary`, `${palette}-200`, `${palette}-800`),
    ],
  };
}

function brandRows(light: SemanticMapping, dark: SemanticMapping): TokenRow[] {
  const semanticNames = {
    foregroundPrimary: "oe-brand-foreground-primary",
    foregroundSecondary: "oe-brand-foreground-secondary",
    backgroundPrimary: "oe-brand-background-primary",
    backgroundSecondary: "oe-brand-background-secondary",
    backgroundBoldPrimary: "oe-brand-background-bold-primary",
    borderPrimary: "oe-brand-border-primary",
    borderSecondary: "oe-brand-border-secondary",
    focusRing: "oe-focus-ring",
  } satisfies Record<keyof SemanticMapping, string>;

  return (Object.keys(semanticNames) as Array<keyof SemanticMapping>).map((key) => ({
    token: semanticNames[key],
    light: light[key],
    dark: dark[key],
  }));
}

const primitiveClasses: Record<string, string> = {
  white: "bg-white",
  "white / 8%": "bg-white/8",
  "white / 60%": "bg-white/60",
  "black / 5%": "bg-black/5",
  "neutral-950 / 60%": "bg-neutral-950/60",
  "neutral-50": "bg-neutral-50",
  "neutral-100": "bg-neutral-100",
  "neutral-200": "bg-neutral-200",
  "neutral-300": "bg-neutral-300",
  "neutral-400": "bg-neutral-400",
  "neutral-500": "bg-neutral-500",
  "neutral-600": "bg-neutral-600",
  "neutral-700": "bg-neutral-700",
  "neutral-800": "bg-neutral-800",
  "neutral-900": "bg-neutral-900",
  "neutral-950": "bg-neutral-950",
  "amber-50": "bg-amber-50",
  "amber-100": "bg-amber-100",
  "amber-200": "bg-amber-200",
  "amber-300": "bg-amber-300",
  "amber-400": "bg-amber-400",
  "amber-500": "bg-amber-500",
  "amber-600": "bg-amber-600",
  "amber-700": "bg-amber-700",
  "amber-800": "bg-amber-800",
  "amber-900": "bg-amber-900",
  "amber-950": "bg-amber-950",
  "red-50": "bg-red-50",
  "red-100": "bg-red-100",
  "red-200": "bg-red-200",
  "red-300": "bg-red-300",
  "red-400": "bg-red-400",
  "red-500": "bg-red-500",
  "red-600": "bg-red-600",
  "red-700": "bg-red-700",
  "red-800": "bg-red-800",
  "red-900": "bg-red-900",
  "red-950": "bg-red-950",
  "green-50": "bg-green-50",
  "green-100": "bg-green-100",
  "green-200": "bg-green-200",
  "green-300": "bg-green-300",
  "green-400": "bg-green-400",
  "green-500": "bg-green-500",
  "green-600": "bg-green-600",
  "green-700": "bg-green-700",
  "green-800": "bg-green-800",
  "green-900": "bg-green-900",
  "green-950": "bg-green-950",
  "blue-50": "bg-blue-50",
  "blue-100": "bg-blue-100",
  "blue-200": "bg-blue-200",
  "blue-300": "bg-blue-300",
  "blue-400": "bg-blue-400",
  "blue-500": "bg-blue-500",
  "blue-600": "bg-blue-600",
  "blue-700": "bg-blue-700",
  "blue-800": "bg-blue-800",
  "blue-900": "bg-blue-900",
  "blue-950": "bg-blue-950",
};
