/**
 * `/review-design` 검사 항목 가운데 소스만 읽고 거짓 양성 없이 가를 수 있는 것을 기계로 본다.
 * 판정 기준의 원본은 `.claude/skills/review-design/SKILL.md`의 「검사 항목」이고 규칙 이름의 번호도
 * 그 번호다. Property 값, 역할과 경계, 정렬, 문구처럼 요청과 문서를 함께 읽어야 하는 항목은
 * 여기서 보지 않으며 `/review-design`이 본다.
 *
 * className을 끝까지 풀 수 없는 요소(`buttonVariants(...)`, prop으로 받은 값, spread)는 판정을
 * 보류한다. 걸리지 않았다고 위반이 없다는 뜻은 아니다.
 */

import { readFileSync } from "node:fs";
import path from "node:path";

import ts from "typescript";

export type RuleHit = { rule: string; line: number; detail: string };

type ClassToken = { variants: string[]; utility: string; opacity: string | null; raw: string };
type ClassInfo = { tokens: ClassToken[]; opaque: boolean };

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

/** `hover:focus-visible:ring-2/50` 을 variant·utility·opacity로 나눈다. 대괄호·괄호 안의 `:` 는 자르지 않는다. */
function splitToken(raw: string): ClassToken {
  const variants: string[] = [];
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
  let opacity: string | null = null;
  const match = utility.match(/^(.*?)\/(\d+|\[[^\]]+\]|\([^)]+\))$/);
  if (match) {
    utility = match[1];
    opacity = match[2];
  }
  return { variants, utility, opacity, raw };
}

function tokensOf(strings: string[]): ClassToken[] {
  return strings.flatMap((s) => s.split(/\s+/).filter(Boolean)).map(splitToken);
}

function walk(node: ts.Node, visit: (node: ts.Node, parents: ts.Node[]) => void, parents: ts.Node[] = []) {
  visit(node, parents);
  const next = [...parents, node];
  ts.forEachChild(node, (child) => walk(child, visit, next));
}

function openingOf(node: ts.Node): ts.JsxOpeningLikeElement | undefined {
  if (ts.isJsxElement(node)) return node.openingElement;
  if (ts.isJsxSelfClosingElement(node)) return node;
  return undefined;
}

function attributeNamed(el: ts.JsxOpeningLikeElement, name: string): ts.JsxAttribute | undefined {
  return el.attributes.properties.find((a): a is ts.JsxAttribute => ts.isJsxAttribute(a) && a.name.getText() === name);
}

function attributeNames(el: ts.JsxOpeningLikeElement): string[] {
  return el.attributes.properties.filter(ts.isJsxAttribute).map((a) => a.name.getText());
}

function stringValue(attribute: ts.JsxAttribute | undefined): string | undefined {
  const init = attribute?.initializer;
  if (!init) return undefined;
  if (ts.isStringLiteral(init)) return init.text;
  if (ts.isJsxExpression(init) && init.expression && ts.isStringLiteralLike(init.expression)) return init.expression.text;
  return undefined;
}

/** className 식에서 문자열 조각을 모은다. `cn`·`clsx` 인자, 조건식, 같은 파일의 const는 풀고 나머지는 opaque로 둔다. */
function classInfo(el: ts.JsxOpeningLikeElement, consts: Map<string, ts.Expression>): ClassInfo {
  const strings: string[] = [];
  let opaque = false;
  const visit = (e: ts.Node | undefined, depth: number): void => {
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

/** `docs/system/README.md` 「Component」 표에서 상태가 `초안`인 행의 이름을 export 이름 꼴(`MessageComposer`)로 돌려준다. */
export function draftComponentNames(readme: string): string[] {
  const section = readme.split(/^## Component$/m)[1]?.split(/^## /m)[0] ?? "";
  return [...section.matchAll(/^\| ([^|]+?) \| 초안 \|/gm)].map((m) => m[1].replace(/\s+/g, ""));
}

/**
 * 화면 소스 하나를 검사한다. `filePath` 는 상대 import가 `packages/ui`·`apps/studio`로 풀리는지 볼 때만 쓴다.
 * `drafts` 는 `draftComponentNames` 의 결과다.
 */
export function checkScreenSource(source: string, filePath: string, drafts: string[]): RuleHit[] {
  const sf = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const hits: RuleHit[] = [];
  const add = (rule: string, node: ts.Node | number, detail: string) =>
    hits.push({ rule, line: typeof node === "number" ? node : sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1, detail });

  const consts = new Map<string, ts.Expression>();
  walk(sf, (n) => {
    if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.initializer) consts.set(n.name.text, n.initializer);
  });

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

  const iconNames = new Set<string>();
  walk(sf, (n) => {
    if (!ts.isImportDeclaration(n) || !ts.isStringLiteral(n.moduleSpecifier) || n.moduleSpecifier.text !== "@remixicon/react") return;
    const bindings = n.importClause?.namedBindings;
    if (bindings && ts.isNamedImports(bindings)) bindings.elements.forEach((e) => iconNames.add(e.name.text));
  });
  const isIcon = (el: ts.JsxOpeningLikeElement) => ts.isIdentifier(el.tagName) && iconNames.has(el.tagName.text);

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
      const scan = (child: ts.Node): void => {
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
  // filePath 는 `<저장소>/apps/sandbox/src/app/<key>/page.tsx` 다.
  const repo = path.resolve(path.dirname(filePath), "../../../../..");
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
export function checkTestTitles(source: string, filePath: string): RuleHit[] {
  const sf = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const hits: RuleHit[] = [];
  walk(sf, (n) => {
    if (!ts.isCallExpression(n) || !/^(test|it|describe)(\.(only|skip|todo))?$/.test(n.expression.getText())) return;
    const title = n.arguments[0];
    if (title && ts.isStringLiteralLike(title) && (!/[가-힣]/.test(title.text) || RE_ENGLISH_SENTENCE.test(title.text)))
      hits.push({ rule: "테스트 이름", line: sf.getLineAndCharacterOfPosition(title.getStart(sf)).line + 1, detail: `${JSON.stringify(title.text)} — 한국어로 쓴다` });
  });
  return hits;
}

/** 저장소의 README를 읽어 `checkScreenSource` 를 부른다. */
export function checkScreenFile(filePath: string, readmePath: string): RuleHit[] {
  return checkScreenSource(readFileSync(filePath, "utf8"), filePath, draftComponentNames(readFileSync(readmePath, "utf8")));
}
