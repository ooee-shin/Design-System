export type ComponentKey =
  | "switch"
  | "radio"
  | "checkbox"
  | "combobox"
  | "select"
  | "select-box"
  | "chip"
  | "input"
  | "input-button"
  | "number-input"
  | "textarea"
  | "message-bubble"
  | "badge";

export type ComponentRegistryItem = {
  key: ComponentKey;
  title: string;
  description: string;
  href: `/components/${string}`;
  updatedAt: string;
  similar?: ComponentKey[];
  worksWith?: Array<ComponentKey | "field">;
};

export const componentRegistry: ComponentRegistryItem[] = [
  { key: "switch", title: "Switch", description: "독립적인 설정이나 기능을 즉시 켜고 끄는 컴포넌트입니다. 24px Control이 기본값입니다.", href: "/components/switch", updatedAt: "2026.08.26", similar: ["checkbox"], worksWith: ["field"] },
  { key: "radio", title: "Radio", description: "목록이나 폼에서 여러 항목 중 하나를 선택합니다. Control은 16px 단일 크기이며 선택 상태는 Brand로 채운 원과 중앙의 흰 Indicator로 표시합니다.", href: "/components/radio", updatedAt: "2026.08.27", similar: ["checkbox"], worksWith: ["field"] },
  { key: "checkbox", title: "Checkbox", description: "목록이나 폼에서 항목의 선택 여부를 제어합니다. Control은 16px 단일 크기이며 20px Label 첫 줄 안에서 중앙 정렬됩니다. 선택 상태는 Brand 표현을 사용합니다.", href: "/components/checkbox", updatedAt: "2026.08.27", similar: ["radio"], worksWith: ["field", "combobox"] },
  { key: "combobox", title: "Combobox", description: "Popup 내부 검색으로 미리 정의된 옵션을 필터링하고 선택합니다.", href: "/components/combobox", updatedAt: "2026.08.26", worksWith: ["field", "input", "checkbox", "chip"] },
  { key: "select", title: "Select", description: "검색 없이 짧은 옵션 목록에서 하나 또는 여러 값을 선택하는 컴포넌트입니다. 선택값 전체를 펼쳐 편집해야 하면 Combobox를 사용합니다.", href: "/components/select", updatedAt: "2026.08.27", similar: ["combobox", "input-button", "select-box"], worksWith: ["field"] },
  { key: "select-box", title: "Select Box", description: "정의된 선택지를 화면에 펼쳐 놓고 상세 정보를 비교하며 하나 이상 선택하는 입력 컴포넌트입니다.", href: "/components/select-box", updatedAt: "2026.08.27", similar: ["select", "chip", "radio", "checkbox"], worksWith: ["field"] },
  { key: "chip", title: "Chip", description: "Label 또는 Icon과 닫기 action으로 제거 가능한 항목을 표시합니다.", href: "/components/chip", updatedAt: "2026.08.26", similar: ["select-box"], worksWith: ["combobox"] },
  { key: "input", title: "Input", description: "한 줄 텍스트를 입력하는 컴포넌트입니다. Label, 도움말과 오류 문구는 Input 내부가 아니라 별도 Field가 담당합니다.", href: "/components/input", updatedAt: "2026.08.26", similar: ["input-button", "textarea", "number-input"], worksWith: ["field"] },
  { key: "input-button", title: "Input Button", description: "직접 입력하는 대신 달력, 주소 검색, 시간 선택과 같은 후속 화면을 여는 버튼입니다. Input과 같은 외관을 사용하지만 실제 역할과 HTML 요소는 Button입니다.", href: "/components/input-button", updatedAt: "2026.08.26", similar: ["input", "combobox"], worksWith: ["field"] },
  { key: "number-input", title: "Number Input", description: "정확한 숫자를 직접 입력하거나 증감 버튼으로 조절하는 컴포넌트입니다. 범위와 증감 단위가 있는 수량, 순서와 비율 입력에 사용합니다.", href: "/components/number-input", updatedAt: "2026.08.26", similar: ["input", "textarea"], worksWith: ["field"] },
  { key: "textarea", title: "Textarea", description: "여러 줄 텍스트를 입력하는 컴포넌트입니다. Input과 같은 Style과 State를 사용하며 Leading과 Trailing element는 지원하지 않습니다.", href: "/components/textarea", updatedAt: "2026.08.26", similar: ["input", "number-input"], worksWith: ["field"] },
  { key: "message-bubble", title: "Message Bubble", description: "발신·수신, grouping, 전달 상태, 읽음 처리와 메시지 action을 검수합니다.", href: "/components/message-bubble", updatedAt: "2026.08.26", worksWith: ["badge"] },
  { key: "badge", title: "Badge", description: "Badge, Dot Badge와 Number Badge의 명세와 활용 사례를 확인합니다.", href: "/components/badge", updatedAt: "2026.08.26", worksWith: ["message-bubble"] },
];

export function getComponent(key: ComponentKey) {
  const component = componentRegistry.find((item) => item.key === key);
  if (!component) throw new Error(`Unknown component: ${key}`);
  return component;
}

export type RelatedComponentItem = { href: string; title: string; description: string };

export function getComponentRelations(key: ComponentKey) {
  const component = getComponent(key);
  const resolve = (relation: ComponentKey | "field"): RelatedComponentItem => {
    if (relation === "field") return { href: "/components/field", title: "Field", description: "Label, 도움말과 오류 문구를 Form control과 결합합니다. 현재 정의 준비 단계입니다." };
    const target = getComponent(relation);
    return { href: target.href, title: target.title, description: target.description };
  };

  return {
    similarItems: (component.similar ?? []).map(resolve),
    worksWithItems: (component.worksWith ?? []).map(resolve),
  };
}
