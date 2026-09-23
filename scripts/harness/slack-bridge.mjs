// Slack 결과 카드에 단 👍 👎 😕 를 GitHub 결과 댓글의 결정으로 옮긴다. 이 Mac 에서 소켓 모드로 돈다.
//
//   node scripts/harness/slack-bridge.mjs [--dry-run]
//
// **왜 코드인가.** Workflow Builder 의 GitHub 커넥터에는 「이슈 만들기」만 있고 **기존 이슈에 댓글 다는
// 단계가 없다.** 이모지 반응 트리거가 주는 값도 메시지 글·링크·누른 사람뿐이라, 그 카드가 몇 번 요청인지
// 뽑아낼 자리가 없다. 그래서 카드 글에서 번호를 읽어 `gh` 로 옮기는 이 다리를 둔다.
//
// **세 가지 길로 결정이 들어온다.** 카드의 버튼(블록 액션), 카드에 단 반응, 그리고 반려·개선 버튼을 누른
// 뒤 그 카드의 스레드에 적은 까닭이다. 버튼은 낱말로 서 있어 무엇이 승인인지 카드가 알려 준다.
//
// **무엇을 다는가.** 반응 하나에 댓글 한 줄이다(`승인` · `반려: …` · `개선: …`). 그 댓글은 **누른 사람의
// 이름과 Slack 링크를 달고 간다** — 결정을 누가 했는지가 기록으로 남아야 한다. 판독은 그 댓글을 사람이 단
// 것으로 읽는다(decision.mjs). 에이전트는 이 길로 결정을 만들지 못한다. 이 다리는 사람이 누른 반응만
// 옮기고, 봇이 단 반응은 버린다.
//
// ## 설치
//
// 1. https://api.slack.com/apps 에서 앱을 하나 만든다(From scratch, 워크스페이스 bluekey).
// 2. **Socket Mode** 를 켜고 App-Level Token 을 만든다(스코프 `connections:write`). `xapp-` 로 시작한다.
// 3. **OAuth & Permissions** 의 Bot Token Scopes 에 `reactions:read` · `channels:history` · `channels:read` ·
//    `users:read` · `chat:write` 를 더하고 워크스페이스에 설치한다. `xoxb-` 로 시작하는 Bot Token 이 나온다.
// 4. **Interactivity & Shortcuts** 를 켠다. 소켓 모드라 Request URL 은 적지 않는다 — 버튼을 누른 것이
//    소켓으로 온다.
// 5. **Event Subscriptions** 를 켜고 봇 이벤트로 `reaction_added` 와 `message.channels` 를 구독한다.
//    뒤의 것이 스레드에 적은 까닭을 받는 길이다.
// 6. 결과 채널(#디자인시스템-화면-요청-결과물)에 그 앱을 초대한다: `/invite @<앱 이름>`.
// 7. 토큰 둘과 채널을 `~/.ooee-harness/slack.env` 에 적는다(이 파일은 저장소에 넣지 않는다).
//
//    ```sh
//    SLACK_APP_TOKEN=xapp-…
//    SLACK_BOT_TOKEN=xoxb-…
//    SLACK_RESULT_CHANNEL=C0C3LKRKJCU
//    ```
//
// 8. `cp scripts/harness/com.ooee.harness.slack.plist ~/Library/LaunchAgents/` 뒤
//    `launchctl load ~/Library/LaunchAgents/com.ooee.harness.slack.plist`. 로그는 `~/.ooee-harness/slack.log` 다.
//
// 토큰은 사람이 넣는다. 이 저장소에도 이 스크립트에도 두지 않는다.
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

/** 반응 → 결정. decision.mjs 의 표와 같아야 한다. */
export const REACTION_DECISIONS = { "+1": "승인", thumbsup: "승인", "-1": "반려", thumbsdown: "반려", confused: "개선" };

/** 결과 카드의 첫 줄이 「화면 요청 #39 결과 · 1회차 — …」이다. 거기서 번호를 읽는다. */
export function readIssueNumber(text) {
  const marked = String(text ?? "").match(/화면\s*요청\s*#(\d+)\s*결과/);
  if (marked) return Number(marked[1]);
  // 카드가 제목을 줄이거나 바뀌면 이슈 주소로도 찾는다.
  const linked = String(text ?? "").match(/github\.com\/[^/\s]+\/[^/\s]+\/issues\/(\d+)/);
  return linked ? Number(linked[1]) : null;
}

/**
 * 이슈에 달 댓글. **판독이 읽는 꼴을 지킨다** — `decision.mjs` 는 댓글의 첫 글(인용 줄을 건너뛴 뒤)이
 * 「승인」·「반려: …」·「개선: …」으로 시작할 때만 결정으로 읽는다. 그래서 누가 눌렀는지는 **인용 줄로 앞에**
 * 두고 결정 낱말만 홀로 남긴다. 뒤에 붙이면 「승인 — 기획자」가 되어 읽히지 않고, 사유 자리에 붙이면
 * 그 안내문이 개선 사유로 generate-code 에 넘어간다.
 *
 * 반려·개선은 사유를 비워 둔다. 이모지 하나로는 무엇을 고칠지 알 수 없어, 사람이 「개선: 고칠 것」을
 * 따로 남길 때까지 D3·D4 가 멈추는 것이 맞다.
 */
export function buildComment({ decision, by, permalink, how = "반응을 달아", reason = null }) {
  const who = by ? `${by} 님이` : "누군가";
  const where = permalink ? ` ([Slack에서 보기](${permalink}))` : "";
  const body = reason ? `${decision}: ${String(reason).replace(/\s+/g, " ").trim()}` : decision;
  return `> ${who} Slack 결과 카드에서 ${how} 남긴 결정입니다.${where}\n\n${body}`;
}

/** 버튼의 `action_id` 에서 결정을 읽는다. 다른 버튼은 null 이다. */
export function readAction(actionId) {
  const match = /^decide:(승인|반려|개선)$/.exec(String(actionId ?? ""));
  return match ? match[1] : null;
}

/** 까닭을 기다리는 자리. 카드 하나에 하나다. */
export const pendingKey = (channel, ts) => `${channel}:${ts}`;

/**
 * 이 스레드 글이 기다리던 까닭인지. 누른 사람이 그 스레드에 적은 사람 글만 받는다 — 봇이 남긴 안내나
 * 다른 사람의 잡담을 사유로 GitHub 에 올리지 않는다.
 */
export function isReason(event, pending) {
  if (!event || event.type !== "message" || event.subtype || event.bot_id) return false;
  if (!event.thread_ts || !pending) return false;
  return pending.user === event.user && String(event.text ?? "").trim().length > 0;
}

/** 옮길 반응인지. 봇이 단 것과 결정이 아닌 이모지는 버린다. */
export function shouldRelay(event, { botUserId } = {}) {
  if (!event || event.type !== "reaction_added" || event.item?.type !== "message") return false;
  if (!Object.hasOwn(REACTION_DECISIONS, event.reaction)) return false;
  if (botUserId && event.user === botUserId) return false;
  return true;
}

const HOME_ENV = path.join(os.homedir(), ".ooee-harness", "slack.env");

/** `KEY=값` 파일을 읽는다. 없으면 환경변수만 쓴다. */
export function loadEnv(file = HOME_ENV, env = process.env) {
  let text = "";
  try {
    text = readFileSync(file, "utf8");
  } catch {
    return { ...env };
  }
  const out = { ...env };
  for (const line of text.split("\n")) {
    const match = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
    if (match && !out[match[1]]) out[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return out;
}

const log = (line) => process.stdout.write(`${new Date().toISOString()} ${line}\n`);

async function slack(method, token, body) {
  const response = await fetch(`https://slack.com/api/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8", authorization: `Bearer ${token}` },
    body: JSON.stringify(body ?? {}),
  });
  const json = await response.json();
  if (!json.ok) throw new Error(`${method}: ${json.error}`);
  return json;
}

/** 메시지 목록에서 그 시각의 것을 고른다. */
export const pickMessage = (messages, ts) => (messages ?? []).find((message) => message.ts === ts) ?? null;

/** 카드의 글은 본문·첨부·블록에 흩어져 있다. 한 덩이로 모은다. */
export function messageText(message) {
  return [
    message.text ?? "",
    ...(message.attachments ?? []).flatMap((item) => [item.title ?? "", item.text ?? "", item.fallback ?? "", item.title_link ?? ""]),
    ...(message.blocks ?? []).flatMap((block) => [block.text?.text ?? "", ...(block.elements ?? []).map((el) => el.text ?? "")]),
  ].join("\n");
}

/**
 * 반응이 달린 메시지의 글과 주소.
 *
 * **결과 카드는 스레드 답글로 온다.** GitHub for Slack 은 이슈 카드를 채널에 두고 그 이슈의 댓글을 그
 * 카드의 스레드에 단다. `conversations.history` 는 스레드 답글을 돌려주지 않으므로(#48 의 😕 가 그래서
 * 읽히지 않았다) 없으면 `conversations.replies` 로 다시 찾는다 — 스레드 안의 어느 ts 로도 그 스레드를 준다.
 */
async function readMessage(token, { channel, ts }) {
  const inChannel = await slack("conversations.history", token, { channel, latest: ts, oldest: ts, inclusive: true, limit: 1 });
  let message = pickMessage(inChannel.messages, ts);
  if (!message) {
    const inThread = await slack("conversations.replies", token, { channel, ts, limit: 200 }).catch(() => ({ messages: [] }));
    message = pickMessage(inThread.messages, ts);
  }
  if (!message) return null;
  const { permalink } = await slack("chat.getPermalink", token, { channel, message_ts: ts }).catch(() => ({ permalink: null }));
  return { text: messageText(message), permalink };
}

async function userName(token, id) {
  try {
    const { user } = await slack("users.info", token, { user: id });
    return user?.profile?.display_name || user?.real_name || user?.name || id;
  } catch {
    return id;
  }
}

/** 이슈에 댓글을 단다. 러너와 같은 이 Mac 의 gh 로그인을 쓴다. */
function comment(issue, body, { dryRun }) {
  if (dryRun) return log(`(dry-run) #${issue} 에 댓글: ${body.split("\n")[0]}`);
  execFileSync("gh", ["issue", "comment", String(issue), "--body-file", "-"], {
    input: body,
    encoding: "utf8",
    cwd: path.resolve(path.dirname(new URL(import.meta.url).pathname), "../.."),
  });
  log(`#${issue} 에 댓글을 달았다: ${body.split("\n")[0]}`);
}

/** 카드의 스레드에 한 줄 남긴다. 사람이 누른 자리에서 다음에 무엇을 해야 하는지 보이게 한다. */
async function replyInThread(token, { channel, ts, text }) {
  await slack("chat.postMessage", token, { channel, thread_ts: ts, text }).catch((error) => log(`스레드에 적지 못했다: ${error.message}`));
}

/** 까닭을 기다리는 카드들. 다리가 다시 떠도 이어지게 파일에 둔다. */
const pendingFile = () => path.join(path.dirname(HOME_ENV), "pending.json");
const readPending = () => {
  try {
    return JSON.parse(readFileSync(pendingFile(), "utf8"));
  } catch {
    return {};
  }
};
const writePending = (all) => {
  mkdirSync(path.dirname(pendingFile()), { recursive: true });
  writeFileSync(pendingFile(), `${JSON.stringify(all, null, 2)}\n`);
};

/**
 * 카드의 결정 버튼을 눌렀을 때. 승인은 바로 올리고, 반려·개선은 까닭을 스레드로 받는다 —
 * 버튼 하나로는 무엇을 고칠지 알 수 없어 D3·D4 가 멈추기 때문이다.
 */
export async function handleAction(payload, { token, dryRun, channel }) {
  const decision = readAction(payload?.actions?.[0]?.action_id);
  if (!decision) return null;
  const channelId = payload.channel?.id;
  const ts = payload.message?.ts;
  if (channel && channelId !== channel) return null;
  const issue = Number(payload.actions[0].value) || readIssueNumber(messageText(payload.message ?? {}));
  if (!issue) return log(`버튼 ${decision} — 어느 요청인지 읽지 못했다(${ts})`);
  const by = await userName(token, payload.user?.id);
  const { permalink } = await slack("chat.getPermalink", token, { channel: channelId, message_ts: ts }).catch(() => ({ permalink: null }));

  if (decision === "승인") {
    comment(issue, buildComment({ decision, by, permalink, how: "승인 버튼을 눌러" }), { dryRun });
    await replyInThread(token, { channel: channelId, ts, text: `${by} 님이 승인했습니다. GitHub #${issue} 에 남겼습니다.` });
    return { issue, decision, by };
  }

  const all = readPending();
  all[pendingKey(channelId, ts)] = { issue, decision, user: payload.user?.id, by, permalink, at: new Date().toISOString() };
  writePending(all);
  await replyInThread(token, {
    channel: channelId,
    ts,
    text: `${by} 님이 ${decision}을 골랐습니다. **이 스레드에 까닭을 한 줄 적어 주세요.** 적으면 GitHub #${issue} 에 「${decision}: …」으로 남깁니다.`,
  });
  return { issue, decision, by, pending: true };
}

/** 까닭을 기다리던 스레드에 사람이 적으면 그 글을 결정 댓글로 올린다. */
export async function handleMessage(event, { token, dryRun, channel }) {
  if (!event || event.type !== "message" || !event.thread_ts) return null;
  if (channel && event.channel !== channel) return null;
  const all = readPending();
  const key = pendingKey(event.channel, event.thread_ts);
  const pending = all[key];
  if (!isReason(event, pending)) return null;
  comment(pending.issue, buildComment({ decision: pending.decision, by: pending.by, permalink: pending.permalink, how: `${pending.decision} 버튼을 누르고 까닭을 적어`, reason: event.text }), { dryRun });
  delete all[key];
  writePending(all);
  await replyInThread(token, { channel: event.channel, ts: event.thread_ts, text: `GitHub #${pending.issue} 에 「${pending.decision}: …」으로 남겼습니다.` });
  return { issue: pending.issue, decision: pending.decision, reason: event.text };
}

export async function handleEvent(event, { token, botUserId, dryRun, channel }) {
  if (!shouldRelay(event, { botUserId })) return null;
  if (channel && event.item.channel !== channel) return null;
  const message = await readMessage(token, { channel: event.item.channel, ts: event.item.ts });
  const issue = readIssueNumber(message?.text);
  if (!issue) {
    log(`반응 ${event.reaction} — 결과 카드가 아니라 넘어간다(${event.item.ts})`);
    return null;
  }
  const decision = REACTION_DECISIONS[event.reaction];
  const by = await userName(token, event.user);
  const body = buildComment({ decision, by, permalink: message.permalink });
  comment(issue, body, { dryRun });
  return { issue, decision, by };
}

/** 소켓 모드로 잇는다. 끊기면 다시 붙는다 — launchd 가 프로세스를 되살리는 것과 함께 두 겹이다. */
async function main(argv) {
  const dryRun = argv.includes("--dry-run");
  const env = loadEnv();
  const appToken = env.SLACK_APP_TOKEN;
  const botToken = env.SLACK_BOT_TOKEN;
  const channel = env.SLACK_RESULT_CHANNEL || null;
  if (!appToken || !botToken) {
    process.stderr.write(`토큰이 없다. ${HOME_ENV} 에 SLACK_APP_TOKEN 과 SLACK_BOT_TOKEN 을 적는다(스크립트 머리말 「설치」).\n`);
    return 2;
  }
  if (typeof WebSocket !== "function") throw new Error("이 node 에는 WebSocket 이 없다. node 22 이상으로 돌린다");

  const me = await slack("auth.test", botToken);
  log(`소켓 모드로 붙는다 — 앱 ${me.user} (${me.team})${dryRun ? " · dry-run" : ""}${channel ? ` · 채널 ${channel}` : ""}`);

  // 끊기면 다시 붙는다. 반응은 붙어 있는 동안만 오므로(소켓 모드는 지난 것을 다시 주지 않는다) 끊긴 사이의
  // 반응은 1분 타이머가 GitHub 쪽에서 읽는다 — 그쪽이 결정의 원본이다.
  for (;;) {
    const { url } = await slack("apps.connections.open", appToken);
    await new Promise((resolve) => {
      const socket = new WebSocket(url);
      socket.addEventListener("message", async (raw) => {
        let frame;
        try {
          frame = JSON.parse(raw.data);
        } catch {
          return;
        }
        if (frame.envelope_id) socket.send(JSON.stringify({ envelope_id: frame.envelope_id }));
        if (frame.type === "disconnect") return socket.close();
        try {
          if (frame.type === "interactive") await handleAction(frame.payload, { token: botToken, dryRun, channel });
          const event = frame.payload?.event;
          if (event?.type === "message") await handleMessage(event, { token: botToken, dryRun, channel });
          else if (event) await handleEvent(event, { token: botToken, botUserId: me.user_id, dryRun, channel });
        } catch (error) {
          log(`옮기지 못했다: ${error.message}`);
        }
      });
      socket.addEventListener("close", () => {
        log("연결이 끊겼다. 5초 뒤 다시 붙는다");
        setTimeout(resolve, 5000);
      });
      socket.addEventListener("error", (event) => log(`소켓 오류: ${event.message ?? "알 수 없음"}`));
    });
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main(process.argv.slice(2)).then(
    (code) => process.exit(code ?? 0),
    (error) => {
      process.stderr.write(`${new Date().toISOString()} 다리가 멈췄다: ${error.message}\n`);
      process.exit(1);
    },
  );
}
