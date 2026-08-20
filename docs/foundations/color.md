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

Color Foundation 화면은 `OE Semantic`과 `Brand Primitive`를 한 페이지의 분리된 탭으로 제공한다. Sidebar와 Chart는 특수 목적의 shadcn token으로 유지하며 oe 공용 semantic 목록에 포함하지 않는다.

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
oe-brand-background-overlay-primary  → brand-alpha-08
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
oe-brand-background-overlay-primary  → brand-alpha-16
oe-brand-border-primary              → brand-500
oe-brand-border-secondary            → brand-alpha-30
oe-focus-ring                        → brand-400
```

위 값은 모든 브랜드에 적용되는 확정 공식이 아니다. seed의 명도와 chroma, 실제 배경과 접근성 대비를 Color Lab에서 검수한 뒤 브랜드별로 override할 수 있다.

## 공통 사용 규칙

- Neutral surface는 `oe-background-*`, 브랜드 표현은 `oe-brand-background-*`를 사용한다.
- 상태색은 `oe-danger-*`, `oe-warning-*`, `oe-success-*`, `oe-info-*`로 분리한다.
- 어두운 solid 배경 위의 텍스트와 아이콘은 공통 `oe-foreground-inverse`를 우선 검토한다.
- 밝은 브랜드 배경에서는 `oe-foreground-primary`처럼 대비가 확보되는 중립 foreground를 사용한다.
- Primitive 숫자는 컴포넌트 의미가 아니다. Stable 컴포넌트는 가능한 semantic token을 사용한다.
- Alpha 결과는 합성되는 배경에 따라 달라지므로 Light, Dark, 이미지 배경에서 각각 검수한다.
- Focus ring은 브랜드 원색보다 식별 가능성과 대비를 우선한다.

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
oe-foreground-primary / secondary / disabled / inverse
oe-background-primary / secondary / disabled / bold-primary
oe-border-primary / secondary / disabled
oe-focus-ring

Brand 및 danger / warning / success / info
oe-{role}-foreground-primary / secondary
oe-{role}-background-primary / secondary / bold-primary
oe-{role}-border-primary / secondary
```

- `primary/secondary`는 사용 빈도가 아니라 같은 role/property 안의 **시각적 강조 위계**만 나타낸다.
- `background-primary`는 `background-secondary`보다 시각적으로 강해야 한다.
- `background-bold-primary`는 버튼, 배지, 강한 선택 상태처럼 채도가 높거나 어두운 solid fill의 후보 이름이다.
- overlay token은 실제 반복 사용이 확인되기 전까지 Candidate로만 둔다.

### 다음 작업에서 먼저 답할 질문

1. Neutral surface에서 페이지 canvas를 `oe-background-secondary`, Card/Popover처럼 분리된 surface를 `oe-background-primary`로 두는가?
2. Focus를 border 계열인 `oe-border-focus`로 둘 것인가, 독립 접근성 역할인 `oe-focus-ring`으로 둘 것인가? 현재 추천은 `oe-focus-ring`이다.
3. 강한 solid fill의 modifier 이름을 `bold`로 확정할 것인가? 대안은 `strong`이다.
4. 지금 실제로 반복되는 overlay 용례는 무엇인가? 예: 이미지 위 border, 이미지 hover, 선택 행, brand tint, scrim. 확인 전에는 공통 overlay semantic을 늘리지 않는다.
5. status role을 `danger`, `warning`, `success`, `info` 네 가지로 확정하고 `negative`, `caution`, `positive`, `information` 같은 중복 용어는 제거하는가?

답변 후에는 다음을 함께 수정한다.

- 이 문서의 Light/Dark 매핑
- `packages/tokens/src/index.ts`의 semantic reference
- Studio의 OE Semantic catalog
- 필요한 경우 전역 CSS 변수와 shadcn compatibility mapping

특히 현재 Light brand background의 `primary → brand-50`, `secondary → brand-100`은 위계 정의와 반대일 수 있다. 질문 1의 기준을 확정한 뒤 `primary → brand-100`, `secondary → brand-50` 후보와 실제 화면을 비교한다.
