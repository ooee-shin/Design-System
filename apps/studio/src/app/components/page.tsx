import { AssetGroupPage } from "@/components/asset-group-page";

export default function ComponentsPage() {
  return <AssetGroupPage title="Components" description="독립적인 의미와 상태를 갖고 다른 화면에서 재사용할 수 있는 UI 요소입니다." items={[{ title: "Input", description: "한 줄 입력의 구조, Style, 공통 Control Size, State와 선택 요소를 검수합니다.", href: "/components/input", maturity: "Candidate" }, { title: "Textarea", description: "여러 줄 입력의 기본 구조와 현재 구현된 상태를 검수합니다.", href: "/components/textarea", maturity: "Candidate" }, { title: "Message Bubble", description: "발신·수신, grouping, 전달 상태, 읽음 처리와 메시지 action을 검수합니다.", href: "/components/message-bubble", maturity: "Candidate" }, { title: "Badge", description: "Badge, Dot Badge와 Number Badge의 명세와 활용 사례를 확인합니다.", href: "/components/badge", maturity: "Candidate" }]} />;
}
