import { AlertCircle, Check, CheckCheck, Clock3 } from "lucide-react";

import { cn } from "@/lib/utils";

export type MessageDirection = "incoming" | "outgoing";
export type MessageDeliveryState = "sending" | "sent" | "delivered" | "read" | "failed";

type DeliveryCopy = Record<MessageDeliveryState, string>;

export function MessageBubble({
  direction,
  author,
  initials,
  time,
  children,
  deliveryState,
  deliveryCopy,
  showAvatar = true,
  className,
}: {
  direction: MessageDirection;
  author: string;
  initials: string;
  time: string;
  children: React.ReactNode;
  deliveryState?: MessageDeliveryState;
  deliveryCopy?: DeliveryCopy;
  showAvatar?: boolean;
  className?: string;
}) {
  const outgoing = direction === "outgoing";

  return (
    <div className={cn("flex gap-3", outgoing && "flex-row-reverse", className)}>
      {showAvatar && (
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-medium",
            outgoing
              ? "bg-oe-background-bold-primary text-oe-foreground-inverse"
              : "bg-oe-background-secondary text-oe-foreground-secondary",
          )}
          aria-hidden="true"
        >
          {initials}
        </span>
      )}
      <div
        className={cn(
          "oe-message-bubble max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed sm:max-w-[72%]",
          outgoing
            ? "bg-oe-background-bold-primary text-oe-foreground-inverse"
            : "bg-oe-background-secondary text-oe-foreground-primary",
          deliveryState === "failed" && "ring-1 ring-oe-danger-foreground-primary/40",
        )}
      >
        <div
          className={cn(
            "mb-1 flex min-w-0 items-center gap-1 text-xs",
            outgoing ? "text-oe-foreground-inverse-secondary" : "text-oe-foreground-tertiary",
          )}
        >
          <span className="truncate">{author} · {time}</span>
          {deliveryState && deliveryCopy && (
            <DeliveryState state={deliveryState} label={deliveryCopy[deliveryState]} />
          )}
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

function DeliveryState({ state, label }: { state: MessageDeliveryState; label: string }) {
  const Icon = state === "sending" ? Clock3 : state === "sent" ? Check : state === "failed" ? AlertCircle : CheckCheck;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-0.5",
        state === "failed" && "text-oe-danger-foreground-primary",
      )}
      aria-label={label}
      title={label}
    >
      <Icon className="size-3" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function TypingIndicator({
  initials,
  label,
  showAvatar = true,
}: {
  initials: string;
  label: string;
  showAvatar?: boolean;
}) {
  return (
    <div className="flex gap-3" role="status" aria-label={label}>
      {showAvatar && (
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-oe-background-secondary text-[11px] font-medium text-oe-foreground-secondary" aria-hidden="true">
          {initials}
        </span>
      )}
      <div className="flex h-10 items-center gap-1 rounded-2xl bg-oe-background-secondary px-4">
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className="size-1.5 animate-pulse rounded-full bg-oe-foreground-tertiary motion-reduce:animate-none"
            style={{ animationDelay: `${index * 160}ms` }}
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  );
}
