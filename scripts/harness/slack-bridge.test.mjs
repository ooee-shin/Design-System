// 옮길 반응인지, 어느 이슈인지, 무엇을 다는지만 본다. Slack 도 gh 도 부르지 않는다.
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { readCommentDecision } from "./decision.mjs";
import { buildComment, isReason, loadEnv, messageText, pendingKey, pickMessage, readAction, readIssueNumber, REACTION_DECISIONS, shouldRelay } from "./slack-bridge.mjs";

const card = "화면 요청 #39 결과 · 1회차 — 공지사항 목록 · 결정은 GitHub 댓글에 👍 👎 😕\n요청: @기획자 · 프로젝트 하네스 시험";

test("결과 카드의 첫 줄에서 요청 번호를 읽는다", () => {
  assert.equal(readIssueNumber(card), 39);
  assert.equal(readIssueNumber("화면 요청 #7 결과 · 2회차 — 무엇"), 7);
});

test("카드 모양이 바뀌면 이슈 주소로 찾는다", () => {
  assert.equal(readIssueNumber("무슨 글\nhttps://github.com/bluekey-kr/Design-System-Harness/issues/41#issuecomment-1"), 41);
});

test("결과 카드가 아니면 번호가 없다 — 아무 메시지의 반응을 결정으로 읽지 않는다", () => {
  assert.equal(readIssueNumber("오늘 점심 뭐 먹죠 #39"), null);
  assert.equal(readIssueNumber(""), null);
  assert.equal(readIssueNumber(undefined), null);
});

test("결정 이모지만 옮기고 봇이 단 것은 버린다", () => {
  const event = { type: "reaction_added", reaction: "+1", user: "U1", item: { type: "message", channel: "C1", ts: "1" } };
  assert.equal(shouldRelay(event), true);
  assert.equal(shouldRelay({ ...event, reaction: "tada" }), false, "결정이 아닌 이모지를 옮겼다");
  assert.equal(shouldRelay({ ...event, user: "UBOT" }, { botUserId: "UBOT" }), false, "봇이 단 반응을 옮겼다");
  assert.equal(shouldRelay({ ...event, item: { type: "file", ts: "1" } }), false);
  assert.equal(shouldRelay({ type: "message" }), false);
});

test("반응 셋은 decision.mjs 와 같은 낱말로 옮긴다", () => {
  assert.deepEqual([REACTION_DECISIONS["+1"], REACTION_DECISIONS["-1"], REACTION_DECISIONS.confused], ["승인", "반려", "개선"]);
});

test("댓글은 결정 낱말만 홀로 두고, 누가 눌렀는지는 인용 줄로 앞에 둔다", () => {
  const body = buildComment({ decision: "승인", by: "기획자", permalink: "https://slack.com/x" });
  assert.match(body, /^> 기획자 님이 Slack 결과 카드에서 반응을 달아 남긴 결정입니다\. \(\[Slack에서 보기\]\(https:\/\/slack\.com\/x\)\)\n\n승인$/);
});

test("까닭이 있으면 「개선: 까닭」 꼴로 적는다 — D4 가 그 꼴만 사유로 읽는다", () => {
  const body = buildComment({ decision: "개선", by: "기획자", how: "개선 버튼을 누르고 까닭을 적어", reason: "조회 버튼을\n채움으로" });
  assert.match(body, /\n\n개선: 조회 버튼을 채움으로$/, "줄바꿈을 펴지 않으면 뒤가 잘린다");
  assert.equal(readCommentDecision(body).reason, "조회 버튼을 채움으로");
});

test("버튼의 action_id 에서 결정을 읽는다", () => {
  assert.equal(readAction("decide:승인"), "승인");
  assert.equal(readAction("decide:개선"), "개선");
  assert.equal(readAction("decide:머시기"), null);
  assert.equal(readAction(undefined), null);
});

test("까닭은 누른 사람이 그 스레드에 적은 사람 글만 받는다", () => {
  const pending = { issue: 9, decision: "개선", user: "U1" };
  const base = { type: "message", thread_ts: "1.0", user: "U1", text: "조회 버튼을 채움으로" };
  assert.equal(isReason(base, pending), true);
  assert.equal(isReason({ ...base, user: "U2" }, pending), false, "다른 사람의 잡담을 사유로 올렸다");
  assert.equal(isReason({ ...base, bot_id: "B1" }, pending), false, "봇이 남긴 안내를 사유로 올렸다");
  assert.equal(isReason({ ...base, subtype: "channel_join" }, pending), false);
  assert.equal(isReason({ ...base, thread_ts: undefined }, pending), false, "스레드 밖의 글을 사유로 올렸다");
  assert.equal(isReason({ ...base, text: "   " }, pending), false);
  assert.equal(isReason(base, undefined), false, "기다리지 않는 카드의 글을 사유로 올렸다");
});

test("기다리는 자리는 채널과 카드로 가른다", () => {
  assert.equal(pendingKey("C1", "1.0"), "C1:1.0");
  assert.notEqual(pendingKey("C1", "1.0"), pendingKey("C2", "1.0"));
});

test("판독이 이 댓글을 그 결정으로 읽는다 — 꼴이 어긋나면 조용히 무시된다", () => {
  // decision.mjs 는 인용 줄을 건너뛴 첫 글이 결정 낱말로 시작할 때만 읽는다. 두 모듈을 함께 고정한다.
  for (const decision of ["승인", "반려", "개선"]) {
    const read = readCommentDecision(buildComment({ decision, by: "기획자", permalink: "https://slack.com/x" }));
    assert.deepEqual(read, { decision, reason: null }, `${decision} 댓글이 결정으로 읽히지 않는다`);
  }
});

test("반려·개선의 사유는 비워 둔다 — 안내문이 개선 사유로 넘어가면 안 된다", () => {
  const read = readCommentDecision(buildComment({ decision: "개선", by: "기획자" }));
  assert.equal(read.reason, null, "안내문이 사유로 읽혔다 — generate-code 인수에 그대로 붙는다");
});

test("토큰은 홈의 파일에서 읽고 저장소에 두지 않는다", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "slack-env-"));
  const file = path.join(dir, "slack.env");
  writeFileSync(file, '# 주석\nSLACK_APP_TOKEN=xapp-1\nSLACK_BOT_TOKEN="xoxb-2"\n');
  const env = loadEnv(file, {});
  assert.equal(env.SLACK_APP_TOKEN, "xapp-1");
  assert.equal(env.SLACK_BOT_TOKEN, "xoxb-2", "따옴표를 벗기지 못했다");
  assert.deepEqual(loadEnv(path.join(dir, "없는파일"), { A: "1" }), { A: "1" });
});

test("스레드 답글의 카드도 그 시각의 메시지로 고른다", () => {
  // GitHub for Slack 은 이슈 카드를 채널에 두고 댓글을 그 스레드에 단다. 결과 카드는 답글이라
  // conversations.history 에 없고 conversations.replies 에만 있다(#48 의 😕 가 그래서 읽히지 않았다).
  const thread = [
    { ts: "1.0", text: "Issue created by …" },
    { ts: "2.0", text: "Comment on issue …" },
  ];
  assert.equal(pickMessage(thread, "2.0").text, "Comment on issue …");
  assert.equal(pickMessage(thread, "9.9"), null);
  assert.equal(pickMessage(undefined, "1.0"), null);
});

test("카드의 글은 본문·첨부·블록에서 모두 모은다", () => {
  const message = {
    text: "Comment on issue by YUJINSIK-momo",
    attachments: [{ title: "#48 화면 요청: 매장 재고 조회", text: "화면 요청 #48 결과 · 1회차 — 매장 재고 조회" }],
    blocks: [{ text: { text: "샌드박스: https://ooee-sandbox.pages.dev/store-inventory" } }],
  };
  const text = messageText(message);
  assert.equal(readIssueNumber(text), 48);
  assert.match(text, /샌드박스/);
});
