import * as React from "react"

import { cn } from "./utils"

// 주입한 id 가 실제로 붙어도 되는 요소인지 판단하는 기준이다. Select 와 Combobox 처럼 자체
// Trigger 를 렌더링하는 Control 은 button 또는 role 로 잡힌다.
const LABELABLE_SELECTOR = "input, textarea, select, button, [role=combobox], [role=textbox], [role=switch], [role=checkbox], [role=radio]"

type FieldCharacterCount = {
  current: number
  max: number
}

type FieldProps = {
  label: React.ReactNode
  required?: boolean
  group?: boolean
  disabled?: boolean
  readOnly?: boolean
  rightDescription?: React.ReactNode
  trailingElement?: React.ReactNode
  helperText?: React.ReactNode
  errorMessage?: React.ReactNode
  characterCount?: FieldCharacterCount
  children: React.ReactNode
  className?: string
}

function Field({
  label,
  required = false,
  group = false,
  disabled = false,
  readOnly = false,
  rightDescription,
  trailingElement,
  helperText,
  errorMessage,
  characterCount,
  children,
  className,
}: FieldProps) {
  const controlId = React.useId()
  const labelId = React.useId()
  const messageId = React.useId()

  // 오류는 도움말을 대체한다. 둘이 함께 쌓이면 항목마다 Footer 높이가 달라져 폼의 수직
  // 리듬이 깨지고, 먼저 읽어야 하는 문구가 흐려진다.
  const invalid = Boolean(errorMessage)
  const message = errorMessage ?? helperText
  const describedBy = message ? messageId : undefined

  // Input slot 은 Swap 영역이며 세 경우로 갈린다.
  // 자식이 Control 하나면 Field 가 id 와 상태를 주입하고 Label 이 htmlFor 로 그것을 가리킨다.
  // group 이면서 자식이 하나면 그 자식이 이미 자체 group 을 렌더링하는 Select Box Group 같은
  // 경우이므로, group 을 겹쳐 만들지 않고 이름과 설명만 주입한다.
  // group 이면서 자식이 여러 개면 가리킬 대상이 없으므로 Field 가 group 을 직접 소유한다.
  // Fragment 도 isValidElement 를 통과하므로 그것만으로는 Control 하나와 행 여러 개를 가를 수
  // 없다. Fragment 로 넘어온 행 묶음을 Control 하나로 보면 주입이 아무 곳에도 닿지 않는다.
  const singleChild = React.isValidElement(children) && children.type !== React.Fragment
  const control = singleChild
    ? React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
        ...(group
          ? { "aria-labelledby": labelId }
          : { id: controlId, required: required || undefined }),
        "aria-describedby": describedBy,
        "aria-invalid": invalid || undefined,
        disabled: disabled || undefined,
        readOnly: readOnly || undefined,
      })
    : (
      // Field 가 group 을 소유할 때는 행들을 자기 묶음으로 감싼다. 행을 Field 의 직접 자식으로
      // 두면 Field 의 세로 gap 이 행 사이로 새어 각 행이 자기 높이로 만드는 수직 리듬이 어긋난다.
      // role 도 Header 와 Footer 를 제외한 이 묶음이 가져야 한다.
      <div role="group" data-slot="field-group" aria-labelledby={labelId} aria-describedby={describedBy} className="flex flex-col">
        {children}
      </div>
    )

  // 주입은 직접 자식이 실제 Control 일 때만 성립한다. 소비자가 Control 을 div 로 한 번 감싸면
  // id 가 그 div 에 붙어 Label 연결이 조용히 끊기므로, 개발 환경에서 그 자리를 알린다.
  React.useEffect(() => {
    if (process.env.NODE_ENV === "production" || group) return
    const connected = document.getElementById(controlId)
    if (!connected) {
      console.warn("Field: Input slot 의 직접 자식이 Control 하나가 아니어서 Label 연결이 끊겼습니다. Control 하나를 그대로 두거나 여러 항목이면 group 을 사용하세요.")
      return
    }
    if (!connected.matches(LABELABLE_SELECTOR)) {
      console.warn(`Field: Input slot 의 직접 자식이 Control 이 아니라 <${connected.tagName.toLowerCase()}> 입니다. Label 연결이 끊기므로 Control 을 감싸지 말고 그대로 두거나 group 을 사용하세요.`)
    }
  }, [controlId, group])

  const header = (
    <div data-slot="field-header" className="mb-0.5 flex min-w-0 items-center gap-1">
      {required ? (
        <span aria-hidden="true" data-slot="field-requirement" className="shrink-0 text-sm leading-5 text-oe-danger-foreground-secondary">
          *
        </span>
      ) : null}
      {group ? (
        <span id={labelId} data-slot="field-label" className="min-w-0 truncate text-sm font-medium leading-5 text-oe-foreground-primary">
          {label}
        </span>
      ) : (
        <label htmlFor={controlId} data-slot="field-label" className="min-w-0 truncate text-sm font-medium leading-5 text-oe-foreground-primary">
          {label}
        </label>
      )}
      {rightDescription ? (
        <span data-slot="field-right-description" className="min-w-0 truncate text-xs leading-5 text-oe-foreground-tertiary">
          {rightDescription}
        </span>
      ) : null}
      {trailingElement ? (
        <span data-slot="field-trailing" className="ml-auto flex shrink-0 items-center">
          {trailingElement}
        </span>
      ) : null}
    </div>
  )

  const footer = message || characterCount ? (
    <div data-slot="field-footer" className="flex min-w-0 items-start justify-between gap-2">
      {message ? (
        <p
          id={messageId}
          data-slot={invalid ? "field-error-message" : "field-helper-text"}
          className={cn("min-w-0 text-xs leading-5", invalid ? "text-oe-danger-foreground-secondary" : "text-oe-foreground-tertiary")}
        >
          {message}
        </p>
      ) : null}
      {characterCount ? (
        <span
          data-slot="field-character-count"
          className={cn(
            "ml-auto shrink-0 text-xs leading-5 tabular-nums",
            invalid ? "text-oe-danger-foreground-secondary" : "text-oe-foreground-tertiary",
          )}
        >
          {characterCount.current}/{characterCount.max}
        </span>
      ) : null}
    </div>
  ) : null

  return (
    <div data-slot="field" data-invalid={invalid ? "" : undefined} className={cn("flex w-full flex-col gap-1", className)}>
      {header}
      {control}
      {footer}
    </div>
  )
}

export { Field, type FieldCharacterCount, type FieldProps }
