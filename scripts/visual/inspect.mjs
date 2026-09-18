#!/usr/bin/env node
// Studio 화면을 실제로 재고 찍는다. 측정할 때마다 새 스크립트를 쓰지 않기 위한 공용 CLI.
//
//   node scripts/visual/inspect.mjs --path /components/badge \
//     --click Brand --click Fill \
//     --measure "[data-slot=badge]" \
//     --shot badge-brand-fill --clip "#playground"
//
// 옵션은 `--help`로 본다. 결과는 JSON으로 stdout에 나오고 이미지는 --out 디렉터리에 쌓인다.
import { writeFileSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { launch, openPage, closePage } from "./cdp.mjs";

const HELP = `
사용법: node scripts/visual/inspect.mjs [옵션]

  --path <경로>        Studio 경로. 예: /components/badge
  --url <주소>         전체 주소를 직접 지정. --path 대신 쓴다.
  --base <주소>        기본 http://localhost:3000 (환경변수 STUDIO_URL로도 지정)
  --viewport <WxH>     기본 1440x900
  --theme <dark|light> 테마를 전환한 뒤 측정한다.
  --click <텍스트>      그 텍스트를 가진 button을 누른다. 여러 번 쓰면 순서대로 누른다.
  --hover <셀렉터>      그 요소 가운데로 포인터를 옮긴다. 포인터를 얹어야 나타나는 것을 잴 때 쓴다.
  --sweep <a,b,c>      Control 축 하나. 여러 번 쓰면 모든 조합을 크롬 한 번으로 훑는다.
                       예: --sweep Fill,Tonal,Outlined --sweep Brand,Neutral → 6개 조합
  --json               훑은 결과를 표 대신 JSON 전문으로 낸다.
  --wait <ms>          클릭 뒤 대기. 기본 250
  --measure <셀렉터>    좌표·크기·주요 computed style을 잰다. 여러 번 쓸 수 있다.
  --eval <JS>          임의 식을 평가해 결과를 받는다.
  --shot <이름>         스크린샷을 <이름>.png로 저장한다.
  --clip <셀렉터>       스크린샷을 그 요소 영역으로 자른다.
  --pad <px>           잘라낸 영역 상하좌우 여백. 기본 0
  --scale <배율>        스크린샷 배율. 기본 1
  --out <디렉터리>      이미지 저장 위치. 기본 .visual
`.trim();

function parseArgs(argv) {
  const opts = { click: [], measure: [], sweep: [], viewport: "1440x900", wait: 250, pad: 0, scale: 1, out: ".visual" };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") return { help: true };
    if (!arg.startsWith("--")) throw new Error(`알 수 없는 인자: ${arg}`);
    const key = arg.slice(2);
    if (key === "json") { opts.json = true; continue; }
    const value = argv[i + 1];
    if (value === undefined || value.startsWith("--")) throw new Error(`${arg}에 값이 없습니다.`);
    i += 1;
    if (key === "click" || key === "measure" || key === "sweep") opts[key].push(value);
    else if (key === "wait" || key === "pad" || key === "scale") opts[key] = Number(value);
    else opts[key] = value;
  }
  return opts;
}

const MEASURE = (selector) => `(() => {
  const nodes = [...document.querySelectorAll(${JSON.stringify(selector)})].slice(0, 20);
  return nodes.map((el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return {
      rect: { x: Math.round(r.left + scrollX), y: Math.round(r.top + scrollY), w: Math.round(r.width), h: Math.round(r.height) },
      overflow: el.scrollWidth > el.clientWidth ? { scrollW: el.scrollWidth, clientW: el.clientWidth } : null,
      style: {
        fontSize: cs.fontSize, lineHeight: cs.lineHeight, fontWeight: cs.fontWeight,
        padding: cs.padding, gap: cs.gap === "normal" ? undefined : cs.gap,
        radius: cs.borderRadius, border: cs.borderWidth === "0px" ? undefined : cs.border,
        color: cs.color, background: cs.backgroundColor,
      },
      text: el.textContent.trim().slice(0, 60),
    };
  });
})()`;

/** 요소 가운데의 뷰포트 좌표다. 포인터를 옮길 자리를 페이지에서 받아 온다. */
const HOVER_POINT = (selector) => `(() => {
  const el = document.querySelector(${JSON.stringify(selector)});
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
})()`;

const CLICK = (text) => `(() => {
  const el = [...document.querySelectorAll("button, [role=button], a")]
    .find((n) => n.textContent.trim() === ${JSON.stringify(text)});
  if (!el) return false;
  el.click();
  return true;
})()`;

const THEME = (mode) => `(() => {
  const root = document.documentElement;
  root.classList.toggle("dark", ${JSON.stringify(mode)} === "dark");
  root.dataset.theme = ${JSON.stringify(mode)};
  return { class: root.className, dataset: root.dataset.theme };
})()`;

const CLIP = (selector) => `(() => {
  const el = document.querySelector(${JSON.stringify(selector)});
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: Math.round(r.left + scrollX), y: Math.round(r.top + scrollY), width: Math.round(r.width), height: Math.round(r.height) };
})()`;

const opts = parseArgs(process.argv.slice(2));
if (opts.help) {
  console.log(HELP);
  process.exit(0);
}

const base = opts.base ?? process.env.STUDIO_URL ?? "http://localhost:3000";
const url = opts.url ?? base + (opts.path ?? "/");
const [width, height] = opts.viewport.split("x").map(Number);
const report = { url, viewport: { width, height } };

// 크롬을 띄우기 전에 대상이 응답하는지 본다. 서버가 내려가 있으면
// 모든 측정이 조용히 빈 값으로 나오므로 여기서 끊는다.
try {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
} catch (cause) {
  console.error(`${url} 에 접속하지 못했습니다: ${cause.message}`);
  console.error("개발 서버가 떠 있는지 확인하세요. `pnpm dev`");
  process.exit(1);
}

const chrome = await launch({ width, height });
let targetId;
try {
  const page = await openPage(url);
  targetId = page.targetId;
  const { session } = page;

  // 창 크기만으로는 좁은 폭을 잴 수 없다. 크롬 창은 500px 아래로 줄어들지 않아서, 그보다 좁은
  // 값을 주면 조용히 500px 로 잰 결과가 나온다. 앱의 최소 폭은 280px 이므로 뷰포트를 창이
  // 아니라 기기 값으로 덮어쓴다.
  await session.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: false,
  });

  if (opts.theme) report.theme = await session.eval(THEME(opts.theme));

  const settle = () => new Promise((r) => setTimeout(r, opts.wait));

  const clickAll = async (texts) => {
    const log = [];
    for (const text of texts) {
      log.push({ text, found: await session.eval(CLICK(text)) });
      await settle();
    }
    return log;
  };

  // `el.dispatchEvent` 로 만든 이벤트는 `:hover` 를 켜지 않는다. 브라우저가 실제 포인터로
  // 받아들이게 CDP 의 입력 채널로 보낸다.
  const hoverOver = async (selector) => {
    const point = await session.eval(HOVER_POINT(selector));
    if (!point) return { selector, found: false };
    await session.send("Input.dispatchMouseEvent", { type: "mouseMoved", buttons: 0, ...point });
    await settle();
    return { selector, found: true, ...point };
  };

  const measureAll = async () => {
    const out = {};
    for (const selector of opts.measure) out[selector] = await session.eval(MEASURE(selector));
    return out;
  };

  const capture = async (name) => {
    const dir = resolve(opts.out);
    mkdirSync(dir, { recursive: true });
    let clip;
    if (opts.clip) {
      const box = await session.eval(CLIP(opts.clip));
      if (!box) throw new Error(`--clip 셀렉터를 찾지 못했습니다: ${opts.clip}`);
      clip = {
        x: Math.max(0, box.x - opts.pad),
        y: Math.max(0, box.y - opts.pad),
        width: box.width + opts.pad * 2,
        height: (opts.height ? Number(opts.height) : box.height) + opts.pad * 2,
        scale: opts.scale,
      };
    }
    const shot = await session.send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: true,
      ...(clip ? { clip } : {}),
    });
    const file = join(dir, `${name}.png`);
    writeFileSync(file, Buffer.from(shot.data, "base64"));
    return file;
  };

  const slug = (v) => v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  if (opts.sweep.length) {
    // 축을 곱해 모든 조합을 만든다. 크롬은 한 번만 띄운다.
    const axes = opts.sweep.map((axis) => axis.split(",").map((v) => v.trim()).filter(Boolean));
    const combos = axes.reduce((acc, axis) => acc.flatMap((c) => axis.map((v) => [...c, v])), [[]]);
    report.combinations = combos.length;
    report.rows = [];
    for (const combo of combos) {
      const clicked = await clickAll([...opts.click, ...combo]);
      await settle();
      const row = { combo, missing: clicked.filter((c) => !c.found).map((c) => c.text) };
      if (opts.measure.length) row.measured = await measureAll();
      if (opts.shot) row.screenshot = await capture(`${opts.shot}-${combo.map(slug).join("-")}`);
      report.rows.push(row);
    }

    if (opts.json) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      const first = opts.measure[0];
      const cells = report.rows.map((row) => {
        const hit = first ? row.measured?.[first]?.[0] : null;
        return {
          combo: row.combo.join(" · "),
          size: hit ? `${hit.rect.w}×${hit.rect.h}` : "-",
          color: hit?.style.color ?? "-",
          background: hit?.style.background ?? "-",
          border: hit?.style.border ?? "-",
          radius: hit?.style.radius ?? "-",
          note: row.missing.length ? `못 찾음: ${row.missing.join(",")}` : "",
        };
      });
      const cols = ["combo", "size", "color", "background", "border", "radius", "note"];
      const width = Object.fromEntries(
        cols.map((c) => [c, Math.max(c.length, ...cells.map((r) => String(r[c]).length))]),
      );
      const line = (r) => cols.map((c) => String(r[c]).padEnd(width[c])).join("  ").trimEnd();
      console.log(`${report.url}  조합 ${combos.length}개${first ? `  기준 ${first}` : ""}`);
      console.log(line(Object.fromEntries(cols.map((c) => [c, c]))));
      console.log(cols.map((c) => "-".repeat(width[c])).join("  ").trimEnd());
      for (const r of cells) console.log(line(r));
      if (opts.shot) console.log(`\n이미지 ${report.rows.length}장 → ${resolve(opts.out)}`);
    }
  } else {
    if (opts.click.length) report.clicked = await clickAll(opts.click);
    if (opts.theme || opts.click.length) await settle();
    if (opts.hover) report.hovered = await hoverOver(opts.hover);
    if (opts.measure.length) report.measured = await measureAll();
    if (opts.eval) report.evaluated = await session.eval(opts.eval);
    if (opts.shot) report.screenshot = await capture(opts.shot);
    console.log(JSON.stringify(report, null, 2));
  }
} finally {
  if (targetId) await closePage(targetId).catch(() => {});
  chrome.kill();
}
