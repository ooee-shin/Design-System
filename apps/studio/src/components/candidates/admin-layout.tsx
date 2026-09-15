"use client"

import * as React from "react"
import type { ReactNode } from "react"

import { AdminHeader, SidebarToggle } from "@/components/candidates/admin-header"
import { ADMIN_MENU } from "@/components/candidates/admin-menu"
import { AppSidebar, type FavoriteItem } from "@/components/candidates/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/candidates/sidebar"
import { TooltipProvider } from "@/components/candidates/tooltip"

/**
 * 관리자 웹의 레이아웃이다. 좌측 메뉴가 화면 높이를 전부 쓰고, 그 오른쪽에서 헤더와 본문이 위아래로
 * 나뉜다. 헤더를 가로 전체에 두면 흰 헤더와 짙은 레일이 맞붙어 한 화면이 위아래로 잘려 보인다.
 *
 * 관리자 화면은 이 안에 자기 본문만 넣는다. 그래야 좌측 메뉴의 스타일을 한 번 고칠 때 화면마다
 * 찾아다니지 않는다.
 *
 * 로고와 시스템명, 로그인한 사람, 메뉴는 아직 실제 데이터와 잇지 않아 이 자리가 갖고 있다.
 * 값이 붙으면 그때 바깥에서 받는다.
 */

// 메인 로고는 사용자가 테마 설정에서 등록하는 값이다. 아직 그 설정과 잇지 않았으므로 기본값을
// 둔다. 원본은 2120×399 이며 헤더 안에서 높이 28px 로 서고 폭은 비율대로 149px 이 된다. 헤더가
// 56px 이므로 위아래로 14px 씩 남는다.
const MAIN_LOGO = { src: "/images/main-logo-sample.png", width: 149, height: 28 }

// 로고의 대체 텍스트는 환경설정이 소유하는 시스템명이다. 실제 값이 붙기 전까지 어디서 오는
// 값인지 그대로 적는다.
const SYSTEM_NAME = "환경설정 시스템명"

// 로그인한 사람의 표시는 인증이 소유하는 값이다. 셋 다 화면을 보기 위해 사용자가 준 예시 값이다.
const SIGNED_IN = { name: "김블루", id: "KimblueId", role: "Admin" }

// 읽지 않은 개수는 알림이 소유하는 값이다. 아직 그 데이터와 잇지 않았고, 세 자리로 넘어갈 때의
// 모습을 보기 위해 100 을 예시로 둔다. 배지가 99 를 넘으면 `99+` 로 줄여 그린다.
const UNREAD_NOTIFICATIONS = 100

// 좌측 메뉴 스타일이다. 지금 갈리는 축은 바탕색과 고른 줄의 색 둘이며, 그 값을 CSS 변수로 얹어
// 좌측 메뉴 전체가 한 번에 따라가게 한다.
//
// 지금 갈리는 것은 레일의 바탕이다. 「다크」가 짙은 브랜드 색, 라벨 A 가 회색, 라벨 C 가 흰색이다.
// 「다크」는 아직 이름이 정해지지 않은 가제다.
//
// **이 시스템은 다크 모드를 제공하지 않는다.** 그래서 짙은 바탕은 테마가 아니라 스타일의 선택이며,
// 테마에 따라 뒤집히는 token 대신 고정된 중립 단계를 쓴다.
export type SidebarStyle = {
  name: string
  /** 좌측 메뉴에 얹을 CSS 변수. 비어 있으면 지금 값을 그대로 쓴다. */
  vars: React.CSSProperties
  /** 미리보기의 좌측 띠와 본문 색. */
  preview?: { band: string; body: string }
  /** 이 스타일이 어떤 모습인지 한 줄. 미리보기를 볼 수 없는 사람에게 전한다. */
  hint: string
}

export const SIDEBAR_STYLES: SidebarStyle[] = [
  {
    name: "다크",
    hint: "브랜드의 가장 짙은 색을 씁니다.",
    vars: {
      "--nav-background": "var(--brand-950)",
      // 고르지 않은 줄은 온전한 흰색이 아니라 알파를 먹여 한 단계 옅게 둔다. 그래야 고른 줄의
      // 흰 글자가 그 사이에서 드러난다.
      "--nav-foreground": "rgb(255 255 255 / 0.8)",
      "--nav-border": "rgb(255 255 255 / 0.12)",
      // 검색창의 면과 줄 위에 마우스를 얹었을 때의 면이 같은 값이다. 짙은 레일 위에서는 고정된
      // 색 한 단계보다 흰색을 옅게 얹는 편이, 레일 색이 바뀌어도 같은 정도로 밝아진다.
      "--nav-hover-background": "rgb(255 255 255 / 0.08)",
      "--nav-hover-foreground": "var(--color-neutral-50)",
      // 검색창은 줄 위의 면보다 한 단계 더 밝다. 늘 떠 있는 면이라 같은 값으로는 레일에 묻힌다.
      "--nav-search-background": "rgb(255 255 255 / 0.12)",
      "--nav-active-background": "var(--brand-700)",
      "--nav-active-foreground": "var(--color-white)",
      // 짙은 바탕에서는 흰 글자가 더 또렷하게 보이므로, 묶음 이름을 한 단계 더 옅게 둔다.
      "--nav-group-foreground": "rgb(255 255 255 / 0.5)",
    } as React.CSSProperties,
    preview: { band: "bg-[var(--brand-950)]", body: "bg-white text-neutral-900" },
  },
  {
    // 「다크」와 두 값이 뒤집힌 스타일이다. 바탕이 밝은 브랜드 단계이고 고른 줄이 짙다.
    name: "브랜드",
    hint: "브랜드 색이 그대로 드러납니다.",
    vars: {
      "--nav-background": "var(--brand-800)",
      "--nav-foreground": "rgb(255 255 255 / 0.8)",
      "--nav-border": "rgb(255 255 255 / 0.16)",
      // 검색창의 면과 hover, 고른 줄이 모두 레일을 밝히는 방향으로 간다. 하나만 어두워지면 한
      // 레일 안에서 방향이 둘로 갈린다. 옅은 것부터 진한 것까지 12·14·16% 의 사다리다.
      "--nav-hover-background": "rgb(255 255 255 / 0.12)",
      "--nav-hover-foreground": "var(--color-white)",
      "--nav-search-background": "rgb(255 255 255 / 0.14)",
      // 고른 줄을 짙은 색으로 채우면 표시가 아니라 구멍처럼 읽힌다. 레일을 밝히는 알파로 두고
      // 글자를 온전한 흰색으로 올려 구분한다.
      "--nav-active-background": "rgb(255 255 255 / 0.16)",
      "--nav-active-foreground": "var(--color-white)",
      "--nav-group-foreground": "rgb(255 255 255 / 0.5)",
    } as React.CSSProperties,
    preview: { band: "bg-[var(--brand-800)]", body: "bg-white text-neutral-900" },
  },
  {
    // 브랜드를 쓰지 않는 회색조다. 나머지 둘과 얼개는 같고 색 계열만 중립이다.
    name: "라이트",
    hint: "브랜드 색을 쓰지 않는 밝은 회색입니다. 메인 컬러를 바꿔도 이 스타일은 달라지지 않습니다.",
    vars: {
      "--nav-background": "var(--color-neutral-100)",
      // 바탕이 밝으므로 얹는 알파도 검정이다. 나머지 둘과 얼개는 같고 방향만 뒤집힌다.
      "--nav-foreground": "rgb(0 0 0 / 0.8)",
      "--nav-border": "rgb(0 0 0 / 0.12)",
      "--nav-hover-background": "rgb(0 0 0 / 0.06)",
      "--nav-hover-foreground": "rgb(0 0 0 / 0.8)",
      // 바탕이 회색조인 스타일이므로 고른 줄에도 브랜드를 쓰지 않는다. 같은 검정을 hover 보다
      // 한 단계 더 얹고 글자를 온전한 검정으로 올린다.
      "--nav-active-background": "rgb(0 0 0 / 0.1)",
      "--nav-active-foreground": "rgb(0 0 0 / 0.95)",
    } as React.CSSProperties,
    preview: { band: "bg-neutral-100", body: "bg-white text-neutral-900" },
  },
]

export function AdminLayout({
  menuStyle = SIDEBAR_STYLES[0].name,
  showRowIcons = true,
  favorites = [],
  children,
}: {
  /** 좌측 메뉴 스타일의 이름. `SIDEBAR_STYLES` 중 하나다. */
  menuStyle?: string
  /** 메뉴 줄 앞에 아이콘을 그릴지. */
  showRowIcons?: boolean
  /** 즐겨찾기에 담은 화면들. */
  favorites?: FavoriteItem[]
  children: ReactNode
}) {
  const style = SIDEBAR_STYLES.find((item) => item.name === menuStyle) ?? SIDEBAR_STYLES[0]

  return (
    // 툴팁은 열림과 닫힘을 한 곳에서 관리해야 하므로 Provider 가 화면을 감싼다.
    <TooltipProvider>
      {/* 관리자는 `lg`(1024px)까지만 대응한다. 그보다 좁아지면 화면을 다시 짜지 않고 가로로
          스크롤한다. 규칙은 `quality.md` 가 갖는다.

          좌측 메뉴의 글자색은 사이드바의 가장 바깥 요소가 정하므로, 스타일 변수를 그보다 위에
          얹어야 안쪽까지 따라온다. 고른 줄의 색도 스타일이 바꿀 수 있도록 변수로 둔다. */}
      <SidebarProvider
        className="min-w-[1024px]"
        style={
          {
            "--nav-active-background": "var(--oe-brand-background-secondary)",
            "--nav-active-foreground": "var(--oe-brand-foreground-primary)",
            // 줄 위에 마우스를 얹었을 때의 면이다. 따로 정하지 않으면 검색창과 같은 값을 쓴다.
            "--nav-hover-background": "var(--nav-hover-background)",
            // 검색창의 면이다. 따로 정하지 않으면 줄 위의 면과 같은 값을 쓴다.
            "--nav-search-background": "var(--nav-hover-background)",
            // 묶음 이름의 색이다. 따로 정하지 않으면 줄 글자의 70% 로 둔다.
            "--nav-group-foreground": "color-mix(in srgb, var(--nav-foreground) 70%, transparent)",
            ...style.vars,
          } as React.CSSProperties
        }
      >
        {/* 여닫기 버튼은 화면에 하나뿐이고 왼쪽 맨 위 한 자리를 지킨다. 레일 안과 헤더 안에
            따로 두면 접을 때 하나가 사라지고 다른 하나가 생겨서, 유지되는 것이 아니라 새로
            만들어지는 것처럼 보인다. */}
        <SidebarToggle />
        <AppSidebar groups={ADMIN_MENU} showRowIcons={showRowIcons} favorites={favorites} />
        <SidebarInset className="min-h-0">
          <AdminHeader
            logo={MAIN_LOGO}
            systemName={SYSTEM_NAME}
            user={SIGNED_IN}
            unreadCount={UNREAD_NOTIFICATIONS}
          />
          {children}
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
