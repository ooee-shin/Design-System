"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { screenRoots } from "@/components/renewal/screen-registry";
import { SANDBOX_PROJECTS, sandboxScreens } from "@/screens";

import { collectComponents, STUDIO_ORIGIN, studioDocUrl, tally, type Placed } from "./component-map";

/** 이 부품이 그린 것은 세지 않는다. 막대·목록 자체가 화면의 일부처럼 잡히면 수가 틀린다. */
const OWN = "data-component-inspector";

type Where = { project: string; projectHref: string; name: string; prompt?: string; createdAt?: string; source?: string };

/** 지금 주소가 어느 요청의 어느 화면인지. 생성 화면은 screens.ts, 블루키 리뉴얼은 작업 목록이 안다. */
function whereAmI(pathname: string): Where | null {
  const screen = sandboxScreens.find((item) => item.href === pathname);
  if (screen) {
    const project = SANDBOX_PROJECTS.find((item) => item.id === screen.project);
    return { project: project?.name ?? screen.project, projectHref: `/#${screen.project}`, name: screen.name, prompt: screen.prompt, createdAt: screen.createdAt, source: screen.source };
  }
  for (const root of screenRoots) {
    const item = root.items.find((entry) => entry.href === pathname);
    if (item) return { project: `블루키 리뉴얼 · ${root.name}`, projectHref: "/#renewal", name: item.name };
    if (pathname === `/renewal/${root.key}`) return { project: "블루키 리뉴얼", projectHref: "/#renewal", name: `${root.name} 작업 목록` };
  }
  return null;
}

type Box = { name: string; top: number; left: number; width: number; height: number };

const boxesOf = (placed: Placed[]): Box[] =>
  placed.map(({ name, el }) => {
    const rect = el.getBoundingClientRect();
    return { name, top: rect.top, left: rect.left, width: rect.width, height: rect.height };
  });

/**
 * sandbox 화면마다 아래에 뜨는 막대다. 「컴포넌트 보기」를 켜면 화면 위 컴포넌트마다 테두리와 이름표가 서고
 * 오른쪽에 목록이 열린다. 목록에서 이름에 올리면 그 자리만 남기고, 누르면 Studio 문서로 간다. 맨 위는
 * 디자인 시스템 › 요청 › 화면이다(2026-09-22 개발자).
 *
 * 화면 코드는 건드리지 않는다. 루트 layout 이 모든 화면에 얹고, 화면은 이것이 있는 줄 모른다.
 */
export function ComponentInspector() {
  const pathname = usePathname();
  if (!pathname || pathname === "/") return null;
  return <InspectorBar pathname={pathname} />;
}

/** 주소를 받아 그리는 몸체. 테스트는 라우터 없이 이것을 바로 그린다. */
export function InspectorBar({ pathname }: { pathname: string }) {
  const [placed, setPlaced] = useState<Placed[]>([]);
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [open, setOpen] = useState<"components" | "request" | null>(null);
  const [focus, setFocus] = useState<string | null>(null);

  const scan = useCallback(() => {
    const found = collectComponents(document.body).filter(({ el }) => !el.closest(`[${OWN}]`));
    setPlaced(found);
    setBoxes(boxesOf(found));
  }, []);

  // 화면을 옮기면 다시 센다. 첫 그림이 그려진 뒤에 세야 클라이언트에서만 서는 컴포넌트도 잡힌다.
  useEffect(() => {
    setOpen(null);
    setFocus(null);
    const id = requestAnimationFrame(scan);
    return () => cancelAnimationFrame(id);
  }, [pathname, scan]);

  // 테두리는 화면 좌표에 선다. 스크롤·창 크기·화면 안의 변화(탭·펼침)가 있으면 다시 잰다.
  useLayoutEffect(() => {
    if (open !== "components") return;
    scan();
    let frame = 0;
    const again = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(scan);
    };
    window.addEventListener("scroll", again, true);
    window.addEventListener("resize", again);
    const observer = new MutationObserver(again);
    observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["class", "data-state", "hidden"] });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", again, true);
      window.removeEventListener("resize", again);
      observer.disconnect();
    };
  }, [open, scan]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const where = whereAmI(pathname);
  const rows = tally(placed);

  return (
    <div {...{ [OWN]: "" }}>
      {open === "components" ? (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[55]">
          {boxes.map((box, index) => {
            const dim = focus !== null && focus !== box.name;
            return (
              <div
                key={index}
                className={`absolute rounded-[3px] border-2 transition-opacity ${dim ? "border-oe-border-secondary opacity-30" : "border-oe-brand-border-primary"}`}
                style={{ top: box.top, left: box.left, width: box.width, height: box.height }}
              >
                {!dim ? (
                  // 창 맨 위에 붙은 요소는 이름표가 창 밖으로 잘리므로 테두리 안쪽에 세운다.
                  <span className={`absolute ${box.top < 20 ? "top-0" : "-top-5"} left-[-2px] whitespace-nowrap rounded-[3px] bg-oe-brand-background-bold-primary px-1 text-[11px] leading-5 font-medium text-oe-foreground-inverse`}>
                    {box.name}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}

      {open ? (
        <aside
          aria-label={open === "components" ? "쓴 컴포넌트" : "요청"}
          className="fixed right-4 top-4 bottom-20 z-[60] flex w-[min(18rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl border border-oe-border-secondary bg-oe-background-primary shadow-lg"
        >
          <nav aria-label="경로" className="border-b border-oe-border-secondary px-4 py-3 text-xs text-oe-foreground-tertiary">
            <a href={STUDIO_ORIGIN} target="_blank" rel="noreferrer" className="rounded-sm hover:text-oe-foreground-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-focus-ring">
              디자인 시스템
            </a>
            <span aria-hidden="true"> › </span>
            {where ? (
              <>
                <a href={where.projectHref} className="rounded-sm hover:text-oe-foreground-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-focus-ring">
                  {where.project}
                </a>
                <span aria-hidden="true"> › </span>
                <span className="text-oe-foreground-primary">{where.name}</span>
              </>
            ) : (
              <span className="text-oe-foreground-primary">{pathname}</span>
            )}
          </nav>

          {open === "components" ? (
            <div className="flex min-h-0 flex-1 flex-col">
              <p className="px-4 pt-3 pb-2 text-sm font-semibold text-oe-foreground-primary">
                쓴 컴포넌트 <span className="font-normal text-oe-foreground-tertiary">{rows.length}종 · {placed.length}곳</span>
              </p>
              {rows.length === 0 ? (
                <p className="px-4 text-sm text-oe-foreground-tertiary">이 화면에서 찾은 디자인 시스템 컴포넌트가 없습니다.</p>
              ) : (
                <ul className="min-h-0 flex-1 overflow-y-auto px-2 pb-3" onMouseLeave={() => setFocus(null)}>
                  {rows.map((row) => (
                    <li key={row.name}>
                      <a
                        href={studioDocUrl(row.key)}
                        target="_blank"
                        rel="noreferrer"
                        onMouseEnter={() => setFocus(row.name)}
                        onFocus={() => setFocus(row.name)}
                        onBlur={() => setFocus(null)}
                        className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm text-oe-foreground-primary hover:bg-oe-interaction-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-focus-ring"
                      >
                        <span>{row.name}</span>
                        <span className="text-xs text-oe-foreground-tertiary">
                          ×{row.count} <span aria-hidden="true">↗</span>
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
              <p className="border-t border-oe-border-secondary px-4 py-2 text-xs leading-5 text-oe-foreground-tertiary">
                테두리가 없는 자리는 디자인 시스템 컴포넌트가 아니라 화면에서 직접 만든 것입니다.
              </p>
            </div>
          ) : (
            <dl className="flex flex-col gap-3 overflow-y-auto px-4 py-3 text-sm">
              <div>
                <dt className="text-xs text-oe-foreground-tertiary">요청</dt>
                <dd className="mt-0.5 leading-6 text-oe-foreground-primary">{where?.prompt ?? "요청 기록이 없습니다."}</dd>
              </div>
              {where?.createdAt ? (
                <div>
                  <dt className="text-xs text-oe-foreground-tertiary">만든 날</dt>
                  <dd className="mt-0.5 text-oe-foreground-primary">{where.createdAt}</dd>
                </div>
              ) : null}
              <div>
                <dt className="text-xs text-oe-foreground-tertiary">원본</dt>
                <dd className="mt-0.5 break-all text-oe-foreground-primary">{where?.source ?? "없음"}</dd>
              </div>
              <p className="text-xs leading-5 text-oe-foreground-tertiary">요청 문단 전체는 화면 파일(page.tsx) 머리말에 그대로 있습니다.</p>
            </dl>
          )}
        </aside>
      ) : null}

      <div role="toolbar" aria-label="화면 도구" className="fixed bottom-4 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-1 rounded-full border border-oe-border-secondary bg-oe-background-primary p-1 shadow-lg">
        {where?.prompt ? (
          <button
            type="button"
            aria-pressed={open === "request"}
            onClick={() => setOpen(open === "request" ? null : "request")}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-focus-ring ${open === "request" ? "bg-oe-background-bold-primary text-oe-foreground-inverse" : "text-oe-foreground-secondary hover:bg-oe-interaction-hover"}`}
          >
            요청 보기
          </button>
        ) : null}
        <button
          type="button"
          aria-pressed={open === "components"}
          onClick={() => setOpen(open === "components" ? null : "components")}
          className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-focus-ring ${open === "components" ? "bg-oe-background-bold-primary text-oe-foreground-inverse" : "text-oe-foreground-secondary hover:bg-oe-interaction-hover"}`}
        >
          컴포넌트 보기 <span className={open === "components" ? "" : "text-oe-foreground-tertiary"}>{rows.length}</span>
        </button>
      </div>
    </div>
  );
}
