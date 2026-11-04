import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ImageHostManager,
  type ImageHostConfig,
} from "../../services/image/ImageUploader";
import {
  getStoredImageHostConfig,
  uploadEditorImage,
} from "../../services/image/imageUploadFlow";
import { OfficialUploader } from "../../services/image/uploaders/OfficialUploader";

describe("官方图床停用", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("禁止外部请求")),
    );
  });
  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it.each([
    null,
    "",
    "{broken",
    "null",
    "[]",
    "{}",
    '"official"',
    '{"type":"unknown"}',
    '{"type":"official"}',
    '{"type":"official","config":{"serverUrl":"https://legacy.example.com"}}',
  ])("无配置或旧配置 %s 不请求官方服务", async (saved) => {
    if (saved !== null) localStorage.setItem("imageHostConfig", saved);
    const file = new File(["image"], "test.png", { type: "image/png" });
    await expect(uploadEditorImage(file)).rejects.toThrow("官方图床已停用");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("管理器的异常配置回退及直接使用旧上传器同样停用", async () => {
    const file = new File(["image"], "test.png", { type: "image/png" });
    for (const config of [null, undefined, {}, { type: "unknown" }]) {
      const manager = new ImageHostManager(config as ImageHostConfig);
      await expect(manager.upload(file)).rejects.toThrow("官方图床已停用");
      await expect(manager.validate()).resolves.toBe(false);
    }
    const uploader = new OfficialUploader({
      serverUrl: "https://legacy.example.com",
    });
    await expect(uploader.upload(file)).rejects.toThrow("官方图床已停用");
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each(["qiniu", "aliyun", "tencent", "s3"])("保留 %s 的配置", (type) => {
    const config = { type, config: { bucket: "existing-bucket" } };
    localStorage.setItem("imageHostConfig", JSON.stringify(config));
    expect(getStoredImageHostConfig()).toEqual(config);
    expect(fetch).not.toHaveBeenCalled();
  });
});
