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

## 코드 소유 경계

- `apps/studio`는 Workbench, 예시 콘텐츠, 출처, 성숙도, viewport·theme·locale 검수 control만 소유한다.
- 외부 원본을 그대로 검토하는 초기 Experiment는 Studio에 둘 수 있다.
- 사용자가 수정하거나 ooee 자산으로 채택한 UI는 Candidate/Provisional이어도 `packages/ui`에 실제 원본을 둔다.
- 채택된 조합 패턴은 내부를 성급하게 분해하지 않고 전체 단위로 `packages/patterns`에 실제 원본을 둔다.
- Studio는 공용 package를 import해 표시하며 같은 자산의 Studio 전용 복사본을 만들지 않는다.
- Stable은 package 이동 조건이 아니라 검증 완료 상태다.

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

폼에서 직접 조작하는 Input, Checkbox 같은 control의 식별 보더는 `oe-border-primary`를 사용한다. 여러 폼 요소나 Label을 하나의 선택·입력 영역으로 감싸는 낮은 위계의 form container는 `oe-border-secondary`를 사용한다.

## 아이콘 Foundation

- 공용 아이콘의 Primary 공급원은 Remix Icon이며 React 구현은 `@remixicon/react`를 우선 사용한다.
- Secondary 공급원은 Google Material Symbols다. Remix Icon에 의미가 맞는 아이콘이 없을 때만 두 번째로 검토한다.
- 같은 의미의 Remix Icon이 있으면 Material Symbols나 다른 아이콘 라이브러리를 혼용하지 않는다.
- 기본 스타일은 의미가 없는 장식용 fill보다 `Line` variant를 우선하고, 선택·상태 강조처럼 실제 의미가 있을 때만 `Fill` variant를 사용한다.
- Remix Icon과 Material Symbols에 적절한 아이콘이 없거나 제품 고유 아이콘이 필요한 경우에만 다른 공급원 또는 자체 SVG를 검토하고, 사용 이유를 관련 Foundation/Component 문서에 남긴다.
- Secondary 및 예외 공급원의 패키지는 실제 사용처가 생길 때만 추가한다.
- 아이콘의 크기, 색상, hover와 focus는 컴포넌트의 oe semantic token 및 interaction 규칙을 따른다.

어두운 solid brand/status 배경 위에는 공통 `oe-foreground-inverse`를 먼저 검토한다. 밝은 배경에는 대비가 확보되는 Neutral foreground를 사용한다. 반복되는 실제 예외가 생기기 전에는 `on-*` token을 만들지 않는다.

Outline 형태의 공용 Form control과 선택 요소는 Disabled 상태에서도 외곽선을 제거하거나 배경과 구분되지 않는 색으로 바꾸지 않는다. 구조를 인지할 수 있도록 기본 Outline border를 유지하고, Disabled 위계는 foreground와 background 및 상호작용 제한으로 표현한다. Filled 형태는 별도 Border가 없는 기존 구조를 유지한다.

`fill | fixed` 너비 Layout을 지원하는 한 줄 Form control의 기본값은 `fill`이다. 공용 컴포넌트 API와 Studio Playground의 최초 선택값을 동일하게 유지한다. Checkbox·Radio처럼 별도의 `inline | block` Layout 체계를 가진 선택 요소에는 이 값을 억지로 적용하지 않는다.

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

컴포넌트 Anatomy의 연결선은 Light/Dark 모두 `oe-border-primary` 회색조를 사용한다. 연결선과 숫자 마커의 진한 배경은 서로 다른 역할로 분리하며, 연결선에 foreground 또는 black 직접값을 사용하지 않는다.

Studio 문서 설명은 국문을 유지한다. 언어를 선택하면 컴포넌트 Preview 안의 Label, Value, Placeholder, 제품 사례 문구, 접근 가능한 이름과 해당 범위의 `lang`을 함께 바꾼다. 구조 명칭이 아닌 실제 Component/Example 콘텐츠를 한 언어로 하드코딩하지 않는다. 전체 문서 번역은 국문 문서가 완료된 뒤 별도 작업으로 다룬다.

Component catalog의 title, description, maturity, 수정일, route와 Similar/Works with 관계는 공용 `component-registry`를 단일 원본으로 사용한다. 모든 Component route는 공용 상세 page shell을 사용하고, 각 Workbench는 우측 `On this page`와 registry 관계를 연결한다.

Component 상세 화면의 Guidelines 하위 주제 제목은 공용 `GuidelineTitle`을 사용한다. 제목 앞에는 Remix `RiBookOpenLine` 16px을 Tertiary foreground로 배치하고 제목은 14px Semibold, 아이콘과 제목 간격은 8px로 유지한다. 컴포넌트별 Workbench에서 같은 스타일을 다시 만들지 않는다.

Guidelines의 Target area 예시, Do/Don’t 비교, 제출 지연 예시와 불릿 목록은 공용 `component-guidelines` 구성요소를 사용한다. Checkbox와 Switch처럼 같은 사용 원칙을 설명하는 컴포넌트는 시각 구조와 정보 위계를 공유하고, 실제 컴포넌트와 문구만 각 목적에 맞게 바꾼다.

Target area를 설명할 때는 실제 컴포넌트를 바꾸지 않고 공용 `TargetArea` Studio 표시를 겹친다. 영역 전체를 점선이나 색면으로 둘러싸지 않고, 실제 최소 조작 높이 또는 Row 높이의 옆에 1px 직선과 양끝 캡을 둔 치수선 및 숫자 Label을 표시한다. 이 측정 표시는 실제 제품 컴포넌트 스타일에 포함하지 않는다.

Studio의 수치 측정 Annotation은 Violet 계열을 공통으로 사용한다. 대상은 width·height·min/max·Target area 같은 크기, padding·gap·inset 같은 내부/외부 간격, radius, font-size·line-height·letter-spacing처럼 수치로 측정하는 Typography 스펙이다. 숫자가 token으로 표현되어도 역할이 치수이면 같은 Violet 표시를 사용한다. Font family·weight 명칭, semantic color 값, 상태, Anatomy 번호와 Swap 영역은 치수 Annotation이 아니므로 Violet 규칙을 적용하지 않는다. 치수 숫자 Pill은 border 없이 옅은 Violet 배경과 진한 Violet 글자만 사용한다.

Square와 Rounded 같은 모서리 방향은 컴포넌트 인스턴스 Property로 혼합하지 않는다. 한 시스템의 Radius Foundation 또는 theme에서 기본 방향을 정하고 관련 컴포넌트가 이를 일관되게 따른다. Ghost처럼 Container를 제거하는 구조적 차이는 별도 Appearance로 제공할 수 있다.

### Component 구조 용어

- `Control`은 Focus, 키보드 입력과 값 변경을 직접 소유하는 상호작용 원자다. Checkbox 본체, Radio의 16px 원형과 Switch 본체가 이에 해당한다.
- `Indicator`는 Control 안에서 현재 값이나 상태를 보여 주는 비상호작용 시각 요소다. Radio의 중앙 원, Checkbox의 Check/Indeterminate 표시가 이에 해당한다. 상위 컴포넌트가 입력 동작을 소유해 별도 시각 base를 재사용하는 경우에도 값 변경과 Focus를 소유하지 않으면 Indicator로 부른다.
- `Field`는 Control과 Label을 기본으로 결합하고 Description, Leading/Trailing element 같은 Content를 선택적으로 포함하는 전체 조작 영역이다.
- `Container`는 Field 전체를 border, background 또는 다른 Surface로 감싼 선택 영역이다. 단순 Wrapper나 Popup을 Container로 부르지 않고 실제 시각 Surface 또는 명확한 구조 범위를 가질 때 사용한다.
- Radio와 Checkbox에는 카드형 `RadioContainer`·`CheckboxContainer` 변형을 두지 않는다. 짧은 Label을 밀도 있게 나열하는 폼은 `RadioField`·`CheckboxField`를 사용하고, 설명이나 이미지가 포함된 선택지를 넓은 Surface에서 비교하는 단일·다중 선택은 `SelectBox`가 소유한다.
- `Content container`는 Label, Description과 Leading/Trailing element를 묶는 내부 영역이다. Label 하나만 가리킬 때 Content라고 부르지 않는다.
- 별도 Wrapper가 실제로 존재하지 않으면 `Control container`처럼 역할명 뒤에 Container를 덧붙이지 않는다. Anatomy에서는 `Control` 또는 컴포넌트가 분명해야 할 때 `Radio control`, `Checkbox control`처럼 쓴다.
- 코드 export, Component 문서, Anatomy 범례, Property 제목과 Studio 예시에서 위 용어를 동일하게 사용한다. 원자 예시 제목은 실제 역할에 따라 `Control only`, `Indicator only`처럼 작성하고 임의의 동의어를 섞지 않는다.
- 문서에 적는 `Properties · *` 이름은 실제 Studio Section 이름과 일치시킨다. 이전 이름이나 존재하지 않는 Property 범주를 남기지 않는다.

### Playground 종속 컨트롤 표시

- 상위 Property가 활성화되어야 사용할 수 있는 하위 Playground control은 상위 control 바로 아래의 종속 그룹으로 묶는다.
- Playground control은 실제 public Property의 타입을 그대로 반영한다. Boolean Property만 Toggle을 사용하고 Enum은 선택 버튼, String/Number 값은 각각 Text/Number input을 사용한다. Label·Description처럼 UI를 설명하는 정적 텍스트 요소의 문구는 구조 검수용 Playground에서 편집하지 않고 `Label`, `Description` 같은 고정 문구를 사용한다. 해당 텍스트 요소가 Optional이면 `Show label` 같은 임의 문장 대신 실제 Property 이름인 `Label`, `Description` Boolean Toggle만 제공한다. 실제 문구를 입력하는 Text control은 콘텐츠 길이, 줄바꿈이나 언어별 문구 검수가 목적일 때만 제공한다. Input의 Value·Placeholder처럼 사용자가 실제로 입력하거나 제출하는 데이터는 이 정적 텍스트 규칙에서 제외하고 public Property 타입에 맞는 값 Control을 유지한다. 교체 가능한 ReactNode Slot은 `None / Icon / Image`처럼 검수할 콘텐츠 유형을 선택하며 실제 Property 이름인 `Leading element`, `Trailing element`를 label로 사용한다. 페이지마다 같은 Property를 Toggle, 문장형 label 또는 값 input으로 임의 변경하지 않는다. `Image` 유형은 공통 정사각 Avatar 샘플을 사용하며 페이지마다 임의 이미지를 만들지 않는다.
- 종속 그룹은 영역의 border를 사용하지 않는다. 왼쪽에 폭 2px의 곧은 `oe-border-primary` 막대를 별도 요소로 두고 `border-radius: 9999px`로 선의 위아래 끝만 둥글게 처리하며, 콘텐츠는 16px 들여쓴다.
- 단순한 시각 구분에는 이 표시를 사용하지 않는다. 상위값에 실제로 종속된 control에만 적용한다.

### Focus 선과 Ring

- Pointer 클릭으로 Control이 실제 DOM focus를 받을 수는 있지만, Focus 시각 표시는 `:focus-visible`을 기준으로 한다. 마우스 클릭만으로 Focus 선이나 ring을 표시하지 않고, 키보드 탐색처럼 사용자가 Focus 위치를 시각적으로 확인해야 할 때 표시한다.
- 기존 경계가 1px인 요소는 Focus에서 그 선을 `oe-focus-ring` 색으로 바꾸고, 경계 바로 바깥에 간격 없이 1px을 더해 총 2px 선으로 보이게 한다.
- 선택선처럼 기존 경계가 이미 2px인 요소는 두께, 위치와 레이아웃을 바꾸지 않고 같은 2px 선의 색만 `oe-focus-ring`으로 교체한다. 선택선과 별도 Focus ring을 중첩하지 않는다.
- 기존 경계와 분리된 Focus 표시가 필요한 요소는 기본 2px 간격을 두고 바깥에 2px ring을 그린다. 컴포넌트 구조상 별도 조정이 필요한 경우에만 간격을 2px보다 크게 할 수 있다.
- Focus 표시 방식은 위 세 유형 중 하나를 선택하며, 같은 요소에서 인접선과 분리 ring을 동시에 사용하지 않는다.

### Component 상세 페이지 순서

- 기본 정보 흐름은 `Overview → Playground → Anatomy → Properties → Examples/Usage → Property map` 순서다.
- Component 상세 페이지의 첫 번째 Tab 진입점은 `Playground로 바로 이동` skip link다. 이 링크는 `#studio-preview`를 focus target으로 사용하고, 다음 Tab에서 Playground의 첫 실제 Control로 이동해야 한다. 전역 Studio 설정을 건너뛰기 위해 양수 `tabIndex`로 순서를 재작성하지 않는다.
- 신규 컴포넌트의 첫 Studio 초안은 `Playground`만 만든다. Anatomy, Properties, Examples/Usage, Guidelines와 Property map은 Playground 검수 후 사용자가 명시적으로 다음 단계를 요청할 때 추가한다. 이 제한은 Studio 문서 범위에 대한 것이며 공용 package 구현, 접근성 및 자동 테스트는 처음부터 함께 검증한다.
- Anatomy는 컴포넌트의 구성 요소와 명칭을 먼저 이해시키는 영역이므로 Appearance, Style, Size, State, Elements 같은 Properties보다 앞에 둔다.
- 컴포넌트 특성상 존재하지 않는 섹션은 생략할 수 있지만, 존재하는 섹션의 상대적인 순서는 유지한다.
- 우측 `On this page` 항목도 실제 본문과 같은 순서를 사용한다.
- 문서에서 주요 Property로 언급한 Appearance, Style, Size, State, Layout, Element, Behavior 등은 각각 독립된 카드 또는 섹션에서 값과 차이를 확인할 수 있어야 한다.
- Appearance, State, Size, Elements처럼 확인된 Property 범주가 명확하면 각각을 `Properties · Appearance` 같은 독립된 바깥 Section 카드로 만든다. 구체적인 범주를 다시 더 큰 포괄 카드 하나에 묶지 않는다.
- Property Section의 직접 하위 제목과 카드는 해당 Property 값으로 구성한다. 예를 들어 Checkbox의 `Properties · Appearance`에서는 Rounded·Ghost가 직접 하위가 되며, 비교를 위한 Unchecked·Checked 상태는 각 Appearance 카드 내부에 배치한다. 비교 상태를 상위 그룹으로 만들어 Property 계층을 뒤집지 않는다.
- 같은 섹션 안에서 제목·설명·카드 묶음이 Surface 밖에 반복되는 StateGroup 같은 구조는 그룹 사이를 32px 수준으로 분리한다. 제목 없이 카드만 연속되는 Elements 구조에는 기본 카드 간격을 유지한다.
- Anatomy는 유형명·시각 예제·범례 전체를 Neutral 회색 Surface로 묶는다. Guidelines의 시각 예시 카드는 Neutral 회색 배경만 사용하고 바깥 border는 두지 않는다. 그 안에서 실제 화면 또는 컴포넌트를 감싸는 Container는 흰색 `oe-background-primary` Surface와 옅은 Neutral border를 사용한다. Playground, Properties, Layout과 State의 일반 예시는 흰색 Surface와 Neutral border를 유지한다. 카드 구조 자체는 별도 화면 체계 재설계 전까지 임의로 제거하거나 다른 배경형으로 바꾸지 않는다.
- Property map이나 Playground control에만 존재하고 별도 설명 카드가 없는 주요 Property를 발견하면 자동으로 카드를 만들지 말고 사용자에게 카드가 필요한지 묻는다.
- `name`, `value`, `form`처럼 native 연결을 위한 기술 속성까지 모두 시각 카드로 만들지는 않는다. 시각·구조·동작을 이해하는 데 독립 설명이 필요한 상위 Property를 카드 점검 대상으로 삼는다.

### Component 화면 확정 검수

- 사용자가 “스튜디오 화면 확정”, “페이지 확정” 또는 같은 의미로 요청하면 문서 구조, 실제 Props, Anatomy, Property별 설명 카드, State coverage, token, theme·locale·viewport, interaction, accessibility, 공용 package 소유 경계와 `pnpm check`를 함께 점검한다.
- 컴포넌트를 반복 조정하는 동안에는 개별 시각 수정마다 `docs/components/{component}.md`를 갱신하지 않는다. 사용자가 “확정할게”, “완료” 또는 같은 의미로 말하면 실제 공용 컴포넌트와 Studio 화면을 대조한 뒤 해당 Component MD의 Anatomy, Properties, State, Layout, Guidelines, Specification과 미정 사항을 한 번에 정리한다.
- 여러 컴포넌트에 즉시 적용되는 Studio 공통 규칙, Foundation 결정 또는 다음 작업자가 중간에 반드시 알아야 하는 충돌은 Component 확정 시점까지 미루지 않고 `AGENTS.md`, `docs/foundations/*` 또는 `docs/WORKING_CONTEXT.md`에 바로 기록한다.
- 확인된 구현·문서 불일치는 수정할 수 있지만, 누락된 Property 카드의 필요성이나 새로운 사용 정책처럼 판단이 필요한 내용은 모아서 사용자에게 질문한다.
- 화면 확정만으로 Candidate를 Stable로 승격하거나 commit·push하지 않는다. 각각 사용자의 명시적 요청 또는 별도 승격 검토가 필요하다.

### Anatomy swap 표시

- Studio의 Anatomy에서 `leadingElement`, `trailingElement` 또는 `swap`이라고 부르는 교체 가능 영역은 공통 `AnatomySwapSlot` 표시를 사용한다.
- 기본 표시는 1px Pink 점선, 4px radius와 옅은 Pink 배경이다. 영역 크기만 실제 Slot 규격에 맞게 조정할 수 있다.
- 이 표시는 Studio 문서에서 교체 가능한 Slot을 설명하기 위한 것이며 실제 제품 컴포넌트의 border나 background 스타일로 포함하지 않는다.
- Component 문서와 Anatomy 명칭에는 해당 영역의 Optional 여부를 함께 표시한다.

### Anatomy 번호와 범례

- Anatomy Preview에는 실제 컴포넌트만 표시하고 요소 이름을 컴포넌트 안에 넣지 않는다.
- 번호 마커는 실제 요소를 밀지 않도록 컴포넌트 바깥에 배치하고 1px `oe-border-primary` 안내선으로 대상을 연결한다.
- Text, Icon처럼 보이는 요소의 실제 클릭·터치 영역이 더 크더라도 번호선은 Hit area 중앙이 아니라 사용자가 화면에서 식별하는 글자 또는 아이콘의 시각 중심을 가리킨다. Container, Group, List 같은 묶음 영역만 별도 평행선으로 범위를 표시한다.
- Anatomy 유형명, 시각 예제와 번호별 요소명 범례는 하나의 Neutral 회색 Surface 안에서 `유형명 → 시각 예제 → 범례` 순서로 구성한다. 범례를 같은 색의 별도 블록이나 회색 Anatomy 영역 밖의 흰 배경에 분리하지 않는다. Optional은 요소 이름 뒤에 옅은 위계로 표시한다.
- 구조 설명이 더 필요하면 범례 아래 별도 텍스트 블록에 작성한다. 구조와 상태가 겹쳐 복잡해지면 Anatomy Preview를 둘 이상으로 분리한다.
- 기본 요소와 Optional 요소가 한 Preview에서 같은 대상을 가리키는 것처럼 보이면 `Basic anatomy`와 `Extended anatomy`로 분리한다. Basic에는 최소 구조만 표시하고 Extended에는 Basic 번호를 반복하지 않는다. 여러 텍스트 요소를 감싸는 Content container처럼 단일 Label과 구분하기 어려운 그룹 요소는 Extended에서 Container 평행선으로 범위를 표시한다.
- Anatomy와 구조 검수용 Playground의 콘텐츠는 제품 사례 문구 대신 `Label`, `Right Description`, `Value / Placeholder`처럼 실제 요소 명칭을 사용한다. 제품 맥락의 실제 문구는 Examples와 Usage에서 보여준다.

### Anatomy Container 표시

- Container 번호의 연결선은 실제 Container 내부로 들어가지 않는다.
- 실제 외곽선과 일정한 간격을 둔 평행선으로 Container 범위를 표시한다. 번호에서 시작한 연결선은 이 평행선에서 끝난다.
- 번호가 Container의 왼쪽이나 오른쪽에 있으면 외곽과 나란한 수직선을 사용하고, 위나 아래에 있으면 수평선을 사용한다.
- 평행선은 실제 Container의 높이 또는 너비 범위에 맞추되 외곽선과 붙이거나 겹치지 않는다.
- Group, List처럼 여러 하위 요소를 묶는 영역도 같은 규칙을 사용한다. 번호는 묶음 바깥에 두고, 연결선은 실제 콘텐츠로 들어가지 않은 채 영역 높이 또는 너비만큼 그린 평행선에서 끝낸다.
- `[` 또는 `]`처럼 끝이 꺾인 bracket 형태는 사용하지 않는다.

## 변경 원칙

- 사용자가 직전 제안에 `ㄱ` 또는 `ㄱㄱ`로 답하면 해당 제안에 동의하며 바로 반영하라는 요청으로 해석한다.
- 사용자의 명시적 디자인 판단을 문서와 코드에 함께 반영한다.
- 컴포넌트 작업 중 기존 token으로 설명되지 않는 색상 패턴을 발견하면 사용자에게 알리고 Candidate로 기록한다.
- Candidate는 실제 사용 위치, 해결하려는 역할, 임시 primitive 값, 기존 token으로 해결할 수 없는 이유를 포함한다.
- Candidate를 발견했다는 이유만으로 공용 semantic token이나 Stable token에 즉시 추가하지 않는다.
- 새 token은 한 번의 편의를 위해 추가하지 않는다. 같은 의미로 세 번 반복되거나 두 개 이상의 독립 컴포넌트에서 필요하면 승격을 검토한다.
- semantic token에 이미 alpha나 강조 위계가 포함되어 있으면 컴포넌트에서 임의 opacity를 중첩해 위계를 다시 바꾸지 않는다. 추가 감쇠가 필요하면 기존 token 선택이 맞는지 먼저 확인하고, 해결되지 않을 때만 별도 상태 또는 token Candidate로 검토한다.
- 이미지와 Color swatch처럼 콘텐츠 자체가 배경색을 갖는 값은 고정 Neutral border를 바깥에 두지 않고 내부 Black alpha layer를 중첩해 경계를 만든다. 정확한 alpha 강도와 semantic token은 실제 독립 용례가 반복될 때 확정한다.
- `outline | filled` Style을 제공하는 Form control은 공용 API와 Studio 검수 화면 모두 `outline`을 기본값으로 사용한다.
- 접근성, theme 또는 시스템 경계에 필요한 token은 첫 사용에도 추가할 수 있다.
- shadcn update를 oe에 자동 덮어쓰지 않는다. Experiment에서 차이를 검수한 뒤 선별적으로 반영한다.
- 고객 납품물은 특정 시점의 project snapshot이며 이후 ooee 변경과 자동 연결하지 않는다.

## 컴포넌트 상태 점검

컴포넌트 구현이나 상세 문서를 마무리하기 전에 다음을 반드시 대조한다.

1. 실제 Props와 기반 라이브러리에서 지원하는 상태를 전부 나열한다.
2. Default, 선택 상태, Hover, Pressed, Focus visible, Disabled, Read-only, Required, Invalid/Error, Loading과 조합 상태 중 실제 존재하는 항목을 확인한다.
3. 코드 구현, Studio 검수 예시, Component 문서 세 곳에 같은 상태가 반영됐는지 비교한다.
4. 구현됐지만 검수 화면에서 누락된 상태는 추가한다.
5. 일반적으로 있을 법하지만 현재 구현이나 정책에 없는 상태는 만들지 않고 `현재 정의 없음`으로 기록한다.
6. 상태 조합에서 색상이나 우선순위 판단이 필요한 경우 임의로 선택하지 않고 현재 확인된 내용과 충돌 지점을 사용자에게 보고한다.

Studio의 `Properties · State` 예시는 비교 대상의 value/state를 controlled 상태로 고정하되 Hover, Pressed, Focus visible, Popup 열림과 키보드 피드백은 실제로 확인할 수 있어야 한다. `pointer-events: none`, 전체 key event 차단 또는 `tabIndex=-1`로 상호작용을 막지 않는다. Disabled는 실제 disabled 동작을 유지하고, 상태 변화 자체를 보여 주는 것이 목적이면 Playground에서 별도로 검수한다.

선택 Control의 Read-only는 Enabled와 같은 색상과 키보드 Focus를 유지하지만 값 변경 가능성을 뜻하는 Hover 배경, Hover shadow와 Pressed 피드백은 제공하지 않는다. Disabled처럼 비활성 색상이나 `not-allowed` cursor를 사용하지 않으며 Pointer·Space·방향키로 값만 변경되지 않아야 한다.

완료 보고에는 누락 상태가 없는지 점검한 결과와, 남아 있는 미정 상태가 있으면 그 목록을 포함한다.

## 검증

코드 변경 후 최소한 다음을 실행한다. 이 명령은 lint, 공용 자산 test와 production build를 모두 포함한다.

```bash
pnpm check
```

인터랙션이나 반응형을 변경했다면 Studio의 실제 화면에서도 해당 동작을 검수한다.

## 여러 환경에서 이어서 작업할 때

- Git remote의 push된 commit만 다른 기기와 계정이 공유할 수 있는 상태로 간주한다. Codex 대화와 로컬 미커밋 변경에 의존하지 않는다.
- `main`은 항상 검사를 통과한 공식 원본으로 유지한다. 일반 변경은 별도 branch와 pull request를 거치며 GitHub `Quality` 검사가 성공한 뒤 합친다.
- 작업 시작 시 working tree가 깨끗한지 확인하고, 깨끗할 때만 현재 작업 branch를 `git pull --ff-only`로 최신화한다.
- 두 기기에서 같은 branch를 동시에 수정하지 않는다. 동시에 작업해야 하면 기기별 branch를 사용하고 한쪽에서 merge한 뒤 다른 쪽이 다시 pull한다.
- 의미 있는 구현·규칙·다음 작업이 바뀌면 관련 영역 문서와 `docs/WORKING_CONTEXT.md`를 최소한으로 갱신한다.
- `docs/WORKING_CONTEXT.md`는 changelog가 아니라 현재 상태 snapshot으로 유지한다. 갱신할 때 더 이상 현재 이해에 필요 없는 완료·과거 과정은 제거하거나 현재 상태로 대체하고, 현재 구현·진행 중인 사항·바로 다음 작업·유효한 주의사항만 남긴다. 장기 설계 결정은 해당 Foundation/Component 문서로 옮기며 Git history로 확인 가능한 단순 완료 기록은 누적하지 않는다.
- 사용자가 현재 작업의 commit/push를 요청하면 staging 전에 이번 작업과 대화에서 생긴 지속 가능한 결정이 repository에 반영됐는지 확인한다. 이전 대화를 보지 못한 다음 작업자가 잘못 판단하거나 이미 내린 중요한 결정을 되돌릴 수 있는 정보만 기록한다.
- 위 점검에서 누락을 발견하면 코드와 함께 적절한 기존 문서를 먼저 갱신한다: 현재 구현·다음 작업은 `docs/WORKING_CONTEXT.md`, 프로젝트 공통 규칙은 `AGENTS.md`, Foundation 결정은 `docs/foundations/*`, Component 결정은 `docs/components/*`를 사용한다. 사소한 구현 과정과 대화 전문은 기록하지 않는다.
- 기기를 바꾸기 전 `pnpm check`, diff 검토, commit과 push를 완료한다. commit/push 권한은 사용자의 명시적 요청을 따른다.
- secret 값, 계정 정보와 기기별 절대경로를 repository에 기록하지 않는다.
