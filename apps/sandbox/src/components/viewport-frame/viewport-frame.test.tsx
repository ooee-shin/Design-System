import "@/test-setup";

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test, { afterEach } from "node:test";

import React from "react";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { renderToString } from "react-dom/server";

import { SANDBOX_VIEWPORTS, sandboxScreens } from "@/screens";

import { defaultViewport, FRAME_GUTTER, frameSize, FRAME_PARAM, ViewportFrame } from "./viewport-frame";

afterEach(() => {
  cleanup();
  window.history.replaceState({}, "", "/");
});

// DOM 요소가 없음은 이것으로 잰다. `assert.equal(요소, null)` 은 실패하면 두 값을 inspect 해 보이는데, React 가 붙인
// jsdom 노드를 inspect 하면 돌아오지 않아 시험이 붉어지지 않고 멎었다(2026-09-28). 태그 이름만 비교하면 곧바로 붉어진다.
function assertAbsent(element: Element | null, message?: string) {
  assert.equal(element?.tagName ?? null, null, message);
}

// usePathname 은 라우터가 없으면 null 을 돌려준다. 시험은 next/navigation 을 흉내 내지 않고 주소를 prop 으로 준다.
test("검사 뷰포트 「WxH」를 액자 크기로 읽는다", () => {
  assert.deepEqual(frameSize("1024x768"), { width: 1024, height: 768 });
  assert.deepEqual(frameSize("390x844"), { width: 390, height: 844 });
});

test("세 폭 모두 액자로 연다 — 웹도 막대 아래에 화면을 그대로 두지 않는다", () => {
  const screen = sandboxScreens[0];
  // jsdom 의 창은 1024px 라 태블릿 고정 폭 액자(1024 + 여백)가 들어가지 않는다. 넓은 창으로 두고 잰다.
  const wide = window.innerWidth;
  window.innerWidth = 1440;
  try {
    const view = render(
      <ViewportFrame pathname={screen.href}>
        <main>
          <h1>{screen.name}</h1>
        </main>
      </ViewportFrame>,
    );

    // 웹. 막대와 같은 문서에 화면을 두면 막대 높이만큼 dvh 화면이 밀려 잘린다(2026-09-28 에 41px 을 쟀다).
    const web = view.getByTitle(`${screen.name} — 웹`) as HTMLIFrameElement;
    assert.equal(web.getAttribute("src"), `${screen.href}?${FRAME_PARAM}=1`, "웹 액자가 같은 주소를 frame 표식과 함께 열지 않는다");
    assert.ok(web.hasAttribute("data-sandbox-frame"), "액자에 표식이 없다");
    assertAbsent(view.queryByRole("heading", { level: 1 }), "액자를 보이면서 화면도 함께 그렸다");

    fireEvent.click(view.getByRole("button", { name: /태블릿/ }));
    const tablet = view.getByTitle(/태블릿 1024x768/) as HTMLIFrameElement;
    assert.equal(tablet.getAttribute("src"), `${screen.href}?${FRAME_PARAM}=1`);
    assert.equal(tablet.getAttribute("width"), "1024");

    fireEvent.click(view.getByRole("button", { name: /^웹/ }));
    assert.ok(view.getByTitle(`${screen.name} — 웹`), "웹으로 돌아오지 않는다");
  } finally {
    window.innerWidth = wide;
  }
});

test("액자 밖 문서는 창 높이를 넘기지 않는다 — 막대와 액자가 한 칸씩 나눠 갖는다", () => {
  const screen = sandboxScreens[0];
  const view = render(
    <ViewportFrame pathname={screen.href}>
      <main />
    </ViewportFrame>,
  );
  const bar = view.getByRole("toolbar", { name: "보기 폭" });
  const shell = bar.parentElement as HTMLElement;
  assert.match(shell.className, /h-dvh/, "바깥 문서가 창 높이에 맞춰지지 않아 화면이 그만큼 밀린다");
  assert.match(bar.className, /shrink-0/, "막대가 줄어들면 액자 높이가 흔들린다");
  assert.doesNotMatch(bar.className, /sticky/, "막대가 sticky 면 화면 위에 겹쳐 덮는다");
});

test("액자 안에서는 막대 없이 화면만 그린다", () => {
  const screen = sandboxScreens[0];
  window.history.replaceState({}, "", `${screen.href}?${FRAME_PARAM}=1`);
  const view = render(
    <ViewportFrame pathname={screen.href}>
      <main>
        <h1>{screen.name}</h1>
      </main>
    </ViewportFrame>,
  );
  assertAbsent(view.queryByRole("toolbar", { name: "보기 폭" }), "액자 안에 막대가 또 섰다");
  assert.ok(view.getByRole("heading", { level: 1, name: screen.name }), "액자 안에서 화면을 그리지 않는다");
});

test("첫 화면에서는 전환을 그리지 않는다", () => {
  const view = render(
    <ViewportFrame pathname="/">
      <p>목록</p>
    </ViewportFrame>,
  );
  assertAbsent(view.queryByRole("toolbar", { name: "보기 폭" }));
  assert.ok(view.getByText("목록"));
});

test("컴포넌트 보기 막대는 화면과 같은 자리에 선다", () => {
  // 액자 밖에 두면 액자만 보여 늘 0 개로 센다. 루트 layout 이 ViewportFrame 안에 두어야 액자 안의 막대가 센다.
  const here = path.dirname(fileURLToPath(import.meta.url));
  const layout = readFileSync(path.join(here, "..", "..", "app", "layout.tsx"), "utf8");
  const inside = layout.match(/<ViewportFrame>([\s\S]*?)<\/ViewportFrame>/);
  assert.ok(inside, "layout 이 ViewportFrame 으로 감싸지 않는다");
  assert.match(inside[1], /<ComponentInspector \/>/, "컴포넌트 보기 막대가 액자 밖에 있다");
});

// 요청이 고른 폭 가운데 가장 넓은 것으로 처음 선다. 전에는 늘 웹으로 열려 모바일만 고른 화면이 넓은 폭으로 먼저 보였다(2026-09-28).
test("처음 서는 폭은 요청이 고른 폭 가운데 가장 넓은 것 — 모바일만 고른 화면은 모바일, 웹을 고른 화면은 웹, 목록에 없는 주소는 웹", () => {
  const mobileOnly = sandboxScreens.find((item) => item.viewports.length === 1 && item.viewports[0] === "mobile");
  const withWeb = sandboxScreens.find((item) => item.viewports.includes("web"));
  const mixed = sandboxScreens.find((item) => !item.viewports.includes("web") && item.viewports.includes("tablet") && item.viewports.includes("mobile"));
  assert.ok(mobileOnly && withWeb, "목록에 모바일만 고른 화면과 웹을 고른 화면이 하나씩은 있어야 시험이 뜻을 갖는다");
  assert.equal(defaultViewport(mobileOnly.href), "mobile");
  assert.equal(defaultViewport(withWeb.href), "web");
  if (mixed) assert.equal(defaultViewport(mixed.href), "tablet", "웹이 없으면 태블릿이 모바일보다 넓다");
  assert.equal(defaultViewport("/없는-화면"), "web");
  assert.equal(defaultViewport(null), "web");
});

test("모바일만 고른 화면은 모바일 액자(390)로 열리고, 웹 화면으로 옮기면 웹으로 다시 선다", () => {
  const mobileOnly = sandboxScreens.find((item) => item.viewports.length === 1 && item.viewports[0] === "mobile");
  const withWeb = sandboxScreens.find((item) => item.viewports.includes("web"));
  assert.ok(mobileOnly && withWeb);
  const view = render(
    <ViewportFrame pathname={mobileOnly.href}>
      <main>
        <h1>{mobileOnly.name}</h1>
      </main>
    </ViewportFrame>,
  );
  const frame = view.getByTitle(/모바일 390x844/) as HTMLIFrameElement;
  assert.equal(frame.getAttribute("src"), `${mobileOnly.href}?${FRAME_PARAM}=1`, "모바일 액자가 같은 주소를 열지 않는다");
  assert.equal(frame.getAttribute("width"), "390");
  assert.equal(view.getByRole("button", { name: /모바일/ }).getAttribute("aria-pressed"), "true", "모바일 단추가 눌린 상태가 아니다");
  assertAbsent(view.queryByRole("heading", { level: 1 }), "액자를 보이면서 화면도 함께 그렸다");

  view.rerender(
    <ViewportFrame pathname={withWeb.href}>
      <main>
        <h1>{withWeb.name}</h1>
      </main>
    </ViewportFrame>,
  );
  const web = view.getByTitle(`${withWeb.name} — 웹`) as HTMLIFrameElement;
  assert.equal(web.getAttribute("src"), `${withWeb.href}?${FRAME_PARAM}=1`, "웹 화면으로 옮겼는데 웹 액자로 서지 않는다");
  assert.equal(web.getAttribute("width"), null, "웹 액자에 고정 폭이 붙었다");
  assert.equal(view.getByRole("button", { name: /^웹/ }).getAttribute("aria-pressed"), "true");
});

// 실제 폰(과 좁게 줄인 창)에서는 창이 고정 폭 액자보다 좁다. 그 안에 고정 폭 액자를 세우면 화면이 더 좁아지고 옆으로 넘친다.
test("창이 액자보다 좁으면 웹과 같은 전체 폭 액자를 쓰고 까닭을 보인다 — 넓어지면 고정 폭 액자로 돌아온다", () => {
  const mobileOnly = sandboxScreens.find((item) => item.viewports.length === 1 && item.viewports[0] === "mobile");
  assert.ok(mobileOnly);
  const wide = window.innerWidth;
  try {
    window.innerWidth = 390;
    const view = render(
      <ViewportFrame pathname={mobileOnly.href}>
        <main>
          <h1>{mobileOnly.name}</h1>
        </main>
      </ViewportFrame>,
    );
    assertAbsent(view.queryByTitle(/모바일 390x844/), "좁은 창에서 고정 폭 액자를 열었다");
    const full = view.getByTitle(`${mobileOnly.name} — 모바일 (창 폭)`) as HTMLIFrameElement;
    assert.equal(full.getAttribute("src"), `${mobileOnly.href}?${FRAME_PARAM}=1`, "전체 폭 액자가 같은 주소를 열지 않는다");
    assert.equal(full.getAttribute("width"), null, "전체 폭 액자에 고정 폭이 붙었다");
    assert.match(full.className, /w-full/, "전체 폭 액자가 창 폭을 채우지 않는다");
    assertAbsent(view.queryByRole("heading", { level: 1 }), "액자를 보이면서 화면도 함께 그렸다");
    assert.equal(view.getByRole("button", { name: /모바일/ }).getAttribute("aria-pressed"), "true", "고른 폭은 그대로 모바일이어야 한다");
    assert.ok(view.getByText("창이 모바일 액자보다 좁아 창 폭으로 보인다"), "까닭을 보이지 않는다");

    // 경계 — 창이 「액자 폭 + 여백」 과 같으면 「보다 넓지 않으면」 이라 아직 전체 폭이다(문서의 규칙과 코드의 `>` 를 고정한다).
    window.innerWidth = 390 + FRAME_GUTTER;
    fireEvent(window, new Event("resize"));
    assertAbsent(view.queryByTitle(/모바일 390x844/), "창이 액자 폭 + 여백과 같은데 고정 폭 액자를 열었다");
    assert.ok(view.getByTitle(`${mobileOnly.name} — 모바일 (창 폭)`), "경계에서 전체 폭 액자가 아니다");

    window.innerWidth = 390 + FRAME_GUTTER + 1;
    fireEvent(window, new Event("resize"));
    const fixed = view.getByTitle(/모바일 390x844/) as HTMLIFrameElement;
    assert.equal(fixed.getAttribute("width"), "390", "창이 넓어졌는데 고정 폭 액자로 돌아오지 않는다");
    assertAbsent(view.queryByText(/창 폭으로 보인다/), "넓어졌는데 까닭이 남아 있다");
  } finally {
    window.innerWidth = wide;
  }
});

// 첫 그림(서버 HTML)부터 기본 폭 단추가 눌려 있어야 하이드레이션 뒤에 웹에서 모바일로 튀지 않는다. 액자는 mounted 뒤에만 건다.
test("서버 첫 그림은 기본 폭 단추가 눌린 막대와 빈 자리만 그린다 — 액자는 없다", () => {
  const mobileOnly = sandboxScreens.find((item) => item.viewports.length === 1 && item.viewports[0] === "mobile");
  assert.ok(mobileOnly);
  const html = renderToString(
    <ViewportFrame pathname={mobileOnly.href}>
      <main>
        <h1>{mobileOnly.name}</h1>
      </main>
    </ViewportFrame>,
  );
  assert.equal((html.match(/aria-pressed="true"/g) ?? []).length, 1, "눌린 단추가 하나여야 한다");
  assert.match(html, /aria-pressed="true"[^>]*>모바일/, "서버 첫 그림에서 눌린 단추가 모바일이 아니다");
  assert.equal(html.includes("<iframe"), false, "서버 첫 그림에 액자를 그렸다");
});

// `h-fit`(`height: fit-content`) 을 붙였더니 iframe 이 `height` 속성을 버리고 기본 내재 높이 150px 으로 내려앉아
// 태블릿·모바일 화면이 150px 짜리 띠로만 보였다(2026-09-28). 높이는 `height` 속성만 갖는다.
test("고정 폭 액자는 폭과 높이를 속성으로 갖고, 높이를 덮어쓰는 class 를 붙이지 않는다", () => {
  const byViewport = new Map(SANDBOX_VIEWPORTS.map((item) => [item.id, item]));
  const wide = window.innerWidth;
  window.innerWidth = 1920;
  try {
    for (const id of ["tablet", "mobile"] as const) {
      const screen = sandboxScreens.find((item) => defaultViewport(item.href) === id);
      const spec = byViewport.get(id);
      assert.ok(screen, `기본 폭이 ${id} 인 화면이 목록에 있어야 이 시험이 뜻을 갖는다`);
      assert.ok(spec);
      const size = frameSize(spec.inspect);
      const view = render(
        <ViewportFrame pathname={screen.href}>
          <main>
            <h1>{screen.name}</h1>
          </main>
        </ViewportFrame>,
      );
      const frame = view.container.querySelector("iframe[data-sandbox-frame]");
      assert.ok(frame, `${id} 액자를 찾지 못했다`);
      assert.equal(frame.getAttribute("width"), String(size.width));
      assert.equal(frame.getAttribute("height"), String(size.height), `${id} 액자에 높이 속성이 없다`);
      for (const cls of frame.className.split(/\s+/)) {
        assert.ok(!/^h-|^max-h-|^min-h-/.test(cls), `높이를 정하는 class 「${cls}」 가 붙어 height 속성을 덮어쓴다`);
      }
      cleanup();
    }
  } finally {
    window.innerWidth = wide;
  }
});
