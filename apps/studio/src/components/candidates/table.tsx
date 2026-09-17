"use client"

import * as React from "react"

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
    // 관리자는 `lg`(1024px)까지만 대응하고 그보다 좁아지면 가로로 스크롤한다. 열이 열 개인 표는
    // 그 폭에서도 넘치므로, 화면 전체가 아니라 표만 자기 안에서 스크롤되게 둔다.
    <div className="w-full overflow-x-auto">
      <table
        data-slot="table"
        className={cn(
          "w-full border-collapse text-sm whitespace-nowrap text-oe-foreground-primary",
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
  ...props
}: React.ComponentProps<"tr"> & {
  /** 줄 전체가 상세로 가는 길인지. 포인터를 얹으면 면이 생기고 커서가 손가락으로 바뀐다. */
  interactive?: boolean
  /** 여기서 더 볼 것이 없는 줄인지. 옮겨진 건처럼 목록에는 남되 뒤로 물러나야 하는 줄이다. */
  muted?: boolean
}) {
  return (
    <tr
      data-slot="table-row"
      data-muted={muted ? "" : undefined}
      className={cn(
        "border-b border-oe-border-secondary transition-colors",
        muted && "text-oe-foreground-tertiary",
        interactive && "cursor-pointer hover:bg-oe-interaction-hover-subtle",
        className,
      )}
      {...props}
    />
  )
}

function TableHeaderCell({
  className,
  align = "center",
  ...props
}: React.ComponentProps<"th"> & { align?: "start" | "center" }) {
  return (
    <th
      data-slot="table-header-cell"
      scope="col"
      className={cn(
        // 머리줄은 아래 경계선을 값 줄보다 진하게 두어 제목과 값이 한 덩어리로 읽히지 않게 한다.
        "border-b border-oe-border-primary bg-oe-background-secondary px-3 py-2.5 font-medium text-oe-foreground-secondary",
        align === "start" ? "text-left" : "text-center",
        className,
      )}
      {...props}
    />
  )
}

function TableCell({
  className,
  align = "center",
  ...props
}: React.ComponentProps<"td"> & { align?: "start" | "center" }) {
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
