import "./test-setup"

import assert from "node:assert/strict"
import test, { afterEach } from "node:test"

import React from "react"
import { cleanup, render } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { NumberInput } from "./number-input"

afterEach(() => {
  cleanup()
})

// docs/system/components/number-input.md 는 이 컴포넌트가 숫자만 받는다고 정한다.
// type 을 text 로 바꾸면 어떤 문자든 들어오므로 이 자리를 고정한다.
test("NumberInput keeps the native number type", () => {
  const view = render(<NumberInput aria-label="수량" defaultValue={1} />)
  const field = view.container.querySelector("input")

  assert.ok(field)
  assert.equal(field.getAttribute("type"), "number")
  assert.equal(field.getAttribute("inputmode"), "decimal")
})

// 숫자로 해석할 수 없는 입력은 값으로 반영하지 않는다.
test("NumberInput does not commit a value that is not a number", async () => {
  const user = userEvent.setup()
  const seen: (number | undefined)[] = []
  const view = render(<NumberInput aria-label="수량" defaultValue={12} min={0} max={99} onValueChange={(next) => seen.push(next)} />)
  const field = view.container.querySelector("input")

  assert.ok(field)
  await user.click(field)
  await user.keyboard("가")

  assert.ok(!seen.some((value) => typeof value === "number" && Number.isNaN(value)))
  assert.ok(seen.every((value) => value === undefined || Number.isFinite(value)))
})

// allowNegative 의 기본값이 false 이므로 유효한 최소값은 0 이다.
test("NumberInput stops at zero unless negative values are allowed", async () => {
  const user = userEvent.setup()
  const view = render(<NumberInput aria-label="수량" defaultValue={0} decreaseLabel="값 줄이기" />)
  const field = view.container.querySelector("input")
  const decrease = view.getByLabelText("값 줄이기")

  assert.ok(field)
  assert.equal(decrease.hasAttribute("disabled"), true)
  await user.click(decrease)
  assert.equal(field.value, "0")
})
