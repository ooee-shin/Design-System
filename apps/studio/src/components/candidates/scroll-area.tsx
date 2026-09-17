"use client"

import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area"

import { cn } from "@/lib/utils"

/**
 * 스크롤 막대를 콘텐츠 위에 겹쳐 그리는 스크롤 영역이다.
 *
 * 브라우저가 주는 막대는 자리를 차지하거나 아예 없거나 둘 중 하나다. 자리를 차지하면 그 안의
 * 선이 막대 앞에서 멈추고 한쪽 여백만 넓어지며, 막대가 필요할 때만 생기면 내용의 폭이 그때마다
 * 흔들린다. 그래서 막대를 직접 그린다. 자리를 차지하지 않으므로 선은 끝까지 가고 폭도 변하지
 * 않으며, 포인터를 얹거나 스크롤하는 동안에만 손잡이가 드러난다.
 */
function ScrollArea({
  className,
  viewportClassName,
  children,
  ...props
}: ScrollAreaPrimitive.Root.Props & { viewportClassName?: string }) {
  return (
    <ScrollAreaPrimitive.Root data-slot="scroll-area" className={cn("relative", className)} {...props}>
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        className={cn("size-full overscroll-contain", viewportClassName)}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>

      {/* 손잡이는 평소 보이지 않다가 포인터를 얹거나 스크롤하는 동안 나타난다. 사라질 때만
          늦춰서, 스크롤을 멈춘 직후에 곧바로 없어지지 않게 한다. */}
      <ScrollAreaPrimitive.Scrollbar
        data-slot="scroll-area-scrollbar"
        orientation="vertical"
        className="m-1 flex w-1.5 justify-center opacity-0 transition-opacity delay-300 duration-200 data-hovering:opacity-100 data-hovering:delay-0 data-scrolling:opacity-100 data-scrolling:delay-0"
      >
        <ScrollAreaPrimitive.Thumb
          data-slot="scroll-area-thumb"
          className="w-full rounded-full bg-oe-border-primary"
        />
      </ScrollAreaPrimitive.Scrollbar>
    </ScrollAreaPrimitive.Root>
  )
}

export { ScrollArea }
