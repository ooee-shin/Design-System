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
 */
export const INSTANCE_FIELDS = ["t", "n", "x", "y", "w", "h", "path", "inst", "portal"];

/**
 * 인스턴스로 놓을 자리는 안쪽을 싣지 않는다. 그 안은 Figma 가 컴포넌트로 그리므로 화면에서 넘길 것은
 * 글자뿐이다(`builder.js` 의 `textsOf` 가 이 글자를 슬롯에 넣는다). 되읽기도 인스턴스 안쪽은 화면의
 * 자리로 견주지 않으므로(`reread.mjs` 의 `flatten`) 사양에서 빼도 잃는 것이 없다.
 *
 * 노드 자신의 칠·테두리·모서리·오토 레이아웃도 뗀다. 그것은 컴포넌트가 가진 값이고 builder 의 인스턴스
 * 경로는 읽지 않는다. 컴포넌트를 찾지 못하면 builder 가 그리지 않고 멈추므로 대신 그릴 것도 없다.
 *
 * 글자의 **차례**는 그대로 둔다. builder 는 인스턴스 안 글자 노드를 찾은 차례대로 바꾸므로,
 * 차례가 틀어지면 값이 엉뚱한 자리에 들어간다.
 */
export function foldInstances(node) {
  if (node.inst) {
    const texts = [];
    const walk = (n) => { if (n.t === "x") texts.push({ t: "x", s: n.s }); (n.k || []).forEach(walk); };
    (node.k || []).forEach(walk);
    for (const field of Object.keys(node)) if (!INSTANCE_FIELDS.includes(field)) delete node[field];
    if (texts.length) node.k = texts;
    return node;
  }
  (node.k || []).forEach(foldInstances);
  return node;
}

/** builder.js 가 인스턴스 글자 슬롯에 넣을 문구를 세는 것과 같은 차례로 모은다. 시험이 둘을 견준다. */
export function textsOf(spec, acc = []) {
  if (spec.t === "x") acc.push(spec);
  for (const kid of spec.k || []) textsOf(kid, acc);
  return acc;
}
