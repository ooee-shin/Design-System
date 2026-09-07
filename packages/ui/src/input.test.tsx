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

// 값이 없을 때 버튼이 자리를 차지하면 focus 상태에서 빈 공백이 보인다.
test("Input drops the clear button while there is no value", () => {
  const view = render(<Input aria-label="금액" clearable={false} clearLabel="지우기" />)

  assert.equal(view.container.querySelector("[data-slot=input-clear]"), null)
})

test("Input drops the clear button when clearable is not given", () => {
  const view = render(<Input aria-label="금액" />)

  assert.equal(view.container.querySelector("[data-slot=input-clear]"), null)
})

// 값이 생길 때 마운트만 하면 튀어나온다. opacity 전환으로 나타나야 한다.
test("Input fades the clear button in when a value appears", () => {
  const view = render(<Input aria-label="금액" clearable clearLabel="지우기" />)
  const clear = view.container.querySelector("[data-slot=input-clear]")

  assert.ok(clear)
  assert.match(clear.className, /transition-\[color,background-color,opacity\]/)
  assert.match(clear.className, /opacity-0/)
})
