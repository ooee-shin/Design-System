# Figma로 옮기기

`apps/sandbox`에 만든 화면을 Figma 프레임으로 옮기는 도구다. 색은 Figma 변수에, 모서리·높이·아이콘 크기는 크기 변수에, 글자는 텍스트 스타일에 묶고 아이콘은 Remix SVG로 넣어서 Selection colors와 Inspect에 `oe-*` 이름이 보이게 한다. `/design-page` Skill(`.claude/skills/design-page/SKILL.md`)이 이 도구를 부른다. 전달 시 `docs/process/`와 함께 제거한다.

Figma 쪽 호출은 Figma remote MCP의 `use_figma`로 한다. `prepare.mjs`가 로컬에서 모든 계산을 끝내고 `use_figma`에 그대로 넘길 단계 파일을 만든다.

## 파일

| 파일 | 하는 일 |
| --- | --- |
| `prepare.mjs` | 아래 전부를 묶어 `.figma-work/<key>/`에 단계 파일과 `manifest.json`을 만든다. Figma는 부르지 않는다 |
| `sandbox-server.mjs` | 개발 서버가 **이 checkout 의** sandbox 인지 가린다(sandbox 의 `/sandbox-origin.json` 지문). 쓸 서버를 찾거나 띄울 빈 포트를 알려 주고, 띄운 서버가 준비될 때까지 기다린다. `prepare.mjs` 도 읽기 전에 같은 것으로 확인한다 |
| `sandbox-server.test.mjs` | 지문 대조·빈 포트 고르기 시험. 가짜 HTTP 서버로 돈다 |
| `token-export.ts` | `packages/tokens`의 `oe` 토큰 Light·Dark 값, 브랜드 단계, 크기 값을 JSON으로 뽑는다 |
| `dom-extract.js` | 브라우저에 뜬 화면을 트리로 읽는다. 색마다 class에서 찾은 후보와 계산된 색을 함께 남긴다. 라이브러리 규칙은 `prepare.mjs` 가 `instance-rules.mjs` 의 소스를 끼워 넣는다 |
| `instance-rules.mjs` | DOM 요소 하나가 라이브러리의 어느 변형인지(`inst`), 세트는 있지만 인스턴스로 옮기면 틀리는 자리인지(`unsup`), 라이브러리와 상관없는 native 덩이인지(`nat`) 가른다. 브라우저·`library.test.mjs`·카탈로그 시험이 같은 한 벌을 쓴다 |
| `library.json` | 게시된 라이브러리(`ooee · 컴포넌트 라이브러리`)의 **키 표**다. 세트마다 key, 변형마다 서명(글자 노드의 텍스트 스타일·보이는 아이콘). 손으로 고치지 않고 아래 「라이브러리 키 표」대로 다시 뽑는다 |
| `library.mjs` | 키 표를 읽고 쓰며, 화면 트리에서 인스턴스로 놓을 자리를 확정하고(`decideInstances`), 조각에 실을 세트 키를 고르고(`libraryKeys`), native 덩이를 모은다(`collectNotInLibrary`). 라이브러리가 화면을 다 덮지 못하면 멈출 까닭을 내고(`coverageStop`, 예외 표 `FRAME_EXCEPTIONS`), 화면이 쓰는 세트의 원본이 라이브러리보다 새로운지 가른다(`driftAffects`). `save` 로 `library.json` 을 새로 쓴다 |
| `library.test.mjs` | 종류마다 DOM → 변형 이름, 프레임으로 둘 까닭, 키 고르기, 없는 이름·맞는 변형이 없는 자리·낡은 세트에서 멈추기, 예외 표, 기본 켜짐, `notInLibrary` 시험. Figma 없이 돈다 |
| `builder.test.mjs` | `builder.js`·`audit.js` 를 그대로 가짜 Figma 문서에서 돌린다. build 가 멈춰도 페이지 최상위에 고아가 남지 않는지, audit 가 고아를 `strayNodes` 로 세는지 본다 |
| `setup-variables.js` | `oe color`(Light·Dark)·`oe size` 변수를 맞춘다. 있는 변수는 값만 고쳐 이미 그린 프레임의 연결을 유지한다 |
| `setup-text-styles.js` | `oe/text-*/<weight>` 텍스트 스타일을 맞춘다. 글꼴 대체가 이 파일 한 곳에 있다 |
| `builder.js` | 조각으로 auto-layout 프레임을 만든다. primitive 변수는 `oe primitive` 컬렉션에 필요할 때 만들고 값을 맞춘다. `inst` 자리는 라이브러리 세트를 키로 가져와(`importComponentSetByKeyAsync`) 인스턴스로 놓는다. **단계마다 실리지 않고 「builder 를 문서에 둔다」 단계로 한 번만 간다** |
| `step-payload.mjs` | 단계에 싣는 글자를 줄이는 규칙. 주석 떼기, 인스턴스 접기, loader·build 단계 틀 |
| `audit.js` | 읽기만 한다. 빠진 프레임, 변수에 묶이지 않은 칠, 스타일 없는 글자, 투명도를 더한 칠을 센다. 인스턴스는 세되(라이브러리에서 온 것 `remoteInstances`, 이 파일의 것 `localInstances`) 안으로 내려가지 않는다. 페이지 최상위에서 이번 프레임이 아닌 것도 본다 — 이 도구가 만들다 남긴 고아는 `strayNodes`(완료를 막는다), 사람이 둔 수정안·메모와 표식 없는 옛 노드는 `otherTopLevel`(알리기만 한다) |
| `reread.js` | 되읽기(④)에서 프레임을 줄(`rows`)로 읽는다. 파일을 바꾸지 않는다. `use_figma` 응답이 20,000자에서 잘려 자리를 아끼려고 객체 대신 줄로 돌려준다 |
| `reread.mjs` | `step`은 위 단계 파일을 만들고(`--parts`로 나눌 수 있다), `diff`는 읽어 온 JSON을 `spec-<상태>.json`과 견주어 무엇이 바뀌었는지 낸다 |
| `reread.test.mjs` | 차이 판정 시험. `pnpm test`에 들어 있어 Figma 없이 돈다 |
| `combine-variants.js` | build 가 만든 컴포넌트를 `ooee.build`/`set` 값으로 묶어 **Component Set** 을 만든다. 카탈로그를 라이브러리 파일에 올릴 때만 build 뒤 audit 앞에 선다 |
| `export-keys.js` | 라이브러리 파일에서 세트 키와 변형 서명을 읽는다. 파일을 바꾸지 않는다. 응답을 `library.mjs save` 가 `library.json` 으로 편다 |
| `step-payload.test.mjs` | 주석 떼기·인스턴스 접기·조각 나누기 시험. Figma 없이 돈다 |
| `token-export.test.mjs` | 토큰 뽑기 시험. `color-mix` 중간 단계가 빠지지 않는지 본다 |

## 사람이 직접 돌릴 때

```bash
node scripts/figma/sandbox-server.mjs --key voc   # 이 checkout 의 서버가 있으면 base, 없으면 띄울 포트와 명령
pnpm --filter @ooee/sandbox dev --port 3007       # 위가 알려 준 명령. 이미 떠 있으면 건너뛴다
node scripts/figma/sandbox-server.mjs --key voc --port 3007 --wait 120   # 준비될 때까지 기다린다
node scripts/figma/prepare.mjs --key voc --name "고객의 소리" --base http://localhost:3007 \
  --state "목록" \
  --state '상세 열림=[...document.querySelectorAll("tbody tr")].find((r) => r.textContent.includes("주문이 자꾸 밀려요")).click()'
```

- **서버는 이 checkout 의 것이어야 한다.** 3001 에 다른 저장소(옛 `ooee-ui`)나 다른 worktree 의 sandbox 가 떠 있으면 그 화면을 읽게 된다. 2026-09-22 에 실제로 그랬다 — voc 는 다른 저장소의 옛 화면이 200 으로 조용히 읽혔고, shop-cart 는 404 라 dev 를 띄웠지만 포트가 차 있어 뜨지 못한 채 기다리기만 했다. 그래서 sandbox 가 `/sandbox-origin.json` 으로 dev 서버가 도는 폴더의 지문을 내고, `sandbox-server.mjs`·`prepare.mjs` 가 그것을 제 checkout 의 지문과 견준다. 다르거나 없으면 prepare 는 exit 5 로 멈추고 작업 폴더도 지우지 않는다. `pnpm --filter @ooee/sandbox dev --port <n>` 처럼 포트를 뒤에 주면 package.json 의 `--port 3001` 을 덮는다.
- `--key`는 `apps/sandbox/src/screens.ts`의 `key`, `--name`은 같은 항목의 `name`이다.
- `--state`는 `이름=브라우저 JS`이고 여러 번 줄 수 있다. 이름은 첫 `=`까지이며 상태마다 달라야 한다. 하나라도 주면 첫 `--state`에 기본 화면 이름만 둔다. 주지 않으면 「기본」 하나다.
- 모바일 화면은 `--width 390 --height 844`를 준다. 헤드리스 Chrome 창은 500px보다 좁아지지 않아서 창은 500으로 두고 문서 폭을 줄여 읽는다. 프레임 이름의 기기 표기는 폭 480 이하면 `Mobile`이다.
- `--version`은 같은 날 같은 화면의 새 파일 이름에 ` · v2`처럼 버전을 붙인다. 이 기기에서 만든 이름은 `.figma-work/files.json`에 쌓여 같은 이름을 자동으로 피한다.
- 돌릴 때마다 `.figma-work/<key>/`를 **지우고** 새로 쓴다. 이 디렉터리는 `.gitignore`에 있다.
- **올리는 중에 같은 key 로 다시 돌리지 않는다.** 단계 파일이 통째로 사라져 올리던 세션이 원본을 잃는다. 실제로 그렇게 한 번 끊겼다(2026-09-18). 올리는 동안 무언가 고쳐야 하면 다 올린 뒤에 다시 준비한다.
- **두 개를 한꺼번에 돌리지 않는다.** 화면을 읽을 때 띄우는 Chrome 이 디버깅 포트 9222 를 쓰므로 서로 막혀 멈춘다. 굳이 나란히 돌려야 하면 `CDP_PORT=9301` 처럼 실행마다 다른 포트를 준다.
- **컴포넌트는 라이브러리 인스턴스로 놓는 것이 기본이다.** 옵션을 주지 않아도 켜진다. 출력의 `instances`·`unsupported`·`notInLibrary` 가 그 수이고, 목록은 manifest 에 있다(아래 「라이브러리 인스턴스」). 예전의 `--instances` 는 이제 아무 일도 하지 않는다.
- **exit 3 은 라이브러리가 화면을 다 덮지 못한다는 뜻이다.** 규칙이 만든 이름이 라이브러리에 없거나(`missingInLibrary`), 세트는 있는데 맞는 변형이 없는 자리(`unsupported`)가 있다. stderr 에 세트와 까닭이 묶여 나온다. 단계 파일은 만들어지지만 넘기지 않는다. 코드 → 카탈로그 → 라이브러리를 먼저 거친다(아래 「라이브러리 인스턴스」).
- **`--allow-frames <이슈 번호>`** 는 `unsupported` 를 프레임으로 두어도 된다는 예외다. `library.mjs` 의 `FRAME_EXCEPTIONS` 에 저장소 주인이 적은 요청과 그 화면에만 듣고, 다른 번호·화면이면 exit 1 이다. 지금은 #9(이커머스 5장) 하나다. `missingInLibrary` 는 예외여도 멈춘다.
- **exit 4 는 라이브러리가 코드보다 낡았다는 뜻이다.** 이 화면이 인스턴스로 쓰는 세트의 원본이 라이브러리를 올린 뒤 모양이 바뀌었다(아래 「라이브러리가 코드보다 낡았을 때」). 라이브러리를 다시 올리거나, 사람이 알고도 옮기라고 하면 `--allow-drift` 를 준다.
- **exit 5 는 `--base` 의 서버가 이 checkout 의 sandbox 가 아니거나 그 화면이 없다는 뜻이다.**

`manifest.json`의 `steps`를 순서대로 `use_figma`에 넘긴다. 결과에 `error`가 있으면 멈춘다. 세 번째 단계가 **「builder 를 문서에 둔다」**이고, 뒤따르는 build 단계는 조각만 실은 채 문서에 둔 그것을 꺼내 쓴다. 그래서 build 단계를 다시 돌릴 때도 그 앞 단계는 건너뛰지 않는다 — 문서에 builder 가 없거나 다르면 build 단계가 `error` 로 멈춘다. build 단계는 화면 이름과 같은 페이지를 쓰고(없으면 만든다), 그 페이지에서 이번 프레임과 이름이 정확히 같은 프레임만 지우고 다시 그린다. 마지막 audit 단계에서 `missingFrames`·`strayNodes`·`unboundPaints`·`textsWithoutStyle`이 모두 비고, 모든 프레임의 `rootWithoutFill`이 `false`이고 `localInstances`가 비었으며, 프레임들의 `remoteInstances` 합이 manifest 의 `instances.total` 과 같으면 완료다. 브라우저 스크린샷은 `browserScreenshots`에 있다.

**단계를 건너뛰거나 앞뒤를 바꾸지 않는다.** 뒤 단계의 조각은 앞 단계가 만든 노드를 부모로 찾는다. 한 단계를 건너뛰고 다음 것을 돌리면 「부모를 찾지 못했다」로 멈춘다. 나눠서 돌릴 때도 순서는 그대로여야 한다.

**「옮기는 중 조각 내용이 바뀌었다」는 대개 다시 보내면 풀린다.** 모델이 옮겨 적다 한 글자를 틀린 것이고, 단계 파일 자체는 멀쩡하다. 같은 단계를 **세 번까지** 다시 보내고, 세 번째도 같으면 그때 파일을 의심한다. 파일이 맞는지는 Figma 없이 확인할 수 있다 — 단계의 `RUN` 을 그대로 평가해 `fnv(JSON.stringify(RUN))` 가 그 파일의 `EXPECT` 와 같은지 보면 된다.

## 어떻게 틀리지 않게 하는가

- **색 이름.** `dom-extract.js`는 요소의 class에서 `oe-*` 토큰과 primitive 단계를 후보로 모은다. `data-[checked]:`처럼 상태가 붙은 class도 후보이고, 정적인 화면에 걸리지 않는 `hover:`·`focus:`·`active:`·`dark:` 변형은 뺀다. `prepare.mjs`가 후보의 Light 값과 브라우저가 실제로 칠한 색을 대조해 고른다. 맞는 후보가 없으면 manifest의 `unresolvedColors`에 남긴다. `/design-page`는 그 경우 멈추고 옮기지 않는다.
- **팝업.** Select·Combobox 목록처럼 Portal로 `<body>` 끝에 붙은 요소도 루트 위에 absolute로 겹쳐 옮긴다.
- **옮겨 적기.** 모델이 단계 파일을 `use_figma`에 옮기다 숫자 하나를 바꿔도 문법은 그대로다. 단계마다 조각 내용의 해시를 Figma 쪽에서 다시 재서 다르면 아무것도 그리지 않고 `error`를 낸다. 문서에 둔 builder 도 같은 해시로 지킨다.
- **다른 화면.** 조각 경로는 `<key>:s<상태 순서>`로 시작하고 부모는 같은 이름의 루트 프레임 안에서만 찾는다. 변수는 `oe color`·`oe primitive`·`oe size` 컬렉션 안에서만 찾아 다른 라이브러리의 같은 이름 변수에 묶지 않는다.
- **위치.** auto-layout 부모 안에서 DOM과 2px 넘게 어긋난 자식만 absolute로 빼고, 한 자식을 빼면 형제를 다시 잰다.
- **멈췄을 때 남는 것.** `createFrame`·`createInstance` 는 노드를 페이지 최상위에 만들고, builder 는 자식을 다 그린 뒤에야 부모에 붙인다(오토 레이아웃 부모에 붙은 노드를 고치면 부모를 다시 재서 느리다). 그래서 그리다 멈추면 만들던 노드가 페이지 (0,0)에 고아로 남았다. 2026-09-22 반박 시험에서 「라이브러리에 없는 변형」으로 멈춘 자리의 부모 `div`(668×49)가 그 안의 Checkbox 인스턴스와 함께 남았고, 같은 단계를 다시 돌려도 지워지지 않았다. 이제 build 단계는 시작할 때 페이지 최상위를 적어 두고, 끝날 때(멈췄을 때도) 그 뒤에 생긴 것 가운데 다 그린 루트가 아닌 것을 지우고 `sweptOrphans` 로 알린다. 루트 안에 다 그려 붙인 것은 전처럼 남고, 그 단계를 다시 돌리면 경로가 같은 것을 지우고 다시 그린다. 노드는 만들자마자 경로 표식(`p`)을 받으므로, 실행이 끊겨 지우지 못한 고아도 audit 가 `strayNodes` 로 찾는다.

## builder 는 한 번만 보낸다

걸리는 시간은 Figma 호출이 아니라 **모델이 옮겨 적는 글자 수**로 정해진다. 예전에는 단계마다 `builder.js`(주석을 뺀 13,400자)가 통째로 실려서, 한 단계의 8할이 매번 같은 코드였다.

지금은 「builder 를 문서에 둔다」 단계가 그것을 **공유 plugin data**(`ooee.build`/`builder`)에 한 번 저장하고, 뒤따르는 build 단계는 조각만 실은 채 그것을 꺼내 `AsyncFunction` 으로 만들어 부른다. build 단계의 코드는 700자 남짓이다. builder 가 한 단계에 다 들어가지 않으면 조각으로 나눠 보내 이어 붙이고, 마지막 조각에서 전체 해시를 확인한다.

| | 전 | 후 |
| --- | --- | --- |
| 관리자 로그인 | 6단계 67,456자 | **6단계 44,358자** |
| 카탈로그(139개) | 42단계 702,691자 | **23단계 223,095자** |

단계 수가 절반쯤만 준 까닭은, 남은 자리를 데이터로 꽉 채우지 않고 **한 단계의 한도를 19,000자에서 12,000자로 낮췄기** 때문이다. builder 를 뺀 첫 판은 한 단계가 데이터만으로 19,000자가 됐는데, 카탈로그를 실제로 올리다 그중 하나가 「옮기는 중 조각 내용이 바뀌었다」로 멈췄다. 그 단계 파일 자체는 해시가 맞았다(로컬에서 11개를 모두 확인). 옮겨 적는 것은 모델이라 한 단계가 클수록 한 글자가 어긋날 자리도 는다. 지금은 가장 큰 단계가 11,946자다.

무엇에 기대는지 2026-09-17 에 `use_figma` 로 직접 확인했다.

- 호출 사이에 `globalThis` 는 **살아남지 않는다**. 그래서 함수를 전역에 두는 길은 막혀 있다.
- 공유 plugin data 는 문서에 남아 **다음 호출에서 그대로 읽힌다**. 6,082자를 넣고 다음 호출에서 해시까지 같게 되읽었다.
- plugin 환경에 `eval` 과 `new Function` 이 있다. 되읽은 코드를 `AsyncFunction` 으로 만들어 실제로 돌렸다.

두 겹으로 지킨다. loader 는 실어 보낸 코드의 해시를 저장 전에 다시 재고, build 단계는 문서에서 꺼낸 코드의 해시가 자기가 기대하는 값과 같은지 본다. 다르면 그리지 않고 `error` 를 낸다. 그래서 **build 단계만 따로 다시 돌리는 것은 안 된다** — 문서에 builder 가 없거나 낡았으면 멈춘다.

## Figma 에서 무엇이 Frame 이 되나

**배치하는 곳만 Frame 이다**(`2026-09-16` 개발자 결정). DOM 의 감싸개를 그대로 옮기면 모든 요소가 Frame 이 되어 Figma 에서 다루기 어렵다. `prepare.mjs` 가 옮기기 전에 아래대로 접는다.

| DOM 의 모습 | Figma |
| --- | --- |
| 화면 루트 | 오토 레이아웃 Frame |
| 자식을 배치하는 상자(자식 둘 이상, 또는 여백·간격을 주는 상자) | 오토 레이아웃 Frame |
| 칠·테두리·모서리를 가진 상자 | Frame (자식이 없으면 Rectangle) |
| `data-slot` 이 붙은 컴포넌트 노드 | 라이브러리 인스턴스(아래 「라이브러리 인스턴스」). 인스턴스가 되지 않은 자리는 Frame 이고, 되짚기의 근거라 접지 않는다. **단 카탈로그 컴포넌트 안쪽은 접는다**(아래) |
| 글자 하나만 감싼 상자 | 없애고 글자가 그 자리를 차지한다. 가운데 맞춤은 글자의 가로·세로 정렬로 옮긴다. `overflow: hidden`(말줄임)이 붙어 있어도 접는다 — Figma 에서 글자는 제 크기를 갖고 잘림은 부모 auto layout 이 다룬다 |
| 아이콘 하나만 감싼 상자, 자식을 그대로 통과시키는 상자 | 없앤다 |

`manifest.json` 의 `folded` 가 이번에 접은 수를 센다. 「고객의 소리」는 Frame 124개가 69개로 줄었다.

## 컴포넌트 카탈로그

`apps/sandbox/src/app/catalog/page.tsx` 는 화면이 아니라 `@ooee/ui` 컴포넌트의 변형을 한 번에 그려 두는 자리다. 항목마다 `data-component`(컴포넌트 이름)와 `data-variant-props`(변형 이름)를 적으면, `builder.js` 가 그 프레임을 Figma **컴포넌트**로 만든다. 이름은 카탈로그의 `data-variant-props` 그대로인 `variant=fill, tone=brand, controlSize=regular, state=기본` 꼴이다. 자산 패널에서 컴포넌트별로 묶는 것은 이름이 아니라 `combine-variants.js` 가 만드는 **Component Set** 이고, 세트 이름은 그때 붙는다.

**카탈로그는 라이브러리 파일(`ooee · 컴포넌트 라이브러리`, fileKey `4HKy8Gi4Hd4VefFFvlIolc`)에만 올린다.** 화면 파일에는 올리지 않는다 — 화면은 라이브러리를 키로 가져와 인스턴스로 놓으므로(「라이브러리 인스턴스」) 화면 파일에 로컬 사본이 생기면 같은 이름의 컴포넌트가 둘이 되고, 예전처럼 그 사본을 찾아 쓰는 길이 다시 열린다. 라이브러리를 다시 올리는 것은 사람이 하는 일이고 `/design-page` 는 부르지 않는다. 올린 뒤에는 라이브러리 파일에서 Publish 하고 「라이브러리 키 표」대로 `library.json` 을 다시 뽑는다.

```bash
# 한 종류씩 옮긴다. 프레임이 「컴포넌트 / Button」처럼 나뉘고 한 번에 할 일이 작아진다.
node scripts/figma/prepare.mjs --key catalog --name "컴포넌트" --only Button --only Chip --height 900
# manifest 의 steps 를 use_figma 에 순서대로 넘긴다
```

**한 번에 다 옮기지 않는다.** 큰 오토 레이아웃 프레임에 노드를 붙이는 값은 **이미 있는 자식 수에 비례해** 커진다(2026-09-17 측정: 자식 100개 473ms · 300개 2,019ms · 500개 4,651ms). 139개를 한 프레임에 넣으면 뒤 단계가 몇 분씩 걸리고, 실제로 한 단계가 1,026초 무응답으로 MCP 타임아웃을 냈다. `--only` 로 종류를 나누면 프레임마다 자식이 수십 개라 이 값이 붙지 않는다.

**이 실행은 지금 23단계 223,095자다(2026-09-17, 컴포넌트 139개).** builder 를 한 번만 보내기 전에는 42단계 702,691자였고, 그때는 글자의 74%가 39번 되풀이되는 같은 코드였다.

변형을 더하려면 카탈로그 화면에 항목을 더하고 다시 돌린다. 값은 코드의 variant 정의에서 나오므로 Figma 쪽을 손으로 고치지 않는다. 종류는 카탈로그의 `Group` 이 정본이다(2026-09-22 기준 스물넷: Button·Badge·Input·Select·MultiSelect·Calendar·Checkbox·CheckboxField·Chip·Field·Switch·SwitchField·Radio·RadioField·Textarea·InputButton·NumberInput·Combobox·MultiCombobox·ToggleButton·NotificationBadge·SelectBox·AppHeader·BottomNavigation). 카탈로그와 `library.json` 의 변형 이름이 하나라도 다르면 `catalog/page.test.tsx` 가 실패한다.

**개수는 여기에 적지 않는다.** 카탈로그가 정본이고 항목이 늘 때마다 바뀐다. 문서에 베껴 두면 반드시 어긋난다(실제로 135·139 두 값이 서로 다른 채 남아 있었고 둘 다 실제와 달랐다). 지금 개수는 이렇게 센다:

```bash
node scripts/figma/prepare.mjs --key catalog --name "컴포넌트" --only <종류>   # 준비 결과의 프레임·단계 수
```

한 컴포넌트 안에서 변형 이름이 겹치면 Figma 에도 같은 이름의 컴포넌트가 둘 생기고 인스턴스가 어느 쪽에 붙을지 알 수 없다. 카탈로그 화면이 그릴 때 멈추므로 빌드가 실패해 바로 드러난다.

**컴포넌트 안쪽은 `data-slot` 상자도 접는다.** 화면에서는 레이어 이름이 되짚기의 다리라 남기지만, 카탈로그는 Component Set 이름과 Variant 속성이 정체를 확정하므로 `button-label` 같은 상자를 남길 까닭이 없다. `Group` 이 씌운 감싸개도 컴포넌트 표시를 자식에게 넘기고 걷어낸다. 그래서 Figma 의 `Button` 컴포넌트 안에는 글자 하나만 있다(2026-09-18 개발자).

```
전:  COMPONENT → Frame button → Frame button-label → Text 버튼
후:  COMPONENT(button) → Text 버튼
```

`--height` 는 화면 전체가 들어갈 만큼 준다. 항목을 더해 화면이 길어졌으면 그만큼 올린다. 작게 주면 브라우저 스크린샷이 잘려 눈으로 대조할 때 아래쪽을 보지 못한다.

## 라이브러리 인스턴스

**화면의 `@ooee/ui` 컴포넌트는 게시된 라이브러리의 인스턴스로 놓는다(2026-09-22 개발자 결정).** 옵션 없이 켜지고, 화면 파일에 카탈로그 사본을 두지 않는다. `builder.js` 가 조각에 실려 온 세트 키로 `figma.importComponentSetByKeyAsync` 를 불러 세트를 가져오고, 그 `children` 에서 변형을 이름으로 골라 `createInstance` 한다. 세트는 build 단계마다 한 번만 가져온다. 주 컴포넌트가 라이브러리의 것이라 `mainComponent.remote` 가 `true` 이고, audit 의 `remoteInstances` 가 그것을 센다.

2026-09-21까지는 `--instances` 를 줄 때만, 그것도 **같은 파일의 「컴포넌트」 페이지**에서 이름으로 찾았다. 새로 만든 결과 파일에는 그 페이지가 없어 모든 자리가 조용히 프레임으로 떨어졌고, 라이브러리를 쓰지 않은 화면이 완료로 보였다(2026-09-22 조사). 그 길은 지웠다.

### 어떻게 정하나

1. **이름.** `instance-rules.mjs` 의 `libraryRule` 이 DOM 요소의 `data-slot` 과 `data-*` 로 `<세트>/<축=값, …>` 이름을 만든다(첫 `/` 앞이 세트, 뒤가 변형). 카탈로그의 `data-component`/`data-variant-props` 와 글자까지 같아야 한다. 규칙은 한 벌이다. `prepare.mjs` 가 그 소스를 브라우저에 끼워 넣고, `library.test.mjs` 와 `catalog/page.test.tsx` 가 같은 함수를 부른다. 카탈로그 시험은 카탈로그의 모든 항목에 규칙을 돌려 제 이름이 나오는지 본다.
2. **모양.** `library.mjs` 의 `decideInstances` 가 그 이름을 `library.json` 에서 찾아, 그 변형의 **서명**(글자 노드의 수·차례·텍스트 스타일, 보이는 아이콘 이름)이 화면의 그 자리와 같은지 본다. 인스턴스에 넘길 수 있는 것은 글자뿐이다(칠·테두리·오토 레이아웃은 컴포넌트 값). 그래서 글자 말고 다른 것이 다르면 인스턴스로 놓지 않는다. 값도 placeholder 도 없는 빈 입력은 라이브러리의 `Placeholder` 한 자리를 빈 글자로 채워 놓는다.
3. **결과는 넷 가운데 하나이고 manifest 에 모인다.**

| manifest | 뜻 | 그리는 것 |
| --- | --- | --- |
| `instances` | 이름이 라이브러리에 있고 서명까지 맞는다. `total`·`bySet`·`items` | 라이브러리 인스턴스 |
| `unsupported` | `@ooee/ui` 컴포넌트이고 라이브러리에 세트도 있지만 맞는 변형이 없다. 인스턴스로 옮기면 모양이 틀린다. 까닭이 `why` 에 붙는다 | 그리지 않는다. prepare 가 exit 3 으로 끝난다. **예외로 정한 요청**(`--allow-frames`, `manifest.framesAllowed`)의 화면만 프레임으로 그리고, 그 안의 다른 컴포넌트는 제 차례에 인스턴스가 된다 |
| `notInLibrary` | 애초에 `@ooee/ui` 컴포넌트가 아닌 native 덩이(머리글·링크·목록 칸·요약 표 …). 잇달아 나오는 같은 덩이는 한 줄로 세고(`count`), 속한 덩이를 `in` 에 적는다 | 프레임 |
| `missingInLibrary` | 규칙이 만든 이름이 라이브러리에 **없다** | 그리지 않는다. prepare 가 exit 3 으로 끝나고(예외여도), 그래도 넘기면 build 단계가 그 이름을 `error` 로 내고 멈춘다 |

`missingInLibrary` 와 `unsupported` 는 프레임으로 떨어뜨리지 않는다. 라이브러리에 없는 것이 화면에 필요하면 코드 → 카탈로그 → 라이브러리 순서로 먼저 만든다([`docs/process/ai-environment.md`](../../docs/process/ai-environment.md) 「새 컴포넌트를 만들 때」). 새 컴포넌트뿐 아니라 **있는 컴포넌트의 빠진 변형**도 같다 — 앞 아이콘이 붙은 Input, 최솟값·최댓값에 닿은 NumberInput, 굵은 라벨의 CheckboxField, Field·AppHeader·BottomNavigation 처럼 속이 굳어 있는 세트가 그렇다.

2026-09-22 까지는 `unsupported` 를 조용히 프레임으로 그리고 exit 0 으로 끝냈다. 반박 시험에서 이커머스 장바구니의 컴포넌트 13곳 가운데 6곳(돋보기가 붙은 검색 Input, 수량 NumberInput 2, 「전체 선택」 CheckboxField, `buttonVariants` 링크 2)이 그렇게 프레임이 됐다. 멈추는 것이 `missingInLibrary` 뿐이라 「없으면 코드 먼저」가 이 자리들에는 걸리지 않았다. 그래서 `unsupported` 도 멈추게 하고, 규칙보다 먼저 만든 #9 만 `FRAME_EXCEPTIONS` 에 예외로 적었다.

### 종류

| 세트 | 인스턴스로 놓는 근거 | 프레임으로 두는 자리 |
| --- | --- | --- |
| Button | `data-variant`·`data-tone`·`data-size`, disabled | custom tone, 아이콘만 있거나 앞뒤 아이콘이 있는 버튼(서명), `buttonVariants()` 로 칠한 `<a>`(data-* 가 없어 변형을 읽지 못한다. `<Button render={<a href=… />} nativeButton={false} role="link">` 로 쓰면 인스턴스가 된다. generate-code 가 이제 그렇게 쓴다) |
| Badge | variant·tone·size | custom tone, 앞 아이콘(서명) |
| Input | variant·size, 값·placeholder·invalid·disabled | 앞뒤 요소(leadingElement·prefix·suffix·trailingElement). 돋보기가 붙은 검색창이 여기 든다 |
| NumberInput | variant·size·안쪽 input 의 `data-controls` | 접두·접미, disabled·invalid, −·+ 버튼이 꺼진 모양(최솟값·최댓값·readOnly). 라이브러리는 상태 축 없이 늘 켜진 모양이다 |
| Textarea | variant, 값·invalid·disabled | — |
| InputButton | variant·size·`data-has-value`·invalid(`aria-invalid`)·disabled | 앞뒤 요소 |
| Select·MultiSelect·Combobox·MultiCombobox | **트리거만.** variant·size·placeholder·invalid·disabled·`data-selection-mode` | 서명이 다른 자리(Multi 가 고른 값의 수가 다를 때 등). 목록 팝업과 둘레의 Field 는 라이브러리 세트가 아니다 |
| Checkbox·CheckboxField | shape, off·on·indeterminate·disabled, description | 앞뒤 요소, 굵은 라벨(`isParent`, 「전체 선택」 — 텍스트 스타일에서 걸린다), 켜진 채 disabled(라이브러리의 disabled 는 꺼진 모양이라 아이콘에서 걸린다) |
| Radio·RadioField | off·on·disabled-off·disabled-on, description | 앞뒤 요소, 오른쪽 설명(글자 수에서 걸린다) |
| Switch·SwitchField | size, 상태, labelPosition | — |
| Chip | shape·size·active | 앞뒤 요소·접두·지우기 버튼, disabled |
| ToggleButton | variant·tone(custom 이면 `data-color`)·size·pressed·count | 라이브러리와 다른 아이콘(라이브러리는 like=하트, brand·favorite=별로 굳어 있다) |
| NotificationBadge | shape·tone·overflow | — |
| **Field** | 늘 프레임 | 라이브러리 Field 는 속 컨트롤이 Input(outline·regular)으로 굳어 있다. 라벨·도움말은 글자로, 속 컨트롤은 제 인스턴스로 그린다 |
| **SelectBox** | 늘 프레임 | DOM 에 selectionMode 와 선택 상태가 없고, 라이브러리 네 변형이 모두 선택된 모양이다 |
| **AppHeader** | 늘 프레임 | 라이브러리는 양옆 요소가 굳어 있다(왼쪽 ← 버튼, 오른쪽 배지). 속의 Button·Badge 는 제 인스턴스로 그린다 |
| **BottomNavigation** | 늘 프레임 | 라이브러리는 항목 셋(홈·찾기·내 정보)으로 굳어 있고, 항목 수·아이콘은 data-* 에 없다 |
| **Calendar** | 늘 프레임 | 보이는 달과 고른 날에 따라 안쪽이 달라 변형 이름으로 정해지지 않는다 |

「서명」이라 적은 자리는 규칙이 아니라 `decideInstances` 가 `library.json` 과 견주어 거른다. 카탈로그에 없는 크기(예: ToggleButton 의 xsmall·xlarge)는 이름이 라이브러리에 없으므로 `missingInLibrary` 로 멈춘다. 「프레임으로 두는 자리」와 「늘 프레임」은 모두 `unsupported` 라서 예외가 없는 화면에서는 멈춘다. 늘 프레임인 다섯 종류를 쓰는 화면을 옮기려면 라이브러리 쪽 변형이 먼저 바뀌어야 한다(예: Field 가 속 컨트롤을 인스턴스 교체로 받기, SelectBox 에 선택 상태 축, AppHeader·BottomNavigation 의 양옆·항목을 슬롯으로).

### 인스턴스에 싣는 것

- **안쪽은 싣지 않는다.** 넘길 것은 글자뿐이고 `instance.findAllWithCriteria({types:["TEXT"]})` 슬롯에 차례대로 넣는다. 노드 자신의 칠·테두리·모서리·오토 레이아웃도 컴포넌트 값이라 뗀다(`step-payload.mjs` 의 `foldInstances`). 대신 그릴 것을 남기지 않으므로 인스턴스를 못 놓으면 멈춘다.
- **조각에는 그 조각이 쓰는 세트의 키만 싣는다**(`lib`, 세트 하나에 52자 남짓). `EXPECT` 해시에 들어가므로 옮기다 틀리면 그리기 전에 멈춘다.
- **builder 가 한 번 더 견준다.** 가져온 변형의 글자 수와 보이는 아이콘이 prepare 가 맞춰 본 것(`ic`)과 다르면 인스턴스를 지우고 멈춘다. 라이브러리가 `library.json` 을 뽑은 뒤에 바뀐 것이다.
- **인스턴스는 한 번만 만든다.** 예전 builder 는 확인용 인스턴스를 만들고 맞으면 하나를 더 만들어, 첫 것이 페이지 (0,0)에 고아로 남았다(2026-09-22, 라이브러리 파일의 화면 페이지 다섯 곳에서 확인).
- **흐름에 넣는다.** 라이브러리 변형에서 만든 인스턴스는 처음부터 absolute 로 나온다. 그대로 auto-layout 부모에 붙이면 부모의 (0,0)에 겹치고 settle 이 absolute 자식을 건너뛰어 바로잡지 못한다. 그래서 붙인 뒤 `AUTO` 로 돌리고, DOM 과 어긋난 것만 settle 이 다시 뺀다.

**2026-09-22 에 실제로 돌려 확인했다.** bluekey 팀 결과물 폴더에 새로 만든 파일(`ooee · 라이브러리 인스턴스 시험 · 2026-09-22`)에서, 라이브러리를 따로 켜지 않고도 키로 세트를 가져왔다. 첫 가져오기(Button, 변형 120개)가 1.9초, 나머지 세트가 0.2~0.3초, 인스턴스 하나에 0.02~0.1초다. 원격 인스턴스에서도 글자 덮어쓰기·`setSharedPluginData`·`getMainComponentAsync().parent`(세트 이름)가 된다. 「이커머스 장바구니」를 이 절차대로 그려 인스턴스 7개가 모두 `remoteInstances` 로 세어졌고 `localInstances` 는 비었다. 그 실행에서 위의 absolute 문제를 찾아 고쳤다.

**전제 하나.** 글자를 슬롯에 넣을 때 `findAllWithCriteria` 가 돌려주는 차례가 화면 사양을 전위 순회한 차례와 같다고 본다. 라이브러리 587개 변형 모두에서 그 차례가 `findAll` 깊이 우선 차례와 같았다(2026-09-22 조사). 수와 텍스트 스타일이 같은데 역할만 다른 자리(예: 접두만 있고 placeholder 가 없는 Input)는 규칙이 앞뒤 요소를 프레임으로 돌려 막는다. 인스턴스 안 글자가 뒤바뀌어 보이면 이 전제를 먼저 의심한다.

되읽기는 인스턴스를 만나면 안쪽으로 내려가지 않고 주 컴포넌트 이름을 `<세트>/<변형>` 으로 읽어 어떤 컴포넌트인지 확정한다. 사람이 Figma 에서 다른 컴포넌트로 바꾸면 「컴포넌트」 변화로 나오며 사람이 정할 것으로 분류된다.

### 끄기

`--no-instances` 는 인스턴스를 끄고 모든 자리를 프레임으로 그린다. 라이브러리를 보지 않으므로 exit 3·4 도 나지 않는다. **결과물이 아니다.** 쓰는 자리는 둘뿐이다. 라이브러리를 쓸 수 없는 계정·팀에서 모양만 확인할 때, 라이브러리를 다시 올리는 중이라 키 표와 잠시 어긋나 있을 때다. `/design-page` 는 이 옵션을 쓰지 않는다.

### 라이브러리가 코드보다 낡았을 때

**화면이 인스턴스로 쓰는 세트의 원본이 라이브러리를 올린 뒤 모양이 바뀌었으면 prepare 가 exit 4 로 멈춘다.** 「무조건 라이브러리」에서는 인스턴스가 라이브러리를 올린 때의 모양을 그대로 싣기 때문이다. 2026-09-22 까지는 알리기만 하고 그대로 결과물로 냈다.

manifest 의 `libraryDrift` 에 넷이 있다.

| 자리 | 뜻 |
| --- | --- |
| `changedSince` | 라이브러리를 올린 커밋(`library.json` 의 `builtFrom`) 뒤로 `packages/ui/src`·`packages/tokens/src`·카탈로그에서 바뀐 파일(작업 트리 기준, 시험 파일 빼고) |
| `visualChanges` | 그 가운데 주석·공백·JSX 의 `data-*` 속성 말고 무엇이 바뀐 파일. 2026-09-22 의 checkbox·radio·number-input 처럼 Figma 규칙이 읽을 `data-slot`·`data-shape` 만 더한 파일은 빠진다. `data-[shape=…]:` 처럼 CSS 가 고르는 것은 class 글자라 남는다 |
| `affected` | **이 화면이 인스턴스로 쓰는 세트** 가운데 원본이 `visualChanges` 에 든 것과 그 파일. 원본은 세트 이름의 파일(`MultiSelect`→`select.tsx`, `CheckboxField`→`checkbox.tsx`)과 그것이 `./x` 로 불러 쓰는 파일이다(NumberInput 은 `input.tsx` 도). 토큰(`packages/tokens/src`)과 `packages/ui/src/styles.css` 는 모든 세트에 닿는다. 프레임으로 그린 자리는 지금 코드로 그리므로 세지 않는다 |
| `allowed` | `--allow-drift` 로 알고도 옮겼는지 |

`affected` 가 비지 않으면 멈춘다. 푸는 길은 둘이다. 카탈로그를 라이브러리 파일에 다시 올려 Publish 하고 「라이브러리 키 표」대로 `library.json` 을 다시 뽑거나(`builtFrom` 이 새 커밋이 된다), 사람이 낡은 모양을 알고도 옮기라고 해서 `--allow-drift` 를 준다. 뒤의 경우 design-page 보고의 「확인이 필요한 것」에 세트와 파일을 적는다. 「알려진 차이」가 아니다.

파일로 가르는 것이라 한계가 있다. 파일 안의 어느 부분이 바뀌었는지는 보지 않으므로, 2026-09-22 의 `select.tsx`·`selection-trigger.ts` 처럼 팝업 목록과 열린 상태(`data-[popup-open]:`)만 바꾼 변경도 트리거만 싣는 Select 세트를 낡았다고 본다(#9 의 상품 목록·주문·결제가 여기서 exit 4). 반대로 Chip 은 active 채움이 실제로 바뀌어 맞게 걸린다. `builtFrom` 이 둘 이상이면 어느 세트를 어느 커밋에서 올렸는지 몰라 어느 하나와도 다르면 바뀐 것으로 본다. 올린 표식이 실제 내용과 어긋난 적도 있다(`bac2207` 표식인데 그 뒤 커밋의 내용이 들어 있었다). 반대로 파일로 잡히지 않는 낡음도 있다 — 2026-09-22 시험 파일에서 outline Button 의 테두리가 라이브러리에서 `neutral-500` 불투명(100%)으로 들어 있어 코드(`/30`)보다 진하게 보였는데 `button.tsx` 는 그대로였다. 그런 것은 design-page 7단계 눈 대조에서 찾는다. 같은 날 조사에서 Chip active·Switch on·SelectBox 선택의 색이 코드와 다른 것도 확인했다(모두 `visualChanges` 에 든다). 카탈로그를 라이브러리에 다시 올리면 풀린다.

## 라이브러리 키 표

`library.json` 은 게시된 라이브러리에서 뽑은 것이다. 손으로 고치지 않는다(`library.test.mjs` 가 다시 써 본 글자와 파일이 같은지, 변형 이름의 해시가 맞는지 본다). 라이브러리를 다시 올려 Publish 했으면 이렇게 다시 뽑는다.

1. `use_figma` 를 `fileKey` `4HKy8Gi4Hd4VefFFvlIolc`(라이브러리 파일)로 부르고 `code` 에 `scripts/figma/export-keys.js` 를 **그대로** 넣는다. 읽기만 하는 코드다.
2. 돌려받은 JSON 을 손대지 않고 `.figma-work/library-export.json` 에 저장한다.
3. 펴고 확인한다.

```bash
node scripts/figma/library.mjs save --from .figma-work/library-export.json   # scripts/figma/library.json 을 새로 쓴다
node --import tsx --test scripts/figma/library.test.mjs
pnpm --filter @ooee/sandbox test                                             # 카탈로그와 라이브러리의 변형 이름이 같은지
```

- 응답은 세트마다 축과 값을 한 번만 적고 변형은 값의 차례로 적어 `use_figma` 응답 한도(20,000자쯤) 안에 든다. 2026-09-22 기준 18,000자 남짓이라 변형이 크게 늘면 넘칠 수 있다. 잘리면 JSON 이 깨지거나 `hash` 가 달라 `save` 가 멈춘다.
- `save` 는 게시되지 않은 변경이 남은 세트(`getPublishStatusAsync` 가 `CURRENT` 가 아님)나 세트로 묶이지 않은 컴포넌트가 있으면 멈춘다. 라이브러리 파일에서 Publish 하거나 combine-variants 를 먼저 돌린다.
- 키는 세트에만 둔다. 변형 키 587개는 두지 않는다 — builder 가 가져온 세트의 `children` 에서 이름으로 고르므로 쓸 곳이 없고, 옮겨 적다 틀릴 자리만 는다. 틀린 세트 키는 가져오기가 실패하거나 세트 이름이 달라 그 자리에서 멈춘다.
- 결과를 커밋한다. `exportedAt`·`builtFrom` 도 함께 바뀐다.

## 되읽기 (④)

사람이 Figma에서 고친 것을 화면 코드로 되돌리는 흐름이다. `/design-page`의 「되읽기」 절이 이 순서를 따른다.

```bash
node scripts/figma/sandbox-server.mjs --key voc                   # 기준을 다시 재려면 이 checkout 의 화면이 떠 있어야 한다
node scripts/figma/prepare.mjs --key voc --name "고객의 소리" --base <위의 base> …   # spec-<상태>.json 을 남긴다(Figma 는 부르지 않는다). exit 3·4 여도 spec 은 남는다
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

- **글꼴.** Figma에 Pretendard Variable이 없어 Noto Sans KR로 임시 대체하고, Noto Sans KR에 SemiBold가 없어 `semibold` 스타일은 Bold다(2026-09-15 개발자 승인). 스타일 설명에 적혀 있다. 글자 폭이 달라 좁은 자리에서 끝 글자가 조금 잘릴 수 있다. Pretendard가 Figma에 생기면 `setup-text-styles.js`가 멈추고 알린다.
- **Dark 모드.** `oe color`는 Light·Dark 모드를 갖지만 Button·Badge처럼 코드가 primitive 단계를 직접 쓰는 자리(`bg-blue-100`, `bg-[var(--brand-600)]`)는 `oe primitive` 변수에 묶여 모드를 바꿔도 뒤집히지 않는다. 코드도 그 자리를 `dark:` class로 따로 둔다.
- **투명도.** 코드가 `border-[var(--brand-500)]/30`처럼 색에 투명도를 붙인 자리는 변수에 묶은 칠의 opacity로 옮기고 `opacityOnToken`에 적는다. `figma-page-agent.md` 규칙 5와 부딪치므로 보고에 적어 확인받는다.
- **그림자.** `box-shadow`는 옮기지 않는다. oe 토큰에 그림자 색이 없다.
- **글자 크기.** `oe/text-*`에 없는 크기는 가장 가까운 스타일에 묶고 `unmappedText`에 적는다. Skill은 이 경우를 검사 실패로 본다.
- **자동 동기화가 아니다.** 변수 값은 `prepare.mjs`를 돌린 시점의 `packages/tokens`에서 옮겨 적은 것이다. 색 매핑과 brand seed는 Provisional이다.
- **Figma plugin 실행 환경.** 코드는 async 함수 본문으로 돌고 한 번에 50,000자까지다. `setPluginData` 대신 `setSharedPluginData`만 된다. 세션을 시작한 뒤 등록한 MCP 서버는 그 세션에 실리지 않는다.
- **Code Connect.** bluekey 팀이 Pro 플랜이라 쓸 수 없다. 화면의 컴포넌트는 라이브러리 인스턴스이고(「라이브러리 인스턴스」), 인스턴스가 되지 못한 자리와 native 덩이만 `data-slot`·role·태그 이름을 가진 프레임이다.
- **변수와 텍스트 스타일이 두 벌이다.** 프레임의 칠과 글자는 `setup-variables.js`·`setup-text-styles.js` 가 화면 파일에 만든 로컬 `oe color`·`oe size`·`oe/text-*` 에 묶이고, 라이브러리 인스턴스의 안쪽은 라이브러리의 같은 이름 변수·스타일을 쓴다. 한 파일에 같은 이름의 컬렉션이 둘 보이고 Light·Dark 모드도 따로 바뀐다. 결과 파일이 라이브러리 변수·스타일을 키로 가져오게 하는 것(`importVariableByKeyAsync`·`importStyleByKeyAsync`)은 아직 하지 않았다.
- **폴더.** `create_new_file`은 파일이 들어간 폴더를 돌려주지 않는다. 결과물 폴더에서 사람이 확인한다.
