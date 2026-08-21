"use client";

import { useState } from "react";
import { Languages, Moon, Sun } from "lucide-react";

import {
  MessageBubble,
  TypingIndicator,
  type MessageDeliveryState,
  type MessageDirection,
} from "@/components/candidates/message-bubble";
import { cn } from "@/lib/utils";

type Locale = "ko" | "en" | "ja";
type Theme = "light" | "dark";

const copy = {
  ko: {
    incomingAuthor: "Priya Kapoor",
    outgoingAuthor: "나",
    incoming: "공용 풀 사용률이 높아졌어요. 출시 주간에 전용 러너 두 대를 확보할 수 있을까요?",
    outgoing: "네. 두 대를 예약하고 풀의 확장 기준을 낮추겠습니다.",
    long: "여러 줄로 이어지는 메시지에서 한글의 행간과 버블 내부 여백이 과하게 벌어지지 않는지 확인합니다. 화면 폭이 줄어들어도 읽기 편해야 합니다.",
    typing: "Priya Kapoor님이 작성 중입니다.",
    states: { sending: "전송 중", sent: "전송됨", delivered: "전달됨", read: "읽음", failed: "전송 실패" },
  },
  en: {
    incomingAuthor: "Priya Kapoor",
    outgoingAuthor: "You",
    incoming: "Shared pool usage is climbing. Can we reserve two dedicated runners for launch week?",
    outgoing: "Yes. I’ll reserve two and lower the scaling threshold.",
    long: "This longer message checks line length, wrapping, and the internal spacing of the bubble across narrower layouts without making the conversation difficult to scan.",
    typing: "Priya Kapoor is typing.",
    states: { sending: "Sending", sent: "Sent", delivered: "Delivered", read: "Read", failed: "Failed" },
  },
  ja: {
    incomingAuthor: "Priya Kapoor",
    outgoingAuthor: "自分",
    incoming: "共有プールの使用率が上がっています。リリース週に専用ランナーを2台確保できますか？",
    outgoing: "はい。2台を予約し、スケール基準を下げます。",
    long: "複数行のメッセージで行間や吹き出し内の余白を確認します。画面幅が狭くなっても読みやすさを保つ必要があります。",
    typing: "Priya Kapoorさんが入力しています。",
    states: { sending: "送信中", sent: "送信済み", delivered: "配信済み", read: "既読", failed: "送信失敗" },
  },
} satisfies Record<Locale, {
  incomingAuthor: string;
  outgoingAuthor: string;
  incoming: string;
  outgoing: string;
  long: string;
  typing: string;
  states: Record<MessageDeliveryState, string>;
}>;

const states: MessageDeliveryState[] = ["sending", "sent", "delivered", "read", "failed"];

export function MessageBubbleWorkbench() {
  const [theme, setTheme] = useState<Theme>("light");
  const [locale, setLocale] = useState<Locale>("ko");
  const [direction, setDirection] = useState<MessageDirection>("incoming");
  const [showAvatar, setShowAvatar] = useState(true);
  const [longMessage, setLongMessage] = useState(false);
  const activeCopy = copy[locale];

  return (
    <section className="overflow-hidden rounded-2xl border bg-background shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-3 sm:px-4">
        <div className="flex flex-wrap gap-3">
          <Control label="모드">
            <Toggle active={theme === "light"} onClick={() => setTheme("light")}><Sun className="size-3.5" />라이트</Toggle>
            <Toggle active={theme === "dark"} onClick={() => setTheme("dark")}><Moon className="size-3.5" />다크</Toggle>
          </Control>
          <Control label="언어" icon={<Languages className="size-3.5" />}>
            {(["ko", "en", "ja"] as const).map((value) => <Toggle key={value} active={locale === value} onClick={() => setLocale(value)}>{value.toUpperCase()}</Toggle>)}
          </Control>
        </div>
        <span className="rounded-full border bg-background px-2 py-0.5 text-[11px] text-muted-foreground">Candidate</span>
      </div>

      <div className={cn("preview-canvas bg-oe-background-canvas-secondary p-4 text-oe-foreground-primary sm:p-6", theme === "dark" && "dark")} lang={locale}>
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
              >
                {longMessage ? activeCopy.long : direction === "outgoing" ? activeCopy.outgoing : activeCopy.incoming}
              </MessageBubble>
            </WorkbenchSection>

            <WorkbenchSection title="Conversation states" description="Typing indicator는 MessageBubble과 분리된 thread 상태입니다.">
              <div className="space-y-4">
                <MessageBubble direction="incoming" author={activeCopy.incomingAuthor} initials="PK" time="09:12">{activeCopy.incoming}</MessageBubble>
                <MessageBubble direction="outgoing" author={activeCopy.outgoingAuthor} initials="SM" time="09:20">{activeCopy.outgoing}</MessageBubble>
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
                    deliveryCopy={activeCopy.states}
                    showAvatar={false}
                  >
                    {activeCopy.outgoing}
                  </MessageBubble>
                </div>
              ))}
            </div>
          </WorkbenchSection>
        </div>
      </div>
    </section>
  );
}

function WorkbenchSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-oe-border-secondary bg-oe-background-primary p-4 sm:p-5"><div className="mb-5"><h2 className="text-sm font-semibold">{title}</h2><p className="mt-1 text-xs text-oe-foreground-secondary">{description}</p></div>{children}</section>;
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
