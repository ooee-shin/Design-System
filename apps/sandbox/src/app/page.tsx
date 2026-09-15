import Link from "next/link";

import { sandboxScreens } from "@/screens";

export default function SandboxIndexPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8 sm:px-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-oe-foreground-primary">ooee sandbox</h1>
        <p className="text-sm text-oe-foreground-secondary">
          <code className="rounded-sm bg-oe-background-secondary px-1 py-0.5 text-oe-foreground-primary">/generate-code</code> 가 만든
          화면이다. 전달 범위 밖이며 채택 여부는 신주희가 정한다.
        </p>
      </header>

      {sandboxScreens.length === 0 ? (
        <p className="text-sm text-oe-foreground-tertiary">아직 만든 화면이 없다.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {sandboxScreens.map((screen) => (
            <li key={screen.key} className="rounded-lg border border-oe-border-secondary bg-oe-background-primary p-4">
              <Link
                href={screen.href}
                className="rounded-sm text-base font-medium text-oe-foreground-primary underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-oe-focus-ring"
              >
                {screen.name}
              </Link>
              <p className="mt-1 text-sm text-oe-foreground-secondary">{screen.prompt}</p>
              <p className="mt-2 text-xs text-oe-foreground-tertiary">
                {screen.createdAt}
                {screen.source ? ` · 원본 ${screen.source}` : " · 원본 없음"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
