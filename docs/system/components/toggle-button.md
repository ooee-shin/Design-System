# Toggle Button

`packages/ui/src/toggle-button.tsx`

누른 표시가 화면에 남는 아이콘 버튼이다. 동작은 Base UI의 `Toggle`을 기반으로 한다.

## 역할과 경계

- `ToggleButton`은 Container와 아이콘, 선택 요소인 Label을 소유한다. 켜짐과 꺼짐 두 상태를 가지며 다시 눌러야 꺼진다.
- 눌러서 실행하고 끝나는 자리는 [button.md](button.md)가 담당한다. 두 컴포넌트를 가르는 것은 누른 뒤에 버튼 자체에 남는 표시가 있는지 여부다.
- 목록을 걸러 낼 조건을 고르는 자리는 [chip.md](chip.md)가 담당한다. Chip이 켜고 끄는 것은 화면 전체에 적용되는 조건이고, ToggleButton이 켜고 끄는 것은 그 버튼이 붙어 있는 대상 하나의 상태다.
- 설정 화면에서 기능을 켜고 끄는 자리는 [switch.md](switch.md)가 담당한다. Switch는 Label과 짝을 이루어 Field 안에 놓이는 폼 컨트롤이고 ToggleButton은 대상 옆에 놓이는 아이콘 버튼이다.
- 항상 하나가 켜져 있고 끌 수 없는 위치 표시는 Tab이 담당한다. Tab을 별도 컴포넌트로 두기로 한 근거는 [open-questions.md](../../process/open-questions.md)에 있다.
- 높이와 모서리 값은 [interaction.md](../interaction.md)의 「공통 Control Height」와 「공통 Control Radius」가 소유한다. 이 문서는 어느 단계를 제공하는지만 정한다.
- 아이콘의 `Line`과 `Fill` 선택 규칙은 [icon.md](../foundations/icon.md)가 소유한다.

## Anatomy

1. Container: 모든 내부 요소와 hover/pressed/focus 시각 상태를 감싼다.
2. Icon: 필수 요소다.
3. Label: 선택 요소다.

내부 요소의 고정 순서는 `Icon → Label`이다. 아이콘은 `children`에 섞지 않고 `icon`과 `activeIcon`으로 받으며, 어느 변에 붙는지는 컴포넌트가 `data-icon`으로 직접 표시한다. 소비자가 그 표시를 매번 적지 않아도 여백 보정이 걸린다.

Button과 달리 아이콘이 붙는 변은 언제나 앞쪽 하나다. 켜고 끄는 대상은 하나이므로 그 뜻을 나타내는 아이콘도 하나이며, 뒤에 하나를 더 두면 무엇을 켜는 버튼인지 읽히지 않는다.

## Properties

- `icon`, `activeIcon`: 둘 다 필수다. `icon`에는 `Line`, `activeIcon`에는 같은 아이콘의 `Fill`을 넘긴다.
- `variant` (Style): `ghost | tonal`, 기본값 `ghost`. 둘은 꺼짐에서 같은 모습이고 무엇을 켜 두는 자리인지로 갈린다.
  - Ghost: 대상 자체에 남는 상태를 표시한다. 고정, 즐겨찾기와 찜이 여기에 해당한다. 켜져도 배경이 생기지 않고 아이콘의 색과 모양만 바뀐다.
  - Tonal: 레이어나 영역을 열어 둔 상태를 알린다. 검색 영역을 여는 버튼이 여기에 해당한다. 열려 있다는 것은 화면의 다른 부분까지 바뀌었다는 뜻이므로 켜지면 옅은 배경으로 한 단계 더 강조한다.
- `tone`: `brand | custom`, 기본값 `brand`
- `color`: `tone`이 `custom`일 때만 받으며 값은 `favorite`과 `like`다. 다른 tone과 함께 넘기면 타입에서 걸린다.
- `controlSize` (Size): `xsmall | small | regular | large | xlarge`, 기본값 `regular`
- `children`: Label. 없으면 높이와 같은 너비를 가진 정사각형이 되며 `aria-label`이 필수다.
- `pressed`, `defaultPressed`, `onPressedChange`: 켜짐 상태. Base UI `Toggle`의 이름과 동작을 그대로 쓴다.
- State: Default, Pressed, Hover, Focus visible

Button이 갖는 값 중 다섯을 두지 않는다. `variant`의 `fill`은 배경이 이미 tone 색을 다 쓰고 있어 켜짐을 표시할 자리가 남지 않고, `outline`은 실제 쓰임이 확인되지 않았다. `tone`의 `danger`는 「되돌릴 수 없는 액션」이라는 뜻을 이미 갖고 있는데 ToggleButton은 다시 눌러 되돌리는 컨트롤이라 뜻이 어긋난다. `tone`의 `neutral`도 두지 않는다. 꺼짐이 이미 중립이므로 켜짐까지 무채색이면 색이 상태를 말하지 못하고 아이콘 모양만 남는다. `layout`의 `fill`도 두지 않는다. 아이콘 하나가 늘어난 폭을 채울 이유가 없다.

## 아이콘을 두 개 받는 이유

Remix Icon은 `RiStarLine`과 `RiStarFill`이 각각 다른 React 컴포넌트다. 아이콘 하나를 받아 컴포넌트가 스스로 `Fill`로 바꿔 그릴 수단이 없으므로 꺼짐과 켜짐의 아이콘을 모두 받는다.

둘을 동시에 그려 놓고 CSS로 한쪽을 감추지 않는다. 화면 낭독기가 지금 쓰이지 않는 아이콘까지 만나게 되기 때문이며, 그래서 상태를 `render`로 받아 한쪽만 그린다.

## Size

`interaction.md`의 일곱 단계 중 다섯을 제공한다. XSmall 28px, Small 32px, Regular 36px, Large 40px, XLarge 48px이며 Button과 같은 단계다. 두 컴포넌트가 도구 모음에 나란히 놓이므로 한쪽만 단계를 달리하면 같은 줄에서 높이가 어긋난다.

좌우 여백, 아이콘과 Label 사이의 간격, 글자 크기와 아이콘 크기도 Button과 같은 값을 쓴다. 그 값들의 근거는 [button.md](button.md)의 「Size」가 소유한다.

## 켜짐과 꺼짐

꺼짐은 Style과 tone에 관계없이 하나다. 꺼진 토글은 아직 아무것도 고르지 않은 자리이므로 배경도 tone 색도 갖지 않으며, 그래서 Tonal도 꺼짐에서는 Ghost와 같은 모습이다.

| Style | 꺼짐 배경 | 꺼짐 글자 | 켜짐 배경 | 켜짐 글자 |
| --- | --- | --- | --- | --- |
| Ghost | 없음 | `oe-foreground-tertiary` | 없음 | 600 |
| Tonal | 없음 | `oe-foreground-tertiary` | Light 100 / Dark 800 | Light 800 / Dark 200 |

`variant`는 만드는 사람이 자리에 맞게 고르는 축이므로 상태가 그것을 갈아치우지 않는다. Ghost를 고른 자리는 켜져도 계속 Ghost이고, Tonal을 고른 자리에서 켜짐이 만드는 배경은 그 Style이 원래 갖는 옅은 배경이다.

Tonal에는 `tone="custom"`을 쓰지 않는다. 고정 색은 별과 하트에 굳어진 관용색이고, 영역이 열렸다는 것은 그 화면의 브랜드 색으로 말한다.

Tonal 켜짐의 배경은 Chip의 Active와 성격이 다르다. [chip.md](chip.md)는 Chip의 Active를 brand alpha 배경과 경계로 정해 두었고, ToggleButton의 Tonal은 경계 없이 팔레트 100단계 배경만 쓴다. 그래서 나란히 놓아도 두 컴포넌트가 같아 보이지 않는다.

Ghost 켜짐의 글자가 Button의 Label 단계인 800이 아니라 600인 것은, 배경이 없어 글자와 아이콘만으로 켜짐을 말해야 하는데 800에는 유채색이 거의 남지 않기 때문이다.

Hover와 Pressed는 어느 Style에서나 배경을 한 단계씩 진하게 밟는다. Light는 100에서 200, 300으로 내려가고 Dark는 800에서 700, 600으로 올라가 방향이 서로 반대다. Button이 쓰는 것과 같은 사다리다.

## Custom color

`favorite`의 노랑과 `like`의 빨강은 위 단계 규칙에 들어오지 않는다. Tailwind 팔레트도 seed에서 생성한 값도 아니고, 별과 하트가 그 색으로 굳어져 있어 브랜드를 바꿔도 함께 움직이면 안 되는 고정 색이기 때문이다.

Button의 엑셀 색과 같은 자리이며 `toggle-button.tsx`가 로컬 값으로 갖는다. 승격 여부는 [open-questions.md](../../process/open-questions.md)의 token candidate가 갖는다.

관용색이 굳어지지 않은 토글은 기본값 `brand`를 쓴다. Custom은 목록에 있는 색만 고를 수 있으므로 새로운 관용색이 필요해지면 먼저 목록에 들인다. Custom 꺼짐은 다른 tone과 같은 중립이며, 고정 색은 켜짐에만 나온다.

## Focus

두 Style 모두 보이는 경계가 없으므로 [interaction.md](../interaction.md)의 유형 3을 쓴다. 2px 간격을 두고 바깥에 2px ring을 그려 배경색과 무관하게 focus 위치가 보이게 한다.

## Guidelines

Studio 화면에 Guidelines 절을 만들 때 소제목을 여기와 동일하게 유지한다. 지금 Studio 화면에는 Playground와 Anatomy만 있다.

### 누른 표시가 화면에 남는 자리에만 쓰기

누른 뒤에도 켜진 상태가 남아 다시 눌러야 꺼지는 자리에 쓴다. 즐겨찾기, 찜, 알림 받기와 고정이 여기에 해당한다.

눌러서 실행하고 끝나는 자리에는 Button을 쓴다. 저장, 제출, 내려받기처럼 누른 뒤 버튼에 남는 표시가 없으면 그쪽이다.

목록을 걸러 낼 조건을 고르는 자리에는 Chip을 쓴다. 켠 것이 값으로 남아 다른 컨트롤과 함께 하나의 조건을 만들면 그쪽이다. 설정 화면에서 기능을 켜고 끄는 자리에는 Switch를 쓰고, 항상 하나가 켜져 있고 끌 수 없는 위치 표시에는 Tab을 쓴다.

### 켜짐을 색과 모양으로 함께 말하기

`icon`에는 `Line`, `activeIcon`에는 같은 아이콘의 `Fill`을 넘긴다. 그러면 켜짐이 색과 모양을 함께 갖는다.

둘에 같은 아이콘을 넘기면 색만 남는다. 색만으로 갈리는 상태는 색을 구별하기 어려운 사람에게 전달되지 않고, 옅은 배경 위에서는 누구에게나 흐려진다.

### 즐겨찾기와 찜에는 Custom color 쓰기

별의 노랑과 하트의 빨강은 사용자가 이미 알고 있는 색이다. `tone="custom"`과 `color`로 그 색을 꺼내면 켜졌다는 것을 글자 없이도 읽을 수 있다.

그 밖의 토글은 기본값 `brand`를 쓴다. 고정처럼 관용색이 없는 Ghost와, 영역이 열렸음을 알리는 Tonal이 여기에 해당한다.

### 무엇을 켜 두는 자리인지로 Style 고르기

켜 두는 것이 그 대상 자체에 남는 상태라면 Ghost를 쓴다. 항목을 위로 고정해 두는 것, 즐겨찾기에 넣어 두는 것, 찜해 두는 것이 여기에 해당한다. 상태는 그 항목에 붙어 있고 화면의 나머지는 그대로다.

켜 두는 것이 레이어나 영역을 열어 둔 상태라면 Tonal을 쓴다. 검색 영역을 여는 버튼이 여기에 해당한다. 열려 있다는 것은 화면의 다른 부분까지 바뀌었다는 뜻이므로 아이콘만으로 말하지 않고 배경으로 한 단계 더 강조한다.

켜졌다고 Style이 바뀌지 않는다. Ghost는 켜져도 배경이 생기지 않고 아이콘의 색과 모양만 바뀐다. Tonal은 꺼짐에서 Ghost와 같은 모습이고 켜지면 옅은 배경이 함께 생긴다.

### 아이콘만 있는 ToggleButton에는 접근 가능한 이름 주기

Label이 없으면 화면에 읽을 글자가 남지 않으므로 `aria-label`로 그 버튼이 무엇을 켜고 끄는지 전달한다.

이름은 켜짐과 꺼짐에서 같은 것을 쓴다. 「즐겨찾기」와 「즐겨찾기 해제」를 오가면 지금 상태와 누르면 일어날 일이 뒤섞인다. 상태는 `aria-pressed`가 이미 전달하고 있다.

개수를 함께 보여 주는 자리는 Label을 둔다. 숫자는 아이콘이 대신 말해 주지 못한다.

### 한 대상에 하나만 두기

즐겨찾기와 찜처럼 뜻이 겹치는 토글을 한 대상에 함께 두면 무엇이 어디에 저장되는지 알 수 없다.

성격이 다른 토글이 함께 필요하면 아이콘으로 갈리는 것만으로 충분한지 먼저 본다. 갈리지 않으면 Label을 단다.

## 현재 정의하지 않은 항목

- Disabled 상태. `disabled` Property도 두지 않는다. 켤 수 없는 자리에는 이 버튼을 그리지 않고, 그릴 수 있다는 것 자체가 누를 수 있다는 뜻이다
- Loading 상태
- Read only 상태. 조작만 막는 자리가 없으므로 담당할 상태도 없다
- Invalid 상태. 검증 대상이 되는 값이 없다
- 켜짐과 꺼짐 사이의 전환 애니메이션
- 여러 ToggleButton을 하나로 묶는 Toggle group
- Tooltip 정책. Button의 아이콘 전용 버튼과 함께 정한다
