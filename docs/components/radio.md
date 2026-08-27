# Radio

성숙도: Candidate

Radio는 목록이나 폼에서 여러 항목 중 하나를 선택한다. 확정한 16px Radio Control을 기준으로 Checkbox와 같은 Field·Content 구조를 적용한다.

## Anatomy

### Basic anatomy

1. Field container
2. Radio control: 16px 원형 외곽
3. Selection indicator: Checked에서 표시되는 8px 흰 원
4. Label

### Extended anatomy

Basic 번호는 반복하지 않고 Content container와 Optional 요소만 표시한다.

5. Content container
6. Leading element: 선택적 Slot
7. Right Description: 선택적
8. Trailing element: 선택적 Slot
9. Bottom Description: 선택적

Studio의 `Structure map`은 위 포함 관계를 Checkbox와 같은 트리 형식으로 표시한다. Field container 아래에 Radio control과 Content container가 있고, Selection indicator는 Radio control에 포함된다. 공통 용어 규칙에 따라 값 변경과 Focus를 소유하는 16px 원형은 Control, 그 안의 8px 흰 원은 Indicator로 부른다.

`Radio`는 원자적인 Control, `RadioField`는 Label과 선택적 Content를 결합한다. Radio와 Label 전체를 카드형 Surface로 묶는 Container 변형은 제공하지 않는다. 짧은 항목을 밀도 있게 나열할 때는 `RadioField`를 사용하고, 설명이나 시각 정보가 포함된 선택지를 넓은 조작 영역에서 비교할 때는 Single selection의 `SelectBox`를 사용한다.

## Properties

- `value`: Group 안에서 항목을 식별하는 필수 값
- `disabled`, `readOnly`, `required`
- `label`: Field의 필수 `ReactNode`
- `rightDescription`, `bottomDescription`
- `leadingElement`, `trailingElement`
- `layout`: `inline | block`, 기본값 `inline`
- `flipped`: Control을 Label의 왼쪽 또는 오른쪽에 배치

Layout, Label, Description, Leading/Trailing 배치와 Flipped 규칙은 CheckboxField와 동일하다. Leading/Trailing Anatomy는 Studio 전용 핑크 점선 Swap slot으로 표시한다. Trailing은 Label 뒤에 바로 배치하고 20px 첫 행 안에서 중앙 정렬한다.

Studio Playground의 필수 Label은 `Label`, 선택적 설명은 `Right Description`과 `Bottom Description` 구조 문구로 고정한다. 정적 문구를 편집하는 Text control은 두지 않고 Optional Description은 표시 여부만 Boolean control로 검수한다.

## State

- Radio: Unchecked, Checked, Focus visible, Disabled · Unchecked, Disabled · Checked, Read only · Checked
- 제공하지 않음: Parent item, Indeterminate, Ghost
- 현재 정의 없음: Loading, Error/Invalid, Hover 전용 표현

Unchecked는 `oe-background-primary`와 `oe-border-primary`를 사용한다. Checked는 Control 전체를 `oe-brand-background-bold-primary`로 채우고 중앙에 8px 흰 Indicator를 표시한다. Focus visible은 2px 간격의 2px `oe-focus-ring`을 사용한다. Disabled Checked는 `oe-background-disabled-selected` Control과 흰 Indicator를 사용한다.

현재 RadioField에는 크기 또는 위치가 변하는 Pressed motion을 적용하지 않는다. Control의 상태색과 Field의 Hover 등 기존 상호작용 피드백만 유지하며, 전체 축소 효과는 모바일 공통 Motion 체계를 정할 때 다른 조작 요소와 함께 다시 검수한다.

Radio Group 위에 보이는 질문이나 제목은 Field의 전체 조작 영역이 아니라 실제로 보이는 Radio Indicator의 왼쪽 시작점에 맞춘다. 화면 또는 Surface의 20px 바깥 여백과 제목 시작점은 그대로 유지하고, 기본 RadioField의 8px 내부 조작 여백은 Field를 왼쪽으로 8px 보정해 바깥 방향으로 확보한다. 별도 콘텐츠와 Control만 결합한 구성에서는 불필요한 내부 들여쓰기를 제거해 제목과 Indicator의 시각 시작점을 맞춘다.

Read only는 Enabled와 같은 기본 시각과 Focus를 유지하지만 Pointer 또는 키보드 조작으로 선택값을 변경하지 않는다. 값 변경 가능성을 암시하는 Hover 배경·Hover shadow와 Pressed 피드백은 제거한다. Disabled와 달리 비활성 색상이나 `not-allowed` cursor는 사용하지 않는다.

RadioField의 보이는 Label은 `aria-labelledby`로 Radio Control의 접근 가능한 이름에 연결한다. Studio의 Playground와 Properties · Elements 예시는 직접 선택할 수 있다. Properties · State는 선택값을 controlled 상태로 고정하지만 Pointer, Focus visible과 키보드 피드백은 차단하지 않는다. Disabled는 실제 조작 불가 상태를 유지하고 Read only는 Focus만 유지한 채 Hover·Pressed와 값 변경을 차단한다.

RadioField의 전체 조작 영역은 항상 투명하며 선택 여부와 관계없이 값 변경이 가능한 Field의 Hover에만 옅은 `oe-interaction-hover-subtle`을 사용한다. 선택 상태는 Indicator의 Brand 표현으로 전달하고 Disabled와 Read only Field는 Hover 반응을 제공하지 않는다.

Radio는 Checkbox와 마찬가지로 Label 외에 선택을 이해하는 데 필요한 시각 콘텐츠와 결합할 수 있다. Studio Guidelines는 16px Radio Control을 36px 조작 영역 안에 중앙 정렬한 `Control only · 36px target` 예시와 상단 미리보기·하단 왼쪽 Radio와 Label을 결합한 3개의 가로 선택 항목을 2-grid로 비교한다. 오른쪽 시각 예시의 제목은 특정 사례명이 아니라 `콘텐츠 결합 예시`로 표시한다. 실제 UI 예시는 GuideVisual이 제공하는 하나의 `oe-background-primary` Surface 안에 20px 패딩을 두고 16px Semibold `테마 설정` 제목과 `시스템 설정`·`밝은 모드`·`어두운 모드` 선택지를 직접 배치한다. 세 선택지는 현재 언어에서 가장 긴 Label의 max-content 너비를 공통 최소 너비로 사용해 균등하게 배치하며, 좁은 화면에서는 Label을 나누지 않고 가로 스크롤한다. 별도의 내부 Surface를 중첩하지 않으며 기존 Surface와 텍스트는 Studio의 Light/Dark 전환을 그대로 따른다. 이미지 외곽 구조선은 Light에서 Black 10%, Dark에서 White 16% alpha를 사용해 어두운 배경에서도 경계를 유지한다. 단, 밝은 모드와 어두운 모드를 설명하는 미리보기 자체의 색상은 선택지 의미를 보존한다. 이 예시는 일반 콘텐츠가 선택 동작을 소유하고 Radio Control만 상태 표시와 입력에 재사용한 조합이다. 항목 전체에는 별도 border, surface와 Hover 효과를 적용하지 않고 미리보기에도 그림자를 사용하지 않는다. 선택한 항목의 미리보기 이미지에는 3px 간격을 둔 2px `brand-alpha-40` ring을 표시하며, ring과 Radio/Label 행 사이는 4px이다. Radio/Label 행에는 왼쪽 4px 여백을 둬 미리보기 이미지와 시각적인 시작점을 맞춘다. 키보드 Focus에서는 별도 링을 중첩하지 않고 같은 2px ring의 색만 `oe-focus-ring`으로 바꾸며, Focus가 해제되면 150ms 동안 선택 색으로 부드럽게 복귀한다. 같은 RadioGroup의 항목은 동일한 정보 구조와 크기를 사용하고 한 번에 하나만 선택한다. 여러 항목을 동시에 선택해야 하는 경우에는 Checkbox Control을 같은 방식으로 조합한다.

## Specification

- Control: 16 × 16px
- Indicator: 8 × 8px
- RadioField minimum height: 36px (`oe-control-regular`)
- Label: 14px / 20px, Regular

현재 Candidate이며 다른 Radio 사용 화면에서 재검증하기 전 Stable로 승격하지 않는다.
