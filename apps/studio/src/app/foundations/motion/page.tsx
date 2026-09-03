import { CatalogGrid, CatalogCard, FoundationCatalog, FoundationSection } from "@/components/foundations/foundation-catalog";
import { FoundationPageShell } from "@/components/foundations/foundation-page-shell";

export default function MotionFoundationPage() {
  return <FoundationPageShell title="Motion" description="현재 자산에 존재하는 duration과 transition 값을 표시합니다. 아직 공용 oe motion token은 없습니다."><FoundationCatalog><FoundationSection title="Duration" description="현재 tooltip·popover와 navigation에서 직접 사용하는 값입니다."><CatalogGrid><CatalogCard name="duration-100" kind="Current value" value="100ms"><MotionBar className="duration-100" /></CatalogCard><CatalogCard name="duration-200" kind="Current value" value="200ms"><MotionBar className="duration-200" /></CatalogCard><CatalogCard name="transition default" kind="Primitive" value="150ms"><MotionBar /></CatalogCard></CatalogGrid></FoundationSection><FoundationSection title="Transition property" description="현재 실제 자산에서 사용하는 Tailwind transition primitive입니다."><CatalogGrid>{["transition-colors","transition-opacity","transition-transform","transition-shadow","transition-[width]","transition-[transform,opacity]"].map((name) => <CatalogCard key={name} name={name} kind="Primitive" value={name}><span className="text-xs text-oe-foreground-secondary">{name.replace("transition-", "")}</span></CatalogCard>)}</CatalogGrid></FoundationSection></FoundationCatalog></FoundationPageShell>;
}

function MotionBar({ className = "" }: { className?: string }) {
  return <div className="group rounded-lg bg-oe-background-secondary p-2"><div className={`size-6 rounded-md bg-oe-background-bold-primary transition-transform group-hover:translate-x-20 ${className}`} /></div>;
}
