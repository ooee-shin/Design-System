import "./test-setup"

import assert from "node:assert/strict"
import test, { afterEach } from "node:test"

import React from "react"
import { cleanup, render } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { SelectBox, SelectBoxGroup } from "./select-box"

afterEach(() => {
  cleanup()
})

test("SelectBox selects one item in single mode from the whole item target", async () => {
    const user = userEvent.setup({ document: globalThis.document })
    const view = render(
      <SelectBoxGroup ariaLabel="Plan" defaultValue="starter">
        <SelectBox value="starter" title="Starter" />
        <SelectBox value="team" title="Team" />
      </SelectBoxGroup>,
    )

    await user.click(view.getByText("Team"))

    assert.equal(view.getByRole("radio", { name: "Team" }).getAttribute("data-checked"), "")
    assert.equal(view.getByText("Team").closest("[data-slot=select-box]")?.getAttribute("data-selected"), "")
    assert.equal(view.getByRole("radio", { name: "Starter" }).getAttribute("data-checked"), null)
})

test("SelectBox preserves multiple values in read only mode", async () => {
    const user = userEvent.setup({ document: globalThis.document })
    const changes: Array<string | string[]> = []
    const view = render(
      <SelectBoxGroup ariaLabel="Features" selectionMode="multiple" defaultValue={["a"]} onValueChange={(value) => changes.push(value)} readOnly>
        <SelectBox value="a" title="Feature A" />
        <SelectBox value="b" title="Feature B" />
      </SelectBoxGroup>,
    )

    await user.click(view.getByText("Feature B"))

    assert.deepEqual(changes, [])
    assert.equal(view.getByRole("checkbox", { name: "Feature A" }).getAttribute("data-checked"), "")
    assert.equal(view.getByRole("checkbox", { name: "Feature B" }).getAttribute("data-checked"), null)
})

test("SelectBox keeps an accessible input when the visible control is hidden", () => {
    const view = render(
      <SelectBoxGroup ariaLabel="Visual-only control" defaultValue="a" trailingElement="none">
        <SelectBox value="a" title="Option A" />
      </SelectBoxGroup>,
    )

  assert.ok(view.getByRole("radio", { name: "Option A" }))
  assert.match(view.getByRole("radio", { name: "Option A" }).className, /opacity-0/)
})

test("SelectBox keeps layout and focus-visible rules on the whole item", () => {
  const view = render(
    <SelectBoxGroup ariaLabel="Layout" columns={2}>
      <SelectBox value="a" title="Option A" description="Description" />
    </SelectBoxGroup>,
  )

  const item = view.getByText("Option A").closest("[data-slot=select-box]")
  const group = view.getByRole("radiogroup", { name: "Layout" })

  assert.ok(item)
  assert.match(item.className, /px-4/)
  assert.match(item.className, /py-3/)
  assert.match(item.className, /has-\[:focus-visible\]/)
  assert.doesNotMatch(item.className, /focus-within/)
  assert.match(group.className, /gap-2/)
})

test("SelectBox removes brand selection treatment when disabled", () => {
  const view = render(
    <SelectBoxGroup ariaLabel="Disabled" defaultValue="a" disabled>
      <SelectBox value="a" title="Option A" />
    </SelectBoxGroup>,
  )

  const item = view.getByText("Option A").closest("[data-slot=select-box]")

  assert.ok(item)
  assert.equal(item.getAttribute("data-selected"), "")
  assert.equal(item.getAttribute("data-disabled"), "")
  assert.match(item.className, /data-\[disabled\]:data-\[selected\]:bg-oe-background-disabled/)
  assert.match(item.className, /data-\[disabled\]:data-\[selected\]:border-oe-border-disabled/)
})
