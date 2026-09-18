// 카탈로그가 만든 컴포넌트들을 종류별로 Figma **Component Set**(Variants)으로 묶는다.
// prepare.mjs 가 SCREEN 자리를 채워 steps/*-combine-variants.js 로 쓴다. build 단계 뒤, audit 앞에 온다.
//
// 이렇게 해야 Assets 패널에 `Button` 하나만 서고, 놓은 뒤 오른쪽에서 variant·tone·controlSize 를 고른다.
// 묶는 근거는 각 컴포넌트에 남겨 둔 `ooee.build`/`set` 이고, 옵션은 컴포넌트 이름(`축=값, 축=값`)에서 Figma 가 읽는다.
const SCREEN = __SCREEN__;
const TAG = "ooee.build";

const page = figma.root.children.find((p) => p.name === SCREEN);
if (!page) return { error: `페이지 「${SCREEN}」 이 없다` };
await figma.setCurrentPageAsync(page);

// 아직 묶이지 않은 것만 모은다. 이미 Component Set 안에 있는 것은 건드리지 않는다.
const groups = new Map();
for (const c of page.findAllWithCriteria({ types: ["COMPONENT"] })) {
  if (c.parent && c.parent.type === "COMPONENT_SET") continue;
  const set = c.getSharedPluginData(TAG, "set");
  if (!set) continue;
  if (!groups.has(set)) groups.set(set, []);
  groups.get(set).push(c);
}

const made = [];
const failed = [];
for (const [name, comps] of groups) {
  // 한 세트 안의 Variant 는 축 이름이 모두 같아야 한다. 다르면 Figma 가 묶기를 거절하므로 먼저 본다.
  const axes = comps.map((c) => c.name.split(", ").map((pair) => pair.split("=")[0]).join(","));
  const first = axes[0];
  const odd = axes.findIndex((a) => a !== first);
  if (odd >= 0) {
    failed.push(`${name}: 축이 다르다 「${first}」 와 「${axes[odd]}」`);
    continue;
  }
  try {
    // 그 자리에 그대로 묶는다. 페이지로 옮기면 카탈로그 프레임이 비어 버린다.
    const set = figma.combineAsVariants(comps, comps[0].parent);
    set.name = name;
    set.description = `${name}. packages/ui 의 코드에서 그대로 옮겼다. 옵션은 apps/sandbox 의 카탈로그 화면이 정한다.`;
    set.setSharedPluginData(TAG, "set", name);
    made.push({ 이름: name, 변형: comps.length, 옵션: Object.keys(set.variantGroupProperties || {}) });
  } catch (e) {
    failed.push(`${name}: ${(e && e.message) || e}`);
  }
}

if (failed.length) return { error: `묶지 못한 것이 있다: ${failed.join(" · ")}`, made };
return { made, 묶은세트: made.length };
