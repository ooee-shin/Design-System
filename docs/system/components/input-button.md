# Input Button

`packages/ui/src/input-button.tsx`

직접 입력하는 대신 별도의 선택 화면을 여는 한 줄 Form control이다. Input과 같은 외관을 사용하지만 실제 구현은 `button`이며, 사용자가 값을 타이핑하는 Input과 역할을 구분한다.

## 역할과 경계

- `Input Button`은 현재 선택값 또는 Placeholder를 표시하고 소비자가 연결한 후속 화면을 여는 Trigger다.
- 달력, 주소 검색, 시간 선택처럼 직접 타이핑하지 않고 별도 UI에서 값을 정하는 경우에 사용한다.
- 후속 Picker, Dialog, Bottom Sheet 또는 검색 화면의 종류와 선택 로직은 Input Button이 소유하지 않는다.
- 정의된 옵션을 Popup 내부에서 직접 검색하고 선택하는 `Combobox`와는 역할을 구분한다.
- Label, Helper text와 Error message는 별도 `Field`가 소유한다.

## Anatomy

1. Container: Input과 같은 시각적 외곽을 가진 실제 Button이다.
2. Leading element: 선택 요소다. 기본 사례는 Remix Icon을 사용하며 Color Picker의 선택 전용 사례에서는 현재 색상을 나타내는 Color swatch를 사용한다.
3. Value / Placeholder: 선택된 텍스트 값 또는 값이 없을 때 안내 문구를 표시한다.
4. Trailing element: 선택 요소다. Anatomy에서는 Leading element와 동일한 Pink 점선 Swap 영역으로 표시하고 `Properties · Elements` 카드에서는 오른쪽 화살표 예시를 확인한다. 일반 예시에서는 기본 표시하지 않는다.

내부 순서는 `Leading element → Prefix → Value / Placeholder → Suffix → Trailing element`다.

Clear button은 제공하지 않는다. Value는 현재 문자열만 허용하며 Chip 타입은 제공하지 않는다.

## Properties

- `variant` (Style): `outline | filled`, 기본값 `outline`
- `controlSize` (Size): `small | regular | large | xlarge`, 기본값 `regular`
- `layout`: `fill | fixed`, 기본값 `fill`
- Content: `value`, `placeholder`
- Optional elements: `leadingElement`, `prefix`, `suffix`, `trailingElement`
- State: 실제 Button 속성과 focus에서 확인되는 Default, Focus, Invalid, Disabled

Size는 Input과 Button이 공유하는 공통 Control Height인 32px, 36px, 40px, 48px를 사용한다. Outline Disabled에서는 입력 영역의 구조를 알 수 있도록 기본 border를 유지한다.

## Behavior

- 실제 HTML 요소는 `button`이며 기본 `type`은 `button`이다.
- Click 이후 동작은 소비자가 `onClick`과 필요한 `aria-haspopup`을 연결한다.
- Input Button 내부에는 별도의 Input, Clear button 또는 다른 Button을 중첩하지 않는다.

## 현재 검수 예시

- Calendar: 달력에서 날짜를 선택하는 화면을 여는 Trigger
- Address: 주소 검색 또는 선택 화면을 여는 Trigger
- Time: 시간 선택 화면을 여는 Trigger
- Color picker · Select only: 사각형 Color swatch와 색상명을 표시하고 직접 입력 없이 Color Picker를 여는 Trigger. Swatch 경계는 Neutral border가 아니라 안쪽에 합성한 Black alpha 10%의 1px inset을 사용한다.

예시에는 후속 선택 화면 자체를 포함하지 않는다. 해당 Picker나 검색 UI가 실제 자산으로 구현되면 `Works with` 관계로 별도 연결한다.
