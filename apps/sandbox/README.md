# ooee sandbox

`/make-screens`(안에서 `/ooee-harness:generate-code`)가 만든 화면과 블루키 리뉴얼을 두는 자리다. 전달 범위 밖이며 `docs/process/`와 함께 이관 시 제거한다. 무엇을 여기에 두고 무엇을 두지 않는지는 `docs/process/ai-environment.md`의 「이 문서가 제안하는 기본값」이 정한다.

- 화면은 `src/app/<key>/page.tsx`에 두고 `src/screens.ts`에 등록한다. 첫 화면 `/`가 그 목록이다.
- 화면 하나의 회귀 검사는 같은 디렉터리의 `page.test.tsx`에 둔다. 첫 줄 `import "@/test-setup"`으로 공용 JSDOM 환경을 불러온다.
- `typecheck` script를 두지 않는다. 루트 `pnpm -r typecheck`에 잡히지 않게 하려는 것이며 타입 검사는 `next build`가 한다.

```bash
pnpm --filter @ooee/sandbox dev     # http://localhost:3001
pnpm --filter @ooee/sandbox build
pnpm --filter @ooee/sandbox test
```

브랜드 변수(`--brand-*`, `--oe-brand-*`, `--oe-focus-ring`)는 Studio와 같은 방식으로 `src/components/brand-variables.tsx`가 런타임에 넣고 `src/app/globals.css`가 기본값을 갖는다. 그 값의 자리를 `packages/tokens`로 옮길지는 `ai-environment.md`의 「아직 정하지 않은 것」에 있으며, 정해지면 두 파일의 복제를 걷어낸다.
