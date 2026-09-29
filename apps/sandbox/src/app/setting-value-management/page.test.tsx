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
  assert.ok(screen.getByRole("textbox", { name: "설정값 번호 검색" }));
  cleanup();
});

test("첫 항목의 값 입력과 노출 스위치가 접근 가능한 이름으로 찾아지고 기본값을 보여준다", () => {
  render(<Page />);
  const valueInput = screen.getByRole("textbox", { name: "설정값 1 값" }) as HTMLInputElement;
  assert.equal(valueInput.value, "값 1");

  const visibleSwitch = screen.getByRole("switch", { name: "설정값 1 노출 여부" });
  assert.equal(visibleSwitch.getAttribute("aria-checked"), "true");
  cleanup();
});

test("노출 스위치를 누르면 상태가 바뀐다", () => {
  render(<Page />);
  const visibleSwitch = screen.getByRole("switch", { name: "설정값 1 노출 여부" });
  fireEvent.click(visibleSwitch);
  assert.equal(visibleSwitch.getAttribute("aria-checked"), "false");
  cleanup();
});

test("값 입력을 고치면 화면에 바뀐 값이 남는다", () => {
  render(<Page />);
  const valueInput = screen.getByRole("textbox", { name: "설정값 1 값" }) as HTMLInputElement;
  fireEvent.change(valueInput, { target: { value: "새 값" } });
  assert.equal(valueInput.value, "새 값");
  cleanup();
});

test("검색어와 일치하지 않으면 결과 없음 안내가 보인다", () => {
  render(<Page />);
  const searchInput = screen.getByRole("textbox", { name: "설정값 번호 검색" });
  fireEvent.change(searchInput, { target: { value: "존재하지 않는 번호" } });
  assert.ok(screen.getByText("검색 결과가 없습니다."));
  cleanup();
});

test("검색은 항목 번호를 기준으로 찾는다", () => {
  render(<Page />);
  const searchInput = screen.getByRole("textbox", { name: "설정값 번호 검색" });
  fireEvent.change(searchInput, { target: { value: "21" } });
  assert.ok(screen.getByRole("textbox", { name: "설정값 21 값" }));
  assert.equal(screen.queryByRole("textbox", { name: "설정값 1 값" }), null);
  cleanup();
});

test("페이지 이동 버튼으로 다음 20개 항목을 볼 수 있다", () => {
  render(<Page />);
  assert.ok(screen.queryByRole("textbox", { name: "설정값 21 값" }) === null);
  const nextButton = screen.getByRole("button", { name: "다음" });
  fireEvent.click(nextButton);
  assert.ok(screen.getByRole("textbox", { name: "설정값 21 값" }));
  cleanup();
});

test("모두 끄기 버튼을 누르면 화면에 보이는 항목의 노출 스위치가 모두 꺼진다", () => {
  render(<Page />);
  const allOffButton = screen.getByRole("button", { name: "모두 끄기" });
  fireEvent.click(allOffButton);
  const visibleSwitch = screen.getByRole("switch", { name: "설정값 1 노출 여부" });
  assert.equal(visibleSwitch.getAttribute("aria-checked"), "false");
  cleanup();
});

test("모두 켜기 버튼을 누르면 꺼져 있던 노출 스위치도 모두 켜진다", () => {
  render(<Page />);
  const initiallyOffSwitch = screen.getByRole("switch", { name: "설정값 3 노출 여부" });
  assert.equal(initiallyOffSwitch.getAttribute("aria-checked"), "false");

  const allOnButton = screen.getByRole("button", { name: "모두 켜기" });
  fireEvent.click(allOnButton);
  assert.equal(initiallyOffSwitch.getAttribute("aria-checked"), "true");
  cleanup();
});
