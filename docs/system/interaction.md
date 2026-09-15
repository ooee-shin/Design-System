# 상호작용 규칙

모든 공용 컴포넌트가 공유하는 Focus, Disabled, Read-only와 Style·Layout 기본값이다.

## Focus 선과 Ring

Pointer 클릭으로 Control이 실제 DOM focus를 받을 수는 있지만, Focus 시각 표시는 `:focus-visible`을 기준으로 한다. 마우스 클릭만으로 Focus 선이나 ring을 표시하지 않고, 키보드 탐색처럼 사용자가 Focus 위치를 시각적으로 확인해야 할 때 표시한다.

표시 방식은 다음 세 유형 중 하나를 선택하며, 같은 요소에서 인접선과 분리 ring을 동시에 사용하지 않는다.

1. 기존 경계가 1px인 요소는 Focus에서 그 선을 `oe-focus-ring` 색으로 바꾸고, 경계 바로 바깥에 간격 없이 1px을 더해 총 2px 선으로 보이게 한다.
2. 선택선처럼 기존 경계가 이미 2px인 요소는 두께, 위치와 레이아웃을 바꾸지 않고 같은 2px 선의 색만 `oe-focus-ring`으로 교체한다. 선택선과 별도 Focus ring을 중첩하지 않는다.
3. 기존 경계와 분리된 Focus 표시가 필요한 요소는 기본 2px 간격을 두고 바깥에 2px ring을 그린다. 컴포넌트 구조상 별도 조정이 필요한 경우에만 간격을 2px보다 크게 할 수 있다.

## 오류와 Focus가 겹칠 때

오류가 있는 Control에 커서가 가면 Focus 색이 아니라 오류 색을 유지한다. Focus 색으로 덮으면 고치려고 들어간 순간에 그 칸이 틀렸다는 표시가 사라진다.

- 선의 두께와 위치는 Focus 규칙 그대로 두고 색만 `oe-danger-border-primary`로 유지한다. 커서가 어디에 있는지는 다른 칸과 달라진 선 자체가 이미 알린다.
- 오류를 지우는 것은 Focus가 아니라 값이 고쳐졌다는 판단이다.

## 선택 상태와 Hover·Pressed

선택된 상태에는 Hover와 Pressed 하이라이트를 중첩하지 않는다. 선택 배경이 pointer와 키보드 Hover highlight보다 우선하며, 선택된 요소 위에서 포인터를 움직이거나 누르는 동안에도 그 배경을 유지한다.

회색조 하이라이트를 선택 배경 위에 덧입히면 선택 색이 흐려져 무엇이 선택되어 있는지 알기 어려워진다. 선택되지 않은 요소에는 Hover에 `oe-interaction-hover-subtle`, Pressed에 `oe-interaction-hover`를 사용한다.

## Disabled

Outline 형태의 공용 Form control과 선택 요소는 Disabled 상태에서도 외곽선을 제거하거나 배경과 구분되지 않는 색으로 바꾸지 않는다. 구조를 인지할 수 있도록 Outline border를 유지하고, Disabled 위계는 foreground와 background 및 상호작용 제한으로 표현한다. Filled 형태는 별도 Border가 없는 기존 구조를 유지한다.

**남기는 것은 선이지 그 색이 아니다.** 경계에 tone 색을 쓰는 컴포넌트는 Disabled에서 그 색을 걷어내고 `oe-border-primary`로 바꾼다. 유채색 경계는 누를 수 있다는 신호이므로 꺼진 요소에 남기지 않으며, 바꾼 뒤의 모습이 Disabled Input과 같아 한 폼 안에 나란히 놓인 요소들이 함께 꺼져 보인다.

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

## Style 기본값

- `outline | filled` Style을 제공하는 Form control은 `outline`을 기본값으로 사용한다.

## 나란히 선 버튼 사이

버튼을 나열할 때 사이 간격은 `6px`이다. 한 자리에 선 버튼들은 함께 고르는 선택지라 하나의 묶음으로 읽혀야 하고, 그러려면 버튼 안쪽의 좌우 여백보다 사이가 좁아야 한다. 저장 옆의 취소, 목록 위의 등록과 내려받기가 여기에 해당한다.

성격이 다른 버튼을 가를 때는 이 간격을 벌리지 않고 자리를 나눈다. 같은 줄의 왼쪽과 오른쪽으로 보내거나, 사이에 빈 자리를 둔다. 같은 묶음 안에서 간격만 넓히면 어디까지가 한 묶음인지 읽히지 않는다.

아이콘만 있는 버튼이 하나의 도구 모음으로 서는 자리는 여기에 들지 않는다. 그때는 서로 붙여 한 덩이로 만든다.

## 글자만 있는 링크의 위계

지금 화면에서 할 일이 아니라 다른 화면으로 나가는 글자 링크는 `oe-foreground-tertiary`를 쓴다. 로그인 화면 아래의 아이디 찾기·비밀번호 찾기·회원가입이 그런 자리다.

- 본문과 같은 색으로 세우지 않는다. 같은 무게로 서면 이 화면에서 무엇을 해야 하는지가 흐려진다.
- Hover에서는 밑줄만 붙이고 글자색은 바꾸지 않는다. 색까지 바뀌면 한 줄에 놓인 링크들의 위계가 포인터를 올리는 동안 뒤집힌다.
- 이 화면에서 해야 할 일과 같은 무게로 세워야 하는 링크라면 색을 올리기 전에 Button의 `ghost` variant가 맞는 자리인지 먼저 따진다.

## 화면 좌우 여백

화면 안쪽의 좌우 여백은 화면마다 숫자를 적지 않고 두 단계 중 하나를 고른다. 값은 `packages/tokens`의 `PADDINGS`가 소유하며 `--spacing-oe-padding-*`으로 노출된다.

- `default` 16px: 모바일 구간의 기본값이다. 좁은 폭에서는 내용이 설 자리가 먼저이므로 여백을 벌리지 않는다.
- `wide` 40px: 태블릿 분기점(`md`, 768px)부터 쓴다. 로그인처럼 한 덩이만 놓여서 좌우 여백이 그 덩이를 강조하는 화면이 고른다.

같은 화면이 폭에 따라 두 값을 오간다. 앱 화면은 최소 280px까지 좁아지므로, 그 폭에서 좌우로 40px씩 물러서면 한 줄에 담기는 글자가 눈에 띄게 줄어든다.

## 공통 너비 Layout

너비를 다루는 Layout은 하나의 축이며 값은 셋이다. 각 명세는 이름을 새로 짓지 않고 이 절의 값을 쓰며, 어느 값을 제공하는지만 정한다.

- `hug`: 내용에 맞춘 너비를 쓴다.
- `fill`: 부모가 제공하는 너비를 채운다.
- `fixed`: 함께 넘긴 값으로 너비를 고정하되 부모보다 넓어지지 않는다.

**모든 컴포넌트가 세 값을 다 제공하지는 않는다.** 한 줄 Form control은 `hug`를 제공하지 않는다. 입력값에 따라 외곽 너비가 달라지면 같은 폼 안의 줄이 어긋나기 때문이며, 기본값은 `fill`이다. Textarea처럼 이 Property를 받지 않고 언제나 부모 너비를 채우는 컴포넌트도 있다. Button과 Checkbox·Radio는 `hug`가 기본값이고 `fixed`를 제공하지 않는다.

`inline`과 `block`은 쓰지 않는다. CSS `display` 값과 이름이 겹치는데 뜻이 다르기 때문이다. 이 값들이 바꾸는 것은 `display`가 아니라 너비뿐이며, 전환해도 Control과 Label의 시작 위치는 그대로 유지된다. `packages/ui/src/layout-vocabulary.test.tsx`가 컴포넌트들이 같은 이름을 쓰는지 검사한다.
