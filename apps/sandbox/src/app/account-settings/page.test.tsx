import "@/test-setup";

import assert from "node:assert/strict";
import test, { afterEach } from "node:test";

import React from "react";
import { cleanup, render } from "@testing-library/react";

import AccountSettingsPage from "./page";

afterEach(() => {
  cleanup();
});

test("화면 제목이 계정 설정으로 보인다", () => {
  const view = render(<AccountSettingsPage />);
  assert.ok(view.getByRole("heading", { level: 1, name: "계정 설정" }));
});

test("이름과 이메일 입력, 언어 선택, 알림 스위치와 저장 버튼이 접근 가능한 이름으로 찾아진다", () => {
  const view = render(<AccountSettingsPage />);

  assert.ok(view.getByLabelText("이름"));
  assert.ok(view.getByPlaceholderText("이름을 입력하세요"));
  assert.ok(view.getByLabelText("이메일"));
  assert.ok(view.getByPlaceholderText("이메일을 입력하세요"));
  assert.ok(view.getByLabelText("언어"));
  assert.equal(view.getByRole("combobox", { name: "언어" }).textContent, "한국어");
  assert.equal(view.getByRole("switch", { name: "이메일 알림 받기" }).getAttribute("aria-checked"), "true");
  assert.ok(view.getByRole("button", { name: "저장" }));
});
