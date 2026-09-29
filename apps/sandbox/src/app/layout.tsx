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
            「요청 보기 · 컴포넌트 보기」 단추는 그 막대의 **맨 왼쪽**에 들어간다(`tools`, 2026-09-29 개발자) —
            전에는 화면과 같은 자리(액자 안)에서 아래에 알약 막대로 떠 화면을 가렸다. 액자 밖에서 그리는 대신
            세는 대상만 액자 안 문서로 돌리고(`iframe[data-sandbox-frame]` 의 contentDocument), 테두리는
            portal 로 액자 안 body 에 그린다. 그래서 밖에 두어도 0 개로 세지 않는다. 열린 판(`aside`)은 막대
            안이 아니라 portal 로 액자 밖 `document.body` 에 나간다 — 판이 막대의 자손이면 `role="toolbar"` 가
            판의 `nav` 와 링크까지 담는다. 화면 코드는 둘 다 모른다. */}
        <ViewportFrame tools={<ComponentInspector />}>{children}</ViewportFrame>
      </body>
    </html>
  );
}
