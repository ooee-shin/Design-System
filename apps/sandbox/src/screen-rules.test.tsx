// 이 저장소의 화면이 `/review-design` 의 기계 판정을 통과하는지 본다.
// 규칙 자체의 시험은 plugins/ooee-harness/lib/screen-rules.test.mjs 가 한다.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { checkScreenFile, checkTestTitles } from "../../../plugins/ooee-harness/lib/screen-rules.mjs";

type RuleHit = { rule: string; line: number; detail: string };

const SRC = path.dirname(fileURLToPath(import.meta.url));
const APP = path.join(SRC, "app");
const README = path.join(SRC, "../../../docs/system/README.md");

/**
 * Skill v0가 `2026-09-14`에 만든 두 화면은 틀린 사례의 기록으로 고치지 않고 둔다
 * (`docs/process/ai-environment.md` 「Skill v0」). 내용이 이 해시와 같을 때만 검사를 면제하고,
 * 대신 규칙이 그 사례를 실제 코드에서 잡는지 확인한다. 파일을 고치면 해시가 달라져 다른 화면과
 * 같이 위반 0건이어야 한다.
 */
const V0_RECORDS: Record<string, { sha256: string; testSha256: string; mustCatch: string[]; mustCatchInTest: boolean }> = {
  "admin-login": {
    sha256: "735af40650b8ea7d356e635b24adeb9355224628acd27421fd3b9853135c307e",
    testSha256: "cd44bf93bcce737e861f7ee2faddfa918b1e975f2e7e3cd0403b8985bd747fbb",
    mustCatch: ["3 기존 ooee 컴포넌트 재사용", "5 Focus", "13 아이콘"],
    mustCatchInTest: true,
  },
  "sto-support-request": {
    sha256: "cf9dfa7e62bf57a20b0d740db3ea7693b41143db79c63db0f6924807dcff2517",
    testSha256: "d12cced82c738af9a170ad1e0a798e2e9705f443521dbbae25f47e751dd145f4",
    mustCatch: ["13 아이콘"],
    mustCatchInTest: false,
  },
};

const format = (hits: RuleHit[]) => hits.map((h) => `  L${h.line} [${h.rule}] ${h.detail}`).join("\n");
const rulesOf = (hits: RuleHit[]) => new Set(hits.map((h) => h.rule));

const screenKeys = readdirSync(APP, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((key) => readdirSync(path.join(APP, key)).includes("page.tsx"));

const sha256Of = (file: string) => createHash("sha256").update(readFileSync(file)).digest("hex");

for (const key of screenKeys) {
  const file = path.join(APP, key, "page.tsx");
  const testFile = path.join(APP, key, "page.test.tsx");
  const hasTest = readdirSync(path.join(APP, key)).includes("page.test.tsx");
  const record = V0_RECORDS[key];

  if (record && record.sha256 === sha256Of(file)) {
    test(`v0 기록 ${key}: 규칙이 기록된 틀린 사례를 잡는다`, () => {
      const caught = rulesOf(checkScreenFile(file, README));
      for (const rule of record.mustCatch) assert.ok(caught.has(rule), `${key}에서 「${rule}」을 잡지 못했다`);
    });
  } else {
    test(`${key}: 화면 코드 규칙 위반이 없다`, () => {
      const hits = checkScreenFile(file, README);
      assert.equal(hits.length, 0, `src/app/${key}/page.tsx 규칙 위반 ${hits.length}건\n${format(hits)}`);
    });
  }

  if (!hasTest) continue;
  if (record && record.testSha256 === sha256Of(testFile)) {
    test(`v0 기록 ${key}: 테스트 이름 규칙이 기록된 영어 이름을 잡는다`, () => {
      const hits = checkTestTitles(readFileSync(testFile, "utf8"), testFile);
      assert.equal(hits.length > 0, record.mustCatchInTest, format(hits));
    });
  } else {
    test(`${key}: 테스트 이름이 한국어다`, () => {
      const hits = checkTestTitles(readFileSync(testFile, "utf8"), testFile);
      assert.equal(hits.length, 0, `src/app/${key}/page.test.tsx\n${format(hits)}`);
    });
  }
}
