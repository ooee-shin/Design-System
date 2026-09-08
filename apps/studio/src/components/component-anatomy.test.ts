import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import test from "node:test";
import { join } from "node:path";

const workbenchDirectory = join(process.cwd(), "apps/studio/src/components/candidates");

function readWorkbenches() {
  return readdirSync(workbenchDirectory)
    .filter((name) => name.endsWith(".tsx"))
    .map((name) => ({ name, source: readFileSync(join(workbenchDirectory, name), "utf8") }));
}

function markerCallsIn(source: string) {
  return source.match(/<Anatomy(?:Number|BoundaryMarker)\b[^>]*>/g) ?? [];
}

test("every anatomy marker names the element it points at", () => {
  for (const { name, source } of readWorkbenches()) {
    for (const call of markerCallsIn(source)) {
      assert.match(call, /\btarget=/, `${name}: 번호 마커에 target이 없다 → ${call}`);
    }
  }
});

test("anatomy markers are placed inside a frame that can measure their target", () => {
  for (const { name, source } of readWorkbenches()) {
    if (markerCallsIn(source).length === 0) continue;
    assert.match(source, /<AnatomyFrame\b/, `${name}: 마커를 쓰면서 AnatomyFrame이 없다`);
  }
});

test("anatomy markers no longer carry hand written coordinates", () => {
  for (const { name, source } of readWorkbenches()) {
    for (const call of markerCallsIn(source)) {
      assert.doesNotMatch(call, /\b(className|lineClassName|boundaryLength)=/, `${name}: 마커가 좌표를 직접 들고 있다 → ${call}`);
    }
  }
});

test("boundary lines are drawn by the shared marker instead of loose spans", () => {
  for (const { name, source } of readWorkbenches()) {
    if (markerCallsIn(source).length === 0) continue;
    const looseLines = source.match(/<span[^>]*aria-hidden[^>]*absolute[^>]*bg-oe-border-primary[^>]*\/>/g) ?? [];
    assert.equal(looseLines.length, 0, `${name}: 범위 표시선을 직접 그리고 있다 → ${looseLines[0]}`);
  }
});
