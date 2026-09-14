// `Input` 은 `"use client"` 를 스스로 선언하지 않고 소비자 쪽을 전제한다. Studio 의 다른
// 워크벤치와 같다.
"use client";

import { useState } from "react";

import { RiEyeLine, RiEyeOffLine } from "@remixicon/react";

import { Button, buttonVariants, CheckboxField, Input } from "@ooee/ui";

import { cn } from "@/lib/utils";

import { ScreenExitLink } from "@/components/screens/screen-chrome";

/**
 * 관리자 로그인.
 *
 * VibePrompt 의 Auth split screen 에서 구조를 가져왔고, `pipeline.md` 의 6단계에 따라 직접 만든
 * 입력과 raw Tailwind 색을 공용 컴포넌트와 `oe` 토큰으로 바꿨다. 출처는 `sources.md` 가 갖는다.
 *
 * 남은 자리는 셋이다. 로고, 오른쪽 패널의 내용, 그리고 로그인을 눌렀을 때의 동작이다.
 */

// 제목과 저작권 표기는 환경설정이 소유하는 값이다. 실제 값이 붙기 전까지 어디서 오는 값인지
// 그대로 적는다.
const SYSTEM_NAME = "{환경설정 시스템명}";
const BRAND_NAME = "{BrandName}";

export default function AdminLoginScreenPage() {
  return (
    <>
      <div className="flex min-h-dvh">
        {/* 왼쪽 절반은 두 덩이다. 폼은 남은 높이의 가운데에 서고 Footer 는 바닥에 붙는다. */}
        <div className="flex w-full flex-col lg:w-1/2">
          <div className="flex flex-1 items-center justify-center px-6 py-10">
            <div className="w-full max-w-sm">
              <div className="mb-8">
                {/* 로고 자리. 무엇이 들어갈지 정하지 않았다. */}
                <div className="mb-6 size-9 rounded-lg bg-oe-background-bold-primary" />
                <h1 className="text-2xl font-semibold text-oe-foreground-primary">{SYSTEM_NAME}</h1>
                <p className="mt-1 text-sm text-oe-foreground-secondary">관리자 로그인</p>
              </div>

              <form className="flex flex-col gap-4">
                {/* 보이는 Label 을 두지 않으므로 이름은 `aria-label` 이 갖는다. Placeholder 는 값이
                    들어오면 사라지므로 이름을 대신할 수 없다. */}
                <Input type="text" autoComplete="username" placeholder="아이디 입력" aria-label="아이디" variant="filled" controlSize="large" />

                <PasswordInput />

                <div className="flex items-center justify-between">
                  {/* CheckboxField 는 사방 8px 의 내부 조작 여백을 갖는다. 그대로 두면 체크박스가
                    입력보다 8px 안쪽에서 시작하므로, `checkbox.md` 가 정한 대로 여백만큼 바깥으로
                    보정해 실제 Indicator 의 왼쪽 시작점을 입력에 맞춘다. */}
                <CheckboxField label="아이디 저장" className="-ml-2" />
                  <a
                    href="#"
                    className="rounded-sm text-sm font-medium text-oe-foreground-primary underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-oe-focus-ring"
                  >
                    비밀번호 찾기
                  </a>
                </div>

                <Button type="submit" layout="fill" controlSize="xlarge" className="mt-2">
                  로그인
                </Button>
                </form>
            </div>
          </div>

          <footer className="flex flex-col items-center gap-2 px-6 pb-8">
            <div className="flex items-center gap-1">
              <a href="#" className={cn(buttonVariants({ variant: "ghost", tone: "neutral", controlSize: "small" }))}>
                이용약관
              </a>
              <a href="#" className={cn(buttonVariants({ variant: "ghost", tone: "neutral", controlSize: "small" }))}>
                개인정보처리방침
              </a>
            </div>
            <p className="text-xs text-oe-foreground-tertiary">Copyright © {BRAND_NAME}. All rights reserved.</p>
          </footer>
        </div>

        {/* 오른쪽에 무엇을 둘지는 정하지 않았다. 자리만 남기고 비워 둔다. */}
        <div className="hidden bg-oe-background-bold-primary lg:block lg:w-1/2" />
      </div>

      <ScreenExitLink backTo="/screens/admin" label="관리자" />
    </>
  );
}

/**
 * `input.md` 가 정한 비밀번호 입력이다. 입력하는 동안에도 마스킹하고, 자기 입력을 확인해야 하는
 * 자리이므로 Trailing element 로 보기 전환을 둔다. 실제 `type` 을 `password` 와 `text` 로 바꾸며
 * 비밀번호용 Leading icon 은 쓰지 않는다.
 */
function PasswordInput() {
  const [visible, setVisible] = useState(false);

  return (
    <Input
      type={visible ? "text" : "password"}
      autoComplete="current-password"
      placeholder="비밀번호 입력"
      aria-label="비밀번호"
      variant="filled"
      controlSize="large"
      trailingElement={
        <button
          type="button"
          aria-label={visible ? "비밀번호 숨기기" : "비밀번호 보기"}
          onClick={() => setVisible((current) => !current)}
          className="grid size-6 place-items-center rounded-md text-oe-foreground-tertiary transition-colors hover:bg-oe-interaction-hover hover:text-oe-foreground-primary focus-visible:ring-2 focus-visible:ring-oe-focus-ring focus-visible:outline-none"
        >
          {visible ? <RiEyeOffLine className="size-oe-icon-small" aria-hidden="true" /> : <RiEyeLine className="size-oe-icon-small" aria-hidden="true" />}
        </button>
      }
    />
  );
}
