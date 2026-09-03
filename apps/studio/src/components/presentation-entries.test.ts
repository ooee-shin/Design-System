import assert from "node:assert/strict";
import test from "node:test";

import { pendingTopics, presentationEntries } from "./presentation-entries";

test("each presentation entry answers what, why and how", () => {
  assert.ok(presentationEntries.length > 0);
  assert.equal(new Set(presentationEntries.map((entry) => entry.id)).size, presentationEntries.length);

  presentationEntries.forEach((entry) => {
    assert.match(entry.id, /^[a-z0-9-]+$/, `${entry.id} 는 route 와 앵커에 쓰이므로 소문자와 하이픈만 사용한다`);
    assert.ok(entry.title.trim().length > 0, `${entry.id} 에 제목이 없다`);
    assert.ok(entry.why.trim().length > 0, `${entry.id} 에 이유가 없다`);
    assert.ok(entry.how.trim().length > 0, `${entry.id} 에 결과가 없다`);
  });
});

test("pending topics keep a place to fill them from", () => {
  assert.equal(new Set(pendingTopics.map((topic) => topic.title)).size, pendingTopics.length);
  pendingTopics.forEach((topic) => {
    assert.ok(topic.title.trim().length > 0);
    assert.ok(topic.source.trim().length > 0, `${topic.title} 에 내용을 채울 자리가 없다`);
  });
});

test("a topic that has been written is not still listed as pending", () => {
  const written = new Set(presentationEntries.map((entry) => entry.title));
  pendingTopics.forEach((topic) => {
    assert.ok(!written.has(topic.title), `${topic.title} 는 이미 기록했으므로 기록할 것에서 뺀다`);
  });
});
