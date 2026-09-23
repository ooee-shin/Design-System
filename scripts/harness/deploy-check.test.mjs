// 판정과 인수 읽기만 본다. gh 와 네트워크는 부르지 않는다.
import assert from "node:assert/strict";
import test from "node:test";

import { parseArgs, pickRun, screenUrl, summarize } from "./deploy-check.mjs";

test("화면 주소는 배포된 sandbox 의 key 자리다", () => {
  assert.equal(screenUrl("shop-cart"), "https://ooee-sandbox.pages.dev/shop-cart");
});

test("이 머지 commit 의 실행만 고르고, 여러 번 돌았으면 가장 늦은 것이다", () => {
  const runs = [
    { id: 3, headSha: "abc" },
    { id: 2, headSha: "abc" },
    { id: 1, headSha: "zzz" },
  ];
  assert.equal(pickRun(runs, "abc").id, 3);
  assert.equal(pickRun(runs, "nope"), null);
  assert.equal(pickRun(undefined, "abc"), null);
});

test("주소가 모두 200 이고 실행이 성공해야 통과다", () => {
  const screens = [{ key: "a", status: 200 }, { key: "b", status: 200 }];
  assert.deepEqual(summarize({ run: { id: 9, conclusion: "success" }, screens }), { ok: true, reason: null });
  assert.equal(summarize({ run: null, screens }).ok, true, "실행을 보지 않는 결과만 올리기에서도 주소로 판정한다");
});

test("실행이 성공해도 주소가 200 이 아니면 막는다", () => {
  // secret 이 없으면 workflow 가 배포를 건너뛴 채 success 로 끝난다. 판정은 주소다.
  const report = summarize({ run: { id: 9, conclusion: "success" }, screens: [{ key: "a", status: 200 }, { key: "b", status: 404 }] });
  assert.equal(report.ok, false);
  assert.match(report.reason, /b 404/);
});

test("실행이 실패하면 주소와 상관없이 막는다", () => {
  const report = summarize({ run: { id: 9, conclusion: "failure" }, screens: [{ key: "a", status: 200 }] });
  assert.equal(report.ok, false);
  assert.match(report.reason, /failure/);
});

test("인수는 key 하나 이상이고 sha 는 선택이다", () => {
  assert.deepEqual(parseArgs(["--sha", "abc", "--key", "a", "--key", "b"]), { keys: ["a", "b"], sha: "abc" });
  assert.deepEqual(parseArgs(["--key", "a"]), { keys: ["a"], sha: null });
  assert.match(parseArgs([]).error, /--key/);
  assert.match(parseArgs(["--what", "x"]).error, /모르는 인수/);
});
