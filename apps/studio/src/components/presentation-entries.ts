/**
 * Presentation 화면이 표시하는 변경 기록이다.
 *
 * 이 파일이 원본이며 별도 문서로 옮겨두지 않는다. 블루키 자산화에 필요해지면
 * 그때 이 배열에서 필요한 형식으로 뽑아낸다. 그래서 구조를 단순하게 유지한다.
 *
 * 한 항목은 한 꼭지다. 개별 수정 단위가 아니라 무엇을 왜 바꿨는지 설명할 수 있는
 * 단위로 묶는다.
 */
export type PresentationEntry = {
  id: string;
  /** 무엇을 바꿨는가. 한 줄로 끝난다. */
  title: string;
  /** 왜 바꿨는가. 이 항목의 본체다. */
  why: string;
  /** 어떻게 바꿨는가. 결과를 짧게. */
  how: string;
  /** 관련 화면이 있으면 연결한다. */
  links?: Array<{ label: string; href: string }>;
};

export const presentationEntries: PresentationEntry[] = [
  {
    id: "input-and-input-button",
    title: "Input과 Input Button을 나눴다",
    why: "기존 개발에서는 입력창 하나가 값을 타이핑하는 일과 달력·주소·시간 선택 화면을 여는 일을 함께 맡고 있었다. 겉모습은 같지만 하는 일이 다르다. 하나는 사용자가 직접 값을 넣고, 다른 하나는 다른 화면을 여는 트리거다. 한 컴포넌트로 두면 실제 HTML 요소와 키보드 동작을 한쪽에만 맞출 수 있어서 나머지 한쪽의 접근성이 무너진다.",
    how: "외관과 Control Size, Layout은 그대로 공유하고 실제 HTML만 나눴다. Input은 `input`, Input Button은 `button`을 쓴다. Input Button은 현재 선택값이나 Placeholder를 표시하고, 실제 선택 화면은 소비자가 연결한다.",
    links: [
      { label: "Input", href: "/components/input" },
      { label: "Input Button", href: "/components/input-button" },
      { label: "명세 문서", href: "/docs/components/input-button" },
    ],
  },
];

/**
 * 아직 쓰지 않았지만 남겨야 하는 꼭지다. 두 가지 목적이 있다.
 *
 * 하나는 잊지 않는 것이다. 결정은 내린 직후에 가장 잘 기억나고 시간이 지나면
 * 결과만 남고 이유가 사라진다.
 *
 * 다른 하나는 형식을 판단하는 것이다. 항목 하나로는 무엇을·왜·어떻게 구조가
 * 적절한지 알 수 없다. 성격이 다른 꼭지를 여럿 늘어놓고 봐야 이 틀에 다 담기는지,
 * 아니면 담기지 않는 종류가 있는지 드러난다.
 *
 * `source`는 내용을 채울 때 볼 자리다. 맨땅에서 쓰지 않기 위한 것이다.
 */
export type PendingTopic = {
  title: string;
  source: string;
};

export const pendingTopics: PendingTopic[] = [
  { title: "폼 컨트롤의 기본값을 outline과 fill로 통일했다", source: "docs/system/interaction.md · working-context 확정된 결정" },
  { title: "Disabled에서도 외곽선을 남겼다", source: "docs/system/interaction.md" },
  { title: "카드형 선택은 Select Box가 소유하고 Checkbox·Radio에는 변형을 만들지 않았다", source: "docs/system/vocabulary.md · checkbox.md" },
  { title: "모양 어휘를 Square·Rounded·Circle로 통일하고 컴포넌트가 shape로 소유하게 했다", source: "docs/system/vocabulary.md" },
  { title: "Anatomy 명칭은 업계 표준을 쓰고 역할은 대응표로 밝혔다", source: "docs/system/vocabulary.md 명칭 대응표" },
  { title: "상태 색 이름을 warning·danger·success·info로 통일하고 Neutral은 이름에서 생략했다", source: "docs/system/tokens.md" },
  { title: "폼 컨트롤 보더와 폼 컨테이너 보더를 나눴다", source: "docs/system/tokens.md 사용 규칙" },
  { title: "Hover를 색 교체가 아니라 state layer 합성으로 처리했다", source: "docs/system/foundations/color.md" },
  { title: "아이콘 공급원을 Remix Icon으로 정하고 Line variant를 기본으로 했다", source: "docs/system/foundations/icon.md" },
  { title: "Placeholder 색을 실제 입력값과 분리했다", source: "docs/system/tokens.md · working-context 확정된 결정" },
  { title: "Focus 표시를 :focus-visible 기준으로 하고 세 유형으로 정리했다", source: "docs/system/interaction.md" },
  { title: "이미지 경계를 바깥 border가 아니라 내부 alpha layer로 만들었다", source: "docs/system/tokens.md 사용 규칙" },
  { title: "Combobox 다중 선택에서 Checkbox Indicator만 재사용하게 했다", source: "docs/system/components/checkbox.md" },
  { title: "토큰 값을 패키지가 직접 CSS로 전달하게 했다", source: "PR #2" },
  { title: "문서를 전달할 것과 제거할 것으로 나눴다", source: "PR #1" },
  { title: "컴포넌트 성숙도 등급을 없앴다", source: "PR #2" },
  { title: "Patterns를 Examples로 바꾸고 Pattern 자리는 비워뒀다", source: "PR #4" },
  { title: "Studio 안에서 저장소 문서를 읽게 했다", source: "PR #3" },
];
