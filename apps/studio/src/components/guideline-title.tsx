import type { ReactNode } from "react";
import { RiBookOpenLine, RiListUnordered } from "@remixicon/react";

export function GuidelineTitle({ children }: { children: ReactNode }) {
  return (
    <h4 className="flex items-center gap-2 text-sm font-semibold text-oe-foreground-primary">
      <RiBookOpenLine className="size-oe-icon-small shrink-0 text-oe-foreground-tertiary" aria-hidden="true" />
      {children}
    </h4>
  );
}

// Guidelines 안에서 여러 규칙을 한 용도로 묶는 중간 단계 제목이다. Section 제목보다 작고
// GuidelineTitle 보다 크다. 아래 단계와 다른 목록 아이콘을 쓰고 크기도 한 단계 크게 두어,
// 두 층이 같은 표시를 갖지 않게 한다.
export function GuidelineGroupTitle({ children }: { children: ReactNode }) {
  return (
    <h4 className="flex items-center gap-2 text-base font-semibold text-oe-foreground-primary">
      <RiListUnordered className="size-oe-icon-medium shrink-0 text-oe-foreground-tertiary" aria-hidden="true" />
      {children}
    </h4>
  );
}
