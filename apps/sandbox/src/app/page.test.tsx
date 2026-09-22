import "@/test-setup";

import assert from "node:assert/strict";
import test, { afterEach } from "node:test";

import React from "react";
import { cleanup, fireEvent, render, within } from "@testing-library/react";

import { screenRoots } from "@/components/renewal/screen-registry";
import { SANDBOX_PROJECTS, sandboxScreens } from "@/screens";

import SandboxIndexPage from "./page";

afterEach(() => {
  cleanup();
});

const inProject = (id: string) => sandboxScreens.filter((screen) => screen.project === id);

test("첫 화면은 제목과 프로젝트마다의 탭, 그리고 블루키 리뉴얼 탭을 보인다", () => {
  const view = render(<SandboxIndexPage />);

  assert.ok(view.getByRole("heading", { level: 1, name: "ooee sandbox" }));
  const tabs = view.getAllByRole("tab");
  assert.deepEqual(
    tabs.map((tab) => tab.textContent),
    [...SANDBOX_PROJECTS.map((project) => `${project.name}${inProject(project.id).length}`), `블루키 리뉴얼${screenRoots.reduce((sum, root) => sum + root.items.filter((item) => item.href).length, 0)}`],
    "탭 이름 옆의 수가 그 탭에 든 화면 수가 아니다",
  );
});

test("처음 열리는 탭은 화면이 있는 첫 프로젝트다", () => {
  const view = render(<SandboxIndexPage />);
  const first = SANDBOX_PROJECTS.find((project) => inProject(project.id).length > 0);
  assert.ok(first, "화면이 있는 프로젝트가 없다");
  const selected = view.getAllByRole("tab").find((tab) => tab.getAttribute("aria-selected") === "true");
  assert.equal(selected?.textContent?.startsWith(first.name), true, "처음 고른 탭이 화면이 있는 첫 프로젝트가 아니다");
});

test("탭을 고르면 그 프로젝트에 등록된 화면마다 링크 하나를 보인다", () => {
  const view = render(<SandboxIndexPage />);

  for (const project of SANDBOX_PROJECTS) {
    fireEvent.click(view.getAllByRole("tab").find((tab) => tab.textContent?.startsWith(project.name))!);
    const panel = view.getByRole("tabpanel");
    const links = within(panel).queryAllByRole("link");
    assert.deepEqual(
      links.map((link) => link.getAttribute("href")),
      inProject(project.id).map((screen) => screen.href),
      `${project.name} 탭의 링크가 등록된 화면과 다르다`,
    );
  }
});

test("블루키 리뉴얼 탭은 만든 화면만 링크로 두고 루트마다 작업 목록으로 간다", () => {
  const view = render(<SandboxIndexPage />);
  fireEvent.click(view.getAllByRole("tab").find((tab) => tab.textContent?.startsWith("블루키 리뉴얼"))!);
  const panel = view.getByRole("tabpanel");

  for (const root of screenRoots) {
    assert.ok(within(panel).getByRole("heading", { level: 2, name: root.name }), `${root.name} 루트가 없다`);
  }
  const hrefs = within(panel).queryAllByRole("link").map((link) => link.getAttribute("href"));
  const expected = screenRoots.flatMap((root) => [`/renewal/${root.key}`, ...root.items.flatMap((item) => (item.href ? [item.href] : []))]);
  assert.deepEqual(hrefs, expected, "리뉴얼 탭의 링크가 작업 목록·만든 화면과 다르다");
});
