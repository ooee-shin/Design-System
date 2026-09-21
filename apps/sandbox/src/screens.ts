/**
 * `/generate-code` 가 만든 화면의 목록이다. 첫 화면 `/` 가 이 목록을 그린다.
 *
 * 화면을 더할 때 여기에 한 줄을 더한다. `prompt` 는 그 화면을 만들 때 준 요청을 한 줄로 줄인 것이고,
 * `source` 는 대조할 원본이 있으면 그 경로다. 원본이 없는 기획자 요청은 `source` 를 두지 않는다.
 */
export type SandboxScreen = {
  key: string;
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
    name: "관리자 로그인",
    href: "/admin-login",
    prompt:
      "블루키 관리자 웹 로그인 화면. 데스크톱 1440 좌우 절반, 왼쪽 로그인 폼(아이디·비밀번호·아이디 저장·비밀번호 찾기·로그인)과 Footer, 오른쪽 브랜드 패널 자리는 비워 둠.",
    source: "apps/studio/src/app/screens/admin/login/page.tsx",
    createdAt: "2026-09-14",
  },
  {
    key: "sto-support-request",
    name: "STO 지원요청",
    href: "/sto-support-request",
    prompt: "STO 사장님 앱의 지원요청 폼 한 장. 요청 유형·매장·제목·내용·사진 첨부·연락 가능 시간·긴급 요청 여부.",
    createdAt: "2026-09-14",
  },
  {
    key: "voc",
    name: "고객의 소리",
    href: "/voc",
    prompt: "블루키 관리자 웹의 고객의 소리 화면. 필터·상태 칩·표·상세 답변 패널·페이지 이동.",
    createdAt: "2026-09-15",
  },
  {
    key: "sto-my-page",
    name: "사용자 마이페이지",
    href: "/sto-my-page",
    prompt:
      "STO 사장님 앱의 마이페이지. 아이디·비밀번호·점포·이름·권한을 보여 주고, 수정 가능한 비밀번호만 현재 비밀번호를 확인해 조회한다.",
    createdAt: "2026-09-16",
  },
  {
    key: "attendance-kiosk",
    name: "출퇴근 찍기",
    href: "/attendance-kiosk",
    prompt:
      "매장 입구 태블릿의 출퇴근 화면. 머리글에 매장명·날짜·시각, 근무 중/대기 중 두 덩이에 직원 칸과 퇴근하기·출근하기 버튼.",
    createdAt: "2026-09-17",
  },
  {
    key: "attendance-payroll",
    name: "근태·급여 정산",
    href: "/attendance-payroll",
    prompt:
      "점주·본사 담당자가 기간을 골라 직원별 근무 시간과 급여를 확인하는 태블릿 화면. 기간·매장 필터, 내보내기, 요약, 표, 페이지 이동.",
    createdAt: "2026-09-17",
  },
  {
    key: "annual-leave",
    name: "연차 관리",
    href: "/annual-leave",
    prompt:
      "매장 관리자가 직원들의 연차를 확인하고 신청 내역을 보는 태블릿 가로 화면. 연도·이름 검색, 왼쪽 직원 목록, 오른쪽 잔여·사용·총 연차 요약과 신청 내역 표, 페이지 이동.",
    createdAt: "2026-09-21",
  },
  {
    key: "tax-invoice",
    name: "세금계산서 발행",
    href: "/tax-invoice",
    prompt:
      "본사 담당자가 매장별 월 인건비를 세금계산서로 발행하는 태블릿 가로 화면. 연월·발행 상태 거르개, 고르기 체크박스를 가진 표, 고른 건수와 합계 금액, 발행 버튼.",
    createdAt: "2026-09-21",
  },
];
