# @ooee/studio

ooee UI 자산을 화면 맥락에서 구현하고 검수하는 Next.js App Router 애플리케이션이다. 프로젝트 목적과 전체 작업 규칙은 루트 `README.md`, `AGENTS.md`, `docs/process/working-context.md`를 기준으로 한다.

명령은 repository root에서 실행한다.

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev:studio
```

기본 주소는 `http://localhost:3000`이다. 포트를 지정하려면 `pnpm dev:studio -- --port 3002`를 사용한다.

현재 주요 검수 경로:

- `/experiments/inbox-split-view`
- `/components/message-bubble`
- `/foundations/color`

검증:

```bash
pnpm check
```

현재 필수 환경변수는 없다. `AGENTS.md`는 Next.js 버전에 맞는 로컬 문서를 먼저 확인하도록 요구하므로 앱 코드를 변경하기 전에 함께 읽는다.
