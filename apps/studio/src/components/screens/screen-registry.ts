/**
 * `/screens/*` 에서 무엇을 만들고 있는지의 단일 원본이다.
 *
 * 이 아래는 매끄럽게 이어지는 데모가 아니라 기능 화면을 한 건씩 만드는 작업장이다. 그래서 각
 * 루트의 첫 화면은 완성된 앱이 아니라 **무엇을 만들 예정이고 어디까지 왔는지**를 보여 주는
 * 목록이다. 목록이 없으면 열어 본 사람이 덜 만들어진 화면을 고장난 것으로 읽는다.
 */

export type ScreenRoot = {
  key: "admin" | "sto" | "sv";
  name: string;
  /** 이 루트의 레이아웃이 어떻게 서는지 한 줄. */
  note: string;
  items: ScreenWorkItem[];
};

export type ScreenWorkItem = {
  key: string;
  name: string;
  /**
   * 이 화면에서 **어디까지** 만드는지. 「헤더와 메뉴까지만」처럼 범위를 좁혀 적는다.
   * 사용자가 준 문구만 적는다. 비어 있으면 아직 정하지 않은 것이므로 임의로 채우지 않는다.
   */
  scope?: string;
  /** 아직 만들지 않은 화면은 갖지 않는다. 없으면 링크가 아니라 `예정`으로 표시한다. */
  href?: string;
};

export const screenRoots: ScreenRoot[] = [
  {
    key: "admin",
    name: "관리자",
    note: "뷰포트를 전부 씁니다. 좌측 내비게이션이 화면 높이를 채우고 본문만 스크롤됩니다.",
    items: [
      { key: "layout", name: "레이아웃·테마설정", scope: "Admin Layout(Header, Side Navigation, Page Header)", href: "/screens/admin/layout" },
      { key: "test", name: "테스트", href: "/screens/admin/test" },
      { key: "login", name: "로그인", href: "/screens/admin/login" },
    ],
  },
  {
    key: "sto",
    name: "STO",
    note: "사장님용 앱입니다. 웹에서 접근하면 모바일 뷰가 화면 가운데에 섭니다.",
    items: [
      { key: "test", name: "테스트", href: "/screens/sto/test" },
      { key: "login", name: "로그인", href: "/screens/sto/login" },
    ],
  },
  {
    key: "sv",
    name: "SV",
    note: "슈퍼바이저와 직원용 앱입니다. STO 와 같은 모바일 뷰를 씁니다.",
    items: [
      { key: "test", name: "테스트", href: "/screens/sv/test" },
    ],
  },
];

export function getScreenRoot(key: ScreenRoot["key"]) {
  const root = screenRoots.find((item) => item.key === key);
  if (!root) throw new Error(`Unknown screen root: ${key}`);
  return root;
}
