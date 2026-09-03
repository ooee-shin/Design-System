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
      <div className="rounded-xl border border-oe-border-primary bg-oe-background-primary transition-shadow focus-within:border-oe-focus-ring focus-within:ring-3 focus-within:ring-oe-focus-ring/20">
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
          <Button type="button" variant="ghost" size="sm" className="oe-hover-layer text-oe-foreground-tertiary hover:bg-transparent hover:text-oe-foreground-primary focus-visible:ring-oe-focus-ring">
            <Paperclip data-icon="inline-start" />{attachLabel}
          </Button>
          <Button type="submit" size="sm" disabled={!value.trim()} className="oe-hover-layer bg-oe-background-bold-primary text-oe-foreground-inverse hover:bg-oe-background-bold-primary focus-visible:ring-oe-focus-ring disabled:bg-oe-background-disabled disabled:text-oe-foreground-disabled disabled:opacity-100">
            <Send data-icon="inline-start" />{sendLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}
