---
name: design-page
description: apps/sandbox에 만든 화면을 Figma 프레임으로 옮기고(②), 사람이 Figma에서 고친 것을 다시 읽어 화면 코드로 되돌린다(④). 색은 oe 토큰 변수에, 글자는 oe 텍스트 스타일에 묶는다. 「<화면>을 Figma로」와 「Figma에서 고친 것을 코드로」 요청에 쓴다. 인수는 「<sandbox key> [상태: <이름>=<JS>]... [fileKey: <Figma file key>] [새 버전]」 또는 「되읽기 <sandbox key> fileKey: <key> [프레임: <이름>]」이다.
allowed-tools: Read, Grep, Glob, Write, Edit, Bash(curl:*), Bash(pnpm --filter @ooee/sandbox dev:*), Bash(pnpm --filter @ooee/sandbox build:*), Bash(pnpm --filter @ooee/sandbox test:*), Bash(node scripts/figma/prepare.mjs:*), Bash(node scripts/figma/reread.mjs:*), mcp__figma__create_new_file, mcp__figma__use_figma, mcp__figma__get_screenshot
---

# /design-page

`docs/process/ai-environment.md`의 ② Figma 화면 생성과 ④ 재조회다. 코드로 먼저 만든 화면을 Figma에 검토용 캔버스로 올리고(②), 사람이 그 위에서 고친 것을 다시 읽어 화면 코드로 되돌린다(④). **Figma가 원본이 되지 않는다.** 되돌릴 수 있는 것은 `docs/process/figma-component-map.md`가 정한 자리뿐이고, 나머지는 코드를 그대로 두고 사람에게 묻는다. 절차의 근거는 `docs/process/figma-page-agent.md`의 규칙과 `scripts/figma/README.md`다.

`$ARGUMENTS`가 「되읽기」로 시작하면 ④, 아니면 ②다.

`figma-page-agent.md`의 규칙 1~3과 「제작과 검수」 1~3(컴포넌트 모음 읽기, 모음이 없으면 요청, 컴포넌트·토큰 대응 정리)은 이 명령보다 앞에서 채워진다. Figma에는 `@ooee/ui`를 반영한 컴포넌트 모음이 없고(`ai-environment.md` 「스파이크 결과」의 R1), 그 자리는 `docs/system/README.md`의 「Component」 표가 맡는다. 컴포넌트 선택은 `/generate-code`가, 재사용 검사는 `/review-design`이 이미 했다. 이 명령은 그 코드의 `data-slot`을 레이어 이름으로, class의 `oe-*` 이름을 변수로 옮길 뿐이므로 컴포넌트 모음을 다시 묻지 않는다.

## 입력

`$ARGUMENTS`의 첫 낱말이 `apps/sandbox/src/screens.ts`의 `key`다. key가 없으면 멈추고 등록된 key 목록을 보여 준다.

- **`상태:`** 기본 화면 말고 더 옮길 상태다. `상태: <이름>=<브라우저 JS>`로 적고 여러 개면 반복한다. 이름은 첫 `=`까지이므로 이름에 `=`를 쓰지 않고, 상태마다 이름이 달라야 한다. 이름만 있고 JS가 없으면 `apps/sandbox/src/app/<key>/page.tsx`를 읽고 JS를 직접 쓴다. JS 규칙은 다음과 같다.
  - 대상은 `nth-child` 대신 보이는 글자나 `aria-label`로 찾는다. 예: `[...document.querySelectorAll("tbody tr")].find((r) => r.textContent.includes("주문이 자꾸 밀려요")).click()`.
  - 문자열은 큰따옴표만 쓴다. 명령줄에서 `--state` 값 전체를 작은따옴표로 감싸기 때문이다.
  - 쓴 JS는 보고에 그대로 적는다.
- **`상태:`가 없으면** 기본 화면 하나만 옮기고 묻지 않는다. 화면 머리말 주석에 열리고 닫히는 부분(패널, 팝업)이 있으면 보고의 「알려진 차이」에 「옮기지 않은 상태: <이름>」으로 적는다.
- **`fileKey:`** 가 있으면 그 파일에 이어서 그린다. 화면 이름과 같은 페이지를 쓰고(없으면 만든다), 그 페이지에서 이번에 그릴 프레임과 **이름이 정확히 같은** 프레임만 지우고 다시 그린다. 이름을 바꿔 둔 사람의 수정본(예: `… (수정안)`)과 다른 화면의 페이지는 건드리지 않는다. 지운 프레임 이름은 build 결과의 `replacedFrames`에 나오며 보고에 적는다.
- **`새 버전`** 또는 「다른 시안」 요청이면 `fileKey:`가 있어도 쓰지 않고 새 파일을 만든다. 준비 명령에 `--version`을 붙인다.

## 하지 않는 것

- 저장소 코드 수정과 `.figma-work/` 밖에 파일 쓰기. 이 명령은 `.figma-work/`만 쓴다. 대조용 스크립트나 이미지를 `/tmp` 같은 다른 자리에 만들지 않는다. 화면이나 `scripts/figma/`가 틀렸으면 고치지 않고 보고에 적는다.
- 막힌 명령 다시 시도하기. 권한 규칙이나 확인 요청에 막힌 명령은 경로·옵션·도구를 바꿔 되풀이하지 않고 보고의 「확인이 필요한 것」에 명령과 거부 메시지를 적는다.
- BKDS·공차 ERP 같은 다른 Figma 라이브러리의 컴포넌트·변수·스타일 사용. ooee-ui와 다른 시스템이다.
- 색이나 글자 크기를 Figma에서 직접 입력하기. 모든 칠은 `oe color`·`oe primitive` 변수, 모든 글자는 `oe/text-*` 스타일이다.
- DOM의 감싸개를 그대로 Frame으로 옮기기. **배치하는 곳만 Frame이다.** 글자 하나만 감싼 상자와 그대로 통과시키는 상자는 `prepare.mjs`가 없애고, 칠·테두리만 있는 잎은 Rectangle로 만든다. `data-slot`이 붙은 컴포넌트 노드는 되짚기의 근거라 접지 않는다. 규칙은 `scripts/figma/README.md`의 「Figma에서 무엇이 Frame이 되나」에 있고, 접은 수는 manifest의 `folded`에 나온다. 보고의 「연결」에 그 수를 적는다.
- Pretendard가 아닌 글꼴을 새로 고르기. 승인된 대체는 `scripts/figma/setup-text-styles.js`의 Noto Sans KR 하나뿐이다.
- `projectId` `651781449` 없이 파일을 만들거나, 만들기에 실패한 뒤 다른 위치에 만들고 완료라고 말하기.
- `use_figma`에 넘기는 코드를 줄이거나 고치기. 단계마다 내용 해시를 검사하므로 한 글자라도 바뀌면 그 단계가 `error`로 끝난다.

## 순서

### 1. 도구를 확인한다

이 세션에 `mcp__figma__use_figma`, `mcp__figma__create_new_file`, `mcp__figma__get_screenshot`이 있는지 본다. 없으면 멈추고 알린다: 「Figma MCP가 이 세션에 없습니다. `claude mcp add --transport http --scope user figma https://mcp.figma.com/mcp`로 등록하고 `/mcp`에서 로그인한 뒤 Claude Code를 다시 여세요.」

headless로 돌릴 때는 `claude -p "/design-page <key> …" --output-format text --model sonnet --allowedTools "Read" "Grep" "Glob" "Write" "Bash(curl*)" "Bash(pnpm --filter @ooee/sandbox dev*)" "Bash(node scripts/figma/prepare.mjs*)" "mcp__figma" < /dev/null`로 띄운다. `--allowedTools`는 뒤따르는 인수를 모두 먹으므로 프롬프트를 그 앞에 둔다.

### 2. 화면을 띄운다

`curl -s -o /dev/null -w '%{http_code}' http://localhost:3001/<key>`가 `200`이 아니면 `pnpm --filter @ooee/sandbox dev`를 background로 띄우고 200이 될 때까지 기다린다. 이 명령이 띄운 서버는 마지막에 끈다.

### 3. 준비한다

```bash
node scripts/figma/prepare.mjs --key <key> --name "<screens.ts의 name>" [--state '<이름>'] [--state '<이름>=<JS>']... [--width 390 --height 844] [--version]
```

- `--state`를 하나라도 줄 때는 첫 `--state`에 기본 화면 이름(예: `목록`)만 JS 없이 둔다.
- 화면 코드가 `max-w-[390px]` 모바일 뷰로 서 있으면(`.claude/skills/generate-code/SKILL.md` 「화면 폭」) `--width 390 --height 844`를 준다. 그 밖에는 기본값 1440×900이다.
- 명령이 0이 아닌 코드로 끝나면 멈추고, 돌린 명령과 오류 전문을 보고한다. `scripts/figma/`나 상태 JS를 고쳐 다시 돌리지 않고 단계 파일을 손으로 만들지 않는다.
- 출력의 `unresolvedColors`·`unknownIcons`가 0이 아니면 멈추고 manifest의 `unresolvedColors`·`unknownIcons` 목록을 보고한다. 이름을 찾지 못한 색은 Figma에서 변수에 묶을 수 없다.
- `.figma-work/<key>/manifest.json`을 읽는다.

### 4. 파일을 정한다

- `fileKey:`가 있고 `새 버전`이 아니면 그 파일을 쓴다.
- 아니면 `mcp__figma__create_new_file`을 `fileName`에 manifest의 `fileName`, `planKey` `team::1395716714983274137`, `editorType` `design`, `projectId` `651781449`로 부른다. 실패하면 원인을 알리고 멈춘다. manifest의 `fileName`은 `.figma-work/files.json`에 이미 있는 이름이면 끝에 ` · v2`처럼 버전이 붙어 있다.
- 새 파일을 만들었으면 `.figma-work/files.json`(JSON 배열, 없으면 `[]`)을 `Read`로 읽고 `{ "fileName": …, "fileKey": …, "createdAt": "YYYY-MM-DD" }` 하나를 더해 `Write`로 쓴다. 다음 실행이 같은 이름을 피하는 근거다. `Write`는 이 파일에만 쓴다.
- `create_new_file`은 파일이 들어간 폴더를 돌려주지 않고 폴더 안의 파일을 나열하는 도구도 없다. 새 파일이면 보고에 폴더 확인 줄을 적는다.

### 5. Figma에 넘긴다

manifest의 `steps`를 **순서대로** 하나씩 처리한다. 단계마다:

1. `Read`로 그 파일을 **처음부터 끝까지** 읽는다.
2. `mcp__figma__use_figma`를 `fileKey`, `description`에 manifest의 `description`, `code`에 읽은 내용을 **그대로** 넣어 부른다. Read가 붙이는 줄 번호는 넣지 않는다.
3. 결과에 `error`가 있으면 멈추고 그 단계 이름과 결과 전문을 보고한다. 「조각 내용이 바뀌었다」 오류만은 같은 단계를 1번부터 한 번 더 한다. 두 번째도 같으면 멈춘다.
4. build 단계의 결과에서 `unmappedColors`·`unmappedText`·`weightFallback`·`defaultTextColor`·`opacityOnToken`·`replacedFrames`·`instanceMiss`를 모아 둔다. 멈추지는 않는다.

### 6. 검사한다

마지막 audit 단계의 결과가 검사다. 다음을 모두 만족해야 완료다.

- `missingFrames`가 비어 있다.
- 모든 프레임에서 `unboundPaints`가 비어 있다(모든 칠이 변수에 묶였다).
- 모든 프레임에서 `textsWithoutStyle`이 비어 있다(모든 글자가 텍스트 스타일이다).
- 모든 프레임에서 `rootWithoutFill`이 `false`다(루트 프레임에 바탕 칠이 있다). 칠이 없는 루트는 `unboundPaints`에 잡히지 않는다.
- 5단계에서 모은 `unmappedColors`·`unmappedText`·`defaultTextColor`가 비어 있다.
- `--instances`로 돌렸다면 5단계에서 모은 `instanceMiss`가 비어 있다. 인스턴스로 놓을 자리는 안쪽을 단계에 싣지 않으므로, 컴포넌트를 찾지 못하면 그 자리가 빈 상자로 그려진다. 비어 있지 않으면 「검사 실패」로 보고하고, 카탈로그(`/design-page 카탈로그`)를 그 파일에 먼저 올린 뒤 다시 돌린다.

하나라도 어기면 「완료」라고 쓰지 않고 「검사 실패」로 보고한다. `opacityOnToken`은 완료를 막지 않는다. 코드가 `border-[var(--brand-500)]/30`처럼 색에 투명도를 붙여 쓴 자리를 그대로 옮긴 것이지만 `figma-page-agent.md` 규칙 5(토큰에 임의 투명도 금지)와 부딪치므로 「확인이 필요한 것」에 적는다.

### 7. 눈으로 대조한다

프레임마다 `mcp__figma__get_screenshot`(`fileKey`, audit 결과의 `id`, `maxDimension` 1440)을 부른다. 결과의 `image_url`은 보고의 미리보기에 쓴다. manifest `browserScreenshots`의 같은 순서 이미지를 `Read`로 열고, Figma 쪽 이미지는 `curl -sL -o .figma-work/<key>/figma-<순서>.png "<image_url>"`로 내려받아 `Read`로 연다. 둘을 **덩이별로**(내비게이션·머리글·필터·표·패널·바닥글처럼 화면의 큰 덩이마다) 대조해 빠진 요소, 겹침, 잘린 글자, 크게 어긋난 위치, 빠진 테두리·배경을 찾는다. 덩이마다 **바탕색이 같은지**(흰색인지 회색인지)를 먼저 본다. Figma 스크린샷에서 칠이 없는 투명한 자리는 흰색이 아니라 옅은 회색 캔버스로 보이므로, 브라우저에서 흰 자리가 Figma에서 회색이면 바탕이 빠진 것이다. 찾은 것은 「대조에서 찾은 것」에 덩이 이름과 함께 적는다.

다음은 「대조에서 찾은 것」이 아니라 「알려진 차이」에 한 줄씩만 적는다.

- 글꼴 대체로 생긴 글자 폭 차이와 그 때문에 끝 글자가 조금 잘리는 자리
- 그림자(`shadow-*`): 옮기지 않는다. oe 토큰에 그림자 색이 없다
- 레이어 이름: `data-slot`, 없으면 role, 없으면 태그 이름이라 `div`·`td`·`span`이 많다
- 컴포넌트는 기본적으로 인스턴스가 아니라 프레임이다(Code Connect 없음). `--instances`로 돌린 자리만 카탈로그 컴포넌트의 인스턴스다

### 8. 보고한다

```text
## Figma 옮기기 완료

파일: https://www.figma.com/design/<fileKey>
폴더: projectId 651781449로 만들었다. 도구로는 위치를 확인할 수 없어 https://www.figma.com/files/team/1395716714983274137/folder/651781449 에서 확인이 필요하다 (새 파일일 때만)
페이지: <화면 이름>
프레임:
- <이름>: https://www.figma.com/design/<fileKey>?node-id=<id의 `:`를 `-`로 바꾼 값> · 미리보기 <image_url> (7일 뒤 만료)
다시 그린 프레임: <replacedFrames 또는 없음>
상태 JS: <상태 이름>: <JS> (있을 때만)

## 연결
- 칠 <boundPaints>/<solidPaints>개가 변수에, 글자 <textsWithStyle>/<texts>개가 텍스트 스타일에 묶였다. 크기 변수 연결 <boundSizes>개.
- 쓴 변수: <variables>
- 쓴 텍스트 스타일: <textStyles>
- auto-layout 프레임 <autoLayoutFrames>개, DOM 위치와 어긋나 absolute로 둔 자식 <absoluteChildren>개
- 접은 감싸개: 글자 <folded.text>개, 아이콘 <folded.icon>개, 통과 <folded.pass>개, Rectangle로 바꾼 잎 <folded.rect>개
- 변수 값은 prepare.mjs를 돌린 시점의 `packages/tokens`에서 옮겨 적었고 원본과 자동 동기화되지 않는다. 색 매핑과 brand seed는 Provisional이다.

## 참조한 것
- 컴포넌트 모음: Figma에 없음(스파이크 R1). `docs/system/README.md`의 「Component」 표와 화면 코드(`apps/sandbox/src/app/<key>`)가 대신한다.

## 승인된 예외
- 글꼴: Pretendard Variable 대신 Noto Sans KR, semibold는 Bold (2026-09-15 유진식 승인)

## 확인이 필요한 것
- 토큰에 투명도를 더한 칠: <opacityOnToken 또는 없음>
- 가장 가까운 굵기로 옮긴 글자: <weightFallback 또는 없음>

## 대조에서 찾은 것
- <덩이>: …

## 알려진 차이
- …
```

검사가 실패했으면 첫 제목을 「## 검사 실패」로 바꾸고 실패한 항목을 맨 위에 적는다. 이 명령은 commit·push·pull request를 만들지 않는다.

## 되읽기 — ④ Figma 재조회

`$ARGUMENTS`가 「되읽기」로 시작하면 이 절차다. 인수는 `되읽기 <key> fileKey: <Figma file key> [프레임: <이름>]`이다. `프레임:`이 없으면 그 화면 페이지에서 이름이 `… (수정안)`으로 끝나는 프레임을 먼저 찾고, 없으면 ②가 그린 이름과 같은 프레임을 읽는다.

### R1. 기준을 만든다

1. 1·2단계와 같이 도구를 확인하고 개발 서버를 띄운다.
2. `node scripts/figma/prepare.mjs --key <key> --name "<이름>" [--state …]`를 ②와 **같은 인수로** 돌린다. Figma에는 아무것도 그리지 않으며, `.figma-work/<key>/spec-<상태>.json`에 지금 코드가 그리는 사양이 남는다. 이것이 비교 기준이다.
3. `--state`를 무엇으로 줬는지 모르면 `apps/sandbox/src/app/<key>/page.tsx`의 머리말과 ②의 보고를 보고 그대로 맞춘다. 상태가 다르면 비교가 어긋난다.

### R2. Figma에서 읽는다

```bash
node scripts/figma/reread.mjs step --key <key> --name "<화면 이름>" --frame "<프레임 이름>" --parts 1
```

만들어진 `.figma-work/<key>/steps/reread-0.js`를 `Read`로 처음부터 끝까지 읽어 `mcp__figma__use_figma`에 `fileKey`와 함께 **그대로** 넘긴다. 이 단계는 파일을 바꾸지 않고 프레임을 줄(`rows`)로 돌려준다.

- **코드를 고치지 않는다.** 줄이거나 나누거나 보태지 않는다. 고치면 루트 프레임이 빠지는 식으로 결과가 조용히 어긋난다.
- 결과를 `Write`로 `.figma-work/<key>/figma-<상태>.json`에 **그대로** 저장한다. JSON을 손으로 손질하지 않는다. `Write`는 이 파일과 `.figma-work/files.json`에만 쓴다.
- 결과에 `error`가 있거나 프레임이 `missing`이면 멈추고 보고한다.
- `use_figma` 응답은 20,000자쯤에서 잘린다. 응답이 잘렸으면 `--parts 3`처럼 나눠 다시 만들어 조각마다 부르고 `figma-<상태>-<조각>.json`으로 각각 저장한 뒤, 다음 단계에서 `--figma`를 여러 번 준다. 화면 하나(노드 200개쯤)는 한 번에 들어간다.

### R3. 차이를 낸다

```bash
node scripts/figma/reread.mjs diff --key <key> --state <상태 순서> --figma .figma-work/<key>/figma-<상태>.json [--figma <조각>...]
```

출력은 변화 목록이다. 읽은 결과에 루트가 없으면 이 명령이 멈춘다. 조각을 다 넘기지 않았거나 단계 코드가 바뀐 것이다. `auto`가 `true`면 코드로 되돌릴 수 있는 것이고, `false`면 사람이 정할 것이다.

- **`build`를 먼저 본다.** `<key>|s<상태>|<커밋>|<날짜>` 꼴이며, 그 커밋이 지금 `git rev-parse --short HEAD`와 다르면 그 사이에 색 규칙이 바뀌었을 수 있다. 이때는 색 변화를 자동으로 반영하지 않고 전부 「사람이 정할 것」으로 옮겨 적는다.
- `build`가 비어 있으면 ②로 그린 프레임이 아니거나 옛 도구로 그린 것이다. 멈추고 보고한다.

### R4. 코드로 되돌린다

`auto`가 `true`인 것만 `apps/sandbox/src/app/<key>/page.tsx`에 반영한다. 고치는 파일은 `/generate-code`와 같은 세 파일(`page.tsx`, 같은 디렉터리의 `page.test.tsx`, `apps/sandbox/src/screens.ts`)뿐이다.

- **색**: `hint`가 가리키는 class를 그 자리에서 바꾼다. 같은 class가 여러 곳에 있으면 변화가 난 경로(`p`)의 요소만 고친다. 토큰 이름을 코드에 적는 방식은 `.claude/skills/generate-code/SKILL.md`의 「색과 경계」를 따른다.
- **글자**: 문구를 그대로 옮긴다. 머리말 주석의 요청 문단은 고치지 않고, 요청과 달라진 문구는 보고의 「사람이 정할 것」에도 적는다.
- **글자 크기**: `text-*` class를 바꾼다.
- **아이콘**: `@remixicon/react`의 다른 이름으로 바꾸고 import도 함께 고친다.
- 반영한 자리가 테스트가 확인하는 값(문구·기본값)이면 `page.test.tsx`도 함께 고친다.
- `auto`가 `false`인 것은 **고치지 않는다.** 크기·모서리·위치·추가·삭제·변수에 묶이지 않은 색과, 매핑표의 「되짚지 않는 것」에 있는 Property가 여기 든다.

### R5. 검사하고 검수한다

```bash
pnpm --filter @ooee/sandbox build
pnpm --filter @ooee/sandbox test
```

둘 다 통과할 때까지 세 파일을 고친다. 그다음 `.claude/skills/review-design/SKILL.md`의 「검사 항목」을 고친 `page.tsx`에 적용해 위반이 0건인지 본다. 위반이 생겼으면 그 자리를 되돌리고 「사람이 정할 것」에 적는다.

### R6. 보고한다

```text
## Figma 되읽기 완료

파일: https://www.figma.com/design/<fileKey>
프레임: <이름> · 그린 기준 <build>
지금 코드: <git rev-parse --short HEAD>

## 되돌린 것
| 경로 | 종류 | 전 | 후 | 고친 자리 |
| --- | --- | --- | --- | --- |
| voc:s0.3.1 | 색 | oe-background-primary | oe-background-secondary | page.tsx:120 |

## 사람이 정할 것
- <경로> <종류> <전> → <후> — <왜 자동으로 되돌리지 않았는지>

## 검사
- pnpm --filter @ooee/sandbox build: <통과/실패>
- pnpm --filter @ooee/sandbox test: <통과/실패>
- /review-design 위반 <N>건

## 남은 일
- Figma의 수정안 프레임은 그대로 둔다. 다음 ②는 이름이 같은 프레임만 다시 그리므로 수정안은 지워지지 않는다.
```

commit·push·pull request는 만들지 않는다. 변화가 하나도 없으면 「되돌릴 것이 없다」로 보고한다.
