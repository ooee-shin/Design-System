// 결과 댓글을 다는 좁은 길을 고정한다. gh 는 부르지 않는다 — 달 글과 인수만 본다.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { decide, readMarker } from "./decision.mjs";
import { buildResultPost } from "./post-result.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const inputFile = path.join(here, "fixtures", "result-input.example.json");
const example = () => JSON.parse(readFileSync(inputFile, "utf8"));

test("결과 댓글을 stdin 으로 넘기는 gh issue comment 인수를 만든다", () => {
  const { body, args } = buildResultPost(9, example());
  assert.deepEqual(args, ["issue", "comment", "9", "--body-file", "-"], "인수가 결과 댓글 한 장을 다는 꼴이 아니다");
  assert.deepEqual(readMarker(body), { issue: 9, round: 1 }, "달 글 끝에 이 이슈·회차의 표식이 없다");
});

test("달 글은 판독에서 결정이 아니라 결과 댓글로 읽힌다", () => {
  const { body } = buildResultPost(9, example());
  const read = decide({ comments: [{ id: 1, body, created_at: "2026-09-22T10:00:00Z", user: { login: "processor" } }], reactionsByCommentId: { 1: [] }, issue: 9 });
  assert.equal(read.decision, "대기", "결과 댓글 하나만 있으면 결정은 대기여야 한다");
  assert.equal(read.resultCommentId, 1, "달 글이 결과 댓글로 잡히지 않았다");
});

test("입력의 이슈 번호와 다르면 달지 않는다", () => {
  assert.throws(() => buildResultPost(4, example()), /결과 댓글을 달지 않는다: 입력의 이슈 번호\(9\)가 4 와 다르다/);
});

test("이슈 번호가 없거나 잘못되면 달지 않는다", () => {
  for (const bad of [0, -1, 1.5, Number.NaN, "9"]) {
    assert.throws(() => buildResultPost(bad, example()), /결과 댓글을 달지 않는다: 이슈 번호가 없다/, `${String(bad)} 를 받았다`);
  }
});

test("양식이 만들기를 거부하면 달지 않는다", () => {
  const input = example();
  input.checks[0].passed = false;
  assert.throws(() => buildResultPost(9, input), /결과 댓글을 만들지 않는다/, "실패한 검사를 가진 결과가 올라갈 뻔했다");
});

test("CLI 는 인수가 모자라면 gh 를 부르지 않고 종료 코드 2 로 끝난다", () => {
  const script = path.join(here, "post-result.mjs");
  for (const argv of [[], ["9"], ["abc", inputFile], ["9", inputFile, "--extra"]]) {
    let code = 0;
    try {
      execFileSync(process.execPath, [script, ...argv], { encoding: "utf8", stdio: "pipe", env: { ...process.env, PATH: "" } });
    } catch (error) {
      code = error.status;
    }
    assert.equal(code, 2, `인수 ${JSON.stringify(argv)} 에서 종료 코드가 2가 아니다`);
  }
});
