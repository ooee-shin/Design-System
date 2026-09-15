"use client";

import type { FormEvent } from "react";
import { RiAttachmentLine as Paperclip, RiSendPlane2Line as Send } from "@remixicon/react";

import { Button } from "./button";
import { Textarea } from "./textarea";

export type MessageComposerProps = {
  value: string;
  onValueChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  placeholder: string;
  attachLabel: string;
  sendLabel: string;
  className?: string;
};

export function MessageComposer({ value, onValueChange, onSubmit, placeholder, attachLabel, sendLabel, className = "border-t border-oe-border-secondary p-3 sm:p-4" }: MessageComposerProps) {
  return (
    <form onSubmit={onSubmit} className={className}>
      <div className="rounded-xl border border-oe-border-secondary bg-oe-background-primary transition-shadow focus-within:border-oe-focus-ring focus-within:ring-3 focus-within:ring-oe-focus-ring/20">
        <Textarea
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          rows={2}
          placeholder={placeholder}
          aria-label={placeholder}
          containerClassName="min-h-16 rounded-none border-0 bg-transparent focus-within:border-transparent focus-within:ring-0"
          className="min-h-16 resize-none bg-transparent text-oe-foreground-primary caret-oe-foreground-primary placeholder:text-oe-foreground-tertiary"
        />
        <div className="flex items-center justify-between px-2.5 pb-2">
          <Button type="button" variant="ghost" tone="neutral" controlSize="small" leadingIcon={<Paperclip />}>
            {attachLabel}
          </Button>
          <Button type="submit" controlSize="small" disabled={!value.trim()} leadingIcon={<Send />}>
            {sendLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}
