"use client";

/**
 * 매장 재고 조회. 매장 직원이 판매대에서 상품 재고를 확인하는 화면입니다. 맨 위에 「재고 조회」
 * 제목을 두고 그 아래에 상품명이나 바코드를 적는 검색 칸과 「조회」 버튼을 나란히 놓습니다.
 * 검색 결과는 표로 보여 주며 열은 상품명·규격·매장 재고·창고 재고·최근 입고일(2026-09-23 꼴)
 * 다섯 개입니다. 매장 재고가 0이면 그 줄의 재고 숫자 옆에 「품절」 배지를, 3개 이하이면 「부족」
 * 배지를 답니다. 표 위에는 전체·품절·부족으로 거르는 칩 세 개를 두고 처음에는 전체가 골라져
 * 있습니다. 검색하기 전에는 표 자리에 「상품명이나 바코드로 조회해 주세요.」 한 줄만 보여 주고,
 * 조회 결과가 없으면 「조회된 상품이 없습니다.」를 보여 줍니다. 줄을 누르면 상세로 가지만 상세
 * 화면은 이번 요청에 들어가지 않습니다.
 *
 * 정하지 않아 비워 둔 자리:
 * - 검색 칸의 placeholder 문구
 * - 표에 쓰이는 실제 상품 데이터(이름·규격·재고 수량·입고일)
 * - 줄을 눌렀을 때 열리는 상세 화면 주소
 */

import { useMemo, useState } from "react";
import { Badge, Button, Chip, Input } from "@ooee/ui";
import { RiSearchLine } from "@remixicon/react";

type StockRow = {
  id: string;
  name: string;
  barcode: string;
  spec: string;
  storeStock: number;
  warehouseStock: number;
  restockedAt: string;
};

const PRODUCTS: StockRow[] = [
  { id: "p1", name: "데일리 맨투맨", barcode: "8801234567890", spec: "XL", storeStock: 12, warehouseStock: 40, restockedAt: "2026-09-10" },
  { id: "p2", name: "베이직 반팔티", barcode: "8801234567891", spec: "M", storeStock: 3, warehouseStock: 20, restockedAt: "2026-09-15" },
  { id: "p3", name: "스트레치 청바지", barcode: "8801234567892", spec: "32", storeStock: 0, warehouseStock: 15, restockedAt: "2026-09-08" },
  { id: "p4", name: "여름 원피스", barcode: "8801234567893", spec: "S", storeStock: 7, warehouseStock: 10, restockedAt: "2026-09-18" },
  { id: "p5", name: "니트 가디건", barcode: "8801234567894", spec: "L", storeStock: 2, warehouseStock: 5, restockedAt: "2026-09-20" },
  { id: "p6", name: "캐주얼 자켓", barcode: "8801234567895", spec: "M", storeStock: 0, warehouseStock: 8, restockedAt: "2026-09-05" },
  { id: "p7", name: "트레이닝 팬츠", barcode: "8801234567896", spec: "XL", storeStock: 15, warehouseStock: 30, restockedAt: "2026-09-21" },
  { id: "p8", name: "기본 후드티", barcode: "8801234567897", spec: "L", storeStock: 5, warehouseStock: 25, restockedAt: "2026-09-19" },
];

type StockFilter = "all" | "soldout" | "low";

function stockBadge(storeStock: number) {
  if (storeStock === 0) {
    return <Badge tone="danger">품절</Badge>;
  }
  if (storeStock <= 3) {
    return <Badge tone="warning">부족</Badge>;
  }
  return null;
}

export default function StoreInventoryPage() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState<string | null>(null);
  const [filter, setFilter] = useState<StockFilter>("all");

  const results = useMemo(() => {
    if (submittedQuery === null) {
      return [];
    }
    const keyword = submittedQuery.trim().toLowerCase();
    const matched = keyword
      ? PRODUCTS.filter(
          (product) => product.name.toLowerCase().includes(keyword) || product.barcode.includes(keyword),
        )
      : PRODUCTS;
    if (filter === "soldout") {
      return matched.filter((product) => product.storeStock === 0);
    }
    if (filter === "low") {
      return matched.filter((product) => product.storeStock > 0 && product.storeStock <= 3);
    }
    return matched;
  }, [submittedQuery, filter]);

  return (
    <main className="min-h-dvh bg-oe-background-canvas-primary px-oe-padding-wide py-10">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <h1 className="text-2xl font-semibold text-oe-foreground-primary">재고 조회</h1>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            setSubmittedQuery(query);
          }}
          className="flex items-center gap-3"
        >
          <div className="flex-1">
            <Input
              aria-label="상품명 또는 바코드"
              placeholder="상품명 또는 바코드를 입력하세요"
              controlSize="regular"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              clearable={query.length > 0}
              onClear={() => setQuery("")}
              leadingElement={<RiSearchLine aria-hidden="true" />}
            />
          </div>
          <Button type="submit" tone="brand" variant="fill" controlSize="regular">
            조회
          </Button>
        </form>

        <div className="flex flex-wrap gap-[6px]">
          <Chip shape="rounded" active={filter === "all"} onClick={() => setFilter("all")}>
            전체
          </Chip>
          <Chip shape="rounded" active={filter === "soldout"} onClick={() => setFilter("soldout")}>
            품절
          </Chip>
          <Chip shape="rounded" active={filter === "low"} onClick={() => setFilter("low")}>
            부족
          </Chip>
        </div>

        <div aria-live="polite">
          {submittedQuery === null ? (
            <p className="py-16 text-center text-oe-foreground-secondary">상품명이나 바코드로 조회해 주세요.</p>
          ) : results.length === 0 ? (
            <p className="py-16 text-center text-oe-foreground-secondary">조회된 상품이 없습니다.</p>
          ) : (
            <div className="overflow-x-auto rounded-md border border-oe-border-secondary bg-oe-background-primary">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-oe-border-secondary">
                    <th scope="col" className="px-4 py-3 text-sm font-medium text-oe-foreground-secondary">
                      상품명
                    </th>
                    <th scope="col" className="px-4 py-3 text-sm font-medium text-oe-foreground-secondary">
                      규격
                    </th>
                    <th scope="col" className="px-4 py-3 text-sm font-medium text-oe-foreground-secondary">
                      매장 재고
                    </th>
                    <th scope="col" className="px-4 py-3 text-sm font-medium text-oe-foreground-secondary">
                      창고 재고
                    </th>
                    <th scope="col" className="px-4 py-3 text-sm font-medium text-oe-foreground-secondary">
                      최근 입고일
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((row) => (
                    <tr
                      key={row.id}
                      className="relative border-b border-oe-border-secondary last:border-b-0 hover:bg-oe-interaction-hover-subtle"
                    >
                      <td className="px-4 py-3 text-oe-foreground-primary">
                        <a
                          href="#"
                          aria-label={`${row.name} 상세 보기`}
                          className="absolute inset-0 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-oe-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-oe-background-primary"
                        />
                        {row.name}
                      </td>
                      <td className="px-4 py-3 text-oe-foreground-secondary">{row.spec}</td>
                      <td className="px-4 py-3 text-oe-foreground-primary">
                        <span className="inline-flex items-center gap-2">
                          <span className="tabular-nums">{row.storeStock}</span>
                          {stockBadge(row.storeStock)}
                        </span>
                      </td>
                      <td className="px-4 py-3 tabular-nums text-oe-foreground-primary">{row.warehouseStock}</td>
                      <td className="px-4 py-3 tabular-nums text-oe-foreground-secondary">{row.restockedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
