"use client";

import { useState, type ReactNode } from "react";

import { Input, RadioField, RadioGroup, Textarea } from "@ooee/ui";
import { AnatomyBoundaryMarker, AnatomyDescription, AnatomyLegend, AnatomyNumber, AnatomySurface } from "@/components/component-anatomy";
import { OnThisPage } from "@/components/component-detail-navigation";
import { GuidelineList, GuideVisual, UsageComparison } from "@/components/component-guidelines";
import { GuidelineTitle } from "@/components/guideline-title";
import { DependentControlGroup, PlaygroundChoice as Choice } from "@/components/playground-element-control";
import { PreviewLocaleScope } from "@/components/preview-locale-scope";
import { useStudioPreferences } from "@/components/studio-preferences-provider";

const copy = {
  ko: {
    description: "여러 줄 텍스트를 입력하는 컴포넌트입니다. Input과 같은 Style과 State를 사용하며 Leading과 Trailing element는 지원하지 않습니다.",
    placeholder: "내용을 입력하세요",
    value: "입력된 여러 줄 텍스트입니다.\n줄바꿈 상태를 함께 확인합니다.",
    invalid: "올바르지 않은 입력값",
    disabled: "비활성화된 입력값",
    readOnly: "읽기 전용 입력값",
    inquiryLabel: "문의 내용",
    inquiryValue: "결제가 두 번 승인된 것 같습니다. 어제 오후에 결제한 건이 카드 내역에 두 번 찍혀 있어서 확인을 부탁드립니다.",
    titleLabel: "제목",
    titleValue: "결제 오류 문의",
    memoLabel: "메모",
    nameLabel: "이름",
    nameValue: "홍길동",
    replyLabel: "답변 수신 여부",
    replyOptions: ["예", "아니오"],
    layoutValue: "지난주에 신청한 교환 건이 어떻게 처리되고 있는지 알려주세요.",
    halfLineValue: "배송이 예정일보다 사흘 늦게 도착했습니다. 그동안 어디에 머물러 있는지 조회해도 상태가 바뀌지 않아서 두 번 문의했는데 같은 안내만 받았습니다. 첫 문의에서는 하루 안에 답을 준다고 했지만 이틀이 지나서야 회신을 받았고, 그 내용도 조회 화면에 이미 나와 있던 문장과 같았습니다. 물건은 결국 도착했으니 이 건의 보상을 바라는 것은 아닙니다. 다만 지연된 이유와 다음부터 같은 일이 생기지 않게 할 방법을 알려주세요.",
    resizeValue: "영수증을 다시 받을 수 있을까요. 회사에 제출해야 하는데 문자로 받은 내역은 항목이 나오지 않습니다.",
    scrollValue: "쿠폰이 적용되지 않는 이유를 알고 싶습니다. 사용 기간 안에 있고 최소 금액도 넘겼는데 결제 화면에서 목록에 나오지 않습니다. 다른 쿠폰은 정상적으로 선택되는 것을 보면 이 쿠폰만 조건이 다른 것 같습니다. 어떤 조건이 남아 있는지, 이 주문에 지금이라도 적용할 수 있는지 알려주세요.",
    conflictValue: "매장에서 받은 안내와 앱에 표시된 운영 시간이 다릅니다. 매장 입구에는 아침 열 시부터라고 붙어 있었는데 앱에는 열한 시로 나옵니다. 어제는 열 시 반에 갔더니 문이 닫혀 있었고, 오늘은 같은 시간에 열려 있었습니다. 어느 쪽이 맞는지 확인해 주시고 다른 지점도 같은지 알려주세요.",
    autoSizeValue: "직원분이 재고를 대신 확인해 주셔서 헛걸음하지 않았습니다. 다음에도 같은 매장을 이용하겠습니다.",
    heightValue: "매장 위치를 찾기 어려웠습니다. 지하철역에서 나와 어느 방향으로 가야 하는지 안내가 없어서 한참 헤맸습니다. 입구 사진이라도 있으면 좋겠습니다.",
  },
  en: {
    description: "A multi-line text entry component. It shares Input styles and states but does not support leading or trailing elements.",
    placeholder: "Enter content",
    value: "Multi-line text value.\nThe line break is preserved.",
    invalid: "Invalid value",
    disabled: "Disabled value",
    readOnly: "Read-only value",
    inquiryLabel: "Inquiry",
    inquiryValue: "It looks like my payment went through twice. The charge from yesterday afternoon shows up twice on my card statement, so please take a look.",
    titleLabel: "Title",
    titleValue: "Duplicate payment",
    memoLabel: "Memo",
    nameLabel: "Name",
    nameValue: "Jane Doe",
    replyLabel: "Reply needed",
    replyOptions: ["Yes", "No"],
    layoutValue: "Please let me know how the exchange request from last week is being handled.",
    halfLineValue: "The delivery arrived three days later than the promised date. The tracking status never changed while it was in transit, and I asked twice but received the same reply both times. The first reply promised an answer within a day, but it took two days to arrive, and it repeated what the tracking page already said. The package did arrive, so I am not asking for compensation. I would like to know why it was delayed and how it will be prevented next time.",
    resizeValue: "Could I get the receipt again? I need to submit it at work, and the text message I received does not list the items.",
    scrollValue: "I would like to know why my coupon is not being applied. It is within the valid period and the order is above the minimum amount, but it does not appear on the payment screen. Other coupons are selectable, so this one seems to have a different condition. Please tell me which condition is left and whether it can still be applied to this order.",
    conflictValue: "The hours posted at the store differ from the hours shown in the app. The sign at the entrance says ten in the morning, but the app shows eleven. Yesterday the door was closed at half past ten, and today it was open at the same time. Please confirm which one is correct and whether other branches are the same.",
    autoSizeValue: "A staff member checked the stock for me, so I did not make the trip for nothing. I will visit the same store next time.",
    heightValue: "The store was hard to find. There was no guidance on which way to go after leaving the subway station, so I wandered for a while. A photo of the entrance would help.",
  },
} as const;

const textareaSections = [
  { id: "playground", label: "Playground" },
  { id: "anatomy", label: "Anatomy" },
  { id: "style", label: "Style" },
  { id: "sizing", label: "Sizing" },
  { id: "state", label: "State" },
  { id: "elements", label: "Elements" },
  { id: "guidelines", label: "Guidelines" },
  { id: "property-map", label: "Property map" },
];

export function TextareaWorkbench() {
  const { locale } = useStudioPreferences();
  const c = copy[locale];
  const [playgroundValue, setPlaygroundValue] = useState("");
  const [playgroundVariant, setPlaygroundVariant] = useState<"outline" | "filled">("outline");
  const [playgroundAutoSize, setPlaygroundAutoSize] = useState(false);
  const [playgroundResize, setPlaygroundResize] = useState(true);
  const [playgroundHeight, setPlaygroundHeight] = useState(80);

  return (
    <div className="grid items-start gap-6 @min-[1120px]:grid-cols-[minmax(0,1fr)_11rem]">
      <div className="min-w-0 space-y-5">

        <Section id="playground" title="🚩 Playground" description="Style, Resize와 Optional element를 조합해 실제 여러 줄 입력 상태를 확인합니다.">
          <div className="col-span-full grid gap-5 rounded-xl border-2 border-oe-border-bold-primary bg-oe-background-secondary p-4 @min-[900px]:grid-cols-[minmax(18rem,1fr)_18rem]">
            <div className="rounded-xl bg-oe-background-primary p-5">
              <Textarea variant={playgroundVariant} autoSize={playgroundAutoSize} resize={playgroundResize} height={playgroundHeight} value={playgroundValue} onChange={(event) => setPlaygroundValue(event.target.value)} placeholder={c.placeholder} />
            </div>
            <div className="space-y-5 rounded-xl bg-oe-background-primary p-4">
              <ControlSection title="Appearance">
                <Control label="Style"><Choice active={playgroundVariant === "outline"} onClick={() => setPlaygroundVariant("outline")}>Outline</Choice><Choice active={playgroundVariant === "filled"} onClick={() => setPlaygroundVariant("filled")}>Filled</Choice></Control>
              </ControlSection>
              <ControlSection title="Behavior">
              <Toggle label="Auto size" value={playgroundAutoSize} onChange={setPlaygroundAutoSize} />
              <DependentControlGroup className={playgroundAutoSize ? "pointer-events-none opacity-40" : undefined}>
                <div className="space-y-4">
                  <Toggle label="Resize" value={playgroundResize} onChange={setPlaygroundResize} />
                  <label className="flex items-center justify-between gap-3 text-[11px] font-medium text-oe-foreground-tertiary">Height <input type="number" min={88} step={4} value={playgroundHeight} onChange={(event) => setPlaygroundHeight(Math.max(88, Number(event.target.value) || 88))} className="h-8 w-20 rounded-lg border border-oe-border-secondary bg-oe-background-primary px-2 text-right text-xs text-oe-foreground-primary outline-none focus:border-oe-focus-ring" /></label>
                </div>
              </DependentControlGroup>
              </ControlSection>
            </div>
          </div>
        </Section>

        <Section id="anatomy" title="Anatomy" description="Textarea를 구성하는 실제 요소와 문서에서 사용하는 명칭입니다.">
          <TextareaAnatomy />
        </Section>

        <Section id="style" title="Properties · Style" description="Input과 동일하게 Outline과 Filled를 지원합니다.">
          <Example label="Outline"><Textarea placeholder={c.placeholder} /></Example>
          <Example label="Filled"><Textarea variant="filled" placeholder={c.placeholder} /></Example>
        </Section>

        <Section id="sizing" title="Properties · Sizing" description="Auto size가 상위 속성이며, 값에 따라 Height와 Resize의 적용 여부가 결정됩니다.">
          <Example label="Auto size · false" description="기본값입니다. Height로 초기 높이를 설정하고 Resize 사용 여부를 선택할 수 있습니다."><Textarea autoSize={false} height={80} defaultValue={c.value} /></Example>
          <Example label="Auto size · true" description="내용에 따라 높이가 자동으로 증가합니다. 하위 속성인 Height와 Resize는 적용하지 않으며, viewport에서 고정 영역을 제외한 Max height를 넘지 않아야 합니다."><Textarea autoSize defaultValue={c.value} /></Example>
          <Example label="Resize · true / false" description="기본값은 true이며 Auto size가 false일 때만 활성화됩니다. 세로 방향으로 높이를 변경할 수 있지만 동일한 Max height 제한을 넘지 않아야 합니다."><Textarea autoSize={false} defaultValue={c.value} /></Example>
          <Example label="Height · Minimum 80px" description="Auto size가 false일 때 초기 높이를 설정합니다. 기본값과 허용되는 최소값은 모두 80px입니다."><Textarea autoSize={false} height={112} defaultValue={c.value} /></Example>
        </Section>

        <Section id="state" title="Properties · State" description="Input과 같은 단색 Focus/Error 외곽선 구조를 사용합니다.">
          <Example label="Empty / Placeholder"><Textarea value="" onChange={() => undefined} placeholder={c.placeholder} /></Example>
          <Example label="Default · With value"><Textarea value={c.value} onChange={() => undefined} /></Example>
          <Example label="Focus"><Textarea value={c.value} onChange={() => undefined} containerClassName="border-oe-focus-ring ring-1 ring-oe-focus-ring" /></Example>
          <Example label="Invalid"><Textarea value={c.invalid} onChange={() => undefined} aria-invalid="true" /></Example>
          <Example label="Disabled" fixed><Textarea disabled tabIndex={-1} defaultValue={c.disabled} /></Example>
          <Example label="Read only" fixed><Textarea readOnly tabIndex={-1} defaultValue={c.readOnly} /></Example>
        </Section>

        <Section id="elements" title="Properties · Elements" description="Textarea는 Container와 Textarea field만으로 구성하며 내부 선택 요소를 지원하지 않습니다.">
          <Example label="Container + Textarea field"><Textarea placeholder={c.placeholder} /></Example>
        </Section>

        <Section id="guidelines" title="Guidelines" description="Textarea를 고르고 높이를 정할 때 적용하는 기준입니다.">
          <div className="col-span-full grid gap-8">
            <div>
              <GuidelineTitle>여러 줄이 필요한 값에만 사용하기</GuidelineTitle>
              <div className="mt-3 grid gap-3 @min-[720px]:grid-cols-2">
                <GuideVisual label="Textarea · 여러 줄" contentClassName="items-start">
                  <PreviewLocaleScope className="w-full"><FieldLabel>{c.inquiryLabel}</FieldLabel><Textarea value={c.inquiryValue} readOnly aria-label={c.inquiryLabel} /></PreviewLocaleScope>
                </GuideVisual>
                <GuideVisual label="Input · 한 줄" contentClassName="items-start">
                  <PreviewLocaleScope className="w-full"><FieldLabel>{c.nameLabel}</FieldLabel><Input value={c.nameValue} readOnly aria-label={c.nameLabel} /></PreviewLocaleScope>
                </GuideVisual>
              </div>
              <GuidelineList items={[
                "문의 내용, 설명, 메모처럼 줄바꿈이 생기는 값에 Textarea를 사용합니다.",
                "제목이나 이름처럼 한 줄로 끝나는 값은 Input을 사용합니다. Textarea는 최소 80px를 차지하므로, 한 줄 값에 두면 쓰이지 않는 빈 영역이 남고 폼의 수직 리듬이 끊깁니다.",
              ]} />
            </div>
            <UsageComparison
              title="내부 요소와 Layout 선택은 제공하지 않기"
              doText="전체 너비를 모두 채우게 두세요."
              dontText="Textarea에 폭을 따로 지정하지 마세요."
              description={[
                "Prefix와 Suffix, Clear button, Leading element와 Trailing element를 제공하지 않습니다. Container와 Textarea field만으로 구성합니다.",
                <>Layout은 <code className="text-xs text-oe-foreground-primary">fill</code>만이며 선택 Property가 없습니다. 폭을 따로 지정하면 같은 폼의 다른 필드와 오른쪽 끝이 어긋납니다.</>,
                "Input에서 쓰던 요소가 필요하다고 느껴지면 값이 한 줄인지, 또는 Label과 도움말처럼 Field가 담당할 일인지 다시 봅니다.",
              ]}
              doVisual={<PreviewLocaleScope className="w-full"><Textarea value={c.layoutValue} readOnly aria-label={c.inquiryLabel} /></PreviewLocaleScope>}
              dontVisual={<PreviewLocaleScope className="w-full"><Textarea value={c.layoutValue} readOnly containerClassName="w-2/3" aria-label={c.inquiryLabel} /></PreviewLocaleScope>}
            />
            <div>
              <GuidelineTitle>기본 높이는 3.5줄을 유지하기</GuidelineTitle>
              <div className="mt-3 grid gap-3 @min-[720px]:grid-cols-2">
                <GuideVisual label="기본 제공 · 3.5줄 (80px)" contentClassName="items-start">
                  <PreviewLocaleScope className="w-full"><Textarea value={c.heightValue} readOnly aria-label={c.inquiryLabel} /></PreviewLocaleScope>
                </GuideVisual>
                <GuideVisual label="별도 제어 · 기본 제공 높이보다 큰 값" contentClassName="items-start">
                  <PreviewLocaleScope className="w-full"><Textarea value={c.heightValue} readOnly height={120} aria-label={c.inquiryLabel} /></PreviewLocaleScope>
                </GuideVisual>
              </div>
              <GuidelineList items={[
                "기본 높이는 80px이며 내용이 넘칠 때 3.5줄이 보입니다. 이 값보다 줄일 수 없습니다.",
                "받을 내용이 길면 초기 높이를 따로 지정할 수 있습니다. 기본 제공 높이보다 큰 값만 쓸 수 있습니다.",
              ]} />
            </div>
            <UsageComparison
              title="초기 높이는 반 줄이 걸치는 지점으로 맞추기"
              doText="마지막 줄이 일부 잘려 보이게 두세요."
              dontText="줄 수에 딱 맞춰 끊지 마세요."
              description={[
                "글자가 일부 잘려 보여야 아래에 더 쓸 자리가 있다는 것이 읽힙니다. 기본값 80px이 그 이유로 정해진 값이며, Do는 그 기본값을 그대로 쓴 상태입니다.",
                "줄 수에 딱 맞추면 입력 영역이 거기서 끝난 것처럼 보이고, 스크롤이 있다는 것을 알 방법이 없습니다.",
                "초기 높이를 따로 지정할 때도 같은 기준을 씁니다. 구현이 이 값을 검사하지 않으므로 높이를 정하는 쪽에서 맞춥니다.",
              ]}
              doVisual={<PreviewLocaleScope className="w-full"><Textarea value={c.halfLineValue} readOnly aria-label={c.inquiryLabel} /></PreviewLocaleScope>}
              dontVisual={<PreviewLocaleScope className="w-full"><Textarea value={c.halfLineValue} readOnly height={90} aria-label={c.inquiryLabel} /></PreviewLocaleScope>}
            />
            <UsageComparison
              title="Scrollbar는 Hover와 Focus에서만 보이기"
              doText="조작하지 않는 동안에는 Scrollbar를 감춰 두세요."
              dontText="Scrollbar를 항상 보이게 두지 마세요."
              description={[
                "Scrollbar thumb은 기본 상태에서 투명하고, Textarea를 Hover하거나 입력에 focus가 있을 때 보입니다. 조작하지 않는 동안에는 값만 남기고 장치는 감춥니다. 세로선이 늘 남아 있으면 값보다 장치가 먼저 읽힙니다.",
                "Hover만으로 조건을 잡지 않습니다. 키보드로 들어와 방향키로 스크롤하는 사람은 Hover가 없으므로 감춰진 분량을 끝까지 알 수 없습니다. thumb의 길이가 그 정보입니다.",
                "Scrollbar가 차지하는 공간은 언제나 확보합니다. 스크롤이 생기거나 사라져도 텍스트가 좌우로 움직이지 않습니다.",
                "그래서 내용이 더 있다는 것을 알리는 것은 마지막 줄이 반쯤 잘려 보이는 것입니다. 앞의 높이 규칙이 이 규칙과 함께 동작합니다.",
              ]}
              doVisual={<PreviewLocaleScope className="w-full"><Textarea value={c.scrollValue} readOnly aria-label={c.inquiryLabel} /></PreviewLocaleScope>}
              dontVisual={<PreviewLocaleScope className="w-full"><Textarea value={c.scrollValue} readOnly aria-label={c.inquiryLabel} className="[scrollbar-color:var(--oe-border-primary)_transparent] [&::-webkit-scrollbar-thumb]:bg-oe-border-primary" /></PreviewLocaleScope>}
            />
            <div>
              <GuidelineTitle>Resize는 세로만 허용하기</GuidelineTitle>
              <div className="mt-3 grid gap-3 @min-[720px]:grid-cols-2">
                <GuideVisual label="Resize 켬 · Default · 세로만" contentClassName="items-start">
                  <PreviewLocaleScope className="w-full"><Textarea defaultValue={c.resizeValue} aria-label={c.inquiryLabel} /></PreviewLocaleScope>
                </GuideVisual>
                <GuideVisual label="Resize 끔 · 높이 고정" contentClassName="items-start">
                  <PreviewLocaleScope className="w-full"><Textarea value={c.resizeValue} readOnly resize={false} aria-label={c.inquiryLabel} /></PreviewLocaleScope>
                </GuideVisual>
              </div>
              <GuidelineList items={[
                <><code className="text-xs text-oe-foreground-primary">resize</code>의 기본값은 <code className="text-xs text-oe-foreground-primary">true</code>이며 세로 방향만 제공합니다. 가로는 제공하지 않습니다. 폭이 달라지면 같은 폼의 다른 필드와 시작점과 끝점이 어긋납니다.</>,
                "받을 내용의 분량을 사용자가 스스로 조절하는 편이 낫기 때문에 켠 상태를 기본으로 둡니다. 높이를 고정해야 하는 자리에서만 끕니다.",
              ]} />
            </div>
            <UsageComparison
              title="자동 높이는 아래 콘텐츠가 밀리지 않는 자리에서만 켜기"
              doText="마지막 콘텐츠이거나 아래가 밀리지 않는 자리에서 켜세요."
              dontText="아래에 다른 콘텐츠가 있는 자리에서 켜지 마세요."
              description={[
                <><code className="text-xs text-oe-foreground-primary">autoSize</code>는 기본값이 아니므로 필요한 자리에서 명시적으로 켭니다.</>,
                "켤 수 있는 자리는 셋입니다. 그 화면에 이 입력만 있는 경우, 마지막 콘텐츠인 경우, 아래 콘텐츠가 밀리지 않는 배치인 경우입니다.",
                "입력하는 동안 아래 콘텐츠가 계속 내려가면 방금 읽던 자리를 잃습니다. 두 예시에 직접 입력해 차이를 확인할 수 있습니다.",
              ]}
              doVisual={<PreviewLocaleScope className="w-full"><FieldLabel>{c.inquiryLabel}</FieldLabel><Textarea autoSize defaultValue={c.autoSizeValue} aria-label={c.inquiryLabel} /></PreviewLocaleScope>}
              dontVisual={<PreviewLocaleScope className="w-full"><FieldLabel>{c.inquiryLabel}</FieldLabel><Textarea autoSize defaultValue={c.autoSizeValue} aria-label={c.inquiryLabel} /><div className="mt-6"><FieldLabel>{c.replyLabel}</FieldLabel><RadioGroup aria-label={c.replyLabel} className="-ml-2 flex flex-wrap gap-x-4">{c.replyOptions.map((label, index) => <RadioField key={label} value={`reply-${index}`} label={label} />)}</RadioGroup></div></PreviewLocaleScope>}
            />
            <UsageComparison
              title="Resize와 Auto size는 같이 사용하지 않기"
              doText="한쪽만 켜세요."
              dontText="두 Property를 함께 넘기지 마세요."
              description={[
                "높이를 사용자가 직접 정하는 것과 내용에 맡겨 자동으로 정하는 것은, 같은 값을 두 주체가 정하는 일이므로 함께 성립하지 않습니다. 어느 쪽으로 갈지 먼저 정하고 한쪽만 켭니다.",
                <>구현은 <code className="text-xs text-oe-foreground-primary">autoSize</code>가 켜져 있으면 <code className="text-xs text-oe-foreground-primary">resize</code>를 적용하지 않습니다. <code className="text-xs text-oe-foreground-primary">resize</code>의 기본값이 <code className="text-xs text-oe-foreground-primary">true</code>이므로, <code className="text-xs text-oe-foreground-primary">autoSize</code>를 켜는 순간 켜져 있던 세로 조절이 조용히 꺼집니다.</>,
                "Don't 쪽은 두 Property가 모두 적용된 상태를 그린 것입니다. 내용에 맞춰 늘어나는 동시에 손잡이로 끌 수도 있으니 높이를 누가 정하는지 알 수 없습니다. 구현은 이 상태를 만들지 않고 resize를 무시하므로, 실제로 두 Property를 함께 넘기면 손잡이 없이 자동 확장만 남습니다. 오류로 알려주지 않아 화면을 봐야 압니다.",
              ]}
              doVisual={<PreviewLocaleScope className="w-full"><Textarea defaultValue={c.conflictValue} aria-label={c.inquiryLabel} /></PreviewLocaleScope>}
              dontVisual={<PreviewLocaleScope className="w-full"><Textarea defaultValue={c.conflictValue} autoSize resize containerClassName="resize-y" aria-label={c.inquiryLabel} /></PreviewLocaleScope>}
            />
            <div>
              <GuidelineTitle>높이가 자라면 최대 높이를 뷰포트 안에 두기</GuidelineTitle>
              <GuidelineList items={[
                <><code className="text-xs text-oe-foreground-primary">resize</code>로 사용자가 늘리는 경우와 <code className="text-xs text-oe-foreground-primary">autoSize</code>로 자동으로 자라는 경우 모두, 최대 높이가 뷰포트 높이를 넘지 않게 합니다.</>,
                "정확한 차감 값은 아직 정하지 않았습니다. 확정되기 전까지 임의의 수치를 쓰지 않습니다.",
              ]} />
            </div>
          </div>
        </Section>

        <Section id="property-map" title="Property map" description="현재 확인된 Textarea의 상위 Property와 허용 값을 정리합니다.">
          <div className="col-span-full overflow-x-auto">
            <table className="w-full min-w-[38rem] text-left text-xs">
              <thead className="border-b border-oe-border-secondary text-oe-foreground-tertiary"><tr><th className="py-2 font-medium">Property</th><th className="py-2 font-medium">Values</th><th className="py-2 font-medium">Default</th><th className="py-2 font-medium">Status</th></tr></thead>
              <tbody className="divide-y divide-oe-border-secondary text-oe-foreground-secondary">
                <MapRow property="variant" values="outline | filled" defaultValue="outline" />
                <MapRow property="autoSize" values="false | true" defaultValue="false" note="Parent property" />
                <MapRow property="resize" values="true | false" defaultValue="true" note="autoSize=false only" />
                <MapRow property="height" values="≥ 80px" defaultValue="80px" note="autoSize=false only" />
                <MapRow property="minHeight" values="80px" defaultValue="80px" note="Always applied" />
                <MapRow property="maxHeight" values="viewport − reserved layout space" defaultValue="현재 정의 없음" note="Required; value pending" />
              </tbody>
            </table>
          </div>
        </Section>
      </div>
      <OnThisPage items={textareaSections} componentKey="textarea" />
    </div>
  );
}

function TextareaAnatomy() {
  return (
    <div className="col-span-full min-w-0">
      <AnatomySurface ariaLabel="Textarea anatomy" title="Textarea structure" className="px-5 pb-5 pt-12">
        <div className="overflow-x-auto">
          <div className="relative mx-auto h-[18rem] w-[40rem] text-oe-foreground-secondary">
            <AnatomyBoundaryMarker number={1} side="top" connectorLength={50} boundaryLength={448} className="left-[310px] top-[22px]" />
            <AnatomyNumber number={2} className="left-[310px] top-[244px]" lineClassName="left-2.5 bottom-[26px] h-[72px] w-px" />

            <div className="absolute left-24 top-28 h-[5.5rem] w-[28rem] overflow-hidden rounded-lg border border-oe-border-primary bg-oe-background-primary px-3 py-2 text-sm leading-5 whitespace-pre-line text-oe-foreground-placeholder">
              여러 줄 값을 입력하는 영역입니다.
            </div>
          </div>
        </div>
      </AnatomySurface>
      <AnatomyLegend items={[{ name: "Container" }, { name: "Textarea field" }]} />
      <AnatomyDescription>
        <p><span className="font-semibold text-oe-foreground-primary">Container:</span> 전체 입력 영역입니다. 최소 높이는 88px이며 약 3.5줄의 입력 공간을 확보합니다.</p>
        <p><span className="font-semibold text-oe-foreground-primary">Textarea field:</span> 실제 여러 줄 입력 영역입니다. Auto size가 true이면 내용에 따라 Container와 함께 높이가 증가합니다.</p>
      </AnatomyDescription>
    </div>
  );
}

function ControlSection({ title, children }: { title: string; children: ReactNode }) { return <section><h4 className="mb-3 text-sm font-semibold text-oe-foreground-primary">{title}</h4><div className="space-y-3">{children}</div></section>; }

function FieldLabel({ children }: { children: ReactNode }) { return <p className="mb-1.5 text-xs font-medium text-oe-foreground-primary">{children}</p>; }

function Section({ id, title, description, children }: { id: string; title: string; description: string; children: ReactNode }) {
  return <section id={id} className="scroll-mt-20 rounded-2xl border border-oe-border-secondary bg-oe-background-primary p-5"><h3 className="text-xl font-semibold text-oe-foreground-primary">{title}</h3><p className="mt-1 text-xs leading-5 text-oe-foreground-tertiary">{description}</p><div className="mt-5 grid gap-3 @min-[720px]:grid-cols-2">{children}</div></section>;
}

function Example({ label, description, children }: { label: string; description?: string; children: ReactNode; fixed?: boolean }) {
  return <div className="flex min-h-40 flex-col gap-3 rounded-xl border border-oe-border-secondary p-4"><div><p className="text-xs font-medium text-oe-foreground-primary">{label}</p>{description ? <p className="mt-1 text-[11px] leading-4 text-oe-foreground-tertiary">{description}</p> : null}</div><PreviewLocaleScope className="mt-auto">{children}</PreviewLocaleScope></div>;
}

function Control({ label, children }: { label: string; children: ReactNode }) {
  return <fieldset><legend className="mb-2 text-[11px] font-medium text-oe-foreground-tertiary">{label}</legend><div className="flex flex-wrap gap-1.5">{children}</div></fieldset>;
}


function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
  return <div className="flex items-center justify-between gap-3"><span className="text-[11px] font-medium text-oe-foreground-tertiary">{label}</span><button type="button" role="switch" aria-checked={value} aria-label={label} onClick={() => onChange(!value)} className={`relative h-5 w-9 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-focus-ring/40 ${value ? "bg-oe-background-bold-primary" : "bg-oe-background-secondary ring-1 ring-inset ring-oe-border-primary"}`}><span className={`absolute top-0.5 size-4 rounded-full bg-oe-background-primary shadow-sm transition-[left] ${value ? "left-[18px]" : "left-0.5"}`} /></button></div>;
}

function MapRow({ property, values, defaultValue, note = "Confirmed" }: { property: string; values: string; defaultValue: string; note?: string }) {
  return <tr><td className="py-2 pr-4 font-mono text-[11px] text-oe-foreground-primary">{property}</td><td className="py-2 pr-4">{values}</td><td className="py-2 pr-4">{defaultValue}</td><td className="py-2">{note}</td></tr>;
}
