import type { ReactNode } from "react";

export type AnatomyLegendItem = {
  name: string;
  optional?: boolean;
};

export function AnatomySurface({ children, ariaLabel, title, className = "" }: { children: ReactNode; ariaLabel: string; title?: string; className?: string }) {
  const visibleTitle = title ?? ariaLabel.replace(/ anatomy$/i, " structure");
  return <div role="img" aria-label={ariaLabel} className={`relative overflow-hidden rounded-t-xl bg-oe-background-secondary ${className}`}><p className="absolute left-5 top-5 z-30 text-xs font-semibold text-oe-foreground-primary">{visibleTitle}</p>{children}</div>;
}

export function AnatomyNumber({ number, className = "", lineClassName = "" }: { number: number; className?: string; lineClassName?: string }) {
  return (
    <span className={`absolute z-20 grid size-5 place-items-center rounded-full bg-oe-foreground-secondary text-[11px] text-oe-foreground-inverse ${className}`}>
      {number}
      {lineClassName ? <span aria-hidden="true" className={`absolute bg-oe-border-primary ${lineClassName}`} /> : null}
    </span>
  );
}

export function AnatomySwapSlot({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`inline-flex items-center justify-center rounded border border-dashed border-pink-400 ${className}`}>{children}</span>;
}

export function AnatomyLegend({ items }: { items: AnatomyLegendItem[] }) {
  return (
    <ol className="flex flex-wrap gap-x-5 gap-y-2 rounded-b-xl bg-oe-background-secondary px-5 pb-5 pt-1 text-left text-xs text-oe-foreground-primary">
      {items.map((item, index) => (
        <li key={`${index}-${item.name}`} className="flex items-baseline gap-1.5">
          <span className="font-semibold">{index + 1}.</span>
          <span>{item.name}</span>
          {item.optional ? <span className="text-oe-foreground-placeholder">(Optional)</span> : null}
        </li>
      ))}
    </ol>
  );
}

export function AnatomyDescription({ children }: { children: ReactNode }) {
  return <div className="mt-4 space-y-2 text-sm leading-6 text-oe-foreground-secondary">{children}</div>;
}
