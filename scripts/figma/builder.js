// Figma use_figma 에 넘기는 plugin 코드다. 이 파일은 단계마다 실리지 않는다.
// prepare.mjs 가 이것을 「builder 를 문서에 둔다」 단계로 한 번만 보내 문서에 저장하고,
// 이후 build 단계는 조각만 실은 채 저장된 이것을 꺼내 AsyncFunction 으로 만들어 ARGS 를 넘겨 부른다.
// 그래서 여기서 쓰는 SCREEN·EXPECT·RUN 은 ARGS 로 들어온다.
//
// 색은 `oe color`·`oe primitive` 변수에, 모서리·높이·아이콘 크기는 `oe size` 변수에, 글자는 `oe/text-*` 텍스트 스타일에 묶고
// 아이콘은 Remix SVG 로 넣는다. RUN 은 조각 배열이다. 조각은 { frameName, parentPath, parentBox, rootFrame, nodes, primitives, icons } 이고,
// nodes 의 노드는 path 를 갖는다. 큰 노드는 stub:1 로 먼저 오고 그 자식은 뒤 조각에 온다.
const { SCREEN, EXPECT, RUN } = ARGS;

// 모델이 코드를 옮겨 적다 숫자 하나를 바꿔도 문법은 그대로다. 조각 내용의 해시를 다시 재서 다르면 아무것도 그리지 않는다.
const fnv = (s) => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193); return h >>> 0; };
if (fnv(JSON.stringify(RUN)) !== EXPECT) return { error: "옮기는 중 조각 내용이 바뀌었다. 단계 파일을 처음부터 다시 읽어 그대로 넘긴다" };

// 화면마다 자기 페이지를 쓴다. 없으면 비어 있는 현재 페이지를 쓰거나 새로 만든다.
let page = figma.root.children.find((p) => p.name === SCREEN);
if (!page) {
  const current = figma.currentPage;
  page = current.children.length === 0 && !figma.root.children.some((p) => p !== current && p.name === current.name) && /^Page \d+$/.test(current.name) ? current : figma.createPage();
  page.name = SCREEN;
}
await figma.setCurrentPageAsync(page);

const report = { unmappedColors: [], unmappedText: [], weightFallback: [], defaultTextColor: [], opacityOnToken: [], replacedFrames: [], absoluteFallback: 0, created: 0 };

// 변수는 oe 컬렉션 안에서만 찾는다. 다른 라이브러리(BKDS 등)에서 들어온 같은 이름 변수에 묶지 않는다.
const collections = await figma.variables.getLocalVariableCollectionsAsync();
let prim = collections.find((c) => c.name === "oe primitive");
if (!prim) { prim = figma.variables.createVariableCollection("oe primitive"); prim.renameMode(prim.modes[0].modeId, "Value"); }
const colorCollection = collections.find((c) => c.name === "oe color");
const sizeCollection = collections.find((c) => c.name === "oe size");
if (!colorCollection || !sizeCollection) return { error: "oe color·oe size 변수가 없다. 01-setup-variables 를 먼저 돌린다" };
const colorVars = await figma.variables.getLocalVariablesAsync("COLOR");
const floatVars = await figma.variables.getLocalVariablesAsync("FLOAT");
const tokenVar = new Map(colorVars.filter((v) => v.variableCollectionId === colorCollection.id).map((v) => [v.name, v]));
const primVar = new Map(colorVars.filter((v) => v.variableCollectionId === prim.id).map((v) => [v.name, v]));
const sizeVar = new Map(floatVars.filter((v) => v.variableCollectionId === sizeCollection.id).map((v) => [v.name, v]));

// primitive 는 이번 조각이 쓰는 것만 만들고, 이미 있으면 값을 지금 코드의 값으로 맞춘다.
const PRIMITIVE_NOTE = "Primitive. 코드가 semantic token 이 아니라 이 단계를 직접 쓰는 자리(Button·Badge 의 tone 단계 규칙 등)에만 쓴다. 원본: Tailwind v4 theme.css·packages/tokens createBrandPalette. 자동 동기화되지 않는다.";
const syncedPrimitives = new Set();
function primitiveVar(name, value) {
  let v = primVar.get(name);
  if (!value) return v || null;
  if (!v) { v = figma.variables.createVariable(name, prim, "COLOR"); v.scopes = ["ALL_FILLS", "STROKE_COLOR"]; primVar.set(name, v); }
  if (!syncedPrimitives.has(name)) {
    v.setValueForMode(prim.modes[0].modeId, { r: value.r, g: value.g, b: value.b, a: value.a ?? 1 });
    v.description = PRIMITIVE_NOTE + (name.startsWith("brand-") ? " 기본 brand seed 와 HCT tone 단계 매핑은 Provisional 이다(docs/process/open-questions.md)." : "");
    syncedPrimitives.add(name);
  }
  return v;
}

let CHUNK = RUN[0];
function paintFor(ref, where) {
  if (!ref) return null;
  const variable = ref.token ? tokenVar.get(ref.token) : ref.primitive ? primitiveVar(ref.primitive, CHUNK.primitives[ref.primitive]) : null;
  if (!variable) {
    report.unmappedColors.push(`${where} ${JSON.stringify(ref).slice(0, 80)}`);
    const raw = ref.raw || { r: 1, g: 0, b: 1, a: 1 };
    return { type: "SOLID", color: { r: raw.r, g: raw.g, b: raw.b }, opacity: raw.a ?? 1 };
  }
  // setBoundVariableForPaint 가 돌려준 paint 는 고치지 않고, 투명도는 처음 paint 에 넣어 넘긴다.
  const opacity = ref.alpha ? Number(ref.alpha) / 100 : 1;
  if (ref.alpha) report.opacityOnToken.push(`${where} ${variable.name}/${ref.alpha}`);
  return figma.variables.setBoundVariableForPaint({ type: "SOLID", color: { r: 0, g: 0, b: 0 }, opacity }, "color", variable);
}
function bindSize(node, sz, where) {
  if (!sz) return;
  const bind = (field, name) => { const v = sizeVar.get(name); if (v) node.setBoundVariable(field, v); else report.unmappedColors.push(`${where} size ${name}`); };
  if (sz.r && "topLeftRadius" in node) for (const field of ["topLeftRadius", "topRightRadius", "bottomLeftRadius", "bottomRightRadius"]) bind(field, sz.r);
  if (sz.h) bind("height", sz.h);
  if (sz.w) bind("width", sz.w);
}

// 글꼴은 setup-text-styles.js 가 스타일에 넣은 것을 그대로 불러온다. 대체 글꼴을 여기 따로 적지 않는다.
const styles = (await figma.getLocalTextStylesAsync()).filter((s) => s.name.startsWith("oe/"));
if (!styles.length) return { error: "oe 텍스트 스타일이 없다. 02-setup-text-styles 를 먼저 돌린다" };
const styleByName = new Map(styles.map((s) => [s.name, s]));
for (const font of new Map(styles.map((s) => [`${s.fontName.family}/${s.fontName.style}`, s.fontName])).values()) await figma.loadFontAsync(font);
const SCALE = { 12: "text-xs", 13: "text-oe-label", 14: "text-sm", 16: "text-base", 18: "text-lg", 20: "text-xl", 24: "text-2xl" };
const WEIGHT = { 400: "regular", 500: "medium", 600: "semibold", 700: "bold" };
function styleFor(fs, fw, where) {
  let scale = SCALE[fs];
  let weight = WEIGHT[fw];
  if (!weight) { weight = fw >= 650 ? "bold" : fw >= 550 ? "semibold" : fw >= 450 ? "medium" : "regular"; report.weightFallback.push(`${where} ${fw} → ${weight}`); }
  if (!scale) {
    const near = Object.keys(SCALE).map(Number).reduce((a, b) => (Math.abs(b - fs) < Math.abs(a - fs) ? b : a));
    report.unmappedText.push(`${where} ${fs}px → ${SCALE[near]}`);
    scale = SCALE[near];
  }
  const st = styleByName.get(`oe/${scale}/${weight}`);
  if (!st) throw new Error(`oe/${scale}/${weight} 텍스트 스타일이 없다. 02-setup-text-styles 를 다시 돌린다`);
  return st;
}

const ALIGN = { "flex-start": "MIN", start: "MIN", normal: "MIN", "flex-end": "MAX", end: "MAX", center: "CENTER", "space-between": "SPACE_BETWEEN", stretch: "MIN", baseline: "MIN" };
const TAG = "ooee.build";

// auto-layout 부모 안에서 자식이 DOM 과 다른 자리에 놓이면 그 자식만 absolute 로 뺀다. 한 자식을 빼면 가운데·끝 정렬의
// 형제가 다시 배치되므로, 바뀌는 자식이 없을 때까지 다시 잰다.
function settle(frame) {
  if (!frame.layoutMode || frame.layoutMode === "NONE") return;
  for (let round = 0; round < 6; round++) {
    let moved = false;
    for (const child of frame.children) {
      if ("layoutPositioning" in child && child.layoutPositioning === "ABSOLUTE") continue;
      const xy = child.getSharedPluginData(TAG, "xy");
      if (!xy) continue;
      const [ex, ey] = xy.split(",").map(Number);
      if (Math.abs(child.x - ex) > 2 || Math.abs(child.y - ey) > 2) {
        child.layoutPositioning = "ABSOLUTE";
        child.x = ex; child.y = ey;
        report.absoluteFallback++;
        moved = true;
      }
    }
    if (!moved) return;
  }
}
function place(node, spec, parentBox, parent) {
  const ex = spec.x - parentBox.x, ey = spec.y - parentBox.y;
  if (!parent.layoutMode || parent.layoutMode === "NONE") { node.x = ex; node.y = ey; return; }
  if (node.type === "FRAME") { node.layoutSizingHorizontal = "FIXED"; node.layoutSizingVertical = "FIXED"; }
  node.setSharedPluginData(TAG, "xy", `${ex},${ey}`);
  if (spec.portal) { node.layoutPositioning = "ABSOLUTE"; node.x = ex; node.y = ey; }
}

// 카탈로그로 만들어 둔 컴포넌트를 이름으로 찾는다. 한 번 찾은 것은 기억한다.
// 문서 전체를 뒤지면 모든 페이지를 불러오느라 한 단계가 몇십 분씩 걸린다. 「컴포넌트」 페이지만 본다.
let componentIndex = null;
async function componentNamed(name) {
  if (!componentIndex) {
    componentIndex = new Map();
    const catalog = figma.root.children.find((p) => p.name === "컴포넌트");
    if (catalog) {
      await catalog.loadAsync();
      for (const c of catalog.findAllWithCriteria({ types: ["COMPONENT"] })) if (!componentIndex.has(c.name)) componentIndex.set(c.name, c);
    }
  }
  return componentIndex.get(name) || null;
}
// 인스턴스 안의 글자를 화면의 글자로 바꾼다. 수가 다르면 바꾸지 않고 프레임으로 돌아간다.
function textsOf(spec, acc = []) {
  if (spec.t === "x") acc.push(spec);
  for (const kid of spec.k || []) textsOf(kid, acc);
  return acc;
}

async function build(spec, parent, parentBox) {
  let node;
  let needsSettle = false;
  // 인스턴스로 놓는 자리는 안쪽이 조각에 실려 오지 않는다. 그래서 컴포넌트를 못 찾으면 그릴 것이 없다.
  // 프레임으로 대신 그리면 이름도 색도 좌표도 없는 글자가 엉뚱한 자리에 놓이므로, 그리지 않고 멈춘다.
  if (spec.inst) {
    const component = await componentNamed(spec.inst);
    const wanted = textsOf(spec);
    if (!component) throw new Error(`컴포넌트를 찾지 못했다: ${spec.inst}. 카탈로그를 이 파일에 먼저 올린다`);
    const instance = component.createInstance();
    const slots = instance.findAllWithCriteria({ types: ["TEXT"] });
    if (slots.length !== wanted.length) {
      instance.remove();
      throw new Error(`컴포넌트의 글자 수가 다르다: ${spec.inst} 화면 ${wanted.length}개 ≠ 컴포넌트 ${slots.length}개. 카탈로그를 다시 올린다`);
    }
    for (const [i, text] of slots.entries()) {
      await figma.loadFontAsync(text.fontName);
      text.characters = wanted[i].s;
    }
    instance.name = spec.n;
    instance.resize(Math.max(1, spec.w), Math.max(1, spec.h));
    // 인스턴스 안쪽은 카탈로그의 경로를 물고 온다. 지우지 않으면 되읽기가 화면의 자리로 착각한다.
    for (const inner of instance.findAll(() => true)) inner.setSharedPluginData(TAG, "p", "");
    report.instances = (report.instances || 0) + 1;
    if (spec.path) instance.setSharedPluginData(TAG, "p", spec.path);
    parent.appendChild(instance);
    place(instance, spec, parentBox, parent);
    return instance;
  }
  // 아래 네 갈래는 노드를 만들어 속성을 다 쓴 **뒤에** parent 에 붙인다. 오토 레이아웃 부모에 붙은 노드의
  // 속성을 고치면 그때마다 부모 트리를 다시 재기 때문이다. 자식이 많을수록 그 값이 커진다
  // (2026-09-17 측정: 자식 500개 기준 9,558ms → 4,651ms).
  if (spec.t === "x") {
    node = figma.createText();
    const where = spec.s.slice(0, 16);
    await node.setTextStyleIdAsync(styleFor(spec.fs, spec.fw, where).id);
    node.characters = spec.s;
    node.name = spec.n;
    if (!spec.c) report.defaultTextColor.push(where);
    const p = paintFor(spec.c || { token: "oe-foreground-primary" }, `text:${where}`);
    if (p) node.fills = [p];
    node.textAlignHorizontal = spec.al === "center" ? "CENTER" : spec.al === "right" || spec.al === "end" ? "RIGHT" : "LEFT";
    // 폭을 먼저 정하고 높이 자동 맞춤을 켠다. resize 가 textAutoResize 를 되돌리지 않게 하려는 순서다.
    if (!spec.lh || spec.h <= spec.lh * 1.5) node.textAutoResize = "WIDTH_AND_HEIGHT";
    else { node.resize(spec.w, node.height); node.textAutoResize = "HEIGHT"; }
  } else if (spec.t === "rect") {
    // 자식 없이 칠·테두리만 있는 상자다. 배치할 것이 없으므로 Frame 이 아니라 Rectangle 로 둔다.
    node = figma.createRectangle();
    node.name = spec.n;
    node.fills = spec.bg ? [paintFor(spec.bg, `bg:${spec.n}`)].filter(Boolean) : [];
    if (spec.bd) {
      const p = paintFor(spec.bd.c, `border:${spec.n}`);
      if (p) {
        node.strokes = [p];
        node.strokeAlign = "INSIDE";
        if (spec.bd.ds) node.dashPattern = [4, 4];
        node.strokeWeight = spec.bd.w[0];
      }
    }
    if (spec.r) node.cornerRadius = spec.r;
    node.resize(Math.max(1, spec.w), Math.max(1, spec.h));
    bindSize(node, spec.sz, `rect:${spec.n}`);
  } else if (spec.t === "svg") {
    node = figma.createNodeFromSvg(CHUNK.icons[spec.icon] || spec.svg);
    node.name = spec.icon || "icon";
    node.resize(spec.w, spec.h);
    node.fills = [];
    const p = paintFor(spec.c, `icon:${node.name}`);
    if (p) for (const v of node.findAll((n) => "fills" in n && n.type !== "FRAME")) v.fills = [p];
    bindSize(node, spec.sz, `icon:${node.name}`);
  } else {
    node = figma.createFrame();
    node.name = spec.n;
    node.fills = spec.bg ? [paintFor(spec.bg, `bg:${spec.n}`)].filter(Boolean) : [];
    if (spec.bd) {
      const p = paintFor(spec.bd.c, `border:${spec.n}`);
      if (p) {
        node.strokes = [p];
        node.strokeAlign = "INSIDE";
        if (spec.bd.ds) node.dashPattern = [4, 4];
        const [top, right, bottom, left] = spec.bd.w;
        if (top === right && right === bottom && bottom === left) node.strokeWeight = top;
        else { node.strokeTopWeight = top; node.strokeRightWeight = right; node.strokeBottomWeight = bottom; node.strokeLeftWeight = left; }
      }
    }
    if (spec.r) node.cornerRadius = spec.r;
    node.clipsContent = !!spec.clip;
    if (spec.l) {
      node.layoutMode = spec.l.d === "V" ? "VERTICAL" : "HORIZONTAL";
      if (node.strokes.length) node.strokesIncludedInLayout = true; // CSS border-box 처럼 테두리 두께를 배치에 넣는다
      node.itemSpacing = spec.l.g;
      [node.paddingTop, node.paddingRight, node.paddingBottom, node.paddingLeft] = spec.l.p;
      node.primaryAxisAlignItems = ALIGN[spec.l.j] || "MIN";
      node.counterAxisAlignItems = ALIGN[spec.l.a] || "MIN";
      if (spec.l.wr && node.layoutMode === "HORIZONTAL") node.layoutWrap = "WRAP";
      node.primaryAxisSizingMode = "FIXED";
      node.counterAxisSizingMode = "FIXED";
    }
    node.resize(Math.max(1, spec.w), Math.max(1, spec.h));
    bindSize(node, spec.sz, `frame:${spec.n}`);
    if (!spec.stub) {
      for (const kid of spec.k || []) await build(kid, node, { x: spec.x, y: spec.y });
      needsSettle = true;
    }
  }
  // 여기서 처음 붙인다. 붙은 뒤에야 하는 것만 아래에 둔다.
  parent.appendChild(node);
  // settle 은 붙은 뒤에 잰다. 떨어져 있는 동안의 좌표는 부모의 배치를 거치지 않은 값이다.
  if (needsSettle) settle(node);
  report.created++;
  // 카탈로그의 항목은 프레임이 아니라 Figma 컴포넌트로 만든다. 화면을 그릴 때 인스턴스로 놓을 수 있다.
  if (spec.component) {
    node = figma.createComponentFromNode(node);
    node.name = `${spec.component.name}/${spec.component.props}`;
    node.description = `${spec.component.name} ${spec.component.props}. packages/ui 의 코드에서 그대로 옮겼다.`;
    report.components = (report.components || 0) + 1;
  }
  // 경로는 글자·아이콘까지 모든 노드에 남긴다. 되읽기(④)가 이 경로로 코드의 같은 자리를 찾는다.
  if (spec.path) node.setSharedPluginData(TAG, "p", spec.path);
  if (parent.type !== "PAGE") place(node, spec, parentBox, parent);
  return node;
}

try {
for (CHUNK of RUN) {
  let parent;
  if (CHUNK.rootFrame) {
    // 이름이 정확히 같은 프레임만 지우고 다시 그린다. 이름을 바꿔 둔 사람의 수정본(예: … (수정안))은 남는다.
    for (const old of page.children.filter((n) => n.name === CHUNK.rootFrame.name)) { report.replacedFrames.push(old.name); old.remove(); }
    parent = page;
  } else {
    const root = page.children.find((n) => n.type === "FRAME" && n.name === CHUNK.frameName && n.getSharedPluginData(TAG, "p"));
    parent = root && (root.getSharedPluginData(TAG, "p") === CHUNK.parentPath ? root : root.findOne((n) => n.type === "FRAME" && n.getSharedPluginData(TAG, "p") === CHUNK.parentPath));
    if (!parent) return { error: `부모 프레임을 찾지 못했다: ${CHUNK.frameName} ${CHUNK.parentPath}`, report };
  }
  for (const item of CHUNK.nodes) {
    const node = await build(item, parent, CHUNK.parentBox || { x: 0, y: 0 });
    if (CHUNK.rootFrame) {
      node.x = CHUNK.rootFrame.x;
      node.y = CHUNK.rootFrame.y;
      node.name = CHUNK.rootFrame.name;
      // 되읽기가 「이 프레임을 어느 코드로 그렸는지」를 알아야 색 규칙을 믿을 수 있다.
      node.setSharedPluginData(TAG, "build", CHUNK.rootFrame.build || "");
    }
  }
  if (CHUNK.lastForParent && parent.type === "FRAME") settle(parent);
}
} catch (e) {
  // 여기까지 그린 것은 남는다. 무엇이 왜 멈췄는지 돌려주고 사람이 고친 뒤 이 단계부터 다시 돌린다.
  return { error: (e && e.message) || String(e), report };
}
for (const key of ["unmappedColors", "unmappedText", "weightFallback", "defaultTextColor", "opacityOnToken"]) report[key] = [...new Set(report[key])].slice(0, 20);
return report;
