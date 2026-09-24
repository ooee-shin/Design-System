import "@/test-setup";
import React from "react";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import NikeRunLocationPage from "./page";

afterEach(cleanup);

test("화면 제목이 heading 으로 잡힌다", () => {
  render(<NikeRunLocationPage />);
  assert.ok(screen.getByRole("heading", { name: "위치 정보 설정" }), "제목이 없습니다");
});

test("위치 정보 사용 스위치는 처음 켜져 있다", () => {
  render(<NikeRunLocationPage />);
  assert.equal(screen.getByRole("switch", { name: "위치 정보 사용" }).getAttribute("aria-checked"), "true");
});

test("수집 시점 두 갈래가 있고 기본은 앱을 사용하는 동안만이다", () => {
  render(<NikeRunLocationPage />);
  assert.equal(screen.getByRole("radio", { name: "앱을 사용하는 동안만" }).getAttribute("aria-checked"), "true");
  assert.equal(screen.getByRole("radio", { name: /항상 허용/ }).getAttribute("aria-checked"), "false");
});

test("약관 링크와 설정 저장 버튼이 이름으로 찾아진다", () => {
  render(<NikeRunLocationPage />);
  assert.ok(screen.getByRole("link", { name: "위치기반서비스 이용약관 보기" }));
  assert.ok(screen.getByRole("button", { name: "설정 저장" }));
});

test("저장하면 저장 안내가 나온다", () => {
  render(<NikeRunLocationPage />);
  assert.equal(screen.queryByRole("status"), null);
  fireEvent.click(screen.getByRole("button", { name: "설정 저장" }));
  assert.match(screen.getByRole("status").textContent ?? "", /위치 정보 설정을 저장했어요/);
});
