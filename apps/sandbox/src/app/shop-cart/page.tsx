"use client";

/**
 * 이커머스 장바구니
 *
 * 요청:
 * 이커머스 장바구니. 이커머스 웹의 장바구니 화면. 상단 머리글에 {브랜드명} 자리(상품 목록 /shop-product-list 로 가는 링크), 「신발」「의류」「용품」 카테고리 링크(목적지 미정), 「상품 검색」 입력, 담긴 수 2가 보이는 「장바구니」 링크(/shop-cart)를 둔다. 본문 제목 「장바구니」. 목록 위에 「전체 선택」 체크(처음 선택됨)와 「선택 삭제」 버튼. 담긴 상품 2줄: 에어 러너 2(옵션 「250 · 블랙」, 139,000원), 데일리 코트 로우(옵션 「260 · 화이트」, 89,000원). 줄마다 고르기 체크(처음 선택됨), 이미지 자리, 상품명, 옵션, 수량 숫자 입력(기본 1, 최소 1, 최대 5), 가격, 「삭제」 버튼. 오른쪽 「주문 요약」에 상품 금액 「228,000원」, 배송비 「0원」, 할인 「0원」, 결제 예정 금액 「228,000원」, 그리고 「주문하기」(주문·결제 /shop-checkout 로 가는 링크). 「쇼핑 계속하기」(상품 목록 /shop-product-list 로 가는 링크). [프로젝트: web]
 *
 * 정하지 않아 비워 둔 자리:
 * - 「신발」「의류」「용품」 카테고리 링크의 목적지 — 미정이라 `<a href="#">`.
 * - 「상품 검색」의 검색 동작과 결과 화면 — 제출은 막아 두었다.
 * - {브랜드명} — 환경설정이 소유하는 값이라 자리만 둔다.
 * - 상품 이미지 — 자리만 둔다.
 * - 주문 요약 금액의 계산 규칙(고른 상품만 셀지, 배송비·할인 조건) — 요청은 처음 상태의 값만 정했다.
 */
import { useState } from "react";

import { Badge, Button, Checkbox, CheckboxField, Input, NumberInput, buttonVariants } from "@ooee/ui";
import { RiSearchLine } from "@remixicon/react";

import { cn } from "@/lib/utils";

type CartItem = {
  id: string;
  name: string;
  option: string;
  price: number;
};

const INITIAL_ITEMS: CartItem[] = [
  { id: "air-runner-2", name: "에어 러너 2", option: "250 · 블랙", price: 139000 },
  { id: "daily-court-low", name: "데일리 코트 로우", option: "260 · 화이트", price: 89000 },
];

const CATEGORIES = ["신발", "의류", "용품"];

const MIN_QUANTITY = 1;
const MAX_QUANTITY = 5;
const SHIPPING_FEE = 0;
const DISCOUNT = 0;

// 경계가 없는 native 링크의 Focus 표시다(interaction.md 「Focus 선과 Ring」 유형 3).
const DETACHED_FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-oe-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-oe-background-primary";

const priceFormat = new Intl.NumberFormat("ko-KR");

function won(amount: number) {
  return `${priceFormat.format(amount)}원`;
}

export default function ShopCartPage() {
  const [items, setItems] = useState<CartItem[]>(INITIAL_ITEMS);
  const [selectedIds, setSelectedIds] = useState<string[]>(() => INITIAL_ITEMS.map((item) => item.id));
  const [quantities, setQuantities] = useState<Record<string, number>>(() =>
    Object.fromEntries(INITIAL_ITEMS.map((item) => [item.id, MIN_QUANTITY])),
  );

  const selectedItems = items.filter((item) => selectedIds.includes(item.id));
  const allSelected = items.length > 0 && selectedItems.length === items.length;
  const someSelected = selectedItems.length > 0 && !allSelected;
  const quantityOf = (id: string) => quantities[id] ?? MIN_QUANTITY;
  const productAmount = selectedItems.reduce((sum, item) => sum + item.price * quantityOf(item.id), 0);
  const paymentAmount = productAmount + SHIPPING_FEE - DISCOUNT;
  const cartCount = items.length;

  function toggleAll(checked: boolean) {
    setSelectedIds(checked ? items.map((item) => item.id) : []);
  }

  function toggleItem(id: string, checked: boolean) {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((selectedId) => selectedId !== id)));
  }

  function removeItems(ids: string[]) {
    setItems((prev) => prev.filter((item) => !ids.includes(item.id)));
    setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)));
  }

  const summaryRows = [
    { label: "상품 금액", value: won(productAmount) },
    { label: "배송비", value: won(SHIPPING_FEE) },
    { label: "할인", value: won(DISCOUNT) },
  ];

  return (
    <div className="flex min-h-dvh flex-col break-keep bg-oe-background-primary">
      <header className="border-b border-oe-border-secondary bg-oe-background-primary">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-8 px-oe-padding-default md:px-oe-padding-wide">
          <a href="/shop-product-list" className={cn("rounded-sm text-lg font-semibold text-oe-foreground-primary", DETACHED_FOCUS)}>
            {"{브랜드명}"}
          </a>

          <nav aria-label="카테고리">
            <ul className="flex items-center gap-6">
              {CATEGORIES.map((category) => (
                <li key={category}>
                  <a
                    href="#"
                    className={cn("rounded-sm text-sm font-medium text-oe-foreground-tertiary underline-offset-4 hover:underline", DETACHED_FOCUS)}
                  >
                    {category}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-6">
            <form role="search" onSubmit={(event) => event.preventDefault()} className="w-64">
              <Input type="search" aria-label="상품 검색" placeholder="상품 검색" leadingElement={<RiSearchLine aria-hidden="true" />} />
            </form>

            <a
              href="/shop-cart"
              aria-current="page"
              aria-label={cartCount > 0 ? `장바구니 ${cartCount}개` : "장바구니"}
              className={cn(
                "flex items-center gap-1.5 rounded-sm text-sm font-medium text-oe-foreground-tertiary underline-offset-4 hover:underline",
                DETACHED_FOCUS,
              )}
            >
              장바구니
              {cartCount > 0 ? <Badge>{cartCount}</Badge> : null}
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-oe-padding-default py-10 md:px-oe-padding-wide">
        <h1 className="text-2xl font-semibold text-oe-foreground-primary">장바구니</h1>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
          <div className="min-w-0">
            <div className="flex items-center justify-between gap-4 border-b border-oe-border-secondary pb-3">
              <CheckboxField
                className="-ml-2"
                label="전체 선택"
                isParent
                checked={allSelected}
                indeterminate={someSelected}
                disabled={items.length === 0}
                onCheckedChange={(checked) => toggleAll(checked)}
              />
              <Button
                variant="outline"
                tone="neutral"
                controlSize="small"
                disabled={selectedItems.length === 0}
                onClick={() => removeItems(selectedItems.map((item) => item.id))}
              >
                선택 삭제
              </Button>
            </div>

            {items.length === 0 ? (
              <p className="py-16 text-sm text-oe-foreground-tertiary">장바구니에 담긴 상품이 없습니다.</p>
            ) : (
              <ul>
                {items.map((item) => {
                  const quantity = quantityOf(item.id);

                  return (
                    <li key={item.id} className="flex items-start gap-4 border-b border-oe-border-secondary py-6">
                      <Checkbox
                        className="mt-1"
                        aria-label={`${item.name} 선택`}
                        checked={selectedIds.includes(item.id)}
                        onCheckedChange={(checked) => toggleItem(item.id, checked)}
                      />
                      <div aria-hidden="true" className="size-28 shrink-0 rounded-lg bg-oe-background-secondary" />
                      <div className="flex min-w-0 flex-1 items-start justify-between gap-6">
                        <div className="flex min-w-0 flex-col">
                          <p className="text-base font-medium text-oe-foreground-primary">{item.name}</p>
                          <p className="mt-1 text-sm text-oe-foreground-tertiary">{item.option}</p>
                          <div className="mt-4">
                            <NumberInput
                              aria-label={`${item.name} 수량`}
                              controlSize="small"
                              layout="fixed"
                              fixedWidth={112}
                              controlsPosition="split"
                              min={MIN_QUANTITY}
                              max={MAX_QUANTITY}
                              value={quantity}
                              decreaseLabel={`${item.name} 수량 줄이기`}
                              increaseLabel={`${item.name} 수량 늘리기`}
                              decreaseTooltip="감소"
                              increaseTooltip="증가"
                              onValueChange={(next) => {
                                if (next !== undefined) setQuantities((prev) => ({ ...prev, [item.id]: next }));
                              }}
                            />
                          </div>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-3">
                          <p className="text-base font-semibold tabular-nums text-oe-foreground-primary">{won(item.price * quantity)}</p>
                          <Button
                            variant="ghost"
                            tone="neutral"
                            controlSize="small"
                            aria-label={`${item.name} 삭제`}
                            onClick={() => removeItems([item.id])}
                          >
                            삭제
                          </Button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <aside aria-labelledby="shop-cart-summary-title" className="rounded-lg border border-oe-border-secondary p-6 lg:sticky lg:top-8">
            <h2 id="shop-cart-summary-title" className="text-lg font-semibold text-oe-foreground-primary">
              주문 요약
            </h2>
            <dl className="mt-5 flex flex-col gap-3 text-sm">
              {summaryRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-4">
                  <dt className="text-oe-foreground-secondary">{row.label}</dt>
                  <dd className="tabular-nums text-oe-foreground-primary">{row.value}</dd>
                </div>
              ))}
              <div className="mt-2 flex items-center justify-between gap-4 border-t border-oe-border-secondary pt-4">
                <dt className="text-base font-semibold text-oe-foreground-primary">결제 예정 금액</dt>
                <dd className="text-lg font-semibold tabular-nums text-oe-foreground-primary">{won(paymentAmount)}</dd>
              </div>
            </dl>
            <div className="mt-6 flex flex-col gap-1.5">
              <a href="/shop-checkout" className={buttonVariants({ variant: "fill", controlSize: "xlarge", layout: "fill" })}>
                주문하기
              </a>
              <a
                href="/shop-product-list"
                className={buttonVariants({ variant: "outline", tone: "neutral", controlSize: "xlarge", layout: "fill" })}
              >
                쇼핑 계속하기
              </a>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
