/**
 * `/review-design` 검사 항목 가운데 소스만 읽고 거짓 양성 없이 가를 수 있는 것을 기계로 본다.
 * 판정 기준의 원본은 `plugins/ooee-harness/skills/review-design/SKILL.md`의 「검사 항목」이고 규칙 이름의 번호도
 * 그 번호다. Property 값, 역할과 경계, 정렬, 문구처럼 요청과 문서를 함께 읽어야 하는 항목은
 * 여기서 보지 않으며 `/review-design`이 본다.
 *
 * className을 끝까지 풀 수 없는 요소(`buttonVariants(...)`, prop으로 받은 값, spread)는 판정을
 * 보류한다. 걸리지 않았다고 위반이 없다는 뜻은 아니다.
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * 화면 자리 아래를 재귀로 훑어 `page.tsx` 를 가진 디렉터리를 `screensDir` 기준 상대 경로로 돌려준다.
 * 라우트 그룹 괄호 디렉터리(`(renewal)`)도 들어가므로 key 는 `(renewal)/renewal/admin/voice` 처럼 된다.
 * 한 겹만 훑으면 그 아래 화면이 규칙 검사를 통째로 건너뛴다. 그 구멍이 훑는 자리 두 곳(이 Plugin 의
 * `check-screens.mjs` 와 저장소의 `screen-rules.test.tsx`)에 같이 있었으므로 훑는 자를 여기 한 벌만
 * 두고 둘이 함께 쓴다.
 *
 * `screensDir` 자신은 넣지 않는다. `apps/sandbox/src/app/page.tsx` 는 화면이 아니라 화면 목록이다.
 */
export function screenKeysIn(screensDir) {
  const keys = [];
  const descend = (rel) => {
    for (const entry of readdirSync(rel ? path.join(screensDir, rel) : screensDir, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.name === "node_modules" || entry.name.startsWith(".")) continue;
      const next = rel ? `${rel}/${entry.name}` : entry.name;
      // 화면 아래 화면이 있을 수 있다(`.../admin` 과 `.../admin/voice`). 찾았어도 계속 내려간다.
      if (existsSync(path.join(screensDir, next, "page.tsx"))) keys.push(next);
      descend(next);
    }
  };
  descend("");
  return keys.sort();
}

/**
 * 화면 파일에서 위로 올라가며 저장소 루트를 찾는다. `pnpm-workspace.yaml` 이나 `.git` 이 있는
 * 첫 자리다. 못 찾으면 null 을 돌려주고 부르는 쪽이 옛 규칙으로 돌아간다.
 */
function findRepoRoot(from) {
  let dir = from;
  for (let depth = 0; depth < 12; depth++) {
    if (existsSync(path.join(dir, "pnpm-workspace.yaml")) || existsSync(path.join(dir, ".git"))) return dir;
    const up = path.dirname(dir);
    if (up === dir) return null;
    dir = up;
  }
  return null;
}

/**
 * `typescript` 는 화면을 둔 저장소의 것을 쓴다. Plugin 자체는 의존성을 갖지 않는다.
 * 화면 파일이 있는 자리에서 위로 올라가며 찾고, 없으면 Plugin 이 놓인 자리에서 찾는다.
 */
let ts = null;
function loadTypeScript(fromPath) {
  if (ts) return ts;
  for (const base of [path.resolve(fromPath || "."), path.join(process.cwd(), "package.json"), fileURLToPath(import.meta.url)]) {
    try {
      ts = createRequire(base)("typescript");
      return ts;
    } catch {
      // 다음 자리에서 찾는다
    }
  }
  throw new Error("typescript 를 찾지 못했다. 화면을 둔 저장소에 typescript 가 설치돼 있어야 한다");
}


const PALETTE =
  "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|mauve|mist|olive|taupe";
const PREFIX =
  "border-[xytrblse]|ring-offset|inset-shadow|inset-ring|drop-shadow|text-shadow|bg|text|border|ring|fill|stroke|from|to|via|outline|shadow|decoration|placeholder|accent|caret|divide";
const SHADCN =
  "background|foreground|card|card-foreground|popover|popover-foreground|primary|primary-foreground|secondary|secondary-foreground|muted|muted-foreground|accent|accent-foreground|destructive|destructive-foreground|border|input|ring|sidebar(?:-[\\w-]+)?|chart-\\d+";

const RE_PRIMITIVE = new RegExp(`^(${PREFIX})-(${PALETTE})-(50|[1-9]00|950)$`);
const RE_WHITE_BLACK = new RegExp(`^(${PREFIX})-(white|black)$`);
const RE_OE_TOKEN = new RegExp(`^(${PREFIX})-oe-[\\w-]+$`);
const RE_SHADCN = new RegExp(`^(${PREFIX})-(${SHADCN})$`);
const RE_VAR_REF = /\[var\(--(brand|oe)-|\(--(brand|oe)-/;
const RE_ARBITRARY_COLOR = /\[[^\]]*(#[0-9a-fA-F]{3,8}(?![0-9a-zA-Z])|(rgba?|hsla?|oklch|oklab|lab|lch|color-mix)\()/;
const RE_WHOLE_COLOR = /^\s*(#[0-9a-fA-F]{3,8}|(rgba?|hsla?|oklch|oklab|lab|lch|color-mix)\(.*\))\s*$/;
const RE_BORDER_WIDTH = /^border(-[xytrblse])?(-[1-9]\d*|-\[[^\]]+\])?$/;
const RE_NUMERIC_SIZE = /^(size|w|h)-(\d+(\.\d+)?|px|\[[^\]]+\])$/;
const SLOT_PROPS = /^(trailingElement|leadingElement|leadingIcon|trailingIcon)$/;

// 7: 글자 크기·무게·행간. `text-*` 는 크기와 색 둘 다 쓰는 접두사라 크기 이름만 적어 색을 가린다.
// `text-oe-label` 은 지금 하나뿐인 oe 글자 크기 토큰이고, `text-oe-foreground-*` 는 색이라 잡지 않는다.
// 임의 값은 길이로 읽히는 것만 크기로 본다(`text-[13px]` 은 크기, `text-[#1d4ed8]` 은 색이다).
const RE_FONT_SIZE = /^text-(xs|sm|base|lg|xl|[2-9]xl|oe-label)$/;
const RE_FONT_SIZE_ARBITRARY = /^text-\[(length:[^\]]+|-?\d*\.?\d+(px|rem|em|pt|ch|vw|vh|%))\]$/;
// 계열 이름(`font-mono`)은 크기가 아니므로 무게 이름만 적는다.
const RE_FONT_WEIGHT = /^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black|\[\d+\])$/;
const RE_LINE_HEIGHT = /^leading-[^\s]+$/;

/** `hover:focus-visible:ring-2/50` 을 variant·utility·opacity로 나눈다. 대괄호·괄호 안의 `:` 는 자르지 않는다. */
function splitToken(raw) {
  const variants = [];
  let depth = 0;
  let current = "";
  for (const ch of raw) {
    if (ch === "[" || ch === "(") depth++;
    if (ch === "]" || ch === ")") depth--;
    if (ch === ":" && depth === 0) {
      variants.push(current);
      current = "";
    } else current += ch;
  }
  let utility = current.replace(/^!|!$/g, "").replace(/^-/, "");
  let opacity = null;
  const match = utility.match(/^(.*?)\/(\d+|\[[^\]]+\]|\([^)]+\))$/);
  if (match) {
    utility = match[1];
    opacity = match[2];
  }
  return { variants, utility, opacity, raw };
}

function tokensOf(strings) {
  return strings.flatMap((s) => s.split(/\s+/).filter(Boolean)).map(splitToken);
}

function walk(node, visit, parents = []) {
  visit(node, parents);
  const next = [...parents, node];
  ts.forEachChild(node, (child) => walk(child, visit, next));
}

/**
 * 블록 본문에서 그 함수가 돌려주는 식을 모은다. 중첩 함수(`onClick` 에 넘기는 화살표, 안쪽
 * `.map()` 의 콜백) 안으로는 들어가지 않는다 — 그 `return` 은 이 함수가 돌려주는 것이 아니다.
 * `walk` 로 모으면 손자 요소를 같은 줄에 선 것으로 세고(거짓 양성), 곁에 둔 화살표의 `return`
 * 을 JSX 가 아닌 것으로 읽어 줄 전체를 보류한다(거짓 음성).
 */
function returnedExpressions(block) {
  const out = [];
  const visit = (node) => {
    if (
      ts.isFunctionDeclaration(node) ||
      ts.isFunctionExpression(node) ||
      ts.isArrowFunction(node) ||
      ts.isMethodDeclaration(node) ||
      ts.isGetAccessorDeclaration(node) ||
      ts.isSetAccessorDeclaration(node) ||
      ts.isClassLike(node)
    )
      return;
    if (ts.isReturnStatement(node)) {
      if (node.expression) out.push(node.expression);
      return;
    }
    ts.forEachChild(node, visit);
  };
  ts.forEachChild(block, visit);
  return out;
}

/** `<>`·`<Fragment>`·`<React.Fragment key={…}>` 는 모두 줄에 서지 않고 자식만 세운다. */
const RE_FRAGMENT_TAG = /^(?:[A-Za-z_$][\w$]*\.)?Fragment$/;

function openingOf(node) {
  if (ts.isJsxElement(node)) return node.openingElement;
  if (ts.isJsxSelfClosingElement(node)) return node;
  return undefined;
}

function attributeNamed(el, name) {
  return el.attributes.properties.find((a) => ts.isJsxAttribute(a) && a.name.getText() === name);
}

function attributeNames(el) {
  return el.attributes.properties.filter(ts.isJsxAttribute).map((a) => a.name.getText());
}

function stringValue(attribute) {
  const init = attribute?.initializer;
  if (!init) return undefined;
  if (ts.isStringLiteral(init)) return init.text;
  if (ts.isJsxExpression(init) && init.expression && ts.isStringLiteralLike(init.expression)) return init.expression.text;
  return undefined;
}

/**
 * className 식에서 문자열 조각을 모은다. `cn`·`clsx` 인자, 조건식, 같은 파일의 const는 풀고 나머지는 opaque로 둔다.
 * `gapOf` 처럼 token 목록을 받는 자와 함께 쓰라고 내놓는다.
 */
export function classInfo(el, consts) {
  const strings = [];
  let opaque = false;
  const visit = (e, depth) => {
    if (!e) return;
    if (ts.isStringLiteralLike(e)) strings.push(e.text);
    else if (ts.isTemplateExpression(e)) {
      opaque = true;
      strings.push(e.head.text, ...e.templateSpans.map((span) => span.literal.text));
    } else if (ts.isJsxExpression(e) || ts.isParenthesizedExpression(e)) visit(e.expression, depth);
    else if (ts.isConditionalExpression(e)) {
      visit(e.whenTrue, depth);
      visit(e.whenFalse, depth);
    } else if (ts.isBinaryExpression(e)) {
      visit(e.left, depth);
      visit(e.right, depth);
    } else if (ts.isCallExpression(e)) {
      if (!/^(cn|clsx|cx|twMerge)$/.test(e.expression.getText())) opaque = true;
      e.arguments.forEach((arg) => visit(arg, depth));
    } else if (ts.isArrayLiteralExpression(e)) e.elements.forEach((item) => visit(item, depth));
    else if (ts.isIdentifier(e)) {
      if (e.text === "undefined") return;
      const init = consts.get(e.text);
      if (init && depth < 2) visit(init, depth + 1);
      else opaque = true;
    } else if (!(e.kind === ts.SyntaxKind.FalseKeyword || e.kind === ts.SyntaxKind.NullKeyword)) opaque = true;
  };
  const attribute = attributeNamed(el, "className");
  if (attribute) visit(attribute.initializer, 0);
  return { tokens: tokensOf(strings), opaque };
}

/**
 * 화면 소스 하나를 읽어 AST 와 같은 파일의 `const` 표, 나오는 차례대로의 JSX 요소 목록을 돌려준다.
 * `checkScreenSource` 가 쓰던 얼개를 내놓은 것이며, 도우미(`rowChildren`)를 규칙 없이 시험할 때도
 * 같은 꼴로 쓴다. `elements` 의 각 항목은 `{ node, opening, tag }` 다.
 */
export function parseScreen(source, filePath) {
  loadTypeScript(filePath);
  const sf = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const consts = new Map();
  const elements = [];
  walk(sf, (n) => {
    if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.initializer) consts.set(n.name.text, n.initializer);
    const opening = openingOf(n);
    if (opening) elements.push({ node: n, opening, tag: opening.tagName.getText() });
  });
  return { sf, consts, elements };
}

/**
 * 어떤 JSX 요소의 자식 슬롯을 펴서 실제로 한 줄에 서는 것들을 돌려준다. 가로 flex 줄의 절반 가까이가
 * 버튼을 `{조건 && <X/>}`·`{목록.map(…)}` 안에 두므로, 자식을 그대로 세는 규칙은 그만큼을 조용히
 * 지나친다. Fragment(`<>`·`<Fragment>`·`<React.Fragment key={…}>`), `&&`, 삼항, `.map()`,
 * 중첩 Fragment, 같은 파일의 `const` 를 푼다. `.map()` 의 블록 본문은 그 콜백이 돌려주는 식만
 * 보고 중첩 함수 안으로는 들어가지 않는다.
 *
 * 돌려주는 꼴은 `{ items, opaque }` 다. `items` 의 각 항목은 다음을 갖는다.
 * - `node`·`opening`·`tag` — 요소와 그 여는 태그. 글자 자식은 `opening` 이 `undefined` 이고 `text` 를 갖는다.
 * - `repeated` — `.map()` 이 돌려준 것. 하나로 적혀 있지만 여럿이 선다.
 * - `conditional` — `&&` 나 삼항 안에 있어 설 수도, 서지 않을 수도 있다.
 *
 * 펴지 못한 꼴(`{children}` 처럼 변수 하나만 넘긴 자식, `{render()}`)이 있으면 `opaque` 가 참이다.
 * 그때 `items` 에 담긴 것은 맞지만 그것이 전부는 아니므로, 부르는 쪽은 판정을 보류한다.
 */
export function rowChildren(el, consts = new Map()) {
  loadTypeScript();
  const items = [];
  let opaque = false;
  let host = el;
  if (host && ts.isJsxOpeningElement(host)) host = host.parent;
  if (!host || !(ts.isJsxElement(host) || ts.isJsxFragment(host))) return { items, opaque };

  const pushText = (node, text, flags) => items.push({ node, opening: undefined, tag: null, text, ...flags });
  const visit = (node, flags, depth) => {
    if (!node) return;
    // 너무 깊이 들어가면 푼 것이 실제 줄과 같다고 말할 수 없다. 거기서 멈추고 보류로 넘긴다.
    if (depth > 6) {
      opaque = true;
      return;
    }
    if (ts.isJsxText(node)) {
      if (node.text.trim()) pushText(node, node.text.trim(), flags);
      return;
    }
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
      const opening = openingOf(node);
      const tag = opening.tagName.getText();
      // 이름 있는 Fragment(`<React.Fragment key={…}>`)도 푼다. `.map()` 안에서 형제 둘을 돌려줄
      // 때 `key` 를 받을 수 있는 유일한 꼴이라 실제로 쓰인다(`packages/ui/src/select.tsx`).
      if (RE_FRAGMENT_TAG.test(tag)) {
        if (ts.isJsxElement(node)) node.children.forEach((child) => visit(child, flags, depth + 1));
        return;
      }
      items.push({ node, opening, tag, text: null, ...flags });
      return;
    }
    if (ts.isJsxFragment(node)) {
      node.children.forEach((child) => visit(child, flags, depth + 1));
      return;
    }
    if (ts.isJsxExpression(node) || ts.isParenthesizedExpression(node)) {
      // `{/* 주석 */}` 과 `{}` 는 expression 이 없다. 서는 것이 없으니 보류도 아니다.
      if (node.expression) visit(node.expression, flags, depth + 1);
      return;
    }
    if (ts.isStringLiteralLike(node)) {
      if (node.text.trim()) pushText(node, node.text.trim(), flags);
      return;
    }
    if (ts.isConditionalExpression(node)) {
      visit(node.whenTrue, { ...flags, conditional: true }, depth + 1);
      visit(node.whenFalse, { ...flags, conditional: true }, depth + 1);
      return;
    }
    if (ts.isBinaryExpression(node)) {
      const operator = node.operatorToken.kind;
      if (operator === ts.SyntaxKind.AmpersandAmpersandToken) {
        visit(node.right, { ...flags, conditional: true }, depth + 1);
        return;
      }
      if (operator === ts.SyntaxKind.BarBarToken || operator === ts.SyntaxKind.QuestionQuestionToken) {
        visit(node.left, { ...flags, conditional: true }, depth + 1);
        visit(node.right, { ...flags, conditional: true }, depth + 1);
        return;
      }
      opaque = true;
      return;
    }
    if (ts.isCallExpression(node)) {
      const callee = node.expression;
      const method = ts.isPropertyAccessExpression(callee) ? callee.name.text : null;
      const fn = node.arguments[0];
      const body = fn && (ts.isArrowFunction(fn) || ts.isFunctionExpression(fn)) ? fn.body : undefined;
      if (!(method === "map" || method === "flatMap") || !body) {
        opaque = true;
        return;
      }
      if (!ts.isBlock(body)) {
        visit(body, { ...flags, repeated: true }, depth + 1);
        return;
      }
      const returned = returnedExpressions(body);
      if (!returned.length) opaque = true;
      returned.forEach((value) => visit(value, { ...flags, repeated: true }, depth + 1));
      return;
    }
    if (node.kind === ts.SyntaxKind.NullKeyword || node.kind === ts.SyntaxKind.FalseKeyword || node.kind === ts.SyntaxKind.TrueKeyword) return;
    if (ts.isIdentifier(node)) {
      if (node.text === "undefined") return;
      const init = consts.get(node.text);
      if (init && depth < 4) visit(init, flags, depth + 1);
      else opaque = true;
      return;
    }
    opaque = true;
  };

  host.children.forEach((child) => visit(child, { repeated: false, conditional: false }, 0));
  return { items, opaque };
}

/** Tailwind 기본 간격 한 칸은 `0.25rem` 이고 `rem` 은 화면 기본 글자 크기 `16px` 이다. */
const SPACING_STEP_PX = 4;
const REM_PX = 16;
// `gap-x` 를 `gap` 보다 앞에 두어야 `gap-x-1.5` 의 값을 `x-1.5` 로 읽지 않는다.
const RE_GAP = /^(gap-x|space-x|gap)-(.+)$/;

/** `6px`·`0.375rem` 같은 임의 값을 픽셀로 읽는다. 단위가 상황에 따라 달라지는 것은 읽지 않는다. */
function lengthToPx(text) {
  const match = /^(\d+(?:\.\d+)?)(px|rem)$/.exec(text.trim());
  if (!match) return null;
  return Number(match[1]) * (match[2] === "rem" ? REM_PX : 1);
}

/** 가로 간격을 정하는 utility 면 그 값 조각을 돌려준다. 세로 간격(`gap-y-2`)과 그 밖은 `null` 이다. */
function horizontalGapValue(utility) {
  const match = RE_GAP.exec(utility);
  if (!match) return null;
  return match[1] === "gap" && match[2].startsWith("y-") ? null : match[2];
}

/** `gap-1.5`·`gap-px`·`gap-[6px]` 의 값 조각을 픽셀로 읽는다. */
function gapValueToPx(value) {
  if (value === "px") return 1;
  if (value.startsWith("[") && value.endsWith("]")) return lengthToPx(value.slice(1, -1).replace(/_/g, " "));
  if (/^\d+(\.\d+)?$/.test(value)) return Number(value) * SPACING_STEP_PX;
  // `gap-oe-…` 처럼 토큰을 가리키는 것은 소스만으로 값을 알 수 없다.
  return null;
}

/**
 * class 목록에서 가로 간격을 읽어 픽셀 수로 돌려준다. `gap-1.5`·`gap-x-1.5`·`space-x-1.5`·`gap-[6px]` 를
 * 모두 `6` 으로 읽어 저장소에 섞여 있는 두 꼴을 같은 자로 잰다. 없으면 `null`, 읽을 수 없으면 `"unknown"`
 * 이다. 인수는 class 문자열이어도 되고 `classInfo(...).tokens` 여도 된다.
 *
 * 읽을 수 없는 것으로 넘기는 것: 상황마다 달라지는 간격(`sm:gap-2`), 음수(`-space-x-1`),
 * 토큰을 가리키는 값(`gap-oe-…`), `px`·`rem` 이 아닌 단위와 `calc(…)`. 세로 간격(`gap-y-*`)은 이 자의
 * 대상이 아니므로 없는 것으로 읽는다. `gap-2 gap-x-1.5` 처럼 두 값이 어긋나면 생성된 CSS 의 차례가
 * 무엇을 이기는지 소스만으로 정할 수 없으므로 읽을 수 없는 것으로 둔다.
 */
export function gapOf(classes) {
  const list = Array.isArray(classes) ? classes : [classes];
  const tokens = list
    .flatMap((item) => (typeof item === "string" ? tokensOf([item]) : item && typeof item.utility === "string" ? [item] : []))
    .map((token) => ({ token, value: horizontalGapValue(token.utility) }))
    .filter((entry) => entry.value !== null);
  if (!tokens.length) return null;
  if (tokens.some(({ token }) => token.variants.length || token.raw.trimStart().startsWith("-"))) return "unknown";
  const values = new Set();
  for (const { value } of tokens) {
    const px = gapValueToPx(value);
    if (px === null) return "unknown";
    values.add(px);
  }
  return values.size === 1 ? [...values][0] : "unknown";
}

/** `docs/system/README.md` 「Component」 표에서 상태가 `초안`인 행의 이름을 export 이름 꼴(`MessageComposer`)로 돌려준다. */
export function draftComponentNames(readme) {
  const section = readme.split(/^## Component$/m)[1]?.split(/^## /m)[0] ?? "";
  return [...section.matchAll(/^\| ([^|]+?) \| 초안 \|/gm)].map((m) => m[1].replace(/\s+/g, ""));
}

/**
 * 화면 소스 하나를 검사한다. `filePath` 는 상대 import가 `packages/ui`·`apps/studio`로 풀리는지 볼 때만 쓴다.
 * `drafts` 는 `draftComponentNames` 의 결과다.
 */
export function checkScreenSource(source, filePath, drafts) {
  const { sf, consts } = parseScreen(source, filePath);
  const hits = [];
  const add = (rule, node, detail) =>
    hits.push({ rule, line: typeof node === "number" ? node : sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1, detail });

  // 1·2: 모듈 경로와 지시문을 뺀 모든 문자열
  walk(sf, (n, parents) => {
    if (!(ts.isStringLiteralLike(n) || ts.isTemplateHead(n) || ts.isTemplateMiddle(n) || ts.isTemplateTail(n))) return;
    const parent = parents[parents.length - 1];
    if (parent && (ts.isImportDeclaration(parent) || ts.isExportDeclaration(parent))) return;
    if (parent && ts.isExpressionStatement(parent)) return;
    const text = n.text;
    for (const token of tokensOf([text])) {
      if (RE_PRIMITIVE.test(token.utility) || RE_WHITE_BLACK.test(token.utility)) add("1 raw primitive color", n, token.raw);
      else if (RE_OE_TOKEN.test(token.utility) && token.opacity) add("1 raw primitive color", n, `${token.raw} (oe 토큰에 opacity)`);
      else if (RE_ARBITRARY_COLOR.test(token.raw)) add("1 raw primitive color", n, token.raw);
      if (RE_SHADCN.test(token.utility)) add("2 shadcn visual token", n, token.raw);
    }
    if (RE_VAR_REF.test(text)) add("1 raw primitive color", n, `${text.match(RE_VAR_REF)?.[0]} (변수 직접 참조)`);
    const attribute = parent && ts.isJsxAttribute(parent) ? parent.name.getText() : undefined;
    if (RE_WHOLE_COLOR.test(text) && !(attribute && /^(href|id|key|htmlFor|aria-.*|data-.*)$/.test(attribute)))
      add("1 raw primitive color", n, JSON.stringify(text));
  });

  const iconNames = new Set();
  walk(sf, (n) => {
    if (!ts.isImportDeclaration(n) || !ts.isStringLiteral(n.moduleSpecifier) || n.moduleSpecifier.text !== "@remixicon/react") return;
    const bindings = n.importClause?.namedBindings;
    if (bindings && ts.isNamedImports(bindings)) bindings.elements.forEach((e) => iconNames.add(e.name.text));
  });
  const isIcon = (el) => ts.isIdentifier(el.tagName) && iconNames.has(el.tagName.text);

  // 7: `@ooee/ui` 에서 가져온 이름. 규칙 14 가 보는 것과 같은 import 다.
  const uiNames = new Set();
  walk(sf, (n) => {
    if (!ts.isImportDeclaration(n) || !ts.isStringLiteral(n.moduleSpecifier) || n.moduleSpecifier.text !== "@ooee/ui") return;
    const bindings = n.importClause?.namedBindings;
    if (bindings && ts.isNamedImports(bindings)) bindings.elements.forEach((e) => uiNames.add(e.name.text));
  });
  /** `Field.Label` 처럼 점으로 이은 태그는 앞의 이름으로 가린다. */
  const tagRoot = (tagName) => {
    let node = tagName;
    while (ts.isPropertyAccessExpression(node)) node = node.expression;
    return ts.isIdentifier(node) ? node.text : null;
  };

  walk(sf, (node, parents) => {
    const el = openingOf(node);
    if (!el) return;
    const tag = el.tagName.getText();
    const intrinsic = /^[a-z]/.test(tag);
    const names = attributeNames(el);
    const hasSpread = el.attributes.properties.some(ts.isJsxSpreadAttribute);
    const cls = classInfo(el, consts);
    const insideSlot = parents.some((p) => ts.isJsxAttribute(p) && SLOT_PROPS.test(p.name.getText()));
    const owner = parents[parents.length - 2];
    const isRenderValue = !!owner && ts.isJsxAttribute(owner) && owner.name.getText() === "render";

    // 3: 이동하는 자리를 바꾼 <button>. 핸들러도 submit·reset도 없는 native button
    if (tag === "button") {
      const typeAttribute = attributeNamed(el, "type");
      const type = stringValue(typeAttribute);
      const hold = hasSpread || isRenderValue || (typeAttribute && type === undefined) || names.includes("disabled");
      const hasHandler = names.some((name) => /^on[A-Z]/.test(name));
      if (!hold && !hasHandler && type !== "submit" && type !== "reset")
        add("3 기존 ooee 컴포넌트 재사용", el, `onClick도 type="submit"도 없는 <button> — 링크면 <a href="#">`);
    }

    // 5: 키보드로 가는 native 요소의 Focus
    const tabIndex = attributeNamed(el, "tabIndex")?.initializer?.getText() ?? "";
    if (intrinsic && (tag === "a" || tag === "button" || (names.includes("tabIndex") && !/-1/.test(tabIndex))) && !cls.opaque && !hasSpread && !isRenderValue) {
      const focusVisible = cls.tokens.some((t) => t.variants.some((v) => v.includes("focus-visible")));
      const focusOnly = cls.tokens.filter((t) => t.variants.at(-1) === "focus" && /^(ring|outline|border|shadow)/.test(t.utility));
      if (!focusVisible && focusOnly.length) add("5 Focus", el, `focus:만 있고 focus-visible: 없음 — ${focusOnly.map((t) => t.raw).join(" ")}`);
      else if (!focusVisible) add("5 Focus", el, `<${tag}>에 focus-visible: 표시 없음`);
      const ring2 = cls.tokens.some((t) => t.variants.includes("focus-visible") && /^ring-(2|\[2px\])$/.test(t.utility));
      const offset = cls.tokens.some(
        (t) => (t.variants.length === 0 || t.variants.includes("focus-visible")) && /^ring-offset-([2-9]|\d{2,}|\[[^\]]+\])$/.test(t.utility),
      );
      const bordered = cls.tokens.some((t) => t.variants.length === 0 && RE_BORDER_WIDTH.test(t.utility));
      if (ring2 && !offset && !bordered && !insideSlot) add("5 Focus", el, `<${tag}>의 focus-visible:ring-2에 ring-offset-2 없음`);
    }

    // 7: `@ooee/ui` 컴포넌트가 정한 글자 크기·무게·행간을 화면에서 className으로 덮어쓴 것
    const uiTag = tagRoot(el.tagName);
    if (uiTag && uiNames.has(uiTag) && !cls.opaque) {
      const typography = cls.tokens.filter(
        (t) =>
          RE_FONT_SIZE.test(t.utility) ||
          RE_FONT_SIZE_ARBITRARY.test(t.utility) ||
          RE_FONT_WEIGHT.test(t.utility) ||
          RE_LINE_HEIGHT.test(t.utility),
      );
      if (typography.length)
        add(
          "7 컴포넌트 글자 크기",
          el,
          `${tag}에 className으로 ${typography.map((t) => t.raw).join(" ")} — 글자 크기·무게·행간은 controlSize 같은 Property가 정한다`,
        );
    }

    // 13: 아이콘
    if (isIcon(el)) {
      const sized = cls.tokens.filter((t) => RE_NUMERIC_SIZE.test(t.utility));
      if (sized.length) add("13 아이콘", el, `${tag}에 숫자 크기 ${sized.map((t) => t.raw).join(" ")} — size-oe-icon-*`);
      if (names.includes("size")) add("13 아이콘", el, `${tag}에 size 속성 — size-oe-icon-*`);
      if (!names.includes("aria-hidden") && !names.includes("aria-label") && !names.includes("title"))
        add("13 아이콘", el, `${tag}에 aria-hidden 없음`);
    }
    if (intrinsic && (tag === "button" || tag === "a") && ts.isJsxElement(node) && !cls.opaque) {
      let icons = 0;
      let other = 0;
      const scan = (child) => {
        if (ts.isJsxText(child)) {
          if (child.text.trim()) other++;
        } else if (ts.isJsxExpression(child)) {
          if (child.expression) scan(child.expression);
        } else if (ts.isParenthesizedExpression(child)) scan(child.expression);
        else if (ts.isConditionalExpression(child)) {
          scan(child.whenTrue);
          scan(child.whenFalse);
        } else {
          const opening = openingOf(child);
          if (opening && isIcon(opening)) icons++;
          else other++;
        }
      };
      node.children.forEach(scan);
      const hover = cls.tokens.some((t) => t.variants.at(-1) === "hover" && /^bg-oe-interaction-hover(-subtle)?$/.test(t.utility));
      if (icons > 0 && other === 0 && !hover) add("13 아이콘", el, `아이콘만 든 <${tag}>에 hover:bg-oe-interaction-hover 없음`);
    }
  });

  // 12·14: import
  // 저장소 루트를 「화면 파일에서 다섯 단계 위」로 박아 두면 `apps/sandbox/src/app` 이 아닌
  // `screens_dir` 에서는 엉뚱한 곳을 가리켜 아래 검사가 조용히 빠진다. 이 Plugin 은 화면 자리를
  // 설정값으로 받으므로 그 일이 실제로 생긴다. 위로 올라가며 표시를 찾고, 못 찾으면 옛 규칙을 쓴다.
  const repo = findRepoRoot(path.dirname(filePath)) ?? path.resolve(path.dirname(filePath), "../../../../..");
  walk(sf, (n) => {
    if (!(ts.isImportDeclaration(n) || ts.isExportDeclaration(n)) || !n.moduleSpecifier || !ts.isStringLiteral(n.moduleSpecifier)) return;
    const spec = n.moduleSpecifier.text;
    const resolved = spec.startsWith(".") ? path.resolve(path.dirname(filePath), spec) : "";
    if (/^next\/(link|navigation|router)$/.test(spec)) add("12 import 경계", n, spec);
    else if (/(^|\/)packages\/ui\/src(\/|$)/.test(spec) || /^@ooee\/ui\/./.test(spec) || resolved.startsWith(path.join(repo, "packages/ui")))
      add("12 import 경계", n, `${spec} — @ooee/ui에서만 가져온다`);
    else if (/(^|\/)apps\/studio(\/|$)/.test(spec) || /^@ooee\/studio(\/|$)/.test(spec) || resolved.startsWith(path.join(repo, "apps/studio")))
      add("12 import 경계", n, spec);
    if (spec !== "@ooee/ui" || !ts.isImportDeclaration(n)) return;
    const bindings = n.importClause?.namedBindings;
    if (!bindings || !ts.isNamedImports(bindings)) return;
    for (const e of bindings.elements) {
      const original = (e.propertyName ?? e.name).text;
      const draft = drafts.find((name) => original.startsWith(name));
      if (draft) add("14 초안 컴포넌트", e, `${original} — README 「Component」 표에서 초안`);
    }
  });

  // 머리말: 요청 문단을 담은 블록 주석
  const first = sf.statements.find((s) => !(ts.isExpressionStatement(s) && ts.isStringLiteral(s.expression)));
  const before = first ? sf.statements.slice(0, sf.statements.indexOf(first)) : [];
  const ranges = ts.getLeadingCommentRanges(source, before.length ? before[before.length - 1].end : 0) ?? [];
  const header = ranges
    .filter((r) => r.kind === ts.SyntaxKind.MultiLineCommentTrivia)
    .map((r) => source.slice(r.pos, r.end))
    .join("\n");
  if (!/[가-힣]/.test(header)) add("머리말", first ?? 1, "첫 import 앞에 요청 문단을 담은 한국어 블록 주석이 없음");

  return hits.sort((a, b) => a.line - b.line);
}

const RE_ENGLISH_SENTENCE = /(^|[^A-Za-z])(the|an|as|is|are|has|have|shows|renders|should|with|when|and|of|to|for|be)([^A-Za-z]|$)/i;

/**
 * 화면 테스트의 `test`·`it`·`describe` 이름이 한국어 문장이 아니면 걸린다(`/generate-code` 4단계).
 * 한글이 없거나, `shows 지원요청 as the screen heading`처럼 영어 기능어로 문장을 짠 이름이다.
 * `heading으로 잡힌다`처럼 한국어 문장에 섞인 용어는 걸리지 않는다.
 */
export function checkTestTitles(source, filePath) {
  loadTypeScript(filePath);
  const sf = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const hits = [];
  walk(sf, (n) => {
    if (!ts.isCallExpression(n) || !/^(test|it|describe)(\.(only|skip|todo))?$/.test(n.expression.getText())) return;
    const title = n.arguments[0];
    if (title && ts.isStringLiteralLike(title) && (!/[가-힣]/.test(title.text) || RE_ENGLISH_SENTENCE.test(title.text)))
      hits.push({ rule: "테스트 이름", line: sf.getLineAndCharacterOfPosition(title.getStart(sf)).line + 1, detail: `${JSON.stringify(title.text)} — 한국어로 쓴다` });
  });
  return hits;
}

/** 저장소의 README를 읽어 `checkScreenSource` 를 부른다. */
export function checkScreenFile(filePath, readmePath) {
  return checkScreenSource(readFileSync(filePath, "utf8"), filePath, draftComponentNames(readFileSync(readmePath, "utf8")));
}
