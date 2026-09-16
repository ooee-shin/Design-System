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
const readme = path.join(docsRoot, "README.md");
if (!existsSync(readme)) {
  console.error(`${readme} 가 없다. --docs 는 docs/system 처럼 README.md 와 components/ 를 가진 자리여야 한다`);
  process.exit(2);
}

const keys = readdirSync(screensDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && existsSync(path.join(screensDir, entry.name, "page.tsx")))
  .map((entry) => entry.name)
  .filter((key) => !only || key === only);

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
