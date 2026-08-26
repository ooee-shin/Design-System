"use client";

import { useState, type ComponentProps, type ReactNode } from "react";
import { RiNotification3Line } from "@remixicon/react";
import { Badge, RadioContainer, RadioField, RadioGroup } from "@ooee/ui";

import { AnatomySwapSlot } from "@/components/anatomy-swap-slot";
import { OnThisPage } from "@/components/component-detail-navigation";
import { PreviewLocaleScope } from "@/components/preview-locale-scope";
import { useStudioPreferences } from "@/components/studio-preferences-provider";

const previewCopy = { ko: { label: "선택 항목", right: "우측 설명", bottom: "선택 항목에 대한 추가 설명입니다." }, en: { label: "Option", right: "Description", bottom: "Additional information about this option." } } as const;

const sections = [
  { id: "playground", label: "Playground" },
  { id: "anatomy", label: "Anatomy" },
  { id: "appearance", label: "Appearance" },
  { id: "state", label: "State" },
  { id: "property-map", label: "Property map" },
];

export function RadioIndicatorWorkbench() {
  const { locale } = useStudioPreferences();
  const c = previewCopy[locale];
  const [selected, setSelected] = useState(true);
  const [disabled, setDisabled] = useState(false);
  const [showRightDescription, setShowRightDescription] = useState(false);
  const [showBottomDescription, setShowBottomDescription] = useState(true);
  const [flipped, setFlipped] = useState(false);
  const [layout, setLayout] = useState<"inline" | "block">("inline");

  return (
    <div className="grid items-start gap-6 @min-[1120px]:grid-cols-[minmax(0,1fr)_11rem]">
      <div className="min-w-0 space-y-5">
        <header className="rounded-2xl border border-oe-border-secondary bg-oe-background-primary p-5">
          <h2 className="text-lg font-semibold text-oe-foreground-primary">Radio</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-oe-foreground-secondary">목록이나 폼에서 여러 항목 중 하나를 선택합니다. Control은 16px 단일 크기이며 선택 상태는 Brand로 채운 원과 중앙의 흰 Indicator로 표시합니다.</p>
        </header>

        <Section id="playground" title="🚩 Playground" description="현재 구현된 선택, 비활성, 콘텐츠와 배치 속성을 조합해 확인합니다.">
          <div className="col-span-full grid gap-5 rounded-xl border-2 border-oe-border-bold-primary bg-oe-background-secondary p-4 @min-[760px]:grid-cols-[minmax(14rem,1fr)_16rem]">
            <PreviewLocaleScope className="min-h-44 rounded-xl bg-oe-background-primary p-5">
              <RadioGroup value={selected ? "option" : "none"} onValueChange={(value) => setSelected(value === "option")}>
                <RadioField value="option" disabled={disabled} label={c.label} rightDescription={showRightDescription ? c.right : undefined} bottomDescription={showBottomDescription ? c.bottom : undefined} layout={layout} flipped={flipped} />
              </RadioGroup>
            </PreviewLocaleScope>
            <div className="space-y-4 rounded-xl bg-oe-background-primary p-4">
              <Toggle label="Selected" value={selected} onChange={setSelected} />
              <Toggle label="Disabled" value={disabled} onChange={setDisabled} />
              <Toggle label="Show right description" value={showRightDescription} onChange={setShowRightDescription} />
              <Toggle label="Show bottom description" value={showBottomDescription} onChange={setShowBottomDescription} />
              <Toggle label="Flipped" value={flipped} onChange={setFlipped} />
              <Control label="Layout"><Choice active={layout === "inline"} onClick={() => setLayout("inline")}>Inline</Choice><Choice active={layout === "block"} onClick={() => setLayout("block")}>Block</Choice></Control>
            </div>
          </div>
        </Section>

        <Section id="anatomy" title="Anatomy" description="현재 Radio Field를 구성하는 실제 요소입니다.">
          <div className="col-span-full grid gap-8">
            <div className="rounded-xl bg-oe-background-secondary p-5">
              <h4 className="text-xs font-semibold text-oe-foreground-primary">Basic anatomy</h4>
              <p className="mt-1 text-xs leading-5 text-oe-foreground-tertiary">RadioField의 기본 구조만 표시합니다.</p>
              <div lang="en" className="mt-3 px-1 py-6">
                <div className="relative mx-auto my-14 w-fit">
                  <RadioGroup value="anatomy-basic"><RadioField value="anatomy-basic" label="Label" /></RadioGroup>
                  <FieldContainerMarker />
                  <AnatomyMarker number="2" className="left-0 -top-11" lineClassName="left-2.5 top-5 h-6 w-px" />
                  <AnatomyMarker number="3" className="left-0 -bottom-11" lineClassName="bottom-5 left-2.5 h-6 w-px" />
                  <AnatomyMarker number="4" className="right-0 -bottom-11" lineClassName="bottom-5 left-2.5 h-6 w-px" />
                </div>
              </div>
              <ol className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-oe-foreground-primary">
                <li>1 · Field container</li><li>2 · Control container</li><li>3 · Selection indicator</li><li>4 · Label</li>
              </ol>
            </div>

            <div className="rounded-xl bg-oe-background-secondary p-5">
              <h4 className="text-xs font-semibold text-oe-foreground-primary">Extended anatomy</h4>
              <p className="mt-1 text-xs leading-5 text-oe-foreground-tertiary">Basic 구조에 추가할 수 있는 Optional 요소만 번호로 표시합니다.</p>
              <div lang="en" className="mt-3 px-1 py-6">
                <div className="relative mx-auto my-14 w-fit">
                  <RadioGroup value="anatomy-extended"><RadioField value="anatomy-extended" label="Label" rightDescription="Right Description" bottomDescription="Bottom Description" leadingElement={<AnatomySwapSlot />} trailingElement={<AnatomySwapSlot />} /></RadioGroup>
                  <ContentContainerMarker />
                  <AnatomyMarker number="6" className="left-7 -top-11" lineClassName="left-2.5 top-5 h-6 w-px" />
                  <AnatomyMarker number="7" className="right-[34px] -top-11" lineClassName="left-2.5 top-5 h-6 w-px" />
                  <AnatomyMarker number="8" className="right-0 -top-11" lineClassName="left-2.5 top-5 h-6 w-px" />
                  <AnatomyMarker number="9" className="left-7 -bottom-11" lineClassName="bottom-5 left-2.5 h-6 w-px" />
                </div>
              </div>
              <ol className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-oe-foreground-primary">
                <li>5 · Content container</li><li>6 · Leading element <span className="text-oe-foreground-placeholder">(Optional)</span></li><li>7 · Right Description <span className="text-oe-foreground-placeholder">(Optional)</span></li><li>8 · Trailing element <span className="text-oe-foreground-placeholder">(Optional)</span></li><li>9 · Bottom Description <span className="text-oe-foreground-placeholder">(Optional)</span></li>
              </ol>
            </div>
          </div>
        </Section>

        <Section id="appearance" title="Properties · Appearance" description="기본 Label, Container와 교체 가능한 요소를 비교합니다.">
          <StateExample label="Default · Unchecked"><StaticField value="default-unchecked" label={c.label} /></StateExample>
          <StateExample label="Default · Checked"><StaticField value="default-checked" selected label={c.label} /></StateExample>
          <div className="col-span-full rounded-xl border border-oe-border-secondary p-4">
            <p className="text-[11px] font-medium text-oe-foreground-primary">Radio container</p>
            <p className="mt-1 text-xs leading-5 text-oe-foreground-tertiary">Radio와 Label 전체를 하나의 선택 가능한 bordered surface로 묶습니다.</p>
            <RadioGroup defaultValue="container-checked" className="mt-4 grid max-w-md gap-2"><RadioContainer value="container-unchecked" label="Unchecked" /><RadioContainer value="container-checked" label="Checked" /><RadioContainer value="container-flipped" flipped label="Flipped · Indicator right" /></RadioGroup>
          </div>
          <div className="col-span-full rounded-xl border border-oe-border-secondary p-4">
            <p className="text-[11px] font-medium text-oe-foreground-primary">Leading element</p>
            <p className="mt-1 text-xs leading-5 text-oe-foreground-tertiary">텍스트 Content 앞의 Swap 영역입니다. 아래 Remix 아이콘은 배치 가능한 콘텐츠 예시이며 고정 요소가 아닙니다.</p>
            <RadioGroup className="mt-4 max-w-md"><RadioContainer value="leading" label={<span className="font-medium">이벤트 알림 받기</span>} bottomDescription="새로운 이벤트와 혜택 소식을 받을 수 있습니다." leadingElement={<RiNotification3Line className="size-oe-icon-small text-oe-foreground-secondary" aria-hidden="true" />} /></RadioGroup>
          </div>
          <div className="col-span-full rounded-xl border border-oe-border-secondary p-4">
            <p className="text-[11px] font-medium text-oe-foreground-primary">Trailing element</p>
            <p className="mt-1 text-xs leading-5 text-oe-foreground-tertiary">텍스트 Content 뒤의 Swap 영역입니다. 아래 Badge는 배치 가능한 콘텐츠 예시이며 고정 요소가 아닙니다.</p>
            <RadioGroup className="mt-4 max-w-md"><RadioContainer value="trailing" label={<span className="font-medium">자동 분배</span>} bottomDescription="설정한 규칙과 조건에 따라 담당자 또는 팀에게 자동 분배됩니다." trailingElement={<Badge color="red" size="xsmall">NEW</Badge>} /></RadioGroup>
          </div>
        </Section>

        <Section id="state" title="Properties · State" description="선택값은 고정하고 Focus와 Pressed 피드백은 실제로 확인합니다.">
          <StateGroup title="Radio" description="원자적인 Radio Control과 RadioField의 상태입니다.">
            <StateExample label="Unchecked"><StaticField value="unchecked" label={c.label} /></StateExample>
            <StateExample label="Checked"><StaticField value="checked" selected label={c.label} /></StateExample>
            <StateExample label="Focus visible"><StaticField value="focus" radioClassName="ring-2 ring-oe-focus-ring ring-offset-2 ring-offset-oe-background-primary" label={c.label} /></StateExample>
            <StateExample label="Disabled · Unchecked"><StaticField value="disabled-unchecked" disabled label={c.label} /></StateExample>
            <StateExample label="Disabled · Checked"><StaticField value="disabled-checked" selected disabled label={c.label} /></StateExample>
          </StateGroup>
          <StateGroup title="Radio Container" description="기본 Radio와 RadioField를 전체 선택 영역으로 감싼 구성입니다. 내부 Radio 상태를 그대로 사용합니다.">
            <StateExample label="Unchecked"><StaticContainer value="c-unchecked" label={c.label} /></StateExample>
            <StateExample label="Checked"><StaticContainer value="c-checked" selected label={c.label} /></StateExample>
            <StateExample label="Focus visible"><StaticContainer value="c-focus" radioClassName="ring-2 ring-oe-focus-ring ring-offset-2 ring-offset-oe-background-primary" label={c.label} /></StateExample>
            <StateExample label="Disabled · Unchecked"><StaticContainer value="c-disabled-unchecked" disabled label={c.label} /></StateExample>
            <StateExample label="Disabled · Checked"><StaticContainer value="c-disabled-checked" selected disabled label={c.label} /></StateExample>
          </StateGroup>
        </Section>

        <Section id="property-map" title="Property map" description="현재 구현된 Base UI Radio 속성과 ooee Field·Container 범위입니다.">
          <div className="col-span-full overflow-x-auto"><table className="w-full min-w-[38rem] text-left text-xs"><thead className="border-b border-oe-border-secondary text-oe-foreground-tertiary"><tr><th className="py-2">Property</th><th>Values</th><th>Default</th></tr></thead><tbody className="divide-y divide-oe-border-secondary text-oe-foreground-secondary">
            <MapRow property="value" values="string" defaultValue="required" /><MapRow property="disabled" values="false | true" defaultValue="false" /><MapRow property="readOnly" values="false | true" defaultValue="false" /><MapRow property="required" values="false | true" defaultValue="false" /><MapRow property="label" values="ReactNode (Field / Container)" defaultValue="required" /><MapRow property="rightDescription" values="ReactNode" defaultValue="undefined" /><MapRow property="bottomDescription" values="ReactNode" defaultValue="undefined" /><MapRow property="leadingElement" values="ReactNode" defaultValue="undefined" /><MapRow property="trailingElement" values="ReactNode" defaultValue="undefined" /><MapRow property="layout" values="inline | block (Field only)" defaultValue="inline" /><MapRow property="flipped" values="false | true" defaultValue="false" />
          </tbody></table></div>
        </Section>
      </div>

      <OnThisPage items={sections} componentKey="radio" />
    </div>
  );
}

type FieldExampleProps = Omit<ComponentProps<typeof RadioField>, "value"> & { value: string; selected?: boolean };
type ContainerExampleProps = Omit<ComponentProps<typeof RadioContainer>, "value"> & { value: string; selected?: boolean };

function StaticField({ value, selected = false, ...props }: FieldExampleProps) { return <RadioGroup value={selected ? value : "none"} onValueChange={() => undefined}><RadioField value={value} {...props} /></RadioGroup>; }
function StaticContainer({ value, selected = false, ...props }: ContainerExampleProps) { return <RadioGroup value={selected ? value : "none"} onValueChange={() => undefined}><RadioContainer value={value} {...props} /></RadioGroup>; }
function Section({ id, title, description, children }: { id: string; title: string; description: string; children: ReactNode }) { return <section id={id} className="scroll-mt-20 rounded-2xl border border-oe-border-secondary bg-oe-background-primary p-5"><h3 className="text-sm font-semibold text-oe-foreground-primary">{title}</h3><p className="mt-1 text-xs leading-5 text-oe-foreground-tertiary">{description}</p><div className="mt-5 grid gap-3 @min-[720px]:grid-cols-2">{children}</div></section>; }
function StateExample({ label, children }: { label: string; children: ReactNode }) { return <div className="flex min-h-24 flex-col gap-4 rounded-xl border border-oe-border-secondary p-4"><p className="text-[11px] font-medium text-oe-foreground-primary">{label}</p><PreviewLocaleScope className="mt-auto">{children}</PreviewLocaleScope></div>; }
function StateGroup({ title, description, children }: { title: string; description: string; children: ReactNode }) { return <div className="col-span-full"><h4 className="text-xs font-semibold text-oe-foreground-primary">{title}</h4><p className="mt-1 text-xs leading-5 text-oe-foreground-tertiary">{description}</p><div className="mt-3 grid gap-3 @min-[720px]:grid-cols-2">{children}</div></div>; }
function AnatomyMarker({ number, className, lineClassName }: { number: string; className: string; lineClassName: string }) { return <span className={`absolute grid size-5 place-items-center rounded-full bg-oe-foreground-secondary text-[11px] text-oe-foreground-inverse ${className}`}>{number}<span aria-hidden="true" className={`absolute bg-oe-border-primary ${lineClassName}`} /></span>; }
function FieldContainerMarker() { return <span className="absolute -left-16 top-2 grid size-5 place-items-center rounded-full bg-oe-foreground-secondary text-[11px] text-oe-foreground-inverse">1<span aria-hidden="true" className="absolute left-5 top-2.5 h-px w-8 bg-oe-border-primary" /><span aria-hidden="true" className="absolute -top-2 left-13 h-9 w-px bg-oe-border-primary" /></span>; }
function ContentContainerMarker() { return <span className="absolute -right-16 top-2 grid size-5 place-items-center rounded-full bg-oe-foreground-secondary text-[11px] text-oe-foreground-inverse">5<span aria-hidden="true" className="absolute right-5 top-2.5 h-px w-8 bg-oe-border-primary" /><span aria-hidden="true" className="absolute -top-2 right-13 h-12 w-px bg-oe-border-primary" /></span>; }
function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) { return <div className="flex items-center justify-between gap-3"><span className="text-[11px] font-medium text-oe-foreground-tertiary">{label}</span><button type="button" role="switch" aria-checked={value} aria-label={label} onClick={() => onChange(!value)} className={`relative h-5 w-9 rounded-full ${value ? "bg-oe-background-bold-primary" : "bg-oe-background-secondary ring-1 ring-inset ring-oe-border-primary"}`}><span className={`absolute top-0.5 size-4 rounded-full bg-oe-background-primary shadow-sm transition-[left] ${value ? "left-[18px]" : "left-0.5"}`} /></button></div>; }
function Control({ label, children }: { label: string; children: ReactNode }) { return <fieldset><legend className="mb-2 text-[11px] font-medium text-oe-foreground-tertiary">{label}</legend><div className="flex flex-wrap gap-1.5">{children}</div></fieldset>; }
function Choice({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) { return <button type="button" aria-pressed={active} onClick={onClick} className={`rounded-lg border px-2.5 py-1.5 text-xs ${active ? "border-oe-foreground-primary bg-oe-background-bold-primary text-oe-foreground-inverse" : "border-oe-border-secondary text-oe-foreground-secondary hover:bg-oe-interaction-hover"}`}>{children}</button>; }
function MapRow({ property, values, defaultValue }: { property: string; values: string; defaultValue: string }) { return <tr><td className="py-2 pr-4 font-mono text-[11px] text-oe-foreground-primary">{property}</td><td className="pr-4">{values}</td><td>{defaultValue}</td></tr>; }
