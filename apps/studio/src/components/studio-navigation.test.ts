import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

// 상단 메뉴와 Home 카드의 주소는 손으로 적는다. 페이지를 옮기면 링크만 옛 주소에 남는다 — 메뉴의 llms.txt 가
// 페이지가 없는 `/llms` 를 가리킨 채 배포본에서 404 였다. 정적 내보내기라 없는 주소는 배포본에서 404 다.
const read = (path: string) => readFileSync(join(process.cwd(), path), "utf8");
const app = join(process.cwd(), "apps/studio/src/app");

/** `{ href: "/x", label: "이름" }` 모양의 메뉴 항목. */
function menu() {
  return [...read("apps/studio/src/components/studio-navigation.tsx").matchAll(/\{\s*href:\s*"([^"]+)",\s*label:\s*"([^"]+)"/g)].map(([, href, label]) => ({ href, label }));
}

/** 주소 하나에 정적 페이지가 있는지. 동적 조각이 없는 메뉴 주소만 다룬다. */
const hasPage = (href: string) => existsSync(join(app, href === "/" ? "" : href.slice(1), "page.tsx"));

test("상단 메뉴의 llms.txt 는 뷰어 /llms-txt 를 가리킨다", () => {
  assert.deepEqual(
    menu().filter(({ label }) => label === "llms.txt").map(({ href }) => href),
    ["/llms-txt"],
  );
});

test("상단 메뉴와 Home 카드의 주소마다 페이지가 있다", () => {
  const destinations = menu();
  assert.ok(destinations.length >= 5, `메뉴 항목을 ${destinations.length}개만 읽었다. 메뉴 모양이 바뀌었으면 이 시험의 읽는 법을 고친다`);
  const cards = [...read("apps/studio/src/app/page.tsx").matchAll(/href:\s*"(\/[^"]*)"/g)].map(([, href]) => href);
  assert.ok(cards.includes("/llms-txt"), "Home 카드에 llms.txt 가 없다");

  const missing = [...destinations.map(({ href }) => href), ...cards].filter((href) => !hasPage(href));
  assert.deepEqual(missing, [], `페이지가 없는 주소를 가리킨다: ${missing.join(", ")}`);
});
