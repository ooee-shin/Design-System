# ooee-ui

`ooee-ui`는 외부에서 발견한 좋은 UI를 수집하고, 실제 화면 안에서 취향과 사용성을 검증한 뒤, 재사용 가능한 컴포넌트·패턴·템플릿으로 자산화하는 개인 UI 시스템이다.

shadcn/ui를 구현 기반으로 사용하지만 shadcn의 시각 언어를 그대로 유지하는 것이 목적은 아니다. shadcn 컴포넌트, Obra Kit, VibePrompt와 기타 바이브 코딩 자료를 입력으로 활용하고, 최종 결과물을 `oe` semantic token과 ooee의 컴포넌트 규칙으로 정규화한다.

이 문서는 프로젝트를 처음 보는 사람도 목적, 의사결정 기준, 제작 순서와 완료 조건을 이해할 수 있도록 정리한 기준 문서다.

새 작업이나 새로운 협업 환경에서는 `AGENTS.md`의 실행 규칙과 `docs/WORKING_CONTEXT.md`의 현재 상태를 함께 확인한다.

## 현재 환경

- Next.js App Router 기반 Studio: `apps/studio`
- React 19, TypeScript, Tailwind CSS v4
- shadcn CLI v4, Base UI, Nova 프리셋
- pnpm workspace

```bash
pnpm install
pnpm dev:studio
```

shadcn의 스타일과 토큰은 외부 자료를 받아들이는 초기 기준점이다. 검증을 마친 Stable 자산은 이후 `packages/tokens`, `packages/ui`, `packages/patterns`의 oe 계층으로 승격한다.

## 1. 프로젝트 목표

이 프로젝트가 만들려는 것은 단순한 shadcn 테마나 컴포넌트 모음이 아니다.

핵심 목표는 다음과 같다.

1. shadcn/ui를 기반으로 접근성 있고 수정 가능한 React 컴포넌트를 구현한다.
2. Obra Kit을 필요할 때 컴포넌트 품질과 Figma 구조를 판단하는 참고자료로 활용한다.
3. VibePrompt를 비롯한 외부 UI 자료를 ooee의 양식에 맞는 코드 자산으로 변환한다.
4. 완성된 화면에서 검증된 디자인 결정을 `oe` semantic token으로 축적한다.
5. 축적된 결과물을 컴포넌트, 패턴, 템플릿과 shadcn registry 형태로 재사용한다.
6. 장기적으로는 URL이나 외부 컴포넌트를 입력했을 때 반복적인 세부 핸드오프 없이 일정한 품질의 ooee 자산을 만드는 제작 환경을 구축한다.

한 문장으로 요약하면 다음과 같다.

> shadcn을 확장하는 시스템이 아니라, shadcn과 외부 UI 자료를 흡수하여 ooee 자산으로 만드는 시스템을 구축한다.

## 2. 각 자료의 역할

### shadcn/ui

shadcn/ui는 구현 기반이자 공급망이다.

- React 및 TypeScript 컴포넌트 구조
- Radix UI 또는 Base UI 기반 동작
- 접근성 구현의 출발점
- CLI와 `components.json`
- registry 규격
- 코드 소유 방식
- 외부 컴포넌트 생태계
- Skill, MCP, `--view`, `--dry-run`, `--diff`를 이용한 AI 작업 환경

shadcn의 코드는 출발점으로 활용하지만, 정식 ooee 자산으로 승격될 때 시각 토큰과 필요한 API를 ooee 기준으로 정규화한다.

### Obra shadcn/ui Pro Kit

Obra는 품질 참고자료다.

- Figma component property와 slot 구성
- Light/Dark 및 multi-brand variable 구성
- shadcn 컴포넌트의 크기, 간격, 상태와 variant
- semantic token과 Figma 변수의 대응
- Application, Marketing, Commerce Block 구성
- Figma와 React 사이의 연결 방식

Obra를 ooee의 최종 코드 언어로 삼지는 않는다. 구현 품질과 구조를 판단할 때 필요한 범위에서 참고한다.

### VibePrompt 및 기타 외부 UI 자료

외부 UI 자료는 화면과 제품 패턴을 발견하는 입력이다.

- 화면의 정보 구조
- 레이아웃과 반응형 동작
- 콘텐츠 조합
- 제품 시나리오
- 시각적 아이디어

외부 프롬프트 자체를 축적하는 것이 핵심은 아니다. 화면을 구현하고 수정한 뒤 그 안에서 재사용 가능한 컴포넌트, 패턴과 템플릿을 추출하는 것이 핵심이다.

외부 자료는 출처, 확인일과 사용 목적을 기록한다. 라이선스가 불명확한 자료는 복제·재배포 대상이 아니라 참고자료로 취급하고, 최종 구현은 ooee의 구조와 규칙으로 작성한다.

## 3. 핵심 제작 철학: Template First, Asset Later

ooee-ui는 기본 컴포넌트를 추상적으로 먼저 완성한 뒤 화면을 조립하는 방식으로만 만들지 않는다.

먼저 완성된 화면을 구현하고, 실제 화면 안에서 비주얼과 사용성을 수정한 뒤, 재사용할 가치가 있는 요소를 추출한다.

```text
외부 화면 선택
→ 화면 전체 구현
→ 실제 맥락에서 비주얼 수정
→ 상태와 인터랙션 보완
→ 재사용 후보 발견
→ oe token으로 정규화
→ Component/Pattern으로 추출
→ 다른 화면에서 재검증
→ Stable Asset으로 승격
```

예를 들어 채팅 화면을 자산화한다면 다음 순서로 진행한다.

```text
VibePrompt 채팅 화면 구현
→ Bubble 디자인 수정
→ incoming/outgoing, grouping, 전송 상태 정의
→ hover, selected, reply, failed 상태 검증
→ MessageBubble로 추출
→ 다른 채팅 화면에서 재사용
→ API와 토큰을 보완한 뒤 정식 자산 등록
```

이 과정에서 기본 컴포넌트도 화면으로부터 발견하고 고도화한다. 처음부터 Golden Component를 가정하지 않는다. 여러 화면에서 반복적으로 검증된 컴포넌트가 결과적으로 Golden Component가 된다.

## 4. 자산 분류

### Component

독립적인 의미와 상태를 가진 비교적 작은 UI 요소다.

예: `Button`, `Input`, `Avatar`, `MessageBubble`

### Pattern

여러 컴포넌트가 특정 목적을 위해 결합된 반복 가능한 구조다.

예: `MessageGroup`, `SearchFilterBar`, `ChatComposer`

### Block

독립적인 화면 섹션으로 사용할 수 있는 비교적 큰 조합이다.

예: `PricingSection`, `ConversationPanel`, `SettingsNavigation`

### Template

페이지 또는 업무 흐름 전체를 표현한다.

예: `DirectMessageScreen`, `SplitSignIn`, `SettingsPage`

모든 `div`를 공용 컴포넌트로 추출하지 않는다. 독립적인 의미, 반복 사용, 자체 상태 또는 상호작용, 다른 화면에서 사용할 가능성이 있을 때만 자산 후보로 삼는다.

## 5. 자산 성숙도

외부 화면에서 한 번 추출한 요소를 바로 안정된 공용 컴포넌트로 간주하지 않는다.

```text
Experiment
외부 원본을 구현하고 자유롭게 수정하는 단계

Candidate
재사용 후보로 추출했지만 첫 사용 사례만 존재하는 단계

Provisional
두 번째 화면이나 변형에서 재사용하여 API를 검증한 단계

Stable
토큰, API, 상태, 접근성과 테스트가 확정된 정식 자산
```

첫 화면에 과도하게 맞춰진 컴포넌트를 공용 시스템으로 확정하지 않기 위한 장치다.

## 6. 토큰 전략

### 기본 원칙

Primitive color는 별도의 `oe` scale로 복제하지 않고 Tailwind 기본 팔레트를 사용한다.

```text
neutral-*
red-*
amber-*
green-*
blue-*
```

Tailwind에 없는 브랜드 팔레트가 필요하면 `brand-*` scale을 추가할 수 있다.

Primitive는 semantic token을 정의할 때만 사용한다. 정식 컴포넌트에서 `text-red-700`, `bg-neutral-50` 같은 primitive class를 직접 사용하지 않는다.

`oe` prefix는 ooee가 정의한 semantic decision에만 사용한다.

### Neutral semantic token

Neutral token에서 `primary`와 `secondary`는 브랜드 primary가 아니라 동일 property 안의 시각적 위계다.

```text
oe-foreground-primary
oe-foreground-secondary
oe-foreground-disabled
oe-foreground-inverse

oe-background-primary
oe-background-secondary
oe-background-disabled

oe-border-primary
oe-border-secondary
oe-border-disabled
oe-border-focus
```

의미는 다음과 같다.

- `foreground`: 텍스트, 아이콘과 전경 SVG
- `background`: canvas와 surface
- `border`: outline과 divider의 색상
- `primary`: 해당 property 안에서 높은 기본 위계
- `secondary`: 해당 property 안에서 한 단계 낮은 위계
- `disabled`: 사용할 수 없는 상태
- `inverse`: 진한 표면 위의 범용 반전 foreground

`background-primary`는 기본 canvas, `background-secondary`는 그 위에 구분되는 surface로 정의한다. `border-primary`는 비교적 명확한 외곽이나 컨트롤 경계, `border-secondary`는 내부의 약한 divider로 정의한다.

초기 버전에서는 `tertiary`를 만들지 않는다. 실제 사용 사례에서 `secondary`만으로 서로 다른 의미를 처리해야 하는 문제가 반복될 때 추가를 검토한다.

### Semantic status token

일반적으로 이해하기 쉬운 상태 용어를 사용한다.

```text
danger
warning
success
info
```

각 상태는 foreground, background, border와 primary/secondary 위계를 조합할 수 있다.

```text
oe-danger-foreground-primary
oe-danger-foreground-secondary
oe-danger-background-primary
oe-danger-background-secondary
oe-danger-border-primary
oe-danger-border-secondary
```

`warning`, `success`, `info`도 같은 문법을 따른다.

Semantic status에서 `primary`는 같은 role/property 안에서 더 높은 강조와 대비, `secondary`는 한 단계 낮은 강조와 대비를 뜻한다. 특정 Tailwind 숫자를 뜻하지 않는다.

예를 들어 Light theme에서 `danger-foreground-primary`가 `red-800`, Dark theme에서 `red-300`에 연결될 수 있다. 이름은 역할을 나타내고 primitive 값은 테마별 구현이다.

### Opaque와 Overlay

불투명 색상을 기본값으로 보고 이름에서 별도 modifier를 생략한다.

```text
oe-warning-background-primary
oe-warning-background-secondary
```

다른 surface의 색을 투과하며 합성해야 하는 경우에만 `overlay`를 명시한다.

```text
oe-warning-background-overlay-primary
oe-warning-background-overlay-secondary
```

전체 문법은 다음과 같다.

```text
Neutral opaque
oe-{property}-{hierarchy}

Neutral overlay
oe-{property}-overlay-{hierarchy}

Semantic opaque
oe-{role}-{property}-{hierarchy}

Semantic overlay
oe-{role}-{property}-overlay-{hierarchy}
```

`alpha`는 구현 방식이고 `overlay`는 사용 목적이므로 이름에는 `overlay`를 사용한다.

모든 토큰에 overlay variant를 미리 만들지 않는다. 실제로 surface 합성이 필요한 사용 사례가 확인될 때만 추가한다.

이미지나 영상 위 UI처럼 일반 surface와 본질적으로 다른 맥락이 반복되면 `media` context token을 별도로 검토한다.

```text
oe-media-foreground-primary
oe-media-background-primary
oe-media-border-secondary
```

이미지 위의 alpha border는 이미지 내용에 따라 대비가 달라질 수 있으므로 scrim, shadow 또는 이중 대비가 함께 필요할 수 있다.

## 7. 토큰을 추가하는 기준

토큰은 가능한 모든 조합을 미리 만드는 것이 아니라 실제 화면에서 발견하고 승격한다.

기본 규칙은 다음과 같다.

```text
첫 번째 사용
→ 로컬 값으로 유지

두 번째 동일 의미
→ token candidate로 기록

세 번째 동일 의미
→ semantic token 승격
```

다만 서로 다른 독립 컴포넌트 두 곳에서 같은 의미로 필요성이 명확하다면 세 번째 사례를 기다리지 않고 승격할 수 있다.

횟수보다 중요한 것은 같은 색상인지가 아니라 같은 의미와 역할인지다.

예를 들어 `white/20`이 이미지 border, backdrop, hover background에 사용되었다고 해서 하나의 토큰으로 합치지 않는다. 값은 같아도 역할이 다르기 때문이다.

다음 항목은 첫 사용부터 토큰화할 수 있다.

- Light/Dark에서 서로 다른 값이 필요한 결정
- focus와 같이 접근성에 직접 영향을 주는 값
- 여러 컴포넌트가 공유할 것이 명확한 전역 상태
- 한 번에 변경해야 할 시스템 수준의 결정

좋은 token은 사용 방법을 한 문장으로 설명할 수 있어야 한다.

## 8. 외부 자료를 가져오는 단계

### 1. Source 기록

URL, 출처, 확인일, 라이선스 상태와 참고 목적을 기록한다.

### 2. Experiment 구현

원본의 구조와 동작을 빠르게 확인한다. 이 단계에서는 raw Tailwind color와 shadcn token을 임시로 허용한다.

목적은 정규화가 아니라 다음을 파악하는 것이다.

- 전체 구조
- 반응형 동작
- 원본의 장단점
- 유지할 부분과 변경할 부분

### 3. Art direction

실제 화면 안에서 ooee의 취향과 품질 기준에 맞게 수정한다.

- 비율과 밀도
- spacing과 radius
- foreground 위계
- surface와 border 관계
- hover, pressed, selected, focus
- loading, error, empty, disabled
- 모바일과 데스크톱
- Light/Dark

### 4. Asset candidate 선정

재사용 가치가 있는 Component, Pattern, Block과 Template을 구분한다.

### 5. 상태와 API 정의

단순한 기본 모양뿐 아니라 콘텐츠 변형, 상태, 상호작용과 접근성을 정의한다.

### 6. Token normalization

비주얼 방향이 안정된 뒤 primitive와 shadcn visual token을 `oe` semantic token으로 변환한다.

토큰 매핑은 색상 값 치환이 아니다. 해당 색상이 어떤 property와 의미, 위계, surface 관계를 표현하는지 판단하는 과정이다.

### 7. 추출과 검증

컴포넌트 또는 패턴으로 추출하고, 원래 화면은 실제 사용 예제와 시각 회귀 기준으로 유지한다. 다른 화면에서 재사용하며 API가 과도하게 첫 화면에 맞춰지지 않았는지 확인한다.

### 8. Stable 승격과 배포

품질 기준을 통과한 자산만 정식 package와 `@ooee` registry에 등록한다.

## 9. 단계별 코드 규칙

| 단계 | Tailwind primitive | shadcn visual token | `oe` token |
|---|---:|---:|---:|
| Experiment | 허용 | 허용 | 선택 |
| Candidate | 제한적으로 허용 | 제한적으로 허용 | 권장 |
| Stable Asset | 금지 | 금지 | 필수 |

shadcn은 구현의 입력으로 사용한다. 정식 ooee 자산에서는 다음을 유지할 수 있다.

- primitive 동작
- 접근성 구조
- event 처리
- component composition
- CVA variant 구조
- ref 처리

반면 다음은 ooee 기준으로 변환한다.

- shadcn color token
- raw Tailwind color
- 시각적 variant
- 필요한 spacing과 radius
- ooee 컴포넌트 API

shadcn token과 `oe` token을 영구적으로 함께 사용하는 것이 목표가 아니다. shadcn token의 의미와 사용처를 분석한 뒤 정식 자산에서는 `oe`로 정규화한다.

## 10. shadcn 바이브 코딩 환경

초기 환경은 shadcn CLI v4 관련 워크플로우를 참고해 구성한다.

- 프로젝트 설정을 읽는 shadcn Skill
- 최신 문서와 registry를 조회하는 MCP
- `components.json`
- `shadcn info`
- 변경 전 `--view`, `--dry-run`, `--diff`
- 프로젝트 전용 ooee 작업 규칙

shadcn Skill은 shadcn 사용법을 제공하지만 ooee의 취향과 품질 기준까지 알지는 못한다. 자산화 절차가 안정되면 다음 내용을 포함하는 프로젝트 전용 Skill을 만든다.

- 저장소 구조
- `oe` token 문법과 사용 규칙
- shadcn 및 외부 자료 변환 절차
- 컴포넌트 API 원칙
- 렌더링과 테스트 명령
- 품질 완료 조건

## 11. 품질 기준

완성도는 개인의 기억이나 반복적인 핸드오프에만 의존하지 않고 검증 가능한 기준으로 축적한다.

### 코드

- TypeScript와 lint 통과
- 정식 자산에서 raw primitive color 0개
- 정식 자산에서 shadcn visual token 0개
- 기존 ooee 컴포넌트 재사용
- 의미 없는 wrapper와 불필요한 abstraction 최소화

### 상태

자산의 성격에 따라 필요한 상태를 확인한다.

- default
- hover
- pressed
- focus
- selected
- disabled
- loading
- error
- empty
- long content

모든 컴포넌트에 모든 상태를 강제로 만들지는 않는다. 실제 의미가 있는 상태만 정의하되, 누락 여부는 명시적으로 검토한다.

### 반응형과 테마

- Mobile, Tablet, Desktop 검증
- Light/Dark 검증
- overflow와 긴 콘텐츠 검증

### 접근성

- keyboard navigation
- visible focus
- accessible name
- label과 error 연결
- 필요한 경우 `aria-live`
- 색상만으로 상태를 전달하지 않음
- 일반 텍스트 4.5:1, 큰 텍스트와 필수 UI 3:1 대비를 기본 목표로 함

### 시각 검증

승인된 화면과 주요 상태의 스크린샷을 기준으로 유지하고 시각 회귀를 확인한다. 개별 색상만 보지 않고 foreground/background/border 조합을 검증한다.

## 12. 초기 실행 순서

### Phase 1: 환경

1. React/TypeScript/Tailwind/shadcn 프로젝트 구성
2. Skill, MCP와 shadcn 진단·diff 워크플로우 구성
3. 문서와 preview 환경 구성
4. 접근성 및 시각 검증 기반 구성

### Phase 2: 최소 token v0

1. token 문법과 분류 원칙 확정
2. 최소 neutral/status token을 임시 값으로 정의
3. 실제 색상과 전체 목록은 확정하지 않음

### Phase 3: 대표 화면

VibePrompt 등에서 서로 다른 성격의 화면을 선택한다.

- 채팅 또는 인증 화면: form, message, content hierarchy
- 데이터 화면: table, divider, hover, selected
- 설정 화면: nested surface, navigation, destructive action

Obra를 품질 참고자료로 활용해 전체 화면을 먼저 완성한다.

### Phase 4: 자산 추출

화면에서 발견한 요소를 Candidate로 추출하고 상태, API와 접근성을 정의한다. 두 번째 실제 사용에서 재검증한다.

### Phase 5: token v1과 변환 규칙

대표 화면과 자산에서 검증된 token만 v1으로 확정한다. shadcn token의 사용 문맥을 분석해 자동 변환, 문맥별 변환, 수동 검토 항목을 구분한다.

### Phase 6: 반복 자동화

다음 작업을 순차적으로 자동화한다.

- raw color와 shadcn token 검사
- token candidate 기록
- Story 및 상태 preview 생성
- 접근성 검사
- viewport별 screenshot
- visual regression
- registry item 생성
- ooee 프로젝트 Skill

## 13. 현재 확정된 것과 아직 열려 있는 것

### 확정된 원칙

- shadcn은 구현 기반, `oe`는 최종 시각 언어다.
- 외부 화면을 먼저 완성하고 내부에서 자산을 추출한다.
- Primitive는 Tailwind 기본 팔레트를 사용한다.
- `oe`는 semantic token에만 사용한다.
- foreground는 텍스트와 아이콘을 우선 통합한다.
- neutral hierarchy는 초기에는 primary/secondary만 사용한다.
- semantic role은 danger/warning/success/info를 사용한다.
- 불투명 색상은 기본값으로 이름에서 생략한다.
- 반투명 합성이 필요할 때만 overlay를 명시한다.
- 토큰은 실제 반복 사례에서 발견하고 승격한다.
- 최종 Stable Asset에는 `oe` token만 남긴다.

### 화면을 만들며 검증할 항목

- 실제 Light/Dark 색상값
- brand 및 interactive token의 정확한 범위
- hover, pressed, selected token 구조
- background surface가 primary/secondary만으로 충분한지
- input border와 section border의 분리 필요성
- media context token의 필요성과 범위
- 상태별 overlay token의 실제 필요성
- component-specific token 도입 기준
- shadcn token별 자동·문맥·수동 변환 규칙

## 14. 참고 자료

- [pxd: shadcn과 함께 UI 컴포넌트를 AI 에이전트와 더 잘 쓰는 방법](https://tech.pxd.co.kr/post/shadcn%EA%B3%BC-%ED%95%A8%EA%BB%98-UI-%EC%BB%B4%ED%8F%AC%EB%84%8C%ED%8A%B8%EB%A5%BC-AI-%EC%97%90%EC%9D%B4%EC%A0%84%ED%8A%B8%EC%99%80-%EB%8D%94-%EC%9E%98%EC%93%B0%EB%8A%94-%EB%B0%A9%EB%B2%95-340)
- [VibePrompt](https://vibeprompts.dev/)
- [Obra shadcn/ui Pro](https://shadcn.obra.studio/products/obra-shadcn-ui-pro)
- [Obra license](https://shadcn.obra.studio/license)
- [Atlassian Design Tokens](https://atlassian.design/foundations/tokens/design-tokens/)
- [GitHub Primer Color Usage](https://www.primer.style/product/getting-started/foundations/color-usage/)
