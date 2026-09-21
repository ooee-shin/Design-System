"use client";

/**
 * 관리자 로그인. 블루키 관리자 웹의 로그인 화면이다. 데스크톱 1440 기준으로 화면을 좌우 절반으로
 * 나눈다. 왼쪽 절반은 로그인 폼 컬럼이고 오른쪽 절반은 브랜드 패널 자리이며 내용은 정하지 않아
 * 비워 둔다. lg 미만 폭에서는 왼쪽 컬럼만 전체 폭으로 보인다. 왼쪽 컬럼은 폼과 Footer 두 덩이다.
 * 폼은 남은 높이의 가운데에 서고 Footer는 바닥에 붙는다. 폼의 너비 상한은 384px이다. 폼 위에는
 * 로고 자리(36px 정사각, 내용 미정), 시스템명 제목, 그 아래 「관리자 로그인」이 있다. 아이디·비밀번호
 * 입력 두 개는 filled 스타일 XLarge이며 비밀번호는 오른쪽 눈 아이콘 버튼으로 보기·숨기기를 전환한다.
 * 그 아래 한 줄에 「아이디 저장」 체크박스와 「비밀번호 찾기」 링크가 양끝으로 서고, XLarge 「로그인」
 * 제출 버튼이 이어진다. Footer는 이용약관·개인정보처리방침 링크와 Copyright 문구를 가진다.
 *
 * 비워 둔 자리: 오른쪽 브랜드 패널의 실제 내용, 로고 이미지, 「비밀번호 찾기」·「이용약관」·
 * 「개인정보처리방침」의 실제 이동 경로(목적지가 없어 버튼으로만 자리를 둠), 로그인 제출 동작,
 * 시스템명·브랜드명(환경설정이 소유하는 값이라 `{…}` 자리로 둠).
 */

import { useState } from "react";
import { RiEyeLine, RiEyeOffLine } from "@remixicon/react";

import { Button, CheckboxField, Input } from "@ooee/ui";

export default function AdminLoginPage() {
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <div className="grid min-h-dvh w-full lg:grid-cols-2">
      <div className="flex min-h-dvh flex-col px-6 py-10 sm:px-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="h-9 w-9 rounded-md border border-oe-border-secondary bg-oe-background-secondary" />
              <div className="flex flex-col gap-1">
                <h1 className="text-lg font-semibold text-oe-foreground-primary">{"{환경설정 시스템명}"}</h1>
                <p className="text-sm text-oe-foreground-secondary">관리자 로그인</p>
              </div>
            </div>

            <form className="mt-8 flex flex-col gap-4" onSubmit={(event) => event.preventDefault()}>
              <Input
                variant="filled"
                controlSize="xlarge"
                type="text"
                autoComplete="username"
                placeholder="아이디 입력"
                aria-label="아이디"
              />

              <Input
                variant="filled"
                controlSize="xlarge"
                type={passwordVisible ? "text" : "password"}
                autoComplete="current-password"
                placeholder="비밀번호 입력"
                aria-label="비밀번호"
                trailingElement={
                  <button
                    type="button"
                    onClick={() => setPasswordVisible((visible) => !visible)}
                    aria-label={passwordVisible ? "비밀번호 숨기기" : "비밀번호 보기"}
                    className="flex items-center justify-center rounded-sm text-oe-foreground-tertiary outline-none hover:bg-oe-interaction-hover focus-visible:ring-2 focus-visible:ring-oe-focus-ring focus-visible:ring-offset-2"
                  >
                    {passwordVisible ? <RiEyeOffLine aria-hidden className="size-oe-icon-small" /> : <RiEyeLine aria-hidden className="size-oe-icon-small" />}
                  </button>
                }
              />

              <div className="flex items-center justify-between">
                <CheckboxField label="아이디 저장" className="-ml-2" />
                <a
                  href="#"
                  className="rounded-sm text-sm text-oe-foreground-secondary outline-none focus-visible:ring-2 focus-visible:ring-oe-focus-ring focus-visible:ring-offset-2"
                >
                  비밀번호 찾기
                </a>
              </div>

              <Button type="submit" controlSize="xlarge" layout="fill">
                로그인
              </Button>
            </form>
          </div>
        </div>

        <footer className="flex flex-col items-center gap-2 pb-2 text-center">
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="rounded-sm text-sm text-oe-foreground-secondary outline-none focus-visible:ring-2 focus-visible:ring-oe-focus-ring focus-visible:ring-offset-2"
            >
              이용약관
            </a>
            <a
              href="#"
              className="rounded-sm text-sm text-oe-foreground-secondary outline-none focus-visible:ring-2 focus-visible:ring-oe-focus-ring focus-visible:ring-offset-2"
            >
              개인정보처리방침
            </a>
          </div>
          <p className="text-xs text-oe-foreground-tertiary">Copyright © {"{브랜드명}"}. All rights reserved.</p>
        </footer>
      </div>

      <div className="hidden bg-oe-background-secondary lg:block" />
    </div>
  );
}
