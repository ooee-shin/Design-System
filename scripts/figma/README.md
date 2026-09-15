# Figma로 옮기기

`apps/sandbox`에 만든 화면을 Figma 프레임으로 옮기는 도구다. 색은 Figma 변수에, 글자는 텍스트 스타일에 묶고 아이콘은 Remix SVG로 넣어서 Selection colors와 Inspect에 `oe-*` 이름이 보이게 한다. `docs/process/ai-environment.md`의 순서 7 `/design-page`가 이 절차를 Skill로 옮기기 전까지의 수동 절차이며, 전달 시 `docs/process/`와 함께 제거한다.

Figma 쪽 호출은 Figma remote MCP의 `use_figma`로 한다. 코드는 한 번에 50,000자를 넘을 수 없어서 조각으로 나눠 넘긴다.

## 파일

| 파일 | 하는 일 |
| --- | --- |
| `token-export.ts` | `packages/tokens`의 `oe` 토큰 Light·Dark 값과 브랜드 단계를 RGBA JSON으로 뽑는다 |
| `setup-variables.js` | `oe color`(Light·Dark)·`oe size` 변수 컬렉션을 만든다. 같은 이름은 지우고 다시 만든다 |
| `setup-text-styles.js` | `oe/text-*/<weight>` 텍스트 스타일을 만든다 |
| `dom-extract.js` | 브라우저에 뜬 화면을 트리(JSON)로 읽는다. 색은 class 이름에서 `oe-*` 토큰이나 primitive 단계를 찾는다 |
| `make-chunks.py` | 트리를 `use_figma` 한 번에 들어가는 조각으로 나누고 쓰인 primitive 값과 아이콘 SVG를 붙인다 |
| `builder.js` | 조각을 받아 auto-layout 프레임을 만든다. primitive 변수는 `oe primitive` 컬렉션에 필요할 때 만든다 |

## 순서

```bash
mkdir -p .figma-work
node --import tsx scripts/figma/token-export.ts .figma-work/oe-tokens.json
pnpm --filter @ooee/sandbox dev   # http://localhost:3001

# 화면 하나를 트리로 읽는다. 뷰포트 높이는 창 틀(약 87px)만큼 더 준다.
node scripts/visual/inspect.mjs --base http://localhost:3001 --path /voc --viewport 1440x987 \
  --eval "(async()=>{document.querySelector('main').parentElement.parentElement.setAttribute('data-figma-root','');return $(cat scripts/figma/dom-extract.js);})()" \
  > .figma-work/voc.report.json
python3 -c "import json;r=open('.figma-work/voc.report.json').read();open('.figma-work/voc.tree.json','w').write(json.loads(r[r.index('{'):])['evaluated'])"

python3 scripts/figma/make-chunks.py .figma-work/voc.tree.json "고객의 소리 / 목록 · Desktop 1440" 0 0 .figma-work/chunks/closed
```

`remix-icons.json`은 `@remixicon/react` 아이콘을 `react-dom/server`로 렌더한 SVG 문자열 맵이며 `.figma-work/`에 둔다. 조각은 파일 이름 순서대로 `builder.js`의 `__CHUNK__` 자리에 조각 배열로 넣어 `use_figma`에 넘긴다. 첫 조각이 같은 이름의 프레임을 지우고 새로 만든다.

## 알려진 제약

- **글꼴.** Figma에 Pretendard Variable이 없어 Noto Sans KR로 임시 대체하고, Noto Sans KR에 SemiBold가 없어 `semibold` 스타일은 Bold다(2026-09-15 유진식 승인). 스타일 설명에 적혀 있다.
- **Dark 모드.** `oe color`는 Light·Dark 모드를 갖지만 Button·Badge처럼 코드가 primitive 단계를 직접 쓰는 자리(`bg-blue-100`, `bg-[var(--brand-600)]`)는 `oe primitive` 변수에 묶여 모드를 바꿔도 뒤집히지 않는다. 코드도 그 자리를 `dark:` class로 따로 둔다.
- **자동 동기화가 아니다.** 변수 값은 실행한 시점의 `packages/tokens`에서 옮겨 적은 것이다.
- **색 형식.** Chrome의 `getComputedStyle`은 Tailwind v4 색을 `lab()`로 돌려준다. `dom-extract.js`는 계산된 색을 칠이 있는지 판단하는 데만 쓰고, 이름은 class에서 읽는다.
