"use client";

/**
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
 * - 고를 수 있는 연월의 범위. 화면에는 2026년 7~9월만 박아 두었다.
 * - 거르개를 바꿨을 때 보이지 않게 된 줄의 선택을 어떻게 다룰지. 지금은 선택을 푼다.
 */

import { useState } from "react";

import { Badge, Button, Checkbox, Chip, Select } from "@ooee/ui";

type IssueStatus = "before" | "done";

type StoreInvoice = {
  id: string;
  store: string;
  businessNumber: string;
  supplyAmount: number;
  status: IssueStatus;
};

/** 화면에 박아 둔 가짜 데이터다. 매장과 금액은 실제 값이 아니다. */
const STORE_INVOICES: StoreInvoice[] = [
  { id: "gangnam", store: "강남점", businessNumber: "123-45-67890", supplyAmount: 12_400_000, status: "before" },
  { id: "hongdae", store: "홍대점", businessNumber: "214-88-01234", supplyAmount: 9_860_000, status: "before" },
  { id: "jamsil", store: "잠실점", businessNumber: "305-12-77821", supplyAmount: 15_230_000, status: "done" },
  { id: "pangyo", store: "판교점", businessNumber: "411-30-55019", supplyAmount: 7_540_000, status: "before" },
  { id: "seomyeon", store: "부산서면점", businessNumber: "602-19-40233", supplyAmount: 11_080_000, status: "done" },
  { id: "dunsan", store: "대전둔산점", businessNumber: "305-44-91027", supplyAmount: 6_720_000, status: "before" },
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

type StatusFilter = "all" | IssueStatus;

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "before", label: "발행 전" },
  { value: "done", label: "발행 완료" },
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

function visibleInvoicesOf(filter: StatusFilter) {
  return STORE_INVOICES.filter((invoice) => filter === "all" || invoice.status === filter);
}

export default function TaxInvoicePage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const visibleInvoices = visibleInvoicesOf(statusFilter);
  // 발행 완료인 줄은 고를 수 없으므로 전체 선택도 발행 전인 줄만 다룬다.
  const selectableIds = visibleInvoices.filter((invoice) => invoice.status === "before").map((invoice) => invoice.id);
  const selectedInvoices = visibleInvoices.filter((invoice) => selectedIds.includes(invoice.id));
  const selectedTotal = selectedInvoices.reduce((sum, invoice) => sum + totalOf(invoice.supplyAmount), 0);

  const allSelected = selectableIds.length > 0 && selectableIds.every((id) => selectedIds.includes(id));
  const someSelected = selectedIds.length > 0 && !allSelected;

  function changeFilter(next: StatusFilter) {
    setStatusFilter(next);
    const remaining = visibleInvoicesOf(next).map((invoice) => invoice.id);
    setSelectedIds((previous) => previous.filter((id) => remaining.includes(id)));
  }

  function toggleRow(id: string, checked: boolean) {
    setSelectedIds((previous) => (checked ? [...previous, id] : previous.filter((selected) => selected !== id)));
  }

  return (
    <main className="flex min-h-dvh flex-col gap-6 bg-oe-background-canvas-secondary px-oe-padding-default py-8 md:px-oe-padding-wide">
      <h1 className="text-2xl font-semibold text-oe-foreground-primary">세금계산서 발행</h1>

      <div className="flex flex-wrap items-center gap-4">
        <Select ariaLabel="연월" options={MONTH_OPTIONS} defaultValue="2026-09" layout="fixed" fixedWidth="10rem" />
        <div role="group" aria-label="발행 상태" className="flex flex-wrap items-center gap-1.5">
          {STATUS_FILTERS.map((filter) => (
            <Chip
              key={filter.value}
              shape="rounded"
              active={statusFilter === filter.value}
              onClick={() => changeFilter(filter.value)}
            >
              {filter.label}
            </Chip>
          ))}
        </div>
      </div>

      <section className="flex flex-col gap-4 rounded-lg border border-oe-border-secondary bg-oe-background-primary p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-oe-foreground-secondary">
            고른 건수{" "}
            <span className="font-medium text-oe-foreground-primary tabular-nums">{selectedInvoices.length}건</span> · 합계{" "}
            <span className="font-medium text-oe-foreground-primary tabular-nums">
              {AMOUNT_FORMAT.format(selectedTotal)}원
            </span>
          </p>
          <Button disabled={selectedInvoices.length === 0}>세금계산서 발행</Button>
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
              {visibleInvoices.map((invoice) => {
                const tax = taxOf(invoice.supplyAmount);
                const badge = STATUS_BADGE[invoice.status];

                return (
                  <tr key={invoice.id} className="border-b border-oe-border-secondary last:border-b-0">
                    <td className="px-3 py-2">
                      <Checkbox
                        aria-label={`${invoice.store} 고르기`}
                        checked={selectedIds.includes(invoice.id)}
                        disabled={invoice.status === "done"}
                        onCheckedChange={(checked) => toggleRow(invoice.id, checked)}
                      />
                    </td>
                    <td className="px-3 py-2 text-oe-foreground-primary">{invoice.store}</td>
                    <td className="px-3 py-2 text-oe-foreground-secondary tabular-nums">{invoice.businessNumber}</td>
                    <td className="px-3 py-2 text-right text-oe-foreground-primary tabular-nums">
                      {AMOUNT_FORMAT.format(invoice.supplyAmount)}
                    </td>
                    <td className="px-3 py-2 text-right text-oe-foreground-primary tabular-nums">
                      {AMOUNT_FORMAT.format(tax)}
                    </td>
                    <td className="px-3 py-2 text-right font-medium text-oe-foreground-primary tabular-nums">
                      {AMOUNT_FORMAT.format(invoice.supplyAmount + tax)}
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
