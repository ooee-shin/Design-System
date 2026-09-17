"use client";

/**
 * Figma 컴포넌트 카탈로그. 화면이 아니라 `@ooee/ui` 컴포넌트의 변형을 한 번에 그려 두는 자리다.
 * `/design-page 카탈로그`가 이 화면을 읽어 Figma 컴포넌트(변형 묶음)로 만든다.
 *
 * 항목마다 `data-component` 에 컴포넌트 이름, `data-variant-props` 에 변형 이름을 적는다.
 * 변환 도구는 그 두 값으로 Figma 의 컴포넌트 이름(`Button/fill·brand·regular`)을 만든다.
 * 여기에 새 변형을 더하면 다음 실행부터 Figma 에도 생긴다.
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

type Item = { props: string; node: React.ReactNode };

function Group({ component, items }: { component: string; items: Item[] }) {
  // 변형 이름이 겹치면 Figma 에도 같은 이름의 컴포넌트가 둘 생기고, 인스턴스가 어느 쪽에 붙을지 알 수 없다.
  // 이 화면은 미리 그려지므로 여기서 멈추면 빌드가 실패해 바로 드러난다.
  const seen = new Set<string>();
  for (const item of items) {
    if (seen.has(item.props)) throw new Error(`${component} 의 변형 이름이 겹친다: ${item.props}`);
    seen.add(item.props);
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-oe-label font-medium text-oe-foreground-secondary">{component}</h2>
      <div className="flex flex-wrap items-start gap-4">
        {items.map((item) => (
          <div key={item.props} className="flex flex-col gap-1" data-component={component} data-variant-props={item.props}>
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
              props: `${variant}·${tone}·regular`,
              node: (
                <Button variant={variant} tone={tone}>
                  버튼
                </Button>
              ),
            })),
          ),
          // regular 은 위 변형 묶음에 이미 있다. 여기서 또 만들면 이름이 같은 컴포넌트가 둘이 된다.
          ...CONTROL_SIZES.filter((controlSize) => controlSize !== "regular").map((controlSize) => ({
            props: `fill·brand·${controlSize}`,
            node: (
              <Button controlSize={controlSize}>버튼</Button>
            ),
          })),
          { props: "fill·brand·regular·disabled", node: <Button disabled>버튼</Button> },
          // 위 두 묶음은 축마다 하나씩만 훑는다. 화면이 실제로 쓰는 조합은 그 밖에도 있어서 따로 적는다.
          // 무엇이 빠졌는지는 page.test.tsx 의 「화면이 쓰는 인스턴스 이름이 카탈로그에 모두 있다」가 알려 준다.
          { props: "ghost·neutral·small", node: <Button variant="ghost" tone="neutral" controlSize="small">버튼</Button> },
          { props: "tonal·brand·small", node: <Button variant="tonal" controlSize="small">버튼</Button> },
        ]}
      />

      <Group
        component="Badge"
        items={BADGE_VARIANTS.flatMap((variant) =>
          BADGE_TONES.map((tone) => ({
            props: `${variant}·${tone}·medium`,
            // Badge 의 기본 size 는 small 이다. 이름에 medium 이라 적으면 실제로도 medium 을 넘겨야 한다.
            node: (
              <Badge variant={variant} tone={tone} size="medium">
                배지
              </Badge>
            ),
          })),
        ).concat(BADGE_TONES.map((tone) => ({ props: `tonal·${tone}·small`, node: <Badge variant="tonal" tone={tone} size="small">배지</Badge> })))}
      />

      <Group
        component="Input"
        items={[
          ...INPUT_VARIANTS.flatMap((variant) =>
            INPUT_SIZES.map((controlSize) => ({
              props: `${variant}·${controlSize}`,
              node: <Input variant={variant} controlSize={controlSize} aria-label={`${variant} ${controlSize}`} placeholder="입력" />,
            })),
          ),
          { props: "outline·regular·값", node: <Input aria-label="값" defaultValue="입력한 값" /> },
          { props: "outline·regular·disabled", node: <Input aria-label="비활성" placeholder="입력" disabled /> },
        ]}
      />

      <Group
        component="Select"
        items={INPUT_VARIANTS.flatMap((variant) =>
          INPUT_SIZES.map((controlSize) => ({
            props: `${variant}·${controlSize}`,
            node: (
              <Select
                variant={variant}
                controlSize={controlSize}
                aria-label={`${variant} ${controlSize}`}
                placeholder="선택"
                options={[
                  { value: "a", label: "첫째" },
                  { value: "b", label: "둘째" },
                ]}
              />
            ),
          })),
        )}
      />

      <Group
        component="Checkbox"
        items={[
          { props: "square·off", node: <Checkbox shape="square" aria-label="끄기" /> },
          { props: "square·on", node: <Checkbox shape="square" defaultChecked aria-label="켜기" /> },
          { props: "rounded·off", node: <Checkbox aria-label="끄기" /> },
          { props: "rounded·on", node: <Checkbox defaultChecked aria-label="켜기" /> },
          { props: "rounded·indeterminate", node: <Checkbox indeterminate aria-label="일부" /> },
          { props: "rounded·disabled", node: <Checkbox disabled aria-label="비활성" /> },
          { props: "ghost·off", node: <Checkbox shape="ghost" aria-label="테두리 없이 끄기" /> },
          { props: "ghost·on", node: <Checkbox shape="ghost" defaultChecked aria-label="테두리 없이 켜기" /> },
        ]}
      />

      <Group
        component="Chip"
        items={[
          // Chip 의 기본 shape 는 circle 이다. rounded 를 그리려면 실제로 넘겨야 한다.
          ...CONTROL_SIZES.map((controlSize) => ({ props: `rounded·${controlSize}`, node: <Chip shape="rounded" controlSize={controlSize}>칩</Chip> })),
          { props: "rounded·regular·active", node: <Chip shape="rounded" active>칩</Chip> },
          { props: "circle·regular", node: <Chip shape="circle">칩</Chip> },
        ]}
      />

      <Group
        component="Field"
        items={[
          { props: "기본", node: <Field label="이름"><Input aria-label="이름" placeholder="입력" /></Field> },
          { props: "required", node: <Field label="이름" required><Input aria-label="필수 이름" placeholder="입력" /></Field> },
          { props: "helper", node: <Field label="이름" helperText="도움말"><Input aria-label="도움말 이름" placeholder="입력" /></Field> },
          { props: "error", node: <Field label="이름" errorMessage="오류 문구"><Input aria-label="오류 이름" placeholder="입력" aria-invalid /></Field> },
        ]}
      />

      <Group
        component="Switch"
        items={[
          ...SWITCH_SIZES.map((controlSize) => ({ props: `${controlSize}·off`, node: <Switch controlSize={controlSize} aria-label={`${controlSize} 끄기`} /> })),
          ...SWITCH_SIZES.map((controlSize) => ({ props: `${controlSize}·on`, node: <Switch controlSize={controlSize} defaultChecked aria-label={`${controlSize} 켜기`} /> })),
          { props: "medium·disabled", node: <Switch disabled aria-label="비활성" /> },
        ]}
      />

      <Group
        component="Radio"
        items={[
          { props: "off", node: <RadioGroup defaultValue="b"><Radio value="a" aria-label="끄기" /></RadioGroup> },
          { props: "on", node: <RadioGroup defaultValue="a"><Radio value="a" aria-label="켜기" /></RadioGroup> },
          { props: "disabled", node: <RadioGroup defaultValue="b"><Radio value="a" disabled aria-label="비활성" /></RadioGroup> },
        ]}
      />

      <Group
        component="Textarea"
        items={[
          ...INPUT_VARIANTS.map((variant) => ({
            props: `${variant}·기본`,
            node: <Textarea variant={variant} aria-label={`${variant} 내용`} placeholder="입력" />,
          })),
          { props: "outline·값", node: <Textarea aria-label="값" defaultValue="입력한 내용" /> },
          { props: "outline·disabled", node: <Textarea aria-label="비활성" placeholder="입력" disabled /> },
        ]}
      />

      <Group
        component="InputButton"
        items={[
          ...INPUT_VARIANTS.flatMap((variant) =>
            INPUT_SIZES.map((controlSize) => ({
              props: `${variant}·${controlSize}`,
              node: <InputButton variant={variant} controlSize={controlSize} aria-label={`${variant} ${controlSize}`} placeholder="선택" />,
            })),
          ),
          { props: "outline·regular·값", node: <InputButton aria-label="값" value="2026-09-17" /> },
          { props: "outline·regular·disabled", node: <InputButton aria-label="비활성" placeholder="선택" disabled /> },
        ]}
      />

      <Group
        component="NumberInput"
        items={[
          ...INPUT_SIZES.map((controlSize) => ({
            props: `outline·${controlSize}`,
            node: <NumberInput controlSize={controlSize} aria-label={`수량 ${controlSize}`} defaultValue={1} />,
          })),
          { props: "outline·regular·split", node: <NumberInput aria-label="나눠 놓기" defaultValue={1} controlsPosition="split" /> },
          { props: "outline·regular·컨트롤없음", node: <NumberInput aria-label="컨트롤 없음" defaultValue={1} hideControls /> },
        ]}
      />

      <Group
        component="Combobox"
        items={INPUT_VARIANTS.flatMap((variant) =>
          INPUT_SIZES.map((controlSize) => ({
            props: `${variant}·${controlSize}`,
            node: <Combobox variant={variant} controlSize={controlSize} ariaLabel={`${variant} ${controlSize}`} placeholder="선택" options={SELECT_OPTIONS} />,
          })),
        )}
      />

      <Group
        component="ToggleButton"
        items={[
          ...CONTROL_SIZES.map((controlSize) => ({
            props: `ghost·brand·${controlSize}`,
            node: <ToggleButton controlSize={controlSize} icon={<RiStarLine aria-hidden />} activeIcon={<RiStarFill aria-hidden />} aria-label={`즐겨찾기 ${controlSize}`} />,
          })),
          { props: "ghost·brand·regular·pressed", node: <ToggleButton defaultPressed icon={<RiStarLine aria-hidden />} activeIcon={<RiStarFill aria-hidden />} aria-label="즐겨찾기 켬" /> },
          { props: "ghost·custom·like·regular", node: <ToggleButton tone="custom" color="like" icon={<RiHeart3Line aria-hidden />} activeIcon={<RiHeart3Fill aria-hidden />} aria-label="좋아요" /> },
          { props: "ghost·custom·favorite·regular", node: <ToggleButton tone="custom" color="favorite" icon={<RiStarLine aria-hidden />} activeIcon={<RiStarFill aria-hidden />} defaultPressed aria-label="즐겨찾기 색" /> },
          { props: "tonal·brand·regular", node: <ToggleButton variant="tonal" icon={<RiStarLine aria-hidden />} aria-label="즐겨찾기 담기" /> },
          { props: "ghost·brand·regular·수", node: <ToggleButton count={12} icon={<RiStarLine aria-hidden />} activeIcon={<RiStarFill aria-hidden />} aria-label="즐겨찾기 수" /> },
        ]}
      />

      <Group
        component="NotificationBadge"
        items={[
          { props: "dot", node: <NotificationBadge /> },
          { props: "count·accent", node: <NotificationBadge count={5} /> },
          { props: "count·neutral", node: <NotificationBadge count={5} tone="neutral" /> },
          { props: "count·넘침", node: <NotificationBadge count={120} /> },
        ]}
      />

      <Group
        component="SelectBox"
        items={[
          {
            props: "single·radio",
            node: (
              <SelectBoxGroup ariaLabel="한 개 고르기" defaultValue="a">
                <SelectBox value="a" title="첫째" description="설명" />
              </SelectBoxGroup>
            ),
          },
          {
            props: "multiple·checkbox",
            node: (
              <SelectBoxGroup ariaLabel="여러 개 고르기" selectionMode="multiple" defaultValue={["a"]}>
                <SelectBox value="a" title="첫째" description="설명" />
              </SelectBoxGroup>
            ),
          },
          {
            props: "single·none",
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
          { props: "center", node: <div className="w-[390px]"><AppHeader title="지원요청" sticky={false} /></div> },
          { props: "start", node: <div className="w-[390px]"><AppHeader title="지원요청" titleAlign="start" sticky={false} /></div> },
          {
            props: "center·양옆",
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
            props: "bar·라벨없음",
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
            props: "bar·라벨",
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
            props: "floating·라벨없음",
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
