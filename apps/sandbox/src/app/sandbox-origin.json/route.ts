import { realpathSync } from "node:fs";

/**
 * 이 dev 서버가 어느 checkout 에서 도는지 알리는 지문이다. 화면이 아니다.
 *
 * `/design-page` 가 화면을 읽기 전에 `scripts/figma/sandbox-server.mjs` 로 이 값을 제 checkout 의 것과 견준다.
 * 같은 기기에 이 저장소의 다른 worktree 나 옛 저장소의 sandbox 가 같은 포트에 떠 있으면 HTTP 코드만으로는
 * 가릴 수 없어서, 다른 checkout 의 옛 화면이 조용히 Figma 로 옮겨졌다(2026-09-22).
 *
 * 절대경로 대신 지문(fnv)을 싣는다. 같은 공유기의 폰도 dev 서버를 열 수 있다(next.config.ts `allowedDevOrigins`).
 * `next build` 는 이것을 정적 파일로 내보내는데, 그때는 dev 서버가 아니므로 `null` 이다.
 */
// `output: "export"` 는 route 마다 정적이라고 밝히기를 요구한다. 없으면 dev 서버도 500 을 낸다.
export const dynamic = "force-static";

export function GET() {
  const fnv = (s: string) => {
    let h = 0x811c9dc5;
    for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193);
    return h >>> 0;
  };
  const checkout = process.env.NODE_ENV === "development" ? fnv(realpathSync(process.cwd())) : null;
  return Response.json({ app: "@ooee/sandbox", checkout });
}
