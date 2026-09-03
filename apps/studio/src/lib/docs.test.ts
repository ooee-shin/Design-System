import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import { docSlugs, hasDoc, listDocs, renderDoc } from "./docs";

test("every system document is listed and reachable as a route", () => {
  const slugs = docSlugs();
  assert.ok(slugs.length > 0, "docs/system 문서를 하나도 찾지 못했다");
  assert.equal(new Set(slugs).size, slugs.length);

  const listed = listDocs();
  assert.equal(listed.length, slugs.length);
  listed.forEach((doc) => {
    assert.ok(hasDoc(doc.slug), `${doc.slug} 문서를 route에서 읽지 못한다`);
    assert.ok(doc.title.trim().length > 0, `${doc.slug} 문서에 제목이 없다`);
    assert.ok(["시작", "Foundations", "Components", "Patterns"].includes(doc.group));
  });
});

test("rendered documents link to Studio routes instead of raw file paths", () => {
  docSlugs().forEach((slug) => {
    const { html } = renderDoc(slug);
    const leftovers = [...html.matchAll(/href="([^"]*\.md[^"]*)"/g)].map((match) => match[1]);
    assert.deepEqual(leftovers, [], `${slug} 문서에 route로 바뀌지 않은 파일 링크가 남았다`);
  });
});

test("every internal document link points at a document that exists", () => {
  docSlugs().forEach((slug) => {
    const { html } = renderDoc(slug);
    [...html.matchAll(/href="\/docs\/([^"#]+)/g)].forEach((match) => {
      assert.ok(hasDoc(match[1]), `${slug} 문서가 없는 문서 ${match[1]} 를 가리킨다`);
    });
  });
});

test("component detail pages can attach the matching specification", () => {
  const registryPath = join(process.cwd(), "apps/studio/src/components/component-registry.ts");
  const keys = [...readSource(registryPath).matchAll(/\{ key: "([a-z-]+)"/g)].map((match) => match[1]);
  assert.ok(keys.length > 0);
  keys.forEach((key) => assert.ok(hasDoc(`components/${key}`), `components/${key}.md 명세 문서가 없다`));
});

function readSource(path: string) {
  assert.ok(existsSync(path), `${path} 를 찾지 못했다`);
  return readFileSync(path, "utf8");
}
