"use client";

import { createContext, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";
import {
  BRAND_ALPHA_STEPS,
  BRAND_STEPS,
  DEFAULT_BRAND_SEED,
  createBrandPalette,
  createBrandSemanticMapping,
} from "@ooee/tokens";

const STORAGE_KEY = "ooee-brand-seed";
const CHANGE_EVENT = "ooee-brand-seed-change";

type BrandThemeContextValue = {
  seed: string;
  applySeed: (seed: string) => void;
};

const BrandThemeContext = createContext<BrandThemeContextValue | null>(null);

export function BrandThemeProvider({ children }: { children: ReactNode }) {
  const seed = useSyncExternalStore(subscribeToBrandSeed, getBrandSeedSnapshot, () => DEFAULT_BRAND_SEED);
  const palette = useMemo(() => createBrandPalette(seed), [seed]);
  const light = useMemo(() => createBrandSemanticMapping(palette, "light"), [palette]);
  const dark = useMemo(() => createBrandSemanticMapping(palette, "dark"), [palette]);

  useEffect(() => {
    const root = document.documentElement;
    BRAND_STEPS.forEach((step) => root.style.setProperty(`--brand-${step}`, palette.solid[step]));
    BRAND_ALPHA_STEPS.forEach((step) => root.style.setProperty(`--brand-alpha-${String(step).padStart(2, "0")}`, palette.alpha[step]));
    root.style.setProperty("--brand-source", palette.source);
    root.style.setProperty("--oe-brand-light-foreground-primary", light.foregroundPrimary.value);
    root.style.setProperty("--oe-brand-light-foreground-secondary", light.foregroundSecondary.value);
    root.style.setProperty("--oe-brand-light-background-primary", light.backgroundPrimary.value);
    root.style.setProperty("--oe-brand-light-background-secondary", light.backgroundSecondary.value);
    root.style.setProperty("--oe-brand-light-background-bold-primary", light.backgroundBoldPrimary.value);
    root.style.setProperty("--oe-brand-light-border-primary", light.borderPrimary.value);
    root.style.setProperty("--oe-brand-light-border-secondary", light.borderSecondary.value);
    root.style.setProperty("--oe-brand-light-focus-ring", light.focusRing.value);
    root.style.setProperty("--oe-brand-dark-foreground-primary", dark.foregroundPrimary.value);
    root.style.setProperty("--oe-brand-dark-foreground-secondary", dark.foregroundSecondary.value);
    root.style.setProperty("--oe-brand-dark-background-primary", dark.backgroundPrimary.value);
    root.style.setProperty("--oe-brand-dark-background-secondary", dark.backgroundSecondary.value);
    root.style.setProperty("--oe-brand-dark-background-bold-primary", dark.backgroundBoldPrimary.value);
    root.style.setProperty("--oe-brand-dark-border-primary", dark.borderPrimary.value);
    root.style.setProperty("--oe-brand-dark-border-secondary", dark.borderSecondary.value);
    root.style.setProperty("--oe-brand-dark-focus-ring", dark.focusRing.value);
  }, [dark, light, palette]);

  const value = useMemo<BrandThemeContextValue>(() => ({
    seed,
    applySeed(nextSeed) {
      const normalized = nextSeed.toUpperCase();
      if (!/^#[0-9A-F]{6}$/.test(normalized)) return;
      window.localStorage.setItem(STORAGE_KEY, normalized);
      window.dispatchEvent(new Event(CHANGE_EVENT));
    },
  }), [seed]);

  return <BrandThemeContext.Provider value={value}>{children}</BrandThemeContext.Provider>;
}

function getBrandSeedSnapshot() {
  const savedSeed = window.localStorage.getItem(STORAGE_KEY);
  return savedSeed && /^#[0-9a-fA-F]{6}$/.test(savedSeed) ? savedSeed.toUpperCase() : DEFAULT_BRAND_SEED;
}

function subscribeToBrandSeed(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(CHANGE_EVENT, onStoreChange);
  };
}

export function useBrandTheme() {
  const context = useContext(BrandThemeContext);
  if (!context) throw new Error("useBrandTheme must be used within BrandThemeProvider");
  return context;
}
