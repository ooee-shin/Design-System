import * as React from "react"
import type { VariantProps } from "class-variance-authority"

import { inputContainerVariants } from "./input"
import { cn } from "./utils"

type InputButtonLayoutProps =
  | { layout?: "fill"; fixedWidth?: never }
  | { layout: "fixed"; fixedWidth: React.CSSProperties["width"] }

// prefix 는 button 의 native 속성이므로, Property 로 제공하지 않는다는 것이 드러나도록 함께 걷어낸다.
type InputButtonProps = Omit<React.ComponentProps<"button">, "children" | "value" | "prefix"> &
  VariantProps<typeof inputContainerVariants> & {
    value?: string
    placeholder?: string
    leadingElement?: React.ReactNode
    trailingElement?: React.ReactNode
    readOnly?: boolean
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
  trailingElement,
  disabled,
  readOnly,
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
      data-readonly={readOnly ? "true" : undefined}
      aria-disabled={readOnly ? true : undefined}
      data-has-value={hasValue ? "true" : "false"}
      style={layout === "fixed" ? { width: fixedWidth } : undefined}
      disabled={disabled}
      className={cn(
        inputContainerVariants({ variant, controlSize }),
        "cursor-pointer text-left outline-none disabled:cursor-not-allowed",
        readOnly && "cursor-default",
        layout === "fixed" ? "max-w-full shrink-0" : "w-full",
        invalid && "border-oe-danger-border-primary ring-1 ring-oe-danger-border-primary",
        className,
      )}
      {...props}
      onClick={readOnly ? undefined : props.onClick}
      onKeyDown={readOnly ? (event) => { if (event.key === "Enter" || event.key === " ") event.preventDefault() } : props.onKeyDown}
    >
      {leadingElement ? <span data-slot="input-button-leading" className="flex shrink-0 items-center text-oe-foreground-tertiary [&_svg]:size-4">{leadingElement}</span> : null}
      <span data-slot="input-button-value" className={cn("min-w-0 flex-1 truncate", hasValue ? "text-oe-foreground-primary" : "text-oe-foreground-placeholder")}>{hasValue ? value : placeholder}</span>
      {trailingElement ? <span data-slot="input-button-trailing" className="flex shrink-0 items-center text-oe-foreground-tertiary [&_svg]:size-4">{trailingElement}</span> : null}
    </button>
  )
}

export { InputButton }
export type { InputButtonProps }
