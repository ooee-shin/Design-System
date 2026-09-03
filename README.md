# ooee-ui

블루키 제품에서 사용할 UI 시스템이다. `oe` semantic token과 공용 컴포넌트·패턴으로 구성하며, 이 저장소에서 1차 컴포넌트를 완성한 뒤 블루키 코드베이스로 이관하거나 별도 패키지로 연동한다.

통합 방식은 아직 검토 중이다. 블루키 코드에 직접 삽입할지 별도 디자인 시스템 패키지로 분리해 연동할지는 개발 검토 후 결정하며, 그 결정은 1차 작업에 영향을 주지 않는다. 기존 개발 네이밍·스택·라이브러리와의 정합성은 1차 범위에서 고려하지 않고, 디자인 토큰은 변환 없이 그대로 사용한다.

구현 기반으로 shadcn/ui를 사용하지만 shadcn의 시각 언어를 유지하는 것이 목적은 아니다. 외부 자료를 입력으로 활용하고 최종 결과물을 `oe` semantic token과 ooee의 컴포넌트 규칙으로 정규화한다.

## 문서 구조

문서는 두 갈래로 나뉜다.

| 위치 | 성격 | 전달 |
| --- | --- | --- |
| **[`docs/system/`](docs/system/README.md)** | 시스템에 무엇이 있고, 어떤 정의이며, 어떤 목적으로 써야 하는가 | 전달 대상 |
| [`docs/process/`](docs/process/README.md) | 무엇을 근거로 어떤 순서와 규칙으로 만드는가 | 전달 시 제거 |
| [`AGENTS.md`](AGENTS.md) | AI 작업자가 지켜야 하는 작업 운영 규칙 | 전달 시 제거 |

`docs/system/`의 문서는 바깥 문서를 참조하지 않는다. 그래서 `docs/process/`와 `AGENTS.md`를 제거해도 `docs/system/` + `packages/` + `apps/studio`만으로 시스템이 그대로 성립한다.

전달 범위에는 `apps/studio`도 포함한다. Studio는 부품을 화면에서 확인하는 현재의 채널이자 Storybook의 기반이며, 최종적으로는 Storybook이 그 역할을 맡는다.

**컴포넌트를 사용하거나 검토하려면 [`docs/system/README.md`](docs/system/README.md)부터 본다.** 자산 카탈로그, 구조 용어, 토큰 체계와 상호작용 규칙이 그 아래에 있다.

## 저장소 구조

```text
packages/tokens      Neutral·Brand·Accent·Status semantic 정의와 Tailwind 연결
packages/fonts       언어별 공용 font
packages/ui          공용 Component
packages/patterns    여러 Component가 결합된 Pattern
apps/studio          공용 자산을 소비하는 검수 화면
```

공용 자산의 실제 원본은 성숙도와 관계없이 `packages/*`가 소유한다. Studio는 이를 import해 검수·설명할 뿐 자체 복사본을 만들지 않는다.

## 실행

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev:studio
```

기본 주소는 `http://localhost:3000`이다. 다른 포트가 필요하면 `pnpm dev:studio -- --port 3002`처럼 지정한다.

```bash
pnpm check
```

`pnpm check`는 lint, 공용 자산 typecheck·test와 production build를 차례로 실행한다. GitHub도 pull request와 `main` push에서 같은 검사를 자동 실행한다. 안전한 branch 작업 방법은 [`docs/process/git-workflow.md`](docs/process/git-workflow.md)를 따른다.

## 현재 환경

- Next.js App Router 기반 Studio: `apps/studio`
- React 19, TypeScript, Tailwind CSS v4
- shadcn CLI v4, Base UI, Nova 프리셋
- pnpm workspace
- Node.js `22.22.1` (`.nvmrc`와 `.node-version`에 고정)
- pnpm `10.32.0` (`packageManager`에 고정)
- repository에 고정된 preview font: 국문 Pretendard, 영문 Inter, 일문 Noto Sans JP

현재 실행에 필요한 환경변수는 없다. 이후 환경변수가 생기면 실제 값은 `.env.local`에 두고 Git에는 올리지 않으며, 필요한 변수 이름과 설명만 `.env.example`에 기록한다.

확정된 언어별 font 기준은 공용 `packages/fonts`가 소유하고 각 앱이 이를 사용한다. font는 build 결과에 포함되며 로컬 시스템 설치 여부에 의존하지 않는다. 브라우저와 운영체제의 rasterization 차이는 남을 수 있지만 font family, glyph metrics와 줄바꿈 기준은 repository에서 재현 가능하게 유지한다.

## 이어서 작업할 때

두 기기나 서로 다른 계정은 대화 기록과 로컬 working tree를 공유하지 않는다. repository 안의 문서와 push된 Git commit만 공통 기준으로 사용한다.

```bash
git status -sb
git pull --ff-only
corepack enable
pnpm install --frozen-lockfile
```

그다음 `AGENTS.md`, [`docs/process/working-context.md`](docs/process/working-context.md)와 작업 대상 문서를 읽는다. 기기를 바꾸기 전에는 `pnpm check`와 diff 검토를 마치고 commit·push를 완료한다.
