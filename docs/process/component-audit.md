# 컴포넌트 3중 대조 검수 결과

`2026-09-04`에 13개 컴포넌트의 명세 문서와 구현 코드와 Studio 검수 화면을 서로 대조한 결과다. 총 109건이며 폼 요소 10개가 84건, 후순위인 Chip·Badge·Message Bubble이 25건이다.

**이 문서는 일회성 작업 목록이다.** 고치는 작업이 끝나면 제거하고, 남길 결정은 해당 명세나 `docs/system/studio.md`로 옮긴다.

대조한 기준은 여섯 가지다. 명세의 Property가 구현에 있는지, 구현의 Property가 명세에 있는지, Anatomy 요소가 양쪽에 있는지, Behavior 규칙이 실제 동작과 같은지, 화면 구성이 `docs/system/studio.md` 기준을 따르는지, 명세에 과정 성격의 문장이 남아 있는지다.

## 확정한 정책

고치기 전에 정한 네 가지다. 개별 항목을 처리할 때 이 기준을 따른다.

1. **`className` 계열은 명세 Properties에서 뺀다.** 명세의 Properties는 시각과 동작을 결정하는 Property만 다룬다. 「모든 공용 컴포넌트는 `className`을 받고, 내부 요소를 따로 스타일링해야 하는 컴포넌트는 `<요소>ClassName` 형태의 Property를 갖는다」를 공통 규칙으로 한 번 적는다. 이름이 예측되지 않는 `containerClassName`, `indicatorClassName`, `thumbClassName`은 해당 명세에 한 줄로 남긴다.
2. **Property 이름은 코드를 원본으로 한다.** `variant`와 `controlSize`로 통일하고, 사람이 읽을 범주 이름은 섹션 제목으로 남긴다. 에이전트가 명세만 보고 코드를 생성하는 것이 목표이므로 prop 이름이 드러나야 한다.
3. **구현 경로는 남기고 검수 화면 경로는 뺀다.** 문서 제목 아래 메타 한 줄로 분리해 본문이 「이 컴포넌트가 무엇인가」로 시작하게 한다. 유래 서술은 삭제하고, 진행 상태는 삭제하거나 `open-questions.md`로 옮기며, Studio 도구 설명은 삭제한다.
4. **Anatomy 요소 명칭은 `docs/system/vocabulary.md`를 원본으로 한다.** 거기에 없는 이름이 필요하면 먼저 `vocabulary.md`에 추가한다.

## 작업 순서

**진행 상황.** 1단계를 폼 요소 10개에서 끝냈다. 첫 항목인 워크벤치 중복 제목 제거와 제목 위계 통일은 폼 요소 10개에서 끝냈다. Badge와 Chip은 후순위라 중복 제목이 남아 있다. 워크벤치 머리에 있던 국문 설명은 registry 로 올렸고, 읽는 곳이 없어진 `description` 키가 워크벤치 여섯 곳에 남아 있어 각 컴포넌트를 손볼 때 함께 걷어낸다.

두 번째 항목인 명세 첫머리 정리도 끝냈다. 구현 경로를 제목 아래 메타 한 줄로 옮기고, 유래와 진행 상태와 Studio 도구 설명을 걷어냈다. 정보가 살아 있는 미결 항목 여덟 건은 [open-questions.md](open-questions.md)의 「컴포넌트」와 「Token candidate」로 옮겼다. `radio.md`의 Guidelines 문단은 실제 규칙과 Studio 예시 서술이 얽혀 있어 Radio 개별 순회로 넘겼다.

2단계 중 두 가지를 끝냈다. `className` 계열은 `docs/system/README.md`의 공통 규칙으로 한 번 적고, 이름이 예측되지 않는 `containerClassName`·`indicatorClassName`·`radioClassName`·`checkboxClassName`·`switchClassName`·`thumbClassName`만 해당 명세에 한 줄로 남겼다. Property 이름은 `variant`와 `controlSize`로 통일하고 범주는 괄호로 붙였으며, 명세에 없던 Property 열여덟 개를 더했다. Anatomy 명칭 통일은 `Popup`과 `Content container`를 `vocabulary.md`에 어떻게 정의할지 정해야 해서 남겨 두었다.

3단계 중 둘을 끝냈다. Input과 Textarea의 Focus 선과 ring을 `focus-within`에서 `has-[:focus-visible]`로 바꿨다. Select Box가 이미 같은 방식을 쓰고 회귀 검사까지 갖고 있어 그 선례를 따랐으며, `packages/ui/src/input.test.tsx`에 같은 검사를 더했다. Input Button은 Input의 컨테이너 스타일을 공유하므로 함께 고쳐졌다. Filled의 배경 전환은 선이나 ring이 아니라 이번 범위에서 제외했다. Studio의 State 예시에서 `tabIndex=-1`도 걷어냈다.

Switch의 터치 영역은 Small에만 넓힌 target을 두는 것이 맞다는 판단이라 코드가 아니라 `switch.md`를 고쳤다. MultiSelect의 Leading element는 아직 정하지 않았다.

공통 F를 처리했다. `Show leading element` Boolean Toggle을 쓰던 곳이 검수 보고의 두 곳이 아니라 세 곳이었다. Select와 Input Button을 공용 `PlaygroundElementControl`로 바꿨고 Chip은 후순위로 남겼다. Select의 `fixedWidth` 종속 표시도 공용 `DependentControlGroup`으로 바꿔 공통 D의 절반을 처리했다. Textarea의 종속 표시가 남아 있다.

Anatomy의 Slot 표시는 문제가 없었다. `studio.md:66-68`이 핑크 점선 `AnatomySwapSlot`을 정하고 있고 폼 요소 워크벤치가 이미 그것을 쓴다. Playground는 같은 문서 42줄이 `None / Icon / Image` 유형 선택으로 따로 정하고 있어 두 자리의 규칙이 다르다.

공통 F는 폼 요소에서 끝냈다. Select와 Input Button과 Input이 공용 `PlaygroundElementControl`을 쓴다. Input은 자체 `ElementControl`과 `PlaygroundIconGraphic`을 갖고 있어 함께 걷어냈다. Switch·Radio·Checkbox·Combobox·Number Input·Textarea는 Playground에 교체 Slot control이 없어 해당하지 않는다. Chip은 후순위다.

공통 D와 E도 끝냈다. Select의 `fixedWidth`와 Textarea의 Auto size 종속 control이 공용 `DependentControlGroup`을 쓰고, Input과 Number Input에 `Properties · Layout` 섹션을 넣었다. Switch의 `Elements`는 `label`이 필수라 비교할 값이 없어 남겨 두었다.

남아 있던 판단 항목 다섯 개를 처리했다. Radio의 Indicator 색은 코드가 맞고 명세가 부정확해 명세를 고쳤다. Select의 Option 여백을 `controlSize`에 따라 정해 Trigger와 Leading 열 시작점을 맞췄다. Select Playground의 `Show selected value` Boolean Toggle을 `value` 값 선택으로 바꿨다. Radio의 `Properties · Elements`에서 State와 중복인 카드 두 개를 걷어내 계층과 상호작용 문제를 함께 풀었다. Combobox의 `Properties · Selection`을 `Properties · Selected display`와 `Examples`로 나누고 Playground와 중복인 Single 카드를 지웠다.

Input Button의 Anatomy 도식에 Prefix와 Suffix를 그리고 마커를 여섯 개로 늘렸다. 좌표는 기존 마커 두 개가 계산과 일치하는 것을 확인한 뒤 잡았으므로 화면에서 연결선 위치를 한 번 봐야 한다.

Input의 Anatomy에서도 같은 규칙 위반 두 건을 함께 고쳤다. 요소 이름 `Input field`를 컴포넌트 안에 렌더링하던 것과, 교체 가능 영역에 공용 `AnatomySwapSlot` 대신 실제 아이콘을 쓰던 것이다. 검수 보고가 잡지 못한 항목이다.

폼 요소 10개의 검수는 이것으로 끝났다. 후순위인 Chip·Badge·Message Bubble 25건은 지시가 있을 때 시작한다.

1. **판단이 필요 없는 일괄 작업.** 워크벤치 10개의 중복 `h2` 제거와 제목 위계 통일, 명세 10개의 첫머리 정형 문장 정리. 위계를 먼저 잡아야 이후 개별 화면 수정에서 다시 건드리지 않는다.
2. **정책 적용 일괄 작업.** `className` 계열 이동, Property 이름 통일, Anatomy 명칭 통일.
3. **동작 불일치 4건.** Focus 기준, Switch 터치 영역, MultiSelect Leading element, `tabIndex=-1`. Focus는 `input.tsx`의 공유 스타일을 바꿔 Input과 Input Button에 동시에 영향을 주므로 시각 회귀를 화면에서 확인해야 한다.
4. **나머지 개별 항목과 후순위 3개.**

## 공통 문제

### A. 워크벤치가 자기 제목을 갖고 있어서 위계가 어긋난다 (10/10)

10개 전부에 `<h2>컴포넌트 이름</h2>`이 `text-lg`로 있고 셸의 `<h1>`(`apps/studio/src/components/component-detail-page.tsx:24`, `text-xl`)과 중복이다. 워크벤치가 자기 제목을 기준으로 아래 위계를 다시 짜서 기준과 갈렸다. 기준은 `docs/system/studio.md:55`다.

| 컴포넌트 | Section 제목 (기준 `text-lg`) | 하위 카드 (기준 `text-sm`) |
| --- | --- | --- |
| Switch | `text-sm` | 없음 |
| Radio | `text-lg` | `text-xs` |
| Checkbox | `text-lg` | `text-xs` |
| Combobox | `text-sm` | 없음 |
| Select | `text-sm` | `text-xs` |
| Select Box | `text-xl` | 없음 |
| Input | `text-sm` | `text-xs` |
| Input Button | `text-sm` | `text-xs` |
| Number Input | `text-sm` | `text-xs` |
| Textarea | `text-sm` | 없음 |

`working-context.md`의 「13개 워크벤치가 registry와 별도로 가진 제목·설명」과 같은 뿌리다. 중복 `h2`를 걷어내고 위계를 셸 기준으로 다시 잡으면 크기 문제까지 함께 해결된다.

### B. 명세에 과정 성격의 문장이 남아 있다 (10/10)

세 종류이며 컴포넌트마다 두 곳에서 여덟 곳 이상까지 있다. 특히 「실제 구현 원본은 `packages/ui/src/…`, 검수 화면은 `/components/…`이다」가 10개 전부의 첫머리에 같은 형태로 있어 일괄 처리할 수 있다. 컴포넌트별 위치는 아래 상세에 적었다.

### C. 구현에만 있고 명세에 없는 Property (10/10)

두 갈래로 나뉜다. `className` 계열은 정책 1번으로 처리하고, 아래는 실제로 빠진 것이다.

- Select: 필수 `ariaLabel` — `packages/ui/src/select.tsx:38`
- Select Box: 필수 `ariaLabel` — `packages/ui/src/select-box.tsx:25`
- Combobox: `options`, `defaultValue`, `onValueChange`, `placeholder`, `searchPlaceholder`, `emptyMessage`, `ariaLabel`, `name` — `packages/ui/src/combobox.tsx:20-33`
- Number Input: `decreaseLabel`, `increaseLabel`, `decreaseTooltip`, `increaseTooltip`, `onValueChange`, `onLimitReached` — `packages/ui/src/number-input.tsx:34-41`
- Switch: `uncheckedValue` (Base UI `SwitchRoot.Props` 상속) — `packages/ui/src/switch.tsx:8`
- Checkbox: `checkboxClassName` — `packages/ui/src/checkbox.tsx:61`
- Radio: `className`, `indicatorClassName`, `radioClassName` — `packages/ui/src/radio.tsx:9-23`
- Input: `containerClassName` — `packages/ui/src/input.tsx:38`
- Textarea: `containerClassName` — `packages/ui/src/textarea.tsx:26`

### D. Playground 종속 control에 규정된 시각 표시가 없다

기준은 좌측 2px `oe-border-primary` 막대와 16px 들여쓰기다 — `docs/system/studio.md:41`, `:43`.

- Select의 `fixedWidth` — `apps/studio/src/components/candidates/select-workbench.tsx:226`
- Textarea의 Resize·Height — `apps/studio/src/components/candidates/textarea-workbench.tsx:66` (opacity와 pointer-events만 변경)

### E. 주요 Property에 독립 설명 카드가 없다

기준은 `docs/system/studio.md:56`이다.

- Input의 `Layout` — `apps/studio/src/components/candidates/input-workbench.tsx:43-54`
- Number Input의 `Layout` — `apps/studio/src/components/candidates/number-input-workbench.tsx:30-41`
- Switch의 `Elements` — `apps/studio/src/components/candidates/switch-workbench.tsx:14-23`

### F. 교체 Slot control이 공용 규칙과 다르다

기준은 label에 실제 Property 이름을 쓰고 `None / Icon / Image` 유형을 선택하게 하는 것이다 — `docs/system/studio.md:42`.

- Input: `Show leading element` Boolean Toggle과 아이콘 전용 `<select>`를 자체 구현했고 공용 `PlaygroundElementControl`을 쓰지 않는다 — `apps/studio/src/components/candidates/input-workbench.tsx:280-283`
- Chip: `Show leading element` — `apps/studio/src/components/candidates/chip-workbench.tsx:33`

### G. Anatomy 요소 명칭이 명세와 화면에서 갈린다

- Select: 명세 `Container`(`docs/system/components/select.md:16`) 대 화면 `Trigger container`(`apps/studio/src/components/candidates/select-workbench.tsx:370`)
- Combobox: 명세 `Select trigger container`·`Popup`(`docs/system/components/combobox.md:7`, `:10`) 대 화면 `Trigger container`·`Content container`(`apps/studio/src/components/candidates/combobox-workbench.tsx:87`, `:117`)

## 폼 요소 상세

### Switch (5건)

1. Medium·Large의 터치 영역이 시각 크기와 같다. 명세는 「실제 pointer·touch target은 이 시각 크기와 분리해 더 크게 확보한다」(`switch.md:30`)고 정했으나 구현은 Control 높이와 `min-h`가 동일하다(`switch.tsx:22-23`, `:34-35`). Small에만 적용되어 있다.
2. `uncheckedValue`가 명세에 없다. 공통 C 참고.
3. `Elements` Property에 독립 Section이 없다. 공통 E 참고.
4. 자산 유래와 검수 화면 경로 — `switch.md:3`
5. Studio `Structure map` 표시 방식 설명 — `switch.md:20`

Anatomy와 Behavior는 불일치가 없었다.

### Radio (12건)

1. `className`, `indicatorClassName`, `radioClassName`이 명세에 없다 — `radio.tsx:9-23`
2. Disabled Checked Indicator 토큰이 명세와 다르다. 명세는 Checked와 Disabled Checked를 모두 「흰 Indicator」로 서술하나(`radio.md:48`) 구현은 `oe-background-primary`와 `oe-foreground-inverse`를 각각 쓴다(`radio.tsx:49-50`).
3. `Properties · Elements` 예시가 직접 선택 가능하다고 했으나(`radio.md:56`) `StaticField`의 no-op `onValueChange`로 막혀 있다(`radio-indicator-workbench.tsx:245`).
4. `ThemeOptionCard`의 Radio·Label 행에 명세가 요구한 왼쪽 4px 여백이 없다 — `radio.md:60` 대 `radio-indicator-workbench.tsx:256-259`
5. 하위 카드 제목이 `text-xs`와 `text-[11px]`이다. 공통 A 참고.
6. `Properties · Elements`가 비교 상태를 Property 값 카드와 같은 층위에 둔다 — `studio.md:58` 대 `radio-indicator-workbench.tsx:118-131`
7~12. 과정 문장 6곳 — `radio.md:3`(유래), `:24`·`:38`·`:40`(Studio 도구), `:50`·`:69`(진행 상태)

Properties 존재 여부와 Anatomy는 불일치가 없었다.

### Checkbox (8건)

1. 명세는 `shape`에 `square | rounded | ghost`를 적었으나(`checkbox.md:42`) 구현은 `appearance`이고 `square` 값 자체가 없다(`checkbox.tsx:85`, `:17-24`, `:30-37`). `working-context.md` 7번 작업과 같다.
2. `indeterminate` 설명이 없는 `Square`를 전제로 쓰여 있다 — `checkbox.md:106` 대 `checkbox.tsx:89`
3. `checkboxClassName`이 명세에 없다 — `checkbox.tsx:61`
4. 명세가 「검수를 완료했다」면서 `Layout`에 별도 카드를 두지 않는다고 했으나 화면에 `Layout` Section이 독립으로 있다 — `checkbox.md:122` 대 `checkbox-workbench.tsx:27`, `:172`
5. 하위 카드 제목이 `text-xs`와 `text-[11px]`이다. 공통 A 참고.
6. StateGroup 사이 간격이 기준 32px과 다르게 `mt-5`, 즉 20px이다 — `studio.md:59` 대 `checkbox-workbench.tsx:291`
7. 자산 유래 — `checkbox.md:3`
8. Studio 검수 도구 설명 8곳 — `checkbox.md:24`, `:51`, `:57`, `:59`, `:65`, `:67`, `:82-90`, `:108`

Anatomy는 불일치가 없었다.

### Combobox (10건)

1. `options`, `defaultValue`, `onValueChange`, `placeholder`, `searchPlaceholder`, `emptyMessage`, `ariaLabel`, `name`, `className`이 명세에 없다 — `combobox.tsx:20-33`
2. Anatomy 명칭이 갈린다. 공통 G 참고.
3. 2-depth 검수 예시의 `전체` 버튼에 Hover 배경 중첩 금지 규칙이 적용되지 않았다 — `combobox.md:47` 대 `combobox-workbench.tsx:183`. Popup 쪽은 조건 분기가 있다(`combobox.tsx:175`).
4. Property map이 실제로 쓰이는 `selectedSummaryLabel`을 누락한다 — `combobox.md:28` 대 `combobox-workbench.tsx:140`(사용은 `:68`)
5. `Properties · Selection` 안에 컴포넌트 변형과 Property 값과 사용 예시가 같은 층위로 섞여 있고 별도 Examples/Usage 섹션이 없다 — `studio.md:49`·`:58` 대 `combobox-workbench.tsx:136`
6~10. 과정 문장 5곳 — `combobox.md:3`(유래와 도구), `:48`(token candidate 진행 상태), `:62`(도구), `:66`(진행 상태), `:68`(도구)

Properties 값과 기본값은 불일치가 없었다.

### Select (9건)

1. 필수 `ariaLabel`이 명세에 없다 — `select.tsx:38`
2. Anatomy 1번 요소 명칭이 갈린다. 공통 G 참고.
3. MultiSelect에서 선택이 둘 이상이면 대표값의 Leading element를 버리고 fallback만 쓴다 — `select.md:82` 대 `select.tsx:187`
4. Leading 열 시작점이 크기에 따라 어긋난다. Trigger는 `small` 10px, `regular`·`large` 12px, `xlarge` 16px(`selection-trigger.ts:12-15`)인데 Option은 12px 고정(`select.tsx:114`, `:223`)이다 — `select.md:81`
5. `fixedWidth` control에 종속 표시가 없다. 공통 D 참고.
6. `value` control이 실제 값 Control이 아니라 문장형 Boolean Toggle이다 — `studio.md:42` 대 `select-workbench.tsx:230`
7~9. 과정 문장 3곳 — `select.md:3`(유래), `:92`(Studio Playground 데이터 설명), `:115-123`(현재 정의하지 않은 항목)

Properties와 Content height, Selection display는 불일치가 없었다.

### Select Box (7건)

1. 같은 요소를 명세 내부에서 `Title`과 `Label`로 갈라 부른다 — `select-box.md:28`·`select-box.tsx:31` 대 `select-box.md:35`
2. 필수 `ariaLabel`이 명세에 없고, 명세는 Label 소유권을 Field에 둔다 — `select-box.md:13` 대 `select-box.tsx:25`
3. 항목 단위 `disabled`가 명세와 화면 어디에도 없다 — `select-box.tsx:34`, `:135`
4. Trailing element 허용 값이 `selectionMode`에 종속되지 않고 런타임에 조용히 대체된다 — `select-box.md:28` 대 `select-box.tsx:10`, `:66-70`
5. 페이지 제목과 Section 제목 크기가 뒤바뀌어 있다. 공통 A 참고.
6. Anatomy 도식이 명세의 고정 높이 없음과 좌우 16px·상하 12px 여백 규칙과 다르게 `min-h-24`와 `p-4`를 쓴다 — `select-box.md:42` 대 `select-box-workbench.tsx:114`
7. Anatomy 도식의 border와 배경 토큰이 실제 구현과 다르다 — `studio.md:73` 대 `select-box.tsx:165`와 `select-box-workbench.tsx:114`

과정 문장은 `select-box.md:3`(유래), `:32`·`:34`(도구), `:36`·`:37`·`:50-53`(진행 상태)에 있다.

### Input (12건)

1. Prefix·Suffix를 명세는 「텍스트」로, 구현은 `ReactNode`로 다룬다 — `input.md:21`·`:24` 대 `input.tsx:40-41`
2. `containerClassName`이 명세에 없다 — `input.tsx:38`
3. Clear button의 「값이 있을 때만」 조건을 컴포넌트가 강제하지 않고 호출부에 위임한다 — `input.md:23` 대 `input.tsx:87-90`
4. State 비교 예시가 명세가 금지한 `tabIndex=-1`을 쓴다 — `input.md:73` 대 `input-workbench.tsx:163-164`
5. `Layout` Property에 독립 카드가 없다. 공통 E 참고.
6. 교체 Slot control이 공용 규칙과 다르다. 공통 F 참고.
7~12. 과정 문장 6곳 — `input.md:3`·`:81`·`:83`(진행 상태), `:5`(유래), `:7`·`:9`(도구)

Anatomy는 불일치가 없었다.

### Input Button (7건)

1. 명세는 Property를 `Style`·`Size`로 적고 구현은 `variant`·`controlSize`다 — `input-button.md:30-31` 대 `input-button.tsx:23-24`
2. 명세 Anatomy 순서에 있는 Prefix·Suffix가 화면 도식과 범례에 없다 — `input-button.md:24` 대 `input-button-workbench.tsx:158`
3. `prefix`·`suffix`가 독립 카드 없이 Property map 텍스트로만 있다 — `input-button.md:34` 대 `input-button-workbench.tsx:134`
   범례에 두 항목만 더하면 도식의 번호 마커가 넷인데 범례가 여섯이 되어 더 어긋난다. 도식이 Prefix와 Suffix를 그리지 않으므로 절대 좌표를 다시 잡는 작업이 함께 필요하다.
4. Focus 표시가 `focus-within`이다. `docs/system/interaction.md:7`은 `:focus-visible`을 기준으로 정했다 — `input.tsx:9`를 공유(`input-button.tsx:52`). 같은 저장소의 `selection-trigger.ts:4`는 `focus-visible` 기반 변형을 별도로 갖고 있다.
5. Color swatch 경계 서술이 실제 값 표기와 다르다 — `input-button.md:50` 대 `apps/studio/src/components/color-swatch.tsx:6`
6. 진행 상태 — `input-button.md:3`
7. 유래와 도구 — `input-button.md:7`

Properties 값과 Anatomy 4요소, Behavior는 불일치가 없었다.

### Number Input (7건)

1. `decreaseLabel`, `increaseLabel`, `decreaseTooltip`, `increaseTooltip`, `onValueChange`, `onLimitReached`가 명세 Properties에 없다 — `number-input.tsx:34-41`
2. `Layout` Property에 독립 카드가 없다. 공통 E 참고.
3. Section 제목이 `text-sm`, 하위 카드가 `text-xs`, Example 라벨이 `text-[11px]`이다. 공통 A 참고.
4. 자산 유래 — `number-input.md:3`
5. 도구 — `number-input.md:5`
6. Studio Playground 동작이 Behavior 문단에 섞여 있다 — `number-input.md:42` 대 `number-input-workbench.tsx:102`
7. 진행 상태 — `number-input.md:57`

Properties 13항목과 Anatomy 6요소, Behavior는 불일치가 없었다.

### Textarea (7건)

1. 명세는 Layout 선택 Property를 제공하지 않는다고 했으나 Property map이 `layout`을 정식 Property처럼 나열한다 — `textarea.md:21-22` 대 `textarea-workbench.tsx:111`
2. Anatomy 도식이 요소 이름을 컴포넌트 안에 직접 렌더링한다 — `studio.md:73` 대 `textarea-workbench.tsx:136-138`
3. 종속 control에 좌측 막대와 들여쓰기가 없다. 공통 D 참고.
4. `containerClassName`이 명세에 없다 — `textarea.tsx:26`
5. 구현 경로와 검수 화면 경로 — `textarea.md:3`
6. Studio 표시 방식 지시 — `textarea.md:85`
7. 상세 페이지 내비게이션 UI 설명 — `textarea.md:87`

Properties 값과 Specification 수치, Anatomy는 불일치가 없었다.

## 후순위 상세

### Chip (7건)

1. `className`이 명세에 없다 — `chip.tsx:9`
2. Label type의 `ariaLabel`이 명세에 없다 — `chip.tsx:12-16`
3. Label 요소의 필수·선택 표기가 갈린다. 명세는 「Label type에서 필수」(`chip.md:9`), 화면 범례는 `optional: true`(`chip-workbench.tsx:38`)다.
4. Property map이 Examples보다 앞에 있다 — `studio.md:49` 대 `chip-workbench.tsx:15`, `:45-46`
5. 교체 Slot control이 공용 규칙과 다르다. 공통 F 참고.
6. 구현 경로와 검수 화면 경로 — `chip.md:3`
7. 진행 상태 — `chip.md:19`

Properties와 Behavior는 불일치가 없었다.

### Badge (10건)

1. 명세는 `accent` tone을 「현재 fill 사례에 사용한다」(`badge.md:44`)고 했으나 화면의 fill 예시에 `accent`가 없다 — `badge-workbench.tsx:144`
2. `className`이 명세에 없다 — `badge.tsx:11-13`
3. 화면 Anatomy가 명세에 없는 `Container` 요소명을 도입한다 — `badge.md:15` 대 `badge-workbench.tsx:138`
4. 명세는 `Chip`을 미래형으로 언급하나 구현의 기본 variant 판별자가 이미 `"chip"`이다 — `badge.md:52` 대 `badge.tsx:15-16`
5. 명세가 나열한 섹션 목록과 실제 화면 섹션이 다르다 — `badge.md:15` 대 `badge-workbench.tsx:56`, `:90`, `:94`
6. `badgeSections`에 본문에 있는 `Overview`와 `Future extension`이 빠져 있다 — `studio.md:54` 대 `badge-workbench.tsx:13`
7. Dot Badge·Number Badge 탭에 Playground가 없다 — `studio.md:49` 대 `badge-workbench.tsx:14`
8. 자산 유래 — `badge.md:5`
9. 도구 설명과 「Studio 정보 구조」 절 전체 — `badge.md:3`, `:7-15`
10. 진행 상태와 작업 절차 설명 — `badge.md:61`

제목 위계는 셸까지 확인한 결과 기준과 일치했다.

### Message Bubble (8건)

1. `unreadRecipientLabel`, `unreadMessageLabel`, `showTime`이 명세에 없다 — `message-bubble.tsx:53`, `:55`, `:62`
2. `outgoingSenderDescription`이 명세에 없고, 명세가 말한 「관리자 icon」과 실제 `Info` 아이콘의 동작 조건이 다르다 — `message-bubble.md:35` 대 `message-bubble.tsx:64`, `:167`, `:206-221`
3. 명세는 언어를 `KO/EN` 둘로 적었으나(`message-bubble.md:9`) 구현은 셋을 지원하고 `studio.md:10`도 셋으로 정한다 — `message-bubble-workbench.tsx:28`
4. 섹션 구성이 기준 순서와 명칭을 따르지 않고 Anatomy·Properties·Examples/Usage·Property map이 전혀 없다 — `studio.md:49` 대 `message-bubble-workbench.tsx:26`
5. 섹션 제목과 설명의 언어 처리가 서로 다르다. `read-handling`만 언어 전환을 따르고 나머지는 리터럴로 고정되어 있다 — `studio.md:17` 대 `message-bubble-workbench.tsx:251`, `:305`, `:324`, `:335`, `:454`, `:506`
6. 통합 예시의 메시지 본문이 언어 전환에 반응하지 않는다 — `message-bubble-workbench.tsx:285`
7. `MessageFileAttachment`의 파일명·용량·다운로드 label이 하드코딩되어 있고 받는 prop이 없다 — `message-attachment.tsx:14-17`
8. 과정 문장 다수 — `message-bubble.md:3`, `:5`, `:7`, `:9`, `:28`, `:78`, `:80-89`, `:91`

Properties와 Anatomy 요소는 불일치가 없었다.
