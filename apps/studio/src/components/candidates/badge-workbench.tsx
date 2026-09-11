"use client";

import { Fragment, useState, type ReactNode } from "react";
import { RiTimeLine } from "@remixicon/react";
import { Badge, BADGE_COLORS, type BadgeColor, type BadgeSize, type BadgeTone, type BadgeVariant } from "@ooee/ui";

import { AnatomyBoundaryMarker, AnatomyFrame, AnatomyLegend, AnatomyNumber, AnatomyStructureMap, AnatomySurface } from "@/components/component-anatomy";
import { GuidelineList } from "@/components/component-guidelines";
import { GuidelineTitle } from "@/components/guideline-title";
import { OnThisPage } from "@/components/component-detail-navigation";
import { PlaygroundChoice as Choice } from "@/components/playground-element-control";

// semantic token을 쓰는 Tone 여섯과 색 이름을 받는 Custom을 나눠 둔다. Custom은 한 줄에 놓을
// 색이 정해져 있지 않으므로 색 표에서 22색을 따로 펼친다.
const semanticTones = ["brand", "neutral", "warning", "danger", "success", "info"] as const satisfies readonly BadgeTone[];
const tones = [...semanticTones, "custom"] as const satisfies readonly BadgeTone[];
const variants = ["fill", "tonal", "outlined"] as const satisfies readonly BadgeVariant[];
const sizes = ["small", "medium"] as const satisfies readonly BadgeSize[];
const sizeLabel: Record<BadgeSize, string> = { small: "Small · 20px · Default", medium: "Medium · 24px" };
const colors = BADGE_COLORS;

// Playground control의 라벨과 색 표의 행 라벨이 같은 위계로 읽히도록 한 곳에서 관리한다.
const SMALL_LABEL = "text-[11px] font-medium text-oe-foreground-tertiary";

// 실제 Badge 대신 도식으로 쓰는 모양이다. 높이와 여백은 구현과 같게 두고 색만 Neutral로 낮춘다.
const BADGE_DIAGRAM = "inline-flex h-5 items-center gap-1 rounded-sm border border-oe-border-primary bg-oe-background-primary pl-1 pr-1.5 text-xs font-medium text-oe-foreground-secondary [&_svg]:size-3";

// Style 카드는 Tone을 바꿔 가며 보여 준다. 강조의 세기가 Tone 색과 무관하게 유지되는지 한 줄에서
// 확인할 수 있고, Custom도 같은 규칙을 따르는 것이 함께 보인다.
const stylePreviewTones = ["brand", "success", "danger"] as const satisfies readonly Exclude<BadgeTone, "custom">[];

// Style은 강조의 세기로 갈린다. 고르는 사람이 자리마다 어느 것을 쓸지 판단할 수 있어야 하므로
// 쓰는 자리와 주의를 나눠 두고, 문구는 badge.md의 Guidelines와 같은 내용으로 유지한다.
// Style 카드와 Guidelines 표가 같은 원본을 읽어 두 곳의 설명이 갈라지지 않게 한다.
const styleGuidance = [
  { variant: "fill", label: "Fill", place: "배경이 복잡하거나 이미지 위에 Badge가 겹치는 자리입니다. 배경이 Tone 색으로 채워져 글자가 뒤쪽 그림에 닿지 않습니다.", caution: "여러 개를 나란히 두면 서로 경쟁해 목록이 읽히지 않습니다. 글자 대비가 결정적인 자리에서도 피합니다. 배경이 600단계라 밝은 색조에서 WCAG 2.x 대비가 4.5:1 아래입니다." },
  { variant: "tonal", label: "Tonal · Default", place: "반복되는 구조입니다. 목록이나 표에서 항목마다 상태를 붙이는 자리가 여기에 해당하며, 과하게 강조된 Badge가 주는 시각적 부담이 없습니다.", caution: "Light에서 neutral-100처럼 옅은 색을 Surface로 두는 자리에는 쓰지 않습니다. 배경이 같은 100단계라 Container가 보이지 않으며 그 자리는 Outlined를 씁니다. Dark는 배경이 알파라 Surface 단계와 무관하게 보입니다." },
  { variant: "outlined", label: "Outlined", place: "중간 정도의 주목도가 필요한 본문과 상세 화면입니다. 배경을 채우지 않으므로 주변 색을 덜 건드립니다.", caution: "배경이 복잡한 자리에서는 글자가 뒤쪽 그림에 그대로 닿습니다. 그 자리는 Fill이 담당합니다." },
] as const satisfies readonly { variant: BadgeVariant; label: string; place: string; caution: string }[]

// Guidelines 소제목은 기존 컴포넌트와 같이 「~하기」 동사형으로 쓰고, 쓰임별 항목은 Chip 의
// 「Chip을 Filter로 사용하기」 형태를 따른다. studio.md 는 공통 규칙을 앞에 두고 쓰임별 조합을 그
// 뒤에 두라고 정하므로 순서도 그렇게 둔다. 문구는 badge.md 의 Guidelines 와 같은 내용으로 유지한다.
const usageGuidance = [
  {
    title: "Tone 고르기",
    items: [
      "기본 여섯 중에서 전달하려는 의미와 맥락에 맞는 것을 고릅니다. 색을 먼저 고르고 의미를 붙이지 않습니다.",
      "상태를 뜻하는 자리에는 Warning·Danger·Success·Info를, 브랜드를 가리키는 자리에는 Brand를, 의미를 실어야 할 이유가 없는 분류에는 Neutral을 씁니다.",
      "여섯으로 설명되지 않는 색이 필요하면 Custom으로 색 이름을 지정합니다. 그 색이 나중에 정식 Tone으로 올라가도 단계 규칙이 같아 화면의 색은 달라지지 않습니다.",
    ],
  },
  {
    title: "최소한으로 사용하기",
    items: [
      "정보 전달에 효과적이지만 너무 많은 Badge를 나열하면 오히려 잘 보이지 않습니다. 한 자리에 1~2개를 권장합니다.",
      "여러 개를 두어야 하면 강조를 나누지 않고 Tonal로 맞춥니다. Fill은 그중 하나에만 씁니다.",
    ],
  },
  {
    title: "긴 Label은 사용하지 않기",
    items: [
      "짧고 명확한 정보 전달을 목적으로 합니다.",
      "Label은 줄바꿈하지 않으므로 길어지면 Badge가 그만큼 넓어져 옆 요소를 밀어냅니다. 문장으로 설명해야 하는 내용은 Badge에 담지 않습니다.",
    ],
  },
  {
    title: "누르는 동작을 두지 않기",
    items: [
      "클릭 가능한 요소가 아닙니다. 자체 interaction이나 state Property를 갖지 않으며 Hover나 Active 표시도 없습니다.",
      "누르는 동작이 필요하면 Chip이나 Button을 씁니다. 값을 고르거나 지우는 자리뿐 아니라, 동작이 없어도 독립적으로 놓이는 자리는 Chip이 담당합니다.",
      "render로 다른 요소가 될 수 있지만 그것이 누르는 동작을 허용한다는 뜻은 아닙니다.",
    ],
  },
  {
    title: "Badge를 카테고리 표시로 사용하기",
    items: [
      "콘텐츠를 그룹화하거나 분류하는 카테고리 태그로 씁니다.",
      "분류 자체에 의미를 실을 이유가 없으므로 Tonal에 Neutral을 기본으로 씁니다.",
      "분류를 색으로 구별해야 하면 Custom으로 색 이름을 지정합니다. 기본 여섯 중 상태를 뜻하는 Tone을 분류에 끌어다 쓰지 않습니다.",
    ],
  },
  {
    title: "Badge를 부가 정보와 혜택 전달로 사용하기",
    items: [
      "사용자에게 유용한 부가 정보나 혜택을 전달하는 데 씁니다.",
      "시선을 끌면서도 주요 콘텐츠를 방해하지 않도록 Tonal을 적용합니다.",
    ],
  },
  {
    title: "Badge를 상태 표시로 사용하기",
    items: [
      "항목의 현재 상태를 간결하게 표현합니다.",
      "사용자가 상태를 직관적으로 파악할 수 있도록 상태에 맞는 Tone을 씁니다. Warning·Danger·Success·Info가 그 자리를 담당합니다.",
      "상태를 색으로만 구별하지 않습니다. 색을 구별하기 어려운 사용자에게도 읽히도록 Label에 상태 이름을 함께 둡니다.",
    ],
  },
] as const satisfies readonly { title: string; items: readonly string[] }[]

const sections = [
  { id: "playground", label: "Playground" },
  { id: "anatomy", label: "Anatomy" },
  { id: "size", label: "Size" },
  { id: "style", label: "Style" },
  { id: "color", label: "Color" },
  { id: "guidelines", label: "Guidelines" },
  { id: "property-map", label: "Property map" },
];

export function BadgeWorkbench() {
  const [tone, setTone] = useState<BadgeTone>("neutral");
  const [variant, setVariant] = useState<BadgeVariant>("tonal");
  const [size, setSize] = useState<BadgeSize>("small");
  const [color, setColor] = useState<BadgeColor>("orange");
  const [leadingIcon, setLeadingIcon] = useState(false);

  const content = (
    <>
      {leadingIcon ? <RiTimeLine data-icon="inline-start" /> : null}
      Label
    </>
  );

  return (
    <div className="grid items-start gap-6 @min-[1120px]:grid-cols-[minmax(0,1fr)_11rem]">
      <div className="min-w-0 space-y-5">
        <Section id="playground" title="🚩 Playground" description="Style과 Size, Tone, Label 앞 아이콘을 조합해 확인합니다. Custom은 semantic family가 없는 색을 Status와 같은 단계 규칙으로 씁니다.">
          <div className="col-span-full grid gap-5 rounded-xl border-2 border-oe-border-bold-primary bg-oe-background-secondary p-4 @min-[760px]:grid-cols-[minmax(14rem,1fr)_16rem]">
            <div lang="en" className="flex min-h-44 items-center justify-center rounded-xl bg-oe-background-primary p-5">
              {tone === "custom" ? <Badge tone="custom" color={color} variant={variant} size={size}>{content}</Badge> : <Badge tone={tone} variant={variant} size={size}>{content}</Badge>}
            </div>
            <div className="space-y-5 rounded-xl bg-oe-background-primary p-4">
              <ControlSection title="Appearance">
                <ControlGroup label="Style">{variants.map((item) => <Choice key={item} active={variant === item} onClick={() => setVariant(item)}>{capitalize(item)}</Choice>)}</ControlGroup>
                <ControlGroup label="Size">{sizes.map((item) => <Choice key={item} active={size === item} onClick={() => setSize(item)}>{capitalize(item)}</Choice>)}</ControlGroup>
                <ControlGroup label="Tone">{tones.map((item) => <Choice key={item} active={tone === item} onClick={() => setTone(item)}>{capitalize(item)}</Choice>)}</ControlGroup>
                {tone === "custom" ? <ControlGroup label="Color">{colors.map((item) => <button key={item} type="button" aria-label={capitalize(item)} aria-pressed={color === item} onClick={() => setColor(item)} className={`size-5 rounded-full bg-${item}-500 ${color === item ? "ring-2 ring-oe-border-bold-primary ring-offset-2 ring-offset-oe-background-primary" : ""}`} />)}</ControlGroup> : null}
              </ControlSection>
              <ControlSection title="Elements">
                <Toggle label="Leading icon" value={leadingIcon} onChange={setLeadingIcon} />
              </ControlSection>
            </div>
          </div>
        </Section>

        <Section id="anatomy" title="Anatomy" description="Badge를 구성하는 실제 요소와 문서에서 사용하는 명칭입니다.">
          <div className="col-span-full min-w-0">
            <AnatomySurface ariaLabel="Badge anatomy" title="Badge structure" className="px-5 pb-5 pt-12">
              <div lang="en" className="flex h-36 items-center justify-center">
                <AnatomyFrame>
                  <span data-slot="badge" className={BADGE_DIAGRAM}>
                    <span data-slot="badge-icon" className="flex shrink-0 items-center">
                      <RiTimeLine aria-hidden="true" />
                    </span>
                    <span data-slot="badge-label" className="block truncate">Label</span>
                  </span>
                  <AnatomyBoundaryMarker number={1} target="[data-slot=badge]" side="left" connectorLength={36} />
                  <AnatomyNumber number={2} target="[data-slot=badge-icon]" side="bottom" />
                  <AnatomyNumber number={3} target="[data-slot=badge-label]" side="top" />
                </AnatomyFrame>
              </div>
            </AnatomySurface>
            <AnatomyLegend items={[{ name: "Container" }, { name: "Icon", optional: true }, { name: "Label" }]} />

            <div className="mt-4">
              <AnatomyStructureMap lines={[
                { name: "Badge" },
                { prefix: "├─ ", name: "Icon", optional: true },
                { prefix: "└─ ", name: "Label" },
              ]} />
            </div>
          </div>
        </Section>

        <Section id="size" title="Properties · Size" description="20px과 24px 두 단계입니다. 덧붙는 표시이므로 공통 Control Height를 따르지 않고 자기 크기 체계를 사용하며, 작은 쪽이 기본값입니다. 모서리 6px과 글자 12px은 두 단계가 함께 씁니다.">
          {sizes.map((item) => (
            <Example key={item} label={sizeLabel[item]} description={item === "small" ? "좌우 여백 6px, 아이콘이 붙는 변은 4px입니다." : "좌우 여백 8px, 아이콘이 붙는 변은 6px입니다. 높이가 커지면 여백도 한 단계 올려, 글자가 좌우에서 더 붙어 보이지 않게 합니다."}>
              <div lang="en" className="flex flex-wrap items-center gap-2">
                <Badge size={item}>Label</Badge>
                <Badge size={item}><RiTimeLine data-icon="inline-start" />Label</Badge>
              </div>
            </Example>
          ))}
        </Section>

        <Section id="style" title="Properties · Style" description="Fill, Tonal, Outlined 셋을 제공하며 기본값은 Tonal입니다. Tone은 기본 여섯 중에서 전달하려는 의미와 맥락에 맞는 것을 고르고, 여섯으로 설명되지 않는 색이 필요하면 Custom으로 색 이름을 직접 지정합니다.">
          {styleGuidance.map(({ variant: item, label, place }) => (
            <Example key={item} label={label} description={place}>
              <div lang="en" className="flex flex-wrap items-center gap-2">
                {stylePreviewTones.map((previewTone) => <Badge key={previewTone} tone={previewTone} variant={item}>Label</Badge>)}
                <Badge tone="custom" color="violet" variant={item}>Custom</Badge>
              </div>
            </Example>
          ))}
        </Section>

        <Section id="color" title="Properties · Color" description="왼쪽부터 Fill, Tonal, Outlined입니다. 위쪽은 semantic token을 쓰는 Tone 여섯이고, 아래쪽은 semantic family가 없는 색을 쓰는 Custom Tone의 18색입니다. 행 이름은 왼쪽에만 둡니다.">
          <div lang="en" className="col-span-full min-w-0 space-y-8">
            <ColorGrid rows={semanticTones} renderBadge={(rowTone, rowVariant) => <Badge tone={rowTone} variant={rowVariant}>Label</Badge>} />
            <ColorGrid rows={colors} renderBadge={(rowColor, rowVariant) => <Badge tone="custom" color={rowColor} variant={rowVariant}>Label</Badge>} />
          </div>
        </Section>
        <Section id="guidelines" title="Guidelines" description="어느 Style을 고르는지, 쓰임마다 무엇을 지키는지 정리합니다.">
          <div className="col-span-full grid max-w-3xl gap-8">
            <div>
              <GuidelineTitle>스타일 선택하기</GuidelineTitle>
              <p className="mt-2 text-sm leading-6 text-oe-foreground-secondary">셋은 강조의 세기와 배경을 채우는 방식으로 갈립니다. 주목도는 Fill이 가장 높고 Tonal이 가장 낮습니다.</p>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[40rem] text-left text-xs">
                  <thead className="border-b border-oe-border-secondary text-oe-foreground-tertiary"><tr><th className="w-32 py-2 font-medium">스타일</th><th className="py-2 font-medium">쓰는 자리</th><th className="py-2 font-medium">주의</th></tr></thead>
                  <tbody className="divide-y divide-oe-border-secondary text-oe-foreground-secondary">
                    {styleGuidance.map(({ variant: item, label, place, caution }) => (
                      <tr key={item}>
                        <td className="py-3 pr-4 align-top"><div className="font-medium text-oe-foreground-primary">{label}</div><div lang="en" className="mt-1.5"><Badge variant={item}>Label</Badge></div></td>
                        <td className="py-3 pr-4 align-top leading-5">{place}</td>
                        <td className="py-3 align-top leading-5">{caution}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {usageGuidance.map(({ title, items }) => (
              <div key={title}>
                <GuidelineTitle>{title}</GuidelineTitle>
                <GuidelineList items={[...items]} />
              </div>
            ))}
          </div>
        </Section>

        <Section id="property-map" title="Property map" description="실제 Props와 기본값입니다. Color는 Tone이 Custom일 때만 뜻을 가지므로 다른 Tone과 함께 넘기면 타입에서 걸립니다.">
          <div className="col-span-full overflow-x-auto">
            <table className="w-full min-w-[38rem] text-left text-xs">
              <thead className="border-b border-oe-border-secondary text-oe-foreground-tertiary"><tr><th className="py-2 font-medium">Property</th><th className="py-2 font-medium">Values</th><th className="py-2 font-medium">Default</th></tr></thead>
              <tbody className="divide-y divide-oe-border-secondary text-oe-foreground-secondary">
                <MapRow property="tone" values="brand | neutral | warning | danger | success | info | custom" defaultValue="neutral" />
                <MapRow property="variant" values="fill | tonal | outlined" defaultValue="tonal" />
                <MapRow property="size" values="small (20px) | medium (24px)" defaultValue="small" />
                <MapRow property="color" values="BADGE_COLORS 18색" defaultValue="undefined" />
                <MapRow property="children" values="ReactNode (Label)" defaultValue="undefined" />
                <MapRow property="className" values="string" defaultValue="undefined" />
                <MapRow property="render" values="ReactElement | ComponentRenderFn" defaultValue="undefined" />
              </tbody>
            </table>
          </div>
        </Section>

      </div>
      <OnThisPage items={sections} componentKey="badge" />
    </div>
  );
}

function MapRow({ property, values, defaultValue }: { property: string; values: string; defaultValue: string }) { return <tr><td className="py-3 pr-4 font-mono text-[11px] text-oe-foreground-primary">{property}</td><td className="py-3 pr-4 font-mono text-[11px]">{values}</td><td className="py-3 font-mono text-[11px]">{defaultValue}</td></tr>; }

function ColorGrid<T extends string>({ rows, renderBadge }: { rows: readonly T[]; renderBadge: (row: T, variant: BadgeVariant) => ReactNode }) {
  return (
    <div className="grid w-fit grid-cols-[4.5rem_repeat(3,7rem)] items-center gap-x-4 gap-y-2.5">
      <span />
      {variants.map((item) => <span key={item} className={SMALL_LABEL}>{capitalize(item)}</span>)}
      {rows.map((row) => (
        <Fragment key={row}>
          <span className={SMALL_LABEL}>{capitalize(row)}</span>
          {variants.map((item) => <div key={item}>{renderBadge(row, item)}</div>)}
        </Fragment>
      ))}
    </div>
  );
}

function Example({ label, description, children }: { label: string; description?: string; children: ReactNode }) { return <div className="flex min-h-32 min-w-0 flex-col gap-3 rounded-xl border border-oe-border-secondary p-4"><div><p className="text-xs font-medium text-oe-foreground-primary">{label}</p>{description ? <p className="mt-1 text-[11px] leading-4 text-oe-foreground-tertiary">{description}</p> : null}</div><div className="mt-auto">{children}</div></div>; }
function Section({ id, title, description, children }: { id: string; title: string; description: string; children: ReactNode }) { return <section id={id} className="scroll-mt-20 rounded-2xl border border-oe-border-secondary bg-oe-background-primary p-5"><h3 className="text-xl font-semibold text-oe-foreground-primary">{title}</h3><p className="mt-1 text-xs leading-5 text-oe-foreground-tertiary">{description}</p><div className="mt-5 grid gap-3 @min-[720px]:grid-cols-2">{children}</div></section>; }
function ControlSection({ title, children }: { title: string; children: ReactNode }) { return <section><h4 className="mb-3 text-sm font-semibold text-oe-foreground-primary">{title}</h4><div className="space-y-3">{children}</div></section>; }
function ControlGroup({ label, children }: { label: string; children: ReactNode }) { return <fieldset><legend className={`mb-2 ${SMALL_LABEL}`}>{label}</legend><div className="flex flex-wrap gap-1.5">{children}</div></fieldset>; }
function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) { return <div className="flex items-center justify-between gap-3"><span className={SMALL_LABEL}>{label}</span><button type="button" role="switch" aria-checked={value} aria-label={label} onClick={() => onChange(!value)} className={`relative h-5 w-9 shrink-0 rounded-full ${value ? "bg-oe-background-bold-primary" : "bg-oe-background-secondary ring-1 ring-inset ring-oe-border-primary"}`}><span className={`absolute top-0.5 size-4 rounded-full bg-oe-background-primary shadow-sm transition-[left] ${value ? "left-[18px]" : "left-0.5"}`} /></button></div>; }
function capitalize(value: string) { return value.charAt(0).toUpperCase() + value.slice(1); }
