import "@/test-setup";

import assert from "node:assert/strict";
import test, { afterEach } from "node:test";

import React from "react";
import { cleanup, fireEvent, render, within } from "@testing-library/react";

import ExcelExportPage from "./page";

afterEach(() => cleanup());

function rowCountText(view: ReturnType<typeof render>) {
  return view.getByText("내려받을 줄 수").nextElementSibling?.textContent;
}

function itemsGroup(view: ReturnType<typeof render>) {
  return view.getByRole("group", { name: "담을 항목" });
}

test("화면 제목 「엑셀 내려받기」가 heading으로 잡힌다", () => {
  const view = render(<ExcelExportPage />);
  assert.ok(view.getByRole("heading", { level: 1, name: "엑셀 내려받기" }), "제목 heading이 없다");
});

test("내려받을 자료는 근태·급여·연차·세금계산서 넷이다", () => {
  const view = render(<ExcelExportPage />);
  const group = view.getByRole("radiogroup", { name: "내려받을 자료" });
  assert.equal(within(group).getAllByRole("radio").length, 4, "선택지가 넷이 아니다");
  for (const name of ["근태", "급여", "연차", "세금계산서"]) {
    assert.ok(within(group).getByRole("radio", { name }), `선택지 「${name}」가 없다`);
  }
});

test("내려받을 자료는 하나만 고른다", () => {
  const view = render(<ExcelExportPage />);
  const group = view.getByRole("radiogroup", { name: "내려받을 자료" });
  fireEvent.click(within(group).getByRole("radio", { name: "급여" }));
  const checked = within(group)
    .getAllByRole("radio")
    .filter((radio) => radio.getAttribute("aria-checked") === "true");
  assert.equal(checked.length, 1, "고른 자료가 하나가 아니다");
  assert.equal(within(group).getByRole("radio", { name: "급여" }).getAttribute("aria-checked"), "true", "누른 「급여」가 골라지지 않았다");
});

test("기간은 시작일과 종료일 두 자리로 나뉜다", () => {
  const view = render(<ExcelExportPage />);
  const group = view.getByRole("group", { name: "기간" });
  assert.ok(within(group).getByRole("button", { name: "시작일" }), "시작일 자리가 없다");
  assert.ok(within(group).getByRole("button", { name: "종료일" }), "종료일 자리가 없다");
});

test("매장 고르기가 이름으로 찾아진다", () => {
  const view = render(<ExcelExportPage />);
  const trigger = view.getByLabelText("대상 매장");
  assert.match(trigger.textContent ?? "", /매장 선택/, "매장을 고르는 자리의 안내 문구가 보이지 않는다");
});

test("담을 항목은 「전체 선택」 하나와 그 아래 개별 항목 여럿이다", () => {
  const view = render(<ExcelExportPage />);
  const checkboxes = within(itemsGroup(view)).getAllByRole("checkbox");
  assert.equal(checkboxes[0], within(itemsGroup(view)).getByRole("checkbox", { name: "전체 선택" }), "「전체 선택」이 맨 위에 없다");
  assert.ok(checkboxes.length > 2, "개별 항목이 여럿이 아니다");
});

test("일부만 고르면 전체 선택이 일부 선택 상태로 보인다", () => {
  const view = render(<ExcelExportPage />);
  fireEvent.click(within(itemsGroup(view)).getByRole("checkbox", { name: "출근 시각" }));
  assert.equal(
    within(itemsGroup(view)).getByRole("checkbox", { name: "전체 선택" }).getAttribute("aria-checked"),
    "mixed",
    "일부만 골랐는데 「전체 선택」이 일부 선택 상태가 아니다",
  );
});

test("표는 고른 항목을 열로 삼는다", () => {
  const view = render(<ExcelExportPage />);
  const table = view.getByRole("table", { name: "미리보기" });
  const headers = within(table)
    .getAllByRole("columnheader")
    .map((header) => header.textContent);
  const checked = within(itemsGroup(view))
    .getAllByRole("checkbox")
    .slice(1)
    .filter((checkbox) => checkbox.getAttribute("aria-checked") === "true")
    .map((checkbox) => checkbox.closest("label")?.textContent);
  assert.deepEqual(headers, checked, "표의 열이 고른 항목과 다르다");
});

test("항목을 끄면 그 열이 표에서 사라진다", () => {
  const view = render(<ExcelExportPage />);
  const table = view.getByRole("table", { name: "미리보기" });
  assert.ok(within(table).getByRole("columnheader", { name: "출근 시각" }), "끄기 전에 「출근 시각」 열이 없다");
  fireEvent.click(within(itemsGroup(view)).getByRole("checkbox", { name: "출근 시각" }));
  assert.equal(within(table).queryByRole("columnheader", { name: "출근 시각" }), null, "끈 「출근 시각」 열이 남아 있다");
});

test("표는 자료를 세 줄까지 보인다", () => {
  const view = render(<ExcelExportPage />);
  const table = view.getByRole("table", { name: "미리보기" });
  const bodyRows = within(table).getAllByRole("row").slice(1);
  assert.equal(rowCountText(view), "8줄", "근태 자료가 세 줄보다 많아야 이 검사가 뜻을 갖는다");
  assert.equal(bodyRows.length, 3, "표의 자료 줄이 세 줄이 아니다");
});

test("「내려받을 줄 수」는 박아 둔 자료에서 센 수다", () => {
  const view = render(<ExcelExportPage />);
  const group = view.getByRole("radiogroup", { name: "내려받을 자료" });
  assert.equal(rowCountText(view), "8줄", "근태 줄 수가 자료와 다르다");
  fireEvent.click(within(group).getByRole("radio", { name: "급여" }));
  assert.equal(rowCountText(view), "5줄", "급여 줄 수가 자료와 다르다");
  fireEvent.click(within(group).getByRole("radio", { name: "연차" }));
  assert.equal(rowCountText(view), "6줄", "연차 줄 수가 자료와 다르다");
  fireEvent.click(within(group).getByRole("radio", { name: "세금계산서" }));
  assert.equal(rowCountText(view), "4줄", "세금계산서 줄 수가 자료와 다르다");
});

test("「엑셀 내려받기」는 제출 버튼이다", () => {
  const view = render(<ExcelExportPage />);
  const button = view.getByRole("button", { name: "엑셀 내려받기" });
  assert.equal(button.getAttribute("type"), "submit", "「엑셀 내려받기」가 제출 버튼이 아니다");
});

test("담을 항목을 하나도 고르지 않으면 「엑셀 내려받기」가 비활성이다", () => {
  const view = render(<ExcelExportPage />);
  const button = view.getByRole("button", { name: "엑셀 내려받기" }) as HTMLButtonElement;
  assert.equal(button.disabled, false, "항목을 골랐는데 버튼이 비활성이다");
  fireEvent.click(within(itemsGroup(view)).getByRole("checkbox", { name: "전체 선택" }));
  const checked = within(itemsGroup(view))
    .getAllByRole("checkbox")
    .filter((checkbox) => checkbox.getAttribute("aria-checked") === "true");
  assert.equal(checked.length, 0, "「전체 선택」을 껐는데 남은 항목이 있다");
  assert.equal(button.disabled, true, "고른 항목이 없는데 버튼이 비활성이 아니다");
});
