<p align="center"><img src="apps/web/public/favicon-dark.svg" width="72" height="72" alt="WeFlow" /></p>

# WeFlow

个人使用的本地优先技术图文写作工具，基于 WeMD 独立维护。使用 Markdown 编写文章，预览后复制到微信公众号。

- 支持代码高亮、Mermaid、数学公式、表格及图片。
- 新文章默认使用「简洁技术」主题，也可手动切换已有主题。
- 文章保存在浏览器或所选本地文件夹；保留 Markdown 文件保存、语义 HTML 复制与 PNG 长图输出。
- 本阶段仅调整品牌与写作体验，AI 和 OSS 接入留到后续阶段。

## 本地运行

需要 Node.js 22 和 pnpm 9。

```sh
pnpm install --frozen-lockfile
pnpm dev:web
```

打开 http://localhost:5173 。支持安装为 PWA。生产构建运行 `pnpm --filter @wemd/web build`，桌面开发运行 `pnpm dev:desktop`。

## Docker

```sh
docker compose up -d --build
```

默认构建当前源码为 `weflow-web:local`，访问 http://localhost:8080 。本地文件夹模式需要 localhost 或 HTTPS，以及支持 File System Access 的 Chrome / Edge。

## 文档与反馈

- [写作与保存](docs/writing.md)
- [开发指南](CONTRIBUTING.md)
- [P0 基线](docs/p0-baseline.md)
- [P1 验收记录](docs/p1-verification.md)
- [个人仓库](https://github.com/liuzk233/WeFlow) · [问题反馈](https://github.com/liuzk233/WeFlow/issues)

## 版权与致谢

基于 WeMD，保留原始 Git 历史和 [MIT 版权声明](LICENSE) © WeMD Team。公众号深色预览参考 [wechatjs/mp-darkmode](https://github.com/wechatjs/mp-darkmode)。第三方依赖遵循各自许可证。
