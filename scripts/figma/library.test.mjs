// 라이브러리 인스턴스를 고정한다. Figma 도 브라우저도 부르지 않는다.
//
// 지키는 것은 다섯이다.
// 1. 종류마다 DOM 조각에서 라이브러리 변형 이름이 결정적으로 나오고, 그 이름이 library.json 에 있다.
// 2. 인스턴스로 놓으면 모양이 틀리는 종류·자리는 이름 대신 까닭(unsupported)을 낸다.
// 3. 키 표에서 조각이 쓰는 세트 키만 고르고, 없는 이름은 prepare 와 builder 양쪽에서 멈춘다.
//    unsupported 도 예외(FRAME_EXCEPTIONS)가 없으면 멈추고, 쓰는 세트의 원본이 라이브러리보다 새로우면 멈춘다.
// 4. 인스턴스는 기본으로 켜진다.
// 5. 라이브러리와 상관없는 native 덩이를 notInLibrary 로 모은다.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { libraryRule, nativeChunk } from "./instance-rules.mjs";
import {
  collectNotInLibrary,
  coverageStop,
  decideInstances,
  driftAffects,
  expandExport,
  findVariant,
  formatLibrary,
  FRAME_EXCEPTIONS,
  framesException,
  instancesEnabled,
  LIBRARY,
  libraryKeys,
  readLibrary,
  setSourceFile,
  sourceClosure,
  stripMarks,
  TEXT_SCALE,
  TEXT_WEIGHT,
  textStyleName,
  variantNames,
  visualText,
} from "./library.mjs";
import { fnv } from "./step-payload.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, "..", "..");
// JSDOM 은 sandbox 의 개발 의존성이다. 루트에 따로 두지 않고 그 자리에서 빌려 쓴다.
const { JSDOM } = createRequire(path.join(repo, "apps/sandbox/package.json"))("jsdom");
const library = readLibrary();
const builder = readFileSync(path.join(here, "builder.js"), "utf8");

/** HTML 조각의 첫 요소. */
function el(html) {
  const { document } = new JSDOM(`<!doctype html><body>${html}</body>`).window;
  return document.body.firstElementChild;
}
/** 이름을 만들고, 그 이름이 라이브러리에 정말 있는지까지 본다. */
function nameOf(html) {
  const rule = libraryRule(el(html));
  assert.ok(rule && rule.inst, `이름이 나오지 않았다: ${JSON.stringify(rule)}`);
  assert.ok(findVariant(library, rule.inst), `library.json 에 없는 이름이다: ${rule.inst}`);
  return rule.inst;
}
function unsupportedOf(html) {
  const rule = libraryRule(el(html));
  assert.ok(rule && !rule.inst && rule.set && rule.why, `까닭이 나오지 않았다: ${JSON.stringify(rule)}`);
  return rule.set;
}

// ── 1. 종류마다 DOM → 변형 이름 ─────────────────────────────────────────────

test("Button: variant·tone·size 와 disabled 로 이름을 만든다", () => {
  assert.equal(nameOf('<button data-slot="button" data-variant="fill" data-tone="brand" data-size="xlarge"><span data-slot="button-label">결제하기</span></button>'), "Button/variant=fill, tone=brand, controlSize=xlarge, state=기본");
  assert.equal(nameOf('<button data-slot="button" data-variant="outline" data-tone="neutral" data-size="small" disabled><span>선택 삭제</span></button>'), "Button/variant=outline, tone=neutral, controlSize=small, state=disabled");
  // render 로 링크가 된 Button 도 data-slot 이 남는다.
  assert.equal(nameOf('<a href="/x" data-slot="button" data-variant="ghost" data-tone="danger" data-size="regular">삭제</a>'), "Button/variant=ghost, tone=danger, controlSize=regular, state=기본");
});

test("Input: 값·placeholder·invalid·disabled 가 state 를 가른다", () => {
  assert.equal(nameOf('<div data-slot="input-container" data-variant="outline" data-size="regular"><input data-slot="input" placeholder="이름"></div>'), "Input/variant=outline, controlSize=regular, state=비어 있음");
  assert.equal(nameOf('<div data-slot="input-container" data-variant="filled" data-size="large"><input data-slot="input" value="홍길동"></div>'), "Input/variant=filled, controlSize=large, state=값 있음");
  assert.equal(nameOf('<div data-slot="input-container" data-variant="outline" data-size="small"><input aria-invalid="true" value="x"></div>'), "Input/variant=outline, controlSize=small, state=invalid");
  assert.equal(nameOf('<div data-slot="input-container" data-variant="outline" data-size="xlarge" data-disabled="true"><input disabled></div>'), "Input/variant=outline, controlSize=xlarge, state=disabled");
});

test("NumberInput: 안쪽 input 의 data-controls 로 Input 과 가른다", () => {
  const box = (controls, buttons = "") => `<div data-slot="input-container" data-variant="outline" data-size="small"><input data-controls="${controls}" value="2">${buttons}</div>`;
  assert.equal(nameOf(box("split", "<button>-</button><button>+</button>")), "NumberInput/variant=outline, controlSize=small, controls=split");
  assert.equal(nameOf(box("trailing")), "NumberInput/variant=outline, controlSize=small, controls=trailing");
  assert.equal(nameOf(box("none")), "NumberInput/variant=outline, controlSize=small, controls=없음");
});

test("Textarea·InputButton", () => {
  assert.equal(nameOf('<div data-slot="textarea-container" data-variant="outline"><textarea placeholder="내용"></textarea></div>'), "Textarea/variant=outline, state=비어 있음");
  assert.equal(nameOf('<button data-slot="input-button" data-variant="outline" data-size="regular" data-has-value="true"><span data-slot="input-button-value">서울시</span></button>'), "InputButton/variant=outline, controlSize=regular, state=값 있음");
  assert.equal(nameOf('<button data-slot="input-button" data-variant="filled" data-size="large" data-invalid=""><span>주소</span></button>'), "InputButton/variant=filled, controlSize=large, state=invalid");
  // InputButton 은 invalid 를 aria-invalid 로만 남긴다. 카탈로그 시험이 이 자리를 찾아냈다(예전 규칙은 「비어 있음」으로 읽었다).
  assert.equal(nameOf('<button data-slot="input-button" data-variant="outline" data-size="small" data-has-value="false" aria-invalid="true"><span>선택</span></button>'), "InputButton/variant=outline, controlSize=small, state=invalid");
});

test("Select·Combobox: 트리거만, Multi 는 data-selection-mode 로", () => {
  assert.equal(nameOf('<button data-slot="select-trigger" data-variant="outline" data-size="regular"><span>추천순</span></button>'), "Select/variant=outline, controlSize=regular, state=값 있음");
  assert.equal(nameOf('<button data-slot="select-trigger" data-variant="outline" data-size="regular" data-placeholder=""><span>선택</span></button>'), "Select/variant=outline, controlSize=regular, state=비어 있음");
  assert.equal(nameOf('<button data-slot="select-trigger" data-selection-mode="multiple" data-variant="filled" data-size="small" data-disabled=""></button>'), "MultiSelect/variant=filled, controlSize=small, state=disabled");
  assert.equal(nameOf('<div data-slot="combobox-trigger" data-variant="outline" data-size="large" data-invalid=""></div>'), "Combobox/variant=outline, controlSize=large, state=invalid");
  assert.equal(nameOf('<div data-slot="combobox-trigger" data-selection-mode="multiple" data-variant="outline" data-size="regular"></div>'), "MultiCombobox/variant=outline, controlSize=regular, state=값 있음");
});

test("Checkbox·CheckboxField: Base UI 의 빈 문자열 상태를 있고 없음으로 읽는다", () => {
  assert.equal(nameOf('<button data-slot="checkbox" data-shape="rounded"></button>'), "Checkbox/shape=rounded, state=off");
  assert.equal(nameOf('<button data-slot="checkbox" data-shape="square" data-checked=""></button>'), "Checkbox/shape=square, state=on");
  assert.equal(nameOf('<button data-slot="checkbox" data-shape="rounded" data-checked="" data-indeterminate=""></button>'), "Checkbox/shape=rounded, state=indeterminate");
  assert.equal(nameOf('<button data-slot="checkbox" data-shape="rounded" data-disabled=""></button>'), "Checkbox/shape=rounded, state=disabled");
  // ghost 는 일부 선택을 Root 가 아니라 안쪽 indicator 에만 찍는다(checkbox.tsx).
  assert.equal(nameOf('<span data-slot="checkbox" data-shape="ghost" data-unchecked=""><span data-slot="checkbox-indicator" data-checked="" data-indeterminate=""></span></span>'), "Checkbox/shape=ghost, state=indeterminate");
  assert.equal(nameOf('<label data-slot="checkbox-field" data-shape="rounded" data-description="없음"><button data-slot="checkbox" data-shape="rounded" data-checked=""></button><span>품절 제외</span></label>'), "CheckboxField/shape=rounded, state=on, description=없음");
});

test("Radio·RadioField·Switch·SwitchField", () => {
  assert.equal(nameOf('<button data-slot="radio" data-checked=""></button>'), "Radio/state=on");
  assert.equal(nameOf('<button data-slot="radio" data-disabled=""></button>'), "Radio/state=disabled-off");
  assert.equal(nameOf('<label data-slot="radio-field" data-description="있음"><button data-slot="radio" data-checked="" data-disabled=""></button><span>카드</span><span>설명</span></label>'), "RadioField/state=disabled-on, description=있음");
  assert.equal(nameOf('<button data-slot="switch" data-size="medium" data-checked=""></button>'), "Switch/controlSize=medium, state=on");
  assert.equal(nameOf('<label data-slot="switch-field" data-size="large" data-label-position="left"><button data-slot="switch" data-size="large"></button></label>'), "SwitchField/controlSize=large, state=off, labelPosition=left");
});

test("Chip·Badge·NotificationBadge·ToggleButton", () => {
  assert.equal(nameOf('<button data-slot="chip" data-shape="rounded" data-size="regular"><span data-slot="chip-label">230</span></button>'), "Chip/shape=rounded, controlSize=regular, state=기본");
  assert.equal(nameOf('<button data-slot="chip" data-shape="circle" data-size="compact" data-active=""></button>'), "Chip/shape=circle, controlSize=compact, state=active");
  // Badge 는 useRender 가 state 를 data-* 로 찍는다. 기본값이 빠진 자리는 neutral·small 이다.
  assert.equal(nameOf('<span data-slot="badge" data-variant="tonal">2</span>'), "Badge/variant=tonal, tone=neutral, size=small");
  assert.equal(nameOf('<span data-slot="badge" data-variant="fill" data-tone="danger" data-size="medium">품절</span>'), "Badge/variant=fill, tone=danger, size=medium");
  assert.equal(nameOf('<span data-slot="notification-badge" data-shape="count" data-tone="accent" data-overflow="99+">99+</span>'), "NotificationBadge/shape=count, tone=accent, overflow=99+");
  assert.equal(nameOf('<button data-slot="toggle-button" data-variant="ghost" data-tone="custom" data-color="like" data-size="small" data-pressed=""><span data-slot="toggle-button-count">12</span></button>'), "ToggleButton/variant=ghost, tone=like, controlSize=small, state=pressed, count=있음");
  assert.equal(nameOf('<button data-slot="toggle-button" data-variant="tonal" data-tone="brand" data-size="regular"></button>'), "ToggleButton/variant=tonal, tone=brand, controlSize=regular, state=기본, count=없음");
});

// ── 2. 인스턴스로 옮기면 틀리는 자리 ────────────────────────────────────────

test("라이브러리에 세트는 있지만 안쪽이 굳어 있는 종류는 이름 대신 까닭을 낸다", () => {
  assert.equal(unsupportedOf('<div data-slot="field"><label data-slot="field-label">정렬</label><button data-slot="select-trigger" data-variant="outline" data-size="regular"></button></div>'), "Field");
  assert.equal(unsupportedOf('<button data-slot="select-box" data-trailing-element="radio"></button>'), "SelectBox");
  assert.equal(unsupportedOf('<header data-slot="app-header" data-sides="both" data-title-align="center"></header>'), "AppHeader");
  assert.equal(unsupportedOf('<nav data-slot="bottom-navigation" data-variant="bar" data-show-labels="true"></nav>'), "BottomNavigation");
  assert.equal(unsupportedOf('<div data-slot="calendar"></div>'), "Calendar");
});

test("앞뒤 요소·custom tone·꺼진 버튼처럼 글자로 넘길 수 없는 차이는 프레임으로 둔다", () => {
  // 검색 Input 의 앞 아이콘. 예전 규칙은 이 자리를 Input 으로 놓아 아이콘을 잃었다(이슈 #9 화면 다섯 곳).
  assert.equal(unsupportedOf('<div data-slot="input-container" data-variant="outline" data-size="regular"><span data-slot="input-leading"><svg></svg></span><input placeholder="상품 검색"></div>'), "Input");
  assert.equal(unsupportedOf('<div data-slot="input-container" data-variant="outline" data-size="regular"><span data-slot="input-prefix">₩</span><input></div>'), "Input");
  // 최솟값에 닿아 − 버튼이 꺼진 NumberInput. 라이브러리는 늘 켜진 모양이다.
  assert.equal(unsupportedOf('<div data-slot="input-container" data-variant="outline" data-size="small"><button disabled>-</button><input data-controls="split" value="1"><button>+</button></div>'), "NumberInput");
  assert.equal(unsupportedOf('<button data-slot="button" data-variant="fill" data-tone="custom" data-size="regular">엑셀</button>'), "Button");
  assert.equal(unsupportedOf('<span data-slot="badge" data-variant="fill" data-tone="custom">새</span>'), "Badge");
  assert.equal(unsupportedOf('<span data-slot="chip" data-shape="rounded" data-size="small"><span data-slot="chip-label">서울</span><button data-slot="chip-remove"></button></span>'), "Chip");
  assert.equal(unsupportedOf('<button data-slot="input-button" data-variant="outline" data-size="regular"><span data-slot="input-button-leading"></span></button>'), "InputButton");
  assert.equal(unsupportedOf('<label data-slot="radio-field" data-description="없음"><span data-slot="radio-leading"></span><button data-slot="radio"></button></label>'), "RadioField");
  // buttonVariants 로 칠한 링크는 data-* 가 없다. 화면 코드를 <Button render={<a/>}> 로 바꾸면 인스턴스가 된다.
  assert.equal(unsupportedOf('<a href="/shop-checkout" class="group/button inline-flex shrink-0">주문하기</a>'), "Button");
});

test("컴포넌트 뿌리가 아닌 요소에는 아무것도 붙이지 않는다", () => {
  assert.equal(libraryRule(el('<span data-slot="button-label">라벨</span>')), null);
  assert.equal(libraryRule(el('<div class="flex">x</div>')), null);
  assert.equal(libraryRule(el('<a href="/x" class="text-sm">링크</a>')), null);
});

test("규칙 함수는 바깥 이름 없이 돈다 — prepare 가 소스를 브라우저에 끼워 넣는다", () => {
  // 모듈 범위 없이 소스만으로 다시 만든 함수가 같은 답을 내야 브라우저에서도 돈다.
  const isolated = new Function(`return (${libraryRule.toString()});`)();
  const isolatedChunk = new Function(`return (${nativeChunk.toString()});`)();
  const html = '<button data-slot="checkbox" data-shape="rounded" data-checked=""></button>';
  assert.deepEqual(isolated(el(html)), libraryRule(el(html)));
  assert.equal(isolatedChunk(el('<nav aria-label="페이지 이동"></nav>')), "nav 페이지 이동");
  // dom-extract.js 에 두 자리가 있고, 채운 뒤 식으로 파싱된다.
  const extract = readFileSync(path.join(here, "dom-extract.js"), "utf8");
  assert.ok(extract.includes("const libraryRule = __LIBRARY_RULE__;") && extract.includes("const nativeChunk = __NATIVE_CHUNK__;"));
  const filled = extract.split("\n").filter((l) => !l.startsWith("//")).join("\n").replace("__LIBRARY_RULE__", () => libraryRule.toString()).replace("__NATIVE_CHUNK__", () => nativeChunk.toString());
  assert.doesNotThrow(() => new Function(`return ${filled};`));
  const prepare = readFileSync(path.join(here, "prepare.mjs"), "utf8");
  assert.ok(prepare.includes('.replace("__LIBRARY_RULE__", () => libraryRule.toString())'), "prepare.mjs 가 규칙 소스를 끼워 넣지 않는다");
});

// ── 3. 키 표 ───────────────────────────────────────────────────────────────

test("library.json 은 게시된 라이브러리 파일을 가리키고 스스로 맞는다", () => {
  assert.equal(library.fileKey, LIBRARY.fileKey);
  assert.equal(library.fileKey, "4HKy8Gi4Hd4VefFFvlIolc");
  const names = variantNames(library).sort();
  assert.equal(names.length, library.variants);
  assert.equal(fnv(names.join("\n")), library.namesHash, "변형 이름을 손으로 고친 것 같다. export-keys.js 로 다시 뽑는다");
  for (const [set, { key }] of Object.entries(library.sets)) assert.match(key, /^[0-9a-f]{40}$/, `${set} 의 key 모양이 아니다`);
  // 다시 쓰면 글자까지 같아야 한다. 손으로 고친 흔적이 diff 에 섞이지 않게 한다.
  assert.equal(formatLibrary(library), readFileSync(path.join(here, "library.json"), "utf8"));
});

test("조각이 쓰는 세트의 키만 고른다", () => {
  const nodes = [
    { t: "f", k: [
      { t: "f", inst: "Button/variant=fill, tone=brand, controlSize=regular, state=기본", k: [{ t: "x", s: "저장" }] },
      { t: "f", inst: "Badge/variant=tonal, tone=neutral, size=small", k: [{ t: "x", s: "2" }] },
      { t: "f", inst: "Button/variant=ghost, tone=neutral, controlSize=small, state=기본" },
    ] },
  ];
  assert.deepEqual(libraryKeys(nodes, library), { Button: library.sets.Button.key, Badge: library.sets.Badge.key });
  assert.deepEqual(libraryKeys([{ t: "f", k: [{ t: "x", s: "글자" }] }], library), {});
});

const text = (s, fs = 14, fw = 500) => ({ t: "x", s, fs, fw });
const button = (label, extra = {}) => ({ t: "f", path: "p:s0.1", n: "button", inst: "Button/variant=fill, tone=brand, controlSize=regular, state=기본", k: [text(label)], ...extra });

test("모양이 맞으면 인스턴스로 확정하고, 이름이 없으면 멈출 자리로 남긴다", () => {
  const tree = { t: "f", path: "p:s0", k: [button("저장"), { t: "f", path: "p:s0.2", n: "button", inst: "Button/variant=fill, tone=violet, controlSize=regular, state=기본", k: [text("보라")] }] };
  const out = decideInstances(tree, library);
  assert.deepEqual(out.instances.map((r) => r.path), ["p:s0.1"]);
  // 라이브러리에 없는 이름은 조용히 프레임으로 떨어뜨리지 않는다. inst 를 그대로 두어 prepare 가 exit 3, builder 가 error.
  assert.deepEqual(out.missing, [{ path: "p:s0.2", name: "Button/variant=fill, tone=violet, controlSize=regular, state=기본" }]);
  assert.equal(tree.k[1].inst, "Button/variant=fill, tone=violet, controlSize=regular, state=기본");
  // prepare 는 그 이름을 manifest 의 missingInLibrary 에 싣고 exit 3 으로 끝난다. 브라우저가 있어야 도는 본문이라 글자로 본다.
  const prepare = readFileSync(path.join(here, "prepare.mjs"), "utf8");
  assert.match(prepare, /libraryReport\.missingInLibrary\.push\(\.\.\.tag\(decided\.missing\)\)/);
  assert.match(prepare, /const coverage = coverageStop\(libraryReport, framesAllowed\);/);
  assert.match(prepare, /if \(coverage\) \{[\s\S]*?process\.exit\(3\);/);
});

// ── 3-1. 라이브러리가 화면을 다 덮지 못하면 멈춘다 ──────────────────────────

const missingRow = { path: "p:s0.1", name: "Button/variant=fill, tone=violet, controlSize=regular, state=기본" };
const unsupportedRow = (set, why) => ({ path: "p:s0.2", set, why });

test("세트는 있는데 맞는 변형이 없는 자리(unsupported)도 멈춘다 — 조용히 프레임으로 그리지 않는다", () => {
  // 2026-09-22 반박 시험: 장바구니 13곳 가운데 6곳이 unsupported 로 프레임이 됐는데 prepare 가 exit 0 이었다.
  const cart = [
    unsupportedRow("Input", "앞뒤 요소가 붙은 Input 변형이 라이브러리에 없다"),
    unsupportedRow("NumberInput", "−·+ 버튼이 꺼진 모양이 없다"),
    unsupportedRow("NumberInput", "−·+ 버튼이 꺼진 모양이 없다"),
  ];
  const stop = coverageStop({ missingInLibrary: [], unsupported: cart });
  assert.match(stop, /맞는 변형이 없는 자리 3곳/);
  assert.match(stop, /NumberInput — −·\+ 버튼이 꺼진 모양이 없다 ×2/);
  assert.match(stop, /코드 → 카탈로그 → 라이브러리/);
  assert.equal(coverageStop({ missingInLibrary: [], unsupported: [] }), null);
});

test("예외로 정한 요청의 화면만 unsupported 를 프레임으로 둔다. 없는 변형은 예외여도 멈춘다", () => {
  const exception = framesException(["--key", "shop-cart", "--allow-frames", "9"], "shop-cart");
  assert.equal(exception.issue, 9);
  assert.equal(coverageStop({ missingInLibrary: [], unsupported: [unsupportedRow("Field", "굳어 있다")] }, exception), null);
  assert.match(coverageStop({ missingInLibrary: [missingRow], unsupported: [] }, exception), /라이브러리에 없는 변형 1개/);
  // `#9` 로 적어도 같다.
  assert.equal(framesException(["--allow-frames", "#9"], "shop-checkout").issue, 9);
  assert.equal(framesException(["--key", "voc"], "voc"), null);
});

test("--allow-frames 는 등록된 요청과 그 요청의 화면에만 듣는다", () => {
  // 에이전트가 플래그만 붙여 규칙을 비껴가지 못하게 한다. 예외를 더하는 것은 FRAME_EXCEPTIONS 를 고치는 커밋이다.
  assert.throws(() => framesException(["--allow-frames", "12"], "voc"), /예외로 정한 요청이 아니다/);
  assert.throws(() => framesException(["--allow-frames", "9"], "voc"), /voc 는 그 요청의 화면이 아니다/);
  assert.throws(() => framesException(["--allow-frames"], "shop-cart"), /예외로 정한 요청이 아니다/);
});

test("예외 표의 화면은 sandbox 에 등록된 화면이다", async () => {
  const { sandboxScreens } = await import("../../apps/sandbox/src/screens.ts");
  const keys = new Set(sandboxScreens.map((s) => s.key));
  for (const [issue, entry] of Object.entries(FRAME_EXCEPTIONS)) {
    assert.match(entry.decided, /^\d{4}-\d{2}-\d{2}$/);
    for (const key of entry.keys) assert.ok(keys.has(key), `#${issue} 의 ${key} 가 screens.ts 에 없다`);
  }
});

// ── 3-2. 라이브러리가 코드보다 낡았는가 ────────────────────────────────────────

test("세트마다 원본 파일이 있고, 불러 쓰는 파일까지 원본으로 본다", () => {
  const read = (file) => { try { return readFileSync(path.join(repo, file), "utf8"); } catch { return null; } };
  for (const set of Object.keys(library.sets)) assert.ok(read(setSourceFile(set)) !== null, `${set} 의 원본 ${setSourceFile(set)} 이 없다`);
  assert.equal(setSourceFile("MultiCombobox"), "packages/ui/src/combobox.tsx");
  assert.equal(setSourceFile("CheckboxField"), "packages/ui/src/checkbox.tsx");
  assert.equal(setSourceFile("Field"), "packages/ui/src/field.tsx");
  assert.equal(setSourceFile("InputButton"), "packages/ui/src/input-button.tsx");
  // NumberInput 은 Input 의 컨테이너를 쓴다. input.tsx 가 바뀌면 NumberInput 인스턴스도 낡는다.
  assert.ok(sourceClosure(setSourceFile("NumberInput"), read).has("packages/ui/src/input.tsx"));
  assert.ok(sourceClosure(setSourceFile("Select"), read).has("packages/ui/src/selection-trigger.ts"));
});

test("주석·공백·data-* 만 바뀐 파일은 모양이 바뀐 것으로 치지 않는다", () => {
  // 2026-09-22 의 checkbox.tsx 가 이 모양이다. Figma 규칙이 읽을 data-* 를 더했을 뿐 칠은 그대로다.
  const before = `    <label className={cn(\n      "flex gap-2",\n    )}>`;
  const after = `    <label\n      data-slot="checkbox-field"\n      data-shape={shape}\n      data-description={bottomDescription === undefined ? "없음" : "있음"}\n      className={cn(\n      // 설명\n      "flex gap-2",\n    )}>`;
  assert.equal(visualText(before), visualText(after));
  // class 가 바뀌면 모양이 바뀐 것이다. data-[…]: 처럼 CSS 가 data-* 를 고르는 것도 class 글자라 남는다.
  assert.notEqual(visualText(`className="bg-oe-background-primary"`), visualText(`className="bg-oe-background-secondary"`));
  assert.notEqual(visualText(`className="x"`), visualText(`className="x data-[shape=ghost]:border-0"`));
  assert.notEqual(visualText("/* a */ const a = 1"), visualText("const a = 2"));
});

test("이 화면이 인스턴스로 쓰는 세트의 원본이 바뀌었을 때만 낡았다고 본다", () => {
  const files = {
    "packages/ui/src/button.tsx": 'import { cn } from "./utils"',
    "packages/ui/src/chip.tsx": 'import { cn } from "./utils"',
    "packages/ui/src/number-input.tsx": 'import { Input } from "./input"\nimport { cn } from "./utils"',
    "packages/ui/src/input.tsx": 'import { cn } from "./utils"',
    "packages/ui/src/utils.ts": "",
  };
  const read = (f) => (f in files ? files[f] : null);
  assert.deepEqual(driftAffects(["Button", "Button", "NumberInput"], ["packages/ui/src/chip.tsx"], read), []);
  assert.deepEqual(driftAffects(["Button", "NumberInput"], ["packages/ui/src/input.tsx"], read), [{ set: "NumberInput", files: ["packages/ui/src/input.tsx"] }]);
  // 토큰 값과 공용 CSS 는 모든 세트의 모양에 닿는다.
  assert.deepEqual(driftAffects(["Button"], ["packages/tokens/src/semantic.ts"], read), [{ set: "Button", files: ["packages/tokens/src/semantic.ts"] }]);
  assert.deepEqual(driftAffects([], ["packages/tokens/src/semantic.ts"], read), []);
  // prepare 는 이 목록이 비지 않으면 --allow-drift 없이는 exit 4 로 멈춘다.
  const prepare = readFileSync(path.join(here, "prepare.mjs"), "utf8");
  assert.match(prepare, /if \(driftAffected\.length && !allowDrift\) \{[\s\S]*?process\.exit\(4\);/);
});

test("글자 자리 수·텍스트 스타일·아이콘이 라이브러리와 다르면 까닭과 함께 프레임으로 둔다", () => {
  const iconOnly = button("", { k: [{ t: "svg", icon: "RiDeleteBinLine" }] });
  const bold = button("전체 선택", { k: [text("전체 선택", 14, 600)] });
  const withIcon = button("저장", { k: [{ t: "svg", icon: "RiSaveLine" }, text("저장")] });
  const tree = { t: "f", k: [iconOnly, bold, withIcon] };
  const out = decideInstances(tree, library);
  assert.equal(out.instances.length, 0);
  assert.deepEqual(out.unsupported.map((r) => r.why.split(":")[0]), ["글자 자리 수가 다르다", "글자 스타일이 다르다", "아이콘이 다르다"]);
  assert.ok(tree.k.every((n) => !n.inst), "프레임으로 둘 자리의 inst 를 지운다");
});

test("값도 placeholder 도 없는 빈 입력은 Placeholder 자리를 빈 글자로 채워 놓는다", () => {
  const tree = { t: "f", k: [{ t: "f", path: "p:s0.1", inst: "Input/variant=outline, controlSize=regular, state=비어 있음", k: [{ t: "f", n: "input" }] }] };
  const out = decideInstances(tree, library);
  assert.equal(out.instances.length, 1);
  assert.equal(tree.k[0].blank, 1);
});

test("아이콘까지 맞는 자리는 ic 로 넘겨 builder 가 한 번 더 견준다", () => {
  const trigger = { t: "f", path: "p:s0.1", inst: "Select/variant=outline, controlSize=regular, state=값 있음", k: [text("추천순", 14, 400), { t: "svg", icon: "RiArrowDownSLine" }] };
  const out = decideInstances({ t: "f", k: [trigger] }, library);
  assert.equal(out.instances.length, 1);
  assert.deepEqual(trigger.ic, ["RiArrowDownSLine"]);
});

test("프레임으로 둔 자리 안쪽의 컴포넌트는 제 차례를 갖고, 인스턴스 안쪽은 보지 않는다", () => {
  const field = { t: "f", path: "p:s0.1", unsup: { set: "Field", why: "속 컨트롤이 굳어 있다" }, k: [text("정렬"), { t: "f", path: "p:s0.1.1", inst: "Select/variant=outline, controlSize=regular, state=값 있음", k: [text("추천순", 14, 400), { t: "svg", icon: "RiArrowDownSLine" }] }] };
  const checkboxField = { t: "f", path: "p:s0.2", inst: "CheckboxField/shape=rounded, state=off, description=없음", k: [{ t: "f", path: "p:s0.2.0", inst: "Checkbox/shape=rounded, state=off" }, text("품절 제외", 14, 400)] };
  const out = decideInstances({ t: "f", k: [field, checkboxField] }, library);
  assert.deepEqual(out.unsupported.map((r) => r.set), ["Field"]);
  assert.deepEqual(out.instances.map((r) => r.path), ["p:s0.1.1", "p:s0.2"]);
});

test("textStyleName 은 builder 의 styleFor 와 같은 표를 쓴다", () => {
  const literal = (name) => {
    const m = builder.match(new RegExp(`const ${name} = (\\{[^}]*\\});`));
    assert.ok(m, `builder.js 에서 ${name} 표를 찾지 못했다`);
    return new Function(`return ${m[1]};`)();
  };
  assert.deepEqual(literal("SCALE"), TEXT_SCALE);
  assert.deepEqual(literal("WEIGHT"), TEXT_WEIGHT);
  assert.equal(textStyleName(14, 500), "oe/text-sm/medium");
  assert.equal(textStyleName(15, 590), "oe/text-sm/semibold");
});

test("export-keys 응답을 펴고, 옮겨 적다 바뀌면 멈춘다", () => {
  const sets = { Radio: { key: "c".repeat(40), status: "CURRENT", axes: ["state"], values: [["off", "on"]], rows: ["0|||", "1||P|RiCheckLine"] } };
  const styles = ["oe/text-sm/regular"];
  const names = ["Radio/state=off", "Radio/state=on"];
  const exported = { count: 2, namesHash: fnv(names.join("\n")), loose: [], built: ["catalog|s0|abc1234|2026-09-22"], styles, sets, hash: fnv(JSON.stringify([styles, sets])) };
  const lib = expandExport(exported, { exportedAt: "2026-09-22" });
  assert.deepEqual(lib.sets.Radio.variants, { "state=off": {}, "state=on": { p: "Placeholder", i: ["RiCheckLine"] } });
  assert.deepEqual(lib.builtFrom, ["abc1234"]);
  assert.throws(() => expandExport({ ...exported, hash: exported.hash + 1 }, { exportedAt: "x" }), /옮기는 중 응답이 바뀌었다/);
  assert.throws(() => expandExport({ ...exported, namesHash: 1 }, { exportedAt: "x" }), /namesHash/);
  const draft = { ...sets, Radio: { ...sets.Radio, status: "CHANGED" } };
  assert.throws(() => expandExport({ ...exported, sets: draft, hash: fnv(JSON.stringify([styles, draft])) }, { exportedAt: "x" }), /Publish/);
  const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;
  assert.doesNotThrow(() => new AsyncFunction("figma", readFileSync(path.join(here, "export-keys.js"), "utf8")));
});

// builder.js 의 libraryVariant 를 그대로 뽑아 가짜 figma 로 돌린다. 베낀 사본이 아니라 진짜 builder 의 것이다.
function builderLibraryVariant(fakeFigma, chunk) {
  const m = builder.match(/const librarySets = new Map\(\);\nasync function libraryVariant\(full\) \{[\s\S]*?\n\}/);
  assert.ok(m, "builder.js 에서 libraryVariant 를 찾지 못했다. 이름이 바뀌었으면 이 시험도 고친다");
  const report = { librarySets: [] };
  const fn = new Function("figma", "CHUNK", "report", `${m[0]}\nreturn libraryVariant;`)(fakeFigma, chunk, report);
  return { fn, report };
}

test("builder 는 세트를 키로 한 번만 가져오고, 없는 변형이면 멈춘다", async () => {
  const calls = [];
  const set = { name: "Button", children: [{ type: "COMPONENT", name: "variant=fill, tone=brand, controlSize=regular, state=기본", remote: true }] };
  const figma = { importComponentSetByKeyAsync: async (key) => { calls.push(key); return set; } };
  const { fn, report } = builderLibraryVariant(figma, { lib: { Button: "k1" } });
  assert.equal((await fn("Button/variant=fill, tone=brand, controlSize=regular, state=기본")).remote, true);
  await fn("Button/variant=fill, tone=brand, controlSize=regular, state=기본");
  assert.deepEqual(calls, ["k1"], "같은 세트를 두 번 가져온다");
  assert.deepEqual(report.librarySets, ["Button"]);
  await assert.rejects(fn("Button/variant=fill, tone=violet, controlSize=regular, state=기본"), /라이브러리에 없는 변형이다/);
});

test("builder 는 키가 없거나 다른 세트를 가리키거나 가져오지 못하면 멈춘다", async () => {
  const other = { name: "Badge", children: [] };
  await assert.rejects(builderLibraryVariant({ importComponentSetByKeyAsync: async () => other }, { lib: {} }).fn("Button/x=y"), /조각에 라이브러리 키가 없다/);
  await assert.rejects(builderLibraryVariant({ importComponentSetByKeyAsync: async () => other }, { lib: { Button: "k" } }).fn("Button/x=y"), /키가 다른 세트/);
  await assert.rejects(builderLibraryVariant({ importComponentSetByKeyAsync: async () => { throw new Error("not published"); } }, { lib: { Button: "k" } }).fn("Button/x=y"), /라이브러리 세트를 가져오지 못했다/);
});

test("builder 는 화면 파일의 「컴포넌트」 페이지에서 이름으로 찾지 않는다", () => {
  assert.ok(!builder.includes('p.name === "컴포넌트"'), "로컬 카탈로그를 찾는 길이 남아 있다");
  assert.ok(builder.includes("importComponentSetByKeyAsync"), "라이브러리에서 키로 가져오지 않는다");
  // 인스턴스를 확인용과 쓸 것 두 번 만들던 코드는 첫 인스턴스를 페이지에 고아로 남겼다.
  const branch = builder.match(/if \(spec\.inst\) \{[\s\S]*?\n  \}/);
  assert.ok(branch);
  assert.equal(branch[0].match(/createInstance\(\)/g).length, 1, "인스턴스는 한 번만 만든다");
  // 라이브러리 변형의 인스턴스는 absolute 로 나온다. 흐름에 넣지 않으면 부모의 (0,0)에 겹치고 settle 이 건너뛴다
  // (2026-09-22 시험 파일에서 「선택 삭제」·「삭제」·배지가 모두 부모 왼쪽 위에 겹쳤다).
  const append = branch[0].indexOf("parent.appendChild(instance)");
  const reflow = branch[0].indexOf('instance.layoutPositioning = "AUTO"');
  const placed = branch[0].indexOf("place(instance");
  assert.ok(append >= 0 && reflow > append && placed > reflow, "인스턴스를 붙인 뒤 place 전에 흐름(AUTO)에 넣는다");
});

// ── 4. 기본 켜짐 ────────────────────────────────────────────────────────────

test("인스턴스는 기본으로 켜고 --no-instances 만 끈다", () => {
  assert.equal(instancesEnabled([]), true);
  assert.equal(instancesEnabled(["--key", "voc", "--name", "고객의 소리"]), true);
  assert.equal(instancesEnabled(["--instances"]), true, "예전 옵션은 아무 일도 하지 않는다");
  assert.equal(instancesEnabled(["--no-instances"]), false);
  const prepare = readFileSync(path.join(here, "prepare.mjs"), "utf8");
  assert.ok(prepare.includes("const useInstances = instancesEnabled(args);"), "prepare.mjs 가 기본값을 따로 정한다");
  assert.ok(!prepare.includes('args.includes("--instances")'), "옛 기본 꺼짐이 남아 있다");
});

test("인스턴스를 끈 실행과 카탈로그는 inst 표식을 싣지 않는다", () => {
  const tree = { t: "f", nat: "header", k: [{ t: "f", inst: "Button/x", ic: ["RiA"], blank: 1, unsup: { set: "Field", why: "w" } }] };
  stripMarks(tree, { dropInstances: true });
  assert.deepEqual(tree, { t: "f", k: [{ t: "f" }] });
});

// ── 5. notInLibrary ─────────────────────────────────────────────────────────

test("native 덩이에 이름을 붙인다. 컴포넌트 안쪽과 감싸개는 세지 않는다", () => {
  assert.equal(nativeChunk(el("<header></header>")), "header");
  assert.equal(nativeChunk(el('<nav aria-label="카테고리"></nav>')), "nav 카테고리");
  assert.equal(nativeChunk(el('<form role="search"></form>')), "form search");
  assert.equal(nativeChunk(el('<a href="#">1</a>')), "a");
  assert.equal(nativeChunk(el("<div></div>")), null);
  assert.equal(nativeChunk(el("<ul><li>x</li></ul>")), null);
  assert.equal(nativeChunk(el('<div data-slot="field"><a href="#">x</a></div>').querySelector("a")), null);
});

test("notInLibrary 는 잇달아 나오는 같은 덩이를 한 줄로 센다", () => {
  const card = (name) => ({ t: "f", nat: "a", path: `p:${name}`, k: [text(name), { t: "f", inst: "Badge/variant=tonal, tone=neutral, size=small", k: [text("신상", 12)] }] });
  const tree = {
    t: "f",
    k: [
      { t: "f", nat: "header", path: "p:h", k: [{ t: "f", nat: "nav 카테고리", path: "p:n", k: [{ t: "f", nat: "a", k: [text("신발")] }, { t: "f", nat: "a", k: [text("의류")] }] }] },
      { t: "f", k: [card("에어 러너 2"), card("데일리 코트")] },
      { t: "f", inst: "Button/x", nat: "a", k: [] },
    ],
  };
  const rows = collectNotInLibrary(tree);
  assert.deepEqual(rows.map((r) => [r.what, r.in, r.count]), [["header", undefined, 1], ["nav 카테고리", "header", 1], ["a", "nav 카테고리", 2], ["a", undefined, 2]]);
  // 첫 덩이의 글자를 예로 싣는다. 보고가 「상품 카드 ×2 (에어 러너 2 …)」처럼 무엇인지 적게 하려는 것이다.
  assert.equal(rows[3].path, "p:에어 러너 2");
  assert.ok(rows[3].text.startsWith("에어 러너 2"));
});
