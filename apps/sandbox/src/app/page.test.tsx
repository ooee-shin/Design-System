import "@/test-setup";

import assert from "node:assert/strict";
import test, { afterEach } from "node:test";

import React from "react";
import { cleanup, render } from "@testing-library/react";

import { sandboxScreens } from "@/screens";

import SandboxIndexPage from "./page";

afterEach(() => {
  cleanup();
});

test("첫 화면은 제목과 등록된 화면마다 링크 하나를 보인다", () => {
  const view = render(<SandboxIndexPage />);

  assert.ok(view.getByRole("heading", { level: 1, name: "ooee sandbox" }));
  assert.equal(view.queryAllByRole("link").length, sandboxScreens.length, "등록된 화면 수와 링크 수가 다르다");
});
