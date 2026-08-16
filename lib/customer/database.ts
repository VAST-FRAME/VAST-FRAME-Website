import { env } from "cloudflare:workers";
import { commercialProducts } from "@/lib/commercial-data";
import type { CustomerAccount, CustomerIdentity, CustomerLicense, CustomerOrder, EntitledRelease } from "./types";

const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS commercial_products (
    key TEXT PRIMARY KEY, name TEXT NOT NULL, availability TEXT NOT NULL,
    price_label TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS customer_users (
    id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, display_name TEXT NOT NULL,
    last_seen_at TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_users_email ON customer_users(email)`,
  `CREATE TABLE IF NOT EXISTS customer_organizations (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS customer_organization_memberships (
    id TEXT PRIMARY KEY, organization_id TEXT NOT NULL, user_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('owner','admin','member')),
    status TEXT NOT NULL CHECK (status IN ('invited','active','disabled')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, user_id)
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_memberships_organization_user ON customer_organization_memberships(organization_id, user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_customer_memberships_user_status ON customer_organization_memberships(user_id, status)`,
  `CREATE TABLE IF NOT EXISTS product_licenses (
    id TEXT PRIMARY KEY, organization_id TEXT NOT NULL, product_key TEXT NOT NULL,
    state TEXT NOT NULL CHECK (state IN ('active','refunded','revoked')),
    assignment_status TEXT NOT NULL CHECK (assignment_status IN ('unassigned','development','released')),
    assigned_title TEXT, purchased_at TEXT NOT NULL, updates_end_at TEXT NOT NULL,
    released_at TEXT, external_order_id TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS idx_product_licenses_organization_state ON product_licenses(organization_id, state)`,
  `CREATE INDEX IF NOT EXISTS idx_product_licenses_product_state ON product_licenses(product_key, state)`,
  `CREATE TABLE IF NOT EXISTS product_releases (
    id TEXT PRIMARY KEY, product_key TEXT NOT NULL, version TEXT NOT NULL,
    channel TEXT NOT NULL CHECK (channel IN ('stable','preview')),
    status TEXT NOT NULL CHECK (status IN ('draft','published','withdrawn')),
    unity_version TEXT NOT NULL, filename TEXT NOT NULL, object_key TEXT NOT NULL,
    content_type TEXT NOT NULL DEFAULT 'application/gzip', size_bytes INTEGER NOT NULL,
    checksum_sha256 TEXT NOT NULL, release_notes TEXT NOT NULL DEFAULT '', published_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_key, version, channel)
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_product_releases_product_version_channel ON product_releases(product_key, version, channel)`,
  `CREATE INDEX IF NOT EXISTS idx_product_releases_product_status_published ON product_releases(product_key, status, published_at)`,
  `CREATE TABLE IF NOT EXISTS customer_orders (
    id TEXT PRIMARY KEY, organization_id TEXT NOT NULL, provider TEXT NOT NULL,
    external_order_id TEXT NOT NULL, status TEXT NOT NULL,
    amount_minor INTEGER NOT NULL, currency TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider, external_order_id)
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_orders_provider_external ON customer_orders(provider, external_order_id)`,
  `CREATE INDEX IF NOT EXISTS idx_customer_orders_organization_created ON customer_orders(organization_id, created_at)`,
  `CREATE TABLE IF NOT EXISTS product_download_events (
    id TEXT PRIMARY KEY, organization_id TEXT NOT NULL, user_id TEXT NOT NULL,
    release_id TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS idx_product_download_events_organization_created ON product_download_events(organization_id, created_at)`,
] as const;

let schemaReady: Promise<void> | null = null;

function getDatabase(): D1Database {
  if (!env.DB) throw new Error("Customer database binding is unavailable.");
  return env.DB;
}
export async function ensureCustomerSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      const database = getDatabase();
      await database.batch(schemaStatements.map((statement) => database.prepare(statement)));
      await database.batch(commercialProducts.map((product) => database.prepare(
        `INSERT INTO commercial_products (key, name, availability, price_label)
         VALUES (?1, ?2, ?3, ?4)
         ON CONFLICT(key) DO UPDATE SET name=excluded.name, availability=excluded.availability,
           price_label=excluded.price_label, updated_at=CURRENT_TIMESTAMP`,
      ).bind(product.key, product.name, product.availability, product.priceLabel)));
      await database.prepare("PRAGMA optimize").run();
    })().catch((error) => {
      schemaReady = null;
      throw error;
    });
  }
  await schemaReady;
}

export async function ensureCustomerAccount(identity: CustomerIdentity): Promise<CustomerAccount> {
  await ensureCustomerSchema();
  const database = getDatabase();
  const normalizedEmail = identity.email.trim().toLowerCase();

  await database.prepare(
    `INSERT INTO customer_users (id, email, display_name, last_seen_at)
     VALUES (?1, ?2, ?3, CURRENT_TIMESTAMP)
     ON CONFLICT(id) DO UPDATE SET email=excluded.email, display_name=excluded.display_name,
       last_seen_at=CURRENT_TIMESTAMP, updated_at=CURRENT_TIMESTAMP`,
  ).bind(identity.id, normalizedEmail, identity.displayName).run();

  let membership = await findMembership(database, identity.id);
  if (!membership) {
    const organizationId = `org-${identity.id}`;
    const membershipId = `membership-${identity.id}`;
    await database.batch([
      database.prepare(
        `INSERT OR IGNORE INTO customer_organizations (id, name) VALUES (?1, ?2)`,
      ).bind(organizationId, `${identity.displayName}'s organization`),
      database.prepare(
        `INSERT OR IGNORE INTO customer_organization_memberships
         (id, organization_id, user_id, role, status) VALUES (?1, ?2, ?3, 'owner', 'active')`,
      ).bind(membershipId, organizationId, identity.id),
    ]);
    membership = await findMembership(database, identity.id);
  }

  if (!membership) throw new Error("Customer organization could not be created.");
  return {
    identity,
    organization: { id: membership.organizationId, name: membership.organizationName },
    role: membership.role,
    preview: identity.source === "preview",
  };
}

async function findMembership(database: D1Database, userId: string) {
  return database.prepare(
    `SELECT memberships.organization_id AS organizationId, organizations.name AS organizationName,
      memberships.role AS role
     FROM customer_organization_memberships memberships
     JOIN customer_organizations organizations ON organizations.id = memberships.organization_id
     WHERE memberships.user_id = ?1 AND memberships.status = 'active'
     ORDER BY memberships.created_at ASC LIMIT 1`,
  ).bind(userId).first<{ organizationId: string; organizationName: string; role: "owner" | "admin" | "member" }>();
}

export async function getCustomerLicenses(organizationId: string): Promise<CustomerLicense[]> {
  await ensureCustomerSchema();
  const result = await getDatabase().prepare(
    `SELECT licenses.id, licenses.product_key AS productKey, products.name AS productName,
      licenses.state, licenses.assignment_status AS assignmentStatus,
      licenses.assigned_title AS assignedTitle, licenses.purchased_at AS purchasedAt,
      licenses.updates_end_at AS updatesEndAt, licenses.released_at AS releasedAt
     FROM product_licenses licenses
     JOIN commercial_products products ON products.key = licenses.product_key
     WHERE licenses.organization_id = ?1
     ORDER BY licenses.created_at DESC`,
  ).bind(organizationId).all<CustomerLicense>();
  return result.results;
}

export async function getEntitledReleases(organizationId: string): Promise<EntitledRelease[]> {
  await ensureCustomerSchema();
  const result = await getDatabase().prepare(
    `SELECT releases.id, releases.product_key AS productKey, products.name AS productName,
      releases.version, releases.channel, releases.unity_version AS unityVersion,
      releases.filename, releases.object_key AS objectKey, releases.content_type AS contentType,
      releases.size_bytes AS sizeBytes, releases.checksum_sha256 AS checksumSha256,
      releases.release_notes AS releaseNotes, releases.published_at AS publishedAt
     FROM product_releases releases
     JOIN commercial_products products ON products.key = releases.product_key
     WHERE releases.status = 'published' AND releases.published_at IS NOT NULL
       AND EXISTS (
         SELECT 1 FROM product_licenses licenses
         WHERE licenses.organization_id = ?1 AND licenses.product_key = releases.product_key
           AND licenses.state = 'active' AND releases.published_at <= licenses.updates_end_at
       )
     ORDER BY releases.published_at DESC`,
  ).bind(organizationId).all<EntitledRelease>();
  return result.results;
}

export async function getEntitledRelease(organizationId: string, releaseId: string): Promise<EntitledRelease | null> {
  const releases = await getEntitledReleases(organizationId);
  return releases.find((release) => release.id === releaseId) ?? null;
}

export async function getCustomerOrders(organizationId: string): Promise<CustomerOrder[]> {
  await ensureCustomerSchema();
  const result = await getDatabase().prepare(
    `SELECT id, provider, external_order_id AS externalOrderId, status,
      amount_minor AS amountMinor, currency, created_at AS createdAt
     FROM customer_orders WHERE organization_id = ?1 ORDER BY created_at DESC`,
  ).bind(organizationId).all<CustomerOrder>();
  return result.results;
}

export async function recordProductDownload(organizationId: string, userId: string, releaseId: string): Promise<void> {
  await ensureCustomerSchema();
  await getDatabase().prepare(
    `INSERT INTO product_download_events (id, organization_id, user_id, release_id)
     VALUES (?1, ?2, ?3, ?4)`,
  ).bind(crypto.randomUUID(), organizationId, userId, releaseId).run();
}
