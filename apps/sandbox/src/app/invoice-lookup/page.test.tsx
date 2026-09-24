import "@/test-setup"

import assert from "node:assert/strict"
import test, { afterEach } from "node:test"

import React from "react"
import { cleanup, fireEvent, render } from "@testing-library/react"

import InvoiceLookupPage from "./page"

afterEach(() => {
  cleanup()
})

test("화면 제목이 제목으로 잡힌다", () => {
  const view = render(<InvoiceLookupPage />)
  assert.ok(view.getByRole("heading", { level: 1, name: "송장 조회" }), "화면 제목이 없다")
})

test("송장번호 입력이 필수이고 자리 문구와 최대 글자 수를 갖는다", () => {
  const view = render(<InvoiceLookupPage />)
  const input = view.getByLabelText(/송장번호/) as HTMLInputElement
  assert.equal(input.required, true, "송장번호가 필수가 아니다")
  assert.equal(input.getAttribute("placeholder"), "송장번호 12자리 입력")
  assert.equal(input.maxLength, 12, "최대 글자 수가 12가 아니다")
  assert.ok(view.getByPlaceholderText("송장번호 12자리 입력"))
})

test("조회 버튼이 제출 버튼으로 잡힌다", () => {
  const view = render(<InvoiceLookupPage />)
  const button = view.getByRole("button", { name: "조회" })
  assert.equal(button.getAttribute("type"), "submit", "조회 버튼이 제출 버튼이 아니다")
})

test("처음에는 조회 안내를 보이고 결과 표는 없다", () => {
  const view = render(<InvoiceLookupPage />)
  assert.ok(view.getByText("송장번호를 입력하고 조회를 누르세요."))
  assert.equal(view.queryByRole("table"), null, "조회 전에 결과 표가 있다")
})

test("송장번호를 조회하면 결과 표에 상세로 가는 링크를 보인다", () => {
  const view = render(<InvoiceLookupPage />)
  fireEvent.change(view.getByLabelText(/송장번호/), { target: { value: "612345678901" } })
  fireEvent.click(view.getByRole("button", { name: "조회" }))
  const link = view.getByRole("link", { name: "612345678901" })
  assert.equal(link.getAttribute("href"), "/invoice-detail", "송장번호 링크의 목적지가 다르다")
})

test("일치하는 송장이 없으면 없다고 알린다", () => {
  const view = render(<InvoiceLookupPage />)
  fireEvent.change(view.getByLabelText(/송장번호/), { target: { value: "999" } })
  fireEvent.click(view.getByRole("button", { name: "조회" }))
  assert.ok(view.getByText("일치하는 송장이 없습니다."), "결과 없음 안내가 없다")
})

test("대시보드로 가는 링크가 링크로 잡힌다", () => {
  const view = render(<InvoiceLookupPage />)
  const link = view.getByRole("link", { name: "대시보드" })
  assert.equal(link.getAttribute("href"), "/invoice-dashboard")
})
