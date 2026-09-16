# Figma로 옮기기

`apps/sandbox`에 만든 화면을 Figma 프레임으로 옮기는 도구다. 색은 Figma 변수에, 모서리·높이·아이콘 크기는 크기 변수에, 글자는 텍스트 스타일에 묶고 아이콘은 Remix SVG로 넣어서 Selection colors와 Inspect에 `oe-*` 이름이 보이게 한다. `/design-page` Skill(`.claude/skills/design-page/SKILL.md`)이 이 도구를 부른다. 전달 시 `docs/process/`와 함께 제거한다.

Figma 쪽 호출은 Figma remote MCP의 `use_figma`로 한다. `prepare.mjs`가 로컬에서 모든 계산을 끝내고 `use_figma`에 그대로 넘길 단계 파일을 만든다.

## 파일

| 파일 | 하는 일 |
| --- | --- |
| `prepare.mjs` | 아래 전부를 묶어 `.figma-work/<key>/`에 단계 파일과 `manifest.json`을 만든다. Figma는 부르지 않는다 |
| `token-export.ts` | `packages/tokens`의 `oe` 토큰 Light·Dark 값, 브랜드 단계, 크기 값을 JSON으로 뽑는다 |
| `dom-extract.js` | 브라우저에 뜬 화면을 트리로 읽는다. 색마다 class에서 찾은 후보와 계산된 색을 함께 남긴다 |
| `setup-variables.js` | `oe color`(Light·Dark)·`oe size` 변수를 맞춘다. 있는 변수는 값만 고쳐 이미 그린 프레임의 연결을 유지한다 |
| `setup-text-styles.js` | `oe/text-*/<weight>` 텍스트 스타일을 맞춘다. 글꼴 대체가 이 파일 한 곳에 있다 |
| `builder.js` | 조각으로 auto-layout 프레임을 만든다. primitive 변수는 `oe primitive` 컬렉션에 필요할 때 만들고 값을 맞춘다 |
| `audit.js` | 읽기만 한다. 빠진 프레임, 변수에 묶이지 않은 칠, 스타일 없는 글자, 투명도를 더한 칠을 센다 |
| `reread.js` | 되읽기(④)에서 프레임을 줄(`rows`)로 읽는다. 파일을 바꾸지 않는다. `use_figma` 응답이 20,000자에서 잘려 자리를 아끼려고 객체 대신 줄로 돌려준다 |
| `reread.mjs` | `step`은 위 단계 파일을 만들고(`--parts`로 나눌 수 있다), `diff`는 읽어 온 JSON을 `spec-<상태>.json`과 견주어 무엇이 바뀌었는지 낸다 |
| `reread.test.mjs` | 차이 판정 시험. `pnpm test`에 들어 있어 Figma 없이 돈다 |

## 사람이 직접 돌릴 때

```bash
pnpm --filter @ooee/sandbox dev   # http://localhost:3001
node scripts/figma/prepare.mjs --key voc --name "고객의 소리" \
  --state "목록" \
  --state '상세 열림=[...document.querySelectorAll("tbody tr")].find((r) => r.textContent.includes("주문이 자꾸 밀려요")).click()'
```

- `--key`는 `apps/sandbox/src/screens.ts`의 `key`, `--name`은 같은 항목의 `name`이다.
- `--state`는 `이름=브라우저 JS`이고 여러 번 줄 수 있다. 이름은 첫 `=`까지이며 상태마다 달라야 한다. 하나라도 주면 첫 `--state`에 기본 화면 이름만 둔다. 주지 않으면 「기본」 하나다.
- 모바일 화면은 `--width 390 --height 844`를 준다. 헤드리스 Chrome 창은 500px보다 좁아지지 않아서 창은 500으로 두고 문서 폭을 줄여 읽는다. 프레임 이름의 기기 표기는 폭 480 이하면 `Mobile`이다.
- `--version`은 같은 날 같은 화면의 새 파일 이름에 ` · v2`처럼 버전을 붙인다. 이 기기에서 만든 이름은 `.figma-work/files.json`에 쌓여 같은 이름을 자동으로 피한다.
- 돌릴 때마다 `.figma-work/<key>/`를 지우고 새로 쓴다. 이 디렉터리는 `.gitignore`에 있다.

`manifest.json`의 `steps`를 순서대로 `use_figma`에 넘긴다. 결과에 `error`가 있으면 멈춘다. build 단계는 화면 이름과 같은 페이지를 쓰고(없으면 만든다), 그 페이지에서 이번 프레임과 이름이 정확히 같은 프레임만 지우고 다시 그린다. 마지막 audit 단계에서 `missingFrames`·`unboundPaints`·`textsWithoutStyle`이 모두 비고 모든 프레임의 `rootWithoutFill`이 `false`면 완료다. 브라우저 스크린샷은 `browserScreenshots`에 있다.

## 어떻게 틀리지 않게 하는가

- **색 이름.** `dom-extract.js`는 요소의 class에서 `oe-*` 토큰과 primitive 단계를 후보로 모은다. `data-[checked]:`처럼 상태가 붙은 class도 후보이고, 정적인 화면에 걸리지 않는 `hover:`·`focus:`·`active:`·`dark:` 변형은 뺀다. `prepare.mjs`가 후보의 Light 값과 브라우저가 실제로 칠한 색을 대조해 고른다. 맞는 후보가 없으면 manifest의 `unresolvedColors`에 남긴다. `/design-page`는 그 경우 멈추고 옮기지 않는다.
- **팝업.** Select·Combobox 목록처럼 Portal로 `<body>` 끝에 붙은 요소도 루트 위에 absolute로 겹쳐 옮긴다.
- **옮겨 적기.** 모델이 단계 파일을 `use_figma`에 옮기다 숫자 하나를 바꿔도 문법은 그대로다. 단계마다 조각 내용의 해시를 Figma 쪽에서 다시 재서 다르면 아무것도 그리지 않고 `error`를 낸다.
- **다른 화면.** 조각 경로는 `<key>:s<상태 순서>`로 시작하고 부모는 같은 이름의 루트 프레임 안에서만 찾는다. 변수는 `oe color`·`oe primitive`·`oe size` 컬렉션 안에서만 찾아 다른 라이브러리의 같은 이름 변수에 묶지 않는다.
- **위치.** auto-layout 부모 안에서 DOM과 2px 넘게 어긋난 자식만 absolute로 빼고, 한 자식을 빼면 형제를 다시 잰다.

## Figma 에서 무엇이 Frame 이 되나

**배치하는 곳만 Frame 이다**(`2026-09-16` 유진식 결정). DOM 의 감싸개를 그대로 옮기면 모든 요소가 Frame 이 되어 Figma 에서 다루기 어렵다. `prepare.mjs` 가 옮기기 전에 아래대로 접는다.

| DOM 의 모습 | Figma |
| --- | --- |
| 화면 루트 | 오토 레이아웃 Frame |
| 자식을 배치하는 상자(자식 둘 이상, 또는 여백·간격을 주는 상자) | 오토 레이아웃 Frame |
| 칠·테두리·모서리를 가진 상자 | Frame (자식이 없으면 Rectangle) |
| `data-slot` 이 붙은 컴포넌트 노드 | Frame. 되짚기의 근거라 접지 않는다 |
| 글자 하나만 감싼 상자 | 없애고 글자가 그 자리를 차지한다. 가운데 맞춤은 글자의 가로·세로 정렬로 옮긴다 |
| 아이콘 하나만 감싼 상자, 자식을 그대로 통과시키는 상자 | 없앤다 |

`manifest.json` 의 `folded` 가 이번에 접은 수를 센다. 「고객의 소리」는 Frame 124개가 69개로 줄었다.

## 컴포넌트 카탈로그

`apps/sandbox/src/app/catalog/page.tsx` 는 화면이 아니라 `@ooee/ui` 컴포넌트의 변형을 한 번에 그려 두는 자리다. 항목마다 `data-component`(컴포넌트 이름)와 `data-variant-props`(변형 이름)를 적으면, `builder.js` 가 그 프레임을 Figma **컴포넌트**로 만든다. 이름은 `Button/fill·brand·regular` 꼴이라 Figma 자산 패널에서 컴포넌트별로 묶인다.

```bash
node scripts/figma/prepare.mjs --key catalog --name "컴포넌트" --height 1600
# manifest 의 steps 를 use_figma 에 순서대로 넘긴다
```

변형을 더하려면 카탈로그 화면에 항목을 더하고 다시 돌린다. 값은 코드의 variant 정의에서 나오므로 Figma 쪽을 손으로 고치지 않는다.

## 되읽기 (④)

사람이 Figma에서 고친 것을 화면 코드로 되돌리는 흐름이다. `/design-page`의 「되읽기」 절이 이 순서를 따른다.

```bash
pnpm --filter @ooee/sandbox dev                                   # 기준을 다시 재려면 화면이 떠 있어야 한다
node scripts/figma/prepare.mjs --key voc --name "고객의 소리" …    # spec-<상태>.json 을 남긴다(Figma 는 부르지 않는다)
node scripts/figma/reread.mjs step --key voc --name "고객의 소리" --frame "고객의 소리 / 목록 · Desktop 1440" --parts 1
# 만들어진 steps/reread-0.js 를 그대로 use_figma 에 넘기고, 돌려받은 JSON 을 .figma-work/voc/figma-0.json 에 저장한다
# 응답이 잘리면 --parts 3 으로 나눠 읽고 조각을 모두 --figma 로 넘긴다
node scripts/figma/reread.mjs diff --key voc --state 0 --figma .figma-work/voc/figma-0.json
```

`diff`는 변화마다 `auto`를 매긴다. `true`는 색 토큰 교체·문구·글자 크기·아이콘처럼 코드로 그대로 되돌릴 수 있는 것이고, `false`는 크기·모서리·위치·추가·삭제·변수에 묶이지 않은 색처럼 사람이 정할 것이다. 판정 근거는 [`docs/process/figma-component-map.md`](../../docs/process/figma-component-map.md)다.

프레임에는 ②가 그릴 때 `<key>|s<상태>|<커밋>|<날짜>`를 남긴다. 그 커밋이 지금 코드와 다르면 그사이 색 규칙이 바뀌었을 수 있으므로 색 변화를 자동으로 되돌리지 않는다.

## 다시 읽을 때 남는 것

Figma를 다시 읽으면(`get_design_context`) 레이어 이름, 칠·테두리·글자에 묶인 변수 이름, 숫자로 된 크기, 자식 구성 넷만 남는다. `oe size` 변수는 묶여 있어도 이름이 아니라 px로 돌아오고, `data-variant`·`data-tone`·`data-size` 같은 DOM 속성은 애초에 옮겨지지 않는다. 그래서 되짚기는 이름과 변수와 px의 조합으로 한다. 규칙은 [`docs/process/figma-component-map.md`](../../docs/process/figma-component-map.md)에 있다.

## 알려진 제약

- **글꼴.** Figma에 Pretendard Variable이 없어 Noto Sans KR로 임시 대체하고, Noto Sans KR에 SemiBold가 없어 `semibold` 스타일은 Bold다(2026-09-15 유진식 승인). 스타일 설명에 적혀 있다. 글자 폭이 달라 좁은 자리에서 끝 글자가 조금 잘릴 수 있다. Pretendard가 Figma에 생기면 `setup-text-styles.js`가 멈추고 알린다.
- **Dark 모드.** `oe color`는 Light·Dark 모드를 갖지만 Button·Badge처럼 코드가 primitive 단계를 직접 쓰는 자리(`bg-blue-100`, `bg-[var(--brand-600)]`)는 `oe primitive` 변수에 묶여 모드를 바꿔도 뒤집히지 않는다. 코드도 그 자리를 `dark:` class로 따로 둔다.
- **투명도.** 코드가 `border-[var(--brand-500)]/30`처럼 색에 투명도를 붙인 자리는 변수에 묶은 칠의 opacity로 옮기고 `opacityOnToken`에 적는다. `figma-page-agent.md` 규칙 5와 부딪치므로 보고에 적어 확인받는다.
- **그림자.** `box-shadow`는 옮기지 않는다. oe 토큰에 그림자 색이 없다.
- **글자 크기.** `oe/text-*`에 없는 크기는 가장 가까운 스타일에 묶고 `unmappedText`에 적는다. Skill은 이 경우를 검사 실패로 본다.
- **자동 동기화가 아니다.** 변수 값은 `prepare.mjs`를 돌린 시점의 `packages/tokens`에서 옮겨 적은 것이다. 색 매핑과 brand seed는 Provisional이다.
- **Figma plugin 실행 환경.** 코드는 async 함수 본문으로 돌고 한 번에 50,000자까지다. `setPluginData` 대신 `setSharedPluginData`만 된다. 세션을 시작한 뒤 등록한 MCP 서버는 그 세션에 실리지 않는다.
- **Code Connect.** bluekey 팀이 Pro 플랜이라 쓸 수 없다. 컴포넌트는 인스턴스가 아니라 `data-slot` 이름을 가진 프레임이다.
- **폴더.** `create_new_file`은 파일이 들어간 폴더를 돌려주지 않는다. 결과물 폴더에서 사람이 확인한다.
