// 단계 파일에 싣는 글자를 줄이는 두 가지. prepare.mjs 가 쓰고 step-payload.test.mjs 가 고정한다.
//
// 한 단계의 8할이 builder.js 이고, 모델이 그것을 한 글자도 틀리지 않게 다시 쳐서 use_figma 에 넘긴다.
// 그래서 걸리는 시간은 Figma 가 아니라 옮겨 적는 글자 수로 정해진다.

/**
 * 줄 끝 주석을 뗀다. 문자열 안의 `//`(예: `"https://a"`)는 건드리지 않으려고 따옴표 상태를 따라간다.
 * builder.js 에는 여러 줄에 걸친 템플릿 문자열과 블록 주석이 없다. 생기면 이 함수가 틀리므로
 * step-payload.test.mjs 가 그 두 가지가 없는지도 함께 본다.
 */
export function stripLineComment(line) {
  let quote = null;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (quote) {
      if (ch === "\\") { i += 1; continue; }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") { quote = ch; continue; }
    if (ch === "/" && line[i + 1] === "/") return line.slice(0, i).replace(/\s+$/, "");
  }
  return line;
}

/**
 * 단계 파일에 실을 코드에서 주석과 빈 줄을 뺀다. 저장소의 원본은 그대로라 읽을 때는 주석을 본다.
 * 줄을 통째로 지우므로 세미콜론 없이 줄바꿈에 기대는 코드가 있으면 뜻이 바뀔 수 있다.
 * builder.js 는 줄마다 세미콜론으로 끝나며, 시험이 결과를 실제로 파싱해 그것을 확인한다.
 */
export function stripComments(src) {
  return src
    .split("\n")
    .map(stripLineComment)
    .filter((line) => line.trim())
    .join("\n");
}

/**
 * `builder.js` 가 인스턴스를 놓을 때 실제로 읽는 자리. 이 밖의 값은 조각에 실어도 쓰이지 않는다.
 * builder 를 고치면 이 목록도 함께 고쳐야 한다. step-payload.test.mjs 가 둘을 묶어 둔다.
 * `ic` 는 prepare 가 라이브러리 서명과 맞춰 본 아이콘 이름이다. builder 가 가져온 변형과 한 번 더 견준다.
 */
export const INSTANCE_FIELDS = ["t", "n", "x", "y", "w", "h", "path", "inst", "portal", "ic", "k"];

/**
 * 인스턴스로 놓을 자리는 안쪽을 싣지 않는다. 그 안은 라이브러리 컴포넌트가 그리므로 화면에서 넘길 것은
 * **글자뿐**이다(`builder.js` 의 `textsOf` 가 이 글자를 슬롯에 넣는다). 되읽기도 인스턴스 안쪽은 화면의
 * 자리로 견주지 않으므로(`reread.mjs` 의 `flatten`) 사양에서 빼도 잃는 것이 없다.
 *
 * 노드 자신의 칠·테두리·모서리·오토 레이아웃도 뗀다. 그것은 컴포넌트가 가진 값이고 builder 의 인스턴스
 * 경로는 읽지 않는다.
 *
 * 대신 그릴 것을 남기지 않는다. 인스턴스로 놓을지는 prepare 가 라이브러리 서명(`library.json`)과 맞춰 본 뒤에
 * 확정하고(`library.mjs` 의 `decideInstances`), builder 는 그 결정과 라이브러리가 어긋나면 프레임으로 떨어지지
 * 않고 멈춘다. 2026-09-21 의 「최선 노력」(맞지 않으면 builder 가 프레임으로 내려감)은 어긋남을 build 결과의
 * `instanceMiss` 에만 남겨 보고에서 빠지기 쉬웠고, 그 때문에 안쪽을 통째로 실어야 했다.
 *
 * 글자의 **차례**는 그대로 둔다. builder 는 인스턴스 안 글자 노드를 찾은 차례대로 바꾸므로,
 * 차례가 틀어지면 값이 엉뚱한 자리에 들어간다. 빈 입력(`blank`)은 Placeholder 자리 하나를 빈 글자로 채운다.
 */
export function foldInstances(node) {
  if (node.inst) {
    const texts = node.blank ? [{ t: "x", s: "" }] : textsOf(node).map((text) => ({ t: "x", s: text.s }));
    for (const key of Object.keys(node)) if (!INSTANCE_FIELDS.includes(key)) delete node[key];
    if (texts.length) node.k = texts;
    else delete node.k;
    return node;
  }
  (node.k || []).forEach(foldInstances);
  return node;
}

/** 문서에 builder 를 둘 때 쓰는 공유 plugin data 자리. reread 와 같은 namespace 를 쓴다. */
export const TAG = "ooee.build";
export const BUILDER_KEY = "builder";

/** 옮겨 적다 한 글자만 틀려도 잡아내는 해시. builder.js·단계 파일이 모두 같은 것을 쓴다. */
export function fnv(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193);
  return h >>> 0;
}

/**
 * builder 를 문서에 한 번 두는 단계. 이후 build 단계는 이것을 꺼내 쓴다.
 *
 * `use_figma` 호출 사이에 `globalThis` 는 살아남지 않는다(2026-09-17 확인). 반면 공유 plugin data 는
 * 문서에 남고 `new AsyncFunction` 도 쓸 수 있어서, 코드를 문서에 두고 단계마다 꺼내 쓰는 길이 열린다.
 *
 * 코드는 한 줄짜리 긴 문자열 대신 줄 배열로 싣는다. 모델이 옮겨 적을 때 긴 줄이 접히면 문법이 깨지기 때문이다.
 */
export function loaderSteps(builderSource, maxChars) {
  const all = builderSource.split("\n");
  const expect = fnv(builderSource);
  // 한 단계가 maxChars 를 넘지 않게 줄을 나눈다. 줄 하나가 그보다 길면 어쩔 수 없이 그 줄만 담는다.
  const groups = [];
  let group = [], size = 0;
  for (const line of all) {
    const cost = JSON.stringify(line).length + 2;
    if (group.length && size + cost > maxChars) { groups.push(group); group = []; size = 0; }
    group.push(line);
    size += cost;
  }
  if (group.length) groups.push(group);

  return groups.map((lines, i) => `const TAG = ${JSON.stringify(TAG)};
const KEY = ${JSON.stringify(BUILDER_KEY)};
const PART = ${i};
const LAST = ${i === groups.length - 1};
const EXPECT = ${expect};
const CODE = [
${lines.map((line) => JSON.stringify(line)).join(",\n")}
].join("\\n");
const fnv = (s) => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193); return h >>> 0; };
const prev = PART === 0 ? "" : figma.root.getSharedPluginData(TAG, KEY);
if (PART !== 0 && !prev) return { error: "앞의 「builder 를 문서에 둔다」 조각이 없다. 그 단계부터 다시 돌린다" };
const next = prev ? prev + "\\n" + CODE : CODE;
figma.root.setSharedPluginData(TAG, KEY, next);
const back = figma.root.getSharedPluginData(TAG, KEY);
if (back !== next) return { error: "문서에 저장한 builder 가 넣은 것과 다르다" };
if (!LAST) return { part: PART, stored: next.length };
if (fnv(next) !== EXPECT) return { error: "옮기는 중 builder 가 바뀌었다. 「builder 를 문서에 둔다」 조각을 처음부터 다시 돌린다" };
return { stored: next.length, hash: EXPECT };
`);
}

/** 조각이 하나뿐일 때 쓰는 편의 함수. 시험이 이 자리를 본다. */
export function loaderCode(builderSource) {
  return loaderSteps(builderSource, Number.MAX_SAFE_INTEGER)[0];
}

/**
 * 조각만 싣는 build 단계. 문서에 둔 builder 를 꺼내 `ARGS` 를 넘겨 부른다.
 * builder 가 없거나 이번 단계가 기대하는 것과 다르면 그리지 않고 멈춘다.
 */
export function buildDriver({ screenName, expect, builderHash, runBody }) {
  return `const TAG = ${JSON.stringify(TAG)};
const KEY = ${JSON.stringify(BUILDER_KEY)};
const SCREEN = ${JSON.stringify(screenName)};
const EXPECT = ${expect};
const BUILDER = ${builderHash};
const RUN = ${runBody};
const fnv = (s) => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193); return h >>> 0; };
if (fnv(JSON.stringify(RUN)) !== EXPECT) return { error: "옮기는 중 조각 내용이 바뀌었다. 단계 파일을 처음부터 다시 읽어 그대로 넘긴다" };
const CODE = figma.root.getSharedPluginData(TAG, KEY);
if (!CODE) return { error: "문서에 builder 가 없다. 「builder 를 문서에 둔다」 단계를 먼저 돌린다" };
if (fnv(CODE) !== BUILDER) return { error: "문서의 builder 가 이번 단계와 다르다. 「builder 를 문서에 둔다」 단계를 다시 돌린다" };
const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;
return await new AsyncFunction("ARGS", CODE)({ SCREEN, EXPECT, RUN });
`;
}

/** builder.js 가 인스턴스 글자 슬롯에 넣을 문구를 세는 것과 같은 차례로 모은다. 시험이 둘을 견준다. */
export function textsOf(spec, acc = []) {
  if (spec.t === "x") acc.push(spec);
  for (const kid of spec.k || []) textsOf(kid, acc);
  return acc;
}
