"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

import { SANDBOX_VIEWPORTS, sandboxScreens, type SandboxViewport } from "@/screens";

/** 액자 안에서 열린 화면인지. 액자 안에서는 전환 막대를 다시 그리지 않는다. */
export const FRAME_PARAM = "frame";

/**
 * 지금 창이 액자 안인지. **창이 최상위가 아니면 액자 안으로 본다** — 주소의 `?frame=1` 만 보던 때는 액자 안에서
 * 화면끼리 링크로 옮기면 그 표식이 빠져, 액자 안 문서가 자기 막대와 **중첩 액자**를 또 세웠다. 그러면 맨 위
 * 막대가 세는 액자 안 문서는 화면이 아니라 두 번째 막대라 「컴포넌트 보기 0」 이 됐다(`2026-09-29` 개발자,
 * #124 가 「남은 것」 으로 적어 둔 자리다).
 *
 * **고친 것은 중첩 액자와 그 0 개까지다.** 액자 안에서 화면을 옮기면 숫자와 테두리는 새 문서를 따라가지만
 * 판의 경로·요청 보기·액자 title 은 옮기기 전 화면으로 남는다 — 막대는 액자 밖에 있어 `usePathname` 으로
 * 바깥 주소를 읽고, 액자 안 이동은 바깥 주소를 바꾸지 않기 때문이다. 고치려면 액자 안 문서의
 * `location.pathname` 을 `load` 때 끌어올려 막대에 넘겨야 한다.
 *
 * `?frame=1` 은 그대로 함께 본다 — 러너의 검사(`/make-screens` 4단계)와 사람이 `?frame=1` 을 **최상위 창**으로
 * 직접 여는 길이 계속 막대 없이 화면만 보여야 하기 때문이다(그 창은 `self === top` 이라 주소만이 근거다).
 * 다른 출처 상위 창은 `window.top` 을 읽다 막히는데, 막히는 것 자체가 액자 안이라는 뜻이다.
 *
 * 볼 창을 인수로 받는다 — JSDOM 의 `window.top` 은 다시 정의할 수 없어(`configurable: false`) 흉내 창 없이는
 * 「최상위가 아님」 갈래를 시험할 길이 없다. 부품은 인수 없이 부르고 진짜 창을 본다.
 */
export function inFrameNow(view: { self: unknown; top: unknown; location: { search: string } } = window): boolean {
  try {
    if (view.self !== view.top) return true;
  } catch {
    return true;
  }
  return new URLSearchParams(view.location.search).has(FRAME_PARAM);
}

/** 고정 폭 액자 좌우 여백(`px-4` 양쪽, px). 창의 안쪽 폭이 「액자 폭 + 이 값」 보다 커야 고정 폭 액자를 둔다. */
export const FRAME_GUTTER = 32;

/**
 * 맨 위 막대(`role="toolbar"`)의 이름이다. 도구 단추(요청 보기·컴포넌트 보기)와 폭 단추를 함께 담으므로
 * 담은 것을 다 덮는 이름을 쓴다 — 전에는 「보기 폭」 이라 낭독기가 폭과 상관없는 단추 둘까지 「보기 폭」
 * 도구 모음 안에서 읽었다(`2026-09-29` 확인자). 「보기 폭」 은 폭 단추 앞에 눈에 보이는 글로 남는다.
 *
 * 이름이 「보기 폭」 에서 바뀐 것은 **개발자가 받아들였다**(`2026-09-29`) — 낭독기가 읽는 이름만 넓히고 눈에
 * 보이는 글은 그대로이므로, 문서에 막대 이름이 적힌 자리도 이 이름으로 맞춘다.
 */
export const TOOLBAR_LABEL = "화면 도구";

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
 * **`tools` 는 막대의 맨 왼쪽 자리다**(`2026-09-29` 개발자). 「요청 보기 · 컴포넌트 보기」 단추가 화면
 * 아래 알약 막대로 떠서 화면을 가렸으므로 이 막대 안으로 들였다. 막대의 순서는 「도구 · 보기 폭 · 폭
 * 단추들 … • 표시는 요청이 고른 폭」 이다. 액자 안과 첫 화면에서는 막대째 그리지 않으니
 * 도구도 서지 않는다 — 액자 안 문서는 화면만 갖는다. 열린 판은 막대 안이 아니라 액자 밖 `document.body` 에
 * 뜬다(`ComponentInspector` 가 portal 로 보낸다) — 판이 이 막대의 자손이면 `role="toolbar"` 가 판의 글까지 담는다.
 *
 * **액자 안인지는 `inFrameNow` 가 정한다**(`2026-09-29` 개발자). 주소의 `?frame=1` 만 보던 때는 액자 안에서
 * 화면끼리 링크로 옮기면 표식이 빠져 액자 안에 막대와 **중첩 액자**가 또 섰다.
 *
 * 도구가 들어온 뒤로 막대의 이름은 「화면 도구」 다(`TOOLBAR_LABEL`) — 폭과 상관없는 단추 둘을 「보기 폭」
 * 이라는 이름의 도구 모음에 담아 두었더니 낭독기가 그 둘도 폭 단추처럼 읽었다(`2026-09-29` 확인자).
 * 폭 단추만 `role="group"` 으로 따로 묶는 길도 재어 보았으나, 그 껍데기가 통째로 줄을 넘어가 390px
 * 창에서 막대가 73px → 93px 로 자라고 액자가 20px 줄었다 — 이름 하나로 덮고 껍데기는 두지 않는다.
 *
 * 첫 화면(`/`)과 액자 안에서는 그리지 않는다. 화면 코드는 이것이 있는 줄 모른다.
 */
export function ViewportFrame({ children, tools, pathname: given }: { children: ReactNode; tools?: ReactNode; pathname?: string }) {
  // 라우터 밖(시험)에서는 usePathname 이 null 이라 주소를 직접 받는다.
  const routed = usePathname();
  const pathname = given ?? routed;
  const [device, setDevice] = useState<SandboxViewport>(() => defaultViewport(pathname));
  const [inFrame, setInFrame] = useState(false);
  // 액자는 첫 그림 뒤에만 건다. 서버 그림에 걸면 액자 안의 첫 그림이 또 액자를 걸어 잠깐 겹쳐 열린다.
  const [mounted, setMounted] = useState(false);
  // 창의 안쪽 폭. 고정 폭 액자(`size.width`)와 좌우 여백이 들어가지 않으면 전체 폭 액자를 쓴다. 첫 그림 뒤에 잰다.
  const [windowWidth, setWindowWidth] = useState<number | null>(null);

  // 액자 안인지는 `inFrameNow` 가 정한다(창이 최상위가 아니거나 주소에 `?frame=1`). 정적 내보내기라
  // useSearchParams 를 쓰지 않고 창을 직접 읽으며, 첫 그림 뒤에 읽어야 서버와 같은 첫 그림이 된다.
  // 화면을 옮기면 폭도 그 화면의 기본 폭으로 다시 선다.
  useEffect(() => {
    setInFrame(inFrameNow());
    setDevice(defaultViewport(pathname));
    setMounted(true);
  }, [pathname]);

  useEffect(() => {
    const measure = () => setWindowWidth(window.innerWidth);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // 액자 안과 첫 화면은 화면만 갖는다 — `tools` 도 버린다. 액자 안에 막대나 단추가 또 서면 이중으로 보인다.
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
      {/* 좁은 창에서는 줄을 바꾼다. 도구 단추가 들어온 뒤로 한 줄에 다 들어가지 않는데, 줄을 바꾸지 않으면
          flex 가 글자를 눌러 막대가 세로로 300px 까지 자라고 그만큼 액자가 줄었다(2026-09-29 에 재었다).
          그래서 단추마다 `shrink-0`, 오른쪽 끝 글은 `truncate` 다 — 눌리는 대신 줄을 바꾸거나 줄임표로 끝난다. */}
      <div
        role="toolbar"
        aria-label={TOOLBAR_LABEL}
        className="flex shrink-0 flex-wrap items-center gap-x-2 gap-y-1 border-b border-oe-border-secondary bg-oe-background-primary px-4 py-1.5 text-sm"
      >
        {/* 도구 단추(요청 보기·컴포넌트 보기)가 막대의 맨 왼쪽에 선다. 액자 안에서는 이 막대가 없으니 도구도 없다. */}
        {tools}
        <span className="shrink-0 text-xs text-oe-foreground-tertiary">보기 폭</span>
        {/* 폭 단추는 막대의 바로 밑 자식으로 둔다 — 껍데기(`role="group"`)로 묶어 보았더니 그 껍데기가 통째로
            줄을 넘어가 390px 창에서 막대가 73px → 93px 로 자랐고 액자가 그만큼 줄었다(2026-09-29 에 재었다). */}
        {SANDBOX_VIEWPORTS.map((item) => {
          const active = item.id === device;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={active}
              onClick={() => setDevice(item.id)}
              className={`shrink-0 rounded-full px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-focus-ring ${active ? "bg-oe-background-bold-primary text-oe-foreground-inverse" : "text-oe-foreground-secondary hover:bg-oe-interaction-hover"}`}
            >
              {item.name}
              {requested.has(item.id) ? <span aria-label="요청한 폭" className="ml-1 text-oe-brand-foreground-primary">•</span> : null}
              {/* 검사 뷰포트 값은 좁은 창에서 접는다(`sm:` 아래). 폭이 모자랄 때 먼저 줄일 곳이고, 값은 두
                  갈래의 액자 title 에 다 남아 있다 — 고른 폭이 웹이 아닌 동안 좁은 창은 `narrow` 갈래로 가므로
                  그 title 에도 넣었다(`2026-09-29` 개발자). 웹에는 보일 검사 뷰포트 값이 애초에 없다. 전에는 `narrow` title 이 「… — 태블릿 (창 폭)」 이라, 값을 접은
                  바로 그 창에서 어느 폭으로 보는지 알 자리가 아예 없었다. */}
              {item.id !== "web" ? <span className={`ml-1 hidden text-xs sm:inline ${active ? "" : "text-oe-foreground-tertiary"}`}>{item.inspect}</span> : null}
            </button>
          );
        })}
        {narrow ? (
          <span className="ml-auto truncate text-xs text-oe-foreground-tertiary">창이 {chosen.name} 액자보다 좁아 창 폭으로 보인다</span>
        ) : requested.size ? (
          <span className="ml-auto truncate text-xs text-oe-foreground-tertiary">• 표시는 요청이 고른 폭</span>
        ) : null}
      </div>
      {!mounted ? (
        <div className="min-h-0 flex-1" />
      ) : !wantsFixed || narrow ? (
        <iframe
          data-sandbox-frame=""
          title={narrow ? `${name} — ${chosen.name} ${chosen.inspect} (창 폭)` : `${name} — ${chosen.name}`}
          src={src}
          className="min-h-0 w-full flex-1 border-0 bg-oe-background-primary"
        />
      ) : (
        <div className="flex min-h-0 flex-1 justify-center overflow-auto bg-oe-background-secondary px-4 py-6">
          {/* 높이를 정하는 class 를 붙이지 않는다. `h-fit`(`height: fit-content`) 은 iframe 같은 대체 요소에서 `height`
              속성을 덮어쓰고 기본 내재 높이 150px 으로 내려앉아 화면이 그만큼만 보였다(2026-09-28). 높이는 `height`
              속성이 갖고, 담는 칸이 넘치면 `overflow-auto` 로 스크롤한다. */}
          <iframe
            data-sandbox-frame=""
            title={`${name} — ${chosen.name} ${chosen.inspect}`}
            src={src}
            width={size.width}
            height={size.height}
            className="max-w-full rounded-lg border border-oe-border-secondary bg-oe-background-primary shadow-lg"
          />
        </div>
      )}
    </div>
  );
}
