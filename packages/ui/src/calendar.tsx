"use client"

import * as React from "react"
import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react"
import { ko } from "date-fns/locale"
import { DayPicker, getDefaultClassNames, type DayButtonProps } from "react-day-picker"

import { cn } from "./utils"

// shadcn 의 Calendar 구조를 가져왔다. 그대로 둔 것은 `react-day-picker` 를 쓴다는 것과
// `getDefaultClassNames()` 위에 우리 클래스를 겹쳐 쓰는 방식이다. 월 길이·윤년·주 시작 요일·
// 키보드 이동·스크린리더 안내는 그 라이브러리가 이미 맞게 갖고 있어 다시 만들지 않는다.
//
// 바꾼 것은 넷이다. 아이콘은 `lucide-react` 대신 Remix 를 쓴다. 색은 shadcn token 을 걷어내고
// `oe-*` semantic token 만 쓴다. 날짜 한 칸의 크기는 shadcn 의 `--cell-size` 대신
// `interaction.md` 의 공통 Control Height 를 따라 36px(regular)로 둔다. 로캘은 한국어가
// 기본이며, 주는 월요일에 시작한다 — 근무표와 급여가 그 기준으로 서기 때문이다.
//
// 이 컴포넌트는 날짜를 **고르는 격자**만 갖는다. 어디에 얹힐지(Popover·화면 안)는 쓰는 쪽이
// 정한다. `input-button.md` 가 Input Button 은 여는 화면을 소유하지 않는다고 정해 둔 것과 같은 결이다.

const DAY_CLASS =
  "relative flex size-oe-control-regular items-center justify-center rounded-oe-control text-sm text-oe-foreground-primary outline-none transition-colors hover:bg-oe-interaction-hover focus-visible:ring-2 focus-visible:ring-oe-focus-ring"

const NAV_BUTTON_CLASS =
  "flex size-oe-control-small items-center justify-center rounded-oe-control text-oe-foreground-secondary outline-none transition-colors hover:bg-oe-interaction-hover focus-visible:ring-2 focus-visible:ring-oe-focus-ring disabled:cursor-not-allowed disabled:text-oe-foreground-disabled"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  const defaults = getDefaultClassNames()

  return (
    <DayPicker
      data-slot="calendar"
      locale={ko}
      weekStartsOn={1}
      showOutsideDays={showOutsideDays}
      className={cn("w-fit rounded-xl border border-oe-border-secondary bg-oe-background-primary p-4", className)}
      classNames={{
        ...classNames,
        months: cn(defaults.months, "flex flex-col gap-4"),
        month: cn(defaults.month, "flex flex-col gap-3"),
        // 달 이름과 좌우 이동을 한 줄에 둔다. 이동 단추는 양 끝에 서고 이름이 가운데에 선다.
        month_caption: cn(defaults.month_caption, "flex h-oe-control-small items-center justify-center"),
        caption_label: cn(defaults.caption_label, "text-sm font-medium text-oe-foreground-primary"),
        nav: cn(defaults.nav, "flex items-center justify-between"),
        button_previous: cn(defaults.button_previous, NAV_BUTTON_CLASS),
        button_next: cn(defaults.button_next, NAV_BUTTON_CLASS),
        weekdays: cn(defaults.weekdays, "flex"),
        weekday: cn(defaults.weekday, "w-oe-control-regular text-xs font-normal text-oe-foreground-tertiary"),
        week: cn(defaults.week, "flex w-full"),
        day: cn(defaults.day, "p-0"),
        // 바깥 달의 날짜는 자리만 지킨다. 지우면 격자가 흔들려 주가 어긋나 보인다.
        outside: cn(defaults.outside, "text-oe-foreground-subtle"),
        disabled: cn(defaults.disabled, "text-oe-foreground-disabled"),
        // 오늘은 밑줄 대신 테두리로 표시한다. 고른 날과 겹쳐도 둘이 함께 읽힌다.
        today: cn(defaults.today, "[&>button]:ring-1 [&>button]:ring-inset [&>button]:ring-oe-border-primary"),
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...rest }) =>
          orientation === "left" ? <RiArrowLeftSLine aria-hidden {...rest} /> : <RiArrowRightSLine aria-hidden {...rest} />,
        DayButton: CalendarDayButton,
      }}
      {...props}
    />
  )
}

/**
 * 날짜 한 칸이다. 고른 날과 범위의 안쪽·양 끝을 `modifiers` 로 받아 색을 가른다.
 * 범위의 안쪽은 모서리를 깎지 않아 이어진 띠로 읽힌다.
 */
function CalendarDayButton({ day, modifiers, className, ...props }: DayButtonProps) {
  const { selected, range_start: rangeStart, range_end: rangeEnd, range_middle: rangeMiddle } = modifiers

  return (
    <button
      type="button"
      data-slot="calendar-day"
      data-selected={selected ? "" : undefined}
      data-range-middle={rangeMiddle ? "" : undefined}
      className={cn(
        DAY_CLASS,
        selected && !rangeMiddle && "bg-oe-brand-background-bold-primary text-oe-foreground-inverse hover:bg-oe-brand-background-bold-primary",
        rangeMiddle && "rounded-none bg-oe-interaction-hover-subtle text-oe-foreground-primary",
        rangeStart && "rounded-r-none",
        rangeEnd && "rounded-l-none",
        className,
      )}
      {...props}
    >
      {day.date.getDate()}
    </button>
  )
}

export { Calendar, CalendarDayButton }
