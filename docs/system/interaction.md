# 상호작용 규칙

모든 공용 컴포넌트가 공유하는 Focus, Disabled, Read-only와 Layout 기본값이다.

## Focus 선과 Ring

Pointer 클릭으로 Control이 실제 DOM focus를 받을 수는 있지만, Focus 시각 표시는 `:focus-visible`을 기준으로 한다. 마우스 클릭만으로 Focus 선이나 ring을 표시하지 않고, 키보드 탐색처럼 사용자가 Focus 위치를 시각적으로 확인해야 할 때 표시한다.

표시 방식은 다음 세 유형 중 하나를 선택하며, 같은 요소에서 인접선과 분리 ring을 동시에 사용하지 않는다.

1. 기존 경계가 1px인 요소는 Focus에서 그 선을 `oe-focus-ring` 색으로 바꾸고, 경계 바로 바깥에 간격 없이 1px을 더해 총 2px 선으로 보이게 한다.
2. 선택선처럼 기존 경계가 이미 2px인 요소는 두께, 위치와 레이아웃을 바꾸지 않고 같은 2px 선의 색만 `oe-focus-ring`으로 교체한다. 선택선과 별도 Focus ring을 중첩하지 않는다.
3. 기존 경계와 분리된 Focus 표시가 필요한 요소는 기본 2px 간격을 두고 바깥에 2px ring을 그린다. 컴포넌트 구조상 별도 조정이 필요한 경우에만 간격을 2px보다 크게 할 수 있다.

## 선택 상태와 Hover·Pressed

선택된 상태에는 Hover와 Pressed 하이라이트를 중첩하지 않는다. 선택 배경이 pointer와 키보드 Hover highlight보다 우선하며, 선택된 요소 위에서 포인터를 움직이거나 누르는 동안에도 그 배경을 유지한다.

회색조 하이라이트를 선택 배경 위에 덧입히면 선택 색이 흐려져 무엇이 선택되어 있는지 알기 어려워진다. 선택되지 않은 요소에는 Hover에 `oe-interaction-hover-subtle`, Pressed에 `oe-interaction-hover`를 사용한다.

## Disabled

Outline 형태의 공용 Form control과 선택 요소는 Disabled 상태에서도 외곽선을 제거하거나 배경과 구분되지 않는 색으로 바꾸지 않는다. 구조를 인지할 수 있도록 기본 Outline border를 유지하고, Disabled 위계는 foreground와 background 및 상호작용 제한으로 표현한다. Filled 형태는 별도 Border가 없는 기존 구조를 유지한다.

Disabled는 선택값을 변경하지 않고 조작만 제한한다.

## Read-only

선택 Control의 Read-only는 Enabled와 같은 색상과 키보드 Focus를 유지하지만 값 변경 가능성을 뜻하는 Hover 배경, Hover shadow와 Pressed 피드백은 제공하지 않는다. Disabled처럼 비활성 색상이나 `not-allowed` cursor를 사용하지 않으며 Pointer·Space·방향키로 값만 변경되지 않아야 한다.

## 공통 Control Height

Button과 한 줄 Form control이 함께 사용하는 높이 기준이다. 특정 컴포넌트의 값이 아니므로 각 명세는 이 값을 다시 적지 않고 이 절을 따른다. 값은 `packages/tokens`의 `CONTROL_HEIGHTS`가 소유하고 `--spacing-oe-control-*`로 노출한다.

- XXSmall: 24px
- XSmall: 28px
- Small: 32px
- Regular: 36px
- Large: 40px
- XLarge: 48px
- XXLarge: 56px

**모든 컴포넌트가 모든 단계를 제공하지는 않는다.** 이 절은 쓸 수 있는 값의 목록이며, 어느 컴포넌트가 어느 단계를 갖는지는 각 명세가 정한다. 컴포넌트에 단계를 더할 때는 그 크기가 실제로 필요한 자리를 함께 적는다.

Checkbox, Radio, Switch는 이 높이를 직접 적용하지 않는다. Textarea는 별도 최소 높이 또는 row 정책이 필요하다. 한 줄 Form control의 기존 API는 같은 공통 Size로 정규화한다.

## 공통 Control Radius

값을 입력받거나 고르는 컨트롤이 함께 사용하는 모서리 반지름 기준이다. **8px**이며 `packages/tokens`가 `--radius-oe-control`로 소유한다. 각 명세는 값을 다시 적지 않고 이 절을 따른다.

같은 페이지에, 때로는 같은 Field 안에 나란히 놓이는 요소들이므로 모서리가 몇 픽셀만 달라도 줄이 어긋나 보인다. 그래서 단계 이름(`rounded-md` 등)을 각자 고르지 않고 컨트롤 전용 이름 하나를 공유한다. 컨트롤만 값을 조정할 일이 생겨도 한 자리에서 끝난다.

- 적용 대상: Button, Input, Input Button, Number Input, Textarea, Select, Combobox의 Container와 Chip의 `rounded`
- 적용하지 않는 것: 카드형 선택지인 Select Box, Trigger로 여는 Popup, Tooltip, Message Bubble과 첨부 카드. 컨트롤과 나란히 놓이는 요소가 아니므로 각자의 단계를 사용한다.
- Chip의 기본 모양은 `circle`이며 이 기준은 `rounded`를 골랐을 때 적용된다.

`packages/ui/src/control-radius.test.tsx`가 컨트롤들이 같은 토큰을 쓰는지 검사하고, `packages/tokens/src/index.test.ts`가 토큰 값과 `RADII` 원본의 일치를 검사한다.

## Style와 Layout 기본값

- `outline | filled` Style을 제공하는 Form control은 `outline`을 기본값으로 사용한다.
- `fill | fixed` 너비 Layout을 지원하는 한 줄 Form control의 기본값은 `fill`이다. Checkbox·Radio처럼 별도의 `inline | block` Layout 체계를 가진 선택 요소에는 이 값을 억지로 적용하지 않는다.
