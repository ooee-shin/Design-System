"use client"

import {
  RiArrowLeftDoubleLine,
  RiArrowLeftSLine,
  RiArrowRightDoubleLine,
  RiArrowRightSLine,
} from "@remixicon/react"

import { cn } from "@/lib/utils"

/**
 * 목록의 페이지를 옮긴다.
 *
 * 번호를 늘어놓지 않고 옮기는 버튼만 갖는다. 번호를 함께 두면 보이는 칸 수가 지금 페이지에 따라
 * 달라져서, 1페이지와 가운데 페이지를 오갈 때 양옆 버튼이 100px 가까이 움직인다. 같은 곳을
 * 연달아 누르려던 손이 매번 목표를 다시 찾게 된다. 지금 어디에 있는지는 이 컴포넌트 밖에서
 * 글로 말하고, 멀리 떨어진 페이지로 한 번에 가는 일은 번호를 직접 치는 칸이 맡는다.
 *
 * Button 을 가져다 쓰지 않고 안을 직접 그린다. 네 버튼이 한 덩어리로 읽혀야 하고 정사각으로
 * 서야 하는데, 이는 Button 이 갖는 규칙과 다르다.
 */

const STEP =
  "grid size-8 shrink-0 place-items-center rounded-oe-control text-oe-foreground-secondary outline-none transition-colors hover:bg-oe-interaction-hover hover:text-oe-foreground-primary focus-visible:ring-2 focus-visible:ring-oe-focus-ring disabled:pointer-events-none disabled:text-oe-foreground-disabled"

function Pagination({
  page,
  lastPage,
  onChange,
  className,
}: {
  page: number
  lastPage: number
  onChange: (next: number) => void
  className?: string
}) {
  const goTo = (next: number) => onChange(Math.min(Math.max(next, 1), lastPage))
  const first = page === 1
  const last = page === lastPage

  return (
    <nav aria-label="페이지 이동" data-slot="pagination" className={cn("flex items-center gap-0.5", className)}>
      {/* 갈 곳이 없어도 버튼은 남는다. 사라지면 남은 버튼들이 자리를 옮겨서, 같은 곳을 연달아
          누르려던 손이 매번 목표를 다시 찾아야 한다. */}
      <button type="button" className={STEP} aria-label="첫 페이지" disabled={first} onClick={() => goTo(1)}>
        <RiArrowLeftDoubleLine className="size-oe-icon-small" aria-hidden="true" />
      </button>
      <button type="button" className={STEP} aria-label="이전 페이지" disabled={first} onClick={() => goTo(page - 1)}>
        <RiArrowLeftSLine className="size-oe-icon-small" aria-hidden="true" />
      </button>
      <button type="button" className={STEP} aria-label="다음 페이지" disabled={last} onClick={() => goTo(page + 1)}>
        <RiArrowRightSLine className="size-oe-icon-small" aria-hidden="true" />
      </button>
      <button type="button" className={STEP} aria-label="마지막 페이지" disabled={last} onClick={() => goTo(lastPage)}>
        <RiArrowRightDoubleLine className="size-oe-icon-small" aria-hidden="true" />
      </button>
    </nav>
  )
}

export { Pagination }
