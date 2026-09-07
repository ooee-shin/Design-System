"use client";

import { useState, type ReactNode } from "react";
import { RiMapPinLine, RiArrowDownSLine } from "@remixicon/react";

import { Chip, type ChipShape, type ChipSize } from "@ooee/ui";
import { OnThisPage } from "@/components/component-detail-navigation";
import { DependentControlGroup, PlaygroundChoice as Choice } from "@/components/playground-element-control";
import { PreviewLocaleScope } from "@/components/preview-locale-scope";
import { useStudioPreferences } from "@/components/studio-preferences-provider";

type ChipElement = "none" | "icon";
type ChipState = "default" | "active";

const sections = [{ id: "playground", label: "Playground" }];

const copy = {
  ko: {
    description: "선택한 값이나 필터 항목을 한 줄 Container로 표시하는 컴포넌트입니다. 확정 전 초안이므로 현재는 Playground만 제공합니다.",
    label: "서울특별시",
    ariaLabel: "지역",
  },
  en: {
    description: "Displays a selected value or filter item in a single-line container. This is a draft, so only the playground is available for now.",
    label: "Seoul",
    ariaLabel: "Region",
  },
} as const;

export function ChipWorkbench() {
  const { locale } = useStudioPreferences();
  const c = copy[locale];
  const [controlSize, setControlSize] = useState<ChipSize>("regular");
  const [shape, setShape] = useState<ChipShape>("rounded");
  const [previewState, setPreviewState] = useState<ChipState>("default");
  const [label, setLabel] = useState(true);
  const [leadingElement, setLeadingElement] = useState<ChipElement>("icon");
  const [trailingElement, setTrailingElement] = useState<ChipElement>("none");

  // Label 이 없으면 Icon only 이므로 Leading element 가 유일한 내용이 된다.
  const resolvedLeading: ChipElement = label ? leadingElement : "icon";

  return (
    <div className="grid items-start gap-6 @min-[1120px]:grid-cols-[minmax(0,1fr)_11rem]">
      <div className="min-w-0 space-y-5">
        <p className="text-sm leading-6 text-oe-foreground-secondary">{c.description}</p>

        <Section id="playground" title="🚩 Playground" description="Size와 Shape, 상태, 내부 요소를 조합해 확인합니다.">
          <div className="col-span-full grid gap-5 rounded-xl border-2 border-oe-border-bold-primary bg-oe-background-secondary p-4 @min-[1000px]:grid-cols-[minmax(18rem,1fr)_minmax(20rem,1fr)]">
            <PreviewLocaleScope className="flex min-h-40 items-start rounded-xl bg-oe-background-primary p-5">
              <Chip
                controlSize={controlSize}
                shape={shape}
                active={previewState === "active"}
                leadingElement={resolvedLeading === "icon" ? <RiMapPinLine /> : undefined}
                trailingElement={trailingElement === "icon" ? <RiArrowDownSLine /> : undefined}
                ariaLabel={c.ariaLabel}
              >
                {label ? c.label : undefined}
              </Chip>
            </PreviewLocaleScope>
            <div className="grid gap-5 @min-[720px]:grid-cols-2">
              <div className="space-y-4">
                <ControlSection title="Appearance">
                  <ControlGroup label="Control size">{(["small", "regular", "large", "xlarge"] as const).map((item) => <Choice key={item} active={controlSize === item} onClick={() => setControlSize(item)}>{capitalize(item)}</Choice>)}</ControlGroup>
                  <ControlGroup label="Shape">{(["rounded", "circle"] as const).map((item) => <Choice key={item} active={shape === item} onClick={() => setShape(item)}>{capitalize(item)}</Choice>)}</ControlGroup>
                </ControlSection>
                <ControlSection title="State">
                  <ControlGroup label="Preview state">{(["default", "active"] as const).map((item) => <Choice key={item} active={previewState === item} onClick={() => setPreviewState(item)}>{capitalize(item)}</Choice>)}</ControlGroup>
                </ControlSection>
              </div>
              <div className="space-y-4">
                <ControlSection title="Content">
                  <Toggle label="Label" value={label} onChange={setLabel} />
                  {label ? null : <DependentControlGroup><p className="text-[11px] leading-4 text-oe-foreground-placeholder">Label이 없으면 Icon only이므로 Leading element를 유지합니다.</p></DependentControlGroup>}
                </ControlSection>
                <ControlSection title="Elements">
                  <ControlGroup label="Leading element">{(["none", "icon"] as const).map((item) => <Choice key={item} active={resolvedLeading === item} onClick={() => setLeadingElement(item)}>{capitalize(item)}</Choice>)}</ControlGroup>
                  <ControlGroup label="Trailing element">{(["none", "icon"] as const).map((item) => <Choice key={item} active={trailingElement === item} onClick={() => setTrailingElement(item)}>{capitalize(item)}</Choice>)}</ControlGroup>
                </ControlSection>
              </div>
            </div>
          </div>
        </Section>
      </div>
      <OnThisPage items={sections} componentKey="chip" />
    </div>
  );
}

function Section({ id, title, description, children }: { id: string; title: string; description: string; children: ReactNode }) { return <section id={id} className="scroll-mt-20 rounded-2xl border border-oe-border-secondary bg-oe-background-primary p-5"><h3 className="text-lg font-semibold text-oe-foreground-primary">{title}</h3><p className="mt-1 text-xs leading-5 text-oe-foreground-tertiary">{description}</p><div className="mt-5 grid gap-3 @min-[720px]:grid-cols-2">{children}</div></section>; }
function ControlSection({ title, children }: { title: string; children: ReactNode }) { return <section><h4 className="mb-3 text-sm font-semibold text-oe-foreground-primary">{title}</h4><div className="space-y-3">{children}</div></section>; }
function ControlGroup({ label, children }: { label: string; children: ReactNode }) { return <fieldset><legend className="mb-2 text-[11px] font-medium text-oe-foreground-tertiary">{label}</legend><div className="flex flex-wrap gap-1.5">{children}</div></fieldset>; }
function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) { return <div className="flex items-center justify-between gap-3"><span className="text-[11px] font-medium text-oe-foreground-tertiary">{label}</span><button type="button" role="switch" aria-checked={value} aria-label={label} onClick={() => onChange(!value)} className={`relative h-5 w-9 shrink-0 rounded-full ${value ? "bg-oe-background-bold-primary" : "bg-oe-background-secondary ring-1 ring-inset ring-oe-border-primary"}`}><span className={`absolute top-0.5 size-4 rounded-full bg-oe-background-primary shadow-sm transition-[left] ${value ? "left-[18px]" : "left-0.5"}`} /></button></div>; }
function capitalize(value: string) { return value.charAt(0).toUpperCase() + value.slice(1); }
