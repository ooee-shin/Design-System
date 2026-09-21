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
 */
export const SANDBOX_PROJECTS = [
  { id: "admin", name: "관리자 웹", description: "본사 담당자가 쓰는 웹입니다." },
  { id: "sto", name: "STO", description: "점주와 매장 직원이 쓰는 앱입니다." },
  { id: "hr", name: "인사·급여", description: "근태·연차·정산과 그 발행을 다룹니다." },
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
    project: "admin",
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
    project: "admin",
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
    project: "hr",
    name: "출퇴근 찍기",
    href: "/attendance-kiosk",
    prompt:
      "매장 입구 태블릿의 출퇴근 화면. 머리글에 매장명·날짜·시각, 근무 중/대기 중 두 덩이에 직원 칸과 퇴근하기·출근하기 버튼.",
    createdAt: "2026-09-17",
  },
  {
    key: "attendance-payroll",
    project: "hr",
    name: "근태·급여 정산",
    href: "/attendance-payroll",
    prompt:
      "점주·본사 담당자가 기간을 골라 직원별 근무 시간과 급여를 확인하는 태블릿 화면. 기간·매장 필터, 내보내기, 요약, 표, 페이지 이동.",
    createdAt: "2026-09-17",
  },
  {
    key: "annual-leave",
    project: "hr",
    name: "연차 관리",
    href: "/annual-leave",
    prompt:
      "매장 관리자가 직원들의 연차를 확인하고 신청 내역을 보는 태블릿 가로 화면. 연도·이름 검색, 왼쪽 직원 목록, 오른쪽 잔여·사용·총 연차 요약과 신청 내역 표, 페이지 이동.",
    createdAt: "2026-09-21",
  },
  {
    key: "tax-invoice",
    project: "hr",
    name: "세금계산서 발행",
    href: "/tax-invoice",
    prompt:
      "본사 담당자가 매장 × 고용형태별 월 인건비를 세금계산서로 발행하는 태블릿 가로 화면. 연월·발행 상태·고용형태 거르개, 줄마다 고르기 체크박스를 가진 표, 고른 건수·합계와 고용형태별 합계, 발행 버튼.",
    createdAt: "2026-09-21",
  },
  {
    key: "excel-export",
    project: "hr",
    name: "엑셀 내려받기",
    href: "/excel-export",
    prompt:
      "본사 담당자가 엑셀로 내려받기 전에 담을 것을 고르는 태블릿 가로 화면. 왼쪽에 자료 종류·기간·매장·담을 항목, 오른쪽에 내려받을 줄 수와 세 줄 미리보기 표, 엑셀 내려받기 버튼.",
    createdAt: "2026-09-21",
  },
  {
    key: "weekly-schedule",
    project: "hr",
    name: "스케줄 관리",
    href: "/weekly-schedule",
    prompt:
      "매장 관리자가 한 주의 근무표를 짜고 인건비를 미리 보는 태블릿 가로 화면. 매장·주 고르기와 주 합계, 요일×직원 근무표와 가산 배지, 근로기준법 제56조 가산 규칙 줄.",
    createdAt: "2026-09-21",
  },
];
