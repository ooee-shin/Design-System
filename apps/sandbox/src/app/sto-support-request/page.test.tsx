import "@/test-setup";

import assert from "node:assert/strict";
import test, { afterEach } from "node:test";

import React from "react";
import { cleanup, render } from "@testing-library/react";

import StoSupportRequestPage from "./page";

afterEach(() => {
  cleanup();
});

test("지원요청 화면 제목이 heading으로 잡힌다", () => {
  const view = render(<StoSupportRequestPage />);

  assert.ok(view.getByRole("heading", { level: 1, name: "지원요청" }));
});

test("매핑표의 각 Control이 접근 가능한 이름으로 찾아진다", () => {
  const view = render(<StoSupportRequestPage />);

  assert.ok(view.getByRole("button", { name: "뒤로가기" }));
  assert.ok(view.getByLabelText("요청 유형"));
  assert.ok(view.getByLabelText("매장"));
  assert.ok(view.getByLabelText("제목"));
  assert.ok(view.getByLabelText("내용"));
  assert.ok(view.getByLabelText("사진 첨부"));
  assert.ok(view.getByLabelText("연락 가능 시간"));
  assert.ok(view.getByRole("switch", { name: "긴급 요청" }));
});

test("제출 버튼이 요청 문구 그대로 있다", () => {
  const view = render(<StoSupportRequestPage />);

  assert.ok(view.getByRole("button", { name: "요청 보내기" }));
});
