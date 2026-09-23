import "@/test-setup"

import { test, afterEach } from "node:test"
import assert from "node:assert/strict"
import React from "react"
import { render, screen, fireEvent, cleanup } from "@testing-library/react"

import StoreInventoryPage2 from "./page"

afterEach(() => {
  cleanup()
})

test("화면 제목이 보인다", () => {
  render(<StoreInventoryPage2 />)
  assert.ok(screen.getByRole("heading", { name: "재고 조회" }))
})

test("검색 칸과 조회 버튼이 접근 가능한 이름으로 찾아진다", () => {
  render(<StoreInventoryPage2 />)
  assert.ok(screen.getByLabelText("상품명 또는 바코드"))
  assert.ok(screen.getByRole("button", { name: "조회" }))
})

test("필터 칩 세 개가 있고 전체가 기본으로 골라져 있다", () => {
  render(<StoreInventoryPage2 />)
  const all = screen.getByRole("button", { name: "전체" })
  const soldOut = screen.getByRole("button", { name: "품절" })
  const low = screen.getByRole("button", { name: "부족" })
  assert.equal(all.getAttribute("aria-pressed"), "true")
  assert.equal(soldOut.getAttribute("aria-pressed"), "false")
  assert.equal(low.getAttribute("aria-pressed"), "false")
})

test("검색 전에는 안내 문구만 보인다", () => {
  render(<StoreInventoryPage2 />)
  assert.ok(screen.getByText("상품명이나 바코드로 조회해 주세요."))
})

test("검색어와 일치하는 결과가 없으면 안내 문구를 보여 준다", () => {
  render(<StoreInventoryPage2 />)
  fireEvent.change(screen.getByLabelText("상품명 또는 바코드"), { target: { value: "존재하지않는상품" } })
  fireEvent.click(screen.getByRole("button", { name: "조회" }))
  assert.ok(screen.getByText("조회된 상품이 없습니다."))
})

test("검색하면 표에 상품명·규격·매장 재고·창고 재고·최근 입고일이 보인다", () => {
  render(<StoreInventoryPage2 />)
  fireEvent.click(screen.getByRole("button", { name: "조회" }))
  assert.ok(screen.getByRole("columnheader", { name: "상품명" }))
  assert.ok(screen.getByRole("columnheader", { name: "규격" }))
  assert.ok(screen.getByRole("columnheader", { name: "매장 재고" }))
  assert.ok(screen.getByRole("columnheader", { name: "창고 재고" }))
  assert.ok(screen.getByRole("columnheader", { name: "최근 입고일" }))
  assert.ok(screen.getAllByText("클래식 화이트 티셔츠").length > 0)
  assert.ok(screen.getByText("캔버스 크로스백"))
  assert.ok(screen.getByText("2026-09-21"))
})

test("매장 재고가 0인 줄에는 품절 배지가 붙는다", () => {
  render(<StoreInventoryPage2 />)
  fireEvent.click(screen.getByRole("button", { name: "조회" }))
  assert.ok(screen.getAllByText("품절").length > 1)
})

test("매장 재고가 3개 이하인 줄에는 부족 배지가 붙는다", () => {
  render(<StoreInventoryPage2 />)
  fireEvent.click(screen.getByRole("button", { name: "조회" }))
  assert.ok(screen.getAllByText("부족").length > 1)
})

test("품절 칩을 누르면 매장 재고가 0인 상품만 남는다", () => {
  render(<StoreInventoryPage2 />)
  fireEvent.click(screen.getByRole("button", { name: "조회" }))
  fireEvent.click(screen.getByRole("button", { name: "품절" }))
  const rows = screen.getAllByRole("row").slice(1)
  assert.ok(rows.length > 0)
  for (const row of rows) {
    assert.ok(row.textContent?.includes("품절"))
  }
})

test("줄을 누르면 상세로 이동하는 링크가 있다", () => {
  render(<StoreInventoryPage2 />)
  fireEvent.click(screen.getByRole("button", { name: "조회" }))
  const link = screen.getAllByRole("link", { name: "클래식 화이트 티셔츠" })[0]
  assert.equal(link.getAttribute("href"), "#")
})

test("데모 데이터는 8건보다 많다", () => {
  render(<StoreInventoryPage2 />)
  fireEvent.click(screen.getByRole("button", { name: "조회" }))
  const rows = screen.getAllByRole("row").slice(1)
  assert.ok(rows.length > 8)
})
