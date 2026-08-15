"use client";

import { useState } from "react";

export function CodeBlock({ code, language = "text" }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="doc-code">
      <header><span>{language}</span><button type="button" onClick={async () => { await navigator.clipboard.writeText(code); setCopied(true); window.setTimeout(() => setCopied(false), 1500); }}>{copied ? "Copied" : "Copy"}</button></header>
      <pre><code>{code}</code></pre>
    </div>
  );
}
