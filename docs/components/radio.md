# Radio

성숙도: Candidate

Radio는 목록이나 폼에서 여러 항목 중 하나를 선택한다. 확정한 16px Radio Indicator를 기준으로 Checkbox와 같은 Field·Container·Content 구조를 적용한다.

## Anatomy

### Basic anatomy

1. Field container
2. Control container: 16px 원형 외곽
3. Selection indicator: Checked에서 표시되는 8px 흰 원
4. Label

### Extended anatomy

Basic 번호는 반복하지 않고 Content container와 Optional 요소만 표시한다.

5. Content container
6. Leading element: 선택적 Slot
7. Right Description: 선택적
8. Trailing element: 선택적 Slot
9. Bottom Description: 선택적

`Radio`는 원자적인 Control, `RadioField`는 Label과 선택적 Content를 결합한다. `RadioContainer`는 기본 RadioField 전체를 `oe-border-secondary` bordered surface로 묶으며 Layout은 항상 부모 너비를 채운다.

## Properties

- `value`: Group 안에서 항목을 식별하는 필수 값
- `disabled`, `readOnly`, `required`
- `label`: Field와 Container의 필수 `ReactNode`
- `rightDescription`, `bottomDescription`
- `leadingElement`, `trailingElement`
- `layout`: `inline | block`, 기본값 `inline`
- `flipped`: Indicator를 왼쪽 또는 오른쪽에 배치

Layout, Label, Description, Leading/Trailing 배치와 Flipped 규칙은 CheckboxField와 동일하다. Leading/Trailing Anatomy는 Studio 전용 핑크 점선 Swap slot으로 표시한다. Trailing은 Label 뒤에 바로 배치하고 20px 첫 행 안에서 중앙 정렬한다.

## State

- Radio: Unchecked, Checked, Focus visible, Disabled · Unchecked, Disabled · Checked
- RadioContainer: 내부 Radio의 같은 상태를 사용
- 제공하지 않음: Parent item, Indeterminate, Ghost
- 현재 정의 없음: Loading, Error/Invalid, Hover 전용 표현

Unchecked는 `oe-background-primary`와 `oe-border-primary`를 사용한다. Checked는 Control 전체를 `oe-brand-background-bold-primary`로 채우고 중앙에 8px 흰 Indicator를 표시한다. Focus visible은 2px 간격의 2px `oe-focus-ring`을 사용한다. Disabled Checked는 `oe-background-disabled-selected` Control과 흰 Indicator를 사용한다.

RadioContainer Checked 상태는 CheckboxContainer와 같은 `brand-alpha-08` 배경과 `brand-alpha-20` border를 사용하고 Disabled Checked에는 적용하지 않는다.

RadioField의 보이는 Label은 `aria-labelledby`로 Radio Control의 접근 가능한 이름에 연결한다. Studio의 Playground와 Properties · Appearance 예시는 직접 선택할 수 있다. Properties · State는 선택값을 controlled 상태로 고정하지만 Pointer, Focus visible과 키보드 피드백은 차단하지 않는다. Disabled 예시만 실제 조작 불가 상태를 유지한다.

## Specification

- Control: 16 × 16px
- Indicator: 8 × 8px
- RadioField minimum height: 36px (`oe-control-regular`)
- Label: 14px / 20px, Regular
- RadioContainer: Full width, minimum height 64px, radius 12px, horizontal padding 16px

현재 Candidate이며 다른 Radio 사용 화면에서 재검증하기 전 Stable로 승격하지 않는다.
