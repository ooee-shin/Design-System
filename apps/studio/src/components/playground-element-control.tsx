"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { RiCalendarLine, RiGlobalLine, RiLockPasswordLine, RiSearchLine, RiUserLine } from "@remixicon/react";

export type PlaygroundElementKind = "none" | "icon" | "image";
export type PlaygroundElementIcon = "search" | "password" | "user" | "global" | "calendar";
export type PlaygroundElementImage = "avatar";
export type PlaygroundElementValue = {
  kind: PlaygroundElementKind;
  icon: PlaygroundElementIcon;
  image: PlaygroundElementImage;
};

const icons: Array<[PlaygroundElementIcon, string]> = [["search", "Search"], ["password", "Password lock"], ["user", "User"], ["global", "Global"], ["calendar", "Calendar"]];
const images: Array<[PlaygroundElementImage, string, string]> = [["avatar", "Avatar", "/images/avatar-sample.png"]];

export function PlaygroundElementControl({ label, value, onChange, showValueControl = true }: { label: string; value: PlaygroundElementValue; onChange: (value: PlaygroundElementValue) => void; showValueControl?: boolean }) {
  const values: PlaygroundElementKind[] = ["none", "icon", "image"];
  return (
    <fieldset>
      <legend className="mb-2 text-[11px] font-medium text-oe-foreground-tertiary">{label}</legend>
      <div className="flex flex-wrap gap-1.5">
        {values.map((kind) => <PlaygroundChoice key={kind} active={value.kind === kind} onClick={() => onChange({ ...value, kind })}>{capitalize(kind)}</PlaygroundChoice>)}
      </div>
      {showValueControl && value.kind !== "none" ? (
        <DependentControlGroup className="mt-3">
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-medium text-oe-foreground-tertiary">Value</span>
            <div className="flex h-8 items-center gap-2 rounded-lg border border-oe-border-primary bg-oe-background-primary px-2.5 focus-within:border-oe-focus-ring focus-within:ring-1 focus-within:ring-oe-focus-ring">
              <PlaygroundElementGraphic value={value} />
              <select
                value={value.kind === "icon" ? value.icon : value.image}
                onChange={(event) => onChange(value.kind === "icon" ? { ...value, icon: event.target.value as PlaygroundElementIcon } : { ...value, image: event.target.value as PlaygroundElementImage })}
                className="h-full min-w-0 flex-1 bg-transparent text-xs text-oe-foreground-primary outline-none"
              >
                {(value.kind === "icon" ? icons : images).map(([optionValue, name]) => <option key={optionValue} value={optionValue}>{name}</option>)}
              </select>
            </div>
          </label>
        </DependentControlGroup>
      ) : null}
    </fieldset>
  );
}

export function PlaygroundElementGraphic({ value, className = "size-4" }: { value: PlaygroundElementValue; className?: string }) {
  if (value.kind === "none") return null;
  if (value.kind === "image") {
    const source = images.find(([image]) => image === value.image)?.[2] ?? "/images/avatar-sample.png";
    return <span aria-hidden="true" className={`relative block shrink-0 overflow-hidden rounded ${className}`}><Image src={source} alt="" fill sizes="32px" className="object-cover" /><span className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_var(--oe-border-visual)]" /></span>;
  }
  const Icon = value.icon === "search" ? RiSearchLine : value.icon === "password" ? RiLockPasswordLine : value.icon === "user" ? RiUserLine : value.icon === "global" ? RiGlobalLine : RiCalendarLine;
  return <Icon aria-hidden="true" className={`shrink-0 ${className}`} />;
}

export function DependentControlGroup({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`relative pl-4 before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:rounded-full before:bg-oe-border-primary ${className}`}>{children}</div>;
}

export function PlaygroundChoice({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return <button type="button" aria-pressed={active} onClick={onClick} className={`rounded-lg border px-2.5 py-1.5 text-xs transition-colors ${active ? "border-oe-foreground-primary bg-oe-background-bold-primary text-oe-foreground-inverse" : "border-oe-border-secondary bg-oe-background-primary text-oe-foreground-secondary hover:bg-oe-interaction-hover"}`}>{children}</button>;
}

function capitalize(value: string) { return value.charAt(0).toUpperCase() + value.slice(1); }
