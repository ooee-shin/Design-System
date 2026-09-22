// `/process-issue` Skill 이 가리키는 파일이 실제로 있는지 본다.
//
// 이 Skill 은 규칙을 스스로 갖지 않고 generate-code·design-page·review-design 의 SKILL.md 와 이 폴더의
// 스크립트를 가리키기만 한다. 그래서 가리킨 자리가 옮겨 가면 Skill 은 오류 없이 엉뚱한 자리를 읽거나
// 없는 명령을 부른다. llms.txt 가 옮겨 간 파일을 가리킨 채 남아 있던 것과 같은 일이라 같은 방식으로 지킨다.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const skill = readFileSync(path.join(root, ".claude/skills/process-issue/SKILL.md"), "utf8");

test("process-issue SKILL.md 가 적은 저장소 경로가 모두 있다", () => {
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

  // 실제로 가리키는 자리가 스무 곳 가까이 된다. 너무 적게 읽혔으면 정규식이 SKILL.md 모양과 어긋난 것이다.
  assert.ok(new Set(cited).size >= 10, `경로를 ${new Set(cited).size}개만 읽었다 — 정규식이 SKILL.md 모양과 어긋났다`);
  assert.deepEqual(missing, [], `process-issue SKILL.md 가 없는 파일을 가리킨다:\n${missing.join("\n")}`);
});

test("allowed-tools 는 결정을 만들 수 있는 명령을 열지 않고, curl 은 배포 주소 확인 꼴만 연다", () => {
  // 판독(decision.mjs)은 계정으로 거르지 않아 에이전트가 단 반응·「승인」 댓글을 사람의 것과 가르지 못한다.
  // 공용 권한의 deny 도 암묵 POST(`gh api … -f content=+1`)를 못 막으므로 이 Skill 이 스스로 열지 않는다.
  const allowed = (skill.match(/^allowed-tools:(.*)$/m)?.[1] ?? "").split(/,\s+/).map((tool) => tool.trim());
  for (const tool of allowed) {
    assert.doesNotMatch(tool, /gh api|gh issue comment|gh issue (edit|close|reopen)|gh label/, `allowed-tools 가 연다: ${tool}`);
  }
  const curl = allowed.filter((tool) => tool.startsWith("Bash(curl"));
  assert.deepEqual(curl, ["Bash(curl -s -o /dev/null -w '%{http_code}' https://ooee-sandbox.pages.dev/*)"], "curl 은 상태 코드 확인 꼴 하나만 연다");

  // 본문이 돌리는 curl 이 그 꼴에서 벗어나면 단계마다 확인을 묻는다. 둘이 함께 움직이게 본다.
  const prefix = curl[0].slice("Bash(".length, -"*)".length);
  const used = [...skill.matchAll(/^\s*(curl .*?)\s*(?:#.*)?$/gm)].map((match) => match[1]);
  assert.ok(used.length > 0, "본문에 curl 명령이 없다 — 7단계 모양이 바뀌었다");
  for (const command of used) assert.ok(command.startsWith(prefix), `allowed-tools 의 curl 꼴이 아니다: ${command}`);
});

test("$ARGUMENTS 의 세 입구가 모두 절로 있다", () => {
  for (const heading of ["## 순서", "## 결과만 올리기", "## 결정 뒤"]) assert.ok(skill.includes(`\n${heading}\n`), `${heading} 절이 없다`);
  assert.match(skill, /「결정」으로 시작하면 「결정 뒤」, 「결과」로 시작하면 「결과만 올리기」/);
});

test("process-issue 가 부르는 세 스크립트가 frontmatter 의 allowed-tools 에 있다", () => {
  // 본문이 부르는 스크립트가 allowed-tools 에서 빠지면 단계마다 확인을 묻다가 headless 에서는 거부된다.
  const allowed = skill.match(/^allowed-tools:(.*)$/m)?.[1] ?? "";
  for (const script of ["issue.mjs", "result-comment.mjs", "decision.mjs"]) {
    assert.ok(skill.includes(`node scripts/harness/${script}`), `본문이 ${script} 를 부르지 않는다`);
    assert.ok(allowed.includes(`Bash(node scripts/harness/${script}:*)`), `allowed-tools 에 ${script} 가 없다`);
    assert.ok(existsSync(path.join(root, "scripts/harness", script)), `scripts/harness/${script} 가 없다`);
  }
});
