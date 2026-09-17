// oe 토큰을 Figma 로 옮길 값으로 뽑는 것이 되는지 본다. Figma 도 브라우저도 부르지 않는다.
//
// packages/tokens 가 새 색 단계를 더하면 이 뽑기가 먼저 깨진다. 실제로 `neutral-150`·`neutral-850`
// 처럼 Tailwind 에 없는 중간 단계를 styles.css 가 color-mix 로 만들었을 때 「missing neutral-150」
// 으로 멈췄고, 그 사실을 Figma 로 옮기려다 알았다. 이 시험이 그것을 코드 쪽에서 먼저 잡는다.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, "..", "..");

const exported = (() => {
  const out = path.join(mkdtempSync(path.join(tmpdir(), "ooee-tokens-")), "oe-tokens.json");
  execFileSync(process.execPath, ["--import", "tsx", path.join(here, "token-export.ts"), out], { cwd: repo, encoding: "utf8" });
  return JSON.parse(readFileSync(out, "utf8"));
})();

test("packages/tokens 의 모든 semantic 토큰이 값으로 나온다", () => {
  const names = Object.keys(exported.tokens);
  assert.ok(names.length > 50, `토큰이 너무 적다: ${names.length}개`);
  for (const [name, value] of Object.entries(exported.tokens)) {
    for (const mode of ["light", "dark"]) {
      const v = value[mode];
      assert.ok(v, `${name} 의 ${mode} 값이 없다`);
      for (const ch of ["r", "g", "b"]) {
        assert.equal(typeof v[ch], "number", `${name} ${mode} 의 ${ch} 가 숫자가 아니다`);
        assert.ok(v[ch] >= 0 && v[ch] <= 1, `${name} ${mode} 의 ${ch} 가 0~1 밖이다: ${v[ch]}`);
      }
    }
  }
});

test("Tailwind 에 없는 중간 단계도 값으로 나온다", () => {
  // styles.css 가 color-mix 로 만드는 단계를 모두 찾아, 그것을 쓰는 토큰이 실제로 값을 갖는지 본다.
  const css = readFileSync(path.join(repo, "packages/tokens/src/styles.css"), "utf8");
  const steps = [...css.matchAll(/--color-([a-z]+-\d+):\s*color-mix\(/g)].map((m) => m[1]);
  if (!steps.length) return; // 지금은 없더라도 나중에 생기면 아래가 지킨다

  const used = Object.entries(exported.tokens).flatMap(([name, v]) =>
    [v.light, v.dark].filter((x) => steps.includes(x.source)).map((x) => `${name}:${x.source}`),
  );
  assert.ok(used.length, `color-mix 단계 ${steps.join(", ")} 를 쓰는 토큰이 하나도 없다. 규칙이 바뀌었는지 본다`);
  for (const step of steps) {
    const sample = Object.values(exported.tokens).flatMap((v) => [v.light, v.dark]).find((x) => x.source === step);
    if (!sample) continue;
    assert.equal(typeof sample.r, "number", `${step} 가 값으로 풀리지 않았다`);
  }
});

test("브랜드 단계와 크기 값도 함께 나온다", () => {
  assert.ok(Object.keys(exported.brandSolid).length, "브랜드 단계가 비었다");
  assert.ok(Object.keys(exported.sizes).length, "크기 값이 비었다");
  assert.match(exported.seed, /^#[0-9a-fA-F]{6}$/, `brand seed 가 hex 가 아니다: ${exported.seed}`);
});
