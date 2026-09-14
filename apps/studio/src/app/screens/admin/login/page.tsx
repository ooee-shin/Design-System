import { ScreenExitLink } from "@/components/screens/screen-chrome";

/**
 * 관리자 로그인 — 화면 실험.
 *
 * VibePrompt 의 Auth split screen 구조를 가져와 관리자 로그인의 문구와 구성으로 바꿨다.
 * `pipeline.md` 의 2단계이므로 raw Tailwind 색과 직접 만든 입력을 **일부러** 그대로 둔다.
 * 이 단계의 목적은 정규화가 아니라 전체 구조와 반응형 동작, 유지할 부분과 바꿀 부분을 가려내는
 * 것이다. 출처는 `sources.md` 가 갖는다.
 *
 * 다음 단계에서 바꿀 것이 이미 보인다. 입력 둘은 공용 `Input` 과 `Field`, 체크박스는 공용
 * `Checkbox`, 버튼은 공용 `Button` 의 `fill` 이 맡을 자리이고, `neutral-900` 은
 * `oe-foreground-primary` 와 `oe-background-bold-primary` 로 갈린다. 다만 그 판단은 화면에서
 * 비율과 밀도를 먼저 보고 하는 것이므로 여기서 앞당기지 않는다.
 */

// 제목은 환경설정이 소유하는 시스템명이다. 실제 값이 붙기 전까지 어디서 오는 값인지 그대로 적는다.
const SYSTEM_NAME = "{환경설정 시스템명}";

export default function AdminLoginScreenPage() {
  return (
    <>
      <div className="flex min-h-screen">
        {/* Form */}
        <div className="flex w-full items-center justify-center px-6 lg:w-1/2">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <div className="mb-6 h-9 w-9 rounded-lg bg-neutral-900" />
              <h1 className="text-2xl font-semibold text-neutral-900">{SYSTEM_NAME}</h1>
              <p className="mt-1 text-sm text-neutral-500">관리자 로그인</p>
            </div>

            <form className="space-y-4">
              <div>
                <label htmlFor="admin-login-id" className="mb-1.5 block text-sm font-medium text-neutral-700">
                  아이디
                </label>
                <input
                  id="admin-login-id"
                  type="text"
                  autoComplete="username"
                  placeholder="아이디 입력"
                  className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm outline-none ring-neutral-900/10 focus:border-neutral-900 focus:ring-4"
                />
              </div>

              <div>
                <label htmlFor="admin-login-password" className="mb-1.5 block text-sm font-medium text-neutral-700">
                  비밀번호
                </label>
                <input
                  id="admin-login-password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="비밀번호 입력"
                  className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm outline-none ring-neutral-900/10 focus:border-neutral-900 focus:ring-4"
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-neutral-600">
                  <input type="checkbox" className="rounded border-neutral-300" /> 아이디 저장
                </label>
                <a href="#" className="font-medium text-neutral-900 hover:underline">
                  비밀번호 찾기
                </a>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-neutral-900 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                로그인
              </button>
            </form>
          </div>
        </div>

        {/* Visual */}
        {/* 오른쪽에 무엇을 둘지는 정하지 않았다. 자리만 남기고 비워 둔다. */}
        <div className="hidden bg-neutral-900 lg:block lg:w-1/2" />
      </div>

      <ScreenExitLink backTo="/screens/admin" label="관리자" />
    </>
  );
}
