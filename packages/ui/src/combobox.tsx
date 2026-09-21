"use client"

import * as React from "react"
import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox"
import { RiArrowDownSLine, RiCheckLine, RiSearchLine } from "@remixicon/react"
import { cva, type VariantProps } from "class-variance-authority"

import { Chip } from "./chip"
import { CheckboxIndicator } from "./checkbox"
import { Input } from "./input"
import { selectionTriggerVariants } from "./selection-trigger"
import { cn } from "./utils"

const comboboxTriggerVariants = selectionTriggerVariants

const comboboxSearchContainerVariants = cva("flex h-oe-control-small w-full items-center gap-2 bg-transparent px-2.5 text-sm")

type ComboboxOption = { value: string; label: string; disabled?: boolean }

type ComboboxProps = VariantProps<typeof comboboxTriggerVariants> & {
  options: ComboboxOption[]
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  id?: string
  ariaLabel?: string
  "aria-describedby"?: string
  disabled?: boolean
  invalid?: boolean
  name?: string
  className?: string
}

/** 옵션을 한 단계 묶는 무리다. Label 이 그 무리의 이름으로 목록에 선다. */
type ComboboxOptionGroup = {
  label: string
  options: ComboboxOption[]
}

type MultiComboboxItemsProps =
  | { options: ComboboxOption[]; groups?: never }
  | { options?: never; groups: ComboboxOptionGroup[] }

type MultiComboboxProps = Omit<ComboboxProps, "value" | "defaultValue" | "onValueChange" | "options"> & MultiComboboxItemsProps & {
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  selectedSummaryLabel?: (firstLabel: string, remainingCount: number) => string
  selectAllLabel?: string
  selectedSearchPlaceholder?: string
  removeSelectedLabel?: (label: string) => string
  /**
   * 고른 값을 Trigger 아래 Container 에 펼쳐 둘지.
   *
   * `container` 는 고른 값을 Chip 으로 세우고 그 안에서 다시 찾거나 하나씩 뺄 수 있게 한다. 고른
   * 값을 계속 보면서 다루는 자리가 쓴다.
   *
   * `none` 은 Trigger 한 줄만 남긴다. 조건 줄처럼 여러 축이 나란히 선 자리가 쓴다. 한 축에서 값을
   * 고를 때마다 그 축만 아래로 자라면 줄의 높이가 흔들리고, 옆 축들이 따라 밀린다. 고른 값은
   * Trigger 의 요약이 말하며, 빼는 것은 목록을 다시 열어 체크를 지운다.
   */
  selectedItems?: "container" | "none"
}

function Combobox({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder = "Select an option",
  searchPlaceholder = "Search options",
  emptyMessage = "No options found.",
  id,
  ariaLabel,
  "aria-describedby": ariaDescribedBy,
  disabled = false,
  invalid = false,
  name,
  variant = "outline",
  controlSize = "regular",
  className,
}: ComboboxProps) {
  const selectedOption = value === undefined ? undefined : options.find((option) => option.value === value) ?? null
  const defaultSelectedOption = options.find((option) => option.value === defaultValue) ?? null

  return (
    <ComboboxPrimitive.Root
      items={options}
      value={selectedOption}
      defaultValue={defaultSelectedOption}
      onValueChange={(option) => onValueChange?.(option?.value ?? null)}
      disabled={disabled}
      name={name}
    >
      <ComboboxPrimitive.Trigger
        data-slot="combobox-trigger"
        data-invalid={invalid ? "" : undefined}
        aria-invalid={invalid || undefined}
        id={id}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        className={cn(comboboxTriggerVariants({ variant, controlSize }), className)}
      >
        <span className="min-w-0 flex-1 truncate data-[placeholder]:text-oe-foreground-placeholder">
          <ComboboxPrimitive.Value placeholder={placeholder} />
        </span>
        <ComboboxPrimitive.Icon className="flex shrink-0 items-center text-oe-foreground-tertiary data-[popup-open]:rotate-180">
          <RiArrowDownSLine className="size-4 transition-transform" aria-hidden="true" />
        </ComboboxPrimitive.Icon>
      </ComboboxPrimitive.Trigger>

      <ComboboxPopup ariaLabel={ariaLabel} searchPlaceholder={searchPlaceholder} emptyMessage={emptyMessage} multiple={false} />
    </ComboboxPrimitive.Root>
  )
}

function MultiCombobox({
  options,
  groups,
  value,
  defaultValue,
  onValueChange,
  placeholder = "Select options",
  searchPlaceholder = "Search options",
  emptyMessage = "No options found.",
  id,
  ariaLabel,
  "aria-describedby": ariaDescribedBy,
  selectedSummaryLabel = (firstLabel, remainingCount) => remainingCount > 0 ? `${firstLabel} +${remainingCount}` : firstLabel,
  selectAllLabel = "All",
  selectedSearchPlaceholder = "Search selected items",
  selectedItems = "container",
  removeSelectedLabel = (label) => `Remove ${label}`,
  disabled = false,
  invalid = false,
  name,
  variant = "outline",
  controlSize = "regular",
  className,
}: MultiComboboxProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState<string[]>(defaultValue ?? [])
  const [selectedSearch, setSelectedSearch] = React.useState("")
  const resolvedValue = value ?? uncontrolledValue
  // 무리로 받았으면 그 안의 옵션을 펼쳐 둔다. 값을 다루는 쪽은 무리를 알 필요가 없다.
  const resolvedOptions = options ?? groups?.flatMap((group) => group.options) ?? []
  const selectedOptions = resolvedOptions.filter((option) => resolvedValue.includes(option.value))
  const updateValue = (next: string[]) => {
    if (value === undefined) setUncontrolledValue(next)
    onValueChange?.(next)
  }
  const enabledValues = resolvedOptions.filter((option) => !option.disabled).map((option) => option.value)
  const allSelected = enabledValues.length > 0 && enabledValues.every((optionValue) => resolvedValue.includes(optionValue))
  const someSelected = !allSelected && enabledValues.some((optionValue) => resolvedValue.includes(optionValue))

  return (
    <ComboboxPrimitive.Root
      items={groups ? groups.map((group) => ({ value: group.label, items: group.options })) : options}
      multiple
      value={selectedOptions}
      onValueChange={(selected) => updateValue(selected.map((option) => option.value))}
      disabled={disabled}
      name={name}
    >
      <div className="w-full space-y-2">
        <ComboboxPrimitive.Trigger
          data-slot="combobox-trigger"
          data-invalid={invalid ? "" : undefined}
          aria-invalid={invalid || undefined}
          id={id}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
          className={cn(comboboxTriggerVariants({ variant, controlSize }), className)}
        >
          <span className="min-w-0 flex-1 truncate">
            <ComboboxPrimitive.Value>
              {(selected: ComboboxOption[]) => selected.length === 0 ? <span className="text-oe-foreground-placeholder">{placeholder}</span> : selectedSummaryLabel(selected[0].label, selected.length - 1)}
            </ComboboxPrimitive.Value>
          </span>
          <ComboboxPrimitive.Icon className="flex shrink-0 items-center text-oe-foreground-tertiary data-[popup-open]:rotate-180">
            <RiArrowDownSLine className="size-4 transition-transform" aria-hidden="true" />
          </ComboboxPrimitive.Icon>
        </ComboboxPrimitive.Trigger>
        {selectedItems === "none" ? null : <ComboboxPrimitive.Value>
            {(selected: ComboboxOption[]) => selected.length > 0 ? <div data-slot="combobox-selected-items" className="rounded-lg bg-oe-background-secondary p-2"><Input type="search" variant="filled" controlSize="small" value={selectedSearch} onChange={(event) => setSelectedSearch(event.target.value)} aria-label={selectedSearchPlaceholder} placeholder={selectedSearchPlaceholder} leadingElement={<RiSearchLine />} /><div className="mt-2 flex max-h-20 flex-wrap content-start gap-1.5 overflow-y-auto [scrollbar-color:transparent_transparent] [scrollbar-gutter:stable] [scrollbar-width:thin] hover:[scrollbar-color:var(--oe-border-primary)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-oe-border-primary">{selected.filter((option) => option.label.toLocaleLowerCase().includes(selectedSearch.trim().toLocaleLowerCase())).map((option) => <Chip key={option.value} controlSize="small" removeLabel={removeSelectedLabel(option.label)} onRemove={() => updateValue(resolvedValue.filter((optionValue) => optionValue !== option.value))}>{option.label}</Chip>)}</div></div> : <></>}
        </ComboboxPrimitive.Value>}
      </div>
      <ComboboxPopup ariaLabel={ariaLabel} searchPlaceholder={searchPlaceholder} emptyMessage={emptyMessage} multiple grouped={Boolean(groups)} selectAllLabel={selectAllLabel} totalCount={enabledValues.length} allSelected={allSelected} someSelected={someSelected} onToggleAll={() => updateValue(allSelected ? resolvedValue.filter((optionValue) => !enabledValues.includes(optionValue)) : Array.from(new Set([...resolvedValue, ...enabledValues])))} />
    </ComboboxPrimitive.Root>
  )
}

function ComboboxPopup({ ariaLabel, searchPlaceholder, emptyMessage, multiple, grouped = false, selectAllLabel, totalCount = 0, allSelected = false, someSelected = false, onToggleAll }: { ariaLabel?: string; searchPlaceholder: string; emptyMessage: string; multiple: boolean; grouped?: boolean; selectAllLabel?: string; totalCount?: number; allSelected?: boolean; someSelected?: boolean; onToggleAll?: () => void }) {
  const renderItem = (option: ComboboxOption) => (
    <ComboboxPrimitive.Item key={option.value} value={option} disabled={option.disabled} className={cn("group/option relative flex min-h-9 w-full cursor-default items-center gap-2 rounded-md px-2.5 py-2 outline-none data-[disabled]:pointer-events-none data-[disabled]:text-oe-foreground-disabled data-[highlighted]:bg-oe-interaction-hover data-[selected]:data-[highlighted]:!bg-transparent", !multiple && "before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:right-[-0.75rem] before:rounded-md before:content-[''] data-[selected]:before:bg-oe-background-secondary")}>
      {multiple ? (
        <CheckboxIndicator className="group-data-[selected]/option:border-oe-brand-background-bold-primary group-data-[selected]/option:bg-oe-brand-background-bold-primary">
          <ComboboxPrimitive.ItemIndicator className="grid place-items-center"><RiCheckLine className="size-2.5 text-oe-foreground-inverse" /></ComboboxPrimitive.ItemIndicator>
        </CheckboxIndicator>
      ) : null}
      <span className="relative min-w-0 flex-1 truncate">{option.label}</span>
      {!multiple ? (
        <ComboboxPrimitive.ItemIndicator className="relative flex size-4 shrink-0 items-center justify-center">
          <RiCheckLine className="size-4 text-oe-brand-foreground-primary" aria-hidden="true" />
        </ComboboxPrimitive.ItemIndicator>
      ) : null}
    </ComboboxPrimitive.Item>
  )

  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner align="start" sideOffset={4} className="z-50 w-[var(--anchor-width)] max-w-[var(--available-width)]">
        <ComboboxPrimitive.Popup aria-label={ariaLabel} initialFocus className="max-h-[min(20rem,var(--available-height))] overflow-hidden rounded-lg border border-oe-border-secondary bg-oe-background-primary p-2 text-sm text-oe-foreground-primary shadow-lg outline-none">
          <div className={comboboxSearchContainerVariants()}>
            <RiSearchLine className="size-4 shrink-0 text-oe-foreground-tertiary" aria-hidden="true" />
            <ComboboxPrimitive.Input aria-label={searchPlaceholder} placeholder={searchPlaceholder} className="h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-oe-foreground-placeholder" />
          </div>
          <div className="mt-2 max-h-64 overflow-x-hidden overflow-y-auto [scrollbar-color:transparent_transparent] [scrollbar-width:thin] hover:[scrollbar-color:var(--oe-border-primary)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-oe-border-primary">
            {multiple ? (
              <button type="button" data-slot="combobox-select-all" aria-pressed={allSelected} onClick={onToggleAll} className={cn("flex min-h-9 w-full items-center gap-2 rounded-md px-2.5 py-2 text-left outline-none focus-visible:ring-1 focus-visible:ring-oe-focus-ring", allSelected ? "hover:bg-transparent" : "hover:bg-oe-interaction-hover")}>
                <CheckboxIndicator checked={allSelected} indeterminate={someSelected} />
                <span className="flex items-baseline gap-1">
                  <span className="font-semibold">{selectAllLabel}</span>
                  <span className="text-oe-foreground-tertiary tabular-nums">{totalCount}</span>
                </span>
              </button>
            ) : null}
            <ComboboxPrimitive.Empty className="px-2.5 py-6 text-center text-xs text-oe-foreground-tertiary empty:hidden">{emptyMessage}</ComboboxPrimitive.Empty>
            <ComboboxPrimitive.List>
              {grouped
                ? (group: { value: string; items: ComboboxOption[] }) => (
                    <ComboboxPrimitive.Group key={group.value} items={group.items}>
                      {/* 무리의 이름은 고르는 값이 아니라 아래 항목들이 무엇에 속하는지 알리는 글이다.
                          항목보다 작고 옅게 두어 목록을 훑을 때 항목과 섞이지 않게 한다. */}
                      <ComboboxPrimitive.GroupLabel className="px-2.5 py-1.5 text-[11px] font-medium text-oe-foreground-tertiary">
                        {group.value}
                      </ComboboxPrimitive.GroupLabel>
                      <ComboboxPrimitive.Collection>{(option: ComboboxOption) => renderItem(option)}</ComboboxPrimitive.Collection>
                    </ComboboxPrimitive.Group>
                  )
                : (option: ComboboxOption) => renderItem(option)}
            </ComboboxPrimitive.List>
          </div>
        </ComboboxPrimitive.Popup>
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  )
}

export { Combobox, MultiCombobox, comboboxSearchContainerVariants, comboboxTriggerVariants }
export type { ComboboxOption, ComboboxOptionGroup, ComboboxProps, MultiComboboxProps }
