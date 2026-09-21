"use client";

/*
 * 요청
 *
 * 엑셀 내려받기. 웹 태블릿 1194×834 가로 화면이다. 본사 담당자가 자료를 엑셀로 내려받기 전에 무엇을 담을지 고르는 자리다. 본문은 좌우로 나뉜다. 왼쪽은 고르는 자리다. 맨 위에 무엇을 내려받을지 하나만 고른다 — 근태·급여·연차·세금계산서 넷이다. 그 아래에 기간(시작일과 종료일), 매장 고르기, 담을 항목 체크박스 목록이 선다. 담을 항목은 「전체 선택」 체크박스 하나와 그 아래 개별 항목 여럿이고, 일부만 골랐을 때 전체 선택은 일부 선택 상태로 보인다. 오른쪽은 미리보기다. 맨 위에 「내려받을 줄 수」를 크게 보이고, 그 아래에 고른 항목을 열로 삼은 표를 세 줄까지 보인다. 항목을 끄면 그 열이 표에서 사라진다. 오른쪽 아래에 「엑셀 내려받기」 버튼을 두고, 담을 항목을 하나도 고르지 않았으면 비활성이다. 미리보기 자료는 가짜 데이터를 화면에 박아 둔다. 줄 수는 그 자료에서 실제로 센다.
 *
 * 비워 둔 자리
 *
 * - 시작일·종료일이 여는 날짜 선택 화면. 공용 자산이 없어 두 Input Button 은 눌러도 아무것도 열지 않는다.
 * - 매장 목록의 출처. 지금은 가짜 자료에 든 세 매장이다.
 * - 엑셀 파일을 만들어 내려받는 동작. 제출은 막아 두었다.
 * - 자료마다 담을 항목의 목록. 요청에 없어 가짜 자료의 열로 정했다.
 */

import { useState } from "react";

import { Button, CheckboxField, Field, InputButton, RadioField, RadioGroup, Select } from "@ooee/ui";

type ExportKind = "attendance" | "payroll" | "leave" | "tax-invoice";

type Column = { key: string; label: string };

type Dataset = {
  label: string;
  columns: Column[];
  rows: Record<string, string>[];
};

const KINDS: ExportKind[] = ["attendance", "payroll", "leave", "tax-invoice"];

const STORES = ["강남점", "홍대점", "잠실점"];

const STORE_OPTIONS = STORES.map((store) => ({ value: store, label: store }));

const PREVIEW_ROW_LIMIT = 3;

// 미리보기 자료는 가짜 데이터다. 줄 수는 여기서 센다.
const DATASETS: Record<ExportKind, Dataset> = {
  attendance: {
    label: "근태",
    columns: [
      { key: "name", label: "직원명" },
      { key: "store", label: "매장" },
      { key: "date", label: "근무일" },
      { key: "clockIn", label: "출근 시각" },
      { key: "clockOut", label: "퇴근 시각" },
      { key: "hours", label: "근무 시간" },
    ],
    rows: [
      { name: "김민준", store: "강남점", date: "2026. 09. 01", clockIn: "09:00", clockOut: "18:00", hours: "8시간" },
      { name: "이서연", store: "강남점", date: "2026. 09. 01", clockIn: "10:00", clockOut: "16:00", hours: "6시간" },
      { name: "박지호", store: "홍대점", date: "2026. 09. 01", clockIn: "08:30", clockOut: "17:30", hours: "8시간" },
      { name: "최유나", store: "홍대점", date: "2026. 09. 02", clockIn: "13:00", clockOut: "22:00", hours: "8시간" },
      { name: "정하은", store: "잠실점", date: "2026. 09. 02", clockIn: "09:00", clockOut: "15:00", hours: "6시간" },
      { name: "김민준", store: "강남점", date: "2026. 09. 02", clockIn: "09:00", clockOut: "18:00", hours: "8시간" },
      { name: "박지호", store: "홍대점", date: "2026. 09. 03", clockIn: "08:30", clockOut: "17:30", hours: "8시간" },
      { name: "정하은", store: "잠실점", date: "2026. 09. 03", clockIn: "09:00", clockOut: "15:00", hours: "6시간" },
    ],
  },
  payroll: {
    label: "급여",
    columns: [
      { key: "name", label: "직원명" },
      { key: "store", label: "매장" },
      { key: "month", label: "지급월" },
      { key: "hours", label: "근무 시간" },
      { key: "wage", label: "시급" },
      { key: "pay", label: "지급액" },
    ],
    rows: [
      { name: "김민준", store: "강남점", month: "2026년 8월", hours: "168시간", wage: "10,030원", pay: "1,685,040원" },
      { name: "이서연", store: "강남점", month: "2026년 8월", hours: "96시간", wage: "10,030원", pay: "962,880원" },
      { name: "박지호", store: "홍대점", month: "2026년 8월", hours: "160시간", wage: "10,500원", pay: "1,680,000원" },
      { name: "최유나", store: "홍대점", month: "2026년 8월", hours: "120시간", wage: "10,030원", pay: "1,203,600원" },
      { name: "정하은", store: "잠실점", month: "2026년 8월", hours: "90시간", wage: "10,030원", pay: "902,700원" },
    ],
  },
  leave: {
    label: "연차",
    columns: [
      { key: "name", label: "직원명" },
      { key: "store", label: "매장" },
      { key: "total", label: "총 연차" },
      { key: "used", label: "사용 연차" },
      { key: "remaining", label: "잔여 연차" },
    ],
    rows: [
      { name: "김민준", store: "강남점", total: "15일", used: "6일", remaining: "9일" },
      { name: "이서연", store: "강남점", total: "11일", used: "2일", remaining: "9일" },
      { name: "박지호", store: "홍대점", total: "15일", used: "10일", remaining: "5일" },
      { name: "최유나", store: "홍대점", total: "12일", used: "3일", remaining: "9일" },
      { name: "정하은", store: "잠실점", total: "11일", used: "4일", remaining: "7일" },
      { name: "한도윤", store: "잠실점", total: "15일", used: "1일", remaining: "14일" },
    ],
  },
  "tax-invoice": {
    label: "세금계산서",
    columns: [
      { key: "store", label: "매장" },
      { key: "month", label: "발행월" },
      { key: "supply", label: "공급가액" },
      { key: "tax", label: "세액" },
      { key: "total", label: "합계 금액" },
      { key: "status", label: "발행 상태" },
    ],
    rows: [
      { store: "강남점", month: "2026년 8월", supply: "2,648,000원", tax: "264,800원", total: "2,912,800원", status: "발행 완료" },
      { store: "홍대점", month: "2026년 8월", supply: "2,883,600원", tax: "288,360원", total: "3,171,960원", status: "발행 완료" },
      { store: "잠실점", month: "2026년 8월", supply: "1,500,000원", tax: "150,000원", total: "1,650,000원", status: "미발행" },
      { store: "강남점", month: "2026년 7월", supply: "2,500,000원", tax: "250,000원", total: "2,750,000원", status: "발행 완료" },
    ],
  },
};

function allColumnKeys(kind: ExportKind) {
  return DATASETS[kind].columns.map((column) => column.key);
}

export default function ExcelExportPage() {
  const [kind, setKind] = useState<ExportKind>("attendance");
  const [store, setStore] = useState<string | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<string[]>(() => allColumnKeys("attendance"));

  const dataset = DATASETS[kind];
  const visibleColumns = dataset.columns.filter((column) => selectedKeys.includes(column.key));
  const rows = dataset.rows.filter((row) => store === null || row.store === store);
  const allSelected = visibleColumns.length === dataset.columns.length;
  const someSelected = visibleColumns.length > 0 && !allSelected;

  // 자료를 바꾸면 담을 항목도 그 자료의 열로 바뀐다. 새 자료의 열을 모두 고른 채로 시작한다.
  function changeKind(next: ExportKind) {
    setKind(next);
    setSelectedKeys(allColumnKeys(next));
  }

  // 고른 열은 표의 열 순서를 따른다. 누른 순서로 쌓으면 켜고 끌 때마다 표의 열 순서가 바뀐다.
  function toggleColumn(key: string, checked: boolean) {
    setSelectedKeys((current) =>
      dataset.columns
        .filter((column) => (column.key === key ? checked : current.includes(column.key)))
        .map((column) => column.key),
    );
  }

  return (
    <main className="flex min-h-dvh flex-col bg-oe-background-primary">
      <header className="border-b border-oe-border-secondary px-oe-padding-default py-5 md:px-oe-padding-wide">
        <h1 className="text-xl font-semibold text-oe-foreground-primary">엑셀 내려받기</h1>
      </header>

      <form onSubmit={(event) => event.preventDefault()} className="flex flex-1">
        <div className="flex w-[400px] shrink-0 flex-col gap-6 border-r border-oe-border-secondary py-6 pr-6 pl-oe-padding-default md:pl-oe-padding-wide">
          <Field label="내려받을 자료" group>
            <RadioGroup value={kind} onValueChange={(value) => changeKind(value as ExportKind)} className="-ml-2">
              {KINDS.map((value) => (
                <RadioField key={value} value={value} label={DATASETS[value].label} />
              ))}
            </RadioGroup>
          </Field>

          <Field label="기간" group>
            <div role="group" className="flex items-center gap-2">
              <InputButton controlSize="large" placeholder="시작일" aria-label="시작일" />
              <span aria-hidden="true" className="text-sm text-oe-foreground-tertiary">
                ~
              </span>
              <InputButton controlSize="large" placeholder="종료일" aria-label="종료일" />
            </div>
          </Field>

          <Field label="대상 매장">
            <Select controlSize="large" placeholder="매장 선택" options={STORE_OPTIONS} value={store} onValueChange={setStore} />
          </Field>

          <Field label="담을 항목" group>
            <CheckboxField
              isParent
              label="전체 선택"
              checked={allSelected}
              indeterminate={someSelected}
              onCheckedChange={(checked) => setSelectedKeys(checked ? allColumnKeys(kind) : [])}
              className="-ml-2"
            />
            {dataset.columns.map((column) => (
              <CheckboxField
                key={column.key}
                label={column.label}
                checked={selectedKeys.includes(column.key)}
                onCheckedChange={(checked) => toggleColumn(column.key, checked)}
                className="-ml-2"
              />
            ))}
          </Field>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-6 py-6 pl-6 pr-oe-padding-default md:pr-oe-padding-wide">
          <dl className="flex flex-col gap-1">
            <dt className="text-sm font-medium text-oe-foreground-secondary">내려받을 줄 수</dt>
            <dd aria-live="polite" className="text-4xl font-semibold tabular-nums text-oe-foreground-primary">
              {rows.length}
              <span className="ml-1 text-base font-medium text-oe-foreground-secondary">줄</span>
            </dd>
          </dl>

          {visibleColumns.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-oe-border-primary">
              <table aria-label="미리보기" className="w-full text-left text-sm">
                <thead className="bg-oe-background-secondary">
                  <tr>
                    {visibleColumns.map((column) => (
                      <th key={column.key} scope="col" className="whitespace-nowrap px-4 py-2.5 font-medium text-oe-foreground-secondary">
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, PREVIEW_ROW_LIMIT).map((row, index) => (
                    <tr key={index} className="border-t border-oe-border-secondary">
                      {visibleColumns.map((column) => (
                        <td key={column.key} className="whitespace-nowrap px-4 py-3 text-oe-foreground-primary">
                          {row[column.key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-oe-foreground-tertiary">담을 항목을 고르면 표가 보입니다.</p>
          )}

          <div className="mt-auto flex justify-end">
            <Button type="submit" controlSize="large" disabled={visibleColumns.length === 0}>
              엑셀 내려받기
            </Button>
          </div>
        </div>
      </form>
    </main>
  );
}
