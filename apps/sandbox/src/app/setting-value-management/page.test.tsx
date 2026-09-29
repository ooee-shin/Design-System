import "@/test-setup";

import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";

import Page from "./page";

test("화면 제목이 보인다", () => {
  render(<Page />);
  assert.ok(screen.getByRole("heading", { name: "설정값 관리" }));
  cleanup();
});

test("전체 개수 배지가 108개를 보여준다", () => {
  render(<Page />);
  assert.ok(screen.getByText("전체 108개"));
  cleanup();
});

test("검색 입력이 접근 가능한 이름으로 찾아진다", () => {
  render(<Page />);
  assert.ok(screen.getByRole("textbox", { name: "설정값 검색" }));
  cleanup();
});

test("첫 항목의 값 입력과 노출 스위치가 접근 가능한 이름으로 찾아지고 기본값을 보여준다", () => {
  render(<Page />);
  const valueInput = screen.getByRole("textbox", { name: "설정값 001 값" }) as HTMLInputElement;
  assert.equal(valueInput.value, "값 1");

  const visibleSwitch = screen.getByRole("switch", { name: "설정값 001 노출 여부" });
  assert.equal(visibleSwitch.getAttribute("aria-checked"), "true");
  cleanup();
});

test("노출 스위치를 누르면 상태가 바뀐다", () => {
  render(<Page />);
  const visibleSwitch = screen.getByRole("switch", { name: "설정값 001 노출 여부" });
  fireEvent.click(visibleSwitch);
  assert.equal(visibleSwitch.getAttribute("aria-checked"), "false");
  cleanup();
});

test("값 입력을 고치면 화면에 바뀐 값이 남는다", () => {
  render(<Page />);
  const valueInput = screen.getByRole("textbox", { name: "설정값 001 값" }) as HTMLInputElement;
  fireEvent.change(valueInput, { target: { value: "새 값" } });
  assert.equal(valueInput.value, "새 값");
  cleanup();
});

test("검색어와 일치하지 않으면 결과 없음 안내가 보인다", () => {
  render(<Page />);
  const searchInput = screen.getByRole("textbox", { name: "설정값 검색" });
  fireEvent.change(searchInput, { target: { value: "존재하지 않는 이름" } });
  assert.ok(screen.getByText("검색 결과가 없습니다."));
  cleanup();
});

test("페이지 이동 버튼으로 다음 20개 항목을 볼 수 있다", () => {
  render(<Page />);
  assert.ok(screen.queryByText("설정값 021") === null);
  const nextButton = screen.getByRole("button", { name: "다음" });
  fireEvent.click(nextButton);
  assert.ok(screen.getByText("설정값 021"));
  cleanup();
});
