"use client";

/**
 * 요청:
 * 이커머스 상품 목록. 이커머스 웹의 상품 목록 화면. 상단 머리글에 {브랜드명} 자리(상품 목록 /shop-product-list 로 가는 링크), 「신발」「의류」「용품」 카테고리 링크(목적지 미정), 「상품 검색」 입력, 담긴 수 2가 보이는 「장바구니」 링크(/shop-cart)를 둔다. 본문 제목 「신발」과 상품 수 「8개」. 왼쪽 거르개에 「사이즈」(230·240·250·260·270·280 가운데 여러 개 고르기, 처음에는 아무것도 고르지 않음), 「가격」(전체·10만원 이하·10만~20만원·20만원 이상 가운데 하나, 기본 전체), 「품절 상품 제외」 체크(처음 꺼짐). 목록 오른쪽 위에 정렬(추천순·신상품순·낮은 가격순·높은 가격순, 기본 추천순). 상품 카드 8개를 격자로 두고 카드마다 이미지 자리·상품명·가격을 보인다: 에어 러너 2 139,000원 「신상」, 데일리 코트 로우 89,000원, 트레일 워커 GTX 189,000원 「품절」, 클라우드 슬라이드 49,000원, 레트로 조거 119,000원, 스피드 레이서 229,000원 「신상」, 캔버스 하이 69,000원, 모닝 워크 99,000원. 에어 러너 2 카드는 상품 상세(/shop-product-detail)로 가는 링크이고 나머지 카드의 목적지는 정하지 않는다. 목록 아래에 페이지 이동 「1」「2」「다음」 링크. [프로젝트: web]
 *
 * 정하지 않아 비워 둔 자리:
 * - 브랜드명: 환경설정이 소유하는 값이라 `{브랜드명}` 자리만 둔다.
 * - 목적지: 「신발」「의류」「용품」 카테고리 링크, 에어 러너 2 를 뺀 상품 카드 7개, 페이지 이동 「1」「2」「다음」은 `href="#"`.
 * - 상품 이미지: 자리만 둔다.
 * - 검색 제출, 거르개·정렬을 바꾼 뒤 목록을 다시 거르고 늘어놓는 동작: 요청에 없어 두지 않는다. 고른 값만 화면에 남고 목록과 「8개」는 그대로다.
 */

import { useState } from "react";

import { Badge, CheckboxField, Chip, Field, Input, RadioField, RadioGroup, Select } from "@ooee/ui";
import { RiSearchLine } from "@remixicon/react";

import { cn } from "@/lib/utils";

const DETACHED_FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-oe-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-oe-background-primary";

const CATEGORIES = ["신발", "의류", "용품"];

const SIZES = ["230", "240", "250", "260", "270", "280"];

const PRICE_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "under-100k", label: "10만원 이하" },
  { value: "100k-200k", label: "10만~20만원" },
  { value: "over-200k", label: "20만원 이상" },
];

const SORT_OPTIONS = [
  { value: "recommended", label: "추천순" },
  { value: "newest", label: "신상품순" },
  { value: "price-asc", label: "낮은 가격순" },
  { value: "price-desc", label: "높은 가격순" },
];

type Product = {
  name: string;
  price: string;
  href: string;
  badge?: "신상" | "품절";
};

const PRODUCTS: Product[] = [
  { name: "에어 러너 2", price: "139,000원", href: "/shop-product-detail", badge: "신상" },
  { name: "데일리 코트 로우", price: "89,000원", href: "#" },
  { name: "트레일 워커 GTX", price: "189,000원", href: "#", badge: "품절" },
  { name: "클라우드 슬라이드", price: "49,000원", href: "#" },
  { name: "레트로 조거", price: "119,000원", href: "#" },
  { name: "스피드 레이서", price: "229,000원", href: "#", badge: "신상" },
  { name: "캔버스 하이", price: "69,000원", href: "#" },
  { name: "모닝 워크", price: "99,000원", href: "#" },
];

export default function ShopProductListPage() {
  const [sizes, setSizes] = useState<string[]>([]);

  const toggleSize = (size: string) => {
    setSizes((current) => (current.includes(size) ? current.filter((item) => item !== size) : [...current, size]));
  };

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
            <form role="search" className="w-64" onSubmit={(event) => event.preventDefault()}>
              <Input type="search" aria-label="상품 검색" placeholder="상품 검색" leadingElement={<RiSearchLine aria-hidden="true" />} />
            </form>

            <a
              href="/shop-cart"
              aria-label="장바구니 2개"
              className={cn(
                "flex items-center gap-1.5 rounded-sm text-sm font-medium text-oe-foreground-tertiary underline-offset-4 hover:underline",
                DETACHED_FOCUS,
              )}
            >
              장바구니
              <Badge>2</Badge>
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-oe-padding-default py-10 md:px-oe-padding-wide">
        <div className="flex items-end justify-between gap-6">
          <div className="flex items-baseline gap-2">
            <h1 className="text-2xl font-semibold text-oe-foreground-primary">신발</h1>
            <p className="text-sm text-oe-foreground-tertiary">8개</p>
          </div>
          <Field label="정렬" className="w-40">
            <Select options={SORT_OPTIONS} defaultValue="recommended" />
          </Field>
        </div>

        <div className="mt-8 flex flex-col gap-10 lg:flex-row">
          <aside aria-label="거르개" className="flex w-full shrink-0 flex-col gap-6 lg:w-56">
            <Field label="사이즈" group>
              <div role="group" className="flex flex-wrap gap-1.5">
                {SIZES.map((size) => (
                  <Chip key={size} shape="rounded" active={sizes.includes(size)} onClick={() => toggleSize(size)}>
                    {size}
                  </Chip>
                ))}
              </div>
            </Field>

            <Field label="가격" group>
              <RadioGroup defaultValue="all" className="-ml-2 flex flex-col">
                {PRICE_OPTIONS.map((option) => (
                  <RadioField key={option.value} value={option.value} label={option.label} />
                ))}
              </RadioGroup>
            </Field>

            <CheckboxField label="품절 상품 제외" className="-ml-2" />
          </aside>

          <section aria-label="상품 목록" className="min-w-0 flex-1">
            <ul className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
              {PRODUCTS.map((product) => (
                <li key={product.name}>
                  <a href={product.href} className={cn("group flex flex-col gap-3 rounded-md", DETACHED_FOCUS)}>
                    <div aria-hidden="true" className="aspect-square w-full rounded-lg bg-oe-background-secondary" />
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium text-oe-foreground-primary group-hover:underline">{product.name}</p>
                      <p className="text-base font-semibold text-oe-foreground-primary">{product.price}</p>
                      {product.badge ? (
                        <Badge className="mt-1">{product.badge}</Badge>
                      ) : null}
                    </div>
                  </a>
                </li>
              ))}
            </ul>

            <nav aria-label="페이지 이동" className="mt-12 flex items-center gap-1">
              <a href="#" aria-current="page" className={cn("rounded-sm px-2 py-1 text-sm font-semibold text-oe-foreground-primary", DETACHED_FOCUS)}>
                1
              </a>
              <a href="#" className={cn("rounded-sm px-2 py-1 text-sm text-oe-foreground-tertiary hover:underline", DETACHED_FOCUS)}>
                2
              </a>
              <a href="#" className={cn("rounded-sm px-2 py-1 text-sm text-oe-foreground-tertiary hover:underline", DETACHED_FOCUS)}>
                다음
              </a>
            </nav>
          </section>
        </div>
      </main>
    </div>
  );
}
