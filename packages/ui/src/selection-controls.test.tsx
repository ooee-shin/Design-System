import assert from "node:assert/strict"
import test, { afterEach } from "node:test"

import { JSDOM } from "jsdom"
import React from "react"
import { cleanup, render } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { CheckboxField } from "./checkbox"
import { RadioField, RadioGroup } from "./radio"

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
