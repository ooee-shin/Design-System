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
  /** 그 점포를 맡은 SV 다. 점포가 정해지면 따라오는 값이라 행마다 적지 않고 짝에서 끌어온다. */
  sv: string;
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

/**
 * 점포와 그 점포를 맡은 SV 의 짝이다. 점주의 소리 화면이 쓰는 짝과 같게 두었다. 같은 점포를 두
 * 화면이 서로 다른 담당자로 보여 주면 어느 쪽이 맞는지 화면에서 가릴 수 없다.
 */
const SV_BY_STORE: Record<string, string> = {
  마천동점: "박지우",
  아현점: "한지훈",
  명동점: "최은영",
  가재울점: "오세진",
  동의대역점: "이서준",
  부천원종점: "김도현",
  인천검단신도시점: "윤가람",
  수원행궁점: "서지호",
  광주상무점: "임채원",
  대구월배점: "배수현",
};

const ROWS: Omit<SupportRequest, "sv">[] = [
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
  { no: 2358, title: "포스 결제 단말이 자주 멈춥니다", category: "기기·시설", store: "동의대역점", status: "done", createdAt: "2026-08-19", unread: 0 },
  { no: 2349, title: "여름 성수기 발주 한도를 넘겼습니다", category: "발주·정산", store: "부천원종점", status: "done", createdAt: "2026-07-28", unread: 0 },
  { no: 2331, title: "배달 리뷰 이벤트 쿠폰이 적용되지 않습니다", category: "배달", store: "수원행궁점", status: "done", createdAt: "2026-06-11", unread: 0 },
  { no: 2310, title: "냉장고 문 패킹이 떨어졌습니다", category: "기기·시설", store: "광주상무점", status: "done", createdAt: "2026-04-30", unread: 0 },
  { no: 2294, title: "정산서에 지난달 차감분이 그대로 남아 있습니다", category: "발주·정산", store: "대구월배점", status: "done", createdAt: "2026-03-18", unread: 0 },
];

export const REQUESTS: SupportRequest[] = ROWS.map((row) => ({ ...row, sv: SV_BY_STORE[row.store] }));

/** 예시 데이터의 등록일이 과거이므로 오늘을 고정해 둔다. 기간 조건이 이 날을 기준으로 걸린다. */
const TODAY = "2026-09-21";

export const CUSTOM = "custom";

export const PERIOD_OPTIONS = [
  { value: "1m", label: "1개월" },
  { value: "3m", label: "3개월" },
  { value: "6m", label: "6개월" },
  { value: CUSTOM, label: "직접 선택" },
];

const PERIOD_MONTHS: Record<string, number> = { "1m": 1, "3m": 3, "6m": 6 };

/** 기간 조건이 훑는 구간이다. 직접 선택에서 두 날을 아직 고르지 않았으면 기간을 걸지 않는다. */
function periodRange(filter: RequestFilter): [string, string] | null {
  if (filter.period === CUSTOM) return filter.from && filter.to ? [filter.from, filter.to] : null;
  const months = PERIOD_MONTHS[filter.period];
  if (months === undefined) return null;
  const start = new Date(`${TODAY}T00:00:00`);
  start.setMonth(start.getMonth() - months);
  return [start.toISOString().slice(0, 10), TODAY];
}

/**
 * 필터가 고를 수 있는 값들이다.
 *
 * 「전체」를 값으로 두지 않는다. 두 축 모두 여러 값을 고를 수 있으므로, 아무것도 고르지 않은
 * 상태가 곧 전체다. 목록에 「전체」를 함께 두면 그것을 고른 상태와 아무것도 고르지 않은 상태가
 * 같은 뜻인데 화면에는 둘로 보인다.
 */
export const CATEGORY_OPTIONS = [...new Set(REQUESTS.map((request) => request.category))].map((category) => ({
  value: category,
  label: category,
}));

export const STATUS_OPTIONS = Object.entries(STATUS).map(([value, { label }]) => ({ value, label }));

/**
 * 점포와 그 점포가 선 지역이다. 점주의 소리 화면이 쓰는 값과 같다.
 *
 * 실제 점포는 천 곳을 넘어 한 목록에 늘어놓을 수 없으므로, 고르는 자리는 지역을 먼저 옮겨 다니는
 * 두 단으로 만든다. 예시가 열 곳뿐이어도 구조는 실제 규모를 따른다.
 */
export const STORES = [
  { name: "마천동점", region: "서울" },
  { name: "아현점", region: "서울" },
  { name: "명동점", region: "서울" },
  { name: "가재울점", region: "서울" },
  { name: "동의대역점", region: "부산" },
  { name: "부천원종점", region: "경기" },
  { name: "인천검단신도시점", region: "인천" },
  { name: "수원행궁점", region: "경기" },
  { name: "광주상무점", region: "광주" },
  { name: "대구월배점", region: "대구" },
];

export const REGIONS = [...new Set(STORES.map((store) => store.region))];

/** 그 지역에 선 점포들이다. */
export function storesIn(region: string) {
  return STORES.filter((store) => store.region === region).map((store) => store.name);
}

/** 점포명으로 그 점포가 선 지역을 찾는다. 검색 결과마다 어느 지역인지 붙일 때 쓴다. */
export function regionOf(name: string) {
  return STORES.find((store) => store.name === name)?.region ?? "";
}

/**
 * SV 가 속한 팀이다. 담당 SV 를 고를 때 한 단계 위에서 팀이 먼저 보인다.
 *
 * 담당자를 찾는 사람이 이름부터 아는 경우는 드물다. 「수도권 1팀이 맡은 건」처럼 팀으로 먼저
 * 좁히고 그 안에서 사람을 고르는 것이 실제 순서이므로, 열 명을 한 줄로 늘어놓지 않고 팀으로 묶는다.
 * 팀 구분은 담당 지역을 따른다.
 */
export const SV_GROUPS = [
  { label: "수도권 1팀", options: ["박지우", "한지훈", "최은영", "오세진"] },
  { label: "수도권 2팀", options: ["김도현", "윤가람", "서지호"] },
  { label: "영남·호남팀", options: ["이서준", "임채원", "배수현"] },
].map((team) => ({ label: team.label, options: team.options.map((sv) => ({ value: sv, label: sv })) }));

/**
 * 로그인한 사람이 맡은 점포다.
 *
 * 예시 값이다. 제품에서는 로그인한 사람의 담당 점포에서 오며, 화면이 목록으로 들고 있을 값이
 * 아니다. 관리자는 전부를 보고 SV 는 자기 점포만 보는 것이 기본이므로, 이 토글은 관리자가 자기가
 * 맡은 곳만 잠깐 좁혀 보는 자리다.
 */
export const MY_STORES = ["마천동점", "명동점", "아현점"];

export const SORT_OPTIONS = [{ value: "latest", label: "최신순" }];

export type RequestFilter = {
  /** `1m`·`3m`·`6m` 가운데 하나이거나 직접 선택이다. */
  period: string;
  /** 직접 선택일 때의 두 날이다. 고르기 전에는 비어 있다. */
  from: string;
  to: string;
  /** 고른 값이 없으면 그 축을 걸지 않는다. */
  category: string[];
  status: string[];
  store: string[];
  sv: string[];
};

// 들어왔을 때 1 개월이다. 지원요청은 지금 처리해야 할 건을 찾는 목록이라, 기본으로 훑는 구간이
// 넓으면 이미 끝난 건이 최근 건과 섞인다.
export const EMPTY_FILTER: RequestFilter = { period: "1m", from: "", to: "", category: [], status: [], store: [], sv: [] };

/**
 * 건 하나가 조건에 맞는지.
 *
 * 검색어는 여기에 들지 않는다. 조건은 목록에 무엇을 담을지 정하는 자리이고, 검색은 이미 담긴
 * 목록 안에서 한 건을 집어내는 자리라 층이 다르다.
 */
export function matches(request: SupportRequest, filter: RequestFilter) {
  const range = periodRange(filter);
  if (range && (request.createdAt < range[0] || request.createdAt > range[1])) return false;
  if (filter.category.length > 0 && !filter.category.includes(request.category)) return false;
  if (filter.store.length > 0 && !filter.store.includes(request.store)) return false;
  if (filter.sv.length > 0 && !filter.sv.includes(request.sv)) return false;
  return filter.status.length === 0 || filter.status.includes(request.status);
}

/** 담긴 목록 안에서 제목으로 한 건을 집어낸다. */
export function found(request: SupportRequest, keyword: string) {
  const word = keyword.trim();
  return word === "" || request.title.includes(word);
}
