// 지연 알림을 값으로 고정한다. Slack·기록을 건드리지 않고 순수 함수만 부른다.
import assert from "node:assert/strict";
import test from "node:test";

import { MARK, TIMES, slowNotice } from "./slow-notice.mjs";

const RUNS = [
  { kind: "처리", ok: true, minutes: 11 },
  { kind: "처리", ok: true, minutes: 12 },
  { kind: "처리", ok: true, minutes: 15 },
];

/** 2026-09-29T00:00Z 에 시작해 아직 끝나지 않은 실행. */
const running = (over = {}) => ({ stamp: "20260929T000000Z", mode: "처리", issue: 135, kind: "처리", text: "## 처리 #135\n", ...over });
const at = (minutes) => new Date(Date.UTC(2026, 8, 29, 0, minutes));

test("예상의 두 배를 넘기면 알린다 — 그 안이면 조용하다", () => {
  assert.equal(TIMES, 2);
  assert.equal(slowNotice(running(), RUNS, { now: at(25) }), null, "15분 예상의 두 배 안이다");
  const text = slowNotice(running(), RUNS, { now: at(31) });
  assert.match(text, /^⏳ 화면 요청 #135 처리가 예상보다 깁니다 — 31분 지났습니다\(보통 11~15분\)\./);
  assert.match(text, /기다리거나 개발자에게 알려 주세요/);
});

test("한 번만 알린다 — 표시가 있으면 조용하다", () => {
  const marked = running({ text: `## 처리 #135\n2026-09-29T00:31:00Z ${MARK}\n` });
  assert.equal(slowNotice(marked, RUNS, { now: at(45) }), null);
});

test("끝난 실행은 알리지 않는다", () => {
  const done = running({ text: "## 처리 #135\n2026-09-29T00:12:00Z 러너 끝 — exit 0\n" });
  assert.equal(slowNotice(done, RUNS, { now: at(99) }), null);
});

test("처리·개선만 본다 — 승인·반려·결과는 짧아 알리지 않는다", () => {
  for (const kind of ["승인", "반려", "결과"]) {
    const other = running({ mode: kind === "결과" ? "결과" : "결정", kind, text: `## #135 1회차 ${kind}\n` });
    assert.equal(slowNotice(other, RUNS, { now: at(99) }), null, `${kind} 는 알리지 않는다`);
  }
  const improve = running({ mode: "결정", kind: "개선", text: "## #135 2회차 개선\n" });
  assert.match(slowNotice(improve, RUNS, { now: at(99) }), /개선이 예상보다 깁니다/);
});

test("읽을 것이 없으면 조용하다", () => {
  assert.equal(slowNotice(null, RUNS, { now: at(99) }), null);
  assert.equal(slowNotice(running({ stamp: "아무말" }), RUNS, { now: at(99) }), null);
});
