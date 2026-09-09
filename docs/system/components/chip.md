# Chip

`packages/ui/src/chip.tsx`

선택한 값이나 필터 항목을 한 줄 Container로 표시한다.

## 역할과 경계

- Chip은 값 하나를 짧은 Label로 표시하고, 쓰임에 따라 전체를 눌러 상태를 바꾸거나 삭제할 수 있다.
- 항상 하나가 켜져 있고 끌 수 없는 위치 표시는 Chip이 아니라 Tab이 담당한다. Chip은 아무것도 켜지지 않은 상태가 기본이다.
- 설명이나 시각 정보를 비교하며 고르는 카드형 선택지는 Select Box가 담당한다.
- 다른 요소에 덧붙어 상태나 개수를 작게 표시하는 것은 [badge.md](badge.md)가 담당한다. Chip은 [interaction.md](../interaction.md)의 「공통 Control Height」를 따르므로 컨트롤과 나란히 놓이는 크기이며, Badge는 자기 크기 체계로 덧붙는다. 동작이 없는 정보 표시가 Chip에 남는 이유도 크기와 놓이는 자리가 컨트롤 쪽이기 때문이다.
- Label, Helper text와 Error message는 별도 Field가 소유하며 그 구조와 API는 [field.md](field.md)에 있다.

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

- `controlSize`: `xsmall | small | regular | large | xlarge`, 기본값 `regular`. 실제 높이는 [interaction.md](../interaction.md)의 「공통 Control Height」를 따른다. 다섯 단계인 이유는 Input·Select·Combobox가 제공하는 넷에 Suggestion용 XSmall 28px을 더했기 때문이다. Selection이 폼 요소와 같은 페이지에서, 때로는 같은 Field 안에서 쓰이므로 폼 요소의 단계를 모두 가져야 나란히 놓았을 때 높이를 맞출 수 있다. 공통 scale의 XXSmall 24px과 XXLarge 56px은 폼 요소도 갖지 않으므로 제공하지 않는다
- `shape`: `circle | rounded`, 기본값 `circle`. [vocabulary.md](../vocabulary.md)의 공통 모양 어휘를 사용하며 `rounded`는 [interaction.md](../interaction.md)의 「공통 Control Radius」를 따른다
- `active`: `boolean`, 기본값 `false`
- `children`: Label 문자열. 없으면 Icon only이며 높이와 같은 정사각 폭을 사용한다
- `prefix`: Label 앞에 붙는 짧은 문자열. Label이 없는 Icon only에서는 함께 넘겨도 그리지 않는다. 정사각 폭에 글자가 들어갈 자리가 없기 때문이다
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
- XSmall은 Label을 공용 `text-oe-label` token의 13px/16px로 줄이고 굵기도 `font-normal`로 한 단계 내린다. 나머지 단계는 다른 컨트롤과 같은 14px과 `font-medium`을 사용한다. 28px 상자에 14px 글자를 그대로 담으면 위아래 여유가 남지 않는다. 아이콘도 같은 이유로 XSmall에서만 12px을 사용하고 Small 이상은 16px 또는 20px을 사용한다.
- 아이콘 위계는 `secondary`가 Label과 같은 위계, `tertiary`가 한 단계 옅은 위계다. Active에서도 같은 관계를 brand 계열 안에서 유지한다.
- 한쪽 변이 아이콘으로 끝나고 반대 변이 글자로 끝나면 글자가 닿는 변에만 여백을 더한다. 아이콘 쪽을 줄이지 않으므로 어느 변도 기준보다 좁아지지 않는다. 양쪽이 같은 종류로 끝나면 기준 여백을 사용한다.
- `rounded`는 [interaction.md](../interaction.md)의 「공통 Control Radius」를 따른다. Chip이 공통 Control Height를 따르고 같은 페이지에서, 때로는 같은 Field 안에서 다른 컨트롤과 함께 놓이기 때문이다.
- Remove button은 Hover에서 Tooltip으로 동작을 알린다. 접근 가능한 이름은 `removeLabel`, 보이는 문구는 `removeTooltip`이 소유한다.

## Guidelines

Studio 화면의 Guidelines와 소제목을 동일하게 유지한다.

### 모든 쓰임의 공통 규칙

- Chip은 내부 콘텐츠를 감싸는 너비를 사용한다. 담을 폭보다 넓어지면 Label만 말줄임해 한 줄을 유지하고 Leading element, Prefix, Trailing element와 Remove button은 줄이지 않는다. 아이콘이 찌그러지거나 Remove button을 누를 수 없게 되면 값을 지울 방법이 사라지기 때문이다. Chip을 여러 줄로 늘리지 않는다.
- `circle`이 기본이며 `rounded`는 Selection에서만 사용한다. Selection이 폼 요소와 나란히 놓이는 유일한 쓰임이므로 그 자리에서만 모서리를 맞출 이유가 있다.
- Icon only는 누르면 바로 끝나는 동작에만 쓴다. 별도 화면이 열리거나 다음 선택을 요구하는 자리에는 두지 않는다. 아이콘은 열리기 전에 무엇을 고르는 자리인지 대신 말해 주지 못한다.
- Icon only에 Remove button을 함께 두지 않는다. 지울 값이 화면에 없으면 무엇을 지우는지 알 수 없다.

### 쓰임마다 갈리는 것

`onClick`과 `onRemove`는 타입으로 갈라 함께 넘길 수 없으므로, 어느 쓰임인지 먼저 정한 뒤 요소를 조합한다.

| 쓰임 | 모양 | 누르는 동작 | 개별 제거 | Active |
| --- | --- | --- | --- | --- |
| Filter | `circle` | 조건을 켜고 끄거나 선택 화면을 연다 | 두지 않는다. 초기화가 담당한다 | 사용한다 |
| Selection | `rounded` | 값을 고르고 해제한다 | 두지 않는다 | 사용한다 |
| Suggestion | `circle` | 누르면 값이 채워진다 | 두지 않는다 | 사용하지 않는다 |
| Input | `circle` | 두지 않는다 | Remove button을 사용한다 | 사용하지 않는다 |
| 정보 표시 | `circle` | 두지 않는다 | 두지 않는다 | 사용하지 않는다 |

### Chip을 Filter로 사용하기

콘텐츠 목록에서 조건의 적용 및 해제를 제어하는 Filter 역할로 사용할 때는 Filter Bar를 사용한다.

- 넘치면 가로로 스크롤한다. Filter Bar의 기본값은 스크롤이며 펼쳐 보여 주는 방식은 이후 별도 옵션으로 검토한다.
- PC에서도 같은 스크롤을 제공한다. 잡고 끌어 옮길 수 있게 하며 8px 이내의 움직임은 누르기로 본다.
- 아무것도 켜지지 않은 상태가 기본이다. 활성값이 하나라도 생기면 맨 앞에 초기화를 제공하고, 스크롤 위치와 무관하게 닿을 수 있도록 그 자리에 고정한다.
- 고정 영역은 지나가는 Chip을 가린다. 배경을 스크롤 변까지 덮고 경계는 gradation으로 흐린다.
- Filter Chip에는 지우기 버튼을 두지 않는다. 누르는 동작이 조건을 바로 켜고 끄는 것일 수도 있고 선택 화면을 여는 것일 수도 있으며, 조건을 되돌리는 것은 초기화가 담당한다.
- Label에는 적용된 값을 담는다.

### Chip을 Selection으로 사용하기

짧은 키워드 여러 개를 나열해 그중 하나 이상을 고르는 자리다.

- 각 Chip은 Label 너비만큼만 차지하고 줄이 넘치면 줄바꿈한다. 이 배치를 Select Box가 만들지 않는 이유도 같은 기준이며 [select-box.md](select-box.md)의 「역할과 경계」에 있다.
- 다섯 쓰임 가운데 `rounded`를 쓰는 것은 Selection뿐이다. Input, Select, Number Input과 같은 페이지에서 값을 고르는 자리이며 Field에서 다루기도 하므로, 나란히 놓였을 때 모서리가 갈리지 않아야 한다. 값은 [interaction.md](../interaction.md)의 「공통 Control Radius」가 소유한다.
- 선택과 해제를 전체 Click으로 받는다. `onClick` 하나로 켜고 끄며 Remove button은 두지 않는다. 아무것도 켜지지 않은 상태가 기본이라는 점에서, 항상 하나가 켜져 있고 끌 수 없는 Tab과 갈린다.
- 설명이나 시각 정보를 견주어 고르는 자리는 Select Box가 담당한다. 키워드만으로 판단할 수 있을 때 Chip을 사용한다.

### Chip을 Suggestion으로 사용하기

사용자에게 다음 입력을 제안하는 자리다. 검색어 추천과 채팅방 안의 답변 추천이 여기에 해당한다.

- 누르면 값이 채워진다. 전체 Click을 사용하고 Remove button은 두지 않는다. 제안을 지우는 것이 아니라 받아들이는 자리다.
- Label만 두는 기본 형태를 권장한다. 제안은 여러 개를 훑어 고르는 자리이므로 항목마다 아이콘이나 Prefix가 붙으면 훑는 속도가 떨어진다.
- Active를 사용하지 않는다. 켜고 끄는 상태가 아니라 누르는 순간 값이 채워지고 그 역할이 끝난다. 켜진 상태로 남는 선택은 Selection이 담당한다.

### Chip을 Input으로 사용하기

고른 값을 계속 보여 주고 개별로 지우는 자리다.

- 개별 제거는 Remove button으로 받고 전체 Click은 두지 않는다. 이미 고른 값이므로 지우는 것 외에 누를 동작이 없다.
- 여러 Chip을 담는 영역의 규칙은 [combobox.md](combobox.md)가 소유한다. 값을 계속 보이게 두는 이유, 최대 높이 안에서의 스크롤과 내부 검색이 거기에 있다.

### Chip을 정보 표시로 사용하기

여러 값을 나열해 각 값이 구분되어 읽히게 하는 자리다. 리뷰 관리 화면에서 사용자가 주문한 메뉴를 보여 주는 경우가 여기에 해당한다.

- `onClick`도 `onRemove`도 주지 않는다. 누를 수도 지울 수도 없으며 읽는 것이 전부다.
- Active를 사용하지 않는다. 고르는 자리가 아니므로 켜진 값이라는 개념이 없다.
- 값이 여럿일 때 쓴다. 값 하나를 문장 안에서 보여 주는 것으로 충분하면 Chip을 쓰지 않는다. 값의 경계를 눈으로 가르는 것이 이 쓰임의 목적이다.

## 현재 정의하지 않은 항목

- Filter Bar를 별도 컴포넌트로 분리하는 시점과 API
- Disabled 상태
- Color variant
