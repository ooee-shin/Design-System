/**
 * `/generate-code` 가 만든 화면의 목록이다. 첫 화면 `/` 가 이 목록을 그린다.
 *
 * 화면을 더할 때 여기에 한 줄을 더한다. `prompt` 는 그 화면을 만들 때 준 요청을 한 줄로 줄인 것이고,
 * `source` 는 대조할 원본이 있으면 그 경로다. 원본이 없는 기획자 요청은 `source` 를 두지 않는다.
 */
/**
 * 화면을 묶는 자리다. 화면이 늘수록 목록이 길어져 스크롤만 하게 되므로 프로젝트로 나눈다.
 * 새 화면을 만들 때 어느 것인지 판단이 서지 않으면 **짐작하지 말고 묻는다** — 잘못 묶으면
 * 되돌리는 값이 크다. 규칙은 plugins/ooee-harness/skills/generate-code/SKILL.md 가 갖는다.
 *
 * `id` 는 Slack 「화면 요청」 폼의 프로젝트 라디오가 주는 값과 같아야 한다. 기획자가 고른 값이
 * 이슈 본문에 그대로 실려 오고, 화면을 만들 때 그 값을 여기에 적기 때문이다.
 */
export const SANDBOX_PROJECTS = [
  { id: "sto", name: "점주 앱", description: "점주와 매장 직원이 쓰는 앱입니다." },
  { id: "sv", name: "슈퍼바이저 앱", description: "여러 매장을 도는 슈퍼바이저가 쓰는 앱입니다." },
  { id: "web", name: "웹", description: "본사 담당자가 쓰는 웹입니다." },
] as const;

export type SandboxProject = (typeof SANDBOX_PROJECTS)[number]["id"];

export type SandboxScreen = {
  key: string;
  /** 어느 프로젝트의 화면인가. 첫 화면이 이 값으로 묶어 보인다. */
  project: SandboxProject;
  name: string;
  href: `/${string}`;
  /** 화면을 만들 때 준 요청을 한 줄로. */
  prompt: string;
  /** 대조할 원본 코드의 저장소 경로. 없으면 원본 없는 요청이다. */
  source?: string;
  /** `YYYY-MM-DD`. */
  createdAt: string;
};

export const sandboxScreens: SandboxScreen[] = [
  {
    key: "admin-login",
    project: "web",
    name: "관리자 로그인",
    href: "/admin-login",
    prompt:
      "블루키 관리자 웹 로그인 화면. 데스크톱 1440 좌우 절반, 왼쪽 로그인 폼(아이디·비밀번호·아이디 저장·비밀번호 찾기·로그인)과 Footer, 오른쪽 브랜드 패널 자리는 비워 둠.",
    source: "apps/studio/src/app/screens/admin/login/page.tsx",
    createdAt: "2026-09-14",
  },
  {
    key: "sto-support-request",
    project: "sto",
    name: "STO 지원요청",
    href: "/sto-support-request",
    prompt: "STO 사장님 앱의 지원요청 폼 한 장. 요청 유형·매장·제목·내용·사진 첨부·연락 가능 시간·긴급 요청 여부.",
    createdAt: "2026-09-14",
  },
  {
    key: "voc",
    project: "web",
    name: "고객의 소리",
    href: "/voc",
    prompt: "블루키 관리자 웹의 고객의 소리 화면. 필터·상태 칩·표·상세 답변 패널·페이지 이동.",
    createdAt: "2026-09-15",
  },
  {
    key: "sto-my-page",
    project: "sto",
    name: "사용자 마이페이지",
    href: "/sto-my-page",
    prompt:
      "STO 사장님 앱의 마이페이지. 아이디·비밀번호·점포·이름·권한을 보여 주고, 수정 가능한 비밀번호만 현재 비밀번호를 확인해 조회한다.",
    createdAt: "2026-09-16",
  },
  {
    key: "attendance-kiosk",
    project: "sto",
    name: "출퇴근 찍기",
    href: "/attendance-kiosk",
    prompt:
      "매장 입구 태블릿의 출퇴근 화면. 머리글에 매장명·날짜·시각, 근무 중/대기 중 두 덩이에 직원 칸과 퇴근하기·출근하기 버튼.",
    createdAt: "2026-09-17",
  },
  {
    key: "attendance-payroll",
    project: "web",
    name: "근태·급여 정산",
    href: "/attendance-payroll",
    prompt:
      "점주·본사 담당자가 기간을 골라 직원별 근무 시간과 급여를 확인하는 태블릿 화면. 기간·매장 필터, 내보내기, 요약, 표, 페이지 이동.",
    createdAt: "2026-09-17",
  },
  {
    key: "annual-leave",
    project: "sto",
    name: "연차 관리",
    href: "/annual-leave",
    prompt:
      "매장 관리자가 직원들의 연차를 확인하고 신청 내역을 보는 태블릿 가로 화면. 연도·이름 검색, 왼쪽 직원 목록, 오른쪽 잔여·사용·총 연차 요약과 신청 내역 표, 페이지 이동.",
    createdAt: "2026-09-21",
  },
  {
    key: "tax-invoice",
    project: "web",
    name: "세금계산서 발행",
    href: "/tax-invoice",
    prompt:
      "본사 담당자가 매장 × 고용형태별 월 인건비를 세금계산서로 발행하는 태블릿 가로 화면. 연월·발행 상태·고용형태 거르개, 줄마다 고르기 체크박스를 가진 표, 고른 건수·합계와 고용형태별 합계, 발행 버튼.",
    createdAt: "2026-09-21",
  },
  {
    key: "excel-export",
    project: "web",
    name: "엑셀 내려받기",
    href: "/excel-export",
    prompt:
      "본사 담당자가 엑셀로 내려받기 전에 담을 것을 고르는 태블릿 가로 화면. 왼쪽에 자료 종류·기간·매장·담을 항목, 오른쪽에 내려받을 줄 수와 세 줄 미리보기 표, 엑셀 내려받기 버튼.",
    createdAt: "2026-09-21",
  },
  {
    key: "weekly-schedule",
    project: "sto",
    name: "스케줄 관리",
    href: "/weekly-schedule",
    prompt:
      "매장 관리자가 한 주의 근무표를 짜고 인건비를 미리 보는 태블릿 가로 화면. 매장·주 고르기와 주 합계, 요일×직원 근무표와 가산 배지, 근로기준법 제56조 가산 규칙 줄.",
    createdAt: "2026-09-21",
  },
  {
    key: "shop-product-list",
    project: "web",
    name: "이커머스 상품 목록",
    href: "/shop-product-list",
    prompt:
      "이커머스 웹 구매 흐름의 첫 장인 상품 목록. 머리글(브랜드명 자리·카테고리·상품 검색·장바구니 2), 제목 「신발」 8개, 왼쪽 사이즈·가격·품절 제외 거르개, 정렬, 상품 카드 8개 격자, 페이지 이동.",
    createdAt: "2026-09-22",
  },
  {
    key: "shop-product-detail",
    project: "web",
    name: "이커머스 상품 상세",
    href: "/shop-product-detail",
    prompt:
      "이커머스 웹의 상품 상세 데스크톱 화면. 머리글(브랜드·카테고리·상품 검색·장바구니 2), 경로, 이미지 자리, 「에어 러너 2」 139,000원과 사이즈·색상·수량 고르기, 장바구니 담기·바로 구매, 상품 정보·사이즈 안내·배송·교환.",
    createdAt: "2026-09-22",
  },
  {
    key: "shop-cart",
    project: "web",
    name: "이커머스 장바구니",
    href: "/shop-cart",
    prompt:
      "이커머스 웹의 장바구니 화면. 머리글(브랜드·카테고리·상품 검색·담긴 수 2의 장바구니), 전체 선택·선택 삭제, 담긴 상품 2줄(고르기 체크·이미지 자리·옵션·수량·가격·삭제), 주문 요약 228,000원과 주문하기·쇼핑 계속하기 링크.",
    createdAt: "2026-09-22",
  },
  {
    key: "shop-checkout",
    project: "web",
    name: "이커머스 주문·결제",
    href: "/shop-checkout",
    prompt:
      "이커머스 웹 구매 흐름(#9)의 주문·결제 데스크톱 화면. 머리글, 배송지(받는 분·연락처·주소·배송 요청 사항), 주문 상품 두 개, 결제 수단, 오른쪽 결제 금액과 동의 체크·228,000원 결제하기 링크.",
    createdAt: "2026-09-22",
  },
  {
    key: "shop-order-complete",
    project: "web",
    name: "이커머스 주문 완료",
    href: "/shop-order-complete",
    prompt:
      "이커머스 웹의 주문 완료 화면. 담긴 수 없는 머리글, 「주문이 완료되었어요」 제목과 안내, 주문 정보(주문번호·결제 금액·결제 수단·받는 분·연락처·주소), 주문 상품 두 개, 주문 내역 보기·쇼핑 계속하기 링크.",
    createdAt: "2026-09-22",
  },
];
