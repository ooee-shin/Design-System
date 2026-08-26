import * as React from "react"

import { Input, type InputProps } from "./input"
import { cn } from "./utils"

type PartialMaskedInputProps = Omit<InputProps, "type" | "inputMode" | "maxLength" | "value" | "defaultValue" | "onChange" | "placeholder" | "suffix" | "layout" | "fixedWidth"> & {
  inputLength: number
  totalLength: number
  maskInput?: boolean
  value: string
  onValueChange: (value: string) => void
}

function PartialMaskedInput({
  inputLength,
  totalLength,
  maskInput = true,
  value,
  onValueChange,
  className,
  containerClassName,
  style,
  ...props
}: PartialMaskedInputProps) {
  const normalizedValue = value.replace(/\D/g, "").slice(0, inputLength)
  const visibleInputLength = Math.max(normalizedValue.length, 1)
  const placeholderInputLength = Math.max(inputLength - normalizedValue.length - (normalizedValue.length === 0 ? 1 : 0), 0)
  const fixedMaskLength = Math.max(totalLength - inputLength, 0)
  const inputWidth = `calc(${visibleInputLength}ch + ${Math.max(visibleInputLength - 1, 0) * 0.12}em)`
  const suffix = placeholderInputLength > 0 || fixedMaskLength > 0 ? (
    <span className="inline-flex items-center tracking-[0.12em]" aria-hidden="true">
      {placeholderInputLength > 0 ? <span className="text-oe-foreground-placeholder">{"•".repeat(placeholderInputLength)}</span> : null}
      {fixedMaskLength > 0 ? <span className={cn("text-oe-foreground-secondary", placeholderInputLength > 0 && "ml-0.5")}>{"•".repeat(fixedMaskLength)}</span> : null}
    </span>
  ) : undefined

  return (
    <Input
      {...props}
      type={maskInput ? "password" : "text"}
      inputMode="numeric"
      autoComplete="off"
      maxLength={inputLength}
      value={normalizedValue}
      onChange={(event) => onValueChange(event.target.value.replace(/\D/g, "").slice(0, inputLength))}
      placeholder="•"
      suffix={suffix}
      className={cn("flex-none p-0 tabular-nums tracking-[0.12em]", className)}
      containerClassName={cn("gap-0.5", containerClassName)}
      style={{ ...style, width: inputWidth }}
    />
  )
}

export { PartialMaskedInput }
export type { PartialMaskedInputProps }
