# 화면 요청 이슈를 돌리는 도구

Slack 폼으로 들어온 화면 요청 이슈를 읽고, 처리한 결과를 이슈 댓글 한 장으로 만들고, 그 댓글에 사람이 내린 결정을 읽는 세 스크립트다. 흐름과 승인 범위는 `docs/process/ai-environment.md` 「처리와 승인」이 소유한다. 전달 시 `docs/process/`와 함께 제거한다.

`issue`·`result-comment`·`decision` 셋은 **읽기와 글 만들기만 한다.** 이슈에 글을 다는 것은 `post-result.mjs` 하나이고, 그것도 양식이 만든 결과 댓글 한 장만 단다. 반응·라벨·이슈 상태는 어느 스크립트도 바꾸지 않는다.

## 파일

| 파일 | 하는 일 |
| --- | --- |
| `issue.mjs` | 이슈 본문을 칸별로 읽어 `/ooee-harness:generate-code` 인수(`generateArgs`)를 만든다. 만들 수 없으면 `null`과 까닭(`problems`)을 낸다 |
| `result-comment.mjs` | 처리 결과를 결과 댓글 markdown 으로 만든다. 빠진 링크나 실패한 검사가 있으면 만들지 않고 던진다 |
| `decision.mjs` | 결과 댓글의 반응과 뒤따른 댓글에서 승인·반려·개선을 읽는다. `gh api` GET 만 쓴다 |
| `post-result.mjs` | 결과 댓글 한 장을 이슈에 단다. 에이전트가 이슈에 글을 다는 유일한 길이다 — 아래 「알아 둘 것」 |
| `fixtures/issue-*.json` | `gh issue view`로 한 번 받아 둔 실제 이슈 #1~#4·#6·#9. 폼이 바뀌어 온 양식이 다 들어 있다 |
| `fixtures/issue-9-comments.json` | 실제 #9 댓글(`--paginate --slurp` 모양). 아직 비어 있다 |
| `fixtures/result-input.example.json` | `result-comment.mjs` 입력의 예. #9 를 처리했다고 치고 지어낸 값이다(주소도 가짜다) |

## 돌리는 순서

이 차례를 처음부터 끝까지 도는 것은 `/process-issue`(`.claude/skills/process-issue/SKILL.md`)다. 손으로 돌릴 때도 같은 차례다.

```bash
node scripts/harness/issue.mjs 9                         # generateArgs 가 null 이면 problems 를 요청자에게 묻는다
# generate-code · design-page · pull request · dev 머지 · 배포
node scripts/harness/result-comment.mjs .harness-work/issue-9/result-1.json   # 올리기 전에 글만 본다
node scripts/harness/post-result.mjs 9 .harness-work/issue-9/result-1.json
node scripts/harness/decision.mjs 9 [--round 1]          # 결과 없음 · 대기 · 승인 · 반려 · 개선
```

입력과 댓글 파일은 `.harness-work/`에 둔다. 저장소에 넣지 않는 자리라, 남아 있어도 다음 처리의 「working tree 가 깨끗한가」를 막지 않는다.

- `issue.mjs --body-file <경로> --title <제목> [<번호>]`는 gh 없이 파일을 읽는다.
- 허용 프로젝트는 `apps/sandbox/src/screens.ts`의 `SANDBOX_PROJECTS`에서 읽는다. 폼의 프로젝트 칸과 그 목록 가운데 한쪽만 고치면 모르는 값이 되어 멈춘다.
- 결과 댓글의 첫 다섯 줄(제목과 결정 안내 · 요청 · 샌드박스 · Figma · 작업 요약)이 Slack 결과 채널의 카드에 보인다. 머리에 드는 값은 한 줄로 펴서 입력이 어떻든 다섯 줄이다. 작업 줄은 만든 페이지 이름을 앞의 셋까지 적는다. 개선 회차의 샌드박스 링크는 `summary.pagesAdded`에 이름이 있는 첫 화면이라, 그 이름은 `screens[].name`과 같아야 한다(다르면 만들지 않는다). 표식 `<!-- harness:result issue=<n> round=<r> -->`는 카드에 드러나지 않게 맨 끝에 둔다.
- 결정 신호는 결과 댓글의 👍·👎·😕 반응과 「승인」 한 낱말, 또는 「반려: …」·「개선: …」처럼 콜론을 붙인 댓글이다. 가장 늦은 것이 이긴다.
- 결정 낱말로 시작하지만 꼴이 맞지 않는 댓글(「승인합니다」「반려합니다. …」「개선 요청: …」)은 결정이 아니고 `lookalikes`에 주소·글과 함께 나온다. 그 가운데 이긴 신호보다 늦은 것이 있으면(신호가 없으면 하나라도 있으면) `lookalikeAfterDecision`이 `true`다. `/process-issue`는 그때 결정을 따르지 않고 묻는다.
- 반려·개선의 사유는 `reasonSource`와 함께 나온다. `prefix`는 「반려: …」 댓글 자신, `after`는 신호를 남긴 사람이 그 뒤에 쓴 첫 댓글, `before`는 신호 앞 10분(`REASON_BEFORE_MS`) 안의 마지막 댓글이다. `after`·`before`는 짐작이라 `reasonCommentUrl`로 원문을 가리키고 `note`에 적는다.

## 알아 둘 것

- 판독은 계정으로 거르지 않는다. 지금은 처리 계정과 요청자 계정이 같아서, 거르면 어떤 결정도 읽히지 않는다. 그래서 판독은 「에이전트가 반응이나 결정 댓글을 달지 않는다」에 기대고, 그것을 `.claude/settings.json`이 막는다. `gh api`는 통째로 `deny`(필드를 붙인 암묵 POST 까지), `gh issue comment`는 `ask`, 네 스크립트를 고치는 것도 `ask`다. 에이전트가 쓸 수 있는 글은 `post-result.mjs`가 양식으로 만든 결과 댓글뿐이고, 그 첫 줄은 「화면 요청 #<n> 결과」라 결정으로 읽히지 않는다. 규칙은 명령 문자열을 대조할 뿐이라 GitHub 의 보호가 아니다(AGENTS.md 「Claude Code 명령과 권한」).
- 세 스크립트는 gh 를 node 의 `execFileSync`로 부른다. Bash 권한 규칙은 `node scripts/harness/…` 명령만 보고 그 안의 gh 호출은 보지 않으므로, `gh api`를 Bash 에서 통째로 막아도 `decision.mjs`는 그대로 돈다. `decision.mjs`가 `--method GET`을 적어 두는 것은 필드를 붙여도 쓰기 요청이 되지 않게 하려는 것이고, 테스트가 가짜 gh 로 그것을 본다.
