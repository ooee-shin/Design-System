import { AssetGroupPage } from "@/components/asset-group-page";

export default function PatternsPage() {
  return <AssetGroupPage title="Examples" description="외부 화면을 공용 부품으로 다시 만든 사례입니다. 부품이 실제 화면에서 어떻게 조합되는지 보여주며, 시스템이 확정한 Pattern은 아닙니다." items={[{ title: "Inbox Split View", description: "대화 목록, 읽기 영역과 답장 composer가 결합된 responsive split view입니다.", href: "/examples/inbox-split-view" }, { title: "Breadcrumb Page Header", description: "Breadcrumb, record metadata, actions와 section tab이 결합된 application header입니다.", href: "/examples/breadcrumb-page-header" }, { title: "Collapsible Sidebar Nav", description: "그룹 메뉴, active state, 검색과 사용자 영역을 포함한 축소 가능한 application sidebar입니다.", href: "/examples/collapsible-sidebar-nav" }]} />;
}
