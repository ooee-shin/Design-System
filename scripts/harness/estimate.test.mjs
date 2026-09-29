// 예상 시간을 값으로 고정한다. 기록은 임시 폴더에 지어 쓰므로 이 Mac 의 실제 기록에 기대지 않는다.
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { ENOUGH, SAMPLE, SEED, TRIM_FROM, estimate, readRun, readRuns, saying, sayingFor } from "./estimate.mjs";

/** 기록 파일 하나. `분` 만큼 걸리고 `exit` 로 끝난 실행이다. */
function log({ stamp, mode = "처리", issue = 60, 분 = 12, exit = 0, kind = null }) {
  const from = Date.parse(`${stamp.slice(0, 4)}-${stamp.slice(4, 6)}-${stamp.slice(6, 8)}T${stamp.slice(9, 11)}:${stamp.slice(11, 13)}:${stamp.slice(13, 15)}Z`);
  const to = new Date(from + 분 * 60000).toISOString();
  const lines = [`${new Date(from).toISOString()} ## ${mode} #${issue}`];
  if (kind) lines.push(`## #${issue} 1회차 ${kind} (누군가 · ${new Date(from).toISOString()})`);
  lines.push(`${to} 러너 끝 — exit ${exit}`);
  return { name: `${stamp}-${mode}-${issue}.log`, text: `${lines.join("\n")}\n` };
}

/** 임시 상태 폴더에 기록을 깐다. */
function stateWith(files) {
  const dir = mkdtempSync(path.join(os.tmpdir(), "ooee-estimate-"));
  mkdirSync(path.join(dir, "runs"), { recursive: true });
  for (const file of files) writeFileSync(path.join(dir, "runs", file.name), file.text);
  return dir;
}

/** `2026-09-29T00:00Z` 에서 n 분 뒤. 이름순이 시간순이고 언제나 실제로 있는 시각이다. */
const stamp = (n) => new Date(Date.UTC(2026, 8, 29) + n * 60000).toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");

test("기록 하나를 이름과 내용에서 읽는다 — 모드·이슈·걸린 시간·성공 여부·사람이 누른 것", () => {
  const one = log({ stamp: stamp(1), mode: "결정", issue: 113, 분: 12.6, kind: "개선" });
  assert.deepEqual(readRun(one.name, one.text), { stamp: stamp(1), mode: "결정", issue: 113, kind: "개선", minutes: 12.6, ok: true });

  const plain = log({ stamp: stamp(2), mode: "처리", issue: 135, 분: 9.9, exit: 1 });
  const read = readRun(plain.name, plain.text);
  assert.equal(read.kind, "처리", "결정 줄이 없으면 모드 이름을 쓴다");
  assert.equal(read.ok, false, "exit 1 은 성공이 아니다");
});

test("읽을 수 없는 기록은 건너뛴다 — 고장 난 파일 하나가 전체를 막지 않는다", () => {
  assert.equal(readRun("아무말.log", "무엇"), null, "이름 꼴이 아니다");
  assert.equal(readRun(`${stamp(3)}-처리-1.log`, ""), null, "빈 파일이다");
  assert.equal(readRun(`${stamp(4)}-처리-1.log`, "시각이 없다\n러너 끝 — exit 0\n"), null, "시각이 없다");
  const back = `${new Date(Date.UTC(2026, 8, 29, 2, 0, 0)).toISOString()} 시작\n${new Date(Date.UTC(2026, 8, 29, 1, 0, 0)).toISOString()} 러너 끝 — exit 0\n`;
  assert.equal(readRun(`${stamp(5)}-처리-1.log`, back), null, "끝이 시작보다 앞이다");

  const dir = stateWith([log({ stamp: stamp(6), 분: 11 }), { name: "깨진.log", text: "" }, { name: `${stamp(7)}-처리-2.log`, text: "시각 없음" }]);
  assert.equal(readRuns(dir).length, 1, "읽힌 것만 센다");
  assert.deepEqual(readRuns(path.join(dir, "없는자리")), [], "폴더가 없으면 빈 목록이다");
});

test("세 건이 안 되면 씨앗을 쓴다 — 한두 건의 중간값은 그 한두 건일 뿐이다", () => {
  const dir = stateWith([log({ stamp: stamp(10), 분: 30 }), log({ stamp: stamp(11), 분: 31 })]);
  const est = estimate("처리", readRuns(dir));
  assert.equal(est.source, "씨앗");
  assert.equal(est.n, 2);
  assert.deepEqual({ low: est.low, high: est.high, median: est.median }, SEED.처리);
  assert.equal(ENOUGH, 3);
});

test("세 건부터 기록을 쓴다 — 성공한 실행만 세고 실패는 세지 않는다", () => {
  const dir = stateWith([
    log({ stamp: stamp(20), 분: 11 }),
    log({ stamp: stamp(21), 분: 12 }),
    log({ stamp: stamp(22), 분: 14 }),
    log({ stamp: stamp(23), 분: 142, exit: 1 }),
  ]);
  const est = estimate("처리", readRuns(dir));
  assert.deepEqual(est, { low: 11, high: 14, median: 12, n: 3, source: "기록" });
  assert.ok(est.high < 142, "실패한 142분이 예상을 늘리면 안 된다");
  assert.equal(TRIM_FROM, 5, "다섯 건이 안 되면 양 끝을 떼지 않는다");
});

test("최신 열 건까지만 본다 — 깨져 있던 시절의 이상값을 끌고 오지 않는다", () => {
  const old = Array.from({ length: 3 }, (_, i) => log({ stamp: stamp(30 + i), 분: 90 }));
  const recent = Array.from({ length: 10 }, (_, i) => log({ stamp: stamp(40 + i), 분: 12 }));
  const est = estimate("처리", readRuns(stateWith([...old, ...recent])));
  assert.equal(SAMPLE, 10);
  assert.deepEqual(est, { low: 12, high: 12, median: 12, n: 10, source: "기록" });
});

test("종류마다 숫자가 다르다 — 승인은 모델을 부르지 않아 짧고 개선은 다시 만들어 길다", () => {
  const runs = readRuns(
    stateWith([
      ...Array.from({ length: 3 }, (_, i) => log({ stamp: stamp(50 + i), mode: "결정", kind: "승인", 분: 6 })),
      ...Array.from({ length: 3 }, (_, i) => log({ stamp: stamp(60 + i), mode: "결정", kind: "개선", 분: 13 })),
    ]),
  );
  assert.equal(estimate("승인", runs).median, 6);
  assert.equal(estimate("개선", runs).median, 13);
  assert.notEqual(saying("승인", estimate("승인", runs)), saying("개선", estimate("개선", runs)));
});

test("문구는 약속하지 않는다 — 「보통 …」 이고 끝나는 시각을 말하지 않는다", () => {
  const 기록 = saying("처리", { low: 11, high: 14, median: 12, n: 7, source: "기록" });
  assert.equal(기록, "보통 11~14분 걸립니다(기록 7건의 중간값 12분).");
  const 씨앗 = saying("승인", { ...SEED.승인, n: 0, source: "씨앗" });
  assert.equal(씨앗, "보통 5~7분 걸립니다(아직 기록이 없어 지난 측정값입니다).");
  assert.notEqual(기록, 씨앗, "기록과 씨앗은 다르게 말한다");
  for (const text of [기록, 씨앗]) {
    assert.match(text, /^보통 /);
    assert.doesNotMatch(text, /뒤 끝|까지 끝|분에 끝/, "끝나는 시각을 약속하지 않는다");
  }
  assert.equal(saying("결과", { low: 2, high: 2, median: 2, n: 4, source: "기록" }), "보통 2분 걸립니다(기록 4건의 중간값 2분).");
});

test("상태 폴더가 없어도 던지지 않고 씨앗으로 말한다", () => {
  const said = sayingFor("처리", path.join(os.tmpdir(), "ooee-없는자리-", String(process.pid)));
  assert.equal(said, saying("처리", { ...SEED.처리, n: 0, source: "씨앗" }));
});

test("모르는 종류는 처리로 본다 — 숫자가 없어 말하지 못하는 것보다 낫다", () => {
  assert.deepEqual(estimate("아무것", []), { ...SEED.처리, n: 0, source: "씨앗" });
});

test("다섯 건부터 양 끝을 하나씩 뗀다 — 「할 일이 없어 30초에 끝난 승인」 이 폭을 망치지 않는다", () => {
  const runs = readRuns(
    stateWith([
      log({ stamp: stamp(300), mode: "결정", kind: "승인", 분: 0.1 }),
      ...[5.4, 5.6, 5.9, 5.9].map((분, i) => log({ stamp: stamp(310 + i), mode: "결정", kind: "승인", 분 })),
    ]),
  );
  const est = estimate("승인", runs);
  assert.deepEqual({ low: est.low, high: est.high, n: est.n }, { low: 5, high: 6, n: 5 });
  assert.ok(est.low > 1, "0.1분짜리가 폭의 아래끝이 되면 안 된다");
});
