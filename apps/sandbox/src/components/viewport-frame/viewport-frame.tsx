"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

import { SANDBOX_VIEWPORTS, sandboxScreens, type SandboxViewport } from "@/screens";

/** 액자 안에서 열린 화면인지. 액자 안에서는 전환 막대를 다시 그리지 않는다. */
export const FRAME_PARAM = "frame";

/** 「WxH」 → 픽셀. `SANDBOX_VIEWPORTS.inspect` 가 이 꼴이다. */
export function frameSize(inspect: string): { width: number; height: number } {
  const [width, height] = inspect.split("x").map(Number);
  return { width, height };
}

/**
 * 화면 위의 「보기 폭」 전환이다(2026-09-23 개발자). 한 요청이 웹·태블릿·모바일을 함께 고를 수 있으므로,
 * 같은 화면을 세 폭으로 바꿔 본다. 세 폭 모두 그 크기의 액자(iframe)에 같은 주소를 `?frame=1` 로 다시 연다 —
 * 화면의 `sm:`·`md:` 같은 폭 조건이 액자의 폭을 보고 서야 하기 때문이다.
 *
 * **웹도 액자에 넣는다**(`2026-09-28`). 전에는 웹만 막대 아래에 화면을 그대로 두었는데, 막대가 41px 자리를
 * 차지하는 만큼 `min-h-dvh` 화면이 창 밖으로 밀려 늘 41px 이 잘렸고, 화면 자신의 상단 고정 헤더는 막대
 * 뒤로 들어갔다. 액자 안에서는 액자 높이가 곧 창 높이라 `dvh` 가 맞고 고정 헤더도 액자에 붙는다. 화면은
 * 제품 저장소로 옮길 코드라 화면 쪽에 막대 높이를 보정하지 않는다 — 그쪽에는 이 막대가 없다.
 *
 * 첫 화면(`/`)과 액자 안에서는 그리지 않는다. 화면 코드는 이것이 있는 줄 모른다.
 */
export function ViewportFrame({ children, pathname: given }: { children: ReactNode; pathname?: string }) {
  // 라우터 밖(시험)에서는 usePathname 이 null 이라 주소를 직접 받는다.
  const routed = usePathname();
  const pathname = given ?? routed;
  const [device, setDevice] = useState<SandboxViewport>("web");
  const [inFrame, setInFrame] = useState(false);
  // 액자는 첫 그림 뒤에만 건다. 서버 그림에 걸면 액자 안의 첫 그림이 또 액자를 걸어 잠깐 겹쳐 열린다.
  const [mounted, setMounted] = useState(false);

  // 정적 내보내기라 useSearchParams 대신 창의 주소를 읽는다. 첫 그림 뒤에 읽어야 서버와 같은 첫 그림이 된다.
  useEffect(() => {
    setInFrame(new URLSearchParams(window.location.search).has(FRAME_PARAM));
    setDevice("web");
    setMounted(true);
  }, [pathname]);

  if (!pathname || pathname === "/" || inFrame) return <>{children}</>;

  const screen = sandboxScreens.find((item) => item.href === pathname);
  const requested = new Set<SandboxViewport>(screen?.viewports ?? []);
  const chosen = SANDBOX_VIEWPORTS.find((item) => item.id === device) ?? SANDBOX_VIEWPORTS[0];
  const size = frameSize(chosen.inspect);

  return (
    <div className="flex h-dvh flex-col">
      <div
        role="toolbar"
        aria-label="보기 폭"
        className="flex shrink-0 items-center gap-2 border-b border-oe-border-secondary bg-oe-background-primary px-4 py-1.5 text-sm"
      >
        <span className="text-xs text-oe-foreground-tertiary">보기 폭</span>
        {SANDBOX_VIEWPORTS.map((item) => {
          const active = item.id === device;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={active}
              onClick={() => setDevice(item.id)}
              className={`rounded-full px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-focus-ring ${active ? "bg-oe-background-bold-primary text-oe-foreground-inverse" : "text-oe-foreground-secondary hover:bg-oe-interaction-hover"}`}
            >
              {item.name}
              {requested.has(item.id) ? <span aria-label="요청한 폭" className="ml-1 text-oe-brand-foreground-primary">•</span> : null}
              {item.id !== "web" ? <span className={`ml-1 text-xs ${active ? "" : "text-oe-foreground-tertiary"}`}>{item.inspect}</span> : null}
            </button>
          );
        })}
        {requested.size ? <span className="ml-auto text-xs text-oe-foreground-tertiary">• 표시는 요청이 고른 폭</span> : null}
      </div>
      {!mounted ? (
        <div className="min-h-0 flex-1" />
      ) : device === "web" ? (
        <iframe
          data-sandbox-frame=""
          title={`${screen?.name ?? pathname} — ${chosen.name}`}
          src={`${pathname}?${FRAME_PARAM}=1`}
          className="min-h-0 w-full flex-1 border-0 bg-oe-background-primary"
        />
      ) : (
        <div className="flex min-h-0 flex-1 justify-center overflow-auto bg-oe-background-secondary px-4 py-6">
          <iframe
            data-sandbox-frame=""
            title={`${screen?.name ?? pathname} — ${chosen.name} ${chosen.inspect}`}
            src={`${pathname}?${FRAME_PARAM}=1`}
            width={size.width}
            height={size.height}
            className="h-fit max-w-full rounded-lg border border-oe-border-secondary bg-oe-background-primary shadow-lg"
          />
        </div>
      )}
    </div>
  );
}
