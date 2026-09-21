"use client";

import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import { RiArrowDownSLine, RiCloseLine, RiGlobalLine, RiResetRightLine, RiSearchLine } from "@remixicon/react";

import { Chip, Input, type ChipShape, type ChipSize, type ChipTone } from "@ooee/ui";
import { GuidelineGroupTitle, GuidelineTitle } from "@/components/guideline-title";
import { GuidelineList, GuideVisual, UsageComparison } from "@/components/component-guidelines";
import { AnatomyBoundaryMarker, AnatomyFrame, AnatomyLegend, AnatomyNumber, AnatomyStructureMap, AnatomySurface, AnatomySwapSlot } from "@/components/component-anatomy";
import { OnThisPage } from "@/components/component-detail-navigation";
import { DependentControlGroup, PlaygroundChoice as Choice } from "@/components/playground-element-control";
import { PreviewLocaleScope } from "@/components/preview-locale-scope";
import { useStudioPreferences } from "@/components/studio-preferences-provider";

type ChipElement = "none" | "icon";

// studio.md:74 는 정적 도식도 실제 렌더링과 같아 보여야 한다고 정한다. Large Chip 이
// 쓰는 클래스를 그대로 적는다. 마커는 각 요소를 감싼 relative 안에 두어 좌표를 짐작하지
// 않는다.
const CHIP_DIAGRAM = "inline-flex h-oe-control-large items-center gap-1.5 rounded-full border border-oe-border-primary bg-oe-background-primary px-3 text-sm font-medium text-oe-foreground-secondary [&_svg]:size-oe-icon-medium";

// select-workbench.tsx 가 쓰는 컴포넌트 간 링크 표기와 같게 유지한다.
const GUIDELINE_LINK = "font-medium text-oe-foreground-primary underline decoration-oe-border-primary underline-offset-2 transition-colors hover:text-oe-brand-foreground-primary";

const sizeLabels = {
  xsmall: "XSmall · 28px",
  small: "Small · 32px",
  regular: "Regular · 36px · Default",
  large: "Large · 40px",
  xlarge: "XLarge · 48px",
} as const;

const sections = [
  { id: "playground", label: "Playground" },
  { id: "anatomy", label: "Anatomy" },
  { id: "size", label: "Size" },
  { id: "shape", label: "Shape" },
  { id: "state", label: "State" },
  { id: "content", label: "Content" },
  { id: "elements", label: "Elements" },
  { id: "behavior", label: "Behavior" },
  { id: "guidelines", label: "Guidelines" },
  { id: "property-map", label: "Property map" },
];

const copy = {
  ko: {
    description: "선택한 값이나 필터 항목을 한 줄 Container로 표시하는 컴포넌트입니다.",
    label: "Label",
    prefix: "Prefix",
    ariaLabel: "Chip",
    remove: "Chip 삭제",
    removeTooltip: "삭제",
    reset: "초기화",
    keywords: ["주거", "교통", "교육", "의료", "문화", "복지", "환경", "안전"],
    inputValues: ["서울특별시", "부산광역시", "대구광역시", "인천광역시"],
    restore: "예시 되돌리기",
    inputEmpty: "고른 값을 모두 지웠습니다.",
    suggestions: ["오늘 날씨", "주변 맛집", "지하철 시간표"],
    searchPlaceholder: "검색어를 입력해 주세요",
    orderLabel: "주문 메뉴",
    orderItems: ["아메리카노", "치즈케이크", "샐러드"],
    orphanRemove: "무엇을 지우는지 알 수 없는 삭제",
    shortValue: "서울특별시",
    longValue: "서울특별시 강남구 테헤란로 152 강남파이낸스센터 A동 3층 102호",
  },
  en: {
    description: "Displays a selected value or filter item in a single-line container. This is a draft, so only the playground is available for now.",
    label: "Label",
    prefix: "Prefix",
    ariaLabel: "Chip",
    remove: "Remove chip",
    removeTooltip: "Remove",
    reset: "Reset",
    keywords: ["Housing", "Transit", "Education", "Healthcare", "Culture", "Welfare", "Environment", "Safety"],
    inputValues: ["Seoul", "Busan", "Daegu", "Incheon"],
    restore: "Restore the example",
    inputEmpty: "Every selected value has been removed.",
    suggestions: ["Today's weather", "Nearby restaurants", "Subway schedule"],
    searchPlaceholder: "Enter a search term",
    orderLabel: "Ordered items",
    orderItems: ["Americano", "Cheesecake", "Salad"],
    orphanRemove: "Remove with nothing to name",
    shortValue: "Seoul",
    longValue: "152 Teheran-ro, Gangnam-gu, Seoul, Republic of Korea",
  },
} as const;

export function ChipWorkbench() {
  const { locale } = useStudioPreferences();
  const c = copy[locale];
  const [controlSize, setControlSize] = useState<ChipSize>("regular");
  const [shape, setShape] = useState<ChipShape>("circle");
  const [active, setActive] = useState(false);
  const [prefix, setPrefix] = useState(false);
  const [label, setLabel] = useState(true);
  const [leadingElement, setLeadingElement] = useState<ChipElement>("icon");
  const [leadingTone, setLeadingTone] = useState<ChipTone>("secondary");
  const [trailingElement, setTrailingElement] = useState<ChipElement>("none");
  const [trailingTone, setTrailingTone] = useState<ChipTone>("secondary");
  const [clickable, setClickable] = useState(true);
  const [removeButton, setRemoveButton] = useState(false);
  const [selectedKeywords, setSelectedKeywords] = useState<number[]>([1]);
  const [removedValues, setRemovedValues] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [pinnedFilters, setPinnedFilters] = useState<number[]>([0]);
  const [pinnedScrolled, setPinnedScrolled] = useState(false);
  // PC 에서도 모바일처럼 잡고 끌어 옮길 수 있게 한다. 끄는 동안 커서를 따라 내용이
  // 움직이며, 끌고 난 직후의 click 은 Chip 에 닿지 않게 막는다.
  const drag = useRef<{ startX: number; startScroll: number; moved: boolean } | null>(null);
  const draggedRef = useRef(false);

  function startDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse") return;
    draggedRef.current = false;
    drag.current = { startX: event.clientX, startScroll: event.currentTarget.scrollLeft, moved: false };
  }

  function moveDrag(event: React.PointerEvent<HTMLDivElement>) {
    const state = drag.current;
    if (!state) return;
    const delta = event.clientX - state.startX;
    if (Math.abs(delta) > 8) {
      state.moved = true;
      draggedRef.current = true;
    }
    event.currentTarget.scrollLeft = state.startScroll - delta;
  }

  function endDrag() {
    drag.current = null;
  }

  // 끈 경우에만 값 변경을 건너뛴다. click 자체를 막지 않으므로 누르기는 언제나 반영된다.
  function toggleFilter(index: number) {
    if (draggedRef.current) return;
    setPinnedFilters((current) => current.includes(index) ? current.filter((item) => item !== index) : [...current, index]);
  }

  // Label 이 없으면 Icon only 이므로 Leading element 가 유일한 내용이 된다.
  const resolvedLeading: ChipElement = label ? leadingElement : "icon";

  return (
    <div className="grid items-start gap-6 @min-[1120px]:grid-cols-[minmax(0,1fr)_11rem]">
      <div className="min-w-0 space-y-5">
        <p className="text-sm leading-6 text-oe-foreground-secondary">{c.description}</p>

        <Section id="playground" title="🚩 Playground" description="Size와 Shape, 상태, 내부 요소를 조합해 확인합니다.">
          <div className="col-span-full grid gap-5 rounded-xl border-2 border-oe-border-bold-primary bg-oe-background-secondary p-4 @min-[1000px]:grid-cols-[minmax(18rem,1fr)_minmax(20rem,1fr)]">
            <PreviewLocaleScope className="flex min-h-40 items-start rounded-xl bg-oe-background-primary p-5">
              {removeButton ? (
                <Chip
                  controlSize={controlSize}
                  shape={shape}
                  active={active}
                  prefix={prefix ? c.prefix : undefined}
                  leadingElement={resolvedLeading === "icon" ? <RiGlobalLine /> : undefined}
                  leadingTone={leadingTone}
                  trailingElement={trailingElement === "icon" ? <RiGlobalLine /> : undefined}
                  trailingTone={trailingTone}
                  ariaLabel={c.ariaLabel}
                  onRemove={() => undefined}
                  removeLabel={c.remove}
                  removeTooltip={c.removeTooltip}
                >
                  {label ? c.label : undefined}
                </Chip>
              ) : (
                <Chip
                  controlSize={controlSize}
                  shape={shape}
                  active={active}
                  prefix={prefix ? c.prefix : undefined}
                  leadingElement={resolvedLeading === "icon" ? <RiGlobalLine /> : undefined}
                  leadingTone={leadingTone}
                  trailingElement={trailingElement === "icon" ? <RiGlobalLine /> : undefined}
                  trailingTone={trailingTone}
                  ariaLabel={c.ariaLabel}
                  onClick={clickable ? () => setActive((current) => !current) : undefined}
                >
                  {label ? c.label : undefined}
                </Chip>
              )}
            </PreviewLocaleScope>
            <div className="grid gap-5 @min-[720px]:grid-cols-2">
              <div className="space-y-4">
                <ControlSection title="Appearance">
                  <ControlGroup label="Control size">{(["xsmall", "small", "regular", "large", "xlarge"] as const).map((item) => <Choice key={item} active={controlSize === item} onClick={() => setControlSize(item)}>{capitalize(item)}</Choice>)}</ControlGroup>
                  <ControlGroup label="Shape">{(["circle", "rounded"] as const).map((item) => <Choice key={item} active={shape === item} onClick={() => setShape(item)}>{capitalize(item)}</Choice>)}</ControlGroup>
                </ControlSection>
                <ControlSection title="State">
                  <Toggle label="Active" value={active} onChange={setActive} />
                </ControlSection>
              </div>
              <div className="space-y-4">
                <ControlSection title="Content">
                  <Toggle label="Label" value={label} onChange={(value) => { setLabel(value); if (!value) setPrefix(false); }} />
                  {label
                    ? <DependentControlGroup><Toggle label="Prefix" value={prefix} onChange={setPrefix} /></DependentControlGroup>
                    : <DependentControlGroup><p className="text-[11px] leading-4 text-oe-foreground-placeholder">Label이 없으면 Icon only이므로 Leading element를 유지하고 Prefix는 사용하지 않습니다.</p></DependentControlGroup>}
                </ControlSection>
                <ControlSection title="Elements">
                  <ControlGroup label="Leading element">{(["none", "icon"] as const).map((item) => <Choice key={item} active={resolvedLeading === item} onClick={() => setLeadingElement(item)}>{capitalize(item)}</Choice>)}</ControlGroup>
                  {resolvedLeading === "icon" ? <DependentControlGroup><ControlGroup label="Leading tone">{(["secondary", "tertiary"] as const).map((item) => <Choice key={item} active={leadingTone === item} onClick={() => setLeadingTone(item)}>{capitalize(item)}</Choice>)}</ControlGroup></DependentControlGroup> : null}
                  <ControlGroup label="Trailing element">{(["none", "icon"] as const).map((item) => <Choice key={item} active={trailingElement === item} onClick={() => setTrailingElement(item)}>{capitalize(item)}</Choice>)}</ControlGroup>
                  {trailingElement === "icon" ? <DependentControlGroup><ControlGroup label="Trailing tone">{(["secondary", "tertiary"] as const).map((item) => <Choice key={item} active={trailingTone === item} onClick={() => setTrailingTone(item)}>{capitalize(item)}</Choice>)}</ControlGroup></DependentControlGroup> : null}
                </ControlSection>
                <ControlSection title="Behavior">
                  <Toggle label="Clickable" value={clickable} onChange={(next) => { setClickable(next); if (next) setRemoveButton(false); }} />
                  <Toggle label="Remove button" value={removeButton} onChange={(next) => { setRemoveButton(next); if (next) setClickable(false); }} />
                  <p className="text-[11px] leading-4 text-oe-foreground-placeholder">전체를 누르는 Chip과 Remove button은 함께 둘 수 없습니다. Container 전체가 Button인데 안에 또 Button을 두면 어느 것을 눌렀는지 알 수 없습니다.</p>
                </ControlSection>
              </div>
            </div>
          </div>
        </Section>

        <Section id="anatomy" title="Anatomy" description="Chip을 구성하는 실제 요소와 문서에서 사용하는 명칭입니다.">
          <div className="col-span-full min-w-0">
            <AnatomySurface ariaLabel="Chip basic anatomy" title="Basic anatomy" className="px-5 pb-5 pt-12">
              <div className="flex h-36 items-center justify-center">
                <AnatomyFrame>
                  <span data-slot="chip" className={CHIP_DIAGRAM}>
                    <span className="min-w-0">
                      <span data-slot="chip-label" className="block truncate">{c.label}</span>
                    </span>
                  </span>
                  <AnatomyBoundaryMarker number={1} target="[data-slot=chip]" side="left" connectorLength={36} />
                  <AnatomyNumber number={2} target="[data-slot=chip-label]" side="top" />
                </AnatomyFrame>
              </div>
            </AnatomySurface>
            <AnatomyLegend items={[{ name: "Container" }, { name: "Label" }]} />

            <div className="mt-6">
              <AnatomySurface ariaLabel="Chip extended anatomy" title="Extended anatomy" className="px-5 pb-5 pt-12">
                <div className="flex h-36 items-center justify-center">
                  <AnatomyFrame>
                    <span className={CHIP_DIAGRAM}>
                      <span data-slot="chip-leading-element" className="flex shrink-0 items-center">
                        <AnatomySwapSlot className="size-5" />
                      </span>
                      <span data-slot="chip-prefix" className="shrink-0 text-oe-foreground-tertiary">{c.prefix}</span>
                      <span className="min-w-0 truncate">{c.label}</span>
                      <span data-slot="chip-trailing-element" className="flex shrink-0 items-center">
                        <AnatomySwapSlot className="size-5" />
                      </span>
                      <span data-slot="chip-remove" className="grid size-5 shrink-0 place-items-center rounded-md text-oe-foreground-tertiary">
                        <RiCloseLine aria-hidden="true" />
                      </span>
                    </span>
                    <AnatomyNumber number={3} target="[data-slot=chip-leading-element]" side="top" />
                    <AnatomyNumber number={4} target="[data-slot=chip-prefix]" side="bottom" />
                    <AnatomyNumber number={5} target="[data-slot=chip-trailing-element]" side="top" />
                    <AnatomyNumber number={6} target="[data-slot=chip-remove]" side="bottom" />
                  </AnatomyFrame>
                </div>
              </AnatomySurface>
              <AnatomyLegend start={3} items={[{ name: "Leading element", optional: true }, { name: "Prefix", optional: true }, { name: "Trailing element", optional: true }, { name: "Remove button", optional: true }]} />
            </div>

            <div className="mt-4">
              <AnatomyStructureMap lines={[
                { name: "Chip" },
                { prefix: "├─ ", name: "Leading element", optional: true },
                { prefix: "├─ ", name: "Prefix", optional: true },
                { prefix: "├─ ", name: "Label" },
                { prefix: "├─ ", name: "Trailing element", optional: true },
                { prefix: "└─ ", name: "Remove button", optional: true },
              ]} />
            </div>
          </div>
        </Section>

        <Section id="size" title="Properties · Size" description="한 줄 Form control이 공유하는 공통 Control Height를 그대로 사용합니다. 각 카드에 Label이 있는 경우와 Icon only를 함께 둡니다.">
          {(["xsmall", "small", "regular", "large", "xlarge"] as const).map((item) => (
            <Example key={item} label={sizeLabels[item]}>
              <div className="flex flex-wrap items-center gap-2">
                <Chip controlSize={item} leadingElement={<RiGlobalLine />}>{c.label}</Chip>
                <Chip controlSize={item} leadingElement={<RiGlobalLine />} ariaLabel={c.ariaLabel} />
              </div>
            </Example>
          ))}
        </Section>

        <Section id="shape" title="Properties · Shape" description="공통 모양 어휘 중 Circle과 Rounded를 제공합니다.">
          <Example label="Circle · Default"><Chip shape="circle" leadingElement={<RiGlobalLine />}>{c.label}</Chip></Example>
          <Example label="Rounded"><Chip shape="rounded" leadingElement={<RiGlobalLine />}>{c.label}</Chip></Example>
        </Section>

        <Section id="state" title="Properties · State" description="Active 여부를 확인합니다. Hover, Pressed와 Focus 피드백은 각 카드에서 실제로 확인할 수 있습니다.">
          <Example label="Default"><Chip leadingElement={<RiGlobalLine />} onClick={() => undefined}>{c.label}</Chip></Example>
          <Example label="Active" description="선택 배경이 Hover와 Pressed 하이라이트보다 우선합니다."><Chip active leadingElement={<RiGlobalLine />} onClick={() => undefined}>{c.label}</Chip></Example>
        </Section>

        <Section id="content" title="Properties · Content" description="Label과 그 앞에 붙는 Prefix를 조합합니다. Label이 없으면 Icon only가 됩니다.">
          <Example label="Label"><Chip>{c.label}</Chip></Example>
          <Example label="Prefix + Label"><Chip prefix={c.prefix}>{c.label}</Chip></Example>
          <Example label="Icon only" description="Label 없이 Leading element만 두며 정사각 폭을 사용합니다."><Chip leadingElement={<RiGlobalLine />} ariaLabel={c.ariaLabel} /></Example>
        </Section>

        <Section id="elements" title="Properties · Elements" description="Label 앞뒤에 놓이는 선택 요소입니다. Chip에서는 Icon만 둡니다.">
          <Example label="Leading element"><Chip leadingElement={<RiGlobalLine />}>{c.label}</Chip></Example>
          <Example label="Trailing element"><Chip trailingElement={<RiGlobalLine />}>{c.label}</Chip></Example>
          <Example label="Leading + Trailing"><Chip leadingElement={<RiGlobalLine />} trailingElement={<RiGlobalLine />}>{c.label}</Chip></Example>
        </Section>

        <Section id="behavior" title="Properties · Behavior" description="전체를 누르는 Chip과 Remove button을 가진 Chip은 함께 만들지 않습니다.">
          <Example label="Clickable" description="Container 전체가 Button이며 누르면 Active가 바뀝니다."><Chip leadingElement={<RiGlobalLine />} onClick={() => undefined}>{c.label}</Chip></Example>
          <Example label="Remove button" description="Chip 자체를 삭제합니다. Trailing element와 별개 요소입니다."><Chip leadingElement={<RiGlobalLine />} onRemove={() => undefined} removeLabel={c.remove} removeTooltip={c.removeTooltip}>{c.label}</Chip></Example>
        </Section>

        <Section id="guidelines" title="Guidelines" description="Chip을 쓰임마다 어떻게 조합하는지 정리합니다.">
          <div className="col-span-full grid gap-8">
            <div>
              <GuidelineGroupTitle>모든 쓰임의 공통 규칙</GuidelineGroupTitle>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-oe-foreground-secondary">어느 쓰임으로 쓰든 지켜야 하는 규칙입니다.</p>
              <div className="mt-8 grid gap-8">
                <div>
                  <GuidelineTitle>Label만 말줄임해 한 줄을 유지하기</GuidelineTitle>
                  <div className="mt-3 grid gap-3 @min-[720px]:grid-cols-2">
                    <GuideVisual label="콘텐츠를 감싸는 너비" contentClassName="mx-auto w-[375px] max-w-full px-4 py-4">
                      <PreviewLocaleScope className="w-full">
                        <Chip controlSize="small" leadingElement={<RiGlobalLine />} onRemove={() => undefined} removeLabel={c.remove} removeTooltip={c.removeTooltip}>{c.shortValue}</Chip>
                      </PreviewLocaleScope>
                    </GuideVisual>
                    <GuideVisual label="담을 폭을 넘는 값" contentClassName="mx-auto w-[375px] max-w-full px-4 py-4">
                      <PreviewLocaleScope className="w-full">
                        <Chip controlSize="small" leadingElement={<RiGlobalLine />} onRemove={() => undefined} removeLabel={c.remove} removeTooltip={c.removeTooltip}>{c.longValue}</Chip>
                      </PreviewLocaleScope>
                    </GuideVisual>
                  </div>
                  <GuidelineList items={["Chip은 내부 콘텐츠를 감싸는 너비를 사용하고, 담을 폭보다 넓어지면 Label만 말줄임합니다.", "Leading element와 Prefix, Trailing element, Remove button은 줄이지 않습니다. 아이콘이 찌그러지거나 Remove button을 누를 수 없게 되면 값을 지울 방법이 사라집니다.", "Chip을 여러 줄로 늘리지 않습니다."]} />
                </div>
                <div>
                  <GuidelineTitle>Circle을 기본으로 쓰고 Rounded는 Selection에만 쓰기</GuidelineTitle>
                  <div className="mt-3 grid gap-3 @min-[720px]:grid-cols-2">
                    <GuideVisual label="Circle · 기본" contentClassName="border-0 bg-transparent px-0">
                      <PreviewLocaleScope className="flex w-full justify-center">
                        <Chip controlSize="small" leadingElement={<RiGlobalLine />}>{c.label}</Chip>
                      </PreviewLocaleScope>
                    </GuideVisual>
                    <GuideVisual label="Rounded · Selection" contentClassName="border-0 bg-transparent px-0">
                      <PreviewLocaleScope className="flex w-full justify-center">
                        <Chip controlSize="small" shape="rounded" leadingElement={<RiGlobalLine />}>{c.label}</Chip>
                      </PreviewLocaleScope>
                    </GuideVisual>
                  </div>
                  <GuidelineList items={["Selection이 폼 요소와 나란히 놓이는 유일한 쓰임이므로 그 자리에서만 모서리를 맞출 이유가 있습니다."]} />
                </div>
                <UsageComparison
                  title="Icon only는 바로 동작하는 자리에만 쓰기"
                  doVisual={<PreviewLocaleScope className="flex w-full justify-center"><Chip controlSize="small" leadingElement={<RiResetRightLine />} ariaLabel={c.reset} onClick={() => undefined} /></PreviewLocaleScope>}
                  dontVisual={<PreviewLocaleScope className="flex w-full justify-center"><Chip controlSize="small" className="w-auto! px-2" leadingElement={<RiSearchLine />} ariaLabel={c.orphanRemove} onRemove={() => undefined} removeLabel={c.remove} removeTooltip={c.removeTooltip} /></PreviewLocaleScope>}
                  doText="누르면 바로 끝나는 동작이므로 아이콘만으로 읽힙니다."
                  dontText="Remove button과 함께 쓰지 않습니다."
                  description={["Icon only는 누르면 바로 끝나는 동작에만 씁니다. 별도 화면이 열리거나 다음 선택을 요구하는 자리에는 두지 않습니다.", "Remove button과 함께 쓰지 않습니다. 지울 값이 화면에 없으면 무엇을 지우는지 알 수 없습니다."]}
                />
              </div>
            </div>

            <div>
              <GuidelineGroupTitle>쓰임마다 갈리는 것</GuidelineGroupTitle>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-oe-foreground-secondary">쓰임마다 사용하는 동작이 갈립니다. <code className="text-xs">onClick</code>과 <code className="text-xs">onRemove</code>는 타입으로 갈라 함께 넘길 수 없으므로, 어느 쓰임인지 먼저 정한 뒤 요소를 조합합니다.</p>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[36rem] text-left text-xs">
                  <thead className="border-b border-oe-border-secondary text-oe-foreground-tertiary"><tr><th className="py-2 font-medium">쓰임</th><th className="py-2 font-medium">모양</th><th className="py-2 font-medium">누르는 동작</th><th className="py-2 font-medium">개별 제거</th><th className="py-2 font-medium">Active</th></tr></thead>
                  <tbody className="divide-y divide-oe-border-secondary text-oe-foreground-secondary">
                    <UsageRow usage="Filter" shape="circle" click="조건을 켜고 끄거나 선택 화면을 엽니다" remove="두지 않습니다. 초기화가 담당합니다" active="사용합니다" />
                    <UsageRow usage="Selection" shape="rounded" click="값을 고르고 해제합니다" remove="두지 않습니다" active="사용합니다" />
                    <UsageRow usage="Suggestion" shape="circle" click="누르면 값이 채워집니다" remove="두지 않습니다" active="사용하지 않습니다" />
                    <UsageRow usage="Input" shape="circle" click="두지 않습니다" remove="Remove button을 사용합니다" active="사용하지 않습니다" />
                    <UsageRow usage="정보 표시" shape="circle" click="두지 않습니다" remove="두지 않습니다" active="사용하지 않습니다" />
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <GuidelineGroupTitle>Chip을 Filter로 사용하기</GuidelineGroupTitle>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-oe-foreground-secondary">콘텐츠 목록에서 조건의 적용 및 해제를 제어하는 Filter 역할로 사용할 때는 Filter Bar를 사용합니다.</p>
              <div className="mt-3">
                <GuideVisual label="Filter bar" contentClassName="mx-auto w-[375px] max-w-full rounded-none border-0 px-4 py-2">
                    <PreviewLocaleScope className="w-full">
                      <div
                        onScroll={(event) => setPinnedScrolled(event.currentTarget.scrollLeft > 0)}
                        onPointerDownCapture={startDrag}
                        onPointerMoveCapture={moveDrag}
                        onPointerUpCapture={endDrag}
                        onPointerCancelCapture={endDrag}
                        className="-mx-4 flex cursor-grab select-none flex-nowrap items-center gap-1.5 overflow-x-auto px-4 active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                      >
                        {pinnedFilters.length > 0 ? (
                          <div className="sticky -left-4 z-10 -ml-4 flex shrink-0 items-center bg-oe-background-primary pl-4">
                            <Chip controlSize="small" leadingElement={<RiResetRightLine />} ariaLabel={c.reset} onClick={() => setPinnedFilters([])} />
                            <span aria-hidden="true" className={`pointer-events-none absolute left-full top-0 h-full w-6 bg-gradient-to-r from-oe-background-primary to-transparent transition-opacity duration-150 ${pinnedScrolled ? "opacity-100" : "opacity-0"}`} />
                          </div>
                        ) : null}
                        {[0, 1, 2, 3, 4].map((index) => (
                          <Chip
                            key={index}
                            controlSize="small"
                            active={pinnedFilters.includes(index)}
                            trailingElement={<RiArrowDownSLine />}
                            trailingTone="tertiary"
                            onClick={() => toggleFilter(index)}
                          >
                            {c.label}
                          </Chip>
                        ))}
                      </div>
                    </PreviewLocaleScope>
                </GuideVisual>
              </div>
              <div className="mt-8 grid gap-8">
                <div>
                  <GuidelineTitle>넘치면 가로로 스크롤하기</GuidelineTitle>
                  <GuidelineList items={["Filter Bar의 기본값은 스크롤입니다. 항목이 넘치면 가로로 스크롤하며, 펼쳐 보여 주는 방식은 이후 별도 옵션으로 검토합니다."]} />
                </div>
                <div>
                  <GuidelineTitle>PC에서도 잡고 끌어 옮기기</GuidelineTitle>
                  <GuidelineList items={["모바일에서 익힌 동작이 데스크톱에서 막히지 않게 같은 스크롤을 제공합니다. 8px 이내의 움직임은 끌기가 아니라 누르기로 봅니다."]} />
                </div>
                <div>
                  <GuidelineTitle>활성값이 생기면 초기화를 맨 앞에 고정하기</GuidelineTitle>
                  <GuidelineList items={["아무것도 켜지지 않은 상태가 기본입니다.", "활성값이 하나라도 생기면 맨 앞에 초기화를 제공하고, 스크롤 위치와 무관하게 닿을 수 있도록 그 자리에 고정합니다."]} />
                </div>
                <div>
                  <GuidelineTitle>고정 영역이 지나가는 Chip을 가리기</GuidelineTitle>
                  <GuidelineList items={["배경을 스크롤 변까지 덮어 Chip이 초기화 왼쪽으로 비집고 나오지 않게 합니다.", "경계는 gradation으로 흐립니다. 딱 끊기면 잘린 것처럼 보입니다."]} />
                </div>
                <div>
                  <GuidelineTitle>Filter Chip에는 지우기 버튼을 두지 않기</GuidelineTitle>
                  <GuidelineList items={["누르는 동작이 조건을 바로 켜고 끄는 것일 수도 있고 선택 화면을 여는 것일 수도 있으므로, 무엇을 하는지는 각 필터가 정합니다.", "어느 경우든 지우기 버튼은 두지 않습니다. 조건을 되돌리는 것은 초기화가 담당합니다."]} />
                </div>
                <div>
                  <GuidelineTitle>Label에 적용된 값을 담기</GuidelineTitle>
                  <GuidelineList items={["무엇으로 좁혀 두었는지 바를 보고 알 수 있어야 하므로 Label에 적용된 값을 담습니다."]} />
                </div>
              </div>
            </div>

            <div>
              <GuidelineGroupTitle>Chip을 Selection으로 사용하기</GuidelineGroupTitle>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-oe-foreground-secondary">짧은 키워드 여러 개를 나열해 그중 하나 이상을 고르는 자리입니다.</p>
              <div className="mt-3">
                <GuideVisual label="키워드 선택" contentClassName="mx-auto w-[375px] max-w-full px-4 py-4">
                  <PreviewLocaleScope className="w-full">
                    <div className="flex flex-wrap gap-1.5">
                      {c.keywords.map((keyword, index) => (
                        <Chip
                          key={keyword}
                          controlSize="small"
                          shape="rounded"
                          active={selectedKeywords.includes(index)}
                          onClick={() => setSelectedKeywords((previous) => (previous.includes(index) ? previous.filter((item) => item !== index) : [...previous, index]))}
                        >
                          {keyword}
                        </Chip>
                      ))}
                    </div>
                  </PreviewLocaleScope>
                </GuideVisual>
              </div>
              <div className="mt-8 grid gap-8">
                <div>
                  <GuidelineTitle>Content 너비로 흐르게 두기</GuidelineTitle>
                  <GuidelineList items={["각 Chip은 Label 너비만큼만 차지하고 줄이 넘치면 다음 줄로 흐릅니다.", <>이 배치를 <Link href="/components/select-box" className={GUIDELINE_LINK}>Select Box</Link>가 만들지 않는 이유도 같은 기준입니다.</>]} />
                </div>
                <div>
                  <GuidelineTitle>폼 요소와 모서리를 맞추기</GuidelineTitle>
                  <GuidelineList items={[<>다섯 쓰임 가운데 <code className="text-xs text-oe-foreground-primary">rounded</code>를 쓰는 것은 Selection뿐이며 Input, Select, Number Input과 같은 8px 모서리를 씁니다.</>, "같은 페이지에서 값을 고르는 자리이며 Field에서 다루기도 하므로, 나란히 놓였을 때 모서리가 갈리지 않아야 합니다."]} />
                </div>
                <div>
                  <GuidelineTitle>선택과 해제를 전체 Click으로 받기</GuidelineTitle>
                  <GuidelineList items={[<><code className="text-xs text-oe-foreground-primary">onClick</code> 하나로 켜고 끄며 Remove button은 두지 않습니다.</>, "아무것도 켜지지 않은 상태가 기본이라는 점에서, 항상 하나가 켜져 있고 끌 수 없는 Tab과 갈립니다."]} />
                </div>
                <div>
                  <GuidelineTitle>비교가 필요하면 Select Box로 넘기기</GuidelineTitle>
                  <GuidelineList items={[<>설명이나 시각 정보를 견주어 고르는 자리는 <Link href="/components/select-box" className={GUIDELINE_LINK}>Select Box</Link>가 담당합니다.</>, "키워드만으로 판단할 수 있을 때 Chip을 사용합니다."]} />
                </div>
              </div>
            </div>

            <div>
              <GuidelineGroupTitle>Chip을 Suggestion으로 사용하기</GuidelineGroupTitle>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-oe-foreground-secondary">사용자에게 다음 입력을 제안하는 자리입니다. 검색어 추천과 채팅방 안의 답변 추천이 여기에 해당합니다.</p>
              <div className="mt-3">
                <GuideVisual label="검색어 추천" contentClassName="mx-auto w-[375px] max-w-full px-4 py-4">
                  <PreviewLocaleScope className="w-full">
                    <div className="space-y-3">
                      <Input controlSize="small" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder={c.searchPlaceholder} aria-label={c.searchPlaceholder} />
                      <div className="flex flex-wrap gap-1.5">
                        {c.suggestions.map((suggestion) => (
                          <Chip key={suggestion} controlSize="xsmall" onClick={() => setSearchTerm(suggestion)}>{suggestion}</Chip>
                        ))}
                      </div>
                    </div>
                  </PreviewLocaleScope>
                </GuideVisual>
              </div>
              <div className="mt-8 grid gap-8">
                <div>
                  <GuidelineTitle>누르면 값이 채워지게 하기</GuidelineTitle>
                  <GuidelineList items={["전체 Click을 사용하고 Remove button은 두지 않습니다.", "제안을 지우는 것이 아니라 받아들이는 자리입니다."]} />
                </div>
                <div>
                  <GuidelineTitle>Label만 두는 기본 형태를 쓰기</GuidelineTitle>
                  <GuidelineList items={["제안은 여러 개를 훑어 고르는 자리이므로 항목마다 아이콘이나 Prefix가 붙으면 훑는 속도가 떨어집니다."]} />
                </div>
                <div>
                  <GuidelineTitle>Active를 사용하지 않기</GuidelineTitle>
                  <GuidelineList items={["켜고 끄는 상태가 아니라 누르는 순간 값이 채워지고 그 역할이 끝납니다.", "켜진 상태로 남는 선택은 Selection이 담당합니다."]} />
                </div>
              </div>
            </div>

            <div>
              <GuidelineGroupTitle>Chip을 Input으로 사용하기</GuidelineGroupTitle>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-oe-foreground-secondary">고른 값을 계속 보여 주고 개별로 지우는 자리입니다.</p>
              <div className="mt-3">
                <GuideVisual label="선택 결과" contentClassName="mx-auto w-[375px] max-w-full px-4 py-4">
                  <PreviewLocaleScope className="w-full">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {c.inputValues.map((value, index) => (removedValues.includes(index) ? null : (
                        <Chip
                          key={value}
                          controlSize="small"
                          onRemove={() => setRemovedValues((previous) => [...previous, index])}
                          removeLabel={`${value} ${c.remove}`}
                          removeTooltip={c.removeTooltip}
                        >
                          {value}
                        </Chip>
                      )))}
                      {removedValues.length === c.inputValues.length ? (
                        <div className="flex items-center gap-3 text-xs text-oe-foreground-tertiary">
                          <span>{c.inputEmpty}</span>
                          <button type="button" onClick={() => setRemovedValues([])} className="underline">{c.restore}</button>
                        </div>
                      ) : null}
                    </div>
                  </PreviewLocaleScope>
                </GuideVisual>
              </div>
              <div className="mt-8 grid gap-8">
                <div>
                  <GuidelineTitle>개별 제거는 Remove button으로 받기</GuidelineTitle>
                  <GuidelineList items={["전체 Click은 두지 않습니다. 이미 고른 값이므로 지우는 것 외에 누를 동작이 없습니다."]} />
                </div>
                <div>
                  <GuidelineTitle>담는 영역의 규칙은 Combobox가 소유하기</GuidelineTitle>
                  <GuidelineList items={[<>값을 계속 보이게 두는 이유, 최대 높이 안에서의 스크롤과 내부 검색은 <Link href="/components/combobox" className={GUIDELINE_LINK}>Combobox</Link>가 정합니다.</>, "Chip 쪽에는 하나의 값을 어떻게 표시하고 지우는지만 둡니다."]} />
                </div>
              </div>
            </div>

            <div>
              <GuidelineGroupTitle>Chip을 정보 표시로 사용하기</GuidelineGroupTitle>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-oe-foreground-secondary">여러 값을 나열해 각 값이 구분되어 읽히게 하는 자리입니다. 리뷰 관리 화면에서 사용자가 주문한 메뉴를 보여 주는 경우가 여기에 해당합니다.</p>
              <div className="mt-3">
                <GuideVisual label="주문 메뉴" contentClassName="mx-auto w-[375px] max-w-full px-4 py-4">
                  <PreviewLocaleScope className="w-full">
                    <div className="space-y-2">
                      <p className="text-xs text-oe-foreground-tertiary">{c.orderLabel}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {c.orderItems.map((item) => <Chip key={item} controlSize="small">{item}</Chip>)}
                      </div>
                    </div>
                  </PreviewLocaleScope>
                </GuideVisual>
              </div>
              <div className="mt-8 grid gap-8">
                <div>
                  <GuidelineTitle>누를 수도 지울 수도 없게 두기</GuidelineTitle>
                  <GuidelineList items={[<><code className="text-xs text-oe-foreground-primary">onClick</code>도 <code className="text-xs text-oe-foreground-primary">onRemove</code>도 주지 않습니다. 읽는 것이 전부입니다.</>, "고르는 자리가 아니므로 Active도 사용하지 않습니다."]} />
                </div>
                <div>
                  <GuidelineTitle>값이 여럿일 때 쓰기</GuidelineTitle>
                  <GuidelineList items={["값의 경계를 눈으로 가르는 것이 이 쓰임의 목적입니다.", "값 하나를 문장 안에서 보여 주는 것으로 충분하면 Chip을 쓰지 않습니다."]} />
                </div>
              </div>
            </div>
          </div>
        </Section>

        <Section id="property-map" title="Property map" description="현재 구현에서 확인되는 Property와 허용 값입니다.">
          <div className="col-span-full overflow-x-auto">
            <table className="w-full min-w-[44rem] text-left text-xs">
              <thead className="border-b border-oe-border-secondary text-oe-foreground-tertiary"><tr><th className="py-2 font-medium">Property</th><th className="py-2 font-medium">Values</th><th className="py-2 font-medium">Default</th><th className="py-2 font-medium">Status</th></tr></thead>
              <tbody className="divide-y divide-oe-border-secondary text-oe-foreground-secondary">
                <MapRow property="controlSize" values="xsmall | small | regular | large | xlarge" defaultValue="regular" />
                <MapRow property="shape" values="circle | rounded" defaultValue="circle" />
                <MapRow property="active" values="boolean" defaultValue="false" />
                <MapRow property="children" values="string" defaultValue="undefined" note="Label" />
                <MapRow property="prefix" values="string" defaultValue="undefined" />
                <MapRow property="leadingElement / trailingElement" values="ReactNode" defaultValue="undefined" note="Icon only" />
                <MapRow property="leadingTone / trailingTone" values="secondary | tertiary" defaultValue="secondary" />
                <MapRow property="onClick" values="() => void" defaultValue="undefined" note="onRemove와 배타" />
                <MapRow property="onRemove / removeLabel" values="() => void / string" defaultValue="undefined" note="onClick과 배타" />
                <MapRow property="ariaLabel" values="string" defaultValue="undefined" note="Icon only에서 필수" />
              </tbody>
            </table>
          </div>
        </Section>
      </div>
      <OnThisPage items={sections} componentKey="chip" />
    </div>
  );
}

function Example({ label, description, children }: { label: string; description?: string; children: ReactNode }) { return <div className="flex min-h-28 min-w-0 flex-col gap-3 rounded-xl border border-oe-border-secondary p-4"><div><p className="text-xs font-medium text-oe-foreground-primary">{label}</p>{description ? <p className="mt-1 text-[11px] leading-4 text-oe-foreground-tertiary">{description}</p> : null}</div><PreviewLocaleScope className="mt-auto">{children}</PreviewLocaleScope></div>; }
function UsageRow({ usage, shape, click, remove, active }: { usage: string; shape: string; click: string; remove: string; active: string }) { return <tr><td className="py-3 pr-4 font-medium text-oe-foreground-primary">{usage}</td><td className="py-3 pr-4"><code className="text-[11px]">{shape}</code></td><td className="py-3 pr-4">{click}</td><td className="py-3 pr-4">{remove}</td><td className="py-3">{active}</td></tr>; }

function MapRow({ property, values, defaultValue, note = "Draft" }: { property: string; values: string; defaultValue: string; note?: string }) { return <tr><td className="py-3 pr-4 font-medium text-oe-foreground-primary">{property}</td><td className="py-3 pr-4 font-mono text-[11px]">{values}</td><td className="py-3 pr-4 font-mono text-[11px]">{defaultValue}</td><td className="py-3">{note}</td></tr>; }

function Section({ id, title, description, children }: { id: string; title: string; description: string; children: ReactNode }) { return <section id={id} className="scroll-mt-20 rounded-2xl border border-oe-border-secondary bg-oe-background-primary p-5"><h3 className="text-xl font-semibold text-oe-foreground-primary">{title}</h3><p className="mt-1 text-xs leading-5 text-oe-foreground-tertiary">{description}</p><div className="mt-5 grid gap-3 @min-[720px]:grid-cols-2">{children}</div></section>; }
function ControlSection({ title, children }: { title: string; children: ReactNode }) { return <section><h4 className="mb-3 text-sm font-semibold text-oe-foreground-primary">{title}</h4><div className="space-y-3">{children}</div></section>; }
function ControlGroup({ label, children }: { label: string; children: ReactNode }) { return <fieldset><legend className="mb-2 text-[11px] font-medium text-oe-foreground-tertiary">{label}</legend><div className="flex flex-wrap gap-1.5">{children}</div></fieldset>; }
function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) { return <div className="flex items-center justify-between gap-3"><span className="text-[11px] font-medium text-oe-foreground-tertiary">{label}</span><button type="button" role="switch" aria-checked={value} aria-label={label} onClick={() => onChange(!value)} className={`relative h-5 w-9 shrink-0 rounded-full ${value ? "bg-oe-background-bold-primary" : "bg-oe-background-secondary ring-1 ring-inset ring-oe-border-primary"}`}><span className={`absolute top-0.5 size-4 rounded-full bg-oe-background-primary shadow-sm transition-[left] ${value ? "left-[18px]" : "left-0.5"}`} /></button></div>; }
function capitalize(value: string) { return value.charAt(0).toUpperCase() + value.slice(1); }
