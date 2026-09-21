# Select Box

`packages/ui/src/select-box.tsx`

정의된 선택지를 화면에 펼쳐 놓고 제목, 설명과 시각 정보를 비교하며 하나 이상의 값을 선택하는 입력 컴포넌트다. 공용 Radio·Checkbox Control과 Field 경계를 사용하고, 고른 카드는 중립 경계로 알린다.

## 역할과 경계

- Select Box는 선택지를 계속 노출하고 각 항목의 설명이나 시각 정보를 비교해야 할 때 사용한다.
- Single selection은 공용 Radio Control, Multiple selection은 공용 Checkbox Control을 내부에서 재사용한다.
- 카드형 전체 선택 Surface는 Select Box가 소유한다. Radio와 Checkbox에는 별도 Container 변형을 두지 않는다.
- Select처럼 Trigger와 Popup으로 접지 않으며 Chip처럼 짧은 키워드 너비에 맞춰 흐르지 않는다.
- 짧은 Label을 밀도 있게 나열하는 전통적인 폼은 Radio 또는 Checkbox를 사용한다. 설명이나 시각 정보가 포함된 선택지를 넓은 조작 영역에서 비교할 때 Select Box를 사용한다.
- Field 안에서 Input, Number Input, Checkbox Group, Radio Group과 같은 입력 위계로 사용할 수 있다.
- Label, Helper text, Error message와 선택 개수 안내는 Field가 소유한다. 선택 개수는 [field.md](field.md)의 `rightDescription`에 둔다.
- Select Box 자체는 값을 선택할 뿐 즉시 Action을 실행하지 않는다. 저장, 확인 또는 다음 단계는 별도 Button이 담당한다.

## Anatomy

```text
Select Box Group
└─ Select Box
   ├─ Leading element (Optional)
   ├─ Content container
   │  ├─ Title
   │  ├─ Description (Optional)
   └─ Trailing element (Optional)
```

Select Box 전체 Container가 하나의 선택 영역이다. Content container는 Title과 선택적인 Description을 묶는다. Leading element에는 아이콘이나 이미지를 둘 수 있다. Trailing element는 `radio | checkbox | none` 중 하나를 받고, `none`이 아니면 `selectionMode`에 맞는 Control로 대체하므로 Single에서는 Radio, Multiple에서는 Checkbox가 표시된다.

## 현재 구현 규칙

- `ariaLabel`은 `SelectBoxGroup`의 필수 Property이며 Group의 접근 가능한 이름을 소유한다. Label 자체는 Field가 소유한다.
- 항목마다 `disabled`를 둘 수 있고 Group의 `disabled`와 함께 적용된다.
- `selectionMode`의 기본값은 `single`, `columns`의 기본값은 `1`이며 Multi column 검수 범위는 2~6열이다. 좁은 Preview에서는 한 열을 유지하고 640px 이상 Container에서 지정한 열 수를 적용한다.
- 항목 배치는 `columns`로만 지원한다. 한 열에서는 항목이 Container 너비를 채우고 여러 열에서는 열마다 같은 너비를 사용한다. 각 항목이 Content 너비만큼만 차지하며 줄바꿈되는 배치는 제공하지 않는다.
- `columns`가 2 이상이면 Leading element를 Title 왼쪽이 아니라 Title 위 왼쪽에 배치한다. 열이 여럿이면 항목이 좁아져 한 줄에 두 요소를 나란히 두기 어렵다. 이 배치는 `columns` 값으로 결정되며 별도 Property를 두지 않는다.
- 모서리 반지름은 `rounded-lg`(10px)이며 [interaction.md](../interaction.md)의 「공통 Control Radius」를 따르지 않는다. 그 절이 Select Box를 적용하지 않는 것으로 정해 두었고, 컨트롤과 나란히 놓이는 한 줄 요소가 아니라 설명을 담아 높이가 늘어나는 카드형 선택지이기 때문이다. 컨트롤의 8px은 이 크기의 상자에서 각이 서고, 12px은 Message Bubble과 첨부 카드 쪽으로 읽힌다.
- Group의 항목 간격은 8px이다. 항목은 고정 높이를 갖지 않고 Content에 맞춰 늘어나며 현재 내부 여백은 좌우 16px, 위 12px, 아래 14px이다. 아래를 2px 넓게 두는 것은 시각 보정이다. 위아래를 같게 두면 글이 상자 안에서 위로 올라붙어 보인다.
- Leading element가 Title 위로 올라가는 여러 열 배치에서는 위 여백만 16px을 사용한다. 아이콘은 자기 상자를 거의 채우지만 Title은 줄높이 안에서 위아래로 여유를 갖기 때문에, 상하 여백을 같게 두면 아래가 더 넓어 보인다.
- Leading element 자리는 고정 크기를 갖지 않고 그 자리에 놓인 요소의 크기를 따른다. 아이콘과 이미지의 크기는 요소를 넘기는 쪽이 정하며 Select Box가 덮어쓰지 않는다. 공통 Image 예시는 32px 정사각 Avatar, 아이콘 예시는 공통 Medium 20px을 사용한다.
- 한 열에서 Leading element와 Trailing element는 항목 전체 높이를 기준으로 수직 중앙 정렬한다. 여러 열에서 Leading element는 Title 위로 올라가며 왼쪽 시작점을 Title과 맞추고, Trailing element만 수직 중앙 정렬을 유지한다. 공통 Image 예시는 정사각 Avatar를 사용하고 `oe-border-visual` 1px inset 경계를 적용한다.
- Title과 Description 간격은 2px이다. Title은 `text-base`(16px / 24px) Medium, Description은 `text-oe-label`(13px / 16px) Tertiary foreground를 사용한다. Description이 Label token인 것은 제목이 본문 단계로 올라가 12px과의 간격이 네 단계로 벌어졌기 때문이며, 한 단계만 좁혀 두 글이 한 덩이로 읽히게 한다.
- Description의 글자 크기는 `text-oe-label` 클래스가 아니라 `text-[length:var(--text-oe-label)]`과 짝이 되는 줄 높이로 적는다. `cn()`이 `text-oe-label`을 색 클래스와 같은 무리로 보고 앞의 `text-oe-foreground-tertiary`를 지우기 때문이다. Switch가 같은 방식을 쓴다. Title이 본문 단계인 것은 이 컴포넌트가 한 줄 목록이 아니라 고르는 덩이이고, 14px에서는 아래 설명과 크기 차이가 좁아 제목으로 읽히지 않기 때문이다.
- 선택 상태는 배경을 채우지 않고 `oe-border-bold-primary` 2px 경계로 알린다. 2px은 `border`와 안쪽 1px `box-shadow`를 겹쳐 만든다. `border-width`를 키우면 카드 안의 Title과 Description이 1px씩 밀려 고를 때마다 움직인다. 카드는 면을 칠해 선택을 알리는 요소이므로 [interaction.md](../interaction.md)의 「선택 상태와 Hover·Pressed」가 정한 대로 brand를 쓰지 않는다. 경계를 brand로 두었을 때에는 그 색이 `oe-focus-ring`과 같아서 고른 카드와 키보드가 짚은 카드가 색으로 갈리지 않았고, 옅은 brand 배경이 흰 배경과 거의 구분되지 않아 경계를 2px로 키워 보강해야 했다. Pointer 선택만으로 Focus ring을 표시하지 않는다.
- 키보드 `:focus-visible`에서는 `oe-focus-ring` 색의 2px 경계를 사용한다. 선택 경계와 색이 다르므로 이미 선택된 카드에서도 지금 짚고 있는 것이 어느 카드인지 드러난다.
- 카드 안의 Radio와 Checkbox는 카드와 같은 `oe-background-bold-primary`로 켠다. 단독으로 선 Control은 표식 하나가 유일한 신호라 brand를 쓰지만, 카드 안에서는 카드가 이미 선택을 알리고 있어 표식만 brand로 남기면 한 카드 안에서 지목하는 색이 둘이 된다.
- 고른 카드도 Hover와 Pressed를 그대로 받는다. 선택을 배경으로 알리지 않아 하이라이트가 흐려 놓을 선택 배경이 없기 때문이다.
- Disabled에서는 선택 경계를 Disabled Neutral border와 background로 바꾼다. Read only는 현재 값을 보존하고 Focus는 허용하지만 Hover·Pressed와 값 변경은 제공하지 않는다.
- Trailing element를 `none`으로 설정해도 접근 가능한 Radio 또는 Checkbox input은 시각적으로만 숨기고 DOM과 키보드 순서에서 제거하지 않는다.

## Guidelines

Studio 화면의 Guidelines와 소제목을 동일하게 유지한다. 아래 기준은 「역할과 경계」의 문장을 고르는 사람의 행동으로 다시 쓴 것이다.

### 설명이나 시각 정보가 있는 선택지에 사용하기

Select Box의 값은 넓은 조작 영역과 그 안에 담기는 Description, 시각 정보다. 비교할 정보가 있으면 한 열로 두어 항목마다 그 정보를 읽을 수 있게 한다.

Title만 있는 짧은 선택지는 `columns`를 늘려 여러 열로 나누고 `trailingElement`를 `none`으로 둔다. 한 열로 두면 넓은 카드에 짧은 Label 하나만 남고 Control이 오른쪽 끝으로 떨어져 Label과 멀어진다. 어느 쪽이 잘못이 아니라 Content 분량에 따라 갈리는 권장 배치다.

짧은 Label을 밀도 있게 나열하는 전통적인 폼은 Radio 또는 Checkbox를 사용하고, 선택지를 접어 두어도 되면 Select를 사용한다.

### 박스 전체를 하나의 터치 타겟으로 두기

Select Box는 박스 전체를 하나의 터치 타겟으로 구성하여 오조작을 방지한다. Title, Description과 Leading element 어디를 눌러도 같은 값이 선택된다. 따라서 박스 안에 따로 눌리는 요소를 두지 않는다. 링크나 Button을 넣으면 하나였던 터치 타겟이 갈라져 무엇을 눌렀는지 알 수 없게 된다.

### Description은 필요한 항목에만 두기

항목마다 정보 구성이 같아야 하는 것은 아니다. 부연이 필요한 항목에만 Description을 두고 나머지는 Title만 두어도 된다. 항목 높이는 고정되어 있지 않고 각자의 Content에 맞춰 늘어나므로 한 항목만 길어져도 나머지 항목의 높이는 그대로다.

### Title과 Description을 간결하게 작성하기

사용자가 여러 옵션을 쉽고 빠르게 비교할 수 있도록 Title과 Description은 최대한 간결하게 작성한다. Description은 가독성을 위해 두 줄 이내를 권장한다. 한 항목만 길어지면 그 항목의 높이가 늘어나 나머지 항목과 나란히 읽기 어려워진다. 설명이 두 줄을 넘어야 하면 문장을 줄이거나 선택 이후 화면에서 안내한다.

### 선택과 실행을 나누기

Select Box는 값을 선택할 뿐 즉시 Action을 실행하지 않는다. 저장, 확인이나 다음 단계는 별도 Button이 담당한다. 카드가 넓어 Button처럼 보이더라도 누르는 즉시 화면을 이동시키지 않는다.

### 세 열에서는 시각 요소를 덜어내기

열이 셋 이상이면 항목 폭이 Title 한 줄에 가까워진다. Leading element까지 두면 Title이 줄바꿈되거나 잘린다. 이 폭에서는 시각 요소를 덜어내고 Title만 두는 것을 권장한다. 아이콘이 값을 식별하는 데 꼭 필요하면 열 수를 줄인다.

### Select Box와 Chip을 나눠 쓰기

항목 배치는 `columns`로만 지원한다. 각 항목이 Content 너비만큼만 차지하며 줄바꿈되는 배치는 제공하지 않는다. 항목 너비가 서로 달라지면 나란히 비교할 기준이 사라지기 때문이다.

짧은 키워드를 Content 너비로 나열해 선택해야 하면 Chip을 사용한다. Select Box에 그 배치를 만들면 두 컴포넌트의 화면 모양이 같아져 무엇을 선택하는 자리인지 구분할 수 없다.

### 카드형 선택 Surface는 Select Box만 갖기

카드형 전체 선택 Surface는 Select Box가 소유하며 Radio와 Checkbox에는 별도 Container 변형을 두지 않는다. 짧은 Label을 넓은 카드 없이 밀도 있게 나열해야 하면 Radio나 Checkbox를 그대로 사용한다. 두 컴포넌트에 Container를 덧붙여 Select Box를 대신하지 않는다.
