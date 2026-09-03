import type { ReactNode } from "react"
import { RiCloseLine } from "@remixicon/react"

import { cn } from "./utils"

type ChipCommonProps = {
  onRemove: () => void
  removeLabel: string
  className?: string
}

type LabelChipProps = ChipCommonProps & {
  children: string
  leadingElement?: ReactNode
  ariaLabel?: string
}

type IconOnlyChipProps = ChipCommonProps & {
  children?: never
  leadingElement: ReactNode
  ariaLabel: string
}

type ChipProps = LabelChipProps | IconOnlyChipProps

function Chip({ children, leadingElement, ariaLabel, onRemove, removeLabel, className }: ChipProps) {
  return (
    <span aria-label={ariaLabel} className={cn("inline-flex h-oe-chip-default max-w-full items-center gap-1 rounded-[8px] border border-oe-border-primary bg-oe-background-primary px-2 text-oe-label font-medium text-oe-foreground-secondary", !children && "px-1.5", className)}>
      {leadingElement ? <span className="flex shrink-0 items-center [&_svg]:size-3.5" aria-hidden="true">{leadingElement}</span> : null}
      {children ? <span data-slot="chip-label" className="min-w-0 truncate text-oe-label!">{children}</span> : null}
      <button type="button" aria-label={removeLabel} onClick={onRemove} className="-mr-1 grid size-4 shrink-0 place-items-center rounded-md text-oe-foreground-tertiary outline-none hover:bg-oe-interaction-hover hover:text-oe-foreground-primary focus-visible:ring-1 focus-visible:ring-oe-focus-ring">
        <RiCloseLine className="size-3.5" aria-hidden="true" />
      </button>
    </span>
  )
}

export { Chip }
export type { ChipProps }
