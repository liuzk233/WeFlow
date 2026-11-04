import test from "node:test";
import assert from "node:assert/strict";
import { checkForUpdates, openReleasesPage } from "../updater";

test("自动、手动更新和旧下载入口均不请求发布服务", async () => {
  const originalFetch = globalThis.fetch;
  let requests = 0;
  globalThis.fetch = async () => {
    requests++;
    throw new Error("更新服务不应被调用");
  };
  try {
    await checkForUpdates(null);
    await checkForUpdates(null, true);
    openReleasesPage();
    assert.equal(requests, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
