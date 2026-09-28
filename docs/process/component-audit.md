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

**진행 상황.** 1단계를 폼 요소 10개에서 끝냈다. 첫 항목인 워크벤치 중복 제목 제거와 제목 위계 통일은 폼 요소 10개에서 끝냈다. Badge 는 `2026-09-08` 에 걷어냈고 Chip 은 새로 만들며 정리했다. 워크벤치 머리에 있던 국문 설명은 registry 로 올렸고, 읽는 곳이 없어진 `description` 키가 워크벤치 여섯 곳에 남아 있어 각 컴포넌트를 손볼 때 함께 걷어낸다.

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

Checkbox Playground 에서 Label on/off 토글과 종속 위계를 걷어냈다. 원자적인 `Checkbox`는 Guidelines 의 `16px Control` 예시와 `Do/Don't` 비교에서 이미 확인할 수 있으므로 추가로 둘 것이 없다.

## 하나씩 검토 진행 상황

`2026-09-07`부터 사용자가 컴포넌트를 하나씩 순서대로 훑으며 수정 요청을 준다. 대상은 Checkbox·Input·Input Button·Number Input·Radio·Select·Select Box·Switch·Textarea 아홉 개다.

**사용자가 완료라고 말하면 그 컴포넌트에 남은 확인 필요 사항을 브리핑한다.** 볼 곳은 세 군데다. [open-questions.md](open-questions.md)의 「컴포넌트」와 「Token candidate」, 해당 명세의 「현재 정의하지 않은 항목」, 그리고 명세 본문의 `확인 필요` 항목이다.

- **Checkbox** — 문제없음으로 확인받았다.
- **Chip** — 완료. 새로 만든 컴포넌트이므로 진행 내용은 아래 「Chip 진행 상황」에 있다. 명세에서 「확정 전 초안」 표기와 검수 화면 경로를 걷어냈다. 후순위 검수 7건 가운데 다섯은 해소되었고, `className` 명세 제외는 확정 정책 1번대로가 맞으며, 교체 Slot control 은 아래 이유로 공용 control 을 쓰지 않는다.
- **Number Input** — 완료. `allowNegative` 기본값을 `true`에서 `false`로 바꿨다. 이 컴포넌트가 담당하는 수량·순서·비율에 음수가 필요하지 않으므로 예외를 명시하게 한다. Guidelines 절을 만들어 다섯 규칙을 적었다. Input과 나눠 쓰는 기준, 증감 버튼 위치, 음수 허용, 증감 단위, Prefix/Suffix다. 앞의 둘은 Do/Don't, 뒤의 셋은 Do/Don't 없이 나란히 놓는 2열 비교다.
  자리 구분(컴마)은 Number Input에 넣지 않기로 했다. `type="number"`가 값에 구분자를 담을 수 없고, `type="text"`로 바꾸면 키보드 화살표 증감과 native 범위 검증과 폼 제출값을 함께 잃는다. 금액은 기존대로 Input이 담당한다.
  이 결정과 반대로 `useGrouping` Property를 함께 넣어 두었던 것을 제거했다. 켜면 `type`이 `text`가 되고 `Input`에는 문자를 걸러내는 장치가 없어 숫자가 아닌 문자가 필드에 들어올 수 있었다. `number-input.test.tsx`에 native number type 유지, 숫자가 아닌 입력을 값으로 반영하지 않기, `allowNegative` 없이 0 아래로 내려가지 않기 세 건을 두어 이 자리를 고정했다.
  증감 버튼이 Leading과 Trailing 자리를 사용해 `leadingElement`·`trailingElement`·`clearable`을 제공하지 않는다는 제약을 Guidelines에 적었다. 구현은 막아 두었는데 이유가 어디에도 없었다.
- **Radio** — 문제없음으로 확인받았다. 화면에는 Guidelines 여섯 항목이 있으나 명세 `radio.md`에는 Guidelines 절이 없고 `## Specification`에 크기 값만 있다. 전달되는 것은 명세이므로 규칙이 화면에만 있는 상태다. 화면의 절 설명도 「기준의 첫 번째 초안입니다」로 초안 표기가 남아 있다. 사용자 확인 대기.
- **Select** — 완료. Guidelines 시각 여섯 개가 내용 너비만큼만 차지해 `w-full`을 줬다. `GuideSurface` 안쪽이 `flex items-center`라 자식이 스스로 늘어나지 않는다.
- **Select Box** — 완료. Playground와 Anatomy뿐이던 화면에 Selection mode·Columns·Elements·State·Guidelines·Property map을 만들었다. Anatomy 도식의 Container가 `bg-transparent`여서 회색 Surface가 비쳐 보이던 것을 흰색으로 고쳤다.
  컴포넌트를 세 군데 고쳤다. `columns`가 2 이상이면 Leading element를 Title 위 왼쪽에 배치한다. 답이 하나로 정해지는 규칙이라 가이드가 아니라 컴포넌트가 소유한다. Leading element 자리에서 32px 고정 크기와 가운데 정렬과 `[&_svg]:size-5`를 걷어냈다. 자리가 요소의 크기를 정하고 있어서 호출하는 쪽이 넘긴 크기가 덮어써졌고, 세로 배치에서 아이콘이 Title 시작점보다 안쪽에서 시작했다. 세로 배치의 위 여백만 16px로 올렸다. 아이콘은 상자를 채우지만 Title은 줄높이 안에서 여유를 가져 상하가 같으면 아래가 넓어 보인다. 회귀 테스트 두 건으로 고정했다.
  `columns="fit"`을 만들었다가 되돌렸다. 「역할과 경계」가 Chip처럼 흐르지 않는다고 이미 정해 두었고 상세 정보를 비교한다는 목적과도 어긋난다. 지원하지 않는다는 것을 Guidelines와 「현재 구현 규칙」에 명시했다.
  Guidelines는 여덟 규칙이며 명세와 소제목이 같다. Do/Don't는 둘이고 나머지는 권장 비교이거나 규칙 목록이다.
- **Input Button** — 완료. Guidelines 여덟 규칙을 만들고 전부 시각을 갖췄다. Placeholder 문구, 형식과 기간 알리기, 나눠 받을 때 시각 요소 줄이기, 조회와 편집, 내부 중첩 금지, Trailing element의 한계, Select와의 구분, Color input의 구분이다. Placeholder를 「날짜를 선택해 주세요」에서 「날짜 선택」으로 바꿨다. 형식이 정해진 값은 `YYYY. MM. DD`를 그대로 보여준다.
  `prefix`와 `suffix` Property를 제거했다 (PR #11). 구현과 명세 Anatomy, Optional elements, Property map, Anatomy 도식 네 곳이 있다고 하고 Playground만 없었다. 값의 의미를 보완하는 표기는 값을 직접 입력받는 Input이 담당한다. 공개 Property를 지우는 변경이라 branch와 PR을 썼다.
  Anatomy 도식의 날짜가 `2026-09-14`로 다른 예시와 달라 점 표기로 통일했다.
- **Input** — 완료. Guidelines 일곱 규칙을 만들었다. Prefix·Suffix와 Leading·Trailing element의 구분, Prefix·Suffix를 필요할 때만 쓰기, Clear button을 둘 자리, 마스킹, Custom input, Number Input과의 구분, Color input의 구분이다.
  `input.md`가 Input 규칙과 공통 규칙과 Studio 화면 규칙을 함께 담고 있어 정리했다. 공통 Control Height 절을 `interaction.md`로, Placeholder token 매핑을 `tokens.md`로 옮겼다. Focus·Invalid·Disabled는 `interaction.md`가 이미 소유하므로 가리키는 한 문장으로 줄였다. Studio 화면 규칙 일곱 문단 중 공통인 것은 `studio.md`로 옮기고 중복은 지웠다. Playground control 분류가 `studio.md:42`와 반대로 적혀 있던 것도 지웠다. 같은 높이 값을 다시 적던 Input Button·Select·Combobox도 `interaction.md`를 가리키게 했다.
  더 이른 검토에서는 Clear button의 전환을 컴포넌트가 소유하게 했다. 값의 유무와 focus 두 조건을 함께 보고, opacity와 폭과 여백을 같은 150ms에 전환하며, 누를 때 focus를 유지한다. 금액 예시가 `containerClassName`으로 같은 동작을 직접 구현하던 덮어쓰기를 걷어냈다.
- **Textarea** — 완료. Guidelines 아홉 꼭지를 만들고 여섯에 시각을 뒀다. 사용 조건, 지원하지 않는 요소와 Layout, 기본 높이, 초기 높이의 반 줄 걸침, Scrollbar 표시 조건, Resize 방향, 자동 높이를 켤 자리, 두 높이 옵션의 배타성, 최대 높이다.
  기본 높이와 최소 높이를 88px에서 80px로 바꿨다 (PR #12). 88px는 여백 사이에 3.5줄이 들어가는 값이지만 내용이 넘칠 때 보이는 것은 3.9줄이어서 4줄에서 깔끔하게 끝난 것처럼 보였다. 아래 여백이 스크롤 영역 안에 있으므로 보이는 줄 수는 `(높이 − border 2px − 위 여백 8px) ÷ 20px`이며 3.5줄이 보이는 값은 80px이다. 반 줄이 걸치는 높이는 `20 × 정수 + 20`이다.
  `resize` 기본값을 `false`에서 `true`로 바꿨다. 받을 내용의 분량은 사용자가 스스로 조절하는 편이 낫고, 높이를 고정해야 하는 자리에서만 끄면 된다. 이 때문에 `autoSize`를 켜면 켜져 있던 세로 조절이 조용히 꺼지므로 두 옵션의 배타성을 별도 꼭지로 세웠다.
  Scrollbar thumb이 보이는 조건에 `focus`를 더했다. `hover`만으로는 키보드로 들어온 사람이 감춰진 분량을 알 수 없었다. Touch 기기 확인은 `open-questions.md`에 남겼다.
  회귀 테스트 다섯 건을 뒀다. 기본 높이와 3.5줄 계산, 최소값 제한, `autoSize`가 고정 높이를 쓰지 않는 것, `resize`가 세로만이며 `autoSize`와 함께 켜지지 않는 것, Scrollbar가 Hover와 Focus에서 보이는 것이다.

## 한번에 몰아서 할 작업

검토 중에 나왔으나 컴포넌트마다 흩어져 있어 한 번에 처리하는 편이 나은 항목이다.

1. **Structure map 누락.** (Anatomy 좌표 정렬은 `2026-09-08`에 끝냈다. 위 절을 본다.) Anatomy 절이 있는 화면 열한 개 중 공용 `AnatomyStructureMap`을 쓰는 것은 다섯 개뿐이다. 있는 곳은 Checkbox·Combobox·Radio·Select Box·Switch이고, 없는 곳은 **Badge·Input·Input Button·Number Input·Select·Textarea** 여섯 개다. 요소의 중첩 관계를 글로 보여 주는 자리이므로 Anatomy가 있으면 함께 있어야 한다. 하나씩 검토하면서 지나쳤으므로 여섯 화면에 한 번에 추가한다.

2. **크기 이름의 원본이 둘이다.** 같은 `xlarge` 를 Playground 의 선택 버튼은 `Xlarge` 로, Properties · Size 카드는 `XLarge · 48px` 로 부른다. 버튼은 `capitalize()` 로 첫 글자만 올려 만들고 카드는 문자열을 손으로 적기 때문이다. `small` 처럼 한 단어인 값은 두 방식의 결과가 같아서, `x` 가 붙은 XSmall 과 XLarge 에서만 표기가 갈린다.
   기능에는 영향이 없고 화면에서도 눈에 잘 띄지 않지만, 크기 이름을 부르는 자리가 두 곳이라 한쪽만 고치면 그 화면이 다른 화면과 어긋난다. Input·Select·Number Input·Input Button·Chip 다섯 화면이 모두 같은 상태이므로 함께 처리한다.
   고칠 방향은 크기 이름을 한 자리에서 소유하고 버튼과 카드가 그것을 읽게 하는 것이다. Chip 의 `sizeLabels` 상수가 그 형태에 가깝고 나머지 넷은 카드마다 문자열을 직접 적는다. 옮길 때 `Regular · 36px · Default` 처럼 카드에만 붙는 꼬리표를 어떻게 다룰지 함께 정해야 한다.

## Anatomy 좌표 정렬

`2026-09-08`에 Anatomy 번호선 전체를 손봤다. 작업 전에 실제 화면을 재어 보니 마커 안내선 85개 중 40개가 대상의 시각 중심에서 2px 넘게 빗나가 있었고 그중 17개는 40px 이상 벗어나 있었다. 범위 표시선 일곱 개도 길이나 세로 중심이 대상 사각형과 맞지 않았다. 좌표가 `left-0`·`right-[34px]` 같은 고정값이었고 공용 부품을 통합하며 실제 부품 크기가 바뀐 것이 원인이다.

고정 좌표를 다시 계산하는 대신 마커가 대상을 참조해 스스로 자리를 잡도록 공용 컴포넌트를 바꿨다. 같은 이유로 다시 어긋나는 것을 막기 위해서다. 규칙은 `docs/system/studio.md`가 소유한다.

- `AnatomyFrame`이 기준 영역을 만들고 그 안의 `AnatomyNumber`·`AnatomyBoundaryMarker`가 대상 요소를 실제로 재어 위치와 안내선 길이를 정한다. 좌표 계산은 `anatomy-placement.ts`가 순수 함수로 소유하고 `anatomy-placement.test.ts`가 20건을 검사한다.
- 대상은 `data-slot` selector, 화면에 보이는 요소 명칭, 품고 있는 부품 이름 세 가지로 지정한다. 도식으로 그린 Anatomy에도 실제 구현과 같은 `data-slot` 이름을 붙였다.
- 같은 방향의 마커는 프레임이 계산한 하나의 축에 정렬되고 안내선 길이만 달라진다. 축은 프레임 경계 바깥에 잡히므로 마커가 도식 위로 올라오지 않는다.
- 글자만 담은 요소는 박스가 아니라 글자가 실제로 그려진 범위를 기준으로 잰다. `flex-1`로 늘어난 Input Button의 Value가 박스 중앙을 가리키던 문제가 이것으로 풀렸다.

함께 정리한 것이 넷이다.

1. **Container를 점 마커로 표시하던 세 곳**을 범위선으로 바꿨다. Badge와 Select Box의 Container, Select Box의 Content container다.
2. **Combobox와 Select가 직접 그리던 범위 표시선**을 공용 `AnatomyBoundaryMarker`로 옮겼다. `working-context.md`가 판단을 미뤄 둔 항목이며, 대상 크기를 따라가는 방식이면 늘어나는 표시를 따로 지원할 필요가 없어서 공용으로 옮기는 쪽으로 정했다.
3. **Input Button의 Anatomy에서 Prefix와 Suffix를 걷어냈다.** `input-button.md:24`가 「Clear button과 Prefix, Suffix는 제공하지 않는다」고 정했고 Property도 PR #11에서 제거했는데 Studio 범례와 마커에만 여섯 개로 남아 있었다. 넷으로 맞췄다.
4. **`packages/ui/src/badge.tsx`에 `data-slot` 넷을 더했다.** Badge에만 이 표시가 하나도 없어 Anatomy가 실제 부품을 가리킬 수 없었다. 이 파일은 `2026-09-08`에 걷어냈으므로 새 Badge를 만들 때 같은 이름 규칙으로 다시 붙인다.

Field가 Container 안쪽을 가리키는 기준도 함께 맞췄다. `input`처럼 한 줄 입력 요소는 박스가 Container 안쪽을 거의 다 채우기 때문에 번호선이 border 안쪽 면에서 멈춰, 입력 영역이 아니라 외곽선을 가리키는 것으로 읽혔다. 세로 범위를 글자가 앉는 한 줄로 좁혀 Prefix나 Label과 같은 자리에서 안내선이 출발하게 했다. 가로 기준은 Number Input이 입력 영역의 중심을, Input 화면이 값 글자의 중심을 가리켜 서로 다르지만 둘 다 Container 안쪽을 가리키므로 그대로 두기로 확인받았다.

Select의 Group 범위선은 왼쪽에서 오른쪽으로 옮겼다. Trigger container·Popup·Group 세 범위선이 왼쪽에 층으로 쌓여 어느 영역을 가리키는지 읽히지 않았기 때문이다.

## Chip 진행 상황

`2026-09-07`부터 새로 만들고 있다. 옛 Chip 은 24px 고정 하나에 삭제 버튼이 필수였고 검토를 거치지 않은 초안이었다.

정한 것은 `docs/system/components/chip.md`에 있다. 공통 Control Height 넷, `shape`은 `circle` 기본, Style variant 없음, 요소 넷과 Icon only, 아이콘 위계 Property, `active` 하나, 전체 Click과 Remove button의 배타, 한쪽만 아이콘일 때의 여백 보정이다.

남은 작업은 이렇다.

1. **Filter 소제목 여섯 개에 시각 예제 붙이기.** 지금은 그룹 제목 아래에 조작 가능한 Filter bar 하나만 있고 소제목은 글로만 있다. 각 소제목 아래에 그 규칙만 보여 주는 시각이 붙는다.
2. **Filter bar 의 gradient 다듬기.** 폭 24px 이 좁고 `opacity` 로 켜지는 방식이 자연스럽지 않다. 스크롤 정도에 따라 짙어지게 하는 편이 낫다.
3. **경고 하나 정리.** `endDrag` 의 쓰지 않는 매개변수다. 안 쓰던 `activeFilters` 상태는 Selection 시각이 실제로 쓰게 되어 해소했다.
4. **Filter Bar 분리.** `open-questions.md` 의 미정 셋이 정해지면 `filter-bar.tsx` 로 옮기고 Chip 쪽에는 쓰임 한 줄과 링크만 남긴다.
5. **Combobox 의 선택값 영역 높이 맞추기.** 24px Chip 이 사라져 `small` 32px 로 두었다. `max-h-20` 에 담기는 줄 수가 달라졌으므로 Combobox 작업에서 다시 잡는다.
6. **Size 개수 확정.** 다섯으로 확정했다. Input·Select·Combobox 가 제공하는 넷에 Suggestion 용 XSmall 28px 을 더한 것이다. 애초 「3~4가지」라 했고 28·32·36 셋으로 줄일지 검토했으나, Selection 이 폼 요소와 같은 페이지에서 그리고 같은 Field 안에서 쓰이므로 폼 요소의 단계를 모두 가져야 나란히 놓았을 때 높이를 맞출 수 있다는 이유로 남겼다. 공통 scale 의 XXSmall 24px 과 XXLarge 56px 은 폼 요소도 갖지 않으므로 제공하지 않는다.

### 후순위 검수 7건의 결말

`2026-09-04` 3중 대조에서 Chip 에 7건이 있었다. 다섯은 Chip 을 새로 만들면서 해소되었다. `ariaLabel` 이 명세에 들어갔고, 화면 범례의 Label 이 필수로 맞춰졌고, Property map 이 Guidelines 뒤로 갔고, 구현 경로와 진행 상태 표기가 정리되었다. `className` 을 명세 Properties 에 적지 않는 것은 확정 정책 1번대로가 맞다.

**교체 Slot control 은 공용 `PlaygroundElementControl` 을 쓰지 않는다.** 그 control 은 `None / Icon / Image` 셋을 제공하는데 `chip.md` 는 「Leading element 와 Trailing element 에는 Icon 만 둔다」고 정한다. 공용 control 을 쓰면 컴포넌트가 지원하지 않는 값을 고를 수 있게 된다. `studio.md:42` 가 Playground 의 교체 Slot 을 세 유형으로 정하고 있어 두 규칙이 부딪히므로, 유형을 컴포넌트가 좁힐 수 있게 할지는 Playground control 규칙을 다시 볼 때 함께 정한다.

### Guidelines 진행 상황

`2026-09-08`에 Selection 과 Input 두 쓰임을 채웠다. 저장소에 명시된 근거만 사용했고, 근거가 없는 Suggestion 과 정보 표시는 손대지 않았다.

Guidelines 첫머리에 다섯 쓰임의 동작을 대조하는 표를 두었다. `onClick` 과 `onRemove` 가 타입으로 갈려 함께 넘길 수 없으므로, 어느 쓰임인지 정한 뒤 조합하게 만드는 자리다. 확정 전인 두 쓰임은 「정하지 않았습니다」로 남겼다. 빈칸으로 두면 두지 않기로 정한 것과 구분되지 않는다.

- **Selection** 규칙 셋이다. Content 너비로 흐르게 두기, 선택과 해제를 전체 Click 으로 받기, 비교가 필요하면 Select Box 로 넘기기다. 근거는 `select-box.md` 의 「역할과 경계」와 `select.md:99`, 그리고 `chip.md` 의 Properties 다.
- **Input** 규칙 둘이다. 개별 제거는 Remove button 으로 받기, 담는 영역의 규칙은 Combobox 가 소유하기다. 근거는 `combobox.md:58`·`61`·`62` 다. Filter Bar 도 미정 셋이 정해지면 `filter-bar.tsx` 로 옮기고 Chip 쪽에 링크만 남기기로 이미 정해 두었으므로, Input 쪽은 소유자가 Combobox 로 이미 있어 처음부터 그렇게 두었다.

각 그룹에 조작 가능한 시각 하나를 붙였다. Selection 은 여덟 키워드를 눌러 켜고 끄며 줄바꿈을 보이고, Input 은 네 값을 개별로 지운다. 다 지우면 되돌리는 수단을 두어 검수 화면을 새로 열지 않아도 되게 했다.

**Selection 은 `rounded` 를 사용한다.** Input·Select·Number Input 과 같은 페이지에서 값을 고르는 자리이며 Field 에서 다루기도 하므로 모서리를 다른 컨트롤과 맞춘다는 것이 사용자가 준 이유다.

규칙으로 적으면서 실제 값을 재어 보니 **Chip 의 `rounded` 가 8px, 컨트롤 Container 가 `rounded-lg`(10px) 로 2px 갈려 있었다.** 사용자가 8px 로 공통을 맞추기로 정했고, 그 결과 세 가지를 함께 처리했다.

1. **컨트롤 공통 radius 를 토큰으로 만들었다.** `packages/tokens` 의 `RADII` 가 값의 단일 원본이고 `--radius-oe-control`(8px) 로 노출한다. Button·Input·Input Button·Number Input·Textarea·Select·Combobox 의 Container 와 Chip 의 `rounded` 가 이 토큰을 쓴다. 단계 이름을 각자 고르지 않고 컨트롤 전용 이름 하나를 공유하므로 컨트롤만 조정할 일이 생겨도 한 자리에서 끝난다. 기준은 `interaction.md` 의 「공통 Control Radius」가 소유한다.
2. **radius scale 을 `packages/tokens` 로 옮겼다.** `--radius` 와 파생 값이 `apps/studio/src/app/globals.css` 에만 있어 공용 컨트롤이 Studio 밖으로 나가면 모서리가 달라지는 상태였다. 색 token 과 같은 자리로 옮겨 이관 후에도 같은 값이 나온다. `index.test.ts` 가 CSS 변수와 `RADII` 의 일치를 검사한다.
3. **컨트롤이 같은 토큰을 쓰는지 검사한다.** `packages/ui/src/control-radius.test.tsx` 가 여섯 컨트롤을 함께 렌더해 확인한다. Chip 하나로 성립하는 동작은 새로 만든 `chip.test.tsx` 에 두었다.

유지한 것은 카드형 선택지인 Select Box(14px), Trigger 로 여는 Popup, Tooltip, Message Bubble 과 첨부 카드(10px)다. 컨트롤과 나란히 놓이는 요소가 아니다.

`2026-09-08`에 **Suggestion 과 정보 표시도 채웠다.** 사용자가 쓰임과 사례를 알려 주어 다섯 쓰임 전부가 규칙을 갖게 되었고, Guidelines 첫머리 표에서 「정하지 않았습니다」가 사라졌다.

- **Suggestion** 은 다음 입력을 제안하는 자리다. 검색어 추천과 채팅방 안의 답변 추천이 사례다. 규칙 셋이며 누르면 값이 채워지게 하기, Label 만 두는 기본 형태를 쓰기, Active 를 사용하지 않기다. Label 만 두는 이유는 여러 개를 훑어 고르는 자리라 항목마다 아이콘이 붙으면 훑는 속도가 떨어지기 때문이고, Active 를 쓰지 않는 이유는 누르는 순간 값이 채워지고 역할이 끝나기 때문이다. 시각은 검색 입력과 추천 Chip 을 함께 두어 누르면 입력창에 값이 들어가는 것을 보인다.
- **정보 표시** 는 여러 값을 나열해 각 값이 구분되어 읽히게 하는 자리다. 리뷰 관리 화면의 주문 메뉴가 사례다. 규칙 둘이며 누를 수도 지울 수도 없게 두기, 값이 여럿일 때 쓰기다.

Badge 와의 경계는 여전히 남았고, 사용자가 방향을 정해 두었다. **Badge 를 검수한 뒤 정보 표시를 Badge 로 대체할 수 있으면 Chip 에서 그 쓰임을 걷어내는 쪽으로 검토한다.** 그러면 Chip 은 동작을 갖는 네 쓰임만 담당한다. 지금은 다섯 쓰임을 모두 적어 두었으므로, 걷어낼 때 명세와 Studio 화면의 그룹과 쓰임 표의 행을 함께 지운다. `open-questions.md` 에 이 방침을 적었다.

**공통 Control Height 가 일곱 단계로 늘었다.** Suggestion 에 32px 보다 한 단계 작은 크기가 필요해지면서 사용자가 24·28·32·36·40·48·56px 체계를 정했다. `packages/tokens` 의 `CONTROL_HEIGHTS` 가 값을 소유하고 `--spacing-oe-control-*` 로 노출하며, `index.test.ts` 에 CSS 변수와 상수를 대조하는 검사를 새로 넣었다. 전에는 radius 만 그 검사를 갖고 있어서 높이는 한쪽만 바뀌어도 잡히지 않았다.

`interaction.md` 의 「공통 Control Height」에 **모든 컴포넌트가 모든 단계를 제공하지는 않는다**는 것을 명시했다. 이 절은 쓸 수 있는 값의 목록이고 어느 컴포넌트가 어느 단계를 갖는지는 각 명세가 정한다. Chip 은 XSmall 부터 XLarge 까지 다섯을 제공한다.

**Component 목록에서 「마지막 수정」을 걷어냈다.** `component-registry` 의 `updatedAt` 필드와 열세 항목의 값, 목록 카드의 `<time>` 표시, 형식 회귀 검사, `studio.md` 가 registry 소유로 적어 두었던 「수정일」 항목을 함께 지웠다. 카드의 `min-h-[104px]` 는 수정일 자리까지 계산한 값이어서 빈 공간이 남으므로 최소 높이를 걷어내 내용 높이에 맞췄다. 세 목록 화면 가운데 `density="compact"` 를 쓰는 Components 만 영향을 받는다.

**Playground 에서 Label 을 끄면 Prefix 가 남아 Chip 이 찌그러지던 것을 고쳤다.** Label 이 없으면 `iconOnly` 가 되어 높이와 같은 정사각 폭을 쓰는데, 그 안에 Prefix 글자와 아이콘이 함께 들어가려 해서 넘쳤다. 두 층에서 막았다. 컴포넌트는 Icon only 일 때 Prefix 를 그리지 않고, Playground 는 Prefix control 을 Label 종속으로 옮겨 Label 을 끌 때 함께 끈다. Label 이 꺼진 동안에는 그 자리에 Leading element 를 유지하고 Prefix 를 쓰지 않는다는 안내를 둔다. `chip.test.tsx` 가 두 조합을 고정한다.

XSmall 의 Label 은 공용 `text-oe-label` token 의 13px/16px 로 줄였다. 28px 상자에 14px 글자를 그대로 담으면 위아래 여유가 남지 않는다. 이 과정에서 글자 크기를 base 클래스에서 빼고 단계마다 명시하도록 바꿨다. Input 이 쓰는 방식과 같으며, base 와 variant 에 같은 속성이 겹치면 어느 쪽이 이길지 클래스 순서에 달리게 된다.

**Guidelines 앞에 「모든 쓰임의 공통 규칙」 그룹을 만들었다.** 쓰임별 조합보다 공통 규칙이 앞에 와야 한다는 것이 사용자 판단이며, `studio.md:68` 의 「이미 이 컴포넌트를 쓰기로 정한 사람에게 먼저 필요한 것은 이 컴포넌트를 어떻게 쓰는지다」와도 맞는 순서다. 규칙 둘을 사용자가 정해 주었다.

1. **Label 만 말줄임해 한 줄을 유지한다.** Chip 은 내부 콘텐츠를 감싸는 너비를 쓰되 담을 폭보다 넓어지면 Label 만 줄이고, Leading element·Prefix·Trailing element·Remove button 은 줄이지 않는다. 아이콘이 찌그러지거나 Remove button 을 누를 수 없게 되면 값을 지울 방법이 사라진다. 구현은 이미 그렇게 되어 있었고 `chip.test.tsx` 에 회귀 검사를 넣어 고정했다. `shrink-0` 을 빼거나 `truncate` 를 지우면 실패하는 것을 확인했다.
2. **`circle` 이 기본이고 `rounded` 는 Selection 에서만 쓴다.** Selection 이 폼 요소와 나란히 놓이는 유일한 쓰임이므로 그 자리에서만 모서리를 맞출 이유가 있다.

이로써 다섯 쓰임의 모양이 모두 정해져 쓰임 표에 「모양」 열을 더했다. Filter·Suggestion·Input·정보 표시가 `circle`, Selection 만 `rounded` 다. 표가 앞서 미뤄 두었던 항목이다.

그룹이 둘로 늘어나면서 표에도 그룹 제목이 필요해졌다. 「쓰임마다 갈리는 것」을 붙였고, `studio.md` 의 `GuidelineGroupTitle` 설명이 「어느 쓰임에 대한 것인지를 말하는 자리」로만 되어 있어 쓰임과 무관한 묶음도 같은 단계를 쓴다는 것과 공통을 앞에 둔다는 것을 함께 적었다.

공통 규칙 그룹에는 그룹 제목 아래 조작 시각을 두지 않고 각 규칙 제목 아래에 두 칸 비교만 두었다. 조작할 쓰임이 없기 때문이며 `studio.md` 에 그 예외를 적었다. 한 줄 유지 규칙은 왼쪽에 콘텐츠를 감싸는 짧은 값, 오른쪽에 디바이스 폭을 다 쓰는 긴 값을 놓아 Label 만 말줄임되고 아이콘과 Remove button 이 온전히 남는 것을 보인다. 두 칸의 값은 같은 주소 계열로 두어 길이만 다르게 했고, 실제 렌더에서 오른쪽 Chip 이 375px 을 채우고 Label 의 `scrollWidth` 가 `clientWidth` 를 넘는 것을 확인했다. 모양 규칙은 Circle 을 왼쪽, Rounded 를 오른쪽에 놓았다.

## Chip 잔여 작업

`2026-09-07`에 Select Box를 검토하면서 나온 요구다. Chip은 이미 후순위이며 지시가 있을 때 시작한다.

1. **선택 가능한 Chip.** 짧은 Label 여러 개를 각자의 Content 너비로 나열하고 줄바꿈되게 두면서 그중 하나 이상을 선택하는 배치가 필요하다. 이 배치를 Select Box의 `columns="fit"`으로 만들었다가 되돌렸다. `select-box.md`의 「역할과 경계」가 「Chip처럼 짧은 키워드 너비에 맞춰 흐르지 않는다」고 이미 정해 두었고, 상세 정보를 비교한다는 Select Box의 목적과도 어긋난다. 같은 화면 모양을 두 컴포넌트가 갖게 되면 무엇을 선택하는 자리인지 구분할 수 없다.
   현재 Chip 명세는 Selected 상태와 Chip 전체 Click을 확인되지 않은 항목으로 두고 있다. 이 둘이 확정되어야 이 배치를 Chip이 담당할 수 있다.
2. **Select Box Guidelines의 경계 시각.** 「다른 선택 컴포넌트와 나눠 쓰기」 규칙의 오른쪽 칸이 「Chip · 작업 예정」 문구로 비어 있다. Chip의 Selected 상태가 확정되면 Content 너비로 나열해 선택하는 예시를 그 자리에 넣는다.

## Combobox 잔여 작업

`2026-09-07`에 Select 와의 경계를 다시 정하면서 사용자가 남긴 목록이다. 이 목록 때문에 Combobox 도 후순위로 옮겼다. Chip 을 먼저 확정한 뒤 진행한다. Combobox 의 선택값 Container 가 Chip 을 렌더링하므로 Chip 디자인이 바뀌면 Container 를 두 번 만들게 된다.

1. **Trigger 한 줄 요약을 없애고 결과 Chip 만 보이게 고정한다.** 지금은 Trigger 에 `서울특별시 외 2곳` 요약이 남아 있고 그 아래 Container 가 함께 있다. 요약을 걷어내면 Trigger 는 Placeholder 만 표시하고 선택 결과는 Chip 이 전담한다.
2. **선택 결과 영역을 고도화한다.** 현재는 검색만 있다. 필터나 상태별 탭 같은 수단이 필요하다.
3. **편집과 조회 케이스를 만든다.** 지금 예시는 새로 고르는 흐름만 있다.
4. **1~3depth 예시 가이드를 추가한다.** 현재 2-depth 예시 하나뿐이다.
5. **수정된 Chip 디자인을 반영한다.** 1번의 Container 모양이 이 디자인에 달려 있다.

폼 요소 10개의 검수는 이것으로 끝났다. 후순위는 Chip·Badge·Message Bubble 25건에 Combobox 가 더해져 넷이다. 지시가 있을 때 시작하며 Chip 이 먼저다. 하나씩 검토하는 대상은 Checkbox·Input·Input Button·Number Input·Radio·Select·Select Box·Switch·Textarea 아홉 개다.

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

1. ~~명세는 `shape`에 `square | rounded | ghost`를 적었으나 구현은 `appearance`이고 `square` 값 자체가 없다.~~ 해결했다. 구현을 `shape`로 바꾸고 `square`를 0px radius로 더했으며 Studio의 컨트롤·섹션·Property map도 맞췄다.
2. ~~`indeterminate` 설명이 없는 `Square`를 전제로 쓰여 있다.~~ 1번과 함께 해결했다. `square`가 생겼고 구현이 `shape !== "ghost"`로 판정한다.
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

### Badge (10건) — 걷어냈다

`2026-09-08`에 옛 Badge 구현과 검수 화면을 지우고 새로 만들기로 정했으므로 이 10건은 대상이 사라졌다. 지적의 절반이 「명세가 나열한 섹션과 실제 화면이 다르다」처럼 옛 화면 구조에 대한 것이었고, 나머지는 `chip` 이름 잔재와 명세의 과정 서술이었다. 새로 만들 때 지키는 기준은 `docs/system/components/badge.md` 가 소유한다.

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

**진행 상황(`2026-09-28`).** 1·2·3·8 은 명세를 다른 확정 명세와 같은 절 구조(역할과 경계·Anatomy·Properties·색·Guidelines·Specification)로 다시 쓰며 처리했다. 명세에 없던 `unreadRecipientLabel`·`unreadMessageLabel`·`showTime`·`outgoingSenderDescription` 을 「Properties」에 더하고, 「관리자 icon」 은 `outgoingSenderDescription` 을 넘길 때만 그리는 Info trigger 로 고쳤으며, Studio 의 언어·모드 control 을 말하던 문장은 걷어냈다. 코드와 어긋나던 「Outgoing metadata: `oe-foreground-inverse-secondary`」 도 실제 값 `oe-foreground-tertiary` 로 바로잡았다. 걷어낸 「아직 검수할 항목」 은 [working-context.md](working-context.md)의 「남은 작업」 11 에 있다. 4~7 은 Studio 화면 쪽 작업이라 남는다. `scripts/docs/system-drift.mjs` 의 ENUM_TABLE 에 message-bubble 항목을 더해 새 「Properties」 의 열거 줄 일곱을 코드와 대조한다.
