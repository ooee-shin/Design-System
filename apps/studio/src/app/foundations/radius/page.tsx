import { CatalogGrid, CatalogCard, FoundationCatalog, FoundationSection } from "@/components/foundations/foundation-catalog";
import { FoundationPageShell } from "@/components/foundations/foundation-page-shell";

const radii = [["radius-sm","6px","rounded-sm"],["radius-md","8px","rounded-md"],["radius-lg","10px","rounded-lg"],["radius-xl","14px","rounded-xl"],["radius-2xl","18px","rounded-2xl"],["radius-3xl","22px","rounded-3xl"],["radius-4xl","26px","rounded-4xl"],["radius-full","9999px","rounded-full"]] as const;

export default function RadiusFoundationPage() {
  return <FoundationPageShell title="Radius" description="현재 Tailwind theme에 등록되어 실제 자산이 사용하는 radius primitive를 표시합니다."><FoundationCatalog><FoundationSection title="Radius primitive" description="기준 radius 10px에서 파생된 현재 값입니다."><CatalogGrid>{radii.map(([name,value,className]) => <CatalogCard key={name} name={name} kind="Primitive" value={value}><div className={`h-16 border border-oe-border-primary bg-oe-background-secondary ${className}`} /></CatalogCard>)}</CatalogGrid></FoundationSection></FoundationCatalog></FoundationPageShell>;
}
