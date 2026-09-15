# 작업 환경과 검증

## shadcn 작업 환경

초기 환경은 shadcn CLI v4 관련 워크플로우를 참고해 구성한다.

- 프로젝트 설정을 읽는 shadcn Skill
- 최신 문서와 registry를 조회하는 MCP
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

`apps/sandbox`는 `pnpm check` 밖이다. `/generate-code`가 만든 화면은 `pnpm --filter @ooee/sandbox build`와 `pnpm --filter @ooee/sandbox test`로 따로 검사한다. 무엇을 `apps/sandbox`에 두는지는 [ai-environment.md](ai-environment.md)가 정한다.

Studio의 라우트를 지운 뒤 `pnpm check`의 build가 없는 경로를 가리키며 실패하면 `apps/studio/.next`를 지우고 다시 돌린다. 앞서 `pnpm dev`가 남긴 `.next/dev/types`를 `next build`가 지우지 않고 `tsconfig.json`이 그 파일을 포함하기 때문이다.

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
