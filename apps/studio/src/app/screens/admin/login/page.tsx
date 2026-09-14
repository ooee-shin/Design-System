import { ScreenExitLink } from "@/components/screens/screen-chrome";

/**
 * 관리자 로그인 — 화면 실험.
 *
 * VibePrompt 의 Auth split screen 원본을 구조 그대로 옮겼다. `pipeline.md` 의 2단계이므로 raw
 * Tailwind 색과 직접 만든 입력을 **일부러** 그대로 둔다. 이 단계의 목적은 정규화가 아니라 전체
 * 구조와 반응형 동작, 유지할 부분과 바꿀 부분을 가려내는 것이다. 출처는 `sources.md` 가 갖는다.
 *
 * 다음 단계에서 바꿀 것이 이미 보인다. 입력 둘은 공용 `Input` 과 `Field`, 체크박스는 공용
 * `Checkbox`, 버튼 둘은 공용 `Button` 의 `fill` 과 `outline` 이 맡을 자리이고, `neutral-900` 은
 * `oe-foreground-primary` 와 `oe-background-bold-primary` 로 갈린다. 다만 그 판단은 화면에서
 * 비율과 밀도를 먼저 보고 하는 것이므로 여기서 앞당기지 않는다.
 */
export default function AdminLoginScreenPage() {
  return (
    <>
      <div className="flex min-h-screen">
        {/* Form */}
        <div className="flex w-full items-center justify-center px-6 lg:w-1/2">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <div className="mb-6 h-9 w-9 rounded-lg bg-neutral-900" />
              <h1 className="text-2xl font-semibold text-neutral-900">Welcome back</h1>
              <p className="mt-1 text-sm text-neutral-500">Sign in to continue to your account.</p>
            </div>

            <form className="space-y-4">
              <div>
                <label htmlFor="admin-login-email" className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Email
                </label>
                <input
                  id="admin-login-email"
                  type="email"
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm outline-none ring-neutral-900/10 focus:border-neutral-900 focus:ring-4"
                />
              </div>

              <div>
                <label htmlFor="admin-login-password" className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Password
                </label>
                <input
                  id="admin-login-password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm outline-none ring-neutral-900/10 focus:border-neutral-900 focus:ring-4"
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-neutral-600">
                  <input type="checkbox" className="rounded border-neutral-300" /> Remember me
                </label>
                <a href="#" className="font-medium text-neutral-900 hover:underline">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-neutral-900 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                Sign in
              </button>
            </form>

            <div className="my-6 flex items-center gap-3 text-xs text-neutral-400">
              <span className="h-px flex-1 bg-neutral-200" />
              OR
              <span className="h-px flex-1 bg-neutral-200" />
            </div>

            <button
              type="button"
              className="w-full rounded-xl border border-neutral-200 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              Continue with Google
            </button>
          </div>
        </div>

        {/* Visual */}
        <div className="hidden bg-neutral-900 lg:flex lg:w-1/2 lg:flex-col lg:justify-end lg:p-14">
          <blockquote className="max-w-md text-2xl leading-snug font-medium text-white">
            {"“This is the fastest we’ve ever shipped a product. It just works.”"}
          </blockquote>
          <p className="mt-4 text-sm text-neutral-400">Alex Rivera — CTO, Northwind</p>
        </div>
      </div>

      <ScreenExitLink backTo="/screens/admin" label="관리자" />
    </>
  );
}
