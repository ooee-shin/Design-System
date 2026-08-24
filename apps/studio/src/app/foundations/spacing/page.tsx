import { CatalogGrid, CatalogCard, FoundationCatalog, FoundationSection } from "@/components/foundations/foundation-catalog";
import { FoundationPageShell } from "@/components/foundations/foundation-page-shell";

const spacing = [["0.5","2px"],["1","4px"],["1.5","6px"],["2","8px"],["2.5","10px"],["3","12px"],["4","16px"],["5","20px"],["6","24px"],["7","28px"],["8","32px"],["11","44px"]] as const;

export default function SpacingFoundationPage() {
  return <FoundationPageShell title="Spacing" description="현재 공용 UI와 패턴에서 실제 사용하는 Tailwind spacing primitive와 예외값을 표시합니다."><FoundationCatalog><FoundationSection title="Spacing primitive" description="별도의 oe spacing scale을 복제하지 않으며 실제 사용 범위만 표시합니다."><CatalogGrid>{spacing.map(([name,value]) => <CatalogCard key={name} name={`spacing-${name}`} kind="Primitive" value={value}><div className="h-3 rounded bg-oe-background-bold-primary" style={{ width: value }} /></CatalogCard>)}</CatalogGrid></FoundationSection><FoundationSection title="Current exception" description="공용 spacing token이 아닌 컴포넌트 내부 현재값입니다."><CatalogGrid><CatalogCard name="message-bubble-inline" kind="Current value" value="14px"><div className="h-8 rounded-lg border border-dashed border-oe-border-primary px-[14px] text-xs leading-8">14px inset</div></CatalogCard></CatalogGrid></FoundationSection></FoundationCatalog></FoundationPageShell>;
}
