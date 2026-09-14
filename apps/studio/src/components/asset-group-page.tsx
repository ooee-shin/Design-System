import Link from "next/link";
import { RiArrowLeftLine, RiArrowRightLine } from "@remixicon/react";

export type AssetGroupItem = {
  title: string;
  description: string;
  /** 열 화면이 없는 자산은 갖지 않는다. 링크 대신 「준비 중」을 표시한다. */
  href?: string;
  /** 결정이 아직 확정되지 않은 자산에만 표시한다. 컴포넌트 등급이 아니라 결정의 확정 여부다. */
  status?: "Provisional";
  /** `groups`를 함께 넘길 때 어느 묶음에 속하는지 가리킨다. */
  group?: string;
};

/** 목록을 묶음으로 나눌 때 각 묶음의 이름과 그 묶음이 무엇인지 한 줄로 설명한다. 화면에 나오는 순서는 이 배열의 순서다. */
export type AssetGroup = { name: string; description: string };

/**
 * `density`는 카드 그리드에만 적용한다. 페이지 여백과 헤더 간격은 밀도와 무관하게 다른 화면과 같게 유지해야
 * 화면을 옮길 때 위아래로 밀리지 않는다.
 */
export function AssetGroupPage({ title, description, items, density = "default", groups }: { title: string; description: string; items: AssetGroupItem[]; density?: "default" | "compact"; groups?: AssetGroup[] }) {
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
        {groups ? (
          groups.map((group) => (
            <section key={group.name} aria-labelledby={`group-${group.name}`} className="space-y-3">
              <div>
                <h2 id={`group-${group.name}`} className="text-base font-semibold tracking-tight">
                  {group.name}
                </h2>
                <p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground">{group.description}</p>
              </div>
              <AssetCardGrid items={items.filter((item) => item.group === group.name)} compact={compact} headingLevel="h3" />
            </section>
          ))
        ) : (
          <section aria-label={`${title} 목록`}>
            <AssetCardGrid items={items} compact={compact} headingLevel="h2" />
          </section>
        )}
      </div>
    </main>
  );
}

function AssetCardGrid({ items, compact, headingLevel }: { items: AssetGroupItem[]; compact: boolean; headingLevel: "h2" | "h3" }) {
  return (
    <div className={`grid gap-3 ${compact ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "md:grid-cols-2"}`}>
      {items.map((item) => (
        <AssetCard key={item.title} item={item} compact={compact} headingLevel={headingLevel} />
      ))}
    </div>
  );
}

function AssetCard({ item, compact, headingLevel: Heading }: { item: AssetGroupItem; compact: boolean; headingLevel: "h2" | "h3" }) {
  const shape = compact ? "rounded-xl p-4" : "min-h-44 rounded-2xl p-5";

  const body = (
    <>
      <div>
        <div className="flex items-start justify-between gap-3">
          <Heading className="font-semibold tracking-tight">{item.title}</Heading>
          {item.status ? <span className="shrink-0 rounded-full border bg-background px-2 py-0.5 text-[11px] text-muted-foreground">{item.status}</span> : null}
        </div>
        {!compact ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p> : null}
      </div>
      <div className={`flex items-center justify-end gap-3 ${compact ? "mt-3" : "mt-6"}`}>
        {item.href ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
            열기
            <RiArrowRightLine className="size-oe-icon-xsmall transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground">준비 중</span>
        )}
      </div>
    </>
  );

  if (!item.href) {
    return <div className={`flex flex-col justify-between border bg-muted/30 text-muted-foreground ${shape}`}>{body}</div>;
  }

  return (
    <Link href={item.href} className={`group flex flex-col justify-between border bg-background outline-none transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring ${shape}`}>
      {body}
    </Link>
  );
}
