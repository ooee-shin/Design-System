import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { join } from "node:path";

import { componentRegistry, getComponentRelations } from "./component-registry";

test("component registry is the single complete catalog for detail pages", () => {
  assert.equal(componentRegistry.length, 12);
  assert.equal(new Set(componentRegistry.map((item) => item.key)).size, componentRegistry.length);
  assert.equal(new Set(componentRegistry.map((item) => item.href)).size, componentRegistry.length);
  componentRegistry.forEach((item) => assert.match(item.updatedAt, /^20\d{2}\.\d{2}\.\d{2}$/));
});

test("every registered page uses the common detail shell", () => {
  componentRegistry.forEach((item) => {
    const source = readFileSync(join(process.cwd(), "apps/studio/src/app", item.href, "page.tsx"), "utf8");
    assert.match(source, /ComponentDetailPage/);
    assert.match(source, new RegExp(`componentKey=["']${item.key}["']`));
  });
});

test("Field stays first in Works with and is clearly marked as planned", () => {
  for (const item of componentRegistry) {
    if (!item.worksWith?.includes("field")) continue;
    assert.equal(item.worksWith[0], "field");
    const relations = getComponentRelations(item.key);
    assert.equal(relations.worksWithItems[0]?.title, "Field");
    assert.match(relations.worksWithItems[0]?.description ?? "", /준비 단계/);
  }
});
