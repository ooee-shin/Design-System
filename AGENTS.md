# ooee-ui agent instructions

이 저장소는 shadcn과 외부 UI 자료를 실제 화면에서 검수하고 ooee 자산으로 정규화하는 개인 UI 제작 환경이다.

## 작업을 시작할 때

1. `git status -sb`로 현재 branch, upstream과 미커밋 변경을 확인한다. 다른 작업자의 변경을 덮어쓰지 않는다.
2. 루트 `README.md`에서 프로젝트 목적과 자산 성숙도 체계를 확인한다.
3. `docs/WORKING_CONTEXT.md`에서 현재 구현, 열린 결정과 다음 작업을 확인한다.
4. 작업 대상과 관련된 `docs/foundations/*` 또는 `docs/components/*` 문서를 읽는다.
5. 문서와 코드가 다르면 사용자에게 차이를 알리고, 임의로 기준을 확정하지 않는다.
6. `Provisional` 결정은 테스트할 수 있지만 `Stable`로 자동 승격하지 않는다.

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
- `tertiary`는 실제 용례가 확인된 Neutral foreground에만 사용하며 다른 property/role로 자동 확장하지 않는다.

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
- 컴포넌트 작업 중 기존 token으로 설명되지 않는 색상 패턴을 발견하면 사용자에게 알리고 Candidate로 기록한다.
- Candidate는 실제 사용 위치, 해결하려는 역할, 임시 primitive 값, 기존 token으로 해결할 수 없는 이유를 포함한다.
- Candidate를 발견했다는 이유만으로 공용 semantic token이나 Stable token에 즉시 추가하지 않는다.
- 새 token은 한 번의 편의를 위해 추가하지 않는다. 같은 의미로 세 번 반복되거나 두 개 이상의 독립 컴포넌트에서 필요하면 승격을 검토한다.
- semantic token에 이미 alpha나 강조 위계가 포함되어 있으면 컴포넌트에서 임의 opacity를 중첩해 위계를 다시 바꾸지 않는다. 추가 감쇠가 필요하면 기존 token 선택이 맞는지 먼저 확인하고, 해결되지 않을 때만 별도 상태 또는 token Candidate로 검토한다.
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

## 여러 환경에서 이어서 작업할 때

- Git remote의 push된 commit만 다른 기기와 계정이 공유할 수 있는 상태로 간주한다. Codex 대화와 로컬 미커밋 변경에 의존하지 않는다.
- 작업 시작 시 working tree가 깨끗한지 확인하고, 깨끗할 때만 현재 작업 branch를 `git pull --ff-only`로 최신화한다.
- 두 기기에서 같은 branch를 동시에 수정하지 않는다. 동시에 작업해야 하면 기기별 branch를 사용하고 한쪽에서 merge한 뒤 다른 쪽이 다시 pull한다.
- 의미 있는 구현·규칙·다음 작업이 바뀌면 관련 영역 문서와 `docs/WORKING_CONTEXT.md`를 최소한으로 갱신한다.
- `docs/WORKING_CONTEXT.md`는 changelog가 아니라 현재 상태 snapshot으로 유지한다. 갱신할 때 더 이상 현재 이해에 필요 없는 완료·과거 과정은 제거하거나 현재 상태로 대체하고, 현재 구현·진행 중인 사항·바로 다음 작업·유효한 주의사항만 남긴다. 장기 설계 결정은 해당 Foundation/Component 문서로 옮기며 Git history로 확인 가능한 단순 완료 기록은 누적하지 않는다.
- 사용자가 현재 작업의 commit/push를 요청하면 staging 전에 이번 작업과 대화에서 생긴 지속 가능한 결정이 repository에 반영됐는지 확인한다. 이전 대화를 보지 못한 다음 작업자가 잘못 판단하거나 이미 내린 중요한 결정을 되돌릴 수 있는 정보만 기록한다.
- 위 점검에서 누락을 발견하면 코드와 함께 적절한 기존 문서를 먼저 갱신한다: 현재 구현·다음 작업은 `docs/WORKING_CONTEXT.md`, 프로젝트 공통 규칙은 `AGENTS.md`, Foundation 결정은 `docs/foundations/*`, Component 결정은 `docs/components/*`를 사용한다. 사소한 구현 과정과 대화 전문은 기록하지 않는다.
- 기기를 바꾸기 전 `pnpm check`, diff 검토, commit과 push를 완료한다. commit/push 권한은 사용자의 명시적 요청을 따른다.
- secret 값, 계정 정보와 기기별 절대경로를 repository에 기록하지 않는다.
