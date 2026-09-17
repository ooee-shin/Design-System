// 단계 파일의 글자를 줄이는 두 가지를 고정한다. Figma 도 브라우저도 부르지 않는다.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { buildDriver, fnv, foldInstances, INSTANCE_FIELDS, loaderCode, loaderSteps, stripComments, stripLineComment } from "./step-payload.mjs";

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

test("builder.js 에 // 를 품은 정규식 리터럴이 없다", () => {
  // stripLineComment 는 따옴표만 따라가고 정규식 리터럴은 모른다. `/^https?:\/\//` 같은 것이 생기면
  // 그 줄이 가운데서 잘린다. 아래 파싱 시험이 결국 잡아 주지만, 여기서 까닭까지 알려 주는 편이 낫다.
  const bad = builder
    .split("\n")
    .filter((line) => !line.trim().startsWith("//"))
    .filter((line) => [...line.matchAll(/\/(?![/*])(?:\\.|\[(?:\\.|[^\]])*\]|[^/\n\\])+\//g)].some((m) => m[0].includes("//")));
  assert.deepEqual(bad, [], "// 를 품은 정규식 리터럴이 생겼다. stripComments 를 다시 봐야 한다");
});

test("주석을 뗀 builder.js 는 원본과 공백만 다르다", () => {
  // 주석 말고 다른 것을 지우면 여기서 갈린다. 파싱 시험만으로는 「문법은 맞지만 뜻이 달라진」 것을 못 잡는다.
  const bare = (source) => source.split("\n").map(stripLineComment).join("\n").replace(/\s+/g, "");
  assert.equal(bare(stripComments(builder)), bare(builder));
});

test("주석을 뺀 builder.js 가 그대로 async 함수 본문으로 파싱된다", () => {
  const stripped = stripComments(builder);
  assert.doesNotThrow(() => new AsyncFunction(stripped));
  assert.ok(stripped.length < builder.length);
});

test("builder 가 ARGS 로 값을 받는 자리는 주석을 빼도 남는다", () => {
  const stripped = stripComments(builder);
  assert.ok(stripped.includes("const { SCREEN, EXPECT, RUN } = ARGS;"), "ARGS 를 푸는 줄이 사라졌다. build 단계가 값을 넘길 자리가 없어진다");
});

test("loader 단계는 builder 를 줄 배열로 싣고 해시로 지킨다", () => {
  const code = loaderCode("const a = 1;\nconst b = 2;");
  assert.ok(code.includes('"const a = 1;"'), "코드를 줄 배열로 싣는다. 한 줄짜리 긴 문자열은 옮겨 적다 접히면 깨진다");
  assert.ok(code.includes(`const EXPECT = ${fnv("const a = 1;\nconst b = 2;")};`));
  assert.ok(code.includes("setSharedPluginData"), "문서에 저장해야 다음 단계가 꺼내 쓴다");
  assert.doesNotThrow(() => new AsyncFunction(code));
});

test("build 단계는 조각만 싣고 문서의 builder 를 꺼내 쓴다", () => {
  const runBody = '[{"frameName":"f","nodes":[]}]';
  const code = buildDriver({ screenName: "관리자 로그인", expect: 111, builderHash: 222, runBody });
  assert.ok(!code.includes("figma.createFrame"), "builder 본문이 단계에 실리면 안 된다");
  assert.ok(code.includes("getSharedPluginData"), "문서에서 꺼내 쓴다");
  assert.ok(code.includes("const BUILDER = 222;"), "이번 단계가 기대하는 builder 인지 해시로 가른다");
  assert.ok(code.includes("const EXPECT = 111;"), "조각 내용도 해시로 지킨다");
  assert.ok(code.length < 1500, `driver 는 작아야 한다. 지금 ${code.length}자`);
  assert.doesNotThrow(() => new AsyncFunction(code));
});

test("builder 가 한 단계에 안 들어가면 조각으로 나눠 보낸다", () => {
  const source = stripComments(builder);
  const parts = loaderSteps(source, 4000);
  assert.ok(parts.length >= 3, `4,000자 한도면 여러 조각이어야 한다. 지금 ${parts.length}개`);
  for (const [i, code] of parts.entries()) {
    assert.ok(code.length < 5200, `${i}번 조각이 너무 크다: ${code.length}자`);
    assert.ok(code.includes(`const PART = ${i};`));
    assert.ok(code.includes(`const LAST = ${i === parts.length - 1};`));
    assert.doesNotThrow(() => new AsyncFunction(code));
  }
  // 첫 조각만 처음부터 쓰고 나머지는 앞에 이어 붙인다. 순서를 건너뛰면 멈춘다.
  assert.ok(parts[0].includes('const prev = PART === 0 ? "" : figma.root.getSharedPluginData(TAG, KEY);'));
  assert.ok(parts[1].includes("앞의 「builder 를 문서에 둔다」 조각이 없다"));
});

test("조각을 이어 붙이면 원본과 글자까지 같다", () => {
  const source = stripComments(builder);
  const joined = loaderSteps(source, 4000)
    .map((code) => {
      const body = code.slice(code.indexOf("const CODE = [") + "const CODE = [".length, code.indexOf('].join("\\n");'));
      return JSON.parse(`[${body}]`).join("\n");
    })
    .join("\n");
  assert.equal(joined, source);
  assert.ok(loaderSteps(source, 4000).at(-1).includes(`const EXPECT = ${fnv(source)};`), "마지막 조각이 전체 해시를 본다");
});

test("loader 가 실은 코드를 그대로 되돌려 준다", () => {
  // 옮겨 적기만 맞으면 문서에 들어가는 것이 원본과 같아야 한다. 줄 배열로 나눴다 합치는 자리를 확인한다.
  const source = stripComments(builder);
  const code = loaderCode(source);
  const lines = code.slice(code.indexOf("const CODE = [") + "const CODE = [".length, code.indexOf('].join("\\n");'));
  const joined = JSON.parse(`[${lines}]`).join("\n");
  assert.equal(joined, source);
  assert.equal(fnv(joined), fnv(source));
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
