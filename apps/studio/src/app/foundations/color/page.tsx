import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { ColorLab } from "@/components/foundations/color-lab";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ColorFoundationPage() {
  return (
    <main className="min-h-screen bg-muted/40 px-4 py-5 sm:px-8 sm:py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="space-y-2">
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-3.5" aria-hidden="true" />
              Foundations
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight">Brand color lab</h1>
                <span className="rounded-full border bg-background px-2 py-0.5 text-[11px] text-muted-foreground">
                  Provisional
                </span>
              </div>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                Seed color에서 HCT primitive와 oe semantic mapping 후보를 생성하고 Light/Dark에서 비교합니다.
              </p>
            </div>
          </div>
          <a
            href="https://github.com/material-foundation/material-color-utilities"
            target="_blank"
            rel="noreferrer"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "self-start")}
          >
            HCT library
            <ExternalLink data-icon="inline-end" />
          </a>
        </header>

        <ColorLab />
      </div>
    </main>
  );
}
