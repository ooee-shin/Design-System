import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { RiCloseLine } from "@remixicon/react"
import { Tooltip } from "@base-ui/react/tooltip"

import { cn } from "./utils"

type ChipTone = "secondary" | "tertiary"
type ChipShape = "rounded" | "circle"
type ChipSize = "xsmall" | "small" | "regular" | "large" | "xlarge"

const chipVariants = cva(
  "inline-flex max-w-full shrink-0 items-center border border-oe-border-secondary bg-oe-background-primary text-oe-foreground-secondary transition-[background-color,border-color,color] duration-[60ms]",
  {
    variants: {
      controlSize: {
        xsmall: "h-oe-control-xsmall gap-1 px-2 text-oe-label font-normal",
        small: "h-oe-control-small gap-1 px-2.5 text-sm font-medium",
        regular: "h-oe-control-regular gap-1.5 px-3 text-sm font-medium",
        large: "h-oe-control-large gap-1.5 px-3 text-sm font-medium",
        xlarge: "h-oe-control-xlarge gap-2 px-4 text-sm font-medium",
      },
      shape: {
        rounded: "rounded-oe-control",
        circle: "rounded-full",
      },
      iconOnly: {
        true: "justify-center px-0",
        false: "",
      },
    },
    defaultVariants: { controlSize: "regular", shape: "circle", iconOnly: false },
  },
)

const iconOnlyWidth: Record<ChipSize, string> = {
  xsmall: "w-oe-control-xsmall",
  small: "w-oe-control-small",
  regular: "w-oe-control-regular",
  large: "w-oe-control-large",
  xlarge: "w-oe-control-xlarge",
}

// 아이콘은 자기 상자를 거의 채우고 글자는 좌우에 여유를 갖는다. 한쪽 변이 아이콘으로
// 끝나고 반대 변이 글자로 끝나면 글자 쪽이 답답해 보인다. 그때 글자가 닿는 변에만 여백을
// 더한다. 아이콘 쪽을 줄이지 않으므로 어느 변도 기준보다 좁아지지 않는다.
const textSidePadding: Record<ChipSize, { left: string; right: string }> = {
  xsmall: { left: "pl-2.5", right: "pr-2.5" },
  small: { left: "pl-3", right: "pr-3" },
  regular: { left: "pl-4", right: "pr-4" },
  large: { left: "pl-4", right: "pr-4" },
  xlarge: { left: "pl-5", right: "pr-5" },
}

// 아이콘은 Label 과 같은 위계(secondary)나 한 단계 옅은 위계(tertiary)를 고를 수 있다.
// Active 에서도 같은 관계를 brand 계열 안에서 유지한다.
const toneClassName: Record<ChipTone, { default: string; active: string }> = {
  secondary: { default: "text-oe-foreground-secondary", active: "text-oe-brand-foreground-primary" },
  tertiary: { default: "text-oe-foreground-tertiary", active: "text-oe-brand-foreground-secondary" },
}

const iconSize: Record<ChipSize, string> = {
  xsmall: "[&_svg]:size-oe-icon-xsmall",
  small: "[&_svg]:size-oe-icon-small",
  regular: "[&_svg]:size-oe-icon-small",
  large: "[&_svg]:size-oe-icon-medium",
  xlarge: "[&_svg]:size-oe-icon-medium",
}

// `iconOnly` 는 Label 유무로 내부에서 정하므로 밖에서 넘기지 못하게 뺀다. 넘길 수 있으면
// 값이 무시되는 Property 가 타입에만 남는다.
type ChipBaseProps = Omit<VariantProps<typeof chipVariants>, "iconOnly"> & {
  prefix?: string
  leadingElement?: React.ReactNode
  leadingTone?: ChipTone
  trailingElement?: React.ReactNode
  trailingTone?: ChipTone
  active?: boolean
  className?: string
}

type ChipContentProps = {
  children?: string
  ariaLabel?: string
}

// 전체를 누르는 Chip 과 삭제 버튼을 가진 Chip 을 함께 만들지 않는다. Container 전체가
// Button 인데 안에 또 Button 을 두면 어느 것을 눌렀는지 알 수 없다. Select Box 의
// 「내부에 다른 조작 요소를 두지 않기」와 같은 이유다.
type ChipActionProps =
  | { onClick?: () => void; onRemove?: never; removeLabel?: never; removeTooltip?: never }
  | { onClick?: never; onRemove: () => void; removeLabel: string; removeTooltip?: string }

type ChipProps = ChipBaseProps & ChipContentProps & ChipActionProps

function Chip({
  children,
  prefix,
  leadingElement,
  leadingTone = "secondary",
  trailingElement,
  trailingTone = "secondary",
  controlSize = "regular",
  shape,
  active = false,
  ariaLabel,
  className,
  onClick,
  onRemove,
  removeLabel,
  removeTooltip = "Remove",
}: ChipProps) {
  const iconOnly = !children

  // chip.md 는 Icon only 에서 ariaLabel 이 필수라고 정한다. 글자가 없으면 읽을 이름이
  // 남지 않는다. 타입으로 가르면 Label 유무가 런타임에 바뀌는 호출부가 조합마다 분기를
  // 만들어야 하므로 개발 중 경고로 알린다.
  if (process.env.NODE_ENV !== "production" && iconOnly && !ariaLabel) {
    console.warn("Label 이 없는 Chip 에는 ariaLabel 이 필요합니다. 아이콘만 남으면 읽을 이름이 없습니다.")
  }
  const size = controlSize ?? "regular"
  const leftEndsWithIcon = Boolean(leadingElement)
  const rightEndsWithIcon = Boolean(trailingElement) || Boolean(onRemove)
  const oneSideOnly = leftEndsWithIcon !== rightEndsWithIcon
  const shared = cn(
    chipVariants({ controlSize, shape, iconOnly }),
    !iconOnly && oneSideOnly && !leftEndsWithIcon && textSidePadding[size].left,
    !iconOnly && oneSideOnly && !rightEndsWithIcon && textSidePadding[size].right,
    iconOnly && iconOnlyWidth[size],
    iconSize[size],
    active && "border-[var(--brand-alpha-40)] bg-[var(--brand-alpha-05)] text-oe-brand-foreground-primary",
    className,
  )
  const content = (
    <>
      {leadingElement ? <span data-slot="chip-leading-element" className={cn("flex shrink-0 items-center", active ? toneClassName[leadingTone].active : toneClassName[leadingTone].default)} aria-hidden="true">{leadingElement}</span> : null}
      {prefix && !iconOnly ? <span data-slot="chip-prefix" className={cn("shrink-0", active ? "text-oe-brand-foreground-secondary" : "text-oe-foreground-tertiary")}>{prefix}</span> : null}
      {children ? <span data-slot="chip-label" className="min-w-0 truncate">{children}</span> : null}
      {trailingElement ? <span data-slot="chip-trailing-element" className={cn("flex shrink-0 items-center", active ? toneClassName[trailingTone].active : toneClassName[trailingTone].default)} aria-hidden="true">{trailingElement}</span> : null}
    </>
  )

  if (onRemove) {
    return (
      <span data-slot="chip" data-active={active ? "" : undefined} aria-label={iconOnly ? ariaLabel : undefined} className={shared}>
        {content}
        <Tooltip.Root>
          <Tooltip.Trigger
            render={<button type="button" data-slot="chip-remove" />}
            delay={150}
            aria-label={removeLabel}
            onClick={onRemove}
            className={cn("grid shrink-0 cursor-pointer place-items-center rounded-md text-oe-foreground-tertiary outline-none transition-colors hover:bg-oe-interaction-hover hover:text-oe-foreground-primary active:bg-oe-interaction-hover focus-visible:ring-2 focus-visible:ring-oe-focus-ring", size === "small" ? "size-4" : "size-5")}
          >
            <RiCloseLine aria-hidden="true" />
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Positioner positionMethod="fixed" side="bottom" align="center" sideOffset={4} collisionPadding={8} collisionAvoidance={{ side: "flip", align: "shift" }}>
              <Tooltip.Popup className="text-oe-label z-50 w-max whitespace-nowrap rounded-lg bg-oe-background-bold-primary px-2 py-1.5 font-normal text-oe-foreground-inverse shadow-sm transition-[transform,opacity] duration-100 data-ending-style:opacity-0 data-starting-style:opacity-0">
                {removeTooltip}
              </Tooltip.Popup>
            </Tooltip.Positioner>
          </Tooltip.Portal>
        </Tooltip.Root>
      </span>
    )
  }

  if (onClick) {
    return (
      <button
        type="button"
        data-slot="chip"
        data-active={active ? "" : undefined}
        aria-pressed={active}
        aria-label={iconOnly ? ariaLabel : undefined}
        onClick={onClick}
        className={cn(
          shared,
          "cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-oe-focus-ring",
          "hover:bg-oe-interaction-hover-subtle active:bg-oe-interaction-hover",
          // 선택된 상태에는 Hover 와 Pressed 하이라이트를 중첩하지 않는다. Active 가 우선한다.
          active && "hover:bg-[var(--brand-alpha-05)] active:bg-[var(--brand-alpha-05)]",
        )}
      >
        {content}
      </button>
    )
  }

  return (
    <span data-slot="chip" data-active={active ? "" : undefined} aria-label={iconOnly ? ariaLabel : undefined} className={shared}>
      {content}
    </span>
  )
}

export { Chip }
export type { ChipProps, ChipShape, ChipSize, ChipTone }
