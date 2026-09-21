"use client";

import { useState, type ComponentProps, type ReactNode } from "react";
import { RiNotification3Line } from "@remixicon/react";
import { Radio, RadioField, RadioGroup } from "@ooee/ui";

import { AnatomySwapSlot } from "@/components/anatomy-swap-slot";
import { AnatomyBoundaryMarker, AnatomyFrame, AnatomyLegend, AnatomyNumber, AnatomyStructureMap, AnatomySurface } from "@/components/component-anatomy";
import { OnThisPage } from "@/components/component-detail-navigation";
import { GuidelineList, GuideVisual, TargetArea, UsageComparison } from "@/components/component-guidelines";
import { GuidelineTitle } from "@/components/guideline-title";
import { PlaygroundChoice as Choice } from "@/components/playground-element-control";
import { PreviewLocaleScope } from "@/components/preview-locale-scope";
import { useStudioPreferences } from "@/components/studio-preferences-provider";

const previewCopy = {
  ko: { label: "선택 항목", right: "우측 설명", bottom: "선택 항목에 대한 추가 설명입니다.", group: "알림 수신 빈도", optionA: "모든 알림", optionB: "중요 알림만", optionC: "알림 받지 않기", independentGroup: "사용할 알림 기능", independentA: "로그인 알림", independentB: "결제 알림", disabled: "현재 선택할 수 없는 항목", leadingLabel: "이벤트 알림 받기", leadingBottom: "새로운 이벤트와 혜택 소식을 받을 수 있습니다.", trailingLabel: "자동 분배", trailingBottom: "설정한 규칙과 조건에 따라 담당자 또는 팀에게 자동 분배됩니다.", radioOnly: "Control only · 36px target", combinedExample: "콘텐츠 결합 예시", themeTitle: "테마 설정", themeSystem: "시스템 설정", themeLight: "밝은 모드", themeDark: "어두운 모드" },
  en: { label: "Option", right: "Description", bottom: "Additional information about this option.", group: "Notification frequency", optionA: "All notifications", optionB: "Important only", optionC: "No notifications", independentGroup: "Notification features", independentA: "Login alerts", independentB: "Payment alerts", disabled: "Option currently unavailable", leadingLabel: "Receive event updates", leadingBottom: "Get updates about new events and benefits.", trailingLabel: "Automatic assignment", trailingBottom: "Automatically assigns an owner or team based on your rules and conditions.", radioOnly: "Control only · 36px target", combinedExample: "Combined content example", themeTitle: "Theme settings", themeSystem: "System setting", themeLight: "Light mode", themeDark: "Dark mode" },
} as const;

const sections = [
  { id: "playground", label: "Playground" },
  { id: "anatomy", label: "Anatomy" },
  { id: "elements", label: "Elements" },
  { id: "state", label: "State" },
  { id: "layout", label: "Layout" },
  { id: "guidelines", label: "Guidelines" },
  { id: "property-map", label: "Property map" },
];

export function RadioIndicatorWorkbench() {
  const { locale } = useStudioPreferences();
  const c = previewCopy[locale];
  const [selected, setSelected] = useState(true);
  const [disabled, setDisabled] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [showRightDescription, setShowRightDescription] = useState(false);
  const [showBottomDescription, setShowBottomDescription] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [layout, setLayout] = useState<"hug" | "fill">("hug");

  return (
    <div className="grid items-start gap-6 @min-[1120px]:grid-cols-[minmax(0,1fr)_11rem]">
      <div className="min-w-0 space-y-5">

        <Section id="playground" title="🚩 Playground" description="현재 구현된 선택, 비활성, 콘텐츠와 배치 속성을 조합해 확인합니다.">
          <div className="col-span-full grid gap-5 rounded-xl border-2 border-oe-border-bold-primary bg-oe-background-secondary p-4 @min-[760px]:grid-cols-[minmax(14rem,1fr)_16rem]">
            <PreviewLocaleScope className="min-h-44 rounded-xl bg-oe-background-primary p-5">
              <RadioGroup value={selected ? "option" : "none"} onValueChange={(value) => setSelected(value === "option")}>
                <RadioField value="option" disabled={disabled} readOnly={readOnly} label="Label" rightDescription={showRightDescription ? "Right Description" : undefined} bottomDescription={showBottomDescription ? "Bottom Description" : undefined} layout={layout} flipped={flipped} />
              </RadioGroup>
            </PreviewLocaleScope>
            <div className="space-y-5 rounded-xl bg-oe-background-primary p-4">
              <ControlSection title="Appearance">
                <Control label="Layout"><Choice active={layout === "hug"} onClick={() => setLayout("hug")}>Hug</Choice><Choice active={layout === "fill"} onClick={() => setLayout("fill")}>Fill</Choice></Control>
                <Toggle label="Flipped" value={flipped} onChange={setFlipped} />
              </ControlSection>
              <ControlSection title="State">
                <Toggle label="Disabled" value={disabled} onChange={setDisabled} />
                <Toggle label="Read only" value={readOnly} onChange={setReadOnly} />
              </ControlSection>
              <ControlSection title="Content">
                <Toggle label="Selected" value={selected} onChange={setSelected} />
              </ControlSection>
              <ControlSection title="Elements">
                <Toggle label="Right description" value={showRightDescription} onChange={setShowRightDescription} />
                <Toggle label="Bottom description" value={showBottomDescription} onChange={setShowBottomDescription} />
              </ControlSection>
            </div>
          </div>
        </Section>

        <Section id="anatomy" title="Anatomy" description="현재 Radio Field를 구성하는 실제 요소입니다.">
          <div className="col-span-full grid gap-8">
            <div>
              <AnatomySurface ariaLabel="Radio basic anatomy" title="Basic anatomy" className="px-5 pb-5 pt-12">
                <p className="text-xs leading-5 text-oe-foreground-tertiary">RadioField의 기본 구조만 표시합니다.</p>
                <div lang="en" className="mt-3 px-1 py-6">
                  <AnatomyFrame className="mx-auto my-14">
                    <RadioGroup value="anatomy-basic"><RadioField value="anatomy-basic" label="Label" /></RadioGroup>
                    <AnatomyBoundaryMarker number={1} target="label" side="left" connectorLength={32} />
                    <AnatomyNumber number={2} target="[data-slot=radio]" side="top" />
                    <AnatomyNumber number={3} target="[data-slot=radio-indicator]" side="bottom" />
                    <AnatomyNumber number={4} target="text:Label" side="bottom" />
                  </AnatomyFrame>
                </div>
              </AnatomySurface>
              <AnatomyLegend items={[{ name: "Field" }, { name: "Radio control" }, { name: "Selection indicator" }, { name: "Label" }]} />
            </div>

            <div>
              <AnatomySurface ariaLabel="Radio extended anatomy" title="Extended anatomy" className="px-5 pb-5 pt-12">
                <p className="text-xs leading-5 text-oe-foreground-tertiary">Basic 구조에 추가할 수 있는 Optional 요소만 번호로 표시합니다.</p>
                <div lang="en" className="mt-3 px-1 py-6">
                  <AnatomyFrame className="mx-auto my-14">
                    <RadioGroup value="anatomy-extended"><RadioField value="anatomy-extended" label="Label" rightDescription="Right Description" bottomDescription="Bottom Description" leadingElement={<AnatomySwapSlot />} trailingElement={<AnatomySwapSlot />} /></RadioGroup>
                    <AnatomyBoundaryMarker number={5} target="wraps:Label,Right Description,Bottom Description" side="right" connectorLength={32} />
                    <AnatomyNumber number={6} target="[data-slot=radio-leading]" side="top" />
                    <AnatomyNumber number={7} target="text:Right Description" side="top" />
                    <AnatomyNumber number={8} target="[data-slot=radio-trailing]" side="top" />
                    <AnatomyNumber number={9} target="text:Bottom Description" side="bottom" />
                  </AnatomyFrame>
                </div>
              </AnatomySurface>
              <AnatomyLegend start={5} items={[{ name: "Content container" }, { name: "Leading element", optional: true }, { name: "Right Description", optional: true }, { name: "Trailing element", optional: true }, { name: "Bottom Description", optional: true }]} />
            </div>

            <AnatomyStructureMap lines={[
              { name: "Field" },
              { prefix: "├─ ", name: "Radio control" },
              { prefix: "│  └─ ", name: "Selection indicator" },
              { prefix: "└─ ", name: "Content container" },
              { prefix: "   ├─ ", name: "Leading element", optional: true },
              { prefix: "   ├─ ", name: "Label" },
              { prefix: "   ├─ ", name: "Right Description", optional: true },
              { prefix: "   ├─ ", name: "Trailing element", optional: true },
              { prefix: "   └─ ", name: "Bottom Description", optional: true },
            ]} />
          </div>
        </Section>

        <Section id="elements" title="Properties · Elements" description="텍스트 Content 앞뒤에 놓이는 교체 가능한 요소를 비교합니다. 두 예시는 실제로 선택할 수 있습니다.">
          <div className="col-span-full rounded-xl border border-oe-border-secondary p-4">
            <p className="text-xs font-medium text-oe-foreground-primary">Leading element</p>
            <p className="mt-1 text-xs leading-5 text-oe-foreground-tertiary">텍스트 Content 앞의 Swap 영역입니다. 아래 Remix 아이콘은 배치 가능한 콘텐츠 예시이며 고정 요소가 아닙니다.</p>
            <RadioGroup className="mt-4 max-w-md"><RadioField value="leading" layout="fill" label={<span className="font-medium">{c.leadingLabel}</span>} bottomDescription={c.leadingBottom} leadingElement={<RiNotification3Line className="size-oe-icon-small text-oe-foreground-secondary" aria-hidden="true" />} /></RadioGroup>
          </div>
          <div className="col-span-full rounded-xl border border-oe-border-secondary p-4">
            <p className="text-xs font-medium text-oe-foreground-primary">Trailing element</p>
            <p className="mt-1 text-xs leading-5 text-oe-foreground-tertiary">텍스트 Content 뒤의 Swap 영역입니다. 아래 Badge는 배치 가능한 콘텐츠 예시이며 고정 요소가 아닙니다.</p>
            <RadioGroup className="mt-4 max-w-md"><RadioField value="trailing" layout="fill" label={<span className="font-medium">{c.trailingLabel}</span>} bottomDescription={c.trailingBottom} trailingElement={<span className="inline-flex h-4 items-center gap-0.5 rounded-full bg-red-100 px-1.5 text-[10px] font-medium leading-none text-red-800 dark:bg-red-950 dark:text-red-200">NEW</span>} /></RadioGroup>
          </div>
        </Section>

        <Section id="state" title="Properties · State" description="선택값은 고정하고 Focus와 Pressed 피드백은 실제로 확인합니다.">
          <StateGroup title="Radio" description="원자적인 Radio Control과 RadioField의 상태입니다.">
            <StateExample label="Unchecked"><StaticField value="unchecked" label={c.label} /></StateExample>
            <StateExample label="Checked"><StaticField value="checked" selected label={c.label} /></StateExample>
            <StateExample label="Focus visible"><StaticField value="focus" radioClassName="ring-2 ring-oe-focus-ring ring-offset-2 ring-offset-oe-background-primary" label={c.label} /></StateExample>
            <StateExample label="Disabled · Unchecked"><StaticField value="disabled-unchecked" disabled label={c.label} /></StateExample>
            <StateExample label="Disabled · Checked"><StaticField value="disabled-checked" selected disabled label={c.label} /></StateExample>
            <StateExample label="Read only · Checked"><StaticField value="readonly" selected readOnly label={c.label} /></StateExample>
          </StateGroup>
        </Section>

        <Section id="layout" title="Layout" description="여러 Radio를 한 Group에서 사용할 때의 가로 줄바꿈과 세로 배열을 비교합니다.">
          <div className="col-span-full rounded-xl border border-oe-border-secondary bg-oe-background-primary p-4">
            <div>
              <h4 className="text-sm font-semibold text-oe-foreground-primary">Horizontal · Wrap</h4>
              <p className="mt-1 text-xs leading-5 text-oe-foreground-tertiary">짧은 항목을 가로로 나열하고 사용할 수 있는 너비가 부족하면 다음 줄로 이어집니다.</p>
              <RadioGroup defaultValue="horizontal-b" className="mt-3 flex flex-wrap gap-x-4" aria-label="Horizontal radio layout">
                {["A", "B", "C", "D", "E"].map((suffix) => <RadioField key={suffix} value={`horizontal-${suffix.toLowerCase()}`} label={`${c.label} ${suffix}`} />)}
              </RadioGroup>
            </div>
            <div className="mt-6 border-t border-oe-border-secondary pt-5">
              <h4 className="text-sm font-semibold text-oe-foreground-primary">Vertical · Block</h4>
              <p className="mt-1 text-xs leading-5 text-oe-foreground-tertiary">각 항목이 부모 너비를 채우며 36px 최소 행 높이로 이어집니다.</p>
              <RadioGroup defaultValue="vertical-b" className="mt-3 grid" aria-label="Vertical radio layout">
                {["A", "B", "C"].map((suffix) => <RadioField key={suffix} value={`vertical-${suffix.toLowerCase()}`} layout="fill" label={`${c.label} ${suffix}`} />)}
              </RadioGroup>
            </div>
          </div>
        </Section>

        <Section id="guidelines" title="Guidelines" description="Radio를 구성하고 배치할 때 적용하는 기준입니다.">
          <div className="col-span-full grid gap-10">
            <div>
              <GuidelineTitle>Target area 확보하기</GuidelineTitle>
              <div className="mt-3 grid gap-3 @min-[720px]:grid-cols-2">
                <GuideVisual label="16px Control"><TargetArea label="36px" className="min-h-9 min-w-48"><RadioGroup defaultValue="target-a"><RadioField value="target-a" label={c.label} /></RadioGroup></TargetArea></GuideVisual>
                <GuideVisual label="Row composition"><TargetArea label="48px" className="min-h-12 w-full"><RadioGroup defaultValue="target-row" className="w-full"><RadioField value="target-row" label={c.label} layout="fill" /></RadioGroup></TargetArea></GuideVisual>
              </div>
              <GuidelineList items={["16px Control만 보이더라도 RadioField는 최소 36px 높이의 조작 영역을 확보합니다.", "목록이나 행과 결합하면 Control만이 아니라 Label을 포함한 전체 RadioField를 선택 영역으로 사용합니다."]} />
            </div>

            <UsageComparison
              title="서로 배타적인 선택에 사용하기"
              doText="한 Group 안에서 하나만 고를 수 있는 답에 Radio를 사용합니다."
              dontText="서로 독립적인 설정을 Radio 한 Group으로 묶지 않습니다."
              description={["Radio는 하나를 고르면 같은 Group의 이전 선택이 해제되는 항목에 사용합니다.", "각 항목을 따로 켜고 끌 수 있어야 한다면 Checkbox를 사용합니다."]}
              doVisual={<fieldset className="w-full"><legend className="mb-1 text-xs font-medium text-oe-foreground-secondary">{c.group}</legend><RadioGroup defaultValue="frequency-a" className="-ml-2 grid"><RadioField value="frequency-a" label={c.optionA} /><RadioField value="frequency-b" label={c.optionB} /><RadioField value="frequency-c" label={c.optionC} /></RadioGroup></fieldset>}
              dontVisual={<fieldset className="w-full"><legend className="mb-1 text-xs font-medium text-oe-foreground-secondary">{c.independentGroup}</legend><RadioGroup defaultValue="independent-a" className="-ml-2 grid"><RadioField value="independent-a" label={c.independentA} /><RadioField value="independent-b" label={c.independentB} /></RadioGroup></fieldset>}
            />

            <UsageComparison
              title="Group의 질문을 명확하게 표시하기"
              doText="Radio 목록 위에 Group 전체가 답하는 질문을 표시합니다."
              dontText="선택지가 무엇에 대한 답인지 추측하게 만들지 않습니다."
              description={["접근 가능한 Group 이름은 보이는 제목과 연결합니다.", "각 Radio의 Label은 서로 구분되는 답을 간결하게 설명합니다."]}
              doVisual={<fieldset className="w-full"><legend className="mb-1 text-xs font-medium text-oe-foreground-secondary">{c.group}</legend><RadioGroup defaultValue="named-a" className="-ml-2 grid"><RadioField value="named-a" label={c.optionA} /><RadioField value="named-b" label={c.optionB} /></RadioGroup></fieldset>}
              dontVisual={<RadioGroup defaultValue="unnamed-a" className="grid w-full" aria-label={c.group}><RadioField value="unnamed-a" label={c.optionA} /><RadioField value="unnamed-b" label={c.optionB} /></RadioGroup>}
            />

            <UsageComparison
              title="Disabled 상태를 명확하게 표시하기"
              doText="Control과 Label 전체에 Disabled 표현을 적용합니다."
              dontText="Control만 비활성화하고 Label은 활성 상태처럼 남기지 않습니다."
              description={["사용할 수 없는 이유가 필요하면 Field의 설명이나 주변 안내로 제공합니다.", "Disabled 상태에서도 기존 선택값은 보존합니다."]}
              doVisual={<RadioGroup value="disabled-do"><RadioField value="disabled-do" disabled label={c.disabled} /></RadioGroup>}
              dontVisual={<RadioGroup value="disabled-dont"><div className="inline-flex min-h-9 items-center gap-2"><RadioField value="disabled-dont" disabled label={<span className="text-oe-foreground-primary">{c.disabled}</span>} /></div></RadioGroup>}
            />

            <div>
              <GuidelineTitle>선택 가능한 콘텐츠와 결합하기</GuidelineTitle>
              <div className="mt-3 grid gap-3 @min-[720px]:grid-cols-2">
                <GuideVisual label={c.radioOnly}>
                  <RadioGroup defaultValue="radio-only" className="grid w-full place-items-center">
                    <RadioField value="radio-only" label={<span className="sr-only">{c.radioOnly}</span>} className="min-h-9 gap-0 p-0" />
                  </RadioGroup>
                </GuideVisual>
                <GuideVisual label={c.combinedExample} contentClassName="p-5">
                  <div className="w-full">
                    <p className="text-base font-semibold leading-6 text-oe-foreground-primary">{c.themeTitle}</p>
                    <div className="mt-3 overflow-x-auto pb-1">
                      <RadioGroup defaultValue="theme-system" className="grid w-max min-w-full grid-flow-col auto-cols-fr gap-3" aria-label={c.themeTitle}>
                        <ThemeOptionCard value="theme-system" label={c.themeSystem} theme="system" />
                        <ThemeOptionCard value="theme-light" label={c.themeLight} theme="light" />
                        <ThemeOptionCard value="theme-dark" label={c.themeDark} theme="dark" />
                      </RadioGroup>
                    </div>
                  </div>
                </GuideVisual>
              </div>
              <GuidelineList items={["Radio는 16px Control을 기본 단위로 사용하고, 실제 화면에서는 Label이나 선택 가능한 콘텐츠와 결합해 충분한 조작 영역을 확보합니다.", "이 예시는 별도 Container 변형이 아니라 선택 가능한 콘텐츠가 동작을 소유하고 Radio Control만 상태 표시와 입력에 재사용한 조합입니다.", "같은 Group의 카드는 동일한 정보 구조와 크기를 사용하고 한 번에 하나만 선택되도록 합니다.", "여러 카드를 동시에 선택할 수 있어야 한다면 Checkbox Control을 같은 방식으로 조합합니다."]} />
            </div>

            <div>
              <GuidelineTitle>Radio 나열하기</GuidelineTitle>
              <GuidelineList items={["Radio는 반드시 하나의 Group 안에서 사용하고 같은 질문에 대한 선택지만 함께 묶습니다.", "여러 Radio는 기본적으로 세로로 나열해 Label을 빠르게 훑을 수 있게 합니다.", "짧은 항목을 빠르게 비교하는 밀도 높은 관리자 화면에서는 16px 간격의 가로 줄바꿈을 사용할 수 있습니다."]} />
            </div>
          </div>
        </Section>

        <Section id="property-map" title="Property map" description="현재 구현된 Base UI Radio 속성과 ooee Field 범위입니다.">
          <div className="col-span-full overflow-x-auto"><table className="w-full min-w-[38rem] text-left text-xs"><thead className="border-b border-oe-border-secondary text-oe-foreground-tertiary"><tr><th className="py-2">Property</th><th>Values</th><th>Default</th></tr></thead><tbody className="divide-y divide-oe-border-secondary text-oe-foreground-secondary">
            <MapRow property="value" values="string" defaultValue="required" /><MapRow property="disabled" values="false | true" defaultValue="false" /><MapRow property="readOnly" values="false | true" defaultValue="false" /><MapRow property="required" values="false | true" defaultValue="false" /><MapRow property="label" values="ReactNode (Field)" defaultValue="required" /><MapRow property="rightDescription" values="ReactNode" defaultValue="undefined" /><MapRow property="bottomDescription" values="ReactNode" defaultValue="undefined" /><MapRow property="leadingElement" values="ReactNode" defaultValue="undefined" /><MapRow property="trailingElement" values="ReactNode" defaultValue="undefined" /><MapRow property="layout" values="hug | fill (Field only)" defaultValue="hug" /><MapRow property="flipped" values="false | true" defaultValue="false" />
          </tbody></table></div>
        </Section>
      </div>

      <OnThisPage items={sections} componentKey="radio" />
    </div>
  );
}

type FieldExampleProps = Omit<ComponentProps<typeof RadioField>, "value"> & { value: string; selected?: boolean };
function StaticField({ value, selected = false, ...props }: FieldExampleProps) { return <RadioGroup value={selected ? value : "none"} onValueChange={() => undefined}><RadioField value={value} {...props} /></RadioGroup>; }
function ControlSection({ title, children }: { title: string; children: ReactNode }) { return <section><h4 className="mb-3 text-sm font-semibold text-oe-foreground-primary">{title}</h4><div className="space-y-3">{children}</div></section>; }

function Section({ id, title, description, children }: { id: string; title: string; description: string; children: ReactNode }) { return <section id={id} className="scroll-mt-20 rounded-2xl border border-oe-border-secondary bg-oe-background-primary p-5"><h3 className="text-xl font-semibold tracking-tight text-oe-foreground-primary">{title}</h3><p className="mt-1 text-xs leading-5 text-oe-foreground-tertiary">{description}</p><div className="mt-5 grid gap-3 @min-[720px]:grid-cols-2">{children}</div></section>; }
function StateExample({ label, children }: { label: string; children: ReactNode }) { return <div className="flex min-h-24 flex-col gap-4 rounded-xl border border-oe-border-secondary p-4"><p className="text-xs font-medium text-oe-foreground-primary">{label}</p><PreviewLocaleScope className="mt-auto">{children}</PreviewLocaleScope></div>; }
function StateGroup({ title, description, children }: { title: string; description: string; children: ReactNode }) { return <div className="col-span-full mt-8 first:mt-0"><h4 className="text-sm font-semibold text-oe-foreground-primary">{title}</h4><p className="mt-1 text-xs leading-5 text-oe-foreground-tertiary">{description}</p><div className="mt-3 grid gap-3 @min-[720px]:grid-cols-2">{children}</div></div>; }
function ThemeOptionCard({ value, label, theme }: { value: string; label: string; theme: "system" | "light" | "dark" }) {
  const labelId = `theme-option-${theme}`;
  return (
    <label className="relative grid cursor-pointer gap-1 [&:has([data-slot=radio][data-checked])_.theme-preview-frame]:border-oe-border-bold-primary [&:has([data-slot=radio]:focus-visible)_.theme-preview-frame]:!border-oe-focus-ring">
      <span className="theme-preview-frame block rounded-xl border-2 border-transparent p-[3px] transition-[border-color] duration-150">
        <ThemePreview theme={theme} />
      </span>
      <span className="flex min-h-7 items-center gap-2 pl-1">
        <Radio value={value} aria-labelledby={labelId} className="focus-visible:ring-0 focus-visible:ring-offset-0" />
        <span id={labelId} className="whitespace-nowrap text-sm font-medium leading-5 text-oe-foreground-primary">{label}</span>
      </span>
    </label>
  );
}
function ThemePreview({ theme }: { theme: "system" | "light" | "dark" }) {
  const dark = theme === "dark";
  const sidebar = dark ? "bg-neutral-950" : theme === "light" ? "bg-neutral-100" : "bg-gradient-to-b from-neutral-950 from-50% to-neutral-100 to-50%";
  const content = dark ? "bg-neutral-900 text-white" : theme === "light" ? "bg-white text-neutral-900" : "bg-gradient-to-b from-neutral-900 from-50% to-white to-50% text-neutral-500";
  return <span aria-hidden="true" className="flex h-24 w-full overflow-hidden rounded-lg border border-black/10 dark:border-white/16"><span className={`w-1/4 shrink-0 ${sidebar}`} /><span className={`flex-1 p-3 ${content}`}><span className="block h-1.5 w-1/3 rounded-full bg-current opacity-35" /><span className="mt-2 block h-1.5 w-1/2 rounded-full bg-current opacity-20" /><span className="mt-7 block h-6 w-full rounded-md bg-current opacity-10" /></span></span>;
}
function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) { return <div className="flex items-center justify-between gap-3"><span className="text-[11px] font-medium text-oe-foreground-tertiary">{label}</span><button type="button" role="switch" aria-checked={value} aria-label={label} onClick={() => onChange(!value)} className={`relative h-5 w-9 rounded-full ${value ? "bg-oe-background-bold-primary" : "bg-oe-background-secondary ring-1 ring-inset ring-oe-border-primary"}`}><span className={`absolute top-0.5 size-4 rounded-full bg-oe-background-primary shadow-sm transition-[left] ${value ? "left-[18px]" : "left-0.5"}`} /></button></div>; }
function Control({ label, children }: { label: string; children: ReactNode }) { return <fieldset><legend className="mb-2 text-[11px] font-medium text-oe-foreground-tertiary">{label}</legend><div className="flex flex-wrap gap-1.5">{children}</div></fieldset>; }
function MapRow({ property, values, defaultValue }: { property: string; values: string; defaultValue: string }) { return <tr><td className="py-2 pr-4 font-mono text-[11px] text-oe-foreground-primary">{property}</td><td className="pr-4">{values}</td><td>{defaultValue}</td></tr>; }
