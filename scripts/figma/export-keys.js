// 라이브러리 파일의 Component Set 과 그 안 Variant 의 **키**를 읽는다. 파일을 바꾸지 않는다.
//
// **아직 어느 단계도 이것을 부르지 않는다.** prepare.mjs 가 단계 파일로 쓰지 않으므로 손으로 돌린다 —
// 이 파일을 그대로 `use_figma` 에 넘기면 된다(라이브러리 파일 키와 함께). 파일 간 인스턴스를
// 붙이기 시작할 때 파이프라인에 넣는다.
//
// 왜 키가 필요한가. 화면을 그리는 파일과 컴포넌트가 사는 라이브러리 파일이 다르면, 같은 페이지에서
// 이름으로 찾는 방식이 통하지 않는다. 다른 파일의 컴포넌트는 `figma.importComponentByKeyAsync(key)`
// 로만 가져올 수 있고, 그 키는 여기서 미리 뽑아 둬야 한다.
//
// 돌려받은 JSON 을 `scripts/figma/component-keys.json` 에 저장하면 prepare.mjs 가 조각에 실어 준다.
// 라이브러리를 다시 올리면 키가 바뀔 수 있으므로 그때마다 다시 뽑는다.
const SCREEN = __SCREEN__;

const page = figma.root.children.find((p) => p.name === SCREEN);
if (!page) return { error: `페이지 「${SCREEN}」 이 없다` };
await page.loadAsync();

const out = {};
let 변형수 = 0;
for (const set of page.findAllWithCriteria({ types: ["COMPONENT_SET"] })) {
  const variants = {};
  for (const child of set.children) {
    if (child.type !== "COMPONENT") continue;
    variants[child.name] = child.key;
    변형수 += 1;
  }
  out[set.name] = { key: set.key, variants };
}

// 세트에 들어가지 못하고 홀로 남은 컴포넌트도 알려 준다. 있으면 묶기가 덜 끝난 것이다.
const 홀로 = page
  .findAllWithCriteria({ types: ["COMPONENT"] })
  .filter((c) => !(c.parent && c.parent.type === "COMPONENT_SET"))
  .map((c) => c.name);

return { 세트수: Object.keys(out).length, 변형수, 홀로, keys: out };
