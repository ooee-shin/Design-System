# Button

`packages/ui/src/button.tsx`

액션을 실행하는 공용 컴포넌트다. 동작은 Base UI를 기반으로 한다.

## 역할과 경계

- `Button`은 Container와 Label, Label 앞뒤의 아이콘을 소유한다.
- 값을 입력받거나 고르는 자리는 `InputButton`이 담당하며 그 구조와 API는 [input-button.md](input-button.md)에 있다. 두 컴포넌트를 가르는 것은 HTML 요소가 아니라 값을 다루는지 여부다. Input Button도 실제 요소는 `button`이지만 Input의 겉모습과 API를 쓴다.
- 높이와 모서리 값은 [interaction.md](../interaction.md)의 「공통 Control Height」와 「공통 Control Radius」가 소유한다. 이 문서는 어느 단계를 제공하는지만 정한다.
- 색의 단계 규칙은 [badge.md](badge.md)와 같다. 두 컴포넌트가 한 화면에 나란히 놓이므로 같은 tone에서 같은 색이 나와야 한다.

## Anatomy

1. Container: 모든 내부 요소와 hover/pressed/focus/disabled 시각 상태를 감싼다.
2. Leading icon: 선택 요소다.
3. Label: 필수 요소다.
4. Trailing icon: 선택 요소다.

내부 요소의 고정 순서는 `Leading icon → Label → Trailing icon`이다. 아이콘은 `children`에 섞지 않고 `leadingIcon`과 `trailingIcon`으로 받으며, 어느 변에 붙는지는 컴포넌트가 `data-icon`으로 직접 표시한다. 소비자가 그 표시를 매번 적지 않아도 여백 보정이 걸린다.

## Properties

- `variant` (Style): `fill | tonal | outline | ghost`, 기본값 `fill`
  - Fill: tone 색으로 배경을 채운다. 화면에서 가장 먼저 눌러야 하는 액션이 쓴다.
  - Tonal: tone 색의 옅은 배경을 쓴다. 같은 화면에 액션이 여럿이라 Fill 하나만 남겨야 할 때 나머지가 쓴다.
  - Outline: tone 색의 경계를 그리고 배경을 두지 않는다.
  - Ghost: 경계와 배경을 모두 두지 않는다. 도구 모음처럼 버튼이 여러 개 늘어서는 자리가 쓴다.
- `tone`: `brand | neutral | danger | custom`, 기본값 `brand`
- `color`: `tone`이 `custom`일 때만 받으며 현재 값은 `excel` 하나다. 다른 tone과 함께 넘기면 타입에서 걸린다.
- `controlSize` (Size): `xsmall | small | regular | large | xlarge`, 기본값 `regular`
- `layout`: `hug | fill`, 기본값 `hug`
  - Hug: 내용에 맞춘 너비를 쓴다. 버튼은 도구 모음과 표 안에도 놓이므로 이쪽이 기본값이다.
  - Fill: 부모가 제공하는 너비를 채운다. 모바일 폼 아래의 제출 버튼이 여기에 해당한다.
- `leadingIcon`, `trailingIcon`: 아이콘은 XSmall에서 12px, XLarge에서 20px이고 나머지 세 단계에서 16px이다. 그 셋이 Input의 Leading element와 같은 크기이므로 폼 안에서 나란히 놓았을 때 아이콘이 같아 보인다.
- State: Default, Hover, Pressed, Focus visible, Disabled

`tone`은 어느 색을 쓸지만 정하므로 Outline과 Ghost에서도 그 색을 따라간다. 도구 모음의 아이콘 버튼처럼 중립으로 읽혀야 하는 자리는 `tone="neutral"`을 밝혀 적는다.

## 아이콘만 있는 버튼

Label을 넘기지 않으면 좌우 여백을 지우고 높이와 같은 너비를 주어 정사각형이 된다. 크기 단계마다 아이콘 전용 단계를 따로 두면 다섯이 열이 되므로, 단계는 그대로 두고 모양만 바꾼다. 이때는 접근 가능한 이름이 없으므로 `aria-label`을 함께 넘긴다.

**이 버튼의 아이콘은 하나다.** 가운데 하나만 놓이므로 앞뒤를 나눌 자리가 없고, 둘을 그리면 무엇을 뜻하는 버튼인지 읽히지 않는다. `leadingIcon`과 `trailingIcon` 중 넘어온 하나를 쓰며 둘 다 넘어오면 Leading을 남긴다.

## Size

`interaction.md`의 일곱 단계 중 다섯을 제공한다. XSmall 28px, Small 32px, Regular 36px, Large 40px, XLarge 48px다. Input이 제공하는 넷에 XSmall이 더 있는데, 도구 모음의 아이콘 버튼이 그 높이를 쓰기 때문이다. 24px과 56px은 실제 쓰임이 확인되지 않아 제공하지 않는다.

좌우 여백은 높이를 따라 한 단계씩 오르고, 아이콘이 붙는 변은 한 단계 내린다. 아이콘은 글자보다 시각 무게가 가벼워 같은 여백을 주면 그쪽이 더 벌어져 보인다. 글자 크기는 XLarge에서만 한 단계 커지며 Input의 XLarge와 같다.

아이콘과 Label 사이는 좌우 여백보다 한참 좁다. XSmall부터 Regular까지 4px, Large와 XLarge에서 6px이다. 둘이 같은 액션을 가리키는 한 덩어리이므로, 그 사이가 벌어지면 아이콘이 Label이 아니라 왼쪽 경계에 붙은 별개 요소로 읽힌다.

아이콘 크기는 높이를 그대로 따라가지 않는다. XSmall에서 12px, Small부터 Large까지 16px, XLarge에서 20px이다. 세 단계가 16px을 함께 쓰는 것은 그 크기가 Input의 Leading element와 같아 폼 안에서 줄이 맞기 때문이다.

## 색

tone은 어느 팔레트를 쓸지만 정하고, variant는 그 팔레트의 어느 단계를 배경·글자·경계에 쓸지 정한다. 세만틱 token 이름은 tone마다 구간이 달라 조합을 하나씩 적게 만들고, 그러면 한 조합을 고쳐도 나머지가 따라오지 않는다. 프리미티브 단계로 내려오면 규칙 넷과 팔레트 셋의 곱이 되어 예외가 남지 않는다.

brand는 seed에서 생성한 `--brand-{단계}`, neutral은 `neutral`, danger는 `red`를 참조한다. 단계 이름이 같으므로 색을 꺼내는 방식만 다르고 규칙은 셋이 그대로 공유한다.

| Style | 배경 | 글자 | 경계 |
| --- | --- | --- | --- |
| Fill | 600 | white | 투명 |
| Tonal | Light 100 / Dark 800 | Light 800 / Dark 200 | 투명 |
| Outline | 없음 | Light 800 / Dark 300 | 500의 30% 알파 |
| Ghost | 없음 | Light 700 / Dark 400 | 투명 |

Fill과 Tonal의 경계를 투명으로 두는 이유는 같은 자리에서 Style을 바꿀 때 버튼 폭이 1px씩 달라지지 않게 하려는 것이다.

기본 seed에서 Brand Fill의 글자 대비는 4.46으로 WCAG 2.x의 4.5에 조금 못 미친다. 그래도 600을 유지한다. 이 단계를 정한 근거와 APCA 수치는 [badge.md](badge.md)의 「색」이 소유하며, Button이 그것을 물려받아 두 컴포넌트가 한 화면에서 같은 색을 낸다. 700으로 내리면 대비는 확보되지만 Badge와 갈라지고, brand는 seed에서 생성되므로 이 값도 seed를 바꾸면 함께 움직인다.

Hover와 Pressed는 어느 Style에서나 배경을 한 단계씩 진하게 밟는다. Light는 100에서 200, 300으로 내려가고 Dark는 800에서 700, 600으로 올라가 방향이 서로 반대다. Fill은 600에서 700, 800으로 내려간다. Outline과 Ghost는 정지 상태에 배경이 없으므로 같은 사다리를 한 칸 늦게 밟아 Hover에서 100, Pressed에서 200을 쓴다. 글자는 Ghost만 한 칸 옅은 Light 700, Dark 400을 쓴다. 배경도 경계도 없어 글자 하나로 무게가 정해지는 Style이라, 다른 셋과 같은 단계를 쓰면 물러나 있어야 할 조작이 본문 글자와 같은 무게로 읽힌다.

`custom` tone의 엑셀 색은 이 단계 규칙에 들어오지 않는다. Tailwind 팔레트도 seed에서 생성한 값도 아니고 Microsoft가 정한 고정 색이기 때문이다. 그래서 Fill의 600단계만 그 실제 값 `#217346`이며 나머지 단계는 같은 색조에서 밝기만 옮겨 위 규칙에 태울 수 있게 만든 값이다. Fill은 Light와 Dark에서 값을 뒤집지 않는다. 테마에 따라 색이 달라지면 엑셀로 읽히지 않기 때문이며, 뒤집히는 것은 배경이 옅은 나머지 셋의 색조뿐이다. 이 값들은 공용 semantic token으로 올리지 않았다.

## Focus와 Disabled

Focus 표시는 [interaction.md](../interaction.md)가 제공하는 세 유형 중에서 고르며, 경계가 보이는지에 따라 갈린다.

- Outline은 유형 1이다. 기존 1px 경계를 `oe-focus-ring` 색으로 바꾸고 바깥에 1px을 더해 2px로 보이게 한다. Input과 같은 방식이다.
- Fill, Tonal과 Ghost는 유형 3이다. 2px 간격을 두고 바깥에 2px ring을 그린다. brand fill 버튼 위에 brand 색 선을 얹으면 배경과 구분되지 않아 focus 위치가 보이지 않는다.

Disabled는 배경을 `oe-background-disabled`로, 글자를 `oe-foreground-disabled`로 바꿔 tone 색을 걷어낸다. Outline은 경계를 지우지 않고 `oe-border-primary`로 바꿔 단다. `interaction.md`가 남기라고 정한 것은 선이지 그 색이 아니며, 바꾼 뒤의 모습이 Disabled Input과 같아 한 폼 안에 나란히 놓인 둘이 함께 꺼져 보인다.

세 상태에 짝을 하나씩 더 단다. Hover와 Pressed는 그 회색을 다시 덮지 않도록, `dark:`는 Tailwind가 그 변형을 `disabled:`보다 뒤에 배치하기 때문이다. `dark:bg-`나 `dark:text-`가 하나라도 있으면 Dark에서 Disabled 색이 tone 색으로 되돌아간다.

## Guidelines

### 나란히 둘 때 간격은 6px

버튼을 둘 이상 나란히 둘 때 사이 간격은 6px이다. 크기와 Style에 관계없이 같은 값을 쓰며, 도구 모음이든 페이지 헤더든 폼 아래의 확인·취소든 이 값이 버튼 묶음의 규칙이다.

한 값으로 고정하는 이유는 묶음마다 다른 간격을 쓰면 같은 화면에서 버튼 사이가 제각각으로 보이기 때문이다. `xsmall`처럼 아주 작은 크기와 `xlarge`처럼 큰 크기는 정렬해 보고 크기별로 다른 값을 정할 수 있으나, 그때까지는 일괄 6px이다.


Studio 화면의 Guidelines와 소제목을 동일하게 유지한다.

### 액션을 실행하는 자리에만 쓰기

누르면 무언가가 실행되는 자리에 쓴다. 저장, 제출, 삭제, 내려받기와 화면 이동이 여기에 해당한다.

값을 입력받거나 고르는 자리에는 Input Button을 쓴다. 달력이나 주소 검색을 여는 것처럼 결과가 값으로 남으면 그쪽이다. 실제 HTML 요소는 둘 다 `button`이므로 가르는 기준은 태그가 아니라 값을 다루는지 여부다.

여러 개를 켜고 끄며 조건을 좁히는 자리에는 Chip을 쓴다. 아무것도 켜지지 않은 상태가 기본이고 켠 것이 값으로 남는다. 누르지 않는 표시에는 Badge를 쓴다. Badge는 interaction Property를 갖지 않으며 Hover와 Pressed 표시도 없다.

### 한 화면에 Fill은 하나만 두기

Fill은 강조를 독점하는 Style이다. 여러 개가 같은 강조를 가지면 위계가 사라져 아무것도 강조되지 않은 것과 같아진다.

같은 성격의 액션이 여럿이면 하나만 Fill로 두고 나머지는 Tonal이나 Outline으로 내린다.

### Danger는 되돌릴 수 없는 액션에만 쓰기

Danger는 누르면 되돌릴 수 없다는 경고다. 삭제, 영구 폐기, 되돌릴 수 없는 전송이 여기에 해당한다.

취소나 닫기처럼 아무것도 잃지 않는 액션에는 쓰지 않는다. 붉은 버튼이 둘 나란히 놓이면 경고가 뜻을 잃는다.

### 중립으로 읽혀야 하는 자리는 tone을 밝혀 적기

`tone`의 기본값은 `brand`이며 Outline과 Ghost에서도 그 색을 따라간다. 아무것도 적지 않으면 도구 모음의 아이콘까지 브랜드 색이 된다.

무엇을 강조하려는 것이 아니라 조작할 수단을 늘어놓는 자리라면 `tone="neutral"`을 밝혀 적는다.

### XSmall에서는 Label과 아이콘 중 하나만 두기를 먼저 보기

XSmall에서는 아이콘이 Label보다 작다. 그러면 액션을 가리키는 표시가 아니라 글자 앞의 장식처럼 보이고, 좁은 좌우 여백을 아이콘이 나눠 쓰는 만큼 Label에 남는 폭도 줄어든다.

그래서 아이콘만 있는 정사각형 버튼이나 Label만 있는 버튼을 먼저 본다. 도구 모음이 실제로 앞쪽을 쓴다.

**막는 규칙은 아니다.** 표의 행 안처럼 높이를 올릴 수 없는데 아이콘이 있어야 뜻이 통하는 자리라면 함께 두어도 된다. 그런 제약이 없다면 아이콘이 커지는 Small부터 쓴다.

### 아이콘만 있는 버튼에는 접근 가능한 이름 주기

Label이 없으면 화면에 읽을 글자가 남지 않으므로 `aria-label`로 그 버튼이 무엇을 하는지 전달한다.

아이콘 하나로 뜻이 통하지 않는 액션은 Label을 함께 둔다. 아이콘은 이미 알고 있는 액션을 빨리 찾게 하는 것이며, 처음 보는 액션을 설명하지는 못한다.

### 폼 안에서는 Control과 같은 Size 쓰기

폼 안에 나란히 놓이는 Control과 Button은 같은 크기를 쓴다. 한 단계만 어긋나도 줄이 맞지 않는다.

크기는 Field가 강제하지 않고 각 Control과 Button이 각자 소유하므로 함께 정해야 한다. 모바일 폼은 Large 이상을 쓴다.

## 현재 정의하지 않은 항목

- Loading 상태
- Read only 상태. 값을 갖지 않는 컴포넌트이므로 조작만 막는 자리는 Disabled가 담당한다
- Invalid 상태. 검증 대상이 되는 값이 없다
- 여러 버튼을 하나로 묶는 Button group
- 글자만 있고 밑줄로 표현하는 link 형태
- 아이콘 전용 버튼의 Tooltip 정책
