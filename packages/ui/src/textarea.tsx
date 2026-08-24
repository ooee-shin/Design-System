import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "./utils"

const textareaContainerVariants = cva(
  "group/textarea flex min-h-[5.5rem] w-full min-w-0 items-stretch overflow-hidden rounded-lg border text-sm text-oe-foreground-primary transition-[border-color,box-shadow,background-color] focus-within:border-oe-focus-ring focus-within:ring-1 focus-within:ring-oe-focus-ring has-[[aria-invalid=true]]:border-oe-danger-border-primary has-[[aria-invalid=true]]:ring-1 has-[[aria-invalid=true]]:ring-oe-danger-border-primary has-[:disabled]:cursor-not-allowed has-[:disabled]:border-oe-border-disabled has-[:disabled]:bg-oe-background-disabled has-[:disabled]:text-oe-foreground-disabled",
  {
    variants: {
      variant: {
        outline: "border-oe-border-primary bg-oe-background-primary",
        filled: "border-transparent bg-oe-background-secondary focus-within:bg-oe-background-primary",
      },
    },
    defaultVariants: { variant: "outline" },
  },
)

type NativeTextareaProps = React.ComponentProps<"textarea">

type TextareaProps = NativeTextareaProps &
  VariantProps<typeof textareaContainerVariants> & {
    autoSize?: boolean
    resize?: boolean
    height?: number
    containerClassName?: string
  }

function Textarea({
  className,
  containerClassName,
  variant = "outline",
  autoSize = false,
  resize = false,
  height = 88,
  disabled,
  readOnly,
  ...props
}: TextareaProps) {
  const resolvedResize = !autoSize && resize

  return (
    <div data-slot="textarea-container" data-variant={variant} data-auto-size={autoSize} data-resize={resolvedResize} data-layout="fill" className={cn(textareaContainerVariants({ variant }), containerClassName)}>
      <textarea data-slot="textarea" style={autoSize ? undefined : { height: Math.max(86, height - 2) }} className={cn("min-h-[5.375rem] min-w-0 flex-1 overflow-y-auto bg-transparent px-3 py-2 leading-5 text-inherit outline-none [scrollbar-color:transparent_transparent] [scrollbar-gutter:stable] [scrollbar-width:thin] hover:[scrollbar-color:var(--oe-border-primary)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-oe-border-primary placeholder:text-oe-foreground-placeholder disabled:cursor-not-allowed disabled:text-oe-foreground-disabled read-only:cursor-default", autoSize ? "field-sizing-content resize-none overflow-y-hidden" : resolvedResize ? "resize-y" : "resize-none", className)} disabled={disabled} readOnly={readOnly} {...props} />
    </div>
  )
}

export { Textarea, textareaContainerVariants }
export type { TextareaProps }
