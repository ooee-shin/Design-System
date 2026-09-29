import { BrandThemeProvider } from "@/components/brand-theme-provider";

/**
 * 블루키 리뉴얼 — Studio 의 `/screens` 에서 옮겨 온 제품 화면 작업장이다(2026-09-22).
 *
 * route group `(renewal)` 로 둔 까닭은 브랜드 테마다. 주소는 `/renewal/…` 그대로 두면서, 레이아웃·
 * 테마설정 화면이 브랜드 색을 바꿔 보므로 이 구역만 브랜드 테마를 감싼다. Studio 에서는 루트 layout 이
 * 감싸 주던 것이다.
 *
 * **이 아래도 화면 규칙 검사 대상이다.** 두 검사(`plugins/ooee-harness/lib/check-screens.mjs`,
 * `src/screen-rules.test.tsx`)는 `2026-09-29` 부터 `src/app` 아래를 재귀로 훑어 여기 있는 화면을
 * 모두 센다. 넓히기 전에 이미 있던 위반만 `src/screen-rules-legacy.json` 에 예외로 적어 두었다.
 * route group 은 검사를 피하는 수단이 아니므로, 검사에 걸린 화면을 이 아래로 옮기지 않는다.
 */
export default function RenewalLayout({ children }: { children: React.ReactNode }) {
  return <BrandThemeProvider>{children}</BrandThemeProvider>;
}
