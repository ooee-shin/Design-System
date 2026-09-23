// 무엇을 깨울지만 본다. gh 는 부르지 않는다.
import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";

import { decisionKey } from "./runner.mjs";
import { pickNew, pickUnprocessed, processKey, watchStateFile } from "./watch-decisions.mjs";

const read = (over) => ({ issue: 12, round: 1, decision: "승인", at: "2026-09-23T00:00:00Z", ...over });

test("처리할 결정만 깨우고 대기·결과 없음은 두고 본다", () => {
  const rows = [read(), read({ issue: 13, decision: "대기" }), read({ issue: 14, decision: "결과 없음" }), read({ issue: 15, decision: "개선" })];
  assert.deepEqual(pickNew(rows, {}).map((row) => row.issue), [12, 15]);
});

test("한 번 깨운 결정은 다시 깨우지 않는다 — 사람이 새 신호를 남기면 시각이 바뀌어 다시 깬다", () => {
  const row = read();
  assert.deepEqual(pickNew([row], { [decisionKey(row)]: {} }), []);
  const again = read({ at: "2026-09-23T01:00:00Z" });
  assert.deepEqual(pickNew([again], { [decisionKey(row)]: {} }), [again]);
});

test("결과 댓글이 없는 요청은 처리한다 — 이슈가 열릴 때 Actions 가 깨우던 자리다", () => {
  const rows = [read({ issue: 20, decision: "결과 없음" }), read({ issue: 21, decision: "대기" }), read({ issue: 22, decision: "결과 없음" })];
  assert.deepEqual(pickUnprocessed(rows, {}).map((row) => row.issue), [20, 22]);
});

test("한 번 처리한 요청은 멈췄어도 다시 처리하지 않는다 — 다시 돌리는 것은 사람이 한다", () => {
  const rows = [read({ issue: 20, decision: "결과 없음" })];
  assert.deepEqual(pickUnprocessed(rows, { [processKey(20)]: {} }), []);
  assert.notEqual(processKey(20), decisionKey(read({ issue: 20 })), "처리 열쇠와 결정 열쇠가 섞이면 안 된다");
});

test("깨운 기록은 러너의 상태와 같은 폴더에 다른 파일로 둔다", () => {
  const file = watchStateFile({ HARNESS_STATE_DIR: "/tmp/ooee" });
  assert.equal(file, path.join("/tmp/ooee", "dispatched.json"));
});
