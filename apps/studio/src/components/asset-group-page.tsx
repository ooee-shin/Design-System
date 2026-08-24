import Link from "next/link";
import { RiArrowLeftLine, RiArrowRightLine } from "@remixicon/react";

export type AssetGroupItem = {
  title: string;
  description: string;
  href: string;
  maturity: "Experiment" | "Candidate" | "Provisional" | "Stable";
};

export function AssetGroupPage({ title, description, items }: { title: string; description: string; items: AssetGroupItem[] }) {
  return (
    <main className="min-h-screen bg-muted/40 px-4 py-5 sm:px-8 sm:py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-7">
        <header className="space-y-3">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <RiArrowLeftLine className="size-3.5" aria-hidden="true" />
            Home
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
        </header>
        <section aria-label={`${title} 목록`} className="grid gap-3 md:grid-cols-2">
          {items.map((item) => (
            <Link key={item.href} href={item.href} className="group flex min-h-44 flex-col justify-between rounded-2xl border bg-background p-5 outline-none transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-semibold tracking-tight">{item.title}</h2>
                  <span className="shrink-0 rounded-full border bg-background px-2 py-0.5 text-[11px] text-muted-foreground">{item.maturity}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
              </div>
              <span className="mt-6 inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
                열기
                <RiArrowRightLine className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
