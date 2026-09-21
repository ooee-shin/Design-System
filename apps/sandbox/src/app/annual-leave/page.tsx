"use client";

/*
 * 연차 관리. 웹 태블릿 1194×834 가로 화면이다. 매장 관리자가 직원들의 연차를 확인하고 신청 내역을 보는
 * 자리다. 화면 위에는 연도 고르기와 직원 이름 검색이 한 줄로 선다. 본문은 좌우로 나뉜다. 왼쪽은 직원
 * 목록이고 항목마다 이름·직급·남은 연차 일수를 보인다. 고른 직원은 선택 상태로 남는다. 오른쪽은 고른
 * 직원의 연차 내역이다. 위에 잔여·사용·총 연차 일수를 세 칸으로 요약하고, 아래에 표로 신청일·구분(연차·
 * 반차·병가)·기간·일수·상태(승인·대기·반려)를 보인다. 상태는 Badge 로 구분한다. 표 아래에 페이지 이동을
 * 둔다. 오른쪽 위에 「연차 신청」 버튼을 두되 눌러도 아무 일도 하지 않는다. 직원과 연차 내역은 가짜
 * 데이터를 화면에 박아 둔다. 요약의 세 숫자는 그 데이터에서 실제로 세어 보인다.
 *
 * 정하지 않아 비워 둔 자리
 * - 「연차 신청」 버튼을 눌렀을 때 열 화면. 요청이 아무 일도 하지 않는다고 정했으므로 핸들러를 두지 않았다.
 * - 연도 Control 이 고르는 값에 따라 바꿀 자료. 요청이 연도별 데이터를 정하지 않아 한 해치만 두었고,
 *   Control 은 값만 바꾼다.
 * - 연차 차감 규칙. 「사용」은 승인된 신청의 일수를 모두 더한 값이며 구분별 차감 여부는 정해지지 않았다.
 * - 한 페이지에 담는 신청 건수. 지금은 5건이다.
 */

import { useState } from "react";
import { RiArrowLeftSLine, RiArrowRightSLine, RiSearchLine } from "@remixicon/react";

import { Badge, Button, Input, Select } from "@ooee/ui";

import { cn } from "@/lib/utils";

type LeaveStatus = "승인" | "대기" | "반려";
type LeaveKind = "연차" | "반차" | "병가";

type LeaveRecord = {
  id: string;
  /** 신청일 */
  appliedOn: string;
  /** 구분 */
  kind: LeaveKind;
  /** 기간 */
  period: string;
  /** 일수 */
  days: number;
  /** 상태 */
  status: LeaveStatus;
};

type Employee = {
  id: string;
  name: string;
  /** 직급 */
  rank: string;
  /** 그해에 받은 총 연차 일수 */
  grantedDays: number;
  records: LeaveRecord[];
};

/** 상태를 뜻하는 tone 만 쓴다(badge.md 「Tone 고르기」). */
const STATUS_TONE: Record<LeaveStatus, "success" | "warning" | "danger"> = {
  "승인": "success",
  "대기": "warning",
  "반려": "danger",
};

const YEAR_OPTIONS = [
  { value: "2024", label: "2024년" },
  { value: "2025", label: "2025년" },
  { value: "2026", label: "2026년" },
];

const PAGE_SIZE = 5;

const EMPLOYEES: Employee[] = [
  {
    id: "kim-seoyeon",
    name: "김서연",
    rank: "점장",
    grantedDays: 15,
    records: [
      { id: "kim-1", appliedOn: "2026.01.05", kind: "연차", period: "2026.01.12 ~ 2026.01.13", days: 2, status: "승인" },
      { id: "kim-2", appliedOn: "2026.02.18", kind: "반차", period: "2026.02.24 오후", days: 0.5, status: "승인" },
      { id: "kim-3", appliedOn: "2026.03.09", kind: "병가", period: "2026.03.11", days: 1, status: "승인" },
      { id: "kim-4", appliedOn: "2026.04.27", kind: "연차", period: "2026.05.04 ~ 2026.05.06", days: 3, status: "승인" },
      { id: "kim-5", appliedOn: "2026.06.15", kind: "반차", period: "2026.06.19 오전", days: 0.5, status: "반려" },
      { id: "kim-6", appliedOn: "2026.07.20", kind: "연차", period: "2026.08.03 ~ 2026.08.04", days: 2, status: "승인" },
      { id: "kim-7", appliedOn: "2026.09.01", kind: "연차", period: "2026.09.28 ~ 2026.09.29", days: 2, status: "대기" },
      { id: "kim-8", appliedOn: "2026.09.14", kind: "반차", period: "2026.10.02 오후", days: 0.5, status: "대기" },
    ],
  },
  {
    id: "park-junho",
    name: "박준호",
    rank: "부점장",
    grantedDays: 15,
    records: [
      { id: "park-1", appliedOn: "2026.02.02", kind: "연차", period: "2026.02.09 ~ 2026.02.10", days: 2, status: "승인" },
      { id: "park-2", appliedOn: "2026.05.11", kind: "연차", period: "2026.05.18 ~ 2026.05.20", days: 3, status: "승인" },
      { id: "park-3", appliedOn: "2026.08.03", kind: "반차", period: "2026.08.07 오후", days: 0.5, status: "승인" },
      { id: "park-4", appliedOn: "2026.09.07", kind: "연차", period: "2026.09.24 ~ 2026.09.25", days: 2, status: "대기" },
    ],
  },
  {
    id: "lee-jimin",
    name: "이지민",
    rank: "매니저",
    grantedDays: 12,
    records: [
      { id: "lee-1", appliedOn: "2026.03.02", kind: "연차", period: "2026.03.09 ~ 2026.03.10", days: 2, status: "승인" },
      { id: "lee-2", appliedOn: "2026.06.08", kind: "병가", period: "2026.06.10", days: 1, status: "승인" },
      { id: "lee-3", appliedOn: "2026.07.13", kind: "연차", period: "2026.07.20 ~ 2026.07.22", days: 3, status: "반려" },
      { id: "lee-4", appliedOn: "2026.09.10", kind: "반차", period: "2026.09.18 오전", days: 0.5, status: "승인" },
      { id: "lee-5", appliedOn: "2026.09.16", kind: "연차", period: "2026.10.05 ~ 2026.10.06", days: 2, status: "대기" },
    ],
  },
  {
    id: "jung-minsu",
    name: "정민수",
    rank: "주임",
    grantedDays: 11,
    records: [
      { id: "jung-1", appliedOn: "2026.04.06", kind: "연차", period: "2026.04.13 ~ 2026.04.14", days: 2, status: "승인" },
      { id: "jung-2", appliedOn: "2026.08.17", kind: "연차", period: "2026.08.24 ~ 2026.08.28", days: 5, status: "승인" },
      { id: "jung-3", appliedOn: "2026.09.15", kind: "반차", period: "2026.09.22 오후", days: 0.5, status: "대기" },
    ],
  },
  {
    id: "choi-eunbi",
    name: "최은비",
    rank: "사원",
    grantedDays: 11,
    records: [
      { id: "choi-1", appliedOn: "2026.05.25", kind: "병가", period: "2026.05.27 ~ 2026.05.28", days: 2, status: "승인" },
      { id: "choi-2", appliedOn: "2026.09.02", kind: "연차", period: "2026.09.14", days: 1, status: "승인" },
      { id: "choi-3", appliedOn: "2026.09.18", kind: "연차", period: "2026.10.12 ~ 2026.10.16", days: 5, status: "대기" },
    ],
  },
  {
    id: "han-doyun",
    name: "한도윤",
    rank: "사원",
    grantedDays: 9,
    records: [
      { id: "han-1", appliedOn: "2026.06.22", kind: "연차", period: "2026.06.29", days: 1, status: "승인" },
      { id: "han-2", appliedOn: "2026.09.11", kind: "반차", period: "2026.09.17 오전", days: 0.5, status: "반려" },
    ],
  },
];

/** 승인된 신청의 일수를 더한다. 요약의 세 숫자와 목록의 남은 일수가 같은 셈을 쓴다. */
function usedDays(employee: Employee) {
  return employee.records
    .filter((record) => record.status === "승인")
    .reduce((sum, record) => sum + record.days, 0);
}

function formatDays(days: number) {
  return `${days}일`;
}

export default function AnnualLeavePage() {
  const [selectedId, setSelectedId] = useState(EMPLOYEES[0].id);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);

  const selected = EMPLOYEES.find((employee) => employee.id === selectedId) ?? EMPLOYEES[0];
  const used = usedDays(selected);
  const remaining = selected.grantedDays - used;

  const visibleEmployees = EMPLOYEES.filter((employee) => employee.name.includes(keyword.trim()));
  const totalPages = Math.max(1, Math.ceil(selected.records.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRecords = selected.records.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const summary = [
    { term: "잔여", days: remaining },
    { term: "사용", days: used },
    { term: "총 연차", days: selected.grantedDays },
  ];

  const selectEmployee = (employeeId: string) => {
    setSelectedId(employeeId);
    setPage(1);
  };

  return (
    <main className="flex min-h-dvh flex-col gap-5 bg-oe-background-canvas-primary px-oe-padding-wide py-8">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-oe-foreground-primary">연차 관리</h1>
        <Button controlSize="regular">연차 신청</Button>
      </header>

      <div className="flex items-center gap-2">
        <Select
          options={YEAR_OPTIONS}
          defaultValue="2026"
          ariaLabel="연도"
          controlSize="regular"
          layout="fixed"
          fixedWidth="9rem"
        />
        <Input
          aria-label="직원 이름 검색"
          placeholder="직원 이름"
          controlSize="regular"
          layout="fixed"
          fixedWidth="18rem"
          leadingElement={<RiSearchLine aria-hidden="true" />}
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
        />
      </div>

      <div className="flex min-h-0 flex-1 gap-4">
        <section className="w-[300px] shrink-0 rounded-lg border border-oe-border-primary bg-oe-background-primary p-2">
          {visibleEmployees.length === 0 ? (
            <p className="px-3 py-6 text-sm text-oe-foreground-tertiary">찾는 이름의 직원이 없습니다.</p>
          ) : (
            <ul aria-label="직원 목록" className="flex flex-col gap-1">
              {visibleEmployees.map((employee) => {
                const isSelected = employee.id === selected.id;
                const left = employee.grantedDays - usedDays(employee);

                return (
                  <li key={employee.id}>
                    <button
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => selectEmployee(employee.id)}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-oe-control px-3 py-2.5 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-oe-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-oe-background-primary",
                        isSelected
                          ? "bg-oe-background-secondary"
                          : "hover:bg-oe-interaction-hover-subtle active:bg-oe-interaction-hover",
                      )}
                    >
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-medium text-oe-foreground-primary">{employee.name}</span>
                        <span className="truncate text-xs text-oe-foreground-tertiary">{employee.rank}</span>
                      </span>
                      <span className="shrink-0 text-sm tabular-nums text-oe-foreground-secondary">
                        {formatDays(left)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="flex min-w-0 flex-1 flex-col gap-4 rounded-lg border border-oe-border-primary bg-oe-background-primary p-5">
          <div className="flex items-baseline gap-2">
            <h2 className="text-lg font-semibold text-oe-foreground-primary">{selected.name}</h2>
            <p className="text-sm text-oe-foreground-tertiary">{selected.rank}</p>
          </div>

          <section aria-label="연차 요약">
            <dl className="grid grid-cols-3 gap-3">
              {summary.map((item) => (
                <div key={item.term} className="rounded-lg bg-oe-background-secondary px-4 py-3">
                  <dt className="text-xs text-oe-foreground-tertiary">{item.term}</dt>
                  <dd className="mt-1 text-xl font-semibold tabular-nums text-oe-foreground-primary">
                    {formatDays(item.days)}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <div className="min-h-0 flex-1 overflow-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-oe-border-secondary">
                  <th scope="col" className="px-3 py-2.5 text-left text-xs font-medium text-oe-foreground-tertiary">
                    신청일
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-left text-xs font-medium text-oe-foreground-tertiary">
                    구분
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-left text-xs font-medium text-oe-foreground-tertiary">
                    기간
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-left text-xs font-medium text-oe-foreground-tertiary">
                    일수
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-left text-xs font-medium text-oe-foreground-tertiary">
                    상태
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageRecords.map((record) => (
                  <tr key={record.id} className="border-b border-oe-border-secondary">
                    <td className="px-3 py-3 tabular-nums text-oe-foreground-secondary">{record.appliedOn}</td>
                    <td className="px-3 py-3 text-oe-foreground-primary">{record.kind}</td>
                    <td className="px-3 py-3 tabular-nums text-oe-foreground-primary">{record.period}</td>
                    <td className="px-3 py-3 tabular-nums text-oe-foreground-primary">{formatDays(record.days)}</td>
                    <td className="px-3 py-3">
                      <Badge tone={STATUS_TONE[record.status]}>{record.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <nav aria-label="페이지 이동" className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              tone="neutral"
              controlSize="small"
              aria-label="이전 페이지"
              leadingIcon={<RiArrowLeftSLine aria-hidden="true" />}
              disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
            />
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
              <Button
                key={pageNumber}
                variant={pageNumber === currentPage ? "tonal" : "ghost"}
                tone="neutral"
                controlSize="small"
                aria-label={`${pageNumber}페이지`}
                aria-current={pageNumber === currentPage ? "page" : undefined}
                onClick={() => setPage(pageNumber)}
              >
                {pageNumber}
              </Button>
            ))}
            <Button
              variant="ghost"
              tone="neutral"
              controlSize="small"
              aria-label="다음 페이지"
              leadingIcon={<RiArrowRightSLine aria-hidden="true" />}
              disabled={currentPage === totalPages}
              onClick={() => setPage(currentPage + 1)}
            />
          </nav>
        </section>
      </div>
    </main>
  );
}
