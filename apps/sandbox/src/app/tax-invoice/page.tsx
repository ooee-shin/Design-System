"use client";

/**
 * 세금계산서 발행. 프로젝트: hr. 웹 태블릿 1194×834 가로 화면이다. 본사 담당자가 매장별 월 인건비를 세금계산서로
 * 발행하는 자리다. **이미 같은 key 의 화면이 있으니 덮어쓰지 말고 그 화면을 고친다 — key 는 tax-invoice 그대로
 * 두고 page.tsx 와 page.test.tsx 를 다시 쓴다.** 지금 화면과 달라지는 것은 하나다. 줄을 매장이 아니라 매장 ×
 * 고용형태로 나눈다. 같은 매장이라도 정직원과 알바가 각각 한 줄이고, 매장명 칸에 매장과 고용형태를 함께
 * 보인다(예: 강남점 · 정직원). 고용형태는 Badge 로 구분한다. 세금계산서는 줄 단위로 발행하므로 고르기도 줄
 * 단위다. 거르개에 고용형태(전체·정직원·알바)를 한 벌 더 둔다 — 발행 상태 거르개와 나란히 서고 둘 다 걸리면
 * 함께 좁힌다. 표 위의 고른 건수와 합계는 그대로 두되 고용형태별 합계도 함께 보인다. 나머지는 지금 화면과
 * 같다 — 연월 고르기, 사업자등록번호, 공급가액·세액·합계(세액은 공급가액의 10%, 실제로 계산), 상태 Badge, 표
 * 머리 체크박스의 일부 선택 상태, 발행 완료인 줄은 고를 수 없음, 아무것도 고르지 않으면 발행 버튼 비활성.
 * 매장과 금액은 가짜 데이터를 화면에 박아 둔다.
 *
 * 「지금 화면」 — 이 화면을 처음 만들 때 준 요청이다. 위 요청이 「나머지는 지금 화면과 같다」고 한 부분의
 * 근거라 그대로 남긴다.
 *
 * 세금계산서 발행. 웹 태블릿 1194×834 가로 화면이다. 본사 담당자가 매장별 월 인건비를 세금계산서로 발행하는
 * 자리다. 화면 위에는 연월 고르기와 발행 상태 거르개(전체·발행 전·발행 완료)가 한 줄로 선다. 본문은 표 하나다.
 * 열은 고르기 체크박스·매장명·사업자등록번호·공급가액·세액·합계·상태다. 금액은 오른쪽으로 맞추고 천 단위마다
 * 쉼표를 넣는다. 세액은 공급가액의 10%이고 합계는 공급가액과 세액의 합이다 — 박아 둔 공급가액에서 실제로
 * 계산한다. 상태는 Badge 로 구분한다. 표 머리의 체크박스로 전체를 고를 수 있고, 일부만 골랐을 때는 일부 선택
 * 상태로 보인다. 표 위에는 고른 건수와 그 합계 금액이 한 줄로 서고, 오른쪽 끝에 「세금계산서 발행」 버튼을 둔다.
 * 아무것도 고르지 않았으면 그 버튼은 비활성이다. 발행 완료인 줄은 고를 수 없다. 매장과 금액은 가짜 데이터를
 * 화면에 박아 둔다.
 *
 * 정하지 않아 비워 둔 자리
 * - 「세금계산서 발행」 버튼이 실제로 무엇을 부르는지. 발행 요청의 목적지가 정해지지 않아 동작을 두지 않았다.
 * - 고를 수 있는 연월의 범위. 화면에는 2026년 7~9월만 박아 두었고, 연월을 바꿔도 표의 줄은 바뀌지 않는다.
 * - 거르개를 바꿨을 때 보이지 않게 된 줄의 선택을 어떻게 다룰지. 지금은 선택을 푼다.
 * - 세액의 원 미만 끝수 처리. 박아 둔 공급가액이 모두 10원 단위라 끝수가 생기지 않는다.
 * - 고용형태 Badge 의 색. 요청이 색을 정하지 않아 분류 표시의 기본인 neutral 로 두었다.
 * - 고용형태별 합계가 무엇의 합계인지. 「고른 건수와 합계」 옆에 서므로 고른 줄의 합계를 고용형태로 나눈 값으로 두었다.
 */

import { useState } from "react";

import { Badge, Button, Checkbox, Chip, Field, Select } from "@ooee/ui";

type IssueStatus = "before" | "done";

type EmploymentType = "regular" | "partTime";

/** 세금계산서 한 장이 되는 줄이다. 매장 하나가 고용형태마다 한 줄씩 갖는다. */
type InvoiceRow = {
  id: string;
  store: string;
  businessNumber: string;
  employment: EmploymentType;
  supplyAmount: number;
  status: IssueStatus;
};

/** 화면에 박아 둔 가짜 데이터다. 매장과 금액은 실제 값이 아니다. */
const INVOICE_ROWS: InvoiceRow[] = [
  { id: "gangnam-regular", store: "강남점", businessNumber: "123-45-67890", employment: "regular", supplyAmount: 8_200_000, status: "before" },
  { id: "gangnam-part-time", store: "강남점", businessNumber: "123-45-67890", employment: "partTime", supplyAmount: 4_200_000, status: "before" },
  { id: "hongdae-regular", store: "홍대점", businessNumber: "214-88-01234", employment: "regular", supplyAmount: 6_100_000, status: "done" },
  { id: "hongdae-part-time", store: "홍대점", businessNumber: "214-88-01234", employment: "partTime", supplyAmount: 3_760_000, status: "before" },
  { id: "jamsil-regular", store: "잠실점", businessNumber: "305-12-77821", employment: "regular", supplyAmount: 9_800_000, status: "done" },
  { id: "jamsil-part-time", store: "잠실점", businessNumber: "305-12-77821", employment: "partTime", supplyAmount: 5_430_000, status: "done" },
  { id: "pangyo-regular", store: "판교점", businessNumber: "411-30-55019", employment: "regular", supplyAmount: 4_900_000, status: "before" },
  { id: "pangyo-part-time", store: "판교점", businessNumber: "411-30-55019", employment: "partTime", supplyAmount: 2_640_000, status: "before" },
  { id: "seomyeon-regular", store: "부산서면점", businessNumber: "602-19-40233", employment: "regular", supplyAmount: 7_300_000, status: "done" },
  { id: "seomyeon-part-time", store: "부산서면점", businessNumber: "602-19-40233", employment: "partTime", supplyAmount: 3_780_000, status: "before" },
  { id: "dunsan-regular", store: "대전둔산점", businessNumber: "305-44-91027", employment: "regular", supplyAmount: 4_500_000, status: "before" },
  { id: "dunsan-part-time", store: "대전둔산점", businessNumber: "305-44-91027", employment: "partTime", supplyAmount: 2_220_000, status: "done" },
];

const MONTH_OPTIONS = [
  { value: "2026-09", label: "2026년 9월" },
  { value: "2026-08", label: "2026년 8월" },
  { value: "2026-07", label: "2026년 7월" },
];

const STATUS_BADGE: Record<IssueStatus, { label: string; tone: "warning" | "success" }> = {
  before: { label: "발행 전", tone: "warning" },
  done: { label: "발행 완료", tone: "success" },
};

const EMPLOYMENT_LABEL: Record<EmploymentType, string> = {
  regular: "정직원",
  partTime: "알바",
};

const EMPLOYMENT_TYPES: EmploymentType[] = ["regular", "partTime"];

type StatusFilter = "all" | IssueStatus;

type EmploymentFilter = "all" | EmploymentType;

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "before", label: "발행 전" },
  { value: "done", label: "발행 완료" },
];

const EMPLOYMENT_FILTERS: { value: EmploymentFilter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "regular", label: "정직원" },
  { value: "partTime", label: "알바" },
];

const AMOUNT_FORMAT = new Intl.NumberFormat("ko-KR");

/** 세액은 공급가액의 10%다. */
function taxOf(supplyAmount: number) {
  return Math.round(supplyAmount * 0.1);
}

/** 합계는 공급가액과 세액의 합이다. */
function totalOf(supplyAmount: number) {
  return supplyAmount + taxOf(supplyAmount);
}

function sumOf(rows: InvoiceRow[]) {
  return rows.reduce((sum, row) => sum + totalOf(row.supplyAmount), 0);
}

/** 줄 체크박스의 이름에 쓰는 줄 이름이다. 요청의 예 「강남점 · 정직원」 꼴이다. */
function rowNameOf(row: InvoiceRow) {
  return `${row.store} · ${EMPLOYMENT_LABEL[row.employment]}`;
}

/** 두 거르개가 함께 걸리면 둘 다를 만족하는 줄만 남긴다. */
function visibleRowsOf(status: StatusFilter, employment: EmploymentFilter) {
  return INVOICE_ROWS.filter(
    (row) => (status === "all" || row.status === status) && (employment === "all" || row.employment === employment),
  );
}

export default function TaxInvoicePage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [employmentFilter, setEmploymentFilter] = useState<EmploymentFilter>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const visibleRows = visibleRowsOf(statusFilter, employmentFilter);
  // 발행 완료인 줄은 고를 수 없으므로 전체 선택도 발행 전인 줄만 다룬다.
  const selectableIds = visibleRows.filter((row) => row.status === "before").map((row) => row.id);
  const selectedRows = visibleRows.filter((row) => selectedIds.includes(row.id));

  const allSelected = selectableIds.length > 0 && selectableIds.every((id) => selectedIds.includes(id));
  const someSelected = selectedIds.length > 0 && !allSelected;

  function changeFilters(nextStatus: StatusFilter, nextEmployment: EmploymentFilter) {
    setStatusFilter(nextStatus);
    setEmploymentFilter(nextEmployment);
    const remaining = visibleRowsOf(nextStatus, nextEmployment).map((row) => row.id);
    setSelectedIds((previous) => previous.filter((id) => remaining.includes(id)));
  }

  function toggleRow(id: string, checked: boolean) {
    setSelectedIds((previous) => (checked ? [...previous, id] : previous.filter((selected) => selected !== id)));
  }

  return (
    <main className="flex min-h-dvh flex-col gap-6 bg-oe-background-canvas-secondary px-oe-padding-default py-8 md:px-oe-padding-wide">
      <h1 className="text-2xl font-semibold text-oe-foreground-primary">세금계산서 발행</h1>

      <div className="flex flex-wrap items-end gap-6">
        <Field label="연월" className="w-auto">
          <Select options={MONTH_OPTIONS} defaultValue="2026-09" layout="fixed" fixedWidth="10rem" />
        </Field>
        <Field label="발행 상태" group className="w-auto">
          <div role="group" className="flex flex-wrap items-center gap-1.5">
            {STATUS_FILTERS.map((filter) => (
              <Chip
                key={filter.value}
                shape="rounded"
                active={statusFilter === filter.value}
                onClick={() => changeFilters(filter.value, employmentFilter)}
              >
                {filter.label}
              </Chip>
            ))}
          </div>
        </Field>
        <Field label="고용형태" group className="w-auto">
          <div role="group" className="flex flex-wrap items-center gap-1.5">
            {EMPLOYMENT_FILTERS.map((filter) => (
              <Chip
                key={filter.value}
                shape="rounded"
                active={employmentFilter === filter.value}
                onClick={() => changeFilters(statusFilter, filter.value)}
              >
                {filter.label}
              </Chip>
            ))}
          </div>
        </Field>
      </div>

      <section className="flex flex-col gap-4 rounded-lg border border-oe-border-secondary bg-oe-background-primary p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <p className="text-oe-foreground-secondary">
              고른 건수 <span className="font-medium text-oe-foreground-primary tabular-nums">{selectedRows.length}건</span> ·
              합계{" "}
              <span className="font-medium text-oe-foreground-primary tabular-nums">{AMOUNT_FORMAT.format(sumOf(selectedRows))}원</span>
            </p>
            <ul
              aria-label="고용형태별 합계"
              className="flex flex-wrap items-center gap-x-3 border-l border-oe-border-secondary pl-3 text-oe-foreground-tertiary"
            >
              {EMPLOYMENT_TYPES.map((employment) => (
                <li key={employment}>
                  {EMPLOYMENT_LABEL[employment]}{" "}
                  <span className="text-oe-foreground-secondary tabular-nums">
                    {AMOUNT_FORMAT.format(sumOf(selectedRows.filter((row) => row.employment === employment)))}원
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <Button disabled={selectedRows.length === 0}>세금계산서 발행</Button>
        </div>

        {/* 관리자 웹의 최소 폭은 1024px이고 그보다 좁아지면 가로로 스크롤한다(quality.md 「반응형과 테마」). */}
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[56rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-oe-border-secondary">
                <th scope="col" className="w-12 px-3 py-2 text-left font-medium text-oe-foreground-secondary">
                  <Checkbox
                    aria-label="전체 선택"
                    checked={allSelected}
                    indeterminate={someSelected}
                    disabled={selectableIds.length === 0}
                    onCheckedChange={(checked) => setSelectedIds(checked ? selectableIds : [])}
                  />
                </th>
                <th scope="col" className="px-3 py-2 text-left font-medium text-oe-foreground-secondary">
                  매장명
                </th>
                <th scope="col" className="px-3 py-2 text-left font-medium text-oe-foreground-secondary">
                  사업자등록번호
                </th>
                <th scope="col" className="px-3 py-2 text-right font-medium text-oe-foreground-secondary">
                  공급가액
                </th>
                <th scope="col" className="px-3 py-2 text-right font-medium text-oe-foreground-secondary">
                  세액
                </th>
                <th scope="col" className="px-3 py-2 text-right font-medium text-oe-foreground-secondary">
                  합계
                </th>
                <th scope="col" className="px-3 py-2 text-left font-medium text-oe-foreground-secondary">
                  상태
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => {
                const tax = taxOf(row.supplyAmount);
                const badge = STATUS_BADGE[row.status];

                return (
                  <tr key={row.id} className="border-b border-oe-border-secondary last:border-b-0">
                    <td className="px-3 py-2">
                      <Checkbox
                        aria-label={`${rowNameOf(row)} 고르기`}
                        checked={selectedIds.includes(row.id)}
                        disabled={row.status === "done"}
                        onCheckedChange={(checked) => toggleRow(row.id, checked)}
                      />
                    </td>
                    <td className="px-3 py-2 text-oe-foreground-primary">
                      <div className="flex items-center gap-2">
                        {row.store}
                        <Badge>{EMPLOYMENT_LABEL[row.employment]}</Badge>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-oe-foreground-secondary tabular-nums">{row.businessNumber}</td>
                    <td className="px-3 py-2 text-right text-oe-foreground-primary tabular-nums">
                      {AMOUNT_FORMAT.format(row.supplyAmount)}
                    </td>
                    <td className="px-3 py-2 text-right text-oe-foreground-primary tabular-nums">{AMOUNT_FORMAT.format(tax)}</td>
                    <td className="px-3 py-2 text-right font-medium text-oe-foreground-primary tabular-nums">
                      {AMOUNT_FORMAT.format(row.supplyAmount + tax)}
                    </td>
                    <td className="px-3 py-2">
                      <Badge tone={badge.tone}>{badge.label}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
