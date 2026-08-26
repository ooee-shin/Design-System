import assert from "node:assert/strict"
import test, { afterEach } from "node:test"

import { JSDOM } from "jsdom"
import React from "react"
import { cleanup, render } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { Switch, SwitchField } from "./switch"

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost" })

Object.assign(globalThis, {
  window: dom.window,
  document: dom.window.document,
  HTMLElement: dom.window.HTMLElement,
  HTMLInputElement: dom.window.HTMLInputElement,
  Element: dom.window.Element,
  Node: dom.window.Node,
  Event: dom.window.Event,
  MouseEvent: dom.window.MouseEvent,
  KeyboardEvent: dom.window.KeyboardEvent,
  MutationObserver: dom.window.MutationObserver,
  getComputedStyle: dom.window.getComputedStyle,
  requestAnimationFrame: (callback: FrameRequestCallback) => setTimeout(() => callback(Date.now()), 0),
  cancelAnimationFrame: (id: ReturnType<typeof setTimeout>) => clearTimeout(id),
})

Object.defineProperty(globalThis, "navigator", { configurable: true, value: dom.window.navigator })

if (!("PointerEvent" in globalThis)) {
  Object.assign(globalThis, { PointerEvent: dom.window.MouseEvent })
}

afterEach(() => cleanup())

test("SwitchField uses the medium control and right-side label by default", async () => {
  const view = render(<SwitchField label="Notifications" />)
  const control = await view.findByRole("switch", { name: "Notifications" })
  const field = view.getByText("Notifications").closest("label")

  assert.match(control.className, /h-6/)
  assert.match(control.className, /w-\[38px\]/)
  assert.ok(field)
  assert.equal(field.classList.contains("flex-row-reverse"), false)
})

test("pointer and label clicks toggle the SwitchField", async () => {
  const user = userEvent.setup({ document: dom.window.document })
  const view = render(<SwitchField label="Notifications" />)
  const control = await view.findByRole("switch", { name: "Notifications" })

  assert.equal(control.getAttribute("aria-checked"), "false")
  await user.click(control)
  assert.equal(control.getAttribute("aria-checked"), "true")
  await user.click(view.getByText("Notifications"))
  assert.equal(control.getAttribute("aria-checked"), "false")
})

test("Space toggles a focused Switch", async () => {
  const user = userEvent.setup({ document: dom.window.document })
  const view = render(<Switch aria-label="Notifications" />)
  const control = view.getByRole("switch", { name: "Notifications" })

  control.focus()
  await user.keyboard("[Space]")
  assert.equal(control.getAttribute("aria-checked"), "true")
})

test("Disabled preserves the selected value and blocks interaction", async () => {
  const user = userEvent.setup({ document: dom.window.document })
  const view = render(<SwitchField label="Notifications" defaultChecked disabled />)
  const control = await view.findByRole("switch", { name: "Notifications" })

  assert.equal(control.getAttribute("aria-checked"), "true")
  assert.equal(control.getAttribute("aria-disabled"), "true")
  await user.click(control)
  assert.equal(control.getAttribute("aria-checked"), "true")
})

test("changing an enabled On switch to Disabled preserves its value and only transitions color", async () => {
  const view = render(<SwitchField label="Notifications" checked disabled={false} />)
  const control = await view.findByRole("switch", { name: "Notifications" })

  assert.equal(control.getAttribute("aria-checked"), "true")
  view.rerender(<SwitchField label="Notifications" checked disabled />)

  assert.equal(control.getAttribute("aria-checked"), "true")
  assert.equal(control.getAttribute("aria-disabled"), "true")
  assert.equal(control.classList.contains("data-[disabled]:!transition-[background-color,box-shadow]"), true)
  const thumb = control.querySelector('[data-slot="switch-thumb"]')
  assert.ok(thumb)
  assert.equal(thumb.classList.contains("data-[disabled]:!transition-[background-color]"), true)
})

test("Small SwitchField keeps the shared 13px label token when Disabled", () => {
  const view = render(<SwitchField label="Notifications" controlSize="small" disabled />)
  const label = view.getByText("Notifications")

  assert.equal(label.classList.contains("text-[length:var(--text-oe-label)]"), true)
  assert.equal(label.classList.contains("text-oe-foreground-disabled"), true)
  assert.equal(label.classList.contains("text-sm"), false)
  assert.equal(label.classList.contains("text-base"), false)
})

test("each controlSize applies the confirmed control and thumb dimensions", () => {
  const view = render(
    <>
      <Switch aria-label="Small" controlSize="small" />
      <Switch aria-label="Medium" controlSize="medium" />
      <Switch aria-label="Large" controlSize="large" />
    </>,
  )

  const cases = [
    { name: "Small", control: ["h-4", "w-[26px]"], thumb: "size-3" },
    { name: "Medium", control: ["h-6", "w-[38px]"], thumb: "size-5" },
    { name: "Large", control: ["h-8", "w-[52px]"], thumb: "size-[26px]" },
  ]

  for (const current of cases) {
    const control = view.getByRole("switch", { name: current.name })
    const thumb = control.querySelector('[data-slot="switch-thumb"]')
    assert.ok(thumb)
    current.control.forEach((className) => assert.equal(control.classList.contains(className), true))
    assert.equal(thumb.classList.contains(current.thumb), true)
  }
})
