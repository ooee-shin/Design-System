import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, posix, resolve } from "node:path";

import { marked } from "marked";

export type DocEntry = {
  /** docs/system 기준 상대 경로에서 확장자를 뺀 값. 그대로 /docs/<slug> 가 된다. */
  slug: string;
  title: string;
  summary: string;
  group: "시작" | "Foundations" | "Components";
};

/** `docs/system`은 저장소 루트에 있고 Studio는 apps/studio 에서 실행되므로 두 위치를 모두 확인한다. */
function docsRoot() {
  for (const candidate of [join(process.cwd(), "docs", "system"), resolve(process.cwd(), "..", "..", "docs", "system")]) {
    if (existsSync(candidate)) return candidate;
  }
  throw new Error("docs/system 을 찾지 못했다. Studio는 저장소 안에서 실행해야 한다.");
}

function walk(directory: string, prefix = ""): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const next = prefix ? posix.join(prefix, entry.name) : entry.name;
    if (entry.isDirectory()) return walk(join(directory, entry.name), next);
    return entry.name.endsWith(".md") ? [next.replace(/\.md$/, "")] : [];
  });
}

function groupOf(slug: string): DocEntry["group"] {
  if (slug.startsWith("foundations/")) return "Foundations";
  if (slug.startsWith("components/")) return "Components";
  return "시작";
}

function readDoc(slug: string) {
  return readFileSync(join(docsRoot(), `${slug}.md`), "utf8");
}

export function listDocs(): DocEntry[] {
  const order: DocEntry["group"][] = ["시작", "Foundations", "Components"];
  return walk(docsRoot())
    .map((slug) => {
      const source = readDoc(slug);
      const heading = source.match(/^#\s+(.+)$/m);
      const summary = source
        .split("\n")
        .slice(1)
        .find((line) => line.trim() && !line.startsWith("#") && !line.startsWith("|") && !line.startsWith("-"));
      return {
        slug,
        title: heading ? heading[1].trim() : slug,
        summary: summary ? summary.replace(/[*`]/g, "").trim() : "",
        group: groupOf(slug),
      };
    })
    .sort((a, b) => order.indexOf(a.group) - order.indexOf(b.group) || a.slug.localeCompare(b.slug));
}

export function docSlugs() {
  return walk(docsRoot());
}

export function hasDoc(slug: string) {
  return existsSync(join(docsRoot(), `${slug}.md`));
}

/**
 * 문서 안의 상대 링크(`vocabulary.md`, `../vocabulary.md`)를 Studio route 로 바꾼다.
 * 문서끼리의 참조가 저장소 밖으로 새지 않게 하는 것이 목적이다.
 */
function rewriteLinks(html: string, slug: string) {
  const directory = posix.dirname(slug);
  return html.replace(/href="([^"]+)"/g, (match, href: string) => {
    if (/^(https?:|#|\/)/.test(href)) return match;
    const [path, hash = ""] = href.split("#");
    if (!path.endsWith(".md")) return match;
    const target = posix.normalize(posix.join(directory === "." ? "" : directory, path)).replace(/\.md$/, "");
    return `href="/docs/${target}${hash ? `#${hash}` : ""}"`;
  });
}

/** 넓은 표가 본문을 가로로 밀지 않도록 표만 따로 스크롤 영역에 넣는다. */
function wrapTables(html: string) {
  return html.replaceAll("<table>", '<div class="studio-markdown-table"><table>').replaceAll("</table>", "</table></div>");
}

export function renderDoc(slug: string) {
  const source = readDoc(slug);
  const html = marked.parse(source, { async: false, gfm: true });
  const heading = source.match(/^#\s+(.+)$/m);
  return { title: heading ? heading[1].trim() : slug, html: wrapTables(rewriteLinks(html, slug)) };
}
