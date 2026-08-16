import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
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

test("renders an SDK-first VASTFRAME home page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  const homeSource = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(html, /<title>VASTFRAME — Real-Time Technology Studio<\/title>/i);
  assert.match(html, /Cutting-edge tech for Unity/i);
  assert.match(html, /VASTFRAME SDK/i);
  assert.doesNotMatch(html, /Unity technology|technology-hero__kind/i);
  assert.doesNotMatch(html, /VASTFRAME builds rendering|Rendering, atmosphere, scene processing, and simulation/i);
  assert.match(html, /Threshold/);
  assert.match(html, /Eclipse/);
  assert.match(html, /Atrium/);
  assert.match(html, /Causality/);
  assert.doesNotMatch(html, new RegExp(["Firma", "ment"].join(""), "i"));
  assert.doesNotMatch(html, /SDK_INTEGRATED_STACK_HERO|Four systems\. One stack\./i);
  for (const slot of [
    "THRESHOLD_MATERIAL_RESPONSE_NAV",
    "ATRIUM_CELESTIAL_FIELD_NAV",
    "ECLIPSE_UV_PIPELINE_NAV",
    "CAUSALITY_PROPAGATION_NAV",
  ]) {
    assert.match(html, new RegExp(slot));
  }
  assert.match(html, /aria-label="SDK navigation"/i);
  for (const href of ["/sdk/threshold", "/sdk/atrium", "/sdk/eclipse", "/sdk/causality", "/docs"]) {
    assert.match(html, new RegExp(`href="${href}"`));
  }
  assert.doesNotMatch(html, /href="\/sdk"|>Overview</i);
  for (const name of ["Threshold", "Atrium", "Eclipse", "Causality"]) {
    assert.match(html, new RegExp(`Explore(?:\\s|<!--.*?-->)*${name}`, "i"));
  }
  assert.match(html, /<meta name="robots" content="noindex, nofollow, nocache"/i);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/i);
  assert.doesNotMatch(html, /Snowfall|Backrooms/i);
  assert.doesNotMatch(html, /off-the-shelf answers|The studio/i);
  assert.doesNotMatch(html, /devlog|publishing|Splinterheart|Worlds with weight|News, when there is news|Independent games|href="\/games/i);
  assert.match(html, /Made for/);
  assert.match(html, /real worlds/i);
  assert.match(html, /class="technology-hero frame-grid technology-hero--overview"/);
  assert.ok(html.indexOf('class="technology-hero frame-grid technology-hero--overview"') < html.indexOf('class="product-strip product-strip--navigation"'));
  assert.match(html, /technology-hero__actions[\s\S]*Read the documentation/i);
  assert.doesNotMatch(homeSource, /home-hero|MediaPlaceholder/);
});

test("uses one safe line-height for oversized display headings", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(css, /--display-leading:\s*0\.86/);
  assert.match(css, /\.display\s*\{[^}]*line-height:\s*var\(--display-leading\)/s);
  assert.doesNotMatch(css, /line-height:\s*0\.79/);
});

test("keeps emphasized display text in the surrounding typeface", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(css, /\.display em\s*\{[^}]*font-family:\s*inherit[^}]*font-style:\s*italic/s);
  assert.match(css, /\.technology-proof h2 em\s*\{[^}]*font-family:\s*inherit[^}]*font-style:\s*italic/s);
});

test("keeps product titles at the Home heading scale without forced clipping", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(css, /\.display--section\s*\{[^}]*font-size:\s*clamp\(3\.25rem,\s*7cqi,\s*7\.5rem\)/s);
  assert.match(css, /\.technology-hero__title\s*\{[^}]*font-size:\s*clamp\(3\.25rem,\s*7cqi,\s*7\.5rem\)[^}]*white-space:\s*normal/s);
  assert.match(css, /\.technology-hero\s*\{[^}]*height:\s*clamp\(26\.25rem,\s*38svh,\s*30rem\)[^}]*min-height:\s*0[^}]*align-content:\s*center[^}]*padding-top:\s*clamp\(2rem,\s*4\.5svh,\s*4rem\)/s);
  assert.match(css, /\.technology-hero__statement\s*\{[^}]*font-size:\s*clamp\(1\.75rem,\s*2\.5cqi,\s*3rem\)/s);
  assert.doesNotMatch(css, /\.technology-hero\s*\{[^}]*90svh/s);
  assert.match(css, /\.product-tile\s*\{[^}]*min-height:\s*clamp\(30rem,\s*50svh,\s*38rem\)/s);
  assert.doesNotMatch(css, /\.home-hero/);
  assert.match(css, /\.media-placeholder\s*\{[^}]*container-type:\s*inline-size/s);
  assert.match(css, /\.placeholder-title[\s\S]*font-size:\s*clamp\([^;]*cqi/s);
});

test("keeps public sections free of ornamental labels and frame borders", async () => {
  const home = await (await render()).text();
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.doesNotMatch(home, /home-hero__eyebrow|home-hero__index|product-tile__index|VASTFRAME \/ Unity technology/);
  assert.doesNotMatch(css, /\.site\s*\{[^}]*border-inline/s);
});

test("does not retain a redundant SDK overview route", async () => {
  const response = await render("/sdk");
  assert.equal(response.status, 404);
});

test("hides the Games index from anonymous visitors", async () => {
  const response = await render("/games");
  assert.equal(response.status, 404);
  assert.doesNotMatch(await response.text(), /Splinterheart|October 2027|Steam/i);
});

test("hides the Splinterheart detail route from anonymous visitors", async () => {
  const response = await render("/games/splinterheart");
  assert.equal(response.status, 404);
  assert.doesNotMatch(await response.text(), /Tiny Man is out for revenge|October 2027|Steam/i);
});

test("retains the hidden Games pages behind Workbench membership checks", async () => {
  const indexSource = await readFile(new URL("../app/games/page.tsx", import.meta.url), "utf8");
  const detailSource = await readFile(new URL("../app/games/splinterheart/page.tsx", import.meta.url), "utf8");
  for (const source of [indexSource, detailSource]) {
    assert.match(source, /getWorkbenchAccess\(\)/);
    assert.match(source, /notFound\(\)/);
  }
  assert.match(indexSource, /Worlds that/);
  assert.match(detailSource, /splinterheart\.statement/);
});

test("presents candid careers copy and welcomes unsolicited work", async () => {
  const response = await render("/jobs");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /VASTFRAME,/);
  assert.match(html, /people who like making cool things/i);
  assert.match(html, /whether or not there are any listed roles/i);
  assert.doesNotMatch(html, /whether or not there are any listed jobs/i);
  assert.doesNotMatch(html, /Serious craft|care about the whole work|résumé collection funnel/i);
});

test("uses one public studio contact address", async () => {
  const response = await render("/contact");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<h1[^>]*>Contact us\.<\/h1>/i);
  assert.doesNotMatch(html, /site--paper|<em>us\.<\/em>/i);
  assert.match(html, /mailto:contact@vastframe\.com/i);
  assert.doesNotMatch(html, /hello@vastframe\.com|press@vastframe\.com|biz@vastframe\.com|Start a/i);
});

for (const [slug, name, slot] of [
  ["threshold", "Threshold", "THRESHOLD_SHADOW_ARCHITECTURE_HERO"],
  ["atrium", "Atrium", "ATRIUM_ATMOSPHERE_HERO"],
  ["eclipse", "Eclipse", "ECLIPSE_SCENE_PIPELINE_HERO"],
  ["causality", "Causality", "CAUSALITY_CHAIN_REACTION_HERO"],
]) {
  test(`renders the ${name} SDK showcase with an opinionated capture plan`, async () => {
    const response = await render(`/sdk/${slug}`);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, new RegExp(name));
    assert.doesNotMatch(html, /Rendering system|Sky and atmosphere|Scene pipeline|World simulation|technology-hero__kind/i);
    assert.match(html, new RegExp(slot));
    assert.match(html, /Rendering showcase/);
    assert.match(html, /class="product-strip product-strip--navigation"/);
    assert.match(html, /aria-label="SDK products"/);
    assert.match(html, new RegExp(`href="/sdk/${slug}" aria-current="page"`));
    assert.ok(html.indexOf('class="technology-hero frame-grid"') < html.indexOf('class="product-strip product-strip--navigation"'));
    assert.ok(html.indexOf('class="product-strip product-strip--navigation"') < html.indexOf('class="technology-lead-media"'));
    assert.doesNotMatch(html, /technology-subnav|technology-next|Made for|real worlds/i);
    assert.doesNotMatch(html, /Every image has a job|production capture briefs|decorative boxes/i);
    assert.match(html, new RegExp(`/docs/${slug}`));
    assert.doesNotMatch(html, /Splinterheart|href="\/games/i);
    assert.doesNotMatch(html, new RegExp(["Firma", "ment"].join(""), "i"));
  });
}

test("publishes a public SDK documentation home without Workbench identity", async () => {
  const response = await render("/docs");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<h1>Documentation\.<\/h1>/i);
  assert.match(html, /Technical reference for Threshold, Atrium, Eclipse, and Causality/i);
  assert.match(html, /Threshold/);
  assert.match(html, /Atrium/);
  assert.doesNotMatch(html, /Read the system|Publication policy|Public by design|Explicitly published|eventually complete/i);
  assert.doesNotMatch(html, new RegExp(["Firma", "ment"].join(""), "i"));
});

test("renders public product documentation and deep-linked technical articles", async () => {
  const overview = await render("/docs/threshold");
  assert.equal(overview.status, 200);
  assert.match(await overview.text(), /What Threshold owns/);
  const article = await render("/docs/threshold/shadow-architecture");
  assert.equal(article.status, 200);
  const html = await article.text();
  assert.match(html, /Percentage-closer soft shadows/);
  assert.match(html, /id="validation-checklist"/);
});

test("searches only the published SDK documentation corpus", async () => {
  const response = await render("/docs/search?q=lightning");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Clouds and distant phenomena/);
  assert.match(html, /published article/);
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
      "sec-fetch-site": "cross-site",
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

test("rejects anonymous reads from every Workbench knowledge space", async () => {
  const response = await render("/api/workbench/knowledge?space=sdk-docs");
  assert.equal(response.status, 403);
  const body = await response.json();
  assert.match(body.error, /membership required/i);
});

test("requires the Workbench mutation contract before creating knowledge", async () => {
  const response = await render("/api/workbench/knowledge", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ title: "Private draft" }),
  });
  assert.equal(response.status, 403);
  const body = await response.json();
  assert.match(body.error, /mutation header required/i);
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
  const response = await render("/__access?return_to=%2Fdocs", {}, protectedEnvironment);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("cache-control"), /no-store/i);
  assert.match(response.headers.get("x-robots-tag"), /noindex/i);
  const html = await response.text();
  assert.match(html, /Step inside/);
  assert.match(html, /name="return_to" type="hidden" value="\/docs"/);
  assert.match(html, /#069d9f/i);
  assert.doesNotMatch(html, /#ff3fa6/i);
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
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        origin: "https://public-preview.example",
        "sec-fetch-site": "same-origin",
      },
      body: "password=test-preview-password&return_to=%2F",
    },
    protectedEnvironment,
  );
  assert.equal(unlock.status, 303);
  assert.equal(unlock.headers.get("location"), "http://localhost/");
  const setCookie = unlock.headers.get("set-cookie");
  assert.match(setCookie, /__Host-vastframe_access=/);
  assert.match(setCookie, /HttpOnly/i);
  assert.match(setCookie, /Secure/i);
  assert.match(setCookie, /SameSite=Lax/i);

  const cookie = setCookie.split(";", 1)[0];
  const response = await render(
    "/",
    { headers: { cookie } },
    protectedEnvironment,
  );
  assert.equal(response.status, 200);
  assert.match(response.headers.get("cache-control"), /no-store/i);
  assert.match(response.headers.get("vary"), /RSC/i);
  assert.match(response.headers.get("vary"), /Cookie/i);
  assert.match(await response.text(), /Cutting-edge tech for Unity\./i);
});

test("rejects cross-site preview unlock submissions", async () => {
  const response = await render(
    "/__access/unlock",
    {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        "sec-fetch-site": "cross-site",
      },
      body: "password=test-preview-password&return_to=%2Fgames",
    },
    protectedEnvironment,
  );

  assert.equal(response.status, 403);
  assert.equal(await response.text(), "Forbidden");
});
