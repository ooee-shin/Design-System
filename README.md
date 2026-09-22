# Design-System-Harness

블루키 디자인 시스템(`ooee-ui`)으로 **기획자의 화면 요청을 검수된 화면 코드까지 잇는 하네스**다. Claude Code Plugin과 Figma 도구, 생성 화면을 두는 sandbox, 그리고 그 설계와 결정 기록을 갖는다.

`2026-09-21`에 `ooee-shin/ooee-ui`에서 이력과 함께 옮겨 왔다. 저장소 문서와 스크립트는 여기가 정본이다. 디자인 시스템 자체(`packages/*`, `docs/system/`, `apps/studio`)의 원본은 `ooee-ui`이고, 하네스가 그것을 읽어야 돌기 때문에 이 저장소에도 함께 있다. 그쪽을 여기서 고치면 `ooee-ui`에도 같은 변경을 내야 두 저장소가 갈라지지 않는다.

## 흐름

```text
Slack 요청 폼 → GitHub issue (요청서 원본)
→ 확정
→ /ooee-harness:generate-code 로 화면 생성 · 검사
→ pull request → dev 머지
→ Cloudflare Pages 에 자동 배포 → 화면 주소를 issue 댓글로 보고
→ 기획자 승인
→ pull request → main 머지
```

요청 폼의 칸, issue 본문 양식과 승인 규칙은 [`docs/process/ai-environment.md`](docs/process/ai-environment.md)의 「요청 폼」과 「처리와 승인」이 갖는다.

## 명령

| 명령 | 하는 일 | 정의 |
| --- | --- | --- |
| `/ooee-harness:generate-code` | 요구사항 한 문단을 화면 코드와 테스트로 만들고 「pull request 준비 완료」에서 멈춘다 | [SKILL.md](plugins/ooee-harness/skills/generate-code/SKILL.md) |
| `/ooee-harness:review-design` | 화면 코드를 디자인 시스템 문서에 대조해 위반 목록을 낸다 | [SKILL.md](plugins/ooee-harness/skills/review-design/SKILL.md) |
| `/design-page` | 화면을 Figma로 옮기고, 사람이 Figma에서 고친 것을 코드로 되읽는다 | [SKILL.md](.claude/skills/design-page/SKILL.md) |

앞의 둘은 `plugins/ooee-harness/`의 Plugin이라 설치해야 보인다. 이 저장소에서는 `claude --plugin-dir ./plugins/ooee-harness`로 띄우거나, `/plugin marketplace add ./` 뒤 `/plugin install ooee-harness@ooee`로 설치한다. 다른 저장소에 설치할 때 필요한 설정값과 권한은 [Plugin README](plugins/ooee-harness/README.md)에 있다. `/design-page`는 저장소 전용 Skill이라 설치 없이 보인다.

## 저장소 구조

```text
plugins/ooee-harness   Claude Code Plugin. generate-code·review-design Skill과 화면 규칙 검사(lib/)
.claude-plugin/        Plugin marketplace 정의(ooee)
.claude/               /design-page Skill과 공용 권한(settings.json)
.github/workflows      Quality(pnpm check)와 Deploy(Cloudflare Pages)
scripts/figma          화면을 Figma로 옮기고 되읽는 도구
scripts/visual         브라우저에서 화면을 재는 도구
scripts/docs           llms.txt 링크 시험
apps/sandbox           생성 화면과 Figma 컴포넌트 카탈로그 (3001 포트)
apps/studio            컴포넌트 문서와 Playground (3000 포트)
packages/ui            공용 Component (@ooee/ui)
packages/tokens        oe semantic token
packages/fonts         언어별 공용 font
docs/system            디자인 시스템 정의. 하네스가 원본으로 읽는다
docs/process           만드는 과정, 결정 기록, 현재 상태
```

## 실행

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev                              # Studio  http://localhost:3000
pnpm --filter @ooee/sandbox dev       # Sandbox http://localhost:3001
```

```bash
pnpm check
```

`pnpm check`는 lint, typecheck, 테스트, sandbox 테스트, Studio·Sandbox production build를 차례로 돈다. GitHub의 `Quality` workflow(`.github/workflows/quality.yml`)가 모든 pull request와 `main`·`dev` push에서 같은 검사를 돈다.

**branch 보호는 없다.** 비공개 저장소의 무료 플랜이라 보호 설정이 열리지 않는다. 검사가 실패해도 머지가 막히지 않으므로, 머지하기 전에 `Quality`가 통과했는지 사람이 본다. push 전에는 로컬에서 `pnpm check`를 먼저 통과시킨다.

## 배포

생성 화면을 기획자가 보는 자리는 Cloudflare Pages다. **`dev`에 push(머지)될 때마다** `Deploy` workflow(`.github/workflows/deploy.yml`)가 sandbox와 studio를 올린다.

| 사이트 | 주소 |
| --- | --- |
| `apps/sandbox` | `https://ooee-sandbox.pages.dev` |
| `apps/studio` | Cloudflare Pages 프로젝트 `ooee-studio` |

- 저장소 secret `CLOUDFLARE_API_TOKEN`(Pages Edit 권한만 준 토큰)을 쓴다. secret이 없으면 경고만 남기고 배포를 건너뛴다.
- 코드가 그대로인데 다시 올려야 하면(배포만 실패했거나 토큰을 새로 넣었을 때) Actions에서 `Deploy`를 손으로 돌린다. `gh workflow run deploy.yml --ref dev`와 같다.
- 로컬에서 직접 올릴 수도 있다.

```bash
pnpm dlx wrangler@4.136.1 login   # 한 번만
pnpm deploy:sandbox
pnpm deploy:studio
```

배포된 주소는 주소를 아는 사람 누구나 볼 수 있다. 공개 범위를 좁힐지는 아직 정하지 않았다(ai-environment.md 「아직 정하지 않은 것」). Cloudflare의 Git 연동 대신 workflow에서 wrangler로 올리는 까닭은 같은 문서의 「Git 연동이 막힌 까닭」에 있다.

## 브랜치

`feature/*`나 `docs/*` → pull request → `dev` → 통합 검증과 승인 → pull request → `main`이다. `main`에 직접 push하지 않는다. GitHub 기본 branch가 `main`이므로 pull request를 만들 때 base를 `dev`로 지정한다(`gh pr create --base dev`). commit 메시지와 pull request 본문은 한국어로 쓴다. 통합 검증 항목은 [`docs/process/git-workflow.md`](docs/process/git-workflow.md)의 「dev에서 main으로 올릴 때」에 있다.

## 먼저 읽을 것

| 무엇 | 어디 |
| --- | --- |
| AI가 저장소를 처음 읽는 진입점 | [llms.txt](llms.txt) |
| 작업 규칙과 코드 소유 경계 | [AGENTS.md](AGENTS.md) |
| 컴포넌트 목록과 고르는 법 | [docs/system/README.md](docs/system/README.md) |
| 하네스의 설계, 결정, 아직 정하지 않은 것 | [docs/process/ai-environment.md](docs/process/ai-environment.md) |
| 지금 무엇을 하고 있고 무엇이 남았나 | [docs/process/working-context.md](docs/process/working-context.md) |
| Figma 도구 | [scripts/figma/README.md](scripts/figma/README.md) |

블루키로 넘길 때 무엇이 가고 무엇이 빠지는지는 ai-environment.md의 「이관 시 남기는 것」이 정한다.

## 현재 환경

- Next.js App Router 앱 둘: `apps/studio`, `apps/sandbox`
- React 19, TypeScript, Tailwind CSS v4
- shadcn CLI v4, Base UI, Nova 프리셋
- pnpm workspace
- Node.js `22.22.1` (`.nvmrc`와 `.node-version`에 고정)
- pnpm `10.32.0` (`packageManager`에 고정)
- repository에 고정된 preview font: 국문 Pretendard, 영문 Inter, 일문 Noto Sans JP
- Figma MCP: `.mcp.json`에 서버 URL만 둔다

현재 실행에 필요한 환경변수는 없다. 이후 환경변수가 생기면 실제 값은 `.env.local`에 두고 Git에는 올리지 않으며, 필요한 변수 이름과 설명만 `.env.example`에 기록한다.

## 이어서 작업할 때

두 기기나 서로 다른 계정은 대화 기록과 로컬 working tree를 공유하지 않는다. repository 안의 문서와 push된 Git commit만 공통 기준으로 사용한다.

```bash
git status -sb
git pull --ff-only
corepack enable
pnpm install --frozen-lockfile
```

그다음 `AGENTS.md`, [`docs/process/working-context.md`](docs/process/working-context.md)와 작업 대상 문서를 읽는다. 기기를 바꾸기 전에는 `pnpm check`와 diff 검토를 마치고 commit·push를 완료한다.
