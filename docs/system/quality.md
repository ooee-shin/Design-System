# 품질 기준

공용 자산이 충족해야 하는 조건이다. 작업자의 기억이나 반복적인 핸드오프에 의존하지 않고 검증 가능한 기준으로 유지한다.

## 상태

자산의 성격에 따라 필요한 상태를 확인한다.

```text
default
hover
pressed
focus
selected
disabled
loading
error
empty
long content
```

모든 컴포넌트에 모든 상태를 강제로 만들지는 않는다. 실제 의미가 있는 상태만 정의하되 누락 여부는 명시적으로 검토한다. **일반적으로 있을 법하지만 현재 구현이나 정책에 없는 상태는 만들지 않고 해당 컴포넌트 문서에 `현재 정의 없음`으로 기록한다.** 상태 조합에서 색상이나 우선순위 판단이 필요한 경우 임의로 선택하지 않는다.

## 접근성

- keyboard navigation
- visible focus
- accessible name
- label과 error 연결
- 필요한 경우 `aria-live`
- 색상만으로 상태를 전달하지 않음
- 일반 텍스트 4.5:1, 큰 텍스트와 필수 UI 3:1 대비를 기본 목표로 함

## 반응형과 테마

- Mobile, Tablet, Desktop 검증
- Light/Dark 검증
- overflow와 긴 콘텐츠 검증

중단점은 Tailwind 기본값을 그대로 쓴다. `sm` 640, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1536이며 저장소는 이 값을 재정의하지 않는다.

**관리자 웹은 `lg`까지만 대응한다.** 최소 폭이 `1024px`이고 그보다 좁아지면 화면을 다시 짜지 않고 가로로 스크롤한다. 관리자는 PC에서만 쓰는 화면이므로 태블릿과 모바일 구간을 설계하지 않는다. 앱 화면은 이 규칙을 따르지 않으며 모바일 뷰가 기준이다.

## 코드

- TypeScript와 lint 통과
- 정식 자산에서 raw primitive color 0개
- 정식 자산에서 shadcn visual token 0개
- 기존 ooee 컴포넌트 재사용
- 의미 없는 wrapper와 불필요한 abstraction 최소화
