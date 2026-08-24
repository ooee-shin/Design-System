"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type PageSection = { id: string; label: string };
type RelatedItem = { href: string; title: string; description: string };

export function OnThisPage({ items, relatedItems = [] }: { items: PageSection[]; relatedItems?: RelatedItem[] }) {
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
  const activeRailStyle = {
    height: `${(lastActiveIndex - firstActiveIndex) * 32 + 28}px`,
    transform: `translateY(${firstActiveIndex * 32}px)`,
  };

  return (
    <nav aria-label="On this page" className="sticky top-20 hidden self-start pl-5 @min-[1120px]:block">
      <h2 className="text-xs font-semibold text-oe-foreground-primary">On this page</h2>
      <ol className="relative mt-3 space-y-1 border-l border-oe-border-secondary">
        <span aria-hidden="true" style={activeRailStyle} className="pointer-events-none absolute -left-px top-0 w-0.5 bg-oe-border-bold-primary transition-[transform,height,opacity] duration-300 ease-out motion-reduce:transition-none" />
        {items.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`} className={`group block pl-3 text-xs transition-colors hover:text-oe-foreground-primary ${activeIds.includes(item.id) ? "font-medium text-oe-foreground-primary" : "text-oe-foreground-tertiary"}`}><span className="inline-block rounded-md px-2 py-1.5 transition-colors group-hover:bg-oe-interaction-hover">{item.label}</span></a>
          </li>
        ))}
      </ol>
      {relatedItems.length > 0 ? (
        <div className="mt-5 rounded-lg bg-oe-background-secondary p-3">
          <h3 className="text-[11px] font-medium text-oe-foreground-tertiary">Related</h3>
          <ul className="mt-2 space-y-1">
            {relatedItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="group flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-xs text-oe-foreground-tertiary transition-colors hover:bg-oe-interaction-hover hover:text-oe-foreground-primary">
                  <span>{item.title}</span><span className="text-oe-foreground-placeholder transition-transform group-hover:translate-x-0.5" aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </nav>
  );
}
