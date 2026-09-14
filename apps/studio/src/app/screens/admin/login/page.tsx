// `Field` 와 `Input` 은 `"use client"` 를 스스로 선언하지 않고 소비자 쪽을 전제한다. Studio 의
// 다른 워크벤치와 같다.
"use client";

import { Button, CheckboxField, Field, Input } from "@ooee/ui";

import { ScreenExitLink } from "@/components/screens/screen-chrome";

/**
 * 관리자 로그인.
 *
 * VibePrompt 의 Auth split screen 에서 구조를 가져왔고, `pipeline.md` 의 6단계에 따라 직접 만든
 * 입력과 raw Tailwind 색을 공용 컴포넌트와 `oe` 토큰으로 바꿨다. 출처는 `sources.md` 가 갖는다.
 *
 * 남은 자리는 셋이다. 로고, 오른쪽 패널의 내용, 그리고 로그인을 눌렀을 때의 동작이다.
 */

// 제목은 환경설정이 소유하는 시스템명이다. 실제 값이 붙기 전까지 어디서 오는 값인지 그대로 적는다.
const SYSTEM_NAME = "{환경설정 시스템명}";

export default function AdminLoginScreenPage() {
  return (
    <>
      <div className="flex min-h-dvh">
        <div className="flex w-full items-center justify-center px-6 lg:w-1/2">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              {/* 로고 자리. 무엇이 들어갈지 정하지 않았다. */}
              <div className="mb-6 size-9 rounded-lg bg-oe-background-bold-primary" />
              <h1 className="text-2xl font-semibold text-oe-foreground-primary">{SYSTEM_NAME}</h1>
              <p className="mt-1 text-sm text-oe-foreground-secondary">관리자 로그인</p>
            </div>

            {/* 한 줄 Control 은 Large 40px 을 쓴다. Field 와 묶이는 자리의 기준이다. */}
            <form className="flex flex-col gap-4">
              <Field label="아이디">
                <Input type="text" autoComplete="username" placeholder="아이디 입력" controlSize="large" />
              </Field>

              <Field label="비밀번호">
                <Input type="password" autoComplete="current-password" placeholder="비밀번호 입력" controlSize="large" />
              </Field>

              <div className="flex items-center justify-between">
                <CheckboxField label="아이디 저장" />
                <a
                  href="#"
                  className="rounded-sm text-sm font-medium text-oe-foreground-primary underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-oe-focus-ring"
                >
                  비밀번호 찾기
                </a>
              </div>

              <Button type="submit" layout="fill" controlSize="large" className="mt-2">
                로그인
              </Button>
            </form>
          </div>
        </div>

        {/* 오른쪽에 무엇을 둘지는 정하지 않았다. 자리만 남기고 비워 둔다. */}
        <div className="hidden bg-oe-background-bold-primary lg:block lg:w-1/2" />
      </div>

      <ScreenExitLink backTo="/screens/admin" label="관리자" />
    </>
  );
}
