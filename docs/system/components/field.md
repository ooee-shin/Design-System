# Field

`packages/ui/src/field.tsx`

Label과 필수 표시, 도움말과 오류 문구를 Form control 하나와 묶는 폼 한 칸이다. Control이 들어가는 자리는 갈아 끼울 수 있는 Input slot이며, Label과 Control을 잇는 접근성 연결은 Field가 소유한다.

## 역할과 경계

- Field는 Header, Input slot, Footer 세 층으로 구성된다. Header가 Label과 필수 표시를, Input slot이 실제 Control을, Footer가 도움말·오류 문구와 Character count를 담당한다.
- Label, Helper text와 Error message는 Field가 소유한다. Input, Textarea, Select 같은 Control은 값을 다루는 일만 하며 자기 Label을 갖지 않는다.
- Field는 값을 소유하지 않는다. 값과 상태 변경은 Input slot의 Control이 갖고, Field는 그 Control에 접근성 속성과 상태만 주입한다.
- `CheckboxField`·`RadioField`·`SwitchField`는 Field가 아니라 Control과 인라인 Label을 결합한 선택 행 하나다. 여러 행을 하나의 폼 항목으로 묶을 때 그 바깥을 Field가 감싼다. 두 층의 이름 구분은 [vocabulary.md](../vocabulary.md)가 소유한다.
- 여러 Field를 묶는 `Fieldset`과 폼 전체의 제출·검증을 담당하는 `Form`은 현재 제공하지 않는다.

## Anatomy

1. Requirement: 선택 요소다. 필수 항목일 때 Label 앞에 `*`를 표시한다.
2. Label: 필수 요소다.
3. Right description: 선택 요소다. Label 바로 뒤에 낮은 위계로 붙는다.
4. Trailing element: 선택 요소다. Header 오른쪽 끝으로 밀려 보조 액션을 담는다.
5. Input slot: 필수 요소다. Control이 갈아 끼워지는 교체 가능 영역이다.
6. Helper text · Error message: 선택 요소다. Footer 왼쪽에 온다.
7. Character count: 선택 요소다. Footer 오른쪽에 온다.

Header와 Input slot 사이는 6px, Input slot과 Footer 사이는 4px이다. Footer는 그 항목의 입력 결과를 말하므로 Control에 붙여 한 묶음으로 읽히게 하고, Label이 있는 Header 쪽만 2px 더 벌린다. Footer는 항목당 한 줄을 유지하며 왼쪽 문구와 오른쪽 글자 수가 한 행 안에서 좌우로 갈린다.

## Properties

### Header

- `label`: 필수 `ReactNode`다. 14px Medium `oe-foreground-primary`를 사용한다.
- `required`: Boolean이며 기본값은 `false`다. `true`면 Label 앞에 `*`를 `oe-danger-foreground-secondary`로 표시하고 Input slot의 Control에 `required`를 주입한다.
- `rightDescription`: 선택 `ReactNode`다. 12px `oe-foreground-tertiary`를 사용하고 좁아지면 말줄임한다.
- `trailingElement`: 선택 `ReactNode`다. Header 오른쪽 끝에 배치하며 어떤 컴포넌트가 오는지 Field가 정하지 않는다.

Field에는 `prefix`와 `suffix`를 두지 않는다. 두 이름은 값의 의미를 보완하는 짧은 표기 자리이며 [input.md](input.md)가 그 구분을 소유한다. Header에 오는 것은 조작을 여는 요소이므로 `trailingElement`를 사용한다.

### Input slot

- `children`: 필수 `ReactNode`다. Control 하나를 직접 자식으로 둔다.
- `group`: Boolean이며 기본값은 `false`다. Input slot이 여러 값을 고르는 묶음일 때 사용한다.

Input slot은 `group`과 자식 개수에 따라 세 가지로 갈린다.

| 구성 | Field의 동작 |
| --- | --- |
| Control 하나 | `id`를 주입하고 Label이 `htmlFor`로 그것을 가리킨다 |
| `group`이고 자식이 하나 | 그 자식이 이미 자체 group을 렌더링하므로 group을 겹쳐 만들지 않고 `aria-labelledby`만 주입한다. Select Box Group이 이에 해당한다 |
| `group`이고 자식이 여러 개 | 가리킬 대상이 없으므로 Field가 그 행들을 내부 묶음으로 감싸고 그 묶음이 `role="group"`과 `aria-labelledby`를 소유한다. CheckboxField 나열이 이에 해당한다 |

Input slot에 들어가는 Control은 Input, Textarea, Select, Radio Group, Checkbox Group, Chip Group과 Date·Time을 여는 Input Button이다. Radio Group과 Select Box Group은 자체 group을 렌더링하므로 `group`과 함께 쓰고, Checkbox Group은 CheckboxField를 여러 개 나열하므로 Field가 group을 직접 소유한다. Chip Group은 별도 컴포넌트가 아니라 [chip.md](chip.md)의 「Chip을 Selection으로 사용하기」에 해당하는 조합이며, 가로 묶음과 그룹 role은 화면 코드가 소유한다.

Control을 `div`나 별도 컴포넌트로 한 번 감싸면 주입 대상을 잃어 Label 연결이 조용히 끊긴다. Field는 개발 환경에서 그 자리를 경고로 알린다. 주입한 `id`가 아무 곳에도 닿지 않은 경우와, 닿았지만 그것이 Control이 아닌 경우를 나누어 알린다.

Field가 group을 소유할 때 행들을 내부 묶음으로 감싸는 이유는 두 가지다. Field의 세로 간격이 행 사이로 새면 각 행이 자기 높이로 만드는 수직 리듬이 어긋난다. 그리고 `role="group"`이 Header와 Footer까지 품으면 그룹의 범위가 실제 선택 항목보다 넓어진다.

행 사이에는 별도 간격을 두지 않는다. Radio Group과 Checkbox Group의 수직 리듬은 각 행의 36px 최소 조작 높이가 만든다. Chip처럼 가로로 늘어놓는 조합은 화면 코드가 자기 묶음의 간격을 소유한다.

### Footer

- `helperText`: 선택 `ReactNode`다. 12px `oe-foreground-tertiary`를 사용한다.
- `errorMessage`: 선택 `ReactNode`다. 12px `oe-danger-foreground-secondary`를 사용하며 값이 있으면 Helper text를 대체한다.
- `characterCount`: 선택 `{ current: number; max: number }`다. `current/max` 형태로 표시하고 `tabular-nums`를 적용한다.

Field는 값을 소유하지 않으므로 글자 수를 스스로 세지 않는다. 현재 글자 수는 소비자가 `characterCount.current`로 넘긴다.

### State

- `disabled`: Boolean이며 기본값은 `false`다. Input slot의 Control에 그대로 주입한다.
- `readOnly`: Boolean이며 기본값은 `false`다. Input slot의 Control에 그대로 주입한다.
- Invalid는 별도 Property가 아니다. `errorMessage`가 있으면 Field가 `data-invalid`를 갖고 Control에 `aria-invalid`를 주입한다. 오류 문구 없이 오류 상태만 표시하는 구성은 제공하지 않는다.

## Behavior

Field는 Label과 Control, Footer 문구를 잇는 연결을 소유한다.

- Label은 Control 하나를 감쌀 때 `<label htmlFor>`로 연결하고, Group일 때는 `<span>`으로 렌더링해 `aria-labelledby`로 연결한다. Group에는 가리킬 단일 Control이 없어 `htmlFor`가 성립하지 않는다.
- Footer에 보이는 문구 하나가 `aria-describedby`로 Control 또는 Group에 연결된다. 오류가 도움말을 대체하므로 연결되는 문구도 항상 하나다.
- Requirement의 `*`는 `aria-hidden`이다. 필수 여부는 Control의 `required`가 전달하므로 접근 가능한 이름에 기호가 섞이지 않는다.
- Character count는 `aria-describedby`에 연결하지 않는다. 값이 바뀔 때마다 이름과 설명이 갱신되면 입력 중에 낭독이 끊긴다.

Select, MultiSelect, Combobox, MultiCombobox와 SelectBoxGroup은 `ariaLabel`을 선택 Property로 갖는다. Field 안에서 쓸 때는 Field가 이름을 소유하므로 `ariaLabel`을 넘기지 않고, Field 없이 단독으로 쓸 때만 넘긴다.

## Guidelines

### Label과 피드백의 소유자를 Field로 두기

Label과 필수 표시, 도움말과 오류 문구는 Field가 소유한다. Control이 Label을 함께 들고 있으면 같은 Label이 컴포넌트마다 다른 속성 이름으로 갈리고, 폼 한 칸의 구조를 한 곳에서 볼 수 없게 된다.

### 필수는 기호로, 나머지는 Right description으로 알리기

필수 항목은 Label 앞의 `*` 하나로만 알린다. 텍스트는 두 자리에만 쓴다. 선택사항임을 강조해야 할 때 `선택`을 쓰고, 여러 개를 고르는 자리에서 개수를 알릴 때 `최대 3개`를 쓴다. 두 문구는 Label 안에 괄호로 넣지 않고 `rightDescription`에 둔다. Label만 빠르게 읽을 수 있어야 하고, 어느 자리에 무엇이 들어가는지가 속성 이름으로 드러나야 한다.

화면의 필수 항목 비율에 따라 표기를 뒤집는 규칙은 사용하지 않는다. 항목 하나만 보고는 그 화면이 어느 방식을 쓰는지 알 수 없다.

### 오류가 있으면 도움말을 대신하기

도움말과 오류 문구가 함께 있으면 오류만 보인다. 둘이 함께 쌓이면 항목마다 Footer 높이가 달라져 폼의 수직 리듬이 깨지고, 먼저 읽어야 하는 문구가 흐려진다. 오류 문구는 무엇을 해야 하는지 알리는 행동 지시형으로 쓴다.

### Control은 Large 이상을 쓰기

Field와 결합해 쓰는 화면은 대체로 모바일 폼이다. 손가락으로 누르는 자리이므로 한 줄 Control은 Regular 36px이 아니라 Large 40px 이상을 쓴다. 크기는 Field가 아니라 각 Control의 `controlSize`가 소유하므로 Field가 강제하지 않는다. 데스크톱 관리자 화면처럼 밀도가 중요한 자리에서는 Regular를 쓸 수 있다.

Radio, Checkbox와 Chip은 이 규칙의 대상이 아니다. 세 컴포넌트는 각자 자기 조작 영역과 최소 높이를 소유하며, 그 값은 [radio.md](radio.md)·[checkbox.md](checkbox.md)·[chip.md](chip.md)에 있다.

### Input slot에는 Control을 그대로 두기

Control 하나를 Input slot의 직접 자식으로 둔다. 여러 항목을 나열할 때는 `group`을 사용한다. Layout이 필요해 Control을 감싸야 하면 Field의 `className`으로 처리하고 Input slot의 자식 구조는 바꾸지 않는다.

## Specification

- Label: 14px Medium, line-height 20px, `oe-foreground-primary`
- Requirement: 14px, line-height 20px, `oe-danger-foreground-secondary`
- Right description: 12px, line-height 20px, `oe-foreground-tertiary`
- Helper text: 12px, line-height 20px, `oe-foreground-tertiary`
- Error message: 12px, line-height 20px, `oe-danger-foreground-secondary`
- Character count: 12px, line-height 20px, `tabular-nums`. 기본은 `oe-foreground-tertiary`이고 오류 상태에서는 `oe-danger-foreground-secondary`
- Header ↔ Input slot 간격: 6px
- Input slot ↔ Footer 간격: 4px

## 현재 정의하지 않은 항목

- Label weight 두 단계다. 굵은 Label이 필요한 실제 사례를 확인하지 못했으므로 현재는 Medium 하나만 제공한다.
- Footer 자리 예약이다. 오류 문구가 나타날 때 아래 내용이 그만큼 밀린다. 도움말이 없는 항목까지 빈 줄을 들고 있으면 폼 전체가 늘어나므로 예약하지 않으며, 인라인 검증 화면에서 밀림이 문제가 되면 선택 Property로 다시 검토한다.
- Label을 Control 왼쪽에 두는 가로 배치다. 현재는 Label이 항상 Control 위에 온다.
- 여러 Field를 묶는 `Fieldset`과 폼 전체의 제출·검증을 담당하는 `Form`이다.
- `characterCount`의 값을 Field가 직접 세는 방식이다. 현재는 소비자가 넘기며, Control의 이벤트를 Field가 가로채는 방식은 개발자 검토 항목으로 남긴다.
