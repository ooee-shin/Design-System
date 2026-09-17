// 단계 파일의 글자를 줄이는 두 가지를 고정한다. Figma 도 브라우저도 부르지 않는다.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { foldInstances, INSTANCE_FIELDS, stripComments, stripLineComment } from "./step-payload.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const builder = readFileSync(path.join(here, "builder.js"), "utf8");
const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;

/**
 * builder.js 본문에서 `textsOf` 를 그대로 뽑아 쓴다. 베껴 둔 사본이 아니라 진짜 builder 의 것으로
 * 견주어야, builder 쪽만 고쳐 차례가 갈라지는 순간 이 시험이 깨진다.
 */
const builderTextsOf = (() => {
  const match = builder.match(/function textsOf\(spec, acc = \[\]\) \{[\s\S]*?\n\}/);
  assert.ok(match, "builder.js 에서 textsOf 를 찾지 못했다. 이름이 바뀌었으면 이 시험도 고친다");
  return new Function(`${match[0]}\nreturn textsOf;`)();
})();

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
        n: "input-container",
        path: "admin:s0.1",
        x: 40,
        y: 120,
        w: 320,
        h: 36,
        inst: "Input/outline·regular",
        bg: { token: "oe-background-primary" },
        bd: { c: { token: "oe-border-secondary" }, w: [1, 1, 1, 1] },
        r: 8,
        l: { d: "H", g: 8, p: [0, 12, 0, 12], j: "flex-start", a: "center", wr: 0 },
        k: [
          { t: "f", n: "input-leading", k: [{ t: "x", s: "아이디", fs: 14, c: { token: "oe-foreground-primary" } }] },
          { t: "rect", n: "칸막이" },
        ],
      },
    ],
  };
  foldInstances(tree);
  const folded = tree.k[0];
  assert.deepEqual(folded.k, [{ t: "x", s: "아이디" }]);
  // 인스턴스 경로가 읽는 자리만 남는다. 칠·테두리·모서리·오토 레이아웃은 컴포넌트가 가진 값이다.
  assert.deepEqual(Object.keys(folded).sort(), ["h", "inst", "k", "n", "path", "t", "w", "x", "y"]);
});

test("접은 뒤에도 builder 의 textsOf 가 세는 글자 수와 차례가 같다", () => {
  const instance = () => ({
    t: "f",
    inst: "Field/기본",
    k: [
      { t: "f", k: [{ t: "x", s: "첫째" }] },
      { t: "x", s: "둘째" },
      { t: "f", k: [{ t: "f", k: [{ t: "x", s: "셋째" }] }] },
    ],
  });
  const before = builderTextsOf(instance()).map((n) => n.s);
  const after = builderTextsOf(foldInstances(instance())).map((n) => n.s);
  assert.deepEqual(after, before);
  assert.deepEqual(after, ["첫째", "둘째", "셋째"]);
});

test("접어서 남기는 자리가 builder 의 인스턴스 경로가 읽는 것과 같다", () => {
  // builder 의 인스턴스 분기가 spec 에서 읽는 이름을 뽑아 INSTANCE_FIELDS 와 견준다.
  const branch = builder.match(/if \(spec\.inst\) \{[\s\S]*?\n  \}/);
  assert.ok(branch, "builder.js 에서 인스턴스 분기를 찾지 못했다");
  const read = new Set([...branch[0].matchAll(/spec\.([a-zA-Z]+)/g)].map((m) => m[1]));
  read.add("t"); // 분기 밖에서 노드 종류를 가른다
  read.add("x"); // place() 가 좌표로 읽는다
  read.add("y");
  read.add("portal"); // place() 가 absolute 로 뺄지 가른다
  for (const field of read) {
    if (field === "k") continue; // 자식은 글자만 남기고 따로 다룬다
    assert.ok(INSTANCE_FIELDS.includes(field), `builder 는 spec.${field} 를 읽는데 접을 때 버린다`);
  }
});

test("글자가 없는 인스턴스도 접는다", () => {
  const node = { t: "f", n: "checkbox", w: 16, h: 16, inst: "Checkbox/rounded·on", bg: { token: "oe-brand-background-bold-primary" }, k: [{ t: "f", n: "checkbox-indicator", k: [{ t: "svg", n: "RiCheckLine" }] }] };
  foldInstances(node);
  assert.equal("k" in node, false);
  assert.equal("bg" in node, false);
  assert.equal(node.inst, "Checkbox/rounded·on");
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
