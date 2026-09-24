// 토큰 파일 읽기만 본다.
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { loadEnv } from "./slack-env.mjs";

const fileWith = (text) => {
  const file = path.join(mkdtempSync(path.join(tmpdir(), "slack-env-")), "slack.env");
  writeFileSync(file, text);
  return file;
};

test("KEY=값 줄을 읽고 주석과 빈 줄은 넘긴다", () => {
  const env = loadEnv(fileWith("# 주석\n\nSLACK_APP_TOKEN=xapp-1\nSLACK_BOT_TOKEN=\"xoxb-2\"\n"), {});
  assert.equal(env.SLACK_APP_TOKEN, "xapp-1");
  assert.equal(env.SLACK_BOT_TOKEN, "xoxb-2", "따옴표를 벗기지 못했다");
});

test("값 끝의 공백을 벗긴다 — 한 칸 붙은 토큰은 invalid_auth 가 된다", () => {
  const env = loadEnv(fileWith("SLACK_BOT_TOKEN=xoxb-2   \nSLACK_RESULT_CHANNEL=C1\t\n"), {});
  assert.equal(env.SLACK_BOT_TOKEN, "xoxb-2");
  assert.equal(env.SLACK_RESULT_CHANNEL, "C1");
});

test("이미 있는 환경변수가 파일보다 세고, 파일이 없으면 환경변수만 쓴다 — 토큰은 홈의 파일에 두고 저장소에 두지 않는다", () => {
  const env = loadEnv(fileWith("SLACK_BOT_TOKEN=file\n"), { SLACK_BOT_TOKEN: "env" });
  assert.equal(env.SLACK_BOT_TOKEN, "env");
  assert.deepEqual(loadEnv(path.join(tmpdir(), "없는-파일-" + Date.now()), { A: "1" }), { A: "1" });
});
