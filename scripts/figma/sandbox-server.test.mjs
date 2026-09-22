// 개발 서버가 이 checkout 의 sandbox 인지 가르는 것을 고정한다. 브라우저도 Figma 도 부르지 않는다.
//
// 2026-09-22 반박 시험: 3001 에 다른 저장소의 sandbox 가 떠 있어 voc 는 그 저장소의 옛 화면이 200 으로 읽혔고,
// shop-cart 는 404 라 dev 를 띄웠지만 포트가 차 있어 끝나지 않고 기다렸다. HTTP 코드만으로는 가를 수 없었다.
import assert from "node:assert/strict";
import http from "node:http";
import test from "node:test";

import { checkoutId, choose, explain, portFree, probe } from "./sandbox-server.mjs";

/** 가짜 sandbox. `checkout` 이 undefined 면 지문을 내지 않는 옛 sandbox 다. */
function fakeSandbox({ checkout, screens = ["shop-cart"] }) {
  const server = http.createServer((req, res) => {
    if (req.url === "/sandbox-origin.json" && checkout !== undefined) {
      res.writeHead(200, { "content-type": "application/json" });
      return res.end(JSON.stringify({ app: "@ooee/sandbox", checkout }));
    }
    const ok = screens.includes(req.url.slice(1));
    res.writeHead(ok ? 200 : 404, { "content-type": "text/html" });
    res.end("<html></html>");
  });
  return new Promise((resolve) => server.listen(0, () => resolve({ server, port: server.address().port, base: `http://localhost:${server.address().port}` })));
}
const close = ({ server }) => new Promise((resolve) => server.close(resolve));
async function unusedPort() {
  const { server, port } = await fakeSandbox({});
  await close({ server });
  return port;
}

test("sandbox 의 /sandbox-origin.json 은 dev 서버에서만 그 폴더의 지문을 낸다", async () => {
  const { GET } = await import("../../apps/sandbox/src/app/sandbox-origin.json/route.ts");
  const saved = process.env.NODE_ENV;
  try {
    process.env.NODE_ENV = "development";
    assert.deepEqual(await GET().json(), { app: "@ooee/sandbox", checkout: checkoutId(process.cwd()) });
    // next build 로 내보낸 정적 파일(배포)에는 기기의 지문이 들어가지 않는다.
    process.env.NODE_ENV = "production";
    assert.equal((await GET().json()).checkout, null);
  } finally {
    process.env.NODE_ENV = saved;
  }
});

test("지문이 같고 화면이 200 일 때만 이 checkout 의 서버로 본다", async () => {
  const mine = await fakeSandbox({ checkout: 42 });
  const other = await fakeSandbox({ checkout: 7, screens: ["voc"] });
  const legacy = await fakeSandbox({ checkout: undefined, screens: ["voc"] });
  try {
    assert.deepEqual(await probe(mine.base, "shop-cart", { expected: 42 }), { base: mine.base, origin: "this", screen: 200, ok: true });
    const missing = await probe(mine.base, "nope", { expected: 42 });
    assert.equal(missing.ok, false);
    assert.match(explain(missing, "nope"), /이 checkout 에 그 화면이 없다/);
    // 다른 저장소의 sandbox 가 그 화면을 200 으로 내도 쓰지 않는다. 예전에는 여기서 옛 화면이 읽혔다.
    const foreign = await probe(other.base, "voc", { expected: 42 });
    assert.deepEqual([foreign.origin, foreign.screen, foreign.ok], ["other", 200, false]);
    assert.match(explain(foreign, "voc"), /이 checkout 의 sandbox 가 아니다/);
    // 지문을 내지 않는 옛 sandbox 도 다른 서버다.
    assert.equal((await probe(legacy.base, "voc", { expected: 42 })).origin, "other");
    const nobody = await probe(`http://localhost:${await unusedPort()}`, "voc", { expected: 42 });
    assert.deepEqual([nobody.origin, nobody.ok], ["none", false]);
  } finally {
    await Promise.all([mine, other, legacy].map(close));
  }
});

test("기본 포트가 남의 서버면 이 checkout 의 서버를 찾거나, 없으면 빈 포트를 고른다", async () => {
  const foreign = await fakeSandbox({ checkout: 7, screens: ["voc", "shop-cart"] });
  const mine = await fakeSandbox({ checkout: 42 });
  const free = await unusedPort();
  try {
    assert.deepEqual(await choose("shop-cart", { ports: [foreign.port, mine.port], expected: 42 }), { ready: true, base: mine.base });
    const picked = await choose("shop-cart", { ports: [foreign.port, free], expected: 42 });
    assert.equal(picked.ready, false);
    assert.equal(picked.start.port, free);
    assert.equal(picked.start.command, `pnpm --filter @ooee/sandbox dev --port ${free}`);
    assert.deepEqual(picked.seen, [{ port: foreign.port, origin: "other", screen: 200 }]);
    // 이 checkout 의 서버인데 화면이 없으면 띄워도 소용없다. key 가 틀렸다.
    const wrongKey = await choose("nope", { ports: [mine.port], expected: 42 });
    assert.match(wrongKey.error, /화면이 없다/);
    assert.equal(await portFree(foreign.port), false);
  } finally {
    await Promise.all([foreign, mine].map(close));
  }
});
