// 화면 디렉터리를 재귀로 훑어 `/review-design` 검사 항목 가운데 기계로 가를 수 있는 것을 본다.
//
//   node lib/check-screens.mjs --screens apps/sandbox/src/app --docs docs/system [--only admin-login] [--allow <목록.json>]
//
// `page.tsx` 를 가진 디렉터리는 얼마나 깊든 모두 본다. `--only` 는 상대 경로(`(renewal)/renewal/sto/login`)
// 로 맞히고, 상대 경로로 맞은 것이 없으면 마지막 조각(`login`)으로 맞힌다 — 마지막 조각으로 둘 이상이
// 맞으면 무엇과 맞았는지 적고 2로 끝낸다(부르지 않은 화면의 위반으로 붉어지지 않게 한다).
//
// **전수 검사(`--only` 없이)는 설치한 저장소가 예외로 적어 둔 옛 화면 때문에 붉을 수 있다.** 그 목록을
// `--allow <파일>` 로 주면 거기 적은 만큼은 빼고 센다. 파일은 JSON 이고 `screens` 에 화면 key → {규칙 이름:
// 건수} 를 담는다. 이 저장소의 목록은 `apps/sandbox/src/screen-rules-legacy.json` 이며 `src/screen-rules.test.tsx`
// 가 같은 파일을 읽는다 — `--allow` 를 빼면 그 옛 위반이 그대로 나온다.
//
// 위반이 있으면 0이 아닌 코드로 끝난다. `/ooee-harness:generate-code` 의 검사 단계가 이 명령을 부른다.
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { checkScreenFile, checkTestTitles, screenKeysIn } from "./screen-rules.mjs";

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};

const screensDir = opt("screens");
const docsRoot = opt("docs");
const only = opt("only");
const allowFile = opt("allow");
if (!screensDir || !docsRoot) {
  console.error(
    "사용: node lib/check-screens.mjs --screens <화면 디렉터리> --docs <docs/system 자리> [--only <key>] [--allow <예외 목록.json>]",
  );
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

/** `--allow` 파일의 `screens` 를 읽는다. 잘못된 파일은 검사 실패와 섞이지 않게 2로 끝낸다. */
function loadAllow(file) {
  if (!file) return {};
  if (!existsSync(file)) {
    console.error(`${file} 가 없다. --allow 는 예외 목록 JSON 파일 자리여야 한다`);
    process.exit(2);
  }
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    console.error(`${file} 를 JSON 으로 읽지 못했다: ${error.message}`);
    process.exit(2);
  }
  const screens = parsed?.screens;
  if (!screens || typeof screens !== "object") {
    console.error(`${file} 에 \`screens\` 가 없다. 화면 key → {규칙 이름: 건수} 를 담은 객체여야 한다`);
    process.exit(2);
  }
  return screens;
}

const allow = loadAllow(allowFile);

// key 는 `--screens` 기준 상대 경로다(`(renewal)/renewal/admin/voice`).
const allKeys = screenKeysIn(screensDir);
let keys = allKeys;
if (only) {
  // 상대 경로로 맞은 것이 있으면 그것만 본다. 마지막 조각은 사람이 짧게 부르는 길이지만
  // 여럿을 맞힐 수 있고, 그러면 부르지 않은 화면의 위반으로 붉어진다 — 그때는 멈추고 되묻는다.
  const exact = allKeys.filter((key) => key === only);
  const tail = allKeys.filter((key) => key.split("/").at(-1) === only);
  if (exact.length) keys = exact;
  else if (tail.length > 1) {
    console.error(`--only ${only} 가 화면 ${tail.length}개와 맞는다. 아래 가운데 하나를 상대 경로로 적는다`);
    for (const key of tail) console.error(`  ${key}`);
    process.exit(2);
  } else {
    keys = tail;
    // 마지막 조각으로 맞힌 것은 부른 자리와 다를 수 있다. 화면이 엉뚱한 자리에 떨어졌을 때
    // 다른 화면을 보고 초록을 내지 않게, 무엇을 봤는지 밝힌다.
    if (tail.length) console.error(`--only ${only} 를 마지막 조각으로 맞혔다 — ${tail[0]} 을 본다`);
  }
}

// 한 개도 못 찾았으면 통과가 아니라 못 돌린 것이다. 경로를 잘못 줬거나 `--only` 가 아무것도
// 맞히지 못한 경우인데, 그대로 0 으로 끝내면 검사를 건너뛴 것이 「위반 없음」으로 읽힌다.
if (!keys.length) {
  const what = only ? `--only ${only} 에 맞는 화면` : "화면";
  console.error(`${screensDir} 에서 ${what}을 하나도 못 찾았다. 아래에 page.tsx 를 가진 디렉터리가 있는 자리여야 한다`);
  process.exit(2);
}

let violations = 0;
let exempted = 0;
for (const key of keys) {
  const file = path.join(screensDir, key, "page.tsx");
  const hits = checkScreenFile(file, readme);
  const testFile = path.join(screensDir, key, "page.test.tsx");
  if (existsSync(testFile)) hits.push(...checkTestTitles(readFileSync(testFile, "utf8"), testFile));
  // 예외로 적은 규칙은 적은 건수만큼 뺀다. 그보다 늘어난 것은 예외가 아니므로 그대로 낸다.
  const budget = { ...(allow[key] ?? {}) };
  const left = hits.filter((hit) => {
    if (!(budget[hit.rule] > 0)) return true;
    budget[hit.rule] -= 1;
    exempted += 1;
    return false;
  });
  if (!left.length) {
    console.log(`ok ${key}${hits.length ? ` (예외로 적은 옛 위반 ${hits.length}건)` : ""}`);
    continue;
  }
  violations += left.length;
  console.log(`not ok ${key} (${left.length}건)`);
  for (const hit of left.sort((a, b) => a.line - b.line)) console.log(`  L${hit.line} [${hit.rule}] ${hit.detail}`);
}

console.log(`\n화면 ${keys.length}개, 위반 ${violations}건${exempted ? ` (예외로 적은 옛 위반 ${exempted}건은 뺐다)` : ""}`);
process.exit(violations ? 1 : 0);
