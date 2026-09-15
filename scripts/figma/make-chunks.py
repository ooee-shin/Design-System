"""추출한 DOM 트리를 Figma use_figma 한 번에 넣을 수 있는 조각으로 나눈다.

사용: python3 scripts/figma/make-chunks.py <tree.json> <프레임 이름> <x> <y> <출력 접두어>
같은 디렉터리의 remix-icons.json 과 oe-tokens.json 은 FIGMA_WORK_DIR(기본 .figma-work)에 둔다.
"""
import json, os, re, sys

tree_path, name, fx, fy, out_prefix = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), sys.argv[5]
WORK = os.environ.get("FIGMA_WORK_DIR", ".figma-work")
LIMIT = 14000

tree = json.load(open(tree_path))
icons = json.load(open(f"{WORK}/remix-icons.json"))
tokens = json.load(open(f"{WORK}/oe-tokens.json"))

# 아이콘: 첫 path 의 d 로 Remix 이름을 찾는다.
d_of = lambda svg: (re.search(r' d="([^"]+)"', svg) or [None, None])[1]
icon_by_d = {d_of(v): k for k, v in icons.items()}
used_icons, unknown_svgs = set(), 0
prims = set()

def prep(node, path):
    global unknown_svgs
    node["path"] = path
    for key in ("bg", "c"):
        ref = node.get(key)
        if isinstance(ref, dict) and ref.get("primitive"):
            prims.add(ref["primitive"])
    if node.get("bd") and node["bd"]["c"].get("primitive"):
        prims.add(node["bd"]["c"]["primitive"])
    if node.get("t") == "svg":
        name_ = icon_by_d.get(d_of(node["svg"]))
        if name_:
            node["icon"] = name_
            used_icons.add(name_)
            del node["svg"]
        else:
            unknown_svgs += 1
    for i, k in enumerate(node.get("k", [])):
        prep(k, f"{path}.{i}")

prep(tree, os.path.basename(out_prefix))

# primitive 값: Tailwind theme.css(oklch) 와 brand palette
import glob
theme = open(sorted(glob.glob("node_modules/.pnpm/tailwindcss@4*/node_modules/tailwindcss/theme.css"))[-1]).read()
tw = dict(re.findall(r"--color-([a-z]+-\d+|white|black):\s*([^;]+);", theme))
import math
def oklch(s):
    m = re.search(r"oklch\(\s*([\d.]+)%?\s+([\d.]+)\s+([\d.]+|none)", s)
    L = float(m.group(1)) / (100 if "%" in s else 1); C = float(m.group(2)); h = math.radians(0 if m.group(3) == "none" else float(m.group(3)))
    a, b = C * math.cos(h), C * math.sin(h)
    l_, m_, s_ = L + 0.3963377774*a + 0.2158037573*b, L - 0.1055613458*a - 0.0638541728*b, L - 0.0894841775*a - 1.291485548*b
    l, mm, ss = l_**3, m_**3, s_**3
    lin = [4.0767416621*l - 3.3077115913*mm + 0.2309699292*ss, -1.2684380046*l + 2.6097574011*mm - 0.3413193965*ss, -0.0041960863*l - 0.7034186147*mm + 1.707614701*ss]
    f = lambda c: min(1, max(0, 12.92*c if c <= 0.0031308 else 1.055*c**(1/2.4) - 0.055))
    return [round(f(c), 4) for c in lin]
primitives = {}
for p in sorted(prims):
    if p.startswith("brand-alpha-"):
        hx = tokens["seed"]
        primitives[p] = {k: round(int(hx[i:i+2], 16)/255, 4) for k, i in zip("rgb", (1, 3, 5))}
        primitives[p]["a"] = int(p.rsplit("-", 1)[1]) / 100
    elif p.startswith("brand-"):
        hx = tokens["brandSolid"][p]
        primitives[p] = {k: round(int(hx[i:i+2], 16)/255, 4) for k, i in zip("rgb", (1, 3, 5))}
    elif p == "white": primitives[p] = {"r": 1, "g": 1, "b": 1}
    elif p == "black": primitives[p] = {"r": 0, "g": 0, "b": 0}
    else:
        r, g, b = oklch(tw[p]); primitives[p] = {"r": r, "g": g, "b": b}

size = lambda n: len(json.dumps(n, ensure_ascii=False, separators=(",", ":")))
chunks = []

def emit(parent_path, parent_box, nodes, root=None):
    chunks.append({"parentPath": parent_path, "parentBox": parent_box, "rootFrame": root, "nodes": nodes})

def split(node, parent_path, parent_box, root=None):
    """node 를 한 chunk 로 내보내거나, 너무 크면 stub 으로 내보내고 자식을 나눈다."""
    if size(node) <= LIMIT:
        emit(parent_path, parent_box, [node], root); return
    stub = {k: v for k, v in node.items() if k != "k"}; stub["stub"] = 1
    emit(parent_path, parent_box, [stub], root)
    kids = node.get("k", []); box = {"x": node["x"], "y": node["y"]}
    group, gsize = [], 0
    def flush():
        nonlocal group, gsize
        if group: emit(node["path"], box, group); group, gsize = [], 0
    for k in kids:
        s = size(k)
        if s > LIMIT:
            flush(); split(k, node["path"], box)
        elif gsize + s > LIMIT:
            flush(); group, gsize = [k], s
        else:
            group.append(k); gsize += s
    flush()

split(tree, None, {"x": 0, "y": 0}, {"x": fx, "y": fy, "name": name})
for i, c in enumerate(chunks):
    c["primitives"] = primitives
    c["icons"] = {k: icons[k] for k in used_icons}
    open(f"{out_prefix}-{i:02d}.json", "w").write(json.dumps(c, ensure_ascii=False, indent=0))
print(json.dumps({"chunks": len(chunks), "sizes": [size(c) for c in chunks], "primitives": sorted(primitives), "icons": sorted(used_icons), "unknownSvgs": unknown_svgs}, ensure_ascii=False))
