import * as React from "react"

import { Input, type InputProps } from "./input"
import { cn } from "./utils"

type PartialMaskedInputProps = Omit<InputProps, "type" | "inputMode" | "maxLength" | "value" | "defaultValue" | "onChange" | "placeholder" | "suffix" | "layout" | "fixedWidth"> & {
  inputLength: number
  totalLength: number
  value: string
  onValueChange: (value: string) => void
}

function PartialMaskedInput({
  inputLength,
  totalLength,
  value,
  onValueChange,
  className,
  containerClassName,
  style,
  ...props
}: PartialMaskedInputProps) {
  const fixedMaskLength = Math.max(totalLength - inputLength, 0)
  const inputWidth = `calc(${inputLength}ch + ${Math.max(inputLength - 1, 0) * 0.12}em)`

  return (
    <Input
      {...props}
      type="password"
      inputMode="numeric"
      autoComplete="off"
      maxLength={inputLength}
      value={value}
      onChange={(event) => onValueChange(event.target.value.replace(/\D/g, "").slice(0, inputLength))}
      placeholder={"•".repeat(inputLength)}
      suffix={fixedMaskLength > 0 ? <span className="tracking-[0.12em] text-oe-foreground-secondary" aria-hidden="true">{"•".repeat(fixedMaskLength)}</span> : undefined}
      className={cn("flex-none p-0 tabular-nums tracking-[0.12em]", className)}
      containerClassName={cn("gap-0", containerClassName)}
      style={{ ...style, width: inputWidth }}
    />
  )
}

export { PartialMaskedInput }
export type { PartialMaskedInputProps }
