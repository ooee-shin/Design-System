"use client";

import { useState, type ReactNode } from "react";
import { Input, NumberInput, type NumberInputProps } from "@ooee/ui";
import { AnatomyBoundaryMarker, AnatomyLegend, AnatomyNumber, AnatomySurface } from "@/components/component-anatomy";
import { GuidelineList, UsageComparison } from "@/components/component-guidelines";
import { GuidelineTitle } from "@/components/guideline-title";
import { OnThisPage } from "@/components/component-detail-navigation";
import { PlaygroundChoice as Choice } from "@/components/playground-element-control";
import { PreviewLocaleScope } from "@/components/preview-locale-scope";
import { useStudioPreferences } from "@/components/studio-preferences-provider";

type PreviewState = "default" | "focus" | "invalid" | "disabled" | "readOnly";

const copy = {
  ko: {
    description: "정확한 숫자를 직접 입력하거나 증감 버튼으로 조절하는 컴포넌트입니다. 범위와 증감 단위가 있는 수량, 순서와 비율 입력에 사용합니다.",
    decrease: "값 줄이기",
    increase: "값 늘리기",
    decreaseTooltip: "감소",
    increaseTooltip: "증가",
  },
  en: {
    description: "A numeric control for entering an exact value directly or adjusting it with step buttons. It supports quantities, order, and percentages with defined ranges and increments.",
    decrease: "Decrease value",
    increase: "Increase value",
    decreaseTooltip: "Decrease",
    increaseTooltip: "Increase",
  },
} as const;

const sections = [
  { id: "playground", label: "Playground" },
  { id: "anatomy", label: "Anatomy" },
  { id: "style", label: "Style" },
  { id: "size", label: "Size" },
  { id: "layout", label: "Layout" },
  { id: "alignment", label: "Text alignment" },
  { id: "affix", label: "Prefix / Suffix" },
  { id: "behavior", label: "Behavior" },
  { id: "state", label: "State" },
  { id: "examples", label: "Examples" },
  { id: "guidelines", label: "Guidelines" },
  { id: "property-map", label: "Property map" },
];

export function NumberInputWorkbench() {
  const { locale } = useStudioPreferences();
  const [value, setValue] = useState<number | undefined>(10);
  const [variant, setVariant] = useState<"outline" | "filled">("outline");
  const [controlSize, setControlSize] = useState<"small" | "regular" | "large" | "xlarge">("regular");
  const [layout, setLayout] = useState<"fill" | "fixed">("fill");
  const [textAlign, setTextAlign] = useState<"left" | "right">("left");
  const [fixedWidth, setFixedWidth] = useState(240);
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(100);
  const [step, setStep] = useState(1);
  const [hideControls, setHideControls] = useState(false);
  const [controlsPosition, setControlsPosition] = useState<"trailing" | "split">("trailing");
  const [allowNegative, setAllowNegative] = useState(false);
  const [previewState, setPreviewState] = useState<PreviewState>("default");

  return (
    <div className="grid items-start gap-6 @min-[1120px]:grid-cols-[minmax(0,1fr)_11rem]">
      <div className="min-w-0 space-y-5">

        <Section id="playground" title="🚩 Playground" description="Style, Size, Layout, 숫자 범위와 증감 동작을 조합하여 확인합니다.">
          <div className="col-span-full grid gap-5 rounded-xl border-2 border-oe-border-bold-primary bg-oe-background-secondary p-4 @min-[1000px]:grid-cols-[minmax(18rem,1fr)_minmax(36rem,1.4fr)]">
            <div className="flex min-h-52 items-start rounded-xl bg-oe-background-primary p-5">
              <StudioNumberInput
                locale={locale}
                variant={variant}
                controlSize={controlSize}
                {...(layout === "fixed" ? { layout: "fixed" as const, fixedWidth } : { layout: "fill" as const })}
                textAlign={textAlign}
                value={value}
                min={min}
                max={max}
                step={step}
                hideControls={hideControls}
                controlsPosition={controlsPosition}
                allowNegative={allowNegative}
                disabled={previewState === "disabled"}
                readOnly={previewState === "readOnly"}
                aria-invalid={previewState === "invalid" ? "true" : undefined}
                containerClassName={previewState === "focus" ? "border-oe-focus-ring bg-oe-background-primary ring-1 ring-oe-focus-ring" : undefined}
                onValueChange={setValue}
              />
            </div>
            <div className="grid gap-5 @min-[720px]:grid-cols-2">
              <div className="space-y-4">
                <ControlSection title="Appearance"><ControlGroup label="Style">{(["outline", "filled"] as const).map((item) => <Choice key={item} active={variant === item} onClick={() => setVariant(item)}>{capitalize(item)}</Choice>)}</ControlGroup></ControlSection>
                <ControlSection title="Size"><ControlGroup label="Control size">{(["small", "regular", "large", "xlarge"] as const).map((item) => <Choice key={item} active={controlSize === item} onClick={() => setControlSize(item)}>{capitalize(item)}</Choice>)}</ControlGroup></ControlSection>
                <ControlSection title="Layout"><ControlGroup label="Width behavior">{(["fill", "fixed"] as const).map((item) => <Choice key={item} active={layout === item} onClick={() => setLayout(item)}>{capitalize(item)}</Choice>)}</ControlGroup>{layout === "fixed" ? <NumberControl label="Width · px" value={fixedWidth} min={120} max={640} onChange={setFixedWidth} /> : null}<ControlGroup label="Text alignment">{(["left", "right"] as const).map((item) => <Choice key={item} active={textAlign === item} onClick={() => setTextAlign(item)}>{capitalize(item)}</Choice>)}</ControlGroup>{controlsPosition === "split" && !hideControls ? <p className="text-[11px] leading-4 text-oe-foreground-placeholder">Split controls에서는 숫자를 중앙에 정렬합니다.</p> : null}</ControlSection>
                <ControlSection title="State"><ControlGroup label="Preview state">{(["default", "focus", "invalid", "disabled", "readOnly"] as const).map((item) => <Choice key={item} active={previewState === item} onClick={() => setPreviewState(item)}>{item === "readOnly" ? "Read only" : capitalize(item)}</Choice>)}</ControlGroup></ControlSection>
              </div>
              <div className="space-y-4">
                <ControlSection title="Content"><NumberControl label="Value" value={value ?? 0} min={min} max={max} onChange={setValue} /></ControlSection>
                <ControlSection title="Behavior">
                  <div className="grid gap-3 sm:grid-cols-3"><NumberControl label="Min" value={min} min={-1000} max={max} onChange={(next) => { setMin(next); if (value != null && value < next) setValue(next); }} /><NumberControl label="Max" value={max} min={min} max={10000} onChange={(next) => { setMax(next); if (value != null && value > next) setValue(next); }} /><NumberControl label="Step" value={step} min={1} max={1000} onChange={setStep} /></div>
                  <div className="mt-4 space-y-3"><Toggle label="Show controls" value={!hideControls} onChange={(next) => setHideControls(!next)} />{!hideControls ? <ControlGroup label="Controls position">{(["trailing", "split"] as const).map((item) => <Choice key={item} active={controlsPosition === item} onClick={() => setControlsPosition(item)}>{capitalize(item)}</Choice>)}</ControlGroup> : null}<Toggle label="Allow negative" value={allowNegative} onChange={(next) => { setAllowNegative(next); if (next) setMin((current) => current < 0 ? current : -100); else { setMin((current) => Math.max(0, current)); setValue((current) => current == null ? current : Math.max(0, current)); } }} /></div>
                </ControlSection>
              </div>
            </div>
          </div>
        </Section>

        <Section id="anatomy" title="Anatomy" description="Number Input을 구성하는 실제 요소와 문서에서 사용하는 명칭입니다.">
          <NumberInputAnatomy locale={locale} />
        </Section>

        <Section id="style" title="Properties · Style" description="Input과 동일한 Outline과 회색조 Filled 두 스타일을 사용합니다.">
          <Example label="Outline"><StudioNumberInput locale={locale} defaultValue={10} min={0} max={100} /></Example>
          <Example label="Filled"><StudioNumberInput locale={locale} variant="filled" defaultValue={10} min={0} max={100} /></Example>
        </Section>

        <Section id="size" title="Properties · Size" description="Input과 Button이 공유하는 공통 Control Height를 그대로 사용합니다.">
          <Example label="Small · 32px"><StudioNumberInput locale={locale} controlSize="small" defaultValue={10} /></Example>
          <Example label="Regular · 36px · Default"><StudioNumberInput locale={locale} controlSize="regular" defaultValue={10} /></Example>
          <Example label="Large · 40px"><StudioNumberInput locale={locale} controlSize="large" defaultValue={10} /></Example>
          <Example label="XLarge · 48px"><StudioNumberInput locale={locale} controlSize="xlarge" defaultValue={10} /></Example>
        </Section>

        <Section id="layout" title="Properties · Layout" description="Fill은 부모 너비를 채우고, Fixed는 지정한 너비를 유지하되 부모보다 넓어지지 않습니다.">
          <Example label="Fill · Default"><StudioNumberInput locale={locale} defaultValue={10} /></Example>
          <Example label="Fixed · 200px"><StudioNumberInput locale={locale} layout="fixed" fixedWidth={200} defaultValue={10} /></Example>
        </Section>

        <Section id="alignment" title="Properties · Text alignment" description="숫자를 왼쪽 또는 오른쪽에 정렬합니다. 기본값은 Left이며 Split controls에서는 Center가 우선합니다.">
          <Example label="Left · Default"><StudioNumberInput locale={locale} defaultValue={10} textAlign="left" /></Example>
          <Example label="Right"><StudioNumberInput locale={locale} defaultValue={1000} textAlign="right" /></Example>
        </Section>

        <Section id="affix" title="Properties · Prefix / Suffix" description="숫자의 앞이나 뒤에 통화 기호, 단위처럼 값의 의미를 보완하는 요소를 표시할 수 있습니다.">
          <Example label="Prefix" description="숫자 앞에 표시하며 Secondary 또는 Tertiary 위계를 선택할 수 있습니다."><div className="space-y-2"><AffixToneLabel>Secondary</AffixToneLabel><StudioNumberInput locale={locale} defaultValue={1000} prefix="₩" prefixTone="secondary" layout="fixed" fixedWidth={180} /><AffixToneLabel>Tertiary</AffixToneLabel><StudioNumberInput locale={locale} defaultValue={1000} prefix="₩" prefixTone="tertiary" layout="fixed" fixedWidth={180} /></div></Example>
          <Example label="Suffix" description="숫자 뒤에 표시하며 Secondary 또는 Tertiary 위계를 선택할 수 있습니다."><div className="space-y-2"><AffixToneLabel>Secondary</AffixToneLabel><StudioNumberInput locale={locale} defaultValue={10} suffix="%" suffixTone="secondary" layout="fixed" fixedWidth={180} /><AffixToneLabel>Tertiary</AffixToneLabel><StudioNumberInput locale={locale} defaultValue={10} suffix="%" suffixTone="tertiary" layout="fixed" fixedWidth={180} /></div></Example>
        </Section>

        <Section id="behavior" title="Properties · Behavior" description="숫자 범위, 증감 단위와 버튼 표시 여부를 제어합니다.">
          <Example label="Min / Max" description="입력하고 조절할 수 있는 최소값과 최대값을 설정할 수 있습니다."><StudioNumberInput locale={locale} defaultValue={5} min={0} max={10} /></Example>
          <Example label="Step" description="증감 버튼을 누를 때 변경되는 단위를 설정할 수 있습니다. 기본값은 1입니다."><StudioNumberInput locale={locale} defaultValue={10} min={0} max={100} step={5} /></Example>
          <Example label="Trailing controls" description="증감 버튼을 숫자 오른쪽에 함께 배치할 수 있습니다."><StudioNumberInput locale={locale} defaultValue={10} controlsPosition="trailing" /></Example>
          <Example label="Split controls" description="감소 버튼과 증가 버튼을 숫자 양쪽에 나누어 배치할 수 있습니다."><StudioNumberInput locale={locale} defaultValue={10} controlsPosition="split" /></Example>
          <Example label="Controls hidden" description="증감 버튼을 숨기고 숫자를 직접 입력하는 방식으로 사용할 수 있습니다."><StudioNumberInput locale={locale} defaultValue={1000} hideControls /></Example>
          <Example label="Negative allowed" description="최소값이 0보다 작을 때 음수 입력을 허용할 수 있습니다."><StudioNumberInput locale={locale} defaultValue={-5} min={-100} max={100} allowNegative /></Example>
        </Section>

        <Section id="state" title="Properties · State" description="값은 고정하지만 입력, 증감 버튼의 Focus와 Pressed 피드백은 실제로 확인할 수 있습니다.">
          <Example label="Default"><StudioNumberInput locale={locale} value={10} onValueChange={() => undefined} /></Example>
          <Example label="Focus"><StudioNumberInput locale={locale} value={10} onValueChange={() => undefined} containerClassName="border-oe-focus-ring ring-1 ring-oe-focus-ring" /></Example>
          <Example label="Invalid"><StudioNumberInput locale={locale} value={-1} onValueChange={() => undefined} aria-invalid="true" /></Example>
          <Example label="Disabled" fixed><StudioNumberInput locale={locale} defaultValue={10} disabled tabIndex={-1} /></Example>
          <Example label="Read only" fixed><StudioNumberInput locale={locale} defaultValue={10} readOnly tabIndex={-1} /></Example>
        </Section>

        <Section id="examples" title="Examples" description="확인된 Number Input 동작을 실제 입력 목적에 맞게 조합한 예시입니다.">
          <Example label="Quantity" description="최소 1개부터 최대 99개까지 한 개 단위로 조절합니다."><StudioNumberInput locale={locale} defaultValue={1} min={1} max={99} layout="fixed" fixedWidth={180} /></Example>
          <Example label="Percentage" description="0%부터 100%까지 5% 단위로 조절합니다."><StudioNumberInput locale={locale} defaultValue={10} min={0} max={100} step={5} suffix="%" layout="fixed" fixedWidth={180} /></Example>
          <Example label="Direct input" description="증감 동작이 필요하지 않은 정확한 숫자를 직접 입력합니다."><StudioNumberInput locale={locale} defaultValue={1000} hideControls layout="fixed" fixedWidth={240} /></Example>
        </Section>

        <Section id="guidelines" title="Guidelines" description="컴포넌트를 고르고 값을 정할 때의 기준입니다.">
          <div className="col-span-full grid gap-8">
            <UsageComparison
              title="Input과 Number Input을 나눠 쓰기"
              doText="계산에 쓰이는 숫자는 Number Input을 사용하세요."
              dontText="자리 구분이 필요한 값에 Number Input을 쓰지 마세요."
              description={[
                "수량, 순서, 비율처럼 더하고 빼고 비교하는 값은 Number Input이 담당합니다.",
                "자리 구분이 필요한 값은 Input에서 표기를 만듭니다. Number Input은 값에 구분자를 담을 수 없고, 담게 만들면 키보드 화살표 증감과 범위 검증과 폼 제출값을 함께 잃습니다.",
              ]}
              doVisual={<StudioNumberInput locale={locale} defaultValue={12} min={0} max={99} />}
              dontVisual={<Input value="1,250,000" readOnly suffix={locale === "ko" ? "원" : "KRW"} textAlign="right" className="tabular-nums" aria-label={locale === "ko" ? "금액" : "Amount"} />}
            />
            <div>
              <GuidelineTitle>증감 버튼 위치를 한 페이지에서 섞지 않기</GuidelineTitle>
              <GuidelineList items={[
                <><code className="text-xs text-oe-foreground-primary">controlsPosition</code>은 <code className="text-xs text-oe-foreground-primary">trailing</code>과 <code className="text-xs text-oe-foreground-primary">split</code> 중 하나를 페이지 전체에서 일관되게 사용합니다.</>,
                "같은 화면에 두 배치가 함께 있으면 어느 버튼이 어느 값을 조절하는지 눈으로 좇기 어려워집니다.",
              ]} />
            </div>
            <div>
              <GuidelineTitle>음수는 필요한 자리에서만 허용하기</GuidelineTitle>
              <GuidelineList items={[
                <><code className="text-xs text-oe-foreground-primary">allowNegative</code>의 기본값이 <code className="text-xs text-oe-foreground-primary">false</code>이므로 유효한 최소값은 0입니다.</>,
                "이 컴포넌트가 담당하는 수량과 순서와 비율에는 음수가 필요하지 않습니다. 증감이나 온도차처럼 음수가 값의 일부인 자리에서만 켭니다.",
              ]} />
            </div>
            <div>
              <GuidelineTitle>증감 단위를 값의 성격에 맞추기</GuidelineTitle>
              <GuidelineList items={[
                <><code className="text-xs text-oe-foreground-primary">step</code>의 기본값은 1이며, 값이 실제로 움직이는 단위가 다르면 페이지마다 조정합니다.</>,
                "수량은 1, 비율은 5나 10, 금액은 1000처럼 한 번 누를 때 의미가 있는 크기를 사용합니다.",
              ]} />
            </div>
          </div>
        </Section>

        <Section id="property-map" title="Property map" description="현재 구현에서 확인되는 Property와 허용 값을 정리합니다.">
          <div className="col-span-full overflow-x-auto">
            <table className="w-full min-w-[44rem] text-left text-xs">
              <thead className="border-b border-oe-border-secondary text-oe-foreground-tertiary"><tr><th className="py-2 font-medium">Property</th><th className="py-2 font-medium">Values</th><th className="py-2 font-medium">Default</th><th className="py-2 font-medium">Status</th></tr></thead>
              <tbody className="divide-y divide-oe-border-secondary text-oe-foreground-secondary">
                <MapRow property="variant" values="outline | filled" defaultValue="outline" />
                <MapRow property="controlSize" values="small | regular | large | xlarge" defaultValue="regular" />
                <MapRow property="layout" values="fill | fixed" defaultValue="fill" />
                <MapRow property="textAlign" values="left | right" defaultValue="left" note="Split controls use center" />
                <MapRow property="value" values="number | undefined" defaultValue="undefined" />
                <MapRow property="min / max" values="number" defaultValue="undefined" />
                <MapRow property="step" values="number" defaultValue="1" />
                <MapRow property="prefix / suffix" values="ReactNode" defaultValue="undefined" />
                <MapRow property="prefixTone / suffixTone" values="secondary | tertiary" defaultValue="secondary" />
                <MapRow property="hideControls" values="boolean" defaultValue="false" />
                <MapRow property="controlsPosition" values="trailing | split" defaultValue="trailing" />
                <MapRow property="allowNegative" values="boolean" defaultValue="true" />
                <MapRow property="state" values="default | focus | invalid | disabled | readOnly" defaultValue="default" note="Native attributes and focus" />
              </tbody>
            </table>
          </div>
        </Section>
      </div>
      <OnThisPage items={sections} componentKey="number-input" />
    </div>
  );
}

function NumberInputAnatomy({ locale }: { locale: keyof typeof copy }) {
  return (
    <div className="col-span-full min-w-0">
      <AnatomySurface ariaLabel="Number Input anatomy" title="Number Input structure" className="px-5 pb-5 pt-12">
        <div className="overflow-x-auto">
          <div className="relative mx-auto flex h-48 w-[34rem] items-center justify-center">
            <div className="pointer-events-none w-60"><StudioNumberInput locale={locale} defaultValue={10} prefix="Prefix" suffix="Suffix" readOnly /></div>
            <AnatomyBoundaryMarker number={1} side="left" connectorLength={92} boundaryLength={36} className="left-8 top-[5.4rem]" />
            <AnatomyNumber number={2} className="left-[10rem] top-5" lineClassName="left-2.5 top-5 h-14 w-px" />
            <AnatomyNumber number={3} className="left-[11.125rem] bottom-4" lineClassName="bottom-5 left-2.5 h-14 w-px" />
            <AnatomyNumber number={4} className="left-[19.1875rem] top-5" lineClassName="left-2.5 top-5 h-14 w-px" />
            <AnatomyNumber number={5} className="right-48 bottom-4" lineClassName="bottom-5 left-2.5 h-14 w-px" />
            <AnatomyNumber number={6} className="right-[10.3125rem] top-5" lineClassName="left-2.5 top-5 h-14 w-px" />
          </div>
        </div>
      </AnatomySurface>
      <AnatomyLegend items={[{ name: "Container" }, { name: "Prefix", optional: true }, { name: "Input field" }, { name: "Suffix", optional: true }, { name: "Decrease button", optional: true }, { name: "Increase button", optional: true }]} />
    </div>
  );
}

function StudioNumberInput({ locale, ...props }: NumberInputProps & { locale: keyof typeof copy }) {
  const c = copy[locale];
  return <NumberInput decreaseLabel={c.decrease} increaseLabel={c.increase} decreaseTooltip={c.decreaseTooltip} increaseTooltip={c.increaseTooltip} {...props} />;
}

function AffixToneLabel({ children }: { children: ReactNode }) { return <p className="text-[10px] font-medium uppercase tracking-wide text-oe-foreground-placeholder">{children}</p>; }

function Section({ id, title, description, children }: { id: string; title: string; description: string; children: ReactNode }) { return <section id={id} className="scroll-mt-20 rounded-2xl border border-oe-border-secondary bg-oe-background-primary p-5"><h3 className="text-lg font-semibold text-oe-foreground-primary">{title}</h3><p className="mt-1 text-xs leading-5 text-oe-foreground-tertiary">{description}</p><div className="mt-5 grid gap-3 @min-[720px]:grid-cols-2">{children}</div></section>; }
function Example({ label, description, children }: { label: string; description?: string; children: ReactNode; fixed?: boolean }) { return <div className="flex min-h-32 min-w-0 flex-col gap-3 rounded-xl border border-oe-border-secondary p-4"><div><p className="text-xs font-medium text-oe-foreground-primary">{label}</p>{description ? <p className="mt-1 text-[11px] leading-4 text-oe-foreground-tertiary">{description}</p> : null}</div><PreviewLocaleScope className="mt-auto">{children}</PreviewLocaleScope></div>; }
function ControlSection({ title, children }: { title: string; children: ReactNode }) { return <section><h4 className="mb-3 text-sm font-semibold text-oe-foreground-primary">{title}</h4><div className="space-y-3">{children}</div></section>; }
function ControlGroup({ label, children }: { label: string; children: ReactNode }) { return <fieldset><legend className="mb-2 text-[11px] font-medium text-oe-foreground-tertiary">{label}</legend><div className="flex flex-wrap gap-1.5">{children}</div></fieldset>; }
function NumberControl({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (value: number) => void }) { return <label className="block"><span className="mb-1.5 block text-[11px] font-medium text-oe-foreground-tertiary">{label}</span><input type="number" value={value} min={min} max={max} onChange={(event) => onChange(Number(event.target.value))} className="h-8 w-full rounded-lg border border-oe-border-primary bg-oe-background-primary px-2.5 text-xs tabular-nums text-oe-foreground-primary outline-none focus:border-oe-focus-ring focus:ring-1 focus:ring-oe-focus-ring" /></label>; }
function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) { return <div className="flex items-center justify-between gap-3"><span className="text-[11px] font-medium text-oe-foreground-tertiary">{label}</span><button type="button" role="switch" aria-checked={value} aria-label={label} onClick={() => onChange(!value)} className={`relative h-5 w-9 rounded-full ${value ? "bg-oe-background-bold-primary" : "bg-oe-background-secondary ring-1 ring-inset ring-oe-border-primary"}`}><span className={`absolute top-0.5 size-4 rounded-full bg-oe-background-primary shadow-sm transition-[left] ${value ? "left-[18px]" : "left-0.5"}`} /></button></div>; }
function MapRow({ property, values, defaultValue, note = "Confirmed" }: { property: string; values: string; defaultValue: string; note?: string }) { return <tr><td className="py-3 pr-4 font-medium text-oe-foreground-primary">{property}</td><td className="py-3 pr-4 font-mono text-[11px]">{values}</td><td className="py-3 pr-4 font-mono text-[11px]">{defaultValue}</td><td className="py-3">{note}</td></tr>; }
function capitalize(value: string) { return value.charAt(0).toUpperCase() + value.slice(1); }
