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

내부 순서는 `Leading element → Value / Placeholder → Trailing element`다.

Clear button과 Prefix, Suffix는 제공하지 않는다. Value는 현재 문자열만 허용하며 Chip 타입은 제공하지 않는다. 값의 의미를 보완하는 짧은 표기가 필요하면 값을 직접 입력받는 Input을 사용한다.

## Properties

- `variant` (Style): `outline | filled`, 기본값 `outline`
- `controlSize` (Size): `small | regular | large | xlarge`, 기본값 `regular`
- `layout`: `fill | fixed`, 기본값 `fill`
- Content: `value`, `placeholder`
- Optional elements: `leadingElement`, `trailingElement`
- `readOnly`: `boolean`, 기본값 `false`. 값은 보여주되 `onClick`을 호출하지 않는다
- State: 실제 Button 속성과 focus에서 확인되는 Default, Focus, Invalid, Disabled, Read only

Size는 [interaction.md](../interaction.md)의 「공통 Control Height」를 따른다. Outline Disabled에서는 입력 영역의 구조를 알 수 있도록 기본 border를 유지한다.

## Behavior

Input Button은 다른 폼 요소와 함께 조회와 편집 두 상태로 쓰인다. 조회에서는 `readOnly`를 사용한다. `readonly`는 `input`·`textarea`·`select`에만 있는 HTML 속성이고 `button`에는 없으므로, `aria-disabled`로 알리고 `disabled`는 걸지 않는다. 그래야 focus가 유지되어 키보드로 값을 지나갈 수 있다. 클릭과 Enter·Space 실행만 막아 `onClick`을 호출하지 않는다. 실제로 무엇을 열지는 이 컴포넌트를 가져다 쓰는 화면이 소유하므로, Read only가 막는 것은 여는 동작 자체가 아니라 그 호출이다. 값을 바꿀 수 없다는 점은 `disabled`와 같지만 조작 대상에서 빠지지 않는다.

- 실제 HTML 요소는 `button`이며 기본 `type`은 `button`이다.
- Click 이후 동작은 소비자가 `onClick`과 필요한 `aria-haspopup`을 연결한다.
- Input Button 내부에는 별도의 Input, Clear button 또는 다른 Button을 중첩하지 않는다.

## Guidelines

Studio 화면의 Guidelines와 소제목을 동일하게 유지한다.

### Placeholder는 문장이 아니라 형식이나 키워드로 쓰기

값이 없으면 Placeholder가 유일한 안내다. 눌러야 값을 정할 수 있으므로 무엇을 고르는 자리인지 먼저 읽혀야 한다.

`주소를 선택해 주세요` 같은 문장 대신 `주소 선택`처럼 키워드로 쓴다. 정해진 형식이 있으면 `YYYY. MM. DD`처럼 형식을 그대로 보여준다. 한 줄 Control 안에서 문장은 잘리기 쉽고, 값이 채워지면 사라지는 문구에 존댓말 어미를 붙일 만큼의 자리가 없다.

### 형식과 기간은 Placeholder로 알리기

정해진 형식이 있으면 `YYYY. MM. DD`처럼 형식을 그대로 보여준다. 무엇을 고르는지와 어떤 모양으로 채워지는지를 함께 알린다.

기간처럼 값이 둘이면 Trigger를 두 개로 나누고 사이에 물결표를 둔다. 각 Placeholder는 `시작일`과 `종료일`처럼 그 자리가 무엇인지 말한다. 하나의 Trigger에 기간 전체를 담으면 어느 쪽을 고치는 중인지 알 수 없고, 값이 채워졌을 때 두 날짜가 한 줄에서 잘린다.

### 조회는 Read only, 쓸 수 없을 때만 Disabled

다른 폼 요소와 함께 조회와 편집 두 상태로 쓰이므로 조회에는 `readOnly`를 사용한다. focus가 유지되어 키보드로 값을 지나갈 수 있고 값은 그대로 읽힌다.

`disabled`는 값 자체를 쓸 수 없는 상태에만 사용한다. 조작 대상에서 빠져 키보드로 지나갈 수 없으므로, 읽기만 하는 화면에 쓰면 값이 있는 자리를 건너뛰게 된다.

Read only가 막는 것은 여는 동작 자체가 아니라 그 호출이다. 실제로 무엇을 열지는 이 컴포넌트를 가져다 쓰는 화면이 소유한다.

### 내부에 다른 조작 요소를 두지 않기

Container 전체가 하나의 Button이다. 안에 별도 Input이나 Clear button, 다른 Button을 중첩하면 어느 것을 눌렀는지 알 수 없고 키보드 순서도 갈라진다.

그래서 Clear button을 제공하지 않는다. 값을 비우거나 오늘로 맞추는 것처럼 값을 바꾸는 동작은 여는 화면에서 처리하거나 Field 쪽에 둔다. Value는 문자열만 표시하며, 여러 값을 Chip으로 나열해야 하면 Combobox를 사용한다.

### Trailing element는 시각 정보만 전달하기

Trailing element는 눌러서 무엇을 하는 자리가 아니라 상태나 다음 동작을 알리는 자리다. Container 전체가 하나의 Button이라 이 자리에 조작을 걸 수 없고 시각 정보만 전달할 수 있다. 오른쪽 화살표처럼 눌렀을 때 화면이 열린다는 것을 알리는 표시를 둔다.

보기 전환처럼 누르는 action이 필요하면 값을 직접 입력받는 Input을 사용한다. Input의 Trailing element는 조작을 담을 수 있다.

Leading element는 Input과 같은 성격이며 값을 식별하는 요소를 둔다. Prefix와 Suffix는 제공하지 않으므로 값의 의미를 보완하는 짧은 표기가 필요하면 Input을 사용한다.

### Input Button과 Select를 나눠 쓰기

달력, 주소 검색, 시간 선택처럼 값을 정하는 수단이 별도 화면이면 Input Button을 사용한다. 어떤 화면을 열지는 이 컴포넌트가 소유하지 않는다.

미리 정의된 짧은 목록에서 바로 고르면 Select를 사용한다. Popup 안에서 검색해 고르거나 선택값을 계속 보면서 다뤄야 하면 Combobox를 사용한다.

### Color input은 직접 입력 여부로 나누기

색상 코드를 직접 입력받아야 하면 Input을 사용한다. HEX 값을 타이핑할 수 있고 Leading element의 Color swatch가 현재 색을 함께 보여준다.

값을 타이핑하지 않고 색상 선택 화면에서만 정한다면 Input Button을 사용한다. 두 컴포넌트는 같은 16px 사각형 swatch와 안쪽 1px `oe-border-visual` 경계를 공유한다. 갈리는 것은 겉모습이 아니라 값을 직접 입력받는지 여부다.

## 현재 검수 예시

- Calendar: 달력에서 날짜를 선택하는 화면을 여는 Trigger
- Address: 주소 검색 또는 선택 화면을 여는 Trigger
- Time: 시간 선택 화면을 여는 Trigger
- Color picker · Select only: 사각형 Color swatch와 색상명을 표시하고 직접 입력 없이 Color Picker를 여는 Trigger. Swatch 경계는 Neutral border가 아니라 안쪽에 합성한 1px inset을 사용하며 `oe-border-visual`을 적용한다. 현재 값은 Black alpha 10%다.

예시에는 후속 선택 화면 자체를 포함하지 않는다. 해당 Picker나 검색 UI가 실제 자산으로 구현되면 `Works with` 관계로 별도 연결한다.
