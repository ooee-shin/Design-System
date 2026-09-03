import { AssetGroupPage } from "@/components/asset-group-page";

export default function PatternsPage() {
  return <AssetGroupPage title="Patterns" description="여러 컴포넌트가 특정 제품 목적을 위해 결합된 화면 구조와 상호작용입니다." items={[{ title: "Inbox Split View", description: "대화 목록, 읽기 영역과 답장 composer가 결합된 responsive split view입니다.", href: "/experiments/inbox-split-view", maturity: "Experiment" }, { title: "Breadcrumb Page Header", description: "Breadcrumb, record metadata, actions와 section tab이 결합된 application header입니다.", href: "/experiments/breadcrumb-page-header", maturity: "Experiment" }, { title: "Collapsible Sidebar Nav", description: "그룹 메뉴, active state, 검색과 사용자 영역을 포함한 축소 가능한 application sidebar입니다.", href: "/experiments/collapsible-sidebar-nav", maturity: "Experiment" }]} />;
}
