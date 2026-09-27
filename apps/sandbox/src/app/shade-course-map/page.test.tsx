import "@/test-setup";
import React from "react";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import ShadeCourseMapPage from "./page";

afterEach(cleanup);

test("화면 제목이 heading 으로 잡힌다", () => {
  render(<ShadeCourseMapPage />);
  assert.ok(screen.getByRole("heading", { level: 1, name: "그늘 코스 지도" }), "제목 heading 이 없다");
});

test("시간 칩 네 개가 버튼으로 잡히고 오후 7시가 처음 켜져 있다", () => {
  render(<ShadeCourseMapPage />);
  for (const name of ["오후 6시", "오후 7시", "오후 8시", "내일 오전 8시"]) {
    assert.ok(screen.getByRole("button", { name }), `${name} 버튼이 없다`);
  }
  assert.equal(screen.getByRole("button", { name: "오후 7시" }).getAttribute("aria-pressed"), "true");
});

test("코스 칩 세 개가 있고 서울숲 순환 코스가 처음 켜져 있다", () => {
  render(<ShadeCourseMapPage />);
  for (const name of ["서울숲 순환 코스", "뚝섬 한강공원 강변 코스", "청계천 상류 왕복 코스"]) {
    assert.ok(screen.getByRole("button", { name }), `${name} 버튼이 없다`);
  }
  assert.equal(screen.getByRole("button", { name: "서울숲 순환 코스" }).getAttribute("aria-pressed"), "true");
});

test("코스를 고르면 요약 카드의 그늘 비율과 체감 더위가 바뀐다", () => {
  render(<ShadeCourseMapPage />);
  assert.equal(screen.getByRole("meter").getAttribute("aria-valuenow"), "78");
  fireEvent.click(screen.getByRole("button", { name: "뚝섬 한강공원 강변 코스" }));
  assert.equal(screen.getByRole("meter").getAttribute("aria-valuenow"), "34", "그늘 비율이 바뀌지 않았다");
  assert.ok(screen.getByText("더움"), "체감 더위 배지가 바뀌지 않았다");
});

test("지도 도식이 이미지로 잡힌다", () => {
  render(<ShadeCourseMapPage />);
  assert.ok(screen.getByRole("img", { name: /코스 선과 오후 7시 그림자 영역/ }), "지도 도식이 없다");
});

test("코스 상세 보기와 뒤로 링크가 있고 러닝 시작 버튼이 있다", () => {
  render(<ShadeCourseMapPage />);
  assert.equal(screen.getByRole("link", { name: "코스 상세 보기" }).getAttribute("href"), "/shade-course-detail");
  assert.equal(screen.getByRole("link", { name: "뒤로" }).getAttribute("href"), "/shade-map-running");
  assert.ok(screen.getByRole("button", { name: "이 코스로 러닝 시작" }), "러닝 시작 버튼이 없다");
});
