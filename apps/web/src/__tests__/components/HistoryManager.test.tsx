import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, waitFor } from "@testing-library/react";
import { HistoryManager } from "../../components/History/HistoryManager";
import { useEditorStore } from "../../store/editorStore";
import { useThemeStore } from "../../store/themeStore";
import { useHistoryStore } from "../../store/historyStore";

const originalLoadHistory = useHistoryStore.getState().loadHistory;
const originalSaveSnapshot = useHistoryStore.getState().saveSnapshot;

beforeEach(() => {
  useHistoryStore.setState({
    history: [],
    activeId: null,
    loading: true,
    loadHistory: originalLoadHistory,
    saveSnapshot: originalSaveSnapshot,
  });
  useEditorStore.setState({ markdown: "# 自动创建的文章" });
  useThemeStore.setState({
    themeId: "default",
    themeName: "默认主题",
    customCSS: "body { color:red; }",
  });
  vi.spyOn(useHistoryStore.getState(), "loadHistory").mockImplementation(
    async () => {
      useHistoryStore.setState({ loading: false });
    },
  );
  vi.spyOn(useHistoryStore.getState(), "saveSnapshot").mockResolvedValue(null);
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("initial article theme and history restoration", () => {
  it("automatically creates the first article with the new theme despite a previously selected theme", async () => {
    render(<HistoryManager />);
    await waitFor(() =>
      expect(useHistoryStore.getState().saveSnapshot).toHaveBeenCalledWith(
        expect.objectContaining({
          theme: "weflow-tech",
          themeName: "简洁技术",
          customCSS: "",
        }),
        { force: true },
      ),
    );
    expect(useThemeStore.getState().themeId).toBe("weflow-tech");
    expect(useThemeStore.getState().customCSS).toBe("");
  });
  it("restores saved history theme and CSS instead of applying the new-article policy", async () => {
    useHistoryStore.setState({
      activeId: "old-article",
      history: [
        {
          id: "old-article",
          title: "旧文章",
          markdown: "# 旧文章内容",
          theme: "default",
          themeName: "默认主题",
          customCSS: "p { color:blue; }",
          createdAt: "2026-01-01T00:00:00Z",
          savedAt: "2026-01-01T00:00:00Z",
        },
      ],
    });
    useThemeStore.setState({
      themeId: "weflow-tech",
      themeName: "简洁技术",
      customCSS: "",
    });
    render(<HistoryManager />);
    await waitFor(() =>
      expect(useEditorStore.getState().markdown).toBe("# 旧文章内容"),
    );
    expect(useThemeStore.getState().themeId).toBe("default");
    expect(useThemeStore.getState().customCSS).toBe("p { color:blue; }");
    expect(useHistoryStore.getState().saveSnapshot).not.toHaveBeenCalled();
  });
});
