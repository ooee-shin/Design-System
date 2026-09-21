/**
 * 카탈로그가 Figma 컴포넌트로 옮겨질 때 지켜야 하는 것을 브라우저 없이 확인한다.
 *
 * 둘 다 여기서 막지 않으면 Figma 에 올라간 뒤에야 드러난다.
 * - 변형 이름이 겹치면 같은 이름의 컴포넌트가 둘 생기고 인스턴스가 어느 쪽에 붙을지 알 수 없다.
 * - 화면이 쓰는 인스턴스 이름이 카탈로그에 없으면 `--instances` 로 돌린 build 단계가 멈춘다.
 */
import "@/test-setup";

import assert from "node:assert/strict";
import test, { afterEach } from "node:test";

import React from "react";
import { cleanup, render } from "@testing-library/react";

import AdminLoginPage from "../admin-login/page";
import AnnualLeavePage from "../annual-leave/page";
import AttendanceKioskPage from "../attendance-kiosk/page";
import AttendancePayrollPage from "../attendance-payroll/page";
import ExcelExportPage from "../excel-export/page";
import StoMyPage from "../sto-my-page/page";
import StoSupportRequestPage from "../sto-support-request/page";
import TaxInvoicePage from "../tax-invoice/page";
import VocPage from "../voc/page";
import CatalogPage from "./page";

afterEach(() => {
  cleanup();
});

/** 카탈로그가 Figma 에 만드는 컴포넌트 이름(`Button/fill·brand·regular` 꼴)을 모은다. */
function catalogNames(container: HTMLElement): Set<string> {
  const names = new Set<string>();
  for (const el of container.querySelectorAll<HTMLElement>("[data-component]")) {
    names.add(`${el.dataset.component}/${el.dataset.variantProps}`);
  }
  return names;
}

/**
 * `scripts/figma/dom-extract.js` 가 화면에서 인스턴스 이름을 만드는 규칙과 **같은 규칙**이다.
 * 그쪽을 고치면 여기도 고쳐야 한다. 두 자리가 갈라지면 화면이 없는 컴포넌트를 찾게 된다.
 */
function instanceNames(container: HTMLElement): Set<string> {
  const names = new Set<string>();
  for (const el of container.querySelectorAll<HTMLElement>("[data-slot]")) {
    const slot = el.dataset.slot;
    const attr = (name: string) => el.getAttribute(name);
    // 값을 담는 컨트롤의 상태다. 카탈로그의 FIELD_STATES 와 값이 글자까지 같아야 한다.
    const valueState = (el: Element, field: HTMLInputElement | HTMLTextAreaElement | null) =>
      el.hasAttribute("data-disabled") || (field && field.disabled) ? "disabled"
        : el.hasAttribute("data-invalid") || (field && field.getAttribute("aria-invalid") === "true") ? "invalid"
          : field && field.value ? "값 있음" : "비어 있음";
    // 켜고 끄는 컨트롤의 상태다. 카탈로그의 TOGGLE_STATES 와 같다.
    const onOffState = (el: Element) => {
      const on = el.hasAttribute("data-checked");
      return el.hasAttribute("data-disabled") ? (on ? "disabled-on" : "disabled-off") : on ? "on" : "off";
    };
    const size = () => attr("data-size") || "regular";

    // Input 과 NumberInput 은 컨테이너가 같다. 안쪽 input 의 data-controls 가 둘을 가른다.
    if (slot === "input-container" && attr("data-variant")) {
      const field = el.querySelector<HTMLInputElement | HTMLTextAreaElement>("input, textarea");
      const controls = field && field.getAttribute("data-controls");
      if (controls) names.add(`NumberInput/variant=${attr("data-variant")}, controlSize=${size()}, controls=${controls === "none" ? "없음" : controls}`);
      else names.add(`Input/variant=${attr("data-variant")}, controlSize=${size()}, state=${valueState(el, field)}`);
    }
    if (slot === "textarea-container" && attr("data-variant")) {
      names.add(`Textarea/variant=${attr("data-variant")}, state=${valueState(el, el.querySelector<HTMLTextAreaElement>("textarea"))}`);
    }
    if (slot === "input-button" && attr("data-variant")) {
      const state = el.hasAttribute("disabled") || el.hasAttribute("data-disabled") ? "disabled"
        : el.hasAttribute("data-invalid") ? "invalid"
          : attr("data-has-value") === "true" ? "값 있음" : "비어 있음";
      names.add(`InputButton/variant=${attr("data-variant")}, controlSize=${size()}, state=${state}`);
    }
    // Select·Combobox 는 고른 값이 없으면 data-placeholder 가 선다. Multi 는 data-selection-mode 로 갈린다.
    if ((slot === "select-trigger" || slot === "combobox-trigger") && attr("data-variant")) {
      const set = (attr("data-selection-mode") === "multiple" ? "Multi" : "") + (slot === "select-trigger" ? "Select" : "Combobox");
      const state = el.hasAttribute("data-disabled") ? "disabled"
        : el.hasAttribute("data-invalid") ? "invalid"
          : el.hasAttribute("data-placeholder") ? "비어 있음" : "값 있음";
      names.add(`${set}/variant=${attr("data-variant")}, controlSize=${size()}, state=${state}`);
    }
    if (slot === "checkbox" && el.hasAttribute("data-shape")) {
      const state = el.hasAttribute("data-disabled") ? "disabled"
        : el.hasAttribute("data-indeterminate") ? "indeterminate"
          : el.hasAttribute("data-checked") ? "on" : "off";
      names.add(`Checkbox/shape=${attr("data-shape")}, state=${state}`);
    }
    if (slot === "checkbox-field") {
      const box = el.querySelector("[data-slot=checkbox]");
      const state = !box ? "off"
        : box.hasAttribute("data-disabled") ? "disabled"
          : box.hasAttribute("data-indeterminate") ? "indeterminate"
            : box.hasAttribute("data-checked") ? "on" : "off";
      names.add(`CheckboxField/shape=${attr("data-shape")}, state=${state}, description=${attr("data-description")}`);
    }
    if (slot === "radio") names.add(`Radio/state=${onOffState(el)}`);
    if (slot === "radio-field") {
      const dot = el.querySelector("[data-slot=radio]");
      names.add(`RadioField/state=${dot ? onOffState(dot) : "off"}, description=${attr("data-description")}`);
    }
    if (slot === "switch" && attr("data-size")) names.add(`Switch/controlSize=${attr("data-size")}, state=${onOffState(el)}`);
    if (slot === "switch-field") {
      const sw = el.querySelector("[data-slot=switch]");
      names.add(`SwitchField/controlSize=${attr("data-size")}, state=${sw ? onOffState(sw) : "off"}, labelPosition=${attr("data-label-position")}`);
    }
    if (slot === "chip" && el.hasAttribute("data-shape")) {
      names.add(`Chip/shape=${attr("data-shape")}, controlSize=${size()}, state=${el.hasAttribute("data-active") ? "active" : "기본"}`);
    }
    if (slot === "badge" && attr("data-variant")) {
      names.add(`Badge/variant=${attr("data-variant")}, tone=${attr("data-tone") || "neutral"}, size=${attr("data-size") || "small"}`);
    }
    if (slot === "notification-badge") {
      names.add(`NotificationBadge/shape=${attr("data-shape")}, tone=${attr("data-tone")}, overflow=${attr("data-overflow")}`);
    }
    if (slot === "toggle-button" && attr("data-variant")) {
      const tone = attr("data-tone") === "custom" ? attr("data-color") : attr("data-tone");
      const count = el.querySelector("[data-slot=toggle-button-count]") ? "있음" : "없음";
      if (tone) names.add(`ToggleButton/variant=${attr("data-variant")}, tone=${tone}, controlSize=${size()}, state=${el.hasAttribute("data-pressed") ? "pressed" : "기본"}, count=${count}`);
    }
    if (slot === "select-box" && attr("data-trailing-element")) {
      const trailing = attr("data-trailing-element");
      names.add(`SelectBox/selectionMode=${trailing === "checkbox" ? "multiple" : "single"}, trailingElement=${trailing}`);
    }
    // Field 는 어느 자식이 섰는지로 갈린다. 오류·필수·도움말은 그 상태에서만 생기는 전용 표식이다.
    if (slot === "field") {
      const has = (name: string) => !!el.querySelector(`[data-slot="${name}"]`);
      const state = has("field-error-message") ? "error" : has("field-requirement") ? "required" : has("field-helper-text") ? "helper" : "기본";
      names.add(`Field/state=${state}`);
    }
    if (slot === "app-header" && attr("data-sides")) {
      // 카탈로그에 「오른쪽만」 변형이 없다. 없는 조합에 이름을 붙이면 build 가 멈추므로
      // 그 자리는 이름을 만들지 않고 프레임으로 둔다 — 틀린 이름보다 없는 편이 낫다.
      const sides = ({ none: "없음", leading: "왼쪽", both: "양옆" } as Record<string, string>)[attr("data-sides") ?? ""];
      if (sides) names.add(`AppHeader/titleAlign=${attr("data-title-align")}, sides=${sides}`);
    }
    if (slot === "bottom-navigation" && attr("data-variant")) {
      names.add(`BottomNavigation/variant=${attr("data-variant")}, labels=${attr("data-show-labels") === "true" ? "있음" : "없음"}`);
    }
  }
  return names;
}

test("카탈로그의 변형 이름이 겹치지 않는다", () => {
  const view = render(<CatalogPage />);
  const items = [...view.container.querySelectorAll<HTMLElement>("[data-component]")];
  const names = items.map((el) => `${el.dataset.component}/${el.dataset.variantProps}`);

  assert.equal(new Set(names).size, names.length, `겹치는 이름: ${names.filter((n, i) => names.indexOf(n) !== i).join(", ")}`);
});

test("각 컴포넌트의 변형이 축의 곱집합을 다 채운다", () => {
  const view = render(<CatalogPage />);

  // Figma 는 Variant 이름에 나타난 값을 축마다 모아 드롭다운을 만들고, 그 값들을 모두 곱해
  // 고를 수 있게 한다. 곱집합에 빠진 조합은 Figma 에서 골랐을 때 아무것도 나오지 않는 빈칸이 된다.
  const byComponent = new Map<string, Record<string, string>[]>();
  for (const el of view.container.querySelectorAll<HTMLElement>("[data-component]")) {
    const props: Record<string, string> = {};
    for (const pair of el.dataset.variantProps!.split(", ")) {
      const at = pair.indexOf("=");
      props[pair.slice(0, at)] = pair.slice(at + 1);
    }
    const list = byComponent.get(el.dataset.component!) ?? [];
    list.push(props);
    byComponent.set(el.dataset.component!, list);
  }

  // 컴포넌트가 타입으로 막아 만들 수 없는 조합은 카탈로그가 이유와 함께 선언해 둔다.
  const excused = new Map<string, Set<string>>();
  for (const section of view.container.querySelectorAll<HTMLElement>("[data-component-set]")) {
    excused.set(section.dataset.componentSet!, new Set(JSON.parse(section.dataset.impossible!) as string[]));
  }

  const holes: string[] = [];
  const stale: string[] = [];
  for (const [component, rows] of byComponent) {
    const axes = Object.keys(rows[0]);
    const values = axes.map((axis) => [...new Set(rows.map((row) => row[axis]))]);
    let combos: string[][] = [[]];
    for (const list of values) combos = combos.flatMap((prefix) => list.map((value) => [...prefix, value]));
    const have = new Set(rows.map((row) => axes.map((axis) => `${axis}=${row[axis]}`).join(", ")));
    const skip = excused.get(component) ?? new Set<string>();
    for (const combo of combos) {
      const name = axes.map((axis, i) => `${axis}=${combo[i]}`).join(", ");
      if (!have.has(name) && !skip.has(name)) holes.push(`${component}/${name}`);
    }
    // 만들 수 없다고 적어 둔 조합이 실제로 있으면 그 설명은 이제 틀린 것이다.
    for (const name of skip) if (have.has(name)) stale.push(`${component}/${name}`);
  }

  assert.deepEqual(holes, [], `축의 값은 나타나는데 그 조합이 없다. Figma 에서 고르면 빈칸이 된다:\n${holes.slice(0, 30).join("\n")}${holes.length > 30 ? `\n… 그리고 ${holes.length - 30}개 더` : ""}`);
  assert.deepEqual(stale, [], `만들 수 없다고 적어 둔 조합이 실제로는 있다. Group 의 impossible 에서 지운다:\n${stale.join("\n")}`);
});

test("카탈로그의 모든 항목이 컴포넌트 이름과 변형 이름을 갖는다", () => {
  const view = render(<CatalogPage />);

  for (const el of view.container.querySelectorAll<HTMLElement>("[data-component]")) {
    assert.ok(el.dataset.component, "data-component 가 비어 있다");
    assert.ok(el.dataset.variantProps, `${el.dataset.component} 의 data-variant-props 가 비어 있다`);
  }
});

test("화면이 쓰는 인스턴스 이름이 카탈로그에 모두 있다", () => {
  const catalog = catalogNames(render(<CatalogPage />).container);
  cleanup();

  const missing: string[] = [];
  for (const [label, Screen] of [
    ["관리자 로그인", AdminLoginPage],
    ["STO 지원요청", StoSupportRequestPage],
    ["고객의 소리", VocPage],
    ["출퇴근 키오스크", AttendanceKioskPage],
    ["근태·급여 정산", AttendancePayrollPage],
    ["STO 마이페이지", StoMyPage],
    ["연차 관리", AnnualLeavePage],
    ["세금계산서 발행", TaxInvoicePage],
    ["엑셀 내려받기", ExcelExportPage],
  ] as const) {
    const view = render(<Screen />);
    for (const name of instanceNames(view.container)) {
      if (!catalog.has(name)) missing.push(`${label}: ${name}`);
    }
    cleanup();
  }

  assert.deepEqual(missing, [], `카탈로그에 없는 이름이다. 카탈로그에 그 변형을 더한다:\n${missing.join("\n")}`);
});
