"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getComponentRelations, type ComponentKey } from "@/components/component-registry";

type PageSection = { id: string; label: string };
type RelatedItem = { href: string; title: string; description: string };

export function OnThisPage({ items, componentKey, similarItems, worksWithItems }: { items: PageSection[]; componentKey?: ComponentKey; similarItems?: RelatedItem[]; worksWithItems?: RelatedItem[] }) {
  const registryRelations = componentKey ? getComponentRelations(componentKey) : { similarItems: [], worksWithItems: [] };
  const resolvedSimilarItems = similarItems ?? registryRelations.similarItems;
  const resolvedWorksWithItems = worksWithItems ?? registryRelations.worksWithItems;
  const [activeIds, setActiveIds] = useState<string[]>(items[0] ? [items[0].id] : []);

  useEffect(() => {
    const sections = items.map(({ id }) => document.getElementById(id)).filter((section): section is HTMLElement => Boolean(section));
    const visibleIds = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => entry.isIntersecting ? visibleIds.add(entry.target.id) : visibleIds.delete(entry.target.id));
        const nextActiveIds = items.map(({ id }) => id).filter((id) => visibleIds.has(id));
        if (nextActiveIds.length > 0) setActiveIds(nextActiveIds);
      },
      { rootMargin: "-96px 0px -55% 0px", threshold: 0 },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [items]);

  const activeIndexes = activeIds.map((id) => items.findIndex((item) => item.id === id)).filter((index) => index >= 0);
  const firstActiveIndex = activeIndexes.length > 0 ? Math.min(...activeIndexes) : 0;
  const lastActiveIndex = activeIndexes.length > 0 ? Math.max(...activeIndexes) : 0;
  /** 측정 전 첫 프레임에만 쓰는 한 줄 기준 높이다. 라벨이 접히면 실제 높이는 이보다 커진다. */
  const fallbackRailStyle = {
    height: `${(lastActiveIndex - firstActiveIndex) * 32 + 28}px`,
    transform: `translateY(${firstActiveIndex * 32}px)`,
  };
  const listRef = useRef<HTMLOListElement>(null);
  const [measuredRailStyle, setMeasuredRailStyle] = useState<{ height: string; transform: string }>();

  // 항목 높이는 라벨이 몇 줄로 접히는지에 따라 달라진다. 순서에 고정 높이를 곱하면
  // Presentation 처럼 제목이 긴 목차에서 표시선이 짧아지고 위치가 밀린다.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measure = () => {
      const entries = list.querySelectorAll("li");
      const first = entries[firstActiveIndex];
      const last = entries[lastActiveIndex];
      if (!first || !last) return;
      setMeasuredRailStyle({
        height: `${last.offsetTop + last.offsetHeight - first.offsetTop}px`,
        transform: `translateY(${first.offsetTop}px)`,
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, [firstActiveIndex, lastActiveIndex, items]);

  return (
    <nav aria-label="On this page" className="sticky top-20 hidden max-h-[calc(100vh-6rem)] self-start overflow-y-auto pl-5 @min-[1120px]:block">
      <h2 className="text-xs font-semibold text-oe-foreground-primary">On this page</h2>
      <ol ref={listRef} className="relative mt-3 space-y-1 border-l border-oe-border-secondary">
        <span aria-hidden="true" style={measuredRailStyle ?? fallbackRailStyle} className="pointer-events-none absolute -left-px top-0 w-0.5 bg-oe-border-bold-primary transition-[transform,height,opacity] duration-300 ease-out motion-reduce:transition-none" />
        {items.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`} className={`group block pl-3 text-xs transition-colors hover:text-oe-foreground-primary ${activeIds.includes(item.id) ? "font-medium text-oe-foreground-primary" : "text-oe-foreground-tertiary"}`}><span className="inline-block rounded-md px-2 py-1.5 transition-colors group-hover:bg-oe-interaction-hover">{item.label}</span></a>
          </li>
        ))}
      </ol>
      {resolvedSimilarItems.length > 0 || resolvedWorksWithItems.length > 0 ? (
        <div className="mt-5 rounded-lg bg-oe-background-secondary p-3">
          <div className="space-y-4">
            <RelatedGroup title="Similar" items={resolvedSimilarItems} />
            <RelatedGroup title="Works with" items={resolvedWorksWithItems} />
          </div>
        </div>
      ) : null}
    </nav>
  );
}

function RelatedGroup({ title, items }: { title: string; items: RelatedItem[] }) {
  if (items.length === 0) return null;

  return (
    <div>
      <h4 className="px-2 text-[10px] font-medium uppercase tracking-wide text-oe-foreground-placeholder">{title}</h4>
      <ul className="mt-1 space-y-1">
        {items.map((item) => (
          <li key={item.href}>
            <Link href={item.href} title={item.description} className="group flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-xs text-oe-foreground-tertiary transition-colors hover:bg-oe-interaction-hover hover:text-oe-foreground-primary">
              <span>{item.title}</span><span className="text-oe-foreground-placeholder transition-transform group-hover:translate-x-0.5" aria-hidden="true">→</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
