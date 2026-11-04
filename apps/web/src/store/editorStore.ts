// 编辑器状态管理（主题相关功能已迁移到 themeStore.ts）
import { resolveAppAssetPath } from "../utils/assetPath";
import { create } from "zustand";
import { useThemeStore } from "./themeStore";
import { copyToWechat as execCopyToWechat } from "../services/wechatCopyService";
import { copyAsHtml as execCopyAsHtml } from "../services/htmlCopyService";
import { exportLongImage as execExportLongImage } from "../services/longImageExportService";

export interface ResetOptions {
  markdown?: string;
  theme?: string;
  customCSS?: string;
  themeName?: string;
}

interface EditorStore {
  markdown: string;
  setMarkdown: (markdown: string) => void;

  lastAutoSavedAt: Date | null;
  isEditing: boolean;
  setLastAutoSavedAt: (time: Date | null) => void;
  setIsEditing: (editing: boolean) => void;

  currentFilePath?: string;
  workspaceDir?: string;
  setFilePath: (path?: string) => void;
  setWorkspaceDir: (dir?: string) => void;

  resetDocument: (options?: ResetOptions) => void;
  copyToWechat: () => void;
  copyAsHtml: () => void;
  exportLongImage: () => void;
}

// 复制与长图共用当前主题的 CSS 和 Mac 顶栏设置
const getActiveThemeRenderOptions = () => {
  const themeStore = useThemeStore.getState();
  const css = themeStore.getThemeCSS(themeStore.themeId);
  const currentTheme =
    themeStore.customThemes.find((t) => t.id === themeStore.themeId) ||
    themeStore.getAllThemes().find((t) => t.id === themeStore.themeId);
  const showMacBar = currentTheme?.designerVariables?.showMacBar ?? false;
  const showCodeLineNumbers = currentTheme?.showCodeLineNumbers ?? false;
  return { css, showMacBar, showCodeLineNumbers };
};

export const defaultMarkdown = `# WeFlow：把技术思路写成文章

从一个明确的问题开始，用**可复现的示例**解释解决办法。本文展示本地写作、代码与图表的组合。

## 01 先建立最小示例

正文使用系统字体，阅读时保留适当的行间距。章节编号由作者填写。

### 验证输入与输出

\`\`\`js
function greet(name) {
  // 保留中文、缩进和空行
  const message = \`Hello, \${name}\`;

  return message;
}
console.log(greet("WeFlow"));
\`\`\`

## 02 用图表说明流程

\`\`\`mermaid
flowchart LR
  Markdown --> Preview --> Copy
\`\`\`

| 环节 | 检查内容 |
| --- | --- |
| 编写 | 观点、示例、结论 |
| 预览 | 代码、图片、表格 |
| 发布 | 粘贴、保存、重新打开 |

> 先保存本地文章，再复制到公众号后台检查排版。

![技术文章的编写、预览与发布流程](${resolveAppAssetPath("images/writing-flow.png")})

## 03 保存并继续写作

浏览器存储自动保存文章；也可在支持的浏览器中选择本地文件夹。本地文件夹中保存 Markdown，也可使用工具栏导出 PNG 长图。
`;

export const useEditorStore = create<EditorStore>((set, get) => ({
  markdown: defaultMarkdown,
  setMarkdown: (markdown) => set({ markdown, isEditing: true }),

  // 编辑状态跟踪
  lastAutoSavedAt: null,
  isEditing: false,
  setLastAutoSavedAt: (time) =>
    set({ lastAutoSavedAt: time, isEditing: false }),
  setIsEditing: (editing) => set({ isEditing: editing }),

  currentFilePath: undefined,
  workspaceDir: undefined,
  setFilePath: (path) => set({ currentFilePath: path }),
  setWorkspaceDir: (dir) => set({ workspaceDir: dir }),

  resetDocument: (options) => {
    const themeStore = useThemeStore.getState();
    const allThemes = themeStore.getAllThemes();

    // 验证主题是否存在
    let targetTheme = options?.theme ?? "weflow-tech";

    const themeExists = allThemes.some((t) => t.id === targetTheme);
    if (!themeExists) {
      console.warn(`Theme ${targetTheme} not found, falling back to default`);
      targetTheme = "default";
    }

    // 重置编辑器内容
    set({ markdown: options?.markdown ?? defaultMarkdown });

    // 重置主题（通过 themeStore）
    themeStore.selectTheme(targetTheme);
    if (options?.customCSS) {
      themeStore.setCustomCSS(options.customCSS);
    }
  },

  copyToWechat: async () => {
    const { markdown } = get();
    const { css, showMacBar, showCodeLineNumbers } =
      getActiveThemeRenderOptions();

    try {
      await execCopyToWechat(markdown, css, {
        showMacBar,
        showCodeLineNumbers,
      });
    } catch (error) {
      console.error("复制失败:", error);
    }
  },

  copyAsHtml: async () => {
    const { markdown } = get();
    await execCopyAsHtml(markdown);
  },

  exportLongImage: async () => {
    const { css, showMacBar, showCodeLineNumbers } =
      getActiveThemeRenderOptions();
    await execExportLongImage(get().markdown, css, {
      showMacBar,
      showCodeLineNumbers,
    });
  },
}));
