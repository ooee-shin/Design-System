# Select

`packages/ui/src/select.tsx`

검색 없이 짧은 옵션 목록에서 하나 또는 여러 값을 선택하는 한 줄 Form control이다. 동작은 Base UI Select를 기반으로 하고 Trigger 외관은 Combobox와 공용 `selectionTriggerVariants` recipe를 공유한다.

## 역할과 경계

- Select는 미리 정의된 짧은 목록에서 하나 또는 여러 값을 선택한다.
- Content container 내부 Search input을 제공하지 않는다.
- 다중 선택 결과는 Trigger 한 줄에서 대표값과 나머지 개수 또는 전체 개수로 요약한다.
- 선택값 전체를 별도 영역에 표시해 검색·삭제·편집하는 Container, 선택 Chip, 전체 선택과 2-depth 탐색은 Combobox가 담당한다.
- 선택지를 화면에 펼쳐 놓고 설명이나 시각 정보를 계속 비교해야 하면 Select Box를 사용한다.
- Label, Helper text와 Error message는 이후 별도 Field가 소유한다.

## Anatomy · Select structure

1. Container: 현재 값을 표시하고 Content container를 여는 실제 Trigger
2. Value / Placeholder
3. Trigger icon: Remix `RiArrowDownSLine`
4. Content container: Base UI 구현에서는 `Popup` primitive를 사용
5. Group: 관련 Option을 묶는 선택적 단위
6. Group label

Select는 Trigger와 Content container로 구성된다. Content 안의 관련 Option은 Group으로 묶으며 Group 사이에만 Divider를 표시한다. Trigger는 현재 선택값 또는 Placeholder, 선택적인 Leading element와 열림 상태를 나타내는 Chevron을 포함한다. Content container는 Trigger와 같은 너비와 좌우 시작점을 사용한다.

## Anatomy · Option

1. Option
2. Leading element: Trigger와 Option에 표시할 수 있는 선택 요소
3. Item label
4. Item description: 열린 Content에서만 표시하는 선택 요소

Selected indicator는 구조 설명에서 제외하고 `Properties · State`의 Selected option 사례에서 확인한다.

Option은 Content container 안의 선택 항목이다. 같은 목록에서 Leading element를 사용하면 모든 Option에 같은 영역을 유지하며, Leading element는 Label과 Description 전체 블록을 기준으로 수직 중앙 정렬한다. Item description은 Trigger 선택값에 표시하지 않는다.

## Properties

- `variant`: `outline | filled`, 기본값 `outline`
- `controlSize`: `small | regular | large | xlarge`, 기본값 `regular`
- `layout`: `fill | fixed`, 기본값 `fill`
- `fixedWidth`: Fixed에서 사용하는 CSS width
- `options`: 평면 `{ value, label, disabled?, leadingElement?, description? }[]`
- `groups`: `{ label, options }[]`. `options`와 `groups` 중 하나만 전달
- `leadingElement`: 선택값에 별도 Leading element가 없을 때 Trigger에 표시하는 fallback 요소
- `value | defaultValue`: 선택한 Option value 또는 `null`
- `MultiSelect.value | defaultValue`: 선택한 Option value 배열
- `MultiSelect.valueDisplay`: `summary | count`, 기본값 `summary`
- `MultiSelect.selectedSummaryLabel`: 대표값과 나머지 개수의 언어별 표기
- `MultiSelect.selectedCountLabel`: 선택한 전체 개수의 언어별 표기
- `placeholder`: 선택값이 없을 때 표시하는 문자열
- `disabled`: Select 전체 상호작용 제한
- `readOnly`: 현재 값 변경 제한
- `invalid`: 오류 상태 표시
- `required`, `name`: native form 연결 속성

Control height는 Input과 Button이 공유하는 Small 32px, Regular 36px, Large 40px, XLarge 48px를 사용한다. Outline Disabled에서도 외곽 border를 유지한다.

## Behavior

### Interaction

- Trigger를 누르면 Content container가 열린다.
- 방향키로 Option을 이동하고 Enter 또는 Space로 선택한다.
- Select는 Option을 선택하면 값이 변경되고 Content container가 닫힌다.
- MultiSelect는 이미 선택한 Option을 다시 고르면 해제하며, 여러 값을 이어서 고를 수 있도록 선택 후에도 Content container를 열린 상태로 유지한다.
- Escape 또는 외부 클릭으로 Content container를 닫는다.
- Disabled Option은 선택할 수 없다.

### Selection display

- MultiSelect의 `summary`는 가장 먼저 선택한 대표값과 그 값을 제외한 나머지 개수를 표시한다.
- MultiSelect의 `count`는 대표값 없이 선택한 전체 개수만 표시한다.
- 선택된 Option은 별도 배경과 Label 색상 변경 없이 Neutral label의 Medium 굵기와 `oe-brand-foreground-primary` Check indicator로 표시한다.
- 선택된 Option에는 Hover highlight를 중첩하지 않는다.

### Content structure

- Group을 사용하면 Group label과 Option 묶음을 표시하고 Group 사이에 Divider를 자동 배치한다.
- Content container는 Trigger와 같은 너비와 좌우 시작점을 사용한다. Base UI의 선택 Item 중심 정렬은 사용하지 않는다.
- Leading element에는 Icon, Badge, Avatar처럼 Option을 식별하는 요소를 둔다. 한 줄 Control의 높이를 바꾸지 않는 크기를 유지하고, 같은 목록에서는 종류를 섞지 않는다.
- Leading element를 사용하면 Trigger와 Content container의 Leading 열 시작점을 동일하게 맞춘다.
- 선택한 Option에 Leading element가 있으면 Trigger에도 같은 요소를 표시한다. 선택 Option에 없으면 Select의 fallback `leadingElement`를 표시한다.
- 같은 Group에서 Leading element를 사용하면 모든 Option에 같은 Leading 영역을 제공한다. Group마다 다른 요소를 사용할 수 있지만 같은 Group 안의 일부 Option만 Leading element를 생략하지 않는다.
- Item description은 열린 Content에서 Label 아래에만 표시하고 Trigger 선택값에는 포함하지 않는다.

### Content height

- Popup은 주변에 남은 공간과 320px 중 작은 높이로 제한된다. Option 목록이 248px보다 짧으면 Option을 담는 높이만큼만 열리고, 이를 넘으면 최대 248px에서 Content 안쪽 세로 스크롤을 사용한다. 마지막 Option의 글자를 일부 읽을 수 있을 만큼 Content container의 하단 경계에서 노출해 스크롤 가능성을 알린다. 이 경계에는 별도 하단 내부 여백을 두지 않는다. Scrollbar 공간은 유지하고 thumb은 Hover에서 표시한다.

## Guidelines

- Select는 항상 Field Label과 함께 사용해 선택 이후에도 값의 의미를 알 수 있게 한다. 값을 선택하면 사라지는 Placeholder로 Field Label을 대신하지 않는다.
- 다중 선택 결과는 목록 성격에 따라 대표값과 나머지 개수 또는 전체 개수로 요약한다.
- 대표값과 나머지 개수는 값마다 의미가 뚜렷해 첫 선택값이 단서가 되는 목록에 사용한다. 표시 개수에는 대표값을 제외한다.
- 전체 개수는 값들이 서로 동등하거나 Trigger 너비가 좁아 대표값이 도움이 되지 않는 목록에 사용한다.
- 선택값을 모두 펼쳐 보고 개별 삭제·검색·편집해야 하면 Combobox를 사용한다.
- 선택 항목의 설명이나 시각 정보를 계속 노출해 비교해야 하면 Select Box를 사용한다. 짧은 키워드를 유연하게 나열해 선택하거나 필터링하면 Chip을 사용한다.
- 다중 선택에서는 다른 Option의 선택 상태를 바꾸는 Option을 두지 않는다.
- 나머지 선택을 모두 바꾸는 `전체 선택`이나 `없음` Option을 추가하지 않는다. 전체 선택이 자주 필요하면 Checkbox의 부모-자식 패턴을 사용한다.
- Do: Leading element는 Group마다 다르게 구성할 수 있지만 같은 Group 안에서는 모든 Option에 동일한 Leading 영역을 유지한다.
- Don't: 같은 Group 안의 일부 Option에만 Leading element를 표시하지 않는다.
- Do: Trigger에는 선택된 Item label만 표시하고 Item description은 열린 Content에서 확인한다.
- Don't: Item description을 Trigger에 함께 표시해 한 줄 Control의 높이와 정보 위계를 바꾸지 않는다.
- 목록은 사용자가 훑는 흐름에 맞춰 사용 빈도, 크기, 시간처럼 이미 존재하는 기준 하나로 일관되게 정렬한다.
- 성격이나 정렬 기준이 다른 Option은 별도 Group으로 묶어 경계를 드러낸다.
- Item label은 명사형으로 짧고 명확하게 작성하며 같은 목록에서 어휘, 길이와 톤을 일관되게 유지한다. 부연 정보는 Item description으로 분리한다.
- Placeholder는 고를 값의 종류를 알 수 있게 작성하며 Field label을 그대로 반복하지 않는다.
- Field label을 통해 한 개를 고르는지 여러 개를 고르는지 안내한다. 선택 가능 개수가 정해져 있다면 `담당자 선택 (1명)`, `관심 지역 선택 (최대 3개)`처럼 Label에 함께 표시한다.
- 단일 선택에서 `없음`이 유효한 답이라면 이를 명시하는 Option을 제공하고 선택 완료로 처리한다. Item label은 `담당자 없음`처럼 질문의 핵심을 포함하며, 목록 처음이나 마지막의 별도 Group으로 분리한다.

## 현재 정의하지 않은 항목

- Option 안에서 따로 조작되는 요소를 Leading element로 허용하는 정책
- Trailing element와 Option image
- Clear button
- 검색과 자유 입력
- 모바일에서 별도 Bottom Sheet로 전환하는 정책
- Content container 최대 높이의 제품별 기준
- Field API
