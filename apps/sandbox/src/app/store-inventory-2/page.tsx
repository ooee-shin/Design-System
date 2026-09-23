"use client"

/**
 * 매장 재고 조회. 매장 직원이 판매대에서 상품 재고를 확인하는 화면입니다. 맨 위에 「재고 조회」 제목을 두고 그
 * 아래에 상품명이나 바코드를 적는 검색 칸과 「조회」 버튼을 나란히 놓습니다. 검색 결과는 표로 보여 주며 열은
 * 상품명·규격·매장 재고·창고 재고·최근 입고일(2026-09-23 꼴) 다섯 개입니다. 매장 재고가 0이면 그 줄의 재고
 * 숫자 옆에 「품절」 배지를, 3개 이하이면 「부족」 배지를 답니다. 표 위에는 전체·품절·부족으로 거르는 칩 세
 * 개를 두고 처음에는 전체가 골라져 있습니다. 검색하기 전에는 표 자리에 「상품명이나 바코드로 조회해 주세요.」
 * 한 줄만 보여 주고, 조회 결과가 없으면 「조회된 상품이 없습니다.」를 보여 줍니다. 줄을 누르면 상세로 가지만
 * 상세 화면은 이번 요청에 들어가지 않습니다. 프로젝트: harness-test 유형: web
 * 개선: 데모 데이터도 넣어줘
 *
 * 정하지 않아 비워 둔 자리:
 * - 검색 칸 placeholder 문구
 * - 표에 쓰이는 실제 상품 데이터
 * - 줄을 누르면 열리는 상세 화면 주소
 */

import { useState, type FormEvent } from "react"
import { RiSearchLine } from "@remixicon/react"
import { Badge, Button, Chip, Input } from "@ooee/ui"

type StockRow = {
  name: string
  spec: string
  storeStock: number
  warehouseStock: number
  restockedAt: string
}

const PRODUCTS: StockRow[] = [
  { name: "클래식 화이트 티셔츠", spec: "M", storeStock: 12, warehouseStock: 84, restockedAt: "2026-09-20" },
  { name: "클래식 화이트 티셔츠", spec: "L", storeStock: 3, warehouseStock: 40, restockedAt: "2026-09-20" },
  { name: "슬림 데님 팬츠", spec: "30", storeStock: 0, warehouseStock: 15, restockedAt: "2026-09-11" },
  { name: "슬림 데님 팬츠", spec: "32", storeStock: 8, warehouseStock: 22, restockedAt: "2026-09-11" },
  { name: "오버핏 후드 집업", spec: "FREE", storeStock: 2, warehouseStock: 6, restockedAt: "2026-09-05" },
  { name: "울 블렌드 코트", spec: "M", storeStock: 0, warehouseStock: 0, restockedAt: "2026-08-28" },
  { name: "울 블렌드 코트", spec: "L", storeStock: 1, warehouseStock: 4, restockedAt: "2026-08-28" },
  { name: "베이직 크루넥 니트", spec: "FREE", storeStock: 17, warehouseStock: 30, restockedAt: "2026-09-22" },
  { name: "체크 플리츠 스커트", spec: "S", storeStock: 5, warehouseStock: 18, restockedAt: "2026-09-14" },
  { name: "린넨 반팔 셔츠", spec: "M", storeStock: 0, warehouseStock: 9, restockedAt: "2026-09-02" },
  { name: "린넨 반팔 셔츠", spec: "L", storeStock: 6, warehouseStock: 11, restockedAt: "2026-09-02" },
  { name: "스트레이트 슬랙스", spec: "28", storeStock: 3, warehouseStock: 5, restockedAt: "2026-09-18" },
  { name: "레더 스니커즈", spec: "260", storeStock: 9, warehouseStock: 27, restockedAt: "2026-09-19" },
  { name: "레더 스니커즈", spec: "270", storeStock: 0, warehouseStock: 3, restockedAt: "2026-09-19" },
  { name: "캔버스 크로스백", spec: "FREE", storeStock: 14, warehouseStock: 20, restockedAt: "2026-09-21" },
  { name: "니트 비니", spec: "FREE", storeStock: 2, warehouseStock: 45, restockedAt: "2026-09-08" },
]

type FilterKey = "all" | "soldOut" | "low"

function matchesFilter(row: StockRow, filter: FilterKey) {
  if (filter === "soldOut") return row.storeStock === 0
  if (filter === "low") return row.storeStock > 0 && row.storeStock <= 3
  return true
}

export default function StoreInventoryPage2() {
  const [query, setQuery] = useState("")
  const [searched, setSearched] = useState(false)
  const [filter, setFilter] = useState<FilterKey>("all")
  const [results, setResults] = useState<StockRow[]>([])

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const keyword = query.trim()
    const matched = keyword
      ? PRODUCTS.filter((row) => row.name.includes(keyword) || row.spec.includes(keyword))
      : PRODUCTS
    setResults(matched)
    setSearched(true)
  }

  const filteredResults = results.filter((row) => matchesFilter(row, filter))

  return (
    <div className="min-h-dvh bg-oe-background-primary">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-10">
        <h1 className="text-2xl font-semibold text-oe-foreground-primary">재고 조회</h1>

        <form onSubmit={handleSearch} className="flex items-center gap-3">
          <Input
            aria-label="상품명 또는 바코드"
            placeholder="상품명 또는 바코드를 입력하세요"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            clearable
            onClear={() => setQuery("")}
            leadingElement={<RiSearchLine aria-hidden="true" />}
            layout="fill"
            className="flex-1"
          />
          <Button type="submit" tone="brand" variant="fill" controlSize="regular">
            조회
          </Button>
        </form>

        <div className="flex flex-wrap gap-1.5">
          <Chip shape="rounded" active={filter === "all"} onClick={() => setFilter("all")}>
            전체
          </Chip>
          <Chip shape="rounded" active={filter === "soldOut"} onClick={() => setFilter("soldOut")}>
            품절
          </Chip>
          <Chip shape="rounded" active={filter === "low"} onClick={() => setFilter("low")}>
            부족
          </Chip>
        </div>

        {!searched ? (
          <p className="text-oe-foreground-secondary">상품명이나 바코드로 조회해 주세요.</p>
        ) : filteredResults.length === 0 ? (
          <p className="text-oe-foreground-secondary">조회된 상품이 없습니다.</p>
        ) : (
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-oe-border-secondary">
                <th className="px-3 py-2 text-sm font-medium text-oe-foreground-secondary">상품명</th>
                <th className="px-3 py-2 text-sm font-medium text-oe-foreground-secondary">규격</th>
                <th className="px-3 py-2 text-sm font-medium text-oe-foreground-secondary">매장 재고</th>
                <th className="px-3 py-2 text-sm font-medium text-oe-foreground-secondary">창고 재고</th>
                <th className="px-3 py-2 text-sm font-medium text-oe-foreground-secondary">최근 입고일</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map((row) => (
                <tr key={`${row.name}-${row.spec}`} className="relative border-b border-oe-border-secondary last:border-b-0">
                  <td className="px-3 py-2 text-oe-foreground-primary">
                    <a href="#" className="static outline-none before:absolute before:inset-0 focus-visible:ring-2 focus-visible:ring-oe-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-oe-background-primary">
                      {row.name}
                    </a>
                  </td>
                  <td className="px-3 py-2 text-oe-foreground-secondary">{row.spec}</td>
                  <td className="px-3 py-2 text-oe-foreground-primary">
                    <span className="inline-flex items-center gap-2">
                      {row.storeStock}
                      {row.storeStock === 0 ? (
                        <Badge tone="danger">품절</Badge>
                      ) : row.storeStock <= 3 ? (
                        <Badge tone="warning">부족</Badge>
                      ) : null}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-oe-foreground-primary">{row.warehouseStock}</td>
                  <td className="px-3 py-2 text-oe-foreground-secondary">{row.restockedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
