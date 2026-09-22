// 화면의 DOM 요소 하나가 ooee 라이브러리(`library.json`)의 어느 변형인지 정하는 규칙이다.
//
// 이 파일의 두 함수는 **세 자리에서 똑같이 돈다.**
// - 브라우저: prepare.mjs 가 함수 소스(`toString()`)를 dom-extract.js 의 `__LIBRARY_RULE__`·`__NATIVE_CHUNK__` 자리에 끼워 넣는다.
// - scripts/figma/library.test.mjs: JSDOM 으로 만든 DOM 조각에 부른다.
// - apps/sandbox/src/app/catalog/page.test.tsx: 카탈로그·화면을 실제로 그린 DOM 에 부른다.
// 그래서 **함수 밖의 이름을 하나도 쓰지 않는다.** 쓰면 브라우저에서 ReferenceError 로 죽는다.
// 예전에는 page.test.tsx 가 dom-extract.js 의 규칙을 손으로 베껴 두었는데, 베낀 쪽에서 Button 규칙이
// 빠진 채 갈라져 있었다(2026-09-22 조사). 이제 한 벌만 둔다.

/**
 * 돌려주는 것은 셋 가운데 하나다.
 * - `{ inst: "<세트>/<축=값, 축=값>" }` — 라이브러리의 그 변형으로 놓는다. 이름은 카탈로그의
 *   `data-component`/`data-variant-props` 와 글자까지 같아야 한다.
 * - `{ set, why }` — `@ooee/ui` 컴포넌트지만 라이브러리 인스턴스로 옮기면 모양이 틀린다. 프레임으로 그리고
 *   manifest 의 `unsupported` 에 까닭을 남긴다. 인스턴스에 넘길 수 있는 것은 글자뿐이라(칠·테두리·오토
 *   레이아웃은 컴포넌트 값) 글자 말고 다른 것이 달라지는 자리는 여기서 가른다.
 * - `null` — 라이브러리 컴포넌트의 뿌리가 아니다.
 *
 * Base UI 는 상태를 **빈 문자열**로 찍는다(`data-disabled=""`, `data-checked=""`). 값을 `"true"` 와 견주면
 * 언제나 거짓이므로 있고 없음만 본다. 일부 선택도 값이 아니라 `data-indeterminate` 라는 별도 속성이다.
 */
export function libraryRule(el) {
  const slot = el.getAttribute("data-slot");
  const attr = (name) => el.getAttribute(name);
  const inside = (selector) => el.querySelector(selector) !== null;
  const frame = (set, why) => ({ set, why });
  const size = () => attr("data-size") || "regular";

  if (!slot) {
    // `buttonVariants()` 로 칠한 링크는 Button 과 모양이 같지만 data-* 가 없어 변형을 정할 수 없다.
    const cls = typeof el.className === "string" ? el.className : el.getAttribute("class") || "";
    if (el.tagName.toLowerCase() === "a" && /(^|\s)group\/button(\s|$)/.test(cls)) {
      return frame("Button", "buttonVariants 로 칠한 링크라 변형을 읽을 data-* 가 없다. <Button render={<a href=… />} nativeButton={false} role=\"link\"> 로 쓰면 인스턴스가 된다");
    }
    return null;
  }

  // 값을 담는 컨트롤의 상태다. 카탈로그의 FIELD_STATES 와 값이 글자까지 같아야 한다.
  const valueState = (box, field) =>
    box.hasAttribute("data-disabled") || (field && field.disabled) ? "disabled"
      : box.hasAttribute("data-invalid") || (field && field.getAttribute("aria-invalid") === "true") ? "invalid"
        : field && field.value ? "값 있음" : "비어 있음";
  // 켜고 끄는 컨트롤의 상태다. 카탈로그의 TOGGLE_STATES 와 같다.
  const onOffState = (box) => {
    const on = box.hasAttribute("data-checked");
    return box.hasAttribute("data-disabled") ? (on ? "disabled-on" : "disabled-off") : on ? "on" : "off";
  };
  // ghost 모양은 Root 에 indeterminate·disabled 를 넘기지 않고(checkbox.tsx) 일부 선택을 안쪽 indicator 에만 찍는다.
  // 그래서 indicator 도 본다. ghost 의 disabled 는 DOM 에 아무 표식도 남기지 않아 off 와 모양까지 같다.
  const checkState = (box) => {
    if (!box) return "off";
    const mark = box.querySelector("[data-slot=checkbox-indicator]");
    const has = (name) => box.hasAttribute(name) || (mark !== null && mark.hasAttribute(name));
    return has("data-disabled") ? "disabled" : has("data-indeterminate") ? "indeterminate" : box.hasAttribute("data-checked") ? "on" : "off";
  };

  if (slot === "button" && attr("data-variant")) {
    if (attr("data-tone") === "custom") return frame("Button", "custom tone 은 색이 화면마다 달라 라이브러리 축에 없다");
    const state = el.hasAttribute("disabled") || el.hasAttribute("data-disabled") ? "disabled" : "기본";
    return { inst: `Button/variant=${attr("data-variant")}, tone=${attr("data-tone") || "brand"}, controlSize=${size()}, state=${state}` };
  }

  // Input 과 NumberInput 은 컨테이너가 같다. 안쪽 input 의 data-controls 가 둘을 가른다.
  if (slot === "input-container" && attr("data-variant")) {
    const field = el.querySelector("input, textarea");
    const controls = field && field.getAttribute("data-controls");
    if (controls) {
      // −·+ 버튼은 Input 의 leading·trailing 자리에 선다(split 이면 − 가 앞). 가를 것은 접두·접미뿐이다.
      if (inside("[data-slot=input-prefix], [data-slot=input-suffix]")) return frame("NumberInput", "접두·접미가 붙은 NumberInput 변형이 라이브러리에 없다");
      // 라이브러리 NumberInput 에는 상태 축이 없고 −·+ 버튼이 늘 켜진 모양이다. 최솟값·최댓값·disabled·readOnly
      // 에서 흐려진 버튼을 인스턴스로 옮기면 켜진 버튼으로 그려진다.
      const state = valueState(el, field);
      if (state === "disabled" || state === "invalid") return frame("NumberInput", "disabled·invalid 상태 축이 라이브러리 NumberInput 에 없다");
      if (inside("button[disabled]") || (field && field.readOnly)) return frame("NumberInput", "−·+ 버튼이 꺼진 모양(최솟값·최댓값·readOnly)이 라이브러리 NumberInput 에 없다");
      return { inst: `NumberInput/variant=${attr("data-variant")}, controlSize=${size()}, controls=${controls === "none" ? "없음" : controls}` };
    }
    // 접두·접미 글자는 글자 수만 보면 placeholder 자리에 잘못 들어간다. 아이콘도 라이브러리 Input 에는 없다.
    // 지우기 버튼(input-clear)은 초점이 있을 때만 보이므로 가르지 않는다.
    if (inside("[data-slot=input-leading], [data-slot=input-prefix], [data-slot=input-suffix], [data-slot=input-trailing]")) {
      return frame("Input", "앞뒤 요소(leadingElement·prefix·suffix·trailingElement)가 붙은 Input 변형이 라이브러리에 없다");
    }
    return { inst: `Input/variant=${attr("data-variant")}, controlSize=${size()}, state=${valueState(el, field)}` };
  }
  if (slot === "textarea-container" && attr("data-variant")) {
    return { inst: `Textarea/variant=${attr("data-variant")}, state=${valueState(el, el.querySelector("textarea"))}` };
  }
  if (slot === "input-button" && attr("data-variant")) {
    if (inside("[data-slot=input-button-leading], [data-slot=input-button-trailing]")) return frame("InputButton", "앞뒤 요소가 붙은 InputButton 변형이 라이브러리에 없다");
    // InputButton 은 invalid 를 data-* 가 아니라 aria-invalid 로만 남긴다(input-button.tsx).
    const state = el.hasAttribute("disabled") || el.hasAttribute("data-disabled") ? "disabled"
      : el.hasAttribute("data-invalid") || attr("aria-invalid") === "true" ? "invalid"
        : attr("data-has-value") === "true" ? "값 있음" : "비어 있음";
    return { inst: `InputButton/variant=${attr("data-variant")}, controlSize=${size()}, state=${state}` };
  }
  // Select·Combobox 는 고른 값이 없으면 data-placeholder 가 선다. Multi 는 data-selection-mode 로 갈린다.
  // 인스턴스는 트리거만이다. 목록 팝업과 둘러싼 Field 는 라이브러리 세트가 아니다.
  if ((slot === "select-trigger" || slot === "combobox-trigger") && attr("data-variant")) {
    const set = (attr("data-selection-mode") === "multiple" ? "Multi" : "") + (slot === "select-trigger" ? "Select" : "Combobox");
    const state = el.hasAttribute("data-disabled") ? "disabled"
      : el.hasAttribute("data-invalid") ? "invalid"
        : el.hasAttribute("data-placeholder") ? "비어 있음" : "값 있음";
    return { inst: `${set}/variant=${attr("data-variant")}, controlSize=${size()}, state=${state}` };
  }
  if (slot === "checkbox" && el.hasAttribute("data-shape")) {
    return { inst: `Checkbox/shape=${attr("data-shape")}, state=${checkState(el)}` };
  }
  if (slot === "checkbox-field") {
    if (inside("[data-slot=checkbox-leading], [data-slot=checkbox-trailing]")) return frame("CheckboxField", "앞뒤 요소가 붙은 CheckboxField 변형이 라이브러리에 없다");
    return { inst: `CheckboxField/shape=${attr("data-shape")}, state=${checkState(el.querySelector("[data-slot=checkbox]"))}, description=${attr("data-description")}` };
  }
  if (slot === "radio") return { inst: `Radio/state=${onOffState(el)}` };
  if (slot === "radio-field") {
    if (inside("[data-slot=radio-leading], [data-slot=radio-trailing]")) return frame("RadioField", "앞뒤 요소가 붙은 RadioField 변형이 라이브러리에 없다");
    const dot = el.querySelector("[data-slot=radio]");
    return { inst: `RadioField/state=${dot ? onOffState(dot) : "off"}, description=${attr("data-description")}` };
  }
  if (slot === "switch" && attr("data-size")) return { inst: `Switch/controlSize=${attr("data-size")}, state=${onOffState(el)}` };
  if (slot === "switch-field") {
    const sw = el.querySelector("[data-slot=switch]");
    return { inst: `SwitchField/controlSize=${attr("data-size")}, state=${sw ? onOffState(sw) : "off"}, labelPosition=${attr("data-label-position")}` };
  }
  if (slot === "chip" && el.hasAttribute("data-shape")) {
    if (inside("[data-slot=chip-leading-element], [data-slot=chip-prefix], [data-slot=chip-trailing-element], [data-slot=chip-remove]")) return frame("Chip", "앞뒤 요소·접두·지우기 버튼이 붙은 Chip 변형이 라이브러리에 없다");
    if (el.hasAttribute("data-disabled") || el.hasAttribute("disabled")) return frame("Chip", "disabled 축이 라이브러리 Chip 에 없다");
    return { inst: `Chip/shape=${attr("data-shape")}, controlSize=${size()}, state=${el.hasAttribute("data-active") ? "active" : "기본"}` };
  }
  if (slot === "badge" && attr("data-variant")) {
    if (attr("data-tone") === "custom") return frame("Badge", "custom tone 은 색이 화면마다 달라 라이브러리 축에 없다");
    return { inst: `Badge/variant=${attr("data-variant")}, tone=${attr("data-tone") || "neutral"}, size=${attr("data-size") || "small"}` };
  }
  if (slot === "notification-badge") {
    return { inst: `NotificationBadge/shape=${attr("data-shape")}, tone=${attr("data-tone")}, overflow=${attr("data-overflow")}` };
  }
  if (slot === "toggle-button" && attr("data-variant")) {
    // brand 는 tone 그대로, like·favorite 는 `tone="custom"` 의 색 이름이 카탈로그의 tone 값이다.
    const tone = attr("data-tone") === "custom" ? attr("data-color") : attr("data-tone");
    if (!tone) return frame("ToggleButton", "tone 을 읽을 수 없다");
    const count = inside("[data-slot=toggle-button-count]") ? "있음" : "없음";
    return { inst: `ToggleButton/variant=${attr("data-variant")}, tone=${tone}, controlSize=${size()}, state=${el.hasAttribute("data-pressed") ? "pressed" : "기본"}, count=${count}` };
  }
  // 아래 넷은 라이브러리에 세트가 있지만 DOM 만으로는 맞는 변형을 정할 수 없거나, 정해도 안쪽이 틀린다.
  if (slot === "field") return frame("Field", "라이브러리 Field 는 속 컨트롤이 Input(outline·regular)으로 굳어 있다. 라벨·도움말은 글자로, 속 컨트롤은 제 인스턴스로 그린다");
  if (slot === "select-box") return frame("SelectBox", "DOM 에 selectionMode 와 선택 상태가 없고, 라이브러리 네 변형이 모두 선택된 모양이다");
  if (slot === "app-header") return frame("AppHeader", "라이브러리 AppHeader 는 양옆 요소가 굳어 있다(왼쪽 ← 버튼, 오른쪽 배지). 머리글은 프레임, 속의 Button·Badge 는 제 인스턴스로 그린다");
  if (slot === "bottom-navigation") return frame("BottomNavigation", "라이브러리 BottomNavigation 은 항목 셋(홈·찾기·내 정보)으로 굳어 있고 항목 수·아이콘은 DOM 의 data-* 에 없다");
  if (slot === "calendar") return frame("Calendar", "달력은 보이는 달과 고른 날에 따라 안쪽이 달라 변형 이름으로 정해지지 않는다");
  return null;
}

/**
 * 라이브러리와 상관없는 **native 덩이**에 이름을 붙인다. manifest 의 `notInLibrary` 가 이것을 모아
 * 「라이브러리에 없어 프레임으로 둔 것」(머리글·상품 카드·페이지 이동 …)을 보고하게 한다.
 * `@ooee/ui` 컴포넌트 안쪽(`data-slot` 조상)은 컴포넌트의 몫이라 세지 않는다.
 * 감싸개(div·span)와 목록 틀(ul·li)은 세지 않는다. 덩이의 뜻을 갖는 태그·역할만 센다.
 */
export function nativeChunk(el, styled = false) {
  if (el.closest("[data-slot], [data-component]")) return null;
  const tag = el.tagName.toLowerCase();
  const role = el.getAttribute("role");
  const TAGS = ["header", "footer", "nav", "aside", "section", "article", "form", "table", "dl", "dialog", "a", "button"];
  const ROLES = ["navigation", "search", "dialog", "tablist", "tab", "menu", "menubar", "listbox", "table", "grid", "region", "banner", "contentinfo", "button", "link"];
  // 목록의 칸(li)은 제 칠·테두리가 있을 때만 덩이로 센다(주문 상품 줄처럼). 글자만 늘어놓은 칸은 목록 틀이다.
  // `styled` 는 dom-extract 가 계산된 칠·테두리로 정해 넘긴다.
  if (!TAGS.includes(tag) && !(role && ROLES.includes(role)) && !(tag === "li" && styled)) return null;
  // 이름은 태그와 aria-label, 없으면 aria-labelledby 가 가리키는 글자, 없으면 태그와 다른 role 이다.
  // 예: `nav 카테고리`, `aside 주문 요약`, `form search`, `header`.
  const labelledby = el.getAttribute("aria-labelledby");
  const labelEl = labelledby ? el.ownerDocument.getElementById(labelledby.split(" ")[0]) : null;
  const label = el.getAttribute("aria-label") || (labelEl ? labelEl.textContent.replace(/\s+/g, " ").trim() : "") || (role && role !== tag ? role : "");
  return label ? `${tag} ${label}` : tag;
}
