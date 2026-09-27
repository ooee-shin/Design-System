import "@/test-setup";
import React from "react";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { cleanup, render, screen } from "@testing-library/react";
import ShadeCourseDetailPage from "./page";

afterEach(cleanup);

test("화면 제목이 heading 으로 잡힌다", () => {
  render(<ShadeCourseDetailPage />);
  assert.ok(screen.getByRole("heading", { level: 1, name: "그늘 코스 상세" }), "제목 heading 이 없다");
});

test("코스 이름과 요약(거리·예상 시간·오르막)이 보인다", () => {
  render(<ShadeCourseDetailPage />);
  assert.ok(screen.getByRole("heading", { name: "서울숲 순환 코스" }), "코스 이름이 없다");
  for (const text of ["7.5km", "약 45분", "38m"]) {
    assert.ok(screen.getByText(text), `${text} 가 없다`);
  }
});

test("시간대 네 개마다 그늘 비율 막대가 있다", () => {
  render(<ShadeCourseDetailPage />);
  const meters = screen.getAllByRole("meter");
  assert.equal(meters.length, 4, "그늘 비율 막대가 네 개가 아니다");
  assert.equal(screen.getByRole("meter", { name: "오후 7시 그늘 비율" }).getAttribute("aria-valuenow"), "78");
  assert.equal(screen.getAllByText("쾌적").length, 3, "체감 더위 배지가 맞지 않다");
});

test("구간별 그늘 안내가 세 구간이다", () => {
  render(<ShadeCourseDetailPage />);
  assert.equal(screen.getAllByRole("listitem").length, 4 + 3, "시간대 4 + 구간 3 이 아니다");
  assert.ok(screen.getByText("그늘 적음"), "그늘 적음 구간이 없다");
});

test("뒤로와 지도로 돌아가기 링크가 지도로 가고 러닝 시작 버튼이 있다", () => {
  render(<ShadeCourseDetailPage />);
  assert.equal(screen.getByRole("link", { name: "뒤로" }).getAttribute("href"), "/shade-course-map");
  assert.equal(screen.getByRole("link", { name: "지도로 돌아가기" }).getAttribute("href"), "/shade-course-map");
  assert.ok(screen.getByRole("button", { name: "이 코스로 러닝 시작" }), "러닝 시작 버튼이 없다");
});
