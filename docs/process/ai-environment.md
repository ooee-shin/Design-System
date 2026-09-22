# AI 개발 환경 구축 계획

개발자가 맡은 AI 개발 환경 트랙의 순서, 결정, 스파이크 결과와 `dev → main` 통합 검증 항목을 채워 가는 기록이다. AX 전환 단계의 정의는 [roadmap.md](roadmap.md), branch 절차는 [git-workflow.md](git-workflow.md), 현재 상태는 [working-context.md](working-context.md), 시스템 정의는 `docs/system/`이 소유하며 여기에 다시 적지 않는다. `AGENTS.md`·Skill·`.mcp.json`을 전달 자산으로 삼게 되면 이 문서의 이관 시 위치는 「이관 시 남기는 것」이 정한다.

## 목표와 범위

최종 목표는 기획자가 화면 구성을 프롬프트로 적으면 검수를 거쳐 개발자에게 전달되는 흐름이다. Claude Code에 설치하면 `/review-design`, `/generate-code` 명령으로 다음 단계를 수행하는 Skill 또는 Plugin을 만든다. **②④(Figma)는 `2026-09-23` 에 뺐다** — 결과는 sandbox 에서 본다(「2026-09-23 Figma 를 뺐다」).

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

명령과 단계의 대응은 `/generate-code`가 ①⑤⑥⑦⑧, `/review-design`이 ③이다. ②④를 맡던 `/design-page`는 `2026-09-23` 에 지웠다. `/review-design`은 만든 화면 코드를 `docs/system/quality.md`의 항목에 하나씩 대조해 위반 목록을 내므로 Figma 없이 돈다. 순서 2의 완료 기준과 A/B 검증의 「위반 수」는 이 목록의 항목 수다. 「pull request 준비 완료」는 ⑧의 끝으로, `pnpm check`와 `apps/sandbox` 검사가 통과한 미커밋 working tree에서 `.github/pull_request_template.md` 양식으로 쓴 본문 초안을 대화에 제시한 상태다.

[roadmap.md](roadmap.md)의 5단계(이하 roadmap N단계)와 대응하면 ①⑤는 roadmap 3단계(스토리북 MCP), ②④는 roadmap 2단계(Figma MCP), 나머지는 roadmap 4·5단계(에이전트 룰, 자동화)다. roadmap.md는 4·5단계를 1차 제외로 두고 [working-context.md](working-context.md)의 「일정과 분담」은 `2026-09-20`부터 `2026-09-23`까지 그 테스트를 잡아 두었다. 이 문서는 roadmap 4·5단계를 **개발자 트랙의 검증용 실험 구현**으로 다룬다. roadmap.md와 루트 `README.md`의 1차 범위 문구를 고칠지는 「아직 정하지 않은 것」에 있다. 이 문서에서 「순서 N」은 「순서와 의존 관계」의 0~8 번호다.

## 지금 저장소에 있는 것

계획을 세우기 전에 `2026-09-14` 기준으로 확인한 상태다. [git-workflow.md](git-workflow.md)의 「dev에서 main으로 올릴 때」가 통합 검증 항목 다섯 중 넷은 아직 대상이 없다고 한 것과 같은 결론이며, 아래 표에서 「없음」인 네 줄이 그 넷이다.

| 항목 | 상태 | 근거 |
| --- | --- | --- |
| Storybook과 Story | 없음 | `.storybook/`, `*.stories.*`, storybook 의존성이 어느 package에도 없다. `.gitignore`의 `storybook-static/`과 문서의 언급만 있다 |
| Storybook MCP | 없음 | 위와 같다 |
| Figma MCP와 Figma 라이브러리 | 없음 | `.mcp.json`이 없다. Figma 팀과 결과물 폴더는 [figma-page-agent.md](figma-page-agent.md)에 있지만 `@ooee/ui`를 반영한 라이브러리는 없다(스파이크 R1에서 확인). Obra 자료는 참고용이다. 순서 6이 `.mcp.json`을 만들었고 라이브러리는 여전히 없다 |
| Agent Rules와 `AGENTS.md` | 운영 규칙만 있음 | MCP 사용, Story 작성, 명령어, 자동 pull request에 관한 규칙이 없다. 순서 4가 「Claude Code 명령과 권한」 절과 공용 권한을 넣었다 |
| Skill과 Plugin | 없음 | `.claude/settings.json`은 `{ "enabledPlugins": {} }` 하나다. [tooling.md](tooling.md)가 프로젝트 전용 Skill의 내용 목록을 적어 두었다. Skill 셋은 순서 2·7이 넣었고 Plugin은 아직 없다 |
| 배포와 CI | `Quality`만 있음 | `pnpm check`만 돌고 배포 job이 없다. GitHub Pages는 공식 문서 기준으로 비공개 저장소의 무료 플랜에서 쓸 수 없으므로 [working-context.md](working-context.md) 「일정과 분담」의 `~9/4` GitHub Pages 호스팅은 성립하지 않았고, 호스팅은 스파이크 R4가 정한다 |

**Skill이 바로 쓸 수 있는 재료는 이미 있다.** `docs/system/`은 Sonnet 수준의 에이전트가 그 문서만 보고 코드를 만들도록 쓰였고(`docs/system/README.md`의 「이 문서의 독자」), 컴포넌트 문서는 Property 값을 코드 문자열 그대로 적는다. `packages/ui/package.json`의 exports가 import 경로를, `scripts/visual/inspect.mjs`가 화면 측정을, `.github/pull_request_template.md`가 pull request 양식을 준다. [roadmap.md](roadmap.md)의 「A/B 비교 검증」이 지금까지의 경험상 낫다고 적은 B안(컴포넌트만 주고 코드 생성)이 바로 이 조합이다.

## 용어와 전제

- **Storybook MCP는 Studio가 아니다.** Studio는 MCP를 제공하지 않는다. Storybook MCP는 `@storybook/addon-mcp`가 Storybook 개발 서버의 `http://localhost:6006/mcp`로 제공한다. `build-storybook`으로 만든 정적 결과물은 `/mcp`를 제공하지 않으므로, 여러 사람이 공유하는 endpoint는 Chromatic 같은 호스팅이나 정적 결과물 위에 별도로 띄우는 `@storybook/mcp`가 필요하다. Studio에 MCP가 없다는 것은 저장소에서 확인했고, 나머지는 Storybook 공식 문서 기준이며 스파이크 R2에서 이 저장소로 확인한다.
- **`docs-list`·`docs-show`는 `@storybook/addon-mcp`의 `docs` toolset에 드는 MCP 도구 이름이다.** 이 toolset은 components manifest가 있어야 켜지고, manifest는 `.storybook/main.ts`의 `features.componentsManifest: true`가 만든다. 역시 공식 문서 기준이며 스파이크 R2에서 확인한다.
- **Figma MCP의 읽기와 쓰기는 다른 도구다.** 공식 문서 기준으로 노드를 읽는 `get_metadata` 같은 도구는 desktop·remote 서버 모두에 있고, 화면을 만드는 `generate_figma_design`과 `use_figma`는 remote 서버 전용이며 beta다. 도구 이름과 seat·플랜 조건은 스파이크 R1이 개발자 계정으로 확인했다(「스파이크 결과」). seat는 Figma 계정의 종류이고 `whoami`가 `Full`로 돌려준다. Code Connect는 Figma 컴포넌트를 코드 구현과 잇는 Figma 기능이며 bluekey의 Pro 플랜에서는 쓸 수 없다.
- **패키지 이름은 `@ooee/ui`다.** 저장소 밖의 초기 계획 메모에 적힌 `@repo/ui`는 이 이름을 가리키며, 저장소 안의 문서와 코드는 `@ooee/ui`만 쓴다.
- **「Sonnet 수준의 모델」은 Claude Code를 `claude --model sonnet`으로 띄운 세션이다.** [roadmap.md](roadmap.md)의 「목표 품질은 Sonnet 수준의 낮은 모델로도」를 실행 방법으로 옮긴 것이다. `sonnet`은 그 시점의 최신 Sonnet을 가리키므로 순서 2의 결과 절과 A/B 결과에는 실제로 돈 모델의 전체 이름을 적는다.
- **로컬 Storybook은 Studio의 브랜드 변수 주입에 기대지 못한다.** Brand 값이 `packages/tokens`가 아니라 Studio의 `BrandThemeProvider`와 `globals.css`에 있다는 사실은 [working-context.md](working-context.md)의 「현재 구현」이 적는다. `packages/ui`에서 Button·Badge·ToggleButton은 `var(--brand-{단계})`를, Chip·SelectBox·Combobox는 `var(--brand-alpha-*)`를 직접 쓰고, Checkbox·Radio의 선택 색과 Chip의 Active 글자, Combobox·Select의 선택 Check 표시는 `oe-brand-*`, `focus-visible` 색은 전부 `oe-focus-ring`이다. 그래서 Storybook이 Studio 없이 `@ooee/tokens/styles.css`만 불러오면 Brand tone뿐 아니라 Checkbox·Radio·Chip·Combobox·Select의 선택 표현과 모든 Focus ring이 비어서 나온다. 순서 3은 Storybook decorator가 `DEFAULT_BRAND_SEED`에서 Studio와 같은 값을 넣는 방식으로 시작하며 `packages/tokens`와 `apps/studio/src/app/globals.css`는 건드리지 않는다. 기본 브랜드 값을 `packages/tokens`로 옮길지는 「아직 정하지 않은 것」에 있다.

## 순서와 의존 관계

```text
0 이 문서
1 Figma 확인 질문 + 스파이크 R1                   2와 독립. 질문은 비용이 없고 답을 기다린다
2 Skill v0                                        docs/system/ + @ooee/ui만으로 /generate-code · /review-design
  ↓
3 (하지 않기로 했다)                               Storybook·Storybook MCP. 2026-09-18 개발자 결정 — 아래 「스파이크 결과」
  ↓
4 Agent Rules                                     v0가 실제로 필요로 한 규칙만
  ↓
5 (하지 않기로 했다)                               Storybook 배포·CI. 순서 3 과 함께 걷어냈다
  ↓
6 Figma MCP 읽기 + 컴포넌트 매핑표                 seat가 있어야 함. 라이브러리는 없는 채로 간다
  ↓
7 /design-page                                    ② 쓰기(6보다 먼저 만들었다) + ④ 재조회(6 뒤)
  ↓
8 패키지화
```

Storybook보다 Skill v0를 앞에 둔 이유는 둘이다. 첫째, ①⑥⑧과 ⑤의 `@ooee/ui` 조회, ⑦의 테스트에 Skill이 필요로 하는 재료가 이미 있어서 Storybook 없이 성립한다. ⑤의 Storybook 조회와 ⑦의 Story 생성은 순서 3 뒤에 덧붙인다. 둘째, A/B 검증의 B안 기준선이 Storybook 스파이크의 성패에 묶이지 않는다. 셋째, Storybook을 만들지 자체가 「아직 정하지 않은 것」에 있어서 순서 3은 조건부다. Figma를 뒤에 둔 이유는 라이브러리·seat·Code Connect가 없는 채로는 roadmap.md가 적은 A안의 경험이 반복될 뿐이기 때문이다.

순서 7의 ②(`/design-page`의 쓰기)는 `2026-09-15`에 순서 3~6보다 먼저 만들었다. 라이브러리와 Code Connect는 여전히 없지만, 「스파이크 결과」의 「고객의 소리」에서 칠과 글자를 `oe` 변수·텍스트 스타일에 묶으면 `get_design_context`가 hex 대신 변수 이름을 돌려준다는 것을 확인했다. 그래서 A안의 경험이 반복된다는 앞의 이유는 ②에 해당하지 않는다. ④ 재조회와 매핑표는 순서 6 뒤에 그대로 둔다. Figma MCP는 순서 6이 `.mcp.json`을 만들기 전까지 기기의 사용자 설정으로 쓴다.

순서 1·2의 산출물 가운데 이 문서에 적는 것(Figma 항목 답변, 스파이크 R1 결과 절, Skill v0 결과 절)은 순서 0의 pull request가 `dev`에 합쳐진 뒤 별도 pull request로 낸다. 순서 0이 열려 있는 동안에도 확인 질문, 스파이크 R1, Skill v0 작성은 막히지 않는다. R1이 Figma remote MCP를 Claude Code에 잇는 설정은 저장소에 넣지 않고 `claude mcp add`로 기기의 Claude Code 설정에 두며, `.mcp.json`의 Figma 항목은 순서 6이 만든다. 각 순서의 pull request가 함께 고치는 기존 문서는 「갱신 대상 문서」에 있다.

| 순서 | branch | 산출물 | 완료 기준 |
| --- | --- | --- | --- |
| 0 | `docs/ai-environment-plan` | 이 문서, [figma-page-agent.md](figma-page-agent.md), [README.md](README.md) 색인 두 행, [working-context.md](working-context.md) 「현재 구현」 `packages/tokens` 항목의 Brand 변수 위치 수정, 새 절 하나, 「일정과 분담」의 `~9/4`·`9/14~` 두 행 | pull request가 `dev`에 합쳐진다 |
| 1 | `docs/figma-spike-r1` | Figma 항목 답변과 스파이크 R1 결과를 담은 「스파이크 결과」 한 절 | 그 절이 적히고 「아직 정하지 않은 것」의 Figma 행이 답으로 바뀐다 |
| 2 | `feature/skill-generate-code` | `.claude/skills/generate-code/SKILL.md`, `.claude/skills/review-design/SKILL.md`, `apps/sandbox`, v0가 틀린 사례를 적은 결과 절 | Sonnet 수준의 모델로 화면 둘을 만들어 `pnpm check`, `pnpm --filter @ooee/sandbox build`, `pnpm --filter @ooee/sandbox test` 통과, `/review-design` 위반 0건, 「pull request 준비 완료」까지 도달 |
| 3 | `feature/storybook`, 그 뒤 `feature/storybook-mcp` | 순서 2의 결과 절에 `docs/system/`만으로 부족했던 것이 적힐 때만 진행한다. `feature/storybook`: `apps/storybook`, 확정 컴포넌트마다 `Default` Story 하나(「아직 정하지 않은 것」의 기획자 확인 뒤), 브랜드 변수 주입 decorator. `feature/storybook-mcp`: `.mcp.json`에 storybook 항목 추가(파일은 순서 6이 만들었다), `apps/storybook`에 `@storybook/addon-mcp`와 `features.componentsManifest` 추가 | `feature/storybook`: `pnpm build-storybook` 성공, Brand tone·`brand-alpha-*`와 `oe-brand-*`의 선택 표현·Focus ring이 Studio 없이 보임. `feature/storybook-mcp`: `docs-list` 응답에 `component-registry`의 `확정` 항목마다 대응 항목이 하나씩 있음(대조 방법은 「통합 검증 항목 채우기」) |
| 4 | `feature/agent-rules` | `AGENTS.md` 한 절, `SKILL.md` 규칙, `.claude/settings.json` 공용 권한, `apps/sandbox/src/screen-rules.ts`와 그 테스트, 결과 절 | 순서 2의 결과 절에 적힌 틀린 사례가 규칙으로 막힌다 |
| 5 | `feature/storybook-ci` | `.github/workflows/storybook.yml`, 호스팅 | pull request마다 `build-storybook` 검사, `dev`·`main`에 주소가 생긴다 |
| 6 | `feature/figma-mcp` | `.mcp.json` Figma 항목, [figma-component-map.md](figma-component-map.md), 관련 문서 갱신 | 저장소 루트에서 연 세션이 `.mcp.json`의 figma 서버를 싣고, `get_metadata`가 `Iw2MXs9sfqtJFze7F9vGf5`의 「고객의 소리」 프레임을 돌려주며, 그 레이어 이름이 매핑표의 항목으로 풀린다(풀리지 않는 이름은 표의 「되짚지 않는 것」에 있다) |
| 7 | `feature/skill-design-page` | ②: `.claude/skills/design-page/SKILL.md`, `scripts/figma/`의 `prepare.mjs`·`audit.js`와 보강한 변환 도구, 결과 절. ④는 순서 6 뒤에 같은 명령에 더한다. ④의 산출물은 `scripts/figma/`의 재조회·차이 판정 도구와 그 픽스처 테스트, `SKILL.md`의 「되읽기」 절, ②가 남기는 기준선(프레임을 그린 커밋과 파일 key)이며 근거는 [figma-component-map.md](figma-component-map.md)다. 규칙의 출발점은 [figma-page-agent.md](figma-page-agent.md) | ②: Sonnet 수준의 모델이 `/design-page`를 돌려 audit의 `missingFrames`·`unboundPaints`·`textsWithoutStyle`이 모두 비고 보고까지 간다. ④: 사람이 Figma에서 고친 것 셋을 다시 읽어 그 셋만 화면 코드에 반영하고, 되짚을 수 없는 것은 「사람이 정할 것」으로 낸다 |
| 8 | `feature/agent-kit` | `plugins/ooee-harness/`(plugin.json, skills/, lib/screen-rules, README의 권한 조각, .mcp.json), 저장소 루트 `.claude-plugin/marketplace.json`, 루트 `package.json` 검사 연결, `.claude/skills/` 제거 | `docs/system/`·`packages/`·`apps/studio`만 담은 사본 저장소에서 Plugin을 설치해 `/ooee-harness:generate-code`가 「pull request 준비 완료」까지 간다. Plugin Skill은 이름 앞에 Plugin 이름이 붙으므로 명령 이름이 바뀐다 |

## 이 문서가 제안하는 기본값

아래 항목은 각 순서의 pull request 본문에 적고 합칠 때 확정한다. 상대 담당 영역에 닿는 항목은 여기 두지 않고 「아직 정하지 않은 것」에 담당과 기한을 붙여 둔다.

- **Skill은 파일을 먼저 읽고 MCP는 덧붙인다.** ①의 1차 원본은 `docs/system/README.md`의 컴포넌트 표와 각 컴포넌트 문서이고, Storybook MCP의 `docs-list`·`docs-show`는 `http://localhost:6006/mcp`가 열려 있을 때만 추가로 쓴다. 기획자가 개발 서버를 띄우지 못해도 ①이 성립해야 하기 때문이다. 이 전제는 기획자가 이 저장소를 clone한 기기에서 Claude Code를 돌린다는 뜻이다. ⑥⑦이 코드와 Story를 쓰고 `pnpm check`와 `apps/sandbox` 검사를 돌리는 자리도 그 저장소이므로, 개발 서버가 없을 때 빠지는 것은 Storybook MCP 조회뿐이다. 기획자가 그 환경을 직접 갖출지는 「아직 정하지 않은 것」에 있다.
- **Storybook은 Skill의 전제가 아니다.** ①⑤는 `docs/system/`과 `packages/ui/package.json`의 exports를 직접 읽어 성립하고, 기획자와 개발자가 화면에서 컴포넌트를 보는 채널은 이미 Studio의 Playground와 Docs 메뉴가 맡는다. Storybook MCP가 더 주는 것은 TS 타입에서 뽑은 Property 목록과 Story 예시인데, 앞의 것은 컴포넌트 문서가 코드 문자열 그대로 갖고 있다. 그래서 순서 3은 순서 2의 결과 절에 「`docs/system/`만으로 부족했던 것」이 적힐 때만 진행한다. 부족한 것이 저장소 밖에서 조회할 endpoint뿐이면 Storybook 대신 Studio가 `component-registry`와 `docs/system/`을 JSON으로 내는 route와 그 위의 MCP를 먼저 검토한다. Storybook 자체를 만들지는 [roadmap.md](roadmap.md)의 결정이라 「아직 정하지 않은 것」에 있다.
- **`.mcp.json`은 저장소 루트에 URL만 적어 commit한다.** secret과 기기별 값은 `.claude/settings.local.json`과 `.env.local`에 둔다. 첫 환경변수가 생기는 pull request에서 `.env.example`을 만든다.
- **`build-storybook`은 `pnpm check`에 넣지 않는다.** `Quality`의 15분 제한 안에 두 빌드를 겹치지 않도록 별도 workflow로 검사한다.
- **Skill이 만든 기획자 화면은 전달 범위 밖의 `apps/sandbox`에 둔다.** `apps/studio`는 그 자체가 전달 대상이므로 생성 결과를 거기에 두지 않는다. 기획자가 제품 화면을 한 건씩 만드는 작업장(블루키 리뉴얼)도 `2026-09-23` 에 Studio 의 `/screens` 에서 sandbox 의 `/renewal` 로 옮겼다. 생성 화면을 제품 화면으로 채택할지는 기획자가 정한다. `apps/sandbox`는 Studio와 같은 Next.js 앱이며 Studio처럼 `typecheck` script를 두지 않는다. 루트 `typecheck`가 `pnpm -r typecheck`라서 workspace package에 그 script가 있으면 `pnpm check`에 자동으로 들어오고, `lint`·`build`·`test`는 `apps/sandbox`를 가리키지 않으므로, 이렇게 두면 `apps/sandbox`는 `pnpm check` 밖에 남는다. 검사는 `pnpm --filter @ooee/sandbox build`와, `apps/sandbox`의 `*.test.tsx`를 도는 자체 `test` script(`pnpm --filter @ooee/sandbox test`)로 한다. v0에서 ⑦의 테스트는 이 `*.test.tsx`다. 전달 시 `docs/process/`와 함께 제거한다.
- **v0가 만드는 화면 둘은 정해 둔다.** 하나는 관리자 로그인으로, `apps/studio/src/app/screens/admin/login/page.tsx`가 원본이다. 그 파일의 머리말 주석과 [sources.md](sources.md)의 Auth split screen 설명만 프롬프트로 주어 다시 만들고, 원본과 `@ooee/ui` 재사용을 대조한다. 다른 하나는 STO 지원요청 화면으로, `/screens/*`에 원본도 없고 `screen-registry`에도 항목이 없으므로 원본이 없는 기획자 요청에 해당한다. 둘 다 `apps/sandbox`에 만들며 `/screens/*`에는 두지 않는다. A/B 검증은 같은 화면 둘로 비교한다.
- **Figma는 디자인 원본이 아니라 검토용 캔버스로 시작한다.** 코드로 먼저 만든 화면을 Figma에 올리고, 사람이 고친 뒤 다시 읽어 코드로 돌아오는 순서다. roadmap.md의 「현재까지의 경험은 B안이 낫다」와 맞는 순서이며, A/B 검증에서 이 전제를 처음 확인한다.
- **명령은 pull request를 만들지 않고 멈춘다.** `AGENTS.md`의 「화면 확정 검수」와 「여러 환경에서 이어서 작업할 때」가 정한 대로 commit·push·pull request 생성은 사용자의 명시적 요청이 필요하다. pull request는 순서 4에서 그 두 곳에 더했다. 명령은 「pull request 준비 완료」에서 멈추고 사용자가 요청하면 만든다.
- **컴포넌트나 Story만 바뀐 pull request는 MCP·Skill 항목을 기다리지 않는다.** `dev → main`의 diff에 `apps/storybook/`, `.mcp.json`, `.claude/`, `AGENTS.md` 중 하나가 있을 때만 개발자가 「통합 검증 항목 채우기」의 명령을 실행하고 결과를 pull request 본문에 남긴다. [git-workflow.md](git-workflow.md)의 「dev에서 main으로 올릴 때」에 넣을 문구다.

## 스파이크

스파이크와 Skill v0의 결과는 「스파이크 결과」에 `### 2026-09-xx 제목` 절로 덧붙인다.

| 번호 | 질문 | 비용 | 완료 기준 |
| --- | --- | --- | --- |
| R1 | Figma remote MCP의 `generate_figma_design`·`use_figma`가 개발자 계정과 seat에서 되는가. 결과가 라이브러리에 묶이는가. 대상 폴더는 [figma-page-agent.md](figma-page-agent.md)의 결과물 폴더다 | 반나절 | 어느 서버에 어느 도구가 있는지, seat와 플랜 조건, 결과 frame의 상태가 적힌다 |
| R2 | Storybook과 `@storybook/addon-mcp`가 이 스택(Tailwind v4, `private: true` 소스 export, Node 22.22.1)에서 도는가. `features.componentsManifest`가 `docs` toolset을 켜는가. Studio 없이 Brand tone·`brand-alpha-*`와 `oe-brand-*`의 선택 표현·Focus ring이 보이는가 | 하루 | `pnpm build-storybook` 성공, `docs-list` 응답, Brand Button 배경·Checked Checkbox·Active Chip·Focus ring이 보이는 스크린샷 |
| R3 | 이관 뒤 `AGENTS.md`·Skill·`.mcp.json`이 어디에 남는가 | 반나절 | 「이관 시 남기는 것」이 채워진다. `2026-09-16` 완료 |
| R4 | 비공개 무료 플랜에서 Storybook을 어디에 올리는가 | 반나절 | 호스팅 하나가 정해지고 secret 이름이 정해진다 |

## 통합 검증 항목 채우기

[git-workflow.md](git-workflow.md)의 「dev에서 main으로 올릴 때」 다섯 항목을 대상이 생기는 순서대로 실행 가능한 명령으로 바꾼다. Storybook 항목 둘은 「아직 정하지 않은 것」의 Storybook 결정을 따르며, Storybook을 만들지 않기로 하면 그 자리에 Studio 조회 항목을 둔다.

| 항목 | 명령 또는 확인 | 생기는 순서 |
| --- | --- | --- |
| Storybook이 정상으로 뜨는가 | `pnpm build-storybook` (pull request 자동 검사) | 3, 5 |
| 컴포넌트가 서로 충돌하지 않는가 | `pnpm check`. 순서 3부터는 `pnpm build-storybook` 뒤 `storybook-static/index.json`(공식 문서 기준 항목마다 `title`·`importPath`를 가진다. 스파이크 R2의 결과물로 확인)에서 같은 `title`이 서로 다른 `importPath`에 나오지 않음 | 지금부터, 3 |
| Figma MCP 조회가 정상인가 | 저장소 루트에서 연 세션이 `.mcp.json`의 figma 서버를 싣고 `get_metadata`가 `Iw2MXs9sfqtJFze7F9vGf5`의 「고객의 소리」 프레임을 돌려준다. 레이어 이름은 [figma-component-map.md](figma-component-map.md)로 푼다 | 6 |
| Storybook MCP 조회가 정상인가 | `docs-list` 응답에 `component-registry`의 `확정` 항목마다 대응 항목이 하나씩 있다. 대응은 그 Story가 import하는 `packages/ui/src/<key>.tsx`로 확인한다(registry `key`는 그 파일 이름과 같다). 응답의 어느 필드를 registry의 어느 필드와 맞출지는 스파이크 R2 결과와 Story 위치 결정 뒤 순서 3의 pull request 본문에 적고 이 칸을 그 규칙으로 고친다 | 3 |
| Skill과 Agent가 동작하는가 | `pnpm --filter @ooee/sandbox test`(`screen-rules` 포함) 통과. `/generate-code`를 「이 문서가 제안하는 기본값」의 관리자 로그인 프롬프트로 저장소 루트에서 연 세션에서 한 번 돌려 `admin-login-2` 같은 새 key로 「pull request 준비 완료」까지 간다. 같은 세션의 `/permissions`에 `.claude/settings.json` 출처의 `ask`·`deny` 규칙이 보인다 | 2, 4 |

## A/B 검증

[roadmap.md](roadmap.md)의 「A/B 비교 검증」이 정한 두 안을 이 트랙의 산출물로 채운다. 비교는 이때 처음 돌며 시기는 「일정」에 있다.

| 안 | 방식 | 준비되는 순서 |
| --- | --- | --- |
| B | Skill v0. `docs/system/` + `@ooee/ui`만으로 코드 생성 | 2 |
| A | Figma를 경유. 「이 문서가 제안하는 기본값」의 화면 둘을 `/design-page`(순서 7의 ②)로 옮긴 frame을 사람이 고치고 다시 읽은 결과로 돌린다. 재조회한 `get_design_context` 결과(변수 이름)와 레이어 이름을 화면 설명 대신 Skill v0의 `/generate-code`에 입력으로 주고, 그것을 컴포넌트와 Property로 되짚는 근거로 [figma-component-map.md](figma-component-map.md)를 함께 준다. 만든 코드에 `/review-design`을 돌린다. 매핑표가 없으면 레이어 이름이 무엇을 가리키는지 알 길이 없어 A안의 판정 지표(위반 수, `@ooee/ui` 재사용 비율)가 「사전이 없어서」 나빠지므로, 순서 6을 A/B보다 먼저 했다. 「Figma가 원본」과 「코드에서 만든 캔버스를 사람이 고친 뒤 재조회」 중 어느 쪽인지는 그 결과가 정한다 | 2, 7 |

판정 기준은 두 안이 만든 코드에 대한 `/review-design`의 위반 수, `@ooee/ui` 재사용 비율, Sonnet 수준의 모델로 돌렸을 때의 결과다. 재사용 비율은 화면에서 `docs/system/README.md` 컴포넌트 표의 확정 컴포넌트가 맡는 역할(버튼·입력·선택 등)을 가진 요소 가운데 `@ooee/ui` import로 만든 것의 수를 그 요소 전체 수로 나눈 값이며, 레이아웃용 요소는 세지 않는다. 결과는 roadmap.md의 「A/B 비교 검증」에 적는다.

## 요청 폼

기획자가 화면을 요청하는 입구를 Slack 폼으로 둔다. 기획자는 GitHub 계정이 있지만 그 화면에 익숙하지 않아서, 요청을 issue 본문으로 직접 받으면 아래 칸들이 지켜지지 않는다. 폼이 칸을 강제하면 그 문제가 구조적으로 사라진다. 워크스페이스가 유료 플랜이라 폼과 이모지 리액션 트리거, 커넥터를 모두 쓸 수 있다.

**요청 문단의 원본은 GitHub issue 본문이고 Slack은 입구와 알림만 맡는다.** 대조할 자리가 하나여야 요청서가 사본으로 검증되기 때문이다. Slack 메시지는 편집 이력이 남지 않고, 저장소 밖에서 읽으려면 봇 토큰이 필요하며, 무료 워크스페이스에서는 90일 뒤 숨겨지고 1년 뒤 지워진다.

이 자리에 Claude를 넣지 않는다. Slack MCP는 사용자별 OAuth라 각자 자기 권한으로 스레드를 **읽어 오는** 데는 쓸 수 있지만, 세션이 살아 있을 때 당기는 도구여서 폼 제출도 리액션도 세션을 깨우지 못하고, 폼 제출 콜백은 앱의 URL로 가므로 MCP 서버가 그 자리에 설 수 없다. 옮겨 적는 일 자체를 모델에게 맡기지 않는 까닭은 따로 있다. 이 흐름의 검사가 바이트 대조라서 조립은 결정론적인 쪽이 맡아야 한다.

### 다섯 칸

| 칸 | 라벨 | 형식 |
| --- | --- | --- |
| 1 | 화면 이름 | 한 줄 · 필수 |
| 2 | 이 화면이 하는 일 (프롬프트) | 긴 답변 · 필수 |
| 3 | 비슷한 기존 화면 | 한 줄 · 선택 |
| 4 | 저장하거나 제출하면 무슨 일이 일어나야 하나요? | 긴 답변 · 선택 |
| 5 | 프로젝트 | 라디오 버튼 `sto` · `sv` · `web` · 필수 |

처음에는 여섯 칸이었고 「이번에 만들지 않는 것」과 「아직 안 정해진 것」이 필수로 있었다. `2026-09-21`에 개발자가 둘을 뺐다. 프롬프트 한 칸이 그 내용을 담는다는 판단이다. **대가는 빈 칸과 「없음」의 구분이 사라진 것이다.** 안 적힌 것이 「정해졌다」로 읽히면 만드는 쪽이 임의로 정하므로, 기획자에게 「안 정한 것은 안 정했다고 프롬프트에 쓴다」를 말로 전한다.

각 칸의 설명문은 아래를 그대로 넣는다. 폼 안내문은 「화면 하나를 요청하는 자리입니다. 여기 적은 문단이 그대로 개발과 검수의 기준이 됩니다.」로 둔다.

```text
1 · 화면 이름
이 화면을 부르는 이름을 하나만 적어 주세요.
메뉴에 보이는 말 그대로가 가장 좋습니다. 예: STO 지원요청 작성

2 · 이 화면이 하는 일 (프롬프트)
무엇을 보여 주고 무엇을 하게 하는 화면인지 이어지는 문장으로 씁니다.
화면에 실제로 보일 항목, 선택지, 기본값, 버튼 문구를 빠뜨리지 마세요.
목록으로 끊지 말고 한 문단으로 써 주세요.

3 · 비슷한 기존 화면
있으면 화면 이름이나 주소를 적습니다. 새로 만드는 화면이면 비워 두세요.

4 · 저장하거나 제출하면 무슨 일이 일어나야 하나요?
버튼을 눌렀을 때 값이 어디로 가고, 사람에게 다음에 무엇이 보여야 하는지 씁니다.
기술 용어는 몰라도 됩니다. 해당 없으면 「없음」이라고 적어 주세요.

5 · 프로젝트
이 화면이 어느 것에 들어가는지 고릅니다.
점주 앱은 sto, 슈퍼바이저 앱은 sv, 웹은 web 입니다.
```

`sto` · `sv` · `web` 세 값은 `apps/sandbox/src/screens.ts` 의 `SANDBOX_PROJECTS` 가 가진 `id` 와 같다. 기획자가 고른 값이 이슈 본문에 그대로 실려 오고 화면을 만들 때 그 값을 목록에 적기 때문이다. **한쪽을 고치면 다른 쪽도 고친다.**

### 이슈 본문

「문제 생성」 단계가 제목을 `화면 요청: <화면 이름>`으로 만들고 본문을 이렇게 채운다.

```md
요청자: <양식을 제출한 사용자>
프로젝트: <프로젝트>
요구사항: <이 화면이 하는 일 (프롬프트)>
비슷한 기존 화면: <비슷한 기존 화면>
제출하면 일어나는 일: <저장하거나 제출하면 무슨 일이 일어나야 하나요?>
```

### 채널 카드

```text
요청자: <제출한 사람>
프로젝트: <프로젝트>
화면 이름: <화면 이름>
요구사항: <프롬프트>
비슷한 기존 화면: <비슷한 기존 화면>
저장하거나 제출하면 무슨 일이 일어나야 하나요?: <답변>
─ 내용이 맞으면 이 메시지에 ✅ 를 달아 주세요. 그때부터 작업이 시작됩니다.
이슈: <문제 URL>
```

### 지금 도는 모양

`2026-09-21` 기준으로 워크플로 「화면 요청」이 채널 `#디자인시스템-화면-요청`에 게시되어 있고 세 단계다.

```text
① 양식에서 정보 수집
→ ② GitHub 「문제 생성」 (bluekey-kr/Design-System-Harness)
→ ③ 채널에 메시지 보내기
```

이슈를 먼저 만드는 것은 카드에 이슈 링크를 실으려고 그렇게 둔 것이다. 커넥터가 쓰는 GitHub 계정은 `YUJINSIK-momo`로 고정해 두어서 기획자가 자기 GitHub을 연결하지 않아도 돈다. 처음에는 이 채널에 `/github subscribe bluekey-kr/Design-System-Harness issues comments`를 걸어 이슈와 댓글이 같은 자리로 돌아오게 했다. 처리 결과를 결과 채널로 옮기면서 이 채널의 `comments` 구독은 끊는다(「처리와 승인」의 구독 명령).

### 만들면서 확인된 것

- **파일 업로드 답변은 이슈 본문에 넣지 못한다.** 넣으면 「문제 생성」이 시작도 못 하고 `parameter_validation_failed`로 죽는다. 이슈 본문은 문자열만 받는다. 그래서 3번 칸은 파일이 아니라 한 줄 텍스트다.
- **GitHub 웹에서 되는 끌어다 놓기는 커넥터로 못 한다.** 웹 편집기가 파일을 GitHub 쪽에 올려 주는 것이고, 커넥터가 보내는 것은 제목과 본문 문자열뿐이다. 이미지는 Slack 카드 아래에 남으므로 필요하면 사람이 이슈로 옮긴다.
- **조건 분기(「브랜치 추가」)는 Business+ 전용이다.** 「리액션을 단 사람 == 요청자」 같은 검사를 워크플로 안에서 할 수 없다. 대조는 댓글에 남긴 이름으로 저장소 쪽에서 한다.
- **워크플로가 실패하면 ⋮ → 「내 활동 로그」에 단계별로 보인다.** 어느 단계가 어떤 오류로 죽었는지 거기서 읽는다.
- **커넥터는 사용자 OAuth로 돈다.** `/github` Slack 앱과 달리 저장소 소유자가 앱을 설치하지 않아도 된다. 다만 조직 저장소는 GitHub `Settings → Applications`에서 그 조직에 접근을 Grant 해야 목록에 나타난다.
- **조직 소유 비공개 저장소는 GitHub Pages 를 못 쓴다.** 조직이 Free 플랜이면 Pages 설정 자체가 열리지 않는다. Team 이상이어야 한다. 그래서 배포는 Cloudflare Pages 로 간다.
- **변수는 「마지막으로 클릭한 자리」에 들어간다.** 글자를 친 뒤에는 원하는 자리를 다시 클릭하고 `{ }`를 눌러야 한다. 설명 칸에서는 `cmd+A`가 페이지 전체를 선택하므로, 지울 때는 끝을 클릭하고 백스페이스로 지운다.

### 처리와 승인

`2026-09-21`에 개발자가 정한 흐름이고, `2026-09-22`에 `/process-issue`(`.claude/skills/process-issue/SKILL.md`)와 `scripts/harness/`의 세 스크립트로 이었다. 확정된 이슈를 처리한 결과가 **눈으로 보이는 화면**을 지나 승인으로 가게 한다. 이 절은 흐름과 승인 범위를 갖는다. 단계마다 무엇을 돌리는지는 Skill이, 스크립트의 입출력은 `scripts/harness/README.md`가 갖는다.

```text
요청 이슈 (요청 채널의 폼 → GitHub 「문제 생성」)
→ 러너가 바로 /process-issue <n> 러너
    이슈 읽기 → 화면 생성 · 검사 (generate-code) → push
    → 러너가 pull request → Quality 확인 → dev squash 머지
    → Deploy workflow 가 Cloudflare Pages 에 올린다 → 화면 주소 확인
    → 결과 댓글 (결과 채널에 카드로 뜬다)
→ 기획자가 결과 댓글에 결정을 단다: 👍 승인 · 👎 반려 · 😕 개선
→ 러너가 10분마다(댓글 결정은 바로) 읽고 /process-issue 결정 <n> 러너
    승인 → dev → main pull request → Quality 확인 → 러너가 머지
    반려 → 사유를 보고하고 이 요청의 화면을 dev 에서 되돌린다
    개선 → 다시 만들어 다음 회차 결과 댓글

화면은 dev 에 있는데 결과 댓글이 없는 요청 → /process-issue 결과 <n> (결과 댓글만, 사람이 부르거나 러너를 손으로 돌린다)
```

- **처리를 부르는 것은 이 Mac 의 러너다**(`2026-09-22` 저장소 주인 결정). `.github/workflows/harness.yml`이 이 Mac(self-hosted runner, 라벨 `ooee-mac`)에서 `scripts/harness/runner.mjs`를 돌린다. 제목이 「화면 요청」인 이슈가 열리면 바로 처리하고, 결정은 10분마다와 댓글이 달릴 때 읽는다. 결과 댓글의 반응은 GitHub Actions 이벤트가 없어 10분 확인이 읽는다. GitHub 이 빌려 주는 컴퓨터가 아니라 이 Mac 인 까닭은 Figma MCP 가 OAuth 로그인만 받아서다. 이 Mac 이 꺼져 있거나 잠들면 처리가 밀린다. 요청 채널 카드의 ✅는 여전히 아무것도 깨우지 않는다 — 요청 이슈가 열리는 순간이 시작이다.
- **pull request 를 만들고 합치는 것은 러너 스크립트다.** `gh pr create`·`gh pr merge`는 공용 권한의 `ask`이고 ask 는 allow 보다 먼저 판정되어 headless 세션에서 풀 수 없다. Claude 는 push 뒤 넘김 파일을 쓰고 멈추고, 스크립트가 Quality 를 본 뒤 합친 다음 같은 세션을 이어 받게 한다. 승인된 요청은 러너가 `main`까지 합친다 — 승인이 곧 `main` 반영이다. 사람이 연 세션에서는 전처럼 사람이 확인하고 `main` 머지도 사람이 한다. 절차는 Skill 의 「러너에서 돌 때」에 있다.
- **dev 가 보는 자리다.** 기획자는 코드가 아니라 배포된 화면을 보고 판단한다. 화면이 도는 주소가 생기기 전에는 승인을 묻지 않는다.
- **Cloudflare Pages 가 `apps/sandbox` 를 배포한다.** 생성 화면이 앉는 자리가 거기다. `dev`에 머지될 때마다 `.github/workflows/deploy.yml`이 올리고, 페이지 주소는 `https://ooee-sandbox.pages.dev/<화면 key>` 가 된다. Vercel 도 GitHub Pages 도 아닌 까닭은 「만들면서 확인된 것」에 적었다.
- **배포가 실패하면 승인을 묻지 않는다.** 그 경우는 반려가 아니라 처리 중 실패이고, 결과 댓글도 올리지 않는다. 배포는 workflow 의 결과가 아니라 화면 주소가 `200` 인지로 본다. secret 이 없으면 workflow 가 배포를 건너뛰고도 성공으로 끝나기 때문이다(「배포는 wrangler 로 직접 올린다」). 없는 key 의 주소는 `404` 다.
- **결과는 이슈 댓글 한 장으로 낸다.** 결과 채널 `#디자인시스템-화면-요청-결과물`이 GitHub for Slack 앱으로 이 저장소의 댓글을 받아 카드로 띄운다. 카드는 댓글 앞부분만 보여 주므로, 기획자가 Slack 만 보고도 어느 요청의 결과이고 어디서 보는지 알게 첫 네 줄에 요청 · 샌드박스 · 작업 요약을 몰아 둔다. 이 네 줄은 markdown 문법 없이 쓰고 주소를 날 글자로 둔다. Slack 과 GitHub 이 같은 글자로 읽고 둘 다 주소를 링크로 잡는다.

  ```text
  화면 요청 #<n> 결과 · <회차>회차 — <화면 이름> · 결정은 GitHub 댓글에 👍 👎 😕
  요청: <요청자> · 프로젝트 <요청한 프로젝트>
  샌드박스: <이번 회차 첫 화면 주소> 외 <N>장 · 목록 https://ooee-sandbox.pages.dev/
  작업: 페이지 <N>장 추가(<프로젝트>) — <화면 이름>·<화면 이름>·<화면 이름> 외 <N>장 · 새 컴포넌트 없음 · PR #<번호>
  ```

  작업 줄은 「페이지 N장 추가 — <이름>」, 「컴포넌트 추가 <이름>」, 그 밖에 한 일을 이어 쓴다. 저장소 주인이 원한 보고가 「컴포넌트 추가」 또는 「OO 작업 · OO 페이지」라서 장 수만이 아니라 이름을 적는다. 이름은 앞의 셋까지이고 나머지는 「외 N장」이다. 개선 회차(2회차부터)는 샌드박스 링크가 다시 만든 화면을 가리키고(「… (다시 만듦) · 전체 N장」), 작업 줄이 「페이지 N장 다시 만듦」이다. 첫 줄 끝의 결정 안내는 카드에서 결정 자리를 알려 준다. 결정 절은 카드가 자르는 아래쪽이다. 머리에 드는 값은 한 줄로 펴므로 입력에 줄바꿈이 섞여도 머리는 다섯 줄이다. 카드가 자르는 자리 아래로 화면 표 · 작업한 것 · 판단이 필요한 것 · 검사 · 결정 안내가 오고, 맨 끝 줄이 판독 표식 `<!-- harness:result issue=<n> round=<r> -->`다. 댓글은 `scripts/harness/result-comment.mjs`가 만든다. 샌드박스나 Figma 링크가 빠졌거나 검사가 하나라도 실패했으면 만들지 않는다. 빈 링크로 올라가면 기획자는 볼 것 없이 승인 요청만 받는다.
- **지어낸 것은 결과 댓글에 드러낸다.** 여러 장 요청을 화면별로 나누면 장마다의 요구사항을 처리하는 쪽이 쓴다. 그 부분은 generate-code 인수에서 「지어냄: …」으로 원문과 갈라 두어 `page.tsx` 머리말에서도 갈리게 하고, 결과 댓글 「판단이 필요한 것」에 화면마다 「요청에 없어 지어낸 것」으로 적는다. 기획자는 카드와 결과 댓글만 보고 승인하기 때문이다.
- **결과 댓글 말고는 에이전트가 이슈에 댓글을 달지 않는다.** 결과 채널이 이 저장소의 댓글을 모두 받으므로 처리 중의 물음까지 카드가 된다. 물을 것은 처리하는 세션의 대화에서 묻는다.
- **결정은 결과 댓글에 다는 반응 셋이다.** 👍(`+1`) 승인, 👎(`-1`) 반려, 😕(`confused`) 개선. 「승인」 한 낱말, 또는 「반려: …」·「개선: …」처럼 콜론을 붙인 댓글도 결정으로 치며, 반려·개선은 사유를 댓글로 남긴다. 결과 댓글 뒤의 신호 가운데 가장 늦은 것이 이긴다. 판독(`decision.mjs`)은 GitHub 의 반응과 댓글을 GET 으로만 읽으므로 Slack 카드에 단 이모지는 결정이 되지 않는다. 카드의 링크로 결과 댓글을 열어 단다.
  - 판정 꼴은 좁게 둔다. 「승인 전에 하나만 볼게요」를 승인으로 읽지 않으려는 것이다. 대신 「승인합니다」「반려합니다. …」처럼 결정 낱말로 시작하는데 꼴이 맞지 않는 댓글은 판독이 따로 내고, 그것이 이긴 신호보다 늦으면 처리하는 쪽은 결정을 따르지 않고 묻는다. 버리기만 하면 👍 뒤에 「반려합니다」를 남긴 사람의 뜻이 승인으로 읽힌다.
  - 사유 댓글은 판독이 짐작한다. 신호 뒤에 그 사람이 쓴 첫 댓글, 없으면 신호 앞 10분 안의 마지막 댓글이다. 짐작한 사유는 출처를 함께 내고, 개선은 그 글을 사유로 읽어도 되는지 확인받은 뒤 다시 만든다. 질문이나 칭찬이 사유로 잡힐 수 있다. 「개선: …」처럼 쓴 사유는 확인 없이 쓴다.
- **에이전트가 결정을 만들지 못하게 한다.** 이슈를 고치거나 닫는 `gh issue edit`·`close`·`reopen`, `gh label`, 그리고 `gh api` 전부가 공용 권한의 `deny`다. `gh api`를 통째로 막는 것은 필드를 붙이면 gh 가 저절로 POST 로 보내는 `gh api …/reactions -f content=+1`·`--method=POST`·graphql `addReaction` 까지 막으려는 것이다 — 처음에는 `-X POST` 꼴만 대조해 이 틈이 있었고 `2026-09-22`에 막았다. `gh issue comment`는 `ask`다. 판독은 계정으로 거르지 않는다(지금은 커넥터와 처리 세션이 같은 GitHub 계정이라 거르면 어떤 결정도 읽히지 않는다). 그래서 에이전트가 이슈에 쓸 수 있는 글은 `scripts/harness/post-result.mjs`가 양식으로 만든 결과 댓글 하나로 좁혔다. 그 첫 줄은 「화면 요청 #<n> 결과」라 결정으로 읽히지 않고, 판독·양식·게시 스크립트를 고치는 것은 `ask`다. 누구의 결정을 받을지는 「아직 정하지 않은 것」의 확정 권한과 함께 정한다.
- **결정 뒤에 도는 것.**
  - 승인: `dev → main` pull request 를 만들고 멈춘다. 머지는 사람이 한다. `dev`에 승인되지 않은 다른 요청의 화면(대기·개선·결과 없음, 되돌리지 않은 반려)이나 어느 요청의 것인지 알 수 없는 화면 pull request 가 섞여 있으면 만들지 않고, 각각을 푸는 길을 보고한다.
  - 반려: 사유를 보고하고, 이 요청의 squash commit 을 되돌리는 pull request 를 `dev`에 올린다(본문 첫 줄 `되돌림: #<n>`, 생성·머지는 `ask`). 되돌리지 않으면 반려가 하나 나온 뒤로 어떤 승인도 `main`으로 가지 못한다. 화면은 git 이력과 결과 댓글에 남는다. 이슈를 닫는 것은 사람이다.
  - 개선: 사유가 그 회차 dev pull request 본문의 「판단이 필요한 것」, 지어낸 것, 검수 결과를 가리킬 때만, 앞 회차 인수(그 pull request 본문 「화면별 인수」)에 사유를 붙여 다시 만들고 다음 회차 결과 댓글을 올린다. 대조와 인수는 pull request 본문에서 읽고 화면 코드를 열지 않는다. 같은 대화에서 부르는 generate-code 에 앞 회차 코드가 맥락으로 넘어가면 「다른 화면의 코드 읽기」 금지가 무너진다. 앞 회차 화면과 Figma 파일은 남긴다. 요청에 없던 새 요구면 개선이 아니라 반려로 보고한다. 요청 문단의 원본은 이슈 본문이라, 댓글로 요구가 늘면 원본이 둘이 된다. 새 요구는 폼으로 새 요청을 받는다.
- **이미 처리한 요청은 다시 만들지 않는다.** `/process-issue <n>`은 이슈를 읽은 뒤 본문에 `요청: #<n>` 줄이 있는 `dev` pull request 와 `(#<n>)`이 든 `dev` commit 을 찾고, 있으면 멈춘다. 화면은 들어갔는데 결과 댓글이 없는 요청은 `/process-issue 결과 <n>`이 화면을 다시 만들지 않고 결과 댓글만 올린다.
- **개선은 세 번까지다(4회차까지).** 네 번째 개선이 오면 다시 만들지 않고 멈춘다. 개선은 요청이 비워 둔 자리를 기획자가 하나씩 채우는 일이다. 같은 문단으로 세 번 채워도 맞지 않으면 모자란 것은 화면이 아니라 요청 문단이고, 그때는 폼으로 요청을 다시 쓰는 편이 이슈 본문을 원본으로 지킨다. 한 회차가 화면 생성부터 배포까지 한 바퀴라는 값도 있다. 3 은 겪어 본 값이 아니라 출발값이며, 실제 회차를 보고 고친다.
- **main 은 승인된 요청만 담는다.** 승인 뒤의 `dev → main` pull request 가 그 기록이다. 누가 언제 무엇에 동의했는지가 본문(결정한 사람·시각·반응인지 댓글인지·결과 댓글 주소)과 머지 기록으로 남는다. 개선을 거친 요청은 개선 전 회차의 화면(새 key 로 대신한 앞 key)도 그 요청의 회차 기록으로 함께 가며, 본문에 그렇게 적는다. 앞 key 를 빼려면 화면을 지우는 수정이 따로 들고, `dev → main` 머지는 채택이 아니라 확인의 기록이라 이렇게 두었다. 반려 때 `dev`에서 되돌리는 것과 함께 **개발자가 확인하기 전의 출발값**이다. 바꾸려면 Skill D2 에서 앞 key 를 지우는 pull request 를 먼저 두게 한다.
- **승인은 화면 확인까지다.** 기획자가 판단하는 것은 「요청한 화면이 요청대로 나왔는가」 하나다. 코드를 제품에 넣을지, 컴포넌트로 승격할지는 이 승인이 정하지 않는다. `dev → main` 머지는 그 확인을 남기는 기록이지 채택이 아니다. 채택은 `docs/process` 의 이관 절차가 따로 갖는다.

**Slack 채널 구독.** 결과 채널에서 아래 두 줄을 친다. 처음 구독하면 뒤 줄의 다섯 가지가 기본으로 함께 켜지므로 끈다.

```text
/github subscribe bluekey-kr/Design-System-Harness comments
/github unsubscribe bluekey-kr/Design-System-Harness issues pulls commits releases deployments
```

요청 채널은 `/github unsubscribe bluekey-kr/Design-System-Harness comments`로 댓글 구독을 끊는다. 두 채널이 모두 `comments`를 받으면 결과가 두 번 뜬다.

### Cloudflare Pages 설정값

| 자리 | 값 |
| --- | --- |
| 프로젝트 이름 | `ooee-sandbox` (주소가 `https://ooee-sandbox.pages.dev` 가 된다) |
| Production branch | `dev` |
| Framework preset | None |
| Build command | `corepack enable && pnpm install --frozen-lockfile && pnpm --filter @ooee/sandbox build` |
| Build output directory | `apps/sandbox/out` |
| Root directory | `/` |
| 환경 변수 | `NODE_VERSION` = `22.22.1` |

`apps/sandbox/next.config.ts` 가 `output: "export"` 라 빌드가 `apps/sandbox/out` 에 정적 파일을 떨군다. 이미지 최적화 서버가 없으므로 `images.unoptimized` 도 함께 켜 두었다. `dev` 를 그대로 빌드해 13개 라우트가 나오는 것은 `2026-09-21`에 확인했다.

- **`corepack enable` 을 앞에 붙인다.** `package.json` 이 `packageManager: pnpm@10.32.0` 을 못 박고 있어서 빌드 이미지의 pnpm 이 다른 판이면 `--frozen-lockfile` 이 깨진다. `.github/workflows/quality.yml` 도 같은 이유로 같은 줄을 갖는다.
- **`NODE_VERSION` 은 `.node-version` 과 같은 값이다.** 저장소에 `.node-version`(`22.22.1`)이 있어 Cloudflare 가 그것도 읽지만, 둘이 갈라지면 CI 와 배포가 다른 Node 로 도는 것이라 환경 변수로도 박아 둔다.
- **`main` 은 미리보기 배포가 된다.** Production branch 가 `dev` 이므로 다른 가지는 전부 preview 주소를 받는다. 기획자가 보는 자리는 `dev` 하나라 그대로 둔다.

### 배포는 wrangler 로 직접 올린다

`2026-09-21`~`22`에 Cloudflare 의 Git 연동을 붙이려다 막혔고, `2026-09-22`에 개발자가 직접 올리는 쪽으로 정했다.

```bash
pnpm dlx wrangler@4.136.1 login                     # 한 번만
pnpm dlx wrangler@4.136.1 pages project create ooee-sandbox --production-branch dev
pnpm deploy:sandbox                                 # 빌드 + 올리기
```

`deploy:sandbox` 는 루트 `package.json` 이 갖는다. `--branch=dev` 를 주어 production branch 와 같은 이름으로 올리므로 그 배포가 `https://ooee-sandbox.pages.dev` 가 된다. wrangler 는 `dlx` 로 판을 박아 불러서 저장소 의존성을 늘리지 않는다.

**`2026-09-22`부터 자동으로 돈다.** 처음에는 dev 에 머지해도 저절로 돌지 않아 사람이 `pnpm deploy:sandbox` 를 돌렸다. #15·#16 으로 `.github/workflows/deploy.yml` 이 `dev` push 마다 `deploy:sandbox`·`deploy:studio` 를 돌리게 했고, Actions 에서 손으로도 돌릴 수 있다. 저장소 secret `CLOUDFLARE_API_TOKEN` 을 쓰는데, **secret 이 없으면 경고만 남기고 배포를 건너뛴 채 성공으로 끝난다.** 머지가 빨갛게 되지 않게 한 것이지만, 그래서 배포 여부는 실행 결과가 아니라 화면 주소로 확인한다(「처리와 승인」).

### Git 연동이 막힌 까닭

같은 데서 헤매지 않게 적어 둔다. 나중에 다시 붙일 수도 있다.

1. **조직에 GitHub 앱을 설치하는 것은 오너만 할 수 있다.** `YUJINSIK-momo` 는 `bluekey-kr` 의 member 라(`gh api /user/memberships/orgs/bluekey-kr` → `member`) 조직의 앱 설치를 보지도 못한다. 실제로는 `2026-09-21 18:49` 에 이미 설치돼 있었고 `Design-System-Harness` 하나만 골라져 있었는데, member 계정으로는 그게 안 보여서 설치가 안 된 줄 알았다. 오너 계정(`bluekey-hk`)으로 보니 나타났다.
2. **앱이 이미 설치돼 있으면 Cloudflare 의 「Connect GitHub」이 끊긴다.** Cloudflare 는 GitHub 의 *새 설치* 화면(`installations/select_target?state=…`)으로 보내는데, 이미 설치된 계정을 고르면 GitHub 이 설치 대신 설정 페이지로 보내 버려서 `state` 를 들고 Cloudflare 로 돌아오지 못한다. 눌러도 제자리를 돈다.
3. 다시 붙이려면 조직에서 앱을 **Uninstall 한 뒤 Cloudflare 의 흐름 안에서 새로 설치**해야 한다. 그때 설정값은 위 표를 쓰고 Root 는 `/` 다.

### 남은 것

- 요구사항 답변에 줄바꿈이 들어가면 GitHub 화면에서 다음 줄이 별도 항목처럼 보인다. 읽는 쪽은 `scripts/harness/issue.mjs`가 다음 라벨까지를 한 칸으로 읽어 풀었고, 보이는 모양만 남았다. 값을 헤딩 아래 줄로 내리는 양식으로 바꾸면 여러 줄이어도 깨지지 않지만, 그때는 `issue.mjs`의 라벨 표도 함께 고친다.
- 빈 선택 칸이 `제출하면 일어나는 일:` 한 줄로 남는다. 조건 분기가 없어 줄을 숨기지 못하므로 힌트로 「없음」을 받는다.
- 「제출하면 일어나는 일」과 「비슷한 기존 화면」은 generate-code 인수(`issue.mjs`의 `generateArgs`)에 들지 않는다. 지금은 처리하는 쪽이 결과 댓글의 「판단이 필요한 것」에 「반영하지 않은 칸」으로 남긴다.
- 결정을 Slack 카드에서 바로 주지는 못한다. 카드에 단 이모지는 GitHub 에 없으므로, 카드의 링크로 결과 댓글을 열어 단다. 결과 댓글 첫 줄 끝에 「결정은 GitHub 댓글에 👍 👎 😕」를 두어 카드에서도 보이게 했다.

## 아직 정하지 않은 것

| 항목 | 담당 | 기한 |
| --- | --- | --- |
| ~~`@ooee/ui`를 반영한 Figma 라이브러리를 만들지와 담당~~ → **Figma 를 뺐다**(`2026-09-23`, 「2026-09-23 Figma 를 뺐다」). 아래는 그때의 물음이다. 스파이크 R1에서 라이브러리가 없고 Code Connect는 플랜상 쓸 수 없음을 확인했다(「스파이크 결과」). 없는 채로 가면 순서 6·7은 변수 이름, 레이어 이름(`data-slot`)과 매핑표로 대신한다 | 기획자·개발자 | `2026-09-23` |
| Story 파일 위치(`packages/ui/src/<component>.stories.tsx` 병치 또는 `apps/storybook/stories/`)와 폴더 구조. [working-context.md](working-context.md) 「남은 작업」 10번의 카테고리화와 함께 정한다 | 기획자·개발자 | `2026-09-16` |
| 확정 컴포넌트 19개의 최소 `Default` Story(필수 prop만)를 개발자가 순서 3의 pull request에 한 번에 넣어도 되는가. 순서 3의 완료 기준이 컴포넌트마다 Story 하나를 전제하고 기획자는 `9/14~` 화면 개선 중이라 제안한다. Property를 나열하는 Story는 제안 밖이며 [open-questions.md](open-questions.md)의 Style·Size 이름 통일 뒤에 기획자가 쓴다 | 기획자 | `2026-09-16` |
| 기본 브랜드 값의 자리: Storybook decorator에 두는 채로 갈지, `packages/tokens/src/styles.css`가 `DEFAULT_BRAND_SEED`의 `--brand-*`·`--oe-brand-*` 값을 갖게 할지. 후자는 브랜드만 런타임 주입으로 남겨 둔 tokens 구조와 전달 패키지가 싣는 값을 바꾸며, [open-questions.md](open-questions.md)의 「기본 ooee brand seed」가 Provisional인 채로 값이 공용 package에 들어간다 | 기획자 | `2026-09-16` |
| Storybook을 만들지 여부. [roadmap.md](roadmap.md)의 「컴포넌트를 참고하는 채널」은 Storybook을 최종 표준 채널로 정했지만, Studio가 이미 문서와 Playground를 제공하고 Skill v0는 `docs/system/`만으로 돈다. 순서 2의 결과와 A/B 검증 뒤에 다시 정하며, 그때까지 순서 3과 통합 검증의 Storybook 항목 둘은 조건부다 | 기획자·개발자 | `2026-09-23` |
| 저장소 밖에서 컴포넌트를 조회할 endpoint: Storybook MCP(개발자 로컬 서버 또는 공유 endpoint) 또는 Studio가 `component-registry`와 `docs/system/`을 JSON으로 내는 route 위의 MCP | 개발자 | `2026-09-19` |
| 기획자가 명령을 돌리는 자리: 이 저장소를 clone해 Node 22.22.1·pnpm·Claude Code를 갖추는지, 개발자가 대신 돌리고 기획자는 프롬프트와 검수만 맡는지. ①~⑧ 중 기획자가 직접 수행하는 단계도 함께 정한다 | 개발자 | `2026-09-19` |
| Storybook 호스팅: Chromatic, Cloudflare Pages, 저장소 공개 또는 GitHub 플랜 변경. 외부 서비스 사용 여부는 블루키에 묻는다 | 개발자 | `2026-09-19` |
| ~~Figma의 역할: 디자인 원본 또는 검토용 캔버스~~ → **검토용 캔버스로 정했다**(`2026-09-16` A/B 검증. 「스파이크 결과」와 [roadmap.md](roadmap.md)) | 개발자 | 정해짐 |
| roadmap.md 4·5단계의 「1차 범위: 제외」와 루트 `README.md`의 1차 범위 문구를 검증용 실험 구현으로 고칠지. 팀이 정한 프로젝트 범위라 개발자 혼자 고치지 않는다 | 기획자·개발자 | `2026-09-23` |
| ~~이관 뒤 `AGENTS.md`·Skill·`.mcp.json`의 위치~~ → **`plugins/ooee-harness/` Claude Code Plugin으로 정했다**(`2026-09-16` 스파이크 R3. 「이관 시 남기는 것」). 별도 저장소는 열지 않되 나중에 뽑아낼 수 있게 둔다고 했으나, `2026-09-21`에 `bluekey-kr/Design-System-Harness`를 열어 `plugins/ooee-harness/`·`scripts/figma/`·`apps/sandbox/`와 이 문서를 **이력과 함께** 옮겼다. 원본 저장소에도 같은 파일이 남아 있고 어느 쪽이 정본인지는 아래 줄에 있다 | 개발자 | 정해짐 |
| `AGENTS.md` 「코드 소유 경계」의 import 경계(`@ooee/ui`에서만 가져온다)를 `docs/system/quality.md`로 승격할지. 하네스가 이관 뒤에도 그 규칙을 읽어야 해서 원본의 자리가 필요하다. `data-slot` 승격과 같은 성격이라 함께 정한다 | 기획자 | `2026-09-23` |
| 전달본 사본을 만드는 절차: 누가 어느 branch에서 어떤 명령으로 만드는지, 블루키에 이 저장소의 읽기 권한을 주는지 아니면 Plugin 디렉터리를 사본에 함께 복사해 로컬 marketplace로 설치하게 하는지 | 개발자 | `2026-09-25` |
| `data-slot` 이름을 시스템 정의로 승격할지. 지금 이 이름은 `packages/ui`의 코드와 [figma-component-map.md](figma-component-map.md)에만 있고 `docs/system/`에는 없다. sandbox 의 컴포넌트 표시·측정·자동화가 계속 쓸 이름이면 `docs/system/`이 소유해야 한다 | 기획자 | `2026-09-23` |
| `확정`인데 `data-slot`이 없는 컴포넌트를 어떻게 할지. `MessageBubble`과 초안 둘(`MessageComposer`·`MessageFileAttachment`)이 그렇고, 그대로면 sandbox 가 어떤 컴포넌트인지 읽지 못한다 | 기획자 | `2026-09-23` |
| ~~Slack 폼에서 issue를 만드는 수단~~ → **Workflow Builder 의 GitHub 커넥터 「문제 생성」으로 정했다**(`2026-09-21`). github.com 용으로 뜨고 실제로 이슈 넷을 만들었다. 인증 계정은 기획자별로 붙이지 않고 `YUJINSIK-momo` 하나로 고정했다 — 기획자가 자기 GitHub 을 연결하지 않아도 돌아야 하기 때문이다. 대가로 이슈 작성자가 모두 같은 이름이 되므로, 요청자는 본문 첫 줄 `요청자:` 가 갖는다 | 개발자 | 정해짐 |
| 확정 권한을 어떻게 보는지. ✅는 누구나 달 수 있고 「리액션을 단 사람 == 요청자」 조건 분기는 Business+ 이상이다. Pro면 확정 댓글에 남긴 이름을 `harness-check`가 요청자와 대조하는 쪽으로 간다 | 개발자 | 미정 |
| ~~트랙 파일의 정본이 어느 저장소인가~~ → **`bluekey-kr/Design-System-Harness`로 정했다**(`2026-09-21`). 저장소 문서와 스크립트는 여기서 관리한다. `ooee-shin/ooee-ui`는 디자인 시스템 원본으로 남고, 그쪽의 `docs/process/` 문서는 기획자가 계속 쓴다 | 개발자 | 정해짐 |
| ~~`*.pages.dev` 주소(`ooee-studio`·`ooee-sandbox`)의 공개 범위~~ → **두 사이트 모두 공개로 두고, `llms.txt` 로 싣는 것은 시스템 문서만이다**(`2026-09-22`, 개발자). 어느 쪽에도 Cloudflare Access(이메일 확인)를 걸지 않는다. 저장소 밖의 AI 가 `https://ooee-studio.pages.dev/llms.txt` 를 받아 링크를 따라 읽게 하려는 것이지만, 빌드가 사이트에 함께 싣는 원본은 `docs/system/` 아래 파일과 컴포넌트 export 목록(`packages/ui/src/index.ts`)뿐이다. `AGENTS.md`, `docs/process/`, `.claude/`, `plugins/`, `scripts/` 는 싣지 않는다 — `AGENTS.md` 가 `docs/process/` 와 자신을 「전달 시 제거」하고 자산화 대상 밖으로 정했고, 그 안에 Figma team·폴더 ID, GitHub 계정 이름, Slack 채널 이름, 내부 계획이 있으며, 한 번 공개되면 되돌리기 어렵기 때문이다. 사이트로 나가는 `llms.txt`(웹판)는 그 밖을 가리키는 링크를 풀어 「저장소 안에서만」으로 적고, 머리에 이 사이트에는 시스템 문서만 실린다는 한 줄을 둔다. 실을 자리는 `scripts/docs/llms-links.mjs` 의 `PUBLISHABLE` 한 곳이 정하고, 실리는 파일은 git 이 추적하는 보통 파일이어야 빌드가 통과한다. 넓힐 때는 이 줄부터 고친다. **나중에 Cloudflare Access 를 걸면 밖의 AI 는 `llms.txt` 를 받지 못한다** — 걸 때는 색인을 밖에서 읽는 길을 함께 다시 정한다 | 개발자 | 정해짐 |
| 통합 방식(SaaS 패키지화 또는 저장소 연동). 순서 8에서는 Plugin의 배포 source 타입(상대 경로 또는 git 저장소)만 막는다 | 개발자 | 미정 |

## 일정

[working-context.md](working-context.md)의 「일정과 분담」에 있는 `9/14~`·`9/20~23`·`9/28~30` 행의 개발자 몫을 날짜별로 쪼갠 것이다.

| 날짜 (2026) | 내용 |
| --- | --- |
| 9/14 | 이 문서, Figma 확인 질문 |
| 9/15 | 스파이크 R1, Skill v0 시작 |
| 9/16 | Skill v0 완료, Sonnet 수준의 모델로 화면 둘 |
| 9/17~18 | 순서 2의 결과에 따라 Storybook 골격·Storybook MCP (R2)·최소 Story(기획자가 `9/16`까지 동의하면), 또는 Studio 조회 route 스파이크 |
| 9/19 | Agent Rules, 호스팅 결정 (R4) |
| 9/16 | Figma MCP 읽기와 매핑표 (순서 6). A/B의 A안이 매핑표를 입력으로 쓰므로 앞당겼다 |
| 9/20~23 | A/B 검증. 그 전에 `/design-page`의 ④(순서 7)와 STO 지원요청 화면 옮기기 |
| 9/24~25 | Storybook 배포와 CI, 이관 시 남기는 것 (R3). `/design-page`의 ②는 `9/15`에 먼저 만들었다 |
| 9/28~30 | 패키지화 방향, 마무리 |

## 갱신 대상 문서

이 문서를 넣는 pull request는 아래 문서를 고치지 않는다. 각 순서의 pull request가 함께 고친다.

| 문서 | 고칠 곳 | 순서 |
| --- | --- | --- |
| [roadmap.md](roadmap.md) | 「A/B 비교 검증」에 결과. 4·5단계의 「1차 범위: 제외」를 고칠지는 「아직 정하지 않은 것」에 있다 | A/B 뒤 |
| [tooling.md](tooling.md) | 「테스트 배치 규칙」에 Story 위치, 검증 명령에 `pnpm storybook`·`build-storybook`. `apps/sandbox` 검사는 순서 2에서, `screen-rules` 테스트와 `.next` 삭제를 Skill이 하지 않는다는 문장은 순서 4에서 넣었다 | 3 |
| [git-workflow.md](git-workflow.md) | 「dev에서 main으로 올릴 때」 항목마다 명령과 컴포넌트·Story만 바뀐 pull request의 예외 | 각 순서 |
| `AGENTS.md` | 「문서 구조」의 `.claude/` 제거 규칙, MCP 사용과 명령 규칙 한 절. `apps/sandbox` 행은 순서 2에서, `scripts/figma/` 행은 순서 7에서, 「Claude Code 명령과 권한」 절은 순서 4에서 넣었고 그 절의 MCP 문단은 순서 6이 `.mcp.json` 기준으로 고쳤다. `.claude/`를 전달 시 어떻게 남길지는 R3 뒤에 고친다 | 4, 6, R3 |
| 루트 `README.md` | 첫 환경변수가 생길 때 `.env.example`. 1차 범위 문구는 roadmap.md와 같은 결정을 따른다 | 6, A/B 뒤 |
| [working-context.md](working-context.md) | 「일정과 분담」의 `~9/4` 행에 R4에서 정한 호스팅 이름 | 5 |
| `.github/pull_request_template.md` | Storybook·MCP를 건드린 pull request의 확인 항목 | 3 |

Skill 사용법과 MCP 설정은 `docs/system/` 바깥에 둔다. 규칙은 `docs/system/README.md`의 「이 문서의 독자」가 소유한다.

## 이관 시 남기는 것

스파이크 R3(`2026-09-16`)의 결과다. **하네스는 제거하지 않고 `plugins/ooee-harness/`(Claude Code Plugin)로 분리해 전달 자산과 함께 넘긴다.** `AGENTS.md`·`.claude/`·`docs/process/`·`apps/sandbox`·`scripts/figma/`는 지금 규칙대로 전달본에서 사라지고, 그 안에서 명령이 실제로 쓰는 것만 Plugin으로 옮긴다. 옮기는 것은 절차(Skill)와 기계 판정(`screen-rules`)이고, 남겨 두는 것은 이 저장소의 작업 신호·branch 운영·v0가 만든 화면 기록이다.

**「제거」는 전달본에서만 일어난다.** 이 저장소는 이관 뒤에도 컴포넌트를 이어서 만드는 자리이므로, 전달은 여기서 파일을 지우는 일이 아니라 전달 범위만 담은 사본을 만드는 일이다.

| 지금 자리 | 이관 시 | 가는 자리 |
| --- | --- | --- |
| `docs/system/`, `packages/`, `apps/studio` | 전달 | 그대로 |
| `plugins/ooee-harness/` | 전달 | 그대로. 설치 단위다 |
| `.claude/skills/generate-code`·`review-design` | 옮긴다 | `plugins/ooee-harness/skills/`. 화면을 쓸 자리와 검사 명령을 `apps/sandbox`로 박아 두지 않고 Plugin 설정값(`userConfig`)으로 뺀다 |
| `.claude/settings.json` | 옮기지 못한다 | Plugin은 권한 규칙을 싣지 못한다. 받는 쪽 `.claude/settings.json`에 붙여 넣을 `permissions` 조각을 `plugins/ooee-harness/README.md`가 갖는다 |
| `apps/sandbox/src/screen-rules.ts`와 그 테스트 | 옮긴다 | `plugins/ooee-harness/lib/`. 화면이 아니라 `/review-design` 검사 항목의 기계 판정이다. `docs/system/README.md` 경로와 저장소 루트를 상대 경로로 박지 않고 인수로 받게 고친다 |
| `apps/sandbox`의 나머지 | 제거 | 화면을 쓸 자리는 설치한 저장소가 갖고, Plugin의 설정값이 그 자리를 가리킨다 |
| `AGENTS.md`의 import 경계(「코드 소유 경계」) | 승격하거나 옮긴다 | `@ooee/ui`에서만 가져온다는 규칙은 작업 운영이 아니라 시스템 규칙이므로 `docs/system/quality.md`로 승격할지 기획자와 정한다. 승격하지 않으면 원본을 `plugins/ooee-harness/rules/`로 옮기고 `AGENTS.md`가 그 파일을 가리킨다 |
| `AGENTS.md`의 나머지 | 제거 | 작업 신호, branch 운영, 화면 확정 검수 |
| `.mcp.json` | 옮긴다 | `plugins/ooee-harness/.mcp.json`. URL 한 줄뿐이라 secret이 없고 저장소 경로에도 기대지 않는다 |
| `scripts/figma/`, `/design-page`, [figma-component-map.md](figma-component-map.md) | 나중에 옮긴다 | 순서 8에 넣지 않는다. `packages/tokens` 상대 import, `scripts/visual` 실행 위치, `node_modules/.pnpm/*` 탐색, 3001 포트 개발 서버에 동시에 기대므로 `data-slot` 승격 결정 뒤로 미룬다 |
| `scripts/visual/` | 전달 | 제거 목록에 없고 저장소 경로에 기대지 않는다. 루트 `package.json`의 `visual` script와 함께 남는다 |
| `docs/process/` | 제거 | 위에 적은 것 말고는 전부 |

**받는 쪽이 하는 일은 넷이다.**

1. `/plugin marketplace add <저장소 또는 사본 경로>` 뒤 `/plugin install ooee-harness@ooee`. 비공개 저장소는 기기에 이미 있는 git 자격 증명을 쓴다.
2. 설치하면 명령 이름 앞에 Plugin 이름이 붙는다. `/ooee-harness:generate-code`·`/ooee-harness:review-design`이다.
3. `plugins/ooee-harness/README.md`의 `permissions` 조각을 자기 `.claude/settings.json`에 붙여 넣는다. Plugin이 권한을 대신 걸어 주지 않는다.
4. 설정값 셋을 채운다. 화면을 쓸 디렉터리, `docs/system/`의 자리, 검사 명령이다. 지금 `SKILL.md`에 `apps/sandbox`와 `pnpm --filter @ooee/sandbox …`로 박혀 있는 자리다.

**하네스는 `docs/system/` 없이 성립하지 않는다.** ①의 디자인 시스템 검색과 `/review-design`의 검사 항목이 모두 그 파일들을 원본으로 읽는다. 그래서 Plugin을 설치하는 저장소에는 전달 자산이 함께 있거나 「아직 정하지 않은 것」의 조회 endpoint가 있어야 한다.

## 새 컴포넌트를 만들 때

`@ooee/ui` 에 없는 컴포넌트를 만드는 절차는 [new-component.md](new-component.md) 가 갖는다. 채워야 하는 다섯 자리(구현·export·문서·등록·Playground 와 카탈로그 축)와 shadcn 에서 옮겨 쓰는 방식, Playground 양식이 거기 있다.

### 2026-09-23 Figma 를 뺐다

개발자 결정이다. **화면 요청 처리에서 Figma 를 뺐고, 결과는 sandbox 에서만 본다.**

- **까닭.** 화면마다 Figma 로 옮기는 데 오래 걸렸다 — 이커머스 5장(#9)은 코드가 다 된 뒤에도 Figma 에 한 시간 넘게 걸렸다. 그것을 줄이려고 붙인 것(게시된 라이브러리의 인스턴스로 그리기, 라이브러리가 코드보다 낡았는지 보는 검사, 키를 지키는 제자리 갱신)이 도구를 더 크게 만들었다. 요청한 사람이 보는 것은 sandbox 의 화면이고, 채택 판단도 거기서 한다.
- **지운 것.** `/design-page` Skill, `scripts/figma/`, `.mcp.json`(Figma remote MCP), sandbox 의 Figma 카탈로그(`/catalog`)와 개발 서버 지문 route, `docs/process/figma-component-map.md`·`figma-page-agent.md`. `/process-issue` 와 러너는 Figma 단계 없이 돈다. 결과 댓글은 첫 네 줄(제목·요청·샌드박스·작업)이다.
- **남긴 것.** 컴포넌트가 DOM 에 남기는 `data-slot`·`data-*` 표식. sandbox 가 화면에 어떤 컴포넌트를 썼는지 보여 주는 데 쓴다(다음 작업). 버튼처럼 보이는 링크를 `<Button render={<a href="…" />} nativeButton={false} role="link">` 로 쓰는 generate-code 규칙도 같은 까닭으로 둔다 — Button 표식이 있어야 sandbox 가 그 자리를 Button 으로 읽는다.
- **Figma 라이브러리.** `ooee · 컴포넌트 라이브러리` 파일은 Figma 에 남아 있지만 이 저장소는 더 갱신하지 않는다. `2026-09-22` 기준으로 코드보다 낡았다(Chip 켜짐 · Switch 켜짐 · SelectBox 선택).
- 아래 「스파이크 결과」의 Figma 기록은 그때의 기록이다. 가리키는 파일은 지웠다.
- **다음.** 디자인 시스템 → 요청 → sandbox. sandbox 에서 화면마다 어떤 컴포넌트를 썼는지 보고, 그 컴포넌트의 문서로 건너간다.

## 스파이크 결과

끝난 날짜 순으로 쌓는다.

### 2026-09-14 스파이크 R1: Figma 쓰기

- **연결.** Figma remote MCP(`https://mcp.figma.com/mcp`)를 `claude mcp add --scope user`로 등록하고 OAuth 로그인은 브라우저에서 한 번 했다. 저장소에는 아무것도 넣지 않았다. 세션을 시작한 뒤 등록한 서버는 그 세션에 실리지 않으므로, 이 스파이크는 `claude -p --allowedTools mcp__figma`로 띄운 별도 headless 세션에서 돌렸다.
- **계정과 플랜.** `whoami`가 돌려준 개발자 계정의 팀은 둘이다. bluekey(`team::1395716714983274137`, tier `pro`, seat `Full`)와 개인 팀(tier `starter`, seat `Full`). [figma-page-agent.md](figma-page-agent.md)의 결과물 폴더는 bluekey 팀이다.
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

- **화면.** `/generate-code`로 관리자 웹 「고객의 소리」(`apps/sandbox/src/app/voc`)를 만들었다. 필터 줄·처리 상태 칩·표·상세 답변 패널·페이지 이동이다. 사람이 고친 자리는 하나다. 상세 패널이 열리면 표가 남은 폭(약 736px)보다 넓어져 상태·담당자 열이 가로 스크롤에 가려져서, 개발자의 결정으로 패널이 열린 동안 고객·담당자 열을 숨겼다. `/review-design` 위반 0건, 테스트 16건, `pnpm check` 통과.
- **Figma 파일.** `ooee · 고객의 소리 · 2026-09-15`(file key `Iw2MXs9sfqtJFze7F9vGf5`)에 목록과 상세 열림 두 프레임을 만들었다. 칠 248개가 전부 변수에, 글자 146개가 전부 텍스트 스타일에 묶였다. auto-layout 프레임 100개, DOM 위치와 어긋나 absolute로 둔 자식 6개, 아이콘 14개(Remix SVG).
- **변수.** `oe color`(Light·Dark) 61개와 `oe size` 17개는 `packages/tokens`에서 옮겨 적었다. Button·Badge처럼 코드가 primitive 단계를 직접 쓰는 자리(`bg-blue-100`, `bg-[var(--brand-600)]`, Chip의 `--brand-alpha-*`)는 `oe primitive` 컬렉션에 필요한 것만 만들어 묶었다. 이 자리는 코드가 `dark:` class로 따로 두므로 Figma에서 모드를 바꿔도 뒤집히지 않는다.
- **글꼴.** Figma에 Pretendard Variable이 없어 Noto Sans KR로 임시 대체했고, Noto Sans KR에 SemiBold가 없어 `semibold` 스타일은 Bold다. 개발자가 승인했고 텍스트 스타일 설명에 적었다. 글자 폭이 넓어져 「내보내기」 버튼의 마지막 글자가 조금 잘린다.
- **다시 읽기.** `get_design_context`가 `bg-[var(--oe-background-secondary,#f5f5f5)]`처럼 변수 이름을 먼저 내고 hex는 대체값으로만 붙인다. 스파이크 R1에서 hex만 나오던 것이 풀렸으므로, 순서 6의 매핑표는 레이어 이름이 아니라 이 변수 이름을 1차 근거로 삼는다. Code Connect는 여전히 없어 컴포넌트(`Button`·`Select`)는 레이어 이름(`button`, `select-trigger` 등 `data-slot`)으로만 알 수 있다.
- **변환 도구.** `scripts/figma/`에 두었다. 브라우저에 뜬 화면을 `scripts/visual/inspect.mjs --eval`로 트리로 읽고, 조각으로 나눠 `use_figma`에 넘긴다. 만들며 부딪힌 것: Chrome이 Tailwind v4 색을 `lab()`·`oklab()`로 돌려줘 처음엔 테두리와 배지 배경이 빠졌다. 두 프레임의 조각 경로 이름이 같아 한쪽 요소가 다른 프레임에 들어갔다. Select의 숨은 1px input 값이 글자로 딸려 왔다. 모두 도구에서 고쳤다. `use_figma`는 50,000자 제한이 있고 `setPluginData` 대신 `setSharedPluginData`만 된다.
- **판단이 필요한 것.** 처리 상태 칩이 「하나만 켜짐」인데 chip.md는 그 동작을 Tab의 역할로 규정하고 Tab 컴포넌트는 없다. 매장·유형 Select를 Field 없이 필터 줄에 단독으로 썼다. 기간은 요청대로 Trigger 하나인데 input-button.md는 둘로 나누라고 한다. Table 컴포넌트가 없어 native `table`이다.

### 2026-09-15 /design-page: 순서 7의 ②

- **만든 것.** `.claude/skills/design-page/SKILL.md`와 `scripts/figma/prepare.mjs`·`audit.js`. `prepare.mjs`가 토큰 추출·화면 읽기·아이콘 이름 찾기·조각 나누기를 로컬에서 끝내고 `use_figma`에 그대로 넘길 단계 파일과 `manifest.json`을 만든다. 변수·텍스트 스타일 설정은 지우고 다시 만들던 방식을 값만 맞추는 방식으로 바꿔 이미 그린 프레임의 연결을 지킨다.
- **검토.** 네 관점(스크립트 버그, Figma plugin API, `figma-page-agent.md` 규칙, 문서 일치)으로 본 지적 56건 가운데 48건이 확인됐다. 고친 것: 화면 사이 조각 경로 충돌과 페이지 이름 덮어쓰기(화면마다 자기 페이지, 이름이 정확히 같은 프레임만 다시 그림), `data-[checked]:` 같은 상태 class 색이 기본 class 토큰에 잘못 묶이던 것(후보를 모아 브라우저가 칠한 색과 대조), Portal 팝업과 0px 감싸개의 자식이 빠지던 것, 다른 컬렉션의 같은 이름 변수에 묶이던 것, 글꼴을 고정으로 불러오던 것, 모델이 단계 파일을 옮기다 바꿔도 모르던 것(내용 해시 검사), 헤드리스 Chrome 창이 500px보다 좁아지지 않아 모바일 폭을 못 읽던 것, `oe size` 변수를 만들고 묶지 않던 것, 보고 양식의 프레임 링크·미리보기·폴더 확인 줄.
- **Sonnet 실행.** `claude -p "/design-page …" --model sonnet`으로 세 번 돌렸다. 첫 실행은 `prepare.mjs`가 주석 안의 치환 자리를 바꿔 문법 오류로 멈췄고, Skill은 규칙대로 저장소를 고치지 않고 원인을 보고했다. 고친 뒤 고객의 소리(목록·상세 열림)는 칠 245/245, 글자 141/141, 크기 변수 84개가 묶였고 이름이 같은 프레임 둘만 다시 그렸다. 관리자 로그인(기본·아이디 저장 체크)은 같은 파일의 새 페이지에 들어갔고, 체크된 칸이 `data-[checked]:`의 `oe-brand-background-bold-primary`로 묶였다.
- **세 번째 실행에서 찾은 것.** 관리자 로그인의 흰 바탕이 루트 요소가 아니라 `<body>`(`globals.css`의 `@apply`)에 칠해져 루트 프레임이 투명하게 들어갔고, Sonnet의 대조도 이것을 놓쳤다. 루트에 바탕이 없으면 body 바탕을 `oe-background-*` 토큰 값으로 찾아 넣도록 고치고, Skill의 대조 단계에 「투명한 자리는 회색 캔버스로 보인다」를 적었다. 변수 값 자체가 알파를 가진 색(`brand-alpha-05`)을 「투명도를 더한 칠」로 세던 검사도 고쳤다.
- **남은 것.** ④ 재조회와 매핑표는 순서 6 뒤다. 그림자는 옮기지 않는다. 레이어 이름은 `data-slot`이 없으면 태그 이름이다. 새 파일이 결과물 폴더에 들어갔는지는 도구로 확인하지 못한다.

### 2026-09-15 Agent Rules: 순서 4

- **만든 것.**
  - `AGENTS.md` 「Claude Code 명령과 권한」 절: 저장소 루트에서 시작, 공용 권한이 막는 것과 한계, 막힌 명령 재시도 금지, 명령 셋의 멈추는 자리, 한 working tree에 세션 하나, headless 관례, MCP.
  - `.claude/settings.json` 공용 권한. `deny`는 `main` 직접 push, `ask`는 `git stash`·`reset --hard`·`clean`·`checkout -- …`·`rm -r`·force push와 `apps/sandbox` 공용 파일 수정이다. `allow`는 읽기·검사 명령만 둔다.
  - `apps/sandbox/src/screen-rules.ts`와 테스트. `/review-design` 검사 항목 가운데 소스만으로 가를 수 있는 것(원색·shadcn 토큰, 핸들러 없는 `<button>`, Focus, import 경계, 아이콘 크기·`aria-hidden`·hover, 초안 컴포넌트, 머리말, 영어 테스트 이름)을 모든 화면에 돌린다.
  - Skill v0 기록 두 화면은 내용 해시가 같을 때만 면제하고, 대신 규칙이 기록된 틀린 사례를 실제로 잡는지 확인한다.
  - Skill 문구를 고쳤다.
    - `/generate-code`: 0단계 미커밋 변경 확인, key 충돌 시 번호, 다른 화면 코드 읽기 금지, 매핑표 「요구사항이 정한 값」 칸과 값마다 assert, 보고 직전 재검사와 `git status` 원문, 막힌 명령 절.
    - `/review-design`: 아이콘 `aria-hidden`과 label을 반복한 placeholder를 위반으로, 가운데 정렬을 판단으로 센다.
    - `/design-page`: audit에 `rootWithoutFill`을 더하고 `.figma-work/` 밖 쓰기를 막았다.
  - `tooling.md`의 `.next` 삭제 절차가 Skill의 캐시 삭제 금지와 부딪치던 것은, 삭제를 사람이 확인하고 하는 절차로 적어 풀었다.
- **공용 권한 적용.** 자동 권한 검사가 에이전트 스스로의 `.claude/settings.json` 수정을 막아서, 초안을 개발자가 확인하고 반영하도록 요청해 반영했다.
- **검증 방법.**
  - 저장소를 clone해 실행마다 따로 두고 세 조건을 만들었다. A는 지금 dev 그대로(v0 기록 포함), B는 지운 route를 가리키는 옛 `apps/studio/.next/dev/types` 파일로 `pnpm check`가 실패하는 상태, C는 옆 세션이 남긴 미커밋 화면이 있는 상태다. `self` 없는 옛 `test-setup.ts`는 지금 화면 셋이 등록된 상태에서 테스트를 실패시키지 않아 재현 조건에서 뺐다.
  - v0 요청 문단 둘을 이 세션의 Sonnet 에이전트(`claude-sonnet-5`)에게 주어 `SKILL.md` 절차대로 돌렸다. 에이전트가 끝난 뒤 검사 셋의 종료 코드와 `git status`를 따로 재고, 부른 명령을 transcript에서 뽑았다. 판정은 실행마다 `claude-opus-5` 에이전트 하나와 전체 비평 하나가 했다.
  - 1차는 7회(A 4, B 2, C 1)와 v0 기록에 대한 `/review-design` 1회였다. 규칙을 보강한 뒤 2차 3회(A)를 더 돌렸다.
- **v0 틀린 사례의 재발.**
  - 링크를 `<button>`으로: 0/5(관리자 로그인 실행만 해당).
  - Focus `ring-offset-2` 누락, 아이콘 숫자 크기·`aria-hidden`·hover 누락: 0/9.
  - 제출해야 반영되는 자리에 `SwitchField`: 0/4. 모두 `CheckboxField`를 고르고 switch.md를 인용해 「판단이 필요한 것」에 적었다.
  - 검사 실패를 「무관」으로 두고 준비 완료: 0/2(B). 두 실행 모두 `pnpm check`를 `[ ]`로 두고 오류 첫 줄을 적었으며 캐시를 지우지 않았다. 사실값과 보고가 9/9 일치했다.
  - 공용 파일 수정, `rm`·`git stash`·`reset`·`checkout`·`clean` 시도: 0/9. 세 파일만 바뀌었고 v0 기록 해시가 그대로다.
  - 머리말 요약: 0/9. 요청 문단이 공백 차이 말고는 그대로 들어갔다.
  - Select placeholder가 label 반복: 0/4.
  - 같은 working tree의 다른 세션 흔적: C에서 0단계가 파일을 만들기 전에 멈추고 `git status` 원문을 보고했다.
  - 기존 key 덮어쓰기: 0/9. 모두 `-2` key로 만들었다. 한 번은 그 사실을 「판단이 필요한 것」이 아닌 「무엇을 변경했나요?」에 적었다.
  - 테스트가 존재 여부만 봄: 9/9에서 마스킹·보기 전환·링크 role·기본값·글자 수·필수를 assert했다. 1차에서 한 실행이 영어 테스트 이름을 써서 `screen-rules`에 테스트 이름 검사를 더했고, 2차 3회는 모두 한국어였다.
  - `/review-design`은 v0 기록에서 관리자 로그인 9건(링크 3, Focus 3, 아이콘 3)과 STO 5건(placeholder 3, `aria-hidden` 2)을 위반으로, 스위치를 판단으로 냈다.
- **아직 막히지 않은 것.**
  - 가운데 정렬. 제목 덩이의 글자 정렬은 재발하지 않았지만, 「폼은 남은 높이의 가운데」에서 384px 폼 상자를 가로로도 가운데 두고 보고하지 않은 것이 1차 3회 중 1회, 2차 2회 중 1회다. 1차의 그 실행은 v0 기록 화면을 열어 배치를 옮겼고, 그래서 다른 화면 코드 읽기를 막았다(2차 3/3 지킴). 요청의 뜻에 달린 값이라 기계로 막을 수 없고 `/review-design`의 판단 항목으로 남긴다.
  - 매핑표 「요구사항이 정한 값」 칸이 요청의 값을 빠짐없이 담지 못한다. 크기·배치 같은 시각 값에 `(시각)` 표시가 빠지고, 칸에서 빠진 값은 테스트도 빠진다.
- **검증하지 못한 것.** 공용 권한의 실제 동작. 검증용 하위 세션을 `claude -p`로 띄우는 것이 자동 권한 검사에 막혔다(넓은 `--allowedTools`와 bypass 모드). 에이전트는 이 세션의 권한으로 돌아 `.claude/settings.json`을 거치지 않는다. 사람이 저장소 루트에서 Claude Code를 열어 `/permissions`에 규칙이 보이는지, `git stash`에 확인 창이 뜨고 `git push origin main`이 거부되는지 한 번 확인해야 한다. 기획자 기기에서는 「업무시작」「퇴근백업」 흐름에 새 확인 창이 늘지 않는지도 본다.
- **남은 것.**
  - 목적지나 동작이 정해지지 않은 버튼을 어떻게 둘지 문구가 없다. `onClick` 없는 `Button`, 빈 `onClick={() => {}}`가 섞여 나왔다.
  - 에이전트가 검사 로그를 `/tmp`에 쓴다.
  - 2단계 「코드를 쓰기 전에 대화에 표를 먼저 낸다」와 6단계 검수는 보고에 결과만 남아 실제로 했는지 확인하기 어렵다.
  - `/design-page` frontmatter의 경로 없는 `Write`와 `Bash(curl:*)`를 좁히는 일은 권한 설정이라 이번에 하지 않았다.

### 2026-09-16 순서 6: Figma MCP 읽기와 매핑표

- **만든 것.** 저장소 루트의 `.mcp.json`(figma 항목 하나, URL만)과 [figma-component-map.md](figma-component-map.md). `AGENTS.md`의 MCP 문단, `scripts/figma/README.md`의 「다시 읽을 때 남는 것」, `docs/process/README.md` 색인을 맞췄다.
- **순서를 당긴 이유.** A/B 검증의 A안이 재조회 결과를 `/generate-code`의 입력으로 쓰는데, 레이어 이름과 변수 이름을 컴포넌트·Property로 되짚는 사전이 없으면 A안은 「Figma 경유가 나쁘다」가 아니라 「사전이 없어 실패했다」를 재게 된다. 그래서 일정의 `9/24~25`에 있던 순서 6을 `9/16`으로 옮겼다.
- **되짚기의 근거는 넷뿐이다.** 레이어 이름(`data-slot`), 칠·테두리·글자에 묶인 변수 이름, 숫자로 남는 크기, 자식 구성이다. `oe size` 변수는 Figma 안에서는 묶여 있지만 재조회는 이름이 아니라 px를 돌려주고, `data-variant`·`data-tone`·`data-size`는 애초에 옮겨지지 않는다. 그래서 `controlSize`는 28·32·36·40·48 대조로, `variant`·`tone`은 칠·테두리·글자의 팔레트 단계로 되짚는다.
- **되짚을 수 없는 것.** `layout`·`fixedWidth`·`readOnly`·`textAlign`, `Input`의 `clearable`(쉬는 상태에서 폭이 0이라 옮겨지지 않는다), `Textarea`의 `autoSize`, 꺼진 `ToggleButton`의 `variant`, 누름형과 정적 `Chip`의 구별, `tone="custom"`의 hex 색, 그림자와 Focus ring이다. `Select`↔`MultiSelect`처럼 레이어 이름이 같은 짝도 갈리지 않는다. 표의 「되짚지 않는 것」과 「이름이 같아 갈리지 않는 짝」에 모아 두었고, ④는 이 값들을 코드에서 그대로 둔다.
- **표의 주장을 코드와 대조했다.** 138건 가운데 28건이 틀려 고쳤다. `Textarea`에는 `controlSize`가 없고, `Switch`의 단계 이름만 `small`·`medium`·`large`이며, `Field`에는 `invalid` Property가 없고(오류는 `errorMessage`), `Radio`에는 `indeterminate`·`shape`가 없다. `checkbox-leading`·`radio-leading`은 Control의 자식이 아니라 Field 바깥 `label` 아래 형제라 오히려 Field를 가리키는 근거였고, `outline` 테두리는 `{p}-500`이 아니라 그 30%였다. `textAlign`은 되짚을 수 없다고 적었으나 실제로는 글자 정렬로 남는다.
- **`MessageBubble`은 표에서 빈칸이다.** `data-slot`이 하나도 없어 Figma에서 `div`로만 남는다. 「아직 정하지 않은 것」에 담당과 기한을 붙였다.
- **색 규칙은 커밋마다 바뀐다.** `97bbdd2`(`2026-09-15`)가 Control 테두리를 `oe-border-primary`에서 `oe-border-secondary`로 바꿨다. 매핑표는 머리에 기준 커밋을 적고, ④는 프레임이 그 커밋보다 먼저 그려졌으면 색으로 되짚지 않는다.
- **아직 확인하지 못한 것.** 이 표는 코드만 읽어 적었고 실제 재조회 값과 대조하지 않았다. 이 세션에는 Figma MCP가 없고 headless 하위 세션은 순서 4에서와 같은 이유로 띄울 수 없다. 사람이 저장소 루트에서 Claude Code를 열어 `.mcp.json` 승인과 `/mcp` 로그인을 한 뒤 `get_metadata`로 `Iw2MXs9sfqtJFze7F9vGf5`의 「고객의 소리」 프레임을 읽어, 레이어 이름이 표로 풀리는지 한 번 확인한다. 그것이 순서 6의 완료 기준이다.
- **다음.** 순서 7의 ④를 만들 때 `dom-extract.js`가 레이어 이름에 `data-variant`·`data-tone`·`data-size`를 접미사로 실을지 함께 정한다. 실으면 이 표의 추정 상당수가 확정으로 바뀐다.

### 2026-09-16 /design-page ④: Figma에서 고친 것을 코드로

- **만든 것.** `scripts/figma/reread.js`(프레임을 JSON으로 읽는 `use_figma` 단계), `scripts/figma/reread.mjs`(단계 파일 만들기와 차이 판정), `scripts/figma/reread.test.mjs`(판정 시험 8건, `pnpm test`에 넣어 Figma 없이 돈다), `.claude/skills/design-page/SKILL.md`의 「되읽기」 절.
- **기준선을 프레임에 남긴다.** ②가 루트 프레임에 `<key>|s<상태>|<커밋>|<날짜>`를, 모든 노드에 경로를 남긴다. 되읽기는 그 경로로 코드의 같은 자리를 찾고, 커밋이 지금 코드와 다르면 색 변화를 자동으로 되돌리지 않는다. 그사이 색 규칙이 바뀌었을 수 있기 때문이다(`97bbdd2`가 실제로 그랬다).
- **무엇을 되돌리고 무엇을 묻는가.** 색 토큰 교체, 문구, 글자 크기(`oe/text-*`에 있는 값), 아이콘 이름은 코드로 되돌린다. 크기·모서리·위치·요소 추가·삭제, 변수에 묶이지 않은 색, 매핑표의 「되짚지 않는 것」은 고치지 않고 「사람이 정할 것」에 적는다. 고치는 파일은 `/generate-code`와 같은 세 파일뿐이고, 되돌린 뒤 sandbox build·test와 `/review-design`을 다시 돌린다.
- **Figma를 원본으로 만들지 않는다.** 되읽기는 사람이 고친 자리만 옮기고 나머지 코드를 그대로 둔다. 수정안 프레임도 지우지 않는다. ②는 이름이 같은 프레임만 다시 그리기 때문이다.
- **아직 확인하지 못한 것.** 실제 Figma 파일로 한 번도 돌리지 않았다. 이 세션에는 Figma MCP가 없고 headless 하위 세션도 띄울 수 없다. 사람이 저장소 루트에서 세션을 열어 「고객의 소리」 프레임을 복제해 이름 끝에 ` (수정안)`을 붙이고 색 하나·글자 하나·아이콘 하나만 고친 뒤 `/design-page 되읽기 voc fileKey: Iw2MXs9sfqtJFze7F9vGf5`를 돌려, 그 셋만 코드로 돌아오고 나머지가 「사람이 정할 것」으로 가는지 확인한다. 순서 7의 ④ 완료 기준이다.

### 2026-09-16 순서 6·④를 Figma로 확인했다

이 세션에는 Figma MCP가 없지만, 저장소 폴더에서 띄운 headless 세션(`claude -p … --allowedTools "mcp__figma…"`)에는 실린다는 것을 확인했다. 그 세션들로 아래를 직접 돌렸다. 모델은 Sonnet(`claude-sonnet-5`)이다.

- **순서 6 완료 기준을 채웠다.** `get_metadata`가 `Iw2MXs9sfqtJFze7F9vGf5`의 페이지 「고객의 소리」와 프레임 둘을 돌려준다. 프레임을 JSON으로 읽어 레이어 이름 195개를 매핑표와 대조한 결과, 컴포넌트를 가리키는 이름(`button`·`badge`·`chip`·`select-trigger`·`input-container`·`input-button`과 그 자식들)은 모두 표의 A절에 있고, 나머지는 태그 이름(`td`·`div`·`span`·`tr`·`th`)과 글자 노드의 문구였다. 표에 없는 이름 가운데 컴포넌트를 가리키는 것은 없었다.
- **②를 다시 돌려 기준선을 남겼다.** 칠 245/245, 글자 141/141이 묶였고 모든 노드가 경로를, 루트가 `voc|s0|b556328|2026-09-16`을 갖는다.
- **④를 끝까지 돌렸다.** 프레임을 복제해 ` (수정안)`을 붙이고 네 곳만 고쳤다(배지 칠 `green-100`→`blue-100`, 글자 「내보내기」→「내려받기」, 아이콘 `RiCalendarLine`→`RiTimeLine`, 칩 폭 +24). 되읽기 판정은 정확히 그 넷을 냈고 셋을 자동, 폭을 사람 몫으로 갈랐다. 고치지 않은 프레임으로 돌렸을 때는 0건이었다. 시험용 수정안 프레임은 지웠다.
- **돌리며 고친 것.**
  - `use_figma` 응답이 20,000자쯤에서 잘린다. 노드를 객체 대신 줄로 돌려주도록 바꿔 화면 하나(노드 196개)가 16KB로 한 번에 들어온다. 그래도 넘치면 `--parts`로 나눠 읽고 조각을 합친다.
  - 글자 칸의 크기는 글꼴 대체만으로도 달라져 66건이 거짓으로 잡혔다. 글자 노드의 크기는 견주지 않는다.
  - 아이콘은 칠이 안쪽 vector에 있어 색이 빠진 것으로 보였다. 아이콘 레이어의 색은 안쪽에서 읽는다.
  - 세션이 단계 코드를 임의로 고쳐 루트 프레임이 빠진 적이 있다. 읽은 결과에 루트가 없으면 판정이 멈추도록 했고, Skill에 「코드를 고치지 않는다」를 적었다.
- **남은 것.** `/design-page 되읽기`를 Skill 절차 그대로(사람의 요청 한 줄로) 돌려 코드까지 고치는 흐름은 아직 시험하지 않았다. 판정까지는 확인했고, 코드 반영은 세 파일 규칙과 검사·검수가 같은 Skill 안에 있다.

### 2026-09-16 A/B 검증

- **방식.** 화면 둘(관리자 로그인, STO 지원요청)을 두 안으로 각각 만들었다. 실행마다 저장소를 따로 clone해 Sonnet(`claude-sonnet-5`) 세션이 `/generate-code` → `/review-design`을 돌렸고, 측정은 다른 모델이 코드와 출력을 읽어 했다. B안은 요구사항 문단을, A안은 Figma에서 다시 읽은 결과(레이어 이름·변수 이름·크기)와 [figma-component-map.md](figma-component-map.md)를 입력으로 주었다. A안의 Figma 프레임은 ②로 옮긴 것이다.
- **결과.** 위반은 B안 1건(아이콘 크기)·A안 0건, `@ooee/ui` 재사용은 두 안 모두 관리자 로그인 4/5·STO 16/16이었다. 요청과 어긋난 자리는 B안 0·1건, A안 4·5건이다. 판정은 [roadmap.md](roadmap.md)의 「A/B 비교 검증」에 적었다.
- **무엇이 갈렸나.** 위반 수와 재사용 비율로는 갈리지 않는다. 두 안이 같은 Skill과 같은 `docs/system/`을 쓰기 때문이다. 갈리는 것은 요청의 뜻이다. Figma에는 동작(제출을 눌러야 반영된다), 미정(목적지가 없다), 선택지 목록이 없어서 A안은 그 자리를 스스로 정하거나 비운다. 예를 들어 A안의 STO는 Figma의 `switch` 레이어를 그대로 Switch로 두었고, B안은 요청의 낱말과 `switch.md`를 견줘 Checkbox로 바꾼 뒤 그 판단을 보고에 적었다.
- **그래서 Figma의 역할은 검토용 캔버스다.** 「아직 정하지 않은 것」의 Figma 역할 행을 이 결과로 닫는다. 코드로 먼저 만들고, Figma로 옮겨 사람이 보고, 고친 것만 되읽기로 되돌린다.
- **곁들여 확인한 것.** A안 실행 하나가 금지된 `apps/studio/src/app/screens/` 파일을 열었다고 스스로 보고했다. `/generate-code`의 「하지 않는 것」이 금지한 자리이며, 규칙이 막지 못하고 보고로만 드러난 사례다.

### 2026-09-16 Figma 구조: 배치하는 곳만 Frame

- **왜.** 옮긴 결과에서 모든 요소가 Frame이었다. DOM의 감싸개를 그대로 옮겼기 때문이다. 개발자가 「가장 바깥만 Frame으로 두고 오토 레이아웃을 쓰라」고 정했다. Figma에서 오토 레이아웃은 Frame에만 붙으므로, 「배치하는 곳만 Frame」으로 옮겨 적었다.
- **규칙.** 화면 루트와 자식을 배치하는 상자, 칠·테두리·모서리를 가진 상자, `data-slot`이 붙은 컴포넌트 노드는 Frame이다. 글자 하나만 감싼 상자는 없애고 글자가 그 자리를 차지하며(가운데 맞춤은 글자의 가로·세로 정렬로 옮긴다), 아이콘 하나만 감싼 상자와 그대로 통과시키는 상자도 없앤다. 자식 없이 칠·테두리만 있는 잎은 Rectangle이다.
- **효과.** 「고객의 소리」 목록 프레임의 Frame이 124개에서 69개로 줄었다. `data-slot` 이름은 그대로 남아 되짚기의 근거가 유지된다. 접은 수는 manifest의 `folded`에 남고 보고에도 적는다.

### 2026-09-16 스파이크 R3: 이관 뒤 하네스의 자리

- **답.** 하네스는 제거하지 않고 `plugins/ooee-harness/`(Claude Code Plugin)로 분리해 전달 자산과 함께 넘긴다. 자세한 것은 「이관 시 남기는 것」에 적었고, 「아직 정하지 않은 것」의 위치 행을 이 결과로 닫았다.
- **왜 이 저장소 안의 Plugin인가.** 셋을 견줬다. ① 이 저장소 안 Plugin 디렉터리, ② 별도 저장소, ③ 제거 규칙만 고치기. ③은 순서 8의 완료 기준(「설치해서 돈다」)을 채우지 못한다. 파일 복사는 설치가 아니고, `SKILL.md`에 `apps/sandbox`와 `pnpm --filter @ooee/sandbox …`가 문자열로 박혀 있어 남의 저장소에서 성립하지 않는다. ②는 하네스가 전달 자산에 강하게 묶여 있는 지금 상태와 맞지 않는다. `/review-design`의 검사 항목과 `/generate-code`가 읽는 문서의 대부분이 `docs/system/`이고, `SKILL.md`가 `button.tsx`의 Focus 문자열과 `index.ts`의 export 목록을 참조한다. 같은 저장소에 두면 그 결합이 `pnpm check`와 sandbox 테스트로 계속 검사된다. ①에서 ②로는 디렉터리 하나를 뽑아내면 되므로 되돌리기도 싸다.
- **Plugin으로 확인한 것.** `skills/`·`.mcp.json`·`settings.json`은 Plugin 루트에 두고 `.claude-plugin/plugin.json`이 이름을 정한다. Skill 이름 앞에는 Plugin 이름이 붙어 `/ooee-harness:generate-code`가 된다. `${CLAUDE_PLUGIN_ROOT}`와 `${user_config.…}`는 Skill 본문에서도 치환되므로 화면 자리와 검사 명령을 설정값으로 뺄 수 있다. marketplace는 같은 저장소에 두고 `source`를 상대 경로로 적을 수 있으며, 개발 중에는 `claude --plugin-dir ./plugins/ooee-harness`와 `/reload-plugins`로 바로 시험한다. 비공개 저장소 설치는 기기의 git 자격 증명을 그대로 쓴다.
- **Plugin이 못 하는 것.** 권한 규칙을 싣지 못한다. Plugin 루트의 `settings.json`은 `agent`와 `subagentStatusLine` 두 키만 받는다. 그래서 공용 권한은 설치하는 저장소의 `.claude/settings.json`이 계속 소유하고, 붙여 넣을 조각을 Plugin의 README가 갖는다.
- **순서 8에 `/design-page`는 넣지 않는다.** `scripts/figma/`는 `packages/tokens` 상대 import, `scripts/visual` 실행 위치, `node_modules/.pnpm/*` 탐색, 3001 포트 개발 서버에 동시에 기댄다. `/generate-code`·`/review-design` 둘로 완료 기준을 채우고, Figma 쪽은 `data-slot` 승격 결정 뒤에 옮긴다.
- **함께 정해야 하는 것 둘을 「아직 정하지 않은 것」에 더했다.** import 경계 문장을 `docs/system/quality.md`로 승격할지(기획자), 전달본 사본을 만드는 절차(개발자)다.

### 2026-09-16 순서 8: 하네스를 Plugin 으로 묶었다

- **만든 것.** `plugins/ooee-harness/`(Claude Code Plugin)와 저장소 루트 `.claude-plugin/marketplace.json`. Plugin 은 `skills/generate-code`·`skills/review-design`, 규칙 판정기 `lib/screen-rules.mjs`, 화면을 훑는 `lib/check-screens.mjs`, 그 시험, 설치 문서 `README.md`를 갖는다. 이 저장소의 `.claude/skills/`에는 `/design-page`만 남았다.
- **경로를 설정값으로 뺐다.** `screens_dir`·`docs_root`·`check_command` 셋이다. `SKILL.md` 본문에서 `${user_config.…}`로 쓰고, 설정이 비어 있으면 요청에 적힌 값이나 저장소 구조에서 찾아 쓰고 보고에 적는다. 화면 규칙 판정기는 `typescript` 를 설치한 저장소에서 찾아 쓰므로 Plugin 자체에는 의존성이 없다.
- **완료 기준을 채웠다.** `docs/system/`·`packages/`·화면 앱만 담은 사본 저장소를 만들어 Plugin 을 띄우고 `/ooee-harness:generate-code`로 STO 지원요청 화면을 만들었다. build·test·화면 규칙 검사가 모두 통과했고 「pull request 준비 완료」까지 갔다. 사본에는 `AGENTS.md`도 `docs/process/`도 `.claude/`도 없다.
- **사본 시험에서 드러난 것 둘.** ① 화면 앱의 빌드 산출물이 `.gitignore` 에 없으면 보고의 「세 파일만 바뀌었다」 확인이 언제나 실패한다. Plugin README 의 요구 조건에 적었다. ② 화면 규칙 검사 명령이 승인 요청에 막히자 세션이 절대 경로를 상대 경로로 바꿔 다시 돌렸다. 경로 표기를 바꾸는 것도 「막힌 명령 다시 시도」라고 `SKILL.md`에 적고, 늘 쓰려면 저장소가 `permissions.allow` 에 한 줄을 두도록 README 에 넣었다.
- **남은 것.** `/design-page`와 `scripts/figma/`는 저장소 구조에 기대므로 옮기지 않았다(R3 의 결정). marketplace 설치(`/plugin marketplace add`)는 대화형 명령이라 사본 시험에서는 `--plugin-dir`로 확인했다.

### 2026-09-17 ②가 느린 까닭은 Figma 가 아니라 옮겨 적는 글자 수였다

- **틀린 기록을 고쳤다.** 「인스턴스 둘을 놓는 데 23분」이라 적어 두고 다음 수로 `getNodeByIdAsync` 를 꼽았었다. `use_figma` 로 구간을 재 보니 페이지 찾기 11ms, `loadAsync` 25ms, 컴포넌트 77개 훑기 17ms, `createInstance` 131ms, 글자 바꾸기 11ms — **인스턴스 하나에 0.2초**다. 그 23분은 그 실행이 11단계 157,897자였던 것이고, 단계마다 함께 실리는 `builder.js` 를 모델이 한 글자도 틀리지 않게 다시 쳐서 넘기는 시간이었다.
- **그래서 줄인 것은 단계 payload 다.** ① 단계에 실을 builder 에서 주석과 빈 줄을 뺀다(저장소 원본은 그대로). ② 인스턴스로 놓을 노드는 안쪽을 싣지 않고 글자만 남긴다. 되읽기도 인스턴스 안쪽은 화면의 자리로 견주지 않으므로 사양에서 빼도 잃는 것이 없다. 관리자 로그인 기준 **7단계 87,168자 → 5단계 51,413자**다.
- **대신 생긴 위험을 막았다.** 인스턴스 자리의 안쪽을 싣지 않으므로 그 이름의 컴포넌트가 Figma 에 없으면 빈 상자가 그려진다. 처음에는 `/design-page` 가 `instanceMiss` 를 모아 「검사 실패」로 보게 하려 했으나, 뒤에 더 단단한 쪽으로 바꿨다 — `builder.js` 가 컴포넌트를 못 찾으면 아무것도 그리지 않고 `error` 로 멈춘다. 그래서 `instanceMiss` 라는 검사는 지금 없다.
- **카탈로그를 18종 135개로 넓혔다.** Switch·Radio·Textarea·InputButton·NumberInput·Combobox·ToggleButton·NotificationBadge·SelectBox·AppHeader·BottomNavigation. 넓히다 Button 의 `fill·brand·regular` 가 두 번 만들어지던 것을 찾아 고치고, 변형 이름이 겹치면 빌드가 실패하도록 막았다.
- **배운 것.** 이 도구에서 값비싼 자원은 Figma 호출이 아니라 **모델이 옮겨 적는 글자**다. 다음에 ②가 느리면 먼저 `manifest.json` 의 단계 수와 글자 수를 본다.

### 2026-09-17 다섯 관점 검토: 고친 것과 남은 것

위 두 변경을 다섯 관점(주석 제거 안전성·인스턴스 접기·카탈로그 정확성·문서 일치·회귀와 시험)으로 검토했다. 관점마다 제 git worktree 에서 같은 커밋을 보고 돌았고, 나온 지적 21건은 반박 에이전트가 **직접 재현한 13건**만 남겼다.

- **카탈로그가 사실과 달랐다.** Badge 18개가 이름은 `medium` 인데 `size` 를 넘기지 않아 `small` 로, Chip 7개가 이름은 `rounded` 인데 기본값 `circle` 로 그려지고 있었다. 처음부터 있던 자리이고, Figma 에 그대로 올라갔으면 디자이너가 없는 변형을 있다고 믿었을 것이다.
- **접기의 뒷면이 있었다.** 인스턴스 안쪽을 싣지 않으면서 컴포넌트를 못 찾았을 때는 그 빈약한 노드로 프레임을 그리려 했다. 실제로는 `NaN` 좌표·12px 기본색 글자·투명한 체크박스가 되고 audit 이 그것을 세지 않는다. 되돌아가기를 없애고 `error` 로 멈추게 했다.
- **검사에 구멍이 있었다.** `pnpm check` 가 `@ooee/studio` 만 짓고 test glob 에 `apps/sandbox` 가 없어 sandbox 시험이 CI 에서 한 번도 돌지 않았다. `check` 에 넣었고, 새로 붙인 「화면이 쓰는 인스턴스 이름이 카탈로그에 모두 있다」가 곧바로 빠진 이름 둘을 찾았다.
- **남은 것이었다가 푼 것.** 카탈로그를 Figma 로 옮기는 실행이 **42단계 702,691자**였고 그중 74%가 39번 되풀이되는 `builder.js` 였다. 아래에서 풀었다.
- **방법에 대해 배운 것.** 검토자를 나란히 돌릴 때는 ① 각자 제 worktree 에서 **검토할 커밋을 직접 checkout** 해야 하고(그러지 않으면 엉뚱한 커밋을 본다), ② 브라우저를 쓰는 명령마다 `CDP_PORT` 를 달리 줘야 한다(기본 9222 를 함께 쓰면 서로 막혀 멈춘다). 둘 다 한 번씩 겪고 고쳤다.

### 2026-09-17 builder 를 한 번만 보낸다

②가 무거운 까닭이 「단계마다 같은 코드를 다시 친다」는 것이었으므로, 그 반복을 없앴다. `use_figma` 로 세 가지를 직접 확인하고 설계했다.

- 호출 사이에 `globalThis` 는 **살아남지 않는다**(`survived: false`). 함수를 전역에 두는 길은 막혀 있다.
- 공유 plugin data 는 문서에 남아 **다음 호출에서 그대로 읽힌다**. 6,082자를 넣고 다음 호출에서 해시까지 같게 되읽었다.
- plugin 환경에 `eval` 과 `new Function` 이 **있다**. 되읽은 코드를 `AsyncFunction` 으로 만들어 실제로 돌렸다.

그래서 「builder 를 문서에 둔다」 단계를 하나 두고, 뒤따르는 build 단계는 조각만 실은 채 그것을 꺼내 부른다. build 단계의 코드는 700자 남짓이다.

| | 전 | 후 |
| --- | --- | --- |
| 관리자 로그인 | 6단계 67,456자 | **6단계 44,358자** |
| 카탈로그(139개) | 42단계 702,691자 | **23단계 223,095자** |

**한 단계의 한도도 19,000자에서 12,000자로 낮췄다.** builder 를 뺀 첫 판은 한 단계가 데이터만으로 19,000자가 됐는데, 카탈로그를 실제로 올리다 그중 하나가 「옮기는 중 조각 내용이 바뀌었다」로 멈췄다. 그 단계 파일 자체는 해시가 맞았다(로컬에서 11개를 모두 확인). 즉 해시 가드가 **모델이 옮겨 적다 틀린 것을 잡아낸** 것이고, 고칠 곳은 파일이 아니라 단계 크기였다. 지금은 가장 큰 단계가 11,946자다.

두 겹으로 지킨다. loader 는 실어 보낸 코드의 해시를 저장 전에 다시 재고, build 단계는 문서에서 꺼낸 코드의 해시가 자기가 기대하는 값과 같은지 본다. 그래서 build 단계만 따로 다시 돌리는 것은 막힌다 — 문서에 builder 가 없거나 낡았으면 그리지 않고 멈춘다.

### 2026-09-18 순서 3·5 를 하지 않기로 했다

**Storybook 과 Storybook MCP 를 설계에서 뺀다**(개발자 결정).

순서 3 은 처음부터 조건부였다 — 「순서 2 의 결과 절에 `docs/system/` 만으로 부족했던 것이 적힐 때만
진행한다」. 순서 2 부터 여기까지 화면 여덟과 카탈로그를 만들면서 그 자리에 적힌 것이 없다. 하네스는
`docs/system/` 의 컴포넌트 문서와 `packages/ui/src/index.ts` 의 export 만으로 컴포넌트를 고르고 써 왔고,
막힌 것은 문서가 없어서가 아니라 문서가 옮겨 간 파일을 가리켜서였다(그건 문서 표류 쪽 문제다).

**AI 를 위해 Storybook MCP 를 두는 것이 뜻이 없다는 것이 이유다.** Storybook MCP 가 더 주는 것은
TS 타입에서 뽑은 Property 목록과 Story 예시인데, 앞의 것은 컴포넌트 문서가 코드 문자열 그대로 갖고 있고
뒤의 것은 Studio 의 Playground 가 화면으로 갖고 있다. 사람이 컴포넌트를 찾아보는 채널도 Studio 가
이미 맡는다. 즉 Storybook 은 사람에게도 AI 에게도 새로 주는 것이 적은데, 브랜드 변수 주입 decorator 와
배포·호스팅이라는 유지 비용이 따로 붙는다.

**대신 `llms.txt` 를 둔다.** 저장소 밖에서 조회할 endpoint 가 필요하다는 것이 Storybook 을 검토한
본래 까닭이었으므로, 그 자리는 당근 `seed-design.io/llms.txt` 처럼 **AI 가 읽기 쉬운 색인 한 장**으로
대신한다. 무엇을 어디서 읽으면 되는지만 적고 내용은 기존 문서가 그대로 갖는다.

**Studio 는 임시가 아니라 그 역할의 주인이 된다.** 여러 문서가 「최종적으로는 Storybook 이 맡는다」고
적어 두었던 것을 함께 걷어냈다.
