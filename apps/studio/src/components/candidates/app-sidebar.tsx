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
      title: "신규가맹문의",
      items: [
        {
          title: "신규가맹문의",
          items: [
            { title: "신규DB관리" },
            { title: "분배DB관리" },
            { title: "휴지통" },
          ],
        },
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
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SearchForm />
      </SidebarHeader>
      <SidebarContent className="gap-0">
        {/* 묶음마다 접을 수 있는 SidebarGroup 을 하나씩 만든다. */}
        {data.navMain.map((group) => (
          <Collapsible
            key={group.title}
            title={group.title}
            defaultOpen
            className="group/collapsible"
          >
            {/* 묶음이 여덟이라 위아래 여백이 쌓이면 한 화면에 들어오지 않는다. 세로 여백만 줄인다. */}
            <SidebarGroup className="py-0.5">
              {/* 1depth 는 페이지가 아니라 묶음이다. 글자를 한 단계 줄이고 색을 옅게 두어 아래
                  단계와 성격이 다르다는 것을 말하고, 접고 펴는 화살표를 글자 앞에 둔다. */}
              <SidebarGroupLabel
                className="group/label gap-1 text-xs font-semibold text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                render={<CollapsibleTrigger />}
              >
                <RiArrowRightSLine className="shrink-0 transition-transform group-data-open/collapsible:rotate-90" />
                {group.title}
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton className="pl-7" isActive={item.isActive} render={<a href="#" />}>
                          {item.title}
                        </SidebarMenuButton>

                        {/* 세 번째 단계를 가진 항목이 있다. 블록이 갖고 있는 하위 메뉴로 그린다. */}
                        {item.items ? (
                          <SidebarMenuSub>
                            {item.items.map((child) => (
                              <SidebarMenuSubItem key={child.title}>
                                <SidebarMenuSubButton
                                  className="pl-6 data-[size=md]:text-[13px] text-sidebar-foreground/70"
                                  isActive={child.isActive}
                                  render={<a href="#" />}
                                >
                                  {child.title}
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        ) : null}
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
