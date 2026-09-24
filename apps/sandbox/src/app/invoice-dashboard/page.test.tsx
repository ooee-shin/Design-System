import "@/test-setup"

import assert from "node:assert/strict"
import test, { afterEach } from "node:test"

import React from "react"
import { cleanup, render } from "@testing-library/react"

import InvoiceDashboardPage from "./page"

afterEach(() => {
  cleanup()
})

test("화면 제목이 제목으로 잡힌다", () => {
  const view = render(<InvoiceDashboardPage />)
  assert.ok(view.getByRole("heading", { level: 1, name: "자동 송장 API 대시보드" }), "화면 제목이 없다")
})

test("오늘 발급·배송 중·배송 완료·예외 건수를 보인다", () => {
  const view = render(<InvoiceDashboardPage />)
  for (const label of ["오늘 발급", "배송 중", "배송 완료", "예외"]) {
    assert.ok(view.getAllByText(label).length > 0, `${label} 요약이 없다`)
  }
})

test("송장 조회로 가는 링크가 링크로 잡힌다", () => {
  const view = render(<InvoiceDashboardPage />)
  const links = view.getAllByRole("link", { name: "송장 조회" })
  assert.ok(links.length > 0, "송장 조회 링크가 없다")
  for (const link of links) {
    assert.equal(link.getAttribute("href"), "/invoice-lookup", "송장 조회 링크의 목적지가 다르다")
  }
})

test("최근 발급 송장 표가 송장번호마다 상세로 가는 링크를 갖는다", () => {
  const view = render(<InvoiceDashboardPage />)
  assert.ok(view.getByRole("table"), "최근 발급 송장 표가 없다")
  const link = view.getByRole("link", { name: "612345678901" })
  assert.equal(link.getAttribute("href"), "/invoice-detail", "송장번호 링크의 목적지가 다르다")
})
