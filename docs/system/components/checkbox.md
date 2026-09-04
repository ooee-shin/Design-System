# Checkbox

`packages/ui/src/checkbox.tsx`

항목의 선택 여부를 표시하고 제어한다. 선택 표현은 Brand를 사용하고 상태는 oe semantic token 규칙을 따른다.

## Anatomy

### Basic anatomy

1. Field: Control과 Content를 포함하는 전체 클릭 영역
2. Checkbox control: 선택 상태, Border와 Focus를 표시하는 16px Checkbox 본체
3. Selection indicator: Square와 Rounded의 Checked 상태에서는 Remix Check icon, Indeterminate에서는 Remix Minus icon을 표시한다. Ghost는 Check icon을 항상 표시하고 색상으로 선택 여부를 구분한다.
4. Label: 선택 항목의 필수 텍스트

### Extended anatomy

Basic 구조는 반복해 번호를 표시하지 않는다. 단일 Label과 범위가 겹쳐 보이는 Content container는 여러 텍스트 요소가 표시되는 Extended 예시에서 그룹 영역으로 설명한다.

5. Content container: Label과 선택적 Description, Leading/Trailing element를 묶는 영역
6. Leading element: Content 앞에 교체 가능한 선택적 Slot
7. Right Description: Label 우측의 선택적 설명
8. Trailing element: Content 뒤에 교체 가능한 선택적 Slot
9. Bottom Description: Label 아래의 선택적 설명

원자적인 `Checkbox`는 Control만 제공한다. `CheckboxField`는 Label, 선택적 Description과 Leading/Trailing element를 결합한다.

`CheckboxIndicator`는 Checkbox의 16px 비상호작용 시각 base다. Checked, Indeterminate와 Disabled 표현을 소유하고 `Checkbox`가 이를 내부에서 사용한다. Combobox Option처럼 상위 컴포넌트가 이미 선택 동작을 소유하는 경우에는 상호작용 가능한 Checkbox를 중첩하지 않고 `CheckboxIndicator`만 재사용한다. 값 변경, Focus와 키보드 동작은 이를 사용하는 상위 컴포넌트가 담당한다. 이 사용 가이드는 현재 첫 번째 초안이다.

Checkbox와 Label 전체를 카드형 Surface로 묶는 Container 변형은 제공하지 않는다. 짧은 항목을 밀도 있게 나열할 때는 `CheckboxField`를 사용하고, 설명이나 시각 정보가 포함된 선택지를 넓은 조작 영역에서 비교할 때는 Multiple selection의 `SelectBox`를 사용한다.

## Properties

- `checked`: `boolean`, 기본값 `false`
- `defaultChecked`: `boolean`, 기본값 `false`
- `indeterminate`: `boolean`, 기본값 `false`. Square와 Rounded에서 지원하며 Ghost에는 제공하지 않음
- `disabled`: `boolean`, 기본값 `false`. Square와 Rounded에서 지원하며 Ghost에는 제공하지 않음
- `readOnly`: `boolean`, 기본값 `false`
- `required`: `boolean`, 기본값 `false`
- `name`, `value`, `form`: native form 연결 값
- `onCheckedChange`: 선택 값 변경 callback
- `shape`: `square | rounded | ghost`, 기본값 `rounded`
- `isParent`: `boolean`, 기본값 `false`. 하위 선택 항목을 대표하거나 전체 선택을 제어하는 부모 항목의 Label에만 Semibold 적용
- `rightDescription`: `ReactNode`, Label 우측에 선택적으로 표시
- `bottomDescription`: `ReactNode`, Label 아래에 선택적으로 표시
- `leadingElement`: `ReactNode`, 텍스트 Content 앞에 표시하는 선택적 Slot
- `trailingElement`: `ReactNode`, 텍스트 Content 뒤에 표시하는 선택적 Slot
- `layout`: `inline | block`, 기본값 `inline`. `inline`은 콘텐츠 너비, `block`은 부모 너비 전체를 사용
- `flipped`: `boolean`, 기본값 `false`. `false`는 Control을 Label 왼쪽에, `true`는 오른쪽에 배치
- `checkboxClassName`: Control에만 적용하는 class다. Field에는 `className`을 사용한다

Seed Checkbox의 Label과 Shape 구조를 참고해 OOEE 컴포넌트로 대응한다. Control은 16px다. Square Indicator는 0px radius, Rounded Indicator는 4px radius이며 둘 다 10px icon을 사용한다. 박스 없이 Indicator 자체로 구분하는 Ghost icon은 15px다. Ghost는 Default · Unchecked에서도 체크 아이콘을 `oe-foreground-placeholder`로 표시하고, Checked에서 Brand foreground로 강조한다. Focus ring을 소유하는 Control은 세 Shape 모두 4px radius를 유지하므로 Square에서도 Focus ring은 각지지 않는다. CheckboxField 행은 OOEE Regular form control과 같은 최소 36px다. Control은 Label의 20px 첫 줄 안에서 수직 중앙에 오도록 2px 보정한다. 기본 Label은 Regular이며 하위 항목을 대표하는 부모 항목만 Semibold다. Indeterminate와 Disabled 상태는 Square와 Rounded에 제공하고 Ghost에는 제공하지 않는다.

CheckboxField의 전체 조작 영역은 항상 투명하며 선택 여부와 관계없이 값 변경이 가능한 Field의 Hover에만 옅은 `oe-interaction-hover-subtle`을 사용한다. 선택 상태는 Indicator의 Brand 표현으로 전달하고 Disabled와 Read only Field는 Hover 반응을 제공하지 않는다.

Checkbox Group 위에 보이는 질문이나 제목은 Field의 전체 조작 영역이 아니라 실제 Checkbox Indicator의 왼쪽 시작점에 맞춘다. 화면 또는 Surface의 20px 바깥 여백과 제목 시작점은 그대로 유지하고, CheckboxField의 8px 내부 조작 여백은 Group의 Field 배열을 왼쪽으로 8px 보정해 바깥 방향으로 확보한다. 단독 CheckboxField에는 이 Group 보정을 적용하지 않는다.

`inline`과 `block`은 모두 같은 flex layout을 유지한다. `inline`은 `fit-content`, `block`은 `width: 100%`에 해당하며 전환 시 Checkbox와 Label의 시작 위치가 바뀌지 않는다. Right와 Bottom Description은 각각 독립적인 optional slot이며 동시에 사용할 수 있다. Label과 Right Description의 첫 행은 20px 고정 높이이며 Right Description은 한 줄로 표시하고 넘치면 줄임 처리한다. Bottom Description은 상단 행 아래에 배치하고 Leading element와 같은 왼쪽 시작점을 사용한다. Right Description 유무와 관계없이 Bottom Description의 시작 위치와 control 정렬은 바뀌지 않는다.

Leading과 Trailing element는 텍스트 Content의 앞뒤에 놓이는 교체 가능한 Slot이다. 두 Slot은 optional이며 제공되지 않으면 해당 영역을 렌더링하지 않는다.

Workbench는 Leading element와 Trailing element의 독립 카드를 제공한다. Leading에는 공용 `oe-icon-small`(16px)을 참조하는 Remix Icon, Trailing에는 공용 Badge를 넣고 두 카드 모두 실제 Label과 Bottom description을 함께 표시한다. 아이콘과 Badge는 Swap content에 들어갈 수 있는 구성 예시이며 고정 요소나 기본값이 아니다.

Trailing element가 있으면 Label 또는 Right description 뒤에 바로 이어서 배치하며 남은 가로 공간의 끝으로 밀지 않는다. Trailing element는 20px Label 첫 행 안에서 수직 중앙 정렬한다. Workbench의 Leading·Trailing 사례는 Label을 Medium으로 강조하며, `자동 분배` Label 바로 뒤에 Red tonal XSmall `NEW` Badge를 표시한다.

`flipped=true`이면 Control과 Content의 순서만 반전해 Control을 오른쪽에 둔다. Label, Right Description과 Bottom Description의 내부 정렬은 그대로 유지한다.

Right와 Bottom Description은 Label보다 낮은 위계인 `oe-foreground-tertiary`를 사용한다. 이 semantic token은 `neutral-500`에 연결된다.

## State

- Rounded: Unchecked, Checked, Indeterminate, Focus visible, Disabled · Unchecked, Disabled · Checked, Read only · Checked
- Ghost: Unchecked, Checked, Focus visible. Indeterminate와 Disabled는 제공하지 않음

Square는 Rounded와 같은 상태 동작과 색상 규칙을 사용한다.

### State coverage audit

- Workbench에서 확인: Rounded의 Unchecked, Checked, Indeterminate, Focus visible, Disabled · Unchecked, Disabled · Checked
- Workbench에서 확인: Ghost의 Unchecked, Checked, Focus visible. Ghost Indeterminate와 Disabled 조합은 없음
- 실제 동작으로 지원하지만 별도 시각 차이가 없음: Required
- Pressed: 현재 CheckboxField에는 크기 또는 위치가 변하는 Pressed motion을 적용하지 않는다. Control의 상태색과 Field의 Hover 등 기존 상호작용 피드백만 유지하며, 전체 축소 효과는 모바일 공통 Motion 체계를 정할 때 다른 조작 요소와 함께 다시 검수한다.
- 현재 정의 없음: Loading
- 확인 필요: Error/Invalid. Unchecked error의 Danger border와 Checked error의 Brand/Danger 우선순위가 정해지지 않아 임의 구현하지 않음
- 확인 필요: Leading/Trailing element에 버튼과 같은 인터랙티브 요소를 허용할지 정해지지 않음. 현재는 `ReactNode` Slot만 제공하며 사용 정책을 임의로 확정하지 않음

Checked와 Indeterminate는 `oe-brand-background-bold-primary` fill과 `oe-foreground-inverse` Indicator를 사용한다. Unchecked는 `oe-background-primary`와 `oe-border-primary`를 사용한다. Disabled는 선택값을 변경하지 않고 조작만 제한한다. 비활성 미선택은 `oe-background-disabled`를 사용하되 형태가 사라지지 않도록 `oe-border-primary`를 유지한다. 비활성 선택 및 부분 선택은 `oe-background-disabled-selected` Neutral fill과 흰색 Indicator를 유지해 선택 여부를 구분한다. Focus visible은 본체와 2px 간격을 둔 2px `oe-focus-ring`을 사용한다.

## Guidelines

### Checkbox 나열하기

여러 Checkbox는 기본적으로 줄바꿈을 허용해 사용할 수 있는 너비 안에서 항목이 잘리지 않게 배치한다. 짧은 항목을 빠르게 비교해야 하는 밀도 높은 관리자 화면에서는 가로 배열을 권장한다. 세로로 나열할 때는 별도 간격을 추가하지 않고 CheckboxField의 36px 최소 높이로 클릭 영역과 수직 리듬을 확보한다. 화면 크기에 따른 배열 방향의 자동 전환은 현재 정의하지 않는다.

### Checkbox Indicator 재사용하기

상위 컴포넌트가 이미 선택 동작을 소유하는 경우 상호작용 가능한 Checkbox 전체를 중첩하지 않고 `CheckboxIndicator`만 사용한다. Indicator는 선택 상태를 시각적으로 표시하며 값 변경, Focus와 키보드 동작은 이를 사용하는 상위 컴포넌트가 담당한다.

## Behavior

Base UI Checkbox를 구현 기반으로 사용한다. Controlled와 uncontrolled 값을 지원하며 hidden input으로 native form 제출에 참여한다. CheckboxField의 보이는 Label은 `aria-labelledby`로 Control의 접근 가능한 이름에 연결한다. Label 없이 원자적인 Checkbox만 사용할 때는 소비자가 `aria-label` 또는 `aria-labelledby`를 제공해야 한다. `disabled`가 변경되어도 기존 `checked` 또는 `indeterminate` 값은 보존한다. `indeterminate`는 Square와 Rounded에서 전체 선택 여부가 혼합된 상태를 표시하며 Ghost에서는 적용하지 않는다.

Checked와 Indeterminate 값을 고정해 비교하는 경우에도 Pointer, Focus visible과 키보드 피드백은 차단하지 않는다. Disabled만 실제 조작 불가 상태를 유지한다.

## Specification

- Control: 16 × 16px
- Indicator: Square·Rounded 10 × 10px / Ghost 15 × 15px
- Label: 14px / 20px
- CheckboxField minimum height: 36px (`oe-control-regular`)
- Radius: 현재 구현값 4px
- Label weight: Regular 400 / Parent item Semibold 600
- Shape: Square / Rounded / Ghost
