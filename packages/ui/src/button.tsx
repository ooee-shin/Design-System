import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"

import { cn } from "./utils"

export type ButtonTone = "brand" | "neutral" | "danger" | "custom"
export type ButtonVariant = "fill" | "tonal" | "outline" | "ghost"
export type ButtonSize = "xsmall" | "small" | "regular" | "large" | "xlarge"
export type ButtonLayout = "hug" | "fill"

// `custom` 으로 고를 수 있는 색이다. 지금은 엑셀 하나이며, 타입만 두면 Studio 나 문서가 같은
// 목록을 따로 적어야 하므로 런타임 값으로 내보내고 타입을 여기서 파생한다.
export const BUTTON_COLORS = ["excel"] as const

export type ButtonColor = (typeof BUTTON_COLORS)[number]

// shadcn base-nova 의 Button 구조를 가져왔다. 그대로 둔 것은 아이콘이 붙는 변의 여백 보정,
// 아이콘 크기 고정과 `data-icon` 표시다. 바꾼 것은 넷이다. 높이는 shadcn 의 자체 단계 대신
// `interaction.md` 의 공통 Control Height 를 쓴다. 색은 shadcn token 을 걷어내고 tone 과 variant
// 두 축으로 나눴다. 아이콘은 children 에 섞지 않고 `leadingIcon`·`trailingIcon` 으로 받아 컴포넌트가
// 직접 자리를 표시한다. 누를 때 1px 내려앉던 움직임은 걷어냈다.
const BASE_CLASS =
  "group/button inline-flex shrink-0 cursor-pointer items-center justify-center rounded-oe-control border font-medium whitespace-nowrap transition-[background-color,border-color,box-shadow,color] outline-none select-none disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:shrink-0"

// 높이가 커지면 좌우 여백과 아이콘 간격이 한 단계씩 오른다. 아이콘과 Label 사이는 좌우 여백보다
// 한참 좁다. 둘이 같은 액션을 가리키는 한 덩어리이므로, 그 사이가 벌어지면 아이콘이 Label 이 아니라
// 왼쪽 경계에 붙은 별개 요소로 읽힌다. 글자 크기는 XLarge 에서만 커지며
// Input 의 XLarge 가 `text-base` 인 것과 같다. 아이콘은 XSmall 에서 12px, XLarge 에서 20px 이고
// 나머지 셋은 16px 이다. 그 셋이 Input 의 Leading element 와 같은 크기이므로 폼 안에서 나란히 놓았을
// 때 아이콘이 같아 보인다. XSmall 에서 아이콘이 Label 보다 작아지므로 그 단계에서는 둘을 함께
// 두지 않는다. 규칙과 이유는 button.md 의 Guidelines 가 소유한다.
const SIZE_CLASS: Record<ButtonSize, string> = {
  xsmall: "h-oe-control-xsmall gap-1 px-2.5 text-sm [&_svg:not([class*='size-'])]:size-3",
  small: "h-oe-control-small gap-1 px-3 text-sm [&_svg:not([class*='size-'])]:size-4",
  regular: "h-oe-control-regular gap-1 px-3.5 text-sm [&_svg:not([class*='size-'])]:size-4",
  large: "h-oe-control-large gap-1.5 px-4 text-sm [&_svg:not([class*='size-'])]:size-4",
  xlarge: "h-oe-control-xlarge gap-1.5 px-5 text-base [&_svg:not([class*='size-'])]:size-5",
}

// 아이콘이 붙는 변은 여백을 한 단계 내린다. 아이콘은 글자보다 시각 무게가 가벼워 같은 여백을
// 주면 그쪽이 더 벌어져 보인다. 아이콘이 실제로 있을 때만 걸리도록 `has-` 로 조건을 건다.
const ICON_SIDE_CLASS: Record<ButtonSize, string> = {
  xsmall: "has-data-[icon=inline-start]:pl-2 has-data-[icon=inline-end]:pr-2",
  small: "has-data-[icon=inline-start]:pl-2.5 has-data-[icon=inline-end]:pr-2.5",
  regular: "has-data-[icon=inline-start]:pl-3 has-data-[icon=inline-end]:pr-3",
  large: "has-data-[icon=inline-start]:pl-3.5 has-data-[icon=inline-end]:pr-3.5",
  xlarge: "has-data-[icon=inline-start]:pl-4 has-data-[icon=inline-end]:pr-4",
}

// Label 이 없으면 좌우 여백을 지우고 높이와 같은 너비를 준다. 크기 단계마다 아이콘 전용 단계를
// 따로 두면 다섯이 열이 되므로, 단계는 그대로 두고 모양만 바꾼다.
const SQUARE_CLASS: Record<ButtonSize, string> = {
  xsmall: "w-oe-control-xsmall px-0",
  small: "w-oe-control-small px-0",
  regular: "w-oe-control-regular px-0",
  large: "w-oe-control-large px-0",
  xlarge: "w-oe-control-xlarge px-0",
}

// tone 은 어느 팔레트를 쓸지만 정하고, variant 는 그 팔레트의 어느 단계를 배경·글자·경계에 쓸지만
// 정한다. 세만틱 token 이름은 tone 마다 구간이 달라 조합을 하나씩 적게 만들고, 그러면 한 조합을
// 고쳐도 나머지가 따라오지 않는다. 프리미티브 단계로 내려오면 규칙 넷과 팔레트 셋의 곱이 되어
// 예외가 남지 않는다. Badge 가 같은 방식을 쓰므로 두 컴포넌트의 색이 갈라지지 않는다.
const TONE_PALETTE: Record<Exclude<ButtonTone, "custom">, string> = {
  brand: "brand",
  neutral: "neutral",
  danger: "red",
}

// brand 는 Tailwind 팔레트가 아니라 seed 에서 생성한 `--brand-{단계}` 를 참조한다. 단계 이름이
// 같으므로 색을 꺼내는 방식만 다르고 단계 규칙은 다른 tone 과 그대로 공유한다.
function paletteStep(palette: string, step: number) {
  return palette === "brand" ? `[var(--brand-${step})]` : `${palette}-${step}`
}

// fill 배경은 600 이고 글자는 어느 tone 에서나 white 다. tonal 배경은 Light 가 100, Dark 가 800 으로
// 짝이 어긋난다. Dark 를 900 으로 내리면 Studio 의 Dark Surface 가 `neutral-900` 이라 neutral tonal 이
// Surface 와 대비 1.00 이 되어 사라지기 때문이다. 근거와 수치는 badge.md 의 「색」에 있다.
// Badge 가 갖지 않는 Hover 와 Pressed 는 어느 variant 에서나 배경을 한 단계씩 진하게 밟는다.
// Light 는 100→200→300 으로 내려가고 Dark 는 800→700→600 으로 올라가 방향이 서로 반대다.
// outline 과 ghost 는 정지 상태에 배경이 없으므로 같은 사다리를 한 칸 늦게 밟는다.
// ghost 만 글자를 한 칸 옅게 쓴다. Light 700, Dark 400 이며 나머지 셋은 Light 800, Dark 300 이다.
// 배경도 경계도 없는 Style 이라 글자 하나로 무게가 정해지는데, 다른 Style 과 같은 단계를 쓰면
// 물러나 있어야 할 조작이 본문 글자와 같은 무게로 읽힌다.
// 클래스를 문자열로 조립하므로 Tailwind 가 소스에서 찾지 못한다. 여기서 쓰는 단계는
// `styles.css` 의 `@source inline` 이 미리 생성한다. 단계를 바꾸면 그쪽도 함께 고친다.
function toneClass(palette: string, variant: ButtonVariant) {
  const color = (step: number) => paletteStep(palette, step)

  if (variant === "fill") return `border-transparent bg-${color(600)} text-white hover:bg-${color(700)} active:bg-${color(800)}`
  if (variant === "tonal") return `border-transparent bg-${color(100)} text-${color(800)} hover:bg-${color(200)} active:bg-${color(300)} dark:bg-${color(800)} dark:text-${color(200)} dark:hover:bg-${color(700)} dark:active:bg-${color(600)}`
  if (variant === "outline") return `border-${color(500)}/30 bg-transparent text-${color(800)} hover:bg-${color(100)} active:bg-${color(200)} dark:text-${color(300)} dark:hover:bg-${color(800)} dark:active:bg-${color(700)}`
  return `border-transparent bg-transparent text-${color(700)} hover:bg-${color(100)} active:bg-${color(200)} dark:text-${color(400)} dark:hover:bg-${color(800)} dark:active:bg-${color(700)}`
}

// 엑셀 색은 위 단계 규칙에 들어오지 않는다. Tailwind 팔레트도 seed 에서 생성한 값도 아니고
// Microsoft 가 정한 고정 색이기 때문이다. 그래서 fill 의 600 단계만 그 실제 값 `#217346` 이며,
// 나머지 단계는 같은 색조에서 밝기만 옮겨 다른 tone 과 같은 규칙에 태울 수 있게 만든 값이다.
// fill 은 Light 와 Dark 에서 값을 뒤집지 않는다. 테마에 따라 색이 달라지면 엑셀로 읽히지 않기
// 때문이며, 뒤집히는 것은 배경이 옅은 tonal·outline·ghost 의 색조뿐이다.
// 조립하지 않고 클래스를 그대로 적으므로 Tailwind 가 이 파일에서 찾는다.
// 값의 근거와 승격 여부는 `open-questions.md` 의 token candidate 가 갖는다.
const EXCEL_CLASS: Record<ButtonVariant, string> = {
  fill: "border-transparent bg-[#217346] text-white hover:bg-[#1a5c38] active:bg-[#14452a]",
  tonal: "border-transparent bg-[#e4f0ea] text-[#14452a] hover:bg-[#c3dfd1] active:bg-[#9ac9b2] dark:bg-[#14452a] dark:text-[#c3dfd1] dark:hover:bg-[#1a5c38] dark:active:bg-[#217346]",
  outline: "border-[#2e9160]/30 bg-transparent text-[#14452a] hover:bg-[#e4f0ea] active:bg-[#c3dfd1] dark:text-[#9ac9b2] dark:hover:bg-[#14452a] dark:active:bg-[#1a5c38]",
  // Light 는 다른 tone 의 ghost 와 같이 한 칸 옅은 700 자리 값을 쓴다. Dark 는 이 고정 사다리에
  // 400 자리 값이 없어 300 자리인 `#9ac9b2` 를 그대로 둔다.
  ghost: "border-transparent bg-transparent text-[#1a5c38] hover:bg-[#e4f0ea] active:bg-[#c3dfd1] dark:text-[#9ac9b2] dark:hover:bg-[#14452a] dark:active:bg-[#1a5c38]",
}

// Focus 표시는 `interaction.md` 가 제공하는 세 유형 중에서 고른다. 경계가 1px 로 보이는 outline 은
// 유형 1 이며 그 선을 focus 색으로 바꾸고 바깥에 1px 을 더해 2px 로 보이게 한다. 나머지 셋은
// 유형 3 이다. brand fill 버튼 위에 brand 색 선을 얹으면 배경과 구분되지 않아 focus 위치가 보이지
// 않으므로, 배경색과 무관하게 보이도록 2px 간격을 두고 바깥에 ring 을 그린다.
const ADJACENT_FOCUS = "focus-visible:border-oe-focus-ring focus-visible:ring-1 focus-visible:ring-oe-focus-ring"
const DETACHED_FOCUS = "focus-visible:ring-2 focus-visible:ring-oe-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-oe-background-primary"

// Disabled 는 조작만 제한하므로 구조를 지운다는 뜻이 아니다. 배경과 글자는 tone 과 무관한 회색으로
// 바꾸고, outline 은 경계를 지우지 않고 Neutral 경계로 바꿔 단다. `interaction.md` 가 남기라고 한
// 것은 선이지 그 색이 아니며, tone 색은 누를 수 있다는 신호이므로 꺼진 버튼에 남기지 않는다.
// 바뀐 뒤의 모습은 Disabled Input 과 같아, 같은 폼 안에 나란히 놓인 둘이 함께 꺼져 보인다.
//
// 세 상태에 짝을 하나씩 더 단다. Hover 와 Pressed 는 그 회색을 다시 덮지 않도록, `dark:` 는
// Tailwind 가 그 변형을 `disabled:` 보다 뒤에 배치하기 때문이다. `dark:bg-...` 하나만 있어도 Dark
// 에서 Disabled 배경과 글자가 tone 색으로 되돌아간다. 값 자체는 테마를 따라가는 token 이므로
// Light 와 Dark 가 같은 이름을 쓴다.
// 조립하지 않고 그대로 적는다. 문자열로 만들면 Tailwind 가 소스에서 찾지 못해 클래스가 생성되지
// 않고, 그러면 화면에서만 조용히 어긋난다.
const DISABLED_SURFACE =
  "disabled:bg-oe-background-disabled disabled:text-oe-foreground-disabled disabled:hover:bg-oe-background-disabled disabled:active:bg-oe-background-disabled dark:disabled:bg-oe-background-disabled dark:disabled:text-oe-foreground-disabled dark:disabled:hover:bg-oe-background-disabled dark:disabled:active:bg-oe-background-disabled"

const DISABLED_OUTLINE = "disabled:border-oe-border-secondary dark:disabled:border-oe-border-secondary"

function variantClass(variant: ButtonVariant, tone: ButtonTone, color?: ButtonColor) {
  const palette = tone === "custom" ? null : TONE_PALETTE[tone]
  const tinted = palette === null ? EXCEL_CLASS[variant] : toneClass(palette, variant)

  return cn(
    tinted,
    variant === "outline" ? ADJACENT_FOCUS : DETACHED_FOCUS,
    DISABLED_SURFACE,
    variant === "outline" && DISABLED_OUTLINE,
  )
}

// `color` 는 custom tone 에서만 뜻을 가지므로, 다른 tone 과 함께 쓰면 타입에서 걸리게 둔다.
type ButtonToneProps =
  | { tone?: Exclude<ButtonTone, "custom">; color?: never }
  | { tone: "custom"; color: ButtonColor }

type ButtonVariantsOptions = {
  variant?: ButtonVariant
  tone?: ButtonTone
  controlSize?: ButtonSize
  layout?: ButtonLayout
  color?: ButtonColor
  iconOnly?: boolean
}

function buttonVariants({
  variant = "fill",
  tone = "brand",
  controlSize = "regular",
  layout = "hug",
  color,
  iconOnly = false,
}: ButtonVariantsOptions = {}) {
  return cn(
    BASE_CLASS,
    SIZE_CLASS[controlSize],
    iconOnly ? SQUARE_CLASS[controlSize] : ICON_SIDE_CLASS[controlSize],
    variantClass(variant, tone, color),
    layout === "fill" && "w-full",
  )
}

export type ButtonProps = Omit<ButtonPrimitive.Props, "color"> & {
  variant?: ButtonVariant
  controlSize?: ButtonSize
  layout?: ButtonLayout
  leadingIcon?: React.ReactNode
  trailingIcon?: React.ReactNode
} & ButtonToneProps

function Button({
  className,
  variant = "fill",
  tone = "brand",
  controlSize = "regular",
  layout = "hug",
  color,
  leadingIcon,
  trailingIcon,
  children,
  ...props
}: ButtonProps) {
  const hasLabel = children !== undefined && children !== null && children !== false

  // Label 이 없는 버튼에서 아이콘은 하나다. 가운데 하나만 놓이므로 앞뒤를 나눌 자리가 없고, 둘을
  // 그리면 무엇을 뜻하는 버튼인지 읽히지 않는다. 둘 다 넘어오면 Leading 을 남긴다.
  const showLeading = Boolean(leadingIcon)
  const showTrailing = Boolean(trailingIcon) && (hasLabel || !showLeading)

  return (
    <ButtonPrimitive
      data-slot="button"
      data-variant={variant}
      data-tone={tone}
      data-size={controlSize}
      data-layout={layout}
      className={cn(buttonVariants({ variant, tone, controlSize, layout, color, iconOnly: !hasLabel }), className)}
      {...props}
    >
      {showLeading ? (
        <span data-slot="button-leading-icon" data-icon="inline-start" className="flex shrink-0 items-center">
          {leadingIcon}
        </span>
      ) : null}
      {hasLabel ? (
        <span data-slot="button-label" className="min-w-0 truncate">
          {children}
        </span>
      ) : null}
      {showTrailing ? (
        <span data-slot="button-trailing-icon" data-icon="inline-end" className="flex shrink-0 items-center">
          {trailingIcon}
        </span>
      ) : null}
    </ButtonPrimitive>
  )
}

export { Button, buttonVariants }
