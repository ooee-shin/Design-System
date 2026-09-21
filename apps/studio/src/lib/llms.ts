import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

/**
 * 저장소 루트의 `llms.txt` 를 읽는다. Studio 가 `apps/studio` 에서 돌기도 하고 저장소 루트에서
 * 돌기도 하므로 두 자리를 모두 본다 — `lib/docs.ts` 가 `docs/system` 을 찾는 방식과 같다.
 *
 * 파일을 Studio 안으로 복사하지 않는 까닭은, 복사본은 반드시 원본과 어긋나기 때문이다.
 * 같은 이유로 `scripts/docs/llms-txt.test.mjs` 가 원본의 링크를 지킨다.
 */
export function readLlmsTxt(): string {
  for (const candidate of [join(process.cwd(), "llms.txt"), resolve(process.cwd(), "..", "..", "llms.txt")]) {
    if (existsSync(candidate)) return readFileSync(candidate, "utf8");
  }
  throw new Error("llms.txt 를 찾지 못했다. Studio 는 저장소 안에서 실행해야 한다.");
}
