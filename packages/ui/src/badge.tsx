import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva } from "class-variance-authority"

import { cn } from "./utils"

export type BadgeTone = "brand" | "neutral" | "warning" | "danger" | "success" | "info" | "custom"
export type BadgeVariant = "fill" | "tonal" | "outlined"
export type BadgeColor =
  | "slate" | "gray" | "zinc" | "neutral" | "stone"
  | "red" | "orange" | "amber" | "yellow" | "lime"
  | "green" | "emerald" | "teal" | "cyan" | "sky" | "blue"
  | "indigo" | "violet" | "purple" | "fuchsia" | "pink" | "rose"

// shadcn base-nova 의 Badge 구조를 가져왔다. 그대로 둔 것은 아이콘이 붙는 변의 여백 보정,
// `render` 로 다른 요소가 되는 방식, 아이콘 크기 고정이다.
// 바꾼 것은 셋이다. 높이는 24px 하나이며 크기 variant 는 뒤에 더한다. 색은 shadcn token 대신
// oe semantic token 만 쓰는데, Tailwind primitive 를 직접 참조하면 Light·Dark 조합을 컴포넌트가
// 들고 있어야 하고 브랜드 seed 가 바뀔 때 따라가지 못하기 때문이다. 아이콘은 Label 앞에만
// 붙으므로 여백 보정도 앞쪽만 남겼다.
const badgeVariants = cva(
  "group/badge inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 text-xs font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-oe-focus-ring has-data-[icon=inline-start]:pl-1.5 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      tone: {
        brand: "",
        neutral: "",
        warning: "",
        danger: "",
        success: "",
        info: "",
        // custom 은 색 이름을 함께 받아야 하므로 클래스를 `customToneClass` 가 조립한다.
        custom: "",
      },
      variant: {
        fill: "",
        tonal: "",
        outlined: "",
      },
    },
    compoundVariants: [
      { tone: "brand", variant: "fill", class: "bg-oe-brand-background-bold-primary text-oe-foreground-inverse" },
      { tone: "brand", variant: "tonal", class: "bg-oe-brand-background-secondary text-oe-brand-foreground-primary" },
      { tone: "brand", variant: "outlined", class: "border-[var(--brand-alpha-30)] text-oe-brand-foreground-primary" },

      { tone: "neutral", variant: "fill", class: "bg-oe-background-bold-primary text-oe-foreground-inverse" },
      { tone: "neutral", variant: "tonal", class: "bg-oe-background-secondary text-oe-foreground-secondary" },
      { tone: "neutral", variant: "outlined", class: "border-oe-border-bold-primary/30 text-oe-foreground-primary" },

      // 상태 tone 은 tokens 의 `statusFamily` 가 만든 semantic token 을 그대로 참조한다.
      // accent 는 token 이 fill 하나뿐이고 그 색이 danger 와 같은 red 계열이라 여기서 뺐다.
      // outlined 의 경계는 어느 tone 에서나 그 tone 색의 30% 알파다.
      { tone: "warning", variant: "fill", class: "bg-oe-warning-background-bold-primary text-oe-foreground-inverse" },
      { tone: "warning", variant: "tonal", class: "bg-oe-warning-background-secondary text-oe-warning-foreground-primary" },
      { tone: "warning", variant: "outlined", class: "border-oe-warning-border-primary/30 text-oe-warning-foreground-primary" },

      { tone: "danger", variant: "fill", class: "bg-oe-danger-background-bold-primary text-oe-foreground-inverse" },
      { tone: "danger", variant: "tonal", class: "bg-oe-danger-background-secondary text-oe-danger-foreground-primary" },
      { tone: "danger", variant: "outlined", class: "border-oe-danger-border-primary/30 text-oe-danger-foreground-primary" },

      { tone: "success", variant: "fill", class: "bg-oe-success-background-bold-primary text-oe-foreground-inverse" },
      { tone: "success", variant: "tonal", class: "bg-oe-success-background-secondary text-oe-success-foreground-primary" },
      { tone: "success", variant: "outlined", class: "border-oe-success-border-primary/30 text-oe-success-foreground-primary" },

      { tone: "info", variant: "fill", class: "bg-oe-info-background-bold-primary text-oe-foreground-inverse" },
      { tone: "info", variant: "tonal", class: "bg-oe-info-background-secondary text-oe-info-foreground-primary" },
      { tone: "info", variant: "outlined", class: "border-oe-info-border-primary/30 text-oe-info-foreground-primary" },
    ],
    defaultVariants: {
      tone: "neutral",
      variant: "tonal",
    },
  },
)

// custom tone 은 semantic family 가 없는 색을 임시로 쓰는 자리이며, tokens 의 `statusFamily` 와
// 같은 단계 규칙으로 Tailwind primitive 를 조립한다. 단계를 같게 두면 나중에 그 색을 semantic
// family 로 올려도 화면의 색이 달라지지 않는다. 클래스를 문자열로 만들기 때문에 Tailwind 가
// 소스에서 찾지 못하므로 `styles.css` 의 `@source inline` 이 해당 단계를 미리 생성한다.
function customToneClass(color: BadgeColor, variant: BadgeVariant) {
  const foreground = `text-${color}-800 dark:text-${color}-200`

  if (variant === "fill") return `bg-${color}-700 dark:bg-${color}-400 text-oe-foreground-inverse`
  if (variant === "outlined") return `border-${color}-500/30 ${foreground}`
  return `bg-${color}-100 dark:bg-${color}-900 ${foreground}`
}

// `color` 는 custom tone 에서만 뜻을 가지므로, 다른 tone 과 함께 쓰면 타입에서 걸리게 둔다.
type BadgeToneProps =
  | { tone?: Exclude<BadgeTone, "custom">; color?: never }
  | { tone: "custom"; color: BadgeColor }

export type BadgeProps = useRender.ComponentProps<"span"> & { variant?: BadgeVariant } & BadgeToneProps

function Badge({ className, tone = "neutral", variant = "tonal", color, render, ...props }: BadgeProps) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(
          badgeVariants({ tone, variant }),
          tone === "custom" ? customToneClass(color ?? "neutral", variant) : undefined,
          className,
        ),
      },
      props,
    ),
    render,
    state: {
      slot: "badge",
      tone,
      variant,
    },
  })
}

export { Badge, badgeVariants }
