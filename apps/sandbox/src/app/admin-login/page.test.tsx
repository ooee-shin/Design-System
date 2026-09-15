import "@/test-setup";

import assert from "node:assert/strict";
import test, { afterEach } from "node:test";

import React from "react";
import { cleanup, render } from "@testing-library/react";

import AdminLoginPage from "./page";

afterEach(() => {
  cleanup();
});

test("shows the system name as the screen heading", () => {
  const view = render(<AdminLoginPage />);

  assert.ok(view.getByRole("heading", { name: "{환경설정 시스템명}" }));
});

test("has accessible id and password inputs and a save-id checkbox", () => {
  const view = render(<AdminLoginPage />);

  assert.ok(view.getByLabelText("아이디"));
  assert.ok(view.getByLabelText("비밀번호"));
  assert.ok(view.getByRole("checkbox", { name: "아이디 저장" }));
});

test("has a submit button labeled 로그인", () => {
  const view = render(<AdminLoginPage />);

  const button = view.getByRole("button", { name: "로그인" });
  assert.equal(button.getAttribute("type"), "submit");
});
