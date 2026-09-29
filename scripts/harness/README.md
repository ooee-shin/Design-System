# 화면 요청 이슈를 돌리는 도구

Slack 폼으로 들어온 화면 요청 이슈를 읽고, 처리한 결과를 이슈 댓글과 Slack 카드로 내고, 사람이 내린 결정을 읽어 러너를 잇는 스크립트들이다. 흐름과 승인 범위는 `docs/process/ai-environment.md` 「처리와 승인」이 소유한다. 전달 시 `docs/process/`와 함께 제거한다.

`issue`·`result-comment`·`decision` 셋은 **읽기와 글 만들기만 한다.** 이슈에 글을 다는 것은 `post-result.mjs` 하나이고, 그것도 러너가 불러 양식이 만든 결과 댓글 한 장만 단다(에이전트 세션에는 열려 있지 않다). 반응·라벨·이슈 상태는 어느 스크립트도 바꾸지 않는다.

## 파일


## 계획이 없을 때

모델이 `plan.json` 을 쓰지 않고 하위 명령 보고로 끝내는 일이 있다(#135·#147). 스킬에 적어도 또 그랬으므로 **러너가 작업 트리에서 계획을 짓는다**(`runner.mjs` 의 `recoverPlan`). 근거는 셋뿐이다 — 새로 생긴 화면 폴더(`git status`), 그 key 의 `screens.ts` 등록값, 모델 보고의 「판단이 필요한 것」·「미확정 자산 후보」 절이다. `componentsUsed` 는 화면 파일의 `@ooee/ui` import 에서 긁는다. 셋 가운데 하나라도 없으면 짓지 않고 멈춘다 — 그때 카드는 「하네스가 마무리하지 못했다」다.

만든 화면을 버리고 멈추는 것이 가장 나쁜 답이라서 둔 자리다. 지었으면 pull request 본문의 「그 밖에 한 일」에 그 사실이 적힌다.

## 예상 시간

한 단계가 보통 얼마나 걸리는지 `estimate.mjs` 가 말한다. 기록 `~/.ooee-harness/runs/*.log` 에서 그 종류의 **성공한** 실행만 최신 열 건까지 보고, 세 건이 안 되면 저장소에 적어 둔 씨앗 값을 쓴다(다섯 건 이상이면 양 끝을 하나씩 뗀다 — 「이미 main 에 있어 30초에 닫고 끝난 승인」 같은 것이 폭을 망친다). 끝나는 시각을 약속하지 않고 「보통 11~15분 걸립니다」로 말한다.

걸리는 시간이 요청 내용에 거의 달려 있지 않아 첫 요청에도 숫자를 말할 수 있다 — 대부분이 pull request·Quality 검사·머지·배포라는 고정 구간이고, `2026-09-29` 에 잰 기록에서 화면 1장부터 4장까지 모두 10.8~14.3분 안이었다.

알리는 자리는 셋이다.

- **결정 답장**(`slack-bridge.mjs`) — 승인·반려·개선을 누르면 그 종류의 숫자를 함께 말한다. 승인·반려는 모델을 부르지 않아 6분이고 개선은 다시 만들어 12분이다.
- **시작 알림**(`runner.mjs` 의 `startNotice`) — 처리·개선을 시작할 때 결과 채널에 한 줄 올린다. **폼을 낸 첫 요청에 예상 시간이 붙는 자리가 이것이다** — 전에는 결과 카드가 올 때까지 아무 말이 없었다. 승인·반려는 결정 답장이 이미 말했고 짧아 올리지 않는다.
- **지연 알림**(`slow-notice.mjs`) — 예상의 두 배를 넘기면 **한 번만** 올린다. 1분 감시가 러너를 만나면 이것을 부른다(`watch-tick.sh`). 러너는 모델을 동기로 기다려 스스로 타이머를 돌리지 못하므로 그 자리가 유일하게 깨어 있다. 알렸다는 표시는 그 실행의 기록 파일에 적으므로 실행이 끝나면 함께 지나간다.

씨앗 값을 다시 재는 방법은 `estimate.mjs` 머리말에 있다.

| 파일 | 하는 일 |
| --- | --- |
| `issue.mjs` | 이슈 본문을 칸별로 읽어 `/ooee-harness:generate-code` 인수(`generateArgs`)를 만든다. 만들 수 없으면 `null`과 까닭(`problems`)을 낸다 |
| `plan.mjs` | 모델이 화면을 만든 뒤 남기는 `plan.json` 을 읽어 가지 이름·pull request 본문·결과 댓글 입력으로 바꾼다. 순수 함수라 시험이 값으로 고정한다 |
| `runner.mjs` | 요청 하나를 처음부터 끝까지 돌린다. 모델(`/make-screens`)은 화면만 만들고, 가지·commit·push·pull request·Quality·머지·배포 확인·결과 댓글·이슈 닫기는 모두 여기다. 아래 「러너」 |
| `deploy-check.mjs` | 머지 commit 의 Deploy 실행이 끝나기를 기다렸다가 화면 주소가 200 인지 본다(배포 확인). 내 실행이 취소되면 그 뒤의 실행을 본다 |
| `result-comment.mjs` | 처리 결과를 결과 댓글 markdown 으로 만든다. 빠진 링크나 실패한 검사가 있으면 만들지 않고 던진다 |
| `post-result.mjs` | 러너가 결과 댓글을 이슈에 다는 자리(에이전트 세션에는 열려 있지 않다). 단 뒤 `slack-card.mjs` 로 결과 채널에 카드를 올린다 — 아래 「알아 둘 것」 |
| `slack-card.mjs` | 결과 댓글의 머리 네 줄과 결정 버튼(👍 👎 😕)을 결과 채널에 카드 한 장으로 올린다. 반려를 되묻는 블록도 여기 있다 |
| `decision.mjs` | 결과 댓글의 반응과 뒤따른 댓글에서 승인·반려·개선을 읽는다. `gh api` GET 만 쓴다 |
| `decide.mjs` | 승인·반려·개선을 스크립트가 처리할 때 쓰는 규칙. `main` 에 승인 아닌 것이 섞였는지 가르고, main·되돌림 pull request 본문을 만든다. 역시 순수 함수다 |
| `slack-bridge.mjs` | 이 Mac 에서 소켓 모드로 상시 돈다. 카드의 버튼·반응·스레드에 적은 까닭을 GitHub 결정 댓글로 옮긴다. 반려는 한 번 더 묻는다 |
| `slack-env.mjs` | `~/.ooee-harness/slack.env` 의 토큰·채널을 읽는다. 다리와 카드가 함께 쓴다 |
| `watch-decisions.mjs` · `watch-tick.sh` | 이 Mac 이 60초마다 새 요청과 결정을 읽고, 있으면 `local-run.mjs` 로 러너를 돌린다. launchd 가 `watch-tick.sh` 를 부른다 |
| `local-run.mjs` | 러너를 Actions job 밖에서 돌린다. 사본을 `origin/dev` 로 맞추고 `runner.mjs` 를 부르며 기록을 `~/.ooee-harness/runs/` 에 남긴다. 아래 「러너」 |
| `com.ooee.harness.*.plist` | launchd 정의 셋(다리 · 감시 · 잠자기 방지). 설치는 아래 「launchd」 |
| `fixtures/issue-*.json` | `gh issue view`로 한 번 받아 둔 실제 이슈 #1~#4·#6·#9. 폼이 바뀌어 온 양식이 다 들어 있다 |
| `fixtures/issue-9-comments.json` | 실제 #9 댓글(`--paginate --slurp` 모양). 아직 비어 있다 |
| `fixtures/result-input.example.json` | `result-comment.mjs` 입력의 예. #9 를 처리했다고 치고 지어낸 값이다(주소도 가짜다) |

## 돌리는 순서

이 차례를 도는 것은 `runner.mjs` 다. 모델은 그 가운데 화면 만들기 하나만 맡는다(`.claude/skills/make-screens/SKILL.md`).

```bash
node scripts/harness/issue.mjs 9                         # generateArgs 가 null 이면 problems 를 요청자에게 묻는다
# generate-code · pull request · dev 머지 · 배포
node scripts/harness/result-comment.mjs .harness-work/issue-9/result-1.json   # 올리기 전에 글만 본다
node scripts/harness/post-result.mjs 9 .harness-work/issue-9/result-1.json
node scripts/harness/decision.mjs 9 [--round 1]          # 결과 없음 · 대기 · 승인 · 반려 · 개선
```

입력과 댓글 파일은 `.harness-work/`에 둔다. 저장소에 넣지 않는 자리라, 남아 있어도 다음 처리의 「working tree 가 깨끗한가」를 막지 않는다.

- `issue.mjs --body-file <경로> --title <제목> [<번호>]`는 gh 없이 파일을 읽는다.
- 허용 프로젝트는 `apps/sandbox/src/screens.ts`의 `SANDBOX_PROJECTS`에서 읽는다. 폼의 「새 프로젝트」 칸으로 온 이름은 러너가 그 목록에 더하므로 폼의 선택지와 같을 필요는 없다 — 폼 선택지에 있는 이름이 목록에 없으면 모르는 값이 되어 멈춘다.
- 결과 댓글의 첫 네 줄(제목과 결정 안내 · 요청 · 샌드박스 · 작업 요약)이 Slack 결과 채널의 카드에 보인다. 머리에 드는 값은 한 줄로 펴서 입력이 어떻든 네 줄이다. 결과는 샌드박스에서만 본다. 작업 줄은 만든 페이지 이름을 앞의 셋까지 적는다. 개선 회차의 샌드박스 링크는 `summary.pagesAdded`에 이름이 있는 첫 화면이라, 그 이름은 `screens[].name`과 같아야 한다(다르면 만들지 않는다). 표식 `<!-- harness:result issue=<n> round=<r> -->`는 카드에 드러나지 않게 맨 끝에 둔다.
- 결정 신호는 결과 댓글의 👍·👎·😕 반응과 「승인」 한 낱말, 또는 「반려: …」·「개선: …」처럼 콜론을 붙인 댓글이다. 가장 늦은 것이 이긴다.
- 결정 낱말로 시작하지만 꼴이 맞지 않는 댓글(「승인합니다」「반려합니다. …」「개선 요청: …」)은 결정이 아니고 `lookalikes`에 주소·글과 함께 나온다. 그 가운데 이긴 신호보다 늦은 것이 있으면(신호가 없으면 하나라도 있으면) `lookalikeAfterDecision`이 `true`다. 러너는 그때 결정을 따르지 않고 멈춘다.
- 반려·개선의 사유는 `reasonSource`와 함께 나온다. `prefix`는 「반려: …」 댓글 자신, `after`는 신호를 남긴 사람이 그 뒤에 쓴 첫 댓글, `before`는 신호 앞 10분(`REASON_BEFORE_MS`) 안의 마지막 댓글이다. `after`·`before`는 짐작이라 `reasonCommentUrl`로 원문을 가리키고 `note`에 적는다.

## 러너

**새 요청은 스크립트가 운전한다**(`2026-09-24` 역할 뒤집기). `runner.mjs` 의 `runRequest` 가 이슈를 읽고 → `/make-screens` 를 한 번 부르고 → `plan.json` 을 확인한 뒤 → 가지·commit·push·pull request·Quality·머지·배포 확인·결과 댓글까지 한다. **모델이 하는 일은 화면을 만들고 `plan.json` 을 쓰는 것 하나뿐이다.** 까닭은 `plan.mjs` 머리말에 있다 — `2026-09-23`~`24` 에 요청 처리가 아홉 번 무너졌는데 화면 생성은 한 번도 실패하지 않았고, 무너진 것은 언제나 모델이 운전하던 주변이었다. **결정도 같은 길이다** — 승인·반려는 판단이 없어 모델을 아예 부르지 않고(`decide.mjs`), 개선만 사유가 앞 회차의 무엇을 가리키는지 읽히려고 부른다. 모델과 스크립트 사이에 오가는 것은 `plan.json` 하나다.

**러너를 부르는 것은 이 Mac 의 1분 감시다**(`2026-09-23` 개발자: 「로컬에서 돌리는 걸로, 항상 켜두는 컴퓨터라 괜찮다」). `watch-decisions.mjs` 가 열린 화면 요청을 읽어 처리할 것과 결정을 고르고, `local-run.mjs` 가 사본(`~/.ooee-harness/harness`)을 `origin/dev` 로 맞춘 뒤 러너를 **Actions job 밖에서** 돌린다. 흐름은 ai-environment.md 「처리와 승인」이, 모델이 맡는 한 조각은 `/make-screens` 가 갖는다.

```bash
node scripts/harness/local-run.mjs 처리 12   # 감시가 부르는 것과 같다(사본을 맞추고 기록을 남긴다)
node scripts/harness/runner.mjs 처리 12      # 사본을 맞추지 않고 지금 tree 에서 바로
node scripts/harness/runner.mjs 결정 12      # 결정 하나 · 번호를 비우면 열린 요청 전부
node scripts/harness/runner.mjs 결과 9       # 결과 댓글만
```

| 무엇이 | 무엇을 한다 |
| --- | --- |
| 1분 감시 — 결과 댓글이 없는 열린 「화면 요청」 | `처리 <n>`. 한 요청에 한 번뿐이다(`<이슈>:처리` 열쇠). 멈췄으면 사람이 다시 부른다 |
| 1분 감시 — 새 결정(반응·댓글) | `결정 <n>`. 결정이 없으면 Claude 를 부르지 않고 끝난다 |
| Actions 에서 손으로(`harness.yml`, workflow_dispatch) | `처리`·`결정`·`결과`. 감시가 멈췄을 때의 예비다 |

- **job 안에서 돌리지 않는 까닭.** self-hosted runner 는 job 이 도는 동안 1분마다 GitHub 에 살아 있다고 알린다. 이 Mac 의 연결이 15~25분마다 끊겨 그 갱신이 실패했고, GitHub 가 job 을 버리면 러너가 다시 붙는 순간 claude 를 강제로 끝냈다 — #60 이 네 번 연속 그렇게 죽었다(`2026-09-23`). 처리는 어차피 이 Mac 의 것이라 GitHub 가 잊어도 이어질 수 있다.
- **기록은 `~/.ooee-harness/runs/<시각>-<모드>-<이슈>.log` 다.** job 요약을 대신한다 — 결과는 이슈 댓글과 Slack 카드로 간다. 이름순이 시간순이다. 감시 자신의 줄은 `watch.log` 에 남는다.
- **한 번에 한 요청이다.** 러너가 도는 동안 launchd 는 다음 tick 을 띄우지 않는다(한 working tree 한 요청).

- **수정 요청도 같은 길로 온다.** 본문에 `수정 대상: #<n>` 이 있으면 `issue.mjs` 가 `mode: "수정"` 으로 읽고, 처리하는 쪽이 그 요청의 화면을 제자리에서 고친다(ai-environment.md 「두 번째 폼」).
- **Claude 는 화면까지, 나머지는 스크립트가.** `claude -p "/make-screens <n> 러너"` 는 화면을 만들고 `.harness-work/issue-<n>/plan.json` 을 쓰고 멈춘다. 스크립트는 그 파일을 다시 검사하고(`plan.mjs` 의 `validatePlan`) 가지를 만들어 commit·push 한 뒤 `gh pr create` → Quality → squash 머지 → 배포 확인 → 결과 댓글까지 한다. 올릴 변경은 생성 화면의 자리(`apps/sandbox/src/app/<key>/` 바로 아래와 `apps/sandbox/src/screens.ts`)뿐이어야 한다. 그 밖을 건드렸으면 올리지 않고 멈춘다 — 모델이 하네스 스크립트나 workflow 를 함께 올리면 러너가 스스로 합치고 다음 실행에서 그 코드로 돌기 때문이다.
- **모델은 `claude-sonnet-5`·`high`로 박는다.** 명령 머리말과 같은 값이다. 실행 기록에 쓴 모델이 찍힌다.
- **러너가 스킬 머리말 밖에서 더 여는 것은 없다** — 반려의 되돌리기도 스크립트가 한다(plan.mjs `removeScreens`, #62). **`/make-screens` 와 하위 명령(generate-code · review-design)의 머리말 allowed-tools 는 러너가 읽어 `--allowedTools`로 넘긴다** — 바깥 명령 안에서 Skill 로 불린 명령의 머리말은 적용되지 않아 #29 에서 하위 명령이 적어 둔 명령이 거부됐다. 원본은 여전히 각 SKILL.md 이고, 넘기는 목록에 gh 쓰기 명령이 섞이면 시험이 실패한다. 파일 쓰기는 `--permission-mode acceptEdits`로 받고, Plugin 은 `--plugin-dir plugins/ooee-harness`로 싣는다. MCP 서버는 싣지 않는다.
- **gh·git 은 이 Mac 의 로그인이다.** GITHUB_TOKEN 으로 만든 pull request 와 머지는 다른 workflow 를 깨우지 않아 Quality 와 Deploy 가 돌지 않는다. 예비 `harness.yml` 도 그래서 `persist-credentials: false` 다.
- **같은 결정은 한 번만 처리한다.** 처리하기 **전에** `~/.ooee-harness/decisions.json`에 `<이슈>:<회차>:<결정>:<신호 시각>`을 적는다. 멈추거나 실패한 결정을 감시가 돌 때마다 다시 돌리지 않으려는 것이다. 다시 돌리려면 기획자가 새 신호를 남기거나(시각이 바뀐다) 개발자가 그 줄을 지운다. 감시가 적는 `<이슈>:처리` 열쇠도 **같은 파일**이다(`2026-09-27` 에 `dispatched.json` 을 없앴다) — 멈춘 요청을 다시 돌리려면 그 줄 하나만 지운다. `HARNESS_STATE_DIR`로 자리를 옮길 수 있다.
- **기다리는 일은 스크립트가 맡고, 배포 확인은 러너가 한다**(`2026-09-23`). 합친 뒤 러너가 `deploy-check.mjs` 를 직접 돌려 「실행이 끝날 때까지 기다렸다가 주소가 200 인지」를 받고, 그 JSON 의 `ok` 로 결과 댓글의 검수 결과 줄(「배포 주소 N장 200」)을 채우고, 아니면 댓글 전에 멈춘다(plan.mjs `resultInput`). 모델에게 기다리라고 시켰더니 #60 은 「알림이 올 것이므로 기다린다」, #62 는 「백그라운드로 넘어갔다」 하고 턴을 끝내 결과 댓글이 올라가지 않았다. 확인할 화면 key 는 머지된 pull request 가 바꾼 파일에서 뽑는다(`screenKeys`).
- **멈추면 실패로 끝난다.** 묻고 멈춤·섞임·검사 실패처럼 plan.json 이 없거나 validatePlan 이 틀린 곳을 냈거나 Quality 가 실패하면 exit 이 0 이 아니고, 보고 전문이 그 실행의 기록 파일에 남는다. 멈춘 것은 결과 채널에 카드로도 알린다(`runner.mjs` `stopNotice`) — 기록 파일은 기획자가 보지 못한다. 이슈에는 아무것도 달지 않는다. 처리·개선·`결과 <n>`이 끝났는데 새 결과 댓글이 없어도(`decision.mjs`의 `resultCommentId`가 그대로) 실패다 — (모델이 결과를 올리던 때 `claude -p` 가 멈춰도 성공으로 끝나 dev 에 합쳐진 채 결과가 없던 적이 있어) 이것을 보지 않으면 dev 에는 합쳐졌는데 결과가 없는 채 초록으로 끝난다.
- **결과 카드는 우리가 올린다.** `post-result.mjs` 가 이슈에 댓글을 단 뒤 `slack-card.mjs` 로 머리 네 줄을 결과 채널에 한 장으로 올린다. GitHub for Slack 은 댓글을 이슈 카드의 스레드에 달아 채널 본문에 보이지 않았다. 토큰(`SLACK_BOT_TOKEN`)이나 채널(`SLACK_RESULT_CHANNEL`)이 없으면 건너뛴다.
- **카드의 버튼이 결정의 입구다.** 승인은 바로 올라가고, 개선은 스레드에서 까닭을 받고, 반려는 한 번 더 물은 뒤(되돌리는 일이라) 까닭을 받는다. 까닭이 올라가야 처리가 시작된다.
- **Slack 카드의 반응도 결정이 된다.** `slack-bridge.mjs` 가 결과 채널의 👍 👎 😕 를 듣고 그 카드가 가리키는 이슈에 「승인」·「반려」·「개선」 댓글을 단다(누른 사람과 Slack 링크를 달고). Workflow Builder 의 GitHub 커넥터에는 「이슈 만들기」만 있고 댓글 단계가 없어 코드로 둔 것이다. 결정의 원본은 그래도 GitHub 댓글이다 — 다리가 꺼져 있어도 GitHub 쪽 반응·댓글은 1분 타이머가 읽는다. 토큰은 `~/.ooee-harness/slack.env` 에 사람이 넣고 저장소에 두지 않는다.
- **결정처럼 보이지만 읽지 않은 댓글은 한 번 알린다.** 결정이 없는 요청에 「승인합니다」·「개선 요청: …」처럼 꼴이 맞지 않는 댓글만 있으면 사람은 결정했다고 여기는데 할 일이 없다. 결정 확인이 그 댓글을 실행 기록(`runs/`)에 적고 실패로 끝낸다. 같은 댓글로는 다시 알리지 않는다(`<이슈>:<회차>:읽지 않은 댓글:<가장 늦은 시각>`).
- **결정 확인은 결정만 본다.** 결과 댓글이 없는 요청(#9 처럼 이 흐름 전에 처리한 것)을 저절로 올리지 않는다. 올리려면 `결과 <n>`을 손으로 돌린다.

## 알아 둘 것

- 판독은 계정으로 거르지 않는다. 지금은 처리 계정과 요청자 계정이 같아서 거르면 어떤 결정도 읽히지 않는다. 그래서 판독은 에이전트가 반응·결정 댓글을 달지 않는다는 데 기댄다 — 막는 것의 목록은 `.claude/settings.json` 의 deny·ask(AGENTS.md 「Claude Code 명령과 권한」).
- **`node -e` 는 열지 않는다.** `2026-09-23` 에 잠깐 `allow` 에 들었다가 같은 날 저장소 주인이 되돌렸다. 임의 코드 실행이라 `child_process` 로 `gh pr merge`·`gh api` 쓰기·`git push origin main` 을 그대로 돌 수 있고, 그러면 `.claude/settings.json` 의 deny·ask 가 한꺼번에 뜻을 잃는다. 즉석으로 무엇을 확인해야 하면 `Read`·`Grep` 이나 저장소에 있는 스크립트로 한다. 규칙이 명령 문자열을 대조하는 방식인 한, 임의 실행을 여는 순간 그것은 울타리가 아니게 된다. `node scripts/*` 도 같은 까닭으로 열지 않는다 — runner.mjs 가 머지·push·이슈 닫기를 한다(#68 에서 파일마다 줄을 더하지 않으려 자리로 열었던 것을 되돌림). 러너만 부르는 `result-comment`·`post-result`·`deploy-check` 도 열지 않는다 — 특히 `post-result` 는 열어 두면 `gh issue comment` ask 를 우회하는 길이다.
- 이 스크립트들은 gh 를 node 의 `execFileSync`로 부른다. Bash 권한 규칙은 `node scripts/harness/…` 명령만 보고 그 안의 gh 호출은 보지 않으므로, `gh api`를 Bash 에서 통째로 막아도 `decision.mjs`는 그대로 돈다. `decision.mjs`가 `--method GET`을 적어 두는 것은 필드를 붙여도 쓰기 요청이 되지 않게 하려는 것이고, 테스트가 가짜 gh 로 그것을 본다.

## launchd — 이 Mac 에 상시로 두는 셋

plist 셋은 기기별 경로를 `__HOME__` 로 두었다(저장소에 절대경로를 적지 않는다). 설치할 때 `sed` 로 채운다(`caffeinate` 에는 경로가 없어 그대로 복사된다). launchd 가 띄운 프로그램은 `~/Desktop` 을 읽지 못하므로(macOS TCC) 보호 밖의 사본 `~/.ooee-harness/harness` 에서 돈다.

```sh
git clone -b dev https://github.com/bluekey-kr/Design-System-Harness.git ~/.ooee-harness/harness
for name in decisions slack caffeinate; do
  sed "s#__HOME__#$HOME#g" ~/.ooee-harness/harness/scripts/harness/com.ooee.harness.$name.plist > ~/Library/LaunchAgents/com.ooee.harness.$name.plist
  launchctl load ~/Library/LaunchAgents/com.ooee.harness.$name.plist
done
launchctl list | grep ooee.harness          # 셋 다 보여야 한다
tail -f ~/.ooee-harness/watch.log ~/.ooee-harness/slack.log
```

- **`node`·`pnpm`·`claude`·`gh` 가 plist 의 PATH(`~/.local/node/bin`·`~/.local/bin`)에 있어야 한다.** launchd 는 PATH 를 주지 않아 plist 가 못 박았다. 다른 곳에 두었으면 plist 의 PATH 를 고친다. `gh auth status` 와 `claude` 로그인이 이 계정에 있어야 한다.
- **얕게(`--depth 1`) 받거나 한 가지만 받지 않는다.** 승인(D2)은 `git log origin/main..origin/dev` 와 이력 검색을 쓰므로 `origin/main` 과 이력이 있어야 한다(`2026-09-24` 에 #85 승인이 「origin/main 이 없습니다」로 멈췄다). 이미 얕게 받아 두었으면 `local-run.mjs` 의 `ensureFullClone` 이 처음 돌 때 고친다.
- **그 폴더에서 `claude` 를 한 번 열어 신뢰 창을 수락한다.** 아니면 `.claude/settings.json` 의 `allow` 가 통째로 무시되어 화면 규칙 검사와 화면 테스트가 막힌다(`2026-09-23`). 예비 `harness.yml` 로 돌리려면 actions runner 의 `_work` 사본(`~/actions-runner/_work/…`)에서도 한 번 열어 수락해야 한다 — 다른 폴더라 신뢰가 따로다.
- `com.ooee.harness.decisions` — 60초마다 `watch-tick.sh`. 사본을 `origin/dev` 로 맞춘 뒤 새 요청과 결정을 읽고, 있으면 그 자리에서 러너를 돌린다(`local-run.mjs`). 처리가 20분 걸려도 launchd 는 다음 tick 을 겹쳐 띄우지 않는다. 감시를 멈추려면 `launchctl unload ~/Library/LaunchAgents/com.ooee.harness.decisions.plist`(저장소에서 유일한 멈추는 명령).
- `com.ooee.harness.slack` — 다리(`slack-bridge.mjs`)를 상시로. 끊기면 launchd 가 되살린다. 토큰은 `~/.ooee-harness/slack.env`(「slack-bridge.mjs」 머리말 「설치」).
- `com.ooee.harness.caffeinate` — `caffeinate -s` 를 상시로. 전원 연결 중에만 잠자기를 막는다 — 감시가 1분마다 돌려면 Mac 이 깨어 있어야 한다. 배터리로 돌거나 덮개를 닫으면 평소처럼 잠든다.
- 코드가 바뀌면 사본이 다음 감시 때 스스로 맞춰지지만, 다리는 `launchctl kickstart -k gui/$(id -u)/com.ooee.harness.slack` 로 다시 띄워야 새 코드를 탄다.
