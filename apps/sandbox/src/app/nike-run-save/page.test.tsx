import "@/test-setup";
import React from "react";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import NikeRunSavePage from "./page";

afterEach(cleanup);

test("화면 제목이 heading 으로 잡힌다", () => {
  render(<NikeRunSavePage />);
  assert.ok(screen.getByRole("heading", { name: "러닝 기록 저장" }), "제목이 없습니다");
});

test("거리 입력의 기본값은 5.20 이고 필수다", () => {
  render(<NikeRunSavePage />);
  const input = screen.getByLabelText("거리") as HTMLInputElement;
  assert.equal(input.value, "5.20");
  assert.equal(input.required, true, "필수가 아닙니다");
});

test("거리 저장 버튼과 두 링크가 이름으로 찾아진다", () => {
  render(<NikeRunSavePage />);
  assert.ok(screen.getByRole("button", { name: "거리 저장" }));
  assert.ok(screen.getByRole("link", { name: "위치 정보 설정" }));
  assert.ok(screen.getByRole("link", { name: "기록 목록 보기" }));
});

test("저장하면 저장 안내가 나온다", () => {
  render(<NikeRunSavePage />);
  assert.equal(screen.queryByRole("status"), null);
  fireEvent.click(screen.getByRole("button", { name: "거리 저장" }));
  assert.match(screen.getByRole("status").textContent ?? "", /5\.20km를 저장했어요/);
});

test("거리를 비우면 저장할 수 없다", () => {
  render(<NikeRunSavePage />);
  fireEvent.change(screen.getByLabelText("거리"), { target: { value: "" } });
  assert.equal((screen.getByRole("button", { name: "거리 저장" }) as HTMLButtonElement).disabled, true);
});
