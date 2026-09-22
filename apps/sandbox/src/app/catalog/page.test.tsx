/**
 * 카탈로그가 Figma 컴포넌트로 옮겨질 때 지켜야 하는 것을 브라우저 없이 확인한다.
 *
 * 여기서 막지 않으면 Figma 에 올라간 뒤에야 드러난다.
 * - 변형 이름이 겹치면 같은 이름의 컴포넌트가 둘 생기고 인스턴스가 어느 쪽에 붙을지 알 수 없다.
 * - 카탈로그와 게시된 라이브러리(`scripts/figma/library.json`)의 이름이 다르면, 화면이 쓰는 변형이 라이브러리에 없어
 *   `/design-page` 가 멈추거나(없는 이름) 라이브러리가 코드에 없는 변형을 들고 있다.
 * - 화면이 쓰는 인스턴스 이름이 라이브러리에 없으면 `prepare.mjs` 가 exit 3 으로 멈춘다.
 *
 * 인스턴스 이름을 만드는 규칙은 `scripts/figma/instance-rules.mjs` 한 벌이다. 예전에는 여기에 손으로 베낀 사본이
 * 있었고, 그 사본에서 Button 규칙이 빠진 채 갈라져 있었다(2026-09-22). 이제 같은 함수를 불러 쓴다.
 */
import "@/test-setup";

import assert from "node:assert/strict";
import test, { afterEach } from "node:test";

import React from "react";
import { cleanup, render } from "@testing-library/react";

import { libraryRule as rawLibraryRule } from "../../../../../scripts/figma/instance-rules.mjs";
import { findVariant, readLibrary, variantNames } from "../../../../../scripts/figma/library.mjs";
import { sandboxScreens } from "@/screens";

import CatalogPage from "./page";

afterEach(() => {
  cleanup();
});

const library = readLibrary();

/** instance-rules.mjs 는 타입이 없는 JS 다. 돌려주는 세 모양(이름·까닭·없음)을 한 타입으로 읽는다. */
type LibraryRule = { inst?: string; set?: string; why?: string } | null;
const libraryRule = (el: Element): LibraryRule => rawLibraryRule(el);

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

test("카탈로그의 변형 이름이 게시된 라이브러리(library.json)와 같다", () => {
  const view = render(<CatalogPage />);
  const catalog = new Set([...view.container.querySelectorAll<HTMLElement>("[data-component]")].map((el) => `${el.dataset.component}/${el.dataset.variantProps}`));
  const published = new Set(variantNames(library));
  const notPublished = [...catalog].filter((name) => !published.has(name));
  const notInCatalog = [...published].filter((name) => !catalog.has(name));
  assert.deepEqual(
    { notPublished, notInCatalog },
    { notPublished: [], notInCatalog: [] },
    "카탈로그와 라이브러리가 다르다. 카탈로그를 라이브러리 파일에 다시 올려 Publish 하고, scripts/figma/README.md 「라이브러리 키 표」대로 library.json 을 다시 뽑는다",
  );
});

/**
 * 컴포넌트가 DOM 에 아무 표식도 남기지 않아 규칙이 가를 수 없는 변형과, 규칙이 대신 내는 짝이다.
 * ghost Checkbox 는 disabled 를 Root 에 넘기지 않는다(checkbox.tsx). 그래서 카탈로그의 「ghost·disabled」와
 * 「ghost·off」는 DOM 이 글자까지 같고, 짝의 인스턴스로 놓아도 모양이 틀리지 않는다. 아래 시험이 그것까지 본다.
 */
const SAME_AS: Record<string, string> = {
  "Checkbox/shape=ghost, state=disabled": "Checkbox/shape=ghost, state=off",
  "CheckboxField/shape=ghost, state=disabled, description=없음": "CheckboxField/shape=ghost, state=off, description=없음",
  "CheckboxField/shape=ghost, state=disabled, description=있음": "CheckboxField/shape=ghost, state=off, description=있음",
};

test("규칙이 짝으로 돌리는 변형은 카탈로그 DOM 이 짝과 같다", () => {
  const view = render(<CatalogPage />);
  // 접근성 이름·id 는 항목마다 다르게 붙인 것이라 견주지 않는다.
  const bare = (name: string) => {
    const [component, props] = [name.slice(0, name.indexOf("/")), name.slice(name.indexOf("/") + 1)];
    const item = view.container.querySelector(`[data-component="${component}"][data-variant-props="${props}"]`);
    assert.ok(item, `카탈로그에 없다: ${name}`);
    return item.innerHTML.replace(/ (aria-label|aria-labelledby|aria-describedby|id|for)="[^"]*"/g, "");
  };
  for (const [name, twin] of Object.entries(SAME_AS)) assert.equal(bare(name), bare(twin), `${name} 이 ${twin} 과 다르게 그려진다. SAME_AS 에서 빼고 규칙이 가르게 한다`);
});

test("카탈로그 항목마다 인스턴스 규칙이 그 항목의 이름을 낸다", () => {
  // 화면에서 이름을 만드는 규칙(instance-rules.mjs)을 카탈로그의 실제 DOM 에 돌린다. 587 개가 모두 제 이름으로
  // 돌아와야 화면의 같은 컴포넌트도 같은 변형으로 찾아간다. 라이브러리에 세트는 있지만 인스턴스로 놓지 않는
  // 종류(Field·SelectBox·AppHeader·BottomNavigation·Calendar)는 이름 대신 그 세트의 까닭이 나와야 한다.
  const view = render(<CatalogPage />);
  const wrong: string[] = [];
  for (const item of view.container.querySelectorAll<HTMLElement>("[data-component]")) {
    const name = `${item.dataset.component}/${item.dataset.variantProps}`;
    const expected = SAME_AS[name] ?? name;
    const rule = [...item.querySelectorAll("*")].map((el) => libraryRule(el)).find(Boolean);
    const got = !rule ? "규칙 없음" : rule.inst ? rule.inst : `${rule.set} (${rule.why})`;
    if (rule && rule.inst ? rule.inst !== expected : !rule || rule.set !== item.dataset.component) wrong.push(`${name} → ${got}`);
  }
  assert.deepEqual(wrong, [], `규칙이 카탈로그와 다른 이름을 낸다:\n${wrong.slice(0, 30).join("\n")}`);
});

test("등록된 화면이 쓰는 인스턴스 이름이 라이브러리에 모두 있다", async () => {
  const missing: string[] = [];
  for (const screen of sandboxScreens) {
    const { default: Screen } = await import(`../${screen.key}/page`);
    const view = render(<Screen />);
    for (const el of view.container.querySelectorAll("*")) {
      const rule = libraryRule(el);
      if (rule && rule.inst && !findVariant(library, rule.inst)) missing.push(`${screen.name}: ${rule.inst}`);
    }
    cleanup();
  }
  assert.deepEqual(missing, [], `라이브러리에 없는 이름이다. 카탈로그에 그 변형을 더하고 라이브러리를 다시 올린다:\n${missing.join("\n")}`);
});
