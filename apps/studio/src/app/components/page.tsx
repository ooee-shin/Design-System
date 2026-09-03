import { AssetGroupPage } from "@/components/asset-group-page";
import { componentRegistry } from "@/components/component-registry";

export default function ComponentsPage() {
  return <AssetGroupPage title="Components" description="독립적인 의미와 상태를 갖고 다른 화면에서 재사용할 수 있는 UI 요소입니다." items={componentRegistry} density="compact" />;
}
