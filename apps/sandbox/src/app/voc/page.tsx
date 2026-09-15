"use client";

/**
 * 고객의 소리. 블루키 관리자 웹의 「웹소켓 > 고객의 소리」 메뉴 화면이다. 매장 고객이 남긴
 * 칭찬·불만·제안·문의를 본사 담당자가 확인하고 답변한다. 데스크톱 1440 기준이며 뷰포트를 전부
 * 쓴다. 왼쪽에 폭 240px의 내비게이션이 화면 높이를 채우고, 오른쪽은 높이 56px의 상단 바와 그
 * 아래 스크롤되는 본문으로 나뉜다. 내비게이션과 상단 바의 내용은 정하지 않았으므로 자리만 둔다.
 * 본문 맨 위에는 페이지 제목 「고객의 소리」가 있고 같은 줄 오른쪽 끝에 「내보내기」 outline
 * 버튼이 있다. 그 아래 필터 줄은 왼쪽부터 기간(누르면 날짜 선택 화면을 여는 입력형 버튼, 값이
 * 없을 때 「기간 선택」), 매장(하나 선택: 전체 매장·강남점·홍대점·부산 서면점, 기본값 전체 매장),
 * 유형(하나 선택: 전체 유형·칭찬·불만·제안·문의, 기본값 전체 유형), 검색(한 줄 입력, placeholder
 * 「제목·내용 검색」, 앞에 검색 아이콘)이다. 필터 줄 아래에 처리 상태 필터가 칩으로 나란히 있다:
 * 전체·접수·처리 중·완료, 기본으로 전체가 켜져 있고 하나만 켤 수 있다. 그 아래 목록은 표다. 열은
 * 접수일시, 매장, 유형, 제목, 고객, 상태, 담당자 순이다. 고객 열은 연락처 뒷자리를 가린 형태(예:
 * 010-****-1234)로 보인다. 상태 열은 배지로 보이며 접수는 info, 처리 중은 warning, 완료는
 * success tone이다. 담당자가 없으면 「미배정」을 흐린 글자로 보인다. 예시 데이터 여섯 줄을 둔다.
 * 행을 누르면 그 행이 선택 표시되고 본문 오른쪽에 폭 400px의 상세 패널이 열린다. 상세 패널 맨
 * 위에는 제목과 닫기 아이콘 버튼이 있고, 그 아래 접수일시·매장·유형·고객·상태를 두 열로 보여 준
 * 뒤, 원문 내용, 첨부 사진 자리(내용 미정, 자리만), 상태 변경(하나 선택: 접수·처리 중·완료),
 * 답변(여러 줄 입력, 최대 1000자, 글자 수 표시, placeholder 「고객에게 보낼 답변을 입력하세요」),
 * 맨 아래 폭을 채우는 「답변 등록」 제출 버튼이 있다. 패널이 열려 있지 않을 때는 표가 본문 폭을
 * 다 쓴다. 표 아래에는 가운데 정렬로 페이지 이동이 있다: 이전·다음 아이콘 버튼과 그 사이 페이지
 * 번호 1~5, 현재 페이지는 1이다. 실시간 수신 표시, 내보내기 동작, 답변 등록 동작, 날짜 선택
 * 화면, 페이지 이동 동작은 정하지 않았다. 원본은 없다.
 *
 * 사용자 결정(2026-09-15): 상세 패널이 열리면 표가 가로로 넘치지 않도록 고객·담당자 열을 숨긴다.
 * 요구사항 문단에는 없던 결정이며 /generate-code 가 만든 코드를 사람이 고친 자리다.
 *
 * 비워 둔 자리: 내비게이션·상단 바의 실제 내용, 실시간 수신 표시, 「내보내기」 동작, 날짜 선택
 * 화면(기간 InputButton은 열기 동작만 연결), 필터·검색이 실제로 목록을 좁히는 동작, 「답변 등록」
 * 제출 동작과 검증, 페이지 이동 동작.
 */

import { useEffect, useState } from "react";
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiCalendarLine,
  RiCloseLine,
  RiSearchLine,
} from "@remixicon/react";

import { Badge, Button, Chip, Field, Input, InputButton, Select, Textarea } from "@ooee/ui";
import { cn } from "@/lib/utils";

type ComplaintStatus = "received" | "in-progress" | "done";

type Complaint = {
  id: string;
  receivedAt: string;
  store: string;
  type: string;
  title: string;
  customerPhone: string;
  status: ComplaintStatus;
  assignee: string | null;
  content: string;
};

const STORE_FILTER_OPTIONS = [
  { value: "all", label: "전체 매장" },
  { value: "gangnam", label: "강남점" },
  { value: "hongdae", label: "홍대점" },
  { value: "busan-seomyeon", label: "부산 서면점" },
];

const TYPE_FILTER_OPTIONS = [
  { value: "all", label: "전체 유형" },
  { value: "compliment", label: "칭찬" },
  { value: "complaint", label: "불만" },
  { value: "suggestion", label: "제안" },
  { value: "inquiry", label: "문의" },
];

const STATUS_FILTERS: { value: "all" | ComplaintStatus; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "received", label: "접수" },
  { value: "in-progress", label: "처리 중" },
  { value: "done", label: "완료" },
];

const STATUS_OPTIONS: { value: ComplaintStatus; label: string }[] = [
  { value: "received", label: "접수" },
  { value: "in-progress", label: "처리 중" },
  { value: "done", label: "완료" },
];

const STATUS_META: Record<ComplaintStatus, { label: string; tone: "info" | "warning" | "success" }> = {
  received: { label: "접수", tone: "info" },
  "in-progress": { label: "처리 중", tone: "warning" },
  done: { label: "완료", tone: "success" },
};

const PAGE_NUMBERS = [1, 2, 3, 4, 5];
const CURRENT_PAGE = 1;
const ANSWER_MAX_LENGTH = 1000;

const COMPLAINTS: Complaint[] = [
  {
    id: "1",
    receivedAt: "2026-09-10 09:24",
    store: "강남점",
    type: "칭찬",
    title: "친절한 응대 감사해요",
    customerPhone: "010-****-1234",
    status: "done",
    assignee: "김도윤",
    content: "매장 직원분이 아이 응대까지 세심하게 해 주셔서 감사한 마음에 남깁니다.",
  },
  {
    id: "2",
    receivedAt: "2026-09-11 14:02",
    store: "홍대점",
    type: "불만",
    title: "주문이 자꾸 밀려요",
    customerPhone: "010-****-5678",
    status: "in-progress",
    assignee: "이서연",
    content: "주말 저녁 시간대에 주문한 음료가 30분 넘게 나오지 않았습니다.",
  },
  {
    id: "3",
    receivedAt: "2026-09-12 10:47",
    store: "부산 서면점",
    type: "제안",
    title: "포장 용기를 늘려주세요",
    customerPhone: "010-****-9012",
    status: "received",
    assignee: null,
    content: "테이크아웃 손잡이 캐리어가 자주 부족한 것 같습니다. 여유 있게 준비해 주시면 좋겠어요.",
  },
  {
    id: "4",
    receivedAt: "2026-09-12 18:15",
    store: "강남점",
    type: "문의",
    title: "포인트 적립 문의드립니다",
    customerPhone: "010-****-3456",
    status: "received",
    assignee: null,
    content: "지난주 방문 적립이 반영되지 않은 것 같아 확인 부탁드립니다.",
  },
  {
    id: "5",
    receivedAt: "2026-09-13 08:30",
    store: "홍대점",
    type: "칭찬",
    title: "직원분이 너무 친절했어요",
    customerPhone: "010-****-7890",
    status: "done",
    assignee: "박지훈",
    content: "이른 아침에 방문했는데도 밝게 응대해 주셔서 기분 좋게 하루를 시작했습니다.",
  },
  {
    id: "6",
    receivedAt: "2026-09-14 20:05",
    store: "부산 서면점",
    type: "불만",
    title: "매장이 너무 시끄러워요",
    customerPhone: "010-****-2345",
    status: "in-progress",
    assignee: "이서연",
    content: "매장 음악 소리가 너무 커서 대화가 어려웠습니다. 볼륨 조절 부탁드립니다.",
  },
];

type ColumnKey = "receivedAt" | "store" | "type" | "title" | "customer" | "status" | "assignee";

const COLUMNS: { key: ColumnKey; label: string }[] = [
  { key: "receivedAt", label: "접수일시" },
  { key: "store", label: "매장" },
  { key: "type", label: "유형" },
  { key: "title", label: "제목" },
  { key: "customer", label: "고객" },
  { key: "status", label: "상태" },
  { key: "assignee", label: "담당자" },
];

// 상세 패널이 열리면 남는 폭이 표의 최소 폭보다 좁아진다. 가로 스크롤로 상태 열이 가려지지 않도록
// 목록에서 고르는 데 덜 필요한 두 열을 숨긴다. 두 값은 상세 패널에 그대로 보인다.
const HIDDEN_WHEN_PANEL_OPEN: ColumnKey[] = ["customer", "assignee"];

function renderCell(key: ColumnKey, complaint: Complaint) {
  switch (key) {
    case "receivedAt":
      return complaint.receivedAt;
    case "store":
      return complaint.store;
    case "type":
      return complaint.type;
    case "title":
      return complaint.title;
    case "customer":
      return complaint.customerPhone;
    case "status":
      return <Badge tone={STATUS_META[complaint.status].tone}>{STATUS_META[complaint.status].label}</Badge>;
    case "assignee":
      return complaint.assignee ? (
        <span className="text-oe-foreground-primary">{complaint.assignee}</span>
      ) : (
        <span className="text-oe-foreground-tertiary">미배정</span>
      );
  }
}

function PlaceholderSlot({ label, className }: { label: string; className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-md border border-dashed border-oe-border-secondary text-sm text-oe-foreground-tertiary",
        className,
      )}
    >
      {label}
    </div>
  );
}

export default function VocPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | ComplaintStatus>("all");
  const [answer, setAnswer] = useState("");

  const selectedComplaint = COMPLAINTS.find((complaint) => complaint.id === selectedId) ?? null;
  const visibleColumns = selectedComplaint ? COLUMNS.filter((column) => !HIDDEN_WHEN_PANEL_OPEN.includes(column.key)) : COLUMNS;

  useEffect(() => {
    setAnswer("");
  }, [selectedId]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-oe-background-secondary">
      <aside className="flex h-full w-60 shrink-0 flex-col border-r border-oe-border-secondary bg-oe-background-primary p-3">
        <PlaceholderSlot label="내비게이션" className="flex-1" />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center border-b border-oe-border-secondary bg-oe-background-primary px-4">
          <PlaceholderSlot label="상단 바" className="h-8 w-full" />
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-oe-foreground-primary">고객의 소리</h1>
            <Button variant="outline" onClick={() => {}}>
              내보내기
            </Button>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <InputButton
              layout="fixed"
              fixedWidth={200}
              placeholder="기간 선택"
              leadingElement={<RiCalendarLine aria-hidden="true" />}
              aria-haspopup="dialog"
              onClick={() => {}}
            />
            <Select ariaLabel="매장" layout="fixed" fixedWidth={160} defaultValue="all" options={STORE_FILTER_OPTIONS} />
            <Select ariaLabel="유형" layout="fixed" fixedWidth={160} defaultValue="all" options={TYPE_FILTER_OPTIONS} />
            <div className="min-w-0 flex-1">
              <Input
                aria-label="검색"
                placeholder="제목·내용 검색"
                leadingElement={<RiSearchLine aria-hidden="true" />}
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            {STATUS_FILTERS.map((filter) => (
              <Chip
                key={filter.value}
                active={statusFilter === filter.value}
                onClick={() => setStatusFilter(filter.value)}
              >
                {filter.label}
              </Chip>
            ))}
          </div>

          <div className="mt-4 flex items-start gap-4">
            <div className="min-w-0 flex-1 overflow-x-auto rounded-lg border border-oe-border-secondary bg-oe-background-primary">
              <table className={cn("w-full border-collapse text-sm", selectedComplaint ? undefined : "min-w-[860px]")}>
                <thead>
                  <tr className="border-b border-oe-border-secondary bg-oe-background-secondary">
                    {visibleColumns.map((column) => (
                      <th key={column.key} scope="col" className="px-4 py-3 text-left text-xs font-medium text-oe-foreground-tertiary">
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPLAINTS.map((complaint) => {
                    const selected = complaint.id === selectedId;
                    return (
                      <tr
                        key={complaint.id}
                        tabIndex={0}
                        aria-selected={selected}
                        onClick={() => setSelectedId(complaint.id)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setSelectedId(complaint.id);
                          }
                        }}
                        className={cn(
                          "cursor-pointer border-b border-oe-border-secondary outline-none last:border-b-0 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-oe-focus-ring",
                          selected ? "bg-oe-background-secondary" : "hover:bg-oe-interaction-hover-subtle",
                        )}
                      >
                        {visibleColumns.map((column) => (
                          <td key={column.key} className="px-4 py-3 text-oe-foreground-primary">
                            {renderCell(column.key, complaint)}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {selectedComplaint ? (
              <aside
                aria-label="고객의 소리 상세"
                className="w-[400px] shrink-0 rounded-lg border border-oe-border-secondary bg-oe-background-primary p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-base font-semibold text-oe-foreground-primary">{selectedComplaint.title}</h2>
                  <Button
                    variant="ghost"
                    tone="neutral"
                    aria-label="닫기"
                    leadingIcon={<RiCloseLine aria-hidden="true" />}
                    onClick={() => setSelectedId(null)}
                  />
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
                  <div>
                    <dt className="text-xs text-oe-foreground-tertiary">접수일시</dt>
                    <dd className="mt-1 text-sm text-oe-foreground-primary">{selectedComplaint.receivedAt}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-oe-foreground-tertiary">매장</dt>
                    <dd className="mt-1 text-sm text-oe-foreground-primary">{selectedComplaint.store}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-oe-foreground-tertiary">유형</dt>
                    <dd className="mt-1 text-sm text-oe-foreground-primary">{selectedComplaint.type}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-oe-foreground-tertiary">고객</dt>
                    <dd className="mt-1 text-sm text-oe-foreground-primary">{selectedComplaint.customerPhone}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-oe-foreground-tertiary">상태</dt>
                    <dd className="mt-1">
                      <Badge tone={STATUS_META[selectedComplaint.status].tone}>
                        {STATUS_META[selectedComplaint.status].label}
                      </Badge>
                    </dd>
                  </div>
                </dl>

                <div className="mt-4 flex flex-col gap-1">
                  <span className="text-xs text-oe-foreground-tertiary">원문 내용</span>
                  <p className="text-sm text-oe-foreground-primary">{selectedComplaint.content}</p>
                </div>

                <div className="mt-4 flex flex-col gap-1">
                  <span className="text-xs text-oe-foreground-tertiary">첨부 사진</span>
                  <PlaceholderSlot label="첨부 사진 자리" className="h-24 w-full" />
                </div>

                <form onSubmit={(event) => event.preventDefault()} className="mt-4 flex flex-col gap-4">
                  <Field label="상태 변경">
                    <Select key={`status-${selectedComplaint.id}`} defaultValue={selectedComplaint.status} options={STATUS_OPTIONS} />
                  </Field>

                  <Field label="답변" characterCount={{ current: answer.length, max: ANSWER_MAX_LENGTH }}>
                    <Textarea
                      placeholder="고객에게 보낼 답변을 입력하세요"
                      maxLength={ANSWER_MAX_LENGTH}
                      value={answer}
                      onChange={(event) => setAnswer(event.target.value)}
                    />
                  </Field>

                  <Button type="submit" layout="fill">
                    답변 등록
                  </Button>
                </form>
              </aside>
            ) : null}
          </div>

          <nav aria-label="페이지 이동" className="mt-6 flex items-center justify-center gap-1">
            <Button
              variant="ghost"
              tone="neutral"
              controlSize="small"
              aria-label="이전 페이지"
              leadingIcon={<RiArrowLeftSLine aria-hidden="true" />}
              onClick={() => {}}
            />
            {PAGE_NUMBERS.map((page) => (
              <Button
                key={page}
                variant={page === CURRENT_PAGE ? "tonal" : "ghost"}
                tone={page === CURRENT_PAGE ? "brand" : "neutral"}
                controlSize="small"
                onClick={() => {}}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="ghost"
              tone="neutral"
              controlSize="small"
              aria-label="다음 페이지"
              leadingIcon={<RiArrowRightSLine aria-hidden="true" />}
              onClick={() => {}}
            />
          </nav>
        </main>
      </div>
    </div>
  );
}
