"use client";

import { useState, type ReactNode } from "react";
import { RiArrowDownSLine, RiCheckboxCircleFill, RiCheckLine, RiCloseCircleFill, RiFileLine, RiFolderLine, RiGlobalLine, RiImageLine, RiLockLine, RiSettings3Line, RiTeamLine } from "@remixicon/react";
import Link from "next/link";

import { MultiSelect, Select, type SelectOption, type SelectOptionGroup } from "@ooee/ui";
import { AnatomySwapSlot } from "@/components/anatomy-swap-slot";
import { OnThisPage } from "@/components/component-detail-navigation";
import { PreviewLocaleScope } from "@/components/preview-locale-scope";
import { GuidelineTitle } from "@/components/guideline-title";
import { useStudioPreferences } from "@/components/studio-preferences-provider";

type PreviewState = "default" | "focus" | "invalid" | "disabled" | "readOnly";

const copy = {
  ko: {
    description: "검색 없이 짧은 옵션 목록에서 하나 또는 여러 값을 선택하는 컴포넌트입니다. 선택값 전체를 펼쳐 편집해야 하면 Combobox를 사용합니다.",
    ariaLabel: "옵션 선택",
    placeholder: "옵션을 선택해 주세요",
    options: [
      { value: "option-a", label: "Option A" },
      { value: "option-b", label: "Option B" },
      { value: "option-c", label: "Option C" },
      { value: "option-d", label: "Option D", disabled: true },
    ],
    groupLabels: ["Group A", "Group B"],
    descriptions: ["Option A description", "Option B description", "Option C description", "Option D description"],
  },
  en: {
    description: "Selects one or more values from a short option list without search. Use Combobox when every selected value must stay visible and editable.",
    ariaLabel: "Select an option",
    placeholder: "Select an option",
    options: [
      { value: "option-a", label: "Option A" },
      { value: "option-b", label: "Option B" },
      { value: "option-c", label: "Option C" },
      { value: "option-d", label: "Option D", disabled: true },
    ],
    groupLabels: ["Group A", "Group B"],
    descriptions: ["Option A description", "Option B description", "Option C description", "Option D description"],
  },
} satisfies Record<string, { description: string; ariaLabel: string; placeholder: string; options: SelectOption[]; groupLabels: [string, string]; descriptions: [string, string, string, string] }>;

const sections = [
  { id: "playground", label: "Playground" },
  { id: "anatomy", label: "Anatomy" },
  { id: "style", label: "Style" },
  { id: "size", label: "Size" },
  { id: "layout", label: "Layout" },
  { id: "selection", label: "Selection" },
  { id: "state", label: "State" },
  { id: "options", label: "Options" },
  { id: "interaction", label: "Interaction" },
  { id: "content-height", label: "Content height" },
  { id: "usage", label: "Guidelines" },
  { id: "property-map", label: "Property map" },
];

const usageCopy = {
  ko: {
    people: ["김민지", "박서준", "이수현"],
    visibility: ["전체 공개", "팀원만", "나만"],
    regions: ["서울", "부산", "제주"],
    organization: "프로덕트본부 · 디자인팀",
    fieldLabelTitle: "Field의 Label과 함께 사용하기",
    fieldLabel: "지역",
    fieldLabelDo: "선택한 값의 의미를 알 수 있도록 Field Label을 함께 사용하세요.",
    fieldLabelDont: "Placeholder로 Field Label을 대신하지 마세요.",
    fieldLabelDescription: ["Select는 항상 Field Label과 함께 사용합니다.", "Placeholder는 값을 선택하면 사라지므로 선택 이후에도 남는 Label을 대신할 수 없습니다."],
    optionOrderTitle: "옵션 순서 정하기",
    optionOrderDescription: ["목록의 순서는 사용자가 옵션을 훑는 흐름에 맞춥니다. 사용 빈도, 크기, 시간처럼 그 목록이 이미 가지고 있는 기준 하나를 골라 일관되게 정렬합니다.", "나머지와 성격이나 정렬 기준이 다른 옵션은 Group으로 묶어 경계를 드러냅니다."],
    itemLabelTitle: "Item label 작성하기",
    itemLabelDo: "Item label은 명사형으로 짧고 명확하게 작성하세요.",
    itemLabelDont: "동작이나 부연 설명을 Item label에 넣지 마세요.",
    itemLabelDescription: ["같은 목록에서는 어휘, 길이와 문장 톤을 일관되게 유지합니다.", "Label이 길다면 먼저 줄이고, 필요한 부연 정보는 Item description으로 분리합니다."],
    placeholderTitle: "Placeholder 작성하기",
    placeholderDo: "어떤 종류의 값을 고르는지 알 수 있게 작성하세요.",
    placeholderDont: "값의 종류를 알 수 없는 막연한 표현은 쓰지 마세요.",
    placeholderDescription: ["Placeholder는 선택값이 없을 때 Trigger에 표시됩니다.", "Field label이 있다면 같은 문구를 Placeholder에 그대로 반복하지 않습니다."],
    placeholderDoValue: "지역 선택",
    placeholderDontValue: "여기를 눌러 펼쳐보기",
    selectionLimitTitle: "선택 방식과 개수 안내하기",
    selectionLimitDescription: ["Field label을 통해 한 개를 고르는지 여러 개를 고르는지 알 수 있게 안내합니다.", "선택할 수 있는 개수가 정해져 있다면 Label에 함께 표시합니다. 예: ‘담당자 선택 (1명)’, ‘관심 지역 선택 (최대 3개)’"],
    noneOptionTitle: "단일 선택에서 ‘없음’을 답으로 받기",
    noneOptionDescription: ["단일 선택은 선택한 Option을 다시 눌러도 해제되지 않습니다. ‘없음’이 유효한 답이라면 이를 나타내는 Option을 목록에 둡니다.", "‘없음’을 선택하면 응답을 완료한 것으로 처리합니다. 필수 Field에서도 검증을 통과시켜 미응답과 ‘없음’이라는 응답을 구분합니다.", "Item label에는 질문의 핵심을 포함합니다. Field label이 ‘담당자’라면 ‘해당 없음’ 대신 ‘담당자 없음’으로 작성합니다.", "다른 Option과 성격이 다르므로 목록의 처음이나 마지막에 별도 Group으로 분리합니다."],
    selectionTitle: "다중 선택 표출하기",
    selectionIntro: "선택값을 개수로 요약합니다. 두 가지 형태 중 목록의 성격에 맞는 쪽을 고릅니다.",
    representativeTitle: "대표 값과 나머지 개수",
    representativeDescription: "가장 먼저 고른 값을 남기고, 그 값을 뺀 나머지 개수를 표시합니다. 세 개를 골라 맨 처음 고른 하나를 보여준다면 표시하는 숫자는 2입니다. 무엇을 골랐는지 단서가 남으므로 값마다 뜻이 뚜렷이 다른 목록에 적합합니다.",
    countTitle: "전체 개수",
    countDescription: "값을 보여주지 않고 고른 전체 개수를 표시합니다. 값들이 서로 동등해서 하나만 보여주는 것이 도움이 되지 않는 목록이나, 너비가 좁아 대표 값을 보여주기 어려운 목록에 적합합니다.",
    selectionBoundary: "선택값 전체를 펼쳐 확인하고 개별 수정해야 한다면 Combobox를 사용합니다.",
    multiUsageTitle: "다중 선택 사용하기",
    selectionMutationPrinciple: "다중 선택에서는 다른 Option의 선택 상태를 바꾸는 Option을 두지 않습니다.",
    selectionMutationExamples: "따라서 나머지 선택을 모두 바꾸는 ‘전체 선택’이나 ‘없음’ Option을 추가하지 않습니다. 하나의 Option이 다른 Option의 선택 상태까지 바꾸면 동작을 예측하기 어렵습니다.",
    selectionAllRule: "전체 선택이 자주 쓰이는 Field라면 Checkbox의 부모-자식 Checkbox를 활용합니다.",
    leadingTitle: "Leading element 일관되게 사용하기",
    leadingGroupLabel: "공개 범위",
    leadingDo: "같은 Group 안에서는 Leading 영역을 동일하게 유지하세요.",
    leadingDont: "같은 Group 안에서 일부 Option에만 Leading element를 넣지 마세요.",
    leadingDescription: ["Leading element는 Option을 빠르게 구분하도록 돕습니다.", "Group마다 다른 요소를 사용할 수 있지만 같은 Group 안에서는 Leading 영역과 Label 시작점을 맞춥니다."],
    descriptionTitle: "Item description 배치하기",
    descriptionDo: "Item description은 Content 안에만 표시하세요.",
    descriptionDont: "Trigger에는 Item description을 넣지 마세요.",
    itemDescriptionDescription: ["Item description은 Option을 구분하는 보조 정보입니다.", "Trigger에는 선택된 Label만 표시해 한 줄 높이를 유지합니다."],
  },
  en: {
    people: ["Mina Kim", "Joon Park", "Suhyun Lee"],
    visibility: ["Public", "Team only", "Only me"],
    regions: ["Seoul", "Busan", "Jeju"],
    organization: "Product Department · Design Team",
    fieldLabelTitle: "Use with a Field label",
    fieldLabel: "Region",
    fieldLabelDo: "Use a Field label so the selected value keeps its meaning.",
    fieldLabelDont: "Do not replace the Field label with a placeholder.",
    fieldLabelDescription: ["Always use Select with a Field label.", "A placeholder disappears after selection, so it cannot replace a persistent label."],
    optionOrderTitle: "Order options",
    optionOrderDescription: ["Order the list to match how users scan the options. Choose one existing criterion, such as frequency, size, or time, and apply it consistently.", "Place options with a different meaning or sorting criterion in a separate group to make the boundary clear."],
    itemLabelTitle: "Write item labels",
    itemLabelDo: "Keep item labels short, clear, and noun-based.",
    itemLabelDont: "Do not add actions or supporting explanations to item labels.",
    itemLabelDescription: ["Keep vocabulary, length, and tone consistent within the same list.", "Shorten a long label first, then move necessary supporting information to the item description."],
    placeholderTitle: "Write placeholders",
    placeholderDo: "State what kind of value the user can choose.",
    placeholderDont: "Do not use vague text that hides the type of value.",
    placeholderDescription: ["The placeholder appears in the trigger when no value is selected.", "When a field label exists, do not repeat the same wording in the placeholder."],
    placeholderDoValue: "Select a region",
    placeholderDontValue: "Click here to open",
    selectionLimitTitle: "Describe selection mode and limits",
    selectionLimitDescription: ["Use the field label to make it clear whether the user can choose one value or multiple values.", "When the number of selections is limited, include that limit in the label. For example: ‘Select an assignee (1)’ or ‘Select interests (up to 3)’."],
    noneOptionTitle: "Accept ‘None’ as a single-select answer",
    noneOptionDescription: ["A single-select option cannot be cleared by selecting it again. When ‘None’ is a valid answer, include an explicit option for it.", "Treat ‘None’ as a completed response. It passes validation in a required field and distinguishes an unanswered field from an intentional ‘None’ response.", "Include the subject of the question in the item label. For a field labeled ‘Assignee’, use ‘No assignee’ instead of a vague ‘None’.", "Because it differs from the other options, place it in a separate group at the beginning or end of the list."],
    selectionTitle: "Display multiple selections",
    selectionIntro: "Summarize selected values as a count. Choose the format that fits the nature of the list.",
    representativeTitle: "Representative value and remaining count",
    representativeDescription: "Keep the first selected value and show the number of remaining selections. If three values are selected and the first is shown, the displayed number is 2. Use this when each value has a distinct meaning and the representative value provides a useful clue.",
    countTitle: "Total count",
    countDescription: "Show the total number selected without displaying a value. Use this when values are equivalent or when the trigger is too narrow to show a representative value.",
    selectionBoundary: "Use Combobox when every selected value must remain visible and individually editable.",
    multiUsageTitle: "Use multiple selection",
    selectionMutationPrinciple: "In multiple selection, do not add an option that changes the selection state of other options.",
    selectionMutationExamples: "Therefore, do not add ‘Select all’ or ‘None’ options that change the remaining selections. A single option changing other options is difficult to predict.",
    selectionAllRule: "When select-all is common, use a parent-child Checkbox pattern instead.",
    leadingTitle: "Keep leading elements consistent",
    leadingGroupLabel: "Visibility",
    leadingDo: "Keep the same leading area within a group.",
    leadingDont: "Do not add a leading element to only some options in a group.",
    leadingDescription: ["Leading elements help users distinguish options quickly.", "They may differ between groups, but keep the leading area and label alignment consistent within each group."],
    descriptionTitle: "Place item descriptions",
    descriptionDo: "Show item descriptions only inside the content.",
    descriptionDont: "Do not place item descriptions in the trigger.",
    itemDescriptionDescription: ["Item descriptions provide supporting information for distinguishing options.", "Keep only the selected label in the trigger so it remains a one-line control."],
  },
} satisfies Record<string, { people: [string, string, string]; visibility: [string, string, string]; regions: [string, string, string]; organization: string; fieldLabelTitle: string; fieldLabel: string; fieldLabelDo: string; fieldLabelDont: string; fieldLabelDescription: string[]; optionOrderTitle: string; optionOrderDescription: string[]; itemLabelTitle: string; itemLabelDo: string; itemLabelDont: string; itemLabelDescription: string[]; placeholderTitle: string; placeholderDo: string; placeholderDont: string; placeholderDescription: string[]; placeholderDoValue: string; placeholderDontValue: string; selectionLimitTitle: string; selectionLimitDescription: string[]; noneOptionTitle: string; noneOptionDescription: string[]; selectionTitle: string; selectionIntro: string; representativeTitle: string; representativeDescription: string; countTitle: string; countDescription: string; selectionBoundary: string; multiUsageTitle: string; selectionMutationPrinciple: string; selectionMutationExamples: string; selectionAllRule: string; leadingTitle: string; leadingGroupLabel: string; leadingDo: string; leadingDont: string; leadingDescription: string[]; descriptionTitle: string; descriptionDo: string; descriptionDont: string; itemDescriptionDescription: string[] }>;

export function SelectWorkbench() {
  const { locale } = useStudioPreferences();
  const c = copy[locale];
  const usage = usageCopy[locale];
  const [value, setValue] = useState<string | null>(null);
  const [multipleValue, setMultipleValue] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState<"single" | "multiple">("single");
  const [variant, setVariant] = useState<"outline" | "filled">("outline");
  const [controlSize, setControlSize] = useState<"small" | "regular" | "large" | "xlarge">("regular");
  const [layout, setLayout] = useState<"fill" | "fixed">("fill");
  const [fixedWidth, setFixedWidth] = useState(280);
  const [previewState, setPreviewState] = useState<PreviewState>("default");
  const [grouped, setGrouped] = useState(false);
  const [showLeading, setShowLeading] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const playgroundOptions = decorateOptions(c.options, c.descriptions, showLeading, showDescription);
  const playgroundGroups = makeGroups(playgroundOptions, c.groupLabels);
  const personOptions = usage.people.map((label, index) => ({ value: `person-${index + 1}`, label }));
  const scrollOptions: SelectOption[] = Array.from({ length: 14 }, (_, index) => ({ value: `scroll-option-${index + 1}`, label: locale === "ko" ? `옵션 ${index + 1}` : `Option ${index + 1}` }));
  const selectedSummaryLabel = (first: string, remaining: number) => remaining > 0 ? locale === "ko" ? `${first} 외 ${remaining}명` : `${first} and ${remaining} ${remaining === 1 ? "other" : "others"}` : first;
  const selectedCountLabel = (count: number) => locale === "ko" ? `${count}명 선택됨` : `${count} selected`;

  return (
    <div className="grid items-start gap-6 @min-[1120px]:grid-cols-[minmax(0,1fr)_11rem]">
      <div className="min-w-0 space-y-5">
        <header className="rounded-2xl border border-oe-border-secondary bg-oe-background-primary p-5">
          <h2 className="text-lg font-semibold text-oe-foreground-primary">Select</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-oe-foreground-secondary">{c.description}</p>
        </header>

        <Section id="playground" title="🚩 Playground" description="Style, Size, Layout, Content와 State를 조합하고 실제 선택 동작을 확인합니다.">
          <div className="col-span-full grid gap-5 rounded-xl border-2 border-oe-border-bold-primary bg-oe-background-secondary p-4 @min-[1000px]:grid-cols-[minmax(18rem,1fr)_minmax(32rem,1.35fr)]">
            <div className="flex min-h-52 items-start rounded-xl bg-oe-background-primary p-5">
              {selectionMode === "single" ? <Select
                  {...(grouped ? { groups: playgroundGroups } : { options: playgroundOptions })}
                  value={value}
                  onValueChange={setValue}
                  placeholder={c.placeholder}
                  ariaLabel={c.ariaLabel}
                  variant={variant}
                  controlSize={controlSize}
                  {...(layout === "fixed" ? { layout: "fixed" as const, fixedWidth } : { layout: "fill" as const })}
                  disabled={previewState === "disabled"}
                  readOnly={previewState === "readOnly"}
                  invalid={previewState === "invalid"}
                  className={previewState === "focus" ? "border-oe-focus-ring bg-oe-background-primary ring-1 ring-oe-focus-ring" : undefined}
                /> : <MultiSelect
                  {...(grouped ? { groups: playgroundGroups } : { options: playgroundOptions })}
                  value={multipleValue}
                  onValueChange={setMultipleValue}
                  placeholder={c.placeholder}
                  ariaLabel={c.ariaLabel}
                  selectedSummaryLabel={(first, remaining) => remaining > 0 ? locale === "ko" ? `${first} 외 ${remaining}개` : `${first} and ${remaining} ${remaining === 1 ? "other" : "others"}` : first}
                  variant={variant}
                  controlSize={controlSize}
                  {...(layout === "fixed" ? { layout: "fixed" as const, fixedWidth } : { layout: "fill" as const })}
                  disabled={previewState === "disabled"}
                  readOnly={previewState === "readOnly"}
                  invalid={previewState === "invalid"}
                  className={previewState === "focus" ? "border-oe-focus-ring bg-oe-background-primary ring-1 ring-oe-focus-ring" : undefined}
                />}
            </div>
            <div className="grid gap-5 @min-[720px]:grid-cols-2">
              <div className="space-y-4">
                <ControlSection title="Appearance"><ControlGroup label="Style">{(["outline", "filled"] as const).map((item) => <Choice key={item} active={variant === item} onClick={() => setVariant(item)}>{capitalize(item)}</Choice>)}</ControlGroup></ControlSection>
                <ControlSection title="Size"><ControlGroup label="Control size">{(["small", "regular", "large", "xlarge"] as const).map((item) => <Choice key={item} active={controlSize === item} onClick={() => setControlSize(item)}>{capitalize(item)}</Choice>)}</ControlGroup></ControlSection>
                <ControlSection title="Layout"><ControlGroup label="Width behavior">{(["fill", "fixed"] as const).map((item) => <Choice key={item} active={layout === item} onClick={() => setLayout(item)}>{capitalize(item)}</Choice>)}</ControlGroup>{layout === "fixed" ? <NumberControl label="Width · px" value={fixedWidth} onChange={setFixedWidth} /> : null}</ControlSection>
                <ControlSection title="State"><ControlGroup label="Preview state">{(["default", "focus", "invalid", "disabled", "readOnly"] as const).map((item) => <Choice key={item} active={previewState === item} onClick={() => setPreviewState(item)}>{item === "readOnly" ? "Read only" : capitalize(item)}</Choice>)}</ControlGroup></ControlSection>
              </div>
              <div className="space-y-4">
                <ControlSection title="Content"><Toggle label="Show selected value" value={selectionMode === "single" ? value !== null : multipleValue.length > 0} onChange={(show) => selectionMode === "single" ? setValue(show ? c.options.find((option) => !option.disabled)?.value ?? null : null) : setMultipleValue(show ? c.options.filter((option) => !option.disabled).slice(0, 2).map((option) => option.value) : [])} /><p className="text-[11px] leading-4 text-oe-foreground-placeholder">Off에서는 Placeholder를 표시합니다. 실제 Option은 열린 Content에서 선택합니다.</p></ControlSection>
                <ControlSection title="Options"><ControlGroup label="Selection mode">{(["single", "multiple"] as const).map((item) => <Choice key={item} active={selectionMode === item} onClick={() => setSelectionMode(item)}>{capitalize(item)}</Choice>)}</ControlGroup><Toggle label="Group options" value={grouped} onChange={setGrouped} /><Toggle label="Show description" value={showDescription} onChange={setShowDescription} /></ControlSection>
                <ControlSection title="Elements"><Toggle label="Show leading element" value={showLeading} onChange={setShowLeading} /></ControlSection>
                <ControlSection title="Behavior"><p className="text-[11px] leading-5 text-oe-foreground-tertiary">Trigger를 열고 방향키로 Option을 이동한 뒤 선택합니다. 검색어 입력과 다중 선택은 제공하지 않습니다.</p></ControlSection>
              </div>
            </div>
          </div>
        </Section>

        <Section id="anatomy" title="Anatomy" description="Select를 구성하는 실제 요소와 문서에서 사용하는 명칭입니다."><SelectAnatomy options={decorateOptions(c.options, c.descriptions, true, true)} groupLabels={c.groupLabels} /></Section>

        <Section id="style" title="Properties · Style" description="Outline과 Filled를 지원하며 모든 Form control의 공통 기본값인 Outline을 사용합니다.">
          <Example label="Outline · Default"><Select options={c.options} defaultValue="option-a" ariaLabel={c.ariaLabel} /></Example>
          <Example label="Filled"><Select options={c.options} defaultValue="option-a" ariaLabel={c.ariaLabel} variant="filled" /></Example>
        </Section>

        <Section id="size" title="Properties · Size" description="Input과 Button이 공유하는 공통 Control Height를 사용합니다.">
          <Example label="Small · 32px"><Select options={c.options} defaultValue="option-a" ariaLabel={c.ariaLabel} controlSize="small" /></Example>
          <Example label="Regular · 36px · Default"><Select options={c.options} defaultValue="option-a" ariaLabel={c.ariaLabel} /></Example>
          <Example label="Large · 40px"><Select options={c.options} defaultValue="option-a" ariaLabel={c.ariaLabel} controlSize="large" /></Example>
          <Example label="XLarge · 48px"><Select options={c.options} defaultValue="option-a" ariaLabel={c.ariaLabel} controlSize="xlarge" /></Example>
        </Section>

        <Section id="layout" title="Properties · Layout" description="부모 너비를 채우는 Fill과 명시한 너비를 유지하는 Fixed를 지원합니다.">
          <Example label="Fill · Default"><Select options={c.options} defaultValue="option-a" ariaLabel={c.ariaLabel} /></Example>
          <Example label="Fixed"><Select options={c.options} defaultValue="option-a" ariaLabel={c.ariaLabel} layout="fixed" fixedWidth={240} /></Example>
        </Section>

        <Section id="selection" title="Properties · Selection" description="단일 선택이 기본이며, 다중 선택 결과는 Trigger 한 줄 안에서 대표값과 나머지 개수 또는 전체 개수로 요약합니다.">
          <Example label="Single · Default"><Select options={personOptions} defaultValue="person-1" ariaLabel={c.ariaLabel} /></Example>
          <Example label="Multiple · Representative + remaining"><MultiSelect options={personOptions} defaultValue={["person-1", "person-2"]} ariaLabel={c.ariaLabel} selectedSummaryLabel={selectedSummaryLabel} /></Example>
          <Example label="Multiple · Total count"><MultiSelect options={personOptions} defaultValue={["person-1", "person-2"]} ariaLabel={c.ariaLabel} valueDisplay="count" selectedCountLabel={selectedCountLabel} /></Example>
        </Section>

        <Section id="state" title="Properties · State" description="Select Trigger 상태와 열린 Content에서 선택된 Option의 표현을 구분해 확인합니다.">
          <Example label="Default"><Select options={c.options} value="option-a" onValueChange={() => undefined} ariaLabel={c.ariaLabel} /></Example>
          <Example label="Focus"><Select options={c.options} value="option-a" onValueChange={() => undefined} ariaLabel={c.ariaLabel} className="border-oe-focus-ring bg-oe-background-primary ring-1 ring-oe-focus-ring" /></Example>
          <Example label="Invalid"><Select options={c.options} value="option-a" onValueChange={() => undefined} ariaLabel={c.ariaLabel} invalid /></Example>
          <Example label="Disabled" fixed><Select options={c.options} defaultValue="option-a" ariaLabel={c.ariaLabel} disabled /></Example>
          <Example label="Read only" fixed><Select options={c.options} defaultValue="option-a" ariaLabel={c.ariaLabel} readOnly /></Example>
          <Example label="Selected option" fixed><div className="flex min-h-8 items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-oe-foreground-primary"><span className="min-w-0 flex-1 truncate">Option A</span><RiCheckLine className="size-4 shrink-0 text-oe-brand-foreground-primary" aria-hidden="true" /></div></Example>
        </Section>

        <Section id="options" title="Properties · Options" description="평면 Option과 Group을 지원하며 Option에는 선택적인 Leading element와 Description을 둘 수 있습니다.">
          <Example label="Flat options"><Select options={c.options} defaultValue="option-a" ariaLabel={c.ariaLabel} /></Example>
          <Example label="Grouped options"><Select groups={makeGroups(c.options, c.groupLabels)} defaultValue="option-a" ariaLabel={c.ariaLabel} /></Example>
          <Example label="Leading element"><Select options={decorateOptions(c.options, c.descriptions, true, false)} defaultValue="option-a" ariaLabel={c.ariaLabel} /></Example>
          <Example label="Description"><Select options={decorateOptions(c.options, c.descriptions, false, true)} defaultValue="option-a" ariaLabel={c.ariaLabel} /></Example>
        </Section>

        <Section id="interaction" title="Interaction" description="현재 구현에서 확인되는 열림, 키보드와 선택 동작입니다.">
          <Behavior title="Open / Close">Trigger를 누르면 Content container가 열리고, 바깥 영역을 누르거나 Escape를 누르면 닫힙니다.</Behavior>
          <Behavior title="Keyboard">방향키로 Option을 이동하고 Enter 또는 Space로 선택하며 Escape로 닫습니다.</Behavior>
          <Behavior title="Single selection">Option을 고르면 Content가 닫힙니다. 선택한 Option을 다시 골라도 선택이 해제되지 않습니다.</Behavior>
          <Behavior title="Multiple selection">Option을 고른 뒤에도 Content가 열린 상태로 유지됩니다. 선택한 Option을 다시 고르면 선택이 해제됩니다.</Behavior>
        </Section>

        <Section id="content-height" title="Content height" description="Content가 사용할 수 있는 높이와 Option 목록의 스크롤 규격입니다.">
          <Example label="Content fits"><Select options={c.options} placeholder={c.placeholder} ariaLabel={c.ariaLabel} /></Example>
          <Example label="Scrollable content"><Select options={scrollOptions} placeholder={c.placeholder} ariaLabel={c.ariaLabel} /></Example>
          <GuidelineList className="col-span-full" items={["Popup은 주변에 남은 공간과 320px 중 작은 높이로 제한됩니다.", "Option 목록이 제한보다 짧으면 Option을 담는 높이만큼만 열립니다.", "Option 목록이 현재 최대 높이인 248px을 넘으면 Content 안에서 스크롤합니다.", "스크롤 가능한 목록임을 알 수 있도록 마지막 Option의 일부가 Content 하단 경계에서 보이게 합니다."]} />
        </Section>

        <Section id="usage" title="Guidelines" description="현재 확정된 Select의 사용 및 콘텐츠 작성 규칙입니다.">
          <div className="col-span-full grid gap-10">
            <UsageComparison
              title={usage.fieldLabelTitle}
              doText={usage.fieldLabelDo}
              dontText={usage.fieldLabelDont}
              description={usage.fieldLabelDescription}
              doVisual={<FieldLabelUsagePreview fieldLabel={usage.fieldLabel} value={usage.regions[0]} showLabel />}
              dontVisual={<FieldLabelUsagePreview fieldLabel={usage.fieldLabel} value={usage.regions[0]} />}
            />
            <UsageComparison
              title={usage.leadingTitle}
              doText={usage.leadingDo}
              dontText={usage.leadingDont}
              description={usage.leadingDescription}
              doVisual={<LeadingUsagePreview groupLabel={usage.leadingGroupLabel} labels={usage.visibility} mixed={false} />}
              dontVisual={<LeadingUsagePreview groupLabel={usage.leadingGroupLabel} labels={usage.visibility} mixed />}
            />
            <UsageComparison
              title={usage.descriptionTitle}
              doText={usage.descriptionDo}
              dontText={usage.descriptionDont}
              description={usage.itemDescriptionDescription}
              doVisual={<ItemDescriptionContentPreview label={usage.people[0]} description={usage.organization} />}
              dontVisual={<div className="flex min-h-14 items-center rounded-lg border border-oe-border-primary bg-oe-background-primary px-3 py-2 text-oe-foreground-primary"><span className="min-w-0 flex-1"><span className="block text-sm">{usage.people[0]}</span><span className="mt-0.5 block text-xs text-oe-foreground-tertiary">{usage.organization}</span></span><RiArrowDownSLine className="size-4 shrink-0 text-oe-foreground-tertiary" aria-hidden="true" /></div>}
            />
            <TextUsageGuide title={usage.optionOrderTitle} description={usage.optionOrderDescription} />
            <UsageComparison
              title={usage.itemLabelTitle}
              doText={usage.itemLabelDo}
              dontText={usage.itemLabelDont}
              description={usage.itemLabelDescription}
              doVisual={<OptionListUsagePreview labels={usage.regions} />}
              dontVisual={<OptionListUsagePreview labels={usage.regions.map((label) => locale === "ko" ? `${label} 선택` : `Select ${label}`) as [string, string, string]} />}
            />
            <UsageComparison
              title={usage.placeholderTitle}
              doText={usage.placeholderDo}
              dontText={usage.placeholderDont}
              description={usage.placeholderDescription}
              doVisual={<PlaceholderUsagePreview value={usage.placeholderDoValue} />}
              dontVisual={<PlaceholderUsagePreview value={usage.placeholderDontValue} />}
            />
            <TextUsageGuide title={usage.selectionLimitTitle} description={usage.selectionLimitDescription} />
            <TextUsageGuide title={usage.noneOptionTitle} description={usage.noneOptionDescription} />
            <TextUsageGuide title={usage.multiUsageTitle} description={[usage.selectionMutationPrinciple, usage.selectionMutationExamples, usage.selectionAllRule]} />
            <SelectionSummaryGuide
              title={usage.selectionTitle}
              intro={usage.selectionIntro}
              representativeTitle={usage.representativeTitle}
              representativeDescription={usage.representativeDescription}
              countTitle={usage.countTitle}
              countDescription={usage.countDescription}
              boundary={usage.selectionBoundary}
              representativeVisual={<MultiSelect options={personOptions} defaultValue={["person-1", "person-2", "person-3"]} ariaLabel={c.ariaLabel} selectedSummaryLabel={selectedSummaryLabel} />}
              countVisual={<MultiSelect options={personOptions} defaultValue={["person-1", "person-2", "person-3"]} valueDisplay="count" ariaLabel={c.ariaLabel} selectedCountLabel={(count) => locale === "ko" ? `${count}명 선택됨` : `${count} selected`} />}
            />
          </div>
        </Section>

        <Section id="property-map" title="Property map" description="현재 구현에서 확인되는 Property와 허용 값을 정리합니다.">
          <div className="col-span-full overflow-x-auto"><table className="w-full min-w-[44rem] text-left text-xs"><thead className="border-b border-oe-border-secondary text-oe-foreground-tertiary"><tr><th className="py-2 font-medium">Property</th><th className="py-2 font-medium">Values</th><th className="py-2 font-medium">Default</th><th className="py-2 font-medium">Status</th></tr></thead><tbody className="divide-y divide-oe-border-secondary text-oe-foreground-secondary">
            <MapRow property="component" values="Select | MultiSelect" defaultValue="Select" /><MapRow property="variant" values="outline | filled" defaultValue="outline" /><MapRow property="controlSize" values="small | regular | large | xlarge" defaultValue="regular" /><MapRow property="layout" values="fill | fixed" defaultValue="fill" /><MapRow property="value" values="string | null / string[]" defaultValue="null / []" /><MapRow property="valueDisplay" values="summary | count (Multi only)" defaultValue="summary" /><MapRow property="options | groups" values="SelectOption[] | SelectOptionGroup[]" defaultValue="one required" /><MapRow property="option elements" values="leadingElement? | description?" defaultValue="none" /><MapRow property="state" values="default | focus | invalid | disabled | readOnly" defaultValue="default" />
          </tbody></table></div>
        </Section>
      </div>

      <OnThisPage items={sections} componentKey="select" />
    </div>
  );
}

function SelectAnatomy({ options, groupLabels }: { options: SelectOption[]; groupLabels: [string, string] }) {
  return (
    <div className="col-span-full grid min-w-0 gap-8">
      <AnatomyPanel
        title="Select structure"
        parts={["Trigger container", "Value / Placeholder", "Trigger icon", "Content container", "Group", "Group label"]}
        summary="Select는 Trigger와 Content container로 구성됩니다. Content 안의 관련 Option은 Group으로 묶으며, Group 사이에만 Divider가 표시됩니다."
        notes={[
          { term: "Trigger", description: "현재 선택값 또는 Placeholder를 표시하고, 누르면 Content container를 엽니다. 선택적인 Leading element와 열림 상태를 나타내는 Chevron을 포함할 수 있습니다." },
          { term: "Content container", description: "Trigger에 이어져 Option 목록을 보여주는 영역입니다. Trigger와 같은 너비와 좌우 시작점을 사용합니다." },
          { term: "Group", description: "관련 있는 Option을 묶는 단위입니다. Group label로 제목을 표시하며 Group 사이에는 Divider를 자동으로 배치합니다." },
        ]}
      >
        <div role="img" aria-label="Select structure anatomy" className="relative mx-auto h-[19rem] w-[48rem]">
          <div className="absolute left-40 top-12 w-[28rem]">
            <div className="flex h-9 items-center gap-2.5 rounded-lg border border-oe-border-primary bg-oe-background-primary px-3 text-sm text-oe-foreground-primary"><AnatomySwapSlot /><span className="min-w-0 flex-1 truncate">{options[0].label}</span><RiArrowDownSLine className="size-4 text-oe-foreground-tertiary" /></div>
            <div className="mt-1 rounded-lg border border-oe-border-primary bg-oe-background-primary p-1 shadow-lg">
              <div className="p-1"><p className="px-2 py-1 text-[11px] font-medium text-oe-foreground-tertiary">{groupLabels[0]}</p><div className="flex min-h-8 items-center gap-2.5 rounded-md px-2 py-1.5 text-sm"><AnatomySwapSlot /><span>{options[0].label}</span></div><div className="flex min-h-8 items-center gap-2.5 rounded-md px-2 py-1.5 text-sm"><AnatomySwapSlot /><span>{options[1].label}</span></div></div>
              <div className="my-1.5 h-px bg-oe-border-secondary" />
              <div className="p-1"><p className="px-2 py-1 text-[11px] font-medium text-oe-foreground-tertiary">{groupLabels[1]}</p><div className="flex min-h-8 items-center gap-2.5 rounded-md px-2 py-1.5 text-sm"><AnatomySwapSlot /><span>{options[2].label}</span></div></div>
            </div>
          </div>
          <span aria-hidden="true" className="absolute left-[9.5rem] top-12 h-9 w-px bg-oe-border-primary" />
          <span aria-hidden="true" className="absolute left-[9.5rem] top-[6.25rem] h-[6rem] w-px bg-oe-border-primary" />
          <Marker number="1" className="left-14 top-[3.5rem]" lineClassName="left-5 top-2.5 h-px w-[4.75rem]" />
          <Marker number="2" className="left-[13.375rem] top-0" lineClassName="left-2.5 top-5 h-[2.75rem] w-px" />
          <Marker number="3" className="right-[7.25rem] top-[3.5rem]" lineClassName="right-5 top-2.5 h-px w-8" />
          <Marker number="4" className="left-14 top-[6.25rem]" lineClassName="left-5 top-2.5 h-px w-[4.75rem]" />
          <Marker number="5" className="left-14 top-[8.75rem]" lineClassName="left-5 top-2.5 h-px w-[4.75rem]" />
          <Marker number="6" className="left-14 top-[12.75rem]" lineClassName="left-5 top-2.5 h-px w-[5.5rem]" />
        </div>
      </AnatomyPanel>

      <AnatomyPanel
        title="Option anatomy"
        parts={["Option", "Leading element (Optional)", "Item label", "Item description (Optional)"]}
        summary="Option은 Content container 안에서 선택할 수 있는 하나의 항목입니다. 같은 목록에서 Leading element를 사용하면 모든 Option에 같은 영역을 유지하며, 선택 상태와 Indicator는 Properties · State에서 확인합니다."
        notes={[
          { term: "Option", description: "Item label을 필수 정보로 사용하고, 필요할 때 Leading element와 Item description으로 내용을 보완합니다." },
          { term: "Leading element", description: "Option 내용 앞에 표시하는 선택 요소입니다. 현재는 Remix Icon으로 검수하며 Label과 Description 전체 블록을 기준으로 수직 중앙 정렬합니다." },
          { term: "Item description", description: "Label 아래에서 추가 정보를 설명하는 선택 요소입니다. Trigger의 선택값에는 표시하지 않습니다." },
        ]}
      >
        <div role="img" aria-label="Select option anatomy" className="relative mx-auto h-[9rem] w-[48rem]">
          <div className="absolute left-40 top-12 flex min-h-11 w-[28rem] items-start gap-2.5 rounded-md border border-oe-border-secondary bg-oe-background-primary px-2.5 py-1.5 text-sm"><AnatomySwapSlot className="self-center" /><span className="min-w-0 flex-1"><span className="block">{options[2].label}</span><span className="mt-0.5 block text-xs leading-4 text-oe-foreground-tertiary">{options[2].description}</span></span></div>
          <span aria-hidden="true" className="absolute left-[9.5rem] top-12 h-[3.15rem] w-px bg-oe-border-primary" />
          <Marker number="1" className="left-14 top-[4rem]" lineClassName="left-5 top-2.5 h-px w-[4.75rem]" />
          <Marker number="2" className="left-[10.15rem] top-0" lineClassName="left-2.5 top-5 h-[2.75rem] w-px" />
          <Marker number="3" className="right-8 top-[3.375rem]" lineClassName="right-5 top-2.5 h-px w-[28rem]" />
          <Marker number="4" className="right-8 top-[4.625rem]" lineClassName="right-5 top-2.5 h-px w-[24rem]" />
        </div>
      </AnatomyPanel>
    </div>
  );
}

function AnatomyPanel({ title, parts, summary, notes, children }: { title: string; parts: string[]; summary: string; notes: { term: string; description: string }[]; children: ReactNode }) {
  return <div className="min-w-0"><div className="rounded-xl bg-oe-background-secondary px-5 py-5"><p className="text-xs font-semibold text-oe-foreground-primary">{title}</p><div className="mt-2 overflow-x-auto">{children}</div><ol className="mt-3 flex flex-wrap gap-x-5 gap-y-2 px-1 text-left text-xs text-oe-foreground-primary">{parts.map((part, index) => { const optionalAt = part.indexOf(" ("); return <li key={part} className="flex items-baseline gap-1.5"><span className="font-semibold">{index + 1}.</span><span>{optionalAt > -1 ? part.slice(0, optionalAt) : part}</span>{optionalAt > -1 ? <span className="text-oe-foreground-placeholder">{part.slice(optionalAt)}</span> : null}</li>; })}</ol></div><div className="px-1 pt-4"><p className="text-sm leading-6 text-oe-foreground-secondary">{summary}</p><dl className="mt-3 grid gap-2 text-sm leading-6">{notes.map((note) => <div key={note.term}><dt className="inline font-semibold text-oe-foreground-primary">{note.term}:</dt><dd className="ml-1.5 inline text-oe-foreground-tertiary">{note.description}</dd></div>)}</dl></div></div>;
}

function UsageComparison({ title, doText, dontText, description, doVisual, dontVisual }: { title: string; doText: ReactNode; dontText: ReactNode; description: string[]; doVisual: ReactNode; dontVisual: ReactNode }) {
  return <div><GuidelineTitle>{title}</GuidelineTitle><div className="mt-3 grid gap-3 @min-[720px]:grid-cols-2"><div className="order-1 rounded-xl border border-oe-border-secondary bg-oe-background-secondary p-4 @min-[720px]:col-start-1 @min-[720px]:row-start-1">{doVisual}</div><div className="order-3 rounded-xl border border-oe-border-secondary bg-oe-background-secondary p-4 @min-[720px]:col-start-2 @min-[720px]:row-start-1">{dontVisual}</div><div className="order-2 flex gap-2 rounded-xl bg-oe-success-background-primary p-3 text-oe-success-foreground-primary @min-[720px]:col-start-1 @min-[720px]:row-start-2"><RiCheckboxCircleFill className="mt-0.5 size-oe-icon-small shrink-0 text-oe-success-foreground-secondary" aria-hidden="true" /><div><p className="text-xs font-semibold">Do</p><p className="mt-0.5 text-sm leading-6">{doText}</p></div></div><div className="order-4 flex gap-2 rounded-xl bg-oe-danger-background-primary p-3 text-oe-danger-foreground-primary @min-[720px]:col-start-2 @min-[720px]:row-start-2"><RiCloseCircleFill className="mt-0.5 size-oe-icon-small shrink-0 text-oe-danger-foreground-secondary" aria-hidden="true" /><div><p className="text-xs font-semibold">Don’t</p><p className="mt-0.5 text-sm leading-6">{dontText}</p></div></div><GuidelineList className="order-5 @min-[720px]:col-span-2 @min-[720px]:row-start-3" items={description} /></div></div>;
}

function SelectionSummaryGuide({ title, intro, representativeTitle, representativeDescription, countTitle, countDescription, boundary, representativeVisual, countVisual }: { title: string; intro: string; representativeTitle: string; representativeDescription: string; countTitle: string; countDescription: string; boundary: string; representativeVisual: ReactNode; countVisual: ReactNode }) {
  return <div><GuidelineTitle>{title}</GuidelineTitle><p className="mt-2 text-sm leading-6 text-oe-foreground-secondary">{intro}</p><div className="mt-3 grid gap-3 @min-[720px]:grid-cols-2"><div className="rounded-xl border border-oe-border-secondary bg-oe-background-secondary p-4"><p className="mb-3 text-xs font-semibold text-oe-foreground-primary">{representativeTitle}</p>{representativeVisual}</div><div className="rounded-xl border border-oe-border-secondary bg-oe-background-secondary p-4"><p className="mb-3 text-xs font-semibold text-oe-foreground-primary">{countTitle}</p>{countVisual}</div></div><GuidelineList className="mt-3" items={[<><span className="font-medium text-oe-foreground-primary">{representativeTitle}:</span> {representativeDescription}</>, <><span className="font-medium text-oe-foreground-primary">{countTitle}:</span> {countDescription}</>, boundary]} /></div>;
}

function TextUsageGuide({ title, description }: { title: string; description: string[] }) {
  return <div><GuidelineTitle>{title}</GuidelineTitle><GuidelineList className="mt-2" items={description} /></div>;
}

function GuidelineList({ items, className = "" }: { items: ReactNode[]; className?: string }) {
  return <ul className={`space-y-1 px-1 text-sm leading-6 text-oe-foreground-secondary ${className}`}>{items.map((item, index) => <li key={index} className="flex items-start gap-2"><span className="mt-[10px] size-[3px] shrink-0 rounded-full bg-oe-foreground-placeholder" aria-hidden="true" /><span className="min-w-0">{typeof item === "string" ? linkGuidelineReferences(item) : item}</span></li>)}</ul>;
}

function OptionListUsagePreview({ labels }: { labels: [string, string, string] }) {
  return <div className="rounded-lg border border-oe-border-secondary bg-oe-background-primary p-1">{labels.map((label) => <div key={label} className="flex min-h-8 items-center rounded-md px-2.5 py-1.5 text-sm text-oe-foreground-primary">{label}</div>)}</div>;
}

function PlaceholderUsagePreview({ value }: { value: string }) {
  return <div className="flex h-9 items-center gap-2 rounded-lg border border-oe-border-primary bg-oe-background-primary px-3 text-sm text-oe-foreground-placeholder"><span className="min-w-0 flex-1 truncate">{value}</span><RiArrowDownSLine className="size-4 shrink-0 text-oe-foreground-tertiary" aria-hidden="true" /></div>;
}

function linkGuidelineReferences(text: string) {
  return text.split(/(Combobox|부모-자식 Checkbox|parent-child Checkbox)/g).map((part, index) => {
    if (part === "Combobox") return <Link key={index} href="/components/combobox" className="font-medium text-oe-foreground-primary underline decoration-oe-border-primary underline-offset-2 transition-colors hover:text-oe-brand-foreground-primary">{part}</Link>;
    if (part === "부모-자식 Checkbox" || part === "parent-child Checkbox") return <Link key={index} href="/components/checkbox#appearance" className="font-medium text-oe-foreground-primary underline decoration-oe-border-primary underline-offset-2 transition-colors hover:text-oe-brand-foreground-primary">{part}</Link>;
    return part;
  });
}

function ItemDescriptionContentPreview({ label, description }: { label: string; description: string }) {
  return <div className="space-y-1.5"><div className="flex h-9 items-center gap-2 rounded-lg border border-oe-border-primary bg-oe-background-primary px-3 text-sm text-oe-foreground-primary"><span className="min-w-0 flex-1 truncate">{label}</span><RiArrowDownSLine className="size-4 shrink-0 text-oe-foreground-tertiary" aria-hidden="true" /></div><div className="rounded-lg border border-oe-border-secondary bg-oe-background-primary p-1"><div className="flex min-h-11 items-center gap-2.5 rounded-md px-2.5 py-1.5"><span className="min-w-0 flex-1"><span className="block text-sm font-medium text-oe-foreground-primary">{label}</span><span className="mt-0.5 block text-xs text-oe-foreground-tertiary">{description}</span></span><RiCheckLine className="size-4 shrink-0 text-oe-brand-foreground-primary" aria-hidden="true" /></div></div></div>;
}

function LeadingUsagePreview({ groupLabel, labels, mixed }: { groupLabel: string; labels: [string, string, string]; mixed: boolean }) {
  const icons = [RiGlobalLine, RiTeamLine, RiLockLine];
  return <div className="space-y-1.5"><div className="flex h-9 items-center gap-2.5 rounded-lg border border-oe-border-primary bg-oe-background-primary px-3 text-sm text-oe-foreground-primary"><RiGlobalLine className="size-oe-icon-small shrink-0 text-oe-foreground-tertiary" aria-hidden="true" /><span className="min-w-0 flex-1 truncate">{labels[0]}</span><RiArrowDownSLine className="size-4 shrink-0 text-oe-foreground-tertiary" aria-hidden="true" /></div><div className="rounded-lg border border-oe-border-secondary bg-oe-background-primary p-1"><p className="px-2 pb-1 pt-1.5 text-[11px] font-medium text-oe-foreground-tertiary">{groupLabel}</p>{icons.map((Icon, index) => <div key={labels[index]} className="flex min-h-8 items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-oe-foreground-primary">{!mixed || index === 0 ? <Icon className="size-oe-icon-small shrink-0 text-oe-foreground-tertiary" aria-hidden="true" /> : null}<span>{labels[index]}</span></div>)}</div></div>;
}

function FieldLabelUsagePreview({ fieldLabel, value, showLabel = false }: { fieldLabel: string; value: string; showLabel?: boolean }) {
  return <div className="flex min-h-20 flex-col justify-center"><div className="space-y-1.5"><p aria-hidden={!showLabel || undefined} className={`px-0.5 text-xs font-medium text-oe-foreground-primary ${showLabel ? "" : "invisible"}`}>{fieldLabel}</p><div className="flex h-9 items-center gap-2 rounded-lg border border-oe-border-primary bg-oe-background-primary px-3 text-sm text-oe-foreground-primary"><span className="min-w-0 flex-1 truncate">{value}</span><RiArrowDownSLine className="size-4 shrink-0 text-oe-foreground-tertiary" aria-hidden="true" /></div></div></div>;
}

function decorateOptions(options: SelectOption[], descriptions: readonly string[], leading: boolean, description: boolean): SelectOption[] {
  const icons = [RiFolderLine, RiFileLine, RiImageLine, RiSettings3Line];
  return options.map((option, index) => {
    const Icon = icons[index] ?? RiFileLine;
    return { ...option, leadingElement: leading ? <Icon aria-hidden="true" /> : undefined, description: description ? descriptions[index] : undefined };
  });
}

function makeGroups(options: SelectOption[], labels: readonly [string, string]): SelectOptionGroup[] {
  return [{ label: labels[0], options: options.slice(0, 2) }, { label: labels[1], options: options.slice(2) }];
}

function Marker({ number, className, lineClassName }: { number: string; className: string; lineClassName: string }) { return <span className={`absolute grid size-5 place-items-center rounded-full bg-oe-foreground-secondary text-[11px] text-oe-foreground-inverse ${className}`}>{number}<span aria-hidden="true" className={`absolute bg-oe-border-primary ${lineClassName}`} /></span>; }
function Section({ id, title, description, children }: { id: string; title: string; description: string; children: ReactNode }) { return <section id={id} className="scroll-mt-20 rounded-2xl border border-oe-border-secondary bg-oe-background-primary p-5"><h3 className="text-sm font-semibold text-oe-foreground-primary">{title}</h3><p className="mt-1 text-xs leading-5 text-oe-foreground-tertiary">{description}</p><div className="mt-5 grid gap-3 @min-[720px]:grid-cols-2">{children}</div></section>; }
function Example({ label, children }: { label: string; children: ReactNode; fixed?: boolean }) { return <div className="flex min-h-28 min-w-0 flex-col gap-3 rounded-xl border border-oe-border-secondary p-4"><p className="text-[11px] font-medium text-oe-foreground-primary">{label}</p><PreviewLocaleScope className="mt-auto">{children}</PreviewLocaleScope></div>; }
function ControlSection({ title, children }: { title: string; children: ReactNode }) { return <section><h4 className="mb-3 text-xs font-semibold text-oe-foreground-primary">{title}</h4><div className="space-y-3">{children}</div></section>; }
function ControlGroup({ label, children }: { label: string; children: ReactNode }) { return <fieldset><legend className="mb-2 text-[11px] font-medium text-oe-foreground-tertiary">{label}</legend><div className="flex flex-wrap gap-1.5">{children}</div></fieldset>; }
function Choice({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) { return <button type="button" aria-pressed={active} onClick={onClick} className={`rounded-lg border px-2.5 py-1.5 text-xs transition-colors ${active ? "border-oe-foreground-primary bg-oe-background-bold-primary text-oe-foreground-inverse" : "border-oe-border-secondary bg-oe-background-primary text-oe-foreground-secondary hover:bg-oe-interaction-hover"}`}>{children}</button>; }
function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) { return <div className="flex items-center justify-between gap-3"><span className="text-[11px] font-medium text-oe-foreground-tertiary">{label}</span><button type="button" role="switch" aria-checked={value} aria-label={label} onClick={() => onChange(!value)} className={`relative h-5 w-9 shrink-0 rounded-full ${value ? "bg-oe-background-bold-primary" : "bg-oe-background-secondary ring-1 ring-inset ring-oe-border-primary"}`}><span className={`absolute top-0.5 size-4 rounded-full bg-oe-background-primary shadow-sm transition-[left] ${value ? "left-[18px]" : "left-0.5"}`} /></button></div>; }
function NumberControl({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) { return <label className="block"><span className="mb-1.5 block text-[11px] font-medium text-oe-foreground-tertiary">{label}</span><input type="number" value={value} min={160} max={640} onChange={(event) => onChange(Number(event.target.value))} className="h-8 w-full rounded-lg border border-oe-border-primary bg-oe-background-primary px-2.5 text-xs tabular-nums text-oe-foreground-primary outline-none focus:border-oe-focus-ring focus:ring-1 focus:ring-oe-focus-ring" /></label>; }
function Behavior({ title, children }: { title: string; children: ReactNode }) { return <div className="rounded-xl border border-oe-border-secondary p-4"><p className="text-[11px] font-medium text-oe-foreground-primary">{title}</p><p className="mt-1 text-[11px] leading-4 text-oe-foreground-tertiary">{children}</p></div>; }
function MapRow({ property, values, defaultValue }: { property: string; values: string; defaultValue: string }) { return <tr><td className="py-3 pr-4 font-medium text-oe-foreground-primary">{property}</td><td className="py-3 pr-4 font-mono text-[11px]">{values}</td><td className="py-3 pr-4 font-mono text-[11px]">{defaultValue}</td><td className="py-3">Confirmed</td></tr>; }
function capitalize(value: string) { return value.charAt(0).toUpperCase() + value.slice(1); }
