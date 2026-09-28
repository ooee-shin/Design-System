// `docs/system` 이 코드와 맞는지 잰다. 고치지 않고 알린다.
//
//   node scripts/docs/system-drift.mjs            # 보고를 찍고 어떤 경우에도 exit 0
//   node scripts/docs/system-drift.mjs --strict   # 어긋남이나 못 읽은 곳이 있으면 exit 1
//
// 하네스는 `docs/system` 을 읽어 화면을 만든다. 문서가 코드와 어긋나면 화면이 어긋난다. `2026-09-27` 개발자 결정 —
// 하네스는 문서를 고치지 않고, 문서가 코드와 맞는지 재는 도구를 둔다. 문서의 주인은 기획자라 이 도구는 어긋난 자리를
// 이름·행 번호로 짚기만 하고 막지 않는다. 막을 자리가 생기면 `--strict` 를 붙인다.
//
// 도구의 약속 셋.
// 1. 기본 실행은 어떤 경우에도 exit 0 이다. 파일이 없으면 「? <짝 이름> — 못 읽었다 — <경로>: 파일을 읽지 못했다」 로 알리고 넘어가며(`read` 한 곳에서 잡는다),
//    짝 하나가 예외를 내면 그 짝만 「도구 오류」 로 내고 나머지를 잰다. `main` 도 예외를 잡아 「도구 오류: …」 한 줄을 낸다.
// 2. 조용히 통과하지 않는다. 재기로 한 짝은 「= 같다」「⚠ 다르다」「? 못 읽었다」 셋 중 하나로 반드시 보고된다. 비교마다
//    기대하는 문장·표를 **하나씩** 찾고, 하나라도 못 찾으면 「못 읽었다 — <파일>:<무엇을 찾다가>」 로 낸다. 문장은 절 안에서만
//    읽는다(제목으로 잘라서, 펜스 안의 `#` 줄은 제목이 아니다). 표는 머리 행의 열 수·이름을 확인하며, 펜스·표·목록 안에서
//    꼴에 안 맞는 줄은 그 줄을 가리켜 알린다. 여러 짝이 같은 디렉터리·파일을 읽어도 짝마다 제 이름으로 「못 읽었다」 를 낸다.
//    기획자가 문장을 고쳐 정규식이 빗나갔을 때 「같다」 로 넘어가지 않게 하는 장치다 — 그때는 개발자가 정규식을 고친다.
//    `paragraphsOf` 는 문서를 문단 단위로 읽어(줄바꿈이 문장을 가르지 않게) 세 곳이 쓴다 — 경로가 든 문장의 미래 판정(parseDocPaths),
//    「참고」 후보 판정(proseValueClaims), 열거 줄 판정(unmeasuredEnumLines). 어느 짝도 문단의 주장을 재지는 않는다.
//    - 재는 것은 구조(목록·표·상수·열거·경로)와, **정해진 문장 꼴**로 숫자·개수·이름을 말하는 산문 자리 몇 곳이다. 산문 자리는 절 안에서
//      그 꼴 하나를 정규식으로 찍어 읽고(「최소값은 Npx」「셋부터 N까지」「`BADGE_COLORS` 의 N색」「값은 `a`과 `b`다」「확정 N종」「다음 값만 생성한다: `…`」 등),
//      꼴이 빗나가면 ? 다. 산문의 색 값 주장은 재지 않고(2026-09-27, NOT_MEASURED 에 까닭) 그 주장이 든 문단(표 행 포함)의 첫 행을 「참고」 에
//      파일:행으로만 모은다.
//    - Properties 열거 줄: 재는 꼴은 「- `prop`(, `prop`)*: `a | b | …`」 — 값 자리에 `|` 가 든 백틱 묶음이 **정확히 하나**. 값 묶음이 둘 이상이거나 값 묶음 바로 뒤에
//      이음말 「또는·이나·및·혹은·그리고·과·와·,·/··;」 로 백틱 이름이 이어지면 ?(「값 묶음이 둘 이상이라 한 목록으로 읽지 못했다」). prop 백틱 이름이 없는 `|` 목록 줄
//      (「- 방향: `a | b`」)은 「재지 않는 것」 에 파일:행으로. 이 판정은 parseDocEnums 와 unmeasuredEnumLines 가 같은 함수(`classifyEnumLine`)로 한다.
//      코드 쪽 유니온은 `;`·빈 줄·`|` 로 시작하지 않는 줄까지 이어 읽고, 멤버 가운데 `"…"`(inline 은 `"…" as const` 도)·숫자가 아닌 것이 하나라도
//      있으면(`| (string & {})`·`| LayoutName`·`boolean | "auto"`) 값 집합을 확정할 수 없으므로 못 읽음이다. cva 키는 따옴표를 허용한다.
//    - color.md 「제안하는 최소 역할」 펜스의 `{role}`: roles = 라벨 줄의 영문 낱말 ∩ (parseCoreSemanticTokens 의 role 집합 ∪ {brand}). 교집합에서 빠진 영문 낱말이
//      하나라도 있으면(예: status·role) 그 라벨 줄을 ? 로 낸다. roles 가 비면 `{role}` 줄들도 ? 다. `oe-` 줄은 「oe-이름( / 접미)*」 꼴이어야 하고 자리표시자는 `{role}` 만
//      허용한다 — 아니면 그 줄이 ? 다. 다른 자리표시자(「oe-{property}-{hierarchy}」)가 든 줄은 이름을 짓지 않고 그 꼴에 맞는 이름을 양쪽 비교와 참고에서 뺀다(`except`).
//      축약(「/ secondary」)과 깨진 줄이 말하던 이름의 접두 추정은 `expandAbbreviation` 한 곳에서만 한다 — 첫 이름의 family(`familyOf`: 「oe-」 뒤 첫 낱말; 그 낱말이 코드의
//      role 이거나 `{role}` 이면 그 뒤 property 까지 — 「oe-danger-foreground-primary / secondary」 → oe-danger-foreground-secondary)를 붙이고, 조각이 이미 `oe-` 로
//      시작하면 그대로 이름이다. family 를 잴 수 없으면 추정하지 않고 그 줄을 ? 로 내며 말했을 수 있는 이름을 모두 ⚠ 에서 뺀다.
//      펜스 줄을 하나도 못 읽었으면 ? 만 내고 그 위에 「role 을 안 적었다」 같은 ⚠ 를 얹지 않는다(못 읽음 하나로 충분하다).
//    - 못 읽는 파일: systemDocs / componentDocs 가 목록에는 있는데 읽지 못한 파일(디렉터리·권한·깨진 링크)은 그 파일을 읽는 **짝마다** 「? <짝 이름> — 못 읽었다 —
//      <경로>: 파일을 읽지 못했다」 를 낸다(H1·메타줄 짝은 「<key>.md 제목·메타줄」, 열거 짝은 ENUM_TABLE 에 있는 컴포넌트면 「<key> 열거값」 으로 자리를 좁힌다).
//      조용히 필터하지 않는다.
// 3. 다른 검사가 이미 재는 것은 다시 재지 않는다(`NOT_MEASURED` 에 어느 시험이 재는지 적는다). 재지 않기로 한 것도 이름을 대고
//    적는다 — 컴포넌트 문서에서 값에 `|` 가 든 목록 줄(`-`·`*`·`1.` 표지, 콜론 유무 무관)을 모두 잡아, 「- `prop`: `a | b`」 꼴이 아니거나
//    「## Properties」 절 밖이거나 `ENUM_TABLE` 에 읽는 법이 없는 줄은 실행 때 파일:행으로 「재지 않는 것」 에 낸다. 산문의 색 값 주장은 재지 않는
//    까닭을 `NOT_MEASURED` 에 적고, 그 주장이 든 문단(표 행 포함)의 첫 행을 파일:행으로 「참고」 에 모아 사람이 훑게 낸다(`proseValueNote`).
//
// 읽는 것은 원문이다. `scripts/harness/studio-links.test.mjs` 가 sandbox 의 표를 원문에서 정규식으로 읽어 대조하는 것과
// 같은 꼴이며, `import` 하지 않는 까닭은 `node scripts/docs/system-drift.mjs` 가 tsx 없이 돌아야 하고, 타입 유니온과
// Tailwind 클래스처럼 런타임에 없는 값도 재야 하기 때문이다. 코드 쪽 정규식은 각 파일의 지금 꼴(한 줄 한 항목,
// `export const X = [...] as const`)에 기댄다. 순수 함수(원문 → 추출값)와 비교 함수(두 값 → 어긋남 목록)를 export 하고,
// `measure(root)` 가 파일을 읽어 그것을 부른다. 시험(`system-drift.test.mjs`)은 임시 폴더에 최소 저장소를 써서 짝마다
// 같다·다르다·못 읽었다 셋을 고정하며, 오늘 저장소의 어긋남 목록·개수·이름은 단정하지 않는다.
//
// 어긋남 한 줄의 꼴: ⚠ <무엇> — 코드 <X> vs 문서 <Y> (<코드 파일>:<행> · <문서 파일>:<행>)
// 못 읽은 한 줄의 꼴: ? <무엇> — 못 읽었다 — <파일>:<행>: <무엇을 찾다가>
// 같은 짝 한 줄의 꼴: = <짝 이름>
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

/** 읽는 파일. 어긋남 보고의 `파일:행` 이 이 경로를 쓴다. 모두 읽기만 한다. */
export const FILES = Object.freeze({
  registry: "apps/studio/src/components/component-registry.ts",
  studioComponents: "apps/studio/src/app/components",
  studioFoundations: "apps/studio/src/app/foundations",
  uiIndex: "packages/ui/src/index.ts",
  uiSrc: "packages/ui/src",
  tokens: "packages/tokens/src/index.ts",
  tokensCss: "packages/tokens/src/styles.css",
  readme: "docs/system/README.md",
  systemDocs: "docs/system",
  foundationDocs: "docs/system/foundations",
  componentDocs: "docs/system/components",
  tokensDoc: "docs/system/tokens.md",
  colorDoc: "docs/system/foundations/color.md",
  iconDoc: "docs/system/foundations/icon.md",
  catalogDoc: "docs/system/foundations/catalog.md",
  interactionDoc: "docs/system/interaction.md",
  llms: "llms.txt",
});

const SELF = "scripts/docs/system-drift.mjs";

/** 재지 않는 것과 그 까닭. 보고 끝에 한 줄씩 낸다. 다른 시험이 이미 재는 짝은 어느 시험인지 적는다. */
export const NOT_MEASURED = Object.freeze([
  "README 컴포넌트 표 순서 ↔ registry 순서 — docs/system/studio.md 가 title 알파벳순을 정하지만 이 도구는 아직 재지 않는다",
  "CheckboxField 최소 높이 36px ↔ checkbox.md 산문 — 값은 token(oe-control-regular)이 소유하고 문서는 단계 이름을 적으므로, interaction.md 짝이 token 값을 재는 것으로 갈음한다",
  "문서에만 있는 가상 이름(oe-media-*, overlay 템플릿) — 문서가 미래 검토 항목으로 명시한 이름이라 코드에 없는 것이 어긋남이 아니다",
  "switch controlSize(small·medium·large) ↔ switch.md 「### Size」 절 — 문서가 「- `small`: Control `26×16px` …」 로 단계마다 서술하고 「- `controlSize`: `a | b`」 열거 줄이 없어 재지 않는다(그 밖의 Properties 열거 줄은 ENUM_TABLE 로 모두 재며, 표에 없는 줄은 아래에 줄 번호로 낸다)",
  "Tailwind 별칭 --color-oe-* ↔ --oe-* 원본, 코드가 쓰는 별칭 클래스 ↔ @theme 선언 — 문서 대응이 없는 코드 안 정합이라 packages/tokens 의 시험 자리다",
  "registry 확정 ↔ href·page.tsx 존재·componentKey, 초안 ↔ href 없음 — apps/studio component-registry.test.ts 가 이미 잰다(이 도구는 registry 에 없는 Studio 디렉터리만 본다)",
  "sandbox STUDIO_DOC_KEYS ↔ Studio 디렉터리·하네스 복사본 — apps/sandbox component-map.test.tsx 와 scripts/harness/studio-links.test.mjs 가 이미 잰다",
  "llms.txt 확정 목록 ↔ registry 확정 key — scripts/docs/llms-txt.test.mjs 가 이미 막는 시험으로 잰다(이 도구는 「N종」 숫자와 초안 줄만 본다)",
  "CORE ↔ styles.css :root/.dark — packages/tokens/src/index.test.ts 가 이미 잰다",
  "registry 확정 → components/<key>.md 존재, README 문서 링크 대상 존재 — apps/studio/src/lib/docs.test.ts(「component detail pages can attach the matching specification」·「every internal document link points at a document that exists」)가 이미 막는 시험으로 잰다(이 도구는 반대 방향 「components/X.md 의 주인」 과 링크 경로의 꼴만 본다)",
  "산문의 색 값 주장(「Light `X`, Dark `Y`」·「`A`는 `B`와 값이 같다」) — 자연어라 주어·부정·비교·시제를 정규식으로 확정할 수 없어 재지 않는다(재면 거짓 ⚠ 나 조용한 통과가 생긴다). 대신 「참고」 에 그 주장이 든 문단(표 행 포함)의 첫 행을 파일:행으로 모아 사람이 훑게 낸다 — 후보는 테마 낱말(Light·Dark·라이트·다크, 대소문자 무시)과 팔레트 값(`<팔레트>-<숫자>`·`brand-alpha-NN`·white·black, 대소문자 무시)이 한 문단에 있는 것, 테마 낱말 바로 뒤에 맨 단계 숫자를 적은 것(「Light 100 / Dark 800」), 「값·색·매핑이 같다·동일하다·일치한다·다르다」 가 한 문장에 있거나 「같은 값」「동일한 값」 이 든 것이다(「두 테마」 도 테마 낱말로 센다). 테마 낱말과 단계 숫자 사이에 다른 말이 끼거나(「Light 테마의 800」) 팔레트를 한글로만 적은 문단은 잡지 않는다. 값의 원본은 packages/tokens/src/index.ts 다. 정해진 문장 꼴로 숫자·개수·이름을 말하는 산문 자리(Textarea·Checkbox·BADGE_COLORS·BUTTON_COLORS·TOGGLE_BUTTON_COLORS·BOTTOM_NAVIGATION_MAX_ITEMS·interaction.md·llms.txt·alpha 단계)는 그 꼴 하나를 찍어 계속 재며, 빗나가면 ? 다",
]);

// ---------------------------------------------------------------------------------------------------------------------
// 공통 도우미
// ---------------------------------------------------------------------------------------------------------------------

/** `index` 가 있는 줄의 1 기준 행 번호. */
export const lineAt = (text, index) => text.slice(0, index).split("\n").length;

const at = (file, line) => (line ? `${file}:${line}` : file);

const sortStrings = (list) => [...list].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

const show = (list) => (list.length ? list.join(", ") : "없음");

/**
 * 한글 수사를 숫자로. 문서가 「다섯」「열여덟」처럼 적는 값을 코드의 숫자와 비교하려는 것이다.
 * 숫자 글자는 그대로 읽고, 「다섯 개」「열여덟 색」처럼 뒤에 단위가 붙어 있으면 뗀다. 모르는 말이면 null.
 */
export function koreanNumber(word) {
  const text = String(word).trim().replace(/\s*(?:개|색|가지|종|곳|줄|단계)$/u, "");
  if (/^\d+$/.test(text)) return Number(text);
  const ones = { 하나: 1, 한: 1, 둘: 2, 두: 2, 셋: 3, 세: 3, 넷: 4, 네: 4, 다섯: 5, 여섯: 6, 일곱: 7, 여덟: 8, 아홉: 9 };
  const tens = { 열: 10, 스물: 20, 서른: 30, 마흔: 40, 쉰: 50 };
  if (text in ones) return ones[text];
  if (text in tens) return tens[text];
  for (const [ten, value] of Object.entries(tens)) {
    if (text.startsWith(ten) && text.slice(ten.length) in ones) return value + ones[text.slice(ten.length)];
  }
  return null;
}

/** Tailwind 크기 조각(`4`·`2.5`·`[15px]`·`[4.875rem]`)을 px 로. 기본 단위는 0.25rem = 4px 이다. */
export function tailwindPx(value) {
  const arbitrary = value.match(/^\[([\d.]+)(px|rem)\]$/);
  if (arbitrary) return arbitrary[2] === "px" ? Number(arbitrary[1]) : Number(arbitrary[1]) * 16;
  return /^[\d.]+$/.test(value) ? Number(value) * 4 : null;
}

/** 클래스 문자열에서 `prefix-값` 의 값을 px 로. 여러 개면 첫 것. 없으면 null. */
export function classPx(classes, prefix) {
  const hit = classes.match(new RegExp(`(?:^|[\\s:])${prefix}-(\\[[^\\]]+\\]|[\\d.]+)(?![\\w.])`));
  return hit ? tailwindPx(hit[1]) : null;
}

const FENCE_LINE = /^\s{0,3}```/;

/**
 * 마크다운의 `heading` 정규식이 맞는 줄부터 같은 등급 이상의 다음 제목 전까지. 없으면 null. `line` 은 제목의 행.
 * 펜스(```) 안의 줄은 제목으로 보지 않는다 — 펜스 안 `# 주석` 줄이 절을 잘라 「펜스가 없다」 고 잘못 안내하지 않게.
 */
export function sectionOf(md, heading) {
  const lines = md.split("\n");
  let offset = 0;
  let inFence = false;
  let start = null;
  for (const [index, text] of lines.entries()) {
    if (FENCE_LINE.test(text)) inFence = !inFence;
    else if (!inFence) {
      if (!start) {
        if (heading.test(text)) start = { index, offset, level: (text.match(/^#+/) ?? ["##"])[0].length };
      } else if (new RegExp(`^#{1,${start.level}} `).test(text)) {
        return { text: md.slice(start.offset, offset), offset: start.offset, line: start.index + 1 };
      }
    }
    offset += text.length + 1;
  }
  return start ? { text: md.slice(start.offset), offset: start.offset, line: start.index + 1 } : null;
}

/**
 * 마크다운을 문단으로. 빈 줄·펜스가 문단을 가르고, 제목과 표 행은 저마다 한 줄짜리 문단이며, 목록 항목(`- `·`1. `·`> `)은
 * 새 문단을 열고, 그 밖의 이어지는 줄은 앞 문단에 공백 하나로 붙는다 — 줄바꿈으로 나뉜 문장을 한 문장으로 읽기 위한 것이다.
 * 펜스 안은 문단이 아니다. 각 문단은 `text`·`kind`(paragraph|heading|row)와, 문단 안 위치를 문서 행으로 돌리는 `lineAt(offset)` 을 갖는다.
 */
export function paragraphsOf(md) {
  const blocks = [];
  let current = null;
  let inFence = false;
  const close = () => {
    if (current) blocks.push(current);
    current = null;
  };
  md.split("\n").forEach((raw, index) => {
    const line = index + 1;
    if (FENCE_LINE.test(raw)) {
      inFence = !inFence;
      close();
      return;
    }
    if (inFence) return;
    const text = raw.trim();
    if (!text) {
      close();
      return;
    }
    if (/^#/.test(text) || /^\|/.test(text)) {
      close();
      blocks.push({ text, starts: [{ offset: 0, line }], kind: /^\|/.test(text) ? "row" : "heading" });
      return;
    }
    if (!current || /^(?:[-*+]|\d+\.|>)\s/.test(text)) {
      close();
      current = { text, starts: [{ offset: 0, line }], kind: "paragraph" };
      return;
    }
    current.starts.push({ offset: current.text.length + 1, line });
    current.text += ` ${text}`;
  });
  close();
  return blocks.map((block) => ({ ...block, lineAt: (offset) => block.starts.filter((start) => start.offset <= offset).at(-1).line }));
}

/**
 * `text` 안에서 `index` 를 품은 문장의 [start, end). 문장은 `.`·`!`·`?`(뒤에 `**`·`)` 가 붙을 수 있다) 다음에 공백이나 끝이
 * 올 때 끝난다 — `material-symbols.tsx` 처럼 낱말 안의 점은 경계가 아니다.
 */
export function sentenceAround(text, index) {
  let start = 0;
  let end = text.length;
  for (const hit of text.matchAll(/[.!?](?:\*\*|\))?(?=\s|$)/g)) {
    const after = hit.index + hit[0].length;
    if (after <= index) start = after;
    else {
      end = after;
      break;
    }
  }
  return { start, end };
}

/** 원문에서 정규식이 맞는 자리를 모두 `{ groups, line, text }` 로. */
export function matchesOf(text, regex) {
  return [...text.matchAll(regex)].map((match) => ({ groups: match.slice(1), line: lineAt(text, match.index), text: match[0] }));
}

/** 절 안에서 정규식이 맞는 자리를 모두, 행 번호는 문서 기준으로. */
export function findIn(section, regex) {
  return matchesOf(section.text, regex).map((hit) => ({ ...hit, line: section.line + hit.line - 1 }));
}

/** 절 안의 코드 펜스를 차례로. 각 펜스는 안의 빈 줄을 뺀 줄을 `{ text, line }` 로 갖는다. */
export function fencesIn(md, heading) {
  const section = sectionOf(md, heading);
  if (!section) return null;
  const fences = [];
  for (const match of section.text.matchAll(/^```[^\n]*\n([\s\S]*?)^```/gm)) {
    const start = section.offset + match.index + match[0].indexOf("\n") + 1;
    const lines = [];
    let cursor = start;
    for (const text of match[1].split("\n")) {
      if (text.trim()) lines.push({ text: text.trim(), line: lineAt(md, cursor) });
      cursor += text.length + 1;
    }
    fences.push({ lines, line: lineAt(md, section.offset + match.index) });
  }
  return { fences, line: section.line };
}

/**
 * 절 안의 첫 마크다운 표. 머리 행과 구분 행(`| --- |`)이 있어야 표로 본다. `header` 는 머리 칸, `rows` 는 각 행의 칸과
 * 문서 기준 행 번호다. 칸 수를 함께 돌려 열이 늘거나 줄었을 때 읽는 쪽이 알 수 있게 한다.
 */
export function parseTable(section) {
  const lines = section.text.split("\n");
  const start = lines.findIndex((line) => /^\s*\|/.test(line));
  if (start < 0 || !/^\s*\|\s*:?-{3,}/.test(lines[start + 1] ?? "")) return null;
  const cells = (line) =>
    line
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((cell) => cell.trim());
  const rows = [];
  for (let index = start + 2; index < lines.length && /^\s*\|/.test(lines[index]); index += 1) rows.push({ cells: cells(lines[index]), line: section.line + index });
  return { header: cells(lines[start]), rows, line: section.line + start };
}

const stripTicks = (text) => text.replace(/`/g, "").trim();

// ---------------------------------------------------------------------------------------------------------------------
// 원문 → 추출값 (코드 쪽)
// ---------------------------------------------------------------------------------------------------------------------

/** component-registry.ts 의 항목. 한 줄에 `{ key, title, …, status, href? }` 가 있는 꼴을 읽는다. */
export function parseRegistry(source) {
  return matchesOf(source, /\{\s*key:\s*"([a-z-]+)",\s*title:\s*"([^"]+)"[^}]*?status:\s*"(확정|초안)"(?:[^}]*?href:\s*"([^"]+)")?/g).map(
    ({ groups: [key, title, status, href], line }) => ({ key, title, status, href: href ?? null, line }),
  );
}

/** packages/ui/src/index.ts 의 `export { A, B, type C } from "./module"` 줄. 이름에서 `type ` 은 뺀다. */
export function parseUiIndex(source) {
  return matchesOf(source, /export\s*\{([^}]*)\}\s*from\s*"\.\/([a-z-]+)"/g).map(({ groups: [names, module], line }) => ({
    module,
    names: names
      .split(",")
      .map((name) => name.trim())
      .filter((name) => name && !name.startsWith("type "))
      .map((name) => name.split(/\s+as\s+/).pop()),
    line,
  }));
}

/** `export const NAME = [ "a", "b" ] as const` 의 문자열들. */
export function parseConstArray(source, name) {
  const match = source.match(new RegExp(`export const ${name}\\s*=\\s*\\[([\\s\\S]*?)\\]\\s*as const`));
  return match ? { values: [...match[1].matchAll(/"([^"]+)"/g)].map((hit) => hit[1]), line: lineAt(source, match.index) } : null;
}

/** `const NAME = 5` 같은 숫자 상수. */
export function parseNumberConst(source, name) {
  const match = source.match(new RegExp(`\\bconst ${name}\\s*=\\s*(\\d+)`));
  return match ? { value: Number(match[1]), line: lineAt(source, match.index) } : null;
}

/** `export const NAME = { a: 1, "2xl": 18 } as const` 의 이름→숫자. */
export function parseNumberRecord(source, name) {
  const match = source.match(new RegExp(`export const ${name}\\s*=\\s*\\{([\\s\\S]*?)\\}\\s*as const`));
  if (!match) return null;
  const entries = Object.fromEntries([...match[1].matchAll(/"?([\w-]+)"?:\s*(\d+)/g)].map((hit) => [hit[1], Number(hit[2])]));
  return { entries, line: lineAt(source, match.index) };
}

/**
 * `start`(`=` 나 `:` 바로 뒤) 부터 타입 식 하나의 본문. 첫 줄은 `;`·`}`·`,` 앞까지, 다음 줄은 `|` 로 시작하거나 앞 줄이 `|` 로 끝날 때만
 * 이어 읽는다 — prettier 가 `type X =\n  | "a"\n  | "b"` 로 줄을 나눠도 한 유니온으로 읽기 위한 것이다. 줄 끝 `//` 주석은 뗀다.
 */
export function unionTextAt(source, start) {
  const pieces = [];
  for (const [index, raw] of source.slice(start).split("\n").entries()) {
    const line = raw.replace(/\s\/\/.*$/, "");
    if (index > 0 && !/^\s*\|/.test(line) && !/\|\s*$/.test(pieces.at(-1) ?? "")) break;
    const cut = line.search(/[;},]/);
    pieces.push(cut >= 0 ? line.slice(0, cut) : line);
    if (cut >= 0) break;
  }
  return pieces.join(" ");
}

/**
 * 유니온 본문을 멤버로 나눈다. 멤버가 모두 `"…"`(`asConst` 면 `"…" as const` 도) 또는 숫자여야 값 집합이고, 하나라도 다른 것
 * (`(string & {})`·`LayoutName`·`boolean`)이 섞이면 문서의 값 목록과 같다고 확정할 수 없으므로 null 이다 — 문자열만 모아 = 로 지나가지 않는다.
 */
export function unionMembers(text, { asConst = false } = {}) {
  const members = text
    .split("|")
    .map((member) => member.trim())
    .filter(Boolean);
  if (!members.length) return null;
  const literal = asConst ? /^"([^"]*)"(?:\s+as\s+const)?$|^(\d+)$/ : /^"([^"]*)"$|^(\d+)$/;
  const values = members.map((member) => member.match(literal)).map((hit) => hit && (hit[1] ?? hit[2]));
  return values.every((value) => value !== null && value !== undefined) ? values : null;
}

/** `type Name = "a" | "b"` 또는 `99 | 999` 유니온의 값들(문자열로). export 유무는 가리지 않는다. 문자열·숫자가 아닌 멤버가 섞이면 null. */
export function parseTypeUnion(source, name) {
  const match = source.match(new RegExp(`(?:export )?type ${name}\\s*=`));
  if (!match) return null;
  const values = unionMembers(unionTextAt(source, match.index + match[0].length));
  return values ? { values, line: lineAt(source, match.index) } : null;
}

/**
 * cva 의 `variants: { <prop>: { a: …, b: … } }` 에서 `prop` 의 키. 처음 나오는 `prop:` 블록을 읽는다. 키는 맨 이름이든 따옴표(`"outline":`)든
 * 읽고, `[computed]:` 같은 키 줄이 있으면 목록을 확정할 수 없어 null 이다.
 */
export function parseCvaVariantKeys(source, cvaName, prop) {
  const start = source.indexOf(`const ${cvaName} = cva(`);
  if (start < 0) return null;
  const block = source.slice(start).match(new RegExp(`\\b${prop}:\\s*\\{([\\s\\S]*?)\\n\\s*\\}`));
  if (!block) return null;
  if (/^\s*\[/m.test(block[1])) return null;
  const values = [...block[1].matchAll(/^\s+(?:"([^"\n]+)"|'([^'\n]+)'|([\w$]+)):/gm)].map((hit) => hit[1] ?? hit[2] ?? hit[3]);
  return values.length ? { values, line: lineAt(source, start + block.index) } : null;
}

/**
 * 타입 안에 바로 적은 유니온 `prop?: "a" | "b"`. 같은 prop 이 여러 곳에 나뉘어 있으면(`{ layout?: "fill" } | { layout: "fixed" }`)
 * 모두 합친다. `line` 은 첫 자리. 값 자리의 `"fixed" as const` 도 문자열로 읽되, 어느 자리에든 문자열이 아닌 멤버가 섞이면 null.
 */
export function parseInlineUnion(source, prop) {
  const hits = [...source.matchAll(new RegExp(`\\b${prop}\\??:`, "g"))];
  if (!hits.length) return null;
  const values = new Set();
  for (const hit of hits) {
    const members = unionMembers(unionTextAt(source, hit.index + hit[0].length), { asConst: true });
    if (!members) return null;
    for (const value of members) values.add(value);
  }
  return { values: [...values], line: lineAt(source, hits[0].index) };
}

/** `prop?: boolean` → 문서가 적는 `false | true`. `boolean | "auto"` 처럼 넓어지면 null. */
export function parseBooleanProp(source, prop) {
  const match = source.match(new RegExp(`\\b${prop}\\??:`));
  if (!match) return null;
  return unionTextAt(source, match.index + match[0].length).trim() === "boolean" ? { values: ["false", "true"], line: lineAt(source, match.index) } : null;
}

/** `const NAME = { a: …, b: … }` 의 키(`//` 주석 줄은 건너뛴다). `keyof typeof NAME` 으로 타입을 만든 자리의 값이다. */
export function parseRecordKeys(source, name) {
  const match = source.match(new RegExp(`const ${name}\\s*=\\s*\\{([\\s\\S]*?)\\n\\}`));
  if (!match) return null;
  const values = [...match[1].matchAll(/^\s+(\w+):/gm)].map((hit) => hit[1]);
  return values.length ? { values, line: lineAt(source, match.index) } : null;
}

/** `const SIZE_CLASS: Record<…> = { small: "…", medium: "…" }` 의 단계별 클래스 문자열. */
export function parseSizeClasses(source) {
  const match = source.match(/SIZE_CLASS[^=]*=\s*\{([\s\S]*?)\n\}/);
  if (!match) return null;
  return { entries: Object.fromEntries([...match[1].matchAll(/^\s*(\w+):\s*"([^"]+)"/gm)].map((hit) => [hit[1], hit[2]])), line: lineAt(source, match.index) };
}

/** cva 첫 인자(기본 클래스 문자열). */
export function parseCvaBase(source, cvaName) {
  const match = source.match(new RegExp(`const ${cvaName} = cva\\(\\s*"([^"]+)"`));
  return match ? { classes: match[1], line: lineAt(source, match.index) } : null;
}

/**
 * packages/tokens/src/index.ts 의 `CORE_SEMANTIC_TOKENS`. `semantic("family", "name", light, dark)` 호출과
 * `statusFamily` 가 템플릿으로 찍어내는 4 role × 접미를 펼쳐 이름·light·dark 를 만든다.
 */
export function parseCoreSemanticTokens(source) {
  const tokens = matchesOf(source, /semantic\("(\w+)",\s*"(oe-[\w-]+)",\s*"([^"]+)",\s*"([^"]+)"\)/g).map(({ groups: [family, name, light, dark], line }) => ({ family, name, light, dark, line }));
  const template = source.match(/const statusFamily\s*=[\s\S]*?=>\s*\[([\s\S]*?)\];/);
  const suffixes = template
    ? matchesOf(template[1], /semantic\(family,\s*`oe-\$\{family\}-([\w-]+)`,\s*`\$\{palette\}-(\d+)`,\s*`\$\{palette\}-(\d+)`\)/g).map(({ groups }) => groups)
    : [];
  for (const { groups: [family, palette], line } of matchesOf(source, /\.\.\.statusFamily\("(\w+)",\s*"(\w+)"\)/g)) {
    for (const [suffix, light, dark] of suffixes) tokens.push({ family, name: `oe-${family}-${suffix}`, light: `${palette}-${light}`, dark: `${palette}-${dark}`, line });
  }
  return tokens;
}

/** brand mapping 의 camelCase 키 → 토큰 이름. `focusRing` 만 `oe-brand-` 가 아니라 `oe-focus-ring` 이다(문서·styles.css 도 그 이름). */
export const brandTokenName = (camel) => (camel === "focusRing" ? "oe-focus-ring" : `oe-brand-${camel.replace(/([A-Z])/g, "-$1").toLowerCase()}`);

/**
 * `createBrandSemanticMapping` 의 Light/Dark 매핑 `{ 토큰 이름: "brand-NNN" }`. 함수 본문 안의 `return {` 두 개 가운데
 * `mode === "dark"` 뒤의 첫 것이 Dark, 다음이 Light 다. 함수 밖의 `return {`(rgbFromHex)와 섞이지 않게 본문만 본다.
 */
export function parseBrandMapping(source) {
  const start = source.indexOf("export function createBrandSemanticMapping");
  if (start < 0) return null;
  const end = source.indexOf("\n}\n", start);
  const body = source.slice(start, end < 0 ? undefined : end);
  const darkAt = body.indexOf('mode === "dark"');
  const blocks = [...body.matchAll(/return\s*\{([\s\S]*?)\n\s*\};/g)];
  if (darkAt < 0 || blocks.length < 2) return null;
  const read = (block) => ({
    entries: Object.fromEntries([...block[1].matchAll(/(\w+):\s*solid\((\d+)\)/g)].map((hit) => [brandTokenName(hit[1]), `brand-${hit[2]}`])),
    line: lineAt(source, start + block.index),
  });
  const [first, second] = blocks;
  return first.index > darkAt ? { dark: read(first), light: read(second) } : { light: read(first), dark: read(second) };
}

/** `toneByStep` 의 단계→HCT tone. */
export function parseToneByStep(source) {
  const match = source.match(/toneByStep[^{]*\{([\s\S]*?)\}/);
  return match ? { entries: Object.fromEntries([...match[1].matchAll(/(\d+):\s*(\d+)/g)].map((hit) => [hit[1], Number(hit[2])])), line: lineAt(source, match.index) } : null;
}

/** `export const BRAND_ALPHA_STEPS = [5, 8, …]`. */
export function parseNumberArray(source, name) {
  const match = source.match(new RegExp(`export const ${name}\\s*=\\s*\\[([^\\]]*)\\]`));
  return match ? { values: [...match[1].matchAll(/\d+/g)].map((hit) => Number(hit[0])), line: lineAt(source, match.index) } : null;
}

/**
 * styles.css `@theme { … }` 블록 본문들. 중괄호 깊이로 블록 끝을 찾는다(본문 안의 `{}` 는 없지만 있어도 센다). 닫히지 않은 블록은 파일 끝까지다.
 * 블록이 하나도 없으면 빈 배열이다 — 그때 별칭은 0개라 짝이 ? 를 낸다.
 */
export function themeBlocksOf(css) {
  const bodies = [];
  for (const open of css.matchAll(/@theme\b[^{;]*\{/g)) {
    let depth = 1;
    let index = open.index + open[0].length;
    const start = index;
    while (index < css.length && depth > 0) {
      const char = css[index];
      if (char === "{") depth += 1;
      else if (char === "}") depth -= 1;
      index += 1;
    }
    bodies.push(css.slice(start, depth === 0 ? index - 1 : index));
  }
  return bodies;
}

/**
 * styles.css `@theme` 의 별칭 이름(`--color-oe-x`·`--spacing-oe-x`·`--radius-oe-x`·`--text-oe-x` → `oe-x`). 「--<접두>-oe-<이름>:」 정확한 꼴만
 * 센다 — `--text-oe-label--line-height:` 같은 변형 접미 선언은 Tailwind v4 가 기본 `--text-oe-label` 없이는 클래스를 만들지 않으므로 별칭이 아니다.
 * `@theme` 블록 **안**의 선언만 센다 — `:root` 에 적은 `--color-oe-x` 는 변수일 뿐 Tailwind v4 가 클래스를 만들지 않으므로, 밖으로 옮긴 선언을 별칭으로 세면
 * 문서가 인용한 클래스가 없는데 = 로 조용히 지나간다.
 */
export function parseThemeAliases(css) {
  return new Set(themeBlocksOf(css).flatMap((body) => [...body.matchAll(/--(?:color|spacing|radius|text)-(oe-[a-z0-9]+(?:-[a-z0-9]+)*)\s*:/g)].map((hit) => hit[1])));
}

// ---------------------------------------------------------------------------------------------------------------------
// 원문 → 추출값 (문서 쪽)
// ---------------------------------------------------------------------------------------------------------------------

const README_HEADER = ["컴포넌트", "상태", "문서", "용도"];

/**
 * README 「## Component」 절의 표. 머리 행이 `| 컴포넌트 | 상태 | 문서 | 용도 |` 여야 읽는다(열이 늘거나 순서가 바뀌면 `ok: false`).
 * 행은 `| 제목 | 확정|초안 | [key.md](components/key.md) 또는 없음 | 용도 |`. 꼴에 안 맞는 칸은 `problems` 에 행 번호와 함께 남긴다.
 */
export function parseReadmeComponentTable(readme) {
  const section = sectionOf(readme, /^## Component\s*$/m);
  const table = section && parseTable(section);
  if (!table) return null;
  if (table.header.length !== README_HEADER.length || README_HEADER.some((label, index) => table.header[index] !== label)) {
    return { ok: false, rows: [], line: table.line, problems: [{ detail: `머리 행이 「| ${README_HEADER.join(" | ")} |」 가 아니다: 「| ${table.header.join(" | ")} |」`, line: table.line }] };
  }
  const rows = [];
  const problems = [];
  for (const { cells, line } of table.rows) {
    const row = { title: cells[0] ?? "", status: null, docPath: undefined, line };
    rows.push(row);
    if (cells.length !== table.header.length) {
      problems.push({ detail: `칸이 ${cells.length}개다(머리 행은 ${table.header.length}개)`, line });
      continue;
    }
    const [, status, docCell] = cells;
    if (status === "확정" || status === "초안") row.status = status;
    else problems.push({ detail: `상태 칸 「${status}」 을 읽지 못했다(확정|초안)`, line });
    const link = docCell.match(/^\[[^\]]+\]\(([^)]+)\)$/);
    if (link) row.docPath = link[1];
    else if (docCell === "없음") row.docPath = null;
    else problems.push({ detail: `문서 칸 「${docCell}」 을 읽지 못했다([key.md](components/key.md) 또는 없음)`, line });
  }
  return { ok: true, rows, line: table.line, problems };
}

/** 컴포넌트 문서의 H1 과, H1 다음 첫 비어 있지 않은 줄(구현 경로 메타줄, README:16 규칙). */
export function parseComponentDoc(md) {
  const lines = md.split("\n");
  const h1Index = lines.findIndex((line) => /^# /.test(line));
  const title = h1Index >= 0 ? lines[h1Index].replace(/^# /, "").trim() : null;
  let metaIndex = -1;
  for (let index = h1Index + 1; index < lines.length; index += 1) {
    if (lines[index].trim()) {
      metaIndex = index;
      break;
    }
  }
  const meta = metaIndex >= 0 ? lines[metaIndex].trim().match(/^`(packages\/ui\/src\/[a-z-]+\.tsx)`$/) : null;
  return { title, titleLine: h1Index + 1, metaPath: meta ? meta[1] : null, metaText: metaIndex >= 0 ? lines[metaIndex].trim() : "", metaLine: metaIndex + 1 };
}

/** llms.txt 의 「확정 N종: …」「초안(쓰지 않는다): …」 줄. */
export function parseLlmsLists(text) {
  const names = (line) => [...line.matchAll(/`([a-z-]+)`/g)].map((hit) => hit[1]);
  const confirmed = text.match(/^확정\s*(\d+)\s*종\s*:\s*(.+)$/m);
  const draft = text.match(/^초안\s*(?:\([^)]*\))?\s*:\s*(.+)$/m);
  return {
    confirmed: confirmed ? { count: Number(confirmed[1]), keys: names(confirmed[2]), line: lineAt(text, confirmed.index) } : null,
    draft: draft ? { keys: names(draft[1]), line: lineAt(text, draft.index) } : null,
  };
}

/**
 * 열거 줄. `ENUM_LINE_LOOSE` 는 「값 자리에 `a | b` 백틱이 든 목록 줄」 모두 — 목록 표지는 `-`·`*`·`+`·`1.` 어느 것이든, 콜론이 있든
 * 없든(「- `tone` — `warm | cool`」) 잡는다. 이 줄들은 무엇이든 보고에 이름이 나와야 한다. 항목 첫머리가 곧 `a | b` 백틱인 줄(select.md
 * 「- `value | defaultValue`: 선택한 값」)은 값이 아니라 이름 자리의 `|` 라 열거 줄이 아니다.
 * 재는 꼴은 「- `prop`(, `prop2`)( (Style))?: (각각 )?`a | b`」 — 콜론 바로 뒤의 값 자리에 `|` 가 든 백틱 묶음이 **정확히 하나**다(한 줄에 prop 이
 * 둘이면 같은 값을 각각 잰다 — chip.md 「- `leadingTone`, `trailingTone`: `secondary | tertiary`」). 값 묶음 바로 뒤에 이음말 「또는·이나·및·혹은·그리고·과·와·,·/··;」 로
 * 백틱 이름이 이어지거나(`ENUM_MORE`) 값 묶음이 둘 이상이면 한 목록으로 읽지 못한 것이다.
 */
const ENUM_LINE_LOOSE = /^(?:[-*+]|\d+\.)\s+(?!`[^`\n]*\|[^`\n]*`)[^\n]*?`[^`\n]*\|[^`\n]*`[^\n]*$/m;
const ENUM_HEAD = /^- ((?:`[\w.]+`(?:,\s*)?)+)(?: \([^)]*\))?\s*:\s*(?:각각\s*)?/;
const ENUM_VALUES = /^`([^`\n]*\|[^`\n]*)`/;
const ENUM_MORE = /^\s*(?:또는|이나|및|혹은|그리고|과|와|,|\/|·|;)\s*`[\w.-]+`/;
const ENUM_SHAPE = "- `prop`: `a | b`";
const ENUM_SPLIT = "값 묶음이 둘 이상이라 한 목록으로 읽지 못했다";

/**
 * 값에 `|` 가 든 목록 줄 하나의 판정. `parseDocEnums` 와 `unmeasuredEnumLines` 가 같은 판정을 쓴다.
 *   { kind: "measured", props, values } — 재는 꼴
 *   { kind: "split", props }             — 값 묶음이 둘 이상이거나 값 묶음 바로 뒤에 백틱 이름이 이어진다 → 그 prop 마다 ?
 *   { kind: "odd" }                      — prop 백틱 이름이 없거나(「- 방향: `a | b`」) 값 묶음이 콜론 바로 뒤가 아니다 → 재지 않는 것
 *   null                                 — 열거 줄이 아니다
 */
export function classifyEnumLine(text) {
  if (!ENUM_LINE_LOOSE.test(text)) return null;
  const head = text.match(ENUM_HEAD);
  const values = head && text.slice(head[0].length).match(ENUM_VALUES);
  if (!values) return { kind: "odd" };
  const props = [...head[1].matchAll(/`([\w.]+)`/g)].map((hit) => hit[1]);
  const tail = text.slice(head[0].length + values[0].length);
  if (ENUM_MORE.test(tail) || /`[^`\n]*\|[^`\n]*`/.test(tail)) return { kind: "split", props };
  return { kind: "measured", props, values: values[1].split("|").map((value) => value.trim()) };
}

/** 절 안의 열거 줄 → 재는 꼴은 `enums`(prop 별 값 목록, 한 줄의 prop 여럿은 같은 값·행), 한 목록으로 읽지 못한 줄은 `split`. */
export function parseDocEnums(section) {
  const enums = {};
  const split = [];
  // g 정규식은 lastIndex 를 남기므로 findIn 에는 매번 새로 만든 것을 준다.
  for (const { text, line } of findIn(section, new RegExp(ENUM_LINE_LOOSE.source, "gm"))) {
    const read = classifyEnumLine(text);
    if (read?.kind === "measured") for (const prop of read.props) enums[prop] = { values: read.values, line };
    else if (read?.kind === "split") split.push({ props: read.props, line });
  }
  return { enums, split };
}

/** 미래를 말하는 문장. 경로가 든 문장에 이 말이 있으면 그 경로는 아직 없어도 어긋남이 아니다. */
const FUTURE = /생기면|확정되면|다시 만든다/;

/**
 * 문서 안의 백틱 저장소 경로(`packages/…`·`apps/…`·`docs/…`·`scripts/…`). 경로가 든 **문장**(표 행이면 그 행)이 「생기면」
 * 「확정되면」「다시 만든다」 를 말하면 `future` 로 표시한다 — 같은 줄의 다른 문장이 미래를 말해도 이 경로와는 무관하다.
 */
export function parseDocPaths(md) {
  const paths = [];
  for (const block of paragraphsOf(md)) {
    for (const hit of block.text.matchAll(/`((?:packages|apps|docs|scripts)\/[A-Za-z0-9._/-]*)`/g)) {
      const { start, end } = sentenceAround(block.text, hit.index);
      const scope = block.kind === "row" ? block.text : block.text.slice(start, end);
      paths.push({ target: hit[1], line: block.lineAt(hit.index), future: FUTURE.test(scope) });
    }
  }
  return paths;
}

/** 문서가 인용한 Tailwind 별칭 클래스(`text-oe-label` 등) → `oe-…` 이름. */
export function parseDocAliasClasses(md) {
  return matchesOf(md, /`(?:bg|text|border|ring|outline|fill|stroke|h|w|size|min-h|rounded|p[xy]?|gap)-(oe-[a-z0-9-]+)`/g).map(({ groups: [name], line, text }) => ({ name, className: text.slice(1, -1), line }));
}

/**
 * 산문의 값 주장 후보 — 재지 않고 「참고」 에 파일:행으로 모아 사람이 훑게 낸다(NOT_MEASURED 의 까닭). 문단 단위다 — 펜스 밖 문단(표 행 포함) 가운데
 * (i) 테마 낱말(`light`·`dark` 대소문자 무시, `라이트`·`다크`, 「두 테마」)과 팔레트 값(`<팔레트>-<숫자>`·`brand-alpha-NN`·`white`·`black`, 대소문자 무시 —
 *     radio.md 의 「Black 10%」「White 16%」 도 팔레트 값이다)이 한 문단에 함께 있는 것,
 * (ii) 테마 낱말 바로 뒤에 맨 단계 숫자를 적은 것(button.md 색 단계 표의 「Light 100 / Dark 800」 칸) — 팔레트 이름 없이 단계만 적은 표 셀이다,
 * (iii) 「(값|색|매핑)(이|은|는|도) … (같|동일|일치|다르)」 가 한 문장(마침표 안)에 있거나 「같은 값」「동일한 값」 이 든 것 — 「A 와 B 의 값이 같다·다르다」 문장을
 *     사람에게 보이는 자리라 재는 것보다 넓게 잡는다.
 * 행은 그 문단의 첫 행이다(문단이 여러 줄이면 주장 문장의 줄이 아닐 수 있다 — NOT_MEASURED 와 tooling.md 도 그렇게 적는다). =·⚠·? 를 내지 않고 요약
 * 첫 줄의 개수에도 들지 않는다. 잡지 않는 꼴(테마 낱말과 숫자 사이에 다른 말이 낀 것, 한글로만 적은 팔레트)은 NOT_MEASURED 에 적혀 있다.
 */
// 앞의 세 정규식(PROSE_THEME·PROSE_PALETTE·PROSE_BARE_STEP)은 대소문자를 가리지 않는다(`i`) — white·black 만이 아니라 팔레트 이름(「Neutral-400」「RED-500」「Brand-Alpha-10」)도 같다. 테마 낱말은 영문 Light·Dark 와 한글 라이트·다크 넷이다.
const PROSE_THEME = /(?<![\w-])(?:light|dark|라이트|다크)(?![a-z])|두\s*테마/i;
const PROSE_PALETTE = /(?<![\w-])(?:white|black|(?:neutral|gray|slate|zinc|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|brand|brand-alpha)-\d+)(?![\w-])/i;
const PROSE_BARE_STEP = /(?<![\w-])(?:light|dark|라이트|다크)\s+\d{2,3}(?![\w%.])/i;
const PROSE_SAME = /(?:값|색|매핑)(?:이|은|는|도)(?![가-힣])[^.!?\n]*?(?:같|동일|일치|다르)|(?:같은|동일한)\s*값/;

export function proseValueClaims(docs) {
  const hits = [];
  for (const [file, md] of Object.entries(docs)) {
    for (const { text, kind, lineAt: lineOf } of paragraphsOf(md)) {
      if (kind === "heading") continue;
      if ((PROSE_THEME.test(text) && PROSE_PALETTE.test(text)) || PROSE_BARE_STEP.test(text) || PROSE_SAME.test(text)) hits.push({ file, line: lineOf(0), text });
    }
  }
  return hits;
}

/** 「참고」 한 줄. `unreadFiles` 는 systemDocs 목록에는 있는데 읽지 못한 파일·디렉터리다. */
export function proseValueNote(docs, unreadFiles = []) {
  const hits = proseValueClaims(docs).map(({ file, line, text }) => `${at(file, line)} 「${text.slice(0, 50)}${text.length > 50 ? "…" : ""}」`);
  const tail = unreadFiles.length ? ` (읽지 못한 파일: ${unreadFiles.join(", ")})` : "";
  return `손으로 확인할 산문 값 주장 ${hits.length}곳 — ${hits.length ? hits.join(", ") : "없음"}${tail}`;
}

// ---------------------------------------------------------------------------------------------------------------------
// 비교. 각 검사는 { drifts, unreadable, notes, skipped } 를 돌려준다.
//   drift      = { what, code, doc, codeAt, docAt }      — 다르다
//   unreadable = { what, detail, docAt }                 — 못 읽었다
//   notes      = 참고(어긋남으로 세지 않는 정보), skipped = 이 짝이 재지 않기로 한 것(까닭과 함께)
// ---------------------------------------------------------------------------------------------------------------------

const drift = (what, code, doc, codeAt, docAt) => ({ what, code: String(code), doc: String(doc), codeAt, docAt });
const unreadable = (what, detail, docAt) => ({ what, detail, docAt });
const result = (drifts = [], unread = [], { notes = [], skipped = [] } = {}) => ({ drifts, unreadable: unread, notes, skipped });
const merge = (...results) => result(results.flatMap((entry) => entry.drifts), results.flatMap((entry) => entry.unreadable), { notes: results.flatMap((entry) => entry.notes), skipped: results.flatMap((entry) => entry.skipped) });

const confirmedOf = (registry) => registry.filter((item) => item.status === "확정");
const noRegistry = () => result([], [unreadable("registry 항목", "`{ key: \"…\", title: \"…\", …, status: \"확정|초안\" }` 항목", FILES.registry)]);

/**
 * 두 이름 집합의 양방향 차집합을 어긋남으로. `partial`(못 읽은 줄이 말하던 이름, 아래 `except`)은 **양쪽**에서 뺀다 — 코드 쪽에서만 빼면
 * 문서가 바로 다음 줄에 제대로 적은 같은 이름이 「코드에 없는 이름」 으로 잡혀 거짓 ⚠ 가 된다. `codeFamilies`(코드 전체 이름 → family)가 있으면
 * 문서에만 있는 이름 가운데 코드 전체에는 있는 것(다른 family 의 이름)을 「코드에 없는 이름 — 코드 없음」 이 아니라 「다른 family 의 이름」 으로
 * 따로 낸다 — 사람이 코드를 열어 보면 그 이름이 있으므로 「없음」 은 사실과 다른 문구다.
 */
function compareNameSets(what, codeNames, docNames, codeAt, docAt, { allowInDoc = new Set(), partial = new Set(), codeFamilies = null } = {}) {
  const code = new Set(except(codeNames, partial));
  const doc = new Set(except(docNames, partial));
  const drifts = [];
  const docOnly = sortStrings([...doc].filter((name) => !code.has(name) && !allowInDoc.has(name)));
  const codeOnly = sortStrings([...code].filter((name) => !doc.has(name)));
  const elsewhere = codeFamilies ? docOnly.filter((name) => codeFamilies.has(name)) : [];
  const missing = docOnly.filter((name) => !codeFamilies?.has(name));
  if (missing.length) drifts.push(drift(`${what} — 코드에 없는 이름`, "없음", missing.join(", "), codeAt, docAt));
  if (elsewhere.length) drifts.push(drift(`${what} — 다른 family 의 이름`, elsewhere.map((name) => `${name}(${codeFamilies.get(name)} family)`).join(", "), elsewhere.join(", "), codeAt, docAt));
  if (codeOnly.length) drifts.push(drift(`${what} — 문서 목록에 없는 코드 이름`, codeOnly.join(", "), "없음", codeAt, docAt));
  return drifts;
}

/**
 * 이름의 family 접두 — 「oe-」 뒤 첫 낱말까지다. 다만 첫 낱말이 코드의 role(`roles` — danger·warning·success·info·accent·brand)이거나 `{role}` 이면
 * 그 뒤 property 낱말까지다: 「oe-background-canvas-primary」 → oe-background, 「oe-danger-foreground-primary」 → oe-danger-foreground,
 * 「oe-{role}-border-primary」 → oe-{role}-border. 「oe-」 뒤 첫 낱말만 family 로 잡으면 role 이 앞에 오는 이름에서 「oe-danger」 가 되어 어디에도 없는
 * oe-danger-secondary 를 지었다. family 뒤에 남는 낱말이 없거나(「oe-ring」「oe-danger-primary」) 낱말이 영문이 아니면(`{property}` 같은 다른 자리표시자·「success」)
 * null — 부르는 쪽은 추정하지 않는다.
 */
export function familyOf(head, roles = new Set()) {
  const hit = head.match(/^oe-((?:\{role\}|[a-z]+)(?:-[a-z]+)*)$/);
  if (!hit) return null;
  const words = hit[1].split("-");
  const depth = words[0] === "{role}" || roles.has(words[0]) ? 2 : 1;
  return words.length > depth ? `oe-${words.slice(0, depth).join("-")}` : null;
}

/**
 * 축약 줄이 말하는 이름 — 접두 추정은 이 한 곳에서만 한다(fenceLines 의 깨진 줄, expandRoleList 의 슬래시 축약과 깨진 줄이 함께 쓴다).
 * 첫 조각은 그대로 이름이고, 나머지 조각은 (a) 이미 `oe-` 로 시작하면 그대로 이름이다(「oe-border-primary / oe-border-secondary」 → oe-border-secondary),
 * (b) 첫 조각의 family(familyOf — `roles` 는 코드의 role 집합)를 붙인다(「oe-background-canvas-primary / canvas-secondary」 → oe-background-canvas-secondary,
 * 「oe-danger-foreground-primary / secondary」 → oe-danger-foreground-secondary — 마지막 조각을 떼는 추정은 oe-background-canvas-canvas-secondary 를 지어
 * 진짜 이름을 ⚠ 에 남겼다), (c) 첫 조각이 `oe-` 이름이 아니면(「success / info」) 낱말 그대로다.
 * 첫 조각이 `oe-` 로 시작하는데 family 를 잴 수 없으면(「oe-ring / x」「oe-danger-primary / secondary」) 추정이 애매하다 — `sure: false` 와 함께 그 줄이 말했을 수 있는
 * 이름을 모두(조각·oe-조각·첫조각-조각) 돌려주고, 부르는 쪽은 그 줄을 ? 로만 내며 이 이름들을 ⚠ 에서 뺀다. 어떤 추정으로도 ⚠ 에 이름을 붙이지 않는다(거짓 ⚠ 를 내지 않는다).
 */
export function expandAbbreviation(head, rest, roles = new Set()) {
  if (!rest.length) return { names: [head], sure: true };
  if (!head.startsWith("oe-")) return { names: [head, ...rest], sure: true };
  const family = familyOf(head, roles);
  if (family) return { names: [head, ...rest.map((piece) => (piece.startsWith("oe-") ? piece : `${family}-${piece}`))], sure: true };
  return { names: [head, ...rest.flatMap((piece) => [piece, `oe-${piece}`, `${head}-${piece}`])], sure: false };
}

/**
 * 꼴이 깨진 펜스 줄이 그래도 말하는 이름 — 그 이름을 ⚠ 로 다시 세지 않기 위한 것이다(못 읽음 하나로 충분하다). 대소문자는 가리지 않는다
 * (「Danger」「OE-foreground-primary」 도 그 이름을 말하는 줄이다). 괄호 안(「(state layer)」「(역상)」)은 덧말이라 이름으로 읽지 않는다. 줄 앞의 이름이
 * `-`·`*` 로 끝나 접두임을 스스로 말한 경우(「oe-danger-border-*」)에만 접두 표지(`oe-danger-border-`, 꼬리 `-`)를 넣어 `except` 가 그 접두의 이름 모두를
 * 뺀다 — 「oe-foreground-inverse (역상)」 의 앞 이름은 접두가 아니므로 oe-foreground-inverse-secondary 는 그대로 잰다. 나머지 낱말은 expandAbbreviation 이
 * 첫 이름의 family(`roles` 는 코드의 role 집합)로 펼친다(「oe-border-primary, secondary」 → oe-border-secondary, 「oe-danger-border-primary, secondary」 →
 * oe-danger-border-secondary, 「success / info」 → info). 자리표시자(`{role}`·`{property}` …)가 든 이름은 그대로 돌려준다 — `except` 가 그 자리에 어떤 낱말이 와도
 * 맞는 이름을 양쪽에서 뺀다(이름을 짓지 않는다). 글자로 시작하지 않는 줄(「# 전경」)은 이름을 말하지 않는다.
 */
export function namesOfBrokenLine(text, roles = new Set()) {
  const named = text
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .match(/^([a-z][\w{}-]*)(\*?)(.*)$/);
  if (!named) return [];
  const head = named[1].replace(/-+$/, ""); // 「oe-danger-border-*」 의 꼬리 `-` 는 이름이 아니다
  const isPrefix = named[2] === "*" || /-$/.test(named[1]);
  const { names } = expandAbbreviation(head, named[3].match(/[a-z][\w{}-]*/g) ?? [], roles);
  return isPrefix ? [`${head}-`, ...names.slice(1)] : names;
}

/** 자리표시자(`{role}`·`{property}` …)가 든 줄 — 어떤 이름을 말하는지 확정할 수 없어 이름을 짓지 않고, 그 꼴에 맞는 이름을 양쪽에서 뺀다. */
const isTemplate = (text) => /\{[a-z]+\}/i.test(text);
const TEMPLATE_NOTE = " — 자리표시자 줄이라 이름을 짓지 않고 그 꼴에 맞는 이름은 코드 쪽·문서 쪽 비교와 참고에서 뺀다";

/**
 * 펜스 줄 가운데 `regex` 에 안 맞는 줄을 「못 읽었다」 로. 맞는 줄은 `hit` 으로 돌려준다. `partial` 은 못 읽은 줄이 그래도 말하는
 * 이름들(namesOfBrokenLine — `roles` 는 축약을 펼칠 코드의 role 집합)이다 — 그 이름을 어긋남으로 다시 세지 않기 위한 것이다(못 읽음 하나로 충분하다).
 */
function fenceLines(what, fence, regex, file, roles = new Set()) {
  const hits = [];
  const unread = [];
  const partial = new Set();
  for (const entry of fence.lines) {
    const hit = entry.text.match(regex);
    if (hit) hits.push({ hit, line: entry.line });
    else {
      unread.push(unreadable(what, `펜스 줄 「${entry.text}」 이 꼴에 맞지 않는다${isTemplate(entry.text) ? TEMPLATE_NOTE : ""}`, at(file, entry.line)));
      for (const name of namesOfBrokenLine(entry.text, roles)) partial.add(name);
    }
  }
  return { hits, unread, partial };
}

/** 자리표시자가 든 이름(「oe-{role}-foreground-primary」「oe-{property}-{hierarchy}」)을 그 자리에 어떤 낱말이 와도 맞는 정규식으로. */
const templateOf = (name) => new RegExp(`^${name.split(/\{[a-z]+\}/).map((piece) => piece.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("[\\w-]+")}$`);

/**
 * 못 읽은 줄이 말하는 이름은 비교에서 뺀다. 정확히 그 이름만 뺀다 — 꼬리가 `-` 인 항목(「oe-danger-border-」)만 접두 표지라 그 접두로 시작하는
 * 이름을 모두 뺀다(fenceLines 가 줄이 `-`·`*` 로 끝날 때만 넣는다). 이름을 접두로 넓히면 「oe-foreground-inverse」 가 oe-foreground-inverse-secondary 를,
 * 「oe」 가 코드 이름 전부를 빼서 거짓 ⚠ 가 났다. 자리표시자가 든 항목(「oe-{role}-foreground-primary」)은 그 자리에 어떤 낱말이 와도 맞는 이름을
 * 뺀다 — 자리표시자 줄이 말했을 수 있는 이름을 「문서 목록에 없는 코드 이름」 으로 세지 않기 위한 것이고, 이름을 지어 붙이는 쪽이 아니라 빼는 쪽이다.
 */
function except(names, partial) {
  const entries = [...partial];
  const heads = entries.filter((entry) => entry.endsWith("-"));
  const templates = entries.filter((entry) => isTemplate(entry)).map(templateOf);
  return names.filter((name) => !partial.has(name) && !heads.some((head) => name.startsWith(head)) && !templates.some((template) => template.test(name)));
}

/**
 * 절 안의 목록 줄. `loose` 에 맞는 줄(그 목록의 항목으로 보이는 줄) 가운데 `strict` 에 맞는 것은 `rows`(그룹은 strict 의 것),
 * 아닌 것은 `odd`(그룹은 loose 의 것 — 이름만) 다. odd 는 그 줄을 가리켜 「못 읽었다」 로 내고, 그 이름은 집합 비교에서 뺀다 —
 * 꼴이 조금 바뀐 줄을 「문서 목록에 없는 코드 이름」 어긋남으로 첫 행을 가리켜 내지 않기 위한 것이다. `strict` 는 g 없는 정규식.
 */
function listLines(section, loose, strict) {
  const all = findIn(section, loose);
  return {
    rows: all.filter((entry) => strict.test(entry.text)).map((entry) => ({ ...entry, groups: entry.text.match(strict).slice(1) })),
    odd: all.filter((entry) => !strict.test(entry.text)),
  };
}

/** `odd` 줄을 「못 읽었다」 로. `shape` 는 기대한 꼴의 보기다. */
const oddLines = (what, odd, shape, file) => odd.map((entry) => unreadable(what, `줄 「${entry.text}」 을 「${shape}」 로 읽지 못했다`, at(file, entry.line)));

/**
 * README 표 ↔ registry: 제목 집합 양방향, 같은 제목의 상태, 확정 행의 문서 링크 경로(`components/<key>.md`), 초안 행은 링크 없음.
 * 링크 대상 파일이 있는지는 apps/studio/src/lib/docs.test.ts 가 이미 막는 시험으로 재므로 여기서는 보지 않는다(NOT_MEASURED).
 */
export function compareReadmeTable(registrySource, readme) {
  const registry = parseRegistry(registrySource);
  if (!registry.length) return noRegistry();
  const table = parseReadmeComponentTable(readme);
  if (!table) return result([], [unreadable("README 컴포넌트 표", "「## Component」 절의 표(머리 행과 `| --- |` 구분 행)", FILES.readme)]);
  const unread = table.problems.map(({ detail, line }) => unreadable("README 컴포넌트 표", detail, at(FILES.readme, line)));
  if (!table.ok) return result([], unread);
  const drifts = [];
  const byTitle = new Map(table.rows.map((row) => [row.title, row]));
  for (const item of registry) {
    const row = byTitle.get(item.title);
    if (!row) {
      drifts.push(drift("README 컴포넌트 표에 없는 registry 항목", `${item.title}(${item.status})`, "없음", at(FILES.registry, item.line), at(FILES.readme, table.line)));
      continue;
    }
    if (row.status && row.status !== item.status) drifts.push(drift(`${item.title} 상태`, item.status, row.status, at(FILES.registry, item.line), at(FILES.readme, row.line)));
    if (row.docPath === undefined) continue;
    const expected = item.status === "확정" ? `components/${item.key}.md` : null;
    if (row.docPath !== expected) drifts.push(drift(`${item.title} 문서 링크`, expected ?? "없음(초안)", row.docPath ?? "없음", at(FILES.registry, item.line), at(FILES.readme, row.line)));
  }
  const titles = new Set(registry.map((item) => item.title));
  for (const row of table.rows) {
    if (!titles.has(row.title)) drifts.push(drift("registry 에 없는 README 표 행", "없음", `${row.title}(${row.status ?? "?"})`, FILES.registry, at(FILES.readme, row.line)));
  }
  return result(drifts, unread);
}

/**
 * docs/system/components/*.md 이름 → 확정 key, 문서→코드 한 방향(확정이 아닌 key 의 명세 = 고아 문서). 반대 방향 「확정마다
 * components/<key>.md 가 있다」 는 apps/studio/src/lib/docs.test.ts 가 이미 막는 시험으로 재므로 다시 재지 않는다(NOT_MEASURED).
 */
export function compareComponentDocSet(registrySource, docKeys) {
  const registry = parseRegistry(registrySource);
  if (!registry.length) return noRegistry();
  const confirmed = confirmedOf(registry);
  const drifts = [];
  const keys = new Set(confirmed.map((item) => item.key));
  for (const key of sortStrings(docKeys)) {
    if (!keys.has(key)) {
      const item = registry.find((entry) => entry.key === key);
      drifts.push(drift(`components/${key}.md 의 주인`, item ? `${key}(${item.status})` : `${key} registry 에 없음`, "명세 있음", at(FILES.registry, item?.line), `${FILES.componentDocs}/${key}.md`));
    }
  }
  return result(drifts);
}

/**
 * Studio 문서 디렉터리 ↔ registry href. registry 에 `/components/<dir>` href 가 없는 디렉터리(고아)만 본다 — 확정 ↔ href·page.tsx
 * 존재는 component-registry.test.ts 가 이미 잰다.
 */
export function compareStudioOrphans(registrySource, studioDirs) {
  const registry = parseRegistry(registrySource);
  if (!registry.length) return noRegistry();
  const withHref = new Set(registry.filter((item) => item.href).map((item) => item.href.replace(/^\/components\//, "")));
  const drifts = [];
  for (const dir of sortStrings(studioDirs)) if (!withHref.has(dir)) drifts.push(drift(`Studio 디렉터리 ${dir}`, "registry 에 그 href 없음(초안이거나 등록되지 않음)", "디렉터리 있음", FILES.registry, `${FILES.studioComponents}/${dir}`));
  return result(drifts);
}

/** 이름에서 띄어쓰기를 뗀 것이 export 이름이다. `Message File Attachment` → `MessageFileAttachment`. */
export const exportNameOf = (title) => title.replace(/\s+/g, "");

/**
 * @ooee/ui index.ts ↔ registry. 확정은 `./<key>` 모듈과 제목에서 띄어쓰기를 뗀 이름의 export 를 가져야 한다. 초안은 모듈이
 * 있을 때만 이름을 본다(초안은 아직 export 가 없어도 된다 — llms.txt:31 「쓰지 않는다」). registry 밖의 모듈은 README 가
 * export 이름을 백틱으로 언급해야 한다(README:97 `PartialMaskedInput`).
 */
export function compareUiExports(registrySource, uiIndexSource, readme) {
  const registry = parseRegistry(registrySource);
  if (!registry.length) return noRegistry();
  const modules = parseUiIndex(uiIndexSource);
  if (!modules.length) return result([], [unreadable("@ooee/ui export", "`export { … } from \"./module\"` 줄", FILES.uiIndex)]);
  const byModule = new Map(modules.map((entry) => [entry.module, entry]));
  const drifts = [];
  for (const item of registry) {
    const entry = byModule.get(item.key);
    if (!entry) {
      if (item.status === "확정") drifts.push(drift(`확정 ${item.key} 의 @ooee/ui 모듈`, "export 없음", `${item.title}(확정)`, FILES.uiIndex, at(FILES.registry, item.line)));
      continue;
    }
    const expected = exportNameOf(item.title);
    if (!entry.names.includes(expected)) drifts.push(drift(`${item.key} 의 export 이름`, entry.names.join(", "), `${item.title} → ${expected}`, at(FILES.uiIndex, entry.line), at(FILES.registry, item.line)));
  }
  const keys = new Set(registry.map((item) => item.key));
  for (const entry of modules) {
    if (keys.has(entry.module)) continue;
    const mentioned = entry.names.some((name) => readme.includes(`\`${name}\``));
    if (!mentioned) drifts.push(drift(`registry 에 없는 모듈 ${entry.module}`, entry.names.join(", "), "README 에 언급 없음", at(FILES.uiIndex, entry.line), FILES.readme));
  }
  return result(drifts);
}

/** 컴포넌트 문서의 H1 ↔ registry title, 메타줄 ↔ `packages/ui/src/<key>.tsx`(존재까지). */
export function compareComponentDoc(item, md, exists) {
  const parsed = parseComponentDoc(md);
  const file = `${FILES.componentDocs}/${item.key}.md`;
  const drifts = [];
  if (parsed.title === null) return result([], [unreadable(`${item.key}.md 제목`, "`# 제목` 줄", file)]);
  if (parsed.title !== item.title) drifts.push(drift(`${item.key}.md 제목`, item.title, parsed.title, at(FILES.registry, item.line), at(file, parsed.titleLine)));
  const expected = `packages/ui/src/${item.key}.tsx`;
  if (parsed.metaPath !== expected) drifts.push(drift(`${item.key}.md 구현 경로 메타줄`, `\`${expected}\``, parsed.metaText ? `「${parsed.metaText.slice(0, 40)}${parsed.metaText.length > 40 ? "…" : ""}」` : "없음", FILES.uiSrc, at(file, parsed.metaLine)));
  else if (!exists(expected)) drifts.push(drift(`${item.key}.md 구현 경로`, `${expected} 없음`, `\`${expected}\``, FILES.uiSrc, at(file, parsed.metaLine)));
  return result(drifts);
}

/** llms.txt 의 「확정 N종」 숫자와 초안 목록 ↔ registry. 확정 목록 자체는 llms-txt.test.mjs 가 잰다. */
export function compareLlms(registrySource, llms) {
  const registry = parseRegistry(registrySource);
  if (!registry.length) return noRegistry();
  const lists = parseLlmsLists(llms);
  const drifts = [];
  const unread = [];
  const confirmed = confirmedOf(registry);
  const drafts = sortStrings(registry.filter((item) => item.status === "초안").map((item) => item.key));
  if (!lists.confirmed) unread.push(unreadable("llms.txt 확정 개수", "「확정 N종: `key` …」 줄", FILES.llms));
  else if (lists.confirmed.count !== confirmed.length) drifts.push(drift("llms.txt 확정 개수", confirmed.length, `${lists.confirmed.count}종`, FILES.registry, at(FILES.llms, lists.confirmed.line)));
  if (!lists.draft) unread.push(unreadable("llms.txt 초안 목록", "「초안(쓰지 않는다): `key` …」 줄", FILES.llms));
  else {
    const listed = sortStrings(lists.draft.keys);
    if (listed.join() !== drafts.join()) drifts.push(drift("llms.txt 초안 목록", show(drafts.filter((key) => !listed.includes(key)).map((key) => `${key} 빠짐`)), show(listed.filter((key) => !drafts.includes(key)).map((key) => `${key} 는 초안 아님`)), FILES.registry, at(FILES.llms, lists.draft.line)));
  }
  return result(drifts, unread);
}

const badgeFiles = { code: `${FILES.uiSrc}/badge.tsx`, doc: `${FILES.componentDocs}/badge.md` };

/** 한글 수사·숫자 `word` 를 `expected` 와 비교해 어긋남 또는 못 읽음을 낸다. */
function compareCount(what, word, expected, codeAt, docAt, drifts, unread, docSuffix = "") {
  const number = koreanNumber(word);
  if (number === null) unread.push(unreadable(what, `「${word}」 를 숫자로 읽지 못했다`, docAt));
  else if (number !== expected) drifts.push(drift(what, `${expected}${docSuffix}`, `${word}${docSuffix}`, codeAt, docAt));
}

/** badge.md Properties 「- `color`: `BADGE_COLORS` 의 N색」 과 「색」 절 「Tailwind primitive N색」 — 두 문장을 각각 찾아 BADGE_COLORS.length 와 비교. */
export function compareBadgeColorCount(badgeSource, badgeDoc) {
  const colors = parseConstArray(badgeSource, "BADGE_COLORS");
  if (!colors) return result([], [unreadable("BADGE_COLORS", "`export const BADGE_COLORS = [ … ] as const`", badgeFiles.code)]);
  const drifts = [];
  const unread = [];
  const codeAt = at(badgeFiles.code, colors.line);
  const properties = sectionOf(badgeDoc, /^## Properties\s*$/m);
  const bullet = properties && findIn(properties, /^- `color`:.*$/gm)[0];
  const inBullet = bullet?.text.match(/`BADGE_COLORS`\s*의\s*(\d+|[가-힣]+?)\s*(?:색|개|가지)/);
  if (!bullet) unread.push(unreadable("BADGE_COLORS 개수", "「## Properties」 절의 「- `color`: …」 줄", badgeFiles.doc));
  else if (!inBullet) unread.push(unreadable("BADGE_COLORS 개수", "「- `color`」 줄의 「`BADGE_COLORS` 의 N색」", at(badgeFiles.doc, bullet.line)));
  else compareCount("BADGE_COLORS 개수", inBullet[1], colors.values.length, codeAt, at(badgeFiles.doc, bullet.line), drifts, unread, "색");
  const color = sectionOf(badgeDoc, /^## 색\s*$/m);
  const primitive = color && findIn(color, /primitive\s*(\d+|[가-힣]+?)\s*(?:색|개|가지)/g)[0];
  if (!color) unread.push(unreadable("BADGE_COLORS 개수", "「## 색」 절", badgeFiles.doc));
  else if (!primitive) unread.push(unreadable("BADGE_COLORS 개수", "「## 색」 절의 「Tailwind primitive N색」 문장", at(badgeFiles.doc, color.line)));
  else compareCount("BADGE_COLORS 개수", primitive.groups[0], colors.values.length, codeAt, at(badgeFiles.doc, primitive.line), drifts, unread, "색");
  return result(drifts, unread);
}

const TAILWIND_GRAYS = ["slate", "gray", "zinc", "neutral", "stone"];

/** badge.md 「색」 절 「회색 계열은 `gray` 하나만 둔다. `slate`·`zinc`·`neutral`·`stone` 은 …」 ↔ BADGE_COLORS 의 회색. */
export function compareBadgeGrayRule(badgeSource, badgeDoc) {
  const colors = parseConstArray(badgeSource, "BADGE_COLORS");
  if (!colors) return result([], [unreadable("BADGE_COLORS", "`export const BADGE_COLORS = [ … ] as const`", badgeFiles.code)]);
  const color = sectionOf(badgeDoc, /^## 색\s*$/m);
  if (!color) return result([], [unreadable("BADGE_COLORS 회색 규칙", "「## 색」 절", badgeFiles.doc)]);
  const sentence = findIn(color, /^.*회색 계열은\s*`(\w+)`\s*하나만.*$/gm)[0];
  if (!sentence) return result([], [unreadable("BADGE_COLORS 회색 규칙", "「## 색」 절의 「회색 계열은 `gray` 하나만」 문장", at(badgeFiles.doc, color.line))]);
  const kept = sentence.groups[0];
  const dropped = [...sentence.text.matchAll(/`(\w+)`/g)].map((hit) => hit[1]).filter((name) => name !== kept && TAILWIND_GRAYS.includes(name));
  const codeGrays = colors.values.filter((name) => TAILWIND_GRAYS.includes(name));
  const drifts = [];
  if (codeGrays.join() !== kept) drifts.push(drift("BADGE_COLORS 의 회색", show(codeGrays), `${kept} 하나`, at(badgeFiles.code, colors.line), at(badgeFiles.doc, sentence.line)));
  const leaked = dropped.filter((name) => colors.values.includes(name));
  if (leaked.length) drifts.push(drift("BADGE_COLORS 에서 걷어낸 회색", `${leaked.join(", ")} 있음`, `${dropped.join("·")} 은 두지 않는다`, at(badgeFiles.code, colors.line), at(badgeFiles.doc, sentence.line)));
  return result(drifts);
}

/**
 * Properties 「- `color`: …」 줄에서 **값을 말하는 문장**(「값은 `a`과 `b`다」 — 「값(은|는|이)」 부터 그 문장의 마침표까지)의 백틱 이름 ↔ 색 배열.
 * 같은 줄의 다른 문장(「`className`으로 덧칠하지 않는다」)에 든 백틱 낱말은 색 이름이 아니므로 읽지 않고, 「값은」 문장이 없으면 못 읽음이다.
 * 이름 집합이 주 검사고, 그 문장의 「하나」「둘」 같은 개수 수사는 있으면 보고 없으면 넘어간다(「한 가지」로 바뀌어도 이름 비교는 남는다).
 */
export function compareColorList(source, constName, doc, codeFile, docFile) {
  const colors = parseConstArray(source, constName);
  if (!colors) return result([], [unreadable(constName, `\`export const ${constName} = [ … ] as const\``, codeFile)]);
  const properties = sectionOf(doc, /^## Properties\s*$/m);
  if (!properties) return result([], [unreadable(constName, "「## Properties」 절", docFile)]);
  const bullet = findIn(properties, /^- `color`:.*$/gm)[0];
  if (!bullet) return result([], [unreadable(constName, "「## Properties」 절의 「- `color`: …」 줄", at(docFile, properties.line))]);
  const clauseAt = bullet.text.search(/값(?:은|는|이)\s/);
  if (clauseAt < 0) return result([], [unreadable(constName, "「- `color`」 줄의 「값은 `a`과 `b`다」 문장", at(docFile, bullet.line))]);
  const { end } = sentenceAround(bullet.text, clauseAt);
  const clause = bullet.text.slice(clauseAt, end);
  const names = sortStrings([...clause.matchAll(/`([a-z][\w-]*)`/g)].map((hit) => hit[1]).filter((name) => !["color", "tone", "custom"].includes(name)));
  if (!names.length) return result([], [unreadable(constName, `「값은 …」 문장 「${clause}」 에 백틱 색 이름이 없다`, at(docFile, bullet.line))]);
  const code = sortStrings(colors.values);
  const drifts = [];
  if (names.join() !== code.join()) drifts.push(drift(constName, show(code), show(names), at(codeFile, colors.line), at(docFile, bullet.line)));
  const count = clause.match(/`\s*(하나|둘|셋|넷|다섯|여섯|일곱|여덟|아홉|열|\d+)(?=\s*(?:다|이다|개|가지|이며|이고|\.|$))/);
  if (count && koreanNumber(count[1]) !== code.length) drifts.push(drift(`${constName} 개수`, code.length, count[1], at(codeFile, colors.line), at(docFile, bullet.line)));
  return result(drifts);
}

/**
 * bottom-navigation.md ↔ MAX_ITEMS. 세 자리를 각각 찾는다 — Properties 「- `items`」 줄의 「셋부터 N까지」와 「N을 넘기면 … 오류」(N = MAX+1),
 * 「## 항목 목록을 받는 이유」 절의 「항목이 N을 넘으면 … 오류」, 「### 항목 정하기」 절의 「셋부터 N까지」. 최소 「셋」은 코드에 상수가 없어 비교하지 않는다.
 */
export function compareBottomNavigationMax(source, doc) {
  const max = parseNumberConst(source, "MAX_ITEMS");
  const codeFile = `${FILES.uiSrc}/bottom-navigation.tsx`;
  const docFile = `${FILES.componentDocs}/bottom-navigation.md`;
  if (!max) return result([], [unreadable("BOTTOM_NAVIGATION_MAX_ITEMS", "`const MAX_ITEMS = N`", codeFile)]);
  const drifts = [];
  const unread = [];
  const what = "BOTTOM_NAVIGATION_MAX_ITEMS";
  const codeAt = at(codeFile, max.line);
  const number = "(\\d+|[가-힣]+?)\\s*(?:개)?\\s*(?:을|를)?";
  const properties = sectionOf(doc, /^## Properties\s*$/m);
  const items = properties && findIn(properties, /^- `items`:.*$/gm)[0];
  if (!items) unread.push(unreadable(what, "「## Properties」 절의 「- `items`: …」 줄", docFile));
  else {
    const range = items.text.match(/셋부터\s*(\d+|[가-힣]+?)\s*(?:개)?\s*까지/);
    if (!range) unread.push(unreadable(what, "「- `items`」 줄의 「셋부터 N까지」", at(docFile, items.line)));
    else compareCount(what, range[1], max.value, codeAt, at(docFile, items.line), drifts, unread);
    const over = items.text.match(new RegExp(`${number}\\s*넘기면[^.\\n]*오류`));
    if (!over) unread.push(unreadable(what, "「- `items`」 줄의 「N을 넘기면 … 오류」", at(docFile, items.line)));
    else compareCount(`${what} 를 넘기는 첫 개수`, over[1], max.value + 1, codeAt, at(docFile, items.line), drifts, unread, "을 넘기면 오류");
  }
  const reason = sectionOf(doc, /^## 항목 목록을 받는 이유\s*$/m);
  const bold = reason && findIn(reason, new RegExp(`항목이\\s*${number}\\s*넘(?:으|기)면[^.\\n]*오류`, "g"))[0];
  if (!reason) unread.push(unreadable(what, "「## 항목 목록을 받는 이유」 절", docFile));
  else if (!bold) unread.push(unreadable(what, "「## 항목 목록을 받는 이유」 절의 「항목이 N을 넘으면 … 오류」 문장", at(docFile, reason.line)));
  else compareCount(what, bold.groups[0], max.value, codeAt, at(docFile, bold.line), drifts, unread);
  const guide = sectionOf(doc, /^### 항목 정하기\s*$/m);
  const rule = guide && findIn(guide, /셋부터\s*(\d+|[가-힣]+?)\s*(?:개)?\s*까지/g)[0];
  if (!guide) unread.push(unreadable(what, "「### 항목 정하기」 절", docFile));
  else if (!rule) unread.push(unreadable(what, "「### 항목 정하기」 절의 「셋부터 N까지」 문장", at(docFile, guide.line)));
  else compareCount(what, rule.groups[0], max.value, codeAt, at(docFile, rule.line), drifts, unread);
  return result(drifts, unread);
}

/** 절 안에서 `regex` 를 하나 찾아 숫자를 코드 값과 비교한다. 절이나 문장이 없으면 못 읽음. */
function expectPx(what, doc, docFile, heading, headingLabel, regex, sentenceLabel, code, codeAt, drifts, unread) {
  const section = sectionOf(doc, heading);
  if (!section) {
    unread.push(unreadable(what, `「${headingLabel}」 절`, docFile));
    return null;
  }
  const hit = findIn(section, regex)[0];
  if (!hit) {
    unread.push(unreadable(what, `「${headingLabel}」 절의 ${sentenceLabel}`, at(docFile, section.line)));
    return null;
  }
  if (Number(hit.groups[0]) !== code) drifts.push(drift(what, `${code}px`, `${hit.groups[0]}px`, codeAt, at(docFile, hit.line)));
  return hit;
}

const textareaFiles = { code: `${FILES.uiSrc}/textarea.tsx`, doc: `${FILES.componentDocs}/textarea.md` };

/** textarea.tsx 의 `height = 80`·`Math.max(80, height)`·컨테이너 `min-h-20` ↔ textarea.md Specification 「Minimum height」와 Height·Guidelines 절의 산문 셋. */
export function compareTextareaHeight(source, doc) {
  const defaultHeight = source.match(/\bheight\s*=\s*(\d+)/);
  const clamp = source.match(/Math\.max\(\s*(\d+)\s*,\s*height\s*\)/);
  const container = parseCvaBase(source, "textareaContainerVariants");
  const containerMin = container ? classPx(container.classes, "min-h") : null;
  if (!defaultHeight || !clamp || containerMin === null) return result([], [unreadable("Textarea 최소·기본 높이", "`height = N`·`Math.max(N, height)`·컨테이너 `min-h-N`", textareaFiles.code)]);
  const drifts = [];
  const unread = [];
  const code = Number(defaultHeight[1]);
  const codeAt = at(textareaFiles.code, lineAt(source, defaultHeight.index));
  if (Number(clamp[1]) !== code) drifts.push(drift("Textarea 기본 높이와 최소 높이", `기본 ${code}`, `Math.max ${clamp[1]}`, codeAt, at(textareaFiles.code, lineAt(source, clamp.index))));
  if (containerMin !== code) drifts.push(drift("Textarea 기본 높이와 컨테이너 min-h", `기본 ${code}`, `min-h ${containerMin}px`, codeAt, at(textareaFiles.code, container.line)));
  expectPx("Textarea 최소 높이", doc, textareaFiles.doc, /^## Specification\s*$/m, "## Specification", /^- Minimum height:\s*`?(\d+)\s*px`?/gm, "「- Minimum height: `Npx`」 줄", code, codeAt, drifts, unread);
  expectPx("Textarea 최소 높이(산문)", doc, textareaFiles.doc, /^### Height\s*$/m, "### Height", /최소값은\s*(\d+)\s*px/g, "「최소값은 Npx」 문장", code, codeAt, drifts, unread);
  expectPx("Textarea 기본 높이(산문)", doc, textareaFiles.doc, /^### Height\s*$/m, "### Height", /기본값은\s*(\d+)\s*px/g, "「기본값은 Npx」 문장", code, codeAt, drifts, unread);
  expectPx("Textarea 기본 높이(산문)", doc, textareaFiles.doc, /^### 기본 높이는[^\n]*$/m, "### 기본 높이는 …", /기본 높이는\s*(\d+)\s*px/g, "「기본 높이는 Npx」 문장", code, codeAt, drifts, unread);
  return result(drifts, unread);
}

/** textarea 요소의 `min-h-[4.875rem]`(78px) ↔ textarea.md Specification 「Textarea field minimum height: `78px` (… 전체 최소 높이 80px)」. */
export function compareTextareaFieldHeight(source, doc) {
  const field = source.match(/data-slot="textarea"\s+className=\{cn\("([^"]+)"/);
  const fieldMin = field ? classPx(field[1], "min-h") : null;
  const container = parseCvaBase(source, "textareaContainerVariants");
  const containerMin = container ? classPx(container.classes, "min-h") : null;
  if (fieldMin === null || containerMin === null) return result([], [unreadable("Textarea field 최소 높이", "textarea 요소의 `min-h-[…]` 와 컨테이너 `min-h-N`", textareaFiles.code)]);
  const section = sectionOf(doc, /^## Specification\s*$/m);
  if (!section) return result([], [unreadable("Textarea field 최소 높이", "「## Specification」 절", textareaFiles.doc)]);
  const spec = findIn(section, /^- Textarea field minimum height:\s*`?(\d+)\s*px`?(?:\s*\(.*?전체 최소 높이\s*(\d+)\s*px\))?/gm)[0];
  if (!spec) return result([], [unreadable("Textarea field 최소 높이", "「## Specification」 절의 「- Textarea field minimum height: `Npx`」 줄", at(textareaFiles.doc, section.line))]);
  const codeAt = at(textareaFiles.code, lineAt(source, field.index));
  const docAt = at(textareaFiles.doc, spec.line);
  const drifts = [];
  const [fieldDoc, totalDoc] = spec.groups;
  if (Number(fieldDoc) !== fieldMin) drifts.push(drift("Textarea field 최소 높이", `${fieldMin}px`, `${fieldDoc}px`, codeAt, docAt));
  if (totalDoc && Number(totalDoc) !== containerMin) drifts.push(drift("Textarea 전체 최소 높이(괄호)", `${containerMin}px`, `${totalDoc}px`, at(textareaFiles.code, container.line), docAt));
  if (fieldMin + 2 !== containerMin) drifts.push(drift("Textarea field + border 2px", `${fieldMin} + 2 = ${fieldMin + 2}`, `전체 ${containerMin}px`, codeAt, docAt));
  return result(drifts);
}

const checkboxFiles = { code: `${FILES.uiSrc}/checkbox.tsx`, doc: `${FILES.componentDocs}/checkbox.md` };

/** checkbox.tsx 의 `size-4`(control·indicator) ↔ checkbox.md Specification 「Control: 16 × 16px」와 Anatomy·Properties 절의 산문 셋. */
export function compareCheckboxControl(source, doc) {
  const control = parseCvaBase(source, "checkboxVariants");
  const indicator = parseCvaBase(source, "checkboxIndicatorVariants");
  const controlPx = control ? classPx(control.classes, "size") : null;
  const indicatorPx = indicator ? classPx(indicator.classes, "size") : null;
  if (controlPx === null || indicatorPx === null) return result([], [unreadable("Checkbox control 크기", "`checkboxVariants`·`checkboxIndicatorVariants` 의 `size-N`", checkboxFiles.code)]);
  const drifts = [];
  const unread = [];
  const codeAt = at(checkboxFiles.code, control.line);
  if (controlPx !== indicatorPx) drifts.push(drift("Checkbox control 과 indicator 크기", `${controlPx}px`, `${indicatorPx}px`, codeAt, at(checkboxFiles.code, indicator.line)));
  const section = sectionOf(doc, /^## Specification\s*$/m);
  const spec = section && findIn(section, /^- Control:\s*(\d+)\s*[×x*]\s*(\d+)\s*px/gm)[0];
  if (!section) unread.push(unreadable("Checkbox control 크기", "「## Specification」 절", checkboxFiles.doc));
  else if (!spec) unread.push(unreadable("Checkbox control 크기", "「## Specification」 절의 「- Control: 16 × 16px」 줄", at(checkboxFiles.doc, section.line)));
  else if (Number(spec.groups[0]) !== controlPx || Number(spec.groups[1]) !== controlPx) drifts.push(drift("Checkbox control 크기", `${controlPx}px`, `${spec.groups[0]} × ${spec.groups[1]}px`, codeAt, at(checkboxFiles.doc, spec.line)));
  expectPx("Checkbox control 크기(산문)", doc, checkboxFiles.doc, /^## Anatomy\s*$/m, "## Anatomy", /(\d+)\s*px Checkbox 본체/g, "「Npx Checkbox 본체」 문장", controlPx, codeAt, drifts, unread);
  expectPx("Checkbox control 크기(산문)", doc, checkboxFiles.doc, /^## Anatomy\s*$/m, "## Anatomy", /Checkbox의\s*(\d+)\s*px 비상호작용/g, "「Checkbox의 Npx 비상호작용」 문장", controlPx, codeAt, drifts, unread);
  expectPx("Checkbox control 크기(산문)", doc, checkboxFiles.doc, /^## Properties\s*$/m, "## Properties", /Control은\s*(\d+)\s*px/g, "「Control은 Npx」 문장", controlPx, codeAt, drifts, unread);
  return result(drifts, unread);
}

/** checkbox.tsx indicator 아이콘 `size-2.5`(10px)·ghost `size-[15px]` ↔ checkbox.md Specification 「Indicator: Square·Rounded 10 × 10px / Ghost 15 × 15px」와 Properties 절의 산문 둘. */
export function compareCheckboxIndicatorIcons(source, doc) {
  const ghost = source.match(/shape === "ghost"\s*\?\s*\(\s*<RiCheckLine className="([^"]+)"/);
  const check = source.match(/RiCheckLine data-slot="checkbox-indicator-check" className=\{cn\("([^"]+)"/);
  const ghostPx = ghost ? classPx(ghost[1], "size") : null;
  const checkPx = check ? classPx(check[1], "size") : null;
  if (ghostPx === null || checkPx === null) return result([], [unreadable("Checkbox indicator 아이콘 크기", "ghost `RiCheckLine className=\"size-[…]\"` 와 `checkbox-indicator-check` 의 `size-N`", checkboxFiles.code)]);
  const drifts = [];
  const unread = [];
  const checkAt = at(checkboxFiles.code, lineAt(source, check.index));
  const ghostAt = at(checkboxFiles.code, lineAt(source, ghost.index));
  const section = sectionOf(doc, /^## Specification\s*$/m);
  const spec = section && findIn(section, /^- Indicator:.*?Rounded\s*(\d+)\s*[×x*]\s*\d+\s*px.*?Ghost\s*(\d+)\s*[×x*]\s*\d+\s*px/gm)[0];
  if (!section) unread.push(unreadable("Checkbox indicator 아이콘 크기", "「## Specification」 절", checkboxFiles.doc));
  else if (!spec) unread.push(unreadable("Checkbox indicator 아이콘 크기", "「## Specification」 절의 「- Indicator: Square·Rounded 10 × 10px / Ghost 15 × 15px」 줄", at(checkboxFiles.doc, section.line)));
  else {
    if (Number(spec.groups[0]) !== checkPx) drifts.push(drift("Checkbox indicator 아이콘(Square·Rounded)", `${checkPx}px`, `${spec.groups[0]}px`, checkAt, at(checkboxFiles.doc, spec.line)));
    if (Number(spec.groups[1]) !== ghostPx) drifts.push(drift("Checkbox indicator 아이콘(Ghost)", `${ghostPx}px`, `${spec.groups[1]}px`, ghostAt, at(checkboxFiles.doc, spec.line)));
  }
  expectPx("Checkbox indicator 아이콘(산문)", doc, checkboxFiles.doc, /^## Properties\s*$/m, "## Properties", /둘 다\s*(\d+)\s*px icon/g, "「둘 다 Npx icon」 문장", checkPx, checkAt, drifts, unread);
  expectPx("Checkbox indicator 아이콘(Ghost, 산문)", doc, checkboxFiles.doc, /^## Properties\s*$/m, "## Properties", /Ghost icon은\s*(\d+)\s*px/g, "「Ghost icon은 Npx」 문장", ghostPx, ghostAt, drifts, unread);
  return result(drifts, unread);
}

const BADGE_SPEC_ROWS = { 높이: "h", "좌우 여백": "px", "아이콘이 붙는 변": "pl" };

/**
 * badge.md Specification 표(높이·좌우 여백·아이콘이 붙는 변) ↔ SIZE_CLASS 의 h·px·pl. 표 머리 `| 자리 | small | medium |` 의 열이
 * SIZE_CLASS 의 키와 같아야 하고(열이 늘면 못 읽음), 기대하는 행 셋이 각각 있어야 하며, 칸 수가 머리 행과 다른 행도 못 읽음이다.
 */
export function compareBadgeSpecTable(source, doc) {
  const sizes = parseSizeClasses(source);
  if (!sizes) return result([], [unreadable("Badge SIZE_CLASS", "`const SIZE_CLASS = { small: \"…\", medium: \"…\" }`", badgeFiles.code)]);
  // 「색」 절에도 `| 자리 | Light | Dark |` 표가 있으므로 Specification 절 안에서만 읽는다.
  const section = sectionOf(doc, /^## Specification\s*$/m);
  const table = section && parseTable(section);
  if (!section) return result([], [unreadable("Badge Specification 표", "「## Specification」 절", badgeFiles.doc)]);
  if (!table) return result([], [unreadable("Badge Specification 표", "「## Specification」 절의 표(머리 행과 구분 행)", at(badgeFiles.doc, section.line))]);
  const columns = table.header.slice(1).map(stripTicks);
  const sizeKeys = Object.keys(sizes.entries);
  if (table.header[0] !== "자리" || sortStrings(columns).join() !== sortStrings(sizeKeys).join()) {
    return result([], [unreadable("Badge Specification 표", `머리 행 「| ${table.header.join(" | ")} |」 의 열이 SIZE_CLASS 의 단계(${sizeKeys.join(", ")})와 다르다`, at(badgeFiles.doc, table.line))]);
  }
  const drifts = [];
  const unread = [];
  const byLabel = new Map(table.rows.map((row) => [row.cells[0], row]));
  for (const [label, prefix] of Object.entries(BADGE_SPEC_ROWS)) {
    const row = byLabel.get(label);
    if (!row) {
      unread.push(unreadable("Badge Specification 표", `「| ${label} | …」 행`, at(badgeFiles.doc, table.line)));
      continue;
    }
    if (row.cells.length !== table.header.length) {
      unread.push(unreadable("Badge Specification 표", `「${label}」 행의 칸이 ${row.cells.length}개다(머리 행은 ${table.header.length}개)`, at(badgeFiles.doc, row.line)));
      continue;
    }
    columns.forEach((column, index) => {
      const value = row.cells[index + 1].match(/^(\d+)\s*px$/);
      if (!value) {
        unread.push(unreadable("Badge Specification 표", `「${label}」 행의 ${column} 칸 「${row.cells[index + 1]}」 을 px 로 읽지 못했다`, at(badgeFiles.doc, row.line)));
        return;
      }
      const px = classPx(sizes.entries[column], prefix);
      if (px !== Number(value[1])) drifts.push(drift(`Badge ${column} ${label}`, px === null ? `${prefix}-* 없음` : `${px}px`, `${value[1]}px`, at(badgeFiles.code, sizes.line), at(badgeFiles.doc, row.line)));
    });
  }
  return result(drifts, unread);
}

const BADGE_TONE_PROPS = { bg: "배경", text: "글자", border: "경계" };

/**
 * badge.tsx `toneClass` 의 Style 별 단계 — `bg-${color(600)} text-white`·`dark:bg-${color(300)}/20` 같은 조각을 `{ variant, prop, light, dark }` 로.
 * `if (variant === "x") return \`…\`` 이 명시한 Style 과, 마지막 `return` 이 맡는 나머지 Style(BadgeVariant 유니온에서 명시된 것을 뺀 하나)을 읽는다.
 * `dark:` 조각이 없는 property 는 Dark 도 Light 와 같다(Tailwind 의 뜻 그대로). 단계는 `{ step: "600" }`·`{ step: "300", alpha: "20" }`·`{ name: "white" }`.
 */
export function parseBadgeToneClass(source) {
  const start = source.indexOf("function toneClass(");
  if (start < 0) return null;
  const end = source.indexOf("\n}", start);
  const body = source.slice(start, end < 0 ? undefined : end);
  const variants = parseTypeUnion(source, "BadgeVariant");
  const returns = [...body.matchAll(/(?:if \(variant === "(\w+)"\) )?return `([^`]*)`/g)];
  if (!variants || !returns.length) return null;
  const explicit = returns.map((hit) => hit[1]).filter(Boolean);
  const rest = variants.values.filter((name) => !explicit.includes(name));
  const entries = [];
  for (const hit of returns) {
    const variant = hit[1] ?? (rest.length === 1 ? rest[0] : null);
    if (!variant) return null;
    const byProp = {};
    for (const piece of hit[2].trim().split(/\s+/)) {
      const part = piece.match(/^(dark:)?(bg|text|border)-(?:\$\{\w+\((\d+)\)\}|([a-z]+))(?:\/(\d+))?$/);
      if (!part) return null;
      const [, dark, prop, step, name, alpha] = part;
      const value = step ? { step, ...(alpha ? { alpha } : {}) } : { name };
      byProp[prop] ??= {};
      byProp[prop][dark ? "dark" : "light"] = value;
    }
    for (const [prop, modes] of Object.entries(byProp)) entries.push({ variant, prop, light: modes.light ?? modes.dark, dark: modes.dark ?? modes.light });
  }
  return { entries, line: lineAt(source, start) };
}

/** 표의 칸 「600」「`white`」「300 의 20% 알파」 → parseBadgeToneClass 의 값 꼴. 못 읽으면 null. */
const toneCell = (cell) => {
  const hit = stripTicks(cell).match(/^(?:(\d+)|([a-z]+))(?:\s*의\s*(\d+)%\s*알파)?$/);
  if (!hit) return null;
  if (hit[2]) return hit[3] ? null : { name: hit[2] };
  return { step: hit[1], ...(hit[3] ? { alpha: hit[3] } : {}) };
};
const showTone = (value) => (value.name ? value.name : value.alpha ? `${value.step} 의 ${value.alpha}% 알파` : value.step);

/**
 * badge.md 「## 색」 절의 `| 자리 | Light | Dark |` 표 ↔ toneClass. 행 라벨은 「`fill` 배경」(Style + 배경·글자·경계) 이어야 하고, 칸은
 * 「600」「`white`」「300 의 20% 알파」 꼴이어야 한다. 머리 행이 다르거나 행·칸을 못 읽으면 그 자리를 가리켜 못 읽음이고, 표에 없는 코드 자리·코드에 없는 표 행은 어긋남이다.
 */
export function compareBadgeToneTable(source, doc) {
  const what = "Badge 색 단계 표";
  const tone = parseBadgeToneClass(source);
  if (!tone) return result([], [unreadable(what, "`function toneClass(…)` 의 `return \\`bg-${color(N)} …\\`` 셋과 `type BadgeVariant`", badgeFiles.code)]);
  const section = sectionOf(doc, /^## 색\s*$/m);
  const table = section && parseTable(section);
  if (!section) return result([], [unreadable(what, "「## 색」 절", badgeFiles.doc)]);
  if (!table) return result([], [unreadable(what, "「## 색」 절의 `| 자리 | Light | Dark |` 표(머리 행과 구분 행)", at(badgeFiles.doc, section.line))]);
  if (table.header.join("|") !== "자리|Light|Dark") return result([], [unreadable(what, `머리 행 「| ${table.header.join(" | ")} |」 이 「| 자리 | Light | Dark |」 가 아니다`, at(badgeFiles.doc, table.line))]);
  const drifts = [];
  const unread = [];
  const codeAt = at(badgeFiles.code, tone.line);
  const seen = new Set();
  for (const { cells, line } of table.rows) {
    const docAt = at(badgeFiles.doc, line);
    const label = cells.length === 3 && cells[0].match(/^`(\w+)`\s*(배경|글자|경계)$/);
    if (!label) {
      unread.push(unreadable(what, `행 「| ${cells.join(" | ")} |」 을 「| \`style\` 배경|글자|경계 | Light | Dark |」 로 읽지 못했다`, docAt));
      continue;
    }
    const [, variant, propLabel] = label;
    const prop = Object.keys(BADGE_TONE_PROPS).find((key) => BADGE_TONE_PROPS[key] === propLabel);
    const light = toneCell(cells[1]);
    const dark = toneCell(cells[2]);
    seen.add(`${variant} ${prop}`);
    if (!light || !dark) {
      unread.push(unreadable(what, `「${cells[0]}」 행의 칸 「${light ? cells[2] : cells[1]}」 을 「600」「\`white\`」「300 의 20% 알파」 로 읽지 못했다`, docAt));
      continue;
    }
    const entry = tone.entries.find((candidate) => candidate.variant === variant && candidate.prop === prop);
    if (!entry) {
      drifts.push(drift(`Badge ${variant} ${propLabel}`, `toneClass 에 ${prop}- 없음`, `${showTone(light)} / ${showTone(dark)}`, codeAt, docAt));
      continue;
    }
    if (showTone(entry.light) !== showTone(light)) drifts.push(drift(`Badge ${variant} ${propLabel} Light`, showTone(entry.light), showTone(light), codeAt, docAt));
    if (showTone(entry.dark) !== showTone(dark)) drifts.push(drift(`Badge ${variant} ${propLabel} Dark`, showTone(entry.dark), showTone(dark), codeAt, docAt));
  }
  // 못 읽은 행이 있으면 표가 온전하지 않으므로 「표에 행 없음」 은 세지 않는다(못 읽음 하나로 충분하다).
  if (!unread.length) {
    for (const entry of tone.entries) {
      if (!seen.has(`${entry.variant} ${entry.prop}`)) drifts.push(drift(`Badge ${entry.variant} ${BADGE_TONE_PROPS[entry.prop]}`, `${showTone(entry.light)} / ${showTone(entry.dark)}`, "표에 행 없음", codeAt, at(badgeFiles.doc, table.line)));
    }
  }
  return result(drifts, unread);
}

/**
 * Properties 열거값 ↔ 코드. 문서 「## Properties」 절의 `- `prop`: `a | b`` 줄과 코드의 값 집합을 비교한다. 순서는 보지 않는다
 * (문서는 산문 차례). 표는 컴포넌트마다 prop → 코드 쪽 읽는 법이다.
 *   "TypeName"                — `type TypeName = "a" | "b"` 유니온
 *   { cva: "name" }           — cva `name` 의 `variants: { prop: { a, b } }` 키
 *   { inline: true }          — 타입 안의 `prop?: "a" | "b"`(여러 곳에 나뉜 `{ layout?: "fill" } | { layout: "fixed" }` 도 합친다)
 *   { boolean: true }         — `prop?: boolean` → 문서의 `false | true`
 *   { record: "NAME" }        — `const NAME = { a: …, b: … }` 의 키(`keyof typeof NAME`)
 *   … , file: "other.tsx"     — 값이 다른 모듈에 있을 때(`InputButton` 은 input.tsx 의 cva, `Select` 는 selection-trigger.ts)
 * 문서에 열거 줄이 있는데 이 표에 없는 prop 은 `unmeasuredEnumLines` 가 「재지 않는 것」 에 줄 번호로 낸다.
 */
const INPUT_CVA = { cva: "inputContainerVariants", file: "input.tsx" };
const TRIGGER_CVA = { cva: "selectionTriggerVariants", file: "selection-trigger.ts" };
const INLINE = { inline: true };
const BOOLEAN = { boolean: true };
export const ENUM_TABLE = Object.freeze({
  badge: { tone: "BadgeTone", variant: "BadgeVariant", size: "BadgeSize" },
  button: { variant: "ButtonVariant", tone: "ButtonTone", controlSize: "ButtonSize", layout: "ButtonLayout" },
  "toggle-button": { variant: "ToggleButtonVariant", tone: "ToggleButtonTone", controlSize: "ToggleButtonSize" },
  "notification-badge": { tone: "NotificationBadgeTone", max: "NotificationBadgeMax" },
  "app-header": { titleAlign: "AppHeaderTitleAlign", titleHidden: BOOLEAN, sticky: BOOLEAN },
  chip: { shape: "ChipShape", controlSize: "ChipSize", leadingTone: "ChipTone", trailingTone: "ChipTone" },
  checkbox: { shape: { cva: "checkboxVariants" }, layout: INLINE },
  radio: { layout: INLINE },
  switch: { labelPosition: INLINE },
  "bottom-navigation": { variant: { record: "VARIANT_CLASS" }, showLabels: BOOLEAN },
  input: { variant: { cva: "inputContainerVariants" }, controlSize: { cva: "inputContainerVariants" }, layout: INLINE, textAlign: INLINE },
  "input-button": { variant: INPUT_CVA, controlSize: INPUT_CVA, layout: INLINE },
  "number-input": { variant: INPUT_CVA, controlSize: INPUT_CVA, layout: INLINE, textAlign: { ...INLINE, file: "input.tsx" }, controlsPosition: INLINE, prefixTone: "NumberInputAffixTone", suffixTone: "NumberInputAffixTone" },
  // 문서가 `MultiSelect.valueDisplay` 처럼 컴포넌트 이름을 앞에 붙인 prop 은 `as` 가 코드 쪽 이름이다.
  select: { variant: TRIGGER_CVA, controlSize: TRIGGER_CVA, layout: INLINE, "MultiSelect.valueDisplay": { ...INLINE, as: "valueDisplay" } },
  combobox: { variant: TRIGGER_CVA, controlSize: TRIGGER_CVA, "MultiCombobox.selectedItems": { ...INLINE, as: "selectedItems" } },
});

/** 표의 규칙 하나로 코드 값을 읽는다. `shape` 는 못 읽었을 때 「무엇을 찾다가」 에 적는 기대 꼴이다. */
function readEnumValues(source, docProp, rule) {
  const prop = rule.as ?? docProp;
  if (typeof rule === "string") return { code: parseTypeUnion(source, rule), shape: `\`type ${rule} = "a" | "b"\`` };
  if (rule.cva) return { code: parseCvaVariantKeys(source, rule.cva, prop), shape: `cva ${rule.cva} 의 \`${prop}: { … }\`` };
  if (rule.record) return { code: parseRecordKeys(source, rule.record), shape: `\`const ${rule.record} = { a: …, b: … }\`` };
  if (rule.boolean) return { code: parseBooleanProp(source, prop), shape: `\`${prop}?: boolean\`` };
  return { code: parseInlineUnion(source, prop), shape: `\`${prop}?: "a" | "b"\`` };
}

/** `readOther(fileName)` 은 `file` 이 붙은 규칙의 다른 모듈(packages/ui/src/<fileName>)을 읽는다. 못 읽으면 null. */
export function compareEnums(key, source, doc, readOther = () => null) {
  const table = ENUM_TABLE[key];
  if (!table) return result();
  const docFile = `${FILES.componentDocs}/${key}.md`;
  const properties = sectionOf(doc, /^## Properties\s*$/m);
  if (!properties) return result([], [unreadable(`${key} 열거값`, "「## Properties」 절", docFile)]);
  const { enums, split } = parseDocEnums(properties);
  const drifts = [];
  const unread = split.flatMap(({ props, line }) => props.map((prop) => unreadable(`${key} ${prop} 열거값`, ENUM_SPLIT, at(docFile, line))));
  for (const [prop, rule] of Object.entries(table)) {
    const what = `${key} ${prop} 열거값`;
    const codeFile = `${FILES.uiSrc}/${rule.file ?? `${key}.tsx`}`;
    const text = rule.file ? readOther(rule.file) : source;
    if (text === null || text === undefined) {
      unread.push(unreadable(what, "파일을 읽지 못했다", codeFile));
      continue;
    }
    const { code, shape } = readEnumValues(text, prop, rule);
    if (!code) {
      unread.push(unreadable(what, shape, codeFile));
      continue;
    }
    const documented = enums[prop];
    if (!documented) {
      if (!split.some((entry) => entry.props.includes(prop))) unread.push(unreadable(what, `「## Properties」 절의 「- \`${prop}\`: \`a | b\`」 줄`, at(docFile, properties.line)));
      continue;
    }
    const codeValues = sortStrings(code.values);
    const docValues = sortStrings(documented.values);
    if (codeValues.join("|") !== docValues.join("|")) drifts.push(drift(what, code.values.join(" | "), documented.values.join(" | "), at(codeFile, code.line), at(docFile, documented.line)));
  }
  return result(drifts, unread);
}

/**
 * 컴포넌트 문서(key → 원문)에서 값에 `|` 가 든 목록 줄(`ENUM_LINE_LOOSE`, 펜스 밖 전체) 가운데 재지 않는 것 — 「재지 않는 것」 한 줄씩.
 * 세 갈래다: 「- `prop`: `a | b`」 꼴이 아닌 줄(message-bubble.md 「- 방향: `incoming | outgoing`」), 그 꼴이지만 「## Properties」 절 밖인 줄,
 * 절 안이지만 ENUM_TABLE 에 읽는 법이 없는 컴포넌트·prop. 절 안의 「값 묶음 둘 이상」 줄은 `compareEnums` 가 ? 로 내므로 여기서 다시 대지 않는다.
 * 이름을 대지 않고 「=」 로 보이는 줄이 없게 하려는 것이다.
 */
export function unmeasuredEnumLines(docs) {
  const skipped = [];
  for (const [key, md] of Object.entries(docs)) {
    const file = `${FILES.componentDocs}/${key}.md`;
    const properties = sectionOf(md, /^## Properties\s*$/m);
    const inProperties = (line) => properties !== null && line >= properties.line && line < properties.line + properties.text.split("\n").length;
    for (const block of paragraphsOf(md)) {
      if (block.kind !== "paragraph") continue;
      // 문단은 이어진 줄을 합친 것이라 첫 줄만 목록 줄이다. 그 첫 줄의 원문으로 꼴을 본다.
      const line = block.lineAt(0);
      const firstLine = md.split("\n")[line - 1].trim();
      const read = classifyEnumLine(firstLine);
      if (!read) continue;
      if (read.kind === "odd") {
        skipped.push(`${at(file, line)} 열거 줄 「${firstLine.slice(0, 60)}${firstLine.length > 60 ? "…" : ""}」 — 「${ENUM_SHAPE}」 꼴이 아니라 코드 쪽을 짚을 수 없어 재지 않는다`);
        continue;
      }
      for (const prop of read.props) {
        if (!inProperties(line)) skipped.push(`${at(file, line)} \`${prop}\` 열거값 — 「## Properties」 절 밖의 줄이라 재지 않는다`);
        else if (!ENUM_TABLE[key] || (read.kind === "measured" && !ENUM_TABLE[key][prop])) skipped.push(`${at(file, line)} \`${prop}\` 열거값 — 코드 쪽 읽는 법이 ENUM_TABLE 에 없어 재지 않는다(개발자가 표에 더한다)`);
      }
    }
  }
  return skipped;
}

const brandNames = (tokensSource) => {
  const mapping = parseBrandMapping(tokensSource);
  return mapping ? new Set(Object.keys(mapping.light.entries)) : new Set();
};

/**
 * 코드 전체의 이름 → family. compareNameSets 가 「다른 family 의 이름」 을 「코드에 없는 이름」 과 가르는 데 쓴다. brand mapping 의 이름(oe-brand-…·oe-focus-ring)은
 * CORE 에 없지만 코드에 있는 이름이라 「brand」 family 로 넣는다 — 「코드 없음」 은 사실과 다른 문구다.
 */
const familiesOf = (tokens, brand = new Set()) => new Map([...[...brand].map((name) => [name, "brand"]), ...tokens.map((token) => [token.name, token.family])]);
/** 코드의 role 낱말 — parseCoreSemanticTokens 의 family 집합 ∪ {brand}. 축약을 펼칠 family 접두(familyOf)와 `{role}` 의 roles 가 같은 집합을 쓴다. */
const roleWords = (tokens) => new Set([...tokens.map((token) => token.family), "brand"]);

/** Neutral 펜스에 있어도 되는 brand mapping 이름 — `oe-focus-ring` 하나다(문서·styles.css 가 neutral 자리에 적는다). 그 밖의 brand 이름(oe-brand-…)은 「다른 family 의 이름」 이다. */
const NEUTRAL_ALLOWED = new Set(["oe-focus-ring"]);

/**
 * tokens.md 「## Neutral semantic token」 첫 펜스 ↔ CORE neutral 이름. `oe-focus-ring` 은 brand mapping 의 이름이지만 그 하나만 허용한다 — 다른 brand 이름
 * (oe-brand-border-primary)을 Neutral 펜스에 적으면 「다른 family 의 이름(brand family)」 ⚠ 다(조용히 지나가지 않는다, 약속 2). 꼴에 안 맞는 펜스 줄은 못 읽음.
 * semantic() 호출은 있는데 neutral family 가 하나도 없으면 무엇을 찾다가 못 읽었는지 적은 ? 다(도구 오류가 아니다). 문서에만 있는 이름이 다른 family 의
 * 코드 이름이면(oe-accent-…) 「코드에 없는 이름」 이 아니라 「다른 family 의 이름」 으로 낸다 — status 예시 펜스도 같다.
 */
export function compareNeutralList(tokensSource, tokensDoc) {
  const tokens = parseCoreSemanticTokens(tokensSource);
  if (!tokens.length) return result([], [unreadable("CORE_SEMANTIC_TOKENS", "`semantic(\"family\", \"oe-…\", light, dark)` 호출", FILES.tokens)]);
  const neutral = tokens.filter((token) => token.family === "neutral");
  if (!neutral.length) return result([], [unreadable("CORE_SEMANTIC_TOKENS", "neutral family 의 semantic(…) 호출", FILES.tokens)]);
  const fenced = fencesIn(tokensDoc, /^## Neutral semantic token\s*$/m);
  const fence = fenced?.fences[0];
  if (!fence) return result([], [unreadable("tokens.md Neutral 목록", "「## Neutral semantic token」 아래 ```text 펜스", FILES.tokensDoc)]);
  const { hits, unread, partial } = fenceLines("tokens.md Neutral 목록", fence, /^oe-[\w-]+$/, FILES.tokensDoc, roleWords(tokens));
  return result(compareNameSets("tokens.md Neutral 목록", neutral.map((token) => token.name), hits.map(({ hit }) => hit[0]), at(FILES.tokens, neutral[0].line), at(FILES.tokensDoc, fence.line), { allowInDoc: NEUTRAL_ALLOWED, partial, codeFamilies: familiesOf(tokens, brandNames(tokensSource)) }), unread);
}

/**
 * tokens.md 「## Semantic status token」 — 첫 펜스의 role 4개 ↔ statusFamily 호출, 둘째 펜스의 `oe-danger-*` 예시 ↔ danger family 이름.
 * 예시의 role 은 읽은 첫 줄의 `oe-<role>-` 에서 잡는다. 읽은 줄이 하나도 없으면 role 을 알 수 없는 것이지 문서가 role 을 안 적은 것이 아니다 — 꼴에 안 맞는 줄이
 * 있으면 그 ? 로 충분하고(「예시의 role」 ⚠ 를 얹지 않는다), 펜스가 비어 있으면 「이름 줄이 없다」 는 ? 다. 「예시의 role」 ⚠ 는 읽은 줄이 있는데 그 role 이 코드에 없을 때만이다.
 */
export function compareStatusGrammar(tokensSource, tokensDoc) {
  const tokens = parseCoreSemanticTokens(tokensSource);
  const status = tokens.filter((token) => !["neutral", "accent"].includes(token.family));
  if (!status.length) return result([], [unreadable("statusFamily", "`...statusFamily(\"family\", \"palette\")` 호출과 템플릿", FILES.tokens)]);
  const fenced = fencesIn(tokensDoc, /^## Semantic status token\s*$/m);
  if (!fenced || fenced.fences.length < 2) return result([], [unreadable("tokens.md status 문법", "「## Semantic status token」 아래 role 펜스와 `oe-danger-*` 예시 펜스", FILES.tokensDoc)]);
  const [roles, example] = fenced.fences;
  const roleLines = fenceLines("tokens.md status role", roles, /^[a-z]+$/, FILES.tokensDoc);
  const exampleLines = fenceLines("tokens.md status 예시", example, /^oe-([a-z]+)-[\w-]+$/, FILES.tokensDoc, roleWords(tokens));
  const families = [...new Set(status.map((token) => token.family))];
  const drifts = compareNameSets("tokens.md status role", families, roleLines.hits.map(({ hit }) => hit[0]), at(FILES.tokens, status[0].line), at(FILES.tokensDoc, roles.line), { partial: roleLines.partial });
  const exampleNames = exampleLines.hits.map(({ hit }) => hit[0]);
  const family = exampleLines.hits[0]?.hit[1];
  const codeNames = status.filter((token) => token.family === family).map((token) => token.name);
  if (!family) {
    if (!exampleLines.unread.length) exampleLines.unread.push(unreadable("tokens.md status 예시", "예시 펜스의 `oe-<role>-…` 이름 줄", at(FILES.tokensDoc, example.line)));
  } else if (!codeNames.length) drifts.push(drift("tokens.md status 예시의 role", show(families), family, at(FILES.tokens, status[0].line), at(FILES.tokensDoc, example.line)));
  else drifts.push(...compareNameSets(`tokens.md status 예시(${family})`, codeNames, exampleNames, at(FILES.tokens, status.find((token) => token.family === family).line), at(FILES.tokensDoc, example.line), { partial: exampleLines.partial, codeFamilies: familiesOf(tokens, brandNames(tokensSource)) }));
  return result(drifts, [...roleLines.unread, ...exampleLines.unread]);
}

/**
 * color.md 「### 제안하는 최소 역할」 펜스의 슬래시 축약(`oe-foreground-primary / secondary`)과 `{role}` 템플릿을 펼친다.
 * `{role}` 은 바로 앞 라벨 줄(「Brand 및 danger / warning / success / info」)로 펼친다 — roles = 라벨 줄의 영문 낱말 ∩ `known`
 * (parseCoreSemanticTokens 의 role 집합 ∪ {brand}). 교집합에서 빠진 영문 낱말이 하나라도 있으면(status·role) 그 라벨 줄을 `problems` 에
 * 남기고, roles 가 비면 `{role}` 줄들도 `problems` 다 — 코드에 없는 이름을 지어 거짓 ⚠ 를 내거나 빈 목록으로 펼쳐 비교를 조용히 지우지 않기 위해서다.
 * `oe-` 줄은 「oe-이름( / 접미)*」 꼴이어야 하고 자리표시자는 `{role}` 만 허용한다 — tokens.md 의 템플릿 줄 「oe-{property}-{hierarchy}」「oe-{role}-{property}-{hierarchy}」 처럼
 * 다른 자리표시자가 든 줄은 어떤 이름을 말하는지 확정할 수 없어 꼴 밖이다(전에는 그 글자 그대로를, `{role}` 을 펼쳐 다섯 이름을 지어 ⚠ 에 붙였다).
 * 「oe-border-primary, secondary」「oe-interaction-hover (state layer)」 처럼 꼴이 깨진 줄은 그 줄을
 * `problems` 에 남기고 이름 비교에서 빼며, 그 줄이 말하려던 이름(namesOfBrokenLine)은 `partial` 에 둬 「코드에만 있는 이름」 참고에서도 뺀다. 줄이 `oe-` 로
 * 시작하는지는 fenceLines 와 같이 소문자로 정규화해 본다 — 「OE-foreground-primary / secondary」 는 라벨 줄이 아니라 꼴이 깨진 이름 줄이라 ? 하나만 내고, 그 이름은
 * 소문자로 `partial` 에 둔다(라벨 줄로 읽으면 roles 가 비어 뒤의 `{role}` 줄까지 ? 가 되고 참고의 「코드에만 있는 이름」 이 늘어난다).
 * 슬래시 축약은 expandAbbreviation 이 `known`(코드의 role 집합)으로 펼친다 — 조각이 이미 `oe-` 로 시작하면(「oe-border-primary / oe-border-secondary」) 그대로 이름이고,
 * role 이 앞에 오는 이름은 그 뒤 property 까지가 family 다(「oe-danger-foreground-primary / secondary」 → oe-danger-foreground-secondary; 「oe-」 뒤 첫 낱말만 붙이면
 * 어디에도 없는 oe-danger-secondary 를 지어 ⚠ 를 냈다). 첫 이름에서 family 를 잴 수 없으면(「oe-ring / x」) 그 줄을 `problems` 에 남기고 말했을 수 있는 이름을 모두
 * `partial` 에 둔다 — 어디에도 없는 이름(oe-border-oe-border-secondary)을 지어 ⚠ 를 내지 않는다.
 */
const ROLE_LINE = /^oe-(?:\{role\}|\w+)(?:-(?:\{role\}|\w+))*(?: \/ [\w-]+)*$/;

export function expandRoleList(lines, known) {
  const names = [];
  const problems = [];
  const partial = new Set();
  let roles = [];
  // 깨진 줄이 말하던 `{role}` 이름은 라벨 줄의 role 대로 펼쳐 둔다. 라벨을 못 읽었으면(roles 가 비면) 자리표시자 그대로 둬 except 가 어떤 role 이든 맞는 이름을 뺀다 —
  // 다른 자리표시자(`{property}` …)도 그대로 둬 같은 방식으로 뺀다. 어느 쪽도 이름을 지어 비교에 넣지 않는다.
  const addPartial = (list) => {
    for (const name of list) {
      if (!name.includes("{role}") || !roles.length) partial.add(name);
      else for (const role of roles) partial.add(name.replace("{role}", role));
    }
  };
  for (const { text, line } of lines) {
    const lower = text.toLowerCase();
    if (!lower.startsWith("oe-")) {
      const words = lower.match(/[a-z]+/g) ?? [];
      roles = words.filter((word) => known.has(word));
      const unknown = words.filter((word) => !known.has(word));
      if (unknown.length) problems.push({ text, line, detail: `라벨 줄 「${text}」 의 영문 낱말 ${unknown.map((word) => `「${word}」`).join("·")} 이 코드의 role(${[...known].join("·")})에 없어 {role} 을 펼칠 수 없다` });
      continue;
    }
    if (!ROLE_LINE.test(text)) {
      problems.push({ text, line, detail: `펜스 줄 「${text}」 이 「oe-이름( / 접미)*」 꼴에 맞지 않는다${isTemplate(text.replace(/\{role\}/g, "")) ? TEMPLATE_NOTE : ""}` });
      addPartial(namesOfBrokenLine(text, known));
      continue;
    }
    const pieces = text.split(/\s*\/\s*/);
    const { names: expanded, sure } = expandAbbreviation(pieces[0], pieces.slice(1), known);
    if (!sure) {
      problems.push({ text, line, detail: `펜스 줄 「${text}」 의 축약을 펼칠 family 접두를 「${pieces[0]}」 에서 잴 수 없다(「oe-<property>-…」 꼴이 아니다)` });
      addPartial(expanded);
      continue;
    }
    const templated = expanded.some((name) => name.includes("{role}"));
    if (!templated) names.push(...expanded);
    else if (!roles.length) problems.push({ text, line, detail: `펜스 줄 「${text}」 의 {role} 을 펼칠 영문 role 이름을 바로 앞 라벨 줄에서 읽지 못했다` });
    else roles.forEach((role) => expanded.forEach((name) => names.push(name.replace("{role}", role))));
  }
  return { names, problems, partial };
}

/**
 * color.md 「### 제안하는 최소 역할」 → CORE ∪ brand mapping, 문서→코드 한 방향. 절이 「최소」 이고 color.md 가 「임시안」 이라 적었으므로
 * 코드에만 있는 이름은 어긋남이 아니라 「참고」 로 낸다. 문서에 적힌 이름이 코드에 없을 때만 어긋남이다.
 */
export function compareProposedRoles(tokensSource, colorDoc) {
  const tokens = parseCoreSemanticTokens(tokensSource);
  if (!tokens.length) return result([], [unreadable("CORE_SEMANTIC_TOKENS", "`semantic(…)` 호출", FILES.tokens)]);
  const fenced = fencesIn(colorDoc, /^### 제안하는 최소 역할\s*$/m);
  const fence = fenced?.fences[0];
  if (!fence) return result([], [unreadable("color.md 제안하는 최소 역할", "「### 제안하는 최소 역할」 아래 ```text 펜스", FILES.colorDoc)]);
  const code = new Set([...tokens.map((token) => token.name), ...brandNames(tokensSource)]);
  const expanded = expandRoleList(fence.lines, roleWords(tokens));
  const unread = expanded.problems.map(({ detail, line }) => unreadable("color.md 제안하는 최소 역할", detail, at(FILES.colorDoc, line)));
  const doc = new Set(expanded.names);
  const docOnly = sortStrings([...doc].filter((name) => !code.has(name)));
  // 꼴이 깨져 ? 로 낸 줄이 말하려던 이름은 「코드에만 있는 이름」 참고에서도 뺀다 — 못 읽음 하나로 충분하다(접두 표지는 except 가 fenceLines 와 같게 읽는다).
  const codeOnly = sortStrings(except([...code].filter((name) => !doc.has(name)), expanded.partial));
  const drifts = docOnly.length ? [drift("color.md 제안하는 최소 역할 — 코드에 없는 이름", "없음", docOnly.join(", "), at(FILES.tokens, tokens[0].line), at(FILES.colorDoc, fence.line))] : [];
  const notes = codeOnly.length ? [`color.md 「제안하는 최소 역할」(임시안) 에 없는 코드 이름 ${codeOnly.length}개 — ${codeOnly.join(", ")} (${at(FILES.colorDoc, fence.line)}; 최소 목록이라 어긋남으로 세지 않는다)`] : [];
  return result(drifts, unread, { notes });
}

/** color.md 「### Light」「### Dark」 펜스의 `oe-… → brand-NNN` ↔ createBrandSemanticMapping. 꼴에 안 맞는 펜스 줄은 그 줄을 가리켜 못 읽음. */
export function compareBrandMapping(tokensSource, colorDoc) {
  const mapping = parseBrandMapping(tokensSource);
  if (!mapping) return result([], [unreadable("createBrandSemanticMapping", "함수 본문의 `return { foregroundPrimary: solid(N), … }` 두 블록", FILES.tokens)]);
  const drifts = [];
  const unread = [];
  for (const mode of ["light", "dark"]) {
    const label = mode === "light" ? "Light" : "Dark";
    const fence = fencesIn(colorDoc, new RegExp(`^### ${label}\\s*$`, "m"))?.fences[0];
    if (!fence) {
      unread.push(unreadable(`color.md ${mode} 매핑`, `「### ${label}」 아래 \`oe-… → brand-NNN\` 펜스`, FILES.colorDoc));
      continue;
    }
    const lines = fenceLines(`color.md ${mode} 매핑`, fence, /^(oe-[\w-]+)\s*→\s*(brand-\d+)$/, FILES.colorDoc);
    unread.push(...lines.unread);
    const doc = Object.fromEntries(lines.hits.map(({ hit }) => [hit[1], hit[2]]));
    const code = mapping[mode];
    drifts.push(...compareNameSets(`color.md ${mode} 매핑 이름`, Object.keys(code.entries), Object.keys(doc), at(FILES.tokens, code.line), at(FILES.colorDoc, fence.line), { partial: lines.partial }));
    for (const [name, step] of Object.entries(code.entries)) {
      if (name in doc && doc[name] !== step) drifts.push(drift(`${name} ${mode}`, step, doc[name], at(FILES.tokens, code.line), at(FILES.colorDoc, lines.hits.find(({ hit }) => hit[1] === name)?.line)));
    }
  }
  return result(drifts, unread);
}

/** color.md 「## Solid primitive」 표 `| brand-NNN | tone |` ↔ toneByStep. 머리 행은 두 열이어야 하고, 꼴에 안 맞는 행은 못 읽음. */
export function compareToneTable(tokensSource, colorDoc) {
  const tones = parseToneByStep(tokensSource);
  if (!tones) return result([], [unreadable("toneByStep", "`const toneByStep = { 50: 98, … }`", FILES.tokens)]);
  const section = sectionOf(colorDoc, /^## Solid primitive\s*$/m);
  const table = section && parseTable(section);
  if (!section) return result([], [unreadable("color.md brand tone 표", "「## Solid primitive」 절", FILES.colorDoc)]);
  if (!table) return result([], [unreadable("color.md brand tone 표", "「## Solid primitive」 절의 표(머리 행과 구분 행)", at(FILES.colorDoc, section.line))]);
  if (table.header.length !== 2) return result([], [unreadable("color.md brand tone 표", `머리 행 「| ${table.header.join(" | ")} |」 이 두 열(token, tone)이 아니다`, at(FILES.colorDoc, table.line))]);
  const unread = [];
  const rows = [];
  const partial = new Set();
  for (const { cells, line } of table.rows) {
    const step = cells.length === 2 && stripTicks(cells[0]).match(/^brand-(\d+)$/);
    const tone = cells.length === 2 && cells[1].match(/^(\d+)$/);
    if (step && tone) rows.push({ step: step[1], tone: Number(tone[1]), line });
    else {
      unread.push(unreadable("color.md brand tone 표", `행 「| ${cells.join(" | ")} |」 을 「| \`brand-NNN\` | tone |」 로 읽지 못했다`, at(FILES.colorDoc, line)));
      const named = stripTicks(cells[0] ?? "").match(/^brand-(\d+)/);
      if (named) partial.add(named[1]);
    }
  }
  const drifts = compareNameSets("color.md brand tone 표 단계", Object.keys(tones.entries), rows.map((row) => row.step), at(FILES.tokens, tones.line), at(FILES.colorDoc, table.line), { partial });
  for (const { step, tone, line } of rows) {
    if (step in tones.entries && tones.entries[step] !== tone) drifts.push(drift(`brand-${step} 의 HCT tone`, tones.entries[step], tone, at(FILES.tokens, tones.line), at(FILES.colorDoc, line)));
  }
  return result(drifts, unread);
}

/** BRAND_ALPHA_STEPS 의 단계 → CSS 변수 이름의 두 자리 조각(`5` → `05`). apps/studio brand theme 이 `--brand-alpha-${padStart(2, "0")}` 로 만드는 이름 그대로다. */
export const alphaStepName = (step) => String(step).padStart(2, "0");

/**
 * BRAND_ALPHA_STEPS ↔ color.md 「## Alpha primitive」 펜스의 `brand-alpha-NN` 와 tokens.md 「## Brand primitive」 절의 「다음 값만 생성한다: `05, 08, …`」. 이름을 재는 자리라 숫자가 아니라
 * 이름 문자열(두 자리)로 비교한다 — 실제 CSS 변수는 `--brand-alpha-05` 라 `brand-alpha-5` 는 없는 이름이다. 펜스 줄은 두 자리 이상이어야 하고(아니면 ?),
 * 문장의 `5` 는 `05` 와 다른 이름이라 ⚠ 다.
 * 문장은 콜론 뒤 문장 끝(백틱 밖의 `.`)까지를 읽고, 그 자리가 숫자 백틱 묶음(`05, 08` 처럼 쉼표 목록이거나 `05`, `08` 처럼 묶음 여럿)만으로 이어져야 값이다 —
 * 첫 묶음만 읽으면 `05`, `08`, … 꼴에서 「문서 05」 라는 거짓 ⚠ 가 났다. 묶음 사이에 다른 말이 끼거나(「`05` 와 `08`」) 숫자가 아닌 묶음이 있으면 꼴 밖이라 ? 다.
 */
const ALPHA_SENTENCE = /다음 값만 생성한다\s*:\s*((?:[^`.\n]|`[^`\n]*`)*)/;
const ALPHA_VALUE_LIST = /^`[^`]+`(?:\s*[,·]?\s*`[^`]+`)*\s*$/;
const ALPHA_VALUE_GROUP = /^\d+(?:\s*,\s*\d+)*$/;
export function compareAlphaSteps(tokensSource, colorDoc, tokensDoc) {
  const steps = parseNumberArray(tokensSource, "BRAND_ALPHA_STEPS");
  if (!steps) return result([], [unreadable("BRAND_ALPHA_STEPS", "`export const BRAND_ALPHA_STEPS = [ … ]`", FILES.tokens)]);
  const drifts = [];
  const unread = [];
  const code = steps.values.map(alphaStepName).join(", ");
  const fence = fencesIn(colorDoc, /^## Alpha primitive\s*$/m)?.fences[0];
  if (!fence) unread.push(unreadable("color.md alpha 단계", "「## Alpha primitive」 아래 `brand-alpha-NN` 펜스", FILES.colorDoc));
  else {
    const lines = fenceLines("color.md alpha 단계", fence, /^brand-alpha-(\d{2,})$/, FILES.colorDoc);
    unread.push(...lines.unread);
    const doc = lines.hits.map(({ hit }) => hit[1]);
    // 못 읽은 줄이 있으면 목록이 온전하지 않으므로 순서·개수 비교를 하지 않는다(못 읽음 하나로 충분하다).
    if (!lines.unread.length && doc.join(", ") !== code) drifts.push(drift("brand alpha 단계", code, doc.join(", "), at(FILES.tokens, steps.line), at(FILES.colorDoc, fence.line)));
  }
  // 문장은 절 안에서만 읽는다(머리 주석 2) — 다른 절에 같은 꼴의 문장이 있어도 「## Brand primitive」 절의 것만 이 짝의 문장이다.
  const section = sectionOf(tokensDoc, /^## Brand primitive\s*$/m);
  const sentence = section && section.text.match(ALPHA_SENTENCE);
  if (!section) unread.push(unreadable("tokens.md alpha 단계", "「## Brand primitive」 절", FILES.tokensDoc));
  else if (!sentence) unread.push(unreadable("tokens.md alpha 단계", "「## Brand primitive」 절의 「다음 값만 생성한다: `05, 08, …`」 문장", at(FILES.tokensDoc, section.line)));
  else {
    const where = at(FILES.tokensDoc, lineAt(tokensDoc, section.offset + sentence.index));
    const body = sentence[1].trim();
    const groups = [...body.matchAll(/`([^`]+)`/g)].map((hit) => hit[1].trim());
    if (!ALPHA_VALUE_LIST.test(body) || !groups.every((group) => ALPHA_VALUE_GROUP.test(group))) unread.push(unreadable("tokens.md alpha 단계", `문장의 값 「${body}」 을 숫자 백틱 목록(「\`05, 08, …\`」 또는 「\`05\`, \`08\`, …」)으로 읽지 못했다`, where));
    else {
      const doc = groups.flatMap((group) => group.match(/\d+/g));
      if (doc.join(", ") !== code) drifts.push(drift("brand alpha 단계", code, doc.join(", "), at(FILES.tokens, steps.line), where));
    }
  }
  return result(drifts, unread);
}

/** 문서가 인용한 `text-oe-label` 같은 별칭 클래스 ↔ styles.css @theme 선언. */
export function compareDocAliasClasses(css, docs) {
  const declared = parseThemeAliases(css);
  if (!declared.size) return result([], [unreadable("@theme 별칭", "`@theme { … }` 블록 안의 `--color-oe-…:` 같은 선언", FILES.tokensCss)]);
  const drifts = [];
  for (const [file, md] of Object.entries(docs)) {
    for (const { name, className, line } of parseDocAliasClasses(md)) {
      if (!declared.has(name)) drifts.push(drift(`별칭 클래스 ${className}`, `--*-${name} 선언 없음`, `\`${className}\``, FILES.tokensCss, at(file, line)));
    }
  }
  return result(drifts);
}

/** 문서 안의 백틱 저장소 경로 ↔ 실제 파일·디렉터리. 뒤 문장이 미래를 말하는 경로(「생기면」 등)는 재지 않고 「재지 않는 것」 에 적는다. */
export function compareDocPaths(docs, exists) {
  const drifts = [];
  const skipped = [];
  for (const [file, md] of Object.entries(docs)) {
    for (const { target, line, future } of parseDocPaths(md)) {
      if (exists(target)) continue;
      if (future) skipped.push(`${at(file, line)} \`${target}\` — 뒤 문장이 「생기면·확정되면·다시 만든다」 로 미래를 말하는 경로라 아직 없어도 어긋남이 아니다`);
      else drifts.push(drift("문서가 적은 경로", "저장소에 없음", `\`${target}\``, "저장소", at(file, line)));
    }
  }
  return result(drifts, [], { skipped });
}

/** interaction.md 공통 Control Height·Compact·Control Radius·화면 좌우 여백 ↔ CONTROL_HEIGHTS·COMPACT_HEIGHT·RADII.control·PADDINGS. 모두 제 절 안에서만 읽는다. */
export function compareInteraction(tokensSource, doc) {
  const heights = parseNumberRecord(tokensSource, "CONTROL_HEIGHTS");
  const compact = tokensSource.match(/export const COMPACT_HEIGHT\s*=\s*(\d+)/);
  const radii = parseNumberRecord(tokensSource, "RADII");
  const paddings = parseNumberRecord(tokensSource, "PADDINGS");
  if (!heights || !compact || !radii || !paddings) return result([], [unreadable("tokens 상수", "`CONTROL_HEIGHTS`·`COMPACT_HEIGHT`·`RADII`·`PADDINGS`", FILES.tokens)]);
  const drifts = [];
  const unread = [];
  const heightSection = sectionOf(doc, /^## 공통 Control Height\s*$/m);
  if (!heightSection) unread.push(unreadable("interaction.md Control Height", "「## 공통 Control Height」 절", FILES.interactionDoc));
  else {
    // 「- 이름: …」 꼴의 줄은 모두 이 목록의 항목으로 보고, 「- Regular: 36px」 에 안 맞는 줄은 그 줄을 가리켜 못 읽음으로 낸다.
    const { rows, odd } = listLines(heightSection, /^- ([A-Za-z]+)\s*:[^\n]*$/gm, /^- ([A-Za-z]+):\s*(\d+)\s*px\s*$/);
    unread.push(...oddLines("interaction.md Control Height", odd, "- Regular: 36px", FILES.interactionDoc));
    if (!rows.length && !odd.length) unread.push(unreadable("interaction.md Control Height", "「## 공통 Control Height」 절의 「- Regular: 36px」 같은 목록 줄", at(FILES.interactionDoc, heightSection.line)));
    else {
      const skip = new Set(odd.map((entry) => entry.groups[0].toLowerCase()));
      drifts.push(...compareNameSets("interaction.md Control Height 단계", Object.keys(heights.entries), rows.map((row) => row.groups[0].toLowerCase()), at(FILES.tokens, heights.line), at(FILES.interactionDoc, (rows[0] ?? odd[0]).line), { partial: skip }));
      for (const { groups: [name, px], line } of rows) {
        const key = name.toLowerCase();
        if (key in heights.entries && heights.entries[key] !== Number(px)) drifts.push(drift(`Control Height ${name}`, `${heights.entries[key]}px`, `${px}px`, at(FILES.tokens, heights.line), at(FILES.interactionDoc, line)));
      }
    }
  }
  expectPx("Compact 높이", doc, FILES.interactionDoc, /^## Compact\s*$/m, "## Compact", /(\d+)\s*px\s*하나/g, "「값은 20px 하나」 문장", Number(compact[1]), at(FILES.tokens, lineAt(tokensSource, compact.index)), drifts, unread);
  expectPx("Control Radius", doc, FILES.interactionDoc, /^## 공통 Control Radius\s*$/m, "## 공통 Control Radius", /\*\*(\d+)\s*px\*\*/g, "「**8px**」", radii.entries.control, at(FILES.tokens, radii.line), drifts, unread);
  const paddingSection = sectionOf(doc, /^## 화면 좌우 여백\s*$/m);
  if (!paddingSection) unread.push(unreadable("interaction.md 화면 좌우 여백", "「## 화면 좌우 여백」 절", FILES.interactionDoc));
  else {
    const { rows, odd } = listLines(paddingSection, /^- `([a-z]+)`[^\n]*$/gm, /^- `([a-z]+)`\s*(\d+)\s*px/);
    unread.push(...oddLines("interaction.md 화면 좌우 여백", odd, "- `default` 16px: …", FILES.interactionDoc));
    if (!rows.length && !odd.length) unread.push(unreadable("interaction.md 화면 좌우 여백", "「## 화면 좌우 여백」 절의 「- `default` 16px」 같은 목록 줄", at(FILES.interactionDoc, paddingSection.line)));
    else {
      const skip = new Set(odd.map((entry) => entry.groups[0]));
      drifts.push(...compareNameSets("interaction.md 화면 좌우 여백 단계", Object.keys(paddings.entries), rows.map((row) => row.groups[0]), at(FILES.tokens, paddings.line), at(FILES.interactionDoc, (rows[0] ?? odd[0]).line), { partial: skip }));
      for (const { groups: [name, px], line } of rows) {
        if (name in paddings.entries && paddings.entries[name] !== Number(px)) drifts.push(drift(`화면 좌우 여백 ${name}`, `${paddings.entries[name]}px`, `${px}px`, at(FILES.tokens, paddings.line), at(FILES.interactionDoc, line)));
      }
    }
  }
  return result(drifts, unread);
}

/** icon.md 「## 크기 토큰」 절의 「- `oe-icon-small`: 16px」 ↔ ICON_SIZES. `oe-icon-` 으로 시작하는데 꼴에 안 맞는 줄은 못 읽음. */
export function compareIconSizes(tokensSource, doc) {
  const sizes = parseNumberRecord(tokensSource, "ICON_SIZES");
  if (!sizes) return result([], [unreadable("ICON_SIZES", "`export const ICON_SIZES = { … } as const`", FILES.tokens)]);
  const section = sectionOf(doc, /^## 크기 토큰\s*$/m);
  if (!section) return result([], [unreadable("icon.md 크기 토큰", "「## 크기 토큰」 절", FILES.iconDoc)]);
  const { rows, odd } = listLines(section, /^- `oe-icon-(\w+)[^\n]*$/gm, /^- `oe-icon-(\w+)`:\s*(\d+)\s*px\s*$/);
  if (!rows.length && !odd.length) return result([], [unreadable("icon.md 크기 토큰", "「## 크기 토큰」 절의 「- `oe-icon-small`: 16px」 같은 목록 줄", at(FILES.iconDoc, section.line))]);
  const unread = oddLines("icon.md 크기 토큰", odd, "- `oe-icon-…`: Npx", FILES.iconDoc);
  const drifts = compareNameSets("icon.md 크기 토큰 단계", Object.keys(sizes.entries), rows.map((row) => row.groups[0]), at(FILES.tokens, sizes.line), at(FILES.iconDoc, (rows[0] ?? odd[0]).line), { partial: new Set(odd.map((entry) => entry.groups[0])) });
  for (const { groups: [name, px], line } of rows) {
    if (name in sizes.entries && sizes.entries[name] !== Number(px)) drifts.push(drift(`oe-icon-${name}`, `${sizes.entries[name]}px`, `${px}px`, at(FILES.tokens, sizes.line), at(FILES.iconDoc, line)));
  }
  return result(drifts, unread);
}

/** catalog.md 「## 현재 경로」 절의 「- `/foundations/color`: …」 ↔ apps/studio/src/app/foundations/ 디렉터리. 꼴에 안 맞는 경로 줄은 그 줄을 가리켜 못 읽음. */
export function compareFoundationRoutes(doc, foundationDirs) {
  const section = sectionOf(doc, /^## 현재 경로\s*$/m);
  if (!section) return result([], [unreadable("catalog.md 현재 경로", "「## 현재 경로」 절", FILES.catalogDoc)]);
  const { rows, odd } = listLines(section, /^- `\/foundations\/([a-z-]+)`[^\n]*$/gm, /^- `\/foundations\/([a-z-]+)`:/);
  if (!rows.length && !odd.length) return result([], [unreadable("catalog.md 현재 경로", "「## 현재 경로」 절의 「- `/foundations/color`: …」 목록 줄", at(FILES.catalogDoc, section.line))]);
  const unread = oddLines("catalog.md 현재 경로", odd, "- `/foundations/color`: …", FILES.catalogDoc);
  const skip = new Set(odd.map((entry) => entry.groups[0]));
  return result(compareNameSets("catalog.md 현재 경로", foundationDirs, rows.map((row) => row.groups[0]), FILES.studioFoundations, at(FILES.catalogDoc, (rows[0] ?? odd[0]).line), { partial: skip }), unread);
}

// ---------------------------------------------------------------------------------------------------------------------
// 전체
// ---------------------------------------------------------------------------------------------------------------------

/** 짝 하나: 이름, 필요한 파일, 파일이 모두 있을 때 돌릴 비교. 파일 하나라도 못 읽으면 그 경로를 「못 읽었다」 로 낸다. */
const pair = (name, files, run) => ({ name, files, run });

const componentPair = (name, key, run) => pair(name, [`${FILES.uiSrc}/${key}.tsx`, `${FILES.componentDocs}/${key}.md`], (ctx, [source, doc]) => run(source, doc));

const PAIR_RUNS = [
  pair("README 컴포넌트 표 ↔ registry (제목·상태·문서 링크)", [FILES.registry, FILES.readme], (ctx, [registry, readme]) => compareReadmeTable(registry, readme)),
  pair("docs/system/components/*.md → registry 확정 key (고아 문서)", [FILES.registry], (ctx, [registry]) => {
    const docs = ctx.listMarkdown(FILES.componentDocs);
    return docs ? compareComponentDocSet(registry, docs) : ctx.missingDirectory(FILES.componentDocs);
  }),
  pair("Studio 문서 디렉터리 ↔ registry href (고아 디렉터리)", [FILES.registry], (ctx, [registry]) => {
    const dirs = ctx.listDirectories(FILES.studioComponents);
    return dirs ? compareStudioOrphans(registry, dirs) : ctx.missingDirectory(FILES.studioComponents);
  }),
  pair("@ooee/ui export ↔ registry (모듈·이름)", [FILES.registry, FILES.uiIndex, FILES.readme], (ctx, [registry, index, readme]) => compareUiExports(registry, index, readme)),
  pair("컴포넌트 문서 H1·구현 경로 메타줄 ↔ registry title·packages/ui 파일", [FILES.registry], (ctx, [registry]) => {
    const items = confirmedOf(parseRegistry(registry));
    if (!items.length) return noRegistry();
    // 확정 문서를 하나라도 못 읽으면 그 문서를 「못 읽었다」 로 낸다 — 비교 0건을 「같다」 로 찍지 않기 위해서다(위 짝의 어긋남과는 별개).
    return merge(
      ...items.map((item) => {
        const file = `${FILES.componentDocs}/${item.key}.md`;
        const md = ctx.read(file);
        return md === null ? result([], [unreadable(`${item.key}.md 제목·메타줄`, "파일을 읽지 못했다", file)]) : compareComponentDoc(item, md, ctx.exists);
      }),
    );
  }),
  pair("llms.txt 확정 N종 숫자·초안 목록 ↔ registry", [FILES.registry, FILES.llms], (ctx, [registry, llms]) => compareLlms(registry, llms)),
  componentPair("BADGE_COLORS 개수 ↔ badge.md", "badge", compareBadgeColorCount),
  componentPair("BADGE_COLORS 회색 규칙 ↔ badge.md", "badge", compareBadgeGrayRule),
  componentPair("BUTTON_COLORS ↔ button.md", "button", (source, doc) => compareColorList(source, "BUTTON_COLORS", doc, `${FILES.uiSrc}/button.tsx`, `${FILES.componentDocs}/button.md`)),
  componentPair("TOGGLE_BUTTON_COLORS ↔ toggle-button.md", "toggle-button", (source, doc) => compareColorList(source, "TOGGLE_BUTTON_COLORS", doc, `${FILES.uiSrc}/toggle-button.tsx`, `${FILES.componentDocs}/toggle-button.md`)),
  componentPair("BOTTOM_NAVIGATION_MAX_ITEMS ↔ bottom-navigation.md", "bottom-navigation", compareBottomNavigationMax),
  componentPair("Textarea 최소·기본 높이 ↔ textarea.md", "textarea", compareTextareaHeight),
  componentPair("Textarea field 최소 높이 ↔ textarea.md", "textarea", compareTextareaFieldHeight),
  componentPair("Checkbox control 크기 ↔ checkbox.md", "checkbox", compareCheckboxControl),
  componentPair("Checkbox indicator 아이콘 크기 ↔ checkbox.md", "checkbox", compareCheckboxIndicatorIcons),
  componentPair("Badge Specification 표 ↔ SIZE_CLASS", "badge", compareBadgeSpecTable),
  componentPair("Badge 색 단계 표(Light/Dark) ↔ toneClass", "badge", compareBadgeToneTable),
  pair("Properties 열거값 ↔ export type 유니온", [], (ctx) => {
    const compared = Object.keys(ENUM_TABLE).map((key) => {
      const files = [`${FILES.uiSrc}/${key}.tsx`, `${FILES.componentDocs}/${key}.md`];
      return ctx.missingFiles(`${key} 열거값`, files) ?? compareEnums(key, ctx.read(files[0]), ctx.read(files[1]), (name) => ctx.read(`${FILES.uiSrc}/${name}`));
    });
    // 표에 없는 열거 줄은 「재지 않는 것」 에 줄 번호로 낸다 — 무엇을 안 재는지 말하지 않고 「=」 로 보이지 않게. 읽지 못한 문서는 짝 이름으로 ? (표에 있는 컴포넌트는 위에서 이미 냈다).
    const names = ctx.listMarkdown(FILES.componentDocs);
    if (names === null) return merge(...compared, ctx.missingDirectory(FILES.componentDocs));
    const read = names.map((name) => [name, ctx.read(`${FILES.componentDocs}/${name}.md`)]);
    const unread = ctx.unreadFiles(read.filter(([name, md]) => md === null && !ENUM_TABLE[name]).map(([name]) => `${FILES.componentDocs}/${name}.md`));
    return merge(...compared, unread, result([], [], { skipped: unmeasuredEnumLines(Object.fromEntries(read.filter(([, md]) => md !== null))) }));
  }),
  pair("tokens.md Neutral 목록 ↔ CORE_SEMANTIC_TOKENS", [FILES.tokens, FILES.tokensDoc], (ctx, [tokens, doc]) => compareNeutralList(tokens, doc)),
  pair("tokens.md status 문법 ↔ statusFamily", [FILES.tokens, FILES.tokensDoc], (ctx, [tokens, doc]) => compareStatusGrammar(tokens, doc)),
  pair("color.md 제안하는 최소 역할 → CORE_SEMANTIC_TOKENS·brand mapping (문서→코드)", [FILES.tokens, FILES.colorDoc], (ctx, [tokens, doc]) => compareProposedRoles(tokens, doc)),
  pair("color.md Light/Dark 매핑 ↔ createBrandSemanticMapping", [FILES.tokens, FILES.colorDoc], (ctx, [tokens, doc]) => compareBrandMapping(tokens, doc)),
  pair("color.md brand tone 표 ↔ toneByStep", [FILES.tokens, FILES.colorDoc], (ctx, [tokens, doc]) => compareToneTable(tokens, doc)),
  pair("brand alpha 단계 ↔ BRAND_ALPHA_STEPS", [FILES.tokens, FILES.colorDoc, FILES.tokensDoc], (ctx, [tokens, color, tokensDoc]) => compareAlphaSteps(tokens, color, tokensDoc)),
  pair("문서가 인용한 별칭 클래스 ↔ styles.css @theme", [FILES.tokensCss], (ctx, [css]) => {
    const docs = ctx.systemDocs();
    return docs.missing ?? merge(compareDocAliasClasses(css, docs.texts), docs.unread);
  }),
  pair("문서 안 백틱 저장소 경로 ↔ 실제 파일", [], (ctx) => {
    const docs = ctx.systemDocs();
    return docs.missing ?? merge(compareDocPaths(docs.texts, ctx.exists), docs.unread);
  }),
  pair("interaction.md Control Height·Compact·Radius·여백 ↔ tokens 상수", [FILES.tokens, FILES.interactionDoc], (ctx, [tokens, doc]) => compareInteraction(tokens, doc)),
  pair("icon.md 크기 토큰 ↔ ICON_SIZES", [FILES.tokens, FILES.iconDoc], (ctx, [tokens, doc]) => compareIconSizes(tokens, doc)),
  pair("catalog.md 현재 경로 ↔ Studio foundations 라우트", [FILES.catalogDoc], (ctx, [doc]) => {
    const dirs = ctx.listDirectories(FILES.studioFoundations);
    return dirs ? compareFoundationRoutes(doc, dirs) : ctx.missingDirectory(FILES.studioFoundations);
  }),
];

/** 잰 짝의 이름. 보고의 「N개 짝」이 이 수다. */
export const PAIRS = Object.freeze(PAIR_RUNS.map((entry) => entry.name));

/**
 * 저장소를 읽어 모든 짝을 잰다. 파일은 읽기만 한다. 읽기는 `read` 한 곳에서 잡아 없는 파일을 「? <짝 이름> — 못 읽었다 — <경로>: 파일을 읽지 못했다」 로 만들고,
 * 짝 하나가 예외를 내면 그 짝만 「도구 오류」 로 낸다 — 어느 경우에도 던지지 않는다.
 */
export function measure(root) {
  const cache = new Map();
  const read = (relative) => {
    if (!cache.has(relative)) {
      try {
        cache.set(relative, readFileSync(path.join(root, relative), "utf8"));
      } catch {
        cache.set(relative, null);
      }
    }
    return cache.get(relative);
  };
  const list = (relative, keep) => {
    try {
      return readdirSync(path.join(root, relative))
        .filter((name) => keep(name, path.join(root, relative, name)))
        .sort();
    } catch {
      return null;
    }
  };
  const exists = (relative) => {
    try {
      return existsSync(path.join(root, relative));
    } catch {
      return false;
    }
  };
  const missingFiles = (what, files) => {
    const gone = files.filter((file) => read(file) === null);
    return gone.length ? result([], gone.map((file) => unreadable(what, "파일을 읽지 못했다", file))) : null;
  };
  /** 짝 하나의 문맥. 디렉터리를 못 읽은 「?」 줄이 어느 짝의 것인지 보이도록 짝 이름을 `what` 에 쓴다. */
  const contextFor = (name) => {
    const ctx = {
      read,
      exists,
      missingFiles,
      listDirectories: (relative) => list(relative, (entry, full) => statSync(full).isDirectory()),
      listMarkdown: (relative) => list(relative, (entry) => entry.endsWith(".md"))?.map((entry) => entry.slice(0, -3)) ?? null,
      missingDirectory: (relative) => result([], [unreadable(name, "디렉터리를 읽지 못했다", relative)]),
      /** 목록에는 있는데 읽지 못한 파일(디렉터리·권한·깨진 링크)을 이 짝의 이름으로 「? <짝 이름> — 못 읽었다 — <경로>: 파일을 읽지 못했다」 로. 조용히 필터하지 않는다. */
      unreadFiles: (files) => result([], files.map((file) => unreadable(name, "파일을 읽지 못했다", file))),
      /** docs/system 의 모든 .md(README·최상위·foundations·components). 디렉터리 하나라도 못 읽으면 `missing`, 읽지 못한 파일은 `unread` 에 이 짝 이름의 ? 로. */
      systemDocs() {
        const groups = [FILES.systemDocs, FILES.foundationDocs, FILES.componentDocs].map((dir) => ({ dir, names: ctx.listMarkdown(dir) }));
        const gone = groups.filter((group) => group.names === null);
        if (gone.length) return { missing: merge(...gone.map((group) => ctx.missingDirectory(group.dir))) };
        const texts = groups.flatMap((group) => group.names.map((entry) => `${group.dir}/${entry}.md`)).map((file) => [file, read(file)]);
        return { texts: Object.fromEntries(texts.filter(([, text]) => text !== null)), unread: ctx.unreadFiles(texts.filter(([, text]) => text === null).map(([file]) => file)) };
      },
    };
    return ctx;
  };

  const pairs = PAIR_RUNS.map(({ name, files, run }) => {
    try {
      const outcome = missingFiles(name, files) ?? run(contextFor(name), files.map(read));
      return { name, ...outcome };
    } catch (error) {
      return { name, ...result([], [unreadable(name, `도구 오류: ${error?.message ?? error}`, SELF)]) };
    }
  });

  // 산문의 값 주장은 짝이 아니다 — =·⚠·? 도 요약의 개수도 아닌 「참고」 한 줄. 여기서 예외가 나도 짝의 결과는 그대로 낸다.
  let proseNote;
  try {
    const docs = contextFor("참고").systemDocs();
    proseNote = proseValueNote(docs.texts ?? {}, (docs.missing ?? docs.unread).unreadable.map((item) => item.docAt));
  } catch (error) {
    proseNote = `손으로 확인할 산문 값 주장 — 도구 오류: ${error?.message ?? error}`;
  }

  return {
    pairs,
    drifts: pairs.flatMap((entry) => entry.drifts),
    unreadable: pairs.flatMap((entry) => entry.unreadable),
    notes: [...pairs.flatMap((entry) => entry.notes), proseNote],
    notMeasured: [...NOT_MEASURED, ...pairs.flatMap((entry) => entry.skipped)],
  };
}

export const formatDrift = ({ what, code, doc, codeAt, docAt }) => `⚠ ${what} — 코드 ${code} vs 문서 ${doc} (${codeAt} · ${docAt})`;
export const formatUnreadable = ({ what, detail, docAt }) => `? ${what} — 못 읽었다 — ${docAt}: ${detail}`;

/**
 * 사람이 읽을 보고. 첫 줄이 요약, 그 아래 짝마다 「= 같다」 한 줄 또는 「⚠ 다르다」「? 못 읽었다」 줄들. 빈 줄 뒤에
 * 「참고」(어긋남으로 세지 않는 정보)와 「재지 않는 것」(까닭과 함께)을 적는다.
 */
export function formatReport({ pairs, notes = [], notMeasured = [] }) {
  const drifts = pairs.flatMap((entry) => entry.drifts);
  const unread = pairs.flatMap((entry) => entry.unreadable);
  const lines = [!drifts.length && !unread.length ? `docs/system 과 코드가 맞는다(${pairs.length}개 짝)` : `docs/system 과 코드가 어긋난 곳 ${drifts.length}곳, 못 읽은 곳 ${unread.length}곳 (${pairs.length}개 짝을 잼)`];
  for (const entry of pairs) {
    if (!entry.drifts.length && !entry.unreadable.length) lines.push(`= ${entry.name}`);
    lines.push(...entry.drifts.map(formatDrift), ...entry.unreadable.map(formatUnreadable));
  }
  if (notes.length) lines.push("", "참고:", ...notes.map((note) => `- ${note}`));
  if (notMeasured.length) lines.push("", "재지 않는 것:", ...notMeasured.map((entry) => `- ${entry}`));
  return lines.join("\n");
}

/**
 * CLI. 기본은 보고만 찍고 exit 0, `--strict` 면 어긋남이나 못 읽은 곳이 있을 때 exit 1. 어떤 예외든 잡아 「도구 오류: …」 한 줄을
 * 내고 같은 규칙으로 exit 한다. `run` 은 시험이 `measure` 를 바꿔 끼우는 자리다.
 */
export function main(argv, root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.."), run = measure) {
  const strict = Array.isArray(argv) && argv.includes("--strict");
  try {
    const measured = run(root);
    const failed = measured.drifts.length + measured.unreadable.length > 0;
    return { text: formatReport(measured), exitCode: strict && failed ? 1 : 0 };
  } catch (error) {
    return { text: `도구 오류: ${error?.message ?? error}`, exitCode: strict ? 1 : 0 };
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const { text, exitCode } = main(process.argv.slice(2));
  console.log(text);
  process.exit(exitCode);
}
