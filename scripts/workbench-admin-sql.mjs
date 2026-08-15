import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";

function quoteSql(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

export function buildAdminSql({ email, displayName, id = randomUUID() }) {
  const normalizedEmail = String(email ?? "").trim().toLowerCase();
  const normalizedName = String(displayName ?? "").trim();

  if (!/^\S+@\S+\.\S+$/.test(normalizedEmail) || normalizedEmail.length > 254) {
    throw new Error("Provide a valid administrator email address.");
  }
  if (!normalizedName || normalizedName.length > 120) {
    throw new Error("Provide a display name between 1 and 120 characters.");
  }

  return [
    "BEGIN;",
    "INSERT INTO studio_members (id, email, display_name, role, status, invited_by)",
    `VALUES (${quoteSql(id)}, ${quoteSql(normalizedEmail)}, ${quoteSql(normalizedName)}, 'admin', 'active', 'bootstrap')`,
    "ON CONFLICT(email) DO UPDATE SET",
    "  display_name = excluded.display_name,",
    "  role = 'admin',",
    "  status = 'active',",
    "  updated_at = CURRENT_TIMESTAMP;",
    "COMMIT;",
  ].join("\n");
}

function printUsage() {
  console.error('Usage: pnpm workbench:admin-sql -- <email> "<display name>"');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  try {
    const [email, displayName] = process.argv.slice(2);
    console.log(buildAdminSql({ email, displayName }));
  } catch (error) {
    printUsage();
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
