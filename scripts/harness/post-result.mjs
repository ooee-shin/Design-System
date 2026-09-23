// 결과 댓글 한 장을 이슈에 단다. 에이전트가 이슈에 글을 다는 **유일한 길**이다.
//
//   node scripts/harness/post-result.mjs <이슈 번호> <input.json>
//
// `gh issue comment` 를 공용 권한에서 열어 두면 에이전트가 「승인」 댓글도 확인 없이 달 수 있다. 그런데
// decision.mjs 는 계정으로 거르지 않는다 — 지금은 처리하는 계정과 요청자 계정이 같아서 거를 수가 없다.
// 그러면 에이전트가 쓴 「승인」이 사람의 결정으로 읽힌다. 그래서 `gh issue comment` 는 ask 로 닫고,
// 무인 세션도 결과를 올릴 수 있게 이 스크립트만 열어 둔다.
//
// 여기서 나가는 글은 renderResultComment 가 만든 것뿐이다. 첫 줄이 「화면 요청 #<n> 결과」로 고정되고
// 맨 끝에 표식이 붙으므로 결정 댓글로 읽힐 수 없다. 이 파일과 양식·판독 스크립트를 고치는 것은 공용
// 권한의 ask 다 — 에이전트가 이 길을 넓혀 스스로 승인하지 못하게 한다.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { looksLikeDecision, readCommentDecision, readMarker } from "./decision.mjs";
import { renderResultComment } from "./result-comment.mjs";
import { buildCard, postCard, slackTarget } from "./slack-card.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../..");

const refuse = (message) => {
  throw new Error(`결과 댓글을 달지 않는다: ${message}`);
};

/**
 * 달 글과 gh 인수를 만든다. 글은 stdin 으로 넘긴다 — 임시 파일을 두면 그 파일을 바꿔 치는 자리가 생긴다.
 *
 * 양식이 이미 지키는 것(표식, 첫 줄)을 한 번 더 본다. 양식을 고치는 커밋이 실수로 표식을 떨어뜨리거나 첫
 * 줄을 결정 낱말로 시작하게 만들어도, 그 글이 이슈에 올라가 결정으로 읽히기 전에 여기서 멈춘다.
 */
export function buildResultPost(number, input) {
  if (!Number.isInteger(number) || number <= 0) refuse("이슈 번호가 없다");
  if (input?.issue?.number !== number) refuse(`입력의 이슈 번호(${input?.issue?.number})가 ${number} 와 다르다`);
  const body = renderResultComment(input);
  const marker = readMarker(body);
  if (!marker || marker.issue !== number || marker.round !== input.round) refuse("양식이 만든 글 끝에 이 이슈·회차의 표식이 없다");
  if (readCommentDecision(body) || looksLikeDecision(body)) refuse("양식이 만든 글이 결정 댓글처럼 시작한다");
  return { body, args: ["issue", "comment", String(number), "--body-file", "-"] };
}

// ── CLI ──────────────────────────────────────────────────────────────────────

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  const [numberArg, file, ...rest] = process.argv.slice(2);
  const number = Number(numberArg);
  if (!Number.isInteger(number) || number <= 0 || !file || rest.length) {
    console.error("사용: node scripts/harness/post-result.mjs <이슈 번호> <input.json>");
    process.exit(2);
  }
  try {
    const { body, args } = buildResultPost(number, JSON.parse(readFileSync(file, "utf8")));
    const out = execFileSync("gh", args, { cwd: repoRoot, input: body, encoding: "utf8" });
    process.stdout.write(out);
    // 이슈에 달린 뒤에만 카드를 올린다. 카드가 실패해도 결과는 이슈에 남으므로 처리를 멈추지 않는다.
    const target = slackTarget();
    if (target) {
      await postCard(buildCard({ body, commentUrl: out.trim().split("\n").at(-1) }), target).then(
        (ts) => process.stdout.write(`결과 채널에 카드를 올렸다(${ts})\n`),
        (error) => process.stdout.write(`결과 채널에 카드를 올리지 못했다: ${error.message}\n`),
      );
    }
  } catch (error) {
    console.error(error.stderr?.toString().trim() || error.message);
    process.exit(1);
  }
}
