import Link from "next/link";
import { ArrowRight, Boxes, FlaskConical, Layers3 } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const workspaces = [
  {
    title: "Experiments",
    description: "VibePrompt, Obra, shadcn 자료를 화면 단위로 구현하고 비교합니다.",
    status: "준비됨",
    icon: FlaskConical,
  },
  {
    title: "Candidates",
    description: "화면에서 발견한 컴포넌트와 패턴의 상태·인터랙션을 검수합니다.",
    status: "MessageBubble 검수 중",
    icon: Layers3,
  },
  {
    title: "Stable assets",
    description: "반복 검증을 통과하고 oe 토큰으로 정규화된 자산을 모읍니다.",
    status: "다음 단계",
    icon: Boxes,
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
            <Link href="/experiments/inbox-split-view" className={cn(buttonVariants({ size: "lg" }))}>
              첫 실험 시작
              <ArrowRight data-icon="inline-end" />
            </Link>
            <Link href="/foundations/color" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
              색상 Foundation
            </Link>
          </div>
        </section>

        <section aria-labelledby="workspace-title" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 id="workspace-title" className="text-sm font-medium">
              Asset pipeline
            </h2>
            <span className="text-xs text-muted-foreground">Experiment → Candidate → Stable</span>
          </div>
          <div className="grid overflow-hidden rounded-xl border bg-background md:grid-cols-3">
            {workspaces.map(({ title, description, status, icon: Icon }, index) => (
              <article
                key={title}
                className="flex min-h-56 flex-col justify-between gap-8 border-b p-6 last:border-b-0 md:border-r md:border-b-0 md:last:border-r-0"
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
                <span className="text-xs text-muted-foreground">{status}</span>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
