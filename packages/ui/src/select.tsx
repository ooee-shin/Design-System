"use client"

import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"
import { RiArrowDownSLine, RiCheckLine } from "@remixicon/react"
import { type VariantProps } from "class-variance-authority"

import { selectionTriggerVariants } from "./selection-trigger"
import { cn } from "./utils"

type SelectOption = {
  value: string
  label: string
  disabled?: boolean
  leadingElement?: React.ReactNode
  description?: React.ReactNode
}

type SelectOptionGroup = {
  label: string
  options: SelectOption[]
}

type SelectLayoutProps =
  | { layout?: "fill"; fixedWidth?: never }
  | { layout: "fixed"; fixedWidth: React.CSSProperties["width"] }

type SelectItemsProps =
  | { options: SelectOption[]; groups?: never }
  | { options?: never; groups: SelectOptionGroup[] }

type SelectProps = VariantProps<typeof selectionTriggerVariants> &
  SelectLayoutProps & {
    value?: string | null
    defaultValue?: string | null
    onValueChange?: (value: string | null) => void
    placeholder?: string
    id?: string
    ariaLabel?: string
    "aria-describedby"?: string
    disabled?: boolean
    readOnly?: boolean
    invalid?: boolean
    required?: boolean
    name?: string
    className?: string
    leadingElement?: React.ReactNode
  } & SelectItemsProps

type MultiSelectProps = Omit<SelectProps, "value" | "defaultValue" | "onValueChange"> & {
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  valueDisplay?: "summary" | "count"
  selectedSummaryLabel?: (firstLabel: string, remainingCount: number) => React.ReactNode
  selectedCountLabel?: (selectedCount: number) => React.ReactNode
}

function Select({
  options,
  groups,
  value,
  defaultValue,
  onValueChange,
  placeholder = "Select an option",
  id,
  ariaLabel,
  "aria-describedby": ariaDescribedBy,
  disabled = false,
  readOnly = false,
  invalid = false,
  required = false,
  name,
  variant = "outline",
  controlSize = "regular",
  layout = "fill",
  fixedWidth,
  className,
  leadingElement,
}: SelectProps) {
  const resolvedOptions = options ?? groups?.flatMap((group) => group.options) ?? []
  const paddingX = optionPaddingX[controlSize ?? "regular"]
  const rootItems = resolvedOptions.map((option) => ({ value: option.value, label: option.label }))

  return (
    <SelectPrimitive.Root
      items={rootItems}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      name={name}
    >
      <SelectPrimitive.Trigger
        data-slot="select-trigger"
        data-variant={variant}
        data-size={controlSize}
        data-invalid={invalid ? "" : undefined}
        data-layout={layout}
        id={id}
        aria-invalid={invalid || undefined}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        style={layout === "fixed" ? { width: fixedWidth } : undefined}
        className={cn(selectionTriggerVariants({ variant, controlSize }), layout === "fixed" && "max-w-full shrink-0", className)}
      >
        <SelectPrimitive.Value className="flex min-w-0 flex-1 items-center gap-2.5 truncate">
          {(selectedValue: string | null) => {
            const option = resolvedOptions.find((item) => item.value === selectedValue) ?? null
            return option ? <>{leadingElement ? <span className="flex shrink-0 items-center text-oe-foreground-tertiary [&_svg]:size-4">{leadingElement}</span> : null}<span className="min-w-0 truncate">{option.label}</span></> : <span className="min-w-0 truncate text-oe-foreground-placeholder">{placeholder}</span>
          }}
        </SelectPrimitive.Value>
        <SelectPrimitive.Icon className="flex shrink-0 items-center text-oe-foreground-tertiary data-[popup-open]:rotate-180">
          <RiArrowDownSLine className="size-4 transition-transform" aria-hidden="true" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Positioner align="start" sideOffset={4} alignItemWithTrigger={false} className="z-50">
          <SelectPrimitive.Popup className="w-[var(--anchor-width)] max-h-[min(20rem,var(--available-height))] max-w-[var(--available-width)] overflow-hidden rounded-lg border border-oe-border-secondary bg-oe-background-primary text-sm text-oe-foreground-primary shadow-lg outline-none">
            <SelectPrimitive.List className="max-h-[15.5rem] overflow-x-hidden overflow-y-auto p-1 [scrollbar-color:transparent_transparent] [scrollbar-width:thin] hover:[scrollbar-color:var(--oe-border-primary)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-oe-border-primary">
              {groups ? groups.map((group, groupIndex) => (
                <React.Fragment key={group.label}>
                  {groupIndex > 0 ? <SelectPrimitive.Separator className="my-1.5 h-px bg-oe-border-secondary" /> : null}
                  <SelectPrimitive.Group>
                    <SelectPrimitive.GroupLabel className={cn("py-1.5 text-[11px] font-medium text-oe-foreground-tertiary", paddingX)}>{group.label}</SelectPrimitive.GroupLabel>
                    {group.options.map((option) => renderOption(option, paddingX))}
                  </SelectPrimitive.Group>
                </React.Fragment>
              )) : resolvedOptions.map((option) => renderOption(option, paddingX))}
            </SelectPrimitive.List>
          </SelectPrimitive.Popup>
        </SelectPrimitive.Positioner>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}

function MultiSelect({
  options,
  groups,
  value,
  defaultValue,
  onValueChange,
  placeholder = "Select options",
  id,
  ariaLabel,
  "aria-describedby": ariaDescribedBy,
  disabled = false,
  readOnly = false,
  invalid = false,
  required = false,
  name,
  variant = "outline",
  controlSize = "regular",
  layout = "fill",
  fixedWidth,
  className,
  leadingElement,
  valueDisplay = "summary",
  selectedSummaryLabel = (firstLabel, remainingCount) => remainingCount > 0 ? `${firstLabel} +${remainingCount}` : firstLabel,
  selectedCountLabel = (selectedCount) => `${selectedCount} selected`,
}: MultiSelectProps) {
  const resolvedOptions = options ?? groups?.flatMap((group) => group.options) ?? []
  const paddingX = optionPaddingX[controlSize ?? "regular"]
  const rootItems = resolvedOptions.map((option) => ({ value: option.value, label: option.label }))

  return (
    <SelectPrimitive.Root
      items={rootItems}
      multiple
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      name={name}
    >
      <SelectPrimitive.Trigger
        data-slot="select-trigger"
        data-selection-mode="multiple"
        data-variant={variant}
        data-size={controlSize}
        data-invalid={invalid ? "" : undefined}
        data-layout={layout}
        id={id}
        aria-invalid={invalid || undefined}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        style={layout === "fixed" ? { width: fixedWidth } : undefined}
        className={cn(selectionTriggerVariants({ variant, controlSize }), layout === "fixed" && "max-w-full shrink-0", className)}
      >
        <SelectPrimitive.Value className="flex min-w-0 flex-1 items-center gap-2.5 truncate">
          {(selectedValues: string[]) => {
            const selectedOptions = selectedValues.flatMap((selectedValue) => {
              const option = resolvedOptions.find((item) => item.value === selectedValue)
              return option ? [option] : []
            })
            if (selectedOptions.length === 0) return <span className="min-w-0 truncate text-oe-foreground-placeholder">{placeholder}</span>
            const representative = selectedOptions[0]
            return <>{leadingElement ? <span className="flex shrink-0 items-center text-oe-foreground-tertiary [&_svg]:size-4">{leadingElement}</span> : null}<span className="min-w-0 truncate">{valueDisplay === "count" ? selectedCountLabel(selectedOptions.length) : selectedSummaryLabel(representative.label, selectedOptions.length - 1)}</span></>
          }}
        </SelectPrimitive.Value>
        <SelectPrimitive.Icon className="flex shrink-0 items-center text-oe-foreground-tertiary data-[popup-open]:rotate-180">
          <RiArrowDownSLine className="size-4 transition-transform" aria-hidden="true" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Positioner align="start" sideOffset={4} alignItemWithTrigger={false} className="z-50">
          <SelectPrimitive.Popup className="w-[var(--anchor-width)] max-h-[min(20rem,var(--available-height))] max-w-[var(--available-width)] overflow-hidden rounded-lg border border-oe-border-secondary bg-oe-background-primary text-sm text-oe-foreground-primary shadow-lg outline-none">
            <SelectPrimitive.List className="max-h-[15.5rem] overflow-x-hidden overflow-y-auto p-1 [scrollbar-color:transparent_transparent] [scrollbar-width:thin] hover:[scrollbar-color:var(--oe-border-primary)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-oe-border-primary">
              {groups ? groups.map((group, groupIndex) => (
                <React.Fragment key={group.label}>
                  {groupIndex > 0 ? <SelectPrimitive.Separator className="my-1.5 h-px bg-oe-border-secondary" /> : null}
                  <SelectPrimitive.Group>
                    <SelectPrimitive.GroupLabel className={cn("py-1.5 text-[11px] font-medium text-oe-foreground-tertiary", paddingX)}>{group.label}</SelectPrimitive.GroupLabel>
                    {group.options.map((option) => renderOption(option, paddingX))}
                  </SelectPrimitive.Group>
                </React.Fragment>
              )) : resolvedOptions.map((option) => renderOption(option, paddingX))}
            </SelectPrimitive.List>
          </SelectPrimitive.Popup>
        </SelectPrimitive.Positioner>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}

/** Trigger 의 좌우 여백에서 List 의 `px-1` 을 뺀 값이다. Trigger 와 Popup 의 Leading 열 시작점을 맞춘다. */
const optionPaddingX = { small: "px-1.5", regular: "px-2", large: "px-2", xlarge: "px-3" } as const

function renderOption(option: SelectOption, paddingX: string) {
  return (
    <SelectPrimitive.Item
      key={option.value}
      value={option.value}
      disabled={option.disabled}
      className={cn("group/option relative flex min-h-8 w-full cursor-default items-center gap-2.5 rounded-md py-1.5 outline-none data-[disabled]:pointer-events-none data-[disabled]:!text-oe-foreground-disabled data-[highlighted]:bg-oe-interaction-hover data-[selected]:font-medium data-[selected]:data-[highlighted]:!bg-transparent", paddingX)}
    >
      {option.leadingElement ? <span className="relative flex shrink-0 self-center text-oe-foreground-tertiary [&_svg]:size-4">{option.leadingElement}</span> : null}
      <SelectPrimitive.ItemText className="relative min-w-0 flex-1">
        <span className="block truncate">{option.label}</span>
        {option.description ? <span className="mt-0.5 block text-xs leading-4 text-oe-foreground-tertiary group-data-[disabled]/option:text-oe-foreground-disabled">{option.description}</span> : null}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="relative flex size-4 shrink-0 items-center justify-center self-start mt-0.5">
        <RiCheckLine className="size-4 text-oe-brand-foreground-primary" aria-hidden="true" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}

export { MultiSelect, Select, selectionTriggerVariants }
export type { MultiSelectProps, SelectOption, SelectOptionGroup, SelectProps }
