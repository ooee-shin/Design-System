import { Hct, TonalPalette, argbFromHex, hexFromArgb } from "@material/material-color-utilities";

export const BRAND_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
export const BRAND_ALPHA_STEPS = [5, 8, 10, 16, 20, 30, 40, 50, 60, 70, 80, 90] as const;
export const DEFAULT_BRAND_SEED = "#2563EB";

/**
 * Button과 한 줄 Form control이 공유하는 높이 scale이다. 모든 컴포넌트가 모든 단계를
 * 제공하지는 않으며, 어느 컴포넌트가 어느 단계를 갖는지는 각 명세가 정한다.
 * 기준은 docs/system/interaction.md의 「공통 Control Height」다.
 */
export const CONTROL_HEIGHTS = {
  xxsmall: 24,
  xsmall: 28,
  small: 32,
  regular: 36,
  large: 40,
  xlarge: 48,
  xxlarge: 56,
} as const;

export type ControlSize = keyof typeof CONTROL_HEIGHTS;

export const ICON_SIZES = {
  xsmall: 12,
  small: 16,
  medium: 20,
  large: 24,
  xlarge: 32,
} as const;

export type IconSize = keyof typeof ICON_SIZES;

/**
 * 모서리 반지름 scale이다. `control`은 값을 입력받거나 고르는 컨트롤이 공유하는 값이며,
 * 나머지 단계와 값이 같아도 이름을 따로 두어 컨트롤만 조정할 수 있게 한다.
 * 단위는 px이고 CSS에는 rem으로 노출한다.
 */
export const RADII = {
  control: 8,
  sm: 6,
  md: 8,
  lg: 10,
  xl: 14,
  "2xl": 18,
  "3xl": 22,
  "4xl": 26,
} as const;

export type RadiusName = keyof typeof RADII;

export type SemanticFamily = "neutral" | "accent" | "warning" | "danger" | "success" | "info";
export type SemanticTokenDefinition = {
  name: string;
  family: SemanticFamily;
  light: string;
  dark: string;
};

const semantic = (family: SemanticFamily, name: string, light: string, dark: string): SemanticTokenDefinition => ({ family, name, light, dark });

const statusFamily = (family: Exclude<SemanticFamily, "neutral" | "accent">, palette: string): SemanticTokenDefinition[] => [
  semantic(family, `oe-${family}-foreground-primary`, `${palette}-800`, `${palette}-200`),
  semantic(family, `oe-${family}-foreground-secondary`, `${palette}-600`, `${palette}-400`),
  semantic(family, `oe-${family}-background-primary`, `${palette}-50`, `${palette}-950`),
  semantic(family, `oe-${family}-background-secondary`, `${palette}-100`, `${palette}-900`),
  semantic(family, `oe-${family}-background-bold-primary`, `${palette}-700`, `${palette}-400`),
  semantic(family, `oe-${family}-border-primary`, `${palette}-500`, `${palette}-500`),
  semantic(family, `oe-${family}-border-secondary`, `${palette}-200`, `${palette}-800`),
];

export const CORE_SEMANTIC_TOKENS: readonly SemanticTokenDefinition[] = [
  semantic("neutral", "oe-foreground-primary", "neutral-950", "neutral-50"),
  semantic("neutral", "oe-foreground-secondary", "neutral-700", "neutral-300"),
  semantic("neutral", "oe-foreground-tertiary", "neutral-500", "neutral-500"),
  semantic("neutral", "oe-foreground-placeholder", "neutral-400", "neutral-500"),
  semantic("neutral", "oe-foreground-disabled", "neutral-400", "neutral-600"),
  semantic("neutral", "oe-foreground-inverse", "white", "neutral-950"),
  semantic("neutral", "oe-foreground-inverse-secondary", "white / 60%", "neutral-950 / 60%"),
  semantic("neutral", "oe-background-canvas-primary", "white", "neutral-950"),
  semantic("neutral", "oe-background-canvas-secondary", "white", "neutral-900"),
  semantic("neutral", "oe-background-primary", "white", "neutral-900"),
  semantic("neutral", "oe-background-secondary", "neutral-100", "neutral-800"),
  semantic("neutral", "oe-background-bold-primary", "neutral-950", "neutral-50"),
  semantic("neutral", "oe-background-control-off", "neutral-400", "neutral-500"),
  semantic("neutral", "oe-background-control-disabled", "neutral-300", "neutral-600"),
  semantic("neutral", "oe-background-disabled", "neutral-100", "neutral-800"),
  semantic("neutral", "oe-background-disabled-selected", "neutral-400", "neutral-400"),
  semantic("neutral", "oe-border-primary", "neutral-300", "neutral-700"),
  semantic("neutral", "oe-border-bold-primary", "neutral-950", "neutral-50"),
  semantic("neutral", "oe-border-secondary", "neutral-200", "neutral-800"),
  semantic("neutral", "oe-border-disabled", "neutral-100", "neutral-900"),
  semantic("neutral", "oe-border-visual", "black / 10%", "black / 10%"),
  semantic("neutral", "oe-interaction-hover-subtle", "black / 3%", "white / 5%"),
  semantic("neutral", "oe-interaction-hover", "black / 5%", "white / 8%"),
  semantic("accent", "oe-accent-background-bold-primary", "red-600", "red-400"),
  ...statusFamily("warning", "amber"),
  ...statusFamily("danger", "red"),
  ...statusFamily("success", "green"),
  ...statusFamily("info", "blue"),
];

export function createCoreSemanticCssVariables(mode: "light" | "dark") {
  return Object.fromEntries(CORE_SEMANTIC_TOKENS.map((definition) => [`--${definition.name}`, primitiveToCss(definition[mode])])) as Record<`--${string}`, string>;
}

function primitiveToCss(primitive: string) {
  const alphaMatch = primitive.match(/^(white|black|neutral-950) \/ (\d+)%$/);
  if (alphaMatch) {
    const base = alphaMatch[1] === "white" ? "255 255 255" : alphaMatch[1] === "black" ? "0 0 0" : "10 10 10";
    return `rgb(${base} / ${alphaMatch[2]}%)`;
  }
  if (primitive === "white") return "var(--color-white)";
  return `var(--color-${primitive})`;
}

export type BrandStep = (typeof BRAND_STEPS)[number];
export type BrandAlphaStep = (typeof BRAND_ALPHA_STEPS)[number];

const toneByStep: Record<BrandStep, number> = {
  50: 98,
  100: 95,
  200: 90,
  300: 80,
  400: 70,
  500: 60,
  600: 50,
  700: 40,
  800: 30,
  900: 20,
  950: 10,
};

export type BrandPalette = {
  source: string;
  hue: number;
  chroma: number;
  solid: Record<BrandStep, string>;
  alpha: Record<BrandAlphaStep, string>;
};

export function createBrandPalette(source: string): BrandPalette {
  const normalizedSource = normalizeHex(source);
  const sourceArgb = argbFromHex(normalizedSource);
  const sourceHct = Hct.fromInt(sourceArgb);
  const palette = TonalPalette.fromHueAndChroma(sourceHct.hue, sourceHct.chroma);
  const rgb = rgbFromHex(normalizedSource);

  return {
    source: normalizedSource,
    hue: sourceHct.hue,
    chroma: sourceHct.chroma,
    solid: Object.fromEntries(
      BRAND_STEPS.map((step) => [step, hexFromArgb(palette.tone(toneByStep[step]))]),
    ) as Record<BrandStep, string>,
    alpha: Object.fromEntries(
      BRAND_ALPHA_STEPS.map((step) => [step, `rgb(${rgb.r} ${rgb.g} ${rgb.b} / ${step}%)`]),
    ) as Record<BrandAlphaStep, string>,
  };
}

export function createBrandSemanticMapping(palette: BrandPalette, mode: "light" | "dark") {
  const solid = (step: BrandStep) => ({
    primitive: `brand-${step}` as const,
    value: palette.solid[step],
  });
  if (mode === "dark") {
    return {
      foregroundPrimary: solid(200),
      foregroundSecondary: solid(400),
      backgroundPrimary: solid(950),
      backgroundSecondary: solid(900),
      backgroundBoldPrimary: solid(400),
      borderPrimary: solid(500),
      borderSecondary: solid(800),
      focusRing: solid(400),
    };
  }

  return {
    foregroundPrimary: solid(800),
    foregroundSecondary: solid(600),
    backgroundPrimary: solid(50),
    backgroundSecondary: solid(100),
    backgroundBoldPrimary: solid(700),
    borderPrimary: solid(500),
    borderSecondary: solid(200),
    focusRing: solid(600),
  };
}

function normalizeHex(value: string) {
  const candidate = value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(candidate)) return candidate.toUpperCase();
  throw new Error("Seed color must be a six-digit hex value.");
}

function rgbFromHex(value: string) {
  return {
    r: Number.parseInt(value.slice(1, 3), 16),
    g: Number.parseInt(value.slice(3, 5), 16),
    b: Number.parseInt(value.slice(5, 7), 16),
  };
}
