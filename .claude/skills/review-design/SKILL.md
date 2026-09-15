---
name: review-design
description: apps/sandbox 화면 코드를 docs/system/의 quality.md·tokens.md·interaction.md·icon.md·컴포넌트 문서에 대조해 위반 목록과 건수를 낸다. 화면 코드 검수 요청에 쓴다. 고치지 않고 보고만 한다. 인수는 검수할 파일 경로이며 비우면 apps/sandbox 아래 바뀌거나 새로 생긴 .tsx 파일이다.
---

# /review-design

`docs/process/ai-environment.md`의 ③ 검수다. 화면 코드를 `docs/system/`의 규칙에 하나씩 대조해 위반 목록을 내고 건수를 센다. Figma 없이 돈다. 이 명령은 고치지 않는다. 고치는 것은 `/generate-code`나 사람이 한다.

## 입력

`$ARGUMENTS`가 파일 경로다. 여러 개면 공백으로 나눈다. 비어 있으면 `git status --porcelain --untracked-files=all apps/sandbox`로 바뀌거나 새로 생긴 `.tsx` 파일을 잡는다. `--untracked-files=all`이 없으면 새 디렉터리가 한 줄로만 나와 파일을 찾지 못한다. `*.test.tsx`는 검수하지 않는다.

`apps/studio`나 `packages/*`의 파일을 넘기면 검수하되, 그쪽은 `docs/process/pipeline.md` 「단계별 코드 규칙」의 시점에 따라 primitive가 허용될 수 있음을 결과에 적는다.

## 읽는다

파일을 열기 전에 규칙 문서를 연다.

- `docs/system/quality.md` 전체
- `docs/system/tokens.md`의 「기본 원칙」·「Neutral semantic token」·「사용 규칙」
- `docs/system/interaction.md` 전체
- `docs/system/foundations/icon.md`의 「스타일 규칙」·「크기 토큰」
- `docs/system/README.md`의 「Component」 표
- 검수 대상이 쓰는 컴포넌트마다 `docs/system/components/<이름>.md` 전체. 「Properties」는 검사 항목 4의 근거이고, 「역할과 경계」와 「Guidelines」는 「판단이 필요한 것」의 근거다.

파일 머리말 주석에 요청 문단이 있으면 함께 읽는다. 요청이 「」로 정한 문구와 요청이 지정한 요소 종류(링크·버튼)의 근거다.

## 검사 항목

번호마다 판정 규칙이 있다. 규칙에 걸리면 위반이고, 규칙으로 가르기 어려우면 「판단이 필요한 것」이다. 위반만 센다.

1. **raw primitive color 0개** (quality.md 「코드」, tokens.md 「기본 원칙」). 다음 중 하나라도 있으면 위반이다.
   - `(bg|text|border|ring|fill|stroke|from|to|via|outline|shadow|decoration|placeholder|accent|caret|divide)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}`
   - `-white`, `-black`이 색 자리에 온 것. `border-transparent`, `bg-transparent`처럼 색을 지우는 용도는 위반이 아니다.
   - `#` 뒤에 16진수 3~8자리, `rgb(`, `hsl(`, `oklch(`
   - `[var(--brand-` 또는 `[var(--oe-`처럼 변수를 직접 참조하는 arbitrary value
   - `oe-*` 토큰 클래스 뒤에 `/50` 같은 opacity를 붙인 것(tokens.md 「사용 규칙」)
2. **shadcn visual token 0개** (quality.md 「코드」). `bg-background`, `text-foreground`, `bg-card`, `bg-popover`, `bg-primary`, `text-primary-foreground`, `bg-secondary`, `bg-muted`, `text-muted-foreground`, `bg-accent`, `bg-destructive`, `border-border`, `border-input`, `ring-ring`, `bg-sidebar-*`, `chart-*`가 있으면 위반이다.
3. **기존 ooee 컴포넌트 재사용** (quality.md 「코드」, README.md 「Component」 표). 표의 컴포넌트가 맡는 역할을 native 요소로 다시 만들었으면 위반이다. 예: `<input>`·`<textarea>`·`<select>`를 직접 그린 것, `<input type="checkbox">`, 배경이나 경계로 버튼 모양을 낸 `<button>`.
   - 이동하는 자리(머리말 주석이 「링크」라 부른 요소, 약관·정책, 「비밀번호 찾기」)를 `<button>`으로 만든 것은 위반이다. 목적지가 없어도 `<a href="#">`여야 한다. `onClick`도 `type="submit"`도 없는 `<button>`은 링크를 바꾼 것으로 보고 위반으로 센다.
   - 위반이 아닌 것: Input `trailingElement` 안의 보기 전환 같은 action(Input의 Clear button과 같은 native `<button>`), 페이지 이동 링크에 `buttonVariants`로 클래스를 준 것, `Field` 안의 구조용 `div`, 표에 없는 요소(제목·문단·로고 자리·레이아웃 상자).
4. **Property 값이 문서와 같다** (컴포넌트 문서 「Properties」). 컴포넌트에 넘긴 Property 이름·값이 문서의 목록에 없으면 위반이다. 예: `size="lg"`(문서는 `controlSize="large"`), `variant="outlined"`(문서는 `outline`).
   - 예외: 컴포넌트가 native 요소로 넘기는 HTML 속성(`type`, `name`, `autoComplete`, `inputMode`, `placeholder`, `maxLength`, `required`, `value`·`defaultValue`·`onChange`, `aria-*`, `className`)과 Anatomy가 필수 요소로 적은 내용을 넘기는 Property(`CheckboxField`·`SwitchField`·`RadioField`의 `label`, Button의 `children`)는 「Properties」에 없어도 위반이 아니다. 단 문서의 Property가 대신하는 이름은 예외가 아니다. `size`는 `controlSize`가 대신하므로 위반이다.
5. **Focus** (interaction.md 「Focus 선과 Ring」). 다음은 위반이다. `@ooee/ui` 컴포넌트는 스스로 갖고 있으므로 보지 않는다.
   - 키보드로 갈 수 있는 native 요소(`<a>`, `<button>`, `tabIndex`가 있는 요소)에 `focus-visible:` 표시가 없거나, `outline-none`만 있고 대체 표시가 없는 것
   - `focus:`만 쓰고 `focus-visible:`을 안 쓴 것
   - 컴포넌트 Container 밖에 홀로 선, `border` 클래스가 없는 요소가 `focus-visible:ring-2`를 쓰면서 `focus-visible:ring-offset-2`가 없는 것. 유형 3은 2px 간격이 있어야 한다. Input `trailingElement` 안의 action은 이 줄의 대상이 아니다.
6. **접근 가능한 이름** (quality.md 「접근성」). 보이는 Label이나 `aria-label`·`aria-labelledby`가 없는 입력, `aria-label` 없는 아이콘만 있는 버튼, `alt` 없는 `<img>`가 있으면 위반이다. Placeholder만 있는 입력은 위반이다.
7. **Control 높이와 모서리** (interaction.md 「공통 Control Height」·「공통 Control Radius」). 높이·배경·경계 중 하나라도 주어 상자 모양을 낸 native `<button>`·`<a>`가 `h-8`·`h-12`처럼 직접 높이를 쓰거나 `rounded-md`·`rounded-lg`처럼 직접 모서리를 쓰면 위반이다. `h-oe-control-*`·`rounded-oe-control`이어야 한다. 상자가 없는 글자 링크와 Input 안 아이콘 버튼은 적용 대상이 아니므로 Focus ring 모서리로 쓴 `rounded-sm`·`rounded-md`는 보지 않는다. `@ooee/ui` 컴포넌트에 `className`으로 높이나 모서리를 덮어쓴 것은 위반이다.
8. **Disabled와 Read-only** (interaction.md). native 요소에 `disabled`를 두고 색만 흐리게 하거나 외곽선을 지웠으면 위반이다. `cursor-not-allowed`를 Read-only에 쓴 것도 위반이다.
9. **선택 상태 위 Hover** (interaction.md 「선택 상태와 Hover·Pressed」). 선택된 상태에 `hover:bg-*`를 겹쳤으면 위반이다.
10. **Form 층** (vocabulary.md 「Form 구성 층」, field.md). Label·도움말·오류를 Control과 묶는 자리에 `Field`를 쓰지 않고 `<label>`과 `<p>`를 직접 놓았으면 위반이다. 제출·검증 로직이 Control이나 Field 안에 들어갔으면 위반이다.
11. **문구와 자리** (`/generate-code` 규칙). 영어 UI 문구는 위반이다. 머리말 주석의 요청이 「」로 정한 문구와 `Copyright © {…}. All rights reserved.` 같은 저작권 관용구는 언어와 관계없이 위반이 아니다. 환경설정이 소유하는 값(시스템명·브랜드명)을 실제 값으로 박은 것은 위반이다. `{…}` 자리는 위반이 아니다.
12. **import 경계** (AGENTS.md 「코드 소유 경계」). `packages/ui/src/...`를 경로로 직접 import한 것, `apps/studio`에서 import한 것은 위반이다. `@ooee/ui`에서만 가져온다.
13. **아이콘** (icon.md 「스타일 규칙」·「크기 토큰」). 다음은 위반이다.
    - 아이콘에 `size-4`·`h-4 w-4`·`size-[18px]`처럼 숫자 크기를 직접 준 것. `size-oe-icon-*`여야 한다. `Button`의 `leadingIcon`, `Input`의 `leadingElement`처럼 컴포넌트가 크기를 정하는 자리에 크기 클래스 없이 넘긴 것은 위반이 아니다.
    - native 요소로 만든 클릭 가능한 아이콘에 `hover:bg-oe-interaction-hover` 또는 `hover:bg-oe-interaction-hover-subtle`이 없는 것
    - `Ri*Fill` 아이콘을 선택·활성·성공 상태 표시나 Navigation 항목이 아닌 자리에 쓴 것
14. **초안 컴포넌트** (README.md 「Component」 표). 표에서 상태가 `초안`인 컴포넌트를 import했으면 위반이다. `packages/ui/src/index.ts`가 export해도 표가 기준이다.

다음은 위반으로 세지 않고 「판단이 필요한 것」에 적는다.

- 쓰인 컴포넌트 문서의 「역할과 경계」나 「Guidelines」가 그 자리에 다른 컴포넌트를 가리키는 경우. 문서의 문장과 대안 컴포넌트를 함께 적는다. 머리말의 요청이 그 컴포넌트를 지정했더라도 적는다. 예: 제출 버튼을 눌러야 값이 반영되는 `<form>` 안의 `SwitchField`(switch.md 「상태를 즉시 활성화할 때만 사용하기」는 Checkbox를 가리킨다), 데스크톱 화면의 `AppHeader`.
- `Select`·`InputButton`의 `placeholder`가 Field label을 그대로 반복하거나 문장형인 것, `defaultValue`가 있는 `Select`에 `placeholder`를 준 것(select.md 「Guidelines」)
- 컴포넌트 문서에 「현재 정의하지 않은 항목」인 상태나 정책을 화면이 필요로 하는 경우
- 코드가 필수로 요구하지만 컴포넌트 문서 「Properties」에 없는 Property. 문서 누락으로 적는다.
- 테두리 역할이 tokens.md와 어긋나 보이는 것(상자 외곽에 `border-oe-border-secondary` 등)
- Light/Dark, Mobile/Tablet/Desktop, 긴 콘텐츠와 overflow. 실제 확인은 `pnpm --filter @ooee/sandbox dev`를 띄우고 `pnpm visual --base http://localhost:3001 --path /<key>`로 사람이 한다.
- 대비 4.5:1 / 3:1. 토큰 조합이 문서의 조합과 다를 때만 적는다.
- 컴포넌트가 없어서 native로 만든 요소가 공용 자산이 될 만한지

## 출력

```text
## /review-design 결과 — <파일>

| # | 파일:행 | 항목 | 내용 | 고치는 법 |
| --- | --- | --- | --- | --- |
| 1 | apps/sandbox/src/app/admin-login/page.tsx:41 | 1 raw primitive color | `text-white` | `text-oe-foreground-inverse` |

위반 N건.

## 판단이 필요한 것
- …
```

위반이 없으면 표 대신 `위반 0건.` 한 줄을 쓴다. 건수는 표의 행 수와 같아야 한다. 검사 항목 가운데 파일에 해당하는 요소가 있었는데 위반이 아니라고 판정한 것(예: 항목 11의 저작권 관용구)은 「판단이 필요한 것」 아래 「위반이 아닌 이유」로 한 줄씩 남긴다.
