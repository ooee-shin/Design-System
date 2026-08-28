"use client";

import { useState, type ReactNode } from "react";
import { RiFilePdf2Fill, RiNotification3Line } from "@remixicon/react";
import { Badge, Checkbox, CheckboxField, CheckboxIndicator, SwitchField } from "@ooee/ui";

import { AnatomySwapSlot } from "@/components/anatomy-swap-slot";
import { AnatomyBoundaryMarker, AnatomyLegend, AnatomyNumber, AnatomyStructureMap, AnatomySurface } from "@/components/component-anatomy";
import { OnThisPage } from "@/components/component-detail-navigation";
import { DeferredChoice, GuidelineList, GuideVisual, TargetArea, UsageComparison } from "@/components/component-guidelines";
import { GuidelineTitle } from "@/components/guideline-title";
import { DependentControlGroup, PlaygroundChoice as Choice } from "@/components/playground-element-control";
import { PreviewLocaleScope } from "@/components/preview-locale-scope";
import { useStudioPreferences } from "@/components/studio-preferences-provider";

const previewCopy = {
  ko: { label: "선택 항목", right: "우측 설명", bottom: "선택 항목에 대한 추가 설명입니다.", deferred: "이용 약관에 동의합니다", cancel: "취소", submit: "가입하기", parent: "알림 전체 선택", childA: "이메일 알림", childB: "푸시 알림", disabled: "현재 선택할 수 없는 항목", assetA: "디자인 가이드.pdf", assetSize: "2.4 MB", combinedExample: "콘텐츠 결합 예시" },
  en: { label: "Option", right: "Description", bottom: "Additional information about this option.", deferred: "I agree to the terms", cancel: "Cancel", submit: "Sign up", parent: "Select all notifications", childA: "Email notifications", childB: "Push notifications", disabled: "Option currently unavailable", assetA: "Design guide.pdf", assetSize: "2.4 MB", combinedExample: "Combined content example" },
} as const;

const sections = [
  { id: "playground", label: "Playground" },
  { id: "anatomy", label: "Anatomy" },
  { id: "appearance", label: "Appearance" },
  { id: "elements", label: "Elements" },
  { id: "state", label: "State" },
  { id: "layout", label: "Layout" },
  { id: "guidelines", label: "Guidelines" },
  { id: "property-map", label: "Property map" },
];

export function CheckboxWorkbench() {
  const { locale } = useStudioPreferences();
  const c = previewCopy[locale];
  const [checked, setChecked] = useState(false);
  const [indeterminate, setIndeterminate] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [showLabel, setShowLabel] = useState(true);
  const [showRightDescription, setShowRightDescription] = useState(false);
  const [showBottomDescription, setShowBottomDescription] = useState(false);
  const [isParent, setIsParent] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [layout, setLayout] = useState<"inline" | "block">("inline");
  const [appearance, setAppearance] = useState<"rounded" | "ghost">("rounded");
  const [selectedAssets, setSelectedAssets] = useState<Array<"indicator" | "pdf">>(["indicator", "pdf"]);

  return (
    <div className="grid items-start gap-6 @min-[1120px]:grid-cols-[minmax(0,1fr)_11rem]">
      <div className="min-w-0 space-y-5">
        <header className="rounded-2xl border border-oe-border-secondary bg-oe-background-primary p-5">
          <h2 className="text-lg font-semibold text-oe-foreground-primary">Checkbox</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-oe-foreground-secondary">목록이나 폼에서 항목의 선택 여부를 제어합니다. Control은 16px 단일 크기이며 20px Label 첫 줄 안에서 중앙 정렬됩니다. 선택 상태는 Brand 표현을 사용합니다.</p>
        </header>

        <Section id="playground" title="🚩 Playground" description="현재 구현된 선택, 부분 선택과 비활성 상태를 조합해 확인합니다.">
          <div className="col-span-full grid gap-5 rounded-xl border-2 border-oe-border-bold-primary bg-oe-background-secondary p-4 @min-[760px]:grid-cols-[minmax(14rem,1fr)_16rem]">
            <div lang="en" className="min-h-44 rounded-xl bg-oe-background-primary p-5">
              {showLabel ? <CheckboxField checked={checked} onCheckedChange={setChecked} indeterminate={indeterminate} disabled={disabled} readOnly={readOnly} label="Label" rightDescription={showRightDescription ? "Right Description" : undefined} bottomDescription={showBottomDescription ? "Bottom Description" : undefined} isParent={isParent} layout={layout} flipped={flipped} appearance={appearance} /> : <Checkbox aria-label="Checkbox" checked={checked} onCheckedChange={setChecked} indeterminate={indeterminate} disabled={disabled} readOnly={readOnly} appearance={appearance} />}
            </div>
            <div className="space-y-4 rounded-xl bg-oe-background-primary p-4">
              <Toggle label="Checked" value={checked} onChange={(value) => { setChecked(value); if (value) setIndeterminate(false); }} />
              <Control label="Appearance"><Choice active={appearance === "rounded"} onClick={() => setAppearance("rounded")}>Rounded</Choice><Choice active={appearance === "ghost"} onClick={() => { setAppearance("ghost"); setDisabled(false); setIndeterminate(false); }}>Ghost</Choice></Control>
              {appearance !== "ghost" ? <><Toggle label="Indeterminate" value={indeterminate} onChange={(value) => { setIndeterminate(value); if (value) setChecked(false); }} /><Toggle label="Disabled" value={disabled} onChange={setDisabled} /></> : null}
              <Toggle label="Read only" value={readOnly} onChange={setReadOnly} />
              <Toggle label="Label" value={showLabel} onChange={setShowLabel} />
              {showLabel ? <DependentControlGroup><Toggle label="Right description" value={showRightDescription} onChange={setShowRightDescription} /><Toggle label="Bottom description" value={showBottomDescription} onChange={setShowBottomDescription} /><Toggle label="Parent item" value={isParent} onChange={setIsParent} /><Toggle label="Flipped" value={flipped} onChange={setFlipped} /><Control label="Layout"><Choice active={layout === "inline"} onClick={() => setLayout("inline")}>Inline</Choice><Choice active={layout === "block"} onClick={() => setLayout("block")}>Block</Choice></Control></DependentControlGroup> : null}
            </div>
          </div>
        </Section>

        <Section id="anatomy" title="Anatomy" description="현재 Checkbox를 구성하는 실제 요소입니다.">
          <div className="col-span-full grid gap-8">
            <div>
              <AnatomySurface ariaLabel="Checkbox basic anatomy" title="Basic anatomy" className="px-5 pb-5 pt-12">
                <p className="text-xs leading-5 text-oe-foreground-tertiary">CheckboxField의 기본 구조만 표시합니다.</p>
                <div lang="en" className="mt-3 px-1 py-6">
                  <div className="relative mx-auto my-14 w-fit">
                    <CheckboxField defaultChecked label="Label" />
                    <AnatomyBoundaryMarker number={1} side="left" connectorLength={32} boundaryLength={36} className="-left-16 top-2" />
                    <AnatomyNumber number={2} className="left-0 -top-11" lineClassName="left-2.5 top-5 h-6 w-px" />
                    <AnatomyNumber number={3} className="left-0 -bottom-11" lineClassName="bottom-5 left-2.5 h-6 w-px" />
                    <AnatomyNumber number={4} className="right-0 -bottom-11" lineClassName="bottom-5 left-2.5 h-6 w-px" />
                  </div>
                </div>
              </AnatomySurface>
              <AnatomyLegend items={[{ name: "Field" }, { name: "Checkbox control" }, { name: "Selection indicator" }, { name: "Label" }]} />
            </div>

            <div>
              <AnatomySurface ariaLabel="Checkbox extended anatomy" title="Extended anatomy" className="px-5 pb-5 pt-12">
                <p className="text-xs leading-5 text-oe-foreground-tertiary">Basic 구조에 추가할 수 있는 Optional 요소만 번호로 표시합니다.</p>
                <div lang="en" className="mt-3 px-1 py-6">
                  <div className="relative mx-auto my-14 w-fit">
                    <CheckboxField defaultChecked label="Label" rightDescription="Right Description" bottomDescription="Bottom Description" leadingElement={<AnatomySwapSlot />} trailingElement={<AnatomySwapSlot />} />
                    <AnatomyBoundaryMarker number={5} side="right" connectorLength={32} boundaryLength={48} className="-right-16 top-2" />
                    <AnatomyNumber number={6} className="left-7 -top-11" lineClassName="left-2.5 top-5 h-6 w-px" />
                    <AnatomyNumber number={7} className="right-[34px] -top-11" lineClassName="left-2.5 top-5 h-6 w-px" />
                    <AnatomyNumber number={8} className="right-0 -top-11" lineClassName="left-2.5 top-5 h-6 w-px" />
                    <AnatomyNumber number={9} className="left-7 -bottom-11" lineClassName="bottom-5 left-2.5 h-6 w-px" />
                  </div>
                </div>
              </AnatomySurface>
              <AnatomyLegend start={5} items={[{ name: "Content container" }, { name: "Leading element", optional: true }, { name: "Right Description", optional: true }, { name: "Trailing element", optional: true }, { name: "Bottom Description", optional: true }]} />
            </div>

            <AnatomyStructureMap lines={[
              { name: "Field" },
              { prefix: "├─ ", name: "Checkbox control" },
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

        <Section id="appearance" title="Properties · Appearance" description="Rounded를 기본값으로 사용하며, 박스 없이 Indicator만 표시하는 Ghost를 선택할 수 있습니다.">
          <div className="col-span-full grid gap-3 @min-[720px]:grid-cols-2">
            <AppearanceExample title="Rounded" appearance="rounded" label={c.label} />
            <AppearanceExample title="Ghost" appearance="ghost" label={c.label} />
          </div>
        </Section>

        <Section id="elements" title="Properties · Elements" description="Label 위계와 교체 가능한 Leading·Trailing element를 확인합니다.">
          <div className="col-span-full rounded-xl border border-oe-border-secondary p-4">
            <p className="text-[11px] font-medium text-oe-foreground-primary">Parent item</p>
            <p className="mt-1 text-xs leading-5 text-oe-foreground-tertiary">여러 하위 선택 항목을 대표하거나 전체 선택을 제어하는 부모 항목에만 Semibold Label을 사용합니다. 일반 항목의 Label은 Regular입니다.</p>
            <div className="mt-4 grid gap-1">
              <div className="px-1 py-1"><CheckboxField indeterminate isParent label="부모 항목" /></div>
              <div className="px-1 py-1"><CheckboxField defaultChecked label="일반 항목" /></div>
            </div>
          </div>
          <div className="col-span-full rounded-xl border border-oe-border-secondary p-4">
            <p className="text-[11px] font-medium text-oe-foreground-primary">Leading element</p>
            <p className="mt-1 text-xs leading-5 text-oe-foreground-tertiary">텍스트 Content 앞의 Swap 영역입니다. 아래 Remix 아이콘은 배치 가능한 콘텐츠 예시이며 고정 요소가 아닙니다.</p>
            <div className="mt-4 max-w-md">
              <CheckboxField layout="block" label={<span className="font-medium">이벤트 알림 받기</span>} bottomDescription="새로운 이벤트와 혜택 소식을 받을 수 있습니다." leadingElement={<RiNotification3Line className="size-oe-icon-small text-oe-foreground-secondary" aria-hidden="true" />} />
            </div>
          </div>
          <div className="col-span-full rounded-xl border border-oe-border-secondary p-4">
            <p className="text-[11px] font-medium text-oe-foreground-primary">Trailing element</p>
            <p className="mt-1 text-xs leading-5 text-oe-foreground-tertiary">텍스트 Content 뒤의 Swap 영역입니다. 아래 Badge는 배치 가능한 콘텐츠 예시이며 고정 요소가 아닙니다.</p>
            <div className="mt-4 max-w-md">
              <CheckboxField layout="block" label={<span className="font-medium">자동 분배</span>} bottomDescription="설정한 규칙과 조건에 따라 담당자 또는 팀에게 자동 분배됩니다." trailingElement={<Badge color="red" size="xsmall">NEW</Badge>} />
            </div>
          </div>
        </Section>

        <Section id="state" title="Properties · State" description="선택값은 고정하고 Focus와 Pressed 피드백은 실제로 확인합니다.">
          <StateGroup title="Rounded" description="4px radius를 사용하는 기본 Checkbox Appearance입니다. 선택·부분 선택·Focus와 Disabled 상태를 모두 제공합니다.">
            <StateExample label="Unchecked"><CheckboxField checked={false} onCheckedChange={() => undefined} label={c.label} /></StateExample>
            <StateExample label="Checked"><CheckboxField checked onCheckedChange={() => undefined} label={c.label} /></StateExample>
            <StateExample label="Indeterminate"><CheckboxField checked={false} onCheckedChange={() => undefined} indeterminate label={c.label} /></StateExample>
            <StateExample label="Focus visible"><CheckboxField checked={false} onCheckedChange={() => undefined} checkboxClassName="ring-2 ring-oe-focus-ring ring-offset-2 ring-offset-oe-background-primary" label={c.label} /></StateExample>
            <StateExample label="Disabled · Unchecked"><CheckboxField disabled label={c.label} /></StateExample>
            <StateExample label="Disabled · Checked"><CheckboxField disabled checked label={c.label} /></StateExample>
            <StateExample label="Read only · Checked"><CheckboxField readOnly checked label={c.label} /></StateExample>
          </StateGroup>

          <StateGroup title="Ghost" description="박스 없이 Check Indicator의 색상으로 선택 상태를 구분합니다. Ghost는 Indeterminate와 Disabled 상태를 제공하지 않습니다.">
            <StateExample label="Unchecked"><CheckboxField checked={false} onCheckedChange={() => undefined} label={c.label} appearance="ghost" /></StateExample>
            <StateExample label="Checked"><CheckboxField checked onCheckedChange={() => undefined} label={c.label} appearance="ghost" /></StateExample>
            <StateExample label="Focus visible"><CheckboxField checked={false} onCheckedChange={() => undefined} checkboxClassName="ring-2 ring-oe-focus-ring ring-offset-2 ring-offset-oe-background-primary" label={c.label} appearance="ghost" /></StateExample>
          </StateGroup>

        </Section>

        <Section id="layout" title="Layout" description="여러 Checkbox를 함께 사용할 때의 가로 줄바꿈과 세로 배열을 비교합니다.">
          <div className="col-span-full rounded-xl border border-oe-border-secondary bg-oe-background-primary p-5">
            <div>
              <h4 className="text-xs font-semibold text-oe-foreground-primary">Horizontal · Wrap</h4>
              <p className="mt-1 text-xs leading-5 text-oe-foreground-tertiary">여러 항목을 가로로 나열하고 사용할 수 있는 너비가 부족하면 다음 줄로 이어집니다.</p>
              <fieldset className="-ml-2 mt-3 flex flex-wrap gap-x-4" aria-label="Horizontal checkbox layout">
                {["A", "B", "C", "D", "E"].map((suffix, index) => <CheckboxField key={suffix} defaultChecked={index === 1} label={`${c.label} ${suffix}`} />)}
              </fieldset>
            </div>
            <div className="mt-6 border-t border-oe-border-secondary pt-5">
              <h4 className="text-xs font-semibold text-oe-foreground-primary">Vertical · Block</h4>
              <p className="mt-1 text-xs leading-5 text-oe-foreground-tertiary">각 항목이 부모 너비를 채우며 36px 최소 행 높이로 이어집니다.</p>
              <fieldset className="-ml-2 mt-3 grid" aria-label="Vertical checkbox layout">
                {["A", "B", "C"].map((suffix, index) => <CheckboxField key={suffix} defaultChecked={index === 1} layout="block" label={`${c.label} ${suffix}`} />)}
              </fieldset>
            </div>
          </div>
        </Section>

        <Section id="guidelines" title="Guidelines" description="Checkbox를 구성하고 배치할 때 적용하는 기준의 첫 번째 초안입니다.">
          <div className="col-span-full grid gap-10">
            <div>
              <GuidelineTitle>Target area 확보하기</GuidelineTitle>
              <div className="mt-3 grid gap-3 @min-[720px]:grid-cols-2">
                <GuideVisual label="16px Control"><TargetArea label="36px" className="min-h-9 min-w-48"><CheckboxField label={c.label} /></TargetArea></GuideVisual>
                <GuideVisual label="Row composition"><TargetArea label="48px" className="min-h-12 w-full"><CheckboxField label={c.label} layout="block" /></TargetArea></GuideVisual>
              </div>
              <GuidelineList items={["16px Indicator만 보이더라도 CheckboxField는 최소 36px 높이의 조작 영역을 확보합니다.", "목록이나 행과 결합하면 Indicator만이 아니라 Label을 포함한 전체 CheckboxField를 선택 영역으로 사용합니다."]} />
            </div>

            <UsageComparison
              title="부모–자식 선택 표현하기"
              doText="부모 항목은 위계를 구분하고 일부 선택을 Indeterminate로 표시합니다."
              dontText="부모 항목을 일반 항목과 같은 위계로 표현하지 않습니다."
              description={["부모 항목의 Label에만 Semibold를 사용합니다.", "일부 하위 항목만 선택되면 부모 Indicator를 Indeterminate로 표시합니다."]}
              doVisual={<div className="grid w-full"><CheckboxField indeterminate isParent label={c.parent} /><div className="pl-6"><CheckboxField defaultChecked label={c.childA} /><CheckboxField label={c.childB} /></div></div>}
              dontVisual={<div className="grid w-full"><CheckboxField defaultChecked label={c.parent} /><div className="pl-6"><CheckboxField defaultChecked label={c.childA} /><CheckboxField label={c.childB} /></div></div>}
            />

            <UsageComparison
              title="Disabled 상태를 명확하게 표시하기"
              doText="Indicator와 Label 전체에 Disabled 표현을 적용합니다."
              dontText="Indicator만 비활성화하고 Label은 활성 상태처럼 남기지 않습니다."
              description={["사용할 수 없는 이유가 필요하면 Field의 설명이나 주변 안내로 제공합니다.", "Disabled 상태에서도 기존 Checked 값은 보존합니다."]}
              doVisual={<CheckboxField disabled label={c.disabled} />}
              dontVisual={<div className="inline-flex min-h-9 items-center gap-2"><Checkbox disabled aria-label={c.disabled} /><span className="text-sm leading-5 text-oe-foreground-primary">{c.disabled}</span></div>}
            />

            <div>
              <GuidelineTitle>Checkbox 나열하기</GuidelineTitle>
              <GuidelineList items={["여러 Checkbox는 기본적으로 줄바꿈을 허용해 항목이 잘리지 않게 배치합니다.", "짧은 항목을 빠르게 비교하는 밀도 높은 관리자 화면에서는 16px 간격의 가로 배열을 권장합니다.", "세로 배열은 별도 간격 없이 CheckboxField의 36px 최소 높이로 수직 리듬을 확보합니다."]} />
            </div>

            <div>
              <GuidelineTitle>Checkbox Indicator 재사용하기</GuidelineTitle>
              <div className="mt-3 grid gap-3 @min-[720px]:grid-cols-2">
                <GuideVisual label="Indicator only · 36px target">
                  <button type="button" aria-label="Toggle indicator example" aria-pressed={selectedAssets.includes("indicator")} onClick={() => setSelectedAssets((current) => current.includes("indicator") ? current.filter((id) => id !== "indicator") : [...current, "indicator"])} className="grid min-h-28 w-full place-items-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-oe-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-oe-background-primary"><CheckboxIndicator checked={selectedAssets.includes("indicator")} /></button>
                </GuideVisual>
                <GuideVisual label={c.combinedExample}>
                  <button type="button" aria-pressed={selectedAssets.includes("pdf")} onClick={() => setSelectedAssets((current) => current.includes("pdf") ? current.filter((id) => id !== "pdf") : [...current, "pdf"])} className={`relative flex min-h-28 w-full flex-col items-start justify-end overflow-hidden rounded-lg border p-3 text-left outline-none transition-[background-color,border-color,box-shadow] hover:shadow-xs focus-visible:ring-2 focus-visible:ring-oe-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-oe-background-primary ${selectedAssets.includes("pdf") ? "border-[var(--brand-alpha-40)] bg-[var(--brand-alpha-05)]" : "border-oe-border-secondary bg-oe-background-primary"}`}><CheckboxIndicator checked={selectedAssets.includes("pdf")} className="absolute right-2.5 top-2.5" /><RiFilePdf2Fill className="mb-auto size-oe-icon-large text-red-600 dark:text-red-400" aria-hidden="true" /><span className="mt-4 max-w-full truncate text-sm font-medium leading-5 text-oe-foreground-primary">{c.assetA}</span><span className="mt-0.5 text-xs text-oe-foreground-tertiary">{c.assetSize}</span></button>
                </GuideVisual>
              </div>
              <GuidelineList items={[<><code className="text-xs text-oe-foreground-primary">CheckboxIndicator</code>는 Checkbox의 16px 시각 base이며 Checked, Indeterminate와 Disabled 표현을 공유합니다.</>, "Combobox Option처럼 상위 컴포넌트가 선택 동작을 소유하면 상호작용 가능한 Checkbox 전체를 중첩하지 않고 Indicator만 사용합니다.", "값 변경, Focus와 키보드 동작은 Indicator를 사용하는 상위 컴포넌트가 담당합니다."]} />
            </div>

            <UsageComparison
              title="결과를 모아 제출할 때 사용하기"
              doText="나중에 저장하거나 제출하는 선택에는 Checkbox를 사용합니다."
              dontText="즉시 반영되지 않는 선택에 Switch를 사용하지 않습니다."
              description={["Checkbox는 여러 선택값을 모아 마지막 행동으로 확정하는 흐름에 적합합니다.", "누르는 즉시 설정이 바뀌어야 하는 경우에는 Switch를 사용합니다."]}
              doVisual={<DeferredChoice control={<CheckboxField label={c.deferred} />} cancelLabel={c.cancel} submitLabel={c.submit} />}
              dontVisual={<DeferredChoice control={<SwitchField label={c.deferred} />} cancelLabel={c.cancel} submitLabel={c.submit} />}
            />
          </div>
        </Section>

        <Section id="property-map" title="Property map" description="현재 구현된 Base UI Checkbox 속성과 ooee가 확정한 시각 범위입니다.">
          <div className="col-span-full overflow-x-auto">
            <table className="w-full min-w-[38rem] text-left text-xs">
              <thead className="border-b border-oe-border-secondary text-oe-foreground-tertiary"><tr><th className="py-2">Property</th><th>Values</th><th>Default</th></tr></thead>
              <tbody className="divide-y divide-oe-border-secondary text-oe-foreground-secondary">
                <MapRow property="checked" values="false | true" defaultValue="false" />
                <MapRow property="defaultChecked" values="false | true" defaultValue="false" />
                <MapRow property="indeterminate" values="false | true (Rounded)" defaultValue="false" />
                <MapRow property="disabled" values="false | true (Rounded)" defaultValue="false" />
                <MapRow property="appearance" values="rounded | ghost (Checkbox / Field)" defaultValue="rounded" />
                <MapRow property="label" values="ReactNode (Field)" defaultValue="required" />
                <MapRow property="isParent" values="false | true" defaultValue="false" />
                <MapRow property="rightDescription" values="ReactNode" defaultValue="undefined" />
                <MapRow property="bottomDescription" values="ReactNode" defaultValue="undefined" />
                <MapRow property="leadingElement" values="ReactNode" defaultValue="undefined" />
                <MapRow property="trailingElement" values="ReactNode" defaultValue="undefined" />
                <MapRow property="layout" values="inline | block (Field only)" defaultValue="inline" />
                <MapRow property="flipped" values="false | true" defaultValue="false" />
                <MapRow property="readOnly" values="false | true" defaultValue="false" />
                <MapRow property="required" values="false | true" defaultValue="false" />
                <MapRow property="name / value / form" values="string" defaultValue="undefined" />
                <MapRow property="onCheckedChange" values="(checked: boolean) => void" defaultValue="undefined" />
              </tbody>
            </table>
          </div>
        </Section>
      </div>

      <OnThisPage items={sections} componentKey="checkbox" />
    </div>
  );
}

function Section({ id, title, description, children }: { id: string; title: string; description: string; children: ReactNode }) {
  return <section id={id} className="scroll-mt-20 rounded-2xl border border-oe-border-secondary bg-oe-background-primary p-5"><h3 className="text-lg font-semibold tracking-tight text-oe-foreground-primary">{title}</h3><p className="mt-1 text-xs leading-5 text-oe-foreground-tertiary">{description}</p><div className="mt-5 grid gap-3 @min-[720px]:grid-cols-2">{children}</div></section>;
}

function StateExample({ label, children }: { label: string; children: ReactNode }) {
  return <div className="flex min-h-24 flex-col gap-4 rounded-xl border border-oe-border-secondary p-4"><p className="text-[11px] font-medium text-oe-foreground-primary">{label}</p><PreviewLocaleScope className="mt-auto">{children}</PreviewLocaleScope></div>;
}

function StateGroup({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <div className="col-span-full mt-5 first:mt-0"><h4 className="text-xs font-semibold text-oe-foreground-primary">{title}</h4><p className="mt-1 text-xs leading-5 text-oe-foreground-tertiary">{description}</p><div className="mt-3 grid gap-3 @min-[720px]:grid-cols-2">{children}</div></div>;
}

function AppearanceExample({ title, appearance, label }: { title: string; appearance: "rounded" | "ghost"; label: string }) {
  return <StateExample label={title}><div className="grid"><CheckboxField checked={false} onCheckedChange={() => undefined} label={label} appearance={appearance} /><CheckboxField checked onCheckedChange={() => undefined} label={label} appearance={appearance} /></div></StateExample>;
}


function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
  return <div className="flex items-center justify-between gap-3"><span className="text-[11px] font-medium text-oe-foreground-tertiary">{label}</span><button type="button" role="switch" aria-checked={value} aria-label={label} onClick={() => onChange(!value)} className={`relative h-5 w-9 rounded-full ${value ? "bg-oe-background-bold-primary" : "bg-oe-background-secondary ring-1 ring-inset ring-oe-border-primary"}`}><span className={`absolute top-0.5 size-4 rounded-full bg-oe-background-primary shadow-sm transition-[left] ${value ? "left-[18px]" : "left-0.5"}`} /></button></div>;
}

function Control({ label, children }: { label: string; children: ReactNode }) {
  return <fieldset><legend className="mb-2 text-[11px] font-medium text-oe-foreground-tertiary">{label}</legend><div className="flex flex-wrap gap-1.5">{children}</div></fieldset>;
}


function MapRow({ property, values, defaultValue }: { property: string; values: string; defaultValue: string }) {
  return <tr><td className="py-2 pr-4 font-mono text-[11px] text-oe-foreground-primary">{property}</td><td className="pr-4">{values}</td><td>{defaultValue}</td></tr>;
}
