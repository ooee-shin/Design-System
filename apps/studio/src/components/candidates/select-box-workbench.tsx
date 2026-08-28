"use client";

import { useState, type ReactNode } from "react";

import { SelectBox, SelectBoxGroup, type SelectBoxColumns, type SelectBoxSelectionMode } from "@ooee/ui";
import { AnatomySwapSlot } from "@/components/anatomy-swap-slot";
import { AnatomyBoundaryMarker, AnatomyLegend, AnatomyNumber, AnatomyStructureMap, AnatomySurface } from "@/components/component-anatomy";
import { OnThisPage } from "@/components/component-detail-navigation";
import { DependentControlGroup, PlaygroundChoice as Choice, PlaygroundElementControl, PlaygroundElementGraphic, type PlaygroundElementValue } from "@/components/playground-element-control";
import { PreviewLocaleScope } from "@/components/preview-locale-scope";
import { useStudioPreferences } from "@/components/studio-preferences-provider";

const sections = [
  { id: "playground", label: "Playground" },
  { id: "anatomy", label: "Anatomy" },
];

const copy = {
  ko: {
    description: "정의된 선택지를 화면에 펼쳐 놓고 상세 정보를 비교하며 하나 이상 선택하는 입력 컴포넌트입니다.",
    groupLabel: "Select Box Group",
    options: [
      { value: "option-a", title: "Label A" },
      { value: "option-b", title: "Label B" },
      { value: "option-c", title: "Label C" },
    ],
  },
  en: {
    description: "Presents defined choices in place so users can compare details and select one or more values.",
    groupLabel: "Select Box Group",
    options: [
      { value: "option-a", title: "Label A" },
      { value: "option-b", title: "Label B" },
      { value: "option-c", title: "Label C" },
    ],
  },
} as const;

export function SelectBoxWorkbench() {
  const { locale } = useStudioPreferences();
  const c = copy[locale];
  const [selectionMode, setSelectionMode] = useState<SelectBoxSelectionMode>("single");
  const [singleValue, setSingleValue] = useState<string>("");
  const [multipleValue, setMultipleValue] = useState<string[]>([]);
  const [columnMode, setColumnMode] = useState<"single" | "multiple">("single");
  const [columnCount, setColumnCount] = useState<SelectBoxColumns>(2);
  const [showTrailingElement, setShowTrailingElement] = useState(true);
  const [leadingElement, setLeadingElement] = useState<PlaygroundElementValue>({ kind: "none", icon: "global", image: "avatar" });
  const [description, setDescription] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [readOnly, setReadOnly] = useState(false);

  const value = selectionMode === "single" ? singleValue : multipleValue;
  const onValueChange = (nextValue: string | string[]) => {
    if (selectionMode === "single") setSingleValue(String(nextValue));
    else setMultipleValue(Array.isArray(nextValue) ? nextValue : [nextValue]);
  };

  return (
    <div className="grid items-start gap-6 @min-[1120px]:grid-cols-[minmax(0,1fr)_11rem]">
      <div className="min-w-0 space-y-5">
        <header className="rounded-2xl border border-oe-border-secondary bg-oe-background-primary p-5">
          <h2 className="text-lg font-semibold text-oe-foreground-primary">Select Box</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-oe-foreground-secondary">{c.description}</p>
        </header>

        <Section id="playground" title="🚩 Playground" description="선택 방식, 열 수, Control과 선택 요소를 조합하고 전체 카드의 선택 동작을 확인합니다.">
          <div className="col-span-full grid gap-5 rounded-xl border-2 border-oe-border-bold-primary bg-oe-background-secondary p-4 @min-[760px]:grid-cols-[minmax(14rem,1fr)_16rem]">
            <PreviewLocaleScope className="rounded-xl bg-oe-background-primary p-5">
              <SelectBoxGroup
                ariaLabel={c.groupLabel}
                selectionMode={selectionMode}
                value={value}
                onValueChange={onValueChange}
                columns={columnMode === "single" ? 1 : columnCount}
                trailingElement={showTrailingElement ? (selectionMode === "single" ? "radio" : "checkbox") : "none"}
                disabled={disabled}
                readOnly={readOnly}
              >
                {c.options.map((option) => (
                  <SelectBox
                    key={option.value}
                    value={option.value}
                    title={option.title}
                    description={description ? "Description" : undefined}
                    leadingElement={leadingElement.kind === "none" ? undefined : <PlaygroundElementGraphic value={leadingElement} className="size-8" />}
                  />
                ))}
              </SelectBoxGroup>
            </PreviewLocaleScope>
            <div className="space-y-4 rounded-xl bg-oe-background-primary p-4">
              <ControlGroup label="Selection mode">{(["single", "multiple"] as const).map((item) => <Choice key={item} active={selectionMode === item} onClick={() => setSelectionMode(item)}>{capitalize(item)}</Choice>)}</ControlGroup>
              <ControlGroup label="Columns">
                <Choice active={columnMode === "single"} onClick={() => setColumnMode("single")}>Single column</Choice>
                <Choice active={columnMode === "multiple"} onClick={() => setColumnMode("multiple")}>Multi column</Choice>
              </ControlGroup>
              {columnMode === "multiple" ? <DependentControlGroup><NumberControl label="Column count" value={columnCount} min={2} max={6} onChange={setColumnCount} /></DependentControlGroup> : null}
              <ControlGroup label="Trailing element">
                <Choice active={showTrailingElement} onClick={() => setShowTrailingElement(true)}>{selectionMode === "single" ? "Radio" : "Checkbox"}</Choice>
                <Choice active={!showTrailingElement} onClick={() => setShowTrailingElement(false)}>None</Choice>
              </ControlGroup>
              <Toggle label="Disabled" value={disabled} onChange={setDisabled} />
              <Toggle label="Read only" value={readOnly} onChange={setReadOnly} />
              <PlaygroundElementControl label="Leading element" value={leadingElement} onChange={setLeadingElement} showValueControl={false} />
              <Toggle label="Description" value={description} onChange={setDescription} />
            </div>
          </div>
        </Section>

        <Section id="anatomy" title="Anatomy" description="하나의 Select Box와 여러 항목을 묶는 Group의 최소 구조를 표시합니다.">
          <div>
            <AnatomySurface ariaLabel="Select Box anatomy" title="Select Box structure" className="min-h-[290px]">
              <div className="absolute left-1/2 top-1/2 w-[min(72%,36rem)] -translate-x-1/2 -translate-y-1/2">
                <div className="relative flex min-h-24 items-center gap-3 rounded-xl border border-oe-border-primary bg-oe-background-primary p-4">
                  <AnatomySwapSlot className="shrink-0" />
                  <span className="min-w-0 flex-1"><span className="block text-sm font-medium">Title</span><span className="mt-0.5 block text-xs text-oe-foreground-tertiary">Description</span></span>
                  <AnatomySwapSlot className="shrink-0" />
                </div>
                <AnatomyBoundaryMarker number={1} side="left" connectorLength={36} boundaryLength={96} className="-left-16 top-1/2 -translate-y-1/2" />
                <AnatomyNumber number={2} className="left-3 -top-10" lineClassName="left-1/2 top-5 h-7 w-px" />
                <AnatomyNumber number={3} className="left-[38%] -bottom-10" lineClassName="bottom-5 left-1/2 h-7 w-px" />
                <AnatomyNumber number={4} className="left-[54%] -top-10" lineClassName="left-1/2 top-5 h-8 w-px" />
                <AnatomyNumber number={5} className="left-[62%] -bottom-10" lineClassName="bottom-5 left-1/2 h-8 w-px" />
                <AnatomyNumber number={6} className="-right-16 top-1/2 -translate-y-1/2" lineClassName="right-5 top-1/2 h-px w-11" />
              </div>
            </AnatomySurface>
            <AnatomyLegend items={[{ name: "Container" }, { name: "Leading element", optional: true }, { name: "Content container" }, { name: "Title" }, { name: "Description", optional: true }, { name: "Trailing element", optional: true }]} />
            <div className="mt-4"><AnatomyStructureMap lines={[{ name: "Select Box Group" }, { prefix: "└─ ", name: "Select Box" }, { prefix: "   ├─ ", name: "Leading element", optional: true }, { prefix: "   ├─ ", name: "Content container" }, { prefix: "   │  ├─ ", name: "Title" }, { prefix: "   │  └─ ", name: "Description", optional: true }, { prefix: "   └─ ", name: "Trailing element", optional: true }]} /></div>
          </div>
        </Section>

      </div>
      <OnThisPage items={sections} componentKey="select-box" />
    </div>
  );
}

function Section({ id, title, description, children }: { id: string; title: string; description: string; children: ReactNode }) { return <section id={id} className="scroll-mt-20 rounded-2xl border border-oe-border-secondary bg-oe-background-primary p-5"><h3 className="text-xl font-semibold tracking-tight text-oe-foreground-primary">{title}</h3><p className="mt-1 text-xs leading-5 text-oe-foreground-tertiary">{description}</p><div className="mt-5">{children}</div></section>; }
function ControlGroup({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) { return <fieldset className={className}><legend className="mb-2 text-[11px] font-medium text-oe-foreground-tertiary">{label}</legend><div className="flex flex-wrap gap-1.5">{children}</div></fieldset>; }
function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) { return <div className="flex items-center justify-between gap-3"><span className="text-[11px] font-medium text-oe-foreground-tertiary">{label}</span><button type="button" role="switch" aria-checked={value} aria-label={label} onClick={() => onChange(!value)} className={`relative h-5 w-9 shrink-0 rounded-full ${value ? "bg-oe-background-bold-primary" : "bg-oe-background-secondary ring-1 ring-inset ring-oe-border-primary"}`}><span className={`absolute top-0.5 size-4 rounded-full bg-oe-background-primary shadow-sm transition-[left] ${value ? "left-[18px]" : "left-0.5"}`} /></button></div>; }
function NumberControl({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (value: number) => void }) { return <label className="block"><span className="mb-1.5 block text-[11px] font-medium text-oe-foreground-tertiary">{label}</span><input type="number" value={value} min={min} max={max} step={1} onChange={(event) => onChange(Math.min(max, Math.max(min, Number(event.target.value))))} className="h-8 w-full rounded-lg border border-oe-border-primary bg-oe-background-primary px-2.5 text-xs tabular-nums text-oe-foreground-primary outline-none focus:border-oe-focus-ring focus:ring-1 focus:ring-oe-focus-ring" /></label>; }
function capitalize(value: string) { return value.charAt(0).toUpperCase() + value.slice(1); }
