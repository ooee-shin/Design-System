// 규칙 판정 시험. 저장소 구조에 기대지 않고 가짜 화면 소스만으로 돈다.
// 화면 디렉터리를 훑는 검사는 lib/check-screens.mjs 와 설치한 저장소의 테스트가 맡는다.
import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { checkScreenSource, checkTestTitles, draftComponentNames } from "./screen-rules.mjs";

/** 아래 가짜 화면들이 쓰는 초안 이름. 실제 화면은 README 표에서 읽는다. */
const DRAFTS = ["MessageComposer", "MessageFileAttachment"];
const FIXTURE_PATH = fileURLToPath(new URL("./fixture/page.tsx", import.meta.url));
const format = (hits) => hits.map((h) => `  L${h.line} [${h.rule}] ${h.detail}`).join("\n");
const rulesOf = (hits) => new Set(hits.map((h) => h.rule));
const HEADER = "/**\n * 요청 문단.\n *\n * 비워 둔 자리: 없음.\n */\n";

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
  const counts = hits.reduce((acc, h) => ({ ...acc, [h.rule]: (acc[h.rule] ?? 0) + 1 }), {});
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
