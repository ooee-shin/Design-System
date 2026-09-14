import "./test-setup"

import assert from "node:assert/strict"
import test, { afterEach } from "node:test"

import React from "react"
import { cleanup, render } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

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
  assert.match(container.className, /has-\[\[data-slot=input\]:focus-visible\]:ring-oe-focus-ring/)
  assert.doesNotMatch(container.className, /focus-within:ring/)
})

// 초점선은 입력란을 쓰고 있다는 표시다. `has-[:focus-visible]` 는 자손이면 무엇이든 걸리므로
// Trailing element 의 버튼으로 키보드 초점이 넘어가는 것만으로 입력란 전체에 선이 켜지고,
// 그 버튼이 갖고 있는 자신의 ring 과 겹쳐 두 겹이 된다.
test("Input rings only for the text field, not for a trailing control", () => {
  const view = render(
    <Input
      aria-label="비밀번호"
      trailingElement={
        <button type="button" aria-label="비밀번호 보기">
          eye
        </button>
      }
    />,
  )
  const container = view.container.querySelector("[data-slot=input-container]")

  assert.ok(container)
  assert.doesNotMatch(container.className, /has-\[:focus-visible\]/)
})

// filled 의 바닥이 밝아지는 것은 입력란을 편집하는 동안의 표시다. focus-within 은 컨테이너 안의
// 어떤 요소든 초점을 받으면 걸리므로, Trailing element 의 버튼을 누르는 것만으로 입력란 전체가
// 편집 중인 모습이 된다.
test("Input filled brightens only while the text field itself has focus", () => {
  const view = render(
    <Input
      aria-label="비밀번호"
      variant="filled"
      trailingElement={
        <button type="button" aria-label="비밀번호 보기">
          eye
        </button>
      }
    />,
  )
  const container = view.container.querySelector("[data-slot=input-container]")

  assert.ok(container)
  assert.doesNotMatch(container.className, /focus-within:bg/)
  assert.match(container.className, /has-\[\[data-slot=input\]:focus\]:bg-oe-background-primary/)
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
  assert.match(clear.className, /transition-\[color,background-color,opacity,width,margin\]/)
  assert.match(clear.className, /duration-150/)
  assert.match(clear.className, /opacity-0/)
})

// Clear button 을 누를 때 focus 가 빠져나가면 focus 전환과 값 전환이 다른 시점에 시작된다.
test("Input keeps focus in the field when the clear button is pressed", async () => {
  const user = userEvent.setup({ document: globalThis.document })
  const view = render(<Input aria-label="금액" clearable clearLabel="지우기" defaultValue="1000" />)
  const field = view.getByLabelText("금액")
  const clear = view.getByLabelText("지우기")

  await user.click(field)
  assert.equal(globalThis.document.activeElement, field)

  await user.click(clear)
  assert.equal(globalThis.document.activeElement, field)
})
