"use client";

import { useState, type ReactNode } from "react";
import { RiHeartFill, RiHeartLine, RiPushpinFill, RiPushpinLine, RiSearchFill, RiSearchLine, RiStarFill, RiStarLine } from "@remixicon/react";
import { TOGGLE_BUTTON_COLORS, ToggleButton, type ToggleButtonColor, type ToggleButtonSize, type ToggleButtonVariant } from "@ooee/ui";

import { AnatomyBoundaryMarker, AnatomyFrame, AnatomyLegend, AnatomyNumber, AnatomyStructureMap, AnatomySurface } from "@/components/component-anatomy";
import { OnThisPage } from "@/components/component-detail-navigation";
import { DependentControlGroup, PlaygroundChoice as Choice } from "@/components/playground-element-control";

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

// Style 과 색의 조합마다 실제로 쓰이는 자리가 정해져 있으므로 미리보기 아이콘도 그 자리를 따라
// 바꾼다. 어느 조합에서나 별 하나를 그리면 Tonal 이 무엇을 알리는 Style 인지 화면에서 드러나지
// 않는다. 자리의 뜻은 `toggle-button.md` 의 Guidelines 가 소유한다.
const usages = {
  "ghost-brand": { icon: <RiPushpinLine />, activeIcon: <RiPushpinFill />, name: "Pin" },
  "ghost-favorite": { icon: <RiStarLine />, activeIcon: <RiStarFill />, name: "Favorite" },
  "ghost-like": { icon: <RiHeartLine />, activeIcon: <RiHeartFill />, name: "Wish" },
  "tonal-brand": { icon: <RiSearchLine />, activeIcon: <RiSearchFill />, name: "Search" },
} as const;

function usageOf(variant: ToggleButtonVariant, tone: ToneChoice, color: ToggleButtonColor) {
  if (variant === "tonal") return usages["tonal-brand"];
  if (tone === "brand") return usages["ghost-brand"];
  return color === "like" ? usages["ghost-like"] : usages["ghost-favorite"];
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

// 실제 ToggleButton 대신 도식으로 쓰는 모양이다. 높이·여백·모서리는 Regular 구현과 같게 두고
// 색만 Neutral 로 낮춘다. 색이 들어가면 Anatomy 가 특정 tone 의 예시처럼 읽힌다. 배경과 경계는
// 두지 않는다. 기본값인 Ghost 는 꺼짐에 둘 다 없으므로, 도식에 상자를 그리면 이 컴포넌트가
// 갖지 않는 모양을 구조로 설명하게 된다. Container 의 범위는 경계선이 아니라 1 번 표시가 알린다.
const TOGGLE_DIAGRAM =
  "inline-flex h-oe-control-regular items-center gap-1 rounded-oe-control pl-3 pr-3.5 text-sm font-medium text-oe-foreground-secondary [&_svg]:size-4";

const sections = [
  { id: "playground", label: "Playground" },
  { id: "anatomy", label: "Anatomy" },
];

export function ToggleButtonWorkbench() {
  const [variant, setVariant] = useState<ToggleButtonVariant>("ghost");
  const [tone, setTone] = useState<ToneChoice>("brand");
  const [color, setColor] = useState<ToggleButtonColor>("favorite");
  const [controlSize, setControlSize] = useState<ToggleButtonSize>("regular");
  const [pressed, setPressed] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [label, setLabel] = useState(false);

  const usage = usageOf(variant, tone, color);

  const shared = {
    variant,
    controlSize,
    disabled,
    pressed,
    onPressedChange: setPressed,
    icon: usage.icon,
    activeIcon: usage.activeIcon,
    "aria-label": label ? undefined : usage.name,
    children: label ? "Label" : undefined,
  };

  return (
    <div className="grid items-start gap-6 @min-[1120px]:grid-cols-[minmax(0,1fr)_11rem]">
      <div className="min-w-0 space-y-5">
        <Section id="playground" title="🚩 Playground" description="Style과 Size, Tone과 켜짐 상태를 조합해 확인합니다. Ghost는 대상 자체의 상태를 남기는 자리이고 Tonal은 영역을 열어 둔 상태를 알리는 자리이므로, 조합을 바꾸면 그 자리에 실제로 쓰는 아이콘으로 함께 바뀝니다. 높이는 Button과 같은 공통 Control Height를 따르며, 미리보기의 버튼을 직접 눌러도 Pressed가 바뀝니다.">
          <div className="col-span-full grid gap-5 rounded-xl border-2 border-oe-border-bold-primary bg-oe-background-secondary p-4 @min-[760px]:grid-cols-[minmax(14rem,1fr)_16rem]">
            <div lang="en" className="flex min-h-44 items-center justify-center rounded-xl bg-oe-background-primary p-5">
              <div className="flex w-full items-center justify-center">
                <ToggleButton {...toneProps(tone, color)} {...shared} />
              </div>
            </div>
            <div className="space-y-5 rounded-xl bg-oe-background-primary p-4">
              <ControlSection title="Appearance">
                <ControlGroup label="Style">{variants.map((item) => <Choice key={item} active={variant === item} onClick={() => { setVariant(item); if (item === "tonal") setTone("brand"); }}>{capitalize(item)}</Choice>)}</ControlGroup>
                <ControlGroup label="Size">{controlSizes.map((item) => <Choice key={item} active={controlSize === item} onClick={() => setControlSize(item)}>{sizeLabel[item]}</Choice>)}</ControlGroup>
                <fieldset>
                  <legend className={`mb-2 ${SMALL_LABEL}`}>Tone</legend>
                  <div className="flex flex-wrap gap-1.5">{(variant === "tonal" ? (["brand"] as const) : tones).map((item) => <Choice key={item} active={tone === item} onClick={() => setTone(item)}>{toneLabel[item]}</Choice>)}</div>
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
                <Toggle label="Disabled" value={disabled} onChange={setDisabled} />
              </ControlSection>
              <ControlSection title="Elements">
                <Toggle label="Label" value={label} onChange={setLabel} />
              </ControlSection>
            </div>
          </div>
        </Section>

        <Section id="anatomy" title="Anatomy" description="ToggleButton을 구성하는 실제 요소와 문서에서 사용하는 명칭입니다. 아이콘은 필수이며 Label은 선택입니다.">
          <div className="col-span-full min-w-0">
            <AnatomySurface ariaLabel="ToggleButton anatomy" title="ToggleButton structure" className="px-5 pb-5 pt-12">
              <div lang="en" className="flex h-36 items-center justify-center">
                <AnatomyFrame>
                  <span data-slot="toggle-button" className={TOGGLE_DIAGRAM}>
                    <span data-slot="toggle-button-icon" className="flex shrink-0 items-center">
                      <RiPushpinLine aria-hidden="true" />
                    </span>
                    <span data-slot="toggle-button-label" className="block truncate">Label</span>
                  </span>
                  <AnatomyBoundaryMarker number={1} target="[data-slot=toggle-button]" side="left" connectorLength={36} />
                  <AnatomyNumber number={2} target="[data-slot=toggle-button-icon]" side="bottom" />
                  <AnatomyNumber number={3} target="[data-slot=toggle-button-label]" side="top" />
                </AnatomyFrame>
              </div>
            </AnatomySurface>
            <AnatomyLegend items={[{ name: "Container" }, { name: "Icon" }, { name: "Label", optional: true }]} />

            <div className="mt-4">
              <AnatomyStructureMap lines={[
                { name: "ToggleButton" },
                { prefix: "├─ ", name: "Icon" },
                { prefix: "└─ ", name: "Label", optional: true },
              ]} />
            </div>
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
