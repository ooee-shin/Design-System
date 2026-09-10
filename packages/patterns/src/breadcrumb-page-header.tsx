"use client";

import { useState } from "react";
import { Popover } from "@base-ui/react/popover";
import {
  RiArrowRightSLine,
  RiFileCopyLine,
  RiMoreLine,
  RiShareForwardLine,
} from "@remixicon/react";

import { Button } from "@ooee/ui";
import { cn } from "./utils";

const tabs = [
  { id: "overview", count: undefined },
  { id: "data", count: undefined },
  { id: "comments", count: 7 },
  { id: "schedule", count: undefined },
  { id: "history", count: undefined },
] as const;

const copy = {
  ko: {
    workspaces: "워크스페이스", hiddenTrigger: "숨겨진 경로 보기", hiddenTitle: "숨겨진 경로", reports: "리포트",
    title: "월간 매출", status: "초안", owner: "미라 오세이 소유", created: "2026년 7월 14일 생성",
    duplicate: "복제", share: "공유", publish: "게시", more: "추가 작업", export: "CSV 내보내기", archive: "레코드 보관",
    activeSection: "현재 섹션", noAction: "선택한 작업 없음",
    tabs: { overview: "개요", data: "데이터", comments: "댓글", schedule: "일정", history: "기록" },
    feedback: { workspaces: "워크스페이스 선택", studioform: "Studioform 선택", reports: "리포트 선택", duplicate: "레코드 복제", share: "공유 열기", publish: "레코드 게시", export: "내보내기 선택", archive: "보관 선택" },
  },
  en: {
    workspaces: "Workspaces", hiddenTrigger: "Show hidden breadcrumb levels", hiddenTitle: "Hidden level", reports: "Reports",
    title: "Monthly revenue", status: "Draft", owner: "Owned by Mira Osei", created: "Created 14 Jul 2026",
    duplicate: "Duplicate", share: "Share", publish: "Publish", more: "More actions", export: "Export CSV", archive: "Archive record",
    activeSection: "Active section", noAction: "No action selected",
    tabs: { overview: "Overview", data: "Data", comments: "Comments", schedule: "Schedule", history: "History" },
    feedback: { workspaces: "Workspaces selected", studioform: "Studioform selected", reports: "Reports selected", duplicate: "Record duplicated", share: "Share opened", publish: "Record published", export: "Export selected", archive: "Archive selected" },
  },
} as const;

type TabId = (typeof tabs)[number]["id"];

export function BreadcrumbPageHeader({ locale = "ko" }: { locale?: "ko" | "en" }) {
  const activeCopy = copy[locale];
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [lastAction, setLastAction] = useState<string | null>(null);

  return (
    <section className="overflow-hidden rounded-2xl border border-oe-border-secondary bg-oe-background-primary shadow-sm">
      <header className="border-b border-oe-border-secondary bg-oe-background-primary">
        <div className="mx-auto max-w-6xl px-4 pt-5 sm:px-6 sm:pt-6">
          <nav className="flex min-w-0 items-center gap-1.5 text-sm text-oe-foreground-tertiary sm:gap-2" aria-label="Record breadcrumb">
            <button type="button" onClick={() => setLastAction(activeCopy.feedback.workspaces)} className="oe-hover-layer shrink-0 rounded-md px-1 py-0.5 outline-none transition-colors hover:text-oe-foreground-primary focus-visible:ring-2 focus-visible:ring-oe-focus-ring">
              {activeCopy.workspaces}
            </button>
            <RiArrowRightSLine className="size-4 shrink-0 text-oe-border-primary" aria-hidden="true" />
            <button type="button" onClick={() => setLastAction(activeCopy.feedback.studioform)} className="oe-hover-layer min-w-0 truncate rounded-md px-1 py-0.5 outline-none transition-colors hover:text-oe-foreground-primary focus-visible:ring-2 focus-visible:ring-oe-focus-ring">
              Studioform
            </button>
            <RiArrowRightSLine className="size-4 shrink-0 text-oe-border-primary" aria-hidden="true" />
            <Popover.Root>
              <Popover.Trigger className="oe-hover-layer inline-flex size-7 shrink-0 items-center justify-center rounded-md text-oe-foreground-tertiary outline-none hover:text-oe-foreground-primary focus-visible:ring-2 focus-visible:ring-oe-focus-ring" aria-label={activeCopy.hiddenTrigger}>
                <RiMoreLine className="size-4" aria-hidden="true" />
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Positioner positionMethod="fixed" side="bottom" align="start" sideOffset={6} collisionPadding={8} collisionAvoidance={{ side: "flip", align: "shift" }}>
                  <Popover.Popup className="z-50 min-w-40 rounded-xl border border-oe-border-secondary bg-oe-background-primary p-1.5 text-sm text-oe-foreground-primary shadow-lg outline-none transition-opacity data-ending-style:opacity-0 data-starting-style:opacity-0">
                    <Popover.Title className="px-2 py-1 text-[11px] font-medium text-oe-foreground-tertiary">{activeCopy.hiddenTitle}</Popover.Title>
                    <button type="button" onClick={() => setLastAction(activeCopy.feedback.reports)} className="oe-hover-layer w-full rounded-lg px-2 py-1.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-oe-focus-ring">
                      {activeCopy.reports}
                    </button>
                  </Popover.Popup>
                </Popover.Positioner>
              </Popover.Portal>
            </Popover.Root>
            <RiArrowRightSLine className="size-4 shrink-0 text-oe-border-primary" aria-hidden="true" />
            <span className="min-w-0 truncate font-medium text-oe-foreground-primary" aria-current="page">{activeCopy.title}</span>
          </nav>

          <div className="mt-5 flex flex-wrap items-start justify-between gap-5">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-semibold tracking-tight text-oe-foreground-primary">{activeCopy.title}</h1>
                <span className="inline-flex h-6 items-center gap-1 rounded-full bg-amber-100 px-2 text-xs font-medium text-amber-900 dark:bg-amber-950 dark:text-amber-200">{activeCopy.status}</span>
              </div>
              <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-oe-foreground-tertiary">
                <span>{activeCopy.owner}</span>
                <span className="text-oe-border-primary" aria-hidden="true">·</span>
                <span>{activeCopy.created}</span>
                <span className="text-oe-border-primary" aria-hidden="true">·</span>
                <span className="font-mono text-xs">rep_8f21c94a</span>
              </p>
            </div>

            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end" aria-label="Record actions">
              <Button variant="outline" tone="neutral" controlSize="large" onClick={() => setLastAction(activeCopy.feedback.duplicate)} leadingIcon={<RiFileCopyLine />}>
                {activeCopy.duplicate}
              </Button>
              <Button variant="outline" tone="neutral" controlSize="large" onClick={() => setLastAction(activeCopy.feedback.share)} leadingIcon={<RiShareForwardLine />}>
                {activeCopy.share}
              </Button>
              <Button controlSize="large" onClick={() => setLastAction(activeCopy.feedback.publish)}>
                {activeCopy.publish}
              </Button>
              <Popover.Root>
                <Popover.Trigger className="oe-hover-layer inline-flex size-9 items-center justify-center rounded-lg border border-oe-border-secondary bg-oe-background-primary text-oe-foreground-tertiary outline-none hover:text-oe-foreground-primary focus-visible:ring-2 focus-visible:ring-oe-focus-ring" aria-label={activeCopy.more}>
                  <RiMoreLine className="size-4" aria-hidden="true" />
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Positioner positionMethod="fixed" side="bottom" align="end" sideOffset={6} collisionPadding={8} collisionAvoidance={{ side: "flip", align: "shift" }}>
                    <Popover.Popup className="z-50 min-w-44 rounded-xl border border-oe-border-secondary bg-oe-background-primary p-1.5 text-sm text-oe-foreground-primary shadow-lg outline-none transition-opacity data-ending-style:opacity-0 data-starting-style:opacity-0">
                      <Popover.Title className="px-2 py-1 text-[11px] font-medium text-oe-foreground-tertiary">{activeCopy.more}</Popover.Title>
                      {[
                        [activeCopy.export, activeCopy.feedback.export],
                        [activeCopy.archive, activeCopy.feedback.archive],
                      ].map(([label, feedback]) => (
                        <button key={label} type="button" onClick={() => setLastAction(feedback)} className="oe-hover-layer w-full rounded-lg px-2 py-1.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-oe-focus-ring">
                          {label}
                        </button>
                      ))}
                    </Popover.Popup>
                  </Popover.Positioner>
                </Popover.Portal>
              </Popover.Root>
            </div>
          </div>

          <nav className="mt-6 flex gap-6 overflow-x-auto text-sm sm:gap-7" aria-label="Record sections">
            {tabs.map(({ id, count }) => {
              const active = activeTab === id;
              const label = activeCopy.tabs[id];
              return (
                <button
                  key={id}
                  type="button"
                  aria-current={active ? "page" : undefined}
                  onClick={() => setActiveTab(id)}
                  className={cn(
                    "flex shrink-0 items-center gap-2 border-b-2 pb-3 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-oe-focus-ring focus-visible:ring-offset-2",
                    active
                      ? "border-oe-background-bold-primary font-medium text-oe-foreground-primary"
                      : "border-transparent text-oe-foreground-tertiary hover:text-oe-foreground-primary",
                  )}
                >
                  {label}
                  {count !== undefined && (
                    <span aria-label={`${label} ${count}`} className="inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-medium leading-none tabular-nums bg-oe-background-secondary text-oe-foreground-secondary">{count}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <div className="min-h-56 bg-oe-background-canvas-secondary p-5 sm:p-6">
        <div className="mx-auto max-w-6xl rounded-xl border border-dashed border-oe-border-secondary bg-oe-background-primary p-5">
          <p className="text-xs font-medium text-oe-foreground-tertiary">{activeCopy.activeSection}</p>
          <p className="mt-1 text-lg font-medium text-oe-foreground-primary">{activeCopy.tabs[activeTab]}</p>
          <p className="mt-3 text-sm text-oe-foreground-secondary" aria-live="polite">{lastAction ?? activeCopy.noAction}</p>
        </div>
      </div>
    </section>
  );
}
