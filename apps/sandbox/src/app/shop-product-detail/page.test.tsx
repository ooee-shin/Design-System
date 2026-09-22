import "@/test-setup";

import assert from "node:assert/strict";
import test, { afterEach } from "node:test";

import React from "react";
import { cleanup, fireEvent, render, within } from "@testing-library/react";

import ShopProductDetailPage from "./page";

afterEach(() => {
  cleanup();
});

test("화면 제목은 상품명 「에어 러너 2」 heading이다", () => {
  const view = render(<ShopProductDetailPage />);

  assert.ok(view.getByRole("heading", { level: 1, name: "에어 러너 2" }), "상품명 heading이 없다");
});

test("머리글에 브랜드 자리, 카테고리 링크 셋, 상품 검색, 장바구니 링크가 있다", () => {
  const view = render(<ShopProductDetailPage />);

  const brand = view.getByRole("link", { name: "{브랜드명}" });
  assert.equal(brand.getAttribute("href"), "/shop-product-list", "브랜드 자리가 상품 목록으로 가지 않는다");

  const categories = within(view.getByRole("navigation", { name: "카테고리" }));
  for (const name of ["신발", "의류", "용품"]) {
    assert.equal(categories.getByRole("link", { name }).getAttribute("href"), "#", `「${name}」 카테고리 링크의 목적지가 비어 있지 않다`);
  }

  const search = view.getByLabelText("상품 검색");
  assert.equal(search.tagName, "INPUT", "상품 검색이 입력이 아니다");
  assert.equal(view.getByPlaceholderText("상품 검색"), search, "상품 검색 placeholder가 없다");

  const cart = view.getByRole("link", { name: "장바구니 2개" });
  assert.equal(cart.getAttribute("href"), "/shop-cart", "장바구니 링크가 /shop-cart 로 가지 않는다");
  assert.ok(within(cart).getByText("장바구니"), "「장바구니」 문구가 보이지 않는다");
  assert.ok(within(cart).getByText("2"), "담긴 수 2가 보이지 않는다");
});

test("경로 표시는 「신발」 링크와 현재 상품 「에어 러너 2」다", () => {
  const view = render(<ShopProductDetailPage />);

  const breadcrumb = within(view.getByRole("navigation", { name: "현재 위치" }));
  assert.equal(breadcrumb.getByRole("link", { name: "신발" }).getAttribute("href"), "/shop-product-list", "경로의 「신발」이 상품 목록으로 가지 않는다");
  assert.equal(breadcrumb.getByText("에어 러너 2").getAttribute("aria-current"), "page", "「에어 러너 2」가 현재 위치로 표시되지 않는다");
});

test("큰 이미지 자리 하나와 작은 이미지 자리 넷이 있다", () => {
  const view = render(<ShopProductDetailPage />);

  assert.ok(view.getByRole("img", { name: "에어 러너 2 대표 이미지" }), "큰 이미지 자리가 없다");
  for (const index of [1, 2, 3, 4]) {
    assert.ok(view.getByRole("img", { name: `에어 러너 2 이미지 ${index}` }), `작은 이미지 자리 ${index}가 없다`);
  }
  assert.equal(view.getAllByRole("img").length, 5, "이미지 자리 수가 다섯이 아니다");
});

test("가격 「139,000원」과 「신상」·「무료배송」 표시가 보인다", () => {
  const view = render(<ShopProductDetailPage />);

  assert.ok(view.getByText("139,000원"), "가격이 보이지 않는다");
  assert.ok(view.getByText("신상"), "「신상」 표시가 없다");
  assert.ok(view.getByText("무료배송"), "「무료배송」 표시가 없다");
});

test("사이즈는 필수이고 여섯 선택지 가운데 처음에는 아무것도 고르지 않았으며 280은 품절이라 고를 수 없다", () => {
  const view = render(<ShopProductDetailPage />);

  const group = view.getByRole("radiogroup", { name: "사이즈" });
  assert.equal(group.getAttribute("aria-required"), "true", "사이즈가 필수로 표시되지 않는다");

  const sizes = within(group);
  const radios = sizes.getAllByRole("radio");
  for (const size of ["230", "240", "250", "260", "270", "280"]) {
    assert.equal(sizes.getByRole("radio", { name: size }).getAttribute("aria-checked"), "false", `사이즈 ${size}가 처음부터 골라져 있다`);
  }
  assert.equal(radios.length, 6, "사이즈 선택지가 여섯이 아니다");

  const soldOut = sizes.getByRole("radio", { name: "280" });
  assert.ok(soldOut.hasAttribute("data-disabled"), "280이 고를 수 없는 상태가 아니다");
  assert.ok(sizes.getByText("품절"), "280 옆에 「품절」이 보이지 않는다");

  fireEvent.click(soldOut);
  assert.equal(soldOut.getAttribute("aria-checked"), "false", "품절인 280이 골라졌다");

  const available = sizes.getByRole("radio", { name: "250" });
  fireEvent.click(available);
  assert.equal(available.getAttribute("aria-checked"), "true", "250을 눌러도 골라지지 않는다");
});

test("색상은 블랙·화이트·그레이 가운데 기본 블랙이 골라져 있다", () => {
  const view = render(<ShopProductDetailPage />);

  const colors = within(view.getByRole("radiogroup", { name: "색상" }));
  assert.equal(colors.getAllByRole("radio").length, 3, "색상 선택지가 셋이 아니다");
  assert.equal(colors.getByRole("radio", { name: "블랙" }).getAttribute("aria-checked"), "true", "기본 색상이 블랙이 아니다");
  assert.equal(colors.getByRole("radio", { name: "화이트" }).getAttribute("aria-checked"), "false", "화이트가 처음부터 골라져 있다");
  assert.equal(colors.getByRole("radio", { name: "그레이" }).getAttribute("aria-checked"), "false", "그레이가 처음부터 골라져 있다");

  const gray = colors.getByRole("radio", { name: "그레이" });
  fireEvent.click(gray);
  assert.equal(gray.getAttribute("aria-checked"), "true", "그레이를 눌러도 골라지지 않는다");
  assert.equal(colors.getByRole("radio", { name: "블랙" }).getAttribute("aria-checked"), "false", "그레이를 골라도 블랙이 풀리지 않는다");
});

test("수량은 숫자 입력이고 기본 1, 최소 1, 최대 5다", () => {
  const view = render(<ShopProductDetailPage />);

  const quantity = view.getByLabelText("수량") as HTMLInputElement;
  assert.equal(quantity.type, "number", "수량이 숫자 입력이 아니다");
  assert.equal(quantity.value, "1", "수량 기본값이 1이 아니다");
  assert.equal(quantity.min, "1", "수량 최소가 1이 아니다");
  assert.equal(quantity.max, "5", "수량 최대가 5가 아니다");

  const decrease = view.getByRole("button", { name: "값 줄이기" }) as HTMLButtonElement;
  const increase = view.getByRole("button", { name: "값 늘리기" }) as HTMLButtonElement;
  assert.equal(decrease.disabled, true, "수량 1에서 줄이기가 막혀 있지 않다");

  for (let i = 0; i < 6; i++) fireEvent.click(increase);
  assert.equal(quantity.value, "5", "늘리기를 거듭 눌러도 수량이 5에서 멈추지 않는다");
  assert.equal(increase.disabled, true, "수량 5에서 늘리기가 막혀 있지 않다");

  fireEvent.change(quantity, { target: { value: "9" } });
  assert.equal(quantity.value, "5", "5보다 큰 수를 넣어도 5로 제한되지 않는다");
});

test("「장바구니 담기」는 제출 버튼이고 「바로 구매」는 /shop-checkout 링크다", () => {
  const view = render(<ShopProductDetailPage />);

  const addToCart = view.getByRole("button", { name: "장바구니 담기" });
  assert.equal(addToCart.getAttribute("type"), "submit", "「장바구니 담기」가 제출 버튼이 아니다");

  const buyNow = view.getByRole("link", { name: "바로 구매" });
  assert.equal(buyNow.getAttribute("href"), "/shop-checkout", "「바로 구매」가 주문·결제로 가지 않는다");
});

test("「상품 정보」「사이즈 안내」「배송·교환」 세 덩이가 차례로 있고 덩이마다 문단이 있다", () => {
  const view = render(<ShopProductDetailPage />);

  const titles = view.getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent);
  assert.deepEqual(titles, ["상품 정보", "사이즈 안내", "배송·교환"], "세 덩이의 제목이나 차례가 다르다");

  for (const name of ["상품 정보", "사이즈 안내", "배송·교환"]) {
    const region = view.getByRole("region", { name });
    const paragraph = region.querySelector("p");
    assert.ok(paragraph && paragraph.textContent?.trim(), `「${name}」 덩이에 문단이 없다`);
  }
});
