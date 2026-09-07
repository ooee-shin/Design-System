import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { RiCloseLine } from "@remixicon/react"

import { cn } from "./utils"

type ChipVariant = "outline" | "filled"
type ChipShape = "rounded" | "circle"
type ChipSize = "small" | "regular" | "large" | "xlarge"

const chipVariants = cva(
  "inline-flex max-w-full shrink-0 items-center border text-sm font-medium transition-[background-color,border-color,color] duration-[60ms] data-[disabled]:cursor-not-allowed data-[disabled]:border-oe-border-disabled data-[disabled]:bg-transparent data-[disabled]:text-oe-foreground-disabled",
  {
    variants: {
      variant: {
        outline: "border-oe-border-primary bg-oe-background-primary text-oe-foreground-secondary",
        filled: "border-transparent bg-oe-background-secondary text-oe-foreground-secondary",
      },
      controlSize: {
        small: "h-oe-control-small gap-1 px-2.5",
        regular: "h-oe-control-regular gap-1.5 px-3",
        large: "h-oe-control-large gap-1.5 px-3",
        xlarge: "h-oe-control-xlarge gap-2 px-4",
      },
      shape: {
        rounded: "rounded-[8px]",
        circle: "rounded-full",
      },
      iconOnly: {
        true: "justify-center px-0",
        false: "",
      },
    },
    defaultVariants: { variant: "outline", controlSize: "regular", shape: "rounded", iconOnly: false },
  },
)

const iconOnlyWidth: Record<ChipSize, string> = {
  small: "w-oe-control-small",
  regular: "w-oe-control-regular",
  large: "w-oe-control-large",
  xlarge: "w-oe-control-xlarge",
}

const iconSize: Record<ChipSize, string> = {
  small: "[&_svg]:size-oe-icon-small",
  regular: "[&_svg]:size-oe-icon-small",
  large: "[&_svg]:size-oe-icon-medium",
  xlarge: "[&_svg]:size-oe-icon-medium",
}

type ChipBaseProps = VariantProps<typeof chipVariants> & {
  children?: string
  leadingElement?: React.ReactNode
  trailingElement?: React.ReactNode
  active?: boolean
  disabled?: boolean
  ariaLabel?: string
  className?: string
}

// 전체를 누르는 Chip 과 삭제 버튼을 가진 Chip 을 함께 만들지 않는다. Container 전체가
// Button 인데 안에 또 Button 을 두면 어느 것을 눌렀는지 알 수 없다. Select Box 의
// 「내부에 다른 조작 요소를 두지 않기」와 같은 이유다.
type ChipProps =
  | (ChipBaseProps & { onClick?: () => void; onRemove?: never; removeLabel?: never })
  | (ChipBaseProps & { onClick?: never; onRemove: () => void; removeLabel: string })

function Chip({
  children,
  leadingElement,
  trailingElement,
  variant,
  controlSize = "regular",
  shape,
  active = false,
  disabled = false,
  ariaLabel,
  className,
  onClick,
  onRemove,
  removeLabel,
}: ChipProps) {
  const iconOnly = !children
  const size = controlSize ?? "regular"
  const shared = cn(
    chipVariants({ variant, controlSize, shape, iconOnly }),
    iconOnly && iconOnlyWidth[size],
    iconSize[size],
    active && !disabled && "border-[var(--brand-alpha-40)] bg-[var(--brand-alpha-05)] text-oe-foreground-primary",
    className,
  )
  const content = (
    <>
      {leadingElement ? <span data-slot="chip-leading-element" className="flex shrink-0 items-center" aria-hidden="true">{leadingElement}</span> : null}
      {children ? <span data-slot="chip-label" className="min-w-0 truncate">{children}</span> : null}
      {trailingElement ? <span data-slot="chip-trailing-element" className="flex shrink-0 items-center" aria-hidden="true">{trailingElement}</span> : null}
    </>
  )

  if (onRemove) {
    return (
      <span data-slot="chip" data-active={active ? "" : undefined} data-disabled={disabled ? "" : undefined} aria-label={ariaLabel} className={shared}>
        {content}
        <button
          type="button"
          data-slot="chip-remove"
          aria-label={removeLabel}
          disabled={disabled}
          onClick={onRemove}
          className={cn("-mr-1 grid shrink-0 place-items-center rounded-md text-oe-foreground-tertiary outline-none transition-colors hover:bg-oe-interaction-hover hover:text-oe-foreground-primary focus-visible:ring-2 focus-visible:ring-oe-focus-ring disabled:pointer-events-none", size === "small" ? "size-4" : "size-5")}
        >
          <RiCloseLine aria-hidden="true" />
        </button>
      </span>
    )
  }

  if (onClick) {
    return (
      <button
        type="button"
        data-slot="chip"
        data-active={active ? "" : undefined}
        data-disabled={disabled ? "" : undefined}
        aria-pressed={active}
        aria-label={iconOnly ? ariaLabel : undefined}
        disabled={disabled}
        onClick={onClick}
        className={cn(shared, "outline-none hover:bg-oe-interaction-hover focus-visible:ring-2 focus-visible:ring-oe-focus-ring disabled:pointer-events-none", active && !disabled && "hover:bg-[var(--brand-alpha-05)]")}
      >
        {content}
      </button>
    )
  }

  return (
    <span data-slot="chip" data-active={active ? "" : undefined} data-disabled={disabled ? "" : undefined} aria-label={ariaLabel} className={shared}>
      {content}
    </span>
  )
}

export { Chip }
export type { ChipProps, ChipShape, ChipSize, ChipVariant }
