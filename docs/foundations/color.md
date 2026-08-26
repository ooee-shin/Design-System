# Color foundation v0

상태: `Provisional`

이 문서는 브랜드 seed color를 ooee의 primitive 및 semantic color token으로 변환하는 초기 규칙을 정의한다. 실제 컴포넌트와 여러 브랜드에서 검증되기 전까지 매핑값은 변경될 수 있다.

## 생성 과정

1. 6자리 HEX 브랜드 seed를 입력한다.
2. Material Color Utilities의 HCT로 동일한 hue/chroma의 tonal palette를 생성한다.
3. HCT tone을 ooee의 `brand-50~950` 명칭에 연결한다.
4. seed의 RGB 값을 기준으로 alpha primitive를 생성한다.
5. Light/Dark 모드별 oe semantic token을 primitive에 연결한다.
6. 컴포넌트에서는 semantic token을 우선 사용한다.

HCT는 palette 계산 도구로 사용한다. Material의 semantic role이나 컴포넌트 색상 체계를 그대로 채택하지 않는다.

Color Foundation 화면은 `Tailwind Primitive`, `OE Semantic`, `Brand Color`를 한 페이지의 분리된 탭으로 제공한다. Tailwind Primitive에는 Tailwind CSS v4의 white/black과 22개 기본 palette 전체를 표시한다. OE Semantic은 실제 컴포넌트가 우선 사용하는 의미 토큰을, Brand Color는 seed와 HCT로 생성한 ooee 전용 palette 및 semantic mapping 후보를 표시한다. Sidebar와 Chart는 특수 목적의 shadcn token으로 유지하며 oe 공용 semantic 목록에 포함하지 않는다.

Neutral, Accent, Warning, Danger, Success, Info의 이름과 Light/Dark primitive 매핑은 `packages/tokens/src/index.ts`의 `CORE_SEMANTIC_TOKENS`가 단일 실행 원본이다. Color Foundation 표와 Studio 전역 CSS 변수는 이 정의를 함께 사용하며 표시용 목록을 별도로 복제하지 않는다.

## Solid primitive

| Token | HCT tone |
| --- | ---: |
| `brand-50` | 98 |
| `brand-100` | 95 |
| `brand-200` | 90 |
| `brand-300` | 80 |
| `brand-400` | 70 |
| `brand-500` | 60 |
| `brand-600` | 50 |
| `brand-700` | 40 |
| `brand-800` | 30 |
| `brand-900` | 20 |
| `brand-950` | 10 |

`brand-source`는 입력한 브랜드 원색을 그대로 보존한다. HCT palette는 색역 보정으로 인해 source와 정확히 같은 값을 포함하지 않을 수 있다.

## Alpha primitive

다음 단계만 생성한다.

```text
brand-alpha-05
brand-alpha-08
brand-alpha-10
brand-alpha-16
brand-alpha-20
brand-alpha-30
brand-alpha-40
brand-alpha-50
brand-alpha-60
brand-alpha-70
brand-alpha-80
brand-alpha-90
```

Alpha primitive는 Experiment에서 직접 사용할 수 있지만 컴포넌트에 임의로 반복 사용하지 않는다. 같은 의미와 맥락에서 반복되면 semantic token으로 승격할 필요가 있는지 검토한다.

## Semantic mapping v0

### Light

```text
oe-brand-foreground-primary          → brand-800
oe-brand-foreground-secondary        → brand-600
oe-brand-background-primary          → brand-50
oe-brand-background-secondary        → brand-100
oe-brand-background-bold-primary     → brand-700
oe-brand-border-primary              → brand-500
oe-brand-border-secondary            → brand-200
oe-focus-ring                        → brand-600
```

### Dark

```text
oe-brand-foreground-primary          → brand-200
oe-brand-foreground-secondary        → brand-400
oe-brand-background-primary          → brand-950
oe-brand-background-secondary        → brand-900
oe-brand-background-bold-primary     → brand-400
oe-brand-border-primary              → brand-500
oe-brand-border-secondary            → brand-800
oe-focus-ring                        → brand-400
```

위 값은 모든 브랜드에 적용되는 확정 공식이 아니다. seed의 명도와 chroma, 실제 배경과 접근성 대비를 Color Lab에서 검수한 뒤 브랜드별로 override할 수 있다.

## 공통 사용 규칙

- Neutral surface는 `oe-background-*`, 브랜드 표현은 `oe-brand-background-*`를 사용한다.
- 직접 조작하는 form control의 식별 보더는 `oe-border-primary`, control과 Label 등을 하나의 영역으로 감싸는 form container 보더는 `oe-border-secondary`를 사용한다.
- 상태색은 `oe-danger-*`, `oe-warning-*`, `oe-success-*`, `oe-info-*`로 분리한다.
- 어두운 solid 배경 위의 텍스트와 아이콘은 공통 `oe-foreground-inverse`를 우선 검토한다.
- 밝은 브랜드 배경에서는 `oe-foreground-primary`처럼 대비가 확보되는 중립 foreground를 사용한다.
- Primitive 숫자는 컴포넌트 의미가 아니다. Stable 컴포넌트는 가능한 semantic token을 사용한다.
- Alpha 결과는 합성되는 배경에 따라 달라지므로 Light, Dark, 이미지 배경에서 각각 검수한다.
- `oe-focus-ring`은 적용된 brand seed를 기반으로 Light `brand-600`, Dark `brand-400`에 연결한다. 브랜드 기반이어도 식별 가능성과 대비 검증을 우선한다.

## 아직 확정하지 않은 항목

- 대표 solid action에 사용할 semantic token 이름
- 브랜드별 semantic override 저장 형식
- 대비 검증 기준과 자동 경고 수준
- Neutral 및 status palette 생성 규칙

## 다음 검토 체크포인트

현재 Studio의 OE Semantic 표와 위 `Semantic mapping v0`은 구조를 눈으로 확인하기 위한 임시안이다. 아래 질문에 답하기 전에는 실제 컴포넌트의 Stable 계약이나 최종 매핑으로 간주하지 않는다.

### 제안하는 최소 역할

```text
Neutral
oe-foreground-primary / secondary / tertiary / disabled / inverse
oe-foreground-inverse-secondary
oe-background-canvas-primary / canvas-secondary
oe-background-primary / secondary / disabled / disabled-selected / bold-primary
oe-background-control-off / control-disabled
oe-border-primary / secondary / disabled
oe-focus-ring
oe-interaction-hover

Accent
oe-accent-background-bold-primary

Brand 및 danger / warning / success / info
oe-{role}-foreground-primary / secondary
oe-{role}-background-primary / secondary / bold-primary
oe-{role}-border-primary / secondary
```

- `primary/secondary`는 사용 빈도가 아니라 같은 role/property 안의 **시각적 위계**를 나타낸다.
- Light Neutral background는 primary에서 secondary 순으로 어두워진다. Dark에서는 이름보다 동일한 UI 역할과 계층을 유지한다.
- Canvas와 컴포넌트 surface는 독립적으로 테마를 바꿀 수 있도록 분리한다.
- `background-bold-primary`는 버튼, 배지, 강한 선택 상태처럼 채도가 높거나 어두운 solid fill의 후보 이름이다.
- `bold`는 background 전용 modifier로 사용한다.
- `interaction-hover`는 기존 background를 교체하지 않고 위에 합성하는 state layer다. 초기값은 Light `black / 5%`, Dark `white / 8%`이며 화면 검증 후 조율한다.
- 클릭 가능한 아이콘은 공통적으로 hover 시 `interaction-hover` 회색조 state layer를 표시하고, keyboard focus 시 `oe-focus-ring`을 표시한다.
- `foreground-inverse-secondary`는 bold fill 위의 약한 메타 정보에 사용한다.
- `background-disabled-selected`는 선택값을 유지한 채 조작만 제한된 control의 Neutral fill이다. Light/Dark 모두 `neutral-400`을 사용한다.
- `background-control-off`는 조작 가능한 Boolean control의 Off Track이며 Light `neutral-400`, Dark `neutral-500`을 사용한다.
- `background-control-disabled`는 조작할 수 없는 Boolean control의 Track이다. 이전 Off 색상인 Light `neutral-300`, Dark `neutral-600`을 사용해 Enabled Off보다 한 단계 낮은 위계를 만든다.
- `accent`는 danger나 warning 같은 상태 의미 없이 시선을 끄는 교체 가능한 강조 role이다. shadcn `accent`와 직접 매핑하지 않는다.
- `oe-accent-background-bold-primary`는 Light `red-600`, Dark `red-400`으로 시작한다.
- overlay token은 실제 반복 사용이 확인되기 전까지 Candidate로만 둔다. 현재 첫 실제 사례는 Color swatch의 내부 경계이며 Neutral border 대신 1px inset `black 10%`를 사용한다. 이미지와 색상 값에 같은 역할을 적용하는 방향은 확정했지만 정확한 alpha 강도와 semantic token 이름은 실제 이미지 사례에서 함께 재검수한다.

### 다음 작업에서 먼저 답할 질문

1. ~~Neutral canvas와 component surface의 구조~~: `canvas-primary/secondary`와 `background-primary/secondary`를 분리하는 안으로 현재 검토 화면에 반영했다.
2. Focus를 border 계열인 `oe-border-focus`로 둘 것인가, 독립 접근성 역할인 `oe-focus-ring`으로 둘 것인가? 현재 추천은 `oe-focus-ring`이다.
3. ~~강한 solid fill의 modifier 이름~~: `bold`를 background 전용 modifier로 사용하기로 결정했다.
4. 지금 실제로 반복되는 overlay 용례는 무엇인가? 예: 이미지 위 border, 이미지 hover, 선택 행, brand tint, scrim. 확인 전에는 공통 overlay semantic을 늘리지 않는다.
5. ~~Status role 명칭~~: `danger`, `warning`, `success`, `info` 네 가지를 공용 명칭으로 사용하고 중복 용어는 만들지 않는다.

답변 후에는 다음을 함께 수정한다.

- 이 문서의 Light/Dark 매핑
- `packages/tokens/src/index.ts`의 semantic reference
- Studio의 OE Semantic catalog
- 필요한 경우 전역 CSS 변수와 shadcn compatibility mapping

현재 매핑은 전체 Color catalog에서 컨펌하기 위한 Provisional 후보이며, 접근성 대비와 실제 컴포넌트 검증 후 Stable로 승격한다.

MessageBubble의 삭제 action hover에서 `oe-danger-background-primary`가 첫 실제 용례로 확인되었다. 초기 매핑은 Light `red-50`, Dark `red-950`이며 다른 danger surface와 함께 대비를 추가 검증한다.

## 컴포넌트 작업에서의 확장 방식

이 Color v0는 가능한 조합을 미리 모두 생성하는 닫힌 목록이 아니다. 이후 컴포넌트와 화면을 만들면서 기존 token으로 설명하기 어려운 패턴이 발견되면 다음 순서로 고도화한다.

```text
새 색상 패턴 발견
→ 기존 semantic token이나 component recipe로 해결 가능한지 확인
→ 해결되지 않으면 사용자에게 알림
→ Candidate 등록
→ 다른 상태·모드·컴포넌트에서 재검증
→ 공용 semantic token / component token / 일회성 recipe 중 하나로 분류
→ 승인 후 Provisional 또는 Stable에 반영
```

Candidate에는 최소한 다음을 기록한다.

- 발견한 화면과 컴포넌트
- 상태와 사용 맥락
- 해결하려는 의미와 시각적 역할
- 사용한 임시 primitive 또는 alpha 값
- 기존 token을 재사용하지 못한 이유
- Light/Dark 및 접근성 검수 여부

같은 의미로 세 번 반복되거나 두 개 이상의 독립 컴포넌트에서 필요하면 공용 semantic token 승격을 검토한다. 접근성, theme, 시스템 경계에 필수적인 값은 첫 용례에서도 등록할 수 있다. 특정 컴포넌트에만 의미가 있다면 공용 token을 늘리지 않고 component token 또는 recipe로 유지한다.

## 첫 적용: Inbox split view

`/experiments/inbox-split-view`는 Color v0의 첫 실제 검증 화면이다. 다음 역할을 Provisional로 연결한다.

- Preview 바탕: `oe-background-canvas-secondary`
- Inbox와 reading pane surface: `oe-background-primary`
- 검색창, 선택 행, incoming bubble: `oe-background-secondary` (Light `neutral-100`, Dark `neutral-800`)
- Outgoing bubble과 Send button: `oe-background-bold-primary`
- Unread count badge: `oe-accent-background-bold-primary`
- 본문, 보조 정보, timestamp와 leading icon: `oe-foreground-primary / secondary / tertiary`
- Bold fill 위 콘텐츠: `oe-foreground-inverse`
- 외곽과 내부 divider: `oe-border-primary / secondary`
- 키보드 focus: `oe-focus-ring`

Hover는 `oe-interaction-hover` layer를 기존 background 위에 합성한다. Outgoing message metadata의 낮은 강조는 `oe-foreground-inverse-secondary`를 사용한다. 두 token은 Inbox에서 필요성이 확인되어 Provisional로 승격했으며, 다른 컴포넌트와 여러 배경에서 alpha 및 대비를 추가 검증한다.
