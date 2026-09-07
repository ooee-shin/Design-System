"use client";

import { useState, type ReactNode } from "react";

import { Textarea } from "@ooee/ui";
import { AnatomyBoundaryMarker, AnatomyDescription, AnatomyLegend, AnatomyNumber, AnatomySurface } from "@/components/component-anatomy";
import { OnThisPage } from "@/components/component-detail-navigation";
import { GuidelineList, GuideVisual, UsageComparison } from "@/components/component-guidelines";
import { GuidelineTitle } from "@/components/guideline-title";
import { DependentControlGroup, PlaygroundChoice as Choice } from "@/components/playground-element-control";
import { PreviewLocaleScope } from "@/components/preview-locale-scope";
import { useStudioPreferences } from "@/components/studio-preferences-provider";

const copy = {
  ko: {
    description: "여러 줄 텍스트를 입력하는 컴포넌트입니다. Input과 같은 Style과 State를 사용하며 Leading과 Trailing element는 지원하지 않습니다.",
    placeholder: "내용을 입력하세요",
    value: "입력된 여러 줄 텍스트입니다.\n줄바꿈 상태를 함께 확인합니다.",
    invalid: "올바르지 않은 입력값",
    disabled: "비활성화된 입력값",
    readOnly: "읽기 전용 입력값",
    inquiryLabel: "문의 내용",
    inquiryValue: "결제가 두 번 승인된 것 같습니다. 어제 오후에 결제한 건이 카드 내역에 두 번 찍혀 있어서 확인을 부탁드립니다.",
    titleLabel: "제목",
    titleValue: "결제 오류 문의",
    memoLabel: "메모",
    attachmentLabel: "첨부 파일",
  },
  en: {
    description: "A multi-line text entry component. It shares Input styles and states but does not support leading or trailing elements.",
    placeholder: "Enter content",
    value: "Multi-line text value.\nThe line break is preserved.",
    invalid: "Invalid value",
    disabled: "Disabled value",
    readOnly: "Read-only value",
    inquiryLabel: "Inquiry",
    inquiryValue: "It looks like my payment went through twice. The charge from yesterday afternoon shows up twice on my card statement, so please take a look.",
    titleLabel: "Title",
    titleValue: "Duplicate payment",
    memoLabel: "Memo",
    attachmentLabel: "Attachment",
  },
} as const;

const textareaSections = [
  { id: "playground", label: "Playground" },
  { id: "anatomy", label: "Anatomy" },
  { id: "style", label: "Style" },
  { id: "sizing", label: "Sizing" },
  { id: "state", label: "State" },
  { id: "elements", label: "Elements" },
  { id: "guidelines", label: "Guidelines" },
  { id: "property-map", label: "Property map" },
];

export function TextareaWorkbench() {
  const { locale } = useStudioPreferences();
  const c = copy[locale];
  const [playgroundValue, setPlaygroundValue] = useState("");
  const [playgroundVariant, setPlaygroundVariant] = useState<"outline" | "filled">("outline");
  const [playgroundAutoSize, setPlaygroundAutoSize] = useState(false);
  const [playgroundResize, setPlaygroundResize] = useState(false);
  const [playgroundHeight, setPlaygroundHeight] = useState(88);

  return (
    <div className="grid items-start gap-6 @min-[1120px]:grid-cols-[minmax(0,1fr)_11rem]">
      <div className="min-w-0 space-y-5">

        <Section id="playground" title="🚩 Playground" description="Style, Resize와 Optional element를 조합해 실제 여러 줄 입력 상태를 확인합니다.">
          <div className="col-span-full grid gap-5 rounded-xl border-2 border-oe-border-bold-primary bg-oe-background-secondary p-4 @min-[900px]:grid-cols-[minmax(18rem,1fr)_18rem]">
            <div className="rounded-xl bg-oe-background-primary p-5">
              <Textarea variant={playgroundVariant} autoSize={playgroundAutoSize} resize={playgroundResize} height={playgroundHeight} value={playgroundValue} onChange={(event) => setPlaygroundValue(event.target.value)} placeholder={c.placeholder} />
            </div>
            <div className="space-y-5 rounded-xl bg-oe-background-primary p-4">
              <ControlSection title="Appearance">
                <Control label="Style"><Choice active={playgroundVariant === "outline"} onClick={() => setPlaygroundVariant("outline")}>Outline</Choice><Choice active={playgroundVariant === "filled"} onClick={() => setPlaygroundVariant("filled")}>Filled</Choice></Control>
              </ControlSection>
              <ControlSection title="Behavior">
              <Toggle label="Auto size" value={playgroundAutoSize} onChange={setPlaygroundAutoSize} />
              <DependentControlGroup className={playgroundAutoSize ? "pointer-events-none opacity-40" : undefined}>
                <div className="space-y-4">
                  <Toggle label="Resize" value={playgroundResize} onChange={setPlaygroundResize} />
                  <label className="flex items-center justify-between gap-3 text-[11px] font-medium text-oe-foreground-tertiary">Height <input type="number" min={88} step={4} value={playgroundHeight} onChange={(event) => setPlaygroundHeight(Math.max(88, Number(event.target.value) || 88))} className="h-8 w-20 rounded-lg border border-oe-border-secondary bg-oe-background-primary px-2 text-right text-xs text-oe-foreground-primary outline-none focus:border-oe-focus-ring" /></label>
                </div>
              </DependentControlGroup>
              </ControlSection>
            </div>
          </div>
        </Section>

        <Section id="anatomy" title="Anatomy" description="Textarea를 구성하는 실제 요소와 문서에서 사용하는 명칭입니다.">
          <TextareaAnatomy />
        </Section>

        <Section id="style" title="Properties · Style" description="Input과 동일하게 Outline과 Filled를 지원합니다.">
          <Example label="Outline"><Textarea placeholder={c.placeholder} /></Example>
          <Example label="Filled"><Textarea variant="filled" placeholder={c.placeholder} /></Example>
        </Section>

        <Section id="sizing" title="Properties · Sizing" description="Auto size가 상위 속성이며, 값에 따라 Height와 Resize의 적용 여부가 결정됩니다.">
          <Example label="Auto size · false" description="기본값입니다. Height로 초기 높이를 설정하고 Resize 사용 여부를 선택할 수 있습니다."><Textarea autoSize={false} height={88} defaultValue={c.value} /></Example>
          <Example label="Auto size · true" description="내용에 따라 높이가 자동으로 증가합니다. 하위 속성인 Height와 Resize는 적용하지 않으며, viewport에서 고정 영역을 제외한 Max height를 넘지 않아야 합니다."><Textarea autoSize defaultValue={c.value} /></Example>
          <Example label="Resize · false / true" description="Auto size가 false일 때만 활성화됩니다. true이면 세로 방향으로 높이를 변경할 수 있지만 동일한 Max height 제한을 넘지 않아야 합니다."><Textarea autoSize={false} resize defaultValue={c.value} /></Example>
          <Example label="Height · Minimum 88px" description="Auto size가 false일 때 초기 높이를 설정합니다. 기본값과 허용되는 최소값은 모두 88px입니다."><Textarea autoSize={false} height={112} defaultValue={c.value} /></Example>
        </Section>

        <Section id="state" title="Properties · State" description="Input과 같은 단색 Focus/Error 외곽선 구조를 사용합니다.">
          <Example label="Empty / Placeholder"><Textarea value="" onChange={() => undefined} placeholder={c.placeholder} /></Example>
          <Example label="Default · With value"><Textarea value={c.value} onChange={() => undefined} /></Example>
          <Example label="Focus"><Textarea value={c.value} onChange={() => undefined} containerClassName="border-oe-focus-ring ring-1 ring-oe-focus-ring" /></Example>
          <Example label="Invalid"><Textarea value={c.invalid} onChange={() => undefined} aria-invalid="true" /></Example>
          <Example label="Disabled" fixed><Textarea disabled tabIndex={-1} defaultValue={c.disabled} /></Example>
          <Example label="Read only" fixed><Textarea readOnly tabIndex={-1} defaultValue={c.readOnly} /></Example>
        </Section>

        <Section id="elements" title="Properties · Elements" description="Textarea는 Container와 Textarea field만으로 구성하며 내부 선택 요소를 지원하지 않습니다.">
          <Example label="Container + Textarea field"><Textarea placeholder={c.placeholder} /></Example>
        </Section>

        <Section id="guidelines" title="Guidelines" description="Textarea를 고르고 높이를 정할 때 적용하는 기준입니다.">
          <div className="col-span-full grid gap-8">
            <UsageComparison
              title="여러 줄이 필요한 값에만 사용하기"
              doText="여러 줄을 받는 값에 사용하세요."
              dontText="한 줄로 끝나는 값에 쓰지 마세요."
              description={[
                "문의 내용, 설명, 메모처럼 줄바꿈이 생기는 값에 사용합니다.",
                "제목이나 이름처럼 한 줄로 끝나는 값은 Input을 사용합니다. Textarea는 최소 88px를 차지하므로, 한 줄 값에 두면 쓰이지 않는 빈 영역이 남고 폼의 수직 리듬이 끊깁니다.",
              ]}
              doVisual={<PreviewLocaleScope className="w-full"><Textarea value={c.inquiryValue} readOnly aria-label={c.inquiryLabel} /></PreviewLocaleScope>}
              dontVisual={<PreviewLocaleScope className="w-full"><Textarea value={c.titleValue} readOnly aria-label={c.titleLabel} /></PreviewLocaleScope>}
            />
            <div>
              <GuidelineTitle>내부 요소와 Layout 선택은 제공하지 않기</GuidelineTitle>
              <GuidelineList items={[
                "Prefix와 Suffix, Clear button, Leading element와 Trailing element를 제공하지 않습니다. Container와 Textarea field만으로 구성합니다.",
                <>Layout은 <code className="text-xs text-oe-foreground-primary">fill</code>만이며 선택 Property가 없습니다. 폭은 부모가 정합니다.</>,
                "Input에서 쓰던 요소가 필요하다고 느껴지면 값이 한 줄인지, 또는 Label과 도움말처럼 Field가 담당할 일인지 다시 봅니다.",
              ]} />
            </div>
            <div>
              <GuidelineTitle>기본 높이는 3.5줄을 유지하기</GuidelineTitle>
              <div className="mt-3 grid gap-3 @min-[720px]:grid-cols-2">
                <GuideVisual label="기본 88px · 3.5줄">
                  <PreviewLocaleScope className="w-full"><Textarea value={c.inquiryValue} readOnly aria-label={c.inquiryLabel} /></PreviewLocaleScope>
                </GuideVisual>
                <GuideVisual label="초기 높이 128px · 5.5줄">
                  <PreviewLocaleScope className="w-full"><Textarea value={c.inquiryValue} readOnly height={128} aria-label={c.inquiryLabel} /></PreviewLocaleScope>
                </GuideVisual>
              </div>
              <GuidelineList items={[
                "기본 높이는 약 3.5줄이며 88px입니다. 이 값보다 줄일 수 없습니다.",
                "내용에 따라 초기 높이를 따로 지정할 수 있습니다. 이때 반 줄이 걸치는 지점으로 맞춥니다. 글자가 일부 잘려 보여야 아래에 더 쓸 자리가 있다는 것이 읽힙니다. 줄 수에 딱 맞추면 입력 영역이 거기서 끝난 것처럼 보입니다.",
              ]} />
            </div>
            <div>
              <GuidelineTitle>높이를 바꿀 수 있게 하면 세로만 허용하기</GuidelineTitle>
              <GuidelineList items={[
                <><code className="text-xs text-oe-foreground-primary">resize</code>는 세로 방향만 제공합니다. 가로는 제공하지 않습니다. 폭이 달라지면 같은 폼의 다른 필드와 시작점과 끝점이 어긋납니다.</>,
                <><code className="text-xs text-oe-foreground-primary">resize</code>는 <code className="text-xs text-oe-foreground-primary">autoSize</code>가 꺼져 있을 때만 적용됩니다. 둘을 함께 켜지 않습니다.</>,
              ]} />
            </div>
            <UsageComparison
              title="자동 높이는 아래 콘텐츠가 밀리지 않는 자리에서만 켜기"
              doText="마지막 콘텐츠이거나 아래가 밀리지 않는 자리에서 켜세요."
              dontText="아래에 다른 콘텐츠가 있는 자리에서 켜지 마세요."
              description={[
                <><code className="text-xs text-oe-foreground-primary">autoSize</code>는 기본값이 아니므로 필요한 자리에서 명시적으로 켭니다.</>,
                "켤 수 있는 자리는 셋입니다. 그 화면에 이 입력만 있는 경우, 마지막 콘텐츠인 경우, 아래 콘텐츠가 밀리지 않는 배치인 경우입니다.",
                "입력하는 동안 아래 콘텐츠가 계속 내려가면 방금 읽던 자리를 잃습니다. 두 예시에 직접 입력해 차이를 확인할 수 있습니다.",
              ]}
              doVisual={<PreviewLocaleScope className="w-full"><Textarea autoSize defaultValue={c.inquiryValue} aria-label={c.memoLabel} /></PreviewLocaleScope>}
              dontVisual={<PreviewLocaleScope className="w-full"><Textarea autoSize defaultValue={c.inquiryValue} aria-label={c.memoLabel} /><p className="mt-3 text-xs font-medium text-oe-foreground-primary">{c.attachmentLabel}</p><div className="mt-1 h-9 rounded-lg border border-dashed border-oe-border-primary" /></PreviewLocaleScope>}
            />
            <div>
              <GuidelineTitle>높이가 자라면 최대 높이를 뷰포트 안에 두기</GuidelineTitle>
              <GuidelineList items={[
                <><code className="text-xs text-oe-foreground-primary">resize</code>로 사용자가 늘리는 경우와 <code className="text-xs text-oe-foreground-primary">autoSize</code>로 자동으로 자라는 경우 모두, 최대 높이가 뷰포트 높이를 넘지 않게 합니다.</>,
                "정확한 차감 값은 아직 정하지 않았습니다. 확정되기 전까지 임의의 수치를 쓰지 않습니다.",
              ]} />
            </div>
          </div>
        </Section>

        <Section id="property-map" title="Property map" description="현재 확인된 Textarea의 상위 Property와 허용 값을 정리합니다.">
          <div className="col-span-full overflow-x-auto">
            <table className="w-full min-w-[38rem] text-left text-xs">
              <thead className="border-b border-oe-border-secondary text-oe-foreground-tertiary"><tr><th className="py-2 font-medium">Property</th><th className="py-2 font-medium">Values</th><th className="py-2 font-medium">Default</th><th className="py-2 font-medium">Status</th></tr></thead>
              <tbody className="divide-y divide-oe-border-secondary text-oe-foreground-secondary">
                <MapRow property="variant" values="outline | filled" defaultValue="outline" />
                <MapRow property="autoSize" values="false | true" defaultValue="false" note="Parent property" />
                <MapRow property="resize" values="false | true" defaultValue="false" note="autoSize=false only" />
                <MapRow property="height" values="≥ 88px" defaultValue="88px" note="autoSize=false only" />
                <MapRow property="minHeight" values="88px" defaultValue="88px" note="Always applied" />
                <MapRow property="maxHeight" values="viewport − reserved layout space" defaultValue="현재 정의 없음" note="Required; value pending" />
              </tbody>
            </table>
          </div>
        </Section>
      </div>
      <OnThisPage items={textareaSections} componentKey="textarea" />
    </div>
  );
}

function TextareaAnatomy() {
  return (
    <div className="col-span-full min-w-0">
      <AnatomySurface ariaLabel="Textarea anatomy" title="Textarea structure" className="px-5 pb-5 pt-12">
        <div className="overflow-x-auto">
          <div className="relative mx-auto h-[18rem] w-[40rem] text-oe-foreground-secondary">
            <AnatomyBoundaryMarker number={1} side="top" connectorLength={50} boundaryLength={448} className="left-[310px] top-[22px]" />
            <AnatomyNumber number={2} className="left-[310px] top-[244px]" lineClassName="left-2.5 bottom-[26px] h-[72px] w-px" />

            <div className="absolute left-24 top-28 h-[5.5rem] w-[28rem] overflow-hidden rounded-lg border border-oe-border-primary bg-oe-background-primary px-3 py-2 text-sm leading-5 whitespace-pre-line text-oe-foreground-placeholder">
              여러 줄 값을 입력하는 영역입니다.
            </div>
          </div>
        </div>
      </AnatomySurface>
      <AnatomyLegend items={[{ name: "Container" }, { name: "Textarea field" }]} />
      <AnatomyDescription>
        <p><span className="font-semibold text-oe-foreground-primary">Container:</span> 전체 입력 영역입니다. 최소 높이는 88px이며 약 3.5줄의 입력 공간을 확보합니다.</p>
        <p><span className="font-semibold text-oe-foreground-primary">Textarea field:</span> 실제 여러 줄 입력 영역입니다. Auto size가 true이면 내용에 따라 Container와 함께 높이가 증가합니다.</p>
      </AnatomyDescription>
    </div>
  );
}

function ControlSection({ title, children }: { title: string; children: ReactNode }) { return <section><h4 className="mb-3 text-sm font-semibold text-oe-foreground-primary">{title}</h4><div className="space-y-3">{children}</div></section>; }

function Section({ id, title, description, children }: { id: string; title: string; description: string; children: ReactNode }) {
  return <section id={id} className="scroll-mt-20 rounded-2xl border border-oe-border-secondary bg-oe-background-primary p-5"><h3 className="text-lg font-semibold text-oe-foreground-primary">{title}</h3><p className="mt-1 text-xs leading-5 text-oe-foreground-tertiary">{description}</p><div className="mt-5 grid gap-3 @min-[720px]:grid-cols-2">{children}</div></section>;
}

function Example({ label, description, children }: { label: string; description?: string; children: ReactNode; fixed?: boolean }) {
  return <div className="flex min-h-40 flex-col gap-3 rounded-xl border border-oe-border-secondary p-4"><div><p className="text-xs font-medium text-oe-foreground-primary">{label}</p>{description ? <p className="mt-1 text-[11px] leading-4 text-oe-foreground-tertiary">{description}</p> : null}</div><PreviewLocaleScope className="mt-auto">{children}</PreviewLocaleScope></div>;
}

function Control({ label, children }: { label: string; children: ReactNode }) {
  return <fieldset><legend className="mb-2 text-[11px] font-medium text-oe-foreground-tertiary">{label}</legend><div className="flex flex-wrap gap-1.5">{children}</div></fieldset>;
}


function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
  return <div className="flex items-center justify-between gap-3"><span className="text-[11px] font-medium text-oe-foreground-tertiary">{label}</span><button type="button" role="switch" aria-checked={value} aria-label={label} onClick={() => onChange(!value)} className={`relative h-5 w-9 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-focus-ring/40 ${value ? "bg-oe-background-bold-primary" : "bg-oe-background-secondary ring-1 ring-inset ring-oe-border-primary"}`}><span className={`absolute top-0.5 size-4 rounded-full bg-oe-background-primary shadow-sm transition-[left] ${value ? "left-[18px]" : "left-0.5"}`} /></button></div>;
}

function MapRow({ property, values, defaultValue, note = "Confirmed" }: { property: string; values: string; defaultValue: string; note?: string }) {
  return <tr><td className="py-2 pr-4 font-mono text-[11px] text-oe-foreground-primary">{property}</td><td className="py-2 pr-4">{values}</td><td className="py-2 pr-4">{defaultValue}</td><td className="py-2">{note}</td></tr>;
}
