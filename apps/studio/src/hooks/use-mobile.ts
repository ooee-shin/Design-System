import * as React from "react"

const MOBILE_BREAKPOINT = 768
const QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

// shadcn 이 내려준 원본은 effect 안에서 곧바로 setState 를 불러 첫 렌더 뒤에 한 번 더 그린다.
// 저장소의 eslint 가 그 형태를 error 로 막으므로 `useSyncExternalStore` 로 바꿨다. 서버에서는
// 창을 알 수 없으므로 원본과 같이 모바일이 아닌 쪽을 첫 값으로 돌려준다.
function subscribe(onChange: () => void) {
  const mql = window.matchMedia(QUERY)
  mql.addEventListener("change", onChange)
  return () => mql.removeEventListener("change", onChange)
}

export function useIsMobile() {
  return React.useSyncExternalStore(
    subscribe,
    () => window.innerWidth < MOBILE_BREAKPOINT,
    () => false,
  )
}
