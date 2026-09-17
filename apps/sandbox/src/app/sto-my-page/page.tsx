"use client";

/**
 * 사용자 마이페이지. 사장님 앱의 모바일 앱 화면이다. 프로필에는 아이디, 비밀번호, 점포, 이름,
 * 권한이 있고 수정 가능한 정보는 비밀번호만 있다. 비밀번호는 현재 비밀번호를 확인하고 조회가
 * 가능하게 한다.
 *
 * 정하지 않아 비워 둔 자리
 * - 아이디·점포·이름·권한과 조회된 비밀번호의 실제 값. 요청이 값을 주지 않아 `{…}` 자리로 둔다.
 * - AppHeader 좌우 자리. 요청이 나가는 길을 말하지 않아 Plain 유형으로 비워 둔다.
 * - 현재 비밀번호가 틀렸을 때의 오류 문구와 검증. 요청에 없어 두지 않는다.
 * - 화면 아래 Bottom Navigation. 요청이 다른 화면과의 이동을 말하지 않아 두지 않는다.
 *
 * Figma에서 고친 것을 되짚어 반영한 자리 (파일 aWkfgvM5CEXfYYSqGO3PgN, 프레임 3:3, 2026-09-16)
 * - 아이디·점포·이름·권한은 항목 이름을 왼쪽에, 값을 오른쪽 끝에 두는 한 줄 배치다. 두 칸이
 *   남은 폭을 반씩 나눠 갖고 서로 세로 가운데를 맞춘다.
 * - 비밀번호는 고치지 않았다. 항목 이름 아래에 현재 비밀번호 확인 폼이 그대로 선다.
 */

import { useState, type FormEvent, type ReactNode } from "react";

import { RiEyeLine, RiEyeOffLine } from "@remixicon/react";
import { AppHeader, Button, Input } from "@ooee/ui";

import { cn } from "@/lib/utils";

function ProfileRow({ term, stacked = false, children }: { term: string; stacked?: boolean; children: ReactNode }) {
  return (
    <div className={cn("flex gap-1.5 border-b border-oe-border-secondary py-4 last:border-b-0", stacked ? "flex-col" : "items-center")}>
      <dt className={cn("text-xs text-oe-foreground-tertiary", !stacked && "flex-1")}>{term}</dt>
      <dd className={cn("text-sm text-oe-foreground-primary", !stacked && "flex-1 text-right")}>{children}</dd>
    </div>
  );
}

export default function StoMyPage() {
  const [revealed, setRevealed] = useState(false);
  const [visible, setVisible] = useState(false);

  const confirmCurrentPassword = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRevealed(true);
  };

  return (
    <div className="min-h-dvh bg-oe-background-secondary">
      <div className="mx-auto flex min-h-dvh w-full max-w-[390px] flex-col border-oe-border-secondary bg-oe-background-primary sm:border-x">
        <AppHeader title="마이페이지" />

        <main className="flex-1 px-oe-padding-default">
          <dl className="flex flex-col">
            <ProfileRow term="아이디">{"{아이디}"}</ProfileRow>

            <ProfileRow term="비밀번호" stacked>
              {revealed ? (
                "{비밀번호}"
              ) : (
                <form onSubmit={confirmCurrentPassword} className="flex items-center gap-1.5">
                  <Input
                    type={visible ? "text" : "password"}
                    controlSize="large"
                    aria-label="현재 비밀번호"
                    placeholder="현재 비밀번호 입력"
                    autoComplete="current-password"
                    containerClassName="flex-1"
                    trailingElement={
                      <button
                        type="button"
                        aria-label={visible ? "비밀번호 숨기기" : "비밀번호 보기"}
                        onClick={() => setVisible((current) => !current)}
                        className="grid size-6 place-items-center rounded-md text-oe-foreground-tertiary outline-none transition-colors hover:bg-oe-interaction-hover hover:text-oe-foreground-primary focus-visible:ring-2 focus-visible:ring-oe-focus-ring"
                      >
                        {visible ? (
                          <RiEyeOffLine aria-hidden="true" className="size-oe-icon-small" />
                        ) : (
                          <RiEyeLine aria-hidden="true" className="size-oe-icon-small" />
                        )}
                      </button>
                    }
                  />
                  <Button type="submit" controlSize="large">
                    확인
                  </Button>
                </form>
              )}
            </ProfileRow>

            <ProfileRow term="점포">{"{점포명}"}</ProfileRow>
            <ProfileRow term="이름">{"{이름}"}</ProfileRow>
            <ProfileRow term="권한">{"{권한}"}</ProfileRow>
          </dl>
        </main>
      </div>
    </div>
  );
}
