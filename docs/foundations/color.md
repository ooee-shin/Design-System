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
