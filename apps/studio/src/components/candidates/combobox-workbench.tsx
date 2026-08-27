"use client";

import { useState, type ReactNode } from "react";
import { RiArrowDownSLine, RiSearchLine } from "@remixicon/react";
import { CheckboxIndicator, Combobox, MultiCombobox, comboboxSearchContainerVariants, type ComboboxOption } from "@ooee/ui";
import { AnatomyDescription, AnatomyLegend, AnatomyNumber, AnatomyStructureMap, AnatomySurface } from "@/components/component-anatomy";
import { OnThisPage } from "@/components/component-detail-navigation";
import { PreviewLocaleScope } from "@/components/preview-locale-scope";
import { useStudioPreferences } from "@/components/studio-preferences-provider";

const copy = {
  ko: { description: "대한민국 지역 중 하나를 선택합니다. Trigger를 열면 Popup 내부 Search input에서 지역을 필터링할 수 있습니다.", placeholder: "지역 선택", search: "지역 검색", selectedSearch: "선택 지역 검색", empty: "검색 결과가 없습니다.", all: "전체", remove: (label: string) => `${label} 삭제` },
  en: { description: "Select one region in South Korea. Open the trigger to filter regions using the search input inside the popup.", placeholder: "Select region", search: "Search regions", selectedSearch: "Search selected regions", empty: "No results found.", all: "All", remove: (label: string) => `Remove ${label}` },
} as const;

const regionOptions: Record<"ko" | "en", ComboboxOption[]> = {
  ko: [
    { value: "seoul", label: "서울특별시" }, { value: "busan", label: "부산광역시" }, { value: "daegu", label: "대구광역시" }, { value: "incheon", label: "인천광역시" }, { value: "gwangju", label: "광주광역시" }, { value: "daejeon", label: "대전광역시" }, { value: "ulsan", label: "울산광역시" }, { value: "sejong", label: "세종특별자치시" }, { value: "gyeonggi", label: "경기도" }, { value: "gangwon", label: "강원특별자치도" }, { value: "chungbuk", label: "충청북도" }, { value: "chungnam", label: "충청남도" }, { value: "jeonbuk", label: "전북특별자치도" }, { value: "jeonnam", label: "전라남도" }, { value: "gyeongbuk", label: "경상북도" }, { value: "gyeongnam", label: "경상남도" }, { value: "jeju", label: "제주특별자치도" },
  ],
  en: [
    { value: "seoul", label: "Seoul" }, { value: "busan", label: "Busan" }, { value: "daegu", label: "Daegu" }, { value: "incheon", label: "Incheon" }, { value: "gwangju", label: "Gwangju" }, { value: "daejeon", label: "Daejeon" }, { value: "ulsan", label: "Ulsan" }, { value: "sejong", label: "Sejong" }, { value: "gyeonggi", label: "Gyeonggi-do" }, { value: "gangwon", label: "Gangwon State" }, { value: "chungbuk", label: "Chungcheongbuk-do" }, { value: "chungnam", label: "Chungcheongnam-do" }, { value: "jeonbuk", label: "Jeonbuk State" }, { value: "jeonnam", label: "Jeollanam-do" }, { value: "gyeongbuk", label: "Gyeongsangbuk-do" }, { value: "gyeongnam", label: "Gyeongsangnam-do" }, { value: "jeju", label: "Jeju Special Self-Governing Province" },
  ],
};
const subwayDepths = [
  { id: "line-1", label: "1호선", options: ["서울역", "시청", "종각", "종로3가", "동대문", "신설동", "청량리", "회기", "구로", "영등포"] },
  { id: "line-2", label: "2호선", options: ["신림", "사당", "강남", "잠실", "홍대입구", "합정", "신촌", "시청", "왕십리", "건대입구"] },
  { id: "line-3", label: "3호선", options: ["경복궁", "압구정", "교대", "고속터미널", "수서", "안국", "충무로", "약수", "도곡", "대청"] },
  { id: "line-4", label: "4호선", options: ["혜화", "동대문", "명동", "서울역", "사당", "한성대입구", "충무로", "삼각지", "이촌", "총신대입구"] },
  { id: "line-5", label: "5호선", options: ["광화문", "여의도", "왕십리", "군자", "김포공항", "공덕", "마포", "종로3가", "답십리", "천호"] },
  { id: "line-6", label: "6호선", options: ["이태원", "약수", "공덕", "합정", "월드컵경기장", "망원", "디지털미디어시티", "연신내", "안암", "태릉입구"] },
  { id: "line-7", label: "7호선", options: ["노원", "건대입구", "고속터미널", "가산디지털단지", "이수", "태릉입구", "상봉", "청담", "논현", "대림"] },
  { id: "line-8", label: "8호선", options: ["암사", "천호", "잠실", "석촌", "복정", "강동구청", "몽촌토성", "송파", "문정", "장지"] },
  { id: "line-9", label: "9호선", options: ["김포공항", "여의도", "고속터미널", "신논현", "중앙보훈병원", "당산", "노량진", "동작", "선정릉", "석촌"] },
] as const;
const sections = [{ id: "single-playground", label: "Single Playground" }, { id: "multiple-playground", label: "Multiple Playground" }, { id: "anatomy", label: "Anatomy" }, { id: "selection", label: "Selection" }, { id: "style", label: "Style" }, { id: "size", label: "Size" }, { id: "state", label: "State" }, { id: "property-map", label: "Property map" }];

export function ComboboxWorkbench() {
  const { locale } = useStudioPreferences();
  const c = copy[locale];
  const options = regionOptions[locale];
  const [value, setValue] = useState<string | null>(null);
  const [multipleValues, setMultipleValues] = useState<string[]>([]);
  const [variant, setVariant] = useState<"outline" | "filled">("outline");
  const [controlSize, setControlSize] = useState<"small" | "regular" | "large" | "xlarge">("regular");
  const [disabled, setDisabled] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [multiVariant, setMultiVariant] = useState<"outline" | "filled">("outline");
  const [multiControlSize, setMultiControlSize] = useState<"small" | "regular" | "large" | "xlarge">("regular");
  const [multiDisabled, setMultiDisabled] = useState(false);
  const [multiInvalid, setMultiInvalid] = useState(false);
  const [selectedDisplay, setSelectedDisplay] = useState<"summary" | "container">("summary");

  const common = { options, placeholder: c.placeholder, searchPlaceholder: c.search, emptyMessage: c.empty, ariaLabel: c.placeholder };

  return (
    <div className="grid items-start gap-6 @min-[1120px]:grid-cols-[minmax(0,1fr)_11rem]">
      <div className="min-w-0 space-y-5">
        <header className="rounded-2xl border border-oe-border-secondary bg-oe-background-primary p-5"><h2 className="text-lg font-semibold text-oe-foreground-primary">Combobox</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-oe-foreground-secondary">{c.description}</p></header>
        <Section id="single-playground" title="🚩 Single Playground" description="단일 선택의 Style, Size, State와 Popup 검색을 조합해 확인합니다.">
          <div className="col-span-full grid gap-5 rounded-xl border-2 border-oe-border-bold-primary bg-oe-background-secondary p-4 @min-[900px]:grid-cols-[minmax(18rem,1fr)_18rem]">
            <div className="min-h-56 rounded-xl bg-oe-background-primary p-5"><Combobox {...common} value={value} onValueChange={setValue} variant={variant} controlSize={controlSize} disabled={disabled} invalid={invalid} /></div>
            <div className="space-y-4 rounded-xl bg-oe-background-primary p-4"><Control label="Style"><Choice active={variant === "outline"} onClick={() => setVariant("outline")}>Outline</Choice><Choice active={variant === "filled"} onClick={() => setVariant("filled")}>Filled</Choice></Control><Control label="Size">{(["small", "regular", "large", "xlarge"] as const).map((size) => <Choice key={size} active={controlSize === size} onClick={() => setControlSize(size)}>{size}</Choice>)}</Control><Toggle label="Disabled" value={disabled} onChange={setDisabled} /><Toggle label="Invalid" value={invalid} onChange={setInvalid} /></div>
          </div>
        </Section>
        <Section id="multiple-playground" title="🚩 Multiple Playground" description="Checkbox 다중 선택, 전체 선택과 선택 결과 Chip 표시를 독립적으로 확인합니다.">
          <div className="col-span-full grid gap-5 rounded-xl border-2 border-oe-border-bold-primary bg-oe-background-secondary p-4 @min-[900px]:grid-cols-[minmax(18rem,1fr)_18rem]">
            <div className="min-h-56 rounded-xl bg-oe-background-primary p-5"><MultiCombobox {...common} value={multipleValues} onValueChange={setMultipleValues} selectedSummaryLabel={(first, remaining) => remaining > 0 ? locale === "ko" ? `${first} 외 ${remaining}곳` : `${first} +${remaining}` : first} selectedDisplay={selectedDisplay} selectAllLabel={c.all} selectedSearchPlaceholder={c.selectedSearch} removeSelectedLabel={c.remove} variant={multiVariant} controlSize={multiControlSize} disabled={multiDisabled} invalid={multiInvalid} /></div>
            <div className="space-y-4 rounded-xl bg-oe-background-primary p-4"><Control label="Selected display"><Choice active={selectedDisplay === "summary"} onClick={() => setSelectedDisplay("summary")}>Summary</Choice><Choice active={selectedDisplay === "container"} onClick={() => setSelectedDisplay("container")}>Container</Choice></Control><Control label="Style"><Choice active={multiVariant === "outline"} onClick={() => setMultiVariant("outline")}>Outline</Choice><Choice active={multiVariant === "filled"} onClick={() => setMultiVariant("filled")}>Filled</Choice></Control><Control label="Size">{(["small", "regular", "large", "xlarge"] as const).map((size) => <Choice key={size} active={multiControlSize === size} onClick={() => setMultiControlSize(size)}>{size}</Choice>)}</Control><Toggle label="Disabled" value={multiDisabled} onChange={setMultiDisabled} /><Toggle label="Invalid" value={multiInvalid} onChange={setMultiInvalid} /></div>
          </div>
        </Section>
        <Section id="anatomy" title="Anatomy" description="닫힌 Trigger와 열린 Content container의 구조를 분리해 확인합니다.">
          <div className="col-span-full grid gap-8">
            <div>
              <AnatomySurface ariaLabel="Combobox trigger anatomy" title="Trigger anatomy" className="px-5">
                <div lang="en" className="relative mx-auto max-w-md px-8 py-14">
                  <div className="flex h-9 items-center gap-2 rounded-lg border border-oe-border-primary bg-oe-background-primary px-3 text-sm">
                    <span className="flex-1 text-oe-foreground-secondary">Selected value / Placeholder</span>
                    <RiArrowDownSLine className="size-4 text-oe-foreground-tertiary" />
                  </div>
                  <AnatomyNumber number={1} className="left-0 top-16" lineClassName="left-5 top-2.5 h-px w-2" />
                  <span aria-hidden="true" className="absolute left-7 top-14 h-9 w-px bg-oe-border-primary" />
                  <AnatomyNumber number={2} className="left-[42%] top-4" lineClassName="left-2.5 top-5 h-8 w-px" />
                  <AnatomyNumber number={3} className="right-[42px] top-4" lineClassName="left-2.5 top-5 h-8 w-px" />
                </div>
              </AnatomySurface>
              <AnatomyLegend items={[{ name: "Trigger container" }, { name: "Selected value / Placeholder" }, { name: "Trigger icon" }]} />
            </div>

            <div>
              <AnatomySurface ariaLabel="Combobox content anatomy" title="Content anatomy" className="px-5">
                <div lang="en" className="relative mx-auto max-w-md px-8 py-14">
                  <div className="overflow-hidden rounded-xl border border-oe-border-primary bg-oe-background-primary p-2 shadow-lg">
                    <div className={comboboxSearchContainerVariants()}>
                      <RiSearchLine className="size-4 text-oe-foreground-tertiary" />
                      <span className="text-sm text-oe-foreground-placeholder">Search input</span>
                    </div>
                    <div className="mt-2">
                      <div className="flex min-h-9 items-center gap-2 rounded-md px-2.5 text-sm">
                        <CheckboxIndicator />
                        <span className="flex-1">Option</span>
                      </div>
                      <div className="flex min-h-9 items-center gap-2 rounded-md px-2.5 text-sm text-oe-foreground-tertiary">
                        <span className="grid size-4 place-items-center rounded border border-oe-border-primary bg-oe-background-primary" />
                        <span className="flex-1">Option</span>
                      </div>
                    </div>
                  </div>
                  <AnatomyNumber number={4} className="left-0 top-16" lineClassName="left-5 top-2.5 h-px w-2" />
                  <span aria-hidden="true" className="absolute bottom-14 left-7 top-14 w-px bg-oe-border-primary" />
                  <AnatomyNumber number={5} className="left-[42%] top-4" lineClassName="left-2.5 top-5 h-8 w-px" />
                  <AnatomyNumber number={6} className="right-0 top-[130px]" lineClassName="right-5 top-2.5 h-px w-2" />
                  <span aria-hidden="true" className="absolute right-7 top-[104px] h-[72px] w-px bg-oe-border-primary" />
                  <AnatomyNumber number={7} className="left-[32%] bottom-4" lineClassName="bottom-5 left-2.5 h-8 w-px" />
                </div>
              </AnatomySurface>
              <AnatomyLegend start={4} items={[{ name: "Content container" }, { name: "Search input" }, { name: "Option list" }, { name: "Option / Checkbox" }]} />
            </div>

            <AnatomyStructureMap lines={[
              { name: "Combobox root" },
              { prefix: "├─ ", name: "Trigger container" },
              { prefix: "│  ├─ ", name: "Selected value / Placeholder" },
              { prefix: "│  └─ ", name: "Trigger icon" },
              { prefix: "└─ ", name: "Content container" },
              { prefix: "   ├─ ", name: "Search input" },
              { prefix: "   └─ ", name: "Option list" },
              { prefix: "      └─ ", name: "Option" },
              { prefix: "         ├─ ", name: "Checkbox (Multiple)" },
              { prefix: "         └─ ", name: "Selected indicator (Single)" },
            ]} />

            <AnatomyDescription><p>Single과 Multiple은 같은 Trigger와 검색 구조를 사용합니다. Multiple Option은 Checkbox를, Single Option은 선택된 항목에 Selected indicator를 표시합니다.</p></AnatomyDescription>
          </div>
        </Section>
        <Section id="selection" title="Properties · Selection" description="단일 선택과 체크박스를 사용하는 다중 선택은 값과 완료 동작이 달라 별도 컴포넌트로 제공합니다."><Example label="Single"><Combobox {...common} defaultValue="seoul" /></Example><Example label="Multiple · Summary"><MultiCombobox {...common} defaultValue={["seoul", "gyeonggi"]} selectedSummaryLabel={(first, remaining) => remaining > 0 ? locale === "ko" ? `${first} 외 ${remaining}곳` : `${first} +${remaining}` : first} selectAllLabel={c.all} /></Example><Example label="Multiple · Container"><MultiCombobox {...common} defaultValue={["seoul", "gyeonggi"]} selectedSummaryLabel={(first, remaining) => remaining > 0 ? locale === "ko" ? `${first} 외 ${remaining}곳` : `${first} +${remaining}` : first} selectedDisplay="container" selectAllLabel={c.all} selectedSearchPlaceholder={c.selectedSearch} removeSelectedLabel={c.remove} /></Example><div className="col-span-full"><Example label="Multiple · 2-depth"><SubwayDepthExample /></Example></div></Section>
        <Section id="style" title="Properties · Style" description="Input과 같은 Outline과 Filled 시각 규칙을 사용합니다."><Example label="Outline"><Combobox {...common} defaultValue="seoul" /></Example><Example label="Filled"><Combobox {...common} defaultValue="seoul" variant="filled" /></Example></Section>
        <Section id="size" title="Properties · Size" description="Input과 Button이 공유하는 Control Height를 사용합니다.">{(["small", "regular", "large", "xlarge"] as const).map((size) => <Example key={size} label={`${size} · ${size === "small" ? 32 : size === "regular" ? 36 : size === "large" ? 40 : 48}px`}><Combobox {...common} controlSize={size} /></Example>)}</Section>
        <Section id="state" title="Properties · State" description="값은 고정하지만 Trigger의 Focus와 Popup 열림은 실제로 확인할 수 있습니다."><Example label="Placeholder"><Combobox {...common} value={null} onValueChange={() => undefined} /></Example><Example label="Selected"><Combobox {...common} value="seoul" onValueChange={() => undefined} /></Example><Example label="Invalid"><Combobox {...common} value="seoul" onValueChange={() => undefined} invalid /></Example><Example label="Disabled"><Combobox {...common} value="seoul" onValueChange={() => undefined} disabled /></Example></Section>
        <Section id="property-map" title="Property map" description="현재 구현하고 확인한 속성만 정리합니다."><div className="col-span-full overflow-x-auto"><table className="w-full min-w-[38rem] text-left text-xs"><thead className="border-b border-oe-border-secondary text-oe-foreground-tertiary"><tr><th className="py-2">Property</th><th>Values</th><th>Default</th></tr></thead><tbody className="divide-y divide-oe-border-secondary text-oe-foreground-secondary"><MapRow property="component" values="Combobox | MultiCombobox" defaultValue="Combobox" /><MapRow property="variant" values="outline | filled" defaultValue="outline" /><MapRow property="controlSize" values="small | regular | large | xlarge" defaultValue="regular" /><MapRow property="value" values="string | null / string[]" defaultValue="null / []" /><MapRow property="selectedDisplay" values="summary | container (Multi only)" defaultValue="summary" /><MapRow property="selectedSearchPlaceholder" values="string (Multi only)" defaultValue="Search selected items" /><MapRow property="removeSelectedLabel" values="(label) => string (Multi only)" defaultValue="Remove {label}" /><MapRow property="selectAllLabel" values="string (Multi only)" defaultValue="All" /><MapRow property="disabled" values="false | true" defaultValue="false" /><MapRow property="invalid" values="false | true" defaultValue="false" /></tbody></table></div></Section>
      </div>
      <OnThisPage items={sections} componentKey="combobox" />
    </div>
  );
}

function SubwayDepthExample() {
  const [activeDepth, setActiveDepth] = useState<(typeof subwayDepths)[number]["id"]>("line-2");
  const [selectedStations, setSelectedStations] = useState<string[]>(["신림", "강남"]);
  const [query, setQuery] = useState("");
  const currentDepth = subwayDepths.find((depth) => depth.id === activeDepth) ?? subwayDepths[0];
  const visibleOptions = currentDepth.options.filter((line) => line.includes(query.trim()));
  const allCurrentSelected = currentDepth.options.every((station) => selectedStations.includes(station));
  const someCurrentSelected = !allCurrentSelected && currentDepth.options.some((station) => selectedStations.includes(station));

  const toggleAllCurrent = () => {
    setSelectedStations((current) => {
      if (allCurrentSelected) {
        const currentOptions = new Set<string>(currentDepth.options);
        return current.filter((station) => !currentOptions.has(station));
      }
      return Array.from(new Set([...current, ...currentDepth.options]));
    });
  };

  return (
    <div className="overflow-hidden rounded-xl border border-oe-border-primary bg-oe-background-primary shadow-sm">
      <div className="p-2">
        <div className={comboboxSearchContainerVariants()}><RiSearchLine className="size-4 shrink-0 text-oe-foreground-tertiary" aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="역 검색" aria-label="역 검색" className="h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-oe-foreground-placeholder" /></div>
      </div>
      <div className="grid min-w-0 grid-cols-[minmax(7rem,0.8fr)_minmax(0,1.2fr)] border-t border-oe-border-secondary">
        <div className="relative h-[270px] bg-neutral-50 after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:z-10 after:w-px after:bg-oe-border-secondary">
          <div className="h-full overflow-x-hidden overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {subwayDepths.map((depth) => (
              <button key={depth.id} type="button" onClick={() => { setActiveDepth(depth.id); setQuery(""); }} className={`flex min-h-9 w-full items-center border-b border-oe-border-secondary pl-[18px] pr-2 text-left text-oe-label ${activeDepth === depth.id ? "relative z-20 bg-oe-background-primary font-medium text-oe-foreground-primary" : "text-oe-foreground-secondary hover:bg-oe-interaction-hover"}`}>
                <span className="min-w-0 flex-1 truncate">{depth.label}</span><RiArrowDownSLine className="size-4 -rotate-90 text-oe-foreground-tertiary" aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
        <div className="h-[270px] overflow-x-hidden overflow-y-auto p-2 [scrollbar-color:transparent_transparent] [scrollbar-width:thin] hover:[scrollbar-color:var(--oe-border-primary)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-oe-border-primary">
          <p className="px-2.5 pb-1.5 pt-1 text-[11px] font-medium text-oe-foreground-tertiary">{currentDepth.label}</p>
          <button type="button" role="checkbox" aria-checked={someCurrentSelected ? "mixed" : allCurrentSelected} onClick={toggleAllCurrent} className="flex min-h-9 w-full items-center gap-2 rounded-md px-2.5 text-left text-oe-label hover:bg-oe-interaction-hover">
            <CheckboxIndicator checked={allCurrentSelected} indeterminate={someCurrentSelected} />
            <span>전체</span>
          </button>
          {visibleOptions.map((line) => {
            const selected = selectedStations.includes(line);
            return (
              <button key={line} type="button" aria-pressed={selected} onClick={() => setSelectedStations((current) => selected ? current.filter((value) => value !== line) : [...current, line])} className={`flex min-h-9 w-full items-center gap-2 rounded-md px-2.5 text-left text-oe-label ${selected ? "" : "hover:bg-oe-interaction-hover"}`}>
                <CheckboxIndicator checked={selected} />
                <span>{line}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Section({ id, title, description, children }: { id: string; title: string; description: string; children: ReactNode }) { return <section id={id} className="scroll-mt-20 rounded-2xl border border-oe-border-secondary bg-oe-background-primary p-5"><h3 className="text-sm font-semibold text-oe-foreground-primary">{title}</h3><p className="mt-1 text-xs leading-5 text-oe-foreground-tertiary">{description}</p><div className="mt-5 grid gap-3 @min-[720px]:grid-cols-2">{children}</div></section>; }
function Example({ label, children }: { label: string; children: ReactNode }) { return <div className="flex min-h-28 flex-col gap-3 rounded-xl border border-oe-border-secondary p-4"><p className="text-[11px] font-medium text-oe-foreground-primary">{label}</p><PreviewLocaleScope className="mt-auto">{children}</PreviewLocaleScope></div>; }
function Control({ label, children }: { label: string; children: ReactNode }) { return <fieldset><legend className="mb-2 text-[11px] font-medium text-oe-foreground-tertiary">{label}</legend><div className="flex flex-wrap gap-1.5">{children}</div></fieldset>; }
function Choice({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) { return <button type="button" aria-pressed={active} onClick={onClick} className={`rounded-lg border px-2.5 py-1.5 text-xs ${active ? "border-oe-foreground-primary bg-oe-background-bold-primary text-oe-foreground-inverse" : "border-oe-border-secondary text-oe-foreground-secondary hover:bg-oe-interaction-hover"}`}>{children}</button>; }
function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) { return <div className="flex items-center justify-between gap-3"><span className="text-[11px] font-medium text-oe-foreground-tertiary">{label}</span><button type="button" role="switch" aria-checked={value} aria-label={label} onClick={() => onChange(!value)} className={`relative h-5 w-9 rounded-full ${value ? "bg-oe-background-bold-primary" : "bg-oe-background-secondary ring-1 ring-inset ring-oe-border-primary"}`}><span className={`absolute top-0.5 size-4 rounded-full bg-oe-background-primary shadow-sm transition-[left] ${value ? "left-[18px]" : "left-0.5"}`} /></button></div>; }
function MapRow({ property, values, defaultValue }: { property: string; values: string; defaultValue: string }) { return <tr><td className="py-2 pr-4 font-mono text-[11px] text-oe-foreground-primary">{property}</td><td className="pr-4">{values}</td><td>{defaultValue}</td></tr>; }
