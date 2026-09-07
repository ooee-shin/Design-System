import type { ReactNode } from "react";
import Link from "next/link";
import { RiArrowLeftLine, RiBookOpenLine } from "@remixicon/react";

import { getComponent, type ComponentKey } from "@/components/component-registry";
import { MarkdownView } from "@/components/markdown-view";
import { StudioPreviewFrame } from "@/components/studio-preview-frame";
import { RiArrowRightSLine } from "@remixicon/react";

import { hasDoc, renderDoc } from "@/lib/docs";

export function ComponentDetailPage({ componentKey, children }: { componentKey: ComponentKey; children: ReactNode }) {
  const component = getComponent(componentKey);
  const docSlug = `components/${componentKey}`;
  const spec = hasDoc(docSlug) ? renderDoc(docSlug) : null;

  return (
    <main className="min-h-screen bg-muted/40 px-4 py-5 sm:px-8 sm:py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-5">
        <header className="space-y-2">
          <Link href="/components" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <RiArrowLeftLine className="size-oe-icon-xsmall" aria-hidden="true" />
            Components
          </Link>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{component.title}</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{component.description}</p>
          </div>
          {spec ? (
            <a href="#spec" className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
              <RiBookOpenLine className="size-oe-icon-small" aria-hidden="true" />
              명세 문서 보기
            </a>
          ) : null}
        </header>
        <StudioPreviewFrame>{children}</StudioPreviewFrame>
        {spec ? (
          <section id="spec" aria-labelledby="spec-title" className="scroll-mt-16 rounded-2xl border bg-background p-6 sm:p-8">
            <details className="group">
              <summary className="flex cursor-pointer list-none flex-wrap items-baseline justify-between gap-2 border-b pb-4 [&::-webkit-details-marker]:hidden">
                <span className="flex items-center gap-2">
                  <RiArrowRightSLine aria-hidden="true" className="size-oe-icon-small shrink-0 text-muted-foreground transition-transform group-open:rotate-90" />
                  <h2 id="spec-title" className="text-xl font-semibold tracking-tight">명세 문서</h2>
                </span>
                <Link href={`/docs/${docSlug}`} className="font-mono text-xs text-muted-foreground hover:text-foreground">
                  docs/system/{docSlug}.md
                </Link>
              </summary>
              <div className="mt-5">
                <MarkdownView html={spec.html} />
              </div>
            </details>
          </section>
        ) : null}
      </div>
    </main>
  );
}
