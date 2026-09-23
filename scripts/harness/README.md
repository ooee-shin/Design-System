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
| `runner.mjs` | 이 Mac 의 러너가 부른다. `/process-issue … 러너`를 돌리고, 넘김 파일대로 pull request 를 만들어 Quality 를 본 뒤 합치고, 세션을 이어 받게 한다. 아래 「러너」 |
| `fixtures/issue-*.json` | `gh issue view`로 한 번 받아 둔 실제 이슈 #1~#4·#6·#9. 폼이 바뀌어 온 양식이 다 들어 있다 |
| `fixtures/issue-9-comments.json` | 실제 #9 댓글(`--paginate --slurp` 모양). 아직 비어 있다 |
| `fixtures/result-input.example.json` | `result-comment.mjs` 입력의 예. #9 를 처리했다고 치고 지어낸 값이다(주소도 가짜다) |

## 돌리는 순서

이 차례를 처음부터 끝까지 도는 것은 `/process-issue`(`.claude/skills/process-issue/SKILL.md`)다. 손으로 돌릴 때도 같은 차례다.

```bash
node scripts/harness/issue.mjs 9                         # generateArgs 가 null 이면 problems 를 요청자에게 묻는다
# generate-code · pull request · dev 머지 · 배포
node scripts/harness/result-comment.mjs .harness-work/issue-9/result-1.json   # 올리기 전에 글만 본다
node scripts/harness/post-result.mjs 9 .harness-work/issue-9/result-1.json
node scripts/harness/decision.mjs 9 [--round 1]          # 결과 없음 · 대기 · 승인 · 반려 · 개선
```

입력과 댓글 파일은 `.harness-work/`에 둔다. 저장소에 넣지 않는 자리라, 남아 있어도 다음 처리의 「working tree 가 깨끗한가」를 막지 않는다.

- `issue.mjs --body-file <경로> --title <제목> [<번호>]`는 gh 없이 파일을 읽는다.
- 허용 프로젝트는 `apps/sandbox/src/screens.ts`의 `SANDBOX_PROJECTS`에서 읽는다. 폼의 프로젝트 칸과 그 목록 가운데 한쪽만 고치면 모르는 값이 되어 멈춘다.
- 결과 댓글의 첫 네 줄(제목과 결정 안내 · 요청 · 샌드박스 · 작업 요약)이 Slack 결과 채널의 카드에 보인다. 머리에 드는 값은 한 줄로 펴서 입력이 어떻든 네 줄이다. 결과는 샌드박스에서만 본다(`2026-09-22` 에 Figma 를 뺐다). 작업 줄은 만든 페이지 이름을 앞의 셋까지 적는다. 개선 회차의 샌드박스 링크는 `summary.pagesAdded`에 이름이 있는 첫 화면이라, 그 이름은 `screens[].name`과 같아야 한다(다르면 만들지 않는다). 표식 `<!-- harness:result issue=<n> round=<r> -->`는 카드에 드러나지 않게 맨 끝에 둔다.
- 결정 신호는 결과 댓글의 👍·👎·😕 반응과 「승인」 한 낱말, 또는 「반려: …」·「개선: …」처럼 콜론을 붙인 댓글이다. 가장 늦은 것이 이긴다.
- 결정 낱말로 시작하지만 꼴이 맞지 않는 댓글(「승인합니다」「반려합니다. …」「개선 요청: …」)은 결정이 아니고 `lookalikes`에 주소·글과 함께 나온다. 그 가운데 이긴 신호보다 늦은 것이 있으면(신호가 없으면 하나라도 있으면) `lookalikeAfterDecision`이 `true`다. `/process-issue`는 그때 결정을 따르지 않고 묻는다.
- 반려·개선의 사유는 `reasonSource`와 함께 나온다. `prefix`는 「반려: …」 댓글 자신, `after`는 신호를 남긴 사람이 그 뒤에 쓴 첫 댓글, `before`는 신호 앞 10분(`REASON_BEFORE_MS`) 안의 마지막 댓글이다. `after`·`before`는 짐작이라 `reasonCommentUrl`로 원문을 가리키고 `note`에 적는다.

## 러너

`.github/workflows/harness.yml`이 이 Mac 의 self-hosted runner(라벨 `ooee-mac`)에서 `dev`를 받아 부른다. 흐름은 ai-environment.md 「처리와 승인」이, Claude 쪽 절차는 `/process-issue`의 「러너에서 돌 때」가 갖는다.

```bash
node scripts/harness/runner.mjs 처리 12      # 이슈가 열릴 때
node scripts/harness/runner.mjs 결정         # 10분마다 · 결정 댓글이 달릴 때(그 이슈만)
node scripts/harness/runner.mjs 결과 9       # 손으로 돌릴 때만
```

| 이벤트 | job | 하는 일 |
| --- | --- | --- |
| 제목이 「화면 요청」인 이슈가 열림 | 화면 요청 처리 | `처리 <n>` |
| 「화면 요청」 이슈에 댓글 | 결정 확인 | `결정 <n>` — 결정이 없으면 Claude 를 부르지 않고 끝난다 |
| 10분마다 | 결정 확인 | `결정` — 열린 「화면 요청」 이슈를 모두 판독한다. 👍 👎 😕 반응은 이벤트가 없어 여기서만 읽힌다 |
| Actions 에서 손으로(workflow_dispatch) | 모드에 따라 | `처리`·`결정`·`결과` |

- **수정 요청도 같은 길로 온다.** 본문에 `수정 대상: #<n>` 이 있으면 `issue.mjs` 가 `mode: "수정"` 으로 읽고, 처리하는 쪽이 그 요청의 화면을 제자리에서 고친다(ai-environment.md 「두 번째 폼」).
- **Claude 는 push 까지, 합치기는 스크립트가.** `claude -p "/process-issue <인수> 러너"`는 pull request 를 만들 자리에서 `.harness-work/issue-<n>/handoff.json`을 쓰고 멈춘다. 스크립트는 그 파일을 다시 검사하고(이 요청의 `feature/issue-<n>-` 가지인지, 본문이 이 요청의 작업 자리 안에 있고 첫 줄이 `요청:`·`되돌림:`·`승인: #<n>`인지) `gh pr create --base <dev|main>` → 그 head commit 의 Quality 실행을 기다려 `gh run watch` → `dev`는 squash, `main`은 머지 commit 으로 합친다. `resume`이 `true`면 같은 세션을 `-r`로 이어 받아 7·8단계를 맡긴다. `dev`로 합칠 pull request 는 생성 화면의 자리(`apps/sandbox/src/app/<key>/` 바로 아래와 `apps/sandbox/src/screens.ts`)만 바꿔야 한다. 그 밖을 건드렸으면 합치지 않고 열어 둔 채 멈춘다 — 모델이 하네스 스크립트나 workflow 를 함께 올리면 러너가 스스로 합치고 다음 실행에서 그 코드로 돌기 때문이다.
- **모델은 `claude-sonnet-5`·`high`로 박는다.** 명령 머리말과 같은 값이다. 이어 받는 차례는 명령 밖이라 CLI 인수로도 준다. 실행 기록에 쓴 모델이 찍힌다.
- **러너가 스스로 더 여는 것은 `git revert`뿐이다**(D3). **`/process-issue` 와 하위 명령(generate-code · review-design)의 머리말 allowed-tools 는 러너가 읽어 `--allowedTools`로 넘긴다** — 바깥 명령 안에서 Skill 로 불린 명령의 머리말은 적용되지 않아 #29 에서 하위 명령이 적어 둔 명령이 거부됐고, 이어 받는 차례(7·8단계)는 `/process-issue` 밖이라 그 머리말도 적용되지 않는다. 원본은 여전히 각 SKILL.md 이고, 넘기는 목록에 gh 쓰기 명령이 섞이면 시험이 실패한다. 파일 쓰기는 `--permission-mode acceptEdits`로 받고, Plugin 은 `--plugin-dir plugins/ooee-harness`로 싣는다. MCP 서버는 싣지 않는다.
- **gh·git 은 이 Mac 의 로그인이다.** checkout 은 `persist-credentials: false`로 받아 GITHUB_TOKEN 을 남기지 않는다. GITHUB_TOKEN 으로 만든 pull request 와 머지는 다른 workflow 를 깨우지 않아 Quality 와 Deploy 가 돌지 않는다.
- **같은 결정은 한 번만 처리한다.** 처리하기 **전에** `~/.ooee-harness/decisions.json`에 `<이슈>:<회차>:<결정>:<신호 시각>`을 적는다. 멈추거나 실패한 결정을 10분마다 다시 돌리지 않으려는 것이다. 다시 돌리려면 기획자가 새 신호를 남기거나(시각이 바뀐다) 개발자가 그 줄을 지운다. `HARNESS_STATE_DIR`로 자리를 옮길 수 있다.
- **기다리는 일은 스크립트가 맡는다.** 배포가 끝나기를 기다리는 `gh run watch`·`sleep` 은 허용 목록 밖이라 세션이 직접 기다리면 거부된다. 7단계는 `deploy-check.mjs` 하나로 「실행이 끝날 때까지 기다렸다가 주소가 200 인지」를 받는다.
- **멈추면 실패로 끝난다.** 묻고 멈춤·섞임·검사 실패처럼 넘김 파일이 없거나 Quality 가 실패하면 job 이 빨갛게 끝나고, 보고 전문이 job 요약에 남는다. 이슈에는 아무것도 달지 않는다. 이어 받은 차례나 `결과 <n>`이 끝났는데 새 결과 댓글이 없어도(`decision.mjs`의 `resultCommentId`가 그대로) 실패다 — `claude -p` 는 멈춰도 성공으로 끝나므로 이것을 보지 않으면 dev 에는 합쳐졌는데 결과가 없는 채 초록으로 끝난다.
- **Slack 카드의 반응도 결정이 된다.** `slack-bridge.mjs` 가 결과 채널의 👍 👎 😕 를 듣고 그 카드가 가리키는 이슈에 「승인」·「반려」·「개선」 댓글을 단다(누른 사람과 Slack 링크를 달고). Workflow Builder 의 GitHub 커넥터에는 「이슈 만들기」만 있고 댓글 단계가 없어 코드로 둔 것이다. 결정의 원본은 그래도 GitHub 댓글이다 — 다리가 꺼져 있어도 GitHub 쪽 반응·댓글은 1분 타이머가 읽는다. 토큰은 `~/.ooee-harness/slack.env` 에 사람이 넣고 저장소에 두지 않는다.
- **결정처럼 보이지만 읽지 않은 댓글은 한 번 알린다.** 결정이 없는 요청에 「승인합니다」·「개선 요청: …」처럼 꼴이 맞지 않는 댓글만 있으면 사람은 결정했다고 여기는데 할 일이 없다. 10분 확인이 그 댓글을 job 요약에 적고 실패로 끝낸다. 같은 댓글로는 다시 알리지 않는다(`<이슈>:<회차>:읽지 않은 댓글:<가장 늦은 시각>`).
- **10분 확인은 결정만 본다.** 결과 댓글이 없는 요청(#9 처럼 이 흐름 전에 처리한 것)을 저절로 올리지 않는다. 올리려면 `결과 <n>`을 손으로 돌린다.

## 알아 둘 것

- 판독은 계정으로 거르지 않는다. 지금은 처리 계정과 요청자 계정이 같아서, 거르면 어떤 결정도 읽히지 않는다. 그래서 판독은 「에이전트가 반응이나 결정 댓글을 달지 않는다」에 기대고, 그것을 `.claude/settings.json`이 막는다. `gh api`는 통째로 `deny`(필드를 붙인 암묵 POST 까지), `gh issue comment`는 `ask`, 네 스크립트를 고치는 것도 `ask`다. 에이전트가 쓸 수 있는 글은 `post-result.mjs`가 양식으로 만든 결과 댓글뿐이고, 그 첫 줄은 「화면 요청 #<n> 결과」라 결정으로 읽히지 않는다. 규칙은 명령 문자열을 대조할 뿐이라 GitHub 의 보호가 아니다(AGENTS.md 「Claude Code 명령과 권한」).
- 세 스크립트는 gh 를 node 의 `execFileSync`로 부른다. Bash 권한 규칙은 `node scripts/harness/…` 명령만 보고 그 안의 gh 호출은 보지 않으므로, `gh api`를 Bash 에서 통째로 막아도 `decision.mjs`는 그대로 돈다. `decision.mjs`가 `--method GET`을 적어 두는 것은 필드를 붙여도 쓰기 요청이 되지 않게 하려는 것이고, 테스트가 가짜 gh 로 그것을 본다.
