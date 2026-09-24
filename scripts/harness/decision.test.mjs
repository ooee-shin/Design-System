// 결정 판독을 고정한다. #9 의 실제 댓글(아직 없음)은 픽스처로, 결정이 달린 경우는 GitHub API 모양으로
// 지어낸 값으로 본다. 결과 댓글 본문은 renderResultComment 가 실제로 만든 것을 쓴다.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { chmodSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { decide, flattenPages, looksLikeDecision, pickResultComment, readCommentDecision, readMarker } from "./decision.mjs";
import { renderResultComment } from "./result-comment.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const example = JSON.parse(readFileSync(path.join(here, "fixtures", "result-input.example.json"), "utf8"));
const resultBody = (round) => renderResultComment({ ...example, round });

// 처리 계정과 요청자 계정이 지금은 같다. 판독이 계정으로 거르지 않는다는 것을 그 모양 그대로 본다.
const SAME = "harness-account";
let nextId = 100;
const at = (minute) => `2026-09-22T10:${String(minute).padStart(2, "0")}:00Z`;
const comment = (minute, body, user = SAME) => {
  const id = nextId++;
  return { id, html_url: `https://github.com/o/r/issues/9#issuecomment-${id}`, user: { login: user }, created_at: at(minute), body };
};
const reaction = (minute, content, user = SAME) => ({ id: nextId++, user: { login: user }, content, created_at: at(minute) });

test("#9: 실제 댓글이 없으니 「결과 없음」 이다", () => {
  const pages = JSON.parse(readFileSync(path.join(here, "fixtures", "issue-9-comments.json"), "utf8"));
  const out = decide({ comments: flattenPages(pages), reactionsByCommentId: {}, issue: 9 });
  assert.equal(out.decision, "결과 없음");
  assert.equal(out.resultCommentId, null);
  assert.equal(out.source, null);
  assert.match(out.note, /결과 댓글이 없다/);
});

test("gh --paginate --slurp 의 쪽 배열을 한 줄로 편다", () => {
  assert.deepEqual(flattenPages([[1, 2], [3]]), [1, 2, 3]);
  assert.deepEqual(flattenPages([[]]), []);
});

test("결과 댓글만 있고 신호가 없으면 「대기」 다", () => {
  const result = comment(0, resultBody(1));
  const out = decide({ comments: [comment(0, "확정"), result], reactionsByCommentId: { [result.id]: [reaction(1, "eyes")] } });
  assert.equal(out.decision, "대기", "👀 같은 반응은 결정이 아니다");
  assert.equal(out.resultCommentId, result.id);
  assert.equal(out.resultCommentUrl, result.html_url);
  assert.equal(out.round, 1);
});

test("👍 는 승인이다 — 결과 댓글을 쓴 계정이 달아도 거르지 않는다", () => {
  const result = comment(0, resultBody(1));
  const out = decide({ comments: [result], reactionsByCommentId: { [result.id]: [reaction(3, "+1")] } });
  assert.deepEqual(
    { decision: out.decision, source: out.source, by: out.by, at: out.at, reason: out.reason },
    { decision: "승인", source: "reaction", by: SAME, at: at(3), reason: null },
  );
});

test("👎 뒤의 첫 댓글이 반려 사유다 — 짐작한 사유라는 것과 그 댓글 주소를 남긴다", () => {
  const result = comment(0, resultBody(1));
  const reasonComment = comment(5, "장바구니에서 수량을 바꿀 수 없어요");
  const out = decide({
    comments: [result, reasonComment, comment(6, "그리고 하나 더")],
    reactionsByCommentId: { [result.id]: [reaction(4, "-1")] },
  });
  assert.equal(out.decision, "반려");
  assert.equal(out.reason, "장바구니에서 수량을 바꿀 수 없어요");
  assert.equal(out.reasonSource, "after");
  assert.equal(out.reasonCommentUrl, reasonComment.html_url);
  assert.match(out.note, /사유는 신호 뒤에 쓴 댓글에서 짐작했다/);
});

test("사유를 먼저 쓰고 반응을 달았으면 앞의 댓글을 사유로 본다", () => {
  const result = comment(0, resultBody(1));
  const out = decide({ comments: [result, comment(2, "상품 목록에 필터가 없어요")], reactionsByCommentId: { [result.id]: [reaction(3, "confused")] } });
  assert.equal(out.decision, "개선");
  assert.equal(out.reason, "상품 목록에 필터가 없어요");
  assert.equal(out.reasonSource, "before");
  assert.match(out.note, /사유는 신호 앞에 쓴 댓글에서 짐작했다/);
});

test("신호보다 10분 넘게 앞선 댓글은 사유로 잡지 않는다", () => {
  // 앞서 남긴 질문이나 칭찬이 개선 사유로 generate-code 인수에 붙지 않게 한다.
  const result = comment(0, resultBody(1));
  const out = decide({ comments: [result, comment(1, "상품 사진 자리는 어떻게 할 예정인가요?")], reactionsByCommentId: { [result.id]: [reaction(15, "confused")] } });
  assert.equal(out.decision, "개선");
  assert.equal(out.reason, null);
  assert.equal(out.reasonSource, null);
  assert.match(out.note, /개선 사유 댓글이 아직 없다/);
});

test("신호 바로 앞의 무관한 댓글은 사유로 잡히지만 'before' 로 드러난다", () => {
  // 검증에서 찾은 두 경우다. 판독만으로는 칭찬·질문과 사유를 가를 수 없으니 출처(reasonSource)를 남긴다 —
  // 러너는 prefix 가 아니면 개선을 시작하지 않고(decide.mjs improveBlocked), 반려는 되돌림 본문에 짐작이라고 적는다.
  const result = { ...comment(0, resultBody(1)), created_at: "2026-09-22T10:00:00Z" };
  const at = (s) => `2026-09-22T10:00:${s}Z`;
  const praise = { ...comment(0, "와 좋네요 ㅎㅎ"), created_at: at(12) };
  const a = decide({ comments: [result, praise], reactionsByCommentId: { [result.id]: [{ ...reaction(0, "-1"), created_at: at(15) }] } });
  assert.deepEqual([a.decision, a.reason, a.reasonSource, a.reasonCommentUrl], ["반려", "와 좋네요 ㅎㅎ", "before", praise.html_url]);

  const question = { ...comment(0, "상품 사진 자리는 어떻게 할 예정인가요?"), created_at: at(12) };
  const b = decide({ comments: [result, question], reactionsByCommentId: { [result.id]: [{ ...reaction(0, "confused"), created_at: at(15) }] } });
  assert.deepEqual([b.decision, b.reasonSource], ["개선", "before"]);
  assert.match(b.note, /짐작했다/);
});

test("다른 사람의 댓글은 사유로 삼지 않는다", () => {
  const result = comment(0, resultBody(1));
  const out = decide({ comments: [result, comment(5, "저도 봤어요", "someone-else")], reactionsByCommentId: { [result.id]: [reaction(4, "-1", "planner")] } });
  assert.equal(out.decision, "반려");
  assert.equal(out.reason, null);
  assert.match(out.note, /사유 댓글이 아직 없다/);
});

test("「반려: …」 댓글은 결정이고 본문이 사유다", () => {
  const result = comment(0, resultBody(1));
  const decision = comment(2, "반려: 주문서에 배송지 입력이 없다\n결제 수단도 없다");
  const out = decide({ comments: [result, decision] });
  assert.equal(out.decision, "반려");
  assert.equal(out.source, "comment");
  assert.equal(out.reason, "주문서에 배송지 입력이 없다\n결제 수단도 없다");
  assert.equal(out.reasonSource, "prefix");
  assert.equal(out.reasonCommentUrl, decision.html_url);
  assert.equal(out.note, null);
});

test("결정 낱말로 시작하지만 꼴이 맞지 않는 댓글은 결정이 아니고 따로 드러난다", () => {
  for (const text of ["승인합니다", "승인!", "승인.", "승인 👍", "반려합니다. 색이 이상해요", "개선 부탁드려요: 버튼", "개선 요청: 버튼", "> 인용\n\n승인해요"]) {
    assert.equal(readCommentDecision(text), null, `${text}: 규칙은 넓히지 않는다`);
    assert.equal(looksLikeDecision(text), true, `${text}: 버렸다는 표시가 있어야 한다`);
  }
  for (const text of ["승인", "반려: 사유", "개선\n여백", "좋아요", "이건 반려: 아님"]) assert.equal(looksLikeDecision(text), false, text);
});

test("이긴 신호보다 늦은 결정 같은 댓글이 있으면 lookalikeAfterDecision 이 true 다", () => {
  // 검증에서 찾은 경우: 👍 뒤에 「반려합니다. …」를 남겼는데 승인으로 읽혀 dev → main 으로 넘어갈 뻔했다.
  const result = comment(0, resultBody(1));
  const late = comment(6, "반려합니다. 색이 브랜드와 달라요");
  const out = decide({ comments: [result, late], reactionsByCommentId: { [result.id]: [reaction(5, "+1")] } });
  assert.equal(out.decision, "승인", "판정 규칙 자체는 그대로다");
  assert.equal(out.lookalikeAfterDecision, true);
  assert.deepEqual(out.lookalikes, [{ url: late.html_url, by: SAME, at: at(6), text: "반려합니다. 색이 브랜드와 달라요" }]);
  assert.ok(out.note.includes(`결정처럼 보이지만 읽지 않은 댓글: ${late.html_url} 「반려합니다. 색이 브랜드와 달라요」`));

  const tie = decide({ comments: [result, comment(5, "승인합니다")], reactionsByCommentId: { [result.id]: [reaction(5, "-1")] } });
  assert.equal(tie.lookalikeAfterDecision, true, "같은 시각이면 댓글이 늦은 쪽이다");

  const afterComment = decide({ comments: [result, comment(3, "개선: 버튼 색"), comment(4, "승인합니다")] });
  assert.equal(afterComment.decision, "개선");
  assert.equal(afterComment.lookalikeAfterDecision, true, "결정 댓글 뒤의 것도 늦은 것이다");
});

test("이긴 신호보다 앞선 결정 같은 댓글은 드러내기만 하고 막지 않는다", () => {
  const result = comment(0, resultBody(1));
  const out = decide({ comments: [result, comment(2, "승인합니다")], reactionsByCommentId: { [result.id]: [reaction(3, "+1")] } });
  assert.equal(out.decision, "승인");
  assert.equal(out.lookalikes.length, 1);
  assert.equal(out.lookalikeAfterDecision, false);
  assert.match(out.note, /결정처럼 보이지만 읽지 않은 댓글/);
});

test("신호가 없는데 결정 같은 댓글이 있으면 「대기」 이고 lookalikeAfterDecision 이 true 다", () => {
  const result = comment(0, resultBody(1));
  const out = decide({ comments: [result, comment(2, "승인합니다!")] });
  assert.equal(out.decision, "대기");
  assert.equal(out.lookalikeAfterDecision, true);
  assert.match(out.note, /^결과 댓글에 아직 결정이 없다 \/ 결정처럼 보이지만 읽지 않은 댓글/);
});

test("😕 뒤의 「개선 요청: …」은 사유로 잡되 결정 같은 댓글로도 드러난다", () => {
  const result = comment(0, resultBody(1));
  const out = decide({ comments: [result, comment(3, "개선 요청: 담기 버튼 색")], reactionsByCommentId: { [result.id]: [reaction(2, "confused")] } });
  assert.deepEqual([out.decision, out.reason, out.reasonSource, out.lookalikeAfterDecision], ["개선", "개선 요청: 담기 버튼 색", "after", true]);
});

test("CLI: gh 를 GET 으로만 부르고, 늦은 결정 같은 댓글을 드러낸다", () => {
  // 가짜 gh 를 PATH 앞에 두고 CLI 를 끝까지 돌린다. 결과 댓글 111, 10:00:15 👍, 10:00:20 「반려합니다. …」.
  const dir = mkdtempSync(path.join(os.tmpdir(), "decision-cli-"));
  try {
    const result = { id: 111, html_url: "https://github.com/o/r/issues/9#issuecomment-111", user: { login: SAME }, created_at: "2026-09-22T10:00:00Z", body: resultBody(1) };
    const late = { id: 112, html_url: "https://github.com/o/r/issues/9#issuecomment-112", user: { login: SAME }, created_at: "2026-09-22T10:00:20Z", body: "반려합니다. 색이 브랜드와 달라요" };
    writeFileSync(path.join(dir, "comments.json"), JSON.stringify([[result, late]]));
    writeFileSync(path.join(dir, "reactions.json"), JSON.stringify([[{ id: 1, user: { login: SAME }, content: "+1", created_at: "2026-09-22T10:00:15Z" }]]));
    const gh = path.join(dir, "gh");
    writeFileSync(gh, `#!/bin/sh\necho "$*" >> "${dir}/calls.log"\ncase "$*" in\n  *reactions*) cat "${dir}/reactions.json" ;;\n  *) cat "${dir}/comments.json" ;;\nesac\n`);
    chmodSync(gh, 0o755);
    const out = JSON.parse(
      execFileSync(process.execPath, [path.join(here, "decision.mjs"), "9"], { encoding: "utf8", env: { ...process.env, PATH: `${dir}${path.delimiter}${process.env.PATH}` } }),
    );
    assert.equal(out.issue, 9);
    assert.equal(out.decision, "승인");
    assert.equal(out.lookalikeAfterDecision, true);
    assert.equal(out.lookalikes[0].url, late.html_url);
    const calls = readFileSync(path.join(dir, "calls.log"), "utf8").trim().split("\n");
    assert.equal(calls.length, 2, "댓글과 반응을 한 번씩 읽는다");
    for (const call of calls) assert.match(call, /^api --method GET /, `쓰기 요청이 되면 안 된다: ${call}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("가장 늦은 신호가 이긴다 — 반응과 댓글을 섞어도 시각으로 가른다", () => {
  const result = comment(0, resultBody(1));
  const early = decide({ comments: [result, comment(5, "승인")], reactionsByCommentId: { [result.id]: [reaction(2, "confused")] } });
  assert.equal(early.decision, "승인", "😕 뒤에 「승인」 댓글을 남겼으면 승인이다");

  const late = decide({ comments: [result, comment(2, "승인")], reactionsByCommentId: { [result.id]: [reaction(5, "-1")] } });
  assert.equal(late.decision, "반려", "「승인」 뒤에 👎 를 달았으면 반려다");

  const tie = decide({ comments: [result, comment(3, "개선: 버튼 문구")], reactionsByCommentId: { [result.id]: [reaction(3, "+1")] } });
  assert.equal(tie.decision, "개선", "같은 시각이면 글로 남긴 쪽이 이긴다");
});

test("결과 댓글 앞의 신호는 이번 결과에 대한 것이 아니다", () => {
  const first = comment(0, resultBody(1));
  const second = comment(10, resultBody(2));
  const out = decide({
    comments: [comment(0, "승인"), first, comment(5, "개선: 필터를 더해 주세요"), second],
    reactionsByCommentId: { [first.id]: [reaction(4, "confused")] },
  });
  assert.equal(out.decision, "대기", "2회차 결과 뒤에는 아직 아무 신호가 없다");
  assert.equal(out.round, 2);
  assert.equal(out.resultCommentId, second.id);
});

test("회차를 고르면 그 결과 댓글과 다음 결과 댓글 사이만 본다", () => {
  const first = comment(0, resultBody(1));
  const second = comment(10, resultBody(2));
  const comments = [first, comment(5, "개선: 필터를 더해 주세요"), second, comment(12, "승인")];
  const one = decide({ comments, round: 1 });
  assert.equal(one.decision, "개선");
  assert.equal(one.reason, "필터를 더해 주세요");
  assert.equal(one.round, 1);
  const two = decide({ comments, round: 2 });
  assert.equal(two.decision, "승인");
  const three = decide({ comments, round: 3 });
  assert.equal(three.decision, "결과 없음");
  assert.match(three.note, /3회차/);
});

test("같은 회차를 다시 올렸으면 늦은 결과 댓글을 본다", () => {
  const first = comment(0, resultBody(1));
  const again = comment(5, resultBody(1));
  assert.equal(pickResultComment([again, first]).id, again.id, "입력 차례가 아니라 만든 시각으로 고른다");
});

test("표식이 맨 끝이 아니거나 다른 이슈의 것이면 결과 댓글이 아니다", () => {
  const quoted = comment(1, `${resultBody(1).trimEnd()}\n\n위 결과를 옮겨 둡니다`);
  assert.equal(readMarker(quoted.body), null);
  const otherIssue = comment(2, resultBody(1).replace("issue=9", "issue=4"));
  assert.equal(pickResultComment([otherIssue], { issue: 9 }), null);
  assert.equal(pickResultComment([otherIssue]).id, otherIssue.id, "이슈 번호를 주지 않으면 거르지 않는다");
});

test("결정 댓글은 첫 낱말 바로 뒤가 콜론이거나 줄 끝이어야 한다", () => {
  assert.deepEqual(readCommentDecision("승인"), { decision: "승인", reason: null });
  assert.deepEqual(readCommentDecision("  승인  "), { decision: "승인", reason: null });
  assert.deepEqual(readCommentDecision("개선 : 여백"), { decision: "개선", reason: "여백" });
  assert.deepEqual(readCommentDecision("반려：전각 콜론"), { decision: "반려", reason: "전각 콜론" });
  assert.deepEqual(readCommentDecision("반려\n배송지 칸이 없다"), { decision: "반려", reason: "배송지 칸이 없다" });
  assert.equal(readCommentDecision("승인 전에 하나만 볼게요"), null);
  assert.equal(readCommentDecision("승인합니다"), null);
  assert.equal(readCommentDecision("이건 반려: 아님"), null);
});

test("「Quote reply」 로 인용한 뒤 쓴 결정도 읽는다", () => {
  assert.deepEqual(readCommentDecision("> 화면 요청 #9 결과 · 1회차 — 이커머스 구매 페이비\n\n개선: 상품 사진이 없다"), { decision: "개선", reason: "상품 사진이 없다" });
});
