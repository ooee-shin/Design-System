import "./test-setup"

import assert from "node:assert/strict"
import test, { afterEach } from "node:test"

import React from "react"
import { cleanup, render } from "@testing-library/react"

import { CheckboxField } from "./checkbox"
import { Field } from "./field"
import { Input } from "./input"

afterEach(() => cleanup())

test("Field names the control it wraps with its own label", () => {
  const view = render(
    <Field label="이름">
      <Input />
    </Field>,
  )

  view.getByRole("textbox", { name: "이름" })
})

test("Field puts the requirement mark before the label", () => {
  const view = render(
    <Field label="이름" required>
      <Input />
    </Field>,
  )
  const header = view.container.querySelector("[data-slot=field-header]")

  assert.ok(header)

  assert.equal(header.textContent, "*이름")
})

test("Field hides the requirement mark from assistive technology", () => {
  const view = render(
    <Field label="이름" required>
      <Input />
    </Field>,
  )

  view.getByRole("textbox", { name: "이름" })
  assert.equal(view.getByRole("textbox").getAttribute("required"), "")
})

test("Field describes the control with its helper text", () => {
  const view = render(
    <Field label="휴대폰 번호" helperText="10-11자리로 입력해 주세요">
      <Input />
    </Field>,
  )
  const control = view.getByRole("textbox")
  const helper = view.getByText("10-11자리로 입력해 주세요")

  assert.equal(control.getAttribute("aria-describedby"), helper.id)
})

test("Field shows the error message instead of the helper text", () => {
  const view = render(
    <Field label="휴대폰 번호" helperText="10-11자리로 입력해 주세요" errorMessage="번호를 다시 확인해 주세요">
      <Input />
    </Field>,
  )

  assert.equal(view.queryByText("10-11자리로 입력해 주세요"), null)
  view.getByText("번호를 다시 확인해 주세요")
})

test("Field marks the control invalid while it shows an error message", () => {
  const view = render(
    <Field label="휴대폰 번호" errorMessage="번호를 다시 확인해 주세요">
      <Input />
    </Field>,
  )
  const control = view.getByRole("textbox")
  const error = view.getByText("번호를 다시 확인해 주세요")

  assert.equal(control.getAttribute("aria-invalid"), "true")
  assert.equal(control.getAttribute("aria-describedby"), error.id)
})

test("Field renders the character count next to the footer message", () => {
  const view = render(
    <Field label="소개" helperText="자기소개를 적어 주세요" characterCount={{ current: 12, max: 200 }}>
      <Input />
    </Field>,
  )
  const footer = view.container.querySelector("[data-slot=field-footer]")

  assert.ok(footer)
  assert.equal(footer.textContent, "자기소개를 적어 주세요12/200")
})

test("Field renders the right description after the label", () => {
  const view = render(
    <Field label="관심 지역" rightDescription="최대 3개">
      <Input />
    </Field>,
  )
  const header = view.container.querySelector("[data-slot=field-header]")

  assert.ok(header)
  assert.equal(header.textContent, "관심 지역최대 3개")
})

test("Field pushes the header trailing element to the end", () => {
  const view = render(
    <Field label="관심 지역" trailingElement={<button type="button">초기화</button>}>
      <Input />
    </Field>,
  )
  const trailing = view.container.querySelector("[data-slot=field-trailing]")

  assert.ok(trailing)
  assert.match(trailing.className, /ml-auto/)
})

test("Field owns the group name when the input slot holds a group", () => {
  const view = render(
    <Field label="관심 지역" group>
      <CheckboxField label="서울" />
      <CheckboxField label="부산" />
    </Field>,
  )

  view.getByRole("group", { name: "관심 지역" })
})

test("Field describes the group itself rather than one of its items", () => {
  const view = render(
    <Field label="관심 지역" group helperText="최대 3개까지 고를 수 있습니다">
      <CheckboxField label="서울" />
      <CheckboxField label="부산" />
    </Field>,
  )
  const group = view.getByRole("group", { name: "관심 지역" })
  const helper = view.getByText("최대 3개까지 고를 수 있습니다")

  assert.equal(group.getAttribute("aria-describedby"), helper.id)
  assert.equal(view.getByRole("checkbox", { name: "서울" }).getAttribute("aria-describedby"), null)
})

test("Field drops the label element in group mode because no single control owns it", () => {
  const view = render(
    <Field label="관심 지역" group>
      <CheckboxField label="서울" />
    </Field>,
  )
  const label = view.container.querySelector("[data-slot=field-label]")

  assert.ok(label)
  assert.equal(label.tagName, "SPAN")
})

test("Field passes its disabled and read only state down to the control", () => {
  const view = render(
    <Field label="이름" disabled readOnly>
      <Input />
    </Field>,
  )
  const control = view.getByRole("textbox")

  assert.equal(control.hasAttribute("disabled"), true)
  assert.equal(control.getAttribute("readonly"), "")
})

test("Field warns when the input slot holds no single control to connect", () => {
  const warnings: string[] = []
  const originalWarn = console.warn
  console.warn = (message: string) => warnings.push(message)

  try {
    render(
      <Field label="이름">
        <div>
          <Input />
        </div>
      </Field>,
    )
  } finally {
    console.warn = originalWarn
  }

  assert.equal(warnings.length, 1)
  assert.match(warnings[0], /Input slot/)
})

test("Field keeps the rows of a group it owns in their own container", () => {
  const view = render(
    <Field label="관심 지역" group>
      <CheckboxField label="서울" />
      <CheckboxField label="부산" />
    </Field>,
  )
  const root = view.container.querySelector("[data-slot=field]")
  const group = view.getByRole("group", { name: "관심 지역" })

  assert.notEqual(group, root)
  assert.equal(group.children.length, 2)
})

test("Field does not add its own gap between the rows of a group it owns", () => {
  const view = render(
    <Field label="관심 지역" group helperText="최대 3개까지 고를 수 있습니다">
      <CheckboxField label="서울" />
      <CheckboxField label="부산" />
    </Field>,
  )
  const group = view.getByRole("group", { name: "관심 지역" })

  assert.doesNotMatch(group.className, /gap-/)
})

test("Field treats a fragment as the rows of a group rather than one control", () => {
  const rows = (
    <>
      <CheckboxField label="서울" />
      <CheckboxField label="부산" />
    </>
  )
  const view = render(
    <Field label="관심 지역" group>
      {rows}
    </Field>,
  )
  const group = view.getByRole("group", { name: "관심 지역" })

  assert.equal(group.getAttribute("data-slot"), "field-group")
  assert.equal(group.children.length, 2)
})

test("Field warns when the injected id lands on nothing at all", () => {
  const warnings: string[] = []
  const originalWarn = console.warn
  console.warn = (message: string) => warnings.push(message)

  try {
    render(
      <Field label="이름">
        <>
          <Input />
        </>
      </Field>,
    )
  } finally {
    console.warn = originalWarn
  }

  assert.equal(warnings.length, 1)
  assert.match(warnings[0], /Input slot/)
})


test("Field keeps the requirement mark tight to the label and the right description apart", () => {
  const view = render(
    <Field label="관심 지역" required rightDescription="최대 3개">
      <Input />
    </Field>,
  )
  const header = view.container.querySelector("[data-slot=field-header]")

  assert.ok(header)
  assert.match(header.className, /gap-0\.5/)
  assert.match(view.getByText("최대 3개").className, /ml-1\.5/)
})

test("Field dims the label along with the control when it is disabled", () => {
  const view = render(
    <Field label="이름" disabled>
      <Input />
    </Field>,
  )

  assert.match(view.getByText("이름").className, /text-oe-foreground-disabled/)
})

test("Field colors the label with the error color while it shows an error message", () => {
  const view = render(
    <Field label="휴대폰 번호" errorMessage="번호를 다시 확인해 주세요">
      <Input />
    </Field>,
  )

  assert.match(view.getByText("휴대폰 번호").className, /text-oe-danger-foreground-secondary/)
})

test("Field keeps the disabled label dimmed even when an error message is present", () => {
  const view = render(
    <Field label="휴대폰 번호" disabled errorMessage="번호를 다시 확인해 주세요">
      <Input />
    </Field>,
  )
  const label = view.getByText("휴대폰 번호")

  assert.match(label.className, /text-oe-foreground-disabled/)
  assert.doesNotMatch(label.className, /text-oe-danger-foreground-secondary/)
})
