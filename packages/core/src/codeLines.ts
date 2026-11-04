/** Split highlighted markup at source newlines, reopening multiline token spans. */
export function splitHighlightedLines(html: string): string[] {
  const stack: string[] = [];
  const lines: string[] = [];
  let line = "";
  // highlight.js emits escaped source text and span tags only.
  for (const token of html.split(/(<span\b[^>]*>|<\/span>|\n)/g)) {
    if (token === "\n") {
      lines.push(line + "</span>".repeat(stack.length));
      line = stack.join("");
    } else {
      line += token;
      if (token.startsWith("<span")) stack.push(token);
      else if (token === "</span>") stack.pop();
    }
  }
  // A fence's terminal newline is a terminator, not an extra source line.
  if (line.replace(/<\/?span\b[^>]*>/g, "") || lines.length === 0)
    lines.push(line);
  return lines;
}

export function renderNumberedCode(html: string): string {
  const lines = splitHighlightedLines(html);
  const gutter = lines
    .map((_, i) => `<span class="code-number">${i + 1}</span>`)
    .join("");
  const body = lines
    .map((line) => `<span class="code-line">${line || "<br>"}</span>`)
    .join("");
  return `<span class="code-frame"><span class="code-gutter" aria-hidden="true">${gutter}</span><span class="code-scroll" tabindex="0" role="region" aria-label="代码，可横向滚动"><code class="hljs">${body}</code></span></span>`;
}
