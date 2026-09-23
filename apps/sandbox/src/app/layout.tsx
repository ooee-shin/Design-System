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
        {/* 화면 위에 「보기 폭」(웹·태블릿·모바일) 전환을 둔다. 태블릿·모바일은 그 폭의 액자로 같은 주소를 연다. */}
        <ViewportFrame>{children}</ViewportFrame>
        {/* 모든 화면 아래에 「요청 보기 · 컴포넌트 보기」 막대를 얹는다. 화면 코드는 이것을 모른다. */}
        <ComponentInspector />
      </body>
    </html>
  );
}
