"use client";

/**
 * 공지사항 목록. 점주가 본사에서 올린 공지사항을 확인하는 목록 화면입니다. 맨 위에 「공지사항」
 * 제목을 두고 그 아래에 전체·필독·일반으로 거르는 칩 세 개를 나란히 놓으며 처음 열면 전체가
 * 골라져 있습니다. 목록은 한 줄에 한 건씩 제목과 올린 날짜(2026-09-23 꼴)를 보여 주고, 아직
 * 읽지 않은 공지에는 제목 앞에 「새 글」 배지를, 필독 공지에는 「필독」 배지를 답니다. 제목은
 * 두 줄까지 보이고 넘치면 줄임표로 자릅니다. 목록 맨 아래에는 「더 보기」 버튼을 두어 누르면
 * 다음 20건이 아래에 이어 붙습니다. 공지가 한 건도 없으면 목록 자리에 「등록된 공지사항이
 * 없습니다.」 한 줄만 보여 줍니다. 정렬은 최신순 하나이고 검색 칸은 넣지 않습니다. 항목을
 * 누르면 상세로 가지만 상세 화면은 이번 요청에 들어가지 않습니다.
 *
 * 정하지 않아 비워 둔 자리:
 * - 항목을 눌렀을 때 이동할 상세 화면의 실제 주소
 * - 목록·필터·배지·더 보기 버튼의 정확한 간격과 글자 크기
 * - 필독·일반 분류의 실제 비율(더미 데이터에서 정함)
 */

import { useState } from "react";
import { AppHeader, Badge, Button, Chip } from "@ooee/ui";

type NoticeCategory = "required" | "normal";

type Notice = {
  id: string;
  title: string;
  date: string;
  unread: boolean;
  category: NoticeCategory;
};

// 더미 데이터. 「일반」 분류를 0건으로 둬 빈 상태 문구를 실제 필터 조작으로 확인할 수 있게 했다.
// 스크롤/API 가 없는 화면이라 그 밖에 빈 상태를 재현할 방법이 없었다.
const NOTICES: Notice[] = [
  { id: "n22", title: "추석 연휴 매장 운영시간 변경 안내", date: "2026-09-23", unread: true, category: "required" },
  { id: "n21", title: "포스 시스템 정기 점검 안내(9/24 02:00~04:00)", date: "2026-09-23", unread: true, category: "required" },
  { id: "n20", title: "신메뉴 출시에 따른 매장 운영 가이드 및 발주 일정 변경 안내", date: "2026-09-22", unread: true, category: "required" },
  { id: "n19", title: "위생 점검 결과 및 개선 조치 안내", date: "2026-09-22", unread: false, category: "required" },
  { id: "n18", title: "근무표 등록 마감일 변경 안내", date: "2026-09-21", unread: false, category: "required" },
  { id: "n17", title: "본사 방문 상담 일정 안내", date: "2026-09-21", unread: false, category: "required" },
  { id: "n16", title: "가맹점 만족도 조사 참여 요청", date: "2026-09-20", unread: false, category: "required" },
  { id: "n15", title: "여름 시즌 메뉴 종료 안내", date: "2026-09-19", unread: false, category: "required" },
  { id: "n14", title: "매장 냉난방기 점검 일정 공유", date: "2026-09-19", unread: false, category: "required" },
  { id: "n13", title: "직원 안전교육 이수 안내", date: "2026-09-18", unread: false, category: "required" },
  { id: "n12", title: "포장 용기 규격 변경 안내", date: "2026-09-18", unread: false, category: "required" },
  { id: "n11", title: "정기 휴무일 안내", date: "2026-09-17", unread: false, category: "required" },
  { id: "n10", title: "매장 인테리어 리뉴얼 지원 안내", date: "2026-09-16", unread: false, category: "required" },
  { id: "n9", title: "배달 플랫폼 수수료 정책 변경 안내", date: "2026-09-16", unread: false, category: "required" },
  { id: "n8", title: "가을 신메뉴 시식회 일정 안내", date: "2026-09-15", unread: false, category: "required" },
  { id: "n7", title: "정산 시스템 업데이트 안내", date: "2026-09-14", unread: false, category: "required" },
  { id: "n6", title: "매장 CCTV 점검 일정 공유", date: "2026-09-14", unread: false, category: "required" },
  { id: "n5", title: "본사 콜센터 운영시간 변경 안내", date: "2026-09-13", unread: false, category: "required" },
  { id: "n4", title: "원부자재 발주 시스템 점검 안내", date: "2026-09-12", unread: false, category: "required" },
  { id: "n3", title: "매장 청결 상태 평가 결과 안내", date: "2026-09-11", unread: false, category: "required" },
  { id: "n2", title: "가맹점 간담회 개최 안내", date: "2026-09-10", unread: false, category: "required" },
  { id: "n1", title: "신규 결제 수단 도입 안내", date: "2026-09-09", unread: false, category: "required" },
];

const FILTERS = [
  { id: "all", label: "전체" },
  { id: "required", label: "필독" },
  { id: "normal", label: "일반" },
] as const;

type FilterId = (typeof FILTERS)[number]["id"];

const PAGE_SIZE = 20;

function filterNotices(notices: Notice[], filter: FilterId) {
  if (filter === "all") return notices;
  return notices.filter((notice) => notice.category === filter);
}

function NoticeListSection({ notices }: { notices: Notice[] }) {
  if (notices.length === 0) {
    return <p className="px-4 py-12 text-center text-sm text-oe-foreground-tertiary">등록된 공지사항이 없습니다.</p>;
  }

  return (
    <ul className="divide-y divide-oe-border-secondary">
      {notices.map((notice) => (
        <li key={notice.id}>
          <a
            href="#"
            className="flex flex-col gap-1.5 px-4 py-4 outline-none hover:bg-oe-interaction-hover-subtle focus-visible:ring-2 focus-visible:ring-oe-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-oe-background-primary"
          >
            <span className="flex items-start gap-1.5">
              {notice.unread ? (
                <Badge tone="info" variant="tonal">
                  새 글
                </Badge>
              ) : null}
              {notice.category === "required" ? (
                <Badge tone="danger" variant="tonal">
                  필독
                </Badge>
              ) : null}
              <span className="line-clamp-2 min-w-0 flex-1 text-sm font-medium text-oe-foreground-primary">{notice.title}</span>
            </span>
            <span className="text-xs text-oe-foreground-tertiary">{notice.date}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

export default function StoNoticeListPage() {
  const [filter, setFilter] = useState<FilterId>("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = filterNotices(NOTICES, filter);
  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <div className="min-h-dvh bg-oe-background-secondary">
      <div className="mx-auto flex min-h-dvh w-full max-w-[390px] flex-col border-oe-border-secondary bg-oe-background-primary sm:border-x">
        <AppHeader title="공지사항" />

        <div className="flex gap-1.5 overflow-x-auto px-4 py-3" role="group" aria-label="공지 종류 거르기">
          {FILTERS.map((item) => (
            <Chip
              key={item.id}
              shape="rounded"
              active={filter === item.id}
              onClick={() => {
                setFilter(item.id);
                setVisibleCount(PAGE_SIZE);
              }}
            >
              {item.label}
            </Chip>
          ))}
        </div>

        <NoticeListSection notices={visible} />

        {hasMore ? (
          <div className="px-4 py-4">
            <Button
              variant="outline"
              tone="neutral"
              controlSize="large"
              layout="fill"
              onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
            >
              더 보기
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
