import { AssetGroupPage } from "@/components/asset-group-page";

export default function FoundationsPage() {
  return <AssetGroupPage title="Foundations" description="현재 보유한 공용 token, primitive와 기반 자산을 카탈로그로 확인합니다." items={[
    { title: "Color", description: "Neutral, Brand, Accent와 Status semantic token을 표시합니다.", href: "/foundations/color", status: "Provisional" },
    { title: "Typography", description: "언어별 font family token과 현재 type scale을 표시합니다.", href: "/foundations/typography", status: "Provisional" },
    { title: "Icon", description: "공급원과 현재 등록된 Remix Icon 자산을 표시합니다.", href: "/foundations/icon", status: "Provisional" },
    { title: "Spacing", description: "실제 사용 중인 spacing primitive와 예외값을 표시합니다.", href: "/foundations/spacing", status: "Provisional" },
    { title: "Radius", description: "현재 theme의 radius primitive와 실제 값을 표시합니다.", href: "/foundations/radius", status: "Provisional" },
    { title: "Effects", description: "Border, focus, hover token과 shadow primitive를 표시합니다.", href: "/foundations/effects", status: "Provisional" },
    { title: "Motion", description: "현재 duration과 transition primitive를 표시합니다.", href: "/foundations/motion", status: "Provisional" },
  ]} />;
}
