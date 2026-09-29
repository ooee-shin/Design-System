# AI 개발 환경 구축 계획

개발자가 맡은 AI 개발 환경 트랙의 순서, 결정, 스파이크 결과와 `dev → main` 통합 검증 항목을 채워 가는 기록이다. AX 전환 단계의 정의는 [roadmap.md](roadmap.md), branch 절차는 [git-workflow.md](git-workflow.md), 현재 상태는 [working-context.md](working-context.md), 시스템 정의는 `docs/system/`이 소유하며 여기에 다시 적지 않는다. `AGENTS.md`·Skill을 전달 자산으로 삼게 되면 이 문서의 이관 시 위치는 「이관 시 남기는 것」이 정한다.

## 목표와 범위

최종 목표는 기획자가 화면 구성을 프롬프트로 적으면 검수를 거쳐 개발자에게 전달되는 흐름이다. Claude Code에 설치하면 `/review-design`, `/generate-code` 명령으로 다음 단계를 수행하는 Skill 또는 Plugin을 만든다. ②④ 의 이력은 「2026-09-22 Figma 를 뺐다」에 있다.

```text
① 디자인 시스템 검색
② sandbox 에서 띄워 보고 검사
③ 검수
④ dev 에 배포된 화면을 사람이 보고 개선 회차
⑤ Storybook · @ooee/ui 조회
⑥ 실제 코드 생성
⑦ Story 생성 · 테스트
⑧ Pull request 준비
```

「스파이크 결과」 이하에서 ②④는 옛 뜻이다 — ② `/design-page`로 Figma에 그리기, ④ Figma 재조회.

명령과 단계의 대응은 `/generate-code`가 ①⑤⑥⑦⑧, `/review-design`이 ③, `/make-screens`가 ②, 러너 스크립트가 ④다. Figma 단계를 맡던 `/design-page`는 `2026-09-22` 에 지웠다. `/review-design`은 만든 화면 코드를 `docs/system/quality.md`의 항목에 하나씩 대조해 위반 목록을 내므로 Figma 없이 돈다. 순서 2의 완료 기준과 A/B 검증의 「위반 수」는 이 목록의 항목 수다. 「pull request 준비 완료」는 ⑧의 끝으로, `pnpm check`와 `apps/sandbox` 검사가 통과한 미커밋 working tree에서 `.github/pull_request_template.md` 양식으로 쓴 본문 초안을 대화에 제시한 상태다.

[roadmap.md](roadmap.md)의 5단계(이하 roadmap N단계)와 대응하면 ①⑤는 roadmap 3단계(스토리북 MCP), 나머지는 roadmap 4·5단계(에이전트 룰, 자동화)다. roadmap.md는 4·5단계를 1차 제외로 두고 [working-context.md](working-context.md)의 「일정과 분담」은 `2026-09-20`부터 `2026-09-23`까지 그 테스트를 잡아 두었다. 이 문서는 roadmap 4·5단계를 **개발자 트랙의 검증용 실험 구현**으로 다룬다. roadmap.md와 루트 `README.md`의 1차 범위 문구를 고칠지는 「아직 정하지 않은 것」에 있다. 이 문서에서 「순서 N」은 「순서와 의존 관계」의 0~8 번호다.

## 용어와 전제

- **패키지 이름은 `@ooee/ui`다.** 저장소 밖의 초기 계획 메모에 적힌 `@repo/ui`는 이 이름을 가리키며, 저장소 안의 문서와 코드는 `@ooee/ui`만 쓴다.
- **「Sonnet 수준의 모델」은 Claude Code를 `claude --model sonnet`으로 띄운 세션이다.** [roadmap.md](roadmap.md)의 「목표 품질은 Sonnet 수준의 낮은 모델로도」를 실행 방법으로 옮긴 것이다. `sonnet`은 그 시점의 최신 Sonnet을 가리키므로 순서 2의 결과 절과 A/B 결과에는 실제로 돈 모델의 전체 이름을 적는다.

## 순서와 의존 관계

```text
0 이 문서
1 Figma 확인 질문 + 스파이크 R1                   2와 독립. 질문은 비용이 없고 답을 기다린다
2 Skill v0                                        docs/system/ + @ooee/ui만으로 /generate-code · /review-design
  ↓
3 (하지 않기로, `2026-09-18`)                      Storybook·Storybook MCP — 「2026-09-18 순서 3·5 를 하지 않기로 했다」
  ↓
4 Agent Rules                                     v0가 실제로 필요로 한 규칙만
  ↓
5 (하지 않기로, `2026-09-18`)                      Storybook 배포·CI. 순서 3 과 함께 걷어냈다
  ↓
6 Figma MCP 읽기 + 컴포넌트 매핑표 (Figma, `2026-09-22` 에 지움)
  ↓
7 /design-page (Figma, `2026-09-22` 에 지움)       ② 쓰기 + ④ 재조회. 결과는 「스파이크 결과」의 날짜 절
  ↓
8 패키지화
```

Storybook보다 Skill v0를 앞에 둔 이유는 둘이다. 첫째, ①⑥⑧과 ⑤의 `@ooee/ui` 조회, ⑦의 테스트에 Skill이 필요로 하는 재료가 이미 있어서 Storybook 없이 성립한다. 둘째, A/B 검증의 B안 기준선이 Storybook 스파이크의 성패에 묶이지 않는다. 각 순서가 만든 것은 「스파이크 결과」의 날짜 절이 갖는다.

## 이 문서가 제안하는 기본값

아래 항목은 각 순서의 pull request 본문에 적고 합칠 때 확정한다. 상대 담당 영역에 닿는 항목은 여기 두지 않고 「아직 정하지 않은 것」에 담당과 기한을 붙여 둔다.

**Skill이 바로 쓸 수 있는 재료는 이미 있다.** `docs/system/`은 Sonnet 수준의 에이전트가 그 문서만 보고 코드를 만들도록 쓰였고(`docs/system/README.md`의 「이 문서의 독자」), 컴포넌트 문서는 Property 값을 코드 문자열 그대로 적는다. `packages/ui/package.json`의 exports가 import 경로를, `scripts/visual/inspect.mjs`가 화면 측정을, `.github/pull_request_template.md`가 pull request 양식을 준다. [roadmap.md](roadmap.md)의 「A/B 비교 검증」이 지금까지의 경험상 낫다고 적은 B안(컴포넌트만 주고 코드 생성)이 바로 이 조합이다.

- **Storybook은 Skill의 전제가 아니다.** 기획자가 개발 서버를 띄우지 못해도 ①이 성립해야 하므로 파일을 먼저 읽는다 — ①의 원본은 `docs/system/README.md`의 컴포넌트 표와 각 컴포넌트 문서, ⑤는 `packages/ui/package.json`의 exports다. 부족한 것이 저장소 밖에서 조회할 endpoint뿐이면 `llms.txt`로 간다(「2026-09-18 순서 3·5 를 하지 않기로 했다」).
- **Skill이 만든 기획자 화면은 전달 범위 밖의 `apps/sandbox`에 둔다.** `apps/studio`는 그 자체가 전달 대상이므로 생성 결과를 거기에 두지 않는다. 기획자가 제품 화면을 한 건씩 만드는 작업장(블루키 리뉴얼)도 `2026-09-22` 에 Studio 의 `/screens` 에서 sandbox 의 `/renewal` 로 옮겼다. 생성 화면을 제품 화면으로 채택할지는 기획자가 정한다. `apps/sandbox`는 Studio와 같은 Next.js 앱이며 Studio처럼 `typecheck` script를 두지 않는다. 루트 `typecheck`가 `pnpm -r typecheck`라서 workspace package에 그 script가 있으면 `pnpm check`에 자동으로 들어오고, `lint`·`build`·`test`는 `apps/sandbox`를 가리키지 않으므로, 이렇게 두면 `apps/sandbox`는 `pnpm check` 밖에 남는다. 검사는 `pnpm --filter @ooee/sandbox build`와, `apps/sandbox`의 `*.test.tsx`를 도는 자체 `test` script(`pnpm --filter @ooee/sandbox test`)로 한다. v0에서 ⑦의 테스트는 이 `*.test.tsx`다. 전달 시 `docs/process/`와 함께 제거한다.
- **v0가 만드는 화면 둘은 정해 둔다.** 하나는 관리자 로그인으로, `apps/sandbox/src/app/(renewal)/renewal/admin/login/page.tsx`가 원본이다. 그 파일의 머리말 주석과 [sources.md](sources.md)의 Auth split screen 설명만 프롬프트로 주어 다시 만들고, 원본과 `@ooee/ui` 재사용을 대조한다. 다른 하나는 STO 지원요청 화면으로, `/screens/*`에 원본도 없고 `screen-registry`에도 항목이 없으므로 원본이 없는 기획자 요청에 해당한다. 둘 다 `apps/sandbox`에 만들며 `/screens/*`에는 두지 않는다. A/B 검증은 같은 화면 둘로 비교한다.
- **명령은 pull request를 만들지 않고 멈춘다.** `AGENTS.md`의 「화면 확정 검수」와 「여러 환경에서 이어서 작업할 때」가 정한 대로 commit·push·pull request 생성은 사용자의 명시적 요청이 필요하다. pull request는 순서 4에서 그 두 곳에 더했다. 명령은 「pull request 준비 완료」에서 멈추고 사용자가 요청하면 만든다.

## 스파이크

스파이크와 Skill v0의 결과는 「스파이크 결과」에 `### 2026-09-xx 제목` 절로 덧붙인다.

| 번호 | 질문 | 비용 | 완료 기준 |
| --- | --- | --- | --- |
| R1 | Figma remote MCP의 `generate_figma_design`·`use_figma`가 개발자 계정과 seat에서 되는가. 결과가 라이브러리에 묶이는가. 대상 폴더는 [figma-page-agent.md](figma-page-agent.md)의 결과물 폴더다 | 반나절 | 어느 서버에 어느 도구가 있는지, seat와 플랜 조건, 결과 frame의 상태가 적힌다 |
| R2 | Storybook과 `@storybook/addon-mcp`가 이 스택(Tailwind v4, `private: true` 소스 export, Node 22.22.1)에서 도는가. `features.componentsManifest`가 `docs` toolset을 켜는가. Studio 없이 Brand tone·`brand-alpha-*`와 `oe-brand-*`의 선택 표현·Focus ring이 보이는가 | 하루 | `pnpm build-storybook` 성공, `docs-list` 응답, Brand Button 배경·Checked Checkbox·Active Chip·Focus ring이 보이는 스크린샷 |
| R3 | 이관 뒤 `AGENTS.md`·Skill·`.mcp.json`이 어디에 남는가 | 반나절 | 「이관 시 남기는 것」이 채워진다. `2026-09-16` 완료 |
| R4 | 비공개 무료 플랜에서 Storybook을 어디에 올리는가 | 반나절 | 호스팅 하나가 정해지고 secret 이름이 정해진다 |

## 통합 검증 항목 채우기

검증 항목은 둘이다([git-workflow.md](git-workflow.md) 「dev에서 main으로 올릴 때」). 대상이 생기는 순서대로 실행 가능한 명령으로 바꾼다.

| 항목 | 명령 또는 확인 | 생기는 순서 |
| --- | --- | --- |
| 컴포넌트가 서로 충돌하지 않는가 | `pnpm check` | 지금부터 |
| Skill과 Agent가 동작하는가 | `pnpm --filter @ooee/sandbox test`(`screen-rules` 포함) 통과. `/generate-code`를 「이 문서가 제안하는 기본값」의 관리자 로그인 프롬프트로 저장소 루트에서 연 세션에서 한 번 돌려 `admin-login-2` 같은 새 key로 「pull request 준비 완료」까지 간다. 같은 세션의 `/permissions`에 `.claude/settings.json` 출처의 `ask`·`deny` 규칙이 보인다 | 2, 4 |

## 요청 폼

기획자가 화면을 요청하는 입구를 Slack 폼으로 둔다. 기획자는 GitHub 계정이 있지만 그 화면에 익숙하지 않아서, 요청을 issue 본문으로 직접 받으면 아래 칸들이 지켜지지 않는다. 폼이 칸을 강제하면 그 문제가 구조적으로 사라진다. 워크스페이스가 유료 플랜이라 폼과 이모지 리액션 트리거, 커넥터를 모두 쓸 수 있다.

**요청 문단의 원본은 GitHub issue 본문이고 Slack은 입구와 알림만 맡는다.** 대조할 자리가 하나여야 요청서가 사본으로 검증되기 때문이다. Slack 메시지는 편집 이력이 남지 않고, 저장소 밖에서 읽으려면 봇 토큰이 필요하며, 무료 워크스페이스에서는 90일 뒤 숨겨지고 1년 뒤 지워진다.

이 자리에 Claude를 넣지 않는다. Slack MCP는 사용자별 OAuth라 각자 자기 권한으로 스레드를 **읽어 오는** 데는 쓸 수 있지만, 세션이 살아 있을 때 당기는 도구여서 폼 제출도 리액션도 세션을 깨우지 못하고, 폼 제출 콜백은 앱의 URL로 가므로 MCP 서버가 그 자리에 설 수 없다. 옮겨 적는 일 자체를 모델에게 맡기지 않는 까닭은 따로 있다. 이 흐름의 검사가 바이트 대조라서 조립은 결정론적인 쪽이 맡아야 한다.

### 여섯 칸

| 칸 | 라벨 | 형식 |
| --- | --- | --- |
| 1 | 화면 이름 | 한 줄 · 필수 |
| 2 | 이 화면이 하는 일 (프롬프트) | 긴 답변 · 필수 |
| 3 | 비슷한 기존 화면 | 한 줄 · 선택 |
| 4 | 프로젝트 | 목록에서 하나 · 필수. 목록의 마지막은 「새 프로젝트」다 |
| 5 | 새 프로젝트 | 한 줄 · 선택. 4에서 「새 프로젝트」를 골랐을 때 적는다. 비우면 처리하는 쪽이 요구사항을 보고 정한다 |
| 6 | 화면 유형 | 여러 선택 `웹` · `태블릿` · `모바일` · 필수. 하나 이상 고른다 — 고른 폭 모두에서 서는 화면을 만든다 |

처음에는 여섯 칸이었고 「이번에 만들지 않는 것」과 「아직 안 정해진 것」이 필수로 있었다. `2026-09-21`에 개발자가 둘을 뺐다. 프롬프트 한 칸이 그 내용을 담는다는 판단이다. `2026-09-23`에 같은 까닭으로 「저장하거나 제출하면 무슨 일이 일어나야 하나요?」도 뺐다 — 제출하면 일어나는 일도 요구사항 문단에 쓰면 그만이다. `issue.mjs` 는 그 라벨을 계속 읽는다(#9 처럼 그 칸이 있는 옛 이슈가 남아 있다). **대가는 빈 칸과 「없음」의 구분이 사라진 것이다.** 안 적힌 것이 「정해졌다」로 읽히면 만드는 쪽이 임의로 정하므로, 기획자에게 「안 정한 것은 안 정했다고 프롬프트에 쓴다」를 말로 전한다.

각 칸의 설명문은 아래를 그대로 넣는다. 폼 안내문은 「화면 하나를 요청하는 자리입니다. 여기 적은 문단이 그대로 개발과 검수의 기준이 됩니다.」로 둔다.

```text
1 · 화면 이름
이 화면을 부르는 이름을 하나만 적어 주세요.
메뉴에 보이는 말 그대로가 가장 좋습니다. 예: STO 지원요청 작성

2 · 이 화면이 하는 일 (프롬프트)
무엇을 보여 주고 무엇을 하게 하는 화면인지 이어지는 문장으로 씁니다.
화면에 실제로 보일 항목, 선택지, 기본값, 버튼 문구를 빠뜨리지 마세요.
저장이나 제출이 있으면 눌렀을 때 무엇이 보여야 하는지도 이 문단에 씁니다.
목록으로 끊지 말고 한 문단으로 써 주세요.

3 · 비슷한 기존 화면
있으면 화면 이름이나 주소를 적습니다. 새로 만드는 화면이면 비워 두세요.

4 · 프로젝트
이 화면이 어느 프로젝트의 것인지 고릅니다.
목록에 없으면 「새 프로젝트」를 고르고 아래 칸에 이름을 적어 주세요.

5 · 새 프로젝트
위에서 「새 프로젝트」를 골랐을 때 이름을 적습니다. 예: 블루키 리뉴얼 2기
비우면 요구사항을 보고 알맞은 프로젝트에 넣거나 새로 만듭니다.

6 · 화면 유형
이 화면이 어느 폭으로 서는지 고릅니다. 여러 개를 골라도 됩니다.
웹은 데스크톱 브라우저, 태블릿은 매장 태블릿 가로, 모바일은 폰입니다.
```

**프로젝트와 화면 유형은 다른 축이다**(`2026-09-23` 개발자). 프로젝트는 「블루키 리뉴얼」처럼 실제로 굴러가는 일의 단위이고 샌드박스 첫 화면의 탭이 된다. 유형은 폭이다 — 한 프로젝트에 웹 화면과 모바일 화면이 함께 있다. 처음에 두었던 `sto` · `sv` · `web` 은 둘을 섞은 값이라 `2026-09-23` 에 갈랐다. 그때까지 만든 화면 열일곱 장은 프로젝트 「하네스 시험」으로 묶고 유형만 나눠 붙였다(웹 8 · 태블릿 6 · 모바일 3).

프로젝트 목록은 `apps/sandbox/src/screens.ts` 의 `SANDBOX_PROJECTS` 가 원본이고 폼의 목록과 같아야 한다. 기획자가 「새 프로젝트」를 골라 이름을 적으면 그 요청을 처리할 때 그 파일에 한 줄이 늘고(generate-code 「파일과 등록」), 그다음부터 폼 목록에도 더한다. `issue.mjs` 는 id 로도 이름으로도 받고, 적은 이름이 이미 있는 프로젝트면 새로 만들지 않고 그리로 넣는다 — 오타 하나로 프로젝트가 둘로 갈라지지 않게 한다. **「새 프로젝트」만 고르고 이름을 비우면(또는 프로젝트 칸이 비면) 묻지 않고 처리하는 쪽이 정한다**(`2026-09-23` 개발자) — 요구사항이 부르는 제품·업무가 있는 프로젝트와 같으면 그리로, 아니면 그 이름으로 새 프로젝트를 만든다. 정한 것은 결과 댓글의 「판단이 필요한 것」 첫 줄에 남아 기획자가 개선으로 옮길 수 있다(`/make-screens` 1단계). 목록에 없는 다른 이름(오타일 수 있는 것)은 여전히 묻는다. 유형 세 값(`web` · `tablet` · `mobile`)은 `SANDBOX_VIEWPORTS` 가 갖고 검사 뷰포트(1440x900 · 1024x768 · 390x844)를 함께 정한다. **한 화면이 여러 폭을 가질 수 있다**(`2026-09-23`, #60 에서 기획자가 웹·모바일을 함께 골랐다). 그러면 상자를 두르지 않고 반응형으로 만들며, 폭마다 검사한다. sandbox 의 모든 화면 위에는 맨 위 막대(낭독기에는 「화면 도구」, 눈에 보이는 글은 폭 단추 앞의 「보기 폭」)의 폭 전환(웹 · 태블릿 · 모바일)이 있어 같은 화면을 세 폭 모두 그 크기의 액자(iframe, `?frame=1`)로 바꿔 본다(`2026-09-28` #124 — 웹만 화면을 그대로 두면 막대 높이만큼 화면이 잘렸다). 처음 서는 폭은 요청이 고른 폭 가운데 웹·태블릿·모바일 순으로 가장 넓은 것이고(모바일만 고른 화면은 모바일 액자로 열린다), 화면을 옮기면 그 화면의 것으로 다시 선다. 창의 안쪽 폭이 「고정 폭 액자 + 32px」 보다 넓지 않으면(러너의 검사 창·실제 폰) 고정 폭 액자 대신 웹과 같은 전체 폭 액자를 쓰고 막대에 「창이 <폭> 액자보다 좁아 창 폭으로 보인다」 를 보인다 — 그래서 러너의 검사(`/make-screens` 4단계)는 `/<key>?frame=1` 로 액자 안 문서를 직접 열어 `h1` 과 가로 넘침을 잰다. **액자 안인지는 주소의 `?frame=1` 이거나 창이 최상위가 아닌 것(`window.self !== window.top`)으로 판정한다**(`2026-09-29`) — 주소만 보던 때는 액자 안에서 화면끼리 링크로 옮기면 표식이 빠져 액자 안에 막대와 중첩 액자가 또 섰다. 러너의 검사는 최상위 창으로 여니 주소가 그대로 근거다. Slack 은 여러 선택 값을 JSON 배열로, 한글은 `\uc6f9` 처럼 이스케이프해 보내는데 `issue.mjs` 가 푼다. **한쪽을 고치면 다른 쪽도 고친다.**

### 이슈 본문

「문제 생성」 단계가 제목을 `화면 요청: <화면 이름>`으로 만들고 본문을 이렇게 채운다.

```md
요청자: <양식을 제출한 사용자>
프로젝트: <프로젝트>
새 프로젝트: <새 프로젝트>
화면 유형: <화면 유형>
요구사항: <이 화면이 하는 일 (프롬프트)>
비슷한 기존 화면: <비슷한 기존 화면>
```

### 두 번째 폼 — 화면 수정 요청

승인되어 `main` 에 들어간 화면을 고치는 입구다(`2026-09-23` 개발자). 개선 회차(D4)와 다르다 — D1~D4 는 `decide.mjs`·`runner.mjs` 의 이름이다. 개선은 이 화면에 더하는 새 요구까지 받는다(`/make-screens` 1-1, `2026-09-24` 개발자). 다른 화면·프로젝트의 일일 때만 묻고 멈춘다. 이미 승인된 화면에 새로 생긴 요구는 여기로 온다. **화면은 제자리에서 고친다**(같은 key, 같은 샌드박스 주소). 주소를 공유한 사람이 그대로 쓸 수 있고 샌드박스가 늘어나지 않는다. 앞 모양은 git 이력에 남는다.

| 칸 | 라벨 | 형식 |
| --- | --- | --- |
| 1 | 고칠 화면 이름 | 한 줄 · 필수 |
| 2 | 그 화면을 만든 요청 번호 | 한 줄 · 필수 (예: `39`) |
| 3 | 무엇을 고칠까요? | 긴 답변 · 필수 |
| 4 | 화면 key | 한 줄 · 선택 (요청이 화면 여러 장을 만들었을 때만) |

「문제 생성」 단계가 만드는 제목과 본문이다. **제목은 `화면 요청:` 으로 시작한다** — 1분 감시(`scripts/harness/watch-decisions.mjs`)가 그 제목으로 요청을 고른다. 접두어는 `issue.mjs` 의 `TITLE_PREFIX`.

```md
제목: 화면 요청: <고칠 화면 이름> 수정

요청자: <양식을 제출한 사용자>
수정 대상: #<그 화면을 만든 요청 번호>
화면 key: <화면 key>
요구사항: <무엇을 고칠까요?>
```

`수정 대상` 줄이 이 요청을 수정 요청으로 만든다(`issue.mjs` 의 `mode: "수정"`). 처리하는 쪽은 대상 요청의 머지된 pull request 본문 「화면별 인수」에서 그 화면의 key 와 앞 인수를 찾아, 뒤에 `수정: <이번 요구>` 와 `고칠 화면: <key>` 를 붙여 generate-code 를 부른다. 그다음은 보통 요청과 같다 — sandbox 검사 · `dev` 머지 · 배포 · 결과 댓글 · 결정.

### 채널 카드

```text
화면 요청이 올라갔습니다: <화면 이름> 처리는 바로 시작되고, 결과는 #디자인시스템-화면-요청-결과물 채널에 카드로 올라옵니다. 이슈: <문제 URL>
```

### 지금 도는 모양

`2026-09-21` 기준으로 워크플로 「화면 요청」이 채널 `#디자인시스템-화면-요청`에 게시되어 있고 세 단계다.

```text
① 양식에서 정보 수집
→ ② GitHub 「문제 생성」 (bluekey-kr/Design-System-Harness)
→ ③ 채널에 메시지 보내기
```

이슈를 먼저 만드는 것은 카드에 이슈 링크를 실으려고 그렇게 둔 것이다. 커넥터가 쓰는 GitHub 계정은 `YUJINSIK-momo`로 고정해 두어서 기획자가 자기 GitHub을 연결하지 않아도 돈다. GitHub 앱 구독은 걸지 않는다(「처리와 승인」 끝의 「Slack 채널 구독은 없다」).

### 만들면서 확인된 것

- **파일 업로드 답변은 이슈 본문에 넣지 못한다.** 넣으면 「문제 생성」이 시작도 못 하고 `parameter_validation_failed`로 죽는다. 이슈 본문은 문자열만 받는다. 그래서 3번 칸은 파일이 아니라 한 줄 텍스트다.
- **GitHub 웹에서 되는 끌어다 놓기는 커넥터로 못 한다.** 웹 편집기가 파일을 GitHub 쪽에 올려 주는 것이고, 커넥터가 보내는 것은 제목과 본문 문자열뿐이다. 이미지는 Slack 카드 아래에 남으므로 필요하면 사람이 이슈로 옮긴다.
- **조건 분기(「브랜치 추가」)는 Business+ 전용이다.** 「리액션을 단 사람 == 요청자」 같은 검사를 워크플로 안에서 할 수 없다. 대조는 댓글에 남긴 이름으로 저장소 쪽에서 한다.
- **워크플로가 실패하면 ⋮ → 「내 활동 로그」에 단계별로 보인다.** 어느 단계가 어떤 오류로 죽었는지 거기서 읽는다.
- **커넥터는 사용자 OAuth로 돈다.** `/github` Slack 앱과 달리 저장소 소유자가 앱을 설치하지 않아도 된다. 다만 조직 저장소는 GitHub `Settings → Applications`에서 그 조직에 접근을 Grant 해야 목록에 나타난다.
- **조직 소유 비공개 저장소는 GitHub Pages 를 못 쓴다.** 조직이 Free 플랜이면 Pages 설정 자체가 열리지 않는다. Team 이상이어야 한다. 그래서 배포는 Cloudflare Pages 로 간다.
- **변수는 「마지막으로 클릭한 자리」에 들어간다.** 글자를 친 뒤에는 원하는 자리를 다시 클릭하고 `{ }`를 눌러야 한다. 설명 칸에서는 `cmd+A`가 페이지 전체를 선택하므로, 지울 때는 끝을 클릭하고 백스페이스로 지운다.

### 처리와 승인

`2026-09-21`에 개발자가 정한 흐름이고, `2026-09-22`에 스크립트로 이었고, `2026-09-24`에 역할을 뒤집어 모델은 화면만 만들고 나머지는 `scripts/harness/runner.mjs` 가 한다. 확정된 이슈를 처리한 결과가 **눈으로 보이는 화면**을 지나 승인으로 가게 한다. 이 절은 흐름과 승인 범위를 갖는다. 단계마다 무엇을 돌리는지는 Skill이, 스크립트의 입출력은 `scripts/harness/README.md`가 갖는다.

```text
요청 이슈 (요청 채널의 폼 → GitHub 「문제 생성」)
→ 러너가 바로 처리 <n> (모델은 /make-screens 로 화면만 만든다)
    이슈 읽기 → 화면 생성 · 검사 (generate-code) → sandbox 에서 띄워 보고 검사 → push
    → 러너가 pull request → Quality 확인 → dev squash 머지
    → Deploy workflow 가 Cloudflare Pages 에 올린다 → 화면 주소 확인
    → 결과 댓글 → 봇이 결과 채널에 카드 한 장 (머리 네 줄 + 버튼)
→ 기획자가 카드의 버튼으로 결정: 👍 승인 · 👎 반려(한 번 더 묻는다) · 😕 개선 — 까닭은 카드 스레드에
    → 다리가 GitHub 결과 댓글의 「승인」·「반려: …」·「개선: …」으로 옮긴다
→ 러너가 읽고 결정 <n> (승인·반려는 스크립트만, 개선은 /make-screens 를 다시 부른다)
    승인 → dev → main pull request → Quality 확인 → 러너가 머지
    반려 → 사유를 보고하고 이 요청의 화면을 dev 에서 되돌린다
    개선 → 다시 만들어 다음 회차 결과 댓글

화면은 dev 에 있는데 결과 댓글이 없는 요청 → 결과 <n> (결과 댓글만. 모델을 부르지 않는다)
```

- **새 요청은 스크립트가 운전하고 모델은 화면만 만든다**(`2026-09-24` 개발자: 「역할 뒤집기 시작해」). `runner.mjs` 의 `runRequest` 가 이슈 읽기 → `/make-screens` 한 번 → `plan.json` 확인 → 가지·commit·push·pull request·Quality·머지·배포 확인·결과 댓글을 모두 한다. 모델이 멈출 수 있는 자리는 하나로 줄었다. 까닭은 `2026-09-23`~`24` 에 요청 처리가 아홉 번 무너진 것이다 — 화면 생성은 한 번도 실패하지 않았고 무너진 것은 언제나 모델이 운전하던 주변이었다(까닭은 `scripts/harness/plan.mjs` 머리말). 결정도 같은 길이다 — 승인·반려는 `decide.mjs` 규칙으로 모델 없이, 개선만 `/make-screens` 를 다시 부른다.
- **처리를 부르는 것은 이 Mac 의 1분 감시다**(`2026-09-22` 저장소 주인 결정, `2026-09-23` 에 Actions job 밖으로 옮김). `scripts/harness/watch-decisions.mjs`(launchd, 60초)가 열린 「화면 요청」을 읽어 **결과 댓글이 없는 요청**과 **새 결정**을 고르고, `local-run.mjs` 가 사본을 `origin/dev` 로 맞춰 `runner.mjs` 를 돌린다. 반응도 댓글도 같은 길로 읽힌다. `.github/workflows/harness.yml` 은 손으로 부르는 예비로만 남았다 — job 안에서 돌리면 연결이 끊길 때 GitHub 가 job 을 버린다(#60). 까닭은 `scripts/harness/README.md` 「러너」. 기록은 job 요약 대신 `~/.ooee-harness/runs/` 에 남는다. GitHub 이 빌려 주는 컴퓨터가 아니라 이 Mac 인 까닭은 처음에는 Figma MCP 가 OAuth 로그인만 받아서였고, Figma 를 뺀 지금은 Claude 와 gh 가 이 Mac 에 로그인한 계정으로 돌기 때문이다. 이 Mac 이 꺼져 있거나 잠들면 처리가 밀린다. 요청 채널 카드의 ✅는 여전히 아무것도 깨우지 않는다 — 요청 이슈가 열리는 순간이 시작이다.
- **이슈는 러너가 닫는다**(`2026-09-23`). 승인이 `main`에 합쳐진 때와 반려의 되돌림이 `dev`에 합쳐진 때다. 닫는 글은 「처리를 마쳐 닫습니다 — …」로 시작해 판독이 결정으로 읽지 않는다. 에이전트는 여전히 `gh issue close`를 못 쓴다(공용 권한 deny). 개발자가 `dev → main`을 한꺼번에 올린 뒤에 승인이 나면(#48) 만들 pull request 가 없으므로 러너가 그 요청의 commit 이 `main`의 조상인지 확인하고 닫는다.
- **pull request 를 만들고 합치는 것은 러너 스크립트다.** `gh pr create`·`gh pr merge`는 공용 권한의 `ask`이고 ask 는 allow 보다 먼저 판정되어 headless 세션에서 풀 수 없다. 역할을 뒤집은 뒤로(위 항목) 모델은 push 조차 하지 않고 화면과 `plan.json` 만 쓰며, push·pull request·Quality·머지는 러너가 한다. 승인된 요청은 러너가 `main`까지 합친다 — 승인이 곧 `main` 반영이다. 절차는 `scripts/harness/README.md` 「Claude 는 화면까지, 나머지는 스크립트가」.
- **dev 가 보는 자리다.** 기획자는 코드가 아니라 배포된 화면을 보고 판단한다. 화면이 도는 주소가 생기기 전에는 승인을 묻지 않는다.
- **컴포넌트 보기.** 디자인 시스템 › 요청 › sandbox. sandbox 의 화면마다 맨 위 막대(낭독기에는 「화면 도구」)의 **맨 왼쪽**에 단추 둘 「요청 보기 · 컴포넌트 보기」 가 선다(`apps/sandbox/src/components/component-inspector/`, 루트 layout 이 그 막대의 도구 자리로 넘기고 화면 코드는 모른다. `2026-09-29` — 전에는 화면 아래에 알약 막대로 떠서 화면을 가렸다). 단추는 액자 **밖** 문서에 서지만 **세는 대상은 액자 안 문서**이고(`iframe[data-sandbox-frame]` 의 contentDocument), 테두리와 이름표는 액자 안 좌표계라야 자리가 맞으니 액자 안에 그린다. 열린 판은 막대 안이 아니라 액자 밖 `document.body` 에 뜬다 — 판이 막대의 자손이면 `role="toolbar"` 가 판의 글까지 담는다. 「컴포넌트 보기」는 화면 위 컴포넌트마다 테두리와 이름표를 세우고 오른쪽에 「쓴 컴포넌트 N종 · M곳」 목록을 연다. 목록의 이름은 Studio 문서(`https://ooee-studio.pages.dev/components/<key>`)로 가고, 이름에 올리면 그 자리만 남는다. 맨 위 경로는 디자인 시스템 › 프로젝트 탭 › 화면이다. 「요청 보기」는 그 화면을 만든 요청 문장·날짜·원본을 보인다. 첫 화면의 카드에는 그 화면이 `@ooee/ui` 에서 가져온 컴포넌트가 칩으로 붙는다 — 칩은 빌드 때 화면 코드의 import 를 읽은 것이고, 막대는 그려진 DOM 의 표식을 읽은 것이다. 표식이 없는 컴포넌트(`MessageBubble` 등, 아래 「아직 정하지 않은 것」)는 막대에 잡히지 않는다.
- **Cloudflare Pages 가 `apps/sandbox` 를 배포한다.** 생성 화면이 앉는 자리가 거기다. `dev`에 머지될 때마다 `.github/workflows/deploy.yml`이 올리고, 페이지 주소는 `https://ooee-sandbox.pages.dev/<화면 key>` 가 된다. Vercel 도 GitHub Pages 도 아닌 까닭은 「만들면서 확인된 것」에 적었다.
- **배포가 실패하면 승인을 묻지 않는다.** 그 경우는 반려가 아니라 처리 중 실패이고, 결과 댓글도 올리지 않는다. 배포는 workflow 의 결과가 아니라 화면 주소가 `200` 인지로 본다. secret 이 없으면 workflow 가 배포를 건너뛰고도 성공으로 끝나기 때문이다(「배포는 wrangler 로 직접 올린다」). 없는 key 의 주소는 `404` 다.
- **결과는 이슈 댓글 한 장으로 내고, 카드는 우리가 올린다**(`2026-09-23`). 처음에는 결과 채널이 GitHub for Slack 앱으로 이 저장소의 댓글을 받았는데, 그 앱은 이슈 카드를 채널에 두고 **댓글을 그 카드의 스레드에** 단다. 결과가 채널 본문에 보이지 않고 「1개의 댓글」로만 남았다. 그래서 그 구독을 끊고, `post-result.mjs` 가 이슈에 댓글을 단 뒤 `slack-card.mjs` 로 **결과 머리 네 줄을 채널에 한 장으로** 올린다. 자세한 것은 이슈에 있고 카드가 그리로 가는 링크를 갖는다. 결정은 그 카드에 반응으로 달면 다리가 옮긴다. 토큰·채널이 없으면 카드를 건너뛴다 — 결과의 원본은 이슈다. 카드는 댓글 앞부분만 보여 주므로, 기획자가 Slack 만 보고도 어느 요청의 결과이고 어디서 보는지 알게 첫 네 줄에 요청 · 샌드박스 · 작업 요약을 몰아 둔다. 이 네 줄은 markdown 문법 없이 쓰고 주소를 날 글자로 둔다. Slack 과 GitHub 이 같은 글자로 읽고 둘 다 주소를 링크로 잡는다. 작업 줄에는 장 수만이 아니라 이름을 적는다 — 저장소 주인이 원한 보고가 「컴포넌트 추가」 또는 「OO 작업 · OO 페이지」라서다. 양식과 줄 규칙은 `scripts/harness/README.md` 「돌리는 순서」와 `result-comment.mjs` 머리말.
- **지어낸 것은 결과 댓글에 드러낸다.** 여러 장 요청을 화면별로 나누면 장마다의 요구사항을 처리하는 쪽이 쓴다. 그 부분은 generate-code 인수에서 「지어냄: …」으로 원문과 갈라 두어 `page.tsx` 머리말에서도 갈리게 하고, 결과 댓글 「판단이 필요한 것」에 화면마다 「요청에 없어 지어낸 것」으로 적는다. 기획자는 카드와 결과 댓글만 보고 승인하기 때문이다.
- **결과 댓글 말고는 에이전트가 이슈에 댓글을 달지 않는다.** 결과 채널이 이 저장소의 댓글을 모두 받으므로 처리 중의 물음까지 카드가 된다. 물을 것은 처리하는 세션의 대화에서 묻는다.
- **결정은 카드의 버튼으로 한다**(`2026-09-23`). 결정의 원본은 GitHub 결과 댓글의 반응·댓글(👍(`+1`) 승인 · 👎(`-1`) 반려: … · 😕(`confused`) 개선: …)이며, 결과 댓글 뒤의 신호 가운데 가장 늦은 것이 이긴다. 「승인」 한 낱말, 또는 「반려: …」·「개선: …」처럼 콜론을 붙인 댓글도 결정으로 치며, 꼴 없는 댓글은 사유로 짐작만 하고 개선 회차를 돌리지 않는다(D4). 판독(`decision.mjs`)은 GitHub 의 반응과 댓글만 읽는다. 기획자의 입구는 결과 카드의 버튼이고, 다리(`scripts/harness/slack-bridge.mjs`, 소켓 모드)가 누른 사람 이름과 Slack 링크를 달아 GitHub 댓글로 옮긴다 — 승인은 바로(그다음은 D2: `dev → main`), 개선은 스레드에서 무엇을 고칠지 받아 「개선: 고칠 것」으로, 반려는 이 요청의 화면을 `dev` 에서 되돌리는 일이라(D3, 되돌림 pull request) 잘못 눌렀을 때 값이 커서 스레드에서 세 갈래(정말 반려 · 승인으로 · 개선으로)를 다시 주고 반려를 또 골랐을 때만 까닭을 받아 「반려: 까닭」으로 옮긴다. 까닭이 올라가기 전에는 아무 일도 시작되지 않는다 — 판독이 사유 없는 반려·개선에서 멈추기 때문이다. 카드에 단 이모지도 다리가 그대로 옮기며 반응 길은 되묻지 않는다. Slack 카드의 이모지 자체는 GitHub 에 전해지지 않으므로 다리가 옮기는 것이고, 다리가 꺼져 있으면 GitHub 쪽에 반응이나 「승인」 댓글로 직접 단다.
  - Workflow Builder 로는 못 한다: GitHub 커넥터에 「이슈 만들기」만 있고 댓글 단계가 없으며, 반응 트리거가 주는 값으로는 그 카드가 몇 번 요청인지 가릴 수 없다. 다리를 두면서 결과 댓글의 결정 안내가 「Slack 결과 카드에 달아도 되고 GitHub 의 이 댓글에 달아도 됩니다」로 바뀌었다 — 다리를 끄면 이 문구부터 되돌린다.
  - 판정 꼴은 좁게 둔다. 「승인 전에 하나만 볼게요」를 승인으로 읽지 않으려는 것이다. 대신 「승인합니다」「반려합니다. …」처럼 결정 낱말로 시작하는데 꼴이 맞지 않는 댓글은 판독이 따로 내고, 그것이 이긴 신호보다 늦으면 처리하는 쪽은 결정을 따르지 않고 묻는다. 버리기만 하면 👍 뒤에 「반려합니다」를 남긴 사람의 뜻이 승인으로 읽힌다.
  - 사유 댓글은 판독이 짐작한다. 신호 뒤에 그 사람이 쓴 첫 댓글, 없으면 신호 앞 10분 안의 마지막 댓글이다. 짐작한 사유는 출처를 함께 내고, 개선은 그 글을 사유로 읽어도 되는지 확인받은 뒤 다시 만든다. 질문이나 칭찬이 사유로 잡힐 수 있다. 「개선: …」처럼 쓴 사유는 확인 없이 쓴다.
- **에이전트가 결정을 만들지 못하게 공용 권한이 막는다**(AGENTS.md 「Claude Code 명령과 권한」). 판독이 계정으로 거르지 않는 까닭은 커넥터와 처리 세션이 같은 GitHub 계정이라서다 — 거르면 어떤 결정도 읽히지 않는다. 처음에는 `-X POST` 꼴만 대조해 `gh api …/reactions -f content=+1` 같은 틈이 있었고 `2026-09-22` 에 `gh api` 를 통째로 막았다. 에이전트 세션에는 이슈 쓰기 명령을 열지 않는다. 결과 댓글은 러너가 `scripts/harness/post-result.mjs`로 달며, 그 첫 줄은 「화면 요청 #<n> 결과」라 결정으로 읽히지 않는다. 누구의 결정을 받을지는 「아직 정하지 않은 것」의 확정 권한과 함께 정한다.
- **결정 뒤에 도는 것.**
  - 승인: `dev → main` pull request 를 만든다. 러너에서는 Quality 를 본 뒤 러너가 합친다(위 「pull request 를 만들고 합치는 것은 러너 스크립트다」). `dev`에 승인되지 않은 다른 요청의 화면(대기·개선·결과 없음, 되돌리지 않은 반려)이나 어느 요청의 것인지 알 수 없는 화면 pull request 가 섞여 있으면 만들지 않고, 각각을 푸는 길을 보고한다.
  - 반려: 사유를 보고하고, 이 요청의 화면 폴더와 `screens.ts` 등록 줄을 지우는 pull request 를 `dev` 에 올려 합친다(본문 첫 줄 `되돌림: #<n>`). `git revert` 를 쓰지 않는 까닭은 `plan.mjs` `removeScreens` 머리말(#62)에 있다. 되돌리지 않으면 반려가 하나 나온 뒤로 어떤 승인도 `main`으로 가지 못한다. 화면은 git 이력과 결과 댓글에 남는다. 되돌림이 `dev`에 합쳐지면 러너가 이슈를 닫는다.
  - 개선: 사유가 그 회차 dev pull request 본문의 「판단이 필요한 것」, 지어낸 것, 검수 결과를 가리킬 때만, 앞 회차 인수(그 pull request 본문 「화면별 인수」)에 사유를 붙여 다시 만들고 다음 회차 결과 댓글을 올린다. 대조와 인수는 pull request 본문에서 읽고 화면 코드를 열지 않는다. 같은 대화에서 부르는 generate-code 에 앞 회차 코드가 맥락으로 넘어가면 「다른 화면의 코드 읽기」 금지가 무너진다. 앞 회차 화면은 남긴다. 요청에 없던 새 요구도 이 화면에 더하는 것이면 만들고 `needsDecision` 첫 줄에 「요청에 없던 것을 개선으로 받았습니다: <사유>」로 남긴다(`2026-09-24` 개발자, `/make-screens` 1-1) — 요청 문단의 원본은 이슈 본문이라 댓글로 요구가 늘면 원본이 둘이 되기 때문이다. 다른 화면·프로젝트의 일일 때만 묻고 멈춘다.
- **이미 처리한 요청은 다시 만들지 않는다.** 러너가 이슈를 읽은 뒤 본문에 `요청: #<n>` 줄이 있는 `dev` pull request 를 찾고, 있으면 멈춘다. 화면은 들어갔는데 결과 댓글이 없는 요청은 `결과 <n>` 이 화면을 다시 만들지 않고 결과 댓글만 올린다.
- **개선은 세 번까지다(4회차까지).** 네 번째 개선이 오면 다시 만들지 않고 멈춘다. 개선은 요청이 비워 둔 자리를 기획자가 하나씩 채우는 일이다. 같은 문단으로 세 번 채워도 맞지 않으면 모자란 것은 화면이 아니라 요청 문단이고, 그때는 폼으로 요청을 다시 쓰는 편이 이슈 본문을 원본으로 지킨다. 한 회차가 화면 생성부터 배포까지 한 바퀴라는 값도 있다. 3 은 겪어 본 값이 아니라 출발값이며, 실제 회차를 보고 고친다.
- **main 은 승인된 요청만 담는다.** 승인 뒤의 `dev → main` pull request 가 그 기록이다. 누가 언제 무엇에 동의했는지가 본문(결정한 사람·시각·반응인지 댓글인지·결과 댓글 주소)과 머지 기록으로 남는다. 개선을 거친 요청은 개선 전 회차의 화면(새 key 로 대신한 앞 key)도 그 요청의 회차 기록으로 함께 가며, 본문에 그렇게 적는다. 앞 key 를 빼려면 화면을 지우는 수정이 따로 들고, `dev → main` 머지는 채택이 아니라 확인의 기록이라 이렇게 두었다. 반려 때 `dev`에서 되돌리는 것과 함께 **개발자가 확인하기 전의 출발값**이다. 바꾸려면 `runner.mjs` 의 승인 처리(`decide.mjs` `mainPr`)에서 앞 key 를 지우는 pull request 를 먼저 두게 한다.
- **승인은 화면 확인까지다.** 기획자가 판단하는 것은 「요청한 화면이 요청대로 나왔는가」 하나다. 코드를 제품에 넣을지, 컴포넌트로 승격할지는 이 승인이 정하지 않는다. `dev → main` 머지는 그 확인을 남기는 기록이지 채택이 아니다. 채택은 `docs/process` 의 이관 절차가 따로 갖는다.

**Slack 채널 구독은 없다**(`2026-09-23`). 결과 채널의 GitHub 댓글 구독(`comments`)은 끊었다(까닭은 위 「결과는 이슈 댓글 한 장으로 내고, 카드는 우리가 올린다」). 요청 채널은 폼의 워크플로가 카드를 올리므로 GitHub 앱 구독이 필요 없다. 다시 구독하면 결과와 결정 댓글이 카드로 한 번 더 떠 두 번 보인다.

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
- 빈 선택 칸(「비슷한 기존 화면」·「새 프로젝트」·「화면 key」)이 라벨만 남은 줄로 나온다. 조건 분기가 없어 줄을 숨기지 못한다. `issue.mjs` 는 빈 값으로 읽는다.
- 「비슷한 기존 화면」은 generate-code 인수(`issue.mjs`의 `generateArgs`)에 들지 않는다. 처리하는 쪽이 결과 댓글의 「판단이 필요한 것」에 「반영하지 않은 칸」으로 남긴다.
- ~~결정을 Slack 카드에서 바로 주지는 못한다~~ → `2026-09-23` 에 카드의 버튼과 다리로 풀었다(「결정은 카드의 버튼으로 한다」).

## 아직 정하지 않은 것

| 항목 | 담당 | 기한 |
| --- | --- | --- |
| ~~`@ooee/ui`를 반영한 Figma 라이브러리를 만들지와 담당~~ → **Figma 를 뺐다**(`2026-09-22`, 「2026-09-22 Figma 를 뺐다」). 아래는 그때의 물음이다. 스파이크 R1에서 라이브러리가 없고 Code Connect는 플랜상 쓸 수 없음을 확인했다(「스파이크 결과」). 없는 채로 가면 순서 6·7은 변수 이름, 레이어 이름(`data-slot`)과 매핑표로 대신한다 | 개발자 | 정해짐 |
| Story 파일 위치(`packages/ui/src/<component>.stories.tsx` 병치 또는 `apps/storybook/stories/`)와 폴더 구조. [working-context.md](working-context.md) 「남은 작업」 10번의 카테고리화와 함께 정한다 | 기획자·개발자 | `2026-09-16` |
| 확정 컴포넌트 20개의 최소 `Default` Story(필수 prop만)를 개발자가 순서 3의 pull request에 한 번에 넣어도 되는가. 순서 3의 완료 기준이 컴포넌트마다 Story 하나를 전제하고 기획자는 `9/14~` 화면 개선 중이라 제안한다. Property를 나열하는 Story는 제안 밖이며 [open-questions.md](open-questions.md)의 Style·Size 이름 통일 뒤에 기획자가 쓴다 | 기획자 | `2026-09-16` |
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
| `data-slot` 이름을 시스템 정의로 승격할지. 지금 이 이름은 `packages/ui`의 코드와 sandbox 의 `component-map.ts`(「컴포넌트 보기」)에만 있고 `docs/system/`에는 없다. sandbox 의 컴포넌트 표시·측정·자동화가 계속 쓸 이름이면 `docs/system/`이 소유해야 한다 | 기획자 | `2026-09-23` |
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

## 이관 시 남기는 것

스파이크 R3(`2026-09-16`)의 결과다. **하네스는 제거하지 않고 `plugins/ooee-harness/`(Claude Code Plugin)로 분리해 전달 자산과 함께 넘긴다.** `AGENTS.md`·`.claude/`·`docs/process/`·`apps/sandbox`·`scripts/harness/`는 지금 규칙대로 전달본에서 사라지고, 그 안에서 명령이 실제로 쓰는 것만 Plugin으로 옮긴다. 옮기는 것은 절차(Skill)와 기계 판정(`screen-rules`)이고, 남겨 두는 것은 이 저장소의 작업 신호·branch 운영·v0가 만든 화면 기록이다.

**「제거」는 전달본에서만 일어난다.** 이 저장소는 이관 뒤에도 컴포넌트를 이어서 만드는 자리이므로, 전달은 여기서 파일을 지우는 일이 아니라 전달 범위만 담은 사본을 만드는 일이다. `2026-09-21` 에 트랙 파일을 `bluekey-kr/Design-System-Harness` 로 옮긴 것(「아직 정하지 않은 것」)은 정본 저장소를 바꾼 일이지 이 이관이 아니다.

Skill 사용법과 MCP 설정은 `docs/system/` 바깥에 둔다. 규칙은 `docs/system/README.md`의 「이 문서의 독자」가 소유한다.

| 지금 자리 | 이관 시 | 까닭 |
| --- | --- | --- |
| `docs/system/`, `packages/`, `apps/studio` | 전달 | 전달 자산 그대로 |
| `plugins/ooee-harness/` | 전달 | 설치 단위다. 화면을 쓸 자리와 검사 명령은 설정값(`userConfig`)이라 저장소 경로를 박지 않는다 |
| `scripts/visual/` | 전달 | 저장소 경로에 기대지 않고, 루트 `package.json`의 `visual` script와 함께 남는다 |
| `.claude/`(`settings.json`·`skills/make-screens`) | 제거 | Plugin은 권한 규칙을 싣지 못한다. 받는 쪽 `.claude/settings.json`에 붙여 넣을 `permissions` 조각을 `plugins/ooee-harness/README.md`가 갖는다. `/make-screens`는 이 저장소의 러너가 부르는 명령이다 |
| `scripts/harness/` | 제거 | 화면 요청을 돌리는 러너·Slack 다리. 이 저장소의 요청 흐름이지 전달 자산이 아니다(`AGENTS.md` 「문서 구조」) |
| `apps/sandbox` | 제거 | 화면을 쓸 자리는 설치한 저장소가 갖고, Plugin의 설정값이 그 자리를 가리킨다 |
| `docs/process/`, `AGENTS.md` | 제거 | 작업 신호, branch 운영, 화면 확정 검수 |
| `.github/workflows/` | 미정 — 개발자가 정한다 | `harness.yml`은 러너의 예비라 제거 쪽이지만, `deploy.yml`은 전달 대상인 `apps/studio`도 올린다 |
| `AGENTS.md`의 import 경계(「코드 소유 경계」) | 미정 — 승격하거나 옮긴다 | `@ooee/ui`에서만 가져온다는 규칙은 작업 운영이 아니라 시스템 규칙이므로 `docs/system/quality.md`로 승격할지 기획자와 정한다(「아직 정하지 않은 것」). 승격하지 않으면 원본을 `plugins/ooee-harness/rules/`로 옮기고 `AGENTS.md`가 그 파일을 가리킨다 |

**받는 쪽이 하는 일은 넷이다.**

1. `/plugin marketplace add <저장소 또는 사본 경로>` 뒤 `/plugin install ooee-harness@ooee`. 비공개 저장소는 기기에 이미 있는 git 자격 증명을 쓴다.
2. 설치하면 명령 이름 앞에 Plugin 이름이 붙는다. `/ooee-harness:generate-code`·`/ooee-harness:review-design`이다.
3. `plugins/ooee-harness/README.md`의 `permissions` 조각을 자기 `.claude/settings.json`에 붙여 넣는다. Plugin이 권한을 대신 걸어 주지 않는다.
4. 설정값 셋(`screens_dir`·`docs_root`·`check_command`)을 채운다.

**하네스는 `docs/system/` 없이 성립하지 않는다.** ①의 디자인 시스템 검색과 `/review-design`의 검사 항목이 모두 그 파일들을 원본으로 읽는다. 그래서 Plugin을 설치하는 저장소에는 전달 자산이 함께 있거나 「아직 정하지 않은 것」의 조회 endpoint가 있어야 한다.

## 새 컴포넌트를 만들 때

`@ooee/ui` 에 없는 컴포넌트를 만드는 절차는 [new-component.md](new-component.md) 가 갖는다. 채워야 하는 다섯 자리(구현·export·문서·등록·Playground 와 카탈로그 축)와 shadcn 에서 옮겨 쓰는 방식, Playground 양식이 거기 있다.

## 2026-09-22 Figma 를 뺐다

개발자 결정이다. **화면 요청 처리에서 Figma 를 뺐고, 결과는 sandbox 에서만 본다.**

- **까닭.** 화면마다 Figma 로 옮기는 데 오래 걸렸다 — 이커머스 5장(#9)은 코드가 다 된 뒤에도 Figma 에 한 시간 넘게 걸렸다. 그것을 줄이려고 붙인 것(게시된 라이브러리의 인스턴스로 그리기, 라이브러리가 코드보다 낡았는지 보는 검사, 키를 지키는 제자리 갱신)이 도구를 더 크게 만들었다. 요청한 사람이 보는 것은 sandbox 의 화면이고, 채택 판단도 거기서 한다. 처음부터 Figma 를 순서의 뒤에 둔 까닭도 같다 — 라이브러리·seat·Code Connect 가 없는 채로는 roadmap.md 가 적은 A안의 경험이 반복될 뿐이었다.
- **지운 것.** `/design-page` Skill, `scripts/figma/`, `.mcp.json`(Figma remote MCP), sandbox 의 Figma 카탈로그(`/catalog`)와 개발 서버 지문 route, `docs/process/figma-component-map.md`·`figma-page-agent.md`. 러너는 Figma 단계 없이 돈다. 결과 댓글은 첫 네 줄(제목·요청·샌드박스·작업)이다.
- **대신하는 것.** Figma 로 옮기던 자리는 `/make-screens` 의 「sandbox 에서 띄워 보고 잰다」다. 빌드한 sandbox 를 `scripts/visual/inspect.mjs --serve` 로 띄워 화면마다 캡처하고 `h1`·가로 넘침·컴포넌트 표식을 잰 뒤, 캡처를 눈으로 대조해 깨진 자리를 `dev` 에 올리기 전에 고친다. 사람은 `dev` 에 배포된 화면을 보고 결정한다 — 개선이면 다음 회차 PR 이 `dev` 로, 반려면 되돌림 PR 이 `dev` 로, 승인이면 `dev → main` 이다.
- **남긴 것.** 컴포넌트가 DOM 에 남기는 `data-slot`·`data-*` 표식. sandbox 가 화면에 어떤 컴포넌트를 썼는지 보여 주는 데 쓴다(「처리와 승인」의 「컴포넌트 보기」). 버튼처럼 보이는 링크를 `<Button render={<a href="…" />} nativeButton={false} role="link">` 로 쓰는 generate-code 규칙도 같은 까닭으로 둔다 — Button 표식이 있어야 sandbox 가 그 자리를 Button 으로 읽는다.
- **Figma 라이브러리.** `ooee · 컴포넌트 라이브러리` 파일은 Figma 에 남아 있지만 이 저장소는 더 갱신하지 않는다. `2026-09-22` 기준으로 코드보다 낡았다(Chip 켜짐 · Switch 켜짐 · SelectBox 선택).
- 아래 「스파이크 결과」의 Figma 기록은 그때의 기록이다. 가리키는 파일은 지웠다.

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

- **화면.** `/generate-code`로 관리자 웹 「고객의 소리」(`apps/sandbox/src/app/voc`)를 만들었다. 사람이 고친 자리는 하나다 — 상세 패널이 열린 동안 표가 남은 폭보다 넓어져 고객·담당자 열을 숨겼다(개발자 결정). `/review-design` 위반 0건, 테스트 16건, `pnpm check` 통과.
- **시도한 것.** 브라우저에 뜬 화면을 트리로 읽어 `use_figma` 로 넘기는 변환 도구(`scripts/figma/`, 지웠다)로 두 프레임을 그렸고, 칠과 글자를 전부 `oe` 변수·텍스트 스타일에 묶었다. Pretendard 가 Figma 에 없어 Noto Sans KR 로 대체했다.
- **확인한 것.** 칠과 글자를 변수에 묶으면 `get_design_context`가 hex 대신 변수 이름을 먼저 낸다 — R1 에서 hex 만 나오던 것이 풀렸다. 컴포넌트는 Code Connect 가 없어 레이어 이름(`data-slot`)으로만 알 수 있었다.
- **비쌌던 것.** Chrome 이 Tailwind v4 색을 `lab()`·`oklab()` 로 돌려주는 것, 조각 경로 충돌, 숨은 input 값이 글자로 딸려 오는 것, `use_figma` 의 50,000자 제한처럼 변환의 예외를 하나씩 고치는 일이었다.

- **판단이 필요한 것(디자인 시스템의 빈틈).** 처리 상태 칩이 「하나만 켜짐」인데 chip.md 는 그 동작을 Tab 의 역할로 두고 Tab 컴포넌트는 없다. 매장·유형 Select 를 Field 없이 단독으로 썼다. 기간은 Trigger 하나인데 input-button.md 는 둘로 나누라 한다. Table 컴포넌트가 없어 native `table` 이다. Tab 은 [open-questions.md](open-questions.md) 「Tab 컴포넌트」가 갖는다.

### 2026-09-15 /design-page: 순서 7의 ②

- **만든 것.** `/design-page` Skill 과 `scripts/figma/prepare.mjs`·`audit.js`(모두 지웠다). 토큰 추출·화면 읽기·조각 나누기를 로컬에서 끝내고 `use_figma` 에 넘길 단계 파일과 manifest 를 만들었다.
- **비쌌던 것.** 네 관점 검토의 지적 대부분이 변환의 예외(상태 class 색, Portal 팝업, 다른 컬렉션의 같은 이름 변수, 글꼴 고정, 헤드리스 Chrome 의 최소 폭, `<body>` 에 칠한 바탕)였고, Sonnet 실행 세 번마다 새 예외가 나왔다.
- **남긴 것.** 「투명한 자리는 회색 캔버스로 보인다」처럼 사람의 대조에 기대야 하는 자리가 있었다 — 도구가 커진 까닭이다(「2026-09-22 Figma 를 뺐다」).

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

- **만든 것.** `.mcp.json`(figma 항목)과 매핑표 `figma-component-map.md`(모두 지웠다). A/B 의 A안이 재조회 결과를 입력으로 쓰므로 일정보다 앞당겨 `9/16` 에 했다 — 사전이 없으면 A안은 「Figma 경유가 나쁘다」가 아니라 「사전이 없어 실패했다」를 재게 된다.
- **되짚기의 근거는 넷뿐이었다.** 레이어 이름(`data-slot`), 변수 이름, 숫자로 남는 크기, 자식 구성. `data-variant`·`data-tone`·`data-size` 는 옮겨지지 않아 `variant`·`tone` 은 팔레트 단계로 되짚어야 했고, `layout`·`readOnly`·그림자·Focus ring 처럼 되짚을 수 없는 값이 많았다.
- **비쌌던 것.** 표의 주장 138건 가운데 28건이 코드와 달라 고쳤고, 색 규칙은 커밋마다 바뀌어 표에 기준 커밋을 적어야 했다. `MessageBubble` 은 `data-slot` 이 없어 빈칸이었다(「아직 정하지 않은 것」).

### 2026-09-16 /design-page ④: Figma에서 고친 것을 코드로

- **만든 것.** 프레임을 JSON 으로 읽는 `scripts/figma/reread.js`·`reread.mjs` 와 판정 시험, `/design-page` 의 「되읽기」 절(모두 지웠다).
- **방식.** ②가 루트 프레임에 `<key>|s<상태>|<커밋>|<날짜>` 기준선을 남기고, 되읽기는 사람이 고친 자리만 코드로 되돌린다 — 색 토큰·문구·글자 크기·아이콘은 자동, 크기·위치·요소 추가·삭제는 「사람이 정할 것」. 커밋이 다르면 색 변화는 되돌리지 않는다(그사이 색 규칙이 바뀔 수 있고 `97bbdd2` 가 실제로 그랬다).
- **Figma를 원본으로 만들지 않는다.** 되읽기는 고친 자리만 옮기고 나머지 코드를 그대로 둔다.

### 2026-09-16 순서 6·④를 Figma로 확인했다

- 저장소 폴더에서 띄운 headless 세션(`claude -p … --allowedTools "mcp__figma…"`, Sonnet `claude-sonnet-5`)에는 Figma MCP 가 실린다는 것을 확인하고 그 세션으로 돌렸다.
- **확인한 것.** 레이어 이름 195개가 모두 매핑표로 풀렸고(순서 6 완료 기준), 수정안 프레임에서 고친 네 곳(칠·글자·아이콘·폭)을 되읽기가 정확히 내고 셋을 자동, 폭을 사람 몫으로 갈랐다(④ 완료 기준).
- **비쌌던 것.** `use_figma` 응답이 20,000자쯤에서 잘려 노드를 줄로 돌려주게 바꿨고, 글꼴 대체만으로 글자 칸 크기 66건이 거짓으로 잡혀 글자 크기는 견주지 않게 했다. 세션이 단계 코드를 임의로 고쳐 루트 프레임이 빠진 적이 있어 Skill 에 「코드를 고치지 않는다」를 적었다.

### 2026-09-16 A/B 검증

- **방식.** 화면 둘(관리자 로그인, STO 지원요청)을 두 안으로 각각 만들었다. 실행마다 저장소를 따로 clone해 Sonnet(`claude-sonnet-5`) 세션이 `/generate-code` → `/review-design`을 돌렸고, 측정은 다른 모델이 코드와 출력을 읽어 했다. B안은 요구사항 문단을, A안은 Figma에서 다시 읽은 결과(레이어 이름·변수 이름·크기)와 [figma-component-map.md](figma-component-map.md)를 입력으로 주었다. A안의 Figma 프레임은 ②로 옮긴 것이다. 재사용 비율은 `docs/system/README.md` 컴포넌트 표의 확정 컴포넌트가 맡는 역할(버튼·입력·선택 등)을 가진 요소 가운데 `@ooee/ui` import 로 만든 것의 수를 그 요소 전체 수로 나눈 값이며, 레이아웃용 요소는 세지 않는다.
- **결과.** 위반은 B안 1건(아이콘 크기)·A안 0건, `@ooee/ui` 재사용은 두 안 모두 관리자 로그인 4/5·STO 16/16이었다. 요청과 어긋난 자리는 B안 0·1건, A안 4·5건이다. 판정은 [roadmap.md](roadmap.md)의 「A/B 비교 검증」에 적었다.
- **무엇이 갈렸나.** 위반 수와 재사용 비율로는 갈리지 않는다. 두 안이 같은 Skill과 같은 `docs/system/`을 쓰기 때문이다. 갈리는 것은 요청의 뜻이다. Figma에는 동작(제출을 눌러야 반영된다), 미정(목적지가 없다), 선택지 목록이 없어서 A안은 그 자리를 스스로 정하거나 비운다. 예를 들어 A안의 STO는 Figma의 `switch` 레이어를 그대로 Switch로 두었고, B안은 요청의 낱말과 `switch.md`를 견줘 Checkbox로 바꾼 뒤 그 판단을 보고에 적었다.
- **그래서 Figma의 역할은 검토용 캔버스다.** 「아직 정하지 않은 것」의 Figma 역할 행을 이 결과로 닫는다. 코드로 먼저 만들고, Figma로 옮겨 사람이 보고, 고친 것만 되읽기로 되돌린다.
- **곁들여 확인한 것.** A안 실행 하나가 금지된 `apps/studio/src/app/screens/` 파일을 열었다고 스스로 보고했다. `/generate-code`의 「하지 않는 것」이 금지한 자리이며, 규칙이 막지 못하고 보고로만 드러난 사례다.

### 2026-09-16 Figma 구조: 배치하는 곳만 Frame

- **왜.** 옮긴 결과에서 DOM 감싸개까지 모두 Frame 이었다. 개발자가 「가장 바깥만 Frame 으로 두고 오토 레이아웃을 쓰라」고 정했고, 오토 레이아웃은 Frame 에만 붙으므로 「배치하는 곳만 Frame」으로 옮겨 적었다.
- **규칙과 효과.** 배치하는 상자·칠이 있는 상자·`data-slot` 노드만 Frame 이고, 글자나 아이콘 하나만 감싼 상자는 없앤다. 「고객의 소리」 목록 프레임의 Frame 이 124개에서 69개로 줄었고 `data-slot` 이름은 그대로 남았다.

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

- **틀린 기록을 고쳤다.** 「인스턴스 둘을 놓는 데 23분」의 까닭은 Figma 가 아니었다. `use_figma` 로 구간을 재 보니 인스턴스 하나에 0.2초였고, 23분은 단계마다 함께 실리는 `builder.js` 를 모델이 한 글자도 틀리지 않게 다시 쳐서 넘기는 시간이었다.
- **줄인 것.** 단계 payload — builder 에서 주석·빈 줄을 빼고 인스턴스 안쪽을 싣지 않았다. 컴포넌트를 못 찾으면 빈 상자를 그리는 대신 `error` 로 멈추게 했다. 카탈로그는 18종 135개로 넓혔다.
- **배운 것.** 이 도구에서 값비싼 자원은 Figma 호출이 아니라 **모델이 옮겨 적는 글자**다.

### 2026-09-17 다섯 관점 검토: 고친 것과 남은 것

- 위 두 변경을 다섯 관점에서 검토했다. 관점마다 제 git worktree 에서 같은 커밋을 보고 돌았고, 나온 지적 21건은 반박 에이전트가 **직접 재현한 13건**만 남겼다.
- **찾은 것.** 카탈로그가 사실과 달랐고(Badge 18개·Chip 7개가 이름과 다른 변형으로 그려짐), 인스턴스 접기의 뒷면(컴포넌트를 못 찾으면 빈약한 노드로 그리던 것)을 `error` 로 막았다.
- **검사에 구멍이 있었다.** `pnpm check` 가 `@ooee/studio` 만 짓고 test glob 에 `apps/sandbox` 가 없어 sandbox 시험이 CI 에서 한 번도 돌지 않았다. `check` 에 넣었다.
- **방법에 대해 배운 것.** 검토자를 나란히 돌릴 때는 ① 각자 제 worktree 에서 **검토할 커밋을 직접 checkout** 해야 하고(그러지 않으면 엉뚱한 커밋을 본다), ② 브라우저를 쓰는 명령마다 `CDP_PORT` 를 달리 줘야 한다(기본 9222 를 함께 쓰면 서로 막혀 멈춘다). — **②는 `2026-09-29` 뒤로 필요 없다**: `cdp.mjs` 가 포트를 크롬에게 고르게 하고(`--remote-debugging-port=0`) 자기 프로필의 `DevToolsActivePort` 를 읽어 **자기 브라우저에만** 붙는다. 전에는 9222 가 남의 크롬에게 잡혀 있으면 말없이 그 브라우저에서 재었다(그때 창은 756×556 이라 폭 측정이 통째로 틀렸다).

### 2026-09-17 builder 를 한 번만 보낸다

- 단계마다 같은 builder 코드를 다시 치던 반복을 없앴다. `use_figma` 로 확인한 것 — 호출 사이에 `globalThis` 는 살아남지 않고, 공유 plugin data 는 다음 호출에서 그대로 읽히며, plugin 환경에 `eval` 이 있다. 그래서 builder 를 문서에 한 번 두고 build 단계는 조각만 실어 그것을 꺼내 불렀다. 카탈로그 실행이 42단계에서 23단계로, 글자 수는 1/3 로 줄었다.
- **해시 가드가 모델이 옮겨 적다 틀린 것을 잡아냈다.** 한 단계가 19,000자가 되자 「옮기는 중 조각 내용이 바뀌었다」로 멈췄는데 단계 파일 자체는 해시가 맞았다. 고칠 곳은 파일이 아니라 단계 크기였다(한도를 12,000자로).

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
