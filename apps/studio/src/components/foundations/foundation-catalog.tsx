import type { ReactNode } from "react";

export type CatalogKind = "Token" | "Primitive" | "Current value" | "Asset";

export function FoundationCatalog({ children }: { children: ReactNode }) {
  return <div className="space-y-5">{children}</div>;
}

export function FoundationSection({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <section className="overflow-hidden rounded-2xl border border-oe-border-secondary bg-oe-background-primary"><div className="border-b border-oe-border-secondary px-4 py-3 sm:px-5"><h2 className="text-sm font-semibold text-oe-foreground-primary">{title}</h2><p className="mt-1 text-xs leading-5 text-oe-foreground-tertiary">{description}</p></div>{children}</section>;
}

export function CatalogTable({ rows }: { rows: Array<{ name: string; kind: CatalogKind; value: string; darkValue?: string; preview?: ReactNode }> }) {
  return <div className="overflow-x-auto"><table className="w-full min-w-[42rem] text-left text-xs"><thead className="border-b border-oe-border-secondary text-[11px] text-oe-foreground-tertiary"><tr><th className="px-4 py-2 font-medium sm:px-5">Name</th><th className="px-4 py-2 font-medium">Type</th><th className="px-4 py-2 font-medium">Light / value</th><th className="px-4 py-2 font-medium">Dark</th><th className="px-4 py-2 font-medium sm:px-5">Preview</th></tr></thead><tbody>{rows.map((row) => <tr key={`${row.kind}-${row.name}`} className="border-b border-oe-border-secondary last:border-b-0"><td className="px-4 py-3 font-mono text-[11px] text-oe-foreground-primary sm:px-5">{row.name}</td><td className="px-4 py-3"><Kind kind={row.kind} /></td><td className="px-4 py-3 font-mono text-[11px] text-oe-foreground-secondary">{row.value}</td><td className="px-4 py-3 font-mono text-[11px] text-oe-foreground-secondary">{row.darkValue ?? "—"}</td><td className="px-4 py-3 text-oe-foreground-primary sm:px-5">{row.preview ?? "—"}</td></tr>)}</tbody></table></div>;
}

export function CatalogGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3">{children}</div>;
}

export function CatalogCard({ name, kind, value, children }: { name: string; kind: CatalogKind; value: string; children: ReactNode }) {
  return <article className="rounded-xl border border-oe-border-secondary bg-oe-background-primary p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-mono text-[11px] text-oe-foreground-primary">{name}</h3><p className="mt-1 font-mono text-[10px] text-oe-foreground-tertiary">{value}</p></div><Kind kind={kind} /></div><div className="mt-5">{children}</div></article>;
}

function Kind({ kind }: { kind: CatalogKind }) {
  return <span className="inline-flex rounded-full bg-oe-background-secondary px-2 py-0.5 text-[10px] font-medium text-oe-foreground-secondary">{kind}</span>;
}
