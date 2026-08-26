import * as React from "react"
import type { VariantProps } from "class-variance-authority"

import { inputContainerVariants } from "./input"
import { cn } from "./utils"

type InputButtonLayoutProps =
  | { layout?: "fill"; fixedWidth?: never }
  | { layout: "fixed"; fixedWidth: React.CSSProperties["width"] }

type InputButtonProps = Omit<React.ComponentProps<"button">, "children" | "value" | "prefix"> &
  VariantProps<typeof inputContainerVariants> & {
    value?: string
    placeholder?: string
    leadingElement?: React.ReactNode
    prefix?: string
    suffix?: string
    trailingElement?: React.ReactNode
  } & InputButtonLayoutProps

function InputButton({
  className,
  variant = "outline",
  controlSize = "regular",
  layout = "fill",
  fixedWidth,
  value,
  placeholder = "Select an option",
  leadingElement,
  prefix,
  suffix,
  trailingElement,
  disabled,
  type = "button",
  ...props
}: InputButtonProps) {
  const hasValue = Boolean(value)
  const invalid = props["aria-invalid"] === true || props["aria-invalid"] === "true"

  return (
    <button
      type={type}
      data-slot="input-button"
      data-variant={variant}
      data-size={controlSize}
      data-layout={layout}
      data-disabled={disabled ? "true" : undefined}
      data-has-value={hasValue ? "true" : "false"}
      style={layout === "fixed" ? { width: fixedWidth } : undefined}
      disabled={disabled}
      className={cn(
        inputContainerVariants({ variant, controlSize }),
        "cursor-pointer text-left outline-none disabled:cursor-not-allowed",
        layout === "fixed" ? "max-w-full shrink-0" : "w-full",
        invalid && "border-oe-danger-border-primary ring-1 ring-oe-danger-border-primary",
        className,
      )}
      {...props}
    >
      {leadingElement ? <span data-slot="input-button-leading" className="flex shrink-0 items-center text-oe-foreground-tertiary [&_svg]:size-4">{leadingElement}</span> : null}
      {prefix ? <span data-slot="input-button-prefix" className="shrink-0 text-oe-foreground-secondary">{prefix}</span> : null}
      <span data-slot="input-button-value" className={cn("min-w-0 flex-1 truncate", hasValue ? "text-oe-foreground-primary" : "text-oe-foreground-placeholder")}>{hasValue ? value : placeholder}</span>
      {suffix ? <span data-slot="input-button-suffix" className="shrink-0 text-oe-foreground-secondary">{suffix}</span> : null}
      {trailingElement ? <span data-slot="input-button-trailing" className="flex shrink-0 items-center text-oe-foreground-tertiary [&_svg]:size-4">{trailingElement}</span> : null}
    </button>
  )
}

export { InputButton }
export type { InputButtonProps }
