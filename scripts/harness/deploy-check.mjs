// 머지한 것이 실제로 배포되어 화면 주소가 열리는지 본다. `runner.mjs` 의 `checkDeploy` 가 머지 뒤에 부른다.
//
//   node scripts/harness/deploy-check.mjs --sha <머지 commit> --key shop-cart --key voc
//   node scripts/harness/deploy-check.mjs --key shop-cart        # 지금 dev 배포에서 주소만 본다(「결과만 올리기」)
//
// 기다리는 일은 스크립트의 몫이다 — 모델에게 맡겼을 때 #37 은 기다리는 명령이 허용 목록에 막혔고 #60·#62 는
// 턴을 끝내 결과가 올라가지 않았다.
//
// 판정은 주소다. 저장소 secret 이 없으면 deploy workflow 가 경고만 남기고 배포를 건너뛴 채 success 로
// 끝나므로, 실행이 성공한 것만으로 배포되었다고 하지 않는다(ai-environment.md 「처리와 승인」).
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

import { sandboxUrl } from "./plan.mjs";

const RUN_APPEAR_MS = 10 * 60 * 1000;
const RUN_DONE_MS = 20 * 60 * 1000;
const URL_OK_MS = 5 * 60 * 1000;
const POLL_MS = 15 * 1000;

/** 이 머지 commit 의 배포 실행. 같은 sha 로 여러 번 돌았으면 가장 늦은 것이다. */
export function pickRun(runs, sha) {
  const mine = (runs ?? []).filter((run) => run.headSha === sha);
  return mine.length ? mine[0] : null;
}

/**
 * 내 실행이 취소됐을 때 대신 볼 실행. `deploy.yml` 은 `cancel-in-progress` 라, 확인하는 사이 다른 dev push 가
 * 오면 내 sha 의 실행이 취소되고 그 push 의 실행이 내 화면까지 함께 올린다. 그 뒤의 실행 가운데 취소되지
 * 않은 가장 늦은 것을 고른다. 목록은 늦은 것부터다.
 */
export function pickReplacement(runs, mine) {
  const list = runs ?? [];
  const at = list.findIndex((run) => run.id === mine.id);
  const later = at < 0 ? list : list.slice(0, at);
  return later.find((run) => run.conclusion !== "cancelled") ?? null;
}

/** 화면마다의 응답 코드를 읽고 한 줄 판정을 만든다. */
export function summarize({ run, screens }) {
  const notOk = screens.filter((screen) => screen.status !== 200);
  const runBad = run && run.conclusion !== "success";
  return {
    ok: !notOk.length && !runBad,
    reason: runBad
      ? `배포 실행이 ${run.conclusion} 로 끝났다(run ${run.id})`
      : notOk.length
        ? `주소가 200 이 아니다: ${notOk.map((screen) => `${screen.key} ${screen.status}`).join(", ")}`
        : null,
  };
}

export function parseArgs(argv) {
  const opts = { keys: [], sha: null };
  for (let i = 0; i < argv.length; i += 1) {
    const [key, value] = [argv[i], argv[i + 1]];
    if (key === "--key" && value) opts.keys.push(value), (i += 1);
    else if (key === "--sha" && value) (opts.sha = value), (i += 1);
    else return { ...opts, error: `모르는 인수: ${key}` };
  }
  if (!opts.keys.length) return { ...opts, error: "--key 를 하나 이상 준다" };
  return opts;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const gh = (args) => JSON.parse(execFileSync("gh", args, { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 }));

/** 이 머지 commit 의 deploy 실행이 나타나 끝날 때까지 기다린다. */
async function waitDeploy(sha) {
  const appearBy = Date.now() + RUN_APPEAR_MS;
  let run = null;
  while (!run && Date.now() < appearBy) {
    run = pickRun(gh(["run", "list", "--workflow", "deploy.yml", "--branch", "dev", "--limit", "20", "--json", "databaseId,headSha,status,conclusion"]).map((item) => ({ ...item, id: item.databaseId })), sha);
    if (!run) await sleep(POLL_MS);
  }
  if (!run) throw new Error(`머지 commit ${sha} 의 Deploy 실행이 생기지 않았다`);
  const doneBy = Date.now() + RUN_DONE_MS;
  while (run.status !== "completed" && Date.now() < doneBy) {
    await sleep(POLL_MS);
    const now = gh(["run", "view", String(run.id), "--json", "status,conclusion"]);
    run = { ...run, ...now };
  }
  if (run.status !== "completed") throw new Error(`Deploy 실행 ${run.id} 이 끝나지 않는다`);
  if (run.conclusion === "cancelled") {
    // 다른 dev push 가 내 실행을 밀어냈다. 그 push 의 실행이 내 화면도 올리므로 그것을 기다린다.
    const runs = gh(["run", "list", "--workflow", "deploy.yml", "--branch", "dev", "--limit", "20", "--json", "databaseId,headSha,status,conclusion"]).map((item) => ({ ...item, id: item.databaseId }));
    const next = pickReplacement(runs, run);
    if (next) return waitDeploy(next.headSha);
  }
  return { id: run.id, status: run.status, conclusion: run.conclusion };
}

/** 주소가 200 을 돌려줄 때까지 잠깐 기다린다. 배포 직후에는 404 가 몇 번 나온다. */
async function waitUrls(keys) {
  const okBy = Date.now() + URL_OK_MS;
  const status = new Map(keys.map((key) => [key, 0]));
  while (Date.now() < okBy) {
    for (const key of keys) {
      if (status.get(key) === 200) continue;
      try {
        const response = await fetch(sandboxUrl(key), { redirect: "follow", cache: "no-store" });
        status.set(key, response.status);
      } catch {
        status.set(key, 0);
      }
    }
    if ([...status.values()].every((code) => code === 200)) break;
    await sleep(POLL_MS);
  }
  return keys.map((key) => ({ key, url: sandboxUrl(key), status: status.get(key) }));
}

async function main(argv) {
  const opts = parseArgs(argv);
  if (opts.error) {
    process.stderr.write(`${opts.error}\n사용법: node scripts/harness/deploy-check.mjs [--sha <머지 commit>] --key <화면 key> …\n`);
    return 2;
  }
  const run = opts.sha ? await waitDeploy(opts.sha) : null;
  const screens = await waitUrls(opts.keys);
  const report = { sha: opts.sha, run, screens, ...summarize({ run, screens }) };
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  return report.ok ? 0 : 1;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main(process.argv.slice(2)).then(
    (code) => process.exit(code),
    (error) => {
      process.stderr.write(`배포를 확인하지 못했다: ${error.message}\n`);
      process.exit(1);
    },
  );
}
