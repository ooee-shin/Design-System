"use client";

import * as React from "react";

import { Tooltip } from "@base-ui/react/tooltip";
import { Popover } from "@base-ui/react/popover";
import {
  RiCheckDoubleLine as CheckCheck,
  RiCheckLine as Check,
  RiDeleteBinLine as Trash2,
  RiFileCopyLine as Copy,
  RiInformationLine as Info,
  RiRestartLine as RotateCcw,
  RiTimeLine as Clock3,
} from "@remixicon/react";

import { cn } from "./utils";

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
  unreadMessageCount,
  unreadMessageLabel,
  deliveryCopy,
  deleted = false,
  deletedLabel,
  showDeletedContent,
  showAvatar = true,
  grouped = false,
  showTime,
  outgoingSenderLabel,
  outgoingSenderDescription,
  actions,
  failedActions,
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
  unreadMessageCount?: number;
  unreadMessageLabel?: string;
  deliveryCopy?: DeliveryCopy;
  deleted?: boolean;
  deletedLabel?: string;
  showDeletedContent?: boolean;
  showAvatar?: boolean;
  grouped?: boolean;
  showTime?: boolean;
  outgoingSenderLabel?: string;
  outgoingSenderDescription?: string;
  actions?: {
    copyLabel: string;
    deleteLabel: string;
    onCopy?: () => void;
    onDelete?: () => void;
  };
  failedActions?: {
    retryLabel: string;
    deleteLabel: string;
    onRetry?: () => void;
    onDelete?: () => void;
  };
  className?: string;
}) {
  const outgoing = direction === "outgoing";
  const deletedContentVisible = showDeletedContent ?? outgoing;
  const timeVisible = showTime ?? !grouped;

  return (
    <div data-direction={direction} className={cn("group/message flex gap-3", outgoing && "justify-end", grouped && !outgoing && "pl-11", className)}>
      {showAvatar && !grouped && !outgoing && (
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-oe-background-secondary text-[11px] font-medium text-oe-foreground-secondary"
          aria-hidden="true"
        >
          {initials}
        </span>
      )}
      <div className={cn("flex min-w-0 max-w-[82%] flex-col sm:max-w-[72%]", outgoing && "items-end")}>
        {!grouped && !outgoing && (
          <div
            className="mb-1 flex min-w-0 items-center gap-1 px-1 text-xs text-oe-foreground-tertiary"
          >
            <span className="text-oe-label truncate font-semibold text-oe-foreground-primary">{author}</span>
          </div>
        )}
        <div className={cn("flex max-w-full items-end gap-1.5", outgoing && "flex-row-reverse")}>
          <div
            className={cn(
              "oe-message-bubble min-w-0 rounded-2xl px-[14px] py-2 text-sm leading-relaxed",
              deleted
                ? outgoing
                  ? "oe-message-bubble-outgoing text-oe-foreground-inverse-secondary"
                  : "oe-message-bubble-incoming text-oe-foreground-secondary"
                : outgoing
                ? "oe-message-bubble-outgoing"
                : "oe-message-bubble-incoming",
            )}
          >
            {deleted && deletedLabel && (
              <div className={cn("flex items-center gap-1 text-sm font-medium", outgoing ? "oe-message-bubble-outgoing-strong" : "text-oe-foreground-secondary", deletedContentVisible && "mb-1.5")}>
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
              {actions && deliveryState !== "failed" && (
                <div className="absolute right-0 bottom-0">
                  <MessageActions {...actions} canDelete />
                </div>
              )}
            </div>
          ) : !deleted && (actions || unreadMessageCount !== undefined) ? (
            <div className="relative flex min-h-8 min-w-8 shrink-0 items-end justify-start pb-1">
              {unreadMessageCount !== undefined && unreadMessageCount > 0 && (
                <span className="text-xs tabular-nums text-oe-foreground-tertiary" aria-label={unreadMessageLabel}>
                  {unreadMessageCount}
                </span>
              )}
              {actions && (
                <div className="absolute bottom-0 left-0">
                  <MessageActions {...actions} canDelete={false} />
                </div>
              )}
            </div>
          ) : null}
        </div>
        {timeVisible && (
          <div className={cn("mt-1 flex min-h-5 min-w-0 items-center gap-1 px-1 text-xs text-oe-foreground-tertiary", outgoing ? "justify-end" : "justify-start")}>
            {outgoing && outgoingSenderLabel && (
              <>
                <span className="inline-flex min-w-0 items-center gap-0 truncate font-medium text-oe-foreground-secondary">
                  {outgoingSenderDescription && <SenderInfoTooltip description={outgoingSenderDescription} />}
                  <span className="truncate">{outgoingSenderLabel}</span>
                </span>
                <span aria-hidden="true">·</span>
              </>
            )}
            <span>{time}</span>
            {deliveryState && deliveryCopy && (
              <DeliveryState state={deliveryState} label={deliveryCopy[deliveryState]} hasUnreadCount={unreadRecipientCount !== undefined} />
            )}
            {outgoing && deliveryState === "failed" && failedActions && (
              <FailedRecoveryActions {...failedActions} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function FailedRecoveryActions({
  retryLabel,
  deleteLabel,
  onRetry,
  onDelete,
}: {
  retryLabel: string;
  deleteLabel: string;
  onRetry?: () => void;
  onDelete?: () => void;
}) {
  return (
    <span className="ml-0.5 inline-flex shrink-0 items-center gap-0.5" aria-label={`${retryLabel}, ${deleteLabel}`}>
      <ActionTooltip label={retryLabel} onClick={onRetry} icon={<RotateCcw className="size-3.5" aria-hidden="true" />} />
      <ActionTooltip label={deleteLabel} onClick={onDelete} danger icon={<Trash2 className="size-3.5" aria-hidden="true" />} />
    </span>
  );
}

function SenderInfoTooltip({ description }: { description: string }) {
  return (
    <Popover.Root>
      <Popover.Trigger type="button" className="oe-hover-layer inline-flex size-5 shrink-0 items-center justify-center rounded-md text-oe-foreground-tertiary outline-none transition-colors hover:text-oe-foreground-secondary focus-visible:ring-2 focus-visible:ring-oe-focus-ring" aria-label={description}>
        <Info className="size-3" aria-hidden="true" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner positionMethod="fixed" side="top" align="end" sideOffset={6} collisionPadding={8} collisionAvoidance={{ side: "flip", align: "shift" }}>
          <Popover.Popup className="text-oe-label z-50 max-w-72 rounded-lg border border-neutral-200 bg-white px-2.5 py-2 leading-5 font-normal text-neutral-950 shadow-sm outline-none transition-[transform,opacity] duration-100 data-ending-style:opacity-0 data-starting-style:opacity-0">
            {description}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

function MessageActions({
  copyLabel,
  deleteLabel,
  onCopy,
  onDelete,
  canDelete,
}: {
  copyLabel: string;
  deleteLabel: string;
  onCopy?: () => void;
  onDelete?: () => void;
  canDelete: boolean;
}) {
  return (
    <ActionBar>
      <ActionTooltip label={copyLabel} onClick={onCopy} icon={<Copy className="size-3.5" aria-hidden="true" />} />
      {canDelete && (
        <ActionTooltip label={deleteLabel} onClick={onDelete} danger icon={<Trash2 className="size-3.5" aria-hidden="true" />} />
      )}
    </ActionBar>
  );
}

function ActionBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="pointer-events-none relative flex shrink-0 items-center rounded-lg border border-oe-border-secondary bg-oe-background-primary p-0.5 opacity-0 transition-opacity group-hover/message:pointer-events-auto group-hover/message:opacity-100 group-focus-within/message:pointer-events-auto group-focus-within/message:opacity-100">
      {children}
    </div>
  );
}

function ActionTooltip({ label, onClick, icon, danger = false }: { label: string; onClick?: () => void; icon: React.ReactNode; danger?: boolean }) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger
        type="button"
        delay={150}
        onClick={onClick}
        className={cn(
          "oe-hover-layer rounded-md p-1.5 text-oe-foreground-tertiary outline-none focus-visible:ring-2 focus-visible:ring-oe-focus-ring",
          danger ? "hover:bg-oe-danger-background-primary hover:text-oe-danger-foreground-primary" : "hover:text-oe-foreground-primary",
        )}
        aria-label={label}
      >
        {icon}
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Positioner positionMethod="fixed" side="bottom" align="center" sideOffset={4} collisionPadding={8} collisionAvoidance={{ side: "flip", align: "shift" }}>
          <Tooltip.Popup className="text-oe-label z-50 w-max whitespace-nowrap rounded-lg bg-oe-background-bold-primary px-2 py-1.5 font-normal text-oe-foreground-inverse shadow-sm transition-[transform,opacity] duration-100 data-ending-style:opacity-0 data-starting-style:opacity-0">
            {label}
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
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
