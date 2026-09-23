import "@/test-setup";

import assert from "node:assert/strict";
import test, { afterEach } from "node:test";

import React from "react";
import { cleanup, fireEvent, render } from "@testing-library/react";

import { sandboxScreens } from "@/screens";

import { frameSize, ViewportFrame } from "./viewport-frame";

afterEach(() => {
  cleanup();
});

// usePathname 은 라우터가 없으면 null 을 돌려준다. 시험은 next/navigation 을 흉내 내지 않고 주소를 prop 으로 준다.
test("검사 뷰포트 「WxH」를 액자 크기로 읽는다", () => {
  assert.deepEqual(frameSize("1024x768"), { width: 1024, height: 768 });
  assert.deepEqual(frameSize("390x844"), { width: 390, height: 844 });
});

test("화면 위에 웹·태블릿·모바일 전환이 서고, 태블릿을 고르면 그 폭의 액자로 같은 주소를 연다", async () => {
  const screen = sandboxScreens[0];
  {
    const view = render(
      <ViewportFrame pathname={screen.href}>
        <main>
          <h1>{screen.name}</h1>
        </main>
      </ViewportFrame>,
    );
    assert.ok(view.getByRole("heading", { level: 1, name: screen.name }), "웹에서는 화면을 그대로 그린다");
    const tablet = view.getByRole("button", { name: /태블릿/ });
    fireEvent.click(tablet);
    const frame = view.getByTitle(/태블릿 1024x768/) as HTMLIFrameElement;
    assert.equal(frame.getAttribute("src"), `${screen.href}?frame=1`, "액자가 같은 주소를 frame 표식과 함께 열지 않는다");
    assert.equal(frame.getAttribute("width"), "1024");
    assert.equal(view.queryByRole("heading", { level: 1 }), null, "액자를 보이면서 화면도 함께 그렸다");
    fireEvent.click(view.getByRole("button", { name: /^웹/ }));
    assert.ok(view.getByRole("heading", { level: 1, name: screen.name }), "웹으로 돌아오지 않는다");
  }
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
