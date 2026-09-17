// packages/tokens 의 oe 토큰(Light·Dark), 브랜드 단계, 크기 값을 Figma 변수에 넣을 JSON 으로 뽑는다. 색은 RGBA, 크기는 px 숫자다.
// prepare.mjs 가 부르고 결과를 .figma-work/<key>/oe-tokens.json 에 둔다. 값만 볼 때: node --import tsx scripts/figma/token-export.ts <출력 JSON 경로> (저장소 루트에서)
import { readFileSync, writeFileSync } from "node:fs";
import { globSync } from "node:fs";
import { BRAND_STEPS, CONTROL_HEIGHTS, CORE_SEMANTIC_TOKENS, DEFAULT_BRAND_SEED, ICON_SIZES, RADII, createBrandPalette, createBrandSemanticMapping } from "../../packages/tokens/src/index.ts";

const theme = readFileSync(globSync("node_modules/.pnpm/tailwindcss@4*/node_modules/tailwindcss/theme.css").sort().at(-1)!, "utf8");
const colors: Record<string, string> = {};
for (const m of theme.matchAll(/--color-([a-z]+-\d+|white|black):\s*([^;]+);/g)) colors[m[1]] = m[2].trim();

function oklchToOklab(str: string) {
  const m = str.match(/oklch\(\s*([\d.]+)%?\s+([\d.]+)\s+([\d.]+|none)/);
  if (!m) throw new Error("bad oklch " + str);
  let L = parseFloat(m[1]); if (str.includes("%")) L = L / 100;
  const C = parseFloat(m[2]); const h = ((m[3] === "none" ? 0 : parseFloat(m[3])) * Math.PI) / 180;
  return { L, a: C * Math.cos(h), b: C * Math.sin(h) };
}
function oklabToRgb({ L, a, b }: { L: number; a: number; b: number }) {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3, mm = m_ ** 3, s = s_ ** 3;
  const lin = [4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * mm + 1.707614701 * s];
  return lin.map((c) => { const v = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055; return Math.min(1, Math.max(0, v)); });
}
const oklchToRgb = (str: string) => oklabToRgb(oklchToOklab(str));

// packages/tokens 는 Tailwind 에 없는 중간 단계를 styles.css 에서 color-mix 로 직접 만든다
// (예: `--color-neutral-150: color-mix(in oklab, var(--color-neutral-100), var(--color-neutral-200))`).
// 그 값은 Tailwind theme.css 에 없으므로 여기서 같은 방식(oklab 에서 반씩)으로 계산한다.
// 이 자리를 따라가지 않으면 그 단계를 쓰는 토큰에서 「missing …」으로 멈춘다.
const tokensCss = readFileSync("packages/tokens/src/styles.css", "utf8");
const mixed: Record<string, number[]> = {};
for (const m of tokensCss.matchAll(/--color-([a-z]+-\d+):\s*color-mix\(in oklab,\s*var\(--color-([a-z]+-\d+)\),\s*var\(--color-([a-z]+-\d+)\)\s*\)/g)) {
  const one = colors[m[2]], two = colors[m[3]];
  if (!one || !two) throw new Error(`color-mix 의 재료를 찾지 못했다: ${m[1]} = ${m[2]} + ${m[3]}`);
  const p = oklchToOklab(one), q = oklchToOklab(two);
  mixed[m[1]] = oklabToRgb({ L: (p.L + q.L) / 2, a: (p.a + q.a) / 2, b: (p.b + q.b) / 2 });
}
const hexToRgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
function primitive(p: string) {
  const alpha = p.match(/^(white|black|neutral-950) \/ (\d+)%$/);
  if (alpha) { const base = alpha[1] === "white" ? [1, 1, 1] : alpha[1] === "black" ? [0, 0, 0] : [10 / 255, 10 / 255, 10 / 255]; return { r: base[0], g: base[1], b: base[2], a: +alpha[2] / 100, source: p }; }
  if (p === "white") return { r: 1, g: 1, b: 1, a: 1, source: p };
  if (p === "black") return { r: 0, g: 0, b: 0, a: 1, source: p };
  if (mixed[p]) { const [r, g, b] = mixed[p]; return { r, g, b, a: 1, source: p }; }
  const v = colors[p]; if (!v) throw new Error(`missing ${p}. Tailwind theme.css 에도 packages/tokens/src/styles.css 의 color-mix 에도 없다`);
  const [r, g, b] = oklchToRgb(v); return { r, g, b, a: 1, source: p };
}
const out: Record<string, { light: any; dark: any }> = {};
for (const t of CORE_SEMANTIC_TOKENS) out[t.name] = { light: primitive(t.light), dark: primitive(t.dark) };
const palette = createBrandPalette(DEFAULT_BRAND_SEED);
const L = createBrandSemanticMapping(palette, "light"), D = createBrandSemanticMapping(palette, "dark");
const brandNames: Record<string, string> = { foregroundPrimary: "oe-brand-foreground-primary", foregroundSecondary: "oe-brand-foreground-secondary", backgroundPrimary: "oe-brand-background-primary", backgroundSecondary: "oe-brand-background-secondary", backgroundBoldPrimary: "oe-brand-background-bold-primary", borderPrimary: "oe-brand-border-primary", borderSecondary: "oe-brand-border-secondary", focusRing: "oe-focus-ring" };
for (const [k, name] of Object.entries(brandNames)) {
  const l = (L as any)[k], d = (D as any)[k];
  const [lr, lg, lb] = hexToRgb(l.value), [dr, dg, db] = hexToRgb(d.value);
  out[name] = { light: { r: lr, g: lg, b: lb, a: 1, source: l.primitive }, dark: { r: dr, g: dg, b: db, a: 1, source: d.primitive } };
}
const brandSolid = Object.fromEntries(BRAND_STEPS.map((s) => [`brand-${s}`, palette.solid[s]]));
const sizes = {
  ...Object.fromEntries(Object.entries(CONTROL_HEIGHTS).map(([k, v]) => [`oe-control-${k}`, v])),
  ...Object.fromEntries(Object.entries(ICON_SIZES).map(([k, v]) => [`oe-icon-${k}`, v])),
  ...Object.fromEntries(Object.entries(RADII).map(([k, v]) => [k === "control" ? "radius-oe-control" : `radius-${k}`, v])),
};
writeFileSync(process.argv[2], JSON.stringify({ seed: DEFAULT_BRAND_SEED, tokens: out, brandSolid, sizes }, null, 1));
console.log(Object.keys(out).length, "tokens");
