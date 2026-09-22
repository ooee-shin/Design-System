// 라이브러리 키 표(`library.json`)를 쓰고 읽고, 화면 트리에서 어느 자리를 라이브러리 인스턴스로 놓을지 가른다.
// Figma 는 부르지 않는다. prepare.mjs 가 불러 쓰고 library.test.mjs 가 고정한다.
//
//   node scripts/figma/library.mjs save --from <export-keys.js 가 돌려준 JSON>   # library.json 을 새로 쓴다
//
// 왜 이 파일이 있나. Figma 화면은 **무조건 우리 라이브러리를 쓴다**(2026-09-22 개발자 결정). 화면 파일에 카탈로그
// 사본을 두지 않으므로 컴포넌트는 라이브러리 파일에서 키로만 가져올 수 있다. 그 키와, 「이 자리를 인스턴스로 놓아도
// 모양이 맞는가」를 Figma 없이 가를 변형별 서명을 여기서 관리한다.
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { fnv, stripLineComment, textsOf } from "./step-payload.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));

/** 게시된 컴포넌트 라이브러리 파일. **읽기만 한다.** 이 파일에 카탈로그를 올리는 것은 사람이 하는 일이다. */
export const LIBRARY = { name: "ooee · 컴포넌트 라이브러리", fileKey: "4HKy8Gi4Hd4VefFFvlIolc" };
export const LIBRARY_FILE = path.join(here, "library.json");

/**
 * 인스턴스는 기본으로 켠다. `--no-instances` 만 끈다.
 * 끄는 자리는 좁다 — 라이브러리를 이 파일에서 쓸 수 없는 계정·팀으로 옮길 때, 또는 라이브러리를 다시 올리는 중이라
 * 키 표와 라이브러리가 잠시 어긋나 있을 때 옛 모양(프레임)으로 확인만 하려는 경우다. 끈 채 그린 화면은 결과물이 아니다.
 * 예전의 `--instances` 는 이제 아무 일도 하지 않는다.
 */
export function instancesEnabled(argv) {
  return !argv.includes("--no-instances");
}

/** builder.js 의 `SCALE`·`WEIGHT`·`styleFor` 와 같은 표다. library.test.mjs 가 둘을 견준다. */
export const TEXT_SCALE = { 12: "text-xs", 13: "text-oe-label", 14: "text-sm", 16: "text-base", 18: "text-lg", 20: "text-xl", 24: "text-2xl" };
export const TEXT_WEIGHT = { 400: "regular", 500: "medium", 600: "semibold", 700: "bold" };
/** 화면의 글자 하나(fs·fw)가 Figma 에서 묶일 텍스트 스타일 이름. builder 의 styleFor 가 고르는 것과 같다. */
export function textStyleName(fs, fw) {
  const weight = TEXT_WEIGHT[fw] || (fw >= 650 ? "bold" : fw >= 550 ? "semibold" : fw >= 450 ? "medium" : "regular");
  let scale = TEXT_SCALE[fs];
  if (!scale) scale = TEXT_SCALE[Object.keys(TEXT_SCALE).map(Number).reduce((a, b) => (Math.abs(b - fs) < Math.abs(a - fs) ? b : a))];
  return `oe/${scale}/${weight}`;
}

/**
 * export-keys.js 의 응답을 library.json 모양으로 편다. 옮겨 적다 한 글자라도 바뀌면 해시가 달라 멈춘다.
 * 응답의 `rows` 는 `<값 차례>|<텍스트 스타일 차례,…>|<역할 P·V>|<아이콘+…>` 꼴이다.
 */
export function expandExport(exported, { exportedAt }) {
  if (fnv(JSON.stringify([exported.styles, exported.sets])) !== exported.hash) throw new Error("옮기는 중 응답이 바뀌었다(hash 가 다르다). use_figma 응답을 처음부터 다시 저장한다");
  if (exported.loose && exported.loose.length) throw new Error(`세트로 묶이지 않은 컴포넌트가 있다: ${exported.loose.join(", ")}. 라이브러리 파일에서 combine-variants 를 먼저 돌린다`);
  const sets = {};
  const names = [];
  for (const [setName, set] of Object.entries(exported.sets)) {
    if (set.status && set.status !== "CURRENT") throw new Error(`${setName} 이 게시된 판과 다르다(${set.status}). 라이브러리 파일에서 Publish 한 뒤 다시 뽑는다`);
    const variants = {};
    for (const row of set.rows) {
      const [at, styles, role, icons] = row.split("|");
      const index = at.split(".").map(Number);
      const name = set.axes.map((axis, i) => `${axis}=${set.values[i][index[i]]}`).join(", ");
      const sig = {};
      const t = styles ? styles.split(",").map((i) => exported.styles[Number(i)] || "?") : [];
      if (t.length) sig.t = t;
      if (role) sig.p = role === "P" ? "Placeholder" : "Value";
      if (icons) sig.i = icons.split("+");
      variants[name] = sig;
      names.push(`${setName}/${name}`);
    }
    sets[setName] = { key: set.key, variants };
  }
  names.sort();
  if (names.length !== exported.count || fnv(names.join("\n")) !== exported.namesHash) throw new Error("변형 이름을 다시 펴 보니 응답의 namesHash 와 다르다. export-keys.js 가 바뀌었는지 본다");
  const builtFrom = [...new Set((exported.built || []).map((b) => b.split("|")[2]).filter(Boolean))].sort();
  return { library: LIBRARY.name, fileKey: LIBRARY.fileKey, exportedAt, builtFrom, variants: names.length, namesHash: exported.namesHash, sets };
}

/** 한 줄에 변형 하나를 쓴다. 라이브러리를 다시 뽑았을 때 무엇이 바뀌었는지 diff 로 바로 보이게 하려는 것이다. */
export function formatLibrary(lib) {
  const { sets, ...head } = lib;
  const setLines = Object.entries(sets).map(([name, set]) => {
    const rows = Object.entries(set.variants).map(([variant, sig]) => `      ${JSON.stringify(variant)}: ${JSON.stringify(sig)}`);
    return `    ${JSON.stringify(name)}: {\n      "key": ${JSON.stringify(set.key)},\n      "variants": {\n  ${rows.join(",\n  ")}\n      }\n    }`;
  });
  const headLines = Object.entries(head).map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)}`);
  return `{\n${headLines.join(",\n")},\n  "sets": {\n${setLines.join(",\n")}\n  }\n}\n`;
}

export function readLibrary(file = LIBRARY_FILE) {
  let text;
  try { text = readFileSync(file, "utf8"); } catch { throw new Error(`${path.relative(process.cwd(), file)} 이 없다. scripts/figma/README.md 「라이브러리 키 표」대로 다시 뽑는다`); }
  return JSON.parse(text);
}

/** 모든 변형 이름(`세트/축=값, …`). 카탈로그 시험이 카탈로그 이름과 견준다. */
export function variantNames(library) {
  return Object.entries(library.sets).flatMap(([set, { variants }]) => Object.keys(variants).map((v) => `${set}/${v}`));
}

/** `세트/변형` 이름을 키 표에서 찾는다. 없으면 null. */
export function findVariant(library, full) {
  const at = full.indexOf("/");
  const set = library.sets[full.slice(0, at)];
  if (!set) return null;
  const sig = set.variants[full.slice(at + 1)];
  return sig ? { set: full.slice(0, at), key: set.key, sig } : null;
}

function iconsIn(node, acc = []) {
  if (node.t === "svg") acc.push(node.icon || "?");
  for (const kid of node.k || []) iconsIn(kid, acc);
  return acc;
}
const list = (xs) => (xs.length ? xs.join("·") : "없음");

/**
 * 이 자리를 라이브러리 변형으로 놓으면 모양이 맞는지 본다. 맞으면 null, 아니면 까닭.
 * 인스턴스에 넘기는 것은 **글자뿐**이다. 그래서 글자 자리의 수·차례·텍스트 스타일과 보이는 아이콘이 모두 같아야 한다.
 * 값도 placeholder 도 없는 빈 입력은 라이브러리의 Placeholder 한 자리를 빈 글자로 채워 놓는다(`blank`).
 */
export function mismatch(node, sig) {
  const texts = textsOf(node);
  const want = sig.t || [];
  if (!texts.length && want.length === 1 && sig.p === "Placeholder") return null;
  if (texts.length !== want.length) return `글자 자리 수가 다르다: 화면 ${texts.length} ≠ 라이브러리 ${want.length}`;
  for (const [i, text] of texts.entries()) {
    const style = textStyleName(text.fs, text.fw);
    if (style !== want[i]) return `글자 스타일이 다르다: 「${String(text.s).slice(0, 16)}」 화면 ${style} ≠ 라이브러리 ${want[i]}`;
  }
  const mine = iconsIn(node).sort();
  const theirs = [...(sig.i || [])].sort();
  if (mine.join("+") !== theirs.join("+")) return `아이콘이 다르다: 화면 ${list(mine)} ≠ 라이브러리 ${list(theirs)}`;
  return null;
}

/**
 * 트리를 훑어 인스턴스로 놓을 자리를 확정한다. prep() 이 색·아이콘 이름을 푼 **뒤에**, 접기 전에 부른다.
 * - 이름이 키 표에 없으면 `missing` 에 넣고 `inst` 를 **그대로 둔다.** 라이브러리에 없는 변형을 조용히 프레임으로
 *   떨어뜨리지 않는다 — prepare 는 exit 3 으로 멈추고, 그래도 돌리면 build 단계가 error 로 멈춘다.
 * - 이름은 있는데 모양이 맞지 않으면 `inst` 를 지우고 `unsupported` 에 까닭을 남긴다. 그 자리는 프레임으로 그린다.
 * - dom-extract 가 애초에 `unsup` 으로 가른 자리(Field·SelectBox …)도 `unsupported` 에 모은다.
 * 인스턴스 자리의 안쪽은 보지 않는다. 프레임으로 두는 자리는 안쪽의 컴포넌트가 제 차례를 갖는다.
 */
export function decideInstances(tree, library) {
  const out = { instances: [], unsupported: [], missing: [] };
  const visit = (node) => {
    if (node.inst) {
      const found = findVariant(library, node.inst);
      if (!found) { out.missing.push({ path: node.path, name: node.inst }); return; }
      const why = mismatch(node, found.sig);
      if (!why) {
        if (!textsOf(node).length && (found.sig.t || []).length === 1) node.blank = 1;
        const icons = iconsIn(node).sort();
        if (icons.length) node.ic = icons;
        out.instances.push({ path: node.path, name: node.inst });
        return;
      }
      out.unsupported.push({ path: node.path, set: found.set, name: node.inst, why });
      delete node.inst;
    } else if (node.unsup) {
      out.unsupported.push({ path: node.path, set: node.unsup.set, why: node.unsup.why });
    }
    for (const kid of node.k || []) visit(kid);
  };
  visit(tree);
  return out;
}

/**
 * 라이브러리와 상관없는 native 덩이(`nat`)를 모은다. 보고의 「라이브러리에 없어 프레임으로 둔 것」이 된다.
 * 잇달아 나오는 같은 덩이(상품 카드 8장, 카테고리 링크 3개)는 한 줄로 묶어 `count` 로 센다.
 * 인스턴스 안쪽은 보지 않는다.
 */
export function collectNotInLibrary(tree) {
  const out = [];
  const walk = (node, within) => {
    if (node.inst) return;
    let here = within;
    if (node.nat) {
      const last = out.at(-1);
      if (last && last.what === node.nat && last.in === (within || undefined)) last.count++;
      else out.push({ what: node.nat, in: within || undefined, count: 1, path: node.path, text: textsOf(node).map((t) => t.s).join(" ").slice(0, 40) });
      here = node.nat;
    }
    for (const kid of node.k || []) walk(kid, here);
  };
  walk(tree, null);
  return out;
}

/** 판정에만 쓰고 단계에는 싣지 않는 표식을 뗀다. 인스턴스를 끈 실행은 `inst` 도 뗀다. */
export function stripMarks(node, { dropInstances = false } = {}) {
  delete node.unsup;
  delete node.nat;
  if (dropInstances) { delete node.inst; delete node.blank; delete node.ic; }
  for (const kid of node.k || []) stripMarks(kid, { dropInstances });
  return node;
}

// ── 라이브러리가 화면을 다 덮는가 ─────────────────────────────────────────────

/**
 * 라이브러리가 덮지 못하는 자리를 프레임으로 두어도 되는 요청. **저장소 주인이 정한 것만 적는다.**
 * 2026-09-22 결정: Figma 화면은 무조건 라이브러리를 쓰고, 라이브러리에 없는 것은 코드 → 카탈로그 → 라이브러리로
 * 먼저 만든다. 이 규칙은 다음 요청부터이고, #9 는 규칙보다 먼저 만든 화면이라 예외다.
 * prepare 의 `--allow-frames <이슈 번호>` 는 여기 적힌 번호와 화면 key 에만 듣는다. 에이전트가 플래그만 붙여
 * 규칙을 비껴가지 못하게 하려는 것이다. 예외를 더하는 것은 이 표를 고치는 커밋이라 diff 에 드러난다.
 */
export const FRAME_EXCEPTIONS = {
  9: {
    decided: "2026-09-22",
    keys: ["shop-product-list", "shop-product-detail", "shop-cart", "shop-checkout", "shop-order-complete"],
    why: "규칙보다 먼저 만든 화면이다. 새 컴포넌트를 만들지 않고 라이브러리에 있는 것만 인스턴스로 놓는다",
  },
};

/** `--allow-frames <n>` 을 읽는다. 없으면 null, 등록되지 않은 번호나 그 요청의 화면이 아니면 던진다. */
export function framesException(argv, key, table = FRAME_EXCEPTIONS) {
  const at = argv.indexOf("--allow-frames");
  if (at < 0) return null;
  const issue = String(argv[at + 1] || "").replace(/^#/, "");
  const entry = table[issue];
  if (!entry) throw new Error(`--allow-frames ${argv[at + 1] || ""}: 예외로 정한 요청이 아니다. 예외는 저장소 주인이 정하고 scripts/figma/library.mjs 의 FRAME_EXCEPTIONS 에 적는다(지금: ${Object.keys(table).map((n) => `#${n}`).join(", ") || "없음"})`);
  if (!entry.keys.includes(key)) throw new Error(`--allow-frames #${issue}: ${key} 는 그 요청의 화면이 아니다(${entry.keys.join(", ")})`);
  return { issue: Number(issue), decided: entry.decided, why: entry.why };
}

/**
 * 라이브러리가 이 화면을 다 덮지 못하면 멈출 까닭을 돌려준다. 덮으면 null.
 * - 규칙이 만든 이름이 키 표에 없다(`missingInLibrary`). 예외가 있어도 멈춘다 — 그대로 넘기면 build 가 멈춘다.
 * - 세트는 있는데 맞는 변형이 없다(`unsupported`: 앞 아이콘이 붙은 Input, 최솟값의 NumberInput, Field …).
 *   예전에는 조용히 프레임으로 그렸다(2026-09-22 반박 시험: 장바구니 13곳 가운데 6곳, exit 0). 이제 예외가 없으면 멈춘다.
 */
export function coverageStop({ missingInLibrary = [], unsupported = [] }, exception = null) {
  const lines = [];
  if (missingInLibrary.length) lines.push(`라이브러리에 없는 변형 ${missingInLibrary.length}개: ${[...new Set(missingInLibrary.map((row) => row.name))].join(" · ")}`);
  if (unsupported.length && !exception) {
    const bySet = new Map();
    for (const row of unsupported) {
      const k = `${row.set} — ${row.why}`;
      bySet.set(k, (bySet.get(k) || 0) + 1);
    }
    lines.push(`라이브러리에 맞는 변형이 없는 자리 ${unsupported.length}곳: ${[...bySet].map(([k, n]) => `${k} ×${n}`).join(" · ")}`);
  }
  if (!lines.length) return null;
  lines.push("코드 → 카탈로그 → 라이브러리 순서로 먼저 더한다(docs/process/ai-environment.md 「Figma 화면은 라이브러리로 그린다」)");
  return lines.join("\n");
}

// ── 라이브러리가 코드보다 낡았는가 ───────────────────────────────────────────

/** 세트의 원본 파일. `MultiSelect`→select.tsx, `CheckboxField`→checkbox.tsx, `InputButton`→input-button.tsx. */
export function setSourceFile(set) {
  const base = set.replace(/^Multi(?=[A-Z])/, "").replace(/(?<=.)Field$/, "");
  return `packages/ui/src/${base.replace(/(?<=[a-z])(?=[A-Z])/g, "-").toLowerCase()}.tsx`;
}

/** 원본 파일이 `./x` 로 불러 쓰는 packages/ui/src 파일까지 모은다. NumberInput 은 input.tsx 의 모양도 물려받는다. */
export function sourceClosure(file, read) {
  const seen = new Set();
  const visit = (f) => {
    if (seen.has(f)) return;
    const text = read(f);
    if (text === null) return;
    seen.add(f);
    for (const m of text.matchAll(/from "\.\/([\w-]+)"/g)) {
      const dir = path.posix.dirname(f);
      for (const ext of [".tsx", ".ts"]) if (read(`${dir}/${m[1]}${ext}`) !== null) { visit(`${dir}/${m[1]}${ext}`); break; }
    }
  };
  visit(file);
  return seen;
}

/**
 * 모양에 닿지 않는 차이를 걷어낸 글자. 주석·공백과 JSX 의 `data-*` 속성을 뺀다.
 * 라이브러리를 올린 뒤의 변경 가운데 상당수는 Figma 규칙이 읽을 `data-slot`·`data-shape` 를 더한 것이다
 * (2026-09-22: checkbox·radio·number-input). 그런 파일까지 낡았다고 멈추면 멈춤이 신호가 아니라 소음이 된다.
 * `data-*` 를 CSS 가 고르는 자리(`data-[shape=…]:`)는 class 글자에 남으므로 여기서 걸린다.
 */
export function visualText(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    .map(stripLineComment)
    .join("\n")
    .replace(/\sdata-[\w-]+=(?:"[^"]*"|\{[^{}]*\})/g, "")
    .replace(/\s+/g, "");
}

/** 모든 세트의 모양에 닿는 파일. 토큰 값과 공용 CSS 다. */
export const GLOBAL_SOURCES = [/^packages\/tokens\/src\//, /^packages\/ui\/src\/styles\.css$/];

/**
 * 이 화면이 인스턴스로 쓰는 세트 가운데 모양이 바뀐 원본을 가진 것. `[{ set, files }]`.
 * `visualChanges` 는 라이브러리를 올린 커밋 뒤로 모양이 바뀐 파일(`visualText` 가 다른 것)이다.
 */
export function driftAffects(usedSets, visualChanges, read) {
  const globals = visualChanges.filter((f) => GLOBAL_SOURCES.some((re) => re.test(f)));
  const out = [];
  for (const set of [...new Set(usedSets)].sort()) {
    const closure = sourceClosure(setSourceFile(set), read);
    const files = [...visualChanges.filter((f) => closure.has(f)), ...globals];
    if (files.length) out.push({ set, files });
  }
  return out;
}

/** 조각이 놓을 인스턴스의 세트 키만 싣는다. builder 가 이것으로 `importComponentSetByKeyAsync` 를 부른다. */
export function libraryKeys(nodes, library, acc = {}) {
  for (const n of nodes) {
    if (n.inst) {
      const set = n.inst.slice(0, n.inst.indexOf("/"));
      if (library.sets[set]) acc[set] = library.sets[set].key;
      continue;
    }
    if (n.k) libraryKeys(n.k, library, acc);
  }
  return acc;
}

// 아래는 직접 돌릴 때만 실행한다. 시험과 prepare.mjs 는 위 함수만 불러 쓴다.
const directRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (directRun) {
  const args = process.argv.slice(2);
  const opt = (name) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : undefined; };
  if (args[0] !== "save" || !opt("from")) {
    console.error("사용: node scripts/figma/library.mjs save --from <export-keys.js 응답 JSON> [--out scripts/figma/library.json]");
    process.exit(1);
  }
  const exported = JSON.parse(readFileSync(opt("from"), "utf8"));
  const exportedAt = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });
  const lib = expandExport(exported, { exportedAt });
  const out = opt("out") || LIBRARY_FILE;
  writeFileSync(out, formatLibrary(lib));
  console.log(JSON.stringify({ out: path.relative(process.cwd(), out), sets: Object.keys(lib.sets).length, variants: lib.variants, namesHash: lib.namesHash, builtFrom: lib.builtFrom }, null, 2));
}
