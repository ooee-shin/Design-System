"use client";

import { useState, type ReactNode } from "react";
import { RiArrowRightSLine, RiCalendarLine, RiMapPinLine, RiTimeLine } from "@remixicon/react";
import { InputButton } from "@ooee/ui";

import { AnatomySwapSlot } from "@/components/anatomy-swap-slot";
import { AnatomyBoundaryMarker, AnatomyLegend, AnatomyNumber, AnatomySurface } from "@/components/component-anatomy";
import { ColorSwatch } from "@/components/color-swatch";
import { OnThisPage } from "@/components/component-detail-navigation";
import { PlaygroundChoice as Choice, PlaygroundElementControl, PlaygroundElementGraphic, type PlaygroundElementValue } from "@/components/playground-element-control";
import { PreviewLocaleScope } from "@/components/preview-locale-scope";
import { useStudioPreferences } from "@/components/studio-preferences-provider";

type PreviewState = "default" | "focus" | "invalid" | "disabled" | "readOnly";

const copy = {
  ko: {
    description: "직접 입력하는 대신 달력, 주소 검색, 시간 선택과 같은 후속 화면을 여는 버튼입니다. Input과 같은 외관을 사용하지만 실제 역할과 HTML 요소는 Button입니다.",
    value: "2026. 08. 26", placeholder: "날짜를 선택해 주세요",
    calendar: "날짜", calendarDescription: "달력에서 날짜를 선택하는 화면을 엽니다.",
    address: "주소", addressPlaceholder: "주소를 선택해 주세요", addressDescription: "주소 검색 또는 선택 화면을 엽니다.",
    time: "시간", timeValue: "오후 2:30", timeDescription: "시간 선택 화면을 엽니다.",
    color: "Color picker · Select only", colorValue: "파란색", colorDescription: "직접 입력하지 않고 Color Picker에서 색상을 선택합니다.",
  },
  en: {
    description: "A button that opens a follow-up surface such as a calendar, address search, or time picker instead of accepting direct text entry. It shares Input styling but uses button semantics.",
    value: "Aug 26, 2026", placeholder: "Select a date",
    calendar: "Date", calendarDescription: "Opens a calendar for date selection.",
    address: "Address", addressPlaceholder: "Select an address", addressDescription: "Opens an address search or selection surface.",
    time: "Time", timeValue: "2:30 PM", timeDescription: "Opens a time selection surface.",
    color: "Color picker · Select only", colorValue: "Blue", colorDescription: "Selects a color from the Color Picker without direct text entry.",
  },
} as const;

const sections = [
  { id: "playground", label: "Playground" }, { id: "anatomy", label: "Anatomy" },
  { id: "style", label: "Style" }, { id: "size", label: "Size" }, { id: "layout", label: "Layout" },
  { id: "elements", label: "Elements" }, { id: "state", label: "State" },
  { id: "examples", label: "Examples" }, { id: "property-map", label: "Property map" },
];

export function InputButtonWorkbench() {
  const { locale } = useStudioPreferences();
  const c = copy[locale];
  const [variant, setVariant] = useState<"outline" | "filled">("outline");
  const [controlSize, setControlSize] = useState<"small" | "regular" | "large" | "xlarge">("regular");
  const [layout, setLayout] = useState<"fill" | "fixed">("fill");
  const [fixedWidth, setFixedWidth] = useState(280);
  const [showValue, setShowValue] = useState(true);
  const [leadingElement, setLeadingElement] = useState<PlaygroundElementValue>({ kind: "icon", icon: "calendar", image: "avatar" });
  const [trailingElement, setTrailingElement] = useState<PlaygroundElementValue>({ kind: "none", icon: "search", image: "avatar" });
  const [previewState, setPreviewState] = useState<PreviewState>("default");

  return (
    <div className="grid items-start gap-6 @min-[1120px]:grid-cols-[minmax(0,1fr)_11rem]">
      <div className="min-w-0 space-y-5">

        <Section id="playground" title="🚩 Playground" description="확정된 Style, Size, Layout, Content, Element와 State를 조합하여 확인합니다.">
          <div className="col-span-full grid gap-5 rounded-xl border-2 border-oe-border-bold-primary bg-oe-background-secondary p-4 @min-[1000px]:grid-cols-[minmax(18rem,1fr)_minmax(32rem,1.35fr)]">
            <div className="flex min-h-52 items-start rounded-xl bg-oe-background-primary p-5">
              <InputButton
                variant={variant} controlSize={controlSize}
                {...(layout === "fixed" ? { layout: "fixed" as const, fixedWidth } : { layout: "fill" as const })}
                value={showValue ? c.value : undefined} placeholder={c.placeholder}
                leadingElement={leadingElement.kind === "none" ? undefined : <PlaygroundElementGraphic value={leadingElement} />}
                trailingElement={trailingElement.kind === "none" ? undefined : <PlaygroundElementGraphic value={trailingElement} />}
                disabled={previewState === "disabled"} readOnly={previewState === "readOnly"} aria-invalid={previewState === "invalid" ? "true" : undefined}
                className={previewState === "focus" ? "border-oe-focus-ring bg-oe-background-primary ring-1 ring-oe-focus-ring" : undefined}
                aria-haspopup="dialog"
              />
            </div>
            <div className="grid gap-5 @min-[720px]:grid-cols-2">
              <div className="space-y-4">
                <ControlSection title="Appearance"><ControlGroup label="Style">{(["outline", "filled"] as const).map((item) => <Choice key={item} active={variant === item} onClick={() => setVariant(item)}>{capitalize(item)}</Choice>)}</ControlGroup></ControlSection>
                <ControlSection title="Size"><ControlGroup label="Control size">{(["small", "regular", "large", "xlarge"] as const).map((item) => <Choice key={item} active={controlSize === item} onClick={() => setControlSize(item)}>{capitalize(item)}</Choice>)}</ControlGroup></ControlSection>
                <ControlSection title="Layout"><ControlGroup label="Width behavior">{(["fill", "fixed"] as const).map((item) => <Choice key={item} active={layout === item} onClick={() => setLayout(item)}>{capitalize(item)}</Choice>)}</ControlGroup>{layout === "fixed" ? <NumberControl label="Width · px" value={fixedWidth} min={160} max={640} onChange={setFixedWidth} /> : null}</ControlSection>
                <ControlSection title="State"><ControlGroup label="Preview state">{(["default", "focus", "invalid", "disabled", "readOnly"] as const).map((item) => <Choice key={item} active={previewState === item} onClick={() => setPreviewState(item)}>{capitalize(item)}</Choice>)}</ControlGroup></ControlSection>
              </div>
              <div className="space-y-4">
                <ControlSection title="Content"><Toggle label="Show value" value={showValue} onChange={setShowValue} /><p className="text-[11px] leading-4 text-oe-foreground-placeholder">Off에서는 Placeholder를 표시합니다.</p></ControlSection>
                <ControlSection title="Elements"><PlaygroundElementControl label="Leading element" value={leadingElement} onChange={setLeadingElement} /><PlaygroundElementControl label="Trailing element" value={trailingElement} onChange={setTrailingElement} /></ControlSection>
                <ControlSection title="Behavior"><p className="text-[11px] leading-5 text-oe-foreground-tertiary">Click은 소비자가 연결한 선택 화면을 엽니다. Input Button은 후속 화면의 종류와 선택 로직을 소유하지 않습니다.</p></ControlSection>
              </div>
            </div>
          </div>
        </Section>

        <Section id="anatomy" title="Anatomy" description="Input Button을 구성하는 실제 요소와 문서에서 사용하는 명칭입니다."><InputButtonAnatomy /></Section>

        <Section id="style" title="Properties · Style" description="Input과 같은 Outline과 회색조 Filled를 사용하며 모든 Form control의 공통 기본값인 Outline을 따릅니다.">
          <Example label="Outline · Default"><InputButton value={c.value} leadingElement={<RiCalendarLine />} /></Example>
          <Example label="Filled"><InputButton variant="filled" value={c.value} leadingElement={<RiCalendarLine />} /></Example>
        </Section>

        <Section id="size" title="Properties · Size" description="Input과 Button이 공유하는 공통 Control Height를 사용합니다.">
          <Example label="Small · 32px"><InputButton controlSize="small" value={c.value} /></Example>
          <Example label="Regular · 36px · Default"><InputButton value={c.value} /></Example>
          <Example label="Large · 40px"><InputButton controlSize="large" value={c.value} /></Example>
          <Example label="XLarge · 48px"><InputButton controlSize="xlarge" value={c.value} /></Example>
        </Section>

        <Section id="layout" title="Properties · Layout" description="부모 너비를 채우는 Fill과 명시한 너비를 유지하는 Fixed를 지원합니다.">
          <Example label="Fill · Default"><InputButton value={c.value} /></Example>
          <Example label="Fixed"><InputButton layout="fixed" fixedWidth={240} value={c.value} /></Example>
        </Section>

        <Section id="elements" title="Properties · Elements" description="텍스트 값 앞뒤에 선택적인 Element를 배치할 수 있습니다. Clear button과 Chip value는 제공하지 않습니다.">
          <Example label="Leading element"><InputButton value={c.value} leadingElement={<RiCalendarLine />} /></Example>
          <Example label="Trailing element"><InputButton value={c.value} trailingElement={<RiArrowRightSLine />} /></Example>
        </Section>

        <Section id="state" title="Properties · State" description="버튼에서 실제로 확인되는 Default, Focus, Invalid, Disabled와 Read only 상태입니다. 조회 화면에서는 Read only를 사용해 값을 보여주되 선택 화면을 열지 않습니다.">
          <Example label="Default"><InputButton value={c.value} /></Example>
          <Example label="Focus"><InputButton value={c.value} className="border-oe-focus-ring bg-oe-background-primary ring-1 ring-oe-focus-ring" /></Example>
          <Example label="Invalid"><InputButton value={c.value} aria-invalid="true" /></Example>
          <Example label="Disabled"><InputButton value={c.value} disabled /></Example>
          <Example label="Read only" description="focus는 유지하고 여는 동작만 막습니다."><InputButton value={c.value} readOnly /></Example>
        </Section>

        <Section id="examples" title="Examples" description="직접 입력 대신 별도의 선택 화면이 필요한 현재 검수 사례입니다.">
          <Example label={c.calendar} description={c.calendarDescription}><InputButton value={c.value} leadingElement={<RiCalendarLine />} aria-haspopup="dialog" /></Example>
          <Example label={c.address} description={c.addressDescription}><InputButton placeholder={c.addressPlaceholder} leadingElement={<RiMapPinLine />} aria-haspopup="dialog" /></Example>
          <Example label={c.time} description={c.timeDescription}><InputButton value={c.timeValue} leadingElement={<RiTimeLine />} aria-haspopup="dialog" /></Example>
          <Example label={c.color} description={c.colorDescription}><InputButton value={c.colorValue} leadingElement={<ColorSwatch color="#0073FF" />} aria-haspopup="dialog" /></Example>
        </Section>

        <Section id="property-map" title="Property map" description="현재 구현에서 확인되는 Property와 허용 값을 정리합니다.">
          <div className="col-span-full overflow-x-auto"><table className="w-full min-w-[44rem] text-left text-xs"><thead className="border-b border-oe-border-secondary text-oe-foreground-tertiary"><tr><th className="py-2 font-medium">Property</th><th className="py-2 font-medium">Values</th><th className="py-2 font-medium">Default</th><th className="py-2 font-medium">Status</th></tr></thead><tbody className="divide-y divide-oe-border-secondary text-oe-foreground-secondary">
            <MapRow property="variant" values="outline | filled" defaultValue="outline" /><MapRow property="controlSize" values="small | regular | large | xlarge" defaultValue="regular" /><MapRow property="layout" values="fill | fixed" defaultValue="fill" />
            <MapRow property="readOnly" values="false | true" defaultValue="false" /><MapRow property="value / placeholder" values="string" defaultValue="undefined / Select an option" /><MapRow property="leadingElement / trailingElement" values="ReactNode" defaultValue="undefined" /><MapRow property="prefix / suffix" values="string" defaultValue="undefined" />
            <MapRow property="state" values="default | focus | invalid | disabled" defaultValue="default" note="Button attributes and focus" />
          </tbody></table></div>
        </Section>
      </div>
      <OnThisPage items={sections} componentKey="input-button" />
    </div>
  );
}

function InputButtonAnatomy() {
  return (
    <div className="col-span-full min-w-0">
      <AnatomySurface ariaLabel="Input Button anatomy" title="Input Button structure" className="px-5 pb-5 pt-12">
        <div className="overflow-x-auto">
          <div className="relative mx-auto flex h-48 w-[30rem] items-center justify-center">
            <div className="pointer-events-none w-72"><InputButton value="2026-09-14" leadingElement={<AnatomySwapSlot />} prefix="+82" suffix="KST" trailingElement={<AnatomySwapSlot />} tabIndex={-1} /></div>
            <AnatomyBoundaryMarker number={1} side="left" connectorLength={48} boundaryLength={36} className="left-5 top-[5.4rem]" />
            <AnatomyNumber number={2} className="left-[106px] top-5" lineClassName="left-2.5 top-5 h-14 w-px" />
            <AnatomyNumber number={3} className="left-[135px] bottom-4" lineClassName="bottom-5 left-2.5 h-14 w-px" />
            <AnatomyNumber number={4} className="left-[230px] top-5" lineClassName="left-2.5 top-5 h-14 w-px" />
            <AnatomyNumber number={5} className="left-[325px] bottom-4" lineClassName="bottom-5 left-2.5 h-14 w-px" />
            <AnatomyNumber number={6} className="left-[354px] top-5" lineClassName="left-2.5 top-5 h-14 w-px" />
          </div>
        </div>
      </AnatomySurface>
      <AnatomyLegend items={[{ name: "Container" }, { name: "Leading element", optional: true }, { name: "Prefix", optional: true }, { name: "Value / Placeholder" }, { name: "Suffix", optional: true }, { name: "Trailing element", optional: true }]} />
    </div>
  );
}

function Section({ id, title, description, children }: { id: string; title: string; description: string; children: ReactNode }) { return <section id={id} className="scroll-mt-20 rounded-2xl border border-oe-border-secondary bg-oe-background-primary p-5"><h3 className="text-lg font-semibold text-oe-foreground-primary">{title}</h3><p className="mt-1 text-xs leading-5 text-oe-foreground-tertiary">{description}</p><div className="mt-5 grid gap-3 @min-[720px]:grid-cols-2">{children}</div></section>; }
function Example({ label, description, children }: { label: string; description?: string; children: ReactNode; fixed?: boolean }) { return <div className="flex min-h-32 min-w-0 flex-col gap-3 rounded-xl border border-oe-border-secondary p-4"><div><p className="text-xs font-medium text-oe-foreground-primary">{label}</p>{description ? <p className="mt-1 text-[11px] leading-4 text-oe-foreground-tertiary">{description}</p> : null}</div><PreviewLocaleScope className="mt-auto">{children}</PreviewLocaleScope></div>; }
function ControlSection({ title, children }: { title: string; children: ReactNode }) { return <section><h4 className="mb-3 text-sm font-semibold text-oe-foreground-primary">{title}</h4><div className="space-y-3">{children}</div></section>; }
function ControlGroup({ label, children }: { label: string; children: ReactNode }) { return <fieldset><legend className="mb-2 text-[11px] font-medium text-oe-foreground-tertiary">{label}</legend><div className="flex flex-wrap gap-1.5">{children}</div></fieldset>; }
function NumberControl({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (value: number) => void }) { return <label className="block"><span className="mb-1.5 block text-[11px] font-medium text-oe-foreground-tertiary">{label}</span><input type="number" value={value} min={min} max={max} onChange={(event) => onChange(Number(event.target.value))} className="h-8 w-full rounded-lg border border-oe-border-primary bg-oe-background-primary px-2.5 text-xs tabular-nums text-oe-foreground-primary outline-none focus:border-oe-focus-ring focus:ring-1 focus:ring-oe-focus-ring" /></label>; }
function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) { return <div className="flex items-center justify-between gap-3"><span className="text-[11px] font-medium text-oe-foreground-tertiary">{label}</span><button type="button" role="switch" aria-checked={value} aria-label={label} onClick={() => onChange(!value)} className={`relative h-5 w-9 rounded-full ${value ? "bg-oe-background-bold-primary" : "bg-oe-background-secondary ring-1 ring-inset ring-oe-border-primary"}`}><span className={`absolute top-0.5 size-4 rounded-full bg-oe-background-primary shadow-sm transition-[left] ${value ? "left-[18px]" : "left-0.5"}`} /></button></div>; }
function MapRow({ property, values, defaultValue, note = "Confirmed" }: { property: string; values: string; defaultValue: string; note?: string }) { return <tr><td className="py-3 pr-4 font-medium text-oe-foreground-primary">{property}</td><td className="py-3 pr-4 font-mono text-[11px]">{values}</td><td className="py-3 pr-4 font-mono text-[11px]">{defaultValue}</td><td className="py-3">{note}</td></tr>; }
function capitalize(value: string) { return value.charAt(0).toUpperCase() + value.slice(1); }
