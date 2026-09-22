import "@/test-setup";

import assert from "node:assert/strict";
import test, { afterEach } from "node:test";

import React from "react";
import { act, cleanup, fireEvent, render, within } from "@testing-library/react";

import { sandboxScreens } from "@/screens";

import { InspectorBar } from "./component-inspector";

afterEach(() => {
  cleanup();
});

const screen = sandboxScreens[0];

/** 화면 자리. 막대는 body 전체를 세므로 화면 조각을 같이 그린다. */
function Page() {
  return (
    <main>
      <h1>{screen.name}</h1>
      <button data-slot="button">저장</button>
      <button data-slot="button">취소</button>
      <div data-slot="input-container">
        <input />
      </div>
    </main>
  );
}

const settle = () => act(() => new Promise((resolve) => setTimeout(resolve, 5)));

test("컴포넌트 보기를 켜면 쓴 컴포넌트를 수와 Studio 문서 링크로 보인다", async () => {
  const view = render(
    <>
      <Page />
      <InspectorBar pathname={screen.href} />
    </>,
  );
  await settle();

  const toggle = view.getByRole("button", { name: /컴포넌트 보기/ });
  assert.equal(toggle.textContent, "컴포넌트 보기 2", "막대가 센 종류 수가 틀렸다");
  fireEvent.click(toggle);

  const list = view.getByRole("complementary", { name: "쓴 컴포넌트" });
  const links = within(list).getAllByRole("link");
  const docs = links.filter((link) => link.getAttribute("href")?.includes("/components/"));
  assert.deepEqual(
    docs.map((link) => [link.textContent?.replace(/\s+/g, " ").trim(), link.getAttribute("href")]),
    [
      ["Button×2 ↗", "https://ooee-studio.pages.dev/components/button"],
      ["Input×1 ↗", "https://ooee-studio.pages.dev/components/input"],
    ],
  );
  assert.ok(within(list).getByText("2종 · 3곳"));
});

test("경로는 디자인 시스템 › 프로젝트 › 화면 이다", async () => {
  const view = render(<InspectorBar pathname={screen.href} />);
  await settle();
  fireEvent.click(view.getByRole("button", { name: /컴포넌트 보기/ }));

  const crumbs = view.getByRole("navigation", { name: "경로" });
  const [system, project] = within(crumbs).getAllByRole("link");
  assert.equal(system.textContent, "디자인 시스템");
  assert.equal(project.getAttribute("href"), `/#${screen.project}`);
  assert.ok(crumbs.textContent?.endsWith(screen.name), "경로 끝이 화면 이름이 아니다");
});

test("요청 보기는 그 화면을 만든 요청 문장을 보이고 Esc 로 닫힌다", async () => {
  const view = render(<InspectorBar pathname={screen.href} />);
  await settle();
  fireEvent.click(view.getByRole("button", { name: "요청 보기" }));

  const panel = view.getByRole("complementary", { name: "요청" });
  assert.ok(within(panel).getByText(screen.prompt));
  fireEvent.keyDown(window, { key: "Escape" });
  assert.equal(view.queryByRole("complementary"), null, "Esc 로 닫히지 않았다");
});

test("막대 자신이 그린 것은 세지 않는다", async () => {
  const view = render(<InspectorBar pathname="/renewal/unknown" />);
  await settle();
  assert.equal(view.getByRole("button", { name: /컴포넌트 보기/ }).textContent, "컴포넌트 보기 0");
  assert.equal(view.queryByRole("button", { name: "요청 보기" }), null, "요청이 없는 화면에 요청 보기가 섰다");
});
