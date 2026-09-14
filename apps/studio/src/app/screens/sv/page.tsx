"use client";

import { useState } from "react";

import { RiHome5Fill, RiCalendarCheckFill, RiTaskFill, RiUser3Fill } from "@remixicon/react";

import { AppHeader, BottomNavigation, type BottomNavigationItem } from "@ooee/ui";

import { PhoneFrame, ScreenExitLink, ScreenPlaceholder } from "@/components/screens/screen-chrome";

/**
 * SV 는 슈퍼바이저와 직원용 앱이다. STO 와 같은 기기 상자를 쓰되 하단 항목이 다르다. 두 앱이
 * 무엇을 공유하고 무엇이 갈리는지는 화면을 만들며 정한다.
 */
const ITEMS: BottomNavigationItem[] = [
  { value: "home", label: "홈", icon: <RiHome5Fill /> },
  { value: "schedule", label: "근무", icon: <RiCalendarCheckFill /> },
  { value: "tasks", label: "업무", icon: <RiTaskFill />, badge: {} },
  { value: "me", label: "내정보", icon: <RiUser3Fill /> },
];

export default function SvScreenPage() {
  const [current, setCurrent] = useState("home");

  return (
    <>
      <PhoneFrame label="SV 슈퍼바이저·직원용 앱 화면">
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
