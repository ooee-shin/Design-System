import assert from "node:assert/strict";
import test from "node:test";

import { cn } from "./utils.ts";

// `oe` token 으로 만든 클래스는 tailwind-merge 가 모르는 이름이라, 따로 알려 주지 않으면
// `text-` 로 시작하는 것들을 한 무리로 보고 뒤엣것만 남긴다. 글자 크기와 글자 색은 서로 다른
// 것을 정하므로 함께 남아야 한다. Chip 의 고른 상태에서 글자가 13px 에서 16px 로 튀었던 자리다.
test("an oe text size survives an oe text color that comes after it", () => {
  const merged = cn("text-oe-label font-normal", "text-oe-brand-foreground-primary");

  assert.match(merged, /text-oe-label/, "글자 크기가 색에 밀려 사라졌다");
  assert.match(merged, /text-oe-brand-foreground-primary/, "글자 색이 붙지 않았다")
});

// 크기끼리는 여전히 뒤엣것이 이긴다. 위 설정이 크기를 색으로 갈라 두기만 하고 크기 사이의
// 우선순위까지 바꾸지는 않는다.
test("a later text size still wins over an earlier one", () => {
  assert.equal(cn("text-oe-label", "text-sm"), "text-sm");
  assert.equal(cn("text-sm", "text-oe-label"), "text-oe-label");
});

// 색끼리도 뒤엣것이 이긴다.
test("a later text color still wins over an earlier one", () => {
  assert.equal(
    cn("text-oe-foreground-secondary", "text-oe-brand-foreground-primary"),
    "text-oe-brand-foreground-primary",
  );
});
