# Breadcrumb Page Header Experiment

상태: `Experiment`

출처: [VibePrompt — Breadcrumb page header](https://vibeprompts.dev/nav/nav-breadcrumb-page-header/)
확인일: `2026-08-24`

레코드의 위치, 제목과 상태, metadata, 주요 action, section tab을 하나의 application page header에서 검수하기 위한 외부 화면 실험이다. 외부 Tailwind 마크업을 Stable 자산으로 취급하지 않으며 `/experiments/breadcrumb-page-header`에서 상호작용과 반응형을 먼저 검수한다.

사용자가 채택한 실제 패턴 원본은 `packages/patterns/src/breadcrumb-page-header.tsx`가 소유하며 Studio route는 공용 패턴을 불러와 검수한다.

## 현재 구현

- 4단계 breadcrumb와 축약된 중간 단계 Popover
- 제목, Draft status pill, owner·생성일·identifier metadata
- Duplicate, Share, Publish와 추가 action Popover
- 활성 상태 및 count badge를 포함한 5개 section tab
- 좁은 화면에서 action wrap 및 tab horizontal scroll
- Remix Icon Primary 공급원과 oe Neutral semantic token 적용
- Studio header의 공통 `라이트/다크`, `KO/EN` 설정을 사용하며 제목, metadata, action과 tab 콘텐츠가 locale에 맞게 변경

## Badge 적용

- `Draft`는 공용 Badge Candidate의 `chip + tonal + warning` 조합을 사용한다.
- Comments count는 `number + tonal + neutral` 조합을 사용한다.
- 두 사례 모두 Color Foundation의 공용 semantic token 정의를 실제로 소비한다.

## 다음 검수

- 실제 제품 문구와 locale별 길이
- 모바일에서 action 우선순위 및 overflow 방식
- breadcrumb가 더 길어질 때 축약 기준
- destructive action을 포함한 menu 구조
- status pill의 warning token 승격 여부
- 두 번째 화면 재사용 후 Candidate 추출 여부
