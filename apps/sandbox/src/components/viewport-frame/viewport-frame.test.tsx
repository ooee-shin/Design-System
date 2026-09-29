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

import { defaultViewport, FRAME_GUTTER, frameSize, FRAME_PARAM, inFrameNow, TOOLBAR_LABEL, ViewportFrame } from "./viewport-frame";

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
  const bar = view.getByRole("toolbar", { name: TOOLBAR_LABEL });
  const shell = bar.parentElement as HTMLElement;
  assert.match(shell.className, /h-dvh/, "바깥 문서가 창 높이에 맞춰지지 않아 화면이 그만큼 밀린다");
  assert.match(bar.className, /shrink-0/, "막대가 줄어들면 액자 높이가 흔들린다");
  assert.doesNotMatch(bar.className, /sticky/, "막대가 sticky 면 화면 위에 겹쳐 덮는다");
});

test("액자 안에서는 막대도 도구 단추도 없이 화면만 그린다", () => {
  const screen = sandboxScreens[0];
  window.history.replaceState({}, "", `${screen.href}?${FRAME_PARAM}=1`);
  const view = render(
    <ViewportFrame pathname={screen.href} tools={<button type="button">요청 보기</button>}>
      <main>
        <h1>{screen.name}</h1>
      </main>
    </ViewportFrame>,
  );
  assertAbsent(view.queryByRole("toolbar", { name: TOOLBAR_LABEL }), "액자 안에 막대가 또 섰다");
  assertAbsent(view.queryByRole("button", { name: "요청 보기" }), "액자 안에 도구 단추가 또 섰다");
  assert.ok(view.getByRole("heading", { level: 1, name: screen.name }), "액자 안에서 화면을 그리지 않는다");
});

test("첫 화면에서는 전환을 그리지 않는다", () => {
  const view = render(
    <ViewportFrame pathname="/">
      <p>목록</p>
    </ViewportFrame>,
  );
  assertAbsent(view.queryByRole("toolbar", { name: TOOLBAR_LABEL }));
  assert.ok(view.getByText("목록"));
});

// 「요청 보기 · 컴포넌트 보기」 단추는 화면 아래 알약 막대가 아니라 맨 위 막대의 왼쪽에 선다(2026-09-29 개발자).
// 세는 일만 액자 안 문서를 보므로(component-inspector 의 `useFrameDocument`) 밖에 두어도 0 개로 세지 않는다.
test("도구 단추는 맨 위 막대의 맨 왼쪽에 서고 「표시는 요청이 고른 폭」 은 오른쪽 끝에 남는다", () => {
  const screen = sandboxScreens[0];
  const view = render(
    <ViewportFrame pathname={screen.href} tools={<button type="button">요청 보기</button>}>
      <main />
    </ViewportFrame>,
  );
  const bar = view.getByRole("toolbar", { name: TOOLBAR_LABEL });
  const tool = view.getByRole("button", { name: "요청 보기" });
  // 노드 둘이 같은지는 boolean 으로 잰다. `assert.equal(노드, 노드)` 로 재면 어긋날 때 jsdom 노드 둘을
  // inspect 하다 멎어 78초 뒤 SIGKILL 이 났고 단정 메시지가 한 줄도 찍히지 않았다(2026-09-29 확인자).
  // 위 `assertAbsent` 가 적어 둔 함정과 같은 것이다 — 이 파일에서는 노드를 inspect 하게 두지 않는다.
  assert.ok(bar.firstElementChild === tool, "도구 단추가 막대의 맨 앞이 아니다");
  assert.ok(bar.textContent?.startsWith("요청 보기보기 폭"), `막대 순서가 「도구 · 보기 폭 …」 이 아니다: ${bar.textContent}`);

  const note = view.getByText("• 표시는 요청이 고른 폭");
  assert.ok(bar.lastElementChild === note, "「표시는 요청이 고른 폭」 이 막대의 끝이 아니다");
  assert.match(note.className, /ml-auto/, "그 글이 오른쪽 끝으로 밀리지 않는다");
});

// 막대가 폭과 상관없는 단추(요청 보기·컴포넌트 보기)까지 담으므로 이름은 담은 것을 다 덮어야 한다 —
// 「보기 폭」 이라는 이름이면 낭독기가 도구 단추도 폭 단추처럼 읽었다(2026-09-29 확인자).
// 폭 단추를 `role="group"` 껍데기로 따로 묶는 길은 버렸다 — 껍데기가 통째로 줄을 넘어가 390px 창에서
// 막대가 73px → 93px 로 자랐다(그만큼 액자가 줄었다). 그래서 폭 단추는 막대의 바로 밑 자식으로 남는다.
test("막대 이름은 담은 단추를 다 덮고 폭 단추는 껍데기 없이 「보기 폭」 글 뒤에 선다", () => {
  const screen = sandboxScreens[0];
  const view = render(
    <ViewportFrame pathname={screen.href} tools={<button type="button">요청 보기</button>}>
      <main />
    </ViewportFrame>,
  );
  assertAbsent(view.queryByRole("toolbar", { name: "보기 폭" }), "폭과 상관없는 도구 단추가 「보기 폭」 도구 모음 안에 든다");
  const bar = view.getByRole("toolbar", { name: TOOLBAR_LABEL });
  assert.ok(bar.contains(view.getByRole("button", { name: "요청 보기" })), "도구 단추가 그 막대 안에 없다");

  // 폭 단추는 막대의 바로 밑 자식이다. 껍데기에 들어가면 좁은 창에서 줄이 하나 늘어 액자가 줄어든다.
  const label = view.getByText("보기 폭");
  assert.ok(bar.contains(label), "「보기 폭」 글이 막대 안에 없다");
  const kids = [...bar.children];
  const widths = SANDBOX_VIEWPORTS.map((item) => view.getByRole("button", { name: new RegExp(`^${item.name}`) }));
  for (const [index, button] of widths.entries()) {
    assert.ok(kids.includes(button), `${SANDBOX_VIEWPORTS[index].name} 폭 단추가 막대의 바로 밑 자식이 아니다 — 껍데기에 들었다`);
    assert.ok(kids.indexOf(button) > kids.indexOf(label), `${SANDBOX_VIEWPORTS[index].name} 폭 단추가 「보기 폭」 글보다 앞에 섰다`);
  }
});

test("루트 layout 은 인스펙터를 막대의 도구 자리로 넘긴다 — 액자 안 자식 자리에 두지 않는다", () => {
  // 액자 안 자식 자리에 두면 단추가 화면 위에 겹쳐 뜬다. 막대의 `tools` 로 넘겨야 맨 위 왼쪽에 선다.
  const here = path.dirname(fileURLToPath(import.meta.url));
  const layout = readFileSync(path.join(here, "..", "..", "app", "layout.tsx"), "utf8");
  assert.match(layout, /<ViewportFrame tools=\{<ComponentInspector \/>\}>/, "layout 이 인스펙터를 도구 자리로 넘기지 않는다");
  const inside = layout.match(/<ViewportFrame[^>]*>([\s\S]*?)<\/ViewportFrame>/);
  assert.ok(inside, "layout 이 ViewportFrame 으로 감싸지 않는다");
  assert.doesNotMatch(inside[1], /<ComponentInspector \/>/, "인스펙터가 아직 액자 안 자식 자리에 있다");
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
    assertAbsent(view.queryByTitle(`${mobileOnly.name} — 모바일 390x844`), "좁은 창에서 고정 폭 액자를 열었다");
    // 좁은 창은 검사 뷰포트 값을 단추에서 접으므로(`sm:` 아래) title 에 그 값을 남긴다 — 어느 폭으로 보는지 알 자리가 여기뿐이다.
    const full = view.getByTitle(`${mobileOnly.name} — 모바일 390x844 (창 폭)`) as HTMLIFrameElement;
    assert.equal(full.getAttribute("src"), `${mobileOnly.href}?${FRAME_PARAM}=1`, "전체 폭 액자가 같은 주소를 열지 않는다");
    assert.equal(full.getAttribute("width"), null, "전체 폭 액자에 고정 폭이 붙었다");
    assert.match(full.className, /w-full/, "전체 폭 액자가 창 폭을 채우지 않는다");
    assertAbsent(view.queryByRole("heading", { level: 1 }), "액자를 보이면서 화면도 함께 그렸다");
    assert.equal(view.getByRole("button", { name: /모바일/ }).getAttribute("aria-pressed"), "true", "고른 폭은 그대로 모바일이어야 한다");
    assert.ok(view.getByText("창이 모바일 액자보다 좁아 창 폭으로 보인다"), "까닭을 보이지 않는다");

    // 경계 — 창이 「액자 폭 + 여백」 과 같으면 「보다 넓지 않으면」 이라 아직 전체 폭이다(문서의 규칙과 코드의 `>` 를 고정한다).
    window.innerWidth = 390 + FRAME_GUTTER;
    fireEvent(window, new Event("resize"));
    assertAbsent(view.queryByTitle(`${mobileOnly.name} — 모바일 390x844`), "창이 액자 폭 + 여백과 같은데 고정 폭 액자를 열었다");
    assert.ok(view.getByTitle(`${mobileOnly.name} — 모바일 390x844 (창 폭)`), "경계에서 전체 폭 액자가 아니다");

    window.innerWidth = 390 + FRAME_GUTTER + 1;
    fireEvent(window, new Event("resize"));
    const fixed = view.getByTitle(`${mobileOnly.name} — 모바일 390x844`) as HTMLIFrameElement;
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

// 액자 안에서 화면끼리 링크로 옮기면 주소에서 `?frame=1` 이 빠진다. 주소만 보던 때는 그때 액자 안 문서가
// 자기 막대와 중첩 액자를 또 세웠고, 맨 위 막대가 세는 것이 화면이 아니라 두 번째 막대라 「컴포넌트 보기 0」
// 이 되었다(2026-09-29 개발자, #124 의 「남은 것」). 창이 최상위가 아니면 표식이 없어도 액자 안으로 본다.
// JSDOM 의 `window.top` 은 다시 정의할 수 없으므로 흉내 창으로 잰다 — 부품에 이어 붙인 자리는 아래
// 「액자 안에서는 막대도 도구 단추도 없이 화면만 그린다」 가 `?frame=1` 로 잰다.
test("액자 안 판정은 「최상위 창이 아니다」 이거나 주소에 frame 표식이 있는 것이다", () => {
  const top = { name: "최상위" };
  const inner = { name: "액자 안" };
  assert.equal(inFrameNow({ self: top, top, location: { search: "" } }), false, "최상위 창에 표식이 없으면 액자 밖이다");
  assert.equal(inFrameNow({ self: top, top, location: { search: `?${FRAME_PARAM}=1` } }), true, "최상위 창이어도 표식이 있으면 액자 안으로 본다 — 러너의 검사와 직접 열기가 이 길이다");
  assert.equal(inFrameNow({ self: inner, top, location: { search: "" } }), true, "표식이 빠진 액자 안 이동에서 중첩 액자가 생긴다");
  assert.equal(inFrameNow({ self: inner, top, location: { search: "?tab=2" } }), true);

  // 다른 출처 상위 창은 읽다 막힌다. 막히는 것 자체가 액자 안이라는 뜻이다.
  const blocked = {
    self: inner,
    get top(): unknown {
      throw new Error("cross-origin");
    },
    location: { search: "" },
  };
  assert.equal(inFrameNow(blocked), true, "상위 창을 읽지 못하면 액자 안으로 본다");
});

// 러너의 검사(`/make-screens` 4단계)는 `/<key>?frame=1` 을 최상위 창으로 연다 — `self === top` 이라 주소가 유일한
// 근거다. 그 길이 계속 막대 없이 화면만 보이는지 진짜 창으로 잰다(위 시험은 흉내 창이라 이어 붙인 자리를 못 본다).
test("`?frame=1` 을 최상위 창으로 직접 열면 표식만으로 액자 안으로 본다", () => {
  const screen = sandboxScreens[0];
  assert.equal(inFrameNow(), false, "표식이 없는 최상위 창이 액자 안으로 잡혔다");
  window.history.replaceState({}, "", `${screen.href}?${FRAME_PARAM}=1`);
  assert.equal(inFrameNow(), true, "최상위 창의 `?frame=1` 을 놓쳤다 — 러너의 검사가 막대째 열린다");
});
