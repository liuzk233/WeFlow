interface ThemeStateLike {
  themeId?: string;
  themeName?: string;
  customCSS?: string;
}

interface ThemeOptionLike {
  id: string;
  name: string;
}

export interface NewArticleThemeSnapshot {
  themeId: string;
  themeName: string;
  customCSS: string;
}

export const DEFAULT_NEW_ARTICLE_THEME: NewArticleThemeSnapshot = {
  themeId: "weflow-tech",
  themeName: "简洁技术",
  customCSS: "",
};

// Keep the shared call signature so every creation entry uses the same policy.
export function resolveNewArticleThemeSnapshot(
  _themeState?: ThemeStateLike,
  _themes?: ThemeOptionLike[],
): NewArticleThemeSnapshot {
  return { ...DEFAULT_NEW_ARTICLE_THEME };
}
