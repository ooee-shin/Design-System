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
export const TITLE_PREFIX = "화면 요청:";
const TITLE_PREFIX_RE = /^화면\s*요청\s*[:：]\s*/;

/**
 * 본문의 라벨. 실제 이슈에서 본 이름만 둔다 — 폼 칸의 긴 설명문(「저장하거나 제출하면 …」)은 채널
 * 카드에만 나오고 이슈 본문에는 오지 않는다. 폼 칸 이름을 바꾸면 이 표도 함께 고친다.
 */
export const LABELS = [
  { key: "projects", label: "프로젝트" },
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

/**
 * `screens.ts` 원문에서 `SANDBOX_PROJECTS` 의 `id` 를 뽑는다. 손으로 목록을 따로 두면 폼·화면 목록과
 * 어긋나므로(ai-environment.md 「다섯 칸」: 한쪽을 고치면 다른 쪽도 고친다) 원본을 읽는다.
 * TypeScript 를 불러오지 않고 글자로 읽는 것은 CLI 가 tsx 없이 맨 node 로 돌게 하려는 것이다.
 */
export function parseSandboxProjectIds(source) {
  const block = source.match(/export const SANDBOX_PROJECTS\s*=\s*\[([\s\S]*?)\]\s*as const/);
  if (!block) throw new Error("screens.ts 에서 `export const SANDBOX_PROJECTS = [ … ] as const` 를 찾지 못했다. 모양이 바뀌었으면 issue.mjs 도 고친다");
  const ids = [...block[1].matchAll(/\bid:\s*["']([^"']+)["']/g)].map((m) => m[1]);
  if (!ids.length) throw new Error("SANDBOX_PROJECTS 에 id 가 하나도 없다");
  return ids;
}

let cachedProjectIds;
/** 저장소의 `apps/sandbox/src/screens.ts` 를 읽는다. 한 번 읽으면 기억해 둔다. */
export function loadSandboxProjectIds(file = SCREENS_TS) {
  if (file !== SCREENS_TS) return parseSandboxProjectIds(readFileSync(file, "utf8"));
  cachedProjectIds ??= parseSandboxProjectIds(readFileSync(SCREENS_TS, "utf8"));
  return cachedProjectIds;
}

/** 프로젝트 칸을 쉼표·공백으로 나눈다. 폼이 주는 값은 소문자 id 라 대소문자는 맞춰 준다. */
export function splitProjects(value) {
  const out = [];
  for (const part of value.split(/[\s,，、/]+/)) {
    const id = part.trim().toLowerCase();
    if (id && !out.includes(id)) out.push(id);
  }
  return out;
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
 * `generateArgs` 는 generate-code 의 인수 꼴 「<화면 이름>. <요구사항> 프로젝트: <id>」다. SKILL.md 의
 * 예시(「… 원본: apps/…」)처럼 대괄호 없이 끝에 붙인다 — 설명의 `[원본: …]` 대괄호는 「있으면」이라는
 * 표시다. 요구사항은 한 문단이라야 해서(폼 안내: 목록으로 끊지 말고 한 문단으로) 줄바꿈을 공백으로 편다.
 * `fields.requirement` 는 원문 줄바꿈을 그대로 둔다.
 *
 * `problems` 가 하나라도 있으면 `generateArgs` 는 null 이다. generate-code 는 판단이 서지 않으면 만들지
 * 않고 묻는다(SKILL.md 3단계 `project`, 「입력」의 빈 요구사항). 막지 않는 것은 `notes` 에 적는다.
 */
export function parseIssue({ number = null, title = "", body = "", url = null }, { allowedProjects } = {}) {
  const allowed = allowedProjects ?? loadSandboxProjectIds();
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

  const picked = splitProjects(values.projects ?? "");
  const projects = picked.filter((id) => allowed.includes(id));
  const unknownProjects = picked.filter((id) => !allowed.includes(id));
  if (unknownProjects.length) {
    problems.push(`모르는 프로젝트 값: ${unknownProjects.join(", ")} — apps/sandbox/src/screens.ts 의 SANDBOX_PROJECTS(${allowed.join(", ")})에 없다. 폼과 목록 가운데 한쪽만 고쳤을 수 있다`);
  }
  if (!projects.length) problems.push(`프로젝트가 없다 — ${allowed.join("·")} 가운데 하나를 요청자에게 묻는다`);
  if (projects.length > 1) {
    problems.push(`프로젝트가 ${projects.length}개(${projects.join(", ")})다 — 한 번에 화면 하나를 한 프로젝트에 만든다. 어느 것으로 만들지 요청자에게 묻는다`);
  }

  const paragraph = requirement.replace(/\s+/g, " ").trim();
  const generateArgs = problems.length ? null : `${screenName}. ${paragraph} 프로젝트: ${projects[0]}`;

  return {
    number,
    url,
    screenName,
    fields: {
      projects,
      requester: values.requester ?? "",
      requirement,
      similar: values.similar ?? "",
      onSubmit: values.onSubmit ?? "",
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
