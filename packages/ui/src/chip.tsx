import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { RiCloseLine } from "@remixicon/react"
import { Tooltip } from "@base-ui/react/tooltip"

import { cn } from "./utils"

type ChipTone = "secondary" | "tertiary"
type ChipShape = "rounded" | "circle"
type ChipSize = "compact" | "xsmall" | "small" | "regular" | "large" | "xlarge"

const chipVariants = cva(
  "inline-flex max-w-full shrink-0 items-center border border-oe-border-secondary bg-oe-background-primary text-oe-foreground-secondary transition-[background-color,border-color,color] duration-[60ms]",
  {
    variants: {
      controlSize: {
        // 컨트롤 줄에 끼지 않고 글자 옆에 붙는 크기다. 뜻과 쓰는 자리는 interaction.md 의
        // 「Compact」가 갖는다. 나머지 단계와 달리 컨트롤 높이 scale 을 따르지 않는다.
        compact: "h-oe-compact gap-0.5 px-1.5 text-oe-label font-normal",
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
  compact: "w-oe-compact",
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
  compact: { left: "pl-2", right: "pr-2" },
  xsmall: { left: "pl-2.5", right: "pr-2.5" },
  small: { left: "pl-3", right: "pr-3" },
  regular: { left: "pl-4", right: "pr-4" },
  large: { left: "pl-4", right: "pr-4" },
  xlarge: { left: "pl-5", right: "pr-5" },
}

// 고른 칩은 어두운 Neutral surface 를 채우고 글자를 inverse 로 쓴다. 칩은 면을 칠해 선택을 알리는
// 요소이므로 `interaction.md` 의 「선택 상태」가 정한 대로 brand 를 쓰지 않는다. brand 를 옅게 까는
// 채움을 함께 두고 화면이 고르게 했었는데, 그러면 고른 값과 Focus 와 Brand action 이 같은 색조로
// 번져 무엇이 지목된 것인지 색으로 갈리지 않으므로 걷어냈다.
//
// surface 는 `oe-background-bold-primary` 다. Button 의 뉴트럴 fill 이 `neutral-600` 인 것과 달리
// 한참 진한 단계이므로, 고른 칩이 뉴트럴 Button 과 같은 모양으로 보이지 않는다.
const activeSurfaceClassName = "border-transparent bg-oe-background-bold-primary text-oe-foreground-inverse"

// 선택된 상태에는 Hover 와 Pressed 하이라이트를 중첩하지 않으므로, 자기 배경을 그대로 붙들어 둔다.
const activeHoldClassName = "hover:bg-oe-background-bold-primary active:bg-oe-background-bold-primary"

// 아이콘은 Label 과 같은 위계(secondary)나 한 단계 옅은 위계(tertiary)를 고를 수 있다. 고른 칩에서도
// 같은 관계를 inverse 계열 안에서 지킨다.
const toneClassName: Record<ChipTone, { default: string; active: string }> = {
  secondary: {
    default: "text-oe-foreground-secondary",
    active: "text-oe-foreground-inverse",
  },
  tertiary: {
    default: "text-oe-foreground-tertiary",
    active: "text-oe-foreground-inverse-secondary",
  },
}

const iconSize: Record<ChipSize, string> = {
  compact: "[&_svg]:size-oe-icon-xsmall",
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

  // Label 이 있는 Chip 도 이름을 보탤 수 있다. 「2」처럼 짧은 Label 은 그 자체로 무엇을 하는
  // 자리인지 말하지 못하기 때문이다. 다만 **보이는 글자를 포함하는 이름만** 받는다. 보이는
  // 글자와 읽히는 이름이 갈리면 화면을 보며 말하는 사람과 듣는 사람이 같은 것을 가리키지
  // 못한다. 포함하지 않는 이름은 붙이지 않고 개발 중에 알린다.
  const namesTheLabel = iconOnly || !children || !ariaLabel || ariaLabel.includes(children)
  if (process.env.NODE_ENV !== "production" && !namesTheLabel) {
    console.warn(`Chip 의 ariaLabel 은 화면에 보이는 Label 을 포함해야 합니다. Label "${children}" 이 "${ariaLabel}" 에 없어 이름을 붙이지 않았습니다.`)
  }
  const accessibleName = namesTheLabel ? ariaLabel : undefined
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
    active && activeSurfaceClassName,
    className,
  )
  const content = (
    <>
      {leadingElement ? <span data-slot="chip-leading-element" className={cn("flex shrink-0 items-center", active ? toneClassName[leadingTone].active : toneClassName[leadingTone].default)} aria-hidden="true">{leadingElement}</span> : null}
      {prefix && !iconOnly ? <span data-slot="chip-prefix" className={cn("shrink-0", active ? toneClassName.tertiary.active : toneClassName.tertiary.default)}>{prefix}</span> : null}
      {children ? <span data-slot="chip-label" className="min-w-0 truncate">{children}</span> : null}
      {trailingElement ? <span data-slot="chip-trailing-element" className={cn("flex shrink-0 items-center", active ? toneClassName[trailingTone].active : toneClassName[trailingTone].default)} aria-hidden="true">{trailingElement}</span> : null}
    </>
  )

  if (onRemove) {
    return (
      <span data-slot="chip" data-shape={shape ?? "circle"} data-size={size} data-active={active ? "" : undefined} aria-label={accessibleName} className={shared}>
        {content}
        <Tooltip.Root>
          <Tooltip.Trigger
            render={<button type="button" data-slot="chip-remove" />}
            delay={150}
            aria-label={removeLabel}
            onClick={onRemove}
            // 어두운 surface 에서는 Hover 층을 얹지 않고 글자 위계만 올린다. 뉴트럴 Hover 층이
            // black alpha 라서 그 위에서는 보이지 않고, 밝은 alpha 층은 아직 token 이 없다.
            className={cn(
              "grid shrink-0 cursor-pointer place-items-center rounded-md outline-none transition-colors focus-visible:ring-2 focus-visible:ring-oe-focus-ring",
              active
                ? "text-oe-foreground-inverse-secondary hover:text-oe-foreground-inverse"
                : "text-oe-foreground-tertiary hover:bg-oe-interaction-hover hover:text-oe-foreground-primary active:bg-oe-interaction-hover",
              size === "small" || size === "compact" ? "size-4" : "size-5",
            )}
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
        data-shape={shape ?? "circle"}
        data-size={size}
        data-active={active ? "" : undefined}
        aria-pressed={active}
        aria-label={accessibleName}
        onClick={onClick}
        className={cn(
          shared,
          "cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-oe-focus-ring",
          "hover:bg-oe-interaction-hover-subtle active:bg-oe-interaction-hover",
          // 선택된 상태에는 Hover 와 Pressed 하이라이트를 중첩하지 않는다. Active 가 우선한다.
          active && activeHoldClassName,
        )}
      >
        {content}
      </button>
    )
  }

  return (
    <span data-slot="chip" data-shape={shape ?? "circle"} data-size={size} data-active={active ? "" : undefined} aria-label={accessibleName} className={shared}>
      {content}
    </span>
  )
}

export { Chip }
export type { ChipProps, ChipShape, ChipSize, ChipTone }
