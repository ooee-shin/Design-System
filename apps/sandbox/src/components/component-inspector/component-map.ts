/**
 * 화면의 DOM 에서 `@ooee/ui` 컴포넌트를 찾는다. 「이 화면이 디자인 시스템의 무엇으로 서 있는가」를 sandbox 가
 * 보여 주는 근거다(2026-09-22 개발자 — 디자인 시스템 › 요청 › sandbox).
 *
 * 컴포넌트는 가장 바깥 요소에 `data-slot` 으로 제 이름을 남긴다. 안쪽 조각(`button-label`, `field-label` …)은
 * 세지 않고 뿌리만 센다. 이름이 코드 문자열 그대로라 Studio 문서 주소(`/components/<key>`)로 바로 이어진다.
 *
 * `buttonVariants` 로 칠한 `<a>` 처럼 겉만 컴포넌트를 닮은 자리는 표식이 없어 잡히지 않는다. 그래서
 * generate-code 는 버튼 모양 링크를 `<Button render={<a/>}>` 로 쓴다.
 */

export const STUDIO_ORIGIN = "https://ooee-studio.pages.dev";

export type FoundComponent = { name: string; key: string };

/** 뿌리 `data-slot` → 컴포넌트. key 는 Studio 문서 주소의 마지막 조각이다. */
const ROOTS: Record<string, FoundComponent> = {
  button: { name: "Button", key: "button" },
  badge: { name: "Badge", key: "badge" },
  "notification-badge": { name: "NotificationBadge", key: "notification-badge" },
  "select-trigger": { name: "Select", key: "select" },
  "combobox-trigger": { name: "Combobox", key: "combobox" },
  "checkbox-field": { name: "CheckboxField", key: "checkbox" },
  checkbox: { name: "Checkbox", key: "checkbox" },
  "radio-field": { name: "RadioField", key: "radio" },
  radio: { name: "Radio", key: "radio" },
  "switch-field": { name: "SwitchField", key: "switch" },
  switch: { name: "Switch", key: "switch" },
  chip: { name: "Chip", key: "chip" },
  field: { name: "Field", key: "field" },
  "input-button": { name: "InputButton", key: "input-button" },
  "textarea-container": { name: "Textarea", key: "textarea" },
  "select-box": { name: "SelectBox", key: "select-box" },
  "toggle-button": { name: "ToggleButton", key: "toggle-button" },
  "app-header": { name: "AppHeader", key: "app-header" },
  "bottom-navigation": { name: "BottomNavigation", key: "bottom-navigation" },
  calendar: { name: "Calendar", key: "calendar" },
};

/** 다른 컴포넌트의 한 조각으로 들어간 경우. `CheckboxField` 안의 `Checkbox` 는 따로 세지 않는다. */
const PART_OF: Record<string, string> = {
  checkbox: "checkbox-field",
  radio: "radio-field",
  switch: "switch-field",
};

/** 요소 하나가 컴포넌트의 뿌리면 그 컴포넌트를, 아니면 null 을 돌려준다. */
export function identify(el: Element): FoundComponent | null {
  const slot = el.getAttribute("data-slot");
  if (!slot) return null;
  // Input 과 NumberInput 은 같은 컨테이너를 쓴다. NumberInput 은 안쪽 input 에 data-controls 를 남긴다.
  if (slot === "input-container") {
    return el.querySelector("input[data-controls]") ? { name: "NumberInput", key: "number-input" } : { name: "Input", key: "input" };
  }
  const found = ROOTS[slot];
  if (!found) return null;
  const whole = PART_OF[slot];
  if (whole && el.closest(`[data-slot="${whole}"]`)) return null;
  return found;
}

export type Placed = FoundComponent & { el: Element };

/** 화면 안의 컴포넌트를 문서 순서대로 모은다. */
export function collectComponents(root: ParentNode): Placed[] {
  return [...root.querySelectorAll("[data-slot]")].flatMap((el) => {
    const found = identify(el);
    return found ? [{ ...found, el }] : [];
  });
}

export type Tally = FoundComponent & { count: number };

/** 컴포넌트마다 몇 번 쓰였는지. 많이 쓴 것부터, 같으면 이름 순이다. */
export function tally(placed: Pick<Placed, "name" | "key">[]): Tally[] {
  const byName = new Map<string, Tally>();
  for (const { name, key } of placed) {
    const row = byName.get(name) ?? { name, key, count: 0 };
    row.count += 1;
    byName.set(name, row);
  }
  return [...byName.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export const studioDocUrl = (key: string) => `${STUDIO_ORIGIN}/components/${key}`;

/** Studio 에 문서가 있는 key. `apps/studio/src/app/components/<key>` 와 같아야 한다(component-map.test 가 본다). */
export const STUDIO_DOC_KEYS: readonly string[] = [
  "app-header", "badge", "bottom-navigation", "button", "calendar", "checkbox", "chip", "combobox", "field", "input",
  "input-button", "message-bubble", "notification-badge", "number-input", "radio", "select", "select-box", "switch",
  "textarea", "toggle-button",
];

/** 이름만으로는 문서를 못 찾는 짝. 본 컴포넌트의 문서에서 함께 다룬다. */
const DOC_OF: Record<string, string> = {
  TypingIndicator: "message-bubble",
  CalendarDayButton: "calendar",
  CheckboxIndicator: "checkbox",
};

/**
 * 코드에 적힌 컴포넌트 이름 → Studio 문서 key. `CheckboxField`·`RadioGroup` 처럼 한 문서가 다루는 짝과
 * `MultiSelect` 같은 다중 선택형은 본 컴포넌트의 문서로 간다. 문서가 없는 컴포넌트는 null 이다.
 */
export function docKeyOf(name: string): string | null {
  const kebab = name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
  const key = DOC_OF[name] ?? kebab.replace(/^multi-/, "").replace(/-(field|group)$/, "");
  return STUDIO_DOC_KEYS.includes(key) ? key : null;
}
