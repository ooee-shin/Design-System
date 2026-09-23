"use client";

/**
 * 카카오톡 api 연동 메인 대시보드. 카카오톡 api 연동해서 메시지를 대시보드에서 이력 관리 하는 페이지
 *
 * 정하지 않아 비워 둔 자리:
 * - 카카오톡 채널 이름과 실제 연동 계정
 * - 메시지 이력의 실제 데이터 원본(현재는 화면 안 예시 데이터)
 * - 발송 시각의 정확한 형식과 시간대
 * - 페이지네이션, 상세 보기, 메시지 재발송 같은 목록 이후의 동작
 */

import { useMemo, useState } from "react";
import { Badge, Button, Chip, Input } from "@ooee/ui";
import { RiSearchLine } from "@remixicon/react";

type MessageStatus = "success" | "failure" | "pending";

const STATUS_FILTERS: { value: "all" | MessageStatus; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "success", label: "발송 성공" },
  { value: "failure", label: "발송 실패" },
  { value: "pending", label: "발송 대기" },
];

const STATUS_BADGE: Record<MessageStatus, { label: string; tone: "success" | "danger" | "neutral" }> = {
  success: { label: "발송 성공", tone: "success" },
  failure: { label: "발송 실패", tone: "danger" },
  pending: { label: "발송 대기", tone: "neutral" },
};

type MessageRecord = {
  id: string;
  recipient: string;
  content: string;
  sentAt: string;
  status: MessageStatus;
};

const MESSAGE_HISTORY: MessageRecord[] = [
  { id: "1", recipient: "김서연", content: "주문하신 상품이 발송되었습니다.", sentAt: "2026-09-23 09:12", status: "success" },
  { id: "2", recipient: "이도윤", content: "예약이 확정되었습니다. 방문을 기다립니다.", sentAt: "2026-09-23 09:05", status: "success" },
  { id: "3", recipient: "박하은", content: "결제가 실패했습니다. 다시 시도해 주세요.", sentAt: "2026-09-22 18:40", status: "failure" },
  { id: "4", recipient: "최지훈", content: "쿠폰이 곧 만료됩니다.", sentAt: "2026-09-22 15:20", status: "pending" },
  { id: "5", recipient: "정민서", content: "배송이 완료되었습니다.", sentAt: "2026-09-22 11:02", status: "success" },
  { id: "6", recipient: "한소율", content: "발송 대기 중인 메시지입니다.", sentAt: "2026-09-21 20:31", status: "pending" },
];

export default function KakaoMessageDashboardPage() {
  const [statusFilter, setStatusFilter] = useState<"all" | MessageStatus>("all");
  const [query, setQuery] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");

  const filtered = useMemo(() => {
    const keyword = appliedQuery.trim();
    return MESSAGE_HISTORY.filter((message) => {
      const matchesStatus = statusFilter === "all" || message.status === statusFilter;
      const matchesQuery =
        keyword.length === 0 || message.recipient.includes(keyword) || message.content.includes(keyword);
      return matchesStatus && matchesQuery;
    });
  }, [statusFilter, appliedQuery]);

  return (
    <main className="min-h-dvh bg-oe-background-canvas-primary px-oe-padding-default py-8 md:px-oe-padding-wide">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold text-oe-foreground-primary">카카오톡 메시지 이력</h1>
            <p className="text-sm text-oe-foreground-secondary">
              카카오톡 API로 발송한 메시지를 대시보드에서 이력으로 관리합니다.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone="success" variant="tonal">
              연동됨
            </Badge>
            <span className="text-sm text-oe-foreground-secondary">{"{카카오톡 채널명}"}</span>
          </div>
        </header>

        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            setAppliedQuery(query);
          }}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              aria-label="수신자 또는 메시지 검색"
              placeholder="수신자 또는 메시지 검색"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              clearable
              onClear={() => {
                setQuery("");
                setAppliedQuery("");
              }}
              leadingElement={<RiSearchLine aria-hidden="true" />}
            />
            <Button type="submit" tone="brand" variant="fill">
              조회
            </Button>
          </div>

          <div className="flex flex-wrap gap-1.5" role="group" aria-label="발송 상태 필터">
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
        </form>

        {/* 좁은 폭에서는 표의 발송 시각·상태 열이 컨테이너 밖으로 잘리므로 카드형 목록으로 바꾼다. */}
        <div className="hidden overflow-x-auto rounded-lg border border-oe-border-secondary bg-oe-background-primary sm:block">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-oe-border-secondary text-oe-foreground-tertiary">
                <th scope="col" className="px-4 py-3 font-medium">
                  수신자
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  메시지 내용
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  발송 시각
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  상태
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((message) => (
                <tr key={message.id} className="border-b border-oe-border-secondary last:border-b-0">
                  <td className="px-4 py-3 text-oe-foreground-primary">{message.recipient}</td>
                  <td className="px-4 py-3 text-oe-foreground-secondary">{message.content}</td>
                  <td className="px-4 py-3 text-oe-foreground-tertiary">{message.sentAt}</td>
                  <td className="px-4 py-3">
                    <Badge size="small" tone={STATUS_BADGE[message.status].tone} variant="tonal">
                      {STATUS_BADGE[message.status].label}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-oe-foreground-secondary">
              조건에 맞는 메시지 이력이 없습니다.
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 sm:hidden">
          {filtered.map((message) => (
            <div key={message.id} className="rounded-lg border border-oe-border-secondary bg-oe-background-primary p-4">
              <div className="flex items-start justify-between gap-2">
                <span className="font-medium text-oe-foreground-primary">{message.recipient}</span>
                <Badge size="small" tone={STATUS_BADGE[message.status].tone} variant="tonal">
                  {STATUS_BADGE[message.status].label}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-oe-foreground-secondary">{message.content}</p>
              <p className="mt-1 text-xs text-oe-foreground-tertiary">{message.sentAt}</p>
            </div>
          ))}
          {filtered.length === 0 ? (
            <p className="rounded-lg border border-oe-border-secondary bg-oe-background-primary px-4 py-10 text-center text-sm text-oe-foreground-secondary">
              조건에 맞는 메시지 이력이 없습니다.
            </p>
          ) : null}
        </div>
      </div>
    </main>
  );
}
