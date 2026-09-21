# Figma에서 코드로 되짚기

Figma 프레임을 다시 읽었을 때 남는 것으로 `@ooee/ui` 컴포넌트와 Property를 되짚는 표다. `/design-page`의 ②가 코드를 Figma로 옮기고, ④가 사람이 고친 Figma를 다시 읽어 코드로 되돌릴 때 이 표를 근거로 쓴다. 절차는 [ai-environment.md](ai-environment.md)의 순서 6·7, 도구는 [`scripts/figma/README.md`](../../scripts/figma/README.md)에 있다.

**화면의 요소는 기본적으로 인스턴스가 아니라 이름을 가진 프레임이라서 이 표가 필요하다.** 카탈로그(`apps/sandbox/src/app/catalog/page.tsx`)로 Figma에 `@ooee/ui` 컴포넌트 18종을 만들어 두기는 했지만(변형 개수는 카탈로그가 정본이라 여기 적지 않는다), 화면을 그 인스턴스로 놓는 것은 `prepare.mjs --instances`로 켤 때뿐이다. Code Connect는 여전히 없다(Pro 플랜). 인스턴스로 놓인 자리는 주 컴포넌트 이름이 곧 답이므로 이 표가 필요 없고, 나머지 자리의 되짚기 근거는 넷뿐이다.

1. **레이어 이름** — `dom-extract.js`가 `data-slot`, 없으면 `role`, 없으면 태그 이름을 쓴다. `aria-label`이 있으면 ` / <이름>`이 뒤에 붙는다. 아이콘 레이어는 `builder.js`가 Remix 이름(`RiCheckLine`)으로 덮어쓴다.
2. **칠·테두리·글자에 묶인 변수 이름** — `oe color`·`oe primitive` 컬렉션의 변수 이름이 재조회에 `var(--oe-…)`·`var(--brand-…)`로 나온다.
3. **숫자로 남는 크기** — 높이, 모서리, 폭. `oe size` 변수에 묶여 있어도 재조회는 이름이 아니라 px를 돌려준다.
4. **자식 레이어 구성** — `button-label`, `input-container` 같은 자식이 있는지.

`data-variant`·`data-tone`·`data-size` 같은 DOM 속성은 Figma로 옮겨지지 않는다. 그래서 variant·tone은 색 변수로, 크기는 px로 되짚는다.

**Figma에는 배치하는 곳만 Frame으로 남는다**(`2026-09-16` 결정, `scripts/figma/README.md`). 글자 하나만 감싼 상자와 그대로 통과시키는 상자는 없애고 글자·아이콘이 그 자리를 차지하며, 칠·테두리만 있는 잎은 Rectangle이다. `data-slot`이 붙은 노드는 접지 않으므로 아래 표의 이름은 그대로 남는다. 다만 컴포넌트 안의 이름 없는 감싸개(예: `select-trigger` 안의 값 `span`)는 사라져 있을 수 있다.

## 이 표의 기준

| 항목 | 값 |
| --- | --- |
| 코드 기준 | `dev` `54c5c78` (2026-09-16). 이 커밋의 `packages/ui/src/*`와 `packages/tokens/src/styles.css`를 읽어 적었다 |
| 테마 기준 | Light. 아래 색 단계는 모두 Light 값이며, Dark로 그린 프레임은 B의 「Dark」 줄을 본다 |
| 프레임 기준 | 없음. 아래 「확인하지 않은 것」을 본다 |

색 규칙은 커밋마다 바뀔 수 있다. 실제로 `97bbdd2`(2026-09-15)가 Control 테두리를 `oe-border-primary`에서 `oe-border-secondary`로 바꿨다. **프레임이 이 기준 커밋보다 먼저 그려졌으면 색으로 되짚지 않는다.** ④는 프레임을 그린 커밋을 먼저 확인한다.

## A. 레이어 이름으로 컴포넌트 고르기

`docs/system/README.md`의 「Component」 표에서 `확정`인 19개다. 「함께 보는 자식」은 그 레이어 **안에** 들어가는 이름이고, 바깥에 서는 이름은 따로 적었다.

| 레이어 이름 | 컴포넌트 | 함께 보는 자식 |
| --- | --- | --- |
| `app-header` | `AppHeader` | `app-header-leading` > `app-header-leading-content`, `app-header-title-block` > `app-header-title`·`app-header-description`, `app-header-trailing` > `app-header-trailing-content`. 좌우 자리는 늘 한 겹 더 감싸인다 |
| `badge` | `Badge` | 없음 |
| `bottom-navigation` | `BottomNavigation` | `-list`·`-indicator`·`-item`·`-icon`·`-label` |
| `button` | `Button` | **`button-label` 또는 `button-leading-icon`·`button-trailing-icon`이 있어야 한다** |
| `checkbox` | `Checkbox` | `checkbox-indicator` 하나. 체크 표시는 켜졌을 때만 `RiCheckLine`(indeterminate는 `RiSubtractLine`) 아이콘 레이어로 남는다 |
| `chip` | `Chip` | `chip-label`·`-prefix`·`-leading-element`·`-trailing-element`·`-remove` |
| `combobox-trigger` | `Combobox`·`MultiCombobox` | 값 span과 이름 없는 span 아래 `RiArrowDownSLine` |
| `field` | `Field` | `field-header` > `-label`·`-requirement`·`-right-description`·`-trailing`, `field-group`, `field-footer` > `-error-message`\|`-helper-text`·`-character-count` |
| `input-container` | `Input`·`PartialMaskedInput`·`NumberInput` | `input`·`input-leading`·`-prefix`·`-suffix`·`-trailing`, `number-input-controls` |
| `input-button` | `InputButton` | `input-button-leading`·`-value`·`-trailing` |
| `notification-badge` | `NotificationBadge` | 없음 |
| `radio` | `Radio` | `radio-indicator` 하나 |
| `select-trigger` | `Select`·`MultiSelect` | 값 span과 이름 없는 span 아래 `RiArrowDownSLine` |
| `select-box` | `SelectBox` | `-leading-element`·`-content`·`-trailing-element` |
| `switch` | `Switch` | `switch-thumb` |
| `textarea-container` | `Textarea` | `textarea` |
| `toggle-button` | `ToggleButton` | `toggle-button-icon`·`-count` |
| (없음) | `MessageBubble` | `packages/ui/src/message-bubble.tsx`에 `data-slot`이 없어 되짚을 수 없다 |

**Field 계열은 바깥 `<label>`에 이름이 없다.** `CheckboxField`·`RadioField`·`SwitchField`는 `label`이라는 이름의 프레임 안에 Control과 글자가 나란히 선다. 그 형제로 `checkbox-leading`·`checkbox-trailing`(또는 `radio-*`)이 보이면 홑 Control이 아니라 Field다. `SwitchField`는 형제에 이름이 없어 갈리지 않는다.

**`combobox-selected-items`와 `combobox-select-all`은 트리거 밖에 있다.** 앞은 트리거의 형제, 뒤는 Portal로 `<body>` 끝에 붙어 루트 위에 겹쳐 옮겨진다. 둘 중 하나라도 있으면 `MultiCombobox`다.

**태그 이름과 겹치는 셋을 조심한다.** `button`·`input`·`textarea`는 화면 코드가 직접 쓴 native 요소도 같은 이름으로 남는다.

- `button`: `button-label`이나 `button-*-icon` 자식이 있으면 `Button`이다. 자식이 `RiAddLine`·`RiSubtractLine` 하나뿐이고 `number-input-controls`나 `input-leading`·`input-trailing` 안에 있으면 `NumberInput`의 증감 버튼이다. 그 밖에 자식이 없으면 화면 코드의 native `<button>`이다.
- `input`: 부모가 `input-container`면 `Input` 계열, 아니면 native `<input>`이다.
- `textarea`: 부모가 `textarea-container`면 `Textarea`, 아니면 native `<textarea>`다.

## B. 변수와 크기로 Property 되짚기

### 공통

- **Control 높이(px) → `controlSize`**: 28 xsmall · 32 small · 36 regular · 40 large · 48 xlarge. `Input`·`InputButton`·`Select`·`Combobox`에는 xsmall이 없고, `Switch`만 단계 이름이 `small`·`medium`·`large`이며, `Textarea`에는 `controlSize` 자체가 없다. **목록에 없는 높이면 되짚지 않고 사람에게 묻는다.**
- **모서리(px)**: 8 `rounded-oe-control`(Control 공통) · 6 `rounded-sm`(Badge) · 14 `rounded-xl`(SelectBox) · 4 Tailwind 기본 `rounded`(Checkbox) · 높이의 절반이면 알약(`rounded-full`).
- **아이콘 크기(px) → `size-oe-icon-*`**: 12 xsmall · 16 small · 20 medium · 24 large · 32 xlarge.
- **글자**: 재조회는 `oe/text-*` 스타일 이름 대신 크기와 행간을 돌려준다. `(크기, 행간)`으로 `text-*` 토큰을 고른다. 글꼴 이름(`Noto Sans KR`)은 승인된 대체이므로 코드로 되돌리지 않는다. 굵기는 Noto Sans KR에 SemiBold가 없어 `semibold`가 Bold로 옮겨졌으므로 **굵기로 Property를 되짚지 않는다.**
- **Dark**: 아래 단계는 Light 기준이다. Dark로 그린 프레임은 `Button`의 `tonal`이 칠 `{p}-800`+글자 `{p}-200`, `outline`·`ghost`의 글자가 `{p}-300`이다. `fill`은 두 테마가 같다.

### 컴포넌트별

| 컴포넌트 | 되짚는 Property | 근거 |
| --- | --- | --- |
| `Button` | `controlSize`, `variant`, `tone`, `leadingIcon`·`trailingIcon`, iconOnly | 높이. 칠 `{p}-600`+글자 흰색이면 `fill`, 칠 `{p}-100`+글자 `{p}-800`이면 `tonal`, 테두리 `{p}-500`의 30%+글자 `{p}-800`이면 `outline`, 칠·테두리 없이 글자 `{p}-800`이면 `ghost`. `{p}`는 `brand`→`brand`, `neutral`→`neutral`, `red`→`danger`. `button-label`이 없고 폭==높이면 iconOnly |
| `Badge` | `size`, `variant`, `tone`, `color` | 높이 20 small · 24 medium. 칠 `{p}-600`+흰 글자면 `fill`, 칠 `{p}-100`+글자 `{p}-800`이면 `tonal`, 테두리 `{p}-500`의 30%+글자 `{p}-800`이면 `outlined`(Badge에는 `ghost`가 없다). `{p}`가 `brand`·`neutral`·`amber`·`red`·`green`·`blue`면 tone(각각 brand·neutral·warning·danger·success·info), 그 밖의 Tailwind 팔레트면 `tone="custom"`에 그 팔레트를 준 `color`다 |
| `Input`·`InputButton`·`Select`·`Combobox` | `controlSize`, `variant`, 값 유무, disabled, invalid, (Input) `textAlign` | 테두리 `oe-border-secondary`+칠 `oe-background-primary`면 `outline`, 테두리 없이 칠 `oe-background-secondary`면 `filled`. 글자가 `oe-foreground-placeholder`면 값이 비어 있다. 칠 `oe-background-disabled`면 disabled, 테두리 `oe-danger-border-primary`면 invalid. 값·placeholder 글자가 오른쪽 정렬이면 `textAlign="right"` |
| `Textarea` | `variant`, 값 유무, disabled, invalid | 위와 같은 색 규칙. 높이는 `controlSize`가 아니라 `height` Property이며 최소 80px이다 |
| `Field` | `errorMessage` 유무, `required`, `characterCount`, 그룹 | **레이어 이름이 `field-error-message`면 오류 상태, `field-helper-text`면 아니다.** Property가 이름에 실리는 유일한 자리다. `field-requirement` 자식이 있으면 `required`, `field-character-count`가 있으면 글자 수 표시. `field-group`이 있으면 Control 여러 개를 묶은 자리다. 다만 `field-group`이 없다고 `group=false`는 아니다(자식이 하나면 그리지 않는다) |
| `Checkbox` | checked, indeterminate, disabled, `shape` | 칠이 `oe-brand-background-bold-primary`면 checked. 자식 아이콘이 `RiCheckLine`이면 checked, `RiSubtractLine`이면 indeterminate. 모서리 0이면 `square`, 4면 `rounded` 또는 `ghost`이며, 칠도 테두리도 없으면 `ghost`다. `ghost`는 아이콘이 늘 있으므로 아이콘으로 checked를 되짚지 않고 글자 색으로 본다 |
| `Radio` | checked, disabled | 칠이 `oe-brand-background-bold-primary`면 checked. `indeterminate`와 `shape`는 Radio에 없다 |
| `Switch` | `controlSize`, checked | 트랙 16×26 small · 24×38 medium · 32×52 large. 칠이 `oe-info-background-bold-primary`면 checked |
| `Chip` | `controlSize`, `shape`, `active`, `prefix`, `onRemove`, iconOnly | 높이. 모서리가 8이면 `rounded`, 높이의 절반이면 `circle`. 테두리 `brand-alpha-40`+칠 `brand-alpha-05`면 `active`. `chip-remove` 자식이 있으면 삭제형 |
| `SelectBox` | 그룹의 `selectionMode`, selected | `select-box-trailing-element` 안이 `radio`면 그룹이 `single`, `checkbox`면 `multiple`이다(`selectionMode`는 `SelectBoxGroup`이 갖는다). 안이 비어 있으면 `trailingElement="none"`이라 되짚지 않는다. 테두리 `brand-alpha-40`+칠 `brand-alpha-05`면 선택됨 |
| `ToggleButton` | `controlSize`, `pressed`, 켜졌을 때의 `variant` | 칠 없이 글자 `oe-foreground-tertiary`면 꺼짐. 켜짐은 글자 `brand-600`이면 `ghost`, 칠 `brand-100`+글자 `brand-800`이면 `tonal` |
| `AppHeader` | `description` 유무 | 높이 56. 아래 테두리 `oe-border-secondary`가 있으면 본문이 헤더 아래로 들어간 상태(`data-stuck`)로 그린 것이다. `sticky` 자체는 흔적이 없다 |
| `BottomNavigation` | `variant`, `showLabels`, 항목 수, 선택 항목 | 모서리가 높이의 절반이면 `floating`, 0이고 위 테두리 `neutral-100`이 있으면 `bar`. `bottom-navigation-label` 레이어가 없으면 `showLabels=false`. 글자가 `oe-foreground-primary`인 항목이 선택된 것이다(나머지는 `oe-foreground-subtle`) |
| `NumberInput` | `controlSize`, `variant`, `controlsPosition`, `readOnly` | `number-input-controls` 자식이 있으면 `trailing`이다. `input-leading`·`input-trailing` 안에 `button / Decrease value`·`button / Increase value`가 있으면 `split`이다. 컨테이너는 disabled 칠이 아닌데 증감 버튼 글자만 `oe-foreground-disabled`면 `readOnly`다 |
| `NotificationBadge` | `count` 유무, 수, (count일 때만) `tone` | 8×8이면 `count`가 없는 점, 높이 18이면 `count`가 있다. 점은 `tone`을 받지 않아 언제나 `red-600`이므로 tone을 되짚지 않는다. 수 형태는 칠 `red-600`이면 `accent`, `neutral-600`이면 `neutral` |

## C. 되짚지 않는 것

아래는 재조회 결과에 흔적이 없거나 이 표의 근거 넷(이름·변수·크기·자식 구성)으로 가를 수 없다. ④는 이 값들을 코드에서 그대로 두고 보고에 적는다.

- `layout`(`hug`·`fill`), `fixedWidth`, `readOnly`(`NumberInput` 제외).
- `Input`의 `clearable`. Clear 버튼은 입력란에 초점이 있을 때만 폭이 열리므로 정적 화면에서는 값이 있어도 옮겨지지 않는다.
- `Textarea`의 `autoSize`·`resize`.
- `NumberInput`의 `hideControls`. 증감 버튼이 없어 `Input`과 구별되지 않는다.
- `ToggleButton`의 꺼진 상태 `variant`. 꺼지면 `ghost`와 `tonal`이 같은 그림이다.
- `Chip`의 누름 여부. 정적 Chip과 누르는 Chip이 같은 그림이다.
- `AppHeader`의 `sticky`, `titleAlign`, `titleHidden`.
- `CheckboxField`·`RadioField`·`SwitchField`의 `flipped`·`labelPosition`. Control이 글자 오른쪽에 서 있으면 뒤집힌 것이지만, 자리를 근거로 삼을지는 순서 7에서 ④와 함께 정한다.
- `tone="custom"`으로 hex를 직접 준 자리(Button의 엑셀 색은 언제나, ToggleButton의 favorite·like는 켜진 상태에서만). 이 색은 `prepare.mjs`가 토큰으로 풀지 못해 `unresolvedColors`에 남고 ②가 멈춘다.
- 그림자와 Focus ring. 옮기지 않는다.
- `MessageBubble`·`MessageComposer`·`MessageFileAttachment`. `data-slot`이 없다.

## D. 이름이 같아 갈리지 않는 짝

| 겹치는 이름 | 갈리지 않는 것 | 어떻게 하나 |
| --- | --- | --- |
| `select-trigger` | `Select` ↔ `MultiSelect` | `RiArrowDownSLine`은 둘 다 갖고 `combobox-trigger`에도 있어 근거가 아니다. 값 글자가 여럿을 뜻하면(`… 외 2`) Multi로 추정하고 보고에 적는다 |
| `combobox-trigger` | `Combobox` ↔ `MultiCombobox` | 형제에 `combobox-selected-items`가 있거나 팝업에 `combobox-select-all`이 있으면 `MultiCombobox`로 확정한다. 둘 다 없으면 단일로 둔다 |
| `checkbox`·`radio` | 홑 Control ↔ `*Field` | 형제에 `checkbox-leading`·`checkbox-trailing`(또는 `radio-*`)이 있으면 Field다 |
| `switch` | `Switch` ↔ `SwitchField` | 형제에 이름이 없어 갈리지 않는다. 코드 쪽을 그대로 둔다 |
| `input-container` | `Input` ↔ `NumberInput`(`hideControls`) ↔ `PartialMaskedInput` | 코드 쪽을 그대로 둔다 |
| `chip` | 정적 ↔ 누름형 | 코드 쪽을 그대로 둔다 |
| `badge` tone | `danger` ↔ `custom color="red"` | 같은 변수를 쓴다. 코드 쪽을 그대로 둔다 |
| `checkbox` 모서리 4 | `rounded` ↔ `ghost` | `ghost`는 칠도 테두리도 없다. 그것으로 가른다 |

## E. 확인하지 않은 것

- **프레임 기준이 비어 있다.** 이 표는 `packages/ui`와 `packages/tokens`의 코드, 그리고 `scripts/figma/`의 이름·색 규칙만 읽고 적었다. 재조회 값과 대조하려면 저장소 루트에서 연 세션에서 `get_metadata`·`get_design_context`로 `ooee · 고객의 소리 · 2026-09-15`(`Iw2MXs9sfqtJFze7F9vGf5`)의 프레임을 읽어 위 규칙이 실제로 맞는지 한 번 확인해야 한다. 순서 6의 완료 기준이다.
- **`2026-09-15`에 뜬 옛 재조회 샘플에서 `Button`의 `outline` 테두리가 버튼 프레임이 아니라 자식 `button-label`에 붙어 있었다.** 그 뒤 도구를 고쳤으므로 지금 프레임에서 다시 본다.
- **팝업 안의 레이어가 실제로 옮겨지는지.** `combobox-select-all` 같은 팝업 요소는 `prepare.mjs`에 그 상태를 여는 JS를 줄 때만 캡처된다.
- **레이어 이름에 variant·tone·size를 실을지.** `dom-extract.js`가 이름을 만들 때 `data-variant`·`data-tone`·`data-size`를 접미사로 붙이면 위 표의 추정 상당수가 확정으로 바뀐다. 순서 7에서 ④를 만들며 함께 정한다.
