import { cva } from "class-variance-authority"

const selectionTriggerVariants = cva(
  "flex w-full min-w-0 items-center rounded-oe-control border text-left text-oe-foreground-primary transition-[border-color,box-shadow,background-color] focus-visible:border-oe-focus-ring focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-oe-focus-ring disabled:cursor-not-allowed disabled:bg-oe-background-disabled disabled:text-oe-foreground-disabled data-[invalid]:border-oe-danger-border-primary data-[invalid]:ring-1 data-[invalid]:ring-oe-danger-border-primary",
  {
    variants: {
      variant: {
        outline: "border-oe-border-primary bg-oe-background-primary",
        filled: "border-transparent bg-oe-background-secondary focus-visible:bg-oe-background-primary",
      },
      controlSize: {
        small: "h-oe-control-small gap-1.5 px-2.5 text-sm",
        regular: "h-oe-control-regular gap-2 px-3 text-sm",
        large: "h-oe-control-large gap-2 px-3 text-sm",
        xlarge: "h-oe-control-xlarge gap-2.5 px-4 text-base",
      },
    },
    defaultVariants: { variant: "outline", controlSize: "regular" },
  },
)

export { selectionTriggerVariants }
