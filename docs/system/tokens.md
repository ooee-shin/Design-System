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
- `tertiary`는 실제 용례가 확인된 Neutral foreground에만 사용하며 다른 property/role로 자동 확장하지 않는다. 그보다 약한 단계가 필요하면 위계 번호를 늘리지 않고 `subtle`처럼 뜻을 담은 이름을 쓴다.

## Neutral semantic token

```text
oe-foreground-primary
oe-foreground-secondary
oe-foreground-tertiary
oe-foreground-subtle
oe-foreground-placeholder
oe-foreground-disabled
oe-foreground-inverse
oe-foreground-inverse-secondary

oe-background-canvas-primary
oe-background-canvas-secondary
oe-background-primary
oe-background-secondary
oe-background-bold-primary
oe-background-control-off
oe-background-control-disabled
oe-background-disabled
oe-background-disabled-selected

oe-border-primary
oe-border-bold-primary
oe-border-secondary
oe-border-tertiary
oe-border-disabled
oe-border-visual
oe-focus-ring

oe-interaction-hover-subtle
oe-interaction-hover
```

의미는 다음과 같다.

- `foreground`: 텍스트, 아이콘과 전경 SVG
- `background`: canvas와 surface
- `border`: outline과 divider의 색상
- `primary`: 해당 property 안에서 높은 기본 위계
- `secondary`: 해당 property 안에서 한 단계 낮은 위계
- `tertiary`: `secondary`보다 한 단계 더 낮은 위계. 중립 위계는 여기서 끝나며 그 아래 칸을 번호로 잇지 않는다
- `bold`: background와 border에서 가장 진한 solid 단계. 강한 solid fill과 작은 면의 선택은 `background-bold-primary`로, 큰 면의 선택은 `border-bold-primary` 선으로 알린다
- `disabled`: 사용할 수 없는 상태
- `inverse`: 진한 표면 위의 범용 반전 foreground
- `visual`: 이미지와 색상 값처럼 콘텐츠 자체 위에 얹는 내부 경계. border에만 쓰며 테마 surface 색으로 바꾸지 않는다

Canvas와 컴포넌트 surface는 독립적으로 테마를 바꿀 수 있도록 분리한다. Light Neutral background는 primary에서 secondary 순으로 어두워지며, Dark에서는 이름보다 동일한 UI 역할과 계층을 유지한다. **두 경계선은 선이 무엇을 하는지로 갈린다.** `border-primary`는 선 자체가 컨트롤의 모양을 만드는 자리에 쓴다. Checkbox의 네모와 Radio의 원이 그것이며, 16px 안에서 그 선이 사라지면 고를 것이 있다는 사실 자체가 보이지 않는다. `border-secondary`는 이미 면으로 서 있는 것의 테두리와 면을 가르는 divider에 쓴다. Input과 Textarea의 상자, Select·Combobox·Select Box의 트리거, 떠 있는 Popup, 그 사이의 divider가 여기에 해당한다.

`2026-09-15`에 뒤쪽을 한 단계 옅은 `border-secondary`로 옮겼다. 폼 요소의 테두리가 한 단계 진해 보인다는 판단이었고, 그때 Checkbox와 Radio는 `border-primary`에 남겼다. 상자는 안쪽의 글자와 바탕이 이미 그것이 입력란임을 말하지만, 선택 컨트롤은 선 말고 말해 줄 것이 없기 때문이다.

`foreground-tertiary`는 leading icon, timestamp와 더 약한 메타 정보의 실제 용례가 확인되어 사용한다.

**중립 foreground의 위계는 `tertiary`에서 끝난다.** `subtle`은 그 줄을 잇는 네 번째 칸이 아니라, `tertiary`보다 약한 단계가 국소적으로 필요한 자리에만 쓰는 이름이다. 번호를 이어 붙이면 다른 property와 role에도 같은 칸을 만들려는 압력이 생기므로 위계 이름을 늘리지 않는다. 현재 매핑은 Light `neutral-400`, Dark `neutral-600`이며 BottomNavigation이 선택되지 않은 항목의 아이콘을 라벨보다 낮출 때 쓴다.

`subtle`은 `oe-foreground-disabled`와 값이 같지만 합치지 않는다. `disabled`는 꺼져서 조작할 수 없는 요소를 뜻하고 `subtle`은 켜져 있으나 위계가 낮은 요소를 뜻한다. 값이 같아도 역할이 다르면 하나로 묶지 않는다.

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
oe-danger-background-bold-primary
oe-danger-border-primary
oe-danger-border-secondary
```

`warning`, `success`, `info`도 같은 문법을 따른다. Semantic status에서 `primary`는 같은 role/property 안에서 더 높은 강조와 대비, `secondary`는 한 단계 낮은 강조와 대비를 뜻하며 특정 Tailwind 숫자를 뜻하지 않는다. Light theme에서 `danger-foreground-primary`가 `red-800`, Dark theme에서 `red-200`에 연결된다. 이름은 역할을 나타내고 primitive 값은 테마별 구현이다.

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
