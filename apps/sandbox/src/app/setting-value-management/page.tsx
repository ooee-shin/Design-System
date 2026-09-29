"use client";

/**
 * 요구사항 원문:
 * 특정 메뉴의 설정값의 노출 여부를 관리하는 화면입니다.
 * 데이터는 100여개가 있다고 가정하고 설정값 value과 노출 여부를 제어할 수 있습니다.
 *
 * 정하지 않아 비워 둔 자리:
 * - 어느 메뉴인지는 요청에 이름이 없어 화면 제목을 「설정값 관리」로 두고 특정 메뉴 이름은 넣지 않았다.
 * - 「100여개」를 108개로, 항목 이름과 값은 예시 데이터로 채웠다.
 * - 검색과 페이지 이동은 요청에 없어 108개 항목을 다루기 위해 지어냈다.
 */

import { useMemo, useState } from "react";
import { Badge, Button, Input, Switch } from "@ooee/ui";
import { RiSearchLine } from "@remixicon/react";

type SettingItem = {
  id: string;
  name: string;
  value: string;
  visible: boolean;
};

const TOTAL_COUNT = 108;
const PAGE_SIZE = 20;

const INITIAL_ITEMS: SettingItem[] = Array.from({ length: TOTAL_COUNT }, (_, index) => {
  const order = index + 1;
  return {
    id: `setting-${order}`,
    name: `설정값 ${String(order).padStart(3, "0")}`,
    value: `값 ${order}`,
    visible: order % 3 !== 0,
  };
});

export default function Page() {
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);

  const filteredItems = useMemo(
    () => items.filter((item) => item.name.includes(keyword.trim())),
    [items, keyword],
  );

  const pageCount = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pagedItems = filteredItems.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleKeywordChange = (nextKeyword: string) => {
    setKeyword(nextKeyword);
    setPage(1);
  };

  const handleValueChange = (id: string, nextValue: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, value: nextValue } : item)));
  };

  const handleVisibleChange = (id: string, nextVisible: boolean) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, visible: nextVisible } : item)));
  };

  return (
    <main className="min-h-dvh bg-oe-background-primary px-oe-padding-default py-8 md:px-oe-padding-wide">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold text-oe-foreground-primary">설정값 관리</h1>
          <Badge tone="neutral">전체 {TOTAL_COUNT}개</Badge>
        </div>
        <p className="text-sm text-oe-foreground-secondary">이 메뉴에 속한 설정값의 값과 노출 여부를 관리합니다.</p>

        <div className="w-full sm:max-w-sm">
          <Input
            aria-label="설정값 검색"
            placeholder="설정값 이름 검색"
            value={keyword}
            onChange={(event) => handleKeywordChange(event.target.value)}
            clearable={keyword.length > 0}
            onClear={() => handleKeywordChange("")}
            leadingElement={<RiSearchLine aria-hidden="true" />}
            controlSize="large"
          />
        </div>

        <div className="flex flex-col rounded-oe-control border border-oe-border-secondary">
          <div className="hidden border-b border-oe-border-secondary px-4 py-3 text-xs font-medium text-oe-foreground-tertiary sm:grid sm:grid-cols-[1fr_240px_120px] sm:gap-4">
            <span>설정값 이름</span>
            <span>값</span>
            <span>노출 여부</span>
          </div>

          {pagedItems.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-oe-foreground-tertiary">검색 결과가 없습니다.</p>
          ) : (
            pagedItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-2 border-b border-oe-border-secondary px-4 py-3 last:border-b-0 sm:grid sm:grid-cols-[1fr_240px_120px] sm:items-center sm:gap-4"
              >
                <span className="text-sm font-medium text-oe-foreground-primary">{item.name}</span>
                <Input
                  aria-label={`${item.name} 값`}
                  value={item.value}
                  onChange={(event) => handleValueChange(item.id, event.target.value)}
                  controlSize="large"
                />
                <div className="flex items-center justify-between sm:justify-start">
                  <span className="text-xs text-oe-foreground-tertiary sm:hidden">노출 여부</span>
                  <Switch
                    aria-label={`${item.name} 노출 여부`}
                    checked={item.visible}
                    onCheckedChange={(checked) => handleVisibleChange(item.id, checked)}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {pageCount > 1 ? (
          <div className="flex flex-wrap items-center gap-[6px]">
            <Button
              tone="neutral"
              variant="ghost"
              controlSize="small"
              disabled={currentPage === 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              이전
            </Button>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
              <Button
                key={pageNumber}
                tone="neutral"
                variant={pageNumber === currentPage ? "outline" : "ghost"}
                controlSize="small"
                onClick={() => setPage(pageNumber)}
              >
                {pageNumber}
              </Button>
            ))}
            <Button
              tone="neutral"
              variant="ghost"
              controlSize="small"
              disabled={currentPage === pageCount}
              onClick={() => setPage((prev) => Math.min(pageCount, prev + 1))}
            >
              다음
            </Button>
          </div>
        ) : null}
      </div>
    </main>
  );
}
