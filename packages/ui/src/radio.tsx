"use client"

import * as React from "react"
import { Radio as RadioPrimitive } from "@base-ui/react/radio"
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group"

import { cn } from "./utils"

type RadioProps = RadioPrimitive.Root.Props & {
  className?: string
  indicatorClassName?: string
}

type RadioFieldProps = RadioProps & {
  label: React.ReactNode
  rightDescription?: React.ReactNode
  bottomDescription?: React.ReactNode
  leadingElement?: React.ReactNode
  trailingElement?: React.ReactNode
  layout?: "inline" | "block"
  flipped?: boolean
  radioClassName?: string
}

type RadioContainerProps = Omit<RadioFieldProps, "layout">

type RadioGroupProps<Value = string> = RadioGroupPrimitive.Props<Value> & {
  className?: string
}

function Radio({ className, indicatorClassName, ...props }: RadioProps) {
  return (
    <RadioPrimitive.Root
      data-slot="radio"
      className={cn(
        "inline-grid size-4 shrink-0 place-items-center rounded-full border border-oe-border-primary bg-oe-background-primary outline-none transition-[background-color,border-color,box-shadow]",
        "data-[checked]:border-oe-brand-background-bold-primary data-[checked]:bg-oe-brand-background-bold-primary",
        "focus-visible:ring-2 focus-visible:ring-oe-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-oe-background-primary",
        "active:bg-oe-interaction-hover data-[checked]:active:bg-oe-brand-background-bold-primary",
        "data-[disabled]:cursor-not-allowed data-[disabled]:border-oe-border-primary data-[disabled]:bg-oe-background-disabled",
        "data-[disabled]:data-[checked]:border-oe-background-disabled-selected data-[disabled]:data-[checked]:bg-oe-background-disabled-selected",
        className,
      )}
      {...props}
    >
      <RadioPrimitive.Indicator
        data-slot="radio-indicator"
        className={cn(
          "size-2 rounded-full bg-oe-background-primary",
          "data-[disabled]:bg-oe-foreground-inverse",
          indicatorClassName,
        )}
      />
    </RadioPrimitive.Root>
  )
}

function RadioGroup<Value = string>({ className, ...props }: RadioGroupProps<Value>) {
  return <RadioGroupPrimitive className={cn(className)} {...props} />
}

function RadioField({ label, rightDescription, bottomDescription, leadingElement, trailingElement, layout = "inline", flipped = false, radioClassName, className, disabled, ...props }: RadioFieldProps) {
  return (
    <label className={cn("flex min-h-oe-control-regular items-start gap-2 py-2", layout === "block" ? "w-full" : "w-fit", flipped && "flex-row-reverse", disabled && "cursor-not-allowed", className)}>
      <Radio className={cn("mt-0.5", radioClassName)} disabled={disabled} {...props} />
      <span className={cn("flex min-w-0 flex-col", layout === "block" && "flex-1")}>
        <span className="flex min-w-0 items-start gap-2">
          {leadingElement ? <span data-slot="radio-leading" className="mt-0.5 shrink-0">{leadingElement}</span> : null}
          <span className={cn("flex h-5 min-w-0 items-baseline gap-2 overflow-hidden", layout === "block" && !trailingElement && "flex-1")}>
            <span className={cn("shrink-0 text-sm leading-5 font-normal text-oe-foreground-primary", disabled && "text-oe-foreground-disabled")}>{label}</span>
            {rightDescription ? <span className={cn("min-w-0 truncate whitespace-nowrap text-xs leading-5 text-oe-foreground-tertiary", disabled && "text-oe-foreground-disabled")}>{rightDescription}</span> : null}
          </span>
          {trailingElement ? <span data-slot="radio-trailing" className="flex h-5 shrink-0 items-center">{trailingElement}</span> : null}
        </span>
        {bottomDescription ? <span className={cn("mt-0.5 block text-xs leading-5 text-oe-foreground-tertiary", disabled && "text-oe-foreground-disabled")}>{bottomDescription}</span> : null}
      </span>
    </label>
  )
}

function RadioContainer({ className, radioClassName, ...props }: RadioContainerProps) {
  return (
    <RadioField
      layout="block"
      className={cn(
        "min-h-[64px] items-center gap-3 rounded-xl border border-oe-border-secondary bg-oe-background-primary px-4 py-3 transition-[background-color,border-color]",
        "[&:has([data-slot=radio][data-checked]:not([data-disabled]))]:border-[var(--brand-alpha-20)]",
        "[&:has([data-slot=radio][data-checked]:not([data-disabled]))]:bg-[var(--brand-alpha-08)]",
        className,
      )}
      radioClassName={cn("mt-0", radioClassName)}
      {...props}
    />
  )
}

export { Radio, RadioContainer, RadioField, RadioGroup }
export type { RadioContainerProps, RadioFieldProps, RadioGroupProps, RadioProps }
