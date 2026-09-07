# Combobox

`packages/ui/src/combobox.tsx`

미리 정의된 옵션을 검색하고 선택하는 컴포넌트다. `Combobox`는 단일 선택, `MultiCombobox`는 체크박스를 사용하는 다중 선택을 담당한다. 닫힌 상태는 Select trigger로 표시하고, 열면 Popup 내부의 투명한 Search input에서 옵션을 필터링한다. 동작은 Base UI Combobox의 `Input inside popup` 패턴을 기반으로 한다.

## Anatomy

1. Trigger container
2. Selected value / Placeholder
3. Trigger icon: Remix `RiArrowDownSLine`
4. Popup
5. Search input: Popup이 열렸을 때만 표시
6. Option list
7. Option: 다중 선택에서는 Checkbox를 포함
8. Select all: 다중 선택 목록 맨 위에서 전체 Option 수와 전체 선택·해제를 제공
9. Selected indicator: Remix `RiCheckLine`
10. Selected items: 다중 선택에서 선택적으로 표시하는 공용 Chip 목록
11. Empty state

## Properties

- `variant`: `outline | filled`, 기본값 `outline`
- `controlSize`: `small | regular | large | xlarge`, 기본값 `regular`
- `value`: 단일 option value 또는 `null`
- `MultiCombobox.value`: option value 배열
- `MultiCombobox.selectedSummaryLabel`: 첫 선택 label과 나머지 개수로 생략 문구를 구성
- `MultiCombobox.selectedSearchPlaceholder`: Container 타입 내부 검색의 접근 가능한 이름과 placeholder
- `MultiCombobox.removeSelectedLabel`: 선택 결과 Chip 삭제 버튼의 접근 가능한 이름 생성
- `MultiCombobox.selectAllLabel`: 전체 선택 행의 locale별 label이며 기본값은 `All`
- `disabled`: 기본값 `false`
- `invalid`: 기본값 `false`
- `options`: 선택지 배열이며 필수다
- `defaultValue`: uncontrolled 초기값
- `onValueChange`: 값이 바뀔 때 호출한다
- `placeholder`: 선택값이 없을 때 Trigger에 표시하는 문자열
- `searchPlaceholder`: Popup 내부 Search input의 placeholder
- `emptyMessage`: 검색 결과가 없을 때 표시하는 문구
- `ariaLabel`: Trigger의 접근 가능한 이름이며 필수다
- `name`: native form 연결 속성

Control height는 Input과 Button의 공통 높이인 Small 32px, Regular 36px, Large 40px, XLarge 48px를 사용한다.
Disabled는 foreground와 background 위계를 낮추고 상호작용을 제한하되, Outline 스타일에서는 기본 Neutral border를 유지한다. Filled 스타일은 기존의 투명 border 구조를 유지한다.
Popup Search input은 Single, Multiple, 2-depth가 공통 `comboboxSearchContainerVariants` recipe를 사용한다. 배경과 Border는 없으며 높이는 Small 32px로 고정한다.

## Behavior

- Trigger를 누르면 Popup을 열고 Search input에 focus한다.
- Search input 입력으로 미리 정의된 옵션을 필터링한다.
- `Combobox`에서 Option을 선택하면 단일 값이 변경되고 Popup이 닫힌다.
- `MultiCombobox`에서 Option을 선택하면 배열 값이 변경되며 추가 선택을 위해 Popup을 유지한다.
- 다중 선택 목록 맨 위의 `전체 N`은 disabled가 아닌 전체 Option 수를 표시한다. `N`은 레이블과 4px 간격을 두고 `oe-foreground-tertiary`로 낮춰 표시하며, 행을 누르면 전체 선택 또는 전체 해제한다.
- 선택된 Option은 check indicator로 표시한다.
- 전체 선택 행의 label은 Checkbox의 Parent item과 같은 Semibold 600을 사용한다. 나머지 Option label은 Regular 400이다.
- 선택·활성 상태의 Option, 전체 선택 행과 2-depth Checkbox 행에는 별도의 Hover 배경을 중첩하지 않는다.
- 단일 선택에서 선택된 Option의 Check icon은 `oe-brand-foreground-primary`, 행 배경은 현재 Brand alpha primitive `brand-alpha-08`을 사용한다. 선택 배경은 pointer/keyboard Hover highlight보다 우선한다. 다중 선택 Checkbox는 기존 Neutral 스타일을 유지한다.
- Popup Option 행의 배경은 scrollbar 폭까지 확장해 Search input과 가로 범위를 맞춘다.
- 다중 선택은 첫 번째 선택 label과 나머지 개수를 `서울특별시 외 2곳`처럼 Trigger에 표시하고, 아래의 별도 선택 영역 Container 안에 공용 Chip을 전부 표시한다. Container는 끌 수 없다. 선택한 값을 계속 보면서 개별로 빼는 것이 Combobox의 역할이기 때문이다.
- Container는 외곽 Border 없이 Neutral secondary background로만 구분한다.
- Container 상단의 내부 검색은 공용 Input의 Filled 타입을 사용하고 선택된 Chip만 필터링하며 실제 선택값을 바꾸지 않는다.
- 각 Chip의 Remix close trailing action은 해당 선택값을 즉시 제거한다.
- 선택 Chip 목록은 최대 높이 안에서 스크롤하며 scrollbar thumb은 목록 Hover에서만 표시한다.
- Option list의 스크롤 공간은 유지하되 scrollbar thumb은 평소 숨기고 목록 Hover에서만 표시해 콘텐츠의 가로 이동을 방지한다.
- 일치하는 Option이 없으면 Empty state를 표시한다.
- 자유 입력과 새 항목 생성은 현재 지원하지 않는다.

## Examples

같은 지역 데이터로 단일 선택과 다중 선택을 비교한다. 다중 선택 결과는 첫 항목과 나머지 개수를 표시하는 Summary와 별도 Container에 전체 Chip을 표시하는 두 타입으로 검수한다. Popup 내부의 Search input과 Option list 구조는 이후 Filter/Depth Checkbox 패턴에서도 재사용할 수 있지만, 카테고리 탐색과 적용 정책은 Combobox가 아니라 해당 패턴이 소유한다.

다중 선택의 2-depth 검수 예시는 왼쪽의 `neutral-50` primitive 배경에 서울 지하철 `1호선~9호선`을 표시하고 오른쪽 흰 배경에 선택한 호선의 실제 역을 Checkbox 목록으로 표시한다. 기본 예시는 2호선의 `신림`, `강남`을 선택한다. 검색 Input 자체는 Single·Multiple Popup과 같은 투명 배경·Border 없음·32px recipe를 사용하고, 검색 영역과 2-depth 목록 영역 사이는 별도 Divider로 구분한다. 왼쪽 1-depth의 모든 행은 외부 여백 없이 전체 너비의 옅은 하단선으로 구분한다. 콘텐츠는 왼쪽 18px 여백을 유지하고, 화살표가 있는 오른쪽 여백은 8px로 줄인다. 활성 행만 흰 배경과 글자 위계로 구분한다. 왼쪽과 오른쪽 목록 사이의 세로 구분선은 Scroll 영역과 분리된 고정 레이어로 유지하고 활성 행만 그 위를 덮는다. 좌우 목록은 각각 270px 높이의 독립 Scroll 영역이며 왼쪽에는 36px 행 7.5개가 보인다. 왼쪽은 Scroll 동작을 유지하면서 Scrollbar를 항상 숨기고, 오른쪽 Scrollbar만 평소 투명하게 유지한 뒤 Hover했을 때 표시한다. 오른쪽 2-depth 목록 맨 위에는 현재 1-depth에 속한 항목을 모두 선택하거나 해제하는 `전체` Checkbox를 표시하며 일부 선택 시 mixed 상태를 표시한다.

## 현재 정의하지 않은 항목

- Clear button
- Leading element와 Option image
- Option group과 description
- Async search
- 선택 결과가 없는 Container의 별도 Empty state
- Creatable option
- Popup 최대 높이의 제품별 기준
- Label, Helper text, Error message를 소유할 Field API
