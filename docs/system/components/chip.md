# Chip

`packages/ui/src/chip.tsx`

선택한 값이나 필터 항목을 한 줄 Container로 표시한다. 검수 화면은 `/components/chip`이며 확정 전 초안이다.

## 역할과 경계

- Chip은 값 하나를 짧은 Label로 표시하고, 쓰임에 따라 전체를 눌러 상태를 바꾸거나 삭제할 수 있다.
- 항상 하나가 켜져 있고 끌 수 없는 위치 표시는 Chip이 아니라 Tab이 담당한다. Chip은 아무것도 켜지지 않은 상태가 기본이다.
- 설명이나 시각 정보를 비교하며 고르는 카드형 선택지는 Select Box가 담당한다.
- Label, Helper text와 Error message는 별도 Field가 소유한다.

## Anatomy

1. Container
2. Label

Extended anatomy는 선택 요소를 표시한다.

3. Leading element (Optional)
4. Prefix (Optional)
5. Trailing element (Optional)
6. Remove button (Optional)

내부 순서는 `Leading element → Prefix → Label → Trailing element → Remove button`이다. Leading element와 Trailing element에는 Icon만 둔다.

## Properties

- `controlSize`: `small | regular | large | xlarge`, 기본값 `regular`. 실제 높이는 [interaction.md](../interaction.md)의 「공통 Control Height」를 따른다
- `shape`: `circle | rounded`, 기본값 `circle`. [vocabulary.md](../vocabulary.md)의 공통 모양 어휘를 사용한다
- `active`: `boolean`, 기본값 `false`
- `children`: Label 문자열. 없으면 Icon only이며 높이와 같은 정사각 폭을 사용한다
- `prefix`: Label 앞에 붙는 짧은 문자열
- `leadingElement`, `trailingElement`: `ReactNode`
- `leadingTone`, `trailingTone`: `secondary | tertiary`, 기본값 `secondary`
- `onClick`: Container 전체를 누르는 동작
- `onRemove`, `removeLabel`, `removeTooltip`: Chip 자체를 삭제하는 Remove button
- `ariaLabel`: Icon only에서 필수

Style variant는 제공하지 않는다. 한 가지 스타일만 두며 Neutral border와 기본 surface를 사용한다.

`onClick`과 `onRemove`는 타입으로 갈라 함께 넘길 수 없다. Container 전체가 Button인데 안에 또 Button을 두면 어느 것을 눌렀는지 알 수 없다.

## 현재 구현 규칙

- Active는 `brand-alpha-40` 경계와 `brand-alpha-05` 배경을 사용하고, Label과 아이콘은 `oe-brand-foreground-primary`, Prefix는 `oe-brand-foreground-secondary`를 사용한다.
- 선택된 상태에는 Hover와 Pressed 하이라이트를 중첩하지 않는다. 근거는 [interaction.md](../interaction.md)의 「선택 상태와 Hover·Pressed」다.
- 아이콘 위계는 `secondary`가 Label과 같은 위계, `tertiary`가 한 단계 옅은 위계다. Active에서도 같은 관계를 brand 계열 안에서 유지한다.
- 한쪽 변이 아이콘으로 끝나고 반대 변이 글자로 끝나면 글자가 닿는 변에만 여백을 더한다. 아이콘 쪽을 줄이지 않으므로 어느 변도 기준보다 좁아지지 않는다. 양쪽이 같은 종류로 끝나면 기준 여백을 사용한다.
- Remove button은 Hover에서 Tooltip으로 동작을 알린다. 접근 가능한 이름은 `removeLabel`, 보이는 문구는 `removeTooltip`이 소유한다.

## Guidelines

Studio 화면의 Guidelines와 소제목을 동일하게 유지한다. 확정 전 초안이다.

### Chip을 Filter로 사용하기

콘텐츠 목록에서 조건의 적용 및 해제를 제어하는 Filter 역할로 사용할 때는 Filter Bar를 사용한다.

- 넘치면 가로로 스크롤한다. Filter Bar의 기본값은 스크롤이며 펼쳐 보여 주는 방식은 이후 별도 옵션으로 검토한다.
- PC에서도 같은 스크롤을 제공한다. 잡고 끌어 옮길 수 있게 하며 8px 이내의 움직임은 누르기로 본다.
- 아무것도 켜지지 않은 상태가 기본이다. 활성값이 하나라도 생기면 맨 앞에 초기화를 제공하고, 스크롤 위치와 무관하게 닿을 수 있도록 그 자리에 고정한다.
- 고정 영역은 지나가는 Chip을 가린다. 배경을 스크롤 변까지 덮고 경계는 gradation으로 흐린다.
- Filter Chip에는 지우기 버튼을 두지 않는다. 누르는 동작이 조건을 바로 켜고 끄는 것일 수도 있고 선택 화면을 여는 것일 수도 있으며, 조건을 되돌리는 것은 초기화가 담당한다.
- Label에는 적용된 값을 담는다.

### Chip을 Selection으로 사용하기

내용을 정하지 않았다.

### Chip을 Suggestion으로 사용하기

내용을 정하지 않았다.

### Chip을 정보 표시로 사용하기

누를 수 없는 쓰임이다. 내용을 정하지 않았다.

## 현재 정의하지 않은 항목

- Filter Bar를 별도 컴포넌트로 분리하는 시점과 API
- Selection, Suggestion, 정보 표시 쓰임의 규칙
- Disabled 상태
- Color variant
