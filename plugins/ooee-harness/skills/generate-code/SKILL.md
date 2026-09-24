---
name: generate-code
description: 기획자의 화면 요청을 디자인 시스템 문서와 @ooee/ui만으로 화면 코드와 테스트로 만들고 「pull request 준비 완료」에서 멈춘다. 화면을 만들어 달라는 요청에 쓴다. 인수는 「<화면 이름>. <요구사항 한 문단> 프로젝트: <id> 유형: <web, tablet, mobile> [원본: <저장소 경로>] [새 프로젝트 이름: …] [고칠 화면: <key>]」이다.
model: claude-sonnet-5
effort: high
allowed-tools: Read, Grep, Glob, Write, Edit, Bash(git status:*), Bash(pnpm --filter @ooee/sandbox exec node --import tsx --test *), Bash(pnpm --filter @ooee/sandbox test), Bash(pnpm --filter @ooee/sandbox build), Bash(pnpm check), Bash(node plugins/ooee-harness/lib/check-screens.mjs:*)
---

# /generate-code

`docs/process/ai-environment.md`가 정한 여덟 단계 가운데 ① 디자인 시스템 검색, ⑤ `@ooee/ui` 조회, ⑥ 코드 생성, ⑦ 테스트, ⑧ pull request 준비를 이 명령이 맡는다. ③ 검수는 `/review-design`의 검사 항목을 그대로 쓴다. 결과는 sandbox 에서 본다.

## 입력

`$ARGUMENTS`가 화면 이름과 요구사항이다. 예: `관리자 로그인. 왼쪽에 로그인 폼, 오른쪽에 브랜드 패널… 원본: apps/sandbox/src/app/(renewal)/renewal/admin/login/page.tsx`. 대조할 원본 코드가 있으면 요청 끝에 `원본: <저장소 경로>`로 적는다. 요구사항이 비어 있으면 무엇을 만들지 묻고 멈춘다.

- **끝의 `프로젝트: <id>` 와 `유형: <web|tablet|mobile>`은 화면이 설 자리와 폭이다.** 프로젝트는 화면 목록을 나누는 단위(「블루키 리뉴얼」 같은 일의 이름)이고, 유형은 폭이다 — 한 프로젝트에 웹 화면과 모바일 화면이 함께 있다. 유형은 `유형: web, mobile` 처럼 **여럿일 수 있다** — 그 화면이 그 폭들에서 모두 서야 한다는 뜻이다. 뒤에 `새 프로젝트 이름: <이름>`이 있으면 아직 없는 프로젝트라 「파일과 등록」에서 한 줄을 더한다.
- **끝에 `고칠 화면: <key>`가 있으면 그 화면을 제자리에서 고친다.** 새 화면을 만드는 것이 아니라 이미 있는 세 파일(`page.tsx`·`page.test.tsx`·`screens.ts` 한 줄)을 고치는 일이다. 승인되어 제품으로 간 화면을 고치는 입구이고, 주소(key)가 그대로여야 공유된 링크가 살아 있다. 아래 「파일과 등록」의 key 규칙과 「하지 않는 것」의 코드 읽기 금지에 이 경우의 예외가 있다.
- **`지어냄: …` 은 요청에 없어 부르는 쪽이 정한 것이다.** 머리말 주석에서 요청 원문과 갈라 적고, 「판단이 필요한 것」에 그대로 옮긴다. `수정: …`·`개선: …` 은 앞 인수 뒤에 붙은 이번 회차의 요구이며, 머리말 주석의 요구사항 문단을 이것으로 다시 쓴다(「파일과 등록」의 제자리 수정 규칙과 같다).
- 요구사항에 없는 것은 지어내지 않고 「판단이 필요한 것」에 적는다. 정렬·글자 크기·간격처럼 코드를 쓰려면 정해야만 하는 값은 3단계의 「정렬과 간격」을 따른다.
- 요구사항이 적은 것이 `${user_config.docs_root}`의 기준과 어긋나면 2단계의 「요구사항과 문서가 어긋날 때」를 따른다.

## 하지 않는 것

- commit, push, pull request 생성. 마지막 단계에서 멈추고 사용자가 요청할 때만 한다.
- 세 파일 밖의 수정. 고치는 파일은 `${user_config.screens_dir}/<key>/page.tsx`, 같은 디렉터리의 `page.test.tsx`, `${user_config.screens_dir}/../screens.ts` 셋뿐이다. 화면 자리의 공용 파일(`test-setup.ts`, `package.json`, `layout.tsx`, 첫 화면, `globals.css`), 다른 화면의 디렉터리, `packages/*`, `${user_config.docs_root}`, Plugin 자신은 고치지 않는다. 그쪽을 고쳐야만 검사가 통과하면 5단계의 「검사가 실패하면」을 따른다.
- 빌드 캐시 삭제(`rm -rf .next` 등)와 working tree를 되돌리는 명령(`git stash`, `git checkout`, `git reset`, `git clean`). `docs/process/tooling.md`가 적은 `apps/studio/.next` 삭제는 사람이 확인하고 하는 절차이며 이 명령은 하지 않는다.
- 막힌 명령 다시 시도하기. 권한 규칙이나 확인 요청에 막힌 명령은 경로·옵션·도구를 바꾸거나(`./` 경로, `rm -fr`, `node -e`, `dangerouslyDisableSandbox`) 같은 일을 하는 다른 명령으로 되풀이하지 않는다. 막힌 명령과 거부 메시지를 7단계 보고의 「막힌 명령」에 그대로 적는다.
- 원본 파일 읽기. `원본:` 경로는 3단계에서 `screens.ts`의 `source`에 적기만 하고 열지 않는다. `${user_config.screens_dir}/(renewal)/` 아래(블루키 리뉴얼 작업장)는 언제나 읽지 않는다. 원본과의 대조는 사람이 한다.
- 다른 화면의 코드 읽기. `${user_config.screens_dir}/<다른 key>/` 아래 파일은 열지 않는다. **`고칠 화면: <key>`로 받은 그 화면은 예외다** — 고치려면 지금 무엇이 있는지 읽어야 한다. 그 화면의 세 파일만 열고 다른 key 는 그대로 닫아 둔다. 이미 있는 화면은 고치지 않고 둔 기록일 수 있어, 참고하면 그 사례를 그대로 옮기게 된다. 예시는 `${user_config.docs_root}`과 `@ooee/ui`의 소스에서만 찾는다.
- Tailwind primitive 색(`bg-blue-700`, `text-neutral-500`, `text-white`, `bg-black`), hex 값, shadcn 토큰(`bg-background`, `text-muted-foreground`, `bg-primary`). 색은 `oe-*` semantic token 클래스만 쓴다.
- 서버 호출, 실제 제출 동작, 라우팅 로직. 제출은 `<form onSubmit={(event) => event.preventDefault()}>`까지, 목적지가 정해지지 않은 링크는 `<a href="#">`까지만 둔다. 목적지 없는 `<a href="#">`는 라우팅 로직이 아니다.

## 순서

### 0. 시작 전에 확인한다

**설정값을 먼저 확인한다.** 이 Skill은 `screens_dir`·`docs_root`·`check_command` 세 설정값으로 경로와 명령을 만든다. 본문에 `${user_config.…}`가 값으로 바뀌지 않고 그대로 보이면 설정이 비어 있는 것이다. 그때는 요청에 적힌 값을 쓰고, 요청에도 없으면 저장소에서 찾아 쓴 값을 보고의 첫머리에 적는다. 찾는 방법은 `README.md`와 `components/`를 가진 디렉터리가 `docs_root`, 화면 파일(`page.tsx`)이 모인 디렉터리가 `screens_dir`, 그 화면 앱의 `package.json`이 가진 `build`·`test` script가 `check_command`다.


```bash
git status --porcelain --untracked-files=all ${user_config.screens_dir}
```

**이 명령의 첫 도구 호출이 이것이어야 한다.** 파일을 하나라도 만든 뒤에 돌린 결과는 쓰지 않는다. 늦게 돌리면 자기가 만든 파일이 출력에 섞여 남의 변경으로 보인다.

출력이 한 줄이라도 있으면 파일을 만들지 않고 멈춘다. 다른 세션이나 사람이 같은 working tree에서 화면 자리를 고치는 중이거나, 앞선 화면이 아직 commit되지 않은 상태다. 이 상태에서 시작하면 5단계 검사가 남의 변경으로 실패하고 7단계의 「세 파일」 확인이 성립하지 않는다. 보고 첫 제목을 「## 시작하지 않음」으로 하고 출력 전문을 붙인다.

**「시작하지 않음」은 파일을 하나도 만들지 않았을 때만 쓴다.** 출력의 경로가 이번에 만들 화면의 것뿐이면 그것은 자기 산출물이므로 멈출 이유가 아니다. 0단계를 늦게 돌린 것이니 절차를 끝까지 마치고, 늦게 돌렸다는 사실을 7단계의 「판단이 필요한 것」에 적는다.

### 1. 읽는다 — ① 디자인 시스템 검색

다음을 이 순서로 읽는다. 요약본을 기억에서 꺼내지 않고 파일을 연다.

1. 저장소 루트에 `AGENTS.md`(또는 `CLAUDE.md`)가 있으면 그 「코드 소유 경계」와 「변경 원칙」. **없으면 건너뛴다** — 이 Plugin 은 저장소 밖으로 전달되고 그 문서는 전달본에 가지 않는다. 대신 아래 두 가지는 어느 저장소에서나 지킨다: 컴포넌트 구현(`packages/ui`)은 이 명령이 고치지 않는다. Plugin 자신(`${CLAUDE_PLUGIN_ROOT}`)도 고치지 않는다.
2. `${user_config.docs_root}/README.md`의 「이 문서의 독자」와 「Component」 표. 표에서 요구사항의 요소마다 쓸 컴포넌트를 고른다. 상태가 `초안`인 컴포넌트는 `packages/ui/src/index.ts`가 export해도 쓰지 않는다. 표의 용도가 한 요소에 둘 이상 맞으면(예: 하나를 고르는 항목에 `Radio`와 `Select`) 둘 다 고르고 3번에서 두 문서를 모두 연다.
3. 고른 컴포넌트마다 `${user_config.docs_root}/components/<이름>.md` 전체. Property 이름과 값은 문서에 적힌 코드 문자열 그대로 쓴다. 「역할과 경계」, 「Guidelines」, 「현재 정의하지 않은 항목」을 함께 읽고, 읽은 기준은 2단계에서 요소마다 대조한다.
4. `${user_config.docs_root}/vocabulary.md`의 「Form 구성 층」, `${user_config.docs_root}/tokens.md`의 「Neutral semantic token」·「사용 규칙」, `${user_config.docs_root}/interaction.md` 전체, `${user_config.docs_root}/quality.md` 전체, `${user_config.docs_root}/foundations/icon.md`의 「스타일 규칙」·「크기 토큰」.
5. `packages/ui/src/index.ts`. 여기서 export하지 않는 이름은 import하지 않는다.
6. `${user_config.screens_dir}/../screens.ts`와 `${user_config.screens_dir}/page.tsx`. 등록 형식과 기존 화면의 key를 본다.

컴포넌트 문서가 원본이다. 이 저장소에 Storybook·Storybook MCP는 두지 않는다 — Property 목록은 컴포넌트 문서가 코드 문자열 그대로 갖고 있고, 화면으로 보는 자리는 Studio 의 Playground 가 갖는다.

### 2. 매핑표를 적는다

코드를 쓰기 전에 대화에 표를 먼저 낸다.

| 화면 요소 | 요구사항의 낱말 | 컴포넌트와 Property | 요구사항이 정한 값 | 근거 |
| --- | --- | --- | --- | --- |
| 아이디 입력 | 아이디 입력 | `Input` `variant="filled"` `controlSize="xlarge"` `aria-label="아이디"` | placeholder 「아이디 입력」 | input.md 「Properties」 |
| 비밀번호 입력 | 마스킹, 눈 아이콘으로 보기·숨기기 | `Input` `type="password"` + `trailingElement` 버튼 | 처음 가림, 누르면 보임 | input.md 「민감한 정보는 마스킹하기」 |
| 비밀번호 찾기 | 텍스트 링크 | `<a href="#">` + `oe-*` 클래스 | 링크 | 목적지 미정 |

「요구사항이 정한 값」에는 요구사항이 그 요소에 정한 문구·기본값·선택지·최대 글자 수·필수 여부·동작·요소 종류(링크·버튼)를 빠짐없이 적고, 없으면 `-`로 둔다. 4단계 테스트가 이 칸을 그대로 옮긴다.

- 컴포넌트가 있는 요소는 반드시 그 컴포넌트를 쓴다. 같은 역할을 native 요소와 클래스로 다시 만들지 않는다.
- 컴포넌트가 없는 요소(제목, 문단, 레이아웃 상자, 링크, 로고 자리)는 native 요소에 `oe-*` 토큰 클래스를 쓴다.
- **링크와 버튼은 요구사항의 낱말을 따른다.** 요구사항이 「링크」라 부르거나 페이지 이동을 뜻하는 요소(비밀번호 찾기, 약관·정책)는 `<a>`다. 목적지가 정해지지 않았어도 `<a href="#">`로 두고 `<button>`으로 바꾸지 않는다. 목적지는 머리말 주석의 비워 둔 자리에 적는다. 링크가 버튼처럼 보여야 하면 `<Button render={<a href="…" />} nativeButton={false} role="link">`로 쓴다. `buttonVariants`로 `<a>`에 클래스만 입히지 않는다. 겉은 같아도 `data-slot`·`data-variant` 같은 Button 표식이 빠져 도구가 그 자리를 Button으로 읽지 못한다. `role="link"`는 빼지 않는다. Base UI가 버튼이 아닌 요소에 `role="button"`을 붙여 링크가 버튼으로 읽힌다. `onClick`도 `type="submit"`도 없는 `<button>`은 만들지 않는다.
- **요구사항과 문서가 어긋날 때.** 요구사항이 컴포넌트를 이름으로 지정해도(「스위치」, 「체크박스」, 「드롭다운」) 그 컴포넌트 문서의 「역할과 경계」와 「Guidelines」를 화면의 실제 동작과 대조한다. 문서가 그 자리에 다른 컴포넌트를 가리키면 문서가 가리키는 컴포넌트를 쓰고, 근거 칸에 그 절 이름을 적고, 요구사항과 다르게 골랐다는 사실을 「판단이 필요한 것」에 적는다. 예: 「긴급 요청 여부(즉시 켜고 끄는 스위치)」라도 그 값이 「요청 보내기」를 눌러야 반영되면 switch.md 「역할과 경계」에 따라 `CheckboxField`를 쓴다.
- **컴포넌트가 둘 이상 맞을 때.** 두 문서의 「역할과 경계」에서 둘을 가르는 문장을 찾아 근거에 그 문장을 적고, 문장이 가리키는 쪽을 쓴다. 가르는 문장이 어디에도 없으면 하나를 고르되 기준을 지어내지 않고, 고른 쪽·고르지 않은 쪽을 「판단이 필요한 것」에 `문서 공백:`으로 시작해 적는다.
- 요구사항이 있는데 컴포넌트가 없고 native로도 규칙에 맞게 만들 수 없는 요소는 만들지 않고 「미확정 자산 후보」에 이름·쓰임·왜 못 만드는지를 적는다.

### 3. 코드를 쓴다 — ⑤⑥

**파일과 등록**

- 위치는 `${user_config.screens_dir}/<key>/page.tsx`. `<key>`는 소문자 kebab-case 영문이다. 예: `admin-login`, `sto-support-request`.
- 고른 key가 `screens.ts`에 이미 있거나 `${user_config.screens_dir}/<key>/`가 이미 있으면 그 화면을 덮어쓰지 않고 `admin-login-2`처럼 끝에 번호를 붙인 새 key를 쓴다. `name`은 요청의 화면 이름 그대로 두고, 「판단이 필요한 것」에 「key `admin-login`이 이미 있어 `admin-login-2`로 만듦」을 적는다.
- **`고칠 화면: <key>`를 받았으면 그 key 를 그대로 쓴다.** 번호를 붙이지 않고 그 화면의 `page.tsx`·`page.test.tsx`를 고친다. `screens.ts`에는 줄을 더하지 않고 그 화면의 줄에서 `prompt`(이번 요구사항의 한 줄 요약)와 `createdAt`(오늘)만 고친다. `key`·`name`·`project`는 그대로 둔다. 그 key 가 `screens.ts`에 없으면 고칠 화면이 아니므로 만들지 않고 묻는다(「## 묻고 멈춤」).
- 제자리 수정이면 머리말 주석의 요구사항 문단도 이번 인수의 요구사항으로 **다시 쓴다.** 앞 문단을 남기고 덧붙이면 다음 검수가 어느 것을 기준으로 읽을지 알 수 없다. 고치지 않기로 한 자리는 앞 문단의 말을 그대로 옮겨 이번 문단에 담는다.
- 상태(`useState`)를 쓰면 첫 줄에 `"use client"`를 둔다. `@ooee/ui`의 Control은 소비자 쪽 `"use client"`를 전제한다.
- import는 `react`(hook), `@ooee/ui`(컴포넌트), `@remixicon/react`(아이콘, Line variant 우선), `@/lib/utils`(`cn`)만 쓴다. `next/link`·`next/navigation`은 쓰지 않는다.
- 파일 머리말 주석에 「입력」의 요구사항 문단을 **그대로** 붙여 넣는다. 줄이거나 고쳐 쓰지 않으며 선택지 목록·placeholder·기본값·Label 문구를 하나도 빠뜨리지 않는다. 그 아래에 정하지 않아 비워 둔 자리를 적는다. 단독 `/review-design`은 요청을 받지 않으므로 이 주석이 근거다.
- 인수에 `새 프로젝트 이름: <이름>`이 있으면 `screens.ts`의 `SANDBOX_PROJECTS`에 `{ id: "<프로젝트 id>", name: "<이름>", description: "<한 줄>" }` 를 더한다. `description` 은 이 프로젝트가 무엇인지 한 줄이고, 요청에 없으면 「<이름> 화면입니다.」로 둔다. 이미 그 `id` 가 있으면 더하지 않는다.
- `${user_config.screens_dir}/../screens.ts`의 `sandboxScreens`에 한 줄을 더한다. `project` 는 인수의 `프로젝트:` 값, `viewports` 는 `유형:` 의 값들을 배열로(`["web", "mobile"]`) 그대로다. **이 등록이 빠지면 화면이 목록에 뜨지 않는다.** 7단계의 「변경 파일」에 이 파일이 없으면 등록을 빠뜨린 것이다. `prompt`는 요청의 한 줄 요약, `createdAt`은 오늘 날짜다. 요청에 `원본:`이 있으면 그 경로를 `source`에 그대로 적고, 없으면 `source`를 두지 않는다.

  **`project` 는 화면 목록을 나누는 자리다.** 인수의 `프로젝트:` 값을 그대로 쓴다. 없고 요청만으로 가릴 수 없으면 보고의 첫 제목을 「## 묻고 멈춤」으로 하고, 고를 수 있는 값과 각각을 고르면 어디에 서는지를 적는다. 화면이 늘어날수록 목록이 길어지는데 잘못 묶으면 되돌리는 값이 크기 때문이다.

**색과 경계**

- 색은 `oe-*` 토큰 클래스만 쓴다. 자주 쓰는 것: `text-oe-foreground-primary`·`-secondary`·`-tertiary`·`-placeholder`·`-inverse`, `bg-oe-background-primary`·`-secondary`·`-bold-primary`, `bg-oe-brand-background-bold-primary`, `text-oe-brand-foreground-primary`, `hover:bg-oe-interaction-hover`.
- 테두리는 역할로 고른다. 상자의 외곽과 Control 경계는 `border-oe-border-primary`, 영역 안의 약한 divider와 여러 폼 요소를 감싸는 낮은 위계의 container는 `border-oe-border-secondary`다(tokens.md 「Neutral semantic token」·「사용 규칙」).

**Focus**

- 경계가 없는 native `<a>`·`<button>`은 `interaction.md` 「Focus 선과 Ring」의 유형 3이다. `outline-none focus-visible:ring-2 focus-visible:ring-oe-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-oe-background-primary`를 붙인다. `packages/ui/src/button.tsx`의 `DETACHED_FOCUS`와 같은 문자열이다. `ring-offset-2`가 빠지면 간격이 없어 유형 3이 아니다. `bg-oe-background-secondary` 위에 놓이면 `ring-offset-oe-background-secondary`로 바꾼다.
- 예외: `Input`의 `trailingElement`처럼 컴포넌트 Container 안에 넣는 아이콘 버튼은 그 컴포넌트의 Clear button과 같이 offset 없이 `outline-none focus-visible:ring-2 focus-visible:ring-oe-focus-ring`을 쓴다.
- `Button`으로 그린 링크는 Focus 표시를 이미 갖고 있으므로 덧붙이지 않는다.

**아이콘**

- 크기는 `size-oe-icon-small`처럼 `size-oe-icon-*` 토큰으로 준다. `size-4`·`h-4 w-4` 같은 숫자를 쓰지 않는다(icon.md 「크기 토큰」). `Button`의 `leadingIcon`, `Input`의 `leadingElement`처럼 컴포넌트가 크기를 정하는 자리에는 크기 클래스를 주지 않는다.
- 글자를 대신하지 않는 아이콘에는 `aria-hidden="true"`를 준다.
- 클릭 가능한 아이콘은 hover 층과 Focus를 함께 갖는다(icon.md 「스타일 규칙」). Input 안의 보기 전환 같은 action은 `<button type="button" aria-label="…" className="grid size-6 place-items-center rounded-md text-oe-foreground-tertiary transition-colors hover:bg-oe-interaction-hover hover:text-oe-foreground-primary outline-none focus-visible:ring-2 focus-visible:ring-oe-focus-ring">`이다. `Button`에는 24px 단계가 없으므로 Input 안에 넣지 않는다.

**크기와 이름**

- 한 줄 Control의 높이는 `controlSize`로 정하고 `h-12` 같은 값을 쓰지 않는다. 배경이나 경계로 상자 모양을 낸 native 버튼·링크에 높이가 필요하면 `h-oe-control-*`와 `rounded-oe-control`을 쓴다. 상자가 없는 글자 링크와 Input 안 아이콘 버튼은 높이를 주지 않고 Focus ring 모서리로 `rounded-sm`·`rounded-md`를 쓴다.
- 보이는 Label이 없는 입력에는 `aria-label`을 준다. Placeholder는 이름을 대신하지 못한다. 아이콘만 있는 버튼에도 `aria-label`을 준다.
- `Select`·`InputButton`의 `placeholder`는 고를 값의 종류를 말하는 키워드로 쓰고 Field label을 그대로 반복하지 않는다(select.md 「Guidelines」, 예: Label 「관심 지역」에 `지역 선택`). 값이 비는 `Select`에는 한국어 `placeholder`를 준다. `defaultValue`가 있는 `Select`에는 `placeholder`를 두지 않는다.
- 폼 한 칸에 Label·도움말·오류가 필요하면 `Field`로 감싼다. 모바일 폼의 한 줄 Control은 `controlSize="large"` 이상을 쓴다(field.md).

**문구**

- 문구는 한국어로 쓴다. 요청이 「」로 정한 문구는 영어라도 그대로 쓴다. `Copyright © {브랜드명}. All rights reserved.` 같은 저작권 관용구도 같다.
- 시스템명·브랜드명처럼 환경설정이 소유하는 값은 `{환경설정 시스템명}`처럼 중괄호로 자리만 둔다.

**화면 폭, 정렬과 간격**

폭은 인수의 `유형:` 이 정한다. 요청 문단이 폭을 따로 말하면 그 말이 이긴다.

- `유형: web` — 뷰포트를 그대로 쓴다. `min-h-dvh`는 최상위 레이아웃 상자 한 곳에만 둔다. 검사는 1440x900 이다.
- `유형: tablet` — 뷰포트를 그대로 쓰되 태블릿 가로(1024x768)에서 한 화면에 들어오게 짠다. 상자를 두르지 않는다. 가로로 넓은 표·목록은 그 폭에서 가로 스크롤이 나지 않아야 한다.
- `유형: mobile` — 아래의 모바일 상자를 두른다. 검사는 390x844 이다.
- **유형이 여럿이면(`유형: web, mobile`) 상자를 두르지 않고 반응형으로 짠다.** 뷰포트를 그대로 쓰고 `sm:`·`md:`·`lg:` 로 폭마다 배치를 바꾼다 — 좁은 폭에서는 한 열, 넓은 폭에서는 옆으로. 고른 폭마다 가로 넘침이 없어야 하고, 검사도 폭마다 한 번씩이다. sandbox 의 「보기 폭」 전환이 같은 화면을 세 폭으로 바꿔 보이므로 폭마다 따로 만들지 않는다.
- 모바일 앱 화면은 Studio의 `MobileWebView`와 같은 모양으로 세운다. 바깥 상자 `min-h-dvh bg-oe-background-secondary` 안에 `mx-auto flex min-h-dvh w-full max-w-[390px] flex-col bg-oe-background-primary border-oe-border-secondary sm:border-x`를 둔다. 기기 모형이 아니므로 둥근 모서리와 그림자를 두르지 않고 높이를 고정하지 않는다.
- 글자와 덩이의 가로 가운데 정렬(`text-center`, 세로 방향 flex의 `items-center`, 가로 방향 flex의 `justify-center`)은 요청이 가운데라고 말한 요소에만 쓴다. 요청이 한 요소에만 준 정렬(예: 「Footer는 가운데 정렬」)을 다른 요소로 옮기지 않는다. 정렬을 말하지 않은 제목·문단·폼 요소·링크는 왼쪽 정렬로 둔다. 「폼을 남은 높이의 가운데에 세운다」는 상자의 위치이지 상자 안 글자의 정렬이 아니다. 한 줄에 놓인 요소끼리 세로 가운데를 맞추는 가로 방향 flex의 `items-center`는 이 규칙의 대상이 아니다.
- `${user_config.docs_root}`이 크기를 정한 자리(App Header의 Title 등)는 그 문서를 따른다. 그 밖에 요청이 말하지 않아 스스로 정한 값(화면 제목의 `text-*`·`font-*`, 폼 요소 사이 `gap-*`, 덩이 사이 `mt-*`)은 코드에 쓰되 「판단이 필요한 것」에 「제목 `text-2xl font-semibold`, 폼 `gap-3` — 요청에 없어 정함」처럼 한 줄로 적는다.

### 4. 테스트를 쓴다 — ⑦

`${user_config.screens_dir}/<key>/page.test.tsx`. 첫 줄은 그 자리의 JSDOM 설정을 부르는 import(이 저장소는 `import "@/test-setup"`), 실행기는 `node:test`, 렌더는 `@testing-library/react`, JSX를 쓰므로 `import React from "react"`를 둔다. 테스트 이름과 `assert` 실패 메시지는 한국어로 쓴다. 이름에 한글이 없으면 5단계의 화면 규칙 검사가 실패한다. 검사할 것은 넷이다.

1. 화면 제목이 `heading`으로 잡힌다.
2. 매핑표의 상호작용 요소마다 접근 가능한 이름으로 찾아진다. Control만이 아니라 native `<button>`·`<a>`로 만든 요소도 모두 포함한다. role은 요구사항의 낱말에서 정한다. 입력은 `getByLabelText(이름)`, 「버튼」은 `getByRole("button", { name })`, 「링크」는 `getByRole("link", { name })`이다.
3. 제출 버튼이 있고 이름이 요구사항의 문구와 같다.
4. 매핑표 「요구사항이 정한 값」 칸에서 렌더 결과로 확인할 수 있는 값(문구, 선택지, 기본값, 필수 여부, 입력 종류, 요소 종류, 최대 글자 수, 동작 뒤 바뀌는 상태)마다 assert 하나로 그대로 렌더되는지 본다. 크기·폭·배치·색처럼 JSDOM이 계산하지 않는 시각 값은 테스트하지 않으며, 칸에서 그 값 뒤에 `(시각)`을 붙여 테스트하지 않은 값임을 드러낸다. 칸이 `-`인 요소만 건너뛴다. 마스킹 입력은 처음 `type="password"`, 보기 전환은 `fireEvent.click` 뒤 `type="text"`와 바뀐 `aria-label`, 스위치·체크박스의 기본 상태는 `aria-checked`, 선택의 기본값은 Trigger에 보이는 문구, 글자 수 표시는 `getByText("0/최대")`, 필수 항목은 `Input`·`Textarea`의 `required` 또는 `Select`의 `aria-required="true"`, placeholder는 `getByPlaceholderText`, 링크는 `getByRole("link", { name })`다. 요구사항에 없는 값은 검사하지 않는다.

### 5. 검사한다

```bash
${user_config.check_command}
node ${CLAUDE_PLUGIN_ROOT}/lib/check-screens.mjs --screens ${user_config.screens_dir} --docs ${user_config.docs_root} --only <key>
```

`check_command`는 세미콜론으로 이어 붙인 여러 명령일 수 있다. 하나씩 나눠 돌리고 각각의 종료 코드를 따로 본다.

**이 화면의 테스트 하나만 돌릴 때는 그 package 안에서 돌린다.**

```bash
pnpm --filter @ooee/sandbox exec node --import tsx --test src/app/<key>/page.test.tsx
```

저장소 뿌리에서 `node --import tsx --test <screens_dir>/<key>/page.test.tsx` 로 돌리면 `@/test-setup` 같은 경로 별칭이 풀리지 않아 실패한다. 별칭은 그 package 의 `tsconfig` 가 갖는다(`2026-09-24` #75 가 여기서 멈췄다). 경로는 `--filter` 가 그 package 로 들어간 뒤의 상대 경로다.

**Plugin 이 저장소 안에 있으면 상대 경로로 부른다** — `node plugins/ooee-harness/lib/check-screens.mjs …`. 이 명령의 머리말 `allowed-tools` 가 그 꼴로 열려 있고, 러너는 그 머리말을 `--allowedTools` 로 넘긴다. 절대 경로(`${CLAUDE_PLUGIN_ROOT}` 가 편 것)로 부르면 그 규칙에 걸리지 않아 막힌다(`2026-09-23` #60·#62). 저장소 밖에 설치했으면 절대 경로를 쓰고, 그때는 설치한 저장소의 `permissions.allow` 가 열어야 한다.

화면 규칙 검사가 승인 요청에 막히면 그 자리에서 멈추고 「막힌 명령」에 적는다. 경로 표기를 절대에서 상대로 바꿔 다시 돌리는 것도 「막힌 명령 다시 시도」다. 이 명령을 늘 쓰려면 설치한 저장소가 `permissions.allow`에 한 줄을 두어야 하며, 그 줄은 Plugin의 `README.md`에 있다.

**한 줄에 명령을 여러 개 묶지 않는다.** `A && B`, `A; B`, `for … do … done` 처럼 묶으면 권한 검사가 그 줄 전체를 모르는 명령으로 보아 거부한다. 한 번에 하나씩 돌린다.

**고치는 동안에는 이 화면의 것만 돌린다.** 화면 테스트와 화면 규칙 검사는 몇 초면 끝나고, `check_command`(이 저장소 기본값은 sandbox build·test·`pnpm check` 셋 — 그중 `pnpm check` 가 저장소 전체를 본다)는 저장소 전체를 보느라 서너 분이 든다. 고칠 때마다 전체를 돌리면 그 시간이 그대로 쌓인다 — `2026-09-23` #60 은 전체 검사를 네 번 돌려 15분가량을 여기 썼다.

**`check_command` 는 마지막에 한 번, 많아야 두 번이다.** 화면의 것이 모두 통과한 뒤 한 번 돌리고, 거기서 나온 것을 고쳤으면 확인으로 한 번 더 돌린다. 세 번째가 필요하면 그 화면만으로는 풀리지 않는 문제이므로 5단계의 「검사가 실패하면」으로 간다. pull request 를 올리면 `Quality` 가 같은 것을 다시 돌리고 러너가 그 결과를 기다렸다 합치므로, 로컬에서 더 도는 것은 같은 답을 다시 사는 일이다.

**`check_command` 가 도구의 제한(10분) 안에 끝나지 않으면 그것은 돌리지 못한 것이다.** 배경으로 밀어 두고 기다리지 않는다 — 기다리는 도구(`Monitor`·`sleep`·until 루프)는 허용 목록 밖이라 거부되고, 러너 세션은 이 차례가 끝나면 함께 끝나 나중에 올 알림을 받을 수 없다(`2026-09-23` #75 가 그렇게 멈췄다). 그때는 **「돌리지 못했다」를 보고의 「검사」에 적고 그대로 다음 단계로 간다.** 좁은 검사 셋(화면 테스트·화면 규칙 검사·sandbox 빌드)이 통과했으면 화면은 설 수 있고, 저장소 전체가 성한지는 pull request 의 `Quality` 가 본다. 그것이 실패하면 러너가 합치지 않고 멈춘다 — 판정이 늦어질 뿐 놓치지 않는다.

모두 통과할 때까지 「하지 않는 것」의 세 파일을 고친다. `check_command` 는 화면 자리 밖까지 함께 보는 자리다.

`check-screens.mjs`는 `/review-design` 검사 항목 가운데 기계로 가를 수 있는 것(1·2·3의 버튼·5·12·13·14와 머리말, 테스트 이름)을 새 화면에서 본다. 위반이 있으면 `L<행> [<항목>] <내용>`으로 적고 0이 아닌 코드로 끝난다. 그 줄이 가리키는 자리를 `page.tsx`에서 고친다. 이 검사가 통과해도 6단계 검수는 그대로 한다. `--only`를 빼면 모든 화면을 본다.

**검사가 실패하면.** 세 파일을 고쳐도 통과하지 않거나 오류의 파일 경로가 세 파일 밖이면(예: `apps/studio/.next/dev/types/validator.ts`, 다른 화면의 `page.test.tsx`), 원인이 자기 변경과 무관해 보여도 그 파일을 고치지 않고 캐시도 지우지 않는다. 6단계는 그대로 하고, 7단계의 보고 첫 제목을 「## 검사 실패」로 바꿔 낸다. 원인은 추정이라고 밝힌다.

### 6. 검수한다 — ③

`${CLAUDE_PLUGIN_ROOT}/skills/review-design/SKILL.md`의 「읽는다」와 「검사 항목」을 새로 만든 `page.tsx`에 그대로 적용해 위반 목록을 낸다. 위반이 0건이 될 때까지 고치고 다시 검수한다.

`/review-design`은 요청 문장을 보지 않는다. 검수와 별도로 요청 문장을 한 문장씩 코드와 대조해, 요청에 없는데 코드가 정한 것(정렬·크기·간격)과 요청에 있는데 코드에 없는 것을 「판단이 필요한 것」에 적는다.

### 7. 보고한다 — ⑧ pull request 준비 완료

commit하지 않은 working tree 그대로 두고 아래를 대화에 낸다. 5단계의 셋이 모두 통과했을 때만 첫 제목이 「## pull request 준비 완료」이며, 하나라도 실패했으면 「## 검사 실패」다.

확인 사항은 5단계에서 마지막으로 돈 `check_command` 결과로 채운다. 6단계에서 `page.tsx` 를 고쳤으면 몇 초면 끝나는 화면 테스트와 check-screens 만 다시 돌리고 `check_command` 는 다시 돌리지 않는다 — 5단계의 「마지막에 한 번, 많아야 두 번」과 같은 셈이고, 저장소 전체는 pull request 의 `Quality` 가 다시 본다. 보고 직전에 `git status --porcelain --untracked-files=all` 을 돌린다.

- 명령 줄은 그 실행의 종료 코드가 0일 때만 `[x]`다. 테스트가 1건이라도 `not ok`이거나 「내 변경과 무관」해 보여도 `[ ]`이며, 괄호 단서를 붙여 `[x]`로 두지 않는다. `[ ]` 줄 옆에는 오류 메시지 첫 줄을 그대로 적는다.
- 「세 파일 밖을 고치지 않았다」는 `git status` 출력의 경로가 세 파일(새 디렉터리 안의 두 파일과 `screens.ts`)뿐일 때만 `[x]`다. 출력은 「변경 파일」에 원문 그대로 붙인다.
- 보고 본문이 「아래 절」을 가리키면 그 절이 실제로 있어야 한다.

```text
## pull request 준비 완료

제목: feat(sandbox): <화면 이름> 화면 추가

## 무엇을 변경했나요?
- <screens_dir>/<key>/page.tsx — <한 줄>
- <screens_dir>/<key>/page.test.tsx — <한 줄>
- <screens_dir>/../screens.ts — 등록

## 매핑표
<2단계의 표>

## 검수 결과
/review-design 위반 0건.

## 판단이 필요한 것
- <요청과 다르게 고른 컴포넌트, 요청에 없어 정한 값, `문서 공백:` 항목>

## 미확정 자산 후보
- <이름> — <쓰임> — <왜 못 만드는지>

## 막힌 명령
- <명령> — <거부 메시지 첫 줄> (없으면 「없음」)

## 변경 파일
<git status --porcelain --untracked-files=all 출력 원문>

## 확인 사항
- [ ] <check_command 의 명령들>
- [ ] check-screens (화면 규칙)
- [ ] 세 파일 밖을 고치지 않았다
- [ ] 확정되지 않은 결정을 Stable 자산으로 승격하지 않았다
- [ ] 비밀번호, API key, 개인 경로를 포함하지 않았다

commit·push·pull request는 요청하시면 만듭니다.
```
