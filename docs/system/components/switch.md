# Switch

`packages/ui/src/switch.tsx`

설정이나 기능을 즉시 켜고 끄는 Boolean control이다. 동작은 Base UI Switch를 기반으로 하며 시각 상태는 oe semantic token을 사용한다.

## 역할과 경계

- Switch는 누르는 즉시 연결된 설정이나 기능의 On/Off 값을 변경한다.
- 여러 선택 결과를 모아 나중에 저장하거나 제출하는 항목에는 Checkbox를 사용한다.
- 원자적인 `Switch`와 Label을 결합하는 `SwitchField`를 제공한다.
- 별도 `SwitchContainer`는 제공하지 않는다.

## Anatomy

1. Track
2. Thumb
3. Label: `SwitchField`에서 필수

SwitchField는 Control과 Label만 결합한다. Description과 Leading/Trailing element는 제공하지 않는다.

## Properties

### Size

- `small`: Control `26×16px`, Thumb `12px`. SwitchField의 최소 target 높이는 `24px`다.
- `medium`: Control `38×24px`, Thumb `20px`. 기본값이다.
- `large`: Control `52×32px`, Thumb `26px`.
- React Property 이름은 공용 control 문법에 맞춰 `controlSize`를 사용한다.
- Size의 `16px`, `24px`, `32px`는 Track만의 높이가 아니라 Switch Control 전체 높이다. Small은 시각 크기보다 큰 `24px` target을 확보하고, Medium과 Large는 Control 높이 자체가 충분하므로 별도로 넓히지 않는다.
- SwitchField는 크기가 커질수록 Label 크기와 Control–Label gap도 함께 키운다.

### Label position

- `right`: Label을 Control 오른쪽에 둔다. 기본값이다.
- `left`: Label을 Control 왼쪽에 둔다.
- 별도 Inline/Block Layout은 제공하지 않는다.

### Elements

- `label`: `SwitchField`의 필수 `ReactNode`
- `labelPosition`: `left | right`, 기본값 `right`
- `switchClassName`, `thumbClassName`: Control과 Thumb에 각각 적용하는 class다

### State

- Off: 조작 가능한 상태가 Disabled보다 선명하게 보이도록 `oe-background-control-off`를 Track과 inset Border에 함께 사용한다.
- On: 브랜드와 분리된 기본 Blue 의미의 `oe-info-background-bold-primary` Track과 흰색 Thumb을 사용한다.
- Focus visible: 기본 inset Border는 유지하고 바깥에 `oe-focus-ring` 2px Outline과 2px offset을 사용한다.
- Disabled · Off: Border 없이 `oe-background-control-disabled` Track과 더 선명한 `oe-background-disabled-selected` Thumb, disabled text를 사용한다.
- Disabled · On: Disabled · Off와 같은 Track·Thumb 색상을 사용하고 Thumb 위치만 On으로 이동한다.

## Behavior

- Pointer로 누르거나 Focus 상태에서 Space를 누르면 On/Off가 전환된다.
- Disabled는 현재 On/Off 값을 유지하지만 변경할 수 없다.
- `checked`, `defaultChecked`, `onCheckedChange`로 controlled 또는 uncontrolled 상태를 지원한다.
- On/Off 전환에서는 Thumb 위치와 Track 색상이 함께 부드럽게 바뀐다. Disabled 전환에서는 현재 Thumb 위치를 유지하고 Track과 Thumb 색상만 전환한다.
- `readOnly`, `required`, `name`, `value`, `uncheckedValue`, `form`은 Base UI의 Form 연결 범위에서 전달한다.
- `SwitchField`는 표시 Label과 Control을 `aria-labelledby`로 직접 연결한다. 원자적인 `Switch`는 소비자가 `aria-label` 또는 `aria-labelledby`를 제공한다.

## Guidelines

### Target area 확보하기

- Switch Control과 Label을 포함한 전체 영역이 Target으로 동작한다.
- 16px Control은 최소 24px 높이의 Target area를 확보한다.
- List처럼 다른 요소와 결합해 사용하면 전체 Row가 Target이 된다.

### 상태를 즉시 활성화할 때만 사용하기

- Switch는 토글한 직후 연결된 설정이나 기능의 결과가 나타나는 경우에만 사용한다.
- 취소·확인·가입하기처럼 마지막 버튼을 누를 때까지 결과가 나타나지 않는 경우에는 Switch를 사용하지 않고 Checkbox를 사용한다.

### 독립적인 기능에서만 사용하기

- 각 Switch는 다른 Switch에 영향을 주지 않고 독립적으로 작동해야 한다.
- 전체 선택과 하위 선택처럼 부모–자식 관계가 필요하면 Switch 대신 Checkbox 구조를 사용한다.

### Disabled 상태는 명확하게 표현하기

- Switch를 사용할 수 없다면 Control뿐 아니라 Label도 disabled foreground로 표현한다.
- Control과 Label의 상태를 일치시켜 항목 전체를 조작할 수 없다는 점을 명확히 전달한다.

## 현재 정의하지 않은 항목

- 별도 Container variant
- Label 없이 원자적인 `Switch`만 사용할 때의 제품별 accessible label 정책
- Loading 또는 Error 상태

## Verification

- Pointer와 Label 전체 영역 클릭
- Focus 상태의 Space 전환
- Disabled 값 유지와 상호작용 차단
- 기본 Medium과 Small/Medium/Large Control·Thumb 크기
