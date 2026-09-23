// Slack 토큰과 채널을 읽는다. 다리와 카드가 함께 쓴다.
//
// 토큰은 사람이 `~/.ooee-harness/slack.env` 에 넣는다. 저장소에도 스크립트에도 두지 않는다.
// 이 파일이 따로 있는 까닭은 다리(slack-bridge.mjs)와 카드(slack-card.mjs)가 서로를 부르지 않게 하려는 것이다.
import { readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

export const HOME_ENV = path.join(os.homedir(), ".ooee-harness", "slack.env");

/** `KEY=값` 파일을 읽는다. 없으면 환경변수만 쓴다. 이미 있는 환경변수가 파일보다 세다. */
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
