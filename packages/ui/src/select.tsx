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
    ariaLabel: string
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
  ariaLabel,
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
        data-invalid={invalid ? "" : undefined}
        data-layout={layout}
        aria-invalid={invalid || undefined}
        aria-label={ariaLabel}
        style={layout === "fixed" ? { width: fixedWidth } : undefined}
        className={cn(selectionTriggerVariants({ variant, controlSize }), layout === "fixed" && "max-w-full shrink-0", className)}
      >
        <SelectPrimitive.Value className="flex min-w-0 flex-1 items-center gap-2.5 truncate">
          {(selectedValue: string | null) => {
            const option = resolvedOptions.find((item) => item.value === selectedValue) ?? null
            return option ? <>{option.leadingElement ?? leadingElement ? <span className="flex shrink-0 items-center text-oe-foreground-tertiary [&_svg]:size-4">{option.leadingElement ?? leadingElement}</span> : null}<span className="min-w-0 truncate">{option.label}</span></> : <span className="min-w-0 truncate text-oe-foreground-placeholder">{placeholder}</span>
          }}
        </SelectPrimitive.Value>
        <SelectPrimitive.Icon className="flex shrink-0 items-center text-oe-foreground-tertiary data-[popup-open]:rotate-180">
          <RiArrowDownSLine className="size-4 transition-transform" aria-hidden="true" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Positioner align="start" sideOffset={4} alignItemWithTrigger={false} className="z-50">
          <SelectPrimitive.Popup className="w-[var(--anchor-width)] max-h-[min(20rem,var(--available-height))] max-w-[var(--available-width)] overflow-hidden rounded-lg border border-oe-border-primary bg-oe-background-primary text-sm text-oe-foreground-primary shadow-lg outline-none">
            <SelectPrimitive.List className="max-h-[15.5rem] overflow-x-hidden overflow-y-auto px-1 pt-1 [scrollbar-color:transparent_transparent] [scrollbar-width:thin] hover:[scrollbar-color:var(--oe-border-primary)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-oe-border-primary">
              {groups ? groups.map((group, groupIndex) => (
                <React.Fragment key={group.label}>
                  {groupIndex > 0 ? <SelectPrimitive.Separator className="my-1.5 h-px bg-oe-border-secondary" /> : null}
                  <SelectPrimitive.Group>
                    <SelectPrimitive.GroupLabel className="px-2 py-1.5 text-[11px] font-medium text-oe-foreground-tertiary">{group.label}</SelectPrimitive.GroupLabel>
                    {group.options.map(renderOption)}
                  </SelectPrimitive.Group>
                </React.Fragment>
              )) : resolvedOptions.map(renderOption)}
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
  ariaLabel,
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
        data-invalid={invalid ? "" : undefined}
        data-layout={layout}
        aria-invalid={invalid || undefined}
        aria-label={ariaLabel}
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
            const triggerLeading = selectedOptions.length === 1 ? representative.leadingElement ?? leadingElement : leadingElement
            return <>{triggerLeading ? <span className="flex shrink-0 items-center text-oe-foreground-tertiary [&_svg]:size-4">{triggerLeading}</span> : null}<span className="min-w-0 truncate">{valueDisplay === "count" ? selectedCountLabel(selectedOptions.length) : selectedSummaryLabel(representative.label, selectedOptions.length - 1)}</span></>
          }}
        </SelectPrimitive.Value>
        <SelectPrimitive.Icon className="flex shrink-0 items-center text-oe-foreground-tertiary data-[popup-open]:rotate-180">
          <RiArrowDownSLine className="size-4 transition-transform" aria-hidden="true" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Positioner align="start" sideOffset={4} alignItemWithTrigger={false} className="z-50">
          <SelectPrimitive.Popup className="w-[var(--anchor-width)] max-h-[min(20rem,var(--available-height))] max-w-[var(--available-width)] overflow-hidden rounded-lg border border-oe-border-primary bg-oe-background-primary text-sm text-oe-foreground-primary shadow-lg outline-none">
            <SelectPrimitive.List className="max-h-[15.5rem] overflow-x-hidden overflow-y-auto px-1 pt-1 [scrollbar-color:transparent_transparent] [scrollbar-width:thin] hover:[scrollbar-color:var(--oe-border-primary)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-oe-border-primary">
              {groups ? groups.map((group, groupIndex) => (
                <React.Fragment key={group.label}>
                  {groupIndex > 0 ? <SelectPrimitive.Separator className="my-1.5 h-px bg-oe-border-secondary" /> : null}
                  <SelectPrimitive.Group>
                    <SelectPrimitive.GroupLabel className="px-2 py-1.5 text-[11px] font-medium text-oe-foreground-tertiary">{group.label}</SelectPrimitive.GroupLabel>
                    {group.options.map(renderOption)}
                  </SelectPrimitive.Group>
                </React.Fragment>
              )) : resolvedOptions.map(renderOption)}
            </SelectPrimitive.List>
          </SelectPrimitive.Popup>
        </SelectPrimitive.Positioner>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}

function renderOption(option: SelectOption) {
  return (
    <SelectPrimitive.Item
      key={option.value}
      value={option.value}
      disabled={option.disabled}
      className="group/option relative flex min-h-8 w-full cursor-default items-center gap-2.5 rounded-md px-2 py-1.5 outline-none data-[disabled]:pointer-events-none data-[disabled]:!text-oe-foreground-disabled data-[highlighted]:bg-oe-interaction-hover data-[selected]:font-medium data-[selected]:data-[highlighted]:!bg-transparent"
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
