"use client"

import * as React from "react"

import { RiArrowRightSLine, type RemixiconComponentType } from "@remixicon/react"

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

// 줄 위에 마우스를 얹었을 때와 그 줄을 고른 상태다. 1·2·3depth 가 높이와 여백만 다르고 색이
// 바뀌는 방식은 같으므로 한 곳에 둔다.
const MENU_ROW_CLASS =
  "transition-colors duration-150 hover:bg-[var(--menu-hover-bg)] hover:text-[var(--menu-hover-fg,inherit)] data-active:bg-[var(--menu-active-bg)] data-active:text-[var(--menu-active-fg)] hover:data-active:bg-[var(--menu-active-bg)] hover:data-active:text-[var(--menu-active-fg)]"

/**
 * 메뉴 한 줄이다. 3depth 는 아이콘을 갖지 않으므로 이름만 있는 `NavLeaf` 이고, 2depth 는 아이콘을
 * 갖고 하위 목록을 가질 수 있다. 1depth 는 페이지가 아니라 묶음이라 `NavGroup` 이 따로 있다.
 *
 * **메뉴의 내용은 이 컴포넌트가 갖지 않는다.** 어떤 메뉴가 쌓이는지는 그 시스템이 정하는 것이므로
 * 쓰는 쪽에서 받는다.
 */
export type NavLeaf = { title: string; isActive?: boolean }

export type NavItem = NavLeaf & {
  /** 줄 앞에 서는 아이콘. 좌측 메뉴 스타일이 켤 때만 그린다. */
  icon: RemixiconComponentType
  items?: NavLeaf[]
}

export type NavGroup = {
  title: string
  items: NavItem[]
}

/** 즐겨찾기에 담긴 화면 하나. 이름과 줄 앞의 아이콘을 갖는다. */
export type FavoriteItem = {
  title: string
  icon: RemixiconComponentType
}

export function AppSidebar({
  groups,
  showRowIcons = false,
  favorites = [],
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  /** 레일에 쌓이는 메뉴. 1depth 묶음의 배열이다. */
  groups: NavGroup[]
  /** 메뉴 줄 앞의 아이콘을 그릴지. 좌측 메뉴 스타일이 정한다. */
  showRowIcons?: boolean
  /** 즐겨찾기에 담은 화면들. 비어 있으면 그 묶음이 서지 않는다. */
  favorites?: FavoriteItem[]
}) {
  // 지금 보고 있는 메뉴가 어느 것인지 화면이 말해야 한다. 실제 경로가 아직 없으므로 누른 것을
  // 기억해 두고, 경로가 붙으면 주소에서 읽는 값으로 바꾼다.
  //
  // 고른 줄은 브랜드 색을 두른다. 받은 코드의 회색 바탕은 hover 와 같은 색이라, 가리키고 있는
  // 줄과 고른 줄이 구분되지 않았다.
  const [activeMenu, setActiveMenu] = React.useState<string | null>(null)


  return (
    <Sidebar {...props}>
      <SidebarHeader className="gap-0 p-0">
        {/* 맨 위 띠는 헤더와 같은 56px 이다. 여닫기 버튼은 화면에 하나만 두고 그 자리에 고정해
            두므로, 여기서는 그만큼을 비워 둔다. 버튼과 검색, 검색과 메뉴 사이는 서로 붙여 둔다. */}
        <div className="h-14 shrink-0" />
        <SearchForm />
      </SidebarHeader>
      <SidebarContent className="gap-0">
        {/* 즐겨찾기는 사용자가 직접 담은 화면들이라 정해진 묶음보다 위에 선다. 하나도 담지 않은
            동안에는 이름만 남은 빈 묶음이 되므로 통째로 그리지 않는다. 안쪽은 2depth 와 같은
            줄이며, 담긴 것이 어느 묶음에서 왔든 여기서는 한 층으로 나란히 선다. */}
        {favorites.length > 0 ? (
          <SidebarGroup className="pt-5 pb-0.5">
            <SidebarGroupLabel className="px-4 text-[length:var(--text-oe-label)] font-normal tracking-[0.01em] text-[var(--menu-group-fg)]">
              즐겨찾기
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0">
                {favorites.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      className={`h-9 gap-2 px-4 font-medium ${MENU_ROW_CLASS}`}
                      isActive={activeMenu === `즐겨찾기/${item.title}`}
                      onClick={(event) => {
                        event.preventDefault()
                        setActiveMenu(`즐겨찾기/${item.title}`)
                      }}
                      render={<a href="#" />}
                    >
                      {showRowIcons ? <item.icon className="size-oe-icon-small shrink-0" aria-hidden="true" /> : null}
                      {item.title}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}

        {/* 1depth 는 접지 않는다. 페이지가 아니라 묶음이라는 것은 작고 옅은 글자가 말하고,
            그 아래는 늘 펼쳐져 있다. */}
        {groups.map((group) => (
          <SidebarGroup key={group.title} className="pt-5 pb-0.5">
            <SidebarGroupLabel className="px-4 text-[length:var(--text-oe-label)] font-normal tracking-[0.01em] text-[var(--menu-group-fg)]">
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
                    //
                    // 오른쪽 여백은 글자가 쓰는 16px 보다 좁은 12px 이다. 아이콘은 그림 안쪽에
                    // 자기 여백을 품고 있어서 같은 값을 주면 더 들어와 보인다.
                    <Collapsible key={item.title} className="group/collapsible">
                      <SidebarMenuItem>
                        <SidebarMenuButton className={`h-9 gap-2 pr-3 pl-4 font-medium ${MENU_ROW_CLASS}`} isActive={item.isActive} render={<CollapsibleTrigger />}>
                          {showRowIcons ? <item.icon className="size-oe-icon-small shrink-0" aria-hidden="true" /> : null}
                          {item.title}
                          <RiArrowRightSLine className="ml-auto shrink-0 transition-transform group-data-open/collapsible:rotate-90" />
                        </SidebarMenuButton>

                        {/* 3depth 는 2depth 와 크기도 색도 같고 두께만 다르다. 1depth 가 12px 로
                            작아진 자리에서 3depth 까지 어중간하게 줄이면 단계가 읽히지 않는다. */}
                        <CollapsibleContent>
                          {/* 오른쪽은 2depth 줄과 같은 선에서 끝나게 둔다. 받은 값은 좌우가 같은
                              여백이라 하위 목록만 혼자 좁아 보였다. 왼쪽 선은 2px 이고 양 끝이
                              둥글다. border 는 끝을 둥글게 만들 수 없어서 선을 따로 그린다.
                              위아래를 6px 씩 들여 목록보다 짧게 두고, 안쪽 여백을 10px 로 두어
                              고른 줄의 바탕이 선에 닿지 않게 한다. */}
                          <SidebarMenuSub className="relative mr-0 gap-0 border-l-0 pr-0 pl-2.5 before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:rounded-full before:bg-sidebar-border">
                            {item.items.map((child) => (
                              <SidebarMenuSubItem key={child.title}>
                                <SidebarMenuSubButton
                                  className={`h-8 px-4 ${MENU_ROW_CLASS}`}
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
                        className={`h-9 gap-2 px-4 font-medium ${MENU_ROW_CLASS}`}
                        isActive={activeMenu === `${group.title}/${item.title}`}
                        onClick={(event) => {
                          event.preventDefault()
                          setActiveMenu(`${group.title}/${item.title}`)
                        }}
                        render={<a href="#" />}
                      >
                        {showRowIcons ? <item.icon className="size-oe-icon-small shrink-0" aria-hidden="true" /> : null}
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
