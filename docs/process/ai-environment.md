# AI 개발 환경 구축 계획

유진식이 맡은 AI 개발 환경 트랙의 순서, 결정, 스파이크 결과와 `dev → main` 통합 검증 항목을 채워 가는 기록이다. AX 전환 단계의 정의는 [roadmap.md](roadmap.md), branch 절차는 [git-workflow.md](git-workflow.md), 현재 상태는 [working-context.md](working-context.md), 시스템 정의는 `docs/system/`이 소유하며 여기에 다시 적지 않는다. `AGENTS.md`·Skill·`.mcp.json`을 전달 자산으로 삼게 되면 이 문서의 이관 시 위치는 「이관 시 남기는 것」이 정한다.

## 목표와 범위

최종 목표는 기획자가 화면 구성을 프롬프트로 적으면 검수를 거쳐 개발자에게 전달되는 흐름이다. Claude Code에 설치하면 `/design-page`, `/review-design`, `/generate-code` 명령으로 다음 여덟 단계를 수행하는 Skill 또는 Plugin을 만든다.

```text
① 디자인 시스템 검색
② Figma 화면 생성
③ 검수
④ Figma MCP 재조회
⑤ Storybook · @ooee/ui 조회
⑥ 실제 코드 생성
⑦ Story 생성 · 테스트
⑧ Pull request 준비
```

명령과 단계의 대응은 `/generate-code`가 ①⑤⑥⑦⑧, `/review-design`이 ③, `/design-page`가 ②④다. `/review-design`은 만든 화면 코드를 `docs/system/quality.md`의 항목에 하나씩 대조해 위반 목록을 내므로 Figma 없이 돈다. 순서 2의 완료 기준과 A/B 검증의 「위반 수」는 이 목록의 항목 수다. 「pull request 준비 완료」는 ⑧의 끝으로, `pnpm check`와 `apps/sandbox` 검사가 통과한 미커밋 working tree에서 `.github/pull_request_template.md` 양식으로 쓴 본문 초안을 대화에 제시한 상태다.

[roadmap.md](roadmap.md)의 5단계(이하 roadmap N단계)와 대응하면 ①⑤는 roadmap 3단계(스토리북 MCP), ②④는 roadmap 2단계(Figma MCP), 나머지는 roadmap 4·5단계(에이전트 룰, 자동화)다. roadmap.md는 4·5단계를 1차 제외로 두고 [working-context.md](working-context.md)의 「일정과 분담」은 `2026-09-20`부터 `2026-09-23`까지 그 테스트를 잡아 두었다. 이 문서는 roadmap 4·5단계를 **유진식 트랙의 검증용 실험 구현**으로 다룬다. roadmap.md와 루트 `README.md`의 1차 범위 문구를 고칠지는 「아직 정하지 않은 것」에 있다. 이 문서에서 「순서 N」은 「순서와 의존 관계」의 0~8 번호다.

## 지금 저장소에 있는 것

계획을 세우기 전에 `2026-09-14` 기준으로 확인한 상태다. [git-workflow.md](git-workflow.md)의 「dev에서 main으로 올릴 때」가 통합 검증 항목 다섯 중 넷은 아직 대상이 없다고 한 것과 같은 결론이며, 아래 표에서 「없음」인 네 줄이 그 넷이다.

| 항목 | 상태 | 근거 |
| --- | --- | --- |
| Storybook과 Story | 없음 | `.storybook/`, `*.stories.*`, storybook 의존성이 어느 package에도 없다. `.gitignore`의 `storybook-static/`과 문서의 언급만 있다 |
| Storybook MCP | 없음 | 위와 같다 |
| Figma MCP와 Figma 라이브러리 | 없음 | `.mcp.json`이 없다. Figma 팀과 결과물 폴더는 [figma-page-agent.md](figma-page-agent.md)에 있지만 `@ooee/ui`를 반영한 라이브러리는 없다(스파이크 R1에서 확인). Obra 자료는 참고용이다 |
| Agent Rules와 `AGENTS.md` | 운영 규칙만 있음 | MCP 사용, Story 작성, 명령어, 자동 pull request에 관한 규칙이 없다 |
| Skill과 Plugin | 없음 | `.claude/settings.json`은 `{ "enabledPlugins": {} }` 하나다. [tooling.md](tooling.md)가 프로젝트 전용 Skill의 내용 목록을 적어 두었다 |
| 배포와 CI | `Quality`만 있음 | `pnpm check`만 돌고 배포 job이 없다. GitHub Pages는 공식 문서 기준으로 비공개 저장소의 무료 플랜에서 쓸 수 없으므로 [working-context.md](working-context.md) 「일정과 분담」의 `~9/4` GitHub Pages 호스팅은 성립하지 않았고, 호스팅은 스파이크 R4가 정한다 |

**Skill이 바로 쓸 수 있는 재료는 이미 있다.** `docs/system/`은 Sonnet 수준의 에이전트가 그 문서만 보고 코드를 만들도록 쓰였고(`docs/system/README.md`의 「이 문서의 독자」), 컴포넌트 문서는 Property 값을 코드 문자열 그대로 적는다. `packages/ui/package.json`의 exports가 import 경로를, `scripts/visual/inspect.mjs`가 화면 측정을, `.github/pull_request_template.md`가 pull request 양식을 준다. [roadmap.md](roadmap.md)의 「A/B 비교 검증」이 지금까지의 경험상 낫다고 적은 B안(컴포넌트만 주고 코드 생성)이 바로 이 조합이다.

## 용어와 전제

- **Storybook MCP는 Studio가 아니다.** Studio는 MCP를 제공하지 않는다. Storybook MCP는 `@storybook/addon-mcp`가 Storybook 개발 서버의 `http://localhost:6006/mcp`로 제공한다. `build-storybook`으로 만든 정적 결과물은 `/mcp`를 제공하지 않으므로, 여러 사람이 공유하는 endpoint는 Chromatic 같은 호스팅이나 정적 결과물 위에 별도로 띄우는 `@storybook/mcp`가 필요하다. Studio에 MCP가 없다는 것은 저장소에서 확인했고, 나머지는 Storybook 공식 문서 기준이며 스파이크 R2에서 이 저장소로 확인한다.
- **`docs-list`·`docs-show`는 `@storybook/addon-mcp`의 `docs` toolset에 드는 MCP 도구 이름이다.** 이 toolset은 components manifest가 있어야 켜지고, manifest는 `.storybook/main.ts`의 `features.componentsManifest: true`가 만든다. 역시 공식 문서 기준이며 스파이크 R2에서 확인한다.
- **Figma MCP의 읽기와 쓰기는 다른 도구다.** 공식 문서 기준으로 노드를 읽는 `get_metadata` 같은 도구는 desktop·remote 서버 모두에 있고, 화면을 만드는 `generate_figma_design`과 `use_figma`는 remote 서버 전용이며 beta다. 도구 이름과 seat·플랜 조건은 스파이크 R1이 유진식 계정으로 확인했다(「스파이크 결과」). seat는 Figma 계정의 종류이고 `whoami`가 `Full`로 돌려준다. Code Connect는 Figma 컴포넌트를 코드 구현과 잇는 Figma 기능이며 bluekey의 Pro 플랜에서는 쓸 수 없다.
- **패키지 이름은 `@ooee/ui`다.** 저장소 밖의 초기 계획 메모에 적힌 `@repo/ui`는 이 이름을 가리키며, 저장소 안의 문서와 코드는 `@ooee/ui`만 쓴다.
- **「Sonnet 수준의 모델」은 Claude Code를 `claude --model sonnet`으로 띄운 세션이다.** [roadmap.md](roadmap.md)의 「목표 품질은 Sonnet 수준의 낮은 모델로도」를 실행 방법으로 옮긴 것이다. `sonnet`은 그 시점의 최신 Sonnet을 가리키므로 순서 2의 결과 절과 A/B 결과에는 실제로 돈 모델의 전체 이름을 적는다.
- **로컬 Storybook은 Studio의 브랜드 변수 주입에 기대지 못한다.** Brand 값이 `packages/tokens`가 아니라 Studio의 `BrandThemeProvider`와 `globals.css`에 있다는 사실은 [working-context.md](working-context.md)의 「현재 구현」이 적는다. `packages/ui`에서 Button·Badge·ToggleButton은 `var(--brand-{단계})`를, Chip·SelectBox·Combobox는 `var(--brand-alpha-*)`를 직접 쓰고, Checkbox·Radio의 선택 색과 Chip의 Active 글자, Combobox·Select의 선택 Check 표시는 `oe-brand-*`, `focus-visible` 색은 전부 `oe-focus-ring`이다. 그래서 Storybook이 Studio 없이 `@ooee/tokens/styles.css`만 불러오면 Brand tone뿐 아니라 Checkbox·Radio·Chip·Combobox·Select의 선택 표현과 모든 Focus ring이 비어서 나온다. 순서 3은 Storybook decorator가 `DEFAULT_BRAND_SEED`에서 Studio와 같은 값을 넣는 방식으로 시작하며 `packages/tokens`와 `apps/studio/src/app/globals.css`는 건드리지 않는다. 기본 브랜드 값을 `packages/tokens`로 옮길지는 「아직 정하지 않은 것」에 있다.

## 순서와 의존 관계

```text
0 이 문서
1 Figma 확인 질문 + 스파이크 R1                   2와 독립. 질문은 비용이 없고 답을 기다린다
2 Skill v0                                        docs/system/ + @ooee/ui만으로 /generate-code · /review-design
  ↓
3 Storybook 골격 + 최소 Story + Storybook MCP     순서 2의 결과로 필요할 때만. 스파이크 R2 포함
  ↓
4 Agent Rules                                     v0가 실제로 필요로 한 규칙만
  ↓
5 Storybook 배포와 CI                             호스팅 결정 뒤
  ↓
6 Figma MCP 읽기 + 컴포넌트 매핑표                 라이브러리와 seat가 있어야 함
  ↓
7 /design-page                                    ② 쓰기 + ④ 재조회
  ↓
8 패키지화
```

Storybook보다 Skill v0를 앞에 둔 이유는 둘이다. 첫째, ①⑥⑧과 ⑤의 `@ooee/ui` 조회, ⑦의 테스트에 Skill이 필요로 하는 재료가 이미 있어서 Storybook 없이 성립한다. ⑤의 Storybook 조회와 ⑦의 Story 생성은 순서 3 뒤에 덧붙인다. 둘째, A/B 검증의 B안 기준선이 Storybook 스파이크의 성패에 묶이지 않는다. 셋째, Storybook을 만들지 자체가 「아직 정하지 않은 것」에 있어서 순서 3은 조건부다. Figma를 뒤에 둔 이유는 라이브러리·seat·Code Connect가 없는 채로는 roadmap.md가 적은 A안의 경험이 반복될 뿐이기 때문이다.

순서 1·2의 산출물 가운데 이 문서에 적는 것(Figma 항목 답변, 스파이크 R1 결과 절, Skill v0 결과 절)은 순서 0의 pull request가 `dev`에 합쳐진 뒤 별도 pull request로 낸다. 순서 0이 열려 있는 동안에도 확인 질문, 스파이크 R1, Skill v0 작성은 막히지 않는다. R1이 Figma remote MCP를 Claude Code에 잇는 설정은 저장소에 넣지 않고 `claude mcp add`로 기기의 Claude Code 설정에 두며, `.mcp.json`의 Figma 항목은 순서 6이 만든다. 각 순서의 pull request가 함께 고치는 기존 문서는 「갱신 대상 문서」에 있다.

| 순서 | branch | 산출물 | 완료 기준 |
| --- | --- | --- | --- |
| 0 | `docs/ai-environment-plan` | 이 문서, [figma-page-agent.md](figma-page-agent.md), [README.md](README.md) 색인 두 행, [working-context.md](working-context.md) 「현재 구현」 `packages/tokens` 항목의 Brand 변수 위치 수정, 새 절 하나, 「일정과 분담」의 `~9/4`·`9/14~` 두 행 | pull request가 `dev`에 합쳐진다 |
| 1 | `docs/figma-spike-r1` | Figma 항목 답변과 스파이크 R1 결과를 담은 「스파이크 결과」 한 절 | 그 절이 적히고 「아직 정하지 않은 것」의 Figma 행이 답으로 바뀐다 |
| 2 | `feature/skill-generate-code` | `.claude/skills/generate-code/SKILL.md`, `.claude/skills/review-design/SKILL.md`, `apps/sandbox`, v0가 틀린 사례를 적은 결과 절 | Sonnet 수준의 모델로 화면 둘을 만들어 `pnpm check`, `pnpm --filter @ooee/sandbox build`, `pnpm --filter @ooee/sandbox test` 통과, `/review-design` 위반 0건, 「pull request 준비 완료」까지 도달 |
| 3 | `feature/storybook`, 그 뒤 `feature/storybook-mcp` | 순서 2의 결과 절에 `docs/system/`만으로 부족했던 것이 적힐 때만 진행한다. `feature/storybook`: `apps/storybook`, 확정 컴포넌트마다 `Default` Story 하나(「아직 정하지 않은 것」의 신주희 확인 뒤), 브랜드 변수 주입 decorator. `feature/storybook-mcp`: `.mcp.json`, `apps/storybook`에 `@storybook/addon-mcp`와 `features.componentsManifest` 추가 | `feature/storybook`: `pnpm build-storybook` 성공, Brand tone·`brand-alpha-*`와 `oe-brand-*`의 선택 표현·Focus ring이 Studio 없이 보임. `feature/storybook-mcp`: `docs-list` 응답에 `component-registry`의 `확정` 항목마다 대응 항목이 하나씩 있음(대조 방법은 「통합 검증 항목 채우기」) |
| 4 | `feature/agent-rules` | `AGENTS.md` 한 절, `SKILL.md` 규칙, `.claude/settings.json` 공용 권한 | 순서 2의 결과 절에 적힌 틀린 사례가 규칙으로 막힌다 |
| 5 | `feature/storybook-ci` | `.github/workflows/storybook.yml`, 호스팅 | pull request마다 `build-storybook` 검사, `dev`·`main`에 주소가 생긴다 |
| 6 | `feature/figma-mcp` | `.mcp.json` Figma 항목, Figma 컴포넌트 → `@ooee/ui` 매핑표 | `get_metadata`가 라이브러리 파일을 읽는다 |
| 7 | `feature/skill-design-page` | `/design-page`. 규칙의 출발점은 [figma-page-agent.md](figma-page-agent.md) | 코드에서 만든 화면이 Figma에 올라가고 수정 뒤 다시 읽혀 코드로 돌아온다 |
| 8 | `feature/agent-kit` | Plugin 디렉터리 | 다른 저장소에서 설치해 `/generate-code`가 돈다 |

## 이 문서가 제안하는 기본값

아래 항목은 각 순서의 pull request 본문에 적고 합칠 때 확정한다. 상대 담당 영역에 닿는 항목은 여기 두지 않고 「아직 정하지 않은 것」에 담당과 기한을 붙여 둔다.

- **Skill은 파일을 먼저 읽고 MCP는 덧붙인다.** ①의 1차 원본은 `docs/system/README.md`의 컴포넌트 표와 각 컴포넌트 문서이고, Storybook MCP의 `docs-list`·`docs-show`는 `http://localhost:6006/mcp`가 열려 있을 때만 추가로 쓴다. 기획자가 개발 서버를 띄우지 못해도 ①이 성립해야 하기 때문이다. 이 전제는 기획자가 이 저장소를 clone한 기기에서 Claude Code를 돌린다는 뜻이다. ⑥⑦이 코드와 Story를 쓰고 `pnpm check`와 `apps/sandbox` 검사를 돌리는 자리도 그 저장소이므로, 개발 서버가 없을 때 빠지는 것은 Storybook MCP 조회뿐이다. 기획자가 그 환경을 직접 갖출지는 「아직 정하지 않은 것」에 있다.
- **Storybook은 Skill의 전제가 아니다.** ①⑤는 `docs/system/`과 `packages/ui/package.json`의 exports를 직접 읽어 성립하고, 기획자와 개발자가 화면에서 컴포넌트를 보는 채널은 이미 Studio의 Playground와 Docs 메뉴가 맡는다. Storybook MCP가 더 주는 것은 TS 타입에서 뽑은 Property 목록과 Story 예시인데, 앞의 것은 컴포넌트 문서가 코드 문자열 그대로 갖고 있다. 그래서 순서 3은 순서 2의 결과 절에 「`docs/system/`만으로 부족했던 것」이 적힐 때만 진행한다. 부족한 것이 저장소 밖에서 조회할 endpoint뿐이면 Storybook 대신 Studio가 `component-registry`와 `docs/system/`을 JSON으로 내는 route와 그 위의 MCP를 먼저 검토한다. Storybook 자체를 만들지는 [roadmap.md](roadmap.md)의 결정이라 「아직 정하지 않은 것」에 있다.
- **`.mcp.json`은 저장소 루트에 URL만 적어 commit한다.** secret과 기기별 값은 `.claude/settings.local.json`과 `.env.local`에 둔다. 첫 환경변수가 생기는 pull request에서 `.env.example`을 만든다.
- **`build-storybook`은 `pnpm check`에 넣지 않는다.** `Quality`의 15분 제한 안에 두 빌드를 겹치지 않도록 별도 workflow로 검사한다.
- **Skill이 만든 기획자 화면은 전달 범위 밖의 `apps/sandbox`에 둔다.** `apps/studio`는 그 자체가 전달 대상이고 그 안의 `/screens/*`는 신주희가 제품 화면을 한 건씩 만드는 작업장(단일 원본 `screen-registry`)이므로, 생성 결과를 거기에 두지 않는다. 생성 화면을 제품 화면으로 채택할지와 `/screens/*`로 옮기는 일은 신주희가 정한다. `apps/sandbox`는 Studio와 같은 Next.js 앱이며 Studio처럼 `typecheck` script를 두지 않는다. 루트 `typecheck`가 `pnpm -r typecheck`라서 workspace package에 그 script가 있으면 `pnpm check`에 자동으로 들어오고, `lint`·`build`·`test`는 `apps/sandbox`를 가리키지 않으므로, 이렇게 두면 `apps/sandbox`는 `pnpm check` 밖에 남는다. 검사는 `pnpm --filter @ooee/sandbox build`와, `apps/sandbox`의 `*.test.tsx`를 도는 자체 `test` script(`pnpm --filter @ooee/sandbox test`)로 한다. v0에서 ⑦의 테스트는 이 `*.test.tsx`다. 전달 시 `docs/process/`와 함께 제거한다.
- **v0가 만드는 화면 둘은 정해 둔다.** 하나는 관리자 로그인으로, `apps/studio/src/app/screens/admin/login/page.tsx`가 원본이다. 그 파일의 머리말 주석과 [sources.md](sources.md)의 Auth split screen 설명만 프롬프트로 주어 다시 만들고, 원본과 `@ooee/ui` 재사용을 대조한다. 다른 하나는 STO 지원요청 화면으로, `/screens/*`에 원본도 없고 `screen-registry`에도 항목이 없으므로 원본이 없는 기획자 요청에 해당한다. 둘 다 `apps/sandbox`에 만들며 `/screens/*`에는 두지 않는다. A/B 검증은 같은 화면 둘로 비교한다.
- **Figma는 디자인 원본이 아니라 검토용 캔버스로 시작한다.** 코드로 먼저 만든 화면을 Figma에 올리고, 사람이 고친 뒤 다시 읽어 코드로 돌아오는 순서다. roadmap.md의 「현재까지의 경험은 B안이 낫다」와 맞는 순서이며, A/B 검증에서 이 전제를 처음 확인한다.
- **명령은 pull request를 만들지 않고 멈춘다.** `AGENTS.md`의 「화면 확정 검수」와 「여러 환경에서 이어서 작업할 때」가 정한 대로 commit·push는 사용자의 명시적 요청이 필요하다. 이 문서는 pull request도 같은 기준으로 둔다. 명령은 「pull request 준비 완료」에서 멈추고 사용자가 요청하면 만든다.
- **컴포넌트나 Story만 바뀐 pull request는 MCP·Skill 항목을 기다리지 않는다.** `dev → main`의 diff에 `apps/storybook/`, `.mcp.json`, `.claude/`, `AGENTS.md` 중 하나가 있을 때만 유진식이 「통합 검증 항목 채우기」의 명령을 실행하고 결과를 pull request 본문에 남긴다. [git-workflow.md](git-workflow.md)의 「dev에서 main으로 올릴 때」에 넣을 문구다.

## 스파이크

스파이크와 Skill v0의 결과는 「스파이크 결과」에 `### 2026-09-xx 제목` 절로 덧붙인다.

| 번호 | 질문 | 비용 | 완료 기준 |
| --- | --- | --- | --- |
| R1 | Figma remote MCP의 `generate_figma_design`·`use_figma`가 유진식 계정과 seat에서 되는가. 결과가 라이브러리에 묶이는가. 대상 폴더는 [figma-page-agent.md](figma-page-agent.md)의 결과물 폴더다 | 반나절 | 어느 서버에 어느 도구가 있는지, seat와 플랜 조건, 결과 frame의 상태가 적힌다 |
| R2 | Storybook과 `@storybook/addon-mcp`가 이 스택(Tailwind v4, `private: true` 소스 export, Node 22.22.1)에서 도는가. `features.componentsManifest`가 `docs` toolset을 켜는가. Studio 없이 Brand tone·`brand-alpha-*`와 `oe-brand-*`의 선택 표현·Focus ring이 보이는가 | 하루 | `pnpm build-storybook` 성공, `docs-list` 응답, Brand Button 배경·Checked Checkbox·Active Chip·Focus ring이 보이는 스크린샷 |
| R3 | 이관 뒤 `AGENTS.md`·Skill·`.mcp.json`이 어디에 남는가 | 반나절 | 「이관 시 남기는 것」이 채워진다 |
| R4 | 비공개 무료 플랜에서 Storybook을 어디에 올리는가 | 반나절 | 호스팅 하나가 정해지고 secret 이름이 정해진다 |

## 통합 검증 항목 채우기

[git-workflow.md](git-workflow.md)의 「dev에서 main으로 올릴 때」 다섯 항목을 대상이 생기는 순서대로 실행 가능한 명령으로 바꾼다. Storybook 항목 둘은 「아직 정하지 않은 것」의 Storybook 결정을 따르며, Storybook을 만들지 않기로 하면 그 자리에 Studio 조회 항목을 둔다.

| 항목 | 명령 또는 확인 | 생기는 순서 |
| --- | --- | --- |
| Storybook이 정상으로 뜨는가 | `pnpm build-storybook` (pull request 자동 검사) | 3, 5 |
| 컴포넌트가 서로 충돌하지 않는가 | `pnpm check`. 순서 3부터는 `pnpm build-storybook` 뒤 `storybook-static/index.json`(공식 문서 기준 항목마다 `title`·`importPath`를 가진다. 스파이크 R2의 결과물로 확인)에서 같은 `title`이 서로 다른 `importPath`에 나오지 않음 | 지금부터, 3 |
| Figma MCP 조회가 정상인가 | `get_metadata`가 라이브러리 파일을 읽는다 | 6 |
| Storybook MCP 조회가 정상인가 | `docs-list` 응답에 `component-registry`의 `확정` 항목마다 대응 항목이 하나씩 있다. 대응은 그 Story가 import하는 `packages/ui/src/<key>.tsx`로 확인한다(registry `key`는 그 파일 이름과 같다). 응답의 어느 필드를 registry의 어느 필드와 맞출지는 스파이크 R2 결과와 Story 위치 결정 뒤 순서 3의 pull request 본문에 적고 이 칸을 그 규칙으로 고친다 | 3 |
| Skill과 Agent가 동작하는가 | `/generate-code`를 「이 문서가 제안하는 기본값」의 관리자 로그인 프롬프트로 한 번 돌려 `pnpm check`를 통과한 branch에서 「pull request 준비 완료」까지 간다 | 2 |

## A/B 검증

[roadmap.md](roadmap.md)의 「A/B 비교 검증」이 정한 두 안을 이 트랙의 산출물로 채운다. 비교는 이때 처음 돌며 시기는 「일정」에 있다.

| 안 | 방식 | 준비되는 순서 |
| --- | --- | --- |
| B | Skill v0. `docs/system/` + `@ooee/ui`만으로 코드 생성 | 2 |
| A | Figma를 경유. 비교 시점에는 순서 6·7이 아직 없으므로 순서 1의 결과(Figma 확인 답변, 스파이크 R1이 확인한 remote 서버 방식으로 「이 문서가 제안하는 기본값」의 화면 둘을 만든 frame과 그 재조회)만으로 돌린다. 재조회한 `get_metadata` 결과를 화면 설명 대신 Skill v0의 `/generate-code`에 입력으로 주어 코드를 만들고, 그 코드에 `/review-design`을 돌린다. 「Figma가 원본」과 「코드에서 만든 캔버스를 사람이 고친 뒤 재조회」 중 어느 쪽인지는 그 결과가 정한다 | 1, 2 |

판정 기준은 두 안이 만든 코드에 대한 `/review-design`의 위반 수, `@ooee/ui` 재사용 비율, Sonnet 수준의 모델로 돌렸을 때의 결과다. 재사용 비율은 화면에서 `docs/system/README.md` 컴포넌트 표의 확정 컴포넌트가 맡는 역할(버튼·입력·선택 등)을 가진 요소 가운데 `@ooee/ui` import로 만든 것의 수를 그 요소 전체 수로 나눈 값이며, 레이아웃용 요소는 세지 않는다. 결과는 roadmap.md의 「A/B 비교 검증」에 적는다.

## 아직 정하지 않은 것

| 항목 | 담당 | 기한 |
| --- | --- | --- |
| `@ooee/ui`를 반영한 Figma 라이브러리를 만들지와 담당. 스파이크 R1에서 라이브러리가 없고 Code Connect는 플랜상 쓸 수 없음을 확인했다(「스파이크 결과」). 없는 채로 가면 순서 6·7은 레이어 이름 규칙과 매핑표로 대신한다 | 신주희·유진식 | `2026-09-23` |
| Story 파일 위치(`packages/ui/src/<component>.stories.tsx` 병치 또는 `apps/storybook/stories/`)와 폴더 구조. [working-context.md](working-context.md) 「남은 작업」 10번의 카테고리화와 함께 정한다 | 신주희·유진식 | `2026-09-16` |
| 확정 컴포넌트 19개의 최소 `Default` Story(필수 prop만)를 유진식이 순서 3의 pull request에 한 번에 넣어도 되는가. 순서 3의 완료 기준이 컴포넌트마다 Story 하나를 전제하고 신주희는 `9/14~` 화면 개선 중이라 제안한다. Property를 나열하는 Story는 제안 밖이며 [open-questions.md](open-questions.md)의 Style·Size 이름 통일 뒤에 신주희가 쓴다 | 신주희 | `2026-09-16` |
| 기본 브랜드 값의 자리: Storybook decorator에 두는 채로 갈지, `packages/tokens/src/styles.css`가 `DEFAULT_BRAND_SEED`의 `--brand-*`·`--oe-brand-*` 값을 갖게 할지. 후자는 브랜드만 런타임 주입으로 남겨 둔 tokens 구조와 전달 패키지가 싣는 값을 바꾸며, [open-questions.md](open-questions.md)의 「기본 ooee brand seed」가 Provisional인 채로 값이 공용 package에 들어간다 | 신주희 | `2026-09-16` |
| Storybook을 만들지 여부. [roadmap.md](roadmap.md)의 「컴포넌트를 참고하는 채널」은 Storybook을 최종 표준 채널로 정했지만, Studio가 이미 문서와 Playground를 제공하고 Skill v0는 `docs/system/`만으로 돈다. 순서 2의 결과와 A/B 검증 뒤에 다시 정하며, 그때까지 순서 3과 통합 검증의 Storybook 항목 둘은 조건부다 | 신주희·유진식 | `2026-09-23` |
| 저장소 밖에서 컴포넌트를 조회할 endpoint: Storybook MCP(개발자 로컬 서버 또는 공유 endpoint) 또는 Studio가 `component-registry`와 `docs/system/`을 JSON으로 내는 route 위의 MCP | 유진식 | `2026-09-19` |
| 기획자가 명령을 돌리는 자리: 이 저장소를 clone해 Node 22.22.1·pnpm·Claude Code를 갖추는지, 개발자가 대신 돌리고 기획자는 프롬프트와 검수만 맡는지. ①~⑧ 중 기획자가 직접 수행하는 단계도 함께 정한다 | 유진식 | `2026-09-19` |
| Storybook 호스팅: Chromatic, Cloudflare Pages, 저장소 공개 또는 GitHub 플랜 변경. 외부 서비스 사용 여부는 블루키에 묻는다 | 유진식 | `2026-09-19` |
| Figma의 역할: 디자인 원본 또는 검토용 캔버스. A/B 검증 결과로 정한다 | 유진식 | `2026-09-23` |
| roadmap.md 4·5단계의 「1차 범위: 제외」와 루트 `README.md`의 1차 범위 문구를 검증용 실험 구현으로 고칠지. 팀이 정한 프로젝트 범위라 유진식 혼자 고치지 않는다 | 신주희·유진식 | `2026-09-23` |
| 이관 뒤 `AGENTS.md`·Skill·`.mcp.json`의 위치: `packages/` 안의 Plugin 디렉터리 또는 별도 저장소 | 유진식 | `2026-09-25` |
| 통합 방식(SaaS 패키지화 또는 저장소 연동). 순서 8만 막는다 | 유진식 | 미정 |

## 일정

[working-context.md](working-context.md)의 「일정과 분담」에 있는 `9/14~`·`9/20~23`·`9/28~30` 행의 유진식 몫을 날짜별로 쪼갠 것이다.

| 날짜 (2026) | 내용 |
| --- | --- |
| 9/14 | 이 문서, Figma 확인 질문 |
| 9/15 | 스파이크 R1, Skill v0 시작 |
| 9/16 | Skill v0 완료, Sonnet 수준의 모델로 화면 둘 |
| 9/17~18 | 순서 2의 결과에 따라 Storybook 골격·Storybook MCP (R2)·최소 Story(신주희가 `9/16`까지 동의하면), 또는 Studio 조회 route 스파이크 |
| 9/19 | Agent Rules, 호스팅 결정 (R4) |
| 9/20~23 | A/B 검증 |
| 9/24~25 | Storybook 배포와 CI, Figma MCP 읽기와 매핑표, `/design-page`, 이관 시 남기는 것 (R3) |
| 9/28~30 | 패키지화 방향, 마무리 |

## 갱신 대상 문서

이 문서를 넣는 pull request는 아래 문서를 고치지 않는다. 각 순서의 pull request가 함께 고친다.

| 문서 | 고칠 곳 | 순서 |
| --- | --- | --- |
| [roadmap.md](roadmap.md) | 「A/B 비교 검증」에 결과. 4·5단계의 「1차 범위: 제외」를 고칠지는 「아직 정하지 않은 것」에 있다 | A/B 뒤 |
| [tooling.md](tooling.md) | 「테스트 배치 규칙」에 Story 위치, 검증 명령에 `pnpm storybook`·`build-storybook`. `apps/sandbox` 검사는 순서 2에서 넣었다 | 3 |
| [git-workflow.md](git-workflow.md) | 「dev에서 main으로 올릴 때」 항목마다 명령과 컴포넌트·Story만 바뀐 pull request의 예외 | 각 순서 |
| `AGENTS.md` | 「문서 구조」의 `.claude/` 제거 규칙, MCP 사용과 명령 규칙 한 절. `apps/sandbox` 행은 순서 2에서 넣었다 | 4 |
| 루트 `README.md` | 첫 환경변수가 생길 때 `.env.example`. 1차 범위 문구는 roadmap.md와 같은 결정을 따른다 | 6, A/B 뒤 |
| [working-context.md](working-context.md) | 「일정과 분담」의 `~9/4` 행에 R4에서 정한 호스팅 이름 | 5 |
| `.github/pull_request_template.md` | Storybook·MCP를 건드린 pull request의 확인 항목 | 3 |

Skill 사용법과 MCP 설정은 `docs/system/` 바깥에 둔다. 규칙은 `docs/system/README.md`의 「이 문서의 독자」가 소유한다.

## 이관 시 남기는 것

스파이크 R3의 결과로 채운다. 지금 정해진 것은 `docs/system/`이 자산을 어떻게 만들고 어떤 도구로 검수했는지를 적지 않는다는 것(`docs/system/README.md`의 「이 문서의 독자」)과, `AGENTS.md`·`.claude/`·`docs/process/`가 이관 시 제거된다는 것뿐이다. `AGENTS.md`와 `.claude/`가 이 규칙대로 사라지면 블루키는 UI 키트만 받게 되므로, Plugin 디렉터리로 분리하거나 제거 규칙을 고치는 둘 중 하나를 `2026-09-25`까지 정한다.

## 스파이크 결과

끝난 날짜 순으로 쌓는다.

### 2026-09-14 스파이크 R1: Figma 쓰기

- **연결.** Figma remote MCP(`https://mcp.figma.com/mcp`)를 `claude mcp add --scope user`로 등록하고 OAuth 로그인은 브라우저에서 한 번 했다. 저장소에는 아무것도 넣지 않았다. 세션을 시작한 뒤 등록한 서버는 그 세션에 실리지 않으므로, 이 스파이크는 `claude -p --allowedTools mcp__figma`로 띄운 별도 headless 세션에서 돌렸다.
- **계정과 플랜.** `whoami`가 돌려준 유진식 계정의 팀은 둘이다. bluekey(`team::1395716714983274137`, tier `pro`, seat `Full`)와 개인 팀(tier `starter`, seat `Full`). [figma-page-agent.md](figma-page-agent.md)의 결과물 폴더는 bluekey 팀이다.
- **도구.** remote 서버 하나에 41개가 실린다. 읽기는 `get_metadata`·`get_design_context`·`get_screenshot`·`get_variable_defs`·`get_libraries`·`search_design_system`, 쓰기는 `create_new_file`·`use_figma`(plugin API 코드를 넘겨 실행)·`generate_figma_design`(`captureId`를 받는 브라우저 캡처 기반), 그 밖에 Code Connect 도구 일곱과 FigJam·shader·Weave 도구다. desktop 서버는 시험하지 않았다.
- **라이브러리.** `@ooee/ui`를 반영한 Figma 라이브러리는 없다. `search_design_system("Button")`이 돌려준 것은 「🔵 BKDS 블루키 디자인 시스템」(button·iconButton·textButton·searchInput 등, `2026-09-09`까지 갱신)과 「[공차] 공차 ERP UI 디자인」뿐이다. 새 파일에는 Figma 기본 community 라이브러리(Material 3, Simple Design System, iOS 18)가 붙어 있다.
- **Code Connect.** 쓸 수 없다. `list_file_components_for_code_connect`가 「You need a Dev or Full seat on an Organization or Enterprise plan」을 돌려준다. bluekey는 Pro다.
- **쓰기.** `create_new_file`로 결과물 폴더(projectId `651781449`)에 `ooee · 관리자 로그인 · 2026-09-14`(file key `4fNHfA8YKtrhlIT7V76CAc`)를 만들고, `use_figma`에 plugin API 코드를 넘겨 1440×900 관리자 로그인 frame(node `1:2`)을 auto-layout으로 만들었다. 글꼴은 Figma에 있는 Inter를 썼고 Pretendard는 시험하지 않았다. Figma 변수가 없어서 색은 hex 근사값이고, 레이어 이름에 컴포넌트와 `oe` 토큰 이름을 적었다. 한 번 실패했다. auto-layout frame에 `resize`로 높이를 주면 크기가 고정돼 내용이 잘리며, `layoutSizingVertical = "HUG"`로 바꿔 해결했다.
- **재조회.** `get_metadata`는 레이어 이름과 좌표 XML을, `get_screenshot`은 1440×900 PNG의 7일짜리 URL을, `get_design_context`는 React+Tailwind 코드를 돌려준다. 그 코드는 `bg-[#1d4ed8]`·`text-[#171717]`·`font-['Inter:Medium']`처럼 값이 그대로 박혀 있고, `@ooee/ui` 컴포넌트나 `oe` 토큰은 `data-name`에 남은 레이어 이름 말고는 없다. [roadmap.md](roadmap.md)가 적은 A안의 경험이 그대로 재현된다.
- **결론.** ②(Figma 화면 생성)는 `use_figma`로 성립하고 ④(재조회)도 된다. 재조회 결과를 `@ooee/ui`로 되돌리려면 레이어 이름 규칙(`Button / 로그인 / layout=fill controlSize=xlarge / oe-brand-background-bold-primary`처럼 컴포넌트·Property·토큰을 이름에 적는다)과 Skill의 매핑표가 있어야 한다. Code Connect는 플랜상 쓸 수 없으므로 매핑표가 그 자리를 맡는다. A/B 검증의 A안은 「코드에서 만든 캔버스를 사람이 고친 뒤 재조회」로 돌린다.
- **남은 것.** 파일이 폴더 `651781449`에 들어갔는지는 API로 확인하지 못했다. `generate_figma_design`은 `captureId`가 필요해 시험하지 않았다. Pretendard 글꼴과 rate limit(`rate-limits-access.md` 리소스)은 다음에 본다.

### 2026-09-15 Skill v0: docs/system/만으로 화면 둘

- **만든 것.** `.claude/skills/generate-code/SKILL.md`, `.claude/skills/review-design/SKILL.md`, `apps/sandbox`(3001 포트의 Next.js 앱, `typecheck` script 없음, 자체 `test` script와 JSDOM 설정, Studio와 같은 브랜드 변수 주입). `claude -p "/review-design <파일>" --model sonnet`처럼 print mode에서도 프로젝트 Skill이 돈다. `--allowedTools`는 뒤따르는 인수를 모두 먹으므로 프롬프트를 그 앞에 둔다.
- **실행.** `claude --model sonnet`의 headless 세션 둘이 요청 문단 하나씩만 받아 관리자 로그인(`apps/sandbox/src/app/admin-login`)과 STO 지원요청(`apps/sandbox/src/app/sto-support-request`)을 만들었다. 사람이 코드를 고치지 않았다. 두 화면은 v0의 기록으로 그대로 두고, 아래 틀린 사례는 코드가 아니라 Skill 문구를 고쳐 막았다.
- **결과.** `pnpm --filter @ooee/sandbox build`·`test`(7건)와 `pnpm check`가 통과한다. 두 세션 모두 `/review-design` 위반 0건과 「pull request 준비 완료」를 냈다. `@ooee/ui` 재사용은 컴포넌트가 있는 요소 기준으로 STO 9/9, 관리자 로그인 4/4다. Property 이름과 값은 두 화면 모두 문서와 코드에 있는 것만 썼고 primitive 색과 shadcn 토큰은 0개다. 코드 절반은 Sonnet 수준으로 충분했고, 절차 절반(링크·Focus·아이콘·검사 실패 처리)은 Skill 문구가 부족했다.
- **v0가 틀린 사례.** 순서 4의 입력이다.
  - 관리자 로그인의 링크 셋(비밀번호 찾기·이용약관·개인정보처리방침)을 목적지가 없다는 이유로 `<button type="button">`으로 만들었다. 「라우팅 로직을 만들지 않는다」를 「`<a>`도 만들지 않는다」로 읽었다.
  - native 버튼의 Focus에 `ring-offset-2`가 없어 `interaction.md` 유형 3의 2px 간격이 빠졌다. Skill이 준 클래스 문자열 자체가 틀렸다.
  - 눈 아이콘을 `size-4`로 주고 hover 층과 `aria-hidden`을 두지 않았다. Skill 읽기 목록에 `foundations/icon.md`가 없었다.
  - 요청은 Footer만 가운데 정렬인데 제목 덩이까지 가운데로 세웠고 보고에 적지 않았다.
  - STO의 「긴급 요청」은 「요청 보내기」를 눌러야 반영되는데 요청의 낱말대로 `SwitchField`를 썼다. switch.md 「역할과 경계」는 Checkbox를 가리킨다. `/review-design`이 컴포넌트 문서의 「Properties」만 읽어 잡지 못했다.
  - 두 세션 모두 `pnpm check`가 `apps/studio/.next`의 옛 타입 파일로 실패했는데 「무관」으로 두고 「pull request 준비 완료」를 냈다. 한 세션은 공용 `test-setup.ts`에 `self`를 더하고 이유를 적지 않았다.
  - 머리말 주석이 요청을 요약해 선택지·placeholder 문구가 저장소에 남지 않았고, Select placeholder가 Field label을 반복했다. 테스트는 존재 여부만 보고 요청이 정한 기본값·마스킹·링크 role을 보지 않았다.
- **Skill에서 고친 것.** 링크는 목적지가 없어도 `<a href="#">`, 유형 3 Focus 문자열에 offset, `icon.md` 읽기와 `size-oe-icon-*`, 요청이 말하지 않은 정렬은 왼쪽, 요청과 문서가 어긋나면 문서를 따르고 보고, 세 파일 밖 수정과 캐시 삭제 금지, 검사가 실패하면 「검사 실패」로 보고, 요청 문단을 머리말에 그대로, `원본:` 경로를 `screens.ts`의 `source`에, 테스트 넷째 항목(요청이 정한 값과 동작). `/review-design`은 컴포넌트 문서 전체와 `icon.md`를 읽고 아이콘·초안 컴포넌트 항목과 「역할과 경계」 판단을 더했다.
- **docs/system/만으로 부족했던 것.** 둘이다. 폼 안의 짧은 단일 선택에서 `Select`와 `RadioField`를 가르는 문장이 select.md·radio.md에 없고 select-box.md에만 있다. checkbox.md 「Properties」에 필수 Property `label`이 없다. 둘 다 Storybook이 아니라 문서 한 줄로 채울 공백이며, 순서 3(Storybook)을 열 근거는 되지 않는다.
- **실행 방법.** 두 세션을 같은 working tree에서 동시에 돌려 서로의 쓰는 중인 테스트를 돌렸고 `screens.ts`를 함께 고쳤다. 다음부터 v0 세션은 하나가 「pull request 준비 완료」에 닿은 뒤 다음을 돌린다.

### 2026-09-15 고객의 소리: 코드에서 Figma 변수·텍스트 스타일로

- **화면.** `/generate-code`로 관리자 웹 「고객의 소리」(`apps/sandbox/src/app/voc`)를 만들었다. 필터 줄·처리 상태 칩·표·상세 답변 패널·페이지 이동이다. 사람이 고친 자리는 하나다. 상세 패널이 열리면 표가 남은 폭(약 736px)보다 넓어져 상태·담당자 열이 가로 스크롤에 가려져서, 유진식의 결정으로 패널이 열린 동안 고객·담당자 열을 숨겼다. `/review-design` 위반 0건, 테스트 16건, `pnpm check` 통과.
- **Figma 파일.** `ooee · 고객의 소리 · 2026-09-15`(file key `Iw2MXs9sfqtJFze7F9vGf5`)에 목록과 상세 열림 두 프레임을 만들었다. 칠 248개가 전부 변수에, 글자 146개가 전부 텍스트 스타일에 묶였다. auto-layout 프레임 100개, DOM 위치와 어긋나 absolute로 둔 자식 6개, 아이콘 14개(Remix SVG).
- **변수.** `oe color`(Light·Dark) 61개와 `oe size` 17개는 `packages/tokens`에서 옮겨 적었다. Button·Badge처럼 코드가 primitive 단계를 직접 쓰는 자리(`bg-blue-100`, `bg-[var(--brand-600)]`, Chip의 `--brand-alpha-*`)는 `oe primitive` 컬렉션에 필요한 것만 만들어 묶었다. 이 자리는 코드가 `dark:` class로 따로 두므로 Figma에서 모드를 바꿔도 뒤집히지 않는다.
- **글꼴.** Figma에 Pretendard Variable이 없어 Noto Sans KR로 임시 대체했고, Noto Sans KR에 SemiBold가 없어 `semibold` 스타일은 Bold다. 유진식이 승인했고 텍스트 스타일 설명에 적었다. 글자 폭이 넓어져 「내보내기」 버튼의 마지막 글자가 조금 잘린다.
- **다시 읽기.** `get_design_context`가 `bg-[var(--oe-background-secondary,#f5f5f5)]`처럼 변수 이름을 먼저 내고 hex는 대체값으로만 붙인다. 스파이크 R1에서 hex만 나오던 것이 풀렸으므로, 순서 6의 매핑표는 레이어 이름이 아니라 이 변수 이름을 1차 근거로 삼는다. Code Connect는 여전히 없어 컴포넌트(`Button`·`Select`)는 레이어 이름(`button`, `select-trigger` 등 `data-slot`)으로만 알 수 있다.
- **변환 도구.** `scripts/figma/`에 두었다. 브라우저에 뜬 화면을 `scripts/visual/inspect.mjs --eval`로 트리로 읽고, 조각으로 나눠 `use_figma`에 넘긴다. 만들며 부딪힌 것: Chrome이 Tailwind v4 색을 `lab()`·`oklab()`로 돌려줘 처음엔 테두리와 배지 배경이 빠졌다. 두 프레임의 조각 경로 이름이 같아 한쪽 요소가 다른 프레임에 들어갔다. Select의 숨은 1px input 값이 글자로 딸려 왔다. 모두 도구에서 고쳤다. `use_figma`는 50,000자 제한이 있고 `setPluginData` 대신 `setSharedPluginData`만 된다.
- **판단이 필요한 것.** 처리 상태 칩이 「하나만 켜짐」인데 chip.md는 그 동작을 Tab의 역할로 규정하고 Tab 컴포넌트는 없다. 매장·유형 Select를 Field 없이 필터 줄에 단독으로 썼다. 기간은 요청대로 Trigger 하나인데 input-button.md는 둘로 나누라고 한다. Table 컴포넌트가 없어 native `table`이다.
