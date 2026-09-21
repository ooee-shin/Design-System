import "@/test-setup";

import assert from "node:assert/strict";
import { afterEach, test } from "node:test";

import { cleanup, render, screen, within } from "@testing-library/react";
import React from "react";

import WeeklySchedulePage from "./page";

afterEach(cleanup);

function rowOf(name: string) {
  const row = screen.getByRole("rowheader", { name: new RegExp(`^${name}`) }).closest("tr");
  assert.ok(row, `${name}의 행이 있어야 한다`);
  return row;
}

/** 월~일 순서의 근무 칸 일곱. */
function cellsOf(name: string) {
  return within(rowOf(name)).getAllByRole("cell");
}

test("화면 제목이 스케줄 관리로 잡힌다", () => {
  render(<WeeklySchedulePage />);
  assert.ok(screen.getByRole("heading", { level: 1, name: "스케줄 관리" }), "스케줄 관리 제목이 있어야 한다");
});

test("매장과 주를 고르는 칸이 이름으로 찾아진다", () => {
  render(<WeeklySchedulePage />);
  assert.ok(screen.getByLabelText("매장"), "매장 고르기가 있어야 한다");
  assert.ok(screen.getByLabelText("주"), "주 고르기가 있어야 한다");
});

test("주 고르기는 2026.09.21 ~ 09.27 로 시작한다", () => {
  render(<WeeklySchedulePage />);
  assert.equal(screen.getByLabelText("주").textContent?.trim(), "2026.09.21 ~ 09.27", "주 고르기에 첫 주가 보여야 한다");
});

test("그 주의 합계로 총 근무 시간, 가산이 붙은 시간, 예상 인건비 셋을 보인다", () => {
  render(<WeeklySchedulePage />);
  const summary = new Map(
    screen.getAllByRole("term").map((term) => [term.textContent, term.nextElementSibling?.textContent]),
  );
  assert.deepEqual([...summary.keys()], ["총 근무 시간", "가산이 붙은 시간", "예상 인건비"], "합계 항목은 셋이어야 한다");
  assert.equal(summary.get("총 근무 시간"), "171시간", "총 근무 시간은 171시간이어야 한다");
  assert.equal(summary.get("가산이 붙은 시간"), "78시간", "가산이 붙은 시간은 78시간이어야 한다");
});

test("예상 인건비는 시급과 시간에 가산 배수를 곱해 계산한다", () => {
  render(<WeeklySchedulePage />);
  // 김서연 15,000원 × (평일 8시간 × 3 + 연장 1시간 × 1.5 × 3 + 휴일 8시간 × 1.5 + 휴일 초과 2시간 × 2) = 667,500원
  // 이준호 13,500원 × (평일 7시간 × 2 + 야간 1시간 × 1.5 × 2 + 연장·야간 1시간 × 2 × 2 + 휴일·야간 2시간 × 2 × 2 + 휴일 6시간 × 1.5 × 2) = 634,500원
  // 박지민 10,320원 × (평일 12시간 + 휴일 8시간 × 1.5) = 247,680원
  // 최유나 10,500원 × (평일 15시간 + 휴일 12시간 × 1.5) = 346,500원
  // 정하늘 11,000원 × (평일 7시간 + 휴일 16시간 × 1.5) = 341,000원
  // 한도윤 10,320원 × (평일 7시간 × 3 + 야간 1시간 × 1.5 × 3 + 휴일 6시간 × 1.5) = 356,040원
  const pay = screen.getByText("예상 인건비").nextElementSibling?.textContent;
  assert.equal(pay, "2,593,220원", "예상 인건비는 가산을 반영한 2,593,220원이어야 한다");
});

test("요일 머리는 월부터 일까지 날짜를 함께 적고 공휴일은 이름을 보인다", () => {
  render(<WeeklySchedulePage />);
  const headers = screen.getAllByRole("columnheader").map((header) => header.textContent);
  assert.deepEqual(
    headers,
    ["직원", "월 09.21", "화 09.22", "수 09.23", "목 09.24추석 연휴", "금 09.25추석", "토 09.26추석 연휴", "일 09.27"],
    "요일 머리는 월~일과 날짜, 공휴일 이름이어야 한다",
  );
  assert.ok(screen.getByText("추석"), "공휴일 이름 추석이 보여야 한다");
});

test("맨 왼쪽 칸에 직원 이름, 고용형태와 시급을 함께 보인다", () => {
  render(<WeeklySchedulePage />);
  assert.equal(
    screen.getByRole("rowheader", { name: /^김서연/ }).textContent,
    "김서연정직원 · 시급 15,000원",
    "정직원의 이름·고용형태·시급이 보여야 한다",
  );
  assert.equal(
    screen.getByRole("rowheader", { name: /^박지민/ }).textContent,
    "박지민알바 · 시급 10,320원",
    "알바의 이름·고용형태·시급이 보여야 한다",
  );
});

test("근무 칸에 일하는 시각과 시간 수를 보인다", () => {
  render(<WeeklySchedulePage />);
  const monday = cellsOf("김서연")[0];
  assert.ok(within(monday).getByText("09:00~18:00"), "근무 시각이 보여야 한다");
  assert.ok(within(monday).getByText("9시간"), "시간 수가 보여야 한다");
});

test("가산이 붙은 근무에만 배수 배지를 단다", () => {
  render(<WeeklySchedulePage />);
  const [seoyeonMonday, , , , seoyeonFriday] = cellsOf("김서연");
  assert.ok(within(seoyeonMonday).getByText("연장 1.5배"), "하루 8시간을 넘으면 연장 배지가 붙어야 한다");
  assert.ok(within(seoyeonFriday).getByText("휴일 1.5배"), "휴일 8시간 이내 배지가 붙어야 한다");
  assert.ok(within(seoyeonFriday).getByText("휴일 2배"), "휴일 8시간 초과분 배지가 붙어야 한다");

  const junhoMonday = cellsOf("이준호")[0];
  assert.ok(within(junhoMonday).getByText("야간 1.5배"), "22시 뒤 근무에는 야간 배지가 붙어야 한다");

  const yunaMonday = cellsOf("최유나")[0];
  assert.equal(within(yunaMonday).queryByText(/배$/), null, "가산이 없는 근무에는 배지가 없어야 한다");
});

test("쉬는 날은 빈 칸으로 둔다", () => {
  render(<WeeklySchedulePage />);
  const seoyeonThursday = cellsOf("김서연")[3];
  assert.equal(within(seoyeonThursday).queryByText(/~/), null, "쉬는 날에는 근무 시각이 없어야 한다");
  assert.equal(seoyeonThursday.textContent, "쉬는 날", "쉬는 날 칸에는 화면 낭독용 이름만 있어야 한다");
});

test("표 아래에 가산 규칙과 근거를 상수의 배수로 보인다", () => {
  render(<WeeklySchedulePage />);
  assert.ok(screen.getByText("가산 규칙"), "가산 규칙 이름이 보여야 한다");
  assert.ok(
    screen.getByText("연장근로 1.5배 · 야간근로 1.5배 · 휴일근로 8시간 이내 1.5배, 초과분 2배 · 근거 근로기준법 제56조"),
    "가산 규칙 줄이 요청의 배수와 근거를 보여야 한다",
  );
});
