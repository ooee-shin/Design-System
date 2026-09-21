import "@/test-setup";

import assert from "node:assert/strict";
import { afterEach, test } from "node:test";

import { cleanup, render, screen } from "@testing-library/react";
import React from "react";

import AttendanceKioskPage from "./page";

afterEach(() => {
  cleanup();
});

test("화면 제목이 강남점 heading으로 잡힌다", () => {
  render(<AttendanceKioskPage />);
  const heading = screen.getByRole("heading", { level: 1, name: "강남점" });
  assert.ok(heading, "매장 이름이 h1 제목으로 렌더되어야 한다");
});

test("머리글에 오늘 날짜와 지금 시각이 보기 값으로 선다", () => {
  render(<AttendanceKioskPage />);
  assert.ok(screen.getByText("2026년 9월 17일 (목)"), "오늘 날짜 보기 값이 렌더되어야 한다");
  assert.ok(screen.getByText("14:32"), "지금 시각 보기 값이 렌더되어야 한다");
});

test("근무 중 덩이 제목 옆에 인원 수 3명이 함께 선다", () => {
  render(<AttendanceKioskPage />);
  assert.ok(screen.getByRole("heading", { level: 2, name: "근무 중 3명" }), "근무 중 제목 옆에 3명이 적혀야 한다");
});

test("대기 중 덩이 제목 옆에 인원 수 4명이 함께 선다", () => {
  render(<AttendanceKioskPage />);
  assert.ok(screen.getByRole("heading", { level: 2, name: "대기 중 4명" }), "대기 중 제목 옆에 4명이 적혀야 한다");
});

test("근무 중인 직원 세 명마다 폭을 채우는 퇴근하기 버튼이 있다", () => {
  render(<AttendanceKioskPage />);
  const clockOutButtons = screen.getAllByRole("button", { name: /퇴근하기$/ });
  assert.equal(clockOutButtons.length, 3, "근무 중 칸이 세 개여야 한다");
  for (const name of ["김민서", "박도윤", "이서준"]) {
    const button = screen.getByRole("button", { name: `${name} 퇴근하기` });
    assert.equal(button.textContent, "퇴근하기", "버튼 문구는 퇴근하기여야 한다");
  }
});

test("대기 중인 직원 네 명마다 폭을 채우는 출근하기 버튼이 있다", () => {
  render(<AttendanceKioskPage />);
  const clockInButtons = screen.getAllByRole("button", { name: /출근하기$/ });
  assert.equal(clockInButtons.length, 4, "대기 중 칸이 네 개여야 한다");
  for (const name of ["최유나", "정하윤", "강지호", "오세아"]) {
    const button = screen.getByRole("button", { name: `${name} 출근하기` });
    assert.equal(button.textContent, "출근하기", "버튼 문구는 출근하기여야 한다");
  }
});
