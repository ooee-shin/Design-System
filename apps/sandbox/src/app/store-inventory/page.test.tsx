import "@/test-setup";

import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import React from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";

import StoreInventoryPage from "./page";

afterEach(cleanup);

test("화면 제목이 보인다", () => {
  render(<StoreInventoryPage />);
  assert.ok(screen.getByRole("heading", { name: "재고 조회" }));
});

test("검색 칸과 조회 버튼, 필터 칩이 접근 가능한 이름으로 찾아진다", () => {
  render(<StoreInventoryPage />);
  assert.ok(screen.getByLabelText("상품명 또는 바코드"));
  assert.ok(screen.getByRole("button", { name: "조회" }));
  assert.ok(screen.getByRole("button", { name: "전체" }));
  assert.ok(screen.getByRole("button", { name: "품절" }));
  assert.ok(screen.getByRole("button", { name: "부족" }));
});

test("검색 전에는 표 대신 안내 한 줄만 보인다", () => {
  render(<StoreInventoryPage />);
  assert.ok(screen.getByText("상품명이나 바코드로 조회해 주세요."));
  assert.equal(screen.queryByRole("table"), null);
});

test("처음에는 전체 칩이 골라져 있다", () => {
  render(<StoreInventoryPage />);
  assert.equal(screen.getByRole("button", { name: "전체" }).getAttribute("aria-pressed"), "true");
  assert.equal(screen.getByRole("button", { name: "품절" }).getAttribute("aria-pressed"), "false");
});

test("조회하면 표 다섯 열과 결과가 보인다", () => {
  render(<StoreInventoryPage />);
  fireEvent.click(screen.getByRole("button", { name: "조회" }));

  const table = screen.getByRole("table");
  assert.ok(within(table).getByRole("columnheader", { name: "상품명" }));
  assert.ok(within(table).getByRole("columnheader", { name: "규격" }));
  assert.ok(within(table).getByRole("columnheader", { name: "매장 재고" }));
  assert.ok(within(table).getByRole("columnheader", { name: "창고 재고" }));
  assert.ok(within(table).getByRole("columnheader", { name: "최근 입고일" }));
});

test("매장 재고가 0이면 품절 배지, 3개 이하면 부족 배지가 붙는다", () => {
  render(<StoreInventoryPage />);
  fireEvent.click(screen.getByRole("button", { name: "조회" }));

  const table = screen.getByRole("table");
  assert.ok(within(table).getAllByText("품절").length > 0);
  assert.ok(within(table).getAllByText("부족").length > 0);
});

test("상품명이나 바코드로 좁혀 조회된다", () => {
  render(<StoreInventoryPage />);
  fireEvent.change(screen.getByLabelText("상품명 또는 바코드"), { target: { value: "청바지" } });
  fireEvent.click(screen.getByRole("button", { name: "조회" }));

  assert.ok(screen.getByText("스트레치 청바지"));
  assert.equal(screen.queryByText("데일리 맨투맨"), null);
});

test("조회 결과가 없으면 안내 문구가 보인다", () => {
  render(<StoreInventoryPage />);
  fireEvent.change(screen.getByLabelText("상품명 또는 바코드"), { target: { value: "존재하지않는상품" } });
  fireEvent.click(screen.getByRole("button", { name: "조회" }));

  assert.ok(screen.getByText("조회된 상품이 없습니다."));
  assert.equal(screen.queryByRole("table"), null);
});

test("품절·부족 칩을 누르면 그 조건에 맞는 줄만 남는다", () => {
  render(<StoreInventoryPage />);
  fireEvent.click(screen.getByRole("button", { name: "조회" }));

  fireEvent.click(screen.getByRole("button", { name: "품절" }));
  assert.ok(screen.getByText("스트레치 청바지"));
  assert.equal(screen.queryByText("베이직 반팔티"), null);

  fireEvent.click(screen.getByRole("button", { name: "부족" }));
  assert.ok(screen.getByText("베이직 반팔티"));
  assert.equal(screen.queryByText("스트레치 청바지"), null);
});

test("줄을 누르면 상세로 가는 링크가 있다", () => {
  render(<StoreInventoryPage />);
  fireEvent.change(screen.getByLabelText("상품명 또는 바코드"), { target: { value: "청바지" } });
  fireEvent.click(screen.getByRole("button", { name: "조회" }));

  assert.ok(screen.getByRole("link", { name: "스트레치 청바지 상세 보기" }));
});
