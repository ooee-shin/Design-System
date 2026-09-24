"use client";

/**
 * 챗봇 채팅 화면. 화면명: 업무 데이터 AI 어시스턴트 (프로토타입) 목적 채팅창에 자연어로
 * 질문하면 업무 데이터를 기반으로 답변하는 화면의 동작 방식을 사전 검증한다. 이번 단계에서는
 * 실제 시스템 DB를 연결하지 않고, 미리 준비한 샘플 데이터(점포 N개, 월별 매출, 계약정보, 리뷰
 * 등)를 사용하여 질문 유형별 응답 형태와 화면 이동 흐름을 확인한다. 범위 포함: 질의응답 UI,
 * 질문 유형별 응답 포맷, 관련 화면 이동 동작, 이미지/파일 첨부 UX 제외: 실 DB 연동, 권한 처리,
 * 실데이터 정확성 검증 검증할 질문 유형 단일 데이터 조회 – "OO점 권리금이 얼마야?" 점포 정보
 * 조회 – "OO점 계약 종료일 알려줘" 매출 조회 – "OO점 이번 달 매출 얼마야?" 기간 비교 – "OO점
 * 매출이 지난달보다 얼마나 줄었어?" 조건 검색 – "이번 달 매출이 20% 이상 떨어진 매장 보여줘"
 * 복수 데이터 조회 – "OO점 매출과 리뷰 현황 알려줘" 관련 화면 연결 – "OO점 상세정보 보여줘" →
 * 상세페이지 이동 입력 방식 텍스트 입력 (자연어) 이미지 드래그앤드롭 파일 첨부 동작 흐름 질문
 * 입력 → 질문 의도·점포·기간·조건 인식 → 샘플 데이터 조회/계산 → 답변 출력(수치·표·요약) →
 * 필요 시 관련 화면 이동 버튼 노출 프로토타입 검증 기준 7가지 질문 유형 각각에 대해 샘플 데이터
 * 기준으로 올바른 값·목록이 응답되는지 기간 비교, 조건 검색 등 계산이 필요한 질문의 결과가
 * 샘플 데이터와 일치하는지 샘플에 없는 점포/기간 질문 시 "데이터 없음" 안내가 나오는지 관련
 * 화면 이동 시 해당 점포 상세페이지로 정확히 연결되는지 이미지 드래그앤드롭·파일 첨부가 정상
 * 동작하는지 비고 샘플 데이터는 고정값이며, 실 서비스 적용 시 동일한 질의 흐름을 실제 DB 조회로
 * 교체하는 것을 전제로 한다.
 *
 * 개선: 상세보기 눌렀는데 아무런 효과가 없음 확인해줘
 *
 * 수정: 상단에 지난 대화를 검색하는 입력창을 넣어줘. 키워드를 치면 그 말이 든 대화만 남긴다.
 *
 * 비워 둔 자리: 뒤로가기 버튼을 눌렀을 때의 이동 경로, 관련 화면 이동 버튼이 실제로 여는 상세
 * 페이지 주소(이 저장소에 매장 상세 화면이 아직 없어 여전히 만들지 않음 — 대신 클릭하면 대화에
 * "아직 준비되지 않았다"는 답을 추가해 클릭이 반응했다는 것을 보여 줌), 샘플 매장·매출·권리금·
 * 계약일·리뷰 값 자체(요청은 "미리 준비한 샘플 데이터"라고만 말함), 질문을 해석하는 실제 자연어
 * 처리 로직(여기서는 매장명·키워드 매칭으로 대신함), 첨부한 이미지·파일을 실제로 서버에 올리는
 * 동작, 대화 검색에서 질문과 답변 중 어느 쪽에 키워드가 있어도 한 쌍을 함께 남기는 규칙과
 * 맞는 대화가 없을 때의 안내 문구(요청은 "그 말이 든 대화만 남긴다"라고만 말함).
 */

import React, { useRef, useState } from "react";
import {
  RiArrowLeftLine,
  RiArrowRightLine,
  RiAttachment2,
  RiFileLine,
  RiImageAddLine,
  RiImageLine,
  RiSearchLine,
  RiSendPlaneLine,
} from "@remixicon/react";

import { AppHeader, Button, Chip, Input, MessageBubble, Textarea } from "@ooee/ui";
import { cn } from "@/lib/utils";

type StoreKey = "gangnam" | "hongdae" | "jamsil";

type Store = {
  key: StoreKey;
  name: string;
  keyMoney: number;
  contractEnd: string;
  salesThisMonth: number;
  salesLastMonth: number;
  reviewScore: number;
  reviewCount: number;
};

const STORES: Store[] = [
  {
    key: "gangnam",
    name: "강남점",
    keyMoney: 30_000_000,
    contractEnd: "2027-03-31",
    salesThisMonth: 82_000_000,
    salesLastMonth: 95_000_000,
    reviewScore: 4.6,
    reviewCount: 128,
  },
  {
    key: "hongdae",
    name: "홍대점",
    keyMoney: 22_000_000,
    contractEnd: "2026-11-30",
    salesThisMonth: 41_000_000,
    salesLastMonth: 47_000_000,
    reviewScore: 4.3,
    reviewCount: 64,
  },
  {
    key: "jamsil",
    name: "잠실점",
    keyMoney: 45_000_000,
    contractEnd: "2028-01-15",
    salesThisMonth: 110_000_000,
    salesLastMonth: 101_000_000,
    reviewScore: 4.8,
    reviewCount: 203,
  },
];

function formatWon(amount: number): string {
  const man = Math.round(amount / 10_000);
  const eok = Math.floor(man / 10_000);
  const remainderMan = man % 10_000;
  if (eok > 0) {
    return remainderMan > 0 ? `${eok}억 ${remainderMan.toLocaleString("ko-KR")}만원` : `${eok}억원`;
  }
  return `${man.toLocaleString("ko-KR")}만원`;
}

function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${year}년 ${Number(month)}월 ${Number(day)}일`;
}

function salesDiff(store: Store) {
  const diff = store.salesThisMonth - store.salesLastMonth;
  const pct = Math.abs((diff / store.salesLastMonth) * 100);
  return { diff, pct, direction: diff >= 0 ? ("up" as const) : ("down" as const) };
}

function findStore(text: string): Store | undefined {
  return STORES.find((store) => text.includes(store.name));
}

function answerQuery(rawText: string, onOpenDetail: (store: Store) => void): React.ReactNode {
  const text = rawText.trim();

  if (/상세\s*(정보|페이지)/.test(text)) {
    const store = findStore(text);
    if (!store) {
      return <p>어느 매장의 상세 페이지를 볼지 매장명도 함께 말씀해 주세요.</p>;
    }
    return (
      <div className="space-y-2">
        <p>{store.name} 상세 페이지로 연결할게요.</p>
        <Button
          render={<a href="#" />}
          nativeButton={false}
          role="link"
          tone="brand"
          variant="tonal"
          controlSize="small"
          trailingIcon={<RiArrowRightLine aria-hidden="true" />}
          onClick={(event) => {
            event.preventDefault();
            onOpenDetail(store);
          }}
        >
          {store.name} 상세보기
        </Button>
      </div>
    );
  }

  if (text.includes("매출") && /20%|조건/.test(text)) {
    const declines = STORES.map((store) => ({ store, ...salesDiff(store) }))
      .filter((entry) => entry.direction === "down")
      .sort((a, b) => b.pct - a.pct);
    const qualifying = declines.filter((entry) => entry.pct >= 20);
    if (qualifying.length > 0) {
      return <p>{qualifying.map((entry) => entry.store.name).join(", ")} 매출이 지난달보다 20% 이상 줄었어요.</p>;
    }
    const worst = declines[0];
    return worst ? (
      <p>
        조건에 맞는 매장이 없어요. 가장 크게 줄어든 매장은 {worst.store.name}({worst.pct.toFixed(1)}%)이에요.
      </p>
    ) : (
      <p>조건에 맞는 매장이 없어요.</p>
    );
  }

  const store = findStore(text);
  if (!store) {
    const guessed = text.match(/[가-힣]+점/)?.[0];
    return (
      <p>
        {guessed ?? "해당 매장"} 데이터를 찾을 수 없어요. 등록된 매장: {STORES.map((s) => s.name).join(", ")}
      </p>
    );
  }

  if (text.includes("권리금")) {
    return (
      <p>
        {store.name} 권리금은 {formatWon(store.keyMoney)}이에요.
      </p>
    );
  }

  if (text.includes("계약")) {
    return (
      <p>
        {store.name} 계약 종료일은 {formatDate(store.contractEnd)}이에요.
      </p>
    );
  }

  const wantsSales = text.includes("매출");
  const wantsReview = text.includes("리뷰");

  if (wantsSales && wantsReview) {
    const diff = salesDiff(store);
    return (
      <p>
        {store.name} 이번 달 매출은 {formatWon(store.salesThisMonth)}(지난달 대비 {diff.pct.toFixed(1)}%{" "}
        {diff.direction === "up" ? "증가" : "감소"})이고, 리뷰는 평점 {store.reviewScore}점({store.reviewCount}건)이에요.
      </p>
    );
  }

  if (wantsSales && /지난달|줄었|비교/.test(text)) {
    const diff = salesDiff(store);
    return (
      <div className="space-y-2">
        <p>
          {store.name} 매출이 지난달보다 {formatWon(Math.abs(diff.diff))}({diff.pct.toFixed(1)}%){" "}
          {diff.direction === "down" ? "줄었어요." : "늘었어요."}
        </p>
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-oe-border-secondary">
              <th scope="col" className="py-1 pr-3 font-medium text-oe-foreground-tertiary">
                기간
              </th>
              <th scope="col" className="py-1 font-medium text-oe-foreground-tertiary">
                매출
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-1 pr-3 text-oe-foreground-secondary">지난달</td>
              <td className="py-1 tabular-nums">{formatWon(store.salesLastMonth)}</td>
            </tr>
            <tr>
              <td className="py-1 pr-3 text-oe-foreground-secondary">이번 달</td>
              <td className="py-1 tabular-nums">{formatWon(store.salesThisMonth)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  if (wantsSales) {
    return (
      <p>
        {store.name} 이번 달 매출은 {formatWon(store.salesThisMonth)}이에요.
      </p>
    );
  }

  if (wantsReview) {
    return (
      <p>
        {store.name} 리뷰는 평점 {store.reviewScore}점({store.reviewCount}건)이에요.
      </p>
    );
  }

  return (
    <p>
      질문을 이해하지 못했어요. 「{store.name} 매출 얼마야?」처럼 물어봐 주세요.
    </p>
  );
}

const SEED_QUESTIONS = [
  "강남점 권리금이 얼마야?",
  "홍대점 계약 종료일 알려줘",
  "잠실점 이번 달 매출 얼마야?",
  "강남점 매출이 지난달보다 얼마나 줄었어?",
  "이번 달 매출이 20% 이상 떨어진 매장 보여줘",
  "잠실점 매출과 리뷰 현황 알려줘",
  "강남점 상세정보 보여줘",
  "신촌점 매출 얼마야?",
] as const;

const SEED_TIMES = [
  "오전 9:02",
  "오전 9:04",
  "오전 9:11",
  "오전 9:13",
  "오전 9:20",
  "오전 9:24",
  "오전 9:31",
  "오전 9:35",
];

type ChatMessage = {
  id: string;
  turn: string;
  direction: "incoming" | "outgoing";
  time: string;
  content: React.ReactNode;
};

function nodeToText(node: React.ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(nodeToText).join(" ");
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) return nodeToText(node.props.children);
  return "";
}

function buildSeedMessages(onOpenDetail: (store: Store) => void): ChatMessage[] {
  return SEED_QUESTIONS.flatMap((question, index) => [
    {
      id: `seed-${index}-q`,
      turn: `seed-${index}`,
      direction: "outgoing" as const,
      time: SEED_TIMES[index],
      content: <p>{question}</p>,
    },
    {
      id: `seed-${index}-a`,
      turn: `seed-${index}`,
      direction: "incoming" as const,
      time: SEED_TIMES[index],
      content: answerQuery(question, onOpenDetail),
    },
  ]);
}

type Attachment = {
  id: string;
  name: string;
  kind: "image" | "file";
};

export default function AiWorkAssistantPage() {
  const detailNoticeRef = useRef<(store: Store) => void>(() => {});
  const openDetail = useRef((store: Store) => detailNoticeRef.current(store)).current;
  const [messages, setMessages] = useState<ChatMessage[]>(() => buildSeedMessages(openDetail));
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const nextId = useRef(SEED_QUESTIONS.length);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  detailNoticeRef.current = (store: Store) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `notice-${nextId.current}`,
        turn: `notice-${nextId.current++}`,
        direction: "incoming",
        time: "방금",
        content: <p>{store.name} 상세 페이지는 아직 만들지 않았어요. 화면이 준비되면 이 버튼에서 연결할게요.</p>,
      },
    ]);
  };

  function addAttachments(files: FileList | null, kind: Attachment["kind"]) {
    if (!files || files.length === 0) return;
    const next: Attachment[] = Array.from(files).map((file) => ({
      id: `attachment-${nextId.current++}`,
      name: file.name,
      kind,
    }));
    setAttachments((prev) => [...prev, ...next]);
  }

  function removeAttachment(id: string) {
    setAttachments((prev) => prev.filter((attachment) => attachment.id !== id));
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDraggingOver(false);
    const files = event.dataTransfer.files;
    if (!files || files.length === 0) return;
    const next: Attachment[] = Array.from(files).map((file) => ({
      id: `attachment-${nextId.current++}`,
      name: file.name,
      kind: file.type.startsWith("image/") ? "image" : "file",
    }));
    setAttachments((prev) => [...prev, ...next]);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = draft.trim();
    if (!question && attachments.length === 0) return;

    const turn = `turn-${nextId.current++}`;
    const outgoing: ChatMessage = {
      id: `message-${nextId.current++}`,
      turn,
      direction: "outgoing",
      time: "방금",
      content: (
        <div className="space-y-1.5">
          {question && <p>{question}</p>}
          {attachments.length > 0 && (
            <ul className="space-y-1 text-xs">
              {attachments.map((attachment) => (
                <li key={attachment.id} className="flex items-center gap-1">
                  {attachment.kind === "image" ? (
                    <RiImageLine className="size-oe-icon-small" aria-hidden="true" />
                  ) : (
                    <RiFileLine className="size-oe-icon-small" aria-hidden="true" />
                  )}
                  {attachment.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      ),
    };

    const incoming: ChatMessage = {
      id: `message-${nextId.current++}`,
      turn,
      direction: "incoming",
      time: "방금",
      content: question ? answerQuery(question, openDetail) : <p>첨부를 확인했어요. 궁금한 점을 함께 입력해 주세요.</p>,
    };

    setMessages((prev) => [...prev, outgoing, incoming]);
    setDraft("");
    setAttachments([]);
  }

  const keyword = search.trim().toLocaleLowerCase();
  const matchedTurns = new Set(
    messages.filter((message) => nodeToText(message.content).toLocaleLowerCase().includes(keyword)).map((message) => message.turn),
  );
  const visibleMessages = keyword ? messages.filter((message) => matchedTurns.has(message.turn)) : messages;

  return (
    <div className="flex min-h-dvh flex-col bg-oe-background-primary">
      <AppHeader
        title="업무 데이터 AI 어시스턴트 (프로토타입)"
        titleAlign="start"
        leadingElement={
          <Button variant="ghost" tone="neutral" aria-label="뒤로가기" leadingIcon={<RiArrowLeftLine aria-hidden="true" />} />
        }
      />

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col overflow-hidden">
        <div className="border-b border-oe-border-secondary px-oe-padding-default py-3 md:px-oe-padding-wide">
          <Input
            type="search"
            variant="filled"
            controlSize="large"
            aria-label="대화 검색"
            placeholder="지난 대화 검색"
            leadingElement={<RiSearchLine aria-hidden="true" />}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            clearable={search.length > 0}
            clearLabel="검색어 지우기"
            onClear={() => setSearch("")}
          />
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-oe-padding-default py-4 md:px-oe-padding-wide">
          {keyword && visibleMessages.length === 0 && (
            <p role="status" className="py-8 text-sm text-oe-foreground-tertiary">
              「{search.trim()}」이(가) 들어 있는 대화가 없어요.
            </p>
          )}
          {visibleMessages.map((message) => (
            <MessageBubble
              key={message.id}
              direction={message.direction}
              author={message.direction === "incoming" ? "AI 어시스턴트" : "나"}
              initials={message.direction === "incoming" ? "AI" : "나"}
              time={message.time}
              showAvatar={message.direction === "incoming"}
            >
              {message.content}
            </MessageBubble>
          ))}
        </div>

        <form
          onSubmit={handleSubmit}
          className="border-t border-oe-border-secondary bg-oe-background-primary px-oe-padding-default py-3 md:px-oe-padding-wide"
        >
          {attachments.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {attachments.map((attachment) => (
                <Chip
                  key={attachment.id}
                  leadingElement={
                    attachment.kind === "image" ? <RiImageLine aria-hidden="true" /> : <RiFileLine aria-hidden="true" />
                  }
                  onRemove={() => removeAttachment(attachment.id)}
                  removeLabel={`${attachment.name} 삭제`}
                  removeTooltip="삭제"
                >
                  {attachment.name}
                </Chip>
              ))}
            </div>
          )}

          <div
            onDragOver={(event) => {
              event.preventDefault();
              setIsDraggingOver(true);
            }}
            onDragLeave={() => setIsDraggingOver(false)}
            onDrop={handleDrop}
            className={cn(
              "flex items-end gap-1 rounded-oe-control border border-oe-border-secondary bg-oe-background-primary p-1.5 transition-colors has-[:focus-visible]:border-oe-focus-ring has-[:focus-visible]:ring-1 has-[:focus-visible]:ring-oe-focus-ring",
              isDraggingOver && "border-dashed border-oe-border-primary bg-oe-background-secondary",
            )}
          >
            <Textarea
              aria-label="질문 입력"
              placeholder="점포 매출, 계약 정보 같은 업무 데이터를 물어보세요"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              autoSize
              resize={false}
              containerClassName="border-transparent bg-transparent has-[:focus-visible]:border-transparent has-[:focus-visible]:ring-0"
            />
            <div className="flex shrink-0 items-center gap-1 pb-1">
              <Button
                type="button"
                variant="ghost"
                tone="neutral"
                controlSize="large"
                aria-label="이미지 첨부"
                leadingIcon={<RiImageAddLine aria-hidden="true" />}
                onClick={() => imageInputRef.current?.click()}
              />
              <Button
                type="button"
                variant="ghost"
                tone="neutral"
                controlSize="large"
                aria-label="파일 첨부"
                leadingIcon={<RiAttachment2 aria-hidden="true" />}
                onClick={() => fileInputRef.current?.click()}
              />
              <Button
                type="submit"
                variant="fill"
                tone="brand"
                controlSize="large"
                aria-label="전송"
                leadingIcon={<RiSendPlaneLine aria-hidden="true" />}
              />
            </div>
          </div>

          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(event) => {
              addAttachments(event.target.files, "image");
              event.target.value = "";
            }}
          />
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(event) => {
              addAttachments(event.target.files, "file");
              event.target.value = "";
            }}
          />
        </form>
      </div>
    </div>
  );
}
