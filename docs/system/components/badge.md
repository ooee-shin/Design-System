# Badge Candidate

상태: `Candidate`

`Badge`, `Dot Badge`, `Number Badge`를 검수하는 공용 Candidate다. `/components/badge`에서 Light/Dark, KO/EN과 viewport 조합을 검수한다. 세 컴포넌트의 역할은 각 탭과 아래 확인된 구현 범위에서 따로 관리한다.

실제 구현 원본은 `packages/ui/src/badge.tsx`이며 Studio에는 Badge Workbench와 예시 콘텐츠만 둔다.

## Studio 정보 구조

`/components/badge`는 한 화면에 모든 예시를 섞지 않고 다음 세 컴포넌트를 같은 페이지의 독립 탭으로 구분한다. 컴포넌트 고유명은 영문으로 유지하고 명세 설명은 국문으로 작성한다. 실제 Badge 내부와 활용 사례의 콘텐츠는 Studio header의 KO/EN 언어 설정을 따른다.

- `Badge`
- `Dot Badge`
- `Number Badge`

각 탭은 실제 정보가 존재하는 섹션만 보여준다. Badge 탭은 Overview, Anatomy, 구현된 Properties, Behavior, 실제 사용 사례, 현재 Specification과 확인이 필요한 사항을 구분한다.

## 유형

- `Badge` (`chip`): Label 필수, Leading element와 Trailing element는 각각 선택적으로 표시/숨김
  - Leading element: 현재 Icon, 이후 다른 요소로 확장 가능한 slot
  - Trailing element: 현재 Icon, 이후 다른 요소로 확장 가능한 slot
  - Size: 현재 검수값 XSmall 16px(좌우 6px), Small 20px, Medium 24px. 고정 규격이 아니며 실제 화면을 다듬은 뒤 확정
  - Shape: Pill, Rounded 8px
  - Style: Tonal(밝은 단계), Solid(Tailwind 600 원색과 흰색 텍스트)
  - Color: Tailwind primitive 체계의 22개 기본 palette 전체 지원
    - Slate, Gray, Zinc, Neutral, Stone
    - Red, Orange, Amber, Yellow, Lime
    - Green, Emerald, Teal, Cyan, Sky, Blue
    - Indigo, Violet, Purple, Fuchsia, Pink, Rose
  - Layout 검수 사례
    - Scrollable layout: 한 줄 유지, 넘치는 항목은 가로 스크롤
    - Overflow layout: 사용 가능한 너비에 맞춰 여러 줄로 표시
    - 현재 별도의 Badge Group 컴포넌트 API는 없음
  - 추후 확장 역할: Filter, Suggestion, Input. 현재는 역할명만 기록하며 동작과 정책은 미구현
- `Number Badge` (`number`): 숫자만 허용, icon 없음, 최소 20px에서 콘텐츠에 따라 확장되는 rounded shape, `max` 초과 시 `99+` 형식
- `Dot Badge` (`dot`): 표시 콘텐츠 없음, 10px circle shape, 다른 요소와 결합할 때 outline 선택

## 표현 체계

- Badge appearance: `tonal | solid`
- Dot Badge / Number Badge appearance: `tonal | fill` (별도 탭 검토 전의 현재 구현)
- Dot Badge / Number Badge tone: `neutral | accent | warning | danger | success | info`
- Warning·Danger·Success·Info는 Color Foundation의 공용 semantic token을 직접 사용한다.
- Accent는 상태 의미 없이 강한 주의를 끄는 기존 role이며 현재 fill 사례에 사용한다.

## 사용 규칙

- `number`에는 아이콘이나 임의 텍스트를 넣지 않는다.
- 한 자리 수가 원처럼 보여도 별도 circle shape API를 만들지 않으며 두 자리 이상에서 자연스럽게 가로 확장한다.
- `dot`의 outline은 결합 대상 surface와 분리하기 위한 것이다.
- 시각 콘텐츠만으로 의미를 전달하지 않도록 number와 dot은 접근 가능한 label을 필수로 받는다.
- Badge는 현재 `span`으로 렌더링되며 자체 interaction 또는 state property가 없다. 제거 action이 필요한 선택값은 별도 `Chip` 컴포넌트를 사용한다.

## 현재 실제 적용

- Breadcrumb Page Header: Draft status chip, Comments count
- Collapsible Sidebar Nav: Deployments·Logs count
- Inbox Split View: unread count
- Message Bubble Workbench: unread boundary count

Badge의 Size는 현재 화면 검수값이며 아직 Stable 규격이 아니다. 이후 실제 화면을 다듬으며 확정한다. 새로운 판단이 필요한 내용은 Studio 페이지에 임시 정책으로 표시하지 않고 사용자에게 먼저 질문한 뒤 코드와 문서에 함께 반영한다.
