/**
 * `/generate-code` 가 만든 화면의 목록이다. 첫 화면 `/` 가 이 목록을 그린다.
 *
 * 화면을 더할 때 여기에 한 줄을 더한다. `prompt` 는 그 화면을 만들 때 준 요청을 한 줄로 줄인 것이고,
 * `source` 는 대조할 원본이 있으면 그 경로다. 원본이 없는 기획자 요청은 `source` 를 두지 않는다.
 */
/**
 * 화면을 묶는 자리다. 프로젝트 단위로 나눈다 — 「블루키 리뉴얼」처럼 실제로 굴러가는 일의 이름이다.
 * 화면이 늘수록 목록이 길어져 스크롤만 하게 되므로 첫 화면이 이 값으로 탭을 만든다.
 *
 * **요청이 없는 프로젝트를 만들면 그 탭은 빈 채로 남는다.** 새 프로젝트는 요청이 처음 올 때 한 줄이
 * 늘어난다(generate-code 「파일과 등록」). `id` 는 소문자·붙임표이고 Slack 폼이 보내는 값과 같아야 한다.
 */
export const SANDBOX_PROJECTS = [
  { id: "harness-test", name: "하네스 시험", description: "요청에서 화면까지의 흐름을 시험하며 만든 화면입니다. 제품에 들어가지 않습니다." },
  { id: "신주희-테스트", name: "신주희 테스트", description: "신주희 테스트 화면입니다." },
  { id: "자동-송장-api", name: "자동 송장 API", description: "송장 발급과 배송 현황을 보는 자동 송장 API 화면입니다." },
] as const;

export type SandboxProject = (typeof SANDBOX_PROJECTS)[number]["id"];

/**
 * 화면이 어느 폭으로 서는가. 프로젝트와 섞지 않는다 — 같은 프로젝트에 웹 화면과 모바일 화면이 함께 있다.
 * 한 화면이 여러 폭으로 설 수 있다(`viewports`). `inspect` 는 `/process-issue` 5단계가 폭마다 띄워 보는
 * 뷰포트이고, 화면 위의 「보기 폭」 전환(viewport-frame)도 이 값으로 액자를 만든다. 모바일만 고른 화면만
 * 화면 코드가 `max-w-[390px]` 상자를 두른다.
 */
export const SANDBOX_VIEWPORTS = [
  { id: "web", name: "웹", inspect: "1440x900" },
  { id: "tablet", name: "태블릿", inspect: "1024x768" },
  { id: "mobile", name: "모바일", inspect: "390x844" },
] as const;

export type SandboxViewport = (typeof SANDBOX_VIEWPORTS)[number]["id"];

export type SandboxScreen = {
  key: string;
  /** 어느 프로젝트의 화면인가. 첫 화면이 이 값으로 탭을 나눈다. */
  project: SandboxProject;
  /** 어느 폭으로 서는 화면인가. 웹·태블릿·모바일 가운데 하나 이상. 요청이 고른 그대로다. */
  viewports: SandboxViewport[];
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
    project: "harness-test",
    viewports: ["web"],
    name: "관리자 로그인",
    href: "/admin-login",
    prompt:
      "블루키 관리자 웹 로그인 화면. 데스크톱 1440 좌우 절반, 왼쪽 로그인 폼(아이디·비밀번호·아이디 저장·비밀번호 찾기·로그인)과 Footer, 오른쪽 브랜드 패널 자리는 비워 둠.",
    source: "apps/sandbox/src/app/(renewal)/renewal/admin/login/page.tsx",
    createdAt: "2026-09-14",
  },
  {
    key: "sto-support-request",
    project: "harness-test",
    viewports: ["mobile"],
    name: "STO 지원요청",
    href: "/sto-support-request",
    prompt: "STO 사장님 앱의 지원요청 폼 한 장. 요청 유형·매장·제목·내용·사진 첨부·연락 가능 시간·긴급 요청 여부.",
    createdAt: "2026-09-14",
  },
  {
    key: "voc",
    project: "harness-test",
    viewports: ["web"],
    name: "고객의 소리",
    href: "/voc",
    prompt: "블루키 관리자 웹의 고객의 소리 화면. 필터·상태 칩·표·상세 답변 패널·페이지 이동.",
    createdAt: "2026-09-15",
  },
  {
    key: "sto-my-page",
    project: "harness-test",
    viewports: ["mobile"],
    name: "사용자 마이페이지",
    href: "/sto-my-page",
    prompt:
      "STO 사장님 앱의 마이페이지. 아이디·비밀번호·점포·이름·권한을 보여 주고, 수정 가능한 비밀번호만 현재 비밀번호를 확인해 조회한다.",
    createdAt: "2026-09-16",
  },
  {
    key: "attendance-kiosk",
    project: "harness-test",
    viewports: ["tablet"],
    name: "출퇴근 찍기",
    href: "/attendance-kiosk",
    prompt:
      "매장 입구 태블릿의 출퇴근 화면. 머리글에 매장명·날짜·시각, 근무 중/대기 중 두 덩이에 직원 칸과 퇴근하기·출근하기 버튼.",
    createdAt: "2026-09-17",
  },
  {
    key: "attendance-payroll",
    project: "harness-test",
    viewports: ["tablet"],
    name: "근태·급여 정산",
    href: "/attendance-payroll",
    prompt:
      "점주·본사 담당자가 기간을 골라 직원별 근무 시간과 급여를 확인하는 태블릿 화면. 기간·매장 필터, 내보내기, 요약, 표, 페이지 이동.",
    createdAt: "2026-09-17",
  },
  {
    key: "annual-leave",
    project: "harness-test",
    viewports: ["tablet"],
    name: "연차 관리",
    href: "/annual-leave",
    prompt:
      "매장 관리자가 직원들의 연차를 확인하고 신청 내역을 보는 태블릿 가로 화면. 연도·이름 검색, 왼쪽 직원 목록, 오른쪽 잔여·사용·총 연차 요약과 신청 내역 표, 페이지 이동.",
    createdAt: "2026-09-21",
  },
  {
    key: "tax-invoice",
    project: "harness-test",
    viewports: ["tablet"],
    name: "세금계산서 발행",
    href: "/tax-invoice",
    prompt:
      "본사 담당자가 매장 × 고용형태별 월 인건비를 세금계산서로 발행하는 태블릿 가로 화면. 연월·발행 상태·고용형태 거르개, 줄마다 고르기 체크박스를 가진 표, 고른 건수·합계와 고용형태별 합계, 발행 버튼.",
    createdAt: "2026-09-21",
  },
  {
    key: "excel-export",
    project: "harness-test",
    viewports: ["tablet"],
    name: "엑셀 내려받기",
    href: "/excel-export",
    prompt:
      "본사 담당자가 엑셀로 내려받기 전에 담을 것을 고르는 태블릿 가로 화면. 왼쪽에 자료 종류·기간·매장·담을 항목, 오른쪽에 내려받을 줄 수와 세 줄 미리보기 표, 엑셀 내려받기 버튼.",
    createdAt: "2026-09-21",
  },
  {
    key: "weekly-schedule",
    project: "harness-test",
    viewports: ["tablet"],
    name: "스케줄 관리",
    href: "/weekly-schedule",
    prompt:
      "매장 관리자가 한 주의 근무표를 짜고 인건비를 미리 보는 태블릿 가로 화면. 매장·주 고르기와 주 합계, 요일×직원 근무표와 가산 배지, 근로기준법 제56조 가산 규칙 줄.",
    createdAt: "2026-09-21",
  },
  {
    key: "shop-product-list",
    project: "harness-test",
    viewports: ["web"],
    name: "이커머스 상품 목록",
    href: "/shop-product-list",
    prompt:
      "이커머스 웹 구매 흐름의 첫 장인 상품 목록. 머리글(브랜드명 자리·카테고리·상품 검색·장바구니 2), 제목 「신발」 8개, 왼쪽 사이즈·가격·품절 제외 거르개, 정렬, 상품 카드 8개 격자, 페이지 이동.",
    createdAt: "2026-09-22",
  },
  {
    key: "shop-product-detail",
    project: "harness-test",
    viewports: ["web"],
    name: "이커머스 상품 상세",
    href: "/shop-product-detail",
    prompt:
      "이커머스 웹의 상품 상세 데스크톱 화면. 머리글(브랜드·카테고리·상품 검색·장바구니 2), 경로, 이미지 자리, 「에어 러너 2」 139,000원과 사이즈·색상·수량 고르기, 장바구니 담기·바로 구매, 상품 정보·사이즈 안내·배송·교환.",
    createdAt: "2026-09-22",
  },
  {
    key: "shop-cart",
    project: "harness-test",
    viewports: ["web"],
    name: "이커머스 장바구니",
    href: "/shop-cart",
    prompt:
      "이커머스 웹의 장바구니 화면. 머리글(브랜드·카테고리·상품 검색·담긴 수 2의 장바구니), 전체 선택·선택 삭제, 담긴 상품 2줄(고르기 체크·이미지 자리·옵션·수량·가격·삭제), 주문 요약 228,000원과 주문하기·쇼핑 계속하기 링크.",
    createdAt: "2026-09-22",
  },
  {
    key: "shop-checkout",
    project: "harness-test",
    viewports: ["web"],
    name: "이커머스 주문·결제",
    href: "/shop-checkout",
    prompt:
      "이커머스 웹 구매 흐름(#9)의 주문·결제 데스크톱 화면. 머리글, 배송지(받는 분·연락처·주소·배송 요청 사항), 주문 상품 두 개, 결제 수단, 오른쪽 결제 금액과 동의 체크·228,000원 결제하기 링크.",
    createdAt: "2026-09-22",
  },
  {
    key: "shop-order-complete",
    project: "harness-test",
    viewports: ["web"],
    name: "이커머스 주문 완료",
    href: "/shop-order-complete",
    prompt:
      "이커머스 웹의 주문 완료 화면. 담긴 수 없는 머리글, 「주문이 완료되었어요」 제목과 안내, 주문 정보(주문번호·결제 금액·결제 수단·받는 분·연락처·주소), 주문 상품 두 개, 주문 내역 보기·쇼핑 계속하기 링크.",
    createdAt: "2026-09-22",
  },
  {
    key: "account-settings",
    project: "harness-test",
    viewports: ["web"],
    name: "계정 설정",
    href: "/account-settings",
    prompt: "자율 요청(#37). 내용을 정하지 않아 이름·이메일·언어·알림 수신과 저장으로 계정 설정 화면 한 장을 자유롭게 구성함.",
    createdAt: "2026-09-22",
  },
  {
    key: "sto-notice-list",
    project: "harness-test",
    viewports: ["mobile"],
    name: "공지사항 목록",
    href: "/sto-notice-list",
    prompt: "STO 사장님 앱의 공지사항 목록. 전체·필독·일반 거르기 칩, 새 글·필독 배지, 더 보기로 20건씩 이어 붙는 목록.",
    createdAt: "2026-09-23",
  },
  {
    key: "store-inventory",
    project: "harness-test",
    viewports: ["web"],
    name: "매장 재고 조회",
    href: "/store-inventory",
    prompt:
      "매장 직원이 판매대에서 상품 재고를 확인하는 화면. 검색 칸·조회 버튼, 전체·품절·부족 거르기 칩, 상품명·규격·매장 재고·창고 재고·최근 입고일 표, 품절·부족 배지, 검색 전·결과 없음 안내.",
    createdAt: "2026-09-23",
  },
  {
    key: "store-inventory-2",
    project: "harness-test",
    viewports: ["web"],
    name: "매장 재고 조회",
    href: "/store-inventory-2",
    prompt:
      "매장 직원이 판매대에서 상품 재고를 확인하는 화면. 검색 칸·조회 버튼, 전체·품절·부족 거르기 칩, 상품명·규격·매장 재고·창고 재고·최근 입고일 표, 품절·부족 배지, 검색 전·결과 없음 안내. 개선: 데모 데이터도 넣어줘.",
    createdAt: "2026-09-23",
  },
  {
    key: "ai-work-assistant",
    project: "신주희-테스트",
    viewports: ["mobile", "tablet"],
    name: "업무 데이터 AI 어시스턴트",
    href: "/ai-work-assistant",
    prompt:
      "채팅창에 자연어로 질문하면 샘플 업무 데이터(점포·매출·계약·리뷰)로 답하는 AI 어시스턴트 프로토타입. 7가지 질문 유형별 응답 형태(수치·표·요약·데이터 없음·화면 이동 버튼), 텍스트 입력, 이미지 드래그앤드롭, 파일 첨부. 개선: 상세보기 눌렀는데 아무런 효과가 없음 확인해줘.",
    createdAt: "2026-09-23",
  },
  {
    key: "invoice-dashboard",
    project: "자동-송장-api",
    viewports: ["web"],
    name: "자동 송장 API 대시보드",
    href: "/invoice-dashboard",
    prompt: "자동 송장 API의 첫 화면. 오늘 발급·배송 중·배송 완료·예외 건수 요약과 최근 발급 송장 표, 송장 조회로 가는 버튼. (CJ 송장 조회 참고)",
    createdAt: "2026-09-24",
  },
  {
    key: "invoice-lookup",
    project: "자동-송장-api",
    viewports: ["web"],
    name: "자동 송장 API 송장 조회",
    href: "/invoice-lookup",
    prompt: "송장번호 한 칸으로 배송 상태를 찾는 조회 화면. 조회 폼과 결과 표, 결과 없음 안내. (CJ 송장 조회 참고)",
    createdAt: "2026-09-24",
  },
  {
    key: "invoice-detail",
    project: "자동-송장-api",
    viewports: ["web"],
    name: "자동 송장 API 송장 상세",
    href: "/invoice-detail",
    prompt: "송장 한 건의 배송 정보와 배송 이력을 보는 화면. 송장 조회로 돌아가는 링크. (CJ 송장 조회 참고)",
    createdAt: "2026-09-24",
  },
];
