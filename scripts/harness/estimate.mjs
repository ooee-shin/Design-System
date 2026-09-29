// 한 단계가 보통 얼마나 걸리는지 말한다. 기획자가 폼을 내거나 카드에서 결정을 누르면 그 말을 함께 받는다.
//
// **왜 요청 내용을 보지 않는가.** 걸리는 시간의 대부분이 pull request·Quality 검사·머지·배포라는 고정
// 구간이다. `2026-09-29` 에 기록 37건을 재 보니 화면 1장부터 4장까지 모두 10.8~14.3분 안이었다. 그래서 첫
// 요청에도 숫자를 말할 수 있다 — 근거는 그 요청이 아니라 파이프라인이다.
//
// **약속하지 않는다.** 「12분 뒤 끝납니다」가 아니라 「보통 11~14분 걸립니다」다. 어긋나도 거짓말이 되지 않는다.
//
// 씨앗 값을 다시 재려면 이 파일의 `readRuns` 로 기록을 읽어 종류별 중앙값·최소·최대를 본다.
//
//   node -e 'import("./scripts/harness/estimate.mjs").then(async (m) => { const runs = m.readRuns(process.env.HOME + "/.ooee-harness"); for (const kind of Object.keys(m.SEED)) console.log(kind, m.estimate(kind, runs)); })'
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

/** 기록 파일 이름. `local-run.mjs` 의 `runLogFile` 이 짓는 꼴이다. */
const LOG = /^(\d{8}T\d{6}Z)-(처리|결정|결과)-(\d+|전부)\.log$/;

/** 결정 실행이 무엇을 했는지. 러너가 기록 첫머리에 적는 줄이다. */
const DECIDED = /^## #\d+ \d+회차 (승인|반려|개선)/m;

/** 러너가 끝날 때 적는 줄. exit 0 만 성공으로 센다 — 실패한 실행의 길이는 예상이 아니라 고장이다. */
const ENDED = /러너 끝 — exit (\d+)/;

const ISO = /^(\d{4}-\d{2}-\d{2}T[\d:.]+Z)/m;

/**
 * 기록이 없는 기기에서도 숫자가 나오게 하는 씨앗. `2026-09-29` 에 기록 37건 가운데 성공한 실행만 재어
 * 중앙값과 최소·최대에서 정했다(처리 7건 11.7분 · 개선 1건 12.6 · 승인 4건 5.6 · 반려 2건 6.3 · 결과 4건 2.0).
 * 표본이 적은 종류는 옆 단계와 같은 폭으로 넓혔다 — 승인·반려는 모델을 부르지 않는 같은 길이고, 개선은
 * 처리와 같은 길에 회차가 하나 더 붙는다.
 */
export const SEED = Object.freeze({
  처리: { low: 11, high: 15, median: 12 },
  개선: { low: 11, high: 16, median: 13 },
  승인: { low: 5, high: 7, median: 6 },
  반려: { low: 5, high: 7, median: 6 },
  결과: { low: 1, high: 5, median: 2 },
});

/** 기록을 몇 건까지 보는가. 깨져 있던 시절의 142분 같은 이상값을 끌고 오지 않으려고 최신 것만 본다. */
export const SAMPLE = 10;

/** 기록 몇 건부터 씨앗 대신 쓰는가. 한두 건의 중앙값은 그 한두 건일 뿐이다. */
export const ENOUGH = 3;

/** 몇 건부터 양 끝을 하나씩 떼는가. 기록에는 「할 일이 없어 30초에 끝난 승인」 같은 것이 섞여 있다. */
export const TRIM_FROM = 5;

const median = (list) => {
  const sorted = [...list].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

/**
 * 한 기록 파일을 읽는다. 읽을 수 없으면 `null` — 고장 난 파일 하나가 전체를 막지 않는다.
 * `kind` 는 사람이 누른 것(승인·반려·개선)이고, 결정 줄이 없으면 모드 이름을 그대로 쓴다.
 */
export function readRun(name, text) {
  const named = LOG.exec(name);
  if (!named) return null;
  const [, stamp, mode, issue] = named;
  const times = String(text ?? "").match(new RegExp(ISO.source, "gm"));
  if (!times || times.length < 2) return null;
  const from = Date.parse(times[0]);
  const to = Date.parse(times[times.length - 1]);
  if (!Number.isFinite(from) || !Number.isFinite(to) || to < from) return null;
  const ended = ENDED.exec(text);
  return {
    stamp,
    mode,
    issue: issue === "전부" ? null : Number(issue),
    kind: DECIDED.exec(text)?.[1] ?? mode,
    minutes: (to - from) / 60000,
    ok: ended ? ended[1] === "0" : false,
  };
}

/** 상태 폴더의 기록 전부. 이름순이 시간순이다. 폴더가 없으면 빈 목록이다. */
export function readRuns(dir) {
  let names = [];
  try {
    names = readdirSync(path.join(dir, "runs")).filter((name) => LOG.test(name)).sort();
  } catch {
    return [];
  }
  const runs = [];
  for (const name of names) {
    let text = "";
    try {
      text = readFileSync(path.join(dir, "runs", name), "utf8");
    } catch {
      continue;
    }
    const run = readRun(name, text);
    if (run) runs.push(run);
  }
  return runs;
}

/**
 * 그 종류가 보통 얼마나 걸리는가. 성공한 실행만 최신 `SAMPLE` 건까지 보고, `ENOUGH` 건이 안 되면 씨앗을 쓴다.
 * `source` 가 「기록」인지 「씨앗」인지는 문구가 달라지므로 함께 돌려준다.
 */
export function estimate(kind, runs = []) {
  const seed = SEED[kind] ?? SEED.처리;
  const mine = runs.filter((run) => run.kind === kind && run.ok && run.minutes > 0).slice(-SAMPLE);
  if (mine.length < ENOUGH) return { ...seed, n: mine.length, source: "씨앗" };
  const minutes = mine.map((run) => run.minutes).sort((a, b) => a - b);
  // 폭은 표본의 최소·최대에서 잡는데, 다섯 건 이상이면 양 끝을 하나씩 뗀다. 승인 기록에는 「이미 main 에
  // 있어 30초에 닫고 끝난」 0.1분짜리가 있어, 그대로 쓰면 「보통 1~6분」 처럼 쓸모없는 폭이 된다.
  const span = minutes.length >= TRIM_FROM ? minutes.slice(1, -1) : minutes;
  return {
    low: Math.max(1, Math.floor(span[0])),
    high: Math.max(1, Math.ceil(span[span.length - 1])),
    median: Math.max(1, Math.round(median(minutes))),
    n: mine.length,
    source: "기록",
  };
}

/** 사람이 읽을 한 줄. 끝나는 시각을 약속하지 않는다. */
export function saying(kind, est) {
  const span = est.low === est.high ? `${est.low}분` : `${est.low}~${est.high}분`;
  const why = est.source === "기록" ? `기록 ${est.n}건의 중간값 ${est.median}분` : `아직 기록이 없어 지난 측정값입니다`;
  return `보통 ${span} 걸립니다(${why}).`;
}

/** 상태 폴더에서 바로 한 줄을 만든다. 부르는 쪽이 기록 읽기를 되풀이하지 않게 둔 자리다. */
export function sayingFor(kind, dir) {
  return saying(kind, estimate(kind, readRuns(dir)));
}
