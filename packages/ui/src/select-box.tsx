"use client"

import * as React from "react"

import { Checkbox } from "./checkbox"
import { Radio, RadioGroup } from "./radio"
import { cn } from "./utils"

type SelectBoxSelectionMode = "single" | "multiple"
type SelectBoxTrailingElement = "radio" | "checkbox" | "none"
type SelectBoxColumns = number

type SelectBoxGroupValue = string | string[]

type SelectBoxGroupProps = {
  children: React.ReactNode
  selectionMode?: SelectBoxSelectionMode
  value?: SelectBoxGroupValue
  defaultValue?: SelectBoxGroupValue
  onValueChange?: (value: SelectBoxGroupValue) => void
  columns?: SelectBoxColumns
  trailingElement?: SelectBoxTrailingElement
  disabled?: boolean
  readOnly?: boolean
  ariaLabel?: string
  "aria-labelledby"?: string
  "aria-describedby"?: string
  className?: string
}

type SelectBoxProps = {
  value: string
  title: React.ReactNode
  description?: React.ReactNode
  leadingElement?: React.ReactNode
  disabled?: boolean
  className?: string
}

type SelectBoxContextValue = {
  selectionMode: SelectBoxSelectionMode
  selectedValue: SelectBoxGroupValue
  setSelectedValue: (value: string, checked: boolean) => void
  disabled: boolean
  readOnly: boolean
  trailingElement: SelectBoxTrailingElement
  stackLeadingElement: boolean
}

const SelectBoxContext = React.createContext<SelectBoxContextValue | null>(null)

function SelectBoxGroup({
  children,
  selectionMode = "single",
  value,
  defaultValue,
  onValueChange,
  columns = 1,
  trailingElement,
  disabled = false,
  readOnly = false,
  ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  className,
}: SelectBoxGroupProps) {
  const fallbackValue: SelectBoxGroupValue = selectionMode === "multiple" ? [] : ""
  const [uncontrolledValue, setUncontrolledValue] = React.useState<SelectBoxGroupValue>(defaultValue ?? fallbackValue)
  const selectedValue = value ?? uncontrolledValue
  const resolvedColumns = Math.max(1, Math.floor(columns))
  const resolvedTrailingElement = trailingElement === "none"
    ? "none"
    : selectionMode === "single"
      ? "radio"
      : "checkbox"

  const updateValue = React.useCallback((itemValue: string, checked: boolean) => {
    if (disabled || readOnly) return

    const nextValue = selectionMode === "multiple"
      ? checked
        ? Array.from(new Set([...(Array.isArray(selectedValue) ? selectedValue : []), itemValue]))
        : (Array.isArray(selectedValue) ? selectedValue : []).filter((currentValue) => currentValue !== itemValue)
      : itemValue

    if (value === undefined) setUncontrolledValue(nextValue)
    onValueChange?.(nextValue)
  }, [disabled, onValueChange, readOnly, selectedValue, selectionMode, value])

  const contextValue = React.useMemo<SelectBoxContextValue>(() => ({
    selectionMode,
    selectedValue,
    setSelectedValue: updateValue,
    disabled,
    readOnly,
    trailingElement: resolvedTrailingElement,
    stackLeadingElement: resolvedColumns > 1,
  }), [disabled, readOnly, resolvedColumns, resolvedTrailingElement, selectedValue, selectionMode, updateValue])

  const groupClassName = cn(
    "grid grid-cols-1 gap-2",
    resolvedColumns > 1 && "@min-[640px]:grid-cols-[repeat(var(--select-box-columns),minmax(0,1fr))]",
    className,
  )
  const groupStyle = { "--select-box-columns": resolvedColumns } as React.CSSProperties

  return (
    <SelectBoxContext.Provider value={contextValue}>
      {selectionMode === "single" ? (
        <RadioGroup
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-describedby={ariaDescribedBy}
          value={typeof selectedValue === "string" ? selectedValue : ""}
          onValueChange={(nextValue) => updateValue(String(nextValue), true)}
          disabled={disabled}
          readOnly={readOnly}
          className={groupClassName}
          style={groupStyle}
        >
          {children}
        </RadioGroup>
      ) : (
        <div role="group" aria-label={ariaLabel} aria-labelledby={ariaLabelledBy} aria-describedby={ariaDescribedBy} aria-disabled={disabled || undefined} className={groupClassName} style={groupStyle}>
          {children}
        </div>
      )}
    </SelectBoxContext.Provider>
  )
}

function SelectBox({
  value,
  title,
  description,
  leadingElement,
  disabled = false,
  className,
}: SelectBoxProps) {
  const context = React.useContext(SelectBoxContext)
  if (!context) throw new Error("SelectBox must be used inside SelectBoxGroup")

  const isDisabled = context.disabled || disabled
  const selected = context.selectionMode === "multiple"
    ? Array.isArray(context.selectedValue) && context.selectedValue.includes(value)
    : context.selectedValue === value
  const visuallyHiddenControl = context.trailingElement === "none"

  const selectionControl = context.selectionMode === "single" ? (
    <Radio
      value={value}
      disabled={isDisabled}
      readOnly={context.readOnly}
      className={cn("focus-visible:ring-0 focus-visible:ring-offset-0", visuallyHiddenControl && "absolute size-px opacity-0")}
    />
  ) : (
    <Checkbox
      checked={selected}
      disabled={isDisabled}
      readOnly={context.readOnly}
      onCheckedChange={(checked) => context.setSelectedValue(value, checked === true)}
      className={cn("focus-visible:ring-0 focus-visible:ring-offset-0", visuallyHiddenControl && "absolute size-px opacity-0")}
    />
  )

  return (
    <label
      data-slot="select-box"
      data-selected={selected ? "" : undefined}
      data-disabled={isDisabled ? "" : undefined}
      data-readonly={context.readOnly ? "" : undefined}
      className={cn(
        "relative flex cursor-pointer items-center gap-3 rounded-xl border border-oe-border-secondary bg-transparent px-4 py-3 text-left outline-none transition-[background-color,border-color,box-shadow] duration-150",
        "data-[selected]:border-[var(--brand-alpha-40)] data-[selected]:bg-[var(--brand-alpha-05)] data-[selected]:shadow-[inset_0_0_0_1px_var(--brand-alpha-40)]",
        "has-[:focus-visible]:!border-oe-focus-ring has-[:focus-visible]:!shadow-[inset_0_0_0_1px_var(--oe-focus-ring)]",
        "hover:bg-oe-interaction-hover-subtle data-[selected]:hover:bg-[var(--brand-alpha-05)]",
        "active:bg-oe-interaction-hover data-[selected]:active:bg-[var(--brand-alpha-05)]",
        "data-[disabled]:cursor-not-allowed data-[disabled]:border-oe-border-disabled data-[disabled]:bg-transparent data-[disabled]:shadow-none data-[disabled]:hover:bg-transparent",
        "data-[disabled]:data-[selected]:border-oe-border-disabled data-[disabled]:data-[selected]:bg-oe-background-disabled data-[disabled]:data-[selected]:shadow-none data-[disabled]:data-[selected]:hover:bg-oe-background-disabled",
        "data-[readonly]:cursor-default data-[readonly]:hover:bg-transparent data-[readonly]:active:bg-transparent",
        context.stackLeadingElement && "pt-4",
        className,
      )}
    >
      <span className={cn("flex min-w-0 flex-1", context.stackLeadingElement ? "flex-col items-start gap-2" : "items-center gap-3")}>
        {leadingElement ? <span data-slot="select-box-leading-element" className="flex shrink-0 items-center text-oe-foreground-tertiary">{leadingElement}</span> : null}
        <div data-slot="select-box-content" className="min-w-0 flex-1">
          <span className={cn("block text-sm font-medium leading-5 text-oe-foreground-primary", isDisabled && "text-oe-foreground-disabled")}>{title}</span>
          {description ? <span className={cn("mt-0.5 block text-xs leading-5 text-oe-foreground-tertiary", isDisabled && "text-oe-foreground-disabled")}>{description}</span> : null}
        </div>
      </span>
      <span data-slot="select-box-trailing-element" className={cn("relative flex size-5 shrink-0 items-center justify-center", visuallyHiddenControl && "absolute left-3 top-3 size-px")}>
        {selectionControl}
      </span>
    </label>
  )
}

export { SelectBox, SelectBoxGroup }
export type { SelectBoxColumns, SelectBoxGroupProps, SelectBoxProps, SelectBoxSelectionMode, SelectBoxTrailingElement }
