import Link from "next/link";

import { RiArrowLeftLine, RiArrowRightLine } from "@remixicon/react";

import { getScreenRoot, type ScreenRoot } from "@/components/screens/screen-registry";

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
    <main className="min-h-dvh bg-oe-background-canvas-secondary px-6 py-10">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
        <header className="flex flex-col gap-2">
          <Link href="/screens" className="inline-flex w-fit items-center gap-1.5 text-xs text-oe-foreground-tertiary hover:text-oe-foreground-primary">
            <RiArrowLeftLine className="size-oe-icon-xsmall" aria-hidden="true" />
            Screens
          </Link>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-oe-foreground-primary">{root.name}</h1>
            <p className="mt-1 text-sm leading-6 text-oe-foreground-secondary">{root.note}</p>
            <p className="mt-2 text-xs leading-5 text-oe-foreground-tertiary">
              기능 화면을 한 건씩 만듭니다. 화면끼리 이어지는 데모가 아니므로 각 항목은 적어 둔 범위까지만 동작합니다.
              {" "}
              <span className="tabular-nums">
                {done}/{root.items.length}
              </span>
              {" "}만들었습니다.
            </p>
          </div>
        </header>

        <ol className="flex flex-col gap-2">
          {root.items.map((item) => {
            const body = (
              <>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold tracking-tight text-inherit">{item.name}</h2>
                  <p className="mt-0.5 text-xs leading-5 text-oe-foreground-tertiary">{item.scope}</p>
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
