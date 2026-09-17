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
  Chip,
  Combobox,
  Field,
  Input,
  InputButton,
  NotificationBadge,
  NumberInput,
  Radio,
  RadioGroup,
  Select,
  SelectBox,
  SelectBoxGroup,
  Switch,
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

function Group({ component, items }: { component: string; items: Item[] }) {
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

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-oe-label font-medium text-oe-foreground-secondary">{component}</h2>
      <div className="flex flex-wrap items-start gap-4">
        {items.map((item) => (
          <div key={variantName(item.props)} className="flex flex-col gap-1" data-component={component} data-variant-props={variantName(item.props)}>
            {item.node}
          </div>
        ))}
      </div>
    </section>
  );
}

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
const SELECT_OPTIONS = [
  { value: "a", label: "첫째" },
  { value: "b", label: "둘째" },
];

export default function CatalogPage() {
  return (
    <main className="flex min-h-dvh flex-col gap-10 bg-oe-background-primary p-10">
      <Group
        component="Button"
        items={[
          ...BUTTON_VARIANTS.flatMap((variant) =>
            BUTTON_TONES.map((tone) => ({
              props: { variant, tone, controlSize: "regular", state: "기본" },
              node: (
                <Button variant={variant} tone={tone}>
                  버튼
                </Button>
              ),
            })),
          ),
          // regular 은 위 변형 묶음에 이미 있다. 여기서 또 만들면 이름이 같은 Variant 가 둘이 된다.
          ...CONTROL_SIZES.filter((controlSize) => controlSize !== "regular").map((controlSize) => ({
            props: { variant: "fill", tone: "brand", controlSize, state: "기본" },
            node: (
              <Button controlSize={controlSize}>버튼</Button>
            ),
          })),
          { props: { variant: "fill", tone: "brand", controlSize: "regular", state: "disabled" }, node: <Button disabled>버튼</Button> },
          // 위 두 묶음은 축마다 하나씩만 훑는다. 화면이 실제로 쓰는 조합은 그 밖에도 있어서 따로 적는다.
          // 무엇이 빠졌는지는 page.test.tsx 의 「화면이 쓰는 인스턴스 이름이 카탈로그에 모두 있다」가 알려 준다.
          { props: { variant: "ghost", tone: "neutral", controlSize: "small", state: "기본" }, node: <Button variant="ghost" tone="neutral" controlSize="small">버튼</Button> },
          { props: { variant: "tonal", tone: "brand", controlSize: "small", state: "기본" }, node: <Button variant="tonal" controlSize="small">버튼</Button> },
        ]}
      />

      <Group
        component="Badge"
        items={BADGE_VARIANTS.flatMap((variant) =>
          BADGE_TONES.map((tone) => ({
            props: { variant, tone, size: "medium" },
            // Badge 의 기본 size 는 small 이다. 이름에 medium 이라 적으면 실제로도 medium 을 넘겨야 한다.
            node: (
              <Badge variant={variant} tone={tone} size="medium">
                배지
              </Badge>
            ),
          })),
        ).concat(BADGE_TONES.map((tone) => ({ props: { variant: "tonal", tone, size: "small" }, node: <Badge variant="tonal" tone={tone} size="small">배지</Badge> })))}
      />

      <Group
        component="Input"
        items={[
          ...INPUT_VARIANTS.flatMap((variant) =>
            INPUT_SIZES.map((controlSize) => ({
              props: { variant, controlSize, state: "비어 있음" },
              node: <Input variant={variant} controlSize={controlSize} aria-label={`${variant} ${controlSize}`} placeholder="입력" />,
            })),
          ),
          { props: { variant: "outline", controlSize: "regular", state: "값 있음" }, node: <Input aria-label="값" defaultValue="입력한 값" /> },
          { props: { variant: "outline", controlSize: "regular", state: "disabled" }, node: <Input aria-label="비활성" placeholder="입력" disabled /> },
        ]}
      />

      <Group
        component="Select"
        items={INPUT_VARIANTS.flatMap((variant) =>
          INPUT_SIZES.map((controlSize) => ({
            props: { variant, controlSize },
            node: (
              <Select
                variant={variant}
                controlSize={controlSize}
                aria-label={`${variant} ${controlSize}`}
                placeholder="선택"
                options={SELECT_OPTIONS}
              />
            ),
          })),
        )}
      />

      <Group
        component="Checkbox"
        items={[
          { props: { shape: "square", state: "off" }, node: <Checkbox shape="square" aria-label="끄기" /> },
          { props: { shape: "square", state: "on" }, node: <Checkbox shape="square" defaultChecked aria-label="켜기" /> },
          { props: { shape: "rounded", state: "off" }, node: <Checkbox aria-label="끄기" /> },
          { props: { shape: "rounded", state: "on" }, node: <Checkbox defaultChecked aria-label="켜기" /> },
          { props: { shape: "rounded", state: "indeterminate" }, node: <Checkbox indeterminate aria-label="일부" /> },
          { props: { shape: "rounded", state: "disabled" }, node: <Checkbox disabled aria-label="비활성" /> },
          { props: { shape: "ghost", state: "off" }, node: <Checkbox shape="ghost" aria-label="테두리 없이 끄기" /> },
          { props: { shape: "ghost", state: "on" }, node: <Checkbox shape="ghost" defaultChecked aria-label="테두리 없이 켜기" /> },
        ]}
      />

      <Group
        component="Chip"
        items={[
          // Chip 의 기본 shape 는 circle 이다. rounded 를 그리려면 실제로 넘겨야 한다.
          ...CONTROL_SIZES.map((controlSize) => ({ props: { shape: "rounded", controlSize, state: "기본" }, node: <Chip shape="rounded" controlSize={controlSize}>칩</Chip> })),
          { props: { shape: "rounded", controlSize: "regular", state: "active" }, node: <Chip shape="rounded" active>칩</Chip> },
          { props: { shape: "circle", controlSize: "regular", state: "기본" }, node: <Chip shape="circle">칩</Chip> },
        ]}
      />

      <Group
        component="Field"
        items={[
          { props: { state: "기본" }, node: <Field label="이름"><Input aria-label="이름" placeholder="입력" /></Field> },
          { props: { state: "required" }, node: <Field label="이름" required><Input aria-label="필수 이름" placeholder="입력" /></Field> },
          { props: { state: "helper" }, node: <Field label="이름" helperText="도움말"><Input aria-label="도움말 이름" placeholder="입력" /></Field> },
          { props: { state: "error" }, node: <Field label="이름" errorMessage="오류 문구"><Input aria-label="오류 이름" placeholder="입력" aria-invalid /></Field> },
        ]}
      />

      <Group
        component="Switch"
        items={[
          ...SWITCH_SIZES.map((controlSize) => ({ props: { controlSize, state: "off" }, node: <Switch controlSize={controlSize} aria-label={`${controlSize} 끄기`} /> })),
          ...SWITCH_SIZES.map((controlSize) => ({ props: { controlSize, state: "on" }, node: <Switch controlSize={controlSize} defaultChecked aria-label={`${controlSize} 켜기`} /> })),
          { props: { controlSize: "medium", state: "disabled" }, node: <Switch disabled aria-label="비활성" /> },
        ]}
      />

      <Group
        component="Radio"
        items={[
          { props: { state: "off" }, node: <RadioGroup defaultValue="b"><Radio value="a" aria-label="끄기" /></RadioGroup> },
          { props: { state: "on" }, node: <RadioGroup defaultValue="a"><Radio value="a" aria-label="켜기" /></RadioGroup> },
          { props: { state: "disabled" }, node: <RadioGroup defaultValue="b"><Radio value="a" disabled aria-label="비활성" /></RadioGroup> },
        ]}
      />

      <Group
        component="Textarea"
        items={[
          ...INPUT_VARIANTS.map((variant) => ({
            props: { variant, state: "비어 있음" },
            node: <Textarea variant={variant} aria-label={`${variant} 내용`} placeholder="입력" />,
          })),
          { props: { variant: "outline", state: "값 있음" }, node: <Textarea aria-label="값" defaultValue="입력한 내용" /> },
          { props: { variant: "outline", state: "disabled" }, node: <Textarea aria-label="비활성" placeholder="입력" disabled /> },
        ]}
      />

      <Group
        component="InputButton"
        items={[
          ...INPUT_VARIANTS.flatMap((variant) =>
            INPUT_SIZES.map((controlSize) => ({
              props: { variant, controlSize, state: "비어 있음" },
              node: <InputButton variant={variant} controlSize={controlSize} aria-label={`${variant} ${controlSize}`} placeholder="선택" />,
            })),
          ),
          { props: { variant: "outline", controlSize: "regular", state: "값 있음" }, node: <InputButton aria-label="값" value="2026-09-17" /> },
          { props: { variant: "outline", controlSize: "regular", state: "disabled" }, node: <InputButton aria-label="비활성" placeholder="선택" disabled /> },
        ]}
      />

      <Group
        component="NumberInput"
        items={[
          ...INPUT_SIZES.map((controlSize) => ({
            props: { variant: "outline", controlSize, controls: "trailing" },
            node: <NumberInput controlSize={controlSize} aria-label={`수량 ${controlSize}`} defaultValue={1} />,
          })),
          { props: { variant: "outline", controlSize: "regular", controls: "split" }, node: <NumberInput aria-label="나눠 놓기" defaultValue={1} controlsPosition="split" /> },
          { props: { variant: "outline", controlSize: "regular", controls: "없음" }, node: <NumberInput aria-label="컨트롤 없음" defaultValue={1} hideControls /> },
        ]}
      />

      <Group
        component="Combobox"
        items={INPUT_VARIANTS.flatMap((variant) =>
          INPUT_SIZES.map((controlSize) => ({
            props: { variant, controlSize },
            node: <Combobox variant={variant} controlSize={controlSize} ariaLabel={`${variant} ${controlSize}`} placeholder="선택" options={SELECT_OPTIONS} />,
          })),
        )}
      />

      <Group
        component="ToggleButton"
        items={[
          ...CONTROL_SIZES.map((controlSize) => ({
            props: { variant: "ghost", tone: "brand", controlSize, state: "기본" },
            node: <ToggleButton controlSize={controlSize} icon={<RiStarLine aria-hidden />} activeIcon={<RiStarFill aria-hidden />} aria-label={`즐겨찾기 ${controlSize}`} />,
          })),
          { props: { variant: "ghost", tone: "brand", controlSize: "regular", state: "pressed" }, node: <ToggleButton defaultPressed icon={<RiStarLine aria-hidden />} activeIcon={<RiStarFill aria-hidden />} aria-label="즐겨찾기 켬" /> },
          { props: { variant: "ghost", tone: "like", controlSize: "regular", state: "기본" }, node: <ToggleButton tone="custom" color="like" icon={<RiHeart3Line aria-hidden />} activeIcon={<RiHeart3Fill aria-hidden />} aria-label="좋아요" /> },
          { props: { variant: "ghost", tone: "favorite", controlSize: "regular", state: "pressed" }, node: <ToggleButton tone="custom" color="favorite" icon={<RiStarLine aria-hidden />} activeIcon={<RiStarFill aria-hidden />} defaultPressed aria-label="즐겨찾기 색" /> },
          { props: { variant: "tonal", tone: "brand", controlSize: "regular", state: "기본" }, node: <ToggleButton variant="tonal" icon={<RiStarLine aria-hidden />} aria-label="즐겨찾기 담기" /> },
          { props: { variant: "ghost", tone: "brand", controlSize: "regular", state: "수 있음" }, node: <ToggleButton count={12} icon={<RiStarLine aria-hidden />} activeIcon={<RiStarFill aria-hidden />} aria-label="즐겨찾기 수" /> },
        ]}
      />

      <Group
        component="NotificationBadge"
        items={[
          { props: { shape: "dot", tone: "accent", overflow: "아님" }, node: <NotificationBadge /> },
          { props: { shape: "count", tone: "accent", overflow: "아님" }, node: <NotificationBadge count={5} /> },
          { props: { shape: "count", tone: "neutral", overflow: "아님" }, node: <NotificationBadge count={5} tone="neutral" /> },
          { props: { shape: "count", tone: "accent", overflow: "넘침" }, node: <NotificationBadge count={120} /> },
        ]}
      />

      <Group
        component="SelectBox"
        items={[
          {
            props: { selectionMode: "single", trailingElement: "radio" },
            node: (
              <SelectBoxGroup ariaLabel="한 개 고르기" defaultValue="a">
                <SelectBox value="a" title="첫째" description="설명" />
              </SelectBoxGroup>
            ),
          },
          {
            props: { selectionMode: "multiple", trailingElement: "checkbox" },
            node: (
              <SelectBoxGroup ariaLabel="여러 개 고르기" selectionMode="multiple" defaultValue={["a"]}>
                <SelectBox value="a" title="첫째" description="설명" />
              </SelectBoxGroup>
            ),
          },
          {
            props: { selectionMode: "single", trailingElement: "none" },
            node: (
              <SelectBoxGroup ariaLabel="표시 없음" trailingElement="none">
                <SelectBox value="a" title="첫째" />
              </SelectBoxGroup>
            ),
          },
        ]}
      />

      <Group
        component="AppHeader"
        items={[
          { props: { titleAlign: "center", sides: "없음" }, node: <div className="w-[390px]"><AppHeader title="지원요청" sticky={false} /></div> },
          { props: { titleAlign: "start", sides: "없음" }, node: <div className="w-[390px]"><AppHeader title="지원요청" titleAlign="start" sticky={false} /></div> },
          {
            props: { titleAlign: "center", sides: "양옆" },
            node: (
              <div className="w-[390px]">
                <AppHeader title="지원요청" sticky={false} leadingElement={<Button variant="ghost" controlSize="small" aria-label="뒤로"><RiArrowLeftLine aria-hidden /></Button>} trailingElement={<NotificationBadge count={3} />} />
              </div>
            ),
          },
        ]}
      />

      <Group
        component="BottomNavigation"
        items={[
          {
            props: { variant: "bar", labels: "없음" },
            node: (
              <div className="w-[390px]">
                <BottomNavigation
                  value="home"
                  items={[
                    { value: "home", label: "홈", icon: <RiHomeFill aria-hidden /> },
                    { value: "search", label: "찾기", icon: <RiSearchLine aria-hidden /> },
                    { value: "me", label: "내 정보", icon: <RiUser3Line aria-hidden /> },
                  ]}
                />
              </div>
            ),
          },
          {
            props: { variant: "bar", labels: "있음" },
            node: (
              <div className="w-[390px]">
                <BottomNavigation
                  value="home"
                  showLabels
                  items={[
                    { value: "home", label: "홈", icon: <RiHomeFill aria-hidden /> },
                    { value: "search", label: "찾기", icon: <RiSearchLine aria-hidden /> },
                    { value: "me", label: "내 정보", icon: <RiUser3Line aria-hidden />, badge: { count: 2 } },
                  ]}
                />
              </div>
            ),
          },
          {
            props: { variant: "floating", labels: "없음" },
            node: (
              <div className="w-[390px]">
                <BottomNavigation
                  value="home"
                  variant="floating"
                  items={[
                    { value: "home", label: "홈", icon: <RiHomeFill aria-hidden /> },
                    { value: "search", label: "찾기", icon: <RiSearchLine aria-hidden /> },
                    { value: "me", label: "내 정보", icon: <RiUser3Line aria-hidden /> },
                  ]}
                />
              </div>
            ),
          },
        ]}
      />
    </main>
  );
}
