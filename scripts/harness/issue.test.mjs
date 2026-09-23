// 화면 요청 이슈 파서를 고정한다. 픽스처는 gh 로 한 번 받아 둔 실제 이슈 본문이라 네트워크를 쓰지 않는다.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { loadSandboxProjectIds, parseIssue, parseSandboxProjectIds, splitProjects } from "./issue.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const fixture = (n) => JSON.parse(readFileSync(path.join(here, "fixtures", `issue-${n}.json`), "utf8"));
const ALLOWED = ["sto", "sv", "web"];
/** 실제 #9 본문에서 프로젝트 줄만 바꾼다. 나머지 칸은 실제 모양 그대로 둔다. */
const nineWith = (projectLine) => {
  const issue = fixture(9);
  return { ...issue, body: issue.body.replace("[프로젝트: web,sto,sv]", projectLine) };
};

test("허용 프로젝트는 screens.ts 의 SANDBOX_PROJECTS 에서 읽는다", () => {
  assert.deepEqual(loadSandboxProjectIds(), ALLOWED, "screens.ts 의 id 가 바뀌었다. 폼의 프로젝트 라디오도 함께 고쳐야 한다");
});

test("SANDBOX_PROJECTS 를 찾지 못하면 조용히 넘어가지 않고 던진다", () => {
  assert.throws(() => parseSandboxProjectIds("export const OTHER = [];"), /SANDBOX_PROJECTS/);
  assert.throws(() => parseSandboxProjectIds("export const SANDBOX_PROJECTS = [] as const;"), /id 가 하나도 없다/);
});

test("#9: 대괄호 프로젝트, 콜론 뒤 공백 없음, 빈 값을 읽는다", () => {
  const out = parseIssue(fixture(9));
  assert.equal(out.number, 9);
  assert.equal(out.url, "https://github.com/bluekey-kr/Design-System-Harness/issues/9");
  assert.equal(out.screenName, "이커머스 구매 페이비", "제목에서 「화면 요청:」 을 떼야 한다");
  assert.deepEqual(out.fields.projects, ["web", "sto", "sv"]);
  assert.equal(out.fields.requester, "@유진식");
  assert.equal(out.fields.requirement, "자율 4-5페이지 정도의 시나리오", "콜론 뒤에 공백이 없어도 값을 읽어야 한다");
  assert.equal(out.fields.similar, "Nike , 무신사 , 크림");
  assert.equal(out.fields.onSubmit, "", "빈 칸은 빈 글자다");
  assert.deepEqual(out.unknownProjects, []);
});

test("#9: 프로젝트가 셋이면 만들지 않고 까닭을 적는다", () => {
  const out = parseIssue(fixture(9));
  assert.equal(out.generateArgs, null);
  assert.equal(out.problems.length, 1);
  assert.match(out.problems[0], /프로젝트가 3개\(web, sto, sv\)/);
});

test("#4: 프로젝트 칸이 없는 옛 양식 — 여러 줄 요구사항은 다음 라벨까지 읽는다", () => {
  const out = parseIssue(fixture(4));
  assert.equal(out.fields.requirement, "국내, 해외 주식이 보여지는 화면\n매수, 매도 화면 클릭시 나오는거", "요구사항의 둘째 줄을 잃으면 안 된다");
  assert.equal(out.fields.similar, "TOSS 증권");
  assert.equal(out.fields.onSubmit, "");
  assert.deepEqual(out.fields.projects, []);
  assert.equal(out.generateArgs, null);
  assert.match(out.problems.join("\n"), /프로젝트가 없다/);
  assert.deepEqual(out.notes, [], "옛 양식이어도 라벨이 모두 줄 처음에 있으면 적을 것이 없다");
});

test("#3: 앞 글에 붙은 「요청자:」 도 라벨로 읽고, 라벨 없는 앞 글은 버렸다고 적는다", () => {
  const out = parseIssue(fixture(3));
  assert.equal(out.fields.requester, "@유진식", "줄바꿈 없이 붙은 라벨을 놓치면 요청자가 빈다");
  assert.equal(out.fields.requirement, "국내, 해외 주식이 보여지는 화면\n매수, 매도 화면 클릭시 나오는거");
  assert.equal(out.fields.similar, "", "칸이 없으면 빈 글자다");
  assert.ok(out.notes.some((note) => note.includes("「요청자:」 가 줄 처음이 아니라")), "붙은 라벨을 읽었다는 것을 알려야 한다");
  assert.ok(out.notes.some((note) => note.includes("라벨 없이 앞에 놓인 글")), "버린 앞 글이 있다는 것을 알려야 한다");
  assert.equal(out.generateArgs, null);
});

test("#1·#2: 라벨이 하나도 없는 첫 양식은 요구사항을 짐작하지 않는다", () => {
  for (const n of [1, 2]) {
    const out = parseIssue(fixture(n));
    assert.equal(out.fields.requirement, "", `#${n} 본문 전체를 요구사항으로 삼으면 안 된다`);
    assert.equal(out.fields.requester, "");
    assert.equal(out.generateArgs, null);
    assert.match(out.problems.join("\n"), /「요구사항:」 칸이 없다/);
    assert.match(out.problems.join("\n"), /프로젝트가 없다/);
    assert.ok(out.notes.some((note) => note.includes("라벨 없이 앞에 놓인 글")));
  }
  assert.equal(parseIssue(fixture(1)).screenName, "주식 매매 화면 시스템");
  assert.equal(parseIssue(fixture(2)).screenName, "회원가입 페이지 홈페이지, 앱");
});

test("#6: 요구사항 칸이 없으면 프로젝트가 있어도 만들지 않는다", () => {
  const out = parseIssue(fixture(6));
  assert.deepEqual(out.fields.projects, ["web", "sv", "sto"]);
  assert.equal(out.fields.similar, "TOSS 증권");
  assert.equal(out.generateArgs, null);
  assert.match(out.problems.join("\n"), /「요구사항:」 칸이 없다/);
});

test("프로젝트가 하나면 generate-code 인수를 만든다", () => {
  const out = parseIssue(nineWith("[프로젝트: web]"));
  assert.deepEqual(out.problems, []);
  assert.equal(out.generateArgs, "이커머스 구매 페이비. 자율 4-5페이지 정도의 시나리오 프로젝트: web");
});

test("대괄호 없는 「프로젝트: sto」 꼴도 받는다", () => {
  const out = parseIssue(nineWith("프로젝트: sto"));
  assert.deepEqual(out.fields.projects, ["sto"]);
  assert.match(out.generateArgs, / 프로젝트: sto$/);
});

test("여러 줄 요구사항은 인수에서 한 문단으로 편다", () => {
  const issue = { ...fixture(4), body: `프로젝트: sto\n${fixture(4).body}` };
  const out = parseIssue(issue);
  assert.equal(out.fields.requirement.includes("\n"), true, "fields 에는 원문 줄바꿈을 둔다");
  assert.equal(out.generateArgs, "주식 매매 화면 작성 앱 버전으로. 국내, 해외 주식이 보여지는 화면 매수, 매도 화면 클릭시 나오는거 프로젝트: sto");
});

test("모르는 프로젝트 값은 unknownProjects 로 가고 만들지 않는다", () => {
  const out = parseIssue(nineWith("[프로젝트: web, admin]"));
  assert.deepEqual(out.fields.projects, ["web"]);
  assert.deepEqual(out.unknownProjects, ["admin"]);
  assert.equal(out.generateArgs, null, "모르는 값이 섞이면 무엇을 뜻했는지 짐작하지 않는다");
  assert.match(out.problems.join("\n"), /모르는 프로젝트 값: admin/);
});

test("프로젝트는 쉼표·공백으로 나누고 대소문자와 겹침을 정리한다", () => {
  assert.deepEqual(splitProjects(" Web ,  sto,web sv"), ["web", "sto", "sv"]);
  assert.deepEqual(splitProjects(""), []);
});

test("CRLF 줄바꿈이어도 같게 읽는다", () => {
  const issue = fixture(9);
  const out = parseIssue({ ...issue, body: issue.body.replace(/\n/g, "\r\n") });
  assert.equal(out.fields.requirement, "자율 4-5페이지 정도의 시나리오");
  assert.equal(out.fields.similar, "Nike , 무신사 , 크림");
});

test("요구사항 문장 속의 라벨 말은 줄 처음의 진짜 라벨을 이기지 못한다", () => {
  const body = "프로젝트: web\n요청자: @기획자\n요구사항: 목록 위에 요청자: 이름 칸을 둔다\n둘째 줄\n비슷한 기존 화면: 없음\n제출하면 일어나는 일: 없음";
  const out = parseIssue({ number: 1, title: "화면 요청: 목록", body, url: null }, { allowedProjects: ALLOWED });
  assert.equal(out.fields.requester, "@기획자");
  assert.equal(out.fields.requirement, "목록 위에 요청자: 이름 칸을 둔다\n둘째 줄");
  assert.equal(out.fields.onSubmit, "없음");
});

test("제목에 「화면 요청:」 이 없으면 화면 요청 이슈로 보지 않는다", () => {
  const out = parseIssue({ ...nineWith("[프로젝트: web]"), title: "CI 를 되살린다" });
  assert.equal(out.generateArgs, null);
  assert.match(out.problems.join("\n"), /「화면 요청:」로 시작하지 않는다/);
});

test("CLI: --body-file 과 --title 로 gh 없이 돈다", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "harness-issue-"));
  const bodyFile = path.join(dir, "body.md");
  writeFileSync(bodyFile, nineWith("[프로젝트: web]").body);
  const out = execFileSync(process.execPath, [path.join(here, "issue.mjs"), "--body-file", bodyFile, "--title", "화면 요청: 이커머스 구매 페이비", "9"], {
    encoding: "utf8",
    // gh 를 찾지 못하게 해서 정말 gh 없이 도는지 본다.
    env: { ...process.env, PATH: "" },
  });
  const parsed = JSON.parse(out);
  assert.equal(parsed.number, 9);
  assert.equal(parsed.generateArgs, "이커머스 구매 페이비. 자율 4-5페이지 정도의 시나리오 프로젝트: web");
});

test("「수정 대상」이 있으면 승인된 화면을 제자리에서 고치는 요청이다", () => {
  // Slack 「화면 수정 요청」 폼. 프로젝트·앞 요구사항은 대상 요청에서 물려받으므로 여기서 묻지 않는다.
  const body = "요청자: @기획자\n수정 대상: #39\n화면 key: sto-notice-list\n요구사항: 필독 배지를 빼고 제목을 한 줄로 줄인다";
  const read = parseIssue({ number: 44, title: "화면 요청: 공지사항 목록 수정", body }, { allowedProjects: ["sto", "sv", "web"] });
  assert.equal(read.mode, "수정");
  assert.deepEqual(read.fix, { target: 39, screenKey: "sto-notice-list", instruction: "필독 배지를 빼고 제목을 한 줄로 줄인다" });
  assert.deepEqual(read.problems, [], "프로젝트가 없다고 막았다 — 수정 요청은 대상 화면의 프로젝트를 쓴다");
  assert.equal(read.generateArgs, null, "수정 요청의 인수는 대상 pull request 의 앞 인수에 붙여 만든다");
});

test("화면 key 를 적지 않은 수정 요청도 받는다 — 어느 화면인지는 처리하는 쪽이 찾는다", () => {
  const read = parseIssue({ number: 44, title: "화면 요청: 계정 설정 수정", body: "수정 대상: #37\n요구사항: 저장 버튼을 아래로 내린다" }, { allowedProjects: ["web"] });
  assert.deepEqual(read.fix, { target: 37, screenKey: null, instruction: "저장 버튼을 아래로 내린다" });
  assert.deepEqual(read.problems, []);
});

test("수정 대상이 번호가 아니거나 자기 자신이면 묻는다", () => {
  const bad = parseIssue({ number: 44, title: "화면 요청: 수정", body: "수정 대상: 저번에 만든 거\n요구사항: 고쳐 줘" }, { allowedProjects: ["web"] });
  assert.match(bad.problems.join(" "), /이슈 번호를 읽지 못했다/);
  const self = parseIssue({ number: 44, title: "화면 요청: 수정", body: "수정 대상: #44\n요구사항: 고쳐 줘" }, { allowedProjects: ["web"] });
  assert.match(self.problems.join(" "), /이 요청 자신이다/);
});

test("보통 요청은 그대로다 — mode 는 생성이고 fix 는 없다", () => {
  const read = parseIssue({ number: 45, title: "화면 요청: 공지사항 목록", body: "[프로젝트: sto]\n요청자: @기획자\n요구사항: 공지 목록을 보여 준다" }, { allowedProjects: ["sto"] });
  assert.equal(read.mode, "생성");
  assert.equal(read.fix, null);
  assert.match(read.generateArgs, /^공지사항 목록\. 공지 목록을 보여 준다 프로젝트: sto$/);
});
