// 결정(👍 👎 😕 반응과 「승인」·「반려: …」·「개선: …」 댓글)을 이 Mac 이 자주 읽고, 처리할 것이 있을 때만
// 러너를 깨운다. 한 번 돌고 끝나며 launchd 가 되풀이한다(아래 「설치」).
//
//   node scripts/harness/watch-decisions.mjs [--dry-run]
//
// **왜 GitHub 의 10분 예약을 대신하는가.** `schedule` 은 밀린다 — `2026-09-22` 에 `*/10` 으로 두었는데 실제로는
// 12:50 · 17:36 · 20:28 · 23:13(UTC)에 돌았다. 몇 시간 뒤에야 읽히는 반응은 결정이 아니라 지연이다. 이 감시는
// gh 읽기 몇 번뿐이라 자주 돌려도 싸고, 깨우는 것은 처리할 결정이 있을 때뿐이다.
//
// 처리 자체는 하지 않는다. `harness.yml` 을 `결정 <n>` 으로 깨우면 러너가 깨끗한 checkout 에서 돌고 기록이
// job 요약에 남는다. 같은 결정을 두 번 깨우지 않게 깨운 열쇠를 적어 둔다 — 러너도 처리 전에 같은 열쇠를
// 자기 파일에 적으므로(runner.mjs `decisionKey`) 겹쳐 들어와도 뒤엣것은 할 일이 없다.
//
// ## 설치
//
// launchd 가 띄운 프로그램은 `~/Desktop` 아래를 읽지 못한다(macOS TCC, EPERM). 그래서 보호 밖에 사본을
// 하나 두고 그것이 돈다. 사본은 돌 때마다 `origin/dev` 로 맞춰진다(watch-tick.sh).
//
//   git clone --depth 1 -b dev https://github.com/bluekey-kr/Design-System-Harness.git ~/.ooee-harness/harness
//   cp ~/.ooee-harness/harness/scripts/harness/com.ooee.harness.decisions.plist ~/Library/LaunchAgents/
//   launchctl load ~/Library/LaunchAgents/com.ooee.harness.decisions.plist
//   launchctl list | grep ooee            # 돌고 있는지
//   tail -f ~/.ooee-harness/watch.log     # 무엇을 보았는지
//
// 멈추려면 `launchctl unload ~/Library/LaunchAgents/com.ooee.harness.decisions.plist` 다.

import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { ACTIONABLE, decisionKey } from "./runner.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

/** 깨운 결정을 적어 두는 자리. 러너의 상태 파일과 같은 폴더에 두되 파일은 따로다. */
export function watchStateFile(env = process.env) {
  return path.join(env.HARNESS_STATE_DIR || path.join(os.homedir(), ".ooee-harness"), "dispatched.json");
}

/** 아직 깨우지 않은 결정. 러너의 `pickActionable` 과 같은 열쇠를 쓴다. */
export function pickNew(reads, dispatched) {
  return reads.filter((read) => ACTIONABLE.has(read.decision) && !dispatched[decisionKey(read)]);
}

const sh = (cmd, args) => execFileSync(cmd, args, { cwd: repoRoot, encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
const readJson = (file) => {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return {};
  }
};

function main(argv) {
  const dryRun = argv.includes("--dry-run");
  const issues = JSON.parse(sh("gh", ["issue", "list", "--state", "open", "--search", "화면 요청 in:title", "--json", "number,title", "--limit", "100"]))
    .filter((item) => item.title.startsWith("화면 요청"))
    .map((item) => item.number);
  const reads = issues.map((number) => JSON.parse(sh("node", ["scripts/harness/decision.mjs", String(number)])));

  const file = watchStateFile();
  const dispatched = readJson(file);
  const todo = pickNew(reads, dispatched);
  const stamp = new Date().toISOString();
  if (!todo.length) {
    process.stdout.write(`${stamp} 요청 ${issues.length}건 · 새 결정 없음\n`);
    return 0;
  }
  for (const read of todo) {
    process.stdout.write(`${stamp} #${read.issue} ${read.round}회차 ${read.decision} (${read.by} · ${read.source}) → 러너를 깨운다${dryRun ? " (dry-run)" : ""}\n`);
    if (dryRun) continue;
    sh("gh", ["workflow", "run", "harness.yml", "-f", "mode=결정", "-f", `issue=${read.issue}`]);
    dispatched[decisionKey(read)] = { dispatchedAt: stamp };
  }
  if (!dryRun) {
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, `${JSON.stringify(dispatched, null, 2)}\n`);
  }
  return 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  try {
    process.exit(main(process.argv.slice(2)));
  } catch (error) {
    process.stderr.write(`${new Date().toISOString()} 결정을 보지 못했다: ${error.message}\n`);
    process.exit(1);
  }
}
