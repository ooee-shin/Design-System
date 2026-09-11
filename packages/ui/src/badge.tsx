import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"

import { cn } from "./utils"

export type BadgeTone = "brand" | "neutral" | "warning" | "danger" | "success" | "info" | "custom"
export type BadgeVariant = "fill" | "tonal" | "outlined"
export type BadgeSize = "small" | "medium"
// `custom` 으로 고를 수 있는 색이다. 타입만 두면 Studio 나 문서가 같은 목록을 따로 적어야 하므로
// 런타임 값으로 내보내고 타입을 여기서 파생한다. Tailwind 의 회색 다섯 중에서는 `gray` 만 남겼다.
// Badge 크기에서 회색끼리는 서로 구별되지 않고, 회색이 필요한 자리는 `neutral` tone 이 담당한다.
export const BADGE_COLORS = [
  "gray",
  "red", "orange", "amber", "yellow", "lime",
  "green", "emerald", "teal", "cyan", "sky", "blue",
  "indigo", "violet", "purple", "fuchsia", "pink", "rose",
] as const

export type BadgeColor = (typeof BADGE_COLORS)[number]

// shadcn base-nova 의 Badge 구조를 가져왔다. 그대로 둔 것은 아이콘이 붙는 변의 여백 보정,
// `render` 로 다른 요소가 되는 방식, 아이콘 크기 고정이다. 바꾼 것은 넷이다. 높이는 20px 과 24px
// 두 단계다. 아이콘은 Label 앞에만 붙으므로 여백 보정도 앞쪽만 남겼다. 모양은
// vocabulary.md 의 `Rounded` 이며 컨트롤의 8px 이 아니라 한 단계 작은 6px 을 쓴다. 20px 높이에서
// 8px 은 반지름이 높이의 40% 라 모서리가 거의 원호로 읽힌다. 좌우 여백은 그 모서리에 맞춰 6px 이다.
// 색은 아래 단계 규칙이 소유한다.
const badgeBase =
  "group/badge inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-sm border border-transparent text-xs font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-oe-focus-ring [&>svg]:pointer-events-none [&>svg]:size-3!"

// 크기는 두 단계이며 덧붙는 표시이므로 작은 쪽이 기본값이다. 높이가 커지면 좌우 여백도 한 단계
// 올린다. 20px 에서 6px 이던 여백을 24px 에서 그대로 두면 글자가 위아래보다 좌우에서 더 붙어
// 보인다. 아이콘이 붙는 변의 보정도 같은 폭으로 따라 올린다. 모서리와 글자 크기는 두 단계가 같이
// 쓰므로 여기에 두지 않는다.
const SIZE_CLASS: Record<BadgeSize, string> = {
  small: "h-5 px-1.5 has-data-[icon=inline-start]:pl-1",
  medium: "h-6 px-2 has-data-[icon=inline-start]:pl-1.5",
}

// tone 은 어느 팔레트를 쓸지만 정하고, variant 는 그 팔레트의 어느 단계를 배경·글자·경계에 쓸지만
// 정한다. 세만틱 token 이름은 tone 마다 구간이 달라서 조합 21개를 하나씩 적게 만들었고, 그래서 한
// 조합을 고쳐도 나머지 20개가 따라오지 않았다. 프리미티브 단계로 내려오면 규칙 셋과 팔레트 일곱의
// 곱이 되어 예외가 남지 않는다. 대신 Light·Dark 단계 쌍을 컴포넌트가 들고 있게 되며, 그 쌍은
// tokens 의 `statusFamily` 와 같은 방향으로 반전한다.
const TONE_PALETTE: Record<Exclude<BadgeTone, "custom">, string> = {
  brand: "brand",
  neutral: "neutral",
  warning: "amber",
  danger: "red",
  success: "green",
  info: "blue",
}

// brand 는 Tailwind 팔레트가 아니라 seed 에서 생성한 `--brand-{단계}` 를 참조한다. 단계 이름이
// 같으므로 색을 꺼내는 방식만 다르고 단계 규칙은 다른 tone 과 그대로 공유한다.
function paletteStep(palette: string, step: number) {
  return palette === "brand" ? `[var(--brand-${step})]` : `${palette}-${step}`
}

// fill 배경은 600 이다. 700 은 WCAG 2.x 대비가 넉넉하지만 amber·yellow·lime 이 황토색으로 읽혀
// tone 이 뜻하는 색을 잃는다. 600 에서 2.x 값이 4.5:1 아래인 색이 절반이지만, 색조를 반영하는
// APCA 로는 white 글자가 전부 60 을 넘고 글자를 950 으로 뒤집으면 21.6~43.6 으로 떨어진다.
// 그래서 어느 색에서나 white 를 쓴다. 근거와 수치는 badge.md 의 「색」에 있다. tonal 배경은 Light 가
// 불투명한 100 이고 Dark 는 300 의 20% 알파다. Dark 에서 불투명한 단계를 쓰면 Surface 가 같은
// 단계인 자리에서 배경이 겹쳐 Container 가 사라진다. 알파는 어느 Surface 위에서나 그 색을 밝히는
// 쪽으로 얹히므로 Surface 단계를 제한하지 않아도 된다.
// 클래스를 문자열로 조립하므로 Tailwind 가 소스에서 찾지 못한다. 여기서 쓰는 단계는
// `styles.css` 의 `@source inline` 이 미리 생성한다. 단계를 바꾸면 그쪽도 함께 고친다.
function toneClass(palette: string, variant: BadgeVariant) {
  const color = (step: number) => paletteStep(palette, step)

  if (variant === "fill") return `bg-${color(600)} text-white`
  if (variant === "outlined") return `border-${color(500)}/30 text-${color(800)} dark:text-${color(300)}`
  return `bg-${color(100)} text-${color(800)} dark:bg-${color(300)}/20 dark:text-${color(200)}`
}

// `color` 는 custom tone 에서만 뜻을 가지므로, 다른 tone 과 함께 쓰면 타입에서 걸리게 둔다.
type BadgeToneProps =
  | { tone?: Exclude<BadgeTone, "custom">; color?: never }
  | { tone: "custom"; color: BadgeColor }

export type BadgeProps = useRender.ComponentProps<"span"> & { variant?: BadgeVariant; size?: BadgeSize } & BadgeToneProps

type BadgeVariantsOptions = { tone?: BadgeTone; variant?: BadgeVariant; size?: BadgeSize; color?: BadgeColor }

function badgeVariants({ tone = "neutral", variant = "tonal", size = "small", color }: BadgeVariantsOptions = {}) {
  const palette = tone === "custom" ? (color ?? "gray") : TONE_PALETTE[tone]

  return cn(badgeBase, SIZE_CLASS[size], toneClass(palette, variant))
}

function Badge({ className, tone = "neutral", variant = "tonal", size = "small", color, render, ...props }: BadgeProps) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ tone, variant, size, color }), className),
      },
      props,
    ),
    render,
    state: {
      slot: "badge",
      tone,
      variant,
      size,
    },
  })
}

export { Badge, badgeVariants }
