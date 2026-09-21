import { cva } from "class-variance-authority"

const selectionTriggerVariants = cva(
  // 목록이 열려 있는 동안 Trigger 에 Focus 와 같은 표시를 남긴다. 열리는 순간 초점은 팝업 안의
// 검색 칸으로 옮겨 가므로, 표시를 두지 않으면 조건이 여럿 선 줄에서 어느 것을 열어 둔 것인지
// 화면에 남지 않는다. 고른 값이 아니라 지금 쓰고 있는 컨트롤을 가리키는 표시라 brand 를 쓴다.
  "flex w-full min-w-0 items-center rounded-oe-control border text-left text-oe-foreground-primary transition-[border-color,box-shadow,background-color] focus-visible:border-oe-focus-ring focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-oe-focus-ring data-[popup-open]:border-oe-focus-ring data-[popup-open]:ring-1 data-[popup-open]:ring-oe-focus-ring disabled:cursor-not-allowed disabled:bg-oe-background-disabled disabled:text-oe-foreground-disabled data-[invalid]:border-oe-danger-border-primary data-[invalid]:ring-1 data-[invalid]:ring-oe-danger-border-primary",
  {
    variants: {
      variant: {
        outline: "border-oe-border-secondary bg-oe-background-primary",
        filled: "border-transparent bg-oe-background-secondary focus-visible:bg-oe-background-primary",
      },
      controlSize: {
        small: "h-oe-control-small gap-1.5 px-2.5 text-sm",
        regular: "h-oe-control-regular gap-2 px-3 text-sm",
        large: "h-oe-control-large gap-2 px-3 text-sm",
        xlarge: "h-oe-control-xlarge gap-2.5 px-4 text-base",
      },
    },
    defaultVariants: { variant: "outline", controlSize: "regular" },
  },
)

export { selectionTriggerVariants }
