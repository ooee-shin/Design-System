"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import {
  RiArchiveLine as Archive,
  RiArrowLeftLine as ArrowLeft,
  RiFilterLine as Filter,
  RiMoreLine as MoreHorizontal,
  RiSearchLine as Search,
  RiTimeLine as Clock3,
} from "@remixicon/react";

import { Button, Input, MessageBubble, MessageComposer } from "@ooee/ui";
import { cn } from "./utils";

type Message = {
  from: string;
  initials: string;
  time: string;
  mine: boolean;
  text: string;
  deleted?: boolean;
};

type Thread = {
  id: string;
  sender: string;
  initials: string;
  time: string;
  subject: string;
  people: string;
  preview: string;
  unreadCount: number;
  messages: Message[];
};

const initialThreads: Thread[] = [
  {
    id: "ops",
    sender: "Priya Kapoor",
    initials: "PK",
    time: "09:12",
    subject: "Runner capacity for the launch",
    people: "Priya Kapoor, you and 2 others",
    preview: "We are at 78% on the shared pool and the marketing site rebuild lands Thursday…",
    unreadCount: 0,
    messages: [
      {
        from: "Priya Kapoor",
        initials: "PK",
        time: "09:12",
        mine: false,
        text: "We are at 78% on the shared pool and the marketing site rebuild lands Thursday. Can we pin two dedicated runners for launch week?",
      },
      {
        from: "You",
        initials: "SM",
        time: "09:20",
        mine: true,
        text: "Yes — I'll reserve two and set the pool to scale at 70% instead of 85%.",
      },
      {
        from: "Priya Kapoor",
        initials: "PK",
        time: "09:26",
        mine: false,
        text: "Perfect. I'll tell the web team they can stop staggering their deploys.",
      },
    ],
  },
  {
    id: "billing",
    sender: "Finance",
    initials: "FN",
    time: "08:40",
    subject: "Annual invoice — PO number needed",
    people: "Finance and you",
    preview: "Procurement will not release payment without the PO on the invoice header…",
    unreadCount: 3,
    messages: [
      {
        from: "Finance",
        initials: "FN",
        time: "08:40",
        mine: false,
        text: "Procurement will not release payment without the PO on the invoice header. Can you have it reissued as PO-44192?",
      },
      {
        from: "You",
        initials: "SM",
        time: "08:52",
        mine: true,
        text: "Requested — the reissued PDF should land in your inbox within the hour.",
      },
    ],
  },
  {
    id: "incident",
    sender: "Jonas Ohlsson",
    initials: "JO",
    time: "Yesterday",
    subject: "Postmortem draft: cache stampede",
    people: "Jonas Ohlsson, you and 5 others",
    preview: "Draft is ready for review. Two action items are still unassigned…",
    unreadCount: 128,
    messages: [
      {
        from: "Jonas Ohlsson",
        initials: "JO",
        time: "Yesterday",
        mine: false,
        text: "Draft is ready for review. Two action items are still unassigned: the jittered retry and the alert on cache hit rate.",
      },
      {
        from: "You",
        initials: "SM",
        time: "Yesterday",
        mine: true,
        text: "I'll take the retry work. Can Mei own the alert since she rebuilt that dashboard?",
      },
      {
        from: "Jonas Ohlsson",
        initials: "JO",
        time: "Yesterday",
        mine: false,
        text: "Asked her — she is in. Publishing Friday unless anyone objects.",
      },
    ],
  },
  {
    id: "design",
    sender: "Mei Tanaka",
    initials: "MT",
    time: "Mon",
    subject: "New status colours in the design kit",
    people: "Mei Tanaka and you",
    preview: "Amber now means degraded rather than warning, so the legend changes too…",
    unreadCount: 0,
    messages: [
      {
        from: "Mei Tanaka",
        initials: "MT",
        time: "Mon",
        mine: false,
        text: "Amber now means degraded rather than warning, so the legend changes too. Tokens are published under status/*.",
      },
    ],
  },
];

export type InboxLocale = "ko" | "en" | "ja";

const localeCopy = {
  ko: {
    inbox: "받은 메시지",
    search: "대화 검색…",
    filter: "대화 필터",
    empty: "검색 결과가 없습니다.",
    conversationList: "대화 목록",
    readingPane: "메시지 내용",
    unread: (count: number) => `읽지 않은 메시지 ${count}개`,
    back: "대화 목록으로 돌아가기",
    archive: "대화 보관",
    snooze: "나중에 알림",
    more: "더보기",
    deleteMessage: "메시지 삭제",
    deletedMessage: "삭제된 메시지입니다.",
    replyToMessage: "답장",
    copyMessage: "복사",
    forwardMessage: "전달",
    reply: "답장 입력…",
    attach: "첨부",
    send: "보내기",
    you: "나",
    now: "방금",
  },
  en: {
    inbox: "Inbox",
    search: "Search conversations…",
    filter: "Filter conversations",
    empty: "No conversations found.",
    conversationList: "Conversation list",
    readingPane: "Reading pane",
    unread: (count: number) => `${count} unread messages`,
    back: "Back to conversations",
    archive: "Archive conversation",
    snooze: "Snooze conversation",
    more: "More actions",
    deleteMessage: "Delete message",
    deletedMessage: "This message was deleted.",
    replyToMessage: "Reply",
    copyMessage: "Copy",
    forwardMessage: "Forward",
    reply: "Reply…",
    attach: "Attach",
    send: "Send",
    you: "You",
    now: "Now",
  },
  ja: {
    inbox: "受信トレイ",
    search: "会話を検索…",
    filter: "会話を絞り込む",
    empty: "会話が見つかりません。",
    conversationList: "会話一覧",
    readingPane: "メッセージ内容",
    unread: (count: number) => `未読メッセージ${count}件`,
    back: "会話一覧に戻る",
    archive: "会話をアーカイブ",
    snooze: "後で通知",
    more: "その他の操作",
    deleteMessage: "メッセージを削除",
    deletedMessage: "削除されたメッセージです。",
    replyToMessage: "返信",
    copyMessage: "コピー",
    forwardMessage: "転送",
    reply: "返信を入力…",
    attach: "添付",
    send: "送信",
    you: "自分",
    now: "たった今",
  },
};

const localizedThreadText = {
  ko: [
    {
      subject: "출시 주간 러너 용량",
      people: "Priya Kapoor, 나 외 2명",
      preview: "공용 풀 사용률이 78%이고 마케팅 사이트 개편이 목요일에 배포됩니다…",
      time: "09:12",
      messages: [
        "공용 풀 사용률이 78%이고 마케팅 사이트 개편이 목요일에 배포됩니다. 출시 주간에 전용 러너 두 대를 확보할 수 있을까요?",
        "네. 두 대를 예약하고 풀의 확장 기준을 85%에서 70%로 낮추겠습니다.",
        "좋아요. 웹 팀에 이제 배포 시간을 나누지 않아도 된다고 전달할게요.",
      ],
    },
    {
      subject: "연간 청구서 — PO 번호가 필요합니다",
      people: "재무팀과 나",
      preview: "청구서 상단에 PO 번호가 없으면 구매팀에서 결제를 승인할 수 없습니다…",
      time: "08:40",
      messages: [
        "청구서 상단에 PO 번호가 없으면 구매팀에서 결제를 승인할 수 없습니다. PO-44192로 다시 발행해 주실 수 있나요?",
        "요청했습니다. 한 시간 안에 재발행된 PDF가 받은 편지함에 도착할 거예요.",
      ],
    },
    {
      subject: "사후 분석 초안: 캐시 스탬피드",
      people: "Jonas Ohlsson, 나 외 5명",
      preview: "검토용 초안이 준비됐습니다. 아직 담당자가 정해지지 않은 작업이 두 개 있습니다…",
      time: "어제",
      messages: [
        "검토용 초안이 준비됐습니다. 지터 재시도와 캐시 적중률 알림, 두 작업의 담당자가 아직 정해지지 않았어요.",
        "재시도 작업은 제가 맡겠습니다. 대시보드를 다시 만든 Mei가 알림을 담당하면 어떨까요?",
        "Mei에게 물어봤고 맡기로 했습니다. 이견이 없으면 금요일에 게시할게요.",
      ],
    },
    {
      subject: "디자인 키트의 새로운 상태 색상",
      people: "Mei Tanaka와 나",
      preview: "이제 주황색은 경고가 아니라 성능 저하를 의미하므로 범례도 변경됩니다…",
      time: "월요일",
      messages: [
        "이제 주황색은 경고가 아니라 성능 저하를 의미하므로 범례도 변경됩니다. 토큰은 status/* 아래에 게시했습니다.",
      ],
    },
  ],
  ja: [
    {
      subject: "リリース週のランナー容量",
      people: "Priya Kapoor、自分、ほか2名",
      preview: "共有プールの使用率が78%で、マーケティングサイトの刷新は木曜日に反映されます…",
      time: "09:12",
      messages: [
        "共有プールの使用率が78%で、マーケティングサイトの刷新は木曜日に反映されます。リリース週に専用ランナーを2台確保できますか？",
        "はい。2台を予約し、プールのスケール基準を85%から70%に変更します。",
        "完璧です。デプロイ時間をずらす必要はないとWebチームに伝えます。",
      ],
    },
    {
      subject: "年間請求書 — PO番号が必要です",
      people: "財務チームと自分",
      preview: "請求書のヘッダーにPO番号がないと、購買部門が支払いを承認できません…",
      time: "08:40",
      messages: [
        "請求書のヘッダーにPO番号がないと、購買部門が支払いを承認できません。PO-44192で再発行できますか？",
        "依頼しました。再発行されたPDFは1時間以内に受信トレイへ届く予定です。",
      ],
    },
    {
      subject: "事後分析の下書き：キャッシュスタンピード",
      people: "Jonas Ohlsson、自分、ほか5名",
      preview: "レビュー用の下書きが完成しました。担当者未定の項目が2つあります…",
      time: "昨日",
      messages: [
        "レビュー用の下書きが完成しました。ジッター付き再試行とキャッシュヒット率アラートの2項目がまだ担当者未定です。",
        "再試行は私が担当します。ダッシュボードを作り直したMeiにアラートをお願いできますか？",
        "Meiに確認し、引き受けてもらいました。異論がなければ金曜日に公開します。",
      ],
    },
    {
      subject: "デザインキットの新しいステータスカラー",
      people: "Mei Tanakaと自分",
      preview: "アンバーは警告ではなく性能低下を示すようになり、凡例も変わります…",
      time: "月曜日",
      messages: [
        "アンバーは警告ではなく性能低下を示すようになり、凡例も変わります。トークンはstatus/*に公開しました。",
      ],
    },
  ],
};

function getInitialThreads(locale: InboxLocale) {
  if (locale === "en") return initialThreads;
  const translations = localizedThreadText[locale];

  return initialThreads.map((thread, threadIndex) => ({
    ...thread,
    sender: locale === "ko" ? koreanName(thread.sender) : thread.sender,
    time: translations[threadIndex].time,
    subject: translations[threadIndex].subject,
    people: translations[threadIndex].people,
    preview: translations[threadIndex].preview,
    messages: thread.messages.map((message, messageIndex) => ({
      ...message,
      from: message.mine ? localeCopy[locale].you : locale === "ko" ? koreanName(message.from) : message.from,
      time:
        message.time === "Yesterday"
          ? locale === "ko" ? "어제" : "昨日"
          : message.time === "Mon"
            ? locale === "ko" ? "월요일" : "月曜日"
            : message.time,
      text: translations[threadIndex].messages[messageIndex],
    })),
  }));
}

function koreanName(name: string) {
  return ({
    "Priya Kapoor": "프리야 카푸르",
    Finance: "재무팀",
    "Jonas Ohlsson": "요나스 올손",
    "Mei Tanaka": "메이 다나카",
  } as Record<string, string>)[name] ?? name;
}

export function InboxSplitView({ locale = "ko" }: { locale?: InboxLocale }) {
  const copy = localeCopy[locale];
  const initialLocalizedThreads = getInitialThreads(locale);
  const [threads, setThreads] = useState(initialLocalizedThreads);
  const [selectedId, setSelectedId] = useState(initialLocalizedThreads[0].id);
  const [query, setQuery] = useState("");
  const [reply, setReply] = useState("");
  const [mobileThreadOpen, setMobileThreadOpen] = useState(false);
  const threadBodyRef = useRef<HTMLDivElement>(null);

  function deleteMessage(messageIndex: number) {
    setThreads((current) => current.map((thread) => thread.id === selectedId
      ? { ...thread, messages: thread.messages.map((message, index) => index === messageIndex ? { ...message, deleted: true } : message) }
      : thread));
  }

  const selectedThread = threads.find((thread) => thread.id === selectedId) ?? threads[0];
  const unreadCount = threads.reduce((total, thread) => total + thread.unreadCount, 0);
  const filteredThreads = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return threads;
    return threads.filter((thread) =>
      [thread.sender, thread.subject, thread.preview].some((value) =>
        value.toLowerCase().includes(normalizedQuery),
      ),
    );
  }, [query, threads]);

  function openThread(id: string) {
    setSelectedId(id);
    setThreads((current) =>
      current.map((thread) => (thread.id === id ? { ...thread, unreadCount: 0 } : thread)),
    );
    setMobileThreadOpen(true);
    requestAnimationFrame(() => threadBodyRef.current?.scrollTo({ top: 0 }));
  }

  function sendReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = reply.trim();
    if (!text) return;

    setThreads((current) =>
      current.map((thread) =>
        thread.id === selectedId
          ? {
              ...thread,
              preview: text,
              messages: [
                ...thread.messages,
                { from: copy.you, initials: "SM", time: copy.now, mine: true, text },
              ],
            }
          : thread,
      ),
    );
    setReply("");
    requestAnimationFrame(() =>
      threadBodyRef.current?.scrollTo({ top: threadBodyRef.current.scrollHeight, behavior: "smooth" }),
    );
  }

  return (
    <div className="grid h-[min(46rem,calc(100vh-11rem))] min-h-[36rem] overflow-hidden rounded-2xl border border-oe-border-primary bg-oe-background-primary text-oe-foreground-primary shadow-sm md:grid-cols-[22rem_minmax(0,1fr)]">
      <aside
        aria-label={copy.conversationList}
        className={cn(
          "min-w-0 flex-col border-r border-oe-border-secondary",
          mobileThreadOpen ? "hidden md:flex" : "flex",
        )}
      >
        <div className="flex items-center gap-2 px-4 pt-4 pb-2">
          <h2 className="text-sm font-semibold">{copy.inbox}</h2>
          {unreadCount > 0 && (
            <span className="text-xs tabular-nums text-oe-foreground-secondary" aria-label={copy.unread(unreadCount)}>
              {unreadCount}
            </span>
          )}
          <Button variant="ghost" tone="neutral" controlSize="xsmall" className="ml-auto" aria-label={copy.filter} leadingIcon={<Filter />} />
        </div>

        <div className="relative px-4 pb-3">
          <Search className="pointer-events-none absolute top-2 left-6.5 size-3.5 text-oe-foreground-tertiary" aria-hidden="true" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={copy.search}
            aria-label={copy.search}
            className="h-8 border-oe-border-secondary bg-oe-background-secondary pl-8 text-oe-foreground-primary placeholder:text-oe-foreground-tertiary focus-visible:border-oe-focus-ring focus-visible:ring-oe-focus-ring/30"
          />
        </div>

        <div className="flex-1 divide-y divide-oe-border-secondary overflow-y-auto">
          {filteredThreads.map((thread) => {
            const selected = thread.id === selectedId;
            return (
              <button
                key={thread.id}
                type="button"
                onClick={() => openThread(thread.id)}
                aria-pressed={selected}
                className={cn(
                  "oe-hover-layer flex w-full gap-3 px-4 py-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-oe-focus-ring focus-visible:ring-inset",
                  selected && "bg-oe-background-secondary",
                )}
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-oe-background-secondary text-xs font-medium text-oe-foreground-secondary">
                  {thread.initials}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{thread.sender}</span>
                  <span className="block truncate text-sm">{thread.subject}</span>
                  <span className="mt-0.5 block truncate text-xs leading-snug text-oe-foreground-secondary">
                    {thread.preview}
                  </span>
                </span>
                <span className="flex min-w-13 shrink-0 flex-col items-end gap-1.5">
                  <span className="text-[11px] text-oe-foreground-tertiary">{thread.time}</span>
                  {thread.unreadCount > 0 && (
                    <span aria-label={copy.unread(thread.unreadCount)} className="inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-medium leading-none tabular-nums bg-oe-accent-background-bold-primary text-oe-foreground-inverse">{thread.unreadCount > 99 ? "99+" : thread.unreadCount}</span>
                  )}
                </span>
              </button>
            );
          })}
          {filteredThreads.length === 0 && (
            <p className="px-4 py-10 text-center text-sm text-oe-foreground-secondary">{copy.empty}</p>
          )}
        </div>
      </aside>

      <section
        aria-label={copy.readingPane}
        className={cn("min-w-0 flex-1 flex-col", mobileThreadOpen ? "flex" : "hidden md:flex")}
      >
        <header className="flex items-start gap-3 border-b border-oe-border-secondary px-4 py-3.5 sm:px-6 sm:py-4">
          <Button
            variant="ghost"
            tone="neutral"
            controlSize="xsmall"
            className="mt-0.5 md:hidden"
            onClick={() => setMobileThreadOpen(false)}
            aria-label={copy.back}
            leadingIcon={<ArrowLeft />}
          />
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-semibold">{selectedThread.subject}</h2>
            <p className="mt-0.5 truncate text-xs text-oe-foreground-secondary">{selectedThread.people}</p>
          </div>
          <div className="flex shrink-0 gap-1 text-oe-foreground-tertiary">
            <Button variant="ghost" tone="neutral" controlSize="xsmall" aria-label={copy.archive} leadingIcon={<Archive />} />
            <Button variant="ghost" tone="neutral" controlSize="xsmall" aria-label={copy.snooze} leadingIcon={<Clock3 />} />
            <Button variant="ghost" tone="neutral" controlSize="xsmall" aria-label={copy.more} leadingIcon={<MoreHorizontal />} />
          </div>
        </header>

        <div ref={threadBodyRef} className="oe-conversation-stack flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6">
          {selectedThread.messages.map((message, index) => (
            <MessageBubble
              key={`${message.time}-${index}`}
              direction={message.mine ? "outgoing" : "incoming"}
              author={message.from}
              initials={message.initials}
              time={message.time}
              grouped={index > 0 && selectedThread.messages[index - 1].from === message.from && selectedThread.messages[index - 1].time === message.time}
              showTime={index === selectedThread.messages.length - 1 || selectedThread.messages[index + 1].from !== message.from || selectedThread.messages[index + 1].time !== message.time}
              deleted={message.deleted}
              deletedLabel={copy.deletedMessage}
              actions={{
                copyLabel: copy.copyMessage,
                deleteLabel: copy.deleteMessage,
                onCopy: () => { void navigator.clipboard.writeText(message.text); },
                onDelete: () => deleteMessage(index),
              }}
            >
              {message.text}
            </MessageBubble>
          ))}
        </div>

        <MessageComposer value={reply} onValueChange={setReply} onSubmit={sendReply} placeholder={copy.reply} attachLabel={copy.attach} sendLabel={copy.send} />
      </section>
    </div>
  );
}
