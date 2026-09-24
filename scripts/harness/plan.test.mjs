// 모델이 쓴 한 장을 스크립트가 어떻게 읽고 무엇으로 바꾸는지를 값으로 고정한다. gh·git 은 부르지 않는다.
import assert from "node:assert/strict";
import test from "node:test";

import { renderResultComment } from "./result-comment.mjs";
import { branchName, planPath, prBody, readScreens, reconcileScreens, removeScreens, resultInput, sandboxUrl, section, title, validatePlan } from "./plan.mjs";

const screen = (over = {}) => ({
  key: "invoice-dashboard",
  name: "자동 송장 대시보드",
  project: "자동-송장-api",
  viewports: ["web"],
  args: "자동 송장 대시보드. 연동 상태와 최근 송장을 본다 프로젝트: 자동-송장-api 유형: web",
  ...over,
});
const read = { screenName: "자동 송장 api 대시보드", fields: { requester: "@유진식" } };

test("모델이 쓴 한 장은 요청마다 한 자리에 둔다", () => {
  assert.equal(planPath(85), ".harness-work/issue-85/plan.json");
});

test("제대로 쓴 한 장은 문제가 없다", () => {
  assert.deepEqual(validatePlan({ issue: 85, screens: [screen()] }, { issue: 85 }), []);
});

test("빠지거나 틀린 것을 한 번에 모두 돌려준다 — 한 번에 고치게 한다", () => {
  const problems = validatePlan(
    { issue: 84, screens: [screen({ key: "Bad_Key", name: "", viewports: ["watch"], args: "" })] },
    { issue: 85 },
  );
  assert.match(problems.join("\n"), /plan.issue 가 이 요청이 아니다: 84/);
  assert.match(problems.join("\n"), /key 는 소문자·숫자·붙임표여야 한다/);
  assert.match(problems.join("\n"), /name 이 없다/);
  assert.match(problems.join("\n"), /모르는 폭: watch/);
  assert.match(problems.join("\n"), /args 가 없다/);
});

test("화면이 없으면 올릴 것이 없다고 막는다", () => {
  assert.match(validatePlan({ issue: 85, screens: [] }, { issue: 85 }).join("\n"), /screens 가 비었다/);
  assert.match(validatePlan(null, { issue: 85 }).join("\n"), /객체가 아니다/);
});

test("같은 key 를 두 번 적으면 막는다 — 한 화면을 두 줄로 세면 표와 개수가 어긋난다", () => {
  const problems = validatePlan({ issue: 85, screens: [screen(), screen()] }, { issue: 85 });
  assert.match(problems.join("\n"), /key 가 겹친다: invoice-dashboard/);
});

test("remade 는 true/false 만 받는다 — 문자열 'false' 는 다시 만든 것으로 세어 버린다", () => {
  assert.match(validatePlan({ issue: 85, screens: [screen({ remade: "false" })] }, { issue: 85 }).join("\n"), /remade 는 true\/false 여야 한다/);
  assert.deepEqual(validatePlan({ issue: 85, screens: [screen({ remade: false })] }, { issue: 85 }), []);
});

test("plan.json 의 화면은 screens.ts 등록값으로 맞춘다 — 등록이 원본이고, 없는 key 만 돌려준다", () => {
  const registered = [
    { key: "invoice-dashboard", name: "송장 대시보드", project: "invoice-api", viewports: ["web", "mobile"] },
    { key: "invoice-logs", name: "API 호출 이력", project: "invoice-api", viewports: ["web"] },
  ];
  const screens = [screen(), screen({ key: "invoice-logs", name: "API 호출 이력", project: "invoice-api" }), screen({ key: "gone" })];
  const { missing, overwritten } = reconcileScreens(screens, registered);
  assert.deepEqual(missing, ["gone"]);
  assert.equal(overwritten.length, 1, "등록과 같은 화면은 건드리지 않는다");
  assert.match(overwritten[0], /`invoice-dashboard` 를 screens.ts 등록값으로 덮어썼다: 이름 「자동 송장 대시보드」 → 「송장 대시보드」 · 프로젝트 자동-송장-api → invoice-api · 폭 web → web·mobile/);
  assert.deepEqual(screens[0], { ...screen(), name: "송장 대시보드", project: "invoice-api", viewports: ["web", "mobile"] });
  assert.equal(screens[1].name, "API 호출 이력");
});

test("수정 요청은 화면 하나다", () => {
  const two = { issue: 75, screens: [screen(), screen({ key: "other" })] };
  assert.match(validatePlan(two, { issue: 75, mode: "수정" }).join("\n"), /수정 요청인데 화면이 둘 이상이다/);
  assert.deepEqual(validatePlan({ issue: 75, screens: [screen()] }, { issue: 75, mode: "수정" }), []);
});

test("가지와 제목은 회차를 담는다 — 앞 회차 가지와 겹치지 않는다", () => {
  assert.equal(branchName(85, 1, [screen()]), "feature/issue-85-invoice-dashboard");
  assert.equal(branchName(85, 2, [screen()]), "feature/issue-85-invoice-dashboard-r2");
  assert.equal(title(85, 1, [screen()], "생성"), "feat(sandbox): 자동 송장 대시보드 추가 (#85)");
  assert.equal(title(85, 2, [screen()], "생성"), "feat(sandbox): 자동 송장 대시보드 다시 만듦 (#85)");
  assert.equal(title(75, 1, [screen()], "수정"), "feat(sandbox): 자동 송장 대시보드 수정 (#75)");
  assert.match(title(9, 1, [screen(), screen({ key: "b" })], "생성"), /화면 2장 추가/);
});

test("pull request 본문은 다음 실행이 읽는 표식을 갖는다", () => {
  const body = prBody({ issue: 85, round: 1, screens: [screen()], needsDecision: ["예시 값은 지어냈다"], other: ["모바일 표를 카드로 바꿨다"] });
  assert.match(body, /^요청: #85\n/, "「이미 처리한 요청」 검색이 이 줄을 찾는다");
  assert.match(body, /## 화면별 인수\n\n- `invoice-dashboard`: 자동 송장 대시보드\./, "개선·수정 회차가 앞 인수를 여기서 읽는다");
  assert.match(body, /\| 자동 송장 대시보드 \| `invoice-dashboard` \| 자동-송장-api \| web \|/);
  assert.match(body, /## 판단이 필요한 것\n\n- 예시 값은 지어냈다/);
  assert.match(body, /## 그 밖에 한 일\n\n- 모바일 표를 카드로 바꿨다/);
});

test("결과 댓글 입력은 스크립트가 한 자리에서 만든다 — 주소와 이름이 어긋날 수 없다", () => {
  const input = resultInput({
    issue: 85,
    read,
    round: 1,
    screens: [screen(), screen({ key: "invoice-logs", name: "API 호출 이력" })],
    plan: { componentsUsed: ["Badge", "Button"], needsDecision: ["예시 값은 지어냈다"], other: [] },
    pr: { number: 87, url: "https://github.com/bluekey-kr/Design-System-Harness/pull/87" },
    deploy: { ok: true },
  });
  assert.equal(input.issue.requester, "@유진식");
  assert.deepEqual(input.issue.projects, ["자동-송장-api"], "같은 프로젝트를 두 번 세지 않는다");
  assert.deepEqual(input.summary.pagesAdded, ["자동 송장 대시보드", "API 호출 이력"]);
  assert.equal(input.screens[1].sandboxUrl, "https://ooee-sandbox.pages.dev/invoice-logs");
  assert.ok(input.checks.some((check) => check.name === "배포 주소 2장 200" && check.passed));
  assert.ok(input.checks.some((check) => check.name === "sandbox 화면 검사 2장"));
  // 이 입력이 실제로 결과 댓글이 되는지까지 본다. 여기서 막히면 기획자는 카드를 받지 못한다.
  const comment = renderResultComment(input);
  assert.match(comment, /^화면 요청 #85 결과 · 1회차 — 자동 송장 api 대시보드/);
  assert.match(comment, /\[\/invoice-logs\]\(https:\/\/ooee-sandbox\.pages\.dev\/invoice-logs\)/);
});

test("배포를 확인하지 못했으면 그 줄이 통과가 아니다", () => {
  const input = resultInput({ issue: 85, read, round: 1, screens: [screen()], deploy: { ok: false, reason: "404" } });
  assert.equal(input.checks.find((check) => check.name.startsWith("배포 주소")).passed, false);
});

test("샌드박스 주소는 key 로만 만든다", () => {
  assert.equal(sandboxUrl("shop-cart"), "https://ooee-sandbox.pages.dev/shop-cart");
});

test("screens.ts 에서 등록된 이름과 프로젝트를 읽는다 — 결과 댓글이 원본을 쓴다", () => {
  const text = `export const sandboxScreens: SandboxScreen[] = [
  {
    key: "admin-login",
    project: "harness-test",
    viewports: ["web", "mobile"],
    name: "관리자 로그인",
  },
  {
    key: "voc",
    project: "harness-test",
    viewports: ["web"],
    name: "VOC",
  },
];`;
  assert.deepEqual(readScreens(text), [
    { key: "admin-login", name: "관리자 로그인", project: "harness-test", viewports: ["web", "mobile"] },
    { key: "voc", name: "VOC", project: "harness-test", viewports: ["web"] },
  ]);
});

test("pull request 본문의 한 절을 고치지 않고 옮긴다", () => {
  const body = "요청: #9\n\n## 판단이 필요한 것\n\n- 예시 값은 지어냈다\n- 링크 목적지는 미정\n\n## 그 밖\n\n- 다른 것\n";
  assert.deepEqual(section(body, "판단이 필요한 것"), ["예시 값은 지어냈다", "링크 목적지는 미정"]);
  assert.deepEqual(section(body, "없는 절"), []);
});

test("개선 회차는 다시 만든 화면만 「추가한 페이지」에 넣는다", () => {
  const kept = { ...screen({ key: "kept", name: "그대로 둔 화면" }), remade: false };
  const input = resultInput({ issue: 60, read, round: 2, screens: [screen(), kept], plan: {} });
  assert.deepEqual(input.summary.pagesAdded, ["자동 송장 대시보드"], "그대로 둔 화면을 다시 만들었다고 적으면 안 된다");
  assert.equal(input.screens.length, 2, "표에는 이 요청의 화면이 모두 있어야 한다");
});

test("반려는 그 요청의 화면 등록만 지운다 — 다른 요청의 줄은 건드리지 않는다", () => {
  // 2026-09-24 #62: `git revert` 로 걷어내려니 그 뒤에 다른 요청이 screens.ts 에 더한 줄과 부딪혔다.
  const text = `export const sandboxScreens: SandboxScreen[] = [
  {
    key: "keep-me",
    project: "p",
    viewports: ["web"],
    name: "남는 화면",
  },
  {
    key: "drop-me",
    project: "p",
    viewports: ["web"],
    name: "걷어낼 화면",
  },
  {
    key: "keep-me-too",
    project: "p",
    viewports: ["web"],
    name: "이것도 남는다",
  },
];`;
  const out = removeScreens(text, ["drop-me"]);
  assert.deepEqual(out.removed, ["drop-me"]);
  assert.deepEqual(readScreens(out.text).map((screen) => screen.key), ["keep-me", "keep-me-too"]);
  assert.ok(!out.text.includes("drop-me"));
  assert.deepEqual(removeScreens(text, ["없는-key"]).removed, [], "없는 key 는 지웠다고 하지 않는다");
});
