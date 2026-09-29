// 돌고 있는 실행이 예상보다 길면 결과 채널에 **한 번만** 알린다. 1분 감시가 러너를 만나면 이것을 부른다.
//
//   node scripts/harness/slow-notice.mjs [--dry-run]
//
// **왜 감시가 알리는가.** 러너는 모델을 기다리는 동안 그 자리에 멈춰 있어(동기 실행) 스스로 타이머를 돌리지
// 못한다. 부모인 `local-run.mjs` 도 자식을 동기로 기다리므로 같다. 반면 1분 감시는 러너가 도는 동안에도
// 60초마다 깨어나되 아무것도 하지 않고 나가던 자리가 있었다 — 그 자리에서 기록만 보고 알린다.
//
// **한 번만 알린다.** 알렸다는 표시를 그 실행의 기록 파일에 적는다. 따로 상태 파일을 두지 않으므로 실행이
// 끝나면 표시도 함께 지나간다.
//
// 기록이 없거나 Slack 값이 없으면 조용히 나간다. 토큰 값은 어디에도 찍지 않는다.
import { appendFileSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { estimate, readRun, readRuns } from "./estimate.mjs";
import { stateDir } from "./local-run.mjs";
import { postCard, slackTarget } from "./slack-card.mjs";

/** 기록에 적는 표시. 이 줄이 있으면 이 실행은 이미 알렸다. */
export const MARK = "지연을 결과 채널에 알렸다";

/** 예상의 몇 배를 넘기면 알리는가. 두 배면 11~15분 실행이 30분을 넘긴 자리다. */
export const TIMES = 2;

/** 가장 최근 기록 파일. 러너가 돌고 있으면 그것이 지금 도는 실행이다. */
export function newestRun(dir) {
  let names = [];
  try {
    names = readdirSync(path.join(dir, "runs")).filter((name) => name.endsWith(".log")).sort();
  } catch {
    return null;
  }
  const name = names[names.length - 1];
  if (!name) return null;
  const file = path.join(dir, "runs", name);
  let text = "";
  try {
    text = readFileSync(file, "utf8");
  } catch {
    return null;
  }
  const run = readRun(name, text);
  return run ? { ...run, file, text } : null;
}

/**
 * 알릴 것이 있는지. 알릴 때만 글을 돌려준다.
 *
 * 알리지 않는 자리 넷 — 이미 끝난 실행, 이미 알린 실행, 승인·반려·결과처럼 짧은 단계, 아직 예상 안인 실행이다.
 * 처리·개선만 본다(그 둘만 모델을 부르고 10분을 넘긴다).
 */
export function slowNotice(run, runs, { now = new Date() } = {}) {
  if (!run || /러너 끝 —/.test(run.text) || run.text.includes(MARK)) return null;
  const kind = run.mode === "처리" ? "처리" : run.kind;
  if (kind !== "처리" && kind !== "개선") return null;
  const started = Date.parse(`${run.stamp.slice(0, 4)}-${run.stamp.slice(4, 6)}-${run.stamp.slice(6, 8)}T${run.stamp.slice(9, 11)}:${run.stamp.slice(11, 13)}:${run.stamp.slice(13, 15)}Z`);
  if (!Number.isFinite(started)) return null;
  const minutes = Math.round((now.getTime() - started) / 60000);
  const est = estimate(kind, runs);
  if (minutes < est.high * TIMES) return null;
  // 조사가 낱말에 붙는다 — 「처리가」·「개선이」.
  const what = kind === "개선" ? "개선이" : "처리가";
  return `⏳ 화면 요청 #${run.issue} ${what} 예상보다 깁니다 — ${minutes}분 지났습니다(보통 ${est.low}~${est.high}분). 계속 돌고 있으니 조금 더 기다리거나 개발자에게 알려 주세요.`;
}

async function main(argv) {
  const dryRun = argv.includes("--dry-run");
  const dir = stateDir();
  const run = newestRun(dir);
  const text = slowNotice(run, readRuns(dir));
  if (!text) return 0;
  if (dryRun) {
    process.stdout.write(`${text}\n`);
    return 0;
  }
  const target = slackTarget();
  if (!target) return 0;
  // 표시를 먼저 적는다. 올리다 실패해도 1분 뒤에 또 올리지 않는다 — 같은 말을 되풀이하는 쪽이 더 나쁘다.
  appendFileSync(run.file, `${new Date().toISOString()} ${MARK}\n`);
  await postCard(text, target).catch(() => {});
  return 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main(process.argv.slice(2)).then(
    (code) => process.exit(code),
    () => process.exit(0),
  );
}
