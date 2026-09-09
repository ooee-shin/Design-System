import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { join } from "node:path";

import { componentRegistry, getComponentRelations } from "./component-registry";

test("component registry is the single complete catalog for detail pages", () => {
  assert.equal(componentRegistry.length, 15);
  assert.equal(new Set(componentRegistry.map((item) => item.key)).size, componentRegistry.length);
  assert.equal(new Set(componentRegistry.map((item) => item.href)).size, componentRegistry.length);
});

test("every registered page uses the common detail shell", () => {
  componentRegistry.forEach((item) => {
    const source = readFileSync(join(process.cwd(), "apps/studio/src/app", item.href, "page.tsx"), "utf8");
    assert.match(source, /ComponentDetailPage/);
    assert.match(source, new RegExp(`componentKey=["']${item.key}["']`));
  });
});

test("Field stays first in Works with and resolves from the registry itself", () => {
  const field = componentRegistry.find((item) => item.key === "field");
  assert.ok(field);
  assert.equal(field.href, "/components/field");

  for (const item of componentRegistry) {
    if (!item.worksWith?.includes("field")) continue;
    assert.equal(item.worksWith[0], "field");
    const relations = getComponentRelations(item.key);
    assert.equal(relations.worksWithItems[0]?.title, "Field");
    assert.equal(relations.worksWithItems[0]?.description, field.description);
  }
});

test("component detail pages provide a first-tab shortcut to the playground", () => {
  const navigation = readFileSync(join(process.cwd(), "apps/studio/src/components/studio-navigation.tsx"), "utf8");
  const preview = readFileSync(join(process.cwd(), "apps/studio/src/components/studio-preview-frame.tsx"), "utf8");

  assert.match(navigation, /href="#studio-preview"/);
  assert.match(navigation, /Playground로 바로 이동/);
  assert.match(navigation, /isComponentDetail/);
  assert.match(preview, /id="studio-preview"/);
  assert.match(preview, /tabIndex=\{-1\}/);
});
