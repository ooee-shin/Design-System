import "@/test-setup";

import assert from "node:assert/strict";
import test from "node:test";

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import React from "react";

import AnnualLeavePage from "./page";

test.afterEach(() => cleanup());

test("화면 제목이 heading으로 잡힌다", () => {
  render(<AnnualLeavePage />);

  assert.ok(screen.getByRole("heading", { level: 1, name: "연차 관리" }), "제목 「연차 관리」가 heading으로 잡혀야 한다");
});

test("연도 고르기와 직원 이름 검색이 접근 가능한 이름으로 잡힌다", () => {
  render(<AnnualLeavePage />);

  const year = screen.getByLabelText("연도");
  assert.match(year.textContent ?? "", /2026년/, "연도 Control 에 기본값 2026년이 보여야 한다");
  assert.ok(screen.getByLabelText("직원 이름 검색"), "직원 이름 검색 입력이 이름으로 잡혀야 한다");
});

test("「연차 신청」 버튼이 요청의 문구 그대로 놓인다", () => {
  render(<AnnualLeavePage />);

  assert.ok(screen.getByRole("button", { name: "연차 신청" }), "「연차 신청」 버튼이 있어야 한다");
});

test("직원 목록 항목이 이름·직급·남은 연차 일수를 보인다", () => {
  render(<AnnualLeavePage />);

  const list = within(screen.getByRole("list", { name: "직원 목록" }));
  const row = list.getByRole("button", { name: /김서연/ });

  assert.match(row.textContent ?? "", /김서연/, "이름이 보여야 한다");
  assert.match(row.textContent ?? "", /점장/, "직급이 보여야 한다");
  assert.match(row.textContent ?? "", /6\.5일/, "남은 연차 일수가 보여야 한다");
});

test("고른 직원이 선택 상태로 남는다", () => {
  render(<AnnualLeavePage />);

  const list = within(screen.getByRole("list", { name: "직원 목록" }));
  const first = list.getByRole("button", { name: /김서연/ });
  const second = list.getByRole("button", { name: /이지민/ });

  assert.equal(first.getAttribute("aria-pressed"), "true", "처음 고른 직원이 선택 상태여야 한다");
  assert.equal(second.getAttribute("aria-pressed"), "false", "고르지 않은 직원은 선택 상태가 아니어야 한다");

  fireEvent.click(second);

  assert.equal(second.getAttribute("aria-pressed"), "true", "새로 고른 직원이 선택 상태로 남아야 한다");
  assert.equal(first.getAttribute("aria-pressed"), "false", "앞서 고른 직원의 선택은 풀려야 한다");
});

test("요약 세 칸이 고른 직원의 자료에서 센 잔여·사용·총 연차 일수를 보인다", () => {
  render(<AnnualLeavePage />);

  const summary = within(screen.getByRole("region", { name: "연차 요약" }));

  assert.ok(summary.getByText("잔여"), "잔여 칸이 있어야 한다");
  assert.ok(summary.getByText("6.5일"), "잔여는 총 15일에서 승인된 8.5일을 뺀 6.5일이어야 한다");
  assert.ok(summary.getByText("사용"), "사용 칸이 있어야 한다");
  assert.ok(summary.getByText("8.5일"), "사용은 승인된 신청의 일수를 더한 8.5일이어야 한다");
  assert.ok(summary.getByText("총 연차"), "총 연차 칸이 있어야 한다");
  assert.ok(summary.getByText("15일"), "총 연차는 15일이어야 한다");
});

test("고른 직원을 바꾸면 요약 세 칸이 그 직원의 자료를 센다", () => {
  render(<AnnualLeavePage />);

  fireEvent.click(within(screen.getByRole("list", { name: "직원 목록" })).getByRole("button", { name: /정민수/ }));

  const summary = within(screen.getByRole("region", { name: "연차 요약" }));

  assert.ok(summary.getByText("4일"), "정민수의 잔여는 11일에서 승인된 7일을 뺀 4일이어야 한다");
  assert.ok(summary.getByText("7일"), "정민수의 사용은 7일이어야 한다");
  assert.ok(summary.getByText("11일"), "정민수의 총 연차는 11일이어야 한다");
});

test("표가 신청일·구분·기간·일수·상태를 열로 보인다", () => {
  render(<AnnualLeavePage />);

  const table = within(screen.getByRole("table"));

  for (const column of ["신청일", "구분", "기간", "일수", "상태"]) {
    assert.ok(table.getByRole("columnheader", { name: column }), `${column} 열이 있어야 한다`);
  }

  const first = table.getAllByRole("row")[1];
  assert.match(first.textContent ?? "", /2026\.01\.05/, "신청일이 보여야 한다");
  assert.match(first.textContent ?? "", /연차/, "구분이 보여야 한다");
  assert.match(first.textContent ?? "", /2026\.01\.12 ~ 2026\.01\.13/, "기간이 보여야 한다");
  assert.match(first.textContent ?? "", /2일/, "일수가 보여야 한다");
  assert.match(first.textContent ?? "", /승인/, "상태가 보여야 한다");
});

test("구분은 연차·반차·병가로, 상태는 승인·대기·반려로 갈린다", () => {
  render(<AnnualLeavePage />);

  // 세 구분과 세 상태가 한 쪽에 모두 놓인 직원을 고른다.
  fireEvent.click(within(screen.getByRole("list", { name: "직원 목록" })).getByRole("button", { name: /이지민/ }));

  const table = within(screen.getByRole("table"));

  for (const kind of ["연차", "반차", "병가"]) {
    assert.ok(table.getAllByText(kind).length > 0, `구분 ${kind}가 보여야 한다`);
  }
  for (const status of ["승인", "대기", "반려"]) {
    assert.ok(table.getAllByText(status).length > 0, `상태 ${status}가 보여야 한다`);
  }
});

test("표 아래 페이지 이동으로 다음 쪽의 신청 내역을 본다", () => {
  render(<AnnualLeavePage />);

  const pagination = within(screen.getByRole("navigation", { name: "페이지 이동" }));

  assert.equal(
    (screen.getByRole("button", { name: "이전 페이지" }) as HTMLButtonElement).disabled,
    true,
    "첫 쪽에서는 이전 페이지를 누를 수 없어야 한다",
  );

  fireEvent.click(pagination.getByRole("button", { name: "2페이지" }));

  const table = within(screen.getByRole("table"));
  assert.ok(table.getByText("2026.10.02 오후"), "두 번째 쪽에 여섯 번째 이후의 신청 내역이 보여야 한다");
  assert.equal(
    (screen.getByRole("button", { name: "다음 페이지" }) as HTMLButtonElement).disabled,
    true,
    "마지막 쪽에서는 다음 페이지를 누를 수 없어야 한다",
  );
});

test("직원 이름 검색이 왼쪽 목록을 좁힌다", () => {
  render(<AnnualLeavePage />);

  fireEvent.change(screen.getByLabelText("직원 이름 검색"), { target: { value: "이지민" } });

  const list = within(screen.getByRole("list", { name: "직원 목록" }));
  assert.ok(list.getByRole("button", { name: /이지민/ }), "찾는 이름의 직원이 남아야 한다");
  assert.equal(list.queryByRole("button", { name: /김서연/ }), null, "이름이 맞지 않는 직원은 빠져야 한다");
});
