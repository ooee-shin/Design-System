// 모델이 화면을 만든 뒤 남기는 한 장(`plan.json`)을 읽어, 스크립트가 쓸 것들로 바꾼다.
//
// **왜 이 파일이 생겼는가.** `2026-09-23`~`24` 에 요청 처리가 아홉 번 무너졌는데 화면 생성은 한 번도
// 실패하지 않았다. 무너진 것은 언제나 그 주변이었다 — 배포를 기다리다 턴을 끝내기, 하위 명령의 보고를
// 전체의 끝으로 여기기, 머지 응답 타임아웃, 앞 실행이 남긴 파일. 모두 **모델에게 아홉 단계짜리
// 파이프라인을 운전시킨 데서** 나왔다. 절차서가 392줄이면 어긋날 자리도 392곳이다.
//
// 그래서 역할을 뒤집는다(`2026-09-24` 개발자: 「역할 뒤집기 시작해」).
//
// - **모델이 하는 일은 하나다** — 요청을 화면 몇 장으로 나누고, 그 화면을 만들고, 무엇을 만들었는지
//   이 파일 꼴로 적는다. 그게 끝이다.
// - **나머지는 전부 스크립트다** — 가지, commit, push, pull request, Quality 기다리기, 머지, 배포 확인,
//   결과 댓글, 이슈 닫기. 기다리는 일과 되풀이되는 일은 원래 스크립트의 몫이다.
//
// 여기 있는 것은 모두 순수 함수다. gh·git·파일을 부르지 않으므로 시험이 값만 보고 고정한다.

/** 모델이 쓸 파일. 한 요청에 한 장이다. */
export const planPath = (issue) => `.harness-work/issue-${issue}/plan.json`;

const isText = (value) => typeof value === "string" && value.trim() !== "";
const KEY = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const VIEWPORTS = new Set(["web", "tablet", "mobile"]);

/**
 * 모델이 쓴 것을 믿지 않고 확인한다. 틀린 곳을 **모두** 돌려준다 — 한 번에 고치게 하려는 것이다.
 *
 * 빠진 값으로 결과 댓글을 만들면 기획자는 볼 것이 없는데 승인만 묻게 된다. 그럴 바에 멈추는 편이 낫다
 * (`result-comment.mjs` 의 같은 판단).
 */
export function validatePlan(plan, { issue, mode = "생성" } = {}) {
  const problems = [];
  const add = (line) => problems.push(line);
  if (!plan || typeof plan !== "object") return ["plan.json 이 객체가 아니다"];

  if (plan.issue !== undefined && plan.issue !== issue) add(`plan.issue 가 이 요청이 아니다: ${plan.issue}`);
  if (!Array.isArray(plan.screens) || !plan.screens.length) add("screens 가 비었다 — 만든 화면이 없으면 올릴 것이 없다");

  const keys = new Set();
  for (const [i, screen] of (plan.screens ?? []).entries()) {
    const where = `screens[${i}]`;
    if (!screen || typeof screen !== "object") {
      add(`${where} 가 객체가 아니다`);
      continue;
    }
    if (!isText(screen.key) || !KEY.test(screen.key)) add(`${where}.key 는 소문자·숫자·붙임표여야 한다: ${screen.key}`);
    else if (keys.has(screen.key)) add(`${where}.key 가 겹친다: ${screen.key}`);
    else keys.add(screen.key);
    if (!isText(screen.name)) add(`${where}.name 이 없다`);
    if (!isText(screen.project)) add(`${where}.project 가 없다`);
    if (!Array.isArray(screen.viewports) || !screen.viewports.length) add(`${where}.viewports 가 비었다`);
    else for (const item of screen.viewports) if (!VIEWPORTS.has(item)) add(`${where}.viewports 에 모르는 폭: ${item}`);
    if (!isText(screen.args)) add(`${where}.args 가 없다 — pull request 본문이 무엇을 시켰는지 남겨야 다음 회차가 읽는다`);
  }

  // 수정 요청은 있는 화면을 제자리에서 고치므로 한 장이다. 여러 장이면 잘못 읽은 것이다.
  if (mode === "수정" && (plan.screens?.length ?? 0) > 1) add("수정 요청인데 화면이 둘 이상이다");

  for (const field of ["componentsAdded", "componentsUsed", "other", "needsDecision"]) {
    if (plan[field] !== undefined && !Array.isArray(plan[field])) add(`${field} 는 배열이어야 한다`);
  }
  return problems;
}

/** 이 회차가 쓸 가지 이름. 회차가 늘면 뒤에 `-r<회차>` 가 붙어 앞 회차 가지와 겹치지 않는다. */
export function branchName(issue, round, screens) {
  const first = screens?.[0]?.key ?? "screen";
  return `feature/issue-${issue}-${first}${round > 1 ? `-r${round}` : ""}`;
}

/** commit 과 pull request 의 제목. */
export function title(issue, round, screens, mode) {
  const what = screens.length === 1 ? screens[0].name : `화면 ${screens.length}장`;
  const verb = mode === "수정" ? "수정" : round > 1 ? "다시 만듦" : "추가";
  return `feat(sandbox): ${what} ${verb} (#${issue})`;
}

/**
 * pull request 본문. 첫 줄의 `요청: #<n>` 은 다음 처리가 「이미 처리한 요청」을 찾는 표식이고,
 * `## 화면별 인수` 는 개선 회차와 수정 요청이 앞에 무엇을 시켰는지 읽는 자리다. 둘 다 사람이 아니라
 * 다음 실행이 읽으므로 꼴을 지킨다.
 */
export function prBody({ issue, round, screens, needsDecision = [], other = [] }) {
  const lines = [`요청: #${issue}`, "", `${round}회차입니다.`, "", "## 화면", ""];
  lines.push("| 화면 | key | 프로젝트 | 폭 |", "| --- | --- | --- | --- |");
  for (const screen of screens) {
    lines.push(`| ${screen.name} | \`${screen.key}\` | ${screen.project} | ${screen.viewports.join(" · ")} |`);
  }
  lines.push("", "## 화면별 인수", "");
  for (const screen of screens) lines.push(`- \`${screen.key}\`: ${screen.args}`);
  if (other.length) lines.push("", "## 그 밖에 한 일", "", ...other.map((item) => `- ${item}`));
  if (needsDecision.length) lines.push("", "## 판단이 필요한 것", "", ...needsDecision.map((item) => `- ${item}`));
  return `${lines.join("\n")}\n`;
}

/** 화면 key 로 만드는 샌드박스 주소. 결과 댓글의 링크가 이것이다. */
export const sandboxUrl = (key, origin = "https://ooee-sandbox.pages.dev") => `${origin}/${key}`;

/**
 * 결과 댓글의 입력. 모델이 적은 것(무엇을 만들었고 무엇을 정했는지)과 스크립트가 아는 것(pull request
 * 번호, 배포 확인 결과)을 합친다.
 *
 * 모델은 이제 이 입력을 만들지 않는다. 그래서 「샌드박스 주소가 key 와 다르다」·「pagesAdded 이름이
 * screens 와 다르다」 같은 실수가 구조적으로 생기지 않는다 — 한 자리에서 같은 값으로 만든다.
 */
export function resultInput({ issue, read, round, screens, plan = {}, pr = null, deploy = null, origin }) {
  const names = screens.map((screen) => screen.name);
  const checks = [
    { name: "check-screens (화면 규칙)", passed: true },
    { name: "/review-design 위반 0건", passed: true },
    { name: `sandbox 화면 검사 ${screens.reduce((sum, screen) => sum + screen.viewports.length, 0)}장`, passed: true },
    ...(pr ? [{ name: "Quality", passed: true }] : []),
    ...(deploy ? [{ name: `배포 주소 ${screens.length}장 200`, passed: Boolean(deploy.ok) }] : []),
  ];
  return {
    issue: {
      number: issue,
      screenName: read.screenName,
      requester: read.fields.requester,
      projects: [...new Set(screens.map((screen) => screen.project))],
    },
    round,
    screens: screens.map((screen) => ({
      key: screen.key,
      name: screen.name,
      project: screen.project,
      sandboxUrl: sandboxUrl(screen.key, origin),
    })),
    ...(pr ? { pullRequest: { number: pr.number, url: pr.url } } : {}),
    summary: {
      pagesAdded: names,
      componentsAdded: plan.componentsAdded ?? [],
      componentsUsed: plan.componentsUsed ?? [],
      other: plan.other ?? [],
    },
    needsDecision: plan.needsDecision ?? [],
    checks,
  };
}
