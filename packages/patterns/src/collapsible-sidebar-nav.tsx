"use client";

import { useState, useSyncExternalStore } from "react";
import {
  RiArrowLeftDoubleLine,
  RiArrowRightDoubleLine,
  RiBarChartBoxLine,
  RiDashboardLine,
  RiFolderLine,
  RiPulseLine,
  RiRocketLine,
  RiSearchLine,
  RiServerLine,
  RiSpeedUpLine,
} from "@remixicon/react";

import { cn } from "./utils";

const STORAGE_KEY = "ooee-collapsible-sidebar";
const CHANGE_EVENT = "ooee-collapsible-sidebar-change";

const items = {
  workspace: [
    { id: "projects", icon: RiFolderLine },
    { id: "deployments", icon: RiRocketLine, count: 3 },
    { id: "environments", icon: RiServerLine },
  ],
  insights: [
    { id: "analytics", icon: RiBarChartBoxLine },
    { id: "logs", icon: RiPulseLine, count: 12, danger: true },
    { id: "usage", icon: RiSpeedUpLine },
  ],
} as const;

const copy = {
  ko: {
    brand: "Acme Studio", search: "메뉴 검색…", workspace: "워크스페이스", insights: "인사이트",
    projects: "프로젝트", deployments: "배포", environments: "환경", analytics: "분석", logs: "로그", usage: "사용량",
    collapse: "사이드바 접기", expand: "사이드바 펼치기", user: "샘 머서", plan: "팀 요금제", preview: "선택한 메뉴",
  },
  en: {
    brand: "Acme Studio", search: "Search…", workspace: "Workspace", insights: "Insights",
    projects: "Projects", deployments: "Deployments", environments: "Environments", analytics: "Analytics", logs: "Logs", usage: "Usage",
    collapse: "Collapse sidebar", expand: "Expand sidebar", user: "Sam Mercer", plan: "Team plan", preview: "Selected navigation",
  },
} as const;

type GroupId = keyof typeof items;
type ItemId = (typeof items)[GroupId][number]["id"];

export function CollapsibleSidebarNav({ locale = "ko" }: { locale?: "ko" | "en" }) {
  const activeCopy = copy[locale];
  const collapsed = useSyncExternalStore(subscribeToCollapsed, getCollapsedSnapshot, () => false);
  const [activeItem, setActiveItem] = useState<ItemId>("projects");
  const [openGroups, setOpenGroups] = useState<Record<GroupId, boolean>>({ workspace: true, insights: true });

  function toggleRail() {
    window.localStorage.setItem(STORAGE_KEY, collapsed ? "expanded" : "collapsed");
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }

  function toggleGroup(group: GroupId) {
    setOpenGroups((current) => ({ ...current, [group]: !current[group] }));
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-oe-border-secondary bg-oe-background-canvas-secondary">
      <div className="flex min-h-[680px] overflow-x-auto">
        <aside
          className={cn(
            "flex shrink-0 flex-col border-r border-oe-border-secondary bg-oe-background-primary transition-[width] duration-200",
            collapsed ? "w-[72px]" : "w-[260px]",
          )}
          aria-label={activeCopy.brand}
        >
          <div className={cn("flex items-center py-4", collapsed ? "justify-center px-3" : "gap-3 px-4")}>
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-oe-background-bold-primary text-sm font-medium text-oe-foreground-inverse" aria-hidden="true">A</div>
            {!collapsed && <span className="min-w-0 flex-1 truncate text-sm font-semibold text-oe-foreground-primary">{activeCopy.brand}</span>}
            <button type="button" onClick={toggleRail} className="oe-hover-layer flex size-8 shrink-0 items-center justify-center rounded-lg text-oe-foreground-tertiary outline-none hover:text-oe-foreground-primary focus-visible:ring-2 focus-visible:ring-oe-focus-ring" aria-label={collapsed ? activeCopy.expand : activeCopy.collapse}>
              {collapsed ? <RiArrowRightDoubleLine className="size-4" aria-hidden="true" /> : <RiArrowLeftDoubleLine className="size-4" aria-hidden="true" />}
            </button>
          </div>

          {!collapsed && (
            <div className="px-3 pb-2">
              <label className="relative block">
                <span className="sr-only">{activeCopy.search}</span>
                <RiSearchLine className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-oe-foreground-tertiary" aria-hidden="true" />
                <input placeholder={activeCopy.search} className="h-9 w-full rounded-lg border border-oe-border-secondary bg-oe-background-secondary pl-9 pr-3 text-sm text-oe-foreground-primary outline-none placeholder:text-oe-foreground-tertiary focus:border-oe-focus-ring focus:ring-2 focus:ring-oe-focus-ring/20" />
              </label>
            </div>
          )}

          <nav className={cn("flex-1 overflow-y-auto py-2", collapsed ? "px-3" : "px-3")} aria-label={activeCopy.brand}>
            {(Object.keys(items) as GroupId[]).map((group, groupIndex) => {
              const groupOpen = openGroups[group];
              return (
                <div key={group} className={groupIndex === 0 ? "" : collapsed ? "mt-2" : "mt-3"}>
                  {!collapsed && (
                    <button type="button" onClick={() => toggleGroup(group)} aria-expanded={groupOpen} aria-controls={`sidebar-${group}`} className="flex w-full items-center justify-between rounded-md px-2 pb-1 pt-3 text-[11px] font-medium uppercase tracking-widest text-oe-foreground-tertiary outline-none focus-visible:ring-2 focus-visible:ring-oe-focus-ring">
                      {activeCopy[group]}
                      <RiArrowRightDoubleLine className={cn("size-3.5 transition-transform", groupOpen ? "rotate-90" : "")} aria-hidden="true" />
                    </button>
                  )}
                  <ul id={`sidebar-${group}`} className={cn("space-y-0.5", !collapsed && !groupOpen && "hidden")}>
                    {items[group].map((item) => {
                      const Icon = item.icon;
                      const active = activeItem === item.id;
                      return (
                        <li key={item.id}>
                          <button
                            type="button"
                            onClick={() => setActiveItem(item.id)}
                            aria-current={active ? "page" : undefined}
                            aria-label={collapsed ? activeCopy[item.id] : undefined}
                            title={collapsed ? activeCopy[item.id] : undefined}
                            className={cn(
                              "oe-hover-layer relative flex w-full items-center rounded-lg border-l-2 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-oe-focus-ring",
                              collapsed ? "justify-center px-2" : "gap-3 px-2.5 text-left",
                              active ? "border-oe-background-bold-primary bg-oe-background-secondary font-medium text-oe-foreground-primary" : "border-transparent text-oe-foreground-secondary hover:text-oe-foreground-primary",
                            )}
                          >
                            <Icon className="size-4 shrink-0" aria-hidden="true" />
                            {!collapsed && <span className="min-w-0 flex-1 truncate">{activeCopy[item.id]}</span>}
                            {!collapsed && "count" in item && (
                              <span aria-label={`${activeCopy[item.id]} ${item.count}`} className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-medium leading-none tabular-nums ${"danger" in item && item.danger ? "bg-oe-danger-background-primary text-oe-danger-foreground-primary" : "bg-oe-background-secondary text-oe-foreground-secondary"}`}>{item.count}</span>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </nav>

          <div className={cn("flex items-center border-t border-oe-border-secondary py-3", collapsed ? "justify-center px-3" : "gap-3 px-4")}>
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-oe-background-secondary text-xs font-medium text-oe-foreground-secondary">SM</div>
            {!collapsed && <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-oe-foreground-primary">{activeCopy.user}</p><p className="truncate text-xs text-oe-foreground-tertiary">{activeCopy.plan}</p></div>}
          </div>
        </aside>

        <div className="flex min-w-[420px] flex-1 flex-col items-center justify-center p-8 text-center">
          <RiDashboardLine className="size-8 text-oe-foreground-tertiary" aria-hidden="true" />
          <p className="mt-3 text-xs font-medium text-oe-foreground-tertiary">{activeCopy.preview}</p>
          <p className="mt-1 text-lg font-semibold text-oe-foreground-primary">{activeCopy[activeItem]}</p>
        </div>
      </div>
    </section>
  );
}

function subscribeToCollapsed(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(CHANGE_EVENT, onStoreChange);
  };
}

function getCollapsedSnapshot() {
  return window.localStorage.getItem(STORAGE_KEY) === "collapsed";
}
