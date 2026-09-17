import "@/test-setup";

import assert from "node:assert/strict";
import test, { afterEach } from "node:test";

import React from "react";
import { cleanup, fireEvent, render } from "@testing-library/react";

import StoMyPage from "./page";

afterEach(() => {
  cleanup();
});

test("화면 제목 「마이페이지」가 heading으로 잡힌다", () => {
  const view = render(<StoMyPage />);

  assert.ok(view.getByRole("heading", { level: 1, name: "마이페이지" }));
});

test("프로필 항목 다섯 개의 이름이 모두 보인다", () => {
  const view = render(<StoMyPage />);

  for (const term of ["아이디", "비밀번호", "점포", "이름", "권한"]) {
    assert.ok(view.getByText(term), `프로필 항목 「${term}」이 보이지 않는다`);
  }
});

test("아이디·점포·이름·권한은 입력 요소 없이 값만 보인다", () => {
  const view = render(<StoMyPage />);

  for (const value of ["{아이디}", "{점포명}", "{이름}", "{권한}"]) {
    assert.ok(view.getByText(value), `값 「${value}」이 보이지 않는다`);
  }
  assert.equal(view.queryAllByRole("textbox").length, 0, "수정할 수 없는 항목에 입력 요소가 있다");
});

test("현재 비밀번호 입력은 처음에 마스킹되어 있다", () => {
  const view = render(<StoMyPage />);

  const input = view.getByLabelText("현재 비밀번호");
  assert.equal(input.getAttribute("type"), "password", "현재 비밀번호가 마스킹되어 있지 않다");
  assert.ok(view.getByPlaceholderText("현재 비밀번호 입력"));
});

test("보기 전환을 누르면 현재 비밀번호가 글자로 보이고 버튼 이름이 바뀐다", () => {
  const view = render(<StoMyPage />);

  fireEvent.click(view.getByRole("button", { name: "비밀번호 보기" }));

  assert.equal(view.getByLabelText("현재 비밀번호").getAttribute("type"), "text", "보기 전환 뒤에도 마스킹이 풀리지 않았다");
  assert.ok(view.getByRole("button", { name: "비밀번호 숨기기" }));
});

test("확인을 누르기 전에는 비밀번호가 보이지 않는다", () => {
  const view = render(<StoMyPage />);

  assert.equal(view.queryByText("{비밀번호}"), null, "확인하기 전인데 비밀번호가 보인다");
  assert.ok(view.getByRole("button", { name: "확인" }));
});

test("확인을 누르면 비밀번호를 조회할 수 있다", () => {
  const view = render(<StoMyPage />);

  fireEvent.click(view.getByRole("button", { name: "확인" }));

  assert.ok(view.getByText("{비밀번호}"), "확인한 뒤에도 비밀번호가 보이지 않는다");
  assert.equal(view.queryByLabelText("현재 비밀번호"), null, "확인한 뒤에도 현재 비밀번호 입력이 남아 있다");
});
