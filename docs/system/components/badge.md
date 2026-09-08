# Badge

`packages/ui/src/badge.tsx`

다른 요소에 덧붙어 상태나 개수를 작게 표시한다.

## 역할과 경계

- Badge는 다른 요소에 덧붙어 상태나 개수를 표시한다. 보조 정보나 강조도 키워드형으로 짧게 붙인다.
- 자기 크기 체계를 사용하며 [interaction.md](../interaction.md)의 「공통 Control Height」를 따르지 않는다. 덧붙는 표시이므로 컨트롤과 같은 높이를 가질 이유가 없다.
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

## 색

- Tone 은 일곱이다. `brand`, `neutral`, 상태를 뜻하는 `warning`·`danger`·`success`·`info` 넷, 그리고 semantic family 가 없는 색을 쓰는 `custom` 이다. Style 은 `fill`·`tonal`·`outlined` 셋이며 모든 tone 이 셋을 모두 지원한다.
- 색은 `packages/tokens` 가 소유한 oe semantic token 으로만 받는다. 상태 tone 의 자리는 `fill` 이 `background-bold-primary` 에 `foreground-inverse`, `tonal` 이 `background-secondary` 에 `foreground-primary`, `outlined` 가 `border-primary` 의 30% 알파에 `foreground-primary` 다.
- **`outlined` 의 경계는 어느 tone 에서나 그 tone 색의 30% 알파다.** 불투명한 한 단계를 쓰면 같은 색의 `tonal` 배경과 경계가 서로 다른 밝기로 갈려 한 컴포넌트로 보이지 않는다. brand 는 HCT alpha ramp 의 `brand-alpha-30` 을 쓰고, 상태 tone 과 `custom` 은 각자의 500 단계에 30% 알파를 얹는다. neutral 만 `border-primary` 가 아니라 `border-bold-primary` 를 기준으로 삼는데, `border-primary` 는 이미 옅은 단계여서 30% 로 낮추면 경계가 사라지기 때문이다.
- `accent` 는 tone 으로 두지 않았다. token 이 `background-bold-primary` 하나뿐이라 세 Style 을 만들 수 없고, 그 색이 `danger` 와 같은 red 계열이라 Badge 안에서 두 tone 을 구별할 수 없기 때문이다.
- `custom` 은 `color` 로 Tailwind primitive 22색 중 하나를 받는다. 단계 규칙은 tokens 의 `statusFamily` 와 같게 두었으므로, 같은 색을 나중에 semantic family 로 올려도 화면의 색이 달라지지 않는다.

| 자리 | Light | Dark |
| --- | --- | --- |
| `fill` 배경 | 700 | 400 |
| `tonal` 배경 | 100 | 900 |
| `outlined` 경계 | 500 의 30% 알파 | 500 의 30% 알파 |
| 글자 | 800 | 200 |

- `color` 는 `tone="custom"` 에서만 뜻을 가지므로 다른 tone 과 함께 쓰면 타입에서 걸린다.
- `custom` 은 클래스를 색 이름으로 조립하기 때문에 Tailwind 가 소스를 훑어서 찾지 못한다. `packages/ui/src/styles.css` 의 `@source inline` 이 위 표의 단계만 미리 생성하며, 단계를 늘리면 그 선언도 함께 고친다.

## 정하지 않은 항목

- **테마와 무관한 흰색 tone.** 어두운 화면이나 이미지 위에 얹는 자리에는 Light·Dark 어느 쪽에서도 흰색인 tone 이 필요하다. `oe-foreground-inverse` 는 Light 에서 `white`, Dark 에서 `neutral-950` 으로 뒤집히므로 그 자리에 맞지 않아 `inverse` tone 을 걷어냈다. 고정 흰색을 semantic token 으로 둘지, 아니면 그 자리를 Badge 가 담당하지 않을지 정한다.
- 세 유형의 관계. Badge·Dot Badge·Number Badge 를 한 컴포넌트의 variant 로 둘지 나눌지 정하지 않았다. 옛 구현은 하나에 유니온으로 담았고 appearance 이름이 `solid` 와 `fill` 로 갈려 있었다.
- **Dark 에서 회색 계열 `custom` 의 `tonal`.** `tonal` 의 Dark 배경은 900 단계인데, Studio 의 Dark Surface 가 `neutral-900` 이므로 `slate`·`gray`·`zinc`·`neutral`·`stone` 은 배경이 Surface 와 겹쳐 Container 가 보이지 않는다. 회색이 필요한 자리는 이미 `neutral` tone 이 `background-secondary` 로 담당하므로, `custom` 에서 회색 다섯을 빼는 방법과 회색 계열만 Dark 배경을 800 단계로 올리는 방법이 있다. 뒤쪽은 `statusFamily` 와의 단계 일치가 깨진다.
- 모양 어휘. `square` 가 없다. [vocabulary.md](../vocabulary.md)의 공통 모양 어휘를 어디까지 적용할지 정한다.
