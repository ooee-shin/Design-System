import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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
  PADDINGS,
  RADII,
} from "./index.ts";

test("control heights expose the shared form and button size scale", () => {
  assert.deepEqual(CONTROL_HEIGHTS, {
    xxsmall: 24,
    xsmall: 28,
    small: 32,
    regular: 36,
    large: 40,
    xlarge: 48,
    xxlarge: 56,
  });
});

test("every control height matches the css variable that exposes it", () => {
  const css = readFileSync(new URL("./styles.css", import.meta.url), "utf8");
  for (const [name, px] of Object.entries(CONTROL_HEIGHTS)) {
    const found = css.match(new RegExp(`--spacing-oe-control-${name}:\\s*([0-9.]+)rem`));
    assert.ok(found, `--spacing-oe-control-${name} 가 styles.css 에 없다`);
    assert.equal(Number(found[1]) * 16, px, `--spacing-oe-control-${name} 의 값이 CONTROL_HEIGHTS 와 다르다`);
  }
});

test("screen paddings expose the two steps a screen chooses between", () => {
  assert.deepEqual(PADDINGS, {
    default: 16,
    wide: 40,
  });
});

test("every screen padding matches the css variable that exposes it", () => {
  const css = readFileSync(new URL("./styles.css", import.meta.url), "utf8");
  for (const [name, px] of Object.entries(PADDINGS)) {
    const found = css.match(new RegExp(`--spacing-oe-padding-${name}:\\s*([0-9.]+)rem`));
    assert.ok(found, `--spacing-oe-padding-${name} 가 styles.css 에 없다`);
    assert.equal(Number(found[1]) * 16, px, `--spacing-oe-padding-${name} 의 값이 PADDINGS 와 다르다`);
  }
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

test("radius scale exposes one shared value for controls", () => {
  assert.deepEqual(RADII, {
    control: 8,
    sm: 6,
    md: 8,
    lg: 10,
    xl: 14,
    "2xl": 18,
    "3xl": 22,
    "4xl": 26,
  });
});

test("every radius step matches the css variable that exposes it", () => {
  const css = readFileSync(new URL("./styles.css", import.meta.url), "utf8");
  for (const [name, px] of Object.entries(RADII)) {
    const variable = name === "control" ? "--radius-oe-control" : `--radius-${name}`;
    const found = css.match(new RegExp(`${variable.replace("--", "--")}:\\s*([0-9.]+)rem`));
    assert.ok(found, `${variable} 가 styles.css 에 없다`);
    assert.equal(Number(found[1]) * 16, px, `${variable} 의 값이 RADII 와 다르다`);
  }
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
  assert.equal(light["--oe-background-control-off"], "var(--color-neutral-400)");
  assert.equal(dark["--oe-background-control-off"], "var(--color-neutral-500)");
  assert.equal(light["--oe-background-control-disabled"], "var(--color-neutral-300)");
  assert.equal(dark["--oe-background-control-disabled"], "var(--color-neutral-600)");
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

test("styles.css ships the same token values the source of truth declares", () => {
  const css = readFileSync(new URL("./styles.css", import.meta.url), "utf8");
  const block = (selector: string) => {
    const match = css.match(new RegExp(`\\${selector} \\{([^}]*)\\}`));
    assert.ok(match, `${selector} block is missing from styles.css`);
    return Object.fromEntries(
      match[1]
        .split("\n")
        .map((line) => line.trim().replace(/;$/, ""))
        .filter(Boolean)
        .map((line) => {
          const separator = line.indexOf(":");
          return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
        }),
    );
  };

  for (const mode of ["light", "dark"] as const) {
    const expected = createCoreSemanticCssVariables(mode);
    const actual = block(mode === "light" ? ":root" : ".dark");
    assert.deepEqual(actual, expected, `styles.css ${mode} block drifted from CORE_SEMANTIC_TOKENS`);
  }
});

test("the neutral foreground ladder has a named step below tertiary", () => {
  const find = (name: string) => CORE_SEMANTIC_TOKENS.find((token) => token.name === name);

  const tertiary = find("oe-foreground-tertiary");
  const subtle = find("oe-foreground-subtle");
  assert.ok(tertiary, "oe-foreground-tertiary 가 없다");
  assert.ok(subtle, "oe-foreground-subtle 가 없다");

  // tertiary 아래 한 단계다. Light 는 옅어지고 Dark 는 어두워진다.
  assert.equal(tertiary.light, "neutral-500");
  assert.equal(subtle.light, "neutral-400");
  assert.equal(tertiary.dark, "neutral-500");
  assert.equal(subtle.dark, "neutral-600");

  // `disabled` 와 값은 같지만 역할이 다르므로 별도 이름을 갖는다.
  const disabled = find("oe-foreground-disabled");
  assert.ok(disabled);
  assert.equal(disabled.light, subtle.light);
  assert.equal(disabled.dark, subtle.dark);
});

