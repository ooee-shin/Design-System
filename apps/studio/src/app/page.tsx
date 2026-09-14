import Link from "next/link";
import type { RemixiconComponentType } from "@remixicon/react";
import {
  RiArrowRightLine as ArrowRight,
  RiBookOpenLine as BookOpen,
  RiBox3Line as Boxes,
  RiLayoutLine as Layout,
  RiShapesLine as Shapes,
  RiSlideshowLine as Slideshow,
  RiStackLine as Layers3,
} from "@remixicon/react";

import { buttonVariants } from "@ooee/ui";
import { cn } from "@/lib/utils";
import { componentRegistry } from "@/components/component-registry";
import { listDocs } from "@/lib/docs";
import { presentationEntries } from "@/components/presentation-entries";

type Destination = {
  title: string;
  description: string;
  icon: RemixiconComponentType;
  /** 화면이 아직 없으면 href 를 두지 않는다. 링크가 아닌 카드로 표시한다. */
  href?: string;
  status?: string;
};

export default function Home() {
  const docCount = listDocs().length;

  const groups: Array<{ id: string; label: string; description: string; items: Destination[] }> = [
    {
      id: "assets",
      label: "시스템 자산",
      description: "시스템에 무엇이 있고 어떤 정의인지 확인합니다.",
      items: [
        {
          title: "Foundations",
          description: "색상, 글꼴, 아이콘처럼 모든 자산이 공유하는 기반 결정입니다.",
          status: "Color · Typography · Icon 외 4개",
          href: "/foundations",
          icon: Boxes,
        },
        {
          title: "Components",
          description: "독립적인 의미와 상태를 가진 재사용 가능한 UI 컴포넌트입니다.",
          status: `${componentRegistry.filter((item) => item.status === "확정").length}개 컴포넌트`,
          href: "/components",
          icon: Layers3,
        },
        {
          title: "Patterns",
          description: "여러 컴포넌트가 특정 목적을 위해 결합된 반복 가능한 구조입니다.",
          icon: Shapes,
        },
      ],
    },
    {
      id: "references",
      label: "참고와 전달",
      description: "자산을 읽고, 사례를 보고, 작업 의도를 전합니다.",
      items: [
        {
          title: "Docs",
          description: "구조 용어, 토큰 체계와 컴포넌트별 명세를 저장소 문서 그대로 읽습니다.",
          status: `${docCount}개 문서`,
          href: "/docs",
          icon: BookOpen,
        },
        {
          title: "Examples",
          description: "외부 화면을 공용 컴포넌트로 다시 만든 사례입니다. 확정된 Pattern은 아닙니다.",
          status: "Inbox · Page Header · Sidebar",
          href: "/examples",
          icon: Layout,
        },
        {
          title: "Presentation",
          description: "결과물만으로는 보이지 않는 작업 의도를 전달합니다.",
          status: `${presentationEntries.length}개 기록`,
          href: "/presentation",
          icon: Slideshow,
        },
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-muted/40 px-4 py-5 sm:px-8 sm:py-8">
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
            <p className="max-w-2xl text-pretty text-base leading-7 text-muted-foreground sm:text-md">
              블루키 제품에서 사용할 UI 시스템을 만드는 작업 공간입니다. 컴포넌트를 실제 화면 맥락에서
              검수하고, 확정된 결정을 oe 토큰과 컴포넌트로 남깁니다. Bluekey Design System을 만듭니다.
            </p>
          </div>
          <div className="flex gap-2 lg:justify-end">
            <Link href="/components" className={cn(buttonVariants({ controlSize: "large" }))}>
              Components 보기
              <ArrowRight data-icon="inline-end" />
            </Link>
            <Link href="/docs" className={cn(buttonVariants({ variant: "outline", tone: "neutral", controlSize: "large" }))}>
              Docs 보기
            </Link>
          </div>
        </section>

        {groups.map((group) => (
          <section key={group.id} aria-labelledby={`${group.id}-title`} className="space-y-4">
            <div>
              <h2 id={`${group.id}-title`} className="text-sm font-medium">
                {group.label}
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">{group.description}</p>
            </div>
            <div className="grid overflow-hidden rounded-xl border bg-background sm:grid-cols-3">
              {group.items.map((item) => (
                <DestinationCard key={item.title} {...item} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}

function DestinationCard({ title, description, status, href, icon: Icon }: Destination) {
  const body = (
    <>
      <div className="space-y-5">
        <span className="flex size-9 items-center justify-center rounded-lg border bg-muted/50">
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <div className="space-y-2">
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </div>
      {href ? (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
          {status}
          <ArrowRight className="size-oe-icon-xsmall transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      ) : (
        <span className="inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground">
          준비 중
        </span>
      )}
    </>
  );

  const shared = "flex min-h-56 flex-col justify-between gap-8 border-b p-6 last:border-b-0 sm:border-r sm:border-b-0 sm:last:border-r-0";

  if (!href) {
    return <div className={cn(shared, "bg-muted/30 text-muted-foreground")}>{body}</div>;
  }

  return (
    <Link
      href={href}
      className={cn(shared, "group outline-none transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring")}
    >
      {body}
    </Link>
  );
}
