import Link from "next/link";

import { RiArrowLeftLine, RiArrowRightLine } from "@remixicon/react";

import { screenRoots } from "@/components/screens/screen-registry";

/**
 * 세 제품 화면으로 들어가는 자리다. Studio 메뉴에는 올리지 않는다. 검수 대상인 자산이 아니라
 * 화면을 만드는 작업장이며, 카탈로그와 섞이면 무엇이 확정된 자산인지 흐려진다.
 */
export default function ScreensIndexPage() {
  return (
    <main className="min-h-dvh bg-oe-background-canvas-secondary px-6 py-10">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
        <header className="flex flex-col gap-2">
          <Link href="/" className="inline-flex w-fit items-center gap-1.5 text-xs text-oe-foreground-tertiary hover:text-oe-foreground-primary">
            <RiArrowLeftLine className="size-oe-icon-xsmall" aria-hidden="true" />
            Studio
          </Link>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-oe-foreground-primary">Screens</h1>
            <p className="mt-1 text-sm leading-6 text-oe-foreground-secondary">
              제품 화면을 구현하는 작업장입니다. Studio 의 문서형 레이아웃을 따르지 않고 화면마다 자기 레이아웃 규칙을 갖습니다.
            </p>
          </div>
        </header>

        <nav aria-label="제품 화면" className="flex flex-col gap-2">
          {screenRoots.map((root) => {
            const done = root.items.filter((item) => item.href).length;

            return (
              <Link
                key={root.key}
                href={`/screens/${root.key}`}
                className="group flex items-center gap-4 rounded-xl border border-oe-border-secondary bg-oe-background-primary p-4 outline-none transition-colors hover:border-oe-border-primary focus-visible:ring-2 focus-visible:ring-oe-focus-ring"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <h2 className="font-semibold tracking-tight text-oe-foreground-primary">{root.name}</h2>
                    <span className="text-[11px] tabular-nums text-oe-foreground-tertiary">
                      {done}/{root.items.length}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs leading-5 text-oe-foreground-tertiary">{root.note}</p>
                </div>
                <RiArrowRightLine className="size-oe-icon-small shrink-0 text-oe-foreground-tertiary transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            );
          })}
        </nav>
      </div>
    </main>
  );
}
