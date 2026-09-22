import "@/test-setup";

import assert from "node:assert/strict";
import { afterEach, test } from "node:test";

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import React from "react";

import ShopCheckoutPage from "./page";

afterEach(() => cleanup());

test("화면 제목 「주문·결제」가 1단계 heading으로 잡힌다", () => {
  render(<ShopCheckoutPage />);
  assert.ok(screen.getByRole("heading", { level: 1, name: "주문·결제" }), "화면 제목 heading이 없다");
});

test("머리글의 브랜드 자리는 상품 목록으로 가는 링크다", () => {
  render(<ShopCheckoutPage />);
  const brand = screen.getByRole("link", { name: "{브랜드명}" });
  assert.equal(brand.getAttribute("href"), "/shop-product-list", "브랜드 링크의 목적지가 상품 목록이 아니다");
});

test("머리글에 「신발」「의류」「용품」 카테고리 링크가 목적지 미정으로 있다", () => {
  render(<ShopCheckoutPage />);
  const nav = screen.getByRole("navigation", { name: "카테고리" });
  for (const name of ["신발", "의류", "용품"]) {
    const link = within(nav).getByRole("link", { name });
    assert.equal(link.getAttribute("href"), "#", `「${name}」 링크의 목적지가 미정(#)이 아니다`);
  }
});

test("머리글에 「상품 검색」 입력이 있다", () => {
  render(<ShopCheckoutPage />);
  const search = screen.getByLabelText("상품 검색");
  assert.equal(search.tagName, "INPUT", "「상품 검색」이 입력이 아니다");
});

test("머리글의 「장바구니」 링크는 담긴 수 2를 보이고 장바구니로 간다", () => {
  render(<ShopCheckoutPage />);
  const cart = screen.getByRole("link", { name: "장바구니 2개" });
  assert.equal(cart.getAttribute("href"), "/shop-cart", "장바구니 링크의 목적지가 /shop-cart 가 아니다");
  assert.ok(within(cart).getByText("장바구니"), "링크에 「장바구니」 문구가 보이지 않는다");
  assert.ok(within(cart).getByText("2"), "링크에 담긴 수 2가 보이지 않는다");
});

test("「배송지」·「주문 상품」·「결제 수단」·「결제 금액」 덩이가 제목으로 잡힌다", () => {
  render(<ShopCheckoutPage />);
  for (const name of ["배송지", "주문 상품", "결제 수단", "결제 금액"]) {
    assert.ok(screen.getByRole("heading", { level: 2, name }), `「${name}」 덩이 제목이 없다`);
  }
});

test("「받는 분」은 필수 입력이다", () => {
  render(<ShopCheckoutPage />);
  const recipient = screen.getByLabelText("받는 분") as HTMLInputElement;
  assert.equal(recipient.tagName, "INPUT", "「받는 분」이 입력이 아니다");
  assert.equal(recipient.required, true, "「받는 분」이 필수가 아니다");
});

test("「연락처」는 필수 전화번호 입력이고 placeholder가 「010-0000-0000」이다", () => {
  render(<ShopCheckoutPage />);
  const phone = screen.getByLabelText("연락처") as HTMLInputElement;
  assert.equal(phone.required, true, "「연락처」가 필수가 아니다");
  assert.equal(phone.type, "tel", "「연락처」의 입력 종류가 tel 이 아니다");
  assert.equal(screen.getByPlaceholderText("010-0000-0000"), phone, "「연락처」의 placeholder가 「010-0000-0000」이 아니다");
});

test("「주소」는 필수이고 「주소 찾기」로 주소 선택 화면을 여는 버튼이다", () => {
  render(<ShopCheckoutPage />);
  const address = screen.getByLabelText("주소");
  assert.equal(address.tagName, "BUTTON", "「주소」가 선택 화면을 여는 버튼이 아니다");
  assert.equal(address.getAttribute("type"), "button", "「주소」 버튼이 제출 버튼이다");
  assert.ok(address.hasAttribute("required"), "「주소」가 필수가 아니다");
  assert.equal(address.textContent, "주소 찾기", "「주소」에 「주소 찾기」가 보이지 않는다");
});

test("「상세 주소」 입력이 있다", () => {
  render(<ShopCheckoutPage />);
  const detail = screen.getByLabelText("상세 주소");
  assert.equal(detail.tagName, "INPUT", "「상세 주소」가 입력이 아니다");
});

test("「배송 요청 사항」은 기본 「선택 안 함」이고 네 선택지 가운데 하나를 고른다", async () => {
  render(<ShopCheckoutPage />);
  const request = screen.getByLabelText("배송 요청 사항");
  assert.equal(request.textContent, "선택 안 함", "「배송 요청 사항」의 기본값이 「선택 안 함」이 아니다");

  fireEvent.click(request);
  const options = await screen.findAllByRole("option");
  assert.deepEqual(
    options.map((option) => option.textContent),
    ["선택 안 함", "문 앞에 놓아 주세요", "경비실에 맡겨 주세요", "배송 전에 연락 주세요"],
    "「배송 요청 사항」의 선택지가 요청과 다르다",
  );
});

test("「주문 상품」에 두 상품의 옵션과 가격이 보인다", () => {
  render(<ShopCheckoutPage />);
  const items = screen.getByRole("region", { name: "주문 상품" });
  const rows = within(items).getAllByRole("listitem");
  assert.equal(rows.length, 2, "주문 상품이 두 개가 아니다");

  const expected = [
    ["에어 러너 2", "250 · 블랙 · 1개", "139,000원"],
    ["데일리 코트 로우", "260 · 화이트 · 1개", "89,000원"],
  ];
  expected.forEach(([name, option, price], index) => {
    const row = within(rows[index]);
    assert.ok(row.getByText(name), `「${name}」 이름이 없다`);
    assert.ok(row.getByText(option), `「${name}」의 옵션 「${option}」이 없다`);
    assert.ok(row.getByText(price), `「${name}」의 가격 「${price}」이 없다`);
  });
});

test("「결제 수단」은 신용카드·계좌이체·간편결제 가운데 하나를 고르고 기본은 신용카드다", () => {
  render(<ShopCheckoutPage />);
  const group = screen.getByRole("radiogroup", { name: "결제 수단" });
  const radios = within(group).getAllByRole("radio");
  assert.deepEqual(
    radios.map((radio) => radio.getAttribute("aria-labelledby") && document.getElementById(radio.getAttribute("aria-labelledby")!)?.textContent),
    ["신용카드", "계좌이체", "간편결제"],
    "「결제 수단」의 선택지가 요청과 다르다",
  );
  assert.equal(within(group).getByRole("radio", { name: "신용카드" }).getAttribute("aria-checked"), "true", "기본 결제 수단이 신용카드가 아니다");
  assert.equal(within(group).getByRole("radio", { name: "계좌이체" }).getAttribute("aria-checked"), "false", "계좌이체가 처음부터 골라져 있다");
  assert.equal(within(group).getByRole("radio", { name: "간편결제" }).getAttribute("aria-checked"), "false", "간편결제가 처음부터 골라져 있다");
});

test("「결제 금액」에 상품 금액·배송비·할인·총 결제 금액이 요청한 값으로 보인다", () => {
  render(<ShopCheckoutPage />);
  const summary = within(screen.getByRole("complementary", { name: "결제 금액" }));
  const expected: Array<[string, string]> = [
    ["상품 금액", "228,000원"],
    ["배송비", "0원"],
    ["할인", "0원"],
    ["총 결제 금액", "228,000원"],
  ];
  for (const [label, value] of expected) {
    const term = summary.getByText(label);
    assert.equal(term.tagName, "DT", `「${label}」이 항목 이름으로 잡히지 않는다`);
    assert.equal(term.nextElementSibling?.textContent, value, `「${label}」이 「${value}」가 아니다`);
  }
});

test("구매 조건 동의는 필수 체크이고 처음에는 꺼져 있다", () => {
  render(<ShopCheckoutPage />);
  const agree = screen.getByRole("checkbox", { name: "구매 조건을 확인했으며 결제 진행에 동의합니다" });
  assert.equal(agree.getAttribute("aria-checked"), "false", "동의 체크가 처음부터 켜져 있다");
  assert.equal(agree.getAttribute("aria-required"), "true", "동의 체크가 필수가 아니다");
});

test("「228,000원 결제하기」는 주문 완료로 가는 링크다", () => {
  render(<ShopCheckoutPage />);
  const pay = screen.getByRole("link", { name: "228,000원 결제하기" });
  assert.equal(pay.getAttribute("href"), "/shop-order-complete", "결제하기 링크의 목적지가 주문 완료가 아니다");
});
