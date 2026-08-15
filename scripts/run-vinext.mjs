import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const command = process.argv[2];
if (!new Set(["dev", "build", "start"]).has(command)) {
  console.error("Usage: node scripts/run-vinext.mjs <dev|build|start>");
  process.exit(2);
}

const cli = fileURLToPath(
  new URL("../node_modules/vinext/dist/cli.js", import.meta.url),
);
const child = spawn(process.execPath, [cli, command], {
  stdio: "inherit",
  env: {
    ...process.env,
    WRANGLER_LOG_PATH:
      process.env.WRANGLER_LOG_PATH ?? ".wrangler/wrangler.log",
  },
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});

