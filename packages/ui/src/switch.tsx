"use client"

import * as React from "react"
import { Switch as SwitchPrimitive } from "@base-ui/react/switch"

import { cn } from "./utils"

type SwitchProps = SwitchPrimitive.Root.Props & {
  className?: string
  thumbClassName?: string
  controlSize?: "small" | "medium" | "large"
}

type SwitchFieldProps = SwitchProps & {
  label: React.ReactNode
  labelPosition?: "left" | "right"
  switchClassName?: string
}

const switchSizeClasses = {
  small: "h-4 w-[26px]",
  medium: "h-6 w-[38px]",
  large: "h-8 w-[52px]",
} as const

const thumbSizeClasses = {
  small: "size-3 translate-x-0.5 data-[checked]:translate-x-3",
  medium: "size-5 translate-x-0.5 data-[checked]:translate-x-4",
  large: "size-[26px] translate-x-[3px] data-[checked]:translate-x-[23px]",
} as const

const fieldSizeClasses = {
  small: { root: "min-h-6 gap-1.5", label: "text-[length:var(--text-oe-label)] leading-[var(--text-oe-label--line-height)]" },
  medium: { root: "min-h-6 gap-2", label: "text-sm leading-5" },
  large: { root: "min-h-8 gap-2.5", label: "text-base leading-6" },
} as const

function Switch({ className, thumbClassName, controlSize = "medium", ...props }: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={controlSize}
      className={cn(
        "inline-flex shrink-0 cursor-pointer items-center rounded-full bg-oe-background-control-off outline-none ring-1 ring-inset ring-oe-background-control-off transition-[background-color,box-shadow]",
        "data-[checked]:bg-oe-info-background-bold-primary data-[checked]:ring-transparent",
        "focus-visible:[outline-style:solid] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-oe-focus-ring",
        "data-[disabled]:cursor-not-allowed data-[disabled]:bg-oe-background-control-disabled data-[disabled]:ring-transparent data-[disabled]:!transition-[background-color,box-shadow]",
        "data-[disabled]:data-[checked]:bg-oe-background-control-disabled",
        switchSizeClasses[controlSize],
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "block rounded-full bg-oe-background-primary shadow-sm transition-[translate,background-color]",
          "data-[disabled]:bg-oe-background-disabled-selected data-[disabled]:data-[checked]:bg-oe-background-disabled-selected data-[disabled]:!transition-[background-color]",
          thumbSizeClasses[controlSize],
          thumbClassName,
        )}
      />
    </SwitchPrimitive.Root>
  )
}

function SwitchField({ label, labelPosition = "right", switchClassName, className, disabled, controlSize = "medium", "aria-label": ariaLabel, "aria-labelledby": ariaLabelledby, ...props }: SwitchFieldProps) {
  const sizeClasses = fieldSizeClasses[controlSize]
  const generatedLabelId = React.useId()
  const accessibleLabelledby = ariaLabel || ariaLabelledby ? ariaLabelledby : generatedLabelId

  return (
    <label className={cn("inline-flex w-fit cursor-pointer items-center", sizeClasses.root, labelPosition === "left" && "flex-row-reverse", disabled && "cursor-not-allowed", className)}>
      <Switch aria-label={ariaLabel} aria-labelledby={accessibleLabelledby} className={cn(switchClassName)} controlSize={controlSize} disabled={disabled} {...props} />
      <span id={generatedLabelId} className={cn("font-normal text-oe-foreground-primary", sizeClasses.label, disabled && "text-oe-foreground-disabled")}>{label}</span>
    </label>
  )
}

export { Switch, SwitchField }
export type { SwitchFieldProps, SwitchProps }
