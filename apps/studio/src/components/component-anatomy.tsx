import { Fragment, type CSSProperties, type ReactNode } from "react";

export type AnatomyLegendItem = {
  name: string;
  optional?: boolean;
};

export type AnatomyStructureLine = {
  prefix?: string;
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

export function AnatomySwapSlot({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return <span aria-hidden="true" className={`inline-flex size-4 items-center justify-center rounded border border-dashed border-pink-400 bg-pink-50 dark:bg-pink-950 ${className}`}>{children}</span>;
}

export function AnatomyBoundaryMarker({
  number,
  side,
  connectorLength,
  boundaryLength,
  className = "",
}: {
  number: number;
  side: "left" | "right" | "top" | "bottom";
  connectorLength: number;
  boundaryLength: number;
  className?: string;
}) {
  const horizontal = side === "left" || side === "right";
  const connectorStyle: CSSProperties = horizontal
    ? { width: connectorLength, height: 1, top: "50%", [side]: 20 }
    : { width: 1, height: connectorLength, left: "50%", [side]: 20 };
  const boundaryStyle: CSSProperties = horizontal
    ? { width: 1, height: boundaryLength, top: "50%", transform: "translateY(-50%)", [side]: 20 + connectorLength }
    : { width: boundaryLength, height: 1, left: "50%", transform: "translateX(-50%)", [side]: 20 + connectorLength };

  return (
    <span className={`absolute z-20 grid size-5 place-items-center rounded-full bg-oe-foreground-secondary text-[11px] text-oe-foreground-inverse ${className}`}>
      {number}
      <span aria-hidden="true" data-slot="anatomy-boundary-connector" className="absolute bg-oe-border-primary" style={connectorStyle} />
      <span aria-hidden="true" data-slot="anatomy-boundary-line" className="absolute bg-oe-border-primary" style={boundaryStyle} />
    </span>
  );
}

export function AnatomyLegend({ items, start = 1 }: { items: AnatomyLegendItem[]; start?: number }) {
  return (
    <ol className="flex flex-wrap gap-x-5 gap-y-2 rounded-b-xl bg-oe-background-secondary px-5 pb-5 pt-1 text-left text-xs text-oe-foreground-primary">
      {items.map((item, index) => (
        <li key={`${index}-${item.name}`} className="flex items-baseline gap-1.5">
          <span className="font-semibold">{index + start}.</span>
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

export function AnatomyStructureMap({ lines }: { lines: AnatomyStructureLine[] }) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-oe-foreground-primary">Structure map</h4>
      <pre className="mt-3 overflow-x-auto rounded-lg bg-oe-background-secondary p-4 text-xs leading-6">
        <code>
          {lines.map((line, index) => (
            <Fragment key={`${line.prefix ?? ""}-${line.name}`}>
              {line.prefix ? <span className="text-oe-foreground-placeholder">{line.prefix}</span> : null}
              <span className="text-oe-foreground-secondary">{line.name}</span>
              {line.optional ? <span className="text-oe-foreground-placeholder"> (Optional)</span> : null}
              {index < lines.length - 1 ? "\n" : null}
            </Fragment>
          ))}
        </code>
      </pre>
    </div>
  );
}
