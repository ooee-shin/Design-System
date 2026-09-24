// 승인을 `main` 으로 올려도 되는지 가르는 규칙을 값으로 고정한다. gh·git 은 부르지 않는다.
import assert from "node:assert/strict";
import test from "node:test";

import { howToUnmix, improveBlocked, isRequestOf, isRevertOf, mainPr, readMark, revertPr, sortLanded, touchesScreens } from "./decide.mjs";

const pr = (number, body, files = []) => ({ number, url: `https://github.com/x/pull/${number}`, body, files });

test("표식은 줄 처음이 아니어도 읽고, 번호가 이어지면 다른 요청이다", () => {
  assert.deepEqual(readMark("머리말\n요청: #19\n\n본문"), { kind: "요청", issue: 19 });
  assert.deepEqual(readMark("되돌림: #7"), { kind: "되돌림", issue: 7 });
  assert.equal(readMark("본문만 있다"), null);
  assert.ok(isRequestOf("요청: #8", 8));
  assert.ok(!isRequestOf("요청: #85", 8), "#85 를 #8 로 읽으면 남의 화면을 이 요청의 것으로 센다");
  assert.ok(isRevertOf("되돌림: #8", 8));
});

test("등록된 화면 자리를 바꿨는지 본다 — route group 과 첫 화면은 화면이 아니다", () => {
  const keys = ["shop-cart", "voc"];
  assert.ok(touchesScreens(["apps/sandbox/src/app/shop-cart/page.tsx"], keys));
  assert.ok(!touchesScreens(["apps/sandbox/src/app/layout.tsx", "apps/sandbox/src/screens.ts"], keys));
  assert.ok(!touchesScreens(["apps/sandbox/src/app/(renewal)/renewal/page.tsx"], keys));
  assert.ok(!touchesScreens(["apps/sandbox/src/app/other-screen/page.tsx"], keys), "등록되지 않은 자리는 이 검사의 몫이 아니다");
});

test("승인된 것만 main 으로 간다 — 대기·개선·결과 없음이 섞이면 막는다", () => {
  const decisions = { 8: "승인", 9: "대기", 10: "개선", 11: "결과 없음" };
  const { landed, mixed } = sortLanded(
    [pr(1, "요청: #8"), pr(2, "요청: #9"), pr(3, "요청: #10"), pr(4, "요청: #11")],
    (issue) => decisions[issue],
  );
  assert.deepEqual(landed.map((item) => item.issue), [8, 9, 10, 11]);
  assert.deepEqual(mixed.map((item) => item.issue), [9, 10, 11], "승인 아닌 것을 모두 막아야 한다");
});

test("반려는 되돌림이 같은 목록에 있으면 빠진 것으로 친다", () => {
  const rejected = [pr(1, "요청: #7"), pr(2, "되돌림: #7")];
  assert.deepEqual(sortLanded(rejected, () => "반려").mixed, [], "되돌렸는데도 막으면 어떤 승인도 올라가지 못한다");
  assert.deepEqual(sortLanded([pr(1, "요청: #7")], () => "반려").mixed.map((item) => item.issue), [7], "되돌리지 않은 반려는 막는다");
});

test("표식이 없는 pull request 는 화면을 건드렸을 때만 막는다", () => {
  const keys = ["shop-cart"];
  const harness = pr(1, "하네스를 고쳤다", ["scripts/harness/runner.mjs"]);
  const screen = pr(2, "표식을 안 적었다", ["apps/sandbox/src/app/shop-cart/page.tsx"]);
  const sorted = sortLanded([harness, screen], () => "승인", keys);
  assert.deepEqual(sorted.mixed.map((item) => item.decision), ["알 수 없음"]);
  assert.ok(sorted.landed.some((item) => item.number === 1 && item.kind === "그 밖"), "하네스 변경까지 막으면 아무것도 못 올린다");
});

test("섞인 것마다 푸는 길을 적는다 — 개발자가 다음에 무엇을 할지 보면 된다", () => {
  const lines = howToUnmix([
    { issue: 9, decision: "대기", url: "https://x/9" },
    { issue: null, decision: "알 수 없음", url: "https://x/12" },
  ]);
  assert.match(lines[0], /^#9 \(대기\) https:\/\/x\/9 — 기획자의 결정을 기다린다$/);
  assert.match(lines[1], /^#\? \(알 수 없음\).*작성자가 본문에/);
});

test("main pull request 는 첫 줄에 승인 표식을 둔다 — 러너가 그것을 다시 본다", () => {
  const read = { round: 1, by: "유진식", at: "2026-09-24T01:40:44Z", source: "comment", resultCommentUrl: "https://x/c" };
  const { title, body } = mainPr({
    issue: 85,
    read,
    screenName: "자동 송장 api 대시보드",
    landed: [
      { number: 88, kind: "요청", issue: 85, decision: "승인", url: "https://x/88" },
      { number: 90, kind: "그 밖", url: "https://x/90" },
    ],
  });
  assert.equal(title, "dev → main: 화면 요청 #85 승인 — 자동 송장 api 대시보드");
  assert.match(body, /^승인: #85 1회차 — 유진식 · 2026-09-24T01:40:44Z · 댓글\n/);
  assert.match(body, /- #88 요청 #85 \(승인\)/);
  assert.match(body, /- #90 화면 밖 변경/);
});

test("되돌림 pull request 는 사유와 되돌린 commit 을 남기고, 짐작한 사유는 그렇다고 적는다", () => {
  const read = { by: "유진식", at: "2026-09-24T02:00:00Z", reason: "표가 잘린다", reasonSource: "after", reasonCommentUrl: "https://x/r", resultCommentUrl: "https://x/c" };
  const { title, body } = revertPr({ issue: 62, read, screenName: "카카오톡 대시보드", commits: ["abc1234", "def5678"] });
  assert.equal(title, "revert(sandbox): 화면 요청 #62 반려 — 카카오톡 대시보드");
  assert.match(body, /^되돌림: #62\n/, "D2 가 이 줄로 되돌림을 가린다");
  assert.match(body, /> 표가 잘린다/);
  assert.match(body, /사유는 짐작이다\(after\)/);
  assert.match(body, /- `abc1234`\n- `def5678`/);
});

test("개선은 사유가 밝혀졌을 때만, 세 번까지 한다", () => {
  const ok = { reason: "버튼이 안 눌린다", reasonSource: "prefix", round: 1 };
  assert.equal(improveBlocked(ok), null);
  assert.match(improveBlocked({ ...ok, reason: null }), /사유가 없다/);
  assert.match(improveBlocked({ ...ok, reasonSource: "after" }), /짐작했다\(after\)/);
  assert.match(improveBlocked({ ...ok, round: 4 }), /개선은 3번까지다\(지금 4회차\)/);
});
