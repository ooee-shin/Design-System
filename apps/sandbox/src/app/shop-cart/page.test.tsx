import "@/test-setup";

import assert from "node:assert/strict";
import test, { afterEach } from "node:test";

import React from "react";
import { cleanup, fireEvent, render, within } from "@testing-library/react";

import ShopCartPage from "./page";

afterEach(() => {
  cleanup();
});

const ITEMS = [
  { name: "에어 러너 2", option: "250 · 블랙", price: "139,000원" },
  { name: "데일리 코트 로우", option: "260 · 화이트", price: "89,000원" },
];

test("화면 제목 「장바구니」가 heading으로 잡힌다", () => {
  const view = render(<ShopCartPage />);

  assert.ok(view.getByRole("heading", { level: 1, name: "장바구니" }), "본문 제목 「장바구니」가 없다");
});

test("머리글의 브랜드·카테고리 링크가 요청한 목적지를 가리킨다", () => {
  const view = render(<ShopCartPage />);

  const brand = view.getByRole("link", { name: "{브랜드명}" });
  assert.equal(brand.getAttribute("href"), "/shop-product-list", "{브랜드명} 링크가 상품 목록을 가리키지 않는다");

  for (const category of ["신발", "의류", "용품"]) {
    const link = view.getByRole("link", { name: category });
    assert.equal(link.getAttribute("href"), "#", `「${category}」 링크의 목적지가 미정(#)이 아니다`);
  }
});

test("머리글에 「상품 검색」 입력이 있다", () => {
  const view = render(<ShopCartPage />);

  const search = view.getByLabelText("상품 검색");
  assert.equal(search.tagName, "INPUT", "「상품 검색」이 입력이 아니다");
});

test("머리글의 「장바구니」 링크가 /shop-cart 를 가리키고 담긴 수 2가 보인다", () => {
  const view = render(<ShopCartPage />);

  const cart = view.getByRole("link", { name: "장바구니 2개" });
  assert.equal(cart.getAttribute("href"), "/shop-cart", "장바구니 링크가 /shop-cart 를 가리키지 않는다");
  assert.ok(within(cart).getByText("장바구니"), "장바구니 링크에 「장바구니」 문구가 없다");
  assert.ok(within(cart).getByText("2"), "장바구니 링크에 담긴 수 2가 보이지 않는다");
});

test("목록 위 「전체 선택」 체크는 처음 선택되어 있고 「선택 삭제」 버튼이 있다", () => {
  const view = render(<ShopCartPage />);

  const selectAll = view.getByRole("checkbox", { name: "전체 선택" });
  assert.equal(selectAll.getAttribute("aria-checked"), "true", "「전체 선택」이 처음 선택되어 있지 않다");
  assert.ok(view.getByRole("button", { name: "선택 삭제" }), "「선택 삭제」 버튼이 없다");
});

test("담긴 상품 2줄의 상품명·옵션·가격이 요청 문구 그대로 보인다", () => {
  const view = render(<ShopCartPage />);

  for (const item of ITEMS) {
    assert.ok(view.getByText(item.name), `상품명 「${item.name}」이 없다`);
    assert.ok(view.getByText(item.option), `「${item.name}」의 옵션 「${item.option}」이 없다`);
    assert.ok(view.getByText(item.price), `「${item.name}」의 가격 「${item.price}」이 없다`);
  }
});

test("줄마다 고르기 체크가 처음 선택되어 있다", () => {
  const view = render(<ShopCartPage />);

  for (const item of ITEMS) {
    const checkbox = view.getByRole("checkbox", { name: `${item.name} 선택` });
    assert.equal(checkbox.getAttribute("aria-checked"), "true", `「${item.name}」 고르기 체크가 처음 선택되어 있지 않다`);
  }
});

test("줄마다 수량 숫자 입력은 기본 1, 최소 1, 최대 5다", () => {
  const view = render(<ShopCartPage />);

  for (const item of ITEMS) {
    const quantity = view.getByLabelText(`${item.name} 수량`) as HTMLInputElement;
    assert.equal(quantity.getAttribute("type"), "number", `「${item.name}」 수량이 숫자 입력이 아니다`);
    assert.equal(quantity.value, "1", `「${item.name}」 수량의 기본값이 1이 아니다`);
    assert.equal(quantity.getAttribute("min"), "1", `「${item.name}」 수량의 최소가 1이 아니다`);
    assert.equal(quantity.getAttribute("max"), "5", `「${item.name}」 수량의 최대가 5가 아니다`);
  }
});

test("수량은 1 아래로 줄지 않고 5에서 더 늘지 않는다", () => {
  const view = render(<ShopCartPage />);
  const [item] = ITEMS;

  const quantity = view.getByLabelText(`${item.name} 수량`) as HTMLInputElement;
  const decrease = view.getByRole("button", { name: `${item.name} 수량 줄이기` });
  const increase = view.getByRole("button", { name: `${item.name} 수량 늘리기` });

  assert.equal(decrease.hasAttribute("disabled"), true, "수량 1에서 줄이기 버튼이 꺼져 있지 않다");
  for (let i = 0; i < 4; i++) fireEvent.click(increase);
  assert.equal(quantity.value, "5", "늘리기를 네 번 눌러도 수량이 5가 되지 않는다");
  assert.equal(increase.hasAttribute("disabled"), true, "수량 5에서 늘리기 버튼이 꺼져 있지 않다");
});

test("줄마다 「삭제」 버튼이 있다", () => {
  const view = render(<ShopCartPage />);

  for (const item of ITEMS) {
    const remove = view.getByRole("button", { name: `${item.name} 삭제` });
    assert.equal(remove.textContent, "삭제", `「${item.name}」 줄의 버튼 문구가 「삭제」가 아니다`);
  }
});

test("「주문 요약」에 상품 금액·배송비·할인·결제 예정 금액이 요청한 값으로 보인다", () => {
  const view = render(<ShopCartPage />);

  assert.ok(view.getByRole("heading", { level: 2, name: "주문 요약" }), "「주문 요약」 제목이 없다");

  const expected = [
    ["상품 금액", "228,000원"],
    ["배송비", "0원"],
    ["할인", "0원"],
    ["결제 예정 금액", "228,000원"],
  ];
  for (const [label, value] of expected) {
    const term = view.getByText(label);
    assert.equal(term.nextElementSibling?.textContent, value, `「${label}」이 「${value}」로 보이지 않는다`);
  }
});

test("「주문하기」는 /shop-checkout, 「쇼핑 계속하기」는 /shop-product-list 로 가는 링크다", () => {
  const view = render(<ShopCartPage />);

  const order = view.getByRole("link", { name: "주문하기" });
  assert.equal(order.getAttribute("href"), "/shop-checkout", "「주문하기」가 주문·결제를 가리키지 않는다");

  const keepShopping = view.getByRole("link", { name: "쇼핑 계속하기" });
  assert.equal(keepShopping.getAttribute("href"), "/shop-product-list", "「쇼핑 계속하기」가 상품 목록을 가리키지 않는다");
});
