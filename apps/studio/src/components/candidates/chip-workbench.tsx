"use client";

import { useState } from "react";
import { RiMapPinLine } from "@remixicon/react";
import { Chip } from "@ooee/ui";
import { OnThisPage } from "@/components/component-detail-navigation";

const sections = [{ id: "playground", label: "Playground" }, { id: "anatomy", label: "Anatomy" }, { id: "properties", label: "Properties" }, { id: "examples", label: "Examples" }];

export function ChipWorkbench() {
  const [iconOnly, setIconOnly] = useState(false);
  const [showLeading, setShowLeading] = useState(true);
  const [visible, setVisible] = useState(true);

  return (
    <div className="grid items-start gap-6 @min-[1120px]:grid-cols-[minmax(0,1fr)_11rem]">
      <div className="min-w-0 space-y-5">
        <header className="rounded-2xl border border-oe-border-secondary bg-oe-background-primary p-5"><h2 className="text-lg font-semibold text-oe-foreground-primary">Chip</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-oe-foreground-secondary">Border로 구분하며 Label 또는 Icon과 뒤쪽 닫기 action으로 구성합니다.</p></header>
        <section id="playground" className="scroll-mt-20 rounded-2xl border border-oe-border-secondary bg-oe-background-primary p-5"><h3 className="text-sm font-semibold">🚩 Playground</h3><div className="mt-5 grid gap-5 rounded-xl border-2 border-oe-border-bold-primary bg-oe-background-secondary p-4 @min-[800px]:grid-cols-[minmax(0,1fr)_16rem]"><div className="min-h-32 rounded-xl bg-oe-background-primary p-5">{visible ? iconOnly ? <Chip leadingElement={<RiMapPinLine />} ariaLabel="지역 필터" removeLabel="지역 필터 삭제" onRemove={() => setVisible(false)} /> : <Chip leadingElement={showLeading ? <RiMapPinLine /> : undefined} removeLabel="서울특별시 삭제" onRemove={() => setVisible(false)}>서울특별시</Chip> : <button type="button" onClick={() => setVisible(true)} className="text-xs underline">Chip 다시 표시</button>}</div><div className="space-y-3 rounded-xl bg-oe-background-primary p-4"><Toggle label="Icon only" value={iconOnly} onChange={setIconOnly} /><Toggle label="Show leading element" value={showLeading} onChange={setShowLeading} disabled={iconOnly} /></div></div></section>
        <section id="anatomy" className="scroll-mt-20 rounded-2xl border border-oe-border-secondary bg-oe-background-primary p-5"><h3 className="text-sm font-semibold">Anatomy</h3><div className="mt-5 flex flex-wrap gap-3"><Chip leadingElement={<RiMapPinLine />} removeLabel="Label 삭제" onRemove={() => undefined}>1 · Leading / 2 · Label / 3 · Close</Chip><Chip leadingElement={<RiMapPinLine />} ariaLabel="Icon only" removeLabel="Icon only 삭제" onRemove={() => undefined} /></div></section>
        <section id="properties" className="scroll-mt-20 rounded-2xl border border-oe-border-secondary bg-oe-background-primary p-5"><h3 className="text-sm font-semibold">Properties</h3><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[32rem] text-left text-xs"><thead className="border-b border-oe-border-secondary"><tr><th className="py-2">Property</th><th>Values</th><th>Required</th></tr></thead><tbody className="divide-y divide-oe-border-secondary"><Row name="children" values="string | undefined" required="Label type" /><Row name="leadingElement" values="ReactNode" required="Icon-only type" /><Row name="ariaLabel" values="string" required="Icon-only type" /><Row name="onRemove" values="() => void" required="Yes" /><Row name="removeLabel" values="string" required="Yes" /></tbody></table></div></section>
        <section id="examples" className="scroll-mt-20 rounded-2xl border border-oe-border-secondary bg-oe-background-primary p-5"><h3 className="text-sm font-semibold">Examples</h3><div className="mt-4 flex flex-wrap gap-2"><Chip removeLabel="서울특별시 삭제" onRemove={() => undefined}>서울특별시</Chip><Chip leadingElement={<RiMapPinLine />} removeLabel="경기도 삭제" onRemove={() => undefined}>경기도</Chip><Chip leadingElement={<RiMapPinLine />} ariaLabel="지역" removeLabel="지역 삭제" onRemove={() => undefined} /></div></section>
      </div>
      <OnThisPage items={sections} relatedItems={[{ href: "/components/badge", title: "Badge", description: "상태와 분류 정보를 표시하는 비상호작용 요소입니다." }, { href: "/components/combobox", title: "Combobox", description: "다중 선택 결과에 Chip을 사용합니다." }]} />
    </div>
  );
}

function Toggle({ label, value, onChange, disabled = false }: { label: string; value: boolean; onChange: (value: boolean) => void; disabled?: boolean }) { return <div className="flex items-center justify-between gap-3"><span className="text-[11px] font-medium text-oe-foreground-tertiary">{label}</span><button type="button" role="switch" aria-checked={value} aria-label={label} disabled={disabled} onClick={() => onChange(!value)} className={`relative h-5 w-9 rounded-full disabled:opacity-40 ${value ? "bg-oe-background-bold-primary" : "bg-oe-background-secondary ring-1 ring-inset ring-oe-border-primary"}`}><span className={`absolute top-0.5 size-4 rounded-full bg-oe-background-primary shadow-sm transition-[left] ${value ? "left-[18px]" : "left-0.5"}`} /></button></div>; }
function Row({ name, values, required }: { name: string; values: string; required: string }) { return <tr><td className="py-2 font-mono text-[11px]">{name}</td><td>{values}</td><td>{required}</td></tr>; }
