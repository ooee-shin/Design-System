"use client";

import { useState, type ReactNode } from "react";
import { RiCalendarLine, RiCloseLine, RiEyeLine, RiEyeOffLine, RiLink, RiSearchLine } from "@remixicon/react";

import { Input, NumberInput } from "@ooee/ui";
import { InputColorExample, InputCustomExamples } from "@/components/candidates/input-custom-examples";
import { AnatomyBoundaryMarker, AnatomyLegend, AnatomyNumber, AnatomySurface } from "@/components/component-anatomy";
import { AnatomySwapSlot } from "@/components/anatomy-swap-slot";
import { OnThisPage } from "@/components/component-detail-navigation";
import { GuidelineList, GuideVisual, UsageComparison } from "@/components/component-guidelines";
import { GuidelineTitle } from "@/components/guideline-title";
import { PlaygroundElementControl, PlaygroundElementGraphic, type PlaygroundElementValue } from "@/components/playground-element-control";
import { PreviewLocaleScope } from "@/components/preview-locale-scope";
import { useStudioPreferences } from "@/components/studio-preferences-provider";

type PlaygroundState = "default" | "focus" | "invalid" | "disabled" | "readOnly";

const copy = {
  ko: {
    description: "한 줄 텍스트를 입력하는 컴포넌트입니다. Label, 도움말과 오류 문구는 Input 내부가 아니라 별도 Field가 담당합니다.",
    placeholder: "Placeholder",
    search: "검색어를 입력하세요",
    website: "웹사이트 주소",
    amount: "금액",
    clear: "입력 내용 지우기",
    showPassword: "비밀번호 보기",
    hidePassword: "비밀번호 숨기기",
    customInputDescription: "특수한 포맷이나 마스킹 등의 기능이 필요한 경우, 포맷과 동작을 직접 정의해서 사용할 수 있습니다.",
    colorInputDescription: "색상값을 직접 입력하는 Input 조합입니다. 현재 Color Picker가 완성되지 않아 팝업 상호작용은 연결하지 않습니다.",
    clearSearchLabel: "검색", clearSearchValue: "강남구 카페",
    clearAddressLabel: "주소", clearAddressValue: "서울특별시 강남구 테헤란로 152",
    phoneLabel: "전화번호", phoneValue: "010-1234-5678",
    quantityLabel: "수량", decrease: "값 줄이기", increase: "값 늘리기", decreaseTooltip: "감소", increaseTooltip: "증가",
    businessLabel: "사업자등록번호", businessValue: "123-45-67890",
    expiryLabel: "카드 유효기간", expiryValue: "09 / 28",
  },
  en: {
    description: "A single-line text entry component. Labels, help text, and error messages belong to a separate Field.",
    placeholder: "Placeholder",
    search: "Search",
    website: "Website address",
    amount: "Amount",
    clear: "Clear input",
    showPassword: "Show password",
    hidePassword: "Hide password",
    customInputDescription: "When a special format or masking behavior is required, define the format and interaction directly.",
    colorInputDescription: "An Input composition for direct color-value entry. Popup interaction is not connected until the Color Picker is complete.",
    clearSearchLabel: "Search", clearSearchValue: "Cafes in Gangnam",
    clearAddressLabel: "Address", clearAddressValue: "152 Teheran-ro, Gangnam-gu, Seoul",
    phoneLabel: "Phone number", phoneValue: "010-1234-5678",
    quantityLabel: "Quantity", decrease: "Decrease value", increase: "Increase value", decreaseTooltip: "Decrease", increaseTooltip: "Increase",
    businessLabel: "Business number", businessValue: "123-45-67890",
    expiryLabel: "Card expiry", expiryValue: "09 / 28",
  },
} as const;

const inputSections = [
  { id: "playground", label: "Playground" },
  { id: "anatomy", label: "Anatomy" },
  { id: "style", label: "Style" },
  { id: "size", label: "Size" },
  { id: "layout", label: "Layout" },
  { id: "alignment", label: "Text alignment" },
  { id: "state", label: "State" },
  { id: "elements", label: "Elements" },
  { id: "custom-input", label: "Custom input" },
  { id: "color-input", label: "Color input" },
  { id: "guidelines", label: "Guidelines" },
  { id: "property-map", label: "Property map" },
];

export function InputWorkbench() {
  const { locale } = useStudioPreferences();
  const c = copy[locale];
  const [clearValue, setClearValue] = useState(locale === "ko" ? "지울 수 있는 입력값" : "Clearable value");
  const [playgroundVariant, setPlaygroundVariant] = useState<"outline" | "filled">("outline");
  const [playgroundSize, setPlaygroundSize] = useState<"small" | "regular" | "large" | "xlarge">("regular");
  const [playgroundLayout, setPlaygroundLayout] = useState<"fill" | "fixed">("fill");
  const [playgroundTextAlign, setPlaygroundTextAlign] = useState<"left" | "right">("left");
  const [playgroundWidth, setPlaygroundWidth] = useState(240);
  const [playgroundPlaceholder, setPlaygroundPlaceholder] = useState<string>(c.placeholder);
  const [playgroundState, setPlaygroundState] = useState<PlaygroundState>("default");
  const [playgroundElements, setPlaygroundElements] = useState({
    leading: { kind: "none", icon: "search", image: "avatar" } as PlaygroundElementValue,
    showPrefix: false,
    prefixText: "https://",
    showSuffix: false,
    suffixText: ".com",
    trailing: { kind: "none", icon: "search", image: "avatar" } as PlaygroundElementValue,
    showClear: true,
  });
  const [playgroundValue, setPlaygroundValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("ooee-password");
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <div className="grid items-start gap-6 @min-[1120px]:grid-cols-[minmax(0,1fr)_11rem]">
      <div className="min-w-0 space-y-5">

      <Section id="playground" title="🚩 Playground" description="확정된 Style, Size와 Optional element를 조합하여 실제 입력 상태에서 확인합니다.">
        <div className="col-span-full grid gap-5 rounded-xl border-2 border-oe-border-bold-primary bg-oe-background-secondary p-4 @min-[1000px]:grid-cols-[minmax(18rem,1fr)_minmax(36rem,1.4fr)]">
          <div className="flex min-h-52 h-full items-start rounded-xl bg-oe-background-primary p-5">
            <Input
              variant={playgroundVariant}
              controlSize={playgroundSize}
              {...(playgroundLayout === "fixed" ? { layout: "fixed" as const, fixedWidth: playgroundWidth } : { layout: "fill" as const })}
              textAlign={playgroundTextAlign}
              value={playgroundValue}
              onChange={(event) => setPlaygroundValue(event.target.value)}
              placeholder={playgroundPlaceholder}
              aria-invalid={playgroundState === "invalid" ? "true" : undefined}
              disabled={playgroundState === "disabled"}
              readOnly={playgroundState === "readOnly"}
              containerClassName={playgroundState === "focus" ? "border-oe-focus-ring bg-oe-background-primary ring-1 ring-oe-focus-ring" : undefined}
              leadingElement={playgroundElements.leading.kind === "none" ? undefined : <PlaygroundElementGraphic value={playgroundElements.leading} />}
              prefix={playgroundElements.showPrefix ? playgroundElements.prefixText : undefined}
              suffix={playgroundElements.showSuffix ? playgroundElements.suffixText : undefined}
              trailingElement={playgroundElements.trailing.kind === "none" ? undefined : <PlaygroundElementGraphic value={playgroundElements.trailing} />}
              clearable={playgroundElements.showClear ? playgroundValue.length > 0 : undefined}
              clearLabel={c.clear}
              onClear={() => setPlaygroundValue("")}
            />
          </div>
          <div className="grid gap-5 @min-[720px]:grid-cols-2">
            <div className="space-y-4">
              <ControlSection title="Appearance"><ControlGroup label="Style">{(["outline", "filled"] as const).map((value) => <ControlButton key={value} active={playgroundVariant === value} onClick={() => setPlaygroundVariant(value)}>{capitalize(value)}</ControlButton>)}</ControlGroup></ControlSection>
              <ControlSection title="Size"><ControlGroup label="Control size">{(["small", "regular", "large", "xlarge"] as const).map((value) => <ControlButton key={value} active={playgroundSize === value} onClick={() => setPlaygroundSize(value)}>{capitalize(value)}</ControlButton>)}</ControlGroup></ControlSection>
              <ControlSection title="Layout"><ControlGroup label="Width behavior">{(["fill", "fixed"] as const).map((value) => <ControlButton key={value} active={playgroundLayout === value} onClick={() => setPlaygroundLayout(value)}>{capitalize(value)}</ControlButton>)}</ControlGroup>{playgroundLayout === "fixed" ? <label className="block"><span className="mb-1.5 block text-[11px] font-medium text-oe-foreground-tertiary">Width · px</span><input type="number" min={120} max={640} step={8} value={playgroundWidth} onChange={(event) => setPlaygroundWidth(Number(event.target.value))} className="h-8 w-full rounded-lg border border-oe-border-primary bg-oe-background-primary px-2.5 text-xs text-oe-foreground-primary outline-none focus:border-oe-focus-ring focus:ring-2 focus:ring-oe-focus-ring/30" /></label> : null}<ControlGroup label="Text alignment">{(["left", "right"] as const).map((value) => <ControlButton key={value} active={playgroundTextAlign === value} onClick={() => setPlaygroundTextAlign(value)}>{capitalize(value)}</ControlButton>)}</ControlGroup></ControlSection>
              <ControlSection title="State"><ControlGroup label="Preview state">{(["default", "focus", "invalid", "disabled", "readOnly"] as const).map((value) => <ControlButton key={value} active={playgroundState === value} onClick={() => setPlaygroundState(value)}>{value === "readOnly" ? "Read only" : capitalize(value)}</ControlButton>)}</ControlGroup></ControlSection>
            </div>
            <div className="space-y-4">
              <ControlSection title="Content"><TextControl label="Value" value={playgroundValue} onChange={setPlaygroundValue} /><TextControl label="Placeholder" value={playgroundPlaceholder} onChange={setPlaygroundPlaceholder} /></ControlSection>
              <ControlSection title="Elements">
                <div className="divide-y divide-oe-border-secondary">
                  <div className="pb-3"><PlaygroundElementControl label="Leading element" value={playgroundElements.leading} onChange={(value) => setPlaygroundElements((current) => ({ ...current, leading: value }))} /></div>
                  <div className="py-3"><TextElementControl label="Prefix" visible={playgroundElements.showPrefix} text={playgroundElements.prefixText} onVisibleChange={(value) => setPlaygroundElements((current) => ({ ...current, showPrefix: value }))} onTextChange={(value) => setPlaygroundElements((current) => ({ ...current, prefixText: value }))} /></div>
                  <div className="py-3"><BooleanControl label="Show clear button" value={playgroundElements.showClear} onChange={(value) => setPlaygroundElements((current) => ({ ...current, showClear: value }))} /></div>
                  <div className="py-3"><TextElementControl label="Suffix" visible={playgroundElements.showSuffix} text={playgroundElements.suffixText} onVisibleChange={(value) => setPlaygroundElements((current) => ({ ...current, showSuffix: value }))} onTextChange={(value) => setPlaygroundElements((current) => ({ ...current, suffixText: value }))} /></div>
                  <div className="pt-3"><PlaygroundElementControl label="Trailing element" value={playgroundElements.trailing} onChange={(value) => setPlaygroundElements((current) => ({ ...current, trailing: value }))} /></div>
                </div>
              </ControlSection>
            </div>
          </div>
        </div>
      </Section>

      <Section id="anatomy" title="Anatomy" description="Input을 구성하는 실제 요소와 문서에서 사용하는 명칭입니다.">
        <InputAnatomy />
      </Section>

      <Section id="style" title="Properties · Style" description="Outline은 테두리로, Filled는 중립 회색조 배경으로 입력 영역을 구분합니다.">
        <PropertyGroup label="Outline"><Input placeholder={c.placeholder} /></PropertyGroup>
        <PropertyGroup label="Filled"><Input variant="filled" placeholder={c.placeholder} /></PropertyGroup>
      </Section>

      <Section id="size" title="Properties · Size" description="공통 Control Height입니다. 같은 Size의 Button과 한 줄 Form control이 동일한 외곽 높이를 사용합니다.">
        <PropertyGroup label="Small · 32px"><Input controlSize="small" placeholder={c.placeholder} /></PropertyGroup>
        <PropertyGroup label="Regular · 36px · Default"><Input controlSize="regular" placeholder={c.placeholder} /></PropertyGroup>
        <PropertyGroup label="Large · 40px"><Input controlSize="large" placeholder={c.placeholder} /></PropertyGroup>
        <PropertyGroup label="XLarge · 48px"><Input controlSize="xlarge" placeholder={c.placeholder} /></PropertyGroup>
      </Section>

      <Section id="layout" title="Properties · Layout" description="Fill은 부모 너비를 채우고, Fixed는 지정한 너비를 유지하되 부모보다 넓어지지 않습니다.">
        <PropertyGroup label="Fill · Default"><Input placeholder={c.placeholder} /></PropertyGroup>
        <PropertyGroup label="Fixed · 200px"><Input layout="fixed" fixedWidth={200} placeholder={c.placeholder} /></PropertyGroup>
      </Section>

      <Section id="alignment" title="Properties · Text alignment" description="입력값과 Placeholder를 왼쪽 또는 오른쪽에 정렬합니다. 기본값은 Left입니다.">
        <PropertyGroup label="Left · Default"><Input defaultValue={locale === "ko" ? "입력값" : "Input value"} textAlign="left" readOnly /></PropertyGroup>
        <PropertyGroup label="Right"><Input defaultValue="1,000" textAlign="right" readOnly /></PropertyGroup>
      </Section>

      <Section id="state" title="Properties · State" description="비교할 상태값은 유지하고 Hover, Focus와 키보드 피드백은 실제로 확인할 수 있습니다.">
        <PropertyGroup label="Empty / Placeholder"><Input value="" onChange={() => undefined} placeholder={c.placeholder} /></PropertyGroup>
        <PropertyGroup label="Default · With value"><Input value={locale === "ko" ? "입력된 값" : "Entered value"} onChange={() => undefined} /></PropertyGroup>
        <PropertyGroup label="Focus"><Input value={locale === "ko" ? "포커스 상태" : "Focused"} onChange={() => undefined} containerClassName="border-oe-focus-ring ring-1 ring-oe-focus-ring" /></PropertyGroup>
        <PropertyGroup label="Invalid"><Input aria-invalid="true" value={locale === "ko" ? "올바르지 않은 값" : "Invalid value"} onChange={() => undefined} /></PropertyGroup>
        <PropertyGroup label="Disabled" fixed><Input disabled defaultValue={locale === "ko" ? "비활성화" : "Disabled"} /></PropertyGroup>
        <PropertyGroup label="Read only" fixed><Input readOnly defaultValue={locale === "ko" ? "읽기 전용" : "Read only"} /></PropertyGroup>
      </Section>

      <Section id="elements" title="Properties · Elements" description="실제 input field를 제외한 요소는 모두 선택 사항이며 전달한 요소만 표시합니다.">
        <PropertyGroup label="Leading element"><Input leadingElement={<RiSearchLine />} placeholder={c.search} /></PropertyGroup>
        <PropertyGroup label="Prefix"><Input prefix="https://" placeholder={c.website} /></PropertyGroup>
        <PropertyGroup label="Clear button"><Input value={clearValue} onChange={(event) => setClearValue(event.target.value)} clearable={clearValue.length > 0} clearLabel={c.clear} onClear={() => setClearValue("")} aria-label={c.clear} /></PropertyGroup>
        <PropertyGroup label="Suffix"><Input inputMode="numeric" placeholder={c.amount} suffix="KRW" /></PropertyGroup>
        <PropertyGroup label="Trailing element · Password">
          <Input
            type={passwordVisible ? "text" : "password"}
            value={passwordValue}
            onChange={(event) => setPasswordValue(event.target.value)}
            placeholder="Password"
            clearable={passwordValue.length > 0}
            clearLabel={c.clear}
            onClear={() => setPasswordValue("")}
            trailingElement={
              <button type="button" aria-label={passwordVisible ? c.hidePassword : c.showPassword} aria-pressed={passwordVisible} onClick={() => setPasswordVisible((visible) => !visible)} className="flex size-6 items-center justify-center rounded-md transition-colors hover:bg-oe-interaction-hover hover:text-oe-foreground-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-focus-ring">
                {passwordVisible ? <RiEyeOffLine aria-hidden="true" /> : <RiEyeLine aria-hidden="true" />}
              </button>
            }
          />
        </PropertyGroup>
        <PropertyGroup label="Combined"><Input leadingElement={<RiLink />} prefix="https://" suffix=".com" trailingElement={<RiCalendarLine />} placeholder="example" /></PropertyGroup>
      </Section>

      <Section id="custom-input" title="Custom input" description={c.customInputDescription}>
        <InputCustomExamples />
      </Section>

      <Section id="color-input" title="Color input" description={c.colorInputDescription}>
        <InputColorExample />
      </Section>

      <Section id="guidelines" title="Guidelines" description="Input을 고르고 내부 요소를 구성할 때 적용하는 기준입니다.">
        <div className="col-span-full grid gap-8">
          <div>
            <GuidelineTitle>Prefix·Suffix와 Leading·Trailing element를 나눠 쓰기</GuidelineTitle>
            <div className="mt-3 grid gap-3 @min-[720px]:grid-cols-2">
              <GuideVisual label="Prefix · Suffix">
                <PreviewLocaleScope className="w-full"><Input value="1,250,000" readOnly prefix="₩" suffix={locale === "ko" ? "원" : "KRW"} textAlign="right" className="tabular-nums" aria-label={locale === "ko" ? "금액" : "Amount"} /></PreviewLocaleScope>
              </GuideVisual>
              <GuideVisual label="Leading · Trailing element">
                <PreviewLocaleScope className="w-full space-y-2">
                  <Input value={locale === "ko" ? "검색어" : "Keyword"} readOnly leadingElement={<RiSearchLine aria-hidden="true" />} aria-label={locale === "ko" ? "검색" : "Search"} />
                  <Input type="password" value="password" readOnly trailingElement={<RiEyeLine aria-hidden="true" />} aria-label={locale === "ko" ? "비밀번호" : "Password"} />
                </PreviewLocaleScope>
              </GuideVisual>
            </div>
            <GuidelineList items={[
              "Prefix와 Suffix는 값의 의미를 보완하는 짧은 표기 자리입니다. 통화 기호와 단위가 여기에 옵니다.",
              "Leading element와 Trailing element는 값을 식별하거나 조작을 여는 요소 자리입니다. 검색을 나타내는 아이콘이나 보기 전환 action이 여기에 옵니다.",
              <>내부 순서는 <code className="text-xs text-oe-foreground-primary">Leading element → Prefix → Input field → Clear button → Suffix → Trailing element</code>로 고정됩니다. 같은 의미의 요소를 두 자리에 나눠 두지 않습니다.</>,
            ]} />
          </div>
          <UsageComparison
            title="Clear button은 값을 자주 비우는 자리에 두기"
            doText="값을 지우고 다시 입력하는 자리에 두세요."
            dontText="한 번 정하면 유지되는 값에는 두지 마세요."
            description={[
              <>Input은 값을 소유하지 않으므로 값의 유무는 쓰는 쪽이 판단해 <code className="text-xs text-oe-foreground-primary">clearable</code>로 전달합니다. 값이 없으면 버튼을 렌더링하지 않아 자리를 차지하지 않고, focus가 있을 때만 나타납니다. 두 예시는 그 모습을 보여주기 위해 포커스된 상태로 고정했습니다.</>,
              "검색, 필터, 금액처럼 값을 지우고 다시 입력하는 자리에 둡니다. 지운 뒤에 이어서 입력할 수 있도록 버튼을 눌러도 focus는 입력창에 남습니다.",
              "주소나 이름처럼 한 번 정하면 유지되는 값에는 두지 않습니다. 지울 일이 없는 값에도 지우기를 권하는 것처럼 보이고, 별도 화면에서 고른 값을 한 번에 날릴 수 있습니다.",
            ]}
            doVisual={<ClearableSample defaultValue={c.clearSearchValue} label={c.clearSearchLabel} leading={<RiSearchLine aria-hidden="true" />} />}
            dontVisual={<ClearableSample defaultValue={c.clearAddressValue} label={c.clearAddressLabel} />}
          />
          <div>
            <GuidelineTitle>숫자 값은 Number Input과 나눠 쓰기</GuidelineTitle>
            <div className="mt-3 grid gap-3 @min-[720px]:grid-cols-2">
              <GuideVisual label="Input · 계산하지 않는 식별자">
                <PreviewLocaleScope className="w-full"><Input value={c.phoneValue} readOnly inputMode="numeric" autoComplete="tel" className="tabular-nums" aria-label={c.phoneLabel} /></PreviewLocaleScope>
              </GuideVisual>
              <GuideVisual label="Number Input · 계산에 쓰이는 값">
                <PreviewLocaleScope className="w-full"><NumberInput defaultValue={12} min={0} max={99} decreaseLabel={c.decrease} increaseLabel={c.increase} decreaseTooltip={c.decreaseTooltip} increaseTooltip={c.increaseTooltip} aria-label={c.quantityLabel} /></PreviewLocaleScope>
              </GuideVisual>
            </div>
            <GuidelineList items={[
              <>Input에는 별도 <code className="text-xs text-oe-foreground-primary">numeric</code> Property를 두지 않습니다. 수량, 순서, 비율처럼 계산에 쓰이는 숫자는 Number Input을 사용하고, 증감 버튼이 필요 없으면 Number Input의 Controls를 숨깁니다.</>,
              <>전화번호, 사업자번호, 카드번호처럼 숫자로 보이지만 계산하지 않는 식별자는 Input이 담당합니다. native <code className="text-xs text-oe-foreground-primary">inputMode=&quot;numeric&quot;</code>과 필요한 포맷, <code className="text-xs text-oe-foreground-primary">tabular-nums</code>를 조합합니다.</>,
              "자리 구분이 필요한 금액도 Input이 담당합니다. Number Input은 값에 구분자를 담을 수 없습니다.",
            ]} />
          </div>
          <div>
            <GuidelineTitle>특수한 포맷은 Custom input으로 정의하기</GuidelineTitle>
            <div className="mt-3 grid gap-3 @min-[720px]:grid-cols-2">
              <GuideVisual label={c.businessLabel}>
                <PreviewLocaleScope className="w-full"><Input value={c.businessValue} readOnly inputMode="numeric" className="tabular-nums" aria-label={c.businessLabel} /></PreviewLocaleScope>
              </GuideVisual>
              <GuideVisual label={c.expiryLabel}>
                <PreviewLocaleScope className="w-full"><Input value={c.expiryValue} readOnly inputMode="numeric" className="tabular-nums" aria-label={c.expiryLabel} /></PreviewLocaleScope>
              </GuideVisual>
            </div>
            <GuidelineList items={[
              "정해진 자릿수와 구분자가 있는 값, 일부만 입력받고 나머지를 고정 마스킹하는 값은 기본 Property로 표현되지 않습니다. 이때는 Input을 조합해 포맷과 동작을 직접 정의합니다.",
              <>반복 사용되는 부분 입력과 고정 마스킹은 공용 <code className="text-xs text-oe-foreground-primary">PartialMaskedInput</code>이 소유합니다. 같은 마스킹을 화면마다 다시 만들지 않습니다.</>,
              "새 포맷을 만들어도 Container와 Focus·Invalid·Disabled 표현은 Input이 소유한 것을 그대로 씁니다. 확정된 사례는 위 Custom input 절에 있습니다.",
            ]} />
          </div>
        </div>
      </Section>

      <Section id="property-map" title="Property map" description="상위 Property와 현재 허용하는 하위 값을 한 번에 확인합니다.">
        <div className="col-span-full overflow-x-auto">
          <table className="w-full min-w-[42rem] text-left text-xs">
            <thead className="border-b border-oe-border-secondary text-oe-foreground-tertiary"><tr><th className="py-2 font-medium">Property</th><th className="py-2 font-medium">Values</th><th className="py-2 font-medium">Default</th><th className="py-2 font-medium">Status</th></tr></thead>
            <tbody className="divide-y divide-oe-border-secondary text-oe-foreground-secondary">
              <MapRow property="variant" values="outline | filled" defaultValue="outline" />
              <MapRow property="controlSize" values="small | regular | large | xlarge" defaultValue="regular" />
              <MapRow property="layout" values="fill | fixed" defaultValue="fill" />
              <MapRow property="fixedWidth" values="CSS width" defaultValue="required when fixed" note="Fixed only" />
              <MapRow property="textAlign" values="left | right" defaultValue="left" />
              <MapRow property="state" values="empty / placeholder | default with value | focus | invalid | disabled | readOnly" defaultValue="empty / placeholder" note="Native attributes and focus" />
              <MapRow property="elements" values="leadingElement | prefix | clearable | suffix | trailingElement" defaultValue="none" note="Optional" />
            </tbody>
          </table>
        </div>
      </Section>

      </div>
      <OnThisPage items={inputSections} componentKey="input" />
    </div>
  );
}

function InputAnatomy() {
  return (
    <div className="col-span-full min-w-0">
      <AnatomySurface ariaLabel="Input anatomy" title="Input structure" className="px-5 pb-5 pt-12">
        <div className="overflow-x-auto">
          <div className="relative mx-auto h-[22rem] w-[48rem] text-oe-foreground-secondary">
            <AnatomyBoundaryMarker number={1} side="top" connectorLength={50} boundaryLength={536} className="left-[374px] top-[62px]" />
            <AnatomyNumber number={2} className="left-[134px] top-[66px]" lineClassName="left-2.5 top-[28px] h-[78px] w-px" />
            <AnatomyNumber number={3} className="left-[190px] top-[66px]" lineClassName="left-2.5 top-[28px] h-[78px] w-px" />
            <AnatomyNumber number={4} className="left-[362px] top-[253px]" lineClassName="left-2.5 bottom-[28px] h-[55px] w-px" />
            <AnatomyNumber number={5} className="left-[518px] top-[253px]" lineClassName="left-2.5 bottom-[28px] h-[55px] w-px" />
            <AnatomyNumber number={6} className="left-[566px] top-[66px]" lineClassName="left-2.5 top-[28px] h-[78px] w-px" />
            <AnatomyNumber number={7} className="left-[614px] top-[253px]" lineClassName="left-2.5 bottom-[28px] h-[55px] w-px" />

            <div className="absolute left-[7.25rem] top-[9.5rem] grid h-14 w-[33.5rem] grid-cols-[2rem_4rem_minmax(8rem,1fr)_2rem_3rem_2rem] items-center gap-x-2 rounded-lg border border-oe-border-primary bg-oe-background-primary px-3 text-sm text-oe-foreground-primary">
              <AnatomySwapSlot className="justify-self-center" />
              <span className="text-oe-foreground-secondary">https://</span>
              <span className="min-w-0 truncate text-oe-foreground-placeholder">example</span>
              <span className="flex size-6 items-center justify-center justify-self-center text-oe-foreground-tertiary"><RiCloseLine className="size-4" aria-hidden="true" /></span>
              <span className="text-oe-foreground-secondary">.com</span>
              <AnatomySwapSlot className="justify-self-center" />
            </div>
          </div>
        </div>
      </AnatomySurface>
      <AnatomyLegend items={[{ name: "Container" }, { name: "Leading element", optional: true }, { name: "Prefix", optional: true }, { name: "Input field" }, { name: "Clear button", optional: true }, { name: "Suffix", optional: true }, { name: "Trailing element", optional: true }]} />
    </div>
  );
}

// State 섹션의 Focus 카드와 같은 방식으로 포커스된 모습을 고정한다. Clear button 은
// focus 가 있을 때만 나타나므로 그대로 두면 두 예시가 누르기 전에 같아 보인다.
const focusedClearVisual = [
  "border-oe-focus-ring ring-1 ring-oe-focus-ring",
  "[&_[data-slot=input-clear]]:visible [&_[data-slot=input-clear]]:pointer-events-auto",
  "[&_[data-slot=input-clear]]:ml-0 [&_[data-slot=input-clear]]:w-6 [&_[data-slot=input-clear]]:opacity-100",
].join(" ");

function ClearableSample({ defaultValue, label, leading }: { defaultValue: string; label: string; leading?: ReactNode }) {
  const [value, setValue] = useState(defaultValue);
  return (
    <PreviewLocaleScope className="w-full">
      <Input
        value={value}
        onChange={(event) => setValue(event.currentTarget.value)}
        clearable={value.length > 0}
        onClear={() => setValue("")}
        clearLabel={label}
        leadingElement={leading}
        aria-label={label}
        containerClassName={focusedClearVisual}
      />
    </PreviewLocaleScope>
  );
}

function Section({ id, title, description, children }: { id?: string; title: string; description: string; children: ReactNode }) {
  return <section id={id} className="scroll-mt-20 rounded-2xl border border-oe-border-secondary bg-oe-background-primary p-5"><h3 className="text-lg font-semibold text-oe-foreground-primary">{title}</h3><p className="mt-1 text-xs leading-5 text-oe-foreground-tertiary">{description}</p><div className="mt-5 grid gap-3 @min-[720px]:grid-cols-2">{children}</div></section>;
}

function PropertyGroup({ label, description, children }: { label: string; description?: string; children: ReactNode; fixed?: boolean }) {
  return <div className="flex min-h-28 min-w-0 flex-col gap-3 rounded-xl border border-oe-border-secondary p-4"><div><p className="text-xs font-medium text-oe-foreground-primary">{label}</p>{description ? <p className="mt-1 text-[11px] leading-4 text-oe-foreground-tertiary">{description}</p> : null}</div><PreviewLocaleScope className="mt-auto">{children}</PreviewLocaleScope></div>;
}

function ControlGroup({ label, children }: { label: string; children: ReactNode }) {
  return <fieldset><legend className="mb-2 text-[11px] font-medium text-oe-foreground-tertiary">{label}</legend><div className="flex flex-wrap gap-1.5">{children}</div></fieldset>;
}

function ControlSection({ title, children }: { title: string; children: ReactNode }) {
  return <section className="space-y-3 border-t border-oe-border-secondary pt-3 first:border-t-0 first:pt-0"><h4 className="text-sm font-semibold text-oe-foreground-primary">{title}</h4>{children}</section>;
}

function TextControl({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block"><span className="mb-1.5 block text-[11px] font-medium text-oe-foreground-tertiary">{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} className="h-8 w-full rounded-lg border border-oe-border-primary bg-oe-background-primary px-2.5 text-xs text-oe-foreground-primary outline-none placeholder:text-oe-foreground-placeholder focus:border-oe-focus-ring focus:ring-2 focus:ring-oe-focus-ring/30" /></label>;
}

function ControlButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return <button type="button" aria-pressed={active} onClick={onClick} className={`rounded-lg border px-2.5 py-1.5 text-xs transition-colors ${active ? "border-oe-foreground-primary bg-oe-background-bold-primary text-oe-foreground-inverse" : "border-oe-border-secondary bg-oe-background-primary text-oe-foreground-secondary hover:bg-oe-interaction-hover"}`}>{children}</button>;
}

function BooleanControl({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
  return <div className="flex items-center justify-between gap-3"><span className="text-[11px] font-medium text-oe-foreground-tertiary">{label}</span><button type="button" role="switch" aria-checked={value} aria-label={label} onClick={() => onChange(!value)} className={`relative h-5 w-9 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-focus-ring/40 ${value ? "bg-oe-background-bold-primary" : "bg-oe-background-secondary ring-1 ring-inset ring-oe-border-primary"}`}><span className={`absolute top-0.5 size-4 rounded-full bg-oe-background-primary shadow-sm transition-[left] ${value ? "left-[18px]" : "left-0.5"}`} /></button></div>;
}

function TextElementControl({ label, visible, text, onVisibleChange, onTextChange }: { label: string; visible: boolean; text: string; onVisibleChange: (value: boolean) => void; onTextChange: (value: string) => void }) {
  return <div className="space-y-2"><BooleanControl label={`Show ${label.toLowerCase()}`} value={visible} onChange={onVisibleChange} />{visible ? <label className="block"><span className="mb-1.5 block text-[11px] font-medium text-oe-foreground-tertiary">{label} text</span><input value={text} onChange={(event) => onTextChange(event.target.value)} className="h-8 w-full rounded-lg border border-oe-border-primary bg-oe-background-primary px-2.5 text-xs text-oe-foreground-primary outline-none focus:border-oe-focus-ring focus:ring-2 focus:ring-oe-focus-ring/30" /></label> : null}</div>;
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function MapRow({ property, values, defaultValue, note = "Confirmed" }: { property: string; values: string; defaultValue: string; note?: string }) {
  return <tr><td className="py-3 font-mono text-[11px] text-oe-foreground-primary">{property}</td><td className="font-mono text-[11px]">{values}</td><td className="font-mono text-[11px]">{defaultValue}</td><td>{note}</td></tr>;
}
