"use client";

/**
 * Figma 컴포넌트 카탈로그. 화면이 아니라 `@ooee/ui` 컴포넌트의 변형을 한 번에 그려 두는 자리다.
 * `/design-page 카탈로그`가 이 화면을 읽어 Figma 컴포넌트(변형 묶음)로 만든다.
 *
 * 항목마다 `data-component` 에 컴포넌트 이름, `data-variant-props` 에 **축과 값의 짝**을 적는다.
 * 변환 도구는 그 둘로 Figma 의 **Component Set** 하나(`Button`)와 그 안의 Variant 들을 만든다.
 * Assets 패널에는 `Button` 하나만 서고, 놓은 뒤 오른쪽에서 `variant`·`tone`·`controlSize` 를 고른다.
 * 여기에 새 변형을 더하면 다음 실행부터 Figma 에도 생긴다.
 *
 * 한 컴포넌트의 항목은 **모두 같은 축**을 가져야 한다. Figma 가 그래야 묶기 때문이고, `Group` 이 확인한다.
 *
 * 비워 둔 자리: 없음. 이 화면은 요구사항이 아니라 코드의 변형 정의에서 나온다.
 */

import { RiArrowLeftLine, RiHeart3Fill, RiHeart3Line, RiHomeFill, RiSearchLine, RiStarFill, RiStarLine, RiUser3Line } from "@remixicon/react";

import {
  AppHeader,
  Badge,
  BottomNavigation,
  Button,
  Checkbox,
  CheckboxField,
  Chip,
  Combobox,
  Field,
  Input,
  InputButton,
  MessageBubble,
  MultiCombobox,
  MultiSelect,
  NotificationBadge,
  NumberInput,
  Radio,
  RadioField,
  RadioGroup,
  Select,
  SelectBox,
  SelectBoxGroup,
  Switch,
  SwitchField,
  Textarea,
  ToggleButton,
} from "@ooee/ui";

/**
 * 항목 하나. `props` 는 **축 이름과 값의 짝**이다. Figma 는 이것을 그대로 Variant 의 옵션으로 읽는다.
 * 예: `{ variant: "fill", tone: "brand", controlSize: "regular" }` → `variant=fill, tone=brand, controlSize=regular`
 */
type Item = { props: Record<string, string>; node: React.ReactNode };

/** Figma 가 Variant 이름에서 옵션을 읽는 꼴. 값에 `,` 와 `=` 를 쓰지 않는다. */
const variantName = (props: Record<string, string>) =>
  Object.entries(props)
    .map(([axis, value]) => `${axis}=${value}`)
    .join(", ");

/**
 * 축의 값을 **모두 곱해** 항목을 만든다.
 *
 * Figma 의 Component Set 은 Variant 이름에서 축과 값을 모아 드롭다운을 만든다. 그래서 값이 하나라도
 * 나타나면 그 값은 모든 축과 곱해져 고를 수 있게 되는데, 그 조합의 Variant 가 없으면 골랐을 때
 * 아무것도 나오지 않는다. 훑기(축마다 하나씩)로 만들면 이 빈칸이 대부분을 차지한다.
 * 실제로 Button 은 훑기로 19개만 올라가 120개 가운데 101개가 빈칸이었다.
 */
function cross<A extends Record<string, readonly string[]>>(axes: A, node: (props: { [K in keyof A]: A[K][number] }) => React.ReactNode): Item[] {
  let rows: Record<string, string>[] = [{}];
  for (const axis of Object.keys(axes)) rows = rows.flatMap((row) => axes[axis].map((value) => ({ ...row, [axis]: value })));
  return rows.map((props) => ({ props, node: node(props as { [K in keyof A]: A[K][number] }) }));
}

/**
 * 곱집합에서 **빼는** 조합이다. 컴포넌트가 타입으로 막아 만들 수 없는 짝에만 쓴다
 * (예: NotificationBadge 의 점 형태는 `tone` 을 받지 않는다). 「아직 안 만들었다」에는 쓰지 않는다.
 * 여기 적은 조합이 실제로는 만들어져 있으면 테스트가 「이 예외는 이제 필요 없다」고 알려 준다.
 */
type Impossible = { props: Record<string, string>; why: string };

function Group({
  component,
  items,
  impossible = [],
  surface,
}: {
  component: string;
  items: Item[];
  impossible?: Impossible[];
  /**
   * 항목을 올려 둘 바탕이다. 컴포넌트가 **바탕과 같은 색을 스스로 그리는** 자리에만 준다.
   * NotificationBadge 의 테두리 링이 `oe-background-primary` 인데 이 화면의 바탕도 같아서,
   * 그냥 두면 링이 있는데 없는 것으로 캡처된다. Studio 플레이그라운드도 같은 이유로 회색 위에 올린다.
   */
  surface?: "secondary";
}) {
  // 한 Component Set 안의 Variant 는 **모두 같은 축**을 가져야 한다. 하나라도 다르면 Figma 가 묶지 못한다.
  // 이 화면은 미리 그려지므로 여기서 멈추면 빌드가 실패해 바로 드러난다.
  const axes = Object.keys(items[0].props).join(",");
  for (const item of items) {
    const mine = Object.keys(item.props).join(",");
    if (mine !== axes) throw new Error(`${component} 의 축이 항목마다 다르다: 「${axes}」 와 「${mine}」`);
    for (const [axis, value] of Object.entries(item.props)) {
      if (/[,=]/.test(axis) || /[,=]/.test(value)) throw new Error(`${component} 의 축·값에 , 나 = 를 쓸 수 없다: ${axis}=${value}`);
    }
  }

  // 이름이 겹치면 Figma 에도 같은 이름의 Variant 가 둘 생긴다.
  const seen = new Set<string>();
  for (const item of items) {
    const name = variantName(item.props);
    if (seen.has(name)) throw new Error(`${component} 의 변형 이름이 겹친다: ${name}`);
    seen.add(name);
  }

  for (const skip of impossible) {
    const mine = Object.keys(skip.props).join(",");
    if (mine !== axes) throw new Error(`${component} 의 예외가 축과 맞지 않는다: 「${axes}」 와 「${mine}」`);
  }

  return (
    <section className="flex flex-col gap-3" data-component-set={component} data-impossible={JSON.stringify(impossible.map((skip) => variantName(skip.props)))}>
      <h2 className="text-oe-label font-medium text-oe-foreground-secondary">{component}</h2>
      <div className={`flex flex-wrap items-start gap-4${surface === "secondary" ? " rounded-xl bg-oe-background-secondary p-4" : ""}`}>
        {items.map((item) => (
          <div key={variantName(item.props)} className="flex flex-col gap-1" data-component={component} data-variant-props={variantName(item.props)}>
            {item.node}
          </div>
        ))}
      </div>
    </section>
  );
}

// 정지 상태와 비활성 둘만 둔다. hover·pressed 는 정적인 화면 캡처에 걸리지 않아 Figma 로 옮길 수 없다.
const STATES = ["기본", "disabled"] as const;
const BUTTON_VARIANTS = ["fill", "tonal", "outline", "ghost"] as const;
const BUTTON_TONES = ["brand", "neutral", "danger"] as const;
const CONTROL_SIZES = ["xsmall", "small", "regular", "large", "xlarge"] as const;
const BADGE_VARIANTS = ["fill", "tonal", "outlined"] as const;
const BADGE_TONES = ["brand", "neutral", "warning", "danger", "success", "info"] as const;
const INPUT_VARIANTS = ["outline", "filled"] as const;
const INPUT_SIZES = ["small", "regular", "large", "xlarge"] as const;
// 크기 축은 컴포넌트마다 이름이 다르다. Switch 는 controlSize 가 small·medium·large 이고,
// Badge 는 아예 prop 이름이 size 이며 값이 small·medium 둘뿐이다. Textarea·Radio 에는 크기 축이 없다.
const SWITCH_SIZES = ["small", "medium", "large"] as const;
const BADGE_SIZES = ["small", "medium"] as const;
// Chip 은 다른 컨트롤보다 한 단계 작은 compact 를 더 갖는다.
const CHIP_SIZES = ["compact", "xsmall", "small", "regular", "large", "xlarge"] as const;
const CHIP_SHAPES = ["rounded", "circle"] as const;
const CHIP_STATES = ["기본", "active"] as const;
const CHECKBOX_SHAPES = ["square", "rounded", "ghost"] as const;
const CHECK_STATES = ["off", "on", "indeterminate", "disabled"] as const;
// Switch·Radio 처럼 일부 선택이 없는 컨트롤이 쓴다.
// 꺼진 채 비활성과 켜진 채 비활성은 색이 다르다(radio.tsx 의 data-[disabled]:data-[checked]: 전용 색).
const TOGGLE_STATES = ["off", "on", "disabled-off", "disabled-on"] as const;
// 값을 받는 컨트롤의 상태다. 비었는지 찼는지가 테두리·글자색을 가른다.
const FIELD_STATES = ["비어 있음", "값 있음", "invalid", "disabled"] as const;
const FIELD_KINDS = ["기본", "required", "helper", "error"] as const;
const NUMBER_CONTROLS = ["trailing", "split", "없음"] as const;
const TOGGLE_VARIANTS = ["ghost", "tonal"] as const;
// 크기는 Button 과 같은 다섯 단계를 받지만 카탈로그에는 가운데 셋만 둔다. 다섯을 다 곱하면
// 이 컴포넌트 하나가 Button 과 같은 120 개가 되는데, 도구 모음에서 쓰는 크기는 이 셋이다.
// 화면이 xsmall·xlarge 를 쓰기 시작하면 여기에 더한다 — page.test.tsx 가 빠진 이름을 잡아 준다.
const TOGGLE_SIZES = ["small", "regular", "large"] as const;
// brand 는 그대로 쓰고 like·favorite 는 `tone="custom"` 의 색 이름이다.
const TOGGLE_TONES = ["brand", "like", "favorite"] as const;
const PRESS_STATES = ["기본", "pressed"] as const;
const COUNT_STATES = ["없음", "있음"] as const;
const NOTIFICATION_SHAPES = ["dot", "count"] as const;
const NOTIFICATION_TONES = ["accent", "neutral"] as const;
// 99+ 는 세 글자, 999+ 는 네 글자라 폭이 다르다. 폭을 그 둘로 고정하는 것이 이 컴포넌트 규칙이다.
const OVERFLOW_STATES = ["아님", "99+", "999+"] as const;
const SELECTION_MODES = ["single", "multiple"] as const;
const SELECT_BOX_TRAILING = ["radio", "checkbox", "none"] as const;
const TITLE_ALIGNS = ["center", "start"] as const;
// 양옆에 무엇이 서는지다. 화면이 왼쪽만 쓰는 경우가 있어 셋으로 둔다.
const HEADER_SIDES = ["없음", "왼쪽", "양옆"] as const;
const NAV_VARIANTS = ["bar", "floating"] as const;
const LABEL_STATES = ["없음", "있음"] as const;
// Field 꼴 컨트롤이 설명을 함께 보일 수 있다. 설명이 붙으면 높이가 달라진다.
const DESCRIPTIONS = ["없음", "있음"] as const;
const LABEL_POSITIONS = ["right", "left"] as const;
const MESSAGE_DIRECTIONS = ["incoming", "outgoing"] as const;
const MESSAGE_STATES = ["기본", "sending", "sent", "read", "failed", "deleted"] as const;
const SELECT_OPTIONS = [
  { value: "a", label: "첫째" },
  { value: "b", label: "둘째" },
];

export default function CatalogPage() {
  return (
    <main className="flex min-h-dvh flex-col gap-10 bg-oe-background-primary p-10">
      <Group
        component="Button"
        items={cross({ variant: BUTTON_VARIANTS, tone: BUTTON_TONES, controlSize: CONTROL_SIZES, state: STATES }, ({ variant, tone, controlSize, state }) => (
          <Button variant={variant} tone={tone} controlSize={controlSize} disabled={state === "disabled"}>
            버튼
          </Button>
        ))}
      />

      <Group
        component="Badge"
        items={cross({ variant: BADGE_VARIANTS, tone: BADGE_TONES, size: BADGE_SIZES }, ({ variant, tone, size }) => (
          <Badge variant={variant} tone={tone} size={size}>
            배지
          </Badge>
        ))}
      />

      <Group
        component="Input"
        items={cross({ variant: INPUT_VARIANTS, controlSize: INPUT_SIZES, state: FIELD_STATES }, ({ variant, controlSize, state }) => (
          <Input
            variant={variant}
            controlSize={controlSize}
            aria-label={`${variant} ${controlSize} ${state}`}
            placeholder="입력"
            defaultValue={state === "값 있음" ? "입력한 값" : undefined}
            disabled={state === "disabled"}
            aria-invalid={state === "invalid" || undefined}
          />
        ))}
      />

      <Group
        component="Select"
        items={cross({ variant: INPUT_VARIANTS, controlSize: INPUT_SIZES, state: FIELD_STATES }, ({ variant, controlSize, state }) => (
          <Select
            variant={variant}
            controlSize={controlSize}
            ariaLabel={`${variant} ${controlSize} ${state}`}
            placeholder="선택"
            options={SELECT_OPTIONS}
            defaultValue={state === "값 있음" ? "a" : undefined}
            disabled={state === "disabled"}
            invalid={state === "invalid"}
          />
        ))}
      />

      <Group
        component="MultiSelect"
        items={cross({ variant: INPUT_VARIANTS, controlSize: INPUT_SIZES, state: FIELD_STATES }, ({ variant, controlSize, state }) => (
          <MultiSelect
            variant={variant}
            controlSize={controlSize}
            ariaLabel={`여러 개 ${variant} ${controlSize} ${state}`}
            placeholder="선택"
            options={SELECT_OPTIONS}
            defaultValue={state === "값 있음" ? ["a"] : undefined}
            disabled={state === "disabled"}
            invalid={state === "invalid"}
          />
        ))}
      />

      <Group
        component="Checkbox"
        items={cross({ shape: CHECKBOX_SHAPES, state: CHECK_STATES }, ({ shape, state }) => (
          <Checkbox
            shape={shape}
            aria-label={`${shape} ${state}`}
            defaultChecked={state === "on"}
            indeterminate={state === "indeterminate"}
            disabled={state === "disabled"}
          />
        ))}
      />

      {/* 라벨이 붙으면 배치가 달라져 홑 Checkbox 와 별개 세트다. 화면이 실제로 쓰는 쪽은 이쪽이다. */}
      <Group
        component="CheckboxField"
        items={cross({ shape: CHECKBOX_SHAPES, state: CHECK_STATES, description: DESCRIPTIONS }, ({ shape, state, description }) => (
          <CheckboxField
            label="항목"
            bottomDescription={description === "있음" ? "설명이 붙는다" : undefined}
            shape={shape}
            defaultChecked={state === "on"}
            indeterminate={state === "indeterminate"}
            disabled={state === "disabled"}
          />
        ))}
      />

      <Group
        component="Chip"
        items={cross({ shape: CHIP_SHAPES, controlSize: CHIP_SIZES, state: CHIP_STATES }, ({ shape, controlSize, state }) => (
          <Chip shape={shape} controlSize={controlSize} active={state === "active"}>
            칩
          </Chip>
        ))}
      />

      <Group
        component="Field"
        items={cross({ state: FIELD_KINDS }, ({ state }) => (
          <Field label="이름" required={state === "required"} helperText={state === "helper" ? "도움말" : undefined} errorMessage={state === "error" ? "오류 문구" : undefined}>
            <Input aria-label={`이름 ${state}`} placeholder="입력" aria-invalid={state === "error" || undefined} />
          </Field>
        ))}
      />

      <Group
        component="Switch"
        items={cross({ controlSize: SWITCH_SIZES, state: TOGGLE_STATES }, ({ controlSize, state }) => (
          <Switch
            controlSize={controlSize}
            aria-label={`${controlSize} ${state}`}
            defaultChecked={state === "on" || state === "disabled-on"}
            disabled={state.startsWith("disabled")}
          />
        ))}
      />

      <Group
        component="SwitchField"
        items={cross({ controlSize: SWITCH_SIZES, state: TOGGLE_STATES, labelPosition: LABEL_POSITIONS }, ({ controlSize, state, labelPosition }) => (
          <SwitchField
            label="설정"
            controlSize={controlSize}
            labelPosition={labelPosition}
            defaultChecked={state === "on" || state === "disabled-on"}
            disabled={state.startsWith("disabled")}
          />
        ))}
      />

      <Group
        component="Radio"
        items={cross({ state: TOGGLE_STATES }, ({ state }) => (
          <RadioGroup defaultValue={state === "on" || state === "disabled-on" ? "a" : "b"}>
            <Radio value="a" aria-label={state} disabled={state.startsWith("disabled")} />
          </RadioGroup>
        ))}
      />

      <Group
        component="RadioField"
        items={cross({ state: TOGGLE_STATES, description: DESCRIPTIONS }, ({ state, description }) => (
          <RadioGroup defaultValue={state === "on" || state === "disabled-on" ? "a" : "b"}>
            <RadioField
              value="a"
              label="항목"
              bottomDescription={description === "있음" ? "설명이 붙는다" : undefined}
              disabled={state.startsWith("disabled")}
            />
          </RadioGroup>
        ))}
      />

      <Group
        component="Textarea"
        items={cross({ variant: INPUT_VARIANTS, state: FIELD_STATES }, ({ variant, state }) => (
          <Textarea
            variant={variant}
            aria-label={`${variant} ${state}`}
            placeholder="입력"
            defaultValue={state === "값 있음" ? "입력한 내용" : undefined}
            disabled={state === "disabled"}
            aria-invalid={state === "invalid" || undefined}
          />
        ))}
      />

      <Group
        component="InputButton"
        items={cross({ variant: INPUT_VARIANTS, controlSize: INPUT_SIZES, state: FIELD_STATES }, ({ variant, controlSize, state }) => (
          <InputButton
            variant={variant}
            controlSize={controlSize}
            aria-label={`${variant} ${controlSize} ${state}`}
            placeholder="선택"
            value={state === "값 있음" ? "2026-09-17" : undefined}
            disabled={state === "disabled"}
            aria-invalid={state === "invalid" || undefined}
          />
        ))}
      />

      <Group
        component="NumberInput"
        items={cross({ variant: INPUT_VARIANTS, controlSize: INPUT_SIZES, controls: NUMBER_CONTROLS }, ({ variant, controlSize, controls }) => (
          <NumberInput
            variant={variant}
            controlSize={controlSize}
            aria-label={`수량 ${variant} ${controlSize} ${controls}`}
            defaultValue={1}
            controlsPosition={controls === "split" ? "split" : undefined}
            hideControls={controls === "없음"}
          />
        ))}
      />

      <Group
        component="Combobox"
        items={cross({ variant: INPUT_VARIANTS, controlSize: INPUT_SIZES, state: FIELD_STATES }, ({ variant, controlSize, state }) => (
          <Combobox
            variant={variant}
            controlSize={controlSize}
            ariaLabel={`${variant} ${controlSize} ${state}`}
            placeholder="선택"
            options={SELECT_OPTIONS}
            defaultValue={state === "값 있음" ? "a" : undefined}
            disabled={state === "disabled"}
            invalid={state === "invalid"}
          />
        ))}
      />

      <Group
        component="MultiCombobox"
        items={cross({ variant: INPUT_VARIANTS, controlSize: INPUT_SIZES, state: FIELD_STATES }, ({ variant, controlSize, state }) => (
          <MultiCombobox
            variant={variant}
            controlSize={controlSize}
            ariaLabel={`여러 개 ${variant} ${controlSize} ${state}`}
            placeholder="선택"
            options={SELECT_OPTIONS}
            defaultValue={state === "값 있음" ? ["a"] : undefined}
            disabled={state === "disabled"}
            invalid={state === "invalid"}
          />
        ))}
      />

      {/* MessageBubble 은 `data-slot` 이 없어 화면에서 되짚지 못한다(figma-component-map.md).
          카탈로그는 감싸개의 `data-component` 로 표시하므로 Component Set 은 만들어진다. */}
      <Group
        component="MessageBubble"
        items={cross({ direction: MESSAGE_DIRECTIONS, state: MESSAGE_STATES }, ({ direction, state }) => (
          <div className="w-[360px]">
            <MessageBubble
              direction={direction}
              author="김블루"
              initials="김"
              time="오후 3:08"
              deliveryState={state === "기본" || state === "deleted" ? undefined : state}
              deleted={state === "deleted"}
              deletedLabel="삭제된 메시지입니다"
            >
              메시지 내용입니다
            </MessageBubble>
          </div>
        ))}
      />

      <Group
        component="ToggleButton"
        // 전에는 `state` 에 눌림과 「수 있음」이 함께 있었다. 수를 보이는 것은 상태가 아니라 따로 켜고
        // 끄는 것이라, 한 축에 섞어 두면 「눌렸고 수도 보이는」 조합을 Figma 에서 만들 수 없다. 축을 갈랐다.
        items={cross({ variant: TOGGLE_VARIANTS, tone: TOGGLE_TONES, controlSize: TOGGLE_SIZES, state: PRESS_STATES, count: COUNT_STATES }, ({ variant, tone, controlSize, state, count }) => {
          const icon = tone === "like" ? <RiHeart3Line aria-hidden /> : <RiStarLine aria-hidden />;
          const activeIcon = tone === "like" ? <RiHeart3Fill aria-hidden /> : <RiStarFill aria-hidden />;
          // tonal 은 배경이 켜짐을 말하므로 타입이 `activeIcon` 을 막는다. 넘기는 짝을 갈라 맞춘다.
          const style = variant === "tonal" ? ({ variant: "tonal", icon } as const) : ({ variant: "ghost", icon, activeIcon } as const);
          const paint = tone === "brand" ? ({ tone: "brand" } as const) : ({ tone: "custom", color: tone } as const);
          return (
            <ToggleButton
              {...style}
              {...paint}
              controlSize={controlSize}
              count={count === "있음" ? 12 : undefined}
              defaultPressed={state === "pressed"}
              aria-label={`${variant} ${tone} ${controlSize} ${state} 수${count}`}
            />
          );
        })}
      />

      <Group
        component="NotificationBadge"
        surface="secondary"
        items={cross({ shape: NOTIFICATION_SHAPES, tone: NOTIFICATION_TONES, overflow: OVERFLOW_STATES }, ({ shape, tone, overflow }) =>
          shape === "dot" ? (
            <NotificationBadge />
          ) : (
            <NotificationBadge count={overflow === "아님" ? 5 : overflow === "99+" ? 120 : 1200} max={overflow === "999+" ? 999 : undefined} tone={tone} />
          ),
        ).filter((item) => item.props.shape !== "dot" || (item.props.tone === "accent" && item.props.overflow === "아님"))}
        // 점 형태는 수를 보이지 않으므로 타입이 `tone` 과 `max` 를 받지 않는다(notification-badge.tsx 의 갈린 타입).
        // 곱집합으로 만들 수 없는 것이 아니라 컴포넌트가 만들 수 없는 조합이다.
        impossible={[
          { props: { shape: "dot", tone: "neutral", overflow: "아님" }, why: "점 형태는 tone 을 받지 않는다" },
          { props: { shape: "dot", tone: "accent", overflow: "99+" }, why: "점 형태는 수를 보이지 않아 넘칠 것이 없다" },
          { props: { shape: "dot", tone: "neutral", overflow: "99+" }, why: "점 형태는 tone 도 넘침도 없다" },
          { props: { shape: "dot", tone: "accent", overflow: "999+" }, why: "점 형태는 수를 보이지 않아 넘칠 것이 없다" },
          { props: { shape: "dot", tone: "neutral", overflow: "999+" }, why: "점 형태는 tone 도 넘침도 없다" },
        ]}
      />

      <Group
        component="SelectBox"
        items={cross({ selectionMode: SELECTION_MODES, trailingElement: SELECT_BOX_TRAILING }, ({ selectionMode, trailingElement }) =>
          selectionMode === "multiple" ? (
            <SelectBoxGroup ariaLabel={`여러 개 ${trailingElement}`} selectionMode="multiple" defaultValue={["a"]} trailingElement={trailingElement === "none" ? "none" : undefined}>
              <SelectBox value="a" title="첫째" description="설명" />
            </SelectBoxGroup>
          ) : (
            <SelectBoxGroup ariaLabel={`한 개 ${trailingElement}`} defaultValue="a" trailingElement={trailingElement === "none" ? "none" : undefined}>
              <SelectBox value="a" title="첫째" description="설명" />
            </SelectBoxGroup>
          ),
        ).filter(
          (item) =>
            item.props.trailingElement === "none" ||
            (item.props.selectionMode === "single" ? item.props.trailingElement === "radio" : item.props.trailingElement === "checkbox"),
        )}
        // 끝 표시는 `none` 이 아니면 selectionMode 가 정한다(select-box.tsx 의 resolvedTrailingElement).
        // 하나 고르기에 checkbox 를, 여러 개 고르기에 radio 를 세우는 길이 없다.
        impossible={[
          { props: { selectionMode: "single", trailingElement: "checkbox" }, why: "하나 고르기의 끝 표시는 radio 로 정해진다" },
          { props: { selectionMode: "multiple", trailingElement: "radio" }, why: "여러 개 고르기의 끝 표시는 checkbox 로 정해진다" },
        ]}
      />

      <Group
        component="AppHeader"
        items={cross({ titleAlign: TITLE_ALIGNS, sides: HEADER_SIDES }, ({ titleAlign, sides }) => (
          <div className="w-[390px]">
            <AppHeader
              title="지원요청"
              titleAlign={titleAlign}
              sticky={false}
              leadingElement={
                sides === "없음" ? undefined : (
                  <Button variant="ghost" controlSize="small" aria-label="뒤로">
                    <RiArrowLeftLine aria-hidden />
                  </Button>
                )
              }
              trailingElement={sides === "양옆" ? <NotificationBadge count={3} /> : undefined}
            />
          </div>
        ))}
      />

      <Group
        component="BottomNavigation"
        items={cross({ variant: NAV_VARIANTS, labels: LABEL_STATES }, ({ variant, labels }) => (
          <div className="w-[390px]">
            <BottomNavigation
              value="home"
              variant={variant}
              showLabels={labels === "있음"}
              items={[
                { value: "home", label: "홈", icon: <RiHomeFill aria-hidden /> },
                { value: "search", label: "찾기", icon: <RiSearchLine aria-hidden /> },
                { value: "me", label: "내 정보", icon: <RiUser3Line aria-hidden />, badge: { count: 2 } },
              ]}
            />
          </div>
        ))}
      />
    </main>
  );
}
