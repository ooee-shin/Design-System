"use client";

/*
 * 이커머스 주문·결제 — GitHub 이슈 #9 의 5장 흐름
 * (상품 목록 → 상품 상세 → 장바구니 → 주문·결제 → 주문 완료) 가운데 넷째 장이다. 데스크톱 웹 폭.
 *
 * 요청:
 * 이커머스 주문·결제. 이커머스 웹의 주문·결제 화면. 상단 머리글에 {브랜드명} 자리(상품 목록 /shop-product-list 로 가는 링크), 「신발」「의류」「용품」 카테고리 링크(목적지 미정), 「상품 검색」 입력, 담긴 수 2가 보이는 「장바구니」 링크(/shop-cart)를 둔다. 본문 제목 「주문·결제」. 「배송지」 덩이에 「받는 분」(필수), 「연락처」(필수, placeholder 「010-0000-0000」), 「주소」(필수, 「주소 찾기」로 주소 선택 화면을 여는 자리와 「상세 주소」 입력), 「배송 요청 사항」 하나 고르기(선택 안 함·문 앞에 놓아 주세요·경비실에 맡겨 주세요·배송 전에 연락 주세요, 기본 선택 안 함). 「주문 상품」 덩이에 에어 러너 2(250 · 블랙 · 1개, 139,000원)와 데일리 코트 로우(260 · 화이트 · 1개, 89,000원). 「결제 수단」 하나 고르기(신용카드·계좌이체·간편결제, 기본 신용카드). 오른쪽 「결제 금액」에 상품 금액 「228,000원」, 배송비 「0원」, 할인 「0원」, 총 결제 금액 「228,000원」, 「구매 조건을 확인했으며 결제 진행에 동의합니다」 필수 체크(처음 꺼짐), 「228,000원 결제하기」(주문 완료 /shop-order-complete 로 가는 링크). [프로젝트: web]
 *
 * 정하지 않아 비워 둔 자리:
 * - 「신발」「의류」「용품」의 목적지 — 미정이라 `<a href="#">`로 둔다.
 * - 「상품 검색」을 제출한 뒤의 동작 — 정하지 않아 `<form>`의 제출을 막아 둔다.
 * - 「주소 찾기」가 여는 주소 선택 화면 — 화면이 정해지지 않아 `InputButton`에 `onClick`을 잇지 않았다.
 * - 상품 이미지 — 자리만 둔다.
 * - 동의를 켜지 않고 「228,000원 결제하기」를 눌렀을 때 — 요청이 막으라고 하지 않아 링크는 그대로 이동한다.
 *   필수 입력의 검증과 오류 문구도 두지 않았다.
 */

import { Badge, buttonVariants, CheckboxField, Field, Input, InputButton, RadioField, RadioGroup, Select } from "@ooee/ui";
import { RiSearchLine } from "@remixicon/react";

import { cn } from "@/lib/utils";

const TEXT_LINK_FOCUS =
  "rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-oe-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-oe-background-primary";

const CATEGORIES = ["신발", "의류", "용품"];

const DELIVERY_REQUESTS = [
  { value: "none", label: "선택 안 함" },
  { value: "door", label: "문 앞에 놓아 주세요" },
  { value: "security-office", label: "경비실에 맡겨 주세요" },
  { value: "call-before", label: "배송 전에 연락 주세요" },
];

const ORDER_ITEMS = [
  { id: "air-runner-2", name: "에어 러너 2", option: "250 · 블랙 · 1개", price: "139,000원" },
  { id: "daily-court-low", name: "데일리 코트 로우", option: "260 · 화이트 · 1개", price: "89,000원" },
];

const PAYMENT_METHODS = [
  { value: "card", label: "신용카드" },
  { value: "bank-transfer", label: "계좌이체" },
  { value: "easy-pay", label: "간편결제" },
];

const AMOUNTS = [
  { label: "상품 금액", value: "228,000원" },
  { label: "배송비", value: "0원" },
  { label: "할인", value: "0원" },
];

export default function ShopCheckoutPage() {
  return (
    <div className="flex min-h-dvh flex-col break-keep bg-oe-background-primary">
      <header className="border-b border-oe-border-secondary bg-oe-background-primary">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-8 px-oe-padding-default md:px-oe-padding-wide">
          <a href="/shop-product-list" className={cn("text-lg font-semibold text-oe-foreground-primary", TEXT_LINK_FOCUS)}>
            {"{브랜드명}"}
          </a>

          <nav aria-label="카테고리">
            <ul className="flex items-center gap-6">
              {CATEGORIES.map((category) => (
                <li key={category}>
                  <a
                    href="#"
                    className={cn("text-sm font-medium text-oe-foreground-tertiary underline-offset-4 hover:underline", TEXT_LINK_FOCUS)}
                  >
                    {category}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-6">
            <form role="search" className="w-64" onSubmit={(event) => event.preventDefault()}>
              <Input type="search" aria-label="상품 검색" placeholder="상품 검색" leadingElement={<RiSearchLine aria-hidden="true" />} />
            </form>

            <a
              href="/shop-cart"
              aria-label="장바구니 2개"
              className={cn("flex items-center gap-1.5 text-sm font-medium text-oe-foreground-tertiary underline-offset-4 hover:underline", TEXT_LINK_FOCUS)}
            >
              장바구니
              <Badge>2</Badge>
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-oe-padding-default py-10 md:px-oe-padding-wide">
        <h1 className="text-2xl font-semibold text-oe-foreground-primary">주문·결제</h1>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
          <div className="flex min-w-0 flex-col gap-6">
            <section aria-labelledby="shop-checkout-shipping-title" className="rounded-lg border border-oe-border-secondary p-6">
              <h2 id="shop-checkout-shipping-title" className="text-lg font-semibold text-oe-foreground-primary">
                배송지
              </h2>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <Field label="받는 분" required>
                  <Input controlSize="large" autoComplete="name" />
                </Field>
                <Field label="연락처" required>
                  <Input controlSize="large" type="tel" inputMode="numeric" autoComplete="tel" placeholder="010-0000-0000" />
                </Field>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <Field label="주소" required>
                    <InputButton controlSize="large" placeholder="주소 찾기" />
                  </Field>
                  <Input controlSize="large" aria-label="상세 주소" placeholder="상세 주소" autoComplete="address-line2" />
                </div>
                <Field label="배송 요청 사항" className="md:col-span-2">
                  <Select controlSize="large" options={DELIVERY_REQUESTS} defaultValue="none" />
                </Field>
              </div>
            </section>

            <section aria-labelledby="shop-checkout-items-title" className="rounded-lg border border-oe-border-secondary p-6">
              <h2 id="shop-checkout-items-title" className="text-lg font-semibold text-oe-foreground-primary">
                주문 상품
              </h2>
              <ul className="mt-5 flex flex-col divide-y divide-oe-border-secondary">
                {ORDER_ITEMS.map((item) => (
                  <li key={item.id} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
                    <div aria-hidden="true" className="size-20 shrink-0 rounded-lg bg-oe-background-secondary" />
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <p className="text-sm font-medium text-oe-foreground-primary">{item.name}</p>
                      <p className="text-sm text-oe-foreground-tertiary">{item.option}</p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold tabular-nums text-oe-foreground-primary">{item.price}</p>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="shop-checkout-payment-title" className="rounded-lg border border-oe-border-secondary p-6">
              <h2 id="shop-checkout-payment-title" className="text-lg font-semibold text-oe-foreground-primary">
                결제 수단
              </h2>
              <RadioGroup aria-labelledby="shop-checkout-payment-title" defaultValue="card" className="mt-3 flex flex-col">
                {PAYMENT_METHODS.map((method) => (
                  <RadioField key={method.value} value={method.value} label={method.label} className="-ml-2" />
                ))}
              </RadioGroup>
            </section>
          </div>

          <aside aria-labelledby="shop-checkout-amount-title" className="rounded-lg border border-oe-border-secondary p-6 lg:sticky lg:top-8">
            <h2 id="shop-checkout-amount-title" className="text-lg font-semibold text-oe-foreground-primary">
              결제 금액
            </h2>
            <dl className="mt-5 flex flex-col gap-3 text-sm">
              {AMOUNTS.map((amount) => (
                <div key={amount.label} className="flex items-center justify-between gap-4">
                  <dt className="text-oe-foreground-secondary">{amount.label}</dt>
                  <dd className="tabular-nums text-oe-foreground-primary">{amount.value}</dd>
                </div>
              ))}
              <div className="mt-2 flex items-center justify-between gap-4 border-t border-oe-border-secondary pt-4">
                <dt className="text-base font-semibold text-oe-foreground-primary">총 결제 금액</dt>
                <dd className="text-lg font-semibold tabular-nums text-oe-foreground-primary">228,000원</dd>
              </div>
            </dl>

            <div className="mt-6 flex flex-col gap-4">
              <CheckboxField label="구매 조건을 확인했으며 결제 진행에 동의합니다" required defaultChecked={false} className="-ml-2" />
              <a href="/shop-order-complete" className={buttonVariants({ controlSize: "xlarge", layout: "fill" })}>
                228,000원 결제하기
              </a>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
