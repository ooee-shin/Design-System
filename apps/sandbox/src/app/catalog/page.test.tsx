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
import StoSupportRequestPage from "../sto-support-request/page";
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
    if (slot === "button" && attr("data-variant")) {
      const state = el.hasAttribute("disabled") || attr("data-disabled") === "true" ? "disabled" : "기본";
      names.add(`Button/variant=${attr("data-variant")}, tone=${attr("data-tone") || "brand"}, controlSize=${attr("data-size") || "regular"}, state=${state}`);
    }
    if (slot === "input-container" && attr("data-variant")) {
      const input = el.querySelector<HTMLInputElement | HTMLTextAreaElement>("input, textarea");
      const state = input && input.disabled ? "disabled" : input && input.value ? "값 있음" : "비어 있음";
      names.add(`Input/variant=${attr("data-variant")}, controlSize=${attr("data-size") || "regular"}, state=${state}`);
    }
    if (slot === "checkbox") {
      const checked = attr("data-checked");
      const state = attr("data-disabled") === "true" ? "disabled" : checked === "true" ? "on" : checked === "indeterminate" ? "indeterminate" : "off";
      names.add(`Checkbox/shape=${attr("data-shape") || "rounded"}, state=${state}`);
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
  ] as const) {
    const view = render(<Screen />);
    for (const name of instanceNames(view.container)) {
      if (!catalog.has(name)) missing.push(`${label}: ${name}`);
    }
    cleanup();
  }

  assert.deepEqual(missing, [], `카탈로그에 없는 이름이다. 카탈로그에 그 변형을 더한다:\n${missing.join("\n")}`);
});
