import assert from "node:assert/strict";
import test from "node:test";

async function render(pathname = "/", init = {}, envOverrides = {}) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      ...init,
      headers: { accept: "text/html", ...init.headers },
    }),
    {
      ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
      ...envOverrides,
    },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

const protectedEnvironment = { SITE_ACCESS_PASSWORD: "test-preview-password" };

test("renders the game-first VASTFRAME home page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();

  assert.match(html, /<title>VASTFRAME — Independent Game Studio<\/title>/i);
  assert.match(html, /Worlds with/);
  assert.match(html, /Splinterheart/);
  assert.match(html, /Threshold/);
  assert.match(html, /Eclipse/);
  assert.match(html, /Firmament/);
  assert.match(html, /Causality/);
  assert.match(html, /HOME_HERO/);
  assert.match(html, /updates will live on Steam/i);
  assert.match(html, /<meta name="robots" content="noindex, nofollow, nocache"/i);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/i);
  assert.doesNotMatch(html, /Snowfall|Backrooms/i);
  assert.doesNotMatch(html, /devlog|publishing/i);
});

test("lists only Splinterheart on the public games route", async () => {
  const response = await render("/games");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Splinterheart/);
  assert.doesNotMatch(html, /Snowfall|Backrooms/i);
});

test("does not expose a studio blog route", async () => {
  const response = await render("/devlog");
  assert.equal(response.status, 404);
});

test("keeps anonymous visitors outside the Workbench", async () => {
  const response = await render("/workbench");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /The workshop is private/);
  assert.match(html, /Continue to secure sign-in/);
  assert.doesNotMatch(html, /Good morning|Lore bible|Editorial queue/);
});

test("keeps membership administration behind Workbench access", async () => {
  const response = await render("/workbench/members");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /The workshop is private/);
  assert.doesNotMatch(html, /People with keys|Add a collaborator/);
});

test("keeps Workbench operations behind Workbench access", async () => {
  const response = await render("/workbench/operations");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /The workshop is private/);
  assert.doesNotMatch(html, /Recoverable by design|Download lore backup/);
});

test("rejects anonymous Workbench API reads", async () => {
  const response = await render("/api/workbench/lore");
  assert.equal(response.status, 403);
  const body = await response.json();
  assert.match(body.error, /membership required/i);
});

test("rejects mutations without the Workbench request marker before authorization", async () => {
  const response = await render("/api/workbench/lore", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({}),
  });
  assert.equal(response.status, 403);
  const body = await response.json();
  assert.match(body.error, /mutation header required/i);
});

test("still requires membership when the mutation marker is present", async () => {
  const response = await render("/api/workbench/lore", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-vastframe-workbench": "1",
    },
    body: JSON.stringify({}),
  });
  assert.equal(response.status, 403);
  const body = await response.json();
  assert.match(body.error, /membership required/i);
});

test("rejects cross-origin Workbench mutations", async () => {
  const response = await render("/api/workbench/lore", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-vastframe-workbench": "1",
      origin: "https://attacker.example",
    },
    body: JSON.stringify({}),
  });
  assert.equal(response.status, 403);
  const body = await response.json();
  assert.match(body.error, /cross-origin/i);
});

test("rejects anonymous lore exports", async () => {
  const response = await render("/api/workbench/export/lore");
  assert.equal(response.status, 403);
  const body = await response.json();
  assert.match(body.error, /membership required/i);
});

test("keeps the private preview out of search indexes", async () => {
  const response = await render("/robots.txt");
  assert.equal(response.status, 200);
  const body = await response.text();
  assert.match(body, /User-Agent:\s*\*/i);
  assert.match(body, /Disallow:\s*\//i);
});

test("redirects password-protected visitors to the preview gate", async () => {
  const response = await render("/games?from=phone", {}, protectedEnvironment);
  assert.equal(response.status, 302);
  assert.equal(
    response.headers.get("location"),
    "http://localhost/__access?return_to=%2Fgames%3Ffrom%3Dphone",
  );
});

test("renders a no-store, noindex password screen", async () => {
  const response = await render("/__access?return_to=%2Fsdk", {}, protectedEnvironment);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("cache-control"), /no-store/i);
  assert.match(response.headers.get("x-robots-tag"), /noindex/i);
  const html = await response.text();
  assert.match(html, /Step inside/);
  assert.match(html, /name="return_to" type="hidden" value="\/sdk"/);
});

test("rejects an incorrect preview password", async () => {
  const response = await render(
    "/__access/unlock",
    {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: "password=wrong&return_to=%2Fgames",
    },
    protectedEnvironment,
  );
  assert.equal(response.status, 401);
  assert.match(await response.text(), /password did not match/i);
});

test("unlocks the protected site with an HttpOnly host cookie", async () => {
  const unlock = await render(
    "/__access/unlock",
    {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: "password=test-preview-password&return_to=%2Fgames",
    },
    protectedEnvironment,
  );
  assert.equal(unlock.status, 303);
  assert.equal(unlock.headers.get("location"), "http://localhost/games");
  const setCookie = unlock.headers.get("set-cookie");
  assert.match(setCookie, /__Host-vastframe_access=/);
  assert.match(setCookie, /HttpOnly/i);
  assert.match(setCookie, /Secure/i);
  assert.match(setCookie, /SameSite=Lax/i);

  const cookie = setCookie.split(";", 1)[0];
  const response = await render(
    "/games",
    { headers: { cookie } },
    protectedEnvironment,
  );
  assert.equal(response.status, 200);
  assert.match(response.headers.get("cache-control"), /no-store/i);
  assert.match(await response.text(), /Splinterheart/);
});
