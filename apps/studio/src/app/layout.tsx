import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ooee UI Studio",
  description: "외부 UI를 검수하고 oe 자산으로 발전시키는 작업 공간",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
