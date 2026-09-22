/**
 * Google Material Symbols 에서 들여온 아이콘이다.
 *
 * 아이콘의 Primary 공급원은 Remix Icon 이고 Material Symbols 는 Secondary 다. 규칙은
 * `docs/system/foundations/icon.md` 의 「공급원 우선순위」가 갖는다. 같은 뜻의 Remix 아이콘이
 * 있으면 이 파일에 들이지 않는다.
 *
 * 패키지를 설치하지 않고 쓰는 아이콘만 파일로 옮겨 둔다. 지금 필요한 것이 하나뿐이고, 스타일 축을
 * 고른 그 한 벌이 그대로 굳어 있어야 하기 때문이다. 축은 `Outlined`, `FILL 0`, `wght 400`,
 * `GRAD 0`, `opsz 24` 이며 원본은 아래 주소에서 받았다. Remix Icon 이 모두 각진 선이라 같은
 * 화면에서 모서리가 둥근 `Rounded` 만 다른 규칙으로 보인다.
 *
 * https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/open_in_new/default/24px.svg
 *
 * Material Symbols 는 `0 -960 960 960` 좌표계를 쓴다. Remix 의 `0 0 24 24` 와 다르지만 화면에
 * 그려지는 크기는 `className` 의 크기 토큰이 정하므로 쓰는 쪽에서는 차이가 없다. 크기를 속성으로
 * 박아 두지 않는 것도 Remix 아이콘과 같다. 버튼이 아이콘 크기를 정할 때 그 값이 먹어야 한다.
 */

/** 누르면 새 창에서 열린다는 표시다. Material Symbols 의 `open_in_new` 다. */
function OpenInNewIcon({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 -960 960 960"
      fill="currentColor"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h560v-280h80v280q0 33-23.5 56.5T760-120H200Zm188-212-56-56 372-372H560v-80h280v280h-80v-144L388-332Z" />
    </svg>
  )
}

export { OpenInNewIcon }
