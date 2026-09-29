"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";

import { screenRoots } from "@/components/renewal/screen-registry";
import { SANDBOX_PROJECTS, sandboxScreens } from "@/screens";

import { collectComponents, STUDIO_ORIGIN, studioDocUrl, tally, type Placed } from "./component-map";

/**
 * 이 부품이 그린 것은 세지 않는다. 막대·목록·덮개 자체가 화면의 일부처럼 잡히면 수가 틀린다.
 *
 * 지금 구조에서는 단추가 액자 밖 막대에, 판도 액자 밖 `document.body` 에 있으므로 액자 안 문서를 훑는
 * 이 제외가 걸러 낼 것이 원리상 없다 — 그래도 **남긴다**(`2026-09-29` 개발자). 테두리 덮개만은 액자 **안**
 * 문서에 그리므로, 덮개가 앞으로 `data-slot` 을 쓰는 조각(예: 이름표를 `Badge` 로)을 쓰게 되면 그 순간부터
 * 자기 자신을 세게 된다. 지우면 그때 조용히 수가 틀리고, 남겨 두면 값이 없다. 죽은 장치로 두지 않도록
 * 액자 안 문서에 이 표식을 두른 `data-slot` 을 심어 세지 않는지 재는 시험을 함께 둔다.
 */
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

/** 액자 안 문서를 읽을 수 있으면 돌려준다. 아직 안 떴거나 `about:blank` 면 null 이라 0 개로 남는다. */
function readableDocument(frame: HTMLIFrameElement | null): Document | null {
  let doc: Document | null = null;
  try {
    doc = frame?.contentDocument ?? null;
  } catch {
    // 다른 출처 액자는 읽지 못한다. sandbox 는 같은 출처만 열지만 막아 둔다.
    return null;
  }
  if (!doc?.body || doc.location?.href === "about:blank") return null;
  return doc;
}

/**
 * 셀 대상인 액자 안 문서를 찾는다. 막대는 액자 **밖** 문서에 있고 화면은 액자 안에 있으므로
 * 「자기 문서」를 훑으면 액자 하나만 보여 늘 0 개다(`2026-09-28` #124 가 이 함정에 빠졌다).
 *
 * 액자는 보기 폭을 바꾸거나 화면을 옮길 때마다 새로 서므로 `MutationObserver` 로 바뀐 액자를 다시 잡고,
 * 액자가 뜨는 때는 `load` 로 듣는다. 액자가 새 주소를 열면 `contentDocument` 도 새 `Document` 라
 * 돌려주는 값의 정체가 달라진다 — 세는 쪽은 그 정체만 보고 다시 셀 때를 안다.
 */
export function useFrameDocument(): Document | null {
  const [doc, setDoc] = useState<Document | null>(null);

  useEffect(() => {
    let frame: HTMLIFrameElement | null = null;
    const take = () => setDoc(readableDocument(frame));
    const sync = () => {
      const next = document.querySelector<HTMLIFrameElement>("iframe[data-sandbox-frame]");
      // 같은 액자면 아무것도 하지 않는다 — 막대 자신이 다시 그려질 때마다 상태를 흔들면 맴돈다.
      if (next === frame) return;
      frame?.removeEventListener("load", take);
      frame = next;
      frame?.addEventListener("load", take);
      take();
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { subtree: true, childList: true });
    return () => {
      observer.disconnect();
      frame?.removeEventListener("load", take);
    };
  }, []);

  return doc;
}

/**
 * sandbox 화면의 도구 단추다. 「컴포넌트 보기」를 켜면 화면 위 컴포넌트마다 테두리와 이름표가 서고
 * 오른쪽에 목록이 열린다. 목록에서 이름에 올리면 그 자리만 남기고, 누르면 Studio 문서로 간다. 맨 위는
 * 디자인 시스템 › 요청 › 화면이다(2026-09-22 개발자).
 *
 * **단추 둘은 맨 위 「화면 도구」 막대(`ViewportFrame` 의 `tools`)의 맨 왼쪽에 선다**(`2026-09-29` 개발자 — 전에는 화면 아래에 알약
 * 막대로 떠서 화면을 가렸다). 그러려면 막대와 같은 문서, 곧 액자 **밖** 문서에서 그려야 하므로
 * 세는 대상만 액자 안 문서로 돌린다(`useFrameDocument`). 테두리·이름표는 액자 안 좌표계라야 자리가
 * 맞으니 `createPortal` 로 액자 안 문서의 body 에 그린다 — 그러면 액자 안 스크롤과 `fixed` 가 그대로 맞는다.
 *
 * **판(`aside`)도 `createPortal` 로 액자 **밖** `document.body` 에 그린다**(`2026-09-29` 개발자). 단추와 함께
 * 막대 안에 두었더니 열린 판 전체(`nav` 와 링크 8개)가 `role="toolbar"` 의 자손이 되어 낭독기가 판의 글을
 * 도구 모음 안에서 읽었다 — 도구 모음에는 단추 둘만 남긴다. 판은 `fixed` 라 자리는 그대로다(body 에도
 * `transform`·`filter` 가 없어 담는 블록이 창인 것이 바뀌지 않는다. `2026-09-29` 에 실측으로 다시 맞췄다).
 *
 * 화면 코드는 건드리지 않는다. 루트 layout 이 `ViewportFrame` 의 도구 자리로 넘기고, 화면은 이것이 있는 줄 모른다.
 */
export function ComponentInspector() {
  const pathname = usePathname();
  const doc = useFrameDocument();
  if (!pathname || pathname === "/") return null;
  return <InspectorBar pathname={pathname} doc={doc} />;
}

/**
 * 주소와 **셀 문서**를 받아 그리는 몸체. 테스트는 라우터도 액자도 없이 이것을 바로 그리고 문서를 직접 준다.
 * `doc` 이 null 이면(액자가 아직 안 떴다) 0 개로 두고, 액자가 뜨면 다시 센다.
 */
export function InspectorBar({ pathname, doc }: { pathname: string; doc: Document | null }) {
  const [placed, setPlaced] = useState<Placed[]>([]);
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [open, setOpen] = useState<"components" | "request" | null>(null);
  const [focus, setFocus] = useState<string | null>(null);
  // 단추가 들어앉은 막대. 판을 그 아래에서 시작하려고 높이를 잰다.
  const shelf = useRef<HTMLDivElement | null>(null);
  const [barBottom, setBarBottom] = useState(41);

  const where = whereAmI(pathname);
  const rows = tally(placed);

  const scan = useCallback(() => {
    const body = doc?.body;
    if (!body) {
      setPlaced([]);
      setBoxes([]);
      return;
    }
    const found = collectComponents(body).filter(({ el }) => !el.closest(`[${OWN}]`));
    setPlaced(found);
    setBoxes(boxesOf(found));
  }, [doc]);

  // 화면을 옮기면 판을 닫는다.
  useEffect(() => {
    setOpen(null);
    setFocus(null);
  }, [pathname]);

  // 액자가 새로 뜨거나 액자 안이 자라면(하이드레이션·클라이언트에서만 서는 컴포넌트) 다시 센다. 켜기 전에도
  // 단추에 수가 보여야 하므로 세는 일은 판이 닫혀 있어도 돈다.
  useEffect(() => {
    let frame = requestAnimationFrame(scan);
    const again = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(scan);
    };
    const body = doc?.body;
    let observer: MutationObserver | null = null;
    if (body) {
      observer = new MutationObserver(again);
      observer.observe(body, { subtree: true, childList: true });
    }
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [doc, scan]);

  // 테두리는 액자 안 화면 좌표에 선다. 액자 안의 스크롤·크기·변화(탭·펼침)가 있으면 다시 잰다 —
  // 리스너는 바깥 `window` 가 아니라 액자 안 `window` 에 건다.
  useLayoutEffect(() => {
    if (open !== "components") return;
    const body = doc?.body;
    const view = doc?.defaultView;
    if (!body || !view) return;
    scan();
    let frame = 0;
    const again = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(scan);
    };
    // 리스너를 액자 **안** window 에 건다. 폭을 태블릿↔모바일로 바꾸면 같은 iframe 의 width·height 속성만
    // 바뀌어 바깥 window 에는 `resize` 가 오지 않고 액자 안에만 온다. 이 줄을 바깥 window 로 되돌려도 지금
    // 시험은 붉어지지 않으므로(jsdom 의 액자 문서에 `defaultView` 를 세우기 어렵다) 브라우저 실측이 유일한
    // 그물이다 — 테두리 좌표가 폭을 바꾼 뒤에도 맞는지 본다.
    view.addEventListener("scroll", again, true);
    view.addEventListener("resize", again);
    const observer = new MutationObserver(again);
    observer.observe(body, { subtree: true, childList: true, attributes: true, attributeFilter: ["class", "data-state", "hidden"] });
    return () => {
      cancelAnimationFrame(frame);
      view.removeEventListener("scroll", again, true);
      view.removeEventListener("resize", again);
      observer.disconnect();
    };
  }, [open, scan, doc]);

  // 판은 맨 위 막대 바로 아래에서 시작한다. 좁은 창에서는 막대가 두 줄이 되므로 높이를 재서 맞춘다 —
  // 고정값(`top-12`)으로 두면 두 줄 막대의 아랫줄을 판이 덮었다(2026-09-29 에 390px 창에서 재었다).
  //
  // 창 크기만 듣던 때는 **막대가 스스로 줄을 바꾸는 경우**를 놓쳤다. 좁은 창에서 태블릿을 고르면 막대에
  // 「창이 … 액자보다 좁아」 안내 줄이 생겨 41 → 73 → 93px 로 자라는데, 창은 그대로이므로 `resize` 가 오지
  // 않아 판이 아랫줄을 12px 덮었다. 막대 자신의 크기를 본다.
  useLayoutEffect(() => {
    const bar = shelf.current?.parentElement;
    if (!bar) return;
    const measure = () => {
      const bottom = Math.round(bar.getBoundingClientRect().bottom);
      if (bottom > 0) setBarBottom(bottom);
    };
    measure();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    observer?.observe(bar);
    window.addEventListener("resize", measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [open, rows.length]);

  // Esc 는 어느 문서에서 눌러도 듣는다 — 눈은 액자 안 화면을 보고 있으므로 초점도 대개 액자 안에 있다.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(null);
    };
    const inner = doc?.defaultView ?? null;
    window.addEventListener("keydown", onKey);
    if (inner && inner !== window) inner.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (inner && inner !== window) inner.removeEventListener("keydown", onKey);
    };
  }, [doc]);

  return (
    <>
      {open === "components" && doc?.body
        ? createPortal(
            <div {...{ [OWN]: "" }} data-inspector-overlay="" aria-hidden="true" className="pointer-events-none fixed inset-0 z-[55]">
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
            </div>,
            doc.body,
          )
        : null}

      <div {...{ [OWN]: "" }} ref={shelf} className="flex shrink-0 items-center gap-1">
        {where?.prompt ? (
          <button
            type="button"
            aria-pressed={open === "request"}
            onClick={() => setOpen(open === "request" ? null : "request")}
            className={`whitespace-nowrap rounded-full px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-focus-ring ${open === "request" ? "bg-oe-background-bold-primary text-oe-foreground-inverse" : "text-oe-foreground-secondary hover:bg-oe-interaction-hover"}`}
          >
            요청 보기
          </button>
        ) : null}
        <button
          type="button"
          aria-pressed={open === "components"}
          onClick={() => setOpen(open === "components" ? null : "components")}
          className={`whitespace-nowrap rounded-full px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-focus-ring ${open === "components" ? "bg-oe-background-bold-primary text-oe-foreground-inverse" : "text-oe-foreground-secondary hover:bg-oe-interaction-hover"}`}
        >
          컴포넌트 보기 <span className={open === "components" ? "" : "text-oe-foreground-tertiary"}>{rows.length}</span>
        </button>
        <span aria-hidden="true" className="mx-1 h-4 w-px bg-oe-border-secondary" />
      </div>

      {/*
        목록·요청 판은 액자 **밖** 문서에 뜨지만 막대 안에 두지 않는다 — `tools` 자리가 `role="toolbar"` 라
        판을 그 안에 두면 `nav` 와 링크 8개가 도구 모음의 자손이 되어 낭독기가 도구 모음 안에서 읽었다
        (`2026-09-29` 개발자). 그래서 `document.body` 로 내보낸다. `open` 은 누름으로만 참이 되므로 서버
        그림에서는 이 갈래를 타지 않고, `document` 를 서버에서 읽지 않는다.
      */}
      {open
        ? createPortal(
          <aside
            {...{ [OWN]: "" }}
            aria-label={open === "components" ? "쓴 컴포넌트" : "요청"}
            style={{ top: barBottom + 8 }}
            className="fixed right-4 bottom-4 z-[60] flex w-[min(18rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl border border-oe-border-secondary bg-oe-background-primary shadow-lg"
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
          </aside>,
          document.body,
        )
        : null}
    </>
  );
}
