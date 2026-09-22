// `AppHeader` 는 머무는 동안 아래 경계선을 켜려고 스크롤 위치를 읽으므로 `"use client"` 를 스스로
// 선언하지 않고 소비자 쪽을 전제한다. `Input` 과 같다.
"use client";

import Image from "next/image";
import type { ReactNode } from "react";

import { RiMenuLine, RiNotification3Line } from "@remixicon/react";

import { AppHeader, Button } from "@ooee/ui";

import { MobileWebView, ScreenSkeleton } from "@/components/renewal/screen-chrome";

/**
 * STO 레이아웃. 사장님용 앱이 세로로 어떻게 서는지 확인하는 화면이며, 지금은 맨 위 한 줄만 있다.
 *
 * 헤더는 `app-header.md` 의 화면 유형 가운데 Main 이다. 로고가 어느 화면인지 이미 말하므로 제목
 * 글자를 화면에 두지 않고 `titleHidden` 으로 감춰 이름만 남긴다. 왼쪽에는 나가는 길인 로고가,
 * 오른쪽에는 그 화면에서 하는 일인 알림과 전체메뉴가 선다.
 *
 * 비워 둔 자리: 본문, Bottom Navigation을 쓰는지 여부, 알림·전체메뉴를 눌렀을 때 열리는 것,
 * 그리고 읽지 않은 알림 개수 표시다.
 */

// 이 자리에 설 것은 사용자가 환경설정에 등록하는 제품 로고다. 아직 그 설정과 잇지 않았으므로
// 관리자 웹이 메인 로고로 쓰고 있는 시험용 이미지를 그대로 세워 둔다. 원본은 2120×399 이며
// 헤더 안에서 높이 32px 로 서고 폭은 비율대로 170px 이 된다. 헤더가 56px 이므로 위아래로 12px 씩
// 남는다.
const HEADER_LOGO = { src: "/images/main-logo-sample.png", width: 170, height: 32 };

// 감춘 제목도 그 화면이 무엇인지 말하는 값이어야 한다. 화면 낭독기는 이 값을 읽는다.
const SCREEN_TITLE = "메인";

export default function StoLayoutScreenPage() {
  return (
    <MobileWebView label="STO 사장님용 앱 레이아웃 화면">
      <AppHeader
        title={SCREEN_TITLE}
        titleHidden
        leadingElement={<HeaderLogo />}
        trailingElement={
          <>
            <HeaderIcon icon={<RiNotification3Line />} label="알림" />
            <HeaderIcon icon={<RiMenuLine />} label="전체메뉴" />
          </>
        }
      />

      <ScreenSkeleton className="m-4 flex-1" />
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
 * `tone="neutral"` 을 밝혀 적는 이유는 `button.md` 에 있다. Ghost 도 tone 색을 따라가므로,
 * 중립으로 읽혀야 하는 자리는 기본값에 기대지 않고 적어 둔다.
 */
function HeaderIcon({ icon, label }: { icon: ReactNode; label: string }) {
  return <Button variant="ghost" tone="neutral" controlSize="large" leadingIcon={icon} aria-label={label} />;
}
