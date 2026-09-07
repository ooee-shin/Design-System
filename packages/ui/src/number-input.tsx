import * as React from "react"
import { RiAddLine, RiSubtractLine } from "@remixicon/react"
import { Tooltip } from "@base-ui/react/tooltip"

import { Input, type InputProps } from "./input"
import { cn } from "./utils"

type NumberInputAffixTone = "secondary" | "tertiary"

type NumberInputProps = Omit<
  InputProps,
  | "type"
  | "inputMode"
  | "value"
  | "defaultValue"
  | "onChange"
  | "leadingElement"
  | "trailingElement"
  | "clearable"
  | "clearLabel"
  | "onClear"
  | "onValueChange"
  | "layout"
  | "fixedWidth"
> & {
  value?: number
  defaultValue?: number
  min?: number
  max?: number
  step?: number
  hideControls?: boolean
  controlsPosition?: "trailing" | "split"
  allowNegative?: boolean
  decreaseLabel?: string
  increaseLabel?: string
  decreaseTooltip?: string
  increaseTooltip?: string
  prefixTone?: NumberInputAffixTone
  suffixTone?: NumberInputAffixTone
  onValueChange?: (value: number | undefined) => void
  onLimitReached?: (boundary: "min" | "max") => void
} & (
  | { layout?: "fill"; fixedWidth?: never }
  | { layout: "fixed"; fixedWidth: React.CSSProperties["width"] }
)

function clamp(value: number, min?: number, max?: number) {
  return Math.min(max ?? Number.POSITIVE_INFINITY, Math.max(min ?? Number.NEGATIVE_INFINITY, value))
}

function NumberInput({
  className,
  containerClassName,
  value,
  defaultValue,
  min,
  max,
  step = 1,
  hideControls = false,
  controlsPosition = "trailing",
  allowNegative = false,
  decreaseLabel = "Decrease value",
  increaseLabel = "Increase value",
  decreaseTooltip = "Decrease",
  increaseTooltip = "Increase",
  prefix,
  suffix,
  prefixTone = "secondary",
  suffixTone = "secondary",
  onValueChange,
  onLimitReached,
  disabled,
  readOnly,
  controlSize = "regular",
  layout = "fill",
  fixedWidth,
  ...props
}: NumberInputProps) {
  const controlled = value !== undefined
  const effectiveMin = allowNegative ? min : Math.max(0, min ?? 0)
  const [internalValue, setInternalValue] = React.useState<number | undefined>(() =>
    defaultValue === undefined ? undefined : clamp(defaultValue, effectiveMin, max),
  )
  const currentValue = controlled ? value : internalValue
  const decreaseDisabled = disabled || readOnly || (effectiveMin != null && currentValue != null && currentValue <= effectiveMin)
  const increaseDisabled = disabled || readOnly || (max != null && currentValue != null && currentValue >= max)

  function commit(nextValue: number | undefined) {
    if (!controlled) setInternalValue(nextValue)
    onValueChange?.(nextValue)
  }

  function update(direction: -1 | 1) {
    if (disabled || readOnly) return
    const base = currentValue ?? 0
    const attempted = base + direction * step
    const nextValue = clamp(attempted, effectiveMin, max)
    if (max != null && attempted > max) onLimitReached?.("max")
    if (effectiveMin != null && attempted < effectiveMin) onLimitReached?.("min")
    commit(nextValue)
  }

  const xlargeControls = controlSize === "xlarge"

  function controlButton(direction: -1 | 1) {
    const decrease = direction === -1
    const controlDisabled = decrease ? decreaseDisabled : increaseDisabled
    return (
      <Tooltip.Root>
        <Tooltip.Trigger
          render={<button type="button" disabled={controlDisabled} />}
          delay={150}
          aria-label={decrease ? decreaseLabel : increaseLabel}
          disabled={controlDisabled}
          onClick={() => update(direction)}
          className={cn(
            "grid place-items-center rounded-md text-oe-foreground-tertiary transition-colors hover:bg-oe-interaction-hover hover:text-oe-foreground-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-focus-ring disabled:pointer-events-none disabled:text-oe-foreground-disabled",
            xlargeControls ? "size-8" : "size-6",
          )}
        >
          {decrease ? <RiSubtractLine className="size-oe-icon-small" aria-hidden="true" /> : <RiAddLine className="size-oe-icon-small" aria-hidden="true" />}
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Positioner positionMethod="fixed" side="bottom" align="center" sideOffset={4} collisionPadding={8} collisionAvoidance={{ side: "flip", align: "shift" }}>
            <Tooltip.Popup className="text-oe-label z-50 w-max whitespace-nowrap rounded-lg bg-oe-background-bold-primary px-2 py-1.5 font-normal text-oe-foreground-inverse shadow-sm transition-[transform,opacity] duration-100 data-ending-style:opacity-0 data-starting-style:opacity-0">
              {decrease ? decreaseTooltip : increaseTooltip}
            </Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>
    )
  }

  return (
    <Input
      {...props}
      {...(layout === "fixed" ? { layout: "fixed" as const, fixedWidth } : { layout: "fill" as const })}
      type="number"
      inputMode="decimal"
      min={effectiveMin}
      max={max}
      step={step}
      prefix={prefix ? <span className={prefixTone === "tertiary" ? "text-oe-foreground-tertiary" : "text-oe-foreground-secondary"}>{prefix}</span> : undefined}
      suffix={suffix ? <span className={suffixTone === "tertiary" ? "text-oe-foreground-tertiary" : "text-oe-foreground-secondary"}>{suffix}</span> : undefined}
      controlSize={controlSize}
      value={currentValue ?? ""}
      disabled={disabled}
      readOnly={readOnly}
      onChange={(event) => {
        const raw = event.currentTarget.value
        if (raw === "" || raw === "-") {
          commit(undefined)
          return
        }
        const parsed = Number(raw)
        if (!Number.isFinite(parsed)) return
        if (max != null && parsed > max) onLimitReached?.("max")
        if (effectiveMin != null && parsed < effectiveMin) onLimitReached?.("min")
        commit(clamp(parsed, effectiveMin, max))
      }}
      leadingElement={!hideControls && controlsPosition === "split" ? <span className="-ml-1">{controlButton(-1)}</span> : undefined}
      trailingElement={hideControls ? undefined : controlsPosition === "split" ? <span className="-mr-1">{controlButton(1)}</span> : <span data-slot="number-input-controls" className={cn("-mr-1 flex shrink-0 items-center", xlargeControls ? "gap-1" : "gap-0.5")}>{controlButton(-1)}{controlButton(1)}</span>}
      className={cn("appearance-none tabular-nums [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none", controlsPosition === "split" && !hideControls && "text-center", className)}
      containerClassName={containerClassName}
    />
  )
}

export { NumberInput }
export type { NumberInputAffixTone, NumberInputProps }
