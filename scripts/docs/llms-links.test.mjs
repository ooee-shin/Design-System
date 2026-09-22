// `llms.txt` 의 링크를 사이트에 싣는 규칙을 빌드 없이 본다. 파일 시스템이 필요한 것은 임시 디렉터리에
// 가짜 저장소와 가짜 `out/` 을 만들어 본다. 가짜 저장소는 `git init` 과 `git add` 까지 한다 — 실리는 파일은
// git 이 추적하는 것뿐이라, index 가 없으면 규칙을 볼 수 없다.
//
// 빌드(`mirror-llms-links.mjs`)에서 처음 걸리면 원인을 찾기까지 `next build` 를 몇 번씩 돌려야 한다.
// 링크를 고르는 법·공개 범위·경로 검사·웹판 치환·출력 충돌을 여기서 먼저 잡고, 빌드가 부르는 `mirrorSite` 도
// 임시 `out/` 에 그대로 돌려 실제로 쓴 결과를 본다. 순수 함수만 보면 쓰는 줄이 빠져도 시험이 통과한다.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, renameSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  checkTarget,
  directoryIndex,
  findCollisions,
  headersFile,
  isPublishable,
  localLinks,
  LOCAL_ORIGINS,
  mirrorSite,
  planMirror,
  PUBLISHABLE,
  REPO_ONLY,
  resolveFrom,
  STUDIO_ORIGIN,
  trackedFiles,
  WEB_NOTICE,
  webLlmsTxt,
} from "./llms-links.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const source = readFileSync(path.join(root, "llms.txt"), "utf8");

/** `{ "a/b.md": "내용" }` 모양으로 임시 디렉터리에 파일을 만든다. */
function fixture(files) {
  const dir = mkdtempSync(path.join(tmpdir(), "ooee-llms-"));
  write(dir, files);
  return dir;
}

function write(dir, files) {
  for (const [relative, content] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(dir, relative)), { recursive: true });
    writeFileSync(path.join(dir, relative), content);
  }
}

/** 시험을 부른 쪽의 저장소를 건드리지 않게 git 이 자리를 찾는 변수를 뗀다. */
const gitEnv = () => {
  const env = { ...process.env };
  for (const name of ["GIT_DIR", "GIT_WORK_TREE", "GIT_INDEX_FILE", "GIT_COMMON_DIR"]) delete env[name];
  return env;
};
const git = (dir, ...args) => execFileSync("git", ["-C", dir, ...args], { env: gitEnv(), stdio: ["ignore", "pipe", "pipe"] });

/**
 * 가짜 저장소. `files` 를 쓰고 `git add` 한 뒤 `untracked` 를 쓴다. `before` 는 `git add` 전에 디렉터리를 받아
 * 심볼릭 링크 같은 것을 만든다 — 그것도 index 에 들어간다.
 */
function repo(files, { untracked = {}, before } = {}) {
  const dir = fixture(files);
  before?.(dir);
  git(dir, "init", "-q");
  git(dir, "add", "-A");
  write(dir, untracked);
  return dir;
}

const rejects = (target, pattern) => assert.throws(() => checkTarget(target), pattern, `${target} 를 받아 들였다`);

/** 던진 글에 기대한 조각이 모두 들었는지. 문제를 모아 한 번에 던지므로 조각마다 따로 본다. */
function throwsAll(fn, expected) {
  assert.throws(fn, (error) => {
    for (const piece of expected) assert.ok(error.message.includes(piece), `「${piece}」 가 빠졌다:\n${error.message}`);
    return true;
  });
}

test("저장소 안의 링크만 고르고 # 뒤는 뗀다", () => {
  const text = "[a](AGENTS.md) [b](docs/x.md#절) [c](https://example.com) [d](#위) [e](mailto:x@example.com) [f](docs/dir/)";
  assert.deepEqual(localLinks(text), [
    { label: "a", target: "AGENTS.md" },
    { label: "b", target: "docs/x.md" },
    { label: "f", target: "docs/dir/" },
  ]);
});

test("링크는 마크다운 문법대로 읽는다. 코드 안의 [말](경로) 는 링크가 아니다", () => {
  const text = [
    "문법은 `[표시할 말](경로)`이다.",
    "",
    "```md",
    "[울타리 안](fence.md)",
    "```",
    "",
    '[제목 붙은](docs/t.md "제목") [꺾쇠](<docs/s.md>) [참조][r]',
    "",
    "| 무엇 | 어디 |",
    "| --- | --- |",
    "| 표 | [칸](docs/cell.md) |",
    "",
    "[r]: docs/ref.md",
  ].join("\n");
  assert.deepEqual(
    localLinks(text).map((link) => link.target),
    ["docs/t.md", "docs/s.md", "docs/ref.md", "docs/cell.md"],
  );
});

test("URL 과 저장소 경로가 같은 파일을 가리키는 목적지만 받는다", () => {
  assert.deepEqual(checkTarget("docs/system/README.md"), { path: "docs/system/README.md", directory: false });
  assert.deepEqual(checkTarget("docs/system/components/"), { path: "docs/system/components", directory: true });
  // 점으로 시작하는 디렉터리는 wrangler 가 그대로 올린다. 모양으로는 막을 까닭이 없다(싣지 않는 것은 PUBLISHABLE 이 정한다).
  assert.deepEqual(checkTarget(".claude/skills/design-page/SKILL.md"), { path: ".claude/skills/design-page/SKILL.md", directory: false });

  rejects("../outside.md", /`\.\.`/);
  rejects("docs/../AGENTS.md", /`\.\.`/);
  rejects("docs/system/../../..", /`\.\.`/);
  rejects("/etc/passwd", /절대 경로/);
  rejects("./AGENTS.md", /`\.` 조각/);
  rejects("docs//x.md", /빈 조각/);
  rejects("docs/a b.md", /글자/);
  rejects("docs/%2e%2e/x.md", /글자/);
  rejects("docs/:name.md", /글자/);
  rejects("_headers", /설정으로 읽는/);
  rejects("functions/x.md", /설정으로 읽는/);
  rejects("packages/ui/node_modules/x.md", /올리지 않는/);
  rejects("docs/.git/config", /올리지 않는/);
  rejects("", /빈 경로/);
});

test("사이트에 실을 수 있는 자리는 docs/system/ 아래와 packages/ui/src/index.ts 뿐이다", () => {
  assert.deepEqual(PUBLISHABLE, { directories: ["docs/system"], files: ["packages/ui/src/index.ts"] });
  for (const inside of ["docs/system", "docs/system/README.md", "docs/system/components", "docs/system/foundations/color.md", "packages/ui/src/index.ts"]) {
    assert.ok(isPublishable(inside), `${inside} 를 싣지 않는다고 봤다`);
  }
  for (const outside of [
    "AGENTS.md",
    "docs",
    "docs/process/ai-environment.md",
    "docs/systems/x.md",
    "docs/System/README.md",
    ".claude/skills/design-page/SKILL.md",
    "plugins/ooee-harness/skills/generate-code/SKILL.md",
    "scripts/figma/README.md",
    "packages/ui/src/button.tsx",
    "packages/ui/src/index.tsx",
    "llms.txt",
  ]) {
    assert.ok(!isPublishable(outside), `${outside} 를 싣는다고 봤다`);
  }
});

test("파일 링크는 그 파일을, 디렉터리 링크는 그 아래 .md 전부와 목록을 싣는다", () => {
  const dir = repo({
    "docs/system/README.md": "# 시스템\n",
    "docs/system/c/a.md": "# A\n",
    "docs/system/c/b.md": "본문만\n",
    "docs/system/c/deep/d.md": "# D\n",
    "docs/system/c/skip.png": "이미지",
    "packages/ui/src/index.ts": "export {};\n",
  });
  const plan = planMirror(dir, "[r](docs/system/README.md) [c](docs/system/c/) [again](docs/system/c/a.md) [ts](packages/ui/src/index.ts#L1)");

  assert.deepEqual(
    plan.files.map((file) => file.path),
    ["docs/system/README.md", "docs/system/c/a.md", "docs/system/c/b.md", "docs/system/c/deep/d.md", "packages/ui/src/index.ts"],
  );
  // 실은 원본의 자리는 심볼릭 링크를 푼 실제 경로다. macOS 의 임시 디렉터리는 /var → /private/var 아래에 있다.
  assert.equal(plan.files.find((file) => file.path === "docs/system/c/a.md").source, path.join(realpathSync(dir), "docs/system/c/a.md"));
  assert.deepEqual(plan.directories, [
    {
      path: "docs/system/c",
      entries: [
        { path: "a.md", title: "A" },
        { path: "b.md", title: "" },
        { path: "deep/d.md", title: "D" },
      ],
    },
  ]);
  assert.deepEqual(plan.withheld, []);
});

test("허용 목록 밖은 llms.txt 가 링크해도, 파일이 있고 git 이 추적해도 싣지 않는다", () => {
  const dir = repo({
    "AGENTS.md": "# 규칙\n\n[흐름](docs/process/flow.md)\n",
    "docs/process/flow.md": "# 흐름\n",
    "docs/process/other.md": "# 다른\n",
    ".claude/skills/design-page/SKILL.md": "# Skill\n",
    "plugins/ooee-harness/skills/generate-code/SKILL.md": "# Skill\n",
    "scripts/figma/README.md": "# Figma\n",
    "packages/ui/src/button.tsx": "export {};\n",
    "docs/system/README.md": "# 시스템\n",
  });
  const text = [
    "[규칙](AGENTS.md) [흐름](docs/process/flow.md) [과정](docs/process/) [s](.claude/skills/design-page/SKILL.md)",
    "[p](plugins/ooee-harness/skills/generate-code/SKILL.md) [f](scripts/figma/README.md) [b](packages/ui/src/button.tsx)",
    "[시스템](docs/system/README.md)",
  ].join("\n");
  const plan = planMirror(dir, text);

  assert.deepEqual(plan.files.map((file) => file.path), ["docs/system/README.md"]);
  assert.deepEqual(plan.directories, []);
  assert.deepEqual(plan.withheld, [
    "AGENTS.md",
    "docs/process/flow.md",
    "docs/process/",
    ".claude/skills/design-page/SKILL.md",
    "plugins/ooee-harness/skills/generate-code/SKILL.md",
    "scripts/figma/README.md",
    "packages/ui/src/button.tsx",
  ]);
});

test("실을 수 없는 링크는 한 번에 모아 빌드를 멈춘다", () => {
  const outside = fixture({ "secret.md": "밖\n" });
  const dir = repo(
    { "docs/system/dir/x.md": "# X\n", "docs/system/empty/x.txt": "", "docs/system/file.md": "# F\n", "docs/system/mixed/real.md": "# 진짜\n", "docs/process/secret.md": "# 과정\n" },
    {
      before: (at) => {
        symlinkSync(path.join(outside, "secret.md"), path.join(at, "docs/system/leak.md"));
        symlinkSync("../process/secret.md", path.join(at, "docs/system/inner.md"));
        symlinkSync(outside, path.join(at, "docs/system/leakdir"));
        symlinkSync("../../process/secret.md", path.join(at, "docs/system/mixed/leak.md"));
      },
    },
  );

  const text = [
    "[없음](docs/system/none.md) [슬래시 없음](docs/system/dir) [파일에 슬래시](docs/system/file.md/) [빈 디렉터리](docs/system/empty/)",
    "[밖 파일](docs/system/leak.md) [안 링크](docs/system/inner.md) [밖 디렉터리](docs/system/leakdir/) [섞인 디렉터리](docs/system/mixed/) [위로](../x.md)",
  ].join("\n");
  throwsAll(() => planMirror(dir, text), [
    "docs/system/none.md): 저장소에 없다",
    "docs/system/dir): 디렉터리다",
    "docs/system/file.md/): `/` 로 끝나지만",
    "docs/system/empty/): 아래에 git 이 추적하는 .md 가",
    "docs/system/leak.md): 심볼릭 링크다",
    // 저장소 안을 가리키는 심볼릭 링크도 같다. 허용 목록 안의 이름으로 그 밖의 문서가 나간다.
    "docs/system/inner.md): 심볼릭 링크다",
    "docs/system/leakdir/): 심볼릭 링크다",
    // 디렉터리 링크는 그 아래 index 의 .md 를 모두 싣는다. 그 가운데 심볼릭 링크가 끼어도 같다.
    "docs/system/mixed/) 의 leak.md: 심볼릭 링크다",
    "../x.md): `..`",
  ]);
});

test("git 이 추적하지 않는 파일을 가리키면 멈추고, 디렉터리 목록에는 추적하는 파일만 넣는다", () => {
  const dir = repo(
    {
      ".gitignore": "ignored.md\n",
      "docs/system/README.md": "# 시스템\n\n[새 문서](new.md) [무시된 문서](ignored.md)\n",
      "docs/system/c/a.md": "# A\n",
    },
    { untracked: { "docs/system/new.md": "# 아직 add 하지 않았다\n", "docs/system/ignored.md": "# gitignore\n", "docs/system/c/draft.md": "# 초안\n", "docs/system/c/ignored.md": "# 무시\n" } },
  );

  throwsAll(() => planMirror(dir, "[r](docs/system/README.md)"), [
    "docs/system/README.md 의 [새 문서](new.md): git 이 추적하지 않는 파일이다",
    "docs/system/README.md 의 [무시된 문서](ignored.md): git 이 추적하지 않는 파일이다",
  ]);
  throwsAll(() => planMirror(dir, "[n](docs/system/new.md)"), ["[n](docs/system/new.md): git 이 추적하지 않는 파일이다"]);

  // 디렉터리 링크는 index 에서 목록을 뽑는다. 디스크에만 있는 초안과 gitignore 된 파일은 싣지도, 목록에 적지도 않는다.
  const plan = planMirror(dir, "[c](docs/system/c/)");
  assert.deepEqual(plan.files.map((file) => file.path), ["docs/system/c/a.md"]);
  assert.deepEqual(plan.directories[0].entries.map((entry) => entry.path), ["a.md"]);
});

test("경로 중간의 심볼릭 링크를 지나는 자리는 git 이 추적한 이름이어도 싣지 않는다", () => {
  const dir = repo({ "docs/system/real/a.md": "# A\n", "docs/process/p.md": "# 과정\n" });
  // index 에는 docs/system/real/a.md 가 있지만, 디스크에서 docs/system 을 다른 곳으로 바꿔 끼운 경우.
  const elsewhere = fixture({ "real/a.md": "# 바꿔 낀 A\n" });
  renameSync(path.join(dir, "docs/system"), path.join(dir, "docs/system-moved"));
  symlinkSync(elsewhere, path.join(dir, "docs/system"));

  throwsAll(() => planMirror(dir, "[a](docs/system/real/a.md) [d](docs/system/real/)"), [
    "[a](docs/system/real/a.md): 실제 자리가 링크한 경로와 다르다",
    "[d](docs/system/real/): 실제 자리가 링크한 경로와 다르다",
  ]);
});

test("trackedFiles 는 index 의 경로와 mode 를 돌려주고, git 저장소가 아니면 까닭을 담아 던진다", () => {
  const dir = repo({ "docs/system/a.md": "# A\n" }, { before: (at) => symlinkSync("a.md", path.join(at, "docs/system/b.md")), untracked: { "docs/system/c.md": "" } });
  const tracked = trackedFiles(dir);
  assert.equal(tracked.get("docs/system/a.md"), "100644");
  assert.equal(tracked.get("docs/system/b.md"), "120000");
  assert.ok(!tracked.has("docs/system/c.md"));

  assert.throws(() => trackedFiles(fixture({ "a.md": "" })), /git ls-files 를 돌리지 못했다/);
});

test("실은 .md 의 링크를 허용 목록 안에서 끝까지 따라가 닿는 문서를 모두 싣는다", () => {
  const dir = repo({
    "docs/system/README.md": "# 시스템\n\n[흐름](flow.md)\n",
    "docs/system/flow.md": "# 흐름\n\n[다음](sub/next.md#절) [위](README.md) [밖](https://example.com) [여기](#위) `[코드](code.md)`\n",
    "docs/system/sub/next.md": "# 다음\n\n[되돌아](../flow.md) [참조][r] [목록](../c/) [목록 이름](../../../packages/ui/src/index.ts)\n\n[r]: ./ref.md\n",
    "docs/system/sub/ref.md": "# 참조\n",
    "docs/system/c/a.md": "# A\n\n[형제](b.md) [흐름](../flow.md)\n",
    "docs/system/c/b.md": "# B\n",
    "docs/system/unlinked.md": "# 아무도 걸지 않았다\n",
    "packages/ui/src/index.ts": "export {};\n",
  });
  const plan = planMirror(dir, "[a](docs/system/README.md)");

  assert.deepEqual(
    plan.files.map((file) => file.path),
    ["docs/system/README.md", "docs/system/c/a.md", "docs/system/c/b.md", "docs/system/flow.md", "docs/system/sub/next.md", "docs/system/sub/ref.md", "packages/ui/src/index.ts"],
  );
  // 두 번째 칸의 디렉터리 링크도 llms.txt 의 디렉터리 링크와 같이 목록을 둔다.
  assert.deepEqual(plan.directories.map((directory) => directory.path), ["docs/system/c"]);
});

test("실은 문서 안의 링크도 저장소 경로와 사이트 주소가 같은 자리로 풀려야 받는다", () => {
  assert.deepEqual(resolveFrom("docs/system/components/button.md", "../vocabulary.md"), { path: "docs/system/vocabulary.md", directory: false });
  assert.deepEqual(resolveFrom("docs/system/README.md", "./components/"), { path: "docs/system/components", directory: true });
  assert.deepEqual(resolveFrom("AGENTS.md", "docs/system/README.md"), { path: "docs/system/README.md", directory: false });
  assert.throws(() => resolveFrom("docs/a.md", "../../x.md"), /저장소 밖/);
  assert.throws(() => resolveFrom("docs/a.md", "/docs/b.md"), /절대 경로/);
  assert.throws(() => resolveFrom("docs/a.md", "sub//b.md"), /빈 조각/);
  assert.throws(() => resolveFrom("docs/a.md", "../_headers"), /설정으로 읽는/);
});

test("실은 문서가 허용 목록 밖이나 실을 수 없는 자리를 가리키면 한 번에 모아 멈춘다", () => {
  const dir = repo({
    "packages/ui/src/button.tsx": "export {};\n",
    "docs/process/p.md": "# 과정\n",
    "AGENTS.md": "# 규칙\n",
    "docs/system/a.md": "# A\n\n[코드](../../packages/ui/src/button.tsx) [과정](../process/p.md) [규칙](../../AGENTS.md) [없음](none.md) [절대](/docs/a.md) [위로](../../../x.md) [두 빗금](sub//b.md) [슬래시 없음](sub) [그림](pic.png)\n",
    "docs/system/sub/b.md": "# B\n",
    "docs/system/pic.png": Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0xff, 0xfe]),
  });

  throwsAll(() => planMirror(dir, "[a](docs/system/a.md)"), [
    "docs/system/a.md 의 [코드](../../packages/ui/src/button.tsx): packages/ui/src/button.tsx 는 사이트에 싣지 않는 자리다",
    "docs/system/a.md 의 [과정](../process/p.md): docs/process/p.md 는 사이트에 싣지 않는 자리다",
    "docs/system/a.md 의 [규칙](../../AGENTS.md): AGENTS.md 는 사이트에 싣지 않는 자리다",
    "docs/system/a.md 의 [없음](none.md): 저장소에 없다",
    "[절대](/docs/a.md): 절대 경로",
    "[위로](../../../x.md): 저장소 밖",
    "[두 빗금](sub//b.md): 빈 조각",
    "[슬래시 없음](sub): 디렉터리다",
    "[그림](pic.png): UTF-8 글자 파일이 아니다",
  ]);

  // llms.txt 가 밖을 직접 링크해도 두 번째 칸이 그 밖으로 나가는 길이 되지 않는다. 링크는 풀리고 파일은 싣지 않는다.
  const direct = repo({ "packages/ui/src/button.tsx": "export {};\n", "docs/system/a.md": "# A\n\n[코드](../../packages/ui/src/button.tsx)\n" });
  throwsAll(() => planMirror(direct, "[a](docs/system/a.md) [b](packages/ui/src/button.tsx)"), ["packages/ui/src/button.tsx 는 사이트에 싣지 않는 자리다"]);
});

test("웹판은 로컬 주소를 바꾸고, 허용 목록 밖 링크를 풀고, 제목 아래에 한 줄을 더한다", () => {
  const text = [
    "# 색인",
    "",
    "보기: `http://localhost:3000/components/<key>`",
    "",
    "| 무엇 | 어디 |",
    "| --- | --- |",
    "| 규칙 | [AGENTS.md](AGENTS.md) |",
    "| 명령 | [SKILL.md](plugins/ooee-harness/skills/generate-code/SKILL.md) |",
    "| 목록 | [docs/system/README.md](docs/system/README.md) |",
    "",
    "까닭은 [ai-environment.md](docs/process/ai-environment.md#결정)의 「절」에 있다. [과정 모음](docs/process/) [컴포넌트](docs/system/components/) [이름](packages/ui/src/index.ts) [밖](https://example.com)",
    "",
  ].join("\n");

  assert.equal(
    webLlmsTxt(text),
    [
      "# 색인",
      "",
      WEB_NOTICE,
      "",
      `보기: \`${STUDIO_ORIGIN}/components/<key>\``,
      "",
      "| 무엇 | 어디 |",
      "| --- | --- |",
      `| 규칙 | \`AGENTS.md\`(${REPO_ONLY}) |`,
      `| 명령 | \`plugins/ooee-harness/skills/generate-code/SKILL.md\`(${REPO_ONLY}) |`,
      "| 목록 | [docs/system/README.md](docs/system/README.md) |",
      "",
      `까닭은 \`docs/process/ai-environment.md#결정\`(${REPO_ONLY})의 「절」에 있다. 과정 모음(\`docs/process/\`, ${REPO_ONLY}) [컴포넌트](docs/system/components/) [이름](packages/ui/src/index.ts) [밖](https://example.com)`,
      "",
    ].join("\n"),
  );
  assert.match(WEB_NOTICE, /^> 이 사이트에는 시스템 문서\(`docs\/system\/` 아래, `packages\/ui\/src\/index\.ts`\)만 실린다\./);

  // 제목이 없으면 맨 앞에 둔다. 로컬 주소가 없는 글은 그 자리를 건드리지 않는다.
  assert.equal(webLlmsTxt("로컬 주소가 없는 글"), `${WEB_NOTICE}\n\n로컬 주소가 없는 글`);
});

test("웹판은 풀어야 할 링크를 못 풀었거나 바꿀 곳을 모르는 로컬 주소가 남으면 멈춘다", () => {
  // 같은 링크 글자가 코드 안에 먼저 나오면 원문에서 자리를 찾는 쪽이 코드 안을 바꾼다. 그대로 내보내지 않고 멈춘다.
  assert.throws(() => webLlmsTxt("문법 `[a](AGENTS.md)` 와 진짜 [a](AGENTS.md)"), /풀지 못했다/);

  // 다른 포트를 반쯤 바꿔 엉뚱한 주소를 만들지 않고, 바꿀 곳을 모르는 로컬 주소로 보고 멈춘다.
  assert.throws(() => webLlmsTxt("http://localhost:30001/x"), /localhost:30001/);
  assert.throws(() => webLlmsTxt("Sandbox http://localhost:3001/voc"), /localhost:3001/);
  assert.throws(() => webLlmsTxt("http://127.0.0.1:3000/"), /127\.0\.0\.1:3000/);
});

test("지금의 llms.txt 는 로컬 주소, 싣지 않는 링크, 머리 한 줄만 바뀌어 나간다", () => {
  const web = webLlmsTxt(source);
  assert.ok(!web.includes("localhost"), "배포본에 localhost 가 남았다");

  const [title, blank, notice, ...rest] = web.split("\n");
  assert.equal(title, source.split("\n")[0]);
  assert.deepEqual([blank, notice], ["", WEB_NOTICE]);

  let expected = source;
  for (const [local, deployed] of Object.entries(LOCAL_ORIGINS)) expected = expected.replaceAll(local, deployed);
  // 웹판은 제목 · 빈 줄 · 알림 한 줄 뒤에 원본의 둘째 줄(빈 줄)부터 그대로 잇는다.
  const expectedLines = expected.split("\n").slice(1);
  assert.equal(rest.length, expectedLines.length);
  const withheld = localLinks(source).filter(({ target }) => !isPublishable(target.replace(/\/$/, "")));
  assert.ok(withheld.length > 0, "싣지 않는 링크가 하나도 없다. 이 시험이 무엇을 보는지 다시 본다");
  for (const [index, line] of rest.entries()) {
    const original = expectedLines[index];
    if (line === original) continue;
    // 바뀐 줄은 싣지 않는 링크가 있던 줄뿐이고, 그 링크는 모두 경로 글자와 「저장소 안에서만」으로 남는다.
    const here = localLinks(original).filter(({ target }) => !isPublishable(target.replace(/\/$/, "")));
    assert.ok(here.length > 0, `싣지 않는 링크가 없는 줄이 바뀌었다:\n${original}\n→ ${line}`);
    for (const { target } of here) assert.ok(line.includes(`\`${target}\`(${REPO_ONLY})`), `${target} 가 글자로 남지 않았다:\n${line}`);
  }
  assert.deepEqual(
    localLinks(web).map((link) => link.target),
    localLinks(source).map((link) => link.target).filter((target) => isPublishable(target.replace(/\/$/, ""))),
  );
});

test("배포 주소가 deploy:studio 가 올리는 Pages 프로젝트와 같다", () => {
  const scripts = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8")).scripts;
  const project = scripts["deploy:studio"].match(/--project-name=(\S+)/)[1];
  assert.equal(STUDIO_ORIGIN, `https://${project}.pages.dev`);
});

test("지금의 웹판 llms.txt 와 실은 문서의 링크가 모두 사이트에 실린 자리에 닿고, 시스템 문서 밖은 싣지 않는다", () => {
  // 링크가 실을 수 없는 모양이면 빌드 끝에서야 멈춘다. 여기서 먼저 멈추게 한다. 풀기는 planMirror 와 따로
  // 사이트를 읽는 쪽처럼 URL 로 한다 — 실은 자리에서 링크를 따라간 쪽이 다음 칸에서 404 를 만나지 않는지 본다.
  const plan = planMirror(root, source);
  const site = "https://site.invalid/";
  const served = new Set([...plan.files.map((file) => file.path), ...plan.directories.map((directory) => `${directory.path}/`)]);
  const pages = [
    ["llms.txt", webLlmsTxt(source)],
    ...plan.files.filter((file) => file.path.endsWith(".md")).map((file) => [file.path, readFileSync(file.source, "utf8")]),
    ...plan.directories.map((directory) => [`${directory.path}/`, directoryIndex(directory)]),
  ];
  const broken = new Set();
  for (const [page, text] of pages) {
    for (const { target } of localLinks(text)) {
      const resolved = decodeURI(new URL(target, new URL(page, site)).pathname.slice(1));
      if (!served.has(resolved)) broken.add(`${page} → ${target}`);
    }
  }
  assert.deepEqual([...broken], [], `사이트에서 따라가면 404 가 나는 링크:\n${[...broken].join("\n")}`);

  const outside = [...served].filter((relative) => !isPublishable(relative.replace(/\/$/, "")));
  assert.deepEqual(outside, [], `허용 목록 밖을 싣는다:\n${outside.join("\n")}`);
  for (const internal of ["AGENTS.md", "docs/process/ai-environment.md", ".claude/skills/design-page/SKILL.md", "plugins/ooee-harness/skills/generate-code/SKILL.md", "scripts/figma/README.md"]) {
    assert.ok(!served.has(internal), `${internal} 를 싣는다`);
    assert.ok(plan.withheld.includes(internal) || !localLinks(source).some(({ target }) => target === internal), `${internal} 를 llms.txt 가 링크하는데 withheld 에 없다`);
  }
});

test("스튜디오 출력과 같은 주소를 두고 다투면 찾아낸다", () => {
  const out = fixture({
    "docs.html": "",
    "docs/README.html": "",
    "docs/README.txt": "",
    "docs/README/__next._tree.txt": "",
    "notes.md.html": "",
    "guide.md/index.html": "",
    "components.html": "",
    "llms.txt": "",
    "blocked": "",
  });
  const plan = {
    files: ["docs/README.txt", "notes.md", "guide.md", "llms.txt", "blocked/x.md", "docs/system/README.md"].map((file) => ({ path: file, source: "" })),
    directories: [{ path: "docs/README", entries: [] }, { path: "components", entries: [] }, { path: "docs/system/components", entries: [] }],
  };
  const found = findCollisions(out, plan).join("\n");

  assert.match(found, /docs\/README\.txt — 스튜디오가 같은 이름을/, "RSC 본문(.txt)과 같은 이름");
  assert.match(found, /notes\.md — 스튜디오의 notes\.md\.html/, "Pages 가 /notes.md 에 .html 을 붙여 찾는 자리");
  assert.match(found, /guide\.md — 스튜디오의 guide\.md\/index\.html/, "Pages 가 /guide.md 를 디렉터리로 돌리는 자리");
  assert.match(found, /llms\.txt — 스튜디오가 같은 이름을/);
  assert.match(found, /blocked\/x\.md — 스튜디오가 blocked 를 파일로/);
  assert.match(found, /docs\/README\/ — 스튜디오 출력에 이미 있는 디렉터리/, "페이지 조각을 담는 <라우트>/ 디렉터리");
  assert.match(found, /components\/ — 스튜디오의 components\.html/);
  // Next 가 만든 docs/ 아래에 새 디렉터리를 더하는 것은 부딪힘이 아니다. 지금 llms.txt 가 그렇게 싣는다.
  assert.doesNotMatch(found, /docs\/system/);

  assert.deepEqual(findCollisions(fixture({ "_headers": "" }), { files: [], directories: [] }), ["_headers — 스튜디오 출력에 이미 있다. 덮으면 그쪽 규칙이 사라진다"]);
});

test("_headers 는 실은 자리마다 글자로 내게 하고 디렉터리는 한 규칙으로 덮는다", () => {
  const plan = {
    files: [{ path: "docs/system/README.md" }, { path: "docs/system/c/a.md" }, { path: "packages/ui/src/index.ts" }],
    directories: [{ path: "docs/system/c", entries: [] }],
  };
  const rules = headersFile(plan).split("\n").filter((line) => line.startsWith("/"));
  assert.deepEqual(rules, ["/docs/system/README.md", "/packages/ui/src/index.ts", "/docs/system/c/*"]);
  assert.match(headersFile(plan), /^\/docs\/system\/README\.md\n  Content-Type: text\/plain; charset=utf-8$/m);

  const many = { files: Array.from({ length: 101 }, (_, index) => ({ path: `f${index}.md` })), directories: [] };
  assert.throws(() => headersFile(many), /100개까지만/);
});

test("디렉터리 목록은 그 주소 기준 상대 링크로 적는다", () => {
  const text = directoryIndex({ path: "docs/c", entries: [{ path: "a.md", title: "A" }, { path: "deep/d.md", title: "" }] });
  assert.equal(text.split("\n")[0], "# docs/c/");
  assert.deepEqual(localLinks(text).map((link) => link.target), ["a.md", "deep/d.md"]);
  assert.match(text, /^- \[a\.md\]\(a\.md\) — A$/m);
  assert.match(text, /^- \[deep\/d\.md\]\(deep\/d\.md\)$/m);
});

/** 빌드가 부르는 그대로 돌릴 가짜 저장소와, `next build` 가 막 낸 것처럼 원본 llms.txt 를 가진 가짜 `out/`. */
function site() {
  const llms = "# 색인\n\n보기: `http://localhost:3000/components/<key>`\n\n[규칙](AGENTS.md) [시스템](docs/system/README.md) [목록](docs/system/c/) [과정](docs/process/flow.md)\n";
  const dir = repo({
    "llms.txt": llms,
    "AGENTS.md": "# 규칙\n\n[흐름](docs/process/flow.md)\n",
    "docs/process/flow.md": "# 흐름\n",
    "docs/system/README.md": "# 시스템\n\n[용어](vocabulary.md)\n",
    "docs/system/vocabulary.md": "# 용어\n",
    "docs/system/c/a.md": "# A\n\n[용어](../vocabulary.md)\n",
  });
  const out = fixture({ "llms.txt": llms, "index.html": "<!doctype html>", "docs.html": "<!doctype html>" });
  return { llms, repo: dir, out, read: (relative) => readFileSync(path.join(out, relative)) };
}

test("mirrorSite 는 허용 목록 안의 원본만 바이트 그대로 싣고 목록·_headers 와 웹판 llms.txt 를 쓴다", () => {
  const { llms, repo: dir, out, read } = site();
  const plan = mirrorSite(dir, out);

  assert.deepEqual(plan.files.map((file) => file.path), ["docs/system/README.md", "docs/system/c/a.md", "docs/system/vocabulary.md"]);
  for (const file of plan.files) assert.ok(read(file.path).equals(readFileSync(path.join(dir, file.path))), `${file.path} 가 원본과 다르다`);
  for (const internal of ["AGENTS.md", "docs/process/flow.md", "docs/process"]) assert.ok(!existsSync(path.join(out, internal)), `허용 목록 밖의 ${internal} 를 실었다`);

  const web = read("llms.txt").toString("utf8");
  assert.equal(web, webLlmsTxt(llms));
  assert.ok(!web.includes("localhost"), "배포본 llms.txt 에 localhost 가 남았다");
  assert.ok(web.includes(`규칙(\`AGENTS.md\`, ${REPO_ONLY})`) && web.includes(`과정(\`docs/process/flow.md\`, ${REPO_ONLY})`), `싣지 않는 자리의 링크가 풀리지 않았다:\n${web}`);
  assert.deepEqual(localLinks(web).map((link) => link.target), ["docs/system/README.md", "docs/system/c/"]);

  assert.equal(read("docs/system/c/index.html").toString("utf8"), directoryIndex(plan.directories[0]));
  assert.equal(read("_headers").toString("utf8"), headersFile(plan));
  // 스튜디오가 낸 것은 건드리지 않는다.
  assert.equal(read("index.html").toString("utf8"), "<!doctype html>");
});

test("mirrorSite 는 덮인 llms.txt·이미 손본 out/·부딪히는 자리·추적하지 않는 파일에서 쓰지 않고 멈춘다", () => {
  const overwritten = site();
  writeFileSync(path.join(overwritten.out, "llms.txt"), "<RSC 본문>");
  assert.throws(() => mirrorSite(overwritten.repo, overwritten.out), /원본 글자가 아니다/);

  const twice = site();
  mirrorSite(twice.repo, twice.out);
  assert.throws(() => mirrorSite(twice.repo, twice.out), /이미 손본 out\//);

  const clash = site();
  mkdirSync(path.join(clash.out, "docs/system"), { recursive: true });
  writeFileSync(path.join(clash.out, "docs/system/vocabulary.md.html"), "");
  assert.throws(() => mirrorSite(clash.repo, clash.out), /부딪힌다[\s\S]*docs\/system\/vocabulary\.md — 스튜디오의 docs\/system\/vocabulary\.md\.html/);
  for (const relative of ["_headers", "docs/system/README.md", "docs/system/vocabulary.md", "docs/system/c"]) assert.ok(!existsSync(path.join(clash.out, relative)), `멈췄는데 ${relative} 를 썼다`);
  assert.equal(clash.read("llms.txt").toString("utf8"), clash.llms, "멈췄는데 llms.txt 를 바꿨다");

  // 로컬에서 만든 채 add 하지 않은 문서를 링크하면, 디스크에 있어도 올리지 않고 멈춘다.
  const local = site();
  write(local.repo, { "docs/system/README.md": "# 시스템\n\n[용어](vocabulary.md) [메모](notes.md)\n", "docs/system/notes.md": "# 올리면 안 되는 메모\n" });
  assert.throws(() => mirrorSite(local.repo, local.out), /\[메모\]\(notes\.md\): git 이 추적하지 않는 파일이다/);
  for (const relative of ["_headers", "docs/system/notes.md", "docs/system/README.md"]) assert.ok(!existsSync(path.join(local.out, relative)), `멈췄는데 ${relative} 를 썼다`);
});
