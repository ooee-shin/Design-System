// builder.js·audit.js 를 **그대로** 가짜 Figma 문서 위에서 돌린다. Figma 도 브라우저도 부르지 않는다.
//
// 지키는 것은 둘이다.
// 1. build 가 도중에 멈춰도 페이지 최상위에 고아가 남지 않는다. createFrame·createInstance 는 노드를 현재 페이지
//    최상위에 만들고 builder 는 자식을 다 그린 뒤에야 부모에 붙이므로, 예전에는 「라이브러리에 없는 변형」으로 멈춘
//    자리의 부모 프레임이 (0,0)에 남았다(2026-09-22 반박 시험, 노드 5:46 「div」와 그 안의 Checkbox 인스턴스).
// 2. audit 가 그런 고아를 strayNodes 로 세고, 사람이 둔 것(수정안·메모)은 otherTopLevel 로 가른다.
//
// 가짜 문서는 builder 가 부르는 API 만 흉내 낸다. 흉내 낸 동작 가운데 시험이 기대는 것은 하나다 —
// `create*()`·`createInstance()` 가 만든 노드는 현재 페이지의 마지막 자식으로 선다(Figma plugin API 와 같다).
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { fnv, stripComments } from "./step-payload.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const builderSource = stripComments(readFileSync(path.join(here, "builder.js"), "utf8"));
const auditSource = readFileSync(path.join(here, "audit.js"), "utf8");
const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;
const TAG = "ooee.build";

function fakeFigma() {
  let seq = 0;
  const CONTAINERS = new Set(["PAGE", "FRAME", "COMPONENT", "COMPONENT_SET", "INSTANCE"]);
  class Node {
    constructor(type) {
      this.type = type;
      this.id = `${++seq}:1`;
      this.name = "";
      this.parent = null;
      this.removed = false;
      this.visible = true;
      this.plugin = new Map();
      this.x = 0; this.y = 0; this.width = 0; this.height = 0;
      this.fills = []; this.strokes = [];
      this.layoutMode = "NONE";
      this.layoutPositioning = "AUTO";
      if (CONTAINERS.has(type)) this.children = [];
    }
    appendChild(child) {
      if (child.parent) child.parent.children.splice(child.parent.children.indexOf(child), 1);
      child.parent = this;
      this.children.push(child);
    }
    remove() {
      if (this.parent) this.parent.children.splice(this.parent.children.indexOf(this), 1);
      this.parent = null;
      const mark = (n) => { n.removed = true; for (const k of n.children || []) mark(k); };
      mark(this);
    }
    resize(w, h) { this.width = w; this.height = h; }
    setSharedPluginData(ns, key, value) { this.plugin.set(`${ns}/${key}`, value); }
    getSharedPluginData(ns, key) { return this.plugin.get(`${ns}/${key}`) || ""; }
    setBoundVariable() {}
    async setTextStyleIdAsync(id) { this.textStyleId = id; }
    findAll(fn) {
      const out = [];
      const walk = (n) => { for (const k of n.children || []) { if (fn(k)) out.push(k); walk(k); } };
      walk(this);
      return out;
    }
    findOne(fn) { return this.findAll(fn)[0] || null; }
    findAllWithCriteria({ types }) { return this.findAll((n) => types.includes(n.type)); }
  }

  const root = new Node("DOCUMENT");
  root.children = [];
  const page = new Node("PAGE");
  page.name = "Page 1";
  root.appendChild(page);

  const figma = {
    mixed: Symbol("mixed"),
    root,
    currentPage: page,
    async setCurrentPageAsync(p) { figma.currentPage = p; },
    createPage() { const p = new Node("PAGE"); root.appendChild(p); return p; },
    variables: {
      async getLocalVariableCollectionsAsync() {
        return [
          { name: "oe primitive", id: "c1", modes: [{ modeId: "m1" }] },
          { name: "oe color", id: "c2", modes: [{ modeId: "m2" }] },
          { name: "oe size", id: "c3", modes: [{ modeId: "m3" }] },
        ];
      },
      async getLocalVariablesAsync(type) {
        return type === "COLOR" ? ["oe-background-primary", "oe-foreground-primary"].map((name) => ({ id: name, name, variableCollectionId: "c2", valuesByMode: { m2: { r: 1, g: 1, b: 1, a: 1 } } })) : [];
      },
      async getVariableByIdAsync(id) { return { id, name: id, valuesByMode: { m2: { r: 1, g: 1, b: 1, a: 1 } } }; },
      setBoundVariableForPaint(paint, _field, variable) { return { ...paint, boundVariables: { color: { id: variable.id } } }; },
    },
    async getLocalTextStylesAsync() {
      return ["regular", "medium"].map((w) => ({ id: `oe/text-sm/${w}`, name: `oe/text-sm/${w}`, fontName: { family: "Noto Sans KR", style: w } }));
    },
    async getStyleByIdAsync(id) { return { id, name: id }; },
    async loadFontAsync() {},
    createFrame() { const n = new Node("FRAME"); figma.currentPage.appendChild(n); return n; },
    createText() { const n = new Node("TEXT"); n.fontName = { family: "Noto Sans KR", style: "regular" }; figma.currentPage.appendChild(n); return n; },
    createRectangle() { const n = new Node("RECTANGLE"); figma.currentPage.appendChild(n); return n; },
    // 라이브러리 세트. 변형 하나(fill·brand·regular·기본)만 있고 글자 슬롯이 하나다.
    librarySet: null,
    async importComponentSetByKeyAsync() { return figma.librarySet; },
  };
  const set = new Node("COMPONENT_SET");
  set.name = "Button";
  const variant = new Node("COMPONENT");
  variant.name = "variant=fill, tone=brand, controlSize=regular, state=기본";
  variant.remote = true;
  set.appendChild(variant);
  variant.createInstance = () => {
    const instance = new Node("INSTANCE");
    const label = new Node("TEXT");
    label.name = "Label";
    label.fontName = { family: "Noto Sans KR", style: "medium" };
    instance.appendChild(label);
    instance.mainComponent = variant;
    instance.getMainComponentAsync = async () => variant;
    instance.layoutPositioning = "ABSOLUTE"; // 라이브러리 변형의 인스턴스는 absolute 로 나온다
    figma.currentPage.appendChild(instance);
    return instance;
  };
  figma.librarySet = set;
  return { figma, Node };
}

const SCREEN = "시험 화면";
const FRAME = `${SCREEN} / 기본 · Desktop 1440`;
const GOOD = "Button/variant=fill, tone=brand, controlSize=regular, state=기본";
const MISSING = "Button/variant=fill, tone=brand, controlSize=regular, state=기본-틀림";
const button = (path, inst) => ({ t: "f", n: "button", path, inst, x: 16, y: 16, w: 80, h: 40, k: [{ t: "x", s: "저장" }] });
const div = (inst) => ({ t: "f", n: "div", path: "t:s0.0", x: 0, y: 0, w: 668, h: 49, k: [button("t:s0.0.0", GOOD), button("t:s0.0.1", inst)] });
const rootSpec = (kids) => ({ t: "f", n: "main", path: "t:s0", x: 0, y: 0, w: 1440, h: 900, bg: { token: "oe-background-primary" }, k: kids });
const rootChunk = (nodes) => ({ frameName: FRAME, parentPath: null, parentBox: { x: 0, y: 0 }, rootFrame: { x: 0, y: 0, name: FRAME, build: "t|s0|abc1234|2026-09-22" }, nodes, primitives: {}, lib: { Button: "k" }, icons: {} });
const childChunk = (nodes) => ({ frameName: FRAME, parentPath: "t:s0", parentBox: { x: 0, y: 0 }, rootFrame: null, nodes, primitives: {}, lib: { Button: "k" }, icons: {}, lastForParent: 1 });

async function runBuilder(figma, RUN) {
  return new AsyncFunction("figma", "ARGS", builderSource)(figma, { SCREEN, EXPECT: fnv(JSON.stringify(RUN)), RUN });
}
/** 사람이 페이지에 둔 메모. 이 도구의 표식이 없다. build 가 건드리면 안 된다. */
function seedPage(figma, Node) {
  const page = figma.currentPage;
  page.name = SCREEN;
  const note = new Node("FRAME");
  note.name = "메모 (사람)";
  page.appendChild(note);
  return note;
}
const top = (figma) => figma.root.children.find((p) => p.name === SCREEN).children;

test("한 단계 안에서 루트를 그리다 멈추면 만들던 루트와 그 안의 인스턴스를 지운다", async () => {
  const { figma, Node } = fakeFigma();
  const note = seedPage(figma, Node);
  const result = await runBuilder(figma, [rootChunk([rootSpec([div(MISSING)])])]);
  assert.match(result.error, /라이브러리에 없는 변형이다/);
  assert.deepEqual(top(figma).map((n) => n.id), [note.id], `고아가 남았다: ${top(figma).map((n) => `${n.type} ${n.name}`).join(", ")}`);
  assert.ok(result.report.sweptOrphans.length >= 1);
});

test("루트는 다 그렸고 뒤 조각에서 멈추면 루트는 남고 붙이지 못한 덩이만 지운다", async () => {
  const { figma, Node } = fakeFigma();
  const note = seedPage(figma, Node);
  // prepare 가 큰 루트를 stub 으로 먼저 보내고 자식을 뒤 조각에 싣는 모양이다.
  const result = await runBuilder(figma, [rootChunk([{ ...rootSpec(), stub: 1 }]), childChunk([div(MISSING)])]);
  assert.match(result.error, /라이브러리에 없는 변형이다/);
  const pageNodes = top(figma);
  assert.deepEqual(pageNodes.map((n) => n.name), [note.name, FRAME]);
  assert.deepEqual(result.report.sweptOrphans, ["FRAME div"]);
  // 같은 단계를 다시 돌리면 이번에는 맞게 그려지고, 앞의 것이 두 벌로 남지 않는다.
  const again = await runBuilder(figma, [rootChunk([{ ...rootSpec(), stub: 1 }]), childChunk([div(GOOD)])]);
  assert.equal(again.error, undefined, again.error);
  assert.deepEqual(top(figma).map((n) => n.name), [note.name, FRAME]);
  assert.equal(top(figma)[1].findAllWithCriteria({ types: ["INSTANCE"] }).length, 2);
});

test("부모를 찾지 못해 멈춰도 고아를 남기지 않는다", async () => {
  const { figma, Node } = fakeFigma();
  seedPage(figma, Node);
  const result = await runBuilder(figma, [childChunk([div(GOOD)])]);
  assert.match(result.error, /부모를 찾지 못했다/);
  assert.deepEqual(top(figma).map((n) => n.name), ["메모 (사람)"]);
});

test("다 그리면 루트만 최상위에 서고 인스턴스는 루트 안의 제자리에 있다", async () => {
  const { figma, Node } = fakeFigma();
  seedPage(figma, Node);
  // 다 그리면 builder 는 report 자체를 돌려준다(멈췄을 때만 { error, report }).
  const report = await runBuilder(figma, [rootChunk([rootSpec([div(GOOD)])])]);
  assert.equal(report.error, undefined, report.error);
  assert.deepEqual(report.sweptOrphans, []);
  assert.equal(report.remoteInstances, 2);
  const [, root] = top(figma);
  assert.equal(root.getSharedPluginData(TAG, "build"), "t|s0|abc1234|2026-09-22");
  const instances = root.findAllWithCriteria({ types: ["INSTANCE"] });
  assert.deepEqual(instances.map((n) => n.parent.name), ["div", "div"]);
  // 붙이기 전에 멈춰도 알아볼 수 있게 경로 표식은 만들자마자 남는다.
  assert.deepEqual(instances.map((n) => n.getSharedPluginData(TAG, "p")), ["t:s0.0.0", "t:s0.0.1"]);
});

test("audit 는 표식만 있는 최상위 노드를 strayNodes 로, 사람이 둔 것을 otherTopLevel 로 가른다", async () => {
  const { figma, Node } = fakeFigma();
  seedPage(figma, Node);
  await runBuilder(figma, [rootChunk([rootSpec([div(GOOD)])])]);
  // 실행이 끊겨 builder 가 치우지 못한 고아를 흉내 낸다. 표식(p)은 있고 루트 표식(build)은 없다.
  const orphan = figma.createFrame();
  orphan.name = "div";
  orphan.setSharedPluginData(TAG, "p", "t:s0.0");
  orphan.appendChild(figma.librarySet.children[0].createInstance());
  const code = auditSource.replace("const SCREEN = __SCREEN__;", `const SCREEN = ${JSON.stringify(SCREEN)};`).replace("const FRAMES = __FRAMES__;", `const FRAMES = ${JSON.stringify([FRAME])};`);
  const out = await new AsyncFunction("figma", code)(figma);
  assert.deepEqual(out.missingFrames, []);
  assert.deepEqual(out.strayNodes, [`${orphan.id} FRAME div (인스턴스 1)`]);
  assert.equal(out.otherTopLevel.length, 1);
  assert.match(out.otherTopLevel[0], /메모 \(사람\)/);
  assert.equal(out.frames[0].remoteInstances, 2, "고아 안의 인스턴스는 프레임의 수에 섞이지 않는다");
});
