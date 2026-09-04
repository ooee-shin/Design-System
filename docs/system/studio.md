# Studio 검수 기준

`apps/studio`는 공용 자산을 화면 맥락에서 구현하고 검수하는 애플리케이션이며 그 자체가 전달 대상 자산이다. 컴포넌트를 찾아보고 확인하는 표준 채널은 최종적으로 Storybook이 맡으며, Studio는 그 기반이 된다. 이 문서는 Studio 화면을 구성하는 기준이므로 Storybook으로 옮길 때도 같은 표기와 순서를 근거로 사용한다.

구조 용어는 [vocabulary.md](vocabulary.md), Focus 표시 규칙은 [interaction.md](interaction.md)를 따른다.

화면 예시에는 가능한 경우 다음 검수 컨트롤을 제공한다.

- Light/Dark
- 국문/영문/일어 콘텐츠와 typography
- 모바일/데스크톱 반응형
- 인터랙션과 상태
- 출처와 oe mapping 상태

컴포넌트 Anatomy의 연결선은 Light/Dark 모두 `oe-border-primary` 회색조를 사용한다. 연결선과 숫자 마커의 진한 배경은 서로 다른 역할로 분리하며, 연결선에 foreground 또는 black 직접값을 사용하지 않는다.

Studio 문서 설명은 국문을 유지한다. 언어를 선택하면 컴포넌트 Preview 안의 Label, Value, Placeholder, 제품 사례 문구, 접근 가능한 이름과 해당 범위의 `lang`을 함께 바꾼다. 구조 명칭이 아닌 실제 Component/Example 콘텐츠를 한 언어로 하드코딩하지 않는다. 전체 문서 번역은 국문 문서가 완료된 뒤 별도 작업으로 다룬다.

Component catalog의 title, description, 수정일, route와 Similar/Works with 관계는 공용 `component-registry`를 단일 원본으로 사용한다. 모든 Component route는 공용 상세 page shell을 사용하고, 각 Workbench는 우측 `On this page`와 registry 관계를 연결한다.

Component 상세 화면의 Guidelines 하위 주제 제목은 공용 `GuidelineTitle`을 사용한다. 제목 앞에는 Remix `RiBookOpenLine` 16px을 Tertiary foreground로 배치하고 제목은 14px Semibold, 아이콘과 제목 간격은 8px로 유지한다. 컴포넌트별 Workbench에서 같은 스타일을 다시 만들지 않는다.

Guidelines의 Target area 예시, Do/Don’t 비교, 제출 지연 예시와 불릿 목록은 공용 `component-guidelines` 구성요소를 사용한다. Checkbox와 Switch처럼 같은 사용 원칙을 설명하는 컴포넌트는 시각 구조와 정보 위계를 공유하고, 실제 컴포넌트와 문구만 각 목적에 맞게 바꾼다.

Target area를 설명할 때는 실제 컴포넌트를 바꾸지 않고 공용 `TargetArea` Studio 표시를 겹친다. 영역 전체를 점선이나 색면으로 둘러싸지 않고, 실제 최소 조작 높이 또는 Row 높이의 옆에 1px 직선과 양끝 캡을 둔 치수선 및 숫자 Label을 표시한다. 이 측정 표시는 실제 제품 컴포넌트 스타일에 포함하지 않는다.

Studio의 수치 측정 Annotation은 Violet 계열을 공통으로 사용한다. 대상은 width·height·min/max·Target area 같은 크기, padding·gap·inset 같은 내부/외부 간격, radius, font-size·line-height·letter-spacing처럼 수치로 측정하는 Typography 스펙이다. 숫자가 token으로 표현되어도 역할이 치수이면 같은 Violet 표시를 사용한다. Font family·weight 명칭, semantic color 값, 상태, Anatomy 번호와 Swap 영역은 치수 Annotation이 아니므로 Violet 규칙을 적용하지 않는다. 치수 숫자 Pill은 border 없이 옅은 Violet 배경과 진한 Violet 글자만 사용한다.


## 문서 화면

Studio는 `docs/system`의 문서를 `Docs` 메뉴에서 그대로 읽을 수 있게 표시한다. 저장소가 문서 원본을 소유하고 Studio는 표시만 하며, 별도 사본을 만들지 않는다.

- 컴포넌트 상세 페이지 하단에는 그 컴포넌트의 명세 문서를 함께 표시한다. 화면과 명세가 어긋나는지를 같은 화면에서 확인하는 것이 목적이다. 페이지 상단의 `명세 문서 보기`로 바로 이동한다.
- 문서 안의 상대 링크는 Studio route로 바꿔 표시한다. 문서끼리의 참조가 화면 밖으로 새지 않는다.
- 표는 본문을 가로로 밀지 않도록 표 안에서만 스크롤한다.
- 문서 본문 스타일은 Studio chrome이며 제품 컴포넌트 스타일에 포함하지 않는다.

## Playground 종속 컨트롤 표시

- 상위 Property가 활성화되어야 사용할 수 있는 하위 Playground control은 상위 control 바로 아래의 종속 그룹으로 묶는다.
- Playground control은 `Appearance → State → Content → Elements → Behavior` 순서의 그룹으로 묶고 각 그룹에 제목을 둔다. Appearance는 Style·Size·Shape·Layout처럼 시각을 결정하는 Property, State는 Disabled·Read only·Invalid처럼 조작 가능성과 유효성, Content는 값과 문구, Elements는 교체하거나 표시 여부를 정하는 요소, Behavior는 범위·단계·선택 방식처럼 동작을 정하는 Property다. 성격이 다른 Property를 사이에 끼우지 않는다. 값 Property 사이에 시각 Property가 들어가면 무엇을 조절하는 중인지 알기 어려워진다. Appearance에 Property가 많으면 `Style`, `Size`, `Layout`처럼 더 나눌 수 있으나 다섯 그룹의 순서는 유지한다.
- Playground control은 실제 public Property의 타입을 그대로 반영한다. Boolean Property만 Toggle을 사용하고 Enum은 선택 버튼, String/Number 값은 각각 Text/Number input을 사용한다. Label·Description처럼 UI를 설명하는 정적 텍스트 요소의 문구는 구조 검수용 Playground에서 편집하지 않고 `Label`, `Description` 같은 고정 문구를 사용한다. 해당 텍스트 요소가 Optional이면 `Show label` 같은 임의 문장 대신 실제 Property 이름인 `Label`, `Description` Boolean Toggle만 제공한다. 실제 문구를 입력하는 Text control은 콘텐츠 길이, 줄바꿈이나 언어별 문구 검수가 목적일 때만 제공한다. Input의 Value·Placeholder처럼 사용자가 실제로 입력하거나 제출하는 데이터는 이 정적 텍스트 규칙에서 제외하고 public Property 타입에 맞는 값 Control을 유지한다. 교체 가능한 ReactNode Slot은 `None / Icon / Image`처럼 검수할 콘텐츠 유형을 선택하며 실제 Property 이름인 `Leading element`, `Trailing element`를 label로 사용한다. 페이지마다 같은 Property를 Toggle, 문장형 label 또는 값 input으로 임의 변경하지 않는다. `Image` 유형은 공통 정사각 Avatar 샘플을 사용하며 페이지마다 임의 이미지를 만들지 않는다.
- 종속 그룹은 영역의 border를 사용하지 않는다. 왼쪽에 폭 2px의 곧은 `oe-border-primary` 막대를 별도 요소로 두고 `border-radius: 9999px`로 선의 위아래 끝만 둥글게 처리하며, 콘텐츠는 16px 들여쓴다.
- 단순한 시각 구분에는 이 표시를 사용하지 않는다. 상위값에 실제로 종속된 control에만 적용한다.


## Component 상세 페이지 순서

- 기본 정보 흐름은 `Overview → Playground → Anatomy → Properties → Examples/Usage → Property map` 순서다.
- Component 상세 페이지의 첫 번째 Tab 진입점은 `Playground로 바로 이동` skip link다. 이 링크는 `#studio-preview`를 focus target으로 사용하고, 다음 Tab에서 Playground의 첫 실제 Control로 이동해야 한다. 전역 Studio 설정을 건너뛰기 위해 양수 `tabIndex`로 순서를 재작성하지 않는다.
- 신규 컴포넌트의 첫 Studio 초안은 `Playground`만 만든다. Anatomy, Properties, Examples/Usage, Guidelines와 Property map은 Playground 검수 후 사용자가 명시적으로 다음 단계를 요청할 때 추가한다. 이 제한은 Studio 문서 범위에 대한 것이며 공용 package 구현, 접근성 및 자동 테스트는 처음부터 함께 검증한다.
- Anatomy는 컴포넌트의 구성 요소와 명칭을 먼저 이해시키는 영역이므로 Appearance, Style, Size, State, Elements 같은 Properties보다 앞에 둔다.
- 컴포넌트 특성상 존재하지 않는 섹션은 생략할 수 있지만, 존재하는 섹션의 상대적인 순서는 유지한다.
- 우측 `On this page` 항목도 실제 본문과 같은 순서를 사용한다.
- 제목 위계는 페이지 제목 `text-xl`, Section 제목 `text-lg`, Section 하위 그룹 제목 `text-sm`, 그룹 안 카드 라벨 `text-xs`를 사용한다. 그룹은 카드 묶음의 조건을, 카드 라벨은 그 한 칸이 무엇인지를 말하므로 두 층을 같은 크기로 쓰지 않는다. Guidelines 하위 주제 제목은 크기가 아니라 공용 `GuidelineTitle`의 아이콘으로 구분하므로 `text-sm`을 유지한다.
- 문서에서 주요 Property로 언급한 Appearance, Style, Size, State, Layout, Element, Behavior 등은 각각 독립된 카드 또는 섹션에서 값과 차이를 확인할 수 있어야 한다.
- Appearance, State, Size, Elements처럼 확인된 Property 범주가 명확하면 각각을 `Properties · Appearance` 같은 독립된 바깥 Section 카드로 만든다. 구체적인 범주를 다시 더 큰 포괄 카드 하나에 묶지 않는다.
- Property Section의 직접 하위 제목과 카드는 해당 Property 값으로 구성한다. 예를 들어 Checkbox의 `Properties · Appearance`에서는 Rounded·Ghost가 직접 하위가 되며, 비교를 위한 Unchecked·Checked 상태는 각 Appearance 카드 내부에 배치한다. 비교 상태를 상위 그룹으로 만들어 Property 계층을 뒤집지 않는다.
- 같은 섹션 안에서 제목·설명·카드 묶음이 Surface 밖에 반복되는 StateGroup 같은 구조는 그룹 사이를 32px 수준으로 분리한다. 제목 없이 카드만 연속되는 Elements 구조에는 기본 카드 간격을 유지한다.
- Anatomy는 유형명·시각 예제·범례 전체를 Neutral 회색 Surface로 묶는다. Guidelines의 시각 예시 카드는 Neutral 회색 배경만 사용하고 바깥 border는 두지 않는다. 그 안에서 실제 화면 또는 컴포넌트를 감싸는 Container는 흰색 `oe-background-primary` Surface와 옅은 Neutral border를 사용한다. Properties, Layout과 State의 일반 예시는 흰색 Surface와 Neutral border를 유지한다. Playground는 검수용 테스트 환경임을 드러내기 위해 Neutral 회색 Surface와 2px `oe-border-bold-primary` 외곽을 사용하고, 그 안에서 실제 컴포넌트를 두는 영역만 흰색 `oe-background-primary`를 사용한다. 카드 구조 자체는 별도 화면 체계 재설계 전까지 임의로 제거하거나 다른 배경형으로 바꾸지 않는다.
- Property map이나 Playground control에만 존재하고 별도 설명 카드가 없는 주요 Property를 발견하면 자동으로 카드를 만들지 말고 사용자에게 카드가 필요한지 묻는다.
- `name`, `value`, `form`처럼 native 연결을 위한 기술 속성까지 모두 시각 카드로 만들지는 않는다. 시각·구조·동작을 이해하는 데 독립 설명이 필요한 상위 Property를 카드 점검 대상으로 삼는다.

## Anatomy swap 표시

- Studio의 Anatomy에서 `leadingElement`, `trailingElement` 또는 `swap`이라고 부르는 교체 가능 영역은 공통 `AnatomySwapSlot` 표시를 사용한다.
- 기본 표시는 1px Pink 점선, 4px radius와 옅은 Pink 배경이다. 영역 크기만 실제 Slot 규격에 맞게 조정할 수 있다.
- 이 표시는 Studio 문서에서 교체 가능한 Slot을 설명하기 위한 것이며 실제 제품 컴포넌트의 border나 background 스타일로 포함하지 않는다.
- Component 문서와 Anatomy 명칭에는 해당 영역의 Optional 여부를 함께 표시한다.

## Anatomy 번호와 범례

- Anatomy Preview는 실제 컴포넌트를 그대로 사용하거나 정적 도식으로 그릴 수 있다. 그리는 경우에도 실제 컴포넌트와 다르게 보이면 안 되며 아이콘, 값, 선택 상태, 간격과 radius가 실제 렌더링과 일치해야 한다. 요소 이름을 컴포넌트 안에 넣지 않는다.
- 번호 마커는 실제 요소를 밀지 않도록 컴포넌트 바깥에 배치하고 1px `oe-border-primary` 안내선으로 대상을 연결한다.
- Text, Icon처럼 보이는 요소의 실제 클릭·터치 영역이 더 크더라도 번호선은 Hit area 중앙이 아니라 사용자가 화면에서 식별하는 글자 또는 아이콘의 시각 중심을 가리킨다. Container, Group, List 같은 묶음 영역만 별도 평행선으로 범위를 표시한다.
- Anatomy 유형명, 시각 예제와 번호별 요소명 범례는 하나의 Neutral 회색 Surface 안에서 `유형명 → 시각 예제 → 범례` 순서로 구성한다. 범례를 같은 색의 별도 블록이나 회색 Anatomy 영역 밖의 흰 배경에 분리하지 않는다. Optional은 요소 이름 뒤에 옅은 위계로 표시한다.
- 구조 설명이 더 필요하면 범례 아래 별도 텍스트 블록에 작성한다. 구조와 상태가 겹쳐 복잡해지면 Anatomy Preview를 둘 이상으로 분리한다.
- 기본 요소와 Optional 요소가 한 Preview에서 같은 대상을 가리키는 것처럼 보이면 `Basic anatomy`와 `Extended anatomy`로 분리한다. Basic에는 최소 구조만 표시하고 Extended에는 Basic 번호를 반복하지 않는다. 여러 텍스트 요소를 감싸는 Content container처럼 단일 Label과 구분하기 어려운 그룹 요소는 Extended에서 Container 평행선으로 범위를 표시한다.
- Anatomy와 구조 검수용 Playground의 콘텐츠는 제품 사례 문구 대신 `Label`, `Right Description`, `Value / Placeholder`처럼 실제 요소 명칭을 사용한다. 제품 맥락의 실제 문구는 Examples와 Usage에서 보여준다.

## Anatomy Container 표시

- Container 번호의 연결선은 실제 Container 내부로 들어가지 않는다.
- 실제 외곽선과 일정한 간격을 둔 평행선으로 Container 범위를 표시한다. 번호에서 시작한 연결선은 이 평행선에서 끝난다.
- 번호가 Container의 왼쪽이나 오른쪽에 있으면 외곽과 나란한 수직선을 사용하고, 위나 아래에 있으면 수평선을 사용한다.
- 평행선은 실제 Container의 높이 또는 너비 범위에 맞추되 외곽선과 붙이거나 겹치지 않는다.
- Group, List처럼 여러 하위 요소를 묶는 영역도 같은 규칙을 사용한다. 번호는 묶음 바깥에 두고, 연결선은 실제 콘텐츠로 들어가지 않은 채 영역 높이 또는 너비만큼 그린 평행선에서 끝낸다.
- `[` 또는 `]`처럼 끝이 꺾인 bracket 형태는 사용하지 않는다.

