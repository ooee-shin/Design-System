import "@/test-setup";
import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import StoSupportWritePage from "./page";

afterEach(cleanup);

describe("STO 지원요청 작성 화면", () => {
  it("화면 제목이 heading 으로 잡힌다", () => {
    render(<StoSupportWritePage />);
    assert.ok(screen.getByRole("heading", { name: "지원요청 작성" }), "지원요청 작성 제목이 heading 이어야 한다");
  });

  it("뒤로가기가 링크로 잡힌다", () => {
    render(<StoSupportWritePage />);
    const link = screen.getByRole("link", { name: "뒤로가기" });
    assert.equal(link.getAttribute("href"), "#", "목적지가 정해지지 않아 href 는 # 이어야 한다");
  });

  it("요청 유형·제목·내용이 이름으로 찾아지고 필수다", () => {
    render(<StoSupportWritePage />);
    const type = screen.getByLabelText("요청 유형");
    assert.ok(type, "요청 유형 칸이 있어야 한다");
    assert.equal(type.getAttribute("aria-required"), "true", "요청 유형은 필수여야 한다");
    assert.equal((screen.getByLabelText("제목") as HTMLInputElement).required, true, "제목은 필수여야 한다");
    assert.equal((screen.getByLabelText("내용") as HTMLTextAreaElement).required, true, "내용은 필수여야 한다");
  });

  it("요청 유형의 처음 문구는 유형 선택이다", () => {
    render(<StoSupportWritePage />);
    assert.ok(screen.getByText("유형 선택"), "선택 전에는 placeholder 가 보여야 한다");
  });

  it("제목과 내용에 placeholder 와 최대 글자 수가 있다", () => {
    render(<StoSupportWritePage />);
    const title = screen.getByPlaceholderText("요청 제목 입력") as HTMLInputElement;
    const content = screen.getByPlaceholderText("요청 내용 입력") as HTMLTextAreaElement;
    assert.equal(title.maxLength, 50, "제목은 최대 50자여야 한다");
    assert.equal(content.maxLength, 500, "내용은 최대 500자여야 한다");
    assert.ok(screen.getByText("0/50"), "제목 글자 수가 0/50 으로 보여야 한다");
    assert.ok(screen.getByText("0/500"), "내용 글자 수가 0/500 으로 보여야 한다");
  });

  it("입력하면 글자 수가 바뀐다", () => {
    render(<StoSupportWritePage />);
    fireEvent.change(screen.getByLabelText("제목"), { target: { value: "결제 오류" } });
    assert.ok(screen.getByText("5/50"), "제목 5자가 5/50 으로 보여야 한다");
    fireEvent.change(screen.getByLabelText("내용"), { target: { value: "결제가 안 됩니다" } });
    assert.ok(screen.getByText("9/500"), "내용 9자가 9/500 으로 보여야 한다");
  });

  it("제출 버튼이 있고 이름이 요청 등록이다", () => {
    render(<StoSupportWritePage />);
    const submit = screen.getByRole("button", { name: "요청 등록" });
    assert.equal(submit.getAttribute("type"), "submit", "요청 등록은 제출 버튼이어야 한다");
  });
});
