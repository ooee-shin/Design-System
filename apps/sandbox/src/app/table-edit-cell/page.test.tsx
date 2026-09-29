import "@/test-setup";

import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";

import Page from "./page";

test("화면 제목이 보인다", () => {
  render(<Page />);
  assert.ok(screen.getByRole("heading", { name: "법인카드 사용내역" }));
  cleanup();
});

test("사용일시·이름·금액·부가세·총합은 텍스트로만 보이고 input이 아니다", () => {
  render(<Page />);
  assert.ok(screen.getByText("2026-09-01 09:24"));
  assert.equal(screen.getAllByText("김도윤").length, 2);
  assert.ok(screen.getByText("18,500원"));
  assert.ok(screen.getByText("1,850원"));
  assert.ok(screen.getByText("20,350원"));
  cleanup();
});

test("사용처 칸마다 수정 가능한 input이 접근 가능한 이름으로 찾아지고 기존 값을 보여준다", () => {
  render(<Page />);
  const merchantInput = screen.getByRole("textbox", { name: "2026-09-01 09:24 사용내역 사용처" }) as HTMLInputElement;
  assert.equal(merchantInput.value, "스타벅스 강남역점");
  cleanup();
});

test("사용처 input의 개수는 표의 행 수와 같다 — 다른 칸에는 input이 없다", () => {
  render(<Page />);
  assert.equal(screen.getAllByRole("textbox").length, 6);
  cleanup();
});

test("사용처 칸을 고치면 값이 바뀐다", () => {
  render(<Page />);
  const merchantInput = screen.getByRole("textbox", { name: "2026-09-01 09:24 사용내역 사용처" }) as HTMLInputElement;
  fireEvent.change(merchantInput, { target: { value: "스타벅스 역삼점" } });
  assert.equal(merchantInput.value, "스타벅스 역삼점");
  cleanup();
});
