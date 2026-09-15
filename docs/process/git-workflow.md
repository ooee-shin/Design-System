# 안전한 Git 작업 방법

`2026-09-14`에 개발자와 함께 정한 branch 방식이다. 작업하는 사람이 둘이 되면서 각자 자기 작업 branch를 쓰고, 합쳐진 결과는 `dev`에서 한 번 검증한 뒤 `main`으로 올린다.

## 세 층

| Branch | 역할 |
| --- | --- |
| `main` | 언제든 설치·검사·빌드가 성공해야 하는 공식 원본. `dev`를 거쳐서만 들어온다 |
| `dev` | 통합 branch. 두 사람의 작업이 여기서 처음 만난다 |
| `feature/*` | 각자의 작업 branch. 목적 하나가 끝나면 합치고 지운다 |

```text
feature/*
  ↓ pull request
dev
  ↓ 통합 검증
  ↓ pull request
main
```

## 누가 어느 작업을 하는가

| 담당 | 작업 | 예시 branch |
| --- | --- | --- |
| 신주희 | Component와 Variant, Token과 UI 개선, Story 작성 | `feature/component-button` |
| 유진식 | Figma MCP, Storybook MCP, Agent Rules, `AGENTS.md`, Skill과 Plugin | `feature/figma-mcp-agent` |

같은 파일을 둘이 동시에 고치지 않도록 담당을 나눈 것이다. 상대의 영역을 고쳐야 하면 먼저 알린다.

## 작업을 시작할 때

```bash
git switch dev
git pull --ff-only
git switch -c feature/작업이름
```

`main`이 아니라 `dev`에서 뻗는다. 접두어는 기능 추가에 `feature/`, 오류 수정에 `fix/`, 문서 수정에 `docs/`를 사용한다.

## 작업 중 확인

```bash
git status -sb
pnpm check
```

- 사용자 결정이 필요한 `Provisional` 항목을 임의로 확정하지 않는다.
- secret, 계정 정보와 기기별 절대경로를 commit하지 않는다.
- 다른 기기에서 같은 branch를 동시에 수정하지 않는다.
- 개발 서버를 띄워 둔 채 branch를 오가면 방금 만든 내용이 실행 중인 화면에서 사라진다. 무엇을 보고 있는지 헷갈리면 서버를 껐다 켠다.

## dev로 올릴 때

```bash
git push -u origin feature/작업이름
gh pr create
```

저장소의 기본 branch가 `dev`이므로 `--base`를 적지 않아도 `dev`로 향한다. `main`으로 올리는 pull request만 `--base main`을 명시한다.

push하기 전에 로컬에서 `pnpm check`를 통과시킨다. pull request에서 자동 검사 `Quality / Lint, test, and build`가 돌며, 성공한 뒤 합치고 branch를 지운다.

**Pull request 제목은 접두어만 영문으로 두고 설명을 한글로 쓴다.** GitHub의 Pull requests 목록은 제목 한 줄만 보여 주므로, 무엇을 한 작업인지 목록에서 바로 읽히게 하는 자리다. 영문 설명을 뒤에 병기하지 않는다. 같은 내용을 두 언어로 적으면 제목이 길어져 목록에서 잘린다.

```
feat(badge)!: 색을 프리미티브 단계 규칙으로 정리하고 크기·모양·가이드라인 정비
```

`type(scope):` 접두어와 소비자 코드가 깨지는 변경의 `!` 표시는 커밋 제목과 같은 형식을 유지한다. 커밋 메시지는 영문 제목과 영문 본문으로 쓴다. 커밋 목록은 개발자가 읽는 자리이고 Pull request 목록은 작업 단위를 훑는 자리라서 언어를 다르게 둔다.

## dev에서 main으로 올릴 때

`dev`에 모인 작업을 통합 검증한 뒤 `main`으로 pull request를 만든다. 검증 항목은 다음 다섯이다.

1. Storybook이 정상으로 뜨는가
2. 컴포넌트가 서로 충돌하지 않는가
3. Figma MCP 조회가 정상인가
4. Storybook MCP 조회가 정상인가
5. Skill과 Agent가 동작하는가

**다섯 중 넷은 아직 검증할 대상이 저장소에 없다.** 지금 저장소에는 Storybook도 MCP 연동도 Skill도 없으며, 전부 유진식의 `feature/*`가 들어온 뒤에 성립한다. 그때까지 `dev → main`에서 실제로 도는 것은 `pnpm check` 하나다. 대상이 생기는 순서대로 이 목록을 채워 간다.

## 자동 검사가 도는 자리

`Quality` workflow는 모든 pull request와 `main`·`dev` push에서 돈다. `feature/*`에 push만 하는 동안에는 돌지 않으므로, 올리기 전에 로컬에서 `pnpm check`를 통과시킨다.

`main` 보호 설정은 비공개 저장소의 무료 플랜에서 열리지 않아 지금 켤 수 없다. GitHub API가 403과 `Upgrade to GitHub Pro or make this repository public`을 돌려준다. 규칙으로 강제되지 않으므로 위 순서를 사람이 지킨다. 기본 branch를 `dev`로 둔 것도 같은 이유다. 막을 수 없다면 실수하기 어려운 쪽을 기본값으로 만든다.

## 다른 기기로 이동할 때

현재 기기에서 commit과 push를 끝낸다. 다음 기기에서는 작업하던 branch를 최신화한 뒤 이어서 작업한다. 대화 내용이나 로컬 미커밋 파일은 다른 기기에 자동으로 전달되지 않는다.

## 긴급한 경우에도 지킬 원칙

급하더라도 `pnpm check`와 자동 검사를 건너뛰지 않는다. 검사가 실패한 상태로 `main`이나 `dev`를 두지 않으며, 고치는 것보다 되돌리는 것이 빠르면 먼저 되돌린다. GitHub 장애나 인증 문제로 push하지 못했다면 해당 변경은 다른 기기에 저장된 것으로 간주하지 않는다.
