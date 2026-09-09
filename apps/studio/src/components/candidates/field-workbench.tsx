"use client";

import { useState, type ReactNode } from "react";
import { CheckboxField, Chip, Field, Input, InputButton, NumberInput, RadioField, RadioGroup, Select, SelectBox, SelectBoxGroup, Textarea } from "@ooee/ui";
import { RiCalendarLine, RiRefreshLine, RiTimeLine } from "@remixicon/react";

import { AnatomyBoundaryMarker, AnatomyFrame, AnatomyLegend, AnatomyNumber, AnatomyStructureMap, AnatomySurface, AnatomySwapSlot } from "@/components/component-anatomy";
import { OnThisPage } from "@/components/component-detail-navigation";
import { GuidelineList } from "@/components/component-guidelines";
import { GuidelineTitle } from "@/components/guideline-title";
import { PlaygroundChoice as Choice, DependentControlGroup } from "@/components/playground-element-control";

const SMALL_LABEL = "text-[11px] font-medium text-oe-foreground-tertiary";

const regions = [
  { value: "seoul", label: "서울" },
  { value: "busan", label: "부산" },
  { value: "jeju", label: "제주" },
];

// Input slot 에 실제로 들어가는 Control 을 쓰이는 순서대로 둔다. 한 줄 입력에서 여러 줄 입력,
// 목록 선택, 여러 항목 선택, 별도 화면을 여는 Trigger 로 이어진다.
const genericOptions = [
  { value: "option-1", label: "Option 1" },
  { value: "option-2", label: "Option 2" },
  { value: "option-3", label: "Option 3" },
];

const slots = ["input", "textarea", "number-input", "select", "radio-group", "checkbox-group", "chip-group", "date", "time"] as const;
const slotLabels: Record<(typeof slots)[number], string> = {
  input: "Text Field",
  textarea: "Textarea",
  "number-input": "Number Input",
  select: "Select",
  "radio-group": "Radio Group",
  "checkbox-group": "Checkbox Group",
  "chip-group": "Chip Group",
  date: "Date",
  time: "Time",
};

// Group 은 가리킬 Control 하나가 없으므로 Field 가 group 이름을 소유한다. Playground 에서 Slot 을
// 바꿀 때 이 값이 함께 따라가야 접근 가능한 이름이 끊기지 않는다.
const groupSlots = new Set<(typeof slots)[number]>(["radio-group", "checkbox-group", "chip-group"]);

const guidelines = [
  {
    title: "Label과 피드백의 소유자를 Field로 두기",
    items: [
      "Label과 필수 표시, 도움말과 오류 문구는 Field가 소유합니다. Input이나 Select 같은 Control은 값을 다루는 일만 합니다.",
      "Control이 Label을 함께 들고 있으면 같은 Label이 컴포넌트마다 다른 속성 이름으로 갈립니다. 폼 한 칸의 구조를 한 곳에서 정하기 위해 Field로 모읍니다.",
      "접근성 연결도 Field가 소유합니다. Label과 Control, 도움말과 오류 문구를 잇는 일을 소비자가 직접 하지 않습니다.",
    ],
  },
  {
    title: "필수는 기호로, 나머지는 Right description으로 알리기",
    items: [
      "필수 항목은 Label 앞의 * 하나로만 알립니다. 기호는 보조기술에서 숨기고 Control이 실제 required 상태를 갖습니다.",
      "선택사항임을 강조해야 할 때와 여러 개를 고르는 자리에서 개수를 알릴 때만 텍스트를 씁니다. Right description에 「선택」이나 「최대 3개」를 둡니다.",
      "그 문구를 Label 안에 괄호로 적지 않습니다. Label만 빠르게 읽을 수 있어야 하고, 어느 자리에 무엇이 들어가는지가 속성 이름으로 드러나야 합니다.",
    ],
  },
  {
    title: "오류가 있으면 도움말을 대신하기",
    items: [
      "도움말과 오류 문구가 함께 있으면 오류만 보입니다. 둘이 함께 쌓이면 항목마다 Footer 높이가 달라져 폼의 수직 리듬이 깨집니다.",
      "오류 문구는 무엇을 해야 하는지 알리는 행동 지시형으로 씁니다. 「휴대폰 번호를 10-11자리로 입력해 주세요」처럼 씁니다.",
      "오류 상태에서는 Character count도 오류와 같은 색으로 바뀝니다. 글자 수 제한을 넘겨 생긴 오류를 같은 자리에서 확인할 수 있어야 합니다.",
    ],
  },
  {
    title: "상태값을 따라가기",
    items: [
      "Header와 Footer의 글자는 Input slot에 있는 Control의 상태를 따라갑니다. Control만 상태를 표현하고 Label을 기본 상태로 남기지 않습니다.",
      "Disabled에서는 Label과 필수 표시, Right description과 Footer 문구가 모두 흐려집니다. Label만 흐려지고 나머지가 그대로면 절반만 꺼진 것으로 보입니다.",
      "Error에서는 Label이 오류 문구와 같은 색을 씁니다. 여러 항목이 놓인 폼에서 어느 항목에서 오류가 났는지 Label에서 바로 읽혀야 합니다.",
      "두 상태가 겹치면 Disabled가 앞섭니다. 손댈 수 없는 항목에 고쳐야 한다는 표시를 남기면 사용자가 그 자리를 붙들게 됩니다.",
    ],
  },
  {
    title: "Control은 Large 이상을 쓰기",
    items: [
      "Field와 결합해 쓰는 화면은 대체로 모바일 폼입니다. 손가락으로 누르는 자리이므로 한 줄 Control은 Regular 36px이 아니라 Large 40px 이상을 씁니다.",
      "크기는 Field가 아니라 각 Control의 controlSize가 소유하므로 Field가 강제하지 않습니다. 데스크톱 관리자 화면처럼 밀도가 중요한 자리에서는 Regular를 쓸 수 있습니다.",
      "Radio와 Checkbox, Chip은 이 규칙의 대상이 아닙니다. 세 컴포넌트는 각자 자기 조작 영역과 최소 높이를 소유합니다.",
    ],
  },
  {
    title: "Input slot에는 Control을 그대로 두기",
    items: [
      "Control 하나를 Input slot의 직접 자식으로 둡니다. Field가 그 자식에 id와 상태를 주입해 Label과 잇습니다.",
      "Control을 div로 한 번 감싸면 주입 대상을 잃어 Label 연결이 끊깁니다. 개발 환경에서는 그 자리를 경고로 알립니다.",
      "Checkbox Group처럼 여러 항목을 나열할 때는 group을 사용합니다. Field가 Label을 그룹의 이름으로 두고 각 항목에는 주입하지 않습니다.",
    ],
  },
] as const satisfies readonly { title: string; items: readonly string[] }[];

const sections = [
  { id: "playground", label: "Playground" },
  { id: "anatomy", label: "Anatomy" },
  { id: "header", label: "Properties · Header" },
  { id: "footer", label: "Properties · Footer" },
  { id: "slot", label: "Properties · Input slot" },
  { id: "guidelines", label: "Guidelines" },
  { id: "property-map", label: "Property map" },
];

export function FieldWorkbench() {
  const [slot, setSlot] = useState<(typeof slots)[number]>("input");
  const [required, setRequired] = useState(true);
  const [rightDescription, setRightDescription] = useState(false);
  const [trailing, setTrailing] = useState(false);
  const [helper, setHelper] = useState(true);
  const [error, setError] = useState(false);
  const [count, setCount] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const group = groupSlots.has(slot);

  return (
    <div className="grid items-start gap-6 @min-[1120px]:grid-cols-[minmax(0,1fr)_11rem]">
      <div className="min-w-0 space-y-5">
        <Section id="playground" title="🚩 Playground" description="Header와 Footer의 요소를 켜고 끄면서 Input slot에 들어가는 Control을 바꿔 봅니다. Slot을 Group으로 바꾸면 Field가 Label을 그룹의 이름으로 두므로, 같은 Label이 Control 하나일 때와 다르게 연결됩니다.">
          <div className="col-span-full grid gap-5 rounded-xl border-2 border-oe-border-bold-primary bg-oe-background-secondary p-4 @min-[760px]:grid-cols-[minmax(16rem,1fr)_16rem]">
            <div className="flex items-start justify-center rounded-xl bg-oe-background-primary p-5">
              <div className="w-full max-w-sm">
                <Field
                  label="Label"
                  required={required}
                  group={group}
                  disabled={disabled}
                  rightDescription={rightDescription ? "Right description" : undefined}
                  trailingElement={trailing ? <ResetAction /> : undefined}
                  helperText={helper ? "Helper text" : undefined}
                  errorMessage={error ? "Error message" : undefined}
                  characterCount={count ? { current: 12, max: 200 } : undefined}
                >
                  {renderSlot({ slot, disabled })}
                </Field>
              </div>
            </div>
            <div className="space-y-5 rounded-xl bg-oe-background-primary p-4">
              <ControlSection title="Content">
                <ControlGroup label="Input slot">{slots.map((item) => <Choice key={item} active={slot === item} onClick={() => setSlot(item)}>{slotLabels[item]}</Choice>)}</ControlGroup>
              </ControlSection>
              <ControlSection title="State">
                <Toggle label="Required" value={required} onChange={setRequired} />
                <Toggle label="Disabled" value={disabled} onChange={setDisabled} />
              </ControlSection>
              <ControlSection title="Elements">
                <Toggle label="Right description" value={rightDescription} onChange={setRightDescription} />
                <Toggle label="Trailing element" value={trailing} onChange={setTrailing} />
                <Toggle label="Helper text" value={helper} onChange={setHelper} />
                <Toggle label="Error message" value={error} onChange={setError} />
                <DependentControlGroup>
                  <Toggle label="Character count" value={count} onChange={setCount} />
                </DependentControlGroup>
              </ControlSection>
            </div>
          </div>
        </Section>

        <Section id="anatomy" title="Anatomy" description="Field를 구성하는 실제 요소와 문서에서 사용하는 명칭입니다. Input slot은 Control이 갈아 끼워지는 Swap 영역이라 실제 컴포넌트를 그리지 않고 교체 표시로 둡니다.">
          <div className="col-span-full min-w-0">
            <AnatomySurface ariaLabel="Field anatomy" title="Field structure" className="px-5 pb-16 pt-20">
              <div className="flex justify-center">
                <AnatomyFrame gap={{ left: 96, right: 96 }}>
                  <div data-slot="field" className="flex w-72 flex-col gap-1.5 rounded-xl border border-oe-border-secondary bg-oe-background-primary p-4">
                    <div data-slot="field-header" className="flex items-center gap-1">
                      <span data-slot="field-requirement" className="text-sm leading-5 text-oe-danger-foreground-secondary">*</span>
                      <span data-slot="field-label" className="text-sm font-medium leading-5 text-oe-foreground-primary">Label</span>
                      <span data-slot="field-right-description" className="text-xs leading-5 text-oe-foreground-tertiary">Right description</span>
                      <span data-slot="field-trailing" className="ml-auto flex items-center"><AnatomySwapSlot /></span>
                    </div>
                    <div data-slot="field-input-slot" className="flex h-9 items-center justify-center rounded-oe-control border border-dashed border-pink-400 bg-pink-50 dark:bg-pink-950">
                      <span className="text-[11px] text-oe-foreground-tertiary">Control</span>
                    </div>
                    <div data-slot="field-footer" className="flex items-baseline justify-between gap-2">
                      <span data-slot="field-message" className="text-xs leading-5 text-oe-foreground-tertiary">Helper text</span>
                      <span data-slot="field-character-count" className="text-xs leading-5 tabular-nums text-oe-foreground-tertiary">0/200</span>
                    </div>
                  </div>
                  <AnatomyNumber number={1} target="[data-slot=field-requirement]" side="top" />
                  <AnatomyNumber number={2} target="[data-slot=field-label]" side="top" />
                  <AnatomyNumber number={3} target="[data-slot=field-right-description]" side="top" />
                  <AnatomyNumber number={4} target="[data-slot=field-trailing]" side="right" />
                  <AnatomyBoundaryMarker number={5} target="[data-slot=field-input-slot]" side="left" connectorLength={48} />
                  <AnatomyNumber number={6} target="[data-slot=field-message]" side="bottom" />
                  <AnatomyNumber number={7} target="[data-slot=field-character-count]" side="right" />
                </AnatomyFrame>
              </div>
            </AnatomySurface>
            <AnatomyLegend items={[
              { name: "Requirement", optional: true },
              { name: "Label" },
              { name: "Right description", optional: true },
              { name: "Trailing element", optional: true },
              { name: "Input slot" },
              { name: "Helper text · Error message", optional: true },
              { name: "Character count", optional: true },
            ]} />

            <div className="mt-4">
              <AnatomyStructureMap lines={[
                { name: "Field" },
                { prefix: "├─ ", name: "Header" },
                { prefix: "│  ├─ ", name: "Requirement", optional: true },
                { prefix: "│  ├─ ", name: "Label" },
                { prefix: "│  ├─ ", name: "Right description", optional: true },
                { prefix: "│  └─ ", name: "Trailing element", optional: true },
                { prefix: "├─ ", name: "Input slot" },
                { prefix: "└─ ", name: "Footer", optional: true },
                { prefix: "   ├─ ", name: "Helper text · Error message", optional: true },
                { prefix: "   └─ ", name: "Character count", optional: true },
              ]} />
            </div>
          </div>
        </Section>

        <Section id="header" title="Properties · Header" description="Requirement는 Label 앞에 오고 Right description은 Label 바로 뒤에 붙습니다. Trailing element만 오른쪽 끝으로 밀립니다.">
          <Card label="Required" only="header">
            <Field label="휴대폰 번호" required><Input controlSize="large" placeholder="010-0000-0000" /></Field>
          </Card>
          <Card label="Right description · 선택 강조" only="header">
            <Field label="추천 코드" rightDescription="선택"><Input controlSize="large" placeholder="코드를 입력하세요" /></Field>
          </Card>
          <Card label="Right description · 개수 안내" only="header">
            <Field label="관심 지역" group rightDescription="최대 3개" required>
              <SelectBoxGroup selectionMode="multiple">
                <SelectBox value="seoul" title="서울" />
                <SelectBox value="busan" title="부산" />
              </SelectBoxGroup>
            </Field>
          </Card>
          <Card label="Trailing element" only="header">
            <Field label="관심 지역" trailingElement={<ResetAction />}><Select controlSize="large" options={regions} placeholder="지역 선택" /></Field>
          </Card>
        </Section>

        <Section id="footer" title="Properties · Footer" description="도움말과 오류는 왼쪽, Character count는 오른쪽입니다. 오류가 있으면 도움말 대신 오류만 보이고 Control도 함께 invalid가 됩니다.">
          <Card label="Helper text" only="footer">
            <Field label="휴대폰 번호" helperText="10-11자리로 입력해 주세요"><Input controlSize="large" placeholder="01000000000" /></Field>
          </Card>
          <Card label="Error message가 Helper text를 대체" only="footer">
            <Field label="휴대폰 번호" helperText="10-11자리로 입력해 주세요" errorMessage="휴대폰 번호를 10-11자리로 입력해 주세요"><Input controlSize="large" defaultValue="0100000" /></Field>
          </Card>
          <Card label="Character count" only="footer">
            <Field label="소개" helperText="자기소개를 적어 주세요" characterCount={{ current: 42, max: 200 }}><Textarea defaultValue="같이 일하기 좋은 사람을 찾고 있습니다." /></Field>
          </Card>
          <Card label="Character count · 오류" only="footer">
            <Field label="소개" errorMessage="200자 안에서 작성해 주세요" characterCount={{ current: 214, max: 200 }}><Textarea defaultValue="같이 일하기 좋은 사람을 찾고 있습니다." /></Field>
          </Card>
        </Section>

        <Section id="slot" title="Properties · Input slot" description="Input slot에 실제로 들어가는 Control입니다. Control 하나일 때는 Label이 그것을 직접 가리키고, Radio Group·Checkbox Group·Chip Group처럼 여러 값을 고르는 묶음일 때는 Label이 그룹의 이름이 됩니다.">
          <div className="col-span-full grid min-w-0 gap-3">
            {slots.map((item) => (
              <SlotRow key={item} label={slotLabels[item]} slot={item} />
            ))}
          </div>
        </Section>

        <Section id="guidelines" title="Guidelines" description="무엇을 Field가 소유하고 무엇을 Control에 남기는지 정리합니다.">
          <div className="col-span-full grid max-w-3xl gap-8">
            {guidelines.map(({ title, items }) => (
              <div key={title}>
                <GuidelineTitle>{title}</GuidelineTitle>
                <GuidelineList items={[...items]} />
              </div>
            ))}
          </div>
        </Section>

        <Section id="property-map" title="Property map" description="실제 Props와 기본값입니다. characterCount는 Field가 값을 소유하지 않으므로 현재 글자 수를 소비자가 넘깁니다.">
          <div className="col-span-full overflow-x-auto">
            <table className="w-full min-w-[38rem] text-left text-xs">
              <thead className="border-b border-oe-border-secondary text-oe-foreground-tertiary"><tr><th className="py-2 font-medium">Property</th><th className="py-2 font-medium">Values</th><th className="py-2 font-medium">Default</th></tr></thead>
              <tbody className="divide-y divide-oe-border-secondary text-oe-foreground-secondary">
                <MapRow property="label" values="ReactNode" defaultValue="필수" />
                <MapRow property="required" values="false | true" defaultValue="false" />
                <MapRow property="group" values="false | true" defaultValue="false" />
                <MapRow property="disabled" values="false | true" defaultValue="false" />
                <MapRow property="readOnly" values="false | true" defaultValue="false" />
                <MapRow property="rightDescription" values="ReactNode" defaultValue="undefined" />
                <MapRow property="trailingElement" values="ReactNode" defaultValue="undefined" />
                <MapRow property="helperText" values="ReactNode" defaultValue="undefined" />
                <MapRow property="errorMessage" values="ReactNode" defaultValue="undefined" />
                <MapRow property="characterCount" values="{ current: number; max: number }" defaultValue="undefined" />
                <MapRow property="children" values="ReactNode" defaultValue="필수" />
                <MapRow property="className" values="string" defaultValue="undefined" />
              </tbody>
            </table>
          </div>
        </Section>
      </div>
      <OnThisPage items={sections} componentKey="field" />
    </div>
  );
}

// 컴포넌트가 아니라 렌더 중에 호출하는 함수다. 컴포넌트로 두면 Field 의 직접 자식이 그
// 컴포넌트가 되어 접근성 주입이 실제 Control 에 닿지 않는다.
// Playground 와 Properties 절이 같은 Control 을 쓰도록 한 곳에서 만든다. 두 자리가 각자 예시를
// 들고 있으면 Slot 을 더할 때 한쪽만 고치게 된다. 내용은 자리에 따라 갈린다. Playground 는 국문과
// 영문을 함께 검수하므로 실제 문구를 쓰고, Properties 절은 구조를 보는 자리라 요소 이름을 쓴다.
function renderSlot({ slot, disabled }: { slot: (typeof slots)[number]; disabled: boolean }) {
  if (slot === "textarea") return <Textarea placeholder="Placeholder" disabled={disabled} />;
  if (slot === "number-input") return <NumberInput controlSize="large" defaultValue={1} min={0} max={99} disabled={disabled} />;
  if (slot === "select") return <Select controlSize="large" options={genericOptions} placeholder="Placeholder" disabled={disabled} />;
  if (slot === "radio-group") {
    return (
      <RadioGroup className="flex flex-col" defaultValue={genericOptions[0].value} disabled={disabled}>
        {genericOptions.map((option) => <RadioField key={option.value} className="-ml-2" value={option.value} label={option.label} disabled={disabled} />)}
      </RadioGroup>
    );
  }
  if (slot === "checkbox-group") {
    return (
      <>
        {genericOptions.map((option, index) => <CheckboxField key={option.value} className="-ml-2" label={option.label} defaultChecked={index === 0} disabled={disabled} />)}
      </>
    );
  }
  if (slot === "chip-group") {
    // Chip 을 Selection 으로 쓰는 예제다. 공용 Chip Group 컴포넌트를 만들지 않고, Field 의 세로
    // 방향 Input slot 안에서 가로 묶음과 그룹 role 을 이 예제가 직접 갖는다. chip.md 의 Selection
    // 은 shape 을 rounded 로 두고 Active 로 선택을 표시하며 Remove button 을 두지 않는다.
    return (
      <div role="group" className="flex flex-wrap items-center gap-2">
        {genericOptions.map((option, index) => <Chip key={option.value} shape="rounded" active={index === 0} onClick={() => {}}>{option.label}</Chip>)}
      </div>
    );
  }
  if (slot === "date") return <InputButton controlSize="large" placeholder="Date" leadingElement={<RiCalendarLine />} disabled={disabled} />;
  if (slot === "time") return <InputButton controlSize="large" placeholder="Time" leadingElement={<RiTimeLine />} disabled={disabled} />;
  return <Input controlSize="large" placeholder="Placeholder" disabled={disabled} />;
}

// Properties 절은 Slot 하나가 한 줄을 차지하고 컴포넌트를 가운데 정렬한다. Field 는 부모 너비를
// 채우므로 가운데로 모으려면 최대 너비를 함께 정해야 한다.
function SlotRow({ label, slot }: { label: string; slot: (typeof slots)[number] }) {
  const group = groupSlots.has(slot);

  return (
    <div className="min-w-0 rounded-xl border border-oe-border-secondary bg-oe-background-secondary p-4">
      <span className={`mb-3 block ${SMALL_LABEL}`}>{label}</span>
      <div className="flex justify-center rounded-lg border border-oe-border-secondary bg-oe-background-primary p-4">
        <div className="w-full max-w-sm">
          <Field label="Label" required group={group} helperText="Helper text">
            {renderSlot({ slot, disabled: false })}
          </Field>
        </div>
      </div>
    </div>
  );
}

// Seed 의 Suffix Slot 에 대응하는 자리다. Field 는 이 자리를 ReactNode 로만 받고 어떤 컴포넌트가
// 오는지 정하지 않으므로, 검수 화면에서 쓸 예시를 Studio 가 직접 만든다.
function ResetAction() {
  return (
    <button type="button" className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium text-oe-foreground-tertiary hover:bg-oe-interaction-hover hover:text-oe-foreground-secondary">
      <RiRefreshLine className="size-oe-icon-xsmall" aria-hidden="true" />
      초기화
    </button>
  );
}

// Header 와 Footer 를 비교하는 절에서는 그 층만 남긴다. Field 는 Header·Control·Footer 를 직접
// 자식으로 두므로, 남길 층을 뺀 나머지 직접 자식을 감추면 실제 컴포넌트를 그대로 쓰면서 볼 곳만
// 남길 수 있다. Control 은 Field 가 감싸지 않아 별도 data-slot 이 없으므로 :not 으로 지목한다.
const onlyClassName = {
  header: "[&_[data-slot=field]>*:not([data-slot=field-header])]:hidden",
  footer: "[&_[data-slot=field]>*:not([data-slot=field-footer])]:hidden",
} as const;

function Card({ label, only, children }: { label: string; only?: keyof typeof onlyClassName; children: ReactNode }) {
  return (
    <div className="min-w-0 rounded-xl border border-oe-border-secondary bg-oe-background-secondary p-4">
      <span className={`mb-3 block ${SMALL_LABEL}`}>{label}</span>
      <div className={`rounded-lg border border-oe-border-secondary bg-oe-background-primary p-4 ${only ? onlyClassName[only] : ""}`}>{children}</div>
    </div>
  );
}

function MapRow({ property, values, defaultValue }: { property: string; values: string; defaultValue: string }) { return <tr><td className="py-3 pr-4 font-mono text-[11px] text-oe-foreground-primary">{property}</td><td className="py-3 pr-4 font-mono text-[11px]">{values}</td><td className="py-3 font-mono text-[11px]">{defaultValue}</td></tr>; }
function Section({ id, title, description, children }: { id: string; title: string; description: string; children: ReactNode }) { return <section id={id} className="scroll-mt-20 rounded-2xl border border-oe-border-secondary bg-oe-background-primary p-5"><h3 className="text-xl font-semibold text-oe-foreground-primary">{title}</h3><p className="mt-1 text-xs leading-5 text-oe-foreground-tertiary">{description}</p><div className="mt-5 grid gap-3 @min-[720px]:grid-cols-2">{children}</div></section>; }
function ControlSection({ title, children }: { title: string; children: ReactNode }) { return <section><h4 className="mb-3 text-sm font-semibold text-oe-foreground-primary">{title}</h4><div className="space-y-3">{children}</div></section>; }
function ControlGroup({ label, children }: { label: string; children: ReactNode }) { return <fieldset><legend className={`mb-2 ${SMALL_LABEL}`}>{label}</legend><div className="flex flex-wrap gap-1.5">{children}</div></fieldset>; }
function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) { return <div className="flex items-center justify-between gap-3"><span className={SMALL_LABEL}>{label}</span><button type="button" role="switch" aria-checked={value} aria-label={label} onClick={() => onChange(!value)} className={`relative h-5 w-9 shrink-0 rounded-full ${value ? "bg-oe-background-bold-primary" : "bg-oe-background-secondary ring-1 ring-inset ring-oe-border-primary"}`}><span className={`absolute top-0.5 size-4 rounded-full bg-oe-background-primary shadow-sm transition-[left] ${value ? "left-[18px]" : "left-0.5"}`} /></button></div>; }
