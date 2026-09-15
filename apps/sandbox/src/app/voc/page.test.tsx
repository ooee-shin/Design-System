import "@/test-setup";

import assert from "node:assert/strict";
import test, { afterEach } from "node:test";

import React from "react";
import { cleanup, fireEvent, render, within } from "@testing-library/react";

import VocPage from "./page";

afterEach(() => {
  cleanup();
});

test("고객의 소리 화면 제목이 heading으로 잡힌다", () => {
  const view = render(<VocPage />);

  assert.ok(view.getByRole("heading", { level: 1, name: "고객의 소리" }));
});

test("매핑표의 각 요소가 접근 가능한 이름으로 찾아진다", () => {
  const view = render(<VocPage />);

  assert.ok(view.getByRole("button", { name: "내보내기" }));
  assert.ok(view.getByRole("button", { name: "기간 선택" }));
  assert.ok(view.getByLabelText("매장"));
  assert.ok(view.getByLabelText("유형"));
  assert.ok(view.getByLabelText("검색"));
  assert.ok(view.getByRole("button", { name: "전체" }));
  assert.ok(view.getByRole("button", { name: "접수" }));
  assert.ok(view.getByRole("button", { name: "처리 중" }));
  assert.ok(view.getByRole("button", { name: "완료" }));
  assert.ok(view.getByRole("button", { name: "이전 페이지" }));
  assert.ok(view.getByRole("button", { name: "다음 페이지" }));
});

test("행을 누르면 선택 표시되고 상세 패널의 답변 등록 버튼이 요청 문구 그대로 있다", () => {
  const view = render(<VocPage />);

  const row = view.getByText("친절한 응대 감사해요").closest("tr");
  assert.ok(row, "제목이 있는 행을 찾지 못했다");
  fireEvent.click(row!);

  assert.equal(row!.getAttribute("aria-selected"), "true");
  assert.ok(view.getByRole("heading", { level: 2, name: "친절한 응대 감사해요" }));
  assert.ok(view.getByRole("button", { name: "답변 등록" }));
});

test("담당자가 없으면 미배정을 흐린 글자로 보인다", () => {
  const view = render(<VocPage />);

  const row = view.getByText("포인트 적립 문의드립니다").closest("tr");
  assert.ok(row, "제목이 있는 행을 찾지 못했다");
  const assignedCell = within(row as HTMLElement).getByText("미배정");

  assert.ok(assignedCell.className.includes("text-oe-foreground-tertiary"));
});

test("고객 열은 연락처 뒷자리를 가린 형태로 보인다", () => {
  const view = render(<VocPage />);

  assert.ok(view.getByText("010-****-1234"));
});

test("상태 배지가 접수·처리 중·완료 문구로 구분된다", () => {
  const view = render(<VocPage />);

  const receivedRow = view.getByText("포인트 적립 문의드립니다").closest("tr") as HTMLElement;
  const inProgressRow = view.getByText("주문이 자꾸 밀려요").closest("tr") as HTMLElement;
  const doneRow = view.getByText("친절한 응대 감사해요").closest("tr") as HTMLElement;

  assert.ok(within(receivedRow).getByText("접수"));
  assert.ok(within(inProgressRow).getByText("처리 중"));
  assert.ok(within(doneRow).getByText("완료"));
});

test("상세 패널은 선택한 행의 상태를 상태 변경의 기본값으로 보여주고 답변 글자 수를 표시한다", () => {
  const view = render(<VocPage />);

  const row = view.getByText("친절한 응대 감사해요").closest("tr");
  fireEvent.click(row!);

  const statusSelect = view.getByRole("combobox", { name: "상태 변경" });
  assert.ok(within(statusSelect).getByText("완료"));

  assert.ok(view.getByText("0/1000"));

  const answer = view.getByLabelText("답변") as HTMLTextAreaElement;
  assert.equal(answer.maxLength, 1000);
  assert.equal(answer.placeholder, "고객에게 보낼 답변을 입력하세요");

  fireEvent.change(answer, { target: { value: "안녕하세요" } });
  assert.ok(view.getByText("5/1000"));
});

test("상세 패널이 열리면 표에서 고객·담당자 열을 숨기고 닫으면 되돌린다", () => {
  const view = render(<VocPage />);
  const headers = () => view.getAllByRole("columnheader").map((header) => header.textContent);

  assert.deepEqual(headers(), ["접수일시", "매장", "유형", "제목", "고객", "상태", "담당자"]);

  fireEvent.click(view.getByText("주문이 자꾸 밀려요").closest("tr")!);
  assert.deepEqual(headers(), ["접수일시", "매장", "유형", "제목", "상태"], "패널이 열렸는데 고객·담당자 열이 남아 있다");

  const panel = view.getByRole("complementary", { name: "고객의 소리 상세" });
  assert.ok(within(panel).getByText("010-****-5678"), "숨긴 고객 값이 상세 패널에 보이지 않는다");

  fireEvent.click(view.getByRole("button", { name: "닫기" }));
  assert.equal(headers().length, 7, "패널을 닫았는데 열이 되돌아오지 않았다");
});

test("닫기 아이콘 버튼을 누르면 상세 패널이 닫히고 표가 폭을 다 쓴다", () => {
  const view = render(<VocPage />);

  const row = view.getByText("친절한 응대 감사해요").closest("tr");
  fireEvent.click(row!);
  assert.ok(view.getByRole("heading", { level: 2, name: "친절한 응대 감사해요" }));

  fireEvent.click(view.getByRole("button", { name: "닫기" }));

  assert.equal(view.queryByRole("heading", { level: 2, name: "친절한 응대 감사해요" }), null);
});
