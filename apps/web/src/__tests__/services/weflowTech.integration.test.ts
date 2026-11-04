import { afterEach, describe, expect, it, vi } from "vitest";
import { createMarkdownParser, processHtml } from "@wemd/core";
import { builtInThemes } from "../../store/themes/builtInThemes";
import { useThemeStore } from "../../store/themeStore";
import { normalizeStoredThemes } from "../../store/themePersistence";
import { parseMarkdownFileContent } from "../../utils/markdownFileMeta";
import {
  copyToWechat,
  renderWechatContainer,
} from "../../services/wechatCopyService";
import { copyAsHtml } from "../../services/htmlCopyService";

const theme = builtInThemes.find((t) => t.id === "weflow-tech")!;
afterEach(() => {
  vi.restoreAllMocks();
  Object.defineProperty(window, "electron", {
    configurable: true,
    value: undefined,
  });
});
describe("WeFlow technical theme outputs and persistence", () => {
  it("registers independently and restores historic themes", () => {
    expect(theme.showCodeLineNumbers).toBe(true);
    expect(
      builtInThemes.find((t) => t.id === "default")?.showCodeLineNumbers,
    ).toBeUndefined();
    useThemeStore.getState().selectTheme("default");
    expect(useThemeStore.getState().themeId).toBe("default");
    expect(parseMarkdownFileContent("# legacy").theme).toBe("default");
  });
  it("persists line-number metadata in duplicated themes and workspace JSON", () => {
    const copy = useThemeStore.getState().duplicateTheme(theme.id, "技术副本");
    expect(copy.showCodeLineNumbers).toBe(true);
    expect(
      normalizeStoredThemes(JSON.parse(JSON.stringify([copy])))[0]
        .showCodeLineNumbers,
    ).toBe(true);
    expect(
      JSON.parse(
        window.localStorage.getItem("wemd-custom-themes") || "[]",
      ).find((t: { id: string }) => t.id === copy.id)?.showCodeLineNumbers,
    ).toBe(true);
  });
  it("uses inline text backgrounds for wrapped h2 and plain dark h1", () => {
    const host = document.createElement("div");
    host.innerHTML = processHtml(
      createMarkdownParser().render("# Title\n\n## Section **bold**\n\nText"),
      theme.css,
      true,
    );
    expect(
      (host.querySelector("h2 .content") as HTMLElement).style.backgroundColor,
    ).toBe("rgb(17, 17, 17)");
    expect((host.querySelector("h1") as HTMLElement).style.borderTopWidth).toBe(
      "0px",
    );
  });
  it("rich copying keeps line numbers and whitespace, plain text keeps original code without numbers", async () => {
    const source = '  const message = "中文 <&>";\n\n\tconsole.log(message);';
    const writeHTML = vi.fn(async (_payload: unknown) => ({ success: true }));
    Object.defineProperty(window, "electron", {
      configurable: true,
      value: { isElectron: true, clipboard: { writeHTML } },
    });
    await copyToWechat("```js\n" + source + "\n```", theme.css, {
      showCodeLineNumbers: true,
    });
    const payload = writeHTML.mock.calls[0]?.[0] as unknown as {
      html: string;
      text: string;
    };
    expect(payload.text.trimEnd()).toBe(source);
    const host = document.createElement("div");
    host.innerHTML = payload.html;
    expect(host.querySelectorAll(".code-number")).toHaveLength(3);
    expect(host.querySelectorAll(".code-line")).toHaveLength(3);
    expect(host.querySelector(".code-line")?.textContent).toContain(
      "\u00a0\u00a0const",
    );
    expect(payload.html).not.toContain("counter(");
  });
  it("semantic HTML copy stays free of line numbers and theme wrappers", async () => {
    const writeHTML = vi.fn(async (_payload: unknown) => ({ success: true }));
    Object.defineProperty(window, "electron", {
      configurable: true,
      value: { isElectron: true, clipboard: { writeHTML } },
    });
    await copyAsHtml("## Section\n\n```js\n  const a = 1;\n```");
    expect(JSON.stringify(writeHTML.mock.calls)).not.toContain("code-gutter");
    expect(JSON.stringify(writeHTML.mock.calls)).not.toContain("heading-text");
  });
  it("leaves real Mermaid blocks for the existing renderer", () => {
    const html = createMarkdownParser({ showCodeLineNumbers: true }).render(
      "```mermaid\nflowchart LR\n A --> B\n```",
    );
    expect(html).not.toContain("code-number");
  });
  it("preserves three-digit line numbers in final WeChat DOM", async () => {
    const result = await renderWechatContainer(
      "```txt\n" +
        Array.from({ length: 101 }, (_, i) => `行 ${i}`).join("\n") +
        "\n```",
      theme.css,
      { showCodeLineNumbers: true },
    );
    expect(result.container.querySelectorAll(".code-number")).toHaveLength(101);
    expect(
      result.container.querySelectorAll(".code-number")[100].textContent,
    ).toBe("101");
    result.container.remove();
  });
});
