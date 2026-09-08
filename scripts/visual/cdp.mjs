// Chrome을 headless로 띄우고 CDP로 페이지를 조작하는 최소 클라이언트.
// 기기별 절대경로를 담지 않는다. Chrome 위치는 CHROME_BIN으로 덮어쓸 수 있다.
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync } from "node:fs";
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

const PORT = Number(process.env.CDP_PORT ?? 9222);

async function httpJson(path, init) {
  const res = await fetch(`http://127.0.0.1:${PORT}${path}`, init);
  return res.json();
}

export async function launch({ width = 1440, height = 900 } = {}) {
  const profile = mkdtempSync(join(tmpdir(), "ooee-visual-"));
  const proc = spawn(
    resolveChrome(),
    [
      "--headless=new",
      "--disable-gpu",
      "--hide-scrollbars",
      `--remote-debugging-port=${PORT}`,
      `--window-size=${width},${height}`,
      `--user-data-dir=${profile}`,
      "about:blank",
    ],
    { stdio: "ignore" },
  );
  for (let i = 0; i < 100; i += 1) {
    try {
      await httpJson("/json/version");
      return proc;
    } catch {
      await new Promise((r) => setTimeout(r, 100));
    }
  }
  proc.kill();
  throw new Error("Chrome이 디버깅 포트를 여는 데 실패했습니다.");
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
  await fetch(`http://127.0.0.1:${PORT}/json/close/${targetId}`);
}
