// 결정(승인·반려·개선)을 스크립트가 처리할 때 쓰는 순수 함수들.
//
// **왜 스크립트로 옮기는가.** `plan.mjs` 머리말과 같은 까닭이다 — 모델에게 파이프라인을 운전시키면
// 어긋날 자리가 절차서의 줄 수만큼 생긴다. 결정 쪽을 들여다보니 **D2(승인)와 D3(반려)에는 판단이 없다.**
//
// - D2 는 「`main..dev` 에 든 pull request 가 모두 승인된 것인가」를 본다. 각 pull request 의 본문에서
//   `요청: #<m>` 이나 `되돌림: #<m>` 을 읽고 그 요청의 결정을 보면 끝이다. 글자 대조다.
// - D3 은 이 요청이 더한 화면 key 를 pull request 의 파일 목록에서 읽어 그 폴더와 `screens.ts` 등록을 지운다
//   (plan.mjs `removeScreens`). 목록이다.
// - **D4(개선)만 판단이 있다** — 사유가 앞 회차의 어느 항목을 가리키는지, 개선인지 새 요구인지. 그것만
//   모델에게 남기고 나머지는 여기서 한다.
//
// 여기 있는 것은 gh·git 을 부르지 않는다. 부르는 쪽이 값을 읽어 넘기고, 이 파일은 그 값만 본다.

/** pull request 본문에서 이 줄을 찾는다. 뒤에 숫자가 이어지면 다른 요청이다(#8 과 #85). */
const mark = (kind, issue) => new RegExp(`(?:^|\\n)\\s*${kind}:\\s*#${issue}(?!\\d)`);

/** 본문이 가리키는 요청 번호. 화면을 올린 것이면 `요청`, 되돌린 것이면 `되돌림` 이다. */
export function readMark(body) {
  const request = String(body ?? "").match(/(?:^|\n)\s*요청:\s*#(\d+)(?!\d)/);
  if (request) return { kind: "요청", issue: Number(request[1]) };
  const revert = String(body ?? "").match(/(?:^|\n)\s*되돌림:\s*#(\d+)(?!\d)/);
  if (revert) return { kind: "되돌림", issue: Number(revert[1]) };
  return null;
}

/** 그 pull request 가 이 요청의 화면을 올린 것인지. */
export const isRequestOf = (body, issue) => mark("요청", issue).test(String(body ?? ""));

/** 그 pull request 가 이 요청을 되돌린 것인지. */
export const isRevertOf = (body, issue) => mark("되돌림", issue).test(String(body ?? ""));

/** 등록된 화면 자리를 바꿨는지. 누구 것인지 모르는 화면이 승인 없이 `main` 으로 가는 것을 막는다. */
export function touchesScreens(files, registeredKeys) {
  const keys = new Set(registeredKeys);
  return files.some((file) => {
    const key = String(file).match(/^apps\/sandbox\/src\/app\/([^/()]+)\//)?.[1];
    return Boolean(key) && keys.has(key);
  });
}

/**
 * `main..dev` 에 든 pull request 를 가른다. **하나라도 섞였으면 승인을 `main` 으로 올리지 않는다.**
 *
 * `main` 은 승인된 요청만 담는다. 남의 요청이 대기·개선·반려인 채로 같은 머지에 실려 가면, 기획자가
 * 보지도 않은 화면이 승인된 것처럼 `main` 에 남는다.
 *
 * @param prs `{ number, url, body, files }` 목록 — `main..dev` 의 squash commit 이 가리키는 pull request
 * @param decisionOf 요청 번호를 주면 그 결정(`승인`·`반려`·`대기`·`개선`·`결과 없음`)을 돌려주는 함수
 * @param registeredKeys `screens.ts` 에 등록된 화면 key
 */
export function sortLanded(prs, decisionOf, registeredKeys = []) {
  const mine = [];
  const reverted = new Set();
  const mixed = [];
  for (const pr of prs) {
    const found = readMark(pr.body);
    if (found?.kind === "되돌림") {
      reverted.add(found.issue);
      mine.push({ ...pr, kind: "되돌림", issue: found.issue });
      continue;
    }
    if (found?.kind === "요청") {
      const decision = decisionOf(found.issue);
      mine.push({ ...pr, kind: "요청", issue: found.issue, decision });
      if (decision !== "승인") mixed.push({ ...pr, issue: found.issue, decision });
      continue;
    }
    // 표식이 없는 pull request. 화면 자리를 바꿨으면 어느 요청의 것인지 알 수 없어 막고, 그 밖(하네스·문서)은 지나간다.
    if (touchesScreens(pr.files ?? [], registeredKeys)) mixed.push({ ...pr, issue: null, decision: "알 수 없음" });
    else mine.push({ ...pr, kind: "그 밖" });
  }
  // 반려는 되돌림이 같은 목록에 있으면 빠진 것으로 친다.
  const left = mixed.filter((item) => !(item.decision === "반려" && reverted.has(item.issue)));
  return { landed: mine, mixed: left };
}

/** 섞인 것을 어떻게 푸는지 한 줄씩. 카드와 기록에 그대로 실린다. */
export function howToUnmix(mixed) {
  const how = {
    "결과 없음": "`결과 <n>` 명령으로 결과 댓글을 올린 뒤 기획자가 결정한다",
    대기: "기획자의 결정을 기다린다",
    개선: "개선 회차가 끝나고 결정이 날 때까지 기다린다",
    반려: "`결정 <n>` 이 되돌린다",
    "알 수 없음": "그 pull request 의 작성자가 본문에 `요청: #<n>` 을 적거나 되돌린다",
  };
  return mixed.map((item) => `#${item.issue ?? "?"} (${item.decision}) ${item.url} — ${how[item.decision] ?? "사람이 본다"}`);
}

/**
 * 이 요청의 화면 commit. `git log --format="%H %s"` 의 줄을 받아 **제목에** `(#<n>)` 이 있는 것만 고른다.
 *
 * `git log --grep` 은 제목과 본문을 함께 뒤진다. pull request 본문이 다른 이슈를 언급하면(하네스 PR 이
 * 「…막힌다(#62)」처럼 적는다) 그 commit 까지 화면 commit 으로 잡혀 엉뚱한 것을 되돌리게 된다 —
 * `2026-09-24` 에 #62 의 되돌리기가 하네스 commit 을 함께 되돌리려다 부딪혔다. 제목만 본다.
 */
export function screenCommits(lines, issue) {
  const mark = `(#${issue})`;
  return lines
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => [line.slice(0, line.indexOf(" ")), line.slice(line.indexOf(" ") + 1)])
    .filter(([sha, subject]) => /^[0-9a-f]{7,40}$/.test(sha) && subject.includes(mark))
    .map(([sha]) => sha);
}

/**
 * 아직 쓰이지 않은 가지 이름. 앞 실행이 실패하며 남긴 가지를 덮어쓰지 않으려는 것이다.
 *
 * `2026-09-24` 에 #62 의 되돌리기가 검사 실패 뒤에도 push 까지 나가 `feature/issue-62-revert` 를 남겼다.
 * 같은 이름으로 다시 push 하면 거절되거나(non-fast-forward) 남의 기록을 덮는다. 뒤에 숫자를 붙여 비킨다.
 */
export function freeBranch(base, taken) {
  const used = new Set(taken);
  if (!used.has(base)) return base;
  for (let i = 2; i < 100; i += 1) if (!used.has(`${base}-${i}`)) return `${base}-${i}`;
  throw new Error(`빈 가지 이름을 찾지 못했다: ${base}`);
}

/** `dev → main` pull request 의 제목과 본문. 첫 줄의 `승인: #<n>` 을 러너가 다시 확인한다. */
export function mainPr({ issue, read, screenName, landed }) {
  const title = `dev → main: 화면 요청 #${issue} 승인 — ${screenName}`;
  const lines = [
    `승인: #${issue} ${read.round}회차 — ${read.by} · ${read.at} · ${read.source === "reaction" ? "반응" : "댓글"}`,
    "",
    `결과 댓글: ${read.resultCommentUrl ?? "없음"}`,
    "",
    "## 이 머지에 든 것",
    "",
  ];
  for (const item of landed) {
    if (item.kind === "요청") lines.push(`- #${item.number} 요청 #${item.issue} (${item.decision}) — ${item.url}`);
    else if (item.kind === "되돌림") lines.push(`- #${item.number} 요청 #${item.issue} 되돌림 — ${item.url}`);
    else lines.push(`- #${item.number} 화면 밖 변경 — ${item.url}`);
  }
  lines.push(
    "",
    "## 확인",
    "",
    "- 이 머지에 든 화면 pull request 는 모두 승인되었거나 되돌려졌다(`decide.mjs` 의 `sortLanded`).",
    "- `Quality` 를 본 뒤 합친다. 합쳐지면 러너가 이 요청을 닫는다.",
  );
  return { title, body: `${lines.join("\n")}\n` };
}

/** 되돌림 pull request 의 제목과 본문. 첫 줄의 `되돌림: #<n>` 을 D2 가 읽는다. */
export function revertPr({ issue, read, screenName, commits = [], alsoOnMain = false, keys = [] }) {
  const title = `revert(sandbox): 화면 요청 #${issue} 반려 — ${screenName}`;
  const body = [
    `되돌림: #${issue}`,
    "",
    `반려: ${read.by} · ${read.at}`,
    `결과 댓글: ${read.resultCommentUrl ?? "없음"}`,
    "",
    "## 사유",
    "",
    read.reason ? `> ${read.reason}` : "> (사유가 적히지 않았다)",
    ...(read.reasonSource && read.reasonSource !== "prefix" ? ["", `사유는 짐작이다(${read.reasonSource}). 원문: ${read.reasonCommentUrl ?? "없음"}`] : []),
    "",
    "## 걷어낸 화면",
    "",
    ...keys.map((key) => `- \`apps/sandbox/src/app/${key}/\` 와 \`screens.ts\` 의 등록`),
    ...(commits.length ? ["", `만든 commit: ${commits.map((sha) => `\`${sha.slice(0, 7)}\``).join(", ")}`] : []),
    "",
    ...(alsoOnMain
      ? ["", "## main 에도 있다", "", "이 화면은 `main` 에도 올라가 있다(개발자가 승인 전에 dev → main 을 올렸다). 이 되돌림은 `dev` 에만 들어가고, 다음 `dev → main` 최신화에 함께 올라간다."]
      : []),
    "",
    "다시 만들려면 폼으로 새 요청을 낸다.",
  ].join("\n");
  return { title, body: `${body}\n` };
}

/** 개선을 시작해도 되는지. 판단이 필요한 자리 앞에서 막는 것들이다. */
export function improveBlocked(read, { maxRound = 3 } = {}) {
  if (!read.reason) return "사유가 없다 — 무엇을 고칠지 모르므로 짐작하지 않는다. 카드 스레드에 까닭을 한 줄 적어 주세요";
  if (read.reasonSource !== "prefix") {
    return `사유를 짐작했다(${read.reasonSource}) — 그 글이 개선 사유인지 알 수 없다. 카드의 😕 개선을 다시 누르고 스레드에 까닭을 적어 주세요`;
  }
  if (read.round > maxRound) return `개선은 ${maxRound}번까지다(지금 ${read.round}회차) — 요청을 고쳐 폼으로 새로 내 주세요`;
  return null;
}
