// Chrome을 headless로 띄우고 CDP로 페이지를 조작하는 최소 클라이언트.
// 기기별 절대경로를 담지 않는다. Chrome 위치는 CHROME_BIN으로 덮어쓸 수 있다.
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CANDIDATES = {
  darwin: [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
  ],
  linux: ["/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"],
  win32: ["C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"],
};

export function resolveChrome() {
  if (process.env.CHROME_BIN) return process.env.CHROME_BIN;
  for (const path of CANDIDATES[process.platform] ?? []) {
    if (existsSync(path)) return path;
  }
  throw new Error(
    "Chrome을 찾지 못했습니다. CHROME_BIN 환경변수로 실행 파일 경로를 지정하세요.",
  );
}

// 포트는 크롬이 고른다(`--remote-debugging-port=0`). 우리가 띄운 크롬의 포트만 쓰려는 것이다:
// 전에는 9222 에 못을 박고 `/json/version` 이 응답하면 곧 돌아왔으므로, 다른 크롬이 그 포트를
// 잡고 있으면 말없이 그 낡은 브라우저에 붙어 죽은 페이지를 재었다 — 실측이 두 번 `barExists:false,
// iframes:0` 을 내어 구현이 깨진 것처럼 보였고, 실행 사이에 `pkill` 을 넣고서야 되풀이가 되었다
// (`2026-09-29` 확인자). 크롬이 고른 포트는 우리가 갓 만든 빈 프로필의 `DevToolsActivePort` 첫 줄에
// 적히므로 그 파일을 읽어 붙는다 — 남의 브라우저는 우리 프로필을 쓰지 않는다.
// `CDP_PORT` 를 주면 그 포트로 띄우되(예전 길), 포트를 못 잡으면 남의 브라우저에 붙는 대신 실패한다.
let port = null;

function endpoint(path) {
  if (!port) throw new Error("Chrome 디버깅 포트를 아직 모릅니다 — launch() 를 먼저 부르세요.");
  return `http://127.0.0.1:${port}${path}`;
}

async function httpJson(path, init) {
  const res = await fetch(endpoint(path), init);
  return res.json();
}

export async function launch({ width = 1440, height = 900 } = {}) {
  const profile = mkdtempSync(join(tmpdir(), "ooee-visual-"));
  const asked = Number(process.env.CDP_PORT ?? 0) || 0;
  const proc = spawn(
    resolveChrome(),
    [
      "--headless=new",
      "--disable-gpu",
      "--hide-scrollbars",
      `--remote-debugging-port=${asked}`,
      `--window-size=${width},${height}`,
      `--user-data-dir=${profile}`,
      "about:blank",
    ],
    { stdio: "ignore" },
  );
  const portFile = join(profile, "DevToolsActivePort");
  for (let i = 0; i < 100; i += 1) {
    // 크롬이 포트를 못 잡고 죽으면 더 기다릴 것이 없다.
    if (proc.exitCode !== null || proc.signalCode !== null) break;
    // 파일은 크롬이 준비를 마친 뒤에 적으므로 아직 없을 수 있다.
    const found = existsSync(portFile) ? Number(readFileSync(portFile, "utf8").split("\n")[0] ?? "") : 0;
    if (found > 0) {
      port = found;
      // 그 포트가 정말 우리 크롬인지 한 번 묻고 돌아간다.
      try {
        await httpJson("/json/version");
        return proc;
      } catch {
        port = null;
      }
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  proc.kill();
  port = null;
  throw new Error(
    asked
      ? `Chrome이 디버깅 포트 ${asked} 를 여는 데 실패했습니다 — 다른 Chrome이 그 포트를 잡고 있을 수 있습니다(CDP_PORT 를 비우면 빈 포트를 고릅니다).`
      : "Chrome이 디버깅 포트를 여는 데 실패했습니다.",
  );
}

export class Session {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    ws.addEventListener("message", (event) => {
      const msg = JSON.parse(event.data);
      if (!msg.id || !this.pending.has(msg.id)) return;
      const { resolve, reject } = this.pending.get(msg.id);
      this.pending.delete(msg.id);
      if (msg.error) reject(new Error(JSON.stringify(msg.error)));
      else resolve(msg.result);
    });
  }

  send(method, params = {}) {
    this.id += 1;
    const id = this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression) {
    const result = await this.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (result.exceptionDetails) {
      throw new Error(
        result.exceptionDetails.exception?.description ?? "페이지에서 평가에 실패했습니다.",
      );
    }
    return result.result.value;
  }
}

export async function openPage(url) {
  const target = await httpJson(`/json/new?${encodeURIComponent(url)}`, { method: "PUT" });
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", reject, { once: true });
  });
  const session = new Session(ws);
  await session.send("Page.enable");
  await session.send("Runtime.enable");
  for (let i = 0; i < 200; i += 1) {
    if (await session.eval("document.readyState === 'complete'")) break;
    await new Promise((r) => setTimeout(r, 100));
  }
  await new Promise((r) => setTimeout(r, 600));
  return { session, targetId: target.id };
}

export async function closePage(targetId) {
  await fetch(endpoint(`/json/close/${targetId}`));
}
