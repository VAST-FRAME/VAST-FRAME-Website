import assert from "node:assert/strict";
import test from "node:test";
import { buildAdminSql } from "../scripts/workbench-admin-sql.mjs";

test("builds an idempotent first-administrator statement", () => {
  const sql = buildAdminSql({
    email: " Admin@Example.COM ",
    displayName: "Ada O'Brien",
    id: "member-1",
  });

  assert.match(sql, /admin@example\.com/);
  assert.match(sql, /Ada O''Brien/);
  assert.match(sql, /ON CONFLICT\(email\) DO UPDATE/);
  assert.match(sql, /role = 'admin'/);
  assert.match(sql, /status = 'active'/);
  assert.match(sql, /^BEGIN;/);
  assert.match(sql, /COMMIT;$/);
});

test("rejects invalid bootstrap identities", () => {
  assert.throws(() => buildAdminSql({ email: "not-an-email", displayName: "Admin" }), /valid administrator email/i);
  assert.throws(() => buildAdminSql({ email: "admin@example.com", displayName: "" }), /display name/i);
});
