import "./test-setup"

import assert from "node:assert/strict"
import test, { afterEach } from "node:test"

import React from "react"
import { cleanup, render } from "@testing-library/react"

import { Combobox } from "./combobox"
import { Field } from "./field"
import { Select } from "./select"
import { SelectBox, SelectBoxGroup } from "./select-box"

afterEach(() => cleanup())

const regions = [
  { value: "seoul", label: "서울" },
  { value: "busan", label: "부산" },
]

test("Field names a Select through its own label", () => {
  const view = render(
    <Field label="관심 지역">
      <Select options={regions} />
    </Field>,
  )

  view.getByRole("combobox", { name: "관심 지역" })
})

test("Field describes a Select with its helper text", () => {
  const view = render(
    <Field label="관심 지역" helperText="한 곳만 고를 수 있습니다">
      <Select options={regions} />
    </Field>,
  )
  const trigger = view.getByRole("combobox")
  const helper = view.getByText("한 곳만 고를 수 있습니다")

  assert.equal(trigger.getAttribute("aria-describedby"), helper.id)
})

test("Field names a Combobox through its own label", () => {
  const view = render(
    <Field label="관심 지역">
      <Combobox options={regions} />
    </Field>,
  )

  view.getByRole("combobox", { name: "관심 지역" })
})

test("Field names a Select Box group without nesting a second group", () => {
  const view = render(
    <Field label="관심 지역" group helperText="최대 3개까지 고를 수 있습니다">
      <SelectBoxGroup selectionMode="multiple">
        <SelectBox value="seoul" title="서울" />
        <SelectBox value="busan" title="부산" />
      </SelectBoxGroup>
    </Field>,
  )
  const groups = view.getAllByRole("group")
  const helper = view.getByText("최대 3개까지 고를 수 있습니다")

  assert.equal(groups.length, 1)
  assert.equal(groups[0].getAttribute("aria-label"), null)
  assert.equal(groups[0].getAttribute("aria-describedby"), helper.id)
  view.getByRole("group", { name: "관심 지역" })
})

