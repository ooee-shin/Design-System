# Checkbox

성숙도: Candidate

Checkbox는 항목의 선택 여부를 표시하고 제어한다. Combobox의 다중 선택 사례에서 확인한 구조를 공용 UI로 추출한 뒤 OOEE의 Brand 선택 표현과 상태 규칙으로 정리했다.

## Anatomy

1. Field container: Control과 Content를 포함하는 전체 클릭 영역
2. Control: 선택 상태, Border와 Focus를 표시하는 16px Checkbox 본체
3. Indicator: Square의 Checked 상태에서는 Remix Check icon, Indeterminate에서는 Remix Minus icon을 표시한다. Ghost는 Check icon을 항상 표시하고 색상으로 선택 여부를 구분한다.
4. Leading element: Content 앞에 교체 가능한 선택적 Slot
5. Content: Label과 선택적 Description을 묶는 영역
6. Label: 선택 항목의 필수 텍스트
7. Right description: Label 우측의 선택적 설명
8. Trailing element: Content 뒤에 교체 가능한 선택적 Slot
9. Bottom description: Label 아래의 선택적 설명

원자적인 `Checkbox`는 Control만 제공한다. `CheckboxField`는 Label, 선택적 Description과 Leading/Trailing element를 결합한다.

`CheckboxContainer`는 기본 Square `CheckboxField` 전체를 하나의 클릭 가능한 bordered surface로 묶는다. 별도의 Shape 속성을 제공하지 않으며 내부 상태와 콘텐츠 규칙은 `CheckboxField`를 그대로 사용한다. Layout은 항상 부모 너비를 채운다. Form container 공통 규칙에 따라 Control의 `oe-border-primary`보다 낮은 위계인 `oe-border-secondary`를 사용한다.

## Properties

- `checked`: `boolean`, 기본값 `false`
- `defaultChecked`: `boolean`, 기본값 `false`
- `indeterminate`: `boolean`, 기본값 `false`. Square에서만 지원하며 Ghost에는 제공하지 않음
- `disabled`: `boolean`, 기본값 `false`. Square에서만 지원하며 Ghost에는 제공하지 않음
- `readOnly`: `boolean`, 기본값 `false`
- `required`: `boolean`, 기본값 `false`
- `name`, `value`, `form`: native form 연결 값
- `onCheckedChange`: 선택 값 변경 callback
- `shape`: `square | ghost`, 기본값 `square`
- `isParent`: `boolean`, 기본값 `false`. 하위 선택 항목을 대표하거나 전체 선택을 제어하는 부모 항목의 Label에만 Semibold 적용
- `rightDescription`: `ReactNode`, Label 우측에 선택적으로 표시
- `bottomDescription`: `ReactNode`, Label 아래에 선택적으로 표시
- `leadingElement`: `ReactNode`, 텍스트 Content 앞에 표시하는 선택적 Slot
- `trailingElement`: `ReactNode`, 텍스트 Content 뒤에 표시하는 선택적 Slot
- `layout`: `inline | block`, 기본값 `inline`. `inline`은 콘텐츠 너비, `block`은 부모 너비 전체를 사용
- `flipped`: `boolean`, 기본값 `false`. `false`는 Indicator를 왼쪽에, `true`는 오른쪽에 배치

Seed Checkbox의 Label과 Shape 구조를 참고해 OOEE Candidate로 대응한다. Control은 16px다. Square Indicator는 10px, 박스 없이 Indicator 자체로 구분하는 Ghost는 15px다. Ghost는 Default · Unchecked에서도 체크 아이콘을 `oe-foreground-placeholder`로 표시하고, Checked에서 Brand foreground로 강조한다. CheckboxField 행은 OOEE Regular form control과 같은 최소 36px다. Control은 Label의 20px 첫 줄 안에서 수직 중앙에 오도록 2px 보정한다. 기본 Label은 Regular이며 하위 항목을 대표하는 부모 항목만 Semibold다. Shape은 Square와 Ghost를 제공한다. Indeterminate와 Disabled 상태는 Square에만 제공하고 Ghost에는 제공하지 않는다.

`inline`과 `block`은 모두 같은 flex layout을 유지한다. `inline`은 `fit-content`, `block`은 `width: 100%`에 해당하며 전환 시 Checkbox와 Label의 시작 위치가 바뀌지 않는다. Right와 Bottom Description은 각각 독립적인 optional slot이며 동시에 사용할 수 있다. Label과 Right Description의 첫 행은 20px 고정 높이이며 Right Description은 한 줄로 표시하고 넘치면 줄임 처리한다. Bottom Description은 상단 행 아래에 배치하고 Leading element와 같은 왼쪽 시작점을 사용한다. Right Description 유무와 관계없이 Bottom Description의 시작 위치와 control 정렬은 바뀌지 않는다.

Leading과 Trailing element는 텍스트 Content의 앞뒤에 놓이는 교체 가능한 Slot이다. 두 Slot은 optional이며 제공되지 않으면 해당 영역을 렌더링하지 않는다. Anatomy의 핑크색 점선은 실제 제품 스타일이 아니라 교체 가능한 Slot 영역을 설명하는 Studio 전용 표시다.

Workbench는 기존 CheckboxContainer 상태 예시와 별도로 Leading element와 Trailing element의 독립 카드를 제공한다. Leading에는 공용 `oe-icon-small`(16px)을 참조하는 Remix Icon, Trailing에는 공용 Badge를 넣고 두 카드 모두 실제 Label과 Bottom description을 함께 표시한다. 아이콘과 Badge는 Swap content에 들어갈 수 있는 구성 예시이며 CheckboxContainer의 고정 요소나 기본값이 아니다.

Trailing element가 있으면 Label 또는 Right description 뒤에 바로 이어서 배치하며 남은 가로 공간의 끝으로 밀지 않는다. Trailing element는 20px Label 첫 행 안에서 수직 중앙 정렬한다. Workbench의 Leading·Trailing 사례는 Label을 Medium으로 강조하며, `자동 분배` Label 바로 뒤에 Red tonal XSmall `NEW` Badge를 표시한다.

`flipped=true`이면 Indicator와 Content의 순서만 반전해 Indicator를 오른쪽에 둔다. Label, Right Description과 Bottom Description의 내부 정렬은 그대로 유지한다. CheckboxContainer도 같은 `flipped` 속성을 사용한다.

Right와 Bottom Description은 Label보다 낮은 위계인 `oe-foreground-tertiary`를 사용한다. 이 semantic token은 `neutral-500`에 연결된다.

## State

- Square: Unchecked, Checked, Indeterminate, Focus visible, Disabled · Unchecked, Disabled · Checked
- Ghost: Unchecked, Checked, Focus visible. Indeterminate와 Disabled는 제공하지 않음
- CheckboxContainer: 내부 기본 Square Checkbox의 Unchecked, Checked, Focus visible, Disabled 상태를 그대로 사용

### State coverage audit

- Workbench에서 확인: Square의 Unchecked, Checked, Indeterminate, Focus visible, Disabled · Unchecked, Disabled · Checked
- Workbench에서 확인: Ghost의 Unchecked, Checked, Focus visible. Ghost Indeterminate와 Disabled 조합은 없음
- Workbench에서 확인: CheckboxContainer가 기본 Square Checkbox 상태를 그대로 사용하는 Unchecked, Checked, Focus visible, Disabled · Unchecked, Disabled · Checked
- 실제 동작으로 지원하지만 별도 시각 차이가 없음: Read-only, Required
- 일부 구현: Pressed는 현재 `active` 표현이 있으나 Hover 전용 표현은 아직 정의하지 않음
- 현재 정의 없음: Loading
- 확인 필요: Error/Invalid. Unchecked error의 Danger border와 Checked error의 Brand/Danger 우선순위가 정해지지 않아 임의 구현하지 않음
- 확인 필요: Leading/Trailing element에 버튼과 같은 인터랙티브 요소를 허용할지 정해지지 않음. 현재는 `ReactNode` Slot만 제공하며 사용 정책을 임의로 확정하지 않음

Checked와 Indeterminate는 `oe-brand-background-bold-primary` fill과 `oe-foreground-inverse` Indicator를 사용한다. Unchecked는 `oe-background-primary`와 `oe-border-primary`를 사용한다. Disabled는 선택값을 변경하지 않고 조작만 제한한다. 비활성 미선택은 `oe-background-disabled`를 사용하되 형태가 사라지지 않도록 `oe-border-primary`를 유지한다. 비활성 선택 및 부분 선택은 `oe-background-disabled-selected` Neutral fill과 흰색 Indicator를 유지해 선택 여부를 구분한다. Focus visible은 본체와 2px 간격을 둔 2px `oe-focus-ring`을 사용한다.

CheckboxContainer는 별도의 선택 control이나 상태 로직을 만들지 않는다. 기본 Square Checkbox와 CheckboxField를 전체 클릭 영역으로 감싸고, 내부 Checkbox의 Checked·Focus·Disabled 상태를 그대로 사용한다. Container의 Checked 상태에만 옅은 Brand 배경과 border가 추가된다.

## Behavior

Base UI Checkbox를 구현 기반으로 사용한다. Controlled와 uncontrolled 값을 지원하며 hidden input으로 native form 제출에 참여한다. `disabled`가 변경되어도 기존 `checked` 또는 `indeterminate` 값은 보존한다. `indeterminate`는 Square에서 전체 선택 여부가 혼합된 상태를 표시하며 Ghost에서는 적용하지 않는다.

## Specification

- Control: 16 × 16px
- Indicator: Square 10 × 10px / Ghost 15 × 15px
- Label: 14px / 20px
- CheckboxField minimum height: 36px (`oe-control-regular`)
- Radius: 현재 구현값 4px
- Label weight: Regular 400 / Parent item Semibold 600
- Shape: Square / Ghost
- CheckboxContainer: Full width, minimum height 64px, 12px radius, `oe-background-primary`, `oe-border-secondary`, horizontal padding 16px

CheckboxContainer의 활성화된 Checked 상태는 Brand seed 기반 `brand-alpha-08` 배경과 `brand-alpha-20` border를 사용한다. Disabled · Checked에는 이 활성 표현을 적용하지 않는다. 두 alpha 값은 현재 Checkbox Container에서 검수 중인 primitive Candidate이며 공용 semantic token으로 확정하지 않았다.

현재 Brand alpha CSS 변수는 Studio의 Brand theme 초기화에서 제공한다. CheckboxContainer를 Studio 밖의 앱에서 사용할 때도 같은 활성 표현을 보장하려면 Brand primitive와 semantic 변수 초기화 책임을 공용 package 또는 소비 앱의 theme bootstrap 중 어디에 둘지 결정해야 한다.

현재 첫 공용 추출 단계이므로 Candidate다. 다른 폼과 목록에서 재검증하기 전 Stable로 승격하지 않는다.

현재 Studio 상세 화면은 검수를 완료했다. `Layout`, `Flipped`, `Description`은 별도 Property 카드를 추가하지 않고 Playground, Anatomy와 Property map에서 확인한다. Error/Invalid, Hover 전용 표현과 Brand alpha 초기화 책임처럼 문서에 명시된 열린 결정은 Candidate 후속 검토로 유지하며 현재 화면 완료 범위에 포함하지 않는다.
