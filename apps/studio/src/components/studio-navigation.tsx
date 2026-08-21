"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const destinations = [
  { href: "/", label: "Home" },
  { href: "/experiments/inbox-split-view", label: "Inbox" },
  { href: "/components/message-bubble", label: "Chat" },
  { href: "/foundations/color", label: "Color" },
];

export function StudioNavigation() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur" aria-label="Studio 화면 이동">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 sm:px-8">
        <Link href="/" className="shrink-0 py-3 text-sm font-semibold tracking-tight">
          ooee <span className="font-normal text-muted-foreground">Studio</span>
        </Link>
        <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto py-2">
          {destinations.map(({ href, label }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

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
      </div>
    </nav>
  );
}
