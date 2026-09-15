// `AppHeader` 는 머무는 동안 아래 경계선을 켜려고 스크롤 위치를 읽으므로 `"use client"` 를 스스로
// 선언하지 않고 소비자 쪽을 전제한다. `Input` 과 같다.
"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";

import {
  RiChat3Fill,
  RiChat3Line,
  RiHomeFill,
  RiHomeLine,
  RiMegaphoneFill,
  RiMegaphoneLine,
  RiMenuFill,
  RiMenuLine,
  RiNotification3Line,
  RiStore2Fill,
  RiStore2Line,
} from "@remixicon/react";

import { AppHeader, BottomNavigation, Button, type BottomNavigationItem } from "@ooee/ui";

import { MobileWebView, ScreenSkeleton } from "@/components/screens/screen-chrome";

/**
 * STO 레이아웃 V2. V1 의 헤더 아래에 하단 내비게이션을 더한 구성이다.
 *
 * 헤더는 V1 과 같은 Main 유형이되 오른쪽에 알림만 선다. 전체메뉴가 하단 내비게이션의 다섯 번째
 * 항목으로 내려갔으므로 헤더에 같은 입구를 두 번 두지 않는다.
 *
 * 비워 둔 자리: 본문, 각 항목이 가는 화면, 알림을 눌렀을 때 열리는 것, 그리고 읽지 않은 알림
 * 개수 표시다.
 */

// 이 자리에 설 것은 사용자가 환경설정에 등록하는 제품 로고다. 아직 그 설정과 잇지 않았으므로
// 관리자 웹이 메인 로고로 쓰고 있는 시험용 이미지를 그대로 세워 둔다. 원본은 2120×399 이며
// 헤더 안에서 높이 32px 로 서고 폭은 비율대로 170px 이 된다.
const HEADER_LOGO = { src: "/images/main-logo-sample.png", width: 170, height: 32 };

// 감춘 제목도 그 화면이 무엇인지 말하는 값이어야 한다. 화면 낭독기는 이 값을 읽는다.
const SCREEN_TITLE = "메인";

// 선택되지 않은 항목은 Line, 선택된 항목은 Fill 이다. 이 화면에서 시험하는 구성이며,
// `bottom-navigation.md` 는 아직 언제나 Fill 로 적혀 있다. 이 구성으로 가기로 정해지면 그 규칙을
// 함께 고친다.
//
// 「공지·자료」에는 공지사항·교육자료·홍보자료·FAQ 가 들어간다. 그 가운데 공지사항을 앞세우기로
// 했으므로 알리는 모양으로 그린다. ⓘ 는 지금 보고 있는 것을 설명하는 표시라 읽을거리가
// 모인 메뉴와 뜻이 다르므로 쓰지 않는다.
const NAVIGATION_ITEMS: BottomNavigationItem[] = [
  { value: "home", label: "홈", icon: <RiHomeLine />, selectedIcon: <RiHomeFill /> },
  { value: "headquarters", label: "본사소통", icon: <RiChat3Line />, selectedIcon: <RiChat3Fill /> },
  { value: "store", label: "매장관리", icon: <RiStore2Line />, selectedIcon: <RiStore2Fill /> },
  { value: "notice", label: "공지·자료", icon: <RiMegaphoneLine />, selectedIcon: <RiMegaphoneFill /> },
  { value: "all", label: "전체", icon: <RiMenuLine />, selectedIcon: <RiMenuFill /> },
];

// 어느 메뉴가 어느 탭에 드는지는 사용자가 정한 구분이다. 「홈」만 하위 메뉴가 아니라 화면 자체가
// 내용이므로 거기에 무엇이 서는지를 적는다. 하위 메뉴가 생기면 다른 탭과 같은 목록으로 바꾼다.
const TAB_CONTENTS: Record<string, readonly string[]> = {
  home: ["카드 콘텐츠"],
  headquarters: ["지원요청", "점주의 소리", "미션수행", "설문조사"],
  store: ["매출현황", "일정관리", "직원관리", "발주요청", "계약관리"],
  notice: ["공지사항", "교육자료", "홍보자료", "FAQ"],
  all: ["내정보", "전체메뉴", "설정"],
};

export default function StoLayoutV2ScreenPage() {
  // 어느 화면에 있는지는 원래 라우팅이 소유한다. 여기는 레이아웃을 확인하는 자리이므로 눌러서
  // 선택이 옮겨 가는 것까지 보이도록 화면이 값을 들고 있는다.
  const [current, setCurrent] = useState(NAVIGATION_ITEMS[0].value);
  const currentLabel = NAVIGATION_ITEMS.find((item) => item.value === current)?.label;
  const currentContents = TAB_CONTENTS[current];

  return (
    <MobileWebView label="STO 사장님용 앱 레이아웃 V2 화면">
      <AppHeader
        title={SCREEN_TITLE}
        titleHidden
        leadingElement={<HeaderLogo />}
        trailingElement={<HeaderIcon icon={<RiNotification3Line />} label="알림" />}
      />

      {/* 무엇이 켜져 있는지 하단 표시만으로는 작아서, 지금 고른 메뉴의 이름을 본문 맨 위에 크게
          적는다. 헤더의 제목이 `h1` 이므로 이쪽은 `h2` 다. */}
      <div className="flex flex-1 flex-col gap-4 p-oe-padding-default">
        <div>
          <h2 className="text-3xl font-semibold text-oe-foreground-primary">{currentLabel}</h2>
          {currentContents === undefined ? null : (
            <p className="mt-1 text-sm text-oe-foreground-tertiary">{currentContents.join("·")}</p>
          )}
        </div>
        {/* 한 덩이로 두면 스크롤되는 화면인지 알 수 없다. 목록처럼 여러 줄을 세워 창 높이를 넘게
            채우고, 그 상태에서 헤더가 제자리에 머무는지 확인한다. */}
        <div className="flex flex-col gap-2">
          {Array.from({ length: 12 }, (_, index) => (
            <ScreenSkeleton key={index} className="h-20 shrink-0" />
          ))}
        </div>
      </div>


      <BottomNavigation items={NAVIGATION_ITEMS} value={current} onValueChange={setCurrent} />
    </MobileWebView>
  );
}

/**
 * Main 의 왼쪽에 서는 제품 로고다. 로고를 누르면 홈으로 가지만 이 화면이 그 홈이므로 갈 곳이
 * 없다. 링크로 감싸 두면 눌리는데 아무 일도 일어나지 않으므로 그림으로만 둔다.
 */
function HeaderLogo() {
  return (
    <Image
      src={HEADER_LOGO.src}
      width={HEADER_LOGO.width}
      height={HEADER_LOGO.height}
      alt=""
      priority
      className="h-8 w-auto"
    />
  );
}

/**
 * 헤더에 들어가는 아이콘은 공용 Button 의 Ghost 를 쓴다. 헤더가 자기 버튼을 따로 만들지 않는다.
 * `tone="neutral"` 을 밝혀 적는 이유는 `button.md` 에 있다. 아이콘 크기는 헤더가 정하므로 여기서
 * 적지 않는다.
 */
function HeaderIcon({ icon, label }: { icon: ReactNode; label: string }) {
  return <Button variant="ghost" tone="neutral" controlSize="large" leadingIcon={icon} aria-label={label} />;
}
