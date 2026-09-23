// 러너가 모델이 쓴 넘김 파일을 믿지 않는지, 같은 결정을 두 번 처리하지 않는지를 고정한다. claude·gh 는 부르지 않는다.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { looksLikeDecision, readCommentDecision } from "./decision.mjs";

import {
  CHAINED_SKILLS,
  EFFORT,
  EXTRA_ALLOWED,
  OWN_SKILL,
  closingComment,
  MODEL,
  buildClaudeArgs,
  chainedAllowedTools,
  continuationPrompt,
  decisionKey,
  lookalikeKey,
  outsideScreenFiles,
  screenKeys,
  pickActionable,
  pickUnreadLookalikes,
  resultMissing,
  staleBranches,
  stopNotice,
  validateHandoff,
} from "./runner.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../..");

/** 가짜 저장소 뿌리에 넘김 본문을 써 두고 그 뿌리를 돌려준다. */
function fakeRoot(issue, firstLine) {
  const root = mkdtempSync(path.join(os.tmpdir(), "runner-"));
  const dir = path.join(root, ".harness-work", `issue-${issue}`);
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, "pr-1.md"), `${firstLine}\n\n본문\n`);
  return root;
}

const devHandoff = (over = {}) => ({
  issue: 12,
  target: "dev",
  branch: "feature/issue-12-shop",
  title: "feat(sandbox): 상품 목록 화면 추가 (#12)",
  bodyFile: ".harness-work/issue-12/pr-1.md",
  resume: true,
  ...over,
});

test("프롬프트는 -p 바로 뒤에 두고 --allowedTools 는 맨 끝에 둔다", () => {
  const args = buildClaudeArgs("/process-issue 12 러너");
  assert.deepEqual(args.slice(0, 2), ["-p", "/process-issue 12 러너"], "프롬프트가 --allowedTools 에 삼켜질 자리에 있다");
  const after = args.slice(args.indexOf("--allowedTools") + 1);
  assert.ok(after.length > 0 && after.every((arg) => !arg.startsWith("--")), "--allowedTools 뒤에 다른 인수가 있다");
});

test("모델과 effort 를 하네스 명령과 같은 값으로 박는다", () => {
  const args = buildClaudeArgs("x");
  assert.equal(args[args.indexOf("--model") + 1], MODEL);
  assert.equal(MODEL, "claude-sonnet-5", "별칭이 아니라 전체 ID 여야 새 모델로 저절로 옮겨 가지 않는다");
  assert.equal(args[args.indexOf("--effort") + 1], EFFORT);
  assert.equal(EFFORT, "high", "별칭이나 빈 값이 아니라 고정된 값이어야 세션마다 같은 결과가 난다");
  for (const file of [OWN_SKILL, ...CHAINED_SKILLS]) {
    const head = readFileSync(path.join(repoRoot, file), "utf8").match(/^---\n[\s\S]*?^effort:(.*)$/m)?.[1]?.trim();
    assert.equal(head, EFFORT, `${file} 머리말의 effort 가 러너와 다르다`);
  }
});

test("이어 받을 때만 세션을 넘긴다", () => {
  assert.ok(!buildClaudeArgs("x").includes("-r"), "처음 부르는데 세션을 이어 받으려 한다");
  const args = buildClaudeArgs("x", { resume: "abc" });
  assert.equal(args[args.indexOf("-r") + 1], "abc");
});

test("러너가 스스로 더 여는 것은 되돌리기뿐이다 — pull request 명령은 열지 않는다", () => {
  assert.ok(EXTRA_ALLOWED.every((rule) => rule.startsWith("Bash(git revert")), `되돌리기 밖의 규칙이 있다: ${EXTRA_ALLOWED}`);
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
  for (const tool of [...EXTRA_ALLOWED, ...chainedAllowedTools()]) {
    assert.doesNotMatch(tool, /gh (api|issue (comment|edit|close|reopen)|label|pr (create|merge))/, `넘기면 안 되는 도구: ${tool}`);
  }
});

test("앞 실행이 push 하지 않은 이 요청의 가지만 지운다", () => {
  const local = ["dev", "feature/issue-29-ecommerce-dashboard", "feature/issue-29-shop-r2", "feature/issue-290-x", "feature/issue-3-y"];
  const remote = ["dev", "main", "feature/issue-29-shop-r2"];
  assert.deepEqual(staleBranches(29, local, remote), ["feature/issue-29-ecommerce-dashboard"]);
});

test("이어 받는 말은 스킬의 「러너에서 돌 때」가 기다리는 꼴이다", () => {
  const prompt = continuationPrompt(31, "abc123");
  assert.match(prompt, /^러너: pull request #31 가 dev 에 squash 로 머지되었다\(머지 commit abc123\)/);
  const skill = readFileSync(path.join(repoRoot, ".claude/skills/process-issue/SKILL.md"), "utf8");
  assert.ok(skill.includes("러너: pull request #<번호> 가 dev 에 squash 로 머지되었다"), "스킬이 이 말을 모른다");
});

test("배포를 러너가 확인했으면 그 결과를 넘기고 8단계부터 시키다", () => {
  // #60 은 「알림이 올 것이므로 기다린다」, #62 는 「백그라운드로 넘어갔다」 하고 턴을 끝내 결과 댓글이
  // 없었다. 기다림은 deploy-check.mjs 의 일이라, 모델에게는 끝난 결과만 준다.
  const prompt = continuationPrompt(72, "abc123", { ok: true, keys: ["kakao-message-dashboard"] });
  assert.match(prompt, /8단계\(결과 댓글\)부터 이어 간다/);
  assert.match(prompt, /배포를 다시 확인하지 말고/);
  assert.match(prompt, /"kakao-message-dashboard"/);
  assert.match(continuationPrompt(72, "abc"), /7단계부터 이어 간다/, "확인 결과가 없으면 예전처럼 7단계부터다");
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

test("이 요청의 dev 넘김은 따른다", () => {
  const root = fakeRoot(12, "요청: #12");
  assert.deepEqual(validateHandoff(devHandoff(), 12, root), []);
});

test("되돌리기 넘김도 따른다", () => {
  const root = fakeRoot(12, "되돌림: #12");
  assert.deepEqual(validateHandoff(devHandoff({ branch: "feature/issue-12-revert", resume: false }), 12, root), []);
});

test("다른 요청의 가지나 본문이면 따르지 않는다", () => {
  const root = fakeRoot(12, "요청: #123");
  const problems = validateHandoff(devHandoff({ branch: "feature/issue-13-shop" }), 12, root);
  assert.ok(problems.some((p) => p.includes("branch")), "다른 요청의 가지를 받았다");
  assert.ok(problems.some((p) => p.includes("첫 줄")), "#123 을 #12 로 읽었다");
});

test("main 넘김은 승인 줄이 있어야 한다", () => {
  const root = fakeRoot(12, "요청: #12");
  const problems = validateHandoff(devHandoff({ target: "main", branch: undefined }), 12, root);
  assert.ok(problems.some((p) => p.includes("승인: #12")), "승인 없이 main 으로 가는 넘김을 받았다");
  const approved = fakeRoot(12, "승인: #12 1회차 — 기획자 · 2026-09-22 · 반응");
  assert.deepEqual(validateHandoff(devHandoff({ target: "main", branch: undefined }), 12, approved), []);
});

test("본문 파일이 이 요청의 작업 자리 밖이면 따르지 않는다", () => {
  const root = fakeRoot(12, "요청: #12");
  for (const bodyFile of ["README.md", ".harness-work/issue-13/pr-1.md", ".harness-work/issue-12/../../README.md"]) {
    const problems = validateHandoff(devHandoff({ bodyFile }), 12, root);
    assert.ok(problems.some((p) => p.includes("bodyFile")), `${bodyFile} 를 받았다`);
  }
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

test("화면은 합쳐졌는데 결과가 없으면 그것도 결과 채널에 알린다", () => {
  // #60: 넘김은 성공해 dev 까지 합쳐졌고 배포 확인·결과 댓글만 빠졌다. 그 자리가 알림 밖이라 기획자에게는
  // 아무 일도 없던 것이 됐다. 카드에 무엇이 됐고 무엇이 빠졌는지, 개발자가 무엇을 돌려야 하는지 적는다.
  const card = stopNotice(60, resultMissing(60, 69), { title: "챗봇 채팅 화면", url: "https://x/60", tail: "개발자가 결과를 다시 올려야 합니다." });
  assert.match(card, /^⚠️ 화면 요청 #60 「챗봇 채팅 화면」 — 화면은 만들었는데 결과가 올라가지 않았다/);
  assert.match(card, /pull request #69/);
  assert.match(card, /`결과 60` 명령을 돌리면/);
  assert.ok(!card.includes("요청을 고쳐 다시 내"), "요청 잘못이 아닌데 기획자에게 다시 내라고 한다");
  assert.match(card, /자세히: https:\/\/x\/60$/);
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

test("이어 받는 차례에도 배포 확인과 결과 댓글에 쓰는 도구를 넘긴다", () => {
  // 7·8단계는 이어 받은 세션이 명령 밖에서 한다. process-issue 머리말이 CLI 로 넘어가지 않으면 거부된다.
  const args = buildClaudeArgs("러너: …", { resume: "abc" });
  for (const tool of ["Bash(gh run view:*)", "Bash(node scripts/harness/post-result.mjs:*)", "Bash(node scripts/harness/decision.mjs:*)"]) {
    assert.ok(args.includes(tool), `${tool} 이 이어 받는 차례에 넘어가지 않는다`);
  }
  assert.ok(args.includes("Bash(node scripts/harness/deploy-check.mjs:*)"), "배포 확인 스크립트가 넘어가지 않는다");
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
  assert.match(closingComment("반려", "되돌림 PR #59"), /dev 에서 되돌렸/);
});

test("이미 main 에 있는 승인은 commit 목록으로 넘긴다 — pull request 없이 이슈만 닫는다", () => {
  const root = fakeRoot(12, "요청: #12");
  assert.deepEqual(validateHandoff({ issue: 12, target: "main", already: true, commits: ["abc1234", "def5678"] }, 12, root), []);
  const noCommits = validateHandoff({ issue: 12, target: "main", already: true, commits: [] }, 12, root);
  assert.ok(noCommits.some((p) => p.includes("commits")), "commit 이 없는데 받았다");
  const wrongTarget = validateHandoff({ issue: 12, target: "dev", already: true, commits: ["abc1234"] }, 12, root);
  assert.ok(wrongTarget.some((p) => p.includes("main 넘김")), "dev 넘김에 already 를 받았다");
  const junk = validateHandoff({ issue: 12, target: "main", already: true, commits: ["not a sha"] }, 12, root);
  assert.ok(junk.some((p) => p.includes("commits")), "sha 가 아닌 것을 받았다");
});

test("멈추면 결과 채널에 첫 제목과 문제 줄만 알린다 — 기획자가 무엇을 다시 낼지 보면 된다", () => {
  const report = "앞말\n\n## 묻고 멈춤\n\n**멈춘 단계:** 1단계\n\n- 화면 유형이 2개(모바일, 태블릿)다 — 하나를 묻는다\n- 새 프로젝트 「신주희 테스트」\n\n## 막힌 명령\n- 없음";
  const text = stopNotice(60, report, { title: "챗봇 채팅 화면", url: "https://github.com/x/y/issues/60" });
  assert.match(text, /^⚠️ 화면 요청 #60 「챗봇 채팅 화면」 — 묻고 멈춤\n/);
  assert.match(text, /· 화면 유형이 2개/);
  assert.match(text, /요청을 고쳐 다시 내거나/);
  assert.match(text, /자세히: https:\/\/github\.com\/x\/y\/issues\/60$/);
  assert.doesNotMatch(text, /막힌 명령/, "보고 전체를 옮기면 카드가 길어진다");
  assert.match(stopNotice(1, "제목 없는 보고"), /처리가 멈췄다/);
});
