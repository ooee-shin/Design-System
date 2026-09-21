import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { join } from "node:path";

import { componentRegistry, getComponentRelations } from "./component-registry";

test("component registry is the single complete catalog", () => {
  assert.equal(componentRegistry.length, 26);
  assert.equal(new Set(componentRegistry.map((item) => item.key)).size, componentRegistry.length);
});

test("확정 owns a detail page and 초안 does not", () => {
  const settled = componentRegistry.filter((item) => item.status === "확정");
  const draft = componentRegistry.filter((item) => item.status === "초안");

  assert.equal(settled.length, 20);
  assert.equal(draft.length, 6);
  assert.equal(settled.length + draft.length, componentRegistry.length);

  const hrefs = settled.map((item) => item.href);
  assert.equal(new Set(hrefs).size, settled.length);
  draft.forEach((item) => assert.equal(item.href, undefined));
});

test("every 확정 page uses the common detail shell", () => {
  componentRegistry.forEach((item) => {
    if (!item.href) return;
    const source = readFileSync(join(process.cwd(), "apps/studio/src/app", item.href, "page.tsx"), "utf8");
    assert.match(source, /ComponentDetailPage/);
    assert.match(source, new RegExp(`componentKey=["']${item.key}["']`));
  });
});

test("relations never point at a 초안 component, which has no page to open", () => {
  const draft = new Set(componentRegistry.filter((item) => item.status === "초안").map((item) => item.key));
  for (const item of componentRegistry) {
    for (const relation of [...(item.similar ?? []), ...(item.worksWith ?? [])]) {
      assert.equal(draft.has(relation), false, `${item.key} points at the draft ${relation}`);
    }
  }
});

test("the components index separates 확정 from 초안", () => {
  const source = readFileSync(join(process.cwd(), "apps/studio/src/app/components/page.tsx"), "utf8");
  assert.match(source, /확정/);
  assert.match(source, /초안/);
});

test("a card without a link shows 준비 중 instead of the open action", () => {
  const source = readFileSync(join(process.cwd(), "apps/studio/src/components/asset-group-page.tsx"), "utf8");
  assert.match(source, /item\.href \?/);
  assert.match(source, /준비 중/);
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
