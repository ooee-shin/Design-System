// 이 Mac 의 self-hosted runner 에서 화면 요청을 처리한다. `.github/workflows/harness.yml` 이 부른다.
//
//   node scripts/harness/runner.mjs 처리 <번호>
//   node scripts/harness/runner.mjs 결정 [<번호>]   # 번호가 없으면 열린 화면 요청을 모두 본다
//   node scripts/harness/runner.mjs 결과 <번호>
//
// **모델이 하는 일은 하나다** — `/make-screens <n> 러너` 로 화면을 만들고 `plan.json` 을 쓴다. 나머지(가지·
// commit·push·pull request·Quality·머지·배포 확인·결과 댓글·이슈 닫기)는 모두 이 스크립트다. 승인과 반려는
// 판단이 없어 모델을 아예 부르지 않고, 개선만 사유가 무엇을 가리키는지 읽히려고 부른다. 까닭은
// `plan.mjs`·`decide.mjs` 머리말에 있다(`2026-09-24` 역할 뒤집기).
//
// `gh pr create`·`gh pr merge` 는 공용 권한의 ask 이고, ask 는 allow 보다 먼저 판정되어 headless 세션에서 풀
// 방법이 없다. 게이트를 에이전트가 스스로 넘지 않게 한 #8·#21 과도 맞는다.
//
// gh 와 git 은 이 Mac 의 로그인(gh keyring)으로 돈다. workflow 의 GITHUB_TOKEN 으로 만든 pull request 와
// 머지는 다른 workflow 를 깨우지 않아 Quality 와 Deploy 가 돌지 않기 때문이다.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { freeBranch, howToUnmix, improveBlocked, isRequestOf, isRevertOf, mainPr, revertPr, screenCommits, sortLanded } from "./decide.mjs";
import { branchName, planPath, prBody, readScreens, removeScreens, resultInput, section, title, validatePlan } from "./plan.mjs";
import { postCard, slackTarget } from "./slack-card.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../..");

/** 하네스 명령과 같은 값이다. SKILL.md 머리말이 명령 안에서 다시 고정하지만, 이어 받는 차례는 머리말 밖이다. */
export const MODEL = "claude-sonnet-5";
// `2026-09-23` 에 #60 이 143분 걸려 `medium` 으로 낮췄다가 같은 날 개발자가 되돌렸다 — 느린 까닭은 생각
// 시간이 아니라 막힌 검사를 우회하느라 전체 검사를 네 번 돈 것이었다. 세 명령의 머리말도 같은 값이어야
// 한다(runner.test.mjs 가 본다).
export const EFFORT = "high";

/** 스킬의 allowed-tools 밖에서 러너가 더 여는 것. D3 의 되돌리기만이다. */
export const EXTRA_ALLOWED = ["Bash(git revert --no-edit *)", "Bash(git revert --abort)"];

/**
 * `/make-screens` 가 Skill 로 부르는 하위 명령. 하위 명령 머리말의 allowed-tools 는 바깥 명령 안에서 불릴 때
 * 적용되지 않는다 — #29 에서 하위 명령이 머리말에 적어 둔 명령이 그대로 거부됐다. 그래서 러너가 그 머리말을
 * 읽어 CLI 로 넘긴다. 원본은 여전히 각 SKILL.md 다.
 */
export const CHAINED_SKILLS = [
  "plugins/ooee-harness/skills/generate-code/SKILL.md",
  "plugins/ooee-harness/skills/review-design/SKILL.md",
];

/**
 * 모델을 부르는 유일한 명령. 화면을 만들고 `plan.json` 을 쓰는 것 하나만 한다(`2026-09-24` 역할 뒤집기).
 *
 * 그 밖의 단계는 이 스크립트가 하므로 모델에게 `gh`·`git` 쓰기 명령을 넘길 일이 없다.
 */
export const MAKE_SKILL = ".claude/skills/make-screens/SKILL.md";

/** 러너가 CLI 로 넘기는 머리말 allowed-tools. 이 명령과 하위 명령의 것을 겹치지 않게 모은다. */
export function chainedAllowedTools(root = repoRoot) {
  const tools = [MAKE_SKILL, ...CHAINED_SKILLS].flatMap((file) => {
    const text = readFileSync(path.join(root, file), "utf8");
    const line = text.match(/^---\n[\s\S]*?^allowed-tools:(.*)$/m)?.[1] ?? "";
    return line.split(/,\s+/).map((tool) => tool.trim()).filter(Boolean);
  });
  return [...new Set(tools)];
}

/** 결정 가운데 러너가 이어 처리하는 것. 대기·결과 없음은 할 일이 없다. */
export const ACTIONABLE = new Set(["승인", "반려", "개선"]);

const QUALITY_TIMEOUT_MS = 30 * 60 * 1000;
const POLL_MS = 15 * 1000;

/** 러너 상태(이미 처리한 결정)는 checkout 이 지우지 않는 자리에 둔다. */
export function stateFile(env = process.env) {
  const dir = env.HARNESS_STATE_DIR || path.join(os.homedir(), ".ooee-harness");
  return path.join(dir, "decisions.json");
}

/** `claude -p` 인수. 프롬프트를 `-p` 바로 뒤에 둔다 — `--allowedTools` 는 뒤의 인수를 모두 삼킨다. */
export function buildClaudeArgs(prompt, { resume } = {}) {
  const args = ["-p", prompt, "--output-format", "json", "--model", MODEL, "--effort", EFFORT];
  args.push("--permission-mode", "acceptEdits");
  args.push("--plugin-dir", "plugins/ooee-harness");
  if (resume) args.push("-r", resume);
  args.push("--allowedTools", ...EXTRA_ALLOWED, ...chainedAllowedTools());
  return args;
}

/**
 * 처리가 끝난 이슈를 닫을 때 다는 글. 결정 낱말로 시작하지 않는다 — decision.mjs 는 「승인」·「반려: …」로
 * 시작하는 댓글을 결정으로 읽으므로, 러너가 남기는 글이 다음 판독에 결정으로 잡히면 안 된다.
 */
export function closingComment(kind, detail) {
  const what = { 승인: "승인되어 main 에 반영됐습니다", 반려: "반려되어 dev 에서 되돌렸습니다" }[kind];
  return `처리를 마쳐 닫습니다 — ${what}${detail ? ` (${detail})` : ""}. 다시 요청하려면 Slack 폼으로 새 요청을 냅니다.`;
}

/**
 * 멈췄을 때 결과 채널에 올릴 글. 보고의 첫 제목과 그 아래 문제 줄만 뽑는다 — 기획자가 무엇을 다시 내야
 * 하는지만 보면 된다. 러너가 멈추면 job 로그에만 남아 요청한 사람은 알 길이 없었다(#60).
 */
/** 기획자가 답해야 하는 멈춤인지. 그러면 카드의 꼬리말이 개발자가 아니라 요청자를 가리킨다. */
const ASKING = /묻고 멈춤|무엇을|알 수 없|새 요구|다시 내/;

export function stopNotice(issue, report, { title = "", url = "", tail } = {}) {
  const lines = String(report ?? "").split("\n");
  // 하위 명령의 성공 제목을 멈춘 까닭으로 싣지 않는다. `2026-09-24` #85 카드가 「⚠️ … pull request 준비
  // 완료」로 나갔다 — generate-code 가 화면 하나를 만들고 낸 제목인데, 그 뒤 단계를 하지 않아 실패한 실행
  // 이었다. 이 명령 자신의 제목이 아니면 무엇이 됐든 끝나지 않은 것이다.
  const own = (line) => /^## /.test(line) && !/준비 완료|검사 실패|위반/.test(line);
  const at = lines.findIndex(own);
  const heading = at >= 0 ? lines[at].replace(/^## /, "") : "처리가 끝나지 않았다";
  // 그 제목의 절만 읽는다. 다음 제목까지 넘어가면 「거친 자리」의 통과한 단계가 까닭 자리에 실린다
  // (`2026-09-23` #62 카드: 멈춘 까닭 대신 `git switch dev — 통과` 넉 줄이 갔다).
  const section = at >= 0 ? lines.slice(at + 1) : lines;
  const end = section.findIndex((line) => /^## /.test(line));
  const rest = (end < 0 ? section : section.slice(0, end)).map((line) => line.trim()).filter(Boolean);
  // 고른 갈래를 반만 보여 주면 물음이 되지 않는다. `2026-09-24` #99 카드가 세 갈래 가운데 「1.」 한 줄만
  // 내보냈다. 번호 목록은 끊지 않고, 그 밖에는 여섯 줄까지 싣는다.
  const listed = rest.filter((line) => /^[-*] |^\d+\. /.test(line));
  const numbered = listed.filter((line) => /^\d+\. /.test(line)).length;
  const problems = listed.slice(0, Math.max(6, numbered + 3));
  const picked = problems.length ? problems : rest.slice(0, 4);
  // 쓸 줄이 하나도 없을 때가 있다 — 하위 명령의 제목만 남기고 끝난 실행(#85)이 그렇다. 빈 카드를 올리면
  // 기획자는 무엇이 잘못됐는지도, 무엇을 해야 하는지도 알 수 없다.
  const detail = picked.length
    ? picked.map((line) => line.replace(/^[-*] /, "· ")).join("\n")
    : "· 어디서 멈췄는지 보고에 남지 않았습니다. 개발자가 실행 기록을 봐야 합니다.";
  // 「실패」와 「물음」은 다르다. 묻는 것을 실패로 적으면 기획자는 고장 난 줄 알고 개발자를 부른다
  // (`2026-09-24` #99). 답할 사람이 요청자면 그렇게 말한다.
  const asking = ASKING.test(heading) || ASKING.test(detail);
  const mark = asking ? "🙋" : "⚠️";
  const say = tail ?? (asking ? "위 가운데 무엇인지 한 줄로 적어 폼으로 다시 내 주세요." : "요청을 고쳐 다시 내거나 개발자에게 알려 주세요.");
  const head = `${mark} 화면 요청 #${issue}${title ? ` 「${title}」` : ""} — ${asking && !/묻/.test(heading) ? `${heading} (물음)` : heading}`;
  const where = url ? `\n자세히: ${url}` : "";
  return `${head}\n${detail}\n\n${say}${where}`;
}

/** 같은 결정을 두 번 처리하지 않게 하는 열쇠. 사람이 새 신호를 남기면 `at` 이 바뀌어 다시 처리한다. */
export function decisionKey(read) {
  return `${read.issue}:${read.round}:${read.decision}:${read.at}`;
}

/** 판독 결과 가운데 러너가 처리할 것. 이미 처리한 열쇠는 뺀다. */
export function pickActionable(reads, done) {
  return reads.filter((read) => ACTIONABLE.has(read.decision) && !done[decisionKey(read)]);
}

/** 결정처럼 보이지만 읽지 않은 댓글의 열쇠. 가장 늦은 그 댓글의 시각이라, 새로 달려야 다시 알린다. */
export function lookalikeKey(read) {
  const last = read.lookalikes.map((item) => item.at ?? "").sort().at(-1);
  return `${read.issue}:${read.round}:읽지 않은 댓글:${last}`;
}

/**
 * 결정이 없는데(대기) 「승인합니다」·「개선 요청: …」처럼 결정 낱말로 시작하는 댓글이 있는 요청. 사람은
 * 결정했다고 여기는데 러너는 할 일이 없어 조용히 넘어가므로, 한 번은 실패로 끝내 개발자에게 알린다.
 * 결정이 있는 쪽의 같은 경우는 D1 이 묻고 멈춘다.
 */
export function pickUnreadLookalikes(reads, done) {
  return reads.filter((read) => !ACTIONABLE.has(read.decision) && read.lookalikes?.length && !done[lookalikeKey(read)]);
}

/**
 * dev 로 합칠 pull request 가 바꿔도 되는 자리. 생성 화면의 폴더와 목록뿐이다. 모델이 `git commit -a` 로
 * 하네스 스크립트나 workflow 를 함께 올리면 러너가 스스로 합치고 다음 실행에서 그 코드로 돌게 되므로,
 * 이 밖을 건드린 pull request 는 합치지 않고 열어 둔 채 멈춘다. `(renewal)` 같은 route group 은 화면 자리가 아니다.
 */
/**
 * 그 pull request 가 더한 화면 key. `apps/sandbox/src/app/<key>/…` 의 `<key>` 다.
 *
 * 러너가 배포를 직접 확인하려면 무엇을 확인할지 알아야 하는데, 그것이 바뀐 파일에 그대로 있다.
 */
export function screenKeys(files) {
  const keys = files.map((file) => file.match(/^apps\/sandbox\/src\/app\/([^/()]+)\//)?.[1]).filter(Boolean);
  return [...new Set(keys)];
}

export function outsideScreenFiles(files) {
  return files.filter((file) => !/^apps\/sandbox\/src\/app\/[^/()]+\/[^/]+$/.test(file) && file !== "apps/sandbox/src/screens.ts");
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
  // 이름만 적으면 무엇이 막혔는지 알 수 없어 허용 목록을 고칠 수 없다. 명령의 앞머리를 함께 남긴다.
  if (json.permission_denials?.length) {
    const denied = json.permission_denials.map((d) => `${d.tool_name}(${String(d.tool_input?.command ?? "").replace(/\s+/g, " ").slice(0, 70)})`);
    log(`- 막힌 도구 ${denied.length}건: ${denied.join(" · ")}`);
  }
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

/**
 * 합친다. 명령이 실패하면 **정말 안 합쳐졌는지 다시 본다.**
 *
 * 이 Mac 의 연결이 오락가락해서 `gh pr merge` 가 GitHub 의 응답을 못 읽고 타임아웃하는 일이 있다. 합치기는
 * 이미 된 뒤인데 러너만 실패로 알고 멈춘다 — `2026-09-23` 에 #60 2회차가 그렇게 멈췄고, pull request #74 는
 * 멀쩡히 합쳐져 있었다. 결과 댓글만 없는 채로 끝나 기획자는 개선이 됐는지 알 수 없었다.
 */
function mergePr(pr, method) {
  try {
    sh("gh", ["pr", "merge", String(pr), ...method]);
  } catch (error) {
    const state = JSON.parse(sh("gh", ["pr", "view", String(pr), "--json", "state"])).state;
    if (state !== "MERGED") throw error;
    log(`- #${pr} 합치는 명령은 실패했지만 이미 합쳐져 있다(${error.message.split("\n")[0]}). 이어 간다`);
  }
}

/**
 * 배포가 끝나고 화면 주소가 열리는지 본다(7단계). 기다리는 일은 `deploy-check.mjs` 가 맡는다.
 *
 * 모델에게 맡겼더니 「알림이 올 것이므로 기다린다」(#60) · 「백그라운드로 넘어갔다」(#62) 하고 턴을 끝내
 * 결과 댓글이 올라가지 않았다. 기다림은 스크립트의 일이고 모델의 일이 아니다.
 */
function checkDeploy(sha, keys) {
  if (!keys.length) return null;
  // `sha` 가 없으면 지금 `dev` 배포에서 주소만 본다(「결과만 올리기」). 그 머지의 Deploy 실행은 찾지 않는다.
  const args = ["scripts/harness/deploy-check.mjs", ...(sha ? ["--sha", sha] : []), ...keys.flatMap((key) => ["--key", key])];
  try {
    const out = JSON.parse(sh("node", args));
    log(`- 배포 확인: ${out.ok ? `화면 ${keys.length}장 200` : `실패 — ${out.reason ?? "까닭 없음"}`}`);
    return out;
  } catch (error) {
    log(`- 배포를 확인하지 못했다: ${error.message.split("\n")[0]}`);
    return { ok: false, keys, reason: error.message.split("\n")[0] };
  }
}

/** 이슈를 닫는다. 에이전트는 `gh issue close` 를 못 쓰고(공용 권한 deny) 러너 스크립트만 이 자리에서 쓴다. */
function closeIssue(issue, body) {
  sh("gh", ["issue", "close", String(issue), "--comment", body]);
  log(`- #${issue} 를 닫았다`);
}

/**
 * 이 요청의 로컬 가지 가운데 origin 에 없는 것을 지운다. 앞 실행이 push 전에 멈추면 가지가 러너 작업 자리에
 * 남아, 다시 돌릴 때 3단계의 `git switch -c` 가 「이미 있다」로 멈춘다. push 하지 않은 것은 다시 만들면 되고,
 * push 한 것은 1단계의 「이미 처리한 요청」 검사가 본다.
 */
export function staleBranches(issue, local, remote) {
  const prefix = `feature/issue-${issue}-`;
  return local.filter((branch) => branch.startsWith(prefix) && !remote.includes(branch));
}

function dropStaleBranches(issue) {
  const local = sh("git", ["branch", "--format=%(refname:short)"]).split("\n").filter(Boolean);
  const remote = sh("git", ["ls-remote", "--heads", "origin"])
    .split("\n")
    .filter(Boolean)
    .map((line) => line.split("refs/heads/")[1]);
  for (const branch of staleBranches(issue, local, remote)) {
    sh("git", ["branch", "-D", branch]);
    log(`- 앞 실행이 push 하지 않고 남긴 가지 ${branch} 를 지웠다`);
  }
}

/** 이 요청의 가장 늦은 결과 댓글 id. 없으면 null 이다. */
function latestResultId(issue) {
  return JSON.parse(sh("node", ["scripts/harness/decision.mjs", String(issue)])).resultCommentId ?? null;
}

/**
 * 결과 댓글이 새로 올라갔는지 본다. 세션이 7·8단계에서 멈춰도 `claude -p` 는 성공으로 끝나므로, 보지 않으면
 * dev 에는 합쳐졌는데 결과가 없는 채 job 이 초록으로 끝나고 결정 확인도 「결과 없음」을 건너뛴다.
 */
function postedResult(issue, before) {
  const after = latestResultId(issue);
  if (after && after !== before) return true;
  log("- 결과 댓글이 새로 올라가지 않았다. 멈춘 자리는 위 보고에 있다. 올리려면 `결과 <n>`을 손으로 돌린다.");
  return false;
}

/** 멈춘 것을 결과 채널에 알린다. 카드가 실패해도 러너의 결과는 바뀌지 않는다. */
async function notifyStop(issue, report, options = {}) {
  const target = slackTarget();
  if (!target) return;
  let meta = {};
  try {
    const view = JSON.parse(sh("gh", ["issue", "view", String(issue), "--json", "title,url"]));
    meta = { title: view.title.replace(/^화면\s*요청\s*[:：]\s*/, ""), url: view.url };
  } catch {
    meta = {};
  }
  await postCard(stopNotice(issue, report, { ...meta, ...options }), target).then(
    () => log("- 멈춘 것을 결과 채널에 알렸다"),
    (error) => log(`- 결과 채널에 알리지 못했다: ${error.message}`),
  );
}


/** `screens.ts` 에 등록된 화면 key. 표식 없는 pull request 가 화면을 건드렸는지 볼 때 쓴다. */
function registeredKeys() {
  const text = readFileSync(path.join(repoRoot, "apps/sandbox/src/screens.ts"), "utf8");
  return [...text.matchAll(/key:\s*"([a-z0-9-]+)"/g)].map((hit) => hit[1]);
}

/** `main..dev` 에 든 squash commit 이 가리키는 pull request 들. 제목 끝의 `(#<번호>)` 가 번호다. */
function landedPrs() {
  const lines = sh("git", ["log", "--oneline", "origin/main..origin/dev"]).split("\n").filter(Boolean);
  const numbers = [...new Set(lines.map((line) => line.match(/\(#(\d+)\)\s*$/)?.[1]).filter(Boolean))];
  return numbers.map((number) => {
    const view = JSON.parse(sh("gh", ["pr", "view", number, "--json", "number,url,body,files"]));
    return { ...view, files: view.files.map((file) => file.path) };
  });
}

/** 이 요청의 화면이 이미 `main` 에 있는지. 회차마다 squash commit 이 하나씩 있다. */
function onMain(issue) {
  return screenCommits(sh("git", ["log", "--format=%H %s", "origin/main", "--grep", `(#${issue})`, "--fixed-strings"]).split("\n"), issue);
}

/** 결정을 읽는다. 섞임 검사가 남의 요청마다 이것을 부른다. */
const decisionOf = (issue) => JSON.parse(sh("node", ["scripts/harness/decision.mjs", String(issue)])).decision;

/**
 * 모델이 멈췄을 때, **그 보고를 그대로** 카드로 보낸다.
 *
 * `2026-09-24` 에 #60 의 개선이 「개선이 아니라 새 요구입니다 — 폼으로 새 요청을 내 주세요」라고 제대로
 * 적었는데, 러너가 그것을 버리고 「plan.json 이 없다」를 보냈다. 기획자는 무엇을 해야 할지 알 수 없었다.
 * 까닭을 아는 쪽이 모델이면 그 말을 옮긴다.
 */
async function stopWith(issue, report, fallback) {
  const has = /^## /m.test(String(report ?? ""));
  log(`\n${report ?? ""}\n`);
  await notifyStop(issue, has ? report : `## ${fallback}\n\n- 모델이 까닭을 남기지 않았다 — 개발자가 실행 기록을 봐야 한다`, { tail: "개발자가 봐야 합니다." });
  return false;
}

/** 이 요청에 이미 올라간 결과 댓글의 수. 다음 회차는 그 +1 이다. */
function resultRound(issue) {
  const read = JSON.parse(sh("node", ["scripts/harness/decision.mjs", String(issue)]));
  return (read.round ?? 0) + 1;
}

/** 이 요청의 화면이 이미 `dev` 에 올라간 적이 있는지. 있으면 다시 만들지 않는다. */
function alreadyLanded(issue) {
  const prs = JSON.parse(sh("gh", ["pr", "list", "--state", "all", "--base", "dev", "--search", `"요청: #${issue}" in:body`, "--json", "number,state,url,body"]));
  return prs.find((pr) => pr.state !== "CLOSED" && new RegExp(`요청: #${issue}(?!\\d)`).test(pr.body ?? "")) ?? null;
}

/**
 * 화면 요청 하나를 처음부터 끝까지 돌린다. **모델은 화면만 만들고 나머지는 이 함수가 한다**
 * (`2026-09-24` 역할 뒤집기 — plan.mjs 머리말).
 *
 * 모델이 멈출 수 있는 자리는 하나다: 화면을 만들고 `plan.json` 을 쓰는 것. 기다리는 일(Quality·배포),
 * 되풀이되는 일(가지·commit·push·pull request·머지), 꼴을 지켜야 하는 일(결과 댓글)은 모두 여기 있다.
 */
async function runRequest(issue) {
  log(`## 화면 요청 #${issue} 처리`);
  const stop = async (heading, lines) => {
    const report = [`## ${heading}`, "", ...lines.map((line) => `- ${line}`)].join("\n");
    log(`\n${report}\n`);
    await notifyStop(issue, report);
    return false;
  };

  // 1. 이슈를 읽는다. 물어야 할 것이 있으면 만들지 않는다.
  const read = JSON.parse(sh("node", ["scripts/harness/issue.mjs", String(issue)]));
  if (read.problems.length) return stop("묻고 멈춤", read.problems);
  if (!read.fields.requester) return stop("묻고 멈춤", ["요청자가 비어 있다 — 결과 댓글은 요청자 없이 만들어지지 않는다"]);

  // 2. 이미 만든 요청을 또 만들지 않는다. #9 처럼 화면만 있고 결과 댓글이 없는 것은 `결과 <n>` 의 자리다.
  const landed = alreadyLanded(issue);
  if (landed) return stop("이미 처리함", [`${landed.url} 가 이 요청의 화면을 이미 올렸다`, "결과 댓글이 없으면 `결과 <n>`, 있으면 `결정 <n>` 이다"]);

  const round = resultRound(issue);
  dropStaleBranches(issue);
  rmSync(path.join(repoRoot, ".harness-work", `issue-${issue}`), { recursive: true, force: true });

  // 3. 모델이 하는 유일한 일 — 화면을 만들고 무엇을 만들었는지 적는다.
  const made = runClaude(`/make-screens ${issue} 러너`);
  const file = path.join(repoRoot, planPath(issue));
  // 모델이 왜 멈췄는지는 그 보고에 있다. 「plan.json 이 없다」만 보내면 기획자는 무엇을 해야 할지 모른다.
  if (!existsSync(file)) return stopWith(issue, made.result, "화면을 만들지 못했다");
  const plan = JSON.parse(readFileSync(file, "utf8"));
  const problems = validatePlan(plan, { issue, mode: read.mode });
  if (problems.length) return stop("만든 것을 읽을 수 없다", problems);

  return landScreens(issue, read, round, plan, stop);
}

/**
 * 만든 화면을 `dev` 까지 올리고 결과 댓글을 단다. 처음 처리와 개선 회차가 같은 길을 쓴다.
 *
 * 여기부터 끝까지 모델은 없다. 기다리는 일과 꼴을 지키는 일만 남아서다.
 */
async function landScreens(issue, read, round, plan, stop) {
  // 화면 자리 밖을 고쳤으면 올리지 않는다. 모델이 하네스나 workflow 를 함께 바꾸면 다음 실행이 그 코드로 돈다.
  const changed = sh("git", ["status", "--porcelain", "--untracked-files=all"]).split("\n").filter(Boolean).map((line) => line.slice(3));
  if (!changed.length) return stop("바뀐 파일이 없다", ["화면을 만들었다고 적었지만 working tree 가 그대로다"]);
  const outside = outsideScreenFiles(changed);
  if (outside.length) return stop("화면 자리 밖을 고쳤다", outside);

  // 5. 여기서부터 끝까지 스크립트다.
  const branch = branchName(issue, round, plan.screens);
  sh("git", ["switch", "-c", branch]);
  sh("git", ["add", "apps/sandbox"]);
  sh("git", ["commit", "-q", "-m", `${title(issue, round, plan.screens, read.mode)}\n\nCo-authored-by: Claude ${MODEL} <noreply@anthropic.com>`]);
  sh("git", ["push", "-q", "-u", "origin", branch]);
  log(`- ${branch} 에 ${plan.screens.length}장을 commit·push 했다`);

  const bodyFile = path.join(repoRoot, ".harness-work", `issue-${issue}`, `pr-${round}.md`);
  mkdirSync(path.dirname(bodyFile), { recursive: true });
  writeFileSync(bodyFile, prBody({ issue, round, screens: plan.screens, needsDecision: plan.needsDecision ?? [], other: plan.other ?? [] }));
  const url = sh("gh", ["pr", "create", "--base", "dev", "--head", branch, "--title", title(issue, round, plan.screens, read.mode), "--body-file", bodyFile]).trim();
  const pr = Number(url.split("/").pop());
  log(`- pull request #${pr} ${url}`);

  const { headRefOid, files } = JSON.parse(sh("gh", ["pr", "view", String(pr), "--json", "headRefOid,files"]));
  const outsidePr = outsideScreenFiles(files.map((item) => item.path));
  if (outsidePr.length) return stop("pull request 가 화면 밖을 바꿨다", [...outsidePr, `${url} 를 열어 둔 채 멈춘다`]);
  await waitQuality(headRefOid);
  mergePr(pr, ["--squash", "--delete-branch"]);
  const { mergeCommit } = JSON.parse(sh("gh", ["pr", "view", String(pr), "--json", "mergeCommit"]));
  log(`- #${pr} 머지 ${mergeCommit.oid}`);

  const deploy = checkDeploy(mergeCommit.oid, plan.screens.map((screen) => screen.key));
  if (deploy && !deploy.ok) return stop("배포를 확인하지 못했다", [deploy.reason ?? "까닭 없음", `화면은 dev 에 있다(pull request #${pr})`]);

  // 6. 결과 댓글. 모델이 만들지 않으므로 주소와 이름이 어긋날 수 없다.
  const inputFile = path.join(repoRoot, ".harness-work", `issue-${issue}`, `result-${round}.json`);
  writeFileSync(inputFile, `${JSON.stringify(resultInput({ issue, read, round, screens: plan.screens, plan, pr: { number: pr, url }, deploy }), null, 2)}\n`);
  const before = latestResultId(issue);
  sh("node", ["scripts/harness/post-result.mjs", String(issue), path.relative(repoRoot, inputFile)], { stdio: ["ignore", "inherit", "inherit"] });
  if (!postedResult(issue, before)) return stop("결과 댓글이 올라가지 않았다", [`화면은 dev 에 있다(pull request #${pr})`, "개발자가 `결과 <n>` 명령을 돌려야 한다"]);
  log(`\n## 처리를 마쳤다 — 화면 ${plan.screens.length}장 · pull request #${pr} · ${round}회차`);
  return true;
}




/**
 * 결과 댓글만 올린다. 화면은 이미 `dev` 에 있는데 결과가 없는 요청의 자리다(#9 → PR #19, 또는 앞 실행이
 * 결과 직전에 멈춘 때).
 *
 * **모델을 부르지 않는다.** 필요한 것이 모두 이미 적혀 있어서다 — 화면은 pull request 가 바꾼 파일에,
 * 이름과 프로젝트는 `screens.ts` 에, 정한 것은 그 본문의 「판단이 필요한 것」에 있다. 고쳐 쓰지 않고 옮긴다.
 */
async function runResult(issue) {
  log(`## 화면 요청 #${issue} 결과 댓글`);
  const stop = async (heading, lines) => {
    const report = [`## ${heading}`, "", ...lines.map((line) => `- ${line}`)].join("\n");
    log(`\n${report}\n`);
    await notifyStop(issue, report, { tail: "개발자가 봐야 합니다." });
    return false;
  };
  const read = JSON.parse(sh("node", ["scripts/harness/issue.mjs", String(issue)]));
  if (!read.fields.requester) return stop("올릴 수 없다", ["요청자가 비어 있다"]);

  sh("git", ["fetch", "-q", "origin"]);
  const prs = JSON.parse(sh("gh", ["pr", "list", "--state", "merged", "--base", "dev", "--search", `"요청: #${issue}" in:body`, "--json", "number,url,body,files,mergedAt"]))
    .filter((pr) => isRequestOf(pr.body, issue))
    .sort((a, b) => a.mergedAt.localeCompare(b.mergedAt));
  if (!prs.length) return stop("올릴 것이 없다", ["이 요청의 화면이 dev 에 합쳐진 적이 없다 — `처리 <n>` 이 먼저다"]);

  const registered = readScreens(readFileSync(path.join(repoRoot, "apps/sandbox/src/screens.ts"), "utf8"));
  const keys = [...new Set(prs.flatMap((pr) => screenKeys(pr.files.map((file) => file.path))))];
  const screens = keys.map((key) => registered.find((screen) => screen.key === key)).filter(Boolean);
  if (!screens.length) return stop("화면을 찾지 못했다", [`pull request 가 더한 key 를 screens.ts 에서 찾지 못했다: ${keys.join(", ") || "없음"}`]);

  const last = prs[prs.length - 1];
  const round = resultRound(issue);
  const deploy = checkDeploy(null, keys);
  if (deploy && !deploy.ok) return stop("배포를 확인하지 못했다", [deploy.reason ?? "까닭 없음"]);

  const plan = { needsDecision: section(last.body, "판단이 필요한 것"), other: section(last.body, "그 밖에 한 일") };
  const inputFile = path.join(repoRoot, ".harness-work", `issue-${issue}`, `result-${round}.json`);
  mkdirSync(path.dirname(inputFile), { recursive: true });
  writeFileSync(inputFile, `${JSON.stringify(resultInput({ issue, read, round, screens, plan, pr: { number: last.number, url: last.url }, deploy }), null, 2)}\n`);
  const before = latestResultId(issue);
  sh("node", ["scripts/harness/post-result.mjs", String(issue), path.relative(repoRoot, inputFile)], { stdio: ["ignore", "inherit", "inherit"] });
  if (!postedResult(issue, before)) return stop("결과 댓글이 올라가지 않았다", ["post-result 의 줄을 보고 고친다"]);
  log(`\n## 결과 댓글을 올렸다 — 화면 ${screens.length}장 · ${round}회차`);
  return true;
}

/**
 * 개선 — 사유가 가리키는 화면만 다시 만든다. **모델이 필요한 유일한 결정이다.**
 *
 * 사유가 앞 회차의 어느 항목(판단이 필요한 것·지어낸 것·검수 결과)을 가리키는지, 그것이 개선인지 새
 * 요구인지는 글을 읽어야 안다. 그 판단만 모델에게 두고 나머지는 이 파일이 한다.
 */
async function improve(issue, read, stop) {
  const round = read.round + 1;
  dropStaleBranches(issue);
  rmSync(path.join(repoRoot, ".harness-work", `issue-${issue}`), { recursive: true, force: true });
  const made = runClaude(`/make-screens ${issue} 개선 러너`);
  const file = path.join(repoRoot, planPath(issue));
  if (!existsSync(file)) return stopWith(issue, made.result, "다시 만들지 못했다");
  const plan = JSON.parse(readFileSync(file, "utf8"));
  const problems = validatePlan(plan, { issue, mode: read.mode });
  if (problems.length) return stop("다시 만든 것을 읽을 수 없다", problems);
  if (!plan.screens.some((screen) => screen.remade !== false)) return stop("다시 만든 화면이 없다", ["개선인데 고친 화면이 하나도 없다고 적었다"]);
  return landScreens(issue, { ...read, mode: read.mode ?? "생성" }, round, plan, stop);
}

/**
 * 승인 — `dev` 를 `main` 으로 올린다. **판단이 없어 모두 스크립트가 한다**(decide.mjs 머리말).
 *
 * `main` 은 승인된 요청만 담으므로, 같은 머지에 실려 갈 pull request 가 모두 승인되었는지 먼저 본다.
 */
async function approve(issue, read, stop) {
  sh("git", ["fetch", "-q", "origin"]);
  const prs = landedPrs();
  const mine = prs.filter((pr) => isRequestOf(pr.body, issue));
  if (!mine.length) {
    // `dev` 에 없으면 이미 `main` 에 있는지 본다. 개발자가 dev → main 을 한꺼번에 올린 뒤 승인이 난 경우다(#48).
    const commits = onMain(issue);
    if (!commits.length) return stop("올릴 것이 없다", [`이 요청의 화면이 dev 에도 main 에도 없다`, "아직 만들지 않았으면 `처리 <n>` 이다"]);
    closeIssue(issue, closingComment("승인", `화면 commit ${commits.map((sha) => sha.slice(0, 7)).join(", ")} 이 이미 main 에 있음`));
    log(`- 이미 main 에 있어 pull request 없이 닫았다`);
    return true;
  }

  const { landed, mixed } = sortLanded(prs, decisionOf, registeredKeys());
  if (mixed.length) return stop("승인 아닌 것이 섞였다", ["main 은 승인된 요청만 담는다. 아래를 푼 뒤 다시 승인한다", ...howToUnmix(mixed)]);

  const open = JSON.parse(sh("gh", ["pr", "list", "--base", "main", "--head", "dev", "--state", "open", "--json", "number,url"]));
  if (open.length) return stop("이미 열린 dev → main 이 있다", [`${open[0].url} 에 이 승인을 더해 사람이 합친다`]);

  const { title: prTitle, body } = mainPr({ issue, read, screenName: readScreenName(issue), landed });
  const bodyFile = path.join(repoRoot, ".harness-work", `issue-${issue}`, "main-pr.md");
  mkdirSync(path.dirname(bodyFile), { recursive: true });
  writeFileSync(bodyFile, body);
  const url = sh("gh", ["pr", "create", "--base", "main", "--head", "dev", "--title", prTitle, "--body-file", bodyFile]).trim();
  const pr = Number(url.split("/").pop());
  log(`- pull request #${pr} (dev → main) ${url}`);
  const { headRefOid } = JSON.parse(sh("gh", ["pr", "view", String(pr), "--json", "headRefOid"]));
  await waitQuality(headRefOid);
  mergePr(pr, ["--merge"]);
  closeIssue(issue, closingComment("승인", `PR #${pr}`));
  log(`\n## 승인을 마쳤다 — main 에 반영하고 닫았다 (pull request #${pr})`);
  return true;
}

/** 반려 — 이 요청의 화면을 `dev` 에서 되돌린다. 두면 어떤 승인도 `main` 으로 올라가지 못한다. */
async function reject(issue, read, stop) {
  sh("git", ["fetch", "-q", "origin"]);
  // 이미 되돌렸으면 두 번 하지 않는다.
  const reverted = JSON.parse(sh("gh", ["pr", "list", "--state", "merged", "--base", "dev", "--search", `"되돌림: #${issue}" in:body`, "--json", "number,url,body"]))
    .filter((pr) => isRevertOf(pr.body, issue));
  if (reverted.length) {
    closeIssue(issue, closingComment("반려", `되돌림 PR #${reverted[reverted.length - 1].number}`));
    log(`- 이미 되돌려져 있어 닫기만 했다`);
    return true;
  }

  // 이 요청이 더한 화면 key. 걷어낼 자리를 여기서 정한다.
  const prs = JSON.parse(sh("gh", ["pr", "list", "--state", "merged", "--base", "dev", "--search", `"요청: #${issue}" in:body`, "--json", "number,body,files"]))
    .filter((pr) => isRequestOf(pr.body, issue));
  const keys = [...new Set(prs.flatMap((pr) => screenKeys(pr.files.map((file) => file.path))))];
  if (!keys.length) return stop("되돌릴 것이 없다", ["이 요청이 더한 화면을 찾지 못했다 — 아직 만들지 않았거나 이미 걷어냈다"]);
  const commits = screenCommits(sh("git", ["log", "--format=%H %s", "origin/dev", "--grep", `(#${issue})`, "--fixed-strings"]).split("\n"), issue);
  // 화면이 이미 main 에도 있으면 걷어냄은 dev 에만 들어간다. 다음 dev → main 에 함께 올라간다.
  const alsoOnMain = onMain(issue).length > 0;

  dropStaleBranches(issue);
  const local = sh("git", ["branch", "--format=%(refname:short)"]).split("\n").filter(Boolean);
  const remote = sh("git", ["ls-remote", "--heads", "origin"]).split("\n").filter(Boolean).map((line) => line.split("refs/heads/")[1]);
  const branch = freeBranch(`feature/issue-${issue}-revert`, [...local, ...remote]);
  sh("git", ["switch", "-c", branch]);

  // **`git revert` 를 쓰지 않는다**(plan.mjs `removeScreens` 머리말). 화면 자리와 등록 줄만 지운다.
  const screensFile = path.join(repoRoot, "apps/sandbox/src/screens.ts");
  const { text, removed } = removeScreens(readFileSync(screensFile, "utf8"), keys);
  if (removed.length !== keys.length) {
    return stop("걷어낼 화면을 찾지 못했다", [`screens.ts 에 없는 key: ${keys.filter((key) => !removed.includes(key)).join(", ")}`]);
  }
  writeFileSync(screensFile, text);
  for (const key of keys) rmSync(path.join(repoRoot, "apps/sandbox/src/app", key), { recursive: true, force: true });
  sh("git", ["add", "apps/sandbox"]);
  sh("git", ["commit", "-q", "-m", `revert(sandbox): 화면 요청 #${issue} 반려 — 화면 ${keys.length}장을 걷어낸다 (#${issue})`]);
  sh("git", ["push", "-q", "-u", "origin", branch]);
  const { title: prTitle, body } = revertPr({ issue, read, screenName: readScreenName(issue), commits, alsoOnMain, keys });
  const bodyFile = path.join(repoRoot, ".harness-work", `issue-${issue}`, "revert.md");
  mkdirSync(path.dirname(bodyFile), { recursive: true });
  writeFileSync(bodyFile, body);
  const url = sh("gh", ["pr", "create", "--base", "dev", "--head", branch, "--title", prTitle, "--body-file", bodyFile]).trim();
  const pr = Number(url.split("/").pop());
  log(`- 되돌림 pull request #${pr} ${url}`);
  const { headRefOid } = JSON.parse(sh("gh", ["pr", "view", String(pr), "--json", "headRefOid"]));
  await waitQuality(headRefOid);
  mergePr(pr, ["--squash", "--delete-branch"]);
  closeIssue(issue, closingComment("반려", `되돌림 PR #${pr}`));
  log(`\n## 반려를 마쳤다 — 화면 ${commits.length}건을 dev 에서 되돌리고 닫았다`);
  return true;
}

/** 이슈 제목에서 화면 이름을 읽는다. `화면 요청: <이름>` 꼴이다. */
function readScreenName(issue) {
  return JSON.parse(sh("node", ["scripts/harness/issue.mjs", String(issue)])).screenName;
}

/**
 * 결정 하나를 처리한다. 승인·반려는 이 파일이 끝까지 하고, 개선만 모델을 부른다 — 사유가 앞 회차의
 * 어느 항목을 가리키는지는 판단이기 때문이다(decide.mjs 머리말).
 */
async function runDecision(issue, read) {
  const stop = async (heading, lines) => {
    const report = [`## ${heading}`, "", ...lines.map((line) => `- ${line}`)].join("\n");
    log(`\n${report}\n`);
    await notifyStop(issue, report, { tail: "개발자가 봐야 합니다." });
    return false;
  };
  if (read.lookalikeAfterDecision) {
    return stop("결정을 가릴 수 없다", [
      "결정 뒤에 결정처럼 보이는 댓글이 더 있다 — 마지막 뜻이 무엇인지 알 수 없다",
      ...read.lookalikes.map((item) => `${item.url ?? item.at} 「${item.text}」`),
      "카드의 버튼으로 다시 남겨 주세요",
    ]);
  }
  if (read.decision === "승인") return approve(issue, read, stop);
  if (read.decision === "반려") return reject(issue, read, stop);
  if (read.decision === "개선") {
    const blocked = improveBlocked(read);
    if (blocked) return stop("개선을 시작할 수 없다", [blocked]);
    return improve(issue, read, stop);
  }
  return stop("처리할 결정이 아니다", [`decision 이 ${read.decision} 다`]);
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
  for (const read of pickUnreadLookalikes(reads, done)) {
    done[lookalikeKey(read)] = { notedAt: new Date().toISOString() };
    log(`\n## #${read.issue} 결정처럼 보이지만 읽지 않은 댓글 — ${read.decision}`);
    for (const item of read.lookalikes) log(`- ${item.url ?? item.at} 「${item.text}」`);
    log("- 기획자에게 👍 👎 😕 반응이나 「승인」·「반려: …」·「개선: …」 꼴로 다시 남겨 달라고 알린다.");
    ok = false;
  }
  if (!ok) {
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, `${JSON.stringify(done, null, 2)}\n`);
  }
  for (const read of todo) {
    // 처리하기 전에 적는다. 멈추거나 실패한 결정을 감시가 돌 때마다 다시 돌리지 않으려는 것이다. 다시 돌리려면 사람이 새 신호를 남긴다.
    done[decisionKey(read)] = { startedAt: new Date().toISOString() };
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, `${JSON.stringify(done, null, 2)}\n`);
    log(`\n## #${read.issue} ${read.round}회차 ${read.decision} (${read.by} · ${read.at})`);
    if (!(await runDecision(read.issue, read))) ok = false;
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
  if (mode === "결과") return (await runResult(Number(issue))) ? 0 : 1;
  return (await runRequest(Number(issue))) ? 0 : 1;
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
