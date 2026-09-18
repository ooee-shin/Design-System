import "@/test-setup";

import assert from "node:assert/strict";
import test, { afterEach } from "node:test";

import React from "react";
import { cleanup, render, within } from "@testing-library/react";

import AttendancePayrollSettlementPage from "./page";

afterEach(() => {
  cleanup();
});

test("화면 제목이 보인다", () => {
  const view = render(<AttendancePayrollSettlementPage />);

  assert.ok(view.getByRole("heading", { name: "근태·급여 정산" }), "화면 제목이 heading으로 잡히지 않았다");
  assert.ok(
    view.getByText("기간을 골라 직원별 근무 시간과 급여를 확인합니다"),
    "화면 설명 문구가 보이지 않는다",
  );
});

test("기간과 매장 필터가 기본값과 함께 보인다", () => {
  const view = render(<AttendancePayrollSettlementPage />);

  const periodSelect = view.getByRole("combobox", { name: "기간" });
  const storeSelect = view.getByRole("combobox", { name: "매장" });

  assert.match(periodSelect.textContent ?? "", /이번 달/, "기간 필터의 기본값이 이번 달이 아니다");
  assert.match(storeSelect.textContent ?? "", /강남점/, "매장 필터의 기본값이 강남점이 아니다");
});

test("내보내기 버튼이 보인다", () => {
  const view = render(<AttendancePayrollSettlementPage />);

  assert.ok(view.getByRole("button", { name: "내보내기" }), "내보내기 버튼이 보이지 않는다");
});

test("총 근무 시간과 급여 합계를 보기 값으로 보여 준다", () => {
  const view = render(<AttendancePayrollSettlementPage />);

  assert.ok(view.getByText("총 근무 시간"), "총 근무 시간 라벨이 보이지 않는다");
  assert.ok(view.getByText("급여 합계"), "급여 합계 라벨이 보이지 않는다");
  assert.ok(view.getByText("1,920시간"), "총 근무 시간 값에 천 단위 쉼표가 없다");
  assert.ok(view.getByText("19,680,000원"), "급여 합계 값에 천 단위 쉼표가 없다");
});

test("표 칸 머리글이 직원·시급·근무 시간·급여·상태 순서로 보인다", () => {
  const view = render(<AttendancePayrollSettlementPage />);

  assert.ok(view.getByRole("columnheader", { name: "직원" }));
  assert.ok(view.getByRole("columnheader", { name: "시급" }));
  assert.ok(view.getByRole("columnheader", { name: "근무 시간" }));
  assert.ok(view.getByRole("columnheader", { name: "급여" }));
  assert.ok(view.getByRole("columnheader", { name: "상태" }));
});

test("표에 직원 다섯 줄이 보기 값으로 보이고 한 줄을 누르면 그 직원을 가리키는 링크로 찾아진다", () => {
  const view = render(<AttendancePayrollSettlementPage />);

  const names = ["김민준", "이서연", "박도윤", "최지우", "정하은"];
  for (const name of names) {
    assert.ok(view.getByRole("link", { name }), `${name} 행을 여는 링크가 보이지 않는다`);
  }
});

test("직원 행을 여는 링크는 키보드 포커스를 받을 수 있다", () => {
  const view = render(<AttendancePayrollSettlementPage />);

  const link = view.getByRole("link", { name: "김민준" });
  link.focus();

  assert.equal(document.activeElement, link, "직원 행 링크가 키보드 포커스를 받지 못한다");
});

test("표의 각 행은 직원 행을 여는 링크 하나로만 찾아지고 다른 상호작용 요소와 겹치지 않는다", () => {
  const view = render(<AttendancePayrollSettlementPage />);

  const rows = view.container.querySelectorAll("tbody tr");
  assert.equal(rows.length, 5, "표 행 개수가 다섯이 아니다");

  for (const row of Array.from(rows)) {
    const rowLinks = within(row as HTMLElement).getAllByRole("link");
    assert.equal(rowLinks.length, 1, "표 행 하나에는 행을 여는 링크가 하나만 있어야 한다");
  }
});

test("시급과 급여가 원 단위로 천 단위 쉼표와 함께 보인다", () => {
  const view = render(<AttendancePayrollSettlementPage />);

  assert.ok(view.getByText("10,500원"), "김민준 시급에 천 단위 쉼표가 없다");
  assert.ok(view.getByText("1,806,000원"), "김민준 급여에 천 단위 쉼표가 없다");
});

test("상태가 확정·대기·보류 배지로 보인다", () => {
  const view = render(<AttendancePayrollSettlementPage />);

  assert.equal(view.getAllByText("확정").length, 2, "확정 배지 개수가 다르다");
  assert.equal(view.getAllByText("대기").length, 2, "대기 배지 개수가 다르다");
  assert.equal(view.getAllByText("보류").length, 1, "보류 배지 개수가 다르다");
});

test("표 아래에 페이지 이동이 1 / 3과 이전·다음 버튼으로 보인다", () => {
  const view = render(<AttendancePayrollSettlementPage />);

  assert.ok(view.getByText("1 / 3"), "페이지 표시가 보이지 않는다");
  assert.ok(view.getByRole("button", { name: "이전" }), "이전 버튼이 보이지 않는다");
  assert.ok(view.getByRole("button", { name: "다음" }), "다음 버튼이 보이지 않는다");
});
