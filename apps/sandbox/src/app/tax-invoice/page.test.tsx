import "@/test-setup";

import assert from "node:assert/strict";
import test, { afterEach } from "node:test";

import React from "react";
import { cleanup, fireEvent, render, within } from "@testing-library/react";

import TaxInvoicePage from "./page";

afterEach(() => {
  cleanup();
});

/** 줄 체크박스가 놓인 줄의 칸들이다. */
function cellsOf(view: ReturnType<typeof render>, rowName: string) {
  const row = view.getByRole("checkbox", { name: `${rowName} 고르기` }).closest("tr");
  assert.ok(row, `「${rowName}」 줄이 없다`);
  return within(row).getAllByRole("cell");
}

function totalsByEmployment(view: ReturnType<typeof render>) {
  const list = view.getByRole("list", { name: "고용형태별 합계" });
  return within(list)
    .getAllByRole("listitem")
    .map((item) => item.textContent);
}

test("화면 제목이 heading으로 잡힌다", () => {
  const view = render(<TaxInvoicePage />);

  assert.ok(view.getByRole("heading", { level: 1, name: "세금계산서 발행" }), "화면 제목이 없다");
});

test("연월 고르기와 두 거르개, 체크박스, 고용형태별 합계와 발행 버튼이 접근 가능한 이름으로 찾아진다", () => {
  const view = render(<TaxInvoicePage />);

  assert.ok(view.getByRole("combobox", { name: "연월" }), "연월 고르기가 없다");

  const status = within(view.getByRole("group", { name: "발행 상태" }));
  for (const label of ["전체", "발행 전", "발행 완료"]) {
    assert.ok(status.getByRole("button", { name: label }), `발행 상태 거르개 「${label}」 이 없다`);
  }

  const employment = within(view.getByRole("group", { name: "고용형태" }));
  for (const label of ["전체", "정직원", "알바"]) {
    assert.ok(employment.getByRole("button", { name: label }), `고용형태 거르개 「${label}」 이 없다`);
  }

  assert.ok(view.getByRole("checkbox", { name: "전체 선택" }), "표 머리의 체크박스가 없다");
  assert.ok(view.getByRole("checkbox", { name: "강남점 · 정직원 고르기" }), "정직원 줄의 체크박스가 없다");
  assert.ok(view.getByRole("checkbox", { name: "강남점 · 알바 고르기" }), "알바 줄의 체크박스가 없다");
  assert.ok(view.getByRole("list", { name: "고용형태별 합계" }), "고용형태별 합계가 없다");
  assert.ok(view.getByRole("button", { name: "세금계산서 발행" }), "발행 버튼이 없다");
});

test("연월 고르기는 2026년 9월을 기본값으로 보인다", () => {
  const view = render(<TaxInvoicePage />);

  assert.match(view.getByRole("combobox", { name: "연월" }).textContent ?? "", /2026년 9월/, "기본 연월이 보이지 않는다");
});

test("두 거르개는 처음에 「전체」가 켜져 있다", () => {
  const view = render(<TaxInvoicePage />);

  for (const group of ["발행 상태", "고용형태"]) {
    const filters = within(view.getByRole("group", { name: group }));
    assert.equal(filters.getByRole("button", { name: "전체" }).getAttribute("aria-pressed"), "true", `${group} 거르개의 「전체」 가 꺼져 있다`);
  }
});

test("같은 매장도 정직원과 알바가 각각 한 줄이고 매장명 칸에 매장과 고용형태 Badge 를 함께 보인다", () => {
  const view = render(<TaxInvoicePage />);

  assert.equal(view.getAllByRole("row").length, 13, "여섯 매장이 고용형태마다 한 줄씩 열두 줄이 아니다");

  for (const [rowName, label] of [
    ["강남점 · 정직원", "정직원"],
    ["강남점 · 알바", "알바"],
  ]) {
    const storeCell = cellsOf(view, rowName)[1];
    assert.equal(storeCell.textContent, `강남점${label}`, `「${rowName}」 줄의 매장명 칸에 매장과 고용형태가 함께 있지 않다`);
    assert.equal(storeCell.querySelector("[data-slot=badge]")?.textContent, label, `「${rowName}」 줄의 고용형태가 Badge 가 아니다`);
  }

  assert.equal(view.getAllByText("123-45-67890").length, 2, "같은 매장의 두 줄에 사업자등록번호가 함께 보이지 않는다");
});

test("세액은 공급가액의 10%이고 합계는 둘의 합이며 천 단위마다 쉼표를 넣는다", () => {
  const view = render(<TaxInvoicePage />);
  const cells = cellsOf(view, "강남점 · 정직원");

  assert.equal(cells[3].textContent, "8,200,000", "공급가액이 쉼표와 함께 보이지 않는다");
  assert.equal(cells[4].textContent, "820,000", "세액이 공급가액의 10%가 아니다");
  assert.equal(cells[5].textContent, "9,020,000", "합계가 공급가액과 세액의 합이 아니다");
});

test("상태는 Badge 문구로 구분하고 발행 완료인 줄은 고를 수 없다", () => {
  const view = render(<TaxInvoicePage />);
  const table = within(view.getByRole("table"));
  const issued = view.getByRole("checkbox", { name: "홍대점 · 정직원 고르기" });

  assert.equal(table.getAllByText("발행 전").length, 7, "발행 전 줄의 상태 문구가 다르다");
  assert.equal(table.getAllByText("발행 완료").length, 5, "발행 완료 줄의 상태 문구가 다르다");
  assert.equal(cellsOf(view, "홍대점 · 정직원")[6].querySelector("[data-slot=badge]")?.textContent, "발행 완료", "상태가 Badge 가 아니다");
  assert.equal(issued.getAttribute("aria-disabled"), "true", "발행 완료 줄을 고를 수 있다");

  fireEvent.click(issued);

  assert.equal(issued.getAttribute("aria-checked"), "false", "발행 완료 줄이 골라졌다");
});

test("아무것도 고르지 않으면 발행 버튼이 비활성이고 줄을 고르면 건수와 합계, 고용형태별 합계가 함께 바뀐다", () => {
  const view = render(<TaxInvoicePage />);
  const issue = view.getByRole("button", { name: "세금계산서 발행" }) as HTMLButtonElement;
  const summary = view.getByText(/고른 건수/);

  assert.equal(issue.disabled, true, "고른 것이 없는데 발행 버튼이 켜져 있다");
  assert.equal(summary.textContent, "고른 건수 0건 · 합계 0원", "고른 건수와 합계가 0으로 서 있지 않다");
  assert.deepEqual(totalsByEmployment(view), ["정직원 0원", "알바 0원"], "고용형태별 합계가 0으로 서 있지 않다");

  fireEvent.click(view.getByRole("checkbox", { name: "강남점 · 정직원 고르기" }));

  assert.equal(issue.disabled, false, "줄을 골랐는데 발행 버튼이 꺼져 있다");
  assert.equal(summary.textContent, "고른 건수 1건 · 합계 9,020,000원", "한 줄을 고른 건수와 합계가 다르다");
  assert.deepEqual(totalsByEmployment(view), ["정직원 9,020,000원", "알바 0원"], "정직원 줄의 합계가 정직원 쪽에 서지 않았다");

  fireEvent.click(view.getByRole("checkbox", { name: "강남점 · 알바 고르기" }));

  assert.equal(summary.textContent, "고른 건수 2건 · 합계 13,640,000원", "같은 매장의 두 줄을 따로 고르지 못했다");
  assert.deepEqual(totalsByEmployment(view), ["정직원 9,020,000원", "알바 4,620,000원"], "알바 줄의 합계가 알바 쪽에 서지 않았다");
});

test("표 머리의 체크박스로 전체를 고르고 일부만 골랐을 때는 일부 선택 상태로 보인다", () => {
  const view = render(<TaxInvoicePage />);
  const all = view.getByRole("checkbox", { name: "전체 선택" });

  fireEvent.click(view.getByRole("checkbox", { name: "강남점 · 정직원 고르기" }));
  assert.equal(all.getAttribute("aria-checked"), "mixed", "일부만 골랐는데 일부 선택 상태가 아니다");

  fireEvent.click(all);

  assert.equal(all.getAttribute("aria-checked"), "true", "전체 선택이 켜지지 않았다");
  assert.equal(view.getByRole("checkbox", { name: "판교점 · 알바 고르기" }).getAttribute("aria-checked"), "true", "고를 수 있는 줄이 남았다");
  assert.equal(view.getByRole("checkbox", { name: "잠실점 · 정직원 고르기" }).getAttribute("aria-checked"), "false", "발행 완료 줄이 골라졌다");
  assert.equal(view.getByText(/고른 건수/).textContent?.startsWith("고른 건수 7건"), true, "발행 전인 일곱 줄이 골라지지 않았다");
});

test("고용형태 거르개로 알바만 남기면 정직원 줄이 표에서 빠진다", () => {
  const view = render(<TaxInvoicePage />);
  const employment = within(view.getByRole("group", { name: "고용형태" }));

  fireEvent.click(employment.getByRole("button", { name: "알바" }));

  assert.equal(employment.getByRole("button", { name: "알바" }).getAttribute("aria-pressed"), "true", "고른 거르개가 켜지지 않았다");
  assert.equal(employment.getByRole("button", { name: "전체" }).getAttribute("aria-pressed"), "false", "「전체」 가 함께 켜져 있다");
  assert.equal(view.queryByRole("checkbox", { name: "강남점 · 정직원 고르기" }), null, "정직원 줄이 남아 있다");
  assert.ok(view.getByRole("checkbox", { name: "강남점 · 알바 고르기" }), "알바 줄이 빠졌다");
  assert.equal(view.getAllByRole("row").length, 7, "알바 여섯 줄만 남지 않았다");
});

test("발행 상태와 고용형태 거르개가 함께 걸리면 둘 다로 좁힌다", () => {
  const view = render(<TaxInvoicePage />);

  fireEvent.click(within(view.getByRole("group", { name: "발행 상태" })).getByRole("button", { name: "발행 전" }));
  fireEvent.click(within(view.getByRole("group", { name: "고용형태" })).getByRole("button", { name: "알바" }));

  assert.equal(view.getAllByRole("row").length, 5, "발행 전인 알바 네 줄만 남지 않았다");
  assert.ok(view.getByRole("checkbox", { name: "강남점 · 알바 고르기" }), "발행 전인 알바 줄이 빠졌다");
  assert.equal(view.queryByRole("checkbox", { name: "강남점 · 정직원 고르기" }), null, "고용형태 거르개가 걸리지 않았다");
  assert.equal(view.queryByRole("checkbox", { name: "잠실점 · 알바 고르기" }), null, "발행 상태 거르개가 걸리지 않았다");
});
