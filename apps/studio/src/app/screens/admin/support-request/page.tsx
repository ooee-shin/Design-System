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

import { RiInboxLine } from "@remixicon/react";

import { Badge } from "@ooee/ui";

import { AdminLayout } from "@/components/candidates/admin-layout";
import { PageHeader } from "@/components/candidates/page-header";
import { ScreenPlaceholder } from "@/components/screens/screen-chrome";

import { REQUESTS, STATUS, type SupportRequest } from "./request-data";

// 좌측 내비게이션의 이름을 그대로 따른다. 점주의 소리가 「파트너 & 고객센터」 아래에 있는 것과
// 달리 지원요청관리는 운영관리 바로 아래에 선다.
const PAGE_PATH = ["운영관리", "지원요청관리"];

export default function AdminSupportRequestScreenPage() {
  // 고른 건이다. 들어왔을 때는 비어 있다. 첫 건을 미리 열어 두지 않는 까닭은 열어 본 사람이
  // 그 건을 자기가 고른 것으로 읽고, 목록이 무엇을 담고 있는지보다 그 건을 먼저 읽기 때문이다.
  const [picked, setPicked] = useState<SupportRequest | null>(null);

  return (
    <AdminLayout>
      <div className="flex min-h-0 flex-1 flex-col">
        <PageHeader path={PAGE_PATH} title="지원요청관리" />
        {/* 왼쪽 폭은 400px 로 잡아 둔다. 옮겨 오는 것이 사장님 앱의 목록이라 그 앱의 폭(390px)에
            맞춰 두면 한 줄에 담기던 것이 그대로 담긴다. 오른쪽 상세가 남은 폭을 전부 쓴다. */}
        <div className="flex min-h-0 flex-1 gap-3 p-6">
          {/* 조건은 목록 위에 둔다. 앞의 관리자 목록은 조건을 왼쪽 패널에 세로로 세웠으나, 이
              화면에서는 그 자리를 목록이 쓴다. */}
          <div className="flex w-[400px] shrink-0 flex-col gap-3">
            <ScreenPlaceholder name="Filter" className="h-16 shrink-0" />
            <ul className="min-h-0 flex-1 divide-y divide-oe-border-tertiary overflow-y-auto rounded-lg border border-oe-border-secondary bg-oe-background-primary">
              {REQUESTS.map((request) => (
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
    </AdminLayout>
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
      <span className="flex items-start gap-2">
        <span className="min-w-0 flex-1 truncate text-base font-medium text-oe-foreground-primary">{request.title}</span>
        <Badge tone={status.tone} size="small">
          {status.label}
        </Badge>
      </span>
      {/* 세 값을 띄어 쓰는 가운뎃점으로 가른다. 종류가 다른 값을 한 줄에서 구분하는 표기이며
          `ux-writing.md` 의 「가운뎃점」이 정한다. */}
      <span className="text-oe-label mt-1 block truncate text-oe-foreground-tertiary">
        {request.category} · {request.store} · {request.createdAt}
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
