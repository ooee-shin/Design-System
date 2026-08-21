"use client";

import { Download, FileText } from "lucide-react";

import { cn } from "@/lib/utils";

export function MessageFileAttachment({ className }: { className?: string }) {
  return (
    <div className={cn("flex w-56 max-w-full min-w-0 items-center gap-2 rounded-xl bg-oe-background-primary p-2.5 text-oe-foreground-primary ring-1 ring-oe-border-secondary", className)}>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-oe-background-secondary text-oe-foreground-secondary">
        <FileText className="size-4" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-medium">message-spec.pdf</span>
        <span className="block text-[11px] text-oe-foreground-tertiary">PDF · 2.4 MB</span>
      </span>
      <button type="button" className="oe-hover-layer rounded-lg p-2 text-oe-foreground-tertiary outline-none hover:text-oe-foreground-primary focus-visible:ring-2 focus-visible:ring-oe-focus-ring" aria-label="message-spec.pdf 다운로드">
        <Download className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
