# ooee UI 시스템

`oe` semantic token과 공용 컴포넌트·패턴으로 구성된 UI 시스템이다. 이 디렉터리는 **시스템에 무엇이 있고, 각각이 어떤 정의이며, 어떤 목적으로 써야 하는지**만 다룬다.

제작 과정, 참고 자료의 출처와 작업 운영 규칙은 이 디렉터리에 두지 않는다. `docs/system/`의 문서는 바깥 문서를 참조하지 않으며, 이 디렉터리와 `packages/`만으로 시스템을 이해하고 사용할 수 있어야 한다.

## 이 문서의 독자

**이 디렉터리의 1차 독자는 사람이 아니라 코드를 생성하는 에이전트다.** 목표는 Sonnet 수준의 낮은 모델이 이 문서만 보고도 시스템에 맞는 코드를 만드는 것이다. 개발자와 PO 누구나 쓰기 때문에 높은 모델을 전제하지 않는다.

그래서 문서를 쓸 때 다음을 지킨다.

- 서술형 설명 대신 그대로 따를 수 있는 규칙으로 쓴다.
- **언제 이 컴포넌트를 쓰고 언제 다른 것을 쓰는지**를 명시한다. 「설명이 포함된 선택지를 넓은 영역에서 비교할 때는 `SelectBox`를 사용한다」처럼 판단 기준과 대상을 함께 적는다.
- 토큰과 Property는 코드에서 쓰는 문자열 그대로 적는다. 사람이 읽을 범주가 따로 있으면 `` `variant` (Style) ``처럼 괄호로 붙인다.
- 컴포넌트 문서는 제목 아래에 구현 경로 한 줄만 메타로 둔다. 유래, 진행 상태와 Studio 도구 설명은 담지 않는다.
- 자산이 어떻게 만들어졌는지, 어떤 도구로 검수했는지, 무엇이 진행 중인지는 쓰지 않는다. 무엇이며 어떻게 쓰는가만 남긴다.
- 「현재 정의 없음」은 결정이므로 남긴다. 「확인 필요」는 아직 결정이 아니므로 이 디렉터리에 두지 않는다.

## 먼저 읽을 문서

| 문서 | 내용 |
| --- | --- |
| [vocabulary.md](vocabulary.md) | Control·Indicator·Field·Container 구조 용어와 모양 어휘. 모든 컴포넌트 문서가 이 어휘로 쓰여 있다 |
| [tokens.md](tokens.md) | `oe` 토큰 문법과 Neutral·status·Overlay 체계 |
| [interaction.md](interaction.md) | Focus, Disabled, Read-only와 Layout 기본값 |
| [quality.md](quality.md) | 자산이 충족해야 하는 상태·접근성·반응형 기준 |
| [studio.md](studio.md) | Studio 화면 구성 기준. Storybook으로 옮길 때의 표기 근거 |

## 패키지 구조

| 패키지 | 소유 |
| --- | --- |
| `packages/tokens` | Neutral·Brand·Accent·Status semantic 정의와 Tailwind 연결 스타일 |
| `packages/fonts` | 언어별 공용 font (국문 Pretendard, 영문 Inter, 일문 Noto Sans JP) |
| `packages/ui` | 공용 Component |
| `packages/patterns` | 화면 예시 구현. 확정된 Pattern이 생기면 같은 자리에 둔다 |
| `apps/studio` | 공용 자산을 소비하는 검수 화면. 자산의 원본을 소유하지 않으며, 그 자체가 전달 대상 자산이다 |

채택한 UI는 검증 정도와 관계없이 `packages/*`가 실제 원본을 소유한다. Studio는 공용 package를 import해 표시하며 같은 자산의 Studio 전용 복사본을 만들지 않는다.

Studio는 컴포넌트를 화면에서 확인하는 현재의 채널이자 Storybook의 기반이다. 최종적으로는 Storybook이 기획자와 개발자가 컴포넌트를 찾아보는 표준 채널이 되며, 그때까지 Studio의 화면 구성과 표기 기준을 [studio.md](studio.md)가 소유한다.

## 자산 분류

- **Component** — 독립적인 의미와 상태를 가진 비교적 작은 UI 요소. 예: `Button`, `Input`, `MessageBubble`
- **Pattern** — 여러 컴포넌트가 특정 목적을 위해 결합된 반복 가능한 구조. 예: `MessageGroup`, `SearchFilterBar`. **현재 확정된 Pattern은 없다**
- **Block** — 독립적인 화면 섹션으로 사용할 수 있는 비교적 큰 조합. 예: `PricingSection`, `SettingsNavigation`
- **Template** — 페이지 또는 업무 흐름 전체. 예: `DirectMessageScreen`, `SettingsPage`

모든 `div`를 공용 컴포넌트로 추출하지 않는다. 독립적인 의미, 반복 사용, 자체 상태 또는 상호작용, 다른 화면에서 사용할 가능성이 있을 때만 자산으로 삼는다.

## 현재 상태

**1차 컴포넌트는 전부 검증 중이다. 블루키로 이관하기 전까지 API와 시각 결정이 바뀔 수 있다.** 컴포넌트마다 등급을 나누지 않는다. 지금은 모든 자산이 같은 상태라 등급이 정보를 주지 않기 때문이다. 이관 이후 자산마다 상태가 실제로 갈리면 그때 구분을 도입한다.

Foundation은 다르다. 색상 매핑처럼 아직 확정되지 않은 결정은 해당 문서 상단에 `상태: Provisional`로 표시하고 Studio의 Foundations 목록에도 같은 표시를 단다. **`Provisional`로 표시된 값은 확정된 것으로 가정하지 않는다.**

## Foundation

| 문서 | 내용 |
| --- | --- |
| [foundations/color.md](foundations/color.md) | 색상 생성 규칙과 Light/Dark semantic mapping |
| [foundations/icon.md](foundations/icon.md) | 아이콘 공급원과 사용 규칙 |
| [foundations/catalog.md](foundations/catalog.md) | Foundation 표시 상태와 경로 |

## Component

각 컴포넌트의 상세 문서는 다음과 같다.

| 컴포넌트 | 문서 | 용도 |
| --- | --- | --- |
| App Header | [app-header.md](components/app-header.md) | 모바일 화면 최상단의 한 줄. 제목과 좌우 아이콘 자리를 소유 |
| Badge | [badge.md](components/badge.md) | 다른 요소에 덧붙어 상태나 개수를 표시 |
| Bottom Navigation | [bottom-navigation.md](components/bottom-navigation.md) | 모바일 화면 맨 아래에서 최상위 화면을 오가는 한 줄 |
| Button | [button.md](components/button.md) | 누르면 실행되는 액션 |
| Checkbox | [checkbox.md](components/checkbox.md) | 항목의 선택 여부와 부분 선택 상태를 표시하고 제어 |
| Chip | [chip.md](components/chip.md) | 짧은 Label로 값 하나를 표시하고 쓰임에 따라 전체를 눌러 상태를 바꾸거나 개별로 지움 |
| Combobox | [combobox.md](components/combobox.md) | Popup 내부 검색으로 미리 정의된 옵션을 필터링하고 선택 |
| Field | [field.md](components/field.md) | Label, 필수 표시, 도움말과 오류 문구를 Form control 하나와 묶는 폼 한 칸 |
| Input | [input.md](components/input.md) | 한 줄 입력 |
| Input Button | [input-button.md](components/input-button.md) | Input과 같은 외관으로 달력·주소·시간 선택 화면을 여는 Trigger |
| Message Bubble | [message-bubble.md](components/message-bubble.md) | 발신·수신, grouping, 전달 상태, 읽음 처리와 메시지 action |
| Notification Badge | [notification-badge.md](components/notification-badge.md) | 아이콘·버튼·메뉴에 붙어 새 알림이나 읽지 않은 수를 표시 |
| Number Input | [number-input.md](components/number-input.md) | 숫자 직접 입력, 증감 버튼, 범위와 단위 |
| Radio | [radio.md](components/radio.md) | 여러 항목 중 하나를 선택 |
| Select | [select.md](components/select.md) | 검색 없이 짧은 옵션 목록에서 하나 또는 여러 값을 선택 |
| Select Box | [select-box.md](components/select-box.md) | 상세 정보를 펼쳐 놓고 비교하며 하나 이상의 값을 선택 |
| Switch | [switch.md](components/switch.md) | 설정이나 기능을 즉시 켜고 끄는 Boolean control |
| Textarea | [textarea.md](components/textarea.md) | 여러 줄 입력 |
| Toggle Button | [toggle-button.md](components/toggle-button.md) | 누른 표시가 화면에 남는 아이콘 버튼 |

`packages/ui`는 위 외에 `PartialMaskedInput`, `MessageComposer`, `MessageFileAttachment`를 함께 제공한다.

모든 공용 컴포넌트는 `className`을 받아 바깥 요소에 class를 덧붙일 수 있다. 내부 요소를 따로 스타일링해야 하는 컴포넌트는 `containerClassName`, `indicatorClassName`처럼 대상을 앞에 붙인 추가 Property를 가지며 그 이름은 각 컴포넌트 문서에 적는다. 개별 문서의 `Properties`는 시각과 동작을 결정하는 Property만 다루므로 `className` 자체는 나열하지 않는다.

## Example

외부 화면을 공용 컴포넌트로 다시 만든 사례다. **컴포넌트가 실제 화면에서 어떻게 조합되는지 보여주는 참고 자료이며, 시스템이 확정한 Pattern이 아니다.** 여기서 반복되는 조합이 확인되면 그때 Pattern으로 추출한다.

| 예시 | 문서 | 화면 |
| --- | --- | --- |
| Breadcrumb Page Header | [breadcrumb-page-header.md](examples/breadcrumb-page-header.md) | 경로와 페이지 제목을 함께 표시하는 화면 상단 |
| Collapsible Sidebar Nav | [collapsible-sidebar-nav.md](examples/collapsible-sidebar-nav.md) | 접을 수 있는 좌측 내비게이션 |
| Inbox Split View | 없음 | 목록과 상세를 좌우로 나눈 화면. 문서 작성 예정 |
