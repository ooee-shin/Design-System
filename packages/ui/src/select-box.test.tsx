import "./test-setup"

import assert from "node:assert/strict"
import test, { afterEach } from "node:test"

import React from "react"
import { cleanup, render } from "@testing-library/react"

import { SelectBox, SelectBoxGroup } from "./select-box"

afterEach(() => {
  cleanup()
})

function leadingSlot(container: HTMLElement) {
  return container.querySelector("[data-slot=select-box-leading-element]")
}

// docs/system/components/select-box.md 는 Leading element 자리가 고정 크기를 갖지 않고
// 그 자리에 놓인 요소의 크기를 따른다고 정한다. 자리에 크기를 박으면 요소가 요청한
// 크기가 덮어써지고, 아이콘의 왼쪽 끝이 Title 시작점과 어긋난다.
test("SelectBox leaves the leading element size to the element", () => {
  const view = render(
    <SelectBoxGroup ariaLabel="역할">
      <SelectBox value="a" title="Label A" leadingElement={<span data-testid="leading" />} />
    </SelectBoxGroup>,
  )
  const slot = leadingSlot(view.container)

  assert.ok(slot)
  assert.doesNotMatch(slot.className, /(^|\s)size-\d/)
  assert.doesNotMatch(slot.className, /svg\]:size/)
  assert.doesNotMatch(slot.className, /justify-center/)
})

// columns 가 2 이상이면 Leading element 를 Title 위 왼쪽에 배치한다.
test("SelectBox stacks the leading element when the group has multiple columns", () => {
  const single = render(
    <SelectBoxGroup ariaLabel="한 열">
      <SelectBox value="a" title="Label A" leadingElement={<span />} />
    </SelectBoxGroup>,
  )
  const singleRow = leadingSlot(single.container)?.parentElement

  assert.ok(singleRow)
  assert.match(singleRow.className, /items-center/)
  assert.doesNotMatch(singleRow.className, /flex-col/)

  cleanup()

  const multiple = render(
    <SelectBoxGroup ariaLabel="여러 열" columns={2}>
      <SelectBox value="a" title="Label A" leadingElement={<span />} />
    </SelectBoxGroup>,
  )
  const multipleRow = leadingSlot(multiple.container)?.parentElement

  assert.ok(multipleRow)
  assert.match(multipleRow.className, /flex-col/)
  assert.match(multipleRow.className, /items-start/)
})
