import "@/test-setup";
import React from "react";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import NikeRunTermsPage from "./page";

afterEach(cleanup);

test("화면 제목이 heading 으로 잡힌다", () => {
  render(<NikeRunTermsPage />);
  assert.ok(screen.getByRole("heading", { name: "약관 동의" }), "제목이 없습니다");
});

test("전체 동의와 세 약관 체크박스가 이름으로 찾아지고 처음엔 모두 꺼져 있다", () => {
  render(<NikeRunTermsPage />);
  for (const name of ["전체 동의", "(필수) 나이키 런 이용약관", "(필수) 위치기반서비스 이용약관", "(선택) 마케팅 정보 수신 동의"]) {
    assert.equal(screen.getByRole("checkbox", { name }).getAttribute("aria-checked"), "false", `${name} 기본값`);
  }
});

test("필수 약관을 모두 고르기 전에는 시작하기가 막혀 있다", () => {
  render(<NikeRunTermsPage />);
  const start = screen.getByRole("button", { name: "동의하고 시작하기" }) as HTMLButtonElement;
  assert.equal(start.disabled, true);
  fireEvent.click(screen.getByRole("checkbox", { name: "전체 동의" }));
  assert.equal(start.disabled, false);
});

test("보기 버튼이 약관 팝업을 열고 동의하고 닫기가 항목을 고른다", () => {
  render(<NikeRunTermsPage />);
  assert.equal(screen.queryByRole("dialog"), null);
  fireEvent.click(screen.getByRole("button", { name: "위치기반서비스 이용약관 보기" }));
  assert.ok(screen.getByRole("dialog", { name: "위치기반서비스 이용약관" }));
  fireEvent.click(screen.getByRole("button", { name: "동의하고 닫기" }));
  assert.equal(screen.queryByRole("dialog"), null);
  assert.equal(screen.getByRole("checkbox", { name: "(필수) 위치기반서비스 이용약관" }).getAttribute("aria-checked"), "true");
});

test("팝업의 닫기는 동의 없이 닫는다", () => {
  render(<NikeRunTermsPage />);
  fireEvent.click(screen.getByRole("button", { name: "나이키 런 이용약관 보기" }));
  fireEvent.click(screen.getByRole("button", { name: "닫기" }));
  assert.equal(screen.queryByRole("dialog"), null);
  assert.equal(screen.getByRole("checkbox", { name: "(필수) 나이키 런 이용약관" }).getAttribute("aria-checked"), "false");
});
