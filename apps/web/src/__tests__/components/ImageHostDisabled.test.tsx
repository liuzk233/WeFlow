import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ImageHostSettings } from "../../components/Settings/ImageHostSettings";

describe("图床设置停用官方服务", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("fetch", vi.fn());
  });
  afterEach(() => {
    cleanup();
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it.each([
    null,
    "{broken",
    "null",
    "[]",
    '{"currentType":"unknown","configs":null}',
    '{"currentType":"official","configs":{}}',
  ])("旧配置 %s 显示已停用且没有启用入口", (saved) => {
    if (saved !== null) localStorage.setItem("imageHostConfigs", saved);
    render(<ImageHostSettings />);
    expect(
      screen.getByRole("heading", { name: "官方图床已停用" }),
    ).toBeTruthy();
    expect(screen.queryByRole("button", { name: "启用官方图床" })).toBeNull();
    expect(screen.queryByText("当前已启用官方图床")).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("其他图床仍可选择和编辑，保留已有配置", () => {
    localStorage.setItem(
      "imageHostConfigs",
      JSON.stringify({
        currentType: "aliyun",
        configs: { aliyun: { bucket: "saved-bucket" } },
      }),
    );
    render(<ImageHostSettings />);
    expect(screen.getByDisplayValue("saved-bucket")).toBeTruthy();
    for (const [tab, action] of [
      ["七牛云", "启用七牛云图床"],
      ["腾讯云 COS", "启用腾讯云 COS"],
      ["S3 兼容", "启用 S3 图床"],
    ]) {
      fireEvent.click(screen.getByRole("button", { name: tab }));
      expect(screen.getByRole("button", { name: action })).toBeTruthy();
    }
    fireEvent.click(screen.getByRole("button", { name: /官方图床/ }));
    expect(
      screen.getByRole("heading", { name: "官方图床已停用" }),
    ).toBeTruthy();
    expect(
      JSON.parse(localStorage.getItem("imageHostConfig") || "{}").type,
    ).toBe("aliyun");
    expect(fetch).not.toHaveBeenCalled();
  });
});
