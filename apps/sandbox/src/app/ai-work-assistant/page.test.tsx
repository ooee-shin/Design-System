import "@/test-setup";

import assert from "node:assert/strict";
import test, { afterEach } from "node:test";

import React from "react";
import { cleanup, fireEvent, render } from "@testing-library/react";

import AiWorkAssistantPage from "./page";

afterEach(() => {
  cleanup();
});

test("화면 제목이 heading으로 잡힌다", () => {
  const view = render(<AiWorkAssistantPage />);

  assert.ok(view.getByRole("heading", { level: 1, name: "업무 데이터 AI 어시스턴트 (프로토타입)" }));
});

test("매핑표의 상호작용 요소가 접근 가능한 이름으로 찾아진다", () => {
  const view = render(<AiWorkAssistantPage />);

  assert.ok(view.getByRole("button", { name: "뒤로가기" }));
  assert.ok(view.getByRole("searchbox", { name: "대화 검색" }));
  assert.ok(view.getByPlaceholderText("지난 대화 검색"));
  assert.ok(view.getByRole("textbox", { name: "질문 입력" }));
  assert.ok(view.getByPlaceholderText("점포 매출, 계약 정보 같은 업무 데이터를 물어보세요"));
  assert.ok(view.getByRole("button", { name: "전송" }));
  assert.ok(view.getByRole("button", { name: "이미지 첨부" }));
  assert.ok(view.getByRole("button", { name: "파일 첨부" }));
});

test("7가지 질문 유형과 데이터 없음 안내가 예시 대화로 렌더된다", () => {
  const view = render(<AiWorkAssistantPage />);

  assert.ok(view.getByText("강남점 권리금이 얼마야?"));
  assert.ok(view.getByText("강남점 권리금은 3,000만원이에요."));

  assert.ok(view.getByText("홍대점 계약 종료일 알려줘"));
  assert.ok(view.getByText("홍대점 계약 종료일은 2026년 11월 30일이에요."));

  assert.ok(view.getByText("잠실점 이번 달 매출 얼마야?"));
  assert.ok(view.getByText("잠실점 이번 달 매출은 1억 1,000만원이에요."));

  assert.ok(view.getByText("강남점 매출이 지난달보다 얼마나 줄었어?"));
  assert.ok(view.getByText(/강남점 매출이 지난달보다 1,300만원\(13\.7%\) 줄었어요\./));

  assert.ok(view.getByText("이번 달 매출이 20% 이상 떨어진 매장 보여줘"));
  assert.ok(view.getByText(/조건에 맞는 매장이 없어요\. 가장 크게 줄어든 매장은 강남점\(13\.7%\)이에요\./));

  assert.ok(view.getByText("잠실점 매출과 리뷰 현황 알려줘"));
  assert.ok(view.getByText(/잠실점 이번 달 매출은 1억 1,000만원\(지난달 대비 8\.9% 증가\)이고, 리뷰는 평점 4\.8점\(203건\)이에요\./));

  assert.ok(view.getByText("강남점 상세정보 보여줘"));
  assert.ok(view.getByText("강남점 상세 페이지로 연결할게요."));
  assert.ok(view.getByRole("link", { name: "강남점 상세보기" }));

  assert.ok(view.getByText("신촌점 매출 얼마야?"));
  assert.ok(view.getByText("신촌점 데이터를 찾을 수 없어요. 등록된 매장: 강남점, 홍대점, 잠실점"));
});

test("상세보기 버튼을 누르면 아직 준비되지 않았다는 안내가 대화에 추가된다", () => {
  const view = render(<AiWorkAssistantPage />);

  fireEvent.click(view.getByRole("link", { name: "강남점 상세보기" }));

  assert.ok(view.getByText("강남점 상세 페이지는 아직 만들지 않았어요. 화면이 준비되면 이 버튼에서 연결할게요."));
});

test("대화 검색에 키워드를 치면 그 말이 든 대화만 남는다", () => {
  const view = render(<AiWorkAssistantPage />);

  fireEvent.change(view.getByRole("searchbox", { name: "대화 검색" }), { target: { value: "계약" } });

  assert.ok(view.getByText("홍대점 계약 종료일 알려줘"));
  assert.ok(view.getByText("홍대점 계약 종료일은 2026년 11월 30일이에요."));
  assert.equal(view.queryByText("강남점 권리금이 얼마야?"), null);
  assert.equal(view.queryByText("잠실점 이번 달 매출 얼마야?"), null);
});

test("답변에만 있는 말로 검색해도 질문과 답변이 함께 남는다", () => {
  const view = render(<AiWorkAssistantPage />);

  fireEvent.change(view.getByRole("searchbox", { name: "대화 검색" }), { target: { value: "3,000만원" } });

  assert.ok(view.getByText("강남점 권리금이 얼마야?"));
  assert.ok(view.getByText("강남점 권리금은 3,000만원이에요."));
  assert.equal(view.queryByText("홍대점 계약 종료일 알려줘"), null);
});

test("검색어를 지우면 모든 대화가 다시 보이고, 맞는 대화가 없으면 안내가 나온다", () => {
  const view = render(<AiWorkAssistantPage />);
  const search = view.getByRole("searchbox", { name: "대화 검색" });

  fireEvent.change(search, { target: { value: "없는말" } });
  assert.ok(view.getByText("「없는말」이(가) 들어 있는 대화가 없어요."));

  fireEvent.change(search, { target: { value: "" } });
  assert.ok(view.getByText("강남점 권리금이 얼마야?"));
  assert.ok(view.getByText("홍대점 계약 종료일 알려줘"));
});

test("새 질문을 입력해 전송하면 답변이 대화에 추가된다", () => {
  const view = render(<AiWorkAssistantPage />);

  const textbox = view.getByRole("textbox", { name: "질문 입력" });
  fireEvent.change(textbox, { target: { value: "잠실점 권리금이 얼마야?" } });
  fireEvent.click(view.getByRole("button", { name: "전송" }));

  assert.ok(view.getByText("잠실점 권리금이 얼마야?"));
  assert.ok(view.getByText("잠실점 권리금은 4,500만원이에요."));
  assert.equal((textbox as HTMLTextAreaElement).value, "");
});
