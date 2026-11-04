// Run from repository root. Requires Playwright with Chrome installed.
const fs = require("fs");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage();
  async function raster(source, target, size, pad = 0, bg = null) {
    const svg = fs.readFileSync(source, "utf8");
    const data = await page.evaluate(
      async ({ svg, size, pad, bg }) => {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (bg) {
          ctx.fillStyle = bg;
          ctx.fillRect(0, 0, size, size);
        }
        const img = new Image();
        img.src =
          "data:image/svg+xml;base64," +
          btoa(unescape(encodeURIComponent(svg)));
        await img.decode();
        ctx.drawImage(img, pad, pad, size - 2 * pad, size - 2 * pad);
        return canvas.toDataURL("image/png").split(",")[1];
      },
      { svg, size, pad, bg },
    );
    fs.writeFileSync(target, Buffer.from(data, "base64"));
  }
  await raster(
    "apps/web/public/favicon-dark.svg",
    "apps/web/public/favicon-dark.png",
    64,
  );
  for (const size of [16, 32, 192, 512])
    await raster(
      "apps/web/public/favicon-dark.svg",
      `apps/web/public/pwa/icon-${size}.png`,
      size,
      size * 0.12,
      "#ffffff",
    );
  await raster(
    "apps/web/public/favicon-dark.svg",
    "apps/web/public/pwa/icon-maskable-512.png",
    512,
    100,
    "#ffffff",
  );
  await raster(
    "apps/web/public/favicon-dark.svg",
    "apps/electron/assets/icon.png",
    1024,
    120,
    "#ffffff",
  );
  const imgData = await page.evaluate(
    async (svg) => {
      const img = new Image();
      img.src =
        "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));
      await img.decode();
      const c = document.createElement("canvas");
      c.width = 960;
      c.height = 360;
      c.getContext("2d").drawImage(img, 0, 0);
      return c.toDataURL("image/png").split(",")[1];
    },
    fs.readFileSync("apps/web/public/images/writing-flow.svg", "utf8"),
  );
  fs.writeFileSync(
    "apps/web/public/images/writing-flow.png",
    Buffer.from(imgData, "base64"),
  );
  await browser.close();
})();
