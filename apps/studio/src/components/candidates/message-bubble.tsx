import { Check, CheckCheck, Clock3, Copy, Info, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";

export type MessageDirection = "incoming" | "outgoing";
export type MessageDeliveryState = "sending" | "sent" | "read" | "failed";

type DeliveryCopy = Record<MessageDeliveryState, string>;

export function MessageBubble({
  direction,
  author,
  initials,
  time,
  children,
  deliveryState,
  unreadRecipientCount,
  unreadRecipientLabel,
  deliveryCopy,
  deleted = false,
  deletedLabel,
  showDeletedContent,
  showAvatar = true,
  actions,
  className,
}: {
  direction: MessageDirection;
  author: string;
  initials: string;
  time: string;
  children: React.ReactNode;
  deliveryState?: MessageDeliveryState;
  unreadRecipientCount?: number;
  unreadRecipientLabel?: string;
  deliveryCopy?: DeliveryCopy;
  deleted?: boolean;
  deletedLabel?: string;
  showDeletedContent?: boolean;
  showAvatar?: boolean;
  actions?: {
    copyLabel: string;
    deleteLabel: string;
    onCopy?: () => void;
    onDelete?: () => void;
  };
  className?: string;
}) {
  const outgoing = direction === "outgoing";
  const deletedContentVisible = showDeletedContent ?? outgoing;

  return (
    <div className={cn("group/message flex gap-3", outgoing && "justify-end", className)}>
      {showAvatar && !outgoing && (
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-oe-background-secondary text-[11px] font-medium text-oe-foreground-secondary"
          aria-hidden="true"
        >
          {initials}
        </span>
      )}
      <div className={cn("flex min-w-0 max-w-[82%] flex-col sm:max-w-[72%]", outgoing && "items-end")}>
        <div
          className={cn(
            "mb-1 flex min-w-0 items-center gap-1 px-1 text-xs text-oe-foreground-tertiary",
            outgoing && "justify-end",
          )}
        >
          <span className="truncate">{author} · {time}</span>
          {deliveryState && deliveryCopy && (
            <DeliveryState state={deliveryState} label={deliveryCopy[deliveryState]} hasUnreadCount={unreadRecipientCount !== undefined} />
          )}
        </div>
        <div className={cn("flex max-w-full items-end gap-1.5", outgoing && "flex-row-reverse")}>
          <div
            className={cn(
              "oe-message-bubble min-w-0 rounded-2xl px-4 py-3 text-sm leading-relaxed",
              deleted
                ? outgoing
                  ? "bg-oe-background-bold-primary text-oe-foreground-inverse-secondary"
                  : "bg-oe-background-secondary text-oe-foreground-secondary"
                : outgoing
                ? "bg-oe-background-bold-primary text-oe-foreground-inverse"
                : "bg-oe-background-secondary text-oe-foreground-primary",
            )}
          >
            {deleted && deletedLabel && (
              <div className={cn("flex items-center gap-1 text-sm font-medium", outgoing ? "text-oe-foreground-inverse" : "text-oe-foreground-secondary", deletedContentVisible && "mb-1.5")}>
                <Info className="size-3.5" aria-hidden="true" />
                <span>{deletedLabel}</span>
              </div>
            )}
            {(!deleted || deletedContentVisible) && (
              <div>{children}</div>
            )}
          </div>
          {outgoing && !deleted ? (
            <div className="relative flex min-h-8 min-w-8 shrink-0 items-end justify-end pb-1">
              {unreadRecipientCount !== undefined && unreadRecipientCount > 0 && (
                <span className="text-xs tabular-nums text-oe-foreground-tertiary" aria-label={unreadRecipientLabel}>
                  {unreadRecipientCount}
                </span>
              )}
              {deliveryState === "read" && unreadRecipientCount === 0 && deliveryCopy && (
                <span className="pb-0.5 text-oe-foreground-tertiary" aria-label={deliveryCopy.read} title={deliveryCopy.read}>
                  <CheckCheck className="size-3.5" aria-hidden="true" />
                </span>
              )}
              {deliveryState === "failed" && deliveryCopy && (
                <span className="flex size-3.5 items-center justify-center rounded-full bg-oe-danger-foreground-primary text-[10px] leading-none font-bold text-oe-foreground-inverse" aria-label={deliveryCopy.failed} title={deliveryCopy.failed}>
                  !
                </span>
              )}
              {actions && (
                <div className="absolute right-0 bottom-0">
                  <MessageActions {...actions} />
                </div>
              )}
            </div>
          ) : actions && !deleted ? (
            <MessageActions {...actions} />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function MessageActions({
  copyLabel,
  deleteLabel,
  onCopy,
  onDelete,
}: {
  copyLabel: string;
  deleteLabel: string;
  onCopy?: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className="pointer-events-none relative flex shrink-0 translate-y-1 items-center rounded-lg border border-oe-border-secondary bg-oe-background-primary p-0.5 opacity-0 transition-[opacity,transform] group-hover/message:pointer-events-auto group-hover/message:translate-y-0 group-hover/message:opacity-100 group-focus-within/message:pointer-events-auto group-focus-within/message:translate-y-0 group-focus-within/message:opacity-100">
      <button type="button" onClick={onCopy} className="oe-hover-layer rounded-md p-1.5 text-oe-foreground-tertiary outline-none hover:text-oe-foreground-primary focus-visible:ring-2 focus-visible:ring-oe-focus-ring" aria-label={copyLabel} title={copyLabel}>
        <Copy className="size-3.5" aria-hidden="true" />
      </button>
      <button type="button" onClick={onDelete} className="rounded-md p-1.5 text-oe-foreground-tertiary outline-none hover:bg-oe-danger-background-primary hover:text-oe-danger-foreground-primary focus-visible:ring-2 focus-visible:ring-oe-focus-ring" aria-label={deleteLabel} title={deleteLabel}>
        <Trash2 className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}

function DeliveryState({ state, label, hasUnreadCount }: { state: MessageDeliveryState; label: string; hasUnreadCount: boolean }) {
  if (hasUnreadCount) return null;

  if (state === "failed") {
    return <span className="shrink-0 text-oe-danger-foreground-primary">{label}</span>;
  }

  const Icon = state === "sending" ? Clock3 : state === "read" ? CheckCheck : Check;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-0.5",
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
