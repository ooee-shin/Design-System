// 결과 댓글에 사람이 내린 결정(승인·반려·개선)을 읽는다. **읽기만 한다.**
//
//   node scripts/harness/decision.mjs <번호> [--round <r>]
//
// 이슈 댓글과 결과 댓글의 반응을 `gh api` GET 으로 읽어 JSON 을 stdout 에 낸다. 반응을 달거나 댓글을
// 쓰거나 이슈를 고치지 않는다 — 결정은 사람이 하고, 이 스크립트는 그것이 무엇이었는지만 옮긴다.
//
// 결정 신호는 두 가지다. 결과 댓글에 단 반응(👍 승인 · 👎 반려 · 😕 개선)과 「승인」 한 낱말이나
// 「반려: …」「개선: …」처럼 콜론을 붙인 댓글이다. 가장 늦은 것이 이긴다. 마음을 바꾸면 새 신호를
// 남기면 되고, GitHub 은 지운 반응을 돌려주지 않으므로 반응을 거두면 그 신호도 사라진다.
//
// 「승인합니다」「반려합니다. …」처럼 결정 낱말로 시작하지만 꼴이 맞지 않는 댓글은 결정으로 읽지 않고
// `lookalikes` 로 따로 낸다. 그것이 이긴 신호보다 늦으면 `lookalikeAfterDecision` 이 true 이고, 처리하는
// 쪽은 결정을 따르지 않고 묻는다. 버리기만 하면 사람이 마지막에 밝힌 뜻과 반대로 읽힐 수 있다.
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { RESULT_MARKER_RE } from "./result-comment.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../..");

/** 반응 → 결정. 이 밖의 반응(❤️ 👀 🎉 등)은 결정이 아니다. */
export const REACTION_DECISIONS = { "+1": "승인", "-1": "반려", confused: "개선" };

/**
 * 댓글이 결과 댓글이면 표식의 { issue, round } 를, 아니면 null 을 돌려준다. 표식이 **마지막 줄**일
 * 때만 결과 댓글로 본다. result-comment.mjs 가 늘 거기에 두고, 인용해 옮긴 댓글과 가르는 조건이다.
 */
export function readMarker(body) {
  const lines = String(body ?? "").replace(/\r\n?/g, "\n").trimEnd().split("\n");
  const match = lines[lines.length - 1].trim().match(RESULT_MARKER_RE);
  return match ? { issue: Number(match[1]), round: Number(match[2]) } : null;
}

/**
 * 댓글에서 인용을 뗀 본문. GitHub 의 「Quote reply」 로 결과 댓글을 인용한 뒤 쓴 결정도 받도록, 앞에 붙은
 * 인용(`>`) 줄과 빈 줄은 건너뛴다.
 */
function ownText(body) {
  const lines = String(body ?? "").replace(/\r\n?/g, "\n").split("\n");
  let start = 0;
  while (start < lines.length && (lines[start].trim() === "" || lines[start].trimStart().startsWith(">"))) start += 1;
  return lines.slice(start).join("\n").trim();
}

/**
 * 댓글 본문이 결정이면 { decision, reason } 을, 아니면 null 을 돌려준다.
 *
 * 첫 낱말이 승인·반려·개선이고 **바로 뒤가 콜론이거나 줄 끝**이어야 한다. 「승인 전에 하나만 볼게요」
 * 같은 말을 결정으로 읽지 않으려는 것이다. 이 규칙을 넓히지 않는 대신, 넓었으면 잡혔을 댓글은
 * `looksLikeDecision` 이 가려 판독 결과에 드러낸다.
 */
export function readCommentDecision(body) {
  const match = ownText(body).match(/^(승인|반려|개선)[ \t]*(?:[:：]([\s\S]*)|(?=\n)([\s\S]*)|$)/);
  if (!match) return null;
  const reason = (match[2] ?? match[3] ?? "").trim();
  return { decision: match[1], reason: reason || null };
}

/**
 * 결정 낱말로 시작하지만 `readCommentDecision` 이 받지 않은 댓글인가. 「승인합니다」「승인!」「반려합니다. …」
 * 「개선 요청: …」 같은 것이다. 「승인 전에 하나만 볼게요」도 여기 든다 — 결정인지 아닌지는 사람이 가린다.
 */
export function looksLikeDecision(body) {
  return /^(승인|반려|개선)/.test(ownText(body)) && !readCommentDecision(body);
}

/** 보고에 옮길 첫 줄. 카드나 대화에서 어느 댓글인지 알아볼 만큼만 자른다. */
const excerpt = (body, max = 30) => {
  const flat = ownText(body).replace(/\s+/g, " ");
  return flat.length > max ? `${flat.slice(0, max)}…` : flat;
};

/**
 * 신호 **앞**에 쓴 댓글을 사유로 볼 수 있는 시간. 사유를 먼저 적고 곧바로 반응을 다는 사람을 위한 자리라서,
 * 그보다 먼 댓글(앞서 남긴 질문·칭찬)은 그 결정의 사유로 잡지 않는다. 10분은 겪어 본 값이 아니라 출발값이다.
 */
export const REASON_BEFORE_MS = 10 * 60 * 1000;

const time = (value) => {
  const t = Date.parse(value);
  return Number.isNaN(t) ? 0 : t;
};
const login = (who) => who?.login ?? null;

/** 댓글을 만든 차례로 늘어놓는다. API 가 이미 그렇게 주지만 입력을 믿지 않는다. */
function inOrder(comments) {
  return comments
    .map((comment, index) => ({ comment, index }))
    .sort((a, b) => time(a.comment.created_at) - time(b.comment.created_at) || a.index - b.index)
    .map(({ comment }) => comment);
}

/**
 * 결과 댓글을 고른다. `round` 를 주면 그 회차의 것, 아니면 가장 최근 것이다. 같은 회차를 다시
 * 올렸으면 늦은 쪽이다. `issue` 를 주면 다른 이슈 번호가 적힌 표식은 건너뛴다(옮겨 붙인 댓글).
 */
export function pickResultComment(comments, { round, issue } = {}) {
  const found = inOrder(comments ?? []).filter((comment) => {
    const marker = readMarker(comment.body);
    if (!marker) return false;
    if (issue !== undefined && issue !== null && marker.issue !== Number(issue)) return false;
    return round === undefined || round === null || marker.round === Number(round);
  });
  return found.length ? found[found.length - 1] : null;
}

/**
 * 결정을 읽는다. 순수 함수다 — 입력은 GitHub API 가 주는 모양 그대로다.
 *
 * - comments: `GET /repos/{owner}/{repo}/issues/{n}/comments` 의 댓글들
 * - reactionsByCommentId: { [결과 댓글 id]: `GET …/issues/comments/{id}/reactions` 의 반응들 }
 * - round: 볼 회차. 없으면 가장 최근 결과 댓글
 * - issue: 이슈 번호. 주면 표식의 번호가 같은 것만 결과 댓글로 본다
 *
 * 결과 댓글 **이후**의 신호만 본다. 앞 회차의 결정이나 처리 전 확정 댓글은 이번 결과에 대한 것이
 * 아니다. 회차를 골랐을 때 댓글은 다음 결과 댓글 전까지만 본다 — 그 뒤의 댓글은 다음 회차의 것이다.
 * 반응은 결과 댓글에 붙어 있으니 언제 달았든 그 회차의 것이다.
 *
 * 결과 댓글이 없으면 decision 이 「결과 없음」이다. 「대기」(결과는 올라갔고 결정을 기다린다)와 섞으면
 * 처리가 아직인 이슈가 기획자 손에 있는 것처럼 읽힌다.
 *
 * 반려·개선의 `reason` 이 어디서 왔는지 `reasonSource` 로 남긴다. 'prefix' 는 「반려: …」 댓글 자신이고,
 * 'after'·'before' 는 신호 뒤·앞에 그 사람이 쓴 댓글을 사유로 **짐작**한 것이다. 짐작한 사유를 원문처럼
 * 넘기면 질문이나 칭찬이 개선 사유로 generate-code 인수에 붙는다.
 */
export function decide({ comments, reactionsByCommentId = {}, round, issue } = {}) {
  const ordered = inOrder(comments ?? []);
  const result = pickResultComment(ordered, { round, issue });
  const empty = { source: null, by: null, at: null, reason: null, reasonSource: null, reasonCommentUrl: null };
  if (!result) {
    return {
      decision: "결과 없음",
      ...empty,
      resultCommentId: null,
      resultCommentUrl: null,
      round: round ?? null,
      lookalikes: [],
      lookalikeAfterDecision: false,
      note: round ? `${round}회차 결과 댓글이 없다` : "결과 댓글이 없다 — 처리 결과가 아직 올라가지 않았다",
    };
  }

  const marker = readMarker(result.body);
  const from = ordered.indexOf(result) + 1;
  const nextResult = ordered.findIndex((comment, i) => i >= from && readMarker(comment.body));
  const window = ordered.slice(from, nextResult < 0 ? ordered.length : nextResult);

  // 결과 댓글을 쓴 계정과 반응한 계정이 같아도 거르지 않는다. 지금은 Slack 커넥터가 처리하는 세션과
  // 같은 GitHub 계정으로 이슈를 만들어서 처리 계정과 요청자 계정이 같다. 거르면 어떤 결정도 읽히지 않는다.
  // 그래서 이 판독은 「에이전트가 반응이나 결정 댓글을 달지 않는다」에 기댄다. 공용 권한(.claude/settings.json)이
  // `gh api` 를 통째로 deny 하고 `gh issue comment` 를 ask 로 두어(#21), 에이전트 세션에는 이슈 쓰기 명령이
  // 열려 있지 않다. 결과 댓글은 러너가 post-result.mjs 로 달며 표식이 붙으므로, 이 판독은 그 표식만 믿으면
  // 된다. 러너는 headless 라 ask 가 곧 거부다.
  const reactions = reactionsByCommentId[result.id] ?? [];
  const signals = [
    ...reactions
      .filter((reaction) => Object.hasOwn(REACTION_DECISIONS, reaction.content))
      .map((reaction) => ({
        decision: REACTION_DECISIONS[reaction.content],
        source: "reaction",
        by: login(reaction.user),
        at: reaction.created_at ?? null,
        reason: null,
        order: 0,
      })),
    ...window.flatMap((comment, i) => {
      const read = readCommentDecision(comment.body);
      if (!read) return [];
      return [{ ...read, source: "comment", by: login(comment.user), at: comment.created_at ?? null, comment, order: 1 + i }];
    }),
  ];
  // 같은 시각이면 댓글이 이긴다. 글로 남긴 쪽이 사유까지 담은 더 분명한 신호다.
  signals.sort((a, b) => time(a.at) - time(b.at) || a.order - b.order);
  const last = signals[signals.length - 1];

  // 결정 낱말로 시작하는데 꼴이 맞지 않아 읽지 않은 댓글. 이긴 신호보다 늦은 것이 있으면 사람이 마지막에
  // 밝힌 뜻이 decision 과 다를 수 있다. 같은 시각이면 댓글이 이긴다는 위의 규칙에 맞춰 늦은 쪽으로 친다.
  const isAfter = (comment) =>
    !last || (last.comment ? window.indexOf(comment) > window.indexOf(last.comment) : time(comment.created_at) >= time(last.at));
  const unread = window.filter((comment) => looksLikeDecision(comment.body));
  const lookalikes = unread.map((comment) => ({ url: comment.html_url ?? null, by: login(comment.user), at: comment.created_at ?? null, text: excerpt(comment.body) }));
  const lookalikeAfterDecision = unread.some(isAfter);
  const lookalikeNote = lookalikes.map((item) => `결정처럼 보이지만 읽지 않은 댓글: ${item.url ?? item.at} 「${item.text}」`);

  const base = { resultCommentId: result.id, resultCommentUrl: result.html_url ?? null, round: marker.round, lookalikes, lookalikeAfterDecision };
  if (!last) return { decision: "대기", ...empty, ...base, note: ["결과 댓글에 아직 결정이 없다", ...lookalikeNote].join(" / ") };

  let reason = last.reason;
  let reasonSource = reason ? "prefix" : null;
  let reasonComment = reason ? last.comment : null;
  if (!reason && last.decision !== "승인") {
    const found = findReason(window, last);
    if (found) ({ text: reason, source: reasonSource, comment: reasonComment } = found);
  }
  const notes = [];
  if (!reason && last.decision !== "승인") notes.push(`${last.decision} 사유 댓글이 아직 없다`);
  if (reasonSource === "after" || reasonSource === "before") {
    notes.push(`사유는 신호 ${reasonSource === "after" ? "뒤" : "앞"}에 쓴 댓글에서 짐작했다 — 결정과 이어진 글인지 확인한다`);
  }
  notes.push(...lookalikeNote);
  return {
    decision: last.decision,
    source: last.source,
    by: last.by,
    at: last.at,
    reason,
    reasonSource,
    reasonCommentUrl: reasonComment?.html_url ?? null,
    ...base,
    note: notes.length ? notes.join(" / ") : null,
  };
}

/**
 * 반려·개선의 사유를 찾는다. 신호를 남긴 사람이 **그 뒤에** 쓴 첫 댓글이 사유다('after'). 없으면 그 사람이
 * 신호 **앞** `REASON_BEFORE_MS` 안에 쓴 마지막 댓글을 본다('before') — 사유를 먼저 적고 반응을 다는 사람도
 * 있다. 다른 사람의 댓글은 사유로 삼지 않는다. 결정 댓글과 결과 댓글은 사유가 아니다.
 * 결정처럼 보이는 댓글(`looksLikeDecision`)은 사유 후보에 남긴다 — 😕 뒤의 「개선 요청: 버튼 색」은 사유다.
 */
function findReason(window, signal) {
  const own = window.filter((comment) => login(comment.user) === signal.by && comment !== signal.comment && !readCommentDecision(comment.body));
  const at = time(signal.at);
  const afterSignal = (comment) => (signal.comment ? window.indexOf(comment) > window.indexOf(signal.comment) : time(comment.created_at) >= at);
  const after = own.find(afterSignal);
  const before = own.filter((comment) => !afterSignal(comment) && at - time(comment.created_at) <= REASON_BEFORE_MS).pop();
  const pick = after ?? before;
  const text = pick ? String(pick.body).trim() : "";
  return text ? { text, source: after ? "after" : "before", comment: pick } : null;
}

// ── CLI ──────────────────────────────────────────────────────────────────────

/** `gh api --paginate --slurp` 는 쪽마다 배열을 담은 배열을 준다. 한 줄로 편다. */
export function flattenPages(pages) {
  return Array.isArray(pages) && pages.every(Array.isArray) ? pages.flat() : pages;
}

/**
 * GET 만 한다. `--method GET` 을 적어 두는 것은 gh 가 `-f` 같은 필드가 붙으면 저절로 POST 로 바꾸기
 * 때문이다. 이 스크립트를 고치다 필드를 붙여도 쓰기 요청이 되지 않게 못 박는다.
 */
function ghGet(route) {
  const out = execFileSync("gh", ["api", "--method", "GET", "--paginate", "--slurp", route], { cwd: repoRoot, encoding: "utf8" });
  return flattenPages(JSON.parse(out));
}

function main(argv) {
  const usage = "사용: node scripts/harness/decision.mjs <번호> [--round <r>]";
  const at = argv.indexOf("--round");
  const roundArg = at >= 0 ? argv[at + 1] : undefined;
  const positional = argv.filter((arg, i) => !arg.startsWith("--") && !(at >= 0 && i === at + 1));
  const number = Number(positional[0]);
  const round = roundArg === undefined ? undefined : Number(roundArg);
  if (!Number.isInteger(number) || number <= 0 || (round !== undefined && !(Number.isInteger(round) && round > 0))) {
    console.error(usage);
    process.exit(2);
  }
  const comments = ghGet(`repos/{owner}/{repo}/issues/${number}/comments`);
  const result = pickResultComment(comments, { round, issue: number });
  const reactionsByCommentId = result ? { [result.id]: ghGet(`repos/{owner}/{repo}/issues/comments/${result.id}/reactions`) } : {};
  console.log(JSON.stringify({ issue: number, ...decide({ comments, reactionsByCommentId, round, issue: number }) }, null, 2));
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    console.error(error.stderr?.toString().trim() || error.message);
    process.exit(1);
  }
}
