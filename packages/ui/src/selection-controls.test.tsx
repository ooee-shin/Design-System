import "./test-setup"

import assert from "node:assert/strict"
import test, { afterEach } from "node:test"

import React from "react"
import { cleanup, render } from "@testing-library/react"

import { CheckboxField } from "./checkbox"
import { RadioField, RadioGroup } from "./radio"

afterEach(() => cleanup())

// Contracts that only hold across more than one selection Control belong here.
// Behaviour specific to a single Control lives in that Control's own test file.
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
