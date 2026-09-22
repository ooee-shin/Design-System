import type { Metadata } from "next";

import { BrandVariables } from "@/components/brand-variables";
import { ComponentInspector } from "@/components/component-inspector/component-inspector";

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
        {children}
        {/* 모든 화면 아래에 「요청 보기 · 컴포넌트 보기」 막대를 얹는다. 화면 코드는 이것을 모른다. */}
        <ComponentInspector />
      </body>
    </html>
  );
}
