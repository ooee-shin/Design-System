// 러너가 모델이 쓴 넘김 파일을 믿지 않는지, 같은 결정을 두 번 처리하지 않는지를 고정한다. claude·gh 는 부르지 않는다.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  EXTRA_ALLOWED,
  MODEL,
  buildClaudeArgs,
  chainedAllowedTools,
  continuationPrompt,
  decisionKey,
  pickActionable,
  staleBranches,
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
  assert.equal(args[args.indexOf("--effort") + 1], "high");
});

test("이어 받을 때만 세션을 넘긴다", () => {
  assert.ok(!buildClaudeArgs("x").includes("-r"), "처음 부르는데 세션을 이어 받으려 한다");
  const args = buildClaudeArgs("x", { resume: "abc" });
  assert.equal(args[args.indexOf("-r") + 1], "abc");
});

test("러너가 스스로 더 여는 것은 되돌리기뿐이다 — pull request 명령은 열지 않는다", () => {
  assert.ok(EXTRA_ALLOWED.every((rule) => rule.startsWith("Bash(git revert")), `되돌리기 밖의 규칙이 있다: ${EXTRA_ALLOWED}`);
});

test("하위 명령이 머리말에 적은 도구를 넘긴다 — #29 에서 막힌 design-page 의 화면 띄우기가 들어 있다", () => {
  const tools = chainedAllowedTools();
  assert.ok(tools.includes("Bash(node scripts/figma/sandbox-server.mjs:*)"), "design-page 의 화면 띄우기가 빠졌다");
  assert.ok(tools.includes("mcp__figma__use_figma"), "Figma 에 그리는 도구가 빠졌다");
  const args = buildClaudeArgs("x");
  for (const tool of tools) assert.ok(args.includes(tool), `${tool} 이 CLI 로 넘어가지 않는다`);
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
  const approved = fakeRoot(12, "승인: #12 1회차 — 신주희 · 2026-09-22 · 반응");
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

test("workflow 는 이 Mac 의 러너에서 dev 를 받아 이 스크립트를 부른다", () => {
  const workflow = readFileSync(path.join(repoRoot, ".github/workflows/harness.yml"), "utf8");
  assert.match(workflow, /runs-on: \[self-hosted, ooee-mac\]/, "이 Mac 이 아닌 곳에서 돈다 — Figma 로그인이 없다");
  assert.match(workflow, /ref: dev/, "처리 코드를 dev 에서 받지 않는다");
  assert.match(workflow, /persist-credentials: false/, "GITHUB_TOKEN 으로 push 하면 Quality·Deploy 가 깨지 않는다");
  assert.match(workflow, /cron: "\*\/10 \* \* \* \*"/, "결정 확인 간격이 10분이 아니다");
  assert.ok(workflow.includes("scripts/harness/runner.mjs"), "이 스크립트를 부르지 않는다");
});
