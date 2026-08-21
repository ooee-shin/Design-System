# 안전한 Git 작업 방법

이 프로젝트에서 `main`은 언제든 설치·검사·빌드가 성공해야 하는 공식 원본이다. 기능 개발과 수정은 별도 branch에서 진행하고 GitHub 자동 검사를 통과한 뒤 `main`에 합친다.

## 작업을 시작할 때

```bash
git switch main
git pull --ff-only
git switch -c feature/작업이름
```

`feature/작업이름`은 현재 작업만 담는 임시 작업 공간이다. 오류 수정은 `fix/작업이름`, 문서만 수정할 때는 `docs/작업이름`을 사용할 수 있다.

## 작업 중 확인

```bash
git status -sb
pnpm check
```

- 사용자 결정이 필요한 Provisional 항목을 임의로 Stable로 확정하지 않는다.
- secret, 계정 정보와 기기별 절대경로를 commit하지 않는다.
- 다른 기기에서 같은 branch를 동시에 수정하지 않는다.

## 작업을 저장할 때

```bash
git add <이번 작업 파일>
git commit -m "변경 내용을 설명하는 메시지"
git push -u origin <현재-branch>
```

GitHub에서 pull request를 만들고 자동 검사 `Quality / Lint, test, and build`가 성공한 뒤 `main`에 합친다. 실패하면 합치지 않고 원인을 먼저 고친다.

## 다른 기기로 이동할 때

현재 기기에서 commit과 push를 끝낸다. 다음 기기에서는 `main`을 최신화한 뒤 필요한 branch를 받는다. 대화 내용이나 로컬 미커밋 파일은 다른 기기에 자동으로 전달되지 않는다.

## 긴급한 경우에도 지킬 원칙

`main`에 직접 push하지 않는다. 작은 수정이라도 별도 branch와 자동 검사를 거친다. GitHub 장애나 인증 문제로 push하지 못했다면 해당 변경은 다른 기기에 저장된 것으로 간주하지 않는다.
