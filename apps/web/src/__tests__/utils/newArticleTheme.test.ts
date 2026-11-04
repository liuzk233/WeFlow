import { describe, expect, it } from "vitest";
import {
  DEFAULT_NEW_ARTICLE_THEME,
  resolveNewArticleThemeSnapshot,
} from "../../utils/newArticleTheme";
describe("new article theme policy", () => {
  it.each(["default", "custom-green", "deleted-theme"])(
    "ignores previous %s theme and CSS",
    (themeId) => {
      const result = resolveNewArticleThemeSnapshot(
        { themeId, customCSS: "body{color:red}" },
        [{ id: themeId, name: "旧主题" }],
      );
      expect(result).toEqual({
        themeId: "weflow-tech",
        themeName: "简洁技术",
        customCSS: "",
      });
      expect(result).not.toBe(DEFAULT_NEW_ARTICLE_THEME);
    },
  );
});
