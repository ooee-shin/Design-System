"use client";

import { useRef, useState, type ReactNode } from "react";
import { RiArrowDownSLine, RiCloseLine, RiGlobalLine, RiResetRightLine } from "@remixicon/react";

import { Chip, type ChipShape, type ChipSize, type ChipTone } from "@ooee/ui";
import { GuidelineGroupTitle, GuidelineTitle } from "@/components/guideline-title";
import { GuidelineList, GuideVisual } from "@/components/component-guidelines";
import { AnatomyBoundaryMarker, AnatomyLegend, AnatomyNumber, AnatomyStructureMap, AnatomySurface, AnatomySwapSlot } from "@/components/component-anatomy";
import { OnThisPage } from "@/components/component-detail-navigation";
import { DependentControlGroup, PlaygroundChoice as Choice } from "@/components/playground-element-control";
import { PreviewLocaleScope } from "@/components/preview-locale-scope";
import { useStudioPreferences } from "@/components/studio-preferences-provider";

type ChipElement = "none" | "icon";

// studio.md:74 는 정적 도식도 실제 렌더링과 같아 보여야 한다고 정한다. Large Chip 이
// 쓰는 클래스를 그대로 적는다. 마커는 각 요소를 감싼 relative 안에 두어 좌표를 짐작하지
// 않는다.
const CHIP_DIAGRAM = "inline-flex h-oe-control-large items-center gap-1.5 rounded-full border border-oe-border-primary bg-oe-background-primary px-3 text-sm font-medium text-oe-foreground-secondary [&_svg]:size-oe-icon-medium";

const sizeLabels = {
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
    description: "선택한 값이나 필터 항목을 한 줄 Container로 표시하는 컴포넌트입니다. 확정 전 초안이므로 현재는 Playground만 제공합니다.",
    label: "Label",
    prefix: "Prefix",
    ariaLabel: "Chip",
    remove: "Chip 삭제",
    removeTooltip: "삭제",
    reset: "초기화",
  },
  en: {
    description: "Displays a selected value or filter item in a single-line container. This is a draft, so only the playground is available for now.",
    label: "Label",
    prefix: "Prefix",
    ariaLabel: "Chip",
    remove: "Remove chip",
    removeTooltip: "Remove",
    reset: "Reset",
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
  const [activeFilters, setActiveFilters] = useState<number[]>([]);
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

  function endDrag(event: React.PointerEvent<HTMLDivElement>) {
    const state = drag.current;
    if (!state) return;
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
                  <ControlGroup label="Control size">{(["small", "regular", "large", "xlarge"] as const).map((item) => <Choice key={item} active={controlSize === item} onClick={() => setControlSize(item)}>{capitalize(item)}</Choice>)}</ControlGroup>
                  <ControlGroup label="Shape">{(["circle", "rounded"] as const).map((item) => <Choice key={item} active={shape === item} onClick={() => setShape(item)}>{capitalize(item)}</Choice>)}</ControlGroup>
                </ControlSection>
                <ControlSection title="State">
                  <Toggle label="Active" value={active} onChange={setActive} />
                </ControlSection>
              </div>
              <div className="space-y-4">
                <ControlSection title="Content">
                  <Toggle label="Prefix" value={prefix} onChange={setPrefix} />
                  <Toggle label="Label" value={label} onChange={setLabel} />
                  {label ? null : <DependentControlGroup><p className="text-[11px] leading-4 text-oe-foreground-placeholder">Label이 없으면 Icon only이므로 Leading element를 유지합니다.</p></DependentControlGroup>}
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
                <span className="relative inline-flex">
                  <span className={CHIP_DIAGRAM}>
                    <span className="relative min-w-0">
                      <span className="block truncate">{c.label}</span>
                      <AnatomyNumber number={2} className="-top-11 left-1/2 -translate-x-1/2" lineClassName="left-2.5 top-5 h-6 w-px" />
                    </span>
                  </span>
                  <AnatomyBoundaryMarker number={1} side="left" connectorLength={36} boundaryLength={56} className="right-full top-1/2 mr-16 -translate-y-1/2" />
                </span>
              </div>
            </AnatomySurface>
            <AnatomyLegend items={[{ name: "Container" }, { name: "Label" }]} />

            <div className="mt-6">
              <AnatomySurface ariaLabel="Chip extended anatomy" title="Extended anatomy" className="px-5 pb-5 pt-12">
                <div className="flex h-36 items-center justify-center">
                  <span className={CHIP_DIAGRAM}>
                    <span className="relative flex shrink-0 items-center">
                      <AnatomySwapSlot className="size-5" />
                      <AnatomyNumber number={3} className="-top-11 left-1/2 -translate-x-1/2" lineClassName="left-2.5 top-5 h-6 w-px" />
                    </span>
                    <span className="relative shrink-0 text-oe-foreground-tertiary">
                      {c.prefix}
                      <AnatomyNumber number={4} className="-bottom-11 left-1/2 -translate-x-1/2" lineClassName="bottom-5 left-2.5 h-6 w-px" />
                    </span>
                    <span className="min-w-0 truncate">{c.label}</span>
                    <span className="relative flex shrink-0 items-center">
                      <AnatomySwapSlot className="size-5" />
                      <AnatomyNumber number={5} className="-top-11 left-1/2 -translate-x-1/2" lineClassName="left-2.5 top-5 h-6 w-px" />
                    </span>
                    <span className="relative grid size-5 shrink-0 place-items-center rounded-md text-oe-foreground-tertiary">
                      <RiCloseLine aria-hidden="true" />
                      <AnatomyNumber number={6} className="-bottom-11 left-1/2 -translate-x-1/2" lineClassName="bottom-5 left-2.5 h-6 w-px" />
                    </span>
                  </span>
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
          {(["small", "regular", "large", "xlarge"] as const).map((item) => (
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
            </div>

            <div>
              <GuidelineGroupTitle>Chip을 Suggestion으로 사용하기</GuidelineGroupTitle>
            </div>

            <div>
              <GuidelineGroupTitle>Chip을 정보 표시로 사용하기</GuidelineGroupTitle>
            </div>
          </div>
        </Section>

        <Section id="property-map" title="Property map" description="현재 구현에서 확인되는 Property와 허용 값입니다.">
          <div className="col-span-full overflow-x-auto">
            <table className="w-full min-w-[44rem] text-left text-xs">
              <thead className="border-b border-oe-border-secondary text-oe-foreground-tertiary"><tr><th className="py-2 font-medium">Property</th><th className="py-2 font-medium">Values</th><th className="py-2 font-medium">Default</th><th className="py-2 font-medium">Status</th></tr></thead>
              <tbody className="divide-y divide-oe-border-secondary text-oe-foreground-secondary">
                <MapRow property="controlSize" values="small | regular | large | xlarge" defaultValue="regular" />
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
function MapRow({ property, values, defaultValue, note = "Draft" }: { property: string; values: string; defaultValue: string; note?: string }) { return <tr><td className="py-3 pr-4 font-medium text-oe-foreground-primary">{property}</td><td className="py-3 pr-4 font-mono text-[11px]">{values}</td><td className="py-3 pr-4 font-mono text-[11px]">{defaultValue}</td><td className="py-3">{note}</td></tr>; }

function Section({ id, title, description, children }: { id: string; title: string; description: string; children: ReactNode }) { return <section id={id} className="scroll-mt-20 rounded-2xl border border-oe-border-secondary bg-oe-background-primary p-5"><h3 className="text-xl font-semibold text-oe-foreground-primary">{title}</h3><p className="mt-1 text-xs leading-5 text-oe-foreground-tertiary">{description}</p><div className="mt-5 grid gap-3 @min-[720px]:grid-cols-2">{children}</div></section>; }
function ControlSection({ title, children }: { title: string; children: ReactNode }) { return <section><h4 className="mb-3 text-sm font-semibold text-oe-foreground-primary">{title}</h4><div className="space-y-3">{children}</div></section>; }
function ControlGroup({ label, children }: { label: string; children: ReactNode }) { return <fieldset><legend className="mb-2 text-[11px] font-medium text-oe-foreground-tertiary">{label}</legend><div className="flex flex-wrap gap-1.5">{children}</div></fieldset>; }
function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) { return <div className="flex items-center justify-between gap-3"><span className="text-[11px] font-medium text-oe-foreground-tertiary">{label}</span><button type="button" role="switch" aria-checked={value} aria-label={label} onClick={() => onChange(!value)} className={`relative h-5 w-9 shrink-0 rounded-full ${value ? "bg-oe-background-bold-primary" : "bg-oe-background-secondary ring-1 ring-inset ring-oe-border-primary"}`}><span className={`absolute top-0.5 size-4 rounded-full bg-oe-background-primary shadow-sm transition-[left] ${value ? "left-[18px]" : "left-0.5"}`} /></button></div>; }
function capitalize(value: string) { return value.charAt(0).toUpperCase() + value.slice(1); }
