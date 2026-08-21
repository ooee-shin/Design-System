import { Hct, TonalPalette, argbFromHex, hexFromArgb } from "@material/material-color-utilities";

export const BRAND_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
export const BRAND_ALPHA_STEPS = [5, 8, 10, 16, 20, 30, 40, 50, 60, 70, 80, 90] as const;
export const DEFAULT_BRAND_SEED = "#2563EB";

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
