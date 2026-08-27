import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

test("cached brand variables are restored before the first painted frame", () => {
  const provider = readFileSync(join(process.cwd(), "apps/studio/src/components/brand-theme-provider.tsx"), "utf8");
  const layout = readFileSync(join(process.cwd(), "apps/studio/src/app/layout.tsx"), "utf8");

  assert.match(provider, /ooee-brand-theme-css/);
  assert.match(provider, /localStorage\.setItem\(THEME_CACHE_KEY/);
  assert.match(layout, /localStorage\.getItem\("ooee-brand-theme-css"\)/);
  assert.match(layout, /<head><script dangerouslySetInnerHTML/);
  assert.match(layout, /<html[^>]+suppressHydrationWarning/);
});
