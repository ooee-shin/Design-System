/**
 * Google Material Symbols 에서 들여온 아이콘이다.
 *
 * 아이콘의 Primary 공급원은 Remix Icon 이고 Material Symbols 는 Secondary 다. 규칙은
 * `docs/system/foundations/icon.md` 의 「공급원 우선순위」가 갖는다. 같은 뜻의 Remix 아이콘이
 * 있으면 이 파일에 들이지 않는다.
 *
 * 패키지를 설치하지 않고 쓰는 아이콘만 파일로 옮겨 둔다. 지금 필요한 것이 하나뿐이고, 스타일 축을
 * 고른 그 한 벌이 그대로 굳어 있어야 하기 때문이다. 축은 `Rounded`, `FILL 0`, `wght 400`,
 * `GRAD 0`, `opsz 24` 이며 원본은 아래 주소에서 받았다.
 *
 * https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/open_in_new/default/24px.svg
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
      <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h240q17 0 28.5 11.5T480-800q0 17-11.5 28.5T440-760H200v560h560v-240q0-17 11.5-28.5T800-480q17 0 28.5 11.5T840-440v240q0 33-23.5 56.5T760-120H200Zm560-584L416-360q-11 11-28 11t-28-11q-11-11-11-28t11-28l344-344H600q-17 0-28.5-11.5T560-800q0-17 11.5-28.5T600-840h200q17 0 28.5 11.5T840-800v200q0 17-11.5 28.5T800-560q-17 0-28.5-11.5T760-600v-104Z" />
    </svg>
  )
}

export { OpenInNewIcon }
