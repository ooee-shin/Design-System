// 카드에 무엇이 실리는지만 본다. Slack 은 부르지 않는다.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { renderResultComment } from "./result-comment.mjs";
import { readIssueNumber } from "./slack-bridge.mjs";
import { buildCard, headLines, slackTarget } from "./slack-card.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const example = () => JSON.parse(readFileSync(path.join(here, "fixtures", "result-input.example.json"), "utf8"));

test("카드는 결과 댓글의 머리 네 줄만 싣는다", () => {
  const body = renderResultComment(example());
  const head = headLines(body);
  assert.equal(head.length, 4, "머리가 네 줄이 아니다 — 카드가 자르는 자리와 어긋난다");
  assert.match(head[0], /^화면 요청 #9 결과/);
  assert.match(head[2], /^샌드박스: https:\/\//);
});

test("카드는 결정하는 법과 이슈로 가는 길을 담는다", () => {
  const body = renderResultComment(example());
  const card = buildCard({ body, commentUrl: "https://github.com/bluekey-kr/Design-System-Harness/issues/9#issuecomment-1" });
  assert.match(card, /이 카드에 👍 승인 · 👎 반려 · 😕 개선/);
  assert.match(card, /「반려: 까닭」·「개선: 고칠 것」/);
  assert.match(card, /자세히 보고 사유 남기기: https:\/\/github\.com\/.*#issuecomment-1$/);
});

test("다리가 이 카드에서 요청 번호를 읽는다 — 반응이 결정으로 이어진다", () => {
  const card = buildCard({ body: renderResultComment(example()), commentUrl: null });
  assert.equal(readIssueNumber(card), 9);
});

test("토큰이나 채널이 없으면 올릴 자리가 없다 — 처리는 그대로 끝난다", () => {
  assert.equal(slackTarget({}), null);
  assert.equal(slackTarget({ SLACK_BOT_TOKEN: "xoxb-1" }), null);
  assert.deepEqual(slackTarget({ SLACK_BOT_TOKEN: "xoxb-1", SLACK_RESULT_CHANNEL: "C1" }), { token: "xoxb-1", channel: "C1" });
});
