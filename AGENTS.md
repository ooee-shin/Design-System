# ooee-ui agent instructions

이 저장소는 shadcn과 외부 UI 자료를 실제 화면에서 검수하고 ooee 자산으로 정규화하는 개인 UI 제작 환경이다.

## 작업을 시작할 때

1. 루트 `README.md`에서 프로젝트 목적과 자산 성숙도 체계를 확인한다.
2. 작업 대상과 관련된 `docs/foundations/*` 문서를 읽는다.
3. 문서와 코드가 다르면 사용자에게 차이를 알리고, 임의로 기준을 확정하지 않는다.
4. `Provisional` 결정은 테스트할 수 있지만 `Stable`로 자동 승격하지 않는다.

## 고정된 역할

- shadcn: 구현 기반과 외부 공급망이다.
- Obra: 필요할 때 사용하는 품질 및 Figma 참고자료다.
- VibePrompt와 외부 UI: 화면과 패턴을 발견하는 입력이다.
- oe: 검수 후 확정한 semantic token과 컴포넌트 규칙이다.

외부 코드를 그대로 Stable 자산으로 취급하지 않는다.

## 자산 제작 순서

```text
External reference
→ Experiment
→ 화면 맥락에서 비주얼·상태·반응형·접근성 검수
→ Candidate 추출
→ oe token 정규화
→ 다른 화면에서 재검증
→ Stable 승격
```

초기 Experiment에서는 shadcn token과 primitive를 사용할 수 있다. Stable 컴포넌트에서는 raw color와 shadcn visual token을 제거하고 oe semantic token을 우선한다.

## 토큰 문법

- Tailwind 및 생성된 색상 palette는 primitive이며 `oe` prefix를 붙이지 않는다.
- `oe` prefix는 semantic token에만 사용한다.
- Neutral role은 이름에서 생략한다.
- `primary`, `secondary`는 색상 이름이 아니라 같은 property/role 안의 강조 위계다.
- 초기 체계에는 tertiary를 추가하지 않는다.

```text
oe-background-primary
oe-foreground-primary
oe-border-secondary

oe-brand-background-primary
oe-danger-foreground-primary
oe-warning-border-secondary
```

일반 surface는 Neutral이다. Brand와 status는 명시된 role에서만 사용한다.

어두운 solid brand/status 배경 위에는 공통 `oe-foreground-inverse`를 먼저 검토한다. 밝은 배경에는 대비가 확보되는 Neutral foreground를 사용한다. 반복되는 실제 예외가 생기기 전에는 `on-*` token을 만들지 않는다.

## Brand primitive 규칙

- 입력한 HEX는 `brand-source`로 보존한다.
- `@material/material-color-utilities`의 HCT tonal palette를 사용한다.
- HCT tone을 `brand-50~950`에 연결한다.
- Alpha primitive는 seed RGB 기준으로 다음 값만 생성한다: `05, 08, 10, 16, 20, 30, 40, 50, 60, 70, 80, 90`.
- Alpha primitive를 컴포넌트에 남발하지 않는다.
- 같은 의미로 반복되면 semantic token 승격을 검토한다.
- Primitive는 모드에 독립적이고 semantic mapping은 Light/Dark에서 달라질 수 있다.
- HCT의 Material semantic roles를 oe semantic roles로 자동 채택하지 않는다.
- Sidebar와 Chart token은 특수 목적의 shadcn token으로 유지하고 oe 공용 semantic에 흡수하지 않는다.

세부 규칙과 현재 Provisional 매핑은 `docs/foundations/color.md`를 따른다. 실행 가능한 생성 규칙의 원본은 `packages/tokens/src/index.ts`다.

## Studio 검수 기준

화면 Experiment에는 가능한 경우 다음 검수 컨트롤을 제공한다.

- Light/Dark
- 국문/영문/일어 콘텐츠와 typography
- 모바일/데스크톱 반응형
- 인터랙션과 상태
- 출처, 성숙도, oe mapping 상태

폰트만 바꾸지 말고 언어를 선택하면 실제 콘텐츠와 `lang`도 함께 바꾼다.

## 변경 원칙

- 사용자의 명시적 디자인 판단을 문서와 코드에 함께 반영한다.
- 새 token은 한 번의 편의를 위해 추가하지 않는다. 같은 의미로 세 번 반복되거나 두 개 이상의 독립 컴포넌트에서 필요하면 승격을 검토한다.
- 접근성, theme 또는 시스템 경계에 필요한 token은 첫 사용에도 추가할 수 있다.
- shadcn update를 oe에 자동 덮어쓰지 않는다. Experiment에서 차이를 검수한 뒤 선별적으로 반영한다.
- 고객 납품물은 특정 시점의 project snapshot이며 이후 ooee 변경과 자동 연결하지 않는다.

## 검증

코드 변경 후 최소한 다음을 실행한다.

```bash
pnpm lint
pnpm build
```

인터랙션이나 반응형을 변경했다면 Studio의 실제 화면에서도 해당 동작을 검수한다.
