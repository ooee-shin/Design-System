import Link from "next/link";
import type { ReactNode } from "react";

import { RiArrowLeftLine } from "@remixicon/react";

import { cn } from "@/lib/utils";

/**
 * `/screens/*` 전용 부품이다. 이 아래의 화면은 제품 화면 자체를 구현하는 자리이므로 Studio 의
 * 문서형 레이아웃(`max-w-6xl` 프레임과 공통 여백)을 따르지 않는다. 규칙의 범위는
 * `docs/system/studio.md` 가 소유한다.
 */

/**
 * Studio 내비게이션은 이 아래에서 그려지지 않는다. 상단에 바가 얹히면 관리자 화면이 실제로
 * 차지하는 높이를 볼 수 없기 때문이다. 대신 돌아가는 길을 화면이 스스로 갖는다.
 */
export function ScreenExitLink({ className }: { className?: string }) {
  return (
    <Link
      href="/screens"
      className={cn(
        // 왼쪽 아래는 Next.js 개발 표시가 쓰는 자리라 겹친다.
        "fixed right-3 bottom-3 z-[60] inline-flex items-center gap-1.5 rounded-full border border-oe-border-primary bg-oe-background-primary/90 px-3 py-1.5 text-[11px] font-medium text-oe-foreground-secondary backdrop-blur",
        "hover:text-oe-foreground-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-focus-ring",
        className,
      )}
    >
      <RiArrowLeftLine className="size-oe-icon-xsmall" aria-hidden="true" />
      Studio
    </Link>
  );
}

// 375px 은 지금 국내에서 가장 좁은 축에 드는 실제 기기 폭이다. 여기서 들어가면 더 넓은
// 기기에서도 들어간다. 높이를 함께 고정하는 것이 핵심이다. 앱 레이아웃은 위가 고정되고 아래가
// 붙고 가운데만 스크롤되는 구조라, 잘린 높이 안에 두지 않으면 그 동작이 드러나지 않는다.
const PHONE_WIDTH = 375;
const PHONE_HEIGHT = 812;

/**
 * 웹에서 앱 화면을 볼 때 쓰는 기기 상자다. STO 와 SV 가 함께 쓰며, 화면마다 폭을 따로 적으면
 * 한쪽만 고쳤을 때 두 화면의 기준이 갈린다.
 */
export function PhoneFrame({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-oe-background-canvas-secondary p-6">
      <div
        aria-label={label}
        style={{ width: PHONE_WIDTH, height: PHONE_HEIGHT }}
        // 실제 기기에는 세로 스크롤바가 화면에 남지 않는다. 보이면 그만큼 본문 폭이 줄어
        // 글자가 잘리는 지점이 실제와 달라진다.
        className="relative flex shrink-0 flex-col overflow-hidden rounded-[28px] border border-oe-border-primary bg-oe-background-primary shadow-xl [&_*]:[scrollbar-width:none] [&_*::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
    </div>
  );
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
