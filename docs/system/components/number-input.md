# Number Input

`packages/ui/src/number-input.tsx`

정확한 숫자를 직접 입력하거나 증감 버튼으로 조절하는 공용 컴포넌트다. Input의 구조와 oe semantic token을 사용한다.

## Anatomy

1. Container: Input과 동일한 외곽, Style, Size와 상태를 소유한다.
2. Prefix: 선택 요소다. 숫자 앞에 짧은 기호나 단위를 표시한다.
3. Input field: 숫자를 직접 입력하는 필수 요소다.
4. Suffix: 선택 요소다. 숫자 뒤에 짧은 기호나 단위를 표시한다.
5. Decrease button: 선택 요소다. 현재 값에서 `step`만큼 감소한다.
6. Increase button: 선택 요소다. 현재 값에서 `step`만큼 증가한다.

증감 버튼은 Remix Icon의 Subtract/Add Line을 사용하며 공용 Small 16px 아이콘 토큰을 참조한다.

증감 버튼은 Hover와 keyboard Focus에서 Bottom center 툴팁을 표시한다. 국문 툴팁은 짧은 의미명 `감소 / 증가`, 접근 가능한 이름은 동작 대상을 포함한 `값 줄이기 / 값 늘리기`를 사용한다.

## Properties

- `variant` (Style): `outline | filled`, 기본값 `outline`
- `controlSize` (Size): `small | regular | large | xlarge`, 기본값 `regular`
- `layout`: `fill | fixed`, 기본값 `fill`
- `textAlign` (Text alignment): `left | right`, 기본값 `left`. Split controls에서는 중앙 정렬이 우선
- `value`, `defaultValue`: `number | undefined`
- `min`, `max`: 허용 범위
- `step`: 기본값 `1`
- `prefix`, `suffix`: 숫자 앞뒤에 표시하는 선택 요소, 기본값 `undefined`
- `prefixTone`, `suffixTone`: 각각 `secondary | tertiary`, 기본값 `secondary`
- `hideControls`: 기본값 `false`
- `controlsPosition`: `trailing | split`, 기본값 `trailing`
- `allowNegative`: 기본값 `false`
- `decreaseLabel`, `increaseLabel`: 증감 버튼의 접근 가능한 이름
- `decreaseTooltip`, `increaseTooltip`: 증감 버튼의 tooltip 문구
- `onValueChange`: 값이 바뀔 때 호출한다
- `onLimitReached`: 범위 경계에 도달할 때 `min | max`를 전달한다
- State: Default, Focus, Invalid, Disabled, Read only

Style, Size, Layout, Focus, Invalid와 Disabled 외곽은 별도 시각 구현을 만들지 않고 공용 `Input`을 재사용한다. Filled는 Neutral secondary background를 사용하고 Focus에서는 Input과 동일하게 기본 surface로 전환한다.

Number Input의 숫자는 항상 `tabular-nums`를 사용한다. 증감 Controls가 필요 없는 숫자 입력도 별도 Input의 `numeric` Property를 만들지 않고 `hideControls=true`인 Number Input으로 표현한다.

Disabled는 foreground와 background 위계를 낮추고 상호작용을 제한하되, Outline 스타일에서는 기본 Neutral border를 유지한다. Filled 스타일은 기존의 투명 border 구조를 유지한다.

`allowNegative`가 기본값 `false`이므로 유효한 최소값은 `min`과 `0` 중 큰 값이다. 음수가 필요한 자리에서만 `allowNegative`를 켠다. 직접 입력과 증감 버튼 모두 이 최소값과 `max` 범위 안으로 제한한다. 증감 시도값이 범위를 넘으면 경계값을 유지하고 `onLimitReached`에 `min | max`를 전달한다.

`prefix`와 `suffix`는 공용 Input의 동일한 Slot을 재사용하며 숫자의 앞뒤에 통화 기호, 비율, 단위처럼 값의 의미를 보완하는 짧은 요소를 표시한다. `prefixTone`과 `suffixTone`은 서로 독립적으로 Secondary 또는 Tertiary foreground 위계를 선택하며 기본값은 Secondary다. Percentage 예시는 `%` Suffix를 사용한다.

`controlsPosition=trailing`은 Decrease와 Increase button을 숫자 오른쪽에 함께 배치한다. `split`은 Decrease button을 왼쪽, Increase button을 오른쪽에 배치하고 숫자를 중앙 정렬한다. `hideControls=true`이면 두 버튼을 모두 표시하지 않고 숫자 직접 입력만 제공한다. 현재 값이 유효한 Min에 도달하면 Decrease button, Max에 도달하면 Increase button을 비활성화한다. Number Input 전체가 Disabled 또는 Read only이면 두 버튼을 함께 비활성화한다.

Small, Regular와 Large에서 버튼 터치 영역은 24px이다. XLarge에서는 외곽 높이에 맞춰 각 버튼을 32px로 키우고, 두 버튼을 오른쪽에 함께 표시할 때 버튼 사이 간격을 4px로 확대한다. 아이콘 자체는 공용 Small 16px을 유지한다.

## Guidelines

### Input과 Number Input을 나눠 쓰기

계산에 쓰이는 숫자는 Number Input을 사용한다. 수량, 순서, 비율처럼 더하고 빼고 비교하는 값이다. 숫자로 보이지만 계산하지 않는 식별자는 Input을 사용한다. 전화번호, 사업자번호, 카드번호가 여기에 해당한다.

자리 구분이 필요한 값도 Input을 사용한다. Number Input은 `type="number"`라 값에 구분자를 담을 수 없어 자릿수를 눈으로 세야 하고, 이를 바꾸면 키보드 화살표 증감과 native 범위 검증과 폼 제출값을 함께 잃는다. 금액처럼 구분자를 보여야 하는 값은 Input에서 표기를 만든다.

### 증감 버튼 위치를 한 페이지에서 섞지 않기

`controlsPosition`은 `trailing`과 `split` 중 하나를 페이지 전체에서 일관되게 사용한다. 같은 화면에 두 배치가 함께 있으면 어느 버튼이 어느 값을 조절하는지 눈으로 좇기 어려워진다.

### 음수는 필요한 자리에서만 허용하기

`allowNegative`의 기본값은 `false`이므로 유효한 최소값은 0이다. 이 컴포넌트가 담당하는 수량과 순서와 비율에는 음수가 필요하지 않기 때문이다. 증감과 온도차처럼 음수가 값의 일부인 자리에서만 켠다.

### 증감 단위를 값의 성격에 맞추기

`step`의 기본값은 1이다. 값이 실제로 움직이는 단위가 다르면 페이지마다 조정한다. 수량은 1, 비율은 5나 10, 금액은 1000처럼 한 번 누를 때 의미가 있는 크기를 사용한다.

### 숫자의 의미는 Prefix와 Suffix로 보완하기

`prefix`와 `suffix`는 공용 Input의 동일한 Slot을 재사용하며 숫자의 앞뒤에 통화 기호, 비율, 단위처럼 값의 의미를 보완하는 짧은 요소를 표시한다. 통화 기호는 숫자 앞에 오므로 Prefix에 두고, 백분율과 단위는 숫자 뒤에 오므로 Suffix에 둔다.

한 줄 Control의 높이를 바꾸지 않는 짧은 요소만 둔다. Leading element와 Trailing element는 증감 버튼이 사용하므로 Number Input에서는 제공하지 않는다.

## 확인된 예시

- Quantity: 1–99 범위, Step 1
- Percentage: 0–100 범위, Step 5
- Direct input: Controls 숨김
- Negative allowed: 음수 범위와 감소 동작 허용

