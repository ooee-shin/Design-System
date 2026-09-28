# Working context

새 작업이나 새로운 협업 환경에서 빠르게 현재 상태를 복구하기 위한 요약이다. 시스템 정의는 `docs/system/`, 제작 절차와 근거는 `docs/process/`, 작업 운영 규칙은 루트 `AGENTS.md`를 확인한다.

이 파일은 현재 구현과 다음 작업처럼 변하는 정보만 관리한다. 설치 방법과 고정 규칙은 README/AGENTS에 두고 중복하지 않는다. 다른 기기에서 보이는 실제 상태는 마지막으로 push된 commit까지이므로, 아래 내용과 코드가 함께 commit되어 있는지 `git status -sb`와 `git log -1`로 확인한다.

Git·환경은 루트 `README.md` 「브랜치」·「현재 환경」, 규칙은 `AGENTS.md`, 정본 관계(`ooee-shin/ooee-ui` 이관)는 `README.md` 머리말과 [ai-environment.md](ai-environment.md) 「아직 정하지 않은 것」이 갖는다.

## 현재 구현

- 공용 자산 소유 구조
  - `packages/tokens`: Neutral·Brand·Accent·Status semantic 정의와 Tailwind 연결 스타일. `styles.css`가 `:root`·`.dark`에 실제 `--oe-*` 값과 `@custom-variant dark`를 함께 소유하므로 `@import "@ooee/tokens/styles.css"` 한 줄로 색이 나온다. 값의 단일 원본은 `index.ts`의 `CORE_SEMANTIC_TOKENS`이며 `index.test.ts`가 CSS와의 불일치를 검사한다. Brand만 예외다. `--brand-*`·`--brand-alpha-*`와 mode별 `--oe-brand-light-*`·`--oe-brand-dark-*`는 Studio의 `BrandThemeProvider`가 mount마다 `packages/tokens`의 생성 함수로 seed에서 만들어 런타임으로 주입하고, `--oe-brand-*`와 `--oe-focus-ring`은 `apps/studio/src/app/globals.css`가 그 mode별 주입값에 `--color-blue-*` 기본값을 붙여 정의한다. `packages/tokens`는 `DEFAULT_BRAND_SEED`와 생성 함수, `styles.css`의 `@theme inline`이 `--oe-brand-*`·`--oe-focus-ring`을 Tailwind 색으로 잇는 별칭만 갖고 `:root`·`.dark`의 실제 값은 갖지 않는다
  - `packages/fonts`: 공용 언어별 font
  - `packages/ui`: AppHeader, BottomNavigation, Badge, NotificationBadge, Button, ToggleButton, Field, Input, InputButton, NumberInput, PartialMaskedInput, Textarea, Checkbox, Radio, Switch, Chip, Select, SelectBox, Combobox, Calendar, MessageBubble, MessageComposer, MessageFileAttachment
  - 컴포넌트는 `확정`과 `초안` 두 상태를 가지며 단일 원본은 `component-registry`다. 현재 확정 20개, 초안 6개(AdminHeader, MessageComposer, MessageFileAttachment, PageHeader, SideNavigation, Tabs)이고 Studio의 Components 목록이 두 묶음으로 나누어 표시한다. 상태의 정의는 `docs/system/README.md`의 「Component」가 소유하며, `PartialMaskedInput`은 Input이 소유하므로 목록에 세지 않는다
  - 제품 화면 작업장(블루키 리뉴얼): `2026-09-22` 에 Studio 의 `/screens` 에서 sandbox 의 `/renewal` 로 옮겼다(`apps/sandbox/src/app/(renewal)/renewal/`). 관리자·STO·SV 세 루트를 두고 각 루트는 만들 화면의 목록으로 열린다. 규칙은 `apps/sandbox/src/components/renewal/README.md` 가 갖는다. sandbox 첫 화면의 「블루키 리뉴얼」 탭에서 연다
  - `apps/studio`: 공용 자산을 소비하는 Workbench, 예시 콘텐츠와 검수 control. `Docs` 메뉴에서 `docs/system` 문서를 읽고, 컴포넌트 상세 페이지 하단에 해당 명세 문서를 함께 표시한다. 문서 원본은 저장소가 소유하고 Studio는 표시만 한다
  - `apps/studio`의 `/llms.txt`: 저장소 루트 `llms.txt` 원본을 그대로 낸다. 빌드 끝에 `scripts/docs/mirror-llms-links.mjs`가 그 링크와 실은 문서의 링크를 따라 닿는 시스템 문서(`docs/system/` 아래와 `packages/ui/src/index.ts`, 허용 목록은 `scripts/docs/llms-links.mjs`의 `PUBLISHABLE`)만 `out/`의 같은 경로에 싣는다. 실리는 파일은 git이 추적하는 보통 파일이어야 한다. `out/llms.txt`는 웹판으로 바꾼다 — `localhost:3000`을 배포 주소로, 허용 목록 밖을 가리키는 링크는 「저장소 안에서만」 글자로 풀고 머리에 범위를 한 줄 적는다. 두 사이트 모두 공개로 두기로 했다(`2026-09-22`, [ai-environment.md](ai-environment.md) 「아직 정하지 않은 것」). 뷰어는 `/llms-txt`이고 상단 메뉴도 그 주소를 가리킨다
  - 검증이 끝나지 않은 자산도 실제 공용 자산이며, 확정은 package 이동이 아니라 검증 완료 상태를 뜻한다
  - 외부 자료를 받아 두고 작업하다가 컴포넌트나 패턴으로 올려보내는 자리는 `2026-09-14`에 Examples 에서 `/screens` 로 옮겼다. Examples 와 `packages/patterns` 는 함께 걷어냈고, 그 안에 확정된 Pattern 은 하나도 없었다. 화면 작업에서 패턴이 나오면 그때 패키지를 다시 만든다
  - Studio 공용 부품은 단일 원본을 사용한다. Anatomy 마커·연결선·경계선·범례·회색 Surface는 `component-anatomy`, Guidelines 비교 카드와 불릿 목록은 `component-guidelines`, Playground 선택 버튼과 종속 control 표시는 `playground-element-control`이 소유하며 워크벤치에서 다시 만들지 않는다. `GuidelineList`는 `className`을 받고 기본값은 `mt-3`이다
  - Combobox Anatomy의 범위 표시선 3개만 예외로 로컬에 남아 있다. 그중 하나가 Popup 콘텐츠 높이에 맞춰 늘어나야 해서 마커 기준 고정 길이만 표현하는 `AnatomyBoundaryMarker`로 옮길 수 없다
  - `packages/ui`는 자체 `tsconfig.json`과 `typecheck` script를 소유하고 테스트 의존성도 직접 선언. 회귀 검사는 컴포넌트별 `<component>.test.tsx`, 교차 계약용 `selection-controls.test.tsx`와 공용 `test-setup.ts`로 구성하며 `pnpm check`가 lint → typecheck → test → build 순으로 실행

- Studio navigation
  - 메뉴 순서는 `Home → Foundations → Components → Docs → Presentation`. 기반에서 컴포넌트로 올라간 뒤 문서를 보고 마지막에 작업 의도를 본다. 제품 화면 작업장은 `2026-09-22` 에 sandbox 로 옮겨 Studio 메뉴에 없다
  - Home은 카드를 두 묶음으로 나눈다. 「시스템 자산」에 Foundations·Components·Patterns, 「참고와 전달」에 Docs·Presentation. 화면이 없는 `Patterns`는 링크가 아닌 카드로 두고 `준비 중`을 표시한다
  - 모든 화면이 `max-w-6xl` 프레임과 `px-4 py-5 sm:px-8 sm:py-8` 여백을 공유한다. 목록의 `compact` 밀도는 카드 그리드에만 적용하고 페이지 여백과 헤더 간격은 바꾸지 않는다. 밀도가 페이지 틀을 건드리면 화면을 옮길 때 본문이 위아래로 밀린다
  - 우측 `On this page` 목차는 공용 `OnThisPage` 하나를 컴포넌트 상세와 Presentation이 함께 사용한다. 최대 높이를 뷰포트 안으로 제한하고 넘치면 목차 안에서 스크롤한다
  - Foundations Color 화면의 탭은 주소 해시와 연결된다. `#primitive`·`#semantic`·`#brand`로 특정 탭을 바로 가리킬 수 있고 탭을 누르면 주소도 따라 바뀐다
  - 12px 글자 옆의 인라인 아이콘은 `oe-icon-xsmall`을 사용한다. `size-3.5`는 아이콘 Foundation의 크기 체계에 없는 값이라 쓰지 않는다. 내비게이션의 라이트·다크 토글만 예외로 남아 있다
  - 각 그룹 index에서 현재 접근 가능한 모든 자산을 확인하고 상세 화면으로 이동
  - Components index와 Docs 목록은 한 화면에서 더 많은 자산을 비교할 수 있도록 Compact catalog 밀도를 사용. 모바일 1열, 태블릿 2열, 데스크톱 최대 4열과 2줄 설명을 적용하며 Foundations index는 기본 밀도를 유지
  - 컴포넌트에는 등급 badge를 달지 않는다. 아직 확정되지 않은 Foundation 결정만 `Provisional` 표시를 단다
  - 공통 검수 설정인 `PC/TB/MB`, `라이트/다크`, `KO/EN`을 sticky Studio header에서 변경하며 route 이동과 새로고침 후에도 유지
  - viewport 설정은 Studio chrome이 아니라 상세 화면의 검수 콘텐츠만 fluid desktop, 768px tablet, 390px mobile 너비로 변경
  - 모드는 document root와 Studio canvas에 함께 적용해 outer page, navigation, Portal layer가 같은 Light/Dark token을 사용
  - Chat과 Inbox의 중복 모드·언어 control은 제거하고 Studio 공통 설정을 사용
  - 현재 언어 범위는 국문·영문이며 일문은 콘텐츠 검수 범위를 확장할 때 공통 설정에 추가
  - Studio 문서 설명은 국문을 유지하고 KO/EN 전환은 실제 Component Preview의 Label·Value·Placeholder·접근 가능한 이름과 `lang`에 적용. 전체 영문 문서는 국문 문서 완료 뒤 별도 검토
  - Component catalog 메타데이터와 Similar/Works with 관계는 `component-registry`가 단일 원본이며 15개 상세 route는 공용 `ComponentDetailPage` shell을 사용
  - Component 상세 페이지의 기본 순서는 `Overview → Playground → Anatomy → Properties → Examples/Usage → Property map`. Anatomy는 모든 Properties보다 앞에 두고 우측 목차도 본문 순서를 따름
  - 화면 확정 검수에서 주요 Property가 각각 독립 카드/섹션으로 설명되는지 확인. Property map이나 Playground에만 있고 설명 카드가 없으면 자동 생성하지 않고 사용자에게 필요 여부를 질문. native 연결용 기술 속성은 시각 카드 대상에서 제외 가능
  - Guidelines 하위 주제 제목은 공용 `GuidelineTitle`을 사용. Remix `RiBookOpenLine` 16px Tertiary 아이콘과 14px Semibold 제목을 8px 간격으로 배치하며 컴포넌트별로 중복 구현하지 않음
  - Guidelines의 Target area 예시는 공용 `TargetArea` Studio 측정 표시를 사용. 실제 Control은 유지하고 최소 조작 높이 또는 Row 높이 옆에 1px 직선·양끝 캡과 숫자 Label만 표시하며 점선 외곽이나 색면은 사용하지 않음. 제품 컴포넌트 스타일에는 포함하지 않음
  - Studio의 Violet 측정 Annotation은 width·height·min/max·Target area, padding·gap·inset, radius와 font-size·line-height·letter-spacing 등 수치 치수에 공통 사용. 숫자 Pill은 border 없이 Violet tonal 배경과 글자로 표시하며 semantic color·state·Anatomy·Swap에는 사용하지 않음
  - 상세 페이지의 연관 컴포넌트 영역은 별도 `Related` 제목 없이 비교·대안 관계인 `Similar`과 실제 조합·포함 관계인 `Works with`를 바로 표시하며, 항목이 없는 그룹은 표시하지 않음. Form control의 `Works with`에는 공통 조합 요소인 Field를 첫 항목으로 표시하고, 전체 Form 목록이 아니라 코드와 사용 사례로 확인된 관계만 연결

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
  - Inbox에서 추출한 첫 공용 컴포넌트 Workbench
  - incoming/outgoing, avatar, 긴 콘텐츠, 국문/영문/일어, Light/Dark 검수
  - sending/sent/read/failed 및 별도 TypingIndicator 비교
- `/components/badge`
  - 새로 만드는 중이며 현재는 Playground, Anatomy, Color가 있다
  - 높이는 Small 20px·Medium 24px 두 단계이고 Tone 일곱과 Style 셋을 조합해 확인하며, Custom Tone에서만 18색 선택이 나타난다
  - 아이콘은 Label 앞에만 붙는다
  - Color는 왼쪽부터 Fill·Tonal·Outlined 세 열이며, 위쪽에 Tone 여섯, 아래쪽에 Custom 18색을 두고 행 이름은 왼쪽에만 붙인다
- `/components/field`
  - Label과 필수 표시, 도움말과 오류 문구를 Form control 하나와 묶는 폼 한 칸. Seed Design Field의 Header·Input slot·Footer 세 층 구조를 참고했고 정한 것은 [field.md](../system/components/field.md)가 소유함
  - Header 순서는 `Requirement → Label → Right description → Trailing element`이며 Trailing element만 오른쪽 끝으로 밀림. Seed가 `Suffix Slot`이라 부르는 자리이지만 `prefix`·`suffix`는 짧은 표기 자리라는 기존 구분 때문에 `trailingElement`로 이름을 바꿔 들임
  - 필수는 `*`로만 표시하고, 텍스트는 선택사항을 강조할 때와 다중 선택의 개수를 알릴 때만 `rightDescription`에 씀. `관심 지역 선택 (최대 3개)`처럼 Label 안에 괄호로 넣지 않고 `label`과 `rightDescription`으로 쪼갬. Seed의 필수 비율 규칙은 들이지 않음
  - Footer는 항목당 한 줄이며 왼쪽에 도움말과 오류, 오른쪽에 Character count. 오류가 있으면 도움말을 대체하고 Control에 `aria-invalid`를 주입함. Invalid는 별도 Property가 아님
  - Error에서는 Label도 `oe-danger-foreground-secondary`로 바뀜. 오류가 어느 항목에서 났는지 Label에서 바로 읽히게 하기 위함
  - Disabled에서는 Header와 Footer의 글자가 모두 `oe-foreground-disabled`로 바뀜. 필수 표시도 함께 흐려지며, Label 색은 Disabled가 Error보다 앞섬
  - Header 간격은 필수 마크와 Label 사이 2px, Label과 Right description 사이 8px. 마크는 Label의 일부처럼 붙어 읽히고 Right description은 다른 위계라 떼어 놓음
  - Field 결합은 대체로 모바일 폼이므로 한 줄 Control은 Large 40px 이상을 씀. Studio 예시의 Input·Select·Input Button을 Regular 36px에서 Large로 올렸으며, 크기는 Field가 아니라 각 Control의 `controlSize`가 소유해 Field가 강제하지 않음. Radio·Checkbox·Chip은 각자 자기 최소 높이를 소유하므로 대상이 아님
  - Input slot에 들어가는 Control은 Input, Textarea, Select, Radio Group, Checkbox Group, Chip Group과 Date·Time을 여는 Input Button. Studio Properties 절은 이 순서로 한 줄에 하나씩 두고 Field를 가운데 정렬하며, 예시 내용은 `Label`·`Placeholder`·`Helper text`처럼 요소 이름을 씀. Playground는 국문·영문 전환 검수 대상이라 실제 문구를 유지함
  - Chip Group은 공용 컴포넌트를 만들지 않고 Studio 예제에서 해결함. Chip을 Selection으로 쓰는 조합이며 [chip.md](../system/components/chip.md)의 Guidelines가 이미 그 쓰임을 소유함. Field의 Input slot이 세로 방향이라 가로 묶음이 필요한데, 조합을 지원하려고 컴포넌트를 늘리지 않고 예제가 `role="group"`을 가진 가로 묶음을 직접 만듦
  - Input slot은 세 갈래. Control 하나면 `id`를 주입하고 Label이 `htmlFor`로 가리킴. `group`이고 자식이 하나면 Select Box Group처럼 자체 group을 가진 경우이므로 `aria-labelledby`만 주입함. `group`이고 자식이 여러 개면 Field가 `role="group"`을 직접 소유함
  - Control을 `div`나 별도 컴포넌트로 감싸면 주입 대상을 잃어 연결이 끊기므로 개발 환경에서 경고를 띄움. `id`가 아무 곳에도 닿지 않은 경우와 닿았지만 Control이 아닌 경우를 나누어 알리며, 후자는 `LABELABLE_SELECTOR`로 판단함
  - Fragment는 `isValidElement`를 통과하므로 그것만으로 Control 하나와 행 여러 개를 가를 수 없음. `children.type !== React.Fragment`를 함께 봄
  - Field가 group을 소유할 때는 행들을 `data-slot="field-group"` 묶음으로 감쌈. Field의 세로 간격이 행 사이로 새면 Checkbox Group이 40px, Radio Group이 36px로 갈리고, `role="group"`이 Header와 Footer까지 품으면 그룹 범위가 실제 선택 항목보다 넓어짐
  - Group의 행 사이 간격은 36px 유지. 별도 여백이 아니라 각 행의 최소 조작 높이가 수직 리듬을 만들기 때문이며 `checkbox.md`와 `radio.md`가 그 규칙을 소유함
  - `characterCount`는 `{ current, max }`를 소비자가 넘김. Field가 값을 소유하지 않아 글자 수를 셀 수 없으며, Control의 이벤트를 가로채는 방식은 개발자 검토 항목으로 남김
  - `Select`·`MultiSelect`·`Combobox`·`MultiCombobox`·`SelectBoxGroup` 다섯 개에 `id`와 `aria-describedby`를 추가하고 `ariaLabel`을 필수에서 선택으로 내림. Field가 이름을 소유하면 같은 문구를 두 번 적게 되기 때문. prop을 넓히고 필수를 푸는 변경이라 소비자 코드가 깨지지 않음
  - `vocabulary.md`의 `Field` 정의를 폼 한 칸으로 바꾸고, `CheckboxField`·`RadioField`·`SwitchField`는 `Selection row`라는 별도 층으로 분리함. 한 단어가 두 층을 가리키던 상태를 해소한 것
  - Studio 상세는 Playground·Anatomy·Properties(Header·Footer·Input slot)·Guidelines·Property map. Header와 Footer 절은 그 층만 보이게 나머지 직접 자식을 감춤
  - Playground와 Input slot 절의 콘텐츠는 `studio.md`의 「Anatomy와 구조 검수용 Playground는 요소 명칭을 쓴다」에 따라 `Label`·`Placeholder`·`Helper text`·`Option 1~3`을 씀. 제품 맥락의 실제 문구는 Examples와 Usage가 담당하는데 Field에는 아직 그 절이 없어서, 국문·영문 전환 검수는 Examples를 만들 때 함께 다룸
  - Properties · Header와 Footer 절은 오류 문구의 행동 지시형 같은 작성 규칙을 함께 보여야 해서 실제 문구를 유지함
  - 아직 정하지 않은 것은 Label weight 두 단계, Footer 자리 예약, Label 가로 배치, `Fieldset`과 `Form` 층임

- `/components/input`
  - shadcn과 Seed Design Text Input을 기준으로 정리한 공용 컴포넌트
  - Input과 Field의 책임을 분리하며 현재 Input만 구현
  - Outline/Filled, Small/Regular/Large/XLarge, native state와 내부 선택 요소를 검수
  - Small 32px, Regular 36px, Large 40px, XLarge 48px를 Button과 한 줄 Form control이 공유할 Control Height로 확정
  - Input과 Number Input은 `textAlign=left | right`를 지원하며 기본값은 Left. 입력값과 Placeholder에 적용하고 Number Input의 Split controls에서는 기존 Center 정렬이 우선
  - 계산 가능한 숫자값은 Controls 표시 여부와 관계없이 Number Input을 사용하고 항상 `tabular-nums`를 적용. Input에는 별도 `numeric` Boolean을 만들지 않으며 전화번호·사업자번호·카드번호 같은 식별자는 native `inputMode="numeric"`와 필요한 포맷을 사용
  - 반복되는 부분 입력·고정 마스킹 동작은 공용 `PartialMaskedInput`이 소유하고, 일반 4자리 사례와 주민등록번호 뒷자리 사례가 같은 간격·자간·입력 제한을 사용. 입력된 자리만 숫자 또는 입력 마스킹으로 치환하고, 입력 가능한 미입력 자리는 Placeholder 위계, 입력할 수 없는 고정 마스킹 자리는 Secondary 위계의 닷으로 구분. `maskInput`으로 실제 입력 숫자의 표시 여부를 구분하며 현재 일반 예시는 앞 2자리, 주민등록번호 예시는 뒷자리의 첫 1자리를 숫자로 표시. Custom input 검수 예시는 빈 값을 기본 상태로 사용
  - 전화번호·금액·분할 입력·주민등록번호의 예시 상태와 포맷 함수는 Studio 전용 `InputCustomExamples`에 두어 공용 UI 구현과 상세 문서 화면 코드를 분리
  - Input 상세 화면에서 `Color input`을 `Custom input`과 같은 바깥 섹션 위계로 분리. HEX 직접 입력과 16px Leading color swatch를 조합하며, 현재 Color Picker가 완성되지 않아 swatch는 비상호작용 표시 요소이고 팝업은 연결하지 않음
  - 현재 Studio 상세 화면 검수 범위는 사용자 확인 완료. 다른 화면 재사용 전까지 API가 바뀔 수 있음
- `/components/input-button`
  - Input과 같은 Style, Control Size와 Layout을 사용하지만 실제 HTML은 Button인 별도 공용 컴포넌트
  - 직접 입력 대신 별도 선택 화면을 여는 Trigger이며 현재 Calendar, Address, Time, Color picker · Select only 사례를 검수
  - Value는 문자열만 지원하고 Clear button과 Chip value는 제공하지 않음
  - 후속 Picker, Dialog, 검색 화면과 선택 로직은 Input Button이 소유하지 않음
  - 현재 Studio 상세 화면 검수 범위는 사용자 확인 완료. 실제 Picker 결합 재검증 전까지 API가 바뀔 수 있음
- `/components/switch`
  - 독립적인 설정이나 기능을 즉시 On/Off하는 공용 컴포넌트. 원자적인 Switch와 Label만 조합하는 SwitchField를 제공하며 Description·Leading/Trailing element는 지원하지 않음
  - Small 26×16px, Medium 38×24px, Large 52×32px의 Switch Control과 크기별 Thumb을 지원하며 24px Medium이 기본값. 16/24/32px는 Track만이 아닌 Control 전체 높이이고 16px Control은 최소 24px target을 확보함. 별도 Block Layout 없이 Label 위치 `right | left`만 지원하고 SwitchContainer는 제공하지 않음
  - Switch Control과 Label, 결합된 List의 전체 Row를 target으로 사용. 즉시 반영되는 독립 기능에만 사용하며 저장·제출 또는 부모–자식 선택 관계에는 Checkbox를 사용
  - Disabled에서는 Control만 흐리게 만들지 않고 Label도 `foreground-disabled`로 함께 표현해 항목 전체가 조작 불가능함을 명확히 표시
  - On은 Brand와 분리된 기본 Blue 역할의 `info-background-bold-primary`를 사용. Enabled Off는 Light `neutral-400`/Dark `neutral-500`의 `background-control-off`를 Track과 inset Border에 함께 사용. Disabled Off/On은 이전 Off 단계인 Light `neutral-300`/Dark `neutral-600`의 `background-control-disabled` Track과 `background-disabled-selected` Thumb을 사용하며 Border 없이 Thumb 위치만 달라짐
  - Studio의 `Properties · State`는 비교 대상 On/Off 값을 controlled 상태로 유지하되 Hover·Pressed·Focus와 키보드 피드백은 실제로 확인. Disabled만 실제 비활성 동작을 유지하고 Playground와 다른 예시는 실제 전환 가능
  - Switch Guidelines의 시각 예시는 Neutral secondary 검수 배경 안에 실제 화면을 뜻하는 `background-primary` surface를 한 단계 두고, Surface 외곽에는 옅은 `border-secondary` 1px을 표시한 뒤 Switch를 배치
  - SwitchField는 표시 Label을 `aria-labelledby`로 직접 연결하며 Pointer·Label 클릭, Space 전환, Disabled 값 유지와 Size를 DOM 회귀 테스트로 검증
- `/components/textarea`
  - Input과 동일한 `outline | filled` Style 및 Focus/Invalid 상태 구조 사용
  - Layout은 `fill`만 지원하고 최소 높이는 80px(내용이 넘칠 때 3.5줄이 보이는 값). `autoSize=false`가 기본이며 이때 Resize는 Boolean, 기본값은 `true`
  - `autoSize=true`이면 내용에 따라 높이가 증가하고 Resize는 적용하지 않음
  - `autoSize=false`일 때 초기 높이를 80px 이상으로 설정할 수 있음. 스크롤바 공간은 고정하고 thumb은 Hover에서만 표시해 텍스트 이동을 방지
  - Auto size와 Resize 모두 `viewport − reserved layout space`보다 낮은 Max height가 필요함. 고정 헤더·콘텐츠 패딩 등을 포함할 정확한 차감값은 아직 열려 있어 코드에는 임의 수치를 넣지 않음
  - Container와 Textarea field만으로 구성하며 Prefix/Clear/Suffix/Leading/Trailing element는 지원하지 않음. Character count는 Field에서 기본 제어하는 방향으로 보류했고, Textarea 내부 표시가 필요한 실제 사례가 확인될 때 재검토
  - Input과 분리된 여러 줄 입력 컴포넌트와 별도 검수 페이지
  - 현재 확인된 native 속성, content sizing과 기본 상태만 문서화
  - Focus/Error는 Input과 같은 단색 1px border + 외부 1px ring 구조를 사용
  - Input과 Textarea는 데스크톱 `On this page` rail 아래의 낮은 위계 Related 링크에서 서로 이동
  - 컴포넌트 상세 페이지는 데스크톱 우측의 sticky `On this page`에서 현재 섹션을 확인하고 바로 이동하며 좁은 검수 viewport에서는 숨김
  - 목차는 뎁스별 지그재그 경로 없이 단일 직선 rail을 사용하고, 화면의 활성 구간에 여러 섹션이 걸리면 모두 강조하며 활성 선의 위치와 높이를 300ms로 전환. rail과 항목 배경의 간격은 12px
- `/components/number-input`
  - 기존 `ooee_bk` V1 UI Studio의 Number Input 동작을 참고하고 현재 공용 Input의 `outline | filled`, Control Size, Layout과 상태 구조로 다시 구현한 공용 컴포넌트
  - 숫자 직접 입력, Decrease/Increase, `min | max | step`, Controls 표시 여부, 음수 허용 여부와 범위 도달 동작을 지원. Controls는 오른쪽에 모으는 `trailing`과 좌우로 나누는 `split` 배치를 제공
  - XLarge는 버튼 터치 영역을 32px로 확대하고 Trailing 버튼 간격을 4px로 사용하며, 나머지 Size는 24px 버튼을 사용
  - Split 배치의 숫자는 중앙 정렬. 현재 값이 유효한 Min에 도달하면 Decrease button, Max에 도달하면 Increase button을 비활성화하며, Number Input 전체가 Disabled/Read only이면 두 Controls를 함께 비활성화
  - 공용 Input의 선택 Slot을 재사용하는 `prefix / suffix`를 지원하며 통화 기호, 비율과 단위를 숫자 앞뒤에 표시. 각 요소는 독립적으로 `secondary | tertiary` foreground 위계를 선택하고 기본값은 Secondary. Percentage 예시는 `%` Suffix를 사용
  - 예전 `auto` Size와 `round` Shape은 현재 공식 Property에서 제외하고, 공통 Small/Regular/Large/XLarge와 Fill/Fixed만 사용
  - Quantity, Percentage, Direct input과 Negative allowed 예시를 Studio에서 검수
- `/components/combobox`
  - Base UI 1.7.0의 Input-inside-popup 패턴을 기반으로 한 단일·다중 선택 컴포넌트
  - `Combobox`는 단일 값 선택 후 닫히고, `MultiCombobox`는 Checkbox로 여러 값을 선택하며 Popup을 유지
  - 닫힌 상태는 Select trigger이며 Popup을 열면 Single·Multiple·2-depth가 공유하는 투명 배경·Border 없음·Small 32px Search recipe로 미리 정의된 Option을 필터링
  - MultiCombobox의 선택 결과는 첫 항목과 `외 N곳`을 표시하는 `summary`, 별도 선택 영역 Container 안에 공용 Small Rounded Chip 전체를 표시하는 `container` 두 타입
  - Container 타입은 Border 없이 Neutral secondary background로 구분하며, Filled Input 기반 선택 Chip 내부 검색, Hover scrollbar와 Remix close trailing action을 통한 개별 삭제를 지원
  - MultiCombobox 목록 맨 위의 `전체 N` 행은 활성 Option 수를 레이블과 4px 간격의 Neutral tertiary foreground로 표시하고 전체 선택·해제를 수행
  - Option list scrollbar는 레이아웃 공간을 유지하고 목록 Hover에서만 thumb을 표시
  - 단일 선택의 선택 Option은 token candidate인 `brand-alpha-08`, Check icon은 `oe-brand-foreground-primary`를 사용하며 선택 배경이 Hover highlight보다 우선. Search input과 선택 행 배경의 가로 범위를 맞추며 다중 선택 Checkbox는 Neutral 스타일 유지
  - Studio는 Single과 Multiple Playground를 위아래로 분리하고 각 control 상태를 독립적으로 유지
  - Properties · Selection에서 왼쪽 1~9호선과 오른쪽 실제 역 Checkbox 목록으로 구성한 서울 지하철 2-depth 다중 선택 예시를 검수 중이며 공용 API는 아직 정의하지 않음
- `/components/select`
  - 검색 없는 단일·다중 선택 컴포넌트. `Select`와 `MultiSelect`가 Base UI Select를 동작 기반으로 사용하고 Combobox와 공용 `selectionTriggerVariants` Trigger recipe를 공유
  - Outline/Filled, Small/Regular/Large/XLarge, Fill/Fixed와 Default/Focus/Invalid/Disabled/Read only 상태를 지원
  - 평면 Option 또는 Group label이 있는 Group 목록 중 하나를 전달. Group 사이 Divider를 자동 표시하고 Option별 optional `leadingElement`와 `description`을 지원
  - 선택 Option의 Leading element는 Trigger에도 표시하며, 한 목록에서 Leading을 사용하면 모든 Option에 같은 Leading 영역을 제공. Item description은 열린 Content에서만 표시. Playground는 `Option A~D` 가상 데이터로 Group·Leading·Description을 독립 제어
  - Anatomy는 Trigger·Content container·Group을 설명하는 `Select structure`와 Option 내부 요소를 설명하는 `Option anatomy`로 분리. 기술 구현 primitive인 Popup은 범용 Anatomy 명칭으로 사용하지 않으며 Selected indicator는 구조가 아니라 `Properties · State`에서 검수
  - Usage는 Behavior 다음에 Do / Don’t 시각 비교로 제공. Select와 Combobox의 역할 경계, Leading 영역의 목록 내 일관성, Item description의 Content 전용 표시를 현재 확정 규칙으로 문서화
  - MultiSelect의 Trigger는 선택값을 대표값과 나머지 개수 또는 전체 개수로만 요약하며, 선택값 전체를 별도 영역에서 검색·삭제·편집하는 Container와 Chip, 전체 선택은 Combobox 역할로 제외
  - 선택 행은 별도 배경과 Label 색상 변경 없이 Neutral Label의 Medium 굵기와 Brand Check indicator로 표시하며 선택 상태에는 Hover highlight를 중첩하지 않음
  - 열린 Content container는 Trigger와 같은 너비·좌우 시작점을 사용하며 Base UI의 기본 `alignItemWithTrigger`는 비활성화. Trigger와 Option의 Leading 열도 같은 x축에서 시작
- `/components/select-box`
  - 선택지를 화면에 펼쳐 놓고 상세 정보를 비교하며 하나 이상 선택하는 초안. `SelectBoxGroup`과 `SelectBox`를 공용 package가 소유하고 Studio는 이를 import해 검수
  - Single은 공용 Radio Control, Multiple은 공용 Checkbox Control을 재사용하며 Select Box 전체 Container가 하나의 선택 영역
  - 카드형 전체 선택 Surface는 Select Box만 소유함. Radio와 Checkbox의 `*Container` 변형은 공용 API·Studio·문서에서 제거했으며, 짧고 밀도 높은 폼 항목은 RadioField/CheckboxField, 설명·이미지와 함께 비교하는 선택지는 Select Box로 구분
  - `selectionMode=single | multiple`, `columns=number`, Leading element·Description·Trailing element, Disabled·Read only를 지원. Studio는 Single column과 Multi column을 구분하고 Multi에서 2~6 컬럼 수를 입력
  - 초기 선택값은 비어 있고 Selection mode 변경 시 항목을 자동 선택하지 않음. 필수 Label은 구조용 문구로 고정하고 Optional Description은 표시 Toggle만 제공. 실제 문구 작성은 Examples/Usage와 언어별 콘텐츠 검수에서 다룸
  - Trailing element는 Single에서 `radio | none`, Multiple에서 `checkbox | none`으로 제한
  - Group gap은 8px, 항목은 고정 높이 없이 Content를 Hug하며 좌우 16px·상하 12px 여백을 사용. Leading/Trailing은 항목 전체에 수직 중앙 정렬하고 Title–Description 간격은 2px
  - 선택 상태는 액션 Button과 구분하기 위해 진한 Fill을 쓰지 않고 `brand-alpha-05` 배경과 `brand-alpha-40` 2px 수준 경계를 사용. 이 조합은 token candidate이며 semantic token 승격 전 독립 용례를 더 확인
  - Pointer 선택은 Focus 선을 만들지 않고 Keyboard `:focus-visible`에서 같은 2px 선택선의 색만 `oe-focus-ring`으로 교체. Disabled selected는 Neutral disabled 색으로 바꾸고 Read only는 Focus만 유지한 채 Hover·Pressed와 값 변경을 차단
  - Select는 숨겨진 짧은 목록, Chip은 간결한 키워드 선택·필터, Select Box는 설명이나 시각 정보를 계속 노출하는 비교 선택으로 구분
  - Field 결합 API, 최대 선택 개수와 피드백, 모바일 열 수와 Custom content motion은 아직 정의하지 않음
- `/components/chip`
  - 공통 Control Height 중 XSmall 28px부터 XLarge 48px까지 다섯 단계를 제공하고, `shape`은 `circle`이 기본이며 Style variant는 두지 않음
  - Label과 선택적 Leading·Trailing element, Prefix, Remove button. Label이 없으면 Icon only이며 높이와 같은 정사각 폭을 사용
  - `onClick`과 `onRemove`는 타입으로 갈려 함께 넘길 수 없음. Container 전체가 Button인데 안에 또 Button을 두면 어느 것을 눌렀는지 알 수 없기 때문
  - Guidelines에 Filter·Selection·Suggestion·Input·정보 표시 다섯 쓰임의 규칙이 있으며 첫머리 표가 쓰임마다 어느 동작을 쓰는지 대조
  - MultiCombobox Container 타입의 선택 결과에서 첫 실제 사용
- `/components/checkbox`
  - Combobox 다중 선택에서 확인한 Checkbox 구조를 공용 자산으로 추출하고 OOEE Brand 선택 표현과 상태 규칙으로 정리
  - Seed Checkbox의 구조를 참고하되 16px 단일 control, 기본 Label Regular, 부모 항목 Label Semibold, Rounded·Ghost Appearance를 지원. Control은 20px Label 첫 줄에서 수직 중앙 정렬
  - Checked와 Indeterminate는 `oe-brand-background-bold-primary`와 inverse Indicator를 사용
  - Disabled Unchecked는 `oe-background-disabled`와 식별 가능한 Neutral border를 유지하고, Disabled Checked/Indeterminate는 Light·Dark 공통 `neutral-400` 매핑의 `oe-background-disabled-selected`와 흰색 Indicator를 사용
  - State Workbench는 Focus visible까지 포함하며 Error/Invalid는 Unchecked Danger border와 Checked Brand/Danger 우선순위 결정 전까지 미정
  - Checkbox Focus visible은 본체에서 2px 떨어진 2px `oe-focus-ring` 사용
  - 원자적인 Checkbox control과 Label·선택적 Description을 결합하는 CheckboxField를 분리
  - CheckboxField는 독립적으로 표시할 수 있는 `rightDescription`과 `bottomDescription` optional slot을 제공하며 Layout은 개발 API 기준 `hug | fill`을 지원
  - Label·Right Description 첫 행은 20px 고정 높이, Right Description은 단일 행 truncate로 처리. Bottom Description은 상단 행 아래에서 Leading element와 같은 왼쪽 시작점을 사용
  - Light/Dark `oe-foreground-tertiary`는 `neutral-500`을 사용
  - `hug | fill`은 display를 바꾸지 않고 너비만 fit-content/100%로 변경해 전환 시 위치를 유지
  - CheckboxField는 Regular form 36px 최소 행 높이에 정렬
  - CheckboxField와 RadioField의 전체 조작 영역 배경은 선택 여부와 관계없이 값 변경이 가능한 Field의 Hover 중에만 `oe-interaction-hover-subtle`(Light black 3%, Dark white 5%)로 표시. 기본·선택·Disabled·Read only 비Hover 상태는 투명하고 Disabled와 Read only는 Hover·Pressed 반응을 제공하지 않음
  - Checkbox와 Radio의 Field에는 현재 크기·위치가 변하는 Pressed motion을 적용하지 않음. Control 상태색과 Field Hover만 유지하며 전체 축소 효과는 모바일 공통 Motion 체계를 정할 때 다른 조작 요소와 함께 일괄 검수 예정
  - Radio Group의 보이는 질문·제목은 Field 조작 영역의 외곽이 아니라 실제 Radio Indicator의 왼쪽 시작점에 정렬. 화면·Surface의 20px 바깥 여백과 제목 위치는 유지하고 기본 RadioField의 8px 조작 여백은 Field를 왼쪽으로 보정해 바깥 방향으로 확보. 콘텐츠 결합 예시는 Radio 행의 불필요한 내부 들여쓰기를 제거
  - Checkbox Group도 같은 시각 정렬 규칙을 사용. Layout 예시 Surface는 20px 내부 여백을 사용하고 질문·제목 위치는 유지하며 묶인 CheckboxField 배열만 왼쪽으로 8px 보정해 실제 Indicator 시작점을 맞춤. 단독 CheckboxField에는 Group 보정을 적용하지 않음
  - 별도 Size property 없이 `shape` `square | rounded | ghost`를 지원하며 기본값은 Rounded. 모양은 시스템 단위가 아니라 서비스와 컴포넌트 조합 단위로 고르므로 컴포넌트가 `shape`를 소유한다. Ghost는 모서리 값이 아니라 Container를 제거하는 Checkbox 고유 값. 이전의 `appearance` Property와 Square 제거 결정을 대체함
  - Ghost Indicator는 15px이며 Default · Unchecked에서도 placeholder foreground로 표시하고 Checked에서 Brand foreground로 강조. Rounded Indicator icon은 10px. Indeterminate와 Disabled 상태는 Square와 Rounded에 제공하고 Ghost에는 제공하지 않음
  - shape별 선택 표현을 분리해 Square·Rounded는 fill과 border를 사용하고 Ghost는 Check icon의 foreground만 변경. Indicator radius는 Square 0px, Rounded 4px이며 Focus ring을 소유하는 Control은 세 shape 모두 4px를 유지해 Square에서도 각지지 않음
  - `Properties · Appearance`는 Rounded·Ghost를 직접 하위 카드로 배치하고 각 카드 안에 Unchecked·Checked를 별도 Surface 없이 수직 배열. Appearance·Elements·State는 각각 독립된 바깥 Section 카드로 구성
  - Playground의 Optional `Label=false`는 Field 전용 속성을 숨기고 접근 가능한 이름을 가진 원자 Checkbox만 표시해 Control 단독 사용을 검수
  - Playground에서는 `Label`에 실제로 종속되는 Field 속성만 영역 border가 아닌, 위아래 끝이 둥근 Studio 공통 2px 수직선 그룹으로 표시. Rounded에서만 지원되는 Indeterminate·Disabled는 Ghost 선택 시 조건부로 숨김
  - Checkbox State 문서는 Rounded와 Ghost를 분리해 표시하며 Ghost에는 Indeterminate와 Disabled가 없음을 명시
  - Checkbox Guidelines는 Switch와 공용 `component-guidelines` 구조를 사용해 Target area, 제출 지연 선택, 부모–자식 선택, Disabled 표현, 나열과 Indicator 재사용 원칙을 설명. Indicator 재사용은 흰색 Surface 중앙의 원자 Indicator와 Red PDF icon을 포함한 범용 선택 Content 예시를 2-grid로 비교하며 각각 실제 전환 가능. Content card가 클릭·선택 동작을 소유하고 Indicator는 카드 우측 상단에서 상태만 표시. Active Container는 `brand-alpha-40` border와 `brand-alpha-05` background를 사용하고 선택 여부와 관계없이 hover 시 `shadow-xs`를 표시
  - Guidelines 시각 예시의 바깥 Neutral 회색 Surface에는 border를 두지 않고, 실제 UI를 감싸는 내부 `background-primary` Surface에만 옅은 Neutral border를 사용
  - Brand palette와 semantic CSS 변수는 `ooee-brand-theme-css`에 캐시하고 Root Layout의 선행 script에서 첫 paint 전에 복원. 저장된 Brand 색과 초기 fallback 색의 전환을 방지하며 `<html suppressHydrationWarning>`으로 의도적인 선행 style 주입의 hydration 경고를 억제
  - State의 Rounded·Ghost처럼 제목과 설명이 바깥에 노출되는 그룹 사이는 32px 수준으로 분리하고, Elements의 카드만 이어지는 구조는 기본 간격을 유지
  - CheckboxField는 `flipped=false | true`를 지원하며 기본 왼쪽 Indicator를 `true`에서 오른쪽으로 배치. Content 내부 정렬과 상태 규칙은 유지
  - CheckboxField Content 앞뒤에 optional `leadingElement`·`trailingElement` Slot을 제공. Anatomy에서는 교체 가능한 영역을 Studio 전용 핑크색 점선과 작은 radius로 표시하며 실제 제품 스타일에는 포함하지 않음
  - `CheckboxIndicator`는 Checkbox의 16px 비상호작용 시각 base로 분리해 공용 export. Checkbox는 이를 내부에서 사용하고, Combobox처럼 자체 선택 동작을 가진 상위 컴포넌트는 Checkbox 전체를 중첩하지 않고 Indicator만 재사용
  - Studio Anatomy 공통 규칙: `leadingElement`, `trailingElement`, `swap` 교체 영역은 공용 `AnatomySwapSlot`으로 표시. 기본 1px Pink 점선·4px radius·옅은 Pink 배경이며 실제 제품 스타일에는 포함하지 않음
  - Studio Anatomy의 Container, Group, List처럼 하위 요소를 묶는 영역 표시는 내부를 가리키지 않음. 실제 외곽과 간격을 둔 평행선을 영역 높이 또는 너비만큼 배치하고 번호 연결선은 그 선에서 종료. 좌우 배치는 수직선, 상하 배치는 수평선을 사용하며 끝이 꺾인 bracket 형태는 사용하지 않음
  - Anatomy 안내선은 컴포넌트나 다른 구성요소를 길게 가로지르지 않음. 대상이 많으면 예시 행을 늘려 번호를 분산하고, 핵심 구조가 아닌 시각적 구분 요소에는 별도 번호를 부여하지 않음
  - Text와 Icon은 실제 Hit area가 더 크더라도 번호선을 글자 또는 아이콘의 시각 중심에 맞춤. 클릭·터치 Block 전체는 구조도에서 설명하고 시각 Anatomy에서는 Container·Group·List만 평행선으로 영역을 표시
  - Checkbox 열린 결정: Error/Invalid의 Brand·Danger 우선순위, Hover 전용 표현, Leading/Trailing Slot의 인터랙티브 요소 허용 여부는 아직 정의하지 않음
  - Checkbox Studio 상세 화면은 현재 범위 검수를 완료. Layout·Flipped·Description은 별도 Property 카드를 추가하지 않고 Playground·Anatomy·Property map에서 확인
- `/components/radio`
  - 확정한 16px Control과 8px 흰 원형 Indicator를 기준으로 Checkbox와 같은 Field·Content 구조를 적용한 공용 컴포넌트
  - Checked는 Brand로 채운 원형 Control 안에 흰색 Indicator를 두며 Unchecked, Checked, Focus visible, Disabled · Unchecked/Checked와 Read only 상태를 지원. Read only는 Enabled 기본 시각과 Focus를 유지하지만 Hover·Pressed와 사용자 조작에 의한 값 변경은 차단
  - Label·Right/Bottom Description·Leading/Trailing·Inline/Block·Flipped를 지원하며 Parent item, Indeterminate와 Ghost는 제공하지 않음
  - Studio 상세 화면은 Checkbox 검수 구조와 같은 Playground, Basic/Extended Anatomy와 Structure map, Elements, State, Layout, Guidelines, Property map 순서를 사용함. Preview의 제품 사례 문구도 KO/EN 전환에 포함
  - Radio Guidelines는 공용 `component-guidelines` 구조로 36/48px Target area, 서로 배타적인 단일 선택, 보이는 Group 질문, Disabled 값 보존과 세로 기본·16px 가로 줄바꿈 배치를 설명함
  - 배타적 선택의 잘못된 예시는 `사용할 알림 기능` 아래 동시에 켤 수 있는 로그인·결제 알림을 Radio로 제한한 형태로 표시해 질문과 오류 이유를 함께 드러냄
  - Radio 결합 예시는 왼쪽 16px Radio Control 단독과 오른쪽 상단 미리보기·하단 왼쪽 Radio와 Label을 결합한 3개의 가로 선택 항목을 2-grid로 비교. 오른쪽 시각 예시 제목은 `콘텐츠 결합 예시`이고 실제 UI는 GuideVisual의 단일 `oe-background-primary` Surface 안에 20px 패딩, 16px Semibold `테마 설정` 제목과 `시스템 설정`·`밝은 모드`·`어두운 모드` 선택지를 직접 배치. 별도 내부 Surface를 중첩하지 않고 Light/Dark를 그대로 따르며 이미지 외곽선은 Light Black 10%/Dark White 16% alpha로 전환. 각 모드를 설명하는 미리보기 자체의 색은 유지. 일반 콘텐츠가 선택 동작을 소유하고 Radio Control만 재사용하는 조합이며, 항목 전체에는 border·surface·Hover를 두지 않고 미리보기 그림자도 사용하지 않음. 선택한 항목의 미리보기 이미지에는 3px 간격을 둔 2px `brand-alpha-40` ring을 표시하고 ring–Radio/Label 행 간격은 4px. Radio/Label 행 왼쪽에는 4px 여백을 둬 시각적인 시작점을 맞춤. 키보드 Focus에서는 링을 중첩하지 않고 같은 2px ring을 `oe-focus-ring` 색으로 교체하며 Focus 해제 시 150ms 동안 선택 색으로 복귀. RadioGroup이 한 항목만 선택하며 다중 선택은 Checkbox Control을 같은 방식으로 조합
  - Radio 전용 회귀 검사는 Label과 결합 콘텐츠 클릭, 방향키 선택·roving tab index, Read only와 Disabled의 값 보존, Focus class와 Flipped 배치를 보호함
## 확정된 결정

- 모양의 공통 어휘는 `Square`, `Rounded`, `Circle(Pill)`이며 각 컴포넌트가 `shape` Property로 소유한다. 선택 단위는 시스템 전체가 아니라 서비스와 컴포넌트의 조합이고, 같은 컴포넌트를 한 서비스 안에서 섞어 쓰지 않기를 권장하는 수준이다. 강제 규칙이 아니다.
- Studio Playground는 검수용 테스트 환경임을 드러내는 Neutral 회색 Surface와 2px bold 외곽을 사용한다. 다른 예시 Surface 규칙의 예외다.
- Anatomy Preview는 정적 도식으로 그려도 되며, 대신 실제 컴포넌트와 다르게 보이지 않아야 한다.
- Radio와 Checkbox의 카드형 선택은 변형 컴포넌트로 만들지 않지만, base Control·Indicator만 재사용하는 조합은 활용 예시로 허용한다.
- 컴포넌트 Anatomy 명칭은 업계 표준을 우선하고 역할은 대응표로 밝힌다. Switch는 Track/Thumb을 유지한다.
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
- 컴포넌트 작업 중 새 색상 패턴이 발견되면 알림과 근거를 남긴 token candidate로 등록하고, 반복 검증 후 token 또는 recipe로 승격한다.
- 이미지와 Color swatch처럼 콘텐츠 자체가 배경색을 갖는 값의 경계는 Neutral border를 바깥에 두지 않고 내부 Black alpha layer를 중첩한다. Input Button의 Color picker 예시는 현재 1px inset `black 10%`를 token candidate 값으로 사용하며, 실제 이미지 사례와 함께 강도를 재검수한 뒤 semantic token 승격 여부를 결정한다.
- Outline 형태의 Form control과 선택 요소는 Disabled에서도 기본 외곽선을 유지한다. Disabled 상태는 foreground·background 위계와 상호작용 제한으로 표현하며 Outline 구조를 배경에 섞이게 만들지 않는다. 현재 Input·Number Input·Textarea·Combobox·Checkbox·Radio에 적용한다.
- `outline | filled` Style을 제공하는 모든 Form control은 `outline`을 기본값으로 사용한다. 공용 컴포넌트 API, Studio Playground 초기값과 Property 문서의 Default를 동일하게 유지한다.
- `fill | fixed` 너비 Layout을 지원하는 한 줄 Form control은 공용 API와 Studio Playground 모두 `fill`을 기본값으로 사용한다. Input·Number Input은 Fill이 기본이고, Textarea·Combobox는 기본적으로 부모 너비를 채운다. Checkbox·Radio는 같은 축에서 `hug`를 기본값으로 쓴다.

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

## 확정된 이관 전제

- 이 저장소의 목적은 개인 자산화가 아니라 블루키 제품에서 사용할 UI 시스템의 1차 컴포넌트 완성이다. 통합 방식(블루키 코드 직접 삽입 vs 별도 패키지 연동)은 개발 검토 후 결정하며 1차 작업에 영향을 주지 않는다.
- 전달 범위는 `docs/system/` + `packages/` + `apps/studio`다. Studio는 그 자체가 자산이고, **컴포넌트를 찾아보는 표준 채널이다.** Storybook은 두지 않기로 했다(`2026-09-18`, [ai-environment.md](ai-environment.md)). AI 가 읽는 색인은 저장소 루트의 `llms.txt` 다.
- `docs/process/`와 `AGENTS.md`는 전달 시 제거한다. 그래서 `docs/system/`의 문서는 이 둘을 참조하지 않는다.
- 디자인 토큰은 변환 없이 그대로 사용하며 기존 개발 네이밍·스택과의 정합성은 1차 범위에서 고려하지 않는다.

## 일정과 분담

1차 컴포넌트는 기획자가 이 저장소에서 완성하고, 이후 개발자가 블루키 적용을 맡는다. 기획자는 그동안 2차 화면 개선을 병행한다. 전체 단계와 검증 계획은 [roadmap.md](roadmap.md)에 있다.

| 날짜 (2026) | 내용 | 담당 |
| --- | --- | --- |
| 9/3 | 기존 환경 공유 | 기획자 |
| ~9/4 | 기존 리뷰, 배포 환경 세팅. GitHub Pages 호스팅은 성립하지 않았고 호스팅은 [ai-environment.md](ai-environment.md)의 스파이크 R4가 정한다 | 개발자 |
| ~9/11 | shadcn + Panda CSS 동시 사용 시 번들 용량 확인 | 개발자 |
| ~9/14 | 1차 컴포넌트 마무리 및 공유 | 기획자 |
| ~9/14 | 블루키 이관 테스트 | 공통 |
| 9/14~ | AI 개발 환경 트랙. 순서와 일정은 [ai-environment.md](ai-environment.md)가 소유한다 | 개발자 |
| 9/14~ | 화면 개선 작업 (약 1주) | 기획자 |
| 9/20~23 | 4·5단계 에이전트 룰 테스트와 A/B 비교 검증 | 공통 |
| 9/28~30 | 작업 마무리 | 공통 |

통합 방식 검토(블루키 코드 직접 삽입 vs 별도 패키지 분리)는 개발자가 맡으며 결정 시점은 정해져 있지 않다. 1차 작업에 영향을 주지 않는다.

## 바로 다음 작업

2026-09-14까지 1차 컴포넌트를 마무리한다.

### 진행 상황

**이 절은 각 문서가 소유한 결정을 다시 적지 않는다.** 컴포넌트의 공개 API와 시각·접근성 결정은 `docs/system/components/*.md`가, 토큰과 공통 규칙은 `docs/system/`의 해당 문서가, 아직 정하지 못한 것은 [open-questions.md](open-questions.md)가, 검토 항목의 세부는 [component-audit.md](component-audit.md)가 갖는다. 여기에는 지금 어디까지 왔고 다음에 무엇을 하는지만 남긴다.

**새로 만든 컴포넌트 일곱.** Chip(`2026-09-08`), Badge(`2026-09-08`), NotificationBadge(`2026-09-09`), Button(`2026-09-09`), ToggleButton(`2026-09-10`), AppHeader(`2026-09-11`), BottomNavigation(`2026-09-14`)이다. 구현·Studio 화면·명세를 함께 두었다. Badge에 남아 있던 미정 셋은 `2026-09-11`에 정리해 미정이 없다. AppHeader는 `2026-09-11`에 `main`에 합쳤고 BottomNavigation은 `2026-09-14`에 `dev`에 합쳤다.

**관리자 웹 화면 하나와 초안 컴포넌트 넷.** `2026-09-15`에 `/screens/admin/layout`에 환경설정의 테마설정 화면을 세웠다. 좌측 메뉴의 스타일 셋(다크·브랜드·라이트)과 메인 컬러, 메뉴 아이콘을 고르고 저장하면 함께 반영된다. 그 과정에서 Admin Header·Side Navigation·Page Header·Tabs를 뽑아 `candidates/`에 두고 Studio의 「초안」에 올렸으며, 넷을 감싸는 `AdminLayout`도 함께 두어 다음 관리자 화면이 본문만 쓰면 되게 했다. 좌측 내비게이션이 쓰던 shadcn의 `--sidebar-*`는 `--nav-*`로 옮겼다. 넷 다 명세와 상세 화면이 없으며 남은 것은 [open-questions.md](open-questions.md)에 있다.

**하나씩 검토가 끝난 컴포넌트 아홉.** Checkbox·Input·Input Button·Number Input·Radio·Select·Select Box·Switch·Textarea다. 그 과정에서 다섯 개의 기본값과 Property가 바뀌었고 각 컴포넌트 문서에 반영했다. 무엇을 고쳤는지는 [component-audit.md](component-audit.md)의 「하나씩 검토 진행 상황」에 있다.

`2026-09-04`에 13개 컴포넌트의 명세·구현·Studio 화면을 3중 대조해 109건을 찾았고 폼 요소 10개의 84건을 처리했다. 후순위인 Chip 7건·Badge 10건·Message Bubble 8건 중 앞의 둘은 새로 만들면서 함께 해소했다.

**후순위는 둘이다.** Message Bubble 8건 가운데 명세 쪽 넷(1·2·3·8)은 `2026-09-28`에 명세를 다시 쓰며 처리했고 Studio 화면 쪽 넷(4~7)이 남았다. Combobox 5건은 지시가 있을 때 시작한다.

### 남은 작업

1. **Combobox의 미선택 체크박스 2개.** Anatomy 예시에서 두 Option이 모두 미선택 체크박스로 보인다. 하나는 공용 `CheckboxIndicator`이고 다른 하나는 도식으로 그린 사각형이라 시각이 거의 같다. 선택된 상태를 하나 두어 무엇을 보여 주는 예시인지 드러내야 한다. 좌표가 아니라 예시 내용의 문제다.
2. **Anatomy 안 흰색 내부 Container 5곳.** `studio.md`가 정한 규칙과 어느 다섯 곳이 다른지 화면에서 확인한다.
3. **Structure map이 없는 화면 여섯.** Anatomy가 있는 열한 화면 중 여섯 곳에 없다. 한번에 몰아서 할 작업으로 [component-audit.md](component-audit.md)에 있다.
4. **Message Bubble 말줄임 기능.** `maxLines` 3~10 범위, 넘칠 때만 더보기·접기 노출, 라벨은 prop으로 받아 언어 전환에 대응, `aria-expanded`와 자동 테스트를 함께 추가한 뒤 Studio 화면과 명세를 갱신한다. 없던 prop을 더하는 non-breaking 변경이라 이관 이후에 해도 기존 코드가 깨지지 않는다.
5. **옛 Badge를 쓰던 자리.** Studio workbench 세 파일에 하드코딩해 두었고, 새 Badge의 크기 체계가 24px 하나뿐이라 아직 교체하지 않았다. `packages/patterns`에 있던 세 자리는 `2026-09-14`에 그 패키지를 걷어내며 함께 사라졌다. 어느 자리를 새 Badge로 되돌릴지는 사용자가 화면에서 직접 확인한다.
6. **Chip의 Filter 쓰임.** 다섯 가지가 남아 있으며 [component-audit.md](component-audit.md)의 「Chip 진행 상황」에 있다. 그중 셋은 Filter Bar를 별도 컴포넌트로 분리할 때 함께 다루는 편이 낫고, 미정 셋은 [open-questions.md](open-questions.md)에 있다. Chip의 정보 표시 쓰임을 Badge로 대체할 수 있으면 Chip에서 걷어낼지도 함께 판단한다.
7. **Chip 확정 후 Combobox 잔여 작업.** Combobox의 선택값 Container가 Chip을 렌더링하므로 Chip 디자인이 바뀌면 Container를 두 번 만들게 된다. Chip을 먼저 처리한다. 다섯 항목은 [component-audit.md](component-audit.md)의 「Combobox 잔여 작업」에 있다.
8. **언어 전환 잔여.** Switch의 `copy.ko` 고정, 하드코딩 예시 콘텐츠, 영문 고정 접근 가능한 이름, `lang` 미전환. Message Bubble 쪽이 대부분이라 후순위와 함께 다룬다.
9. **Button의 Ghost.** 세부 규칙을 정하지 않은 채 기존 여섯 자리를 유지하려고 먼저 구현했으므로 화면에서 다시 본다. 그 밖의 미정 항목은 [button.md](../system/components/button.md)의 「현재 정의하지 않은 항목」이 갖는다.
10. **Chip `xsmall` 의 글자 색이 빠지던 것은 고쳤다(`2026-09-18`).** `cn()`(tailwind-merge)이 `text-oe-label`(글자 크기 토큰)을 색 클래스와 같은 무리로 보고 앞의 색을 지우던 것이 까닭이었다. `switch.tsx` 처럼 arbitrary value 로 우회하는 대신 `packages/ui/src/utils.ts` 에서 `extendTailwindMerge` 로 `text-oe-*` 크기 토큰을 font-size 무리에 넣어 뿌리에서 막았고, `utils.test.ts` 가 고정한다. 우회가 필요한 자리는 이제 없다.
11. **Message Bubble 명세를 다시 쓰며 걷어낸 검수 항목(`2026-09-28`).** 명세의 「아직 검수할 항목」 절과 과정 문장을 여기로 옮겼다. 정해지면 [message-bubble.md](../system/components/message-bubble.md)로 돌아간다.
    - bubble tail 유무. 지금 구현에는 tail 이 없다.
    - 연속 메시지에서 metadata 와 상태 표시를 생략하거나 묶는 기준. 지금은 「같은 발신자, 분 단위까지 같은 시각」 하나다.
    - 삭제 확인 방식과 복사 완료 feedback.
    - 이미지, 링크와 긴 URL.
    - 첨부의 업로드 중, 취소, 실패. Studio 는 전송 완료 파일만 다룬다.
    - RTL 과 폭이 매우 좁은 화면.
    - 브랜드 theme 확장. `--oe-message-*` 변수 자리만 있고 값은 Studio 「채팅 테마」 예시에만 있다.
    - Anatomy 요소 이름(Avatar·Author·Bubble·Content·Sidecar·Metadata row·Action bar)을 `vocabulary.md` 에 올릴지. 명세 초안이 먼저 쓰고 있으며 기획자 확인이 필요하다.
    - `MessageComposer` 처럼 바깥 Container 가 border 와 focus 를 소유하는 조합에서 안쪽 Textarea Container 를 투명·무테두리로 두고 두 경계를 중첩하지 않는다는 규칙. Composer 가 `초안` 이라 명세가 없어 여기에 둔다.
    - 읽음 처리의 자동·수동 비교는 Studio 「Read handling」 이 갖고 `MessageBubble` API 로 승격하지 않는다. Studio 통합 예시의 날짜 구분선과 Date Picker 는 검수 control 이며 제품 기능이 아니다.
    - Studio 화면의 Anatomy·Properties·Property map 부재, 섹션 제목의 언어 처리, 통합 예시 본문의 언어 고정, `MessageFileAttachment` 의 prop 부재는 [component-audit.md](component-audit.md)의 「Message Bubble (8건)」 4~7 이다.
12. **Studio 의 Chip Playground 가 새 `ariaLabel` 규칙을 스스로 어긴다.** `chip.tsx` 에 「보이는 Label 을 담은 이름만 보탠다」 가드가 들어오면서, copy 가 `label: "Label"`·`ariaLabel: "Chip"` 인 Playground(`apps/studio/src/components/candidates/chip-workbench.tsx:52·72`)가 조건에 걸린다. `next dev` 에서 `/components/chip` 을 열면 렌더마다 콘솔 경고가 찍히고, 디자인 시스템의 정본 예시가 이번에 새로 쓴 규칙을 어기는 예시가 된다. 렌더 결과는 main 과 같아 접근성 회귀는 없고 프로덕션 빌드에도 남지 않는다. copy 의 `ariaLabel` 을 Label 을 포함하는 문구로 바꾸거나 Icon only 일 때만 넘기면 된다. (`2026-09-18` 릴리스 점검)

13. **`color.md` 가 `oe-border-tertiary` 와 `oe-border-disabled` 의 값이 같다고 적던 것은 닫았다(`2026-09-28`).** 문서를 코드 값(tertiary Light `neutral-150`·Dark `neutral-850`, disabled Light `neutral-100`·Dark `neutral-900`, `packages/tokens/src/index.ts:113~114`)에 맞춰 고쳤다.

14. **ToggleButton 의 custom tone 색이 토큰이 아니라 날 hex 다.** 즐겨찾기·찜의 색이 `toggle-button.tsx` 의 `CUSTOM_ON_CLASS` 에 `bg-[#fdf5e2]`·`text-[#dfa010]` 처럼 적혀 있다. 그래서 색을 토큰 이름으로 읽는 도구가 이 칠만 이름을 찾지 못했다. 지금은 값 그대로를 이름으로 삼은 `hex-fdf5e2` primitive 로 올려 두었고, 변수 설명에도 「아직 토큰이 아니다」라고 적었다. 이름을 붙일지, 어느 semantic token 으로 보낼지는 디자인 시스템이 정한다. (`2026-09-18`)

16. **MessageBubble 만 색을 손으로 쓴 CSS class 로 칠한다.** 다른 컴포넌트는 `bg-oe-background-secondary` 처럼 Tailwind 토큰 class 로 칠하는데, 이 컴포넌트는 `.oe-message-bubble-incoming`·`.oe-message-bubble-outgoing`(`packages/ui/src/styles.css:61~75`)이 `background-color: var(--oe-message-outgoing-background, var(--oe-background-bold-primary))` 꼴로 칠한다. `dom-extract.js` 는 **class 이름에서** 토큰 후보를 모으므로 그 class 에서는 아무것도 읽지 못하고, 카탈로그에 넣었더니 칠 25 개가 「후보 없음」으로 걸렸다(`2026-09-21`). 그래서 카탈로그에서 뺐다 — 확정 20 종 가운데 Figma 라이브러리에 없는 유일한 컴포넌트다.

    고치는 길은 `packages/ui` 가 그 색을 토큰 class 로 칠하는 것이다(`--oe-message-*` 로 갈아 끼우는 길을 남기려면 그 자리만 CSS 변수로 두고 기본값은 토큰 class 로). 다른 컴포넌트와 같아지는 길이고, 정하는 것은 디자인 시스템이다. 같은 자리에 `data-slot` 도 없어 sandbox 가 어떤 컴포넌트인지 읽지 못하므로 함께 보면 좋다.

17. **컴포넌트 카테고리화 검토.** 13개 컴포넌트 검수가 끝나면 목록을 성격별로 묶을지 판단한다. 지금은 `component-registry`가 소유하는 알파벳순이며 `docs/system/studio.md`가 그 기준과 분류를 미루는 이유를 적고 있다. 판단할 때 걸리는 것은 Select Box가 항상 펼친 선택인지 목록 선택인지, Switch를 Checkbox와 나눌지, Chip이 표시인지 입력 보조인지, Message Bubble을 폼 요소와 같은 층에 둘지다. Studio 의 메뉴 구조와 함께 정하면 두 번 바꾸지 않는다.

`Presentation` 화면은 무엇을, 왜, 어떻게 바꿨는지 전달하는 화면이며 현재 열네 꼭지가 있다. 원본은 `apps/studio/src/components/presentation-entries.ts`이고 작성 규칙과 기록 절차는 [presentation.md](presentation.md)에 있다.

**꼭지로 세우지 않기로 한 작업이 셋 있다.** AppHeader는 전할 만한 것이 시각 세부에 그쳐 판단으로 남길 내용이 아니다. Textarea와 Number Input은 작업의 대부분이 규격이거나 이미 있는 판단을 한 번 더 적용한 것이다. 세 건 모두 사용자가 확인한 결정이므로 다시 판단하지 않는다.

### 2026-09-08 화면 검수 도구

화면을 재고 찍는 일은 `scripts/visual/inspect.mjs`가 소유한다. 그전에는 측정할 때마다 일회용 스크립트를 새로 썼고 한 세션에 26개가 쌓였다. 그 왕복이 컨텍스트를 밀어 올려 뒤로 갈수록 요청 하나가 느려졌다. 사용법은 AGENTS.md의 「화면 확정 검수」가 소유한다.

`--sweep`은 Control 축을 곱해 모든 조합을 크롬 한 번으로 훑는다. Badge의 `tone` 7 × `variant` 3 = 21개 조합을 19초에 재는 것까지 확인했다.

**`--sweep`은 `--eval`을 무시한다.** 조합을 훑을 때는 `--measure`만 반영되므로, 대비처럼 임의 식으로 계산해야 하는 값은 `--click`으로 조합을 하나씩 지정해 따로 재야 한다. 훑기와 임의 식을 함께 쓸 수 있게 고칠지는 정하지 않았다.

**zsh에서 `set -- $combo`로 조합을 쪼개면 클릭이 조용히 실패한다.** zsh는 인용하지 않은 변수를 단어로 나누지 않아 `--click "Fill Warning"`이 되고, 해당하는 button이 없어도 측정은 기본 상태의 컴포넌트를 그대로 재서 그럴듯한 숫자를 낸다. 반복문으로 조합을 훑을 때는 축마다 중첩 `for`를 쓰고, 측정식이 `data-tone`처럼 지금 상태를 함께 돌려주게 해서 클릭이 먹었는지 확인한다.

```bash
pnpm visual --path /components/badge \
  --sweep Fill,Tonal,Outlined \
  --sweep Brand,Neutral,Warning,Danger,Success,Info,Custom \
  --measure "[data-slot=badge]"
```

### 2026-09-14 branch 방식을 정했다

개발자가 합류하면서 branch를 세 층으로 나눴다. `main` 아래에 통합 branch `dev`를 두고, 두 사람이 각자 `dev`에서 뻗은 `feature/*`에서 작업한다. `feature/*`는 pull request로 `dev`에 올리고, `dev`에 모인 결과를 통합 검증한 뒤 `main`으로 올린다. 규칙의 원본은 [git-workflow.md](git-workflow.md)이며 여기에 다시 적지 않는다.

담당은 기획자가 Component·Variant 와 Token·UI 개선이고, 개발자가 Agent Rules, `AGENTS.md`, Skill·Plugin, 요청 처리 하네스, `llms.txt` 다. Story 작성은 Storybook 을 두지 않기로 하면서 사라졌다(`2026-09-18`).

**통합 검증 항목은 둘이다.** Storybook 과 Storybook MCP 항목은 그 둘을 두지 않기로 하면서 걷어냈고(`2026-09-18`), Figma MCP 와 Figma 라이브러리 항목은 `2026-09-22` 에 요청 처리에서 Figma 를 뺐다. Skill 셋과 `.claude/settings.json` 공용 권한은 들어왔으며, 공용 권한은 저장소 루트에서 시작한 Claude Code 세션의 되돌리기·삭제 명령에 확인을 묻고 `main` 직접 push를 거부한다(`AGENTS.md` 「Claude Code 명령과 권한」). 개발자의 작업이 들어오는 순서대로 채운다.

**`main` 보호 설정은 여전히 켤 수 없다.** 비공개 저장소의 무료 플랜에서 열리지 않아 API가 403과 `Upgrade to GitHub Pro or make this repository public`을 돌려준다. 규칙으로 강제되지 않으므로 사람이 순서를 지킨다. 대신 기본 branch를 `dev`로 바꿔서, `--base`를 빠뜨린 pull request가 `main`이 아니라 `dev`로 향하게 했다.

### 2026-09-14 AI 개발 환경 트랙을 시작했다

화면 요청은 Slack 폼 → 이슈 → 이 Mac 의 1분 감시 → `runner.mjs` 가 처리하고, 모델은 `/make-screens` 로 화면만 만든다(`2026-09-24` 역할 뒤집기). 흐름·결정 규칙은 [ai-environment.md](ai-environment.md) 「처리와 승인」, 스크립트와 설치(사본 신뢰 등록·`node -e` 열지 않기 포함)는 `scripts/harness/README.md` 「러너」·「launchd」·「알아 둘 것」, 까닭은 `scripts/harness/plan.mjs` 머리말이 갖는다. sandbox 는 프로젝트 탭과 여러 폭으로 나뉜다([ai-environment.md](ai-environment.md) 「요청 폼」). Figma 는 쓰지 않는다([ai-environment.md](ai-environment.md) 「2026-09-22 Figma 를 뺐다」).

**처리 시간 실측**(`2026-09-24`): #60 이 설정이 깨진 상태에서 143분, 권한을 고친 뒤 #62 가 33분, 역할을 뒤집은 뒤 #85(화면 3장)가 11분 42초·#101(제자리 수정)이 11분 31초. 기록은 `~/.ooee-harness/runs/` 에 있고, 줄어든 까닭은 `plugins/ooee-harness/README.md` 「모델과 effort」와 `scripts/harness/plan.mjs` 머리말에 있다.

### 2026-09-09 Badge 색을 단계 규칙으로 바꿨다

Badge의 `compoundVariants` 21개를 걷어내고, tone별 팔레트와 variant별 단계의 곱으로 색을 정하게 바꿨다. 결정과 단계표, 대비 수치는 [badge.md](../system/components/badge.md)의 「색」이 소유한다. 여기서는 다른 컴포넌트에도 걸리는 사항만 남긴다.

- **세만틱 token 이름 대신 프리미티브 단계를 참조한다.** 이전 근거는 「프리미티브를 직접 참조하면 Light·Dark 조합을 컴포넌트가 들고 있어야 하고 브랜드 seed가 바뀔 때 따라가지 못한다」였는데, `--brand-{단계}`가 seed에서 생성되므로 뒤쪽 우려는 성립하지 않았다. 남는 비용은 Light·Dark 단계 쌍을 컴포넌트가 들고 있게 된다는 점 하나다. **이 전환을 다른 컴포넌트로 넓힐지는 정하지 않았다.** Badge는 tone 축이 있어서 조합이 21개로 불어난 컴포넌트이고, tone 축이 없는 컴포넌트는 세만틱 token으로도 조합이 파생되지 않는 문제가 없다.
- **짙은 유채색 배경의 가독성은 WCAG 2.x 수치만으로 판단하지 않는다.** 2.x 대비는 상대 휘도만 계산해서 색조와 채도를 보지 않으므로, 짙은 유채색에 white 글자를 얹은 경우를 실제보다 낮게 평가한다. Badge `fill`은 600 단계에서 절반이 4.5:1 아래지만 APCA로는 전부 60을 넘고, 글자를 뒤집으면 오히려 절반으로 떨어진다. **다른 컴포넌트에서 같은 상황을 만나면 두 값을 함께 재고, 글자 극성은 색조가 아니라 배경 밝기로 정한다.** 계산 방법은 `scripts/visual/inspect.mjs --eval`로 캔버스에서 픽셀을 읽어 쓴다.
- 단계를 고를 때는 눈대중으로 정하지 않고 위 「화면 검수 도구」로 대비를 재서 정한다. 색 계열마다 같은 단계 숫자가 같은 밝기로 보이지 않으므로, 수치와 화면을 함께 본다.
- **Badge의 크기와 모양도 함께 바꿨다.** 높이는 `size` Property로 `small`(20px)·`medium`(24px) 두 단계가 되었고 기본값은 `small`이다. 모양은 알약에서 `Rounded` 6px로 바뀌었으며 좌우 여백이 단계별로 6px과 8px이다. 결정 근거는 badge.md의 「역할과 경계」에 있다. Studio에는 `Properties · Size` 카드를 추가했다. Property를 더하는 것은 non-breaking이지만 기본 높이가 24px에서 20px로 바뀌므로 기존 화면의 Badge가 작아진다.
- **`BadgeColor`에서 회색 넷을 뺀 것은 breaking change다.** `slate`·`zinc`·`neutral`·`stone`을 지웠고 목록을 `BADGE_COLORS` 런타임 값으로 내보내 Studio가 같은 목록을 따로 적지 않게 했다. 공개 타입이 좁아지는 변경이라 [git-workflow.md](git-workflow.md)에 따라 별도 branch와 PR로 합친다. Checkbox의 `appearance` → `shape` 때와 같은 처리다.
- **`2026-09-11`에 Dark의 `tonal` 배경을 불투명한 800 단계에서 300의 20% 알파로 바꿨다.** 불투명한 단계는 그 단계를 Surface로 두는 자리에서 배경이 겹쳐 사라지므로, Surface 단계를 제한하는 대신 배경 쪽을 알파로 바꿨다. 알파는 어느 Surface 위에서나 그 색을 밝히는 쪽으로 얹힌다. 회색이 `neutral-800` 표면에서 1.00이던 것이 1.65가 되었고, 유채색은 2.13~2.53에서 1.50~1.70으로 내려가 Dark에서 배경이 세다는 지적도 함께 해소됐다. 밑 단계를 500이 아니라 300으로 둔 이유는 같은 알파에서 tone 사이의 편차가 가장 좁기 때문이며, 수치는 badge.md의 「색」이 소유한다.
- **같은 전환을 Button에 적용할지는 정하지 않았다.** Button의 `tonal`도 Dark에서 불투명한 800을 쓰고 Badge와 단계 규칙을 공유하기로 해 두었으므로, 지금은 두 컴포넌트의 Dark `tonal`이 서로 다르다. Button은 Hover와 Pressed가 800→700→600으로 진해지는 사다리를 갖고 있어 알파로 옮기면 그 사다리도 함께 다시 정해야 한다. [open-questions.md](open-questions.md)에 두었다.
- **Light의 `tonal`은 그대로 불투명한 100이라 같은 겹침이 남아 있다.** `oe-background-secondary`가 Light에서 `neutral-100`이므로 그 표면 위의 `neutral` tonal은 대비 1.00이다. Dark를 고친 뒤로 Light가 더 약한 쪽이 되었고(흰 표면에서도 1.07~1.23), 지금은 그 자리에 `outlined`를 쓰라는 안내만 badge.md의 Guidelines에 있다.

### 화면에서 확인이 밀린 항목

- Checkbox의 Square 모양과 Radio·Checkbox의 컨트롤 그룹 순서.
- checkbox.md 64행의 Trailing element 예시가 「Red tonal XSmall `NEW` Badge」로 적혀 있으나 `XSmall`은 Badge에 없는 이름이고, checkbox-workbench는 Badge 컴포넌트가 아니라 16px 알약을 직접 만들어 쓴다. Checkbox 확정 시점에 함께 정리한다.
Anatomy 연결선 좌표와 범위 표시선 공용화는 `2026-09-08`에 끝냈다. Input Button의 Prefix·Suffix 마커, 공용 부품 통합 뒤의 좌표와 여백, Combobox 범위 표시선의 처리 방향이 여기에 있었다.

## 이전부터 이어지는 작업

1. Select Box의 Playground·Anatomy 한정은 최초 검수 단계에만 적용하던 것이며 지금은 다른 컴포넌트와 같은 범위로 다룬다. 명세의 「현재 검수 범위」 절은 걷어냈다.
2. 폼 요소 10개의 본문 순서·우측 목차·Property 구조는 3중 대조 검수에서 확인하고 맞췄다. 후순위인 Message Bubble 은 `2026-09-28`에 명세가 Anatomy·Properties 를 갖췄고, Studio 화면에는 Anatomy·Properties·Property map 이 아직 없다.
3. Anatomy 시각 검수는 번호선과 Container 평행선까지 `2026-09-08`에 마쳤다. 열두 화면 전부가 대상을 참조해 자리를 잡으므로 좌표를 다시 확인할 일은 없다. 남은 것은 Surface 안쪽 Container의 배경과 border 규칙이며 위 「남은 작업」 2번이 그것이다.
4. Checkbox, Radio, Switch와 Combobox의 Neutral `Structure map`을 공용 표시 컴포넌트로 검수한다. 요소명은 같은 Neutral foreground, 연결선과 Optional 표시는 더 옅은 Neutral 위계를 사용한다. Combobox처럼 구조가 복잡한 컴포넌트는 시각 Anatomy를 Trigger와 Content로 분리하고 구조도에서 포함 관계를 연결한다. 다른 컴포넌트로 확대하기 전에는 각 컴포넌트의 실제 포함 관계를 먼저 확인한다.
5. Studio 에 Anatomy 가 없는 것은 MessageBubble 이다. 명세 초안이 Avatar·Author·Bubble·Content·Sidecar·Metadata row·Action bar 일곱으로 적어 두었으므로 기획자가 그 이름과 범위를 확인한 뒤 `vocabulary.md` 와 Studio 화면에 함께 추가한다. Badge는 `2026-09-08`에 Container·Icon·Label 셋으로 Anatomy와 Structure map을 넣었다. Field는 `2026-09-09`에 정의했으며 Anatomy와 Structure map을 함께 넣었다.
6. 1차 구조·Property 검수가 끝나면 Guidelines를 별도 2차 순회로 정리한다. 현재 컴포넌트별 Usage 정책을 임의로 채우지 않고 확인된 규칙과 실제 오용 사례만 추가한다.
7. 공용 상세 shell과 registry는 route·본문 순서·우측 목차·연관 컴포넌트 회귀 테스트를 보완한다. 각 공용 UI는 Pointer, Label 클릭, Keyboard, Disabled, Size와 주요 상태 조합 중 현재 자동 테스트가 없는 항목을 컴포넌트별로 추가한다.
8. 문서 공통화 뒤 `docs/system/foundations/color.md`의 열린 질문, 여러 Brand seed의 HCT palette 품질과 실제 화면 재검증을 이어간다. MessageBubble은 다른 채팅 화면에서 API를 재검증한다.
9. Presentation 꼭지와 컴포넌트 상세를 잇는 역방향 링크를 만든다. 지금은 꼭지에서 컴포넌트로 가는 한 방향만 있어서, 컴포넌트 상세에서 「왜 이렇게 되어 있지」를 물었을 때 갈 곳이 없다. 꼭지 데이터에 관련 컴포넌트 key를 두고 registry와 연결해 `Similar`·`Works with` 옆에 표시한다. Presentation 화면 자체의 검색 기능은 넣지 않는다. 목차가 한 화면에 들어가지 않을 만큼, 대략 꼭지가 스무 개를 넘을 때 다시 검토한다.

현재 `/foundations/color`의 OE Semantic catalog와 코드의 mapping은 검토용 Provisional 구현이다. 화면에 표시된 값을 사용자 결정 없이 확정하거나 다른 컴포넌트에 일괄 적용하지 않는다.

## 새 작업에서 사용할 시작 요청 예시

```text
이 저장소의 AGENTS.md, docs/system/README.md, docs/process/working-context.md와 작업 관련 Foundation 문서를 먼저 읽어라. `Provisional`로 표시된 결정을 확정된 것으로 가정하지 말고, 문서화된 ooee 제작 흐름에 따라 작업하라.
```
