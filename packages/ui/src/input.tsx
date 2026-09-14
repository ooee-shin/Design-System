import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { RiCloseLine } from "@remixicon/react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "./utils"

const inputContainerVariants = cva(
  "group/input flex w-full min-w-0 items-center rounded-oe-control border text-oe-foreground-primary transition-[border-color,box-shadow,background-color] has-[:focus-visible]:border-oe-focus-ring has-[:focus-visible]:ring-1 has-[:focus-visible]:ring-oe-focus-ring has-[[aria-invalid=true]]:border-oe-danger-border-primary has-[[aria-invalid=true]]:ring-1 has-[[aria-invalid=true]]:ring-oe-danger-border-primary data-[disabled=true]:cursor-not-allowed data-[disabled=true]:bg-oe-background-disabled data-[disabled=true]:text-oe-foreground-disabled",
  {
    variants: {
      variant: {
        outline: "border-oe-border-primary bg-oe-background-primary",
        // 바닥이 밝아지는 것은 그 자리를 쓰고 있는 동안의 표시다. focus-within 으로 두면 Trailing
        // element 의 버튼에 초점이 가도 같은 모습이 되므로, 대상을 둘로 좁힌다. `focus` 는 이
        // 스타일을 직접 두른 요소가 초점을 받는 InputButton 이고, `has` 는 컨테이너 안의 입력란이
        // 초점을 받는 Input 이다.
        filled:
          "border-transparent bg-oe-background-secondary focus:bg-oe-background-primary has-[[data-slot=input]:focus]:bg-oe-background-primary",
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
    textAlign?: "left" | "right"
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
  clearable,
  clearLabel = "Clear input",
  onClear,
  textAlign = "left",
  disabled,
  readOnly,
  ...props
}: InputProps) {
  // 값이 없을 때 자리를 차지하지 않으려면 조건부로 렌더링해야 한다. 나타날 때는 마운트 직후
  // 프레임에 클래스를 바꿔야 전환이 시작 상태를 갖고, 사라질 때는 전환이 끝난 뒤에 걷어내야
  // 페이드가 끊기지 않는다. 아래 시간은 클래스의 duration-150 과 같아야 한다.
  // 컨테이너의 gap 은 controlSize 마다 다르다. 버튼이 접힐 때 그만큼 음수 여백으로 상쇄하지
  // 않으면 폭이 0 이 되어도 gap 만큼 자리가 남는다.
  const clearCollapsedGap = { small: "-ml-1.5", regular: "-ml-2", large: "-ml-2", xlarge: "-ml-2.5" }[controlSize ?? "regular"]
  const [clearRendered, setClearRendered] = React.useState(Boolean(clearable))
  const [clearEntered, setClearEntered] = React.useState(false)
  React.useEffect(() => {
    if (clearable) {
      setClearRendered(true)
      const frame = requestAnimationFrame(() => setClearEntered(true))
      return () => cancelAnimationFrame(frame)
    }
    setClearEntered(false)
    const timer = setTimeout(() => setClearRendered(false), 150)
    return () => clearTimeout(timer)
  }, [clearable])

  return (
    <div
      data-slot="input-container"
      data-variant={variant}
      data-size={controlSize}
      data-layout={layout}
      data-disabled={disabled ? "true" : undefined}
      style={layout === "fixed" ? { width: fixedWidth } : undefined}
      className={cn(inputContainerVariants({ variant, controlSize }), layout === "fixed" ? "max-w-full shrink-0" : "w-full", containerClassName)}
    >
      {leadingElement ? <span data-slot="input-leading" className="flex shrink-0 items-center text-oe-foreground-tertiary [&_svg]:size-4">{leadingElement}</span> : null}
      {prefix ? <span data-slot="input-prefix" className="shrink-0 text-oe-foreground-secondary">{prefix}</span> : null}
      <InputPrimitive
        data-slot="input"
        className={cn("h-full min-w-0 flex-1 bg-transparent p-0 text-inherit outline-none placeholder:text-oe-foreground-placeholder disabled:cursor-not-allowed disabled:text-oe-foreground-disabled read-only:cursor-default", textAlign === "right" ? "text-right" : "text-left", className)}
        disabled={disabled}
        readOnly={readOnly}
        {...props}
      />
      {clearRendered ? (
        <button type="button" data-slot="input-clear" data-visible={clearEntered ? "true" : undefined} aria-label={clearLabel} className={cn("-mr-1 flex h-6 w-0 shrink-0 items-center justify-center overflow-hidden rounded-md text-oe-foreground-tertiary opacity-0 invisible pointer-events-none transition-[color,background-color,opacity,width,margin] duration-150 group-focus-within/input:data-[visible]:visible group-focus-within/input:data-[visible]:pointer-events-auto group-focus-within/input:data-[visible]:w-6 group-focus-within/input:data-[visible]:ml-0 group-focus-within/input:data-[visible]:opacity-100 hover:bg-oe-interaction-hover hover:text-oe-foreground-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-focus-ring disabled:pointer-events-none", clearCollapsedGap)} disabled={disabled || readOnly} onMouseDown={(event) => event.preventDefault()} onClick={onClear}>
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
