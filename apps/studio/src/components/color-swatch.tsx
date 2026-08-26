export function ColorSwatch({ color }: { color: string }) {
  return (
    <span
      aria-hidden="true"
      className="block size-4 rounded-[4px]"
      style={{ backgroundColor: color, boxShadow: "inset 0 0 0 1px rgb(0 0 0 / 10%)" }}
    />
  )
}
