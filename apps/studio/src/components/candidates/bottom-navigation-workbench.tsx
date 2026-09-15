"use client";

import { useState, type ReactNode } from "react";
import {
  RiBarChartBoxFill,
  RiBarChartBoxLine,
  RiCalendar2Fill,
  RiCalendar2Line,
  RiHome5Fill,
  RiHome5Line,
  RiMenuFill,
  RiMenuLine,
  RiStore2Fill,
  RiStore2Line,
} from "@remixicon/react";
import {
  AppHeader,
  BottomNavigation,
  NotificationBadge,
  type BottomNavigationItem,
  type BottomNavigationVariant,
} from "@ooee/ui";

import { AnatomyBoundaryMarker, AnatomyFrame, AnatomyLegend, AnatomyNumber, AnatomyStructureMap, AnatomySurface } from "@/components/component-anatomy";
import { GuidelineList, UsageComparison } from "@/components/component-guidelines";
import { GuidelineTitle } from "@/components/guideline-title";
import { OnThisPage } from "@/components/component-detail-navigation";
import { PreviewLocaleScope } from "@/components/preview-locale-scope";
import { PlaygroundChoice as Choice } from "@/components/playground-element-control";
import { cn } from "@/lib/utils";
import { useStudioPreferences } from "@/components/studio-preferences-provider";

const SMALL_LABEL = "text-[11px] font-medium text-oe-foreground-tertiary";

// 모바일 전용이므로 검수도 좁은 폭에서 한다. 375px 은 지금 국내에서 가장 좁은 축에 드는 실제
// 기기 폭이며, 여기서 라벨이 들어가면 더 넓은 기기에서도 들어간다.
const PHONE_WIDTH = "w-[375px]";
const PHONE_SCROLL = "overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

const SKELETON_TITLE = "h-3";
const SKELETON_BODY = "h-2.5";

const GUIDE_BOX = "flex min-h-28 w-full";

// 실제 BottomNavigation 대신 도식으로 쓰는 모양이다. 높이와 여백은 구현과 같게 두고 색은 선택되지
// 않은 항목과 같은 회색조를 쓴다. 선택된 항목의 색을 쓰면 Anatomy 가 특정 상태의 예시처럼 읽힌다.
// Badge 만 실제 컴포넌트를 그대로 쓴다. 알림 표시는 색 자체가 뜻이라 회색으로 낮추면 그냥 점으로
// 읽힌다.
const NAV_DIAGRAM = "flex h-14 w-[320px] items-center rounded-lg border border-oe-border-secondary bg-oe-background-primary";
const DIAGRAM_ITEM = "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 text-oe-foreground-tertiary [&_svg]:size-6";
const DIAGRAM_ICON = "relative flex shrink-0 items-center text-neutral-400 dark:text-neutral-600";

const itemCounts = [3, 4, 5] as const;

const variants = ["bar", "floating"] as const satisfies readonly BottomNavigationVariant[];

const variantLabel: Record<BottomNavigationVariant, string> = {
  bar: "Bar",
  floating: "Floating",
};

type ItemCount = (typeof itemCounts)[number];

const sections = [
  { id: "playground", label: "Playground" },
  { id: "anatomy", label: "Anatomy" },
  { id: "variant", label: "Style" },
  { id: "state", label: "State" },
  { id: "count", label: "Item count" },
  { id: "badge", label: "Badge" },
  { id: "safe-area", label: "하단 여백" },
  { id: "with-app-header", label: "AppHeader와 함께" },
  { id: "guidelines", label: "Guidelines" },
  { id: "property-map", label: "Property map" },
];

const copy = {
  ko: {
    labels: ["홈", "일정", "가맹점", "매출", "더보기"],
    longLabel: "가맹점매출관리센터",
    screen: "화면 이름",
    filterAll: "전체",
    filterOngoing: "진행중",
    filterDone: "완료",
  },
  en: {
    labels: ["Home", "Schedule", "Stores", "Sales", "More"],
    longLabel: "Store sales management",
    screen: "Screen title",
    filterAll: "All",
    filterOngoing: "Open",
    filterDone: "Done",
  },
} as const;

type Copy = (typeof copy)[keyof typeof copy];

// 아이콘과 라벨은 이 컴포넌트가 정하는 것이 아니라 자리를 보여 주는 예시다. 무엇이 들어갈지는
// 제품이 정한다. 선택되지 않은 항목은 Line, 선택된 항목은 Fill 이므로 짝으로 둔다.
const ICONS = [
  { line: <RiHome5Line key="1" />, fill: <RiHome5Fill key="1f" /> },
  { line: <RiCalendar2Line key="2" />, fill: <RiCalendar2Fill key="2f" /> },
  { line: <RiStore2Line key="3" />, fill: <RiStore2Fill key="3f" /> },
  { line: <RiBarChartBoxLine key="4" />, fill: <RiBarChartBoxFill key="4f" /> },
  { line: <RiMenuLine key="5" />, fill: <RiMenuFill key="5f" /> },
];

function allItems(c: Copy): BottomNavigationItem[] {
  return ICONS.map((icon, index) => ({
    value: String(index),
    label: c.labels[index],
    icon: icon.line,
    selectedIcon: icon.fill,
  }));
}

function itemsOf(count: ItemCount, c: Copy) {
  return allItems(c).slice(0, count);
}

export function BottomNavigationWorkbench() {
  const { locale } = useStudioPreferences();
  const c = copy[locale];
  const [count, setCount] = useState<ItemCount>(5);
  const [value, setValue] = useState("0");
  const [showBadge, setShowBadge] = useState(false);
  const [variant, setVariant] = useState<BottomNavigationVariant>("bar");
  const [showLabels, setShowLabels] = useState(false);

  const playgroundItems = itemsOf(count, c).map((item, index) =>
    showBadge && index === 1 ? { ...item, badge: { count: 3 } } : item,
  );

  return (
    <div className="grid items-start gap-6 @min-[1120px]:grid-cols-[minmax(0,1fr)_11rem]">
      <div className="min-w-0 space-y-5">
        <Section id="playground" title="🚩 Playground" description="항목 개수와 알림 표시를 조합해 확인합니다. 선택은 Control로 고르지 않고 미리보기의 항목을 직접 눌러 옮깁니다. 항목의 아이콘과 라벨은 자리를 보여 주는 예시이며 무엇이 들어갈지는 제품이 정합니다. 항목은 개수와 무관하게 같은 폭을 나눠 가집니다. 줄 높이는 형태와 라벨 유무가 정합니다.">
          <div className="col-span-full grid gap-5 rounded-xl border-2 border-oe-border-bold-primary bg-oe-background-secondary p-4 @min-[760px]:grid-cols-[minmax(20rem,1fr)_16rem]">
            <div className="flex items-start justify-center">
              <PhoneFrame>
                <div className={cn("flex-1", PHONE_SCROLL)}>
                  <PhoneBody />
                </div>
                <BottomNavigation
                  value={value}
                  onValueChange={setValue}
                  items={playgroundItems}
                  variant={variant}
                  showLabels={showLabels}
                />
              </PhoneFrame>
            </div>
            <div className="space-y-5 rounded-xl bg-oe-background-primary p-4">
              <ControlSection title="Style">
                <ControlGroup label="Variant">{variants.map((item) => <Choice key={item} active={variant === item} onClick={() => setVariant(item)}>{variantLabel[item]}</Choice>)}</ControlGroup>
              </ControlSection>
              <ControlSection title="Elements">
                <ControlGroup label="Items">{itemCounts.map((item) => <Choice key={item} active={count === item} onClick={() => { setCount(item); if (Number(value) >= item) setValue("0"); }}>{`${item}개`}</Choice>)}</ControlGroup>
                <Toggle label="Label" value={showLabels} onChange={setShowLabels} />
                <Toggle label="Badge" value={showBadge} onChange={setShowBadge} />
              </ControlSection>
            </div>
          </div>
        </Section>

        <Section id="anatomy" title="Anatomy" description="BottomNavigation을 구성하는 실제 요소와 문서에서 사용하는 명칭입니다. Item은 Icon과 Label을 한 덩어리로 가지며 Notification Badge만 선택입니다. 자리를 열어 두지 않고 항목 목록을 받으므로 소비자가 Item 내부를 따로 조립하지 않습니다.">
          <div className="col-span-full min-w-0">
            <AnatomySurface ariaLabel="BottomNavigation anatomy" title="BottomNavigation structure" className="px-5 pb-5 pt-12">
              <div lang="en" className="flex h-40 items-center justify-center">
                <AnatomyFrame>
                  <div data-slot="bottom-navigation" className={NAV_DIAGRAM}>
                    <span data-slot="bottom-navigation-item" className={DIAGRAM_ITEM}>
                      <span className={DIAGRAM_ICON}><RiHome5Fill aria-hidden="true" /></span>
                      <span className="truncate text-[11px] leading-[14px] font-medium">Label</span>
                    </span>
                    <span className={DIAGRAM_ITEM}>
                      <span data-slot="bottom-navigation-icon" className={DIAGRAM_ICON}><RiCalendar2Fill aria-hidden="true" /></span>
                      <span data-slot="bottom-navigation-label" className="truncate text-[11px] leading-[14px] font-medium">Label</span>
                    </span>
                    <span className={DIAGRAM_ITEM}>
                      <span data-slot="bottom-navigation-badge" className={DIAGRAM_ICON}>
                        <RiStore2Fill aria-hidden="true" />
                        <NotificationBadge className="absolute right-0 top-0 translate-x-1/2 -translate-y-1/3" />
                      </span>
                      <span className="truncate text-[11px] leading-[14px] font-medium">Label</span>
                    </span>
                  </div>
                  <AnatomyBoundaryMarker number={1} target="[data-slot=bottom-navigation]" side="left" connectorLength={36} />
                  <AnatomyNumber number={2} target="[data-slot=bottom-navigation-item]" side="bottom" />
                  <AnatomyNumber number={3} target="[data-slot=bottom-navigation-icon]" side="top" />
                  <AnatomyNumber number={4} target="[data-slot=bottom-navigation-label]" side="bottom" />
                  <AnatomyNumber number={5} target="[data-slot=bottom-navigation-badge]" side="top" />
                </AnatomyFrame>
              </div>
            </AnatomySurface>
            <AnatomyLegend items={[{ name: "Container" }, { name: "Item" }, { name: "Icon" }, { name: "Label" }, { name: "Notification Badge", optional: true }]} />

            <div className="mt-4">
              <AnatomyStructureMap lines={[
                { name: "BottomNavigation" },
                { prefix: "└─ ", name: "Item" },
                { prefix: "   ├─ ", name: "Icon" },
                { prefix: "   │  └─ ", name: "Notification Badge", optional: true },
                { prefix: "   └─ ", name: "Label" },
              ]} />
            </div>
          </div>
        </Section>

        <Section id="variant" title="Properties · Style" description="형태는 둘이며 기본값은 Bar입니다. 담는 것은 같고 줄이 서는 방식과 선택 표시의 모양이 다릅니다. 한 제품 안에서는 하나를 골라 모든 화면이 같은 것을 씁니다.">
          <Example label="Bar" description="화면 바닥에 붙어 폭을 다 쓰고 위쪽에 선을 둡니다. 선택 표시가 아이콘만 감싸므로 라벨이 그 밖에 남습니다.">
            <PhoneStrip>
              <BottomNavigation value="0" items={itemsOf(5, c)} showLabels />
            </PhoneStrip>
          </Example>
          <Example label="Floating" description="좌우에 여백을 두고 떠서 알약으로 섭니다. 선이 아니라 그림자로 본문과 갈리고, 선택 표시가 항목 전체를 감쌉니다.">
            <PhoneStrip>
              <BottomNavigation value="0" items={itemsOf(5, c)} variant="floating" />
            </PhoneStrip>
          </Example>
        </Section>

        <Section id="state" title="Properties · State" description="항목이 갖는 상태는 선택 여부 하나입니다. 선택되지 않은 항목은 Line, 선택된 항목은 Fill을 씁니다. 색만으로 가르면 다섯이 나란히 선 자리에서 어느 것이 켜져 있는지 한눈에 들어오지 않습니다.">
          <Example label="Selected" description="아이콘이 Fill로 바뀌고 가장 진한 중립이 되며 배경 표시를 갖습니다. Brand를 쓰지 않는 이유는 하단 내비가 알리는 것이 브랜드가 아니라 지금 어느 화면에 있는지이기 때문입니다.">
            <PhoneStrip>
              <BottomNavigation value="0" items={itemsOf(4, c)} showLabels />
            </PhoneStrip>
          </Example>
          <Example label="Unselected" description="아이콘과 라벨이 함께 oe-foreground-subtle입니다. 둘을 갈라 놓으면 아이콘이 먼저 사라지면서 항목이 무엇인지 알아보기 어려워집니다.">
            <PhoneStrip>
              <BottomNavigation value="none" items={itemsOf(4, c)} showLabels />
            </PhoneStrip>
          </Example>
          <Example label="선택 표시는 자리를 옮긴다" description="항목마다 배경을 켜고 끄지 않고 표시 하나가 다음 자리로 미끄러집니다. 어디에서 어디로 갔는지가 움직임 자체로 읽힙니다. 누르는 동안에는 아이콘이 작아졌다가 손을 떼면 돌아옵니다. 움직임을 줄이도록 설정한 기기에서는 전환 없이 곧바로 자리를 잡습니다.">
            <PhoneStrip>
              <MovingIndicatorDemo items={itemsOf(5, c)} />
            </PhoneStrip>
          </Example>
        </Section>

        <Section id="count" title="Properties · Item count" description="항목은 셋부터 다섯까지 둡니다. 여섯 개를 넘기면 컴포넌트가 오류를 냅니다. 조용히 잘라 내면 넘긴 항목이 화면에서 사라진 이유를 알 수 없기 때문입니다. 개수와 무관하게 항목은 같은 폭을 나눠 가집니다.">
          {itemCounts.map((item) => (
            <Example key={item} label={`${item}개`} description={item === 5 ? "가장 좁은 조합입니다. 라벨이 들어가는지 이 칸에서 확인합니다." : undefined}>
              <PhoneStrip>
                <BottomNavigation value="0" items={itemsOf(item, c)} showLabels />
              </PhoneStrip>
            </Example>
          ))}
          <Example label="긴 라벨" description="규칙을 어겨 국문 다섯 자를 넘기면 이렇게 잘립니다. 두 줄로 넘기지 않는 것은 그 항목만 높아져 목록의 기준선이 어긋나기 때문입니다.">
            <PhoneStrip>
              <BottomNavigation value="2" items={allItems(c).map((item) => item.value === "2" ? { ...item, label: c.longLabel } : item)} />
            </PhoneStrip>
          </Example>
        </Section>

        <Section id="badge" title="Properties · Badge" description="공용 NotificationBadge를 아이콘의 오른쪽 위 모서리에 붙입니다. count가 없으면 점이고 있으면 개수입니다. 위치는 이 컴포넌트가 소유하므로 붙이는 쪽이 좌표를 정하지 않습니다.">
          <Example label="점" description="처리할 것이 있다는 것만 알립니다.">
            <PhoneStrip>
              <BottomNavigation value="0" items={itemsOf(4, c).map((item) => item.value === "1" ? { ...item, badge: {} } : item)} />
            </PhoneStrip>
          </Example>
          <Example label="개수" description="몇 건인지 함께 알립니다.">
            <PhoneStrip>
              <BottomNavigation value="0" items={itemsOf(4, c).map((item) => item.value === "1" ? { ...item, badge: { count: 12 } } : item)} />
            </PhoneStrip>
          </Example>
        </Section>

        <Section id="safe-area" title="하단 여백" description="줄 바깥에 하단 여백을 더합니다. 값은 기기의 안전 영역과 최소 16px 중 큰 쪽입니다. 높이 안에 넣지 않는 이유는 인디케이터가 있는 기기에서 항목이 그만큼 눌리기 때문입니다. Floating은 같은 여백을 알약 바깥의 여백으로 내보냅니다. 안쪽에 두면 알약이 그만큼 높아져 라벨을 감춰도 흰 면이 줄어들지 않습니다.">
          <Example label="홈 인디케이터가 없는 기기" description="안전 영역이 0이라 최소 16px을 씁니다. 이 값이 없으면 항목이 화면 맨 아래에 붙어 손가락이 닿기 어렵고 안드로이드의 제스처 핸들과 겹칩니다.">
            <PhoneBottomEdge>
              <BottomNavigation value="0" items={itemsOf(4, c)} showLabels />
            </PhoneBottomEdge>
          </Example>
          <Example label="홈 인디케이터가 있는 기기" description="안전 영역이 34px이라 그쪽이 커서 그 값을 씁니다. 검수 화면의 브라우저에는 안전 영역이 없으므로 이 칸만 같은 값을 직접 넣어 흉내 냈습니다.">
            <PhoneBottomEdge indicator>
              <BottomNavigation value="0" items={itemsOf(4, c)} className="pb-[34px]" />
            </PhoneBottomEdge>
          </Example>
        </Section>

        <Section id="with-app-header" title="AppHeader와 함께" description="두 컴포넌트가 화면의 위아래를 잡습니다. 본문만 스크롤되고 두 줄은 제자리에 머뭅니다. 아래쪽이 더 두꺼운 것은 줄 바깥에 하단 여백이 붙기 때문입니다.">
          <div className="col-span-full flex justify-center">
            <PhoneFrame>
              <AppHeader title={c.screen} />
              <div className={cn("flex-1", PHONE_SCROLL)}>
                <PhoneBody />
              </div>
              <BottomNavigation value="2" items={allItems(c)} showLabels />
            </PhoneFrame>
          </div>
        </Section>

        <Section id="guidelines" title="Guidelines" description="BottomNavigation을 언제 쓰고 어떻게 채우는지에 대한 규칙입니다.">
          <div className="col-span-full space-y-8">
            <div>
              <GuidelineTitle>이 컴포넌트를 쓰는 자리</GuidelineTitle>
              <GuidelineList items={[
                "모바일 화면의 맨 아랫줄에 씁니다. 데스크톱 화면에는 쓰지 않습니다.",
                "제품 전체를 가르는 최상위 화면으로만 옮깁니다. 한 화면 안에서 영역을 오가는 자리에는 쓰지 않습니다.",
                "모든 최상위 화면에 같은 항목을 같은 순서로 둡니다. 화면마다 항목이 달라지면 지금 어디에 있는지 알 수 없습니다.",
              ]} />
            </div>

            <div>
              <GuidelineTitle>항목 정하기</GuidelineTitle>
              <GuidelineList items={[
                "항목은 셋부터 다섯까지 둡니다. 둘이면 화면을 가르는 것이 아니라 값을 고르는 것이므로 다른 컴포넌트를 씁니다.",
                "라벨은 국문 다섯 자, 영문 열 자 안에서 끝냅니다. 넘치면 한 줄에서 잘려 무엇인지 읽히지 않습니다.",
                "아이콘은 Fill을 씁니다. 선택된 항목만 색이 바뀌고 모양은 그대로입니다.",
                "첫 항목은 홈처럼 돌아오는 자리로 둡니다.",
              ]} />
            </div>

            <div>
              <GuidelineTitle>알림 표시 쓰기</GuidelineTitle>
              <GuidelineList items={[
                "동시에 세 항목 미만에만 붙입니다. 여러 항목이 함께 알리면 어디를 먼저 봐야 하는지 알 수 없습니다.",
                "개수를 세는 것이 뜻이 있을 때만 count를 넘깁니다. 처리할 것이 있다는 것만 말하면 점으로 둡니다.",
              ]} />
            </div>

            <UsageComparison
              title="화면을 가르는 자리에만 쓰기"
              doText="최상위 화면을 오갑니다."
              dontText="한 화면 안의 영역을 나누지 않습니다."
              description={[
                "하단 내비게이션은 지금 어느 화면에 있는지를 알리는 자리입니다. 한 화면 안에서 목록을 거르거나 구간을 나누는 데 쓰면 위치 표시가 아니라 조작 도구로 읽힙니다.",
                "한 화면 안을 나누는 것은 Tab이 맡습니다. 아직 시스템에 없으므로 필요해지면 그때 만듭니다.",
              ]}
              doVisual={<GuideExample className="items-end"><GuideNav c={c} picks={[0, 1, 4]} /></GuideExample>}
              dontVisual={<GuideExample className="items-end"><GuideNav c={c} picks={[0, 1, 4]} labels={[c.filterAll, c.filterOngoing, c.filterDone]} /></GuideExample>}
            />

            <UsageComparison
              title="화면마다 항목을 바꾸지 않기"
              doText="어느 화면에서나 같은 항목입니다."
              dontText="화면에 따라 항목을 갈아 끼우지 않습니다."
              description={[
                "항목이 화면마다 달라지면 같은 자리를 눌러도 다른 곳으로 가게 되어, 하단 줄이 위치 표시가 아니라 화면마다 다른 메뉴가 됩니다.",
                "그 화면에서만 필요한 동작은 AppHeader의 오른쪽 자리나 본문에 둡니다.",
              ]}
              doVisual={<GuideExample className="flex-col justify-end gap-2"><GuideNav c={c} picks={[0, 1, 4]} /><GuideNav c={c} picks={[0, 1, 4]} /></GuideExample>}
              dontVisual={<GuideExample className="flex-col justify-end gap-2"><GuideNav c={c} picks={[0, 1, 4]} /><GuideNav c={c} picks={[0, 3, 4]} /></GuideExample>}
            />
          </div>
        </Section>

        <Section id="property-map" title="Property map" description="실제 Props와 기본값입니다. items의 각 항목이 갖는 값도 함께 적습니다.">
          <div className="col-span-full overflow-x-auto">
            <table className="w-full min-w-[38rem] text-left text-xs">
              <thead className="border-b border-oe-border-secondary text-oe-foreground-tertiary"><tr><th className="py-2 font-medium">Property</th><th className="py-2 font-medium">Values</th><th className="py-2 font-medium">Default</th></tr></thead>
              <tbody className="divide-y divide-oe-border-secondary text-oe-foreground-secondary">
                <MapRow property="items" values="BottomNavigationItem[] (3~5개)" defaultValue="필수" />
                <MapRow property="value" values="string" defaultValue="필수" />
                <MapRow property="onValueChange" values="(value: string) => void" defaultValue="undefined" />
                <MapRow property="items[].value" values="string" defaultValue="필수" />
                <MapRow property="items[].label" values="ReactNode" defaultValue="필수" />
                <MapRow property="items[].icon" values="ReactNode (Line)" defaultValue="필수" />
                <MapRow property="items[].selectedIcon" values="ReactNode (Fill)" defaultValue="undefined" />
                <MapRow property="items[].badge" values="NotificationBadge의 Props (className 제외)" defaultValue="undefined" />
                <MapRow property="variant" values="bar | floating" defaultValue="bar" />
                <MapRow property="showLabels" values="false | true" defaultValue="false" />
                <MapRow property="className" values="string" defaultValue="undefined" />
              </tbody>
            </table>
          </div>
        </Section>
      </div>
      <OnThisPage items={sections} componentKey="bottom-navigation" />
    </div>
  );
}

// 하단 줄만 잘라 보는 자리다. 스크롤이 필요 없는 카드에서는 본문을 그리지 않는다.
//
// 위에 본문이 없으므로 컴포넌트의 `border-top` 을 걷어낸다. 그 선은 본문과 하단 줄을 가르는
// 역할인데, 여기서는 가를 본문이 없고 카드의 테두리와 겹쳐 위쪽만 2px 로 보인다. Playground 와
// 「AppHeader와 함께」는 본문이 위에 있으므로 그대로 둔다.
const STRIP_CLASS = "mx-auto max-w-full overflow-hidden rounded-xl border border-oe-border-secondary bg-oe-background-primary [&_[data-slot=bottom-navigation]]:border-t-0";

function PhoneStrip({ children }: { children: ReactNode }) {
  return <div className={cn(PHONE_WIDTH, STRIP_CLASS)}>{children}</div>;
}

// 화면의 아래 끝을 보여 주는 자리다. 홈 인디케이터가 있는 기기에서 그 막대와 항목이 겹치지 않는
// 것을 확인한다. 막대의 크기와 자리는 iOS 의 실제 값이다.
function PhoneBottomEdge({ children, indicator = false }: { children: ReactNode; indicator?: boolean }) {
  return (
    <div className={cn(PHONE_WIDTH, "relative", STRIP_CLASS)}>
      {children}
      {indicator ? (
        <span aria-hidden="true" className="pointer-events-none absolute bottom-2 left-1/2 z-20 h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-oe-foreground-primary" />
      ) : null}
    </div>
  );
}

// 실제 기기 폭 안에서 본문 스크롤까지 확인하는 자리다. 하단 줄은 흐름의 마지막에 놓이고 본문만
// 스크롤되므로, 실제 화면에서 두 줄이 제자리에 머무는 것과 같게 동작한다.
function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className={cn(PHONE_WIDTH, "mx-auto flex h-80 max-w-full flex-col overflow-hidden rounded-2xl border border-oe-border-secondary bg-oe-background-primary")}>
      {children}
    </div>
  );
}

function PhoneBody() {
  return (
    <div aria-hidden="true" className="space-y-4 p-4">
      {Array.from({ length: 8 }, (_, index) => (
        <div key={index} className="space-y-2 rounded-lg border border-oe-border-secondary p-3">
          <SkeletonLine className={`${SKELETON_TITLE} w-1/2`} />
          <SkeletonLine className={`${SKELETON_BODY} w-2/3`} />
        </div>
      ))}
    </div>
  );
}

// Guidelines 의 도식도 실제 BottomNavigation 을 쓴다. 크기를 줄인 모형을 따로 그리면 높이와
// 글자, 아이콘의 비율이 실제와 어긋나 규칙이 아니라 모형의 생김새를 보게 된다.
// 라벨과 아이콘의 짝이 어긋나지 않도록 어느 예시 항목을 쓸지 자리 번호로 받는다. 잘못된 쓰임을
// 보여 주는 칸은 예시 항목이 아닌 문구를 쓰므로 `labels` 로 덮어쓴다.
function GuideNav({ c, picks, labels }: { c: Copy; picks: number[]; labels?: string[] }) {
  return (
    <BottomNavigation
      value="0"
      className="rounded-md border border-oe-border-secondary"
      items={picks.map((pick, index) => ({
        value: String(index),
        label: labels?.[index] ?? c.labels[pick],
        icon: ICONS[pick].line,
        selectedIcon: ICONS[pick].fill,
      }))}
    />
  );
}

function Section({ id, title, description, children }: { id: string; title: string; description: string; children: ReactNode }) { return <section id={id} className="scroll-mt-20 rounded-2xl border border-oe-border-secondary bg-oe-background-primary p-5"><h3 className="text-xl font-semibold text-oe-foreground-primary">{title}</h3><p className="mt-1 text-xs leading-5 text-oe-foreground-tertiary">{description}</p><div className="mt-5 grid gap-3 @min-[720px]:grid-cols-2">{children}</div></section>; }
function ControlSection({ title, children }: { title: string; children: ReactNode }) { return <section><h4 className="mb-3 text-sm font-semibold text-oe-foreground-primary">{title}</h4><div className="space-y-3">{children}</div></section>; }
/** 선택이 옮겨 가는 것은 정지한 그림으로 보이지 않으므로 이 칸만 눌러 볼 수 있게 둔다. */
function MovingIndicatorDemo({ items }: { items: BottomNavigationItem[] }) {
  const [value, setValue] = useState(items[0].value);
  return <BottomNavigation value={value} onValueChange={setValue} items={items} showLabels />;
}

function ControlGroup({ label, children }: { label: string; children: ReactNode }) { return <fieldset><legend className={`mb-2 ${SMALL_LABEL}`}>{label}</legend><div className="flex flex-wrap gap-1.5">{children}</div></fieldset>; }
function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) { return <div className="flex items-center justify-between gap-3"><span className={SMALL_LABEL}>{label}</span><button type="button" role="switch" aria-checked={value} aria-label={label} onClick={() => onChange(!value)} className={`relative h-5 w-9 shrink-0 rounded-full ${value ? "bg-oe-background-bold-primary" : "bg-oe-background-secondary ring-1 ring-inset ring-oe-border-primary"}`}><span className={`absolute top-0.5 size-4 rounded-full bg-oe-background-primary shadow-sm transition-[left] ${value ? "left-[18px]" : "left-0.5"}`} /></button></div>; }

function MapRow({ property, values, defaultValue }: { property: string; values: string; defaultValue: string }) { return <tr><td className="py-3 pr-4 font-mono text-[11px] text-oe-foreground-primary">{property}</td><td className="py-3 pr-4 font-mono text-[11px]">{values}</td><td className="py-3 font-mono text-[11px]">{defaultValue}</td></tr>; }

function Example({ label, description, children }: { label: string; description?: string; children: ReactNode }) { return <div className="flex min-h-32 min-w-0 flex-col gap-3 rounded-xl border border-oe-border-secondary p-4"><div><p className="text-xs font-medium text-oe-foreground-primary">{label}</p>{description ? <p className="mt-1 text-[11px] leading-4 text-oe-foreground-tertiary">{description}</p> : null}</div><PreviewLocaleScope className="mt-auto min-w-0">{children}</PreviewLocaleScope></div>; }

function SkeletonLine({ className }: { className?: string | null }) { return <span aria-hidden="true" className={cn("block shrink-0 rounded-full bg-oe-background-secondary", className)} />; }

// Guidelines 의 시각 예제는 규칙을 보여 주는 도식이지 조작할 대상이 아니다. `inert` 로 포인터와
// 키보드 초점을 함께 막아 탭 순서에 끼어들지 않게 한다.
function GuideExample({ className, children }: { className?: string; children: ReactNode }) {
  return <div inert className={cn(GUIDE_BOX, className)}>{children}</div>;
}
