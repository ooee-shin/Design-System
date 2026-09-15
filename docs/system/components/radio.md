# Radio

`packages/ui/src/radio.tsx`

목록이나 폼에서 여러 항목 중 하나를 선택한다. 16px Radio Control을 기준으로 Checkbox와 같은 Field·Content 구조를 사용한다.

## Anatomy

### Basic anatomy

1. Field
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

`Radio`는 원자적인 Control, `RadioField`는 Label과 선택적 Content를 결합한다. Radio와 Label 전체를 카드형 Surface로 묶는 Container 변형은 제공하지 않는다. 짧은 항목을 밀도 있게 나열할 때는 `RadioField`를 사용하고, 설명이나 시각 정보가 포함된 선택지를 넓은 조작 영역에서 비교할 때는 Single selection의 `SelectBox`를 사용한다.

## Properties

- `value`: Group 안에서 항목을 식별하는 필수 값
- `disabled`, `readOnly`, `required`
- `label`: Field의 필수 `ReactNode`
- `rightDescription`, `bottomDescription`
- `leadingElement`, `trailingElement`
- `layout`: `hug | fill`, 기본값 `hug`. 값의 뜻은 [interaction.md](../interaction.md)의 「공통 너비 Layout」이 소유한다
- `flipped`: Control을 Label의 왼쪽 또는 오른쪽에 배치
- `indicatorClassName`, `radioClassName`: Indicator와 Control에 각각 적용하는 class다

Layout, Label, Description, Leading/Trailing 배치와 Flipped 규칙은 CheckboxField와 동일하다. Trailing은 Label 뒤에 바로 배치하고 20px 첫 행 안에서 중앙 정렬한다.

## State

- Radio: Unchecked, Checked, Focus visible, Disabled · Unchecked, Disabled · Checked, Read only · Checked
- 제공하지 않음: Parent item, Indeterminate, Ghost
- 현재 정의 없음: Loading, Error/Invalid, Hover 전용 표현

Unchecked는 `oe-background-primary`와 `oe-border-primary`를 사용한다. Checked는 Control 전체를 `oe-brand-background-bold-primary`로 채우고 중앙에 8px Indicator를 `oe-background-primary`로 표시한다. Focus visible은 2px 간격의 2px `oe-focus-ring`을 사용한다. Disabled Checked는 `oe-background-disabled-selected` Control과 `oe-foreground-inverse` Indicator를 사용한다. Disabled 채움은 Light와 Dark가 모두 같은 값이므로 Indicator만 모드에 따라 대비를 얻는 토큰을 쓴다.

현재 RadioField에는 크기 또는 위치가 변하는 Pressed motion을 적용하지 않는다. Control의 상태색과 Field의 Hover 등 기존 상호작용 피드백만 유지하며, 전체 축소 효과는 모바일 공통 Motion 체계를 정할 때 다른 조작 요소와 함께 다시 검수한다.

Radio Group 위에 보이는 질문이나 제목은 Field의 전체 조작 영역이 아니라 실제로 보이는 Radio Indicator의 왼쪽 시작점에 맞춘다. 화면 또는 Surface의 20px 바깥 여백과 제목 시작점은 그대로 유지하고, 기본 RadioField의 8px 내부 조작 여백은 Field를 왼쪽으로 8px 보정해 바깥 방향으로 확보한다. 별도 콘텐츠와 Control만 결합한 구성에서는 불필요한 내부 들여쓰기를 제거해 제목과 Indicator의 시각 시작점을 맞춘다.

**이 보정은 Group만의 규칙이 아니다.** RadioField가 Indicator의 왼쪽 시작점을 다른 요소와 맞춰야 하는 자리라면 단독으로 쓸 때도 같은 8px을 바깥으로 보정한다. **여백 자체를 없애지 않는다.** 그 8px은 행의 조작 영역이므로 지우면 누를 수 있는 영역이 줄어든다. 기준은 [checkbox.md](checkbox.md)와 같다.

Read only는 Enabled와 같은 기본 시각과 Focus를 유지하지만 Pointer 또는 키보드 조작으로 선택값을 변경하지 않는다. 값 변경 가능성을 암시하는 Hover 배경·Hover shadow와 Pressed 피드백은 제거한다. Disabled와 달리 비활성 색상이나 `not-allowed` cursor는 사용하지 않는다.

RadioField의 보이는 Label은 `aria-labelledby`로 Radio Control의 접근 가능한 이름에 연결한다. 선택값을 고정해 비교하는 경우에도 Pointer, Focus visible과 키보드 피드백은 차단하지 않는다. Disabled는 실제 조작 불가 상태를 유지하고 Read only는 Focus만 유지한 채 Hover·Pressed와 값 변경을 차단한다.

RadioField의 전체 조작 영역은 항상 투명하며 선택 여부와 관계없이 값 변경이 가능한 Field의 Hover에만 옅은 `oe-interaction-hover-subtle`을 사용한다. 선택 상태는 Indicator의 Brand 표현으로 전달하고 Disabled와 Read only Field는 Hover 반응을 제공하지 않는다.

Radio는 Checkbox와 마찬가지로 Label 외에 선택을 이해하는 데 필요한 시각 콘텐츠와 결합할 수 있다. Studio Guidelines는 16px Radio Control을 36px 조작 영역 안에 중앙 정렬한 `Control only · 36px target` 예시와 상단 미리보기·하단 왼쪽 Radio와 Label을 결합한 3개의 가로 선택 항목을 2-grid로 비교한다. 오른쪽 시각 예시의 제목은 특정 사례명이 아니라 `콘텐츠 결합 예시`로 표시한다. 실제 UI 예시는 GuideVisual이 제공하는 하나의 `oe-background-primary` Surface 안에 20px 패딩을 두고 16px Semibold `테마 설정` 제목과 `시스템 설정`·`밝은 모드`·`어두운 모드` 선택지를 직접 배치한다. 세 선택지는 현재 언어에서 가장 긴 Label의 max-content 너비를 공통 최소 너비로 사용해 균등하게 배치하며, 좁은 화면에서는 Label을 나누지 않고 가로 스크롤한다. 별도의 내부 Surface를 중첩하지 않으며 기존 Surface와 텍스트는 Studio의 Light/Dark 전환을 그대로 따른다. 이미지 외곽 구조선은 Light에서 Black 10%, Dark에서 White 16% alpha를 사용해 어두운 배경에서도 경계를 유지한다. 단, 밝은 모드와 어두운 모드를 설명하는 미리보기 자체의 색상은 선택지 의미를 보존한다. 이 예시는 일반 콘텐츠가 선택 동작을 소유하고 Radio Control만 상태 표시와 입력에 재사용한 조합이다. 항목 전체에는 별도 border, surface와 Hover 효과를 적용하지 않고 미리보기에도 그림자를 사용하지 않는다. 선택한 항목의 미리보기 이미지에는 3px 간격을 둔 2px `brand-alpha-40` ring을 표시하며, ring과 Radio/Label 행 사이는 4px이다. Radio/Label 행에는 왼쪽 4px 여백을 둬 미리보기 이미지와 시각적인 시작점을 맞춘다. 키보드 Focus에서는 별도 링을 중첩하지 않고 같은 2px ring의 색만 `oe-focus-ring`으로 바꾸며, Focus가 해제되면 150ms 동안 선택 색으로 부드럽게 복귀한다. 같은 RadioGroup의 항목은 동일한 정보 구조와 크기를 사용하고 한 번에 하나만 선택한다. 여러 항목을 동시에 선택해야 하는 경우에는 Checkbox Control을 같은 방식으로 조합한다.

## Guidelines

Studio 화면의 Guidelines와 소제목을 동일하게 유지한다.

### Target area 확보하기

16px Control만 보이더라도 RadioField는 최소 36px 높이의 조작 영역을 확보한다. 목록이나 행과 결합하면 Control만이 아니라 Label을 포함한 전체 RadioField를 선택 영역으로 사용한다.

### 서로 배타적인 선택에 사용하기

Radio는 하나를 고르면 같은 Group의 이전 선택이 해제되는 항목에 사용한다. 각 항목을 따로 켜고 끌 수 있어야 한다면 Checkbox를 사용한다. 서로 독립적인 설정을 Radio 한 Group으로 묶지 않는다.

### Group의 질문을 명확하게 표시하기

Radio 목록 위에 Group 전체가 답하는 질문을 표시한다. 접근 가능한 Group 이름은 보이는 제목과 연결한다. 각 Radio의 Label은 서로 구분되는 답을 간결하게 설명한다. 선택지가 무엇에 대한 답인지 추측하게 만들지 않는다.

### Disabled 상태를 명확하게 표시하기

Control과 Label 전체에 Disabled 표현을 적용한다. Control만 비활성화하고 Label을 활성 상태처럼 남기지 않는다. 사용할 수 없는 이유가 필요하면 Field의 설명이나 주변 안내로 제공한다. Disabled 상태에서도 기존 선택값은 보존한다.

### 선택 가능한 콘텐츠와 결합하기

Radio는 16px Control을 기본 단위로 사용하고, 실제 화면에서는 Label이나 선택 가능한 콘텐츠와 결합해 충분한 조작 영역을 확보한다. 이 조합은 별도 Container 변형이 아니라, 선택 가능한 콘텐츠가 동작을 소유하고 Radio Control만 상태 표시와 입력에 재사용한 것이다. 같은 Group의 카드는 동일한 정보 구조와 크기를 사용하고 한 번에 하나만 선택되도록 한다. 여러 카드를 동시에 선택할 수 있어야 한다면 Checkbox Control을 같은 방식으로 조합한다.

### Radio 나열하기

Radio는 반드시 하나의 Group 안에서 사용하고 같은 질문에 대한 선택지만 함께 묶는다. 여러 Radio는 기본적으로 세로로 나열해 Label을 빠르게 훑을 수 있게 한다. 짧은 항목을 빠르게 비교하는 밀도 높은 관리자 화면에서는 16px 간격의 가로 줄바꿈을 사용할 수 있다.

## Specification

- Control: 16 × 16px
- Indicator: 8 × 8px
- RadioField minimum height: 36px (`oe-control-regular`)
- Label: 14px / 20px, Regular

