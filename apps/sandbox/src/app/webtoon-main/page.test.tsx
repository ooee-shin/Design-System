import "@/test-setup"

import { test, afterEach } from "node:test"
import assert from "node:assert/strict"
import React from "react"
import { cleanup, render, screen, fireEvent, within } from "@testing-library/react"

import WebtoonMainPage from "./page"

afterEach(() => {
  cleanup()
})

test("화면 제목이 웹툰으로 잡힌다", () => {
  render(<WebtoonMainPage />)
  assert.ok(screen.getByRole("heading", { level: 1, name: "웹툰" }), "h1 이 있어야 한다")
})

test("검색 입력과 로그인 버튼이 접근 가능한 이름으로 찾아진다", () => {
  render(<WebtoonMainPage />)
  const search = screen.getByLabelText("웹툰 검색") as HTMLInputElement
  assert.equal(search.placeholder, "웹툰, 작가 검색", "검색 입력의 placeholder 가 렌더된다")
  assert.ok(screen.getByRole("button", { name: "로그인" }), "로그인 버튼이 있어야 한다")
})

test("요일 선택 칩 여덟 개가 있고 기본값은 전체가 켜져 있다", () => {
  render(<WebtoonMainPage />)
  const days = ["전체", "월", "화", "수", "목", "금", "토", "일"]
  for (const day of days) {
    assert.ok(screen.getByRole("button", { name: day }), `${day} 칩이 있어야 한다`)
  }
  assert.equal(screen.getByRole("button", { name: "전체" }).getAttribute("aria-pressed"), "true")
  assert.equal(screen.getByRole("button", { name: "월" }).getAttribute("aria-pressed"), "false")
})

test("인기 급상승 웹툰 다섯 편이 순위·제목·작가·장르·평점과 함께 렌더된다", () => {
  render(<WebtoonMainPage />)
  const ranking = within(screen.getByRole("heading", { name: "인기 급상승 웹툰" }).closest("section") as HTMLElement)
  assert.ok(ranking.getByRole("link", { name: "나 혼자만 레벨업" }), "1위 제목이 링크로 있어야 한다")
  assert.ok(ranking.getByText("추공"), "작가가 렌더되어야 한다")
  assert.ok(ranking.getByText("액션"), "장르 배지가 렌더되어야 한다")
  assert.ok(ranking.getByText("9.99"), "평점이 렌더되어야 한다")
  assert.ok(ranking.getByRole("link", { name: "참교육" }), "5위 제목이 링크로 있어야 한다")
})

test("기본값은 전체라 오늘의 웹툰에 여덟 편이 모두 보인다", () => {
  render(<WebtoonMainPage />)
  const today = within(screen.getByRole("heading", { name: "오늘의 웹툰" }).closest("section") as HTMLElement)
  assert.ok(today.getByRole("link", { name: "신의 탑" }))
  assert.ok(today.getByRole("link", { name: "프리드로우" }))
  assert.equal(today.getAllByRole("listitem").length, 8, "여덟 편이 모두 렌더되어야 한다")
})

test("요일 칩을 누르면 그 요일의 오늘의 웹툰만 남는다", () => {
  render(<WebtoonMainPage />)
  fireEvent.click(screen.getByRole("button", { name: "화" }))

  assert.equal(screen.getByRole("button", { name: "화" }).getAttribute("aria-pressed"), "true")
  assert.equal(screen.getByRole("button", { name: "전체" }).getAttribute("aria-pressed"), "false")

  const today = within(screen.getByRole("heading", { name: "오늘의 웹툰" }).closest("section") as HTMLElement)
  assert.ok(today.getByRole("link", { name: "외모지상주의" }), "화요일 웹툰은 남아야 한다")
  assert.equal(today.queryByRole("link", { name: "복학왕" }), null, "수요일 웹툰은 사라져야 한다")
  assert.equal(today.getAllByRole("listitem").length, 1)
})
