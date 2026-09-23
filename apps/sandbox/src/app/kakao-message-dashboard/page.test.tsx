import "@/test-setup";

import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";

import KakaoMessageDashboardPage from "./page";

afterEach(cleanup);

test("화면 제목이 heading 으로 잡힌다", () => {
  render(<KakaoMessageDashboardPage />);
  assert.ok(screen.getByRole("heading", { name: "카카오톡 메시지 이력" }), "제목을 찾지 못했다");
});

test("연동 상태 배지가 보인다", () => {
  render(<KakaoMessageDashboardPage />);
  assert.ok(screen.getByText("연동됨"), "연동 상태 배지를 찾지 못했다");
});

test("검색 입력과 조회 버튼을 접근 가능한 이름으로 찾을 수 있다", () => {
  render(<KakaoMessageDashboardPage />);
  assert.ok(screen.getByLabelText("수신자 또는 메시지 검색"), "검색 입력을 찾지 못했다");
  assert.ok(screen.getByRole("button", { name: "조회" }), "조회 버튼을 찾지 못했다");
});

test("발송 상태 필터 칩 넷을 접근 가능한 이름으로 찾을 수 있다", () => {
  render(<KakaoMessageDashboardPage />);
  for (const label of ["전체", "발송 성공", "발송 실패", "발송 대기"]) {
    assert.ok(screen.getByRole("button", { name: label }), `${label} 칩을 찾지 못했다`);
  }
});

test("전체 필터가 기본으로 눌린 상태다", () => {
  render(<KakaoMessageDashboardPage />);
  const allChip = screen.getByRole("button", { name: "전체" });
  assert.equal(allChip.getAttribute("aria-pressed"), "true", "전체 칩이 기본으로 눌려 있지 않다");
});

test("메시지 이력 표의 열 제목이 보인다", () => {
  render(<KakaoMessageDashboardPage />);
  const table = within(screen.getByRole("table"));
  for (const label of ["구분", "수신자", "메시지 내용", "발송 시각", "상태"]) {
    assert.ok(table.getByText(label), `${label} 열 제목을 찾지 못했다`);
  }
});

test("예시 메시지 이력이 렌더된다", () => {
  render(<KakaoMessageDashboardPage />);
  const table = within(screen.getByRole("table"));
  assert.ok(table.getAllByText("김서연").length > 0, "예시 수신자를 찾지 못했다");
  assert.ok(table.getByText("주문하신 상품이 발송되었습니다."), "예시 메시지 내용을 찾지 못했다");
});

test("방향 필터 칩 셋을 찾을 수 있고 모든 방향이 기본으로 눌려 있다", () => {
  render(<KakaoMessageDashboardPage />);
  for (const label of ["모든 방향", "보낸 메시지", "받은 메시지"]) {
    assert.ok(screen.getByRole("button", { name: label }), `${label} 칩을 찾지 못했다`);
  }
  assert.equal(screen.getByRole("button", { name: "모든 방향" }).getAttribute("aria-pressed"), "true", "모든 방향 칩이 기본으로 눌려 있지 않다");
});

test("받은 메시지 이력이 예시로 렌더된다", () => {
  render(<KakaoMessageDashboardPage />);
  const table = within(screen.getByRole("table"));
  assert.ok(table.getByText("배송 언제 도착하나요?"), "받은 메시지를 찾지 못했다");
});

test("받은 메시지 필터를 누르면 보낸 메시지가 사라진다", () => {
  render(<KakaoMessageDashboardPage />);
  fireEvent.click(screen.getByRole("button", { name: "받은 메시지" }));
  const table = within(screen.getByRole("table"));
  assert.ok(table.getByText("배송 언제 도착하나요?"), "받은 메시지가 남아 있지 않다");
  assert.equal(table.queryByText("주문하신 상품이 발송되었습니다."), null, "보낸 메시지가 걸러지지 않았다");
});

test("보낸 메시지 필터를 누르면 받은 메시지가 사라진다", () => {
  render(<KakaoMessageDashboardPage />);
  fireEvent.click(screen.getByRole("button", { name: "보낸 메시지" }));
  const table = within(screen.getByRole("table"));
  assert.equal(table.queryByText("배송 언제 도착하나요?"), null, "받은 메시지가 걸러지지 않았다");
});

test("발송 상태 필터를 누르면 다른 상태의 메시지가 사라진다", () => {
  render(<KakaoMessageDashboardPage />);
  fireEvent.click(screen.getByRole("button", { name: "발송 실패" }));
  const table = within(screen.getByRole("table"));
  assert.ok(table.getByText("박하은"), "발송 실패 메시지가 남아 있지 않다");
  assert.equal(table.queryByText("김서연"), null, "발송 성공 메시지가 걸러지지 않았다");
});

test("검색 후 조회를 누르면 일치하지 않는 이력이 사라진다", () => {
  render(<KakaoMessageDashboardPage />);
  fireEvent.change(screen.getByLabelText("수신자 또는 메시지 검색"), { target: { value: "이도윤" } });
  fireEvent.click(screen.getByRole("button", { name: "조회" }));
  const table = within(screen.getByRole("table"));
  assert.ok(table.getByText("이도윤"), "검색한 수신자가 남아 있지 않다");
  assert.equal(table.queryByText("김서연"), null, "검색어와 다른 수신자가 걸러지지 않았다");
});

test("검색 결과가 없으면 안내 문구가 보인다", () => {
  render(<KakaoMessageDashboardPage />);
  fireEvent.change(screen.getByLabelText("수신자 또는 메시지 검색"), { target: { value: "존재하지않는이름" } });
  fireEvent.click(screen.getByRole("button", { name: "조회" }));
  const messages = screen.getAllByText("조건에 맞는 메시지 이력이 없습니다.");
  assert.ok(messages.length > 0, "빈 결과 안내 문구를 찾지 못했다");
});
