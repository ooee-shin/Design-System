// apps/sandbox 화면 하나를 Figma 로 옮길 준비를 한다. Figma 는 부르지 않는다.
//
//   node scripts/figma/prepare.mjs --key voc --name "고객의 소리" \
//     --state "목록" \
//     --state '상세 열림=[...document.querySelectorAll("tbody tr")].find((r) => r.textContent.includes("주문이 자꾸 밀려요")).click()'
//
// 결과는 .figma-work/<key>/ 에 쌓인다. manifest.json 의 steps 를 순서대로 use_figma 에 넘기면 된다.
// 개발 서버(pnpm --filter @ooee/sandbox dev)가 떠 있어야 한다. 기본 주소는 http://localhost:3001 이다.
// 모바일 화면은 --width 390 --height 844 로 돌린다. 프레임 이름의 기기 표기가 폭에 따라 Mobile·Desktop 으로 바뀐다.
import { execFileSync } from "node:child_process";
import { existsSync, globSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildDriver, foldInstances, fnv, loaderSteps, stripComments } from "./step-payload.mjs";

const args = process.argv.slice(2);
const opt = (name, fallback) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : fallback; };
const all = (name) => args.flatMap((a, i) => (a === `--${name}` ? [args[i + 1]] : []));

const key = opt("key");
const screenName = opt("name");
if (!key || !screenName) {
  console.error('사용: node scripts/figma/prepare.mjs --key <sandbox key> --name <화면 이름> [--state "이름=JS"]... [--base http://localhost:3001] [--width 1440] [--height 900] [--version]');
  process.exit(1);
}
const base = opt("base", "http://localhost:3001");
const width = Number(opt("width", "1440"));
// 카탈로그 컴포넌트의 인스턴스로 그릴지. 기본은 끄고 둔다. 까닭은 아래 prep() 의 주석에 있다.
const useInstances = args.includes("--instances");
const height = Number(opt("height", "900"));
// 이름은 첫 = 까지다. 이름에는 = 를 쓰지 않는다. --state 를 주지 않으면 「기본」 하나만 옮긴다.
const states = (all("state").length ? all("state") : ["기본"]).map((s) => {
  const i = s.indexOf("=");
  return i < 0 ? { label: s, script: "" } : { label: s.slice(0, i), script: s.slice(i + 1) };
});
const duplicate = states.map((s) => s.label).find((label, i, labels) => labels.indexOf(label) !== i);
if (duplicate !== undefined) throw new Error(`--state 이름이 겹친다: ${duplicate}. 프레임 이름이 같아 뒤 상태를 그릴 때 앞 프레임이 지워진다`);

// use_figma 한도는 50,000자지만 옮겨 적는 것은 모델이라, 한 단계가 클수록 한 글자가 어긋날 자리도 는다.
// 21,000자가 깨진 적이 있고, builder 를 문서로 뺀 뒤 데이터만으로 19,000자가 된 단계가 또 깨졌다.
// 그 단계 파일 자체는 해시가 맞았으니(로컬 확인) 옮겨 적다 틀린 것이다. 그래서 여유를 더 둔다.
const STEP_LIMIT = 12000;
const LINE_LIMIT = 900; // 파일을 읽는 도구가 한 번에 읽는 줄 수(2,000)보다 넉넉히 적게
const CHUNK_LIMIT = 3200; // 조각 하나의 노드 JSON 글자 수. 조각 여러 개를 한 단계에 담으므로 STEP_LIMIT 보다 작게 둔다
const here = path.dirname(fileURLToPath(import.meta.url));
const work = path.join(".figma-work", key);
rmSync(work, { recursive: true, force: true });
mkdirSync(path.join(work, "steps"), { recursive: true });
const run = (cmd, argv) => execFileSync(cmd, argv, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

// 1. 토큰 값
run(process.execPath, ["--import", "tsx", path.join(here, "token-export.ts"), path.join(work, "oe-tokens.json")]);
const tokens = JSON.parse(readFileSync(path.join(work, "oe-tokens.json"), "utf8"));

// 2. 화면 읽기. 루트는 <body> 의 첫 화면 요소다. 창 틀 높이만큼 뷰포트를 키워 실제 크기가 width×height 가 되게 한다.
const extract = readFileSync(path.join(here, "dom-extract.js"), "utf8").split("\n").filter((l) => !l.startsWith("//")).join("\n");
const trees = [];
// 헤드리스 Chrome 창은 500px 보다 좁아지지 않는다. 그보다 좁은 화면은 창을 500 으로 두고 문서 폭을 줄여 읽는다.
// Tailwind 의 가장 작은 break point(sm, 640px) 아래라 레이아웃은 같다.
const WINDOW_MIN = 500;
const narrow = width < WINDOW_MIN;
for (const [i, state] of states.entries()) {
  const expr = `(async()=>{await new Promise(r=>setTimeout(r,500));${state.script ? `${state.script};await new Promise(r=>setTimeout(r,700));` : ""}${narrow ? `document.documentElement.style.width='${width}px';document.body.style.overflow='hidden';await new Promise(r=>setTimeout(r,300));` : ""}const root=[...document.body.children].find(el=>el.getBoundingClientRect().height>0&&!el.tagName.includes('-')&&el.tagName!=='SCRIPT');root.setAttribute('data-figma-root','');return JSON.stringify({inner:window.innerHeight,innerW:Math.round(document.documentElement.getBoundingClientRect().width),tree:${extract}});})()`;
  const shot = `browser-${String(i).padStart(2, "0")}`;
  const measure = (h) => {
    const report = JSON.parse(run(process.execPath, ["scripts/visual/inspect.mjs", "--base", base, "--path", `/${key}`, "--viewport", `${Math.max(width, WINDOW_MIN)}x${h}`, "--eval", expr, "--shot", shot, "--out", work]));
    return JSON.parse(report.evaluated);
  };
  let value = measure(height);
  if (value.inner !== height) value = measure(height + (height - value.inner));
  if (value.inner !== height || value.innerW !== width) throw new Error(`뷰포트가 ${width}x${height} 가 아니다(${value.innerW}x${value.inner}). 디버깅 포트(CDP_PORT, 기본 9222)에 다른 Chrome 이 떠 있는지 본다`);
  // 문서 폭을 줄였으면 루트가 그 폭을 넘지 않는지만 본다.
  const tree = JSON.parse(value.tree);
  writeFileSync(path.join(work, `tree-${i}.json`), JSON.stringify(tree));
  trees.push({ state, tree, screenshot: path.join(work, `${shot}.png`) });
}

// 3. 아이콘 이름: @remixicon/react 번들의 path d 로 찾는다.
// 번들은 `const a=(…)=>t.createElement("svg",…,t.createElement("path",{d:"…"})),b=(…)=>…` 꼴로 압축돼 있고 이름에 $ 가 들어간다.
const newest = (pattern) => globSync(pattern).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })).at(-1);
const remixFile = newest("node_modules/.pnpm/@remixicon+react*/node_modules/@remixicon/react/index.mjs");
const remixSource = remixFile ? readFileSync(remixFile, "utf8") : "";
const localByD = new Map();
for (const m of remixSource.matchAll(/(?:const |,)([\w$]+)=\(\{color:[^}]*\}\)=>\w+\.createElement\("svg",\{[^}]*\},\w+\.createElement\("path",\{d:"([^"]+)"/g)) localByD.set(m[2], m[1]);
const exportByLocal = new Map();
const exportBlock = remixSource.match(/export\{([^}]+)\}/);
if (exportBlock) for (const pair of exportBlock[1].split(",")) { const [local, name] = pair.trim().split(/\s+as\s+/); if (name) exportByLocal.set(local, name); }
const firstD = (svg) => (svg.match(/ d="([^"]+)"/) || [])[1];

// 4. primitive·token 값
const tw = Object.fromEntries([...readFileSync(newest("node_modules/.pnpm/tailwindcss@4*/node_modules/tailwindcss/theme.css"), "utf8").matchAll(/--color-([a-z]+-\d+|white|black):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
function oklch(s) {
  const m = s.match(/oklch\(\s*([\d.]+)%?\s+([\d.]+)\s+([\d.]+|none)/);
  const L = parseFloat(m[1]) / (s.includes("%") ? 100 : 1), C = parseFloat(m[2]), h = ((m[3] === "none" ? 0 : parseFloat(m[3])) * Math.PI) / 180;
  const a = C * Math.cos(h), b = C * Math.sin(h);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b, m_ = L - 0.1055613458 * a - 0.0638541728 * b, s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const [l, mm, ss] = [l_ ** 3, m_ ** 3, s_ ** 3];
  const lin = [4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * ss, -1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * ss, -0.0041960863 * l - 0.7034186147 * mm + 1.707614701 * ss];
  const f = (c) => Math.round(Math.min(1, Math.max(0, c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055)) * 10000) / 10000;
  return { r: f(lin[0]), g: f(lin[1]), b: f(lin[2]) };
}
const hexRgb = (hex) => ({ r: parseInt(hex.slice(1, 3), 16) / 255, g: parseInt(hex.slice(3, 5), 16) / 255, b: parseInt(hex.slice(5, 7), 16) / 255 });
function primitiveValue(name) {
  if (name.startsWith("brand-alpha-")) return { ...hexRgb(tokens.seed), a: Number(name.split("-").at(-1)) / 100 };
  if (name.startsWith("brand-")) return tokens.brandSolid[name] ? hexRgb(tokens.brandSolid[name]) : null;
  if (name === "white") return { r: 1, g: 1, b: 1 };
  if (name === "black") return { r: 0, g: 0, b: 0 };
  return tw[name] ? oklch(tw[name]) : null;
}
function refValue(ref) {
  const v = ref.token ? tokens.tokens[ref.token]?.light : primitiveValue(ref.primitive);
  if (!v) return null;
  return { r: v.r, g: v.g, b: v.b, a: (v.a ?? 1) * (ref.alpha ? Number(ref.alpha) / 100 : 1) };
}
// 후보 가운데 계산된 색(raw)과 같은 것을 고른다. 같은 색이면 상태 변형이 없는 class 와 가까운 요소를 앞세운다.
const close = (a, b) => Math.max(Math.abs(a.r - b.r), Math.abs(a.g - b.g), Math.abs(a.b - b.b)) <= 0.03 && Math.abs((a.a ?? 1) - (b.a ?? 1)) <= 0.06;
const unresolved = [];
function resolve(color, where) {
  if (!color) return null;
  // 루트 바탕을 <body> 에서 가져온 경우에만 oe-background-* 토큰 값으로 찾는다.
  const cands = color.page && !(color.cands || []).length ? Object.keys(tokens.tokens).filter((name) => name.startsWith("oe-background-")).map((token) => ({ token, v: 0 })) : color.cands || [];
  const strip = ({ v, ...ref }) => ref;
  if (!color.raw) return cands.length ? strip(cands.find((c) => !c.v) || cands[0]) : null;
  const matches = cands.filter((c) => { const value = refValue(c); return value && close(value, color.raw); });
  const pick = matches.find((c) => !c.v) || matches[0];
  if (pick) return strip(pick);
  unresolved.push(`${where}: ${cands.map((c) => c.token || c.primitive).join(",") || "후보 없음"}`);
  return { raw: color.raw };
}

// 5. 조각
const frames = [];
const runs = [];
const unknownIcons = [];
function prep(node, nodePath, icons, primitives) {
  node.path = nodePath;
  // 인스턴스는 --instances 를 줄 때만 쓴다. 느려서가 아니라(2026-09-17 측정: 하나에 0.2초),
  // 카탈로그를 Figma 에 먼저 올려 둔 파일에서만 맞기 때문이다. 그 이름의 컴포넌트가 없으면
  // 안쪽을 싣지 않은 탓에 대신 그릴 것이 없으므로 builder 가 error 로 멈춘다.
  if (!useInstances) delete node.inst;
  const where = `${nodePath} ${node.n || node.s || ""}`.slice(0, 60);
  if (node.bg) node.bg = resolve(node.bg, `bg ${where}`) || undefined;
  if (node.c) node.c = resolve(node.c, `color ${where}`) || undefined;
  if (node.bd) { const c = resolve(node.bd.c, `border ${where}`); if (c) node.bd.c = c; else delete node.bd; }
  for (const ref of [node.bg, node.c, node.bd && node.bd.c]) if (ref && ref.primitive) primitives[ref.primitive] = primitiveValue(ref.primitive);
  if (node.t === "svg") {
    const name = exportByLocal.get(localByD.get(firstD(node.svg)));
    if (name) { icons[name] = node.svg.replace(/fill="currentColor"/, 'fill="#000000"'); node.icon = name; delete node.svg; }
    else unknownIcons.push(node.path);
  }
  (node.k || []).forEach((kid, i) => prep(kid, `${nodePath}.${i}`, icons, primitives));
}
/**
 * 배치하는 곳만 Frame 으로 남긴다(2026-09-16 유진식 결정).
 * DOM 의 감싸개를 그대로 옮기면 모든 요소가 Frame 이 되어 Figma 에서 다루기 어렵다.
 * - 글자·아이콘 하나만 감싼 상자와 자식을 그대로 통과시키는 상자는 없애고 그 자식을 위로 올린다.
 *   자식은 제 크기를 그대로 지킨다. 감싸개의 상자를 글자에 씌우면 글꼴 대체(Noto Sans KR)가 더 넓어
 *   줄바꿈이 생긴다. 감싸개가 하던 여백만큼 자리가 어긋나면 builder 의 settle 이 absolute 로 잡는다.
 * - 자식이 없고 칠·테두리만 있는 상자는 Rectangle 로 만든다.
 * `data-slot` 이 붙은 노드(컴포넌트를 가리키는 이름)와 루트, 칠·테두리·모서리를 가진 상자는 접지 않는다.
 */
const folded = { text: 0, icon: 0, pass: 0, rect: 0 };
function fold(node, isRoot = false) {
  if (node.k) node.k = node.k.map((kid) => fold(kid));
  if (node.t === "x" || node.t === "svg") return node;
  const kids = node.k || [];
  if (!kids.length && (node.bg || node.bd) && !node.slot) { folded.rect++; return { ...node, t: "rect", k: undefined }; }
  const plain = !node.bg && !node.bd && !node.r && !node.clip && !node.slot && !node.component && !isRoot;
  if (!plain || kids.length !== 1) return node;
  const kid = kids[0];
  const near = (a, b) => Math.abs(a - b) <= 1;
  if (kid.t === "x") { folded.text++; return kid; }
  if (kid.t === "svg") { folded.icon++; return kid; }
  if (near(kid.w, node.w) && near(kid.h, node.h)) { folded.pass++; return kid; }
  return node;
}

/**
 * flex 가 아니어도 자식이 한 방향으로 나란히 서 있으면 오토 레이아웃을 붙인다(2026-09-16 유진식 요청).
 * CSS 의 block 흐름은 세로로 쌓이므로 Figma 에서도 세로 오토 레이아웃과 같은 뜻이다.
 * 간격이 자리마다 다르면 붙이지 않는다. 억지로 붙이면 builder 의 settle 이 자식을 absolute 로 빼서
 * 오히려 오토 레이아웃이 아닌 것만 못하다.
 */
const inferred = { v: 0, h: 0 };
function inferLayout(node) {
  for (const kid of node.k || []) inferLayout(kid);
  const kids = (node.k || []).filter((k) => !k.portal);
  if (node.l || node.t === "x" || node.t === "svg" || node.t === "rect" || !kids.length) return;
  const gapsIn = (axis, size) => {
    const sorted = [...kids].sort((a, b) => a[axis] - b[axis]);
    const gaps = [];
    for (let i = 1; i < sorted.length; i++) {
      const gap = sorted[i][axis] - (sorted[i - 1][axis] + sorted[i - 1][size]);
      if (gap < -1) return null; // 겹친다
      gaps.push(Math.max(0, Math.round(gap)));
    }
    return Math.max(...gaps) - Math.min(...gaps) <= 1 ? Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length) : null;
  };
  // 자식이 하나면 방향이 뜻을 갖지 않는다. 여백만 살려 세로로 둔다.
  const vertical = kids.length === 1 ? 0 : gapsIn("y", "h");
  const horizontal = vertical === null ? gapsIn("x", "w") : null;
  if (vertical === null && horizontal === null) return;
  const d = vertical === null ? "H" : "V";
  const g = vertical === null ? horizontal : vertical;
  const left = Math.min(...kids.map((k) => k.x)) - node.x;
  const top = Math.min(...kids.map((k) => k.y)) - node.y;
  const right = node.x + node.w - Math.max(...kids.map((k) => k.x + k.w));
  const bottom = node.y + node.h - Math.max(...kids.map((k) => k.y + k.h));
  if ([left, top, right, bottom].some((v) => v < -1)) return; // 자식이 상자를 넘는다
  node.l = { d, g, p: [top, right, bottom, left].map((v) => Math.max(0, Math.round(v))), j: "flex-start", a: "flex-start", wr: 0 };
  inferred[d === "V" ? "v" : "h"]++;
}

// 조각이 실제로 쓰는 아이콘·primitive 만 싣는다.
function uses(nodes, all, acc = { icons: {}, primitives: {} }) {
  for (const n of nodes) {
    if (n.icon) acc.icons[n.icon] = all.icons[n.icon];
    for (const ref of [n.bg, n.c, n.bd && n.bd.c]) if (ref && ref.primitive) acc.primitives[ref.primitive] = all.primitives[ref.primitive];
    if (n.k) uses(n.k, all, acc);
  }
  return acc;
}
// 한 줄에 노드 하나를 쓴다. 파일을 읽는 도구가 긴 줄을 자르지 않게 하려는 것이다.
function format(node) {
  const { k, ...rest } = node;
  const head = JSON.stringify(rest);
  if (!k || !k.length) return head;
  return `${head.slice(0, -1)},"k":[\n${k.map(format).join(",\n")}\n]}`;
}
const chunkText = (c) => {
  const { nodes, icons, primitives, ...meta } = c;
  return `${JSON.stringify(meta).slice(0, -1)},"primitives":${JSON.stringify(primitives)},\n"icons":{${Object.entries(icons).map(([n, s]) => `\n${JSON.stringify(n)}:${JSON.stringify(s)}`).join(",")}},\n"nodes":[\n${nodes.map(format).join(",\n")}\n]}`;
};
// 단계 파일에 실을 builder 는 주석과 빈 줄을 뺀다. 한 단계의 8할이 builder 이고, 모델이 그것을
// 한 글자도 틀리지 않게 다시 쳐서 use_figma 에 넘긴다. 짧을수록 단계가 줄고 옮겨 적다 틀릴 자리도 준다.
// 저장소의 builder.js 는 그대로 두므로 읽을 때는 주석이 있는 원본을 본다. 규칙은 step-payload.mjs 에 있다.
const builder = stripComments(readFileSync(path.join(here, "builder.js"), "utf8"));
const builderHash = fnv(builder);
const buildCode = (chunks) => {
  const body = `[\n${chunks.map(chunkText).join(",\n")}\n]`;
  const expect = fnv(JSON.stringify(JSON.parse(body)));
  return buildDriver({ screenName, expect, builderHash, runBody: body });
};
const fits = (chunks) => { const code = buildCode(chunks); return code.length <= STEP_LIMIT && code.split("\n").length <= LINE_LIMIT; };
const size = (v) => JSON.stringify(v).length;
const device = width <= 480 ? "Mobile" : "Desktop";

// 프레임을 어느 커밋으로 그렸는지 남긴다. 되읽기(④)가 색 규칙을 믿어도 되는지 이것으로 가른다.
let builtCommit = "unknown";
try { builtCommit = run("git", ["rev-parse", "--short", "HEAD"]).trim(); } catch { /* 저장소 밖에서 돌릴 수도 있다 */ }
const builtAt = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });

trees.forEach(({ state, tree }, i) => {
  const all = { icons: {}, primitives: {} };
  prep(tree, `${key}:s${i}`, all.icons, all.primitives);
  tree = fold(tree, true);
  inferLayout(tree);
  foldInstances(tree);
  // 해석이 끝난 사양을 남긴다. 되읽기가 Figma 에서 읽은 값을 이 사양과 견준다.
  writeFileSync(path.join(work, `spec-${i}.json`), JSON.stringify(tree));
  const frameName = `${screenName} / ${state.label} · ${device} ${width}`;
  frames.push({ name: frameName, state: state.label, script: state.script });
  const chunks = [];
  const emit = (parentPath, parentBox, nodes, rootFrame = null) => chunks.push({ frameName, parentPath, parentBox, rootFrame, nodes, ...uses(nodes, all) });
  const split = (node, parentPath, parentBox, rootFrame = null) => {
    if (size(node) <= CHUNK_LIMIT) return emit(parentPath, parentBox, [node], rootFrame);
    const { k, ...stub } = node;
    emit(parentPath, parentBox, [{ ...stub, stub: 1 }], rootFrame);
    const box = { x: node.x, y: node.y };
    let group = [], groupSize = 0;
    const flush = () => { if (group.length) emit(node.path, box, group); group = []; groupSize = 0; };
    for (const kid of k || []) {
      const s = size(kid);
      if (s > CHUNK_LIMIT) { flush(); split(kid, node.path, box); }
      else if (groupSize + s > CHUNK_LIMIT) { flush(); group = [kid]; groupSize = s; }
      else { group.push(kid); groupSize += s; }
    }
    flush();
  };
  split(tree, null, { x: 0, y: 0 }, { x: i * (width + 100), y: 0, name: frameName, build: `${key}|s${i}|${builtCommit}|${builtAt}` });
  // 한 부모의 자식이 여러 조각에 나뉘면 마지막 조각에서 위치를 다시 잰다.
  const lastIndex = new Map();
  chunks.forEach((c, index) => { if (c.parentPath) lastIndex.set(c.parentPath, index); });
  chunks.forEach((c, index) => { if (c.parentPath && lastIndex.get(c.parentPath) === index) c.lastForParent = 1; });
  let current = [];
  for (const chunk of chunks) {
    if (current.length && !fits([...current, chunk])) { runs.push(current); current = []; }
    current.push(chunk);
  }
  if (current.length) runs.push(current);
});

// 6. use_figma 에 넘길 코드
const steps = [];
const writeStep = (name, code, description) => { const file = path.join(work, "steps", name); writeFileSync(file, code); steps.push({ file, description, chars: code.length, lines: code.split("\n").length }); };
const round = (x) => ({ r: Math.round(x.r * 10000) / 10000, g: Math.round(x.g * 10000) / 10000, b: Math.round(x.b * 10000) / 10000, a: x.a });
const tokenRows = Object.entries(tokens.tokens).map(([name, v]) => [name, round(v.light), round(v.dark), `${v.light.source} / ${v.dark.source}`]);
let stepNo = 0;
const num = () => String(++stepNo).padStart(2, "0");
writeStep(
  `${num()}-setup-variables.js`,
  readFileSync(path.join(here, "setup-variables.js"), "utf8")
    .replace("const TOKENS = __TOKENS__;", () => `const TOKENS = [\n${tokenRows.map((row) => JSON.stringify(row)).join(",\n")}\n];`)
    .replace("const SIZES = __SIZES__;", () => `const SIZES = ${JSON.stringify(tokens.sizes)};`)
    .replace("const EXPECT = __EXPECT__;", () => `const EXPECT = ${fnv(JSON.stringify([tokenRows, tokens.sizes]))};`),
  "oe 토큰을 Figma 변수로 맞춘다",
);
writeStep(`${num()}-setup-text-styles.js`, readFileSync(path.join(here, "setup-text-styles.js"), "utf8"), "oe 텍스트 스타일을 맞춘다");
// builder 는 여기서 한 번만 보내 문서에 둔다. 이후 build 단계는 조각만 싣고 이것을 꺼내 쓴다.
// 한 단계에 다 들어가지 않으면 나눠 보내 이어 붙인다. 마지막 조각에서 전체 해시를 확인한다.
const loaders = loaderSteps(builder, STEP_LIMIT - 1400);
loaders.forEach((code, i) => writeStep(`${num()}-load-builder.js`, code, `builder 를 문서에 둔다 (${i + 1}/${loaders.length}). 이후 build 단계가 이것을 꺼내 쓴다`));
runs.forEach((chunks, i) => writeStep(`${num()}-build.js`, buildCode(chunks), `프레임을 만든다 (${i + 1}/${runs.length})`));
writeStep(
  `${num()}-audit.js`,
  readFileSync(path.join(here, "audit.js"), "utf8")
    .replace("const SCREEN = __SCREEN__;", () => `const SCREEN = ${JSON.stringify(screenName)};`)
    .replace("const FRAMES = __FRAMES__;", () => `const FRAMES = ${JSON.stringify(frames.map((f) => f.name))};`),
  "읽기만. 변수·텍스트 스타일 연결을 센다",
);

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
for (const step of steps) {
  const code = readFileSync(step.file, "utf8");
  const leftover = code.split("\n").filter((line) => !line.trimStart().startsWith("//") && /__[A-Z]+__/.test(line));
  if (leftover.length) throw new Error(`${step.file} 에 치환되지 않은 자리가 남았다: ${leftover[0].slice(0, 80)}`);
  // use_figma 는 코드를 async 함수 본문으로 돌린다. 넘기기 전에 같은 방식으로 문법만 확인한다.
  try { new AsyncFunction("figma", code); } catch (error) { throw new Error(`${step.file} 문법 오류: ${error.message}`); }
}

// 새 파일 이름. 폴더의 파일 목록을 읽는 도구가 없어 이 기기에서 만든 이름(.figma-work/files.json)만 피한다.
const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });
const filesPath = path.join(".figma-work", "files.json");
const madeFiles = existsSync(filesPath) ? JSON.parse(readFileSync(filesPath, "utf8")) : [];
let fileName = `ooee · ${screenName} · ${today}`;
if (args.includes("--version") || madeFiles.some((f) => f.fileName === fileName)) {
  for (let v = 2; ; v++) { const candidate = `ooee · ${screenName} · ${today} · v${v}`; if (!madeFiles.some((f) => f.fileName === candidate)) { fileName = candidate; break; } }
}

const manifest = { key, screenName, fileName, filesJson: filesPath, builtCommit, builtAt, folded, inferredLayout: inferred, frames, specs: trees.map((_, i) => path.join(work, `spec-${i}.json`)), browserScreenshots: trees.map((t) => t.screenshot), unresolvedColors: unresolved, unknownIcons, steps };
writeFileSync(path.join(work, "manifest.json"), JSON.stringify(manifest, null, 2));
const tooBig = steps.filter((s) => s.chars > STEP_LIMIT || s.lines > LINE_LIMIT).map((s) => s.file);
console.log(JSON.stringify({ manifest: path.join(work, "manifest.json"), steps: steps.length, frames: frames.map((f) => f.name), fileName, unresolvedColors: unresolved.length, unknownIcons: unknownIcons.length, tooBig }, null, 2));
if (tooBig.length) process.exit(2);
