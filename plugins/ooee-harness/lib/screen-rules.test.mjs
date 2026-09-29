// 규칙 판정 시험. 저장소 구조에 기대지 않고 가짜 화면 소스만으로 돈다. 화면 자리를 훑는 자
// (`screenKeysIn`)만 임시 디렉터리에 가짜 화면 자리를 세워 잰다.
// 설치한 저장소의 화면이 실제로 통과하는지는 그 저장소의 테스트가 맡는다.
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  checkScreenSource,
  checkTestTitles,
  classInfo,
  draftComponentNames,
  gapOf,
  parseScreen,
  rowChildren,
  screenKeysIn,
} from "./screen-rules.mjs";

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

// ── 도우미: rowChildren·gapOf ─────────────────────────────────────────────────
// 아래 가짜 화면은 `apps/sandbox` 의 실제 화면에서 뽑은 꼴이다. 규칙을 늘리기 전에 도우미의
// 판정을 고정해 둔다.

/** 소스에서 첫 `<div>` 를 한 줄로 보고 그 자식을 편다. */
const rowOf = (body) => {
  const { consts, elements } = parseScreen(`${HEADER}export default function Page() {\n  return (\n${body}\n  );\n}\n`, FIXTURE_PATH);
  const row = elements.find((element) => element.tag === "div");
  assert.ok(row, "가짜 화면에 <div> 줄이 없다");
  return rowChildren(row.node, consts);
};
/** `Button*?` — `*` 는 `.map()` 이 여럿을 뜻하는 것, `?` 는 조건 안에 있는 것이다. */
const shapeOf = ({ items }) => items.map((item) => `${item.tag ?? `«${item.text}»`}${item.repeated ? "*" : ""}${item.conditional ? "?" : ""}`);

test("rowChildren: 삼항·Fragment·map·&& 안의 요소까지 한 줄에 세운다", () => {
  const row = rowOf(`    <div className="flex items-center gap-1.5 px-5 py-2.5">
      <button type="button">{label}</button>
      {count > 0 ? (
        <>
          <Chip controlSize="compact">{String(count)}</Chip>
          <button type="button" aria-label="펼치기">{arrow}</button>
        </>
      ) : null}
      {PERIOD_OPTIONS.map((option) => (
        <Button key={option} controlSize="small">{option}</Button>
      ))}
      {dirty && <Button controlSize="small">조회</Button>}
    </div>`);
  assert.equal(row.opaque, false);
  assert.deepEqual(shapeOf(row), ["button", "Chip?", "button?", "Button*", "Button?"]);
});

test("rowChildren: 중첩 Fragment 와 블록 본문 map 도 푼다", () => {
  const row = rowOf(`    <div className="flex gap-1.5">
      <>
        <Button controlSize="small">저장</Button>
        <>
          <Button controlSize="small">임시저장</Button>
        </>
      </>
      {rows.map((row) => {
        return <Chip key={row}>{row}</Chip>;
      })}
      취소
    </div>`);
  assert.equal(row.opaque, false);
  assert.deepEqual(shapeOf(row), ["Button", "Button", "Chip*", "«취소»"]);
});

test("rowChildren: 이름 있는 Fragment 도 푼다", () => {
  const named = rowOf(`    <div className="flex items-center gap-1.5">
      <React.Fragment>
        <Button controlSize="small">저장</Button>
        <Button controlSize="small">취소</Button>
      </React.Fragment>
    </div>`);
  assert.equal(named.opaque, false);
  assert.deepEqual(shapeOf(named), ["Button", "Button"], "<React.Fragment> 는 줄에 서지 않고 자식을 세운다");

  const keyed = rowOf(`    <div className="flex items-center gap-1.5">
      {rows.map((row) => (
        <React.Fragment key={row.id}>
          <Chip>{row.name}</Chip>
          <Button controlSize="small">삭제</Button>
        </React.Fragment>
      ))}
    </div>`);
  assert.equal(keyed.opaque, false);
  assert.deepEqual(shapeOf(keyed), ["Chip*", "Button*"], ".map() 안에서 key 를 받는 꼴도 푼다");

  const bare = rowOf(`    <div className="flex items-center gap-1.5">
      <Fragment>
        <Button controlSize="small">저장</Button>
      </Fragment>
      <Fragment />
    </div>`);
  assert.equal(bare.opaque, false);
  assert.deepEqual(shapeOf(bare), ["Button"], "이름만 쓴 Fragment 와 빈 Fragment");
});

test("rowChildren: 블록 본문 map 은 중첩 함수 안으로 들어가지 않는다", () => {
  const nested = rowOf(`    <div className="flex items-center gap-1.5">
      {rows.map((row) => {
        return (
          <Row key={row.id}>
            {row.cells.map((cell) => {
              return <Cell key={cell.id} />;
            })}
          </Row>
        );
      })}
    </div>`);
  assert.equal(nested.opaque, false);
  assert.deepEqual(shapeOf(nested), ["Row*"], "손자 <Cell/> 은 이 줄에 서지 않는다");

  const handler = rowOf(`    <div className="flex items-center gap-1.5">
      {rows.map((row) => {
        const onPick = () => {
          return handle(row);
        };
        return <Button key={row.id} controlSize="small" onClick={onPick} />;
      })}
    </div>`);
  assert.equal(handler.opaque, false, "곁에 둔 화살표의 return 은 이 줄과 관계없다");
  assert.deepEqual(shapeOf(handler), ["Button*"]);
});

test("rowChildren: 변수 하나만 넘긴 자식과 함수가 돌려준 것은 보류한다", () => {
  const opaque = rowOf(`    <div className="flex gap-1.5">{children}</div>`);
  assert.equal(opaque.opaque, true, "변수 하나만 넘긴 children 은 보류여야 한다");
  assert.deepEqual(shapeOf(opaque), []);

  const mixed = rowOf(`    <div className="flex gap-1.5">
      <Button controlSize="small">조회</Button>
      {renderExtraActions()}
    </div>`);
  assert.equal(mixed.opaque, true, "펴지 못한 것이 섞이면 보류여야 한다");
  assert.deepEqual(shapeOf(mixed), ["Button"], "펴진 것은 그대로 돌려준다");

  const comment = rowOf(`    <div className="flex gap-1.5">
      {/* 아래 버튼은 오른쪽으로 민다. */}
      <Button controlSize="small">조회</Button>
      {null}
    </div>`);
  assert.equal(comment.opaque, false, "주석과 null 은 보류가 아니다");
  assert.deepEqual(shapeOf(comment), ["Button"]);
});

test("rowChildren: 자식이 없는 요소와 JSX 가 아닌 것은 빈 목록이다", () => {
  const { consts, elements } = parseScreen(
    `${HEADER}export default function Page() {\n  return <Button controlSize="small">조회</Button>;\n}\n`,
    FIXTURE_PATH,
  );
  const button = elements.find((element) => element.tag === "Button");
  assert.deepEqual(rowChildren(button.opening, consts).items.length, 1, "여는 태그를 넘겨도 그 요소의 자식을 푼다");
  assert.deepEqual(rowChildren(undefined, consts), { items: [], opaque: false });
});

test("gapOf: 6px 를 적은 네 꼴을 같은 자로 읽는다", () => {
  for (const classes of ["flex items-center gap-1.5", "flex gap-x-1.5", "flex space-x-1.5", "flex gap-[6px]", "flex gap-[0.375rem]"])
    assert.equal(gapOf(classes), 6, classes);
  assert.equal(gapOf("-mr-1 flex items-center gap-1.5"), 6, "실제 화면의 줄");
  assert.equal(gapOf(["flex", "gap-2"]), 8, "gap-2 는 8px");
  assert.equal(gapOf("flex gap-px"), 1);
  assert.equal(gapOf("flex gap-0"), 0);
});

test("gapOf: 가로 간격이 없으면 null, 못 읽으면 unknown 이다", () => {
  assert.equal(gapOf("flex items-center"), null, "간격이 없다");
  assert.equal(gapOf("flex flex-col gap-y-2"), null, "세로 간격은 이 자의 대상이 아니다");
  assert.equal(gapOf("flex gap-1.5 sm:gap-2"), "unknown", "상황마다 달라지는 간격");
  assert.equal(gapOf("flex -space-x-1"), "unknown", "음수");
  assert.equal(gapOf("flex gap-oe-padding-default"), "unknown", "토큰을 가리키는 값");
  assert.equal(gapOf("flex gap-[calc(var(--oe-gap)-2px)]"), "unknown", "계산한 값");
  assert.equal(gapOf("flex gap-[2em]"), "unknown", "글자 크기에 따라 달라지는 단위");
  assert.equal(gapOf("flex gap-2 gap-x-1.5"), "unknown", "두 값이 어긋난다");
});

test("gapOf: classInfo 가 푼 token 목록으로도 읽는다", () => {
  const { consts, elements } = parseScreen(
    `${HEADER}const ROW = "flex items-center gap-1.5";\nexport default function Page() {\n  return <div className={ROW}><Button controlSize="small">조회</Button></div>;\n}\n`,
    FIXTURE_PATH,
  );
  const row = elements.find((element) => element.tag === "div");
  const { tokens } = classInfo(row.opening, consts);
  assert.equal(gapOf(tokens), 6);
});

// ── 7 컴포넌트 글자 크기 ──────────────────────────────────────────────────────

test("7 컴포넌트 글자 크기: @ooee/ui 컴포넌트에 글자 크기·무게·행간을 덮어쓴 것을 잡는다", () => {
  const hits = checkScreenSource(
    `${HEADER}import { Select, SwitchField } from "@ooee/ui";
export default function Page() {
  return (
    <div className="flex items-center gap-3">
      <Select controlSize="small" ariaLabel="정렬" options={[]} className="text-oe-label h-auto gap-1 border-transparent px-0 text-oe-foreground-secondary" />
      <SwitchField controlSize="small" label="내 담당 점포" className="text-[13px] font-semibold leading-5" />
      <Select controlSize="small" ariaLabel="기간" options={[]} className="sm:text-lg" />
    </div>
  );
}`,
    FIXTURE_PATH,
    DRAFTS,
  );
  assert.deepEqual([...rulesOf(hits)], ["7 컴포넌트 글자 크기"], format(hits));
  assert.deepEqual(
    hits.map((h) => h.detail),
    [
      "Select에 className으로 text-oe-label — 글자 크기·무게·행간은 controlSize 같은 Property가 정한다",
      "SwitchField에 className으로 text-[13px] font-semibold leading-5 — 글자 크기·무게·행간은 controlSize 같은 Property가 정한다",
      "Select에 className으로 sm:text-lg — 글자 크기·무게·행간은 controlSize 같은 Property가 정한다",
    ],
    format(hits),
  );
});

test("7 컴포넌트 글자 크기: 색·계열 이름·화면이 그린 요소·풀지 못한 className 은 잡지 않는다", () => {
  const hits = checkScreenSource(
    `${HEADER}import { cn } from "@ooee/ui";
import { Select, SwitchField } from "@ooee/ui";
export default function Page({ extra }: { extra?: string }) {
  return (
    <div className="flex items-center gap-3">
      {/* 색은 화면이 정할 수 있다. */}
      <Select controlSize="small" ariaLabel="정렬" options={[]} className="text-oe-foreground-secondary hover:text-oe-foreground-primary" />
      <SwitchField controlSize="small" label="내 담당 점포" className="font-mono tabular-nums" />
      {/* 화면이 직접 그린 요소는 글자 크기를 정한다. */}
      <span className="text-sm font-medium text-oe-foreground-secondary">전체 12건</span>
      {/* 끝까지 풀 수 없는 className 은 보류한다. */}
      <Select controlSize="small" ariaLabel="기간" options={[]} className={cn("text-xs", extra)} />
    </div>
  );
}`,
    FIXTURE_PATH,
    DRAFTS,
  );
  assert.equal(hits.length, 0, format(hits));
});

// ── 화면 자리를 훑는 자: screenKeysIn ─────────────────────────────────────────
// 임시 디렉터리에 가짜 화면 자리를 세워 잰다. 이 자가 한 겹만 훑으면 그 아래 화면이 규칙 검사를
// 통째로 건너뛰는데, 그때도 두 시험 모두 초록으로 끝나므로(발견하지 못한 화면은 회차를 만들지
// 않는다) 재귀 자체를 여기서 고정한다.

/** `자리 목록` 의 각 자리에 `page.tsx` 를 두고 그 뿌리를 돌려준다. */
const screensFixture = (dirs, extras = []) => {
  const root = mkdtempSync(path.join(tmpdir(), "screen-keys-"));
  mkdirSync(path.join(root, "app"), { recursive: true });
  const app = path.join(root, "app");
  writeFileSync(path.join(app, "page.tsx"), "// 화면 목록\n");
  for (const dir of dirs) {
    mkdirSync(path.join(app, dir), { recursive: true });
    writeFileSync(path.join(app, dir, "page.tsx"), "// 화면\n");
  }
  for (const dir of extras) mkdirSync(path.join(app, dir), { recursive: true });
  return app;
};

test("screenKeysIn: 괄호 디렉터리와 여러 겹을 재귀로 훑어 상대 경로 key 로 돌려준다", () => {
  const app = screensFixture(
    [
      "admin-login",
      "(renewal)/renewal",
      "(renewal)/renewal/admin",
      "(renewal)/renewal/admin/voice",
      "(renewal)/renewal/sto/write",
    ],
    ["components", "(renewal)/renewal/sto/parts"],
  );
  try {
    assert.deepEqual(screenKeysIn(app), [
      "(renewal)/renewal",
      "(renewal)/renewal/admin",
      "(renewal)/renewal/admin/voice",
      "(renewal)/renewal/sto/write",
      "admin-login",
    ]);
  } finally {
    rmSync(path.dirname(app), { recursive: true, force: true });
  }
});

test("screenKeysIn: `--screens` 자신과 node_modules·숨은 디렉터리는 화면이 아니다", () => {
  const app = screensFixture(["node_modules/pkg", ".next/server", "admin-login"]);
  try {
    assert.deepEqual(screenKeysIn(app), ["admin-login"], "app/page.tsx 는 화면 목록이고 나머지 둘은 훑지 않는다");
  } finally {
    rmSync(path.dirname(app), { recursive: true, force: true });
  }
});
