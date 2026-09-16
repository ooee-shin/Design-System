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

import { Badge, Button, Checkbox, Chip, Field, Input, Select } from "@ooee/ui";

type Item = { props: string; node: React.ReactNode };

function Group({ component, items }: { component: string; items: Item[] }) {
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
          ...CONTROL_SIZES.map((controlSize) => ({
            props: `fill·brand·${controlSize}`,
            node: (
              <Button controlSize={controlSize}>버튼</Button>
            ),
          })),
          { props: "fill·brand·regular·disabled", node: <Button disabled>버튼</Button> },
        ]}
      />

      <Group
        component="Badge"
        items={BADGE_VARIANTS.flatMap((variant) =>
          BADGE_TONES.map((tone) => ({
            props: `${variant}·${tone}·medium`,
            node: (
              <Badge variant={variant} tone={tone}>
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
        ]}
      />

      <Group
        component="Chip"
        items={[
          ...CONTROL_SIZES.map((controlSize) => ({ props: `rounded·${controlSize}`, node: <Chip controlSize={controlSize}>칩</Chip> })),
          { props: "rounded·regular·active", node: <Chip active>칩</Chip> },
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
    </main>
  );
}
