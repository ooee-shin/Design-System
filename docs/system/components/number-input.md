# Number Input Candidate

상태: `Candidate`

정확한 숫자를 직접 입력하거나 증감 버튼으로 조절하는 공용 컴포넌트다. 기존 `ooee_bk` V1 UI Studio의 Number Input 구현을 기능 참고자료로 사용했으며, 현재 `ooee-ui`의 Input 구조와 oe semantic token으로 다시 구현했다. 예전 구현의 `auto` Size와 `round` Shape은 현재 공식 Property에 포함하지 않았다.

실제 구현 원본은 `packages/ui/src/number-input.tsx`, 검수 화면은 `/components/number-input`이다.

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

- Style: `outline | filled`, 기본값 `outline`
- Size: `small | regular | large | xlarge`, 기본값 `regular`
- Layout: `fill | fixed`, 기본값 `fill`
- Text alignment: `left | right`, 기본값 `left`. Split controls에서는 중앙 정렬이 우선
- Value: `number | undefined`
- Range: `min`, `max`
- Step: 기본값 `1`
- Prefix / Suffix: 숫자 앞뒤에 표시하는 선택 요소, 기본값 `undefined`
- Prefix tone / Suffix tone: 각각 `secondary | tertiary`, 기본값 `secondary`
- Controls: `hideControls`, 기본값 `false`
- Controls position: `trailing | split`, 기본값 `trailing`
- Negative: `allowNegative`, 기본값 `true`
- State: Default, Focus, Invalid, Disabled, Read only

Style, Size, Layout, Focus, Invalid와 Disabled 외곽은 별도 시각 구현을 만들지 않고 공용 `Input`을 재사용한다. Filled는 Neutral secondary background를 사용하고 Focus에서는 Input과 동일하게 기본 surface로 전환한다.

Number Input의 숫자는 항상 `tabular-nums`를 사용한다. 증감 Controls가 필요 없는 숫자 입력도 별도 Input의 `numeric` Property를 만들지 않고 `hideControls=true`인 Number Input으로 표현한다.

Disabled는 foreground와 background 위계를 낮추고 상호작용을 제한하되, Outline 스타일에서는 기본 Neutral border를 유지한다. Filled 스타일은 기존의 투명 border 구조를 유지한다.

`allowNegative=false`일 때 유효한 최소값은 `min`과 `0` 중 큰 값이다. 직접 입력과 증감 버튼 모두 이 최소값과 `max` 범위 안으로 제한한다. Studio Playground에서 Allow negative를 켜면 Min이 음수 범위로 전환되어 0 아래로 감소할 수 있다. 증감 시도값이 범위를 넘으면 경계값을 유지하고 `onLimitReached`에 `min | max`를 전달한다.

`prefix`와 `suffix`는 공용 Input의 동일한 Slot을 재사용하며 숫자의 앞뒤에 통화 기호, 비율, 단위처럼 값의 의미를 보완하는 짧은 요소를 표시한다. `prefixTone`과 `suffixTone`은 서로 독립적으로 Secondary 또는 Tertiary foreground 위계를 선택하며 기본값은 Secondary다. Percentage 예시는 `%` Suffix를 사용한다.

`controlsPosition=trailing`은 Decrease와 Increase button을 숫자 오른쪽에 함께 배치한다. `split`은 Decrease button을 왼쪽, Increase button을 오른쪽에 배치하고 숫자를 중앙 정렬한다. `hideControls=true`이면 두 버튼을 모두 표시하지 않고 숫자 직접 입력만 제공한다. 현재 값이 유효한 Min에 도달하면 Decrease button, Max에 도달하면 Increase button을 비활성화한다. Number Input 전체가 Disabled 또는 Read only이면 두 버튼을 함께 비활성화한다.

Small, Regular와 Large에서 버튼 터치 영역은 24px이다. XLarge에서는 외곽 높이에 맞춰 각 버튼을 32px로 키우고, 두 버튼을 오른쪽에 함께 표시할 때 버튼 사이 간격을 4px로 확대한다. 아이콘 자체는 공용 Small 16px을 유지한다.

## 확인된 예시

- Quantity: 1–99 범위, Step 1
- Percentage: 0–100 범위, Step 5
- Direct input: Controls 숨김
- Negative allowed: 음수 범위와 감소 동작 허용

연속적인 넓은 범위를 탐색하는 Slider 사용 정책은 아직 Number Input의 공식 Usage 규칙으로 확정하지 않았다.
