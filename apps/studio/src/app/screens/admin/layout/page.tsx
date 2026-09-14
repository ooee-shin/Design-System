// 접힘 상태를 읽어 표시에 반영하므로 이 화면은 클라이언트에서 그린다.
"use client";

/**
 * 관리자 레이아웃.
 *
 * shadcn 의 sidebar-02 블록에서 들여왔다. 출처는 `sources.md` 가 갖는다.
 *
 * **헤더까지는 `oe` token 으로 바꿨고 그 아래는 아직 shadcn token 이다.** 사이드 내비게이션과
 * 본문, 그리고 그것들이 쓰는 `candidates` 의 부품이 남아 있다. 메뉴 내용도 원본의 영문 그대로다.
 * `pipeline.md` 가 정한 대로 지시를 받은 범위만 바꾸고 나머지는 그 자리에 둔다.
 */

import * as React from "react"
import { useState } from "react"

import Image from "next/image"

import {
  RiLogoutBoxRLine,
  RiMenuLine,
  RiNotification3Line,
  RiOrganizationChart,
  RiSettings3Line,
} from "@remixicon/react"

import { Badge, Button, NotificationBadge, Radio, RadioGroup } from "@ooee/ui"

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
// 값인지 그대로 적는다.
const SYSTEM_NAME = "환경설정 시스템명";

// 로그인한 사람의 표시는 인증이 소유하는 값이다. 셋 다 화면을 보기 위해 사용자가 준 예시 값이다.
const SIGNED_IN = { name: "김블루", id: "KimblueId", role: "Admin" };

// 헤더 오른쪽의 Utility 다. 화면과 상관없이 어디서나 같은 자리에 서는 전역 기능이며, 누르면
// 무엇이 열리는지는 아직 정하지 않았다.
const UTILITIES = [
  // 읽지 않은 개수는 알림이 소유하는 값이다. 아직 그 데이터와 잇지 않았고, 세 자리로 넘어갈 때의
  // 모습을 보기 위해 100 을 예시로 둔다. 배지가 99 를 넘으면 `99+` 로 줄여 그린다.
  { key: "notification", name: "알림", icon: RiNotification3Line, unread: 100 },
  { key: "settings", name: "설정", icon: RiSettings3Line },
  { key: "organization", name: "조직도", icon: RiOrganizationChart },
] as const;

export default function Page() {
  const [styleName, setStyleName] = useState(SIDEBAR_STYLES[0].name);
  const style = SIDEBAR_STYLES.find((item) => item.name === styleName) ?? SIDEBAR_STYLES[0];

  return (
    // 좌측 메뉴가 화면 높이를 전부 쓰고, 그 오른쪽에서 헤더와 본문이 위아래로 나뉜다. 헤더를 가로
    // 전체에 두면 흰 헤더와 짙은 레일이 맞붙어 한 화면이 위아래로 잘려 보인다.
    //
    // 툴팁은 열림과 닫힘을 한 곳에서 관리해야 하므로 Provider 가 화면을 감싼다.
    <TooltipProvider>
      {/* 관리자는 `lg`(1024px)까지만 대응한다. 그보다 좁아지면 화면을 다시 짜지 않고 가로로
          스크롤한다. 규칙은 `quality.md` 가 갖는다.
          
          좌측 메뉴의 글자색은 사이드바의 가장 바깥 요소가 정하므로, 스타일 변수를 그보다 위에
          얹어야 안쪽까지 따라온다. 고른 줄의 색도 스타일이 바꿀 수 있도록 변수로 둔다. */}
      <SidebarProvider
        className="min-w-[1024px]"
        style={{
          "--menu-active-bg": "var(--oe-brand-background-secondary)",
          "--menu-active-fg": "var(--oe-brand-foreground-primary)",
          ...style.vars,
        } as React.CSSProperties}
      >
        {/* 여닫기 버튼은 화면에 하나뿐이고 왼쪽 맨 위 한 자리를 지킨다. 레일 안과 헤더 안에
            따로 두면 접을 때 하나가 사라지고 다른 하나가 생겨서, 유지되는 것이 아니라 새로
            만들어지는 것처럼 보인다. */}
        <SidebarToggle />
        <AppSidebar />
        <SidebarInset className="min-h-0">
          <AdminHeader />
          <div className="flex flex-1 flex-col gap-6 p-6">
            <SidebarStyleSetting value={styleName} onChange={setStyleName} />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}

/**
 * 본문 위의 헤더다. 좌측 메뉴가 접혀 있을 때만 여닫기 버튼을 자기 왼쪽에 들인다. 펼쳐져 있을
 * 때는 그 버튼이 레일의 머리에 있고, 접히면 레일과 함께 사라지므로 같은 좌표를 헤더가 이어받는다.
 */
function AdminHeader() {
  const { state } = useSidebar();

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b border-oe-border-secondary bg-oe-background-primary px-4">
      {/* 접히면 헤더가 왼쪽 끝까지 늘어난다. 그 자리는 고정된 여닫기 버튼이 쓰므로 그만큼 비운다. */}
      {state === "collapsed" ? <span className="w-9 shrink-0" aria-hidden="true" /> : null}

      {/* 로고는 그 버튼의 오른쪽에 서고, 누르면 첫 화면으로 돌아간다. 그 화면은 아직 만들지
          않았으므로 블록이 쓰는 것과 같은 자리 표시 링크를 둔다. 링크의 이름은 이미지의 대체
          텍스트가 갖는다. */}
      <a href="#" className="mr-2 shrink-0 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-oe-focus-ring">
        <Image
          src={MAIN_LOGO.src}
          width={MAIN_LOGO.width}
          height={MAIN_LOGO.height}
          alt={SYSTEM_NAME}
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
              unread={"unread" in utility ? utility.unread : undefined}
            />
          ))}
        </div>

        <span className="mx-2 h-4 w-px shrink-0 bg-oe-border-secondary" aria-hidden="true" />

        {/* 이름이 먼저 읽히고 아이디와 권한이 그것을 보충한다. */}
        <span className="flex items-center gap-2 text-sm">
          <span className="font-medium text-oe-foreground-primary">{SIGNED_IN.name}</span>
          <span className="text-xs text-oe-foreground-tertiary">{SIGNED_IN.id}</span>
          {/* 글자와 가운데를 맞추면 배지가 위로 올라 보이고, 2px 을 내리면 이번에는 내려가
              보인다. 그 사이인 1px 로 둔다. 여백 대신 옮기는 이유는, 가운데 정렬이 여백만큼
              다시 끌어올려 절반만 내려가기 때문이다. */}
          <Badge tone="neutral" variant="outlined" className="translate-y-px">
            {SIGNED_IN.role}
          </Badge>
        </span>
        <UtilityButton name="로그아웃" icon={RiLogoutBoxRLine} />
      </div>
    </header>
  );
}

/**
 * 좌측 메뉴를 접고 펴는 버튼이다. 레일이 서 있는지 아닌지가 화면에 그대로 드러나므로 버튼이
 * 눌림 상태를 따로 말하지 않는다. 그래서 `ToggleButton` 이 아니라 그냥 버튼이고, 상태는 이름과
 * 툴팁의 문구만 바뀐다.
 *
 * 아이콘만 있는 버튼이라 무엇을 하는 버튼인지 글자로 확인할 자리가 없다. 그래서 가리키면 툴팁이
 * 그 자리를 대신한다. 툴팁의 문구와 접근 가능한 이름은 같은 말을 쓴다. 다르게 두면 보는 사람과
 * 낭독기로 듣는 사람이 서로 다른 말을 만난다.
 */
/**
 * 좌측 메뉴의 스타일을 고르는 자리다. 나중에는 환경설정 화면이 갖지만, 고른 것이 왼쪽에 어떻게
 * 반영되는지 먼저 보려고 본문에 둔다.
 *
 * 세 선택지의 이름은 아직 정해지지 않았다. 무엇이 달라지는지 정해지면 그 이름으로 바꾼다.
 */
// 좌측 메뉴 스타일이다. 지금 갈리는 축은 바탕색과 고른 줄의 색 둘이며, 그 값을 CSS 변수로 얹어
// 좌측 메뉴 전체가 한 번에 따라가게 한다.
//
// 라벨 A 는 지금 이 화면에 적용되어 있는 스타일이라 덮어쓰는 값이 없다. 라벨 C 는 무엇이
// 달라지는지 아직 정해지지 않았다.
//
// **이 시스템은 다크 모드를 제공하지 않는다.** 그래서 짙은 바탕은 테마가 아니라 스타일의 선택이며,
// 테마에 따라 뒤집히는 token 대신 고정된 중립 단계를 쓴다.
type SidebarStyle = {
  name: string
  /** 좌측 메뉴에 얹을 CSS 변수. 비어 있으면 지금 값을 그대로 쓴다. */
  vars: React.CSSProperties
  /** 미리보기의 좌측 띠와 본문 색. */
  preview?: { band: string; body: string }
}

const SIDEBAR_STYLES: SidebarStyle[] = [
  { name: "라벨 A", vars: {}, preview: { band: "bg-neutral-100", body: "bg-white text-neutral-900" } },
  {
    name: "라벨 B",
    vars: {
      "--sidebar": "var(--color-neutral-900)",
      "--sidebar-foreground": "var(--color-neutral-50)",
      "--sidebar-border": "var(--color-neutral-800)",
      "--sidebar-accent": "var(--color-neutral-800)",
      "--sidebar-accent-foreground": "var(--color-neutral-50)",
    } as React.CSSProperties,
    preview: { band: "bg-neutral-900", body: "bg-white text-neutral-900" },
  },
  { name: "라벨 C", vars: {} },
]

function SidebarStyleSetting({ value, onChange }: { value: string; onChange: (name: string) => void }) {
  return (
    <section className="flex w-fit flex-col gap-3">
      <h2 className="text-lg font-semibold tracking-tight text-oe-foreground-primary">좌측 메뉴 스타일</h2>
      <RadioGroup
        // 원본은 폭이 정해진 상자 안에 있어서 칸을 균등 분할했다. 여기서는 그 상자가 없어 카드가
        // 글자 폭까지 눌리므로, 카드 폭을 직접 정한다.
        className="flex gap-3"
        value={value}
        onValueChange={(next) => onChange(String(next))}
        aria-label="좌측 메뉴 스타일"
      >
        {SIDEBAR_STYLES.map((item) => (
          <StyleOptionCard key={item.name} value={item.name} label={item.name} preview={item.preview} />
        ))}
      </RadioGroup>
    </section>
  );
}

/**
 * `radio.md` 의 「선택 가능한 콘텐츠와 결합하기」가 보여 주는 카드를 그대로 가져왔다. 고른 카드는
 * 미리보기 둘레에 브랜드 색 테두리가 생기고, 카드 자체의 바탕은 바뀌지 않는다.
 */
function StyleOptionCard({
  value,
  label,
  preview,
}: {
  value: string
  label: string
  preview?: { band: string; body: string }
}) {
  const labelId = `sidebar-style-${value}`;

  return (
    <label className="relative grid w-44 cursor-pointer gap-1 [&:has([data-slot=radio][data-checked])_.style-preview-frame]:border-[var(--brand-alpha-40)] [&:has([data-slot=radio]:focus-visible)_.style-preview-frame]:!border-oe-focus-ring">
      <span className="style-preview-frame block rounded-xl border-2 border-transparent p-[3px] transition-[border-color] duration-150">
        {/* 미리보기는 그 스타일의 좌측 메뉴 바탕을 그대로 보여 준다. 그림의 얼개는 `radio.md` 의
            「선택 가능한 콘텐츠와 결합하기」가 쓰는 것과 같다. */}
        {preview ? (
          <StylePreview band={preview.band} body={preview.body} />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-24 w-full items-center justify-center rounded-lg border border-dashed border-oe-border-primary text-[11px] text-oe-foreground-tertiary"
          >
            미리보기
          </span>
        )}
      </span>
      <span className="flex min-h-7 items-center gap-2 pl-1">
        <Radio value={value} aria-labelledby={labelId} className="focus-visible:ring-0 focus-visible:ring-offset-0" />
        <span id={labelId} className="text-sm leading-5 font-medium whitespace-nowrap text-oe-foreground-primary">
          {label}
        </span>
      </span>
    </label>
  );
}

/**
 * 스타일의 미리보기다. 좌측 띠와 본문, 그 안의 막대 셋으로 화면의 얼개만 그리며, 그림은
 * `radio.md` 의 「선택 가능한 콘텐츠와 결합하기」가 쓰는 것과 같다.
 */
function StylePreview({ band, body }: { band: string; body: string }) {
  return (
    <span
      aria-hidden="true"
      className="flex h-24 w-full overflow-hidden rounded-lg border border-black/10"
    >
      <span className={`w-1/4 shrink-0 ${band}`} />
      <span className={`flex-1 p-3 ${body}`}>
        <span className="block h-1.5 w-1/3 rounded-full bg-current opacity-35" />
        <span className="mt-2 block h-1.5 w-1/2 rounded-full bg-current opacity-20" />
        <span className="mt-7 block h-6 w-full rounded-md bg-current opacity-10" />
      </span>
    </span>
  );
}

/**
 * Utility 의 아이콘 버튼이다. 글자가 없으므로 이름은 툴팁과 접근 가능한 이름이 함께 갖는다.
 * 누르면 무엇이 열리는지는 아직 정하지 않았다.
 *
 * 읽지 않은 개수를 받으면 버튼 안에서 아이콘 오른쪽에 나란히 선다. 아이콘 모서리에 얹지 않으므로
 * 자리를 좌표로 잡을 일이 없고, 버튼이 갖고 있는 gap 이 둘 사이를 벌린다.
 */
function UtilityButton({
  name,
  icon: Icon,
  unread,
}: {
  name: string;
  icon: typeof RiMenuLine;
  unread?: number;
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
            leadingIcon={<Icon />}
          >
            {unread === undefined ? undefined : <NotificationBadge count={unread} stroke={false} />}
          </Button>
        }
      />
      <TooltipContent side="bottom" align="center">
        {name}
      </TooltipContent>
    </Tooltip>
  );
}

function SidebarToggle() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const label = collapsed ? "좌측 메뉴 열기" : "좌측 메뉴 닫기";

  return (
    // 펼쳐져 있으면 레일 위에, 접혀 있으면 헤더 위에 놓이므로 글자색이 그 바닥을 따라간다.
    <span
      className={`fixed top-0 left-0 z-30 flex h-14 items-center px-4 ${collapsed ? "text-oe-foreground-secondary" : "text-sidebar-foreground"}`}
    >
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              tone="neutral"
              controlSize="small"
              leadingIcon={<RiMenuLine className="size-oe-icon-medium" aria-hidden="true" />}
              onClick={toggleSidebar}
              aria-label={label}
            />
          }
        />
        <TooltipContent side="bottom" align="center">
          {label}
        </TooltipContent>
      </Tooltip>
    </span>
  );
}
