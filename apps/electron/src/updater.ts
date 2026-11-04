import type { BrowserWindow } from "electron";

export interface UpdateInfo {
  latestVersion: string;
  currentVersion: string;
  releaseUrl: string;
  releaseNotes: string;
}

/** P0 停用更新；保留函数签名供旧调用方使用，不请求任何发布服务。 */
export async function checkForUpdates(
  _mainWindow: BrowserWindow | null,
  _force: boolean = false,
): Promise<void> {}

/** 保留 update:openReleases IPC 兼容性，不打开上游下载页面。 */
export function openReleasesPage(): void {}
