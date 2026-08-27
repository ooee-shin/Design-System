import assert from "node:assert/strict"
import test, { afterEach } from "node:test"

import { JSDOM } from "jsdom"
import React from "react"
import { cleanup, render, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost" })

Object.assign(globalThis, {
  window: dom.window, document: dom.window.document, HTMLElement: dom.window.HTMLElement,
  HTMLInputElement: dom.window.HTMLInputElement, Element: dom.window.Element, Node: dom.window.Node,
  Event: dom.window.Event, MouseEvent: dom.window.MouseEvent, KeyboardEvent: dom.window.KeyboardEvent,
  MutationObserver: dom.window.MutationObserver, getComputedStyle: dom.window.getComputedStyle,
  requestAnimationFrame: (callback: FrameRequestCallback) => setTimeout(() => callback(Date.now()), 0),
  cancelAnimationFrame: (id: ReturnType<typeof setTimeout>) => clearTimeout(id),
})
Object.defineProperty(globalThis, "navigator", { configurable: true, value: dom.window.navigator })
if (!("PointerEvent" in globalThis)) Object.assign(globalThis, { PointerEvent: dom.window.MouseEvent })
const { Checkbox, CheckboxField, CheckboxIndicator } = await import("./checkbox")
const { Radio, RadioField, RadioGroup } = await import("./radio")
afterEach(() => cleanup())

test("CheckboxField toggles from its label and Disabled preserves Checked", async () => {
  const user = userEvent.setup({ document: dom.window.document })
  const view = render(<><CheckboxField label="Option" /><CheckboxField label="Disabled option" defaultChecked disabled /></>)
  const option = view.getByRole("checkbox", { name: "Option" })
  const disabled = view.getByRole("checkbox", { name: "Disabled option" })

  await user.click(view.getByText("Option"))
  assert.equal(option.getAttribute("aria-checked"), "true")
  await user.click(disabled)
  assert.equal(disabled.getAttribute("aria-checked"), "true")
  assert.equal(disabled.getAttribute("aria-disabled"), "true")
})

test("CheckboxField exposes the full interactive surface hierarchy", () => {
  const view = render(<CheckboxField label="Interactive surface" />)
  const field = view.getByText("Interactive surface").closest("label")

  assert.ok(field)
  assert.match(field.className, /bg-transparent/)
  assert.match(field.className, /not\(:has\(\[data-slot=checkbox\]\[data-disabled\]\)\).*hover.*bg-oe-interaction-hover-subtle/)
  assert.doesNotMatch(field.className, /bg-oe-background-disabled/)
  assert.doesNotMatch(field.className, /brand-alpha-05/)
  assert.doesNotMatch(field.className, /brand-alpha-08/)
})

test("Checkbox readOnly keeps focus while removing change, hover, and pressed feedback", async () => {
  const user = userEvent.setup({ document: dom.window.document })
  const view = render(<CheckboxField defaultChecked readOnly label="Read only checkbox" />)
  const checkbox = view.getByRole("checkbox", { name: "Read only checkbox" })
  const field = view.getByText("Read only checkbox").closest("label")

  await user.click(view.getByText("Read only checkbox"))
  assert.equal(checkbox.getAttribute("aria-checked"), "true")
  checkbox.focus()
  assert.equal(dom.window.document.activeElement, checkbox)
  assert.match(checkbox.className, /focus-visible:ring-2/)
  assert.doesNotMatch(checkbox.className, /active:/)
  assert.ok(field)
  assert.doesNotMatch(field.className, /hover.*bg-oe-interaction-hover-subtle/)
})

test("CheckboxIndicator exposes reusable visual states without adding another checkbox control", () => {
  const view = render(<><CheckboxIndicator checked /><CheckboxIndicator indeterminate /><CheckboxIndicator checked disabled /></>)
  const indicators = view.container.querySelectorAll('[data-slot="checkbox-indicator"]')

  assert.equal(indicators.length, 3)
  assert.equal(view.queryByRole("checkbox"), null)
  assert.equal(indicators[0].hasAttribute("data-checked"), true)
  assert.equal(indicators[1].hasAttribute("data-indeterminate"), true)
  assert.equal(indicators[2].hasAttribute("data-disabled"), true)
})

test("Checkbox appearances preserve focus radius and Ghost remains icon-only", () => {
  const view = render(<><Checkbox aria-label="Rounded" /><Checkbox aria-label="Ghost" appearance="ghost" checked /></>)
  const rounded = view.getByRole("checkbox", { name: "Rounded" })
  const ghost = view.getByRole("checkbox", { name: "Ghost" })
  const roundedIndicator = rounded.querySelector('[data-slot="checkbox-indicator"]')
  const ghostIndicator = ghost.querySelector('[data-slot="checkbox-indicator"]')

  assert.match(rounded.className, /\brounded\b/)
  assert.match(ghost.className, /\brounded\b/)
  assert.ok(roundedIndicator)
  assert.match(roundedIndicator.className, /\brounded\b/)
  assert.ok(ghostIndicator)
  assert.equal(ghostIndicator.className.includes("bg-oe-brand-background-bold-primary"), false)
})

test("Selection Fields keep their layout size on press", () => {
  const view = render(<><CheckboxField label="Enabled checkbox" /><CheckboxField label="Disabled checkbox" disabled /><RadioGroup><RadioField value="enabled" label="Enabled radio" /><RadioField value="disabled" label="Disabled radio" disabled /></RadioGroup></>)
  const enabledCheckboxField = view.getByText("Enabled checkbox").closest("label")
  const disabledCheckboxField = view.getByText("Disabled checkbox").closest("label")
  const enabledRadioField = view.getByText("Enabled radio").closest("label")
  const disabledRadioField = view.getByText("Disabled radio").closest("label")

  for (const field of [enabledCheckboxField, disabledCheckboxField, enabledRadioField, disabledRadioField]) {
    assert.ok(field)
    assert.doesNotMatch(field.className, /active:scale/)
    assert.doesNotMatch(field.className, /transform-gpu/)
  }
  assert.match(view.getByRole("checkbox", { name: "Enabled checkbox" }).className, /\bsize-4\b/)
  assert.match(view.getByRole("radio", { name: "Enabled radio" }).className, /\bsize-4\b/)
})

test("RadioGroup moves the single selected value through label clicks", async () => {
  const user = userEvent.setup({ document: dom.window.document })
  const view = render(<RadioGroup defaultValue="a"><RadioField value="a" label="Alpha" /><RadioField value="b" label="Beta" /></RadioGroup>)
  const alpha = view.getByRole("radio", { name: "Alpha" })
  const beta = view.getByRole("radio", { name: "Beta" })

  assert.equal(alpha.getAttribute("aria-checked"), "true")
  await user.click(view.getByText("Beta"))
  assert.equal(alpha.getAttribute("aria-checked"), "false")
  assert.equal(beta.getAttribute("aria-checked"), "true")
})

test("RadioGroup moves selection with arrow keys and preserves roving tab index", async () => {
  const user = userEvent.setup({ document: dom.window.document })
  const view = render(<RadioGroup defaultValue="a"><RadioField value="a" label="Alpha" /><RadioField value="b" label="Beta" /><RadioField value="c" label="Gamma" /></RadioGroup>)
  const alpha = view.getByRole("radio", { name: "Alpha" })
  const beta = view.getByRole("radio", { name: "Beta" })
  const gamma = view.getByRole("radio", { name: "Gamma" })

  ;[alpha, beta, gamma].forEach((radio, index) => {
    radio.getBoundingClientRect = () => ({
      x: 0, y: index * 40, width: 16, height: 16,
      top: index * 40, right: 16, bottom: index * 40 + 16, left: 0,
      toJSON: () => ({}),
    })
  })

  alpha.focus()
  await user.keyboard("{ArrowDown}")

  await waitFor(() => {
    assert.equal(alpha.getAttribute("aria-checked"), "false")
    assert.equal(alpha.getAttribute("tabindex"), "-1")
    assert.equal(beta.getAttribute("aria-checked"), "true")
    assert.equal(beta.getAttribute("tabindex"), "0")
    assert.equal(dom.window.document.activeElement, beta)
  })
})

test("Radio readOnly preserves selection while remaining focusable", async () => {
  const user = userEvent.setup({ document: dom.window.document })
  const view = render(<RadioGroup defaultValue="a"><RadioField value="a" readOnly label="Alpha" /><RadioField value="b" readOnly label="Beta" /></RadioGroup>)
  const alpha = view.getByRole("radio", { name: "Alpha" })
  const beta = view.getByRole("radio", { name: "Beta" })
  const alphaField = view.getByText("Alpha").closest("label")

  alpha.getBoundingClientRect = () => ({ x: 0, y: 0, width: 16, height: 16, top: 0, right: 16, bottom: 16, left: 0, toJSON: () => ({}) })
  beta.getBoundingClientRect = () => ({ x: 0, y: 40, width: 16, height: 16, top: 40, right: 16, bottom: 56, left: 0, toJSON: () => ({}) })

  await user.click(view.getByText("Beta"))
  assert.equal(alpha.getAttribute("aria-checked"), "true")
  assert.equal(beta.getAttribute("aria-checked"), "false")
  alpha.focus()
  assert.equal(dom.window.document.activeElement, alpha)
  await user.keyboard("{ArrowDown}")
  assert.equal(alpha.getAttribute("aria-checked"), "true")
  assert.equal(beta.getAttribute("aria-checked"), "false")
  assert.equal(dom.window.document.activeElement, beta)
  assert.equal(alpha.getAttribute("aria-disabled"), null)
  assert.match(alpha.className, /focus-visible:ring-2/)
  assert.doesNotMatch(alpha.className, /active:/)
  assert.ok(alphaField)
  assert.doesNotMatch(alphaField.className, /hover.*bg-oe-interaction-hover-subtle/)
})

test("Radio supports selectable custom content without nesting another Field", async () => {
  const user = userEvent.setup({ document: dom.window.document })
  const view = render(<RadioGroup defaultValue="light"><label><span>Light preview</span><Radio value="light" aria-label="Light" /></label><label><span>Dark preview</span><Radio value="dark" aria-label="Dark" /></label></RadioGroup>)
  const dark = view.getByRole("radio", { name: /Dark preview/ })

  await user.click(view.getByText("Dark preview"))
  assert.equal(dark.getAttribute("aria-checked"), "true")
})

test("RadioField preserves focus styling and flips only the Control order", () => {
  const view = render(<RadioGroup><RadioField value="flipped" flipped label="Flipped option" /></RadioGroup>)
  const radio = view.getByRole("radio", { name: "Flipped option" })
  const field = view.getByText("Flipped option").closest("label")

  assert.ok(field)
  assert.match(field.className, /flex-row-reverse/)
  assert.match(radio.className, /focus-visible:ring-2/)
  assert.match(radio.className, /focus-visible:ring-offset-2/)
})

test("RadioField exposes the full interactive surface hierarchy", () => {
  const view = render(<RadioGroup><RadioField value="surface" label="Interactive surface" /></RadioGroup>)
  const field = view.getByText("Interactive surface").closest("label")

  assert.ok(field)
  assert.match(field.className, /bg-transparent/)
  assert.match(field.className, /not\(:has\(\[data-slot=radio\]\[data-disabled\]\)\).*hover.*bg-oe-interaction-hover-subtle/)
  assert.doesNotMatch(field.className, /bg-oe-background-disabled/)
  assert.doesNotMatch(field.className, /brand-alpha-05/)
  assert.doesNotMatch(field.className, /brand-alpha-08/)
})

test("Radio Disabled preserves its selected value and blocks label interaction", async () => {
  const user = userEvent.setup({ document: dom.window.document })
  const view = render(<RadioGroup defaultValue="disabled"><RadioField value="disabled" label="Disabled option" disabled /><RadioField value="enabled" label="Enabled option" /></RadioGroup>)
  const disabled = view.getByRole("radio", { name: "Disabled option" })

  assert.equal(disabled.getAttribute("aria-checked"), "true")
  assert.equal(disabled.getAttribute("aria-disabled"), "true")
  await user.click(view.getByText("Disabled option"))
  assert.equal(disabled.getAttribute("aria-checked"), "true")
})
