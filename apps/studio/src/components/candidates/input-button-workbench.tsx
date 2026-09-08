"use client";

import { useState, type ReactNode } from "react";
import { RiArrowRightSLine, RiCalendarLine, RiEyeLine, RiEyeOffLine, RiMapPinLine, RiTimeLine } from "@remixicon/react";
import { Input, InputButton, Select } from "@ooee/ui";

import { AnatomySwapSlot } from "@/components/anatomy-swap-slot";
import { GuidelineList, GuideVisual, UsageComparison } from "@/components/component-guidelines";
import { GuidelineTitle } from "@/components/guideline-title";
import { AnatomyBoundaryMarker, AnatomyFrame, AnatomyLegend, AnatomyNumber, AnatomySurface } from "@/components/component-anatomy";
import { ColorSwatch } from "@/components/color-swatch";
import { OnThisPage } from "@/components/component-detail-navigation";
import { PlaygroundChoice as Choice, PlaygroundElementControl, PlaygroundElementGraphic, type PlaygroundElementValue } from "@/components/playground-element-control";
import { PreviewLocaleScope } from "@/components/preview-locale-scope";
import { useStudioPreferences } from "@/components/studio-preferences-provider";

type PreviewState = "default" | "focus" | "invalid" | "disabled" | "readOnly";

const copy = {
  ko: {
    description: "직접 입력하는 대신 달력, 주소 검색, 시간 선택과 같은 후속 화면을 여는 버튼입니다. Input과 같은 외관을 사용하지만 실제 역할과 HTML 요소는 Button입니다.",
    value: "2026. 08. 26", placeholder: "날짜 선택",
    calendar: "날짜", calendarDescription: "달력에서 날짜를 선택하는 화면을 엽니다.",
    address: "주소", addressPlaceholder: "주소 선택", addressDescription: "주소 검색 또는 선택 화면을 엽니다.",
    time: "시간", timeValue: "오후 2:30", timeDescription: "시간 선택 화면을 엽니다.",
    color: "Color picker · Select only", colorValue: "파란색", colorDescription: "직접 입력하지 않고 Color Picker에서 색상을 선택합니다.",
    selectLabel: "옵션", selectOptions: ["Option A", "Option B", "Option C"],
    colorHexLabel: "색상 코드", colorPickLabel: "색상", datePattern: "YYYY. MM. DD", today: "오늘", addressSentence: "주소를 선택해 주세요", startDate: "시작일", endDate: "종료일",
    passwordLabel: "비밀번호", passwordValue: "bluekey1234", showPassword: "비밀번호 보기", hidePassword: "비밀번호 숨기기",
  },
  en: {
    description: "A button that opens a follow-up surface such as a calendar, address search, or time picker instead of accepting direct text entry. It shares Input styling but uses button semantics.",
    value: "Aug 26, 2026", placeholder: "Select date",
    calendar: "Date", calendarDescription: "Opens a calendar for date selection.",
    address: "Address", addressPlaceholder: "Select address", addressDescription: "Opens an address search or selection surface.",
    time: "Time", timeValue: "2:30 PM", timeDescription: "Opens a time selection surface.",
    color: "Color picker · Select only", colorValue: "Blue", colorDescription: "Selects a color from the Color Picker without direct text entry.",
    selectLabel: "Option", selectOptions: ["Option A", "Option B", "Option C"],
    colorHexLabel: "Color code", colorPickLabel: "Color", datePattern: "YYYY. MM. DD", today: "Today", addressSentence: "Please select an address", startDate: "Start date", endDate: "End date",
    passwordLabel: "Password", passwordValue: "bluekey1234", showPassword: "Show password", hidePassword: "Hide password",
  },
} as const;

const sections = [
  { id: "playground", label: "Playground" }, { id: "anatomy", label: "Anatomy" },
  { id: "style", label: "Style" }, { id: "size", label: "Size" }, { id: "layout", label: "Layout" },
  { id: "elements", label: "Elements" }, { id: "state", label: "State" },
  { id: "examples", label: "Examples" }, { id: "guidelines", label: "Guidelines" },
  { id: "property-map", label: "Property map" },
];

export function InputButtonWorkbench() {
  const { locale } = useStudioPreferences();
  const c = copy[locale];
  const [variant, setVariant] = useState<"outline" | "filled">("outline");
  const [controlSize, setControlSize] = useState<"small" | "regular" | "large" | "xlarge">("regular");
  const [layout, setLayout] = useState<"fill" | "fixed">("fill");
  const [fixedWidth, setFixedWidth] = useState(280);
  const [showValue, setShowValue] = useState(true);
  const [leadingElement, setLeadingElement] = useState<PlaygroundElementValue>({ kind: "icon", icon: "calendar", image: "avatar" });
  const [trailingElement, setTrailingElement] = useState<PlaygroundElementValue>({ kind: "none", icon: "search", image: "avatar" });
  const [previewState, setPreviewState] = useState<PreviewState>("default");

  return (
    <div className="grid items-start gap-6 @min-[1120px]:grid-cols-[minmax(0,1fr)_11rem]">
      <div className="min-w-0 space-y-5">

        <Section id="playground" title="🚩 Playground" description="확정된 Style, Size, Layout, Content, Element와 State를 조합하여 확인합니다.">
          <div className="col-span-full grid gap-5 rounded-xl border-2 border-oe-border-bold-primary bg-oe-background-secondary p-4 @min-[1000px]:grid-cols-[minmax(18rem,1fr)_minmax(32rem,1.35fr)]">
            <div className="flex min-h-52 items-start rounded-xl bg-oe-background-primary p-5">
              <InputButton
                variant={variant} controlSize={controlSize}
                {...(layout === "fixed" ? { layout: "fixed" as const, fixedWidth } : { layout: "fill" as const })}
                value={showValue ? c.value : undefined} placeholder={c.placeholder}
                leadingElement={leadingElement.kind === "none" ? undefined : <PlaygroundElementGraphic value={leadingElement} />}
                trailingElement={trailingElement.kind === "none" ? undefined : <PlaygroundElementGraphic value={trailingElement} />}
                disabled={previewState === "disabled"} readOnly={previewState === "readOnly"} aria-invalid={previewState === "invalid" ? "true" : undefined}
                className={previewState === "focus" ? "border-oe-focus-ring bg-oe-background-primary ring-1 ring-oe-focus-ring" : undefined}
                aria-haspopup="dialog"
              />
            </div>
            <div className="grid gap-5 @min-[720px]:grid-cols-2">
              <div className="space-y-4">
                <ControlSection title="Appearance"><ControlGroup label="Style">{(["outline", "filled"] as const).map((item) => <Choice key={item} active={variant === item} onClick={() => setVariant(item)}>{capitalize(item)}</Choice>)}</ControlGroup></ControlSection>
                <ControlSection title="Size"><ControlGroup label="Control size">{(["small", "regular", "large", "xlarge"] as const).map((item) => <Choice key={item} active={controlSize === item} onClick={() => setControlSize(item)}>{capitalize(item)}</Choice>)}</ControlGroup></ControlSection>
                <ControlSection title="Layout"><ControlGroup label="Width behavior">{(["fill", "fixed"] as const).map((item) => <Choice key={item} active={layout === item} onClick={() => setLayout(item)}>{capitalize(item)}</Choice>)}</ControlGroup>{layout === "fixed" ? <NumberControl label="Width · px" value={fixedWidth} min={160} max={640} onChange={setFixedWidth} /> : null}</ControlSection>
                <ControlSection title="State"><ControlGroup label="Preview state">{(["default", "focus", "invalid", "disabled", "readOnly"] as const).map((item) => <Choice key={item} active={previewState === item} onClick={() => setPreviewState(item)}>{capitalize(item)}</Choice>)}</ControlGroup></ControlSection>
              </div>
              <div className="space-y-4">
                <ControlSection title="Content"><Toggle label="Show value" value={showValue} onChange={setShowValue} /><p className="text-[11px] leading-4 text-oe-foreground-placeholder">Off에서는 Placeholder를 표시합니다.</p></ControlSection>
                <ControlSection title="Elements"><PlaygroundElementControl label="Leading element" value={leadingElement} onChange={setLeadingElement} /><PlaygroundElementControl label="Trailing element" value={trailingElement} onChange={setTrailingElement} /></ControlSection>
                <ControlSection title="Behavior"><p className="text-[11px] leading-5 text-oe-foreground-tertiary">Click은 소비자가 연결한 선택 화면을 엽니다. Input Button은 후속 화면의 종류와 선택 로직을 소유하지 않습니다.</p></ControlSection>
              </div>
            </div>
          </div>
        </Section>

        <Section id="anatomy" title="Anatomy" description="Input Button을 구성하는 실제 요소와 문서에서 사용하는 명칭입니다."><InputButtonAnatomy /></Section>

        <Section id="style" title="Properties · Style" description="Input과 같은 Outline과 회색조 Filled를 사용하며 모든 Form control의 공통 기본값인 Outline을 따릅니다.">
          <Example label="Outline · Default"><InputButton value={c.value} leadingElement={<RiCalendarLine />} /></Example>
          <Example label="Filled"><InputButton variant="filled" value={c.value} leadingElement={<RiCalendarLine />} /></Example>
        </Section>

        <Section id="size" title="Properties · Size" description="Input과 Button이 공유하는 공통 Control Height를 사용합니다.">
          <Example label="Small · 32px"><InputButton controlSize="small" value={c.value} /></Example>
          <Example label="Regular · 36px · Default"><InputButton value={c.value} /></Example>
          <Example label="Large · 40px"><InputButton controlSize="large" value={c.value} /></Example>
          <Example label="XLarge · 48px"><InputButton controlSize="xlarge" value={c.value} /></Example>
        </Section>

        <Section id="layout" title="Properties · Layout" description="부모 너비를 채우는 Fill과 명시한 너비를 유지하는 Fixed를 지원합니다.">
          <Example label="Fill · Default"><InputButton value={c.value} /></Example>
          <Example label="Fixed"><InputButton layout="fixed" fixedWidth={240} value={c.value} /></Example>
        </Section>

        <Section id="elements" title="Properties · Elements" description="텍스트 값 앞뒤에 선택적인 Element를 배치할 수 있습니다. Prefix와 Suffix, Clear button과 Chip value는 제공하지 않습니다.">
          <Example label="Leading element"><InputButton value={c.value} leadingElement={<RiCalendarLine />} /></Example>
          <Example label="Trailing element"><InputButton value={c.value} trailingElement={<RiArrowRightSLine />} /></Example>
        </Section>

        <Section id="state" title="Properties · State" description="버튼에서 실제로 확인되는 Default, Focus, Invalid, Disabled와 Read only 상태입니다. 조회 화면에서는 Read only를 사용해 값을 보여주되 Trigger 호출을 막습니다. 실제로 무엇을 열지는 이 컴포넌트를 가져다 쓰는 화면이 정합니다.">
          <Example label="Default"><InputButton value={c.value} /></Example>
          <Example label="Focus"><InputButton value={c.value} className="border-oe-focus-ring bg-oe-background-primary ring-1 ring-oe-focus-ring" /></Example>
          <Example label="Invalid"><InputButton value={c.value} aria-invalid="true" /></Example>
          <Example label="Disabled"><InputButton value={c.value} disabled /></Example>
          <Example label="Read only" description="focus는 유지하고 Trigger 호출만 막습니다."><InputButton value={c.value} readOnly /></Example>
        </Section>

        <Section id="examples" title="Examples" description="직접 입력 대신 별도의 선택 화면이 필요한 현재 검수 사례입니다.">
          <Example label={c.calendar} description={c.calendarDescription}><InputButton value={c.value} leadingElement={<RiCalendarLine />} aria-haspopup="dialog" /></Example>
          <Example label={c.address} description={c.addressDescription}><InputButton placeholder={c.addressPlaceholder} leadingElement={<RiMapPinLine />} aria-haspopup="dialog" /></Example>
          <Example label={c.time} description={c.timeDescription}><InputButton value={c.timeValue} leadingElement={<RiTimeLine />} aria-haspopup="dialog" /></Example>
          <Example label={c.color} description={c.colorDescription}><InputButton value={c.colorValue} leadingElement={<ColorSwatch color="#0073FF" />} aria-haspopup="dialog" /></Example>
        </Section>

        <Section id="guidelines" title="Guidelines" description="Input Button을 고르고 조회와 편집을 나눌 때 적용하는 기준입니다.">
          <div className="col-span-full grid gap-8">
            <UsageComparison
              title="Placeholder는 문장이 아니라 형식이나 키워드로 쓰기"
              doText="고를 값을 키워드로 쓰세요."
              dontText="문장으로 쓰지 마세요."
              description={[
                "값이 없으면 Placeholder가 유일한 안내입니다. 눌러야 값을 정할 수 있으므로 무엇을 고르는 자리인지 먼저 읽혀야 합니다.",
                <>정해진 형식이 있으면 <code className="text-xs text-oe-foreground-primary">YYYY. MM. DD</code>처럼 형식을 그대로 보여줍니다.</>,
                "한 줄 Control 안에서 문장은 잘리기 쉽고, 값이 채워지면 사라지는 문구에 존댓말 어미를 붙일 만큼의 자리가 없습니다.",
              ]}
              doVisual={<PreviewLocaleScope className="w-full"><InputButton placeholder={c.addressPlaceholder} leadingElement={<RiMapPinLine aria-hidden="true" />} aria-haspopup="dialog" aria-label={c.address} /></PreviewLocaleScope>}
              dontVisual={<PreviewLocaleScope className="w-full"><InputButton placeholder={c.addressSentence} leadingElement={<RiMapPinLine aria-hidden="true" />} aria-haspopup="dialog" aria-label={c.address} /></PreviewLocaleScope>}
            />
            <div>
              <GuidelineTitle>형식과 기간은 Placeholder로 알리기</GuidelineTitle>
              <div className="mt-3 grid gap-3 @min-[720px]:grid-cols-2">
                <GuideVisual label="형식">
                  <PreviewLocaleScope className="w-full"><InputButton placeholder={c.datePattern} leadingElement={<RiCalendarLine aria-hidden="true" />} aria-haspopup="dialog" aria-label={c.calendar} /></PreviewLocaleScope>
                </GuideVisual>
                <GuideVisual label="기간">
                  <PreviewLocaleScope className="flex w-full items-center gap-2">
                    <InputButton placeholder={c.startDate} aria-haspopup="dialog" aria-label={c.startDate} />
                    <span aria-hidden="true" className="shrink-0 text-sm text-oe-foreground-tertiary">~</span>
                    <InputButton placeholder={c.endDate} aria-haspopup="dialog" aria-label={c.endDate} />
                  </PreviewLocaleScope>
                </GuideVisual>
              </div>
              <GuidelineList items={[
                <>정해진 형식이 있으면 <code className="text-xs text-oe-foreground-primary">YYYY. MM. DD</code>처럼 형식을 그대로 보여줍니다. 무엇을 고르는지와 어떤 모양으로 채워지는지를 함께 알립니다.</>,
                "기간처럼 값이 둘이면 Trigger를 두 개로 나누고 사이에 물결표를 둡니다. 각 Placeholder는 「시작일」과 「종료일」처럼 그 자리가 무엇인지 말합니다.",
                "하나의 Trigger에 기간 전체를 담으면 어느 쪽을 고치는 중인지 알 수 없고, 값이 채워졌을 때 두 날짜가 한 줄에서 잘립니다.",
              ]} />
            </div>
            <UsageComparison
              title="값을 나눠 받을 때는 시각 요소를 줄이기"
              doText="나눈 Trigger에는 Placeholder만 두세요."
              dontText="같은 아이콘을 Trigger마다 반복하지 마세요."
              description={[
                "값을 여러 Trigger로 나누면 각 Trigger가 Leading element를 따로 갖게 됩니다. 같은 아이콘이 두 번 이상 나오면 정보를 더하지 않고 값이 쓸 폭만 줄입니다.",
                "나눈 Trigger에는 Leading element를 두지 않고 Placeholder로 각 자리를 알립니다. 아이콘이 필요하면 묶음 전체를 설명하는 Field 쪽에 한 번만 둡니다.",
                "Trigger가 좁아질수록 값이 잘리기 쉽습니다. 남는 폭은 값에 씁니다.",
              ]}
              doVisual={<PreviewLocaleScope className="flex w-full items-center gap-2"><InputButton placeholder={c.startDate} aria-haspopup="dialog" aria-label={c.startDate} /><span aria-hidden="true" className="shrink-0 text-sm text-oe-foreground-tertiary">~</span><InputButton placeholder={c.endDate} aria-haspopup="dialog" aria-label={c.endDate} /></PreviewLocaleScope>}
              dontVisual={<PreviewLocaleScope className="flex w-full items-center gap-2"><InputButton placeholder={c.startDate} leadingElement={<RiCalendarLine aria-hidden="true" />} aria-haspopup="dialog" aria-label={c.startDate} /><span aria-hidden="true" className="shrink-0 text-sm text-oe-foreground-tertiary">~</span><InputButton placeholder={c.endDate} leadingElement={<RiCalendarLine aria-hidden="true" />} aria-haspopup="dialog" aria-label={c.endDate} /></PreviewLocaleScope>}
            />
            <UsageComparison
              title="조회는 Read only, 쓸 수 없을 때만 Disabled"
              doText="조회 화면에서는 Read only로 값을 보여주세요."
              dontText="조회 화면에 Disabled를 쓰지 마세요."
              description={[
                <>다른 폼 요소와 함께 조회와 편집 두 상태로 쓰이므로, 조회에는 <code className="text-xs text-oe-foreground-primary">readOnly</code>를 사용합니다. focus가 유지되어 키보드로 값을 지나갈 수 있고 값은 그대로 읽힙니다.</>,
                <><code className="text-xs text-oe-foreground-primary">disabled</code>는 값 자체를 쓸 수 없는 상태에만 사용합니다. 조작 대상에서 빠져 키보드로 지나갈 수 없으므로, 읽기만 하는 화면에 쓰면 값이 있는 자리를 건너뛰게 됩니다.</>,
                "Read only가 막는 것은 여는 동작 자체가 아니라 그 호출입니다. 실제로 무엇을 열지는 이 컴포넌트를 가져다 쓰는 화면이 소유합니다.",
              ]}
              doVisual={<PreviewLocaleScope className="w-full"><InputButton value="2026. 09. 07" readOnly leadingElement={<RiCalendarLine aria-hidden="true" />} aria-label={c.calendar} /></PreviewLocaleScope>}
              dontVisual={<PreviewLocaleScope className="w-full"><InputButton value="2026. 09. 07" disabled leadingElement={<RiCalendarLine aria-hidden="true" />} aria-label={c.calendar} /></PreviewLocaleScope>}
            />
            <UsageComparison
              title="내부에 다른 조작 요소를 두지 않기"
              doText="Container 전체를 하나의 Button으로 두세요."
              dontText="안에 별도 Button을 중첩하지 마세요."
              description={[
                "Container 전체가 하나의 Button입니다. 안에 별도 Input이나 Clear button, 다른 Button을 중첩하면 어느 것을 눌렀는지 알 수 없고 키보드 순서도 갈라집니다.",
                "그래서 Clear button을 제공하지 않습니다. 값을 비우거나 오늘로 맞추는 것처럼 값을 바꾸는 동작은 여는 화면에서 처리하거나 Field 쪽에 둡니다.",
                "Value는 문자열만 표시합니다. 여러 값을 Chip으로 나열해야 하면 Combobox를 사용합니다.",
              ]}
              doVisual={<PreviewLocaleScope className="w-full"><InputButton value="2026. 09. 07" leadingElement={<RiCalendarLine aria-hidden="true" />} trailingElement={<RiArrowRightSLine aria-hidden="true" />} aria-haspopup="dialog" aria-label={c.calendar} /></PreviewLocaleScope>}
              dontVisual={<PreviewLocaleScope className="w-full"><InputButton value="2026. 09. 07" leadingElement={<RiCalendarLine aria-hidden="true" />} trailingElement={<span className="flex h-6 items-center rounded-md border border-oe-border-primary px-2 text-xs font-medium text-oe-foreground-secondary">{c.today}</span>} aria-haspopup="dialog" aria-label={c.calendar} /></PreviewLocaleScope>}
            />
            <div>
              <GuidelineTitle>Trailing element는 시각 정보만 전달하기</GuidelineTitle>
              <div className="mt-3 grid gap-3 @min-[720px]:grid-cols-2">
                <GuideVisual label="Input Button · 여는 표시">
                  <PreviewLocaleScope className="w-full"><InputButton value="2026. 09. 07" leadingElement={<RiCalendarLine aria-hidden="true" />} trailingElement={<RiArrowRightSLine aria-hidden="true" />} aria-haspopup="dialog" aria-label={c.calendar} /></PreviewLocaleScope>
                </GuideVisual>
                <GuideVisual label="Input · 누를 수 있는 action">
                  <PasswordSample c={c} />
                </GuideVisual>
              </div>
              <GuidelineList items={[
                "Trailing element는 눌러서 무엇을 하는 자리가 아니라 상태나 다음 동작을 알리는 자리입니다. Container 전체가 하나의 Button이라 이 자리에 조작을 걸 수 없고 시각 정보만 전달할 수 있습니다.",
                "오른쪽 화살표처럼 눌렀을 때 화면이 열린다는 것을 알리는 표시를 둡니다.",
                "보기 전환처럼 누르는 action이 필요하면 값을 직접 입력받는 Input을 사용합니다. Input의 Trailing element는 조작을 담을 수 있습니다.",
                "Leading element는 Input과 같은 성격입니다. 값을 식별하는 요소를 둡니다. Prefix와 Suffix는 제공하지 않으므로 값의 의미를 보완하는 짧은 표기가 필요하면 Input을 사용합니다.",
              ]} />
            </div>
            <div>
              <GuidelineTitle>Input Button과 Select를 나눠 쓰기</GuidelineTitle>
              <div className="mt-3 grid gap-3 @min-[720px]:grid-cols-2">
                <GuideVisual label="Input Button · 별도 화면에서 값을 정함">
                  <PreviewLocaleScope className="w-full"><InputButton value="2026. 09. 07" leadingElement={<RiCalendarLine aria-hidden="true" />} trailingElement={<RiArrowRightSLine aria-hidden="true" />} aria-label={locale === "ko" ? "날짜 선택" : "Select a date"} /></PreviewLocaleScope>
                </GuideVisual>
                <GuideVisual label="Select · 짧은 목록에서 바로 고름">
                  <PreviewLocaleScope className="w-full"><Select options={c.selectOptions.map((label, index) => ({ value: `option-${index}`, label }))} defaultValue="option-0" ariaLabel={c.selectLabel} /></PreviewLocaleScope>
                </GuideVisual>
              </div>
              <GuidelineList items={[
                "달력, 주소 검색, 시간 선택처럼 값을 정하는 수단이 별도 화면이면 Input Button을 사용합니다. 어떤 화면을 열지는 이 컴포넌트가 소유하지 않습니다.",
                "미리 정의된 짧은 목록에서 바로 고르면 Select를 사용합니다. Popup 안에서 검색해 고르거나 선택값을 계속 보면서 다뤄야 하면 Combobox를 사용합니다.",
                "Select와 혼동되지 않도록 아래 방향 화살표 아이콘은 지양합니다. 그 아이콘은 같은 자리에서 목록이 펼쳐진다는 뜻으로 읽히는데, Input Button은 별도 화면을 엽니다.",
              ]} />
            </div>
            <div>
              <GuidelineTitle>Color input은 직접 입력 여부로 나누기</GuidelineTitle>
              <div className="mt-3 grid gap-3 @min-[720px]:grid-cols-2">
                <GuideVisual label="Input · HEX 직접 입력">
                  <PreviewLocaleScope className="w-full"><Input value="#0073FF" readOnly leadingElement={<ColorSwatch color="#0073FF" />} aria-label={c.colorHexLabel} /></PreviewLocaleScope>
                </GuideVisual>
                <GuideVisual label="Input Button · 선택 화면만 열기">
                  <PreviewLocaleScope className="w-full"><InputButton value={c.colorValue} leadingElement={<ColorSwatch color="#0073FF" />} aria-haspopup="dialog" aria-label={c.colorPickLabel} /></PreviewLocaleScope>
                </GuideVisual>
              </div>
              <GuidelineList items={[
              "색상 코드를 직접 입력받아야 하면 Input을 사용합니다. HEX 값을 타이핑할 수 있고 Leading element의 Color swatch가 현재 색을 함께 보여줍니다.",
              "값을 타이핑하지 않고 색상 선택 화면에서만 정한다면 Input Button을 사용합니다.",
              <>두 컴포넌트는 같은 16px 사각형 swatch와 안쪽 1px <code className="text-xs text-oe-foreground-primary">oe-border-visual</code> 경계를 공유합니다. 갈리는 것은 겉모습이 아니라 값을 직접 입력받는지 여부입니다.</>,
            ]} />
            </div>
          </div>
        </Section>

        <Section id="property-map" title="Property map" description="현재 구현에서 확인되는 Property와 허용 값을 정리합니다.">
          <div className="col-span-full overflow-x-auto"><table className="w-full min-w-[44rem] text-left text-xs"><thead className="border-b border-oe-border-secondary text-oe-foreground-tertiary"><tr><th className="py-2 font-medium">Property</th><th className="py-2 font-medium">Values</th><th className="py-2 font-medium">Default</th><th className="py-2 font-medium">Status</th></tr></thead><tbody className="divide-y divide-oe-border-secondary text-oe-foreground-secondary">
            <MapRow property="variant" values="outline | filled" defaultValue="outline" /><MapRow property="controlSize" values="small | regular | large | xlarge" defaultValue="regular" /><MapRow property="layout" values="fill | fixed" defaultValue="fill" />
            <MapRow property="readOnly" values="false | true" defaultValue="false" /><MapRow property="value / placeholder" values="string" defaultValue="undefined / Select an option" /><MapRow property="leadingElement / trailingElement" values="ReactNode" defaultValue="undefined" />
            <MapRow property="state" values="default | focus | invalid | disabled" defaultValue="default" note="Button attributes and focus" />
          </tbody></table></div>
        </Section>
      </div>
      <OnThisPage items={sections} componentKey="input-button" />
    </div>
  );
}

function InputButtonAnatomy() {
  return (
    <div className="col-span-full min-w-0">
      <AnatomySurface ariaLabel="Input Button anatomy" title="Input Button structure" className="px-5 pb-5 pt-12">
        <div className="overflow-x-auto">
          <div className="mx-auto flex w-[30rem] items-center justify-center py-24">
            <AnatomyFrame className="pointer-events-none w-72" gap={40}>
              <InputButton value="2026. 09. 14" leadingElement={<AnatomySwapSlot />} trailingElement={<AnatomySwapSlot />} tabIndex={-1} />
              <AnatomyBoundaryMarker number={1} target="[data-slot=input-button]" side="left" connectorLength={48} />
              <AnatomyNumber number={2} target="[data-slot=input-button-leading]" side="top" />
              <AnatomyNumber number={3} target="[data-slot=input-button-value]" side="bottom" />
              <AnatomyNumber number={4} target="[data-slot=input-button-trailing]" side="top" />
            </AnatomyFrame>
          </div>
        </div>
      </AnatomySurface>
      <AnatomyLegend items={[{ name: "Container" }, { name: "Leading element", optional: true }, { name: "Value / Placeholder" }, { name: "Trailing element", optional: true }]} />
    </div>
  );
}

function PasswordSample({ c }: { c: (typeof copy)[keyof typeof copy] }) {
  const [visible, setVisible] = useState(false);
  return (
    <PreviewLocaleScope className="w-full">
      <Input
        type={visible ? "text" : "password"}
        value={c.passwordValue}
        readOnly
        aria-label={c.passwordLabel}
        trailingElement={
          <button type="button" aria-label={visible ? c.hidePassword : c.showPassword} aria-pressed={visible} onClick={() => setVisible((current) => !current)} className="grid size-6 place-items-center rounded-md text-oe-foreground-tertiary transition-colors hover:bg-oe-interaction-hover hover:text-oe-foreground-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-focus-ring">
            {visible ? <RiEyeOffLine className="size-oe-icon-small" aria-hidden="true" /> : <RiEyeLine className="size-oe-icon-small" aria-hidden="true" />}
          </button>
        }
      />
    </PreviewLocaleScope>
  );
}

function Section({ id, title, description, children }: { id: string; title: string; description: string; children: ReactNode }) { return <section id={id} className="scroll-mt-20 rounded-2xl border border-oe-border-secondary bg-oe-background-primary p-5"><h3 className="text-xl font-semibold text-oe-foreground-primary">{title}</h3><p className="mt-1 text-xs leading-5 text-oe-foreground-tertiary">{description}</p><div className="mt-5 grid gap-3 @min-[720px]:grid-cols-2">{children}</div></section>; }
function Example({ label, description, children }: { label: string; description?: string; children: ReactNode; fixed?: boolean }) { return <div className="flex min-h-32 min-w-0 flex-col gap-3 rounded-xl border border-oe-border-secondary p-4"><div><p className="text-xs font-medium text-oe-foreground-primary">{label}</p>{description ? <p className="mt-1 text-[11px] leading-4 text-oe-foreground-tertiary">{description}</p> : null}</div><PreviewLocaleScope className="mt-auto">{children}</PreviewLocaleScope></div>; }
function ControlSection({ title, children }: { title: string; children: ReactNode }) { return <section><h4 className="mb-3 text-sm font-semibold text-oe-foreground-primary">{title}</h4><div className="space-y-3">{children}</div></section>; }
function ControlGroup({ label, children }: { label: string; children: ReactNode }) { return <fieldset><legend className="mb-2 text-[11px] font-medium text-oe-foreground-tertiary">{label}</legend><div className="flex flex-wrap gap-1.5">{children}</div></fieldset>; }
function NumberControl({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (value: number) => void }) { return <label className="block"><span className="mb-1.5 block text-[11px] font-medium text-oe-foreground-tertiary">{label}</span><input type="number" value={value} min={min} max={max} onChange={(event) => onChange(Number(event.target.value))} className="h-8 w-full rounded-lg border border-oe-border-primary bg-oe-background-primary px-2.5 text-xs tabular-nums text-oe-foreground-primary outline-none focus:border-oe-focus-ring focus:ring-1 focus:ring-oe-focus-ring" /></label>; }
function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) { return <div className="flex items-center justify-between gap-3"><span className="text-[11px] font-medium text-oe-foreground-tertiary">{label}</span><button type="button" role="switch" aria-checked={value} aria-label={label} onClick={() => onChange(!value)} className={`relative h-5 w-9 rounded-full ${value ? "bg-oe-background-bold-primary" : "bg-oe-background-secondary ring-1 ring-inset ring-oe-border-primary"}`}><span className={`absolute top-0.5 size-4 rounded-full bg-oe-background-primary shadow-sm transition-[left] ${value ? "left-[18px]" : "left-0.5"}`} /></button></div>; }
function MapRow({ property, values, defaultValue, note = "Confirmed" }: { property: string; values: string; defaultValue: string; note?: string }) { return <tr><td className="py-3 pr-4 font-medium text-oe-foreground-primary">{property}</td><td className="py-3 pr-4 font-mono text-[11px]">{values}</td><td className="py-3 pr-4 font-mono text-[11px]">{defaultValue}</td><td className="py-3">{note}</td></tr>; }
function capitalize(value: string) { return value.charAt(0).toUpperCase() + value.slice(1); }
