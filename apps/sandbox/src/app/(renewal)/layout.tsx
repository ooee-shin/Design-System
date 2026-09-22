import { BrandThemeProvider } from "@/components/brand-theme-provider";

/**
 * 블루키 리뉴얼 — Studio 의 `/screens` 에서 옮겨 온 제품 화면 작업장이다(2026-09-23).
 *
 * route group `(renewal)` 로 둔 까닭은 둘이다. 주소는 `/renewal/…` 그대로 두면서, sandbox 의 화면 규칙
 * 검사(`plugins/ooee-harness/lib/check-screens.mjs`, `src/screen-rules.test.tsx`)가 이 화면들을
 * `/generate-code` 가 만든 화면으로 읽지 않게 한다 — 두 검사는 `src/app` 바로 아래에 `page.tsx` 를 가진
 * 폴더만 화면으로 센다. 그리고 레이아웃·테마설정 화면이 브랜드 색을 바꿔 보므로 이 구역만 브랜드 테마를
 * 감싼다. Studio 에서는 루트 layout 이 감싸 주던 것이다.
 */
export default function RenewalLayout({ children }: { children: React.ReactNode }) {
  return <BrandThemeProvider>{children}</BrandThemeProvider>;
}
