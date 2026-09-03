"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RiMoonLine, RiSunLine } from "@remixicon/react";

import { cn } from "@/lib/utils";
import { useStudioPreferences } from "@/components/studio-preferences-provider";

const destinations: Array<{ href: string; label: string; matchPrefix?: string }> = [
  { href: "/", label: "Home" },
  { href: "/foundations", label: "Foundations" },
  { href: "/components", label: "Components" },
  { href: "/examples", label: "Examples" },
  { href: "/docs", label: "Docs" },
];

export function StudioNavigation() {
  const pathname = usePathname();
  const { theme, locale, viewport, setTheme, setLocale, setViewport } = useStudioPreferences();
  const isComponentDetail = /^\/components\/[^/]+$/.test(pathname);

  return (
    <>
      {isComponentDetail ? (
        <a href="#studio-preview" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-lg focus:bg-oe-background-primary focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-oe-foreground-primary focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-oe-focus-ring">
          Playground로 바로 이동
        </a>
      ) : null}
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur" aria-label="Studio 화면 이동">
      <div className="mx-auto flex h-12 max-w-6xl items-center gap-4 px-4 sm:px-8">
        <Link href="/" className="shrink-0 py-3 text-sm font-semibold tracking-tight">
          ooee <span className="font-normal text-muted-foreground">Studio</span>
        </Link>
        <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto py-2">
          {destinations.map(({ href, label, matchPrefix }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href) || Boolean(matchPrefix && pathname.startsWith(matchPrefix));

            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
                  active && "bg-muted text-foreground",
                )}
              >
                {label}
              </Link>
            );
          })}
        </div>
        <div className="flex shrink-0 items-center gap-1.5" aria-label="Studio 검수 설정">
          <div className="flex rounded-lg bg-muted p-0.5" aria-label="검수 화면 크기">
            <PreferenceButton active={viewport === "desktop"} onClick={() => setViewport("desktop")} label="PC 화면">PC</PreferenceButton>
            <PreferenceButton active={viewport === "tablet"} onClick={() => setViewport("tablet")} label="Tablet 화면">TB</PreferenceButton>
            <PreferenceButton active={viewport === "mobile"} onClick={() => setViewport("mobile")} label="Mobile 화면">MB</PreferenceButton>
          </div>
          <div className="flex rounded-lg bg-muted p-0.5" aria-label="모드">
            <PreferenceButton active={theme === "light"} onClick={() => setTheme("light")} label="라이트 모드">
              <RiSunLine className="size-3.5" aria-hidden="true" />
            </PreferenceButton>
            <PreferenceButton active={theme === "dark"} onClick={() => setTheme("dark")} label="다크 모드">
              <RiMoonLine className="size-3.5" aria-hidden="true" />
            </PreferenceButton>
          </div>
          <div className="flex rounded-lg bg-muted p-0.5" aria-label="언어">
            <PreferenceButton active={locale === "ko"} onClick={() => setLocale("ko")} label="한국어">KO</PreferenceButton>
            <PreferenceButton active={locale === "en"} onClick={() => setLocale("en")} label="English">EN</PreferenceButton>
          </div>
        </div>
      </div>
      </nav>
    </>
  );
}

function PreferenceButton({ active, onClick, label, children }: { active: boolean; onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button type="button" aria-label={label} aria-pressed={active} onClick={onClick} className={cn("inline-flex h-7 min-w-7 items-center justify-center rounded-md px-1.5 text-[11px] font-medium text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring", active && "bg-background text-foreground shadow-xs")}>
      {children}
    </button>
  );
}
