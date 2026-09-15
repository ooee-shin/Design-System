"use client";

import { useEffect } from "react";
import { BRAND_ALPHA_STEPS, BRAND_STEPS, DEFAULT_BRAND_SEED, createBrandPalette, createBrandSemanticMapping } from "@ooee/tokens";

/**
 * Studio 의 `BrandThemeProvider` 가 넣는 것과 같은 브랜드 변수를 기본 seed 로 넣는다. seed 를 바꾸는
 * 기능은 두지 않는다. 화면을 만들어 보는 자리라 Studio 와 같은 색으로 보이기만 하면 된다.
 *
 * 이 파일은 복제다. 기본 브랜드 값의 자리를 `packages/tokens` 로 옮길지가 정해지면 걷어낸다
 * (`docs/process/ai-environment.md` 「아직 정하지 않은 것」).
 */
export function BrandVariables() {
  useEffect(() => {
    const palette = createBrandPalette(DEFAULT_BRAND_SEED);
    const light = createBrandSemanticMapping(palette, "light");
    const dark = createBrandSemanticMapping(palette, "dark");
    const root = document.documentElement;
    const variables: Record<string, string> = {
      ...Object.fromEntries(BRAND_STEPS.map((step) => [`--brand-${step}`, palette.solid[step]])),
      ...Object.fromEntries(BRAND_ALPHA_STEPS.map((step) => [`--brand-alpha-${String(step).padStart(2, "0")}`, palette.alpha[step]])),
      "--brand-source": palette.source,
      "--oe-brand-light-foreground-primary": light.foregroundPrimary.value,
      "--oe-brand-light-foreground-secondary": light.foregroundSecondary.value,
      "--oe-brand-light-background-primary": light.backgroundPrimary.value,
      "--oe-brand-light-background-secondary": light.backgroundSecondary.value,
      "--oe-brand-light-background-bold-primary": light.backgroundBoldPrimary.value,
      "--oe-brand-light-border-primary": light.borderPrimary.value,
      "--oe-brand-light-border-secondary": light.borderSecondary.value,
      "--oe-brand-light-focus-ring": light.focusRing.value,
      "--oe-brand-dark-foreground-primary": dark.foregroundPrimary.value,
      "--oe-brand-dark-foreground-secondary": dark.foregroundSecondary.value,
      "--oe-brand-dark-background-primary": dark.backgroundPrimary.value,
      "--oe-brand-dark-background-secondary": dark.backgroundSecondary.value,
      "--oe-brand-dark-background-bold-primary": dark.backgroundBoldPrimary.value,
      "--oe-brand-dark-border-primary": dark.borderPrimary.value,
      "--oe-brand-dark-border-secondary": dark.borderSecondary.value,
      "--oe-brand-dark-focus-ring": dark.focusRing.value,
    };
    Object.entries(variables).forEach(([property, value]) => root.style.setProperty(property, value));
  }, []);

  return null;
}
