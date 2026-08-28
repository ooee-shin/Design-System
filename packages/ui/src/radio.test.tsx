import "./test-setup"

import assert from "node:assert/strict"
import test, { afterEach } from "node:test"

import React from "react"
import { cleanup, render, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { Radio, RadioField, RadioGroup } from "./radio"

afterEach(() => cleanup())

test("RadioGroup moves the single selected value through label clicks", async () => {
  const user = userEvent.setup({ document: globalThis.document })
  const view = render(<RadioGroup defaultValue="a"><RadioField value="a" label="Alpha" /><RadioField value="b" label="Beta" /></RadioGroup>)
  const alpha = view.getByRole("radio", { name: "Alpha" })
  const beta = view.getByRole("radio", { name: "Beta" })

  assert.equal(alpha.getAttribute("aria-checked"), "true")
  await user.click(view.getByText("Beta"))
  assert.equal(alpha.getAttribute("aria-checked"), "false")
  assert.equal(beta.getAttribute("aria-checked"), "true")
})

test("RadioGroup moves selection with arrow keys and preserves roving tab index", async () => {
  const user = userEvent.setup({ document: globalThis.document })
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
    assert.equal(globalThis.document.activeElement, beta)
  })
})

test("Radio readOnly preserves selection while remaining focusable", async () => {
  const user = userEvent.setup({ document: globalThis.document })
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
  assert.equal(globalThis.document.activeElement, alpha)
  await user.keyboard("{ArrowDown}")
  assert.equal(alpha.getAttribute("aria-checked"), "true")
  assert.equal(beta.getAttribute("aria-checked"), "false")
  assert.equal(globalThis.document.activeElement, beta)
  assert.equal(alpha.getAttribute("aria-disabled"), null)
  assert.match(alpha.className, /focus-visible:ring-2/)
  assert.doesNotMatch(alpha.className, /active:/)
  assert.ok(alphaField)
  assert.doesNotMatch(alphaField.className, /hover.*bg-oe-interaction-hover-subtle/)
})

test("Radio supports selectable custom content without nesting another Field", async () => {
  const user = userEvent.setup({ document: globalThis.document })
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
  const user = userEvent.setup({ document: globalThis.document })
  const view = render(<RadioGroup defaultValue="disabled"><RadioField value="disabled" label="Disabled option" disabled /><RadioField value="enabled" label="Enabled option" /></RadioGroup>)
  const disabled = view.getByRole("radio", { name: "Disabled option" })

  assert.equal(disabled.getAttribute("aria-checked"), "true")
  assert.equal(disabled.getAttribute("aria-disabled"), "true")
  await user.click(view.getByText("Disabled option"))
  assert.equal(disabled.getAttribute("aria-checked"), "true")
})
