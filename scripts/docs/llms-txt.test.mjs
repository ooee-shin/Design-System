// `llms.txt` 가 가리키는 경로가 실제로 있는지 본다.
//
// 이 파일은 AI 가 저장소를 처음 읽을 때의 진입점이다. 링크가 하나라도 없는 자리를 가리키면
// 읽는 쪽이 그 자리에서 멈추므로, 없느니만 못하다. 문서가 옮겨 다니는 저장소라서 사람이
// 기억으로 지킬 수 없다 — 실제로 스킬 문서가 옮겨 간 파일을 가리킨 채 한동안 남아 있었다.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

// 링크를 고르는 법은 빌드 때 원본을 사이트에 싣는 쪽과 하나여야 한다. 둘이 갈리면 여기서 지킨 링크와
// 사이트에 실린 링크가 달라진다.
import { localLinks } from "./llms-links.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const source = readFileSync(path.join(root, "llms.txt"), "utf8");

test("llms.txt 의 링크가 모두 실제 경로를 가리킨다", () => {
  const missing = localLinks(source)
    .filter(({ target }) => !existsSync(path.join(root, target)))
    .map(({ label, target }) => `${label} → ${target}`);

  assert.deepEqual(missing, [], `llms.txt 가 없는 자리를 가리킨다:\n${missing.join("\n")}`);
});

test("llms.txt 가 본문에 적은 경로도 실제로 있다", () => {
  // 표의 「어디」 칸처럼 링크가 아니라 `백틱` 으로 적은 경로도 같은 이유로 지켜야 한다.
  // 디렉터리와 파일만 보고, 명령·클래스 이름처럼 경로가 아닌 것은 걸러낸다.
  const looksLikePath = (text) =>
    /^[a-zA-Z0-9._/-]+$/.test(text) && text.includes("/") && !text.startsWith("/") && !text.includes("*") && /\.(ts|tsx|mjs|js|css|json|md|txt)$/.test(text);

  const missing = [...source.matchAll(/`([^`]+)`/g)]
    .map((match) => match[1])
    .filter(looksLikePath)
    .filter((target, index, all) => all.indexOf(target) === index)
    .filter((target) => !existsSync(path.join(root, target)));

  assert.deepEqual(missing, [], `llms.txt 가 없는 파일을 적었다:\n${missing.join("\n")}`);
});

test("llms.txt 가 적은 확정 컴포넌트가 실제 등록과 같다", () => {
  // 목록을 손으로 베껴 두었으므로 원본(component-registry)과 어긋날 수 있다.
  const registry = readFileSync(path.join(root, "apps/studio/src/components/component-registry.ts"), "utf8");
  const confirmed = [...registry.matchAll(/\{\s*key:\s*"([^"]+)"[^}]*?status:\s*"확정"/g)].map((match) => match[1]).sort();

  const listed = source.match(/확정 \d+종: (.+)/)[1]
    .split(/\s+/)
    .map((name) => name.replace(/`/g, ""))
    .filter(Boolean)
    .sort();

  assert.deepEqual(listed, confirmed, "llms.txt 의 확정 목록이 component-registry 와 다르다");
});
