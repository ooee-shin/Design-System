---
name: process-issue
description: Slack 폼으로 들어온 화면 요청 이슈 하나를 처음부터 결과 댓글까지 처리한다. 이슈를 읽고 /ooee-harness:generate-code 로 화면을 만든 뒤 dev 에 머지하고 배포된 주소를 확인해 결과를 이슈 댓글로 올리고 멈춘다. 「결정 <n>」으로 다시 부르면 그 댓글에 사람이 단 결정(승인·반려·개선)을 읽어 다음 일을 한다. 화면이 이미 dev 에 들어갔는데 결과 댓글이 없으면 「결과 <n>」으로 결과 댓글만 올린다. 「이슈 <n> 처리」, 「<n> 결정 봐 줘」, 「<n> 결과만 올려 줘」 요청에 쓴다. 인수는 「<이슈 번호>」, 「결정 <이슈 번호>」 또는 「결과 <이슈 번호>」이다.
model: claude-sonnet-5
effort: high
allowed-tools: Read, Grep, Glob, Write, Skill, Bash(git status:*), Bash(git rev-parse --show-prefix), Bash(git fetch origin), Bash(git switch dev), Bash(git pull --ff-only), Bash(git switch -c feature/issue-*), Bash(git add apps/sandbox/*), Bash(git commit:*), Bash(git log:*), Bash(git push -u origin feature/issue-*), Bash(node scripts/harness/issue.mjs:*), Bash(node scripts/harness/result-comment.mjs:*), Bash(node scripts/harness/decision.mjs:*), Bash(node scripts/harness/post-result.mjs:*), Bash(gh issue view:*), Bash(gh issue list:*), Bash(gh pr view:*), Bash(gh pr list:*), Bash(gh pr checks:*), Bash(gh run list:*), Bash(gh run view:*), Bash(pnpm check), Bash(pnpm --filter @ooee/sandbox build), Bash(node scripts/visual/inspect.mjs:*), Bash(curl -s -o /dev/null -w '%{http_code}' https://ooee-sandbox.pages.dev/*)
---

# /process-issue

화면 요청 이슈 하나를 `docs/process/ai-environment.md` 「처리와 승인」의 흐름대로 돌린다. 흐름과 승인 범위는 그 절이, 세 스크립트의 입출력은 `scripts/harness/README.md`가 소유한다. **이 명령은 차례를 잇기만 한다.** 화면을 만드는 규칙은 `plugins/ooee-harness/skills/generate-code/SKILL.md`, 검수 항목은 `plugins/ooee-harness/skills/review-design/SKILL.md`가 가지며 여기에 다시 적지 않는다. 그 둘이 멈추라고 하는 자리에서는 이 명령도 멈춘다. **요청 처리에서 Figma 는 만들지 않는다**(`2026-09-23` 결정, ai-environment.md 「처리와 승인」). 그 자리는 5단계 「sandbox 에서 띄워 보고 검사한다」가 대신한다.

`$ARGUMENTS`가 「결정」으로 시작하면 「결정 뒤」, 「결과」로 시작하면 「결과만 올리기」 절차이고, 아니면 「순서」다.

**이 명령을 부른 것이 commit·push·pull request 요청이다.** generate-code는 보고에서 멈추고 commit·push·pull request를 만들지 않는데, 이 명령은 그 보고를 받아 이어 간다. 다만 `gh pr create`·`gh pr merge`는 공용 권한(`.claude/settings.json`)의 `ask`라서 그 자리에서 사람이 한 번 더 확인한다. 확인을 물을 수 없는 headless 세션에서는 거기서 거부되고 멈춘다.

**allowed-tools에 두지 않은 것.** `gh issue comment`는 여기서 열지 않고 공용 권한에서도 `ask`다. 열어 두면 「승인」 댓글도 확인 없이 올라가고, 판독은 그것을 사람의 결정과 가르지 못한다. 결과 댓글은 `scripts/harness/post-result.mjs` 하나로만 단다 — 양식이 만든 글만 나가므로 첫 줄이 「화면 요청 #<n> 결과」로 고정되어 결정 댓글로 둔갑하지 못한다. `git revert`(D3)도 되돌리는 일이라 열지 않는다. `curl`은 7단계의 배포 주소 확인 꼴 하나만 연다.

## 입력

- **`<n>`** — 제목이 「화면 요청: …」인 이슈의 번호다. 요청의 원본은 그 이슈 본문 하나다. Slack 카드나 대화에서 들은 말로 요구사항을 채우지 않는다.
- **`결정 <n>`** — 결과 댓글을 올린 뒤 결정을 읽는다. 가장 최근 회차의 결과 댓글을 본다.
- **`결과 <n>`** — 이 요청의 화면이 이미 `dev`에 머지되었는데 결과 댓글이 없을 때 결과 댓글만 올린다. 화면을 다시 만들지 않는다.
- 번호가 없거나 숫자가 아니면 멈추고 `gh issue list --state open --search "화면 요청 in:title"`로 열린 요청을 보여 준다.
- 인수 끝에 `러너`가 붙으면 이 Mac 의 러너가 부른 것이다. 아래 「러너에서 돌 때」를 함께 따른다.

## 하지 않는 것

- **이슈를 고치거나 닫거나 라벨 달기, `gh api` 쓰기.** `gh issue edit`·`close`·`reopen`, `gh label`은 공용 권한의 `deny`다. `gh api`는 이 명령에서 쓰지 않는다. GitHub 읽기는 세 스크립트와 `gh issue`·`gh pr`의 읽기 명령이 한다. `gh api`는 공용 권한이 통째로 `deny`한다 — 필드를 붙이면 gh가 저절로 POST로 보내는 `gh api …/reactions -f content=+1` 같은 꼴까지 막으려는 것이다. 반려된 이슈를 닫는 것도 사람이 한다.
- **결정을 만들기.** 결과 댓글에 반응을 달지 않고, 「승인」·「반려」·「개선」으로 시작하는 댓글을 쓰지 않는다. 판독(`decision.mjs`)은 계정으로 거르지 않으므로 에이전트가 쓴 그 댓글은 사람의 결정으로 읽힌다(`scripts/harness/README.md` 「알아 둘 것」). `gh issue comment`는 공용 권한의 `ask`이고, 판독·양식·게시 스크립트를 고치는 것도 `ask`라 이 길을 넓혀 스스로 승인할 수 없다.
- **결과 댓글 말고 이슈에 댓글 달기.** 결과 채널이 이 저장소의 댓글을 모두 카드로 받으므로 물음까지 채널에 뜬다. 물을 것은 대화에서 묻는다.
- **결과 댓글을 손으로 쓰거나 고치기.** 첫 네 줄과 맨 끝 표식은 `result-comment.mjs`가 만들고 판독이 그 모양에 기댄다. 스크립트가 만들기를 거부하면 까닭을 보고한다.
- **결정 없이 `main`으로 올리기.** `dev → main` pull request는 「결정 뒤」의 승인에서만 만들고, 머지는 사람이 한다.
- **pull request 본문에 `Closes #<n>`·`Fixes #<n>`·`Resolves #<n>` 쓰기.** 그 커밋이 기본 branch(`main`)에 들어가는 순간 이슈가 닫힌다. 이슈는 `요청: #<n>`으로만 가리킨다.
- **한 working tree에서 두 이슈를 함께 처리하기.** `AGENTS.md` 「Claude Code 명령과 권한」의 한 tree 한 세션 규칙이다. 이 명령이 화면마다 generate-code를 부르므로, 이슈 둘을 나란히 돌리면 두 세션이 같은 화면 자리를 쓴다.
- **막힌 명령 다시 시도하기.** 권한 규칙이나 확인 요청에 막히면 경로·옵션·도구를 바꿔 되풀이하지 않고 보고의 「막힌 명령」에 적는다(AGENTS.md).
- **멈춘 채로 결과 올리기.** 어느 단계든 멈췄으면 결과 댓글을 올리지 않는다. 검사·배포 실패는 반려가 아니라 처리 중 실패이며 승인을 묻지 않는다(ai-environment.md 「처리와 승인」).

## 순서

### 0. 시작 자리를 확인한다

`AGENTS.md` 「작업을 시작할 때」와 generate-code 0단계의 확인을 이 명령의 첫머리에서 한다. 여기서 멈추면 파일을 하나도 만들지 않았으므로 보고의 첫 제목을 「## 시작하지 않음」으로 한다.

```bash
git rev-parse --show-prefix                    # 빈 줄이어야 한다
git status --porcelain --untracked-files=all   # 빈 출력이어야 한다
git fetch origin
git switch dev
git pull --ff-only
```

- `--show-prefix`가 빈 줄이 아니면 하위 폴더에서 시작한 세션이다. 공용 권한이 걸리지 않으므로(AGENTS.md 「Claude Code는 저장소 루트에서 시작한다」) 저장소 루트에서 다시 열라고 알린다.
- working tree에 무엇이든 있으면 출력 전문을 붙여 멈춘다. 남의 변경이 섞이면 뒤의 검사와 generate-code의 「세 파일」 확인이 성립하지 않는다.
- `pull --ff-only`가 실패하면 멈춘다. 되돌리는 명령으로 풀지 않는다.
- `/ooee-harness:generate-code`가 이 세션의 Skill 목록에 없으면 Plugin을 설치하지 않은 것이다. 멈추고 `plugins/ooee-harness/README.md`의 설치를 알린다.

### 1. 이슈를 읽는다

```bash
node scripts/harness/issue.mjs <n>
```

출력의 `generateArgs`·`problems`·`notes`·`fields`를 쓴다. 본문을 눈으로 다시 나누지 않는다.

- **`generateArgs`가 `null`이면 `problems`를 원문 그대로 보고하고 묻고 멈춘다.** 보고의 첫 제목은 「## 묻고 멈춤」이다.
  - 요구사항이 없거나 빈 것은 대화의 답으로 채우지 않는다. 요청 문단의 원본은 이슈 본문이다(ai-environment.md 「요청 폼」). 폼으로 다시 요청하도록 보고한다.
  - 프로젝트를 하나 고르는 것처럼 답 하나로 풀리는 것은 답을 받은 뒤 이어 간다. 인수는 `issue.mjs`가 만드는 꼴(「<화면 이름>. <요구사항을 한 문단으로 편 것> 프로젝트: <id>」) 그대로 조립하고, 답으로 정한 것은 8단계 `needsDecision`에 남긴다. 예: 「프로젝트를 web 하나로 만들었다 — 요청은 web·sto·sv」.
  - 2단계에 해당하는 요청이면 그 목록도 같은 물음에 함께 낸다. 두 번 나눠 묻지 않는다.
- `fields.requester`가 비었으면 누구의 요청인지 묻는다. 결과 댓글은 요청자 없이 만들어지지 않는다.
- `notes`는 막지 않지만 보고에 옮긴다. 버린 앞 글(옛 양식)이 요구사항이었는지는 사람이 본다.
- `fields.onSubmit`·`fields.similar`는 `generateArgs`에 들지 않는다. 비어 있지 않으면 8단계 `needsDecision`에 「반영하지 않은 칸 <라벨>: <값>」으로 남긴다.

**이미 처리한 요청인지 본다.** 같은 회차 결과 댓글이 있는지만 보면, 화면이 `dev`에 들어갔는데 결과 댓글이 없는 요청(#9 → PR #19)을 다시 만들어 key마다 `-2`가 붙은 화면 다섯 장이 또 생긴다.

```bash
gh pr list --state all --base dev --search '"요청: #<n>" in:body' --json number,title,state,url,body
git log --oneline origin/dev --grep '(#<n>)' --fixed-strings
```

- 검색은 후보만 준다. 본문에 `요청: #<n>` 뒤에 숫자가 이어지지 않는 줄이 있는 pull request만 이 요청의 것이다. 첫 줄이 아니어도 된다(#19는 3행). 이슈와 pull request는 번호를 함께 쓰므로 `dev`의 commit 제목에 든 `(#<n>)`도 이 요청만 가리킨다. 검색 색인이 늦을 수 있어 둘을 함께 본다.
- **머지되었거나 열린 것이 있으면 만들지 않고 멈춘다.** 보고의 첫 제목은 「## 이미 처리함」이고, 그 pull request 주소를 붙인다. `node scripts/harness/decision.mjs <n>`이 「결과 없음」이면 `/process-issue 결과 <n>`을, 그 밖이면 `/process-issue 결정 <n>`을 알린다. 반려로 되돌린 요청(D3)도 처리한 것이다. 다시 만들려면 폼으로 새 요청을 받는다. 닫힌 채 머지되지 않은 것만 있으면 버린 처리이므로 이어 간다.

### 2. 만들 화면을 정한다

generate-code는 한 번에 화면 하나를 만든다. 요구사항이 화면 여러 장을 말하면(「4-5페이지 시나리오」처럼 장 수나 흐름을 말하거나 화면 이름을 늘어놓으면) **파일을 만들기 전에** 만들 화면 목록을 대화에 내고 확인받는다. 한 요청을 나누는 순간 장마다의 요구사항을 이쪽이 쓰게 되고, 그것은 요구사항을 지어내는 일이기 때문이다.

**지어낸 것은 끝까지 지어냈다고 드러낸다.** 기획자는 Slack 카드와 결과 댓글만 보고 승인한다. 지어냈다는 표시가 pull request 본문에만 있으면 무엇이 요청이고 무엇을 이쪽이 정했는지 모르는 채 승인하게 되고, `page.tsx` 머리말의 「요청:」에도 원문처럼 박힌다.

| key | 화면 이름 | 요청 원문에서 온 것 | 지어낸 것 |
| --- | --- | --- | --- |
| `shop-product-list` | 상품 목록 | 「자율 4-5페이지 정도의 시나리오」의 첫 장 · 비슷한 화면 Nike·무신사·크림 | 머리글, 카테고리 필터, 상품 12개와 가격, 정렬 선택 … |

- key의 꼴은 generate-code 3단계 「파일과 등록」이 정한다. 이미 있는 key면 generate-code가 번호를 붙이므로 여기서 미리 피하지 않는다.
- 「요청 원문에서 온 것」에는 이슈 본문에 있는 말만 옮긴다. 「지어낸 것」에는 화면에 보일 항목·버튼 문구·기본값 가운데 요청에 없는 것을 한 문단으로 적는다.
- 확인받은 표의 줄마다 「<화면 이름>. <요청 원문에서 온 것> 지어냄(요청에 없어 처리하는 쪽이 정함): <지어낸 것> 프로젝트: <id>」가 generate-code 인수다. generate-code는 인수의 요구사항 문단을 `page.tsx` 머리말에 그대로 붙이므로(그 SKILL.md 3단계 「파일과 등록」) 머리말에서도 원문과 지어낸 것이 갈린다. 단독 `/review-design`과 다음 회차의 대조가 그 머리말과 pull request 본문을 근거로 읽는다.
- 표와 줄마다의 인수는 6단계 pull request 본문에 그대로 옮기고, 「지어낸 것」은 8단계 `needsDecision`에 **반드시** 옮긴다. 대화는 남지 않고 저장소와 GitHub만 남는다.
- 한 장 요청이면 이 단계를 건너뛰고 `generateArgs`를 그대로 쓴다. 그때 요청에 없어 정한 값은 generate-code 보고의 「판단이 필요한 것」으로 온다.

### 3. 가지를 만든다

```bash
git switch -c feature/issue-<n>-<slug>
```

`<slug>`는 한 장이면 그 key, 여러 장이면 key들의 공통 앞부분이다(예: `feature/issue-9-shop`). 개선으로 다시 만드는 회차는 끝에 `-r<회차>`를 붙인다.

### 4. 화면마다 generate-code 를 돌린다

2단계의 줄마다 `/ooee-harness:generate-code <인수>`를 부른다. 절차와 멈추는 자리는 그 SKILL.md를 그대로 따른다.

- 보고의 첫 제목이 「## pull request 준비 완료」가 아니면(「검사 실패」·「묻고 멈춤」·「시작하지 않음」) 여기서 멈추고 그 보고를 그대로 붙인다. 남은 화면을 이어 만들지 않는다.
- 준비 완료면 **다음 화면으로 가기 전에** 그 화면의 세 파일만 commit한다. generate-code 0단계는 화면 자리에 commit하지 않은 파일이 있으면 시작하지 않는다.

  ```bash
  git add <보고의 「변경 파일」에 나온 세 경로>
  git commit -m "<보고의 「제목:」>"
  ```

- 그 화면에 넘긴 인수 원문과 보고의 key·매핑표·「검수 결과」·「판단이 필요한 것」·「미확정 자산 후보」를 모아 둔다. 6단계 본문과 8단계 입력에 쓴다.

### 5. sandbox 에서 띄워 보고 검사한다

Figma 로 옮기던 자리다(`2026-09-23`). 만든 화면을 실제로 띄워 눈으로 보고, 깨진 자리를 `dev` 에 올리기 전에 고친다. 사람의 눈은 `dev` 에 배포된 화면에서 한 번 더 본다 — 그것이 결정(개선이면 다음 회차, 반려면 되돌림, 승인이면 `main`)이다.

```bash
pnpm --filter @ooee/sandbox build
node scripts/visual/inspect.mjs --serve apps/sandbox/out --path /<key> --viewport 1440x900 \
  --shot <key> --out .harness-work/issue-<n>/shots --eval '<아래 식>'
```

- **빌드한 정적 사이트를 잰다.** `--serve` 가 `apps/sandbox/out` 을 빈 포트에 잠깐 띄우고 끝나면 닫는다. 개발 서버를 띄우지 않는다 — 무인 러너에 프로세스가 남거나, 3001 을 다른 checkout 의 서버가 잡고 있으면 옛 화면을 읽는다. 배포되는 것과 같은 빌드를 본다.
- 모바일 뷰(`max-w-[390px]`)로 선 화면은 `--viewport 390x844` 로 잰다(generate-code 「화면 폭」).
- `--eval` 은 셋을 돌려준다: 첫 `h1` 글자, 가로 넘침, 화면에 놓인 컴포넌트 표식.

  ```js
  ({ h1: document.querySelector("h1")?.textContent, overflowX: document.documentElement.scrollWidth > innerWidth, slots: [...new Set([...document.querySelectorAll("[data-slot]")].map((e) => e.dataset.slot))] })
  ```

- **캡처를 `Read` 로 열어 눈으로 본다.** 덩이마다(머리글·본문·옆 칸·바닥) 빈 화면, 겹친 요소, 잘린 글자, 상자 밖으로 넘친 요소, 매핑표에 있는데 보이지 않는 요소를 찾는다.
- **기계로 재는 둘은 막는다.** `h1` 이 없거나 가로로 넘치면 깨진 것이다. 그 화면의 세 파일(generate-code 「하지 않는 것」) 안에서 고치고 generate-code 5단계의 검사를 다시 돌린 뒤 이 단계를 다시 한다. 고친 것은 새 commit 으로 더한다. 두 번 고쳐도 남거나 세 파일 밖을 고쳐야 하면 멈춘다(「## 처리 중 실패」).
- 눈으로 본 것 가운데 고친 것은 8단계 `summary.other` 에, 고치지 않은 것(정렬·간격처럼 판단이 갈리는 것)은 `needsDecision` 에 「<화면>: sandbox 검사에서 본 것 — …」으로 남긴다.
- 캡처는 `.harness-work/issue-<n>/shots/` 에 남는다. 저장소에 넣지 않는다.
- 8단계 `checks` 에 「sandbox 화면 검사 <N>장」을 적는다. 모든 화면이 기계로 재는 둘을 통과했을 때만이다.

### 6. dev 에 올린다

```bash
pnpm check
git push -u origin feature/issue-<n>-<slug>
gh pr create --base dev --title "<제목>" --body-file .harness-work/issue-<n>/pr-<회차>.md
```

- `pnpm check`가 실패하면 push하지 않고 멈춘다(AGENTS.md 「검증」).
- 본문은 `.harness-work/issue-<n>/pr-<회차>.md`에 `Write`로 쓴다. `.harness-work/`는 저장소에 넣지 않는 자리다.
- 제목은 한 장이면 generate-code 보고의 「제목:」, 여러 장이면 `feat(sandbox): <이슈의 화면 이름> 화면 <N>장 추가`이고, 어느 쪽이든 끝에 ` (#<n>)`을 붙인다. squash commit 제목에 남아 1단계와 D2가 본문 없이도 이 요청의 것을 찾는다. `--base dev`를 꼭 적는다. 이 저장소의 GitHub 기본 branch는 `main`이라 빼면 `main`으로 가는 pull request가 생긴다.
- 본문 첫 줄은 `요청: #<n>`이다. 그 아래에 차례로 둔다. 「결정 뒤」와 「결과만 올리기」는 이 본문을 근거로 읽고 화면 코드를 열지 않는다(D4의 3).
  - `.github/pull_request_template.md`의 절
  - `## 화면별 인수` — 화면마다 key와 generate-code에 넘긴 인수 원문. 코드 울타리 안에 한 글자도 고치지 않고 둔다
  - 2단계의 확인받은 표(여러 장일 때)
  - 화면마다 generate-code 보고의 매핑표·「검수 결과」·「판단이 필요한 것」·「미확정 자산 후보」

`gh pr checks <번호> --watch`로 `Quality`가 통과한 것을 본 뒤 합친다. 실패하면 합치지 않고 멈춘다. `feature/* → dev`는 저장소가 해 온 대로 squash로 합치고 branch를 지운다.

```bash
gh pr merge <번호> --squash --delete-branch
```

`gh pr create`·`gh pr merge`가 확인 요청에서 거부되면 그대로 멈춘다. 사람이 확인하라고 둔 자리다.

### 7. 배포를 확인한다

`dev`에 들어간 머지 commit(`gh pr view <번호> --json mergeCommit`)으로 `.github/workflows/deploy.yml`의 실행을 찾아 끝날 때까지 본다.

```bash
gh run list --workflow deploy.yml --branch dev --limit 5
gh run view <run id> --json status,conclusion,headSha
curl -s -o /dev/null -w '%{http_code}' https://ooee-sandbox.pages.dev/<key>
```

- 실행의 `headSha`가 머지 commit과 같아야 그 실행이다.
- **`success`만으로 배포되었다고 하지 않는다.** 저장소 secret이 없으면 workflow가 경고 한 줄만 남기고 배포를 건너뛴 채 `success`로 끝난다. 화면 key마다 주소가 `200`인지가 기준이다. 없는 key는 `404`를 돌려주므로 옛 화면이 대신 열릴 걱정은 없다. 끝난 직후 `404`면 몇 번 더 본다.
- 실행이 실패했거나 주소가 끝내 `200`이 아니면 보고의 첫 제목을 「## 처리 중 실패」로 하고 멈춘다. 다시 배포하는 것(Actions에서 `Deploy`를 손으로 돌리기)은 사람이 한다.

### 8. 결과 댓글을 올린다

같은 회차를 두 번 올리지 않는다. 결과 채널에 카드가 두 번 뜬다. 먼저 이 회차의 결과 댓글이 없는지 본다.

```bash
node scripts/harness/decision.mjs <n> --round <회차>   # decision 이 「결과 없음」이어야 한다
```

`.harness-work/issue-<n>/result-<회차>.json`에 입력을 `Write`로 쓴다. 모양은 `scripts/harness/result-comment.mjs`의 `renderResultComment` 설명과 `scripts/harness/fixtures/result-input.example.json`에 있다. 값은 앞 단계에서 모은 것만 쓴다.

| 입력 | 값 |
| --- | --- |
| `issue` | `number`, `issue.mjs`의 `screenName`, `fields.requester`, `fields.projects`(요청한 그대로) |
| `round` | 처음이면 `1`, 개선이면 앞 회차 + 1 |
| `screens[]` | key, `apps/sandbox/src/screens.ts`에 등록된 `name`, 만든 프로젝트, `https://ooee-sandbox.pages.dev/<key>` |
| `pullRequest` | 6단계의 번호와 주소 |
| `summary.pagesAdded` | 이번 회차에 만든 화면 이름. `screens[].name`과 같은 글자로 적는다. 머리의 샌드박스 링크가 이 이름으로 이번 회차 화면을 고르고, 어긋나면 `result-comment.mjs`가 거부한다 |
| `summary.componentsAdded` | `@ooee/ui`에 새로 더한 컴포넌트. generate-code는 `packages/ui`를 고치지 않으므로 보통 비어 있다 |
| `summary.componentsUsed` | 매핑표의 컴포넌트 이름. 겹치지 않게 |
| `summary.other` | 그 밖에 한 일. 개선 회차면 「<앞 회차>회차 개선 반영: <사유 한 줄>」 |
| `needsDecision` | 여러 장이면 먼저 2단계 표의 화면마다 「<화면>: 요청에 없어 지어낸 것 — <지어낸 것>」. 그다음 화면마다 generate-code의 「판단이 필요한 것」·「미확정 자산 후보」, 1단계에서 답으로 정한 것과 반영하지 않은 칸. 화면 이름을 앞에 붙인다 |
| `checks` | `pnpm check`, check-screens, `/review-design` 위반 0건, sandbox 화면 검사 <N>장, `Quality`, 배포 주소 <N>장 200. 실제로 돌려 통과한 것만 적는다 |

```bash
node scripts/harness/post-result.mjs <n> .harness-work/issue-<n>/result-<회차>.json
node scripts/harness/decision.mjs <n> --round <회차>   # 「대기」와 방금 단 댓글의 주소가 나와야 한다
```

`post-result.mjs`가 「결과 댓글을 만들지 않는다: …」나 「결과 댓글을 달지 않는다: …」로 끝나면 올라가지 않은 것이니 그 줄을 보고한다. 올리기 전에 글을 보려면 `node scripts/harness/result-comment.mjs <input.json>`으로 만들기만 한다. 올린 댓글이 결과 채널에 카드로 뜬다. 마지막 판독이 「대기」가 아니면 표식이 읽히지 않는 것이니 보고에 적는다.

### 9. 멈춘다

「보고」의 꼴로 보고하고 멈춘다. 결정은 사람이 결과 댓글에 단다. 결정을 기다리며 판독을 되풀이하지 않는다. 결정이 달리면 사람이 `/process-issue 결정 <n>`으로 다시 부른다.

## 결과만 올리기

`결과 <n>`은 화면이 이미 `dev`에 머지되었는데 결과 댓글이 없는 요청에 결과 댓글만 올린다. 1단계의 「이미 처리한 요청」 검사가 멈춘 자리, 그리고 이 흐름이 생기기 전에 처리한 요청(#9 → PR #19)이 쓰는 입구다. 화면을 다시 만들지 않는다.

1. 0단계를 한다. 가지를 만들지 않으므로 `dev`에 선 채로 한다.
2. `node scripts/harness/issue.mjs <n>`으로 `screenName`과 `fields`를 읽는다. `generateArgs`가 `null`이어도 멈추지 않는다. 요청을 다시 처리하는 것이 아니다. `fields.requester`가 비었으면 묻는다.
3. `node scripts/harness/decision.mjs <n>`이 「결과 없음」이어야 한다. 아니면 이미 올린 것이니 `/process-issue 결정 <n>`을 알리고 멈춘다.
4. 1단계의 검사로 이 요청의 머지된 pull request를 찾는다. 없으면 `/process-issue <n>`을 알리고 멈춘다. 열린 것만 있으면 머지를 기다리라고 알리고 멈춘다. 머지된 것이 둘 이상이면 모두 쓰고, 결과 댓글의 `pullRequest`는 가장 늦게 머지된 것이다.
5. 화면은 그 pull request들이 더한 `apps/sandbox/src/app/<key>/page.tsx`의 key다(`gh pr view <번호> --json files`). 이름은 `apps/sandbox/src/screens.ts`의 등록에서 읽는다. 화면 코드는 열지 않는다.
6. 7단계의 주소 확인과 5단계의 sandbox 검사를 key마다 한다. 빌드는 지금 `dev`의 것이다. 머지 commit의 Deploy 실행은 찾지 않아도 된다. 지금 `dev`의 배포에서 주소가 `200`이면 된다.
7. 8단계를 `round` 1로 돈다.
   - `needsDecision`은 pull request 본문의 「판단이 필요한 것」과 2단계 표의 「지어낸 것」에서 옮긴다. 본문이 「화면별 요구사항 문단은 처리하는 쪽이 썼다」처럼 지어냈다고만 적었으면(#19) 화면마다 「<화면>: 요청에 없어 지어낸 것 — 화면 요구사항 문단 전체(요청 원문은 「<요구사항>」)」로 적는다.
   - `checks`에는 이번에 돌린 것(`pnpm check`, 주소 200, sandbox 화면 검사)과 `gh pr checks <번호>`로 본 `Quality`만 적는다. pull request 본문의 체크 표시는 옮기지 않는다. 이번에 확인한 것이 아니다.
8. 「보고」의 꼴로 보고하고 멈춘다.

## 결정 뒤

### D1. 읽는다

```bash
node scripts/harness/decision.mjs <n>
```

| `decision` | 하는 일 |
| --- | --- |
| 결과 없음 | 아직 처리 결과를 올리지 않았다. 화면이 `dev`에 있으면 `/process-issue 결과 <n>`을, 없으면 `/process-issue <n>`을 알리고 멈춘다 |
| 대기 | 결정이 아직 없다. 멈춘다 |
| 승인 | D2 |
| 반려 | D3 |
| 개선 | D4 |

- **`lookalikeAfterDecision`이 `true`면 표를 따르지 않고 묻고 멈춘다.** 「승인합니다」「반려합니다. …」처럼 결정 낱말로 시작하지만 꼴이 맞지 않아 읽지 않은 댓글(`lookalikes`)이 이긴 신호보다 늦게 있다는 뜻이다. 사람이 마지막에 밝힌 뜻이 `decision`과 다를 수 있다. 보고의 첫 제목은 「## 묻고 멈춤」이고, `lookalikes`의 주소와 글을 붙인다. 대화의 답으로 결정을 바꾸지 않는다. 결정의 기록은 결과 댓글이므로, 기획자가 반응이나 「반려: …」 꼴로 다시 남긴 뒤 `결정 <n>`을 다시 부른다.
- `note`가 있으면(사유 댓글이 아직 없다, 사유를 짐작했다, 결정처럼 보이는 댓글이 있다) 보고에 옮긴다.
- `reasonSource`는 반려·개선 사유가 어디서 왔는지다. `prefix`만 사람이 사유라고 밝힌 것(「반려: …」·「개선: …」)이고, `after`·`before`는 신호 뒤·앞에 그 사람이 쓴 댓글을 사유로 짐작한 것이다. 그 댓글이 질문이나 칭찬일 수 있다. D3·D4가 이 값으로 다르게 한다.

### D2. 승인 — dev → main pull request 를 만든다

승인은 화면 확인까지다. 제품에 넣을지는 이 승인이 정하지 않는다(ai-environment.md 「처리와 승인」).

1. `git fetch origin` 뒤 `git log --oneline origin/main..origin/dev`에서 이 요청의 pull request를 찾는다. squash commit 제목 끝의 `(#<번호>)`가 pull request 번호이고, `gh pr view <번호> --json body,files`의 본문에 `요청: #<n>` 줄(뒤에 숫자가 이어지지 않는 것)이 있으면 이 요청의 것이다. 첫 줄이 아니어도 된다. 없으면 이미 `main`에 있거나 아직 `dev`에 없다. 멈추고 보고한다.
2. **`main`은 승인된 요청만 담는다.** 같은 목록의 pull request를 하나씩 가른다.
   - 본문에 `요청: #<m>` 줄이 있으면 요청 #<m>의 화면이다. `node scripts/harness/decision.mjs <m>`이 승인이어야 한다. 반려면 D3의 되돌리기 pull request(본문에 `되돌림: #<m>` 줄)가 같은 목록에 있어야 하고, 있으면 그 요청은 빠진 것으로 친다. 그 밖(대기·개선·결과 없음, 되돌리지 않은 반려)은 섞인 것이다.
   - 본문에 `되돌림: #<m>` 줄이 있으면 D3의 되돌리기다. 막지 않는다.
   - 둘 다 없는데 화면 자리(`apps/sandbox/src/app/<key>/`)를 바꿨으면 어느 요청의 화면인지 알 수 없다. 섞인 것이다. 알아볼 수 없는 화면이 승인 없이 `main`으로 가는 것을 막는다.
   - 그 밖의 변경(하네스·문서·공용 설정)은 막지 않고 본문에 적는다.

   섞인 것이 하나라도 있으면 만들지 않고, 목록과 각각을 푸는 길을 보고한다. 결과 없음은 `/process-issue 결과 <m>`, 대기·개선은 기획자의 결정, 되돌리지 않은 반려는 `/process-issue 결정 <m>`(D3이 되돌린다), 알아볼 수 없는 화면 pull request는 그 작성자가 본문에 `요청: #<m>`을 적거나 되돌리는 것이다.
3. 이미 열린 `dev → main` pull request가 있으면(`gh pr list --base main --head dev --state open`) 새로 만들지 않는다. 그 주소와 본문에 더할 승인 줄을 보고한다. 본문을 고치는 것은 사람이다.
4. 본문을 `.harness-work/issue-<n>/main-pr.md`에 쓰고 연다. 머지는 사람이 한다.

   ```bash
   gh pr create --base main --head dev --title "dev → main: 화면 요청 #<n> 승인 — <화면 이름>" --body-file .harness-work/issue-<n>/main-pr.md
   ```

   본문 첫 줄은 `승인: #<n> <회차>회차 — <by> · <at> · <반응|댓글>`이다. 그 아래에 결과 댓글 주소, 이 pull request에 든 요청과 각각의 결정, 되돌린 요청, git-workflow.md 「dev에서 main으로 올릴 때」가 요구하는 항목을 둔다. 개선 회차를 거친 요청이면 **개선 전 회차의 화면**(다시 만들어 새 key로 대신한 앞 key)도 적는다. 승인한 화면이 아니라 그 요청의 회차 기록으로 함께 간다.

### D3. 반려 — 사유를 보고하고 이 요청의 화면을 dev 에서 뺀다

1. `reason`을 원문 그대로 보고하고 `reasonSource`와 `reasonCommentUrl`을 함께 적는다. `after`·`before`면 「사유(짐작): …」로 적는다. 반려 사유인지 사람이 본다. 비었으면 사유 댓글이 아직 없다고 적는다.
2. **이 요청의 화면을 `dev`에서 되돌린다.** 두면 D2가 이 요청 때문에 어떤 승인도 `main`으로 올리지 못한다. D2의 1과 같은 방법으로 이 요청의 squash commit을 모두 찾아(개선 회차가 있으면 회차마다 하나) 늦은 것부터 되돌린다.

   ```bash
   git switch -c feature/issue-<n>-revert
   git revert --no-edit <늦은 squash commit> … <이른 squash commit>
   pnpm check
   git push -u origin feature/issue-<n>-revert
   gh pr create --title "revert(sandbox): 화면 요청 #<n> 반려 — <화면 이름>" --body-file .harness-work/issue-<n>/revert.md
   ```

   - 0단계를 먼저 한다. `git revert`는 allowed-tools에 없어 확인을 묻는다.
   - 본문 첫 줄은 `되돌림: #<n>`이다. `요청: #<n>` 줄은 쓰지 않는다. 1단계와 D2가 이 요청의 화면 pull request로 읽는다. 그 아래에 결과 댓글 주소, 반려한 사람·시각, 사유를 둔다.
   - `Quality`를 본 뒤 6단계처럼 squash로 합친다.
   - `git revert`가 충돌하면 손으로 풀지 않는다. `git revert --abort`로 이 명령이 시작한 되돌리기만 거두고 멈춘다. 다른 요청의 화면이 `screens.ts`의 같은 자리를 고친 것이다.
3. 기록은 결과 댓글과 git 이력(squash commit과 되돌린 commit)에 남는다. 이슈를 닫는 것과 다시 요청받는 것은 사람이 한다.

### D4. 개선 — 다시 만들어 다음 회차를 올린다

1. `reason`이 비었으면 무엇을 고칠지 모르므로 멈춘다. 짐작해 고치지 않는다. `reasonSource`가 `prefix`가 아니면 사유를 짐작한 것이다. 사유 원문과 `reasonCommentUrl`을 내고 그 글을 개선 사유로 읽어도 되는지 묻고 멈춘다. 질문이나 칭찬이 사유로 잡혀 generate-code 인수에 붙는 것을 막는다. 확인받으면 이어 간다.
2. **개선은 세 번까지다.** 읽은 `round`가 `4` 이상이면 다시 만들지 않고 멈춘다. 까닭은 ai-environment.md 「처리와 승인」에 있다.
3. 사유를 그 회차 dev pull request 본문의 세 자리에 대조한다. 「판단이 필요한 것」, 2단계 표의 「지어낸 것」, 화면마다의 「검수 결과」다. 번호는 결과 댓글 작업 줄의 `PR #<번호>`, 본문은 `gh pr view <번호> --json body`다. 사유마다 가리키는 항목을 표로 낸다.
   - 가리키는 항목이 있으면 개선이다. 4로 간다. 지어낸 것을 고쳐 달라는 사유도 개선이다. 요청이 비워 둔 자리를 기획자가 채우는 일이다.
   - 어느 항목도 가리키지 않는 새 요구면 개선이 아니라 반려로 보고하고 멈춘다. 요청 문단의 원본은 이슈 본문이라, 댓글로 요구가 늘면 원본이 둘이 된다. 새 요구는 폼으로 새 요청을 받는다.
   - 가릴 수 없으면 묻고 멈춘다.
   - **이 세션에서 화면 코드를 열거나 `/ooee-harness:review-design`을 돌리지 않는다.** 4에서 부르는 generate-code는 같은 대화에서 돌므로, 여기서 읽은 앞 회차 코드가 맥락에 남아 generate-code의 「다른 화면의 코드 읽기」 금지를 우회한다. 사유가 규칙 위반을 말하는데 본문의 검수 결과로 가릴 수 없으면, 다른 세션에서 review-design을 돌려 위반 목록만 받아 오라고 묻고 멈춘다.
4. 사유가 가리키는 화면만 다시 만든다. 0단계를 하고 3단계부터 8단계까지 돈다. 1·2단계는 다시 하지 않는다. generate-code 인수는 앞 회차 pull request 본문 `## 화면별 인수`에 있는 그 화면의 인수 뒤에 `개선: <사유 원문>`을 붙인 것이다. 본문에 인수가 없으면(그 절이 생기기 전의 pull request) 묻고 멈춘다. 인수를 찾으려고 `page.tsx`를 열지 않는다. 요청 문단은 고쳐 쓰지 않고, 사유가 정한 값은 머리말에 남아야 다음 검수가 근거로 읽는다. 이미 있는 key는 generate-code가 번호를 붙인 새 key로 만들므로 앞 회차 화면은 그대로 남는다. 그 화면은 요청이 승인되면 회차 기록으로 함께 `main`에 가고(D2의 4), 반려되면 함께 되돌린다(D3).
5. 회차는 앞 회차 + 1이다. 가지 이름에 `-r<회차>`를 붙인다. 8단계 `screens`에는 이 요청의 화면을 모두 넣는다. 다시 만든 것은 새 key로, 그대로 둔 것은 앞 회차 결과 댓글의 「화면」 표에서 옮긴다. `summary.pagesAdded`에는 다시 만든 것만 `screens[].name`과 같은 글자로 넣는다. 결과 댓글 머리의 샌드박스 링크가 그 화면을 건다.

## 러너에서 돌 때

인수 끝의 `러너`는 이 Mac 의 self-hosted runner(`.github/workflows/harness.yml` → `scripts/harness/runner.mjs`)가 부른 것이다. 저장소 주인이 `2026-09-22`에 이슈가 올라오면 바로 처리하고 결정은 10분마다 읽기로 정했다. 대화할 사람이 없고, `gh pr create`·`gh pr merge`는 공용 권한의 `ask`라 headless 세션에서 거부된다(ask 는 allow 보다 먼저 판정되어 러너가 풀 수 없다). 그래서 pull request 를 만들고 합치는 것은 러너가 하고, 이 명령은 그 앞에서 넘김 파일을 쓰고 멈춘다. 순서와 규칙은 위와 같고 아래만 다르다.

- **묻고 멈춤은 그대로 멈춤이다.** 물을 사람이 없다. 보고는 러너의 실행 기록(job 요약)에 남고, 실행이 실패로 끝나 개발자에게 알림이 간다. 결과 댓글 말고 이슈에 댓글을 달지 않는 규칙도 그대로다.
- **2단계의 목록은 확인받지 않고 쓴다.** 표를 대화에 내는 대신 pull request 본문에 그대로 두고, 8단계 `needsDecision`의 첫 줄을 「러너가 확인받지 않고 나눈 화면 목록: <key>·<key>…」로 한다. 「지어낸 것」을 화면마다 옮기는 것은 그대로다. 기획자는 결과 댓글에서 보고 개선이나 반려로 고친다.
- **pull request 를 만들 자리에서 넘긴다.** 6단계, D2 의 4, D3 의 2 에서 `gh pr create`·`gh pr checks`·`gh pr merge`를 부르지 않는다. 본문 파일은 그 단계대로 쓰고, `.harness-work/issue-<n>/handoff.json`을 `Write`로 쓴 뒤 보고의 첫 제목을 「## 러너에 넘김」으로 하고 멈춘다.

  ```json
  { "issue": 12, "target": "dev", "branch": "feature/issue-12-shop", "title": "feat(sandbox): … (#12)", "bodyFile": ".harness-work/issue-12/pr-1.md", "resume": true }
  ```

  | 자리 | `target` | `branch` | 본문 첫 줄 | `resume` |
  | --- | --- | --- | --- | --- |
  | 6단계 (처음 · D4 개선 회차) | `dev` | push 한 가지 | `요청: #<n>` | `true` |
  | D3 되돌리기 | `dev` | `feature/issue-<n>-revert` | `되돌림: #<n>` | `false` |
  | D2 승인 | `main` | 적지 않는다(`dev`를 올린다) | `승인: #<n> …` | `false` |

  러너는 이 파일을 다시 검사한다(이 요청의 가지인지, 본문 파일이 이 요청의 작업 자리 안에 있고 첫 줄이 표와 맞는지). 맞지 않으면 만들지 않는다. `dev` 넘김은 Quality 를 본 뒤 squash 로, `main` 넘김은 Quality 를 본 뒤 머지 commit 으로 합친다. **승인된 요청의 `main` 머지는 러너가 한다** — 저장소 주인이 `2026-09-22`에 승인이 곧 `main` 반영이라고 정했다. D2 의 섞임 검사는 그대로 하고, 섞였으면 넘기지 않고 멈춘다. 사람이 연 세션에서는 D2 의 「머지는 사람이 한다」가 그대로다.
- **이어 받기.** `resume`이 `true`면 러너가 합친 뒤 같은 세션에 「러너: pull request #<번호> 가 dev 에 squash 로 머지되었다(머지 commit <sha>). 「러너에서 돌 때」대로 7단계부터 이어 간다.」를 보낸다. 그 번호와 머지 commit 으로 7단계(배포 확인)와 8단계(결과 댓글)를 하고 9단계에서 멈춘다. 결과 댓글의 `pullRequest`는 그 번호다.
- **D3 의 `git revert`** 는 러너가 이 명령에만 연다(`git revert --no-edit …`, `git revert --abort`). 확인을 묻지 않고 돈다. generate-code·review-design 을 Skill 로 부를 때 그 머리말의 allowed-tools 는 이 명령 안에서 적용되지 않는다. 러너가 그 둘의 머리말을 읽어 CLI 로 넘기므로, 하위 명령이 새 명령을 쓰게 되면 그 명령의 머리말에 적는다.
- 러너는 이 Mac 에 로그인한 gh·Claude 로 돌고, 모델은 머리말과 같은 `claude-sonnet-5`·`high`로 부른다.
- 러너 쪽의 입출력과 이미 처리한 결정을 거르는 방법은 `scripts/harness/README.md`의 「러너」에 있다.

## 보고

결과 댓글을 올렸으면 보고의 첫 네 줄은 결과 댓글의 첫 네 줄 그대로다. 대화에서 받는 사람도 Slack 카드와 같은 것을 먼저 본다.

```text
## 결과 댓글을 올렸다

화면 요청 #<n> 결과 · <회차>회차 — <화면 이름> · 결정은 GitHub 댓글에 👍 👎 😕
요청: <요청자> · 프로젝트 <요청한 프로젝트>
샌드박스: <이번 회차 첫 화면 주소> 외 <N>장 · 목록 https://ooee-sandbox.pages.dev/
작업: 페이지 <N>장 추가(<프로젝트>) — <화면 이름>·<화면 이름>·<화면 이름> 외 <N>장 · 새 컴포넌트 없음 · PR #<번호>

결과 댓글: <decision.mjs 의 resultCommentUrl>

## 화면
| 화면 | key | 샌드박스 |
| --- | --- | --- |

## 거친 자리
- 가지 feature/issue-<n>-<slug> · PR #<번호> (dev <머지 commit>) · Deploy 실행 <run id> · 주소 <N>장 200
- 이슈 읽기의 notes: <있을 때만>

## 판단이 필요한 것
- <결과 댓글의 「판단이 필요한 것」과 같다>

## 막힌 명령
- <명령> — <거부 메시지 첫 줄> (없으면 「없음」)

## 다음
결정은 기획자가 GitHub 의 결과 댓글에 단다. 👍 승인 · 👎 반려 · 😕 개선, 또는 「승인」 한 낱말·「반려: …」·「개선: …」 댓글. Slack 카드에 단 이모지는 읽히지 않는다. 결정이 달리면 `/process-issue 결정 <n>`.
```

멈췄으면 첫 제목은 멈춘 자리에 따라 「## 시작하지 않음」(0단계), 「## 이미 처리함」(1단계의 이미 처리한 요청), 「## 묻고 멈춤」(1·2단계, D1의 결정 같은 댓글, D4의 사유 확인·대조), 「## 처리 중 실패」(4~8단계)다. 멈춘 단계, 돌린 명령과 오류 전문, 그 단계를 맡은 명령의 보고를 그대로 붙이고, 그때까지 만든 가지·commit·pull request와 「결과 댓글은 올리지 않았다」를 적는다.

「결정 뒤」의 보고는 첫 제목이 「## 결정: <decision>」이고, 그 아래에 `decision.mjs` 출력의 `by`·`at`·`source`·`reason`·`reasonSource`·`reasonCommentUrl`·`resultCommentUrl`과, 있으면 `lookalikes`를 적는다. 그다음 한 일(만든 pull request 주소, 다시 올린 결과 댓글의 첫 네 줄)이나 멈춘 까닭을 적는다.
