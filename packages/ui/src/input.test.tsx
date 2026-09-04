import "./test-setup"

import assert from "node:assert/strict"
import test, { afterEach } from "node:test"

import React from "react"
import { cleanup, render } from "@testing-library/react"

import { Input } from "./input"
import { Textarea } from "./textarea"

afterEach(() => {
  cleanup()
})

// docs/system/interaction.md 는 Focus 선과 ring 을 focus-visible 기준으로 표시하라고 정한다.
// focus-within 을 쓰면 마우스 클릭만으로도 Focus 선이 나타난다.
test("Input shows the focus ring only for focus-visible", () => {
  const view = render(<Input aria-label="이름" />)
  const container = view.container.querySelector("[data-slot=input-container]")

  assert.ok(container)
  assert.match(container.className, /has-\[:focus-visible\]:ring-oe-focus-ring/)
  assert.doesNotMatch(container.className, /focus-within:ring/)
})

test("Textarea shows the focus ring only for focus-visible", () => {
  const view = render(<Textarea aria-label="설명" />)
  const container = view.container.querySelector("[data-slot=textarea-container]")

  assert.ok(container)
  assert.match(container.className, /has-\[:focus-visible\]:ring-oe-focus-ring/)
  assert.doesNotMatch(container.className, /focus-within:ring/)
})
