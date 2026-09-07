import "./test-setup"

import assert from "node:assert/strict"
import test, { afterEach } from "node:test"

import React from "react"
import { cleanup, render } from "@testing-library/react"

import { Textarea } from "./textarea"

afterEach(() => {
  cleanup()
})

function container(view: { container: HTMLElement }) {
  return view.container.querySelector("[data-slot=textarea-container]") as HTMLElement | null
}

// docs/system/components/textarea.md 는 내용이 넘칠 때 3.5줄이 보이는 높이를 기본값으로 정한다.
// 보이는 줄 수는 (높이 − border 2px − 위쪽 여백 8px) ÷ 줄높이 20px 이므로 80px 이 그 값이다.
// 아래쪽 여백은 스크롤 영역 안에 있어 끝까지 내렸을 때만 보이므로 계산에 넣지 않는다.
test("Textarea shows three and a half lines at its default height", () => {
  const view = render(<Textarea aria-label="문의 내용" />)
  const box = container(view)

  assert.ok(box)
  assert.equal(box.style.height, "80px")
  assert.equal((80 - 2 - 8) / 20, 3.5)
})

// 최소값보다 작은 값은 최소값으로 제한한다.
test("Textarea clamps a height below the minimum", () => {
  const view = render(<Textarea aria-label="문의 내용" height={40} />)
  const box = container(view)

  assert.ok(box)
  assert.equal(box.style.height, "80px")
})

// autoSize 는 높이를 내용에 맡기므로 고정 높이를 쓰지 않는다.
test("Textarea drops the fixed height when auto size is on", () => {
  const view = render(<Textarea aria-label="문의 내용" autoSize />)
  const box = container(view)

  assert.ok(box)
  assert.equal(box.style.height, "")
  assert.equal(box.dataset.autoSize, "true")
})

// Resize 는 기본값이 켠 상태이며 세로 방향만 허용하고, autoSize 와 함께 켜지지 않는다.
test("Textarea allows resizing only vertically and only without auto size", () => {
  const vertical = render(<Textarea aria-label="문의 내용" />)
  const verticalBox = container(vertical)

  assert.ok(verticalBox)
  assert.equal(verticalBox.dataset.resize, "true")
  assert.match(verticalBox.className, /resize-y/)
  assert.doesNotMatch(verticalBox.className, /resize-x/)

  cleanup()

  const withAutoSize = render(<Textarea aria-label="문의 내용" autoSize resize />)
  const autoSizeBox = container(withAutoSize)

  assert.ok(autoSizeBox)
  assert.equal(autoSizeBox.dataset.resize, "false")
  assert.match(autoSizeBox.className, /resize-none/)
})
