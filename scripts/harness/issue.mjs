// 화면 요청 이슈의 본문을 칸별로 읽어 `/ooee-harness:generate-code` 에 넘길 인수를 만든다.
//
//   node scripts/harness/issue.mjs <번호>
//   node scripts/harness/issue.mjs --body-file <경로> --title <제목> [<번호>]
//
// 결과 JSON 을 stdout 에 낸다. 앞의 것은 `gh issue view` 로 읽고, 뒤의 것은 gh 없이 파일을 읽는다.
// `generateArgs` 가 null 이면 만들지 말고 `problems` 를 요청자에게 묻는다.
//
// 옮겨 적는 일을 모델에게 맡기지 않으려고 둔다. 폼이 바뀌어 온 이슈들(#1~#4·#6·#9)의 양식이
// 조금씩 달라서, 눈으로 읽으면 칸 하나를 빠뜨리거나 앞 줄에 붙은 라벨을 놓친다.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../..");
const SCREENS_TS = path.join(repoRoot, "apps/sandbox/src/screens.ts");

/** Slack 워크플로의 「문제 생성」 단계가 제목 앞에 붙이는 말. */
const TITLE_PREFIX = "화면 요청:";
const TITLE_PREFIX_RE = /^화면\s*요청\s*[:：]\s*/;

/**
 * 본문의 라벨. 실제 이슈에서 본 이름만 둔다 — 폼 칸의 긴 설명문(「저장하거나 제출하면 …」)은 채널
 * 카드에만 나오고 이슈 본문에는 오지 않는다. 폼 칸 이름을 바꾸면 이 표도 함께 고친다.
 */
const LABELS = [
  { key: "projects", label: "프로젝트" },
  { key: "viewport", label: "화면 유형" },
  { key: "newProject", label: "새 프로젝트" },
  { key: "fixTarget", label: "수정 대상" },
  { key: "screenKey", label: "화면 key" },
  { key: "requester", label: "요청자" },
  { key: "requirement", label: "요구사항" },
  { key: "similar", label: "비슷한 기존 화면" },
  { key: "onSubmit", label: "제출하면 일어나는 일" },
];

// `[프로젝트: web,sto,sv]` 처럼 대괄호로 감싼 꼴(#6·#9)과 `프로젝트: web` 꼴(ai-environment.md 의
// 양식)을 함께 받는다. 콜론 뒤 공백은 있을 수도 없을 수도 있다(#9 `요구사항:자율`).
const LABEL_RE = new RegExp(
  `(\\[[ \\t]*)?(${LABELS.map(({ label }) => label.replace(/ /g, "[ \\t]*")).join("|")})[ \\t]*[:：]`,
  "g",
);
const labelKey = (text) => LABELS.find(({ label }) => label === text.replace(/[ \t]+/g, " "))?.key;

/** 폼의 화면 유형 값 → `screens.ts` 의 `viewport`. 한글과 영문을 함께 받는다. */
const VIEWPORTS = { web: "web", 웹: "web", tablet: "tablet", 태블릿: "tablet", 테블릿: "tablet", mobile: "mobile", 모바일: "mobile" };

/** 폼의 프로젝트 목록 마지막 항목. 이름이 아니라 「목록에 없다」는 표식이다. */
const NEW_PROJECT = "새 프로젝트";

/** 프로젝트를 요청이 정하지 않았을 때 `generateArgs` 에 두는 자리. 처리하는 쪽이 정한 id 로 바꾼다. */
const UNDECIDED = "<정한다>";

/** 새 프로젝트 이름을 id 로 만든다. 한글 이름은 그대로 두고 공백만 붙임표로 바꾼다. */
export function projectId(name) {
  return name.trim().toLowerCase().replace(/[\s/·,]+/g, "-").replace(/[^0-9a-z가-힣-]/g, "").replace(/^-+|-+$/g, "");
}

/**
 * `screens.ts` 원문에서 `SANDBOX_PROJECTS` 의 `id` 를 뽑는다. 손으로 목록을 따로 두면 폼·화면 목록과
 * 어긋나므로(ai-environment.md 「다섯 칸」: 한쪽을 고치면 다른 쪽도 고친다) 원본을 읽는다.
 * TypeScript 를 불러오지 않고 글자로 읽는 것은 CLI 가 tsx 없이 맨 node 로 돌게 하려는 것이다.
 */
function parseSandboxProjects(source) {
  const block = source.match(/export const SANDBOX_PROJECTS\s*=\s*\[([\s\S]*?)\]\s*as const/);
  if (!block) throw new Error("screens.ts 에서 `export const SANDBOX_PROJECTS = [ … ] as const` 를 찾지 못했다. 모양이 바뀌었으면 issue.mjs 도 고친다");
  const rows = [...block[1].matchAll(/\bid:\s*["']([^"']+)["']\s*,\s*name:\s*["']([^"']+)["']/g)].map((m) => ({ id: m[1], name: m[2] }));
  if (!rows.length) throw new Error("SANDBOX_PROJECTS 에 id·name 짝이 하나도 없다");
  return rows;
}

let cachedProjects;
/** 저장소의 `apps/sandbox/src/screens.ts` 를 읽는다. 한 번 읽으면 기억해 둔다. */
export function loadSandboxProjects(file = SCREENS_TS) {
  if (file !== SCREENS_TS) return parseSandboxProjects(readFileSync(file, "utf8"));
  cachedProjects ??= parseSandboxProjects(readFileSync(SCREENS_TS, "utf8"));
  return cachedProjects;
}

/**
 * 폼이 보낸 프로젝트 값을 있는 프로젝트에 맞춰 본다. id 로도 이름으로도 받는다 — 목록이 무엇을 보내는지에
 * 기대지 않는다. 이름에 공백이 있으므로(「하네스 시험」) 쉼표로만 가른다.
 */
function matchProject(value, projects) {
  const parts = splitChoices(value);
  const matched = [];
  const unknown = [];
  for (const part of parts) {
    const hit = projects.find((row) => row.id === part.toLowerCase() || row.name === part || projectId(row.name) === projectId(part));
    if (hit) {
      if (!matched.includes(hit.id)) matched.push(hit.id);
    } else unknown.push(part);
  }
  return { matched, unknown };
}

/**
 * 폼이 여러 값을 보낼 때의 꼴을 푼다. Slack 의 여러 선택 칸은 `["모바일","태블릿"]` 처럼 JSON 배열로 오고
 * (#60), 옛 양식은 `web,sto,sv` 다. 대괄호·따옴표를 벗기고 쉼표로 가른다. 하나만 왔으면 그 하나다.
 */
export function splitChoices(value) {
  const text = String(value ?? "").trim();
  // Slack 은 여러 선택 값을 JSON 배열로 넣고 한글을 `\uc6f9` 처럼 이스케이프한다. JSON 으로 풀리면 그대로 쓴다.
  if (text.startsWith("[")) {
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) return parsed.map((part) => String(part).trim()).filter(Boolean);
    } catch {
      // 대괄호만 흉내 낸 글이면 아래로 내려가 글자로 가른다.
    }
  }
  return text
    .replace(/^\[|\]$/g, "")
    .split(/[,，、/]+/)
    .map((part) => part.trim().replace(/^["']|["']$/g, "").trim())
    .filter(Boolean);
}

const oneLine = (text, max = 60) => {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max)}…` : flat;
};

/**
 * 본문을 라벨로 자른다. 라벨은 줄 처음에 오는 것이 원칙이지만 #3 은 폼이 줄바꿈 없이 이어 붙여
 * `…나오는거요청자: @…` 가 되었다. 그래서 줄 처음의 것을 먼저 고르고, 그 라벨이 줄 처음에 한 번도
 * 없을 때만 줄 가운데의 첫 것을 라벨로 읽는다. 요구사항 문장 속에 우연히 라벨 말이 있어도 줄 처음의
 * 진짜 라벨이 있으면 그쪽이 이긴다.
 */
function sliceByLabels(body) {
  const hits = [...body.matchAll(LABEL_RE)].map((m) => {
    const lineHead = body.slice(body.lastIndexOf("\n", m.index - 1) + 1, m.index);
    return {
      key: labelKey(m[2]),
      label: m[2],
      index: m.index,
      end: m.index + m[0].length,
      bracket: Boolean(m[1]),
      lineStart: lineHead.trim() === "",
    };
  });
  const chosen = [];
  const notes = [];
  for (const { key, label } of LABELS) {
    const own = hits.filter((hit) => hit.key === key);
    const pick = own.find((hit) => hit.lineStart) ?? own[0];
    if (!pick) continue;
    if (!pick.lineStart) notes.push(`「${label}:」 가 줄 처음이 아니라 앞 글에 붙어 있다 — 폼이 줄바꿈 없이 이어 붙인 것으로 보고 라벨로 읽었다`);
    chosen.push(pick);
  }
  chosen.sort((a, b) => a.index - b.index);

  const values = {};
  chosen.forEach((hit, i) => {
    let value = body.slice(hit.end, chosen[i + 1]?.index ?? body.length);
    // 대괄호 꼴은 `]` 까지가 값이다. 닫는 괄호가 없으면 그 줄 끝까지 읽는다.
    if (hit.bracket) value = value.split(/[\]\n]/)[0];
    values[hit.key] = value.trim();
  });
  const preamble = body.slice(0, chosen[0]?.index ?? body.length).trim();
  return { values, notes, preamble };
}

/**
 * 이슈 하나를 읽는다. `allowedProjects` 를 주지 않으면 `screens.ts` 에서 읽는다.
 *
 * `generateArgs` 는 generate-code 의 인수 꼴 「<화면 이름>. <요구사항> 프로젝트: <id> 유형: <web, tablet, mobile>」다. SKILL.md 의
 * 예시(「… 원본: apps/…」)처럼 대괄호 없이 끝에 붙인다 — 설명의 `[원본: …]` 대괄호는 「있으면」이라는
 * 표시다. 요구사항은 한 문단이라야 해서(폼 안내: 목록으로 끊지 말고 한 문단으로) 줄바꿈을 공백으로 편다.
 * `fields.requirement` 는 원문 줄바꿈을 그대로 둔다.
 *
 * 본문에 「수정 대상: #<n>」이 있으면 **수정 요청**이다(`mode: "수정"`). 승인되어 `main` 에 들어간 화면을
 * 제자리에서 고치는 입구이고, Slack 의 「화면 수정 요청」 폼이 만든다. 이때 프로젝트·화면 key·앞 요구사항은
 * 대상 요청에서 물려받으므로 이 스크립트는 `fix` 만 내고 `generateArgs` 는 null 이다 — 고칠 화면의 key 와
 * 앞 인수는 대상 요청의 머지된 pull request 본문 「화면별 인수」에서 처리하는 쪽이 찾는다(`/make-screens` 1단계).
 *
 * `problems` 가 하나라도 있으면 `generateArgs` 는 null 이다. generate-code 는 판단이 서지 않으면 만들지
 * 않고 묻는다(SKILL.md 3단계 `project`, 「입력」의 빈 요구사항). 막지 않는 것은 `notes` 에 적는다.
 */
export function parseIssue({ number = null, title = "", body = "", url = null }, { allowedProjects, projects: knownProjects } = {}) {
  const known = knownProjects ?? (allowedProjects ? allowedProjects.map((id) => ({ id, name: id })) : loadSandboxProjects());
  const allowed = known.map((row) => row.id);
  const text = String(body ?? "").replace(/\r\n?/g, "\n");
  const problems = [];

  const rawTitle = String(title ?? "").trim();
  const hasPrefix = TITLE_PREFIX_RE.test(rawTitle);
  const screenName = rawTitle.replace(TITLE_PREFIX_RE, "").trim();
  if (!hasPrefix) problems.push(`제목이 「${TITLE_PREFIX}」로 시작하지 않는다 — 폼이 만든 화면 요청 이슈가 아닐 수 있다`);
  if (!screenName) problems.push("화면 이름이 비었다");

  const { values, notes, preamble } = sliceByLabels(text);
  if (preamble) notes.push(`라벨 없이 앞에 놓인 글이 있다(옛 양식): 「${oneLine(preamble)}」 — 어느 칸인지 짐작하지 않고 버렸다`);
  if (!("requester" in values)) notes.push("본문에 「요청자:」 칸이 없다");

  const requirement = values.requirement ?? "";
  if (!("requirement" in values)) problems.push("본문에 「요구사항:」 칸이 없다 — generate-code 는 요구사항이 없으면 무엇을 만들지 묻고 멈춘다");
  else if (!requirement) problems.push("요구사항이 비었다 — generate-code 는 요구사항이 없으면 무엇을 만들지 묻고 멈춘다");

  // 수정 요청은 고칠 화면이 이미 있다. 프로젝트는 그 화면의 것을 그대로 쓴다.
  const fixTargetRaw = (values.fixTarget ?? "").trim();
  const mode = fixTargetRaw ? "수정" : "생성";
  const fixTarget = Number(fixTargetRaw.match(/#?\s*(\d+)/)?.[1] ?? NaN);
  // 칸에 라벨까지 함께 붙여 넣는 일이 있다(`2026-09-24` #101: 「key: ai-work-assistant」). 뜻이 하나뿐이니
  // 막지 않고 떼어 낸다 — 사람에게 폼을 다시 내라고 하는 값이 아니다.
  const screenKey = (values.screenKey ?? "").trim().replace(/^(?:화면\s*)?key\s*[:：]\s*/i, "").trim() || null;
  if (mode === "수정") {
    if (!Number.isInteger(fixTarget)) problems.push(`「수정 대상:」 에서 이슈 번호를 읽지 못했다: 「${oneLine(fixTargetRaw)}」 — 「#39」처럼 적는다`);
    else if (number !== null && fixTarget === number) problems.push("수정 대상이 이 요청 자신이다 — 고칠 화면을 만든 요청의 번호를 적는다");
    if (screenKey && !/^[a-z0-9-]+$/.test(screenKey)) problems.push(`화면 key 가 소문자·숫자·붙임표가 아니다: 「${oneLine(screenKey)}」`);
  }

  const { matched, unknown: unknownRaw } = matchProject(values.projects ?? "", known);
  // 목록의 마지막 「새 프로젝트」는 프로젝트 이름이 아니라 「목록에 없다」는 표식이다.
  const wantsNew = unknownRaw.some((part) => part === NEW_PROJECT);
  const unknownProjects = unknownRaw.filter((part) => part !== NEW_PROJECT);
  const newProjectName = (values.newProject ?? "").trim();
  // 폼은 있는 프로젝트를 목록에서 고르거나 「새 프로젝트」 칸에 이름을 적게 한다. 적은 이름이 이미 있는
  // 프로젝트면 새로 만들지 않고 그리로 간다 — 오타 하나로 프로젝트가 둘로 갈라지는 것을 막는다.
  const namedMatch = newProjectName ? matchProject(newProjectName, known).matched[0] : null;
  const chosen = namedMatch ?? (newProjectName ? projectId(newProjectName) : null) ?? matched[0] ?? null;
  const isNewProject = Boolean(chosen) && !allowed.includes(chosen);
  // 프로젝트를 요청이 정하지 않았으면(칸이 비었거나 「새 프로젝트」만 골랐으면) 처리하는 쪽이 요구사항을 보고
  // 있는 프로젝트에 넣거나 새로 만든다(2026-09-23 개발자, `/make-screens` 1단계). 묻지 않는다.
  const undecided = mode === "생성" && !chosen && !unknownProjects.length && matched.length === 0;

  if (mode === "생성") {
    if (undecided) notes.push(`프로젝트를 요청이 정하지 않았다${wantsNew ? "(「새 프로젝트」만 골랐다)" : ""} — 요구사항을 보고 있는 프로젝트(${known.map((row) => row.name).join("·")})에 넣거나 새로 만든다. 정한 것은 결과 댓글에 남긴다`);
    if (!newProjectName && unknownProjects.length) {
      problems.push(`모르는 프로젝트 값: ${unknownProjects.join(", ")} — apps/sandbox/src/screens.ts 의 SANDBOX_PROJECTS(${allowed.join(", ")})에 없다. 새 프로젝트면 「새 프로젝트:」 칸에 이름을 적는다`);
    }
    if (!newProjectName && matched.length > 1) {
      problems.push(`프로젝트가 ${matched.length}개(${matched.join(", ")})다 — 한 번에 화면 하나를 한 프로젝트에 만든다. 어느 것으로 만들지 요청자에게 묻는다`);
    }
    if (isNewProject && chosen) notes.push(`새 프로젝트 「${newProjectName}」(id \`${chosen}\`) 다 — 화면을 만들 때 SANDBOX_PROJECTS 에 한 줄이 는다`);
    if (namedMatch) notes.push(`「새 프로젝트: ${newProjectName}」 가 이미 있는 프로젝트라 그리로 넣는다(id \`${namedMatch}\`)`);
  }

  // 유형은 폭이다. 프로젝트와 섞지 않는다 — 한 프로젝트에 웹 화면과 모바일 화면이 함께 있다.
  // 한 화면이 여러 폭으로 설 수 있다(2026-09-23 개발자) — 폼에서 고른 만큼 받는다.
  const viewportRaw = (values.viewport ?? "").trim();
  const viewportChoices = splitChoices(viewportRaw);
  const viewports = [...new Set(viewportChoices.map((part) => VIEWPORTS[part.toLowerCase()]).filter(Boolean))];
  const unknownViewports = viewportChoices.filter((part) => !VIEWPORTS[part.toLowerCase()]);
  if (mode === "생성") {
    if (!viewportRaw) problems.push("본문에 「화면 유형:」 칸이 없다 — 웹·태블릿·모바일 가운데 무엇인지 요청자에게 묻는다");
    else if (unknownViewports.length) problems.push(`모르는 화면 유형: 「${unknownViewports.join(", ")}」 — 웹·태블릿·모바일 가운데서 고른다`);
  }

  const paragraph = requirement.replace(/\s+/g, " ").trim();
  const generateArgs =
    problems.length || mode === "수정"
      ? null
      : `${screenName}. ${paragraph} 프로젝트: ${chosen ?? UNDECIDED}${isNewProject ? ` 새 프로젝트 이름: ${newProjectName}` : ""} 유형: ${viewports.join(", ")}`;

  return {
    number,
    url,
    screenName,
    mode,
    fix: mode === "수정" ? { target: Number.isInteger(fixTarget) ? fixTarget : null, screenKey, instruction: problems.length ? null : paragraph } : null,
    project: chosen ? { id: chosen, name: newProjectName || null, isNew: isNewProject, undecided: false } : undecided ? { id: null, name: null, isNew: null, undecided: true } : null,
    viewports,
    fields: {
      projects: chosen ? [chosen] : [],
      requester: values.requester ?? "",
      requirement,
      similar: values.similar ?? "",
      onSubmit: values.onSubmit ?? "",
      fixTarget: fixTargetRaw,
      screenKey: screenKey ?? "",
    },
    unknownProjects,
    problems,
    notes,
    generateArgs,
  };
}

// ── CLI ──────────────────────────────────────────────────────────────────────

const USAGE = "사용: node scripts/harness/issue.mjs <번호>\n      node scripts/harness/issue.mjs --body-file <경로> --title <제목> [<번호>]";

/** `--이름 값` 짝과 나머지 자리 인수를 가른다. */
function parseArgs(argv) {
  const options = {};
  const positional = [];
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i].startsWith("--")) {
      options[argv[i].slice(2)] = argv[i + 1];
      i += 1;
    } else positional.push(argv[i]);
  }
  return { options, positional };
}

function main(argv) {
  const { options, positional } = parseArgs(argv);
  const opt = (name) => options[name];
  const number = positional[0] === undefined ? null : Number(positional[0]);
  if (number !== null && !(Number.isInteger(number) && number > 0)) {
    console.error(`이슈 번호가 아니다: ${positional[0]}\n${USAGE}`);
    process.exit(2);
  }

  const bodyFile = opt("body-file");
  let issue;
  if (bodyFile) {
    const title = opt("title");
    if (!title) {
      console.error(`--body-file 에는 --title 이 함께 있어야 한다\n${USAGE}`);
      process.exit(2);
    }
    issue = { number, title, body: readFileSync(bodyFile, "utf8"), url: null };
  } else {
    if (number === null) {
      console.error(USAGE);
      process.exit(2);
    }
    // 읽기만 한다. 이슈를 고치는 gh 명령은 공용 권한이 막고, 이 스크립트도 부르지 않는다.
    const out = execFileSync("gh", ["issue", "view", String(number), "--json", "number,title,body,url"], {
      cwd: repoRoot,
      encoding: "utf8",
    });
    issue = JSON.parse(out);
  }
  console.log(JSON.stringify(parseIssue(issue), null, 2));
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    console.error(error.stderr?.toString().trim() || error.message);
    process.exit(1);
  }
}
