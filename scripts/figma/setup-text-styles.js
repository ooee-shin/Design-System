// Figma use_figma 에 넘겨 `oe/text-*/<weight>` 텍스트 스타일을 맞춘다. 있는 스타일은 값만 고친다.
//
// 원본 글꼴 oe-font-family-ko 는 Pretendard Variable 인데 Figma 에 없다. 그래서 Noto Sans KR 로 임시 대체하고,
// Noto Sans KR 에 SemiBold 가 없어 semibold 는 Bold 로 둔다(2026-09-15 유진식 승인). Pretendard 가 Figma 에
// 생기면 FAMILY 와 WEIGHT_STYLE 을 원본대로 바꾸고 다시 돌린다. 스타일 설명에 대체 사실을 적는다.
const FAMILY = "Noto Sans KR";
const WEIGHT_STYLE = { regular: "Regular", medium: "Medium", semibold: "Bold", bold: "Bold" };
const WEIGHT_CSS = { regular: 400, medium: 500, semibold: 600, bold: 700 };
// apps/studio/src/app/foundations/typography 가 보여 주는 크기·행간이다.
const SCALE = [
  ["text-xs", 12, 16], ["text-sm", 14, 20], ["text-base", 16, 24], ["text-lg", 18, 28],
  ["text-xl", 20, 28], ["text-2xl", 24, 32], ["text-oe-label", 13, 16],
];

const fonts = await figma.listAvailableFontsAsync();
// 승인은 Pretendard 가 없다는 전제 위에 있다. Pretendard 가 생겼으면 대체를 계속하지 않고 멈춘다.
const original = fonts.find((f) => f.fontName.family === "Pretendard Variable" || f.fontName.family === "Pretendard");
if (original) return { error: `${original.fontName.family} 를 Figma 에서 쓸 수 있어 승인된 대체가 더는 맞지 않는다. 이 파일의 FAMILY·WEIGHT_STYLE(semibold 는 SemiBold)을 원본 글꼴로 바꾼 뒤 다시 돌린다` };
const available = fonts.filter((f) => f.fontName.family === FAMILY).map((f) => f.fontName.style);
for (const style of new Set(Object.values(WEIGHT_STYLE))) {
  if (!available.includes(style)) return { error: `${FAMILY} ${style} 을 Figma 에서 쓸 수 없다`, available };
  await figma.loadFontAsync({ family: FAMILY, style });
}

const existing = await figma.getLocalTextStylesAsync();
const report = { created: 0, updated: 0 };
for (const [token, size, lineHeight] of SCALE) {
  for (const [weight, style] of Object.entries(WEIGHT_STYLE)) {
    const name = `oe/${token}/${weight}`;
    let st = existing.find((s) => s.name === name);
    if (st) report.updated++;
    else { st = figma.createTextStyle(); st.name = name; report.created++; }
    st.fontName = { family: FAMILY, style };
    st.fontSize = size;
    st.lineHeight = { unit: "PIXELS", value: lineHeight };
    st.letterSpacing = { unit: "PERCENT", value: 0 };
    const substitutions = [`원본 글꼴 Pretendard Variable 이 Figma 에 없어 ${FAMILY}`];
    if (style !== ({ regular: "Regular", medium: "Medium", semibold: "SemiBold", bold: "Bold" })[weight]) substitutions.push(`${FAMILY} 에 ${weight} 굵기가 없어 ${style}`);
    st.description = `${token} (${size}px / ${lineHeight}px) + font-weight ${WEIGHT_CSS[weight]}. 임시 대체: ${substitutions.join(", ")}(2026-09-15 유진식 승인).`;
  }
}
return report;
