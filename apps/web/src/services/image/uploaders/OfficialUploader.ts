import type { ImageUploader } from "../ImageUploader";

export const OFFICIAL_HOST_DISABLED_MESSAGE =
  "官方图床已停用，请在图床设置中配置并启用其他图床";

/** 保留旧配置兼容性；任何入口都不再访问官方服务。 */
export class OfficialUploader implements ImageUploader {
  name = "官方图床（已停用）";

  constructor(_config?: { serverUrl?: string }) {}

  async upload(_file: File): Promise<string> {
    throw new Error(OFFICIAL_HOST_DISABLED_MESSAGE);
  }

  async validate(): Promise<boolean> {
    return false;
  }
}
