import "@/test-setup";

import assert from "node:assert/strict";
import test, { afterEach } from "node:test";

import React from "react";
import { cleanup, fireEvent, render } from "@testing-library/react";

import TaxInvoicePage from "./page";

afterEach(() => {
  cleanup();
});

test("화면 제목이 heading으로 잡힌다", () => {
  const view = render(<TaxInvoicePage />);

  assert.ok(view.getByRole("heading", { level: 1, name: "세금계산서 발행" }), "화면 제목이 없다");
});

test("연월 고르기와 거르개, 줄 체크박스와 발행 버튼이 접근 가능한 이름으로 찾아진다", () => {
  const view = render(<TaxInvoicePage />);

  assert.ok(view.getByRole("combobox", { name: "연월" }), "연월 고르기가 없다");
  for (const label of ["전체", "발행 전", "발행 완료"]) {
    assert.ok(view.getByRole("button", { name: label }), `거르개 「${label}」 이 없다`);
  }
  assert.ok(view.getByRole("checkbox", { name: "전체 선택" }), "표 머리의 체크박스가 없다");
  assert.ok(view.getByRole("checkbox", { name: "강남점 고르기" }), "줄 체크박스가 없다");
  assert.ok(view.getByRole("button", { name: "세금계산서 발행" }), "발행 버튼이 없다");
});

test("연월 고르기는 2026년 9월을 기본값으로 보인다", () => {
  const view = render(<TaxInvoicePage />);

  assert.match(view.getByRole("combobox", { name: "연월" }).textContent ?? "", /2026년 9월/, "기본 연월이 보이지 않는다");
});

test("세액은 공급가액의 10%이고 합계는 둘의 합이며 천 단위마다 쉼표를 넣는다", () => {
  const view = render(<TaxInvoicePage />);

  assert.ok(view.getByText("12,400,000"), "공급가액이 쉼표와 함께 보이지 않는다");
  assert.ok(view.getByText("1,240,000"), "세액이 공급가액의 10%가 아니다");
  assert.ok(view.getByText("13,640,000"), "합계가 공급가액과 세액의 합이 아니다");
});

test("상태는 Badge 문구로 구분하고 발행 완료인 줄은 고를 수 없다", () => {
  const view = render(<TaxInvoicePage />);
  const issued = view.getByRole("checkbox", { name: "잠실점 고르기" });

  assert.equal(view.getAllByText("발행 전").length, 5, "발행 전 줄의 상태 문구가 다르다");
  assert.equal(view.getAllByText("발행 완료").length, 3, "발행 완료 줄의 상태 문구가 다르다");
  assert.equal(issued.getAttribute("aria-disabled"), "true", "발행 완료 줄을 고를 수 있다");

  fireEvent.click(issued);

  assert.equal(issued.getAttribute("aria-checked"), "false", "발행 완료 줄이 골라졌다");
});

test("아무것도 고르지 않으면 발행 버튼이 비활성이고 한 줄을 고르면 건수와 합계가 함께 바뀐다", () => {
  const view = render(<TaxInvoicePage />);
  const issue = view.getByRole("button", { name: "세금계산서 발행" }) as HTMLButtonElement;

  assert.equal(issue.disabled, true, "고른 것이 없는데 발행 버튼이 켜져 있다");
  assert.ok(view.getByText("0건"), "고른 건수가 0건으로 서 있지 않다");

  fireEvent.click(view.getByRole("checkbox", { name: "강남점 고르기" }));

  assert.equal(issue.disabled, false, "줄을 골랐는데 발행 버튼이 꺼져 있다");
  assert.ok(view.getByText("1건"), "고른 건수가 바뀌지 않았다");
  assert.ok(view.getByText("13,640,000원"), "고른 줄의 합계 금액이 보이지 않는다");
});

test("표 머리의 체크박스로 전체를 고르고 일부만 골랐을 때는 일부 선택 상태로 보인다", () => {
  const view = render(<TaxInvoicePage />);
  const all = view.getByRole("checkbox", { name: "전체 선택" });

  fireEvent.click(view.getByRole("checkbox", { name: "강남점 고르기" }));
  assert.equal(all.getAttribute("aria-checked"), "mixed", "일부만 골랐는데 일부 선택 상태가 아니다");

  fireEvent.click(all);

  assert.equal(all.getAttribute("aria-checked"), "true", "전체 선택이 켜지지 않았다");
  assert.equal(view.getByRole("checkbox", { name: "판교점 고르기" }).getAttribute("aria-checked"), "true", "고를 수 있는 줄이 남았다");
  assert.ok(view.getByText("4건"), "발행 전인 네 줄이 골라지지 않았다");
});

test("거르개로 발행 완료만 남기면 발행 전인 줄이 표에서 빠진다", () => {
  const view = render(<TaxInvoicePage />);

  fireEvent.click(view.getByRole("button", { name: "발행 완료" }));

  assert.equal(view.getByRole("button", { name: "발행 완료" }).getAttribute("aria-pressed"), "true", "고른 거르개가 켜지지 않았다");
  assert.equal(view.queryByRole("checkbox", { name: "강남점 고르기" }), null, "발행 전인 줄이 남아 있다");
  assert.ok(view.getByRole("checkbox", { name: "잠실점 고르기" }), "발행 완료인 줄이 빠졌다");
});
