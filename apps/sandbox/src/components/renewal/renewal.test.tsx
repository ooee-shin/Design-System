import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import test from "node:test";
import { join } from "node:path";

import { screenRoots } from "./screen-registry";

// `/renewal/*`(블루키 리뉴얼)는 제품 화면 자체를 구현하는 자리다. 2026-09-23 에 Studio 의 `/screens` 에서
// 옮겨 왔다. 규칙은 같은 폴더의 README.md 가 갖고, 그 경계가 흐려지지 않게 여기서 고정한다.
// sandbox 의 테스트는 `apps/sandbox` 에서 돌므로 경로는 그 자리 기준이다.

const SCREENS = ["admin", "sto", "sv"] as const;
const APPS = ["sto", "sv"] as const;

const read = (path: string) => readFileSync(join(process.cwd(), path), "utf8");

/** 루트의 목록 화면을 뺀, 개별 제품 화면의 `page.tsx` 경로다. 화면이 늘어도 규칙이 따라붙는다. */
const screenPagePaths = () => {
  const base = "src/app/(renewal)/renewal";
  return SCREENS.flatMap((screen) =>
    readdirSync(join(process.cwd(), base, screen), { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => `${base}/${screen}/${entry.name}/page.tsx`),
  );
};

test("세 테스트 경로가 모두 있다", () => {
  for (const screen of SCREENS) {
    const path = `src/app/(renewal)/renewal/${screen}/page.tsx`;
    assert.ok(existsSync(join(process.cwd(), path)), `${path} 가 없다`);
  }
});

// 세 목록은 화면 아래 탭으로 이어져 있다. 목록을 고르는 화면을 한 겹 더 두면 같은 선택을 두 번
// 하게 되므로 `/renewal` 은 첫 목록으로 보낸다.
test("세 목록은 탭으로 이어지고 /renewal 은 첫 목록으로 보낸다", () => {
  const index = read("src/app/(renewal)/renewal/page.tsx");
  assert.match(index, /redirect/);

  const list = read("src/components/renewal/screen-work-list.tsx");
  assert.match(list, /ScreenRootTabs/, "작업 목록이 전환 탭을 그리지 않는다");

  // 공용 BottomNavigation 은 모바일 제품 화면의 최상위 이동만 맡기로 정해져 있다. 작업장의
  // 전환 장치로 쓰면 그 규칙을 어긴다.
  const tabs = read("src/components/renewal/screen-root-tabs.tsx");
  assert.doesNotMatch(tabs, /from "@ooee\/ui"/, "작업장 전환 탭이 제품 컴포넌트를 끌어다 쓰고 있다");
});

// 루트로 들어오면 완성된 앱이 아니라 작업 목록을 만난다. 화면끼리 이어지는 데모가 아니므로,
// 무엇을 만들 예정이고 어디까지 왔는지를 먼저 보여 주지 않으면 덜 만들어진 화면이 고장난 것으로
// 읽힌다.
test("각 루트의 첫 화면은 작업 목록이다", () => {
  for (const screen of SCREENS) {
    const source = read(`src/app/(renewal)/renewal/${screen}/page.tsx`);
    assert.match(source, /ScreenWorkList/, `${screen} 루트가 작업 목록을 보여 주지 않는다`);
  }
});

// 아직 만들지 않은 화면은 링크가 아니라 `예정`으로 둔다. 눌러서 빈 화면을 만나는 것보다 목록에서
// 아직 없다는 것을 읽는 편이 낫다.
test("목록의 href 는 실제로 있는 화면만 가리킨다", () => {
  for (const root of screenRoots) {
    for (const item of root.items) {
      if (!item.href) continue;
      const path = `src/app/(renewal)${item.href}/page.tsx`;
      assert.ok(existsSync(join(process.cwd(), path)), `${item.href} 가 목록에 있으나 ${path} 가 없다`);
    }
  }
});

// 범위는 사용자가 준 문구만 적는다. 빈 문자열은 「범위가 없다」와 「아직 정하지 않았다」를 구분하지
// 못하므로 아예 두지 않는다.
test("목록의 범위 문구는 비어 있지 않거나 아예 없다", () => {
  for (const root of screenRoots) {
    assert.ok(root.items.length > 0, `${root.key} 에 작업 항목이 없다`);
    for (const item of root.items) {
      if (item.scope === undefined) continue;
      assert.ok(item.scope.length > 0, `${root.key}/${item.key} 의 범위가 빈 문자열이다`);
    }
  }
});

// 카탈로그 화면은 `max-w-6xl` 프레임과 공통 여백을 공유하지만 제품 화면은 그러면 안 된다.
// 관리자는 뷰포트를 전부 쓰고 앱은 기기 폭 상자 안에 선다.
test("제품 화면은 카탈로그의 프레임을 쓰지 않는다", () => {
  for (const screen of SCREENS) {
    const source = read(`src/app/(renewal)/renewal/${screen}/test/page.tsx`);
    assert.doesNotMatch(source, /max-w-6xl/, `${screen} 이 카탈로그 프레임을 쓰고 있다`);
  }
});

// 돌아가는 링크를 화면 위에 고정해 두지 않는다. 링크가 실제 화면 요소를 가려서 무엇을 보고 있는지
// 확인하는 일을 방해하기 때문이며, 이는 뷰포트를 다 쓰는 관리자 화면과 모바일 뷰가 가운데 서는 앱
// 화면이 다르지 않다. 돌아가는 길은 브라우저 뒤로 가기가 갖는다.
test("제품 화면 위에 돌아가는 링크를 고정하지 않는다", () => {
  for (const path of screenPagePaths()) {
    const source = read(path);
    assert.doesNotMatch(source, /ScreenExitLink/, `${path} 이 화면을 가리는 고정 링크를 두고 있다`);
  }

  const chrome = read("src/components/renewal/screen-chrome.tsx");
  assert.doesNotMatch(chrome, /ScreenExitLink/, "쓰지 않는 ScreenExitLink 가 공용 부품에 남아 있다");
});

// 두 앱 화면이 같은 모바일 뷰를 쓴다. 화면마다 폭을 따로 적으면 한쪽만 고쳤을 때 두 화면의
// 기준이 갈린다.
test("앱 화면은 공용 모바일 뷰를 함께 쓴다", () => {
  for (const screen of APPS) {
    const source = read(`src/app/(renewal)/renewal/${screen}/test/page.tsx`);
    assert.match(source, /MobileWebView/, `${screen} 이 공용 모바일 뷰를 쓰지 않는다`);
    assert.doesNotMatch(source, /max-w-\[\d+px\]/, `${screen} 이 폭을 직접 적고 있다`);
  }
});

// 기기 모형이 아니라 실제 페이지다. 둥근 모서리와 그림자로 상자를 만들면 웹에서 앱에 접근했을 때의
// 모습과 달라진다. 높이도 고정하지 않고 창 높이를 쓴다.
test("모바일 뷰는 기기 상자로 그리지 않는다", () => {
  const chrome = read("src/components/renewal/screen-chrome.tsx");
  const view = chrome.slice(chrome.indexOf("export function MobileWebView"));

  assert.doesNotMatch(view, /rounded-\[/, "모바일 뷰에 기기 모서리가 있다");
  assert.doesNotMatch(view, /shadow-/, "모바일 뷰에 그림자가 있다");
  assert.doesNotMatch(view, /h-\[\d+px\]/, "모바일 뷰의 높이가 고정되어 있다");
  assert.match(view, /min-h-dvh/, "모바일 뷰가 창 높이를 쓰지 않는다");
});

// 위아래에 무엇이 서는지, Bottom Navigation을 쓰는지가 아직 정해지지 않았다. 자리를 미리 채우면
// 그것이 결정처럼 굳는다.
test("앱 화면은 아직 정하지 않은 구성을 미리 채우지 않는다", () => {
  for (const screen of APPS) {
    const source = read(`src/app/(renewal)/renewal/${screen}/test/page.tsx`);
    assert.doesNotMatch(source, /BottomNavigation/, `${screen} 이 정해지지 않은 Bottom Navigation을 두고 있다`);
    assert.doesNotMatch(source, /AppHeader/, `${screen} 이 정해지지 않은 상단 줄을 두고 있다`);
  }
});

// 규칙이 코드에만 있고 글로 없으면 다음 작업자가 생성 화면에도 같은 예외를 만들게 된다.
test("README 가 작업장의 범위와 규칙을 적는다", () => {
  const readme = read("src/components/renewal/README.md");
  assert.match(readme, /\/renewal/);
  assert.match(readme, /MobileWebView/);
});

// Studio 는 이제 제품 화면을 갖지 않는다. 옮긴 뒤 메뉴가 없는 주소를 가리키면 배포본에서 404 다.
test("Studio 메뉴와 studio.md 에 옮긴 작업장이 남지 않았다", () => {
  assert.doesNotMatch(read("../studio/src/components/studio-navigation.tsx"), /\/screens/);
  assert.doesNotMatch(read("../../docs/system/studio.md"), /\/screens/);
});
