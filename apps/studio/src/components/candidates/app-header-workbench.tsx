"use client";

import { useState, type ReactNode } from "react";
import { RiArrowLeftLine, RiCloseLine, RiHomeLine, RiMenuLine, RiMoreLine, RiNotification3Line, RiSearchLine, RiSettings3Line, RiUser3Line } from "@remixicon/react";
import { AppHeader, Button, type AppHeaderTitleAlign } from "@ooee/ui";

import { AnatomyBoundaryMarker, AnatomyFrame, AnatomyLegend, AnatomyNumber, AnatomyStructureMap, AnatomySurface } from "@/components/component-anatomy";
import { GuidelineList, UsageComparison } from "@/components/component-guidelines";
import { GuidelineTitle } from "@/components/guideline-title";
import { OnThisPage } from "@/components/component-detail-navigation";
import { PreviewLocaleScope } from "@/components/preview-locale-scope";
import { PlaygroundChoice as Choice } from "@/components/playground-element-control";
import { cn } from "@/lib/utils";
import { useStudioPreferences } from "@/components/studio-preferences-provider";

const aligns = ["center", "start"] as const satisfies readonly AppHeaderTitleAlign[];

const alignLabel: Record<AppHeaderTitleAlign, string> = {
  center: "Center",
  start: "Start",
};

// 좌우는 성격이 같은 아이콘 자리이므로 Control 도 같은 형태로 둔다. 어느 쪽에 무엇이 서는지는
// 이 컴포넌트가 정하지 않으므로 개수만 고른다.
const iconCounts = [0, 1, 2] as const;

type IconCount = (typeof iconCounts)[number];

const SMALL_LABEL = "text-[11px] font-medium text-oe-foreground-tertiary";

// 모바일 전용이므로 검수도 좁은 폭에서 한다. 375px 은 지금 국내에서 가장 좁은 축에 드는 실제
// 기기 폭이며, 여기서 제목이 들어가면 더 넓은 기기에서도 들어간다.
const PHONE_WIDTH = "w-[375px]";

// 실제 기기에서는 세로 스크롤바가 화면에 남지 않으므로 미리보기에서도 감춘다. 스크롤바가 보이면
// 그만큼 본문 폭이 줄어 제목이 잘리는 지점이 실제와 달라진다.
const PHONE_SCROLL = "overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

// 예시 안의 본문은 문구 대신 자리만 표시한다. 실제 문장을 두면 그 문장이 예시의 주제처럼 읽혀
// 무엇을 보는 카드인지 흐려진다.
const SKELETON_TITLE = "h-3";
const SKELETON_BODY = "h-2.5";

const GUIDE_BOX = "flex min-h-28 w-full";

// 실제 AppHeader 대신 도식으로 쓰는 모양이다. 높이와 여백은 구현과 같게 두고 색만 Neutral 로
// 낮춘다. 색이 들어가면 Anatomy 가 특정 화면의 예시처럼 읽힌다.
// 좌우 자리는 구현과 달리 내용 폭만 차지하게 둔다. 구현처럼 남은 공간을 반씩 나눠 가지면 자리가
// 아이콘보다 훨씬 넓어져 번호선이 빈 여백을 가리키고, 가운데에 남는 폭이 좁아져 명칭까지
// 잘린다. 자리의 폭을 견주는 것은 Balance 절이 맡고 여기서는 명칭만 알린다.
// 도식은 실제 컴포넌트와 같은 값을 쓴다. 좌우 여백과 아이콘 크기가 어긋나면 Anatomy 가 지금
// 화면과 다른 것을 설명하게 된다.
const HEADER_DIAGRAM = "flex h-14 w-full items-center px-oe-padding-default";
const SIDE_DIAGRAM = "flex shrink-0 items-center text-oe-foreground-secondary [&_svg]:size-oe-icon-large";

const sections = [
  { id: "playground", label: "Playground" },
  { id: "anatomy", label: "Anatomy" },
  { id: "align", label: "Align" },
  { id: "balance", label: "Balance" },
  { id: "elements", label: "Elements" },
  { id: "state", label: "State" },
  { id: "screen-cases", label: "화면 유형" },
  { id: "guidelines", label: "Guidelines" },
  { id: "property-map", label: "Property map" },
];

const copy = {
  ko: {
    listTitle: "가맹점관리",
    detailTitle: "행복마트 강남대로점",
    description: "123-45-67890",
    longTitle: "행복마트 강남대로 본점 2호점",
    back: "뒤로",
    home: "홈",
    search: "검색",
    notify: "알림",
    more: "더보기",
    sentence: "이 화면에서 가맹점의 계약 정보를 확인하고 수정합니다",
    mainTitle: "홈",
    layerTitle: "정산 내역",
    plainTitle: "약관 동의",
    close: "닫기",
    user: "내 정보",
    settings: "설정",
    allMenu: "전체메뉴",
    save: "저장",
  },
  en: {
    listTitle: "Merchants",
    detailTitle: "Happy Mart Gangnam",
    description: "123-45-67890",
    longTitle: "Happy Mart Gangnam-daero Branch 2",
    back: "Back",
    home: "Home",
    search: "Search",
    notify: "Notifications",
    more: "More",
    sentence: "Review and edit the contract details of this merchant",
    mainTitle: "Home",
    layerTitle: "Settlement",
    plainTitle: "Terms of service",
    close: "Close",
    user: "Profile",
    settings: "Settings",
    allMenu: "All menu",
    save: "Save",
  },
} as const;

type Copy = (typeof copy)[keyof typeof copy];

// 헤더에 들어가는 아이콘은 공용 Button 의 Ghost 를 쓴다. 헤더가 자기 버튼을 따로 만들지 않는다.
// `tone="neutral"` 을 밝혀 적는 이유는 `button.md` 에 있다. Ghost 도 tone 색을 따라가므로,
// 중립으로 읽혀야 하는 자리는 기본값에 기대지 않고 적어 둔다.
// Main 의 왼쪽에는 아이콘 버튼이 아니라 제품 로고가 선다. 실제 로고는 제품이 넣으므로 검수 화면은
// 그 자리와 크기만 보여 준다. `trailingElement` 와 마찬가지로 이 자리가 아이콘 전용이 아니라는
// 것을 드러내는 예시이기도 하다.
function HeaderLogo() {
  return (
    <span className="flex h-10 items-center px-2 text-base font-bold tracking-tight text-oe-foreground-primary">
      LOGO
    </span>
  );
}

function HeaderIcon({ icon, label }: { icon: ReactNode; label: string }) {
  return <Button variant="ghost" tone="neutral" controlSize="large" leadingIcon={icon} aria-label={label} />;
}

function leadingElementsOf(count: IconCount, c: Copy) {
  if (count === 0) return undefined;
  if (count === 1) return <HeaderIcon icon={<RiArrowLeftLine />} label={c.back} />;
  return (
    <>
      <HeaderIcon icon={<RiArrowLeftLine />} label={c.back} />
      <HeaderIcon icon={<RiHomeLine />} label={c.home} />
    </>
  );
}

function trailingElementsOf(count: IconCount, c: Copy) {
  if (count === 0) return undefined;
  if (count === 1) return <HeaderIcon icon={<RiSearchLine />} label={c.search} />;
  return (
    <>
      <HeaderIcon icon={<RiSearchLine />} label={c.search} />
      <HeaderIcon icon={<RiMoreLine />} label={c.more} />
    </>
  );
}

export function AppHeaderWorkbench() {
  const { locale } = useStudioPreferences();
  const c = copy[locale];
  const [titleAlign, setTitleAlign] = useState<AppHeaderTitleAlign>("center");
  const [leadingCount, setLeadingCount] = useState<IconCount>(1);
  const [trailingCount, setTrailingCount] = useState<IconCount>(2);
  const [titleHidden, setTitleHidden] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [sticky, setSticky] = useState(true);

  return (
    <div className="grid items-start gap-6 @min-[1120px]:grid-cols-[minmax(0,1fr)_11rem]">
      <div className="min-w-0 space-y-5">
        <Section id="playground" title="🚩 Playground" description="정렬과 좌우 아이콘 개수, 제목과 설명 줄을 조합해 확인합니다. Title hidden을 켜면 제목이 화면에서만 사라지고 아이콘이 양 끝에 붙습니다. 이름은 DOM에 남아 화면 낭독기가 읽습니다. 미리보기는 375px 화면 안이며 본문을 직접 스크롤해 경계선이 나타나는 것을 볼 수 있습니다. 헤더 높이는 어느 조합에서나 56px로 같고, 설명 줄은 그 안에 들어갑니다.">
          <div className="col-span-full grid gap-5 rounded-xl border-2 border-oe-border-bold-primary bg-oe-background-secondary p-4 @min-[760px]:grid-cols-[minmax(20rem,1fr)_16rem]">
            <div className="flex items-start justify-center">
              <PhoneFrame>
                <AppHeader
                  titleAlign={titleAlign}
                  sticky={sticky}
                  title={c.detailTitle}
                  titleHidden={titleHidden}
                  description={showDescription ? c.description : undefined}
                  leadingElement={leadingElementsOf(leadingCount, c)}
                  trailingElement={trailingElementsOf(trailingCount, c)}
                />
                <PhoneBody />
              </PhoneFrame>
            </div>
            <div className="space-y-5 rounded-xl bg-oe-background-primary p-4">
              <ControlSection title="Appearance">
                <ControlGroup label="Title align">{aligns.map((item) => <Choice key={item} active={titleAlign === item} onClick={() => setTitleAlign(item)}>{alignLabel[item]}</Choice>)}</ControlGroup>
              </ControlSection>
              <ControlSection title="Content">
                <Toggle label="Title hidden" value={titleHidden} onChange={setTitleHidden} />
                <Toggle label="Description" value={showDescription} onChange={setShowDescription} />
              </ControlSection>
              <ControlSection title="Elements">
                <ControlGroup label="Leading element">{iconCounts.map((item) => <Choice key={item} active={leadingCount === item} onClick={() => setLeadingCount(item)}>{`${item}개`}</Choice>)}</ControlGroup>
                <ControlGroup label="Trailing element">{iconCounts.map((item) => <Choice key={item} active={trailingCount === item} onClick={() => setTrailingCount(item)}>{`${item}개`}</Choice>)}</ControlGroup>
              </ControlSection>
              <ControlSection title="Behavior">
                <Toggle label="Sticky" value={sticky} onChange={setSticky} />
              </ControlSection>
            </div>
          </div>
        </Section>

        <Section id="anatomy" title="Anatomy" description="AppHeader를 구성하는 실제 요소와 문서에서 사용하는 명칭입니다. Container와 Title이 필수이고 나머지 셋은 선택입니다. Title은 h1이며, 화면에 글자를 두지 않는 유형도 이름은 갖고 titleHidden으로 감춥니다. Leading element와 Trailing element은 성격이 같은 아이콘 자리이며, 어느 쪽에 무엇이 서는지는 이 컴포넌트가 정하지 않습니다.">
          <div className="col-span-full min-w-0">
            <AnatomySurface ariaLabel="AppHeader anatomy" title="AppHeader structure" className="px-5 pb-5 pt-12">
              <div lang="en" className="flex h-36 items-center justify-center">
                <AnatomyFrame>
                  <div data-slot="app-header" className={cn(HEADER_DIAGRAM, "w-[320px] rounded-lg border border-oe-border-secondary bg-oe-background-primary")}>
                    <span data-slot="app-header-leading" className={cn(SIDE_DIAGRAM, "justify-start")}>
                      <RiArrowLeftLine aria-hidden="true" />
                    </span>
                    <span data-slot="app-header-title-block" className="flex min-w-0 flex-1 flex-col justify-center px-2 text-center">
                      <span data-slot="app-header-title" className="truncate text-base leading-5 font-semibold text-oe-foreground-secondary">Title</span>
                      <span data-slot="app-header-description" className="truncate text-xs leading-4 text-oe-foreground-tertiary">Description</span>
                    </span>
                    <span data-slot="app-header-trailing" className={cn(SIDE_DIAGRAM, "justify-end")}>
                      <RiSearchLine aria-hidden="true" />
                    </span>
                  </div>
                  <AnatomyBoundaryMarker number={1} target="[data-slot=app-header]" side="left" connectorLength={36} />
                  <AnatomyNumber number={2} target="[data-slot=app-header-leading]" side="bottom" />
                  <AnatomyNumber number={3} target="[data-slot=app-header-title]" side="top" />
                  <AnatomyNumber number={4} target="[data-slot=app-header-description]" side="bottom" />
                  <AnatomyNumber number={5} target="[data-slot=app-header-trailing]" side="top" />
                </AnatomyFrame>
              </div>
            </AnatomySurface>
            <AnatomyLegend items={[{ name: "Container" }, { name: "Leading element", optional: true }, { name: "Title" }, { name: "Description", optional: true }, { name: "Trailing element", optional: true }]} />

            <div className="mt-4">
              <AnatomyStructureMap lines={[
                { name: "AppHeader" },
                { prefix: "├─ ", name: "Leading element", optional: true },
                { prefix: "├─ ", name: "Title block" },
                { prefix: "│  ├─ ", name: "Title" },
                { prefix: "│  └─ ", name: "Description", optional: true },
                { prefix: "└─ ", name: "Trailing element", optional: true },
              ]} />
            </div>
          </div>
        </Section>

        <Section id="align" title="Properties · Title align" description="Center와 Start 둘을 제공하며 기본값은 Center입니다. 같은 화면 안에서 섞지 않고 제품 전체에서 하나를 고르되, 긴 이름을 넓게 써야 하는 화면만 Start로 내립니다.">
          <Example label="Center · Default" description="제목이 화면의 정중앙에 섭니다. 좌우 아이콘 개수와 무관합니다.">
            <PhoneStrip>
              <AppHeader sticky={false} title={c.detailTitle} leadingElement={leadingElementsOf(1, c)} trailingElement={trailingElementsOf(2, c)} />
            </PhoneStrip>
          </Example>
          <Example label="Start" description="제목이 왼쪽 자리 바로 옆에서 시작해 오른쪽 자리 앞까지 넓게 씁니다.">
            <PhoneStrip>
              <AppHeader titleAlign="start" sticky={false} title={c.longTitle} leadingElement={leadingElementsOf(1, c)} trailingElement={trailingElementsOf(2, c)} />
            </PhoneStrip>
          </Example>
        </Section>

        <Section id="balance" title="Balance" description="Center에서 제목은 남은 공간의 가운데가 아니라 화면의 가운데에 섭니다. 좌우 자리가 남은 공간을 반씩 나눠 가지므로, 아이콘이 한쪽에만 있거나 개수가 서로 달라도 제목의 중심이 움직이지 않습니다. 점선이 화면의 중심입니다.">
          <Example label="좌 0개 · 우 2개">
            <PhoneStrip centerLine>
              <AppHeader sticky={false} title={c.listTitle} trailingElement={trailingElementsOf(2, c)} />
            </PhoneStrip>
          </Example>
          <Example label="좌 1개 · 우 2개">
            <PhoneStrip centerLine>
              <AppHeader sticky={false} title={c.listTitle} leadingElement={leadingElementsOf(1, c)} trailingElement={trailingElementsOf(2, c)} />
            </PhoneStrip>
          </Example>
          <Example label="좌 2개 · 우 1개">
            <PhoneStrip centerLine>
              <AppHeader sticky={false} title={c.listTitle} leadingElement={leadingElementsOf(2, c)} trailingElement={trailingElementsOf(1, c)} />
            </PhoneStrip>
          </Example>
          <Example label="좌 2개 · 우 2개" description="가장 좁은 조합입니다. 제목이 들어가는지 이 칸에서 확인합니다.">
            <PhoneStrip centerLine>
              <AppHeader sticky={false} title={c.detailTitle} leadingElement={leadingElementsOf(2, c)} trailingElement={trailingElementsOf(2, c)} />
            </PhoneStrip>
          </Example>
        </Section>

        <Section id="elements" title="Properties · Elements" description="Leading element와 Trailing element은 각각 아이콘 두 개까지, Description은 한 줄까지 받습니다. 헤더 높이는 어느 조합에서나 56px로 같습니다.">
          <Example label="Title만" description="가장 단순한 형태입니다. 제목이 56px 안에서 세로 가운데에 섭니다.">
            <PhoneStrip>
              <AppHeader sticky={false} title={c.listTitle} />
            </PhoneStrip>
          </Example>
          <Example label="Description" description="제목 아래 한 줄이 붙어도 높이는 그대로입니다. 두 줄이 56px 안에 들어갑니다.">
            <PhoneStrip>
              <AppHeader sticky={false} title={c.detailTitle} description={c.description} leadingElement={leadingElementsOf(1, c)} />
            </PhoneStrip>
          </Example>
          <Example label="긴 제목" description="제목과 설명 모두 한 줄에서 말줄임합니다. 두 줄로 넘어가면 높이가 변하기 때문입니다.">
            <PhoneStrip>
              <AppHeader sticky={false} title={c.longTitle} description={c.description} leadingElement={leadingElementsOf(1, c)} trailingElement={trailingElementsOf(2, c)} />
            </PhoneStrip>
          </Example>
          <Example label="Leading element 2개" description="좌우는 성격이 같은 자리입니다. 어느 쪽에 무엇이 서는지는 쓰는 화면이 정합니다.">
            <PhoneStrip>
              <AppHeader sticky={false} title={c.listTitle} leadingElement={leadingElementsOf(2, c)} trailingElement={<HeaderIcon icon={<RiNotification3Line />} label={c.notify} />} />
            </PhoneStrip>
          </Example>
        </Section>

        <Section id="state" title="Properties · State" description="헤더 자체가 갖는 상태는 화면 맨 위에 있는지 하나뿐입니다. 아이콘의 Hover, Pressed와 Focus visible은 그 자리에 놓인 Button이 갖습니다.">
          <Example label="Top · Default" description="맨 위에 있을 때는 본문과 같은 면으로 붙어 있고 경계선이 없습니다.">
            <PhoneStrip>
              <AppHeader sticky={false} title={c.listTitle} leadingElement={leadingElementsOf(1, c)} trailingElement={trailingElementsOf(2, c)} />
            </PhoneStrip>
          </Example>
          <Example label="Stuck" description="본문이 헤더 아래로 들어가기 시작하면 경계선이 나타납니다. 직접 스크롤해 확인합니다.">
            <div className={cn(PHONE_WIDTH, "mx-auto max-w-full overflow-hidden rounded-xl border border-oe-border-secondary")}>
              <div className={cn("h-40 bg-oe-background-primary", PHONE_SCROLL)}>
                <AppHeader title={c.listTitle} leadingElement={leadingElementsOf(1, c)} trailingElement={trailingElementsOf(2, c)} />
                <PhoneBody />
              </div>
            </div>
          </Example>
        </Section>

        <Section id="screen-cases" title="화면 유형" description="블루키에서 실제로 쓰는 다섯 조합입니다. 컴포넌트가 강제하는 것이 아니라 title과 leadingElement, trailingElement에 무엇을 넣는지의 차이일 뿐이므로, 조합이 늘어도 컴포넌트는 그대로 둡니다. 왼쪽에는 나가는 길을, 오른쪽에는 그 화면에서 하는 일을 둡니다.">
          <Example label="Main" description="로고가 어느 화면인지 말하므로 제목 글자를 화면에 두지 않습니다. 이름은 titleHidden으로 감춰 두어 화면 낭독기가 읽습니다.">
            <PhoneStrip>
              <AppHeader
                sticky={false}
                title={c.mainTitle}
                titleHidden
                leadingElement={<HeaderLogo />}
                trailingElement={<><HeaderIcon icon={<RiNotification3Line />} label={c.notify} /><HeaderIcon icon={<RiMenuLine />} label={c.allMenu} /></>}
              />
            </PhoneStrip>
          </Example>
          <Example label="Menu" description="전체메뉴 화면입니다. 닫기가 왼쪽에 서고 제목은 titleHidden으로 감춥니다.">
            <PhoneStrip>
              <AppHeader
                sticky={false}
                title={c.allMenu}
                titleHidden
                leadingElement={<HeaderIcon icon={<RiCloseLine />} label={c.close} />}
                trailingElement={<><HeaderIcon icon={<RiUser3Line />} label={c.user} /><HeaderIcon icon={<RiSettings3Line />} label={c.settings} /></>}
              />
            </PhoneStrip>
          </Example>
          <Example label="Sub" description="뒤로가기와 제목이 서고 오른쪽 자리는 그 화면이 바꿔 끼웁니다. 아이콘이 아니라 버튼을 넣어도 됩니다.">
            <PhoneStrip>
              <AppHeader
                sticky={false}
                title={c.detailTitle}
                leadingElement={<HeaderIcon icon={<RiArrowLeftLine />} label={c.back} />}
                trailingElement={<HeaderIcon icon={<RiNotification3Line />} label={c.notify} />}
              />
            </PhoneStrip>
          </Example>
          <Example label="Sub · 오른쪽에 버튼" description="같은 Sub이지만 오른쪽에 텍스트 버튼이 섭니다. trailingElement가 아이콘만 받는 자리가 아니라는 것을 보여 줍니다.">
            <PhoneStrip>
              <AppHeader
                sticky={false}
                title={c.detailTitle}
                leadingElement={<HeaderIcon icon={<RiArrowLeftLine />} label={c.back} />}
                trailingElement={<Button variant="ghost" tone="brand" controlSize="large">{c.save}</Button>}
              />
            </PhoneStrip>
          </Example>
          <Example label="Layer" description="화면을 덮는 레이어입니다. 닫기가 왼쪽에 서고 제목과 오른쪽 자리는 필요할 때만 씁니다.">
            <PhoneStrip>
              <AppHeader
                sticky={false}
                title={c.layerTitle}
                leadingElement={<HeaderIcon icon={<RiCloseLine />} label={c.close} />}
              />
            </PhoneStrip>
          </Example>
          <Example label="Plain" description="나가는 길을 일부러 두지 않는 화면입니다. 개정된 약관에 동의해야만 넘어갈 수 있는 자리처럼, 그 화면을 벗어날 방법을 주지 않아야 할 때 씁니다.">
            <PhoneStrip>
              <AppHeader sticky={false} title={c.plainTitle} />
            </PhoneStrip>
          </Example>
        </Section>

        <Section id="guidelines" title="Guidelines" description="AppHeader를 언제 쓰고 어떻게 채우는지에 대한 규칙입니다.">
          <div className="col-span-full space-y-8">
            <div>
              <GuidelineTitle>이 컴포넌트를 쓰는 자리</GuidelineTitle>
              <GuidelineList items={[
                "모바일 화면의 최상단 한 줄에 씁니다. 데스크톱 화면의 전역 바에는 쓰지 않습니다.",
                "한 화면에 하나만 둡니다. 화면 안쪽 영역의 제목에는 이 컴포넌트를 쓰지 않고 그 영역이 자기 제목을 갖습니다.",
                "자리는 컴포넌트가 고정하고 내용은 화면이 채웁니다. 목록에서는 기능명을, 상세에서는 그 대상의 이름을 같은 자리에 넣습니다.",
              ]} />
            </div>

            <div>
              <GuidelineTitle>제목과 설명 쓰기</GuidelineTitle>
              <GuidelineList items={[
                "제목은 지금 보고 있는 것이 무엇인지 한 덩어리로 말합니다. 경로를 이어 붙이지 않습니다.",
                "설명은 제목이 가리키는 대상을 식별하는 짧은 값에만 씁니다. 사업자번호나 코드가 그런 값입니다.",
                "설명에 안내 문장을 넣지 않습니다. 한 줄에서 잘리므로 문장은 끝까지 읽히지 않습니다.",
                "둘 다 375px 화면에서 잘리는지 확인합니다. 잘리는 것이 문제가 되는 값은 본문 첫 칸에서 다시 보여 줍니다.",
              ]} />
            </div>

            <div>
              <GuidelineTitle>왼쪽과 오른쪽을 가르는 기준</GuidelineTitle>
              <GuidelineList items={[
                "왼쪽에는 나가는 길을 둡니다. 뒤로가기, 닫기, 홈이며 로고도 누르면 홈으로 가므로 같은 자리입니다.",
                "오른쪽에는 그 화면에서 하는 일을 둡니다. 검색, 알림, 설정, 저장, 더보기가 여기에 옵니다.",
                "닫기는 레이어든 전체메뉴든 왼쪽입니다. 화면을 덮고 자기 헤더를 갖는 레이어의 닫기는 앞 화면으로 되돌아가는 동작이라 뒤로가기와 성격이 같습니다.",
                "닫기의 자리를 화면마다 바꾸지 않습니다. 연 자리 가까이 두면 손가락은 덜 움직이지만 그때마다 눈으로 찾게 됩니다.",
              ]} />
            </div>

            <div>
              <GuidelineTitle>아이콘 자리 채우기</GuidelineTitle>
              <GuidelineList items={[
                "한쪽에 아이콘을 셋 이상 두지 않습니다. 세 개부터는 제목이 들어갈 폭이 남지 않습니다.",
                "아이콘은 공용 Button의 Ghost를 tone=\"neutral\"로 씁니다. 헤더가 자기 버튼을 따로 만들지 않습니다.",
                "아이콘 크기는 헤더가 정합니다. Button의 크기 단계가 갖고 오는 값을 쓰지 않고 24px로 덮어쓰므로 화면이 크기를 직접 적지 않습니다. 버튼은 Large를 쓰며, 아이콘 그림이 Container의 여백선에 맞도록 헤더가 버튼이 든 자리를 그 안쪽 여백만큼 바깥으로 당깁니다.",
                "누르는 동안 아이콘이 90%로 작아졌다가 손을 떼면 돌아옵니다. 공용 Button은 누를 때 움직이지 않기로 정해져 있으므로 헤더가 자기 자리 안에서만 겁니다.",
                "아이콘에는 aria-label로 이름을 줍니다. 모양만으로는 무엇을 하는 버튼인지 전달되지 않습니다.",
                "화면에서 가장 중요한 동작이 아니면 헤더에 올리지 않고 본문에 둡니다.",
              ]} />
            </div>

            <UsageComparison
              title="정렬은 제품 전체에서 하나로 고르기"
              doText="이어지는 화면이 같은 정렬을 씁니다."
              dontText="화면마다 정렬을 바꾸지 않습니다."
              description={[
                "목록에서 상세로 들어갈 때 정렬이 바뀌면 제목이 좌우로 미끄러져 다른 화면으로 왔다는 신호처럼 읽힙니다.",
                "긴 이름 때문에 Start가 필요하면 그 화면만이 아니라 같은 흐름 전체를 Start로 내립니다.",
              ]}
              doVisual={<GuideExample className="flex-col justify-center"><GuideHeader c={c} titleAlign="center" title={c.listTitle} /><GuideHeader c={c} titleAlign="center" title={c.detailTitle} /></GuideExample>}
              dontVisual={<GuideExample className="flex-col justify-center"><GuideHeader c={c} titleAlign="center" title={c.listTitle} /><GuideHeader c={c} titleAlign="start" title={c.detailTitle} /></GuideExample>}
            />

            <UsageComparison
              title="설명 줄에는 식별하는 값만 두기"
              doText="대상을 가리키는 짧은 값을 둡니다."
              dontText="설명 문장을 넣지 않습니다."
              description={[
                "설명은 한 줄에서 잘립니다. 문장을 넣으면 앞부분만 남아 무슨 말인지 전달되지 않습니다.",
                "화면을 설명해야 한다면 헤더가 아니라 본문 첫 칸이 그 자리입니다.",
              ]}
              doVisual={<GuideExample className="flex-col justify-center"><GuideHeader c={c} titleAlign="center" title={c.detailTitle} description={c.description} /></GuideExample>}
              dontVisual={<GuideExample className="flex-col justify-center"><GuideHeader c={c} titleAlign="center" title={c.detailTitle} description={c.sentence} /></GuideExample>}
            />
          </div>
        </Section>

        <Section id="property-map" title="Property map" description="실제 Props와 기본값입니다. Leading element와 Trailing element은 성격이 같은 자리이므로 같은 형태로 받습니다.">
          <div className="col-span-full overflow-x-auto">
            <table className="w-full min-w-[38rem] text-left text-xs">
              <thead className="border-b border-oe-border-secondary text-oe-foreground-tertiary"><tr><th className="py-2 font-medium">Property</th><th className="py-2 font-medium">Values</th><th className="py-2 font-medium">Default</th></tr></thead>
              <tbody className="divide-y divide-oe-border-secondary text-oe-foreground-secondary">
                <MapRow property="title" values="ReactNode" defaultValue="필수" />
                <MapRow property="titleHidden" values="false | true" defaultValue="false" />
                <MapRow property="description" values="ReactNode" defaultValue="undefined" />
                <MapRow property="leadingElement" values="ReactNode (아이콘 2개까지 또는 로고)" defaultValue="undefined" />
                <MapRow property="trailingElement" values="ReactNode (아이콘 2개까지 또는 버튼 1개)" defaultValue="undefined" />
                <MapRow property="titleAlign" values="center | start" defaultValue="center" />
                <MapRow property="sticky" values="false | true" defaultValue="true" />
                <MapRow property="className" values="string" defaultValue="undefined" />
              </tbody>
            </table>
          </div>
        </Section>
      </div>
      <OnThisPage items={sections} componentKey="app-header" />
    </div>
  );
}

// 헤더만 잘라 보는 자리다. 스크롤이 필요 없는 카드에서는 본문을 그리지 않고 헤더 한 줄만 둔다.
function PhoneStrip({ children, centerLine = false }: { children: ReactNode; centerLine?: boolean }) {
  return (
    <div className={cn(PHONE_WIDTH, "relative mx-auto max-w-full overflow-hidden rounded-xl border border-oe-border-secondary bg-oe-background-primary")}>
      {children}
      {centerLine ? <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-1/2 border-l border-dashed border-oe-border-primary" /> : null}
    </div>
  );
}

// 실제 기기 폭 안에서 스크롤까지 확인하는 자리다. 페이지 전체가 아니라 이 영역이 스크롤되므로
// 헤더가 안쪽 스크롤에서도 붙는지 함께 보인다.
function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className={cn(PHONE_WIDTH, "mx-auto max-w-full overflow-hidden rounded-2xl border border-oe-border-secondary")}>
      <div className={cn("h-72 bg-oe-background-primary", PHONE_SCROLL)}>{children}</div>
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

// Guidelines 의 도식도 실제 AppHeader 를 쓴다. 크기를 줄인 모형을 따로 그리면 높이와 글자,
// 아이콘의 비율이 실제와 어긋나 규칙이 아니라 모형의 생김새를 보게 된다. 견주는 두 칸이 좁으므로
// 폭만 카드에 맡기고 나머지는 구현 그대로 둔다.
function GuideHeader({ c, titleAlign, title, description }: { c: Copy; titleAlign: AppHeaderTitleAlign; title: string; description?: string }) {
  return (
    <AppHeader
      titleAlign={titleAlign}
      sticky={false}
      title={title}
      description={description}
      leadingElement={<HeaderIcon icon={<RiArrowLeftLine />} label={c.back} />}
      trailingElement={<HeaderIcon icon={<RiSearchLine />} label={c.search} />}
      className="border-b-oe-border-secondary"
    />
  );
}

function Section({ id, title, description, children }: { id: string; title: string; description: string; children: ReactNode }) { return <section id={id} className="scroll-mt-20 rounded-2xl border border-oe-border-secondary bg-oe-background-primary p-5"><h3 className="text-xl font-semibold text-oe-foreground-primary">{title}</h3><p className="mt-1 text-xs leading-5 text-oe-foreground-tertiary">{description}</p><div className="mt-5 grid gap-3 @min-[720px]:grid-cols-2">{children}</div></section>; }
function ControlSection({ title, children }: { title: string; children: ReactNode }) { return <section><h4 className="mb-3 text-sm font-semibold text-oe-foreground-primary">{title}</h4><div className="space-y-3">{children}</div></section>; }
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
