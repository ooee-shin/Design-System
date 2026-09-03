# ooee-ui agent instructions

이 저장소는 블루키 제품에서 사용할 UI 시스템의 1차 컴포넌트를 완성하는 작업 환경이다. 완성된 자산은 이후 블루키 코드베이스로 이관하거나 별도 패키지로 연동한다. 통합 방식은 아직 검토 중이며 1차 작업에는 영향을 주지 않는다.

**이 파일은 작업 운영 규칙만 소유한다.** 토큰 문법, 구조 용어, 상호작용 규칙처럼 시스템 자체의 정의는 `docs/system/`이 원본이며 여기에 다시 쓰지 않는다.

## 문서 구조

| 위치 | 성격 |
| --- | --- |
| `docs/system/` | 시스템에 무엇이 있고 어떤 정의이며 어떻게 쓰는가. 블루키에 전달할 영구 자산 |
| `docs/process/` | 어떤 자료를 근거로 어떤 순서와 규칙으로 만드는가. 전달 시 제거 |
| `AGENTS.md` | 작업 운영 규칙. 전달 시 제거 |

`docs/process/`와 이 파일은 1차 컴포넌트를 완성하는 동안에만 필요한 작업 규칙을 담는다. `ㄱ`, `업무시작`, `퇴근백업` 같은 신호와 제작 절차는 시스템이 무엇인지 설명하지 않으므로 블루키 자산화 대상에서 제외한다. 반대로 시스템 정의를 이쪽에 두면 전달본에서 함께 사라지므로, 어느 쪽에 속하는지 먼저 판단한 뒤 기록한다.

**참조는 한 방향만 허용한다.** `docs/process/`와 `AGENTS.md`는 `docs/system/`을 자유롭게 참조하지만, `docs/system/`의 문서는 이 둘을 참조하지 않는다. 이 규칙 덕분에 과정 문서를 통째로 제거해도 시스템 문서가 그대로 성립한다. 새 문서를 만들 때도 이 방향을 지킨다.

## 작업을 시작할 때

1. `git status -sb`로 현재 branch, upstream과 미커밋 변경을 확인한다. 다른 작업자의 변경을 덮어쓰지 않는다.
2. `docs/system/README.md`에서 시스템 구성과 자산 성숙도를 확인한다.
3. `docs/process/working-context.md`에서 현재 구현, 열린 결정과 다음 작업을 확인한다.
4. 작업 대상과 관련된 `docs/system/foundations/*` 또는 `docs/system/components/*` 문서를 읽는다.
5. 문서와 코드가 다르면 사용자에게 차이를 알리고, 임의로 기준을 확정하지 않는다.
6. `Provisional` 결정은 테스트할 수 있지만 `Stable`로 자동 승격하지 않는다.

## 지켜야 할 시스템 규칙

작업 전에 해당 문서를 읽고 그대로 따른다. 규칙을 이 파일에 복제하지 않는다.

- 구조 용어와 모양 어휘 — `docs/system/vocabulary.md`
- 토큰 문법과 사용 규칙 — `docs/system/tokens.md`
- Focus, Disabled, Read-only와 Layout 기본값 — `docs/system/interaction.md`
- 상태·접근성·반응형 조건 — `docs/system/quality.md`
- Studio 화면 구성 기준 — `docs/system/studio.md`
- 아이콘 공급원과 사용 규칙 — `docs/system/foundations/icon.md`

제작 절차는 `docs/process/pipeline.md`를 따른다.

## 코드 소유 경계

- `apps/studio`는 Workbench, 예시 콘텐츠, 출처, 성숙도, viewport·theme·locale 검수 control만 소유한다.
- 외부 원본을 그대로 검토하는 초기 Experiment는 Studio에 둘 수 있다.
- 사용자가 수정하거나 ooee 자산으로 채택한 UI는 Candidate/Provisional이어도 `packages/ui`에 실제 원본을 둔다.
- 채택된 조합 패턴은 내부를 성급하게 분해하지 않고 전체 단위로 `packages/patterns`에 실제 원본을 둔다.
- Studio는 공용 package를 import해 표시하며 같은 자산의 Studio 전용 복사본을 만들지 않는다.

## 변경 원칙

- 사용자가 직전 제안에 `ㄱ` 또는 `ㄱㄱ`로 답하면 해당 제안에 동의하며 바로 반영하라는 요청으로 해석한다.
- 사용자가 `업무시작` 또는 같은 의미로 말하면 코드를 건드리기 전에 먼저 브리핑한다. `docs/process/working-context.md`의 「바로 다음 작업」과 그 아래 사용자 확인을 기다리는 항목을 읽고, 사용자가 결정해야 하는 항목과 현재 진행 상황·다음 단계를 정리해 보고한다. 대화 기록이 아니라 이 파일이 원본이다.
- 사용자가 `퇴근백업` 또는 같은 의미로 말하면 작업을 정리하고 `docs/process/working-context.md`의 현재 구현·다음 작업·확인 대기 항목을 갱신한 뒤 `pnpm check`를 통과시키고 commit·push까지 끝낸다. 다음 작업자와 다른 기기가 이어받을 수 있는 상태로 만드는 것이 목적이다.
- 사용자의 명시적 디자인 판단을 문서와 코드에 함께 반영한다.
- 컴포넌트 작업 중 기존 token으로 설명되지 않는 색상 패턴을 발견하면 사용자에게 알리고 Candidate로 기록한다. 승격 기준은 `docs/process/pipeline.md`를 따르며, 발견했다는 이유만으로 공용 semantic token에 즉시 추가하지 않는다.
- 접근성, theme 또는 시스템 경계에 필요한 token은 첫 사용에도 추가할 수 있다.
- shadcn update를 oe에 자동 덮어쓰지 않는다. Experiment에서 차이를 검수한 뒤 선별적으로 반영한다.

## 화면 확정 검수

- 사용자가 “스튜디오 화면 확정”, “페이지 확정” 또는 같은 의미로 요청하면 문서 구조, 실제 Props, Anatomy, Property별 설명 카드, State coverage, token, theme·locale·viewport, interaction, accessibility, 공용 package 소유 경계와 `pnpm check`를 함께 점검한다.
- 컴포넌트를 반복 조정하는 동안에는 개별 시각 수정마다 `docs/system/components/{component}.md`를 갱신하지 않는다. 사용자가 “확정할게”, “완료” 또는 같은 의미로 말하면 실제 공용 컴포넌트와 Studio 화면을 대조한 뒤 해당 Component MD의 Anatomy, Properties, State, Layout, Guidelines, Specification과 미정 사항을 한 번에 정리한다.
- 여러 컴포넌트에 즉시 적용되는 Studio 공통 규칙, Foundation 결정 또는 다음 작업자가 중간에 반드시 알아야 하는 충돌은 Component 확정 시점까지 미루지 않고 `docs/system/*`, `docs/process/*` 또는 `docs/process/working-context.md`에 바로 기록한다.
- 확인된 구현·문서 불일치는 수정할 수 있지만, 누락된 Property 카드의 필요성이나 새로운 사용 정책처럼 판단이 필요한 내용은 모아서 사용자에게 질문한다.
- 화면 확정만으로 Candidate를 Stable로 승격하거나 commit·push하지 않는다. 각각 사용자의 명시적 요청 또는 별도 승격 검토가 필요하다.

## 검증

코드 변경 후 `pnpm check`를 실행한다. 세부 규칙과 테스트 배치 기준은 `docs/process/tooling.md`를 따른다.

## 여러 환경에서 이어서 작업할 때

- Git remote의 push된 commit만 다른 기기와 계정이 공유할 수 있는 상태로 간주한다. 대화 기록과 로컬 미커밋 변경에 의존하지 않는다.
- `main`은 항상 검사를 통과한 공식 원본으로 유지한다. 코드 변경, 여러 날에 걸친 작업과 다른 사람이 합치기 전에 봐야 하는 변경은 별도 branch와 pull request를 거치며 GitHub `Quality` 검사가 성공한 뒤 합친다. 문서 문구 보강이나 오타 수정처럼 코드에 영향이 없고 되돌리기 쉬운 변경은 예외로 `main`에 직접 커밋할 수 있다. `main` push에서도 같은 자동 검사가 돌며, 실패하면 즉시 되돌린다.
- 작업 branch를 오래 끌지 않는다. 목적 하나가 끝나면 합치고 지운다. 여러 목적을 한 branch에 쌓으면 합칠 때 무엇이 바뀌었는지 읽기 어려워진다.
- 작업 시작 시 working tree가 깨끗한지 확인하고, 깨끗할 때만 현재 작업 branch를 `git pull --ff-only`로 최신화한다.
- 두 기기에서 같은 branch를 동시에 수정하지 않는다. 동시에 작업해야 하면 기기별 branch를 사용하고 한쪽에서 merge한 뒤 다른 쪽이 다시 pull한다.
- 의미 있는 구현·규칙·다음 작업이 바뀌면 관련 문서와 `docs/process/working-context.md`를 최소한으로 갱신한다.
- `docs/process/working-context.md`는 changelog가 아니라 현재 상태 snapshot으로 유지한다. 더 이상 현재 이해에 필요 없는 완료·과거 과정은 제거하고, 현재 구현·진행 중인 사항·바로 다음 작업·유효한 주의사항만 남긴다. 장기 설계 결정은 해당 `docs/system/` 문서로 옮긴다.
- 사용자가 commit/push를 요청하면 staging 전에 이번 작업과 대화에서 생긴 지속 가능한 결정이 repository에 반영됐는지 확인한다. 이전 대화를 보지 못한 다음 작업자가 잘못 판단할 수 있는 정보만 기록한다.
- 누락을 발견하면 코드와 함께 적절한 기존 문서를 먼저 갱신한다. 시스템 정의는 `docs/system/`, 제작 절차는 `docs/process/`, 현재 구현과 다음 작업은 `docs/process/working-context.md`, 작업 운영 규칙은 `AGENTS.md`를 사용한다.
- 기기를 바꾸기 전 `pnpm check`, diff 검토, commit과 push를 완료한다. commit/push 권한은 사용자의 명시적 요청을 따른다.
- secret 값, 계정 정보와 기기별 절대경로를 repository에 기록하지 않는다.
