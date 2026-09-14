import Link from "next/link";

import { screenRoots, type ScreenRoot } from "@/components/screens/screen-registry";
import { cn } from "@/lib/utils";

/**
 * 세 작업 목록을 오가는 탭이다. 제목 아래에 서고 그 아래에 선택한 목록이 이어진다.
 *
 * 탭마다 주소가 따로 있으므로 `Link` 로 만든다. 어느 목록을 보고 있었는지가 주소에 남아야 새로
 * 고치거나 링크를 건넸을 때 같은 자리가 열린다.
 *
 * 공용 `Tab` 컴포넌트는 아직 시스템에 없고, `BottomNavigation` 은 모바일 제품 화면의 최상위
 * 이동만 맡기로 정해져 있어 여기에 쓸 수 없다. Studio 쪽 부품이므로 이 파일이 소유한다.
 */
export function ScreenRootTabs({ current }: { current: ScreenRoot["key"] }) {
  return (
    <nav aria-label="제품 화면 전환" className="border-b border-oe-border-secondary">
      <ul className="flex gap-1">
        {screenRoots.map((root) => {
          const active = root.key === current;
          const done = root.items.filter((item) => item.href).length;

          return (
            <li key={root.key}>
              <Link
                href={`/screens/${root.key}`}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium outline-none transition-colors",
                  "focus-visible:rounded-t-sm focus-visible:ring-2 focus-visible:ring-oe-focus-ring",
                  active
                    ? "border-oe-foreground-primary text-oe-foreground-primary"
                    : "border-transparent text-oe-foreground-tertiary hover:text-oe-foreground-secondary",
                )}
              >
                {root.name}
                <span className="text-[11px] font-normal tabular-nums text-oe-foreground-tertiary">
                  {done}/{root.items.length}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
