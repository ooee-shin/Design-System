import "@/test-setup";
import React from "react";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { cleanup, render, screen } from "@testing-library/react";

import NikeRunRecordsPage from "./page";

afterEach(cleanup);

test("화면 제목이 heading 으로 잡힌다", () => {
  render(<NikeRunRecordsPage />);
  assert.ok(screen.getByRole("heading", { name: "러닝 기록" }), "제목이 없습니다");
});

test("기록 표에 머리 네 칸과 예시 세 줄이 있다", () => {
  render(<NikeRunRecordsPage />);
  for (const name of ["날짜", "거리", "시간", "평균 페이스"]) {
    assert.ok(screen.getByRole("columnheader", { name }), `${name} 머리 칸`);
  }
  assert.equal(screen.getAllByRole("row").length, 4);
});

test("누적 거리와 이번 주 최고 배지가 보인다", () => {
  render(<NikeRunRecordsPage />);
  assert.ok(screen.getByText("13.50 km"));
  assert.ok(screen.getByText("이번 주 최고"));
});

test("러닝 기록 저장 링크가 이름으로 찾아진다", () => {
  render(<NikeRunRecordsPage />);
  assert.equal(screen.getByRole("link", { name: "러닝 기록 저장" }).getAttribute("href"), "/nike-run-save");
});
