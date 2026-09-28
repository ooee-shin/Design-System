import type { Metadata } from "next";

import { BrandVariables } from "@/components/brand-variables";
import { ComponentInspector } from "@/components/component-inspector/component-inspector";
import { ViewportFrame } from "@/components/viewport-frame/viewport-frame";

import "./globals.css";

export const metadata: Metadata = {
  title: "ooee sandbox",
  description: "/generate-code 가 만든 화면을 확인하는 자리",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full">
        <BrandVariables />
        {/* 화면 위에 「보기 폭」(웹·태블릿·모바일) 전환을 둔다. 세 폭 모두 그 크기의 액자로 같은 주소를 연다.
            「요청 보기 · 컴포넌트 보기」 막대는 화면과 같은 자리에 둔다 — 액자 안에서는 액자 안의 막대가 그
            화면을 세고, 액자 밖에서는 그리지 않는다. 밖에 두면 액자만 보여 늘 0 개로 센다. 화면 코드는 둘 다 모른다. */}
        <ViewportFrame>
          {children}
          <ComponentInspector />
        </ViewportFrame>
      </body>
    </html>
  );
}
