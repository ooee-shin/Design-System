// `system-drift.mjs` 의 시험. 두 갈래다.
//
// (a) 살아 있는 저장소 — 하나만. 도구가 돌아가고 exit 0 이며 보고 꼴이 맞는지까지만 본다. 오늘 저장소의 어긋남 목록·개수·이름은
//     단정하지 않는다 — 그러면 기획자의 문서 수정이나 개발자의 코드 수정이 이 시험을 붉히고, 도구의 「막지 않고 알린다」가 뒤집힌다.
// (b) fixture 폴더 — 임시 디렉터리에 최소 저장소를 써서 `measure` 를 돌린다. 기본 fixture 는 모든 짝이 「같다」 이고, 짝마다
//     파일 하나를 고쳐 「다르다」 와 「못 읽었다」 가 나오는지 고정한다. 문장·표·펜스가 조금 바뀌어도 읽히는지도 여기서 본다.
//     모듈 최상위에서는 저장소를 읽지 않는다.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  ENUM_TABLE,
  FILES,
  NOT_MEASURED,
  PAIRS,
  classifyEnumLine,
  compareBadgeColorCount,
  compareBadgeSpecTable,
  compareBadgeToneTable,
  compareBottomNavigationMax,
  compareCheckboxControl,
  compareCheckboxIndicatorIcons,
  compareColorList,
  compareEnums,
  compareInteraction,
  compareLlms,
  compareNeutralList,
  compareReadmeTable,
  compareTextareaFieldHeight,
  compareTextareaHeight,
  expandAbbreviation,
  expandRoleList,
  familyOf,
  formatReport,
  formatUnreadable,
  koreanNumber,
  main,
  measure,
  namesOfBrokenLine,
  paragraphsOf,
  parseBadgeToneClass,
  parseBooleanProp,
  parseCvaVariantKeys,
  parseDocPaths,
  parseInlineUnion,
  parseRecordKeys,
  parseTable,
  parseTypeUnion,
  proseValueClaims,
  proseValueNote,
  sectionOf,
  sentenceAround,
  themeBlocksOf,
  unmeasuredEnumLines,
} from "./system-drift.mjs";

const script = fileURLToPath(new URL("./system-drift.mjs", import.meta.url));

// ---------------------------------------------------------------------------------------------------------------------
// (a) 살아 있는 저장소 — 돌아가고 exit 0 이며 보고 꼴이 맞는다. 내용은 단정하지 않는다.
// ---------------------------------------------------------------------------------------------------------------------

test("실제 저장소에서 돌아가고 exit 0 이며, 첫 줄은 요약이고 짝 줄은 ⚠·=·? 셋 중 하나로 시작한다", () => {
  const plain = spawnSync(process.execPath, [script], { encoding: "utf8" });
  assert.equal(plain.status, 0, plain.stderr);
  const lines = plain.stdout.trimEnd().split("\n");
  assert.match(lines[0], /^docs\/system 과 코드가 (맞는다\(\d+개 짝\)|어긋난 곳 \d+곳, 못 읽은 곳 \d+곳 \(\d+개 짝을 잼\))$/);
  const body = lines.slice(1, lines.indexOf(""));
  assert.equal(body.length >= PAIRS.length, true, "짝마다 적어도 한 줄이 있다");
  for (const line of body) assert.match(line, /^[⚠=?] /, line);
  assert.ok(lines.includes("재지 않는 것:"));
  const strict = spawnSync(process.execPath, [script, "--strict"], { encoding: "utf8" });
  assert.ok([0, 1].includes(strict.status));
  assert.equal(strict.stdout, plain.stdout, "--strict 는 exit 만 바꾼다");
});

// ---------------------------------------------------------------------------------------------------------------------
// (b) fixture 폴더
// ---------------------------------------------------------------------------------------------------------------------

const doc = (key) => `${FILES.componentDocs}/${key}.md`;
const ui = (key) => `${FILES.uiSrc}/${key}.tsx`;
const studioDir = (key) => `${FILES.studioComponents}/${key}/page.tsx`;

const CONFIRMED = [
  ["app-header", "App Header", "모바일 화면 최상단의 한 줄"],
  ["badge", "Badge", "다른 요소에 덧붙어 상태나 개수를 표시"],
  ["bottom-navigation", "Bottom Navigation", "모바일 화면 맨 아래의 한 줄"],
  ["button", "Button", "누르면 실행되는 액션"],
  ["checkbox", "Checkbox", "선택 여부를 표시하고 제어"],
  ["chip", "Chip", "짧은 Label 로 값 하나를 표시"],
  ["combobox", "Combobox", "검색해서 하나를 고른다"],
  ["input", "Input", "한 줄 입력"],
  ["input-button", "Input Button", "입력란 모양의 버튼"],
  ["message-bubble", "Message Bubble", "메시지 하나의 말풍선"],
  ["notification-badge", "Notification Badge", "새 알림이나 읽지 않은 수를 표시"],
  ["number-input", "Number Input", "숫자 입력"],
  ["radio", "Radio", "여럿 가운데 하나"],
  ["select", "Select", "목록에서 하나를 고른다"],
  ["switch", "Switch", "켬·끔"],
  ["textarea", "Textarea", "여러 줄 입력"],
  ["toggle-button", "Toggle Button", "누른 표시가 화면에 남는 아이콘 버튼"],
];

const registrySource = [
  "export const componentRegistry: ComponentRegistryItem[] = [",
  ...CONFIRMED.map(([key, title, description]) => `  { key: "${key}", title: "${title}", description: "${description}", status: "확정", href: "/components/${key}" },`),
  '  { key: "tabs", title: "Tabs", description: "탭.", status: "초안", similar: ["chip"] },',
  "];",
  "",
].join("\n");

const readmeSource = [
  "# 시스템",
  "",
  "## 구조",
  "",
  "| 위치 | 성격 |",
  "| --- | --- |",
  "| `packages/ui` | 공용 Component |",
  "| `apps/studio` | 검수 화면 |",
  "",
  "## Component",
  "",
  "상태의 단일 원본은 `apps/studio/src/components/component-registry.ts`이다.",
  "",
  "| 컴포넌트 | 상태 | 문서 | 용도 |",
  "| --- | --- | --- | --- |",
  ...CONFIRMED.map(([key, title, description]) => `| ${title} | 확정 | [${key}.md](components/${key}.md) | ${description} |`),
  "| Tabs | 초안 | 없음 | 탭 |",
  "",
  "`packages/ui`는 위 외에 `PartialMaskedInput`을 함께 제공한다.",
  "",
  "## 다음",
  "",
].join("\n");

const uiIndexSource = [
  'export { AppHeader, type AppHeaderProps } from "./app-header";',
  'export { Badge, BADGE_COLORS, type BadgeProps } from "./badge";',
  'export { BottomNavigation, BOTTOM_NAVIGATION_MAX_ITEMS } from "./bottom-navigation";',
  'export { Button, BUTTON_COLORS } from "./button";',
  'export { Checkbox } from "./checkbox";',
  'export { Chip } from "./chip";',
  'export { Combobox } from "./combobox";',
  'export { Input } from "./input";',
  'export { InputButton } from "./input-button";',
  'export { MessageBubble, TypingIndicator, type MessageDeliveryState, type MessageDirection } from "./message-bubble";',
  'export { NotificationBadge } from "./notification-badge";',
  'export { NumberInput } from "./number-input";',
  'export { PartialMaskedInput } from "./partial-masked-input";',
  'export { Radio } from "./radio";',
  'export { Select } from "./select";',
  'export { Switch } from "./switch";',
  'export { Textarea } from "./textarea";',
  'export { ToggleButton, TOGGLE_BUTTON_COLORS } from "./toggle-button";',
  "",
].join("\n");

const llmsSource = `# ooee\n\n확정 ${CONFIRMED.length}종: ${CONFIRMED.map(([key]) => `\`${key}\``).join(" ")}\n\n초안(쓰지 않는다): \`tabs\`\n`;

const head = (key, title) => `# ${title}\n\n\`packages/ui/src/${key}.tsx\`\n\n`;

const badgeSrc = `export type BadgeTone = "brand" | "neutral" | "warning" | "danger" | "success" | "info" | "custom"
export type BadgeVariant = "fill" | "tonal" | "outlined"
export type BadgeSize = "small" | "medium"

export const BADGE_COLORS = [
  "gray",
  "red", "orange", "amber", "yellow", "lime",
  "green", "emerald", "teal", "cyan", "sky", "blue",
  "indigo", "violet", "purple", "fuchsia", "pink", "rose",
] as const

const SIZE_CLASS: Record<BadgeSize, string> = {
  small: "h-5 px-1.5 has-data-[icon=inline-start]:pl-1",
  medium: "h-6 px-2 has-data-[icon=inline-start]:pl-1.5",
}

function toneClass(palette: string, variant: BadgeVariant) {
  const color = (step: number) => paletteStep(palette, step)

  if (variant === "fill") return \`bg-\${color(600)} text-white\`
  if (variant === "outlined") return \`border-\${color(500)}/30 text-\${color(800)} dark:text-\${color(300)}\`
  return \`bg-\${color(100)} text-\${color(800)} dark:bg-\${color(300)}/20 dark:text-\${color(200)}\`
}
`;

const badgeDoc = `${head("badge", "Badge")}## Properties

- \`tone\`: \`brand | neutral | warning | danger | success | info | custom\`, 기본값 \`neutral\`
- \`variant\`: \`fill | tonal | outlined\`, 기본값 \`tonal\`. Style 을 고르는 기준은 아래 Guidelines 에 있다
- \`size\`: \`small | medium\`, 기본값 \`small\`. 20px 과 24px 이며 실제 값은 아래 Specification 에 있다
- \`color\`: \`BADGE_COLORS\` 의 18색 중 하나. \`tone="custom"\` 에서만 뜻을 가지므로 다른 tone 과 함께 넘기면 타입에서 걸린다

## 색

- \`custom\` 은 \`color\` 로 Tailwind primitive 18색 중 하나를 받으며, 목록은 \`@ooee/ui\` 가 \`BADGE_COLORS\` 로 내보낸다.
- **회색 계열은 \`gray\` 하나만 둔다.** Tailwind 의 \`slate\`·\`zinc\`·\`neutral\`·\`stone\` 은 Badge 크기에서 \`gray\` 와 구별되지 않는다.

| 자리 | Light | Dark |
| --- | --- | --- |
| \`fill\` 배경 | 600 | 600 |
| \`fill\` 글자 | \`white\` | \`white\` |
| \`tonal\` 배경 | 100 | 300 의 20% 알파 |
| \`tonal\` 글자 | 800 | 200 |
| \`outlined\` 경계 | 500 의 30% 알파 | 500 의 30% 알파 |
| \`outlined\` 글자 | 800 | 300 |

## Specification

| 자리 | \`small\` | \`medium\` |
| --- | --- | --- |
| 높이 | 20px | 24px |
| 좌우 여백 | 6px | 8px |
| 아이콘이 붙는 변 | 4px | 6px |
| 모서리 | 6px | 6px |
`;

const buttonSrc = 'export type ButtonTone = "brand" | "neutral" | "danger" | "custom"\nexport type ButtonVariant = "fill" | "tonal" | "outline" | "ghost"\nexport type ButtonSize = "xsmall" | "small" | "regular" | "large" | "xlarge"\nexport type ButtonLayout = "hug" | "fill"\n\nexport const BUTTON_COLORS = ["excel"] as const\n';
const buttonDoc = `${head("button", "Button")}## Properties\n\n- \`variant\` (Style): \`fill | tonal | outline | ghost\`, 기본값 \`fill\`\n- \`tone\`: \`brand | neutral | danger | custom\`, 기본값 \`brand\`\n- \`color\`: \`tone\`이 \`custom\`일 때만 받으며 현재 값은 \`excel\` 하나다. 다른 tone과 함께 넘기면 타입에서 걸린다.\n- \`controlSize\` (Size): \`xsmall | small | regular | large | xlarge\`, 기본값 \`regular\`\n- \`layout\`: \`hug | fill\`, 기본값 \`hug\`\n`;

const toggleSrc = 'export type ToggleButtonTone = "brand" | "custom"\nexport type ToggleButtonVariant = "ghost" | "tonal"\nexport type ToggleButtonSize = "xsmall" | "small" | "regular" | "large" | "xlarge"\n\nexport const TOGGLE_BUTTON_COLORS = ["favorite", "like"] as const\n';
const toggleDoc = `${head("toggle-button", "Toggle Button")}## Properties\n\n- \`variant\` (Style): \`ghost | tonal\`, 기본값 \`ghost\`. 둘은 꺼짐에서 같은 모습이다.\n- \`tone\`: \`brand | custom\`, 기본값 \`brand\`\n- \`color\`: \`tone\`이 \`custom\`일 때만 받으며 값은 \`favorite\`과 \`like\`다. 다른 tone과 함께 넘기면 타입에서 걸린다.\n- \`controlSize\` (Size): \`xsmall | small | regular | large | xlarge\`, 기본값 \`regular\`\n`;

/** 실제 bottom-navigation.tsx 의 꼴 — `VARIANT_CLASS` 안의 `//` 주석 줄과 값이 다음 줄로 내려간 키(`floating:`)를 읽는지 이것으로 본다. */
const navSrc = `const MAX_ITEMS = 5

const VARIANT_CLASS = {
  // 바닥에 붙는 줄은 아래 여백을 자기 안쪽에 갖는다. 위쪽 선은 \`oe-border-secondary\` 보다 옅다.
  bar: "sticky bottom-0 w-full border-t",
  // 떠 있는 알약은 같은 여백을 바깥으로 내보낸다.
  floating:
    "bottom-3 mx-3 rounded-full shadow-sm",
} as const

export type BottomNavigationProps = {
  items: BottomNavigationItem[]
  showLabels?: boolean
  variant?: BottomNavigationVariant
}

export type BottomNavigationVariant = keyof typeof VARIANT_CLASS

function BottomNavigation({ items }) {
  if (items.length > MAX_ITEMS) {
    throw new Error(\`BottomNavigation 은 항목을 \${MAX_ITEMS} 개까지 받는다.\`)
  }
}

export { BottomNavigation, MAX_ITEMS as BOTTOM_NAVIGATION_MAX_ITEMS }
`;
/** 「### 색」 의 둘째 항목은 bottom-navigation.md:78 의 꼴(백틱 없음, 「에서」) — 컴포넌트 문서의 산문 값 주장이 「참고」 에 파일:행으로 나오는지 이것으로 본다. */
const navDoc = `${head("bottom-navigation", "Bottom Navigation")}## Properties\n\n- \`items\`: 필수다. 항목 셋부터 다섯까지다. 여섯을 넘기면 컴포넌트가 오류를 낸다.\n- \`variant\` (Style): \`bar | floating\`, 기본값 \`bar\`. \`bar\`는 화면 바닥에 붙고 \`floating\`은 떠서 알약으로 선다.\n- \`showLabels\`: \`false | true\`, 기본값 \`false\`.\n\n## 항목 목록을 받는 이유\n\n항목을 자식이 아니라 목록으로 받는다.\n\n**항목이 다섯을 넘으면 오류를 낸다.** 조용히 잘라 내면 넘긴 항목이 화면에서 사라진 이유를 알 수 없다.\n\n## Guidelines\n\n### 항목 정하기\n\n- 항목은 셋부터 다섯까지 둔다. 둘이면 화면을 가르는 것이 아니라 값을 고르는 것이므로 다른 컴포넌트를 쓴다.\n\n### 색\n\n- 선택되지 않은 항목: Icon과 Label이 함께 \`oe-foreground-subtle\`이다.\n- 선택된 항목: Icon과 Label이 함께 \`oe-foreground-primary\`다. **Brand를 쓰지 않는다.** \`oe-foreground-primary\`는 Light에서 neutral-950, Dark에서 neutral-50이라 두 테마 모두 나머지 항목과 가장 멀다.\n`;

const textareaSrc = `const textareaContainerVariants = cva(
  "group/textarea flex min-h-20 w-full min-w-0 flex-col overflow-hidden rounded-oe-control border text-sm",
  { variants: { variant: { outline: "border-oe-border-secondary" } } },
)

function Textarea({
  height = 80,
  autoSize = false,
}) {
  return (
    <div data-slot="textarea-container" style={autoSize ? undefined : { height: Math.max(80, height) }} className={cn(textareaContainerVariants({ variant }))}>
      <textarea data-slot="textarea" className={cn("min-h-[4.875rem] min-w-0 flex-1 resize-none overflow-y-auto bg-transparent px-3 py-2 leading-5", className)} />
    </div>
  )
}
`;
const textareaDoc = `${head("textarea", "Textarea")}## Properties\n\n### Height\n\n- \`autoSize=false\`일 때 초기 높이를 숫자(px)로 설정할 수 있다.\n- 최소값은 80px이며 그보다 작은 값은 80px로 제한한다.\n- 기본값은 80px이다.\n\n## Guidelines\n\n### 기본 높이는 3.5줄을 유지하기\n\n기본 높이는 80px이며, 내용이 넘칠 때 3.5줄이 보인다.\n\n## Specification\n\n- Width: \`100%\`\n- Minimum height: \`80px\`\n- Textarea field minimum height: \`78px\` (Container border를 포함한 전체 최소 높이 80px)\n- Typography: \`14px / 20px\`\n`;

const checkboxSrc = `const checkboxIndicatorVariants = cva(
  "inline-grid size-4 shrink-0 place-items-center transition-[background-color,border-color,color]",
  {
    variants: {
      shape: {
        square: cn("rounded-none", filledIndicatorClasses),
        rounded: cn("rounded", filledIndicatorClasses),
        ghost: "rounded border border-transparent bg-transparent text-oe-foreground-placeholder",
      },
    },
    defaultVariants: { shape: "rounded" },
  },
)

const checkboxVariants = cva(
  "group/checkbox inline-grid size-4 shrink-0 place-items-center outline-none focus-visible:ring-2",
  {
    variants: {
      shape: {
        square: cn("rounded-none", filledCheckboxClasses),
        rounded: cn("rounded", filledCheckboxClasses),
        ghost: "rounded data-[checked]:[&>[data-slot=checkbox-indicator]]:text-oe-brand-foreground-primary",
      },
    },
    defaultVariants: { shape: "rounded" },
  },
)

type CheckboxFieldProps = CheckboxProps & {
  label: React.ReactNode
  layout?: "hug" | "fill"
}

function CheckboxIndicator({ shape, checked, indeterminate }) {
  return (
    <span data-slot="checkbox-indicator">
      {children ?? (shape === "ghost" ? (
        <RiCheckLine className="size-[15px]" />
      ) : indeterminate ? (
        <RiSubtractLine className="size-2.5" />
      ) : (
        <RiCheckLine data-slot="checkbox-indicator-check" className={cn("size-2.5", checked ? "opacity-100" : "opacity-0")} />
      ))}
    </span>
  )
}
`;
const checkboxDoc = `${head("checkbox", "Checkbox")}## Anatomy\n\n2. Checkbox control: 선택 상태, Border와 Focus를 표시하는 16px Checkbox 본체\n\n\`CheckboxIndicator\`는 Checkbox의 16px 비상호작용 시각 base다.\n\n## Properties\n\n- \`shape\`: \`square | rounded | ghost\`, 기본값 \`rounded\`\n- \`layout\`: \`hug | fill\`, 기본값 \`hug\`\n\nSeed Checkbox의 Label과 Shape 구조를 참고해 OOEE 컴포넌트로 대응한다. Control은 16px다. Square Indicator는 0px radius, Rounded Indicator는 4px radius이며 둘 다 10px icon을 사용한다. 박스 없이 Indicator 자체로 구분하는 Ghost icon은 15px다.\n\n## Specification\n\n- Control: 16 × 16px\n- Indicator: Square·Rounded 10 × 10px / Ghost 15 × 15px\n- Label: 14px / 20px\n`;

const notificationSrc = 'export type NotificationBadgeTone = "accent" | "neutral"\n\nexport type NotificationBadgeMax = 99 | 999\n';
const notificationDoc = `${head("notification-badge", "Notification Badge")}## Properties\n\n- \`max\`: \`99 | 999\`, 기본값 \`99\`. \`count\` 를 함께 넘길 때만 받는다\n- \`tone\`: \`accent | neutral\`, 기본값 \`accent\`\n`;
const appHeaderSrc = 'export type AppHeaderTitleAlign = "center" | "start"\n\nexport type AppHeaderProps = {\n  title: string\n  titleHidden?: boolean\n  titleAlign?: AppHeaderTitleAlign\n  sticky?: boolean\n}\n';
const appHeaderDoc = `${head("app-header", "App Header")}## Properties\n\n- \`titleHidden\`: \`false | true\`, 기본값 \`false\`. 제목을 화면에서만 감춘다.\n- \`titleAlign\`: \`center | start\`, 기본값 \`center\`\n- \`sticky\`: \`false | true\`, 기본값 \`true\`\n`;

/** 실제 input.tsx 의 꼴 — cva 안의 `//` 주석 줄, 두 객체에 나뉜 `layout` 유니온, 인라인 `textAlign` 유니온. InputButton·NumberInput 이 이 cva 를 함께 쓴다. */
const inputSrc = `const inputContainerVariants = cva(
  "group/input flex w-full min-w-0 items-center rounded-oe-control border",
  {
    variants: {
      variant: {
        outline: "border-oe-border-secondary bg-oe-background-primary",
        // 바닥이 밝아지는 것은 그 자리를 쓰고 있는 동안의 표시다.
        filled:
          "border-transparent bg-oe-background-secondary",
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

type InputLayoutProps =
  | { layout?: "fill"; fixedWidth?: never }
  | { layout: "fixed"; fixedWidth: React.CSSProperties["width"] }

type InputProps = NativeInputProps &
  VariantProps<typeof inputContainerVariants> & {
    clearable?: boolean
    textAlign?: "left" | "right"
  } & InputLayoutProps

export { Input, inputContainerVariants }
`;
const inputDoc = `${head("input", "Input")}## Properties\n\n- \`variant\` (Style): \`outline | filled\`, 기본값 \`outline\`\n- \`controlSize\` (Size): \`small | regular | large | xlarge\`, 기본값 \`regular\`\n- \`layout\`: \`fill | fixed\`, 기본값 \`fill\`\n- \`textAlign\`: \`left | right\`, 기본값 \`left\`. 입력값과 Placeholder에만 적용\n`;
const inputButtonSrc = 'import { inputContainerVariants } from "./input"\n\ntype InputButtonLayoutProps =\n  | { layout?: "fill"; fixedWidth?: never }\n  | { layout: "fixed"; fixedWidth: React.CSSProperties["width"] }\n\ntype InputButtonProps = VariantProps<typeof inputContainerVariants> & { value?: string } & InputButtonLayoutProps\n\nexport { InputButton }\n';
const inputButtonDoc = `${head("input-button", "Input Button")}## Properties\n\n- \`variant\` (Style): \`outline | filled\`, 기본값 \`outline\`\n- \`controlSize\` (Size): \`small | regular | large | xlarge\`, 기본값 \`regular\`\n- \`layout\`: \`fill | fixed\`, 기본값 \`fill\`\n`;
const numberInputSrc = 'import { Input, type InputProps } from "./input"\n\ntype NumberInputAffixTone = "secondary" | "tertiary"\n\ntype NumberInputProps = Omit<InputProps, "type" | "layout" | "fixedWidth"> & {\n  value?: number\n  prefixTone?: NumberInputAffixTone\n  suffixTone?: NumberInputAffixTone\n  controlsPosition?: "trailing" | "split"\n} & (\n  | { layout?: "fill"; fixedWidth?: never }\n  | { layout: "fixed"; fixedWidth: React.CSSProperties["width"] }\n)\n\nfunction NumberInput({ layout = "fill", fixedWidth }) {\n  return <Input {...(layout === "fixed" ? { layout: "fixed" as const, fixedWidth } : { layout: "fill" as const })} />\n}\n\nexport { NumberInput }\n';
/** 「- `prefixTone`, `suffixTone`: 각각 `…`」 은 실제 number-input.md:30 의 꼴 — 한 줄에 prop 둘과 「각각」 이 있어도 읽는지 이것으로 본다. */
const numberInputDoc = `${head("number-input", "Number Input")}## Properties\n\n- \`variant\` (Style): \`outline | filled\`, 기본값 \`outline\`\n- \`controlSize\` (Size): \`small | regular | large | xlarge\`, 기본값 \`regular\`\n- \`layout\`: \`fill | fixed\`, 기본값 \`fill\`\n- \`textAlign\` (Text alignment): \`left | right\`, 기본값 \`left\`. Split controls에서는 중앙 정렬이 우선\n- \`prefixTone\`, \`suffixTone\`: 각각 \`secondary | tertiary\`, 기본값 \`secondary\`\n- \`controlsPosition\`: \`trailing | split\`, 기본값 \`trailing\`\n`;
const selectionTriggerSrc = 'import { cva } from "class-variance-authority"\n\nconst selectionTriggerVariants = cva(\n  // 목록이 열려 있는 동안 Trigger 에 Focus 와 같은 표시를 남긴다.\n  "flex w-full min-w-0 items-center rounded-oe-control border text-left",\n  {\n    variants: {\n      variant: {\n        outline: "border-oe-border-secondary bg-oe-background-primary",\n        filled: "border-transparent bg-oe-background-secondary",\n      },\n      controlSize: {\n        small: "h-oe-control-small gap-1.5 px-2.5 text-sm",\n        regular: "h-oe-control-regular gap-2 px-3 text-sm",\n        large: "h-oe-control-large gap-2 px-3 text-sm",\n        xlarge: "h-oe-control-xlarge gap-2.5 px-4 text-base",\n      },\n    },\n    defaultVariants: { variant: "outline", controlSize: "regular" },\n  },\n)\n\nexport { selectionTriggerVariants }\n';
const selectSrc = 'import { selectionTriggerVariants } from "./selection-trigger"\n\ntype SelectLayoutProps =\n  | { layout?: "fill"; fixedWidth?: never }\n  | { layout: "fixed"; fixedWidth: React.CSSProperties["width"] }\n\ntype SelectProps = VariantProps<typeof selectionTriggerVariants> & SelectLayoutProps & { value?: string | null }\n\ntype MultiSelectProps = SelectLayoutProps & {\n  valueDisplay?: "summary" | "count"\n}\n\nexport { Select, selectionTriggerVariants }\n';
/** 「- `MultiSelect.valueDisplay`: …」 는 실제 select.md:49 의 꼴 — 컴포넌트 이름을 앞에 붙인 prop 을 ENUM_TABLE 의 `as` 로 읽는지 이것으로 본다. */
const selectDoc = `${head("select", "Select")}## Properties\n\n- \`variant\`: \`outline | filled\`, 기본값 \`outline\`\n- \`controlSize\`: \`small | regular | large | xlarge\`, 기본값 \`regular\`\n- \`layout\`: \`fill | fixed\`, 기본값 \`fill\`\n- \`MultiSelect.valueDisplay\`: \`summary | count\`, 기본값 \`summary\`\n`;
const comboboxSrc = 'import { selectionTriggerVariants } from "./selection-trigger"\n\nconst comboboxTriggerVariants = selectionTriggerVariants\n\ntype ComboboxProps = VariantProps<typeof comboboxTriggerVariants> & { options: ComboboxOption[] }\n\ntype MultiComboboxProps = ComboboxProps & {\n  selectedItems?: "container" | "none"\n}\n\nexport { Combobox, comboboxTriggerVariants }\n';
const comboboxDoc = `${head("combobox", "Combobox")}## Properties\n\n- \`variant\`: \`outline | filled\`, 기본값 \`outline\`\n- \`controlSize\`: \`small | regular | large | xlarge\`, 기본값 \`regular\`\n- \`MultiCombobox.selectedItems\`: \`container | none\`, 기본값 \`container\`\n`;
const radioSrc = 'type RadioProps = RadioPrimitive.Root.Props & { className?: string }\n\ntype RadioFieldProps = RadioProps & {\n  label: React.ReactNode\n  layout?: "hug" | "fill"\n}\n\nexport { Radio, RadioField }\n';
const radioDoc = `${head("radio", "Radio")}## Properties\n\n- \`layout\`: \`hug | fill\`, 기본값 \`hug\`. 값의 뜻은 interaction.md 의 「공통 너비 Layout」이 소유한다\n`;
const switchSrc = 'type SwitchProps = SwitchPrimitive.Root.Props & {\n  className?: string\n  controlSize?: "small" | "medium" | "large"\n}\n\ntype SwitchFieldProps = SwitchProps & {\n  label: React.ReactNode\n  labelPosition?: "left" | "right"\n}\n\nexport { Switch, SwitchField }\n';
/** switch.md 「### Size」 는 단계마다 서술하는 줄이라 열거 줄이 아니다 — NOT_MEASURED 가 말하는 그 꼴. 「### State」 의 「같은 값이며」 는 switch.md:48 의 꼴 — 「참고」 에 파일:행으로 나오는지 이것으로 본다. */
const switchDoc = `${head("switch", "Switch")}## Properties\n\n### Size\n\n- \`small\`: Control \`26×16px\`, Thumb \`12px\`.\n- \`medium\`: Control \`38×24px\`, Thumb \`20px\`. 기본값이다.\n- \`large\`: Control \`52×32px\`, Thumb \`26px\`.\n- React Property 이름은 공용 control 문법에 맞춰 \`controlSize\`를 사용한다.\n\n### Label position\n\n- \`labelPosition\`: \`left | right\`, 기본값 \`right\`\n\n### State\n\n- On: \`oe-brand-background-bold-primary\` Track과 흰색 Thumb을 사용한다. Radio·Checkbox의 켜진 상태와 같은 값이며, 근거는 interaction.md 다.\n`;
const chipSrc = 'type ChipTone = "secondary" | "tertiary"\ntype ChipShape = "rounded" | "circle"\ntype ChipSize = "compact" | "xsmall" | "small" | "regular" | "large" | "xlarge"\n';
/** 「- `leadingTone`, `trailingTone`: …」 은 실제 chip.md:38 의 꼴 — 한 줄에 prop 이 둘인 열거 줄을 각각 재는지 이것으로 본다. */
const chipDoc = `${head("chip", "Chip")}## Properties\n\n- \`controlSize\`: \`compact | xsmall | small | regular | large | xlarge\`, 기본값 \`regular\`\n- \`shape\`: \`circle | rounded\`, 기본값 \`circle\`\n- \`leadingTone\`, \`trailingTone\`: \`secondary | tertiary\`, 기본값 \`secondary\`\n\n글자는 \`text-oe-label\` 을 쓴다.\n`;

const bubbleSrc = 'export type MessageDirection = "incoming" | "outgoing";\nexport type MessageDeliveryState = "sending" | "sent" | "read" | "failed";\n\nexport function MessageBubble({\n  deleted = false,\n  showAvatar = true,\n  grouped = false,\n}: {\n  direction: MessageDirection;\n  deliveryState?: MessageDeliveryState;\n  deleted?: boolean;\n  showDeletedContent?: boolean;\n  showAvatar?: boolean;\n  grouped?: boolean;\n  showTime?: boolean;\n}) {}\n';
/** message-bubble.md 의 「## Properties」 꼴 — 유니온 둘과 boolean 다섯. 13 줄이며 뒤에 절을 덧붙이는 시험이 행 번호를 센다. */
const bubbleDoc = `${head("message-bubble", "Message Bubble")}## Properties\n\n- \`direction\`: \`incoming | outgoing\`. 필수다\n- \`deliveryState\`: \`sending | sent | read | failed\`. 넘기지 않으면 전달 상태를 그리지 않는다\n- \`deleted\`: \`false | true\`, 기본값 \`false\`\n- \`showDeletedContent\`: \`false | true\`, 기본값은 방향에 따른다\n- \`showAvatar\`: \`false | true\`, 기본값 \`true\`\n- \`grouped\`: \`false | true\`, 기본값 \`false\`\n- \`showTime\`: \`false | true\`, 기본값은 \`grouped\` 의 반대다\n`;

/** packages/tokens/src/index.ts 의 꼴을 줄여 베낀 것. `rgbFromHex` 의 `return {` 가 brand mapping 과 섞이지 않는지도 이것으로 본다. */
const tokensSrc = `export const BRAND_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
export const BRAND_ALPHA_STEPS = [5, 8, 10, 16, 20, 30, 40, 50, 60, 70, 80, 90] as const;

export const CONTROL_HEIGHTS = {
  xxsmall: 24,
  xsmall: 28,
  small: 32,
  regular: 36,
  large: 40,
  xlarge: 48,
  xxlarge: 56,
} as const;

export const COMPACT_HEIGHT = 20;

export const ICON_SIZES = {
  xsmall: 12,
  small: 16,
  medium: 20,
  large: 24,
  xlarge: 32,
} as const;

export const PADDINGS = {
  default: 16,
  wide: 40,
} as const;

export const RADII = {
  control: 8,
  sm: 6,
  md: 8,
  "2xl": 18,
} as const;

const semantic = (family: SemanticFamily, name: string, light: string, dark: string): SemanticTokenDefinition => ({ family, name, light, dark });

const statusFamily = (family: Exclude<SemanticFamily, "neutral" | "accent">, palette: string): SemanticTokenDefinition[] => [
  semantic(family, \`oe-\${family}-foreground-primary\`, \`\${palette}-800\`, \`\${palette}-200\`),
  semantic(family, \`oe-\${family}-foreground-secondary\`, \`\${palette}-600\`, \`\${palette}-400\`),
  semantic(family, \`oe-\${family}-background-primary\`, \`\${palette}-50\`, \`\${palette}-950\`),
  semantic(family, \`oe-\${family}-background-secondary\`, \`\${palette}-100\`, \`\${palette}-900\`),
  semantic(family, \`oe-\${family}-background-bold-primary\`, \`\${palette}-700\`, \`\${palette}-400\`),
  semantic(family, \`oe-\${family}-border-primary\`, \`\${palette}-500\`, \`\${palette}-500\`),
  semantic(family, \`oe-\${family}-border-secondary\`, \`\${palette}-200\`, \`\${palette}-800\`),
];

export const CORE_SEMANTIC_TOKENS: readonly SemanticTokenDefinition[] = [
  semantic("neutral", "oe-foreground-primary", "neutral-950", "neutral-50"),
  semantic("neutral", "oe-foreground-secondary", "neutral-700", "neutral-300"),
  semantic("neutral", "oe-foreground-tertiary", "neutral-500", "neutral-500"),
  semantic("neutral", "oe-foreground-subtle", "neutral-400", "neutral-600"),
  semantic("neutral", "oe-foreground-placeholder", "neutral-400", "neutral-500"),
  semantic("neutral", "oe-foreground-disabled", "neutral-400", "neutral-600"),
  semantic("neutral", "oe-foreground-inverse", "white", "neutral-950"),
  semantic("neutral", "oe-foreground-inverse-secondary", "white / 60%", "neutral-950 / 60%"),
  semantic("neutral", "oe-background-canvas-primary", "white", "neutral-950"),
  semantic("neutral", "oe-background-canvas-secondary", "white", "neutral-900"),
  semantic("neutral", "oe-background-primary", "white", "neutral-900"),
  semantic("neutral", "oe-background-secondary", "neutral-100", "neutral-800"),
  semantic("neutral", "oe-background-bold-primary", "neutral-950", "neutral-50"),
  semantic("neutral", "oe-background-control-off", "neutral-400", "neutral-500"),
  semantic("neutral", "oe-background-control-disabled", "neutral-300", "neutral-600"),
  semantic("neutral", "oe-background-disabled", "neutral-100", "neutral-800"),
  semantic("neutral", "oe-background-disabled-selected", "neutral-400", "neutral-400"),
  semantic("neutral", "oe-border-primary", "neutral-300", "neutral-700"),
  semantic("neutral", "oe-border-bold-primary", "neutral-950", "neutral-50"),
  semantic("neutral", "oe-border-secondary", "neutral-200", "neutral-800"),
  semantic("neutral", "oe-border-tertiary", "neutral-150", "neutral-850"),
  semantic("neutral", "oe-border-disabled", "neutral-100", "neutral-900"),
  semantic("neutral", "oe-border-visual", "black / 10%", "black / 10%"),
  semantic("neutral", "oe-interaction-hover-subtle", "black / 3%", "white / 5%"),
  semantic("neutral", "oe-interaction-hover", "black / 5%", "white / 8%"),
  semantic("accent", "oe-accent-background-bold-primary", "red-600", "red-400"),
  ...statusFamily("warning", "amber"),
  ...statusFamily("danger", "red"),
  ...statusFamily("success", "green"),
  ...statusFamily("info", "blue"),
];

const toneByStep: Record<BrandStep, number> = {
  50: 98,
  100: 95,
  200: 90,
  300: 80,
  400: 70,
  500: 60,
  600: 50,
  700: 40,
  800: 30,
  900: 20,
  950: 10,
};

export function createBrandPalette(source: string): BrandPalette {
  const rgb = rgbFromHex(normalizedSource);

  return {
    source: normalizedSource,
    solid: Object.fromEntries(BRAND_STEPS.map((step) => [step, hexFromArgb(palette.tone(toneByStep[step]))])) as Record<BrandStep, string>,
  };
}

export function createBrandSemanticMapping(palette: BrandPalette, mode: "light" | "dark") {
  const solid = (step: BrandStep) => ({
    primitive: \`brand-\${step}\` as const,
    value: palette.solid[step],
  });
  if (mode === "dark") {
    return {
      foregroundPrimary: solid(200),
      foregroundSecondary: solid(400),
      backgroundPrimary: solid(950),
      backgroundSecondary: solid(900),
      backgroundBoldPrimary: solid(400),
      borderPrimary: solid(500),
      borderSecondary: solid(800),
      focusRing: solid(400),
    };
  }

  return {
    foregroundPrimary: solid(800),
    foregroundSecondary: solid(600),
    backgroundPrimary: solid(50),
    backgroundSecondary: solid(100),
    backgroundBoldPrimary: solid(700),
    borderPrimary: solid(500),
    borderSecondary: solid(200),
    focusRing: solid(600),
  };
}

function rgbFromHex(value: string) {
  return {
    r: Number.parseInt(value.slice(1, 3), 16),
    g: Number.parseInt(value.slice(3, 5), 16),
  };
}
`;

const NEUTRAL_LIST = [
  "oe-foreground-primary",
  "oe-foreground-secondary",
  "oe-foreground-tertiary",
  "oe-foreground-subtle",
  "oe-foreground-placeholder",
  "oe-foreground-disabled",
  "oe-foreground-inverse",
  "oe-foreground-inverse-secondary",
  "",
  "oe-background-canvas-primary",
  "oe-background-canvas-secondary",
  "oe-background-primary",
  "oe-background-secondary",
  "oe-background-bold-primary",
  "oe-background-control-off",
  "oe-background-control-disabled",
  "oe-background-disabled",
  "oe-background-disabled-selected",
  "",
  "oe-border-primary",
  "oe-border-bold-primary",
  "oe-border-secondary",
  "oe-border-tertiary",
  "oe-border-disabled",
  "oe-border-visual",
  "oe-focus-ring",
  "",
  "oe-interaction-hover-subtle",
  "oe-interaction-hover",
];

const tokensDoc = `# 토큰 체계

\`oe\`는 ooee가 확정한 semantic decision의 이름이다. 실제 색상 값과 Light/Dark 매핑은 \`foundations/color.md\` 가 갖는다.

## Neutral semantic token

\`\`\`text
${NEUTRAL_LIST.join("\n")}
\`\`\`

의미는 다음과 같다.

**중립 foreground의 위계는 \`tertiary\`에서 끝난다.** \`subtle\`은 그 줄을 잇는 네 번째 칸이 아니라, \`tertiary\`보다 약한 단계가 국소적으로 필요한 자리에만 쓰는 이름이다. \`subtle\`의 현재 매핑은 Light \`neutral-400\`, Dark \`neutral-600\`이며 BottomNavigation이 선택되지 않은 항목의 아이콘을 라벨보다 낮출 때 쓴다.

\`subtle\`은 \`oe-foreground-disabled\`와 값이 같지만 합치지 않는다. \`disabled\`는 꺼져서 조작할 수 없는 요소를 뜻하고 \`subtle\`은 켜져 있으나 위계가 낮은 요소를 뜻한다. 역할이 다르면 하나로 묶지 않는다.

Placeholder는 실제 입력값과 명확히 구분하기 위해 전용 \`oe-foreground-placeholder\`를 사용한다. \`oe-foreground-placeholder\`의 현재 매핑은 Light \`neutral-400\`, Dark \`neutral-500\`이며 실제 입력값은 \`oe-foreground-primary\`를 유지한다.

## Semantic status token

\`\`\`text
danger
warning
success
info
\`\`\`

각 상태는 foreground, background, border와 primary/secondary 위계를 조합한다.

\`\`\`text
oe-danger-foreground-primary
oe-danger-foreground-secondary
oe-danger-background-primary
oe-danger-background-secondary
oe-danger-background-bold-primary
oe-danger-border-primary
oe-danger-border-secondary
\`\`\`

\`warning\`, \`success\`, \`info\`도 같은 문법을 따른다. Light theme에서 \`danger-foreground-primary\`가 \`red-800\`, Dark theme에서 \`red-200\`에 연결된다. 이름은 역할을 나타내고 primitive 값은 테마별 구현이다.

## Brand primitive

- HCT tone을 \`brand-50~950\`에 연결한다.
- Alpha primitive는 seed RGB 기준으로 다음 값만 생성한다: \`05, 08, 10, 16, 20, 30, 40, 50, 60, 70, 80, 90\`.
- Primitive는 모드에 독립적이고 semantic mapping은 Light/Dark에서 달라질 수 있다.
`;

const colorDoc = `# Color foundation v0

## 생성 과정

\`brand-source\`는 입력한 브랜드 원색을 그대로 보존한다. HCT palette는 색역 보정으로 인해 source와 정확히 일치하지 않을 수 있다.

## Solid primitive

| Token | HCT tone |
| --- | ---: |
| \`brand-50\` | 98 |
| \`brand-100\` | 95 |
| \`brand-200\` | 90 |
| \`brand-300\` | 80 |
| \`brand-400\` | 70 |
| \`brand-500\` | 60 |
| \`brand-600\` | 50 |
| \`brand-700\` | 40 |
| \`brand-800\` | 30 |
| \`brand-900\` | 20 |
| \`brand-950\` | 10 |

## Alpha primitive

다음 단계만 생성한다.

\`\`\`text
brand-alpha-05
brand-alpha-08
brand-alpha-10
brand-alpha-16
brand-alpha-20
brand-alpha-30
brand-alpha-40
brand-alpha-50
brand-alpha-60
brand-alpha-70
brand-alpha-80
brand-alpha-90
\`\`\`

## Semantic mapping v0

### Light

\`\`\`text
oe-brand-foreground-primary          → brand-800
oe-brand-foreground-secondary        → brand-600
oe-brand-background-primary          → brand-50
oe-brand-background-secondary        → brand-100
oe-brand-background-bold-primary     → brand-700
oe-brand-border-primary              → brand-500
oe-brand-border-secondary            → brand-200
oe-focus-ring                        → brand-600
\`\`\`

### Dark

\`\`\`text
oe-brand-foreground-primary          → brand-200
oe-brand-foreground-secondary        → brand-400
oe-brand-background-primary          → brand-950
oe-brand-background-secondary        → brand-900
oe-brand-background-bold-primary     → brand-400
oe-brand-border-primary              → brand-500
oe-brand-border-secondary            → brand-800
oe-focus-ring                        → brand-400
\`\`\`

## 공통 사용 규칙

- Alpha 결과는 합성되는 배경에 따라 달라지므로 Light, Dark, 이미지 배경에서 각각 검수한다.
- \`oe-focus-ring\`은 적용된 brand seed를 기반으로 Light \`brand-600\`, Dark \`brand-400\`에 연결한다.

## 다음 검토 체크포인트

### 제안하는 최소 역할

\`\`\`text
Neutral
oe-foreground-primary / secondary / tertiary / disabled / inverse
oe-foreground-inverse-secondary
oe-background-canvas-primary / canvas-secondary
oe-background-primary / secondary / disabled / disabled-selected / bold-primary
oe-background-control-off / control-disabled
oe-border-primary / secondary / disabled
oe-focus-ring
oe-interaction-hover-subtle
oe-interaction-hover

Accent
oe-accent-background-bold-primary

Brand 및 danger / warning / success / info
oe-{role}-foreground-primary / secondary
oe-{role}-background-primary / secondary / bold-primary
oe-{role}-border-primary / secondary
\`\`\`

- Light Neutral background는 primary에서 secondary 순으로 어두워진다. Dark에서는 이름보다 동일한 UI 역할과 계층을 유지한다.
- \`interaction-hover\`는 기존 background를 교체하지 않고 위에 합성하는 state layer로, 초기값은 Light \`black / 5%\`, Dark \`white / 8%\`이며 화면 검증 후 조율한다.
- \`background-disabled-selected\`는 선택값을 유지한 채 조작만 제한된 control의 Neutral fill이며 Light/Dark 모두 \`neutral-400\`을 사용한다.
- 경계는 세 단계다. \`oe-border-primary\`가 컨트롤과 면의 경계, \`oe-border-secondary\`가 그보다 한 단계 물러난 구분, \`oe-border-tertiary\`가 가장 옅은 구분이다. **Tertiary는 같은 묶음 안을 나누는 자리에 쓴다.**
- 이미지와 색상 값의 내부 경계에 쓰는 공용 \`oe-border-visual\`은 Light/Dark 모두 콘텐츠 자체 위에 중첩되는 1px inset \`black 10%\`이며, 테마 surface 색상으로 바꾸지 않는다.

## 첫 적용

일반 Hover는 \`oe-interaction-hover\` layer를 기존 background 위에 합성한다. 넓은 조작 영역에는 더 옅은 \`oe-interaction-hover-subtle\`을 사용한다. \`oe-interaction-hover-subtle\`은 Light black 3%, Dark white 5%다.
`;

const interactionDoc = "# 상호작용 규칙\n\n## 공통 Control Height\n\n값은 `packages/tokens`의 `CONTROL_HEIGHTS`가 소유하고 `--spacing-oe-control-*`로 노출한다.\n\n- XXSmall: 24px\n- XSmall: 28px\n- Small: 32px\n- Regular: 36px\n- Large: 40px\n- XLarge: 48px\n- XXLarge: 56px\n\n## 여닫는 화살표\n\n화살표는 아래를 가리킨다.\n\n## Compact\n\n**컨트롤 줄에 끼지 않고 글자 옆에 붙는 요소의 높이다. 값은 20px 하나이며 `packages/tokens`의 `COMPACT_HEIGHT`가 소유하고 `--spacing-oe-compact`로 노출한다.**\n\n## 공통 Control Radius\n\n값을 입력받거나 고르는 컨트롤이 함께 사용하는 모서리 반지름 기준이다. **8px**이며 `packages/tokens`가 `--radius-oe-control`로 소유한다.\n\n## 화면 좌우 여백\n\n- `default` 16px: 모바일 구간의 기본값이다.\n- `wide` 40px: 태블릿 분기점(`md`, 768px)부터 쓴다.\n";
const iconDoc = "# Icon Foundation\n\n## 크기 토큰\n\n- `oe-icon-xsmall`: 12px\n- `oe-icon-small`: 16px\n- `oe-icon-medium`: 20px\n- `oe-icon-large`: 24px\n- `oe-icon-xlarge`: 32px\n\n## 현재 적용\n\n자리는 `apps/studio/src/components/candidates/material-symbols.tsx`에 둔다.\n";
const catalogDoc = "# Foundation catalog\n\n## 현재 경로\n\n- `/foundations/color`: Neutral, Brand, Accent, Status semantic token\n- `/foundations/typography`: 언어별 font family token과 type primitive\n- `/foundations/icon`: icon source와 현재 등록 사용 자산\n";
const cssSource = ":root {\n  --oe-foreground-primary: var(--color-neutral-950);\n}\n\n@theme inline {\n  --radius-oe-control: 0.5rem;\n  --spacing-oe-control-regular: 2.25rem;\n  --text-oe-label: 0.8125rem;\n  --text-oe-label--line-height: 1rem;\n  --color-oe-foreground-tertiary: var(--oe-foreground-tertiary);\n  --color-oe-background-primary: var(--oe-background-primary);\n}\n";

/** 모든 짝이 「같다」 인 최소 저장소. 경로 → 내용. */
function baseFiles() {
  const files = {
    [FILES.registry]: registrySource,
    [FILES.readme]: readmeSource,
    [FILES.uiIndex]: uiIndexSource,
    [FILES.llms]: llmsSource,
    [FILES.tokens]: tokensSrc,
    [FILES.tokensCss]: cssSource,
    [FILES.tokensDoc]: tokensDoc,
    [FILES.colorDoc]: colorDoc,
    [FILES.interactionDoc]: interactionDoc,
    [FILES.iconDoc]: iconDoc,
    [FILES.catalogDoc]: catalogDoc,
    [ui("badge")]: badgeSrc,
    [ui("button")]: buttonSrc,
    [ui("toggle-button")]: toggleSrc,
    [ui("bottom-navigation")]: navSrc,
    [ui("textarea")]: textareaSrc,
    [ui("checkbox")]: checkboxSrc,
    [ui("notification-badge")]: notificationSrc,
    [ui("app-header")]: appHeaderSrc,
    [ui("chip")]: chipSrc,
    [ui("input")]: inputSrc,
    [ui("input-button")]: inputButtonSrc,
    [ui("number-input")]: numberInputSrc,
    [ui("select")]: selectSrc,
    [ui("combobox")]: comboboxSrc,
    [ui("radio")]: radioSrc,
    [ui("switch")]: switchSrc,
    [ui("message-bubble")]: bubbleSrc,
    [`${FILES.uiSrc}/selection-trigger.ts`]: selectionTriggerSrc,
    [ui("partial-masked-input")]: "export function PartialMaskedInput() {}\n",
    [doc("badge")]: badgeDoc,
    [doc("button")]: buttonDoc,
    [doc("toggle-button")]: toggleDoc,
    [doc("bottom-navigation")]: navDoc,
    [doc("textarea")]: textareaDoc,
    [doc("checkbox")]: checkboxDoc,
    [doc("notification-badge")]: notificationDoc,
    [doc("app-header")]: appHeaderDoc,
    [doc("chip")]: chipDoc,
    [doc("input")]: inputDoc,
    [doc("input-button")]: inputButtonDoc,
    [doc("number-input")]: numberInputDoc,
    [doc("select")]: selectDoc,
    [doc("combobox")]: comboboxDoc,
    [doc("radio")]: radioDoc,
    [doc("switch")]: switchDoc,
    [doc("message-bubble")]: bubbleDoc,
    "apps/studio/src/components/candidates/material-symbols.tsx": "export const MaterialSymbol = null;\n",
    [`${FILES.studioFoundations}/color/page.tsx`]: "",
    [`${FILES.studioFoundations}/typography/page.tsx`]: "",
    [`${FILES.studioFoundations}/icon/page.tsx`]: "",
  };
  for (const [key] of CONFIRMED) files[studioDir(key)] = `<ComponentDetailPage componentKey="${key}" />\n`;
  return files;
}

/** 파일 하나의 `from` 을 `to` 로. `from` 이 없으면 시험이 잘못 쓴 것이므로 바로 실패한다. */
function edit(files, relative, from, to) {
  assert.ok(relative in files, `fixture 에 ${relative} 가 없다`);
  assert.ok(files[relative].includes(from), `${relative} 에 「${from}」 이 없다`);
  return { ...files, [relative]: files[relative].replace(from, to) };
}

/** `prefix` 로 시작하는 경로를 모두 뺀 사본. */
const without = (files, prefix) => Object.fromEntries(Object.entries(files).filter(([relative]) => !relative.startsWith(prefix)));

/** fixture 를 임시 폴더에 쓰고 재고 지운다. 내용이 null 인 경로는 파일이 아니라 디렉터리다. */
function run(files) {
  const dir = mkdtempSync(path.join(os.tmpdir(), "system-drift-"));
  try {
    for (const [relative, content] of Object.entries(files)) {
      mkdirSync(path.dirname(path.join(dir, relative)), { recursive: true });
      // 내용이 null 이면 그 경로를 디렉터리로 둔다 — 「목록에는 있는데 읽지 못하는 파일」 을 만드는 데 쓴다.
      if (content === null) mkdirSync(path.join(dir, relative), { recursive: true });
      else writeFileSync(path.join(dir, relative), content);
    }
    return measure(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const pairOf = (measured, name) => {
  const entry = measured.pairs.find((candidate) => candidate.name === name);
  assert.ok(entry, `짝 「${name}」 이 없다`);
  return entry;
};
const expectSame = (measured, name) => {
  const entry = pairOf(measured, name);
  assert.deepEqual(entry.drifts, [], `${name}: 어긋남이 없어야 한다`);
  assert.deepEqual(entry.unreadable, [], `${name}: 못 읽은 곳이 없어야 한다`);
};
const expectDrift = (measured, name, what) => {
  const entry = pairOf(measured, name);
  assert.ok(entry.drifts.length, `${name}: 어긋남이 있어야 한다 (못 읽음: ${entry.unreadable.map((item) => item.detail).join(" / ")})`);
  if (what) assert.ok(entry.drifts.some((item) => item.what.includes(what)), `${name}: 「${what}」 어긋남이 있어야 한다: ${entry.drifts.map((item) => item.what).join(" / ")}`);
  return entry;
};
const expectUnreadable = (measured, name, detail) => {
  const entry = pairOf(measured, name);
  assert.ok(entry.unreadable.length, `${name}: 못 읽은 곳이 있어야 한다 (어긋남: ${entry.drifts.map((item) => item.what).join(" / ")})`);
  if (detail) assert.ok(entry.unreadable.some((item) => item.detail.includes(detail) || item.docAt.includes(detail)), `${name}: 「${detail}」 을 못 읽었다고 해야 한다: ${entry.unreadable.map((item) => `${item.docAt}: ${item.detail}`).join(" / ")}`);
  return entry;
};

const P = {
  readme: "README 컴포넌트 표 ↔ registry (제목·상태·문서 링크)",
  docSet: "docs/system/components/*.md → registry 확정 key (고아 문서)",
  studio: "Studio 문서 디렉터리 ↔ registry href (고아 디렉터리)",
  exports: "@ooee/ui export ↔ registry (모듈·이름)",
  h1: "컴포넌트 문서 H1·구현 경로 메타줄 ↔ registry title·packages/ui 파일",
  llms: "llms.txt 확정 N종 숫자·초안 목록 ↔ registry",
  badgeCount: "BADGE_COLORS 개수 ↔ badge.md",
  badgeGray: "BADGE_COLORS 회색 규칙 ↔ badge.md",
  button: "BUTTON_COLORS ↔ button.md",
  toggle: "TOGGLE_BUTTON_COLORS ↔ toggle-button.md",
  nav: "BOTTOM_NAVIGATION_MAX_ITEMS ↔ bottom-navigation.md",
  textarea: "Textarea 최소·기본 높이 ↔ textarea.md",
  textareaField: "Textarea field 최소 높이 ↔ textarea.md",
  checkbox: "Checkbox control 크기 ↔ checkbox.md",
  checkboxIcons: "Checkbox indicator 아이콘 크기 ↔ checkbox.md",
  badgeSpec: "Badge Specification 표 ↔ SIZE_CLASS",
  badgeTone: "Badge 색 단계 표(Light/Dark) ↔ toneClass",
  enums: "Properties 열거값 ↔ export type 유니온",
  neutral: "tokens.md Neutral 목록 ↔ CORE_SEMANTIC_TOKENS",
  status: "tokens.md status 문법 ↔ statusFamily",
  proposed: "color.md 제안하는 최소 역할 → CORE_SEMANTIC_TOKENS·brand mapping (문서→코드)",
  brand: "color.md Light/Dark 매핑 ↔ createBrandSemanticMapping",
  tone: "color.md brand tone 표 ↔ toneByStep",
  alpha: "brand alpha 단계 ↔ BRAND_ALPHA_STEPS",
  alias: "문서가 인용한 별칭 클래스 ↔ styles.css @theme",
  paths: "문서 안 백틱 저장소 경로 ↔ 실제 파일",
  interaction: "interaction.md Control Height·Compact·Radius·여백 ↔ tokens 상수",
  icon: "icon.md 크기 토큰 ↔ ICON_SIZES",
  catalog: "catalog.md 현재 경로 ↔ Studio foundations 라우트",
};

test("짝 이름 표가 도구의 PAIRS 와 같다", () => {
  assert.deepEqual(Object.values(P).sort(), [...PAIRS].sort());
  assert.equal(new Set(PAIRS).size, PAIRS.length);
});

test("기본 fixture 는 모든 짝이 같다 — 보고는 「맞는다」 한 줄과 짝마다 = 한 줄", () => {
  const measured = run(baseFiles());
  for (const name of PAIRS) expectSame(measured, name);
  const text = formatReport(measured);
  const lines = text.split("\n");
  assert.equal(lines[0], `docs/system 과 코드가 맞는다(${PAIRS.length}개 짝)`);
  assert.deepEqual(lines.slice(1, 1 + PAIRS.length), PAIRS.map((name) => `= ${name}`));
  assert.ok(lines.includes("참고:"), "제안 목록에 없는 코드 이름은 참고로 낸다");
  assert.ok(lines.includes("재지 않는 것:"));
  assert.deepEqual(measured.notMeasured, [...NOT_MEASURED]);
});

// --- 컴포넌트 목록 ----------------------------------------------------------------------------------------------------

test("README 표: 상태가 다르면 어긋남, 문서 칸·머리 행·칸 수가 꼴에 안 맞으면 그 줄을 가리켜 못 읽음", () => {
  expectDrift(run(edit(baseFiles(), FILES.readme, "| Tabs | 초안 | 없음 | 탭 |", "| Tabs | 확정 | 없음 | 탭 |")), P.readme, "Tabs 상태");
  expectDrift(run(edit(baseFiles(), FILES.readme, "| Tabs | 초안 | 없음 | 탭 |", "")), P.readme, "README 컴포넌트 표에 없는 registry 항목");
  expectDrift(run(edit(baseFiles(), FILES.readme, "| Tabs | 초안 | 없음 | 탭 |", "| Tabs | 초안 | 없음 | 탭 |\n| Ghost | 확정 | [ghost.md](components/ghost.md) | 없다 |")), P.readme, "registry 에 없는 README 표 행");
  expectDrift(run(edit(baseFiles(), FILES.readme, "[badge.md](components/badge.md)", "[badge.md](components/badges.md)")), P.readme, "Badge 문서 링크");
  const dash = expectUnreadable(run(edit(baseFiles(), FILES.readme, "| Tabs | 초안 | 없음 | 탭 |", "| Tabs | 초안 | — | 탭 |")), P.readme, "문서 칸 「—」");
  assert.deepEqual(dash.drifts, [], "「—」 는 못 읽음이지 표에 없는 항목이 아니다");
  expectUnreadable(run(edit(baseFiles(), FILES.readme, "| 컴포넌트 | 상태 | 문서 | 용도 |", "| 컴포넌트 | 상태 | 문서 | 소유 | 용도 |")), P.readme, "머리 행");
  expectUnreadable(run(edit(baseFiles(), FILES.readme, "| Tabs | 초안 | 없음 | 탭 |", "| Tabs | 초안 | 없음 | 탭 | 더 |")), P.readme, "칸이 5개");
  expectUnreadable(run(edit(baseFiles(), FILES.readme, "## Component", "## Components")), P.readme, FILES.readme);
});

test("components/*.md → 확정 key: 고아 문서를 잡고, 디렉터리가 없으면 짝 이름으로 못 읽음", () => {
  expectDrift(run({ ...baseFiles(), [doc("zzz")]: "# Zzz\n" }), P.docSet, "components/zzz.md 의 주인");
  const gone = expectUnreadable(run(without(baseFiles(), FILES.componentDocs)), P.docSet, FILES.componentDocs);
  assert.deepEqual(gone.unreadable, [{ what: P.docSet, detail: "디렉터리를 읽지 못했다", docAt: FILES.componentDocs }], "「?」 줄의 what 은 고정 문자열 「디렉터리」 가 아니라 짝 이름이다");
});

test("확정의 명세 존재와 README 링크 대상 존재는 다시 재지 않는다 — apps/studio docs.test.ts 가 이미 재므로 「재지 않는 것」 에 그 시험 이름을 적는다", () => {
  // 확정 chip 의 문서를 지워도 이 두 짝은 어긋남을 내지 않는다(H1·메타줄 짝이 파일을 못 읽었다고 낼 뿐이다).
  const missing = run(without(baseFiles(), doc("chip")));
  assert.deepEqual(pairOf(missing, P.docSet).drifts, [], "「확정 chip 의 명세」 어긋남은 docs.test.ts 의 몫이다");
  assert.deepEqual(pairOf(missing, P.readme).drifts, [], "「Chip 문서 링크 대상」 어긋남은 docs.test.ts 의 몫이다");
  expectUnreadable(missing, P.h1, doc("chip"));
  // 링크 경로의 꼴(확정은 components/<key>.md, 초안은 없음)은 여전히 이 도구가 본다.
  expectDrift(run(edit(baseFiles(), FILES.readme, "[chip.md](components/chip.md)", "[chip.md](components/chips.md)")), P.readme, "Chip 문서 링크");
  const note = NOT_MEASURED.find((entry) => entry.includes("apps/studio/src/lib/docs.test.ts"));
  assert.ok(note, "NOT_MEASURED 에 docs.test.ts 가 있다");
  assert.ok(note.includes("component detail pages can attach the matching specification") && note.includes("every internal document link points at a document that exists"), "어느 시험인지 이름으로 적는다");
});

test("Studio 디렉터리: registry 에 href 없는 디렉터리가 어긋남, 디렉터리가 없으면 못 읽음", () => {
  expectDrift(run({ ...baseFiles(), [studioDir("old")]: "" }), P.studio, "Studio 디렉터리 old");
  expectUnreadable(run(without(baseFiles(), FILES.studioComponents)), P.studio, FILES.studioComponents);
});

test("@ooee/ui export: 이름이 다르거나 확정 모듈이 없거나 README 에 언급 없는 모듈이 어긋남, export 줄이 없으면 못 읽음", () => {
  expectDrift(run(edit(baseFiles(), FILES.uiIndex, "export { Badge, BADGE_COLORS", "export { Badg, BADGE_COLORS")), P.exports, "badge 의 export 이름");
  expectDrift(run(edit(baseFiles(), FILES.uiIndex, 'export { Chip } from "./chip";\n', "")), P.exports, "확정 chip 의 @ooee/ui 모듈");
  expectDrift(run(edit(baseFiles(), FILES.readme, "`PartialMaskedInput`", "PartialMaskedInput")), P.exports, "registry 에 없는 모듈 partial-masked-input");
  expectUnreadable(run({ ...baseFiles(), [FILES.uiIndex]: "// 아직 없다\n" }), P.exports, FILES.uiIndex);
});

test("컴포넌트 문서 H1·메타줄: 제목이 다르거나 메타줄이 문장이면 어긋남, H1 이 없으면 못 읽음", () => {
  expectDrift(run(edit(baseFiles(), doc("badge"), "# Badge\n", "# badge\n")), P.h1, "badge.md 제목");
  expectDrift(run(edit(baseFiles(), doc("badge"), "`packages/ui/src/badge.tsx`\n", "`Badge`는 어디서 뽑았다.\n\n`packages/ui/src/badge.tsx`\n")), P.h1, "badge.md 구현 경로 메타줄");
  expectDrift(run(without(baseFiles(), ui("chip"))), P.h1, "chip.md 구현 경로");
  expectUnreadable(run(edit(baseFiles(), doc("badge"), "# Badge\n", "Badge\n")), P.h1, "badge.md");
});

test("컴포넌트 문서 H1·메타줄: 확정 문서를 못 읽으면 그 문서마다 못 읽음 — 비교 0건을 「같다」 로 찍지 않는다", () => {
  const one = expectUnreadable(run(without(baseFiles(), doc("chip"))), P.h1, doc("chip"));
  assert.deepEqual(one.unreadable, [{ what: "chip.md 제목·메타줄", detail: "파일을 읽지 못했다", docAt: doc("chip") }]);
  const all = expectUnreadable(run(without(baseFiles(), FILES.componentDocs)), P.h1, "파일을 읽지 못했다");
  assert.deepEqual(all.unreadable.map((item) => item.what).sort(), CONFIRMED.map(([key]) => `${key}.md 제목·메타줄`).sort(), "확정 문서 하나마다 한 줄");
  assert.deepEqual(all.drifts, []);
  assert.ok(!formatReport(run(without(baseFiles(), FILES.componentDocs))).includes(`= ${P.h1}`), "문서를 하나도 읽지 못했는데 = 로 찍지 않는다");
});

test("llms.txt: 「N종」 숫자와 초안 목록만 본다 — 확정 목록은 llms-txt.test 의 몫", () => {
  expectDrift(run(edit(baseFiles(), FILES.llms, `확정 ${CONFIRMED.length}종`, "확정 3종")), P.llms, "llms.txt 확정 개수");
  expectDrift(run(edit(baseFiles(), FILES.llms, "초안(쓰지 않는다): `tabs`", "초안(쓰지 않는다): `tabs` `chip`")), P.llms, "llms.txt 초안 목록");
  expectSame(run(edit(baseFiles(), FILES.llms, "`badge` ", "`badgee` ")), P.llms);
  expectUnreadable(run(edit(baseFiles(), FILES.llms, "초안(쓰지 않는다): `tabs`\n", "")), P.llms, "초안");
});

// --- 상수 --------------------------------------------------------------------------------------------------------------

test("BADGE_COLORS 개수: 두 문장을 각각 찾는다 — 하나만 틀려도 어긋남, 하나만 빗나가도 못 읽음", () => {
  expectDrift(run(edit(baseFiles(), doc("badge"), "`BADGE_COLORS` 의 18색", "`BADGE_COLORS` 의 17색")), P.badgeCount, "BADGE_COLORS 개수");
  expectDrift(run(edit(baseFiles(), doc("badge"), "primitive 18색", "primitive 19색")), P.badgeCount, "BADGE_COLORS 개수");
  expectUnreadable(run(edit(baseFiles(), doc("badge"), "primitive 18색", "primitive 색")), P.badgeCount, "Tailwind primitive N색");
  expectUnreadable(run(edit(baseFiles(), doc("badge"), "`BADGE_COLORS` 의 18색", "`BADGE_COLORS` 에 있는 색")), P.badgeCount, "`BADGE_COLORS` 의 N색");
  expectUnreadable(run(edit(baseFiles(), doc("badge"), "`BADGE_COLORS` 의 18색", "`BADGE_COLORS` 의 몇 색")), P.badgeCount, "「몇」");
  expectUnreadable(run(edit(baseFiles(), ui("badge"), "export const BADGE_COLORS", "export const COLORS")), P.badgeCount, ui("badge"));
});

test("BADGE_COLORS 회색 규칙: 코드에 회색이 늘면 어긋남, 문장이 바뀌면 못 읽음", () => {
  expectDrift(run(edit(baseFiles(), ui("badge"), '"gray",', '"gray", "zinc",')), P.badgeGray, "BADGE_COLORS 에서 걷어낸 회색");
  expectUnreadable(run(edit(baseFiles(), doc("badge"), "회색 계열은 `gray` 하나만 둔다", "회색은 하나다")), P.badgeGray, "회색 계열은");
});

test("BUTTON_COLORS·TOGGLE_BUTTON_COLORS: 이름 집합이 다르면 어긋남, `color` 줄이나 Properties 절이 없으면 못 읽음", () => {
  expectDrift(run(edit(baseFiles(), doc("button"), "현재 값은 `excel` 하나다", "현재 값은 `excel`과 `word` 둘이다")), P.button, "BUTTON_COLORS");
  expectDrift(run(edit(baseFiles(), ui("toggle-button"), '["favorite", "like"]', '["favorite", "like", "pin"]')), P.toggle, "TOGGLE_BUTTON_COLORS");
  expectUnreadable(run(edit(baseFiles(), doc("button"), "- `color`:", "- `colour`:")), P.button, "- `color`");
  expectUnreadable(run(edit(baseFiles(), doc("toggle-button"), "## Properties", "## Props")), P.toggle, "## Properties");
});

test("BOTTOM_NAVIGATION_MAX_ITEMS: 세 자리를 각각 찾는다 — 한 문장만 틀려도 어긋남, 한 문장만 빗나가도 못 읽음", () => {
  expectDrift(run(edit(baseFiles(), doc("bottom-navigation"), "항목이 다섯을 넘으면 오류를 낸다", "항목이 여섯을 넘으면 컴포넌트가 오류를 낸다")), P.nav, "BOTTOM_NAVIGATION_MAX_ITEMS");
  expectDrift(run(edit(baseFiles(), doc("bottom-navigation"), "여섯을 넘기면", "일곱을 넘기면")), P.nav, "넘기는 첫 개수");
  expectDrift(run(edit(baseFiles(), ui("bottom-navigation"), "const MAX_ITEMS = 5", "const MAX_ITEMS = 4")), P.nav);
  expectUnreadable(run(edit(baseFiles(), doc("bottom-navigation"), "항목은 셋부터 다섯까지 둔다", "항목은 적당히 둔다")), P.nav, "### 항목 정하기");
  expectUnreadable(run(edit(baseFiles(), doc("bottom-navigation"), "**항목이 다섯을 넘으면 오류를 낸다.**", "**많으면 오류를 낸다.**")), P.nav, "## 항목 목록을 받는 이유");
  expectUnreadable(run(edit(baseFiles(), doc("bottom-navigation"), "- `items`:", "- `entries`:")), P.nav, "- `items`");
});

test("Textarea 80px·78px: Specification 과 산문을 각각 찾는다", () => {
  expectDrift(run(edit(baseFiles(), doc("textarea"), "- 기본값은 80px이다.", "- 기본값은 90px이다.")), P.textarea, "Textarea 기본 높이(산문)");
  expectDrift(run(edit(baseFiles(), ui("textarea"), "height = 80", "height = 100")), P.textarea);
  expectUnreadable(run(edit(baseFiles(), doc("textarea"), "- Minimum height: `80px`", "- 최소 높이: 80px")), P.textarea, "- Minimum height");
  expectUnreadable(run(edit(baseFiles(), doc("textarea"), "기본 높이는 80px이며", "기본 높이는 넉넉하며")), P.textarea, "기본 높이는 Npx");
  expectDrift(run(edit(baseFiles(), doc("textarea"), "minimum height: `78px`", "minimum height: `76px`")), P.textareaField, "Textarea field 최소 높이");
  expectUnreadable(run(edit(baseFiles(), doc("textarea"), "- Textarea field minimum height:", "- Field min height:")), P.textareaField, "Textarea field minimum height");
});

test("Checkbox 16px·10px·15px: Specification 과 산문을 각각 찾는다", () => {
  expectDrift(run(edit(baseFiles(), doc("checkbox"), "- Control: 16 × 16px", "- Control: 18 × 18px")), P.checkbox, "Checkbox control 크기");
  expectDrift(run(edit(baseFiles(), ui("checkbox"), "group/checkbox inline-grid size-4", "group/checkbox inline-grid size-5")), P.checkbox, "Checkbox control 과 indicator 크기");
  expectUnreadable(run(edit(baseFiles(), doc("checkbox"), "Control은 16px다", "Control은 열여섯 px다")), P.checkbox, "Control은 Npx");
  expectUnreadable(run(edit(baseFiles(), doc("checkbox"), "## Anatomy", "## 구조")), P.checkbox, "## Anatomy");
  expectDrift(run(edit(baseFiles(), doc("checkbox"), "Ghost 15 × 15px", "Ghost 14 × 14px")), P.checkboxIcons, "Checkbox indicator 아이콘(Ghost)");
  expectDrift(run(edit(baseFiles(), ui("checkbox"), 'className="size-[15px]"', 'className="size-[14px]"')), P.checkboxIcons, "Checkbox indicator 아이콘(Ghost");
  expectUnreadable(run(edit(baseFiles(), doc("checkbox"), "둘 다 10px icon", "둘 다 작은 icon")), P.checkboxIcons, "둘 다 Npx icon");
  expectUnreadable(run(edit(baseFiles(), doc("checkbox"), "- Indicator:", "- 표식:")), P.checkboxIcons, "- Indicator");
});

test("Badge Specification 표: 값이 다르면 어긋남, 열이 늘거나 행 라벨이 바뀌면 못 읽음(조용히 넘어가지 않는다)", () => {
  expectDrift(run(edit(baseFiles(), doc("badge"), "| 높이 | 20px | 24px |", "| 높이 | 20px | 28px |")), P.badgeSpec, "Badge medium 높이");
  expectDrift(run(edit(baseFiles(), ui("badge"), 'medium: "h-6 px-2', 'medium: "h-7 px-2')), P.badgeSpec, "Badge medium 높이");
  const widened = edit(edit(edit(edit(baseFiles(), doc("badge"), "| 자리 | `small` | `medium` |", "| 자리 | `small` | `medium` | `large` |"), doc("badge"), "| 높이 | 20px | 24px |", "| 높이 | 20px | 24px | 32px |"), doc("badge"), "| 좌우 여백 | 6px | 8px |", "| 좌우 여백 | 6px | 8px | 12px |"), doc("badge"), "| 아이콘이 붙는 변 | 4px | 6px |", "| 아이콘이 붙는 변 | 4px | 6px | 9px |");
  expectUnreadable(run(widened), P.badgeSpec, "SIZE_CLASS 의 단계");
  expectUnreadable(run(edit(baseFiles(), doc("badge"), "| 좌우 여백 | 6px | 8px |", "| 가로 여백 | 7px | 9px |")), P.badgeSpec, "「| 좌우 여백 | …」 행");
  expectUnreadable(run(edit(baseFiles(), doc("badge"), "| 높이 | 20px | 24px |", "| 높이 | 20px | 24px | 32px |")), P.badgeSpec, "칸이 4개");
  expectUnreadable(run(edit(baseFiles(), doc("badge"), "| 높이 | 20px | 24px |", "| 높이 | 20 | 24px |")), P.badgeSpec, "px 로 읽지 못했다");
  expectUnreadable(run(edit(baseFiles(), doc("badge"), "## Specification", "## 크기")), P.badgeSpec, "## Specification");
});

test("Properties 열거값: 값이 빠지면 어긋남, Property 줄·타입·파일이 없으면 못 읽음", () => {
  expectDrift(run(edit(baseFiles(), doc("badge"), "`fill | tonal | outlined`", "`fill | tonal`")), P.enums, "badge variant 열거값");
  expectDrift(run(edit(baseFiles(), doc("checkbox"), "`square | rounded | ghost`", "`square | rounded | ghost | pill`")), P.enums, "checkbox shape 열거값");
  expectUnreadable(run(edit(baseFiles(), doc("notification-badge"), "- `max`:", "- `maximum`:")), P.enums, "- `max`");
  expectUnreadable(run(edit(baseFiles(), ui("badge"), "export type BadgeTone", "export type BadgeKind")), P.enums, "type BadgeTone");
  expectUnreadable(run(without(baseFiles(), ui("chip"))), P.enums, ui("chip"));
});

test("Properties 열거값: cva·인라인 유니온·boolean·record 키·다른 모듈의 값도 잰다", () => {
  // cva 블록(주석 줄이 섞여 있어도) — input 자신과, 그 cva 를 함께 쓰는 input-button·number-input
  const cvaChanged = run(edit(baseFiles(), ui("input"), 'filled:\n          "border-transparent bg-oe-background-secondary",', 'filled:\n          "border-transparent bg-oe-background-secondary",\n        ghost: "border-transparent",'));
  for (const key of ["input", "input-button", "number-input"]) expectDrift(cvaChanged, P.enums, `${key} variant 열거값`);
  // 두 객체에 나뉜 layout 유니온은 합쳐서 읽는다 — 기본은 같고, 문서가 값을 더하면 어긋남
  expectDrift(run(edit(baseFiles(), doc("select"), "- `layout`: `fill | fixed`", "- `layout`: `fill | fixed | hug`")), P.enums, "select layout 열거값");
  // 인라인 유니온 — number-input 의 textAlign 은 input.tsx 의 것이라 input.tsx 를 바꾸면 둘 다 어긋난다
  const inline = run(edit(baseFiles(), ui("input"), 'textAlign?: "left" | "right"', 'textAlign?: "left" | "center"'));
  expectDrift(inline, P.enums, "input textAlign 열거값");
  expectDrift(inline, P.enums, "number-input textAlign 열거값");
  expectDrift(run(edit(baseFiles(), ui("switch"), 'labelPosition?: "left" | "right"', 'labelPosition?: "left" | "right" | "top"')), P.enums, "switch labelPosition 열거값");
  expectDrift(run(edit(baseFiles(), doc("radio"), "`hug | fill`", "`hug | fill | grow`")), P.enums, "radio layout 열거값");
  // boolean → `false | true`
  expectDrift(run(edit(baseFiles(), doc("app-header"), "- `sticky`: `false | true`", "- `sticky`: `false | true | auto`")), P.enums, "app-header sticky 열거값");
  expectUnreadable(run(edit(baseFiles(), ui("bottom-navigation"), "showLabels?: boolean", "showLabels?: string")), P.enums, "`showLabels?: boolean`");
  // record 키(keyof typeof VARIANT_CLASS) — 주석 줄과 값이 다음 줄로 내려간 키를 읽는다
  expectDrift(run(edit(baseFiles(), doc("bottom-navigation"), "`bar | floating`", "`bar | floating | dock`")), P.enums, "bottom-navigation variant 열거값");
  expectUnreadable(run(edit(baseFiles(), ui("bottom-navigation"), "const VARIANT_CLASS = {", "const VARIANTS = {")), P.enums, "`const VARIANT_CLASS = { a: …, b: … }`");
  // 다른 모듈의 파일이 없으면 그 파일을 가리켜 못 읽음
  const trigger = expectUnreadable(run(without(baseFiles(), `${FILES.uiSrc}/selection-trigger.ts`)), P.enums, `${FILES.uiSrc}/selection-trigger.ts`);
  assert.deepEqual(trigger.unreadable.map((item) => item.what).sort(), ["combobox controlSize 열거값", "combobox variant 열거값", "select controlSize 열거값", "select variant 열거값"]);
  assert.deepEqual(parseInlineUnion(inputSrc, "layout"), { values: ["fill", "fixed"], line: 26 });
  assert.deepEqual(parseInlineUnion(numberInputSrc, "layout").values, ["fill", "fixed"], "`layout: \"fixed\" as const` 가 더 있어도 값은 둘");
  assert.equal(parseInlineUnion(inputSrc, "nothing"), null);
  assert.deepEqual(parseRecordKeys(navSrc, "VARIANT_CLASS").values, ["bar", "floating"]);
  assert.deepEqual(parseBooleanProp(appHeaderSrc, "sticky").values, ["false", "true"]);
  assert.equal(parseBooleanProp(appHeaderSrc, "titleAlign"), null);
});

test("Properties 열거값: 한 줄에 prop 이 둘인 열거 줄(「- `a`, `b`: `x | y`」·「각각」)도 각각 잰다", () => {
  // chip.md:38 의 꼴 — 문서 값이 늘거나 코드 유니온이 늘면 두 prop 모두 어긋남이다.
  const docSide = expectDrift(run(edit(baseFiles(), doc("chip"), "- `leadingTone`, `trailingTone`: `secondary | tertiary`", "- `leadingTone`, `trailingTone`: `secondary | tertiary | primary`")), P.enums, "chip leadingTone 열거값");
  assert.deepEqual(docSide.drifts.map((item) => item.what).sort(), ["chip leadingTone 열거값", "chip trailingTone 열거값"]);
  assert.ok(docSide.drifts.every((item) => item.docAt === `${doc("chip")}:${chipDoc.split("\n").findIndex((line) => line.startsWith("- `leadingTone`")) + 1}`), "두 어긋남이 같은 줄을 가리킨다");
  const codeSide = expectDrift(run(edit(baseFiles(), ui("chip"), 'type ChipTone = "secondary" | "tertiary"', 'type ChipTone = "secondary" | "tertiary" | "primary"')), P.enums, "chip trailingTone 열거값");
  assert.equal(codeSide.drifts.length, 2);
  // number-input.md:30 의 「각각」 꼴, select.md:49·combobox.md:35 의 「`MultiSelect.valueDisplay`」 꼴(ENUM_TABLE 의 `as`)
  expectDrift(run(edit(baseFiles(), ui("number-input"), 'type NumberInputAffixTone = "secondary" | "tertiary"', 'type NumberInputAffixTone = "secondary" | "tertiary" | "primary"')), P.enums, "number-input prefixTone 열거값");
  expectDrift(run(edit(baseFiles(), doc("select"), "`summary | count`", "`summary | count | none`")), P.enums, "select MultiSelect.valueDisplay 열거값");
  expectDrift(run(edit(baseFiles(), ui("combobox"), 'selectedItems?: "container" | "none"', 'selectedItems?: "container" | "none" | "chip"')), P.enums, "combobox MultiCombobox.selectedItems 열거값");
  expectUnreadable(run(edit(baseFiles(), ui("combobox"), 'selectedItems?: "container" | "none"', "selectedItems?: string")), P.enums, "`selectedItems?: \"a\" | \"b\"`");
  assert.deepEqual(unmeasuredEnumLines({ chip: chipDoc, "number-input": numberInputDoc, select: selectDoc, combobox: comboboxDoc }), [], "표에 있는 prop 은 재지 않는 것에 나오지 않는다");
});

test("값에 `|` 가 든 목록 줄 가운데 「- `prop`: `a | b`」 꼴이 아니거나 Properties 절 밖인 줄은 「재지 않는 것」 에 파일:행으로 낸다", () => {
  // 옛 message-bubble.md(2026-09-28 재작성 전):13·:16 의 꼴 — 「## 현재 API」 절의 라벨 줄(백틱 prop 이름 없음). 저장소에는 더 없지만 fixture 로 남겨 잰다
  // 「## Properties」 는 그대로 두고(열거 짝이 = 로 남게) 그 뒤에 옛 꼴의 절을 덧붙인다 — bubbleDoc 이 13 줄이라 라벨 줄은 :17 과 :19 다
  const api = run({ ...baseFiles(), [doc("message-bubble")]: `${bubbleDoc}\n## 현재 API\n\n- 방향: \`incoming | outgoing\`\n- 작성자, 시간과 콘텐츠\n- 전달 상태: \`sending | sent | read | failed\`\n` });
  expectSame(api, P.enums);
  const skipped = api.notMeasured.filter((entry) => !NOT_MEASURED.includes(entry));
  assert.deepEqual(skipped, [
    `${doc("message-bubble")}:17 열거 줄 「- 방향: \`incoming | outgoing\`」 — 「- \`prop\`: \`a | b\`」 꼴이 아니라 코드 쪽을 짚을 수 없어 재지 않는다`,
    `${doc("message-bubble")}:19 열거 줄 「- 전달 상태: \`sending | sent | read | failed\`」 — 「- \`prop\`: \`a | b\`」 꼴이 아니라 코드 쪽을 짚을 수 없어 재지 않는다`,
  ]);
  // 값이 콜론 바로 뒤가 아닌 줄(number-input.md:37 「`min | max`를 전달한다」)도 이름을 댄다
  const late = run(edit(baseFiles(), doc("number-input"), "- `controlsPosition`:", "- `onLimitReached`: 범위 경계에 도달할 때 `min | max`를 전달한다\n- `controlsPosition`:"));
  assert.ok(late.notMeasured.some((entry) => entry.includes(`${doc("number-input")}:`) && entry.includes("`onLimitReached`") && entry.includes("꼴이 아니라")), late.notMeasured.join("\n"));
  // 「- `prop`: `a | b`」 꼴이지만 「## Properties」 절 밖이면 절 밖이라고 적는다
  const outside = run(edit(baseFiles(), doc("chip"), "글자는 `text-oe-label` 을 쓴다.", "글자는 `text-oe-label` 을 쓴다.\n\n## 현재 구현 규칙\n\n- `density`: `compact | cozy`, 기본값 `cozy`"));
  expectSame(outside, P.enums);
  assert.ok(outside.notMeasured.some((entry) => entry.includes(`${doc("chip")}:`) && entry.includes("`density`") && entry.includes("「## Properties」 절 밖")), outside.notMeasured.join("\n"));
  // 값 자리에 `|` 가 없는 줄(`- \`value | defaultValue\`: 선택한 값`)은 열거 줄이 아니다
  assert.deepEqual(unmeasuredEnumLines({ select: `${selectDoc}- \`value | defaultValue\`: 선택한 Option value 또는 \`null\`\n` }), []);
});

test("Properties 열거값: 표에 없는 열거 줄은 「재지 않는 것」 에 줄 번호로 낸다 — 기본 fixture 에는 없다", () => {
  assert.deepEqual(unmeasuredEnumLines({ chip: chipDoc, switch: switchDoc, badge: badgeDoc }), [], "switch.md 「### Size」 의 단계 서술은 열거 줄이 아니다");
  const extra = run(edit(baseFiles(), doc("chip"), "- `shape`: `circle | rounded`", "- `density`: `compact | cozy`, 기본값 `cozy`\n- `shape`: `circle | rounded`"));
  expectSame(extra, P.enums);
  const skipped = extra.notMeasured.filter((entry) => !NOT_MEASURED.includes(entry));
  assert.deepEqual(skipped, [`${doc("chip")}:8 \`density\` 열거값 — 코드 쪽 읽는 법이 ENUM_TABLE 에 없어 재지 않는다(개발자가 표에 더한다)`]);
  assert.ok(!skipped.some((entry) => entry.includes("`leadingTone`")), "표에 있는 여러 prop 줄은 재므로 나오지 않는다");
  const fresh = run({ ...baseFiles(), [doc("tabs")]: "# Tabs\n\n`packages/ui/src/tabs.tsx`\n\n## Properties\n\n- `variant`: `line | pill`, 기본값 `line`\n" });
  assert.ok(fresh.notMeasured.some((entry) => entry.includes(`${doc("tabs")}:7`) && entry.includes("`variant`")), "표에 없는 컴포넌트의 열거 줄도 낸다");
  for (const key of Object.keys(ENUM_TABLE)) assert.ok(CONFIRMED.some(([confirmed]) => confirmed === key), `fixture 에 ${key} 가 있다`);
  const gone = expectUnreadable(run(without(baseFiles(), FILES.componentDocs)), P.enums, FILES.componentDocs);
  assert.ok(gone.unreadable.some((item) => item.what === P.enums && item.detail === "디렉터리를 읽지 못했다"));
});

// --- 토큰 --------------------------------------------------------------------------------------------------------------

test("tokens.md Neutral 목록: 이름이 빠지거나 남으면 어긋남, 펜스 줄이 꼴에 안 맞으면 그 줄이 못 읽음(어긋남으로 세지 않는다)", () => {
  expectDrift(run(edit(baseFiles(), FILES.tokensDoc, "oe-border-visual\n", "")), P.neutral, "문서 목록에 없는 코드 이름");
  expectDrift(run(edit(baseFiles(), FILES.tokensDoc, "oe-border-visual\n", "oe-border-visual\noe-border-ghost\n")), P.neutral, "코드에 없는 이름");
  const odd = expectUnreadable(run(edit(baseFiles(), FILES.tokensDoc, "oe-border-visual\n", "oe-border-visual (임시)\n")), P.neutral, "펜스 줄 「oe-border-visual (임시)」");
  assert.deepEqual(odd.drifts, [], "읽지 못한 줄의 이름은 어긋남으로 세지 않는다");
  expectUnreadable(run(edit(baseFiles(), FILES.tokensDoc, "## Neutral semantic token", "## Neutral")), P.neutral, "## Neutral semantic token");
  // 펜스 안의 `# 주석` 줄은 절을 자르지 않는다 — 「펜스가 없다」 가 아니라 그 줄을 가리켜 못 읽음
  const hash = expectUnreadable(run(edit(baseFiles(), FILES.tokensDoc, "```text\noe-foreground-primary\n", "```text\noe-foreground-primary\n# 전경\n")), P.neutral, "펜스 줄 「# 전경」");
  assert.deepEqual(hash.drifts, []);
  assert.ok(!hash.unreadable.some((item) => item.detail.includes("펜스")) || hash.unreadable.every((item) => item.detail.startsWith("펜스 줄")), "펜스가 없다고 말하지 않는다");
  assert.deepEqual(hash.unreadable.map((item) => item.docAt), [`${FILES.tokensDoc}:9`]);
});

test("sectionOf 는 펜스 안의 # 줄을 제목으로 보지 않고, 문단은 줄바꿈을 건너 이어진다", () => {
  const md = "# T\n\n## A\n\n```text\n# 주석\n```\n\n둘째 줄로\n이어지는 문장이다.\n\n- 항목 하나는\n  들여쓴 줄로 이어진다\n- 항목 둘\n\n| a | b |\n\n## B\n";
  const section = sectionOf(md, /^## A\s*$/m);
  assert.equal(section.line, 3);
  assert.ok(section.text.includes("# 주석") && section.text.includes("| a | b |") && !section.text.includes("## B"));
  assert.equal(sectionOf(md, /^# 주석\s*$/m), null, "펜스 안의 줄은 제목이 아니다");
  const blocks = paragraphsOf(md);
  assert.deepEqual(blocks.map((block) => [block.kind, block.text]), [
    ["heading", "# T"],
    ["heading", "## A"],
    ["paragraph", "둘째 줄로 이어지는 문장이다."],
    ["paragraph", "- 항목 하나는 들여쓴 줄로 이어진다"],
    ["paragraph", "- 항목 둘"],
    ["row", "| a | b |"],
    ["heading", "## B"],
  ]);
  const wrapped = blocks[2];
  assert.equal(wrapped.lineAt(0), 9);
  assert.equal(wrapped.lineAt(wrapped.text.indexOf("이어지는")), 10, "문단 안 위치를 원래 행으로 돌린다");
  assert.deepEqual(sentenceAround("첫 문장이다. 둘째 `a.tsx` 문장이다. 셋째.", 12), { start: 7, end: 24 }, "낱말 안의 점(a.tsx)은 경계가 아니다");
  assert.deepEqual(sentenceAround("**굵다.** 뒤 문장", 12), { start: 7, end: 12 }, "굵게 닫는 ** 뒤에서 끝난다");
});

test("tokens.md status 문법: role 이나 예시 이름이 빠지면 어긋남, 절이 없으면 못 읽음", () => {
  expectDrift(run(edit(baseFiles(), FILES.tokensDoc, "oe-danger-background-bold-primary\n", "")), P.status, "status 예시(danger) — 문서 목록에 없는 코드 이름");
  expectDrift(run(edit(baseFiles(), FILES.tokensDoc, "danger\nwarning\n", "danger\nwarning\nnotice\n")), P.status, "status role — 코드에 없는 이름");
  expectUnreadable(run(edit(baseFiles(), FILES.tokensDoc, "## Semantic status token", "## Status")), P.status, "## Semantic status token");
});

test("color.md 제안하는 최소 역할: 문서→코드 한 방향 — 문서에만 있는 이름은 어긋남, 코드에만 있는 이름은 참고", () => {
  const base = run(baseFiles());
  expectSame(base, P.proposed);
  assert.ok(base.notes.some((note) => note.includes("oe-border-visual") && note.includes("어긋남으로 세지 않는다")), base.notes.join("\n"));
  expectDrift(run(edit(baseFiles(), FILES.colorDoc, "oe-focus-ring\noe-interaction-hover-subtle", "oe-focus-ring\noe-halo\noe-interaction-hover-subtle")), P.proposed, "코드에 없는 이름");
  const fewer = run(edit(baseFiles(), FILES.colorDoc, "oe-interaction-hover-subtle\noe-interaction-hover\n\nAccent", "\nAccent"));
  expectSame(fewer, P.proposed);
  assert.ok(fewer.notes.some((note) => note.includes("oe-interaction-hover-subtle")));
  expectUnreadable(run(edit(baseFiles(), FILES.colorDoc, "### 제안하는 최소 역할", "### 역할")), P.proposed, "### 제안하는 최소 역할");
});

test("color.md Light/Dark 매핑: 단계가 다르면 어긋남, 「→」 가 아닌 줄은 그 줄이 못 읽음(어긋남으로 세지 않는다)", () => {
  expectDrift(run(edit(baseFiles(), FILES.colorDoc, "oe-brand-border-secondary            → brand-800", "oe-brand-border-secondary            → brand-700")), P.brand, "oe-brand-border-secondary dark");
  expectDrift(run(edit(baseFiles(), FILES.tokens, "focusRing: solid(600)", "focusRing: solid(500)")), P.brand, "oe-focus-ring light");
  const arrow = expectUnreadable(run(edit(baseFiles(), FILES.colorDoc, "oe-brand-border-secondary            → brand-200", "oe-brand-border-secondary            -> brand-200")), P.brand, "펜스 줄 「oe-brand-border-secondary            -> brand-200」");
  assert.deepEqual(arrow.drifts, [], "「->」 줄은 못 읽음이지 문서에 없는 이름이 아니다");
  expectUnreadable(run(edit(baseFiles(), FILES.colorDoc, "### Dark", "### 어두운")), P.brand, "### Dark");
});

test("color.md brand tone 표·alpha 단계: 값이 다르면 어긋남, 열이 늘거나 줄이 꼴에 안 맞으면 못 읽음", () => {
  expectDrift(run(edit(baseFiles(), FILES.colorDoc, "| `brand-500` | 60 |", "| `brand-500` | 55 |")), P.tone, "brand-500 의 HCT tone");
  expectUnreadable(run(edit(baseFiles(), FILES.colorDoc, "| Token | HCT tone |\n| --- | ---: |", "| Token | HCT tone | Hex |\n| --- | ---: | --- |")), P.tone, "두 열");
  const odd = expectUnreadable(run(edit(baseFiles(), FILES.colorDoc, "| `brand-500` | 60 |", "| `brand-500` | 60 정도 |")), P.tone, "| `brand-500` | 60 정도 |");
  assert.deepEqual(odd.drifts, [], "읽지 못한 행의 단계는 어긋남으로 세지 않는다");
  expectUnreadable(run(edit(baseFiles(), FILES.colorDoc, "## Solid primitive", "## Solid")), P.tone, "## Solid primitive");
  expectDrift(run(edit(baseFiles(), FILES.tokensDoc, "`05, 08, 10, 16,", "`05, 08, 10, 15,")), P.alpha, "brand alpha 단계");
  expectDrift(run(edit(baseFiles(), FILES.colorDoc, "brand-alpha-16\n", "")), P.alpha, "brand alpha 단계");
  const word = expectUnreadable(run(edit(baseFiles(), FILES.colorDoc, "brand-alpha-16\n", "brand-alpha-sixteen\n")), P.alpha, "brand-alpha-sixteen");
  assert.deepEqual(word.drifts, [], "읽지 못한 줄이 있으면 목록 비교를 하지 않는다");
  expectUnreadable(run(edit(baseFiles(), FILES.tokensDoc, "다음 값만 생성한다:", "다음 값을 만든다:")), P.alpha, "다음 값만 생성한다");
});

const lineOf = (text, needle) => text.split("\n").findIndex((line) => line.includes(needle)) + 1;

test("열거 줄(§3 재지 않는 것): `*`·`1.` 표지와 콜론 없는 줄도 값에 `|` 가 들면 잡아 「재지 않는 것」 에 파일:행으로 낸다", () => {
  const files = edit(baseFiles(), doc("chip"), "- `shape`: `circle | rounded`, 기본값 `circle`", "- `shape`: `circle | rounded`, 기본값 `circle`\n* `density`: `compact | cozy`\n1. `weight`: `light | bold`\n- `tone2` — `warm | cool`\n- `align`: `left` | `right`");
  const measured = run(files);
  expectSame(measured, P.enums);
  const skipped = measured.notMeasured.filter((entry) => !NOT_MEASURED.includes(entry));
  const first = lineOf(files[doc("chip")], "* `density`");
  assert.deepEqual(skipped, [
    `${doc("chip")}:${first} 열거 줄 「* \`density\`: \`compact | cozy\`」 — 「- \`prop\`: \`a | b\`」 꼴이 아니라 코드 쪽을 짚을 수 없어 재지 않는다`,
    `${doc("chip")}:${first + 1} 열거 줄 「1. \`weight\`: \`light | bold\`」 — 「- \`prop\`: \`a | b\`」 꼴이 아니라 코드 쪽을 짚을 수 없어 재지 않는다`,
    `${doc("chip")}:${first + 2} 열거 줄 「- \`tone2\` — \`warm | cool\`」 — 「- \`prop\`: \`a | b\`」 꼴이 아니라 코드 쪽을 짚을 수 없어 재지 않는다`,
    `${doc("chip")}:${first + 3} 열거 줄 「- \`align\`: \`left\` | \`right\`」 — 「- \`prop\`: \`a | b\`」 꼴이 아니라 코드 쪽을 짚을 수 없어 재지 않는다`,
  ]);
  // 이름 자리의 `|`(select.md 「- `value | defaultValue`: …」)는 열거 줄이 아니다
  assert.deepEqual(unmeasuredEnumLines({ select: `${selectDoc}- \`MultiSelect.value | defaultValue\`: 선택한 Option value 배열\n` }), []);
});

test("별칭 클래스·백틱 경로: 선언 없는 별칭과 없는 경로가 어긋남, 미래 경로는 「재지 않는 것」, 디렉터리·@theme 이 없으면 짝 이름으로 못 읽음", () => {
  expectDrift(run(edit(baseFiles(), doc("chip"), "`text-oe-label`", "`text-oe-caption`")), P.alias, "별칭 클래스 text-oe-caption");
  expectUnreadable(run({ ...baseFiles(), [FILES.tokensCss]: ":root {}\n" }), P.alias, FILES.tokensCss);
  expectDrift(run(edit(baseFiles(), FILES.readme, "| `apps/studio` | 검수 화면 |", "| `apps/studio` | 검수 화면 |\n| `packages/patterns` | 화면 예시 구현 |")), P.paths, "문서가 적은 경로");
  const future = run(edit(baseFiles(), FILES.readme, "| `apps/studio` | 검수 화면 |", "| `apps/studio` | 검수 화면 |\n| `packages/patterns` | 화면 예시 구현. 확정된 Pattern이 생기면 같은 자리에 둔다 |"));
  expectSame(future, P.paths);
  assert.ok(future.notMeasured.some((entry) => entry.includes("`packages/patterns`") && entry.includes("미래")), future.notMeasured.join("\n"));
  expectDrift(run(without(baseFiles(), "apps/studio/src/components/candidates/")), P.paths, "문서가 적은 경로");
  expectUnreadable(run(without(baseFiles(), FILES.foundationDocs)), P.paths, FILES.foundationDocs);
  const gone = run(without(baseFiles(), FILES.systemDocs));
  for (const name of [P.alias, P.paths]) {
    const entry = expectUnreadable(gone, name, "디렉터리를 읽지 못했다");
    assert.deepEqual(entry.unreadable.map((item) => item.what), [name, name, name], "디렉터리 셋 모두 짝 이름으로");
    assert.deepEqual(entry.unreadable.map((item) => item.docAt), [FILES.systemDocs, FILES.foundationDocs, FILES.componentDocs]);
  }
  const text = formatReport(gone);
  assert.ok(text.includes(`? ${P.alias} — 못 읽었다 — ${FILES.systemDocs}: 디렉터리를 읽지 못했다`));
  assert.ok(text.includes(`? ${P.paths} — 못 읽었다 — ${FILES.systemDocs}: 디렉터리를 읽지 못했다`));
  assert.ok(!text.includes("? 디렉터리 —"), "어느 짝인지 알 수 없는 「? 디렉터리」 줄은 없다");
});

test("백틱 경로의 미래 판정은 경로가 든 문장(표 행이면 그 행)만 본다", () => {
  const cut = run(edit(baseFiles(), FILES.iconDoc, "자리는 `apps/studio/src/components/candidates/material-symbols.tsx`에 둔다.", "자리는 `apps/studio/src/components/candidates/material-symbols.tsx`에 둔다. 겹치는 이름이 생기면 파일을 나눈다."));
  expectSame(cut, P.paths);
  const missing = expectDrift(run(without(edit(baseFiles(), FILES.iconDoc, "자리는 `apps/studio/src/components/candidates/material-symbols.tsx`에 둔다.", "자리는 `apps/studio/src/components/candidates/material-symbols.tsx`에 둔다. 겹치는 이름이 생기면 파일을 나눈다."), "apps/studio/src/components/candidates/")), P.paths, "문서가 적은 경로");
  assert.ok(!missing.skipped.some((entry) => entry.includes("material-symbols")), "다른 문장의 「생기면」 은 이 경로를 미래로 만들지 않는다");
  assert.deepEqual(
    parseDocPaths("확정된 Pattern이 생기면 `packages/patterns`를 다시 만든다. 지금은 `apps/sandbox`에 둔다.\n\n| `packages/x` | 설명. 생기면 옮긴다 |\n\n줄이\n`docs/a.md`로 이어진다. 확정되면 바꾼다.\n"),
    [
      { target: "packages/patterns", line: 1, future: true },
      { target: "apps/sandbox", line: 1, future: false },
      { target: "packages/x", line: 3, future: true },
      { target: "docs/a.md", line: 6, future: false },
    ],
  );
});

test("interaction.md·icon.md·catalog.md: 절 안에서만 읽는다 — 값이 다르면 어긋남, 절이나 문장이 없으면 못 읽음", () => {
  expectDrift(run(edit(baseFiles(), FILES.interactionDoc, "- Regular: 36px", "- Regular: 40px")), P.interaction, "Control Height Regular");
  expectDrift(run(edit(baseFiles(), FILES.interactionDoc, "- `wide` 40px", "- `wide` 48px")), P.interaction, "화면 좌우 여백 wide");
  expectDrift(run(edit(baseFiles(), FILES.interactionDoc, "- XXLarge: 56px\n", "")), P.interaction, "Control Height 단계 — 문서 목록에 없는 코드 이름");
  expectDrift(run(edit(baseFiles(), FILES.interactionDoc, "- `wide` 40px", "- `narrow` 8px: 좁다.\n- `wide` 40px")), P.interaction, "화면 좌우 여백 단계 — 코드에 없는 이름");
  expectSame(run(edit(baseFiles(), FILES.interactionDoc, "화살표는 아래를 가리킨다.", "화살표는 아래를 가리킨다.\n\n- Small: 12px")), P.interaction);
  expectUnreadable(run(edit(baseFiles(), FILES.interactionDoc, "## Compact", "## 작은 것")), P.interaction, "## Compact");
  expectUnreadable(run(edit(baseFiles(), FILES.interactionDoc, "**8px**", "8px")), P.interaction, "**8px**");
  expectDrift(run(edit(baseFiles(), FILES.iconDoc, "- `oe-icon-large`: 24px", "- `oe-icon-large`: 22px")), P.icon, "oe-icon-large");
  expectUnreadable(run(edit(baseFiles(), FILES.iconDoc, "- `oe-icon-large`: 24px", "- `oe-icon-large`: 24 픽셀")), P.icon, "- `oe-icon-large`: 24 픽셀");
  expectUnreadable(run(edit(baseFiles(), FILES.iconDoc, "## 크기 토큰", "## 크기")), P.icon, "## 크기 토큰");
  expectDrift(run(without(baseFiles(), `${FILES.studioFoundations}/typography/`)), P.catalog, "코드에 없는 이름");
  expectUnreadable(run(edit(baseFiles(), FILES.catalogDoc, "## 현재 경로", "## 경로")), P.catalog, "## 현재 경로");
  expectUnreadable(run(without(baseFiles(), FILES.studioFoundations)), P.catalog, FILES.studioFoundations);
});

test("목록 줄의 꼴이 어긋나면 어긋남이 아니라 그 줄을 가리키는 못 읽음이다 — interaction·catalog 도 icon 과 같다", () => {
  const cases = [
    [FILES.interactionDoc, "- Regular: 36px", "- Regular: `36px`", P.interaction, "Control Height"],
    [FILES.interactionDoc, "- Regular: 36px", "- Regular: 36px (기본)", P.interaction, "Control Height"],
    [FILES.interactionDoc, "- `default` 16px:", "- `default`: 16px", P.interaction, "좌우 여백"],
    [FILES.catalogDoc, "- `/foundations/color`: ", "- `/foundations/color` — ", P.catalog, "catalog.md 현재 경로"],
    [FILES.iconDoc, "- `oe-icon-large`: 24px", "- `oe-icon-large`: `24px`", P.icon, "icon.md 크기 토큰"],
  ];
  for (const [file, from, to, pairName, what] of cases) {
    const files = edit(baseFiles(), file, from, to);
    const measured = run(files);
    const entry = expectUnreadable(measured, pairName, `줄 「${to}`);
    assert.deepEqual(entry.drifts, [], `${to}: 꼴 어긋남을 「문서 목록에 없는 코드 이름」 으로 내지 않는다`);
    assert.equal(entry.unreadable.length, 1);
    assert.ok(entry.unreadable[0].what.includes(what));
    assert.equal(entry.unreadable[0].docAt, `${file}:${files[file].split("\n").findIndex((line) => line.startsWith(to)) + 1}`, "그 줄을 가리킨다");
  }
});

// --- 파일이 없어도, 예외가 나도 exit 0 -------------------------------------------------------------------------------

test("파일 하나가 없으면 그 경로를 「못 읽었다」 로 내고 나머지 짝은 그대로 재며 exit 0 이다", () => {
  const measured = run(without(baseFiles(), FILES.catalogDoc));
  const entry = expectUnreadable(measured, P.catalog, FILES.catalogDoc);
  assert.deepEqual(entry.unreadable.map((item) => item.detail), ["파일을 읽지 못했다"]);
  for (const name of PAIRS.filter((candidate) => candidate !== P.catalog)) expectSame(measured, name);
  const text = formatReport(measured);
  assert.match(text, /^docs\/system 과 코드가 어긋난 곳 0곳, 못 읽은 곳 1곳/);
  assert.ok(text.includes(`? ${P.catalog} — 못 읽었다 — ${FILES.catalogDoc}: 파일을 읽지 못했다`));
  const gone = run(without(baseFiles(), FILES.tokens));
  for (const name of [P.neutral, P.status, P.proposed, P.brand, P.tone, P.alpha, P.interaction, P.icon]) expectUnreadable(gone, name, FILES.tokens);
});

test("CLI: 기본 exit 0, --strict 는 어긋남·못 읽음이 있을 때만 1, 저장소가 통째로 없어도 도구 오류가 나도 exit 0", () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), "system-drift-empty-"));
  try {
    const plain = main([], dir);
    assert.equal(plain.exitCode, 0);
    assert.match(plain.text, /^docs\/system 과 코드가 어긋난 곳 0곳, 못 읽은 곳 \d+곳/);
    for (const line of plain.text.split("\n").slice(1, 1 + PAIRS.length)) assert.match(line, /^\? .+ — 못 읽었다 — .+: (파일을|디렉터리를) 읽지 못했다$/);
    assert.equal(main(["--strict"], dir).exitCode, 1);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
  const boom = () => {
    throw new Error("boom");
  };
  assert.deepEqual(main([], "/nowhere", boom), { text: "도구 오류: boom", exitCode: 0 });
  assert.deepEqual(main(["--strict"], "/nowhere", boom), { text: "도구 오류: boom", exitCode: 1 });
  assert.equal(main(undefined, "/nowhere", boom).exitCode, 0, "argv 가 이상해도 exit 0");
});

test("보고의 꼴: 요약, 짝마다 =·⚠·?, 참고, 재지 않는 것", () => {
  const measured = {
    pairs: [
      { name: "A ↔ a", drifts: [], unreadable: [], notes: [], skipped: [] },
      { name: "B ↔ b", drifts: [{ what: "BADGE_COLORS 개수", code: "18색", doc: "17색", codeAt: "packages/ui/src/badge.tsx:12", docAt: "docs/system/components/badge.md:34" }], unreadable: [], notes: [], skipped: [] },
      { name: "C ↔ c", drifts: [], unreadable: [{ what: "Compact 높이", detail: "「## Compact」 절의 「값은 20px 하나」 문장", docAt: "docs/system/interaction.md:80" }], notes: [], skipped: [] },
    ],
    notes: ["코드에만 있는 이름 — x"],
    notMeasured: ["순서 — 규칙이 없다"],
  };
  assert.deepEqual(formatReport(measured).split("\n"), [
    "docs/system 과 코드가 어긋난 곳 1곳, 못 읽은 곳 1곳 (3개 짝을 잼)",
    "= A ↔ a",
    "⚠ BADGE_COLORS 개수 — 코드 18색 vs 문서 17색 (packages/ui/src/badge.tsx:12 · docs/system/components/badge.md:34)",
    "? Compact 높이 — 못 읽었다 — docs/system/interaction.md:80: 「## Compact」 절의 「값은 20px 하나」 문장",
    "",
    "참고:",
    "- 코드에만 있는 이름 — x",
    "",
    "재지 않는 것:",
    "- 순서 — 규칙이 없다",
  ]);
  assert.equal(formatReport({ pairs: [{ name: "A ↔ a", drifts: [], unreadable: [], notes: [], skipped: [] }] }), "docs/system 과 코드가 맞는다(1개 짝)\n= A ↔ a");
});

// --- 문장이 조금 바뀌어도 읽힌다 (비교 함수에 fixture 문자열을 직접 넣는다) ------------------------------------------

const none = (outcome, label) => {
  assert.deepEqual(outcome.drifts, [], `${label}: 어긋남이 없어야 한다`);
  assert.deepEqual(outcome.unreadable, [], `${label}: 못 읽은 곳이 없어야 한다`);
};

test("한글 수사와 단위를 숫자로 읽는다", () => {
  assert.deepEqual(["하나", "둘", "셋", "넷", "다섯", "여섯", "일곱", "여덟", "아홉", "열", "열여덟", "스물둘", "18", "다섯 개", "열여덟 색", "세 가지"].map(koreanNumber), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 18, 22, 18, 5, 18, 3]);
  assert.equal(koreanNumber("여러"), null);
});

test("띄어쓰기와 「개」↔「색」·한글 수사가 바뀌어도 BADGE_COLORS 문장을 읽는다", () => {
  for (const variant of ["`BADGE_COLORS`의 18개 중 하나", "`BADGE_COLORS` 의 18 색 중 하나", "`BADGE_COLORS`의 열여덟 색 중 하나", "`BADGE_COLORS` 의 열여덟 가지 중 하나"]) {
    none(compareBadgeColorCount(badgeSrc, badgeDoc.replace("`BADGE_COLORS` 의 18색 중 하나", variant)), variant);
  }
  none(compareBadgeColorCount(badgeSrc, badgeDoc.replace("Tailwind primitive 18색", "Tailwind primitive 18 개")), "primitive 18 개");
  assert.equal(compareBadgeColorCount(badgeSrc, badgeDoc.replace("`BADGE_COLORS` 의 18색", "`BADGE_COLORS`의 열일곱 색")).drifts.length, 1);
});

test("bottom-navigation 문장에 「개」가 붙거나 숫자로 바뀌어도 읽는다", () => {
  none(compareBottomNavigationMax(navSrc, navDoc.replace("항목 셋부터 다섯까지다", "항목 셋부터 다섯 개까지다").replace("항목이 다섯을 넘으면", "항목이 다섯 개를 넘으면").replace("여섯을 넘기면", "여섯 개를 넘기면")), "「개」");
  none(compareBottomNavigationMax(navSrc, navDoc.replace("항목 셋부터 다섯까지다", "항목 셋부터 5까지다")), "숫자");
});

test("`color` 줄의 접속사·수사가 바뀌어도 이름 집합을 읽는다", () => {
  const toggle = (text) => compareColorList(toggleSrc, "TOGGLE_BUTTON_COLORS", text, ui("toggle-button"), doc("toggle-button"));
  const button = (text) => compareColorList(buttonSrc, "BUTTON_COLORS", text, ui("button"), doc("button"));
  none(toggle(toggleDoc.replace("값은 `favorite`과 `like`다", "값은 `favorite`, `like` 다")), "쉼표");
  none(toggle(toggleDoc.replace("값은 `favorite`과 `like`다", "값은 `favorite` 그리고 `like` 다")), "그리고");
  none(button(buttonDoc.replace("현재 값은 `excel` 하나다", "현재 값은 `excel` 한 가지다")), "한 가지");
  assert.deepEqual(button(buttonDoc.replace("현재 값은 `excel` 하나다", "현재 값은 `excel` 둘이다")).drifts.map((entry) => entry.what), ["BUTTON_COLORS 개수"]);
});

test("Specification 줄의 백틱·곱셈 기호·띄어쓰기가 바뀌어도 읽는다", () => {
  none(compareTextareaHeight(textareaSrc, textareaDoc.replace("- Minimum height: `80px`", "- Minimum height: 80px")), "백틱 없는 80px");
  none(compareTextareaFieldHeight(textareaSrc, textareaDoc.replace("- Textarea field minimum height: `78px`", "- Textarea field minimum height:  78 px")), "띄어쓰기");
  none(compareCheckboxControl(checkboxSrc, checkboxDoc.replace("- Control: 16 × 16px", "- Control: 16x16 px")), "x 기호");
  none(compareCheckboxIndicatorIcons(checkboxSrc, checkboxDoc.replace("Square·Rounded 10 × 10px / Ghost 15 × 15px", "Square·Rounded 10x10px / Ghost 15x15px")), "x 기호");
  none(compareInteraction(tokensSrc, interactionDoc.replace("- Regular: 36px", "- Regular: 36 px")), "36 px");
});

test("표의 여백과 열 순서가 바뀌어도 읽는다", () => {
  none(compareBadgeSpecTable(badgeSrc, badgeDoc.replace("| 높이 | 20px | 24px |", "|  높이  |  20px  |  24px  |")), "여백");
  const swapped = badgeDoc.replace("| 자리 | `small` | `medium` |", "| 자리 | `medium` | `small` |").replace("| 높이 | 20px | 24px |", "| 높이 | 24px | 20px |").replace("| 좌우 여백 | 6px | 8px |", "| 좌우 여백 | 8px | 6px |").replace("| 아이콘이 붙는 변 | 4px | 6px |", "| 아이콘이 붙는 변 | 6px | 4px |");
  none(compareBadgeSpecTable(badgeSrc, swapped), "열 순서");
  none(compareReadmeTable(registrySource, readmeSource.replace("| Tabs | 초안 | 없음 | 탭 |", "|  Tabs  |  초안  |없음|  탭  |")), "README 셀 여백");
  none(compareLlms(registrySource, `확정 ${CONFIRMED.length} 종 : \`badge\`\n초안 (쓰지 않는다) : \`tabs\`\n`), "llms 띄어쓰기");
  const table = parseTable(sectionOf("## T\n\n| a | b |\n| --- | --- |\n| 1 | 2 |\n| 3 | 4 | 5 |\n\n끝", /^## T\s*$/m));
  assert.deepEqual(table.header, ["a", "b"]);
  assert.deepEqual(table.rows.map((row) => row.cells), [["1", "2"], ["3", "4", "5"]]);
  assert.deepEqual(table.rows.map((row) => row.line), [5, 6]);
});

test("Property 줄의 괄호 범주와 값 순서가 바뀌어도 열거값을 읽는다", () => {
  none(compareEnums("badge", badgeSrc, badgeDoc.replace("- `tone`: `brand | neutral | warning | danger | success | info | custom`", "- `tone` (Tone): `custom | info | success | danger | warning | neutral | brand`")), "순서·괄호");
  none(compareEnums("checkbox", checkboxSrc, checkboxDoc.replace("`square | rounded | ghost`", "`ghost|rounded|square`")), "띄어쓰기 없는 파이프");
});

test("펜스 언어 표시가 없어도 목록을 읽고, 슬래시 축약과 {role} 템플릿을 펼친다", () => {
  none(compareNeutralList(tokensSrc, tokensDoc.replace("## Neutral semantic token\n\n```text", "## Neutral semantic token\n\n```")), "``` 만");
  const known = new Set(["neutral", "accent", "danger", "warning", "success", "info", "brand"]);
  const lines = ["Neutral", "oe-foreground-primary / secondary / inverse", "oe-background-canvas-primary / canvas-secondary", "oe-focus-ring", "Brand 및 danger / warning", "oe-{role}-border-primary / secondary"].map((text) => ({ text, line: 1 }));
  assert.deepEqual(expandRoleList(lines, known), { names: ["oe-foreground-primary", "oe-foreground-secondary", "oe-foreground-inverse", "oe-background-canvas-primary", "oe-background-canvas-secondary", "oe-focus-ring", "oe-brand-border-primary", "oe-brand-border-secondary", "oe-danger-border-primary", "oe-danger-border-secondary", "oe-warning-border-primary", "oe-warning-border-secondary"], problems: [], partial: new Set() });
});

test("color.md 제안하는 최소 역할: 「oe-…( / …)*」 꼴이 아닌 펜스 줄은 그 줄을 가리켜 ? 로 내고 이름 비교와 「코드에만 있는 이름」 참고에서 뺀다 — 깨진 줄을 이름으로 읽어 ⚠ 를 내지 않는다", () => {
  const known = new Set(["neutral", "accent", "danger", "warning", "success", "info", "brand"]);
  for (const [from, to] of [
    ["oe-border-primary / secondary / disabled\n", "oe-border-primary, secondary, disabled\n"],
    ["oe-interaction-hover\n\nAccent", "oe-interaction-hover (state layer)\n\nAccent"],
  ]) {
    const files = edit(baseFiles(), FILES.colorDoc, from, to);
    const entry = expectUnreadable(run(files), P.proposed, `펜스 줄 「${to.split("\n")[0]}」`);
    assert.deepEqual(entry.drifts, [], `${to.trim()}: 깨진 줄의 낱말을 「코드에 없는 이름」 으로 내지 않는다`);
    assert.equal(entry.unreadable.length, 1);
    assert.equal(entry.unreadable[0].docAt, `${FILES.colorDoc}:${lineOf(files[FILES.colorDoc], to.split("\n")[0])}`, "그 줄을 가리킨다");
  }
  // 쉼표 줄이 말하려던 oe-border-secondary·oe-border-disabled 는 「코드에만 있는 이름」 참고에 다시 나오지 않는다(못 읽음 하나로 충분하다)
  const comma = run(edit(baseFiles(), FILES.colorDoc, "oe-border-primary / secondary / disabled\n", "oe-border-primary, secondary, disabled\n"));
  const note = pairOf(comma, P.proposed).notes.find((text) => text.includes("제안하는 최소 역할"));
  assert.ok(note && !note.includes("oe-border-secondary") && !note.includes("oe-border-disabled"), note);
  assert.deepEqual(expandRoleList([{ text: "oe-a-primary, secondary", line: 1 }, { text: "oe-b-x (임시)", line: 2 }, { text: "oe-c-y / z", line: 3 }], known), {
    names: ["oe-c-y", "oe-c-z"],
    problems: [
      { text: "oe-a-primary, secondary", line: 1, detail: "펜스 줄 「oe-a-primary, secondary」 이 「oe-이름( / 접미)*」 꼴에 맞지 않는다" },
      { text: "oe-b-x (임시)", line: 2, detail: "펜스 줄 「oe-b-x (임시)」 이 「oe-이름( / 접미)*」 꼴에 맞지 않는다" },
    ],
    partial: new Set(["oe-a-primary", "oe-a-secondary", "oe-b-x"]),
  });
});

test("펜스 줄이 대문자로 시작해도(「Danger」「OE-foreground-primary」) ? 하나만 — 그 이름을 「문서 목록에 없는 코드 이름」 ⚠ 으로 다시 세지 않는다", () => {
  const role = expectUnreadable(run(edit(baseFiles(), FILES.tokensDoc, "```text\ndanger\nwarning\n", "```text\nDanger\nwarning\n")), P.status, "펜스 줄 「Danger」");
  assert.deepEqual([role.drifts, role.unreadable.length], [[], 1]);
  const neutral = expectUnreadable(run(edit(baseFiles(), FILES.tokensDoc, "```text\noe-foreground-primary\n", "```text\nOE-foreground-primary\n")), P.neutral, "펜스 줄 「OE-foreground-primary」");
  assert.deepEqual([neutral.drifts, neutral.unreadable.length], [[], 1]);
});

test("color.md 제안하는 최소 역할(§4): roles 는 라벨 줄의 영문 낱말 ∩ 코드 role — 교집합에서 빠진 낱말이 있으면 라벨 줄이 ?, roles 가 비면 {role} 줄들이 ? (거짓 ⚠ 도 빈 목록도 아니다)", () => {
  const known = new Set(["neutral", "accent", "danger", "warning", "success", "info", "brand"]);
  // 라벨에 role 이 아닌 영문 낱말(status·role)이 끼면 그 라벨 줄을 ? 로 — 「oe-status-…」「oe-role-…」 를 지어 ⚠ 를 내지 않는다
  const extra = expectUnreadable(run(edit(baseFiles(), FILES.colorDoc, "Brand 및 danger / warning / success / info\n", "Brand 및 status role(danger / warning / success / info)\n")), P.proposed, "「status」·「role」");
  assert.deepEqual(extra.drifts, [], "코드에 없는 이름을 지어 어긋남으로 내지 않는다");
  assert.deepEqual(extra.unreadable.map((item) => item.docAt), [`${FILES.colorDoc}:${lineOf(colorDoc, "Brand 및 danger")}`], "라벨 줄 하나만 가리킨다");
  // 라벨을 한글로 바꾸고 코드에 없는 {role} 줄을 더한다 — roles 가 비어 {role} 줄 넷이 모두 ? 다(전에는 조용히 「=」 였다)
  const korean = edit(edit(baseFiles(), FILES.colorDoc, "Brand 및 danger / warning / success / info\n", "브랜드와 상태\n"), FILES.colorDoc, "oe-{role}-border-primary / secondary\n", "oe-{role}-border-primary / secondary\noe-{role}-foreground-tertiary\n");
  const entry = expectUnreadable(run(korean), P.proposed, "{role}");
  assert.deepEqual(entry.drifts, [], "펼치지 못한 줄은 어긋남으로 세지 않는다");
  const fenceStart = lineOf(colorDoc, "oe-{role}-foreground-primary");
  assert.deepEqual(entry.unreadable.map((item) => item.docAt), [0, 1, 2, 3].map((offset) => `${FILES.colorDoc}:${fenceStart + offset}`));
  // 라벨을 그대로 두고 같은 줄만 더하면 문서→코드 어긋남이다
  expectDrift(run(edit(baseFiles(), FILES.colorDoc, "oe-{role}-border-primary / secondary\n", "oe-{role}-border-primary / secondary\noe-{role}-foreground-tertiary\n")), P.proposed, "코드에 없는 이름");
  // 라벨의 영문 낱말이 하나여도 role 이다. 코드 role 이 아닌 낱말만 있으면 라벨 줄과 {role} 줄 모두 ? 다
  assert.deepEqual(expandRoleList([{ text: "Brand", line: 1 }, { text: "oe-{role}-focus", line: 2 }], known), { names: ["oe-brand-focus"], problems: [], partial: new Set() });
  const status = expandRoleList([{ text: "Status", line: 1 }, { text: "oe-{role}-focus", line: 2 }], known);
  assert.deepEqual([status.names, status.problems.map((problem) => problem.line)], [[], [1, 2]]);
  assert.match(status.problems[0].detail, /「status」 이 코드의 role\(neutral·accent·danger·warning·success·info·brand\)에 없어/);
  assert.deepEqual(expandRoleList([{ text: "브랜드", line: 1 }, { text: "oe-{role}-focus", line: 2 }], known).problems.map((problem) => problem.line), [2]);
});

test("Properties 열거 줄(§3): 값 묶음이 둘 이상이거나 값 묶음 바로 뒤에 이음말 「또는·이나·및·혹은·그리고·과·와·,·/··;」 로 백틱 이름이 이어지면 ? — 뒤 묶음을 버려 ⚠ 를 내거나 = 로 지나가지 않는다", () => {
  // 재현 A(조용한 통과였다): 문서가 코드에 없는 `pill` 을 주장하는데 = 였다 → ?
  const split = expectUnreadable(run(edit(baseFiles(), doc("chip"), "- `shape`: `circle | rounded`, 기본값 `circle`", "- `shape`: `circle | rounded` 또는 `pill`, 기본값 `circle`.")), P.enums, "값 묶음이 둘 이상이라 한 목록으로 읽지 못했다");
  assert.deepEqual([split.drifts, split.unreadable.map((item) => [item.what, item.docAt])], [[], [["chip shape 열거값", `${doc("chip")}:${lineOf(chipDoc, "- `shape`")}`]]]);
  // 재현 B(거짓 ⚠ 였다): 여섯을 모두 적었는데 셋만 읽고 어긋남이라 했다 → ?
  const two = expectUnreadable(run(edit(baseFiles(), doc("chip"), "- `controlSize`: `compact | xsmall | small | regular | large | xlarge`", "- `controlSize`: `compact | xsmall | small` 과 `regular | large | xlarge`")), P.enums, "값 묶음이 둘 이상");
  assert.deepEqual([two.drifts, two.unreadable.map((item) => item.what)], [[], ["chip controlSize 열거값"]], "거짓 어긋남을 내지 않고, 「줄이 없다」 로 겹쳐 내지도 않는다");
  // 한 줄의 prop 이 둘이면 둘 다 ? 다
  assert.deepEqual(expectUnreadable(run(edit(baseFiles(), doc("chip"), "`secondary | tertiary`, 기본값 `secondary`", "`secondary | tertiary`, `primary`")), P.enums, "값 묶음이 둘 이상").unreadable.map((item) => item.what).sort(), ["chip leadingTone 열거값", "chip trailingTone 열거값"]);
  for (const tail of [" 또는 `pill`", "이나 `pill`", " 과 `pill`", "와 `pill`", ", `pill`", " / `pill`", "·`pill`", ", 그리고 `a | b`", " 및 `pill`", " 혹은 `pill`", " 그리고 `pill`", "; `pill`"]) assert.equal(classifyEnumLine(`- \`shape\`: \`circle | rounded\`${tail}, 기본값 \`circle\``).kind, "split", tail);
  // 「및·혹은·그리고·;」 로 이어진 `pill`(코드 ChipShape 에 없다)을 버리고 = 로 지나가지 않는다
  for (const tail of [" 및 `pill`", " 혹은 `pill`", " 그리고 `pill`", "; `pill`"]) {
    const more = expectUnreadable(run(edit(baseFiles(), doc("chip"), "- `shape`: `circle | rounded`, 기본값 `circle`", `- \`shape\`: \`circle | rounded\`${tail}, 기본값 \`circle\`.`)), P.enums, "값 묶음이 둘 이상이라 한 목록으로 읽지 못했다");
    assert.deepEqual([more.drifts, more.unreadable.map((item) => item.what)], [[], ["chip shape 열거값"]], tail);
  }
  // 값 묶음 뒤의 「, 기본값 `circle`」 은 이어지는 이름이 아니다 — 재는 꼴 그대로
  assert.deepEqual(classifyEnumLine("- `shape`: `circle | rounded`, 기본값 `circle`. `circle` 이 기본이다"), { kind: "measured", props: ["shape"], values: ["circle", "rounded"] });
  assert.deepEqual(classifyEnumLine("- `leadingTone`, `trailingTone` (Tone): 각각 `secondary | tertiary`"), { kind: "measured", props: ["leadingTone", "trailingTone"], values: ["secondary", "tertiary"] });
  // prop 백틱 이름이 없거나 값이 콜론 바로 뒤가 아닌 줄은 「재지 않는 것」 쪽(odd), 이름 자리의 `|` 는 열거 줄이 아니다
  assert.equal(classifyEnumLine("- 방향: `incoming | outgoing`").kind, "odd");
  assert.equal(classifyEnumLine("- `onLimitReached`: 범위 경계에 도달할 때 `min | max`를 전달한다").kind, "odd");
  assert.equal(classifyEnumLine("- `align`: `left` | `right`").kind, "odd");
  assert.equal(classifyEnumLine("- `value | defaultValue`: 선택한 Option value"), null);
  assert.equal(classifyEnumLine("일반 문장에 `a | b` 가 있어도 목록 줄이 아니다"), null);
  // Properties 절 안의 「값 묶음 둘 이상」 줄은 compareEnums 가 ? 로 내므로 「재지 않는 것」 에 다시 대지 않고, 표에 없는 컴포넌트의 그 줄은 표에 없다고 댄다
  const splitChip = chipDoc.replace("- `shape`: `circle | rounded`, 기본값 `circle`", "- `shape`: `circle | rounded` 또는 `pill`, 기본값 `circle`");
  assert.deepEqual(unmeasuredEnumLines({ chip: splitChip }), []);
  assert.deepEqual(unmeasuredEnumLines({ tabs: "# Tabs\n\n`packages/ui/src/tabs.tsx`\n\n## Properties\n\n- `variant`: `line | pill` 또는 `ghost`\n" }), [`${doc("tabs")}:7 \`variant\` 열거값 — 코드 쪽 읽는 법이 ENUM_TABLE 에 없어 재지 않는다(개발자가 표에 더한다)`]);
});

test("못 읽는 파일(§5): 목록에는 있는데 읽지 못한 문서(디렉터리로 바뀐 것)는 그 파일을 읽는 짝마다 「? <짝 이름> — 못 읽었다 — <경로>: 파일을 읽지 못했다」(H1·메타줄 짝은 「<key>.md 제목·메타줄」, 열거 짝은 표에 있는 컴포넌트면 「<key> 열거값」) — 조용히 필터하지 않는다", () => {
  // docs/system/studio.md 를 디렉터리로 — docs/system 전체를 읽는 두 짝이 각각 짝 이름으로 낸다
  const studio = `${FILES.systemDocs}/studio.md`;
  const measured = run({ ...baseFiles(), [studio]: null });
  for (const name of [P.alias, P.paths]) {
    const entry = expectUnreadable(measured, name, studio);
    assert.deepEqual(entry.unreadable, [{ what: name, detail: "파일을 읽지 못했다", docAt: studio }]);
    assert.deepEqual(entry.drifts, []);
  }
  assert.ok(formatReport(measured).includes(`? ${P.paths} — 못 읽었다 — ${studio}: 파일을 읽지 못했다`));
  for (const name of PAIRS.filter((candidate) => ![P.alias, P.paths].includes(candidate))) expectSame(measured, name);
  // 읽지 못한 문서의 ⚠ 가 = 로 바뀌지 않는다 — 없는 경로를 적은 뒤 그 파일을 디렉터리로 바꾸면 ⚠ 대신 ? 다
  const badPath = { ...baseFiles(), [studio]: "# Studio\n\n이 경로는 없다: `apps/studio/src/nowhere.tsx`.\n" };
  expectDrift(run(badPath), P.paths, "문서가 적은 경로");
  const dirInstead = run({ ...badPath, [studio]: null });
  assert.deepEqual(pairOf(dirInstead, P.paths).drifts, []);
  expectUnreadable(dirInstead, P.paths, studio);
  // tokens.md 를 디렉터리로 — 그 파일을 직접 읽는 짝은 「파일을 읽지 못했다」
  const tokensDir = run({ ...baseFiles(), [FILES.tokensDoc]: null });
  for (const name of [P.neutral, P.status, P.alpha]) expectUnreadable(tokensDir, name, FILES.tokensDoc);
  // 컴포넌트 문서 — ENUM_TABLE 에 없는 문서(textarea)는 열거 짝이 짝 이름으로, 있는 문서(message-bubble)는 「<key> 열거값」 으로 한 번만 낸다
  const plain = run({ ...baseFiles(), [doc("textarea")]: null });
  assert.deepEqual(pairOf(plain, P.enums).unreadable, [{ what: P.enums, detail: "파일을 읽지 못했다", docAt: doc("textarea") }]);
  const bubble = run({ ...baseFiles(), [doc("message-bubble")]: null });
  assert.deepEqual(pairOf(bubble, P.enums).unreadable.map((item) => [item.what, item.docAt]), [["message-bubble 열거값", doc("message-bubble")]]);
  const chip = run({ ...baseFiles(), [doc("chip")]: null });
  assert.deepEqual(pairOf(chip, P.enums).unreadable.map((item) => [item.what, item.docAt]), [["chip 열거값", doc("chip")]]);
});

test("「참고」 산문 값 주장: 테마 낱말+팔레트 값 문단과 「값이 같다」 문장의 파일:행을 한 줄에 모으고, 펜스 안은 빼며, =·⚠·? 도 요약의 개수도 아니다; 읽지 못한 파일은 줄 끝에 붙인다", () => {
  const measured = run(baseFiles());
  const note = measured.notes.find((entry) => entry.startsWith("손으로 확인할 산문 값 주장 "));
  assert.ok(note, measured.notes.join("\n"));
  // Light/Dark 값 문장(tokens.md·color.md·컴포넌트 문서)과 「값이 같다」 문장이 파일:행으로 나온다
  for (const [file, text, needle] of [[FILES.tokensDoc, tokensDoc, "`subtle`의 현재 매핑은"], [FILES.tokensDoc, tokensDoc, "값이 같지만"], [FILES.tokensDoc, tokensDoc, "Light theme에서"], [FILES.colorDoc, colorDoc, "Light/Dark 모두 `neutral-400`"], [FILES.colorDoc, colorDoc, "Light black 3%"], [doc("bottom-navigation"), navDoc, "Light에서 neutral-950"]]) {
    assert.ok(note.includes(`${file}:${lineOf(text, needle)} 「`), `${file} 「${needle}」 — ${note}`);
  }
  assert.match(note, /^손으로 확인할 산문 값 주장 \d+곳 — /);
  assert.ok(!note.includes("읽지 못한 파일"));
  // 짝이 아니다 — =·⚠·? 를 내지 않고 요약 첫 줄은 「맞는다」 그대로, 「참고:」 아래에 놓인다
  const lines = formatReport(measured).split("\n");
  assert.equal(lines[0], `docs/system 과 코드가 맞는다(${PAIRS.length}개 짝)`);
  assert.ok(!PAIRS.some((name) => /산문 값 주장/.test(name)));
  assert.ok(lines.indexOf(`- ${note}`) > lines.indexOf("참고:") && lines.indexOf(`- ${note}`) < lines.indexOf("재지 않는 것:"));
  // 펜스 안의 같은 문장은 나오지 않는다 — 문장을 지우고 펜스 안에만 두면 그 행이 사라진다
  const sentence = "`subtle`은 `oe-foreground-disabled`와 값이 같지만 합치지 않는다.";
  const fenced = edit(edit(baseFiles(), FILES.tokensDoc, sentence, ""), FILES.tokensDoc, "## Semantic status token", `\`\`\`text\n${sentence}\n\`\`\`\n\n## Semantic status token`);
  const fencedNote = run(fenced).notes.find((entry) => entry.startsWith("손으로 확인할 산문 값 주장 "));
  assert.ok(!fencedNote.includes(`${FILES.tokensDoc}:${lineOf(fenced[FILES.tokensDoc], sentence)} 「`), fencedNote);
  assert.ok(fencedNote.includes(`${FILES.tokensDoc}:${lineOf(fenced[FILES.tokensDoc], "`subtle`의 현재 매핑은")} 「`), "펜스 밖의 다른 주장은 그대로 나온다");
  // 값 주장이 하나도 없으면 「없음」
  assert.equal(proseValueNote({ "docs/system/x.md": "# X\n\n값을 정한다.\n" }), "손으로 확인할 산문 값 주장 0곳 — 없음");
  assert.equal(proseValueNote({ "docs/system/x.md": "# X\n\n`a`는 Light `neutral-400`, Dark `neutral-600`이다.\n" }, ["docs/system/y.md"]), "손으로 확인할 산문 값 주장 1곳 — docs/system/x.md:3 「`a`는 Light `neutral-400`, Dark `neutral-600`이다.」 (읽지 못한 파일: docs/system/y.md)");
  // 파일을 디렉터리로 바꾸면 줄 끝에 「(읽지 못한 파일: …)」 — 나머지 주장은 그대로 낸다
  const studio = `${FILES.systemDocs}/studio.md`;
  const dirNote = run({ ...baseFiles(), [studio]: null }).notes.find((entry) => entry.startsWith("손으로 확인할 산문 값 주장 "));
  assert.ok(dirNote.endsWith(`(읽지 못한 파일: ${studio})`), dirNote);
  assert.ok(dirNote.includes(`${FILES.tokensDoc}:${lineOf(tokensDoc, "값이 같지만")} 「`));
});

test("「참고」 는 재는 자리가 아니라 훑을 자리라 넓게 잡는다 — 「같은 값」(switch.md:48 꼴)과 「값이 다르다」 도 파일:행으로 낸다", () => {
  const note = run(baseFiles()).notes.find((entry) => entry.startsWith("손으로 확인할 산문 값 주장 "));
  assert.ok(note.includes(`${doc("switch")}:${lineOf(switchDoc, "같은 값이며")} 「`), note);
  const claims = (md) => proseValueClaims({ "docs/system/x.md": md }).map(({ line }) => line);
  assert.deepEqual(claims("# X\n\n`a`와 `b`는 같은 값이다.\n"), [3]);
  assert.deepEqual(claims("# X\n\n`a`는 `b`와 값이 다르다.\n"), [3]);
  assert.deepEqual(claims("# X\n\n좌우 여백은 Button과 같은 값을 쓴다.\n\n색은 tone 마다 동일한 값이다.\n"), [3, 5]);
  assert.deepEqual(claims("# X\n\n값을 정한다. 같은 자리에 둔다.\n"), [], "「같은」 만으로는 후보가 아니다");
  assert.equal(proseValueNote({ "docs/system/x.md": "# X\n\n`a`와 `b`는 같은 값이다.\n" }), "손으로 확인할 산문 값 주장 1곳 — docs/system/x.md:3 「`a`와 `b`는 같은 값이다.」");
});

test("`color` 줄은 「값은 …」 문장의 백틱 이름만 읽는다 — 다른 문장의 `className`·`variant` 는 색 이름이 아니고, 「값은」 문장이 없으면 못 읽음", () => {
  const button = (text) => compareColorList(buttonSrc, "BUTTON_COLORS", text, ui("button"), doc("button"));
  const toggle = (text) => compareColorList(toggleSrc, "TOGGLE_BUTTON_COLORS", text, ui("toggle-button"), doc("toggle-button"));
  none(button(buttonDoc.replace("타입에서 걸린다.", "타입에서 걸린다. `className`으로 덧칠하지 않는다.")), "`className`");
  none(button(buttonDoc.replace("타입에서 걸린다.", "타입에서 걸리고, `variant`와는 무관하다.")), "`variant`");
  none(toggle(toggleDoc.replace("타입에서 걸린다.", "타입에서 걸리며 `variant`에 따라 켜진 모습이 다르다.")), "toggle `variant`");
  assert.deepEqual(button(buttonDoc.replace("현재 값은 `excel` 하나다", "현재 값은 `excel`, `word` 둘이다")).drifts.map((entry) => entry.what), ["BUTTON_COLORS", "BUTTON_COLORS 개수"]);
  const clauseless = button(buttonDoc.replace("현재 값은 `excel` 하나다.", "`excel` 을 받는다."));
  assert.deepEqual([clauseless.drifts, clauseless.unreadable.map((item) => item.detail)], [[], ["「- `color`」 줄의 「값은 `a`과 `b`다」 문장"]]);
  const empty = button(buttonDoc.replace("현재 값은 `excel` 하나다.", "현재 값은 하나다."));
  assert.deepEqual(empty.drifts, []);
  assert.equal(empty.unreadable.length, 1);
  expectSame(run(edit(baseFiles(), doc("button"), "타입에서 걸린다.", "타입에서 걸린다. `className`으로 덧칠하지 않는다.")), P.button);
});

test("코드 유니온에 문자열·숫자가 아닌 멤버가 섞이거나 boolean 이 넓어지면 값 집합을 확정할 수 없으므로 ? — 문자열만 모아 = 로 지나가지 않는다", () => {
  const widened = expectUnreadable(run(edit(baseFiles(), ui("badge"), 'export type BadgeSize = "small" | "medium"', 'export type BadgeSize = "small" | "medium" | (string & {})')), P.enums, "type BadgeSize");
  assert.deepEqual([widened.drifts, widened.unreadable.map((item) => item.what)], [[], ["badge size 열거값"]]);
  const alias = expectUnreadable(run(edit(baseFiles(), ui("radio"), '  layout?: "hug" | "fill"', '  layout?: "hug" | "fill" | LayoutName')), P.enums, "`layout?: \"a\" | \"b\"`");
  assert.deepEqual([alias.drifts, alias.unreadable.map((item) => item.what)], [[], ["radio layout 열거값"]]);
  const auto = expectUnreadable(run(edit(baseFiles(), ui("app-header"), "  sticky?: boolean", '  sticky?: boolean | "auto"')), P.enums, "`sticky?: boolean`");
  assert.deepEqual([auto.drifts, auto.unreadable.map((item) => item.what)], [[], ["app-header sticky 열거값"]]);
  assert.equal(parseTypeUnion('type A = "a" | "b" | (string & {})\n', "A"), null);
  assert.equal(parseTypeUnion("type A = Other\n", "A"), null);
  assert.deepEqual(parseTypeUnion("type A = 99 | 999\n", "A").values, ["99", "999"]);
  assert.equal(parseInlineUnion('x?: "a" | Name\n', "x"), null);
  assert.equal(parseBooleanProp('x?: boolean | "auto"\n', "x"), null);
  assert.equal(parseBooleanProp("x?: boolean\n", "x").values.join(), "false,true");
});

test("코드 줄바꿈·따옴표 꼴이 바뀌어도 값을 모두 읽는다 — prettier 꼴 유니온과 따옴표 cva 키는 = 이고, 못 읽은 꼴은 ? 다(거짓 ⚠ 가 아니다)", () => {
  expectSame(run(edit(baseFiles(), ui("badge"), 'export type BadgeVariant = "fill" | "tonal" | "outlined"', 'export type BadgeVariant =\n  | "fill"\n  | "tonal"\n  | "outlined"')), P.enums);
  expectSame(run(edit(baseFiles(), ui("badge"), 'export type BadgeVariant = "fill" | "tonal" | "outlined"', 'export type BadgeVariant = "fill" |\n  "tonal" | "outlined"')), P.enums);
  expectSame(run(edit(baseFiles(), ui("badge"), 'export type BadgeVariant = "fill" | "tonal" | "outlined"', 'export type BadgeVariant = "fill" | "tonal" | "outlined"; // Style')), P.enums);
  const quoted = run(edit(baseFiles(), ui("input"), 'outline: "border-oe-border-secondary bg-oe-background-primary",', '"outline": "border-oe-border-secondary bg-oe-background-primary",'));
  expectSame(quoted, P.enums);
  expectSame(run(edit(baseFiles(), ui("switch"), 'labelPosition?: "left" | "right"', 'labelPosition?:\n    | "left"\n    | "right"')), P.enums);
  assert.deepEqual(parseTypeUnion('export type V =\n  | "a"\n  | "b"\n\nexport type W = "c"\n', "V").values, ["a", "b"]);
  assert.deepEqual(parseTypeUnion('type V = "a" |\n  "b"\ntype W = "c"\n', "V").values, ["a", "b"]);
  assert.deepEqual(parseCvaVariantKeys('const v = cva("x", { variants: { variant: {\n        "outline": "a",\n        filled:\n          "b",\n      } } })', "v", "variant").values, ["outline", "filled"]);
  assert.equal(parseCvaVariantKeys('const v = cva("x", { variants: { variant: {\n        [key]: "a",\n      } } })', "v", "variant"), null, "계산된 키는 목록을 확정할 수 없다");
});

test("Badge 색 단계 표(Light/Dark) ↔ toneClass: 칸·코드가 다르면 어긋남, 행 라벨·칸·머리 행·절이 꼴에 안 맞으면 그 자리를 가리켜 못 읽음", () => {
  expectSame(run(baseFiles()), P.badgeTone);
  expectDrift(run(edit(baseFiles(), doc("badge"), "| `fill` 배경 | 600 | 600 |", "| `fill` 배경 | 700 | 600 |")), P.badgeTone, "Badge fill 배경 Light");
  expectDrift(run(edit(baseFiles(), doc("badge"), "| `tonal` 배경 | 100 | 300 의 20% 알파 |", "| `tonal` 배경 | 100 | 300 의 30% 알파 |")), P.badgeTone, "Badge tonal 배경 Dark");
  expectDrift(run(edit(baseFiles(), ui("badge"), "dark:text-${color(300)}", "dark:text-${color(200)}")), P.badgeTone, "Badge outlined 글자 Dark");
  expectDrift(run(edit(baseFiles(), doc("badge"), "| `outlined` 글자 | 800 | 300 |\n", "")), P.badgeTone, "Badge outlined 글자");
  expectDrift(run(edit(baseFiles(), doc("badge"), "| `outlined` 글자 | 800 | 300 |", "| `outlined` 글자 | 800 | 300 |\n| `outlined` 배경 | 50 | 950 |")), P.badgeTone, "Badge outlined 배경");
  const label = expectUnreadable(run(edit(baseFiles(), doc("badge"), "| `fill` 배경 | 600 | 600 |", "| fill 배경 | 600 | 600 |")), P.badgeTone, "행 「| fill 배경 | 600 | 600 |」");
  assert.deepEqual(label.drifts, [], "읽지 못한 행은 어긋남으로 세지 않는다");
  const cell = expectUnreadable(run(edit(baseFiles(), doc("badge"), "| `tonal` 배경 | 100 | 300 의 20% 알파 |", "| `tonal` 배경 | 100 | 300/20 |")), P.badgeTone, "칸 「300/20」");
  assert.deepEqual(cell.drifts, []);
  expectUnreadable(run(edit(baseFiles(), doc("badge"), "| 자리 | Light | Dark |", "| 자리 | 라이트 | 다크 |")), P.badgeTone, "머리 행");
  expectUnreadable(run(edit(baseFiles(), doc("badge"), "## 색\n", "## 색상\n")), P.badgeTone, "「## 색」 절");
  expectUnreadable(run(edit(baseFiles(), ui("badge"), "function toneClass(", "function toneClasses(")), P.badgeTone, ui("badge"));
  assert.deepEqual(parseBadgeToneClass(badgeSrc).entries.map(({ variant, prop }) => `${variant} ${prop}`), ["fill bg", "fill text", "outlined border", "outlined text", "tonal bg", "tonal text"]);
  assert.equal(parseBadgeToneClass(badgeSrc.replace("return `bg-${color(600)} text-white`", "return `bg-${color(600)} ring-1 text-white`")), null, "모르는 조각이 있으면 못 읽음");
  none(compareBadgeToneTable(badgeSrc, badgeDoc.replace("| `fill` 글자 | `white` | `white` |", "|  `fill` 글자  |  white  |  `white`  |")), "백틱·여백");
});

// --- 6회차 반박(Q1~Q10) — 문제마다 고정 fixture 하나. 오늘 저장소의 어긋남은 단정하지 않는다 ------------------------------

const toolingDoc = fileURLToPath(new URL("../../docs/process/tooling.md", import.meta.url));

test("Q1 걷어낸 짝의 이름은 남기지 않는다 — 까닭은 NOT_MEASURED·머리 주석·tooling.md 모두 「산문의 색 값 주장」 으로만 적고, 걷어낸 짝을 「↔」 이름으로 적은 줄이 없다", () => {
  const prose = NOT_MEASURED.find((entry) => entry.startsWith("산문의 색 값 주장"));
  assert.ok(prose, NOT_MEASURED.join("\n"));
  assert.ok(!prose.includes("↔"), prose);
  const removed = "걷어낸";
  const arrow = "↔";
  for (const [label, text] of [["도구", readFileSync(script, "utf8")], ["tooling.md", readFileSync(toolingDoc, "utf8")]]) {
    assert.ok(text.includes("산문의 색 값 주장"), `${label}: 까닭을 「산문의 색 값 주장」 으로 적는다`);
    const leftover = text.split("\n").filter((line) => line.includes(removed) && line.includes(arrow));
    assert.deepEqual(leftover, [], `${label}: 걷어낸 짝을 이름으로 적은 줄이 남아 있다`);
  }
});

test("Q2 semantic() 호출은 있는데 neutral family 가 하나도 없으면 「? CORE_SEMANTIC_TOKENS — 못 읽었다 — index.ts: neutral family 의 semantic(…) 호출」 — 도구 오류가 아니다", () => {
  const files = baseFiles();
  files[FILES.tokens] = files[FILES.tokens].replaceAll('semantic("neutral", ', 'semantic("accent", ');
  const entry = expectUnreadable(run(files), P.neutral, "neutral family 의 semantic(…) 호출");
  assert.deepEqual(entry.drifts, []);
  assert.deepEqual(entry.unreadable.map((item) => [item.what, item.docAt]), [["CORE_SEMANTIC_TOKENS", FILES.tokens]]);
  assert.ok(!entry.unreadable.some((item) => item.detail.includes("도구 오류")), "TypeError 로 떨어지지 않는다");
  const single = compareNeutralList('const t = [semantic("accent", "oe-accent-x", "red-500", "red-300")];\n', tokensDoc);
  assert.deepEqual(single.unreadable.map((item) => item.detail), ["neutral family 의 semantic(…) 호출"]);
});

test("Q3 「참고」 는 대문자 White·Black, brand-alpha-NN, 「Light 100 / Dark 800」 맨 단계 숫자 표 셀도 후보로 잡는다 — 테마 낱말 없는 표 행과 「Light 16px」 는 아니다", () => {
  const md = [
    "# X",
    "",
    "이미지 외곽 구조선은 Light에서 Black 10%, Dark에서 White 16% alpha를 사용해 경계를 유지한다.",
    "",
    "| Style | 배경 | 글자 |",
    "| --- | --- | --- |",
    "| Fill | 600 | white |",
    "| Tonal | Light 100 / Dark 800 | Light 800 / Dark 200 |",
    "",
    "선택한 항목에는 2px `brand-alpha-40` ring을 Light 배경에 표시한다.",
    "",
    "Light 화면의 아이콘은 16px 이고 Dark 2-grid 로 놓는다.",
    "",
    "| 자리 | Light | Dark |",
    "| --- | --- | --- |",
    "| `fill` 배경 | 600 | 300 의 20% 알파 |",
    "",
  ].join("\n");
  assert.deepEqual(proseValueClaims({ "docs/system/x.md": md }).map(({ line }) => line), [3, 8, 10]);
  // 「재지 않는 것」 의 까닭 줄은 잡는 범위와 못 잡는 꼴을 함께 적는다
  const prose = NOT_MEASURED.find((entry) => entry.startsWith("산문의 색 값 주장"));
  for (const needle of ["대소문자 무시", "brand-alpha-NN", "Light 100 / Dark 800", "다른 말이 끼"]) assert.ok(prose.includes(needle), `NOT_MEASURED 에 「${needle}」 이 있어야 한다: ${prose}`);
});

test("Q4 tokens.md 펜스 줄이 깨지면 그 줄이 축약으로 말한 나머지 이름(「, secondary」·「-*」)도 ⚠ 에 붙지 않는다 — ? 하나만(expandRoleList 와 같은 꼴)", () => {
  const comma = expectUnreadable(run(edit(baseFiles(), FILES.tokensDoc, "oe-border-primary\noe-border-bold-primary\noe-border-secondary\n", "oe-border-primary, secondary\noe-border-bold-primary\n")), P.neutral, "펜스 줄 「oe-border-primary, secondary」");
  assert.deepEqual([comma.drifts, comma.unreadable.length], [[], 1], "oe-border-secondary 를 「문서 목록에 없는 코드 이름」 으로 세지 않는다");
  const star = expectUnreadable(run(edit(baseFiles(), FILES.tokensDoc, "oe-danger-border-primary\noe-danger-border-secondary\n", "oe-danger-border-*\n")), P.status, "펜스 줄 「oe-danger-border-*」");
  assert.deepEqual([star.drifts, star.unreadable.length], [[], 1], "oe-danger-border-primary·secondary 를 ⚠ 에 붙이지 않는다");
  // 깨진 줄과 무관한 이름은 그대로 ⚠ 다 — 못 읽음이 어긋남을 통째로 가리지 않는다
  const both = run(edit(edit(baseFiles(), FILES.tokensDoc, "oe-border-primary\noe-border-bold-primary\noe-border-secondary\n", "oe-border-primary, secondary\noe-border-bold-primary\n"), FILES.tokensDoc, "oe-border-visual\n", ""));
  const drift = expectDrift(both, P.neutral, "문서 목록에 없는 코드 이름");
  assert.ok(drift.drifts.every((item) => item.code.includes("oe-border-visual") && !item.code.includes("oe-border-secondary")), drift.drifts.map((item) => item.code).join(" / "));
});

test("Q5 별칭 클래스: 「--<접두>-oe-<이름>:」 정확한 꼴만 선언으로 센다 — `--text-oe-label--line-height:` 변형 접미만 남으면 ⚠ 이고 조용히 = 로 지나가지 않는다", () => {
  expectSame(run(baseFiles()), P.alias);
  const gone = expectDrift(run(edit(baseFiles(), FILES.tokensCss, "  --text-oe-label: 0.8125rem;\n", "")), P.alias, "별칭 클래스 text-oe-label");
  assert.deepEqual(gone.drifts.map((item) => [item.code, item.docAt]), [["--*-oe-label 선언 없음", `${doc("chip")}:${lineOf(chipDoc, "`text-oe-label`")}`]]);
  // 여백이 있는 선언(`--text-oe-label : 0.8rem`)은 여전히 선언이다
  expectSame(run(edit(baseFiles(), FILES.tokensCss, "  --text-oe-label: 0.8125rem;\n", "  --text-oe-label : 0.8125rem;\n")), P.alias);
});

test("Q6 alpha 단계는 이름 문자열(두 자리)로 비교한다 — 펜스의 `brand-alpha-5` 는 꼴 밖이라 ?, 문장의 `5` 는 `05` 와 다른 이름이라 ⚠(숫자 5 로 읽어 = 로 지나가지 않는다)", () => {
  expectSame(run(baseFiles()), P.alpha);
  const fence = expectUnreadable(run(edit(baseFiles(), FILES.colorDoc, "brand-alpha-05\n", "brand-alpha-5\n")), P.alpha, "펜스 줄 「brand-alpha-5」");
  assert.deepEqual([fence.drifts, fence.unreadable.length], [[], 1]);
  const sentence = expectDrift(run(edit(baseFiles(), FILES.tokensDoc, "`05, 08, 10,", "`5, 08, 10,")), P.alpha, "brand alpha 단계");
  assert.deepEqual(sentence.drifts.map((item) => [item.code, item.doc]), [["05, 08, 10, 16, 20, 30, 40, 50, 60, 70, 80, 90", "5, 08, 10, 16, 20, 30, 40, 50, 60, 70, 80, 90"]]);
});

test("Q7 color.md 「제안하는 최소 역할」 펜스도 대소문자를 가리지 않는다 — 「OE-…」 줄은 라벨 줄이 아니라 ? 하나이고, 그 줄이 말하던 이름은 참고의 「코드에만 있는 이름」 에 다시 세지 않는다", () => {
  const known = new Set(["neutral", "accent", "danger", "warning", "success", "info", "brand"]);
  const base = pairOf(run(baseFiles()), P.proposed);
  const countOf = (entry) => Number(entry.notes.find((note) => note.includes("제안하는 최소 역할"))?.match(/없는 코드 이름 (\d+)개/)?.[1] ?? 0);
  assert.ok(countOf(base) > 0, base.notes.join("\n"));
  // A: 대문자 이름 줄 — ? 하나, 참고의 개수는 그대로
  const upper = "OE-foreground-primary / secondary / tertiary / disabled / inverse";
  const a = expectUnreadable(run(edit(baseFiles(), FILES.colorDoc, "oe-foreground-primary / secondary / tertiary / disabled / inverse\n", `${upper}\n`)), P.proposed, `펜스 줄 「${upper}」`);
  assert.deepEqual([a.drifts, a.unreadable.length], [[], 1]);
  assert.equal(countOf(a), countOf(base), "그 줄이 말하던 oe-foreground-* 를 다시 세지 않는다");
  // B: 대문자 {role} 줄 — 라벨 줄로 읽혀 roles 를 비우지 않으므로 뒤의 {role} 줄들은 그대로 펼쳐지고 ? 는 하나다
  const upperRole = "OE-{role}-foreground-primary / secondary";
  const b = expectUnreadable(run(edit(baseFiles(), FILES.colorDoc, "oe-{role}-foreground-primary / secondary\n", `${upperRole}\n`)), P.proposed, `펜스 줄 「${upperRole}」`);
  assert.deepEqual([b.drifts, b.unreadable.length], [[], 1]);
  assert.equal(countOf(b), countOf(base));
  assert.deepEqual(expandRoleList([{ text: "Brand 및 danger", line: 1 }, { text: upperRole, line: 2 }, { text: "oe-{role}-border-primary", line: 3 }], known), {
    names: ["oe-brand-border-primary", "oe-danger-border-primary"],
    problems: [{ text: upperRole, line: 2, detail: `펜스 줄 「${upperRole}」 이 「oe-이름( / 접미)*」 꼴에 맞지 않는다` }],
    partial: new Set(["oe-brand-foreground-primary", "oe-brand-foreground-secondary", "oe-danger-foreground-primary", "oe-danger-foreground-secondary"]),
  });
});

test("Q8 시험 파일의 최상위 도우미(`const 이름 =`)는 모두 어디선가 부른다 — 아무도 부르지 않는 도우미는 두지 않는다(export 이름은 도구의 exportNameOf 가 만든다)", () => {
  const source = readFileSync(fileURLToPath(import.meta.url), "utf8");
  // 템플릿 문자열 안의 fixture 코드(`const checkboxVariants = cva(`)는 도우미가 아니다 — 앞의 (이스케이프 안 된) 백틱이 홀수면 템플릿 안이다
  const inTemplate = (index) => (source.slice(0, index).match(/(?<!\\)`/g) ?? []).length % 2 === 1;
  const helpers = [...source.matchAll(/^const (\w+) = /gm)].filter((hit) => !inTemplate(hit.index)).map((hit) => hit[1]);
  assert.ok(helpers.length > 10, "최상위 도우미를 읽었다");
  assert.ok(!helpers.includes("checkboxVariants") && helpers.includes("lineOf"), helpers.join(", "));
  const unused = helpers.filter((name) => (source.match(new RegExp(`\\b${name}\\b`, "g")) ?? []).length < 2);
  assert.deepEqual(unused, [], "정의만 있고 부르는 곳이 없는 도우미");
  assert.ok(readFileSync(script, "utf8").includes("export const exportNameOf"));
});

test("Q9 NOT_MEASURED 의 산문 자리 열거는 「값은 `a`과 `b`다」 꼴을 재는 짝(BUTTON_COLORS·TOGGLE_BUTTON_COLORS)을 모두 댄다 — 짝 목록에 있는 상수 이름이 열거에서 빠지지 않는다", () => {
  const prose = NOT_MEASURED.find((entry) => entry.startsWith("산문의 색 값 주장"));
  const listed = prose.match(/산문 자리\(([^)]*)\)/)[1].split("·");
  for (const constant of ["BADGE_COLORS", "BUTTON_COLORS", "TOGGLE_BUTTON_COLORS", "BOTTOM_NAVIGATION_MAX_ITEMS"]) {
    assert.ok(PAIRS.some((name) => name.startsWith(constant)), `${constant} 짝이 있다`);
    assert.ok(listed.includes(constant), `열거에 ${constant} 가 있어야 한다: ${listed.join("·")}`);
  }
});

test("Q10 「참고」 는 문단 단위라 행은 문단(표 행 포함)의 첫 행이다 — 여러 줄 문단의 셋째 줄 주장도 첫 행으로, 테마 낱말과 팔레트 값이 다른 문장에 있어도 한 문단이면 후보다; NOT_MEASURED 와 tooling.md 도 그렇게 적는다", () => {
  const claims = (md) => proseValueClaims({ "docs/system/x.md": md }).map(({ line, text }) => [line, text]);
  assert.deepEqual(claims("# X\n\n첫 줄이다.\n둘째 줄이다.\n`a`는 `b`와 값이 같다.\n"), [[3, "첫 줄이다. 둘째 줄이다. `a`는 `b`와 값이 같다."]]);
  assert.deepEqual(claims("# X\n\nLight 에서 쓴다. 두 번째 문장. 값은 `neutral-400` 이다.\n").map(([line]) => line), [3]);
  assert.deepEqual(claims("# X\n\n| 자리 | 값 |\n| --- | --- |\n| 글자 | Light `neutral-950`, Dark `neutral-50` |\n").map(([line]) => line), [5], "표 행은 그 행이 한 문단이다");
  const prose = NOT_MEASURED.find((entry) => entry.startsWith("산문의 색 값 주장"));
  assert.ok(prose.includes("문단(표 행 포함)의 첫 행"), prose);
  assert.ok(readFileSync(toolingDoc, "utf8").includes("문단(표 행 포함)의 첫 행"), "tooling.md 도 「문단(표 행 포함)의 첫 행」 으로 적는다");
});

// --- 7회차 반박(R1~R7) — 문제마다 고정 fixture 하나. 오늘 저장소의 어긋남은 단정하지 않는다 ------------------------------

test("R1 깨진 펜스 줄이 말하는 이름은 정확히 그 이름만 뺀다 — 「oe-foreground-inverse (역상)」 은 다음 줄의 oe-foreground-inverse-secondary 를 빼지 않고, 「oe-*」 처럼 `*`·`-` 로 끝난 줄만 접두로 넓혀 양쪽에서 뺀다(거짓 ⚠ 없음)", () => {
  // A: 앞 이름이 접두가 아니다 — 접두로 넓히면 코드 쪽 oe-foreground-inverse-secondary 가 빠져 문서의 같은 이름이 「코드에 없는 이름」 이 됐다
  const paren = expectUnreadable(run(edit(baseFiles(), FILES.tokensDoc, "oe-foreground-inverse\noe-foreground-inverse-secondary\n", "oe-foreground-inverse (역상)\noe-foreground-inverse-secondary\n")), P.neutral, "펜스 줄 「oe-foreground-inverse (역상)」");
  assert.deepEqual([paren.drifts, paren.unreadable.length], [[], 1], "oe-foreground-inverse-secondary 를 「코드에 없는 이름」 으로 내지 않는다");
  // B: 괄호 덧말(「(state layer)」)은 이름이 아니다 — oe-interaction-hover-subtle 은 그대로 잰다
  const layer = expectUnreadable(run(edit(baseFiles(), FILES.tokensDoc, "oe-interaction-hover-subtle\noe-interaction-hover\n", "oe-interaction-hover-subtle\noe-interaction-hover (state layer)\n")), P.neutral, "펜스 줄 「oe-interaction-hover (state layer)」");
  assert.deepEqual([layer.drifts, layer.unreadable.length], [[], 1]);
  // C: 「oe-*」 — 접두를 스스로 말한 줄. 코드 쪽에서만 빼면 문서의 모든 이름이 「코드에 없는 이름」 이 된다 — 양쪽에서 빼므로 ? 하나뿐이다
  const star = expectUnreadable(run(edit(baseFiles(), FILES.tokensDoc, "oe-border-primary\noe-border-bold-primary\noe-border-secondary\n", "oe-*\n")), P.neutral, "펜스 줄 「oe-*」");
  assert.deepEqual([star.drifts, star.unreadable.length], [[], 1]);
  // D: 접두 줄이 있어도 그 접두 밖의 어긋남은 그대로 ⚠ — 못 읽음이 어긋남을 통째로 가리지 않는다
  const both = run(edit(edit(baseFiles(), FILES.tokensDoc, "oe-danger-border-primary\noe-danger-border-secondary\n", "oe-danger-border-*\n"), FILES.tokensDoc, "oe-danger-background-bold-primary\n", ""));
  const drift = expectDrift(both, P.status, "문서 목록에 없는 코드 이름");
  assert.deepEqual(drift.drifts.map((item) => item.code), ["oe-danger-background-bold-primary"]);
  // E: 깨진 줄의 정확한 이름을 문서가 다음 줄에 제대로 적어도 ⚠ 가 아니다 — 양쪽에서 빼기 때문이다
  const twice = expectUnreadable(run(edit(baseFiles(), FILES.tokensDoc, "oe-border-visual\n", "oe-border-visual (임시)\noe-border-visual\n")), P.neutral, "펜스 줄 「oe-border-visual (임시)」");
  assert.deepEqual([twice.drifts, twice.unreadable.length], [[], 1]);
});

test("R2 head 에 `-` 가 없는 줄이 깨지면(「success / info」「danger, warning」) 나머지 낱말도 그대로 빼 ? 하나로 끝난다 — info·warning 이 「문서 목록에 없는 코드 이름」 ⚠ 에 붙지 않는다", () => {
  for (const [from, to] of [
    ["success\ninfo\n", "success / info\n"],
    ["danger\nwarning\n", "danger, warning\n"],
  ]) {
    const entry = expectUnreadable(run(edit(baseFiles(), FILES.tokensDoc, from, to)), P.status, `펜스 줄 「${to.trim()}」`);
    assert.deepEqual([entry.drifts, entry.unreadable.length], [[], 1], to.trim());
  }
  // 깨진 줄과 무관한 role 이 빠지면 그대로 ⚠ 다
  const gone = expectDrift(run(edit(edit(baseFiles(), FILES.tokensDoc, "success\ninfo\n", "success / info\n"), FILES.tokensDoc, "danger\nwarning\n", "danger\n")), P.status, "status role — 문서 목록에 없는 코드 이름");
  assert.deepEqual(gone.drifts.map((item) => item.code), ["warning"]);
});

test("R3 별칭 선언은 `@theme { … }` 블록 안만 센다 — 같은 `--text-oe-label:` 을 `:root` 로 옮기면 Tailwind v4 가 클래스를 만들지 않으므로 ⚠ 이고 = 로 조용히 지나가지 않는다; 블록이 없으면 ?", () => {
  const moved = edit(edit(baseFiles(), FILES.tokensCss, "  --text-oe-label: 0.8125rem;\n", ""), FILES.tokensCss, ":root {\n", ":root {\n  --text-oe-label: 0.8125rem;\n");
  const gone = expectDrift(run(moved), P.alias, "별칭 클래스 text-oe-label");
  assert.deepEqual(gone.drifts.map((item) => item.code), ["--*-oe-label 선언 없음"]);
  const rootOnly = expectUnreadable(run({ ...baseFiles(), [FILES.tokensCss]: ":root {\n  --color-oe-foreground-tertiary: var(--oe-foreground-tertiary);\n}\n" }), P.alias, "@theme");
  assert.deepEqual(rootOnly.drifts, []);
  assert.deepEqual(themeBlocksOf("a{}\n@theme inline {\n  --x: 1;\n  @keyframes k { from { a: 1 } }\n}\n@theme { --y: 2; }\n@theme static {\n --z: 3;"), ["\n  --x: 1;\n  @keyframes k { from { a: 1 } }\n", " --y: 2; ", "\n --z: 3;"], "중괄호 깊이로 블록 끝을 찾고, 닫히지 않은 블록은 끝까지다");
  assert.deepEqual(themeBlocksOf(":root { --color-oe-x: red; }"), []);
});

test("R4 문서에만 있는 이름이 코드 전체에는 있는 다른 family 의 이름이면 「코드에 없는 이름 — 코드 없음」 이 아니라 「다른 family 의 이름」 으로 낸다 — Neutral 펜스의 oe-accent-…, danger 예시의 oe-warning-… ; 코드 어디에도 없는 이름은 그대로 「코드에 없는 이름」", () => {
  const neutral = expectDrift(run(edit(baseFiles(), FILES.tokensDoc, "oe-focus-ring\n", "oe-focus-ring\noe-accent-background-bold-primary\n")), P.neutral, "다른 family 의 이름");
  assert.deepEqual(neutral.drifts.map((item) => [item.what, item.code, item.doc]), [["tokens.md Neutral 목록 — 다른 family 의 이름", "oe-accent-background-bold-primary(accent family)", "oe-accent-background-bold-primary"]]);
  const status = expectDrift(run(edit(baseFiles(), FILES.tokensDoc, "oe-danger-border-secondary\n", "oe-danger-border-secondary\noe-warning-border-secondary\n")), P.status, "status 예시(danger) — 다른 family 의 이름");
  assert.deepEqual(status.drifts.map((item) => item.code), ["oe-warning-border-secondary(warning family)"]);
  assert.ok(!status.drifts.some((item) => item.what.includes("코드에 없는 이름")), status.drifts.map((item) => item.what).join(" / "));
  const ghost = expectDrift(run(edit(baseFiles(), FILES.tokensDoc, "oe-focus-ring\n", "oe-focus-ring\noe-border-ghost\n")), P.neutral, "코드에 없는 이름");
  assert.deepEqual(ghost.drifts.map((item) => [item.code, item.doc]), [["없음", "oe-border-ghost"]]);
});

test("R5 「재지 않는 것」 의 후보 범위 문구는 정규식대로다 — 「값·색·매핑이 같다·동일하다·일치한다·다르다」「동일한 값」「두 테마」 를 NOT_MEASURED 와 tooling.md 가 함께 적고, 정규식도 실제로 그 꼴을 잡는다", () => {
  const prose = NOT_MEASURED.find((entry) => entry.startsWith("산문의 색 값 주장"));
  const tooling = readFileSync(toolingDoc, "utf8");
  for (const needle of ["값·색·매핑이 같다·동일하다·일치한다·다르다", "「같은 값」「동일한 값」", "두 테마"]) {
    assert.ok(prose.includes(needle), `NOT_MEASURED 에 「${needle}」 이 있어야 한다: ${prose}`);
    assert.ok(tooling.includes(needle), `tooling.md 에 「${needle}」 이 있어야 한다`);
  }
  const claims = (md) => proseValueClaims({ "docs/system/x.md": md }).map(({ line }) => line);
  assert.deepEqual(claims("# X\n\n색이 `danger` 와 같다.\n\n매핑은 `a` 와 일치한다.\n\n`a`와 `b`는 동일한 값이다.\n\n두 테마에서 `neutral-400` 이다.\n\n값이 크다.\n"), [3, 5, 7, 9]);
});

test("R6 tokens.md alpha 문장은 「## Brand primitive」 절 안에서만 읽는다 — 다른 절의 같은 꼴 문장은 읽지 않고(=), 절이 없으면 절을 못 읽었다는 ?, 절 안에 문장이 없으면 절 행을 가리킨 ?, 문장이 다르면 ⚠ 의 행은 그 문장의 행", () => {
  expectSame(run(edit(baseFiles(), FILES.tokensDoc, "## Neutral semantic token", "다음 값만 생성한다: `05, 08, 10`. 이 문장은 다른 절에 있다.\n\n## Neutral semantic token")), P.alpha);
  const noSection = expectUnreadable(run(edit(baseFiles(), FILES.tokensDoc, "## Brand primitive", "## Brand")), P.alpha, "「## Brand primitive」 절");
  assert.deepEqual(noSection.drifts, []);
  const files = edit(baseFiles(), FILES.tokensDoc, "다음 값만 생성한다:", "다음 값을 만든다:");
  const noSentence = expectUnreadable(run(files), P.alpha, "「## Brand primitive」 절의");
  assert.deepEqual(noSentence.unreadable.map((item) => item.docAt), [`${FILES.tokensDoc}:${lineOf(files[FILES.tokensDoc], "## Brand primitive")}`]);
  const changed = edit(baseFiles(), FILES.tokensDoc, "`05, 08, 10, 16,", "`05, 08, 10, 15,");
  assert.deepEqual(expectDrift(run(changed), P.alpha, "brand alpha 단계").drifts.map((item) => item.docAt), [`${FILES.tokensDoc}:${lineOf(changed[FILES.tokensDoc], "다음 값만 생성한다")}`]);
});

test("R7 tooling.md 의 Checkbox 산문 자리 열거는 도구가 재는 문장 꼴을 모두 댄다 — expectPx 의 「…」 문장 이름마다 tooling.md 에 같은 「…」 이 있다(「Checkbox의 Npx 비상호작용」 이 빠지지 않는다)", () => {
  const shapes = [...readFileSync(script, "utf8").matchAll(/checkboxFiles\.doc,[^\n]*?"(「[^」]+」) 문장"/g)].map((hit) => hit[1]);
  assert.ok(shapes.includes("「Checkbox의 Npx 비상호작용」") && shapes.length >= 5, shapes.join(" "));
  const tooling = readFileSync(toolingDoc, "utf8");
  for (const shape of shapes) assert.ok(tooling.includes(shape), `tooling.md 에 ${shape} 이 있어야 한다`);
  expectDrift(run(edit(baseFiles(), doc("checkbox"), "Checkbox의 16px 비상호작용", "Checkbox의 17px 비상호작용")), P.checkbox, "Checkbox control 크기(산문)");
});

// --- 7회차 반박(S1~S8) — 문제마다 고정 fixture 하나. 오늘 저장소의 어긋남은 단정하지 않는다 ------------------------------

test("S1 tokens.md 펜스의 깨진 축약 줄이 말하던 이름은 expandAbbreviation 한 곳(첫 이름의 family 규칙)으로 추정한다 — 「oe-background-canvas-primary / canvas-secondary」 는 oe-background-canvas-secondary 를, 「oe-border-primary, oe-border-secondary」 는 oe-border-secondary 를 ⚠ 에 붙이지 않는다(? 하나)", () => {
  const canvas = expectUnreadable(run(edit(baseFiles(), FILES.tokensDoc, "oe-background-canvas-primary\noe-background-canvas-secondary\n", "oe-background-canvas-primary / canvas-secondary\n")), P.neutral, "펜스 줄 「oe-background-canvas-primary / canvas-secondary」");
  assert.deepEqual([canvas.drifts, canvas.unreadable.length], [[], 1], "마지막 조각을 뗀 추정(oe-background-canvas-canvas-secondary)으로 진짜 이름을 ⚠ 에 남기지 않는다");
  const full = expectUnreadable(run(edit(baseFiles(), FILES.tokensDoc, "oe-border-primary\noe-border-bold-primary\noe-border-secondary\n", "oe-border-primary, oe-border-secondary\noe-border-bold-primary\n")), P.neutral, "펜스 줄 「oe-border-primary, oe-border-secondary」");
  assert.deepEqual([full.drifts, full.unreadable.length], [[], 1], "온 이름 조각에 family 를 덧붙여(oe-border-oe-border-secondary) 진짜 이름을 ⚠ 에 남기지 않는다");
  assert.deepEqual(namesOfBrokenLine("oe-background-canvas-primary / canvas-secondary"), ["oe-background-canvas-primary", "oe-background-canvas-secondary"]);
  assert.deepEqual(namesOfBrokenLine("oe-border-primary, oe-border-secondary"), ["oe-border-primary", "oe-border-secondary"]);
  assert.deepEqual(namesOfBrokenLine("OE-Interaction-Hover (state layer)"), ["oe-interaction-hover"], "괄호 덧말은 이름이 아니고 대소문자는 가리지 않는다");
  assert.deepEqual(namesOfBrokenLine("oe-danger-border-*"), ["oe-danger-border-"], "접두를 스스로 말한 줄만 접두 표지");
  assert.deepEqual(namesOfBrokenLine("success / info"), ["success", "info"]);
  assert.deepEqual(namesOfBrokenLine("# 전경"), []);
  // 깨진 줄과 무관한 어긋남은 그대로 ⚠ — 못 읽음이 어긋남을 통째로 가리지 않는다
  const both = run(edit(edit(baseFiles(), FILES.tokensDoc, "oe-background-canvas-primary\noe-background-canvas-secondary\n", "oe-background-canvas-primary / canvas-secondary\n"), FILES.tokensDoc, "oe-border-visual\n", ""));
  assert.deepEqual(expectDrift(both, P.neutral, "문서 목록에 없는 코드 이름").drifts.map((item) => item.code), ["oe-border-visual"]);
});

test("S2 status 예시 펜스 줄을 하나도 못 읽었으면 ? 만 낸다 — 「예시의 role」 ⚠ 는 읽은 줄이 있는데 그 role 이 코드에 없을 때만이고, 펜스가 비면 이름 줄이 없다는 ? 다", () => {
  const example = "oe-danger-foreground-primary\noe-danger-foreground-secondary\noe-danger-background-primary\noe-danger-background-secondary\noe-danger-background-bold-primary\noe-danger-border-primary\noe-danger-border-secondary\n";
  const star = expectUnreadable(run(edit(baseFiles(), FILES.tokensDoc, example, "oe-danger-*\n")), P.status, "펜스 줄 「oe-danger-*」");
  assert.deepEqual([star.drifts, star.unreadable.length], [[], 1], "읽은 줄이 없는 것을 「문서가 role 을 안 적었다」 ⚠ 로 내지 않는다");
  const slashes = expectUnreadable(run(edit(baseFiles(), FILES.tokensDoc, example, "oe-danger-foreground-primary / secondary\noe-danger-background-primary / secondary / bold-primary\noe-danger-border-primary / secondary\n")), P.status, "펜스 줄 「oe-danger-foreground-primary / secondary」");
  assert.deepEqual([slashes.drifts, slashes.unreadable.length], [[], 3]);
  const empty = expectUnreadable(run(edit(baseFiles(), FILES.tokensDoc, example, "")), P.status, "`oe-<role>-…` 이름 줄");
  assert.deepEqual([empty.drifts, empty.unreadable.length], [[], 1], "빈 펜스는 조용히 = 가 아니라 ? 다");
  const notice = expectDrift(run(edit(baseFiles(), FILES.tokensDoc, example, "oe-notice-foreground-primary\n")), P.status, "status 예시의 role");
  assert.deepEqual([notice.drifts.map((item) => [item.code, item.doc]), notice.unreadable], [[["warning, danger, success, info", "notice"]], []]);
});

test("S3 alpha 문장은 문장 끝까지의 백틱 값을 모두 읽는다 — 「`05`, `08`, …」 처럼 묶음을 따로 써도 = 이고 값이 다르면 ⚠, 묶음 사이에 다른 말이 끼거나 숫자가 아닌 묶음이면 꼴 밖이라 ?(첫 묶음만 읽어 「문서 05」 거짓 ⚠ 를 내지 않는다)", () => {
  const joined = "`05, 08, 10, 16, 20, 30, 40, 50, 60, 70, 80, 90`";
  const separate = "`05`, `08`, `10`, `16`, `20`, `30`, `40`, `50`, `60`, `70`, `80`, `90`";
  expectSame(run(edit(baseFiles(), FILES.tokensDoc, joined, separate)), P.alpha);
  expectSame(run(edit(baseFiles(), FILES.tokensDoc, joined, "`05, 08, 10, 16`·`20, 30, 40, 50`, `60, 70, 80, 90`")), P.alpha);
  const changed = edit(baseFiles(), FILES.tokensDoc, joined, separate.replace("`16`", "`15`"));
  assert.deepEqual(expectDrift(run(changed), P.alpha, "brand alpha 단계").drifts.map((item) => [item.doc, item.docAt]), [["05, 08, 10, 15, 20, 30, 40, 50, 60, 70, 80, 90", `${FILES.tokensDoc}:${lineOf(changed[FILES.tokensDoc], "다음 값만 생성한다")}`]]);
  for (const odd of ["`05`, `08` 와 `10`", "`05`, `brand-alpha`", "05, 08, 10"]) {
    const entry = expectUnreadable(run(edit(baseFiles(), FILES.tokensDoc, joined, odd)), P.alpha, "숫자 백틱 목록");
    assert.deepEqual([entry.drifts, entry.unreadable.length], [[], 1], odd);
  }
});

test("S4 color.md 슬래시 축약의 조각이 이미 oe- 로 시작하면(「oe-border-primary / oe-border-secondary / disabled」) 그대로 이름이다 — 어디에도 없는 oe-border-oe-border-secondary 를 지어 ⚠ 를 내지 않고, family 를 잴 수 없는 줄(「oe-ring / x」)은 ? 하나에 말했을 수 있는 이름을 모두 뺀다", () => {
  const known = new Set(["neutral", "accent", "danger", "warning", "success", "info", "brand"]);
  const countOf = (entry) => Number(entry.notes.find((note) => note.includes("제안하는 최소 역할"))?.match(/없는 코드 이름 (\d+)개/)?.[1] ?? 0);
  const base = pairOf(run(baseFiles()), P.proposed);
  const full = run(edit(baseFiles(), FILES.colorDoc, "oe-border-primary / secondary / disabled\n", "oe-border-primary / oe-border-secondary / disabled\n"));
  expectSame(full, P.proposed);
  assert.equal(countOf(pairOf(full, P.proposed)), countOf(base), "oe-border-secondary 가 참고의 「코드에만 있는 이름」 으로 늘지 않는다");
  assert.deepEqual(expandAbbreviation("oe-border-primary", ["oe-border-secondary", "disabled"]), { names: ["oe-border-primary", "oe-border-secondary", "oe-border-disabled"], sure: true });
  assert.deepEqual(expandAbbreviation("oe-background-canvas-primary", ["canvas-secondary"]), { names: ["oe-background-canvas-primary", "oe-background-canvas-secondary"], sure: true });
  assert.deepEqual(expandAbbreviation("oe-{role}-border-primary", ["secondary"]), { names: ["oe-{role}-border-primary", "oe-{role}-border-secondary"], sure: true });
  assert.deepEqual(expandAbbreviation("success", ["info"]), { names: ["success", "info"], sure: true });
  assert.deepEqual(expandAbbreviation("oe-ring", ["x"]), { names: ["oe-ring", "x", "oe-x", "oe-ring-x"], sure: false }, "family 를 잴 수 없으면 추정하지 않고 말했을 수 있는 이름을 모두 돌려준다");
  const vague = expandRoleList([{ text: "oe-ring / x", line: 1 }, { text: "oe-c-y / z", line: 2 }], known);
  assert.deepEqual([vague.names, vague.problems.map((problem) => problem.line), vague.partial], [["oe-c-y", "oe-c-z"], [1], new Set(["oe-ring", "x", "oe-x", "oe-ring-x"])]);
  assert.match(vague.problems[0].detail, /family 접두를 「oe-ring」 에서 잴 수 없다/);
  // fixture: 애매한 줄이 말했을 수 있는 oe-focus-ring 은 코드에 있지만 참고의 「코드에만 있는 이름」 에 다시 세지 않는다 — ? 하나로 끝난다
  const ambiguous = run(edit(baseFiles(), FILES.colorDoc, "oe-focus-ring\noe-interaction-hover-subtle", "oe-ring / focus-ring\noe-interaction-hover-subtle"));
  const odd = expectUnreadable(ambiguous, P.proposed, "family 접두를 「oe-ring」 에서 잴 수 없다");
  assert.deepEqual([odd.drifts, odd.unreadable.length], [[], 1]);
  assert.equal(countOf(odd), countOf(base));
});

test("S5 Neutral 펜스에 허용하는 brand mapping 이름은 oe-focus-ring 하나다 — oe-brand-border-primary 를 적으면 「다른 family 의 이름(brand family)」 ⚠ 이고 조용히 지나가지 않는다; status 예시 펜스도 같고, 코드에 없는 이름은 그대로 「코드에 없는 이름」", () => {
  expectSame(run(baseFiles()), P.neutral);
  const brand = expectDrift(run(edit(baseFiles(), FILES.tokensDoc, "oe-focus-ring\n", "oe-focus-ring\noe-brand-border-primary\n")), P.neutral, "다른 family 의 이름");
  assert.deepEqual(brand.drifts.map((item) => [item.what, item.code, item.doc]), [["tokens.md Neutral 목록 — 다른 family 의 이름", "oe-brand-border-primary(brand family)", "oe-brand-border-primary"]]);
  assert.ok(!brand.drifts.some((item) => item.what.includes("코드에 없는 이름")), "brand mapping 에 있는 이름을 「코드 없음」 이라 하지 않는다");
  const status = expectDrift(run(edit(baseFiles(), FILES.tokensDoc, "oe-danger-border-secondary\n", "oe-danger-border-secondary\noe-focus-ring\n")), P.status, "status 예시(danger) — 다른 family 의 이름");
  assert.deepEqual(status.drifts.map((item) => item.code), ["oe-focus-ring(brand family)"]);
  const ghost = expectDrift(run(edit(baseFiles(), FILES.tokensDoc, "oe-focus-ring\n", "oe-focus-ring\noe-brand-halo\n")), P.neutral, "코드에 없는 이름");
  assert.deepEqual(ghost.drifts.map((item) => [item.code, item.doc]), [["없음", "oe-brand-halo"]]);
});

test("S6 「참고」 후보의 팔레트 값도 대소문자를 가리지 않는다 — 「Neutral-400」「RED-500」「Brand-Alpha-10」 은 White·Black 과 같이 후보다(NOT_MEASURED·tooling.md 의 「대소문자 무시」 대로); 한글로만 적은 팔레트와 테마 낱말 없는 문단은 아니다", () => {
  const claims = (md) => proseValueClaims({ "docs/system/x.md": `# X\n\n${md}\n` }).length;
  for (const sentence of ["Light 에서 Neutral-400 을 쓴다.", "Dark 에서 RED-500 을 쓴다.", "Light 에서 Brand-Alpha-10 을 쓴다.", "Dark에서 White 16% alpha", "LIGHT 에서 neutral-400 을 쓴다."]) assert.equal(claims(sentence), 1, sentence);
  for (const sentence of ["Light 에서 네추럴 400 을 쓴다.", "Neutral-400 만 적었다.", "Lightness 는 neutral-400 과 무관하다."]) assert.equal(claims(sentence), 0, sentence);
  assert.ok(NOT_MEASURED.find((entry) => entry.startsWith("산문의 색 값 주장")).includes("white·black, 대소문자 무시"));
});

test("S7 테마 낱말 바로 뒤의 맨 단계 숫자는 한글 라이트·다크 뒤에서도 후보다 — 「라이트 100 / 다크 800」 은 「Light 100 / Dark 800」 과 같다(열거한 테마 낱말 넷과 어긋나지 않는다); 사이에 다른 말이 끼거나 단위가 붙으면 아니다", () => {
  const claims = (md) => proseValueClaims({ "docs/system/x.md": `# X\n\n${md}\n` }).length;
  for (const cell of ["라이트 100 / 다크 800", "| Tonal | 라이트 100 / 다크 800 |", "| Tonal | Light 100 / Dark 800 |", "다크 800"]) assert.equal(claims(cell), 1, cell);
  for (const cell of ["라이트 테마의 800", "다크 16px", "라이트 100%", "라이트 1"]) assert.equal(claims(cell), 0, cell);
});

test("S8 머리 주석이 인용하는 못 읽은 파일의 꼴은 실제 출력 꼴이다 — 「? <짝 이름> — 못 읽었다 — <경로>: 파일을 읽지 못했다」 이고, 출력 어디에도 없는 「못 읽었다: <경로>」 는 인용하지 않는다", () => {
  const source = readFileSync(script, "utf8");
  assert.ok(!source.includes("「못 읽었다: <경로>」"), "출력에 없는 꼴을 인용하지 않는다");
  assert.ok(source.split("\n").filter((line) => line.includes("「? <짝 이름> — 못 읽었다 — <경로>: 파일을 읽지 못했다」")).length >= 3, "약속 1·measure·unreadFiles 주석이 같은 꼴을 인용한다");
  const gone = expectUnreadable(run(without(baseFiles(), FILES.llms)), P.llms, "파일을 읽지 못했다");
  assert.deepEqual(gone.unreadable.map(formatUnreadable), [`? ${P.llms} — 못 읽었다 — ${FILES.llms}: 파일을 읽지 못했다`]);
});

// --- 8회차 반박(R1~R5) — 문제마다 고정 fixture 하나. 오늘 저장소의 어긋남은 단정하지 않는다 ------------------------------

test("8회차 R1 status 예시 펜스의 「oe-danger-foreground-primary / secondary」 는 ? 하나다 — role 이 앞에 오는 이름의 family 는 그 뒤 property 까지라 oe-danger-foreground-secondary 를 ⚠ 에 붙이지 않는다(어디에도 없는 oe-danger-secondary 를 짓지 않는다)", () => {
  const roles = new Set(["neutral", "accent", "danger", "warning", "success", "info", "brand"]);
  for (const [from, to] of [
    ["oe-danger-foreground-primary\noe-danger-foreground-secondary\n", "oe-danger-foreground-primary / secondary\n"],
    ["oe-danger-background-primary\noe-danger-background-secondary\n", "oe-danger-background-primary / secondary\n"],
    ["oe-danger-border-primary\noe-danger-border-secondary\n", "oe-danger-border-primary, secondary\n"],
  ]) {
    const entry = expectUnreadable(run(edit(baseFiles(), FILES.tokensDoc, from, to)), P.status, `펜스 줄 「${to.trim()}」`);
    assert.deepEqual([entry.drifts, entry.unreadable.length], [[], 1], `${to.trim()}: 깨진 줄이 말하던 이름을 「문서 목록에 없는 코드 이름」 으로 내지 않는다`);
  }
  assert.equal(familyOf("oe-danger-foreground-primary", roles), "oe-danger-foreground", "role 뒤 property 까지");
  assert.equal(familyOf("oe-accent-background-bold-primary", roles), "oe-accent-background");
  assert.equal(familyOf("oe-background-canvas-primary", roles), "oe-background", "neutral 이름은 첫 낱말");
  assert.equal(familyOf("oe-{role}-border-primary"), "oe-{role}-border");
  assert.equal(familyOf("oe-danger-primary", roles), null, "role 뒤에 낱말이 하나뿐이면 family 를 잴 수 없다");
  assert.equal(familyOf("oe-ring"), null);
  assert.equal(familyOf("oe-{property}-{hierarchy}"), null, "다른 자리표시자는 영문 낱말이 아니다");
  assert.deepEqual(expandAbbreviation("oe-danger-foreground-primary", ["secondary"], roles), { names: ["oe-danger-foreground-primary", "oe-danger-foreground-secondary"], sure: true });
  assert.equal(expandAbbreviation("oe-danger-primary", ["secondary"], roles).sure, false, "잴 수 없으면 추정하지 않는다");
  assert.deepEqual(namesOfBrokenLine("oe-danger-border-primary, secondary", roles), ["oe-danger-border-primary", "oe-danger-border-secondary"]);
  // 깨진 줄과 무관한 어긋남은 그대로 ⚠ — 못 읽음이 어긋남을 통째로 가리지 않는다
  const both = run(edit(edit(baseFiles(), FILES.tokensDoc, "oe-danger-foreground-primary\noe-danger-foreground-secondary\n", "oe-danger-foreground-primary / secondary\n"), FILES.tokensDoc, "oe-danger-border-secondary\n", ""));
  assert.deepEqual(expectDrift(both, P.status, "문서 목록에 없는 코드 이름").drifts.map((item) => item.code), ["oe-danger-border-secondary"]);
});

test("8회차 R2 color.md 최소 역할 펜스의 「oe-danger-foreground-primary / secondary」「oe-brand-border-primary / secondary」 는 = 다 — 「oe-」 뒤 첫 낱말만 붙여 oe-danger-secondary·oe-brand-secondary 를 지어 ⚠ 를 내지 않는다; tooling.md 도 같은 규칙을 적는다", () => {
  const known = new Set(["neutral", "accent", "danger", "warning", "success", "info", "brand"]);
  for (const line of ["oe-danger-foreground-primary / secondary", "oe-brand-border-primary / secondary"]) {
    expectSame(run(edit(baseFiles(), FILES.colorDoc, "oe-focus-ring\noe-interaction-hover-subtle", `oe-focus-ring\n${line}\noe-interaction-hover-subtle`)), P.proposed);
  }
  assert.deepEqual(expandRoleList([{ text: "oe-danger-foreground-primary / secondary", line: 1 }], known), { names: ["oe-danger-foreground-primary", "oe-danger-foreground-secondary"], problems: [], partial: new Set() });
  // family 를 바로 잡은 것이지 추정을 넓힌 것이 아니다 — 코드에 없는 접미는 그대로 ⚠ 다
  const ghost = expectDrift(run(edit(baseFiles(), FILES.colorDoc, "oe-focus-ring\noe-interaction-hover-subtle", "oe-focus-ring\noe-danger-foreground-primary / halo\noe-interaction-hover-subtle")), P.proposed, "코드에 없는 이름");
  assert.deepEqual(ghost.drifts.map((item) => item.doc), ["oe-danger-foreground-halo"]);
  const tooling = readFileSync(toolingDoc, "utf8");
  assert.ok(tooling.includes("oe-danger-foreground-secondary") && tooling.includes("그 뒤 property 까지다"), "tooling.md 의 family 규칙 문구");
  assert.ok(!tooling.includes("`{role}` 이 끼면 그 뒤까지)"), "「oe- 뒤 첫 낱말」 만의 옛 규칙 문구는 남기지 않는다");
});

test("8회차 R3·R5 color.md 최소 역할 펜스의 자리표시자는 {role} 만이다 — tokens.md 의 템플릿 줄 「oe-{property}-{hierarchy}」「oe-{role}-{property}-{hierarchy}」 는 더해도 바꿔도 ? 하나에 이름을 짓지 않고(Neutral 펜스와 같은 판정), 그 꼴에 맞는 이름은 참고에서도 뺀다", () => {
  const known = new Set(["neutral", "accent", "danger", "warning", "success", "info", "brand"]);
  const countOf = (entry) => Number(entry.notes.find((note) => note.includes("제안하는 최소 역할"))?.match(/없는 코드 이름 (\d+)개/)?.[1] ?? 0);
  for (const [from, to] of [
    ["oe-focus-ring\noe-interaction-hover-subtle", "oe-focus-ring\noe-{property}-{hierarchy}\noe-interaction-hover-subtle"],
    ["oe-{role}-border-primary / secondary\n", "oe-{role}-border-primary / secondary\noe-{role}-{property}-{hierarchy}\n"],
    ["oe-{role}-foreground-primary / secondary\n", "oe-{role}-{property}-{hierarchy}\n"],
    ["oe-focus-ring\noe-interaction-hover-subtle", "oe-{property}-{hierarchy}\noe-interaction-hover-subtle"],
  ]) {
    const files = edit(baseFiles(), FILES.colorDoc, from, to);
    const template = to.split("\n").find((line) => /\{(?:property|hierarchy)\}/.test(line));
    const entry = expectUnreadable(run(files), P.proposed, `펜스 줄 「${template}」`);
    assert.deepEqual([entry.drifts, entry.unreadable.length], [[], 1], `${template}: 자리표시자를 이름으로 세거나 {role} 을 펼쳐 다섯 이름을 짓지 않는다`);
    assert.ok(entry.unreadable[0].detail.includes("자리표시자 줄이라 이름을 짓지 않고"), entry.unreadable[0].detail);
    assert.equal(entry.unreadable[0].docAt, `${FILES.colorDoc}:${lineOf(files[FILES.colorDoc], template)}`, "그 줄을 가리킨다");
  }
  // 참고의 「코드에만 있는 이름」: oe-interaction-hover 를 지워 코드에만 있게 한 뒤 — 「oe-{property}-{hierarchy}」 는 어떤 neutral 이름에도 맞아 참고에서 빠지고,
  // 「oe-{role}-{property}-{hierarchy}」 는 role 이름에만 맞아 neutral 이름은 그대로 참고에 남는다
  const base = countOf(pairOf(run(baseFiles()), P.proposed));
  const missing = edit(baseFiles(), FILES.colorDoc, "oe-interaction-hover-subtle\noe-interaction-hover\n", "oe-interaction-hover-subtle\n");
  assert.equal(countOf(pairOf(run(missing), P.proposed)), base + 1);
  assert.equal(countOf(pairOf(run(edit(missing, FILES.colorDoc, "oe-focus-ring\n", "oe-focus-ring\noe-{property}-{hierarchy}\n")), P.proposed)), 0);
  assert.equal(countOf(pairOf(run(edit(missing, FILES.colorDoc, "oe-{role}-border-primary / secondary\n", "oe-{role}-border-primary / secondary\noe-{role}-{property}-{hierarchy}\n")), P.proposed)), base + 1);
  const expanded = expandRoleList([{ text: "Brand 및 danger", line: 1 }, { text: "oe-{role}-{property}-{hierarchy}", line: 2 }, { text: "oe-{property}-{hierarchy}", line: 3 }, { text: "oe-{role}-border-primary", line: 4 }], known);
  assert.deepEqual([expanded.names, expanded.problems.map((problem) => problem.line)], [["oe-brand-border-primary", "oe-danger-border-primary"], [2, 3]]);
  assert.match(expanded.problems[0].detail, /「oe-이름\( \/ 접미\)\*」 꼴에 맞지 않는다 — 자리표시자 줄이라 이름을 짓지 않고/);
  assert.deepEqual(expanded.partial, new Set(["oe-brand-{property}-{hierarchy}", "oe-danger-{property}-{hierarchy}", "oe-{property}-{hierarchy}"]));
  // 라벨을 못 읽어 roles 가 비면 {role} 을 그대로 둔다 — 어떤 role 이든 맞는 이름을 뺀다
  assert.deepEqual(expandRoleList([{ text: "oe-{role}-{property}-{hierarchy}", line: 1 }], known).partial, new Set(["oe-{role}-{property}-{hierarchy}"]));
});

test("8회차 R4 tokens.md status 예시 펜스에 온 「oe-{role}-foreground-primary / secondary」「oe-{role}-{property}-{hierarchy}」 는 ? 하나다 — 그 줄이 말했을 수 있는 이름(어떤 role 이든)은 「문서 목록에 없는 코드 이름」 에서 빠지고 무관한 이름은 그대로 ⚠ 다; Neutral 펜스도 같다", () => {
  const foreground = "oe-danger-foreground-primary\noe-danger-foreground-secondary\n";
  for (const to of ["oe-{role}-foreground-primary / secondary\n", "oe-{role}-{property}-{hierarchy}\n"]) {
    const entry = expectUnreadable(run(edit(baseFiles(), FILES.tokensDoc, foreground, to)), P.status, `펜스 줄 「${to.trim()}」`);
    assert.deepEqual([entry.drifts, entry.unreadable.length], [[], 1], `${to.trim()}: oe-danger-foreground-primary·secondary 를 ⚠ 에 붙이지 않는다`);
    assert.ok(entry.unreadable[0].detail.includes("자리표시자 줄이라 이름을 짓지 않고"), entry.unreadable[0].detail);
  }
  // foreground 템플릿은 foreground 이름만 뺀다 — border 이름을 지우면 그 ⚠ 는 남는다
  const border = run(edit(edit(baseFiles(), FILES.tokensDoc, foreground, "oe-{role}-foreground-primary / secondary\n"), FILES.tokensDoc, "oe-danger-border-secondary\n", ""));
  assert.deepEqual(expectDrift(border, P.status, "문서 목록에 없는 코드 이름").drifts.map((item) => item.code), ["oe-danger-border-secondary"]);
  // 「oe-{role}-{property}-{hierarchy}」 는 danger 이름 모두에 맞으니 이 펜스의 「문서 목록에 없는 코드 이름」 은 세지 않는다 — 짝은 ? 로 끝난다(추정이 어려우면 짝 전체를 ? 로)
  const all = expectUnreadable(run(edit(edit(baseFiles(), FILES.tokensDoc, foreground, "oe-{role}-{property}-{hierarchy}\n"), FILES.tokensDoc, "oe-danger-border-secondary\n", "")), P.status, "자리표시자");
  assert.deepEqual([all.drifts, all.unreadable.length], [[], 1]);
  const neutral = expectUnreadable(run(edit(baseFiles(), FILES.tokensDoc, "oe-focus-ring\n", "oe-{property}-{hierarchy}\n")), P.neutral, "펜스 줄 「oe-{property}-{hierarchy}」");
  assert.deepEqual([neutral.drifts, neutral.unreadable.length], [[], 1]);
  assert.deepEqual(namesOfBrokenLine("oe-{role}-foreground-primary / secondary"), ["oe-{role}-foreground-primary", "oe-{role}-foreground-secondary"], "자리표시자는 그대로 둔다 — except 가 그 꼴에 맞는 이름을 양쪽에서 뺀다");
});
