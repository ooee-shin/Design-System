import "@/test-setup";

import assert from "node:assert/strict";
import test, { afterEach } from "node:test";

import React from "react";
import { cleanup, fireEvent, render, within } from "@testing-library/react";

import ShopProductListPage from "./page";

afterEach(() => {
  cleanup();
});

const PRODUCTS = [
  { name: "에어 러너 2", price: "139,000원", href: "/shop-product-detail", badge: "신상" },
  { name: "데일리 코트 로우", price: "89,000원", href: "#" },
  { name: "트레일 워커 GTX", price: "189,000원", href: "#", badge: "품절" },
  { name: "클라우드 슬라이드", price: "49,000원", href: "#" },
  { name: "레트로 조거", price: "119,000원", href: "#" },
  { name: "스피드 레이서", price: "229,000원", href: "#", badge: "신상" },
  { name: "캔버스 하이", price: "69,000원", href: "#" },
  { name: "모닝 워크", price: "99,000원", href: "#" },
];

test("화면 제목 「신발」이 heading 으로 잡히고 상품 수 「8개」가 보인다", () => {
  const view = render(<ShopProductListPage />);

  assert.ok(view.getByRole("heading", { level: 1, name: "신발" }), "제목 「신발」 heading 이 없다");
  assert.ok(view.getByText("8개"), "상품 수 「8개」가 없다");
});

test("머리글의 브랜드명 자리는 상품 목록으로 가는 링크다", () => {
  const view = render(<ShopProductListPage />);

  const brand = view.getByRole("link", { name: "{브랜드명}" });
  assert.equal(brand.getAttribute("href"), "/shop-product-list", "브랜드명 링크의 목적지가 상품 목록이 아니다");
});

test("머리글에 「신발」「의류」「용품」 카테고리 링크가 목적지 미정으로 있다", () => {
  const view = render(<ShopProductListPage />);

  for (const category of ["신발", "의류", "용품"]) {
    const link = view.getByRole("link", { name: category });
    assert.equal(link.getAttribute("href"), "#", `카테고리 링크 「${category}」의 목적지가 비어 있지 않다`);
  }
});

test("머리글에 「상품 검색」 입력이 있다", () => {
  const view = render(<ShopProductListPage />);

  const search = view.getByLabelText("상품 검색");
  assert.equal(search.tagName, "INPUT", "「상품 검색」이 입력이 아니다");
  assert.ok(view.getByPlaceholderText("상품 검색"), "「상품 검색」 placeholder 가 없다");
});

test("머리글의 「장바구니」 링크는 담긴 수 2를 보이고 장바구니로 간다", () => {
  const view = render(<ShopProductListPage />);

  const cart = view.getByRole("link", { name: "장바구니 2개" });
  assert.equal(cart.getAttribute("href"), "/shop-cart", "장바구니 링크의 목적지가 /shop-cart 가 아니다");
  assert.ok(within(cart).getByText("장바구니"), "장바구니 링크에 「장바구니」 글자가 없다");
  assert.ok(within(cart).getByText("2"), "장바구니 링크에 담긴 수 2가 보이지 않는다");
});

test("사이즈는 여섯 값이 처음에 모두 꺼져 있고 여러 개를 함께 고를 수 있다", () => {
  const view = render(<ShopProductListPage />);

  const group = view.getByRole("group", { name: "사이즈" });
  const sizes = ["230", "240", "250", "260", "270", "280"];
  const buttons = within(group).getAllByRole("button");
  assert.deepEqual(
    buttons.map((button) => button.textContent),
    sizes,
    "사이즈 선택지가 230·240·250·260·270·280 이 아니다",
  );
  for (const button of buttons) {
    assert.equal(button.getAttribute("aria-pressed"), "false", `사이즈 ${button.textContent}가 처음부터 골라져 있다`);
  }

  fireEvent.click(within(group).getByRole("button", { name: "240" }));
  fireEvent.click(within(group).getByRole("button", { name: "260" }));
  assert.equal(within(group).getByRole("button", { name: "240" }).getAttribute("aria-pressed"), "true", "240 을 골랐는데 켜지지 않았다");
  assert.equal(within(group).getByRole("button", { name: "260" }).getAttribute("aria-pressed"), "true", "260 을 더 골랐는데 켜지지 않았다");

  fireEvent.click(within(group).getByRole("button", { name: "240" }));
  assert.equal(within(group).getByRole("button", { name: "240" }).getAttribute("aria-pressed"), "false", "240 을 다시 눌렀는데 꺼지지 않았다");
});

test("가격은 네 선택지 가운데 하나를 고르고 처음에는 「전체」다", () => {
  const view = render(<ShopProductListPage />);

  const group = view.getByRole("radiogroup", { name: "가격" });
  const labels = ["전체", "10만원 이하", "10만~20만원", "20만원 이상"];
  const radios = within(group).getAllByRole("radio");
  assert.equal(radios.length, 4, "가격 선택지가 넷이 아니다");
  for (const label of labels) {
    const radio = within(group).getByRole("radio", { name: label });
    assert.equal(radio.getAttribute("aria-checked"), label === "전체" ? "true" : "false", `가격 「${label}」의 처음 상태가 다르다`);
  }
});

test("「품절 상품 제외」 체크는 처음에 꺼져 있다", () => {
  const view = render(<ShopProductListPage />);

  const checkbox = view.getByRole("checkbox", { name: "품절 상품 제외" });
  assert.equal(checkbox.getAttribute("aria-checked"), "false", "「품절 상품 제외」가 처음부터 켜져 있다");
});

test("정렬은 처음에 「추천순」을 보이고 네 선택지를 가진다", async () => {
  const view = render(<ShopProductListPage />);

  const trigger = view.getByRole("combobox", { name: "정렬" });
  assert.ok(within(trigger).getByText("추천순"), "정렬의 기본값이 「추천순」이 아니다");

  fireEvent.click(trigger);
  const options = await view.findAllByRole("option");
  assert.deepEqual(
    options.map((option) => option.textContent),
    ["추천순", "신상품순", "낮은 가격순", "높은 가격순"],
    "정렬 선택지가 추천순·신상품순·낮은 가격순·높은 가격순이 아니다",
  );
});

test("상품 카드 8개가 이름·가격·배지를 보이고 에어 러너 2 만 상품 상세로 간다", () => {
  const view = render(<ShopProductListPage />);

  const list = view.getByRole("region", { name: "상품 목록" });
  const cards = within(list).getAllByRole("listitem");
  assert.equal(cards.length, 8, "상품 카드가 8개가 아니다");

  PRODUCTS.forEach((product, index) => {
    const card = cards[index];
    const link = within(card).getByRole("link");
    assert.equal(link.getAttribute("href"), product.href, `「${product.name}」 카드의 목적지가 다르다`);
    assert.ok(within(card).getByText(product.name), `「${product.name}」 카드에 상품명이 없다`);
    assert.ok(within(card).getByText(product.price), `「${product.name}」 카드에 가격 ${product.price}이 없다`);
    if (product.badge) assert.ok(within(card).getByText(product.badge), `「${product.name}」 카드에 「${product.badge}」 배지가 없다`);
    else assert.equal(within(card).queryByText(/^(신상|품절)$/), null, `「${product.name}」 카드에 없어야 할 배지가 있다`);
  });
});

test("목록 아래에 페이지 이동 「1」「2」「다음」 링크가 목적지 미정으로 있다", () => {
  const view = render(<ShopProductListPage />);

  const pagination = view.getByRole("navigation", { name: "페이지 이동" });
  for (const label of ["1", "2", "다음"]) {
    const link = within(pagination).getByRole("link", { name: label });
    assert.equal(link.getAttribute("href"), "#", `페이지 이동 「${label}」의 목적지가 비어 있지 않다`);
  }
});
