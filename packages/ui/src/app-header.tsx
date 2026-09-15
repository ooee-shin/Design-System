import * as React from "react"

import { cn } from "./utils"

export type AppHeaderTitleAlign = "center" | "start"

// 모바일 화면의 최상단 한 줄이다. 자리는 이 컴포넌트가 고정하고 무엇을 표시할지는 쓰는 화면이
// 정한다. 목록에서는 기능명을, 상세에서는 그 대상의 이름을 같은 자리에 넣는 식이다.
//
// 높이는 56px 한 값으로 고정한다. 공통 Control Height 의 XXLarge 와 값이 같지만 그 규칙을 따르는
// 것은 아니다. 헤더는 Control 이 아니라 Control 을 담는 Container 이며, 값이 같은 것은 우연이다.
// 설명 줄이 있는 화면과 없는 화면을 오갈 때 헤더가 늘었다 줄었다 하면 그 아래 본문이 위아래로
// 밀리므로 높이를 내용에 맡기지 않는다.
const BASE_CLASS =
  "z-10 flex h-14 w-full items-center border-b bg-oe-background-primary px-oe-padding-default transition-colors"

// 좌우는 성격이 같은 아이콘 자리다. 어느 쪽에 무엇이 서는지를 여기서 정하지 않는다.
// `leading` 을 뒤로가기로, `trailing` 을 동작으로 못박으면 화면 유형이 늘어날 때마다 타입을
// 고쳐야 하므로, 두 자리를 같은 형태로 열어 두고 조합은 쓰는 쪽이 정한다.
//
// 가운데 정렬에서 두 자리에 `flex-1` 을 주어 남은 공간을 반씩 나눠 갖게 한다. 제목이 짧아 여유가
// 넉넉한 동안에는 이것만으로 두 자리의 폭이 같아진다.
//
// 두 자리에 `min-w-0` 을 두지 않는 것도 규칙의 일부다. flex item 의 기본 최소 폭이 내용 폭이라
// 자리가 아이콘보다 좁아지지 않으며, 폭이 모자랄 때 줄어드는 것은 아이콘이 아니라 제목이 된다.
const SIDE_CLASS: Record<AppHeaderTitleAlign, string> = {
  center: "flex flex-1 items-center",
  start: "flex shrink-0 items-center",
}

// 아이콘을 실제로 담는 안쪽 요소다. 자리 자체가 아니라 이쪽을 재야 예약 폭이 자기 자신을 다시
// 재는 일이 생기지 않는다. `shrink-0` 으로 자연 폭을 지켜 재는 값이 흔들리지 않게 한다.
// 아이콘 사이에 간격을 두지 않는다. 아이콘 버튼은 아이콘보다 큰 정사각형이라 버튼 자체의 여백이
// 이미 둘을 갈라 놓으며, 여기에 간격을 더하면 두 개짜리 자리만 제목을 그만큼 더 밀어낸다.
// 좌우 자리에 놓인 아이콘의 크기는 헤더가 정한다. 그 자리에 서는 Button 은 자기 크기 단계에
// 맞는 아이콘 크기를 갖고 오는데, 헤더에서는 그 값이 작게 읽힌다. 화면마다 크기를 적게 두면
// 헤더마다 값이 갈리므로 여기서 한 번 덮어쓴다. Button 이 자기 규칙으로 정한 값을 이기려면
// 우선순위를 밝혀야 한다. 로고처럼 그림이 서는 자리는 svg 가 아니므로 걸리지 않는다.
// 값과 이유는 app-header.md 의 「아이콘 크기는 헤더가 정한다」가 소유한다.
// 아이콘의 크기와 누를 때의 움직임을 헤더가 자기 자리 안에서 정한다. 공용 Button 은 누를 때
// 움직이지 않기로 정해져 있으므로(`button.md`) 그쪽을 고치지 않고 여기서만 건다. 누르는 동안
// 아이콘이 90% 로 줄었다가 손을 떼면 돌아온다. 로고처럼 그림이 서는 자리는 svg 가 아니므로
// 걸리지 않는다.
const SIDE_CONTENT_CLASS =
  "flex shrink-0 items-center [&_svg]:size-oe-icon-large! [&_svg]:transition-transform [&_svg]:duration-200 [&_svg]:ease-out [&_[data-slot=button]:active_svg]:scale-90"

// 아이콘 버튼은 자기 안쪽에 여백을 갖는다. 그대로 두면 아이콘 그림이 헤더의 여백선보다 한 단계 더
// 안쪽에 서므로, 버튼이 든 자리만 그만큼 바깥으로 당겨 그림을 선에 맞춘다. 헤더의 아이콘 버튼은
// Large 40px 안에 24px 아이콘이 가운데 서므로 한쪽이 8px 이다. 로고처럼 버튼이 아닌 것이 서는
// 자리는 당기지 않는다. 그 자리는 여백선에 그대로 맞아야 한다.
const LEADING_CONTENT_CLASS = cn(SIDE_CONTENT_CLASS, "has-[[data-slot=button]]:-ml-2")
const TRAILING_CONTENT_CLASS = cn(SIDE_CONTENT_CLASS, "has-[[data-slot=button]]:-mr-2")

// 왼쪽 정렬에서는 예약하지 않는다. 예약하면 제목이 오른쪽 아이콘 개수만큼 좁아지는데, 이 정렬을
// 고르는 이유가 긴 이름을 넓게 쓰기 위해서이기 때문이다.
const BLOCK_CLASS: Record<AppHeaderTitleAlign, string> = {
  center: "flex min-w-0 flex-col justify-center px-2 text-center",
  start: "flex min-w-0 flex-1 flex-col justify-center px-2 text-left",
}

// 제목 글자를 화면에 두지 않는 화면이 있다. 로고가 어느 화면인지 이미 말하고 있거나, 닫기만
// 있으면 되는 자리다. 그때도 제목을 지우지 않고 눈에만 보이지 않게 한다. 화면 낭독기를 쓰는
// 사람은 제목으로 화면을 훑으므로, 지워 버리면 그 화면에 이름이 없어진다.
// `sr-only` 는 흐름에서 빠지므로 좌우 자리가 남은 공간을 반씩 나눠 갖고 아이콘이 양 끝에 붙는다.
// 그래서 감춘 블록에는 여백과 정렬 class 를 함께 두지 않는다. Description 은 Title 을 보조하는
// 줄이라 같은 블록 안에서 함께 사라진다.
//
// 제목 20px 과 설명 16px 을 합친 36px 이 56px 안에 들어간다. 제목의 크기는 설명 유무와 관계없이
// 같다. 설명이 들어왔다고 제목이 작아지면 화면을 옮길 때 제목 크기가 흔들린다.
// 두 줄이 고정 높이 안에 들어가려면 어느 쪽도 줄바꿈하면 안 되므로 설명도 제목처럼 한 줄에서
// 자른다.
const TITLE_CLASS = "truncate text-base leading-5 font-semibold text-oe-foreground-primary"
const DESCRIPTION_CLASS = "truncate text-xs leading-4 text-oe-foreground-tertiary"

// 경계선은 가리는 것이 있을 때만 나타난다. 맨 위에 있을 때는 본문과 같은 면으로 붙어 있다가
// 본문이 헤더 아래로 들어가기 시작하면 그 경계를 보여 준다.
// 선을 없앴다 만들지 않고 색만 바꾸는 이유는 레이아웃 때문이다. `border-b` 를 켜고 끄면 그때마다
// 본문이 1px 씩 위아래로 움직인다.
const BORDER_CLASS = {
  stuck: "border-oe-border-secondary",
  top: "border-transparent",
} as const

export type AppHeaderProps = Omit<React.ComponentPropsWithoutRef<"header">, "title"> & {
  title: React.ReactNode
  titleHidden?: boolean
  description?: React.ReactNode
  leadingElement?: React.ReactNode
  trailingElement?: React.ReactNode
  titleAlign?: AppHeaderTitleAlign
  sticky?: boolean
}

// 예약 폭은 첫 그림 전에 정해져야 제목이 한 번 치우쳤다가 제자리로 옮겨 가지 않는다. 서버에는
// layout 이 없어 `useLayoutEffect` 가 경고를 내므로 브라우저에서만 그쪽을 쓴다.
const useMeasureEffect = typeof window === "undefined" ? React.useEffect : React.useLayoutEffect

// 헤더를 실제로 스크롤시키는 조상을 찾는다. 없으면 화면 전체가 스크롤되는 배치이므로 `null` 을
// 돌려주고 호출하는 쪽이 window 를 본다.
function findScroller(element: HTMLElement, view: Window) {
  for (let parent = element.parentElement; parent !== null; parent = parent.parentElement) {
    const overflow = view.getComputedStyle(parent).overflowY
    if (overflow === "auto" || overflow === "scroll" || overflow === "overlay") return parent
  }
  return null
}

function AppHeader({
  className,
  title,
  titleHidden = false,
  description,
  leadingElement,
  trailingElement,
  titleAlign = "center",
  sticky = true,
  ...props
}: AppHeaderProps) {
  const ref = React.useRef<HTMLElement>(null)
  const leadingRef = React.useRef<HTMLSpanElement>(null)
  const trailingRef = React.useRef<HTMLSpanElement>(null)
  const [stuck, setStuck] = React.useState(false)
  const [sideWidth, setSideWidth] = React.useState<number>()

  // `flex-1` 만으로는 균형 규칙이 끝까지 지켜지지 않는다. 제목이 길어져 좌우가 좁아지면 아이콘이
  // 많은 쪽이 먼저 자기 내용 폭에 걸려 멈추고, 남은 공간은 적은 쪽으로 몰린다. 그러면 두 자리의
  // 폭이 어긋나 제목이 아이콘이 적은 쪽으로 치우친다.
  // 그래서 두 자리의 내용 폭을 재서 넓은 쪽에 맞춰 양쪽에 같은 바닥을 건다. 폭이 모자랄 때
  // 줄어드는 것이 자리가 아니라 제목이 되므로, 제목이 잘리는 상황에서도 중심이 움직이지 않는다.
  // 왼쪽 정렬에서는 걸지 않는다. 그 정렬을 고르는 이유가 제목을 넓게 쓰기 위해서다.
  useMeasureEffect(() => {
    // 제목을 감추면 가운데 맞출 대상이 없다. 그런데도 폭을 예약하면 로고처럼 넓은 것이 한쪽에 설
    // 때 그 폭이 두 배로 잡혀 좁은 화면에서 헤더가 넘친다. 감춘 제목은 흐름에서 빠지므로 좌우
    // 자리가 남은 공간을 반씩 나눠 갖고 아이콘이 양 끝에 붙는다.
    if (titleAlign !== "center" || titleHidden) {
      setSideWidth(undefined)
      return
    }

    const sides = [leadingRef.current, trailingRef.current]
    if (sides.some((side) => side === null)) return

    const measure = () => setSideWidth(Math.max(...sides.map((side) => side!.offsetWidth)))
    measure()

    if (typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(measure)
    for (const side of sides) observer.observe(side!)
    return () => observer.disconnect()
  }, [titleAlign, titleHidden])

  // 헤더를 감싸고 실제로 스크롤되는 영역을 찾아 그 위치를 읽는다. 화면 전체가 스크롤되는 배치도
  // 안쪽 영역이 스크롤되는 배치도 같게 동작해야 하므로, 화면을 기준으로 재지 않는다. 화면 기준은
  // 헤더가 화면 아래쪽에 걸쳐 있다는 이유만으로 붙은 것으로 읽는다.
  React.useEffect(() => {
    const element = ref.current
    if (!sticky || !element) {
      setStuck(false)
      return
    }

    const view = element.ownerDocument.defaultView
    if (view === null) return

    const scroller = findScroller(element, view)
    const read = () => setStuck(scroller === null ? view.scrollY > 0 : scroller.scrollTop > 0)
    read()

    const target: EventTarget = scroller ?? view
    target.addEventListener("scroll", read, { passive: true })
    return () => target.removeEventListener("scroll", read)
  }, [sticky])

  return (
    <header
      ref={ref}
      data-slot="app-header"
      data-title-align={titleAlign}
      data-stuck={stuck}
      className={cn(
        BASE_CLASS,
        sticky && "sticky top-0",
        stuck ? BORDER_CLASS.stuck : BORDER_CLASS.top,
        className,
      )}
      {...props}
    >
      <div
        data-slot="app-header-leading"
        className={cn(SIDE_CLASS[titleAlign], "justify-start")}
        style={sideWidth === undefined ? undefined : { minWidth: sideWidth }}
      >
        <span ref={leadingRef} data-slot="app-header-leading-content" className={LEADING_CONTENT_CLASS}>
          {leadingElement}
        </span>
      </div>
      <div
        data-slot="app-header-title-block"
        className={titleHidden ? "sr-only" : BLOCK_CLASS[titleAlign]}
      >
        <h1 data-slot="app-header-title" className={titleHidden ? undefined : TITLE_CLASS}>
          {title}
        </h1>
        {description === undefined ? null : (
          <span data-slot="app-header-description" className={titleHidden ? undefined : DESCRIPTION_CLASS}>
            {description}
          </span>
        )}
      </div>
      <div
        data-slot="app-header-trailing"
        className={cn(SIDE_CLASS[titleAlign], "justify-end")}
        style={sideWidth === undefined ? undefined : { minWidth: sideWidth }}
      >
        <span ref={trailingRef} data-slot="app-header-trailing-content" className={TRAILING_CONTENT_CLASS}>
          {trailingElement}
        </span>
      </div>
    </header>
  )
}

export { AppHeader }
