"use client";

import { Fragment, useState, type ReactNode } from "react";
import { RiArchiveFill, RiArchiveLine, RiBookmarkFill, RiBookmarkLine, RiFolderFill, RiFolderLine, RiHeartFill, RiHeartLine, RiNotification3Fill, RiNotification3Line, RiPushpin2Fill, RiPushpin2Line, RiSearchFill, RiSearchLine, RiStarFill, RiStarLine, RiThumbUpFill, RiThumbUpLine } from "@remixicon/react";
import { TOGGLE_BUTTON_COLORS, ToggleButton, type ToggleButtonColor, type ToggleButtonSize, type ToggleButtonVariant } from "@ooee/ui";

import { AnatomyBoundaryMarker, AnatomyFrame, AnatomyLegend, AnatomyNumber, AnatomyStructureMap, AnatomySurface } from "@/components/component-anatomy";
import { GuidelineList, GuideVisual, UsageComparison } from "@/components/component-guidelines";
import { GuidelineTitle } from "@/components/guideline-title";
import { OnThisPage } from "@/components/component-detail-navigation";
import { PreviewLocaleScope } from "@/components/preview-locale-scope";
import { DependentControlGroup, PlaygroundChoice as Choice } from "@/components/playground-element-control";
import { cn } from "@/lib/utils";
import { useStudioPreferences } from "@/components/studio-preferences-provider";

const variants = ["ghost", "tonal"] as const satisfies readonly ToggleButtonVariant[];
const controlSizes = ["xsmall", "small", "regular", "large", "xlarge"] as const satisfies readonly ToggleButtonSize[];

// Tone control 은 실제 Property 값인 Brand 와 Custom 둘만 늘어놓고, Color 는 Custom 을 고른
// 뒤에만 종속 Control 로 나타낸다. `color` 는 `tone="custom"` 에서만 뜻을 가지므로 두 축을
// 한 줄로 펼치면 화면의 목록이 실제 Property 와 어긋난다.
const tones = ["brand", "custom"] as const;

type ToneChoice = (typeof tones)[number];

const toneLabel: Record<ToneChoice, string> = {
  brand: "Brand",
  custom: "Custom",
};

const colors = TOGGLE_BUTTON_COLORS;

const colorLabel: Record<ToggleButtonColor, string> = {
  favorite: "Favorite",
  like: "Like",
};

// `tone` 과 `color` 는 타입으로 갈라져 있어 하나의 객체로 펼치면 타입이 맞지 않는다. 고른 값에
// 따라 실제 Property 조합을 만들어 넘긴다.
function toneProps(tone: ToneChoice, color: ToggleButtonColor) {
  if (tone === "brand") return { tone: "brand" } as const;
  return { tone: "custom", color } as const;
}

// 조합마다 실제로 쓰이는 자리가 정해져 있으므로 미리보기 아이콘도 그 자리를 따라 바꾼다. 어느
// 조합에서나 별 하나를 그리면 Tonal 이 무엇을 알리는 Style 인지 화면에서 드러나지 않는다.
// Tonal 과 Brand 는 영역을 여는 자리라 검색을 쓰고, Custom 은 두 Style 모두 그 색이 굳어진
// 아이콘을 쓴다. 자리의 뜻은 `toggle-button.md` 의 Guidelines 가 소유한다.
// Tonal 은 아이콘 하나만 받으므로 `Fill` 짝을 넘기지 않는다.
const usages = {
  pin: { icon: <RiPushpin2Line />, activeIcon: <RiPushpin2Fill />, name: "Pin" },
  favorite: { icon: <RiStarLine />, activeIcon: <RiStarFill />, name: "Favorite" },
  like: { icon: <RiHeartLine />, activeIcon: <RiHeartFill />, name: "Wish" },
  search: { icon: <RiSearchLine />, activeIcon: <RiSearchFill />, name: "Search" },
} as const;

function usageOf(variant: ToggleButtonVariant, tone: ToneChoice, color: ToggleButtonColor) {
  if (tone === "custom") return color === "like" ? usages.like : usages.favorite;
  return variant === "tonal" ? usages.search : usages.pin;
}

// 높이는 `interaction.md` 의 공통 Control Height 를 따르므로 Control 라벨에 실제 값을 함께 적는다.
// 어느 단계를 골랐는지가 Button 과 나란히 놓는 판단의 근거이기 때문이다.
const sizeLabel: Record<ToggleButtonSize, string> = {
  xsmall: "XSmall · 28",
  small: "Small · 32",
  regular: "Regular · 36",
  large: "Large · 40",
  xlarge: "XLarge · 48",
};

const SMALL_LABEL = "text-[11px] font-medium text-oe-foreground-tertiary";

// 예시 안의 콘텐츠는 문구 대신 자리만 표시한다. 실제 문장을 두면 그 문장이 예시의 주제처럼
// 읽혀 무엇을 견주는 카드인지 흐려진다. 층위는 셋으로 고정한다. 제목 줄, 본문 줄, 열린 영역이며
// 카드마다 굵기를 달리하면 같은 자리를 가리키는 표시가 카드마다 다르게 읽힌다.
const SKELETON_TITLE = "h-3";
const SKELETON_BODY = "h-2.5";

// Do 와 Don't 카드는 같은 높이로 선다. 카드마다 높이가 달라지면 아래위로 이어지는 규칙들이
// 들쭉날쭉해져 무엇을 견주는 자리인지보다 상자 크기가 먼저 눈에 들어온다.
const GUIDE_BOX = "flex min-h-28 w-full";

const ROW_WIDTHS = ["w-1/2", "w-2/3", "w-2/5"] as const;

// 실제 ToggleButton 대신 도식으로 쓰는 모양이다. 높이·여백·모서리는 Regular 구현과 같게 두고
// 색만 Neutral 로 낮춘다. 색이 들어가면 Anatomy 가 특정 tone 의 예시처럼 읽힌다. 배경과 경계는
// 두지 않는다. 기본값인 Ghost 는 꺼짐에 둘 다 없으므로, 도식에 상자를 그리면 이 컴포넌트가
// 갖지 않는 모양을 구조로 설명하게 된다. Container 의 범위는 경계선이 아니라 1 번 표시가 알린다.
const TOGGLE_DIAGRAM =
  "inline-flex h-oe-control-regular items-center gap-1 rounded-oe-control pl-3 pr-3.5 text-sm font-medium text-oe-foreground-secondary [&_svg]:size-4";

const sizeCardLabel: Record<ToggleButtonSize, string> = {
  xsmall: "XSmall · 28px",
  small: "Small · 32px",
  regular: "Regular · 36px · Default",
  large: "Large · 40px",
  xlarge: "XLarge · 48px",
};

// Color 표는 두 축을 곱한 결과를 한 번에 보여 주는 자리이므로 실제로 만들어지는 조합을 행으로
// 늘어놓는다.
const colorRows = ["brand", "favorite", "like"] as const;

type ColorRow = (typeof colorRows)[number];

const colorRowLabel: Record<ColorRow, string> = {
  brand: "Brand · Default",
  favorite: "Custom · Favorite",
  like: "Custom · Like",
};

function rowProps(row: ColorRow) {
  if (row === "brand") return { tone: "brand" } as const;
  return { tone: "custom", color: row } as const;
}

// Focus 는 pointer 로 재현되지 않으므로 실제 Focus 에서 걸리는 것과 같은 표시를 class 로 얹는다.
// 값은 `toggle-button.tsx` 의 상수와 같아야 한다.
const DETACHED_FOCUS = "ring-2 ring-oe-focus-ring ring-offset-2 ring-offset-oe-background-primary";

const sections = [
  { id: "playground", label: "Playground" },
  { id: "anatomy", label: "Anatomy" },
  { id: "style", label: "Style" },
  { id: "size", label: "Size" },
  { id: "color", label: "Color" },
  { id: "state", label: "State" },
  { id: "elements", label: "Elements" },
  { id: "guidelines", label: "Guidelines" },
  { id: "property-map", label: "Property map" },
];

const copy = {
  ko: {
    favorite: "즐겨찾기",
    like: "찜",
    pin: "고정",
    search: "검색",
    notify: "알림",
    save: "저장",
    archive: "보관",
    collect: "모아 두기",
    good: "좋아요",
  },
  en: {
    favorite: "Favorite",
    like: "Wish",
    pin: "Pin",
    search: "Search",
    notify: "Notify",
    save: "Save",
    archive: "Archive",
    collect: "Collect",
    good: "Like",
  },
} as const;

export function ToggleButtonWorkbench() {
  const { locale } = useStudioPreferences();
  const c = copy[locale];
  const [variant, setVariant] = useState<ToggleButtonVariant>("ghost");
  const [tone, setTone] = useState<ToneChoice>("brand");
  const [color, setColor] = useState<ToggleButtonColor>("favorite");
  const [controlSize, setControlSize] = useState<ToggleButtonSize>("regular");
  const [pressed, setPressed] = useState(false);
  const [showCount, setShowCount] = useState(false);
  const [count, setCount] = useState(128);

  const usage = usageOf(variant, tone, color);

  // 숫자를 움직이는 것은 컴포넌트가 아니라 소비자다. 실제 개수는 서버가 갖고 있으므로 여기서도
  // 켜지면 하나 더하고 꺼지면 하나 빼서 다시 넘기는 방식을 그대로 보여 준다.
  function handlePressedChange(next: boolean) {
    setPressed(next);
    setCount((current) => current + (next ? 1 : -1));
  }

  // 숫자는 그 버튼이 무엇을 켜는지 말해 주지 못하므로 `aria-label` 은 count 가 있어도 함께 넘긴다.
  // `variant` 마다 받는 아이콘 수가 다르므로 하나의 객체로 펼치지 않고 갈라서 넘긴다.
  const shared = {
    controlSize,
    pressed,
    onPressedChange: handlePressedChange,
    count: showCount ? count : undefined,
    "aria-label": usage.name,
  };

  return (
    <div className="grid items-start gap-6 @min-[1120px]:grid-cols-[minmax(0,1fr)_11rem]">
      <div className="min-w-0 space-y-5">
        <Section id="playground" title="🚩 Playground" description="Style과 Size, Tone과 켜짐 상태를 조합해 확인합니다. 조합마다 그 자리에 실제로 쓰는 아이콘으로 함께 바뀝니다. Ghost는 켜지면 아이콘이 Fill로 바뀌고 Tonal은 아이콘을 그대로 둔 채 배경이 생깁니다. Count를 켜면 누를 때마다 개수가 하나씩 오르내립니다. 높이는 Button과 같은 공통 Control Height를 따르며, 미리보기의 버튼을 직접 눌러도 Pressed가 바뀝니다.">
          <div className="col-span-full grid gap-5 rounded-xl border-2 border-oe-border-bold-primary bg-oe-background-secondary p-4 @min-[760px]:grid-cols-[minmax(14rem,1fr)_16rem]">
            <div lang="en" className="flex min-h-44 items-center justify-center rounded-xl bg-oe-background-primary p-5">
              <div className="flex w-full items-center justify-center">
                {variant === "tonal"
                  ? <ToggleButton variant="tonal" {...toneProps(tone, color)} icon={usage.icon} {...shared} />
                  : <ToggleButton variant="ghost" {...toneProps(tone, color)} icon={usage.icon} activeIcon={usage.activeIcon} {...shared} />}
              </div>
            </div>
            <div className="space-y-5 rounded-xl bg-oe-background-primary p-4">
              <ControlSection title="Appearance">
                <ControlGroup label="Style">{variants.map((item) => <Choice key={item} active={variant === item} onClick={() => setVariant(item)}>{capitalize(item)}</Choice>)}</ControlGroup>
                <ControlGroup label="Size">{controlSizes.map((item) => <Choice key={item} active={controlSize === item} onClick={() => setControlSize(item)}>{sizeLabel[item]}</Choice>)}</ControlGroup>
                <fieldset>
                  <legend className={`mb-2 ${SMALL_LABEL}`}>Tone</legend>
                  <div className="flex flex-wrap gap-1.5">{tones.map((item) => <Choice key={item} active={tone === item} onClick={() => setTone(item)}>{toneLabel[item]}</Choice>)}</div>
                  {tone === "custom" ? (
                    <DependentControlGroup className="mt-3">
                      <span className={`mb-2 block ${SMALL_LABEL}`}>Color</span>
                      <div className="flex flex-wrap gap-1.5">{colors.map((item) => <Choice key={item} active={color === item} onClick={() => setColor(item)}>{colorLabel[item]}</Choice>)}</div>
                    </DependentControlGroup>
                  ) : null}
                </fieldset>
              </ControlSection>
              <ControlSection title="State">
                <Toggle label="Pressed" value={pressed} onChange={setPressed} />
              </ControlSection>
              <ControlSection title="Elements">
                <Toggle label="Count" value={showCount} onChange={setShowCount} />
              </ControlSection>
            </div>
          </div>
        </Section>

        <Section id="anatomy" title="Anatomy" description="ToggleButton을 구성하는 실제 요소와 문서에서 사용하는 명칭입니다. 아이콘은 필수이며 Count는 선택입니다.">
          <div className="col-span-full min-w-0">
            <AnatomySurface ariaLabel="ToggleButton anatomy" title="ToggleButton structure" className="px-5 pb-5 pt-12">
              <div lang="en" className="flex h-36 items-center justify-center">
                <AnatomyFrame>
                  <span data-slot="toggle-button" className={TOGGLE_DIAGRAM}>
                    <span data-slot="toggle-button-icon" className="flex shrink-0 items-center">
                      <RiHeartLine aria-hidden="true" />
                    </span>
                    <span data-slot="toggle-button-count" className="block truncate tabular-nums">128</span>
                  </span>
                  <AnatomyBoundaryMarker number={1} target="[data-slot=toggle-button]" side="left" connectorLength={36} />
                  <AnatomyNumber number={2} target="[data-slot=toggle-button-icon]" side="bottom" />
                  <AnatomyNumber number={3} target="[data-slot=toggle-button-count]" side="top" />
                </AnatomyFrame>
              </div>
            </AnatomySurface>
            <AnatomyLegend items={[{ name: "Container" }, { name: "Icon" }, { name: "Count", optional: true }]} />

            <div className="mt-4">
              <AnatomyStructureMap lines={[
                { name: "ToggleButton" },
                { prefix: "├─ ", name: "Icon" },
                { prefix: "└─ ", name: "Count", optional: true },
              ]} />
            </div>
          </div>
        </Section>

        <Section id="style" title="Properties · Style" description="Ghost와 Tonal 둘을 제공하며 기본값은 Ghost입니다. 각 카드의 왼쪽이 꺼짐이고 오른쪽이 켜짐입니다. 둘은 꺼짐에서 같은 모습이고 켜졌을 때 무엇까지 바뀌는지로 갈립니다.">
          <Example label="Ghost · Default" description="켜지면 아이콘이 Fill로 바뀌고 색이 함께 바뀝니다.">
            <div className="flex flex-wrap items-center gap-6">
              <ToggleButton icon={<RiPushpin2Line />} activeIcon={<RiPushpin2Fill />} aria-label={c.pin} />
              <ToggleButton defaultPressed icon={<RiPushpin2Line />} activeIcon={<RiPushpin2Fill />} aria-label={c.pin} />
            </div>
          </Example>
          <Example label="Tonal" description="켜지면 옅은 배경이 생기고 아이콘은 그대로 둡니다.">
            <div className="flex flex-wrap items-center gap-6">
              <ToggleButton variant="tonal" icon={<RiSearchLine />} aria-label={c.search} />
              <ToggleButton variant="tonal" defaultPressed icon={<RiSearchLine />} aria-label={c.search} />
            </div>
          </Example>
        </Section>

        <Section id="size" title="Properties · Size" description="XSmall부터 XLarge까지 다섯 단계를 제공하며 기본값은 Regular입니다. 값은 interaction.md의 공통 Control Height를 따르며 Button과 같은 단계입니다.">
          {controlSizes.map((item) => (
            <Example key={item} label={sizeCardLabel[item]}>
              <div className="flex flex-wrap items-center gap-1.5">
                <ToggleButton controlSize={item} icon={<RiPushpin2Line />} activeIcon={<RiPushpin2Fill />} aria-label={c.pin} />
                <ToggleButton controlSize={item} defaultPressed icon={<RiPushpin2Line />} activeIcon={<RiPushpin2Fill />} aria-label={c.pin} />
                <ToggleButton controlSize={item} defaultPressed count={128} icon={<RiThumbUpLine />} activeIcon={<RiThumbUpFill />} aria-label={c.good} />
              </div>
            </Example>
          ))}
        </Section>

        <Section id="color" title="Properties · Color" description="tone 셋과 Style 둘의 조합이며, 각 칸의 왼쪽이 꺼짐이고 오른쪽이 켜짐입니다. 색만 견주는 자리이므로 아이콘은 관용색이 없는 핀으로 고정했습니다. 꺼짐은 어느 tone에서나 같은 중립이고 켜짐에서만 색이 갈립니다.">
          <div lang="en" className="col-span-full min-w-0 overflow-x-auto">
            <ColorGrid rows={colorRows} render={(row, rowVariant) => (
              <div className="flex items-center gap-1">
                {rowVariant === "tonal" ? (
                  <>
                    <ToggleButton variant="tonal" {...rowProps(row)} icon={<RiPushpin2Line />} aria-label="Pin" />
                    <ToggleButton variant="tonal" {...rowProps(row)} defaultPressed icon={<RiPushpin2Line />} aria-label="Pin" />
                  </>
                ) : (
                  <>
                    <ToggleButton {...rowProps(row)} icon={<RiPushpin2Line />} activeIcon={<RiPushpin2Fill />} aria-label="Pin" />
                    <ToggleButton {...rowProps(row)} defaultPressed icon={<RiPushpin2Line />} activeIcon={<RiPushpin2Fill />} aria-label="Pin" />
                  </>
                )}
              </div>
            )} />
          </div>
        </Section>

        <Section id="state" title="Properties · State" description="Default, Pressed와 Focus visible입니다. Hover와 Pressed 하이라이트는 각 카드에서 직접 눌러 확인합니다.">
          <Example label="Default" description="아직 켜지 않은 상태입니다. 배경도 tone 색도 없습니다.">
            <ToggleButton icon={<RiPushpin2Line />} activeIcon={<RiPushpin2Fill />} aria-label={c.pin} />
          </Example>
          <Example label="Pressed" description="Ghost는 아이콘이 Fill로 바뀌고, Tonal은 아이콘을 그대로 둔 채 배경이 생깁니다.">
            <div className="flex flex-wrap items-center gap-1.5">
              <ToggleButton defaultPressed icon={<RiPushpin2Line />} activeIcon={<RiPushpin2Fill />} aria-label={c.pin} />
              <ToggleButton variant="tonal" defaultPressed icon={<RiSearchLine />} aria-label={c.search} />
            </div>
          </Example>
          <Example label="Focus visible" description="간격을 두고 바깥에 ring을 그립니다. 두 Style 모두 보이는 경계가 없어 같은 유형을 씁니다.">
            <div className="flex flex-wrap items-center gap-1.5">
              <ToggleButton className={DETACHED_FOCUS} icon={<RiPushpin2Line />} activeIcon={<RiPushpin2Fill />} aria-label={c.pin} />
              <ToggleButton variant="tonal" defaultPressed className={DETACHED_FOCUS} icon={<RiSearchLine />} aria-label={c.search} />
            </div>
          </Example>
          <Example label="현재 정의 없음" description="지금 구현과 정책에 없는 상태입니다. Disabled를 두지 않는 것은 켤 수 없는 자리에 이 버튼을 그리지 않기 때문입니다.">
            <GuidelineList className="" items={["Disabled", "Loading", "Read only", "Invalid"]} />
          </Example>
        </Section>

        <Section id="elements" title="Properties · Elements" description="아이콘은 필수이고 Count는 선택입니다. Ghost는 꺼짐과 켜짐 두 아이콘을 받고 Tonal은 하나만 받습니다.">
          <Example label="아이콘만" description="높이와 같은 너비를 가진 정사각형이 됩니다.">
            <div className="flex flex-wrap items-center gap-1.5">
              <ToggleButton defaultPressed icon={<RiPushpin2Line />} activeIcon={<RiPushpin2Fill />} aria-label={c.pin} />
              <ToggleButton icon={<RiPushpin2Line />} activeIcon={<RiPushpin2Fill />} aria-label={c.pin} />
              <ToggleButton defaultPressed icon={<RiNotification3Line />} activeIcon={<RiNotification3Fill />} aria-label={c.notify} />
              <ToggleButton variant="tonal" defaultPressed icon={<RiSearchLine />} aria-label={c.search} />
            </div>
          </Example>
          <Example label="Count 함께" description="숫자는 언제나 아이콘 뒤에 놓입니다.">
            <div className="flex flex-wrap items-center gap-1.5">
              <ToggleButton count={128} icon={<RiThumbUpLine />} activeIcon={<RiThumbUpFill />} aria-label={c.good} />
              <ToggleButton defaultPressed count={129} icon={<RiThumbUpLine />} activeIcon={<RiThumbUpFill />} aria-label={c.good} />
              <ToggleButton count={0} icon={<RiThumbUpLine />} activeIcon={<RiThumbUpFill />} aria-label={c.good} />
            </div>
          </Example>
        </Section>

        <Section id="guidelines" title="Guidelines" description="이 컴포넌트를 쓸 자리인지 가리는 조건, 어느 Style을 고르는지, 그리고 어느 자리에서나 지키는 규칙입니다.">
          <div className="col-span-full grid min-w-0 gap-8 [&>*]:min-w-0">
            <div>
              <GuidelineTitle>누른 표시가 화면에 남는 자리에만 쓰기</GuidelineTitle>
              <GuidelineList items={[
                "누른 뒤에도 켜진 상태가 남아 다시 눌러야 꺼지는 자리에 씁니다.",
                "눌러서 실행하고 끝나면 Button입니다. 누른 뒤 버튼에 남는 표시가 없기 때문입니다.",
                "켠 것이 목록을 걸러 낼 값으로 남으면 Chip입니다. ToggleButton이 켜고 끄는 것은 대상 하나의 상태입니다.",
                "Label과 짝을 이루어 폼 안에 놓이면 Switch입니다.",
                "항상 하나가 켜져 있고 끌 수 없으면 Tab입니다.",
              ]} />
            </div>

            <UsageComparison
              title="레이어나 영역을 여는 토글에는 Tonal 쓰기"
              doText="영역을 열어 두는 토글은 Tonal로 둡니다."
              dontText="영역을 열어 두는 토글을 Ghost로 두지 않습니다."
              description={[
                "열려 있다는 것은 이 버튼만이 아니라 화면의 다른 부분까지 바뀌었다는 뜻입니다. 아이콘 하나로는 그 변화를 가리키지 못하므로 배경으로 한 단계 더 강조합니다.",
              ]}
              doVisual={<div className={`${GUIDE_BOX} flex-col items-start gap-3`}><ToggleButton variant="tonal" defaultPressed icon={<RiSearchLine />} aria-label={c.search} /><SkeletonLine className="h-24 w-full rounded-xl" /></div>}
              dontVisual={<div className={`${GUIDE_BOX} flex-col items-start gap-3`}><ToggleButton defaultPressed icon={<RiSearchLine />} activeIcon={<RiSearchFill />} aria-label={c.search} /><SkeletonLine className="h-24 w-full rounded-xl" /></div>}
            />

            <div>
              <GuidelineTitle>그 밖의 토글은 Ghost로 두되 강조가 약하면 Tonal 보기</GuidelineTitle>
              <div className="mt-3 grid gap-3 @min-[720px]:grid-cols-2">
                <GuideVisual label="목록에 여럿 · Ghost">
                  <div className={`${GUIDE_BOX} flex-col justify-center gap-3`}>
                    {ROW_WIDTHS.map((width, index) => (
                      <span key={width} className="flex items-center justify-between gap-4">
                        <SkeletonLine className={`${SKELETON_TITLE} ${width}`} />
                        {index === 1
                          ? <ToggleButton controlSize="small" defaultPressed icon={<RiPushpin2Line />} activeIcon={<RiPushpin2Fill />} aria-label={c.pin} />
                          : <ToggleButton controlSize="small" icon={<RiPushpin2Line />} activeIcon={<RiPushpin2Fill />} aria-label={c.pin} />}
                      </span>
                    ))}
                  </div>
                </GuideVisual>
                <GuideVisual label="상세 화면에 하나 · Tonal">
                  <div className={`${GUIDE_BOX} flex-col justify-center gap-4`}>
                    <span className="flex items-center justify-between gap-4">
                      <SkeletonLine className={`${SKELETON_TITLE} w-1/2`} />
                      <ToggleButton variant="tonal" defaultPressed icon={<RiBookmarkLine />} aria-label={c.save} />
                    </span>
                    <span className="flex flex-col gap-2">
                      <SkeletonLine className={`${SKELETON_BODY} w-full`} />
                      <SkeletonLine className={`${SKELETON_BODY} w-full`} />
                      <SkeletonLine className={`${SKELETON_BODY} w-2/3`} />
                    </span>
                  </div>
                </GuideVisual>
              </div>
              <GuidelineList items={[
                "상태가 그 항목에 붙어 있고 화면의 나머지는 그대로이면 Ghost로 시작합니다.",
                "막는 규칙은 아닙니다. 배치해 보고 강조가 약하면 같은 기능에도 Tonal을 씁니다. 배경이 있는 화면 위나 요소가 빽빽한 자리에서는 아이콘 하나가 묻힙니다.",
                "켜졌다고 Style이 바뀌지 않습니다. 자리에 맞게 고른 Style은 두 상태에서 그대로 유지합니다.",
              ]} />
            </div>

            <UsageComparison
              title="켜짐을 색과 모양으로 함께 말하기"
              doText="Line과 Fill로 짝을 이루는 아이콘을 넘깁니다."
              dontText="꺼짐과 켜짐에 같은 아이콘을 넘기지 않습니다."
              description={[
                "색만으로 갈리는 상태는 색을 구별하기 어려운 사람에게 전달되지 않고, 옅은 배경 위에서는 누구에게나 흐려집니다.",
                "Tonal에서는 아이콘이 하나이고 배경이 켜짐을 말합니다. 배경은 면적이 생기고 사라지는 변화이므로 색을 구별하기 어려워도 전달됩니다.",
              ]}
              doVisual={<div className={`${GUIDE_BOX} items-center justify-center gap-8`}><ToggleButton controlSize="xlarge" icon={<RiPushpin2Line />} activeIcon={<RiPushpin2Fill />} aria-label={c.pin} /><ToggleButton controlSize="xlarge" defaultPressed icon={<RiPushpin2Line />} activeIcon={<RiPushpin2Fill />} aria-label={c.pin} /></div>}
              dontVisual={<div className={`${GUIDE_BOX} items-center justify-center gap-8`}><ToggleButton controlSize="xlarge" icon={<RiPushpin2Line />} activeIcon={<RiPushpin2Line />} aria-label={c.pin} /><ToggleButton controlSize="xlarge" defaultPressed icon={<RiPushpin2Line />} activeIcon={<RiPushpin2Line />} aria-label={c.pin} /></div>}
            />

            <UsageComparison
              title="즐겨찾기와 찜에는 Custom color 쓰기"
              doText="관용색이 굳어진 아이콘은 Custom 색상을 사용합니다."
              dontText="관용색이 굳어진 아이콘에 Brand를 그대로 두지 않습니다."
              description={[
                "별의 노랑과 하트의 빨강은 사용자가 이미 알고 있는 색입니다. 그 색을 쓰면 켜졌다는 것을 글자 없이도 읽습니다.",
                "고정처럼 관용색이 없는 토글과 영역을 여는 토글은 기본값 Brand를 씁니다.",
              ]}
              doVisual={<PreviewLocaleScope className={`${GUIDE_BOX} items-center justify-center gap-8`}><ToggleButton controlSize="xlarge" tone="custom" color="favorite" defaultPressed icon={<RiStarLine />} activeIcon={<RiStarFill />} aria-label={c.favorite} /><ToggleButton controlSize="xlarge" tone="custom" color="like" defaultPressed count={128} icon={<RiHeartLine />} activeIcon={<RiHeartFill />} aria-label={c.like} /></PreviewLocaleScope>}
              dontVisual={<PreviewLocaleScope className={`${GUIDE_BOX} items-center justify-center gap-8`}><ToggleButton controlSize="xlarge" defaultPressed icon={<RiStarLine />} activeIcon={<RiStarFill />} aria-label={c.favorite} /><ToggleButton controlSize="xlarge" defaultPressed count={128} icon={<RiHeartLine />} activeIcon={<RiHeartFill />} aria-label={c.like} /></PreviewLocaleScope>}
            />

            <div>
              <GuidelineTitle>개수는 소비자가 움직이기</GuidelineTitle>
              <GuidelineList items={[
                "onPressedChange에서 켜지면 하나 더하고 꺼지면 하나 빼서 count로 다시 넘깁니다.",
                "컴포넌트가 스스로 더하지 않는 이유는 실제 개수를 서버가 갖고 있기 때문입니다. 서버가 이미 나를 세어 두었다면 두 번 세게 됩니다.",
                "0은 그립니다. 세지 않는 자리는 count를 넘기지 않아 정사각형이 됩니다.",
              ]} />
            </div>

            <div>
              <GuidelineTitle>언제나 접근 가능한 이름 주기</GuidelineTitle>
              <GuidelineList items={[
                "aria-label로 그 버튼이 무엇을 켜고 끄는지 전달합니다. 숫자는 몇 명인지만 말합니다.",
                "이름은 켜짐과 꺼짐에서 같은 것을 씁니다. 지금 상태는 aria-pressed가 이미 전달하고 있습니다.",
              ]} />
            </div>

            <UsageComparison
              title="한 대상에 하나만 두기"
              doText="같은 대상에는 토글 하나만 둡니다."
              dontText="뜻이 겹치는 토글을 나란히 두지 않습니다."
              description={[
                "저장과 보관과 모아 두기처럼 뜻이 겹치는 토글을 한 대상에 함께 두면 무엇이 어디에 남는지 알 수 없습니다.",
                "성격이 다른 토글이 함께 필요하면 아이콘으로 갈리는 것만으로 충분한지 먼저 봅니다.",
              ]}
              doVisual={<div className={`${GUIDE_BOX} items-center justify-between gap-4`}><SkeletonLine className={`${SKELETON_TITLE} w-1/2`} /><ToggleButton icon={<RiBookmarkLine />} activeIcon={<RiBookmarkFill />} aria-label={c.save} /></div>}
              dontVisual={<div className={`${GUIDE_BOX} items-center justify-between gap-4`}><SkeletonLine className={`${SKELETON_TITLE} w-1/2`} /><span className="flex shrink-0 items-center gap-1"><ToggleButton icon={<RiBookmarkLine />} activeIcon={<RiBookmarkFill />} aria-label={c.save} /><ToggleButton icon={<RiArchiveLine />} activeIcon={<RiArchiveFill />} aria-label={c.archive} /><ToggleButton icon={<RiFolderLine />} activeIcon={<RiFolderFill />} aria-label={c.collect} /></span></div>}
            />
          </div>
        </Section>

        <Section id="property-map" title="Property map" description="실제 Props와 기본값입니다. Color는 Tone이 Custom일 때만, activeIcon은 Style이 Ghost일 때만 뜻을 가지므로 다른 값과 함께 넘기면 타입에서 걸립니다.">
          <div className="col-span-full overflow-x-auto">
            <table className="w-full min-w-[38rem] text-left text-xs">
              <thead className="border-b border-oe-border-secondary text-oe-foreground-tertiary"><tr><th className="py-2 font-medium">Property</th><th className="py-2 font-medium">Values</th><th className="py-2 font-medium">Default</th></tr></thead>
              <tbody className="divide-y divide-oe-border-secondary text-oe-foreground-secondary">
                <MapRow property="variant" values="ghost | tonal" defaultValue="ghost" />
                <MapRow property="tone" values="brand | custom" defaultValue="brand" />
                <MapRow property="color" values="favorite | like (tone=custom 전용)" defaultValue="undefined" />
                <MapRow property="controlSize" values="xsmall (28px) | small (32px) | regular (36px) | large (40px) | xlarge (48px)" defaultValue="regular" />
                <MapRow property="icon" values="ReactNode (Line)" defaultValue="필수" />
                <MapRow property="activeIcon" values="ReactNode (Fill, variant=ghost 전용)" defaultValue="Ghost에서 필수" />
                <MapRow property="count" values="number" defaultValue="undefined" />
                <MapRow property="pressed" values="false | true" defaultValue="undefined" />
                <MapRow property="defaultPressed" values="false | true" defaultValue="false" />
                <MapRow property="onPressedChange" values="(pressed, eventDetails) => void" defaultValue="undefined" />
                <MapRow property="className" values="string" defaultValue="undefined" />
              </tbody>
            </table>
          </div>
        </Section>
      </div>
      <OnThisPage items={sections} componentKey="toggle-button" />
    </div>
  );
}

function Section({ id, title, description, children }: { id: string; title: string; description: string; children: ReactNode }) { return <section id={id} className="scroll-mt-20 rounded-2xl border border-oe-border-secondary bg-oe-background-primary p-5"><h3 className="text-xl font-semibold text-oe-foreground-primary">{title}</h3><p className="mt-1 text-xs leading-5 text-oe-foreground-tertiary">{description}</p><div className="mt-5 grid gap-3 @min-[720px]:grid-cols-2">{children}</div></section>; }
function ControlSection({ title, children }: { title: string; children: ReactNode }) { return <section><h4 className="mb-3 text-sm font-semibold text-oe-foreground-primary">{title}</h4><div className="space-y-3">{children}</div></section>; }
function ControlGroup({ label, children }: { label: string; children: ReactNode }) { return <fieldset><legend className={`mb-2 ${SMALL_LABEL}`}>{label}</legend><div className="flex flex-wrap gap-1.5">{children}</div></fieldset>; }
function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) { return <div className="flex items-center justify-between gap-3"><span className={SMALL_LABEL}>{label}</span><button type="button" role="switch" aria-checked={value} aria-label={label} onClick={() => onChange(!value)} className={`relative h-5 w-9 shrink-0 rounded-full ${value ? "bg-oe-background-bold-primary" : "bg-oe-background-secondary ring-1 ring-inset ring-oe-border-primary"}`}><span className={`absolute top-0.5 size-4 rounded-full bg-oe-background-primary shadow-sm transition-[left] ${value ? "left-[18px]" : "left-0.5"}`} /></button></div>; }
function capitalize(value: string) { return value.charAt(0).toUpperCase() + value.slice(1); }


function MapRow({ property, values, defaultValue }: { property: string; values: string; defaultValue: string }) { return <tr><td className="py-3 pr-4 font-mono text-[11px] text-oe-foreground-primary">{property}</td><td className="py-3 pr-4 font-mono text-[11px]">{values}</td><td className="py-3 font-mono text-[11px]">{defaultValue}</td></tr>; }

function ColorGrid({ rows, render }: { rows: readonly ColorRow[]; render: (row: ColorRow, variant: ToggleButtonVariant) => ReactNode }) {
  return (
    <div className="grid w-fit grid-cols-[9rem_repeat(2,8rem)] items-center gap-x-4 gap-y-2.5">
      <span />
      {variants.map((item) => <span key={item} className={SMALL_LABEL}>{capitalize(item)}</span>)}
      {rows.map((row) => (
        <Fragment key={row}>
          <span className={SMALL_LABEL}>{colorRowLabel[row]}</span>
          {variants.map((item) => <div key={item}>{render(row, item)}</div>)}
        </Fragment>
      ))}
    </div>
  );
}

function Example({ label, description, children }: { label: string; description?: string; children: ReactNode }) { return <div className="flex min-h-32 min-w-0 flex-col gap-3 rounded-xl border border-oe-border-secondary p-4"><div><p className="text-xs font-medium text-oe-foreground-primary">{label}</p>{description ? <p className="mt-1 text-[11px] leading-4 text-oe-foreground-tertiary">{description}</p> : null}</div><PreviewLocaleScope className="mt-auto">{children}</PreviewLocaleScope></div>; }

function SkeletonLine({ className }: { className: string }) { return <span aria-hidden="true" className={cn("block shrink-0 rounded-full bg-oe-background-secondary", className)} />; }
