import assert from "node:assert/strict";
import test from "node:test";

import {
  BRAND_ALPHA_STEPS,
  BRAND_STEPS,
  createBrandPalette,
  createBrandSemanticMapping,
  CORE_SEMANTIC_TOKENS,
  createCoreSemanticCssVariables,
  CONTROL_HEIGHTS,
  ICON_SIZES,
} from "./index.ts";

test("control heights expose the shared form and button size scale", () => {
  assert.deepEqual(CONTROL_HEIGHTS, {
    small: 32,
    regular: 36,
    large: 40,
    xlarge: 48,
  });
});

test("icon sizes expose the shared icon size scale", () => {
  assert.deepEqual(ICON_SIZES, {
    xsmall: 12,
    small: 16,
    medium: 20,
    large: 24,
    xlarge: 32,
  });
});

test("brand palette normalizes the source and creates every documented step", () => {
  const palette = createBrandPalette("  #6750a4 ");

  assert.equal(palette.source, "#6750A4");
  assert.deepEqual(Object.keys(palette.solid).map(Number), [...BRAND_STEPS]);
  assert.deepEqual(Object.keys(palette.alpha).map(Number), [...BRAND_ALPHA_STEPS]);
  assert.equal(palette.alpha[5], "rgb(103 80 164 / 5%)");
  assert.match(palette.solid[500], /^#[0-9a-f]{6}$/i);
});

test("core semantic tokens expose every status family through executable CSS variables", () => {
  const families = new Set(CORE_SEMANTIC_TOKENS.map((token) => token.family));
  assert.deepEqual([...families], ["neutral", "accent", "warning", "danger", "success", "info"]);
  const light = createCoreSemanticCssVariables("light");
  const dark = createCoreSemanticCssVariables("dark");
  assert.equal(light["--oe-warning-background-primary"], "var(--color-amber-50)");
  assert.equal(dark["--oe-success-background-bold-primary"], "var(--color-green-400)");
  assert.equal(light["--oe-background-canvas-secondary"], "var(--color-white)");
  assert.equal(light["--oe-foreground-placeholder"], "var(--color-neutral-400)");
  assert.equal(dark["--oe-foreground-placeholder"], "var(--color-neutral-500)");
  assert.equal(light["--oe-foreground-tertiary"], "var(--color-neutral-500)");
  assert.equal(dark["--oe-foreground-tertiary"], "var(--color-neutral-500)");
  assert.equal(light["--oe-background-disabled-selected"], "var(--color-neutral-400)");
  assert.equal(dark["--oe-background-disabled-selected"], "var(--color-neutral-400)");
  assert.equal(light["--oe-border-bold-primary"], "var(--color-neutral-950)");
  assert.equal(dark["--oe-border-bold-primary"], "var(--color-neutral-50)");
});

test("brand palette rejects values that are not six-digit hex colors", () => {
  assert.throws(() => createBrandPalette("#fff"), /six-digit hex/i);
  assert.throws(() => createBrandPalette("6750A4"), /six-digit hex/i);
});

test("semantic mappings preserve the documented light and dark roles", () => {
  const palette = createBrandPalette("#6750A4");
  const light = createBrandSemanticMapping(palette, "light");
  const dark = createBrandSemanticMapping(palette, "dark");

  assert.equal(light.foregroundPrimary.primitive, "brand-800");
  assert.equal(light.backgroundBoldPrimary.primitive, "brand-700");
  assert.equal(dark.foregroundPrimary.primitive, "brand-200");
  assert.equal(dark.backgroundBoldPrimary.primitive, "brand-400");
  assert.equal(light.focusRing.value, palette.solid[600]);
  assert.equal(dark.focusRing.value, palette.solid[400]);
});
