// 러너를 이 Mac 에서 직접 돌린다. GitHub Actions job 을 거치지 않는다.
//
//   node scripts/harness/local-run.mjs 처리 60      # 이슈 하나를 처리한다
//   node scripts/harness/local-run.mjs 결정 [60]    # 결정을 읽어 처리한다
//   node scripts/harness/local-run.mjs 결과 9       # 결과 댓글만 올린다
//
// **왜 job 밖에서 도는가.** self-hosted runner 는 job 이 도는 동안 GitHub 에 1분마다 「아직 돈다」고 알려야
// 한다. `2026-09-23` 에 이 Mac 의 연결이 15~25분마다 끊겨 그 갱신이 실패했고, GitHub 가 job 을 버리면
// 러너가 다시 붙는 순간 claude 를 강제로 끝냈다 — #60 이 네 번 연속 그렇게 죽었다. 처리 자체는 이 Mac 의
// 것이라 GitHub 가 잊어도 이어질 수 있다. 결과는 이슈 댓글과 Slack 카드로 가므로 job 요약이 없어도 된다.
//
// 돌 자리는 launchd 가 읽을 수 있는 사본 `~/.ooee-harness/harness`(`HARNESS_WORK_DIR`)다. 개발자의 clone
// 이 아니다 — 돌기 전에 `origin/dev` 로 맞추고 남은 파일을 지우므로, 사람이 일하는 tree 에서 돌리면 안 된다.
// 기록은 `~/.ooee-harness/runs/<시각>-<모드>-<이슈>.log` 에 남는다. 1분 감시(watch-decisions.mjs)가 새
// 요청과 결정을 보고 이것을 부르고, 사람은 다시 돌릴 때 손으로 부른다.

import { spawnSync } from "node:child_process";
import { closeSync, existsSync, mkdirSync, openSync, writeSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

export const MODES = new Set(["처리", "결정", "결과"]);

/** 화면 여러 장을 만드는 요청은 오래 걸린다. harness.yml 의 timeout 과 같은 4시간이다. */
export const RUN_TIMEOUT_MS = 4 * 60 * 60 * 1000;

/** 상태·기록을 두는 폴더. 러너의 `decisions.json` 과 같은 자리다. */
export function stateDir(env = process.env) {
  return env.HARNESS_STATE_DIR || path.join(os.homedir(), ".ooee-harness");
}

/** 러너가 돌 사본. launchd 가 `~/Desktop` 을 읽지 못해(TCC) 보호 밖에 둔 clone 이다. */
export function workDir(env = process.env) {
  return env.HARNESS_WORK_DIR || path.join(stateDir(env), "harness");
}

/** 한 번 돈 기록 파일. 시각이 앞에 있어 이름순이 시간순이다. */
export function runLogFile(mode, issue, { env = process.env, now = new Date() } = {}) {
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
  return path.join(stateDir(env), "runs", `${stamp}-${mode}-${issue ?? "전부"}.log`);
}

/** 러너를 부르는 인수. 모드는 러너의 셋뿐이다. */
export function runnerArgs(mode, issue) {
  if (!MODES.has(mode)) throw new Error(`모르는 모드: ${mode} — 처리·결정·결과 가운데 하나다`);
  if (issue !== undefined && issue !== null && !/^\d+$/.test(String(issue))) throw new Error(`이슈 번호가 아니다: ${issue}`);
  const args = ["scripts/harness/runner.mjs", mode];
  if (issue !== undefined && issue !== null) args.push(String(issue));
  return args;
}

/**
 * 돌기 전에 사본을 맞춘다. actions/checkout 이 하던 일이다 — 가지는 `dev` 로, 고친 것과 남은 파일은 지우고,
 * 의존성을 맞춘다. 앞 실행이 만든 `feature/issue-*` 가지에 서 있어도 `-B` 가 `dev` 로 돌려세운다.
 *
 * **`reset --hard` 가 있어야 하는 까닭.** 앞 실행이 화면을 쓰다 멈추면 고친 파일이 사본에 남는다. 그러면
 * 다음 실행의 0단계가 「남의 변경이 섞였다」로 보고 시작조차 하지 않는다 — `2026-09-24` 에 #75 가 15초 만에
 * 그렇게 멈췄다. `clean` 은 새로 생긴 파일만 지우고 고친 파일은 그대로 둔다. 이 사본은 사람이 일하는
 * 자리가 아니라 실행마다 새로 맞추는 자리이므로, 남은 것은 버리는 것이 맞다.
 */
export const PREPARE = [
  ["git", ["fetch", "-q", "origin", "dev"]],
  ["git", ["checkout", "-q", "-B", "dev", "origin/dev"]],
  ["git", ["reset", "-q", "--hard", "origin/dev"]],
  ["git", ["clean", "-qfd"]],
  ["pnpm", ["install", "--frozen-lockfile"]],
];

/**
 * 러너 한 번. 사본을 맞추고 `runner.mjs <모드> [<이슈>]` 를 돌려 exit 코드와 기록 파일을 돌려준다.
 * 끝날 때까지 기다린다 — 감시가 이것을 부르면 그동안 다음 감시는 시작되지 않는다(launchd 는 같은 job 을
 * 겹쳐 띄우지 않는다). 그래서 한 working tree 에 한 요청이다.
 */
export function runLocal(mode, issue, { env = process.env, now = new Date() } = {}) {
  const dir = workDir(env);
  if (!existsSync(path.join(dir, ".git"))) {
    throw new Error(`작업 사본이 없다: ${dir} — scripts/harness/README.md 「launchd」대로 clone 한다`);
  }
  const file = runLogFile(mode, issue, { env, now });
  mkdirSync(path.dirname(file), { recursive: true });
  const fd = openSync(file, "a");
  const say = (line) => writeSync(fd, `${new Date().toISOString()} ${line}\n`);
  try {
    say(`## ${mode}${issue ? ` #${issue}` : ""} — ${dir}`);
    for (const [cmd, args] of PREPARE) {
      const step = spawnSync(cmd, args, { cwd: dir, stdio: ["ignore", fd, fd], env });
      if (step.status !== 0) {
        say(`작업 사본을 준비하지 못했다: ${cmd} ${args.join(" ")} → ${step.status ?? step.signal ?? step.error?.message}`);
        return { exit: step.status ?? 1, log: file };
      }
    }
    const run = spawnSync("node", runnerArgs(mode, issue), { cwd: dir, stdio: ["ignore", fd, fd], env, timeout: RUN_TIMEOUT_MS, killSignal: "SIGTERM" });
    const exit = run.status ?? 1;
    if (run.error?.code === "ETIMEDOUT") say(`러너가 ${RUN_TIMEOUT_MS / 3600000}시간을 넘겨 끝냈다`);
    else if (run.signal) say(`러너가 ${run.signal} 로 끝났다`);
    else say(`러너 끝 — exit ${exit}`);
    return { exit, log: file };
  } finally {
    closeSync(fd);
  }
}

function main(argv) {
  const [mode, issue] = argv;
  try {
    runnerArgs(mode, issue);
  } catch (error) {
    process.stderr.write(`${error.message}\n사용법: node scripts/harness/local-run.mjs 처리|결과 <번호> · 결정 [<번호>]\n`);
    return 2;
  }
  const out = runLocal(mode, issue);
  process.stdout.write(`${out.exit === 0 ? "끝" : `실패(exit ${out.exit})`} — 기록 ${out.log}\n`);
  return out.exit;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  try {
    process.exit(main(process.argv.slice(2)));
  } catch (error) {
    process.stderr.write(`${new Date().toISOString()} 돌리지 못했다: ${error.message}\n`);
    process.exit(1);
  }
}
