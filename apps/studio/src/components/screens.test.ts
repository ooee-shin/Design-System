import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { join } from "node:path";

import { screenRoots } from "./screens/screen-registry";

// `/screens/*` 는 제품 화면 자체를 구현하는 자리다. 카탈로그 화면과 달리 Studio 의 문서형
// 레이아웃을 따르지 않으므로, 그 경계가 흐려지지 않게 세 가지를 고정한다.

const SCREENS = ["admin", "sto", "sv"] as const;
const APPS = ["sto", "sv"] as const;

const read = (path: string) => readFileSync(join(process.cwd(), path), "utf8");

test("세 테스트 경로가 모두 있다", () => {
  for (const screen of SCREENS) {
    const path = `apps/studio/src/app/screens/${screen}/page.tsx`;
    assert.ok(existsSync(join(process.cwd(), path)), `${path} 가 없다`);
  }
});

// 세 목록은 화면 아래 탭으로 이어져 있다. 목록을 고르는 화면을 한 겹 더 두면 같은 선택을 두 번
// 하게 되므로 `/screens` 는 첫 목록으로 보낸다.
test("세 목록은 탭으로 이어지고 /screens 는 첫 목록으로 보낸다", () => {
  const index = read("apps/studio/src/app/screens/page.tsx");
  assert.match(index, /redirect/);

  const list = read("apps/studio/src/components/screens/screen-work-list.tsx");
  assert.match(list, /ScreenRootTabs/, "작업 목록이 전환 탭을 그리지 않는다");

  // 공용 BottomNavigation 은 모바일 제품 화면의 최상위 이동만 맡기로 정해져 있다. Studio 쪽
  // 작업장의 전환 장치로 쓰면 그 규칙을 어긴다.
  const tabs = read("apps/studio/src/components/screens/screen-root-tabs.tsx");
  assert.doesNotMatch(tabs, /from "@ooee\/ui"/, "Studio 전환 탭이 제품 컴포넌트를 끌어다 쓰고 있다");
});

// 루트로 들어오면 완성된 앱이 아니라 작업 목록을 만난다. 화면끼리 이어지는 데모가 아니므로,
// 무엇을 만들 예정이고 어디까지 왔는지를 먼저 보여 주지 않으면 덜 만들어진 화면이 고장난 것으로
// 읽힌다.
test("각 루트의 첫 화면은 작업 목록이다", () => {
  for (const screen of SCREENS) {
    const source = read(`apps/studio/src/app/screens/${screen}/page.tsx`);
    assert.match(source, /ScreenWorkList/, `${screen} 루트가 작업 목록을 보여 주지 않는다`);
  }
});

// 아직 만들지 않은 화면은 링크가 아니라 `예정`으로 둔다. 눌러서 빈 화면을 만나는 것보다 목록에서
// 아직 없다는 것을 읽는 편이 낫다.
test("목록의 href 는 실제로 있는 화면만 가리킨다", () => {
  for (const root of screenRoots) {
    for (const item of root.items) {
      if (!item.href) continue;
      const path = `apps/studio/src/app${item.href}/page.tsx`;
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
    const source = read(`apps/studio/src/app/screens/${screen}/test/page.tsx`);
    assert.doesNotMatch(source, /max-w-6xl/, `${screen} 이 카탈로그 프레임을 쓰고 있다`);
  }
});

// Studio 내비게이션을 얹으면 풀 화면이 풀 화면이 아니게 된다. 대신 앱 화면이 돌아가는 링크를
// 스스로 갖는다.
//
// 관리자는 예외다. 뷰포트를 전부 쓰는 화면이라 바닥에 고정된 링크가 실제 화면 요소를 가려서,
// 무엇을 보고 있는지 확인하는 일을 방해한다. 앱 화면은 모바일 뷰가 가운데에 서고 좌우가 비므로
// 링크가 그 빈 자리에 놓인다.
test("Studio 내비게이션은 제품 화면에서 물러난다", () => {
  const navigation = read("apps/studio/src/components/studio-navigation.tsx");
  assert.match(navigation, /\/screens/);

  for (const screen of APPS) {
    const source = read(`apps/studio/src/app/screens/${screen}/test/page.tsx`);
    assert.match(source, /ScreenExitLink/, `${screen} 에 Studio 로 돌아가는 링크가 없다`);
  }

  for (const path of ["admin/layout", "admin/test", "admin/login"]) {
    const source = read(`apps/studio/src/app/screens/${path}/page.tsx`);
    assert.doesNotMatch(source, /ScreenExitLink/, `${path} 이 화면을 가리는 고정 링크를 두고 있다`);
  }
});

// 두 앱 화면이 같은 모바일 뷰를 쓴다. 화면마다 폭을 따로 적으면 한쪽만 고쳤을 때 두 화면의
// 기준이 갈린다.
test("앱 화면은 공용 모바일 뷰를 함께 쓴다", () => {
  for (const screen of APPS) {
    const source = read(`apps/studio/src/app/screens/${screen}/test/page.tsx`);
    assert.match(source, /MobileWebView/, `${screen} 이 공용 모바일 뷰를 쓰지 않는다`);
    assert.doesNotMatch(source, /max-w-\[\d+px\]/, `${screen} 이 폭을 직접 적고 있다`);
  }
});

// 기기 모형이 아니라 실제 페이지다. 둥근 모서리와 그림자로 상자를 만들면 웹에서 앱에 접근했을 때의
// 모습과 달라진다. 높이도 고정하지 않고 창 높이를 쓴다.
test("모바일 뷰는 기기 상자로 그리지 않는다", () => {
  const chrome = read("apps/studio/src/components/screens/screen-chrome.tsx");
  const view = chrome.slice(chrome.indexOf("export function MobileWebView"));

  assert.doesNotMatch(view, /rounded-\[/, "모바일 뷰에 기기 모서리가 있다");
  assert.doesNotMatch(view, /shadow-/, "모바일 뷰에 그림자가 있다");
  assert.doesNotMatch(view, /h-\[\d+px\]/, "모바일 뷰의 높이가 고정되어 있다");
  assert.match(view, /min-h-dvh/, "모바일 뷰가 창 높이를 쓰지 않는다");
});

// 위아래에 무엇이 서는지, 하단 내비게이션을 쓰는지가 아직 정해지지 않았다. 자리를 미리 채우면
// 그것이 결정처럼 굳는다.
test("앱 화면은 아직 정하지 않은 구성을 미리 채우지 않는다", () => {
  for (const screen of APPS) {
    const source = read(`apps/studio/src/app/screens/${screen}/test/page.tsx`);
    assert.doesNotMatch(source, /BottomNavigation/, `${screen} 이 정해지지 않은 하단 내비게이션을 두고 있다`);
    assert.doesNotMatch(source, /AppHeader/, `${screen} 이 정해지지 않은 상단 줄을 두고 있다`);
  }
});

// 규칙의 적용 범위가 코드에만 있고 문서에 없으면 다음 작업자가 카탈로그 화면에도 같은 예외를
// 만들게 된다.
test("studio.md 가 예외의 범위를 경로로 적는다", () => {
  const studio = read("docs/system/studio.md");
  assert.match(studio, /\/screens/);
});
