// scripts/visual/inspect.mjs --eval 로 실행한다. [data-figma-root] 요소 아래 DOM 을 Figma 로 옮길 트리(JSON 문자열)로 돌려준다.
// 색은 class 이름에서 oe 토큰이나 primitive 단계를 읽고, 계산된 색은 칠이 있는지만 판단한다.
(() => {
  const PX = (v) => Math.round(parseFloat(v) || 0);
  const root = document.querySelector("[data-figma-root]") || document.body.firstElementChild;
  const rootBox = root.getBoundingClientRect();

  // class → token/primitive. 변형(hover:, dark: 등)이 붙은 클래스는 보지 않는다.
  const baseClasses = (el) => (typeof el.className === "string" ? el.className : el.getAttribute("class") || "").split(/\s+/).filter((c) => c && !c.includes(":"));
  function colorRef(el, prop) {
    const prefix = { bg: "bg-", text: "text-", border: "border-", fill: "fill-" }[prop];
    for (const c of baseClasses(el)) {
      if (!c.startsWith(prefix)) continue;
      const rest = c.slice(prefix.length);
      if (/^oe-/.test(rest)) {
        if (prop === "text" && /^oe-(label|icon)/.test(rest)) continue;
        return { token: rest.replace(/\/\d+$/, ""), alpha: rest.match(/\/(\d+)$/)?.[1] };
      }
      const brandAlpha = rest.match(/^\[var\(--brand-alpha-(\d+)\)\]$/);
      if (brandAlpha) return { primitive: "brand-alpha-" + brandAlpha[1] };
      const brand = rest.match(/^\[var\(--brand-(\d+)\)\](?:\/(\d+))?$/);
      if (brand) return { primitive: `brand-${brand[1]}`, alpha: brand[2] };
      const pal = rest.match(/^(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(\d{2,3})(?:\/(\d+))?$/);
      if (pal) return { primitive: `${pal[1]}-${pal[2]}`, alpha: pal[3] };
      if (rest === "white" || rest === "black") return { primitive: rest };
      if (rest === "transparent") return { none: true };
    }
    return null;
  }
  // Chrome 의 getComputedStyle 은 Tailwind v4 색을 lab()·oklab()·oklch() 로 돌려준다. rgb() 까지 모두 읽는다.
  const rgba = (s) => {
    if (!s || s === "transparent") return null;
    let m = s.match(/^rgba?\(([^)]+)\)$/);
    if (m) {
      const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
      return { r: p[0] / 255, g: p[1] / 255, b: p[2] / 255, a: p.length > 3 ? p[3] : 1 };
    }
    m = s.match(/^oklch\(([^)]+)\)$/);
    if (m) {
      const [main, alpha] = m[1].split("/");
      const [Ls, Cs, Hs] = main.trim().split(/\s+/);
      let L = parseFloat(Ls); if (Ls.endsWith("%")) L /= 100;
      const C = parseFloat(Cs) || 0, h = ((Hs === "none" ? 0 : parseFloat(Hs)) * Math.PI) / 180;
      const a = C * Math.cos(h), b = C * Math.sin(h);
      const l_ = L + 0.3963377774 * a + 0.2158037573 * b, m_ = L - 0.1055613458 * a - 0.0638541728 * b, s_ = L - 0.0894841775 * a - 1.291485548 * b;
      const l = l_ ** 3, mm = m_ ** 3, ss = s_ ** 3;
      const lin = [4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * ss, -1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * ss, -0.0041960863 * l - 0.7034186147 * mm + 1.707614701 * ss];
      const f = (c) => Math.min(1, Math.max(0, c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055));
      let A = 1; if (alpha) { A = parseFloat(alpha); if (alpha.trim().endsWith("%")) A /= 100; }
      return { r: f(lin[0]), g: f(lin[1]), b: f(lin[2]), a: A };
    }
    m = s.match(/^oklab\(([^)]+)\)$/);
    if (m) {
      const [main, alpha] = m[1].split("/");
      const [Ls, as, bs] = main.trim().split(/\s+/);
      let L = parseFloat(Ls); if (Ls.endsWith("%")) L /= 100;
      const a = parseFloat(as), b = parseFloat(bs);
      const l_ = L + 0.3963377774 * a + 0.2158037573 * b, m_ = L - 0.1055613458 * a - 0.0638541728 * b, s_ = L - 0.0894841775 * a - 1.291485548 * b;
      const l = l_ ** 3, mm = m_ ** 3, ss = s_ ** 3;
      const lin = [4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * ss, -1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * ss, -0.0041960863 * l - 0.7034186147 * mm + 1.707614701 * ss];
      const f = (c) => Math.min(1, Math.max(0, c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055));
      let A = 1; if (alpha) { A = parseFloat(alpha); if (alpha.trim().endsWith("%")) A /= 100; }
      return { r: f(lin[0]), g: f(lin[1]), b: f(lin[2]), a: A };
    }
    m = s.match(/^lab\(([^)]+)\)$/);
    if (m) {
      // CSS lab() 는 D50 기준이다. Lab → XYZ(D50) → Bradford → XYZ(D65) → linear sRGB → sRGB.
      const [main, alpha] = m[1].split("/");
      const [Ls, as, bs] = main.trim().split(/\s+/);
      const L = parseFloat(Ls), A = parseFloat(as), B = parseFloat(bs);
      const fy = (L + 16) / 116, fx = fy + A / 500, fz = fy - B / 200;
      const e = 216 / 24389, k = 24389 / 27;
      const xr = fx ** 3 > e ? fx ** 3 : (116 * fx - 16) / k;
      const yr = L > k * e ? ((L + 16) / 116) ** 3 : L / k;
      const zr = fz ** 3 > e ? fz ** 3 : (116 * fz - 16) / k;
      const X50 = xr * 0.3457 / 0.3585, Y50 = yr, Z50 = zr * (1 - 0.3457 - 0.3585) / 0.3585;
      const X = 0.9554734527042182 * X50 - 0.023098536874261423 * Y50 + 0.0632593086610217 * Z50;
      const Y = -0.028369706963208136 * X50 + 1.0099954580058226 * Y50 + 0.021041398966943008 * Z50;
      const Z = 0.012314001688319899 * X50 - 0.020507696433477912 * Y50 + 1.3303659366080753 * Z50;
      const lin = [3.2409699419045226 * X - 1.537383177570094 * Y - 0.4986107602930034 * Z, -0.9692436362808796 * X + 1.8759675015077202 * Y + 0.04155505740717559 * Z, 0.05563007969699366 * X - 0.20397695888897652 * Y + 1.0569715142428786 * Z];
      const f = (c) => Math.min(1, Math.max(0, c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055));
      let al = 1; if (alpha) { al = parseFloat(alpha); if (alpha.trim().endsWith("%")) al /= 100; }
      return { r: f(lin[0]), g: f(lin[1]), b: f(lin[2]), a: al };
    }
    m = s.match(/^color\(srgb ([^)]+)\)$/);
    if (m) {
      const [main, alpha] = m[1].split("/");
      const p = main.trim().split(/\s+/).map(Number);
      return { r: p[0], g: p[1], b: p[2], a: alpha ? parseFloat(alpha) : 1 };
    }
    return null;
  };
  const visible = (el, cs) => cs.display !== "none" && cs.visibility !== "hidden" && parseFloat(cs.opacity) > 0;

  function textColor(el) {
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      const ref = colorRef(n, "text");
      if (ref) return ref;
    }
    return null;
  }
  function nameOf(el) {
    const slot = el.getAttribute("data-slot");
    const aria = el.getAttribute("aria-label");
    const role = el.getAttribute("role");
    const tag = el.tagName.toLowerCase();
    const bits = [slot || role || tag];
    if (aria) bits.push(aria);
    return bits.join(" / ");
  }

  function walk(el) {
    const cs = getComputedStyle(el);
    if (!visible(el, cs)) return null;
    const b = el.getBoundingClientRect();
    if (b.width < 0.5 || b.height < 0.5) return null;
    // Select 같은 컴포넌트가 폼 값을 위해 두는 숨은 native input(1px·clip)은 옮기지 않는다.
    if (b.width <= 1.5 && b.height <= 1.5) return null;
    if (cs.clipPath === "inset(50%)" || /rect\(0(px)?,? 0(px)?,? 0(px)?,? 0(px)?\)/.test(cs.clip)) return null;
    const node = {
      n: nameOf(el),
      x: Math.round(b.left - rootBox.left), y: Math.round(b.top - rootBox.top), w: Math.round(b.width), h: Math.round(b.height),
    };
    if (el.tagName.toLowerCase() === "svg") {
      node.t = "svg";
      node.svg = el.outerHTML.replace(/ class="[^"]*"/g, "");
      node.c = textColor(el) || (rgba(cs.color) ? { raw: rgba(cs.color) } : null);
      return node;
    }
    node.t = "f";
    const bg = rgba(cs.backgroundColor);
    if (bg && bg.a > 0) node.bg = colorRef(el, "bg") || { raw: bg };
    const bw = [cs.borderTopWidth, cs.borderRightWidth, cs.borderBottomWidth, cs.borderLeftWidth].map(PX);
    const bcol = rgba(cs.borderTopColor) || rgba(cs.borderBottomColor);
    if (bw.some((v) => v > 0) && bcol && bcol.a > 0) node.bd = { w: bw, c: colorRef(el, "border") || { raw: bcol }, ds: cs.borderTopStyle === "dashed" ? 1 : 0 };
    const r = PX(cs.borderTopLeftRadius);
    if (r) node.r = Math.min(r, Math.round(Math.min(b.width, b.height) / 2));
    if (cs.overflow === "hidden" || cs.overflowY === "auto" || cs.overflowY === "scroll") node.clip = 1;
    if (cs.display.includes("flex")) {
      node.l = {
        d: cs.flexDirection.startsWith("column") ? "V" : "H",
        g: PX(cs.columnGap === "normal" ? 0 : cs.flexDirection.startsWith("column") ? cs.rowGap : cs.columnGap),
        p: [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft].map(PX),
        j: cs.justifyContent, a: cs.alignItems, wr: cs.flexWrap === "wrap" ? 1 : 0,
      };
    }
    const kids = [];
    // input·textarea 의 값 또는 placeholder 를 글자로 만든다.
    const tag = el.tagName.toLowerCase();
    if ((tag === "input" || tag === "textarea") && el.type !== "checkbox" && el.type !== "radio") {
      const value = el.value;
      const text = value || el.getAttribute("placeholder") || "";
      if (text) {
        kids.push({
          t: "x", n: value ? "Value" : "Placeholder", s: value ? (el.type === "password" ? "••••••••" : value) : text,
          x: node.x + PX(cs.paddingLeft) + PX(cs.borderLeftWidth), y: tag === "input" ? node.y + Math.round((node.h - (PX(cs.lineHeight) || Math.round(parseFloat(cs.fontSize) * 1.4))) / 2) : node.y + PX(cs.paddingTop) + PX(cs.borderTopWidth),
          w: Math.max(1, node.w - PX(cs.paddingLeft) - PX(cs.paddingRight)), h: PX(cs.lineHeight) || Math.round(parseFloat(cs.fontSize) * 1.4),
          fs: PX(cs.fontSize), lh: PX(cs.lineHeight), fw: +cs.fontWeight,
          c: value ? textColor(el) : { token: "oe-foreground-placeholder" }, al: cs.textAlign,
        });
      }
    }
    for (const child of el.childNodes) {
      if (child.nodeType === 3) {
        const s = child.textContent.replace(/\s+/g, " ").trim();
        if (!s) continue;
        const range = document.createRange();
        range.selectNodeContents(child);
        const rects = [...range.getClientRects()];
        if (!rects.length) continue;
        const left = Math.min(...rects.map((q) => q.left)), top = Math.min(...rects.map((q) => q.top));
        const right = Math.max(...rects.map((q) => q.right)), bottom = Math.max(...rects.map((q) => q.bottom));
        kids.push({
          t: "x", n: s.slice(0, 24), s,
          x: Math.round(left - rootBox.left), y: Math.round(top - rootBox.top), w: Math.ceil(right - left) + 1, h: Math.round(bottom - top),
          fs: PX(cs.fontSize), lh: cs.lineHeight === "normal" ? 0 : PX(cs.lineHeight), fw: +cs.fontWeight, c: textColor(el), al: cs.textAlign,
        });
      } else if (child.nodeType === 1) {
        const k = walk(child);
        if (k) kids.push(k);
      }
    }
    if (kids.length) node.k = kids;
    return node;
  }
  const tree = walk(root);
  return JSON.stringify(tree);
})()
