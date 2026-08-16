import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("models organizations, per-product shipped-title licenses, releases, and downloads", async () => {
  const schema = await readFile(new URL("../db/schema.ts", import.meta.url), "utf8");
  const migration = await readFile(new URL("../drizzle/0002_good_rocket_raccoon.sql", import.meta.url), "utf8");

  for (const table of [
    "customer_users",
    "customer_organizations",
    "customer_organization_memberships",
    "commercial_products",
    "product_licenses",
    "product_releases",
    "customer_orders",
    "product_download_events",
  ]) {
    assert.match(schema, new RegExp(`"${table}"`));
    assert.match(migration, new RegExp("CREATE TABLE `" + table + "`"));
  }

  assert.match(schema, /assignmentStatus:[\s\S]*unassigned[\s\S]*development[\s\S]*released/);
  assert.match(schema, /updatesEndAt/);
  assert.match(schema, /assignedTitle/);
});

test("grants downloads only through active organization entitlements and the two-year update cutoff", async () => {
  const database = await readFile(new URL("../lib/customer/database.ts", import.meta.url), "utf8");
  const route = await readFile(new URL("../app/api/account/downloads/[releaseId]/route.ts", import.meta.url), "utf8");

  assert.match(database, /licenses\.organization_id = \?1/);
  assert.match(database, /licenses\.state = 'active'/);
  assert.match(database, /releases\.published_at <= licenses\.updates_end_at/);
  assert.match(route, /getCustomerAccount\(\)/);
  assert.match(route, /getEntitledRelease\(account\.organization\.id, releaseId\)/);
  assert.match(route, /env\.PRODUCTS\.get\(release\.objectKey\)/);
  assert.match(route, /recordProductDownload/);
});

test("keeps the public catalog extensible for a future Mesh Graph product", async () => {
  const catalog = await readFile(new URL("../lib/commercial-data.ts", import.meta.url), "utf8");
  assert.match(catalog, /"mesh-graph"/);
  assert.match(catalog, /commercialProducts/);
  assert.doesNotMatch(catalog, /name:\s*"Mesh Graph"/);
});
