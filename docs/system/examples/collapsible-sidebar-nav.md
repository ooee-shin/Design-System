# Collapsible Sidebar Nav

상태: `화면 예시` — 시스템이 확정한 Pattern이 아니다

출처: [VibePrompt — Collapsible sidebar nav](https://vibeprompts.dev/nav/nav-collapsible-sidebar-nav/)
확인일: `2026-08-24`

그룹 메뉴, active navigation, 검색, 사용자 계정 영역과 축소 rail을 담은 application sidebar 화면이다. 외부 화면을 공용 부품으로 다시 만든 예시이며 확정된 자산으로 취급하지 않는다. `/examples/collapsible-sidebar-nav`에서 상호작용과 반응형을 검수한다.

구현 원본은 `packages/patterns/src/collapsible-sidebar-nav.tsx`가 소유하며 Studio는 이를 불러와 표시한다.

## 현재 구현

- 260px expanded sidebar와 72px icon-only rail 전환
- 축소 상태를 localStorage에 저장하여 새로고침 뒤에도 유지
- 독립적으로 열고 닫을 수 있는 Workspace·Insights 그룹
- 선택 가능한 navigation row와 count/status badge
- 검색 입력, brand 영역과 하단 user chip
- 축소 상태에서도 각 icon button의 접근 가능한 이름 유지
- Studio 공통 Light/Dark와 KO/EN 설정 사용
- Remix Icon과 oe Neutral·Danger semantic token 사용

## 패턴 비교에서 확인할 항목

- Page Header의 section tab과 Sidebar row가 공유할 수 있는 `active navigation` 규칙의 범위
- 상단 Studio navigation, breadcrumb, tab, sidebar에서 focus·hover 표현이 일관적인지
- Sidebar 전용 left accent가 다른 navigation 패턴에도 반복되는지
- 공용 Badge를 적용한 number/count가 다른 sidebar 밀도에서도 유지되는지
- 축소 rail에서 tooltip이 공통 요구사항으로 반복되는지
- group disclosure와 일반 popover/menu trigger가 아이콘 크기와 hit area를 공유할 수 있는지

## 현재 일관성 후보

- Active 표시는 Page Header tab의 bottom border와 Sidebar row의 left border로 방향이 다르다. 정보 구조에 따른 합리적인 차이일 수 있으므로 하나의 시각 규칙으로 즉시 통합하지 않는다.
- Page Header는 action button에 공용 `Button`을 사용하지만 Sidebar navigation row와 group header는 아직 패턴 내부 button이다. 다른 sidebar 패턴을 추가해 높이, padding, icon slot과 badge slot이 반복된 후 추출한다.
- Deployments와 Logs count는 공용 Badge의 number 유형을 사용하며 Logs는 기존 Danger semantic token을 적용한다.

## 다음 검수

- 좁은 viewport에서 sidebar를 overlay 또는 off-canvas로 바꾸는 기준
- 검색이 실제 navigation filtering으로 동작해야 하는지
- 축소 상태에서 tooltip을 항상 제공할지
- keyboard arrow navigation과 group disclosure 동작
- 두 번째 sidebar 패턴과 비교 후 공용 자산 추출 여부
