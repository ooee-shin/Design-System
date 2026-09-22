// `llms.txt` 에서 링크로 닿는 시스템 문서를 Studio 의 정적 출력(`apps/studio/out/`)에 싣고, `out/llms.txt` 를
// 웹판으로 바꾼다. 싣는 자리는 `llms-links.mjs` 의 `PUBLISHABLE` 이 정하고, 그 밖을 가리키는 링크는 웹판에서 풀린다.
//
//   node scripts/docs/mirror-llms-links.mjs
//
// `pnpm --filter @ooee/studio build` 가 `next build` 바로 뒤에 부른다. CI 배포(`pnpm deploy:studio`)는 그
// 빌드를 그대로 올리므로 따로 부를 일이 없다. `next build` 는 `out/` 을 비우고 새로 만들기 때문에 이 명령은
// 막 만든 `out/` 에서만 돈다 — 이미 손본 `out/` 에서 다시 돌리면 멈춘다. 실리는 파일은 git 이 추적하는 것뿐이라
// git 저장소 안에서 돌아야 한다. 하는 일과 규칙, 까닭은 모두 `llms-links.mjs` 의 `mirrorSite` 에 있고,
// `llms-links.test.mjs` 가 임시 `out/` 에 그것을 돌려 결과를 본다.
//
// 실은 것 가운데 `.ts` 원본이 있어서 `apps/studio/tsconfig.json` 이 `out` 을 뺀다. 빼지 않으면 다음 `next build`·
// `pnpm typecheck` 가 `out/packages/ui/src/index.ts` 를 Studio 코드로 읽고, 옆에 없는 모듈을 못 찾아 멈춘다.
import path from "node:path";
import { fileURLToPath } from "node:url";

import { mirrorSite } from "./llms-links.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

try {
  const plan = mirrorSite(root, path.join(root, "apps/studio/out"));
  console.log(`mirror-llms-links: 파일 ${plan.files.length}개와 디렉터리 목록 ${plan.directories.length}개를 out/ 에 실었다. 사이트에 싣지 않는 자리를 가리키는 llms.txt 의 링크 ${plan.withheld.length}개는 웹판에서 풀었다`);
} catch (error) {
  console.error(`mirror-llms-links: ${error.message}`);
  process.exit(1);
}
