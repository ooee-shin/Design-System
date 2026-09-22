// 라이브러리 파일(`ooee · 컴포넌트 라이브러리`, fileKey 4HKy8Gi4Hd4VefFFvlIolc)에서 키 표를 읽는다. **파일을 바꾸지 않는다.**
//
// 이 파일을 그대로 `use_figma` 에 넘기고(fileKey 는 라이브러리 파일), 돌려받은 JSON 을 파일로 저장한 뒤
//   node scripts/figma/library.mjs save --from <저장한 JSON>
// 을 돌리면 `scripts/figma/library.json` 이 새로 쓰인다. 차례는 scripts/figma/README.md 「라이브러리 키 표」에 있다.
//
// 무엇을 읽는가. 화면 파일은 라이브러리 컴포넌트를 **키로만** 가져올 수 있다(`importComponentSetByKeyAsync`).
// 그래서 세트마다 키를 뽑고, prepare.mjs 가 화면을 읽을 때 「이 자리를 인스턴스로 놓아도 모양이 맞는가」를
// Figma 없이 가르도록 변형마다 **서명**(글자 노드의 텍스트 스타일·차례, 보이는 아이콘 이름)을 함께 뽑는다.
//
// 응답은 20,000자쯤에서 잘린다. 변형 587개를 이름째로 실으면 넘치므로, 세트마다 축(`axes`)과 값(`values`)을
// 한 번만 적고 변형은 값의 차례(`0.2.1`)로 적는다. `library.mjs save` 가 이름으로 다시 편다.
// `namesHash` 는 편 이름을 정렬해 잰 해시이고, `hash` 는 `sets` 전체의 해시다. 옮겨 적다 한 글자가 바뀌면
// save 가 멈춘다.
const fnv = (s) => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193); return h >>> 0; };
const TAG = "ooee.build";
const page = figma.root.children.find((p) => p.name === "컴포넌트");
if (!page) return { error: "「컴포넌트」 페이지가 없다. 라이브러리 파일이 맞는지 본다", pages: figma.root.children.map((p) => p.name) };
await page.loadAsync();

// 텍스트 스타일 이름은 표 하나에 모으고 변형에는 차례만 적는다.
const styles = [];
const styleIndex = new Map();
async function styleOf(text) {
  const id = text.textStyleId;
  if (!id || id === figma.mixed) return -1;
  if (!styleIndex.has(id)) {
    const style = await figma.getStyleByIdAsync(id);
    styles.push(style ? style.name : "?");
    styleIndex.set(id, styles.length - 1);
  }
  return styleIndex.get(id);
}

const sets = {};
const names = [];
const loose = [];
for (const set of page.findAllWithCriteria({ types: ["COMPONENT_SET"] })) {
  const kids = set.children.filter((c) => c.type === "COMPONENT");
  const axes = kids[0].name.split(", ").map((pair) => pair.slice(0, pair.indexOf("=")));
  const values = axes.map(() => []);
  const rows = [];
  for (const c of kids) {
    const pairs = c.name.split(", ").map((pair) => [pair.slice(0, pair.indexOf("=")), pair.slice(pair.indexOf("=") + 1)]);
    if (pairs.length !== axes.length || pairs.some(([axis], i) => axis !== axes[i])) return { error: `축이 다른 변형이 있다: ${set.name}/${c.name}` };
    const at = pairs.map(([, value], i) => { if (!values[i].includes(value)) values[i].push(value); return values[i].indexOf(value); });
    const shown = (n) => { for (let p = n; p && p !== c; p = p.parent) if (p.visible === false) return false; return true; };
    const texts = c.findAllWithCriteria({ types: ["TEXT"] });
    const textStyles = [];
    for (const t of texts) textStyles.push(await styleOf(t));
    // 글자가 하나이고 그 이름이 Placeholder·Value 면 역할을 적는다. 값도 placeholder 도 없는 화면의 빈 입력을
    // 이 자리에 빈 글자로 놓을 수 있는지 가른다.
    const role = texts.length === 1 && (texts[0].name === "Placeholder" || texts[0].name === "Value") ? texts[0].name[0] : "";
    const icons = c.findAll((n) => /^Ri[A-Z]/.test(n.name) && shown(n)).map((n) => n.name);
    rows.push(`${at.join(".")}|${textStyles.join(",")}|${role}|${icons.join("+")}`);
    names.push(`${set.name}/${c.name}`);
  }
  sets[set.name] = { key: set.key, status: await set.getPublishStatusAsync(), axes, values, rows };
}
for (const c of page.findAllWithCriteria({ types: ["COMPONENT"] })) if (!(c.parent && c.parent.type === "COMPONENT_SET")) loose.push(c.name);
// 카탈로그를 올린 프레임에 builder 가 남긴 표식(`catalog|s<상태>|<커밋>|<날짜>`)이다. prepare.mjs 가 그 커밋 뒤로
// packages/ui 가 바뀌었는지 보고 「라이브러리가 코드보다 낡았다」를 경고한다.
const built = [...new Set(page.children.map((n) => n.getSharedPluginData(TAG, "build")).filter(Boolean))].sort();
names.sort();
return { library: figma.root.name, count: names.length, namesHash: fnv(names.join("\n")), loose, built, styles, sets, hash: fnv(JSON.stringify([styles, sets])) };
