# Working context

새 작업이나 새로운 협업 환경에서 빠르게 현재 상태를 복구하기 위한 요약이다. 상세한 이유와 전체 철학은 루트 `README.md`, 강제 규칙은 루트 `AGENTS.md`, 색상 결정은 `docs/foundations/color.md`를 확인한다.

마지막 내용 점검: `2026-08-21`

이 파일은 현재 구현과 다음 작업처럼 변하는 정보만 관리한다. 설치 방법과 고정 규칙은 README/AGENTS에 두고 중복하지 않는다. 다른 기기에서 보이는 실제 상태는 마지막으로 push된 commit까지이므로, 아래 내용과 코드가 함께 commit되어 있는지 `git status -sb`와 `git log -1`로 확인한다.

## Git 작업 기준

- Remote: `https://github.com/ooee-shin/ooee-ui.git` (private)
- 공식 기준 branch: `main` (초기 작업 branch에서 전환)
- 다른 기기와 계정도 이 private repository 접근 권한과 각자의 Git identity 설정이 필요하다.
- 기기 교대 전 commit/push, 다음 기기에서 작업 전 `git pull --ff-only`를 원칙으로 한다.
- 현재 repository에는 필수 환경변수가 없다.
- `main`을 항상 정상 작동하는 공식 원본으로 사용하고, 변경은 별도 branch와 pull request를 거친다.
- GitHub의 `Quality` 자동 검사가 성공한 변경만 `main`에 합친다.

## 현재 기술 환경

- pnpm workspace
- Node.js 22.22.1 고정
- Next.js App Router Studio
- React 19, TypeScript, Tailwind CSS v4
- shadcn CLI v4
- Base UI + Nova preset
- Material Color Utilities HCT

## 현재 구현

- `/experiments/inbox-split-view`
  - VibePrompt의 Inbox split view를 React로 변환한 첫 Experiment
  - 대화 검색, 읽지 않은 메시지 count, 답장, 모바일 전환
  - Light/Dark 및 국문/영문/일어 콘텐츠 검수
  - Neutral OE semantic mapping을 첫 실제 검증 대상으로 Provisional 적용
  - canvas, surface, foreground 위계, border 위계, bold fill, inverse, focus ring을 사용
- `/foundations/color`
  - brand seed 입력
  - HCT `brand-50~950` 생성
  - 지정된 alpha primitive 생성
  - Light/Dark semantic mapping 후보 비교
- `/components/message-bubble`
  - Inbox에서 추출한 첫 Candidate 컴포넌트 Workbench
  - incoming/outgoing, avatar, 긴 콘텐츠, 국문/영문/일어, Light/Dark 검수
  - sending/sent/read/failed 및 별도 TypingIndicator 비교

## 확정된 결정

- 일반 background/foreground/border는 Neutral이다.
- Brand와 danger/warning/success/info는 별도 role이다.
- `primary/secondary`는 role/property 내부 강조 위계다.
- 반전 색상은 초기에는 공통 `oe-foreground-inverse`를 사용한다.
- Bold fill 위의 약한 정보에는 `oe-foreground-inverse-secondary`를 사용한다.
- Hover는 Light black 5%, Dark white 8%의 `oe-interaction-hover` state layer를 합성하는 Provisional 방식으로 검증한다.
- 상태 의미 없이 시선을 끄는 강조에는 `oe-accent-*` role을 사용하며, 첫 토큰은 unread badge용 `oe-accent-background-bold-primary`다. shadcn `accent`와 직접 매핑하지 않는다.
- Primitive에는 `oe` prefix를 붙이지 않는다.
- Alpha primitive는 미리 생성하되 직접 사용을 남발하지 않는다.
- 외부 UI는 화면으로 먼저 구현하고 검수 후 자산을 추출한다.
- 컴포넌트 작업 중 새 색상 패턴이 발견되면 알림과 근거를 남긴 Candidate로 등록하고, 반복 검증 후 token 또는 recipe로 승격한다.

## 아직 Provisional인 결정

- HCT tone에서 `brand-50~950`으로 가는 숫자 매핑
- Light/Dark brand semantic mapping
- 기본 ooee brand seed
- 대표 solid action token 이름
- focus ring을 Brand에 연결하는 브랜드별 조건
- Neutral 및 status palette 생성 방식

## 재현 가능한 글꼴 기준

- 국문 preview는 Pretendard Variable을 사용한다.
- 영문 preview는 Inter Variable을 사용한다.
- 일문 preview는 Noto Sans JP Variable을 사용한다.
- 세 글꼴은 확정된 Foundation 자산으로 `packages/fonts`가 소유한다. Studio는 이를 검수·소비할 뿐 별도의 글꼴 기준을 갖지 않는다.
- 공용 패키지의 의존성과 lockfile에 버전을 고정하며 운영체제의 system font 설치 여부에 의존하지 않는다.
- 브라우저와 운영체제의 rasterization 차이는 남을 수 있지만 font family, glyph metrics와 줄바꿈 기준은 repository에서 재현 가능하게 유지한다.

## 알려진 로컬 환경 차이

- Obra Pro 자료는 실행 필수 의존성이 아니며 repository에 포함하지 않는다. 참고가 필요하면 각 계정과 기기에서 적법한 구매 권한으로 접근해야 한다.
- 로컬 개발 포트와 브라우저 탭 상태는 공유되지 않는다. 기본 포트는 3000이며 필요하면 명령에서 3002처럼 지정한다.

## 다음 작업 후보

1. `docs/foundations/color.md`의 “다음 검토 체크포인트”에 있는 다섯 질문에 답한다.
2. 답변을 기준으로 최소 oe semantic token과 Light/Dark 임시 매핑을 고친다.
3. 여러 seed로 HCT palette 품질을 검수하고 대비 측정과 경고를 추가한다.
4. Inbox에 선택한 brand theme을 연결해 실제 역할을 검증한다.
5. 실제 반복 사용을 확인한 후 oe semantic token을 확정한다.
6. MessageBubble Candidate의 레이아웃과 상태 API를 검수하고 다른 채팅 화면에서 재사용한다.

현재 `/foundations/color`의 OE Semantic catalog와 코드의 mapping은 검토용 Provisional 구현이다. 화면에 표시된 값을 사용자 결정 없이 Stable로 승격하거나 다른 컴포넌트에 일괄 적용하지 않는다.

## 새 작업에서 사용할 시작 요청 예시

```text
이 저장소의 AGENTS.md, README.md, docs/WORKING_CONTEXT.md와 작업 관련 Foundation 문서를 먼저 읽어라. 현재 Provisional 결정을 Stable로 가정하지 말고, 문서화된 ooee 제작 흐름에 따라 작업하라.
```
