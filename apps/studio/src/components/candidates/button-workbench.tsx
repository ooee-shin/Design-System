"use client";

import { Fragment, useState, type ReactNode } from "react";
import { RiArrowRightLine, RiDownloadLine, RiFilter3Line, RiMoreLine, RiRefreshLine } from "@remixicon/react";
import { Button, Field, Input, type ButtonLayout, type ButtonSize, type ButtonTone, type ButtonVariant } from "@ooee/ui";

import { AnatomyBoundaryMarker, AnatomyFrame, AnatomyLegend, AnatomyNumber, AnatomyStructureMap, AnatomySurface } from "@/components/component-anatomy";
import { GuidelineList, GuideVisual, UsageComparison } from "@/components/component-guidelines";
import { GuidelineGroupTitle, GuidelineTitle } from "@/components/guideline-title";
import { OnThisPage } from "@/components/component-detail-navigation";
import { PreviewLocaleScope } from "@/components/preview-locale-scope";
import { PlaygroundChoice as Choice } from "@/components/playground-element-control";
import { useStudioPreferences } from "@/components/studio-preferences-provider";

const variants = ["fill", "tonal", "outline", "ghost"] as const satisfies readonly ButtonVariant[];
const tones = ["brand", "neutral", "danger", "custom"] as const satisfies readonly ButtonTone[];
const controlSizes = ["xsmall", "small", "regular", "large", "xlarge"] as const satisfies readonly ButtonSize[];
const layouts = ["hug", "fill"] as const satisfies readonly ButtonLayout[];

// 높이는 `interaction.md` 의 공통 Control Height 를 따르므로 Control 라벨에 실제 값을 함께 적는다.
// 어느 단계를 골랐는지가 폼 요소와 맞추는 판단의 근거이기 때문이다.
const sizeLabel: Record<ButtonSize, string> = {
  xsmall: "XSmall · 28",
  small: "Small · 32",
  regular: "Regular · 36",
  large: "Large · 40",
  xlarge: "XLarge · 48",
};

const sizeCardLabel: Record<ButtonSize, string> = {
  xsmall: "XSmall · 28px",
  small: "Small · 32px",
  regular: "Regular · 36px · Default",
  large: "Large · 40px",
  xlarge: "XLarge · 48px",
};

const toneLabel: Record<ButtonTone, string> = {
  brand: "Brand",
  neutral: "Neutral",
  danger: "Danger",
  custom: "Custom · Excel",
};

const toneCardLabel: Record<ButtonTone, string> = {
  brand: "Brand · Default",
  neutral: "Neutral",
  danger: "Danger",
  custom: "Custom · Excel",
};

// Playground control 의 라벨은 Badge 화면과 같은 위계로 읽히도록 같은 값을 쓴다.
const SMALL_LABEL = "text-[11px] font-medium text-oe-foreground-tertiary";

// 실제 Button 대신 도식으로 쓰는 모양이다. 높이·여백·모서리는 Regular 구현과 같게 두고 색만
// Neutral 로 낮춘다. 색이 들어가면 Anatomy 가 특정 tone 의 예시처럼 읽힌다.
const BUTTON_DIAGRAM =
  "inline-flex h-oe-control-regular items-center gap-1.5 rounded-oe-control border border-oe-border-primary bg-oe-background-primary px-3 text-sm font-medium text-oe-foreground-secondary [&_svg]:size-4";

// Focus 는 pointer 로 재현되지 않으므로 실제 Focus 에서 걸리는 것과 같은 표시를 class 로 얹는다.
// 값은 `button.tsx` 의 두 상수와 같아야 하며, outline 만 유형 1 이라 표현이 다르다.
const ADJACENT_FOCUS = "border-oe-focus-ring ring-1 ring-oe-focus-ring";
const DETACHED_FOCUS = "ring-2 ring-oe-focus-ring ring-offset-2 ring-offset-oe-background-primary";

// Style 은 강조의 세기로 갈린다. 고르는 사람이 자리마다 어느 것을 쓸지 판단할 수 있어야 하므로
// 쓰는 자리와 주의를 나눠 두고, 문구는 button.md 의 Guidelines 와 같은 내용으로 유지한다.
// Style 카드와 Guidelines 표가 같은 원본을 읽어 두 곳의 설명이 갈라지지 않게 한다.
const styleGuidance = [
  { variant: "fill", label: "Fill · Default", place: "그 화면에서 사용자가 가장 먼저 눌러야 하는 액션 하나입니다. 저장, 제출, 다음 단계가 여기에 해당합니다.", caution: "한 화면에 여럿 두면 서로 경쟁해 무엇을 먼저 눌러야 하는지 사라집니다." },
  { variant: "tonal", label: "Tonal", place: "Fill 옆에 놓이면서도 tone 색을 유지해야 하는 액션입니다. 같은 성격의 액션이 여럿일 때 그중 하나만 Fill로 두고 나머지가 씁니다.", caution: "배경색이 있는 자리에서는 옅은 배경이 Surface와 겹쳐 Container가 보이지 않습니다." },
  { variant: "outline", label: "Outline", place: "폼과 함께 놓이는 보조 액션입니다. 경계가 Input·Select와 같아 나란히 놓았을 때 선이 통일됩니다.", caution: "여러 개를 나란히 두면 경계선이 격자처럼 읽힙니다. 셋 이상이면 Ghost로 내립니다." },
  { variant: "ghost", label: "Ghost", place: "도구 모음처럼 버튼이 여러 개 늘어서는 자리입니다. 경계와 배경이 없어 아이콘만 남습니다.", caution: "경계가 없으므로 누를 수 있다는 것이 배경만으로는 드러나지 않습니다. 무엇을 하는 버튼인지는 아이콘이 책임집니다." },
] as const satisfies readonly { variant: ButtonVariant; label: string; place: string; caution: string }[];

// Guidelines 규칙 제목은 button.md 의 소제목과 같게 유지한다. 한쪽만 고치면 화면과 명세를 함께
// 보는 사람이 두 목록을 대조하지 못한다.
const commonRules = [
  {
    title: "한 화면에 Fill은 하나만 두기",
    doText: "가장 먼저 눌러야 하는 액션 하나에만 Fill을 씁니다.",
    dontText: "여러 액션에 Fill을 함께 쓰지 않습니다.",
    description: [
      "Fill은 강조를 독점하는 Style입니다. 여러 개가 같은 강조를 가지면 위계가 사라져 아무것도 강조되지 않은 것과 같아집니다.",
      "같은 성격의 액션이 여럿이면 하나만 Fill로 두고 나머지는 Tonal이나 Outline으로 내립니다.",
    ],
  },
  {
    title: "Danger는 되돌릴 수 없는 액션에만 쓰기",
    doText: "되돌릴 수 없는 액션에만 Danger를 씁니다.",
    dontText: "되돌릴 수 있는 액션에는 Danger를 쓰지 않습니다.",
    description: [
      "Danger는 누르면 되돌릴 수 없다는 경고입니다. 삭제, 영구 폐기, 되돌릴 수 없는 전송이 여기에 해당합니다.",
      "취소나 닫기처럼 아무것도 잃지 않는 액션에는 쓰지 않습니다. 붉은 버튼이 둘 나란히 놓이면 경고가 뜻을 잃습니다.",
    ],
  },
  {
    title: "중립으로 읽혀야 하는 자리는 tone을 밝혀 적기",
    doText: "중립으로 읽혀야 하는 자리에는 Neutral을 지정합니다.",
    dontText: "기본값 Brand를 그대로 두지 않습니다.",
    description: [
      "`tone`의 기본값은 `brand`이며 Outline과 Ghost에서도 그 색을 따라갑니다. 아무것도 적지 않으면 도구 모음의 아이콘까지 브랜드 색이 됩니다.",
      "무엇을 강조하려는 것이 아니라 조작할 수단을 늘어놓는 자리라면 `tone=\"neutral\"`을 밝혀 적습니다.",
    ],
  },
] as const;

const sections = [
  { id: "playground", label: "Playground" },
  { id: "anatomy", label: "Anatomy" },
  { id: "style", label: "Style" },
  { id: "size", label: "Size" },
  { id: "color", label: "Color" },
  { id: "layout", label: "Layout" },
  { id: "state", label: "State" },
  { id: "elements", label: "Elements" },
  { id: "guidelines", label: "Guidelines" },
  { id: "property-map", label: "Property map" },
];

const copy = {
  ko: {
    save: "저장",
    cancel: "취소",
    close: "닫기",
    remove: "삭제",
    publish: "게시",
    duplicate: "복제",
    share: "공유",
    download: "엑셀 내려받기",
    reset: "초기화",
    filter: "필터",
    more: "더 보기",
    next: "다음",
    submit: "제출",
    emailLabel: "이메일",
    emailPlaceholder: "name@example.com",
  },
  en: {
    save: "Save",
    cancel: "Cancel",
    close: "Close",
    remove: "Delete",
    publish: "Publish",
    duplicate: "Duplicate",
    share: "Share",
    download: "Download as Excel",
    reset: "Reset",
    filter: "Filter",
    more: "More",
    next: "Next",
    submit: "Submit",
    emailLabel: "Email",
    emailPlaceholder: "name@example.com",
  },
} as const;

export function ButtonWorkbench() {
  const { locale } = useStudioPreferences();
  const c = copy[locale];
  const [variant, setVariant] = useState<ButtonVariant>("fill");
  const [tone, setTone] = useState<ButtonTone>("brand");
  const [controlSize, setControlSize] = useState<ButtonSize>("regular");
  const [layout, setLayout] = useState<ButtonLayout>("hug");
  const [disabled, setDisabled] = useState(false);
  const [label, setLabel] = useState(true);
  const [leadingIcon, setLeadingIcon] = useState(false);
  const [trailingIcon, setTrailingIcon] = useState(false);

  // Label 을 끄면 아이콘만 남는 정사각형 버튼이 된다. 그 버튼의 아이콘은 가운데 하나뿐이라 앞뒤가
  // 없으므로 두 아이콘 control 을 함께 걷어낸다. 이때는 접근 가능한 이름이 사라지므로 `aria-label`
  // 을 함께 넘긴다.
  const iconOnly = !label;
  const showLeading = iconOnly || leadingIcon;
  const showTrailing = !iconOnly && trailingIcon;

  const shared = {
    variant,
    controlSize,
    layout,
    disabled,
    leadingIcon: showLeading ? <RiDownloadLine /> : undefined,
    trailingIcon: showTrailing ? <RiArrowRightLine /> : undefined,
    "aria-label": iconOnly ? "Download" : undefined,
    children: label ? "Label" : undefined,
  };

  return (
    <div className="grid items-start gap-6 @min-[1120px]:grid-cols-[minmax(0,1fr)_11rem]">
      <div className="min-w-0 space-y-5">
        <Section id="playground" title="🚩 Playground" description="Style과 Size, Tone, Layout과 두 아이콘을 조합해 확인합니다. 높이는 폼 요소와 같은 공통 Control Height를 따릅니다. Label을 끄면 아이콘 하나만 남는 정사각형 버튼이 됩니다. 그 아이콘은 가운데 하나뿐이라 앞뒤가 없으므로 두 아이콘 control도 함께 사라집니다.">
          <div className="col-span-full grid gap-5 rounded-xl border-2 border-oe-border-bold-primary bg-oe-background-secondary p-4 @min-[760px]:grid-cols-[minmax(14rem,1fr)_16rem]">
            <div lang="en" className="flex min-h-44 items-center justify-center rounded-xl bg-oe-background-primary p-5">
              <div className="flex w-full items-center justify-center">
                {tone === "custom" ? <Button tone="custom" color="excel" {...shared} /> : <Button tone={tone} {...shared} />}
              </div>
            </div>
            <div className="space-y-5 rounded-xl bg-oe-background-primary p-4">
              <ControlSection title="Appearance">
                <ControlGroup label="Style">{variants.map((item) => <Choice key={item} active={variant === item} onClick={() => setVariant(item)}>{capitalize(item)}</Choice>)}</ControlGroup>
                <ControlGroup label="Size">{controlSizes.map((item) => <Choice key={item} active={controlSize === item} onClick={() => setControlSize(item)}>{sizeLabel[item]}</Choice>)}</ControlGroup>
                <ControlGroup label="Tone">{tones.map((item) => <Choice key={item} active={tone === item} onClick={() => setTone(item)}>{toneLabel[item]}</Choice>)}</ControlGroup>
                <ControlGroup label="Layout">{layouts.map((item) => <Choice key={item} active={layout === item} onClick={() => setLayout(item)}>{capitalize(item)}</Choice>)}</ControlGroup>
              </ControlSection>
              <ControlSection title="State">
                <Toggle label="Disabled" value={disabled} onChange={setDisabled} />
              </ControlSection>
              <ControlSection title="Elements">
                <Toggle label="Label" value={label} onChange={setLabel} />
                {iconOnly ? null : (
                  <>
                    <Toggle label="Leading icon" value={leadingIcon} onChange={setLeadingIcon} />
                    <Toggle label="Trailing icon" value={trailingIcon} onChange={setTrailingIcon} />
                  </>
                )}
              </ControlSection>
            </div>
          </div>
        </Section>

        <Section id="anatomy" title="Anatomy" description="Button을 구성하는 실제 요소와 문서에서 사용하는 명칭입니다.">
          <div className="col-span-full min-w-0">
            <AnatomySurface ariaLabel="Button anatomy" title="Button structure" className="px-5 pb-5 pt-12">
              <div lang="en" className="flex h-36 items-center justify-center">
                <AnatomyFrame>
                  <span data-slot="button" className={BUTTON_DIAGRAM}>
                    <span data-slot="button-leading-icon" className="flex shrink-0 items-center">
                      <RiDownloadLine aria-hidden="true" />
                    </span>
                    <span data-slot="button-label" className="block truncate">Label</span>
                    <span data-slot="button-trailing-icon" className="flex shrink-0 items-center">
                      <RiArrowRightLine aria-hidden="true" />
                    </span>
                  </span>
                  <AnatomyBoundaryMarker number={1} target="[data-slot=button]" side="left" connectorLength={36} />
                  <AnatomyNumber number={2} target="[data-slot=button-leading-icon]" side="bottom" />
                  <AnatomyNumber number={3} target="[data-slot=button-label]" side="top" />
                  <AnatomyNumber number={4} target="[data-slot=button-trailing-icon]" side="bottom" />
                </AnatomyFrame>
              </div>
            </AnatomySurface>
            <AnatomyLegend items={[{ name: "Container" }, { name: "Leading icon", optional: true }, { name: "Label" }, { name: "Trailing icon", optional: true }]} />

            <div className="mt-4">
              <AnatomyStructureMap lines={[
                { name: "Button" },
                { prefix: "├─ ", name: "Leading icon", optional: true },
                { prefix: "├─ ", name: "Label" },
                { prefix: "└─ ", name: "Trailing icon", optional: true },
              ]} />
            </div>
          </div>
        </Section>

        <Section id="style" title="Properties · Style" description="Fill, Tonal, Outline, Ghost 넷을 제공하며 기본값은 Fill입니다. 강조가 센 쪽부터 약한 쪽 순서입니다. 어느 자리에 무엇을 쓰는지는 Guidelines에 있습니다.">
          {styleGuidance.map(({ variant: item, label: cardLabel }) => (
            <Example key={item} label={cardLabel}>
              <div className="flex flex-wrap items-center gap-1.5">
                <Button variant={item}>{c.save}</Button>
                <Button variant={item} tone="neutral">{c.cancel}</Button>
                <Button variant={item} tone="danger">{c.remove}</Button>
              </div>
            </Example>
          ))}
        </Section>

        <Section id="size" title="Properties · Size" description="XSmall부터 XLarge까지 다섯 단계를 제공하며 기본값은 Regular입니다. 값은 interaction.md의 공통 Control Height를 따릅니다.">
          {controlSizes.map((item) => (
            <Example key={item} label={sizeCardLabel[item]}>
              <div className="flex flex-wrap items-center gap-1.5">
                <Button controlSize={item}>{c.save}</Button>
                <Button controlSize={item} variant="outline" tone="neutral">{c.cancel}</Button>
              </div>
            </Example>
          ))}
        </Section>

        <Section id="color" title="Properties · Color" description="tone 넷과 Style 넷의 조합입니다. Custom이 지금 제공하는 색은 엑셀 하나입니다.">
          <div lang="en" className="col-span-full min-w-0 overflow-x-auto">
            <ColorGrid rows={tones} render={(rowTone, rowVariant) => rowTone === "custom"
              ? <Button tone="custom" color="excel" variant={rowVariant}>Label</Button>
              : <Button tone={rowTone} variant={rowVariant}>Label</Button>} />
          </div>
        </Section>

        <Section id="layout" title="Properties · Layout" description="Hug와 Fill 둘을 제공하며 기본값은 Hug입니다. 값의 뜻은 interaction.md의 「공통 너비 Layout」이 소유합니다.">
          <Example label="Hug · Default" description="내용에 맞춘 너비입니다.">
            <div className="flex w-full flex-wrap items-center gap-1.5">
              <Button layout="hug">{c.save}</Button>
              <Button layout="hug" variant="outline" tone="neutral">{c.cancel}</Button>
            </div>
          </Example>
          <Example label="Fill" description="부모가 제공하는 너비를 채웁니다.">
            <div className="w-full">
              <Button layout="fill" controlSize="xlarge">{c.submit}</Button>
            </div>
          </Example>
        </Section>

        <Section id="state" title="Properties · State" description="Default, Focus visible과 Disabled입니다. Hover와 Pressed는 각 카드에서 직접 눌러 확인합니다.">
          <Example label="Default"><Button>{c.save}</Button></Example>
          <Example label="Focus visible · Fill" description="간격을 두고 바깥에 ring을 그립니다.">
            <Button className={DETACHED_FOCUS}>{c.save}</Button>
          </Example>
          <Example label="Focus visible · Outline" description="기존 경계를 Focus 색으로 바꿉니다.">
            <Button variant="outline" tone="neutral" className={ADJACENT_FOCUS}>{c.cancel}</Button>
          </Example>
          <Example label="Disabled" description="tone 색을 걷어내고 Outline은 Neutral 경계로 바꿉니다.">
            <div className="flex flex-wrap items-center gap-1.5">
              <Button disabled>{c.save}</Button>
              <Button variant="outline" tone="danger" disabled>{c.remove}</Button>
            </div>
          </Example>
          <div className="col-span-full">
            <Example label="현재 정의 없음" description="지금 구현과 정책에 없는 상태입니다.">
              <GuidelineList className="" items={["Loading", "Read only", "Invalid"]} />
            </Example>
          </div>
        </Section>

        <Section id="elements" title="Properties · Elements" description="Label 앞뒤에 아이콘을 둘 수 있습니다. leadingIcon과 trailingIcon으로 받습니다.">
          <Example label="Leading icon" description="Label 앞에 놓습니다.">
            <Button variant="outline" tone="neutral" leadingIcon={<RiDownloadLine />}>{c.duplicate}</Button>
          </Example>
          <Example label="Trailing icon" description="Label 뒤에 놓습니다.">
            <Button trailingIcon={<RiArrowRightLine />}>{c.next}</Button>
          </Example>
          <Example label="Leading과 Trailing 함께" description="Label 앞뒤에 하나씩 놓습니다.">
            <Button variant="outline" tone="neutral" leadingIcon={<RiRefreshLine />} trailingIcon={<RiArrowRightLine />}>{c.reset}</Button>
          </Example>
          <Example label="Label 없이 아이콘만" description="높이와 같은 너비를 가진 정사각형이 됩니다.">
            <div className="flex flex-wrap items-center gap-1.5">
              <Button variant="ghost" tone="neutral" aria-label={c.filter} leadingIcon={<RiFilter3Line />} />
              <Button variant="ghost" tone="neutral" aria-label={c.more} leadingIcon={<RiMoreLine />} />
              <Button variant="outline" tone="neutral" aria-label={c.reset} leadingIcon={<RiRefreshLine />} />
            </div>
          </Example>
        </Section>

        <Section id="guidelines" title="Guidelines" description="이 컴포넌트를 쓸 자리인지 가리는 조건, 어느 Style을 고르는지, 그리고 어느 자리에서나 지키는 규칙을 정리합니다.">
          <div className="col-span-full grid min-w-0 gap-8 [&>*]:min-w-0">
            <div>
              <GuidelineGroupTitle>어느 자리에 Button을 쓰는지 가리기</GuidelineGroupTitle>
              <div className="mt-4">
                <GuidelineTitle>액션을 실행하는 자리에만 쓰기</GuidelineTitle>
                <GuidelineList items={[
                  "누르면 무언가가 실행되는 자리에 씁니다. 저장, 제출, 삭제, 내려받기와 화면 이동이 여기에 해당합니다.",
                  "값을 입력받거나 고르는 자리에는 Input Button을 씁니다. 달력이나 주소 검색을 여는 것처럼 결과가 값으로 남으면 그쪽입니다. 실제 HTML 요소는 둘 다 button이므로, 가르는 기준은 태그가 아니라 값을 다루는지 여부입니다.",
                  "여러 개를 켜고 끄며 조건을 좁히는 자리에는 Chip을 씁니다. 아무것도 켜지지 않은 상태가 기본이고 켠 것이 값으로 남습니다.",
                  "누르지 않는 표시에는 Badge를 씁니다. Badge는 interaction Property를 갖지 않으며 Hover와 Pressed 표시도 없습니다.",
                ]} />
              </div>
            </div>

            <div>
              <GuidelineGroupTitle>어느 Style을 고르는지 가리기</GuidelineGroupTitle>
              <p className="mt-2 text-sm leading-6 text-oe-foreground-secondary">넷은 강조의 세기로 갈립니다. 주목도는 Fill이 가장 높고 Ghost가 가장 낮으며, tone은 강조의 세기를 바꾸지 않고 색만 정합니다.</p>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[40rem] text-left text-xs">
                  <thead className="border-b border-oe-border-secondary text-oe-foreground-tertiary"><tr><th className="w-36 py-2 font-medium">스타일</th><th className="py-2 font-medium">쓰는 자리</th><th className="py-2 font-medium">주의</th></tr></thead>
                  <tbody className="divide-y divide-oe-border-secondary text-oe-foreground-secondary">
                    {styleGuidance.map(({ variant: item, label: rowLabel, place, caution }) => (
                      <tr key={item}>
                        <td className="py-3 pr-4 align-top"><div className="font-medium text-oe-foreground-primary">{rowLabel}</div><PreviewLocaleScope className="mt-1.5"><Button variant={item} controlSize="xsmall">{c.save}</Button></PreviewLocaleScope></td>
                        <td className="py-3 pr-4 align-top leading-5">{place}</td>
                        <td className="py-3 align-top leading-5">{caution}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <GuidelineGroupTitle>어느 자리에서나 지키기</GuidelineGroupTitle>
              <div className="mt-4 grid gap-8">
                <UsageComparison
                  title={commonRules[0].title}
                  doText={commonRules[0].doText}
                  dontText={commonRules[0].dontText}
                  description={[...commonRules[0].description]}
                  doVisual={<PreviewLocaleScope className="flex flex-wrap items-center justify-center gap-1.5"><Button>{c.publish}</Button><Button variant="outline" tone="neutral">{c.duplicate}</Button><Button variant="outline" tone="neutral">{c.share}</Button></PreviewLocaleScope>}
                  dontVisual={<PreviewLocaleScope className="flex flex-wrap items-center justify-center gap-1.5"><Button>{c.publish}</Button><Button>{c.duplicate}</Button><Button>{c.share}</Button></PreviewLocaleScope>}
                />
                <UsageComparison
                  title={commonRules[1].title}
                  doText={commonRules[1].doText}
                  dontText={commonRules[1].dontText}
                  description={[...commonRules[1].description]}
                  doVisual={<PreviewLocaleScope className="flex flex-wrap items-center justify-center gap-1.5"><Button variant="outline" tone="neutral">{c.cancel}</Button><Button tone="danger">{c.remove}</Button></PreviewLocaleScope>}
                  dontVisual={<PreviewLocaleScope className="flex flex-wrap items-center justify-center gap-1.5"><Button variant="outline" tone="neutral">{c.cancel}</Button><Button tone="danger">{c.close}</Button></PreviewLocaleScope>}
                />
                <UsageComparison
                  title={commonRules[2].title}
                  doText={commonRules[2].doText}
                  dontText={commonRules[2].dontText}
                  description={[...commonRules[2].description]}
                  doVisual={<PreviewLocaleScope className="flex items-center justify-center gap-1"><Button variant="ghost" tone="neutral" leadingIcon={<RiFilter3Line />}>{c.filter}</Button><Button variant="ghost" tone="neutral" aria-label={c.reset} leadingIcon={<RiRefreshLine />} /><Button variant="ghost" tone="neutral" aria-label={c.more} leadingIcon={<RiMoreLine />} /></PreviewLocaleScope>}
                  dontVisual={<PreviewLocaleScope className="flex items-center justify-center gap-1"><Button variant="ghost" leadingIcon={<RiFilter3Line />}>{c.filter}</Button><Button variant="ghost" aria-label={c.reset} leadingIcon={<RiRefreshLine />} /><Button variant="ghost" aria-label={c.more} leadingIcon={<RiMoreLine />} /></PreviewLocaleScope>}
                />

                <div>
                  <GuidelineTitle>XSmall에서는 Label과 아이콘 중 하나만 두기를 먼저 보기</GuidelineTitle>
                  <div className="mt-3 grid gap-3 @min-[720px]:grid-cols-2">
                    <GuideVisual label="하나만 두기 · 권장">
                      <PreviewLocaleScope className="flex w-full flex-wrap items-center justify-center gap-1.5">
                        <Button controlSize="xsmall" variant="outline" tone="neutral">{c.duplicate}</Button>
                        <Button controlSize="xsmall" variant="outline" tone="neutral" aria-label={c.download} leadingIcon={<RiDownloadLine />} />
                      </PreviewLocaleScope>
                    </GuideVisual>
                    <GuideVisual label="함께 두기">
                      <PreviewLocaleScope className="flex w-full flex-wrap items-center justify-center gap-1.5">
                        <Button controlSize="xsmall" variant="outline" tone="neutral" leadingIcon={<RiDownloadLine />}>{c.duplicate}</Button>
                      </PreviewLocaleScope>
                    </GuideVisual>
                  </div>
                  <GuidelineList items={[
                    "XSmall에서는 아이콘이 Label보다 작습니다. 그러면 액션을 가리키는 표시가 아니라 글자 앞의 장식처럼 보이고, 좁은 좌우 여백을 아이콘이 나눠 쓰는 만큼 Label에 남는 폭도 줄어듭니다.",
                    "그래서 아이콘만 있는 정사각형 버튼이나 Label만 있는 버튼을 먼저 봅니다. 도구 모음이 실제로 앞쪽을 씁니다.",
                    "막는 규칙은 아닙니다. 표의 행 안처럼 높이를 올릴 수 없는데 아이콘이 있어야 뜻이 통하는 자리라면 함께 두어도 됩니다. 그런 제약이 없다면 아이콘이 커지는 Small부터 씁니다.",
                  ]} />
                </div>

                <div>
                  <GuidelineTitle>아이콘만 있는 버튼에는 접근 가능한 이름 주기</GuidelineTitle>
                  <GuidelineList items={[
                    "Label이 없으면 화면에 읽을 글자가 남지 않으므로 aria-label로 그 버튼이 무엇을 하는지 전달합니다.",
                    "아이콘 하나로 뜻이 통하지 않는 액션은 Label을 함께 둡니다. 아이콘은 이미 알고 있는 액션을 빨리 찾게 하는 것이며, 처음 보는 액션을 설명하지는 못합니다.",
                  ]} />
                </div>

                <UsageComparison
                  title="폼 안에서는 Control과 같은 Size 쓰기"
                  doText="Control과 같은 크기를 씁니다."
                  dontText="Control과 다른 크기를 쓰지 않습니다."
                  description={[
                    "폼 안에 나란히 놓이는 Control과 Button은 같은 크기를 씁니다.",
                    "크기는 Field가 강제하지 않고 각 Control과 Button이 각자 소유하므로 함께 정해야 합니다. 모바일 폼은 Large 이상을 씁니다.",
                  ]}
                  doVisual={<PreviewLocaleScope className="flex w-full flex-wrap items-end gap-1.5"><Field label={c.emailLabel} className="min-w-40 flex-1"><Input controlSize="large" placeholder={c.emailPlaceholder} /></Field><Button controlSize="large">{c.submit}</Button></PreviewLocaleScope>}
                  dontVisual={<PreviewLocaleScope className="flex w-full flex-wrap items-end gap-1.5"><Field label={c.emailLabel} className="min-w-40 flex-1"><Input controlSize="large" placeholder={c.emailPlaceholder} /></Field><Button controlSize="regular">{c.submit}</Button></PreviewLocaleScope>}
                />
              </div>
            </div>
          </div>
        </Section>

        <Section id="property-map" title="Property map" description="실제 Props와 기본값입니다. Color는 Tone이 Custom일 때만 뜻을 가지므로 다른 Tone과 함께 넘기면 타입에서 걸립니다.">
          <div className="col-span-full overflow-x-auto">
            <table className="w-full min-w-[38rem] text-left text-xs">
              <thead className="border-b border-oe-border-secondary text-oe-foreground-tertiary"><tr><th className="py-2 font-medium">Property</th><th className="py-2 font-medium">Values</th><th className="py-2 font-medium">Default</th></tr></thead>
              <tbody className="divide-y divide-oe-border-secondary text-oe-foreground-secondary">
                <MapRow property="variant" values="fill | tonal | outline | ghost" defaultValue="fill" />
                <MapRow property="tone" values="brand | neutral | danger | custom" defaultValue="brand" />
                <MapRow property="color" values="excel (tone=custom 전용)" defaultValue="undefined" />
                <MapRow property="controlSize" values="xsmall (28px) | small (32px) | regular (36px) | large (40px) | xlarge (48px)" defaultValue="regular" />
                <MapRow property="layout" values="hug | fill" defaultValue="hug" />
                <MapRow property="leadingIcon" values="ReactNode" defaultValue="undefined" />
                <MapRow property="trailingIcon" values="ReactNode" defaultValue="undefined" />
                <MapRow property="children" values="ReactNode (Label)" defaultValue="undefined" />
                <MapRow property="disabled" values="false | true" defaultValue="false" />
                <MapRow property="type" values="button | submit | reset" defaultValue="button" />
                <MapRow property="className" values="string" defaultValue="undefined" />
                <MapRow property="render" values="ReactElement | ComponentRenderFn" defaultValue="undefined" />
              </tbody>
            </table>
          </div>
        </Section>
      </div>
      <OnThisPage items={sections} componentKey="button" />
    </div>
  );
}

function MapRow({ property, values, defaultValue }: { property: string; values: string; defaultValue: string }) { return <tr><td className="py-3 pr-4 font-mono text-[11px] text-oe-foreground-primary">{property}</td><td className="py-3 pr-4 font-mono text-[11px]">{values}</td><td className="py-3 font-mono text-[11px]">{defaultValue}</td></tr>; }

function ColorGrid({ rows, render }: { rows: readonly ButtonTone[]; render: (tone: ButtonTone, variant: ButtonVariant) => ReactNode }) {
  return (
    <div className="grid w-fit grid-cols-[7rem_repeat(4,7rem)] items-center gap-x-4 gap-y-2.5">
      <span />
      {variants.map((item) => <span key={item} className={SMALL_LABEL}>{capitalize(item)}</span>)}
      {rows.map((row) => (
        <Fragment key={row}>
          <span className={SMALL_LABEL}>{toneCardLabel[row]}</span>
          {variants.map((item) => <div key={item}>{render(row, item)}</div>)}
        </Fragment>
      ))}
    </div>
  );
}

function Example({ label, description, children }: { label: string; description?: string; children: ReactNode }) { return <div className="flex min-h-32 min-w-0 flex-col gap-3 rounded-xl border border-oe-border-secondary p-4"><div><p className="text-xs font-medium text-oe-foreground-primary">{label}</p>{description ? <p className="mt-1 text-[11px] leading-4 text-oe-foreground-tertiary">{description}</p> : null}</div><PreviewLocaleScope className="mt-auto">{children}</PreviewLocaleScope></div>; }
function Section({ id, title, description, children }: { id: string; title: string; description: string; children: ReactNode }) { return <section id={id} className="scroll-mt-20 rounded-2xl border border-oe-border-secondary bg-oe-background-primary p-5"><h3 className="text-xl font-semibold text-oe-foreground-primary">{title}</h3><p className="mt-1 text-xs leading-5 text-oe-foreground-tertiary">{description}</p><div className="mt-5 grid gap-3 @min-[720px]:grid-cols-2">{children}</div></section>; }
function ControlSection({ title, children }: { title: string; children: ReactNode }) { return <section><h4 className="mb-3 text-sm font-semibold text-oe-foreground-primary">{title}</h4><div className="space-y-3">{children}</div></section>; }
function ControlGroup({ label, children }: { label: string; children: ReactNode }) { return <fieldset><legend className={`mb-2 ${SMALL_LABEL}`}>{label}</legend><div className="flex flex-wrap gap-1.5">{children}</div></fieldset>; }
function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) { return <div className="flex items-center justify-between gap-3"><span className={SMALL_LABEL}>{label}</span><button type="button" role="switch" aria-checked={value} aria-label={label} onClick={() => onChange(!value)} className={`relative h-5 w-9 shrink-0 rounded-full ${value ? "bg-oe-background-bold-primary" : "bg-oe-background-secondary ring-1 ring-inset ring-oe-border-primary"}`}><span className={`absolute top-0.5 size-4 rounded-full bg-oe-background-primary shadow-sm transition-[left] ${value ? "left-[18px]" : "left-0.5"}`} /></button></div>; }
function capitalize(value: string) { return value.charAt(0).toUpperCase() + value.slice(1); }
