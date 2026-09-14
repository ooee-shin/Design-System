/**
 * 관리자 레이아웃.
 *
 * shadcn 의 sidebar-02 블록을 그대로 들여온 것이며 `pipeline.md` 의 2단계에 멈춰 있다. 색은 아직
 * shadcn token 이고 메뉴 내용도 원본의 영문 그대로다. 구조와 동작을 먼저 보기 위한 상태이므로,
 * 지시가 있기 전까지 `oe` token 으로 바꾸지 않는다. 출처는 `sources.md` 가 갖는다.
 */

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

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger className="-ml-1" />
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
        <div className="flex flex-1 flex-col gap-4 p-4">
          {Array.from({ length: 24 }).map((_, index) => (
            <div
              key={index}
              className="aspect-video h-12 w-full rounded-lg bg-muted/50"
            />
          ))}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
