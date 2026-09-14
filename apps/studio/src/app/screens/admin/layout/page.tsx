/**
 * 관리자 레이아웃.
 *
 * shadcn 의 sidebar-02 블록을 그대로 들여온 것이며 `pipeline.md` 의 2단계에 멈춰 있다. 색은 아직
 * shadcn token 이고 메뉴 내용도 원본의 영문 그대로다. 구조와 동작을 먼저 보기 위한 상태이므로,
 * 지시가 있기 전까지 `oe` token 으로 바꾸지 않는다. 출처는 `sources.md` 가 갖는다.
 */

import Image from "next/image"

import { AppSidebar } from "@/components/candidates/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/candidates/breadcrumb"
import { Separator } from "@/components/candidates/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/candidates/sidebar"

// 메인 로고는 사용자가 테마 설정에서 등록하는 값이다. 아직 그 설정과 잇지 않았으므로 기본값을
// 둔다. 원본은 2120×399 이며 헤더 안에서 높이 24px 로 서고 폭은 비율대로 128px 이 된다.
const MAIN_LOGO = { src: "/images/main-logo-sample.png", width: 128, height: 24 };

export default function Page() {
  return (
    // 헤더가 위에서 전체 너비를 차지하고, 그 아래를 사이드 내비게이션과 본문이 나눈다. 원본은
    // 사이드가 화면 높이를 전부 쓰고 헤더가 그 오른쪽에만 서는 구조였다.
    //
    // 헤더의 여닫기 버튼이 사이드 내비게이션의 상태를 읽으므로 provider 가 헤더까지 감싼다.
    <SidebarProvider className="flex-col">
      <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
        {/* 헤더의 가장 왼쪽은 로고 자리다. */}
        <Image
          src={MAIN_LOGO.src}
          width={MAIN_LOGO.width}
          height={MAIN_LOGO.height}
          alt=""
          priority
          className="mr-2 h-6 w-auto shrink-0"
        />
        <SidebarTrigger />
        <Separator
          orientation="vertical"
          className="mr-2 data-vertical:h-4 data-vertical:self-auto"
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="#">Build Your Application</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>Data Fetching</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      {/* 사이드 내비게이션은 고정 배치라 자기 자리를 직접 적어야 한다. 헤더 높이 64px 아래에서
          시작해 창 바닥까지 선다. */}
      <div className="flex w-full min-h-0 flex-1">
        <AppSidebar className="top-16 bottom-0 h-auto" />
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
  )
}
