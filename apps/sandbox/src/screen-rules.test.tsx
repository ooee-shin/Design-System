import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { checkScreenFile, checkScreenSource, checkTestTitles, draftComponentNames, type RuleHit } from "./screen-rules";

const SRC = path.dirname(fileURLToPath(import.meta.url));
const APP = path.join(SRC, "app");
const README = path.join(SRC, "../../../docs/system/README.md");
const FIXTURE_PATH = path.join(APP, "fixture/page.tsx");
/** 아래 가짜 화면들이 쓰는 초안 이름. 실제 화면은 README 표에서 읽는다. */
const DRAFTS = ["MessageComposer", "MessageFileAttachment"];

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
const HEADER = "/**\n * 요청 문단.\n *\n * 비워 둔 자리: 없음.\n */\n";

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
      assert.equal(hits.length, 0, `src/app/${key}/page.tsx 규칙 위반 ${hits.length}건 (.claude/skills/review-design/SKILL.md 「검사 항목」)\n${format(hits)}`);
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

test("v0 틀린 사례: 영어로 쓴 테스트 이름", () => {
  const hits = checkTestTitles(
    `test("shows 지원요청 as the screen heading", () => {});
test("renders heading", () => {});
test("지원요청 화면 제목이 heading으로 잡힌다", () => {});
test("Select 기본값이 「무관」으로 보인다", () => {});`,
    FIXTURE_PATH,
  );
  assert.deepEqual(
    hits.map((h) => h.line),
    [1, 2],
    format(hits),
  );
});

test("README 「Component」 표의 초안 행을 export 이름으로 읽고 그 import를 잡는다", () => {
  const readme = "## Component\n\n| 컴포넌트 | 상태 | 문서 | 용도 |\n| --- | --- | --- | --- |\n| Button | 확정 | [button.md](components/button.md) | 액션 |\n| Message File Attachment | 초안 | 없음 | 파일 카드 |\n\n## 다음\n";
  assert.deepEqual(draftComponentNames(readme), ["MessageFileAttachment"]);
  const found = checkScreenSource(`${HEADER}import { Button, MessageComposer as Composer } from "@ooee/ui";\n`, FIXTURE_PATH, DRAFTS);
  assert.deepEqual(format(found), `  L6 [14 초안 컴포넌트] MessageComposer — README 「Component」 표에서 초안`);
});

test("v0 틀린 사례: 목적지 없는 링크를 <button>으로 만든 것", () => {
  const hits = checkScreenSource(
    `${HEADER}export default function Page() {
  return <button type="button" className="outline-none focus-visible:ring-2 focus-visible:ring-oe-focus-ring focus-visible:ring-offset-2">비밀번호 찾기</button>;
}`,
    FIXTURE_PATH,
    DRAFTS,
  );
  assert.deepEqual([...rulesOf(hits)], ["3 기존 ooee 컴포넌트 재사용"], format(hits));
});

test("v0 틀린 사례: 홀로 선 링크의 Focus에 ring-offset-2가 없는 것", () => {
  const hits = checkScreenSource(
    `${HEADER}export default function Page() {
  return <a href="#" className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-oe-focus-ring">이용약관</a>;
}`,
    FIXTURE_PATH,
    DRAFTS,
  );
  assert.deepEqual([...rulesOf(hits)], ["5 Focus"], format(hits));
});

test("v0 틀린 사례: 눈 아이콘에 숫자 크기, aria-hidden과 hover 층이 없는 것", () => {
  const hits = checkScreenSource(
    `${HEADER}import { RiEyeLine } from "@remixicon/react";
import { Input } from "@ooee/ui";
export default function Page() {
  return (
    <Input
      aria-label="비밀번호"
      trailingElement={
        <button type="button" aria-label="비밀번호 보기" onClick={() => undefined} className="outline-none focus-visible:ring-2 focus-visible:ring-oe-focus-ring">
          <RiEyeLine className="size-4" />
        </button>
      }
    />
  );
}`,
    FIXTURE_PATH,
    DRAFTS,
  );
  assert.equal(hits.filter((h) => h.rule === "13 아이콘").length, 3, format(hits));
  assert.equal(hits.length, 3, `trailingElement 안의 버튼에 ring-offset을 요구하면 안 된다\n${format(hits)}`);
});

test("색·shadcn 토큰·import 경계·머리말", () => {
  const hits = checkScreenSource(
    `import Link from "next/link";
import { Button } from "../../../../../packages/ui/src/button";
export default function Page() {
  return <div className="bg-blue-700 text-white text-muted-foreground border-t-gray-200 bg-oe-background-primary/50 bg-[#1d4ed8] bg-[var(--brand-600)]" />;
}`,
    FIXTURE_PATH,
    DRAFTS,
  );
  const counts = hits.reduce<Record<string, number>>((acc, h) => ({ ...acc, [h.rule]: (acc[h.rule] ?? 0) + 1 }), {});
  assert.deepEqual(counts, { "1 raw primitive color": 6, "2 shadcn visual token": 1, "12 import 경계": 2, 머리말: 1 }, format(hits));
});

test("규칙에 맞는 코드는 걸리지 않는다", () => {
  const hits = checkScreenSource(
    `"use client";

${HEADER}import { useState } from "react";
import { RiEyeLine, RiEyeOffLine } from "@remixicon/react";
import { Button, Input, buttonVariants } from "@ooee/ui";

const DETACHED_FOCUS = "outline-none focus-visible:ring-2 focus-visible:ring-oe-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-oe-background-primary";

export default function Page() {
  const [visible, setVisible] = useState(false);
  return (
    <form onSubmit={(event) => event.preventDefault()}>
      <p>주문 #1234 문의</p>
      <Input
        aria-label="비밀번호"
        type={visible ? "text" : "password"}
        trailingElement={
          <button
            type="button"
            aria-label={visible ? "비밀번호 숨기기" : "비밀번호 보기"}
            onClick={() => setVisible((v) => !v)}
            className="grid size-6 place-items-center rounded-md text-oe-foreground-tertiary hover:bg-oe-interaction-hover outline-none focus-visible:ring-2 focus-visible:ring-oe-focus-ring"
          >
            {visible ? <RiEyeOffLine aria-hidden="true" className="size-oe-icon-small" /> : <RiEyeLine aria-hidden="true" className="size-oe-icon-small" />}
          </button>
        }
      />
      <a href="#faded" className={\`rounded-sm text-oe-foreground-secondary \${DETACHED_FOCUS}\`.trim()}>비밀번호 찾기</a>
      <a href="#" className={DETACHED_FOCUS}>이용약관</a>
      <a href="#" className={buttonVariants({ variant: "outline" })}>내보내기</a>
      <Button type="submit" leadingIcon={<RiEyeLine aria-hidden="true" />}>로그인</Button>
    </form>
  );
}`,
    FIXTURE_PATH,
    DRAFTS,
  );
  assert.equal(hits.length, 0, format(hits));
});
