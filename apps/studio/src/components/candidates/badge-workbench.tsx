"use client";

import { useState, type ReactNode } from "react";
import { RiArrowDownSLine, RiShieldUserLine, RiTimeLine } from "@remixicon/react";

import { Badge, type BadgeColor } from "@ooee/ui";
import { AnatomyDescription, AnatomyLegend, AnatomyNumber, AnatomySurface, AnatomySwapSlot } from "@/components/component-anatomy";
import { OnThisPage } from "@/components/component-detail-navigation";
import { PreviewLocaleScope } from "@/components/preview-locale-scope";
import { useStudioPreferences } from "@/components/studio-preferences-provider";

const tabs = ["Badge", "Dot Badge", "Number Badge"] as const;
const badgeSections = [{ id: "playground", label: "Playground" }, { id: "anatomy", label: "Anatomy" }, { id: "properties-style", label: "Style" }, { id: "properties-color", label: "Color" }, { id: "properties-size", label: "Size" }, { id: "properties-shape", label: "Shape" }, { id: "properties-elements", label: "Elements" }, { id: "layout", label: "Layout" }, { id: "behavior", label: "Behavior" }, { id: "examples", label: "Examples" }, { id: "specification", label: "Specification" }];
const compactBadgeSections = [{ id: "styles", label: "Styles" }, { id: "examples", label: "Examples" }];
type BadgeTab = (typeof tabs)[number];
const badgeColors: BadgeColor[] = ["slate", "gray", "zinc", "neutral", "stone", "red", "orange", "amber", "yellow", "lime", "green", "emerald", "teal", "cyan", "sky", "blue", "indigo", "violet", "purple", "fuchsia", "pink", "rose"];
const content = {
  ko: { neutral: "일반", warning: "주의", danger: "오류", success: "성공", info: "정보", filter: "필터", admin: "관리자", scheduled: "예약됨", complete: "완료", design: "디자인", draft: "초안", online: "온라인", newActivity: "새 활동", operational: "정상", inbox: "받은 메시지", comments: "댓글", notification: "알림", unread: "읽지 않은 메시지" },
  en: { neutral: "Neutral", warning: "Warning", danger: "Error", success: "Success", info: "Info", filter: "Filter", admin: "Admin", scheduled: "Scheduled", complete: "Complete", design: "Design", draft: "Draft", online: "Online", newActivity: "New activity", operational: "Operational", inbox: "Inbox", comments: "Comments", notification: "notification", unread: "unread messages" },
} as const;
type Content = (typeof content)[keyof typeof content];

export function BadgeWorkbench() {
  const [activeTab, setActiveTab] = useState<BadgeTab>("Badge");
  const { locale } = useStudioPreferences();
  const c = content[locale];
  const sections = activeTab === "Badge" ? badgeSections : compactBadgeSections;
  return (
    <div className="grid items-start gap-6 @min-[1120px]:grid-cols-[minmax(0,1fr)_11rem]">
      <div className="min-w-0 space-y-5">
      <div className="overflow-x-auto border-b border-oe-border-secondary">
        <div className="flex min-w-max gap-6" role="tablist" aria-label="Badge components">
          {tabs.map((tab) => <button key={tab} type="button" role="tab" aria-selected={activeTab === tab} aria-controls="badge-component-panel" onClick={() => setActiveTab(tab)} className={`border-b-2 px-0.5 pb-3 text-sm transition-colors ${activeTab === tab ? "border-oe-foreground-primary font-medium text-oe-foreground-primary" : "border-transparent text-oe-foreground-tertiary hover:text-oe-foreground-primary"}`}>{tab}</button>)}
        </div>
      </div>
      <div id="badge-component-panel" role="tabpanel">
        {activeTab === "Badge" && <BadgePanel content={c} />}
        {activeTab === "Dot Badge" && <DotBadgePanel content={c} />}
        {activeTab === "Number Badge" && <NumberBadgePanel content={c} />}
      </div>
      </div>
      <OnThisPage items={sections} componentKey="badge" />
    </div>
  );
}

function BadgePanel({ content: c }: { content: Content }) {
  return (
    <ComponentSpec title="Badge" description="짧은 텍스트 정보를 표시하는 비인터랙티브 컴포넌트입니다. 현재 실제 구현과 사용자에게 확인된 속성만 정리합니다." specs={[["구조", "Container · Label · Optional elements"], ["스타일", "Tonal, Solid"], ["크기", "XSmall, Small, Medium · 검수 중"], ["모양", "Pill, Rounded 8px"]]}>
      <SpecSection title="Overview" description="현재 확인된 역할과 구현 범위입니다.">
        <div className="col-span-full space-y-2 text-sm leading-6 text-oe-foreground-secondary">
          <p>Badge는 필수 Label과 선택적인 Leading/Trailing element로 구성됩니다. 자체 클릭, 선택 또는 토글 동작은 구현되어 있지 않습니다.</p>
          <p>현재 저장소의 실제 사용 사례는 Breadcrumb Page Header의 상태 표시입니다. 그 외의 사용 목적과 권장 정책은 아직 정의되지 않았습니다.</p>
        </div>
      </SpecSection>
      <SpecSection title="Playground" description="확정된 Style, Size, Shape와 선택 요소를 한 예시에서 확인합니다.">
        <div className="col-span-full rounded-xl border-2 border-oe-border-bold-primary bg-oe-background-secondary p-4"><PreviewLocaleScope className="flex min-h-32 items-start rounded-xl bg-oe-background-primary p-5"><Badge color="blue" size="small" shape="rounded" leadingElement={<RiTimeLine />} trailingElement={<RiArrowDownSLine />}>{c.scheduled}</Badge></PreviewLocaleScope></div>
      </SpecSection>
      <SpecSection title="Anatomy" description="실제 구현에 존재하는 구성 요소와 위치입니다.">
        <BadgeAnatomy label="Label" />
      </SpecSection>
      <SpecSection title="Properties · Style" description="Tonal은 밝은 단계, Solid는 Tailwind 600 원색을 사용합니다.">
        <VariantGroup label="Tonal"><Badge color="red">{c.danger}</Badge><Badge color="amber">{c.warning}</Badge><Badge color="blue">{c.info}</Badge></VariantGroup>
        <VariantGroup label="Solid"><Badge color="red" appearance="solid">{c.danger}</Badge><Badge color="amber" appearance="solid">{c.warning}</Badge><Badge color="blue" appearance="solid">{c.info}</Badge></VariantGroup>
      </SpecSection>
      <SpecSection title="Properties · Color" description="코드에서 허용하는 Tailwind CSS의 22개 기본 color 값입니다. White와 Black은 포함하지 않습니다.">
        <div className="col-span-full overflow-x-auto">
          <div className="grid min-w-[20rem] grid-cols-2 gap-x-8 rounded-xl bg-oe-background-primary px-4 py-5 sm:gap-x-16 sm:px-8">
            <ColorColumn appearance="tonal" title="Tonal" />
            <ColorColumn appearance="solid" title="Solid · 600" />
          </div>
        </div>
      </SpecSection>
      <SpecSection title="Properties · Size" description="XSmall, Small과 Medium은 현재 화면 검수를 위한 구현값이며 고정 규격이 아닙니다. 추후 실제 화면을 다듬으며 확정합니다.">
        <VariantGroup label="XSmall · 16px"><Badge size="xsmall" leadingElement={<RiTimeLine />} trailingElement={<RiArrowDownSLine />}>{c.scheduled}</Badge></VariantGroup>
        <VariantGroup label="Small · 20px"><Badge size="small" leadingElement={<RiTimeLine />} trailingElement={<RiArrowDownSLine />}>{c.scheduled}</Badge></VariantGroup>
        <VariantGroup label="Medium · 24px"><Badge size="medium" leadingElement={<RiTimeLine />} trailingElement={<RiArrowDownSLine />}>{c.scheduled}</Badge></VariantGroup>
      </SpecSection>
      <SpecSection title="Properties · Shape" description="Pill과 Rounded를 지원하며 Rounded의 radius는 8px입니다.">
        <VariantGroup label="Pill"><Badge shape="pill" leadingElement={<RiShieldUserLine />}>{c.admin}</Badge></VariantGroup>
        <VariantGroup label="Rounded"><Badge shape="rounded" leadingElement={<RiShieldUserLine />}>{c.admin}</Badge></VariantGroup>
      </SpecSection>
      <SpecSection title="Properties · Elements" description="Label은 필수입니다. Leading element와 Trailing element는 전달 여부로 각각 표시하거나 숨깁니다.">
        <VariantGroup label="Label only"><Badge>{c.filter}</Badge></VariantGroup>
        <VariantGroup label="Leading + Label"><Badge leadingElement={<RiShieldUserLine />}>{c.admin}</Badge></VariantGroup>
        <VariantGroup label="Label + Trailing"><Badge trailingElement={<RiArrowDownSLine />}>{c.filter}</Badge></VariantGroup>
        <VariantGroup label="All elements"><Badge leadingElement={<RiTimeLine />} trailingElement={<RiArrowDownSLine />}>{c.scheduled}</Badge></VariantGroup>
        <div className="col-span-full overflow-x-auto"><table className="w-full min-w-[38rem] text-left text-xs"><thead className="border-b border-oe-border-secondary text-oe-foreground-tertiary"><tr><th className="py-2 font-medium">Element</th><th className="py-2 font-medium">필수 여부</th><th className="py-2 font-medium">현재 허용 범위</th><th className="py-2 font-medium">코드 타입</th></tr></thead><tbody className="divide-y divide-oe-border-secondary text-oe-foreground-secondary"><tr><td className="py-3">Label</td><td>필수</td><td>Text</td><td className="font-mono text-[11px]">string</td></tr><tr><td className="py-3">Leading element</td><td>선택</td><td>Icon · 추후 확장 가능</td><td className="font-mono text-[11px]">ReactNode</td></tr><tr><td className="py-3">Trailing element</td><td>선택</td><td>Icon · 추후 확장 가능</td><td className="font-mono text-[11px]">ReactNode</td></tr></tbody></table></div>
      </SpecSection>
      <SpecSection title="Layout" description="여러 Badge를 함께 배치할 때 검수하는 두 가지 레이아웃입니다. 현재 별도의 Group 컴포넌트 API는 없습니다.">
        <div className="min-w-0 rounded-xl border border-oe-border-secondary p-4"><p className="text-[11px] font-medium text-oe-foreground-tertiary">Scrollable layout</p><p className="mt-1 text-xs leading-5 text-oe-foreground-secondary">한 줄을 유지하며 공간을 넘는 항목은 가로로 스크롤합니다.</p><div className="mt-4 overflow-x-auto"><div className="flex w-max flex-nowrap gap-2 pb-1"><Badge color="blue">{c.design}</Badge><Badge color="amber">{c.scheduled}</Badge><Badge color="green">{c.complete}</Badge><Badge color="violet">{c.admin}</Badge><Badge color="rose">{c.filter}</Badge><Badge color="cyan">{c.info}</Badge></div></div></div>
        <div className="min-w-0 rounded-xl border border-oe-border-secondary p-4"><p className="text-[11px] font-medium text-oe-foreground-tertiary">Overflow layout</p><p className="mt-1 text-xs leading-5 text-oe-foreground-secondary">사용 가능한 너비에 맞춰 항목을 여러 줄로 표시합니다.</p><div className="mt-4 flex flex-wrap gap-2"><Badge color="blue">{c.design}</Badge><Badge color="amber">{c.scheduled}</Badge><Badge color="green">{c.complete}</Badge><Badge color="violet">{c.admin}</Badge><Badge color="rose">{c.filter}</Badge><Badge color="cyan">{c.info}</Badge></div></div>
      </SpecSection>
      <SpecSection title="Future extension" description="역할과 동작은 아직 구현하거나 정책으로 확정하지 않았으며 추후 확장 작업으로 기록합니다.">
        <div className="col-span-full text-sm leading-6 text-oe-foreground-secondary">검토 예정 역할: <span className="font-medium text-oe-foreground-primary">Filter</span>, <span className="font-medium text-oe-foreground-primary">Suggestion</span>, <span className="font-medium text-oe-foreground-primary">Input</span></div>
      </SpecSection>
      <SpecSection title="Behavior" description="현재 코드에서 확인되는 동작 범위입니다.">
        <div className="col-span-full text-sm leading-6 text-oe-foreground-secondary">Badge는 <code className="font-mono text-xs">span</code>으로 렌더링되며 자체 interaction, keyboard behavior와 state property가 없습니다.</div>
      </SpecSection>
      <SpecSection title="Examples" description="현재 저장소에서 확인되는 실제 사용 사례만 표시합니다.">
        <ExampleCard title="Breadcrumb Page Header · status"><Badge color="amber">{c.draft}</Badge></ExampleCard>
      </SpecSection>
      <SpecSection title="Specification" description="아래 수치는 현재 코드에서 확인되는 구현값입니다. 공식 Token으로 확정되었다는 의미는 아닙니다.">
        <SpecificationTable />
      </SpecSection>
    </ComponentSpec>
  );
}

function ColorColumn({ appearance, title }: { appearance: "tonal" | "solid"; title: string }) {
  return (
    <div className="min-w-0">
      <div className="mb-4 text-xs font-semibold text-oe-foreground-primary">{title}</div>
      <div className="flex flex-col gap-5 sm:gap-6">
        {badgeColors.map((color) => (
          <div key={`${appearance}-${color}`} className="flex h-6 min-w-0 items-center">
            <Badge color={color} appearance={appearance}>{color}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

function SpecificationTable() {
  const rows = [
    ["Container height", "Small 20px", "Medium 24px"],
    ["Padding X", "Small 6px", "Medium 8px"],
    ["Element gap", "Small 2px", "Medium 4px"],
    ["Label size", "XSmall 10px", "Small 11px · Medium 12px"],
    ["Element size", "XSmall 10px", "Small 12px · Medium 14px"],
    ["Pill radius", "rounded-full", "Tailwind utility"],
    ["Rounded radius", "8px", "확정값"],
  ];
  return <div className="col-span-full overflow-x-auto"><table className="w-full min-w-[36rem] text-left text-xs"><thead className="border-b border-oe-border-secondary text-oe-foreground-tertiary"><tr><th className="py-2 font-medium">Property</th><th className="py-2 font-medium">Current implementation</th><th className="py-2 font-medium">Source / status</th></tr></thead><tbody className="divide-y divide-oe-border-secondary text-oe-foreground-secondary">{rows.map(([property, value, status]) => <tr key={property}><td className="py-3">{property}</td><td className="font-mono text-[11px]">{value}</td><td>{status}</td></tr>)}</tbody></table></div>;
}

function BadgeAnatomy({ label }: { label: string }) { return <div className="col-span-full"><AnatomySurface ariaLabel="Badge anatomy" className="px-5 py-12"><div className="relative mx-auto flex h-32 max-w-sm items-center justify-center"><Badge color="amber" leadingElement={<AnatomySwapSlot className="size-4"><RiTimeLine className="size-3" /></AnatomySwapSlot>} trailingElement={<AnatomySwapSlot className="size-4"><RiArrowDownSLine className="size-3" /></AnatomySwapSlot>}>{label}</Badge><AnatomyNumber number={1} className="left-7 top-4" lineClassName="left-2.5 top-5 h-8 w-px" /><AnatomyNumber number={2} className="left-[6.75rem] bottom-3" lineClassName="bottom-5 left-2.5 h-8 w-px" /><AnatomyNumber number={3} className="left-[10.5rem] top-4" lineClassName="left-2.5 top-5 h-8 w-px" /><AnatomyNumber number={4} className="right-7 bottom-3" lineClassName="bottom-5 left-2.5 h-8 w-px" /></div></AnatomySurface><AnatomyLegend items={[{ name: "Container" }, { name: "Leading element", optional: true }, { name: "Label" }, { name: "Trailing element", optional: true }]} /><AnatomyDescription><p>Label은 필수이며 Leading element와 Trailing element는 각각 독립적으로 표시할 수 있습니다.</p></AnatomyDescription></div>; }

function DotBadgePanel({ content: c }: { content: Content }) {
  return (
    <ComponentSpec title="Dot Badge" description="다른 컴포넌트와 결합하여 상태를 나타내는 비텍스트 표시 요소입니다. 접근 가능한 label은 항상 필요합니다." specs={[["스타일", "Fill, Fill with outline"], ["크기", "Default · 10px"], ["모양", "Circle"], ["구성", "표시 콘텐츠 없음"]]}>
      <SpecSection title="Styles" description="Outline은 겹쳐진 표면에서 Dot Badge의 경계를 분리합니다.">
        <VariantGroup label="Fill"><Badge type="dot" tone="success" appearance="fill" label={c.online} /><Badge type="dot" tone="info" appearance="fill" label={c.newActivity} /><Badge type="dot" tone="danger" appearance="fill" label={c.danger} /></VariantGroup>
        <VariantGroup label="With outline"><div className="rounded-lg bg-oe-background-bold-primary p-3"><Badge type="dot" tone="success" appearance="fill" outline label={c.online} /></div></VariantGroup>
      </SpecSection>
      <SpecSection title="Examples" description="Avatar, Navigation과 List 안에서 간결한 상태를 전달합니다.">
        <ExampleCard title="Avatar status"><div className="relative"><div className="flex size-10 items-center justify-center rounded-full bg-oe-background-secondary text-xs font-medium text-oe-foreground-secondary">SM</div><Badge type="dot" tone="success" appearance="fill" outline label={c.online} className="absolute bottom-0 right-0" /></div></ExampleCard>
        <ExampleCard title="Navigation"><span className="flex items-center gap-2 text-sm text-oe-foreground-primary"><Badge type="dot" tone="info" appearance="fill" label={c.newActivity} />{c.newActivity}</span></ExampleCard>
        <ExampleCard title="System status"><span className="flex items-center gap-2 text-sm text-oe-foreground-secondary"><Badge type="dot" tone="success" appearance="fill" label={c.operational} />{c.operational}</span></ExampleCard>
      </SpecSection>
    </ComponentSpec>
  );
}

function NumberBadgePanel({ content: c }: { content: Content }) {
  return (
    <ComponentSpec title="Number Badge" description="읽지 않은 항목, 알림 또는 수량을 표시하는 숫자 카운터입니다. 아이콘이나 임의 텍스트는 포함하지 않습니다." specs={[["스타일", "Tonal, Fill"], ["크기", "최소 20px · 콘텐츠에 따라 확장"], ["모양", "Rounded"], ["구성", "숫자만 사용 · 최대값 선택"]]}>
      <SpecSection title="Styles" description="여러 자리 숫자는 너비가 자연스럽게 확장되며, 최대값을 넘으면 max+ 형식으로 표시합니다.">
        <VariantGroup label="Tonal"><Badge type="number" value={1} label={`1 ${c.notification}`} /><Badge type="number" value={12} label={`12 ${c.notification}`} tone="info" /><Badge type="number" value={99} label={`99 ${c.notification}`} tone="danger" /></VariantGroup>
        <VariantGroup label="Fill"><Badge type="number" value={1} label={`1 ${c.notification}`} appearance="fill" /><Badge type="number" value={12} label={`12 ${c.notification}`} tone="info" appearance="fill" /><Badge type="number" value={128} max={99} label={`128 ${c.notification}`} tone="danger" appearance="fill" /></VariantGroup>
      </SpecSection>
      <SpecSection title="Examples" description="전체 맥락을 제공하는 상위 컴포넌트와 결합하여 사용합니다.">
        <ExampleCard title="Navigation"><span className="flex min-w-40 items-center justify-between rounded-lg bg-oe-background-secondary px-3 py-2 text-sm text-oe-foreground-primary">{c.inbox} <Badge type="number" value={7} label={`7 ${c.unread}`} tone="info" appearance="fill" /></span></ExampleCard>
        <ExampleCard title="Tab"><span className="flex items-center gap-2 border-b-2 border-oe-foreground-primary pb-2 text-sm font-medium text-oe-foreground-primary">{c.comments} <Badge type="number" value={12} label={`12 ${c.comments}`} /></span></ExampleCard>
      </SpecSection>
    </ComponentSpec>
  );
}

function ComponentSpec({ title, description, specs, children }: { title: string; description: string; specs: Array<[string, string]>; children: ReactNode }) {
  return <div className="space-y-5"><header className="rounded-2xl border border-oe-border-secondary bg-oe-background-primary p-5"><h2 className="text-lg font-semibold text-oe-foreground-primary">{title}</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-oe-foreground-secondary">{description}</p><dl className="mt-5 grid gap-px overflow-hidden rounded-xl border border-oe-border-secondary bg-oe-border-secondary sm:grid-cols-2 lg:grid-cols-4">{specs.map(([label, value]) => <div key={label} className="bg-oe-background-primary px-4 py-3"><dt className="text-[11px] font-medium text-oe-foreground-tertiary">{label}</dt><dd className="mt-1 text-xs text-oe-foreground-primary">{value}</dd></div>)}</dl></header>{children}</div>;
}

function SpecSection({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <section id={title.toLowerCase().replace("properties · ", "properties-").replaceAll(" ", "-")} className="scroll-mt-20 rounded-2xl border border-oe-border-secondary bg-oe-background-primary p-5"><h3 className="text-sm font-semibold text-oe-foreground-primary">{title}</h3><p className="mt-1 text-xs leading-5 text-oe-foreground-tertiary">{description}</p><div className="mt-5 grid gap-3 lg:grid-cols-2">{children}</div></section>;
}

function VariantGroup({ label, children }: { label: string; children: ReactNode }) {
  return <div className="flex min-h-24 flex-wrap content-center items-center gap-3 rounded-xl border border-oe-border-secondary p-4"><span className="w-full text-[11px] font-medium text-oe-foreground-tertiary">{label}</span>{children}</div>;
}

function ExampleCard({ title, children }: { title: string; children: ReactNode }) {
  return <div className="flex min-h-24 flex-wrap content-center items-center gap-3 rounded-xl bg-oe-background-secondary p-4"><span className="w-full text-[11px] font-medium text-oe-foreground-tertiary">{title}</span>{children}</div>;
}
