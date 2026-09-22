import "@/test-setup";

import assert from "node:assert/strict";
import test, { afterEach } from "node:test";

import React from "react";
import { cleanup, render, within } from "@testing-library/react";

import ShopOrderCompletePage from "./page";

afterEach(() => {
  cleanup();
});

test("화면 제목 「주문이 완료되었어요」가 heading으로 잡힌다", () => {
  const view = render(<ShopOrderCompletePage />);

  assert.ok(view.getByRole("heading", { level: 1, name: "주문이 완료되었어요" }), "화면 제목 heading이 없다");
});

test("안내 문단이 요청 문구 그대로 보인다", () => {
  const view = render(<ShopOrderCompletePage />);

  assert.ok(view.getByText("주문 내역은 마이페이지에서 확인할 수 있어요."), "안내 문단이 없다");
});

test("머리글의 {브랜드명} 자리는 상품 목록으로 가는 링크다", () => {
  const view = render(<ShopOrderCompletePage />);
  const banner = within(view.getByRole("banner"));

  assert.equal(banner.getByRole("link", { name: "{브랜드명}" }).getAttribute("href"), "/shop-product-list", "{브랜드명} 링크의 목적지가 다르다");
});

test("머리글의 「신발」「의류」「용품」 카테고리 링크는 목적지 미정으로 둔다", () => {
  const view = render(<ShopOrderCompletePage />);
  const banner = within(view.getByRole("banner"));

  for (const name of ["신발", "의류", "용품"]) {
    assert.equal(banner.getByRole("link", { name }).getAttribute("href"), "#", `「${name}」 링크의 목적지가 미정(#)이 아니다`);
  }
});

test("머리글의 「상품 검색」 입력이 이름과 placeholder로 찾아진다", () => {
  const view = render(<ShopOrderCompletePage />);
  const banner = within(view.getByRole("banner"));

  const search = banner.getByLabelText("상품 검색");
  assert.equal(search.tagName, "INPUT", "「상품 검색」이 입력이 아니다");
  assert.equal(banner.getByPlaceholderText("상품 검색"), search, "「상품 검색」 placeholder가 없다");
});

test("머리글의 「장바구니」 링크는 /shop-cart로 가고 담긴 수를 보이지 않는다", () => {
  const view = render(<ShopOrderCompletePage />);
  const banner = within(view.getByRole("banner"));

  const cart = banner.getByRole("link", { name: "장바구니" });
  assert.equal(cart.getAttribute("href"), "/shop-cart", "「장바구니」 링크의 목적지가 다르다");
  assert.equal(cart.textContent, "장바구니", "「장바구니」 링크에 문구 밖의 내용이 있다");
  assert.equal(/\d/.test(cart.textContent ?? ""), false, "「장바구니」 링크에 담긴 수가 보인다");
});

test("「주문 정보」 덩이에 주문번호·결제 금액·결제 수단 값과 받는 분·연락처·주소 자리가 있다", () => {
  const view = render(<ShopOrderCompletePage />);
  const info = within(view.getByRole("region", { name: "주문 정보" }));

  const valueOf = (term: string) => info.getByText(term).nextElementSibling?.textContent;
  assert.equal(valueOf("주문번호"), "20260922-0001", "주문번호가 다르다");
  assert.equal(valueOf("결제 금액"), "228,000원", "결제 금액이 다르다");
  assert.equal(valueOf("결제 수단"), "신용카드", "결제 수단이 다르다");
  for (const term of ["받는 분", "연락처", "주소"]) {
    assert.ok(info.getByText(term), `「${term}」 자리가 없다`);
  }
});

test("「주문 상품」 덩이에 두 상품의 이름·옵션·가격이 있다", () => {
  const view = render(<ShopOrderCompletePage />);
  const items = within(view.getByRole("region", { name: "주문 상품" }));

  const rows = items.getAllByRole("listitem");
  assert.equal(rows.length, 2, "주문 상품이 두 개가 아니다");

  const first = within(rows[0]);
  assert.ok(first.getByText("에어 러너 2"), "첫 상품 이름이 다르다");
  assert.ok(first.getByText("250 · 블랙 · 1개"), "첫 상품 옵션이 다르다");
  assert.ok(first.getByText("139,000원"), "첫 상품 가격이 다르다");

  const second = within(rows[1]);
  assert.ok(second.getByText("데일리 코트 로우"), "둘째 상품 이름이 다르다");
  assert.ok(second.getByText("260 · 화이트 · 1개"), "둘째 상품 옵션이 다르다");
  assert.ok(second.getByText("89,000원"), "둘째 상품 가격이 다르다");
});

test("「주문 내역 보기」는 목적지 미정 링크이고 「쇼핑 계속하기」는 상품 목록으로 가는 링크다", () => {
  const view = render(<ShopOrderCompletePage />);
  const main = within(view.getByRole("main"));

  assert.equal(main.getByRole("link", { name: "주문 내역 보기" }).getAttribute("href"), "#", "「주문 내역 보기」 링크의 목적지가 미정(#)이 아니다");
  assert.equal(main.getByRole("link", { name: "쇼핑 계속하기" }).getAttribute("href"), "/shop-product-list", "「쇼핑 계속하기」 링크의 목적지가 다르다");
});
