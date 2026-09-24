// `/make-screens` Skill 이 가리키는 파일이 실제로 있는지 본다.
//
// 이 Skill 은 규칙을 스스로 갖지 않고 generate-code·review-design 의 SKILL.md 와 이 폴더의
// 스크립트를 가리키기만 한다. 그래서 가리킨 자리가 옮겨 가면 Skill 은 오류 없이 엉뚱한 자리를 읽거나
// 없는 명령을 부른다. llms.txt 가 옮겨 간 파일을 가리킨 채 남아 있던 것과 같은 일이라 같은 방식으로 지킨다.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const skill = readFileSync(path.join(root, ".claude/skills/make-screens/SKILL.md"), "utf8");

test("make-screens SKILL.md 가 적은 저장소 경로가 모두 있다", () => {
  // `<n>`·`<key>` 같은 자리 표시가 든 경로(.harness-work/issue-<n>/… 등)는 처리할 때 생기는 것이라 뺀다.
  const looksLikePath = (text) =>
    /^[a-zA-Z0-9._/-]+$/.test(text) && text.includes("/") && !text.startsWith("/") && /\.(ts|tsx|mjs|js|json|md|yml)$/.test(text);

  // 코드 울타리(```)를 먼저 떼어 낸다. 남겨 두면 백틱 짝이 한 칸씩 밀려 본문의 경로를 절반쯤 놓친다.
  // 울타리 안의 명령은 낱말로 쪼개 경로처럼 생긴 것을 본다.
  const fences = [...skill.matchAll(/```[^\n]*\n([\s\S]*?)```/g)].map((match) => match[1]);
  const prose = skill.replace(/```[^\n]*\n[\s\S]*?```/g, "");
  const cited = [
    ...[...prose.matchAll(/`([^`]+)`/g)].map((match) => match[1]),
    ...fences.flatMap((block) => block.split(/\s+/)),
  ].filter(looksLikePath);
  const missing = [...new Set(cited)].filter((target) => !existsSync(path.join(root, target)));

  // 짧은 명령이라 가리키는 자리가 많지 않다. 아주 적게 읽혔으면 정규식이 SKILL.md 모양과 어긋난 것이다.
  assert.ok(new Set(cited).size >= 3, `경로를 ${new Set(cited).size}개만 읽었다 — 정규식이 SKILL.md 모양과 어긋났다`);
  assert.deepEqual(missing, [], `make-screens SKILL.md 가 없는 파일을 가리킨다:\n${missing.join("\n")}`);
});

test("make-screens 의 allowed-tools 는 읽고 만드는 것만 연다 — 결정·pull request·배포 확인은 러너의 몫이다", () => {
  // 판독(decision.mjs)은 계정으로 거르지 않아 에이전트가 단 반응·「승인」 댓글을 사람의 것과 가르지 못한다.
  // 공용 권한이 `gh api` 를 통째로 막고 `gh issue comment` 를 ask 로 두지만, Skill 도 스스로 열지 않아 두 겹으로 둔다.
  // 배포 확인은 deploy-check.mjs 가 하므로 curl 도 열지 않는다. 못 하게 해 두는 것이 규칙보다 낫다.
  const allowed = (skill.match(/^allowed-tools:(.*)$/m)?.[1] ?? "").split(/,\s+/).map((tool) => tool.trim());
  const forbidden = /gh api|gh issue (comment|edit|close|reopen)|gh label|gh pr (create|merge)|git (commit|push|switch)|curl|deploy-check|post-result/;
  for (const tool of allowed) {
    assert.doesNotMatch(tool, forbidden, `allowed-tools 가 연다: ${tool} — 러너의 몫이다`);
  }
  // 읽고 만드는 데 꼭 필요한 것은 있어야 한다. 없으면 단계마다 확인을 묻다가 헤드리스에서 거부된다.
  for (const need of ["node scripts/harness/issue.mjs:*", "node scripts/visual/inspect.mjs:*"]) {
    assert.ok(allowed.includes(`Bash(${need})`), `allowed-tools 에 ${need} 가 없다`);
  }
});

test("기다리는 일을 이 명령이 맡지 않는다 — 배포도 머지도 러너가 본다", () => {
  // 기다리는 명령은 허용 목록 밖이라 헤드리스에서 거부되고, 이 차례가 끝나면 세션도 끝나 뒤를 받을 수 없다.
  const body = skill.replace(/^---\n[\s\S]*?\n---\n/, "");
  const commands = [...body.matchAll(/```bash\n([\s\S]*?)```/g)].flatMap((match) => match[1].split("\n"));
  for (const forbidden of ["gh run watch", "sleep ", "curl ", "deploy-check", "gh pr create", "gh pr merge", "git commit", "git push"]) {
    assert.deepEqual(commands.filter((line) => line.includes(forbidden)), [], `이 명령이 ${forbidden} 를 시킨다 — 러너의 몫이다`);
  }
});

test("plan.json 의 칸이 모두 적혀 있다 — 러너가 그것으로 pull request 와 결과 댓글을 만든다", () => {
  for (const field of ["screens[].key", "screens[].name", "screens[].project", "screens[].viewports", "screens[].args", "componentsUsed", "needsDecision"]) {
    assert.ok(skill.includes(field), `plan.json 의 ${field} 가 적혀 있지 않다`);
  }
  assert.match(skill, /\.harness-work\/issue-<n>\/plan\.json/);
});

test("allowed-tools 의 `:*` 는 낱말이 끝난 뒤에만 쓴다", () => {
  // `:*` 는 「공백 + *」와 같다(Claude Code 문서 「Configure permissions」). `feature/issue-:*` 는 `feature/issue- …` 만
  // 받고 `feature/issue-29-…` 는 받지 않는다. 사람이 연 세션에서는 확인 창이 가려 주지만, 러너에서는 거부되어
  // #29 가 3단계에서 멈췄다. 낱말 중간에서 이어 받으려면 공백 없이 `*` 를 쓴다.
  const skills = [".claude/skills/make-screens/SKILL.md", ...["generate-code", "review-design"].map((name) => `plugins/ooee-harness/skills/${name}/SKILL.md`)];
  for (const file of skills) {
    const text = readFileSync(path.join(root, file), "utf8");
    const allowed = (text.match(/^allowed-tools:(.*)$/m)?.[1] ?? "").split(/,\s+/).map((tool) => tool.trim());
    const broken = allowed.filter((tool) => /[/\-.=]:\*\)$/.test(tool));
    assert.deepEqual(broken, [], `${file} 의 규칙이 낱말 중간의 :* 라 아무것도 받지 못한다`);
  }
});

test("하위 명령의 보고로 끝내지 않는다", () => {
  // #39·#85 가 generate-code 의 「pull request 준비 완료」를 그대로 내고 차례를 끝냈다. 남은 화면이 있어도 멈췄다.
  assert.match(skill, /하위 명령의 보고는 이 명령의 끝이 아니다/);
  for (const heading of ["## 화면을 만들었다", "## 처리 중 실패"]) {
    assert.ok(skill.includes(heading), `보고의 첫 제목 ${heading} 이 없다`);
  }
});

test("하위 명령은 오래 걸리는 검사를 배경으로 밀지 않는다 — 러너 세션은 그 뒤를 받을 수 없다", () => {
  // 2026-09-23 #75: `pnpm check` 가 10분을 넘겨 배경으로 넘어갔고, 기다리려 한 Monitor 가 거부되어 멈췄다.
  // 도구 제한이 10분이라 앞에서 끝나지 않는 명령은 이 세션이 결과를 볼 길이 없다.
  const generate = readFileSync(path.join(root, "plugins/ooee-harness/skills/generate-code/SKILL.md"), "utf8");
  assert.match(generate, /배경으로 밀어 두고 기다리지 않는다/, "오래 걸리는 검사를 어떻게 할지 적혀 있지 않다");
  assert.match(generate, /한 줄에 명령을 여러 개 묶지 않는다/, "묶은 명령이 거부된다는 것이 적혀 있지 않다");
});

test("뜻이 갈리면 묻지 않고 만들어서 보여 준다", () => {
  // 2026-09-24 개발자: 「그냥 이렇게 하면 어때요? 라고 제안해서 우리가 오케이 하면 그대로 올리면 되잖아.
  // 왜 실패로 돌리려는 거야」. 기획자는 글로 된 물음이 아니라 도는 화면을 보고 답하는 편이 빠르다.
  assert.match(skill, /묻고 멈추지 않는다/);
  assert.match(skill, /무엇으로 읽었는지와 버린 갈래를.*needsDecision/s);
  assert.match(skill, /화면에 없는 것을 말하면 \*\*새로 두라는 뜻\*\*으로 읽는다/);
  // 그래도 만들 수 없는 자리는 남아야 한다 — 고칠 화면을 못 찾으면 지어낼 수 없다.
  assert.match(skill, /그래도 만들 수 없을 때만 멈춘다/);
});
