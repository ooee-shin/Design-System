// 결과 댓글의 컴포넌트 링크가 sandbox 「컴포넌트 보기」와 같은 표로 같은 주소를 여는지 고정한다.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { DOC_OF, STUDIO_DOC_KEYS, STUDIO_ORIGIN, componentLink, docKeyOf } from "./studio-links.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const map = readFileSync(path.join(root, "apps/sandbox/src/components/component-inspector/component-map.ts"), "utf8");

test("표가 sandbox 의 component-map.ts 와 같다 — 한쪽만 고치면 화면과 결과가 다른 문서를 연다", () => {
  const keysInMap = [...(map.match(/STUDIO_DOC_KEYS[^=]*=\s*\[([\s\S]*?)\];/)?.[1] ?? "").matchAll(/"([a-z-]+)"/g)].map((hit) => hit[1]);
  assert.deepEqual(STUDIO_DOC_KEYS, keysInMap);
  const docOfInMap = Object.fromEntries([...(map.match(/DOC_OF[^=]*=\s*\{([\s\S]*?)\};/)?.[1] ?? "").matchAll(/(\w+):\s*"([a-z-]+)"/g)].map((hit) => [hit[1], hit[2]]));
  assert.deepEqual(DOC_OF, docOfInMap);
  assert.equal(STUDIO_ORIGIN, map.match(/STUDIO_ORIGIN = "([^"]+)"/)?.[1]);
});

test("이름을 문서 key 로 푼다 — 짝은 본 컴포넌트로, 없는 것은 null", () => {
  assert.equal(docKeyOf("Button"), "button");
  assert.equal(docKeyOf("MessageBubble"), "message-bubble");
  assert.equal(docKeyOf("CheckboxField"), "checkbox");
  assert.equal(docKeyOf("RadioGroup"), "radio");
  assert.equal(docKeyOf("MultiSelect"), "select");
  assert.equal(docKeyOf("TypingIndicator"), "message-bubble");
  assert.equal(docKeyOf("AppHeader"), "app-header");
  assert.equal(docKeyOf("Table"), null);
});

test("문서가 있는 이름만 링크를 달고, 없는 이름은 글자 그대로다", () => {
  assert.equal(componentLink("Button"), "[Button](https://ooee-studio.pages.dev/components/button)");
  assert.equal(componentLink("Table"), "Table");
});
