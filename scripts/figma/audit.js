// Figma use_figma 에 넘겨 프레임의 연결을 센다. 파일을 바꾸지 않는다.
// prepare.mjs 가 SCREEN(화면 페이지 이름)과 FRAMES(이번에 그린 프레임 이름 목록) 자리를 채운다.
// 완료 조건: missingFrames·strayNodes 가 비어 있고, 모든 프레임에서 unboundPaints 와 textsWithoutStyle 가 비어 있으며 rootWithoutFill 이 false 다.
// 칠이 있는 것만 세면 바탕이 빠진 루트 프레임도 통과하므로 루트의 보이는 칠을 따로 본다.
// opacityOnToken 은 완료를 막지 않지만 보고에 적어 확인받는다.
// 인스턴스는 세되 **안으로 내려가지 않는다.** 안쪽의 칠·글자는 라이브러리 컴포넌트가 책임지고, 화면이 넘긴 것은 글자뿐이다.
// `remoteInstances` 는 주 컴포넌트가 라이브러리에서 온 것(`mainComponent.remote`)이고, `localInstances` 는 이 파일 안의
// 컴포넌트를 가리키는 인스턴스다. 화면 파일에는 로컬 사본이 없어야 하므로 화면에서는 `localInstances` 가 비어야 한다.
// 페이지 최상위도 본다. build 가 도중에 멈추면 만들던 노드가 루트 밖 (0,0)에 고아로 남은 적이 있다(2026-09-22,
// 그 안에 라이브러리 인스턴스까지 들어 있었다). builder 가 이제 그것을 지우지만, 실행이 끊겨 지우지 못한 것은 여기서 잡는다.
// - `strayNodes`: 이번 프레임이 아니고 다 그린 루트 표식(`build`)도 없는데 이 도구의 경로 표식(`p`)을 가진 노드. 하나라도 있으면 완료가 아니다.
// - `otherTopLevel`: 그 밖의 최상위 노드. 사람이 둔 수정안·메모, 앞서 그린 다른 상태의 프레임, 표식이 생기기 전의 옛 고아다. 알리기만 한다.
const SCREEN = __SCREEN__;
const FRAMES = __FRAMES__;
const TAG = "ooee.build";
const page = figma.root.children.find((p) => p.name === SCREEN);
if (!page) return { error: `페이지 「${SCREEN}」 이 없다` };
await figma.setCurrentPageAsync(page);
const out = { page: page.name, missingFrames: FRAMES.filter((name) => !page.children.some((n) => n.name === name)), strayNodes: [], otherTopLevel: [], frames: [] };
for (const node of page.children) {
  if (FRAMES.includes(node.name) && node.getSharedPluginData(TAG, "build")) continue;
  const inside = "findAllWithCriteria" in node ? node.findAllWithCriteria({ types: ["INSTANCE"] }).length : 0;
  const line = `${node.id} ${node.type} ${node.name}${node.type === "INSTANCE" || inside ? ` (인스턴스 ${inside + (node.type === "INSTANCE" ? 1 : 0)})` : ""}`;
  const stray = node.getSharedPluginData(TAG, "p") && !node.getSharedPluginData(TAG, "build");
  const list = stray ? out.strayNodes : out.otherTopLevel;
  if (list.length < 20) list.push(line);
}
for (const frame of page.children.filter((n) => n.type === "FRAME" && FRAMES.includes(n.name))) {
  const rootWithoutFill = frame.fills === figma.mixed || !frame.fills.some((paint) => paint.visible !== false && (paint.opacity ?? 1) > 0);
  const stats = { name: frame.name, id: frame.id, width: frame.width, height: frame.height, rootWithoutFill, nodes: 0, autoLayoutFrames: 0, absoluteChildren: 0, solidPaints: 0, boundPaints: 0, unboundPaints: [], opacityOnToken: [], boundSizes: 0, texts: 0, textsWithStyle: 0, textsWithoutStyle: [], variables: new Set(), textStyles: new Set(), instances: 0, remoteInstances: 0, localInstances: [], instanceSets: new Set() };
  const nodes = [];
  const collect = (node) => { nodes.push(node); if (node.type === "INSTANCE") return; if ("children" in node) for (const kid of node.children) collect(kid); };
  collect(frame);
  for (const node of nodes) {
    if (node.type === "INSTANCE") {
      stats.instances++;
      const main = await node.getMainComponentAsync();
      if (main && main.remote) stats.remoteInstances++;
      else if (stats.localInstances.length < 20) stats.localInstances.push(node.name);
      if (main) stats.instanceSets.add(main.parent && main.parent.type === "COMPONENT_SET" ? main.parent.name : main.name);
    }
    stats.nodes++;
    if (node.type === "FRAME" && node.layoutMode && node.layoutMode !== "NONE") stats.autoLayoutFrames++;
    if ("layoutPositioning" in node && node.layoutPositioning === "ABSOLUTE") stats.absoluteChildren++;
    // 인스턴스 자신의 칠·크기 변수도 컴포넌트 값이다. 자리(absolute 여부)만 세고 넘어간다.
    if (node.type === "INSTANCE") continue;
    if (node.boundVariables) for (const field of ["width", "height", "topLeftRadius"]) if (node.boundVariables[field]) stats.boundSizes++;
    for (const key of ["fills", "strokes"]) {
      if (!(key in node) || node[key] === figma.mixed) continue;
      for (const paint of node[key]) {
        if (paint.type !== "SOLID") continue;
        stats.solidPaints++;
        const bound = paint.boundVariables && paint.boundVariables.color;
        if (bound) {
          stats.boundPaints++;
          const v = await figma.variables.getVariableByIdAsync(bound.id);
          if (v) stats.variables.add(v.name);
          // 변수 값 자체가 알파를 가진 색(brand-alpha-05, oe-interaction-hover 등)은 Figma 가 그 알파를 paint.opacity 로 보여 준다.
          // 값의 알파와 같으면 투명도를 더한 것이 아니다.
          const valueAlphas = v ? Object.values(v.valuesByMode).map((value) => (value && typeof value === "object" && "a" in value ? value.a : 1)) : [1];
          const added = paint.opacity !== undefined && paint.opacity < 1 && !valueAlphas.some((a) => Math.abs(a - paint.opacity) < 0.01);
          if (added && stats.opacityOnToken.length < 20) stats.opacityOnToken.push(`${node.name} ${key} ${v ? v.name : bound.id}/${Math.round(paint.opacity * 100)}`);
        } else if (stats.unboundPaints.length < 20) stats.unboundPaints.push(`${node.type} ${node.name} ${key}`);
      }
    }
    if (node.type === "TEXT") {
      stats.texts++;
      if (node.textStyleId && node.textStyleId !== figma.mixed) {
        stats.textsWithStyle++;
        const st = await figma.getStyleByIdAsync(node.textStyleId);
        if (st) stats.textStyles.add(st.name);
      } else if (stats.textsWithoutStyle.length < 20) stats.textsWithoutStyle.push(node.characters.slice(0, 24));
    }
  }
  stats.variables = [...stats.variables].sort();
  stats.textStyles = [...stats.textStyles].sort();
  stats.instanceSets = [...stats.instanceSets].sort();
  out.frames.push(stats);
}
return out;
