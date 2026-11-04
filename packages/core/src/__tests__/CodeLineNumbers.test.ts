import { describe, expect, it } from "vitest";
import { createMarkdownParser } from "../MarkdownParser";
import { splitHighlightedLines } from "../codeLines";

describe("code line numbers", () => {
  it("does not count trailing multiline-token closing tags as a source line", () => {
    expect(
      splitHighlightedLines(
        '<span class="hljs-comment">/* start\nend\n</span>',
      ),
    ).toHaveLength(2);
    const html = createMarkdownParser({ showCodeLineNumbers: true }).render(
      "```js\n/* start\nend\n```",
    );
    expect(html.match(/class="code-number"/g)).toHaveLength(2);
  });
  it("is opt-in and excludes Mermaid", () => {
    expect(
      createMarkdownParser().render("```js\nconst a = 1;\n```"),
    ).not.toContain("code-gutter");
    const html = createMarkdownParser({ showCodeLineNumbers: true }).render(
      "```mermaid\nflowchart LR\n A --> B\n```",
    );
    expect(html).toContain('class="mermaid"');
    expect(html).not.toContain("code-gutter");
  });
  it("keeps blank lines, Chinese, indentation, special characters and 3-digit numbers", () => {
    const source = [
      '  中文 <tag> & "引用"',
      "",
      "\tindent",
      ...Array.from({ length: 100 }, (_, i) => `line ${i}`),
    ].join("\n");
    const html = createMarkdownParser({ showCodeLineNumbers: true }).render(
      "```unknown\n" + source + "\n```",
    );
    expect(html.match(/class="code-line"/g)).toHaveLength(103);
    expect(html).toContain('class="code-number">103</span>');
    expect(html).toContain("中文 &lt;tag&gt; &amp;");
    expect(html).toContain('class="code-line"><br></span>');
    expect(html).toContain("\tindent");
  });
  it("balances nested multiline syntax spans without losing source newlines", () => {
    const html =
      '<span class="a">one\n<span class="b">two\nthree</span>four</span>\n';
    const lines = splitHighlightedLines(html);
    expect(lines).toHaveLength(3);
    for (const line of lines)
      expect((line.match(/<span/g) || []).length).toBe(
        (line.match(/<\/span>/g) || []).length,
      );
    expect(lines.map((line) => line.replace(/<[^>]*>/g, "")).join("\n")).toBe(
      "one\ntwo\nthreefour",
    );
  });
  it("retains a 2000-character source line and multiline highlight classes", () => {
    const html = createMarkdownParser({ showCodeLineNumbers: true }).render(
      "```js\n/* first\n\nlast */\n" + "a".repeat(2000) + "\n```",
    );
    expect(html.match(/class="code-line"/g)).toHaveLength(4);
    expect(html).toContain("a".repeat(2000));
    expect(html.match(/hljs-comment/g)?.length).toBeGreaterThanOrEqual(3);
  });
});
