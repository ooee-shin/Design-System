// 화면 디렉터리를 훑어 `/review-design` 검사 항목 가운데 기계로 가를 수 있는 것을 본다.
//
//   node lib/check-screens.mjs --screens apps/sandbox/src/app --docs docs/system [--only admin-login-2]
//
// 위반이 있으면 0이 아닌 코드로 끝난다. `/ooee-harness:generate-code` 의 검사 단계가 이 명령을 부른다.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { checkScreenFile, checkTestTitles } from "./screen-rules.mjs";

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};

const screensDir = opt("screens");
const docsRoot = opt("docs");
const only = opt("only");
if (!screensDir || !docsRoot) {
  console.error("사용: node lib/check-screens.mjs --screens <화면 디렉터리> --docs <docs/system 자리> [--only <key>]");
  process.exit(2);
}
// 없는 자리를 주면 readdirSync 가 스택 트레이스로 죽는다. 부르는 쪽은 검사 실패와 구별하지 못하니
// 다른 잘못된 인자와 같은 모양으로 알린다.
if (!existsSync(screensDir)) {
  console.error(`${screensDir} 가 없다. --screens 는 화면 디렉터리들이 있는 자리여야 한다`);
  process.exit(2);
}
const readme = path.join(docsRoot, "README.md");
if (!existsSync(readme)) {
  console.error(`${readme} 가 없다. --docs 는 docs/system 처럼 README.md 와 components/ 를 가진 자리여야 한다`);
  process.exit(2);
}

const keys = readdirSync(screensDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && existsSync(path.join(screensDir, entry.name, "page.tsx")))
  .map((entry) => entry.name)
  .filter((key) => !only || key === only);

// 한 개도 못 찾았으면 통과가 아니라 못 돌린 것이다. 경로를 잘못 줬거나 `--only` 가 아무것도
// 맞히지 못한 경우인데, 그대로 0 으로 끝내면 검사를 건너뛴 것이 「위반 없음」으로 읽힌다.
if (!keys.length) {
  const what = only ? `--only ${only} 에 맞는 화면` : "화면";
  console.error(`${screensDir} 에서 ${what}을 하나도 못 찾았다. page.tsx 를 가진 디렉터리가 있는 자리여야 한다`);
  process.exit(2);
}

let violations = 0;
for (const key of keys) {
  const file = path.join(screensDir, key, "page.tsx");
  const hits = checkScreenFile(file, readme);
  const testFile = path.join(screensDir, key, "page.test.tsx");
  if (existsSync(testFile)) hits.push(...checkTestTitles(readFileSync(testFile, "utf8"), testFile));
  if (!hits.length) {
    console.log(`ok ${key}`);
    continue;
  }
  violations += hits.length;
  console.log(`not ok ${key} (${hits.length}건)`);
  for (const hit of hits.sort((a, b) => a.line - b.line)) console.log(`  L${hit.line} [${hit.rule}] ${hit.detail}`);
}

console.log(`\n화면 ${keys.length}개, 위반 ${violations}건`);
process.exit(violations ? 1 : 0);
