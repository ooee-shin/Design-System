import Link from "next/link";
import { RiArrowLeftLine, RiArrowRightLine } from "@remixicon/react";

export type AssetGroupItem = {
  title: string;
  description: string;
  href: string;
  /** 결정이 아직 확정되지 않은 자산에만 표시한다. 컴포넌트 등급이 아니라 결정의 확정 여부다. */
  status?: "Provisional";
};

/**
 * `density`는 카드 그리드에만 적용한다. 페이지 여백과 헤더 간격은 밀도와 무관하게 다른 화면과 같게 유지해야
 * 화면을 옮길 때 위아래로 밀리지 않는다.
 */
export function AssetGroupPage({ title, description, items, density = "default" }: { title: string; description: string; items: AssetGroupItem[]; density?: "default" | "compact" }) {
  const compact = density === "compact";

  return (
    <main className="min-h-screen bg-muted/40 px-4 py-5 sm:px-8 sm:py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-7">
        <header className="space-y-3">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <RiArrowLeftLine className="size-oe-icon-xsmall" aria-hidden="true" />
            Home
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
        </header>
        <section aria-label={`${title} 목록`} className={`grid gap-3 ${compact ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "md:grid-cols-2"}`}>
          {items.map((item) => (
            <Link key={item.href} href={item.href} className={`group flex flex-col justify-between border bg-background outline-none transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring ${compact ? "rounded-xl p-4" : "min-h-44 rounded-2xl p-5"}`}>
              <div>
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-semibold tracking-tight">{item.title}</h2>
                  {item.status ? <span className="shrink-0 rounded-full border bg-background px-2 py-0.5 text-[11px] text-muted-foreground">{item.status}</span> : null}
                </div>
                {!compact ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p> : null}
              </div>
              <div className={`flex items-center justify-end gap-3 ${compact ? "mt-3" : "mt-6"}`}>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
                  열기
                  <RiArrowRightLine className="size-oe-icon-xsmall transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
