import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { join } from "node:path";

// `/screens/*` 는 제품 화면 자체를 구현하는 자리다. 카탈로그 화면과 달리 Studio 의 문서형
// 레이아웃을 따르지 않으므로, 그 경계가 흐려지지 않게 세 가지를 고정한다.

const SCREENS = ["admin", "sto", "sv"] as const;

const read = (path: string) => readFileSync(join(process.cwd(), path), "utf8");

test("세 테스트 경로가 모두 있다", () => {
  for (const screen of SCREENS) {
    const path = `apps/studio/src/app/screens/${screen}/page.tsx`;
    assert.ok(existsSync(join(process.cwd(), path)), `${path} 가 없다`);
  }
});

// 카탈로그 화면은 `max-w-6xl` 프레임과 공통 여백을 공유하지만 제품 화면은 그러면 안 된다.
// 관리자는 뷰포트를 전부 쓰고 앱은 기기 폭 상자 안에 선다.
test("제품 화면은 카탈로그의 프레임을 쓰지 않는다", () => {
  for (const screen of SCREENS) {
    const source = read(`apps/studio/src/app/screens/${screen}/page.tsx`);
    assert.doesNotMatch(source, /max-w-6xl/, `${screen} 이 카탈로그 프레임을 쓰고 있다`);
  }
});

// Studio 내비게이션을 얹으면 풀 화면이 풀 화면이 아니게 된다. 대신 각 화면이 돌아가는 링크를
// 스스로 갖는다.
test("Studio 내비게이션은 제품 화면에서 물러난다", () => {
  const navigation = read("apps/studio/src/components/studio-navigation.tsx");
  assert.match(navigation, /\/screens/);

  for (const screen of SCREENS) {
    const source = read(`apps/studio/src/app/screens/${screen}/page.tsx`);
    assert.match(source, /ScreenExitLink/, `${screen} 에 Studio 로 돌아가는 링크가 없다`);
  }
});

// 두 앱 화면이 같은 기기 상자를 쓴다. 화면마다 폭을 따로 적으면 한쪽만 고쳤을 때 두 화면의
// 기준이 갈린다.
test("앱 화면은 공용 기기 상자를 함께 쓴다", () => {
  for (const screen of ["sto", "sv"] as const) {
    const source = read(`apps/studio/src/app/screens/${screen}/page.tsx`);
    assert.match(source, /PhoneFrame/, `${screen} 이 공용 기기 상자를 쓰지 않는다`);
    assert.doesNotMatch(source, /w-\[3\d\dpx\]/, `${screen} 이 기기 폭을 직접 적고 있다`);
  }
});

// 규칙의 적용 범위가 코드에만 있고 문서에 없으면 다음 작업자가 카탈로그 화면에도 같은 예외를
// 만들게 된다.
test("studio.md 가 예외의 범위를 경로로 적는다", () => {
  const studio = read("docs/system/studio.md");
  assert.match(studio, /\/screens/);
});
