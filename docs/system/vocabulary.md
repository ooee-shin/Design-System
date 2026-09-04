# 구조 용어

컴포넌트의 구성 요소를 부르는 공통 이름이다. 코드 export, Component 문서, Anatomy 범례와 Property 제목에서 같은 용어를 사용하며 임의의 동의어를 섞지 않는다.

## 요소 이름

- `Control`은 Focus, 키보드 입력과 값 변경을 직접 소유하는 상호작용 원자다. Checkbox 본체, Radio의 16px 원형과 Switch 본체가 이에 해당한다.
- `Indicator`는 Control 안에서 현재 값이나 상태를 보여 주는 비상호작용 시각 요소다. Radio의 중앙 원, Checkbox의 Check/Indeterminate 표시가 이에 해당한다. 상위 컴포넌트가 입력 동작을 소유해 별도 시각 base를 재사용하는 경우에도 값 변경과 Focus를 소유하지 않으면 Indicator로 부른다.
- `Field`는 Control과 Label을 기본으로 결합하고 Description, Leading/Trailing element 같은 Content를 선택적으로 포함하는 전체 조작 영역이다.
- `Content container`는 Label, Description과 Leading/Trailing element를 묶는 내부 영역이다. Label 하나만 가리킬 때 Content라고 부르지 않는다.
- `Container`는 Field 전체를 border, background 또는 다른 Surface로 감싼 선택 영역이다. 단순 Wrapper나 Popup을 Container로 부르지 않고 실제 시각 Surface 또는 명확한 구조 범위를 가질 때 사용한다.
- `Popup`은 Trigger를 눌러 여는 떠 있는 영역이다. Select와 Combobox의 옵션 목록이 이에 해당하며 시각 Surface를 가져도 `Container`라고 부르지 않는다.
- `Trigger`는 Popup을 여는 조작 요소다. 자체 Surface를 가질 때는 `Trigger container`라고 부른다.

별도 Wrapper가 실제로 존재하지 않으면 `Control container`처럼 역할명 뒤에 Container를 덧붙이지 않는다. `Control` 또는 컴포넌트가 분명해야 할 때는 `Radio control`, `Checkbox control`처럼 쓴다. 원자 예시 제목은 실제 역할에 따라 `Control only`, `Indicator only`처럼 작성한다.

## 업계 명칭 대응

컴포넌트마다 업계에서 굳어진 Anatomy 명칭이 있으면 그 명칭을 쓰고 아래 대응표로 역할을 함께 밝힌다. 한 컴포넌트 안에서 두 이름을 섞어 쓰지 않는다.

| 컴포넌트 | Anatomy 명칭 | 역할 |
| --- | --- | --- |
| Switch | Track / Thumb | Control / Indicator |
| Checkbox | Checkbox control / Selection indicator | Control / Indicator |
| Radio | Radio control / Selection indicator | Control / Indicator |

## Container 변형 정책

Radio와 Checkbox에는 카드형 `RadioContainer`·`CheckboxContainer` 변형 컴포넌트를 두지 않는다.

- 짧은 Label을 밀도 있게 나열하는 폼은 `RadioField`·`CheckboxField`를 사용한다.
- 설명이나 이미지가 포함된 선택지를 넓은 Surface에서 비교하는 단일·다중 선택은 `SelectBox`가 소유한다.
- 일반 콘텐츠가 선택 동작을 소유하고 base Control 또는 Indicator만 재사용하는 조합은 활용 예시로 허용한다. 이는 확장 가능성을 보여 주는 예시이며 새 변형 컴포넌트를 추가하는 것이 아니다.

## 모양 어휘

`Square`, `Rounded`, `Circle(Pill)`을 공통 어휘로 사용하며 각 컴포넌트가 `shape` Property로 소유한다.

- 서비스는 컴포넌트별로 하나의 모양을 고르는 것을 권장한다.
- 서비스가 Rounded 방향을 택했더라도 모든 컴포넌트가 Rounded여야 하는 것은 아니며 컴포넌트마다 적합한 모양을 선택할 수 있다.
- 같은 컴포넌트를 한 서비스 안에서 인스턴스마다 섞어 쓰는 것은 권장하지 않는다.
- 강제 규칙이 아니므로 필요하면 예외를 둘 수 있다.

공통 어휘로 설명되지 않는 값은 해당 컴포넌트의 고유 값으로 둔다. Container 자체를 제거하는 Checkbox의 `Ghost`와 Container 구조가 달라지는 Input의 밑줄형이 이에 해당하며, 모서리 대안과 같은 `shape` 안에 두되 모양 어휘의 예외임을 해당 컴포넌트 문서에 밝힌다.
