import * as React from "react"
import { Toggle as TogglePrimitive } from "@base-ui/react/toggle"

import { cn } from "./utils"

export type ToggleButtonTone = "brand" | "custom"
export type ToggleButtonVariant = "ghost" | "tonal"
export type ToggleButtonSize = "xsmall" | "small" | "regular" | "large" | "xlarge"

// `custom` 으로 고를 수 있는 색이다. 지금은 즐겨찾기의 노랑과 찜의 빨강 둘이며, 타입만 두면
// Studio 나 문서가 같은 목록을 따로 적어야 하므로 런타임 값으로 내보내고 타입을 여기서 파생한다.
export const TOGGLE_BUTTON_COLORS = ["favorite", "like"] as const

export type ToggleButtonColor = (typeof TOGGLE_BUTTON_COLORS)[number]

// 높이·여백·글자·아이콘 크기는 Button 과 같은 단계를 쓴다. 두 컴포넌트가 도구 모음에 나란히
// 놓이므로 한쪽만 단계를 달리하면 같은 줄에서 높이가 어긋난다. `variant` 는 켜짐이 어디까지
// 바뀌는지로 갈리는 ghost 와 tonal 둘만 둔다. Button 의 fill 은 배경이 이미 tone 색을 다 쓰고
// 있어 켜짐을 표시할 자리가 남지 않고, outline 은 실제 쓰임이 확인되지 않았다.
const BASE_CLASS =
  "group/toggle-button inline-flex shrink-0 cursor-pointer items-center justify-center rounded-oe-control border font-medium whitespace-nowrap transition-[background-color,border-color,box-shadow,color] outline-none select-none [&_svg]:pointer-events-none [&_svg]:shrink-0"

const SIZE_CLASS: Record<ToggleButtonSize, string> = {
  xsmall: "h-oe-control-xsmall gap-1 px-2.5 text-sm [&_svg:not([class*='size-'])]:size-3",
  small: "h-oe-control-small gap-1 px-3 text-sm [&_svg:not([class*='size-'])]:size-4",
  regular: "h-oe-control-regular gap-1 px-3.5 text-sm [&_svg:not([class*='size-'])]:size-4",
  large: "h-oe-control-large gap-1.5 px-4 text-sm [&_svg:not([class*='size-'])]:size-4",
  xlarge: "h-oe-control-xlarge gap-1.5 px-5 text-base [&_svg:not([class*='size-'])]:size-5",
}

// 아이콘이 붙는 변은 여백을 한 단계 내린다. 아이콘은 글자보다 시각 무게가 가벼워 같은 여백을
// 주면 그쪽이 더 벌어져 보인다. 아이콘은 언제나 Label 앞에 하나만 놓이므로 Button 과 달리
// 뒤쪽 변의 보정은 두지 않는다.
const ICON_SIDE_CLASS: Record<ToggleButtonSize, string> = {
  xsmall: "has-data-[icon=inline-start]:pl-2",
  small: "has-data-[icon=inline-start]:pl-2.5",
  regular: "has-data-[icon=inline-start]:pl-3",
  large: "has-data-[icon=inline-start]:pl-3.5",
  xlarge: "has-data-[icon=inline-start]:pl-4",
}

// Label 이 없으면 좌우 여백을 지우고 높이와 같은 너비를 준다. 즐겨찾기와 찜이 이 모양을 쓴다.
const SQUARE_CLASS: Record<ToggleButtonSize, string> = {
  xsmall: "w-oe-control-xsmall px-0",
  small: "w-oe-control-small px-0",
  regular: "w-oe-control-regular px-0",
  large: "w-oe-control-large px-0",
  xlarge: "w-oe-control-xlarge px-0",
}

// 꺼짐은 Style 과 tone 에 관계없이 하나다. 꺼진 토글은 아직 아무것도 고르지 않은 자리이므로
// 배경도 tone 색도 갖지 않으며, 그래서 Tonal 도 꺼짐에서는 Ghost 와 같은 모습이다. 두 Style 은
// 켜졌을 때 무엇까지 바뀌는지로만 갈린다.
const OFF_CLASS =
  "border-transparent bg-transparent text-oe-foreground-tertiary hover:bg-neutral-100 active:bg-neutral-200 dark:hover:bg-neutral-800 dark:active:bg-neutral-700"

// brand 는 Tailwind 팔레트가 아니라 seed 에서 생성한 `--brand-{단계}` 를 참조한다. 단계 이름이
// 같으므로 색을 꺼내는 방식만 다르고 단계 규칙은 Button 과 그대로 공유한다.
function brandStep(step: number) {
  return `[var(--brand-${step})]`
}

// 켜짐의 단계는 Button 이 쓰는 것과 같다. Ghost 는 글자와 아이콘만 tone 색이 되고 Tonal 은
// 배경까지 함께 생긴다. Hover 와 Pressed 는 어느 Style 에서나 한 단계씩 진하게 밟으며
// Light 는 100→200→300 으로 내려가고 Dark 는 800→700→600 으로 올라가 방향이 서로 반대다.
// Ghost 켜짐의 글자가 Button 의 Label 단계인 800 이 아니라 600 인 것은, 배경이 없어 글자와
// 아이콘만으로 켜짐을 말해야 하는데 800 에는 유채색이 거의 남지 않기 때문이다.
// 클래스를 문자열로 조립하므로 Tailwind 가 소스에서 찾지 못한다. 여기서 쓰는 단계는
// `styles.css` 의 `@source inline` 이 미리 생성한다. 단계를 바꾸면 그쪽도 함께 고친다.
function onClass(variant: ToggleButtonVariant) {
  const color = brandStep

  if (variant === "tonal") return `border-transparent bg-${color(100)} text-${color(800)} hover:bg-${color(200)} active:bg-${color(300)} dark:bg-${color(800)} dark:text-${color(200)} dark:hover:bg-${color(700)} dark:active:bg-${color(600)}`
  return `border-transparent bg-transparent text-${color(600)} hover:bg-${color(100)} active:bg-${color(200)} dark:text-${color(300)} dark:hover:bg-${color(800)} dark:active:bg-${color(700)}`
}

// 즐겨찾기의 노랑과 찜의 빨강은 위 단계 규칙에 들어오지 않는다. Tailwind 팔레트도 seed 에서
// 생성한 값도 아니고, 별과 하트가 그 색으로 굳어져 있어 브랜드를 바꿔도 함께 움직이면 안 되는
// 고정 색이기 때문이다. Button 의 엑셀 색과 같은 자리이며 값의 승격 여부는
// `open-questions.md` 의 token candidate 가 갖는다.
// 조립하지 않고 클래스를 그대로 적으므로 Tailwind 가 이 파일에서 찾는다.
const CUSTOM_ON_CLASS: Record<ToggleButtonColor, Record<ToggleButtonVariant, string>> = {
  favorite: {
    ghost: "border-transparent bg-transparent text-[#dfa010] hover:bg-[#fdf5e2] active:bg-[#fbeccb] dark:text-[#f2c14e] dark:hover:bg-[#4a3708] dark:active:bg-[#5e470b]",
    tonal: "border-transparent bg-[#fdf5e2] text-[#7a5405] hover:bg-[#fbeccb] active:bg-[#f6dfa8] dark:bg-[#4a3708] dark:text-[#f0d59a] dark:hover:bg-[#5e470b] dark:active:bg-[#7a5c0e]",
  },
  like: {
    ghost: "border-transparent bg-transparent text-[#e0313f] hover:bg-[#fdeaec] active:bg-[#fbd5d9] dark:text-[#f87a86] dark:hover:bg-[#4d0f15] dark:active:bg-[#61141b]",
    tonal: "border-transparent bg-[#fdeaec] text-[#7d1620] hover:bg-[#fbd5d9] active:bg-[#f7b8bf] dark:bg-[#4d0f15] dark:text-[#f5b4ba] dark:hover:bg-[#61141b] dark:active:bg-[#7d1a23]",
  },
}

// 두 variant 모두 보이는 경계가 없으므로 `interaction.md` 의 유형 3 을 쓴다. 2px 간격을 두고
// 바깥에 ring 을 그려 배경색과 무관하게 focus 위치가 보이게 한다.
const DETACHED_FOCUS = "focus-visible:ring-2 focus-visible:ring-oe-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-oe-background-primary"

function stateClass(variant: ToggleButtonVariant, tone: ToggleButtonTone, pressed: boolean, color?: ToggleButtonColor) {
  if (!pressed) return OFF_CLASS
  if (tone === "custom") return CUSTOM_ON_CLASS[color ?? "favorite"][variant]
  return onClass(variant)
}

// `color` 는 custom tone 에서만 뜻을 가지므로, 다른 tone 과 함께 쓰면 타입에서 걸리게 둔다.
type ToggleButtonToneProps =
  | { tone?: Exclude<ToggleButtonTone, "custom">; color?: never }
  | { tone: "custom"; color: ToggleButtonColor }

type ToggleButtonVariantsOptions = {
  variant?: ToggleButtonVariant
  tone?: ToggleButtonTone
  controlSize?: ToggleButtonSize
  color?: ToggleButtonColor
  pressed?: boolean
  iconOnly?: boolean
}

function toggleButtonVariants({
  variant = "ghost",
  tone = "brand",
  controlSize = "regular",
  color,
  pressed = false,
  iconOnly = false,
}: ToggleButtonVariantsOptions = {}) {
  return cn(
    BASE_CLASS,
    SIZE_CLASS[controlSize],
    iconOnly ? SQUARE_CLASS[controlSize] : ICON_SIDE_CLASS[controlSize],
    stateClass(variant, tone, pressed, color),
    DETACHED_FOCUS,
  )
}

// 아이콘을 몇 개 받는지는 Style 이 정한다. Ghost 는 배경이 없어 아이콘의 색과 모양이 켜짐을
// 말해야 하므로 `Fill` 을 함께 받고, Tonal 은 배경이 이미 켜짐을 말하므로 아이콘을 그대로 둔다.
// Tonal 에서도 `activeIcon` 을 받게 두면 넘겨도 그려지지 않는 Property 가 생기므로 타입에서 막는다.
type ToggleButtonIconProps =
  | { variant?: "ghost"; icon: React.ReactNode; activeIcon: React.ReactNode }
  | { variant: "tonal"; icon: React.ReactNode; activeIcon?: never }

// Disabled 를 제공하지 않는다. 켤 수 없는 자리에는 이 버튼을 그리지 않기 때문이며, Property 를
// 남겨 두면 시각 표현이 없는 상태를 소비자가 넘길 수 있게 된다. 근거는 `toggle-button.md` 의
// 「현재 정의하지 않은 항목」에 있다.
export type ToggleButtonProps = Omit<TogglePrimitive.Props, "color" | "render" | "className" | "disabled"> & {
  controlSize?: ToggleButtonSize
  className?: string
} & ToggleButtonIconProps & ToggleButtonToneProps

function ToggleButton({
  className,
  variant = "ghost",
  tone = "brand",
  controlSize = "regular",
  color,
  icon,
  activeIcon,
  children,
  ...props
}: ToggleButtonProps) {
  const hasLabel = children !== undefined && children !== null && children !== false
  const iconOnly = !hasLabel

  // Ghost 는 켜짐과 꺼짐에서 서로 다른 아이콘을 그린다. Remix Icon 은 `RiStarLine` 과 `RiStarFill`
  // 이 각각 다른 컴포넌트여서 컴포넌트가 스스로 `Fill` 로 바꿔 그릴 수단이 없기 때문에 둘을 모두
  // 받는다. 둘을 동시에 그려 놓고 CSS 로 감추지 않는 이유는 화면 낭독기가 쓰지 않는 아이콘까지
  // 만나게 되기 때문이다. 그래서 상태를 `render` 로 받아 한쪽만 그린다.
  // Tonal 은 배경이 이미 켜짐을 말하므로 어느 상태에서나 `icon` 하나를 그대로 그린다.
  return (
    <TogglePrimitive
      data-slot="toggle-button"
      data-variant={variant}
      data-tone={tone}
      data-size={controlSize}
      className={(state) =>
        cn(toggleButtonVariants({ variant, tone, controlSize, color, pressed: state.pressed, iconOnly }), className)
      }
      render={(renderProps, state) => (
        <button {...renderProps}>
          <span data-slot="toggle-button-icon" data-icon="inline-start" className="flex shrink-0 items-center">
            {variant === "ghost" && state.pressed ? activeIcon : icon}
          </span>
          {hasLabel ? (
            <span data-slot="toggle-button-label" className="min-w-0 truncate">
              {children}
            </span>
          ) : null}
        </button>
      )}
      {...props}
    />
  )
}

export { ToggleButton, toggleButtonVariants }
