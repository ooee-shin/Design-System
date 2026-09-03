import { CatalogTable, FoundationCatalog, FoundationSection } from "@/components/foundations/foundation-catalog";
import { FoundationPageShell } from "@/components/foundations/foundation-page-shell";

export default function TypographyFoundationPage() {
  return <FoundationPageShell title="Typography" description="현재 등록된 font family token과 실제 사용 중인 type primitive를 표시합니다."><FoundationCatalog><FoundationSection title="Font family" description="언어별 공용 font token입니다."><CatalogTable rows={[
    { name: "oe-font-family-ko", kind: "Token", value: "Pretendard Variable", preview: <span style={{ fontFamily: "var(--oe-font-family-ko)" }}>한글 디자인 자산</span> },
    { name: "oe-font-family-en", kind: "Token", value: "Inter Variable", preview: <span style={{ fontFamily: "var(--oe-font-family-en)" }}>English design asset</span> },
    { name: "oe-font-family-ja", kind: "Token", value: "Noto Sans JP Variable", preview: <span style={{ fontFamily: "var(--oe-font-family-ja)" }}>日本語デザイン資産</span> },
  ]} /></FoundationSection><FoundationSection title="Type scale" description="oe-label은 공용 token이며 나머지는 현재 자산에서 사용하는 Tailwind primitive입니다."><CatalogTable rows={[
    { name: "text-oe-label", kind: "Token", value: "13px / 16px", preview: <span className="text-oe-label">Label text</span> },
    { name: "text-xs", kind: "Primitive", value: "12px / 16px", preview: <span className="text-xs">Extra small</span> },
    { name: "text-sm", kind: "Primitive", value: "14px / 20px", preview: <span className="text-sm">Body small</span> },
    { name: "text-base", kind: "Primitive", value: "16px / 24px", preview: <span className="text-base">Body base</span> },
    { name: "text-lg", kind: "Primitive", value: "18px / 28px", preview: <span className="text-lg">Large text</span> },
    { name: "text-xl", kind: "Primitive", value: "20px / 28px", preview: <span className="text-xl">Heading small</span> },
    { name: "text-2xl", kind: "Primitive", value: "24px / 32px", preview: <span className="text-2xl">Heading</span> },
    { name: "text-[11px]", kind: "Current value", value: "11px / inherited", preview: <span className="text-[11px]">Compact metadata</span> },
    { name: "text-[10px]", kind: "Current value", value: "10px / inherited", preview: <span className="text-[10px]">Count metadata</span> },
  ]} /></FoundationSection><FoundationSection title="Weight" description="현재 자산에서 실제 사용하는 font weight primitive입니다."><CatalogTable rows={[
    { name: "font-normal", kind: "Primitive", value: "400", preview: <span className="font-normal">Normal</span> },
    { name: "font-medium", kind: "Primitive", value: "500", preview: <span className="font-medium">Medium</span> },
    { name: "font-semibold", kind: "Primitive", value: "600", preview: <span className="font-semibold">Semibold</span> },
    { name: "font-bold", kind: "Primitive", value: "700", preview: <span className="font-bold">Bold</span> },
  ]} /></FoundationSection></FoundationCatalog></FoundationPageShell>;
}
