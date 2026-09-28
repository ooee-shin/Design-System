"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

import { SANDBOX_VIEWPORTS, sandboxScreens, type SandboxViewport } from "@/screens";

/** 액자 안에서 열린 화면인지. 액자 안에서는 전환 막대를 다시 그리지 않는다. */
export const FRAME_PARAM = "frame";

/** 고정 폭 액자 좌우 여백(`px-4` 양쪽, px). 창의 안쪽 폭이 「액자 폭 + 이 값」 보다 커야 고정 폭 액자를 둔다. */
export const FRAME_GUTTER = 32;

/** 「WxH」 → 픽셀. `SANDBOX_VIEWPORTS.inspect` 가 이 꼴이다. */
export function frameSize(inspect: string): { width: number; height: number } {
  const [width, height] = inspect.split("x").map(Number);
  return { width, height };
}

/**
 * 화면이 처음 서는 폭 — 요청이 고른 폭(`viewports`) 가운데 웹·태블릿·모바일 순으로 가장 넓은 것이다.
 * 모바일만 고른 화면은 모바일 액자로 열리고, 웹을 함께 고른 화면은 웹으로 열린다. 목록에 없는 주소는 웹.
 * (2026-09-28 개발자 — 전에는 늘 웹으로 열려 모바일만 고른 화면이 넓은 폭으로 먼저 보였다.)
 */
export function defaultViewport(pathname: string | null): SandboxViewport {
  const screen = sandboxScreens.find((item) => item.href === pathname);
  const requested = new Set<SandboxViewport>(screen?.viewports ?? []);
  return SANDBOX_VIEWPORTS.find((item) => requested.has(item.id))?.id ?? "web";
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
 * **처음 서는 폭은 `defaultViewport` 가 정하고**, 화면을 옮기면 그 화면의 것으로 다시 선다(`2026-09-28` 개발자).
 * 액자는 첫 그림 뒤에만 걸므로 첫 그림부터 그 단추가 눌려 있어도 서버와 클라이언트의 첫 그림은 같다.
 *
 * **창이 고정 폭 액자보다 좁으면 웹과 같은 전체 폭 액자를 쓴다**(`2026-09-28` 개발자). 실제 폰(과 좁게 줄인 창)으로
 * 볼 때는 창이 액자 폭이거나 그보다 좁다 — 그 안에 고정 폭 액자를 세우면 화면이 더 좁아지고 옆으로 넘친다.
 * 창의 안쪽 폭이 「액자 폭 + 32px」 보다 넓지 않으면 액자를 창 폭으로 채우고 막대에 까닭을 한 줄 보인다.
 * 창 크기가 바뀌면(`resize`) 다시 잰다. 러너의 검사는 이 막대를 거치지 않고 액자 안 문서를 `?frame=1` 로 직접
 * 연다(예전에는 390×844·1024×768 창으로 막대째 열었다).
 *
 * 첫 화면(`/`)과 액자 안에서는 그리지 않는다. 화면 코드는 이것이 있는 줄 모른다.
 */
export function ViewportFrame({ children, pathname: given }: { children: ReactNode; pathname?: string }) {
  // 라우터 밖(시험)에서는 usePathname 이 null 이라 주소를 직접 받는다.
  const routed = usePathname();
  const pathname = given ?? routed;
  const [device, setDevice] = useState<SandboxViewport>(() => defaultViewport(pathname));
  const [inFrame, setInFrame] = useState(false);
  // 액자는 첫 그림 뒤에만 건다. 서버 그림에 걸면 액자 안의 첫 그림이 또 액자를 걸어 잠깐 겹쳐 열린다.
  const [mounted, setMounted] = useState(false);
  // 창의 안쪽 폭. 고정 폭 액자(`size.width`)와 좌우 여백이 들어가지 않으면 전체 폭 액자를 쓴다. 첫 그림 뒤에 잰다.
  const [windowWidth, setWindowWidth] = useState<number | null>(null);

  // 정적 내보내기라 useSearchParams 대신 창의 주소를 읽는다. 첫 그림 뒤에 읽어야 서버와 같은 첫 그림이 된다.
  // 화면을 옮기면 폭도 그 화면의 기본 폭으로 다시 선다.
  useEffect(() => {
    setInFrame(new URLSearchParams(window.location.search).has(FRAME_PARAM));
    setDevice(defaultViewport(pathname));
    setMounted(true);
  }, [pathname]);

  useEffect(() => {
    const measure = () => setWindowWidth(window.innerWidth);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  if (!pathname || pathname === "/" || inFrame) return <>{children}</>;

  const screen = sandboxScreens.find((item) => item.href === pathname);
  const requested = new Set<SandboxViewport>(screen?.viewports ?? []);
  const chosen = SANDBOX_VIEWPORTS.find((item) => item.id === device) ?? SANDBOX_VIEWPORTS[0];
  const size = frameSize(chosen.inspect);
  const src = `${pathname}?${FRAME_PARAM}=1`;
  const name = screen?.name ?? pathname;
  // 고정 폭 액자를 두려는 폭(태블릿·모바일)인데 창이 그보다 좁으면 창 폭으로 보인다.
  const wantsFixed = device !== "web";
  const fixedFits = windowWidth === null || windowWidth > size.width + FRAME_GUTTER;
  const narrow = wantsFixed && !fixedFits;

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
        {narrow ? (
          <span className="ml-auto text-xs text-oe-foreground-tertiary">창이 {chosen.name} 액자보다 좁아 창 폭으로 보인다</span>
        ) : requested.size ? (
          <span className="ml-auto text-xs text-oe-foreground-tertiary">• 표시는 요청이 고른 폭</span>
        ) : null}
      </div>
      {!mounted ? (
        <div className="min-h-0 flex-1" />
      ) : !wantsFixed || narrow ? (
        <iframe
          data-sandbox-frame=""
          title={narrow ? `${name} — ${chosen.name} (창 폭)` : `${name} — ${chosen.name}`}
          src={src}
          className="min-h-0 w-full flex-1 border-0 bg-oe-background-primary"
        />
      ) : (
        <div className="flex min-h-0 flex-1 justify-center overflow-auto bg-oe-background-secondary px-4 py-6">
          <iframe
            data-sandbox-frame=""
            title={`${name} — ${chosen.name} ${chosen.inspect}`}
            src={src}
            width={size.width}
            height={size.height}
            className="h-fit max-w-full rounded-lg border border-oe-border-secondary bg-oe-background-primary shadow-lg"
          />
        </div>
      )}
    </div>
  );
}
