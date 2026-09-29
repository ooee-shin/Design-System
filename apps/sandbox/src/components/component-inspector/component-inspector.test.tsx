import "@/test-setup";

import assert from "node:assert/strict";
import test, { afterEach } from "node:test";

import React from "react";
import { act, cleanup, fireEvent, render, within } from "@testing-library/react";

import { sandboxScreens } from "@/screens";

import { InspectorBar, useFrameDocument } from "./component-inspector";

afterEach(() => {
  cleanup();
});

const screen = sandboxScreens[0];

/** 화면 자리. 막대는 받은 문서를 세므로 시험에서는 이 문서에 화면 조각을 같이 그린다. */
function Page() {
  return (
    <main>
      <h1>{screen.name}</h1>
      <button data-slot="button">저장</button>
      <button data-slot="button">취소</button>
      <div data-slot="input-container">
        <input />
      </div>
    </main>
  );
}

// DOM 요소가 없음은 이것으로 잰다. `assert.equal(요소, null)` 은 실패하면 jsdom 노드를 inspect 하다 멎는다.
function assertAbsent(element: Element | null, message?: string) {
  assert.equal(element?.tagName ?? null, null, message);
}

const settle = () => act(() => new Promise((resolve) => setTimeout(resolve, 5)));

test("컴포넌트 보기를 켜면 쓴 컴포넌트를 수와 Studio 문서 링크로 보인다", async () => {
  const view = render(
    <>
      <Page />
      <InspectorBar pathname={screen.href} doc={document} />
    </>,
  );
  await settle();

  const toggle = view.getByRole("button", { name: /컴포넌트 보기/ });
  assert.equal(toggle.textContent, "컴포넌트 보기 2", "막대가 센 종류 수가 틀렸다");
  fireEvent.click(toggle);

  const list = view.getByRole("complementary", { name: "쓴 컴포넌트" });
  const links = within(list).getAllByRole("link");
  const docs = links.filter((link) => link.getAttribute("href")?.includes("/components/"));
  assert.deepEqual(
    docs.map((link) => [link.textContent?.replace(/\s+/g, " ").trim(), link.getAttribute("href")]),
    [
      ["Button×2 ↗", "https://ooee-studio.pages.dev/components/button"],
      ["Input×1 ↗", "https://ooee-studio.pages.dev/components/input"],
    ],
  );
  assert.ok(within(list).getByText("2종 · 3곳"));
});

test("경로는 디자인 시스템 › 프로젝트 › 화면 이다", async () => {
  const view = render(<InspectorBar pathname={screen.href} doc={document} />);
  await settle();
  fireEvent.click(view.getByRole("button", { name: /컴포넌트 보기/ }));

  const crumbs = view.getByRole("navigation", { name: "경로" });
  const [system, project] = within(crumbs).getAllByRole("link");
  assert.equal(system.textContent, "디자인 시스템");
  assert.equal(project.getAttribute("href"), `/#${screen.project}`);
  assert.ok(crumbs.textContent?.endsWith(screen.name), "경로 끝이 화면 이름이 아니다");
});

test("요청 보기는 그 화면을 만든 요청 문장을 보이고 Esc 로 닫힌다", async () => {
  const view = render(<InspectorBar pathname={screen.href} doc={document} />);
  await settle();
  fireEvent.click(view.getByRole("button", { name: "요청 보기" }));

  const panel = view.getByRole("complementary", { name: "요청" });
  assert.ok(within(panel).getByText(screen.prompt));
  fireEvent.keyDown(window, { key: "Escape" });
  assertAbsent(view.queryByRole("complementary"), "Esc 로 닫히지 않았다");
});

test("요청 기록이 없는 화면에는 요청 보기가 서지 않고 센 것도 0 개다", async () => {
  const view = render(<InspectorBar pathname="/renewal/unknown" doc={document} />);
  await settle();
  assert.equal(view.getByRole("button", { name: /컴포넌트 보기/ }).textContent, "컴포넌트 보기 0");
  assertAbsent(view.queryByRole("button", { name: "요청 보기" }), "요청이 없는 화면에 요청 보기가 섰다");
});

// 막대는 액자 **밖** 문서에 서고 화면은 액자 안에 있다. 그래서 세는 대상을 문서로 받는다 — 자기 문서를 훑으면
// 액자 하나만 보여 늘 0 개다(2026-09-28 #124). 테두리도 액자 안 좌표계라야 자리가 맞으니 그 문서에 그린다.
test("받은 문서를 세고, 테두리도 그 문서의 body 에 그린다", async () => {
  const inner = document.implementation.createHTMLDocument("액자");
  inner.body.innerHTML = '<main><button data-slot="button">저장</button><div data-slot="chip">칩</div></main>';
  const view = render(<InspectorBar pathname={screen.href} doc={inner} />);
  await settle();

  const toggle = view.getByRole("button", { name: /컴포넌트 보기/ });
  assert.equal(toggle.textContent, "컴포넌트 보기 2", "액자 안 문서를 세지 않았다");
  fireEvent.click(toggle);
  await settle();

  assert.ok(inner.body.querySelector("[data-inspector-overlay]"), "테두리 덮개가 액자 안 문서에 서지 않았다");
  assertAbsent(document.body.querySelector("[data-inspector-overlay]"), "테두리 덮개를 액자 밖 문서에 그렸다");
  // 목록 판은 액자 밖 문서에 남는다 — 맨 위 막대와 같은 자리다.
  const list = view.getByRole("complementary", { name: "쓴 컴포넌트" });
  assert.ok(document.body.contains(list), "목록 판이 액자 밖 문서에 없다");
  assert.ok(within(list).getByText("2종 · 2곳"));
});

test("액자가 아직 안 떴으면 0 개로 두고 테두리를 그리지 않는다", async () => {
  const view = render(<InspectorBar pathname={screen.href} doc={null} />);
  await settle();
  assert.equal(view.getByRole("button", { name: /컴포넌트 보기/ }).textContent, "컴포넌트 보기 0");
  fireEvent.click(view.getByRole("button", { name: /컴포넌트 보기/ }));
  await settle();
  assertAbsent(document.body.querySelector("[data-inspector-overlay]"), "셀 문서가 없는데 테두리를 그렸다");
});

// 판이 `role="toolbar"` 안에 들어앉으면 낭독기가 판의 글(`nav`·링크 8개)까지 도구 모음 안에서 읽는다.
// 앞 회차가 단추와 판을 한 껍데기에 담아 `tools` 로 넘겨 그 회귀를 만들었다(2026-09-29 개발자). 판은
// portal 로 액자 밖 `document.body` 에 나가고 도구 모음에는 단추 둘만 남는다.
test("도구 모음 안에는 단추만 남고 열린 판은 그 밖에 선다", async () => {
  const inner = document.implementation.createHTMLDocument("액자");
  inner.body.innerHTML = '<main><button data-slot="button">저장</button><div data-slot="chip">칩</div></main>';
  const view = render(
    <div role="toolbar" aria-label="화면 도구">
      <InspectorBar pathname={screen.href} doc={inner} />
    </div>,
  );
  await settle();

  fireEvent.click(view.getByRole("button", { name: /컴포넌트 보기/ }));
  await settle();

  const bar = view.getByRole("toolbar", { name: "화면 도구" });
  assert.equal(bar.querySelectorAll("aside").length, 0, "판이 도구 모음 안에 들어앉았다");
  assert.equal(bar.querySelectorAll("nav").length, 0, "판의 경로가 도구 모음 안에 들어앉았다");
  assert.equal(bar.querySelectorAll("a").length, 0, "판의 링크가 도구 모음 안에 들어앉았다");
  assert.equal(bar.textContent, "요청 보기컴포넌트 보기 2", `도구 모음이 단추 밖의 글을 머금었다: ${bar.textContent}`);

  // 판은 여전히 액자 밖 문서에 있다 — 맨 위 막대와 같은 자리다. 다만 막대의 자손이 아니다.
  const list = view.getByRole("complementary", { name: "쓴 컴포넌트" });
  assert.ok(document.body.contains(list), "판이 액자 밖 문서에 없다");
  assert.equal(bar.contains(list), false, "판이 아직 도구 모음의 자손이다");
  assert.match(list.className, /fixed/, "판이 창 기준으로 서지 않으면 body 로 옮기며 자리가 흐트러진다");
  assert.equal(list.parentElement, document.body, "판을 body 의 바로 밑 자식으로 내보내지 않았다");
});

// 덮개는 액자 **안** 문서에 그린다. 지금 덮개에는 `data-slot` 이 없어 이 제외가 걸러 낼 것이 없지만, 덮개가
// 이름표를 `Badge` 같은 컴포넌트로 바꾸면 그 순간부터 자기 자신을 센다. 그래서 제외를 남기고 이 시험으로 묶는다
// (2026-09-29 개발자 — 지우면 그때 조용히 수가 틀린다).
test("액자 안 문서에 있어도 막대가 그린 것은 세지 않는다", async () => {
  const inner = document.implementation.createHTMLDocument("액자");
  inner.body.innerHTML =
    '<main><button data-slot="button">저장</button>' +
    '<div data-component-inspector=""><span data-slot="chip">Button</span></div></main>';
  const view = render(<InspectorBar pathname={screen.href} doc={inner} />);
  await settle();

  const toggle = view.getByRole("button", { name: /컴포넌트 보기/ });
  assert.equal(toggle.textContent, "컴포넌트 보기 1", "막대가 액자 안에 그린 것까지 셌다");
  fireEvent.click(toggle);
  await settle();
  const list = view.getByRole("complementary", { name: "쓴 컴포넌트" });
  assert.ok(within(list).getByText("1종 · 1곳"), "곳 수에도 막대가 그린 것이 들어갔다");
});

// ---- `useFrameDocument`: 셀 문서를 액자 안에서 잡아 온다 (#124 의 「0 개」 회귀를 여기서 막는다) ----
//
// 막대는 액자 **밖** 문서에 서므로 셀 문서를 `iframe[data-sandbox-frame]` 에서 가져온다. 이 훅이 없거나
// `load` 를 놓치면 브라우저에서 막대가 「컴포넌트 보기 0」 이 되는데, 훅에 시험이 하나도 없던 동안은 그
// 회귀가 초록으로 지나갔다(2026-09-29 개발자).
//
// JSDOM 의 iframe 은 `src` 를 실제로 열지 않으므로, 액자가 뜬 뒤의 문서는 `contentDocument` 를 갈아 끼우고
// `load` 를 쏘아 흉내 낸다. `about:blank` 갈래만은 진짜 iframe 의 문서로 잰다.

const frames: HTMLIFrameElement[] = [];

afterEach(() => {
  for (const frame of frames.splice(0)) frame.remove();
});

/** 셀 문서를 제목으로 잰다 — 노드를 `assert.equal` 에 넣으면 어긋날 때 jsdom 노드를 inspect 하다 멎는다. */
const titleOf = (doc: Document | null) => doc?.title ?? null;

function innerDocument(title: string, html = '<main><button data-slot="button">저장</button><div data-slot="chip">칩</div></main>') {
  const doc = document.implementation.createHTMLDocument(title);
  doc.body.innerHTML = html;
  return doc;
}

/** 액자를 세운다. `doc` 을 주면 `contentDocument` 가 그것을 돌려준다(액자가 뜬 뒤의 상태). */
function addFrame(doc?: Document) {
  const frame = document.createElement("iframe");
  frame.setAttribute("data-sandbox-frame", "");
  if (doc) Object.defineProperty(frame, "contentDocument", { configurable: true, get: () => doc });
  document.body.append(frame);
  frames.push(frame);
  return frame;
}

/** 액자가 뜬 뒤의 문서로 갈아 끼운다. */
function frameLoads(frame: HTMLIFrameElement, doc: Document) {
  Object.defineProperty(frame, "contentDocument", { configurable: true, get: () => doc });
  fireEvent.load(frame);
}

/**
 * 훅만 재는 자리. 아무것도 그리지 않는다 — 훅의 `MutationObserver` 가 `document.body` 를 보고 있어서,
 * 그리는 글이 있으면 그 변화가 스스로 다시 잡아 주어 `load` 를 듣는지 재는 뜻이 사라진다.
 */
function DocumentProbe({ seen }: { seen: (Document | null)[] }) {
  seen.push(useFrameDocument());
  return null;
}

/** 진짜 조립과 같은 자리 — 훅이 잡은 문서를 그대로 막대에 넘긴다. */
function FramedBar() {
  return <InspectorBar pathname={screen.href} doc={useFrameDocument()} />;
}

test("액자가 `about:blank` 이면 셀 문서가 없다 — 막대는 0 개로 둔다", async () => {
  addFrame();
  const seen: (Document | null)[] = [];
  const view = render(
    <>
      <DocumentProbe seen={seen} />
      <FramedBar />
    </>,
  );
  await settle();
  assert.equal(titleOf(seen.at(-1) ?? null), null, "`about:blank` 액자를 셀 문서로 잡았다");
  assert.equal(view.getByRole("button", { name: /컴포넌트 보기/ }).textContent, "컴포넌트 보기 0");
});

test("액자가 뜨면(`load`) 그 문서를 셀 문서로 잡는다", async () => {
  const frame = addFrame();
  const seen: (Document | null)[] = [];
  render(<DocumentProbe seen={seen} />);
  await settle();
  assert.equal(titleOf(seen.at(-1) ?? null), null, "뜨기 전부터 셀 문서가 있었다 — 시험이 뜻을 잃는다");

  frameLoads(frame, innerDocument("액자 안 화면"));
  await settle();
  assert.equal(titleOf(seen.at(-1) ?? null), "액자 안 화면", "`load` 를 듣지 않아 셀 문서를 잡지 못했다");
});

test("액자가 뜨면 막대의 숫자가 그 문서의 컴포넌트 수로 바뀐다", async () => {
  const frame = addFrame();
  const view = render(<FramedBar />);
  await settle();
  const toggle = view.getByRole("button", { name: /컴포넌트 보기/ });
  assert.equal(toggle.textContent, "컴포넌트 보기 0", "액자가 뜨기 전인데 0 개가 아니다");

  frameLoads(frame, innerDocument("액자 안 화면"));
  await settle();
  assert.equal(toggle.textContent, "컴포넌트 보기 2", "액자가 떴는데 막대가 0 개로 남았다 — #124 의 그 자리다");
});

// 액자는 보기 폭을 바꾸거나 화면을 옮길 때마다 새로 선다. 새 액자를 다시 잡지 못하면 그때부터 0 개로 굳는다.
test("액자를 갈아치우면 새 문서를 다시 잡는다", async () => {
  const first = addFrame();
  const seen: (Document | null)[] = [];
  render(<DocumentProbe seen={seen} />);
  await settle();
  frameLoads(first, innerDocument("첫 액자"));
  await settle();
  assert.equal(titleOf(seen.at(-1) ?? null), "첫 액자");

  first.remove();
  addFrame(innerDocument("둘째 액자"));
  await settle();
  assert.equal(titleOf(seen.at(-1) ?? null), "둘째 액자", "새로 선 액자를 다시 잡지 못했다");
});

test("떼어낼 때 `load` 리스너와 observer 를 정리한다", async () => {
  const frame = addFrame();
  const removed: string[] = [];
  const reallyRemove = frame.removeEventListener.bind(frame);
  frame.removeEventListener = ((type: string, ...rest: unknown[]) => {
    removed.push(type);
    return (reallyRemove as (...args: unknown[]) => void)(type, ...rest);
  }) as typeof frame.removeEventListener;

  let disconnects = 0;
  const reallyDisconnect = MutationObserver.prototype.disconnect;
  MutationObserver.prototype.disconnect = function disconnect(this: MutationObserver) {
    disconnects += 1;
    return reallyDisconnect.call(this);
  };
  try {
    const seen: (Document | null)[] = [];
    const view = render(<DocumentProbe seen={seen} />);
    await settle();
    assert.equal(disconnects, 0, "떼어내기 전에 이미 끊겼다 — 시험이 뜻을 잃는다");
    view.unmount();
    assert.ok(removed.includes("load"), "액자의 `load` 리스너를 떼지 않았다");
    assert.ok(disconnects > 0, "액자를 살피던 observer 를 끊지 않았다");
  } finally {
    MutationObserver.prototype.disconnect = reallyDisconnect;
  }
});
