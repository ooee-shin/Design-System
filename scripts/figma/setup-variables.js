// Figma use_figma 에 넘겨 `oe color`(Light·Dark)와 `oe size` 변수 컬렉션을 만든다. 같은 이름의 컬렉션은 지우고 다시 만든다.
// __TOKENS__ 는 [[이름, light RGBA, dark RGBA, 원본 primitive], ...], __SIZES__ 는 {이름: px} 로 바꿔 넘긴다(README 참고).
const TOKENS = __TOKENS__;
const SIZES = __SIZES__;
function scopesFor(name) {
  if (name === "oe-focus-ring") return ["STROKE_COLOR", "EFFECT_COLOR"];
  if (name.includes("-foreground-")) return ["TEXT_FILL", "SHAPE_FILL", "STROKE_COLOR"];
  if (name.includes("-border-")) return ["STROKE_COLOR"];
  if (name.includes("-interaction-")) return ["FRAME_FILL", "SHAPE_FILL"];
  return ["FRAME_FILL", "SHAPE_FILL"];
}
const existing = await figma.variables.getLocalVariableCollectionsAsync();
for (const c of existing) if (c.name === "oe color" || c.name === "oe size") c.remove();
const color = figma.variables.createVariableCollection("oe color");
const lightId = color.modes[0].modeId;
color.renameMode(lightId, "Light");
const darkId = color.addMode("Dark");
const made = [];
for (const [name, light, dark, source] of TOKENS) {
  const v = figma.variables.createVariable(name, color, "COLOR");
  v.setValueForMode(lightId, light);
  v.setValueForMode(darkId, dark);
  v.scopes = scopesFor(name);
  v.description = "원본: packages/tokens/src/index.ts (" + source + "). 코드에서 값을 옮겨 적은 것이며 자동 동기화되지 않는다.";
  v.setVariableCodeSyntax("WEB", name.replace(/^oe-/, "oe-"));
  made.push(name);
}
const size = figma.variables.createVariableCollection("oe size");
const sizeMode = size.modes[0].modeId;
size.renameMode(sizeMode, "Default");
for (const [name, value] of Object.entries(SIZES)) {
  const v = figma.variables.createVariable(name, size, "FLOAT");
  v.setValueForMode(sizeMode, value);
  v.scopes = name.startsWith("radius") ? ["CORNER_RADIUS"] : ["WIDTH_HEIGHT"];
  v.description = "원본: packages/tokens/src/index.ts (CONTROL_HEIGHTS·ICON_SIZES·RADII). 자동 동기화되지 않는다.";
}
return { colorVariables: made.length, sizeVariables: Object.keys(SIZES).length, modes: color.modes.map((m) => m.name) };
