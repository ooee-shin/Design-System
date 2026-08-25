# Working context

새 작업이나 새로운 협업 환경에서 빠르게 현재 상태를 복구하기 위한 요약이다. 상세한 이유와 전체 철학은 루트 `README.md`, 강제 규칙은 루트 `AGENTS.md`, 색상 결정은 `docs/foundations/color.md`를 확인한다.

마지막 내용 점검: `2026-08-24`

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

- 공용 자산 소유 구조
  - `packages/tokens`: Neutral·Brand·Accent·Status semantic 정의와 Tailwind 연결 스타일
  - `packages/fonts`: 공용 언어별 font
  - `packages/ui`: Button, Input, PartialMaskedInput, Textarea, Checkbox, Badge, Chip, Combobox, MessageBubble, MessageComposer, MessageFileAttachment
  - `packages/patterns`: BreadcrumbPageHeader, CollapsibleSidebarNav, InboxSplitView
  - `apps/studio`: 공용 자산을 소비하는 Workbench, 예시 콘텐츠와 검수 control
  - Candidate/Provisional도 실제 공용 자산이며 Stable은 package 이동이 아닌 검증 완료 상태

- Studio navigation
  - `Home`, `Foundations`, `Components`, `Patterns` 그룹 메뉴만 표시
  - 각 그룹 index에서 현재 접근 가능한 모든 자산과 성숙도를 확인하고 상세 화면으로 이동
  - 내부 제작 단계인 Experiment는 메뉴 그룹이 아니라 각 자산의 maturity badge로 표시
  - 공통 검수 설정인 `PC/TB/MB`, `라이트/다크`, `KO/EN`을 sticky Studio header에서 변경하며 route 이동과 새로고침 후에도 유지
  - viewport 설정은 Studio chrome이 아니라 상세 화면의 검수 콘텐츠만 fluid desktop, 768px tablet, 390px mobile 너비로 변경
  - 모드는 document root와 Studio canvas에 함께 적용해 outer page, navigation, Portal layer가 같은 Light/Dark token을 사용
  - Chat과 Inbox의 중복 모드·언어 control은 제거하고 Studio 공통 설정을 사용
  - 현재 언어 범위는 국문·영문이며 일문은 콘텐츠 검수 범위를 확장할 때 공통 설정에 추가
  - Component 상세 페이지의 기본 순서는 `Overview → Playground → Anatomy → Properties → Examples/Usage → Property map`. Anatomy는 모든 Properties보다 앞에 두고 우측 목차도 본문 순서를 따름
  - 화면 확정 검수에서 주요 Property가 각각 독립 카드/섹션으로 설명되는지 확인. Property map이나 Playground에만 있고 설명 카드가 없으면 자동 생성하지 않고 사용자에게 필요 여부를 질문. native 연결용 기술 속성은 시각 카드 대상에서 제외 가능

- `/experiments/inbox-split-view`
  - VibePrompt의 Inbox split view를 React로 변환한 첫 Experiment
  - 대화 검색, 읽지 않은 메시지 count, 답장, 모바일 전환
  - Light/Dark 및 국문/영문/일어 콘텐츠 검수
  - Neutral OE semantic mapping을 첫 실제 검증 대상으로 Provisional 적용
  - canvas, surface, foreground 위계, border 위계, bold fill, inverse, focus ring을 사용
- `/foundations/color`
  - Tailwind CSS v4의 white/black과 22개 기본 primitive palette 전체 표시
  - 실제 oe Neutral·Brand·Accent·Status semantic token의 Light/Dark mapping 표시
  - brand seed 입력
  - HCT `brand-50~950` 생성
  - 지정된 alpha primitive 생성
  - Light/Dark semantic mapping 후보 비교
- Foundation catalog
  - `/foundations/typography`, `/icon`, `/spacing`, `/radius`, `/effects`, `/motion`에서 현재 보유 자산을 표시
  - 각 항목을 `Token`, `Primitive`, `Current value`, `Asset`으로 구분해 아직 없는 oe token을 만들어 보이지 않음
  - Typography는 공용 언어별 font token과 현재 type scale, Icon은 실제 Remix 사용 자산을 표시
  - 공용 아이콘 크기는 `xsmall 12px`, `small 16px`, `medium 20px`, `large 24px`, `xlarge 32px`의 `oe-icon-*` 토큰으로 정의
  - Spacing·Radius·Effects·Motion은 현재 공용 UI와 패턴 코드에서 확인된 값만 표시
- `/components/message-bubble`
  - Inbox에서 추출한 첫 Candidate 컴포넌트 Workbench
  - incoming/outgoing, avatar, 긴 콘텐츠, 국문/영문/일어, Light/Dark 검수
  - sending/sent/read/failed 및 별도 TypingIndicator 비교
- `/components/badge`
  - chip, number, dot 유형과 tonal/fill 표현을 검수하는 공용 Candidate
  - Badge Size는 현재 검수값 XSmall 16px, Small 20px, Medium 24px를 지원
  - Neutral·Accent·Warning·Danger·Success·Info를 지원하며 Navigation과 Chat의 실제 count 사례에 적용
- `/components/input`
  - shadcn과 Seed Design Text Input을 기준으로 정리한 공용 Candidate
  - Input과 Field의 책임을 분리하며 현재 Input만 구현
  - Outline/Filled, Small/Regular/Large/XLarge, native state와 내부 선택 요소를 검수
  - Small 32px, Regular 36px, Large 40px, XLarge 48px를 Button과 한 줄 Form control이 공유할 Control Height로 확정
  - 반복되는 부분 입력·고정 마스킹 동작은 공용 `PartialMaskedInput`이 소유하고, 일반 4자리 사례와 주민등록번호 뒷자리 사례가 같은 간격·자간·입력 제한을 사용
  - 전화번호·금액·분할 입력·주민등록번호의 예시 상태와 포맷 함수는 Studio 전용 `InputCustomExamples`에 두어 공용 UI 구현과 상세 문서 화면 코드를 분리
- `/components/textarea`
  - Input과 동일한 `outline | filled` Style 및 Focus/Invalid 상태 구조 사용
  - Layout은 `fill`만 지원하고 최소 높이는 88px(약 3.5줄). `autoSize=false`가 기본이며 이때 Resize는 Boolean, 기본값은 `false`
  - `autoSize=true`이면 내용에 따라 높이가 증가하고 Resize는 적용하지 않음
  - `autoSize=false`일 때 초기 높이를 88px 이상으로 설정할 수 있음. 스크롤바 공간은 고정하고 thumb은 Hover에서만 표시해 텍스트 이동을 방지
  - Auto size와 Resize 모두 `viewport − reserved layout space`보다 낮은 Max height가 필요함. 고정 헤더·콘텐츠 패딩 등을 포함할 정확한 차감값은 아직 열려 있어 코드에는 임의 수치를 넣지 않음
  - Container와 Textarea field만으로 구성하며 Prefix/Clear/Suffix/Leading/Trailing element는 지원하지 않음. Character count는 Field에서 기본 제어하는 방향으로 보류했고, Textarea 내부 표시가 필요한 실제 사례가 확인될 때 재검토
  - Input과 분리된 여러 줄 입력 Candidate와 별도 검수 페이지
  - 현재 확인된 native 속성, 최소 높이 64px, content sizing과 기본 상태만 문서화
  - Focus/Error는 Input과 같은 단색 1px border + 외부 1px ring 구조를 사용
  - Input과 Textarea는 데스크톱 `On this page` rail 아래의 낮은 위계 Related 링크에서 서로 이동
  - `/components/field`는 Input의 Related에서 이동할 수 있는 페이지 껍데기만 준비했으며 Field Anatomy, Properties와 실제 컴포넌트는 아직 정의하지 않음
  - 컴포넌트 상세 페이지는 데스크톱 우측의 sticky `On this page`에서 현재 섹션을 확인하고 바로 이동하며 좁은 검수 viewport에서는 숨김
  - 목차는 뎁스별 지그재그 경로 없이 단일 직선 rail을 사용하고, 화면의 활성 구간에 여러 섹션이 걸리면 모두 강조하며 활성 선의 위치와 높이를 300ms로 전환. rail과 항목 배경의 간격은 12px
- `/components/combobox`
  - Base UI 1.7.0의 Input-inside-popup 패턴을 기반으로 한 단일·다중 선택 Candidate
  - `Combobox`는 단일 값 선택 후 닫히고, `MultiCombobox`는 Checkbox로 여러 값을 선택하며 Popup을 유지
  - 닫힌 상태는 Select trigger이며 Popup을 열면 Single·Multiple·2-depth가 공유하는 투명 배경·Border 없음·Small 32px Search recipe로 미리 정의된 Option을 필터링
  - MultiCombobox의 선택 결과는 첫 항목과 `외 N곳`을 표시하는 `summary`, 별도 선택 영역 Container 안에 공용 Small Rounded Chip 전체를 표시하는 `container` 두 타입
  - Container 타입은 Border 없이 Neutral secondary background로 구분하며, Filled Input 기반 선택 Chip 내부 검색, Hover scrollbar와 Remix close trailing action을 통한 개별 삭제를 지원
  - MultiCombobox 목록 맨 위의 `전체 N` 행은 활성 Option 수를 레이블과 4px 간격의 Neutral tertiary foreground로 표시하고 전체 선택·해제를 수행
  - Option list scrollbar는 레이아웃 공간을 유지하고 목록 Hover에서만 thumb을 표시
  - 단일 선택의 선택 Option은 Candidate인 `brand-alpha-08`, Check icon은 `oe-brand-foreground-primary`를 사용하며 선택 배경이 Hover highlight보다 우선. Search input과 선택 행 배경의 가로 범위를 맞추며 다중 선택 Checkbox는 Neutral 스타일 유지
  - Studio는 Single과 Multiple Playground를 위아래로 분리하고 각 control 상태를 독립적으로 유지
  - Properties · Selection에서 왼쪽 1~9호선과 오른쪽 실제 역 Checkbox 목록으로 구성한 서울 지하철 2-depth 다중 선택 예시를 검수 중이며 공용 API는 아직 정의하지 않음
- `/components/chip`
  - Border가 있는 `oe-chip-default` 높이 token 24px, `text-oe-label` token 13px/16px, Rounded 8px의 제거 가능한 Candidate
  - Label + 선택적 Leading icon 또는 접근 가능한 이름을 갖는 Icon-only 유형 지원
  - Close action은 Remix icon, `removeLabel`과 `onRemove`를 필수로 사용
  - MultiCombobox Container 타입의 선택 결과에서 첫 실제 사용
- `/components/checkbox`
  - Combobox 다중 선택에서 확인한 Checkbox 구조를 공용 Candidate로 추출하고 OOEE Brand 선택 표현과 상태 규칙으로 정리
  - Seed Checkbox의 구조를 참고하되 16px 단일 control, 기본 Label Regular, 부모 항목 Label Semibold, Square·Ghost Candidate를 지원. Control은 20px Label 첫 줄에서 수직 중앙 정렬
  - Checked와 Indeterminate는 `oe-brand-background-bold-primary`와 inverse Indicator를 사용
  - Disabled Unchecked는 `oe-background-disabled`와 식별 가능한 Neutral border를 유지하고, Disabled Checked/Indeterminate는 Light·Dark 공통 `neutral-400` 매핑의 `oe-background-disabled-selected`와 흰색 Indicator를 사용
  - State Workbench는 Focus visible까지 포함하며 Error/Invalid는 Unchecked Danger border와 Checked Brand/Danger 우선순위 결정 전까지 미정
  - Checkbox Focus visible은 본체에서 2px 떨어진 2px `oe-focus-ring` 사용
  - 원자적인 Checkbox control과 Label·선택적 Description을 결합하는 CheckboxField를 분리
  - `CheckboxContainer`는 기본 Square CheckboxField를 전체 너비의 Neutral bordered surface로 묶는 공용 선택 Container이며 별도 Shape을 제공하지 않음. `oe-border-secondary`, 최소 높이 64px, radius 12px, 좌우 padding 16px 사용
  - CheckboxField는 독립적으로 표시할 수 있는 `rightDescription`과 `bottomDescription` optional slot을 제공하며 Layout은 개발 API 기준 `inline | block`을 지원
  - Label·Right Description 첫 행은 20px 고정 높이, Right Description은 단일 행 truncate로 처리. Bottom Description은 상단 행 아래에서 Leading element와 같은 왼쪽 시작점을 사용
  - Light/Dark `oe-foreground-tertiary`는 `neutral-500`을 사용
  - `inline | block`은 display를 바꾸지 않고 너비만 fit-content/100%로 변경해 전환 시 위치를 유지
  - CheckboxField는 Regular form 36px 최소 행 높이에 정렬
  - 별도 Size property 없이 Shape `square | ghost`를 지원
  - Ghost Indicator는 15px이며 Default · Unchecked에서도 placeholder foreground로 표시하고 Checked에서 Brand foreground로 강조. Square Indicator는 10px. Indeterminate와 Disabled 상태는 Square에만 제공하고 Ghost에는 제공하지 않음
  - CheckboxContainer Checked 상태는 `brand-alpha-08` 배경과 `brand-alpha-20` border로 옅게 활성화하고 Disabled · Checked에는 적용하지 않음. 두 alpha 사용은 현재 Candidate이며 semantic 승격 전 다른 독립 용례와 함께 검토
  - Checkbox State 문서는 Square와 Ghost를 분리해 표시하며 Ghost에는 Indeterminate와 Disabled가 없음을 명시. CheckboxContainer는 별도 상태 로직이 아니라 기본 Square Checkbox와 CheckboxField를 전체 선택 영역으로 감싼 구성으로 설명하고 동일 상태를 검수
  - CheckboxField와 CheckboxContainer는 `flipped=false | true`를 지원하며 기본 왼쪽 Indicator를 `true`에서 오른쪽으로 배치. Content 내부 정렬과 상태 규칙은 유지
  - CheckboxField Content 앞뒤에 optional `leadingElement`·`trailingElement` Slot을 제공. Anatomy에서는 교체 가능한 영역을 Studio 전용 핑크색 점선과 작은 radius로 표시하며 실제 제품 스타일에는 포함하지 않음
  - Studio Anatomy 공통 규칙: `leadingElement`, `trailingElement`, `swap` 교체 영역은 공용 `AnatomySwapSlot`으로 표시. 기본 1px Pink 점선·4px radius·옅은 Pink 배경이며 실제 제품 스타일에는 포함하지 않음
  - Checkbox 열린 결정: Error/Invalid의 Brand·Danger 우선순위, Hover 전용 표현, Leading/Trailing Slot의 인터랙티브 요소 허용 여부는 아직 정의하지 않음
  - Checkbox Studio 상세 화면은 현재 범위 검수를 완료. Layout·Flipped·Description은 별도 Property 카드를 추가하지 않고 Playground·Anatomy·Property map에서 확인
  - CheckboxContainer와 Combobox가 사용하는 Brand alpha CSS 변수는 현재 Studio `BrandThemeProvider`가 주입함. Studio 밖 소비처를 위해 변수 초기화 책임을 공용 package와 소비 앱 theme bootstrap 중 어디에 둘지 결정 필요
- `/components/radio`
  - 확정한 16px Control과 8px 흰 원형 Indicator를 기준으로 Checkbox와 같은 Field·Container·Content 구조를 적용한 Candidate
  - Checked는 Brand로 채운 원형 Control 안에 흰색 Indicator를 두며 Unchecked, Checked, Focus visible, Disabled · Unchecked/Checked 상태를 지원
  - Label·Right/Bottom Description·Leading/Trailing·Inline/Block·Flipped·RadioContainer를 지원하며 Parent item, Indeterminate와 Ghost는 제공하지 않음
- `/experiments/breadcrumb-page-header`
  - VibePrompt의 breadcrumb page header를 기반으로 한 Navigation Experiment
  - 축약 breadcrumb, record metadata/action, section tab과 responsive wrap 검수
  - 실제 패턴 원본은 `@ooee/patterns`가 소유하고 Studio는 locale과 검수 context만 전달
  - 일반 surface는 oe Neutral semantic token을 사용하고 Draft는 공용 Badge의 warning tonal 조합을 사용
- `/experiments/collapsible-sidebar-nav`
  - VibePrompt의 collapsible sidebar navigation을 기반으로 한 Navigation Experiment
  - 260px/72px rail, group disclosure, active row, count badge, search와 user chip 검수
  - navigation 패턴을 먼저 축적한 뒤 active state, row, badge와 trigger의 반복 규칙을 비교해 Candidate를 추출
  - 실제 패턴 원본은 `@ooee/patterns`가 소유하며 내부 navigation row는 비교 사례가 더 쌓일 때까지 패턴 내부에 유지

## 확정된 결정

- 일반 background/foreground/border는 Neutral이다.
- 직접 조작하는 form control 보더는 `oe-border-primary`, 여러 폼 요소나 Label을 감싸는 form container 보더는 `oe-border-secondary`를 사용한다.
- Neutral·Accent·Warning·Danger·Success·Info의 실행 가능한 단일 원본은 `packages/tokens/src/index.ts`이며 Color 표와 전역 스타일은 이를 함께 사용한다.
- Status role 명칭은 `warning`, `danger`, `success`, `info`로 통일한다.
- 공용 아이콘 Foundation은 Primary로 Remix Icon, Secondary로 Google Material Symbols를 사용한다. React 구현은 `@remixicon/react`를 우선하며 기본 UI 아이콘은 Line variant를 우선한다.
- Brand와 danger/warning/success/info는 별도 role이다.
- `primary/secondary`는 role/property 내부 강조 위계다.
- 반전 색상은 초기에는 공통 `oe-foreground-inverse`를 사용한다.
- Bold fill 위의 약한 정보에는 `oe-foreground-inverse-secondary`를 사용한다.
- Hover는 Light black 5%, Dark white 8%의 `oe-interaction-hover` state layer를 합성하는 Provisional 방식으로 검증한다.
- 상태 의미 없이 시선을 끄는 강조에는 `oe-accent-*` role을 사용하며, 첫 토큰은 unread badge용 `oe-accent-background-bold-primary`다. shadcn `accent`와 직접 매핑하지 않는다.
- Primitive에는 `oe` prefix를 붙이지 않는다.
- Alpha primitive는 미리 생성하되 직접 사용을 남발하지 않는다.
- `oe-focus-ring`은 적용된 brand seed에서 생성하며 Light는 `brand-600`, Dark는 `brand-400`을 사용한다.
- 한 줄 Form control의 placeholder는 실제 입력값과 구분되는 `oe-foreground-placeholder`를 사용하며 현재 Light `neutral-400`, Dark `neutral-500`으로 매핑한다.
- 외부 UI는 화면으로 먼저 구현하고 검수 후 자산을 추출한다.
- 컴포넌트 작업 중 새 색상 패턴이 발견되면 알림과 근거를 남긴 Candidate로 등록하고, 반복 검증 후 token 또는 recipe로 승격한다.

## 아직 Provisional인 결정

- HCT tone에서 `brand-50~950`으로 가는 숫자 매핑
- Light/Dark brand semantic mapping
- 기본 ooee brand seed
- 대표 solid action token 이름
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
