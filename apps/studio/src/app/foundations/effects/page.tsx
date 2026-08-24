import { CatalogGrid, CatalogCard, CatalogTable, FoundationCatalog, FoundationSection } from "@/components/foundations/foundation-catalog";
import { FoundationPageShell } from "@/components/foundations/foundation-page-shell";

export default function EffectsFoundationPage() {
  return <FoundationPageShell title="Effects" description="현재 등록된 border·focus·interaction token과 사용 중인 shadow primitive를 표시합니다."><FoundationCatalog><FoundationSection title="Semantic effect token" description="Light/Dark에 따라 실제 값이 바뀌는 공용 oe token입니다."><CatalogTable rows={[
    { name: "oe-border-primary", kind: "Token", value: "neutral-300", darkValue: "neutral-700", preview: <span className="block h-px w-20 bg-oe-border-primary" /> },
    { name: "oe-border-secondary", kind: "Token", value: "neutral-200", darkValue: "neutral-800", preview: <span className="block h-px w-20 bg-oe-border-secondary" /> },
    { name: "oe-border-disabled", kind: "Token", value: "neutral-100", darkValue: "neutral-900", preview: <span className="block h-px w-20 bg-oe-border-disabled" /> },
    { name: "oe-focus-ring", kind: "Token", value: "brand-600", darkValue: "brand-400", preview: <span className="block size-8 rounded-lg ring-2 ring-oe-focus-ring" /> },
    { name: "oe-interaction-hover", kind: "Token", value: "black / 5%", darkValue: "white / 8%", preview: <span className="oe-hover-layer block rounded-lg border border-oe-border-secondary px-3 py-2">Hover</span> },
  ]} /></FoundationSection><FoundationSection title="Shadow" description="현재 공용 semantic token은 없고 자산에서 사용하는 Tailwind shadow primitive입니다."><CatalogGrid>{[
    ["shadow-sm","Small surface","shadow-sm"],["shadow","Floating surface","shadow"],["shadow-lg","Popover layer","shadow-lg"],
  ].map(([name,label,className]) => <CatalogCard key={name} name={name} kind="Primitive" value={name}><div className={`rounded-xl border border-oe-border-secondary bg-oe-background-primary p-4 ${className}`}>{label}</div></CatalogCard>)}</CatalogGrid></FoundationSection></FoundationCatalog></FoundationPageShell>;
}
