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
 * `/process-issue` 가 Skill 로 부르는 하위 명령. 하위 명령 머리말의 allowed-tools 는 바깥 명령 안에서 불릴 때
 * 적용되지 않는다 — #29 에서 하위 명령이 머리말에 적어 둔 명령이 그대로 거부됐다. 그래서 러너가 그 머리말을
 * 읽어 CLI 로 넘긴다. 원본은 여전히 각 SKILL.md 다.
 */
export const CHAINED_SKILLS = [
  "plugins/ooee-harness/skills/generate-code/SKILL.md",
  "plugins/ooee-harness/skills/review-design/SKILL.md",
];

/**
 * `/process-issue` 자신. 이어 받는 차례(7단계 배포 확인 · 8단계 결과 댓글)는 명령 밖에서 돌아 이 머리말도
 * 적용되지 않는다. 넘기지 않으면 `gh run view`·`curl` 이 거부되어, 이미 dev 에 합친 뒤 결과 댓글 없이 멈춘다.
 */
export const OWN_SKILL = ".claude/skills/process-issue/SKILL.md";

/** 러너가 CLI 로 넘기는 머리말 allowed-tools. 이 명령과 하위 명령의 것을 겹치지 않게 모은다. */
export function chainedAllowedTools(root = repoRoot) {
  const tools = [OWN_SKILL, ...CHAINED_SKILLS].flatMap((file) => {
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
  args.push("--plugin-dir", "plugins/ooee-harness");
  if (resume) args.push("-r", resume);
  args.push("--allowedTools", ...EXTRA_ALLOWED, ...chainedAllowedTools());
  return args;
}

/** 합친 뒤 세션을 이어 받게 하는 말. 스킬의 「러너에서 돌 때」가 이 꼴을 기다린다. */
export function continuationPrompt(pr, mergeCommit, deploy = null) {
  const head = `러너: pull request #${pr} 가 dev 에 squash 로 머지되었다(머지 commit ${mergeCommit}).`;
  // 7단계는 러너가 이미 했다. 모델에게 「기다리라」고 시키면 기다리는 도구를 부르거나 배경으로 돌리고 턴을
  // 끝낸다 — #60·#62 가 잇달아 그렇게 결과 댓글 없이 끝났다. 확인은 스크립트가 하고 결과만 넘긴다.
  if (!deploy) return `${head} 「러너에서 돌 때」대로 7단계부터 이어 간다.`;
  return `${head}\n\n러너가 7단계(배포 확인)를 이미 마쳤다. 결과는 아래 JSON 이다. 배포를 다시 확인하지 말고, 이것을 8단계 \`checks\` 의 「배포 주소 <N>장 200」 근거로 삼아 8단계(결과 댓글)부터 이어 간다.\n\n\`\`\`json\n${JSON.stringify(deploy)}\n\`\`\``;
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
  // pull request 를 만들지 않는 넘김(already)에는 제목이 없다.
  if (handoff.already !== true && (typeof handoff.title !== "string" || !handoff.title.trim())) problems.push("title 이 없다");
  // 이미 main 에 있는 요청의 승인: pull request 를 만들지 않고 이슈만 닫는다. 화면 commit 이 무엇인지는 모델이
  // 적어 주지만 그대로 믿지 않는다 — 러너가 origin/main 의 조상인지 다시 본다(landHandoff).
  if (handoff.already === true) {
    if (handoff.target !== "main") problems.push("already 는 main 넘김에서만 쓴다");
    if (!Array.isArray(handoff.commits) || !handoff.commits.length || !handoff.commits.every((sha) => /^[0-9a-f]{7,40}$/.test(sha))) {
      problems.push("already 넘김에는 이 요청의 화면 commit(commits) 이 하나 이상 있어야 한다");
    }
    return problems;
  }
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
export function stopNotice(issue, report, { title = "", url = "", tail = "요청을 고쳐 다시 내거나 개발자에게 알려 주세요." } = {}) {
  const lines = String(report ?? "").split("\n");
  const at = lines.findIndex((line) => /^## /.test(line));
  const heading = at >= 0 ? lines[at].replace(/^## /, "") : "처리가 멈췄다";
  // 그 제목의 절만 읽는다. 다음 제목까지 넘어가면 「거친 자리」의 통과한 단계가 까닭 자리에 실린다
  // (`2026-09-23` #62 카드: 멈춘 까닭 대신 `git switch dev — 통과` 넉 줄이 갔다).
  const section = at >= 0 ? lines.slice(at + 1) : lines;
  const end = section.findIndex((line) => /^## /.test(line));
  const rest = (end < 0 ? section : section.slice(0, end)).map((line) => line.trim()).filter(Boolean);
  const problems = rest.filter((line) => /^[-*] |^\d+\. /.test(line)).slice(0, 4);
  const detail = (problems.length ? problems : rest.slice(0, 3)).map((line) => line.replace(/^[-*] /, "· ")).join("\n");
  const head = `⚠️ 화면 요청 #${issue}${title ? ` 「${title}」` : ""} — ${heading}`;
  const where = url ? `\n자세히: ${url}` : "";
  return `${head}\n${detail}\n\n${tail}${where}`;
}

/**
 * 화면은 `dev` 에 합쳐졌는데 결과 댓글이 없을 때 결과 채널에 올릴 글.
 *
 * 기획자가 보기에 결과가 없는 것과 같으므로 무엇이 됐고 무엇이 안 됐는지 가른다. 화면은 이미 배포돼 있어
 * 주소로 볼 수 있고, 빠진 것은 결과 댓글과 그에 딸린 결정 버튼이다.
 */
export function resultMissing(issue, pr) {
  return [
    "## 화면은 만들었는데 결과가 올라가지 않았다",
    `- 화면은 dev 에 합쳐졌습니다(pull request #${pr}).`,
    "- 배포 확인이나 결과 댓글에서 멈춰 결정 버튼이 없습니다.",
    // 조사는 번호 읽기에 따라 갈리므로(60 은 「을」, 62 는 「를」) 「명령을」로 적어 어느 번호에나 맞춘다.
    `- 개발자가 \`결과 ${issue}\` 명령을 돌리면 결과가 올라갑니다.`,
  ].join("\n");
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

/** 넘김 파일대로 pull request 를 만들고 Quality 를 본 뒤 합친다. 머지 commit 을 돌려준다. */
async function landHandoff(issue) {
  const file = handoffPath(issue);
  if (!existsSync(file)) return null;
  const handoff = JSON.parse(readFileSync(file, "utf8"));
  const problems = validateHandoff(handoff, issue);
  if (problems.length) throw new Error(`넘김 파일을 따르지 않는다: ${problems.join(" · ")}`);

  if (handoff.already) {
    sh("git", ["fetch", "origin", "main"]);
    for (const sha of handoff.commits) {
      try {
        sh("git", ["merge-base", "--is-ancestor", sha, "origin/main"]);
      } catch {
        throw new Error(`${sha} 는 origin/main 에 없다 — 이미 main 에 있다는 넘김을 따르지 않는다`);
      }
    }
    closeIssue(issue, closingComment("승인", `화면 commit ${handoff.commits.map((sha) => sha.slice(0, 7)).join(", ")} 이 이미 main 에 있음`));
    return { handoff, pr: null, mergeCommit: null };
  }

  const head = handoff.target === "dev" ? handoff.branch : "dev";
  const url = sh("gh", ["pr", "create", "--base", handoff.target, "--head", head, "--title", handoff.title, "--body-file", handoff.bodyFile]).trim();
  const pr = Number(url.split("/").pop());
  log(`- pull request #${pr} (${head} → ${handoff.target}) ${url}`);

  const { headRefOid, files } = JSON.parse(sh("gh", ["pr", "view", String(pr), "--json", "headRefOid,files"]));
  if (handoff.target === "dev") {
    const outside = outsideScreenFiles(files.map((file) => file.path));
    if (outside.length) throw new Error(`#${pr} 가 화면 밖을 바꿨다(${outside.join(", ")}). 합치지 않고 열어 둔다`);
  }
  await waitQuality(headRefOid);
  const method = handoff.target === "dev" ? ["--squash", "--delete-branch"] : ["--merge"];
  mergePr(pr, method);
  const { mergeCommit } = JSON.parse(sh("gh", ["pr", "view", String(pr), "--json", "mergeCommit"]));
  log(`- #${pr} 머지 ${mergeCommit.oid}`);
  const deploy = handoff.target === "dev" && handoff.resume ? checkDeploy(mergeCommit.oid, screenKeys(files.map((file) => file.path))) : null;
  // 결정이 끝까지 간 자리에서 이슈를 닫는다(2026-09-23 개발자). 승인은 main 에 반영된 때, 반려는 되돌림이
  // dev 에 합쳐진 때다. 개선 회차와 첫 회차의 dev 머지는 아직 결정을 기다리므로 닫지 않는다.
  const firstLine = readFileSync(path.resolve(repoRoot, handoff.bodyFile), "utf8").split("\n")[0].trim();
  if (handoff.target === "main") closeIssue(issue, closingComment("승인", `PR #${pr}`));
  else if (firstLine.startsWith("되돌림:")) closeIssue(issue, closingComment("반려", `되돌림 PR #${pr}`));
  return { handoff, pr, mergeCommit: mergeCommit.oid, deploy };
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
  const args = ["scripts/harness/deploy-check.mjs", "--sha", sha, ...keys.flatMap((key) => ["--key", key])];
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

/** 한 번의 `/process-issue` 호출과, 넘김이 있으면 합치기·이어 받기까지. */
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

async function runChain(issue, argument) {
  rmSync(handoffPath(issue), { force: true });
  dropStaleBranches(issue);
  const before = latestResultId(issue);
  const first = runClaude(`/process-issue ${argument} 러너`);
  const landed = await landHandoff(issue);
  if (!landed) {
    log("- 넘김 파일이 없다. 처리가 멈춘 자리는 위 보고에 있다.");
    await notifyStop(issue, first.result);
    return false;
  }
  if (!landed.handoff.resume) return true;
  runClaude(continuationPrompt(landed.pr, landed.mergeCommit, landed.deploy), { resume: first.session_id });
  if (postedResult(issue, before)) return true;
  // 화면은 합쳐졌는데 결과만 빠진 자리다. 넘김이 없을 때와 달리 여기는 알림 밖이었다 — #60 에서 이어 받은
  // 세션이 배포 확인을 부르지 않고 「알림이 올 것」이라며 끝냈고, 기획자에게는 아무 일도 없던 것이 됐다.
  await notifyStop(issue, resultMissing(issue, landed.pr), { tail: "개발자가 결과를 다시 올려야 합니다." });
  return false;
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
    const before = latestResultId(issue);
    runClaude(`/process-issue 결과 ${issue} 러너`);
    return postedResult(issue, before) ? 0 : 1;
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
