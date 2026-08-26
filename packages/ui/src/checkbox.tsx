"use client"

import * as React from "react"
import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"
import { RiCheckLine, RiSubtractLine } from "@remixicon/react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "./utils"

const checkboxVariants = cva(
  "group/checkbox inline-grid shrink-0 place-items-center outline-none transition-[background-color,border-color,box-shadow] focus-visible:ring-2 focus-visible:ring-oe-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-oe-background-primary data-[disabled]:cursor-not-allowed data-[disabled]:!border-oe-border-primary data-[disabled]:!bg-oe-background-disabled data-[disabled]:!text-oe-foreground-disabled data-[disabled]:data-[checked]:!border-transparent data-[disabled]:data-[checked]:!bg-oe-background-disabled-selected data-[disabled]:data-[checked]:!text-white data-[disabled]:data-[indeterminate]:!border-transparent data-[disabled]:data-[indeterminate]:!bg-oe-background-disabled-selected data-[disabled]:data-[indeterminate]:!text-white",
  {
    variants: {
      shape: {
        square: "rounded border border-oe-border-primary bg-oe-background-primary text-oe-foreground-inverse data-[checked]:border-oe-brand-background-bold-primary data-[checked]:bg-oe-brand-background-bold-primary data-[indeterminate]:border-oe-brand-background-bold-primary data-[indeterminate]:bg-oe-brand-background-bold-primary active:bg-oe-interaction-hover data-[checked]:active:bg-oe-brand-background-bold-primary data-[indeterminate]:active:bg-oe-brand-background-bold-primary",
        ghost: "rounded border border-transparent bg-transparent text-oe-foreground-placeholder data-[checked]:text-oe-brand-foreground-primary active:bg-oe-interaction-hover",
      },
    },
    defaultVariants: { shape: "square" },
  },
)

type CheckboxProps = CheckboxPrimitive.Root.Props & VariantProps<typeof checkboxVariants> & {
  className?: string
}

type CheckboxFieldProps = CheckboxProps & {
  label: React.ReactNode
  rightDescription?: React.ReactNode
  bottomDescription?: React.ReactNode
  leadingElement?: React.ReactNode
  trailingElement?: React.ReactNode
  isParent?: boolean
  layout?: "inline" | "block"
  flipped?: boolean
  checkboxClassName?: string
}

type CheckboxContainerProps = Omit<CheckboxFieldProps, "layout" | "shape">

function Checkbox({ className, indeterminate = false, shape = "square", disabled, ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      indeterminate={shape === "square" ? indeterminate : false}
      disabled={shape === "square" ? disabled : undefined}
      className={cn(
        checkboxVariants({ shape }),
        "size-4",
        className,
      )}
      {...props}
    >
      {shape === "ghost" ? (
        <RiCheckLine className="size-[15px]" aria-hidden="true" />
      ) : (
        <CheckboxPrimitive.Indicator className="grid place-items-center">
          {indeterminate ? <RiSubtractLine className="size-2.5" aria-hidden="true" /> : <RiCheckLine className="size-2.5" aria-hidden="true" />}
        </CheckboxPrimitive.Indicator>
      )}
    </CheckboxPrimitive.Root>
  )
}

function CheckboxField({ label, rightDescription, bottomDescription, leadingElement, trailingElement, isParent = false, layout = "inline", flipped = false, checkboxClassName, className, disabled, shape = "square", ...props }: CheckboxFieldProps) {
  const effectiveDisabled = shape === "square" ? disabled : false
  const labelId = React.useId()

  return (
    <label className={cn("flex min-h-oe-control-regular items-start gap-2 py-2", layout === "block" ? "w-full" : "w-fit", flipped && "flex-row-reverse", effectiveDisabled && "cursor-not-allowed", className)}>
      <Checkbox aria-labelledby={labelId} className={cn("mt-0.5", checkboxClassName)} disabled={effectiveDisabled} shape={shape} {...props} />
      <span className={cn("flex min-w-0 flex-col", layout === "block" && "flex-1") }>
        <span className="flex min-w-0 items-start gap-2">
          {leadingElement ? <span data-slot="checkbox-leading" className="mt-0.5 shrink-0">{leadingElement}</span> : null}
          <span className={cn("flex h-5 min-w-0 items-baseline gap-2 overflow-hidden", layout === "block" && !trailingElement && "flex-1") }>
            <span id={labelId} className={cn("shrink-0 text-sm leading-5 text-oe-foreground-primary", isParent ? "font-semibold" : "font-normal", effectiveDisabled && "text-oe-foreground-disabled")}>{label}</span>
            {rightDescription ? <span className={cn("min-w-0 truncate whitespace-nowrap text-xs leading-5 text-oe-foreground-tertiary", effectiveDisabled && "text-oe-foreground-disabled")}>{rightDescription}</span> : null}
          </span>
          {trailingElement ? <span data-slot="checkbox-trailing" className="flex h-5 shrink-0 items-center">{trailingElement}</span> : null}
        </span>
        {bottomDescription ? <span className={cn("mt-0.5 block text-xs leading-5 text-oe-foreground-tertiary", effectiveDisabled && "text-oe-foreground-disabled")}>{bottomDescription}</span> : null}
      </span>
    </label>
  )
}

function CheckboxContainer({ className, checkboxClassName, ...props }: CheckboxContainerProps) {
  return (
    <CheckboxField
      layout="block"
      shape="square"
      className={cn(
        "min-h-[64px] items-center gap-3 rounded-xl border border-oe-border-secondary bg-oe-background-primary px-4 py-3 transition-[background-color,border-color]",
        "[&:has([data-slot=checkbox][data-checked]:not([data-disabled]))]:border-[var(--brand-alpha-20)]",
        "[&:has([data-slot=checkbox][data-checked]:not([data-disabled]))]:bg-[var(--brand-alpha-08)]",
        className,
      )}
      checkboxClassName={cn("mt-0", checkboxClassName)}
      {...props}
    />
  )
}

export { Checkbox, CheckboxContainer, CheckboxField, checkboxVariants, type CheckboxContainerProps, type CheckboxFieldProps, type CheckboxProps }
