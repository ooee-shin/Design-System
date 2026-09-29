// 러너의 순수한 조각(claude 인수·허용 목록·가지·화면 key·결정 열쇠·멈춤 카드·닫는 글)을 값으로 고정한다. claude·gh 는 부르지 않는다.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { looksLikeDecision, readCommentDecision } from "./decision.mjs";

import { validatePlan } from "./plan.mjs";
import {
  CHAINED_SKILLS,
  EFFORT,
  MAKE_SKILL,
  closingComment,
  MODEL,
  buildClaudeArgs,
  chainedAllowedTools,
  decisionKey,
  lookalikeKey,
  outsideScreenFiles,
  screenKeys,
  pickActionable,
  pickUnreadLookalikes,
  staleBranches,
  recoverPlan,
  startNotice,
  stopNotice,
  stopReport,
} from "./runner.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../..");

test("프롬프트는 -p 바로 뒤에 두고 --allowedTools 는 맨 끝에 둔다", () => {
  const args = buildClaudeArgs("/make-screens 12 러너");
  assert.deepEqual(args.slice(0, 2), ["-p", "/make-screens 12 러너"], "프롬프트가 --allowedTools 에 삼켜질 자리에 있다");
  const after = args.slice(args.indexOf("--allowedTools") + 1);
  assert.ok(after.length > 0 && after.every((arg) => !arg.startsWith("--")), "--allowedTools 뒤에 다른 인수가 있다");
});

test("모델과 effort 를 하네스 명령과 같은 값으로 박는다", () => {
  const args = buildClaudeArgs("x");
  assert.equal(args[args.indexOf("--model") + 1], MODEL);
  assert.equal(MODEL, "claude-sonnet-5", "별칭이 아니라 전체 ID 여야 새 모델로 저절로 옮겨 가지 않는다");
  assert.equal(args[args.indexOf("--effort") + 1], EFFORT);
  assert.equal(EFFORT, "high", "별칭이나 빈 값이 아니라 고정된 값이어야 세션마다 같은 결과가 난다");
  for (const file of [MAKE_SKILL, ...CHAINED_SKILLS]) {
    const head = readFileSync(path.join(repoRoot, file), "utf8").match(/^---\n[\s\S]*?^effort:(.*)$/m)?.[1]?.trim();
    assert.equal(head, EFFORT, `${file} 머리말의 effort 가 러너와 다르다`);
  }
});

test("러너는 머리말 밖의 도구를 열지 않는다 — 반려의 되돌리기도 스크립트가 한다", () => {
  // 2026-09-24 #96: git revert 를 버리고 plan.mjs `removeScreens` 로 걷어내므로 러너가 더 여는 것이 없다.
  const args = buildClaudeArgs("x");
  assert.deepEqual(args.slice(args.indexOf("--allowedTools") + 1), chainedAllowedTools());
});

test("하위 명령이 머리말에 적은 도구를 넘긴다 — 요청 처리는 Figma 를 부르지 않는다", () => {
  // 2026-09-22 에 Figma 를 요청 처리에서 뺐다. 하위 명령은 화면 생성·검수 둘뿐이고 결과는 샌드박스로만 본다.
  for (const file of CHAINED_SKILLS) assert.ok(existsSync(path.join(repoRoot, file)), `하위 명령 파일이 없다: ${file}`);
  const tools = chainedAllowedTools();
  const args = buildClaudeArgs("x");
  for (const tool of tools) assert.ok(args.includes(tool), `${tool} 이 CLI 로 넘어가지 않는다`);
  for (const arg of args) assert.doesNotMatch(arg, /figma|design-page|\.mcp\.json/i, `Figma 흔적이 CLI 에 남았다: ${arg}`);
});

test("하위 명령이 실제로 쓰는 검사 명령이 넘어간다 — 머리말이 비면 러너가 넘길 것이 없다", () => {
  // 2026-09-23: generate-code·review-design 에 allowed-tools 가 아예 없어 러너가 빈 줄을 읽었다. 신뢰하지
  // 않은 사본에서는 공용 allow 가 무시되므로 화면 규칙 검사와 화면 테스트가 막혀 #62 가 4단계에서 멈췄다.
  const tools = chainedAllowedTools();
  for (const need of ["Bash(node plugins/ooee-harness/lib/check-screens.mjs:*)", "Bash(pnpm --filter @ooee/sandbox test)"]) {
    assert.ok(tools.includes(need), `${need} 이 넘어가지 않는다`);
  }
  for (const file of CHAINED_SKILLS) {
    const head = readFileSync(path.join(repoRoot, file), "utf8").match(/^---\n[\s\S]*?^allowed-tools:(.*)$/m)?.[1];
    assert.ok(head && head.trim(), `${file} 머리말에 allowed-tools 가 없다`);
  }
});

test("넘기는 도구에 결정을 만들거나 pull request 를 여닫는 명령이 섞이지 않는다", () => {
  // 하위 명령 머리말이 넓어지면 러너에서 그대로 열린다. 공용 권한의 ask·deny 가 먼저 판정되지만 두 겹으로 둔다.
  for (const tool of chainedAllowedTools()) {
    assert.doesNotMatch(tool, /gh (api|issue (comment|edit|close|reopen)|label|pr (create|merge))/, `넘기면 안 되는 도구: ${tool}`);
  }
});

test("앞 실행이 push 하지 않은 이 요청의 가지만 지운다", () => {
  const local = ["dev", "feature/issue-29-ecommerce-dashboard", "feature/issue-29-shop-r2", "feature/issue-290-x", "feature/issue-3-y"];
  const remote = ["dev", "main", "feature/issue-29-shop-r2"];
  assert.deepEqual(staleBranches(29, local, remote), ["feature/issue-29-ecommerce-dashboard"]);
});

test("머지된 화면 key 를 바뀐 파일에서 뽑는다 — 러너가 무엇을 확인할지 안다", () => {
  assert.deepEqual(
    screenKeys([
      "apps/sandbox/src/app/shop-cart/page.tsx",
      "apps/sandbox/src/app/shop-cart/page.test.tsx",
      "apps/sandbox/src/app/voc/page.tsx",
      "apps/sandbox/src/screens.ts",
    ]),
    ["shop-cart", "voc"],
  );
  assert.deepEqual(screenKeys(["apps/sandbox/src/screens.ts"]), []);
});

test("같은 결정은 한 번만 처리하고, 새 신호가 오면 다시 처리한다", () => {
  const read = { issue: 12, round: 1, decision: "승인", at: "2026-09-22T10:00:00Z", by: "a" };
  const done = { [decisionKey(read)]: { startedAt: "x" } };
  assert.deepEqual(pickActionable([read], done), [], "처리한 결정을 또 돌린다");
  const again = { ...read, decision: "개선", at: "2026-09-22T11:00:00Z" };
  assert.deepEqual(pickActionable([read, again], done), [again], "새 신호를 놓쳤다");
});

test("대기와 결과 없음은 처리하지 않는다", () => {
  const reads = ["대기", "결과 없음"].map((decision) => ({ issue: 1, round: 1, decision, at: null }));
  assert.deepEqual(pickActionable(reads, {}), []);
});

test("CLI 는 인수가 틀리면 claude 를 부르지 않고 종료 코드 2 로 끝난다", () => {
  const script = path.join(here, "runner.mjs");
  for (const argv of [[], ["처리"], ["처리", "abc"], ["결과"], ["되돌려", "12"], ["결정", "x"]]) {
    let code = 0;
    try {
      execFileSync(process.execPath, [script, ...argv], { encoding: "utf8", stdio: "pipe", env: { ...process.env, PATH: "" } });
    } catch (error) {
      code = error.status;
    }
    assert.equal(code, 2, `${JSON.stringify(argv)} 가 2 로 끝나지 않았다`);
  }
});

test("멈춤 카드는 멈춘 절만 읽는다 — 통과한 단계를 까닭 자리에 싣지 않는다", () => {
  // 2026-09-23 #62: 카드에 「git switch dev — 통과」 넉 줄이 갔다. 다음 제목까지 넘어가 「거친 자리」를 읽었다.
  const report = [
    "## 처리 중 실패",
    "",
    "4단계에서 화면 규칙 검사가 승인 요청에 막혔다.",
    "- `check-screens.mjs` — 거부됨",
    "",
    "## 거친 자리",
    "- `git switch dev` — 통과",
    "- `node scripts/harness/issue.mjs 62` — 통과",
  ].join("\n");
  const card = stopNotice(62, report, { title: "카카오톡 대시보드" });
  assert.match(card, /check-screens\.mjs` — 거부됨/);
  assert.ok(!card.includes("통과"), `통과한 단계가 카드에 실렸다:\n${card}`);
});

test("판독·이슈·pull request 검색은 한 자리에서만 부른다 — 명령 하나에 같은 spawn 이 두 번 있으면 판정 기준이 갈린다", () => {
  // 리뷰(2026-09-24): decision.mjs 를 한 명령에 두세 번 spawn 하고, 이슈 제목을 세 길로 읽고, 「요청: #n」 검색이
  // 세 곳에 있었다. 헬퍼 하나로 모았으니 그 밖의 자리에 같은 호출이 다시 생기면 여기서 잡는다.
  const source = readFileSync(path.join(here, "runner.mjs"), "utf8");
  const count = (needle) => source.split(needle).length - 1;
  assert.equal(count('"scripts/harness/decision.mjs"'), 1, "decision.mjs 는 readDecision 만 부른다");
  assert.equal(count('"scripts/harness/issue.mjs"'), 1, "issue.mjs 는 readIssue 만 부른다");
  assert.equal(count('"요청: #${issue}" in:body'), 1, "「요청: #n」 검색은 requestPrs 만 한다");
  assert.equal(count('"gh", ["issue", "view"'), 0, "이슈 제목은 issue.mjs 가 읽은 것을 넘긴다");
  assert.equal(count('"ls-remote"'), 1, "가지 목록은 dropStaleBranches 가 돌려준다");
  assert.equal(count("await notifyStop("), 2, "멈춤 클로저는 stopper 하나다(그 밖은 stopWith)");
});

test("workflow 는 손으로 부르는 예비다 — 저절로 도는 길은 이 Mac 의 1분 감시다", () => {
  // 2026-09-23: job 안에서 돌면 연결이 끊길 때 GitHub 이 job 을 버리고 claude 가 강제로 끝난다(#60).
  const workflow = readFileSync(path.join(repoRoot, ".github/workflows/harness.yml"), "utf8");
  assert.match(workflow, /runs-on: \[self-hosted, ooee-mac\]/, "이 Mac 이 아닌 곳에서 돈다 — Claude·gh 로그인이 없다");
  assert.match(workflow, /ref: dev/, "처리 코드를 dev 에서 받지 않는다");
  assert.match(workflow, /persist-credentials: false/, "GITHUB_TOKEN 으로 push 하면 Quality·Deploy 가 깨지 않는다");
  assert.ok(workflow.includes("scripts/harness/runner.mjs"), "이 스크립트를 부르지 않는다");
  const on = workflow.slice(workflow.indexOf("\non:"), workflow.indexOf("permissions:"));
  assert.deepEqual([...on.matchAll(/^ {2}(\w+):/gm)].map((hit) => hit[1]), ["workflow_dispatch"], "저절로 깨우는 이벤트가 남아 있다 — 감시와 둘이 같은 요청을 처리한다");
});

test("dev 로 합칠 pull request 는 생성 화면의 폴더와 목록만 바꿀 수 있다", () => {
  assert.deepEqual(
    outsideScreenFiles([
      "apps/sandbox/src/app/shop-cart/page.tsx",
      "apps/sandbox/src/app/shop-cart/page.test.tsx",
      "apps/sandbox/src/screens.ts",
    ]),
    [],
  );
  assert.deepEqual(
    outsideScreenFiles([
      "apps/sandbox/src/app/shop-cart/page.tsx",
      "scripts/harness/runner.mjs",
      ".github/workflows/harness.yml",
      "apps/sandbox/src/app/layout.tsx",
      "apps/sandbox/src/app/(renewal)/renewal/admin/page.tsx",
      "apps/sandbox/src/app/shop-cart/parts/list.tsx",
    ]),
    [
      "scripts/harness/runner.mjs",
      ".github/workflows/harness.yml",
      "apps/sandbox/src/app/layout.tsx",
      "apps/sandbox/src/app/(renewal)/renewal/admin/page.tsx",
      "apps/sandbox/src/app/shop-cart/parts/list.tsx",
    ],
    "화면 밖의 파일을 화면 자리로 읽었다",
  );
});

test("결정 없이 결정처럼 보이는 댓글만 있으면 한 번 알린다", () => {
  const waiting = { issue: 12, round: 1, decision: "대기", lookalikes: [{ url: "u1", at: "2026-09-22T10:00:00Z", text: "승인합니다" }] };
  const clean = { issue: 13, round: 1, decision: "대기", lookalikes: [] };
  const approved = { issue: 14, round: 1, decision: "승인", lookalikes: [{ url: "u2", at: "2026-09-22T10:00:00Z", text: "승인합니다" }] };
  assert.deepEqual(pickUnreadLookalikes([waiting, clean, approved], {}), [waiting], "결정이 있는 쪽은 D1 이 묻는다");
  assert.deepEqual(pickUnreadLookalikes([waiting], { [lookalikeKey(waiting)]: {} }), [], "같은 댓글을 10분마다 다시 알린다");
  const newer = { ...waiting, lookalikes: [...waiting.lookalikes, { url: "u3", at: "2026-09-22T11:00:00Z", text: "개선 요청: 버튼" }] };
  assert.deepEqual(pickUnreadLookalikes([newer], { [lookalikeKey(waiting)]: {} }), [newer], "새로 단 댓글을 알리지 않는다");
});

test("닫는 글은 결정으로 읽히지 않는다 — 러너가 남긴 글이 다음 판독에 잡히면 안 된다", () => {
  for (const kind of ["승인", "반려"]) {
    const body = closingComment(kind, "PR #58");
    assert.equal(readCommentDecision(body), null, `${kind} 닫는 글이 결정으로 읽혔다`);
    assert.equal(looksLikeDecision(body), false, `${kind} 닫는 글이 결정처럼 보인다`);
    assert.match(body, /Slack 폼으로 새 요청/);
  }
  assert.match(closingComment("승인", "PR #58"), /main 에 반영/);
  assert.match(closingComment("반려", "되돌림 PR #59"), /dev 에서 걷어냈/);
});

test("멈추면 결과 채널에 첫 제목과 문제 줄만 알린다 — 기획자가 무엇을 다시 낼지 보면 된다", () => {
  const report = "앞말\n\n## 묻고 멈춤\n\n**멈춘 단계:** 1단계\n\n- 화면 유형이 2개(모바일, 태블릿)다 — 하나를 묻는다\n- 새 프로젝트 「신주희 테스트」\n\n## 막힌 명령\n- 없음";
  const text = stopNotice(60, report, { title: "챗봇 채팅 화면", url: "https://github.com/x/y/issues/60" });
  assert.match(text, /^🙋 화면 요청 #60 「챗봇 채팅 화면」 — 묻고 멈춤\n/, "묻는 것은 실패 표시를 달지 않는다");
  assert.match(text, /· 화면 유형이 2개/);
  assert.match(text, /폼으로 다시 내 주세요/);
  assert.match(text, /자세히: https:\/\/github\.com\/x\/y\/issues\/60$/);
  assert.doesNotMatch(text, /막힌 명령/, "보고 전체를 옮기면 카드가 길어진다");
  assert.match(stopNotice(1, "제목 없는 보고"), /하네스가 마무리하지 못했다/);
});

test("하위 명령의 제목은 성공 제목이든 그다음 절 제목이든 멈춘 까닭이 되지 않는다", () => {
  // 2026-09-24 #85: 화면 하나를 만들고 그 뒤 단계를 하지 않아 실패했는데, 카드는 generate-code 의
  // 「pull request 준비 완료」를 그대로 실어 성공처럼 보였다.
  const report = ["## pull request 준비 완료", "", "제목: feat(sandbox): …", "- page.tsx 를 만들었다"].join("\n");
  const card = stopNotice(85, report, { title: "자동 송장 api 대시보드" });
  assert.match(card, /— 하네스가 마무리하지 못했다/);
  assert.match(card, /보고의 첫 제목은 「pull request 준비 완료」/, "개발자가 어디서 끝났는지 알 단서를 남긴다");
  assert.ok(!card.startsWith("🙋"), `마무리하지 못한 실행을 물음으로 냈다:\n${card}`);

  // 2026-09-29 #135: 낱말 몇 개만 빼던 때는 성공 제목 다음 제목 「무엇을 변경했나요?」 가 까닭 자리에 올라가고,
  // 그 아래 「바뀐 파일」 세 줄이 「고를 갈래」로 실렸다. 게다가 「무엇을」 때문에 물음으로 분류됐다.
  const next = [
    "## pull request 준비 완료",
    "제목: feat(sandbox): 설정값 관리 화면 추가",
    "",
    "## 무엇을 변경했나요?",
    "- `apps/sandbox/src/app/setting-value-management/page.tsx` — 설정값 108개를 관리하는 화면",
    "- `apps/sandbox/src/app/setting-value-management/page.test.tsx` — 테스트",
    "- `apps/sandbox/src/screens.ts` — 등록",
    "",
    "## 매핑표",
    "| 화면 요소 | 근거 |",
  ].join("\n");
  const card135 = stopNotice(135, next, { title: "설정값 관리 화면" });
  assert.match(card135, /^⚠️ 화면 요청 #135 「설정값 관리 화면」 — 하네스가 마무리하지 못했다\n/);
  for (const leak of ["무엇을 변경했나요", "page.tsx", "screens.ts", "매핑표"]) {
    assert.ok(!card135.includes(leak), `하위 명령 보고의 「${leak}」 가 카드에 실렸다:\n${card135}`);
  }
  assert.ok(!card135.includes("폼으로 다시 내 주세요"), "만들어진 화면을 두고 폼을 다시 내라고 하면 안 된다");
  assert.match(card135, /`plan\.json` 을 쓰지 않고/);
  assert.match(card135, /runs\/` 의 실행 기록/);
});

test("멈춤 제목이 아닌 낱말로 물음을 가리지 않는다 — 「무엇을」 이 든 실패도 실패로 낸다", () => {
  // 2026-09-29 #135 에서 판정이 낱말 조각(`무엇을`)에 걸렸다. 스킬이 정한 제목만 본다.
  const failing = ["## 처리 중 실패", "", "- 무엇을 만들지 고를 수조차 없었다 — `pnpm check` 가 화면 자리 밖에서 실패했다"].join("\n");
  const card = stopNotice(7, failing, { title: "무엇 화면" });
  assert.match(card, /^⚠️ /, "제목이 「처리 중 실패」 인데 물음으로 냈다");
  assert.match(card, /개발자에게 알려 주세요/);
  assert.ok(!card.includes("(물음)"), "제목에 (물음) 을 붙이지 않는다");

  const asking = ["## 묻고 멈춤", "", "- 고칠 화면을 찾지 못했다", "1. 첫째 갈래", "2. 둘째 갈래"].join("\n");
  assert.match(stopNotice(7, asking, { title: "무엇 화면" }), /^🙋 화면 요청 #7 「무엇 화면」 — 묻고 멈춤\n/);
});

test("모델이 까닭을 적었으면 그 보고를 그대로 카드로 보낸다 — 없을 때만 러너의 제목을 쓴다", () => {
  // 2026-09-24 #60: 모델이 「새 요구입니다 — 폼으로 새 요청을 내 주세요」라고 적었는데 러너가 「plan.json 이
  // 없다」로 덮어 보냈다. 기획자는 무엇을 해야 할지 알 수 없었다.
  const report = "## 묻고 멈춤\n\n- 새 요구입니다";
  assert.equal(stopReport(report, "화면을 만들지 못했다"), report);
  for (const empty of ["", undefined]) {
    assert.match(stopReport(empty, "화면을 만들지 못했다"), /^## 화면을 만들지 못했다\n\n- 모델이 까닭을 남기지 않았다/);
  }
});

test("묻는 것과 실패를 가려 카드를 쓴다 — 묻는 것을 실패로 적으면 기획자가 개발자를 부른다", () => {
  // 2026-09-24 #99: 「무엇을 고칠지 요청에 없다」고 물었는데 카드가 「⚠️ 처리 중 실패 · 개발자가 봐야
  // 합니다」로 나갔다. 게다가 고를 갈래 셋 가운데 「1.」 한 줄에서 잘렸다.
  const asking = ["## 묻고 멈춤", "", "- 상단에 검색 UI 가 없다 — 무엇을 만들지 요청에 없다", "1. 검색창을 새로 둔다", "2. 입력줄을 옮긴다", "3. 다른 화면이다"].join("\n");
  const card = stopNotice(99, asking, { title: "수정" });
  assert.match(card, /^🙋 /, "묻는 것에 실패 표시를 달면 안 된다");
  assert.match(card, /폼으로 다시 내 주세요/);
  for (const n of ["1.", "2.", "3."]) assert.ok(card.includes(n), `갈래 ${n} 가 잘렸다`);

  const failing = ["## 처리 중 실패", "", "- `pnpm check` 가 화면 자리 밖에서 실패했다"].join("\n");
  const bad = stopNotice(99, failing, { title: "수정" });
  assert.match(bad, /^⚠️ /);
  assert.match(bad, /개발자에게 알려 주세요/);
});

test("시작 알림은 처리와 개선에만, 예상 시간과 함께 올린다", () => {
  const est = { low: 11, high: 15, median: 12, n: 8, source: "기록" };
  assert.equal(
    startNotice(135, { title: "설정값 관리 화면", round: 1, kind: "처리", est }),
    "⏳ 화면 요청 #135 「설정값 관리 화면」 처리를 시작했습니다 — 보통 11~15분 걸립니다(기록 8건의 중간값 12분). 끝나면 이 자리에 결과 카드가 옵니다.",
  );
  assert.match(startNotice(135, { title: "설정값 관리 화면", round: 2, kind: "개선", est }), /2회차 개선을 시작했습니다/);
  // 예상을 못 재도 시작은 알린다 — 숫자가 없는 것이 아무 말도 없는 것보다 낫다.
  assert.equal(startNotice(9, {}), "⏳ 화면 요청 #9 처리를 시작했습니다 끝나면 이 자리에 결과 카드가 옵니다.");
});

test("승인·반려·결과에는 시작 알림을 올리지 않는다 — 결정 답장이 이미 말했고 6분이다", () => {
  const source = readFileSync(new URL("./runner.mjs", import.meta.url), "utf8");
  const calls = source.match(/await notifyStart\(/g) ?? [];
  assert.equal(calls.length, 2, "시작 알림을 부르는 자리는 처리와 개선 둘뿐이다");
  const approve = source.slice(source.indexOf("async function approve"), source.indexOf("async function reject"));
  assert.ok(!approve.includes("notifyStart"), "승인에서 시작 알림을 올리면 안 된다");
});

test("모델이 plan.json 을 안 써도 작업 트리에서 계획을 짓는다 — 만든 화면을 버리지 않는다", () => {
  // 2026-09-29 #135·#147: 화면과 시험을 다 만들고 검사까지 지난 뒤 하위 명령 보고로 끝냈다. 스킬에 적어도 또 그랬다.
  const status = [
    " M apps/sandbox/src/screens.ts",
    "?? apps/sandbox/src/app/webtoon-main/page.test.tsx",
    "?? apps/sandbox/src/app/webtoon-main/page.tsx",
  ].join("\n");
  const registered = [{ key: "webtoon-main", name: "웹툰 메인 화면", project: "하네스-시험", viewports: ["web", "mobile"] }];
  const report = [
    "## pull request 준비 완료",
    "## 판단이 필요한 것",
    "- 회차 목록의 개수는 요청에 없어 정했습니다.",
    "## 미확정 자산 후보",
    "없음.",
  ].join("\n");
  const sources = { "webtoon-main": 'import { Badge, Button as B, Chip } from "@ooee/ui";\nimport { useState } from "react";\n' };
  const plan = recoverPlan({ issue: 147, report, args: "웹툰 메인 화면. 유형: web, mobile", status, registered, sources });
  assert.deepEqual(plan.screens, [{ key: "webtoon-main", name: "웹툰 메인 화면", project: "하네스-시험", viewports: ["web", "mobile"], args: "웹툰 메인 화면. 유형: web, mobile" }]);
  assert.deepEqual(plan.componentsUsed, ["Badge", "Button", "Chip"], "`as` 로 바꿔 쓴 이름도 원래 이름으로 센다");
  assert.deepEqual(plan.needsDecision, ["회차 목록의 개수는 요청에 없어 정했습니다."], "「없음.」 은 싣지 않는다");
  assert.match(plan.other[0], /러너가 작업 트리에서 지었습니다/);
  assert.deepEqual(validatePlan(plan, { issue: 147 }), [], "지은 계획이 검사를 지나야 landScreens 로 간다");
});

test("지을 근거가 없으면 짓지 않는다 — 화면이 없거나 등록되지 않았으면 멈춘다", () => {
  const registered = [{ key: "webtoon-main", name: "웹툰 메인 화면", project: "하네스-시험", viewports: ["web"] }];
  assert.equal(recoverPlan({ issue: 147, report: "", args: "x", status: " M apps/sandbox/src/screens.ts", registered }), null, "새 화면 폴더가 없다");
  assert.equal(recoverPlan({ issue: 147, report: "", args: "x", status: "?? apps/sandbox/src/app/없는화면/page.tsx", registered }), null, "screens.ts 에 등록되지 않았다");
  assert.equal(recoverPlan({ issue: 147, report: "", args: "x", status: "", registered }), null, "트리가 비었다");
});
