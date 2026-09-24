import "@/test-setup"

import assert from "node:assert/strict"
import test, { afterEach } from "node:test"

import React from "react"
import { cleanup, render } from "@testing-library/react"

import InvoiceDetailPage from "./page"

afterEach(() => {
  cleanup()
})

test("화면 제목이 제목으로 잡힌다", () => {
  const view = render(<InvoiceDetailPage />)
  assert.ok(view.getByRole("heading", { level: 1, name: "송장 상세" }), "화면 제목이 없다")
})

test("배송 정보와 배송 이력 두 덩이를 보인다", () => {
  const view = render(<InvoiceDetailPage />)
  assert.ok(view.getByRole("heading", { level: 2, name: "배송 정보" }), "배송 정보가 없다")
  assert.ok(view.getByRole("heading", { level: 2, name: "배송 이력" }), "배송 이력이 없다")
  assert.equal(view.getAllByRole("listitem").length, 4, "배송 이력 줄 수가 다르다")
})

test("송장 조회로 돌아가는 링크가 링크로 잡힌다", () => {
  const view = render(<InvoiceDetailPage />)
  const link = view.getByRole("link", { name: "송장 조회로 돌아가기" })
  assert.equal(link.getAttribute("href"), "/invoice-lookup", "돌아가는 링크의 목적지가 다르다")
})
