// Figma use_figma 에 넘겨 `oe/text-*/<weight>` 텍스트 스타일을 만든다.
// 원본 글꼴 Pretendard Variable 이 Figma 에 없어 Noto Sans KR 로 임시 대체한다(2026-09-15 유진식 승인). 스타일 설명에 그 사실을 적는다.
const fonts = await figma.listAvailableFontsAsync();
const noto = fonts.filter((f) => f.fontName.family === "Noto Sans KR").map((f) => f.fontName.style);
const want = { regular: ["Regular"], medium: ["Medium"], semibold: ["SemiBold", "Semi Bold"], bold: ["Bold"] };
const styleFor = {};
for (const [k, cands] of Object.entries(want)) styleFor[k] = cands.find((c) => noto.includes(c)) || null;
if (!styleFor.regular) return { error: "Noto Sans KR 없음", noto };
for (const s of Object.values(styleFor)) if (s) await figma.loadFontAsync({ family: "Noto Sans KR", style: s });
const SCALE = [
  ["text-xs", 12, 16], ["text-sm", 14, 20], ["text-base", 16, 24], ["text-lg", 18, 28],
  ["text-xl", 20, 28], ["text-2xl", 24, 32], ["text-oe-label", 13, 16],
];
const WEIGHTS = ["regular", "medium", "semibold", "bold"];
// Noto Sans KR 에는 SemiBold 가 없어 semibold 는 Bold 로 둔다(2026-09-15 유진식 승인). Pretendard 가 생기면 FAMILY 와 이 대응을 바꾼다.
if (!styleFor.semibold) styleFor.semibold = styleFor.bold;
const existing = await figma.getLocalTextStylesAsync();
for (const s of existing) if (s.name.startsWith("oe/")) s.remove();
const made = [];
for (const [token, size, lh] of SCALE) {
  for (const w of WEIGHTS) {
    if (!styleFor[w]) continue;
    const st = figma.createTextStyle();
    st.name = `oe/${token}/${w}`;
    st.fontName = { family: "Noto Sans KR", style: styleFor[w] };
    st.fontSize = size;
    st.lineHeight = { unit: "PIXELS", value: lh };
    st.letterSpacing = { unit: "PERCENT", value: 0 };
    st.description = `${token} (${size}px / ${lh}px) + font-${w === "regular" ? "normal" : w}. 임시 대체: 원본 글꼴 oe-font-family-ko(Pretendard Variable)가 Figma에 없어 Noto Sans KR을 쓴다(2026-09-15 유진식 승인). Pretendard가 생기면 이 스타일의 글꼴만 바꾼다. 원본: apps/studio/src/app/foundations/typography, packages/fonts.`;
    made.push(st.name);
  }
}
return { family: "Noto Sans KR", styles: styleFor, count: made.length, sample: made.slice(0, 4) };
