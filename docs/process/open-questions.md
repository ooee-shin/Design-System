# 열린 질문

화면을 만들며 검증해야 하는 항목이다. 확정되면 해당 `docs/system/` 문서로 옮긴다.

## Foundation

- 실제 Light/Dark 색상값
- brand 및 interactive token의 정확한 범위
- hover, pressed, selected token 구조
- background surface가 primary/secondary만으로 충분한지
- input border와 section border의 분리 필요성
- media context token의 필요성과 범위
- 상태별 overlay token의 실제 필요성
- component-specific token 도입 기준
- shadcn token별 자동·문맥·수동 변환 규칙
- **Dark에서 `oe-foreground-placeholder`가 `oe-foreground-tertiary`와 값이 같다.** 둘 다 `neutral-500`이라 Dark에서는 Placeholder가 일반 메타 정보보다 옅어지지 않는다. Light는 `tertiary` 500, `placeholder` 400으로 갈리므로 두 테마의 단계 수가 어긋나 있다. `2026-09-14`에 `oe-foreground-subtle`을 추가하며 발견했고, Placeholder 쪽 값을 옮길지는 실제 입력 화면에서 Dark를 보며 정한다.
- **typography Foundation 문서가 없다.** `docs/system/foundations/`에 `color.md`와 `icon.md`는 있는데 글자 크기와 줄 높이의 원본이 없다. `/foundations/typography` 화면이 코드에서 읽어 표시할 뿐이라 어떤 크기가 체계 안의 값인지 판단할 근거가 없다.

색상의 세부 미결 항목은 `docs/system/foundations/color.md`의 「아직 확정하지 않은 항목」과 「다음 검토 체크포인트」를 함께 본다.

## 현재 Provisional인 결정

- HCT tone에서 `brand-50~950`으로 가는 숫자 매핑
- Light/Dark brand semantic mapping
- 기본 ooee brand seed
- 대표 solid action token 이름
- Neutral 및 status palette 생성 방식

`/foundations/color`의 OE Semantic catalog와 코드의 mapping은 검토용 Provisional 구현이다. 화면에 표시된 값을 사용자 결정 없이 확정하거나 다른 컴포넌트에 일괄 적용하지 않는다.

## 구조상 알려진 한계

아래는 확인해서 알고 있는 항목이다. 이관 테스트에 막히지 않으므로 1차 범위 밖에 두었다.

- **`packages/patterns`와 `packages/tokens`에 자체 `tsconfig.json`과 `typecheck` script가 없다.** `pnpm -r typecheck`가 실제로는 `packages/ui`에서만 돈다. 두 패키지는 Studio 빌드에 얹혀서만 타입 검사되므로 단독 성립 여부를 확인할 수단이 없다.
- **`packages/patterns`에 자동 테스트가 없다.** 현재 테스트는 `packages/ui` 5개, `packages/tokens` 1개, `apps/studio` 2개다.
- **`apps/studio/src/app/globals.css`에 shadcn의 sidebar·chart token이 남아 있다.** Studio 화면이 아직 사용하며 공용 자산은 참조하지 않는다.
- **radius scale의 원본 문서가 없다.** `2026-09-08`에 값 자체는 `packages/tokens`로 옮겨 `RADII`가 단일 원본이 되었고 컨트롤은 `--radius-oe-control`을 공유한다. 컨트롤 기준은 `interaction.md`의 「공통 Control Radius」가 소유하지만, `sm`부터 `4xl`까지의 단계를 어느 자리에 무슨 기준으로 쓰는지는 `docs/system/foundations/`에 문서가 없다. typography와 같은 상태다.

## 컴포넌트

명세에서 걷어낸 미결 항목을 여기에 모은다. 확정되면 해당 `docs/system/components/*.md`로 옮긴다. 각 명세의 `현재 정의 없음` 항목과 함께 보며, 진행 중인 작업과 우선순위는 [working-context.md](working-context.md)를 본다.

- **Combobox의 2-depth** — 공용 API와 Filter 적용 정책을 정하지 않았다. 현재 Studio 예시는 구조와 선택 흐름만 검수한다.
- **Select Box의 API와 선택 표현** — 검수용 초안이며 문서 규칙으로 확정하지 않았다.
- **Select Box의 남은 정책** — Field 결합 API, 최대 선택 개수와 초과 피드백, 모바일에서의 열 수를 정하지 않았다.
- **Input Button의 민감한 값 표시** — 마스킹 장치를 두지 않았다. 지금은 민감한 정보를 키보드로 받는 경로만 있기 때문이다. 클릭으로 번호를 받는 구현이 생기면 그때 Value 마스킹을 검토한다.
- **Textarea Scrollbar의 Touch 표시** — thumb을 Hover와 Focus에서 보이게 했으나 Touch 기기에는 Hover가 없다. `scrollbar-color`를 투명으로 고정한 것이 브라우저가 스크롤 중에 잠깐 보여 주는 표시까지 막는지 실제 기기에서 확인해야 한다.
- **관리자 레이아웃에서 뽑은 네 초안** — `/screens/admin/layout`에서 Admin Header, Side Navigation, Page Header와 Tabs 넷을 뽑아 `candidates/`에 두고 Studio에 초안으로 올렸다. 명세와 상세 화면이 없고, 넷 다 아직 `oe` 토큰으로 정규화하지 않았다. 남은 것은 다음과 같다.
  - **Page Header의 설명이 아직 그려지지 않는다.** 제목 옆 아이콘만 세워 두었고 누르면 펼쳐지는 자리를 붙이지 않았다. 팝오버를 받아 두었다가 지웠으므로 붙일 때 다시 받는다.
  - **Tabs는 `underline` 한 모양뿐이다.** 아래 「Tab 컴포넌트」가 적어 둔 `filled`는 만들지 않았다.
  - **Admin Header의 Utility 넷이 컴포넌트 안에 박혀 있다.** 알림·설정·조직도·로그아웃이 어느 화면에서나 같아서 그렇게 두었는데, 시스템마다 달라지면 밖에서 받아야 한다.
  - **Page Header의 설명 아이콘이 버튼 색을 덮어쓴다.** `Button`의 ghost neutral이 주는 `neutral-800` 대신 화면에서 `oe-foreground-tertiary`를 얹었다. 「눌러도 되지만 먼저 읽힐 필요는 없는」 아이콘 버튼이 몇 군데 더 나오면 `Button`에 그 단계를 둘지 판단한다.
- **Tab 컴포넌트** — 지금 서비스에 밑줄 Tab과 검정 Filled 형태의 Tab이 따로 쓰이고 있고, 후자를 Chip으로 합칠지 검토했다. 합치지 않기로 했다. Tab은 항상 하나가 켜져 있고 끌 수 없는 위치 표시이며 `role="tab"`과 방향키 이동을 갖는다. Chip은 여러 개를 켜고 끌 수 있고 아무것도 켜지지 않은 상태가 기본이다. 한 컴포넌트에 담으면 Property 하나가 키보드 동작과 필수 속성까지 바꾼다. Tab을 별도 컴포넌트로 만들 때 `underline`과 `filled` 두 모양을 갖게 하고, 검정 Filled는 그쪽으로 옮긴다. Chip의 Active는 brand alpha를 유지한다.
- **Filter Bar의 남은 정책** — Chip을 Filter로 쓰는 규칙을 Chip 페이지에서 다듬는 중이다. 초기화의 자리(지금은 맨 앞), Label에 적용된 값을 담는 표기 방식, 적용 시점(누르는 즉시인지 열리는 필터에서 확정이 필요한지)을 정하지 않았다. 이 셋이 정해지면 `filter-bar.tsx`로 분리하고 Chip 쪽에는 쓰임 한 줄과 링크만 남긴다.
- **Chip의 Disabled와 Color** — 제공하지 않기로 두었다. 필요한 사례가 확인되면 검토한다.
- **Button 의 Dark `tonal` 배경** — Badge 는 `2026-09-11`에 Dark 의 `tonal` 배경을 불투명한 800 단계에서 300 의 20% 알파로 바꿨지만 Button 은 그대로 800 이다. 두 컴포넌트는 색의 단계 규칙을 공유하기로 해 두었으므로 지금은 그 약속이 한 자리에서 깨져 있다. Button 은 Hover 와 Pressed 가 800→700→600 으로 진해지는 사다리를 가지므로, 알파로 옮기려면 그 사다리를 알파의 단계로 다시 정해야 한다.
- **Light 의 `tonal` 배경이 옅은 Surface 와 겹친다** — Badge 의 Light `tonal` 배경은 불투명한 100 단계이고 `oe-background-secondary` 도 Light 에서 `neutral-100` 이라, 그 표면 위의 `neutral` tonal 은 대비 1.00 이다. Dark 를 알파로 바꾼 뒤로 Light 가 더 약한 쪽이 되었다. Light 도 알파로 옮길지, 그 자리에 `outlined` 를 쓰라는 안내로 둘지 정한다. 지금은 안내만 있다.
- **Number Input과 Slider의 경계** — 넓은 범위를 탐색하는 Slider 사용 정책을 공식 Usage 규칙으로 확정하지 않았다.
- **Input과 Textarea의 Filled 배경 전환** — Focus 선과 ring은 `has-[:focus-visible]`로 바꿨지만 Filled의 흰 배경 전환은 `focus-within`으로 두었다. `interaction.md:7`을 엄격히 보면 이것도 focus-visible 기준이어야 하는데, 마우스로 입력 중인 필드가 회색으로 남는 것이 어색하다. 나중에 검토한다.
- **Style과 Size 값의 이름이 컴포넌트마다 다르다** — 세 가지가 어긋나 있다. 첫째, 채움 스타일의 값 이름이 Badge에서 `fill`·`tonal`·`outlined`이고 Input·Textarea·Input Button에서 `filled`·`outline`이다. Button이 `fill`·`outline`·`ghost`를 쓰면서 세 번째 조합이 되었다. 둘째, Checkbox의 `shape`에 `ghost`가 들어 있다. `vocabulary.md`는 `shape`을 `Square`·`Rounded`·`Circle(Pill)` 세 모양으로 정의하는데 `ghost`는 모양이 아니라 채움 여부를 뜻하므로 `variant`가 소유해야 할 값이다. 셋째, 같은 Size 단계 이름이 서로 다른 값을 가리킨다. Badge의 `small`은 20px이고 Chip의 `small`은 32px이다. Badge가 공통 Control Height를 따르지 않아 prop 이름을 `size`로 갈라 두었지만 단계 이름이 겹치는 것은 그대로다.

이름을 하나로 맞추면 여러 컴포넌트의 공개 API가 함께 바뀌므로 1차 컴포넌트를 마친 뒤에 한 번에 처리한다. 모양 어휘 쪽은 이미 정리되어 있어서 `round`를 쓰는 곳은 없다. 너비 Layout은 `2026-09-09`에 `hug | fill | fixed` 한 축으로 정리했고 `interaction.md`의 「공통 너비 Layout」이 소유한다.
- **Input의 Color input** — Color Picker 팝업이 완성되지 않아 예시 swatch에 클릭과 팝업 상호작용을 연결하지 않았다. 구현되면 직접 입력값과 팝업 선택값을 동기화하는 조합으로 검수한다.

## Token candidate

반복 용례가 확인되면 공용 semantic token으로 승격한다. 승격 기준은 [pipeline.md](pipeline.md)를 따르며, 발견했다는 이유만으로 추가하지 않는다.

- **Combobox 단일 선택 행 배경** — Brand alpha primitive `brand-alpha-08`
- **Select Box 선택 표현** — Brand alpha 조합
- **엑셀 액션 버튼의 색** — Button의 `custom` tone이 쓰는 Microsoft Excel 브랜드 그린이다. 팔레트 단계 규칙에 들어오지 않고 Light와 Dark에서 값을 뒤집지 않으므로 `button.tsx`가 로컬 값으로 갖는다. 외부 서비스를 가리키는 색이 두 번째로 필요해질 때 그 색들을 함께 다루는 방식을 정한다.
- **즐겨찾기와 찜의 색** — ToggleButton의 `custom` tone이 쓰는 별의 노랑과 하트의 빨강이다. 팔레트 단계 규칙에 들어오지 않고 브랜드 seed를 바꿔도 함께 움직이면 안 되는 고정 색이므로 `toggle-button.tsx`가 로컬 값으로 갖는다. 엑셀 색과 성격이 같으며, 밖에서 굳어진 색이 세 번째로 필요해질 때 그 색들을 함께 다루는 방식을 정한다.
- **Color swatch 경계** — 안쪽에 합성한 Black alpha 10%의 1px inset. Input Button의 선택 전용 Color picker와 Input의 Color input이 함께 쓴다
