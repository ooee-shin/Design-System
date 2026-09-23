// 결과를 결과 채널에 카드 한 장으로 올린다. `post-result.mjs` 가 이슈에 댓글을 단 뒤 부른다.
//
// **왜 우리가 올리는가.** GitHub for Slack 은 이슈 카드를 채널에 두고 그 이슈의 **댓글은 스레드에** 단다.
// 그래서 결과가 채널 본문에 보이지 않고 「1개의 댓글」로만 남았다(`2026-09-23` 개발자: 「카드 결과가
// 안보임」). 결과는 기획자가 제일 먼저 보는 것이라 채널에 한 장으로 서야 한다.
//
// 카드에 실리는 것은 결과 댓글의 **머리 네 줄**뿐이다. 자세한 것(화면 표·판단이 필요한 것·검사)은 이슈에
// 있고 카드가 그리로 가는 링크를 갖는다. 결정은 이 카드에 반응으로 달면 다리(slack-bridge.mjs)가 옮긴다.
//
// 토큰은 `~/.ooee-harness/slack.env` 의 `SLACK_BOT_TOKEN`, 채널은 `SLACK_RESULT_CHANNEL` 이다. 둘 중
// 하나라도 없으면 **조용히 건너뛴다** — 카드가 없다고 처리가 실패하지는 않는다. 결과의 원본은 이슈다.
import { loadEnv } from "./slack-bridge.mjs";

/** 결과 댓글에서 카드에 실을 머리를 뗀다. 첫 빈 줄까지다. */
export function headLines(body) {
  const lines = String(body ?? "").replace(/\r\n?/g, "\n").split("\n");
  const end = lines.findIndex((line) => line.trim() === "");
  return lines.slice(0, end < 0 ? lines.length : end).filter(Boolean);
}

/**
 * 카드 글. 머리 네 줄 아래에 이슈로 가는 길과 결정하는 법을 둔다.
 *
 * 사유는 이슈 댓글로 받는다 — 이모지 하나로는 무엇을 고칠지 알 수 없다(D3·D4).
 */
export function buildCard({ body, commentUrl }) {
  const head = headLines(body).join("\n");
  const where = commentUrl ? `\n\n자세히 보고 사유 남기기: ${commentUrl}` : "";
  return `${head}\n\n이 카드에 👍 승인 · 👎 반려 · 😕 개선. 반려·개선은 사유를 「반려: 까닭」·「개선: 고칠 것」 꼴로 이슈에 한 줄 남겨 주세요.${where}`;
}

/** 카드를 올릴 자리. 없으면 null 이고 부르는 쪽이 건너뛴다. */
export function slackTarget(env = loadEnv()) {
  const token = env.SLACK_BOT_TOKEN;
  const channel = env.SLACK_RESULT_CHANNEL;
  return token && channel ? { token, channel } : null;
}

/** 카드를 올린다. 올린 카드의 주소를 돌려준다. */
export async function postCard(text, { token, channel }) {
  const response = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8", authorization: `Bearer ${token}` },
    // 링크 미리보기를 끈다. 샌드박스와 이슈 주소가 카드 아래에 크게 펼쳐지면 네 줄 요약이 묻힌다.
    body: JSON.stringify({ channel, text, unfurl_links: false, unfurl_media: false }),
  });
  const json = await response.json();
  if (!json.ok) throw new Error(`chat.postMessage: ${json.error}`);
  return json.ts;
}
