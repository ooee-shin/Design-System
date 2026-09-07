import "./test-setup"

import assert from "node:assert/strict"
import test, { afterEach } from "node:test"

import React from "react"
import { cleanup, render } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { InputButton } from "./input-button"

afterEach(() => {
  cleanup()
})

// readonly 는 button 에 없는 속성이다. disabled 를 걸면 focus 가 빠져 조회 화면에서
// 키보드로 값을 지나갈 수 없으므로 aria-disabled 로 알리고 여는 동작만 막는다.
test("InputButton keeps focus and blocks opening while read only", async () => {
  const user = userEvent.setup({ document: globalThis.document })
  let opened = 0
  const view = render(<InputButton aria-label="날짜" value="2026-09-14" readOnly onClick={() => { opened += 1 }} />)
  const trigger = view.getByLabelText("날짜")

  assert.equal(trigger.getAttribute("aria-disabled"), "true")
  assert.equal(trigger.hasAttribute("disabled"), false)

  await user.click(trigger)
  assert.equal(opened, 0)

  trigger.focus()
  assert.equal(globalThis.document.activeElement, trigger)
})

test("InputButton opens when it is not read only", async () => {
  const user = userEvent.setup({ document: globalThis.document })
  let opened = 0
  const view = render(<InputButton aria-label="날짜" value="2026-09-14" onClick={() => { opened += 1 }} />)

  await user.click(view.getByLabelText("날짜"))
  assert.equal(opened, 1)
})
