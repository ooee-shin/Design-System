import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * `/screens/*` 전용 부품이다. 이 아래의 화면은 제품 화면 자체를 구현하는 자리이므로 Studio 의
 * 문서형 레이아웃(`max-w-6xl` 프레임과 공통 여백)을 따르지 않는다. 규칙의 범위는
 * `docs/system/studio.md` 가 소유한다.
 */

// 웹에서 앱에 접근하면 모바일 뷰가 화면 가운데에 선다. 기기 모형이 아니라 실제 페이지이므로
// 둥근 모서리나 그림자로 상자를 만들지 않고, 높이도 고정하지 않고 창 높이를 그대로 쓴다.
//
// 좌우에 남는 자리는 지금 비워 둔다. 넓은 화면에서 그 자리를 무엇으로 채울지는 정하지 않았고,
// 가능성만 열어 둔 상태에서 임의로 채우면 그것이 결정처럼 굳는다.
//
// 아래로는 280px 에서 멈춘다. 그보다 좁아지면 화면을 다시 짜지 않고 가로로 스크롤한다. 앱이
// 대응하는 가장 좁은 폭이며 `quality.md` 의 「반응형과 테마」가 소유한다.
const MOBILE_WIDTH = "min-w-[280px] max-w-[570px]";

/**
 * 웹에서 보는 앱 화면의 본체다. STO 와 SV 가 함께 쓰며, 화면마다 폭을 따로 적으면 한쪽만 고쳤을 때
 * 두 화면의 기준이 갈린다.
 *
 * 세로 구조는 컴포넌트가 스스로 잡는다. `AppHeader` 는 `sticky top-0`, `BottomNavigation` 은
 * `sticky bottom-0` 이므로, 본문을 `flex-1` 로 두면 내용이 짧을 때는 아래 줄이 창 바닥에 서고
 * 길어지면 스크롤하는 동안 두 줄이 제자리에 머문다.
 */
export function MobileWebView({ children, label }: { children: ReactNode; label: string }) {
  return (
    // 모바일 뷰 바깥의 바닥이다. `oe-background-secondary`(neutral-100)보다 한 단계 연한 회색을
    // 쓰기로 했는데 그 자리에 놓인 배경 token 이 없다. Light 는 흰 본문과 겨우 갈리는 neutral-50,
    // Dark 는 본문인 neutral-900 보다 한 단계 어두운 neutral-950 으로 프리미티브를 직접 쓴다.
    <div className="min-h-dvh bg-neutral-50 dark:bg-neutral-950">
      <div
        aria-label={label}
        className={cn(
          "mx-auto flex min-h-dvh w-full flex-col bg-oe-background-primary",
          // 넓은 화면에서 좌우 바닥과 본문이 만나는 자리를 한 줄로만 구분한다. 테두리를 네 면에
          // 두르면 페이지가 아니라 얹힌 상자로 읽힌다.
          "border-oe-border-secondary sm:border-x",
          MOBILE_WIDTH,
        )}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * 아직 무엇을 놓을지 정하지 않은 본문을 덩이로만 보여 준다. 헤더나 하단 줄처럼 확정된 부분을
 * 검수할 때, 점선과 글자가 함께 서면 시선이 그쪽으로 끌려 정작 볼 것을 보지 못한다. 자리를
 * 차지하되 읽을 것이 없는 옅은 면으로 둔다.
 */
export function ScreenSkeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("rounded-lg bg-oe-background-secondary", className)} />;
}

/**
 * 아직 화면을 채우지 않은 자리를 드러낸다. 빈 채로 두면 레이아웃이 무너진 것인지 아직 만들지
 * 않은 것인지 구분되지 않는다.
 */
export function ScreenPlaceholder({ name, className }: { name: string; className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-lg border border-dashed border-oe-border-primary text-[11px] text-oe-foreground-tertiary",
        className,
      )}
    >
      {name}
    </div>
  );
}
