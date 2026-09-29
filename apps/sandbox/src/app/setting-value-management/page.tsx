"use client";

/**
 * 요구사항 원문:
 * 특정 메뉴의 설정값의 노출 여부를 관리하는 화면입니다.
 * 데이터는 100여개가 있다고 가정하고 설정값 value과 노출 여부를 제어할 수 있습니다.
 * 개선: 1. 설정값 이름이 아니라 순서 넘버링을 해줘 2. 이름이 과도하게 너비를 차지하고 있으니 폭을 줄이고
 * 두번째 '값'의 입력 너비를 확보해줘 3. 모두 끄기, 모두 켜기 기능을 추가해줘
 *
 * 정하지 않아 비워 둔 자리:
 * - 어느 메뉴인지는 요청에 이름이 없어 화면 제목을 「설정값 관리」로 두고 특정 메뉴 이름은 넣지 않았다.
 * - 「100여개」를 108개로, 값은 예시 데이터(값 1~108)로 채웠다. 항목은 이름 대신 순서 번호(1~108)로 표시한다.
 * - 검색과 페이지 이동은 요청에 없어 108개 항목을 다루기 위해 지어냈다. 검색 대상은 이름에서 순서 번호로 바꿨다.
 * - 모두 켜기·모두 끄기의 적용 범위(검색·페이지와 무관하게 전체 108개)는 요청에 없어 정했다.
 */

import { useMemo, useState } from "react";
import { Badge, Button, Input, Switch } from "@ooee/ui";
import { RiSearchLine } from "@remixicon/react";

type SettingItem = {
  id: string;
  order: number;
  value: string;
  visible: boolean;
};

const TOTAL_COUNT = 108;
const PAGE_SIZE = 20;

const INITIAL_ITEMS: SettingItem[] = Array.from({ length: TOTAL_COUNT }, (_, index) => {
  const order = index + 1;
  return {
    id: `setting-${order}`,
    order,
    value: `값 ${order}`,
    visible: order % 3 !== 0,
  };
});

export default function Page() {
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);

  const filteredItems = useMemo(
    () => items.filter((item) => String(item.order).includes(keyword.trim())),
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

  const handleSetAllVisible = (nextVisible: boolean) => {
    setItems((prev) => prev.map((item) => ({ ...item, visible: nextVisible })));
  };

  return (
    <main className="min-h-dvh bg-oe-background-primary px-oe-padding-default py-8 md:px-oe-padding-wide">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold text-oe-foreground-primary">설정값 관리</h1>
          <Badge tone="neutral">전체 {TOTAL_COUNT}개</Badge>
        </div>
        <p className="text-sm text-oe-foreground-secondary">이 메뉴에 속한 설정값의 값과 노출 여부를 관리합니다.</p>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="w-full sm:max-w-sm">
            <Input
              aria-label="설정값 번호 검색"
              placeholder="번호로 검색"
              value={keyword}
              onChange={(event) => handleKeywordChange(event.target.value)}
              clearable={keyword.length > 0}
              onClear={() => handleKeywordChange("")}
              leadingElement={<RiSearchLine aria-hidden="true" />}
              controlSize="large"
            />
          </div>
          <div className="flex items-center gap-[6px]">
            <Button tone="neutral" variant="outline" controlSize="large" onClick={() => handleSetAllVisible(true)}>
              모두 켜기
            </Button>
            <Button tone="neutral" variant="outline" controlSize="large" onClick={() => handleSetAllVisible(false)}>
              모두 끄기
            </Button>
          </div>
        </div>

        <div className="flex flex-col rounded-oe-control border border-oe-border-secondary">
          <div className="hidden border-b border-oe-border-secondary px-4 py-3 text-xs font-medium text-oe-foreground-tertiary sm:grid sm:grid-cols-[72px_1fr_120px] sm:gap-4">
            <span>번호</span>
            <span>값</span>
            <span>노출 여부</span>
          </div>

          {pagedItems.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-oe-foreground-tertiary">검색 결과가 없습니다.</p>
          ) : (
            pagedItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-2 border-b border-oe-border-secondary px-4 py-3 last:border-b-0 sm:grid sm:grid-cols-[72px_1fr_120px] sm:items-center sm:gap-4"
              >
                <div className="flex items-center justify-between sm:block">
                  <span className="text-xs text-oe-foreground-tertiary sm:hidden">번호</span>
                  <span className="text-sm font-medium tabular-nums text-oe-foreground-primary">{item.order}</span>
                </div>
                <Input
                  aria-label={`설정값 ${item.order} 값`}
                  value={item.value}
                  onChange={(event) => handleValueChange(item.id, event.target.value)}
                  controlSize="large"
                />
                <div className="flex items-center justify-between sm:justify-start">
                  <span className="text-xs text-oe-foreground-tertiary sm:hidden">노출 여부</span>
                  <Switch
                    aria-label={`설정값 ${item.order} 노출 여부`}
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
