# 작업 환경과 검증

## shadcn 작업 환경

초기 환경은 shadcn CLI v4 관련 워크플로우를 참고해 구성한다.

- 프로젝트 설정을 읽는 shadcn Skill
- 최신 문서와 registry를 조회하는 길 — Studio 와 `llms.txt`(MCP 는 두지 않기로 했다, `2026-09-18`·`2026-09-22`)
- `components.json`
- `shadcn info`
- 변경 전 `--view`, `--dry-run`, `--diff`
- 프로젝트 전용 ooee 작업 규칙

shadcn Skill은 shadcn 사용법을 제공하지만 ooee의 취향과 품질 기준까지 알지는 못한다. 자산화 절차가 안정되면 저장소 구조, `oe` token 문법, 외부 자료 변환 절차, 컴포넌트 API 원칙, 렌더링과 테스트 명령, 품질 완료 조건을 포함하는 프로젝트 전용 Skill을 만든다.

## 검증

코드 변경 후 최소한 다음을 실행한다. 이 명령은 lint, 공용 자산 typecheck·test와 production build를 모두 포함한다.

```bash
pnpm check
```

`pnpm docs:drift`(`scripts/docs/system-drift.mjs`)는 `docs/system` 에 적힌 목록·숫자·이름이 코드(registry·`packages/ui`·`packages/tokens`)와 같은지 재어 짝마다 「`=` 같다 / `⚠` 다르다 / `?` 못 읽었다」 셋 중 하나로 보고하고 어긋난 자리를 `파일:행` 으로 알린다. `pnpm check` 안에서 돌지만 막지 않는다 — 파일이 없거나 문장을 못 찾아도 「못 읽었다」 로 알리고 어떤 경우에도 exit 0 이다. 목록에는 있는데 읽지 못한 파일(디렉터리·권한·깨진 링크)은 그 파일을 읽는 짝마다 「`?` <짝 이름> — 못 읽었다 — <경로>: 파일을 읽지 못했다」 로 내고 조용히 건너뛰지 않는다(H1·메타줄 짝은 「<key>.md 제목·메타줄」, 열거 짝은 표에 있는 컴포넌트면 「<key> 열거값」 으로 자리를 좁혀 낸다). 문서의 주인은 기획자라 하네스는 고치지 않고 알리기만 하며(`2026-09-27`), 다른 시험이 이미 재는 것(확정의 명세 존재와 문서 링크 대상은 `apps/studio/src/lib/docs.test.ts`)은 다시 재지 않고 그 시험 이름을 적는다. 막아야 할 자리가 생기면 `--strict` 를 붙인다.

도구는 구조(목록·표·상수·열거·경로)와, **정해진 문장 꼴**로 숫자·개수·이름을 말하는 산문 자리 몇 곳을 잰다. 산문 자리는 절 안에서 그 꼴 하나를 찍어 읽고 꼴이 빗나가면 `?` 다 — Textarea 「최소값은 Npx」「기본값은 Npx」「기본 높이는 Npx」, Checkbox 「Npx Checkbox 본체」「Checkbox의 Npx 비상호작용」「Control은 Npx」「둘 다 Npx icon」「Ghost icon은 Npx」, Badge 「`BADGE_COLORS` 의 N색」「Tailwind primitive N색」「회색 계열은 `gray` 하나만」, Button·Toggle Button 「- `color`」 줄의 「값은 `a`과 `b`다」 문장(그 문장의 백틱 이름만 읽는다), Bottom Navigation 「셋부터 N까지」「N을 넘기면 … 오류」「항목이 N을 넘으면 … 오류」, interaction.md 「값은 Npx 하나」「**Npx**」, llms.txt 「확정 N종」, tokens.md 「## Brand primitive」 절의 「다음 값만 생성한다: `05, 08, …`」(alpha 단계는 CSS 변수 이름 그대로 두 자리 이름으로 비교한다 — `brand-alpha-5` 는 없는 이름이라 펜스에서는 `?`, 문장에서는 `⚠`. 값은 콜론 뒤 문장 끝까지의 숫자 백틱 묶음을 모두 읽으므로 「`05`, `08`, …」 처럼 묶음을 따로 써도 같다; 묶음 사이에 다른 말이 끼거나 숫자가 아닌 묶음이면 꼴 밖이라 `?`). 산문의 색 값 주장(「Light `X`, Dark `Y`」·「`A`는 `B`와 값이 같다」)은 자연어라 주어·부정·비교·시제를 정규식으로 확정할 수 없어 재지 않는다(재면 거짓 `⚠` 나 조용한 통과가 생긴다 — `2026-09-27` 개발자 결정). 대신 「참고」 에 그 주장이 든 **문단(표 행 포함)의 첫 행**을 `파일:행` 으로 넓게 모아 사람이 훑게 내고, 「재지 않는 것」 에 그 까닭과 잡는 범위를 한 줄로 적는다 — 후보는 테마 낱말(Light·Dark·라이트·다크, 대소문자 무시)과 팔레트 값(`<팔레트>-<숫자>`·`brand-alpha-NN`·white·black, 대소문자 무시)이 한 문단에 있는 것, 테마 낱말 바로 뒤에 맨 단계 숫자를 적은 것(button.md 색 단계 표의 「Light 100 / Dark 800」 칸), 「값·색·매핑이 같다·동일하다·일치한다·다르다」 가 한 문장에 있거나 「같은 값」「동일한 값」 이 든 것이다(「두 테마」 도 테마 낱말로 센다). 값의 원본은 `packages/tokens/src/index.ts` 다. 계약 밖 줄은 `?` 나 「재지 않는 것」 으로 내고 거짓 `⚠` 는 내지 않는다. 꼴을 좁게 정한 자리는 다음이다.

- **Properties 열거 줄** — 재는 꼴은 「- `prop`(, `prop`)*: `a | b | …`」 로, 값 자리에 `|` 가 든 백틱 묶음이 **정확히 하나**인 줄이다. 값 묶음이 둘 이상이거나 값 묶음 바로 뒤에 이음말 「또는·이나·및·혹은·그리고·과·와·,·/··;」 로 백틱 이름이 이어지면 `?`(「값 묶음이 둘 이상이라 한 목록으로 읽지 못했다」). prop 백틱 이름이 없는 `|` 목록 줄(「- 방향: `a | b`」)과 「## Properties」 절 밖이거나 코드 쪽 읽는 법이 없는 줄은 「재지 않는 것」 에 `파일:행` 으로 낸다. 이 판정은 parseDocEnums 와 unmeasuredEnumLines 가 같은 함수로 한다. 코드 쪽 유니온은 여러 줄로 나뉘어도(`type X =\n | "a"\n | "b"`) 이어 읽고 cva 키는 따옴표를 허용하며, 멤버 가운데 `"…"`·숫자가 아닌 것(`(string & {})`·`LayoutName`·`boolean | "auto"`)이 섞이면 값 집합을 확정할 수 없어 `?` 다.
- **color.md 「제안하는 최소 역할」 펜스** — `{role}` 의 roles = 라벨 줄의 영문 낱말 ∩ (parseCoreSemanticTokens 의 role 집합 ∪ {brand}). 교집합에서 빠진 영문 낱말이 하나라도 있으면(예: status·role) 그 라벨 줄을 `?` 로 내고, roles 가 비면 `{role}` 줄들도 `?` 다. `oe-` 줄은 「oe-이름( / 접미)*」 꼴이어야 하고(「oe-border-primary, secondary」「oe-interaction-hover (state layer)」 는 `?`), 자리표시자는 `{role}` 만 허용한다 — tokens.md 의 템플릿 줄(「oe-{property}-{hierarchy}」「oe-{role}-{property}-{hierarchy}」)이 이 펜스에 오면 어떤 이름을 말하는지 확정할 수 없어 `?` 하나만 내고 이름을 짓지 않으며, 그 자리표시자에 어떤 낱말이 와도 맞는 이름은 코드 쪽·문서 쪽 비교와 참고에서 뺀다(tokens.md 의 Neutral·status 펜스에 온 「oe-{role}-foreground-primary / secondary」 도 같다). 깨진 줄이 축약으로 말하던 나머지 이름(「, secondary」)도 함께 비교에서 빼서 `⚠` 에 붙이지 않는다. 축약이 말하는 이름의 접두 추정은 한 규칙이다 — 첫 이름의 family 를 붙이고(「oe-background-canvas-primary / canvas-secondary」 → oe-background-canvas-secondary), 조각이 이미 `oe-` 로 시작하면(「oe-border-primary / oe-border-secondary」) 그대로 이름이다. family 는 「oe-」 뒤 첫 낱말이되, 그 낱말이 코드의 role(danger·warning·success·info·accent·brand)이거나 `{role}` 이면 그 뒤 property 까지다(「oe-danger-foreground-primary / secondary」 → oe-danger-foreground-secondary; 첫 낱말만 붙이면 어디에도 없는 oe-danger-secondary 를 지어 `⚠` 를 냈다). 첫 이름에서 family 를 잴 수 없으면(「oe-ring / x」「oe-danger-primary / secondary」) 추정하지 않고 그 줄을 `?` 로 내며 말했을 수 있는 이름을 모두 비교와 참고에서 뺀다 — 어떤 추정으로도 `⚠` 에 이름을 붙이지 않는다. tokens.md 의 Neutral·status 펜스도 같은 규칙으로 뺀다. 펜스 줄이 대문자로 시작해도(「OE-foreground-primary / secondary」) 이름으로 다시 세지 않고 `?` 하나만 낸다 — tokens.md 의 Neutral·status 펜스도 같다(「Danger」「OE-foreground-primary」「success / info」「oe-danger-border-*」 는 `?` 하나, 그 줄이 말하던 이름은 코드 쪽·문서 쪽 양쪽 비교에서 빠져 `⚠` 에 붙지 않는다). 빼는 것은 정확히 그 이름(과 축약이 말한 나머지 낱말)이고 접두로 넓히지 않는다 — 「oe-foreground-inverse (역상)」 이 깨져도 다음 줄의 oe-foreground-inverse-secondary 는 그대로 잰다. 줄이 `-`·`*` 로 끝나 접두임을 스스로 말한 경우(「oe-danger-border-*」「oe-*」)에만 그 접두의 이름 모두를 양쪽에서 뺀다. 문서에만 있는 이름이 다른 family 의 코드 이름이면(Neutral 펜스의 `oe-accent-…`) 「코드에 없는 이름 — 코드 없음」 이 아니라 「다른 family 의 이름」 으로 낸다 — brand mapping 의 이름(`oe-brand-…`)도 「brand family」 로 같고, Neutral 펜스에 있어도 되는 brand 이름은 `oe-focus-ring` 하나다. status 예시 펜스는 읽은 첫 줄의 `oe-<role>-` 로 role 을 잡으며, 펜스 줄을 하나도 못 읽었으면 `?` 만 내고 「예시의 role」 `⚠` 를 얹지 않는다(펜스가 비면 이름 줄이 없다는 `?`).
- **문서가 인용한 별칭 클래스(`text-oe-label` 등) ↔ styles.css `@theme`** — 선언은 `@theme { … }` 블록 **안**의 「--<접두>-oe-<이름>:」 정확한 꼴만 센다. `--text-oe-label--line-height:` 같은 변형 접미 선언만 남거나 선언이 `:root` 등 `@theme` 밖으로 옮겨지면 Tailwind v4 가 클래스를 만들지 않으므로 `⚠ 별칭 클래스 text-oe-label — 코드 --*-oe-label 선언 없음` 이다. `@theme` 블록이 없으면 `?` 다.
- **badge.md 「색」 절의 `| 자리 | Light | Dark |` 표** — 행은 「`fill` 배경|글자|경계」, 칸은 「600」「`white`」「300 의 20% 알파」 꼴이어야 하며 `toneClass` 의 `bg-`·`text-`·`border-`(`dark:` 조각이 없으면 Dark 도 같다)와 비교한다. 못 읽은 행이 있으면 「표에 행 없음」 은 세지 않는다.

`apps/sandbox`도 `pnpm check` 안에 있다(typecheck·test·build 모두). 예전에는 밖에 있어 화면이 깨져도 CI 가 잡지 못했다. test에는 모든 화면의 `page.tsx`를 `/review-design` 검사 항목 가운데 기계로 가를 수 있는 것으로 읽는 `src/screen-rules.test.tsx`가 들어 있다. 무엇을 `apps/sandbox`에 두는지는 [ai-environment.md](ai-environment.md)가 정한다.

Studio의 라우트를 지운 뒤 `pnpm check`의 build가 없는 경로를 가리키며 실패하면 `apps/studio/.next`를 지우고 다시 돌린다. 앞서 `pnpm dev`가 남긴 `.next/dev/types`를 `next build`가 지우지 않고 `tsconfig.json`이 그 파일을 포함하기 때문이다. 이 삭제는 사람이 원인을 확인하고 하는 절차다. `/generate-code` 같은 Skill 명령은 지우지 않고 「검사 실패」로 보고하며, `rm -r`는 공용 권한에서 늘 확인을 묻는다(`AGENTS.md` 「Claude Code 명령과 권한」).

인터랙션이나 반응형을 변경했다면 Studio의 실제 화면에서도 해당 동작을 검수한다. 승인된 화면과 주요 상태의 스크린샷을 기준으로 유지하고 시각 회귀를 확인한다. 개별 색상만 보지 않고 foreground/background/border 조합을 검증한다.

## 테스트 배치 규칙

공용 자산 회귀 검사는 검사 대상 소스와 같은 디렉터리에 둔다.

- 컴포넌트 하나의 동작은 `<component>.test.tsx`에 둔다. 둘 이상의 Control을 함께 렌더해야만 성립하는 계약만 `selection-controls.test.tsx`처럼 범주 파일에 두고, 단일 컴포넌트 동작을 범주 파일에 섞지 않는다.
- `packages/ui`의 테스트는 첫 줄 `import "./test-setup"`으로 공용 JSDOM 환경을 불러온다. 파일마다 JSDOM을 다시 구성하지 않으며 `document`는 `globalThis.document`로 참조한다.
- `apps/sandbox`의 화면 테스트는 `src/app/<key>/page.test.tsx`에 두고 첫 줄 `import "@/test-setup"`으로 같은 JSDOM 환경을 불러온다.
- 테스트 실행기는 tsx의 기본 classic JSX 변환을 사용하므로 테스트 파일은 JSX를 쓸 때 `import React from "react"`를 유지한다. 컴포넌트 소스는 Studio와 같은 automatic runtime 기준을 따른다.
- 테스트가 쓰는 의존성은 workspace 루트가 아니라 해당 package의 `devDependencies`에 선언해 package가 단독으로 성립하도록 유지한다.
- `.tsx`를 소유한 `packages/*`는 자체 `tsconfig.json`과 `typecheck` script를 둬서 테스트 파일까지 타입 검사 대상에 포함한다. Next.js 앱인 `apps/studio`와 `apps/sandbox`는 `typecheck` script를 두지 않는다. 루트 `typecheck`가 `pnpm -r typecheck`라서 script가 있으면 `pnpm check`에 자동으로 들어오기 때문이며, 타입 검사는 `next build`가 맡는다.

## 로컬 환경 차이

- 로컬 개발 포트와 브라우저 탭 상태는 공유되지 않는다. 기본 포트는 3000이며 필요하면 `pnpm dev:studio -- --port 3002`처럼 지정한다.
- Obra Pro 자료는 실행 필수 의존성이 아니며 repository에 포함하지 않는다. 참고가 필요하면 각 계정과 기기에서 적법한 구매 권한으로 접근해야 한다.
- secret 값, 계정 정보와 기기별 절대경로를 repository에 기록하지 않는다.
