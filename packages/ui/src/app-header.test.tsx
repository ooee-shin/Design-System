import "./test-setup"

import assert from "node:assert/strict"
import test, { afterEach } from "node:test"

import React from "react"
import { act, cleanup, render } from "@testing-library/react"

import { AppHeader } from "./app-header"

afterEach(() => cleanup())

const LEADING_ONE = <button data-testid="back">뒤로</button>
const TRAILING_ONE = <button data-testid="search">검색</button>
const LEADING_TWO = (
  <>
    <button data-testid="back">뒤로</button>
    <button data-testid="home">홈</button>
  </>
)
const TRAILING_TWO = (
  <>
    <button data-testid="search">검색</button>
    <button data-testid="more">더보기</button>
  </>
)

// 좌우 자리의 폭을 맞추는 규칙은 실제 내용 폭을 재야 동작한다. jsdom 은 레이아웃을 계산하지
// 않으므로 폭을 자리마다 정해 주고, 컴포넌트가 둘 중 넓은 쪽을 골라 양쪽에 거는지 확인한다.
const STUB_WIDTH: Record<string, number> = {}

Object.defineProperty(globalThis.HTMLElement.prototype, "offsetWidth", {
  configurable: true,
  get(this: HTMLElement) {
    return STUB_WIDTH[this.getAttribute("data-slot") ?? ""] ?? 0
  },
})

function stubSideWidths(leading: number, trailing: number) {
  STUB_WIDTH["app-header-leading-content"] = leading
  STUB_WIDTH["app-header-trailing-content"] = trailing
}

afterEach(() => {
  for (const key of Object.keys(STUB_WIDTH)) delete STUB_WIDTH[key]
  Object.defineProperty(globalThis.window, "scrollY", { configurable: true, value: 0 })
})

function renderHeader(element: React.ReactElement) {
  const view = render(element)
  const header = view.container.querySelector("[data-slot=app-header]")
  assert.ok(header, "app-header slot 이 그려지지 않았다")
  return { view, header: header as HTMLElement }
}

// jsdom 은 실제로 스크롤하지 않으므로 위치를 심고 이벤트만 일으킨다.
function scrollWindowTo(top: number) {
  act(() => {
    Object.defineProperty(globalThis.window, "scrollY", { configurable: true, value: top })
    globalThis.window.dispatchEvent(new globalThis.Event("scroll"))
  })
}

function scrollElementTo(element: HTMLElement, top: number) {
  act(() => {
    Object.defineProperty(element, "scrollTop", { configurable: true, value: top })
    element.dispatchEvent(new globalThis.Event("scroll"))
  })
}

function slot(header: HTMLElement, name: string) {
  return header.querySelector(`[data-slot=app-header-${name}]`) as HTMLElement | null
}

function assertHas(className: string, expected: readonly string[], context: string) {
  for (const item of expected) {
    assert.ok(className.split(" ").includes(item), `${context} 에 ${item} 가 없다: ${className}`)
  }
}

function assertLacks(className: string, unexpected: readonly string[], context: string) {
  for (const item of unexpected) {
    assert.ok(!className.split(" ").includes(item), `${context} 에 ${item} 가 남아 있다: ${className}`)
  }
}

test("title 을 그리고 description 을 넘기지 않으면 그 자리를 만들지 않는다", () => {
  const { header } = renderHeader(<AppHeader title="가맹점관리" />)

  assert.equal(slot(header, "title")?.textContent, "가맹점관리")
  assert.ok(slot(header, "description") === null, "description 을 넘기지 않았는데 자리가 생겼다")
})

// 제목은 그 화면의 이름이다. 화면 낭독기를 쓰는 사람은 제목으로 화면을 훑으므로 heading 이어야
// 목록에 잡힌다. 한 화면에 하나만 두는 컴포넌트이니 레벨은 `h1` 로 고정한다.
test("제목은 h1 로 그린다", () => {
  const { header } = renderHeader(<AppHeader title="가맹점관리" />)

  assert.equal(slot(header, "title")!.tagName, "H1")
})

// 로고가 어느 화면인지 이미 말하고 있거나 닫기만 있으면 되는 자리에서는 제목 글자를 화면에 두지
// 않는다. 그래도 이름은 있어야 하므로 지우지 않고 눈에만 보이지 않게 한다.
test("titleHidden 은 제목을 화면에서만 감추고 DOM 에는 남긴다", () => {
  const { header } = renderHeader(<AppHeader titleHidden title="전체메뉴" leadingElement={LEADING_ONE} />)

  const block = slot(header, "title-block")
  assert.ok(block, "titleHidden 인데 제목 블록이 사라졌다")
  assertHas(block.className, ["sr-only"], "감춘 제목 블록")
  assert.equal(slot(header, "title")!.textContent, "전체메뉴")
})

// 감춘 블록이 자리를 차지하면 그만큼 아이콘이 안쪽으로 밀린다. `sr-only` 는 흐름에서 빠지므로
// 좌우 자리가 남은 공간을 반씩 나눠 갖고 아이콘이 양 끝에 붙는다. 그 대신 감춘 블록에는 여백과
// 정렬 class 를 함께 두지 않는다.
test("감춘 제목 블록에는 여백 class 를 두지 않는다", () => {
  const { header } = renderHeader(<AppHeader titleHidden title="홈" leadingElement={LEADING_ONE} />)

  assertLacks(slot(header, "title-block")!.className, ["px-2", "flex"], "감춘 제목 블록")
})

test("titleHidden 은 description 도 함께 감춘다", () => {
  const { header } = renderHeader(<AppHeader titleHidden title="홈" description="123-45-67890" />)

  const block = slot(header, "title-block")!
  assertHas(block.className, ["sr-only"], "감춘 제목 블록")
  assert.ok(block.contains(slot(header, "description")), "description 이 감춘 블록 밖에 있다")
})

test("description 을 넘기면 제목 아래 같은 블록 안에 그린다", () => {
  const { header } = renderHeader(<AppHeader title="행복마트 강남점" description="123-45-67890" />)

  const block = slot(header, "title-block")
  assert.ok(block, "title-block 이 없다")
  const order = [...block.children].map((child) => child.getAttribute("data-slot"))
  assert.deepEqual(order, ["app-header-title", "app-header-description"])
})

test("leading 과 trailing 은 각자의 자리에 그린다", () => {
  const { header, view } = renderHeader(
    <AppHeader title="행복마트 강남점" leadingElement={LEADING_ONE} trailingElement={TRAILING_TWO} />,
  )

  assert.ok(slot(header, "leading")?.contains(view.getByTestId("back")), "leading 이 제 자리에 없다")
  assert.ok(slot(header, "trailing")?.contains(view.getByTestId("search")), "trailing 이 제 자리에 없다")
  assert.ok(slot(header, "trailing")?.contains(view.getByTestId("more")), "trailing 의 두 번째 아이콘이 없다")
})

test("자리의 순서는 leading, title-block, trailing 이다", () => {
  const { header } = renderHeader(<AppHeader title="가맹점관리" leadingElement={LEADING_TWO} trailingElement={TRAILING_TWO} />)

  const order = [...header.children].map((child) => child.getAttribute("data-slot"))
  assert.deepEqual(order, ["app-header-leading", "app-header-title-block", "app-header-trailing"])
})

test("기본 제목 정렬은 가운데이며 data-title-align 으로 드러난다", () => {
  const { header } = renderHeader(<AppHeader title="가맹점관리" />)

  assert.equal(header.getAttribute("data-title-align"), "center")
})

// 제목은 남은 공간의 가운데가 아니라 화면의 가운데에 선다. 그러려면 좌우 자리가 서로 같은 폭을
// 가져야 하므로 둘에 같은 분배 규칙을 준다. `flex-1` 은 내용 폭이 아니라 남은 공간을 반씩 나눠
// 갖게 하므로, 아이콘 개수가 달라도 제목의 중심이 움직이지 않는다.
// 대신 좌우 자리에는 `min-w-0` 을 두지 않는다. 자리가 아이콘보다 좁아질 수 있게 되면 폭이 모자랄
// 때 아이콘이 잘리는데, 이때 줄어들어야 하는 것은 아이콘이 아니라 제목이다.
test("가운데 정렬은 좌우 자리에 같은 폭을 예약한다", () => {
  const { header } = renderHeader(
    <AppHeader title="행복마트 강남점" leadingElement={LEADING_ONE} trailingElement={TRAILING_TWO} />,
  )

  const leading = slot(header, "leading")
  const trailing = slot(header, "trailing")
  assert.ok(leading && trailing)

  assertHas(leading.className, ["flex-1"], "가운데 정렬의 leading")
  assertHas(trailing.className, ["flex-1"], "가운데 정렬의 trailing")
  assertLacks(leading.className, ["min-w-0"], "가운데 정렬의 leading")
  assertLacks(trailing.className, ["min-w-0"], "가운데 정렬의 trailing")
})

// 아이콘이 한쪽에만 있어도 반대쪽 자리는 같은 폭을 지킨다. 자리가 내용에 따라 줄어들면 제목이
// 빈 쪽으로 밀려 화면 중심에서 벗어난다.
test("아이콘 개수가 좌우로 달라도 두 자리가 같은 분배 규칙을 쓴다", () => {
  const { header } = renderHeader(<AppHeader title="행복마트 강남점" trailingElement={TRAILING_TWO} />)

  const leading = slot(header, "leading")
  const trailing = slot(header, "trailing")
  assert.ok(leading, "아이콘이 없어도 leading 자리는 남아 있어야 한다")
  assert.ok(trailing)

  const distribution = (element: HTMLElement) =>
    element.className.split(" ").filter((item) => item === "flex-1" || item === "shrink-0").sort()
  assert.deepEqual(distribution(leading), distribution(trailing), "좌우 자리의 분배 규칙이 다르다")
})

// `flex-1` 만으로는 규칙이 끝까지 지켜지지 않는다. 제목이 길어져 좌우가 좁아지면 아이콘이 많은
// 쪽이 먼저 자기 내용 폭에 걸려 멈추고 적은 쪽만 계속 줄어들어, 제목이 아이콘이 적은 쪽으로
// 치우친다. 그래서 두 자리의 내용 폭을 재서 넓은 쪽에 맞춰 양쪽에 같은 바닥을 건다. 그러면
// 폭이 모자랄 때 줄어드는 것이 자리가 아니라 제목이 된다.
test("가운데 정렬은 좌우 자리를 넓은 쪽에 맞춰 같은 폭으로 예약한다", () => {
  stubSideWidths(40, 84)
  const { header } = renderHeader(
    <AppHeader title="행복마트 강남대로점" leadingElement={LEADING_ONE} trailingElement={TRAILING_TWO} />,
  )

  assert.equal(slot(header, "leading")!.style.minWidth, "84px")
  assert.equal(slot(header, "trailing")!.style.minWidth, "84px")
})

test("예약 폭은 왼쪽이 더 넓을 때도 넓은 쪽을 따른다", () => {
  stubSideWidths(84, 40)
  const { header } = renderHeader(<AppHeader title="가맹점관리" leadingElement={LEADING_TWO} trailingElement={TRAILING_ONE} />)

  assert.equal(slot(header, "leading")!.style.minWidth, "84px")
  assert.equal(slot(header, "trailing")!.style.minWidth, "84px")
})

// 왼쪽 정렬에서는 예약하지 않는다. 예약하면 제목이 오른쪽 아이콘 개수만큼 좁아지는데, 왼쪽
// 정렬을 고르는 이유가 긴 이름을 넓게 쓰기 위해서이기 때문이다.
test("왼쪽 정렬은 좌우를 예약하지 않고 제목이 남은 폭을 모두 쓴다", () => {
  stubSideWidths(40, 84)
  const { header } = renderHeader(
    <AppHeader titleAlign="start" title="행복마트 강남대로점" leadingElement={LEADING_ONE} trailingElement={TRAILING_TWO} />,
  )

  assert.equal(header.getAttribute("data-title-align"), "start")
  assertLacks(slot(header, "leading")!.className, ["flex-1"], "왼쪽 정렬의 leading")
  assertLacks(slot(header, "trailing")!.className, ["flex-1"], "왼쪽 정렬의 trailing")
  assertHas(slot(header, "title-block")!.className, ["flex-1", "min-w-0"], "왼쪽 정렬의 title-block")
  assert.equal(slot(header, "leading")!.style.minWidth, "", "왼쪽 정렬인데 예약 폭이 걸렸다")
  assert.equal(slot(header, "trailing")!.style.minWidth, "", "왼쪽 정렬인데 예약 폭이 걸렸다")
})

// 높이는 56px 한 값으로 고정한다. 설명 줄이 있는 화면과 없는 화면을 오갈 때 헤더가 늘었다
// 줄었다 하면 그 아래 본문이 위아래로 밀린다.
test("헤더 높이는 description 유무와 관계없이 같다", () => {
  const plain = renderHeader(<AppHeader title="가맹점관리" />)
  const described = renderHeader(<AppHeader title="행복마트 강남점" description="123-45-67890" />)

  assertHas(plain.header.className, ["h-14"], "설명이 없는 헤더")
  assert.equal(described.header.className, plain.header.className, "설명 줄이 헤더의 높이 규칙을 바꿨다")
})

// 설명이 들어왔다고 제목이 작아지면 화면을 옮길 때 제목 크기가 흔들린다. 고정 높이 안에 두 줄이
// 들어가도록 크기를 미리 정해 두고 제목은 어느 경우에나 같은 크기를 쓴다.
test("제목의 크기는 description 유무와 관계없이 같다", () => {
  const plain = renderHeader(<AppHeader title="가맹점관리" />)
  const described = renderHeader(<AppHeader title="행복마트 강남점" description="123-45-67890" />)

  assert.equal(slot(described.header, "title")!.className, slot(plain.header, "title")!.className)
})

// 두 줄이 56px 안에 들어가려면 어느 쪽도 줄바꿈하면 안 된다. 제목뿐 아니라 설명도 한 줄에서
// 자른다.
test("제목과 설명은 모두 한 줄에서 말줄임한다", () => {
  const { header } = renderHeader(<AppHeader title="행복마트 강남대로점" description="서울 강남구 강남대로 100" />)

  assertHas(slot(header, "title")!.className, ["truncate"], "제목")
  assertHas(slot(header, "description")!.className, ["truncate"], "설명")
})

test("기본값은 sticky 이며 끄면 고정 class 를 두지 않는다", () => {
  const fixed = renderHeader(<AppHeader title="가맹점관리" />)
  const scrolling = renderHeader(<AppHeader sticky={false} title="가맹점관리" />)

  assertHas(fixed.header.className, ["sticky", "top-0"], "기본 헤더")
  assertLacks(scrolling.header.className, ["sticky", "top-0"], "sticky 를 끈 헤더")
})

// 경계선은 가리는 것이 있을 때만 나타난다. 맨 위에 있을 때는 본문과 같은 면으로 붙어 있다가
// 본문이 헤더 아래로 들어가기 시작하면 그 경계를 보여 준다.
test("맨 위에 있을 때는 경계선을 보이지 않는다", () => {
  const { header } = renderHeader(<AppHeader title="가맹점관리" />)

  assert.equal(header.getAttribute("data-stuck"), "false")
  assertHas(header.className, ["border-transparent"], "맨 위의 헤더")
})

// 선을 없앴다 만들지 않고 색만 바꾼다. 경계를 켜고 끄면 그때마다 본문이 1px 씩 위아래로 움직인다.
test("스크롤이 시작되면 경계선에 색이 생긴다", () => {
  const { header } = renderHeader(<AppHeader title="가맹점관리" />)

  scrollWindowTo(40)

  assert.equal(header.getAttribute("data-stuck"), "true")
  assertHas(header.className, ["border-oe-border-secondary"], "스크롤된 헤더")
  assertLacks(header.className, ["border-transparent"], "스크롤된 헤더")
})

test("sticky 를 끄면 스크롤해도 경계선이 생기지 않는다", () => {
  const { header } = renderHeader(<AppHeader sticky={false} title="가맹점관리" />)

  scrollWindowTo(40)

  assert.equal(header.getAttribute("data-stuck"), "false")
  assertHas(header.className, ["border-transparent"], "sticky 를 끈 헤더")
})

// 화면 전체가 아니라 안쪽 영역이 스크롤되는 배치에서도 같게 동작해야 한다. 화면을 기준으로 재면
// 헤더가 화면 아래쪽에 걸쳐 있다는 이유만으로 붙은 것으로 읽힌다.
test("안쪽 영역이 스크롤될 때는 그 영역의 스크롤 위치를 본다", () => {
  const view = render(
    <div data-testid="scroller" style={{ overflowY: "auto" }}>
      <AppHeader title="가맹점관리" />
    </div>,
  )
  const header = view.container.querySelector("[data-slot=app-header]") as HTMLElement
  const scroller = view.getByTestId("scroller")

  assert.equal(header.getAttribute("data-stuck"), "false")

  scrollElementTo(scroller, 40)

  assert.equal(header.getAttribute("data-stuck"), "true")
})
