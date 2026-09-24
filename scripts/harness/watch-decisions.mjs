// 새 화면 요청과 결정(👍 👎 😕 반응, 「승인」·「반려: …」·「개선: …」 댓글)을 이 Mac 이 자주 읽고, 할 것이
// 있으면 그 자리에서 러너를 돌린다. 한 번 돌고 끝나며 launchd 가 되풀이한다(scripts/harness/README.md 「launchd」).
//
//   node scripts/harness/watch-decisions.mjs [--dry-run]
//
// **왜 GitHub 의 10분 예약을 대신하는가.** `schedule` 은 밀린다 — `2026-09-22` 에 `*/10` 으로 두었는데 실제로는
// 12:50 · 17:36 · 20:28 · 23:13(UTC)에 돌았다. 몇 시간 뒤에야 읽히는 반응은 결정이 아니라 지연이다. 이 감시는
// gh 읽기 몇 번뿐이라 자주 돌려도 싸다.
//
// Actions job 이 아니라 여기서 돌리는 까닭은 scripts/harness/README.md 「러너」에 있다.
//
// 같은 것을 두 번 돌리지 않게 돌린 열쇠를 적어 둔다 — 요청은 `<이슈>:처리`, 결정은 러너와 같은 열쇠다
// (runner.mjs `decisionKey`). 멈춘 요청을 다시 돌리려면 사람이 손으로 부른다(`local-run.mjs 처리 <n>`).
// 러너가 도는 동안 launchd 는 다음 tick 을 띄우지 않으므로 한 번에 한 요청이다.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { runLocal, stateDir } from "./local-run.mjs";
import { decisionKey, pickActionable, readOpenRequests } from "./runner.mjs";

/** 깨운 결정을 적어 두는 자리. 러너의 상태 파일과 같은 폴더에 두되 파일은 따로다. */
export function watchStateFile(env = process.env) {
  return path.join(stateDir(env), "dispatched.json");
}

/** 한 요청을 한 번만 처리하게 하는 열쇠. 결정 열쇠(`<이슈>:<회차>:…`)와 섞이지 않는다. */
export const processKey = (issue) => `${issue}:처리`;

/**
 * 아직 처리하지 않은 요청. 결과 댓글이 없는 것(`결과 없음`)이 곧 「처리한 적 없다」이다.
 *
 * 이슈가 열릴 때 Actions 가 깨우던 자리를 대신한다. 멈춘 요청도 결과 댓글이 없어 여기 걸리지만, 열쇠를
 * 적어 두므로 다시 돌지는 않는다 — 고쳐서 다시 돌리는 것은 사람의 일이다.
 */
export function pickUnprocessed(reads, dispatched) {
  return reads.filter((read) => read.decision === "결과 없음" && !dispatched[processKey(read.issue)]);
}

const readJson = (file) => {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return {};
  }
};

function main(argv) {
  const dryRun = argv.includes("--dry-run");
  const reads = readOpenRequests();

  const file = watchStateFile();
  const dispatched = readJson(file);
  const fresh = pickUnprocessed(reads, dispatched);
  const todo = pickActionable(reads, dispatched);
  const stamp = new Date().toISOString();
  if (!fresh.length && !todo.length) {
    process.stdout.write(`${stamp} 요청 ${reads.length}건 · 새 요청·결정 없음\n`);
    return 0;
  }

  // 열쇠는 돌리기 **전에** 적는다. 러너가 멈추거나 이 Mac 이 꺼져도 1분 뒤에 같은 것을 다시 물지 않는다.
  const remember = (key) => {
    dispatched[key] = { startedAt: new Date().toISOString() };
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, `${JSON.stringify(dispatched, null, 2)}\n`);
  };
  let ok = true;
  const go = (mode, issue, why, key) => {
    process.stdout.write(`${new Date().toISOString()} #${issue} ${why} → ${mode}${dryRun ? " (dry-run)" : ""}\n`);
    if (dryRun) return;
    remember(key);
    const out = runLocal(mode, issue);
    process.stdout.write(`${new Date().toISOString()} #${issue} ${mode} 끝 — exit ${out.exit} · 기록 ${out.log}\n`);
    if (out.exit !== 0) ok = false;
  };

  for (const read of fresh) go("처리", read.issue, "결과 댓글이 없는 요청", processKey(read.issue));
  for (const read of todo) go("결정", read.issue, `${read.round}회차 ${read.decision} (${read.by} · ${read.source})`, decisionKey(read));
  return ok ? 0 : 1;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  try {
    process.exit(main(process.argv.slice(2)));
  } catch (error) {
    process.stderr.write(`${new Date().toISOString()} 결정을 보지 못했다: ${error.message}\n`);
    process.exit(1);
  }
}
