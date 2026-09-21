/**
 * 지원요청 목록이 쓰는 예시 값이다.
 *
 * 화면을 눈으로 확인하려고 둔 값이며 실제 데이터가 아니다. 카테고리는 사장님 앱의 통합 작성 폼이
 * 가진 지원요청 카테고리와 같은 한 벌을 쓴다. 점주가 그 폼에서 고른 값이 그대로 이 목록에 서기
 * 때문이며, 두 자리의 목록이 갈리면 접수된 건이 어느 이름으로도 분류되지 않는다.
 */

/**
 * 처리상태다. 점주의 소리와 같은 셋을 쓴다.
 *
 * 지원요청의 실제 상태값을 아직 받지 못했다. 완료보고처럼 이 채널에만 있는 단계가 있으면 그때
 * 고친다.
 */
export const STATUS = {
  // 접수는 담당자가 아직 손대지 않은 건, 곧 지금 처리해야 할 업무다.
  recv: { label: "접수", tone: "warning" },
  prog: { label: "처리중", tone: "info" },
  done: { label: "처리완료", tone: "success" },
} as const;

export type RequestStatus = keyof typeof STATUS;

export type SupportRequest = {
  no: number;
  title: string;
  category: string;
  store: string;
  status: RequestStatus;
  /** 목록에는 날짜만 선다. 시각까지 넣으면 400px 한 줄에서 점포명이 먼저 말줄임된다. */
  createdAt: string;
  /**
   * 담당자가 아직 읽지 않은 채팅 수다.
   *
   * 지원요청은 상세에 채팅이 붙는 채널이라, 목록을 훑는 담당자가 먼저 찾는 것이 답을 기다리는
   * 건이다. 처리완료 건은 대화가 끝난 뒤라 0 으로 둔다.
   */
  unread: number;
};

export const REQUESTS: SupportRequest[] = [
  { no: 2384, title: "감자튀김 2박스가 들어오지 않았습니다", category: "배송·결품", store: "마천동점", status: "recv", createdAt: "2026-09-17", unread: 2 },
  { no: 2383, title: "튀김기 온도가 올라가지 않습니다", category: "기기·시설", store: "명동점", status: "recv", createdAt: "2026-09-17", unread: 0 },
  { no: 2382, title: "배달앱 주문이 포스로 넘어오지 않습니다", category: "배달", store: "아현점", status: "prog", createdAt: "2026-09-16", unread: 5 },
  { no: 2381, title: "이번 달 정산 금액이 맞지 않습니다", category: "발주·정산", store: "가재울점", status: "recv", createdAt: "2026-09-16", unread: 1 },
  { no: 2380, title: "사장님 앱에서 발주 화면이 열리지 않습니다", category: "앱 오류", store: "동의대역점", status: "prog", createdAt: "2026-09-15", unread: 3 },
  { no: 2379, title: "냉동 배송분이 녹아서 도착했습니다", category: "배송·결품", store: "부천원종점", status: "done", createdAt: "2026-09-15", unread: 0 },
  { no: 2378, title: "식용유에 거품이 심하게 올라옵니다", category: "제품 불량", store: "인천검단신도시점", status: "recv", createdAt: "2026-09-14", unread: 12 },
  { no: 2377, title: "간판 조명 절반이 들어오지 않습니다", category: "기기·시설", store: "수원행궁점", status: "prog", createdAt: "2026-09-14", unread: 0 },
  { no: 2376, title: "발주 마감 전에 넣은 건이 누락되었습니다", category: "발주·정산", store: "광주상무점", status: "done", createdAt: "2026-09-12", unread: 0 },
  { no: 2375, title: "배달 대행 배차가 한 시간째 잡히지 않습니다", category: "배달", store: "대구월배점", status: "done", createdAt: "2026-09-11", unread: 0 },
  { no: 2374, title: "단무지 소스통이 파손되어 왔습니다", category: "제품 불량", store: "마천동점", status: "done", createdAt: "2026-09-10", unread: 0 },
  { no: 2373, title: "로그인 후 매출현황이 비어 있습니다", category: "앱 오류", store: "명동점", status: "done", createdAt: "2026-09-09", unread: 0 },
  { no: 2372, title: "본사 방문 일정을 다시 잡고 싶습니다", category: "기타", store: "아현점", status: "done", createdAt: "2026-09-08", unread: 0 },
  { no: 2371, title: "포장 용기 뚜껑이 맞지 않습니다", category: "제품 불량", store: "가재울점", status: "done", createdAt: "2026-09-05", unread: 0 },
];

/** 필터가 고를 수 있는 값들이다. 「전체」는 그 축을 걸지 않은 상태다. */
export const ALL = "all";

export const CATEGORY_OPTIONS = [
  { value: ALL, label: "전체" },
  ...[...new Set(REQUESTS.map((request) => request.category))].map((category) => ({ value: category, label: category })),
];

export const STATUS_OPTIONS = [
  { value: ALL, label: "전체" },
  ...Object.entries(STATUS).map(([value, { label }]) => ({ value, label })),
];

export type RequestFilter = {
  category: string;
  status: string;
};

export const EMPTY_FILTER: RequestFilter = { category: ALL, status: ALL };

/**
 * 건 하나가 조건에 맞는지.
 *
 * 검색어는 여기에 들지 않는다. 조건은 목록에 무엇을 담을지 정하는 자리이고, 검색은 이미 담긴
 * 목록 안에서 한 건을 집어내는 자리라 층이 다르다.
 */
export function matches(request: SupportRequest, filter: RequestFilter) {
  if (filter.category !== ALL && request.category !== filter.category) return false;
  return filter.status === ALL || request.status === filter.status;
}

/** 담긴 목록 안에서 제목으로 한 건을 집어낸다. */
export function found(request: SupportRequest, keyword: string) {
  const word = keyword.trim();
  return word === "" || request.title.includes(word);
}
