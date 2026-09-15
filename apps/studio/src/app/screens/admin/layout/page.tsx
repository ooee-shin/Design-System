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
import { useRef, useState } from "react"

import Image from "next/image"

import {
  RiLogoutBoxRLine,
  RiMenuLine,
  RiNotification3Line,
  RiOrganizationChart,
  RiPaletteLine,
  RiSettings3Line,
} from "@remixicon/react"

import { Badge, Button, InputButton, NotificationBadge, Radio, RadioField, RadioGroup } from "@ooee/ui"

import { DEFAULT_BRAND_SEED } from "@ooee/tokens"

import { useBrandTheme } from "@/components/brand-theme-provider"
import { ColorSwatch } from "@/components/color-swatch"

import { AppSidebar } from "@/components/candidates/app-sidebar"
import { PageHeader, type PageHeaderTab } from "@/components/candidates/page-header"
import { Tabs, TabsPanel } from "@/components/candidates/tabs"
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

// 지금 화면은 환경설정의 테마설정이다. 좌측 메뉴가 아니라 헤더의 설정에서 들어오는 자리이므로
// 경로도 좌측 메뉴와 맞물리지 않는다.
const PAGE_PATH = ["환경설정", "테마설정"];

// 즐겨찾기에 담기면 좌측 메뉴의 맨 위 묶음에 이 줄로 선다. 담는 것은 경로가 아니라 화면 하나
// 이므로 이름은 경로의 마지막 항목을 쓴다.
const PAGE_FAVORITE = { title: PAGE_PATH[PAGE_PATH.length - 1], icon: RiPaletteLine };

// 제목 옆 설명 아이콘을 세우는 값이다. 펼쳐지는 자리는 아직 붙이지 않았고 실제 문구도 받지
// 않아, 지금은 아이콘이 서는지만 정한다.
const PAGE_DESCRIPTION = "이 화면이 무엇을 하는 자리인지 적습니다.";

// 테마는 관리자 웹과 두 앱이 따로 갖는다. 지금 만든 것은 관리자 웹 하나이며, 나머지 둘은 탭만
// 서 있고 내용은 아직 없다.
const THEME_TABS: PageHeaderTab[] = [
  { value: "admin", label: "관리자 웹" },
  { value: "sv", label: "SV앱" },
  { value: "sto", label: "STO앱" },
];

export default function Page() {
  // 화면에 실제로 반영되어 있는 값이다. 설정 패널은 자기 안에서 고르고, 저장을 눌렀을 때만 이
  // 값을 바꾼다.
  const { seed, applySeed } = useBrandTheme();
  const [applied, setApplied] = useState({ styleName: SIDEBAR_STYLES[0].name, showRowIcons: true });

  // 즐겨찾기는 누른 즉시 좌측 메뉴에 반영된다. 저장을 거치는 세 설정과 달리 이 화면 자체를
  // 담아 두는 표시이므로 저장 버튼이 관여하지 않는다.
  const [favorite, setFavorite] = useState(false);
  const style = SIDEBAR_STYLES.find((item) => item.name === applied.styleName) ?? SIDEBAR_STYLES[0];

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
          // 줄 위에 마우스를 얹었을 때의 면이다. 따로 정하지 않으면 검색창과 같은 값을 쓴다.
          "--menu-hover-bg": "var(--sidebar-accent)",
          // 검색창의 면이다. 따로 정하지 않으면 줄 위의 면과 같은 값을 쓴다.
          "--menu-search-bg": "var(--sidebar-accent)",
          // 묶음 이름의 색이다. 따로 정하지 않으면 줄 글자의 70% 로 둔다.
          "--menu-group-fg": "color-mix(in srgb, var(--sidebar-foreground) 70%, transparent)",
          ...style.vars,
        } as React.CSSProperties}
      >
        {/* 여닫기 버튼은 화면에 하나뿐이고 왼쪽 맨 위 한 자리를 지킨다. 레일 안과 헤더 안에
            따로 두면 접을 때 하나가 사라지고 다른 하나가 생겨서, 유지되는 것이 아니라 새로
            만들어지는 것처럼 보인다. */}
        <SidebarToggle />
        <AppSidebar showRowIcons={applied.showRowIcons} favorites={favorite ? [PAGE_FAVORITE] : []} />
        <SidebarInset className="min-h-0">
          <AdminHeader />
          {/* 탭 줄은 머리에 서고 그 탭이 여는 내용은 그 아래 본문이다. 둘이 서로를 가리켜야 하므로
              `Tabs.Root` 가 머리와 본문을 함께 감싼다. */}
          <Tabs defaultValue={THEME_TABS[0].value} className="flex min-h-0 flex-1 flex-col">
            <PageHeader
              path={PAGE_PATH}
              title="테마설정"
              tabs={THEME_TABS}
              favorite={favorite}
              onFavoriteChange={setFavorite}
              description={PAGE_DESCRIPTION}
            />
            <TabsPanel value={THEME_TABS[0].value} className="flex flex-1 flex-col gap-6 p-6">
              <MenuStyleSetting
                applied={{ seed, ...applied }}
                onSave={(next) => {
                  applySeed(next.seed);
                  setApplied({ styleName: next.styleName, showRowIcons: next.showRowIcons });
                }}
              />
            </TabsPanel>
            {THEME_TABS.slice(1).map((tab) => (
              <TabsPanel key={tab.value} value={tab.value} className="p-6 text-sm text-oe-foreground-tertiary">
                아직 만들지 않았습니다.
              </TabsPanel>
            ))}
          </Tabs>
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

        {/* 이름이 먼저 읽히고 아이디와 권한이 그것을 보충한다. 세 Utility 와는 선으로 가르지
            않고 여백만으로 갈라 둔다. 헤더 전체를 세로로 자르는 선은 나누는 힘이 너무 세서,
            성격이 다를 뿐 같은 오른쪽 묶음인 둘을 서로 다른 영역처럼 보이게 했다. */}
        <span className="ml-3 flex items-center gap-2 text-sm">
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
// 지금 갈리는 것은 레일의 바탕이다. 「다크」가 짙은 브랜드 색, 라벨 A 가 회색, 라벨 C 가 흰색이다.
// 「다크」는 아직 이름이 정해지지 않은 가제다.
//
// **이 시스템은 다크 모드를 제공하지 않는다.** 그래서 짙은 바탕은 테마가 아니라 스타일의 선택이며,
// 테마에 따라 뒤집히는 token 대신 고정된 중립 단계를 쓴다.
type SidebarStyle = {
  name: string
  /** 좌측 메뉴에 얹을 CSS 변수. 비어 있으면 지금 값을 그대로 쓴다. */
  vars: React.CSSProperties
  /** 미리보기의 좌측 띠와 본문 색. */
  preview?: { band: string; body: string }
  /** 이 스타일이 어떤 모습인지 한 줄. 미리보기를 볼 수 없는 사람에게 전한다. */
  hint: string
}

const SIDEBAR_STYLES: SidebarStyle[] = [
  {
    name: "다크",
    hint: "브랜드의 가장 짙은 색을 씁니다.",
    vars: {
      "--sidebar": "var(--brand-950)",
      // 고르지 않은 줄은 온전한 흰색이 아니라 알파를 먹여 한 단계 옅게 둔다. 그래야 고른 줄의
      // 흰 글자가 그 사이에서 드러난다.
      "--sidebar-foreground": "rgb(255 255 255 / 0.8)",
      "--sidebar-border": "rgb(255 255 255 / 0.12)",
      // 검색창의 면과 줄 위에 마우스를 얹었을 때의 면이 같은 값이다. 짙은 레일 위에서는 고정된
      // 색 한 단계보다 흰색을 옅게 얹는 편이, 레일 색이 바뀌어도 같은 정도로 밝아진다.
      "--sidebar-accent": "rgb(255 255 255 / 0.08)",
      "--sidebar-accent-foreground": "var(--color-neutral-50)",
      // 검색창은 줄 위의 면보다 한 단계 더 밝다. 늘 떠 있는 면이라 같은 값으로는 레일에 묻힌다.
      "--menu-search-bg": "rgb(255 255 255 / 0.12)",
      "--menu-active-bg": "var(--brand-700)",
      "--menu-active-fg": "var(--color-white)",
      // 짙은 바탕에서는 흰 글자가 더 또렷하게 보이므로, 묶음 이름을 한 단계 더 옅게 둔다.
      "--menu-group-fg": "rgb(255 255 255 / 0.5)",
    } as React.CSSProperties,
    preview: { band: "bg-[var(--brand-950)]", body: "bg-white text-neutral-900" },
  },
  {
    // 「다크」와 두 값이 뒤집힌 스타일이다. 바탕이 밝은 브랜드 단계이고 고른 줄이 짙다.
    name: "브랜드",
    hint: "브랜드 색이 그대로 드러납니다.",
    vars: {
      "--sidebar": "var(--brand-800)",
      "--sidebar-foreground": "rgb(255 255 255 / 0.8)",
      "--sidebar-border": "rgb(255 255 255 / 0.16)",
      // 검색창의 면과 hover, 고른 줄이 모두 레일을 밝히는 방향으로 간다. 하나만 어두워지면 한
      // 레일 안에서 방향이 둘로 갈린다. 옅은 것부터 진한 것까지 8·12·16% 의 사다리다.
      "--sidebar-accent": "rgb(255 255 255 / 0.08)",
      "--sidebar-accent-foreground": "var(--color-white)",
      // 고른 줄을 짙은 색으로 채우면 표시가 아니라 구멍처럼 읽힌다. 레일을 밝히는 알파로 두고
      // 글자를 온전한 흰색으로 올려 구분한다.
      "--menu-active-bg": "rgb(255 255 255 / 0.16)",
      "--menu-active-fg": "var(--color-white)",
      "--menu-group-fg": "rgb(255 255 255 / 0.5)",
      "--menu-hover-bg": "rgb(255 255 255 / 0.12)",
      "--menu-search-bg": "rgb(255 255 255 / 0.14)",
    } as React.CSSProperties,
    preview: { band: "bg-[var(--brand-800)]", body: "bg-white text-neutral-900" },
  },
  {
    // 브랜드를 쓰지 않는 회색조다. 나머지 둘과 얼개는 같고 색 계열만 중립이다.
    name: "라이트",
    hint: "브랜드 색을 쓰지 않는 밝은 회색입니다. 메인 컬러를 바꿔도 이 스타일은 달라지지 않습니다.",
    vars: {
      "--sidebar": "var(--color-neutral-100)",
      // 바탕이 밝으므로 얹는 알파도 검정이다. 나머지 둘과 얼개는 같고 방향만 뒤집힌다.
      "--sidebar-foreground": "rgb(0 0 0 / 0.8)",
      "--sidebar-border": "rgb(0 0 0 / 0.12)",
      "--sidebar-accent": "rgb(0 0 0 / 0.06)",
      "--sidebar-accent-foreground": "rgb(0 0 0 / 0.8)",
      // 바탕이 회색조인 스타일이므로 고른 줄에도 브랜드를 쓰지 않는다. 같은 검정을 hover 보다
      // 한 단계 더 얹고 글자를 온전한 검정으로 올린다.
      "--menu-active-bg": "rgb(0 0 0 / 0.1)",
      "--menu-active-fg": "rgb(0 0 0 / 0.95)",
    } as React.CSSProperties,
    preview: { band: "bg-neutral-100", body: "bg-white text-neutral-900" },
  },
]

/**
 * 세 설정은 고르는 동안에는 이 자리에만 남고, 저장을 눌러야 화면에 반영된다. 고르는 즉시 바뀌면
 * 저장 버튼이 할 일이 없어지고, 한 패널 안에서 즉시 적용과 저장이 섞여 읽힌다.
 */
function MenuStyleSetting({
  applied,
  onSave,
}: {
  applied: { seed: string; styleName: string; showRowIcons: boolean }
  onSave: (next: { seed: string; styleName: string; showRowIcons: boolean }) => void
}) {
  const [draft, setDraft] = useState(applied);

  return (
    // 카드 셋과 사이 간격을 더한 폭이다. 176 × 3 + 12 × 2 = 552 이다.
    <section className="flex w-[552px] flex-col gap-6">
      <span className="flex items-start justify-between gap-4">
        <h2 className="text-xl font-semibold tracking-tight text-oe-foreground-primary">메뉴 스타일 설정</h2>

        <span className="flex items-center gap-2">
          {/* 잘못 골랐을 때 돌아올 자리다. 고른 값을 기본값으로 되돌릴 뿐이고, 화면에 반영하려면
              저장을 눌러야 한다. */}
          <Button
            variant="outline"
            tone="neutral"
            controlSize="small"
            onClick={() => setDraft({ seed: DEFAULT_BRAND_SEED, styleName: SIDEBAR_STYLES[0].name, showRowIcons: true })}
          >
            기본값 초기화
          </Button>
          <Button variant="fill" controlSize="small" onClick={() => onSave(draft)}>
            저장
          </Button>
        </span>
      </span>

      <SettingRow inline label="메인 컬러" description="버튼과 선택 표시 등 화면 곳곳의 기본 색으로 쓰입니다.">
        <MainColorInput value={draft.seed} onChange={(hex) => setDraft((prev) => ({ ...prev, seed: hex }))} />
      </SettingRow>

      <SettingRow label="메뉴 스타일" description="왼쪽 메뉴의 배경색과 글자색, 선택한 메뉴의 표시가 함께 바뀝니다.">
        <RadioGroup
          className="flex gap-3"
          value={draft.styleName}
          onValueChange={(next) => setDraft((prev) => ({ ...prev, styleName: String(next) }))}
          aria-label="메뉴 스타일"
        >
          {SIDEBAR_STYLES.map((item) => (
            <StyleOptionCard
              key={item.name}
              value={item.name}
              label={item.name}
              hint={item.hint}
              preview={item.preview}
            />
          ))}
        </RadioGroup>
      </SettingRow>

      {/* 아이콘은 색과 상관없이 어느 스타일에서나 같게 동작하므로 자기 축을 갖는다. */}
      <SettingRow inline label="메뉴 아이콘" description="메뉴 이름 앞에 아이콘을 함께 보여 줍니다.">
        {/* Switch 가 아니라 Radio 다. `switch.md` 는 토글한 즉시 결과가 나타나는 자리에만 Switch 를
            쓰라고 하고, 저장을 눌러 반영하는 화면에서는 Checkbox 로 가라고 한다. 이 설정은 나중에
            환경설정으로 옮겨 가므로, 저장 여부가 정해져도 바뀌지 않는 Radio 로 둔다. */}
        <RadioGroup
          className="flex items-center gap-2"
          value={draft.showRowIcons ? "사용" : "미사용"}
          onValueChange={(next) => setDraft((prev) => ({ ...prev, showRowIcons: next === "사용" }))}
          aria-label="메뉴 아이콘"
        >
          <RadioField value="사용" label="사용" />
          <RadioField value="미사용" label="미사용" />
        </RadioGroup>
      </SettingRow>
    </section>
  );
}

/**
 * `input.md` 의 「Color input」이 보여 주는 둘째 조합이다. 입력란 모양의 버튼이 색 조각과 HEX 를
 * 함께 보여 주고, 줄 전체가 색 선택기를 여는 자리다.
 *
 * 공용 Color Picker 는 아직 없다. `input.md` 도 그것이 완성되기 전까지 팝업을 잇지 않는다고
 * 적고 있으므로, 그때까지 브라우저 선택기를 감춰 두고 버튼이 그것을 대신 연다.
 */
function MainColorInput({ value, onChange }: { value: string; onChange: (hex: string) => void }) {
  const picker = useRef<HTMLInputElement>(null);

  return (
    <span className="relative inline-flex">
      <InputButton
        layout="fixed"
        fixedWidth={176}
        value={value.toUpperCase()}
        leadingElement={<ColorSwatch color={value} />}
        aria-label="메인 컬러"
        onClick={() => picker.current?.click()}
        // shadcn 의 `--input` 이 이미 200 이라 폼 요소의 경계로는 그 값이 기준이다. 공용 `Input`
        // 의 값을 바꾸면 저장소의 모든 폼 요소가 함께 따라오므로, 여기서 먼저 200 으로 두고 본다.
        className="border-oe-border-secondary font-mono tabular-nums uppercase"
      />
      <input
        ref={picker}
        type="color"
        value={value}
        onChange={(event) => onChange(event.target.value.toUpperCase())}
        tabIndex={-1}
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-4 size-0 opacity-0"
      />
    </span>
  );
}

/**
 * 설정 하나를 이름과 설명, 조작 장치로 묶는다. 설명은 그 설정이 무엇을 바꾸는지만 적는다.
 */
function SettingRow({
  label,
  description,
  inline = false,
  children,
}: {
  label: string
  description?: string
  /** 이름과 조작 장치를 좌우로 둘지. 장치가 좁을 때만 쓴다. */
  inline?: boolean
  children: React.ReactNode
}) {
  return (
    <div className={inline ? "flex items-center justify-between gap-6" : "flex flex-col gap-4"}>
      <span className="flex flex-col gap-0.5">
        <span className="text-[15px] font-medium text-oe-foreground-primary">{label}</span>
        {description ? <span className="text-xs text-oe-foreground-tertiary">{description}</span> : null}
      </span>
      {children}
    </div>
  );
}

/**
 * `radio.md` 의 「선택 가능한 콘텐츠와 결합하기」가 보여 주는 카드를 그대로 가져왔다. 고른 카드는
 * 미리보기 둘레에 브랜드 색 테두리가 생기고, 카드 자체의 바탕은 바뀌지 않는다.
 *
 * 그 테두리는 `--brand-alpha-40` 대신 600 단계에 투명도를 입혀 쓴다. `--brand-alpha-*` 는 팔레트
 * 단계가 아니라 사용자가 넣은 seed 자체라, seed 가 아주 밝거나 어두우면 테두리도 함께 흔들린다.
 */
function StyleOptionCard({
  value,
  label,
  hint,
  preview,
}: {
  value: string
  label: string
  hint: string
  preview?: { band: string; body: string }
}) {
  const labelId = `sidebar-style-${value}`;

  return (
    // 링을 바깥으로 빼면서 미리보기 아래 3px 이 없어졌다. 카드 안쪽 간격으로 되돌린다.
    <label className="relative grid w-44 cursor-pointer gap-2 [&:has([data-slot=radio][data-checked])_.style-preview-frame]:outline-[color-mix(in_srgb,var(--brand-600)_40%,transparent)] [&:has([data-slot=radio]:focus-visible)_.style-preview-frame]:!outline-oe-focus-ring">
      {/* 고른 표시는 바깥에 그린다. 테두리로 두르면 그만큼 안쪽이 줄어서 미리보기가 카드 폭을
          다 쓰지 못하고 여백만 넓어진다. */}
      <span className="style-preview-frame block rounded-lg outline-2 outline-offset-2 outline-transparent transition-[outline-color] duration-150">
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
      {/* 라디오가 미리보기의 왼쪽 끝과 같은 자리에서 시작한다. 링을 바깥으로 빼면서 이미지가
          카드 끝까지 왔으므로, 예전에 이미지의 안쪽 여백을 맞추려고 두었던 4px 은 걷어낸다. */}
      <span className="flex min-h-7 items-center gap-2">
        <Radio
          value={value}
          aria-label={`${label}. ${hint}`}
          className="focus-visible:ring-0 focus-visible:ring-offset-0"
        />
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
      className="flex h-24 w-full overflow-hidden rounded-lg border border-oe-border-visual"
    >
      {/* 흰 바탕끼리는 경계가 없으므로 띠의 오른쪽에 선을 둔다. */}
      <span className={`w-1/4 shrink-0 border-r border-oe-border-visual ${band}`} />
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
 * 아이콘은 헤더 왼쪽의 메뉴 버튼과 같은 20px 이다. 버튼 상자가 같은데 그림만 작으면 크기 차이가
 * 의도가 아니라 어긋난 것으로 읽힌다.
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
  );
}

function SidebarToggle() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const label = collapsed ? "메뉴 열기" : "메뉴 닫기";

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
  );
}
