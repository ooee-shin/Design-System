import { AssetGroupPage } from "@/components/asset-group-page";
import { componentRegistry } from "@/components/component-registry";

const groups = [
  { name: "확정", description: "명세와 상세 화면을 갖추고 검수를 마친 컴포넌트입니다. 이관 전까지 바뀔 수 있다는 점은 모든 컴포넌트가 같습니다." },
  { name: "초안", description: "아직 명세와 상세 화면이 없는 컴포넌트입니다. 화면에서 뽑아 두었거나 기본 구현에 oe 토큰만 입힌 단계이며, 다른 화면에서 쓰기 전에 검수를 거칩니다." },
];

export default function ComponentsPage() {
  const items = componentRegistry.map((item) => ({ title: item.title, description: item.description, href: item.href, group: item.status }));

  return <AssetGroupPage title="Components" description="독립적인 의미와 상태를 갖고 다른 화면에서 재사용할 수 있는 UI 요소입니다." items={items} density="compact" groups={groups} />;
}
