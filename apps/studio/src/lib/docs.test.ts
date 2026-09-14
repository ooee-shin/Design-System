import assert from "node:assert/strict";
import test from "node:test";

import { componentRegistry } from "../components/component-registry";
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
    assert.ok(["시작", "Foundations", "Components"].includes(doc.group));
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
  // 상세 화면을 가진 컴포넌트만 명세를 요구한다. `초안`은 명세와 상세 화면을 아직 갖지 않은 단계를 뜻한다.
  const settled = componentRegistry.filter((item) => item.status === "확정");
  assert.ok(settled.length > 0);
  settled.forEach((item) => assert.ok(hasDoc(`components/${item.key}`), `components/${item.key}.md 명세 문서가 없다`));
});
