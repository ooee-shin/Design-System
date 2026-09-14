# 작업 과정

이 디렉터리는 **1차 컴포넌트를 완성하기 위한 단발적인 작업 자료**다. 무엇을 기반으로 만들었는지, 어떤 자료를 참고했는지, 어떤 순서와 규칙으로 제작하는지를 다룬다.

블루키로 자산을 전달할 때 이 디렉터리와 루트 `AGENTS.md`는 통째로 제거한다. 여기 있는 내용은 컴포넌트를 만드는 동안에만 필요한 규칙이기 때문이다. `ㄱ`, `업무시작`, `퇴근백업` 같은 작업 신호, 외부 자료를 어디서 가져왔는지, 어떤 순서로 자산화하는지는 시스템이 무엇인지 설명하지 않는다. 영구적으로 남을 이유가 없으므로 자산화 대상에서 제외한다.

시스템을 이해하고 사용하는 데 필요한 내용은 전부 `docs/system/`과 `packages/`, `apps/studio`에 있으며, `docs/system/`은 이 디렉터리를 참조하지 않는다. 참조는 `docs/process/` → `docs/system/` 한 방향만 허용한다.

| 문서 | 내용 |
| --- | --- |
| [roadmap.md](roadmap.md) | AX 전환 5단계, 컴포넌트 참고 채널, A/B 비교 검증과 스택 이슈 |
| [sources.md](sources.md) | shadcn·Obra·VibePrompt 등 입력 자료의 역할과 취급 규칙 |
| [pipeline.md](pipeline.md) | 자산 제작 순서, 외부 자료 수입 8단계, 단계별 코드 규칙, 토큰 승격 기준 |
| [presentation.md](presentation.md) | Presentation 화면에 무엇을 어떻게 적는지와 기록하는 절차 |
| [tooling.md](tooling.md) | 작업 환경과 검증 명령 |
| [working-context.md](working-context.md) | 현재 구현, 열린 결정과 바로 다음 작업 |
| [git-workflow.md](git-workflow.md) | 안전한 branch·commit 운영 |
| [ai-environment.md](ai-environment.md) | AI 개발 환경 트랙의 순서, 스파이크, 통합 검증 항목과 아직 정하지 않은 것 |
| [figma-page-agent.md](figma-page-agent.md) | 이전에 단일 에이전트로 쓰던 Figma 페이지 디자이너 프롬프트 원문. `/design-page`의 입력 자료 |
| [open-questions.md](open-questions.md) | 화면을 만들며 검증할 항목 |
| [component-audit.md](component-audit.md) | 13개 컴포넌트 3중 대조 검수 결과와 확정한 정책. 고치는 작업이 끝나면 제거한다 |

## 핵심 제작 철학: Template First, Asset Later

기본 컴포넌트를 추상적으로 먼저 완성한 뒤 화면을 조립하는 방식으로만 만들지 않는다. 먼저 완성된 화면을 구현하고, 실제 화면 안에서 비주얼과 사용성을 수정한 뒤, 재사용할 가치가 있는 요소를 추출한다.

```text
외부 화면 선택
→ 화면 전체 구현
→ 실제 맥락에서 비주얼 수정
→ 상태와 인터랙션 보완
→ 재사용 후보 발견
→ oe token으로 정규화
→ Component/Pattern으로 추출
→ 다른 화면에서 재검증
→ 확정
```

예를 들어 채팅 화면을 자산화한다면 다음 순서로 진행한다.

```text
VibePrompt 채팅 화면 구현
→ Bubble 디자인 수정
→ incoming/outgoing, grouping, 전송 상태 정의
→ hover, selected, reply, failed 상태 검증
→ MessageBubble로 추출
→ 다른 채팅 화면에서 재사용
→ API와 토큰을 보완한 뒤 정식 자산 등록
```

처음부터 Golden Component를 가정하지 않는다. 여러 화면에서 반복적으로 검증된 컴포넌트가 결과적으로 Golden Component가 된다.

## 초기 실행 순서

프로젝트 착수 시 세운 Phase다. 현재 Phase 1~4를 지나 자산을 축적하는 중이다.

1. **환경** — React/TypeScript/Tailwind/shadcn 프로젝트, Skill·MCP·diff 워크플로우, 문서와 preview 환경, 접근성 및 시각 검증 기반
2. **최소 token v0** — token 문법과 분류 원칙 확정, 최소 neutral/status token을 임시 값으로 정의
3. **대표 화면** — 채팅·인증, 데이터, 설정처럼 성격이 다른 화면을 전체로 먼저 완성
4. **자산 추출** — 공용 자산 추출과 상태·API·접근성 정의, 두 번째 사용에서 재검증
5. **token v1과 변환 규칙** — 검증된 token만 v1으로 확정, shadcn token의 자동·문맥·수동 변환 구분
6. **반복 자동화** — raw color 검사, token candidate 기록, Story와 상태 preview 생성, 접근성 검사, viewport별 screenshot, visual regression, registry item 생성
