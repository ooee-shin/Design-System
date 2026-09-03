import type { Metadata } from "next";

import { StudioNavigation } from "@/components/studio-navigation";
import { BrandThemeProvider } from "@/components/brand-theme-provider";
import { StudioPreferencesProvider } from "@/components/studio-preferences-provider";

import "./globals.css";

export const metadata: Metadata = {
  title: "ooee UI Studio",
  description: "외부 UI를 검수하고 oe 자산으로 발전시키는 작업 공간",
};

const brandThemeBootstrap = `try{const cached=JSON.parse(localStorage.getItem("ooee-brand-theme-css")||"null");if(cached&&typeof cached==="object"){for(const [property,value] of Object.entries(cached)){if(property.startsWith("--brand-")||property.startsWith("--oe-brand-")){document.documentElement.style.setProperty(property,String(value))}}}}catch{}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: brandThemeBootstrap }} /></head>
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
