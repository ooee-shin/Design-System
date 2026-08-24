import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { RiCloseLine } from "@remixicon/react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "./utils"

const inputContainerVariants = cva(
  "group/input flex w-full min-w-0 items-center rounded-lg border text-oe-foreground-primary transition-[border-color,box-shadow,background-color] focus-within:border-oe-focus-ring focus-within:ring-1 focus-within:ring-oe-focus-ring has-[[aria-invalid=true]]:border-oe-danger-border-primary has-[[aria-invalid=true]]:ring-1 has-[[aria-invalid=true]]:ring-oe-danger-border-primary has-[:disabled]:cursor-not-allowed has-[:disabled]:border-oe-border-disabled has-[:disabled]:bg-oe-background-disabled has-[:disabled]:text-oe-foreground-disabled",
  {
    variants: {
      variant: {
        outline: "border-oe-border-primary bg-oe-background-primary",
        filled: "border-transparent bg-oe-background-secondary focus-within:bg-oe-background-primary",
      },
      controlSize: {
        small: "h-oe-control-small gap-1.5 px-2.5 text-sm",
        regular: "h-oe-control-regular gap-2 px-3 text-sm",
        large: "h-oe-control-large gap-2 px-3 text-sm",
        xlarge: "h-oe-control-xlarge gap-2.5 px-4 text-base",
      },
    },
    defaultVariants: {
      variant: "outline",
      controlSize: "regular",
    },
  },
)

type NativeInputProps = Omit<React.ComponentProps<typeof InputPrimitive>, "size" | "prefix">

type InputLayoutProps =
  | { layout?: "fill"; fixedWidth?: never }
  | { layout: "fixed"; fixedWidth: React.CSSProperties["width"] }

type InputProps = NativeInputProps &
  VariantProps<typeof inputContainerVariants> & {
    containerClassName?: string
    leadingElement?: React.ReactNode
    prefix?: React.ReactNode
    suffix?: React.ReactNode
    trailingElement?: React.ReactNode
    clearable?: boolean
    clearLabel?: string
    onClear?: () => void
  } & InputLayoutProps

function Input({
  className,
  containerClassName,
  variant = "outline",
  controlSize = "regular",
  layout = "fill",
  fixedWidth,
  leadingElement,
  prefix,
  suffix,
  trailingElement,
  clearable = false,
  clearLabel = "Clear input",
  onClear,
  disabled,
  readOnly,
  ...props
}: InputProps) {
  return (
    <div
      data-slot="input-container"
      data-variant={variant}
      data-size={controlSize}
      data-layout={layout}
      style={layout === "fixed" ? { width: fixedWidth } : undefined}
      className={cn(inputContainerVariants({ variant, controlSize }), layout === "fixed" ? "max-w-full shrink-0" : "w-full", containerClassName)}
    >
      {leadingElement ? <span data-slot="input-leading" className="flex shrink-0 items-center text-oe-foreground-tertiary [&_svg]:size-4">{leadingElement}</span> : null}
      {prefix ? <span data-slot="input-prefix" className="shrink-0 text-oe-foreground-secondary">{prefix}</span> : null}
      <InputPrimitive
        data-slot="input"
        className={cn("h-full min-w-0 flex-1 bg-transparent p-0 text-inherit outline-none placeholder:text-oe-foreground-placeholder disabled:cursor-not-allowed disabled:text-oe-foreground-disabled read-only:cursor-default", className)}
        disabled={disabled}
        readOnly={readOnly}
        {...props}
      />
      {clearable ? (
        <button type="button" data-slot="input-clear" aria-label={clearLabel} className="-mr-1 flex size-6 shrink-0 items-center justify-center rounded-md text-oe-foreground-tertiary opacity-0 invisible pointer-events-none transition-[color,background-color,opacity] group-focus-within/input:visible group-focus-within/input:pointer-events-auto group-focus-within/input:opacity-100 hover:bg-oe-interaction-hover hover:text-oe-foreground-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-focus-ring disabled:pointer-events-none" disabled={disabled || readOnly} onClick={onClear}>
          <RiCloseLine className="size-4" aria-hidden="true" />
        </button>
      ) : null}
      {suffix ? <span data-slot="input-suffix" className="shrink-0 text-oe-foreground-secondary">{suffix}</span> : null}
      {trailingElement ? <span data-slot="input-trailing" className="flex shrink-0 items-center text-oe-foreground-tertiary [&_svg]:size-4">{trailingElement}</span> : null}
    </div>
  )
}

export { Input, inputContainerVariants }
export type { InputProps }
