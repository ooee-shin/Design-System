import "@/test-setup";

import assert from "node:assert/strict";
import test, { afterEach } from "node:test";

import React from "react";
import { cleanup, render } from "@testing-library/react";

import AdminLoginPage from "./page";

afterEach(() => {
  cleanup();
});

test("화면 제목으로 시스템 이름을 보인다", () => {
  const view = render(<AdminLoginPage />);

  assert.ok(view.getByRole("heading", { name: "{환경설정 시스템명}" }));
});

test("아이디·비밀번호 입력칸과 아이디 저장 체크박스에 이름이 붙어 있다", () => {
  const view = render(<AdminLoginPage />);

  assert.ok(view.getByLabelText("아이디"));
  assert.ok(view.getByLabelText("비밀번호"));
  assert.ok(view.getByRole("checkbox", { name: "아이디 저장" }));
});

test("「로그인」이라 적힌 제출 버튼이 있다", () => {
  const view = render(<AdminLoginPage />);

  const button = view.getByRole("button", { name: "로그인" });
  assert.equal(button.getAttribute("type"), "submit");
});
