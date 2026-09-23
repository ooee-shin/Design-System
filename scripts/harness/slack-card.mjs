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
 * 카드 글. 머리 네 줄 아래에 이슈로 가는 길과 결정하는 법을 둔다. 반응(이모지)으로 결정해도 되므로
 * 버튼이 없는 자리(알림 미리보기 등)에서도 뜻이 통하게 글로도 적는다.
 */
export function buildCard({ body, commentUrl }) {
  const head = headLines(body).join("\n");
  const where = commentUrl ? `\n\n자세히 보기: ${commentUrl}` : "";
  return `${head}\n\n아래 버튼으로 결정해 주세요(이 카드에 👍 👎 😕 를 달아도 됩니다). 반려·개선은 버튼을 누른 뒤 이 카드의 스레드에 까닭을 한 줄 적어 주세요.${where}`;
}

/** 버튼의 `action_id`. 다리가 이 꼴로 결정을 읽는다. */
export const decideAction = (decision) => `decide:${decision}`;

/**
 * 카드의 블록. 결정 버튼 셋을 카드 아래에 둔다.
 *
 * **버튼을 둔 까닭.** 반응은 이모지를 찾아 눌러야 하고 무엇이 승인인지 카드가 알려 주지 못한다. 버튼은
 * 낱말로 서 있고, 누르면 다리가 곧바로 GitHub 댓글로 옮긴다. 반려·개선은 누른 자리에서 스레드로 까닭을
 * 받는다 — 이모지 하나로는 무엇을 고칠지 알 수 없다(D3·D4).
 */
export function buildBlocks({ text, issue, commentUrl }) {
  const button = (decision, emoji, style) => ({
    type: "button",
    text: { type: "plain_text", text: `${emoji} ${decision}`, emoji: true },
    action_id: decideAction(decision),
    value: String(issue),
    ...(style ? { style } : {}),
  });
  return [
    { type: "section", text: { type: "mrkdwn", text } },
    { type: "actions", elements: [button("승인", "👍", "primary"), button("반려", "👎", "danger"), button("개선", "😕")] },
    ...(commentUrl ? [{ type: "context", elements: [{ type: "mrkdwn", text: `결정과 까닭은 <${commentUrl}|이슈>에 그대로 남습니다.` }] }] : []),
  ];
}

/** 카드를 올릴 자리. 없으면 null 이고 부르는 쪽이 건너뛴다. */
export function slackTarget(env = loadEnv()) {
  const token = env.SLACK_BOT_TOKEN;
  const channel = env.SLACK_RESULT_CHANNEL;
  return token && channel ? { token, channel } : null;
}

/** 카드를 올린다. 올린 카드의 ts 를 돌려준다. */
export async function postCard(text, { token, channel, blocks }) {
  const response = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8", authorization: `Bearer ${token}` },
    // 링크 미리보기를 끈다. 샌드박스와 이슈 주소가 카드 아래에 크게 펼쳐지면 네 줄 요약이 묻힌다.
    body: JSON.stringify({ channel, text, blocks, unfurl_links: false, unfurl_media: false }),
  });
  const json = await response.json();
  if (!json.ok) throw new Error(`chat.postMessage: ${json.error}`);
  return json.ts;
}
