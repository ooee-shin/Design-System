// 화면 요청 이슈 파서를 고정한다. 픽스처는 gh 로 한 번 받아 둔 실제 이슈 본문이라 네트워크를 쓰지 않는다.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { loadSandboxProjectIds, parseIssue, parseSandboxProjectIds, splitChoices, splitProjects } from "./issue.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const fixture = (n) => JSON.parse(readFileSync(path.join(here, "fixtures", `issue-${n}.json`), "utf8"));
const ALLOWED = ["harness-test"];
/** 옛 이슈 픽스처(#1~#9)가 쓰던 프로젝트다. 그 본문을 읽는 시험은 그때의 목록으로 본다. */
const LEGACY = [
  { id: "sto", name: "점주 앱" },
  { id: "sv", name: "슈퍼바이저 앱" },
  { id: "web", name: "웹" },
];
const NOW = [{ id: "harness-test", name: "하네스 시험" }];
/** 지금 폼이 보내는 꼴. */
const now = (body) => ({ number: 50, title: "화면 요청: 화면", body, url: null });
/** 실제 #9 본문에서 프로젝트 줄만 바꾼다. 나머지 칸은 실제 모양 그대로 둔다. */
const parseIssueLegacy = (issue) => parseIssue(issue, { projects: LEGACY });
const nineWith = (projectLine) => {
  const issue = fixture(9);
  return { ...issue, body: issue.body.replace("[프로젝트: web,sto,sv]", projectLine) };
};

test("허용 프로젝트는 screens.ts 의 SANDBOX_PROJECTS 에서 읽는다", () => {
  assert.deepEqual(loadSandboxProjectIds(), ALLOWED, "screens.ts 의 프로젝트가 바뀌었다. Slack 폼의 프로젝트 목록도 함께 고쳐야 한다");
});

test("SANDBOX_PROJECTS 를 찾지 못하면 조용히 넘어가지 않고 던진다", () => {
  assert.throws(() => parseSandboxProjectIds("export const OTHER = [];"), /SANDBOX_PROJECTS/);
  assert.throws(() => parseSandboxProjectIds("export const SANDBOX_PROJECTS = [] as const;"), /id·name 짝이 하나도 없다/);
});

test("#9: 대괄호 프로젝트, 콜론 뒤 공백 없음, 빈 값을 읽는다", () => {
  const out = parseIssueLegacy(fixture(9));
  assert.equal(out.number, 9);
  assert.equal(out.url, "https://github.com/bluekey-kr/Design-System-Harness/issues/9");
  assert.equal(out.screenName, "이커머스 구매 페이비", "제목에서 「화면 요청:」 을 떼야 한다");
  assert.deepEqual(out.fields.projects, ["web"], "여러 곳을 골라 와도 고른 한 곳만 남는다");
  assert.equal(out.fields.requester, "@유진식");
  assert.equal(out.fields.requirement, "자율 4-5페이지 정도의 시나리오", "콜론 뒤에 공백이 없어도 값을 읽어야 한다");
  assert.equal(out.fields.similar, "Nike , 무신사 , 크림");
  assert.equal(out.fields.onSubmit, "", "빈 칸은 빈 글자다");
  assert.deepEqual(out.unknownProjects, []);
});

test("#9: 프로젝트가 셋이면 만들지 않고 까닭을 적는다", () => {
  const out = parseIssueLegacy(fixture(9));
  assert.equal(out.generateArgs, null);
  assert.match(out.problems.join("\n"), /프로젝트가 3개\(web, sto, sv\)/);
});

test("#4: 프로젝트 칸이 없는 옛 양식 — 여러 줄 요구사항은 다음 라벨까지 읽는다", () => {
  const out = parseIssueLegacy(fixture(4));
  assert.equal(out.fields.requirement, "국내, 해외 주식이 보여지는 화면\n매수, 매도 화면 클릭시 나오는거", "요구사항의 둘째 줄을 잃으면 안 된다");
  assert.equal(out.fields.similar, "TOSS 증권");
  assert.equal(out.fields.onSubmit, "");
  assert.deepEqual(out.fields.projects, []);
  assert.equal(out.generateArgs, null);
  assert.match(out.problems.join("\n"), /프로젝트가 없다/);
  assert.deepEqual(out.notes, [], "옛 양식이어도 라벨이 모두 줄 처음에 있으면 적을 것이 없다");
});

test("#3: 앞 글에 붙은 「요청자:」 도 라벨로 읽고, 라벨 없는 앞 글은 버렸다고 적는다", () => {
  const out = parseIssueLegacy(fixture(3));
  assert.equal(out.fields.requester, "@유진식", "줄바꿈 없이 붙은 라벨을 놓치면 요청자가 빈다");
  assert.equal(out.fields.requirement, "국내, 해외 주식이 보여지는 화면\n매수, 매도 화면 클릭시 나오는거");
  assert.equal(out.fields.similar, "", "칸이 없으면 빈 글자다");
  assert.ok(out.notes.some((note) => note.includes("「요청자:」 가 줄 처음이 아니라")), "붙은 라벨을 읽었다는 것을 알려야 한다");
  assert.ok(out.notes.some((note) => note.includes("라벨 없이 앞에 놓인 글")), "버린 앞 글이 있다는 것을 알려야 한다");
  assert.equal(out.generateArgs, null);
});

test("#1·#2: 라벨이 하나도 없는 첫 양식은 요구사항을 짐작하지 않는다", () => {
  for (const n of [1, 2]) {
    const out = parseIssueLegacy(fixture(n));
    assert.equal(out.fields.requirement, "", `#${n} 본문 전체를 요구사항으로 삼으면 안 된다`);
    assert.equal(out.fields.requester, "");
    assert.equal(out.generateArgs, null);
    assert.match(out.problems.join("\n"), /「요구사항:」 칸이 없다/);
    assert.match(out.problems.join("\n"), /프로젝트가 없다/);
    assert.ok(out.notes.some((note) => note.includes("라벨 없이 앞에 놓인 글")));
  }
  assert.equal(parseIssueLegacy(fixture(1)).screenName, "주식 매매 화면 시스템");
  assert.equal(parseIssueLegacy(fixture(2)).screenName, "회원가입 페이지 홈페이지, 앱");
});

test("#6: 요구사항 칸이 없으면 프로젝트가 있어도 만들지 않는다", () => {
  const out = parseIssueLegacy(fixture(6));
  assert.deepEqual(out.fields.projects, ["web"]);
  assert.equal(out.fields.similar, "TOSS 증권");
  assert.equal(out.generateArgs, null);
  assert.match(out.problems.join("\n"), /「요구사항:」 칸이 없다/);
});

test("프로젝트 한 곳과 화면 유형이 있으면 generate-code 인수를 만든다", () => {
  const out = parseIssueLegacy(nineWith("[프로젝트: web]\n화면 유형: 웹"));
  assert.deepEqual(out.problems, []);
  assert.equal(out.generateArgs, "이커머스 구매 페이비. 자율 4-5페이지 정도의 시나리오 프로젝트: web 유형: web");
});

test("화면 유형이 없거나 모르는 값이면 만들지 않고 묻는다", () => {
  const none = parseIssue(now("프로젝트: 하네스 시험\n요구사항: 목록을 본다"), { projects: NOW });
  assert.match(none.problems.join("\n"), /「화면 유형:」 칸이 없다/);
  const wrong = parseIssue(now("프로젝트: 하네스 시험\n화면 유형: 워치\n요구사항: 목록을 본다"), { projects: NOW });
  assert.match(wrong.problems.join("\n"), /모르는 화면 유형: 「워치」/);
});

test("화면 유형은 한글과 영문을 함께 받는다", () => {
  const of = (value) => parseIssue(now(`프로젝트: harness-test\n화면 유형: ${value}\n요구사항: 목록을 본다`), { projects: NOW }).viewports[0];
  assert.deepEqual([of("웹"), of("태블릿"), of("테블릿"), of("모바일"), of("web"), of("Mobile")], ["web", "tablet", "tablet", "mobile", "web", "mobile"]);
});

test("프로젝트는 id 로도 이름으로도 고를 수 있다", () => {
  const of = (value) => parseIssue(now(`프로젝트: ${value}\n화면 유형: 웹\n요구사항: 목록을 본다`), { projects: NOW }).project;
  assert.deepEqual(of("harness-test"), { id: "harness-test", name: null, isNew: false });
  assert.deepEqual(of("하네스 시험"), { id: "harness-test", name: null, isNew: false }, "이름에 든 공백에서 잘리면 안 된다");
});

test("「새 프로젝트」 칸은 프로젝트를 하나 늘리고, 이미 있는 이름이면 그리로 넣는다", () => {
  const made = parseIssue(now("프로젝트: 새 프로젝트\n새 프로젝트: 블루키 리뉴얼 2기\n화면 유형: 웹\n요구사항: 지표를 본다"), { projects: NOW });
  assert.deepEqual(made.project, { id: "블루키-리뉴얼-2기", name: "블루키 리뉴얼 2기", isNew: true });
  assert.deepEqual(made.problems, []);
  assert.match(made.generateArgs, /프로젝트: 블루키-리뉴얼-2기 새 프로젝트 이름: 블루키 리뉴얼 2기 유형: web$/);
  assert.match(made.notes.join("\n"), /새 프로젝트 「블루키 리뉴얼 2기」/);

  const same = parseIssue(now("프로젝트: 새 프로젝트\n새 프로젝트: 하네스 시험\n화면 유형: 웹\n요구사항: 지표를 본다"), { projects: NOW });
  assert.equal(same.project.isNew, false, "이름이 같은 프로젝트가 둘로 갈라졌다");
  assert.match(same.notes.join("\n"), /이미 있는 프로젝트라 그리로 넣는다/);
});

test("대괄호 없는 「프로젝트: sto」 꼴도 받는다", () => {
  const out = parseIssueLegacy(nineWith("프로젝트: sto\n화면 유형: 웹"));
  assert.deepEqual(out.fields.projects, ["sto"]);
  assert.match(out.generateArgs, / 프로젝트: sto 유형: web$/);
});

test("여러 줄 요구사항은 인수에서 한 문단으로 편다", () => {
  const issue = { ...fixture(4), body: `프로젝트: sto\n화면 유형: 모바일\n${fixture(4).body}` };
  const out = parseIssueLegacy(issue);
  assert.equal(out.fields.requirement.includes("\n"), true, "fields 에는 원문 줄바꿈을 둔다");
  assert.equal(out.generateArgs, "주식 매매 화면 작성 앱 버전으로. 국내, 해외 주식이 보여지는 화면 매수, 매도 화면 클릭시 나오는거 프로젝트: sto 유형: mobile");
});

test("모르는 프로젝트 값은 unknownProjects 로 가고 만들지 않는다", () => {
  const out = parseIssueLegacy(nineWith("[프로젝트: web, admin]"));
  assert.deepEqual(out.fields.projects, ["web"]);
  assert.deepEqual(out.unknownProjects, ["admin"]);
  assert.equal(out.generateArgs, null, "모르는 값이 섞이면 무엇을 뜻했는지 짐작하지 않는다");
  assert.match(out.problems.join("\n"), /모르는 프로젝트 값: admin/);
});

test("옛 양식의 쉼표 목록은 그대로 나뉜다", () => {
  assert.deepEqual(splitProjects(" Web ,  sto,web sv"), ["web", "sto", "sv"]);
  assert.deepEqual(splitProjects(""), []);
});

test("CRLF 줄바꿈이어도 같게 읽는다", () => {
  const issue = fixture(9);
  const out = parseIssueLegacy({ ...issue, body: issue.body.replace(/\n/g, "\r\n") });
  assert.equal(out.fields.requirement, "자율 4-5페이지 정도의 시나리오");
  assert.equal(out.fields.similar, "Nike , 무신사 , 크림");
});

test("요구사항 문장 속의 라벨 말은 줄 처음의 진짜 라벨을 이기지 못한다", () => {
  const body = "프로젝트: web\n요청자: @기획자\n요구사항: 목록 위에 요청자: 이름 칸을 둔다\n둘째 줄\n비슷한 기존 화면: 없음\n제출하면 일어나는 일: 없음";
  const out = parseIssue({ number: 1, title: "화면 요청: 목록", body, url: null }, { projects: LEGACY });
  assert.equal(out.fields.requester, "@기획자");
  assert.equal(out.fields.requirement, "목록 위에 요청자: 이름 칸을 둔다\n둘째 줄");
  assert.equal(out.fields.onSubmit, "없음");
});

test("제목에 「화면 요청:」 이 없으면 화면 요청 이슈로 보지 않는다", () => {
  const out = parseIssueLegacy({ ...nineWith("[프로젝트: web]"), title: "CI 를 되살린다" });
  assert.equal(out.generateArgs, null);
  assert.match(out.problems.join("\n"), /「화면 요청:」로 시작하지 않는다/);
});

test("CLI: --body-file 과 --title 로 gh 없이 돈다", () => {
  // CLI 는 저장소의 screens.ts 를 그대로 읽는다. 폼의 프로젝트 목록과 그 파일이 어긋나면 여기서 드러난다.
  const dir = mkdtempSync(path.join(tmpdir(), "harness-issue-"));
  const bodyFile = path.join(dir, "body.md");
  writeFileSync(bodyFile, "요청자: @기획자\n프로젝트: 하네스 시험\n화면 유형: 태블릿\n요구사항: 정산 내역을 표로 본다");
  const out = execFileSync(process.execPath, [path.join(here, "issue.mjs"), "--body-file", bodyFile, "--title", "화면 요청: 정산 내역", "50"], {
    encoding: "utf8",
    // gh 를 찾지 못하게 해서 정말 gh 없이 도는지 본다.
    env: { ...process.env, PATH: "" },
  });
  const parsed = JSON.parse(out);
  assert.equal(parsed.number, 50);
  assert.equal(parsed.generateArgs, "정산 내역. 정산 내역을 표로 본다 프로젝트: harness-test 유형: tablet");
});

test("「수정 대상」이 있으면 승인된 화면을 제자리에서 고치는 요청이다", () => {
  // Slack 「화면 수정 요청」 폼. 프로젝트·앞 요구사항은 대상 요청에서 물려받으므로 여기서 묻지 않는다.
  const body = "요청자: @기획자\n수정 대상: #39\n화면 key: sto-notice-list\n요구사항: 필독 배지를 빼고 제목을 한 줄로 줄인다";
  const read = parseIssue({ number: 44, title: "화면 요청: 공지사항 목록 수정", body }, { projects: LEGACY });
  assert.equal(read.mode, "수정");
  assert.deepEqual(read.fix, { target: 39, screenKey: "sto-notice-list", instruction: "필독 배지를 빼고 제목을 한 줄로 줄인다" });
  assert.deepEqual(read.problems, [], "프로젝트가 없다고 막았다 — 수정 요청은 대상 화면의 프로젝트를 쓴다");
  assert.equal(read.generateArgs, null, "수정 요청의 인수는 대상 pull request 의 앞 인수에 붙여 만든다");
});

test("화면 key 를 적지 않은 수정 요청도 받는다 — 어느 화면인지는 처리하는 쪽이 찾는다", () => {
  const read = parseIssue({ number: 44, title: "화면 요청: 계정 설정 수정", body: "수정 대상: #37\n요구사항: 저장 버튼을 아래로 내린다" }, { projects: LEGACY });
  assert.deepEqual(read.fix, { target: 37, screenKey: null, instruction: "저장 버튼을 아래로 내린다" });
  assert.deepEqual(read.problems, []);
});

test("수정 대상이 번호가 아니거나 자기 자신이면 묻는다", () => {
  const bad = parseIssue({ number: 44, title: "화면 요청: 수정", body: "수정 대상: 저번에 만든 거\n요구사항: 고쳐 줘" }, { projects: LEGACY });
  assert.match(bad.problems.join(" "), /이슈 번호를 읽지 못했다/);
  const self = parseIssue({ number: 44, title: "화면 요청: 수정", body: "수정 대상: #44\n요구사항: 고쳐 줘" }, { projects: LEGACY });
  assert.match(self.problems.join(" "), /이 요청 자신이다/);
});

test("보통 요청은 그대로다 — mode 는 생성이고 fix 는 없다", () => {
  const read = parseIssue({ number: 45, title: "화면 요청: 공지사항 목록", body: "[프로젝트: sto]\n화면 유형: 모바일\n요청자: @기획자\n요구사항: 공지 목록을 보여 준다" }, { projects: LEGACY });
  assert.equal(read.mode, "생성");
  assert.equal(read.fix, null);
  assert.match(read.generateArgs, /^공지사항 목록\. 공지 목록을 보여 준다 프로젝트: sto 유형: mobile$/);
});

test("Slack 의 여러 선택 칸은 JSON 배열로 온다 — 벗겨서 읽는다", () => {
  assert.deepEqual(splitChoices('["모바일","태블릿"]'), ["모바일", "태블릿"]);
  assert.deepEqual(splitChoices("모바일"), ["모바일"]);
  assert.deepEqual(splitChoices('["하네스 시험"]'), ["하네스 시험"], "이름의 공백에서 잘렸다");
  assert.deepEqual(splitChoices(""), []);
});

test("화면 유형은 여러 개를 고를 수 있다 — 한 화면이 여러 폭으로 선다", () => {
  // #60: 기획자가 「모바일·태블릿」을 함께 골랐다. Slack 은 그것을 JSON 배열로, 한글은 이스케이프해 보낸다.
  const both = parseIssue(now('프로젝트: 하네스 시험\n화면 유형: ["\\uc6f9","\\ubaa8\\ubc14\\uc77c"]\n요구사항: 채팅 화면'), { projects: NOW });
  assert.deepEqual(both.viewports, ["web", "mobile"], "이스케이프된 한글을 풀지 못했다");
  assert.deepEqual(both.problems, []);
  assert.match(both.generateArgs, / 유형: web, mobile$/);
  const one = parseIssue(now('프로젝트: ["하네스 시험"]\n화면 유형: ["모바일"]\n요구사항: 채팅 화면'), { projects: NOW });
  assert.deepEqual(one.viewports, ["mobile"]);
  assert.equal(one.project.id, "harness-test", "배열로 온 프로젝트를 읽지 못했다");
  const mixed = parseIssue(now('프로젝트: 하네스 시험\n화면 유형: 웹, 워치\n요구사항: 채팅 화면'), { projects: NOW });
  assert.match(mixed.problems.join("\n"), /모르는 화면 유형: 「워치」/);
});
