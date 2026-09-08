"use client";

import { Fragment, useState, type ReactNode } from "react";
import { RiTimeLine } from "@remixicon/react";
import { Badge, type BadgeColor, type BadgeTone, type BadgeVariant } from "@ooee/ui";

import { AnatomyBoundaryMarker, AnatomyFrame, AnatomyLegend, AnatomyNumber, AnatomyStructureMap, AnatomySurface } from "@/components/component-anatomy";
import { OnThisPage } from "@/components/component-detail-navigation";
import { PlaygroundChoice as Choice } from "@/components/playground-element-control";

// semantic token을 쓰는 Tone 여섯과 색 이름을 받는 Custom을 나눠 둔다. Custom은 한 줄에 놓을
// 색이 정해져 있지 않으므로 색 표에서 22색을 따로 펼친다.
const semanticTones = ["brand", "neutral", "warning", "danger", "success", "info"] as const satisfies readonly BadgeTone[];
const tones = [...semanticTones, "custom"] as const satisfies readonly BadgeTone[];
const variants = ["fill", "tonal", "outlined"] as const satisfies readonly BadgeVariant[];
const colors = ["slate", "gray", "zinc", "neutral", "stone", "red", "orange", "amber", "yellow", "lime", "green", "emerald", "teal", "cyan", "sky", "blue", "indigo", "violet", "purple", "fuchsia", "pink", "rose"] as const satisfies readonly BadgeColor[];

// Playground control의 라벨과 색 표의 행 라벨이 같은 위계로 읽히도록 한 곳에서 관리한다.
const SMALL_LABEL = "text-[11px] font-medium text-oe-foreground-tertiary";

// 실제 Badge 대신 도식으로 쓰는 모양이다. 높이와 여백은 구현과 같게 두고 색만 Neutral로 낮춘다.
const BADGE_DIAGRAM = "inline-flex h-6 items-center gap-1 rounded-4xl border border-oe-border-primary bg-oe-background-primary pl-1.5 pr-2 text-xs font-medium text-oe-foreground-secondary [&_svg]:size-3";

const sections = [
  { id: "playground", label: "Playground" },
  { id: "anatomy", label: "Anatomy" },
  { id: "color", label: "Color" },
];

export function BadgeWorkbench() {
  const [tone, setTone] = useState<BadgeTone>("neutral");
  const [variant, setVariant] = useState<BadgeVariant>("tonal");
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
        <Section id="playground" title="🚩 Playground" description="24px 하나로 시작한 Badge입니다. Style과 Tone, Label 앞 아이콘을 조합해 확인합니다. Custom은 semantic family가 없는 색을 Status와 같은 단계 규칙으로 씁니다.">
          <div className="col-span-full grid gap-5 rounded-xl border-2 border-oe-border-bold-primary bg-oe-background-secondary p-4 @min-[760px]:grid-cols-[minmax(14rem,1fr)_16rem]">
            <div lang="en" className="flex min-h-44 items-center justify-center rounded-xl bg-oe-background-primary p-5">
              {tone === "custom" ? <Badge tone="custom" color={color} variant={variant}>{content}</Badge> : <Badge tone={tone} variant={variant}>{content}</Badge>}
            </div>
            <div className="space-y-5 rounded-xl bg-oe-background-primary p-4">
              <ControlSection title="Appearance">
                <ControlGroup label="Style">{variants.map((item) => <Choice key={item} active={variant === item} onClick={() => setVariant(item)}>{capitalize(item)}</Choice>)}</ControlGroup>
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

        <Section id="color" title="Properties · Color" description="왼쪽부터 Fill, Tonal, Outlined입니다. 위쪽은 semantic token을 쓰는 Tone 여섯이고, 아래쪽은 semantic family가 없는 색을 쓰는 Custom Tone의 22색입니다. 행 이름은 왼쪽에만 둡니다.">
          <div lang="en" className="col-span-full min-w-0 space-y-8">
            <ColorGrid rows={semanticTones} renderBadge={(rowTone, rowVariant) => <Badge tone={rowTone} variant={rowVariant}>Label</Badge>} />
            <ColorGrid rows={colors} renderBadge={(rowColor, rowVariant) => <Badge tone="custom" color={rowColor} variant={rowVariant}>Label</Badge>} />
          </div>
        </Section>
      </div>
      <OnThisPage items={sections} componentKey="badge" />
    </div>
  );
}

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

function Section({ id, title, description, children }: { id: string; title: string; description: string; children: ReactNode }) { return <section id={id} className="scroll-mt-20 rounded-2xl border border-oe-border-secondary bg-oe-background-primary p-5"><h3 className="text-xl font-semibold text-oe-foreground-primary">{title}</h3><p className="mt-1 text-xs leading-5 text-oe-foreground-tertiary">{description}</p><div className="mt-5 grid gap-3 @min-[720px]:grid-cols-2">{children}</div></section>; }
function ControlSection({ title, children }: { title: string; children: ReactNode }) { return <section><h4 className="mb-3 text-sm font-semibold text-oe-foreground-primary">{title}</h4><div className="space-y-3">{children}</div></section>; }
function ControlGroup({ label, children }: { label: string; children: ReactNode }) { return <fieldset><legend className={`mb-2 ${SMALL_LABEL}`}>{label}</legend><div className="flex flex-wrap gap-1.5">{children}</div></fieldset>; }
function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) { return <div className="flex items-center justify-between gap-3"><span className={SMALL_LABEL}>{label}</span><button type="button" role="switch" aria-checked={value} aria-label={label} onClick={() => onChange(!value)} className={`relative h-5 w-9 shrink-0 rounded-full ${value ? "bg-oe-background-bold-primary" : "bg-oe-background-secondary ring-1 ring-inset ring-oe-border-primary"}`}><span className={`absolute top-0.5 size-4 rounded-full bg-oe-background-primary shadow-sm transition-[left] ${value ? "left-[18px]" : "left-0.5"}`} /></button></div>; }
function capitalize(value: string) { return value.charAt(0).toUpperCase() + value.slice(1); }
