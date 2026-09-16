// 되읽기(④)의 차이 판정을 확인한다. Figma 도 브라우저도 부르지 않는다.
// spec 은 prepare.mjs 가 남기는 해석된 사양, figma 는 reread.js 가 돌려주는 프레임 JSON 이다.
import assert from "node:assert/strict";
import test from "node:test";

import { diffFrame, fromRows } from "./reread.mjs";

/** 코드에서 그린 사양: 루트 프레임 > 버튼(칠 토큰) > 글자, 그리고 아이콘 하나. */
const spec = () => ({
  path: "voc:s0",
  n: "main",
  t: "f",
  w: 1440,
  h: 900,
  bg: { token: "oe-background-primary" },
  k: [
    {
      path: "voc:s0.0",
      n: "button",
      t: "f",
      w: 78,
      h: 36,
      r: 8,
      bg: { primitive: "brand-600" },
      k: [
        { path: "voc:s0.0.0", n: "button-label", t: "x", w: 48, h: 20, s: "내보내기", fs: 14, c: { token: "oe-foreground-inverse" } },
        { path: "voc:s0.0.1", n: "icon", t: "svg", icon: "RiDownloadLine", w: 16, h: 16, c: { token: "oe-foreground-inverse" } },
      ],
    },
  ],
});

/** Figma 에서 다시 읽은 프레임. 인자로 준 만큼만 사양과 달라진다. */
const figma = (overrides = {}) => {
  const nodes = [
    { p: "voc:s0", n: "main", t: "f", x: 0, y: 0, w: 1440, h: 900, bg: { v: "oe-background-primary" } },
    { p: "voc:s0.0", n: "button", t: "f", x: 24, y: 24, w: 78, h: 36, r: 8, bg: { v: "brand-600" } },
    { p: "voc:s0.0.0", n: "button-label", t: "x", x: 38, y: 32, w: 48, h: 20, s: "내보내기", fs: 14, st: "oe/text-sm/medium", c: { v: "oe-foreground-inverse" } },
    { p: "voc:s0.0.1", n: "RiDownloadLine", t: "f", x: 90, y: 34, w: 16, h: 16, c: { v: "oe-foreground-inverse" } },
  ];
  const patched = nodes.map((node) => (overrides[node.p] === undefined ? node : overrides[node.p] === null ? null : { ...node, ...overrides[node.p] })).filter(Boolean);
  return { name: "고객의 소리 / 목록 · Desktop 1440", build: "voc|s0|54c5c78|2026-09-16", nodes: [...patched, ...(overrides.extra || [])] };
};

test("사람이 고치지 않았으면 차이가 없다", () => {
  assert.deepEqual(diffFrame(spec(), figma()), []);
});

test("칠을 다른 토큰으로 바꾸면 자동으로 되돌릴 수 있다", () => {
  const changes = diffFrame(spec(), figma({ "voc:s0": { bg: { v: "oe-background-secondary" } } }));
  assert.equal(changes.length, 1);
  assert.deepEqual(
    { ...changes[0] },
    { p: "voc:s0", kind: "색", from: "oe-background-primary", to: "oe-background-secondary", auto: true, hint: "class 의 bg-oe-background-primary 를 bg-oe-background-secondary 로 바꾼다" },
  );
});

test("primitive 단계를 바꾸면 var() 자리로 안내한다", () => {
  const [change] = diffFrame(spec(), figma({ "voc:s0.0": { bg: { v: "brand-800" } } }));
  assert.equal(change.auto, true);
  assert.match(change.hint, /bg-\[var\(--brand-800\)\]/);
});

test("변수에 묶이지 않은 색은 사람이 정한다", () => {
  const [change] = diffFrame(spec(), figma({ "voc:s0.0": { bg: { hex: "#217346" } } }));
  assert.equal(change.auto, false);
  assert.equal(change.to, "#217346");
});

test("문구와 아이콘은 그대로 옮긴다", () => {
  const changes = diffFrame(spec(), figma({ "voc:s0.0.0": { s: "내려받기" }, "voc:s0.0.1": { n: "RiFileExcelLine" } }));
  assert.deepEqual(changes.map((c) => [c.kind, c.auto]), [["글자", true], ["아이콘", true]]);
});

test("글자 크기는 oe/text-* 단계에 있을 때만 자동이다", () => {
  const [step] = diffFrame(spec(), figma({ "voc:s0.0.0": { fs: 16 } }));
  assert.equal(step.auto, true);
  assert.match(step.hint, /text-base/);
  const [off] = diffFrame(spec(), figma({ "voc:s0.0.0": { fs: 15 } }));
  assert.equal(off.auto, false);
});

test("크기와 모서리는 사람이 정한다", () => {
  const changes = diffFrame(spec(), figma({ "voc:s0.0": { w: 96, r: 12 } }));
  assert.deepEqual(changes.map((c) => c.kind), ["크기", "모서리"]);
  assert.equal(changes.every((c) => !c.auto), true);
});

test("Figma 에서 지운 자리와 새로 만든 자리는 사람이 정한다", () => {
  const removed = diffFrame(spec(), figma({ "voc:s0.0.1": null }));
  assert.deepEqual(removed.map((c) => [c.kind, c.p]), [["삭제", "voc:s0.0.1"]]);
  const added = diffFrame(spec(), figma({ extra: [{ n: "새 배지", t: "f", x: 0, y: 0, w: 40, h: 20 }] }));
  assert.deepEqual(added.map((c) => [c.kind, c.auto]), [["추가", false]]);
});

test("줄로 온 결과를 객체로 편다", () => {
  const frame = fromRows({
    name: "f",
    cols: ["p", "n", "t", "w", "h", "bg", "c", "bd", "r", "s", "fs", "st"],
    rows: [
      ["voc:s0", "main", "f", 1440, 900, "oe-background-primary", "", "", 0, "", 0, ""],
      ["voc:s0.0", "button", "f", 78, 36, "#217346", "", "oe-border-secondary", 8, "", 0, ""],
      ["voc:s0.0.0", "", "x", 48, 20, "", "oe-foreground-inverse", "", 0, "내보내기", 14, "oe/text-sm/medium"],
    ],
  });
  assert.deepEqual(frame.nodes[0], { p: "voc:s0", n: "main", t: "f", w: 1440, h: 900, bg: { v: "oe-background-primary" } });
  assert.deepEqual(frame.nodes[1].bg, { hex: "#217346" });
  assert.deepEqual(frame.nodes[1].bd, { c: { v: "oe-border-secondary" } });
  assert.deepEqual(frame.nodes[2], { p: "voc:s0.0.0", n: "", t: "x", w: 48, h: 20, c: { v: "oe-foreground-inverse" }, s: "내보내기", fs: 14, st: "oe/text-sm/medium" });
});

test("인스턴스는 주 컴포넌트 이름으로 견주고 안쪽은 보지 않는다", () => {
  const spec = {
    path: "voc:s0",
    n: "main",
    t: "f",
    w: 100,
    h: 40,
    k: [
      {
        path: "voc:s0.0",
        n: "button",
        t: "f",
        w: 80,
        h: 36,
        inst: "Button/fill·brand·regular",
        k: [{ path: "voc:s0.0.0", n: "button-label", t: "x", w: 40, h: 20, s: "보내기" }],
      },
    ],
  };
  const same = diffFrame(spec, {
    name: "f",
    nodes: [
      { p: "voc:s0", n: "main", t: "f", w: 100, h: 40 },
      { p: "voc:s0.0", n: "button", t: "i", w: 80, h: 36, st: "Button/fill·brand·regular" },
    ],
  });
  assert.deepEqual(same, []);

  const swapped = diffFrame(spec, {
    name: "f",
    nodes: [
      { p: "voc:s0", n: "main", t: "f", w: 100, h: 40 },
      { p: "voc:s0.0", n: "button", t: "i", w: 80, h: 36, st: "Button/outline·brand·regular" },
    ],
  });
  assert.deepEqual(
    swapped.map((c) => [c.kind, c.from, c.to, c.auto]),
    [["컴포넌트", "Button/fill·brand·regular", "Button/outline·brand·regular", false]],
  );
});
