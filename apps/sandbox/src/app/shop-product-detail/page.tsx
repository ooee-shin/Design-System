"use client";

/*
 * 요청:
 * 이커머스 상품 상세. 이커머스 웹의 상품 상세 화면. 상단 머리글에 {브랜드명} 자리(상품 목록 /shop-product-list 로 가는 링크), 「신발」「의류」「용품」 카테고리 링크(목적지 미정), 「상품 검색」 입력, 담긴 수 2가 보이는 「장바구니」 링크(/shop-cart)를 둔다. 머리글 아래에 「신발」 > 「에어 러너 2」 경로 표시(「신발」은 상품 목록 /shop-product-list 로 가는 링크). 왼쪽에 큰 이미지 자리와 작은 이미지 자리 4개. 오른쪽에 상품명 「에어 러너 2」, 가격 「139,000원」, 「신상」·「무료배송」 표시. 「사이즈」는 필수로 하나 고른다(230·240·250·260·270·280, 280은 품절이라 고를 수 없음, 처음에는 고르지 않음). 「색상」은 하나 고른다(블랙·화이트·그레이, 기본 블랙). 「수량」은 숫자 입력(기본 1, 최소 1, 최대 5). 「장바구니 담기」 버튼과 「바로 구매」(주문·결제 /shop-checkout 로 가는 링크). 그 아래에 「상품 정보」, 「사이즈 안내」, 「배송·교환」 세 덩이를 차례로 두고 덩이마다 제목과 짧은 문단을 둔다. [프로젝트: web]
 *
 * 정하지 않아 비워 둔 자리:
 * - 「신발」「의류」「용품」 카테고리 링크의 목적지: 미정(`#`).
 * - 「장바구니 담기」를 누른 뒤의 동작(담겼다는 안내, 장바구니로 이동, 담긴 수 갱신): 미정. 제출만 막아 둔다.
 * - 「상품 검색」을 제출한 뒤의 동작: 미정. 제출만 막아 둔다.
 * - 이미지: 자리만 둔다. 작은 이미지를 눌러 큰 이미지를 바꾸는 동작은 요청에 없어 두지 않는다.
 * - 「상품 정보」「사이즈 안내」「배송·교환」의 문단 문구: 요청이 정하지 않아 짧게 채워 두었다. 실제 문구는 서비스가 정한다.
 */

import { Badge, Button, Field, Input, NumberInput, RadioField, RadioGroup, buttonVariants } from "@ooee/ui";
import { RiArrowRightSLine, RiSearchLine } from "@remixicon/react";

import { cn } from "@/lib/utils";

const FOCUS_RING =
  "outline-none focus-visible:ring-2 focus-visible:ring-oe-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-oe-background-primary";

const CATEGORIES = ["신발", "의류", "용품"];

const SIZES = ["230", "240", "250", "260", "270", "280"];
const SOLD_OUT_SIZES = new Set(["280"]);

const COLORS = ["블랙", "화이트", "그레이"];

const THUMBNAILS = [1, 2, 3, 4];

const DETAIL_SECTIONS = [
  {
    id: "product-info",
    title: "상품 정보",
    body: "가벼운 쿠션과 통기성이 좋은 갑피로 오래 걸어도 편하게 신을 수 있는 러닝화입니다.",
  },
  {
    id: "size-guide",
    title: "사이즈 안내",
    body: "평소 신는 사이즈를 고르시길 권합니다. 발볼이 넓다면 한 치수 크게 고르세요.",
  },
  {
    id: "shipping-exchange",
    title: "배송·교환",
    body: "무료배송으로 보내 드립니다. 받은 상품의 사이즈가 맞지 않으면 교환을 신청할 수 있습니다.",
  },
];

export default function ShopProductDetailPage() {
  return (
    <div className="flex min-h-dvh flex-col break-keep bg-oe-background-primary">
      <header className="border-b border-oe-border-secondary bg-oe-background-primary">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-8 px-oe-padding-default md:px-oe-padding-wide">
          <a href="/shop-product-list" className={cn("rounded-sm text-lg font-semibold text-oe-foreground-primary", FOCUS_RING)}>
            {"{브랜드명}"}
          </a>

          <nav aria-label="카테고리">
            <ul className="flex items-center gap-6">
              {CATEGORIES.map((category) => (
                <li key={category}>
                  <a
                    href="#"
                    className={cn("rounded-sm text-sm font-medium text-oe-foreground-tertiary underline-offset-4 hover:underline", FOCUS_RING)}
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
                FOCUS_RING,
              )}
            >
              장바구니
              <Badge>2</Badge>
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-16 px-oe-padding-default py-10 md:px-oe-padding-wide">
        <div className="flex flex-col gap-6">
          <nav aria-label="현재 위치">
            <ol className="flex items-center gap-1 text-sm">
              <li>
                <a
                  href="/shop-product-list"
                  className={cn("rounded-sm text-oe-foreground-tertiary underline-offset-4 hover:underline", FOCUS_RING)}
                >
                  신발
                </a>
              </li>
              <li aria-hidden="true" className="flex items-center text-oe-foreground-tertiary">
                <RiArrowRightSLine aria-hidden="true" className="size-oe-icon-small" />
              </li>
              <li>
                <span aria-current="page" className="text-oe-foreground-primary">
                  에어 러너 2
                </span>
              </li>
            </ol>
          </nav>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)]">
            <section aria-label="상품 이미지" className="flex flex-col gap-3">
              <div role="img" aria-label="에어 러너 2 대표 이미지" className="aspect-square w-full rounded-lg bg-oe-background-secondary" />
              <ul className="grid grid-cols-4 gap-3">
                {THUMBNAILS.map((index) => (
                  <li key={index}>
                    <div role="img" aria-label={`에어 러너 2 이미지 ${index}`} className="aspect-square w-full rounded-lg bg-oe-background-secondary" />
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="product-title" className="flex flex-col gap-8">
              <div className="flex flex-col gap-3">
                <h1 id="product-title" className="text-2xl font-semibold text-oe-foreground-primary">
                  에어 러너 2
                </h1>
                <p className="text-xl font-semibold text-oe-foreground-primary">139,000원</p>
                <div className="flex items-center gap-1.5">
                  <Badge>신상</Badge>
                  <Badge>무료배송</Badge>
                </div>
              </div>

              <form className="flex flex-col gap-6" onSubmit={(event) => event.preventDefault()}>
                <Field label="사이즈" required group>
                  <RadioGroup required className="-ml-2">
                    {SIZES.map((size) => (
                      <RadioField
                        key={size}
                        value={size}
                        label={size}
                        disabled={SOLD_OUT_SIZES.has(size)}
                        rightDescription={SOLD_OUT_SIZES.has(size) ? "품절" : undefined}
                      />
                    ))}
                  </RadioGroup>
                </Field>

                <Field label="색상" group>
                  <RadioGroup defaultValue="블랙" className="-ml-2">
                    {COLORS.map((color) => (
                      <RadioField key={color} value={color} label={color} />
                    ))}
                  </RadioGroup>
                </Field>

                <Field label="수량" className="w-40">
                  <NumberInput
                    defaultValue={1}
                    min={1}
                    max={5}
                    controlSize="xlarge"
                    decreaseLabel="값 줄이기"
                    increaseLabel="값 늘리기"
                    decreaseTooltip="감소"
                    increaseTooltip="증가"
                  />
                </Field>

                <div className="grid grid-cols-2 gap-1.5">
                  <Button type="submit" controlSize="xlarge" layout="fill">
                    장바구니 담기
                  </Button>
                  <a href="/shop-checkout" className={buttonVariants({ variant: "tonal", controlSize: "xlarge", layout: "fill" })}>
                    바로 구매
                  </a>
                </div>
              </form>
            </section>
          </div>
        </div>

        <div className="flex flex-col">
          {DETAIL_SECTIONS.map((section) => (
            <section
              key={section.id}
              aria-labelledby={section.id}
              className="flex flex-col gap-2 border-t border-oe-border-secondary py-6"
            >
              <h2 id={section.id} className="text-lg font-semibold text-oe-foreground-primary">
                {section.title}
              </h2>
              <p className="text-sm text-oe-foreground-secondary">{section.body}</p>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
