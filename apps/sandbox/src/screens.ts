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
];
