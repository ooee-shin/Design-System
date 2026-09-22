// 개발 서버가 **이 checkout 의** sandbox 인지 가린다. Figma 는 부르지 않는다.
//
//   node scripts/figma/sandbox-server.mjs --key shop-cart                 # 쓸 서버를 찾거나 띄울 빈 포트를 알려 준다
//   node scripts/figma/sandbox-server.mjs --key shop-cart --port 3007 --wait 120   # 그 포트가 준비될 때까지 기다린다
//
// 왜 있나(2026-09-22 반박 시험). /design-page 2단계가 3001 을 박아 두고 HTTP 코드만 봤다. 그때 3001 에는 다른
// 저장소(ooee-ui)의 sandbox 가 떠 있어서, voc 는 그 저장소의 옛 화면이 200 으로 조용히 읽혔고, shop-cart 는 404 라
// 이 저장소의 dev 를 띄웠지만 포트가 차 있어 뜨지 못한 채 「200 이 될 때까지 기다린다」에서 끝나지 않았다.
//
// 가르는 법. sandbox 의 `/sandbox-origin.json` 이 dev 서버가 도는 폴더의 지문(fnv(realpath(cwd)))을 돌려준다.
// 이 파일이 있는 checkout 의 apps/sandbox 지문과 같아야 「이 checkout」이다. 절대경로 대신 지문을 싣는 것은
// 같은 공유기의 폰도 dev 서버를 열 수 있어서다(next.config.ts 의 allowedDevOrigins). 빌드 결과에는 null 이 들어간다.
import { realpathSync } from "node:fs";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { fnv } from "./step-payload.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
export const SANDBOX_DIR = path.resolve(here, "..", "..", "apps", "sandbox");
export const ORIGIN_PATH = "/sandbox-origin.json";
/** sandbox 의 기본 포트와, 그 포트가 차 있을 때 새로 띄울 자리. 3002~3006 은 다른 작업이 흔히 쓴다. */
export const DEFAULT_PORT = 3001;
export const SPARE_PORTS = Array.from({ length: 14 }, (_, i) => 3007 + i);

/** dev 서버가 도는 폴더의 지문. sandbox 의 route 와 같은 식이다(sandbox-server.test.mjs 가 둘을 견준다). */
export function checkoutId(dir = SANDBOX_DIR) {
  return fnv(realpathSync(dir));
}

async function get(url, timeoutMs) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs), redirect: "manual" });
    return { status: res.status, text: await res.text() };
  } catch {
    return null;
  }
}

/**
 * base 의 서버를 본다.
 * - `origin`: `this`(이 checkout 의 sandbox) · `other`(다른 checkout·저장소의 sandbox, 또는 지문을 내지 않는 옛 sandbox·다른 서버) · `none`(아무것도 없다)
 * - `screen`: `/<key>` 의 HTTP 코드. 서버가 없으면 null
 * - `ok`: 이 checkout 의 서버이고 화면이 200 이다
 */
export async function probe(base, key, { expected = checkoutId(), timeoutMs = 30000 } = {}) {
  const origin = await get(new URL(ORIGIN_PATH, base).href, timeoutMs);
  if (!origin) return { base, origin: "none", screen: null, ok: false };
  let id = null;
  try { id = JSON.parse(origin.text).checkout ?? null; } catch { /* JSON 이 아니면 sandbox 가 아니다 */ }
  const page = key ? await get(new URL(`/${key}`, base).href, timeoutMs) : null;
  const screen = page ? page.status : null;
  const mine = origin.status === 200 && id === expected;
  return { base, origin: mine ? "this" : "other", screen, ok: mine && (!key || screen === 200) };
}

/** probe 결과를 사람이 읽을 까닭으로 바꾼다. prepare 가 멈출 때 쓴다. */
export function explain(result, key) {
  if (result.origin === "none") return `${result.base} 에 서버가 없다. pnpm --filter @ooee/sandbox dev --port <빈 포트> 로 띄운다(node scripts/figma/sandbox-server.mjs --key ${key} 가 빈 포트를 알려 준다)`;
  if (result.origin === "other") return `${result.base} 의 서버는 이 checkout 의 sandbox 가 아니다(${ORIGIN_PATH} 의 지문이 다르거나 없다). 다른 저장소·worktree 의 옛 화면을 읽게 되므로 멈춘다. 이 checkout 에서 빈 포트로 띄우고 --base 로 준다`;
  if (result.screen !== 200) return `${result.base}/${key} 가 ${result.screen} 이다. 이 checkout 에 그 화면이 없다(apps/sandbox/src/screens.ts 의 key 를 본다)`;
  return null;
}

/** 아무도 듣고 있지 않은 포트인지. next 는 `::` 에 붙으므로 같은 자리에 붙어 본다. */
export function portFree(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(false));
    server.once("listening", () => server.close(() => resolve(true)));
    server.listen(port);
  });
}

const baseOf = (port) => `http://localhost:${port}`;

/**
 * 쓸 서버를 고른다. 기본 포트와 예비 포트에서 이 checkout 의 서버를 찾고, 없으면 띄울 빈 포트를 고른다.
 * `{ ready: true, base }` 또는 `{ ready: false, start: { port, base, command }, seen }`.
 */
export async function choose(key, { ports = [DEFAULT_PORT, ...SPARE_PORTS], expected = checkoutId() } = {}) {
  const seen = [];
  for (const port of ports) {
    const result = await probe(baseOf(port), key, { expected, timeoutMs: 30000 });
    if (result.origin === "none") continue;
    seen.push({ port, origin: result.origin, screen: result.screen });
    if (result.origin === "this") {
      // 이 checkout 의 서버인데 화면이 없으면 띄워도 소용없다. key 가 틀렸다.
      return result.ok ? { ready: true, base: result.base } : { ready: false, base: result.base, error: explain(result, key), seen };
    }
  }
  for (const port of ports) {
    if (seen.some((s) => s.port === port)) continue;
    if (await portFree(port)) return { ready: false, start: { port, base: baseOf(port), command: `pnpm --filter @ooee/sandbox dev --port ${port}` }, seen };
  }
  return { ready: false, error: `빈 포트가 없다(${ports[0]}~${ports.at(-1)})`, seen };
}

// 아래는 직접 돌릴 때만 실행한다.
const directRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (directRun) {
  const args = process.argv.slice(2);
  const opt = (name) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : undefined; };
  const key = opt("key");
  if (!key) {
    console.error("사용: node scripts/figma/sandbox-server.mjs --key <sandbox key> [--port <n> [--wait <초>]]");
    process.exit(1);
  }
  if (opt("port")) {
    // 띄운 서버를 기다린다. 첫 요청은 Next 가 화면을 처음 짓느라 수 초 걸린다.
    const base = baseOf(Number(opt("port")));
    const until = Date.now() + Number(opt("wait") || 0) * 1000;
    let result = await probe(base, key);
    while (!result.ok && Date.now() < until && result.origin !== "other") {
      await new Promise((r) => setTimeout(r, 1000));
      result = await probe(base, key);
    }
    console.log(JSON.stringify({ ...result, reason: result.ok ? undefined : explain(result, key) }, null, 2));
    process.exit(result.ok ? 0 : 1);
  }
  const picked = await choose(key);
  console.log(JSON.stringify(picked, null, 2));
  process.exit(picked.error ? 1 : 0);
}
