// 이 Mac 의 self-hosted runner 에서 화면 요청을 처리한다. `.github/workflows/harness.yml` 이 부른다.
//
//   node scripts/harness/runner.mjs 처리 <번호>
//   node scripts/harness/runner.mjs 결정 [<번호>]   # 번호가 없으면 열린 화면 요청을 모두 본다
//   node scripts/harness/runner.mjs 결과 <번호>
//
// Claude 는 `/process-issue … 러너` 로 화면을 만들고 push 한 뒤, pull request 를 만들 자리에서 넘김 파일
// (`.harness-work/issue-<n>/handoff.json`)을 쓰고 멈춘다. pull request 를 만들고 합치는 것은 이 스크립트다.
// `gh pr create`·`gh pr merge` 는 공용 권한의 ask 이고, ask 는 allow 보다 먼저 판정되어 headless 세션에서
// 풀 방법이 없다. 게이트를 에이전트가 스스로 넘지 않게 한 #8·#21 과도 맞는다. 합친 뒤에는 같은 세션을
// 이어 받게 해 배포 확인과 결과 댓글을 맡긴다.
//
// gh 와 git 은 이 Mac 의 로그인(gh keyring)으로 돈다. workflow 의 GITHUB_TOKEN 으로 만든 pull request 와
// 머지는 다른 workflow 를 깨우지 않아 Quality 와 Deploy 가 돌지 않기 때문이다.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../..");

/** 하네스 명령과 같은 값이다. SKILL.md 머리말이 명령 안에서 다시 고정하지만, 이어 받는 차례는 머리말 밖이다. */
export const MODEL = "claude-sonnet-5";
export const EFFORT = "high";

/** 스킬의 allowed-tools 밖에서 러너가 더 여는 것. D3 의 되돌리기만이다. */
export const EXTRA_ALLOWED = ["Bash(git revert --no-edit *)", "Bash(git revert --abort)"];

/** 결정 가운데 러너가 이어 처리하는 것. 대기·결과 없음은 할 일이 없다. */
export const ACTIONABLE = new Set(["승인", "반려", "개선"]);

const QUALITY_TIMEOUT_MS = 30 * 60 * 1000;
const POLL_MS = 15 * 1000;

export function handoffPath(issue, root = repoRoot) {
  return path.join(root, ".harness-work", `issue-${issue}`, "handoff.json");
}

/** 러너 상태(이미 처리한 결정)는 checkout 이 지우지 않는 자리에 둔다. */
export function stateFile(env = process.env) {
  const dir = env.HARNESS_STATE_DIR || path.join(os.homedir(), ".ooee-harness");
  return path.join(dir, "decisions.json");
}

/** `claude -p` 인수. 프롬프트를 `-p` 바로 뒤에 둔다 — `--allowedTools` 는 뒤의 인수를 모두 삼킨다. */
export function buildClaudeArgs(prompt, { resume } = {}) {
  const args = ["-p", prompt, "--output-format", "json", "--model", MODEL, "--effort", EFFORT];
  args.push("--permission-mode", "acceptEdits");
  args.push("--plugin-dir", "plugins/ooee-harness", "--mcp-config", ".mcp.json");
  if (resume) args.push("-r", resume);
  args.push("--allowedTools", ...EXTRA_ALLOWED);
  return args;
}

/** 합친 뒤 세션을 이어 받게 하는 말. 스킬의 「러너에서 돌 때」가 이 꼴을 기다린다. */
export function continuationPrompt(pr, mergeCommit) {
  return `러너: pull request #${pr} 가 dev 에 squash 로 머지되었다(머지 commit ${mergeCommit}). 「러너에서 돌 때」대로 7단계부터 이어 간다.`;
}

/**
 * 넘김 파일을 검사한다. 모델이 쓴 파일이라 그대로 믿지 않는다 — 이 스크립트는 그것으로 pull request 를
 * 만들고 합치므로, 이 요청의 가지·제목·본문 첫 줄이 아니면 만들지 않는다.
 */
export function validateHandoff(handoff, issue, root = repoRoot) {
  const problems = [];
  const n = Number(issue);
  if (!handoff || typeof handoff !== "object") return ["넘김 파일이 JSON 객체가 아니다"];
  if (handoff.issue !== n) problems.push(`issue 가 ${n} 이 아니다(${handoff.issue})`);
  if (!["dev", "main"].includes(handoff.target)) problems.push(`target 이 dev·main 이 아니다(${handoff.target})`);
  if (typeof handoff.title !== "string" || !handoff.title.trim()) problems.push("title 이 없다");
  const bodyFile = typeof handoff.bodyFile === "string" ? path.resolve(root, handoff.bodyFile) : null;
  const workDir = path.join(root, ".harness-work", `issue-${n}`) + path.sep;
  if (!bodyFile || !bodyFile.startsWith(workDir)) problems.push(`bodyFile 이 .harness-work/issue-${n}/ 안이 아니다`);
  else if (!existsSync(bodyFile)) problems.push(`bodyFile 이 없다(${handoff.bodyFile})`);
  if (problems.length) return problems;

  const firstLine = readFileSync(bodyFile, "utf8").split("\n")[0].trim();
  if (handoff.target === "dev") {
    if (typeof handoff.branch !== "string" || !handoff.branch.startsWith(`feature/issue-${n}-`)) {
      problems.push(`branch 가 feature/issue-${n}- 로 시작하지 않는다(${handoff.branch})`);
    }
    if (!new RegExp(`^(요청|되돌림): #${n}(?!\\d)`).test(firstLine)) problems.push(`본문 첫 줄이 「요청: #${n}」·「되돌림: #${n}」이 아니다`);
  } else if (!new RegExp(`^승인: #${n}(?!\\d)`).test(firstLine)) {
    problems.push(`본문 첫 줄이 「승인: #${n}」이 아니다`);
  }
  return problems;
}

/** 같은 결정을 두 번 처리하지 않게 하는 열쇠. 사람이 새 신호를 남기면 `at` 이 바뀌어 다시 처리한다. */
export function decisionKey(read) {
  return `${read.issue}:${read.round}:${read.decision}:${read.at}`;
}

/** 판독 결과 가운데 러너가 처리할 것. 이미 처리한 열쇠는 뺀다. */
export function pickActionable(reads, done) {
  return reads.filter((read) => ACTIONABLE.has(read.decision) && !done[decisionKey(read)]);
}

function sh(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { cwd: repoRoot, encoding: "utf8", maxBuffer: 64 * 1024 * 1024, ...opts });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function log(line) {
  process.stdout.write(`${line}\n`);
  if (process.env.GITHUB_STEP_SUMMARY) writeFileSync(process.env.GITHUB_STEP_SUMMARY, `${line}\n`, { flag: "a" });
}

/** `claude -p` 를 돌리고 JSON 결과를 돌려준다. 보고 전문은 로그와 job 요약에 남긴다. */
function runClaude(prompt, opts) {
  const out = sh("claude", buildClaudeArgs(prompt, opts), { stdio: ["ignore", "pipe", "inherit"] });
  const json = JSON.parse(out);
  log(`\n### Claude (${prompt.slice(0, 60)}…)\n`);
  log(`- 세션 ${json.session_id} · 턴 ${json.num_turns} · 모델 ${Object.keys(json.modelUsage ?? {}).join(", ") || "알 수 없음"}`);
  if (json.permission_denials?.length) log(`- 막힌 도구 ${json.permission_denials.length}건: ${json.permission_denials.map((d) => d.tool_name).join(", ")}`);
  log(`\n${json.result ?? ""}\n`);
  if (json.is_error) throw new Error(`Claude 가 오류로 끝났다(${json.subtype})`);
  return json;
}

async function waitQuality(sha) {
  const deadline = Date.now() + QUALITY_TIMEOUT_MS;
  // pull request 를 만든 직후에는 실행이 아직 없어 「검사 없음」으로 끝난 것처럼 보인다. 실행이 생길 때까지 먼저 기다린다.
  let runId = null;
  while (!runId && Date.now() < deadline) {
    const runs = JSON.parse(sh("gh", ["run", "list", "--workflow", "quality.yml", "--commit", sha, "--json", "databaseId,event"]));
    runId = runs.find((run) => run.event === "pull_request")?.databaseId ?? null;
    if (!runId) await sleep(POLL_MS);
  }
  if (!runId) throw new Error(`Quality 실행이 ${sha} 에 생기지 않았다`);
  try {
    sh("gh", ["run", "watch", String(runId), "--exit-status"], { stdio: ["ignore", "ignore", "inherit"] });
  } catch {
    throw new Error(`Quality 가 실패했다(run ${runId}). 합치지 않는다`);
  }
}

/** 넘김 파일대로 pull request 를 만들고 Quality 를 본 뒤 합친다. 머지 commit 을 돌려준다. */
async function landHandoff(issue) {
  const file = handoffPath(issue);
  if (!existsSync(file)) return null;
  const handoff = JSON.parse(readFileSync(file, "utf8"));
  const problems = validateHandoff(handoff, issue);
  if (problems.length) throw new Error(`넘김 파일을 따르지 않는다: ${problems.join(" · ")}`);

  const head = handoff.target === "dev" ? handoff.branch : "dev";
  const url = sh("gh", ["pr", "create", "--base", handoff.target, "--head", head, "--title", handoff.title, "--body-file", handoff.bodyFile]).trim();
  const pr = Number(url.split("/").pop());
  log(`- pull request #${pr} (${head} → ${handoff.target}) ${url}`);

  const { headRefOid } = JSON.parse(sh("gh", ["pr", "view", String(pr), "--json", "headRefOid"]));
  await waitQuality(headRefOid);
  const method = handoff.target === "dev" ? ["--squash", "--delete-branch"] : ["--merge"];
  sh("gh", ["pr", "merge", String(pr), ...method]);
  const { mergeCommit } = JSON.parse(sh("gh", ["pr", "view", String(pr), "--json", "mergeCommit"]));
  log(`- #${pr} 머지 ${mergeCommit.oid}`);
  return { handoff, pr, mergeCommit: mergeCommit.oid };
}

/** 한 번의 `/process-issue` 호출과, 넘김이 있으면 합치기·이어 받기까지. */
async function runChain(issue, argument) {
  rmSync(handoffPath(issue), { force: true });
  const first = runClaude(`/process-issue ${argument} 러너`);
  const landed = await landHandoff(issue);
  if (!landed) {
    log("- 넘김 파일이 없다. 처리가 멈춘 자리는 위 보고에 있다.");
    return false;
  }
  if (landed.handoff.resume) runClaude(continuationPrompt(landed.pr, landed.mergeCommit), { resume: first.session_id });
  return true;
}

function readState(file) {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return {};
  }
}

async function decideAll(only) {
  const numbers = only
    ? [Number(only)]
    : JSON.parse(sh("gh", ["issue", "list", "--state", "open", "--search", "화면 요청 in:title", "--json", "number,title", "--limit", "100"]))
        .filter((item) => item.title.startsWith("화면 요청"))
        .map((item) => item.number);
  const reads = numbers.map((n) => JSON.parse(sh("node", ["scripts/harness/decision.mjs", String(n)])));
  const file = stateFile();
  const done = readState(file);
  const todo = pickActionable(reads, done);
  log(`결정 확인: 요청 ${numbers.length}건, 처리할 결정 ${todo.length}건`);
  let ok = true;
  for (const read of todo) {
    // 처리하기 전에 적는다. 멈추거나 실패한 결정을 10분마다 다시 돌리지 않으려는 것이다. 다시 돌리려면 사람이 새 신호를 남긴다.
    done[decisionKey(read)] = { startedAt: new Date().toISOString() };
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, `${JSON.stringify(done, null, 2)}\n`);
    log(`\n## #${read.issue} ${read.round}회차 ${read.decision} (${read.by} · ${read.at})`);
    if (!(await runChain(read.issue, `결정 ${read.issue}`))) ok = false;
  }
  return ok;
}

async function main(argv) {
  const [mode, issue] = argv;
  const needsIssue = mode === "처리" || mode === "결과";
  if (!["처리", "결정", "결과"].includes(mode) || (needsIssue && !/^\d+$/.test(issue ?? "")) || (issue && !/^\d+$/.test(issue))) {
    process.stderr.write("사용법: node scripts/harness/runner.mjs 처리|결과 <번호> · 결정 [<번호>]\n");
    return 2;
  }
  if (mode === "결정") return (await decideAll(issue)) ? 0 : 1;
  if (mode === "결과") {
    runClaude(`/process-issue 결과 ${issue} 러너`);
    return 0;
  }
  log(`## 화면 요청 #${issue} 처리`);
  return (await runChain(Number(issue), String(issue))) ? 0 : 1;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main(process.argv.slice(2)).then(
    (code) => process.exit(code),
    (error) => {
      log(`\n**러너가 멈췄다:** ${error.message}`);
      process.exit(1);
    },
  );
}
