"use client"

import * as React from "react"
import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"
import { RiCheckLine, RiSubtractLine } from "@remixicon/react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "./utils"

const filledIndicatorClasses = "border border-oe-border-primary bg-oe-background-primary text-oe-foreground-inverse data-[checked]:border-oe-brand-background-bold-primary data-[checked]:bg-oe-brand-background-bold-primary data-[indeterminate]:border-oe-brand-background-bold-primary data-[indeterminate]:bg-oe-brand-background-bold-primary data-[disabled]:border-oe-border-primary data-[disabled]:bg-oe-background-disabled data-[disabled]:text-oe-foreground-disabled data-[disabled]:data-[checked]:border-transparent data-[disabled]:data-[checked]:bg-oe-background-disabled-selected data-[disabled]:data-[checked]:text-white data-[disabled]:data-[indeterminate]:border-transparent data-[disabled]:data-[indeterminate]:bg-oe-background-disabled-selected data-[disabled]:data-[indeterminate]:text-white"

const filledCheckboxClasses = "data-[checked]:[&>[data-slot=checkbox-indicator]]:border-oe-brand-background-bold-primary data-[checked]:[&>[data-slot=checkbox-indicator]]:bg-oe-brand-background-bold-primary data-[indeterminate]:[&>[data-slot=checkbox-indicator]]:border-oe-brand-background-bold-primary data-[indeterminate]:[&>[data-slot=checkbox-indicator]]:bg-oe-brand-background-bold-primary data-[disabled]:[&>[data-slot=checkbox-indicator]]:border-oe-border-primary data-[disabled]:[&>[data-slot=checkbox-indicator]]:bg-oe-background-disabled data-[disabled]:[&>[data-slot=checkbox-indicator]]:text-oe-foreground-disabled data-[disabled]:data-[checked]:[&>[data-slot=checkbox-indicator]]:border-transparent data-[disabled]:data-[checked]:[&>[data-slot=checkbox-indicator]]:bg-oe-background-disabled-selected data-[disabled]:data-[checked]:[&>[data-slot=checkbox-indicator]]:text-white data-[disabled]:data-[indeterminate]:[&>[data-slot=checkbox-indicator]]:border-transparent data-[disabled]:data-[indeterminate]:[&>[data-slot=checkbox-indicator]]:bg-oe-background-disabled-selected data-[disabled]:data-[indeterminate]:[&>[data-slot=checkbox-indicator]]:text-white"

const checkboxIndicatorVariants = cva(
  "inline-grid size-4 shrink-0 place-items-center transition-[background-color,border-color,color]",
  {
    variants: {
      shape: {
        square: cn("rounded-none", filledIndicatorClasses),
        rounded: cn("rounded", filledIndicatorClasses),
        ghost: "rounded border border-transparent bg-transparent text-oe-foreground-placeholder data-[checked]:text-oe-brand-foreground-primary",
      },
    },
    defaultVariants: { shape: "rounded" },
  },
)

const checkboxVariants = cva(
  "group/checkbox inline-grid size-4 shrink-0 place-items-center outline-none focus-visible:ring-2 focus-visible:ring-oe-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-oe-background-primary data-[disabled]:cursor-not-allowed",
  {
    variants: {
      shape: {
        square: cn("rounded-none", filledCheckboxClasses),
        rounded: cn("rounded", filledCheckboxClasses),
        ghost: "rounded data-[checked]:[&>[data-slot=checkbox-indicator]]:text-oe-brand-foreground-primary",
      },
    },
    defaultVariants: { shape: "rounded" },
  },
)

type CheckboxProps = CheckboxPrimitive.Root.Props & VariantProps<typeof checkboxVariants> & {
  className?: string
}

type CheckboxIndicatorProps = VariantProps<typeof checkboxIndicatorVariants> & {
  checked?: boolean
  indeterminate?: boolean
  disabled?: boolean
  className?: string
  children?: React.ReactNode
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

function CheckboxIndicator({ checked = false, indeterminate = false, disabled = false, shape = "rounded", className, children }: CheckboxIndicatorProps) {
  return (
    <span
      aria-hidden="true"
      data-slot="checkbox-indicator"
      data-checked={checked || indeterminate ? "" : undefined}
      data-indeterminate={indeterminate ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
      className={cn(checkboxIndicatorVariants({ shape }), className)}
    >
      {children ?? (shape === "ghost" ? (
        <RiCheckLine className="size-[15px]" />
      ) : indeterminate ? (
        <RiSubtractLine className="size-2.5" />
      ) : (
        <RiCheckLine data-slot="checkbox-indicator-check" className={cn("size-2.5", checked ? "opacity-100" : "opacity-0 group-data-[checked]/checkbox:opacity-100")} />
      ))}
    </span>
  )
}

function Checkbox({ className, indeterminate = false, shape = "rounded", disabled, readOnly, ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      indeterminate={shape !== "ghost" ? indeterminate : false}
      disabled={shape !== "ghost" ? disabled : undefined}
      className={cn(
        checkboxVariants({ shape }),
        !readOnly && shape !== "ghost" && "active:[&>[data-slot=checkbox-indicator]]:bg-oe-interaction-hover data-[checked]:active:[&>[data-slot=checkbox-indicator]]:bg-oe-brand-background-bold-primary data-[indeterminate]:active:[&>[data-slot=checkbox-indicator]]:bg-oe-brand-background-bold-primary",
        className,
      )}
      readOnly={readOnly}
      {...props}
    >
      <CheckboxIndicator indeterminate={indeterminate} shape={shape} />
    </CheckboxPrimitive.Root>
  )
}

function CheckboxFieldBase({ label, rightDescription, bottomDescription, leadingElement, trailingElement, isParent = false, layout = "inline", flipped = false, checkboxClassName, className, disabled, readOnly, shape = "rounded", ...props }: CheckboxFieldProps) {
  const effectiveDisabled = shape !== "ghost" ? disabled : false
  const labelId = React.useId()

  return (
    <label className={cn(
      "flex min-h-oe-control-regular items-start gap-2 rounded-md bg-transparent px-2 py-2 transition-colors duration-[60ms]",
      !readOnly && "[&:not(:has([data-slot=checkbox][data-disabled])):hover]:bg-oe-interaction-hover-subtle",
      layout === "block" ? "w-full" : "w-fit",
      flipped && "flex-row-reverse",
      effectiveDisabled && "cursor-not-allowed",
      className,
    )}>
      <Checkbox aria-labelledby={labelId} className={cn("mt-0.5", checkboxClassName)} disabled={effectiveDisabled} readOnly={readOnly} shape={shape} {...props} />
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

function CheckboxField(props: CheckboxFieldProps) {
  return <CheckboxFieldBase {...props} />
}

export { Checkbox, CheckboxField, CheckboxIndicator, checkboxIndicatorVariants, checkboxVariants, type CheckboxFieldProps, type CheckboxIndicatorProps, type CheckboxProps }
