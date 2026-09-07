# 토큰 체계

`oe`는 ooee가 확정한 semantic decision의 이름이다. 실제 색상 값과 Light/Dark 매핑은 `foundations/color.md`, 실행 가능한 생성 규칙의 원본은 `packages/tokens/src/index.ts`다.

## 기본 원칙

Primitive color는 별도의 `oe` scale로 복제하지 않고 Tailwind 기본 팔레트를 사용한다.

```text
neutral-*
red-*
amber-*
green-*
blue-*
```

Tailwind에 없는 브랜드 팔레트가 필요하면 `brand-*` scale을 추가할 수 있다.

- Primitive는 semantic token을 정의할 때만 사용한다. 정식 컴포넌트에서 `text-red-700`, `bg-neutral-50` 같은 primitive class를 직접 사용하지 않는다.
- `oe` prefix는 semantic token에만 사용한다. Tailwind 및 생성된 색상 palette는 primitive이며 `oe` prefix를 붙이지 않는다.
- Neutral role은 이름에서 생략한다. 일반 surface는 Neutral이며 Brand와 status는 명시된 role에서만 사용한다.
- `primary`, `secondary`는 색상 이름이 아니라 같은 property/role 안의 강조 위계다.
- `tertiary`는 실제 용례가 확인된 Neutral foreground에만 사용하며 다른 property/role로 자동 확장하지 않는다.

## Neutral semantic token

```text
oe-foreground-primary
oe-foreground-secondary
oe-foreground-tertiary
oe-foreground-disabled
oe-foreground-inverse
oe-foreground-inverse-secondary

oe-background-canvas-primary
oe-background-canvas-secondary
oe-background-primary
oe-background-secondary
oe-background-bold-primary
oe-background-disabled

oe-border-primary
oe-border-secondary
oe-border-disabled
oe-focus-ring
```

의미는 다음과 같다.

- `foreground`: 텍스트, 아이콘과 전경 SVG
- `background`: canvas와 surface
- `border`: outline과 divider의 색상
- `primary`: 해당 property 안에서 높은 기본 위계
- `secondary`: 해당 property 안에서 한 단계 낮은 위계
- `disabled`: 사용할 수 없는 상태
- `inverse`: 진한 표면 위의 범용 반전 foreground

Canvas와 컴포넌트 surface는 독립적으로 테마를 바꿀 수 있도록 분리한다. Light Neutral background는 primary에서 secondary 순으로 어두워지며, Dark에서는 이름보다 동일한 UI 역할과 계층을 유지한다. `border-primary`는 비교적 명확한 외곽이나 컨트롤 경계, `border-secondary`는 내부의 약한 divider로 정의한다.

`foreground-tertiary`는 leading icon, timestamp와 더 약한 메타 정보의 실제 용례가 확인되어 사용한다.

Placeholder는 실제 입력값과 명확히 구분하기 위해 전용 `oe-foreground-placeholder`를 사용한다. 현재 매핑은 Light `neutral-400`, Dark `neutral-500`이며 실제 입력값은 `oe-foreground-primary`를 유지한다.

## Semantic status token

```text
danger
warning
success
info
```

각 상태는 foreground, background, border와 primary/secondary 위계를 조합한다.

```text
oe-danger-foreground-primary
oe-danger-foreground-secondary
oe-danger-background-primary
oe-danger-background-secondary
oe-danger-border-primary
oe-danger-border-secondary
```

`warning`, `success`, `info`도 같은 문법을 따른다. Semantic status에서 `primary`는 같은 role/property 안에서 더 높은 강조와 대비, `secondary`는 한 단계 낮은 강조와 대비를 뜻하며 특정 Tailwind 숫자를 뜻하지 않는다. Light theme에서 `danger-foreground-primary`가 `red-800`, Dark theme에서 `red-300`에 연결될 수 있다. 이름은 역할을 나타내고 primitive 값은 테마별 구현이다.

## Opaque와 Overlay

불투명 색상을 기본값으로 보고 이름에서 별도 modifier를 생략한다. 다른 surface의 색을 투과하며 합성해야 하는 경우에만 `overlay`를 명시한다.

```text
Neutral opaque
oe-{property}-{hierarchy}

Neutral overlay
oe-{property}-overlay-{hierarchy}

Semantic opaque
oe-{role}-{property}-{hierarchy}

Semantic overlay
oe-{role}-{property}-overlay-{hierarchy}
```

`alpha`는 구현 방식이고 `overlay`는 사용 목적이므로 이름에는 `overlay`를 사용한다. 모든 토큰에 overlay variant를 미리 만들지 않고 실제로 surface 합성이 필요한 사용 사례가 확인될 때만 추가한다.

이미지나 영상 위 UI처럼 일반 surface와 본질적으로 다른 맥락이 반복되면 `media` context token을 별도로 검토한다.

```text
oe-media-foreground-primary
oe-media-background-primary
oe-media-border-secondary
```

이미지 위의 alpha border는 이미지 내용에 따라 대비가 달라질 수 있으므로 scrim, shadow 또는 이중 대비가 함께 필요할 수 있다.

## Brand primitive

- 입력한 HEX는 `brand-source`로 보존한다.
- `@material/material-color-utilities`의 HCT tonal palette를 사용한다.
- HCT tone을 `brand-50~950`에 연결한다.
- Alpha primitive는 seed RGB 기준으로 다음 값만 생성한다: `05, 08, 10, 16, 20, 30, 40, 50, 60, 70, 80, 90`.
- Alpha primitive를 컴포넌트에 남발하지 않는다.
- Primitive는 모드에 독립적이고 semantic mapping은 Light/Dark에서 달라질 수 있다.
- HCT의 Material semantic roles를 oe semantic roles로 자동 채택하지 않는다.
- Sidebar와 Chart token은 특수 목적의 shadcn token으로 유지하고 oe 공용 semantic에 흡수하지 않는다.

## 사용 규칙

- 어두운 solid brand/status 배경 위에는 공통 `oe-foreground-inverse`를 먼저 검토한다. 밝은 배경에는 대비가 확보되는 Neutral foreground를 사용한다. 반복되는 실제 예외가 생기기 전에는 `on-*` token을 만들지 않는다.
- semantic token에 이미 alpha나 강조 위계가 포함되어 있으면 컴포넌트에서 임의 opacity를 중첩해 위계를 다시 바꾸지 않는다. 추가 감쇠가 필요하면 기존 token 선택이 맞는지 먼저 확인한다.
- 폼에서 직접 조작하는 Input, Checkbox 같은 control의 식별 보더는 `oe-border-primary`를 사용한다. 여러 폼 요소나 Label을 하나의 선택·입력 영역으로 감싸는 낮은 위계의 form container는 `oe-border-secondary`를 사용한다.
- 이미지와 Color swatch처럼 콘텐츠 자체가 배경색을 갖는 값은 고정 Neutral border를 바깥에 두지 않고 내부 Black alpha layer를 중첩해 경계를 만든다.
