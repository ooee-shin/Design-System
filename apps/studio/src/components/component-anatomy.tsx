"use client";

import { Fragment, createContext, useCallback, useContext, useEffect, useId, useLayoutEffect, useMemo, useState, type ReactNode } from "react";

import {
  computeBoundaryPlacement,
  computeMarkerPlacement,
  computeRailPosition,
  pickTextTarget,
  pickWrappingTarget,
  shrinkToTextLine,
  type AnatomyBox,
  type AnatomySide,
} from "./anatomy-placement";
import { cn } from "@/lib/utils";

export type AnatomyLegendItem = {
  name: string;
  optional?: boolean;
};

export type AnatomyStructureLine = {
  prefix?: string;
  name: string;
  optional?: boolean;
};

const MARKER_SIZE = 20;
const DEFAULT_GAP = 24;
const DEFAULT_CONNECTOR_LENGTH = 24;
const DEFAULT_CLEARANCE = 12;
const TEXT_TARGET_PREFIX = "text:";
const WRAPS_TARGET_PREFIX = "wraps:";
const ORIGIN: AnatomyBox = { left: 0, top: 0, width: 0, height: 0 };

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

function ownTextOf(element: Element) {
  return Array.from(element.childNodes)
    .filter((node) => node.nodeType === 3)
    .map((node) => node.textContent ?? "")
    .join("");
}

/**
 * `target`은 프레임 안에서 대상을 찾는 방법이다. 세 가지를 쓸 수 있다.
 * - `[data-slot=checkbox]`처럼 구현이 이미 갖고 있는 CSS selector
 * - `text:Label`처럼 화면에 보이는 요소 명칭. selector로 짚을 표시가 없는 글자 요소에 쓴다.
 * - `wraps:Label,Bottom Description`처럼 품고 있는 부품으로 정의하는 Container. 클래스 이름에 기대지 않는다.
 */
function resolveAnatomyTarget(frame: HTMLElement, target: string): HTMLElement | null {
  if (target.startsWith(TEXT_TARGET_PREFIX)) {
    const needle = target.slice(TEXT_TARGET_PREFIX.length);
    const candidates: Array<{ node: HTMLElement; ownText: string; depth: number }> = [];
    const collect = (element: HTMLElement, depth: number) => {
      for (const child of Array.from(element.children)) {
        if (!(child instanceof HTMLElement)) continue;
        if (child.dataset.anatomyMarker !== undefined) continue;
        candidates.push({ node: child, ownText: ownTextOf(child), depth });
        collect(child, depth + 1);
      }
    };
    collect(frame, 1);
    return pickTextTarget(candidates, needle)?.node ?? null;
  }

  if (target.startsWith(WRAPS_TARGET_PREFIX)) {
    const needles = target.slice(WRAPS_TARGET_PREFIX.length).split(",").map((part) => part.trim()).filter(Boolean);
    const candidates: Array<{ node: HTMLElement; texts: string[]; depth: number }> = [];
    const collect = (element: HTMLElement, depth: number) => {
      for (const child of Array.from(element.children)) {
        if (!(child instanceof HTMLElement)) continue;
        if (child.dataset.anatomyMarker !== undefined) continue;
        const texts = [ownTextOf(child), ...Array.from(child.querySelectorAll("*")).map(ownTextOf)].filter((text) => text.trim());
        candidates.push({ node: child, texts, depth });
        collect(child, depth + 1);
      }
    };
    collect(frame, 1);
    return pickWrappingTarget(candidates, needles)?.node ?? null;
  }

  return frame.querySelector<HTMLElement>(target);
}

/** 요소에 적용된 한 줄 높이를 구한다. `normal`이면 글자 크기로 어림한다. */
function textLineHeightOf(element: HTMLElement) {
  const style = getComputedStyle(element);
  const lineHeight = parseFloat(style.lineHeight);
  if (Number.isFinite(lineHeight)) return lineHeight;
  const fontSize = parseFloat(style.fontSize);
  return Number.isFinite(fontSize) ? fontSize * 1.5 : Number.NaN;
}

/**
 * 대상의 실제 크기를 잰다. 글자만 담은 요소는 박스가 남는 공간까지 차지할 수 있으므로
 * 화면에서 식별되는 글자 범위를 기준으로 삼는다. studio.md의 「번호선은 Hit area 중앙이 아니라
 * 글자 또는 아이콘의 시각 중심을 가리킨다」는 규칙을 그대로 따르는 부분이다.
 * 한 줄 입력 요소는 값이 없어도 글자가 놓이는 자리를 가리키도록 세로를 한 줄로 좁힌다.
 */
function measureAnatomyTarget(element: HTMLElement): AnatomyBox {
  const childNodes = Array.from(element.childNodes);
  const textOnly = childNodes.length > 0 && childNodes.every((node) => node.nodeType === 3);
  if (textOnly) {
    const range = document.createRange();
    range.selectNodeContents(element);
    const rect = range.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) return rect;
  }

  const box = element.getBoundingClientRect();
  if (element.tagName.toLowerCase() === "input") {
    return shrinkToTextLine(box, textLineHeightOf(element));
  }
  return box;
}

type AnatomyFrameValue = {
  frame: HTMLElement | null;
  insideFrame: boolean;
  rails: Partial<Record<AnatomySide, number>>;
  registerTarget: (id: string, side: AnatomySide, box: AnatomyBox | null) => void;
};

const emptyFrameValue: AnatomyFrameValue = { frame: null, insideFrame: false, rails: {}, registerTarget: () => undefined };

const AnatomyFrameContext = createContext<AnatomyFrameValue>(emptyFrameValue);

function sameBox(a: AnatomyBox, b: AnatomyBox) {
  return a.left === b.left && a.top === b.top && a.width === b.width && a.height === b.height;
}

/**
 * 대상의 실제 좌표를 프레임 기준으로 재고, 크기나 폰트가 바뀌면 다시 잰다.
 * 대상을 찾지 못한 마커는 화면에서 사라지므로, 그대로 두면 번호가 빠진 것을 알아채기 어렵다.
 * 개발 중에는 어느 대상을 놓쳤는지 콘솔로 알린다.
 */
function useAnatomyTargetBox(target: string) {
  const { frame, insideFrame } = useContext(AnatomyFrameContext);
  const [box, setBox] = useState<AnatomyBox | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (process.env.NODE_ENV === "production" || insideFrame) return;
    console.warn(`Anatomy 마커가 AnatomyFrame 바깥에 있어 대상을 찾을 수 없습니다: ${target}`);
  }, [insideFrame, target]);

  useIsomorphicLayoutEffect(() => {
    if (!frame) return;

    let cancelled = false;
    const update = () => {
      if (cancelled) return;
      const element = resolveAnatomyTarget(frame, target);
      if (!element) {
        if (process.env.NODE_ENV !== "production") {
          console.warn(`Anatomy 마커가 가리킬 대상을 찾지 못했습니다: ${target}`);
        }
        setBox(null);
        return;
      }
      const frameRect = frame.getBoundingClientRect();
      const rect = measureAnatomyTarget(element);
      const next = { left: rect.left - frameRect.left, top: rect.top - frameRect.top, width: rect.width, height: rect.height };
      setBox((prev) => (prev && sameBox(prev, next) ? prev : next));
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(frame);
    const element = resolveAnatomyTarget(frame, target);
    if (element) observer.observe(element);

    document.fonts?.ready.then(update).catch(() => undefined);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [frame, target]);

  return box;
}

export function AnatomySurface({ children, ariaLabel, title, className = "" }: { children: ReactNode; ariaLabel: string; title?: string; className?: string }) {
  const visibleTitle = title ?? ariaLabel.replace(/ anatomy$/i, " structure");
  return <div role="img" aria-label={ariaLabel} className={`relative overflow-hidden rounded-t-xl bg-oe-background-secondary ${className}`}><p className="absolute left-5 top-5 z-30 text-xs font-semibold text-oe-foreground-primary">{visibleTitle}</p>{children}</div>;
}

/**
 * 번호 마커가 대상을 찾을 기준 영역이다. 마커는 이 안의 실제 요소를 재서 스스로 자리를 잡으므로
 * 예시 콘텐츠나 부품 크기가 바뀌어도 번호선이 대상에서 빗나가지 않는다.
 * 같은 방향의 마커는 프레임이 계산한 하나의 축에 정렬되고 안내선 길이만 서로 달라진다.
 */
export function AnatomyFrame({ children, className = "", gap = DEFAULT_GAP }: { children: ReactNode; className?: string; gap?: number | Partial<Record<AnatomySide, number>> }) {
  const [frame, setFrame] = useState<HTMLElement | null>(null);
  const [frameBox, setFrameBox] = useState<AnatomyBox>(ORIGIN);
  const [targets, setTargets] = useState<Record<string, { side: AnatomySide; box: AnatomyBox }>>({});

  useIsomorphicLayoutEffect(() => {
    if (!frame) return;
    const update = () => {
      const rect = frame.getBoundingClientRect();
      const next = { left: 0, top: 0, width: rect.width, height: rect.height };
      setFrameBox((previous) => (sameBox(previous, next) ? previous : next));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [frame]);

  const registerTarget = useCallback((id: string, side: AnatomySide, box: AnatomyBox | null) => {
    setTargets((previous) => {
      const current = previous[id];
      if (!box) {
        if (!current) return previous;
        const next = { ...previous };
        delete next[id];
        return next;
      }
      if (current && current.side === side && sameBox(current.box, box)) return previous;
      return { ...previous, [id]: { side, box } };
    });
  }, []);

  const rails = useMemo(() => {
    const grouped = new Map<AnatomySide, AnatomyBox[]>();
    for (const { side, box } of Object.values(targets)) {
      grouped.set(side, [...(grouped.get(side) ?? []), box]);
    }
    const result: Partial<Record<AnatomySide, number>> = {};
    for (const [side, boxes] of grouped) {
      const sideGap = typeof gap === "number" ? gap : gap[side] ?? DEFAULT_GAP;
      // 프레임 경계도 함께 넣어 마커가 도식 위로 올라오지 않게 한다.
      result[side] = computeRailPosition({ frame: ORIGIN, targets: [...boxes, frameBox], side, gap: sideGap, markerSize: MARKER_SIZE });
    }
    return result;
  }, [targets, gap, frameBox]);

  const value = useMemo(() => ({ frame, insideFrame: true, rails, registerTarget }), [frame, rails, registerTarget]);

  return (
    <AnatomyFrameContext.Provider value={value}>
      <div ref={setFrame} className={cn("relative w-fit", className)}>{children}</div>
    </AnatomyFrameContext.Provider>
  );
}

const markerClassName = "absolute z-20 grid size-5 place-items-center rounded-full bg-oe-foreground-secondary text-[11px] text-oe-foreground-inverse";

export function AnatomyNumber({
  number,
  target,
  side = "top",
  gap = DEFAULT_GAP,
}: {
  number: number;
  target: string;
  side?: AnatomySide;
  gap?: number;
}) {
  const id = useId();
  const { rails, registerTarget } = useContext(AnatomyFrameContext);
  const box = useAnatomyTargetBox(target);

  useIsomorphicLayoutEffect(() => {
    registerTarget(id, side, box);
    return () => registerTarget(id, side, null);
  }, [id, side, box, registerTarget]);

  const placement = box
    ? computeMarkerPlacement({ frame: ORIGIN, target: box, side, gap, markerSize: MARKER_SIZE, rail: rails[side] })
    : null;

  return (
    <span
      data-anatomy-marker=""
      className={markerClassName}
      style={placement ? { left: placement.marker.left, top: placement.marker.top } : { visibility: "hidden" }}
    >
      {number}
      {placement ? <span aria-hidden="true" data-slot="anatomy-line" className="absolute bg-oe-border-primary" style={placement.line} /> : null}
    </span>
  );
}

export function AnatomySwapSlot({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return <span aria-hidden="true" className={`inline-flex size-4 items-center justify-center rounded border border-dashed border-pink-400 bg-pink-50 dark:bg-pink-950 ${className}`}>{children}</span>;
}

/**
 * Container, Group, List처럼 여러 요소를 묶는 영역의 범위를 평행선으로 표시한다.
 * 평행선은 대상의 실제 높이 또는 너비를 따라가고 연결선은 그 선에서 끝난다.
 */
export function AnatomyBoundaryMarker({
  number,
  target,
  side,
  connectorLength = DEFAULT_CONNECTOR_LENGTH,
  clearance = DEFAULT_CLEARANCE,
}: {
  number: number;
  target: string;
  side: AnatomySide;
  connectorLength?: number;
  clearance?: number;
}) {
  const box = useAnatomyTargetBox(target);

  const placement = box
    ? computeBoundaryPlacement({ frame: ORIGIN, target: box, side, connectorLength, clearance, markerSize: MARKER_SIZE })
    : null;

  return (
    <span
      data-anatomy-marker=""
      className={markerClassName}
      style={placement ? { left: placement.marker.left, top: placement.marker.top } : { visibility: "hidden" }}
    >
      {number}
      {placement ? (
        <Fragment>
          <span aria-hidden="true" data-slot="anatomy-boundary-connector" className="absolute bg-oe-border-primary" style={placement.connector} />
          <span aria-hidden="true" data-slot="anatomy-boundary-line" className="absolute bg-oe-border-primary" style={placement.boundary} />
        </Fragment>
      ) : null}
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
