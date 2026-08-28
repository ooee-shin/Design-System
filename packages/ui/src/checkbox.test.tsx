import "./test-setup"

import assert from "node:assert/strict"
import test, { afterEach } from "node:test"

import React from "react"
import { cleanup, render } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { Checkbox, CheckboxField, CheckboxIndicator } from "./checkbox"

afterEach(() => cleanup())

test("CheckboxField toggles from its label and Disabled preserves Checked", async () => {
  const user = userEvent.setup({ document: globalThis.document })
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
  const user = userEvent.setup({ document: globalThis.document })
  const view = render(<CheckboxField defaultChecked readOnly label="Read only checkbox" />)
  const checkbox = view.getByRole("checkbox", { name: "Read only checkbox" })
  const field = view.getByText("Read only checkbox").closest("label")

  await user.click(view.getByText("Read only checkbox"))
  assert.equal(checkbox.getAttribute("aria-checked"), "true")
  checkbox.focus()
  assert.equal(globalThis.document.activeElement, checkbox)
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
