import type { ReactNode } from "react";
import { RiBookOpenLine } from "@remixicon/react";

export function GuidelineTitle({ children }: { children: ReactNode }) {
  return (
    <h4 className="flex items-center gap-2 text-sm font-semibold text-oe-foreground-primary">
      <RiBookOpenLine className="size-oe-icon-small shrink-0 text-oe-foreground-tertiary" aria-hidden="true" />
      {children}
    </h4>
  );
}
