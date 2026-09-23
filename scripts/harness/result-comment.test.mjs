// 결과 댓글 양식을 고정한다. 입력은 fixtures/result-input.example.json — #9 를 처리했다고 치고 만든 값이다.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { readMarker } from "./decision.mjs";
import { DECISION_GUIDE, HEAD_DECISION_HINT, renderResultComment, resultMarker } from "./result-comment.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const inputFile = path.join(here, "fixtures", "result-input.example.json");
const example = () => JSON.parse(readFileSync(inputFile, "utf8"));
const lines = (markdown) => markdown.split("\n");

test("첫 네 줄에 요청 · 샌드박스 · 작업 요약이 있다", () => {
  // 2026-09-22 에 요청 처리에서 Figma 를 뺐다. 결과는 샌드박스에서만 본다.
  const head = lines(renderResultComment(example())).slice(0, 4);
  assert.deepEqual(head, [
    "화면 요청 #9 결과 · 1회차 — 이커머스 구매 페이비 · 결정은 👍 👎 😕",
    "요청: @유진식 · 프로젝트 web, sto, sv",
    "샌드박스: https://ooee-sandbox.pages.dev/shop-product-list 외 4장 · 목록 https://ooee-sandbox.pages.dev/",
    "작업: 페이지 5장 추가(web) — 상품 목록·상품 상세·장바구니 외 2장 · 새 컴포넌트 없음 · PR #17",
  ]);
  assert.equal(lines(renderResultComment(example()))[4], "", "머리 네 줄 뒤는 빈 줄로 끊는다");
});

test("머리 네 줄에는 markdown 문법을 쓰지 않는다", () => {
  // Slack 카드가 그 글자를 그대로 보여 줄 수 있다. 주소는 날 글자면 양쪽 모두 링크로 잡는다.
  for (const line of lines(renderResultComment(example())).slice(0, 4)) {
    assert.doesNotMatch(line, /\*\*|\]\(|^#|\|/, `머리 줄에 markdown 문법이 있다: ${line}`);
  }
});

test("표식은 맨 끝 줄에 있고 decision.mjs 가 그것을 읽는다", () => {
  const markdown = renderResultComment({ ...example(), round: 2 });
  const body = markdown.trimEnd().split("\n");
  assert.equal(body[body.length - 1], resultMarker(9, 2));
  assert.equal(markdown.indexOf("<!--"), markdown.lastIndexOf("<!--"), "표식은 한 번만 나온다");
  assert.deepEqual(readMarker(markdown), { issue: 9, round: 2 });
});

test("아래에 화면 표, 작업한 것, 판단이 필요한 것, 검사, 결정 안내가 차례로 있다", () => {
  const markdown = renderResultComment(example());
  const order = ["### 화면", "### 작업한 것", "### 판단이 필요한 것", "### 검사", "### 결정"].map((h) => markdown.indexOf(h));
  assert.ok(order.every((at) => at > 0), "절이 빠졌다");
  assert.deepEqual([...order].sort((a, b) => a - b), order, "절의 차례가 바뀌었다");
  assert.ok(markdown.includes(DECISION_GUIDE));
  assert.match(DECISION_GUIDE, /👍 승인 · 👎 반려 · 😕 개선/);
  assert.ok(markdown.includes("| 상품 목록 | web | [/shop-product-list](https://ooee-sandbox.pages.dev/shop-product-list) |"));
  assert.ok(markdown.includes("| 주문 완료 | web | [/shop-order-complete](https://ooee-sandbox.pages.dev/shop-order-complete) |"));
  assert.doesNotMatch(markdown, /figma/i, "결과 댓글에 Figma 가 남았다");
  assert.ok(markdown.includes("- 페이지 추가: 5장 — 상품 목록, 상품 상세, 장바구니, 주문서, 주문 완료"));
  assert.ok(markdown.includes("- 쓴 컴포넌트: Button, Input, Select, CheckboxField, Badge"));
  assert.ok(markdown.includes("- 프로젝트를 web 하나로 만들었다 — 요청은 web·sto·sv 셋이었다"));
  assert.ok(markdown.includes("- [x] pnpm check"));
});

test("화면이 하나면 「외 N장」 을 붙이지 않는다", () => {
  const one = { ...example(), screens: [example().screens[0]], pullRequest: undefined };
  one.summary.pagesAdded = ["상품 목록"];
  assert.equal(lines(renderResultComment(one))[2], "샌드박스: https://ooee-sandbox.pages.dev/shop-product-list · 목록 https://ooee-sandbox.pages.dev/");
  assert.equal(lines(renderResultComment(one))[3], "작업: 페이지 1장 추가(web) — 상품 목록 · 새 컴포넌트 없음", "PR 이 없으면 적지 않는다");
});

test("컴포넌트를 더했거나 페이지 밖의 작업이면 요약 줄이 그것을 말한다", () => {
  const input = example();
  input.summary = { pagesAdded: [], componentsAdded: ["Rating"], componentsUsed: ["Button"], other: ["상품 상세 버튼 문구 수정", "장바구니 합계 줄 정리"] };
  input.round = 2;
  const head = lines(renderResultComment(input));
  assert.equal(head[0], `화면 요청 #9 결과 · 2회차 — 이커머스 구매 페이비 · ${HEAD_DECISION_HINT}`);
  assert.equal(head[3], "작업: 상품 상세 버튼 문구 수정 외 1건 · 컴포넌트 추가 Rating · PR #17");
});

test("작업 줄은 만든 페이지 이름을 앞의 셋까지 적고 나머지는 「외 N장」으로 줄인다", () => {
  // 사용자가 원한 보고 꼴이 「OO 작업 · OO 페이지」다. 장 수만 있으면 카드에서 무엇을 만들었는지 모른다.
  const input = example();
  input.screens = input.screens.slice(0, 3);
  input.summary.pagesAdded = ["상품 목록", "상품 상세", "장바구니"];
  assert.equal(lines(renderResultComment(input))[3], "작업: 페이지 3장 추가(web) — 상품 목록·상품 상세·장바구니 · 새 컴포넌트 없음 · PR #17", "셋이면 줄이지 않는다");

  const many = example();
  many.summary.componentsAdded = ["Rating", "Stepper", "Carousel", "Tag"];
  assert.match(lines(renderResultComment(many))[3], /· 컴포넌트 추가 Rating·Stepper·Carousel 외 1개 · PR #17$/);
});

test("개선 회차의 샌드박스 링크는 그대로 둔 화면이 아니라 다시 만든 화면이다", () => {
  // process-issue D4: 2회차 screens 에는 1회차에서 그대로 둔 화면도 모두 들어간다. 첫 칸을 걸면 카드가
  // 바뀌지 않은 상품 목록을 연다.
  const input = example();
  input.round = 2;
  input.screens[2] = { ...input.screens[2], key: "shop-cart-2", sandboxUrl: "https://ooee-sandbox.pages.dev/shop-cart-2" };
  input.summary.pagesAdded = ["장바구니"];
  input.summary.other = ["1회차 개선 반영: 담기 버튼 색"];
  const out = lines(renderResultComment(input));
  assert.equal(out[2], "샌드박스: https://ooee-sandbox.pages.dev/shop-cart-2 (다시 만듦) · 전체 5장 · 목록 https://ooee-sandbox.pages.dev/");
  assert.equal(out[3], "작업: 페이지 1장 다시 만듦(web) — 장바구니 · 1회차 개선 반영: 담기 버튼 색 · 새 컴포넌트 없음 · PR #17");
  const markdown = out.join("\n");
  assert.ok(markdown.includes("| 장바구니 (다시 만듦) | web | [/shop-cart-2](https://ooee-sandbox.pages.dev/shop-cart-2) |"));
  assert.ok(markdown.includes("| 상품 목록 | web |"), "그대로 둔 화면에는 표시를 붙이지 않는다");
  assert.ok(markdown.includes("- 페이지 다시 만듦: 1장 — 장바구니"));
});

test("pagesAdded 의 이름이 screens 에 없으면 던진다 — 링크가 조용히 첫 화면으로 떨어지지 않게", () => {
  const input = example();
  input.summary.pagesAdded = ["상품 목록", "장바구니 화면"];
  assert.throws(() => renderResultComment(input), /summary\.pagesAdded 의 「장바구니 화면」 가 screens 의 name 에 없다/);
});

test("머리는 입력에 줄바꿈이 섞여도 정확히 네 줄이다", () => {
  // Slack 카드가 앞의 몇 줄만 보여 준다. 값 하나의 줄바꿈이 작업 줄을 다섯째 줄로 밀면 카드에서 빠진다.
  const input = example();
  input.issue.screenName = "이커머스\n구매 페이비";
  input.issue.requester = "@유진식\n마감일: 2026-10-01";
  input.issue.projects = ["web\n", "sto"];
  input.screens.forEach((screen) => {
    screen.name = screen.name.replace(" ", "\n");
    screen.project = `${screen.project}\n`;
  });
  input.screens[0].sandboxUrl = "https://ooee-sandbox.pages.dev/shop-product-list\n";
  input.summary.pagesAdded = input.screens.map((screen) => screen.name.replace("\n", " \n "));
  input.summary.componentsAdded = ["Rating\nStar"];
  input.summary.other = ["토큰 정리\n버튼 색 교체"];
  const out = lines(renderResultComment(input));
  assert.deepEqual(
    out.slice(0, 4).map((line) => line.match(/^(화면 요청|요청|샌드박스|작업)[ :]/)?.[1]),
    ["화면 요청", "요청", "샌드박스", "작업"],
    `머리 네 줄이 밀렸다:\n${out.slice(0, 5).join("\n")}`,
  );
  assert.equal(out[4], "", "머리 네 줄 뒤는 빈 줄이다");
  assert.equal(out[0], `화면 요청 #9 결과 · 1회차 — 이커머스 구매 페이비 · ${HEAD_DECISION_HINT}`);
  assert.equal(out[1], "요청: @유진식 마감일: 2026-10-01 · 프로젝트 web, sto");
  assert.equal(out[2], "샌드박스: https://ooee-sandbox.pages.dev/shop-product-list 외 4장 · 목록 https://ooee-sandbox.pages.dev/");
  assert.equal(out[3], "작업: 페이지 5장 추가(web) — 상품 목록·상품 상세·장바구니 외 2장 · 토큰 정리 버튼 색 교체 · 컴포넌트 추가 Rating Star · PR #17");
});

test("가운데에 공백·제어 문자가 든 주소는 받지 않는다 — 날 글자 링크가 거기서 끊긴다", () => {
  for (const bad of ["https://ooee-sandbox.pages.dev/a b/shop-product-list", "https://ooee-sandbox.pages.dev/a\tb/shop-product-list", "https://ooee-sandbox.pages.dev/a\u0007/shop-product-list"]) {
    const input = example();
    input.screens[0].sandboxUrl = bad;
    assert.throws(() => renderResultComment(input), /screens\[0\]\.sandboxUrl 에 공백이나 제어 문자가 들어 있다/, JSON.stringify(bad));
  }
});

test("결정을 어디에 다는지 머리 첫 줄과 결정 절에 적는다", () => {
  // 결정 절은 카드가 자르는 아래쪽이라 머리에도 짧은 꼴을 둔다. Slack 카드의 반응은 다리가 옮긴다(2026-09-23).
  const markdown = renderResultComment(example());
  assert.ok(lines(markdown)[0].endsWith(`· ${HEAD_DECISION_HINT}`));
  assert.match(HEAD_DECISION_HINT, /👍 👎 😕/);
  assert.match(DECISION_GUIDE, /Slack 결과 카드에 달아도 되고 GitHub 의 이 댓글에 달아도 됩니다/);
  // 꼴 없는 사유 댓글은 짐작으로만 읽혀 개선 회차가 돌지 않는다(D4). 안내가 꼴을 알려 준다.
  assert.match(DECISION_GUIDE, /「반려: 까닭」·「개선: 고칠 것」/);
  // decision.mjs 가 받는 꼴만 적는다. 「…으로 시작하는 댓글」이라고 쓰면 「승인합니다」를 쓰게 된다.
  assert.ok(markdown.includes("「승인」 한 낱말, 또는 「반려: 사유」 · 「개선: 고칠 것」처럼 콜론을 붙인 댓글도 결정으로 칩니다."));
  assert.doesNotMatch(markdown, /으로 시작하는 댓글/);
});

test("표 칸의 | 와 줄바꿈이 표를 깨뜨리지 않는다", () => {
  const input = example();
  input.screens[0].name = "상품 | 목록\n첫 장";
  input.summary.pagesAdded[0] = input.screens[0].name;
  assert.ok(renderResultComment(input).includes("| 상품 \\| 목록 첫 장 | web |"));
});

test("빠진 값이 있으면 빈 링크로 올리지 않고 던진다", () => {
  const cases = [
    ["샌드박스 주소 없음", (i) => { delete i.screens[0].sandboxUrl; }, /screens\[0\]\.sandboxUrl 가 비었다/],
    ["다른 화면의 주소", (i) => { i.screens[0].sandboxUrl = "https://ooee-sandbox.pages.dev/shop-cart"; }, /key 「shop-product-list」 의 주소가 아니다/],
    ["https 가 아닌 주소", (i) => { i.screens[0].sandboxUrl = "http://ooee-sandbox.pages.dev/shop-product-list"; }, /https/],
    ["화면 없음", (i) => { i.screens = []; }, /screens 가 비었다/],
    ["요청자 없음", (i) => { i.issue.requester = " "; }, /issue\.requester/],
    ["회차 없음", (i) => { i.round = 0; }, /round/],
    ["작업한 것 없음", (i) => { i.summary.pagesAdded = []; }, /작업한 것이 비었다/],
    ["검사 없음", (i) => { i.checks = []; }, /checks 가 비었다/],
    ["검사 실패", (i) => { i.checks[0].passed = false; }, /검사가 실패했다\(pnpm check\)/],
  ];
  for (const [name, mutate, message] of cases) {
    const input = example();
    mutate(input);
    assert.throws(() => renderResultComment(input), message, `${name}: 던져야 한다`);
  }
});

test("CLI: 입력 JSON 파일을 받아 같은 markdown 을 낸다", () => {
  const out = execFileSync(process.execPath, [path.join(here, "result-comment.mjs"), inputFile], { encoding: "utf8" });
  assert.equal(out, renderResultComment(example()));
});

test("CLI: 입력이 모자라면 0 이 아닌 코드로 끝나고 까닭을 알린다", () => {
  assert.throws(
    () => execFileSync(process.execPath, [path.join(here, "result-comment.mjs"), path.join(here, "fixtures", "issue-9.json")], { encoding: "utf8", stdio: "pipe" }),
    (error) => error.status === 1 && /결과 댓글을 만들지 않는다/.test(error.stderr),
  );
});
