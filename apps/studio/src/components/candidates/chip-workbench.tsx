"use client";

import { useState, type ReactNode } from "react";
import { RiMapPinLine } from "@remixicon/react";
import { Chip } from "@ooee/ui";
import { AnatomyDescription, AnatomyLegend, AnatomyNumber, AnatomySurface, AnatomySwapSlot } from "@/components/component-anatomy";
import { OnThisPage } from "@/components/component-detail-navigation";
import { PreviewLocaleScope } from "@/components/preview-locale-scope";
import { useStudioPreferences } from "@/components/studio-preferences-provider";

const sections = [
  { id: "playground", label: "Playground" }, { id: "anatomy", label: "Anatomy" },
  { id: "content", label: "Content" }, { id: "leading-element", label: "Leading element" },
  { id: "close-action", label: "Close action" }, { id: "behavior", label: "Behavior" },
  { id: "property-map", label: "Property map" }, { id: "examples", label: "Examples" },
];
const copy = { ko: { label: "서울특별시", aria: "지역 필터", restore: "Chip 다시 표시" }, en: { label: "Seoul", aria: "Region filter", restore: "Show Chip again" } } as const;

export function ChipWorkbench() {
  const { locale } = useStudioPreferences();
  const c = copy[locale];
  const [iconOnly, setIconOnly] = useState(false);
  const [showLeading, setShowLeading] = useState(true);
  const [visible, setVisible] = useState(true);
  const removeLabel = `${c.label} 삭제`;

  return <div className="grid items-start gap-6 @min-[1120px]:grid-cols-[minmax(0,1fr)_11rem]">
    <div className="min-w-0 space-y-5">
      <header className="rounded-2xl border border-oe-border-secondary bg-oe-background-primary p-5"><h2 className="text-lg font-semibold text-oe-foreground-primary">Chip</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-oe-foreground-secondary">Border로 구분하며 Label 또는 Icon과 뒤쪽 Close action으로 구성합니다.</p></header>
      <Section id="playground" title="🚩 Playground" description="Label type과 Icon-only type, Leading element와 제거 동작을 확인합니다.">
        <div className="grid gap-5 rounded-xl border-2 border-oe-border-bold-primary bg-oe-background-secondary p-4 @min-[800px]:grid-cols-[minmax(0,1fr)_16rem]">
          <PreviewLocaleScope className="min-h-32 rounded-xl bg-oe-background-primary p-5">{visible ? iconOnly ? <Chip leadingElement={<RiMapPinLine />} ariaLabel={c.aria} removeLabel={`${c.aria} 삭제`} onRemove={() => setVisible(false)} /> : <Chip leadingElement={showLeading ? <RiMapPinLine /> : undefined} removeLabel={removeLabel} onRemove={() => setVisible(false)}>{c.label}</Chip> : <button type="button" onClick={() => setVisible(true)} className="text-xs underline">{c.restore}</button>}</PreviewLocaleScope>
          <div className="space-y-3 rounded-xl bg-oe-background-primary p-4"><Toggle label="Icon only" value={iconOnly} onChange={setIconOnly} /><Toggle label="Show leading element" value={showLeading} onChange={setShowLeading} disabled={iconOnly} /></div>
        </div>
      </Section>
      <Section id="anatomy" title="Anatomy" description="번호는 실제 요소 밖에 두고 이름은 아래 범례에서 확인합니다.">
        <AnatomySurface ariaLabel="Chip anatomy" className="px-5 py-12"><div lang="en" className="relative mx-auto flex h-32 max-w-sm items-center justify-center"><Chip leadingElement={<AnatomySwapSlot className="size-5"><RiMapPinLine className="size-3.5" /></AnatomySwapSlot>} removeLabel="Remove Label" onRemove={() => undefined}>Label</Chip><AnatomyNumber number={1} className="left-8 top-4" lineClassName="left-2.5 top-5 h-8 w-px" /><AnatomyNumber number={2} className="left-[7.25rem] bottom-3" lineClassName="bottom-5 left-2.5 h-8 w-px" /><AnatomyNumber number={3} className="left-[11.25rem] top-4" lineClassName="left-2.5 top-5 h-8 w-px" /><AnatomyNumber number={4} className="right-8 bottom-3" lineClassName="bottom-5 left-2.5 h-8 w-px" /></div></AnatomySurface>
        <AnatomyLegend items={[{ name: "Container" }, { name: "Leading element", optional: true }, { name: "Label", optional: true }, { name: "Close action" }]} />
        <AnatomyDescription><p>Label type은 Label을 표시하고 Leading element를 선택적으로 사용합니다. Icon-only type은 Label 대신 Leading element와 접근 가능한 이름이 필요합니다.</p></AnatomyDescription>
      </Section>
      <Property id="content" title="Properties · Content" description="Label type과 Icon-only type 두 구성을 제공합니다."><PreviewLocaleScope className="flex flex-wrap items-center gap-2"><Chip removeLabel={removeLabel} onRemove={() => undefined}>{c.label}</Chip><Chip leadingElement={<RiMapPinLine />} ariaLabel={c.aria} removeLabel={`${c.aria} 삭제`} onRemove={() => undefined} /></PreviewLocaleScope></Property>
      <Property id="leading-element" title="Properties · Leading element" description="Label type에서는 선택 요소이며 현재 확인된 유형은 Icon입니다. Icon-only type에서는 필수입니다."><Chip leadingElement={<AnatomySwapSlot className="size-5"><RiMapPinLine className="size-3.5" /></AnatomySwapSlot>} removeLabel={removeLabel} onRemove={() => undefined}>{c.label}</Chip></Property>
      <Property id="close-action" title="Properties · Close action" description="항상 Trailing 위치에 있으며 제거 동작과 접근 가능한 이름이 필요합니다."><Chip removeLabel={removeLabel} onRemove={() => undefined}>{c.label}</Chip></Property>
      <Property id="behavior" title="Behavior" description="Chip 전체는 클릭하지 않으며 Close action만 onRemove를 실행합니다."><p className="text-sm text-oe-foreground-secondary">Hover와 Focus는 Close action에만 적용됩니다.</p></Property>
      <section id="property-map" className="scroll-mt-20 rounded-2xl border border-oe-border-secondary bg-oe-background-primary p-5"><h3 className="text-sm font-semibold">Property map</h3><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[32rem] text-left text-xs"><thead className="border-b border-oe-border-secondary"><tr><th className="py-2">Property</th><th>Values</th><th>Required</th></tr></thead><tbody className="divide-y divide-oe-border-secondary"><Row name="children" values="string | undefined" required="Label type" /><Row name="leadingElement" values="ReactNode" required="Icon-only type" /><Row name="ariaLabel" values="string" required="Icon-only type" /><Row name="onRemove" values="() => void" required="Yes" /><Row name="removeLabel" values="string" required="Yes" /></tbody></table></div></section>
      <Section id="examples" title="Examples"><PreviewLocaleScope className="flex flex-wrap gap-2"><Chip removeLabel={removeLabel} onRemove={() => undefined}>{c.label}</Chip><Chip leadingElement={<RiMapPinLine />} removeLabel={removeLabel} onRemove={() => undefined}>{c.label}</Chip><Chip leadingElement={<RiMapPinLine />} ariaLabel={c.aria} removeLabel={`${c.aria} 삭제`} onRemove={() => undefined} /></PreviewLocaleScope></Section>
    </div>
    <OnThisPage items={sections} componentKey="chip" />
  </div>;
}

function Section({ id, title, description, children }: { id: string; title: string; description?: string; children: ReactNode }) { return <section id={id} className="scroll-mt-20 rounded-2xl border border-oe-border-secondary bg-oe-background-primary p-5"><h3 className="text-sm font-semibold">{title}</h3>{description ? <p className="mt-1 text-xs leading-5 text-oe-foreground-tertiary">{description}</p> : null}<div className="mt-5">{children}</div></section>; }
function Property({ id, title, description, children }: { id: string; title: string; description: string; children: ReactNode }) { return <Section id={id} title={title} description={description}><div className="rounded-xl border border-oe-border-secondary p-4">{children}</div></Section>; }
function Toggle({ label, value, onChange, disabled = false }: { label: string; value: boolean; onChange: (value: boolean) => void; disabled?: boolean }) { return <div className="flex items-center justify-between gap-3"><span className="text-[11px] font-medium text-oe-foreground-tertiary">{label}</span><button type="button" role="switch" aria-checked={value} aria-label={label} disabled={disabled} onClick={() => onChange(!value)} className={`relative h-5 w-9 rounded-full disabled:opacity-40 ${value ? "bg-oe-background-bold-primary" : "bg-oe-background-secondary ring-1 ring-inset ring-oe-border-primary"}`}><span className={`absolute top-0.5 size-4 rounded-full bg-oe-background-primary shadow-sm transition-[left] ${value ? "left-[18px]" : "left-0.5"}`} /></button></div>; }
function Row({ name, values, required }: { name: string; values: string; required: string }) { return <tr><td className="py-2 font-mono text-[11px]">{name}</td><td>{values}</td><td>{required}</td></tr>; }
