import { SandboxIndexTabs } from "@/components/sandbox-index-tabs";
import { screenRoots } from "@/components/renewal/screen-registry";
import { uiImportsOf } from "@/lib/screen-imports";
import { SANDBOX_PROJECTS, sandboxScreens } from "@/screens";

export default function SandboxIndexPage() {
  // 빌드 때 화면 코드를 읽어 센다. 첫 화면은 정적으로 나가므로 배포본에는 이 결과만 들어간다.
  const uiImports = Object.fromEntries(sandboxScreens.map((screen) => [screen.key, uiImportsOf(screen.key)]));
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8 sm:px-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-oe-foreground-primary">ooee sandbox</h1>
        <p className="text-sm text-oe-foreground-secondary">
          화면 요청으로 만든 화면과 블루키 리뉴얼 작업장입니다. 전달 범위 밖이며 채택 여부는 기획자가 정합니다.
        </p>
      </header>

      <SandboxIndexTabs projects={SANDBOX_PROJECTS} screens={sandboxScreens} renewal={screenRoots} uiImports={uiImports} />
    </main>
  );
}
