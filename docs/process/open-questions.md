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
- **`packages/ui/src/badge.tsx`에 raw Tailwind 색상이 110곳 있다.** 공용 자산은 `oe` semantic token만 쓰는 것이 목표이므로 Badge 확정 전에 정규화한다.
- **`apps/studio/src/app/globals.css`에 shadcn의 sidebar·chart token이 남아 있다.** Studio 화면이 아직 사용하며 공용 자산은 참조하지 않는다.

## 컴포넌트

명세에서 걷어낸 미결 항목을 여기에 모은다. 확정되면 해당 `docs/system/components/*.md`로 옮긴다. 각 명세의 `현재 정의 없음` 항목과 함께 보며, 진행 중인 작업과 우선순위는 [working-context.md](working-context.md)를 본다.

- **Combobox의 2-depth** — 공용 API와 Filter 적용 정책을 정하지 않았다. 현재 Studio 예시는 구조와 선택 흐름만 검수한다.
- **Select Box의 API와 선택 표현** — 검수용 초안이며 문서 규칙으로 확정하지 않았다.
- **Select Box의 남은 정책** — Field 결합 API, 최대 선택 개수와 초과 피드백, 모바일에서의 열 수를 정하지 않았다.
- **Input Button의 민감한 값 표시** — 마스킹 장치를 두지 않았다. 지금은 민감한 정보를 키보드로 받는 경로만 있기 때문이다. 클릭으로 번호를 받는 구현이 생기면 그때 Value 마스킹을 검토한다.
- **Textarea Scrollbar의 Touch 표시** — thumb을 Hover와 Focus에서 보이게 했으나 Touch 기기에는 Hover가 없다. `scrollbar-color`를 투명으로 고정한 것이 브라우저가 스크롤 중에 잠깐 보여 주는 표시까지 막는지 실제 기기에서 확인해야 한다.
- **Filter Bar의 남은 정책** — Chip을 Filter로 쓰는 규칙을 Chip 페이지에서 다듬는 중이다. 초기화의 자리(지금은 맨 앞), Label에 적용된 값을 담는 표기 방식, 적용 시점(누르는 즉시인지 열리는 필터에서 확정이 필요한지)을 정하지 않았다. 이 셋이 정해지면 `filter-bar.tsx`로 분리하고 Chip 쪽에는 쓰임 한 줄과 링크만 남긴다.
- **Chip의 Disabled와 Color** — 제공하지 않기로 두었다. 필요한 사례가 확인되면 검토한다.
- **Number Input과 Slider의 경계** — 넓은 범위를 탐색하는 Slider 사용 정책을 공식 Usage 규칙으로 확정하지 않았다.
- **Input과 Textarea의 Filled 배경 전환** — Focus 선과 ring은 `has-[:focus-visible]`로 바꿨지만 Filled의 흰 배경 전환은 `focus-within`으로 두었다. `interaction.md:7`을 엄격히 보면 이것도 focus-visible 기준이어야 하는데, 마우스로 입력 중인 필드가 회색으로 남는 것이 어색하다. 나중에 검토한다.
- **Input의 Color input** — Color Picker 팝업이 완성되지 않아 예시 swatch에 클릭과 팝업 상호작용을 연결하지 않았다. 구현되면 직접 입력값과 팝업 선택값을 동기화하는 조합으로 검수한다.

## Token candidate

반복 용례가 확인되면 공용 semantic token으로 승격한다. 승격 기준은 [pipeline.md](pipeline.md)를 따르며, 발견했다는 이유만으로 추가하지 않는다.

- **Combobox 단일 선택 행 배경** — Brand alpha primitive `brand-alpha-08`
- **Select Box 선택 표현** — Brand alpha 조합
- **Color swatch 경계** — 안쪽에 합성한 Black alpha 10%의 1px inset. Input Button의 선택 전용 Color picker와 Input의 Color input이 함께 쓴다
