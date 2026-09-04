import assert from "node:assert/strict";
import test from "node:test";

import { presentationEntries } from "./presentation-entries";

test("each presentation entry keeps a title and the sections under it", () => {
  assert.ok(presentationEntries.length > 0);
  assert.equal(new Set(presentationEntries.map((entry) => entry.id)).size, presentationEntries.length);

  presentationEntries.forEach((entry) => {
    assert.match(entry.id, /^[a-z0-9-]+$/, `${entry.id} 는 route 와 앵커에 쓰이므로 소문자와 하이픈만 사용한다`);
    assert.ok(entry.title.trim().length > 0, `${entry.id} 에 제목이 없다`);
    assert.ok(entry.sections.length >= 2, `${entry.id} 에 왜와 무엇을·어떻게가 모두 있어야 한다`);
    [...(entry.caption ?? "").matchAll(/\[[^\]]+\]\(([^)]+)\)/g)].forEach(([, href]) => {
      assert.match(href, /^\//, `${entry.id} 의 캡션 링크 ${href} 는 Studio 내부 경로여야 한다`);
    });
    entry.sections.forEach((section) => {
      assert.ok(section.heading.trim().length > 0, `${entry.id} 의 소제목이 비어 있다`);
      assert.ok(section.body.trim().length > 0, `${entry.id} 의 설명이 비어 있다`);
      [...section.body.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)].forEach(([, href]) => {
        assert.match(href, /^\//, `${entry.id} 의 본문 링크 ${href} 는 Studio 내부 경로여야 한다`);
      });
    });
  });
});

