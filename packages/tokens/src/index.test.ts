import assert from "node:assert/strict";
import test from "node:test";

import {
  BRAND_ALPHA_STEPS,
  BRAND_STEPS,
  createBrandPalette,
  createBrandSemanticMapping,
} from "./index.ts";

test("brand palette normalizes the source and creates every documented step", () => {
  const palette = createBrandPalette("  #6750a4 ");

  assert.equal(palette.source, "#6750A4");
  assert.deepEqual(Object.keys(palette.solid).map(Number), [...BRAND_STEPS]);
  assert.deepEqual(Object.keys(palette.alpha).map(Number), [...BRAND_ALPHA_STEPS]);
  assert.equal(palette.alpha[5], "rgb(103 80 164 / 5%)");
  assert.match(palette.solid[500], /^#[0-9a-f]{6}$/i);
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
