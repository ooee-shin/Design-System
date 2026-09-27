// 컴포넌트 이름 → Studio 문서 주소. 결과 댓글의 「쓴 컴포넌트」가 이 링크를 단다(`2026-09-27` 개발자: 「만들었던
// 페이지 링크 + 컴포넌트 링크도 같이 주는 걸로 하자」). 기획자가 결과에서 화면과 그 화면이 쓴 컴포넌트의
// 문서로 바로 갈 수 있게 한다.
//
// 원본은 sandbox 의 `component-inspector/component-map.ts` 다 — 「컴포넌트 보기」 막대가 같은 표로 같은 주소를
// 연다. 그 파일은 TypeScript 라 여기서 import 하지 못해 표를 옮겨 적었고, `studio-links.test.mjs` 가 두 표가
// 같은지 원문을 읽어 대조한다. 한쪽을 고치면 다른 쪽도 고친다.

export const STUDIO_ORIGIN = "https://ooee-studio.pages.dev";

/** Studio 에 문서가 있는 key. `apps/studio/src/app/components/<key>` 와 같다. */
export const STUDIO_DOC_KEYS = [
  "app-header", "badge", "bottom-navigation", "button", "calendar", "checkbox", "chip", "combobox", "field", "input",
  "input-button", "message-bubble", "notification-badge", "number-input", "radio", "select", "select-box", "switch",
  "textarea", "toggle-button",
];

/** 이름만으로는 문서를 못 찾는 짝. 본 컴포넌트의 문서에서 함께 다룬다. */
export const DOC_OF = {
  TypingIndicator: "message-bubble",
  CalendarDayButton: "calendar",
  CheckboxIndicator: "checkbox",
};

/** 코드에 적힌 컴포넌트 이름 → Studio 문서 key. `CheckboxField`·`RadioGroup`·`MultiSelect` 는 본 컴포넌트로 간다. 없으면 null. */
export function docKeyOf(name) {
  const kebab = String(name).replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
  const key = DOC_OF[name] ?? kebab.replace(/^multi-/, "").replace(/-(field|group)$/, "");
  return STUDIO_DOC_KEYS.includes(key) ? key : null;
}

export const studioDocUrl = (key) => `${STUDIO_ORIGIN}/components/${key}`;

/** markdown 링크. 문서가 없는 이름은 그대로 둔다 — 없는 주소를 걸면 기획자가 404 를 본다. */
export function componentLink(name) {
  const key = docKeyOf(name);
  return key ? `[${name}](${studioDocUrl(key)})` : String(name);
}
