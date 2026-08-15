import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");

test("the visual system uses Bright Bluish Green as its accent", async () => {
  const css = await readFile(path.join(root, "app/globals.css"), "utf8");
  assert.match(css, /--turquoise:\s*#069d9f/i);
  assert.doesNotMatch(css, /pink|#ff3eab|#d60877/i);
});

test("public documentation reads only immutable published revisions", async () => {
  const source = await readFile(path.join(root, "lib/knowledge/public.ts"), "utf8");
  assert.match(source, /spaces\.visibility = 'public'/);
  assert.match(source, /revisions\.revision = entries\.published_revision/);
  assert.match(source, /entries\.published_revision IS NOT NULL/);
  assert.doesNotMatch(source, /publication_status = 'draft'/);
});

test("documentation publication is an editor-only revision transition", async () => {
  const source = await readFile(path.join(root, "app/api/workbench/knowledge/[id]/publish/route.ts"), "utf8");
  assert.match(source, /requireWorkbenchAccess\(\["admin", "editor"\]\)/);
  assert.match(source, /space_visibility !== "public"/);
  assert.match(source, /published_revision=\?1/);
  assert.match(source, /change_kind,authored_by/);
});

test("archiving a public article withdraws its published pointer without deleting history", async () => {
  const source = await readFile(path.join(root, "app/api/workbench/knowledge/[id]/status/route.ts"), "utf8");
  assert.match(source, /published_revision=CASE WHEN \?1='archived' THEN NULL/);
  assert.match(source, /knowledge_entry_revisions/);
  assert.doesNotMatch(source, /DELETE FROM knowledge_entry_revisions/);
});

test("knowledge migration includes the indexes used by public and Workbench queries", async () => {
  const migration = await readFile(path.join(root, "drizzle/0001_dapper_cardiac.sql"), "utf8");
  assert.match(migration, /idx_knowledge_entries_space_status_order/);
  assert.match(migration, /idx_knowledge_entries_product_status/);
  assert.match(migration, /idx_knowledge_revisions_entry_revision/);
  assert.match(migration, /idx_knowledge_links_target/);
});

async function sourceFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (["dist", ".next", ".vinext", "node_modules", ".git", ".wrangler"].includes(entry.name)) continue;
    const resolved = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await sourceFiles(resolved));
    else if (/\.(?:ts|tsx|mjs|md|json)$/.test(entry.name)) files.push(resolved);
  }
  return files;
}

test("the website source contains no superseded sky-system name", async () => {
  const forbidden = ["Firma", "ment"].join("").toLowerCase();
  const files = await sourceFiles(root);
  const matches = [];
  for (const file of files) {
    const contents = await readFile(file, "utf8");
    if (contents.toLowerCase().includes(forbidden)) matches.push(path.relative(root, file));
  }
  assert.deepEqual(matches, []);
});
