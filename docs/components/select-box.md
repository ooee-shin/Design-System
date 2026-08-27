# Select Box Candidate

상태: `Candidate`

정의된 선택지를 화면에 펼쳐 놓고 제목, 설명과 시각 정보를 비교하며 하나 이상의 값을 선택하는 입력 컴포넌트다. 실제 구현 원본은 `packages/ui/src/select-box.tsx`, 검수 화면은 `/components/select-box`다. 구조와 사용 경계는 [Seed Design Select Box](https://seed-design.io/components/select-box)를 참고하되 ooee의 Radio·Checkbox Control, Field 경계와 Brand alpha 선택 표현으로 정규화했다.

## 역할과 경계

- Select Box는 선택지를 계속 노출하고 각 항목의 설명이나 시각 정보를 비교해야 할 때 사용한다.
- Single selection은 공용 Radio Control, Multiple selection은 공용 Checkbox Control을 내부에서 재사용한다.
- Select처럼 Trigger와 Popup으로 접지 않으며 Chip처럼 짧은 키워드 너비에 맞춰 흐르지 않는다.
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

Select Box 전체 Container가 하나의 선택 영역이다. Content container는 Title과 선택적인 Description을 묶는다. Leading element에는 아이콘이나 이미지를 둘 수 있다. Trailing element는 Single에서 Radio 또는 None, Multiple에서 Checkbox 또는 None을 사용한다.

## 현재 검수 범위

- Studio에는 Playground와 Anatomy만 표시한다.
- Playground의 초기 선택값은 비어 있다. Selection mode를 바꿔도 임의 항목을 자동 선택하지 않고 Single과 Multiple의 현재 값은 각각 보존한다.
- Playground에서 Single/Multiple selection, Single/Multi column, Multi column의 컬럼 수, `None | Icon | Image` Leading element, Trailing element와 Disabled·Read only 동작을 조합해 검수한다.
- Label은 Text control로 직접 바꾼다. Description은 표시 여부를 `Description` Toggle로 제어하고, 활성화했을 때 종속된 `Description text` Text control에서 실제 문구를 바꾼다. 표시 여부만 제공하고 콘텐츠 값을 고정하지 않는다.
- Properties, State 문서, Examples, Guidelines와 Property map은 Playground와 Anatomy가 확정된 뒤 추가한다.
- 현재 API와 Brand alpha 선택 표현은 검수용 초안이며 아직 문서 규칙이나 Stable 자산으로 확정하지 않는다.

## 현재 구현 규칙

- `selectionMode`의 기본값은 `single`, `columns`의 기본값은 `1`이며 Multi column 검수 범위는 2~6열이다. 좁은 Preview에서는 한 열을 유지하고 640px 이상 Container에서 지정한 열 수를 적용한다.
- Group의 항목 간격은 8px이다. 항목은 고정 높이를 갖지 않고 Content에 맞춰 늘어나며 현재 내부 여백은 좌우 16px, 상하 12px이다.
- Leading element와 Trailing element는 항목 전체 높이를 기준으로 수직 중앙 정렬한다. 공통 Image 예시는 정사각 Avatar를 사용하고 `oe-border-visual` 1px inset 경계를 적용한다.
- Title과 Description 간격은 2px이다. Title은 14px Medium, Description은 12px Tertiary foreground를 사용한다.
- 선택 상태는 진한 Filled action과 구분하기 위해 `brand-alpha-05` 배경과 `brand-alpha-40` 경계를 사용한다. Pointer 선택만으로 Focus ring을 표시하지 않는다.
- 키보드 `:focus-visible`에서는 선택선과 별도 ring을 중첩하지 않고 같은 2px 경계를 `oe-focus-ring` 색으로 바꾼다.
- Disabled에서는 선택 상태의 Brand 색을 제거하고 Disabled Neutral border와 background를 사용한다. Read only는 현재 값을 보존하고 Focus는 허용하지만 Hover·Pressed와 값 변경은 제공하지 않는다.
- Trailing element를 `none`으로 설정해도 접근 가능한 Radio 또는 Checkbox input은 시각적으로만 숨기고 DOM과 키보드 순서에서 제거하지 않는다.

## 아직 정하지 않은 사항

- Field 결합 API, 최대 선택 개수와 초과 피드백, 모바일에서의 열 수 정책은 아직 정하지 않았다.
- 선택 표현의 Brand alpha 조합은 Candidate다. 다른 독립 컴포넌트에서 같은 의미가 반복되기 전에는 별도 semantic token으로 승격하지 않는다.
