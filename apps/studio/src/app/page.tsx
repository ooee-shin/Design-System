import Link from "next/link";
import {
  RiArrowRightLine as ArrowRight,
  RiBox3Line as Boxes,
  RiStackLine as Layers3,
} from "@remixicon/react";

import { buttonVariants } from "@ooee/ui";
import { cn } from "@/lib/utils";

const workspaces = [
  {
    title: "Foundations",
    description: "색상, 글꼴, 아이콘처럼 모든 자산이 공유하는 기반 결정을 검수합니다.",
    status: "Color · Icon rules",
    href: "/foundations",
    icon: Boxes,
  },
  {
    title: "Components",
    description: "독립적인 의미와 상태를 가진 재사용 가능한 UI 요소를 검수합니다.",
    status: "Message Bubble",
    href: "/components",
    icon: Layers3,
  },
  {
    title: "Patterns",
    description: "여러 컴포넌트가 제품 목적을 위해 결합된 화면 구조를 검수합니다.",
    status: "Inbox · Page Header",
    href: "/patterns",
    icon: Layers3,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-muted/40 px-5 py-6 sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-12">
        <header className="flex items-center justify-between border-b pb-5">
          <div className="flex items-baseline gap-3">
            <span className="text-base font-semibold tracking-tight">ooee</span>
            <span className="text-sm text-muted-foreground">UI Studio</span>
          </div>
          <span className="rounded-full border bg-background px-2.5 py-1 text-xs text-muted-foreground">
            Foundation v0
          </span>
        </header>

        <section className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
          <div className="max-w-3xl space-y-5">
            <p className="text-sm font-medium text-muted-foreground">Design in context</p>
            <h1 className="text-balance text-4xl font-semibold tracking-[-0.035em] sm:text-6xl">
              화면을 만들고, 검수하고, ooee 자산으로 남깁니다.
            </h1>
            <p className="max-w-2xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
              shadcn을 구현 기반으로 사용하고 외부 UI를 실험한 뒤, 반복 검증된 결정만
              oe 토큰과 컴포넌트로 승격하는 개인 제작 환경입니다.
            </p>
          </div>
          <div className="flex gap-2 lg:justify-end">
            <Link href="/patterns" className={cn(buttonVariants({ size: "lg" }))}>
              Patterns 보기
              <ArrowRight data-icon="inline-end" />
            </Link>
            <Link href="/foundations" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
              Foundations 보기
            </Link>
          </div>
        </section>

        <section aria-labelledby="workspace-title" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 id="workspace-title" className="text-sm font-medium">
              Asset pipeline
            </h2>
            <span className="text-xs text-muted-foreground">화면 실험 → 공용 자산 추출 → 확정</span>
          </div>
          <div className="grid overflow-hidden rounded-xl border bg-background md:grid-cols-3">
            {workspaces.map(({ title, description, status, href, icon: Icon }, index) => (
              <Link
                key={title}
                href={href}
                className="group flex min-h-56 flex-col justify-between gap-8 border-b p-6 outline-none last:border-b-0 hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring md:border-r md:border-b-0 md:last:border-r-0"
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="flex size-9 items-center justify-center rounded-lg border bg-muted/50">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">0{index + 1}</span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium">{title}</h3>
                    <p className="text-sm leading-6 text-muted-foreground">{description}</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
                  {status}
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
