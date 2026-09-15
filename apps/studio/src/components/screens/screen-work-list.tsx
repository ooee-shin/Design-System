import Link from "next/link";

import { RiArrowLeftLine, RiArrowRightLine } from "@remixicon/react";

import { getScreenRoot, type ScreenRoot } from "@/components/screens/screen-registry";
import { ScreenRootTabs } from "@/components/screens/screen-root-tabs";

/**
 * 한 루트에서 만들 화면의 목록이다. 루트로 들어오면 가장 먼저 이 화면을 만난다.
 *
 * 아직 만들지 않은 화면은 링크가 아니라 `예정`으로 둔다. 눌러서 빈 화면을 만나는 것보다 목록에서
 * 아직 없다는 것을 읽는 편이 낫다. Components 목록의 초안 카드와 같은 처리다.
 */
export function ScreenWorkList({ root: key }: { root: ScreenRoot["key"] }) {
  const root = getScreenRoot(key);
  const done = root.items.filter((item) => item.href).length;

  return (
    <main className="min-h-dvh bg-oe-background-secondary px-6 py-10">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-5">
        <header className="flex flex-col gap-2">
          {/* 세 목록 사이 이동은 아래 탭이 맡으므로, 여기서는 Studio 로 나가는 길만 둔다. */}
          <Link href="/" className="inline-flex w-fit items-center gap-1.5 text-xs text-oe-foreground-tertiary hover:text-oe-foreground-primary">
            <RiArrowLeftLine className="size-oe-icon-xsmall" aria-hidden="true" />
            Studio
          </Link>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-oe-foreground-primary">Screens</h1>
            <p className="mt-1 text-sm leading-6 text-oe-foreground-secondary">
              제품 화면을 구현하는 작업장입니다. 기능 화면을 한 건씩 만들며, 화면끼리 이어지는 데모가 아니므로 각 항목은 적어 둔 범위까지만 동작합니다.
            </p>
          </div>
        </header>

        {/* 어느 목록을 볼지는 탭이 고른다. 제목에 루트 이름을 또 적으면 같은 것이 두 번 서고,
            탭이 현재 위치를 이미 말하고 있으므로 아래에는 그 루트의 설명만 둔다. */}
        <ScreenRootTabs current={root.key} />

        <p className="-mt-2 text-xs leading-5 text-oe-foreground-tertiary">
          {root.note}{" "}
          <span className="tabular-nums">
            {done}/{root.items.length}
          </span>{" "}
          만들었습니다.
        </p>

        <ol className="flex flex-col gap-2">
          {root.items.map((item) => {
            const body = (
              <>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold tracking-tight text-inherit">{item.name}</h2>
                  {item.scope ? <p className="mt-0.5 text-xs leading-5 text-oe-foreground-tertiary">{item.scope}</p> : null}
                </div>
                {item.href ? (
                  <RiArrowRightLine className="size-oe-icon-small shrink-0 text-oe-foreground-tertiary transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                ) : (
                  <span className="shrink-0 rounded-full border border-oe-border-secondary px-2 py-0.5 text-[11px] text-oe-foreground-tertiary">예정</span>
                )}
              </>
            );

            return (
              <li key={item.key}>
                {item.href ? (
                  <Link
                    href={item.href}
                    className="group flex items-center gap-4 rounded-xl border border-oe-border-secondary bg-oe-background-primary p-4 text-oe-foreground-primary outline-none transition-colors hover:border-oe-border-primary focus-visible:ring-2 focus-visible:ring-oe-focus-ring"
                  >
                    {body}
                  </Link>
                ) : (
                  // 아직 만들지 않았어도 같은 흰 바닥 위에 둔다. 바닥을 빼면 회색 위의 회색 글자가 되어 무엇이
                  // 예정인지 읽히지 않는다. 상태는 오른쪽 `예정` 표시가 전달한다.
                  <div className="flex items-center gap-4 rounded-xl border border-dashed border-oe-border-secondary bg-oe-background-primary p-4 text-oe-foreground-secondary">{body}</div>
                )}
              </li>
            );
          })}
        </ol>
      </div>

    </main>
  );
}
