// Figma 를 다시 읽는 ④의 로컬 도구다. Figma 는 부르지 않는다.
//
//   node scripts/figma/reread.mjs step --key voc --name "고객의 소리" --frame "고객의 소리 / 목록 · Desktop 1440"
//   node scripts/figma/reread.mjs diff --key voc --state 0 --figma .figma-work/voc/figma-0.json
//
// step 은 use_figma 에 넘길 단계 파일을 만든다. diff 는 그 결과(JSON)를 prepare.mjs 가 남긴
// spec-<상태>.json 과 견주어 무엇이 바뀌었는지, 코드로 되돌릴 수 있는지를 낸다.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const mode = args[0];
const opt = (name, fallback) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : fallback; };
const all = (name) => args.flatMap((a, i) => (a === `--${name}` ? [args[i + 1]] : []));

/** 글자 크기(px) → `oe/text-*` 단계. builder.js 의 SCALE 과 같은 값이다. */
const TEXT_SCALE = { 12: "xs", 14: "sm", 16: "base", 18: "lg", 20: "xl", 24: "2xl" };
/** 되짚을 수 있는 색은 `oe-*` semantic token 과 `oe primitive` 컬렉션의 단계뿐이다. */
const isToken = (name) => typeof name === "string" && name.startsWith("oe-");
const isPrimitive = (name) => typeof name === "string" && /^(brand-(alpha-)?\d+|white|black|[a-z]+-\d{2,3})$/.test(name);
const classHint = (field, name) => {
  const prefix = field === "bg" ? "bg" : field === "bd" ? "border" : "text";
  if (isToken(name)) return `${prefix}-${name}`;
  if (isPrimitive(name)) return `${prefix}-[var(--${name})]`;
  return null;
};

function flatten(node, out = new Map()) {
  if (node.path) out.set(node.path, node);
  for (const kid of node.k || []) flatten(kid, out);
  return out;
}
const refName = (ref) => (!ref ? null : ref.token || ref.primitive || null);
const figmaName = (paint) => (!paint ? null : paint.v || null);

/** spec(코드에서 그린 것)과 figma(다시 읽은 것) 한 쌍을 견준다. */
export function diffFrame(spec, figma) {
  const changes = [];
  const specNodes = flatten(spec);
  const seen = new Set();
  const add = (p, kind, from, to, auto, hint) => changes.push({ p, kind, from, to, auto, hint });

  for (const node of figma.nodes || []) {
    if (!node.p) {
      if (node.t !== "vec") changes.push({ p: null, kind: "추가", from: null, to: node.n, auto: false, hint: `Figma 에만 있는 레이어다(${node.n}). 사람이 정한다` });
      continue;
    }
    seen.add(node.p);
    const s = specNodes.get(node.p);
    if (!s) { add(node.p, "추가", null, node.n, false, "코드에 없는 경로다. 사람이 정한다"); continue; }

    for (const [field, specRef, figmaPaint] of [
      ["bg", s.bg, node.bg],
      ["c", s.c, node.c],
      ["bd", s.bd && s.bd.c, node.bd && node.bd.c],
    ]) {
      const from = refName(specRef);
      const to = figmaName(figmaPaint);
      if (from === to) continue;
      if (!to && figmaPaint) { add(node.p, "색", from, figmaPaint.hex, false, "변수에 묶이지 않은 색이다. 토큰으로 바꾼 뒤 다시 읽는다"); continue; }
      if (!to) { add(node.p, "색", from, null, false, `${field} 칠이 사라졌다. 사람이 정한다`); continue; }
      const hint = classHint(field, to);
      add(node.p, "색", from, to, Boolean(hint), hint ? `class 의 ${classHint(field, from) || from} 를 ${hint} 로 바꾼다` : `${to} 는 토큰이 아니다. 사람이 정한다`);
    }

    if (s.t === "x" && node.t === "x") {
      if ((s.s || "") !== (node.s || "")) add(node.p, "글자", s.s, node.s, true, "문구를 그대로 옮긴다");
      if (node.fs && s.fs && node.fs !== s.fs) {
        const step = TEXT_SCALE[node.fs];
        add(node.p, "글자 크기", s.fs, node.fs, Boolean(step), step ? `text-${step} 로 바꾼다` : `${node.fs}px 에 맞는 oe/text-* 단계가 없다. 사람이 정한다`);
      }
    }
    if (s.icon && /^Ri[A-Z]/.test(node.n) && s.icon !== node.n) add(node.p, "아이콘", s.icon, node.n, true, `@remixicon/react 의 ${node.n} 로 바꾼다`);

    const near = (a, b) => Math.abs((a ?? 0) - (b ?? 0)) <= 1;
    if (!near(s.w, node.w) || !near(s.h, node.h)) add(node.p, "크기", `${Math.round(s.w)}×${Math.round(s.h)}`, `${node.w}×${node.h}`, false, "크기는 토큰 단계와 레이아웃이 함께 정한다. 사람이 정한다");
    if (!near(s.r || 0, node.r || 0)) add(node.p, "모서리", s.r || 0, node.r || 0, false, "모서리는 사람이 정한다");
  }

  for (const [p, s] of specNodes) {
    if (seen.has(p) || s.stub) continue;
    add(p, "삭제", s.n || s.s, null, false, "Figma 에서 사라졌다. 사람이 정한다");
  }
  return changes;
}

// 아래는 직접 돌릴 때만 실행한다. 테스트는 diffFrame 만 불러 쓴다.
const directRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (!directRun) {
  // 불러 쓰는 자리
} else if (mode === "step") {
  const key = opt("key");
  const name = opt("name");
  const frames = all("frame");
  if (!key || !name || !frames.length) {
    console.error('사용: node scripts/figma/reread.mjs step --key <sandbox key> --name <화면 이름> --frame <프레임 이름>...');
    process.exit(1);
  }
  const code = readFileSync(path.join(here, "reread.js"), "utf8")
    .replace("const SCREEN = __SCREEN__;", () => `const SCREEN = ${JSON.stringify(name)};`)
    .replace("const FRAMES = __FRAMES__;", () => `const FRAMES = ${JSON.stringify(frames)};`);
  if (code.includes("__SCREEN__") || code.includes("__FRAMES__")) throw new Error("치환하지 못한 자리가 남았다");
  const dir = path.join(".figma-work", key, "steps");
  mkdirSync(dir, { recursive: true });
  const file = path.join(dir, "reread.js");
  writeFileSync(file, code);
  console.log(JSON.stringify({ file, chars: code.length, frames }, null, 2));
} else if (mode === "diff") {
  const key = opt("key");
  const state = opt("state", "0");
  const figmaPath = opt("figma");
  if (!key || !figmaPath) {
    console.error("사용: node scripts/figma/reread.mjs diff --key <sandbox key> --state <상태 순서> --figma <use_figma 결과 JSON 경로>");
    process.exit(1);
  }
  const spec = JSON.parse(readFileSync(path.join(".figma-work", key, `spec-${state}.json`), "utf8"));
  const read = JSON.parse(readFileSync(figmaPath, "utf8"));
  const frame = (read.frames || []).find((f) => !f.missing) || {};
  if (frame.missing || !frame.nodes) throw new Error(`읽은 프레임이 없다: ${figmaPath}`);
  const changes = diffFrame(spec, frame);
  const auto = changes.filter((c) => c.auto);
  console.log(JSON.stringify({
    frame: frame.name,
    build: frame.build,
    specCommitNote: "build 의 커밋이 지금 코드와 다르면 색 규칙이 그때와 다를 수 있다",
    counts: { all: changes.length, auto: auto.length, human: changes.length - auto.length },
    changes,
  }, null, 2));
} else {
  console.error("사용: node scripts/figma/reread.mjs <step|diff> …");
  process.exit(1);
}
