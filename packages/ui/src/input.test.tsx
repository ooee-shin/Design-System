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

// clearable 이 false 일 때 버튼을 지우면 값이 생길 때 마운트로 튀어나와 전환 효과가 걸리지 않는다.
test("Input keeps the clear button mounted while it is hidden", () => {
  const view = render(<Input aria-label="금액" clearable={false} clearLabel="지우기" />)
  const clear = view.container.querySelector("[data-slot=input-clear]")

  assert.ok(clear)
  assert.equal(clear.getAttribute("data-visible"), null)
  assert.match(clear.className, /transition-\[color,background-color,opacity,visibility\]/)
})

test("Input drops the clear button when clearable is not given", () => {
  const view = render(<Input aria-label="금액" />)

  assert.equal(view.container.querySelector("[data-slot=input-clear]"), null)
})
