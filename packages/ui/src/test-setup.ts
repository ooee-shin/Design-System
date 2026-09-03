import { JSDOM } from "jsdom"

// Installs a JSDOM environment for the component tests in this package. Import
// this module before any component so the DOM globals exist while React and
// Testing Library resolve them.
const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost" })

Object.assign(globalThis, {
  window: dom.window,
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
})

Object.defineProperty(globalThis, "navigator", { configurable: true, value: dom.window.navigator })

if (!("PointerEvent" in globalThis)) {
  Object.assign(globalThis, { PointerEvent: dom.window.MouseEvent })
}
