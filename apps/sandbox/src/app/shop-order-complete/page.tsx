"use client";

/**
 * 이커머스 주문 완료
 *
 * 요청:
 * 이커머스 주문 완료. 이커머스 웹의 주문 완료 화면. 상단 머리글은 다른 화면과 같되 「장바구니」 링크(/shop-cart)에 담긴 수를 보이지 않는다({브랜드명} 자리는 상품 목록 /shop-product-list 로 가는 링크, 「신발」「의류」「용품」 카테고리 링크(목적지 미정), 「상품 검색」 입력). 본문 제목 「주문이 완료되었어요」와 안내 문단 「주문 내역은 마이페이지에서 확인할 수 있어요.」. 「주문 정보」 덩이에 주문번호 「20260922-0001」, 결제 금액 「228,000원」, 결제 수단 「신용카드」, 받는 분·연락처·주소 자리. 「주문 상품」 덩이에 에어 러너 2(250 · 블랙 · 1개, 139,000원)와 데일리 코트 로우(260 · 화이트 · 1개, 89,000원). 「주문 내역 보기」 링크(목적지 미정)와 「쇼핑 계속하기」(상품 목록 /shop-product-list 로 가는 링크). [프로젝트: web]
 *
 * 정하지 않아 비워 둔 자리:
 * - {브랜드명}: 환경설정이 소유하는 값이라 자리만 둔다.
 * - 「신발」「의류」「용품」 카테고리 링크의 목적지: 미정이라 `href="#"`.
 * - 「주문 내역 보기」 링크의 목적지: 미정이라 `href="#"`.
 * - 받는 분·연락처·주소의 값: 자리만 둔다({받는 분}·{연락처}·{주소}).
 * - 「상품 검색」 입력의 제출 동작: 서버 호출 없이 `event.preventDefault()` 까지만 둔다.
 * - 상품 이미지: 자리만 둔다.
 */
import { Input, buttonVariants } from "@ooee/ui";
import { RiSearchLine } from "@remixicon/react";

import { cn } from "@/lib/utils";

const DETACHED_FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-oe-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-oe-background-primary";

const TEXT_LINK = cn("rounded-sm text-sm font-medium text-oe-foreground-tertiary underline-offset-4 hover:underline", DETACHED_FOCUS);

const CATEGORIES = ["신발", "의류", "용품"];

const ORDER_INFO = [
  { term: "주문번호", value: "20260922-0001" },
  { term: "결제 금액", value: "228,000원" },
  { term: "결제 수단", value: "신용카드" },
  { term: "받는 분", value: "{받는 분}" },
  { term: "연락처", value: "{연락처}" },
  { term: "주소", value: "{주소}" },
];

const ORDER_ITEMS = [
  { name: "에어 러너 2", option: "250 · 블랙 · 1개", price: "139,000원" },
  { name: "데일리 코트 로우", option: "260 · 화이트 · 1개", price: "89,000원" },
];

export default function ShopOrderCompletePage() {
  return (
    <div className="flex min-h-dvh flex-col bg-oe-background-primary break-keep">
      <header className="border-b border-oe-border-secondary bg-oe-background-primary">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-8 px-oe-padding-default md:px-oe-padding-wide">
          <a href="/shop-product-list" className={cn("rounded-sm text-lg font-semibold text-oe-foreground-primary", DETACHED_FOCUS)}>
            {"{브랜드명}"}
          </a>
          <nav aria-label="카테고리">
            <ul className="flex items-center gap-6">
              {CATEGORIES.map((category) => (
                <li key={category}>
                  <a href="#" className={TEXT_LINK}>
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
            <a href="/shop-cart" className={TEXT_LINK}>
              장바구니
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-oe-padding-default py-10 md:px-oe-padding-wide">
        <div className="max-w-2xl">
          <div>
            <h1 className="text-2xl font-semibold text-oe-foreground-primary">주문이 완료되었어요</h1>
            <p className="mt-2 text-sm text-oe-foreground-secondary">주문 내역은 마이페이지에서 확인할 수 있어요.</p>
          </div>

          <div className="mt-8 flex flex-col gap-6">
            <section aria-labelledby="order-info-title" className="rounded-lg border border-oe-border-secondary p-6">
              <h2 id="order-info-title" className="text-lg font-semibold text-oe-foreground-primary">
                주문 정보
              </h2>
              <dl className="mt-5 flex flex-col gap-3 text-sm">
                {ORDER_INFO.map((row) => (
                  <div key={row.term} className="flex gap-4">
                    <dt className="w-24 shrink-0 text-oe-foreground-secondary">{row.term}</dt>
                    <dd className="min-w-0 tabular-nums text-oe-foreground-primary">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section aria-labelledby="order-items-title" className="rounded-lg border border-oe-border-secondary p-6">
              <h2 id="order-items-title" className="text-lg font-semibold text-oe-foreground-primary">
                주문 상품
              </h2>
              <ul className="mt-5 flex flex-col divide-y divide-oe-border-secondary">
                {ORDER_ITEMS.map((item) => (
                  <li key={item.name} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
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

            <div className="flex flex-wrap gap-1.5">
              <a href="#" className={buttonVariants({ variant: "outline", tone: "neutral", controlSize: "large" })}>
                주문 내역 보기
              </a>
              <a href="/shop-product-list" className={buttonVariants({ variant: "fill", controlSize: "large" })}>
                쇼핑 계속하기
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
