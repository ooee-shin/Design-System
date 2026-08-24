"use client";

import { useState, type CSSProperties, type FormEvent } from "react";
import { Tooltip } from "@base-ui/react/tooltip";
import { Popover } from "@base-ui/react/popover";
import {
  RiCalendarLine as CalendarDays,
  RiInformationLine as Info,
} from "@remixicon/react";

import {
  MessageBubble,
  TypingIndicator,
  type MessageDeliveryState,
  type MessageDirection,
  MessageComposer,
  MessageFileAttachment,
} from "@ooee/ui";
import { Badge } from "@ooee/ui";
import { useStudioPreferences } from "@/components/studio-preferences-provider";
import { cn } from "@/lib/utils";
import { createCoreSemanticCssVariables } from "@ooee/tokens";

type Locale = "ko" | "en" | "ja";
type ChatTheme = "neutralLight" | "neutralDark" | "brandLight" | "brandDark";

const neutralLightTheme = {
    ...createCoreSemanticCssVariables("light"),
    "--oe-focus-ring": "var(--oe-brand-light-focus-ring, var(--color-blue-600))",
} as CSSProperties;

const neutralDarkTheme = {
    ...createCoreSemanticCssVariables("dark"),
    // Chat-only surface adjustments confirmed in the theme workbench.
    "--oe-background-canvas-secondary": "var(--color-neutral-950)",
    "--oe-background-primary": "var(--color-neutral-800)",
    "--oe-background-disabled": "var(--color-neutral-700)",
    "--oe-foreground-disabled": "var(--color-neutral-500)",
    "--oe-focus-ring": "var(--oe-brand-dark-focus-ring, var(--color-blue-400))",
} as CSSProperties;

const chatThemeStyles: Record<ChatTheme, CSSProperties> = {
  neutralLight: neutralLightTheme,
  neutralDark: neutralDarkTheme,
  brandLight: {
    ...neutralLightTheme,
    "--oe-message-incoming-background": "var(--oe-brand-light-background-secondary, var(--oe-background-secondary))",
    "--oe-message-incoming-border": "transparent",
    "--oe-message-outgoing-background": "var(--oe-brand-light-background-bold-primary, var(--oe-background-bold-primary))",
    "--oe-message-outgoing-foreground": "var(--color-white)",
  } as CSSProperties,
  brandDark: {
    ...neutralDarkTheme,
    "--oe-message-incoming-background": "var(--oe-brand-dark-background-primary, var(--oe-background-secondary))",
    "--oe-message-incoming-foreground": "var(--color-neutral-50)",
    "--oe-message-outgoing-background": "var(--oe-brand-dark-background-bold-primary, var(--oe-background-bold-primary))",
    "--oe-message-outgoing-foreground": "var(--color-neutral-950)",
  } as CSSProperties,
};

const copy = {
  ko: {
    incomingAuthor: "프리야 카푸르",
    outgoingAuthor: "나",
    outgoingGroupAuthor: "운영팀 신민수",
    outgoingGroupDescription: "여러 명의 관리자가 동일한 사용자와 채팅하는 경우, 관리자들끼리 구분하기 위해 관리자 이름을 표시합니다. 이름은 사용자에게 절대 노출되지 않으며 관리자들만 볼 수 있습니다.",
    incoming: "공용 풀 사용률이 높아졌어요. 출시 주간에 전용 러너 두 대를 확보할 수 있을까요?",
    incomingFollowUp: "목요일 배포 전에 예약 여부만 알려주세요.",
    outgoing: "네. 두 대를 예약하고 풀의 확장 기준을 낮추겠습니다.",
    outgoingFollowUp: "확정되는 대로 이 대화에 업데이트할게요.",
    long: "여러 줄로 이어지는 메시지에서 한글의 행간과 버블 내부 여백이 과하게 벌어지지 않는지 확인합니다. 화면 폭이 줄어들어도 읽기 편해야 합니다.",
    typing: "Priya Kapoor님이 작성 중입니다.",
    deleted: "삭제된 메시지입니다.",
    unreadRecipients: (count: number) => `아직 읽지 않은 참여자 ${count}명`,
    actions: { delete: "메시지 삭제", copy: "메시지 복사", retry: "재전송" },
    states: { sending: "전송 중", sent: "전송됨", read: "모두 읽음", failed: "전송 실패" },
    readHandling: {
      title: "읽음 처리",
      description: "대화를 자동으로 읽음 처리할지, 답장하거나 버튼을 눌렀을 때 처리할지 비교합니다.",
      automatic: "자동",
      manual: "수동",
      markRead: "읽음 처리",
      replyPlaceholder: "답장 입력",
      reply: "답장",
      attach: "첨부",
      send: "보내기",
      replyMessage: "확인했습니다. 일정에 반영할게요.",
      newMessages: "새 메시지",
      unreadMessages: (count: number) => `읽지 않은 새 메시지 ${count}개`,
      replyAlsoMarksRead: "답장을 해도 읽음 처리됩니다.",
    },
  },
  en: {
    incomingAuthor: "Priya Kapoor",
    outgoingAuthor: "You",
    outgoingGroupAuthor: "Operations Team Minsoo Shin",
    outgoingGroupDescription: "When multiple administrators chat with the same user, administrator names are shown so the administrators can identify one another. These names are never exposed to the user and are visible only to administrators.",
    incoming: "Shared pool usage is climbing. Can we reserve two dedicated runners for launch week?",
    incomingFollowUp: "Please let me know before Thursday’s deployment.",
    outgoing: "Yes. I’ll reserve two and lower the scaling threshold.",
    outgoingFollowUp: "I’ll update this thread as soon as it is confirmed.",
    long: "This longer message checks line length, wrapping, and the internal spacing of the bubble across narrower layouts without making the conversation difficult to scan.",
    typing: "Priya Kapoor is typing.",
    deleted: "This message was deleted.",
    unreadRecipients: (count: number) => `${count} recipients have not read this message`,
    actions: { delete: "Delete message", copy: "Copy message", retry: "Retry" },
    states: { sending: "Sending", sent: "Sent", read: "Read by all", failed: "Failed" },
    readHandling: {
      title: "Read handling",
      description: "Compare automatic read handling with manual handling after replying or pressing a button.",
      automatic: "Automatic",
      manual: "Manual",
      markRead: "Mark as read",
      replyPlaceholder: "Write a reply",
      reply: "Reply",
      attach: "Attach",
      send: "Send",
      replyMessage: "Got it. I’ll add it to the schedule.",
      newMessages: "New messages",
      unreadMessages: (count: number) => `${count} unread new message${count === 1 ? "" : "s"}`,
      replyAlsoMarksRead: "Replying also marks the conversation as read.",
    },
  },
  ja: {
    incomingAuthor: "Priya Kapoor",
    outgoingAuthor: "自分",
    outgoingGroupAuthor: "運営チーム シン・ミンス",
    outgoingGroupDescription: "複数の管理者が同じユーザーとチャットする場合、管理者同士を区別するために管理者名を表示します。この名前がユーザーに表示されることはなく、管理者だけが確認できます。",
    incoming: "共有プールの使用率が上がっています。リリース週に専用ランナーを2台確保できますか？",
    incomingFollowUp: "木曜日のデプロイ前に予約状況を教えてください。",
    outgoing: "はい。2台を予約し、スケール基準を下げます。",
    outgoingFollowUp: "確定したらこの会話で更新します。",
    long: "複数行のメッセージで行間や吹き出し内の余白を確認します。画面幅が狭くなっても読みやすさを保つ必要があります。",
    typing: "Priya Kapoorさんが入力しています。",
    deleted: "削除されたメッセージです。",
    unreadRecipients: (count: number) => `未読の参加者${count}人`,
    actions: { delete: "メッセージを削除", copy: "メッセージをコピー", retry: "再送信" },
    states: { sending: "送信中", sent: "送信済み", read: "全員既読", failed: "送信失敗" },
    readHandling: {
      title: "既読処理",
      description: "自動既読と、返信またはボタン操作による手動既読を比較します。",
      automatic: "自動",
      manual: "手動",
      markRead: "既読にする",
      replyPlaceholder: "返信を入力",
      reply: "返信",
      attach: "添付",
      send: "送信",
      replyMessage: "確認しました。予定に反映します。",
      newMessages: "新着メッセージ",
      unreadMessages: (count: number) => `未読の新着メッセージ${count}件`,
      replyAlsoMarksRead: "返信しても既読になります。",
    },
  },
} satisfies Record<Locale, {
  incomingAuthor: string;
  outgoingAuthor: string;
  outgoingGroupAuthor: string;
  outgoingGroupDescription: string;
  incoming: string;
  incomingFollowUp: string;
  outgoing: string;
  outgoingFollowUp: string;
  long: string;
  typing: string;
  deleted: string;
  unreadRecipients: (count: number) => string;
  actions: { delete: string; copy: string; retry: string };
  states: Record<MessageDeliveryState, string>;
  readHandling: {
    title: string;
    description: string;
    automatic: string;
    manual: string;
    markRead: string;
    replyPlaceholder: string;
    reply: string;
    attach: string;
    send: string;
    replyMessage: string;
    newMessages: string;
    unreadMessages: (count: number) => string;
    replyAlsoMarksRead: string;
  };
}>;

const states: MessageDeliveryState[] = ["sending", "sent", "read", "failed"];
export function MessageBubbleWorkbench() {
  const { theme, locale } = useStudioPreferences();
  const [direction, setDirection] = useState<MessageDirection>("incoming");
  const [showAvatar, setShowAvatar] = useState(true);
  const [longMessage, setLongMessage] = useState(false);
  const [readMode, setReadMode] = useState<"automatic" | "manual">("automatic");
  const [chatTheme, setChatTheme] = useState<ChatTheme>("neutralLight");
  const [conversationRead, setConversationRead] = useState(true);
  const [replyDraft, setReplyDraft] = useState("");
  const [sentReply, setSentReply] = useState<string | null>(null);
  const [themeReplyDraft, setThemeReplyDraft] = useState("");
  const [themeSentReply, setThemeSentReply] = useState<string | null>(null);
  const [integratedReplyDraft, setIntegratedReplyDraft] = useState("");
  const [integratedSentReply, setIntegratedSentReply] = useState<string | null>(null);
  const [senderContext, setSenderContext] = useState<"direct" | "multi">("direct");
  const activeCopy = copy[locale];
  const outgoingSenderLabel = senderContext === "multi" ? activeCopy.outgoingGroupAuthor : undefined;
  const outgoingSenderDescription = senderContext === "multi" ? activeCopy.outgoingGroupDescription : undefined;
  const messageActions = {
    copyLabel: activeCopy.actions.copy,
    deleteLabel: activeCopy.actions.delete,
  };
  const failedMessageActions = {
    retryLabel: activeCopy.actions.retry,
    deleteLabel: activeCopy.actions.delete,
  };
  const setHandlingMode = (mode: "automatic" | "manual") => {
    setReadMode(mode);
    setConversationRead(mode === "automatic");
    setSentReply(null);
    setReplyDraft("");
  };
  const submitReply = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = replyDraft.trim() || activeCopy.readHandling.replyMessage;
    setSentReply(message);
    setReplyDraft("");
    setConversationRead(true);
  };
  const submitThemeReply = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = themeReplyDraft.trim();
    if (!message) return;
    setThemeSentReply(message);
    setThemeReplyDraft("");
  };
  const submitIntegratedReply = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = integratedReplyDraft.trim();
    if (!message) return;
    setIntegratedSentReply(message);
    setIntegratedReplyDraft("");
  };

  return (
    <section className="rounded-2xl border bg-background shadow-sm">
      <div className={cn("preview-canvas rounded-2xl bg-oe-background-canvas-secondary p-4 text-oe-foreground-primary sm:p-6", theme === "dark" && "dark")} lang={locale}>
        <div className="mb-6">
          <WorkbenchSection title="통합 채팅 예시" description="확정한 요소가 실제 대화 흐름에서 함께 작동하는지 확인합니다. 날짜는 Studio 검수용으로 눌러 예시를 변경할 수 있습니다.">
            <div className="mb-4">
              <Control label="발신자">
                <Toggle active={senderContext === "direct"} onClick={() => setSenderContext("direct")}>1:1</Toggle>
                <Toggle active={senderContext === "multi"} onClick={() => setSenderContext("multi")}>다중</Toggle>
              </Control>
            </div>
            <div className="overflow-hidden rounded-xl border border-oe-border-secondary bg-oe-background-canvas-secondary" style={theme === "dark" ? neutralDarkTheme : neutralLightTheme}>
              <div className="oe-conversation-stack space-y-4 p-4 sm:p-5">
                <DateDivider locale={locale} />
                <MessageBubble direction="incoming" author={activeCopy.incomingAuthor} initials="PK" time="09:58" actions={messageActions}>
                  {activeCopy.long}
                </MessageBubble>
                <MessageBubble direction="outgoing" author={activeCopy.outgoingAuthor} initials="SM" time="09:59" outgoingSenderLabel={outgoingSenderLabel} outgoingSenderDescription={outgoingSenderDescription} deliveryState="read" unreadRecipientCount={0} deliveryCopy={activeCopy.states} actions={messageActions}>
                  {activeCopy.outgoing}
                </MessageBubble>
                <div data-direction="incoming" className="space-y-1.5">
                  <MessageBubble direction="incoming" author={activeCopy.incomingAuthor} initials="PK" time="10:02" showTime={false} actions={messageActions}>
                    {activeCopy.incoming}
                  </MessageBubble>
                  <MessageBubble grouped direction="incoming" author={activeCopy.incomingAuthor} initials="PK" time="10:02" showTime actions={messageActions}>
                    {activeCopy.incomingFollowUp}
                  </MessageBubble>
                </div>
                <div data-direction="outgoing" className="space-y-1.5">
                  <MessageBubble direction="outgoing" author={activeCopy.outgoingAuthor} initials="SM" time="10:03" showTime={false} actions={messageActions}>
                    {activeCopy.outgoing}
                  </MessageBubble>
                  <MessageBubble grouped direction="outgoing" author={activeCopy.outgoingAuthor} initials="SM" time="10:03" showTime outgoingSenderLabel={outgoingSenderLabel} outgoingSenderDescription={outgoingSenderDescription} deliveryState="read" unreadRecipientCount={0} deliveryCopy={activeCopy.states} actions={messageActions}>
                    {activeCopy.outgoingFollowUp}
                  </MessageBubble>
                </div>
                <div data-direction="incoming" className="space-y-1.5">
                  <MessageBubble direction="incoming" author={activeCopy.incomingAuthor} initials="PK" time="10:05" showTime={false} actions={messageActions}>
                    파일도 같이 확인해 주세요.
                  </MessageBubble>
                  <div className="ml-11">
                    <MessageFileAttachment />
                    <p className="mt-1 w-56 max-w-full px-1 text-left text-xs text-oe-foreground-tertiary">10:05</p>
                  </div>
                </div>
                {integratedSentReply && (
                  <MessageBubble direction="outgoing" author={activeCopy.outgoingAuthor} initials="SM" time="10:06" outgoingSenderLabel={outgoingSenderLabel} outgoingSenderDescription={outgoingSenderDescription} deliveryState="sent" deliveryCopy={activeCopy.states} actions={messageActions}>
                    {integratedSentReply}
                  </MessageBubble>
                )}
              </div>
              <MessageComposer value={integratedReplyDraft} onValueChange={setIntegratedReplyDraft} onSubmit={submitIntegratedReply} placeholder={activeCopy.readHandling.replyPlaceholder} attachLabel={activeCopy.readHandling.attach} sendLabel={activeCopy.readHandling.send} />
            </div>
          </WorkbenchSection>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-6">
            <WorkbenchSection title="Playground" description="방향, avatar, 콘텐츠 길이를 바꿔 기본 레이아웃을 검수합니다.">
              <div className="mb-5 flex flex-wrap gap-2">
                <Choice active={direction === "incoming"} onClick={() => setDirection("incoming")}>Incoming</Choice>
                <Choice active={direction === "outgoing"} onClick={() => setDirection("outgoing")}>Outgoing</Choice>
                <Choice active={showAvatar} onClick={() => setShowAvatar((value) => !value)}>Avatar</Choice>
                <Choice active={longMessage} onClick={() => setLongMessage((value) => !value)}>Long content</Choice>
              </div>
              <MessageBubble
                direction={direction}
                author={direction === "outgoing" ? activeCopy.outgoingAuthor : activeCopy.incomingAuthor}
                initials={direction === "outgoing" ? "SM" : "PK"}
                time="09:26"
                showAvatar={showAvatar}
                actions={messageActions}
              >
                {longMessage ? activeCopy.long : direction === "outgoing" ? activeCopy.outgoing : activeCopy.incoming}
              </MessageBubble>
            </WorkbenchSection>

            <WorkbenchSection title="Conversation states" description="Typing indicator는 MessageBubble과 분리된 thread 상태입니다.">
              <div className="oe-conversation-stack space-y-4">
                <MessageBubble direction="incoming" author={activeCopy.incomingAuthor} initials="PK" time="09:12" actions={messageActions}>{activeCopy.incoming}</MessageBubble>
                <MessageBubble direction="outgoing" author={activeCopy.outgoingAuthor} initials="SM" time="09:20" actions={messageActions}>{activeCopy.outgoing}</MessageBubble>
                <MessageBubble direction="incoming" author={activeCopy.incomingAuthor} initials="PK" time="09:24" deleted deletedLabel={activeCopy.deleted}>{activeCopy.incoming}</MessageBubble>
                <MessageBubble direction="outgoing" author={activeCopy.outgoingAuthor} initials="SM" time="09:25" deleted deletedLabel={activeCopy.deleted}>{activeCopy.outgoing}</MessageBubble>
                <TypingIndicator initials="PK" label={activeCopy.typing} />
              </div>
            </WorkbenchSection>
          </div>

          <WorkbenchSection title="Delivery states" description="발신 메시지의 전송 상태를 한 번에 비교합니다.">
            <div className="space-y-4">
              {states.map((state) => (
                <div key={state} className="space-y-1.5">
                  <p className="text-[11px] font-medium text-oe-foreground-tertiary">{activeCopy.states[state]}</p>
                  <MessageBubble
                    direction="outgoing"
                    author={activeCopy.outgoingAuthor}
                    initials="SM"
                    time="09:20"
                    deliveryState={state}
                    unreadRecipientCount={state === "sent" ? 3 : state === "read" ? 0 : undefined}
                    unreadRecipientLabel={state === "sent" ? activeCopy.unreadRecipients(3) : undefined}
                    deliveryCopy={activeCopy.states}
                    showAvatar={false}
                    actions={messageActions}
                    failedActions={state === "failed" ? failedMessageActions : undefined}
                  >
                    {activeCopy.outgoing}
                  </MessageBubble>
                </div>
              ))}
            </div>
          </WorkbenchSection>

          <div className="xl:col-span-2">
            <WorkbenchSection title={activeCopy.readHandling.title} description={activeCopy.readHandling.description}>
              <div className="mb-5 flex gap-2">
                <Choice active={readMode === "automatic"} onClick={() => setHandlingMode("automatic")}>{activeCopy.readHandling.automatic}</Choice>
                <Choice active={readMode === "manual"} onClick={() => setHandlingMode("manual")}>{activeCopy.readHandling.manual}</Choice>
              </div>

              <div className="overflow-hidden rounded-xl border border-oe-border-secondary bg-oe-background-canvas-secondary" style={theme === "dark" ? neutralDarkTheme : neutralLightTheme}>
                <div className="oe-conversation-stack space-y-4 p-4 sm:p-5">
                <MessageBubble direction="incoming" author={activeCopy.incomingAuthor} initials="PK" time="10:02" actions={messageActions}>
                  {activeCopy.incoming}
                </MessageBubble>
                <MessageBubble direction="outgoing" author={activeCopy.outgoingAuthor} initials="SM" time="10:03" actions={messageActions}>
                  {activeCopy.outgoing}
                </MessageBubble>
                {!conversationRead && (
                  <div className="flex items-center gap-2" role="separator" aria-label={`${activeCopy.readHandling.newMessages} 1`}>
                    <span className="h-px flex-1 bg-oe-border-secondary" />
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-oe-foreground-secondary">
                      {activeCopy.readHandling.newMessages}
                      <Badge type="number" value={1} label={activeCopy.readHandling.unreadMessages(1)} tone="accent" appearance="fill" />
                    </span>
                    <span className="h-px flex-1 bg-oe-border-secondary" />
                  </div>
                )}
                <div className="space-y-2" aria-live="polite">
                  <MessageBubble
                    direction="incoming"
                    author={activeCopy.incomingAuthor}
                    initials="PK"
                    time="10:04"
                    actions={messageActions}
                    unreadMessageCount={conversationRead ? undefined : 1}
                    unreadMessageLabel={conversationRead ? undefined : activeCopy.readHandling.unreadMessages(1)}
                  >
                    {activeCopy.long}
                  </MessageBubble>
                  {!conversationRead && (
                    <div className="flex min-h-8 items-center justify-end">
                      <div className="oe-hover-layer inline-flex h-8 items-center rounded-lg border border-oe-border-primary bg-oe-background-primary text-xs font-medium text-oe-foreground-primary">
                        <Tooltip.Root>
                          <Tooltip.Trigger
                            delay={200}
                            aria-label={activeCopy.readHandling.replyAlsoMarksRead}
                            className="inline-flex h-full items-center rounded-l-lg pl-3 pr-1 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-oe-focus-ring"
                          >
                            <Info className="size-3.5 text-oe-foreground-secondary" aria-hidden="true" />
                          </Tooltip.Trigger>
                          <Tooltip.Portal>
                            <Tooltip.Positioner
                              side="top"
                              align="end"
                              sideOffset={8}
                              collisionPadding={8}
                              collisionAvoidance={{ side: "flip", align: "shift" }}
                            >
                              <Tooltip.Popup className="z-50 w-max whitespace-nowrap rounded-lg bg-oe-background-bold-primary px-2.5 py-2 text-[11px] leading-none font-normal text-oe-foreground-inverse shadow-sm transition-[transform,opacity] duration-100 data-ending-style:opacity-0 data-starting-style:opacity-0">
                                {activeCopy.readHandling.replyAlsoMarksRead}
                              </Tooltip.Popup>
                            </Tooltip.Positioner>
                          </Tooltip.Portal>
                        </Tooltip.Root>
                        <button
                          type="button"
                          onClick={() => setConversationRead(true)}
                          className="inline-flex h-full items-center rounded-r-lg pl-1 pr-3 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-oe-focus-ring"
                        >
                          {activeCopy.readHandling.markRead}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {sentReply && (
                  <MessageBubble direction="outgoing" author={activeCopy.outgoingAuthor} initials="SM" time="10:06" actions={messageActions}>
                    {sentReply}
                  </MessageBubble>
                )}
                </div>

                <MessageComposer
                  value={replyDraft}
                  onValueChange={setReplyDraft}
                  onSubmit={submitReply}
                  placeholder={activeCopy.readHandling.replyPlaceholder}
                  attachLabel={activeCopy.readHandling.attach}
                  sendLabel={activeCopy.readHandling.send}
                />
              </div>
            </WorkbenchSection>
          </div>

          <div className="xl:col-span-2">
            <WorkbenchSection title="채팅 테마" description="상위 화면 모드와 독립적으로 중립 및 브랜드 채팅방의 라이트·다크 조합을 검수합니다.">
              <div className="flex items-center gap-4 overflow-x-auto rounded-t-xl border border-b-0 border-oe-border-secondary bg-oe-background-secondary p-2" aria-label="채팅방 테마 설정">
                <Control label="색상">
                  <Toggle active={chatTheme.startsWith("neutral")} onClick={() => setChatTheme(chatTheme.endsWith("Dark") ? "neutralDark" : "neutralLight")}>중립</Toggle>
                  <Toggle active={chatTheme.startsWith("brand")} onClick={() => setChatTheme(chatTheme.endsWith("Dark") ? "brandDark" : "brandLight")}>브랜드</Toggle>
                </Control>
                <Control label="모드">
                  <Toggle active={chatTheme.endsWith("Light")} onClick={() => setChatTheme(chatTheme.startsWith("brand") ? "brandLight" : "neutralLight")}>라이트</Toggle>
                  <Toggle active={chatTheme.endsWith("Dark")} onClick={() => setChatTheme(chatTheme.startsWith("brand") ? "brandDark" : "neutralDark")}>다크</Toggle>
                </Control>
              </div>

              <div className="overflow-hidden rounded-b-xl border border-oe-border-secondary bg-oe-background-canvas-secondary" style={chatThemeStyles[chatTheme]}>
                <div className="oe-conversation-stack space-y-4 p-4 sm:p-5">
                  <MessageBubble direction="incoming" author={activeCopy.incomingAuthor} initials="PK" time="10:02" actions={messageActions}>
                    {activeCopy.incoming}
                  </MessageBubble>
                  <MessageBubble direction="outgoing" author={activeCopy.outgoingAuthor} initials="SM" time="10:03" actions={messageActions}>
                    {activeCopy.outgoing}
                  </MessageBubble>
                  <MessageBubble
                    direction="outgoing"
                    author={activeCopy.outgoingAuthor}
                    initials="SM"
                    time="10:04"
                    deliveryState="failed"
                    deliveryCopy={activeCopy.states}
                    actions={messageActions}
                    failedActions={failedMessageActions}
                  >
                    {activeCopy.outgoing}
                  </MessageBubble>
                  {themeSentReply && (
                    <MessageBubble direction="outgoing" author={activeCopy.outgoingAuthor} initials="SM" time="10:05" actions={messageActions}>
                      {themeSentReply}
                    </MessageBubble>
                  )}
                </div>

                <MessageComposer
                  value={themeReplyDraft}
                  onValueChange={setThemeReplyDraft}
                  onSubmit={submitThemeReply}
                  placeholder={activeCopy.readHandling.replyPlaceholder}
                  attachLabel={activeCopy.readHandling.attach}
                  sendLabel={activeCopy.readHandling.send}
                />
              </div>
            </WorkbenchSection>
          </div>

          <div className="xl:col-span-2">
            <WorkbenchSection title="파일 첨부" description="파일은 말풍선에 포함하지 않고 독립된 첨부 요소로 표시합니다. 이미지 사례는 현재 검수 범위에서 제외합니다.">
              <div className="rounded-xl border border-oe-border-secondary bg-oe-background-canvas-secondary p-4 sm:p-5">
                <div className="flex justify-end">
                  <div className="flex max-w-[72%] flex-col items-end">
                    <MessageFileAttachment />
                    <p className="mt-1 px-1 text-xs text-oe-foreground-tertiary">10:10</p>
                  </div>
                </div>
              </div>
            </WorkbenchSection>
          </div>
        </div>
      </div>
    </section>
  );
}

function WorkbenchSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-oe-border-secondary bg-oe-background-primary p-4 sm:p-5"><div className="mb-5"><h2 className="text-sm font-semibold">{title}</h2><p className="mt-1 text-xs text-oe-foreground-secondary">{description}</p></div>{children}</section>;
}

function DateDivider({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(21);
  const todayLabel = locale === "ko" ? "오늘" : locale === "ja" ? "今日" : "Today";
  const monthLabel = locale === "ko" ? "2026년 8월" : locale === "ja" ? "2026年8月" : "August 2026";
  const weekdays = locale === "ko" ? ["일", "월", "화", "수", "목", "금", "토"] : locale === "ja" ? ["日", "月", "火", "水", "木", "金", "土"] : ["S", "M", "T", "W", "T", "F", "S"];
  const label = selectedDay === 21
    ? todayLabel
    : locale === "ko"
      ? `8월 ${selectedDay}일`
      : locale === "ja"
        ? `8月${selectedDay}日`
        : `Aug ${selectedDay}`;

  return (
    <div className="relative flex min-h-6 items-center justify-center">
      <span className="absolute inset-x-0 top-1/2 h-px bg-oe-border-secondary" aria-hidden="true" />
      <div className="relative -translate-x-1.5 bg-oe-background-canvas-secondary px-3">
        <Popover.Root open={open} onOpenChange={setOpen}>
          <Popover.Trigger className="inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 text-xs font-medium text-oe-foreground-secondary outline-none hover:text-oe-foreground-primary focus-visible:ring-2 focus-visible:ring-oe-focus-ring" aria-label={`${label}, 날짜 선택`}>
            <CalendarDays className="size-3.5 text-oe-foreground-tertiary" aria-hidden="true" />
            {label}
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Positioner positionMethod="fixed" side="bottom" align="center" sideOffset={8} collisionPadding={8} collisionAvoidance={{ side: "flip", align: "shift" }}>
              <Popover.Popup className="z-50 w-64 rounded-xl border border-oe-border-secondary bg-oe-background-primary p-3 text-oe-foreground-primary shadow-lg outline-none transition-[transform,opacity] duration-100 data-ending-style:opacity-0 data-starting-style:opacity-0">
                <Popover.Title className="px-1 pb-3 text-sm font-semibold">{monthLabel}</Popover.Title>
                <div className="grid grid-cols-7 text-center" aria-hidden="true">
                  {weekdays.map((weekday, index) => <span key={`${weekday}-${index}`} className="py-1 text-[11px] font-medium text-oe-foreground-tertiary">{weekday}</span>)}
                </div>
                <div className="grid grid-cols-7 gap-0.5" role="grid" aria-label={monthLabel}>
                  {Array.from({ length: 6 }, (_, index) => <span key={`blank-${index}`} />)}
                  {Array.from({ length: 31 }, (_, index) => {
                    const day = index + 1;
                    const selected = day === selectedDay;
                    return (
                      <button
                        key={day}
                        type="button"
                        role="gridcell"
                        aria-selected={selected}
                        onClick={() => { setSelectedDay(day); setOpen(false); }}
                        className={cn("oe-hover-layer flex size-8 items-center justify-center rounded-lg text-xs outline-none hover:text-oe-foreground-primary focus-visible:ring-2 focus-visible:ring-oe-focus-ring", selected ? "bg-oe-background-bold-primary text-oe-foreground-inverse" : "text-oe-foreground-secondary")}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>
      </div>
    </div>
  );
}

function Control({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return <div className="flex items-center gap-2"><span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">{icon}{label}</span><div className="flex rounded-lg bg-muted p-0.5">{children}</div></div>;
}

function Toggle({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" aria-pressed={active} onClick={onClick} className={cn("inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring", active && "bg-background text-foreground shadow-xs")}>{children}</button>;
}

function Choice({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" aria-pressed={active} onClick={onClick} className={cn("oe-hover-layer rounded-lg border border-oe-border-secondary px-2.5 py-1.5 text-xs text-oe-foreground-secondary outline-none focus-visible:ring-2 focus-visible:ring-oe-focus-ring", active && "bg-oe-background-secondary text-oe-foreground-primary")}>{children}</button>;
}
