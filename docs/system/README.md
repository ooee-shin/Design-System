# ooee UI 시스템

`oe` semantic token과 공용 컴포넌트·패턴으로 구성된 UI 시스템이다. 이 디렉터리는 **시스템에 무엇이 있고, 각각이 어떤 정의이며, 어떤 목적으로 써야 하는지**만 다룬다.

제작 과정, 참고 자료의 출처와 작업 운영 규칙은 이 디렉터리에 두지 않는다. `docs/system/`의 문서는 바깥 문서를 참조하지 않으며, 이 디렉터리와 `packages/`만으로 시스템을 이해하고 사용할 수 있어야 한다.

## 이 문서의 독자

**이 디렉터리의 1차 독자는 사람이 아니라 코드를 생성하는 에이전트다.** 목표는 Sonnet 수준의 낮은 모델이 이 문서만 보고도 시스템에 맞는 코드를 만드는 것이다. 개발자와 PO 누구나 쓰기 때문에 높은 모델을 전제하지 않는다.

그래서 문서를 쓸 때 다음을 지킨다.

- 서술형 설명 대신 그대로 따를 수 있는 규칙으로 쓴다.
- **언제 이 컴포넌트를 쓰고 언제 다른 것을 쓰는지**를 명시한다. 「설명이 포함된 선택지를 넓은 영역에서 비교할 때는 `SelectBox`를 사용한다」처럼 판단 기준과 대상을 함께 적는다.
- 토큰과 Property는 코드에서 쓰는 문자열 그대로 적는다.
- 자산이 어떻게 만들어졌는지, 어떤 도구로 검수했는지, 무엇이 진행 중인지는 쓰지 않는다. 무엇이며 어떻게 쓰는가만 남긴다.
- 「현재 정의 없음」은 결정이므로 남긴다. 「확인 필요」는 아직 결정이 아니므로 이 디렉터리에 두지 않는다.

## 먼저 읽을 문서

| 문서 | 내용 |
| --- | --- |
| [vocabulary.md](vocabulary.md) | Control·Indicator·Field·Container 구조 용어와 모양 어휘. 모든 컴포넌트 문서가 이 어휘로 쓰여 있다 |
| [tokens.md](tokens.md) | `oe` 토큰 문법과 Neutral·status·Overlay 체계 |
| [interaction.md](interaction.md) | Focus, Disabled, Read-only와 Layout 기본값 |
| [quality.md](quality.md) | 자산이 충족해야 하는 상태·접근성·반응형 조건 |
| [studio.md](studio.md) | Studio 화면 구성 기준. Storybook으로 옮길 때의 표기 근거 |

## 패키지 구조

| 패키지 | 소유 |
| --- | --- |
| `packages/tokens` | Neutral·Brand·Accent·Status semantic 정의와 Tailwind 연결 스타일 |
| `packages/fonts` | 언어별 공용 font (국문 Pretendard, 영문 Inter, 일문 Noto Sans JP) |
| `packages/ui` | 공용 Component |
| `packages/patterns` | 여러 Component가 결합된 Pattern |
| `apps/studio` | 공용 자산을 소비하는 검수 화면. 자산의 원본을 소유하지 않으며, 그 자체가 전달 대상 자산이다 |

채택한 UI는 성숙도와 관계없이 `packages/*`가 실제 원본을 소유한다. Studio는 공용 package를 import해 표시하며 같은 자산의 Studio 전용 복사본을 만들지 않는다.

Studio는 부품을 화면에서 확인하는 현재의 채널이자 Storybook의 기반이다. 최종적으로는 Storybook이 기획자와 개발자가 부품을 찾아보는 표준 채널이 되며, 그때까지 Studio의 화면 구성과 표기 기준을 [studio.md](studio.md)가 소유한다.

## 자산 분류

- **Component** — 독립적인 의미와 상태를 가진 비교적 작은 UI 요소. 예: `Button`, `Input`, `MessageBubble`
- **Pattern** — 여러 컴포넌트가 특정 목적을 위해 결합된 반복 가능한 구조. 예: `InboxSplitView`, `BreadcrumbPageHeader`
- **Block** — 독립적인 화면 섹션으로 사용할 수 있는 비교적 큰 조합. 예: `PricingSection`, `SettingsNavigation`
- **Template** — 페이지 또는 업무 흐름 전체. 예: `DirectMessageScreen`, `SettingsPage`

모든 `div`를 공용 컴포넌트로 추출하지 않는다. 독립적인 의미, 반복 사용, 자체 상태 또는 상호작용, 다른 화면에서 사용할 가능성이 있을 때만 자산으로 삼는다.

## 성숙도 읽는 법

각 자산 문서 상단의 성숙도는 다음을 뜻한다.

| 성숙도 | 뜻 |
| --- | --- |
| `Experiment` | 외부 원본을 구현하고 자유롭게 수정하는 단계 |
| `Candidate` | 재사용 후보로 추출했지만 첫 사용 사례만 존재하는 단계 |
| `Provisional` | 두 번째 화면이나 변형에서 재사용하여 API를 검증한 단계 |
| `Stable` | 토큰, API, 상태, 접근성과 테스트가 확정된 정식 자산 |

`Stable`은 package 이동 조건이 아니라 검증 완료 상태다. `Provisional` 이하의 결정은 확정된 것으로 가정하지 않는다.

## Foundation

| 문서 | 내용 |
| --- | --- |
| [foundations/color.md](foundations/color.md) | 색상 생성 규칙과 Light/Dark semantic mapping |
| [foundations/icon.md](foundations/icon.md) | 아이콘 공급원과 사용 규칙 |
| [foundations/catalog.md](foundations/catalog.md) | Foundation 표시 상태와 경로 |

## Component

현재 13개 컴포넌트가 상세 문서를 갖는다. 전부 `Candidate`다.

| 컴포넌트 | 문서 | 용도 |
| --- | --- | --- |
| Switch | [switch.md](components/switch.md) | 설정이나 기능을 즉시 켜고 끄는 Boolean control |
| Checkbox | [checkbox.md](components/checkbox.md) | 항목의 선택 여부와 부분 선택 상태를 표시하고 제어 |
| Radio | [radio.md](components/radio.md) | 여러 항목 중 하나를 선택 |
| Select | [select.md](components/select.md) | 검색 없이 짧은 옵션 목록에서 하나 또는 여러 값을 선택 |
| Select Box | [select-box.md](components/select-box.md) | 상세 정보를 펼쳐 놓고 비교하며 하나 이상의 값을 선택 |
| Combobox | [combobox.md](components/combobox.md) | Popup 내부 검색으로 미리 정의된 옵션을 필터링하고 선택 |
| Chip | [chip.md](components/chip.md) | Label 또는 Icon과 닫기 action으로 제거 가능한 항목을 표시 |
| Input | [input.md](components/input.md) | 한 줄 입력 |
| Input Button | [input-button.md](components/input-button.md) | Input과 같은 외관으로 달력·주소·시간 선택 화면을 여는 Trigger |
| Number Input | [number-input.md](components/number-input.md) | 숫자 직접 입력, 증감 버튼, 범위와 단위 |
| Textarea | [textarea.md](components/textarea.md) | 여러 줄 입력 |
| Badge | [badge.md](components/badge.md) | Badge, Dot Badge와 Number Badge |
| Message Bubble | [message-bubble.md](components/message-bubble.md) | 발신·수신, grouping, 전달 상태, 읽음 처리와 메시지 action |

`packages/ui`는 위 외에 `Button`, `PartialMaskedInput`, `MessageComposer`, `MessageFileAttachment`를 함께 제공하며 아직 상세 문서가 없다.

## Pattern

| 패턴 | 문서 | 용도 |
| --- | --- | --- |
| Breadcrumb Page Header | [breadcrumb-page-header.md](patterns/breadcrumb-page-header.md) | 경로와 페이지 제목을 함께 표시하는 화면 상단 |
| Collapsible Sidebar Nav | [collapsible-sidebar-nav.md](patterns/collapsible-sidebar-nav.md) | 접을 수 있는 좌측 내비게이션 |
| Inbox Split View | 없음 | 목록과 상세를 좌우로 나눈 화면. 문서 작성 예정 |
