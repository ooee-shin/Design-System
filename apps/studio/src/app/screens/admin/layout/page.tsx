// 접힘 상태를 읽어 표시에 반영하므로 이 화면은 클라이언트에서 그린다.
"use client";

/**
 * 관리자 레이아웃.
 *
 * shadcn 의 sidebar-02 블록을 그대로 들여온 것이며 `pipeline.md` 의 2단계에 멈춰 있다. 색은 아직
 * shadcn token 이고 메뉴 내용도 원본의 영문 그대로다. 구조와 동작을 먼저 보기 위한 상태이므로,
 * 지시가 있기 전까지 `oe` token 으로 바꾸지 않는다. 출처는 `sources.md` 가 갖는다.
 */

import Image from "next/image"

import { RiSideBarLine } from "@remixicon/react"

import { ToggleButton } from "@ooee/ui"

import { AppSidebar } from "@/components/candidates/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  useSidebar,
} from "@/components/candidates/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/candidates/tooltip"

// 메인 로고는 사용자가 테마 설정에서 등록하는 값이다. 아직 그 설정과 잇지 않았으므로 기본값을
// 둔다. 원본은 2120×399 이며 헤더 안에서 높이 28px 로 서고 폭은 비율대로 149px 이 된다. 헤더가
// 56px 이므로 위아래로 14px 씩 남는다.
const MAIN_LOGO = { src: "/images/main-logo-sample.png", width: 149, height: 28 };

// 로고의 대체 텍스트는 환경설정이 소유하는 시스템명이다. 실제 값이 붙기 전까지 어디서 오는
// 값인지 그대로 적는다. 관리자 로그인 화면과 같은 처리다.
const SYSTEM_NAME = "{환경설정 시스템명}";

export default function Page() {
  return (
    // 헤더가 위에서 전체 너비를 차지하고, 그 아래를 사이드 내비게이션과 본문이 나눈다. 원본은
    // 사이드가 화면 높이를 전부 쓰고 헤더가 그 오른쪽에만 서는 구조였다.
    //
    // 헤더의 여닫기 버튼이 사이드 내비게이션의 상태를 읽으므로 provider 가 헤더까지 감싼다.
    // 툴팁은 열림과 닫힘을 한 곳에서 관리해야 하므로 Provider 가 화면을 감싼다.
    <TooltipProvider>
      <SidebarProvider className="flex-col">
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
          {/* 헤더의 가장 왼쪽은 로고 자리이고, 누르면 첫 화면으로 돌아간다. 그 화면은 아직 만들지
              않았으므로 블록이 쓰는 것과 같은 자리 표시 링크를 둔다. 링크의 이름은 이미지의 대체
              텍스트가 갖는다. */}
          <a href="#" className="mr-2 shrink-0 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Image
              src={MAIN_LOGO.src}
              width={MAIN_LOGO.width}
              height={MAIN_LOGO.height}
              alt={SYSTEM_NAME}
              priority
              className="h-7 w-auto"
            />
          </a>
          <SidebarToggle />
        </header>

        {/* 사이드 내비게이션은 고정 배치라 자기 자리를 직접 적어야 한다. 헤더 높이 56px 아래에서
            시작해 창 바닥까지 선다. */}
        <div className="flex w-full min-h-0 flex-1">
          <AppSidebar className="top-14 bottom-0 h-auto" />
          <SidebarInset className="min-h-0">
            <div className="flex flex-1 flex-col gap-4 p-4">
              {Array.from({ length: 24 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-video h-12 w-full rounded-lg bg-muted/50"
                />
              ))}
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  )
}

/**
 * 사이드 내비게이션을 접고 펴는 버튼이다. 접힌 동안에는 켜진 모습으로 서서, 지금 내비게이션이
 * 숨어 있다는 것을 버튼 자신이 말한다. 블록이 준 `SidebarTrigger` 는 누르는 동작만 갖고 상태를
 * 드러내지 않으므로 공용 `ToggleButton` 으로 바꿨다.
 *
 * 아이콘만 있는 버튼이라 무엇을 하는 버튼인지 글자로 확인할 자리가 없다. 그래서 가리키면 툴팁이
 * 그 자리를 대신한다. 툴팁의 문구와 접근 가능한 이름은 같은 말을 쓴다. 다르게 두면 보는 사람과
 * 낭독기로 듣는 사람이 서로 다른 말을 만난다.
 */
function SidebarToggle() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const label = collapsed ? "좌측 메뉴 열기" : "좌측 메뉴 닫기";

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <ToggleButton
            variant="tonal"
            controlSize="xsmall"
            icon={<RiSideBarLine className="size-oe-icon-small" aria-hidden="true" />}
            pressed={collapsed}
            onPressedChange={toggleSidebar}
            aria-label={label}
          />
        }
      />
      <TooltipContent side="bottom" align="center">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}
