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

컴포넌트별 미결 항목은 각 `docs/system/components/*.md`의 `현재 정의 없음`과 `확인 필요` 항목에 있다. 진행 중인 작업과 우선순위는 [working-context.md](working-context.md)를 본다.
