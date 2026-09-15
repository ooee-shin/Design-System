import { JSDOM } from "jsdom";

// packages/ui 의 test-setup 에 `self` 한 줄을 더한 JSDOM 환경이다. 화면 테스트가 React 와 Testing
// Library 를 불러오기 전에 DOM 전역이 있어야 하므로 테스트 파일 첫 줄에서 이 모듈을 불러온다.
const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost" });

Object.assign(globalThis, {
  window: dom.window,
  // 첫 화면 `src/app/page.tsx` 가 그리는 `next/link` 는 JSDOM 에 `IntersectionObserver` 가 없으면
  // `requestIdleCallback` 대체 구현에서 `self.setTimeout` 을 부른다. 등록된 화면이 하나라도 있으면
  // index 테스트가 그 경로를 타므로 `self` 를 둔다.
  self: dom.window,
  document: dom.window.document,
  HTMLElement: dom.window.HTMLElement,
  HTMLInputElement: dom.window.HTMLInputElement,
  Element: dom.window.Element,
  Node: dom.window.Node,
  Event: dom.window.Event,
  MouseEvent: dom.window.MouseEvent,
  KeyboardEvent: dom.window.KeyboardEvent,
  MutationObserver: dom.window.MutationObserver,
  getComputedStyle: dom.window.getComputedStyle,
  requestAnimationFrame: (callback: FrameRequestCallback) => setTimeout(() => callback(Date.now()), 0),
  cancelAnimationFrame: (id: ReturnType<typeof setTimeout>) => clearTimeout(id),
});

Object.defineProperty(globalThis, "navigator", { configurable: true, value: dom.window.navigator });

if (!("PointerEvent" in globalThis)) {
  Object.assign(globalThis, { PointerEvent: dom.window.MouseEvent });
}
