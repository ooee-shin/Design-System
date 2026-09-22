import "@/test-setup";

import assert from "node:assert/strict";
import { readdirSync, statSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { collectComponents, docKeyOf, identify, STUDIO_DOC_KEYS, tally } from "./component-map";

const html = (markup: string) => {
  const root = document.createElement("div");
  root.innerHTML = markup;
  return root;
};

test("뿌리 data-slot 만 세고 안쪽 조각은 세지 않는다", () => {
  const root = html(`
    <button data-slot="button"><span data-slot="button-label">담기</span></button>
    <div data-slot="field"><label data-slot="field-label">이름</label>
      <div data-slot="input-container"><input /></div>
    </div>`);
  assert.deepEqual(
    collectComponents(root).map(({ name }) => name),
    ["Button", "Field", "Input"],
  );
});

test("Input 과 NumberInput 은 안쪽 input 의 data-controls 로 가른다", () => {
  const root = html(`
    <div data-slot="input-container"><input /></div>
    <div data-slot="input-container"><input data-controls="true" /></div>`);
  assert.deepEqual(
    [...root.children].map((el) => identify(el)?.name),
    ["Input", "NumberInput"],
  );
});

test("Field 짝 안에 든 Checkbox·Radio·Switch 는 짝 하나로만 센다", () => {
  const root = html(`
    <label data-slot="checkbox-field"><span data-slot="checkbox"></span>동의</label>
    <span data-slot="checkbox"></span>
    <label data-slot="radio-field"><span data-slot="radio"></span>카드</label>
    <label data-slot="switch-field"><span data-slot="switch"></span>알림</label>`);
  assert.deepEqual(
    collectComponents(root).map(({ name }) => name),
    ["CheckboxField", "Checkbox", "RadioField", "SwitchField"],
  );
});

test("표식이 없는 요소와 모르는 data-slot 은 컴포넌트가 아니다", () => {
  const root = html(`<a class="btn">바로가기</a><div data-slot="card"></div>`);
  assert.deepEqual(collectComponents(root), []);
});

test("많이 쓴 것부터, 같으면 이름 순으로 센다", () => {
  const rows = tally([
    { name: "Input", key: "input" },
    { name: "Button", key: "button" },
    { name: "Input", key: "input" },
    { name: "Badge", key: "badge" },
  ]);
  assert.deepEqual(
    rows.map(({ name, count }) => `${name}×${count}`),
    ["Input×2", "Badge×1", "Button×1"],
  );
});

test("코드의 컴포넌트 이름은 그것을 다루는 Studio 문서로 간다", () => {
  assert.equal(docKeyOf("Button"), "button");
  assert.equal(docKeyOf("CheckboxField"), "checkbox");
  assert.equal(docKeyOf("RadioGroup"), "radio");
  assert.equal(docKeyOf("SelectBoxGroup"), "select-box");
  assert.equal(docKeyOf("MultiSelect"), "select");
  assert.equal(docKeyOf("MultiCombobox"), "combobox");
  assert.equal(docKeyOf("NumberInput"), "number-input");
  assert.equal(docKeyOf("TypingIndicator"), "message-bubble");
  assert.equal(docKeyOf("PartialMaskedInput"), null, "문서가 없는 컴포넌트에 주소를 만들었다");
});

test("sandbox 가 아는 문서 목록은 Studio 에 있는 문서와 같다", () => {
  const dir = path.join(process.cwd(), "..", "studio", "src", "app", "components");
  const studio = readdirSync(dir).filter((entry) => statSync(path.join(dir, entry)).isDirectory()).sort();
  assert.deepEqual([...STUDIO_DOC_KEYS].sort(), studio, "Studio 에 문서가 늘거나 줄었다. STUDIO_DOC_KEYS 를 맞춘다");
});
