import "@/test-setup";
import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import React from "react";
import { cleanup, render, screen, within } from "@testing-library/react";
import CompanyMainPage from "./page";

afterEach(cleanup);

describe("회사 메인 페이지", () => {
  it("화면 제목이 heading 으로 잡힌다", () => {
    render(<CompanyMainPage />);
    assert.ok(screen.getByRole("heading", { level: 1, name: /즐거움을 만드는 일/ }), "h1 이 없다");
    assert.ok(screen.getByRole("heading", { level: 2, name: "소식" }), "소식 제목이 없다");
  });

  it("머리글의 메뉴와 문의하기가 링크로 찾아진다", () => {
    render(<CompanyMainPage />);
    const nav = screen.getByRole("navigation", { name: "주요 메뉴" });
    for (const name of ["회사 소개", "사업 분야", "소식", "채용"]) {
      assert.ok(within(nav).getByRole("link", { name }), `메뉴 「${name}」 링크가 없다`);
    }
    assert.ok(screen.getByRole("link", { name: "문의하기" }), "문의하기 링크가 없다");
    assert.ok(screen.getByRole("link", { name: "{회사명} 홈" }), "로고 링크가 없다");
  });

  it("히어로의 두 버튼이 링크이고 문구가 같다", () => {
    render(<CompanyMainPage />);
    assert.ok(screen.getByRole("link", { name: "사업 분야 보기" }), "사업 분야 보기 링크가 없다");
    assert.ok(screen.getByRole("link", { name: "회사 소개 보기" }), "회사 소개 보기 링크가 없다");
  });

  it("사업 분야 카드가 세 장이고 제목이 링크다", () => {
    render(<CompanyMainPage />);
    for (const name of ["캐릭터·상품", "디지털 콘텐츠", "체험·이벤트"]) {
      assert.ok(screen.getByRole("link", { name }), `카드 「${name}」 링크가 없다`);
    }
  });

  it("소식 목록이 다섯 줄이고 새 소식 배지가 붙는다", () => {
    render(<CompanyMainPage />);
    const list = within(screen.getByRole("region", { name: "소식" })).getByRole("list");
    assert.equal(within(list).getAllByRole("listitem").length, 5, "소식이 다섯 줄이 아니다");
    assert.equal(screen.getAllByText("새 소식").length, 2, "새 소식 배지가 둘이 아니다");
    assert.ok(screen.getByRole("link", { name: "소식 전체 보기" }), "소식 전체 보기 링크가 없다");
  });

  it("문의 안내의 버튼이 링크다", () => {
    render(<CompanyMainPage />);
    assert.ok(screen.getByRole("link", { name: "문의 남기기" }), "문의 남기기 링크가 없다");
  });

  it("바닥글에 정책 링크와 저작권 문구가 있다", () => {
    render(<CompanyMainPage />);
    const footer = screen.getByRole("contentinfo");
    for (const name of ["개인정보 처리방침", "이용약관", "고객센터"]) {
      assert.ok(within(footer).getByRole("link", { name }), `바닥글 「${name}」 링크가 없다`);
    }
    assert.ok(within(footer).getByText("Copyright © {회사명}. All rights reserved."), "저작권 문구가 없다");
  });
});
