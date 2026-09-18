"use client"

import * as React from "react"

import { RiArrowDownSLine, RiArrowUpSLine } from "@remixicon/react"

import { cn } from "@/lib/utils"

/**
 * 관리자 웹의 목록이 쓰는 표다. 한 줄이 한 건이고, 줄을 누르면 그 건의 상세로 간다.
 *
 * 열 구성은 목록마다 다르므로 이 파일은 표의 뼈대만 갖는다. 어떤 열을 어떤 순서로 두는지는
 * 쓰는 화면이 정하고, 여기서는 모든 목록이 같아야 하는 것만 정한다. 줄 높이와 칸 여백, 머리줄의
 * 면, 줄을 가르는 선, 포인터를 얹었을 때의 면, 이미 옮겨져 더 볼 것이 없는 줄을 옅게 두는 처리가
 * 그것이다.
 *
 * 값은 가운데 정렬이 기본이다. 제목처럼 길이가 제각각인 글은 `align="start"` 로 왼쪽에 붙인다.
 */

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    // 관리자는 `lg`(1024px)까지만 대응하고 그보다 좁아지면 가로로 스크롤한다. 열이 여럿인 표는
    // 그 폭에서도 넘치므로, 화면 전체가 아니라 표만 자기 안에서 스크롤되게 둔다.
    //
    // 막대는 손잡이만 보인다. 규칙은 `globals.css` 의 `oe-scrollbar-bare` 가 갖는다.
    <div className="oe-scrollbar-bare w-full overflow-x-auto">
      <table
        data-slot="table"
        className={cn(
          // 열 폭을 내용이 정하지 않게 한다. 내용을 따르면 페이지를 옮길 때마다 글자 수에 따라
          // 열 경계가 움직여서, 같은 자리를 훑던 눈이 매번 열을 다시 찾는다. 폭은 각 열이
          // `width` 로 정하고, 정하지 않은 열이 남는 폭을 가져간다.
          "w-full table-fixed border-collapse text-sm whitespace-nowrap text-oe-foreground-primary",
          className,
        )}
        {...props}
      />
    </div>
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"thead">) {
  return <thead data-slot="table-head" className={className} {...props} />
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      // 마지막 줄의 아래 선은 두지 않는다. 표를 바닥으로 두를 때 그 경계와 겹쳐 두 겹이 된다.
      className={cn("[&>tr:last-child]:border-b-0", className)}
      {...props}
    />
  )
}

function TableRow({
  className,
  interactive = false,
  muted = false,
  selected = false,
  ...props
}: React.ComponentProps<"tr"> & {
  /** 줄 전체가 상세로 가는 길인지. 포인터를 얹으면 면이 생기고 커서가 손가락으로 바뀐다. */
  interactive?: boolean
  /** 여기서 더 볼 것이 없는 줄인지. 옮겨진 건처럼 목록에는 남되 뒤로 물러나야 하는 줄이다. */
  muted?: boolean
  /** 골라 둔 줄인지. 브랜드 색 가운데 가장 옅은 배경이 깔린다. */
  selected?: boolean
}) {
  return (
    <tr
      data-slot="table-row"
      data-muted={muted ? "" : undefined}
      data-selected={selected ? "" : undefined}
      className={cn(
        "border-b border-oe-border-secondary transition-colors",
        muted && "text-oe-foreground-tertiary",
        // 줄에 포인터를 얹은 것을 칸 안에서도 받을 수 있게 `group` 을 둔다. 줄 전체가 상세로
        // 가는 길이므로, 그 길을 대표하는 칸이 함께 반응해야 어디로 가는 줄인지 읽힌다.
        interactive && "group cursor-pointer",
        // 골라 둔 줄에는 포인터를 얹어도 면을 덧칠하지 않는다. 고른 것을 말하는 색과 지금
        // 가리키고 있다는 색이 같은 자리에서 겹치면 어느 쪽인지 갈리지 않는다.
        interactive && !selected && "hover:bg-oe-interaction-hover-subtle",
        selected && "bg-oe-brand-background-primary",
        className,
      )}
      {...props}
    />
  )
}

function TableHeaderCell({
  className,
  align = "center",
  width,
  sort,
  onSort,
  children,
  ...props
  // `align` 은 th 와 td 가 원래 갖고 있는 HTML 속성이라 그대로 두면 두 타입이 겹쳐서 값이
  // `center` 하나로 좁혀진다. 원래 것을 덜어내고 이 표가 쓰는 뜻으로 다시 정한다.
}: Omit<React.ComponentProps<"th">, "align"> & {
  align?: "start" | "center"
  /** 이 열의 폭. 주지 않은 열이 남는 폭을 나눠 갖는다. */
  width?: number
  /** 이 열이 지금 정렬 기준이면 그 방향. 정렬할 수 있지만 기준이 아니면 `null` 이다. */
  sort?: "asc" | "desc" | null
  /** 정렬 기준을 이 열로 옮기거나 방향을 뒤집는다. 주면 그 열의 머리글이 눌린다. */
  onSort?: () => void
}) {
  const sortable = Boolean(onSort)
  return (
    <th
      data-slot="table-header-cell"
      scope="col"
      style={width ? { width } : undefined}
      aria-sort={sortable ? (sort === "asc" ? "ascending" : sort === "desc" ? "descending" : "none") : undefined}
      className={cn(
        // 머리줄의 아래 선도 줄을 가르는 선과 같은 색을 쓴다. 머리줄은 회색 면과 굵은 글자로
        // 이미 값 줄과 갈리므로, 선까지 진하게 두면 같은 것을 두 번 말하면서 표에서 가장 진한
        // 선이 값이 아닌 자리에 생긴다.
        "border-b border-oe-border-secondary bg-oe-background-secondary px-3 py-2.5 font-medium text-oe-foreground-secondary",
        align === "start" ? "text-left" : "text-center",
        className,
      )}
      {...props}
    >
      {sortable ? (
        // 누르는 것은 칸이 아니라 머리글이다. 칸 전체를 버튼으로 두면 열이 넓을 때 이름에서
        // 한참 떨어진 빈 자리도 눌려서, 어디를 눌러 정렬한 것인지 되짚기 어렵다.
        <button
          type="button"
          onClick={onSort}
          className={cn(
            "group/sort inline-flex items-center gap-0.5 rounded-md outline-none transition-colors focus-visible:ring-2 focus-visible:ring-oe-focus-ring",
            sort ? "text-oe-foreground-primary" : "hover:text-oe-foreground-primary",
          )}
        >
          {children}
          {/* 두 방향을 늘 함께 세워 둔다. 이 열이 정렬되는 열이라는 것과 어느 쪽으로 정렬할 수
              있는지가 누르기 전에 보이고, 지금 걸린 방향만 브랜드 색을 가져가 나머지와 갈린다.
              화살표 하나를 돌려 쓰면 지금 방향은 보이지만 반대로도 정렬된다는 것이 보이지
              않는다.

              위아래를 한 덩어리로 읽히게 하려고 두 아이콘을 2px 씩 겹친다. 아이콘 상자에 든
              여백까지 그대로 두면 두 화살표가 멀어져 서로 다른 것을 말하는 것처럼 보이고, 더
              겹치면 두 선이 맞붙어 하나의 도형처럼 보인다. */}
          <span aria-hidden="true" className="flex shrink-0 flex-col">
            <RiArrowUpSLine
              className={cn(
                "-mb-0.5 size-oe-icon-xsmall transition-colors",
                sort === "asc" ? "text-oe-brand-foreground-primary" : "text-oe-foreground-disabled",
              )}
            />
            <RiArrowDownSLine
              className={cn(
                "-mt-0.5 size-oe-icon-xsmall transition-colors",
                sort === "desc" ? "text-oe-brand-foreground-primary" : "text-oe-foreground-disabled",
              )}
            />
          </span>
        </button>
      ) : (
        children
      )}
    </th>
  )
}

function TableCell({
  className,
  align = "center",
  ...props
}: Omit<React.ComponentProps<"td">, "align"> & { align?: "start" | "center" }) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        // 글자색은 표가 정하고 여기서 다시 얹지 않는다. 옮겨진 줄을 옅게 두는 처리가 줄에
        // 걸려 있는데, 칸이 자기 색을 가지면 그 처리가 칸에 가려진다.
        "px-3 py-2.5",
        align === "start" ? "text-left" : "text-center",
        className,
      )}
      {...props}
    />
  )
}

export { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell }
