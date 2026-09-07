"use client";

import { useState, type ReactNode } from "react";
import { RiCupLine, RiFridgeLine, RiSnowyLine, RiWaterFlashLine } from "@remixicon/react";

import { RadioField, RadioGroup, SelectBox, SelectBoxGroup, type SelectBoxColumns, type SelectBoxSelectionMode } from "@ooee/ui";
import { AnatomySwapSlot } from "@/components/anatomy-swap-slot";
import { AnatomyBoundaryMarker, AnatomyLegend, AnatomyNumber, AnatomyStructureMap, AnatomySurface } from "@/components/component-anatomy";
import { OnThisPage } from "@/components/component-detail-navigation";
import { GuidelineList, GuideVisual, UsageComparison } from "@/components/component-guidelines";
import { GuidelineTitle } from "@/components/guideline-title";
import { DependentControlGroup, PlaygroundChoice as Choice, PlaygroundElementControl, PlaygroundElementGraphic, type PlaygroundElementValue } from "@/components/playground-element-control";
import { PreviewLocaleScope } from "@/components/preview-locale-scope";
import { useStudioPreferences } from "@/components/studio-preferences-provider";

const sections = [
  { id: "playground", label: "Playground" },
  { id: "anatomy", label: "Anatomy" },
  { id: "selection", label: "Selection mode" },
  { id: "columns", label: "Columns" },
  { id: "elements", label: "Elements" },
  { id: "state", label: "State" },
  { id: "guidelines", label: "Guidelines" },
  { id: "property-map", label: "Property map" },
];

const applianceIcons = [RiFridgeLine, RiCupLine, RiSnowyLine, RiWaterFlashLine];

const copy = {
  ko: {
    description: "정의된 선택지를 화면에 펼쳐 놓고 상세 정보를 비교하며 하나 이상 선택하는 입력 컴포넌트입니다.",
    groupLabel: "Select Box Group",
    options: [
      { value: "option-a", title: "Label A" },
      { value: "option-b", title: "Label B" },
      { value: "option-c", title: "Label C" },
    ],
    planA: { title: "월간 요금제", description: "매달 결제하고 언제든 해지할 수 있습니다." },
    planB: { title: "연간 요금제", description: "두 달치 요금을 아낄 수 있습니다." },
    shortA: "월간",
    shortB: "연간",
    shortC: "분기",
    distributionGroup: "배분 방식",
    autoDistribution: { title: "자동분배", description: "접수한 순서에 따라 담당자에게 자동으로 배분합니다." },
    manualDistribution: { title: "수동분배", description: "담당자를 직접 지정해 배분합니다." },
    permissionFields: [
      { label: "데이터 등록 권한", options: ["관리자", "공유자", "전체"] },
      { label: "데이터 수정 권한", options: ["관리자", "등록자", "공유자", "전체"] },
      { label: "데이터 삭제 권한", options: ["관리자", "등록자"] },
    ],
    serviceQuestion: "A/S가 필요한 항목을 선택해주세요",
    appliances: ["냉장고", "커피머신", "제빙기", "온수기"],
    roleGroup: "역할 선택",
    owner: "사장님",
    staff: "직원",
    staffDescription: "매니저나 파트타이머로 근무를 신청할 수 있습니다.",
    next: "다음",
    planLong: { title: "월간 요금제로 결제하기", description: "매달 결제하는 방식이며 결제일은 최초 결제한 날짜를 기준으로 자동으로 정해지고, 해지를 원하면 다음 결제일 전까지 설정 화면에서 언제든 해지할 수 있습니다." },
    planGroup: "요금제",
  },
  en: {
    description: "Presents defined choices in place so users can compare details and select one or more values.",
    groupLabel: "Select Box Group",
    options: [
      { value: "option-a", title: "Label A" },
      { value: "option-b", title: "Label B" },
      { value: "option-c", title: "Label C" },
    ],
    planA: { title: "Monthly plan", description: "Billed every month and cancellable anytime." },
    planB: { title: "Annual plan", description: "Saves the cost of two months." },
    shortA: "Monthly",
    shortB: "Annual",
    shortC: "Quarterly",
    distributionGroup: "Distribution",
    autoDistribution: { title: "Automatic", description: "Assigns each request to an owner in the order received." },
    manualDistribution: { title: "Manual", description: "Lets you pick the owner for each request." },
    permissionFields: [
      { label: "Create permission", options: ["Admin", "Shared", "Everyone"] },
      { label: "Edit permission", options: ["Admin", "Owner", "Shared", "Everyone"] },
      { label: "Delete permission", options: ["Admin", "Owner"] },
    ],
    serviceQuestion: "Select the item that needs service",
    appliances: ["Refrigerator", "Coffee machine", "Ice maker", "Water heater"],
    roleGroup: "Select a role",
    owner: "Owner",
    staff: "Staff",
    staffDescription: "Apply for a shift as a manager or a part-timer.",
    next: "Next",
    planLong: { title: "Pay with the monthly plan", description: "Billed every month on the date of your first payment, and if you want to stop, you can cancel at any time before the next billing date from the settings screen." },
    planGroup: "Plan",
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
                    leadingElement={leadingElement.kind === "none" ? undefined : <PlaygroundElementGraphic value={leadingElement} className={leadingElement.kind === "image" ? "size-8" : "size-oe-icon-medium"} />}
                  />
                ))}
              </SelectBoxGroup>
            </PreviewLocaleScope>
            <div className="space-y-5 rounded-xl bg-oe-background-primary p-4">
              <ControlSection title="Appearance">
                <ControlGroup label="Columns">
                  <Choice active={columnMode === "single"} onClick={() => setColumnMode("single")}>Single column</Choice>
                  <Choice active={columnMode === "multiple"} onClick={() => setColumnMode("multiple")}>Multi column</Choice>
                </ControlGroup>
                {columnMode === "multiple" ? <DependentControlGroup><NumberControl label="Column count" value={columnCount} min={2} max={6} onChange={setColumnCount} /></DependentControlGroup> : null}
              </ControlSection>
              <ControlSection title="State">
                <Toggle label="Disabled" value={disabled} onChange={setDisabled} />
                <Toggle label="Read only" value={readOnly} onChange={setReadOnly} />
              </ControlSection>
              <ControlSection title="Elements">
                <PlaygroundElementControl label="Leading element" value={leadingElement} onChange={setLeadingElement} showValueControl={false} />
                <ControlGroup label="Trailing element">
                  <Choice active={showTrailingElement} onClick={() => setShowTrailingElement(true)}>{selectionMode === "single" ? "Radio" : "Checkbox"}</Choice>
                  <Choice active={!showTrailingElement} onClick={() => setShowTrailingElement(false)}>None</Choice>
                </ControlGroup>
                <Toggle label="Description" value={description} onChange={setDescription} />
              </ControlSection>
              <ControlSection title="Behavior">
                <ControlGroup label="Selection mode">{(["single", "multiple"] as const).map((item) => <Choice key={item} active={selectionMode === item} onClick={() => setSelectionMode(item)}>{capitalize(item)}</Choice>)}</ControlGroup>
              </ControlSection>
            </div>
          </div>
        </Section>

        <Section id="anatomy" title="Anatomy" description="하나의 Select Box와 여러 항목을 묶는 Group의 최소 구조를 표시합니다.">
          <div>
            <AnatomySurface ariaLabel="Select Box anatomy" title="Select Box structure" className="min-h-[290px]">
              <div className="absolute left-1/2 top-1/2 w-[min(72%,36rem)] -translate-x-1/2 -translate-y-1/2">
                <div className="relative flex items-center gap-3 rounded-xl border border-oe-border-secondary bg-oe-background-primary px-4 py-3">
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

        <Section id="selection" title="Properties · Selection mode" description="하나만 고르는 Single과 여러 개를 고르는 Multiple을 비교합니다. Trailing element는 선택 방식에 맞는 공용 Control로 대체됩니다.">
          <div className="grid gap-3 @min-[720px]:grid-cols-2">
            <Example label="Single · Default" description="하나만 선택되며 공용 Radio Control을 사용합니다.">
              <SelectBoxGroup ariaLabel="Single selection example" selectionMode="single" defaultValue="option-a" className="w-full">
                <SelectBox value="option-a" title="Label A" /><SelectBox value="option-b" title="Label B" />
              </SelectBoxGroup>
            </Example>
            <Example label="Multiple" description="여러 개를 선택할 수 있으며 공용 Checkbox Control을 사용합니다.">
              <SelectBoxGroup ariaLabel="Multiple selection example" selectionMode="multiple" defaultValue={["option-a"]} className="w-full">
                <SelectBox value="option-a" title="Label A" /><SelectBox value="option-b" title="Label B" />
              </SelectBoxGroup>
            </Example>
          </div>
        </Section>

        <Section id="columns" title="Properties · Columns" description="항목을 한 열로 쌓거나 여러 열로 나눕니다. 좁은 Container에서는 한 열을 유지하고 640px 이상에서 지정한 열 수를 적용합니다. 열이 여럿이면 Leading element가 Title 위로 올라갑니다.">
          <div className="grid gap-3">
            <Example label="1 · Default" description="항목이 Container 너비를 채우고 Leading element는 Title 왼쪽에 놓입니다.">
              <SelectBoxGroup ariaLabel="Single column example" defaultValue="option-a" className="w-full">
                <SelectBox value="option-a" title="Label A" leadingElement={<PlaygroundElementGraphic value={{ kind: "icon", icon: "global", image: "avatar" }} className="size-oe-icon-medium" />} /><SelectBox value="option-b" title="Label B" leadingElement={<PlaygroundElementGraphic value={{ kind: "icon", icon: "global", image: "avatar" }} className="size-oe-icon-medium" />} />
              </SelectBoxGroup>
            </Example>
            <Example label="2" description="열이 둘 이상이면 항목이 좁아지므로 Leading element를 Title 위 왼쪽에 배치합니다.">
              <SelectBoxGroup ariaLabel="Two column example" columns={2} defaultValue="option-a" className="w-full">
                <SelectBox value="option-a" title="Label A" leadingElement={<PlaygroundElementGraphic value={{ kind: "icon", icon: "global", image: "avatar" }} className="size-oe-icon-medium" />} /><SelectBox value="option-b" title="Label B" leadingElement={<PlaygroundElementGraphic value={{ kind: "icon", icon: "global", image: "avatar" }} className="size-oe-icon-medium" />} />
              </SelectBoxGroup>
            </Example>
            <Example label="3 · 검수 범위 2~6" description="열 수를 늘려도 항목마다 같은 너비를 유지합니다. 이 폭에서는 시각 요소를 덜어내는 것을 권장합니다.">
              <SelectBoxGroup ariaLabel="Three column example" columns={3} defaultValue="option-a" className="w-full">
                <SelectBox value="option-a" title="Label A" /><SelectBox value="option-b" title="Label B" /><SelectBox value="option-c" title="Label C" />
              </SelectBoxGroup>
            </Example>
          </div>
        </Section>

        <Section id="elements" title="Properties · Elements" description="항목 안에 표시하거나 교체할 수 있는 요소입니다. Title은 필수이며 나머지는 선택입니다.">
          <div className="grid gap-3 @min-[720px]:grid-cols-2">
            <Example label="Leading element · Icon" description="Title 왼쪽에 값을 식별하는 Icon을 둘 수 있습니다.">
              <SelectBoxGroup ariaLabel="Leading icon example" defaultValue="option-a" className="w-full">
                <SelectBox value="option-a" title="Label A" leadingElement={<PlaygroundElementGraphic value={{ kind: "icon", icon: "global", image: "avatar" }} className="size-oe-icon-medium" />} />
                <SelectBox value="option-b" title="Label B" leadingElement={<PlaygroundElementGraphic value={{ kind: "icon", icon: "global", image: "avatar" }} className="size-oe-icon-medium" />} />
              </SelectBoxGroup>
            </Example>
            <Example label="Leading element · Image" description="공통 정사각 Avatar 샘플을 사용합니다.">
              <SelectBoxGroup ariaLabel="Leading image example" defaultValue="option-a" className="w-full">
                <SelectBox value="option-a" title="Label A" leadingElement={<PlaygroundElementGraphic value={{ kind: "image", icon: "global", image: "avatar" }} className="size-8" />} />
                <SelectBox value="option-b" title="Label B" leadingElement={<PlaygroundElementGraphic value={{ kind: "image", icon: "global", image: "avatar" }} className="size-8" />} />
              </SelectBoxGroup>
            </Example>
            <Example label="Description" description="Title 아래에 부연을 표시하며 항목 높이가 Content에 맞춰 늘어납니다.">
              <SelectBoxGroup ariaLabel="Description example" defaultValue="option-a" className="w-full">
                <SelectBox value="option-a" title="Label A" description="Description" /><SelectBox value="option-b" title="Label B" description="Description" />
              </SelectBoxGroup>
            </Example>
            <Example label="Trailing element · None" description="Control을 시각적으로만 숨기고 DOM과 키보드 순서에서는 유지합니다.">
              <SelectBoxGroup ariaLabel="Trailing none example" trailingElement="none" defaultValue="option-a" className="w-full">
                <SelectBox value="option-a" title="Label A" /><SelectBox value="option-b" title="Label B" />
              </SelectBoxGroup>
            </Example>
          </div>
        </Section>

        <Section id="state" title="Properties · State" description="각 카드는 선택된 항목과 선택되지 않은 항목을 함께 표시합니다. Focus와 Pressed 피드백은 실제로 확인할 수 있습니다.">
          <div className="grid gap-3 @min-[720px]:grid-cols-2">
            <Example label="Default">
              <SelectBoxGroup ariaLabel="Default state example" defaultValue="option-a" className="w-full">
                <SelectBox value="option-a" title="Label A" /><SelectBox value="option-b" title="Label B" />
              </SelectBoxGroup>
            </Example>
            <Example label="Disabled" description="선택 상태의 Brand 색을 제거하고 Disabled Neutral border와 background를 사용합니다.">
              <SelectBoxGroup ariaLabel="Disabled state example" defaultValue="option-a" disabled className="w-full">
                <SelectBox value="option-a" title="Label A" /><SelectBox value="option-b" title="Label B" />
              </SelectBoxGroup>
            </Example>
            <Example label="Read only" description="현재 값을 보존하고 Focus는 허용하지만 Hover·Pressed와 값 변경은 제공하지 않습니다.">
              <SelectBoxGroup ariaLabel="Read only state example" defaultValue="option-a" readOnly className="w-full">
                <SelectBox value="option-a" title="Label A" /><SelectBox value="option-b" title="Label B" />
              </SelectBoxGroup>
            </Example>
            <Example label="Item disabled" description="항목마다 disabled를 둘 수 있고 Group의 disabled와 함께 적용됩니다.">
              <SelectBoxGroup ariaLabel="Item disabled example" defaultValue="option-a" className="w-full">
                <SelectBox value="option-a" title="Label A" /><SelectBox value="option-b" title="Label B" disabled />
              </SelectBoxGroup>
            </Example>
          </div>
        </Section>

        <Section id="guidelines" title="Guidelines" description="Select Box를 고르고 항목을 구성할 때 적용하는 기준의 첫 번째 초안입니다.">
          <div className="grid gap-8">
            <div>
              <GuidelineTitle>설명이나 시각 정보가 있는 선택지에 사용하기</GuidelineTitle>
              <div className="mt-3 grid gap-3 @min-[720px]:grid-cols-2">
                <GuideVisual label="설명이 있는 선택지 · 한 열">
                  <PreviewLocaleScope><SelectBoxGroup ariaLabel={c.planGroup} defaultValue="plan-a"><SelectBox value="plan-a" title={c.planA.title} description={c.planA.description} /><SelectBox value="plan-b" title={c.planB.title} description={c.planB.description} /></SelectBoxGroup></PreviewLocaleScope>
                </GuideVisual>
                <GuideVisual label="짧은 Label · 여러 열 · Trailing element 제거">
                  <PreviewLocaleScope><SelectBoxGroup ariaLabel={c.planGroup} columns={3} trailingElement="none" defaultValue="plan-a"><SelectBox value="plan-a" title={c.shortA} /><SelectBox value="plan-b" title={c.shortB} /><SelectBox value="plan-c" title={c.shortC} /></SelectBoxGroup></PreviewLocaleScope>
                </GuideVisual>
              </div>
              <GuidelineList items={[
                "Select Box의 값은 넓은 조작 영역과 그 안에 담기는 Description, 시각 정보입니다. 비교할 정보가 있으면 한 열로 두어 항목마다 그 정보를 읽을 수 있게 합니다.",
                <>Title만 있는 짧은 선택지는 <code className="text-xs text-oe-foreground-primary">columns</code>를 늘려 여러 열로 나누고 <code className="text-xs text-oe-foreground-primary">trailingElement</code>를 <code className="text-xs text-oe-foreground-primary">none</code>으로 둡니다. 한 열로 두면 넓은 카드에 짧은 Label 하나만 남고 Control이 오른쪽 끝으로 떨어져 Label과 멀어집니다.</>,
                "짧은 Label을 밀도 있게 나열하는 전통적인 폼은 Radio 또는 Checkbox를 사용합니다. 선택지를 접어 두어도 되면 Select를 사용합니다.",
              ]} />
            </div>
            <div>
              <GuidelineTitle>박스 전체를 하나의 터치 타겟으로 두기</GuidelineTitle>
              <GuidelineList items={[
                "Select Box는 박스 전체를 하나의 터치 타겟으로 구성하여 오조작을 방지합니다. Title, Description과 Leading element 어디를 눌러도 같은 값이 선택됩니다.",
                "따라서 박스 안에 따로 눌리는 요소를 두지 않습니다. 링크나 Button을 넣으면 하나였던 터치 타겟이 갈라져 무엇을 눌렀는지 알 수 없게 됩니다.",
              ]} />
            </div>
            <div>
              <GuidelineTitle>Description은 필요한 항목에만 두기</GuidelineTitle>
              <div className="mt-3 grid gap-3 @min-[720px]:grid-cols-2">
                <GuideVisual label="필요한 항목에만">
                  <PreviewLocaleScope><SelectBoxGroup ariaLabel={c.planGroup} defaultValue="plan-b"><SelectBox value="plan-a" title={c.shortA} /><SelectBox value="plan-b" title={c.planB.title} description={c.planB.description} /></SelectBoxGroup></PreviewLocaleScope>
                </GuideVisual>
                <GuideVisual label="모든 항목에">
                  <PreviewLocaleScope><SelectBoxGroup ariaLabel={c.planGroup} defaultValue="plan-a"><SelectBox value="plan-a" title={c.planA.title} description={c.planA.description} /><SelectBox value="plan-b" title={c.planB.title} description={c.planB.description} /></SelectBoxGroup></PreviewLocaleScope>
                </GuideVisual>
              </div>
              <GuidelineList items={[
                "항목마다 정보 구성이 같아야 하는 것은 아닙니다. 부연이 필요한 항목에만 Description을 두고 나머지는 Title만 두어도 됩니다.",
                "항목 높이는 고정되어 있지 않고 각자의 Content에 맞춰 늘어납니다. 한 항목만 길어져도 나머지 항목의 높이는 그대로입니다.",
              ]} />
            </div>
            <UsageComparison
              title="Title과 Description을 간결하게 작성하기"
              doText="옵션끼리 바로 견줄 수 있는 분량으로 작성하세요."
              dontText="하나씩 끝까지 읽어야 하는 분량으로 늘리지 마세요."
              description={[
                "사용자가 여러 옵션을 쉽고 빠르게 비교할 수 있도록 Title과 Description은 최대한 간결하게 작성합니다.",
                "Description은 가독성을 위해 두 줄 이내를 권장합니다. 한 항목만 길어지면 그 항목의 높이가 늘어나 나머지 항목과 나란히 읽기 어려워집니다.",
                "설명이 두 줄을 넘어야 하면 문장을 줄이거나, 선택 이후 화면에서 안내합니다.",
              ]}
              doVisual={<PreviewLocaleScope><SelectBoxGroup ariaLabel={c.planGroup} defaultValue="plan-a"><SelectBox value="plan-a" title={c.planA.title} description={c.planA.description} /><SelectBox value="plan-b" title={c.planB.title} description={c.planB.description} /></SelectBoxGroup></PreviewLocaleScope>}
              dontVisual={<PreviewLocaleScope><SelectBoxGroup ariaLabel={c.planGroup} defaultValue="plan-a"><SelectBox value="plan-a" title={c.planLong.title} description={c.planLong.description} /><SelectBox value="plan-b" title={c.planB.title} description={c.planB.description} /></SelectBoxGroup></PreviewLocaleScope>}
            />
            <UsageComparison
              title="선택과 실행을 나누기"
              doText="선택한 값은 별도 Button으로 확정하세요."
              dontText="카드를 누르는 즉시 다음 단계로 넘기지 마세요."
              description={[
                "Select Box는 값을 선택할 뿐 즉시 Action을 실행하지 않습니다. 저장, 확인이나 다음 단계는 별도 Button이 담당합니다.",
                "카드가 넓어 Button처럼 보이더라도 누르는 즉시 화면을 이동시키지 않습니다. 실행할 Button이 없으면 잘못 누른 값을 되돌릴 기회가 사라집니다.",
              ]}
              doVisual={<div className="w-full"><RoleChoice c={c} /><button type="button" className="mt-8 h-12 w-full rounded-xl bg-oe-background-bold-primary text-sm font-medium text-oe-foreground-inverse">{c.next}</button></div>}
              dontVisual={<RoleChoice c={c} />}
            />
            <div>
              <GuidelineTitle>세 열에서는 시각 요소를 덜어내기</GuidelineTitle>
              <GuidelineList items={[
                "열이 셋 이상이면 항목 폭이 Title 한 줄에 가까워집니다. Leading element까지 두면 Title이 줄바꿈되거나 잘립니다.",
                "이 폭에서는 시각 요소를 덜어내고 Title만 두는 것을 권장합니다. 아이콘이 값을 식별하는 데 꼭 필요하면 열 수를 줄입니다.",
              ]} />
            </div>
            <div>
              <GuidelineTitle>Select Box와 Chip을 나눠 쓰기</GuidelineTitle>
              <div className="mt-3 grid gap-3 @min-[720px]:grid-cols-2">
                <GuideVisual label="Select Box · 여러 열">
                  <PreviewLocaleScope className="w-full">
                    <SelectBoxGroup ariaLabel={c.serviceQuestion} columns={2} trailingElement="none" defaultValue="appliance-1">
                      {c.appliances.map((appliance, index) => {
                        const Icon = applianceIcons[index];
                        return <SelectBox key={appliance} value={`appliance-${index}`} title={appliance} leadingElement={<Icon aria-hidden="true" className="size-oe-icon-medium" />} />;
                      })}
                    </SelectBoxGroup>
                  </PreviewLocaleScope>
                </GuideVisual>
                <GuideVisual label="Chip · 작업 예정">
                  <p className="text-xs leading-5 text-oe-foreground-placeholder">Chip의 Selected 상태가 확정된 뒤 Content 너비로 나열해 선택하는 예시를 이 자리에 추가합니다.</p>
                </GuideVisual>
              </div>
              <GuidelineList items={[
                <>항목 배치는 <code className="text-xs text-oe-foreground-primary">columns</code>로만 지원합니다. 각 항목이 Content 너비만큼만 차지하며 줄바꿈되는 배치는 제공하지 않습니다. 항목 너비가 서로 달라지면 나란히 비교할 기준이 사라지기 때문입니다.</>,
                "짧은 키워드를 Content 너비로 나열해 선택해야 하면 Chip을 사용합니다. Select Box에 그 배치를 만들면 두 컴포넌트의 화면 모양이 같아져 무엇을 선택하는 자리인지 구분할 수 없습니다.",
              ]} />
            </div>
            <div>
              <GuidelineTitle>카드형 선택 Surface는 Select Box만 갖기</GuidelineTitle>
              <div className="mt-3 grid gap-3 @min-[720px]:grid-cols-2">
                <GuideVisual label="Select Box · 카드형 Surface">
                  <PreviewLocaleScope className="w-full">
                    <SelectBoxGroup ariaLabel={c.distributionGroup} defaultValue="distribution-auto">
                      <SelectBox value="distribution-auto" title={c.autoDistribution.title} description={c.autoDistribution.description} />
                      <SelectBox value="distribution-manual" title={c.manualDistribution.title} description={c.manualDistribution.description} />
                    </SelectBoxGroup>
                  </PreviewLocaleScope>
                </GuideVisual>
                <GuideVisual label="Radio Group · 여러 Field를 밀도 있게">
                  <PreviewLocaleScope className="w-full space-y-3">
                    {c.permissionFields.map((field) => (
                      <div key={field.label}>
                        <p className="text-xs font-medium text-oe-foreground-primary">{field.label}</p>
                        <RadioGroup aria-label={field.label} defaultValue={`${field.label}-0`} className="-ml-2 mt-1 flex flex-wrap gap-x-4">
                          {field.options.map((option, index) => <RadioField key={option} value={`${field.label}-${index}`} label={option} />)}
                        </RadioGroup>
                      </div>
                    ))}
                  </PreviewLocaleScope>
                </GuideVisual>
              </div>
              <GuidelineList items={[
                "카드형 전체 선택 Surface는 Select Box가 소유합니다. Radio와 Checkbox에는 별도 Container 변형을 두지 않습니다.",
                "짧은 Label을 넓은 카드 없이 밀도 있게 나열해야 하면 Radio나 Checkbox를 그대로 사용합니다. 두 컴포넌트에 Container를 덧붙여 Select Box를 대신하지 않습니다.",
              ]} />
            </div>
          </div>
        </Section>

        <Section id="property-map" title="Property map" description="현재 구현에서 확인되는 Property와 허용 값입니다. Select Box의 API와 선택 표현은 검수용 초안이며 문서 규칙으로 확정하지 않았습니다.">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[44rem] text-left text-xs">
              <thead className="border-b border-oe-border-secondary text-oe-foreground-tertiary"><tr><th className="py-2 font-medium">Property</th><th className="py-2 font-medium">Values</th><th className="py-2 font-medium">Default</th><th className="py-2 font-medium">Status</th></tr></thead>
              <tbody className="divide-y divide-oe-border-secondary text-oe-foreground-secondary">
                <MapRow property="selectionMode" values="single | multiple" defaultValue="single" />
                <MapRow property="value / defaultValue" values="string | string[]" defaultValue={'"" | []'} />
                <MapRow property="columns" values="number (2~6 검수)" defaultValue="1" />
                <MapRow property="trailingElement" values="radio | checkbox | none" defaultValue="selectionMode에 맞는 Control" />
                <MapRow property="leadingElement" values="ReactNode" defaultValue="undefined" />
                <MapRow property="title" values="ReactNode" defaultValue="필수" />
                <MapRow property="description" values="ReactNode" defaultValue="undefined" />
                <MapRow property="disabled / readOnly" values="boolean" defaultValue="false" />
                <MapRow property="ariaLabel" values="string" defaultValue="필수" />
              </tbody>
            </table>
          </div>
        </Section>

      </div>
      <OnThisPage items={sections} componentKey="select-box" />
    </div>
  );
}

function RoleChoice({ c }: { c: (typeof copy)[keyof typeof copy] }) {
  return (
    <PreviewLocaleScope className="w-full">
      <SelectBoxGroup ariaLabel={c.roleGroup} trailingElement="none" defaultValue="role-owner">
        <SelectBox value="role-owner" title={c.owner} />
        <SelectBox value="role-staff" title={c.staff} description={c.staffDescription} />
      </SelectBoxGroup>
    </PreviewLocaleScope>
  );
}

function Example({ label, description, children }: { label: string; description?: string; children: ReactNode }) { return <div className="flex min-w-0 flex-col gap-3 rounded-xl border border-oe-border-secondary p-4"><div><p className="text-xs font-medium text-oe-foreground-primary">{label}</p>{description ? <p className="mt-1 text-[11px] leading-4 text-oe-foreground-tertiary">{description}</p> : null}</div><PreviewLocaleScope className="mt-auto">{children}</PreviewLocaleScope></div>; }
function MapRow({ property, values, defaultValue, note = "Draft" }: { property: string; values: string; defaultValue: string; note?: string }) { return <tr><td className="py-3 pr-4 font-medium text-oe-foreground-primary">{property}</td><td className="py-3 pr-4 font-mono text-[11px]">{values}</td><td className="py-3 pr-4 font-mono text-[11px]">{defaultValue}</td><td className="py-3">{note}</td></tr>; }

function ControlSection({ title, children }: { title: string; children: ReactNode }) { return <section><h4 className="mb-3 text-sm font-semibold text-oe-foreground-primary">{title}</h4><div className="space-y-3">{children}</div></section>; }

function Section({ id, title, description, children }: { id: string; title: string; description: string; children: ReactNode }) { return <section id={id} className="scroll-mt-20 rounded-2xl border border-oe-border-secondary bg-oe-background-primary p-5"><h3 className="text-lg font-semibold tracking-tight text-oe-foreground-primary">{title}</h3><p className="mt-1 text-xs leading-5 text-oe-foreground-tertiary">{description}</p><div className="mt-5">{children}</div></section>; }
function ControlGroup({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) { return <fieldset className={className}><legend className="mb-2 text-[11px] font-medium text-oe-foreground-tertiary">{label}</legend><div className="flex flex-wrap gap-1.5">{children}</div></fieldset>; }
function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) { return <div className="flex items-center justify-between gap-3"><span className="text-[11px] font-medium text-oe-foreground-tertiary">{label}</span><button type="button" role="switch" aria-checked={value} aria-label={label} onClick={() => onChange(!value)} className={`relative h-5 w-9 shrink-0 rounded-full ${value ? "bg-oe-background-bold-primary" : "bg-oe-background-secondary ring-1 ring-inset ring-oe-border-primary"}`}><span className={`absolute top-0.5 size-4 rounded-full bg-oe-background-primary shadow-sm transition-[left] ${value ? "left-[18px]" : "left-0.5"}`} /></button></div>; }
function NumberControl({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (value: number) => void }) { return <label className="block"><span className="mb-1.5 block text-[11px] font-medium text-oe-foreground-tertiary">{label}</span><input type="number" value={value} min={min} max={max} step={1} onChange={(event) => onChange(Math.min(max, Math.max(min, Number(event.target.value))))} className="h-8 w-full rounded-lg border border-oe-border-primary bg-oe-background-primary px-2.5 text-xs tabular-nums text-oe-foreground-primary outline-none focus:border-oe-focus-ring focus:ring-1 focus:ring-oe-focus-ring" /></label>; }
function capitalize(value: string) { return value.charAt(0).toUpperCase() + value.slice(1); }
