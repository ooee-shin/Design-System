"use client"

import * as React from "react"

import Image from "next/image"

import {
  RiLogoutBoxRLine,
  RiMenuLine,
  RiNotification3Line,
  RiOrganizationChart,
  RiSettings3Line,
} from "@remixicon/react"

import { Badge, Button, NotificationBadge } from "@ooee/ui"

import { useSidebar } from "@/components/candidates/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/candidates/tooltip"

/**
 * 관리자 웹의 맨 위 한 줄이다. 왼쪽에 시스템을 알리는 로고가 서고 오른쪽에 화면과 상관없이 늘
 * 같은 자리를 지키는 Utility 와 로그인한 사람이 선다. 가운데는 비워 둔다.
 *
 * **이 줄은 좌측 메뉴의 오른쪽에서 시작한다.** 가로 전체에 두면 흰 헤더와 짙은 레일이 맞붙어 한
 * 화면이 위아래로 잘려 보이기 때문이다. 그래서 `SidebarProvider` 안에서만 선다.
 *
 * 로고와 로그인한 사람은 화면 바깥이 소유하는 값이라 받아서 그린다. Utility 넷은 어느 화면에서나
 * 같은 것이 같은 자리에 서야 하므로 이 부품이 갖는다.
 */

// Utility 셋이다. 누르면 무엇이 열리는지는 아직 정하지 않았다.
const UTILITIES = [
  { key: "notification", name: "알림", icon: RiNotification3Line },
  { key: "settings", name: "설정", icon: RiSettings3Line },
  { key: "organization", name: "조직도", icon: RiOrganizationChart },
] as const

export type AdminHeaderLogo = {
  src: string
  width: number
  height: number
}

export type AdminHeaderUser = {
  name: string
  id: string
  role: string
}

export function AdminHeader({
  logo,
  systemName,
  user,
  unreadCount,
}: {
  logo: AdminHeaderLogo
  /** 로고의 대체 텍스트로 쓰는 시스템 이름. */
  systemName: string
  user: AdminHeaderUser
  /** 읽지 않은 알림 개수. 없으면 배지가 붙지 않는다. */
  unreadCount?: number
}) {
  const { state } = useSidebar()

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b border-oe-border-secondary bg-oe-background-primary px-4">
      {/* 접히면 헤더가 왼쪽 끝까지 늘어난다. 그 자리는 고정된 여닫기 버튼이 쓰므로 그만큼 비운다. */}
      {state === "collapsed" ? <span className="w-9 shrink-0" aria-hidden="true" /> : null}

      {/* 로고는 그 버튼의 오른쪽에 서고, 누르면 첫 화면으로 돌아간다. 그 화면은 아직 만들지
          않았으므로 자리 표시 링크를 둔다. 링크의 이름은 이미지의 대체 텍스트가 갖는다. */}
      <a href="#" className="mr-2 shrink-0 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-oe-focus-ring">
        <Image
          src={logo.src}
          width={logo.width}
          height={logo.height}
          alt={systemName}
          priority
          className="h-7 w-auto"
        />
      </a>

      {/* 여기부터 오른쪽이 Utility 다. 가운데를 비워 두어 왼쪽과 갈라 놓는다. */}
      <div className="ml-auto flex items-center gap-1">
        {/* 세 버튼은 같은 성격이라 서로 붙여 하나의 덩이로 읽히게 한다. */}
        <div className="flex items-center">
          {UTILITIES.map((utility) => (
            <UtilityButton
              key={utility.key}
              name={utility.name}
              icon={utility.icon}
              unread={utility.key === "notification" ? unreadCount : undefined}
            />
          ))}
        </div>

        {/* 이름이 먼저 읽히고 아이디와 권한이 그것을 보충한다. 세 Utility 와는 선으로 가르지
            않고 여백만으로 갈라 둔다. 헤더 전체를 세로로 자르는 선은 나누는 힘이 너무 세서,
            성격이 다를 뿐 같은 오른쪽 묶음인 둘을 서로 다른 영역처럼 보이게 했다. */}
        <span className="ml-3 flex items-center gap-2 text-sm">
          <span className="font-medium text-oe-foreground-primary">{user.name}</span>
          <span className="text-xs text-oe-foreground-tertiary">{user.id}</span>
          {/* 글자와 가운데를 맞추면 배지가 위로 올라 보이고, 2px 을 내리면 이번에는 내려가
              보인다. 그 사이인 1px 로 둔다. 여백 대신 옮기는 이유는, 가운데 정렬이 여백만큼
              다시 끌어올려 절반만 내려가기 때문이다. */}
          <Badge tone="neutral" variant="outlined" className="translate-y-px">
            {user.role}
          </Badge>
        </span>
        <UtilityButton name="로그아웃" icon={RiLogoutBoxRLine} />
      </div>
    </header>
  )
}

/**
 * Utility 의 아이콘 버튼이다. 글자가 없으므로 이름은 툴팁과 접근 가능한 이름이 함께 갖는다.
 * 아이콘은 헤더 왼쪽의 메뉴 버튼과 같은 20px 이다. 버튼 상자가 같은데 그림만 작으면 크기 차이가
 * 의도가 아니라 어긋난 것으로 읽힌다.
 *
 * 읽지 않은 개수를 받으면 버튼 안에서 아이콘 오른쪽에 나란히 선다. 아이콘 모서리에 얹지 않으므로
 * 자리를 좌표로 잡을 일이 없고, 버튼이 갖고 있는 gap 이 둘 사이를 벌린다.
 */
function UtilityButton({
  name,
  icon: Icon,
  unread,
}: {
  name: string
  icon: typeof RiMenuLine
  unread?: number
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            tone="neutral"
            controlSize="small"
            aria-label={unread === undefined ? name : `${name}, 읽지 않음 ${unread}개`}
            leadingIcon={<Icon className="size-oe-icon-medium" />}
          >
            {unread === undefined ? undefined : <NotificationBadge count={unread} stroke={false} />}
          </Button>
        }
      />
      <TooltipContent side="bottom" align="center">
        {name}
      </TooltipContent>
    </Tooltip>
  )
}

/**
 * 좌측 메뉴를 접고 펴는 버튼이다. 레일이 서 있는지 아닌지가 화면에 그대로 드러나므로 버튼이
 * 눌림 상태를 따로 말하지 않는다. 그래서 `ToggleButton` 이 아니라 그냥 버튼이고, 이름과 툴팁의
 * 문구만 바뀐다.
 *
 * 화면에 하나뿐이고 왼쪽 맨 위 한 자리를 지킨다. 레일 안과 헤더 안에 따로 두면 접을 때 하나가
 * 사라지고 다른 하나가 생겨서, 유지되는 것이 아니라 새로 만들어지는 것처럼 보인다.
 */
export function SidebarToggle() {
  const { state, toggleSidebar } = useSidebar()
  const collapsed = state === "collapsed"
  const label = collapsed ? "메뉴 열기" : "메뉴 닫기"

  return (
    // 펼쳐져 있으면 레일 위에, 접혀 있으면 헤더 위에 놓이므로 글자색이 그 바닥을 따라간다.
    <span className="fixed top-0 left-0 z-30 flex h-14 items-center px-4">
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              tone="neutral"
              controlSize="small"
              // 펼쳐져 있으면 레일 위에 놓인다. Button 은 자기 글자색을 직접 칠하므로 그대로 두면
              // 짙은 레일에서 대비가 1.13:1 까지 떨어져 보이지 않는다. 그때는 레일의 글자색과
              // 레일 위의 면을 쓴다.
              className={
                collapsed
                  ? undefined
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
              }
              leadingIcon={<RiMenuLine className="size-oe-icon-medium" aria-hidden="true" />}
              onClick={toggleSidebar}
              aria-label={label}
            />
          }
        />
        {/* 버튼의 시작점에 맞춰 왼쪽으로 붙인다. */}
        <TooltipContent side="bottom" align="start">
          {label}
        </TooltipContent>
      </Tooltip>
    </span>
  )
}
