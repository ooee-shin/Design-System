# Working context

새 작업이나 새로운 협업 환경에서 빠르게 현재 상태를 복구하기 위한 요약이다. 시스템 정의는 `docs/system/`, 제작 절차와 근거는 `docs/process/`, 작업 운영 규칙은 루트 `AGENTS.md`를 확인한다.

이 파일은 현재 구현과 다음 작업처럼 변하는 정보만 관리한다. 설치 방법과 고정 규칙은 README/AGENTS에 두고 중복하지 않는다. 다른 기기에서 보이는 실제 상태는 마지막으로 push된 commit까지이므로, 아래 내용과 코드가 함께 commit되어 있는지 `git status -sb`와 `git log -1`로 확인한다.

Git·환경은 루트 `README.md` 「브랜치」·「현재 환경」, 규칙은 `AGENTS.md`, 정본 관계(`ooee-shin/ooee-ui` 이관)는 `README.md` 머리말과 [ai-environment.md](ai-environment.md) 「아직 정하지 않은 것」이 갖는다.

## 현재 구현

- 공용 자산 소유 구조
  - 제품 화면 작업장(블루키 리뉴얼): `2026-09-22` 에 Studio 의 `/screens` 에서 sandbox 의 `/renewal` 로 옮겼다(`apps/sandbox/src/app/(renewal)/renewal/`). 관리자·STO·SV 세 루트를 두고 각 루트는 만들 화면의 목록으로 열린다. 규칙은 `apps/sandbox/src/components/renewal/README.md` 가 갖는다. sandbox 첫 화면의 「블루키 리뉴얼」 탭에서 연다
  - `apps/studio`의 `/llms.txt`: 저장소 루트 `llms.txt` 원본을 그대로 낸다. 빌드 끝에 `scripts/docs/mirror-llms-links.mjs`가 그 링크와 실은 문서의 링크를 따라 닿는 시스템 문서(`docs/system/` 아래와 `packages/ui/src/index.ts`, 허용 목록은 `scripts/docs/llms-links.mjs`의 `PUBLISHABLE`)만 `out/`의 같은 경로에 싣는다. 실리는 파일은 git이 추적하는 보통 파일이어야 한다. `out/llms.txt`는 웹판으로 바꾼다 — `localhost:3000`을 배포 주소로, 허용 목록 밖을 가리키는 링크는 「저장소 안에서만」 글자로 풀고 머리에 범위를 한 줄 적는다. 두 사이트 모두 공개로 두기로 했다(`2026-09-22`, [ai-environment.md](ai-environment.md) 「아직 정하지 않은 것」). 뷰어는 `/llms-txt`이고 상단 메뉴도 그 주소를 가리킨다

- Studio navigation
  - 현재 언어 범위는 국문·영문이며 일문은 콘텐츠 검수 범위를 확장할 때 공통 설정에 추가

- `/components/field`
  - Playground와 Input slot 절의 콘텐츠는 `studio.md`의 「Anatomy와 구조 검수용 Playground는 요소 명칭을 쓴다」에 따라 `Label`·`Placeholder`·`Helper text`·`Option 1~3`을 씀. 제품 맥락의 실제 문구는 Examples와 Usage가 담당하는데 Field에는 아직 그 절이 없어서, 국문·영문 전환 검수는 Examples를 만들 때 함께 다룸

- `/components/combobox`
  - Properties · Selection에서 왼쪽 1~9호선과 오른쪽 실제 역 Checkbox 목록으로 구성한 서울 지하철 2-depth 다중 선택 예시를 검수 중이며 공용 API는 아직 정의하지 않음

- `/components/checkbox`
  - Playground에서는 `Label`에 실제로 종속되는 Field 속성만 영역 border가 아닌, 위아래 끝이 둥근 Studio 공통 2px 수직선 그룹으로 표시. Square·Rounded에서만 지원되는 Indeterminate·Disabled는 Ghost 선택 시 조건부로 숨김([open-questions.md](open-questions.md) 「컴포넌트」 — `studio.md` 의 「비활성으로 표시」 규칙과 다르다)
  - Checkbox Studio 상세 화면은 현재 범위 검수를 완료. Layout·Flipped·Description은 별도 Property 카드를 추가하지 않고 Playground·Anatomy·Property map에서 확인

## 확정된 이관 전제

- 이 저장소의 목적은 개인 자산화가 아니라 블루키 제품에서 사용할 UI 시스템의 1차 컴포넌트 완성이다. 통합 방식(블루키 코드 직접 삽입 vs 별도 패키지 연동)은 개발 검토 후 결정하며 1차 작업에 영향을 주지 않는다.

## 일정과 분담

1차 컴포넌트는 기획자가 이 저장소에서 완성하고, 이후 개발자가 블루키 적용을 맡는다. 기획자는 그동안 2차 화면 개선을 병행한다. 전체 단계와 검증 계획은 [roadmap.md](roadmap.md)에 있다.

| 날짜 (2026) | 내용 | 담당 |
| --- | --- | --- |
| 9/3 | 기존 환경 공유 | 기획자 |
| ~9/4 | 기존 리뷰, 배포 환경 세팅. GitHub Pages 호스팅은 성립하지 않았고 호스팅은 [ai-environment.md](ai-environment.md)의 스파이크 R4가 정한다 | 개발자 |
| ~9/11 | shadcn + Panda CSS 동시 사용 시 번들 용량 확인 | 개발자 |
| ~9/14 | 1차 컴포넌트 마무리 및 공유 | 기획자 |
| ~9/14 | 블루키 이관 테스트 | 공통 |
| 9/14~ | AI 개발 환경 트랙. 순서와 일정은 [ai-environment.md](ai-environment.md)가 소유한다 | 개발자 |
| 9/14~ | 화면 개선 작업 (약 1주) | 기획자 |
| 9/20~23 | 4·5단계 에이전트 룰 테스트와 A/B 비교 검증 | 공통 |
| 9/28~30 | 작업 마무리 | 공통 |

통합 방식 검토(블루키 코드 직접 삽입 vs 별도 패키지 분리)는 개발자가 맡으며 결정 시점은 정해져 있지 않다. 1차 작업에 영향을 주지 않는다.

## 바로 다음 작업

2026-09-14까지 1차 컴포넌트를 마무리한다.

### 진행 상황

**이 절은 각 문서가 소유한 결정을 다시 적지 않는다.** 컴포넌트의 공개 API와 시각·접근성 결정은 `docs/system/components/*.md`가, 토큰과 공통 규칙은 `docs/system/`의 해당 문서가, 아직 정하지 못한 것은 [open-questions.md](open-questions.md)가, 검토 항목의 세부는 [component-audit.md](component-audit.md)가 갖는다. 여기에는 지금 어디까지 왔고 다음에 무엇을 하는지만 남긴다.

**새로 만든 컴포넌트 일곱.** Chip(`2026-09-08`), Badge(`2026-09-08`), NotificationBadge(`2026-09-09`), Button(`2026-09-09`), ToggleButton(`2026-09-10`), AppHeader(`2026-09-11`), BottomNavigation(`2026-09-14`)이다. 구현·Studio 화면·명세를 함께 두었다. Badge에 남아 있던 미정 셋은 `2026-09-11`에 정리해 미정이 없다. AppHeader는 `2026-09-11`에 `main`에 합쳤고 BottomNavigation은 `2026-09-14`에 `dev`에 합쳤다.

**관리자 웹 화면 하나와 초안 컴포넌트 넷.** `2026-09-15`에 `/screens/admin/layout`에 환경설정의 테마설정 화면을 세웠다. 좌측 메뉴의 스타일 셋(다크·브랜드·라이트)과 메인 컬러, 메뉴 아이콘을 고르고 저장하면 함께 반영된다. 그 과정에서 Admin Header·Side Navigation·Page Header·Tabs를 뽑아 `candidates/`에 두고 Studio의 「초안」에 올렸으며, 넷을 감싸는 `AdminLayout`도 함께 두어 다음 관리자 화면이 본문만 쓰면 되게 했다. 좌측 내비게이션이 쓰던 shadcn의 `--sidebar-*`는 `--nav-*`로 옮겼다. 넷 다 명세와 상세 화면이 없으며 남은 것은 [open-questions.md](open-questions.md)에 있다.

**하나씩 검토가 끝난 컴포넌트 아홉.** Checkbox·Input·Input Button·Number Input·Radio·Select·Select Box·Switch·Textarea다. 그 과정에서 다섯 개의 기본값과 Property가 바뀌었고 각 컴포넌트 문서에 반영했다. 무엇을 고쳤는지는 [component-audit.md](component-audit.md)의 「하나씩 검토 진행 상황」에 있다.

`2026-09-04`에 13개 컴포넌트의 명세·구현·Studio 화면을 3중 대조해 109건을 찾았고 폼 요소 10개의 84건을 처리했다. 후순위인 Chip 7건·Badge 10건·Message Bubble 8건 중 앞의 둘은 새로 만들면서 함께 해소했다.

**후순위는 둘이다.** Message Bubble 8건 가운데 명세 쪽 넷(1·2·3·8)은 `2026-09-28`에 명세를 다시 쓰며 처리했고 Studio 화면 쪽 넷(4~7)이 남았다. Combobox 5건은 지시가 있을 때 시작한다.

### 남은 작업

1. **Combobox의 미선택 체크박스 2개.** Anatomy 예시에서 두 Option이 모두 미선택 체크박스로 보인다. 하나는 공용 `CheckboxIndicator`이고 다른 하나는 도식으로 그린 사각형이라 시각이 거의 같다. 선택된 상태를 하나 두어 무엇을 보여 주는 예시인지 드러내야 한다. 좌표가 아니라 예시 내용의 문제다.
2. **Anatomy 안 흰색 내부 Container 5곳.** `studio.md`가 정한 규칙과 어느 다섯 곳이 다른지 화면에서 확인한다.
3. **Structure map이 없는 화면 여섯.** Anatomy가 있는 열한 화면 중 여섯 곳에 없다. 한번에 몰아서 할 작업으로 [component-audit.md](component-audit.md)에 있다.
4. **Message Bubble 말줄임 기능.** `maxLines` 3~10 범위, 넘칠 때만 더보기·접기 노출, 라벨은 prop으로 받아 언어 전환에 대응, `aria-expanded`와 자동 테스트를 함께 추가한 뒤 Studio 화면과 명세를 갱신한다. 없던 prop을 더하는 non-breaking 변경이라 이관 이후에 해도 기존 코드가 깨지지 않는다.
5. **옛 Badge를 쓰던 자리.** Studio workbench 세 파일에 하드코딩해 두었고, 새 Badge의 크기 체계가 24px 하나뿐이라 아직 교체하지 않았다. `packages/patterns`에 있던 세 자리는 `2026-09-14`에 그 패키지를 걷어내며 함께 사라졌다. 어느 자리를 새 Badge로 되돌릴지는 사용자가 화면에서 직접 확인한다.
6. **Chip의 Filter 쓰임.** 다섯 가지가 남아 있으며 [component-audit.md](component-audit.md)의 「Chip 진행 상황」에 있다. 그중 셋은 Filter Bar를 별도 컴포넌트로 분리할 때 함께 다루는 편이 낫고, 미정 셋은 [open-questions.md](open-questions.md)에 있다. Chip의 정보 표시 쓰임을 Badge로 대체할 수 있으면 Chip에서 걷어낼지도 함께 판단한다.
7. **Chip 확정 후 Combobox 잔여 작업.** Combobox의 선택값 Container가 Chip을 렌더링하므로 Chip 디자인이 바뀌면 Container를 두 번 만들게 된다. Chip을 먼저 처리한다. 다섯 항목은 [component-audit.md](component-audit.md)의 「Combobox 잔여 작업」에 있다.
8. **언어 전환 잔여.** Switch의 `copy.ko` 고정, 하드코딩 예시 콘텐츠, 영문 고정 접근 가능한 이름, `lang` 미전환. Message Bubble 쪽이 대부분이라 후순위와 함께 다룬다.
9. **Button의 Ghost.** 세부 규칙을 정하지 않은 채 기존 여섯 자리를 유지하려고 먼저 구현했으므로 화면에서 다시 본다. 그 밖의 미정 항목은 [button.md](../system/components/button.md)의 「현재 정의하지 않은 항목」이 갖는다.
10. **Chip `xsmall` 의 글자 색이 빠지던 것은 고쳤다(`2026-09-18`).** `cn()`(tailwind-merge)이 `text-oe-label`(글자 크기 토큰)을 색 클래스와 같은 무리로 보고 앞의 색을 지우던 것이 까닭이었다. `switch.tsx` 처럼 arbitrary value 로 우회하는 대신 `packages/ui/src/utils.ts` 에서 `extendTailwindMerge` 로 `text-oe-*` 크기 토큰을 font-size 무리에 넣어 뿌리에서 막았고, `utils.test.ts` 가 고정한다. 우회가 필요한 자리는 이제 없다.
11. **Message Bubble 명세를 다시 쓰며 걷어낸 검수 항목(`2026-09-28`).** 명세의 「아직 검수할 항목」 절과 과정 문장을 여기로 옮겼다. 정해지면 [message-bubble.md](../system/components/message-bubble.md)로 돌아간다.
    - bubble tail 유무. 지금 구현에는 tail 이 없다.
    - 연속 메시지에서 metadata 와 상태 표시를 생략하거나 묶는 기준. 지금은 「같은 발신자, 분 단위까지 같은 시각」 하나다.
    - 삭제 확인 방식과 복사 완료 feedback.
    - 이미지, 링크와 긴 URL.
    - 첨부의 업로드 중, 취소, 실패. Studio 는 전송 완료 파일만 다룬다.
    - RTL 과 폭이 매우 좁은 화면.
    - 브랜드 theme 확장. `--oe-message-*` 변수 자리만 있고 값은 Studio 「채팅 테마」 예시에만 있다.
    - Anatomy 요소 이름(Avatar·Author·Bubble·Content·Sidecar·Metadata row·Action bar)을 `vocabulary.md` 에 올릴지. 명세 초안이 먼저 쓰고 있으며 기획자 확인이 필요하다.
    - `MessageComposer` 처럼 바깥 Container 가 border 와 focus 를 소유하는 조합에서 안쪽 Textarea Container 를 투명·무테두리로 두고 두 경계를 중첩하지 않는다는 규칙. Composer 가 `초안` 이라 명세가 없어 여기에 둔다.
    - 읽음 처리의 자동·수동 비교는 Studio 「Read handling」 이 갖고 `MessageBubble` API 로 승격하지 않는다. Studio 통합 예시의 날짜 구분선과 Date Picker 는 검수 control 이며 제품 기능이 아니다.
    - Studio 화면의 Anatomy·Properties·Property map 부재, 섹션 제목의 언어 처리, 통합 예시 본문의 언어 고정, `MessageFileAttachment` 의 prop 부재는 [component-audit.md](component-audit.md)의 「Message Bubble (8건)」 4~7 이다.
12. **Studio 의 Chip Playground 가 새 `ariaLabel` 규칙을 스스로 어긴다.** `chip.tsx` 에 「보이는 Label 을 담은 이름만 보탠다」 가드가 들어오면서, copy 가 `label: "Label"`·`ariaLabel: "Chip"` 인 Playground(`apps/studio/src/components/candidates/chip-workbench.tsx:52·72`)가 조건에 걸린다. `next dev` 에서 `/components/chip` 을 열면 렌더마다 콘솔 경고가 찍히고, 디자인 시스템의 정본 예시가 이번에 새로 쓴 규칙을 어기는 예시가 된다. 렌더 결과는 main 과 같아 접근성 회귀는 없고 프로덕션 빌드에도 남지 않는다. copy 의 `ariaLabel` 을 Label 을 포함하는 문구로 바꾸거나 Icon only 일 때만 넘기면 된다. (`2026-09-18` 릴리스 점검)

13. **`color.md` 가 `oe-border-tertiary` 와 `oe-border-disabled` 의 값이 같다고 적던 것은 닫았다(`2026-09-28`).** 문서를 코드 값(tertiary Light `neutral-150`·Dark `neutral-850`, disabled Light `neutral-100`·Dark `neutral-900`, `packages/tokens/src/index.ts:113~114`)에 맞춰 고쳤다.

14. **ToggleButton 의 custom tone 색이 토큰이 아니라 날 hex 다.** 즐겨찾기·찜의 색이 `toggle-button.tsx` 의 `CUSTOM_ON_CLASS` 에 `bg-[#fdf5e2]`·`text-[#dfa010]` 처럼 적혀 있다. 그래서 색을 토큰 이름으로 읽는 도구가 이 칠만 이름을 찾지 못했다. 지금은 값 그대로를 이름으로 삼은 `hex-fdf5e2` primitive 로 올려 두었고, 변수 설명에도 「아직 토큰이 아니다」라고 적었다. 이름을 붙일지, 어느 semantic token 으로 보낼지는 디자인 시스템이 정한다. (`2026-09-18`)

15. **MessageBubble 만 색을 손으로 쓴 CSS class 로 칠한다.** 다른 컴포넌트는 `bg-oe-background-secondary` 처럼 Tailwind 토큰 class 로 칠하는데, 이 컴포넌트는 `.oe-message-bubble-incoming`·`.oe-message-bubble-outgoing`(`packages/ui/src/styles.css:61~75`)이 `background-color: var(--oe-message-outgoing-background, var(--oe-background-bold-primary))` 꼴로 칠한다. `dom-extract.js` 는 **class 이름에서** 토큰 후보를 모으므로 그 class 에서는 아무것도 읽지 못하고, 카탈로그에 넣었더니 칠 25 개가 「후보 없음」으로 걸렸다(`2026-09-21`). 그래서 카탈로그에서 뺐다 — 확정 20 종 가운데 Figma 라이브러리에 없는 유일한 컴포넌트다.

    고치는 길은 `packages/ui` 가 그 색을 토큰 class 로 칠하는 것이다(`--oe-message-*` 로 갈아 끼우는 길을 남기려면 그 자리만 CSS 변수로 두고 기본값은 토큰 class 로). 다른 컴포넌트와 같아지는 길이고, 정하는 것은 디자인 시스템이다. 같은 자리에 `data-slot` 도 없어 sandbox 가 어떤 컴포넌트인지 읽지 못하므로 함께 보면 좋다.

16. **컴포넌트 카테고리화 검토.** 13개 컴포넌트 검수가 끝나면 목록을 성격별로 묶을지 판단한다. 지금은 `component-registry`가 소유하는 알파벳순이며 `docs/system/studio.md`가 그 기준과 분류를 미루는 이유를 적고 있다. 판단할 때 걸리는 것은 Select Box가 항상 펼친 선택인지 목록 선택인지, Switch를 Checkbox와 나눌지, Chip이 표시인지 입력 보조인지, Message Bubble을 폼 요소와 같은 층에 둘지다. Studio 의 메뉴 구조와 함께 정하면 두 번 바꾸지 않는다.

17. **`size-3.5` 인라인 아이콘 두 곳.** `message-bubble-workbench.tsx` 두 곳(`size-3.5`)을 아이콘 Foundation 의 `oe-icon-xsmall` 로 바꿀지 정한다. 내비게이션의 라이트·다크 토글도 같은 값을 쓴다.

`Presentation` 화면은 무엇을, 왜, 어떻게 바꿨는지 전달하는 화면이며 현재 열네 꼭지가 있다. 원본은 `apps/studio/src/components/presentation-entries.ts`이고 작성 규칙과 기록 절차는 [presentation.md](presentation.md)에 있다.

**꼭지로 세우지 않기로 한 작업이 셋 있다.** AppHeader는 전할 만한 것이 시각 세부에 그쳐 판단으로 남길 내용이 아니다. Textarea와 Number Input은 작업의 대부분이 규격이거나 이미 있는 판단을 한 번 더 적용한 것이다. 세 건 모두 사용자가 확인한 결정이므로 다시 판단하지 않는다.

### 2026-09-08 화면 검수 도구

화면을 재고 찍는 일은 `scripts/visual/inspect.mjs`가 소유하며 사용법은 AGENTS.md의 「화면 확정 검수」가 갖는다. 아래는 그 문서와 `--help`에 없는 주의사항이다.

**`--sweep`은 `--eval`을 무시한다.** 조합을 훑을 때는 `--measure`만 반영되므로, 대비처럼 임의 식으로 계산해야 하는 값은 `--click`으로 조합을 하나씩 지정해 따로 재야 한다. 훑기와 임의 식을 함께 쓸 수 있게 고칠지는 정하지 않았다.

**zsh에서 `set -- $combo`로 조합을 쪼개면 클릭이 조용히 실패한다.** zsh는 인용하지 않은 변수를 단어로 나누지 않아 `--click "Fill Warning"`이 되고, 해당하는 button이 없어도 측정은 기본 상태의 컴포넌트를 그대로 재서 그럴듯한 숫자를 낸다. 반복문으로 조합을 훑을 때는 축마다 중첩 `for`를 쓰고, 측정식이 `data-tone`처럼 지금 상태를 함께 돌려주게 해서 클릭이 먹었는지 확인한다.

```bash
pnpm visual --path /components/badge \
  --sweep Fill,Tonal,Outlined \
  --sweep Brand,Neutral,Warning,Danger,Success,Info,Custom \
  --measure "[data-slot=badge]"
```

### 2026-09-14 branch 방식을 정했다

branch 세 층, 담당 구분, 통합 검증 항목과 `main` 보호 설정의 원본은 [git-workflow.md](git-workflow.md)이며 여기에 다시 적지 않는다.

### 2026-09-14 AI 개발 환경 트랙을 시작했다

화면 요청은 Slack 폼 → 이슈 → 이 Mac 의 1분 감시 → `runner.mjs` 가 처리하고, 모델은 `/make-screens` 로 화면만 만든다(`2026-09-24` 역할 뒤집기). 흐름·결정 규칙은 [ai-environment.md](ai-environment.md) 「처리와 승인」, 스크립트와 설치(사본 신뢰 등록·`node -e` 열지 않기 포함)는 `scripts/harness/README.md` 「러너」·「launchd」·「알아 둘 것」, 까닭은 `scripts/harness/plan.mjs` 머리말이 갖는다. sandbox 는 프로젝트 탭과 여러 폭으로 나뉜다([ai-environment.md](ai-environment.md) 「요청 폼」). Figma 는 쓰지 않는다([ai-environment.md](ai-environment.md) 「2026-09-22 Figma 를 뺐다」).

**처리 시간 실측**(`2026-09-24`): #60 이 설정이 깨진 상태에서 143분, 권한을 고친 뒤 #62 가 33분, 역할을 뒤집은 뒤 #85(화면 3장)가 11분 42초·#101(제자리 수정)이 11분 31초. 기록은 `~/.ooee-harness/runs/` 에 있고, 줄어든 까닭은 `plugins/ooee-harness/README.md` 「모델과 effort」와 `scripts/harness/plan.mjs` 머리말에 있다.

### 2026-09-09 Badge 색을 단계 규칙으로 바꿨다

Badge의 `compoundVariants` 21개를 걷어내고, tone별 팔레트와 variant별 단계의 곱으로 색을 정하게 바꿨다. 결정과 단계표, 대비 수치는 [badge.md](../system/components/badge.md)의 「색」이 소유한다. 여기서는 다른 컴포넌트에도 걸리는 사항만 남긴다.

- WCAG 2.x 와 APCA 를 함께 재고 글자 극성을 배경 밝기로 정하는 기준은 [quality.md](../system/quality.md) 「접근성」이, Badge 의 수치는 [badge.md](../system/components/badge.md) 「색」이 갖는다. APCA 값은 `scripts/visual/inspect.mjs --eval`로 캔버스에서 픽셀을 읽어 계산한다.
- 단계를 고를 때는 눈대중으로 정하지 않고 위 「화면 검수 도구」로 대비를 재서 정한다. 색 계열마다 같은 단계 숫자가 같은 밝기로 보이지 않으므로, 수치와 화면을 함께 본다.

### 화면에서 확인이 밀린 항목

- Checkbox의 Square 모양과 Radio·Checkbox의 컨트롤 그룹 순서.
- checkbox.md 64행의 Trailing element 예시가 「Red tonal XSmall `NEW` Badge」로 적혀 있으나 `XSmall`은 Badge에 없는 이름이고, checkbox-workbench는 Badge 컴포넌트가 아니라 16px 알약을 직접 만들어 쓴다. Checkbox 확정 시점에 함께 정리한다.
Anatomy 연결선 좌표와 범위 표시선 공용화는 `2026-09-08`에 끝냈다. Input Button의 Prefix·Suffix 마커, 공용 부품 통합 뒤의 좌표와 여백, Combobox 범위 표시선의 처리 방향이 여기에 있었다.

## 이전부터 이어지는 작업

1. Select Box의 Playground·Anatomy 한정은 최초 검수 단계에만 적용하던 것이며 지금은 다른 컴포넌트와 같은 범위로 다룬다. 명세의 「현재 검수 범위」 절은 걷어냈다.
2. 폼 요소 10개의 본문 순서·우측 목차·Property 구조는 3중 대조 검수에서 확인하고 맞췄다. 후순위인 Message Bubble 은 `2026-09-28`에 명세가 Anatomy·Properties 를 갖췄고, Studio 화면에는 Anatomy·Properties·Property map 이 아직 없다.
3. Anatomy 시각 검수는 번호선과 Container 평행선까지 `2026-09-08`에 마쳤다. 열두 화면 전부가 대상을 참조해 자리를 잡으므로 좌표를 다시 확인할 일은 없다. 남은 것은 Surface 안쪽 Container의 배경과 border 규칙이며 위 「남은 작업」 2번이 그것이다.
4. Checkbox, Radio, Switch와 Combobox의 Neutral `Structure map`을 공용 표시 컴포넌트로 검수한다. 요소명은 같은 Neutral foreground, 연결선과 Optional 표시는 더 옅은 Neutral 위계를 사용한다. Combobox처럼 구조가 복잡한 컴포넌트는 시각 Anatomy를 Trigger와 Content로 분리하고 구조도에서 포함 관계를 연결한다. 다른 컴포넌트로 확대하기 전에는 각 컴포넌트의 실제 포함 관계를 먼저 확인한다.
5. Studio 에 Anatomy 가 없는 것은 MessageBubble 이다. 명세 초안이 Avatar·Author·Bubble·Content·Sidecar·Metadata row·Action bar 일곱으로 적어 두었으므로 기획자가 그 이름과 범위를 확인한 뒤 `vocabulary.md` 와 Studio 화면에 함께 추가한다. Badge는 `2026-09-08`에 Container·Icon·Label 셋으로 Anatomy와 Structure map을 넣었다. Field는 `2026-09-09`에 정의했으며 Anatomy와 Structure map을 함께 넣었다.
6. 1차 구조·Property 검수가 끝나면 Guidelines를 별도 2차 순회로 정리한다. 현재 컴포넌트별 Usage 정책을 임의로 채우지 않고 확인된 규칙과 실제 오용 사례만 추가한다.
7. 공용 상세 shell과 registry는 route·본문 순서·우측 목차·연관 컴포넌트 회귀 테스트를 보완한다. 각 공용 UI는 Pointer, Label 클릭, Keyboard, Disabled, Size와 주요 상태 조합 중 현재 자동 테스트가 없는 항목을 컴포넌트별로 추가한다.
8. 문서 공통화 뒤 `docs/system/foundations/color.md`의 열린 질문, 여러 Brand seed의 HCT palette 품질과 실제 화면 재검증을 이어간다. MessageBubble은 다른 채팅 화면에서 API를 재검증한다.
9. Presentation 꼭지와 컴포넌트 상세를 잇는 역방향 링크를 만든다. 지금은 꼭지에서 컴포넌트로 가는 한 방향만 있어서, 컴포넌트 상세에서 「왜 이렇게 되어 있지」를 물었을 때 갈 곳이 없다. 꼭지 데이터에 관련 컴포넌트 key를 두고 registry와 연결해 `Similar`·`Works with` 옆에 표시한다. Presentation 화면 자체의 검색 기능은 넣지 않는다. 목차가 한 화면에 들어가지 않을 만큼, 대략 꼭지가 스무 개를 넘을 때 다시 검토한다.

현재 `/foundations/color`의 OE Semantic catalog와 코드의 mapping은 검토용 Provisional 구현이다. 화면에 표시된 값을 사용자 결정 없이 확정하거나 다른 컴포넌트에 일괄 적용하지 않는다.

## 새 작업에서 사용할 시작 요청 예시

```text
이 저장소의 AGENTS.md, docs/system/README.md, docs/process/working-context.md와 작업 관련 Foundation 문서를 먼저 읽어라. `Provisional`로 표시된 결정을 확정된 것으로 가정하지 말고, 문서화된 ooee 제작 흐름에 따라 작업하라.
```
