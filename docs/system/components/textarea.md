# Textarea

`packages/ui/src/textarea.tsx`

여러 줄 텍스트를 입력하는 공용 컴포넌트다. Input과 같은 시각적 스타일과 상태 규칙을 사용하지만 내부 선택 요소는 지원하지 않는다.

## Anatomy

1. Container: 전체 입력 영역이다.
2. Textarea field: 여러 줄 값을 입력하는 필수 요소다.

Prefix, Clear button, Suffix, Leading element와 Trailing element는 지원하지 않는다.

## Properties

### Style

- `outline`: 기본값. Neutral border와 기본 surface를 사용한다.
- `filled`: Neutral 배경을 사용하며 Focus 상태에서는 배경이 기본 surface로 바뀐다.

### Layout

- `fill`만 지원하며 부모 너비를 채운다.
- Layout 선택 Property는 제공하지 않는다.
- `containerClassName`: Container에만 적용하는 class다. Textarea field에는 `className`을 사용한다

### Auto size

- `false`: 기본값. 기본 높이를 유지하며 Resize 설정을 적용한다.
- `true`: 내용에 따라 높이가 자동으로 증가한다. 이때 Resize 설정은 적용하지 않는다.

### Resize

- `true`: 기본값. 세로 방향으로만 크기를 변경할 수 있다.
- `false`: 사용자가 크기를 변경할 수 없다.

Resize는 `autoSize=false`일 때만 적용한다.

### Height

- `autoSize=false`일 때 초기 높이를 숫자(px)로 설정할 수 있다.
- 최소값은 80px이며 그보다 작은 값은 80px로 제한한다.
- 기본값은 80px이다.

### Maximum height

- `autoSize=true`로 자동 확장되는 경우와 `resize=true`로 사용자가 높이를 변경하는 경우 모두 최대 높이 제한을 적용해야 한다.
- 최대 높이는 `viewport − reserved layout space`를 기준으로 한다.
- Reserved layout space에는 고정 헤더와 콘텐츠 내부 패딩 등 Textarea 바깥에서 항상 차지하는 영역이 포함된다.
- 정확한 차감 높이와 실행 가능한 기본값은 현재 정의되지 않았다. 값이 확정되기 전까지 임의의 수치를 구현하지 않는다.

### State

- Empty / Placeholder
- Default
- Focus
- Invalid
- Disabled
- Read only

Focus는 `oe-focus-ring`의 1px border와 외부 1px ring을 같은 진한 색으로 사용한다. Invalid도 `oe-danger-border-primary`의 1px border와 외부 1px ring을 같은 색으로 사용한다. 외부 ring을 사용해 상태 전환 시 내부 크기와 배치가 흔들리지 않게 한다.

Disabled는 foreground와 background 위계를 낮추고 상호작용을 제한하되, Outline 스타일에서는 기본 Neutral border를 유지한다. Filled 스타일은 기존의 투명 border 구조를 유지한다.

## Guidelines

Studio 화면의 Guidelines와 소제목을 동일하게 유지한다.

### 여러 줄이 필요한 값에만 사용하기

문의 내용, 설명, 메모처럼 줄바꿈이 생기는 값에 사용한다. 제목이나 이름처럼 한 줄로 끝나는 값은 Input을 사용한다. Textarea는 최소 80px를 차지하므로, 한 줄 값에 두면 쓰이지 않는 빈 영역이 남고 폼의 수직 리듬이 끊긴다.

### 내부 요소와 Layout 선택은 제공하지 않기

Prefix와 Suffix, Clear button, Leading element와 Trailing element를 제공하지 않는다. Container와 Textarea field만으로 구성한다. Layout은 `fill`만이며 선택 Property가 없다. 폭은 부모가 정하며, 폭을 따로 지정하면 같은 폼의 다른 필드와 오른쪽 끝이 어긋난다.

Input에서 쓰던 요소가 필요하다고 느껴지면 값이 한 줄인지, 또는 Label과 도움말처럼 Field가 담당할 일인지 다시 본다.

### 기본 높이는 3.5줄을 유지하기

기본 높이는 80px이며, 내용이 넘칠 때 3.5줄이 보인다. 이 값보다 줄일 수 없다. 받을 내용이 길면 초기 높이를 따로 지정할 수 있으며, 기본 제공 높이보다 큰 값만 쓸 수 있다.

### 초기 높이는 반 줄이 걸치는 지점으로 맞추기

글자가 일부 잘려 보여야 아래에 더 쓸 자리가 있다는 것이 읽힌다. 기본값 80px이 그 이유로 정해진 값이며 내용이 넘칠 때 3.5줄이 보인다. 줄 수에 딱 맞추면 입력 영역이 거기서 끝난 것처럼 보이고 스크롤이 있다는 것을 알 방법이 없다.

보이는 줄 수는 `(높이 − Container border 2px − 위쪽 내부 여백 8px) ÷ 줄높이 20px`로 정해진다. 아래쪽 내부 여백은 스크롤 영역 안에 있어 끝까지 내렸을 때만 보이므로 이 계산에 넣지 않는다. 반 줄이 걸치는 높이는 80px, 100px, 120px처럼 `20 × 정수 + 20`이다.

초기 높이를 따로 지정할 때도 같은 기준을 쓴다. 구현이 이 값을 검사하지 않으므로 높이를 정하는 쪽에서 맞춘다.

### Resize는 세로만 허용하기

`resize`의 기본값은 `true`이며 세로 방향만 제공한다. 가로는 제공하지 않는다. 폭이 달라지면 같은 폼의 다른 필드와 시작점과 끝점이 어긋난다.

받을 내용의 분량을 사용자가 스스로 조절하는 편이 낫기 때문에 켠 상태를 기본으로 둔다. 높이를 고정해야 하는 자리에서만 끈다.

`resize`는 `autoSize`가 꺼져 있을 때만 적용된다. 둘을 함께 켜지 않는다.

### 자동 높이는 아래 콘텐츠가 밀리지 않는 자리에서만 켜기

`autoSize`는 기본값이 아니므로 필요한 자리에서 명시적으로 켠다. 켤 수 있는 자리는 셋이다. 그 화면에 이 입력만 있는 경우, 마지막 콘텐츠인 경우, 아래 콘텐츠가 밀리지 않는 배치인 경우다.

입력하는 동안 아래 콘텐츠가 계속 내려가면 사용자가 방금 읽던 자리를 잃는다.

### 높이가 자라면 최대 높이를 뷰포트 안에 두기

`resize`로 사용자가 늘리는 경우와 `autoSize`로 자동으로 자라는 경우 모두, 최대 높이가 뷰포트 높이를 넘지 않게 한다. 정확한 차감 값은 아직 정하지 않았으며, 확정되기 전까지 임의의 수치를 쓰지 않는다.

## Specification

- Width: `100%`
- Minimum height: `80px`
- Textarea field minimum height: `78px` (Container border를 포함한 전체 최소 높이 80px)
- Typography: `14px / 20px`
- Radius: `8px`
- Textarea field horizontal padding: `12px`
- Textarea field vertical padding: `8px`
- Placeholder: `oe-foreground-placeholder`

스크롤 공간은 항상 동일하게 확보해 스크롤 유무가 바뀌어도 텍스트가 움직이지 않게 한다. 스크롤바 thumb은 기본 상태에서 투명하고 Textarea를 Hover할 때만 표시한다. 입력 내용은 Textarea field 자체의 패딩 안에서 스크롤하며 Container 내부에 별도 하단 공백을 만들지 않는다.

현재 최소 높이는 내용이 넘칠 때 3.5줄이 보이는 값이다. `autoSize=true`일 때 `field-sizing-content`를 사용해 내용에 따라 높이를 계산한다.

## 현재 정의하지 않은 항목

- Size property
- 자동 높이의 최대값과 이후 스크롤 정책
- 최대 높이 계산에 사용할 reserved layout space의 정확한 값
- Character count의 기본 소유자는 이후 Field에서 정의한다. Textarea 내부 표시가 필요한 실제 사례가 확인되면 별도 배치 방식을 다시 검토한다.
- Label, Helper text, Error message를 소유할 Field API

Label, Helper text, Error message 조합은 별도 Field 컴포넌트가 소유한다.

상세 페이지 우측의 `On this page`에서 현재 섹션을 확인하고 이동할 수 있다. Field와 Input은 rail 아래의 낮은 위계 Related 링크로 제공한다.
