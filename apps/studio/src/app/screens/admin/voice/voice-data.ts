/**
 * 점주의 소리 목록이 쓰는 예시 값과 거르는 규칙이다.
 *
 * 필터를 어디에 세울지 두 안을 나란히 보고 있다. 안이 달라도 목록에 담기는 것과 거르는 규칙은
 * 같으므로 이 파일이 그 둘을 갖고, 각 화면은 조건을 어떻게 보여 줄지만 갖는다.
 *
 * 화면에 보이는 값은 눈으로 확인하려고 둔 예시이며 실제로 서버에서 오지 않는다.
 */

/** 기간을 거르는 기준일이다. 예시 데이터의 등록일이 과거 날짜이므로 오늘을 고정해 둔다. */
const TODAY = "2026-09-17";

// 처리상태는 기존 셋을 그대로 쓴다. 이번 작업이 상태값을 건드리지 않기 때문이다. 전환은 상태가
// 아니라 표시이므로 이 표에 넣지 않고 따로 붙인다.
export const STATUS = {
  recv: { label: "접수", tone: "neutral" },
  prog: { label: "처리중", tone: "info" },
  done: { label: "처리완료", tone: "success" },
} as const;

export const SOURCE = {
  direct: "직접 등록",
  request_transfer: "지원요청 전환",
} as const;

export const CATEGORIES = ["운영 관련", "메뉴 관련", "물류 관련", "마케팅 및 프로모션", "사장님 앱 관련", "기타"];

/**
 * 담당 SV 와 그 사람이 속한 팀이다.
 *
 * 이름은 지어낸 것이다. 받은 프로토타입에는 실제 직원 이름이 들어 있어 바꿨고, 팀은 다섯으로
 * 나눴다. 뒤에 만들 화면들도 이 목록을 쓴다.
 */
export const TEAMS = ["1팀", "2팀", "3팀", "4팀", "5팀"];

export const SUPERVISORS = [
  { name: "김도현", team: "1팀" },
  { name: "이서준", team: "1팀" },
  { name: "박지우", team: "2팀" },
  { name: "최은영", team: "2팀" },
  { name: "한지훈", team: "3팀" },
  { name: "오세진", team: "3팀" },
  { name: "윤가람", team: "4팀" },
  { name: "서지호", team: "4팀" },
  { name: "임채원", team: "5팀" },
  { name: "배수현", team: "5팀" },
];

/** 이름으로 그 사람의 팀을 찾는다. */
export function teamOf(name: string) {
  return SUPERVISORS.find((person) => person.name === name)?.team ?? "";
}

/** 팀 하나에 속한 사람들의 이름이다. */
export function membersOf(team: string) {
  return SUPERVISORS.filter((person) => person.team === team).map((person) => person.name);
}

export type VoiceStatus = keyof typeof STATUS;
export type VoiceSource = keyof typeof SOURCE;

export type Voice = {
  no: number;
  store: string;
  sv: string;
  category: string;
  title: string;
  attached: boolean;
  status: VoiceStatus;
  source: VoiceSource;
  createdAt: string;
  /** 답변은 1회만 등록된다. 아직 없으면 `null` 이다. */
  answeredAt: string | null;
  /** 지원요청으로 옮겨진 건이면 그 지원요청 번호다. */
  movedTo?: number;
};

export const VOICES: Voice[] = [
  { no: 326, store: "마천동점", sv: "박지우", category: "메뉴 관련", title: "신메뉴 시식 일정을 지역별로 나눠 주세요", attached: false, status: "recv", source: "direct", createdAt: "2026-09-16 09:08", answeredAt: null },
  { no: 325, store: "아현점", sv: "한지훈", category: "물류 관련", title: "발주 마감 시간을 한 시간 늦춰 주세요", attached: false, status: "done", source: "direct", createdAt: "2026-09-15 19:00", answeredAt: "2026-09-24 10:55" },
  { no: 324, store: "명동점", sv: "최은영", category: "운영 관련", title: "본사 방문 일정을 미리 공지해 주세요", attached: false, status: "recv", source: "direct", createdAt: "2026-09-14 13:01", answeredAt: null },
  { no: 323, store: "가재울점", sv: "오세진", category: "물류 관련", title: "식용유에 거품이 심하게 올라옵니다", attached: true, status: "recv", source: "direct", createdAt: "2026-09-14 18:28", answeredAt: null },
  { no: 322, store: "동의대역점", sv: "이서준", category: "사장님 앱 관련", title: "앱에서 바로 문의할 수 있게 해 주세요", attached: false, status: "recv", source: "direct", createdAt: "2026-09-12 17:26", answeredAt: null },
  { no: 321, store: "부천원종점", sv: "김도현", category: "사장님 앱 관련", title: "직원 계정 권한을 나눠 주세요", attached: false, status: "recv", source: "direct", createdAt: "2026-09-11 19:38", answeredAt: null },
  { no: 320, store: "인천검단신도시점", sv: "윤가람", category: "사장님 앱 관련", title: "정산 내역을 엑셀로 내려받게 해 주세요", attached: false, status: "recv", source: "direct", createdAt: "2026-09-05 20:05", answeredAt: null },
  { no: 319, store: "수원행궁점", sv: "서지호", category: "기타", title: "가맹비 정책 설명회를 열어 주세요", attached: false, status: "recv", source: "direct", createdAt: "2026-09-03 16:49", answeredAt: null },
  { no: 318, store: "광주상무점", sv: "임채원", category: "운영 관련", title: "운영 매뉴얼 개정 시 변경분만 따로 알려 주세요", attached: true, status: "done", source: "direct", createdAt: "2026-09-01 10:37", answeredAt: "2026-09-04 09:07" },
  { no: 317, store: "대구월배점", sv: "배수현", category: "물류 관련", title: "재고 부족 알림을 앱에서 받게 해 주세요", attached: true, status: "recv", source: "direct", createdAt: "2026-08-31 10:11", answeredAt: null },
  { no: 316, store: "마천동점", sv: "박지우", category: "운영 관련", title: "본사 담당자 연락 창구를 하나로 모아 주세요", attached: true, status: "recv", source: "direct", createdAt: "2026-08-30 17:39", answeredAt: null },
  { no: 315, store: "아현점", sv: "한지훈", category: "물류 관련", title: "배송 시간대를 매장이 고를 수 있게 해 주세요", attached: false, status: "prog", source: "direct", createdAt: "2026-08-27 15:57", answeredAt: null },
  { no: 314, store: "명동점", sv: "최은영", category: "물류 관련", title: "단무지 소스통이 파손되어 왔습니다", attached: true, status: "recv", source: "direct", createdAt: "2026-08-26 15:56", answeredAt: null, movedTo: 2365 },
  { no: 313, store: "가재울점", sv: "오세진", category: "메뉴 관련", title: "비건 메뉴를 하나라도 두었으면 합니다", attached: false, status: "prog", source: "direct", createdAt: "2026-08-24 21:47", answeredAt: null },
  { no: 312, store: "동의대역점", sv: "이서준", category: "물류 관련", title: "배송 기사 교체 시 매장에 알려 주세요", attached: false, status: "recv", source: "direct", createdAt: "2026-08-22 10:27", answeredAt: null },
  { no: 311, store: "부천원종점", sv: "김도현", category: "물류 관련", title: "지역 물류 거점을 늘려 주세요", attached: false, status: "done", source: "direct", createdAt: "2026-08-21 09:28", answeredAt: "2026-08-27 14:12" },
  { no: 310, store: "인천검단신도시점", sv: "윤가람", category: "마케팅 및 프로모션", title: "지역 상권 전단 제작을 지원해 주세요", attached: false, status: "recv", source: "direct", createdAt: "2026-08-21 12:23", answeredAt: null },
  { no: 309, store: "수원행궁점", sv: "서지호", category: "운영 관련", title: "점포 평가 기준을 공개해 주셨으면 합니다", attached: false, status: "recv", source: "direct", createdAt: "2026-08-21 20:53", answeredAt: null },
  { no: 308, store: "광주상무점", sv: "임채원", category: "메뉴 관련", title: "디저트 메뉴 도입을 검토해 주세요", attached: true, status: "recv", source: "request_transfer", createdAt: "2026-08-19 20:52", answeredAt: null },
  { no: 307, store: "대구월배점", sv: "배수현", category: "마케팅 및 프로모션", title: "리뷰 이벤트를 상시로 바꿔 주세요", attached: true, status: "prog", source: "direct", createdAt: "2026-08-19 13:28", answeredAt: null },
  { no: 306, store: "마천동점", sv: "박지우", category: "마케팅 및 프로모션", title: "시즌 쿠폰을 매장이 발행하게 해 주세요", attached: true, status: "prog", source: "direct", createdAt: "2026-08-10 21:11", answeredAt: null },
  { no: 305, store: "아현점", sv: "한지훈", category: "메뉴 관련", title: "가을 신메뉴로 국물 떡볶이를 제안합니다", attached: false, status: "done", source: "direct", createdAt: "2026-08-07 11:31", answeredAt: "2026-08-12 17:55" },
  { no: 304, store: "명동점", sv: "최은영", category: "마케팅 및 프로모션", title: "인플루언서 협업을 지역 단위로도 해 주세요", attached: true, status: "recv", source: "direct", createdAt: "2026-08-03 16:22", answeredAt: null },
  { no: 303, store: "가재울점", sv: "오세진", category: "운영 관련", title: "위생 점검 주기를 분기로 조정했으면 합니다", attached: false, status: "prog", source: "direct", createdAt: "2026-07-29 22:36", answeredAt: null },
  { no: 302, store: "동의대역점", sv: "이서준", category: "사장님 앱 관련", title: "자주 쓰는 발주 품목을 즐겨찾기로 두게 해 주세요", attached: true, status: "recv", source: "direct", createdAt: "2026-07-22 17:56", answeredAt: null },
  { no: 301, store: "부천원종점", sv: "김도현", category: "마케팅 및 프로모션", title: "첫 방문 고객 할인 제도를 만들어 주세요", attached: false, status: "done", source: "request_transfer", createdAt: "2026-07-20 15:54", answeredAt: "2026-07-27 13:25" },
  { no: 300, store: "인천검단신도시점", sv: "윤가람", category: "메뉴 관련", title: "사이드 메뉴에 튀김 종류를 늘려 주세요", attached: false, status: "recv", source: "direct", createdAt: "2026-07-18 11:49", answeredAt: null },
  { no: 299, store: "수원행궁점", sv: "서지호", category: "물류 관련", title: "성수기 발주 한도를 늘려 주세요", attached: false, status: "recv", source: "direct", createdAt: "2026-07-14 19:31", answeredAt: null },
  { no: 298, store: "광주상무점", sv: "임채원", category: "운영 관련", title: "아르바이트 채용을 본사가 함께 지원했으면 합니다", attached: false, status: "recv", source: "direct", createdAt: "2026-07-13 11:49", answeredAt: null },
  { no: 297, store: "대구월배점", sv: "배수현", category: "마케팅 및 프로모션", title: "지역 축제 부스 참가를 지원해 주세요", attached: true, status: "recv", source: "request_transfer", createdAt: "2026-07-12 10:15", answeredAt: null },
  { no: 296, store: "마천동점", sv: "박지우", category: "물류 관련", title: "품절 예상 품목을 미리 알려 주세요", attached: false, status: "recv", source: "direct", createdAt: "2026-07-07 14:46", answeredAt: null },
  { no: 295, store: "아현점", sv: "한지훈", category: "메뉴 관련", title: "밀키트 출시를 제안합니다", attached: true, status: "prog", source: "direct", createdAt: "2026-06-26 14:25", answeredAt: null },
  { no: 294, store: "명동점", sv: "최은영", category: "마케팅 및 프로모션", title: "리뷰 답변 문구를 본사에서 제공해 주세요", attached: true, status: "prog", source: "direct", createdAt: "2026-06-23 10:01", answeredAt: null },
  { no: 293, store: "가재울점", sv: "오세진", category: "사장님 앱 관련", title: "공지 푸시를 종류별로 나눠 주세요", attached: true, status: "recv", source: "direct", createdAt: "2026-06-15 12:15", answeredAt: null },
  { no: 292, store: "동의대역점", sv: "이서준", category: "메뉴 관련", title: "인기 없는 메뉴를 정리하는 기준을 알려 주세요", attached: false, status: "recv", source: "direct", createdAt: "2026-06-09 19:09", answeredAt: null },
  { no: 291, store: "부천원종점", sv: "김도현", category: "사장님 앱 관련", title: "매출을 전년 같은 달과 비교해 보여 주세요", attached: false, status: "recv", source: "direct", createdAt: "2026-06-06 10:11", answeredAt: null },
  { no: 290, store: "인천검단신도시점", sv: "윤가람", category: "운영 관련", title: "점포별 목표 매출 산정 방식을 설명해 주세요", attached: true, status: "prog", source: "direct", createdAt: "2026-06-06 16:51", answeredAt: null },
  { no: 289, store: "수원행궁점", sv: "서지호", category: "운영 관련", title: "계약 갱신 안내를 두 달 전에 보내 주세요", attached: false, status: "prog", source: "direct", createdAt: "2026-06-05 12:45", answeredAt: null },
  { no: 288, store: "광주상무점", sv: "임채원", category: "기타", title: "주차 안내 스티커 제작을 지원해 주세요", attached: false, status: "prog", source: "direct", createdAt: "2026-06-04 10:52", answeredAt: null },
  { no: 287, store: "대구월배점", sv: "배수현", category: "메뉴 관련", title: "1인 메뉴 구성을 늘려 주세요", attached: false, status: "done", source: "direct", createdAt: "2026-06-04 11:27", answeredAt: "2026-06-10 09:45" },
  { no: 286, store: "마천동점", sv: "박지우", category: "마케팅 및 프로모션", title: "연예인 마케팅을 했으면 좋겠어요", attached: false, status: "recv", source: "direct", createdAt: "2026-06-03 12:32", answeredAt: null },
  { no: 285, store: "아현점", sv: "한지훈", category: "운영 관련", title: "신규 점주 교육에 실무 사례를 넣어 주세요", attached: false, status: "done", source: "direct", createdAt: "2026-05-19 09:26", answeredAt: "2026-05-21 15:55" },
  { no: 284, store: "명동점", sv: "최은영", category: "기타", title: "점주 커뮤니티를 운영해 주세요", attached: false, status: "done", source: "direct", createdAt: "2026-05-07 19:06", answeredAt: "2026-05-14 11:37" },
  { no: 283, store: "가재울점", sv: "오세진", category: "기타", title: "본사 조직도를 공개해 주셨으면 합니다", attached: false, status: "prog", source: "direct", createdAt: "2026-04-23 19:41", answeredAt: null },
  { no: 282, store: "동의대역점", sv: "이서준", category: "마케팅 및 프로모션", title: "포토존 설치를 지원해 주셨으면 합니다", attached: false, status: "done", source: "request_transfer", createdAt: "2026-04-23 13:40", answeredAt: "2026-04-25 12:04" },
  { no: 281, store: "부천원종점", sv: "김도현", category: "기타", title: "우수 점포 포상 제도를 만들어 주세요", attached: false, status: "prog", source: "direct", createdAt: "2026-04-19 13:25", answeredAt: null },
  { no: 280, store: "인천검단신도시점", sv: "윤가람", category: "사장님 앱 관련", title: "매출 그래프에 기간 선택을 더해 주세요", attached: false, status: "done", source: "direct", createdAt: "2026-04-13 19:19", answeredAt: "2026-04-15 15:21" },
  { no: 279, store: "수원행궁점", sv: "서지호", category: "물류 관련", title: "소분 포장 단위를 매장 규모에 맞게 나눠 주세요", attached: true, status: "recv", source: "direct", createdAt: "2026-04-12 09:22", answeredAt: null },
  { no: 278, store: "광주상무점", sv: "임채원", category: "사장님 앱 관련", title: "주문 내역 검색 기간을 늘려 주세요", attached: false, status: "recv", source: "direct", createdAt: "2026-04-11 18:35", answeredAt: null },
  { no: 277, store: "대구월배점", sv: "배수현", category: "기타", title: "점주 간담회를 정례화해 주세요", attached: false, status: "done", source: "direct", createdAt: "2026-04-09 09:19", answeredAt: "2026-04-18 16:05" },
  { no: 276, store: "마천동점", sv: "박지우", category: "운영 관련", title: "유니폼 디자인을 계절에 맞게 나눠 주세요", attached: false, status: "prog", source: "direct", createdAt: "2026-04-04 09:50", answeredAt: null },
  { no: 275, store: "아현점", sv: "한지훈", category: "마케팅 및 프로모션", title: "굿즈 제작을 검토해 주세요", attached: false, status: "recv", source: "direct", createdAt: "2026-04-03 22:51", answeredAt: null },
  { no: 274, store: "명동점", sv: "최은영", category: "물류 관련", title: "포장재를 친환경 재질로 바꾸는 것을 검토해 주세요", attached: true, status: "done", source: "direct", createdAt: "2026-03-29 22:13", answeredAt: "2026-04-05 15:44" },
  { no: 273, store: "가재울점", sv: "오세진", category: "운영 관련", title: "인수인계 서식을 전 매장 공통으로 통일해 주세요", attached: false, status: "done", source: "direct", createdAt: "2026-03-28 20:00", answeredAt: "2026-04-05 09:27" },
  { no: 272, store: "동의대역점", sv: "이서준", category: "운영 관련", title: "직원 교육 자료를 최신 내용으로 갱신해 주세요", attached: false, status: "done", source: "direct", createdAt: "2026-03-24 20:14", answeredAt: "2026-03-26 13:36" },
  { no: 271, store: "부천원종점", sv: "김도현", category: "기타", title: "본사 공지 알림이 늦게 옵니다", attached: false, status: "done", source: "direct", createdAt: "2026-03-23 14:15", answeredAt: "2026-03-26 16:06" },
  { no: 270, store: "인천검단신도시점", sv: "윤가람", category: "마케팅 및 프로모션", title: "SNS 홍보 이미지를 매장용으로 제공해 주세요", attached: false, status: "recv", source: "direct", createdAt: "2026-03-22 14:49", answeredAt: null },
  { no: 269, store: "수원행궁점", sv: "서지호", category: "메뉴 관련", title: "소스 종류를 매장이 고를 수 있게 해 주세요", attached: false, status: "recv", source: "direct", createdAt: "2026-03-13 21:18", answeredAt: null },
  { no: 268, store: "광주상무점", sv: "임채원", category: "운영 관련", title: "야간 운영 시간 조정을 건의합니다", attached: false, status: "done", source: "request_transfer", createdAt: "2026-03-13 19:50", answeredAt: "2026-03-22 13:48" },
  { no: 267, store: "대구월배점", sv: "배수현", category: "메뉴 관련", title: "음료 라인업에 무가당 제품을 넣어 주세요", attached: false, status: "recv", source: "direct", createdAt: "2026-03-13 17:39", answeredAt: null },
  { no: 266, store: "마천동점", sv: "박지우", category: "마케팅 및 프로모션", title: "브랜드 광고를 지상파에도 내주세요", attached: false, status: "prog", source: "direct", createdAt: "2026-03-09 20:21", answeredAt: null },
  { no: 265, store: "아현점", sv: "한지훈", category: "사장님 앱 관련", title: "앱 알림을 시간대로 제한할 수 있게 해 주세요", attached: true, status: "done", source: "direct", createdAt: "2026-03-04 21:57", answeredAt: "2026-03-11 10:55" },
  { no: 264, store: "명동점", sv: "최은영", category: "사장님 앱 관련", title: "알림 설정이 저장되도록 개선해 주세요", attached: false, status: "prog", source: "direct", createdAt: "2026-02-15 22:42", answeredAt: null },
  { no: 263, store: "가재울점", sv: "오세진", category: "사장님 앱 관련", title: "앱에 어두운 화면 모드를 넣어 주세요", attached: false, status: "recv", source: "direct", createdAt: "2026-02-13 20:16", answeredAt: null },
  { no: 262, store: "동의대역점", sv: "이서준", category: "메뉴 관련", title: "메뉴판 사진을 계절마다 갱신해 주세요", attached: false, status: "recv", source: "direct", createdAt: "2026-02-03 12:55", answeredAt: null },
  { no: 261, store: "부천원종점", sv: "김도현", category: "메뉴 관련", title: "어린이 메뉴를 만들어 주셨으면 합니다", attached: false, status: "prog", source: "direct", createdAt: "2026-01-31 13:39", answeredAt: null },
  { no: 260, store: "인천검단신도시점", sv: "윤가람", category: "물류 관련", title: "부자재를 낱개로도 받을 수 있게 해 주세요", attached: false, status: "done", source: "direct", createdAt: "2026-01-30 12:57", answeredAt: "2026-02-01 17:17" },
  { no: 259, store: "수원행궁점", sv: "서지호", category: "마케팅 및 프로모션", title: "배달앱 광고비를 본사와 나눠 부담했으면 합니다", attached: true, status: "done", source: "direct", createdAt: "2026-01-29 12:48", answeredAt: "2026-02-05 13:49" },
  { no: 258, store: "광주상무점", sv: "임채원", category: "메뉴 관련", title: "시즌 한정 메뉴를 분기마다 내주세요", attached: false, status: "recv", source: "direct", createdAt: "2026-01-16 09:37", answeredAt: null },
  { no: 257, store: "대구월배점", sv: "배수현", category: "운영 관련", title: "휴무일 등록 절차를 간소화해 주세요", attached: false, status: "done", source: "direct", createdAt: "2026-01-15 19:06", answeredAt: "2026-01-17 17:50" },
  { no: 256, store: "마천동점", sv: "박지우", category: "물류 관련", title: "배송 주기를 주 3회로 늘려 주세요", attached: false, status: "prog", source: "direct", createdAt: "2026-01-15 15:50", answeredAt: null },
  { no: 255, store: "아현점", sv: "한지훈", category: "기타", title: "상권 분석 자료를 매장에 공유해 주세요", attached: true, status: "done", source: "direct", createdAt: "2026-01-11 09:49", answeredAt: "2026-01-20 15:53" },
  { no: 254, store: "명동점", sv: "최은영", category: "물류 관련", title: "반품 절차를 간소화해 주셨으면 합니다", attached: false, status: "prog", source: "direct", createdAt: "2026-01-08 17:25", answeredAt: null },
  { no: 253, store: "가재울점", sv: "오세진", category: "물류 관련", title: "장기 보관 품목의 보관 기준을 안내해 주세요", attached: false, status: "prog", source: "direct", createdAt: "2026-01-05 21:31", answeredAt: null },
  { no: 252, store: "동의대역점", sv: "이서준", category: "메뉴 관련", title: "점심 세트 구성을 바꿔 주셨으면 합니다", attached: false, status: "prog", source: "direct", createdAt: "2026-01-02 10:25", answeredAt: null },
  { no: 251, store: "부천원종점", sv: "김도현", category: "메뉴 관련", title: "신메뉴 시식 일정을 지역별로 나눠 주세요", attached: true, status: "recv", source: "direct", createdAt: "2025-12-31 15:52", answeredAt: null },
  { no: 250, store: "인천검단신도시점", sv: "윤가람", category: "물류 관련", title: "발주 마감 시간을 한 시간 늦춰 주세요", attached: false, status: "recv", source: "direct", createdAt: "2025-12-27 09:25", answeredAt: null },
  { no: 249, store: "수원행궁점", sv: "서지호", category: "운영 관련", title: "본사 방문 일정을 미리 공지해 주세요", attached: false, status: "recv", source: "request_transfer", createdAt: "2025-12-22 22:44", answeredAt: null },
  { no: 248, store: "광주상무점", sv: "임채원", category: "운영 관련", title: "정기 휴무를 매장이 정할 수 있게 해 주세요", attached: true, status: "prog", source: "direct", createdAt: "2025-12-21 15:09", answeredAt: null },
  { no: 247, store: "대구월배점", sv: "배수현", category: "사장님 앱 관련", title: "앱에서 바로 문의할 수 있게 해 주세요", attached: false, status: "prog", source: "direct", createdAt: "2025-12-11 17:29", answeredAt: null },
  { no: 246, store: "마천동점", sv: "박지우", category: "사장님 앱 관련", title: "직원 계정 권한을 나눠 주세요", attached: false, status: "recv", source: "direct", createdAt: "2025-12-08 15:09", answeredAt: null },
  { no: 245, store: "아현점", sv: "한지훈", category: "사장님 앱 관련", title: "정산 내역을 엑셀로 내려받게 해 주세요", attached: true, status: "prog", source: "direct", createdAt: "2025-12-01 10:40", answeredAt: null },
  { no: 244, store: "명동점", sv: "최은영", category: "기타", title: "가맹비 정책 설명회를 열어 주세요", attached: true, status: "done", source: "direct", createdAt: "2025-11-30 13:12", answeredAt: "2025-12-04 15:03" },
  { no: 243, store: "가재울점", sv: "오세진", category: "운영 관련", title: "운영 매뉴얼 개정 시 변경분만 따로 알려 주세요", attached: false, status: "recv", source: "direct", createdAt: "2025-11-25 16:21", answeredAt: null },
  { no: 242, store: "동의대역점", sv: "이서준", category: "물류 관련", title: "재고 부족 알림을 앱에서 받게 해 주세요", attached: false, status: "prog", source: "direct", createdAt: "2025-11-17 12:08", answeredAt: null },
  { no: 241, store: "부천원종점", sv: "김도현", category: "운영 관련", title: "본사 담당자 연락 창구를 하나로 모아 주세요", attached: false, status: "done", source: "direct", createdAt: "2025-11-16 17:35", answeredAt: "2025-11-22 18:56" },
  { no: 240, store: "인천검단신도시점", sv: "윤가람", category: "물류 관련", title: "배송 시간대를 매장이 고를 수 있게 해 주세요", attached: false, status: "done", source: "direct", createdAt: "2025-11-07 21:29", answeredAt: "2025-11-15 17:34" },
  { no: 239, store: "수원행궁점", sv: "서지호", category: "메뉴 관련", title: "매운맛 단계를 다섯으로 나눠 주세요", attached: true, status: "prog", source: "direct", createdAt: "2025-11-03 18:33", answeredAt: null },
  { no: 238, store: "광주상무점", sv: "임채원", category: "메뉴 관련", title: "비건 메뉴를 하나라도 두었으면 합니다", attached: false, status: "recv", source: "direct", createdAt: "2025-11-01 20:23", answeredAt: null },
  { no: 237, store: "대구월배점", sv: "배수현", category: "물류 관련", title: "배송 기사 교체 시 매장에 알려 주세요", attached: false, status: "prog", source: "request_transfer", createdAt: "2025-10-31 20:38", answeredAt: null },
  { no: 236, store: "마천동점", sv: "박지우", category: "물류 관련", title: "지역 물류 거점을 늘려 주세요", attached: false, status: "recv", source: "direct", createdAt: "2025-10-28 14:38", answeredAt: null },
  { no: 235, store: "아현점", sv: "한지훈", category: "마케팅 및 프로모션", title: "지역 상권 전단 제작을 지원해 주세요", attached: false, status: "done", source: "direct", createdAt: "2025-10-27 21:17", answeredAt: "2025-10-30 14:12" },
  { no: 234, store: "명동점", sv: "최은영", category: "운영 관련", title: "점포 평가 기준을 공개해 주셨으면 합니다", attached: false, status: "recv", source: "direct", createdAt: "2025-10-26 17:54", answeredAt: null },
  { no: 233, store: "가재울점", sv: "오세진", category: "메뉴 관련", title: "디저트 메뉴 도입을 검토해 주세요", attached: true, status: "recv", source: "direct", createdAt: "2025-10-24 13:50", answeredAt: null },
  { no: 232, store: "동의대역점", sv: "이서준", category: "마케팅 및 프로모션", title: "리뷰 이벤트를 상시로 바꿔 주세요", attached: false, status: "done", source: "direct", createdAt: "2025-10-22 11:53", answeredAt: "2025-10-23 18:23" },
  { no: 231, store: "부천원종점", sv: "김도현", category: "마케팅 및 프로모션", title: "시즌 쿠폰을 매장이 발행하게 해 주세요", attached: true, status: "recv", source: "direct", createdAt: "2025-10-15 15:59", answeredAt: null },
  { no: 230, store: "인천검단신도시점", sv: "윤가람", category: "메뉴 관련", title: "가을 신메뉴로 국물 떡볶이를 제안합니다", attached: false, status: "prog", source: "direct", createdAt: "2025-10-04 12:44", answeredAt: null },
  { no: 229, store: "수원행궁점", sv: "서지호", category: "마케팅 및 프로모션", title: "인플루언서 협업을 지역 단위로도 해 주세요", attached: false, status: "prog", source: "direct", createdAt: "2025-09-28 10:41", answeredAt: null },
  { no: 228, store: "광주상무점", sv: "임채원", category: "운영 관련", title: "위생 점검 주기를 분기로 조정했으면 합니다", attached: false, status: "prog", source: "direct", createdAt: "2025-09-24 15:29", answeredAt: null },
  { no: 227, store: "대구월배점", sv: "배수현", category: "사장님 앱 관련", title: "자주 쓰는 발주 품목을 즐겨찾기로 두게 해 주세요", attached: false, status: "recv", source: "direct", createdAt: "2025-09-22 20:23", answeredAt: null },
];

export const PAGE_PATH = ["운영관리", "파트너 & 고객센터", "점주의 소리"];
export const PAGE_DESCRIPTION = "점주로부터 접수된 제안·의견을 검토합니다.";

/** 이 목록을 어떻게 읽고 전환을 언제 쓰는지 알리는 글이다. 두 안이 같은 문구를 쓴다. */
export const LIST_NOTES = [
  "[사장님 앱 › 점주의소리]로 접수된 제안·의견을 확인합니다. 처리가 필요한 요청은 상세에서 지원요청으로 전환하세요.",
  "담당자 답변이 등록되면(답변 1회) 전환할 수 없습니다. 답변 전에 처리 요청인지 먼저 판단하세요.",
  "전환은 상태가 아니라 표시입니다. 전환된 건은 접수 상태로 남고 (전환) 표시가 붙으며 통계에서 제외됩니다.",
];

export const ALL = "all";
export const CUSTOM = "custom";

export const PERIOD_OPTIONS = [
  { value: "1m", label: "1개월" },
  { value: "3m", label: "3개월" },
  { value: "6m", label: "6개월" },
  { value: CUSTOM, label: "직접 선택" },
];
const PERIOD_MONTHS: Record<string, number> = { "1m": 1, "3m": 3, "6m": 6 };

export const STATUS_OPTIONS = Object.entries(STATUS).map(([value, { label }]) => ({ value, label }));
export const CATEGORY_OPTIONS = CATEGORIES.map((name) => ({ value: name, label: name }));
export const SUPERVISOR_OPTIONS = SUPERVISORS.map(({ name, team }) => ({ value: name, label: name, description: team }));
export const SOURCE_OPTIONS = Object.entries(SOURCE).map(([value, label]) => ({ value, label }));

/**
 * 값을 고르는 네 축은 여러 개를 함께 고를 수 있다. 「접수와 처리중을 함께 본다」처럼 담당자가
 * 실제로 보는 묶음이 하나로 떨어지지 않기 때문이다. 아무것도 고르지 않은 축은 거르지 않는다.
 */
export const EMPTY_FILTER = {
  // 기간은 거르지 않는 값을 두지 않는다. 오래된 건까지 한 번에 불러오는 조회는 목록에서 하지
  // 않으며, 기본으로 열리는 폭은 한 달이다.
  period: "1m",
  from: "",
  to: "",
  status: [] as string[],
  category: [] as string[],
  sv: [] as string[],
  source: [] as string[],
  showMoved: false,
};

export type Filter = typeof EMPTY_FILTER;
/** 값을 여러 개 고를 수 있는 축의 이름이다. */
export type FilterAxis = "status" | "category" | "sv" | "source";

/** 오늘에서 `months` 달 앞선 날짜를 `YYYY-MM-DD` 로 돌려준다. */
function monthsAgo(months: number) {
  const date = new Date(`${TODAY}T00:00:00`);
  date.setMonth(date.getMonth() - months);
  return date.toISOString().slice(0, 10);
}

/** 고른 값이 없으면 그 축은 거르지 않는다. */
function chosen(values: string[], value: string) {
  return values.length === 0 || values.includes(value);
}

function inPeriod(voice: Voice, filter: Filter) {
  const registeredOn = voice.createdAt.slice(0, 10);
  if (filter.period === CUSTOM) {
    // 한쪽만 채워도 그쪽 방향으로 거른다. 둘 다 비어 있으면 아직 고르는 중이므로 거르지 않는다.
    if (filter.from && registeredOn < filter.from) return false;
    if (filter.to && registeredOn > filter.to) return false;
    return true;
  }
  return registeredOn >= monthsAgo(PERIOD_MONTHS[filter.period]);
}

export function matches(voice: Voice, filter: Filter) {
  if (!filter.showMoved && voice.movedTo) return false;
  if (!chosen(filter.status, voice.status)) return false;
  if (!chosen(filter.category, voice.category)) return false;
  if (!chosen(filter.sv, voice.sv)) return false;
  if (!chosen(filter.source, voice.source)) return false;
  return inPeriod(voice, filter);
}

const AXIS_VALUE: Record<FilterAxis, (voice: Voice) => string> = {
  status: (voice) => voice.status,
  category: (voice) => voice.category,
  sv: (voice) => voice.sv,
  source: (voice) => voice.source,
};

/**
 * 한 축의 값마다 몇 건이 걸리는지 센다.
 *
 * 그 축만 빼고 나머지 조건을 적용한 뒤에 센다. 자기 자신까지 적용하면 이미 고른 값은 자기 건수만
 * 남고 고르지 않은 값은 전부 0이 되어, 다음에 무엇을 더 고를지 판단할 수 없다.
 */
export function countsFor(axis: FilterAxis, filter: Filter) {
  const base = VOICES.filter((voice) => matches(voice, { ...filter, [axis]: [] }));
  const counts: Record<string, number> = {};
  for (const voice of base) {
    const value = AXIS_VALUE[axis](voice);
    counts[value] = (counts[value] ?? 0) + 1;
  }
  return counts;
}

/** 되돌릴 것이 있는지. 목록에 무엇까지 담을지 정하는 전환 표시는 여기서 세지 않는다. */
export function isFiltered(filter: Filter) {
  if (filter.period !== EMPTY_FILTER.period || filter.from || filter.to) return true;
  return filter.status.length + filter.category.length + filter.sv.length + filter.source.length > 0;
}

/** 축 하나에서 값을 켜고 끈다. */
export function toggleValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}
