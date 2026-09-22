// 화면 요청을 처리한 결과를 이슈 댓글 한 장(markdown)으로 만든다. 댓글을 다는 것은 이 스크립트가 아니다.
//
//   node scripts/harness/result-comment.mjs <input.json>
//
// 입력 모양은 `renderResultComment` 의 설명과 fixtures/result-input.example.json 에 있다. stdout 의 글을
// `gh issue comment <번호> --body-file -` 로 다는 것은 처리하는 세션이 한다.
//
// 결과 채널(#디자인시스템-화면-요청-결과물)은 GitHub for Slack 앱으로 이 저장소의 댓글을 받아 카드로
// 띄운다. 카드는 댓글 앞부분만 보여 주므로, 기획자가 Slack 만 보고도 「어느 요청의 결과이고 어디서
// 보는가」를 알 수 있게 첫 네 줄에 요청 · 샌드박스 · 작업 요약을 몰아 둔다. 결과는 샌드박스에서 본다 —
// 2026-09-23 에 요청 처리에서 Figma 를 뺐다.
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

/**
 * 결과 댓글의 표식. decision.mjs 가 이것으로 결과 댓글을 찾는다.
 *
 * **댓글 맨 끝에 둔다.** GitHub 은 HTML 주석을 그리지 않지만 Slack 카드는 원문 글자를 옮기므로, 앞에
 * 두면 카드에 `<!-- … -->` 가 그대로 드러난다. 카드는 앞부분만 보여 주니 맨 끝에 있으면 보이지 않는다.
 * 맨 끝이라는 자리는 판독 조건이기도 하다 — 누가 결과 댓글을 인용해 다른 댓글에 옮겨도 그 댓글의
 * 끝은 표식이 아니므로 결과 댓글로 잘못 잡히지 않는다(decision.mjs `readMarker`).
 */
export const resultMarker = (issue, round) => `<!-- harness:result issue=${issue} round=${round} -->`;
export const RESULT_MARKER_RE = /^<!-- harness:result issue=(\d+) round=(\d+) -->$/;

// 「이 댓글」이 Slack 에서는 카드를 가리키게 읽혀, 카드에 이모지를 달고 결정했다고 여기게 된다. 판독은
// GitHub 의 반응만 읽으므로 자리를 못 박는다. 머리 첫 줄에도 짧은 꼴(`HEAD_DECISION_HINT`)을 둔다 —
// 이 안내가 있는 「결정」 절은 카드가 자르는 자리 아래다.
export const DECISION_GUIDE = "GitHub 의 이 댓글에 👍 승인 · 👎 반려 · 😕 개선 — 반려·개선은 사유를 댓글로. Slack 카드에 단 이모지는 읽히지 않습니다";
export const HEAD_DECISION_HINT = "결정은 GitHub 댓글에 👍 👎 😕";

const fail = (message) => {
  throw new Error(`결과 댓글을 만들지 않는다: ${message}`);
};
const isText = (value) => typeof value === "string" && value.trim() !== "";
const isPositiveInt = (value) => Number.isInteger(value) && value > 0;
/**
 * 한 줄로 편다. 머리 다섯 줄에 드는 값에 줄바꿈이 섞이면 그 뒤가 다음 줄로 밀려, 카드가 보여 주는 다섯 줄
 * 밖으로 작업 요약이나 PR 표시가 빠진다. 목록(`- …`) 항목도 줄바꿈이 있으면 항목이 갈라진다.
 */
const oneLine = (text) => String(text).replace(/\s+/g, " ").trim();
const textList = (value, name) => {
  if (!Array.isArray(value) || !value.every(isText)) fail(`${name} 는 글자 배열이어야 한다`);
  return value.map(oneLine);
};
/**
 * https 주소를 확인하고 `URL` 을 돌려준다. 찍는 것은 원문이 아니라 `url.href` 다. URL 파서는 탭·줄바꿈을
 * 지우고 통과시키므로, 원문을 찍으면 검사를 통과한 줄바꿈이 머리 줄을 둘로 가른다. 가운데에 공백이 든
 * 주소는 받지 않는다 — 날 글자 링크가 공백에서 끊겨 엉뚱한 주소가 열린다. 앞뒤 공백은 떼고 받는다.
 */
const httpsUrl = (value, name) => {
  if (!isText(value)) fail(`${name} 가 비었다`);
  const raw = value.trim();
  if (/[\s\u0000-\u001f\u007f-\u009f]/.test(raw)) fail(`${name} 에 공백이나 제어 문자가 들어 있다: ${JSON.stringify(value)}`);
  let url;
  try {
    url = new URL(raw);
  } catch {
    fail(`${name} 가 주소가 아니다: ${value}`);
  }
  if (url.protocol !== "https:") fail(`${name} 는 https 주소여야 한다: ${value}`);
  return url;
};
/** 표 칸에 들어갈 글자. 줄바꿈과 `|` 가 표를 깨뜨린다. */
const cell = (text) => oneLine(text).replace(/\|/g, "\\|");

/**
 * 입력을 확인한다. **빠진 것이 있으면 던진다.** 빈 링크로 채널에 올라가면 기획자는 볼 것이 없는데
 * 승인 요청만 받는다. 멈추고 처리하는 쪽이 채우는 편이 낫다.
 */
function validate(input) {
  if (!input || typeof input !== "object") fail("입력이 없다");
  const { issue, round, screens, pullRequest, summary, needsDecision, checks } = input;

  if (!issue || !isPositiveInt(issue.number)) fail("issue.number 가 없다");
  if (!isText(issue.screenName)) fail("issue.screenName 이 없다");
  if (!isText(issue.requester)) fail("issue.requester 가 없다 — 카드에서 누구의 요청인지 보여야 한다");
  const projects = textList(issue.projects ?? fail("issue.projects 가 없다"), "issue.projects");
  if (!isPositiveInt(round)) fail("round 는 1 이상의 정수여야 한다");

  if (!Array.isArray(screens) || !screens.length) fail("screens 가 비었다 — 볼 화면이 없으면 승인을 묻지 않는다");
  const shown = screens.map((screen, i) => {
    const where = `screens[${i}]`;
    if (!screen || !isText(screen.key) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(screen.key)) fail(`${where}.key 는 소문자 kebab-case 여야 한다`);
    if (!isText(screen.name)) fail(`${where}.name 이 없다`);
    if (!isText(screen.project)) fail(`${where}.project 가 없다`);
    const sandbox = httpsUrl(screen.sandboxUrl, `${where}.sandboxUrl`);
    // 배포 주소는 `<배포 주소>/<key>` 다(ai-environment.md 「처리와 승인」). 다른 화면의 주소를 옮겨
    // 붙이는 실수는 눈으로 잘 안 보이는데 기획자는 엉뚱한 화면을 보고 판단하게 된다.
    const tail = sandbox.pathname.replace(/\/$/, "").replace(/\.html$/, "");
    if (!tail.endsWith(`/${screen.key}`)) fail(`${where}.sandboxUrl 이 key 「${screen.key}」 의 주소가 아니다: ${screen.sandboxUrl}`);
    return {
      key: screen.key,
      name: oneLine(screen.name),
      project: oneLine(screen.project),
      sandboxUrl: sandbox.href,
      origin: sandbox.origin,
    };
  });

  let pr = null;
  if (pullRequest !== undefined && pullRequest !== null) {
    if (!isPositiveInt(pullRequest.number)) fail("pullRequest.number 가 없다");
    pr = { number: pullRequest.number, url: httpsUrl(pullRequest.url, "pullRequest.url").href };
  }

  if (!summary || typeof summary !== "object") fail("summary 가 없다");
  const work = {
    pagesAdded: textList(summary.pagesAdded, "summary.pagesAdded"),
    componentsAdded: textList(summary.componentsAdded, "summary.componentsAdded"),
    componentsUsed: textList(summary.componentsUsed, "summary.componentsUsed"),
    other: textList(summary.other, "summary.other"),
  };
  if (!work.pagesAdded.length && !work.componentsAdded.length && !work.other.length) {
    fail("작업한 것이 비었다 — summary 의 pagesAdded·componentsAdded·other 가운데 하나는 있어야 한다");
  }
  // 머리의 샌드박스 링크는 이번 회차에 만든 화면을 가리킨다(`renderResultComment`). 이름으로 잇기 때문에
  // 이름이 어긋나면 조용히 첫 화면으로 떨어진다. 개선 회차 카드가 바뀌지 않은 화면을 여는 그 실수다.
  const names = new Set(shown.map((screen) => screen.name));
  const stray = work.pagesAdded.filter((name) => !names.has(name));
  if (stray.length) fail(`summary.pagesAdded 의 「${stray.join("」「")}」 가 screens 의 name 에 없다 — 이번 회차에 만든 화면을 screens[].name 그대로 적는다`);

  const decisions = textList(needsDecision, "needsDecision");

  if (!Array.isArray(checks) || !checks.length) fail("checks 가 비었다 — 무엇을 확인했는지 없이 승인을 묻지 않는다");
  const checked = checks.map((check, i) => {
    if (!check || !isText(check.name) || typeof check.passed !== "boolean") fail(`checks[${i}] 는 { name, passed } 여야 한다`);
    return { name: oneLine(check.name), passed: check.passed };
  });
  const failed = checked.filter((check) => !check.passed);
  // 검사나 배포가 실패한 것은 반려가 아니라 처리 중 실패다(ai-environment.md 「처리와 승인」). 승인을
  // 묻는 이 댓글로 올리지 않는다.
  if (failed.length) fail(`검사가 실패했다(${failed.map((check) => check.name).join(", ")}) — 처리 중 실패는 승인을 묻지 않는다`);

  return { issue: { number: issue.number, screenName: oneLine(issue.screenName), requester: oneLine(issue.requester), projects }, round, screens: shown, pr, work, decisions, checked };
}

const unique = (items) => [...new Set(items)];

/**
 * 작업 줄에 이름을 몇 개까지 적는가. 카드는 앞부분만 보여 주므로 줄이 길면 PR 표시가 잘린다. 나머지는
 * 「외 N장」으로 줄이고 전부는 아래 「작업한 것」에 둔다.
 */
const NAMES_IN_HEAD = 3;
const OTHER_IN_HEAD = 40;
const nameList = (names, unit) =>
  names.length > NAMES_IN_HEAD ? `${names.slice(0, NAMES_IN_HEAD).join("·")} 외 ${names.length - NAMES_IN_HEAD}${unit}` : names.join("·");
const clip = (text, max) => (text.length > max ? `${text.slice(0, max)}…` : text);

/**
 * 작업 요약 한 줄. 예: 「페이지 5장 추가(web) — 상품 목록·상품 상세·장바구니 외 2장 · 새 컴포넌트 없음 · PR #17」.
 * 장 수만 적으면 기획자는 카드에서 무엇을 만들었는지 모른다. 개선 회차(2회차부터)는 요청에 없던 화면을
 * 더하지 않으므로(process-issue D4) 「다시 만듦」으로 적는다.
 */
function workLine({ added, work, round, pr }) {
  const parts = [];
  if (work.pagesAdded.length) {
    parts.push(`페이지 ${work.pagesAdded.length}장 ${round > 1 ? "다시 만듦" : "추가"}(${unique(added.map((s) => s.project)).join(", ")}) — ${nameList(work.pagesAdded, "장")}`);
  }
  if (work.other.length) parts.push(clip(work.other[0], OTHER_IN_HEAD) + (work.other.length > 1 ? ` 외 ${work.other.length - 1}건` : ""));
  parts.push(work.componentsAdded.length ? `컴포넌트 추가 ${nameList(work.componentsAdded, "개")}` : "새 컴포넌트 없음");
  if (pr) parts.push(`PR #${pr.number}`);
  return parts.join(" · ");
}

/**
 * 샌드박스 줄. 이번 회차에 만든 첫 화면을 건다. 개선 회차의 `screens` 에는 앞 회차에서 그대로 둔 화면도
 * 들어 있어(process-issue D4), 첫 칸을 걸면 카드가 바뀌지 않은 화면을 연다.
 */
function sandboxLine({ screens, added, round }) {
  const link = added[0] ?? screens[0];
  const remade = round > 1 && added.length > 0;
  const count = screens.length > 1 ? (remade ? ` · 전체 ${screens.length}장` : ` 외 ${screens.length - 1}장`) : "";
  return `샌드박스: ${link.sandboxUrl}${remade ? " (다시 만듦)" : ""}${count} · 목록 ${link.origin}/`;
}

/**
 * 결과 댓글 markdown 을 만든다.
 *
 * input: {
 *   issue: { number, screenName, requester, projects[] },
 *   round,                                   // 1부터. 개선 뒤 다시 올리면 2, 3 …
 *   screens: [{ key, name, project, sandboxUrl }],
 *   pullRequest?: { number, url },
 *   summary: {
 *     pagesAdded[],                          // 이번 회차에 만든 화면. screens[].name 과 같은 글자
 *     componentsAdded[], componentsUsed[], other[],
 *   },
 *   needsDecision[],                         // 판단이 필요한 것
 *   checks: [{ name, passed }],
 * }
 *
 * 첫 네 줄은 markdown 문법 없이 쓴다. Slack 카드와 GitHub 이 같은 글자로 읽히게 하려는 것이다.
 * 주소는 날 글자로 두면 양쪽이 모두 링크로 잡는다. 표와 제목은 그 아래, 카드가 자르는 자리부터 쓴다.
 * 머리에 드는 값은 모두 한 줄로 펴서, 입력이 어떻든 머리는 정확히 네 줄이다.
 */
export function renderResultComment(input) {
  const { issue, round, screens, pr, work, decisions, checked } = validate(input);
  const addedNames = new Set(work.pagesAdded);
  const added = screens.filter((screen) => addedNames.has(screen.name));

  const head = [
    `화면 요청 #${issue.number} 결과 · ${round}회차 — ${issue.screenName} · ${HEAD_DECISION_HINT}`,
    `요청: ${issue.requester} · 프로젝트 ${issue.projects.length ? issue.projects.join(", ") : "없음"}`,
    sandboxLine({ screens, added, round }),
    `작업: ${workLine({ added, work, round, pr })}`,
  ];

  const table = [
    "| 화면 | 프로젝트 | 샌드박스 |",
    "| --- | --- | --- |",
    ...screens.map((screen) => {
      const remade = round > 1 && addedNames.has(screen.name) ? " (다시 만듦)" : "";
      return `| ${cell(screen.name)}${remade} | ${cell(screen.project)} | [/${screen.key}](${screen.sandboxUrl}) |`;
    }),
  ];

  const none = (items) => (items.length ? items.join(", ") : "없음");
  const done = [
    `- 페이지 ${round > 1 ? "다시 만듦" : "추가"}: ${work.pagesAdded.length ? `${work.pagesAdded.length}장 — ${work.pagesAdded.join(", ")}` : "없음"}`,
    `- 새 컴포넌트: ${none(work.componentsAdded)}`,
    `- 쓴 컴포넌트: ${none(work.componentsUsed)}`,
    ...work.other.map((item) => `- ${item}`),
    ...(pr ? [`- Pull request: [#${pr.number}](${pr.url})`] : []),
  ];

  return [
    ...head,
    "",
    "### 화면",
    "",
    ...table,
    "",
    "### 작업한 것",
    "",
    ...done,
    "",
    "### 판단이 필요한 것",
    "",
    ...(decisions.length ? decisions.map((item) => `- ${item}`) : ["- 없음"]),
    "",
    "### 검사",
    "",
    ...checked.map((check) => `- [x] ${check.name}`),
    "",
    "### 결정",
    "",
    DECISION_GUIDE,
    // 판독(decision.mjs)은 「승인합니다」「반려합니다. …」를 결정으로 읽지 않는다. 「…으로 시작하는 댓글」이라고
    // 쓰면 바로 그런 글을 쓰게 되므로 받는 꼴을 그대로 적는다.
    "「승인」 한 낱말, 또는 「반려: 사유」 · 「개선: 고칠 것」처럼 콜론을 붙인 댓글도 결정으로 칩니다. 승인은 요청한 화면이 요청대로 나왔는지까지이고, 제품에 넣을지는 따로 정합니다.",
    "",
    resultMarker(issue.number, round),
    "",
  ].join("\n");
}

// ── CLI ──────────────────────────────────────────────────────────────────────

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  const file = process.argv[2];
  if (!file) {
    console.error("사용: node scripts/harness/result-comment.mjs <input.json>");
    process.exit(2);
  }
  try {
    process.stdout.write(renderResultComment(JSON.parse(readFileSync(file, "utf8"))));
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
