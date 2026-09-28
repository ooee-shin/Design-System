import "@/test-setup";

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test, { afterEach } from "node:test";

import React from "react";
import { cleanup, fireEvent, render } from "@testing-library/react";

import { sandboxScreens } from "@/screens";

import { frameSize, FRAME_PARAM, ViewportFrame } from "./viewport-frame";

afterEach(() => {
  cleanup();
  window.history.replaceState({}, "", "/");
});

// usePathname 은 라우터가 없으면 null 을 돌려준다. 시험은 next/navigation 을 흉내 내지 않고 주소를 prop 으로 준다.
test("검사 뷰포트 「WxH」를 액자 크기로 읽는다", () => {
  assert.deepEqual(frameSize("1024x768"), { width: 1024, height: 768 });
  assert.deepEqual(frameSize("390x844"), { width: 390, height: 844 });
});

test("세 폭 모두 액자로 연다 — 웹도 막대 아래에 화면을 그대로 두지 않는다", () => {
  const screen = sandboxScreens[0];
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
  assert.equal(view.queryByRole("heading", { level: 1 }), null, "액자를 보이면서 화면도 함께 그렸다");

  fireEvent.click(view.getByRole("button", { name: /태블릿/ }));
  const tablet = view.getByTitle(/태블릿 1024x768/) as HTMLIFrameElement;
  assert.equal(tablet.getAttribute("src"), `${screen.href}?${FRAME_PARAM}=1`);
  assert.equal(tablet.getAttribute("width"), "1024");

  fireEvent.click(view.getByRole("button", { name: /^웹/ }));
  assert.ok(view.getByTitle(`${screen.name} — 웹`), "웹으로 돌아오지 않는다");
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
  assert.equal(view.queryByRole("toolbar", { name: "보기 폭" }), null, "액자 안에 막대가 또 섰다");
  assert.ok(view.getByRole("heading", { level: 1, name: screen.name }), "액자 안에서 화면을 그리지 않는다");
});

test("첫 화면에서는 전환을 그리지 않는다", () => {
  const view = render(
    <ViewportFrame pathname="/">
      <p>목록</p>
    </ViewportFrame>,
  );
  assert.equal(view.queryByRole("toolbar", { name: "보기 폭" }), null);
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
