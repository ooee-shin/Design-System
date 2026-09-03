import Link from "next/link";
import {
  RiArrowRightLine as ArrowRight,
  RiBookOpenLine as BookOpen,
  RiBox3Line as Boxes,
  RiLayoutLine as Layout,
  RiStackLine as Layers3,
} from "@remixicon/react";

import { buttonVariants } from "@ooee/ui";
import { cn } from "@/lib/utils";
import { componentRegistry } from "@/components/component-registry";
import { listDocs } from "@/lib/docs";

export default function Home() {
  const docCount = listDocs().length;

  const destinations = [
    {
      title: "Foundations",
      description: "색상, 글꼴, 아이콘처럼 모든 자산이 공유하는 기반 결정입니다.",
      status: "Color · Typography · Icon 외 4개",
      href: "/foundations",
      icon: Boxes,
    },
    {
      title: "Components",
      description: "독립적인 의미와 상태를 가진 재사용 가능한 UI 부품입니다.",
      status: `${componentRegistry.length}개 컴포넌트`,
      href: "/components",
      icon: Layers3,
    },
    {
      title: "Examples",
      description: "공용 부품으로 다시 만든 실제 화면입니다. 부품이 화면에서 어떻게 조합되는지 보여줍니다.",
      status: "Inbox · Page Header · Sidebar",
      href: "/examples",
      icon: Layout,
    },
    {
      title: "Docs",
      description: "구조 용어, 토큰 체계와 컴포넌트별 명세를 저장소 문서 그대로 읽습니다.",
      status: `${docCount}개 문서`,
      href: "/docs",
      icon: BookOpen,
    },
  ];

  return (
    <main className="min-h-screen bg-muted/40 px-5 py-6 sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-12">
        <header className="flex items-center justify-between border-b pb-5">
          <div className="flex items-baseline gap-3">
            <span className="text-base font-semibold tracking-tight">ooee</span>
            <span className="text-sm text-muted-foreground">UI Studio</span>
          </div>
          <span className="rounded-full border bg-background px-2.5 py-1 text-xs text-muted-foreground">
            1차 컴포넌트 검증 중
          </span>
        </header>

        <section className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
          <div className="max-w-3xl space-y-5">
            <p className="text-sm font-medium text-muted-foreground">Design in context</p>
            <h1 className="text-balance text-4xl font-semibold tracking-[-0.035em] sm:text-6xl">
              화면 안에서 검수하고, oe 자산으로 남깁니다.
            </h1>
            <p className="max-w-2xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
              블루키 제품에서 사용할 UI 시스템을 만드는 작업 공간입니다. 부품을 실제 화면 맥락에서
              검수하고, 확정된 결정을 oe 토큰과 컴포넌트로 남깁니다.
            </p>
          </div>
          <div className="flex gap-2 lg:justify-end">
            <Link href="/components" className={cn(buttonVariants({ size: "lg" }))}>
              Components 보기
              <ArrowRight data-icon="inline-end" />
            </Link>
            <Link href="/docs" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
              Docs 보기
            </Link>
          </div>
        </section>

        <section aria-labelledby="destinations-title" className="space-y-4">
          <h2 id="destinations-title" className="text-sm font-medium">
            무엇을 보시겠어요
          </h2>
          <div className="grid overflow-hidden rounded-xl border bg-background sm:grid-cols-2 lg:grid-cols-4">
            {destinations.map(({ title, description, status, href, icon: Icon }) => (
              <Link
                key={title}
                href={href}
                className="group flex min-h-56 flex-col justify-between gap-8 border-b p-6 outline-none last:border-b-0 hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:border-r sm:[&:nth-child(2)]:border-r-0 lg:border-b-0 lg:[&:nth-child(2)]:border-r lg:last:border-r-0"
              >
                <div className="space-y-5">
                  <span className="flex size-9 items-center justify-center rounded-lg border bg-muted/50">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
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
