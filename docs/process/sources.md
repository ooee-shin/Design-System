# 입력 자료

외부 자료는 화면과 패턴을 발견하는 입력이며, 최종 결과물은 `oe` semantic token과 ooee 컴포넌트 규칙으로 정규화한다. 외부 코드를 그대로 확정된 자산으로 취급하지 않는다.

## 고정된 역할

- **shadcn/ui** — 구현 기반이자 공급망
- **Obra shadcn/ui Pro Kit** — 필요할 때 사용하는 품질 및 Figma 참고자료
- **Seed Design** — Form 구조와 컴포넌트 경계를 참고하는 입력
- **VibePrompt와 기타 외부 UI** — 화면과 제품 패턴을 발견하는 입력
- **oe** — 검수 후 확정한 semantic token과 컴포넌트 규칙

## shadcn/ui

구현 기반으로 다음을 활용한다.

- React 및 TypeScript 컴포넌트 구조
- Radix UI 또는 Base UI 기반 동작
- 접근성 구현의 출발점
- CLI와 `components.json`, registry 규격, 코드 소유 방식
- 외부 컴포넌트 생태계

정식 ooee 자산에서 유지할 수 있는 것은 primitive 동작, 접근성 구조, event 처리, component composition, CVA variant 구조와 ref 처리다. 반면 shadcn color token, raw Tailwind color, 시각적 variant, spacing과 radius, 컴포넌트 API는 ooee 기준으로 변환한다.

shadcn token과 `oe` token을 영구적으로 함께 사용하는 것이 목표가 아니다. shadcn token의 의미와 사용처를 분석한 뒤 정식 자산에서는 `oe`로 정규화한다. shadcn update를 oe에 자동 덮어쓰지 않으며 화면 실험에서 차이를 검수한 뒤 선별적으로 반영한다.

## Obra shadcn/ui Pro Kit

품질 참고자료다.

- Figma component property와 slot 구성
- Light/Dark 및 multi-brand variable 구성
- shadcn 컴포넌트의 크기, 간격, 상태와 variant
- semantic token과 Figma 변수의 대응
- Application, Marketing, Commerce Block 구성
- Figma와 React 사이의 연결 방식

Obra를 ooee의 최종 코드 언어로 삼지 않는다. 구현 품질과 구조를 판단할 때 필요한 범위에서 참고한다. Obra Pro 자료는 실행 필수 의존성이 아니며 repository에 포함하지 않는다.

## Seed Design

당근이 공개한 디자인 시스템이며 Form 구조와 컴포넌트 경계를 참고한다. 공개 문서를 참고자료로만 사용하며 항목마다 확인일을 적는다.

- Text Input은 공용 Input의 구조와 상태를 정리할 때 참고했다.
- Field는 Header·Input slot·Footer 세 층 구조, 오류가 도움말을 대체하는 규칙, Character count의 자리를 참고했다. Seed가 `Suffix Slot`이라고 부르는 Header 오른쪽 자리는 저장소가 이미 `prefix`·`suffix`를 짧은 표기 자리로 쓰고 있어 `trailingElement`로 바꿔 들였다. 화면의 필수 항목 비율에 따라 표기를 뒤집는 규칙과 Label weight 두 단계는 들이지 않았다.
- Seed가 Field 위에 두는 `Fieldset`과 `Form` 층은 현재 범위에 넣지 않았다.
- Bottom Navigation은 항목 수 상한 다섯, 라벨 길이 기준(국문 다섯 자·영문 열 자), 배지를 동시에 세 항목 미만에만 붙이는 규칙, 항목 목록의 480px 폭 상한을 참고했다. 확인일은 `2026-09-11`이다. 선택 여부와 무관하게 `Fill` 아이콘을 유지하는 규칙도 함께 들여왔고 근거를 `icon.md`에 적었다. 북미·일본 앱에서 탭 하나를 대신하는 가운데 글쓰기 버튼은 들이지 않았다.

## VibePrompt 및 기타 외부 UI 자료

화면과 제품 패턴을 발견하는 입력이다. 정보 구조, 레이아웃과 반응형 동작, 콘텐츠 조합, 제품 시나리오와 시각적 아이디어를 본다.

- Auth split screen은 관리자 로그인 화면의 출발점으로 들여왔다. 확인일은 `2026-09-14`이며 `/screens/admin/login`에 원본 구조 그대로 두었다. 왼쪽 로그인 카드와 오른쪽 브랜드 패널이 `lg`에서 갈리는 구성, 카드 폭 상한, 구분선과 소셜 로그인 버튼의 자리를 본다. 아직 `oe` 토큰으로 바꾸지 않은 2단계 상태다.

외부 프롬프트 자체를 축적하는 것이 핵심은 아니다. 화면을 구현하고 수정한 뒤 그 안에서 재사용 가능한 컴포넌트, 패턴과 템플릿을 추출하는 것이 핵심이다.

외부 자료는 출처, 확인일과 사용 목적을 기록한다. 라이선스가 불명확한 자료는 복제·재배포 대상이 아니라 참고자료로 취급하고, 최종 구현은 ooee의 구조와 규칙으로 작성한다.

## 참고 링크

- [pxd: shadcn과 함께 UI 컴포넌트를 AI 에이전트와 더 잘 쓰는 방법](https://tech.pxd.co.kr/post/shadcn%EA%B3%BC-%ED%95%A8%EA%BB%98-UI-%EC%BB%B4%ED%8F%AC%EB%84%8C%ED%8A%B8%EB%A5%BC-AI-%EC%97%90%EC%9D%B4%EC%A0%84%ED%8A%B8%EC%99%80-%EB%8D%94-%EC%9E%98%EC%93%B0%EB%8A%94-%EB%B0%A9%EB%B2%95-340)
- [VibePrompt](https://vibeprompts.dev/)
- [VibePrompt Auth split screen with visual](https://vibeprompts.dev/auth/auth-split-screen-with-visual/)
- [Obra shadcn/ui Pro](https://shadcn.obra.studio/products/obra-shadcn-ui-pro)
- [Obra license](https://shadcn.obra.studio/license)
- [Seed Design Field](https://seed-design.io/components/field)
- [Atlassian Design Tokens](https://atlassian.design/foundations/tokens/design-tokens/)
- [GitHub Primer Color Usage](https://www.primer.style/product/getting-started/foundations/color-usage/)
