"use client";

import { useState, type ReactNode } from "react";

import { CheckboxField, Switch, SwitchField } from "@ooee/ui";
import { AnatomyLegend, AnatomyNumber, AnatomyStructureMap, AnatomySurface } from "@/components/component-anatomy";
import { OnThisPage } from "@/components/component-detail-navigation";
import { DeferredChoice, GuidelineList, GuideVisual, TargetArea, UsageComparison } from "@/components/component-guidelines";
import { PlaygroundChoice as Choice } from "@/components/playground-element-control";
import { PreviewLocaleScope } from "@/components/preview-locale-scope";
import { GuidelineTitle } from "@/components/guideline-title";
import { useStudioPreferences } from "@/components/studio-preferences-provider";

const sections = [
  { id: "playground", label: "Playground" },
  { id: "anatomy", label: "Anatomy" },
  { id: "size", label: "Size" },
  { id: "layout", label: "Label position" },
  { id: "state", label: "State" },
  { id: "behavior", label: "Behavior" },
  { id: "guidelines", label: "Guidelines" },
  { id: "property-map", label: "Property map" },
];

const copy = {
  ko: {
    pageDescription: "설정이나 기능을 즉시 켜고 끕니다.",
    description: "독립적인 설정이나 기능을 즉시 켜고 끄는 컴포넌트입니다. 24px Control이 기본값입니다.",
    playgroundDescription: "On/Off, Disabled, Size와 Label 위치를 조합하고 실제 전환 동작을 확인합니다.",
    anatomyDescription: "Switch Control과 Label을 구성하는 실제 요소입니다.",
    sizeDescription: "Switch Control 전체 높이를 기준으로 16, 24, 32 세 크기를 제공합니다. 24px이 기본값이며 실제 조작 영역은 Control보다 크게 확보할 수 있습니다.",
    labelPositionDescription: "별도 Block Layout 없이 Label을 Switch Control의 오른쪽 또는 왼쪽에 배치합니다. 오른쪽이 기본값입니다.",
    stateDescription: "On/Off 값은 고정하고 Focus와 Pressed 피드백은 실제로 확인합니다.",
    behaviorDescription: "Switch는 값을 선택해 나중에 제출하는 요소가 아니라 설정을 즉시 전환합니다.",
    immediateChange: "누르면 On/Off 값이 즉시 변경되고 연결된 설정이나 기능에 바로 반영됩니다.",
    keyboard: "Focus 상태에서 Space를 누르면 On/Off가 전환됩니다.",
    disabledBehavior: "현재 On/Off 값은 유지하지만 사용자가 변경할 수 없습니다.",
    boundary: "선택 결과를 모아 저장하거나 제출해야 한다면 Checkbox를 사용합니다.",
    guidelinesDescription: "현재 확정한 Switch의 타깃 영역과 사용 범위입니다.",
    targetTitle: "Target area 확보하기",
    targetItems: ["16px Control도 최소 24px 높이의 Target area를 확보합니다.", "Switch Control과 Label을 포함한 전체 영역이 Target으로 동작합니다.", "List처럼 다른 요소와 결합하면 전체 Row를 Target으로 사용합니다."],
    immediateTitle: "상태를 즉시 활성화할 때만 사용하기",
    immediateDont: "즉각적인 결과가 없는 상황에서는 Switch를 사용하지 마세요.",
    immediateDo: "즉각적인 결과가 나타나지 않는 경우 Checkbox를 사용합니다.",
    immediateItems: ["Switch는 토글 시 즉각적인 결과가 나타나야 합니다. 마지막 버튼을 누를 때까지 결과가 나타나지 않는 경우 Checkbox를 사용합니다."],
    independentTitle: "독립적인 기능에서만 사용하기",
    independentDo: "각 Switch가 서로 영향을 주지 않는 독립적인 설정에 사용하세요.",
    independentDont: "하나의 Switch로 다른 Switch의 상태를 함께 바꾸지 마세요.",
    independentItems: ["Switch는 각각 독립적으로 On/Off되는 기능을 제어합니다.", "전체 선택과 하위 선택처럼 부모–자식 관계가 필요하면 Checkbox 구조를 사용합니다."],
    disabledTitle: "Disabled 상태는 명확하게 표현하기",
    disabledDo: "Switch와 Label을 함께 Disabled 상태로 표현하세요.",
    disabledDont: "Switch Control만 Disabled 색상으로 바꾸지 마세요.",
    disabledItems: ["Switch를 사용할 수 없다면 Label도 disabled foreground를 사용합니다.", "Control과 Label의 상태를 일치시켜 항목 전체를 조작할 수 없다는 점을 명확히 전달합니다."],
    propertyMapDescription: "현재 구현된 Base UI Switch 속성과 ooee가 확정한 Field 범위입니다.",
    similarDescription: "제출할 선택값을 설정하는 유사 Boolean control입니다.",
    worksWithDescription: "Label과 도움말을 Switch와 결합합니다.",
    label: "알림 받기",
    immediate: "알림 받기",
    deferred: "이용 약관에 동의합니다",
    email: "이메일 알림",
    push: "푸시 알림",
    all: "전체 알림",
    cancel: "취소",
    submit: "가입하기",
  },
  en: {
    pageDescription: "Turns a setting or feature on or off immediately.",
    description: "Immediately turns an independent setting or feature on or off. The 24px control is the default.",
    playgroundDescription: "Combine On/Off, Disabled, Size, and Label position and verify the actual toggle behavior.",
    anatomyDescription: "The actual elements that make up the Switch Control and Label.",
    sizeDescription: "Provides three Switch Control heights: 16, 24, and 32. The 24px control is the default, while the actual target area may be larger than the visual control.",
    labelPositionDescription: "Places the Label to the right or left of the Switch Control without a separate block layout. Right is the default.",
    stateDescription: "Keeps the On/Off value fixed while allowing real Focus and Pressed feedback.",
    behaviorDescription: "Switch changes a setting immediately instead of collecting a value for later submission.",
    immediateChange: "Pressing the control changes its On/Off value and immediately applies the connected setting or feature.",
    keyboard: "Pressing Space while focused toggles the On/Off state.",
    disabledBehavior: "The current On/Off value is preserved, but the user cannot change it.",
    boundary: "Use Checkbox when selections are collected and saved or submitted later.",
    guidelinesDescription: "The confirmed target-area and usage guidelines for Switch.",
    targetTitle: "Provide a sufficient target area",
    targetItems: ["Even the 16px Control provides a target area at least 24px high.", "The entire area containing the Switch Control and Label acts as the target.", "When combined with another element such as a List, use the entire Row as the target."],
    immediateTitle: "Use only for immediate activation",
    immediateDont: "Do not use Switch when the result is not applied immediately.",
    immediateDo: "Use Checkbox when the result is not applied immediately.",
    immediateItems: ["A Switch must produce an immediate result when toggled. Use Checkbox when the result is delayed until the final action button is pressed."],
    independentTitle: "Use only for independent features",
    independentDo: "Use each Switch for an independent setting that does not affect another Switch.",
    independentDont: "Do not use one Switch to change the state of other Switches.",
    independentItems: ["Each Switch controls a feature that turns On or Off independently.", "Use a parent–child Checkbox structure when a parent selection controls its children."],
    disabledTitle: "Make the Disabled state explicit",
    disabledDo: "Apply the Disabled state to both the Switch and its Label.",
    disabledDont: "Do not apply Disabled styling to the Switch Control alone.",
    disabledItems: ["When a Switch cannot be used, apply the disabled foreground to its Label as well.", "Keep the Control and Label states consistent so the entire item is clearly unavailable."],
    propertyMapDescription: "The implemented Base UI Switch properties and the confirmed ooee Field scope.",
    similarDescription: "A similar Boolean control for values that are submitted later.",
    worksWithDescription: "Combines a Switch with a Label and supporting text.",
    label: "Receive notifications",
    immediate: "Receive notifications",
    deferred: "I agree to the terms",
    email: "Email notifications",
    push: "Push notifications",
    all: "All notifications",
    cancel: "Cancel",
    submit: "Sign up",
  },
} as const;

export function SwitchPageDescription() {
  const { locale } = useStudioPreferences();
  return <>{copy[locale].pageDescription}</>;
}

export function SwitchWorkbench() {
  const { locale } = useStudioPreferences();
  const c = copy.ko;
  const preview = copy[locale];
  const [checked, setChecked] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [labelPosition, setLabelPosition] = useState<"left" | "right">("right");
  const [controlSize, setControlSize] = useState<"small" | "medium" | "large">("medium");

  return (
    <div className="grid items-start gap-6 @min-[1120px]:grid-cols-[minmax(0,1fr)_11rem]">
      <div className="min-w-0 space-y-5">

        <Section id="playground" title="🚩 Playground" description={c.playgroundDescription}>
          <div className="col-span-full grid gap-5 rounded-xl border-2 border-oe-border-bold-primary bg-oe-background-secondary p-4 @min-[760px]:grid-cols-[minmax(14rem,1fr)_16rem]">
            <div className="min-h-44 rounded-xl bg-oe-background-primary p-5">
              <SwitchField checked={checked} onCheckedChange={setChecked} disabled={disabled} label={preview.label} labelPosition={labelPosition} controlSize={controlSize} />
            </div>
            <div className="space-y-4 rounded-xl bg-oe-background-primary p-4">
              <Toggle label="On" value={checked} onChange={setChecked} />
              <Toggle label="Disabled" value={disabled} onChange={setDisabled} />
              <Control label="Size">{(["small", "medium", "large"] as const).map((size) => <Choice key={size} active={controlSize === size} onClick={() => setControlSize(size)}>{capitalize(size)}</Choice>)}</Control>
              <Control label="Label position"><Choice active={labelPosition === "right"} onClick={() => setLabelPosition("right")}>Right</Choice><Choice active={labelPosition === "left"} onClick={() => setLabelPosition("left")}>Left</Choice></Control>
            </div>
          </div>
        </Section>

        <Section id="anatomy" title="Anatomy" description={c.anatomyDescription}>
          <div className="col-span-full grid gap-8">
            <div>
              <AnatomySurface ariaLabel="Switch anatomy" title="Switch structure" className="px-5">
                <div className="relative mx-auto my-14 w-fit">
                  <SwitchField defaultChecked label="Label" />
                  <AnatomyNumber number={1} className="left-[9px] -top-11" lineClassName="left-2.5 top-5 h-6 w-px" />
                  <AnatomyNumber number={2} className="left-4 -bottom-11" lineClassName="bottom-5 left-2.5 h-6 w-px" />
                  <AnatomyNumber number={3} className="right-[7px] -top-11" lineClassName="left-2.5 top-5 h-6 w-px" />
                </div>
              </AnatomySurface>
              <AnatomyLegend items={[{ name: "Track" }, { name: "Thumb" }, { name: "Label" }]} />
            </div>

            <AnatomyStructureMap lines={[
              { name: "Field" },
              { prefix: "├─ ", name: "Track" },
              { prefix: "│  └─ ", name: "Thumb" },
              { prefix: "└─ ", name: "Label" },
            ]} />
          </div>
        </Section>

        <Section id="size" title="Properties · Size" description={c.sizeDescription}>
          <Example label="Small · Control 26×16px · Thumb 12px"><Switch aria-label="Small Switch" controlSize="small" /></Example>
          <Example label="Medium · Control 38×24px · Thumb 20px · Default"><Switch aria-label="Medium Switch" controlSize="medium" defaultChecked /></Example>
          <Example label="Large · Control 52×32px · Thumb 26px"><Switch aria-label="Large Switch" controlSize="large" defaultChecked /></Example>
        </Section>

        <Section id="layout" title="Properties · Label position" description={c.labelPositionDescription}>
          <Example label="Label right · Default"><SwitchField label={preview.label} /></Example>
          <Example label="Label left"><SwitchField label={preview.label} labelPosition="left" /></Example>
        </Section>

        <Section id="state" title="Properties · State" description={c.stateDescription}>
          <Example label="Off"><SwitchField label={preview.label} checked={false} onCheckedChange={() => undefined} /></Example>
          <Example label="On"><SwitchField label={preview.label} checked onCheckedChange={() => undefined} /></Example>
          <Example label="Focus visible"><SwitchField label={preview.label} checked={false} onCheckedChange={() => undefined} switchClassName="[outline-style:solid] outline-2 outline-offset-2 outline-oe-focus-ring" /></Example>
          <Example label="Disabled · Off" isStatic><SwitchField label={preview.label} disabled /></Example>
          <Example label="Disabled · On" isStatic><SwitchField label={preview.label} disabled checked /></Example>
        </Section>

        <Section id="behavior" title="Behavior" description={c.behaviorDescription}>
          <Behavior title="Immediate change">{c.immediateChange}</Behavior>
          <Behavior title="Keyboard">{c.keyboard}</Behavior>
          <Behavior title="Disabled">{c.disabledBehavior}</Behavior>
          <Behavior title="Boundary">{c.boundary}</Behavior>
        </Section>

        <Section id="guidelines" title="Guidelines" description={c.guidelinesDescription}>
          <div className="col-span-full grid gap-10">
            <div>
              <GuidelineTitle>{c.targetTitle}</GuidelineTitle>
              <div className="mt-3 grid gap-3 @min-[720px]:grid-cols-2">
                <GuideVisual label="16px Control"><TargetArea label="24px" className="min-h-6 min-w-48"><SwitchField label={preview.label} controlSize="small" /></TargetArea></GuideVisual>
                <GuideVisual label="Row composition"><TargetArea label="48px" className="min-h-12 w-full"><SwitchField label={preview.label} className="w-full justify-between" labelPosition="left" /></TargetArea></GuideVisual>
              </div>
              <GuidelineList items={[...c.targetItems]} />
            </div>

            <UsageComparison
              title={c.immediateTitle}
              dontFirst
              dontText={c.immediateDont}
              doText={c.immediateDo}
              description={[...c.immediateItems]}
              dontVisual={<DeferredChoice control={<SwitchField label={preview.deferred} />} cancelLabel={preview.cancel} submitLabel={preview.submit} />}
              doVisual={<DeferredChoice control={<CheckboxField label={preview.deferred} />} cancelLabel={preview.cancel} submitLabel={preview.submit} />}
            />

            <UsageComparison
              title={c.independentTitle}
              doText={c.independentDo}
              dontText={c.independentDont}
              description={[...c.independentItems]}
              doVisual={<div className="grid gap-3"><SwitchField label={preview.email} /><SwitchField label={preview.push} /></div>}
              dontVisual={<div className="grid gap-3"><SwitchField label={preview.all} /><div className="pl-5"><SwitchField label={preview.email} /></div></div>}
            />

            <UsageComparison
              title={c.disabledTitle}
              doText={c.disabledDo}
              dontText={c.disabledDont}
              description={[...c.disabledItems]}
              doVisual={<SwitchField label={preview.label} disabled />}
              dontVisual={<div className="inline-flex items-center gap-2"><Switch disabled aria-label={preview.label} /><span className="text-sm leading-5 text-oe-foreground-primary">{preview.label}</span></div>}
            />
          </div>
        </Section>

        <Section id="property-map" title="Property map" description={c.propertyMapDescription}>
          <div className="col-span-full overflow-x-auto"><table className="w-full min-w-[38rem] text-left text-xs"><thead className="border-b border-oe-border-secondary text-oe-foreground-tertiary"><tr><th className="py-2">Property</th><th>Values</th><th>Default</th></tr></thead><tbody className="divide-y divide-oe-border-secondary text-oe-foreground-secondary">
            <MapRow property="controlSize" values="small (16) | medium (24) | large (32)" defaultValue="medium (24)" /><MapRow property="checked" values="false | true" defaultValue="false" /><MapRow property="defaultChecked" values="false | true" defaultValue="false" /><MapRow property="disabled" values="false | true" defaultValue="false" /><MapRow property="readOnly" values="false | true" defaultValue="false" /><MapRow property="required" values="false | true" defaultValue="false" /><MapRow property="label" values="ReactNode (SwitchField)" defaultValue="required" /><MapRow property="labelPosition" values="left | right" defaultValue="right" /><MapRow property="name / value / form" values="string" defaultValue="undefined" /><MapRow property="onCheckedChange" values="(checked: boolean) => void" defaultValue="undefined" />
          </tbody></table></div>
        </Section>
      </div>

      <OnThisPage items={sections} componentKey="switch" />
    </div>
  );
}

function Section({ id, title, description, children }: { id: string; title: string; description: string; children: ReactNode }) { return <section id={id} className="scroll-mt-20 rounded-2xl border border-oe-border-secondary bg-oe-background-primary p-5"><h3 className="text-lg font-semibold text-oe-foreground-primary">{title}</h3><p className="mt-1 text-xs leading-5 text-oe-foreground-tertiary">{description}</p><div className="mt-5 grid gap-3 @min-[720px]:grid-cols-2">{children}</div></section>; }
function Example({ label, children }: { label: string; children: ReactNode; isStatic?: boolean }) { return <div className="flex min-h-24 flex-col gap-4 rounded-xl border border-oe-border-secondary p-4"><p className="text-xs font-medium text-oe-foreground-primary">{label}</p><PreviewLocaleScope className="mt-auto">{children}</PreviewLocaleScope></div>; }
function Behavior({ title, children }: { title: string; children: ReactNode }) { return <div className="rounded-xl border border-oe-border-secondary p-4"><p className="text-xs font-medium text-oe-foreground-primary">{title}</p><p className="mt-1 text-xs leading-5 text-oe-foreground-tertiary">{children}</p></div>; }
function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) { return <div className="flex min-h-6 items-center justify-between gap-3"><span className="text-[11px] font-medium text-oe-foreground-tertiary">{label}</span><Switch checked={value} onCheckedChange={onChange} aria-label={label} controlSize="small" /></div>; }
function Control({ label, children }: { label: string; children: ReactNode }) { return <fieldset><legend className="mb-2 text-[11px] font-medium text-oe-foreground-tertiary">{label}</legend><div className="flex flex-wrap gap-1.5">{children}</div></fieldset>; }
function MapRow({ property, values, defaultValue }: { property: string; values: string; defaultValue: string }) { return <tr><td className="py-2 pr-4 font-mono text-[11px] text-oe-foreground-primary">{property}</td><td className="pr-4">{values}</td><td>{defaultValue}</td></tr>; }
function capitalize(value: string) { return value.charAt(0).toUpperCase() + value.slice(1); }
