// 어디서 무엇을 돌리는지만 본다. git·pnpm·러너는 부르지 않는다.
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { PREPARE, runLocal, runLogFile, runnerArgs, workDir } from "./local-run.mjs";

test("작업 사본은 상태 폴더 아래 harness 이고 HARNESS_WORK_DIR 로 옮긴다 — 개발자의 clone 에서는 돌지 않는다", () => {
  assert.equal(workDir({ HARNESS_STATE_DIR: "/tmp/ooee" }), path.join("/tmp/ooee", "harness"));
  assert.equal(workDir({ HARNESS_STATE_DIR: "/tmp/ooee", HARNESS_WORK_DIR: "/tmp/work" }), "/tmp/work");
});

test("기록 파일은 시각·모드·이슈로 이름 짓는다 — 이름순이 시간순이다", () => {
  const file = runLogFile("처리", 60, { env: { HARNESS_STATE_DIR: "/tmp/ooee" }, now: new Date("2026-09-23T08:30:15.123Z") });
  assert.equal(file, path.join("/tmp/ooee", "runs", "20260923T083015Z-처리-60.log"));
  assert.match(runLogFile("결정", null, { env: { HARNESS_STATE_DIR: "/tmp/ooee" } }), /-결정-전부\.log$/);
});

test("러너 인수는 모드 셋과 숫자 이슈만 받는다", () => {
  assert.deepEqual(runnerArgs("처리", 60), ["scripts/harness/runner.mjs", "처리", "60"]);
  assert.deepEqual(runnerArgs("결정"), ["scripts/harness/runner.mjs", "결정"]);
  assert.throws(() => runnerArgs("배포", 1), /모르는 모드/);
  assert.throws(() => runnerArgs("처리", "60; rm"), /이슈 번호가 아니다/);
});

test("돌기 전에 dev 로 맞추고 남은 파일을 지우고 의존성을 맞춘다 — actions/checkout 이 하던 일이다", () => {
  const lines = PREPARE.map(([cmd, args]) => `${cmd} ${args.join(" ")}`);
  assert.deepEqual(lines, ["git fetch -q origin dev", "git checkout -q -B dev origin/dev", "git clean -qfd", "pnpm install --frozen-lockfile"]);
  assert.ok(!lines.some((line) => line.includes("-x")), "node_modules 까지 지우면 매번 처음부터 설치한다");
});

test("작업 사본이 없으면 돌리지 않고 설치 안내로 던진다", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "ooee-local-run-"));
  assert.throws(() => runLocal("처리", 1, { env: { HARNESS_WORK_DIR: dir, HARNESS_STATE_DIR: dir } }), /작업 사본이 없다/);
});
