export type ComponentKey =
  | "admin-header"
  | "app-header"
  | "badge"
  | "bottom-navigation"
  | "button"
  | "checkbox"
  | "chip"
  | "combobox"
  | "field"
  | "input"
  | "input-button"
  | "message-attachment"
  | "message-bubble"
  | "message-composer"
  | "notification-badge"
  | "page-header"
  | "number-input"
  | "radio"
  | "select"
  | "select-box"
  | "side-navigation"
  | "switch"
  | "tabs"
  | "textarea"
  | "toggle-button";

/**
 * `확정`은 명세와 상세 화면을 갖추고 검수를 마친 컴포넌트, `초안`은 아직 그 단계에 이르지 않은 컴포넌트다.
 * 품질 등급이 아니라 작업 단계를 가리키며, 확정된 것도 이관 전까지 바뀔 수 있다.
 */
export type ComponentStatus = "확정" | "초안";

export type ComponentRegistryItem = {
  key: ComponentKey;
  title: string;
  description: string;
  status: ComponentStatus;
  /** `초안`은 상세 화면이 없으므로 갖지 않는다. */
  href?: `/components/${string}`;
  similar?: ComponentKey[];
  worksWith?: ComponentKey[];
};

export const componentRegistry: ComponentRegistryItem[] = [
  { key: "admin-header", title: "Admin Header", description: "관리자 웹의 맨 위 한 줄입니다. 왼쪽에 시스템 로고가 서고 오른쪽에 알림·설정·조직도·로그아웃과 로그인한 사람이 섭니다. 좌측 메뉴의 오른쪽에서 시작합니다.", status: "초안", similar: ["app-header"] },
  { key: "app-header", title: "App Header", description: "모바일 화면 최상단의 한 줄입니다. 자리는 컴포넌트가 고정하고 제목과 좌우 아이콘은 화면이 채웁니다.", status: "확정", href: "/components/app-header" },
  { key: "badge", title: "Badge", description: "다른 요소에 덧붙어 상태나 개수를 표시합니다. 누르는 동작이 없어 Hover와 Pressed 표시를 갖지 않습니다.", status: "확정", href: "/components/badge", similar: ["chip", "notification-badge"] },
  { key: "bottom-navigation", title: "Bottom Navigation", description: "모바일 화면 맨 아래에서 지금 어느 화면에 있는지 알리고 다른 화면으로 옮기는 한 줄입니다. 항목은 다섯까지입니다.", status: "확정", href: "/components/bottom-navigation" },
  { key: "button", title: "Button", description: "액션을 실행하는 버튼입니다. 폼 요소와 같은 공통 Control Height를 사용하며 Style·Tone·Size와 아이콘 자리를 조합해 씁니다.", status: "확정", href: "/components/button", similar: ["input-button", "chip", "toggle-button"] },
  { key: "checkbox", title: "Checkbox", description: "목록이나 폼에서 항목의 선택 여부를 제어합니다. Control은 16px 단일 크기이며 20px Label 첫 줄 안에서 중앙 정렬됩니다. 선택 상태는 Brand 표현을 사용합니다.", status: "확정", href: "/components/checkbox", similar: ["radio"], worksWith: ["field", "combobox"] },
  { key: "chip", title: "Chip", description: "짧은 Label로 값 하나를 표시하고, 쓰임에 따라 전체를 눌러 상태를 바꾸거나 개별로 지웁니다.", status: "확정", href: "/components/chip", similar: ["select-box", "toggle-button"], worksWith: ["combobox"] },
  { key: "combobox", title: "Combobox", description: "Popup 내부 검색으로 미리 정의된 옵션을 필터링하고 선택합니다.", status: "확정", href: "/components/combobox", worksWith: ["field", "input", "checkbox", "chip"] },
  { key: "field", title: "Field", description: "Label과 필수 표시, 도움말과 오류 문구를 Form control 하나와 묶는 폼 한 칸입니다. Control이 들어가는 Input slot은 Swap 영역이며 접근성 연결은 Field가 소유합니다.", status: "확정", href: "/components/field", worksWith: ["input", "textarea", "number-input", "input-button", "select", "combobox", "select-box", "checkbox", "radio", "switch"] },
  { key: "input", title: "Input", description: "한 줄 텍스트를 입력하는 컴포넌트입니다. Label, 도움말과 오류 문구는 Input 내부가 아니라 별도 Field가 담당합니다.", status: "확정", href: "/components/input", similar: ["input-button", "textarea", "number-input"], worksWith: ["field"] },
  { key: "input-button", title: "Input Button", description: "직접 입력하는 대신 달력, 주소 검색, 시간 선택과 같은 후속 화면을 여는 버튼입니다. Input과 같은 외관을 사용하지만 실제 역할과 HTML 요소는 Button입니다.", status: "확정", href: "/components/input-button", similar: ["input", "combobox"], worksWith: ["field"] },
  { key: "message-attachment", title: "Message File Attachment", description: "메시지에 붙는 파일 카드입니다. Inbox 화면에서 뽑아 두었고 명세와 상세 화면은 아직 없습니다.", status: "초안" },
  { key: "message-bubble", title: "Message Bubble", description: "발신·수신, grouping, 전달 상태, 읽음 처리와 메시지 action을 검수합니다.", status: "확정", href: "/components/message-bubble" },
  { key: "message-composer", title: "Message Composer", description: "메시지를 입력하고 보내는 아래쪽 한 줄입니다. Inbox 화면에서 뽑아 두었고 명세와 상세 화면은 아직 없습니다.", status: "초안" },
  { key: "page-header", title: "Page Header", description: "본문의 맨 위 한 줄입니다. 지금 보고 있는 화면의 경로와 이름을 말하고, 탭과 동작 버튼의 자리를 갖습니다. 상세 화면이 제목 아래 함께 보여 주는 소유자와 생성일 같은 값은 갖지 않습니다.", status: "초안" },
  { key: "notification-badge", title: "Notification Badge", description: "아이콘·버튼·메뉴에 붙어 새로운 알림이나 읽지 않은 메시지 수를 나타냅니다. 점과 개수 두 형태가 있습니다.", status: "확정", href: "/components/notification-badge", similar: ["badge"] },
  { key: "number-input", title: "Number Input", description: "정확한 숫자를 직접 입력하거나 증감 버튼으로 조절하는 컴포넌트입니다. 범위와 증감 단위가 있는 수량, 순서와 비율 입력에 사용합니다.", status: "확정", href: "/components/number-input", similar: ["input", "textarea"], worksWith: ["field"] },
  { key: "radio", title: "Radio", description: "목록이나 폼에서 여러 항목 중 하나를 선택합니다. Control은 16px 단일 크기이며 선택 상태는 Brand로 채운 원과 중앙의 흰 Indicator로 표시합니다.", status: "확정", href: "/components/radio", similar: ["checkbox"], worksWith: ["field"] },
  { key: "select", title: "Select", description: "검색 없이 짧은 옵션 목록에서 하나 또는 여러 값을 선택하는 컴포넌트입니다. 선택값 전체를 펼쳐 편집해야 하면 Combobox를 사용합니다.", status: "확정", href: "/components/select", similar: ["combobox", "input-button", "select-box"], worksWith: ["field"] },
  { key: "select-box", title: "Select Box", description: "정의된 선택지를 화면에 펼쳐 놓고 상세 정보를 비교하며 하나 이상 선택하는 입력 컴포넌트입니다.", status: "확정", href: "/components/select-box", similar: ["select", "chip", "radio", "checkbox"], worksWith: ["field"] },
  { key: "side-navigation", title: "Side Navigation", description: "관리자 웹 왼쪽에서 화면 높이를 채우는 메뉴입니다. 검색과 즐겨찾기, 3단계 메뉴를 갖고 접을 수 있습니다. 메뉴의 내용은 쓰는 쪽에서 받습니다.", status: "초안", similar: ["bottom-navigation"], worksWith: ["input"] },
  { key: "switch", title: "Switch", description: "독립적인 설정이나 기능을 즉시 켜고 끄는 컴포넌트입니다. 24px Control이 기본값입니다.", status: "확정", href: "/components/switch", similar: ["checkbox"], worksWith: ["field"] },
  { key: "tabs", title: "Tabs", description: "한 자리에서 내용을 갈아 끼우는 탭입니다. 고른 탭 아래 밑줄이 서고 다른 탭을 고르면 그 자리로 미끄러집니다. 탭 줄 아래 선은 탭을 놓는 자리가 긋습니다.", status: "초안", similar: ["chip"] },
  { key: "textarea", title: "Textarea", description: "여러 줄 텍스트를 입력하는 컴포넌트입니다. Input과 같은 Style과 State를 사용하며 Leading과 Trailing element는 지원하지 않습니다.", status: "확정", href: "/components/textarea", similar: ["input", "number-input"], worksWith: ["field"] },
  { key: "toggle-button", title: "Toggle Button", description: "즐겨찾기나 찜처럼 누른 표시가 화면에 남는 아이콘 버튼입니다. Ghost는 켜지면 아이콘이 Fill로 바뀌고, Tonal은 아이콘을 그대로 둔 채 배경이 생깁니다.", status: "확정", href: "/components/toggle-button", similar: ["button", "chip", "switch"] },
];

export function getComponent(key: ComponentKey) {
  const component = componentRegistry.find((item) => item.key === key);
  if (!component) throw new Error(`Unknown component: ${key}`);
  return component;
}

export type RelatedComponentItem = { href: string; title: string; description: string };

export function getComponentRelations(key: ComponentKey) {
  const component = getComponent(key);
  const resolve = (relation: ComponentKey): RelatedComponentItem => {
    const target = getComponent(relation);
    if (!target.href) throw new Error(`Cannot link to the draft component: ${relation}`);
    return { href: target.href, title: target.title, description: target.description };
  };

  return {
    similarItems: (component.similar ?? []).map(resolve),
    worksWithItems: (component.worksWith ?? []).map(resolve),
  };
}
