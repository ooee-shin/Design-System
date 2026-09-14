"use client";

import { useState } from "react";

import { RiHome5Fill, RiBarChartFill, RiFileList3Fill, RiUser3Fill } from "@remixicon/react";

import { AppHeader, BottomNavigation, type BottomNavigationItem } from "@ooee/ui";

import { PhoneFrame, ScreenExitLink, ScreenPlaceholder } from "@/components/screens/screen-chrome";

/**
 * STO 는 사장님용 앱이다. 웹에서 볼 때는 실제 기기 폭과 높이만큼만 차지한다. 위의 AppHeader 와
 * 아래의 BottomNavigation 이 제자리에 머물고 가운데만 스크롤된다.
 */
const ITEMS: BottomNavigationItem[] = [
  { value: "home", label: "홈", icon: <RiHome5Fill /> },
  { value: "sales", label: "매출", icon: <RiBarChartFill /> },
  { value: "orders", label: "주문", icon: <RiFileList3Fill /> },
  { value: "me", label: "내정보", icon: <RiUser3Fill /> },
];

export default function StoScreenPage() {
  const [current, setCurrent] = useState("home");

  return (
    <>
      <PhoneFrame label="STO 사장님용 앱 화면">
        <AppHeader title="홈" sticky />

        <main className="flex-1 overflow-y-auto p-4">
          <ScreenPlaceholder name="Content" className="min-h-[140%]" />
        </main>

        <BottomNavigation value={current} items={ITEMS} onValueChange={setCurrent} />
      </PhoneFrame>

      <ScreenExitLink />
    </>
  );
}
