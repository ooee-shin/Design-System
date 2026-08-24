import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { createCoreSemanticCssVariables } from "@ooee/tokens";

import { StudioNavigation } from "@/components/studio-navigation";
import { BrandThemeProvider } from "@/components/brand-theme-provider";
import { StudioPreferencesProvider } from "@/components/studio-preferences-provider";

import "./globals.css";

export const metadata: Metadata = {
  title: "ooee UI Studio",
  description: "외부 UI를 검수하고 oe 자산으로 발전시키는 작업 공간",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased" style={createCoreSemanticCssVariables("light") as CSSProperties}>
      <body className="min-h-full">
        <BrandThemeProvider>
          <StudioPreferencesProvider>
            <StudioNavigation />
            {children}
          </StudioPreferencesProvider>
        </BrandThemeProvider>
      </body>
    </html>
  );
}
