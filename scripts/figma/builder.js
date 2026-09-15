// Figma use_figma 에 넘기는 plugin 코드다. __CHUNK__ 를 make-chunks.py 가 만든 조각 배열(JSON)로 바꿔 넘긴다.
// 색은 `oe color`·`oe primitive` 변수에, 글자는 `oe/text-*` 텍스트 스타일에 묶고 아이콘은 Remix SVG 로 넣는다.
// CHUNK 는 { parentPath, rootFrame?, nodes: [ {path, node} ] , primitives: {name:{r,g,b}} , icons: {name: svg} }
const RUN = __CHUNK__;
let CHUNK = RUN[0];
const report = { unmappedColors: [], unmappedText: [], opacityOnToken: [], absoluteFallback: 0, created: 0 };

const collections = await figma.variables.getLocalVariableCollectionsAsync();
const allVars = await figma.variables.getLocalVariablesAsync("COLOR");
const byName = new Map(allVars.map((v) => [v.name, v]));
let prim = collections.find((c) => c.name === "oe primitive");
if (!prim) { prim = figma.variables.createVariableCollection("oe primitive"); prim.renameMode(prim.modes[0].modeId, "Value"); }
function primitiveVar(name) {
  if (byName.has(name)) return byName.get(name);
  const value = CHUNK.primitives[name];
  if (!value) return null;
  const v = figma.variables.createVariable(name, prim, "COLOR");
  v.setValueForMode(prim.modes[0].modeId, { r: value.r, g: value.g, b: value.b, a: value.a ?? 1 });
  v.scopes = ["ALL_FILLS", "STROKE_COLOR"];
  v.description = "Primitive. 코드가 semantic token이 아니라 이 단계를 직접 쓰는 자리(Button·Badge의 tone 단계 규칙 등)에만 쓴다. 원본: Tailwind v4 theme.css / packages/tokens createBrandPalette. 자동 동기화되지 않는다.";
  byName.set(name, v);
  return v;
}
function paintFor(ref, where) {
  if (!ref || ref.none) return null;
  let variable = null;
  if (ref.token) variable = byName.get(ref.token);
  else if (ref.primitive) variable = primitiveVar(ref.primitive);
  if (!variable) {
    report.unmappedColors.push(where + " " + JSON.stringify(ref).slice(0, 80));
    const raw = ref.raw || { r: 1, g: 0, b: 1, a: 1 };
    return { type: "SOLID", color: { r: raw.r, g: raw.g, b: raw.b }, opacity: raw.a ?? 1 };
  }
  const base = { type: "SOLID", color: { r: 0, g: 0, b: 0 } };
  const bound = figma.variables.setBoundVariableForPaint(base, "color", variable);
  if (ref.alpha) { bound.opacity = Number(ref.alpha) / 100; report.opacityOnToken.push(where + " " + variable.name + "/" + ref.alpha); }
  return bound;
}

const styles = await figma.getLocalTextStylesAsync();
const styleByName = new Map(styles.map((s) => [s.name, s]));
await figma.loadFontAsync({ family: "Noto Sans KR", style: "Regular" });
await figma.loadFontAsync({ family: "Noto Sans KR", style: "Medium" });
await figma.loadFontAsync({ family: "Noto Sans KR", style: "Bold" });
const SCALE = { 12: "text-xs", 13: "text-oe-label", 14: "text-sm", 16: "text-base", 18: "text-lg", 20: "text-xl", 24: "text-2xl" };
const WEIGHT = { 400: "regular", 500: "medium", 600: "semibold", 700: "bold" };
function styleFor(fs, fw, where) {
  let scale = SCALE[fs];
  let weight = WEIGHT[fw] || (fw >= 650 ? "bold" : fw >= 550 ? "semibold" : fw >= 450 ? "medium" : "regular");
  if (!scale) {
    const sizes = Object.keys(SCALE).map(Number);
    const near = sizes.reduce((a, b) => (Math.abs(b - fs) < Math.abs(a - fs) ? b : a));
    report.unmappedText.push(`${where} ${fs}px → ${SCALE[near]}`);
    scale = SCALE[near];
  }
  return styleByName.get(`oe/${scale}/${weight}`);
}

const ALIGN = { "flex-start": "MIN", start: "MIN", normal: "MIN", "flex-end": "MAX", end: "MAX", center: "CENTER", "space-between": "SPACE_BETWEEN", stretch: "MIN", baseline: "MIN" };

async function build(spec, parent, parentAbs) {
  if (spec.t === "x") {
    const t = figma.createText();
    parent.appendChild(t);
    const st = styleFor(spec.fs, spec.fw, spec.s.slice(0, 16));
    if (st) await t.setTextStyleIdAsync(st.id);
    t.characters = spec.s;
    t.name = spec.n;
    const p = paintFor(spec.c || { token: "oe-foreground-primary" }, "text:" + spec.s.slice(0, 12));
    if (p) t.fills = [p];
    t.textAlignHorizontal = spec.al === "center" ? "CENTER" : spec.al === "right" || spec.al === "end" ? "RIGHT" : "LEFT";
    const single = !spec.lh || spec.h <= spec.lh * 1.5;
    if (single) t.textAutoResize = "WIDTH_AND_HEIGHT";
    else { t.textAutoResize = "HEIGHT"; t.resize(spec.w, t.height); }
    report.created++;
    return { node: t, spec };
  }
  if (spec.t === "svg") {
    const frame = figma.createNodeFromSvg(spec.icon ? CHUNK.icons[spec.icon] : spec.svg);
    parent.appendChild(frame);
    frame.name = spec.icon ? spec.icon : "icon";
    frame.resize(spec.w, spec.h);
    frame.fills = [];
    const p = paintFor(spec.c, "icon");
    for (const v of frame.findAll((n) => "fills" in n && n.type !== "FRAME")) if (p) v.fills = [p];
    report.created++;
    return { node: frame, spec };
  }
  const f = figma.createFrame();
  parent.appendChild(f);
  f.name = spec.n;
  f.fills = spec.bg ? [paintFor(spec.bg, "bg:" + spec.n)].filter(Boolean) : [];
  if (spec.bd) {
    const p = paintFor(spec.bd.c, "border:" + spec.n);
    if (p) {
      f.strokes = [p];
      f.strokeAlign = "INSIDE";
      if (spec.bd.ds) f.dashPattern = [4, 4];
      const [top, right, bottom, left] = spec.bd.w;
      if (top === right && right === bottom && bottom === left) f.strokeWeight = top;
      else { f.strokeTopWeight = top; f.strokeRightWeight = right; f.strokeBottomWeight = bottom; f.strokeLeftWeight = left; }
    }
  }
  if (spec.r) f.cornerRadius = spec.r;
  f.clipsContent = !!spec.clip;
  if (spec.l) {
    f.layoutMode = spec.l.d === "V" ? "VERTICAL" : "HORIZONTAL";
    f.itemSpacing = spec.l.g;
    [f.paddingTop, f.paddingRight, f.paddingBottom, f.paddingLeft] = spec.l.p;
    f.primaryAxisAlignItems = ALIGN[spec.l.j] || "MIN";
    f.counterAxisAlignItems = ALIGN[spec.l.a] || "MIN";
    if (spec.l.wr && f.layoutMode === "HORIZONTAL") f.layoutWrap = "WRAP";
    f.primaryAxisSizingMode = "FIXED";
    f.counterAxisSizingMode = "FIXED";
  }
  f.resize(Math.max(1, spec.w), Math.max(1, spec.h));
  if (spec.path) f.setSharedPluginData("ooee.build", "p", spec.path);
  report.created++;
  const kids = [];
  if (spec.stub) return { node: f, spec };
  for (const k of spec.k || []) kids.push(await build(k, f, { x: spec.x, y: spec.y }));
  // 자식 위치를 DOM 과 맞춘다. auto-layout 이 다르게 놓으면 그 자식만 absolute 로 둔다.
  for (const { node, spec: ks } of kids) {
    const ex = ks.x - spec.x, ey = ks.y - spec.y;
    if (!spec.l) { node.x = ex; node.y = ey; continue; }
    if ("layoutSizingHorizontal" in node && node.type === "FRAME") { node.layoutSizingHorizontal = "FIXED"; node.layoutSizingVertical = "FIXED"; }
  }
  if (spec.l) {
    for (const { node, spec: ks } of kids) {
      const ex = ks.x - spec.x, ey = ks.y - spec.y;
      if (Math.abs(node.x - ex) > 2 || Math.abs(node.y - ey) > 2) {
        node.layoutPositioning = "ABSOLUTE";
        node.x = ex; node.y = ey;
        report.absoluteFallback++;
      }
    }
  }
  return { node: f, spec };
}

const page = figma.currentPage;
for (CHUNK of RUN) {
let parent;
if (CHUNK.rootFrame) {
  parent = page;
  for (const old of page.children.filter((n) => n.name === CHUNK.rootFrame.name)) old.remove();
} else {
  parent = page.findOne((n) => n.type === "FRAME" && n.getSharedPluginData("ooee.build", "p") === CHUNK.parentPath);
  if (!parent) return { error: "parent not found " + CHUNK.parentPath };
}
const parentSpec = CHUNK.parentBox || { x: 0, y: 0 };
for (const item of CHUNK.nodes) {
  const res = await build(item, parent, parentSpec);
  if (CHUNK.rootFrame) {
    res.node.x = CHUNK.rootFrame.x; res.node.y = CHUNK.rootFrame.y; res.node.name = CHUNK.rootFrame.name;
  } else if (parent.layoutMode === "NONE" || !parent.layoutMode) {
    res.node.x = item.x - parentSpec.x; res.node.y = item.y - parentSpec.y;
  } else {
    if (res.node.type === "FRAME") { res.node.layoutSizingHorizontal = "FIXED"; res.node.layoutSizingVertical = "FIXED"; }
    const ex = item.x - parentSpec.x, ey = item.y - parentSpec.y;
    if (Math.abs(res.node.x - ex) > 2 || Math.abs(res.node.y - ey) > 2) { res.node.layoutPositioning = "ABSOLUTE"; res.node.x = ex; res.node.y = ey; report.absoluteFallback++; }
  }
}
}
report.unmappedColors = report.unmappedColors.slice(0, 20);
report.unmappedText = [...new Set(report.unmappedText)].slice(0, 20);
report.opacityOnToken = [...new Set(report.opacityOnToken)].slice(0, 20);
return report;
