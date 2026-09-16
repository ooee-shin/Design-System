// Figma use_figma 에 넘겨 프레임을 JSON 으로 읽는다. 파일을 바꾸지 않는다.
// reread.mjs 가 SCREEN(화면 페이지 이름)·FRAMES(읽을 프레임 이름 목록)·PART 자리를 채운다.
// use_figma 응답은 20,000자쯤에서 잘리므로 PART = {i, n} 으로 노드를 나눠 여러 번 읽고 합친다.
// 결과는 reread.mjs diff 가 .figma-work/<key>/spec-<상태>.json 과 견준다.
// 아이콘 프레임(Ri* 이름) 안쪽 vector 는 내려가지 않는다. 사람이 고칠 자리가 아니고 트리만 커진다.
const SCREEN = __SCREEN__;
const FRAMES = __FRAMES__;
const PART = __PART__;
const COLS = ["p", "n", "t", "w", "h", "bg", "c", "bd", "r", "s", "fs", "st"];
const TAG = "ooee.build";
const page = figma.root.children.find((p) => p.name === SCREEN);
if (!page) return { error: `페이지 「${SCREEN}」 이 없다` };
await figma.setCurrentPageAsync(page);

const nameCache = new Map();
async function variableName(bound) {
  if (!bound) return null;
  if (!nameCache.has(bound.id)) {
    const v = await figma.variables.getVariableByIdAsync(bound.id);
    nameCache.set(bound.id, v ? v.name : null);
  }
  return nameCache.get(bound.id);
}
const hex = (c) => `#${[c.r, c.g, c.b].map((x) => Math.round(x * 255).toString(16).padStart(2, "0")).join("")}`;
async function paintOf(paints) {
  if (!paints || paints === figma.mixed) return null;
  const paint = paints.find((p) => p.type === "SOLID" && p.visible !== false);
  if (!paint) return null;
  const name = await variableName(paint.boundVariables && paint.boundVariables.color);
  const out = name ? { v: name } : { hex: hex(paint.color) };
  if (paint.opacity !== undefined && paint.opacity < 1) out.o = Math.round(paint.opacity * 100);
  return out;
}
const styleCache = new Map();
async function styleName(id) {
  if (!id || id === figma.mixed) return null;
  if (!styleCache.has(id)) {
    const style = await figma.getStyleByIdAsync(id);
    styleCache.set(id, style ? style.name : null);
  }
  return styleCache.get(id);
}

const out = { page: page.name, frames: [] };
for (const frameName of FRAMES) {
  const frame = page.children.find((n) => n.name === frameName);
  if (!frame) { out.frames.push({ name: frameName, missing: true }); continue; }
  const info = { name: frameName, id: frame.id, build: frame.getSharedPluginData(TAG, "build") || null, w: Math.round(frame.width), h: Math.round(frame.height), part: PART, cols: COLS, rows: [] };
  let index = -1;
  const visit = async (node) => {
    index++;
    const mine = index % PART.n === PART.i;
    if (!mine) { if (!(/^Ri[A-Z]/.test(node.name) || node.type === "VECTOR")) for (const kid of node.children || []) await visit(kid); return; }
    const item = {
      p: node.getSharedPluginData(TAG, "p") || "",
      n: node.type === "TEXT" ? "" : node.name, // 글자 노드의 이름은 문구와 같아 싣지 않는다
      t: node.type === "TEXT" ? "x" : node.type === "FRAME" ? "f" : node.type.slice(0, 3).toLowerCase(),
      w: Math.round(node.width),
      h: Math.round(node.height),
    };
    const fill = await paintOf("fills" in node ? node.fills : null);
    if (fill) item[node.type === "TEXT" ? "c" : "bg"] = fill;
    const stroke = await paintOf("strokes" in node ? node.strokes : null);
    if (stroke) item.bd = { c: stroke, w: Math.round((node.strokeWeight === figma.mixed ? node.strokeTopWeight : node.strokeWeight) || 0) };
    if ("cornerRadius" in node && node.cornerRadius && node.cornerRadius !== figma.mixed) item.r = Math.round(node.cornerRadius);
    if (node.type === "TEXT") {
      item.s = node.characters;
      item.st = (await styleName(node.textStyleId)) || "";
      if (node.fontSize !== figma.mixed) item.fs = Math.round(node.fontSize);
    }
    // 아이콘은 칠이 안쪽 vector 에 있다. 레이어 이름과 그 색만 싣고 안쪽으로는 내려가지 않는다.
    if (/^Ri[A-Z]/.test(node.name)) {
      for (const inner of node.findAll ? node.findAll(() => true) : []) {
        const c = await paintOf("fills" in inner ? inner.fills : null);
        if (c) { item.c = c; break; }
      }
    }
    // 자리를 아끼려고 줄로 싣는다. COLS 가 칸 이름이고, 빈 칸은 "" 또는 0 이다.
    info.rows.push([item.p, item.n, item.t, item.w, item.h, item.bg ? item.bg.v || item.bg.hex : "", item.c ? item.c.v || item.c.hex : "", item.bd ? item.bd.c.v || item.bd.c.hex : "", item.r || 0, item.s || "", item.fs || 0, item.st || ""]);
    if (/^Ri[A-Z]/.test(node.name) || node.type === "VECTOR") return;
    for (const kid of node.children || []) await visit(kid);
  };
  await visit(frame);
  out.frames.push(info);
}
return out;
