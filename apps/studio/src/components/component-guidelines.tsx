import type { ReactNode } from "react";
import { RiCheckboxCircleFill, RiCloseCircleFill } from "@remixicon/react";

import { GuidelineTitle } from "@/components/guideline-title";

export function GuideVisual({ label, children, contentClassName }: { label: string; children: ReactNode; contentClassName?: string }) {
  return <div className="flex h-full flex-col rounded-xl bg-oe-background-secondary p-4"><p className="mb-3 text-xs font-semibold text-oe-foreground-primary">{label}</p><div className={`flex flex-1 items-center *:min-w-0 *:flex-1 rounded-lg border border-oe-border-secondary bg-oe-background-primary ${contentClassName ?? "px-4 py-6"}`}>{children}</div></div>;
}

export function GuidelineList({ items, className = "mt-3" }: { items: ReactNode[]; className?: string }) {
  return <ul className={`space-y-1 px-1 text-sm leading-6 text-oe-foreground-secondary ${className}`}>{items.map((item, index) => <li key={index} className="flex items-start gap-2"><span className="mt-[10px] size-[3px] shrink-0 rounded-full bg-oe-foreground-placeholder" aria-hidden="true" /><span>{item}</span></li>)}</ul>;
}

export function TargetArea({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={`relative inline-flex items-center pr-16 ${className}`}>
      {children}
      <span className="pointer-events-none absolute inset-y-0 right-12 w-px bg-violet-500" aria-hidden="true">
        <span className="absolute -left-1 top-0 h-px w-2 bg-violet-500" />
        <span className="absolute -bottom-px -left-1 h-px w-2 bg-violet-500" />
      </span>
      <span className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold leading-4 text-violet-700 dark:bg-violet-950 dark:text-violet-200" aria-hidden="true">{label}</span>
    </div>
  );
}

export function DeferredChoice({ control, cancelLabel, submitLabel }: { control: ReactNode; cancelLabel: string; submitLabel: string }) {
  return (
    <div className="w-full">
      {control}
      <div className="mt-6 flex justify-end gap-2">
        <button type="button" className="h-8 rounded-lg border border-oe-border-secondary px-3 text-xs font-medium text-oe-foreground-secondary">{cancelLabel}</button>
        <button type="button" className="h-8 rounded-lg bg-oe-background-bold-primary px-3 text-xs font-medium text-oe-foreground-inverse">{submitLabel}</button>
      </div>
    </div>
  );
}

export function UsageComparison({ title, doText, dontText, description, doVisual, dontVisual, dontFirst = false }: { title: string; doText: ReactNode; dontText: ReactNode; description: ReactNode[]; doVisual: ReactNode; dontVisual: ReactNode; dontFirst?: boolean }) {
  const firstVisual = dontFirst ? dontVisual : doVisual;
  const secondVisual = dontFirst ? doVisual : dontVisual;
  const firstFeedback = dontFirst ? <Feedback tone="dont">{dontText}</Feedback> : <Feedback tone="do">{doText}</Feedback>;
  const secondFeedback = dontFirst ? <Feedback tone="do">{doText}</Feedback> : <Feedback tone="dont">{dontText}</Feedback>;

  return (
    <div>
      <GuidelineTitle>{title}</GuidelineTitle>
      <div className="mt-3 grid gap-3 @min-[720px]:grid-cols-2">
        <GuideSurface className="order-1 @min-[720px]:col-start-1 @min-[720px]:row-start-1">{firstVisual}</GuideSurface>
        <GuideSurface className="order-3 @min-[720px]:col-start-2 @min-[720px]:row-start-1">{secondVisual}</GuideSurface>
        <div className="order-2 @min-[720px]:col-start-1 @min-[720px]:row-start-2">{firstFeedback}</div>
        <div className="order-4 @min-[720px]:col-start-2 @min-[720px]:row-start-2">{secondFeedback}</div>
        <div className="order-5 @min-[720px]:col-span-2 @min-[720px]:row-start-3"><GuidelineList items={description} /></div>
      </div>
    </div>
  );
}

function GuideSurface({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl bg-oe-background-secondary p-4 ${className}`}><div className="flex items-center *:min-w-0 *:flex-1 rounded-lg border border-oe-border-secondary bg-oe-background-primary px-4 py-6">{children}</div></div>;
}

function Feedback({ tone, children }: { tone: "do" | "dont"; children: ReactNode }) {
  const isDo = tone === "do";
  return <div className={`flex h-full gap-2 rounded-xl p-3 ${isDo ? "bg-oe-success-background-primary text-oe-success-foreground-primary" : "bg-oe-danger-background-primary text-oe-danger-foreground-primary"}`}>{isDo ? <RiCheckboxCircleFill className="mt-0.5 size-oe-icon-small shrink-0 text-oe-success-foreground-secondary" aria-hidden="true" /> : <RiCloseCircleFill className="mt-0.5 size-oe-icon-small shrink-0 text-oe-danger-foreground-secondary" aria-hidden="true" />}<div><p className="text-xs font-semibold">{isDo ? "Do" : "Don’t"}</p><p className="mt-0.5 text-sm leading-6">{children}</p></div></div>;
}
