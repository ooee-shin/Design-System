"use client";

import { Fragment, useState, type ReactNode } from "react";
import { NotificationBadge, type NotificationBadgeMax, type NotificationBadgeTone } from "@ooee/ui";

import { AnatomyBoundaryMarker, AnatomyFrame, AnatomyLegend, AnatomyNumber, AnatomyStructureMap, AnatomySurface } from "@/components/component-anatomy";
import { OnThisPage } from "@/components/component-detail-navigation";
import { GuidelineList } from "@/components/component-guidelines";
import { GuidelineTitle } from "@/components/guideline-title";
import { PlaygroundChoice as Choice } from "@/components/playground-element-control";

const tones = ["accent", "neutral"] as const satisfies readonly NotificationBadgeTone[];
const maxValues = [99, 999] as const satisfies readonly NotificationBadgeMax[];
const shapes = ["dot", "count"] as const;

// Playground control의 라벨과 표의 행 라벨이 같은 위계로 읽히도록 한 곳에서 관리한다.
const SMALL_LABEL = "text-[11px] font-medium text-oe-foreground-tertiary";

// Guidelines 규칙 제목은 studio.md의 「~하기」 동사형 규칙을 따르고, 문구는 명세와 같게 유지한다.
const guidelines = [
  {
    title: "붙는 위치는 결합하는 요소에 맞춰 정하기",
    items: [
      "컴포넌트는 모양과 색과 수만 소유합니다. 아이콘·버튼·메뉴 가운데 어디에, 어느 모서리에 달릴지는 화면 코드가 relative와 absolute로 정합니다.",
      "컴포넌트가 host를 감싸는 구조를 들고 있으면 쓰려는 자리의 Layout을 건드리게 됩니다. 그래서 위치를 소유하지 않고 className으로 받습니다.",
      "host와 겹치는 자리에서는 Stroke를 켜서 배경색 링으로 경계를 벌립니다. 링이 없으면 아이콘의 선과 표시의 경계가 붙어 하나로 읽힙니다.",
    ],
  },
  {
    title: "핵심 상태가 있을 때만 표시하기",
    items: [
      "읽지 않은 메시지, 확인되지 않은 알림, 아직 보지 않은 변경사항처럼 사용자가 처리해야 할 상태가 있을 때만 표시합니다.",
      "사용자가 그 상호작용을 완료하면 사라집니다. 확인한 뒤에도 표시가 남아 있으면 처리할 것이 남았다는 뜻으로 읽히므로 표시 자체를 믿지 않게 됩니다.",
      "상태와 무관한 장식이나 강조에는 쓰지 않습니다. 그 자리는 Badge가 담당합니다.",
    ],
  },
  {
    title: "최대 표시 수를 자리에 맞춰 정하기",
    items: [
      "Max는 붙는 자리가 정합니다. 아이콘 모서리처럼 좁은 자리는 99, 목록 행처럼 넓은 자리는 999입니다.",
      "넘으면 99+와 999+로 표시합니다. 값을 둘로 제한해 표시 폭이 세 글자와 네 글자로 고정되므로 좁은 자리에서 넘칠 일이 없습니다.",
    ],
  },
  {
    title: "0은 표시하지 않기",
    items: [
      "Count가 0이면 컴포넌트가 아무것도 렌더하지 않습니다. 화면 코드가 unread > 0 &&을 쓰지 않아도 됩니다.",
      "처리할 것이 없는데 표시가 남으면 사용자가 없는 알림을 찾게 됩니다.",
    ],
  },
  {
    title: "접근 이름은 host 컨트롤이 담당하기",
    items: [
      "수와 뜻은 이 표시가 붙은 host 컨트롤의 접근 이름이 담습니다. 아이콘 버튼이라면 그 버튼의 이름을 「알림 3개」나 「읽지 않은 메시지 3개」로 둡니다.",
      "컴포넌트는 수를 텍스트로 렌더할 뿐이고 aria-hidden이나 role=status를 두지 않습니다. 자기가 어디에 붙는지 모르므로 「3」이 무엇의 3인지 말할 수 없습니다.",
      "host 컨트롤의 이름에 수를 담지 않으면 스크린리더가 「3」만 읽습니다. 붙이는 자리마다 이름을 함께 고칩니다.",
    ],
  },
  {
    title: "남용하지 않기",
    items: [
      "중요한 액션을 유도할 때만 쓰고 그 수를 최소로 유지합니다.",
      "한 화면에 여러 개가 놓이면 시각적 피로를 주고 어느 것이 급한지 판단하는 것을 방해합니다. 결국 전부 무시됩니다.",
      "우선순위가 높은 자리에만 둡니다. 나머지는 화면 안에서 다른 방식으로 알립니다.",
    ],
  },
] as const satisfies readonly { title: string; items: readonly string[] }[];

const sections = [
  { id: "playground", label: "Playground" },
  { id: "anatomy", label: "Anatomy" },
  { id: "color", label: "Color" },
  { id: "guidelines", label: "Guidelines" },
  { id: "property-map", label: "Property map" },
];

export function NotificationBadgeWorkbench() {
  const [shape, setShape] = useState<(typeof shapes)[number]>("count");
  const [count, setCount] = useState(3);
  const [tone, setTone] = useState<NotificationBadgeTone>("accent");
  const [stroke, setStroke] = useState(true);
  const [max, setMax] = useState<NotificationBadgeMax>(99);

  const badge = shape === "dot"
    ? <NotificationBadge stroke={stroke} />
    : <NotificationBadge count={count} max={max} tone={tone} stroke={stroke} />;

  return (
    <div className="grid items-start gap-6 @min-[1120px]:grid-cols-[minmax(0,1fr)_11rem]">
      <div className="min-w-0 space-y-5">
        <Section id="playground" title="🚩 Playground" description="Shape과 Tone, Max, Stroke를 조합해 배지 자체를 확인합니다. 붙는 위치는 컴포넌트가 소유하지 않으므로 여기서는 얹지 않고 배지만 둡니다. Stroke는 배경색과 같은 링이라 한 단계 낮춘 바닥 위에서 보입니다.">
          <div className="col-span-full grid gap-5 rounded-xl border-2 border-oe-border-bold-primary bg-oe-background-secondary p-4 @min-[760px]:grid-cols-[minmax(14rem,1fr)_16rem]">
            <div lang="en" className="flex h-44 items-center justify-center rounded-xl bg-oe-background-secondary p-5">
              {badge}
            </div>
            <div className="space-y-5 rounded-xl bg-oe-background-primary p-4">
              <ControlSection title="Appearance">
                <ControlGroup label="Shape">{shapes.map((item) => <Choice key={item} active={shape === item} onClick={() => setShape(item)}>{item === "dot" ? "Dot" : "Count"}</Choice>)}</ControlGroup>
                <CountOnly active={shape === "count"}><ControlGroup label="Tone">{tones.map((item) => <Choice key={item} active={tone === item} onClick={() => setTone(item)}>{capitalize(item)}</Choice>)}</ControlGroup></CountOnly>
                <CountOnly active={shape === "count"}><ControlGroup label="Max">{maxValues.map((item) => <Choice key={item} active={max === item} onClick={() => setMax(item)}>{String(item)}</Choice>)}</ControlGroup></CountOnly>
              </ControlSection>
              <ControlSection title="Elements">
                <Toggle label="Stroke" value={stroke} onChange={setStroke} />
                <CountOnly active={shape === "count"}><NumberControl label="Count" value={count} min={0} max={1500} onChange={setCount} /></CountOnly>
              </ControlSection>
            </div>
          </div>
        </Section>

        <Section id="anatomy" title="Anatomy" description="Notification Badge를 구성하는 실제 요소와 문서에서 사용하는 명칭입니다. Count를 넘기지 않으면 Container만 남아 원이 됩니다.">
          <div className="col-span-full min-w-0">
            <AnatomySurface ariaLabel="Notification Badge anatomy" title="Notification Badge structure" className="px-5 pb-5 pt-12">
              <div lang="en" className="flex h-36 items-center justify-center">
                <AnatomyFrame>
                  <span data-slot="notification-badge" className="inline-flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full border border-oe-border-primary bg-oe-background-primary px-1 text-xs font-medium leading-none text-oe-foreground-secondary">
                    <span data-slot="notification-badge-count" className="block">12</span>
                  </span>
                  <AnatomyBoundaryMarker number={1} target="[data-slot=notification-badge]" side="left" connectorLength={36} />
                  <AnatomyNumber number={2} target="[data-slot=notification-badge-count]" side="bottom" />
                </AnatomyFrame>
              </div>
            </AnatomySurface>
            <AnatomyLegend items={[{ name: "Container" }, { name: "Count", optional: true }]} />

            <div className="mt-4">
              <AnatomyStructureMap lines={[
                { name: "Notification Badge" },
                { prefix: "└─ ", name: "Count", optional: true },
              ]} />
            </div>
          </div>
        </Section>

        <Section id="color" title="Properties · Color" description="Tone은 Accent와 Neutral 둘이며 기본값은 Accent입니다. 채운 형태만 있으므로 Tone마다 배경 하나와 글자 하나뿐이고, Badge와 같은 프리미티브 600단계를 씁니다. Dot은 색으로 뜻을 나눌 여지가 없어 Accent만 제공합니다.">
          <div lang="en" className="col-span-full min-w-0">
            <div className="grid w-fit grid-cols-[5rem_repeat(3,4.5rem)] items-center gap-x-4 gap-y-3">
              <span />
              <span className={SMALL_LABEL}>Dot</span>
              <span className={SMALL_LABEL}>Count</span>
              <span className={SMALL_LABEL}>Max</span>
              {tones.map((item) => (
                <Fragment key={item}>
                  <span className={SMALL_LABEL}>{capitalize(item)}</span>
                  <div>{item === "accent" ? <NotificationBadge stroke={false} /> : <span className={SMALL_LABEL} aria-label="제공하지 않음">—</span>}</div>
                  <div><NotificationBadge count={3} tone={item} stroke={false} /></div>
                  <div><NotificationBadge count={1200} max={999} tone={item} stroke={false} /></div>
                </Fragment>
              ))}
            </div>
          </div>
        </Section>

        <Section id="guidelines" title="Guidelines" description="어디에 붙이고 언제 표시하는지 정리합니다.">
          <div className="col-span-full grid max-w-3xl gap-8">
            <div>
              <GuidelineTitle>적절한 Shape 선택하기</GuidelineTitle>
              <p className="mt-2 text-sm leading-6 text-oe-foreground-secondary">둘은 무엇을 말하는지로 갈립니다. 같은 자리에 둘 다 놓을 수 있으므로 자리가 아니라 전달할 정보로 고릅니다.</p>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[38rem] text-left text-xs">
                  <thead className="border-b border-oe-border-secondary text-oe-foreground-tertiary"><tr><th className="w-28 py-2 font-medium">Shape</th><th className="py-2 font-medium">제공하는 정보</th><th className="py-2 font-medium">쓰는 자리</th></tr></thead>
                  <tbody className="divide-y divide-oe-border-secondary text-oe-foreground-secondary">
                    <tr>
                      <td className="py-3 pr-4 align-top"><div className="font-medium text-oe-foreground-primary">Dot</div><div className="mt-1.5"><NotificationBadge stroke={false} /></div></td>
                      <td className="py-3 pr-4 align-top leading-5">처리할 것이 있다는 사실만 알립니다. 수를 세게 만들지 않습니다.</td>
                      <td className="py-3 align-top leading-5">공간이 좁거나 정확한 수가 중요하지 않은 자리입니다. Tone은 Accent 하나뿐입니다.</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 align-top"><div className="font-medium text-oe-foreground-primary">Count</div><div lang="en" className="mt-1.5"><NotificationBadge count={12} stroke={false} /></div></td>
                      <td className="py-3 pr-4 align-top leading-5">Count를 함께 표시해 구체적인 알림 수나 상태 정보를 제공합니다.</td>
                      <td className="py-3 align-top leading-5">세부 정보가 중요하고 충분한 공간이 있을 때입니다. Max로 표시 폭의 상한을 정합니다.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {guidelines.map(({ title, items }) => (
              <div key={title}>
                <GuidelineTitle>{title}</GuidelineTitle>
                <GuidelineList items={[...items]} />
              </div>
            ))}
          </div>
        </Section>

        <Section id="property-map" title="Property map" description="실제 Props와 기본값입니다. Tone과 Max는 개수 형태에서만 뜻을 가지므로 점에 함께 넘기면 타입에서 걸립니다.">
          <div className="col-span-full overflow-x-auto">
            <table className="w-full min-w-[38rem] text-left text-xs">
              <thead className="border-b border-oe-border-secondary text-oe-foreground-tertiary"><tr><th className="py-2 font-medium">Property</th><th className="py-2 font-medium">Values</th><th className="py-2 font-medium">Default</th></tr></thead>
              <tbody className="divide-y divide-oe-border-secondary text-oe-foreground-secondary">
                <MapRow property="count" values="number" defaultValue="undefined (Dot)" />
                <MapRow property="max" values="99 | 999" defaultValue="99" />
                <MapRow property="tone" values="accent | neutral" defaultValue="accent" />
                <MapRow property="stroke" values="false | true" defaultValue="true" />
                <MapRow property="className" values="string" defaultValue="undefined" />
                <MapRow property="render" values="ReactElement | ComponentRenderFn" defaultValue="undefined" />
              </tbody>
            </table>
          </div>
        </Section>
      </div>
      <OnThisPage items={sections} componentKey="notification-badge" />
    </div>
  );
}

// Count 에서만 뜻을 갖는 컨트롤이다. Dot 을 골랐을 때 걷어내면 컨트롤 칸의 높이가 갈려 미리보기가
// 움직이므로, 자리를 남긴 채 `fieldset` 으로 비활성으로 둔다. `disabled` 는 안에 있는 button 과
// input 을 함께 끄고 tab 순서에서도 빼기 때문에 `pointer-events-none` 보다 정확하다.
function MapRow({ property, values, defaultValue }: { property: string; values: string; defaultValue: string }) { return <tr><td className="py-3 pr-4 font-mono text-[11px] text-oe-foreground-primary">{property}</td><td className="py-3 pr-4 font-mono text-[11px]">{values}</td><td className="py-3 font-mono text-[11px]">{defaultValue}</td></tr>; }

function CountOnly({ active, children }: { active: boolean; children: ReactNode }) {
  return <fieldset disabled={!active} className="min-w-0 disabled:opacity-40">{children}</fieldset>;
}

function Section({ id, title, description, children }: { id: string; title: string; description: string; children: ReactNode }) { return <section id={id} className="scroll-mt-20 rounded-2xl border border-oe-border-secondary bg-oe-background-primary p-5"><h3 className="text-xl font-semibold text-oe-foreground-primary">{title}</h3><p className="mt-1 text-xs leading-5 text-oe-foreground-tertiary">{description}</p><div className="mt-5 grid gap-3 @min-[720px]:grid-cols-2">{children}</div></section>; }
function ControlSection({ title, children }: { title: string; children: ReactNode }) { return <section><h4 className="mb-3 text-sm font-semibold text-oe-foreground-primary">{title}</h4><div className="space-y-3">{children}</div></section>; }
function ControlGroup({ label, children }: { label: string; children: ReactNode }) { return <fieldset><legend className={`mb-2 ${SMALL_LABEL}`}>{label}</legend><div className="flex flex-wrap gap-1.5">{children}</div></fieldset>; }
function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) { return <div className="flex items-center justify-between gap-3"><span className={SMALL_LABEL}>{label}</span><button type="button" role="switch" aria-checked={value} aria-label={label} onClick={() => onChange(!value)} className={`relative h-5 w-9 shrink-0 rounded-full ${value ? "bg-oe-background-bold-primary" : "bg-oe-background-secondary ring-1 ring-inset ring-oe-border-primary"}`}><span className={`absolute top-0.5 size-4 rounded-full bg-oe-background-primary shadow-sm transition-[left] ${value ? "left-[18px]" : "left-0.5"}`} /></button></div>; }
function NumberControl({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (value: number) => void }) { return <label className="block"><span className={`mb-1.5 block ${SMALL_LABEL}`}>{label}</span><input type="number" value={value} min={min} max={max} onChange={(event) => onChange(Number(event.target.value))} className="h-8 w-full rounded-lg border border-oe-border-primary bg-oe-background-primary px-2.5 text-xs tabular-nums text-oe-foreground-primary outline-none focus:border-oe-focus-ring focus:ring-1 focus:ring-oe-focus-ring" /></label>; }
function capitalize(value: string) { return value.charAt(0).toUpperCase() + value.slice(1); }
