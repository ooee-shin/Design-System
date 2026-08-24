# Icon Foundation

상태: `Stable source rule / Provisional usage details`

ooee의 공용 아이콘 Primary 공급원은 [Remix Icon](https://remixicon.com/)이며 Secondary 공급원은 Google Material Symbols다. React 구현에서 Remix Icon은 repository에 버전이 고정된 `@remixicon/react`를 사용한다.

## 공급원 우선순위

1. Primary: Remix Icon의 의미가 일치하는 아이콘
2. Secondary: Remix Icon에 적절한 아이콘이 없을 때 Google Material Symbols
3. 두 공급원으로 표현할 수 없는 제품 고유 아이콘
4. 필요한 이유를 문서화한 다른 공급원 또는 자체 SVG

같은 의미의 Remix Icon이 있으면 컴포넌트마다 Material Symbols나 다른 라이브러리의 유사 아이콘을 섞지 않는다. 외부 화면을 재현하는 초기 Experiment에서 원본 아이콘을 임시로 사용할 수 있지만 Candidate로 추출할 때 Remix Icon, Material Symbols 순서로 대응 여부를 검토한다. Secondary 및 예외 공급원의 패키지는 실제 사용처가 확인될 때만 추가한다.

## 스타일 규칙

- 기본 UI action과 metadata에는 `Line` variant를 우선한다.
- `Fill` variant는 선택, 활성, 성공처럼 채움 자체가 상태를 전달할 때만 사용한다.
- 아이콘은 장식이 아니라 action의 의미를 보조한다. 아이콘만 있는 버튼에는 접근 가능한 label을 제공한다.
- 크기와 색상은 컴포넌트의 oe semantic token을 따른다. 아이콘 내부에서 raw color를 지정하지 않는다.
- 클릭 가능한 아이콘은 공통 hover state layer와 `oe-focus-ring`을 사용한다.
- 아이콘과 텍스트 사이 간격은 아이콘 버튼의 내부 클릭 영역을 포함해 판단하며 불필요한 외부 gap을 중첩하지 않는다.

## 현재 적용

- Studio의 기존 Lucide React 사용처를 Remix Icon 대응 아이콘으로 정규화했다.
- 메시지 action, 전달 상태, 날짜, 첨부, navigation과 Studio 검수 control이 같은 공급원을 사용한다.
- 현재 Material Symbols가 필요한 실제 사용처는 없으므로 Secondary 패키지는 설치하지 않았다.
- 구체적인 아이콘 선택과 크기는 아직 각 화면에서 시각 검수하며, 반복되는 size recipe는 실제 용례가 쌓인 뒤 승격한다.
- `/foundations/icon`은 현재 실제 코드에서 등록해 사용하는 Remix Icon asset과 공급원 상태를 표시한다.
