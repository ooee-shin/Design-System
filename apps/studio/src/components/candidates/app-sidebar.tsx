"use client"

import * as React from "react"

import { RiArrowRightSLine } from "@remixicon/react"

import { SearchForm } from "@/components/candidates/search-form"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/candidates/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/candidates/sidebar"

/**
 * 관리자웹의 실제 메뉴 이름이다. 사용자가 준 화면 지도의 1번부터 8번까지, 즉 좌측 레일에 쌓이는
 * GNB 항목만 옮겼다. 유틸리티로 분류된 9번 이후는 레일에 뜨지 않으므로 넣지 않았다.
 *
 * **이름만 가져왔고 경로는 만들지 않았다.** 링크는 블록이 쓰던 `#` 그대로이며, 화면을 만들 때
 * 하나씩 실제 경로로 바꾼다.
 *
 * 원본에서 옮기지 않은 것이 셋이다. 계약관리의 「공통 서식 허브」는 메뉴가 아니라 라우트 전용으로
 * 적혀 있어 뺐고, 앱관리의 「점주 앱에 뿌리는 콘텐츠 6종」과 커뮤니티의 「사내 게시판 3종」은 메뉴
 * 이름이 아니라 그 묶음을 설명하는 문장이라 그 아래 항목만 남겼다.
 */
type NavLeaf = { title: string; isActive?: boolean }
type NavItem = NavLeaf & { items?: NavLeaf[] }
type NavGroup = { title: string; items: NavItem[] }

const data: { navMain: NavGroup[] } = {
  navMain: [
    {
      title: "가맹영업",
      items: [
        { title: "신규가맹문의" },
        { title: "가맹상담관리" },
        { title: "제외문의" },
        { title: "상권탐색" },
      ],
    },
    {
      title: "계약관리",
      items: [
        {
          title: "계약대상",
          items: [
            { title: "신규" },
            { title: "재계약" },
            { title: "양도양수" },
            { title: "명의변경" },
            { title: "리뉴얼" },
            { title: "폐점관리" },
          ],
        },
        { title: "계약진행" },
        { title: "계약완료" },
      ],
    },
    {
      title: "가맹점관리",
      items: [{ title: "오픈매장관리" }, { title: "가맹점현황" }],
    },
    {
      title: "운영관리",
      items: [
        { title: "지원요청관리" },
        { title: "품질관리" },
        { title: "미션관리" },
        { title: "일정관리" },
        { title: "활동관리" },
        { title: "설문조사관리" },
        {
          title: "파트너 & 고객센터",
          items: [{ title: "고객의 소리" }, { title: "점주의 소리" }],
        },
        { title: "발주관리" },
      ],
    },
    {
      title: "앱관리",
      items: [
        { title: "가맹점 공지사항" },
        { title: "교육자료" },
        { title: "청년늬우스" },
        { title: "홍보자료" },
        { title: "팝업" },
        { title: "FAQ" },
      ],
    },
    {
      title: "커뮤니티",
      items: [
        { title: "전사공지사항" },
        { title: "운영FAQ" },
        { title: "운영관리매뉴얼" },
      ],
    },
    {
      title: "통계",
      items: [
        {
          title: "매출",
          items: [
            { title: "일일실적" },
            { title: "Comp.S 순위" },
            { title: "MSR" },
          ],
        },
        { title: "품질관리" },
        { title: "운영", items: [{ title: "지원요청 현황" }] },
        {
          title: "데이터 관리",
          items: [
            { title: "목표 매출 업로드" },
            { title: "배달 매출 업로드" },
            { title: "재료비 업로드" },
            { title: "로열티 업로드" },
            { title: "상품 설정" },
            { title: "지출 비용 설정" },
          ],
        },
      ],
    },
    {
      title: "업무 관리",
      items: [{ title: "업무관리" }, { title: "업무관리 사용자별" }],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // 지금 보고 있는 메뉴가 어느 것인지 화면이 말해야 한다. 실제 경로가 아직 없으므로 누른 것을
  // 기억해 두고, 경로가 붙으면 주소에서 읽는 값으로 바꾼다.
  //
  // 고른 줄은 브랜드 색을 두른다. 받은 코드의 회색 바탕은 hover 와 같은 색이라, 가리키고 있는
  // 줄과 고른 줄이 구분되지 않았다.
  const [activeMenu, setActiveMenu] = React.useState<string | null>(null)


  return (
    <Sidebar {...props}>
      <SidebarHeader className="p-0">
        {/* 맨 위 띠는 헤더와 같은 56px 이다. 여닫기 버튼은 화면에 하나만 두고 그 자리에 고정해
            두므로, 여기서는 그만큼을 비워 둔다. */}
        <div className="h-14 shrink-0" />
        <div className="pb-2">
          <SearchForm />
        </div>
      </SidebarHeader>
      <SidebarContent className="gap-0">
        {/* 1depth 는 접지 않는다. 페이지가 아니라 묶음이라는 것은 작고 옅은 글자가 말하고,
            그 아래는 늘 펼쳐져 있다. */}
        {data.navMain.map((group) => (
          <SidebarGroup key={group.title} className="pt-3 pb-0.5">
            <SidebarGroupLabel className="text-[length:var(--text-oe-label)] font-medium text-sidebar-foreground/50">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              {/* 줄 사이를 띄우지 않는다. 높이가 36px 이라 줄끼리 붙어도 서로 눌리지 않는다. */}
                <SidebarMenu className="gap-0">
                {group.items.map((item) =>
                  item.items ? (
                    // 하위 목록을 가진 2depth 는 접고 펼 수 있고 처음에는 닫혀 있다. 화살표를
                    // 글자 앞이 아니라 줄 끝에 두는 이유는, 하위가 없는 형제와 글자 시작점이
                    // 어긋나지 않게 하기 위해서다.
                    <Collapsible key={item.title} className="group/collapsible">
                      <SidebarMenuItem>
                        <SidebarMenuButton className="h-9 font-medium data-active:bg-[var(--menu-active-bg)] data-active:text-[var(--menu-active-fg)] hover:data-active:bg-[var(--menu-active-bg)] hover:data-active:text-[var(--menu-active-fg)]" isActive={item.isActive} render={<CollapsibleTrigger />}>
                          {item.title}
                          <RiArrowRightSLine className="ml-auto shrink-0 transition-transform group-data-open/collapsible:rotate-90" />
                        </SidebarMenuButton>

                        {/* 3depth 는 2depth 와 크기도 색도 같고 두께만 다르다. 1depth 가 12px 로
                            작아진 자리에서 3depth 까지 어중간하게 줄이면 단계가 읽히지 않는다. */}
                        <CollapsibleContent>
                          <SidebarMenuSub className="gap-0">
                            {item.items.map((child) => (
                              <SidebarMenuSubItem key={child.title}>
                                <SidebarMenuSubButton
                                  className="h-8 data-active:bg-[var(--menu-active-bg)] data-active:text-[var(--menu-active-fg)] hover:data-active:bg-[var(--menu-active-bg)] hover:data-active:text-[var(--menu-active-fg)]"
                                  isActive={activeMenu === `${group.title}/${item.title}/${child.title}`}
                                  onClick={(event) => {
                                    event.preventDefault()
                                    setActiveMenu(`${group.title}/${item.title}/${child.title}`)
                                  }}
                                  render={<a href="#" />}
                                >
                                  {child.title}
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  ) : (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        className="h-9 font-medium data-active:bg-[var(--menu-active-bg)] data-active:text-[var(--menu-active-fg)] hover:data-active:bg-[var(--menu-active-bg)] hover:data-active:text-[var(--menu-active-fg)]"
                        isActive={activeMenu === `${group.title}/${item.title}`}
                        onClick={(event) => {
                          event.preventDefault()
                          setActiveMenu(`${group.title}/${item.title}`)
                        }}
                        render={<a href="#" />}
                      >
                        {item.title}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ),
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
