# Textarea

여러 줄 텍스트를 입력하는 공용 컴포넌트다. Input과 같은 시각적 스타일과 상태 규칙을 사용하지만 내부 선택 요소는 지원하지 않는다. 실제 구현 원본은 `packages/ui/src/textarea.tsx`, 검수 화면은 `/components/textarea`다.

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

### Auto size

- `false`: 기본값. 기본 높이를 유지하며 Resize 설정을 적용한다.
- `true`: 내용에 따라 높이가 자동으로 증가한다. 이때 Resize 설정은 적용하지 않는다.

### Resize

- `false`: 기본값. 사용자가 크기를 변경할 수 없다.
- `true`: 세로 방향으로만 크기를 변경할 수 있다.

Resize는 `autoSize=false`일 때만 적용한다.

### Height

- `autoSize=false`일 때 초기 높이를 숫자(px)로 설정할 수 있다.
- 최소값은 88px이며 그보다 작은 값은 88px로 제한한다.
- 기본값은 88px이다.

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

## Specification

- Width: `100%`
- Minimum height: `88px`
- Textarea field minimum height: `86px` (Container border를 포함한 전체 최소 높이 88px)
- Typography: `14px / 20px`
- Radius: `8px`
- Textarea field horizontal padding: `12px`
- Textarea field vertical padding: `8px`
- Placeholder: `oe-foreground-placeholder`

스크롤 공간은 항상 동일하게 확보해 스크롤 유무가 바뀌어도 텍스트가 움직이지 않게 한다. 스크롤바 thumb은 기본 상태에서 투명하고 Textarea를 Hover할 때만 표시한다. 입력 내용은 Textarea field 자체의 패딩 안에서 스크롤하며 Container 내부에 별도 하단 공백을 만들지 않는다.

현재 최소 높이는 약 3.5줄의 입력 영역과 상하 여백을 확보한다. `autoSize=true`일 때 `field-sizing-content`를 사용해 내용에 따라 높이를 계산한다.

## 현재 정의하지 않은 항목

- Size property
- 자동 높이의 최대값과 이후 스크롤 정책
- 최대 높이 계산에 사용할 reserved layout space의 정확한 값
- Character count의 기본 소유자는 이후 Field에서 정의한다. Textarea 내부 표시가 필요한 실제 사례가 확인되면 별도 배치 방식을 다시 검토한다.
- Label, Helper text, Error message를 소유할 Field API

확인되지 않은 항목은 Studio에 공식 Property처럼 표시하지 않는다. Label, Helper text, Error message 조합은 이후 별도 Field 컴포넌트에서 결정한다.

상세 페이지 우측의 `On this page`에서 현재 섹션을 확인하고 이동할 수 있다. Field와 Input은 rail 아래의 낮은 위계 Related 링크로 제공한다.
