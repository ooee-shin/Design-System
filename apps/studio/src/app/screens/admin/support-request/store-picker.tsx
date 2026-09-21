"use client";

/**
 * 지역을 먼저 고르고 그 안에서 점포를 고르는 두 단짜리 고르개다.
 *
 * 점포는 실제로 천 곳을 넘어 한 목록에 늘어놓을 수 없다. 왼쪽에서 지역을 옮겨 다니고 오른쪽에서
 * 그 지역의 점포를 고르며, 맨 위의 「전체」가 그 지역 전부를 함께 켜고 끈다. 점주의 소리 화면이
 * 같은 얼개를 왼쪽 필터 패널 안에 펼쳐 두는데, 이 화면은 조건이 가로 줄이라 팝업으로 연다.
 *
 * 고르는 것은 지역이 아니라 점포다. 왼쪽을 옮겨 다녀도 앞서 고른 점포는 그대로 남는다.
 *
 * 이 화면에서 먼저 쓰고, 두 번째 화면에서 확인한 뒤에 `MultiCombobox` 의 두 단 모드로 올릴지
 * 판단한다. 그때까지 트리거만 `comboboxTriggerVariants` 를 빌려 다른 축과 같은 모양으로 둔다.
 */

import { useState } from "react";

import { Popover } from "@base-ui/react/popover";
import { RiArrowDownSLine, RiSearchLine } from "@remixicon/react";

import { CheckboxIndicator, comboboxSearchContainerVariants, comboboxTriggerVariants } from "@ooee/ui";

import { REGIONS, regionOf, STORES, storesIn } from "./request-data";

export function StorePicker({ value, onValueChange }: { value: string[]; onValueChange: (next: string[]) => void }) {
  const [activeRegion, setActiveRegion] = useState(REGIONS[0]);
  const [query, setQuery] = useState("");
  const keyword = query.trim();

  // 점포명을 치면 지역을 가리지 않고 전부에서 찾는다. 이름만 아는 한 곳을 찾을 때 그것이 어느
  // 지역인지까지 알아야 한다면 검색이 하는 일이 없다. 대신 결과마다 지역을 붙인다.
  const stores = keyword ? STORES.filter((store) => store.name.includes(keyword)).map((store) => store.name) : storesIn(activeRegion);
  const picked = stores.filter((name) => value.includes(name));
  const allPicked = stores.length > 0 && picked.length === stores.length;
  const somePicked = !allPicked && picked.length > 0;

  const toggle = (name: string) =>
    onValueChange(value.includes(name) ? value.filter((item) => item !== name) : [...value, name]);

  const toggleAll = () =>
    onValueChange(allPicked ? value.filter((name) => !stores.includes(name)) : [...new Set([...value, ...stores])]);

  return (
    <Popover.Root>
      <Popover.Trigger className={comboboxTriggerVariants({ controlSize: "small" })} aria-label="점포">
        <span className="min-w-0 flex-1 truncate text-left">
          {value.length === 0 ? (
            <span className="text-oe-foreground-placeholder">전체</span>
          ) : (
            summary(value)
          )}
        </span>
        <span className="flex shrink-0 items-center text-oe-foreground-tertiary">
          <RiArrowDownSLine className="size-4" aria-hidden="true" />
        </span>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Positioner align="start" sideOffset={4} className="z-50">
          <Popover.Popup className="w-[360px] overflow-hidden rounded-lg border border-oe-border-secondary bg-oe-background-primary text-sm text-oe-foreground-primary shadow-lg outline-none">
            <div className="p-2">
              <div className={comboboxSearchContainerVariants()}>
                <RiSearchLine className="size-4 shrink-0 text-oe-foreground-tertiary" aria-hidden="true" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="점포명으로 찾기"
                  aria-label="점포 찾기"
                  className="h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-oe-foreground-placeholder"
                />
              </div>
            </div>

            <div className="grid min-w-0 grid-cols-[minmax(6.5rem,0.8fr)_minmax(0,1.2fr)] border-t border-oe-border-secondary">
              {/* 왼쪽은 지역이다. 검색 중에는 지역을 가리지 않고 찾으므로 고른 지역을 흐려 두고,
                  그 자리를 눌러 검색을 끝내고 돌아올 수 있게 한다. */}
              <div className="relative h-[264px] bg-oe-background-secondary after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:z-10 after:w-px after:bg-oe-border-secondary">
                <div className="h-full overflow-x-hidden overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {REGIONS.map((region) => {
                    const active = !keyword && region === activeRegion;
                    return (
                      <button
                        key={region}
                        type="button"
                        onClick={() => {
                          setActiveRegion(region);
                          setQuery("");
                        }}
                        className={`text-oe-label flex min-h-9 w-full items-center border-b border-oe-border-secondary pl-[18px] pr-2 text-left ${
                          active
                            ? "relative z-20 bg-oe-background-primary font-medium text-oe-foreground-primary"
                            : "text-oe-foreground-secondary hover:bg-oe-interaction-hover"
                        }`}
                      >
                        <span className="min-w-0 flex-1 truncate">{region}</span>
                        <RiArrowDownSLine className="size-4 -rotate-90 text-oe-foreground-tertiary" aria-hidden="true" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="oe-scrollbar-bare h-[264px] overflow-x-hidden overflow-y-auto p-2">
                <p className="px-2.5 pb-1.5 pt-1 text-[11px] font-medium text-oe-foreground-tertiary">
                  {keyword ? `「${keyword}」 검색 결과` : activeRegion}
                </p>
                {stores.length === 0 ? (
                  <p className="px-2.5 py-6 text-center text-xs text-oe-foreground-tertiary">찾는 점포가 없습니다.</p>
                ) : (
                  <>
                    {/* 검색 중에는 「전체」가 검색 결과 전부를 뜻한다. 보이는 것과 켜지는 것이
                        어긋나지 않도록 둘 다 지금 목록을 대상으로 삼는다. */}
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={somePicked ? "mixed" : allPicked}
                      onClick={toggleAll}
                      className={`text-oe-label flex min-h-9 w-full items-center gap-2 rounded-md px-2.5 text-left ${
                        allPicked ? "" : "hover:bg-oe-interaction-hover"
                      }`}
                    >
                      <CheckboxIndicator checked={allPicked} indeterminate={somePicked} />
                      <span className="font-semibold">전체</span>
                    </button>
                    {stores.map((name) => {
                      const selected = value.includes(name);
                      return (
                        <button
                          key={name}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => toggle(name)}
                          className={`text-oe-label flex min-h-9 w-full items-center gap-2 rounded-md px-2.5 text-left ${
                            selected ? "" : "hover:bg-oe-interaction-hover"
                          }`}
                        >
                          <CheckboxIndicator checked={selected} />
                          <span className="min-w-0 flex-1 truncate">{name}</span>
                          {/* 검색 결과에서는 그 점포가 어느 지역인지 붙인다. 지역을 가리지 않고
                              찾았으므로 이름만으로는 어디인지 알 수 없다. */}
                          {keyword ? <span className="shrink-0 text-[11px] text-oe-foreground-tertiary">{regionOf(name)}</span> : null}
                        </button>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

/** 고른 점포를 트리거 한 줄에 요약한다. 다른 축의 MultiCombobox 와 같은 표기를 쓴다. */
function summary(value: string[]) {
  return value.length > 1 ? `${value[0]} +${value.length - 1}` : value[0];
}
