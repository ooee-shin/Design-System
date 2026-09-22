// `llms.txt` 의 링크를 배포한 Studio 에서도 열리게 하는 규칙과, 그 규칙으로 `out/` 에 싣는 일(`mirrorSite`).
// 빌드는 `mirror-llms-links.mjs` 가 `mirrorSite` 를 부른다.
//
// 저장소 안의 에이전트는 링크를 저장소 상대 경로로 그대로 따라간다. 저장소 밖의 AI 는
// `https://ooee-studio.pages.dev/llms.txt` 를 받아 같은 링크를 사이트 주소 기준으로 푼다. 정적 내보내기는
// 렌더한 페이지만 내고 원본 파일은 내지 않아서 그 자리가 전부 404 였다. 저장소가 비공개라 GitHub raw
// 링크로 돌릴 수도 없다. 그래서 링크가 가리키는 원본을 **빌드 때** `out/` 의 같은 경로에 싣는다.
// 복사본을 커밋하지 않고 빌드마다 지금의 원본에서 싣기 때문에 원본과 어긋날 틈이 없다.
//
// **싣는 것은 시스템 문서뿐이다.** 실을 수 있는 자리는 아래 `PUBLISHABLE` 한 곳이 정하고, 까닭도 거기 있다.
// `llms.txt` 의 링크 가운데 그 안을 가리키는 것만 싣고, 실은 `.md` 안의 링크도 그 안에서만 끝까지 따라간다.
// `llms.txt` 가 「내용은 아래 문서가 그대로 갖는다」고 하므로, 한 칸만 실으면 따라온 쪽이 다음 칸
// (`docs/system/README.md` → `ux-writing.md`)에서 404 를 만난다.
//
// 그 밖(`AGENTS.md`, `docs/process/`, Skill 원본 같은 것)을 가리키는 `llms.txt` 의 링크는 싣지 않고, 사이트로
// 나가는 `llms.txt`(웹판)에서 링크를 풀어 `AGENTS.md`(저장소 안에서만)처럼 글자로 남긴다. 밖의 AI 가 404 를
// 따라가지 않게 하려는 것이다. 원본 `llms.txt` 는 고치지 않는다 — 저장소 안의 에이전트는 그 링크를 그대로 쓴다.
// 실은 문서가 그 밖을 링크하면 빌드를 멈춘다. 실은 문서는 바이트 그대로 나가므로 그 링크를 풀 수 없다.
//
// 실리는 파일은 git 이 추적하는 보통 파일이어야 한다. CI 는 새 clone 이라 디스크와 git 이 같지만, 로컬에서
// `pnpm deploy:studio` 로 올리면 gitignore 된 파일이나 심볼릭 링크 너머의 파일이 섞여 나갈 수 있다.
//
// 링크가 아니라 코드 글꼴(`packages/ui/src/` 처럼)로 적은 경로는 싣지 않는다. 저장소 안에서만 열리며,
// `llms.txt` 5행이 읽는 쪽에 그렇게 말한다.
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, realpathSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

import { marked } from "marked";

/**
 * 배포한 Studio 의 주소. 환경 변수가 아니라 상수로 두는 까닭은, 올라갈 자리가 이미 저장소에 박혀 있기
 * 때문이다 — 루트 `package.json` 의 `deploy:studio` 가 `--project-name=ooee-studio --branch=dev` 로
 * 올리고 그 프로젝트의 production branch 가 `dev` 다. 빌드는 Cloudflare 가 아니라 GitHub Actions 에서
 * 돌아 `CF_PAGES_URL` 도 없고, 환경 변수로 받으면 값을 넣지 않은 기기의 빌드가 CI 와 다른 llms.txt 를 낸다.
 * 프로젝트 이름과 어긋나지 않는지는 `llms-links.test.mjs` 가 본다. 자체 도메인을 붙이면 여기와 그 시험을 함께 고친다.
 */
export const STUDIO_ORIGIN = "https://ooee-studio.pages.dev";

/** 원본에 적힌 로컬 개발 주소와, `/llms.txt` 로 나갈 때 바꿔 쓸 배포 주소. Studio 의 `next dev` 가 3000 이다. */
export const LOCAL_ORIGINS = { "http://localhost:3000": STUDIO_ORIGIN };

/**
 * 사이트에 실을 수 있는 자리. **공개 범위는 이 목록 하나가 정한다.** 막을 곳을 나열하지 않고 실을 곳을
 * 나열한다 — 새 디렉터리가 생기거나 문서에 링크 한 줄이 늘어도, 여기에 더하기 전에는 사이트에 나가지 않는다.
 *
 * 까닭(`2026-09-22` 결정, `docs/process/ai-environment.md` 「아직 정하지 않은 것」): 두 사이트는 공개로 두지만
 * `llms.txt` 를 따라온 밖의 AI 에게 싣는 것은 시스템 문서 — `docs/system/` 아래 파일과 컴포넌트 export 목록 —
 * 뿐이다. `AGENTS.md`, `docs/process/`, `.claude/`, `plugins/`, `scripts/` 는 싣지 않는다. `AGENTS.md` 가
 * `docs/process/` 와 자신을 「전달 시 제거」하고 자산화 대상 밖으로 정했고, 그 안에 Figma team·폴더 ID,
 * GitHub 계정 이름, Slack 채널 이름, 내부 계획이 있다. 한 번 공개되면 되돌리기 어렵다. 넓힐 때는 그 결정부터 고친다.
 */
export const PUBLISHABLE = Object.freeze({
  directories: Object.freeze(["docs/system"]),
  files: Object.freeze(["packages/ui/src/index.ts"]),
});

/** `checkTarget` 이 돌려준 경로(끝의 `/` 를 뗀 것)가 `PUBLISHABLE` 안인지. 대소문자까지 같아야 한다. */
export function isPublishable(relative) {
  return PUBLISHABLE.files.includes(relative) || PUBLISHABLE.directories.some((directory) => relative === directory || relative.startsWith(`${directory}/`));
}

/** 웹판에서 푼 링크 뒤에 붙이는 말. */
export const REPO_ONLY = "저장소 안에서만";

/** 웹판 `llms.txt` 머리에 더하는 한 줄. 무엇이 실리는지를 밖의 AI 가 링크를 따라가기 전에 알게 한다. */
export const WEB_NOTICE = `> 이 사이트에는 시스템 문서(${[...PUBLISHABLE.directories.map((directory) => `\`${directory}/\` 아래`), ...PUBLISHABLE.files.map((file) => `\`${file}\``)].join(", ")})만 실린다. 「${REPO_ONLY}」이라 적은 경로와 코드 글꼴로 적은 경로는 비공개 저장소에만 있어 여기서는 열리지 않는다.`;

/** git index 에서 보통 파일의 mode. 심볼릭 링크는 `120000`, 하위 저장소는 `160000` 이다. */
const REGULAR_FILE_MODES = new Set(["100644", "100755"]);
const SYMLINK_MODE = "120000";

/**
 * wrangler(4.136.1 `pages validate`)가 올리지 않거나 설정으로 읽는 이름. 여기에 걸리는 경로를 실으면
 * 로컬 빌드에는 파일이 있는데 배포본에서만 404 가 나거나, 파일이 Pages 설정으로 읽힌다. 점으로 시작하는
 * 경로(`.claude/...`)는 이 목록에 없어 그대로 올라가고 그대로 나간다(pages dev 에서 200 으로 확인).
 */
const PAGES_RESERVED_AT_ROOT = new Set(["_worker.js", "_redirects", "_headers", "_routes.json", "functions", ".wrangler"]);
const PAGES_SKIPPED_ANYWHERE = new Set(["node_modules", ".git", ".DS_Store"]);

/** `_headers` 는 규칙을 100개까지만 읽는다(Cloudflare Pages 한도). 넘는 줄은 wrangler 가 경고 한 줄만 남기고 버린다. */
const HEADER_RULE_LIMIT = 100;

/**
 * 실은 파일은 모두 `text/plain; charset=utf-8` 로 낸다. 두지 않으면 Pages 가 확장자로 정해서 `.ts` 가
 * `video/mp2t`(MPEG 전송 스트림)로 나가고(wrangler pages dev 로 확인), 받는 도구가 그것을 글자로 읽지 않는다.
 * `.md` 는 `text/markdown` 으로 나가지만 `/llms.txt` 와 같은 값으로 맞춘다 — 색인과 같은 방식으로 읽으면 되게 하려는 것이다.
 */
const PLAIN_TEXT = "text/plain; charset=utf-8";

const UTF8 = new TextDecoder("utf-8", { fatal: true });

/**
 * 마크다운 링크의 목적지 가운데 저장소 안의 경로만 고른다. `llms-txt.test.mjs` 의 존재 검사도 이것을 쓴다.
 * 정규식이 아니라 marked 로 읽는다 — Studio 가 같은 문서를 그릴 때 쓰는 파서이고, 코드 안에 적은
 * `[표시할 말](경로)` 는 링크가 아니다(`docs/process/presentation.md` 에 그런 줄이 있다).
 */
export function localLinks(text) {
  return repoLinkTokens(text).map((token) => ({ label: token.text, target: token.href.split("#")[0] }));
}

/** `localLinks` 가 고르는 링크를 marked 의 토큰 그대로, 문서에 나오는 차례로 돌려준다. `raw` 는 원문 글자다. */
function repoLinkTokens(text) {
  const out = [];
  marked.walkTokens(marked.lexer(text), (token) => {
    if (token.type !== "link") return;
    if (/^[a-z][a-z0-9+.-]*:/i.test(token.href) || token.href.startsWith("#")) return;
    out.push(token);
  });
  return out;
}

/**
 * 링크 목적지 하나를 URL 로도 저장소 경로로도 같은 뜻이 되는지 본다. 파일 시스템은 보지 않는다.
 * 어긋나면 까닭을 담아 던지고, 맞으면 `/` 를 뗀 경로와 디렉터리 여부를 돌려준다.
 */
export function checkTarget(target) {
  if (!target) throw new Error("빈 경로다");
  if (target.startsWith("/")) throw new Error("절대 경로다. 저장소 루트 기준 상대 경로로 적는다");
  const directory = target.endsWith("/");
  const relative = directory ? target.slice(0, -1) : target;
  const segments = relative.split("/");
  if (segments.includes("..")) throw new Error("`..` 가 있다. 저장소 밖으로 나갈 수 있는 경로는 싣지 않는다");
  if (segments.some((segment) => segment === "" || segment === ".")) throw new Error("빈 조각이나 `.` 조각이 있다. 주소를 정규화하는 쪽과 그대로 쓰는 쪽(`_headers`)이 서로 다른 경로로 읽는다");
  // `_headers` 규칙에 그대로 적고 URL 로도 인코딩 없이 쓰려면 글자를 좁혀야 한다. `:`·`*` 는 `_headers` 에서 자리표시자다.
  if (!/^[A-Za-z0-9._\/-]+$/.test(relative)) throw new Error("영문·숫자·`._-/` 밖의 글자가 있다. 사이트 주소로 옮기면 인코딩이 끼어 다른 경로가 된다");
  if (PAGES_RESERVED_AT_ROOT.has(segments[0])) throw new Error(`\`${segments[0]}\` 는 Cloudflare Pages 가 설정으로 읽는 이름이라 파일로 올라가지 않는다`);
  const skipped = segments.find((segment) => PAGES_SKIPPED_ANYWHERE.has(segment));
  if (skipped) throw new Error(`\`${skipped}\` 는 wrangler 가 올리지 않는 이름이라 배포본에서만 404 가 된다`);
  return { path: relative, directory };
}

/**
 * 실은 문서 `doc` 안의 링크를 저장소 루트 기준으로 풀어 `checkTarget` 에 넘긴다. 사이트에서도 문서가
 * 저장소와 같은 경로에 있으므로 URL 로 풀어도 같은 자리다. 둘이 갈리는 모양만 받지 않는다 — `//` 는 URL 이
 * 그대로 두고 경로 정규화는 지우며, 루트 위로 올라가는 `..` 는 URL 이 루트에서 멈추고 저장소에서는 밖으로 나간다.
 */
export function resolveFrom(doc, target) {
  if (!target) throw new Error("빈 경로다");
  if (target.startsWith("/")) throw new Error("절대 경로다. 문서 자리 기준 상대 경로로 적는다");
  const segments = target.split("/");
  if (segments.slice(0, target.endsWith("/") ? -1 : undefined).includes("")) throw new Error("빈 조각(`//`)이 있다. 사이트 주소와 저장소 경로가 서로 다른 자리로 풀린다");
  const joined = path.posix.normalize(path.posix.join(path.posix.dirname(doc), target));
  if (joined === ".." || joined.startsWith("../")) throw new Error("저장소 밖을 가리킨다");
  return checkTarget(joined);
}

/**
 * git 이 추적하는 파일(저장소 상대 경로 → index 의 mode). index 를 읽으므로 `git add` 만 한 새 파일도 든다.
 * gitignore 된 파일과 추적하지 않는 파일은 없고, 심볼릭 링크는 링크 자체만 `120000` 으로 있다.
 * `GIT_DIR` 같은 변수를 떼는 것은 git hook 안에서 돌 때 `-C` 로 준 자리 대신 그 변수의 저장소를 읽지 않게 하려는 것이다.
 */
export function trackedFiles(root) {
  const env = { ...process.env };
  for (const name of ["GIT_DIR", "GIT_WORK_TREE", "GIT_INDEX_FILE", "GIT_COMMON_DIR"]) delete env[name];
  let listing;
  try {
    listing = execFileSync("git", ["-C", root, "ls-files", "--stage", "-z"], { env, encoding: "utf8", maxBuffer: 64 * 1024 * 1024, stdio: ["ignore", "pipe", "pipe"] });
  } catch (error) {
    throw new Error(`git ls-files 를 돌리지 못했다. 사이트에는 git 이 추적하는 파일만 싣기 때문에 git 저장소 안에서 빌드한다: ${error.message}`);
  }
  const tracked = new Map();
  for (const entry of listing.split("\0")) {
    if (!entry) continue;
    // `<mode> <object> <stage>\t<경로>`
    const tab = entry.indexOf("\t");
    tracked.set(entry.slice(tab + 1), entry.slice(0, entry.indexOf(" ")));
  }
  return tracked;
}

/** 실은 파일은 모두 `text/plain` 으로 나가므로 UTF-8 글자로 읽혀야 한다. 그림 같은 것이 끼면 깨진 글자로 나간다. */
function isText(file) {
  try {
    UTF8.decode(readFileSync(file));
    return true;
  } catch {
    return false;
  }
}

function titleOf(file) {
  const heading = readFileSync(file, "utf8").match(/^#\s+(.+)$/m);
  return heading ? heading[1].trim() : "";
}

/**
 * `llms.txt` 에서 실을 것을 정한다. 링크 목록은 매번 원본에서 뽑는다 — 손으로 적어 두면 원본과 어긋난다.
 * `PUBLISHABLE` 안을 가리키는 링크만 싣고, 밖을 가리키는 것은 `withheld` 로 돌려준다(웹판에서 링크를 푼다).
 * 파일 링크는 그 파일 하나를, 디렉터리 링크(`/` 로 끝난다)는 그 아래 git 이 추적하는 `.md` 전부와 목록 한 장을 싣는다.
 * 실은 `.md` 는 다시 읽어 그 링크도 같은 규칙으로 싣는다. 그 링크는 `PUBLISHABLE` 안이어야 한다.
 * 실을 파일은 `tracked`(git index)에 보통 파일로 있어야 한다. 디렉터리 아래에서 추적하지 않는 `.md` 는 목록에 넣지 않는다.
 * 문제는 하나씩 멈추지 않고 모아서 한 번에 던진다. 고치는 쪽이 빌드를 여러 번 돌리지 않게 하려는 것이다.
 */
export function planMirror(root, source, tracked = trackedFiles(root)) {
  const realRoot = realpathSync(root);
  const files = new Map();
  const directories = new Map();
  const withheld = [];
  const problems = [];
  const unread = [];

  /** 사이트에 그대로 나가도 되는 파일인지. 안 되면 까닭을 돌려준다. */
  const fileProblem = (relative, absolute) => {
    const mode = tracked.get(relative);
    if (mode === undefined) return "git 이 추적하지 않는 파일이다. 사이트에는 추적하는 파일만 싣는다 — 실을 것이면 git add 하고, 아니면 링크를 지운다";
    if (mode === SYMLINK_MODE) return "심볼릭 링크다. 링크 너머의 파일이 이 경로로 나가므로 싣지 않는다";
    if (!REGULAR_FILE_MODES.has(mode)) return `git 에서 보통 파일이 아니다(mode ${mode})`;
    if (!existsSync(absolute)) return "git 은 추적하지만 디스크에 없다";
    // 경로 중간의 디렉터리가 심볼릭 링크면 git 은 모르는 채로 그 너머를 읽게 된다.
    if (realpathSync(absolute) !== path.join(realRoot, relative)) return "실제 자리가 링크한 경로와 다르다. 경로 중간에 심볼릭 링크가 있다";
    if (!statSync(absolute).isFile()) return "보통 파일이 아니다";
    if (!isText(absolute)) return "UTF-8 글자 파일이 아니다. 실은 파일은 모두 text/plain 으로 나간다";
    return null;
  };

  const addFile = (relative, absolute, where) => {
    try {
      checkTarget(relative);
    } catch (error) {
      problems.push(`${where}: ${error.message}`);
      return false;
    }
    const problem = fileProblem(relative, absolute);
    if (problem) {
      problems.push(`${where}: ${problem}`);
      return false;
    }
    if (!files.has(relative)) {
      files.set(relative, path.join(realRoot, relative));
      if (relative.endsWith(".md")) unread.push(relative);
    }
    return true;
  };

  /** `checkTarget` 을 지난, `PUBLISHABLE` 안의 목적지 하나를 싣는다. 실을 수 없으면 까닭을 돌려준다. */
  const take = ({ path: relative, directory }, where) => {
    const absolute = path.join(root, relative);
    if (tracked.get(relative) === SYMLINK_MODE) return "심볼릭 링크다. 링크 너머의 것이 이 경로로 나가므로 싣지 않는다";
    if (!existsSync(absolute)) return "저장소에 없다";
    const isDirectory = statSync(absolute).isDirectory();
    if (!directory) {
      // `/` 없이 디렉터리를 가리키면 Pages 가 308 로 `/` 붙은 주소에 돌린다. 200 을 기대한 쪽은 거기서 멈춘다.
      if (isDirectory) return "디렉터리다. 디렉터리 링크는 `/` 로 끝낸다";
      addFile(relative, absolute, where);
      return null;
    }
    if (!isDirectory) return "`/` 로 끝나지만 디렉터리가 아니다";
    if (directories.has(relative)) return null;
    if (realpathSync(absolute) !== path.join(realRoot, relative)) return "실제 자리가 링크한 경로와 다르다. 경로 중간에 심볼릭 링크가 있다";
    const docs = [...tracked.keys()].filter((file) => file.startsWith(`${relative}/`) && file.endsWith(".md")).map((file) => file.slice(relative.length + 1)).sort();
    if (!docs.length) return "아래에 git 이 추적하는 .md 가 하나도 없다";
    const entries = [];
    for (const doc of docs) {
      const docPath = path.join(absolute, doc);
      if (addFile(`${relative}/${doc}`, docPath, `${where} 의 ${doc}`)) entries.push({ path: doc, title: titleOf(docPath) });
    }
    directories.set(relative, entries);
    return null;
  };
  const tryTake = (where, resolve) => {
    try {
      const problem = resolve();
      if (problem) problems.push(`${where}: ${problem}`);
    } catch (error) {
      problems.push(`${where}: ${error.message}`);
    }
  };

  for (const { label, target } of localLinks(source)) {
    const where = `[${label}](${target})`;
    tryTake(where, () => {
      const checked = checkTarget(target);
      if (isPublishable(checked.path)) return take(checked, where);
      withheld.push(target);
      return null;
    });
  }

  while (unread.length) {
    const doc = unread.shift();
    for (const { label, target } of localLinks(readFileSync(files.get(doc), "utf8"))) {
      const where = `${doc} 의 [${label}](${target})`;
      tryTake(where, () => {
        const checked = resolveFrom(doc, target);
        if (checked.directory ? directories.has(checked.path) : files.has(checked.path)) return null;
        if (!isPublishable(checked.path)) {
          const shown = `${checked.path}${checked.directory ? "/" : ""}`;
          return `${shown} 는 사이트에 싣지 않는 자리다(PUBLISHABLE 밖). 실은 문서는 바이트 그대로 나가서 이 링크가 사이트에서 404 가 된다. 링크 대신 코드 글꼴로 적는다`;
        }
        return take(checked, where);
      });
    }
  }

  if (problems.length) throw new Error(`llms.txt 에서 링크로 닿는 자리를 사이트에 실을 수 없다:\n${problems.map((problem) => `  ${problem}`).join("\n")}`);
  return {
    // 차례는 글자 코드로 정한다. localeCompare 는 기기의 로캘을 따라서 CI 와 로컬의 `_headers` 가 갈릴 수 있다.
    files: [...files].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)).map(([relative, absolute]) => ({ path: relative, source: absolute })),
    directories: [...directories].map(([relative, entries]) => ({ path: relative, entries })),
    withheld: [...new Set(withheld)],
  };
}

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * `llms.txt` 의 링크 목적지가 사이트에 실리는 자리인지. 모양이 어긋난 경로는 싣지 않는 쪽으로 본다 —
 * 그런 링크는 어차피 `planMirror` 가 빌드를 멈춘다.
 */
function isPublishedTarget(target) {
  try {
    return isPublishable(checkTarget(target).path);
  } catch {
    return false;
  }
}

/** 싣지 않는 자리의 링크 하나를 글자로 푼다. 표시 말이 경로이거나 그 이름이면 경로만 남긴다. */
function unlinked(token) {
  const target = token.href.split("#")[0];
  const code = `\`${token.href}\``;
  const names = [token.href, target, target.replace(/\/$/, "").split("/").pop()];
  return names.includes(token.text) ? `${code}(${REPO_ONLY})` : `${token.text}(${code}, ${REPO_ONLY})`;
}

/**
 * `/llms.txt` 로 나갈 글자(웹판). 원본에서 세 가지만 바꾸고 나머지 글자는 건드리지 않는다.
 *
 * 1. 로컬 개발 주소를 배포 주소로 바꾼다. 바꿀 곳을 모르는 로컬 주소가 남으면 던진다 — 배포본을 읽는 쪽에서는
 *    그 주소가 자기 기계를 가리킨다.
 * 2. `PUBLISHABLE` 밖을 가리키는 링크를 풀어 `AGENTS.md`(저장소 안에서만)처럼 적는다. 사이트에 없는 자리라
 *    링크로 두면 밖의 AI 가 404 를 따라간다. 경로는 남긴다 — 저장소를 가진 쪽에는 여전히 쓸모가 있다.
 * 3. 첫 줄 제목 아래에 `WEB_NOTICE` 한 줄을 더한다.
 */
export function webLlmsTxt(source, origins = LOCAL_ORIGINS) {
  let text = source;
  for (const [local, deployed] of Object.entries(origins)) {
    // 뒤에 숫자가 붙은 다른 포트(`:30001`)까지 바꾸지 않게 끊는다.
    text = text.replace(new RegExp(`${escapeRegExp(local)}(?![0-9])`, "g"), deployed);
  }

  // 링크의 원문(`raw`)을 문서에 나오는 차례대로 찾아 가며 바꾼다. 같은 글자가 코드 안에 먼저 있으면 엉뚱한
  // 자리를 바꿀 수 있는데, 그러면 풀어야 할 링크가 남으므로 아래 대조에서 멈춘다.
  let unwrapped = "";
  let cursor = 0;
  for (const token of repoLinkTokens(text)) {
    const at = text.indexOf(token.raw, cursor);
    if (at < 0) continue;
    const end = at + token.raw.length;
    unwrapped += text.slice(cursor, at) + (isPublishedTarget(token.href.split("#")[0]) ? token.raw : unlinked(token));
    cursor = end;
  }
  unwrapped += text.slice(cursor);

  const kept = localLinks(text).map((link) => link.target).filter(isPublishedTarget);
  const remaining = localLinks(unwrapped).map((link) => link.target);
  if (kept.join("\n") !== remaining.join("\n")) {
    throw new Error(`웹판 llms.txt 에서 사이트에 싣지 않는 자리의 링크를 풀지 못했다. 같은 링크 글자가 코드 안에 먼저 나오는지 본다.\n  남아야 할 링크: ${kept.join(", ")}\n  남은 링크: ${remaining.join(", ")}`);
  }

  const [first, ...rest] = unwrapped.split("\n");
  const web = /^# /.test(first) ? `${first}\n\n${WEB_NOTICE}\n\n${rest.join("\n").replace(/^\n+/, "")}` : `${WEB_NOTICE}\n\n${unwrapped}`;

  const left = [...new Set(web.match(/https?:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])(?::[0-9]+)?/g) ?? [])];
  if (left.length) throw new Error(`llms.txt 에 배포 주소로 바꿀 곳을 모르는 로컬 주소가 있다: ${left.join(", ")}. LOCAL_ORIGINS 에 더한다`);
  return web;
}

/**
 * 디렉터리 주소에 둘 목록. Pages 는 `/<디렉터리>/` 에 `index.html` 을 내므로 그 이름으로 두되 내용은
 * 마크다운 목록이고, `_headers` 가 `text/plain` 으로 낸다. llms.txt 를 따라온 쪽이 글자로 읽는 자리라
 * 꾸미지 않는다. 링크는 상대 경로라 이 주소 기준으로 실은 파일에 그대로 닿는다.
 */
export function directoryIndex(directory) {
  const lines = directory.entries.map(({ path: file, title }) => `- [${file}](${file})${title ? ` — ${title}` : ""}`);
  return `# ${directory.path}/\n\n저장소 \`${directory.path}/\` 아래의 문서다. 목록과 파일은 빌드 때 지금의 원본에서 실었다.\n\n${lines.join("\n")}\n`;
}

/** 실은 자리마다 글자로 내라는 `_headers`. 디렉터리는 목록까지 한 규칙으로 덮는다. */
export function headersFile(plan) {
  const covered = (file) => plan.directories.some((directory) => file.startsWith(`${directory.path}/`));
  const rules = [
    ...plan.files.filter((file) => !covered(file.path)).map((file) => `/${file.path}`),
    ...plan.directories.map((directory) => `/${directory.path}/*`),
  ];
  if (rules.length > HEADER_RULE_LIMIT) throw new Error(`_headers 규칙이 ${rules.length}개다. Cloudflare Pages 는 ${HEADER_RULE_LIMIT}개까지만 읽는다`);
  const header = "# scripts/docs/mirror-llms-links.mjs 가 빌드 때 만든다. llms.txt 가 가리키는 원본을 글자로 낸다.\n";
  return `${header}${rules.map((rule) => `${rule}\n  Content-Type: ${PLAIN_TEXT}\n`).join("")}`;
}

/**
 * 스튜디오 자신의 출력(`next build` 가 막 만든 `out/`)과 부딪히는 자리를 찾는다. 쓰기 전에 본다.
 *
 * Pages 는 주소 `/x` 에 `x` → `x.html` 순으로, `/x/` 에 `x/index.html` 을 내고 `/x` 에 `x/index.html` 만
 * 있으면 `/x/` 로 돌린다. 그래서 파일 이름이 같을 때만이 아니라 **같은 주소를 두고 다투는 파일**이 있어도
 * 부딪힌 것으로 본다. 정적 내보내기는 페이지마다 `<라우트>.html`, RSC 본문 `<라우트>.txt`, 조각 파일을 담는
 * `<라우트>/` 를 떨구므로 셋 다 걸린다 — `/llms` 페이지의 `llms.txt` 가 route handler 결과를 덮었던 것과 같은 일이다.
 */
export function findCollisions(outDir, plan) {
  const at = (relative) => path.join(outDir, relative);
  const isFile = (relative) => existsSync(at(relative)) && statSync(at(relative)).isFile();
  const found = [];

  const ancestors = (relative) => relative.split("/").slice(0, -1).map((_, index, all) => all.slice(0, index + 1).join("/"));
  const blockedAncestor = (relative) => ancestors(relative).find(isFile);

  const ownedDirectories = plan.directories.map((directory) => directory.path);
  for (const file of plan.files) {
    if (existsSync(at(file.path))) found.push(`${file.path} — 스튜디오가 같은 이름을 이미 냈다`);
    for (const rival of [`${file.path}.html`, `${file.path}/index.html`]) {
      if (existsSync(at(rival))) found.push(`${file.path} — 스튜디오의 ${rival} 와 주소 /${file.path} 를 두고 다툰다`);
    }
    const blocked = blockedAncestor(file.path);
    if (blocked) found.push(`${file.path} — 스튜디오가 ${blocked} 를 파일로 냈다`);
  }
  for (const directory of ownedDirectories) {
    // 디렉터리 링크는 그 아래를 통째로 갖는다. `_headers` 가 그 아래 전부를 글자로 내기 때문에,
    // 스튜디오 파일이 하나라도 섞이면 그 파일이 깨진다.
    if (existsSync(at(directory))) found.push(`${directory}/ — 스튜디오 출력에 이미 있는 디렉터리다`);
    if (existsSync(at(`${directory}.html`))) found.push(`${directory}/ — 스튜디오의 ${directory}.html 와 주소가 / 하나로만 갈린다`);
  }
  if (existsSync(at("_headers"))) found.push("_headers — 스튜디오 출력에 이미 있다. 덮으면 그쪽 규칙이 사라진다");
  return [...new Set(found)];
}

/**
 * `next build` 가 막 만든 `outDir` 에 싣는다. 쓰기 전에 부딪히는 자리를 모두 보고 하나라도 있으면 아무것도
 * 쓰지 않는다. 쓴 뒤에는 `out/` 을 다시 읽어 계획과 바이트까지 같은지 본다 — 쓰는 줄이 빠지거나, 대소문자만
 * 다른 두 경로가 대소문자를 가리지 않는 디스크에서 서로를 덮어도 빌드가 통과하지 않게 한다. 실은 계획을 돌려준다.
 */
export function mirrorSite(root, outDir) {
  const source = readFileSync(path.join(root, "llms.txt"), "utf8");
  const exported = path.join(outDir, "llms.txt");
  if (!existsSync(exported)) throw new Error("out/llms.txt 가 없다. next build 가 먼저 돌아야 한다");

  const web = webLlmsTxt(source);
  // route handler 가 낸 `llms.txt` 가 원본 글자 그대로인지 먼저 본다. 같은 이름의 페이지 RSC 본문이 덮으면
  // React 페이로드가 나간다. 한 번 그랬다(`/llms` → `/llms-txt` 로 비킨 까닭).
  const written = readFileSync(exported, "utf8");
  if (written !== source) {
    throw new Error(written === web ? "이미 손본 out/ 이다. next build 부터 다시 돌린다" : "out/llms.txt 가 원본 글자가 아니다. 스튜디오의 다른 출력이 같은 이름을 덮었다");
  }

  const plan = planMirror(root, source);
  const collisions = findCollisions(outDir, plan);
  if (collisions.length) throw new Error(`실을 자리가 스튜디오 출력과 부딪힌다:\n${collisions.map((line) => `  ${line}`).join("\n")}`);

  for (const file of plan.files) {
    const target = path.join(outDir, file.path);
    mkdirSync(path.dirname(target), { recursive: true });
    copyFileSync(file.source, target);
  }
  for (const directory of plan.directories) writeFileSync(path.join(outDir, directory.path, "index.html"), directoryIndex(directory));
  writeFileSync(path.join(outDir, "_headers"), headersFile(plan));
  writeFileSync(exported, web);

  const expected = [
    ["llms.txt", Buffer.from(webLlmsTxt(source))],
    ["_headers", Buffer.from(headersFile(plan))],
    ...plan.directories.map((directory) => [`${directory.path}/index.html`, Buffer.from(directoryIndex(directory))]),
    ...plan.files.map((file) => [file.path, readFileSync(file.source)]),
  ];
  const wrong = expected.filter(([relative, bytes]) => !existsSync(path.join(outDir, relative)) || !readFileSync(path.join(outDir, relative)).equals(bytes));
  if (wrong.length) throw new Error(`out/ 에 쓴 것이 계획과 다르다:\n${wrong.map(([relative]) => `  ${relative}`).join("\n")}`);
  return plan;
}
