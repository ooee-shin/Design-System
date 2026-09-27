import "@/test-setup";
import React from "react";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import ShadeMapRunningPage from "./page";

afterEach(cleanup);

test("화면 제목이 heading 으로 잡힌다", () => {
  render(<ShadeMapRunningPage />);
  assert.ok(screen.getByRole("heading", { level: 1, name: "그늘 지도 러닝" }), "제목 heading 이 없다");
});

test("시간 선택 칩 네 개가 버튼으로 잡히고 오후 7시가 처음 켜져 있다", () => {
  render(<ShadeMapRunningPage />);
  for (const name of ["오후 6시", "오후 7시", "오후 8시", "내일 오전 8시"]) {
    assert.ok(screen.getByRole("button", { name }), `${name} 버튼이 없다`);
  }
  assert.equal(screen.getByRole("button", { name: "오후 7시" }).getAttribute("aria-pressed"), "true");
  assert.equal(screen.getByRole("button", { name: "오후 6시" }).getAttribute("aria-pressed"), "false");
});

test("코스 카드 세 개가 그늘 비율 막대와 체감 더위 배지를 보여 준다", () => {
  render(<ShadeMapRunningPage />);
  assert.equal(screen.getAllByRole("listitem").length, 3, "코스 카드가 세 개가 아니다");
  assert.equal(screen.getAllByRole("meter").length, 3, "그늘 비율 막대가 세 개가 아니다");
  assert.equal(screen.getAllByText("체감 더위").length, 3, "체감 더위 줄이 세 개가 아니다");
  assert.ok(screen.getByRole("meter", { name: "서울숲 순환 코스 그늘 비율" }).getAttribute("aria-valuenow") === "78");
});

test("시간을 바꾸면 그늘 비율이 바뀐다", () => {
  render(<ShadeMapRunningPage />);
  fireEvent.click(screen.getByRole("button", { name: "오후 6시" }));
  assert.equal(
    screen.getByRole("meter", { name: "서울숲 순환 코스 그늘 비율" }).getAttribute("aria-valuenow"),
    "70",
    "오후 6시의 그늘 비율이 반영되지 않았다",
  );
  assert.equal(screen.getAllByText("더움").length, 2, "체감 더위 배지가 바뀌지 않았다");
});

test("러닝 시작 버튼이 있다", () => {
  render(<ShadeMapRunningPage />);
  assert.ok(screen.getByRole("button", { name: "러닝 시작" }), "러닝 시작 버튼이 없다");
});
