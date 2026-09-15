import type { Metadata } from "next";

import { BrandVariables } from "@/components/brand-variables";

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
      </body>
    </html>
  );
}
