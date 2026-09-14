import { ScreenExitLink, ScreenPlaceholder } from "@/components/screens/screen-chrome";

/**
 * 관리자 화면은 뷰포트를 전부 쓴다. 좌측 내비게이션이 화면 높이를 채우고 본문만 스크롤되는
 * 구조이므로, Studio 의 가운데 정렬 프레임 안에서는 그 동작을 볼 수 없다.
 */
export default function AdminScreenPage() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-oe-background-canvas-primary">
      <aside className="flex w-60 shrink-0 flex-col gap-3 border-r border-oe-border-secondary bg-oe-background-primary p-3">
        <ScreenPlaceholder name="Sidebar" className="h-14" />
        <ScreenPlaceholder name="Navigation" className="flex-1" />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-oe-border-secondary bg-oe-background-primary px-4">
          <ScreenPlaceholder name="Top bar" className="h-8 flex-1" />
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <ScreenPlaceholder name="Content" className="min-h-[160vh]" />
        </main>
      </div>

      <ScreenExitLink />
    </div>
  );
}
