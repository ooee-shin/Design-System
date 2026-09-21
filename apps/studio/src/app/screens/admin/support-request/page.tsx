// 목록에서 고른 건이 오른쪽 상세를 바꾸므로 클라이언트에서 그린다.
"use client";

/**
 * 관리자 웹의 지원요청 목록이다.
 *
 * 앞의 관리자 목록이 표 한 장으로 뷰포트를 채우는 안이라면, 이 화면은 **왼쪽에 목록, 오른쪽에
 * 상세**를 함께 두는 안이다. 사장님 앱에서 목록과 상세가 두 장으로 나뉘어 있는 것을 PC 의 넓은
 * 폭에서 한 화면에 펼친다. 목록에서 한 건을 고르면 오른쪽이 그 건으로 바뀌므로, 건을 오갈 때마다
 * 목록으로 돌아갔다 다시 들어오지 않는다.
 *
 * 상세에 무엇이 서는지는 아직 정하지 않았다. 지금은 고른 건이 바뀌는 것까지만 확인한다.
 */

import { useState } from "react";

import { RiCalendarLine, RiInboxLine, RiResetLeftLine, RiSearchLine } from "@remixicon/react";

import { Badge, Button, Chip, Input, InputButton, NotificationBadge, Select } from "@ooee/ui";

import { AdminLayout } from "@/components/candidates/admin-layout";
import { PageHeader } from "@/components/candidates/page-header";
import { ScreenPlaceholder } from "@/components/screens/screen-chrome";

import {
  CATEGORY_OPTIONS,
  CUSTOM,
  EMPTY_FILTER,
  found,
  matches,
  PERIOD_OPTIONS,
  REQUESTS,
  STATUS,
  STATUS_OPTIONS,
  type RequestFilter,
  type SupportRequest,
} from "./request-data";

// 좌측 내비게이션의 이름을 그대로 따른다. 점주의 소리가 「파트너 & 고객센터」 아래에 있는 것과
// 달리 지원요청관리는 운영관리 바로 아래에 선다.
const PAGE_PATH = ["운영관리", "지원요청관리"];

export default function AdminSupportRequestScreenPage() {
  // 고른 건이다. 들어왔을 때는 비어 있다. 첫 건을 미리 열어 두지 않는 까닭은 열어 본 사람이
  // 그 건을 자기가 고른 것으로 읽고, 목록이 무엇을 담고 있는지보다 그 건을 먼저 읽기 때문이다.
  const [picked, setPicked] = useState<SupportRequest | null>(null);

  // 조건은 고르는 즉시 걸리지 않고 「조회」를 눌러야 걸린다. 관리자웹이 쓰던 방식이며, 축이
  // 여럿이라 하나 바꿀 때마다 목록이 다시 그려지면 조건을 다 세우기 전에 화면이 먼저 움직인다.
  const [draft, setDraft] = useState<RequestFilter>(EMPTY_FILTER);
  const [filter, setFilter] = useState<RequestFilter>(EMPTY_FILTER);

  // 검색어는 조건과 층이 다르므로 「조회」를 기다리지 않고 치는 대로 걸린다. 담긴 목록에서 한
  // 건을 집어내는 일이라, 눌러야 걸리면 집어내는 동안 화면이 멈춰 있게 된다.
  const [keyword, setKeyword] = useState("");
  const shown = REQUESTS.filter((request) => matches(request, filter) && found(request, keyword));

  return (
    <AdminLayout>
      <div className="flex min-h-0 flex-1 flex-col">
        {/* 머리에 바탕과 선을 두지 않는다. 아래가 통째로 스크롤되는 한 덩이가 아니라 조건 줄과
            목록과 상세 세 장으로 나뉘어 있어, 머리에도 선을 그으면 가로선이 겹쳐 보인다. */}
        <PageHeader path={PAGE_PATH} title="지원요청관리" variant="ghost" />
        <div className="flex min-h-0 flex-1 flex-col gap-3 p-6">
          {/* 조건은 목록 위가 아니라 화면 폭을 가로질러 선다. 조건은 목록과 상세 둘 다에 걸리는
              값이라 한쪽 칼럼 안에 두면 왼쪽 목록에만 걸리는 것으로 읽히고, 400px 안에서는 축
              하나에 라벨과 컨트롤을 나란히 둘 자리도 나오지 않는다. */}
          <FilterBar
            draft={draft}
            onDraftChange={(next) => setDraft({ ...draft, ...next })}
            onReset={() => {
              // 검색어는 비우지 않는다. 초기화는 조건을 되돌리는 조작이고 검색은 조건이 아니다.
              setDraft(EMPTY_FILTER);
              setFilter(EMPTY_FILTER);
              setPicked(null);
            }}
            onSubmit={() => {
              setFilter(draft);
              // 걸러 낸 목록에 없는 건이 오른쪽에 남아 있으면, 목록에 없는 건을 보고 있게 된다.
              setPicked((current) => (current && matches(current, draft) ? current : null));
            }}
          />

          {/* 왼쪽 폭은 400px 로 잡아 둔다. 옮겨 오는 것이 사장님 앱의 목록이라 그 앱의 폭(390px)에
              맞춰 두면 한 줄에 담기던 것이 그대로 담긴다. 오른쪽 상세가 남은 폭을 전부 쓴다. */}
          <div className="flex min-h-0 flex-1 gap-3">
            <div className="flex w-[400px] shrink-0 flex-col overflow-hidden rounded-lg border border-oe-border-secondary bg-oe-background-primary">
              {/* 검색은 목록의 머리에 붙는다. 위의 조건 줄에 함께 두었다가 뺐는데, 조건은 목록에
                  무엇을 담을지 정하고 검색은 담긴 목록 안에서 한 건을 집어내는 자리라 층이 다르다.
                  집어내는 대상 바로 위에 두면 그 관계가 자리로 드러난다. */}
              <div className="shrink-0 border-b border-oe-border-tertiary p-3">
                <Input
                  controlSize="small"
                  layout="fill"
                  placeholder="제목 검색"
                  aria-label="제목 검색"
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  trailingElement={<RiSearchLine />}
                />
              </div>
              {/* 스크롤 막대는 손잡이만 남긴다. 브라우저가 주는 바닥이 카드 오른쪽에 회색 띠로 얹혀서,
                  카드의 흰 면이 거기서 끊겨 보인다. 유틸리티는 `globals.css` 가 갖는다. */}
              <ul className="oe-scrollbar-bare min-h-0 flex-1 divide-y divide-oe-border-tertiary overflow-y-auto">
                {shown.map((request) => (
                  <li key={request.no}>
                    <RequestRow request={request} picked={picked?.no === request.no} onPick={() => setPicked(request)} />
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-oe-border-secondary bg-oe-background-primary">
              {picked === null ? <EmptyDetail /> : <Detail request={picked} />}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

/**
 * 화면 폭을 가로지르는 조건 줄이다.
 *
 * 관리자웹이 쓰던 배치를 그대로 가져왔다. 축마다 라벨을 컨트롤 왼쪽에 붙여 가로로 늘어놓고,
 * 줄 끝에 초기화와 조회를 둔다. 축이 늘어 한 줄에 다 서지 못하면 다음 줄로 흐른다.
 */
function FilterBar({
  draft,
  onDraftChange,
  onReset,
  onSubmit,
}: {
  draft: RequestFilter;
  onDraftChange: (next: Partial<RequestFilter>) => void;
  onReset: () => void;
  onSubmit: () => void;
}) {
  return (
    // 조건 줄만 옅은 회색 면을 갖는다. 화면의 흰 바탕 위에서 이 줄은 값을 읽는 자리가 아니라
    // 목록을 좁히는 조작을 담은 자리이므로, 면을 한 단계 내려 아래의 목록·상세와 갈라 둔다.
    <form
      className="flex shrink-0 flex-wrap items-center gap-x-7 gap-y-3 rounded-lg bg-oe-background-secondary px-5 py-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      {/* 기간은 자주 쓰는 세 구간을 칩으로 펼쳐 두고, 그 밖의 구간만 직접 고르게 한다. 목록을
          여는 사람 대부분이 최근 한두 달을 보므로 날짜 두 개를 매번 채우게 할 이유가 없다. */}
      <FilterAxis label="조회기간">
        <div className="flex items-center gap-1.5">
          {PERIOD_OPTIONS.map((option) => (
            <Chip
              key={option.value}
              shape="rounded"
              controlSize="small"
              active={draft.period === option.value}
              onClick={() => onDraftChange({ period: option.value })}
            >
              {option.label}
            </Chip>
          ))}
        </div>
        {/* 직접 고를 때만 두 칸이 선다. 날짜를 고르는 달력을 아직 붙이지 않아 눌러도 열리지
            않으며, 두 날이 비어 있는 동안에는 기간을 걸지 않는다. */}
        {draft.period === CUSTOM ? (
          <div className="flex items-center gap-1.5">
            <InputButton
              className="w-[132px]"
              controlSize="small"
              aria-label="시작일"
              placeholder="시작일"
              value={draft.from}
              leadingElement={<RiCalendarLine />}
            />
            <span aria-hidden="true" className="text-oe-foreground-tertiary">
              —
            </span>
            <InputButton
              className="w-[132px]"
              controlSize="small"
              aria-label="종료일"
              placeholder="종료일"
              value={draft.to}
              leadingElement={<RiCalendarLine />}
            />
          </div>
        ) : null}
      </FilterAxis>

      <FilterAxis label="카테고리">
        <Select
          controlSize="small"
          className="w-36"
          options={CATEGORY_OPTIONS}
          value={draft.category}
          onValueChange={(value) => onDraftChange({ category: value ?? undefined })}
          ariaLabel="카테고리"
        />
      </FilterAxis>

      <FilterAxis label="처리상태">
        <Select
          controlSize="small"
          className="w-28"
          options={STATUS_OPTIONS}
          value={draft.status}
          onValueChange={(value) => onDraftChange({ status: value ?? undefined })}
          ariaLabel="처리상태"
        />
      </FilterAxis>

      {/* 두 버튼은 줄 끝으로 민다. 조건을 다 세운 다음에 누르는 것이라 읽는 순서의 끝이다. */}
      <div className="ml-auto flex items-center gap-1.5">
        <Button type="button" variant="ghost" tone="neutral" controlSize="small" leadingIcon={<RiResetLeftLine />} onClick={onReset}>
          초기화
        </Button>
        <Button type="submit" controlSize="small">
          조회
        </Button>
      </div>
    </form>
  );
}

/** 라벨과 컨트롤이 한 줄에 서는 조건 하나다. */
function FilterAxis({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="shrink-0 text-sm font-medium text-oe-foreground-secondary">{label}</span>
      {children}
    </div>
  );
}

/**
 * 목록의 한 줄이다. 받은 다섯 값을 두 줄에 나눠 담는다.
 *
 * 제목은 16px 이다. 이 목록이 사장님 앱에서 옮겨 온 것이므로 앱 목록의 제목 크기를 따른다. 표의
 * 한 칸이었다면 14px 이 맞지만, 여기서는 줄 하나가 한 건을 통째로 담는 카드에 가깝고 그 줄에서
 * 먼저 읽혀야 하는 것이 제목이다.
 *
 * 윗줄은 무슨 건인지 말하는 제목과 지금 어디까지 왔는지 말하는 상태다. 목록을 훑는 사람이 찾는
 * 것이 그 둘이므로 한 줄을 온전히 쓴다. 아랫줄의 카테고리와 점포명과 등록일은 그 건을 가려낼 때
 * 쓰는 값이라 한 단계 물러나 한 줄에 함께 선다. 400px 에서 다섯을 한 줄에 늘어놓으면 제목이
 * 먼저 잘려서, 정작 무슨 건인지가 목록에서 사라진다.
 */
function RequestRow({ request, picked, onPick }: { request: SupportRequest; picked: boolean; onPick: () => void }) {
  const status = STATUS[request.status];

  return (
    <button
      type="button"
      onClick={onPick}
      aria-current={picked ? "true" : undefined}
      // 고른 줄은 중립 면으로 알린다. `interaction.md` 의 「선택 상태」가 경계가 없는 목록 행에
      // 정한 방식이다.
      className={`block w-full cursor-pointer px-4 py-3.5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-oe-focus-ring ${
        picked ? "bg-oe-background-secondary" : "hover:bg-oe-interaction-hover-subtle active:bg-oe-interaction-hover"
      }`}
    >
      {/* 줄의 오른쪽 끝은 안 읽은 수만 쓴다. 상태를 그 옆에 함께 두었더니 안 읽은 수가 있는 줄과
          없는 줄에서 상태가 서는 x 좌표가 달라져, 목록을 훑을 때 상태가 줄마다 움직였다. 한 자리에
          두 표시를 세우면 둘 중 하나는 다른 하나의 유무에 밀린다. */}
      <span className="flex items-center gap-2">
        <span className="min-w-0 flex-1 truncate text-base font-medium text-oe-foreground-primary">{request.title}</span>
        {/* 읽지 않은 것이 없으면 컴포넌트가 스스로 그리지 않는다. */}
        <NotificationBadge count={request.unread} stroke={false} />
      </span>
      {/* 상태는 아랫줄의 맨 앞이다. 왼쪽 끝은 줄마다 같은 자리이므로 무엇이 옆에 있든 움직이지
          않는다. 뒤의 세 값은 띄어 쓰는 가운뎃점으로 가른다. 종류가 다른 값을 한 줄에서 구분하는
          표기이며 `ux-writing.md` 의 「가운뎃점」이 정한다. */}
      <span className="mt-1.5 flex items-center gap-1.5">
        <Badge tone={status.tone} size="small">
          {status.label}
        </Badge>
        <span className="text-oe-label min-w-0 flex-1 truncate text-oe-foreground-tertiary">
          {request.category} · {request.store} · {request.createdAt}
        </span>
      </span>
    </button>
  );
}

/**
 * 아직 아무 건도 고르지 않은 자리다.
 *
 * 비워 두면 화면이 덜 그려진 것으로 보이므로, 오른쪽이 무엇을 담는 자리인지와 그것을 열려면
 * 무엇을 해야 하는지를 적는다. 누를 것을 따로 두지 않는 까닭은 여기서 할 수 있는 일이 왼쪽에서
 * 고르는 것 하나뿐이기 때문이며, 버튼을 세우면 고르는 자리가 두 곳으로 갈린다.
 */
function EmptyDetail() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2">
      <RiInboxLine className="size-8 text-oe-foreground-placeholder" aria-hidden="true" />
      <p className="mt-1 text-base font-medium text-oe-foreground-secondary">왼쪽 목록에서 요청을 고르세요</p>
      <p className="text-sm text-oe-foreground-tertiary">고른 요청의 내용과 처리 상황이 이 자리에 열립니다.</p>
    </div>
  );
}

/**
 * 고른 건의 상세다.
 *
 * 머리에 목록과 같은 다섯 값을 세워 어느 건을 열었는지 확인시키고, 그 아래는 아직 자리 표시로
 * 둔다. 요청 내용과 첨부, 채팅, 처리 조작 가운데 무엇이 어떤 순서로 서는지를 받지 못했다.
 */
function Detail({ request }: { request: SupportRequest }) {
  const status = STATUS[request.status];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-col gap-2 border-b border-oe-border-secondary px-6 py-5">
        <div className="flex items-start gap-3">
          <h2 className="min-w-0 flex-1 text-xl font-semibold text-oe-foreground-primary">{request.title}</h2>
          <Badge tone={status.tone}>{status.label}</Badge>
        </div>
        <p className="text-sm text-oe-foreground-tertiary">
          {request.category} · {request.store} · {request.createdAt}
        </p>
      </div>
      <ScreenPlaceholder name="Detail content" className="m-6 flex-1" />
    </div>
  );
}
