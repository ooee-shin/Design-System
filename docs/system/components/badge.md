# Badge

`packages/ui/src/badge.tsx`

다른 요소에 덧붙어 상태나 개수를 작게 표시한다.

## 역할과 경계

- Badge는 다른 요소에 덧붙어 상태나 개수를 표시한다. 보조 정보나 강조도 키워드형으로 짧게 붙인다.
- 자기 크기 체계를 사용하며 [interaction.md](../interaction.md)의 「공통 Control Height」를 따르지 않는다. 덧붙는 표시이므로 컨트롤과 같은 높이를 가질 이유가 없다.
- `size` 는 `small`(20px)과 `medium`(24px) 둘이며 기본값은 `small` 이다. 좌우 여백은 높이에 따라 6px 과 8px 로 갈리고, 아이콘이 붙는 변은 각각 한 단계 좁혀 4px 과 6px 이 된다. 모서리 6px 과 글자 12px 은 두 단계가 함께 쓴다.
- 모양은 [vocabulary.md](../vocabulary.md)의 `Rounded` 이며 6px 이다. Badge 는 「공통 Control Radius」 적용 대상이 아니고 시스템에서 가장 작은 요소이므로 컨트롤의 8px 을 쓰지 않는다. 20px 높이에서 8px 은 반지름이 높이의 40% 라 모서리가 거의 원호로 읽힌다.
- 공통 Control Height를 따르며 독립적으로 놓이는 것은 [chip.md](chip.md)가 담당한다. 값을 고르거나 지우는 자리뿐 아니라, 동작이 없어도 컨트롤 크기가 필요한 값 나열이 여기에 해당한다. 두 컴포넌트는 동작 유무가 아니라 놓이는 방식으로 갈린다.
- 자체 interaction이나 state Property를 갖지 않는다. 누르는 동작이 필요하면 Chip이나 Button을 사용한다.
- 아이콘은 Label 앞에만 붙으며 `data-icon="inline-start"` 로 표시한다. 컴포넌트는 그 변의 여백을 좁혀 아이콘과 글자의 시각 여백을 맞춘다. 뒤쪽 아이콘은 지원하지 않는데, 누르는 동작이 없는 Badge 에서 뒤쪽 아이콘이 가리킬 동작이 없기 때문이다. 지우기나 펼치기가 필요하면 Chip이나 Button을 사용한다.

## Anatomy

1. Container
2. Icon (Optional)
3. Label

```
Badge
├─ Icon (Optional)
└─ Label
```

## Properties

- `tone`: `brand | neutral | warning | danger | success | info | custom`, 기본값 `neutral`
- `variant`: `fill | tonal | outlined`, 기본값 `tonal`. Style 을 고르는 기준은 아래 Guidelines 의 「스타일 선택하기」에 있다
- `size`: `small | medium`, 기본값 `small`. 20px 과 24px 이며 실제 값은 아래 Specification 에 있다
- `color`: `BADGE_COLORS` 의 18색 중 하나. `tone="custom"` 에서만 뜻을 가지므로 다른 tone 과 함께 넘기면 타입에서 걸린다
- `children`: Label 이다. 앞에 아이콘을 두려면 `data-icon="inline-start"` 를 붙인 요소를 Label 앞에 넣는다
- `className`, `render`: `render` 로 다른 요소가 될 수 있지만 그것이 누르는 동작을 허용한다는 뜻은 아니다

`@ooee/ui` 는 색 목록을 `BADGE_COLORS` 런타임 값으로 함께 내보낸다. Studio 와 문서가 같은 목록을 따로 적지 않게 하려는 것이다.

## 색

- Tone 은 일곱이다. `brand`, `neutral`, 상태를 뜻하는 `warning`·`danger`·`success`·`info` 넷, 그리고 semantic family 가 없는 색을 쓰는 `custom` 이다. Style 은 `fill`·`tonal`·`outlined` 셋이며 모든 tone 이 셋을 모두 지원한다.
- **색은 tone 별 팔레트와 Style 별 단계의 곱으로만 정한다.** tone 은 어느 팔레트를 쓸지만 정하고, Style 은 그 팔레트의 어느 단계를 배경·글자·경계에 쓸지만 정한다. 그래서 조합 21개를 하나씩 적지 않고 단계 규칙 셋과 팔레트 일곱으로 관리하며, 한 단계를 고치면 21개가 함께 따라온다. 처음에는 oe semantic token 이름을 tone 마다 따로 적었는데, token 이름의 family 구간이 tone 마다 달라 조합이 하나도 파생되지 않았고 한 조합을 고쳐도 나머지 20개가 그대로 남았다.
- 팔레트는 `brand` 가 `--brand-{단계}`, `neutral` 이 `neutral`, 상태 tone 넷이 각각 `amber`·`red`·`green`·`blue`, `custom` 이 받은 색 이름이다. brand 는 seed 에서 생성되지만 단계 이름이 Tailwind 팔레트와 같으므로 같은 규칙에 들어온다. 그 대신 Light·Dark 단계 쌍을 컴포넌트가 들고 있게 되며, 이 쌍은 tokens 의 `statusFamily` 가 짝을 반전하는 방향을 따른다. `tonal` 배경만 짝이 어긋나는데, 그 이유는 아래 대비 항목에 있다.
- **`outlined` 의 경계는 어느 tone 에서나 그 tone 색 500 단계의 30% 알파다.** 불투명한 한 단계를 쓰면 같은 색의 `tonal` 배경과 경계가 서로 다른 밝기로 갈려 한 컴포넌트로 보이지 않는다. brand 도 `--brand-500` 에 30% 알파를 얹어 예외를 두지 않는다.
- `accent` 는 tone 으로 두지 않았다. token 이 `background-bold-primary` 하나뿐이라 세 Style 을 만들 수 없고, 그 색이 `danger` 와 같은 red 계열이라 Badge 안에서 두 tone 을 구별할 수 없기 때문이다.
- `custom` 은 `color` 로 Tailwind primitive 18색 중 하나를 받으며, 목록은 `@ooee/ui` 가 `BADGE_COLORS` 로 내보낸다. 단계 규칙이 다른 tone 과 같으므로, 같은 색을 나중에 정식 tone 으로 올려도 화면의 색이 달라지지 않는다.
- **회색 계열은 `gray` 하나만 둔다.** Tailwind 의 `slate`·`zinc`·`neutral`·`stone` 은 Badge 크기에서 `gray` 와 구별되지 않아, 고르는 사람에게 판단할 거리 없이 선택지만 늘렸다. 회색이 필요한 자리는 `neutral` tone 이 담당하므로 `custom` 의 회색은 하나로 충분하다.

| 자리 | Light | Dark |
| --- | --- | --- |
| `fill` 배경 | 600 | 600 |
| `fill` 글자 | `white` | `white` |
| `tonal` 배경 | 100 | 800 |
| `tonal` 글자 | 800 | 200 |
| `outlined` 경계 | 500 의 30% 알파 | 500 의 30% 알파 |
| `outlined` 글자 | 800 | 300 |

- **`fill` 배경은 600 이고 글자는 어느 색에서나 white 다.** 700 은 WCAG 2.x 대비가 4.95 이상으로 넉넉하지만 `amber`·`yellow`·`lime` 이 황토색과 올리브색으로 읽혀 tone 이 뜻하는 색을 잃는다. 같은 단계 숫자가 색 계열마다 같은 밝기로 보이지 않는 것은 색 인지의 당연한 결과이고, 노란 계열은 어두워지면 필연적으로 갈색이 된다.
- **600 에서 WCAG 2.x 값이 4.5:1 아래인 색이 절반이지만, 색조를 반영하는 APCA 로는 전부 60 을 넘는다.** WCAG 2.x 는 상대 휘도만 계산하고 색조와 채도를 보지 않아, 짙은 유채색에 white 글자를 얹은 경우를 실제 가독성보다 낮게 평가한다. white 글자의 APCA 는 `yellow` 60.8 부터 `violet` 83 까지이고, 같은 배경에서 글자를 그 색의 950 으로 뒤집으면 21.6~43.6 으로 절반 수준으로 떨어진다. 그래서 600 배경에서는 뒤집지 않고 white 를 쓴다.
- **글자 극성을 뒤집는 기준은 색조가 아니라 배경의 밝기다.** 밝은 노랑 배경(300 단계 부근)에서는 어두운 글자가 맞고, 600 처럼 짙은 단계에서는 white 가 맞다. 참고로 당근의 Badge 는 노랑만 뒤집는데, 그 배경을 재보면 249,215,105 로 300 단계에 해당하는 밝은 노랑이며 주황(3.12)과 빨강(3.88)은 뒤집지 않고 white 를 유지한다.
- APCA 의 글자 크기 표는 12px 에 60~64 보다 높은 값을 원하므로 `yellow`·`lime`·`amber`·`green` 은 통과 대역의 얕은 쪽에 있다. 글자 가독성이 결정적인 자리에서는 `fill` 대신 `tonal` 이나 `outlined` 를 쓴다.
- `tonal` 글자를 700 으로 두면 100 배경에서 `amber` 4.52, `green` 4.50 으로 기준에 겨우 걸치므로 800 을 쓴다. `tonal` 의 최저 대비는 Light 6.36·Dark 5.70(amber), `outlined` 는 7.09(amber)다.
- **`tonal` 배경은 Light 가 100 이지만 Dark 는 900 이 아니라 800 이다.** Studio 의 Dark Surface 가 `neutral-900` 이어서 Dark 배경을 900 으로 내리면 `neutral` 의 `tonal` 이 Surface 와 대비 1.00 이 되어 화면에서 사라진다. 회색 계열 전체가 1.37 이하로 내려가므로 Dark 만 한 단계 올려 둔다.
- `color` 는 `tone="custom"` 에서만 뜻을 가지므로 다른 tone 과 함께 쓰면 타입에서 걸린다.
- 클래스를 tone 과 단계로 조립하기 때문에 Tailwind 가 소스를 훑어서 찾지 못한다. `packages/ui/src/styles.css` 의 `@source inline` 이 위 표의 단계만 미리 생성하며, 단계를 바꾸면 그 선언도 함께 고친다.

## Specification

| 자리 | `small` | `medium` |
| --- | --- | --- |
| 높이 | 20px | 24px |
| 좌우 여백 | 6px | 8px |
| 아이콘이 붙는 변 | 4px | 6px |
| 모서리 | 6px | 6px |
| 글자 | 12px Medium | 12px Medium |
| 아이콘 | 12px | 12px |

- 모서리와 글자, 아이콘 크기는 두 단계가 함께 쓴다. 모양은 크기와 독립된 축이므로 두 크기를 나란히 놓아도 한 컴포넌트로 읽힌다.
- 높이가 커지면 좌우 여백도 한 단계 올린다. 20px 에서 쓰던 6px 을 24px 에서 그대로 두면 글자가 위아래보다 좌우에서 더 붙어 보인다.
- Label 은 줄바꿈하지 않는다. 길어지면 Badge 가 그만큼 넓어져 옆 요소를 밀어낸다.

## Guidelines

### 스타일 선택하기

셋은 강조의 세기와 배경을 채우는 방식으로 갈린다. 주목도는 `fill` 이 가장 높고 `tonal` 이 가장 낮다.

| 스타일 | 쓰는 자리 | 주의 |
| --- | --- | --- |
| `fill` | 배경이 복잡하거나 이미지 위에 Badge 가 겹치는 자리다. 배경이 tone 색으로 채워져 글자가 뒤쪽 그림에 닿지 않는다. | 여러 개를 나란히 두면 서로 경쟁해 목록이 읽히지 않는다. 글자 대비가 결정적인 자리에서도 피한다. 배경이 600 단계라 밝은 색조에서 WCAG 2.x 대비가 4.5:1 아래다. |
| `tonal` (기본값) | 반복되는 구조다. 목록이나 표에서 항목마다 상태를 붙이는 자리가 여기에 해당하며, 과하게 강조된 Badge 가 주는 시각적 부담이 없다. | 배경색이 있는 자리에는 권장하지 않는다. 배경이 Light 에서 100 단계, Dark 에서 800 단계로 옅어 Surface 색과 겹치면 Container 가 보이지 않는다. |
| `outlined` | 중간 정도의 주목도가 필요한 본문과 상세 화면이다. 배경을 채우지 않으므로 주변 색을 덜 건드린다. | 배경이 복잡한 자리에서는 글자가 뒤쪽 그림에 그대로 닿는다. 그 자리는 `fill` 이 담당한다. |

대비 수치의 근거는 위 「색」의 대비 항목에 있다.

### Tone 고르기

- 기본 여섯 중에서 전달하려는 의미와 맥락에 맞는 것을 고른다. 색을 먼저 고르고 의미를 붙이지 않는다.
- 상태를 뜻하는 자리에는 `warning`·`danger`·`success`·`info` 를, 브랜드를 가리키는 자리에는 `brand` 를, 의미를 실어야 할 이유가 없는 분류에는 `neutral` 을 쓴다.
- 여섯으로 설명되지 않는 색이 필요하면 `custom` 으로 색 이름을 직접 지정한다. 서비스가 자체로 구분하는 분류처럼 semantic family 를 만들 이유가 없는 자리가 여기에 해당한다. 그 색이 나중에 정식 tone 으로 올라가도 단계 규칙이 같으므로 화면의 색은 달라지지 않는다.

### 최소한으로 사용하기

- 정보 전달에 효과적이지만 너무 많은 Badge 를 나열하면 오히려 잘 보이지 않는다. 한 자리에 1~2개를 권장한다.
- 여러 개를 두어야 하면 강조를 나누지 않고 `tonal` 로 맞춘다. `fill` 은 그중 하나에만 쓴다.

### 긴 Label 은 사용하지 않기

- 짧고 명확한 정보 전달을 목적으로 한다.
- Label 은 줄바꿈하지 않으므로 길어지면 Badge 가 그만큼 넓어져 옆 요소를 밀어낸다. 문장으로 설명해야 하는 내용은 Badge 에 담지 않는다.

### 누르는 동작을 두지 않기

- 클릭 가능한 요소가 아니다. 자체 interaction 이나 state Property 를 갖지 않으며 Hover 나 Active 표시도 없다.
- 누르는 동작이 필요하면 [chip.md](chip.md)나 Button 을 쓴다. 값을 고르거나 지우는 자리뿐 아니라, 동작이 없어도 독립적으로 놓이는 자리는 Chip 이 담당한다.
- `render` 로 다른 요소가 될 수 있지만 그것이 누르는 동작을 허용한다는 뜻은 아니다.

### Badge 를 카테고리 표시로 사용하기

- 콘텐츠를 그룹화하거나 분류하는 카테고리 태그로 쓴다.
- 분류 자체에 의미를 실을 이유가 없으므로 `tonal` 에 `neutral` 을 기본으로 쓴다.
- 분류를 색으로 구별해야 하면 `custom` 으로 색 이름을 지정한다. 기본 여섯 중 상태를 뜻하는 tone 을 분류에 끌어다 쓰지 않는다.

### Badge 를 부가 정보와 혜택 전달로 사용하기

- 사용자에게 유용한 부가 정보나 혜택을 전달하는 데 쓴다.
- 시선을 끌면서도 주요 콘텐츠를 방해하지 않도록 `tonal` 을 적용한다.

### Badge 를 상태 표시로 사용하기

- 항목의 현재 상태를 간결하게 표현한다.
- 사용자가 상태를 직관적으로 파악할 수 있도록 상태에 맞는 tone 을 쓴다. `warning`·`danger`·`success`·`info` 가 그 자리를 담당한다.
- 상태를 색으로만 구별하지 않는다. 색을 구별하기 어려운 사용자에게도 읽히도록 Label 에 상태 이름을 함께 둔다.

## 현재 정의하지 않은 항목

- **테마와 무관한 흰색 tone.** 어두운 화면이나 이미지 위에 얹는 자리에는 Light·Dark 어느 쪽에서도 흰색인 tone 이 필요하다. `oe-foreground-inverse` 는 Light 에서 `white`, Dark 에서 `neutral-950` 으로 뒤집히므로 그 자리에 맞지 않아 `inverse` tone 을 걷어냈다. 고정 흰색을 semantic token 으로 둘지, 아니면 그 자리를 Badge 가 담당하지 않을지 정한다.
- 세 유형의 관계. Badge·Dot Badge·Number Badge 를 한 컴포넌트의 variant 로 둘지 나눌지 정하지 않았다. 옛 구현은 하나에 유니온으로 담았고 appearance 이름이 `solid` 와 `fill` 로 갈려 있었다.
- **Surface 가 800 단계인 자리의 회색 `tonal`.** `tonal` 의 Dark 배경이 800 단계이므로 Studio 의 Dark Surface(`neutral-900`, 측정값 23,23,23)와는 구분되지만, Surface 를 `neutral-800` 으로 두는 자리에서는 `neutral` tone 과 `custom` 의 `gray` 가 Surface 와 겹쳐 Container 가 보이지 않는다. Surface 단계를 제한할지, 그 자리에서는 `outlined` 를 쓰게 안내할지 정한다.
- 모양 어휘. `square` 가 없다. [vocabulary.md](../vocabulary.md)의 공통 모양 어휘를 어디까지 적용할지 정한다.
