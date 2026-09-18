# Icon Foundation

상태: `공급원 규칙 확정 / 사용 세부는 Provisional`

ooee의 공용 아이콘 Primary 공급원은 [Remix Icon](https://remixicon.com/)이며 Secondary 공급원은 Google Material Symbols다. React 구현에서 Remix Icon은 repository에 버전이 고정된 `@remixicon/react`를 사용한다. shadcn CLI로 컴포넌트를 받을 때도 같은 공급원이 딸려 오도록 `components.json`의 `iconLibrary`를 `remixicon`으로 둔다.

## 공급원 우선순위

1. Primary: Remix Icon의 의미가 일치하는 아이콘
2. Secondary: Remix Icon에 적절한 아이콘이 없을 때 Google Material Symbols
3. 두 공급원으로 표현할 수 없는 제품 고유 아이콘
4. 필요한 이유를 문서화한 다른 공급원 또는 자체 SVG

같은 의미의 Remix Icon이 있으면 컴포넌트마다 Material Symbols나 다른 라이브러리의 유사 아이콘을 섞지 않는다. 외부 화면을 재현하는 초기 화면 실험에서 원본 아이콘을 임시로 사용할 수 있지만 공용 자산으로 추출할 때 Remix Icon, Material Symbols 순서로 대응 여부를 검토한다. Secondary 및 예외 공급원의 패키지는 실제 사용처가 확인될 때만 추가한다.

## 스타일 규칙

- 기본 UI action과 metadata에는 `Line` variant를 우선한다.
- `Fill` variant는 선택, 활성, 성공처럼 채움 자체가 상태를 전달할 때만 사용한다.
- Navigation 요소의 아이콘은 선택 여부와 무관하게 `Fill`을 유지한다. 항목이 나란히 서는 자리에서 시각적 위계를 잡기 위해서다.
- 아이콘은 장식이 아니라 action의 의미를 보조한다. 아이콘만 있는 버튼에는 접근 가능한 label을 제공한다.
- 크기와 색상은 컴포넌트의 oe semantic token을 따른다. 아이콘 내부에서 raw color를 지정하지 않는다.
- 클릭 가능한 아이콘은 공통 hover state layer와 `oe-focus-ring`을 사용한다.
- 아이콘과 텍스트 사이 간격은 아이콘 버튼의 내부 클릭 영역을 포함해 판단하며 불필요한 외부 gap을 중첩하지 않는다.

## 크기 토큰

공용 아이콘은 다음 크기 토큰을 사용한다. 숫자나 임의의 Tailwind 크기를 직접 선택하지 않고 컴포넌트 맥락에 맞는 단계로 참조한다.

- `oe-icon-xsmall`: 12px
- `oe-icon-small`: 16px
- `oe-icon-medium`: 20px
- `oe-icon-large`: 24px
- `oe-icon-xlarge`: 32px

## 현재 적용

- Studio의 기존 Lucide React 사용처를 Remix Icon 대응 아이콘으로 정규화했다.
- 메시지 action, 전달 상태, 날짜, 첨부, navigation과 Studio 검수 control이 같은 공급원을 사용한다.
- Material Symbols의 첫 사용처가 `2026-09-18`에 생겼다. 새 창에서 열린다는 표시인 `open_in_new`이며, 관리자 점주의 소리 목록의 설정 버튼 둘이 쓴다. Remix Icon의 `RiExternalLinkLine`은 화살표의 선이 상자의 변과 어긋나 16px에서 형태가 흐려진다.
- Secondary 공급원은 패키지를 설치하지 않고 쓰는 아이콘만 파일로 들여온다. 지금 필요한 것이 하나뿐이고, 고른 스타일 축이 그대로 굳어 있어야 한다. 축은 `Outlined`, `FILL 0`, `wght 400`, `GRAD 0`, `opsz 24`다. Remix Icon이 모두 각진 선이라 모서리가 둥근 `Rounded`는 같은 화면에서 다른 규칙으로 보인다. 자리는 `apps/studio/src/components/candidates/material-symbols.tsx`에 둔다. 쓰는 아이콘이 여러 개로 늘어나면 그때 패키지를 검토한다.
- Material Symbols는 `0 -960 960 960` 좌표계를 쓴다. Remix의 `0 0 24 24`와 다르지만 그려지는 크기는 크기 토큰이 정하므로 쓰는 쪽에서는 차이가 없다.
- 구체적인 아이콘 선택은 각 화면에서 시각 검수하며, 크기는 공용 `oe-icon-*` 토큰을 사용한다.
- `/foundations/icon`은 현재 실제 코드에서 등록해 사용하는 Remix Icon asset과 공급원 상태를 표시한다.
