import Link from "next/link";
import { notFound } from "next/navigation";
import { RiArrowLeftLine } from "@remixicon/react";

import { MarkdownView } from "@/components/markdown-view";
import { docSlugs, hasDoc, renderDoc } from "@/lib/docs";

export function generateStaticParams() {
  return docSlugs().map((slug) => ({ slug: slug.split("/") }));
}

export default async function DocPage({ params }: PageProps<"/docs/[...slug]">) {
  const { slug: segments } = await params;
  const slug = segments.join("/");
  if (!hasDoc(slug)) notFound();

  const { title, html } = renderDoc(slug);

  return (
    <main className="min-h-screen bg-muted/40 px-4 py-5 sm:px-8 sm:py-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-5">
        <header className="space-y-2">
          <Link href="/docs" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <RiArrowLeftLine className="size-oe-icon-xsmall" aria-hidden="true" />
            Docs
          </Link>
          <p className="font-mono text-xs text-muted-foreground">docs/system/{slug}.md</p>
        </header>
        <article aria-label={title} className="rounded-2xl border bg-background p-6 sm:p-8">
          <MarkdownView html={html} />
        </article>
      </div>
    </main>
  );
}
