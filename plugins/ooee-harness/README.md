# ooee-harness

ooee-ui 디자인 시스템으로 화면 코드를 만들고 검수하는 Claude Code Plugin이다. 명령 둘을 싣는다.

| 명령 | 하는 일 |
| --- | --- |
| `/ooee-harness:generate-code` | 요구사항 한 문단을 화면 코드와 테스트로 만들고 「pull request 준비 완료」에서 멈춘다. commit·push·pull request는 만들지 않는다 |
| `/ooee-harness:review-design` | 화면 코드를 디자인 시스템 문서에 대조해 위반 목록과 건수를 낸다. 고치지 않는다 |

## 설치

```text
/plugin marketplace add <이 저장소 또는 사본의 경로>
/plugin install ooee-harness@ooee
```

비공개 저장소는 기기에 이미 있는 git 자격 증명을 그대로 쓴다. 개발 중에는 설치 대신 `claude --plugin-dir ./plugins/ooee-harness`로 띄우고, 고친 뒤 `/reload-plugins`로 다시 읽는다.

## 설정값 셋

설치한 저장소의 모양에 맞춰 셋을 채운다. Skill 본문이 이 값으로 경로와 명령을 만든다.

| 이름 | 뜻 | 예 |
| --- | --- | --- |
| `screens_dir` | 만든 화면을 `<screens_dir>/<key>/page.tsx`로 둘 자리 | `apps/sandbox/src/app` |
| `docs_root` | `README.md`와 `components/`를 가진 디자인 시스템 문서 자리 | `docs/system` |
| `check_command` | 화면을 만든 뒤 돌릴 검사 명령. 세미콜론으로 여러 개 | `pnpm --filter @ooee/sandbox build; pnpm --filter @ooee/sandbox test; pnpm check` |

## 있어야 하는 것

- **디자인 시스템 문서.** `docs_root`에 `README.md`(「Component」 표), `quality.md`, `tokens.md`, `interaction.md`, `vocabulary.md`, `foundations/icon.md`, `components/<이름>.md`가 있어야 한다. 명령이 이 문서를 원본으로 읽는다.
- **`@ooee/ui`.** 화면 코드가 여기서만 컴포넌트를 가져온다.
- **`typescript`.** 화면 규칙 검사(`lib/check-screens.mjs`)가 설치한 저장소의 `typescript`로 화면 코드를 읽는다. 별도 설치는 필요 없고, 그 저장소에 이미 있으면 된다.
- **Node 22 이상.**
- **화면 앱의 빌드 산출물이 `.gitignore` 에 있어야 한다.** `/ooee-harness:generate-code` 는 보고에 `git status` 를 그대로 붙이고 「세 파일만 바뀌었는지」로 스스로를 검사한다. `.next/` 같은 산출물이 추적되면 그 확인이 언제나 실패한다.

## 권한

**Plugin은 권한 규칙을 싣지 못한다.** 설치한 저장소의 `.claude/settings.json`에 아래를 직접 붙여 넣는다. 되돌리거나 지우는 명령에 확인을 물리고, `main` 직접 push를 막는다. 경로는 `screens_dir`에 맞게 고친다.

```json
{
  "permissions": {
    "ask": [
      "Bash(git stash)",
      "Bash(git stash *)",
      "Bash(git reset --hard)",
      "Bash(git reset --hard *)",
      "Bash(git clean *)",
      "Bash(git checkout .)",
      "Bash(git checkout -- *)",
      "Bash(rm -r *)",
      "Bash(rm -rf *)",
      "Edit(/apps/sandbox/package.json)",
      "Edit(/apps/sandbox/src/test-setup.ts)",
      "Edit(/apps/sandbox/src/app/layout.tsx)",
      "Edit(/apps/sandbox/src/app/page.tsx)",
      "Edit(/apps/sandbox/src/app/globals.css)"
    ],
    "allow": ["Bash(node * /lib/check-screens.mjs *)"],
    "deny": ["Bash(git push origin main)", "Bash(git push origin main *)", "Bash(git push * origin main)", "Bash(git push *:main)"]
  }
}
```

## 안에 무엇이 있나

| 자리 | 내용 |
| --- | --- |
| `skills/generate-code/SKILL.md` | ① 디자인 시스템 검색 → ⑧ pull request 준비까지의 절차 |
| `skills/review-design/SKILL.md` | 검사 항목 14개와 「판단이 필요한 것」 |
| `lib/screen-rules.mjs` | 검사 항목 가운데 소스만으로 가를 수 있는 것의 판정 |
| `lib/check-screens.mjs` | 화면 디렉터리를 훑어 위반을 내는 명령 |
| `lib/screen-rules.test.mjs` | 판정 시험. 저장소 구조에 기대지 않는다 |

만든 배경과 결정은 이 저장소의 `docs/process/ai-environment.md`에 있다. 전달본에는 그 문서가 가지 않는다.
