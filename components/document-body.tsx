import type { ReactNode } from "react";
import { CodeBlock } from "./code-block";

function headingId(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function inline(value: string): ReactNode[] {
  const parts = value.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) return <code key={index}>{part.slice(1, -1)}</code>;
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={index}>{part.slice(2, -2)}</strong>;
    return part;
  });
}

export function DocumentBody({ body }: { body: string }) {
  const lines = body.replaceAll("\r\n", "\n").split("\n");
  const nodes: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trimEnd();
    if (!line.trim()) { index += 1; continue; }

    if (line.startsWith("```")) {
      const language = line.slice(3).trim() || "text";
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].startsWith("```")) { code.push(lines[index]); index += 1; }
      nodes.push(<CodeBlock code={code.join("\n")} language={language} key={`code-${index}`} />);
      index += 1;
      continue;
    }

    if (line.startsWith("## ") || line.startsWith("### ")) {
      const level = line.startsWith("### ") ? 3 : 2;
      const title = line.slice(level + 1);
      const id = headingId(title);
      nodes.push(level === 2
        ? <h2 id={id} key={id}><a href={`#${id}`}>{title}</a></h2>
        : <h3 id={id} key={id}><a href={`#${id}`}>{title}</a></h3>);
      index += 1;
      continue;
    }

    if (line.startsWith("> ")) {
      nodes.push(<aside className="doc-callout" key={`callout-${index}`}>{inline(line.slice(2))}</aside>);
      index += 1;
      continue;
    }

    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (index < lines.length && lines[index].startsWith("- ")) { items.push(lines[index].slice(2)); index += 1; }
      nodes.push(<ul key={`list-${index}`}>{items.map((item) => <li key={item}>{inline(item)}</li>)}</ul>);
      continue;
    }

    const paragraph = [line];
    index += 1;
    while (index < lines.length && lines[index].trim() && !/^(#{2,3} |```|> |- )/.test(lines[index])) { paragraph.push(lines[index].trim()); index += 1; }
    nodes.push(<p key={`paragraph-${index}`}>{inline(paragraph.join(" "))}</p>);
  }

  return <div className="doc-body">{nodes}</div>;
}
