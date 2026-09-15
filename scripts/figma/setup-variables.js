// Figma use_figma 에 넘겨 `oe color`(Light·Dark)와 `oe size` 변수 컬렉션을 맞춘다.
// 있는 변수는 값만 고치고 없는 변수는 만든다. 컬렉션을 지우지 않으므로 이미 그린 프레임의 연결이 유지된다.
// prepare.mjs 가 아래 세 자리를 토큰 행([이름, light RGBA, dark RGBA, 원본 primitive])·크기({이름: px})·해시로 채운다.
const TOKENS = __TOKENS__;
const SIZES = __SIZES__;
const EXPECT = __EXPECT__;
const fnv = (s) => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193); return h >>> 0; };
if (fnv(JSON.stringify([TOKENS, SIZES])) !== EXPECT) return { error: "옮기는 중 토큰 값이 바뀌었다. 단계 파일을 처음부터 다시 읽어 그대로 넘긴다" };
const NOTE = "원본: packages/tokens/src/index.ts. 코드에서 값을 옮겨 적은 것이며 자동 동기화되지 않는다.";
const PROVISIONAL = " 상태: Provisional. Light/Dark 매핑은 검토용이며 확정값이 아니다(docs/system/foundations/color.md).";
const BRAND_PROVISIONAL = " 기본 brand seed 도 Provisional 이다(docs/process/open-questions.md).";

function scopesFor(name) {
  if (name === "oe-focus-ring") return ["STROKE_COLOR", "EFFECT_COLOR"];
  if (name.includes("-foreground-")) return ["TEXT_FILL", "SHAPE_FILL", "STROKE_COLOR"];
  if (name.includes("-border-")) return ["STROKE_COLOR"];
  return ["FRAME_FILL", "SHAPE_FILL"];
}

const collections = await figma.variables.getLocalVariableCollectionsAsync();
const variables = await figma.variables.getLocalVariablesAsync();

function collection(name, modeNames) {
  let c = collections.find((item) => item.name === name);
  if (!c) {
    c = figma.variables.createVariableCollection(name);
    collections.push(c);
  }
  const ids = [];
  modeNames.forEach((modeName, i) => {
    let mode = c.modes.find((m) => m.name === modeName) || (i === 0 && c.modes.length === 1 && !modeNames.includes(c.modes[0].name) ? c.modes[0] : null);
    if (mode && mode.name !== modeName) c.renameMode(mode.modeId, modeName);
    ids.push(mode ? mode.modeId : c.addMode(modeName));
  });
  return { c, ids };
}

function variable(c, name, type) {
  let v = variables.find((item) => item.name === name && item.variableCollectionId === c.id);
  let created = false;
  if (!v) {
    v = figma.variables.createVariable(name, c, type);
    variables.push(v);
    created = true;
  }
  return { v, created };
}

const report = { created: 0, updated: 0 };
const color = collection("oe color", ["Light", "Dark"]);
for (const [name, light, dark, source] of TOKENS) {
  const { v, created } = variable(color.c, name, "COLOR");
  v.setValueForMode(color.ids[0], light);
  v.setValueForMode(color.ids[1], dark);
  v.scopes = scopesFor(name);
  v.description = `${NOTE}${PROVISIONAL}${name.startsWith("oe-brand-") || name === "oe-focus-ring" ? BRAND_PROVISIONAL : ""} (${source})`;
  created ? report.created++ : report.updated++;
}
const size = collection("oe size", ["Default"]);
for (const [name, value] of Object.entries(SIZES)) {
  const { v, created } = variable(size.c, name, "FLOAT");
  v.setValueForMode(size.ids[0], value);
  v.scopes = name.startsWith("radius") ? ["CORNER_RADIUS"] : ["WIDTH_HEIGHT"];
  v.description = NOTE;
  created ? report.created++ : report.updated++;
}
return report;
