// 단계 파일의 글자를 줄이는 두 가지를 고정한다. Figma 도 브라우저도 부르지 않는다.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { foldInstances, stripComments, stripLineComment, textsOf } from "./step-payload.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const builder = readFileSync(path.join(here, "builder.js"), "utf8");
const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;

test("줄 전체 주석과 빈 줄을 뺀다", () => {
  const out = stripComments("// 머리말\nconst a = 1;\n\n  // 들여 쓴 주석\nconst b = 2;\n");
  assert.equal(out, "const a = 1;\nconst b = 2;");
});

test("줄 끝 주석을 뺀다", () => {
  assert.equal(stripLineComment("const a = 1; // 설명"), "const a = 1;");
});

test("문자열 안의 // 는 주석으로 보지 않는다", () => {
  assert.equal(stripLineComment('const url = "https://example.com";'), 'const url = "https://example.com";');
  assert.equal(stripLineComment("const s = '가 // 나';"), "const s = '가 // 나';");
  assert.equal(stripLineComment("const s = `가 // 나`; // 설명"), "const s = `가 // 나`;");
});

test("따옴표를 escape 한 문자열 뒤의 주석도 뗀다", () => {
  assert.equal(stripLineComment('const s = "그는 \\"//\\" 라 했다"; // 설명'), 'const s = "그는 \\"//\\" 라 했다";');
});

test("builder.js 에는 블록 주석과 여러 줄 템플릿 문자열이 없다", () => {
  // 둘 중 하나라도 생기면 줄 단위로 주석을 떼는 방식이 틀린다.
  const code = builder.split("\n").filter((line) => !line.trim().startsWith("//")).join("\n");
  assert.equal(code.includes("/*"), false, "블록 주석이 생겼다. stripComments 를 다시 봐야 한다");
  const odd = code.split("\n").filter((line) => (line.split("`").length - 1) % 2 === 1);
  assert.deepEqual(odd, [], "여러 줄 템플릿 문자열이 생겼다. stripComments 를 다시 봐야 한다");
});

test("주석을 뺀 builder.js 가 그대로 async 함수 본문으로 파싱된다", () => {
  const stripped = stripComments(builder);
  assert.doesNotThrow(() => new AsyncFunction(stripped));
  assert.ok(stripped.length < builder.length);
});

test("prepare.mjs 가 찾아 바꾸는 자리는 주석을 빼도 남는다", () => {
  const stripped = stripComments(builder);
  for (const anchor of ["const SCREEN = __SCREEN__;", "const EXPECT = __EXPECT__;", "const RUN = __RUN__;"]) {
    assert.ok(stripped.includes(anchor), `${anchor} 가 사라졌다. 치환이 조용히 실패한다`);
  }
});

test("인스턴스 자리는 안쪽을 글자만 남기고 접는다", () => {
  const tree = {
    t: "f",
    k: [
      {
        t: "f",
        inst: "Input/outline·regular",
        w: 320,
        h: 36,
        k: [
          { t: "f", n: "input-leading", k: [{ t: "x", s: "아이디", fs: 14, c: { token: "oe-foreground-primary" } }] },
          { t: "rect", n: "칸막이" },
        ],
      },
    ],
  };
  foldInstances(tree);
  assert.deepEqual(tree.k[0].k, [{ t: "x", s: "아이디" }]);
  assert.equal(tree.k[0].inst, "Input/outline·regular", "인스턴스 이름과 크기는 그대로 둔다");
  assert.equal(tree.k[0].w, 320);
});

test("접은 뒤에도 builder 가 세는 글자 수와 차례가 같다", () => {
  const instance = () => ({
    t: "f",
    inst: "Field/기본",
    k: [
      { t: "f", k: [{ t: "x", s: "첫째" }] },
      { t: "x", s: "둘째" },
      { t: "f", k: [{ t: "f", k: [{ t: "x", s: "셋째" }] }] },
    ],
  });
  const before = textsOf(instance()).map((n) => n.s);
  const after = textsOf(foldInstances(instance())).map((n) => n.s);
  assert.deepEqual(after, before);
  assert.deepEqual(after, ["첫째", "둘째", "셋째"]);
});

test("글자가 없는 인스턴스는 자식을 지운다", () => {
  const node = { t: "f", inst: "Checkbox/rounded·on", k: [{ t: "f", n: "checkbox-indicator", k: [{ t: "svg", n: "RiCheckLine" }] }] };
  foldInstances(node);
  assert.equal("k" in node, false);
});

test("인스턴스가 아닌 자리는 그대로 둔다", () => {
  const tree = { t: "f", k: [{ t: "f", n: "form", k: [{ t: "x", s: "제목", fs: 16 }] }] };
  const copy = JSON.parse(JSON.stringify(tree));
  foldInstances(tree);
  assert.deepEqual(tree, copy);
});

test("인스턴스 안의 인스턴스는 따로 접지 않는다", () => {
  // 바깥이 이미 글자만 남기므로 안쪽 inst 는 payload 에 남지 않는다.
  const node = { t: "f", inst: "Field/기본", k: [{ t: "f", inst: "Input/outline·regular", k: [{ t: "x", s: "값" }] }] };
  foldInstances(node);
  assert.deepEqual(node.k, [{ t: "x", s: "값" }]);
});
