# Working context

새 작업이나 새로운 협업 환경에서 빠르게 현재 상태를 복구하기 위한 요약이다. 상세한 이유와 전체 철학은 루트 `README.md`, 강제 규칙은 루트 `AGENTS.md`, 색상 결정은 `docs/foundations/color.md`를 확인한다.

## 현재 기술 환경

- pnpm workspace
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
  - oe mapping은 아직 시작하지 않음
- `/foundations/color`
  - brand seed 입력
  - HCT `brand-50~950` 생성
  - 지정된 alpha primitive 생성
  - Light/Dark semantic mapping 후보 비교

## 확정된 결정

- 일반 background/foreground/border는 Neutral이다.
- Brand와 danger/warning/success/info는 별도 role이다.
- `primary/secondary`는 role/property 내부 강조 위계다.
- 반전 색상은 초기에는 공통 `oe-foreground-inverse`를 사용한다.
- Primitive에는 `oe` prefix를 붙이지 않는다.
- Alpha primitive는 미리 생성하되 직접 사용을 남발하지 않는다.
- 외부 UI는 화면으로 먼저 구현하고 검수 후 자산을 추출한다.

## 아직 Provisional인 결정

- HCT tone에서 `brand-50~950`으로 가는 숫자 매핑
- Light/Dark brand semantic mapping
- 기본 ooee brand seed
- 대표 solid action token 이름
- focus ring을 Brand에 연결하는 브랜드별 조건
- Neutral 및 status palette 생성 방식

## 다음 작업 후보

1. 여러 seed로 HCT palette 품질을 검수한다.
2. Color Lab에 대비 측정과 경고를 추가한다.
3. Inbox에 선택한 brand theme을 연결한다.
4. 실제 반복 사용을 확인한 후 oe semantic token을 확정한다.
5. Candidate 컴포넌트를 Storybook으로 추출한다.

## 새 작업에서 사용할 시작 요청 예시

```text
이 저장소의 AGENTS.md, README.md, docs/WORKING_CONTEXT.md와 작업 관련 Foundation 문서를 먼저 읽어라. 현재 Provisional 결정을 Stable로 가정하지 말고, 문서화된 ooee 제작 흐름에 따라 작업하라.
```
