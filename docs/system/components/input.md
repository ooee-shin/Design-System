# Input

`packages/ui/src/input.tsx`

한 줄 텍스트 입력을 위한 공용 컴포넌트다. 동작은 Base UI를 기반으로 한다.

반복 사용되는 부분 입력·고정 마스킹 동작의 실제 구현은 `packages/ui/src/partial-masked-input.tsx`가 소유한다.

## 역할과 경계

- `Input`은 Container, 실제 input field와 내부 선택 요소를 소유한다.
- Label, Helper text와 Error message는 별도 `Field`가 소유한다.
- Label, 도움말과 오류 문구는 별도 `Field`가 소유하며 Input 문서에서 그 API를 정의하지 않는다.

## Anatomy

1. Container: 모든 내부 요소와 focus/invalid/disabled 시각 상태를 감싼다.
2. Leading element: 선택 요소이며 현재 Icon을 사용한다.
3. Prefix: 값 앞에 붙는 선택 요소다. `ReactNode`를 받으므로 텍스트 외의 요소도 둘 수 있다.
4. Input field: 필수 입력 요소다.
5. Clear button: 선택적인 입력 지우기 action이다. 입력값 바로 뒤에 위치하며 실제 값 변경은 `onClear`가 소유한다. 소비자가 `clearable`로 표시 여부를 전달하며 Input에 focus가 있을 때만 나타난다. Input은 값을 소유하지 않으므로 값의 유무는 소비자가 판단한다. 값이 없을 때는 버튼을 렌더링하지 않아 자리를 차지하지 않는다. 값이 생기면 마운트 직후 프레임에 나타나고 값이 사라지면 전환이 끝난 뒤에 걷어낸다. opacity와 폭을 같은 150ms에 함께 전환하므로 버튼이 옅어지는 것과 값이 자리를 되찾는 것이 동시에 일어난다. 전환 시간은 focus 전환과 같다. Clear button을 누를 때는 mousedown 기본 동작을 막아 focus를 입력창에 유지한다. focus가 빠져나가면 focus 전환과 값 전환이 다른 시점에 시작되어 두 속도로 보이고, 지운 뒤에 이어서 입력할 수도 없다. 접근 가능한 이름은 `clearLabel`로 전달하며 기본값은 `Clear input`이다.
6. Suffix: 값 뒤에 붙는 선택 요소다. `ReactNode`를 받으므로 텍스트 외의 요소도 둘 수 있다.
7. Trailing element: 선택 요소이며 현재 Icon을 사용한다.

내부 요소의 고정 순서는 `Leading element → Prefix → Input field → Clear button → Suffix → Trailing element`다.

## Properties

- `variant` (Style): `outline | filled`, 기본값 `outline`
  - Outline: 기본 surface와 Neutral border
  - Filled: Neutral secondary background와 투명 border. Focus 상태에서는 기본 흰색 surface로 전환
- `controlSize` (Size): `small | regular | large | xlarge`, 기본값 `regular`
- `layout`: `fill | fixed`, 기본값 `fill`
  - Fill: 부모가 제공하는 너비를 채우며 Field 결합의 기본 동작
  - Fixed: `fixedWidth`에 명시한 너비를 유지하되 부모보다 넓어지지 않음
  - Hug는 입력값 변화에 따라 외곽 너비가 달라질 수 있어 Input Container의 공식 Layout에서 제외
- `textAlign`: `left | right`, 기본값 `left`. 입력값과 Placeholder에만 적용
- State: native 속성과 focus에서 확인되는 Empty / Placeholder, Default with value, Focus, Invalid, Disabled, Read only
- Optional elements: `leadingElement`, `prefix`, `clearable`, `suffix`, `trailingElement`
- `containerClassName`: Container에만 적용하는 class다. Input field에는 `className`을 사용한다

Focus는 테두리와 바깥 ring에 동일한 `oe-focus-ring` 색을 사용한다. 기본 1px border 바깥에 1px ring을 겹쳐 하나의 진한 2px 선처럼 보이게 하며, 실제 box size를 변경하지 않아 인접 요소나 중첩 배치가 흔들리지 않는다.

Invalid/Error도 같은 1px border + 외부 1px ring 구조를 사용하며 두 영역 모두 `oe-danger-border-primary`를 적용한다. Focus와 외곽 두께 및 레이아웃 동작은 같고 의미 색상만 구분한다.

Disabled는 foreground와 background 위계를 낮추고 상호작용을 제한하되, Outline 스타일에서는 기본 Neutral border를 유지해 입력 영역의 구조가 사라지지 않게 한다. Filled 스타일은 기존의 투명 border 구조를 유지한다.

Placeholder는 실제 입력값과 명확히 구분하기 위해 전용 `oe-foreground-placeholder` semantic token을 사용한다. 현재 매핑은 Light `neutral-400`, Dark `neutral-500`이며 실제 입력값은 `oe-foreground-primary`를 유지한다.

Input에는 별도 `numeric` Boolean Property를 추가하지 않는다. 수량·비율처럼 계산 가능한 숫자값은 Number Input을 사용하고, 증감 버튼이 필요 없으면 Number Input의 Controls를 숨긴다. 전화번호·사업자번호·카드번호처럼 숫자로 보이는 식별자는 Input의 native `inputMode="numeric"`와 필요한 포맷·`tabular-nums`를 조합한다.

## 공통 Control Height

Input 전용 값이 아니라 Button과 한 줄 Form control이 함께 사용하는 크기 기준이다.

- Small: 32px
- Regular: 36px
- Large: 40px
- XLarge: 48px

Checkbox, Radio, Switch는 이 높이를 직접 적용하지 않는다. Textarea는 별도 최소 높이 또는 row 정책이 필요하다. Button과 다른 한 줄 Form control의 기존 API는 Input 이후 같은 공통 Size로 정규화한다.

## Guidelines

Studio 화면의 Guidelines와 소제목을 동일하게 유지한다.

### Prefix·Suffix와 Leading·Trailing element를 나눠 쓰기

Prefix와 Suffix는 값의 의미를 보완하는 짧은 표기 자리다. 통화 기호와 단위가 여기에 온다. Leading element와 Trailing element는 값을 식별하거나 조작을 여는 요소 자리이며 검색을 나타내는 아이콘이나 보기 전환 action이 여기에 온다.

내부 순서는 `Leading element → Prefix → Input field → Clear button → Suffix → Trailing element`로 고정된다. 같은 의미의 요소를 두 자리에 나눠 두지 않는다.

### Clear button은 값을 자주 비우는 자리에 두기

Input은 값을 소유하지 않으므로 값의 유무는 소비자가 판단해 `clearable`로 전달한다. 값이 없으면 버튼을 렌더링하지 않아 자리를 차지하지 않고, Input에 focus가 있을 때만 나타난다.

검색, 필터, 금액처럼 값을 지우고 다시 입력하는 자리에 둔다. 한 번 정하면 유지되는 이름이나 주소에는 두지 않는다. 버튼이 늘 자리를 지키면 지울 일이 없는 값에도 지우기를 권하는 것처럼 보인다.

### 숫자 값은 Number Input과 나눠 쓰기

Input에는 별도 `numeric` Property를 두지 않는다. 수량, 순서, 비율처럼 계산에 쓰이는 숫자는 Number Input을 사용하고 증감 버튼이 필요 없으면 Number Input의 Controls를 숨긴다.

전화번호, 사업자번호, 카드번호처럼 숫자로 보이지만 계산하지 않는 식별자는 Input이 담당한다. native `inputMode="numeric"`과 필요한 포맷, `tabular-nums`를 조합한다. 자리 구분이 필요한 금액도 Input이 담당한다. Number Input은 값에 구분자를 담을 수 없다.

## 현재 정의하지 않은 항목

- Shape variant
- Field API와 배치 규칙
- Prefix/Suffix 콘텐츠 제한 정책
- Input별 권장 Size 정책

Playground의 Optional element는 하나의 Elements 묶음으로 제어하지 않는다. Leading/Trailing/Clear는 각각 표시 여부를 독립적으로 제어하고, Prefix/Suffix는 표시 여부와 실제 text 값을 별도 Property로 제어한다.

Properties · Elements의 Trailing element 예시는 `Password input → Clear button → Visibility trailing action` 순서로 현재 확정된 요소를 조합한다. 비밀번호용 Leading icon은 사용하지 않는다. Visibility action은 실제 input type을 `password/text`로 전환하고 Clear button은 값이 있을 때 입력값을 제거한다. 이는 Trailing element의 실제 조합 예시이며 새로운 Input Property를 추가하지 않는다.

Custom input 섹션은 카드 제목의 첫 줄에 유형을, 둘째 줄에 실제 구조와 동작을 설명한다. 반복되는 `Custom input` 접두어는 사용하지 않는다.

`Color input`은 `Custom input`과 같은 상세 페이지 섹션 위계로 분리한다. HEX 값을 직접 입력하는 Input과 현재 색상을 보여주는 Leading color swatch를 조합하며, swatch는 Input Button의 선택 전용 Color picker 예시와 같은 16px 사각형 및 안쪽 Black alpha 10% 경계를 사용한다.

`Formatted number`는 전화번호, 사업자등록번호처럼 정해진 숫자 형식이 필요한 경우 포맷과 동작을 직접 정의하는 사례다. 현재 화면은 하나의 `tel` Input에서 숫자만 받아 `010-1234-5678` 형식으로 자동 포맷한다. `inputMode="numeric"`, `autoComplete="tel"`과 Clear button을 조합하며 Leading icon은 사용하지 않고 전화번호를 여러 필드로 분리하지 않는다. 사업자등록번호는 적용 가능한 용례이며 현재 화면에 별도 포맷 예시는 구현하지 않았다.

`Amount`는 하나의 Input에서 숫자만 받아 천 단위 구분 쉼표를 자동 적용한다. 금액 입력값은 오른쪽 정렬한다. 입력값과 통화 단위는 분리하며 `원`은 Suffix로 표시한다. 영문 검수에서는 같은 위치에 `KRW`를 표시한다. 포커스 전에는 숨겨진 Clear button의 너비를 `0`으로 접어 금액과 Suffix 사이에 불필요한 공백을 남기지 않는다. 포커스되면 버튼 영역이 `24px`까지 애니메이션되며 펼쳐져 금액 텍스트가 자연스럽게 밀리고, 포커스가 빠지면 다시 접힌다.

`Segmented input · Single container`는 하나의 외곽 Container 안에서 값을 여러 실제 input field 그룹으로 나누는 일반 구조다. 각 그룹의 마스킹 여부는 용도에 따라 독립적으로 선택할 수 있다. 현재 검수 예시는 최대 4자리의 input field 네 개와 고정 separator `-`를 배치하며, placeholder도 `1234 / 5678 / 9012 / 3456`으로 각 필드가 별도로 소유한다. 각 필드는 4자리 렌더링이 잘리지 않는 최소 안전 폭만 차지하고 왼쪽부터 hug 배열되어 남는 공간은 Container 오른쪽에 유지된다. 숫자는 `tabular-nums`를 사용한다. 현재 예시에 한해 1·2번째 필드는 숫자를 표시하고 3·4번째 필드는 실제 `password` input으로 입력값을 닷 처리한다. 4자리 입력 시 다음 필드로 이동하며, 빈 필드의 Backspace는 이전 필드로 이동한다. 16자리 문자열을 한 필드에 붙여넣으면 네 필드로 분배한다.

`Split input · Multiple containers`는 인증코드처럼 한 자리씩 입력하는 독립 Input Container 여섯 개로 하나의 값을 구성한다. 각 Container는 카드 너비를 채우지 않고 한 글자 입력에 필요한 폭만 유지하며, 여섯 칸 묶음은 카드 중앙에 정렬한다. 각 Input은 숫자 1자리만 받고, 입력하면 다음 Input으로 이동하며 빈 Input에서 Backspace를 누르면 이전 Input으로 돌아간다. 여러 자리 인증코드를 붙여넣으면 현재 위치부터 각 Input에 분배한다.

`PartialMaskedInput`은 전체 자릿수 중 일부만 실제로 입력받고 나머지는 고정 masking으로 표시하는 공용 UI 컴포넌트다. `inputLength`와 `totalLength`로 실제 입력 자릿수와 전체 표시 자릿수를 구분하며, 실제 입력 영역과 고정 닷의 간격·자간·숫자 제한을 한 구현에서 소유한다. 실제 입력 영역과 고정 마스킹 사이는 2px로 분리하고 각 영역 내부의 자간은 유지한다. `maskInput`으로 실제 입력 부분을 숫자로 표시할지 닷으로 가릴지 선택하며 기본값은 `true`다. 입력된 자릿수만 숫자 또는 입력 마스킹으로 치환하고 나머지 자리는 닷으로 유지한다. 아직 입력할 수 있는 미입력 자리는 Placeholder와 같은 `oe-foreground-placeholder`로 더 옅게 표시하며, 사용자가 입력할 수 없는 고정 마스킹 자리는 `oe-foreground-secondary`로 구분한다. 현재 일반 검수 예시는 `maskInput={false}`로 총 4자리 중 앞 2자리를 입력받으며, 한 자리만 입력한 경우에도 옅은 입력 가능 닷 1개와 고정 닷 2개를 유지한다. 두 자리를 모두 입력하면 숫자 2자리와 뒤의 고정 닷 2개를 표시한다. 주민등록번호 예시도 같은 표시 방식으로 뒷자리의 실제 입력 1자리는 숫자로 보이고, 이후 6자리만 고정 masking으로 표시한다.

`Resident registration number`는 같은 `PartialMaskedInput`을 해당 형식에 적용한 별도 사례다. Input Container 두 개와 그 사이의 외부 separator `-`로 구성한다. 첫 Input은 생년월일 숫자 6자리이며 완료하면 두 번째 Input으로 이동한다. 두 번째 영역은 `inputLength={1}`, `totalLength={7}`, `maskInput={false}`를 사용해 실제 숫자 1자리와 고정 masking 6자리를 표시한다. Custom input의 기본 검수 상태는 개인정보처럼 보이는 가상 값도 미리 채우지 않은 빈 값이다.

Playground Property editor의 공통 분류는 Appearance → Size → Layout → Content → Elements/Slots → Behavior → State다. 현재 Input에서 Clear button의 표시 여부는 Elements 안에서 실제 내부 배치 순서에 맞춰 제어하며 별도 Behavior 속성은 노출하지 않는다. State는 Default, Focus, Invalid, Disabled, Read only 중 하나를 Preview에 적용하며 아래의 정적 State 비교에는 영향을 주지 않는다. Empty/Placeholder와 With value는 State API가 아니라 Content 값의 유무로 확인한다.

Desktop Playground에서는 Preview를 상단에 유지하고 Property panel의 내부 스크롤은 사용하지 않는다. Property panel의 왼쪽 열은 여러 컴포넌트에 공통적인 Appearance, Size, Layout, State를, 오른쪽 열은 Input 고유 구성이 많은 Content, Elements, Behavior를 표시한다. 좁은 viewport에서는 두 열을 다시 한 열로 합쳐 중첩 스크롤과 가로 압축을 피한다.

Playground는 제목 앞의 `🚩` 표시와 2px `oe-border-bold-primary`로 일반 명세 영역보다 강하게 구분한다. Preview surface는 Property panel의 전체 높이를 채우되 Input 자체는 상단에 정렬한다.

Leading/Trailing element는 Playground에서 기본 Off다. 표시를 켜면 실제 아이콘으로 오해하지 않도록 점선 사각형 `Position` placeholder가 먼저 나타난다. 이후 Icon Select에서 제한된 Remix Icon 예시를 선택해 실제 아이콘으로 바꿀 수 있다. 전체 Remix Icon catalog를 Playground에 복제하지 않으며 현재는 Search, Password Lock, User, Global, Calendar를 검수 후보로 제공한다. 오른쪽 Property editor의 높이가 달라져도 Preview Input은 상단 위치를 유지한다.

Anatomy의 번호는 실제 요소 안에 들어가지 않는다. 1px 연결선으로 실제 요소 위치를 표시하고 Container는 전체 범위를 감싸는 선으로 구분한다. 아래 범례는 번호별 요소명을 왼쪽부터 나열하며 선택 요소의 `(Optional)` 표시는 한 단계 옅은 foreground를 사용한다.

상세 페이지 우측의 `On this page`는 긴 문서의 섹션 이동을 제공한다. 목차는 평평한 단일 rail을 사용하며 화면의 활성 구간에 여러 섹션이 걸리면 해당 항목을 모두 강조하고, 활성 선의 위치와 높이는 300ms로 자연스럽게 전환한다. Textarea 이동은 본문 하단 카드가 아니라 rail 아래의 낮은 위계 Related 링크로 제공한다.
