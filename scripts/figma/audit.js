// Figma use_figma 에 넘겨 프레임의 연결을 센다. 파일을 바꾸지 않는다.
// prepare.mjs 가 SCREEN(화면 페이지 이름)과 FRAMES(이번에 그린 프레임 이름 목록) 자리를 채운다.
// 완료 조건: missingFrames 가 비어 있고, 모든 프레임에서 unboundPaints 와 textsWithoutStyle 가 비어 있다.
// opacityOnToken 은 완료를 막지 않지만 보고에 적어 확인받는다.
const SCREEN = __SCREEN__;
const FRAMES = __FRAMES__;
const page = figma.root.children.find((p) => p.name === SCREEN);
if (!page) return { error: `페이지 「${SCREEN}」 이 없다` };
await figma.setCurrentPageAsync(page);
const out = { page: page.name, missingFrames: FRAMES.filter((name) => !page.children.some((n) => n.name === name)), frames: [] };
for (const frame of page.children.filter((n) => n.type === "FRAME" && FRAMES.includes(n.name))) {
  const stats = { name: frame.name, id: frame.id, width: frame.width, height: frame.height, nodes: 0, autoLayoutFrames: 0, absoluteChildren: 0, solidPaints: 0, boundPaints: 0, unboundPaints: [], opacityOnToken: [], boundSizes: 0, texts: 0, textsWithStyle: 0, textsWithoutStyle: [], variables: new Set(), textStyles: new Set() };
  for (const node of [frame, ...frame.findAll(() => true)]) {
    stats.nodes++;
    if (node.type === "FRAME" && node.layoutMode && node.layoutMode !== "NONE") stats.autoLayoutFrames++;
    if ("layoutPositioning" in node && node.layoutPositioning === "ABSOLUTE") stats.absoluteChildren++;
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
  out.frames.push(stats);
}
return out;
