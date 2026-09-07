# Select Box

`packages/ui/src/select-box.tsx`

정의된 선택지를 화면에 펼쳐 놓고 제목, 설명과 시각 정보를 비교하며 하나 이상의 값을 선택하는 입력 컴포넌트다. 공용 Radio·Checkbox Control과 Field 경계를 사용하고 선택 표현은 Brand alpha를 사용한다.

## 역할과 경계

- Select Box는 선택지를 계속 노출하고 각 항목의 설명이나 시각 정보를 비교해야 할 때 사용한다.
- Single selection은 공용 Radio Control, Multiple selection은 공용 Checkbox Control을 내부에서 재사용한다.
- 카드형 전체 선택 Surface는 Select Box가 소유한다. Radio와 Checkbox에는 별도 Container 변형을 두지 않는다.
- Select처럼 Trigger와 Popup으로 접지 않으며 Chip처럼 짧은 키워드 너비에 맞춰 흐르지 않는다.
- 짧은 Label을 밀도 있게 나열하는 전통적인 폼은 Radio 또는 Checkbox를 사용한다. 설명이나 시각 정보가 포함된 선택지를 넓은 조작 영역에서 비교할 때 Select Box를 사용한다.
- Field 안에서 Input, Number Input, Checkbox Group, Radio Group과 같은 입력 위계로 사용할 수 있다.
- Label, Helper text, Error message와 선택 개수 안내는 Field가 소유한다.
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
- Group의 항목 간격은 8px이다. 항목은 고정 높이를 갖지 않고 Content에 맞춰 늘어나며 현재 내부 여백은 좌우 16px, 상하 12px이다.
- Leading element와 Trailing element는 항목 전체 높이를 기준으로 수직 중앙 정렬한다. 공통 Image 예시는 정사각 Avatar를 사용하고 `oe-border-visual` 1px inset 경계를 적용한다.
- Title과 Description 간격은 2px이다. Title은 14px Medium, Description은 12px Tertiary foreground를 사용한다.
- 선택 상태는 진한 Filled action과 구분하기 위해 `brand-alpha-05` 배경과 `brand-alpha-40` 경계를 사용한다. Pointer 선택만으로 Focus ring을 표시하지 않는다.
- 키보드 `:focus-visible`에서는 선택선과 별도 ring을 중첩하지 않고 같은 2px 경계를 `oe-focus-ring` 색으로 바꾼다.
- Disabled에서는 선택 상태의 Brand 색을 제거하고 Disabled Neutral border와 background를 사용한다. Read only는 현재 값을 보존하고 Focus는 허용하지만 Hover·Pressed와 값 변경은 제공하지 않는다.
- Trailing element를 `none`으로 설정해도 접근 가능한 Radio 또는 Checkbox input은 시각적으로만 숨기고 DOM과 키보드 순서에서 제거하지 않는다.

## Guidelines

Studio 화면의 Guidelines와 소제목을 동일하게 유지한다. 아래 기준은 첫 번째 초안이며 「역할과 경계」에서 확정한 문장을 사용자 관점의 규칙으로 다시 쓴 것이다.

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

### 다른 선택 컴포넌트와 나눠 쓰기

Select처럼 Trigger와 Popup으로 접지 않는다. 선택지를 계속 노출하는 것이 이 컴포넌트의 전제다. Chip처럼 짧은 키워드 너비에 맞춰 흐르지 않는다. 항목 너비가 서로 달라지면 비교할 기준이 사라진다. 카드형 전체 선택 Surface는 Select Box가 소유하며 Radio와 Checkbox에는 별도 Container 변형을 두지 않는다.
